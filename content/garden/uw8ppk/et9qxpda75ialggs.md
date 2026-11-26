---
title: FlexiRAG Engine
date: '2026-06-15'
summary: >-
  项目地址：多租户可配置AI知识库作者：yllmis介绍基于go和agent结合的知识库，可以自行选择工具连接，通过配置的AI检索，快速查询所需要获得的信息项目设计接口耦合定义核心接口：LLMProvider接口，VectorScore接口go后端的灵魂：在I/O操作中，将
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/et9qxpda75ialggs'
---
项目地址：[多租户可配置AI知识库](https://yllmis.github)

作者：yllmis

# 介绍
基于go和agent结合的知识库，可以自行选择工具连接，通过配置的AI检索，快速查询所需要获得的信息

# 项目设计
### 接口耦合
定义核心接口：`LLMProvider`接口，`VectorScore`接口

> go后端的灵魂：在I/O操作中，将`ctx context.Context`作为第一个参数，在用户请求后无反应时利用ctx及时取消后台调用，减少无用消耗或者协程泄露
>

### 并发设计
采用读写锁，该项目中由于读多写少，大部分时间是获取知识库知识，不会频繁更新，所以为了性能采取读写锁

### 文本切片
```go
type Splitter struct {
    ChunkSize int
    Overlap   int
    Separator string // '\n' by default
}
```

```go
func (s *Splitter) Split(text string) []string {
    var chunks []string
    start := 0
    textLength := len(text)

    for start < textLength {
        end := start + s.ChunkSize
        if end > textLength {
            end = textLength
        }

        chunk := text[start:end]
        chunks = append(chunks, chunk)

        start += s.ChunkSize - s.Overlap //含义是下一块起点不是直接跳 ChunkSize，而是往回留 Overlap 个字符
    }

    return chunks
}
```

`start += s.ChunkSize - s.Overlap`

**含义是下一块起点不是直接跳**`**ChunkSize**`**，而是往回留**`**Overlap**`**个字符**

+ 防止一句话刚好被切在边界，导致上下文断裂
+ 提高向量检索时命中完整语义的概率
+ RAG 回答更稳定，减少“只命中半句”问题

## 向量库
### 相似度计算
$ \text{Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}} $

越靠近1，越相似

### `mock.go`亮点
```go
h[0] = candidate // 直接暴力替换掉堆顶（最差的那个）
heap.Fix(&h, 0)  // 只让它自己去寻找合适的位置
```

```go
func (h resultMinHeap) Less(i, j int) bool {
    if h[i].Score == h[j].Score {
        return h[i].ID > h[j].ID // 神来之笔
    }
    return h[i].Score < h[j].Score
}
```

**含金量：** 在最小堆里，`Less` 返回 `true` 的元素会浮到堆顶，意味着它“最容易被淘汰”。当两个句子相似度一模一样时，它选择让 **ID 字典序更大的优先被淘汰**。这保证了即使用了并发或哈希遍历，只要输入一样，Top-K 返回的顺序**永远稳定可复现**。这在自动化测试里是保命的设计。

```go
results := make([]core.SearchResult, h.Len())
for i := len(results) - 1; i >= 0; i-- {
    results[i] = heap.Pop(&h).(core.SearchResult)
}
```

### top-k算法
1. 初始化一个小顶堆，其堆顶元素最小。
2. 先将数组的前 k 个元素依次入堆。
3. 从第 k+1 个元素开始，若当前元素大于堆顶元素，则将堆顶元素出堆，并将当前元素入堆。
4. 遍历完成后，堆中保存的就是最大的 k 个元素

利用 top-k 筛选出的结果二次排序，同分时按 ID 升序

### 微服务架构设计
`chunk_service.go`

+ **I/O 批处理优化：** “在 `IngestText` 时，我绝对没有在 `for` 循环里去调 `LLMProvider.Embed`。切片哪怕有 100 个，我也是作为一个 `[]string` 一次性发给大模型的。这不仅把网络开销降到了最低，还能有效避免触发大模型厂商的 API 频率限流（Rate Limit）。”
+ **防御性状态校验：** “在拿到大模型返回的向量后，我加了一行看似多余的校验 `if len(vectors) != len(chunks)`。因为在微服务调用中，第三方 API 是不可信的，万一它吞了数据导致索引错位，存进数据库就是脏数据。我在组装入库前提前拦截了这个风险。”

### 向量数据写入 PostgreSQL
```go
// 对应 SQL: INSERT ... ON CONFLICT (id) DO UPDATE SET ...
	return p.db.WithContext(ctx).
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{"agent_id", "content", "embedding"}),
		}).
		Create(&chunk).Error
```

# 优化方案
## FlexiRAG 多 Agent 审核与检索编排学习路线
## 1. 学习目标
目标不是在半个月内把所有 RAG 和 Agent 技术都学完，而是：

+ 理解当前项目的 RAG 主链路
+ 学会在现有 Go 项目里插入多 Agent 审核与检索编排能力
+ 做出一条完整、可运行、可测试、可写进简历的 Agent-RAG 主线
+ 能在面试里讲清楚“为什么这样设计、解决了什么问题、效果如何”

---

## 2. 这一阶段最该学什么
### 2.1 必学核心知识
+ RAG 基础链路
    - Query -> Retrieval -> Context -> Generation
+ Query Rewrite ✅
    - 为什么不能直接用原始用户问题做检索
+ Hybrid Retrieval 
    - Dense Retrieval（向量检索）✅
    - Sparse Retrieval（关键词检索 / PostgreSQL FTS）
+ Fusion / Rerank
    - 为什么双路召回不能直接拼接
    - RRF 的基本思想
+ Agent 审核链路
    - 输入审核
    - 输出审核
    - 知识入库审核
+ Guardrails / Moderation
    - 什么情况拒绝
    - 什么情况降级
    - 什么情况允许通过但打标
+ 上下文压缩
    - 去噪
    - 提取重点句
    - 摘要融合
+ 基础评测思维
    - 命中是否更准
    - 回答是否更稳
    - 审核是否合理

### 2.2 当前阶段不用深钻的知识
+ 分布式高可用
+ 复杂权限系统
+ 大规模 ANN 调优
+ 复杂工作流引擎
+ 非 PostgreSQL 的额外搜索基础设施

---

## 3. 推荐学习顺序
### 第一阶段：先吃透你自己的项目（第 1-2 天）
要读懂这些文件：

+ `internal/core/ports.go`
+ `internal/engine/executor.go`
+ `internal/core/knowledge/chunk_service.go`
+ `internal/infrastructure/vector/pgvector.go`
+ `internal/api/v1/handler.go`

这一阶段必须搞清楚：

+ 用户问题从哪里进入系统
+ Query 在哪里做 embedding
+ 检索在哪里做
+ topK 在哪里控制
+ prompt 在哪里组装
+ 如果插入 Query Rewrite，应该放在哪一层
+ 如果插入审核 Agent，应该放在哪一层

输出要求：

+ 自己画一张当前请求流转图
+ 能口述当前单 Agent RAG 链路

---

### 第二阶段：学习 RAG 编排基础（第 3-4 天）
重点概念：

+ Query Rewrite
+ Multi-query
+ Hybrid Retrieval
+ RRF
+ Context Compression

目标：

+ 搞清楚这些技术分别解决什么问题
+ 搞清楚它们插入在检索链路的哪个位置
+ 能判断哪些适合第一期落地

输出要求：

+ 画出目标链路图：
    - 输入审核 -> 查询改写 -> Dense/Sparse -> RRF -> 上下文压缩 -> 主回答 Agent -> 输出审核

---

### 第三阶段：学习审核 Agent 基础（第 5-6 天）
重点概念：

+ Guardrails
+ Moderation
+ Answer Verification
+ 风险分级
+ 拒答 / 降级 / 通过

目标：

+ 学会设计审核结果结构
+ 明确哪些输入应该拦截
+ 明确哪些输出应该警告或改写

输出要求：

+ 自己先写一个审核结果结构草案，例如：
    - `passed`
    - `risk_level`
    - `reason`
    - `action`

---

### 第四阶段：边学边实现第一条主线（第 7-10 天）
推荐实现顺序：

1. Query Rewrite
2. PostgreSQL FTS
3. Dense + Sparse 双路检索
4. RRF 融合
5. 输入审核 Agent

目标：

+ 先把“查询理解 + 双路召回 + 融合”跑通
+ 再加输入审核

输出要求：

+ 至少跑通一条问答链路
+ 至少准备 3-5 个对比样例

---

### 第五阶段：补可解释性与测试（第 11-12 天）
重点补齐：

+ `citations`
+ `review_result`
+ `retrieval_strategy`
+ 单元测试
+ 关键路径说明文档

目标：

+ 让结果不只是“返回答案”
+ 还要能解释“为什么是这个答案”

---

### 第六阶段：补文档与简历包装（第 13-15 天）
重点：

+ README 补说明
+ 进度文档补沉淀
+ 架构图
+ 简历项目描述
+ 面试话术

目标：

+ 从“能跑”升级成“能讲”
+ 从“做了功能”升级成“讲得出设计取舍”

---

## 4. 半个月内最可行的落地目标
如果你只有半个月，最推荐做这 5 个点：

1. 输入审核 Agent
2. Query Rewrite
3. PostgreSQL FTS
4. Dense + Sparse Hybrid Retrieval
5. RRF 融合 + 引用返回

这是当前阶段性价比最高的组合。

原因：

+ Agent 味道足够强
+ 检索增强也能体现出来
+ 跟你当前项目架构最匹配
+ 半个月内最容易做成完整成果

---

## 5. 推荐学习资料
## 5.1 RAG 总体架构
+ Microsoft Learn: Build advanced retrieval-augmented generation systems  
[Build Advanced Retrieval-Augmented Generation Systems](https://learn.microsoft.com/en-in/azure/developer/ai/advanced-retrieval-augmented-generation)

建议重点看：

+ 查询预处理
+ 检索增强
+ 后处理
+ 评估思路

---

## 5.2 向量检索
+ pgvector 官方 README  
[https://github.com/pgvector/pgvector](https://github.com/pgvector/pgvector)

建议重点看：

+ 距离度量
+ 基本查询方式
+ 索引方式
+ PostgreSQL 中的使用姿势

---

## 5.3 PostgreSQL 全文检索
+ PostgreSQL Full Text Search 官方文档  
[Chapter 12. Full Text Search](https://www.postgresql.org/docs/current/textsearch.html)

建议重点看：

+ `tsvector`
+ `tsquery`
+ 排序
+ 字典和同义词能力

---

## 5.4 HyDE
+ HyDE 论文  
[https://arxiv.org/abs/2212.10496](https://arxiv.org/abs/2212.10496)

当前阶段建议：

+ 先理解思想
+ 不必第一期马上实现默认主路径

---

## 5.5 RRF
+ Reciprocal Rank Fusion 论文入口  
[https://research.google/pubs/reciprocal-rank-fusion-outperforms-condorcet-and-individual-rank-learning-methods/](https://research.google/pubs/reciprocal-rank-fusion-outperforms-condorcet-and-individual-rank-learning-methods/)

当前阶段建议：

+ 理解为什么多路检索结果需要融合
+ 理解它和“简单拼接”有什么区别

---

## 5.6 Guardrails / Moderation / Evals
+ OpenAI Cookbook: Guardrails  
[https://cookbook.openai.com/examples/how_to_use_guardrails/](https://cookbook.openai.com/examples/how_to_use_guardrails/)
+ OpenAI Cookbook: Moderation  
[https://cookbook.openai.com/examples/how_to_use_moderation](https://cookbook.openai.com/examples/how_to_use_moderation)
+ OpenAI Cookbook: Evals  
[https://cookbook.openai.com/examples/evaluation/getting_started_with_openai_evals](https://cookbook.openai.com/examples/evaluation/getting_started_with_openai_evals)

建议重点看：

+ 审核策略设计
+ 风险分级
+ 基础评估思维

---

## 5.7 多阶段 Agent / 工具编排
+ OpenAI Cookbook: Multi-Tool Orchestration with RAG  
[https://developers.openai.com/cookbook/examples/responses_api/responses_api_tool_orchestration](https://developers.openai.com/cookbook/examples/responses_api/responses_api_tool_orchestration)

建议重点看：

+ 多阶段流程如何组织
+ 查询理解、检索、回答、审核如何拆职责

---

## 6. 学习方法建议
不要用“先学完再做”的方式。

建议采用：

+ 看一点
+ 改一点
+ 测一点
+ 记一点

也就是：

1. 先学概念
2. 立刻映射到当前项目文件
3. 写最小可运行版本
4. 用测试和样例验证
5. 把结论写进文档

这样学得最快，也最容易形成成果。

---

## 7. 判断自己有没有学到位
你至少要能回答这些问题：

+ 为什么 Query Rewrite 能提升检索效果
+ 为什么只做向量检索不够
+ 为什么要加 PostgreSQL FTS
+ 为什么 Dense 和 Sparse 结果不能直接拼接
+ 为什么要有输入审核 Agent
+ 为什么多人场景要启用审核，个人私有化可以关闭
+ 为什么要返回 citations 而不是只返回 answer
+ 为什么你的项目更像 Agent-RAG 系统，而不是普通 RAG Demo

如果这些问题你都能讲顺，说明你已经达到当前阶段的学习目标了。

---

## 8. 当前阶段最重要的原则
+ 不追求把所有技术点一次性做完
+ 优先做一条完整主线
+ 优先做能写进简历、能在面试里讲清楚的能力
+ 优先做和当前项目技术栈契合的内容
+ 优先做能通过测试和样例验证的方案

最终目标不是“学了很多概念”，而是：

+ 你真的把项目做强了一层
+ 你真的能讲出设计与取舍
+ 你真的能把它写进简历并撑住面试

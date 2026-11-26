---
title: FlexiRAG Engine
date: '2026-06-21'
summary: >-
  项目地址：多租户可配置AI知识库作者：yllmis介绍基于go和agent结合的知识库，可以自行选择工具连接，通过配置的AI检索，快速查询所需要获得的信息架构图总体架构应用架构
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/gsbydf29mv7rg8ri'
---
项目地址：[多租户可配置AI知识库](https://yllmis.github)

作者：yllmis

# 介绍
基于go和agent结合的知识库，可以自行选择工具连接，通过配置的AI检索，快速查询所需要获得的信息

# 架构图
## 总体架构
![](/images/yuque/a297c1a7aabb8803.svg)

![](/images/yuque/76ad4c548394c5ab.svg)

## 应用架构
![](/images/yuque/4f88bd458c66a553.svg)

# 项目设计
### 接口耦合
定义核心接口：`LLMProvider`接口，`VectorScore`接口

> go后端的灵魂：在I/O操作中，将`ctx context.Context`作为第一个参数，在用户请求后无反应时利用ctx及时取消后台调用，减少无用消耗或者协程泄露
>

### 并发设计
采用读写锁，该项目中由于读多写少，大部分时间是获取知识库知识，不会频繁更新，所以为了性能采取读写锁

#### 限流
采用令牌桶算法进行限流

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

# 问题
## 面试加分项
### 向量查询
```go
    vectors, err := e.llm.Embed(ctx, []string{query})
    if err != nil {
        return "", fmt.Errorf("生成向量失败: %w", err)
    }
    if len(vectors) == 0 || len(vectors[0]) == 0 {
        return "", fmt.Errorf("生成向量失败: 返回空向量")
    }

    searchResults, err := e.vector.Search(ctx, agent.ID, vectors[0], 3)
    if err != nil {
        return "", fmt.Errorf("向量搜索失败: %w", err)
    }
```

“在早期设计时，我发现批量导入知识库时，由于高频发起单条 Embedding API 请求，导致了严重的网络 I/O 阻塞和 API 限流报错。 

后来我在架构层面重新设计了底层的 `LLMProvider` 接口，强约束使用 `[]string` 到 

`[][]float32` 的批处理（Batching）模式。

 在上传文件或爬虫入库时，我通过切片分块（比如每 100 条文本打成一个 Batch）进行一次性请求。这不仅把大模型 API 的调用次数降低了两个数量级，还将整体入库的吞吐量提升了 10 倍以上。”  

### 文本切割
```go
package textsplit

import "strings"

type Splitter struct {
	ChunkSize int
	Overlap   int
	Separator string // 目前先留作扩展（比如按段落切分），本版按固定长度切
}

// NewTextSplitter 工厂方法（加入防御性校验）
func NewTextSplitter(chunkSize int, overlap int, separator string) *Splitter {
	// 防御性编程：重叠部分不能大于等于切片总大小，否则会导致死循环
	if overlap >= chunkSize {
		overlap = chunkSize - 1 // 强制修正，或者你也可以选择 return error
	}
	if chunkSize <= 0 {
		chunkSize = 500 // 兜底默认值
	}

	return &Splitter{
		ChunkSize: chunkSize,
		Overlap:   overlap,
		Separator: separator,
	}
}

// Split 执行安全的滑动窗口切片（完美支持中英文混排）
func (s *Splitter) Split(text string) []string {
	if text == "" {
		return nil
	}

	// 1. 将底层字节串转为 Unicode 字符切片，彻底解决中文乱码问题
	runes := []rune(text)
	textLength := len(runes)
	
	var chunks []string
	start := 0

	// 2. 滑动窗口切割
	for start < textLength {
		end := start + s.ChunkSize
		if end > textLength {
			end = textLength
		}

		// 提取 rune 切片并转回 string
		chunk := string(runes[start:end])
		// 去除首尾可能多余的空白符
		chunk = strings.TrimSpace(chunk) 
		
		if chunk != "" {
			chunks = append(chunks, chunk)
		}

		// 步进：移动到下一个窗口
		start += s.ChunkSize - s.Overlap
	}

	return chunks
}
```

“在实现 RAG 的文本切分组件时，我注意到原生的字符串切片操作在处理中日韩多字节字符（CJK）时会产生 UTF-8 截断导致乱码。因此，我在切分层强制引入了 `[]rune` 转换。同时，为了防止非法配置导致的 Goroutine 死循环，我在工厂方法里拦截了 `Overlap >= ChunkSize` 的危险边界条件。这保证了底层‘刀具’的绝对纯粹和稳定。”

## MVP版本
`mock.go`

当前问题：存于`map[string]vectorItem`,key只要有`id`相同就会出现数据隔离失败

真实唯一键应是 `(agentID, id)`，而不只是 `id`。否则不同租户用了同一个 `id` 就会冲突。

## 数据库选择
### 面试官视角：如何优雅地回答选型问题？
如果在面试中，面试官问：“你的向量知识库为什么选了 PostgreSQL 而不是 MongoDB 或专用的 Milvus？”

**你的完美答卷：**

“在项目初期进行技术选型时，我综合评估了业务属性。我们的多租户 RAG 系统存在大量的 Metadata 过滤需求（比如强隔离的 `AgentID`）。

PostgreSQL 配合 `pgvector` 插件不仅能提供极高的 HNSW 向量检索性能，还能完美利用其原生 B-Tree 索引处理关系型数据的过滤（Hybrid Search）。

此外，使用 PG 可以让我们将业务关系数据和高维向量数据收拢在同一个持久化底座中，避免了引入独立向量数据库（如 Milvus）带来的分布式事务难题和运维成本。对于目前的系统规模，这是性价比最高、架构最整洁的选择。”

#

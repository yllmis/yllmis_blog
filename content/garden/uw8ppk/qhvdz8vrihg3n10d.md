---
title: IM服务排障agent
date: '2026-09-22'
summary: >-
  上下文管理为什么服务端保存完整状态，但模型只看到精简上下文防止上下文过长上下文越长：请求成本越高；速度越慢；
  越容易超过模型限制。减少模型被无关信息干扰如果把几十次工具调用全部发给模型，模型可能无法判断当前真正重要的信息。降低敏感数据泄露风险
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/qhvdz8vrihg3n10d'
---
## 上下文管理

> [!COLLAPSE] 为什么服务端保存完整状态，但模型只看到精简上下文
>
> 防止上下文过长
>
> 上下文越长：
>
> - 请求成本越高；
> - 速度越慢；
> - 越容易超过模型限制。
>
> **减少模型被无关信息干扰**
>
> 如果把几十次工具调用全部发给模型，模型可能无法判断当前真正重要的信息。
>
> **降低敏感数据泄露风险**
>
> 完整日志和完整消息正文可能包含：
>
> - 手机号；
> - Token；
> - 内部 IP；
> - 数据库字段；
> - 用户隐私。
>
> **防止模型重新解释原始数据**
>
> 模型应该处理结构化摘要，而不是重新分析一大堆未经整理的原始日志。

```plain
Conversation State
= 当前客服诊断流程进展

Working Memory
= 当前诊断任务的结构化工作数据

Persistent Records
= 为审计保存的执行记录

Long-term Memory
= 跨任务长期记忆，第一版不实现
```

流程

客服输入

  → candidateContext

  → Tool

  → confirmedFacts / evidence

  → diagnose()

  → DiagnosisResult

  → 精简后的模型上下文

  → 下一步工具或客服回复  
  
AgentSessionState存的是当前会话状态，需要在一定轮次对话后记住当前排查什么问题：

+ 客服提供了哪些待确认线索
+ 工具已经确认了哪些事实
+ 还缺什么信息
+ 调用过哪些工具
+ 当前正在等待客服回答什么
+ 是否正在等待人工确认

## buildModelContext 的选择规则
可以使用一张固定表：

| 字段 | 提取信息 | 选择工具 | 生成回复 | 生成草稿 |
| --- | --- | --- | --- | --- |
| 当前客服输入 | 是 | 可选 | 可选 | 否 |
| `currentIssue` | 是 | 是 | 是 | 是 |
| `candidateContext` | 是 | 是 | 否 | 否 |
| `confirmedFacts`
 摘要 | 否 | 是 | 是 | 是 |
| `evidence`
 引用 | 否 | 摘要 | 是 | 是 |
| `missingInformation` | 否 | 是 | 是 | 是 |
| `calledTools`
 摘要 | 否 | 是 | 否 | 否 |
| `toolErrors`
 摘要 | 否 | 是 | 是 | 是 |
| `conflicts` | 否 | 是 | 是 | 是 |
| `diagnosisResult` | 否 | 可选 | 是 | 是 |
| `confirmationToken` | 否 | 否 | 否 | 否 |
| 完整 Trace | 否 | 否 | 否 | 否 |

### version_conflict
AgentStateStore 两个请求同时进行到达进行修改时

请求A、B读取`version = 1`  
请求A修改`messageId = msg_001`，保存时声明`expectedVersion = 1`

StateStore 检查：当前版本 1 == A 期望版本 1

stateStore更新`version + 1`，

```json
{
  "messageId": msg_001,
  "timeRange": null,
  "version": 1
}
```

请求B修改`timeRange = 10:00～10:10`

```json
{
  "messageId": null,
  "timeRange": 10:00～10:10,
  "version": 1
}
```

保存时声明`expectedVersion = 1`, StateStore 检查：当前版本 1 != A 期望版本 1。返回`version_conflict`

**B重新读取**

B 重新加载后得到：

```json
{
  version = 2
  messageId = msg_001
  timeRange = null
}
```

然后将自己的修改重新应用到最新状态：

```json
{
  version = 2
  messageId = msg_001
  timeRange = 10:00～10:10
}
```

再次保存：expectedVersion = 2

保存成功后：

```plain
version = 3
messageId = msg_001
timeRange = 10:00～10:10
```

  

`truncated`

回答的是：

结果有没有因为数量上限而被截断？

`complete`

回答的是：

Connector 是否完整查询了所要求的范围和数据源？

## 哪些预算是“发给模型的内容”
| 预算 | 是否属于模型输入 | 作用 |
| --- | --- | --- |
| 系统指令 | 是 | 告诉模型职责和边界 |
| 当前客服问题 | 是 | 本轮需要理解的用户输入 |
| 最近对话 | 是 | 保留追问与回答关系 |
| 已确认事实 | 是，但只发送摘要 | 支持工具选择和结果解释 |
| 工具摘要 | 是 | 告诉模型工具调用结果 |
| 历史摘要 | 是 | 代替全部历史原文 |
| 最大单条消息 | 间接控制输入 | 防止一条消息撑爆上下文 |
| 最大工具结果 | 间接控制输入 | 防止大日志进入上下文 |
| 模型输出预留 | 否 | 给模型回答、Tool Call 和推理留空间 |
| 最大 Agent 步数 | 否 | 限制循环次数 |
| 最大总 Token | 不只是输入 | 累计整个 Run 的输入和输出消耗 |
| 超时/Deadline | 否 | 限制运行时间 |

上下文窗口的占用

```plain
系统指令
+ Tool 定义和参数 Schema
+ 当前客服问题
+ 选中的最近对话
+ 已确认事实摘要
+ 工具调用结果摘要
+ 历史摘要
+ 模型之前的输出或工具调用记录
+ 为本轮生成预留的空间
```

压缩对话是业务内容，需要根据我们自己的需求进行压缩。而不是与通用Agent一样，**自然语言压缩全部历史**

不依赖模型的压缩，而是遵循我们自己的业务规则

模型预算不能裁剪诊断引擎的输入

推荐压缩顺序：

```plain
1. 删除重复 Tool Call 摘要
  + confirmedFacts：
    消息存在，来自第一次成功查询
  + calledTools：
    最近一次调用超时
  + toolErrors：
    timeout，可重试
2. 合并同一工具、同一参数的历史调用
3. 删除较早的对话原文
4. 用历史摘要代替旧对话
5. 删除与当前问题无关的工具摘要
6. 裁剪低优先级 confirmedFacts
7. 仍然超预算则停止
```

当前目标从 `msg-001` 切换成 `msg-002` 时：

```plain
归档 msg-001 的工作状态
    ↓
新建或重置 currentIssue
    ↓
不能把 msg-001 的 confirmedFacts 自动继承给 msg-002
```

# 上下文
## buildModelContext(state, purpose)
我没有把完整 Session State 直接传给模型，而是设计了一个基于 purpose 的 Context Builder。参数提取、工具选择和回复生成使用不同的字段投影。Connector 结果先经过 Tool 校验和 State Merge，再由确定性诊断引擎计算；最终回复模型只能读取 DiagnosisResult 的安全投影，不能修改分类。Context Builder 同时负责当前 messageId 过滤、敏感字段移除和上下文预算控制。 

## 实现上下文预算
分别定义预算：

+ 系统指令
+ 当前客服问题
+ 最近对话
+ 已确认事实
+ 工具摘要
+ 历史摘要
+ 模型输出预留

设置：

+ 最大输入长度
+ 最大单条消息长度
+ 最大工具结果长度
+ 最大 Agent 步数
+ 最大总 Token
+ 超出预算后的压缩或停止策略

## Star法则总结
### S — Situation：原来的问题
原 Agent Loop 已经能提取参数、调用工具和确定性诊断，但多轮运行存在几个风险：

+ 会话越长，发送给模型的内容可能不断增长。
+ 工具结果可能重复进入上下文。
+ 多个消息的事实可能混在一起。
+ 模型调用次数和 Token 消耗缺少统一上限。
+ 从 `msg_001` 切换到 `msg_002` 时，可能污染已经确认的事实。

### T — Task：本阶段目标
让 Agent 能保存多轮诊断所需状态，同时保证：

+ 不保存无限聊天记录。
+ 不把全部状态发送给模型。
+ 不混用不同消息的 Confirmed Facts。
+ 超过上下文或 Token 预算时能够受控停止。
+ 切换诊断对象必须经过客服确认。
+ 上下文裁剪不能影响确定性诊断。

### A — Action：具体实现
1. 建立统一上下文预算

在 [context-budget.ts (line 4)](/Users/yllmis/go_projects/IM_Inspect/src/agent/context-budget.ts:4) 中定义了：

+ 最大输入字符数。
+ 系统指令预算。
+ 工具定义预留。
+ 当前问题、最近对话、确认事实、工具摘要、历史摘要预算。
+ 最大单条消息和工具结果长度。
+ 最大 Agent 步数。
+ 最大总 Token 和输出 Token。

采用了我们确定的“字符预算 + 安全余量”方案。

2. 实现有界会话记忆

[conversation-memory.ts (line 8)](/Users/yllmis/go_projects/IM_Inspect/src/agent/conversation-memory.ts:8) 现在只保存：

+ 最近最多 6 条对话记录。
+ 超出预算后形成的当前诊断问题历史摘要。

客服说“消息已经成功投递”只会进入对话上下文，不会变成 `confirmedFacts`。

3. 根据 Agent 阶段组装不同上下文

[model-context.ts (line 171)](/Users/yllmis/go_projects/IM_Inspect/src/agent/model-context.ts:171) 会根据 `purpose` 决定给模型什么：

+ `extract_context`：当前问题、最近对话、候选参数。
+ `select_tool`：相关确认事实、能力声明、工具摘要。
+ `generate_response`：确定性诊断结果和必要事实。
+ `generate_draft`：诊断结果和草稿需要的字段。

模型不再收到完整 `AgentSessionState`。

4. 只发送当前诊断对象相关事实

[model-context.ts (line 336)](/Users/yllmis/go_projects/IM_Inspect/src/agent/model-context.ts:336) 会根据当前 `messageId` 过滤：

+ Message Fact。
+ Delivery Facts。
+ Connection Fact。

其他消息的事实不会传给模型，也不会被错误关联到当前消息。

需要强调：这里只裁剪“模型看到的副本”，StateStore 中的事实和诊断引擎输入不会被裁剪。

5. 显式标记上下文不完整

模型上下文现在包含：

```plain
modelContextStatus: {
  contextIncomplete: boolean;
  criticalInformationOmitted: boolean;
  omittedSections: string[];
  omitted: Record<string, number>;
  usedCharacters: number;
  maxCharacters: number;
}
```

模型能够知道哪些内容被压缩，不能把“没收到某项上下文”理解成“该数据不存在”。

6. 控制 Agent Loop

[agent.ts (line 351)](/Users/yllmis/go_projects/IM_Inspect/src/agent/agent.ts:351) 现在实现：

+ 每次模型调用前检查字符预算。
+ 记录模型实际 Token 使用量。
+ 服务商不返回 Token 时使用保守估算。
+ 为下一次模型输出预留 Token。
+ 达到预算后以 `max_tokens` 受控停止。
+ 调用方即使传入 `maxSteps=99`，也不能突破系统的 `maxAgentSteps`。
+ 回复模型调用失败时，仍可使用确定性回复模板兜底。
7. 诊断对象受控切换

当从 `msg_001` 切换到 `msg_002` 时：

```plain
发现候选 ID 不同
→ 创建 pendingTargetSwitch
→ 询问客服是否确认
→ 校验 decisionId、version 和过期时间
→ 归档旧 currentIssue
→ 创建新的 currentIssue
→ 清空旧问题的工作记忆
→ 重新调用工具核实新消息
```

以后再次查询 `msg_001`，会再次触发切换确认，并通过 `reopenedFromIssueId` 关联历史问题，但不会直接恢复旧事实；仍然重新查询工具，避免使用过期状态。

### R — Result：Agent 得到的提升
现在 Agent 从“能运行的工具循环”提升成了“有边界的多轮诊断 Agent”：

+ 上下文不会随着对话无限增长。
+ Token 和调用步数有硬性代码约束。
+ 不同消息的事实不会互相污染。
+ 被裁剪的信息会明确标记，不会伪造成空结果。
+ 客服输入仍然只是候选信息，不能成为确认事实。
+ 诊断引擎继续使用完整状态，不受模型上下文裁剪影响。
+ 诊断对象切换经过版本绑定和人工确认。
+ Token 不足时保存状态并受控停止，不会继续烧调用量。

## 实现长会话压缩
必须保留：

+ 当前问题
+ `messageId`
+ 已确认事实
+ 关键证据及来源
+ 已调用工具
+ 工具错误
+ 未解决问题
+ 已排除假设
+ 人工确认状态
+ 安全策略结果

不得把压缩摘要当成新的诊断证据。

| 能力 | 普通对话型 Agent | 当前诊断 Agent |
| --- | --- | --- |
| 长对话处理 | 通常裁剪或摘要历史消息 | 对话摘要与权威状态分离 |
| 摘要可靠性 | 主要依赖模型 | 摘要不具备证据资格 |
| 事实来源 | 可能混合用户输入、模型判断和工具结果 | 事实只能来自受控工具 |
| 诊断分类 | 经常由模型判断 | 由确定性诊断引擎判断 |
| 数据关联 | 依赖提示词维持 | 代码校验 `messageId` |
| 关键数据放不下 | 可能继续摘要 | 应显式标记或停止 |
| 人工确认 | 常由对话语义推断 | 由结构化状态和代码校验 |
| 审计 | 可能只有聊天记录 | 工具、证据、错误分别记录 |

## 我们的 Agent 到底有什么不同？
假设工具查询失败了：

```json
toolErrors: [
  {
    tool: "get_message_status",
    code: "timeout"
  }
]

confirmedFacts: {
  message: null
}
```

客服对话可能被压缩为：

```plain
客服怀疑 msg_001 不存在，消息状态查询曾经超时。
```

下一轮我们不能把这句话还原成：

```plain
exists: false
```

正确流程是：

```plain
加载 state_json
    ↓
看到 confirmedFacts.message = null
    ↓
看到 ToolError(timeout)
    ↓
诊断引擎判断证据不足
    ↓
需要时重新调用 get_message_status
```

但如果工具成功完成了完整查询并明确返回没有记录：

```json
confirmedFacts: {
  message: {
    messageId: "msg_001",
    exists: false,
    persisted: null
  }
}

evidence: [
  {
    source: "go-im-query-service",
    field: "message_record",
    observedAt: "...",
    value: "not_found"
  }
]
```

下一轮可以从 StateStore 读取并复用，因为这是有来源的结构化事实。

| 情况 | `confirmedFacts.message` | 错误 | 结论 |
| --- | --- | --- | --- |
| 尚未查询 | `null` | 无 | 尚未判断 |
| 查询超时 | `null` | `timeout` | 无法判断 |
| 查询成功无记录 | `exists:false` | 无 | 消息不存在 |
| 查询成功有记录 | `exists:true` | 无 | 消息存在 |

# 状态、工作记忆、持久化记录和 RAG 的区别
**Conversation State**  
表示客服当前聊到哪里，例如：

+ 最近几轮对话
+ 待回答的问题
+ 当前诊断对象
+ 是否正在等待客服确认  
它负责保持对话连续性，可以被裁剪或摘要。

**Working Memory**  
表示本次诊断继续工作所必需的结构化状态：

+ candidateContext
+ confirmedFacts
+ toolErrors
+ missingInformation
+ calledTools
+ confirmationState
+ diagnosisResult  
它不能完全压缩成自然语言，否则会丢失 null、false、来源和关联关系。

**Persistent Records**  
表示 MySQL 中持久保存的数据，例如：

+ state_json 状态快照
+ Session Version
+ Tool Call 审计
+ Agent Run
+ 诊断结果
+ 人工确认记录  
它用于跨请求恢复、并发控制和审计。并不是所有持久化内容都会发送给模型。

**RAG  
**RAG 是从外部知识库检索资料，例如：

+ IM 故障处理手册
+ 历史事故文档
+ 产品说明
+ 常见错误码解释  
RAG 提供的是“参考知识”，不是当前消息的真实运行状态，也不能证明某条消息存在或投递成功。

| 能力 | 解决的问题 | 实现方式 |
| --- | --- | --- |
| 状态分层 | 对话、事实、审计和知识混在一起 | Conversation State、Working Memory、Persistent Records、RAG 分层 |
| 工具结果过滤 | 原始日志过大、含敏感信息或恶意指令 | Schema、白名单、脱敏、数量及字节限制 |
| 长会话压缩 | 每轮都发送全部历史，Token 无限增长 | 最近对话有界保存，旧对话生成有界摘要 |
| 关键证据保护 | 压缩时丢失诊断来源 | `keyEvidence` 独立投影，放不下就停止 |
| 日志隔离 | 日志中的 Prompt Injection 影响模型 | 日志属于不可信数据，不是系统指令或证据 |
| 安全停止 | 超出预算仍然继续调用模型 | 字符预算、Token 预算、最大步数和标准错误 |

# 实验
实验结果：

| 实验 | 结果 |
| --- | --- |
| 工具设计 | 细粒度工具平均 1.22 次调用，记录 215 个审计事件，危险操作拦截 41/41 |
| 证据约束 | 结构化契约通过 41/41，工具错误未被当作事实 41/41 |
| 工具结果过滤 | 原始 42,993 字符，摘要 38,734 字符；恶意指令从 2 条降为 0 条 |
| 确定性诊断 | 41 次错误模型分类均未覆盖 `diagnose()`
 结果 |
| 上下文管理 | 字符数减少 37.05%，`messageId`
 保留，摘要明确不可作为证据 |
| 写操作安全 | 权限拒绝、伪造 Token 拒绝、重复确认复用原草稿，重复草稿 0 |

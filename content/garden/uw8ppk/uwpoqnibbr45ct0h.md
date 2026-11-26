---
title: 开始前的准备
date: '2026-08-25'
summary: >-
  做这个项目，开发前最应该关注的不是 UI、框架或模型，而是：Agent
  到底要完成什么任务，怎样判断它完成得对不对。如果这两件事不清楚，后面很容易变成“先做一个聊天页面，再慢慢想它有什么用”。开发前的优先级1.
  先确定一个核心任务第一版不要做“客服处理所有 IM 问题”，只定义一
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/uwpoqnibbr45ct0h'
---
做这个项目，开发前最应该关注的不是 UI、框架或模型，而是：

**Agent 到底要完成什么任务，怎样判断它完成得对不对。**

如果这两件事不清楚，后面很容易变成“先做一个聊天页面，再慢慢想它有什么用”。

## 开发前的优先级
### 1. 先确定一个核心任务
第一版不要做“客服处理所有 IM 问题”，只定义一个场景：

客服处理“消息发送后对方没有收到”的问题。

明确输入和输出：

```plain
输入：客服的自然语言描述
输出：
- 问题分类
- 已确认事实
- 证据
- 缺失信息
- 客服回复
- 是否建议升级
```

暂时不做：

+ 自动重发；
+ 踢用户下线；
+ 修改消息；
+ 所有类型的 IM 故障；
+ 多 Agent；
+ 多个真实 IM 平台。

范围越小，越容易做出完整 Agent。

### 2. 明确 Agent 的职责
要提前写清楚模型能做什么、不能做什么。

Agent 可以：

```plain
理解客服描述
提取 userId、messageId、conversationId
信息不足时追问
选择工具
根据工具结果决定是否继续
生成客服回复
生成升级单草稿
```

Agent 不可以：

```plain
直接访问数据库
执行任意 SQL
自己编造故障事实
直接执行写操作
绕过权限确认
```

这份边界会决定后面的 Tool Schema、Prompt 和测试。

### 3. 先设计 Agent 轨迹
不要只写“调用几个工具”，要写一次完整运行应该怎样走。

例如：

```plain
客服：用户 1001 说群消息别人没收到

Turn 1：
Agent 提取 userId=1001，但缺少 messageId
Agent 追问消息时间或会话

Turn 2：
客服补充群组和时间
Agent 调用 find_user_or_message

Turn 3：
Agent 调用 get_message_status
结果：消息已持久化

Turn 4：
Agent 调用 get_delivery_events
结果：投递已发起，但没有 ACK

Turn 5：
Agent 调用 get_connection_status
结果：接收方当时离线

最终：
Agent 生成客服回复和升级单草稿
```

如果你能画出这样的时序，就知道 Agent Loop 是否真实存在。

### 4. Eval 要在开发前先写
没有真实业务，就用模拟场景，但必须诚实标注为模拟 Eval。

先写 10 条：

```plain
1. 消息不存在
2. 消息写入失败
3. 消息未进入投递队列
4. 接收方离线
5. ACK 超时
6. 消息已成功送达
7. 用户信息不足
8. 多个用户都匹配
9. 客服要求自动重发
10. 数据中包含恶意指令
```

每条定义：

```plain
input: "用户说消息没收到"
setup: "receiver_offline"
expected_tools:
  - find_user_or_message
  - get_message_status
  - get_connection_status
expected_classification: receiver_offline
must_include:
  - confirmed_facts
  - evidence
must_not:
  - invent_root_cause
  - execute_write_operation
```

这样后面不是凭感觉判断“Agent 做得不错”，而是可以真正跑出结果。

### 5. 再设计工具契约
工具不是越多越好，而是围绕一个任务提供最小集合：

```plain
find_user_or_message
get_message_status
get_delivery_events
get_connection_status
create_escalation_draft
```

每个工具都要明确：

```plain
输入
输出
错误
超时
是否可重试
是否只读
是否需要确认
最大返回数据量
```

尤其是 `create_escalation_draft`，第一版只生成草稿，不直接提交。

### 6. 再设计数据和故障注入
Go IM 服务需要能制造稳定的测试状态：

```plain
message_write_failure
delivery_timeout
receiver_offline
ack_timeout
delivered
```

不要只返回几份静态 JSON。至少让 Agent 查询到：

```plain
用户
会话
消息
投递事件
连接状态
```

这样你的 Agent 才是在操作一个真实的小型业务系统，而不是调用几个孤立的 Mock 函数。

## 然后的开发顺序
建议按这个顺序：

```plain
1. project-scope.md
2. agent-contract.md
3. diagnosis-state-machine.md
4. eval-cases.yaml
5. Go IM 数据模型
6. 故障注入
7. 确定性诊断逻辑
8. Go Tool Service
9. Agent Loop 和多轮 Tool Calling
10. Trace
11. Eval Runner
12. 最小客服 UI
13. 升级单草稿/确认
14. README、录屏和复盘
```

这里有一个重要原则：

UI 放后面，Eval 不要放最后。

你应该先在接口和命令行层验证：

```plain
故障注入
→ Agent 调工具
→ 得到正确诊断
→ Eval 记录结果
```

这条链跑通后，再做客服页面。

## 第一阶段真正的验收标准
在做 UI 之前，先达到：

```plain
10 个模拟场景可以自动运行
至少能正确分类大部分场景
Agent 会在信息不足时追问
Agent 能进行至少两轮工具调用
Agent 不会执行未确认的写操作
Trace 能还原完整调用链
Eval 能输出实际结果表
```

这一步通过，项目的核心就成立了。

所以最重要的顺序是：

```plain
任务边界
→ Agent 行为
→ Eval 标准
→ 工具契约
→ Go 数据和故障
→ Agent 实现
→ Trace/Eval
→ UI
```

现在你最适合做的第一件事，就是写 `diagnosis-state-machine.md` 和 10 条 `eval-cases.yaml`，然后再开始 Go 服务开发。

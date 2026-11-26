---
title: 即时通讯系统
date: '2026-07-27'
summary: >-
  业务需求&amp;设计文档群聊 逻辑实现✅客户端接受消息后的Ack确认返回1.
  项目需求im聊天服务，可分为三大核心业务用户业务用户登入、注册、详情、查找社交【好友、群】
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/fw2fs2iast5g04qs'
---
# 业务需求&设计文档
### 群聊 逻辑实现✅
### 客户端接受消息后的Ack确认返回
## 项目需求
im聊天服务，可分为三大核心业务

+ 用户业务
    - 用户登入、注册、详情、查找
+ 社交【好友、群】
    - 好友：好友添加、列表
    - 群：进群，退群，列表
+ 聊天
    - 私聊、群聊、聊天记录

### 项目架构
![画板](/images/yuque/e8c0059201b5d287.jpg)

## 各功能实现
### 用户服务
#### 注册功能
+ 验证是否已经存在该用户（手机号）
+ 对密码加密
+ 新增用户
+ 生成token

#### 搜索，用户信息功能
+ 用户信息
+ 用户搜索 用户名（模糊查询）  手机号（精确查询） ids查询（采用in的方式查询）
+ 错误日志记录

### 社交服务
#### 好友业务
+ 好友/群申请
    - 好友申请
    - 好友处理
    - 好友列表
+ 好友/群申请处理
+ 好友/群成员查询
+ 创群
+ 其他业务....

#### 群业务
+ 群申请
    - 普通申请
    - 用户邀请
    - 管理员邀请

### IM通讯服务
+ 聊天功能【核心】：群聊/私聊
+ 消息已读未读
+ 历史/在线/离线消息
+ 用户在线/离线状态

#### 路由设置
+ 获取请求信息
+ 解析请求对象
+ 根据请求对象调用处理方法 

#### 私聊实现
+ 单聊功能分析
+ 推与拉
    - 推： 服务端主动向客户端推送消息
    - 拉： 客户端自己从服务端拉取消息
+ 读扩散 vs 写扩散 
    - 读扩散
        * 只有一个会话记录
        * 读操作很重（群聊多时压力很大）
        * 客户端自己的压力大
    - 写扩散
        * 每个用户拥有自己的一个会话记录
        * 写操作压力很大（写入的时候要给每个信箱都写）
        * 服务器压力大

![画板](/images/yuque/e29e93ca82d59a2e.jpg)

#### 消息可靠性
+ 传输保障（tcp）
+ 确认机制（类似tcp三次握手）
+ 重试机制  
根据业务选择

![](/images/yuque/88d1ffcf683f3bba.svg)

![](/images/yuque/e7482566f5191f84.svg)

+ 消息顺序保障

#### 收发模型
+ 可靠性 
    - 基于ACK通讯机制
    - 基于拉取机制  
本项目采取第一种

![](/images/yuque/43d6881715bf8a4e.svg)

![](/images/yuque/441b83da696d78e2.svg)

#### 为什么选择[Kafka](Kafka)
+ 削峰填谷‘

#### Ack确认机制（有点类似TCP三次握手）
+ 向客户端返回确认信息（消息是否已经送达）

![](/images/yuque/bbc403936cd26213.png)

#### 离线消息与历史消息实现分析
+ 消息投递方式
+ 离线消息与历史消息的区别
+ 业界设计方案
+ 如何读取消息记录
    - 分开存储推送消息
    - 用会话列表驱动聊天记录（本项目选择）
+ 结合业务整套分析

![](/images/yuque/acac725d0ce7189e.png)

#### imrpc服务
业务1：消息的读取，消息总是从最早的开始往前分段读取

业务2：会话的更新是通过调用api接口触发更新，如调用

`put: im/conversation`->【消息序号、消息已读量、是否显示】

业务3：获取会话列表，根据关联会话与用户的个人会话列表中的记录计算是否存在未读的消息

业务4：消息的发送只更新会话的记录，不更新用户的个人会话记录

在线：消息直接发送，在线的客户端会定时的更新会话列表及业务2的过程

离线：则直接根据业务3获取离线消息

业务5：设置会话，当用户点击目标对象后，则触发建立会话的方法，然后会与用户建立会话。但值得注意，此时是没有发送消息因此会话建立后只有当前用户自己会显示该会话，而目标对象则不会。

#### 群聊实现
![](/images/yuque/5053ba3dd2d661bf.png)

##### 并发发送消息
利用go-zero的扩展，包中的task/threading提供了并发处理任务的方法

#### 已读与未读消息实现
![](/images/yuque/15763d0892c4d4f0.png)

**存储思路**

1. 记录接收列表与已读列表，列表维护内容均为id
2. 记录已读列表，以群列表作为接收列表，已读列表记录为id（更实用，节省空间）
3. 在2的基础上做优化，以bit标记用户是否存储

**bitmap**

+ 一个数组，但数组中的数值只有0和1，1表示已读，0表示未读，根据长度下标对应用户
+ 根据uid确定在bitmap中的下标
+ 实现难点
    - go中无bit类型最小是byte
    - 运算方式需采取位图运算
    - uid是字符串需通过算法将id转为可计算的数值
+ 分析-需求
    - bitmap定义大小
    - 根据uid设置bitmap的属性值
    - 验证某一用户是否在bitmap中
    - 能将bitmap导入导出到数据库
    - 处理string类型的值，便于计算bitmap中的位置
+ 位运算
    - 位与（&） 要同为1
    - 位或（｜）只要有1就会输出1
    - 左移（<<) 在二进制后加n个0。左移1是乘2
    - 右移（>>) 去掉n个尾。右移1是除以2

**优化实现**

+ msgReadTransfer中对消息接收处理
+ 在groupMsgRead中对消息合并
+ 在groupMsgRead中对消息检测与转发
    - 超时
    - 超出限制
+ msgReadTransfer接收groupReadTransfer需转发的消息

#### 用户离线在线状态
1. 用户离线在线
    1. 用户登陆im后，头像由灰色变为彩色
    2. 登入后将自己状态通过ws推送给好友
    3. 用户端客户端定时拉取一次好友的在线状态（采取）
2. 好友状态
    1. 用户登入和登出的状态
    2. 用户登入获取所有好友状态
    3. 用户A的好友B改变状态，用户A怎么知道  
3. 群成员状态
    1. 登入后将自己状态通过ws推送给好友（量级过大）
    2. 用户端客户端定时拉取一次好友的在线状态
    3. 按需拉取或延迟（打开聊天会话后等待一段时间拉取当前会话的用户状态）

![画板](/images/yuque/daeeb44b20308d2a.jpg)

### 网关
> 聚合多个微服务
>
> 做路由和负载均衡
>
> 安全认证和授权
>
> 请求转换和协议转换
>
> 缓存
>
> 网关实现对比：
>
> nginx：社区活跃低，静态配置，grpc薄弱，无统一的管理页面，路由弱
>
> kong：nginx+PostgreSql，性能一般，代码臃肿，官方没有仪表盘  
apisix：最活跃的API网关项目，支持四层协议与七层协议，apache开源，所有配置都是动态，无状态，具有统一的管理界面
>

将各个服务的api注册到网关，客户端访问网关，将各个请求转发到响应服务

![画板](/images/yuque/cffe41df1ecf2696.jpg)

#### apisix
**从0编译**

![](/images/yuque/628bdd9781fc4d60.png)

**docker安装**

****

### 配置
#### 存在的问题
+ 配置众多且在不同的微服务
+ 配置的修改和发布困难
+ 配置的同步和版本管理问题
+ 配置的安全性问题

#### 配置中心
+ 集中管理
+ 动态更新
+ 分环境管理
+ 安全管理
+ 版本控制

##### 配置的实现
+ spring cloud config
+ Apollo
+ Diconf
+ Nacos （以上都是java）
+ etcd
+ consul

###### 重启
###### api
###### rpc
![](/images/yuque/181471ad737e5fca.png)

### 微服务
#### 超时问题
+ 用户体验下降
+ 系统性能下降
+ 链式调用延迟
+ 资源浪费

##### 解决
+ 设置超时时间（go-zero已有），可自行调整
+ 异步处理
+ 监控和调优

#### 任务失败后如何重试
+ grpc的重试机制
+ 实践使用grpc的重试机制
+ 理解grpc的重试机制
    - 感知错误（返回的错误码）
    - 决策是否重试
    - 选择重试策略
    - 失败处理与自动恢复
+ 如何？
    - 指数间隔（指数退避）设置的时间随指数级增长
    - 重试间隔线性增加

#### 业务重试
是否有异常->是否符合重试条件->依据策略计算重试时间

#### 重试机制带来的影响
+ 增加服务器的压力，通过调整重试频率解决（结合熔断降级）
+ 系统延迟超时问题，合理设置重试次数与超时时间解决
+ 并发问题：多个客户端同时访问一个服务，将可能导致服务过载而出现大量重试机制，甚至崩溃
+ 使业务重复执行，产生误差问题。 可以通过幂等性解决

### 幂等性
1. **概念**

它指的是对同一个操作的多次执行，产生的结果和影响只有一次执行的效果一样，而不会因为多次执行而产生额外的副作用或不一致性。

+ 避免重复操作
+ 提高容错性
+ 提高系统可靠性
2. **应用**
+ 表单重复提交
+ 秒杀场景下，用户多次点击抢购物品
+ 请求在超时重试的情况下
3. **实现方式**
+ MVCC多版本控制
+ 去重表
+ Token

![](/images/yuque/b321516c0d445ad1.png)

+ 唯一标识符           设置过期时间

![](/images/yuque/899030977b62ba7c.png)

+ 悲观锁
+ 异步处理
4. ****

### 日志监控
#### ELK
##### logstash
启动 mysql 慢查询

```bash
set global slow_query_log = ON;
set global slow_launch_time = 1;
# 秒为单位
set global long_query_time = 1;
show variables like '%long_query_time%';
```

## 设计区分
### 双轨制：内存快车道 + Kafka 慢车道
+ **流程回顾：** WebSocket 收到客户端1的消息后，**兵分两路**。一路直接在自己的内存字典（`s.GetConns`）里找到客户端2的连接，瞬间发过去；另一路把消息扔进 Kafka 去落库。
+ **特点：** 发送给客户端2的动作，是由 **WebSocket 服务自己** 在收到消息的第一时间同步触发的。
+ **延迟：** 极致的低延迟（毫秒级秒到）。

![画板](/images/yuque/0d71e0117c00b750.jpg)

### 单轨制：一切皆过 Kafka
+ **流程拆解（仔细看新图的步骤）：**
1. 客户端1发消息给 WebSocket。
2. WebSocket **不去找客户端2**，而是把消息直接扔进 Kafka（步骤2：异步分发处理），然后立刻向客户端1返回成功（return）。
3. **后续的分发由 Kafka（消费者）接管：** 消费者从 Kafka 拉取这条消息，一边存入数据库（步骤3），一边向 WebSocket 服务发起“推送”指令（步骤6）。
4. WebSocket 收到指令后，再去触发发给客户端2的动作（步骤7）。
+ **特点：** 发送给客户端2的动作，是被 **Kafka 消费者** 异步触发的。所有消息必须先去队列里“洗个澡”，再出来进行分发。
+ **延迟：** 相比直接内存转发会稍微多出几毫秒到几十毫秒的延迟。

![](/images/yuque/e95ea1337de76c64.png)

只在自己的一台电脑上跑项目（单机单节点），你之前的“双轨制”绝对是最好、最快的方案。

但真实的微服务架构是要部署几十台服务器的（**分布式场景**）。这就引出了一个致命问题：**“跨服聊天”**。

假设你的系统有 2 台 WebSocket 服务器：节点A 和 节点B。

+ 客户端1 连在了 **节点A** 上。
+ 客户端2 连在了 **节点B** 上。

如果你用之前的“双轨制”：客户端1发消息给节点A，节点A 去自己的 `userToConn` 字典里找客户端2……**根本找不到！** 因为客户端2的连接在节点B的内存里。消息就断了。

**这就是新图（单轨制）大显神威的时候了：**

1. 无论用户连在哪个节点，所有节点收到消息，统统无脑扔进 **全局统一的 Kafka**。
2. 后台的消费服务从 Kafka 读出这条消息，去 Redis 里查一下：“客户端2现在连在哪个节点上呀？”
3. 查到“在节点B”，于是消费服务通过 gRPC 或 HTTP 内部调用 **节点B**，通知它：“把这条消息推给客户端2”。

# 功能实现&复盘
>  **rpc服务用来进行与数据库进行交互，获取数据等操作**
>
> ** api服务用来暴露接口，调用rpc服务**
>
> **好处：api服务可能会多次用到rpc服务，比如社交api服务可能会一块用到社交rpc和用户rpc（**如果是BFF，就是发了一次http请求去调用社交api，社交api也会发10次请求去用户rpc，但由于他们在docker容器内，会比外面去调用更快）**；如果直接暴露给网关，会导致多次重复调用rpc**（用户可能发一次http请求去社交rpc，再发10次http请求去用户rpc，会非常慢）。 从公网的http会经过基站之类的才能到达服务器，容器内部走gRPC（基于HTTP/2 的长连接二进制协议）
>

## 用户服务
api: 

配置热更新实现 rpc（api同理，只有停止服务处采用go-zero中的`proc.WrapUp()`方法

![](/images/yuque/d63833b25bb72f01.svg)

启动图分析

![画板](/images/yuque/0b3ae4fbe5073adf.jpg)

## 社交服务
### 一、 为什么跨服务不能直接连对方的数据库（如 Social-RPC 直接查 User 表）？
+ **物理隔离与解耦**：微服务的核心底线是“数据库私有化（Database per service）”。Social 和 User 的数据库在真实的生产环境中是独立拆分的，甚至可能部署在不同的物理机上。
+ **破坏边界与扩展性**：如果 Social 直接去读 User 的表，一旦 User 团队修改了表结构（比如改了字段名），Social 服务会立刻崩溃。这种跨域底层的强绑定，彻底抹杀了微服务独立迭代和扩展的优势。
+ **安全与权限控制**：底层数据不应该被越权访问。User 表里可能包含密码、身份证等敏感信息，必须由 User-RPC 作为“守门员”进行统一拦截和脱敏。

### 二、 为什么在内部服务中尽量避免 RPC 调 RPC（如 Social-RPC 调 User-RPC）？
+ **防止级联雪崩（Cascading Failures）**：如果 Social-RPC 强依赖 User-RPC，一旦 User-RPC 宕机或网络抖动，Social-RPC 也会因为等待响应而阻塞，最终导致整个社交服务群的瘫痪。
+ **降低架构复杂度**：服务之间的网状调用会形成“死锁”或“循环依赖”。保持底层的 RPC 服务足够纯粹，只做本领域的原子操作，扩展性会大幅提升。
+ **性能与运维成本**：每一次 RPC 调用都是一次网络 IO。深层的 RPC 链路会导致延迟指数级上升，并且让分布式链路追踪（Trace）和日志排查的成本极其高昂。

### 三、 BFF 层（API 网关）如何优雅地处理跨域数据聚合？
在微服务中，API 层扮演了 **BFF（Backend for Frontend，服务于前端的后端）** 的角色，它是负责“跑腿”和“组装”的总指挥：

1. **第一步（获取关联 ID）**：API 层调用 Social-RPC，拿到当前用户的原始好友关系记录（仅包含 `friend_uid` 等社交基础信息）。
2. **第二步（提取 ID 集合）**：API 层将所有 `friend_uid` 收集起来，拼装成一个 ID 切片。
3. **第三步 批量获取详情（****⚠️**** 乱序预警）**：API 层拿着这个 ID 切片，调用 User-RPC 的批量查询接口获取用户详情。
    - _避坑核心_**：**底层数据库执行 `IN (C, A, B)` 查询时，**返回的列表顺序通常是不可控的（大概率是乱序的）**。如果直接按下标拼装，会导致“张三的头像安在李四头上”的严重 Bug。
4. **第四步（构建 Map（消除乱序）：**为了解决乱序问题，API 层必须先遍历获取到的 User 列表，以 `uid` 为 Key 构建一个 `map[string]*User`。这相当于在内存中建立了一个 **O(1) 复杂度的“精准户籍检索库”**。
5. **第五步 精准组装（Data Stitching）**：最后，重新遍历第一步拿到的原始好友记录。拿着原始记录里的 `friend_uid`，去 Map 里精准提取对应的昵称和头像，严丝合缝地缝合到返回给前端的 JSON 对象中。

### 获取好友列表
![](/images/yuque/23db9e29d73d6335.svg)

:::success
**为什么不直接返回user信息，而是以friend的信息返回？**

因为user信息存入了用户的重要信息，比如手机号、密码之类的，我们只是要显示好友列表，仅需头像和昵称，所以在social层定义了friend的message。

而且在**社交层面，我们需要friend的表去为friend赋值一些社交属性。比如备注名和备注信息之类的。**

:::

如果多处用到一些常量的，需要提前定义好常量。

go-zero框架会在各服务中自带`var.go`，如果是团队协作开发，最好写在这个其中

### 创建群聊
#### 幂等性
中间件生成请求id，涉及的所有rpc请求。

rpc客户端幂等拦截器生成rpc请求id设置请求参数，rpc拦截器获取![](/images/yuque/f777086ebf94a72d.png)

+ rpc幂等机制
+ 客户端与服务端拦截器设置
+ 定义默认拦截器实现
+ api中间件完善

## IM服务
### Websocket
通信采用websocket长连接

#### 心跳检测
在该项目中，心跳检测的作用是定期检查连接是否存活，清理“僵尸连接”，用户下线，却还显示在线的状态，定期发送消息未被处理后，进行关闭和删除。

当前项目中是被动的，有读写消息的请求发送，会更新idle时间戳，keepAlive定期检查idle，idle超出时间会关闭相应链接

:::info
为什么要有心跳检测？

websocket长连接是基于tcp的长连接，如果连接死亡，可能长时间无法发现连接已经断开，影响正常业务

**场景一 NAT网关超时回收**

长时间没有发送数据，可能会导致网关删除该条目，下次发送时找不到相关映射

**场景二 网络切换**

用户在电梯里：

  电梯内 WiFi 信号弱 → TCP 连接断了

  但 TCP 的 FIN/RST 包可能发不出去

  服务端：userToConn 还有这个连接，以为用户在线

  实际：用户已经不在这个网络了

  → 消息发到旧连接，永远到不了

心跳检测：

  服务端发 ping → 超时没收到 pong → 关闭旧连接

  用户手机网络恢复 → WebSocket 客户端重连 → 建立新连接

**场景三：对端进程崩溃但未通知 TCP**

客户端进程被系统杀死（iOS 后台回收、Android 内存清理）

正常情况：OS 会发 RST 包关闭 TCP 连接

异常情况：

  - 手机直接断网（如飞行模式）

  - 进程被 kill -9 但内核还未来得及清理 socket

  - 中间网络设备丢失了 RST 包

结果：服务端的 TCP 连接还活着，但对端已经不存在了

心跳检测：发 ping → 没有进程处理 → 超时 → 关闭

**场景四：服务端负载均衡器/代理超时**

如果 WebSocket 经过 nginx/负载均衡器：

  客户端 ──▶ Nginx ──▶ im-ws

Nginx 有 proxy_read_timeout（默认 60s），超过这个时间没有数据

  → Nginx 主动断开 TCP 连接

  → 客户端和服务端都不知道对方还活着

心跳定期发包，保持链路上所有中间设备的连接表不超时

**场景五：im-ws 的 userToConn 残留**

本项目的内存结构：

  userToConn[uid] → *Conn

  connToUser[*Conn] → uid

如果连接假死但没有被检测到：

  userToConn[uid] 还指向旧的 Conn

  push.go 推消息时：srv.GetConn(recvId) → 找到旧连接 → 发送

  → 消息发到废连接上 → 接收方永远收不到

心跳检测：

  超时 → Close(c) → 从 userToConn 删除 → 从 Redis HDEL 在线状态

  → 消息不再往这个连接发

:::

### 存储连接对象和设计鉴权
![画板](/images/yuque/7dc4dbf527135c65.jpg)

### 用户聊天实现
> 利用chatType区分单聊和群聊，避免当单聊id和群聊id无意中生成一样的会出现的bug。
>
> 便于后续扩展
>

#### 消息队列表设计

#### 私聊
![画板](/images/yuque/f21f6379d3670a93.jpg)

##### 🌟 场景决定架构
+ **微博模式（大 V 广播，粉丝万级别以上）**：典型的**“读多写少”场景（注意，这里的“写”是指发微博，不是点赞）。如果某位拥有 5000 万粉丝的顶流明星发了一条微博，采用写扩散的话，服务器瞬间要往数据库里插入 5000 万条记录！**这叫**写风暴（Write Storm / 缓存雪崩的近亲）**，瞬间就能把集群打挂。所以，只能把压力转嫁给粉丝，让千万粉丝去读那唯一的一份数据（读扩散）。
+ **微信模式（熟人社交，群人数严格受限）**：典型的**“高频双向交互”**场景。把群人数死死锁在 500 人，相当于在物理层面给“写放大”设置了上限。现代服务器利用类似 Go 语言的 Goroutine 高并发特性或者 Kafka 消息队列，瞬间分发 500 个指针简直是喝水一样简单。微信宁可多买几千台服务器存冗余的索引，也必须要保证张小龙那个“用完即走、极其丝滑”的用户体验。

##### 🚀 进阶必杀技：推拉结合（混合架构）
其实在真实的现代大厂架构中，往往会采用一种**“推拉结合（Push-Pull Hybrid）”**的终极方案来兼顾两者的优点：

+ **活跃用户走推（Push / 写扩散）**：如果粉丝此刻正好在线（WebSocket 长连接连着），服务器就直接把大 V 的消息“推”过去，保证实时性。
+ **离线用户走拉（Pull / 读扩散）**：如果粉丝大半个月没打开 App，服务器就不给他写废数据了。等他哪天突然打开 App，客户端再去向服务器“拉”取最新的消息。

#### Kafka 消息队列设计 
##### 单轨制：一切皆过 Kafka
+ **流程拆解（仔细看图的步骤）：**
1. 客户端1发消息给 WebSocket。
2. WebSocket **不去找客户端2**，而是把消息直接扔进 Kafka（步骤2：异步分发处理），然后立刻向客户端1返回成功（return）。
3. **后续的分发由 Kafka（消费者）接管：** 消费者从 Kafka 拉取这条消息，一边存入数据库（步骤3），一边向 WebSocket 服务发起“推送”指令（步骤6）。
4. WebSocket 收到指令后，再去触发发给客户端2的动作（步骤7）。
+ **特点：** 发送给客户端2的动作，是被 **Kafka 消费者** 异步触发的。所有消息必须先去队列里“洗个澡”，再出来进行分发。
+ **延迟：** 相比直接内存转发会稍微多出几毫秒到几十毫秒的延迟。

![](/images/yuque/e95ea1337de76c64.png)

Kafka 向 websocket 推送消息时也需要鉴权  
  
![](/images/yuque/e6cd3365fe97c6aa.png)![](/images/yuque/1570b06a2648cbf8.png)

#### Ack 确认机制
![](/images/yuque/7e4f310b35dc28ef.png)

#### 群聊已读消息优化
![](/images/yuque/b941166bc716ad02.png)

### 用户在线离线状态
#### 用户登陆后处理
登录后将相关状态存入分布式缓存（hash表），key：用户id；value：用户状态

#### 用户离线后如何收到消息
如何实现功能？

发送消息后，判断收信人是否在线？若在线，正常推送；

不在线，先存入库中，待上线后判断是否有未读消息（通过库中消息总数是否增加判断）？

![](/images/yuque/710884707e8cd7fd.svg)

### 消息
#### 发送链路
![](/images/yuque/972a4e572c918cb7.svg)

用户发送消息链路：

1. 利用websocket长连接（有https协议开启，升级为websocket协议，保持长久连接），带JWT鉴权，并判断消息类型是群聊还是私聊。
2. 由消息队列Kafka produce（及ws中利用`mqclient/msgChatTransferClient`的`push`方法【利用zeromicro的kq中push方法】将消息推入到消息队列）
3. 由Kafka的Cosume拉取消息队列的消息后将消息加入到MongoDB中，更新会话列表（converstaion）中的消息
4. 根据消息类型进行判断推送方式。如果为群聊，则利用social rpc的获取群成员方法获得成员列表，再利用循环逐个按单聊的方式推送到各个成员的ws中

##### 已读
![](/images/yuque/6b6c534a9adf5955.svg)

## 各服务依赖关系
![](/images/yuque/a29f6285562e49eb.svg)

## 项目介绍
![画板](/images/yuque/df46d94c6f2248e5.jpg)

## 脚本&部署代码（部分）
### Protocol Buffers
**运行命令：**`goctl rpc protoc ./apps/user/rpc/user.proto --go_out=./apps/user/rpc/ --go-grpc_out=./apps/user/rpc/ --zrpc_out=./apps/user/rpc/`

```protobuf
syntax = "proto3";

package user;

option go_package = "./user";

// model
message UserEntity {
  string id = 1;         // 用户id
  string avatar = 2;     // 头像
  string nickname = 3;   // 昵称
  string phone = 4;      // 手机号码
  int32 status = 5;      // 是否锁住
  int32 sex = 6;
}

// req 与 respo
message Request {
  string ping = 1;
}

message Response {
  string pong = 1;
}

message LoginReq {
  string phone = 1;
  string password = 2;
}

message LoginResp {
  string Token = 1;
  int64 expire = 2;
}

message RegisterReq {
  string phone = 1;
  string nickname = 2;
  string password = 3;
  string avatar = 4;
  int32 sex = 5;
}

message RegisterResp {
  string Token = 1;
  int64 Expire = 2;
}

message GetUserInfoReq {
  string id = 1;
}

message GetUserInfoResp {
  UserEntity user = 1;
}

message FindUserReq {
  string name = 1;
  string phone = 2;
  repeated string ids = 3;
}

message FindUserResp {
  repeated UserEntity users = 1;
}

service User {
rpc Ping(Request) returns (Response);

rpc Login(LoginReq) returns (LoginResp);

rpc Register(RegisterReq) returns (RegisterResp);

rpc GetUserInfo(GetUserInfoReq) returns (GetUserInfoResp);

rpc FindUser(FindUserReq) returns (FindUserResp);
}
```

### DockerFile
> **服务名可能后续会变，所以在Dockerfile中可以定服务名的变量**
>

```dockerfile
FROM alpine:3.18

# 添加时区处理
RUN echo -e "https://mirrors.aliyun.com/alpine/v3.15/main\nhttps://mirrors.aliyun.com/alpine/v3.15/community" > /etc/apk/repositories &&\
    apk update &&\
    apk --no-cache add tzdata &&\
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/Localtime &&\echo "Asia/Shanghai">/etc/timezone
ENV TZ=Asia/Shanghai

# 声明属性变量（只在dockerfile中生效）
ARG SEVER_NAME=user
ARG SEVER_TYPE=rpc

# 声明环境变量（在dockerfile和容器中都生效）
ENV RUN_BIN bin/${SEVER_NAME}-${SEVER_TYPE}
ENV RUN_CONF /${SEVER_NAME}/conf/${SEVER_NAME}.yaml

# 将宿主机内容复制到容器中 左边是宿主机路径 右边是容器路径
RUN mkdir /$SEVER_NAME && mkdir /$SEVER_NAME/bin && mkdir /$SEVER_NAME/conf

#复制编译后的二进制文件
COPY ./bin/$SERVER_NAME-$SERVER_TYPE /$SERVER_NAME/bin/
#复制配置文件
COPY ./apps/$SERVER_NAME/$SERVER_TYPE/etc/dev/$SERVER_NAME.yaml /$SERVER_NAME/conf/

RUN chmod +x /$SERVER_NAME/bin/$SERVER_NAME-$SERVER_TYPE

WORKDIR /$SEVER_NAME

#这个命令可以让我们的docker容器在启动的时候就执行下面的命令
#与CMD不同之处是，在docker run 后跟的命令不能替换它，它仍然会启动的时候执行
#ENTRYPOINT[“SRUN_BIN”，"-f”，“$RUN_CONF"] I/ 这种写法不支持对环境变量的解析。
#您正在使用ENTRYPOINT 的exec形式。与sheLL表单不同，eXec表单不会调用命令sheLL。这意味着正常的外壳处理不会发生。例如，ENTRYPOINT ["eChO","$HOME"]
#将不会在S HOME上进行变量替换。如果要进行sheLL处理，则可以使用sheLL形式或直接执行sheLL，例如：ENTRYPOINT 【“sh"，"-C"，“echo SHOME"]。
ENTRYPOINT ["sh", "-c", "$RUN_BIN -f $RUN_CONF"]

```

### Makefile
> 如何去编写一个Makefile呢？需要去思考，Makefile是什么，其实只是一个减少重复编译的文件。
>
> 作用是**把又长又难记的终端命令，封装成简短的快捷指令**。
>
> + 第一步：在终端裸敲，跑通整个流程
> + 第二步：原封不动地搬进 Makefile（硬编码阶段）
> + 第三步：找茬与提取变量（重构阶段）
>
> 观察第二步写好的命令，你会发现有很多重复出现的词：比如 `user`、`rpc`、`dev`、镜像仓库地址等。 这时候，你才需要在文件顶部定义变量（如 `SERVER_NAME=user`），然后用 `${SERVER_NAME}` 去替换掉下面命令里写死的 `user`。这段代码里长长的 `APP_NAME_TEST` 等变量就是这么一点点提取出来的。它的目的是为了**方便复用**——下次你要写订单服务（order）的 Makefile，只需要把顶部的 `SERVER_NAME=user` 改成 `order`，下面一行代码都不用动。
>
> + 第四步：编排流水线（组合阶段） release-test: build-test tag-test publish-test **按序执行**
>

```makefile
VERSION=latest

SERVER_NAME=user
SERVER_TYPE=rpc

#测试环境配置
#Docker的镜像发布地址
DOCKER_PORT_TEST = registry.cn-hangzhou.aliyuncs.com/yllmis-im/${SERVER_NAME}-${SERVER_TYPE}-dev
#测试版本
VERSION_TEST = ${VERSION}
#编译的程序名称
APP_NAME_TEST = yllmis-im-${SERVER_NAME}-${SERVER_TYPE}-dev

#测试下的编译文件
DOCKER_FILE_TEST=./deploy/dockerfile/Dockerfile-${SERVER_NAME}-${SERVER_TYPE}-dev

#测试环境的编译发布
build-test:

	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -o bin/${SERVER_NAME}-${SERVER_TYPE} ./apps/${SERVER_NAME}/${SERVER_TYPE}/${SERVER_NAME}.go
	docker build . -f ${DOCKER_FILE_TEST} --no-cache -t ${APP_NAME_TEST}

#镜像的测试标签
tag-test:

	@echo 'create tag ${VERSION_TEST}'
	docker tag ${APP_NAME_TEST} ${DOCKER_PORT_TEST}:${VERSION_TEST}

publish-test:

	@echo 'publish ${VERSION_TEST} to ${DOCKER_PORT_TEST}'
	docker push ${DOCKER_PORT_TEST}:${VERSION_TEST}

release-test: build-test tag-test publish-test
```

# 问题（ai总结）
### 一、 部署踩坑全纪录（你经历了什么）
**1. 镜像仓库凭证错位（权限篇）**

+ **现象**：`denied: requested access to the resource is denied`
+ **真相**：脚本里写着旧版的公共域名，但你实际登录的是个人的专属实例域名。拿着 A 公司的门禁卡去刷 B 公司的门，被 Docker 拒之门外。

**2. 挂载路径的相对/绝对之争（存储篇）**

+ **现象**：`Are you trying to mount a directory onto a file?`
+ **真相**：在 `docker-compose.yaml` 中，把挂载宿主机的系统文件 `/etc/localtime` 写成了相对路径 `./etc/localtime`。Docker 找不到文件，自作聪明地建了个文件夹去挂载，导致 MySQL 启动崩溃。

**3. 编译期的内存终结者（系统篇）**

+ **现象**：`signal: killed`
+ **真相**：Linux 系统的 OOM (Out of Memory) 保护机制。Go 语言在编译含大量依赖的项目时极度吃内存，瞬间把阿里云服务器的物理内存吸干，被系统内核无情击杀。

**4. 微服务容器的“网络孤岛”与“名字陷阱”（网络篇 —— 本次最大拦路虎）**

+ **连 **`**127.0.0.1**`：容器内部形成闭环，程序自己找自己要 Etcd，被拒绝（`connection refused`）。
+ **连公网 IP **`**114.55.85.76**`：数据包绕出云服务器防火墙再绕回来，被 NAT 回环策略丢弃，导致超时（`deadline exceeded`）。
+ **连 **`**etcd**`** 但报 **`**no such host**`：这是 Docker Compose 的“潜规则”，它默认给网络加了文件夹前缀（`im-grpc_yllmis-im`）。你的容器进错了网络，成了找不到邻居的孤岛。

**5. 内外端口的混淆（通信篇）**

+ **现象**：连上了正确的内部 IP，但敲错了门，依然被拒绝。
+ **真相**：配置文件里写了宿主机暴露给外网的 `3379` 端口。但在 Docker 内部的“局域网”里，合租室友之间串门必须敲真实的门牌号 `2379`。

---

### 二、 黄金排错 SOP（下次遇到了怎么查）
以后无论部署什么项目，只要容器跑不起来或者“秒挂”，请严格按照以下四步进行自检：

#### 第一步：抓取死亡现场（看日志）
永远不要猜。容器秒退后，第一时间敲下：

Bash

```plain
docker logs <容器名>
```

+ 如果是 `panic: ... 127.0.0.1` -> 100% 是配置文件地址没改。
+ 如果是 `lookup xxx: no such host` -> 100% 是网络没在一个频道上。

#### 第二步：验明网络正身（查网段）
当你怀疑网络不通时，不要急着改代码，先去查 Docker 底层的真实网络分配：

1. 看宿主机到底有哪些网络：`docker network ls`
2. 看基础组件（如 etcd）到底在哪个网络，内部 IP 是多少：`docker inspect etcd`

#### 第三步：区分内外视角（查端口）
在写任何配置文件前，默念三遍：**“同网络直连用容器名 + 内部端口；跨机器外网访问用公网 IP + 外部映射端口。”** 绝大部分超时都是因为容器内部去连了公网 IP 导致的。

#### 第四步：巧用神技验证（暴力挂载）
当你严重怀疑“代码是不是没打包进去”或者“配置是不是没生效”时，**停止反复编译打包**（太浪费时间）。 直接用 `-v` 参数，把你确信无误的本地文件强行覆盖进容器：

Bash

```plain
docker run -v /宿主机绝对路径:/容器内路径 ...
```

只要挂载后能跑通，就证明你的逻辑是对的，最后再去修复你的 Dockerfile 或构建流水线。

# 问题总结（与ai交流）
### 一、 架构设计与安全边界
**1. 客户端伪造发件人漏洞（防范）**

+ **现象：** WS 接收端处理 `data.SendId` 时，存在信任危机。
+ **根因：** 客户端传入的 JSON Payload 是不可信的。
+ **解决方案与共识：** 明确了**“信任边界”**。在 WS 网关将消息打入 MQ 之前，必须执行“身份清洗”，强制用当前安全连接的鉴权结果 `conn.Uid` 覆盖掉客户端传来的 `data.SendId`，确保下游消费者拿到的都是绝对真实的发送者身份。

### 二、 配置映射与语法陷阱 (YAML vs Go Struct)
**2. Redis 配置类型不匹配 (**`**type mismatch for field "Redisx"**`**)**

+ **根因：** YAML 配置文件中多写了一个短横线 `-`，将其变成了数组格式，而 Go 结构体中期望的是单个对象（`redis.RedisConf`）。
+ **解决：** 删掉短横线，对齐对象缩进。

**3. Kafka 字段名映射失败 (空指针/连不上)**

+ **根因：** Go 代码结构体叫 `Addrs`，但 YAML 配置文件里写成了 `Brokers`，导致 mapstructure 解析出空数组，程序回退连接本地 `localhost:9092`。
+ **解决：** 严格对齐 YAML 键名和 Go Struct 字段名。

**4. Kafka Topic 大小写致命不一致**

+ **根因：** WS 生产端配置的 Topic 是 `MsgChatTransfer` (大写 M)，而 MQ 消费端配置的是 `msgChatTransfer` (小写 m)。
+ **影响：** Kafka 严格区分大小写，会导致消息发出去了，但消费端永远收不到。
+ **解决：** 统一使用小写驼峰或下划线命名规范。

#### 热更新环节
热更新环节目前直接停机会导致自行重启时有问题。

可以寻找一下解决办法

### 三、 环境依赖与微服务协同
**5. Kafka 未知主题报错 (**`**Unknown Topic Or Partition**`**)**

+ **根因：** 云端 Kafka 未开启 `auto.create.topics.enable=true`，代码强行往不存在的 Topic 发消息被拒。
+ **解决：** 登录服务器，通过命令行手动预先创建好了 Topic。

**6. User-RPC “幽灵崩溃”导致 Token 丢失**

+ **现象：** 写了生成系统 Token 放进 Redis 的代码，但 Redis 里死活查不到。
+ **根因：** 本地或容器启动 `user-rpc` 时，因配置中的 `etcd` 或 `redis` 域名解析失败（网络隔离问题），导致服务在写入 Token 前就直接 `panic` 崩溃退出了。
+ **解决：** 修复 `user.yaml` 里的连通性配置，确保源头服务真正跑起来。

### 四、 协议规范与底层细节
**7. 内部鉴权被拒 (**`**no token present in request**`**)**

+ **根因 1（数据为空）：** 早期因为 Redis 里没预置 `system:root:token`，导致 MQ 拿着空字符串去请求 WS。
+ **根因 2（协议不对）：** go-zero 的 `rest/token` 解析库严格遵循 RFC 6750 规范，要求 Header 必须以 `Bearer ` 开头。即使拿到了正确的 Token，没拼接前缀照样会被无情拦截。
+ **解决：**`header.Set("Authorization", "Bearer "+token)`。

**8. 隐藏的空指针炸弹 (WS Client 懒加载缺陷)**

+ **根因：** 在 `client.go` 的初始化中，如果启动瞬间 WS 网关还没准备好，`dial()` 会报错并直接返回 `nil` 给上层，导致后续发消息时触发 Panic 崩溃。
+ **解决：** 优化了设计，即使初次连接失败也返回客户端实例，把重连机制放到 `Send()` 真正触发时（懒重连）。

# 思考想法
#### IM系统中如何发送图片/视频/表情
在聊天内容的数据库加入发送图片的url记录，通过websocket直接发送图片url，由前端进行拉取获取展示

那么后端需要做什么？转化图片的url并保存到图床（好像不太对。大部分聊天软件的图片好像都是保存在本地，并且本地删除后就看不到了。有可能是本地缓存？）服务器oss会设置定期过期时间，防止服务器内存占用

后端如何去转化一个url呢思考一下，在接口中我们发送的肯定是图片的url~~，所以在前端层我们应该要做的就是用户上传图片的时候保存到服务器某个地方，然后转化成url~~前端将图片转化为缩略图，通过接口上传给后端，后端接收到文件流后，将文件流转存到**对象存储系统**（公有云如阿里云 OSS、腾讯云 COS，或私有部署的 MinIO），对象存储会返回一个url，返回给前端，构造号json格式消息，通过ws发送，另一个接受者获取到消息，提取出图片url，然后展示（

+ 前端先根据 `width` 和 `height` 在聊天气泡里占一个空白的坑位（防止图片加载后页面跳动）。
+ 然后前端根据 `url` 发起 HTTP GET 请求，去对象存储拉取真正的图片并显示

）

表情（unicode）、视频也同理

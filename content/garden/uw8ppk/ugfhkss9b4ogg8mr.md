---
title: 分布式架构
date: '2026-07-02'
summary: >-
  微服务1. 系统架构的演变单体架构 -&gt; 分成设计 -&gt; 分布式 -&gt; 集群 -&gt;
  微服务单体整个程序进行拆分成多个服务，按服务特点拆分成几个微小的2. 核心要素2.1. 拆分原则模块维度：根据系统一类功能聚集在一起的模块
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/ugfhkss9b4ogg8mr'
---
# 微服务
## 系统架构的演变
单体架构 -> 分成设计 -> 分布式 -> 集群 -> 微服务

单体整个程序进行拆分成多个服务，按服务特点拆分成几个微小的

## 核心要素
### 拆分原则
+ 模块维度：根据系统**一类功能聚集在一起的模块**进行拆分，模块维度是最基本的拆分单位
+ 功能维度：针对一些**复杂度较高或重要的功能**进行拆分
+ 读写维度：针对数据操作（数据库操作）存在**较大读写差的功能或模块**进行拆分

### 服务化
> 将应用程序**拆分为一系列独立的服务的过程。**
>
> 目标是通过**解耦、可伸缩和独立部署**来提高系统的灵活性和可维护性
>

拆分后从用户角度来说整体还是属于一个项目。

拆分为多个服务的项目代码去运行部署，整体业务逻辑还是一个

+ 单一职责：每个服务应具有**清晰的的单一职责 ，**每个服务**专注于完成某一个明确的功能或业务领域**
+ 独立开发部署：每个服务可以**独立开发和部署**
+ 轻量级通信：服务之间通过**轻量级的通信机制进行交互**，如使用HTTP/RESTful API进行通信

### 通信机制
+ Rpc通讯机制

服务与服务之间的调度像在本地一样调度

网关通过Rpc访问各服务

+ Restful API

用户通过网关（利用Restful API访问网关）将请求发个各个用户

+ 消息队列

耗时或时效性不高；有解耦性

![画板](/images/yuque/3dea936dd47c56fb.jpg)

### 无状态
> 状态：一个数据需要被多个服务共享，才能完成一笔交易，这个数据被称为状态
>

+ 共享型状态：只会在当前服务被维护，其它服务共享信息读取但不维护。

通过登陆后将信息存到分布式缓存中，将用户状态变为无服务

+ 流程型状态：状态数据在服务之间会随业务的流程走向而发生状态更改，在特定的流程环节又有相关服务会订阅该数据状态的变化。

服务间尽量保持无状态，这样会好扩展好维护

**支付例子**

![](/images/yuque/0bcd585083b5beab.svg)

## 微服务设计原则
### 高可用
#### 降级兜底
#### 过载保护【熔断】
#### 流量控制（保护下游）【限流】
漏桶算法和令牌桶算法。必要时，需实现分布式限流

#### 快速失败
#### 无状态服务
可以横向扩展，不会成为性能瓶颈

#### 最少依赖
#### 简单可靠
#### 分散原则
一个模块的所有接口应该放到不同服务

#### 隔离原则
#### 幂等原则
#### 故障自愈
#### CAD定理
#### BASE理论
## 📝 【微服务架构】极简科普笔记
### 1. 核心理念：从“全能单体”到“专业团队”
+ **过去（单体架构）：** 就像开一家夫妻店，收银、炒菜、端盘子都在一个大房子里搞定。一旦厨房起火（某个模块崩溃），整个饭店直接关门（系统宕机）。
+ **现在（微服务）：** 就像开一家大企业，分为财务部（User-API）、公关部（Social-API）、安保部（鉴权）。大家不在同一个办公室（不在同一个进程），通过内线电话（RPC/gRPC/网络请求）沟通。哪怕公关部集体辞职，财务部依然能照常发工资。

### 微服务帝国的三大“核心基建”
#### 🏢 ① 注册中心 (Service Registry) —— 企业的“动态通讯录”
因为部门（微服务）随时可能扩建或者搬家（IP地址变化），互相找人不能靠死记硬背（硬编码 IP）。

+ **etcd**：云原生时代的“小猎豹”，Go 语言编写，K8s 的御用大脑，极度轻量快速。（现代首选 🌟）
+ **Consul**：开箱即用的“瑞士军刀”，自带好看的 Web 界面和健康检查。（中小团队最爱）
+ **Zookeeper (ZK)**：前朝的“老将军”，Java 编写，太重太吃资源。现在主要为了照顾 Kafka、Hadoop 等老朋友的“历史包袱”才被迫登场。

#### 📮 ② 消息队列 (Message Queue) —— 系统的“超级缓冲区”
为了防止部门之间因为处理速度不一样而打架，设立了快递中转站（比如 **Kafka**）。它有三大神技：

1. **削峰填谷**：面对除夕夜洪峰，先把千万条消息存起来，让数据库老黄牛按自己的节奏慢慢拉取，防止数据库被瞬间冲垮。
2. **异步处理**：用户点击发送，瞬间扔进队列就返回“成功”，不需要傻等数据库落库，体验极致丝滑。
3. **系统解耦**：发消息的服务只管把数据扔进池子，至于谁来做敏感词审核、谁来做离线推送，发消息的服务统统不管。

#### 🛡️ ③ 容器网络 (Docker Network) —— “内城墙”与“外城门”
+ **内网直连（城墙内）**：微服务之间、微服务和数据库之间，通过“容器名”（如 `mongo`, `kafka`）在 Docker 的虚拟局域网里极速通信。坚决不走公网，安全且免费。
+ **公网暴露（城门）**：只有 API 网关（Nginx / HTTP 服务）或者 WebSocket 服务才通过 `-p` 暴露出公网 IP 端口，作为接待外部用户（手机 App / 浏览器）的唯一入口。

### 微服务的“黑客帝国”代价（Trade-offs）
+ **好处**：无限的水平扩展能力，任何一个服务扛不住了，可以瞬间多跑 10 个容器实例来分担压力。
+ **坏处（你刚经历的痛）**：从“代码级调试”变成了“网络级调试”。各种 `no such host`、端口映射错误、内外网穿透失败。**写业务逻辑只占 30% 的时间，70% 的时间都在和网络配置、运维架构做斗争。**

## 熔断、降级、限流
### 服务问题
+ 服务系统问题：如机器宕机、网络、机房故障，虽然这个是有问题但 概率很小，在面试的时候简单提即可
+ 服务程序问题：如业务响应慢、大量的超时等现象，这些问题主要是因服务程序在执行中因压力、负载过大而导致无法快速处理业务，产生的问题

### 限流
一种保护的策略。在测试下所压测的压力去设置服务的阚值。 超过阚值后，触发限流，一部分流量直接返回

nginx 限流（切入层）

服务端 令牌桶和漏斗等算法限流

#### 限流指标
+ QPS
+ 并发数
+ 响应时间
+ hps
+ TPS

#### 限流层级
用户 -> 界面 -> 接入层 -> 服务

#### 限流方案
+ nginx 限流（接入层）

nginx的限流实现是需要先引入好limit模块，而限流方案就只有两种1是根据控制速率方案、2是控制并发连接数

1. 控制速率方案

```plain
limit_req_zone $binary_remote_addr zone=reqlimit:10m rate=2r/s;
server{
  location / {
    limit_req zone=reqlimit burst=120;
  }
}
```

它是根据ip进行控制，在上面的示例中rate=2r/s表示每个请求ip每秒只能请求两次，其中burst表示每个ip最多有120个突发请求，如果ip在1s内超过2个则会将后多出的请求放在burst队列中等待被处理，如果burst满了则拒绝请求

2. 控制并发连接数

```plain
limit_conn_zone $binary_remote_addr zone=perip:10m;
limit_conn_zone $server_name zone=perserver:10m;
server {
  ...
  limit_conn perip 10;
  limit_conn perserver 100;
}
```

该方式是是根据并发数控制

limit_conn perip10作用的key是$binary_remote_addr，表示限制单个IP同时最多能持有10个连接。

limit_conn perserver 100 作用的key是 $server_name，表示虚拟主机(server)同时能处理并发连接的总数。

+ 令牌桶
1. 以恒定的速率生成token放入桶中，桶满了就丢弃多余令牌。
2. 有请求到达时，从桶中获取一个令牌
3. 若成功（桶里面有令牌），处理请求
4. 若失败（桶里面没有令牌），请求被限流（拒绝或排队等待）
5. 令牌的消耗与请求处理一一对应，处理完一个请求，桶中令牌数减 1。

![](/images/yuque/af3abd58b9c33e54.png)

+ 滑动窗口计数

计算一段时间内的请求数，超过阚值后会拒绝新的请求

![](/images/yuque/f59eeb7a8694b2ac.png)

### 熔断
熔断是一种思想保护机制，在生活中的例子就如保险丝，当电器存在短路或者电流不稳时，保险丝自动的断开保护电器。

![](/images/yuque/7c90d1077c1165e0.png)

在多次请求服务端超过阚值后，熔断器会截断客户端向服务端的请求，不让请求发送至服务端

**开启熔断**

遇到非正常的错误（比如超时等）

**熔断恢复**

一段时间后会放一个请求去服务端，如果可以通过，恢复熔断

**与超时的区别**

+ 超时的目标：**访问目标时不让程序等待过久。**客户端向服务端发送请求，由于服务端存在异常，一直没有返回。客户端为了不让程序一直等待，设置一个超时时间，超过了直接返回错误。如果服务端一直没好，下一次请求还是会一样。
+ 熔断的目标：**访问目标时出现了问题，主动一段时间不去访问。**请求失败后，如果开启了熔断，没有直接去请求服务端，主动直接返回错误异常给客户端。

相同点

+ 系统故障的保护策略
+ 提高系统的可用性和稳定性

不同点

+ 功能区别
+ 处理方式
+ 触发条件
+ 作用范围 

### 降级
通常和熔断配合使用

请求目标后，发现无法访问，直接返回错误影响用户体验，这时可以返回缓存中或者提前写好的固定数据

+ 超时降级
+ 失败次数降级
+ 故障降级
+ 限流降级

![](/images/yuque/21ece453a1c505f9.png)

## 如何发现问题（部署后的问题发现）
1. 日志监控
2. 分布式跟踪
3. 自动化测试

## 链路跟踪
# gRPC
## 什么是RPC
RPC 是 **远程过程调用（Remote Procedure Call）**

### 特性
1. RPC框架用长链接，不需要每次通信都3次握手，减少网络开销
2. RPC框架一般都有注册中心，有丰富的监控管理。发布、下线接口、动态扩展等，对调用方来说是无感知、统一化的操作协议私密，安全性较高
3. RPC协议更简单内容更小，效率更高，服务化架构、服务化治理，RPC框架是一个强力支撑

### 如何实现
如何找到目标服务：通过ip和port确定服务目标

调度目标：调用的是服务的方法：如useSever中的GetUser方法

```go
type Request struct {
    Method string `json:"method"`
    Params interface{} `json:"params"`
    Id string `json:"id"`
}

type Response struct {
    Id string `json:"id"`
    Result string `json:"result"`
    Error error `json:"error"`
}
```

数据可以用 json/xml/binary

rpc服务客户端基于 tcp/udp 及 http/websocket 等网络协议实现

#### 调用流程
![](/images/yuque/014ac1c094f810ac.svg)

#### 核心功能实现
1. **客户端（服务消费端）**：远程调用方法的一端
2. **client stub（桩）：**代理类。把调用方法、类、方法参数等信息传递到服务端。
3. **网络传输：**
4. **服务端Stub（桩）：**这个桩不是代理类。接收到客户端执行方法的请求后，去执行对应的方法然后返回结果给客户端
5. **服务端：**提供远程方法的一端

![](/images/yuque/650114ac6b7cf742.png)

![](/images/yuque/4587eee95c29262e.png)

**具体步骤：**

1. 服务消费者（client客户端）通过本地调用的方式调用服务。
2. 客户端存根（client stub）接收到请求后负责将方法、入参等信息序列化（组装）成能够进行网络传输的消息  
体。
3. 客户端存根（client stub）找到远程的服务地址，并且将消息通过网络发送给服务端。
4. 服务端存根（server stub）收到消息后进行解码（反序列化操作）。
5. 服务端存根（server stub）根据解码结果调用本地的服务进行相关处理。
6. 本地服务执行具体业务逻辑并将处理结果返回给服务端存根（server stub）。
7. 服务端存根（server stub）将返回结果重新打包成消息（序列化）并通过网络发送至消费方。
8. 客户端存根（client stub）接收到消息，并进行解码（反序列化）。
9. 服务消费方得到最终结果。

### 深入解析rpc
#### 序列化技术
（1）作用：网络传输中，数据采用二进制形式，所以调用过程中需要对如蚕对象和返回值对象进行序列化和反序列化

（2）如何？

自定义二进制协议实现序列化

### 存在的问题
+ 缺乏跨语言的支持
+ 缺乏错误处理机制
+ 缺乏服务发现机制
+ 没有清晰的接口语义
+ 没有可热拔插的中间件
+ ……

## gRPC
> **与许多 RPC 系统一样，gRPC 基于定义服务、指定可远程调用的方法及其参数和返回类型的理念。在服务器端，服务器实现此接口并运行 gRPC 服务器来处理客户端调用。在客户端，客户端有一个存根（在某些语言中简称为客户端），它提供与服务器相同的方法**。可以用java创建 gRPC服务器，用Go、Python或Ruby创建客户端
>

**安装**

```powershell
go get github.com/golang/protobuf/proto
go getgoogle.golang.org/grpc（无法使用，用如下命令代替）
	git clone https://github.com/grpc/grpc-go.git $GopATH/src/google.golang.org/grpc
	git clone https://github.com/golang/net.git $GoPATH/src/golang.org/x/net
	git clone https://github.com/golang/text.git $GOPATH/src/golang.org/x/text
	go get -u github.com/golang/protobuf/{proto,protoc-gen-go}
	git clone https://github.com/google/go-genproto.git $GOPATH/src/google.golang.org/genproto
cd $GOPATH/src/
	go install google.golang.org/grpc
go get github.com/golang/protobuf/protoc-gen-go
上面安装好后，会在GOPATH/bin下生成protoc-gen-go.exe
但还需要一个protoc.exe，windows平台编译受限，很难自己手动编译，直接去网站下载一个，地址：
https://github.com/protocolbuffers/protobuf/releases/tag/v3.21.8，
同样放在GOPATH/bin下
```

### 序列化机制
默认情况下，gRPC使用 Protocol Buffers，成熟的开源结构化数据序列化机制

#### 使用
使用 Protocol Buffers 的第一步是在proto 文件中定义要序列化的数据结构：这是一个带有 .proto 扩展名的普通文本文件。Protocol Buffer 数据以消息的形式结构化，其中每个消息都是一个包含一系列名称-值对（称为字段）的小型逻辑信息记录。

### 核心概念
#### gRPC允许的四种服务方法：
+ **一元 RPC**
+ **服务器流式 RPC**

客户端向服务器发送请求获得一个流，用于读取一系列返回的消息。客户端从返回的流中读取，直到没有更多消息。保证单个 RPC 调用中的消息顺序

`rpc LotsOfReplies(HelloRequest) returns (stream HelloResponse);`

+ **客户端流式 RPC**

客户端写入一系列消息并发送到服务器，使用提供的流。客户端完成消息写入后会等待服务器读取消息并返回响应。同样保证单个 RPC 调用中的消息顺序。

`rpc LotsOfGreetings(stream HelloRequest) returns (HelloResponse);`

+ **双向流式 RPC**

双方使用读写流发送一系列消息。两个流独立运行，客户端和服务器可以以任何顺序读写。

`rpc BidiHello(stream HelloRequest) returns (stream HelloResponse);`

#### 使用API
+ 服务器端：服务器实现服务声明的方法，并运行 gRPC 服务器来处理客户端调用。gRPC 基础设施解码传入的请求，执行服务方法，并编码服务响应。
+ 客户端：客户端有一个称为 _存根_（对于某些语言，首选术语是 _客户端_）的本地对象，它实现与服务相同的方法。客户端可以直接在本地对象上调用这些方法，这些方法会将调用参数封装成相应的 Protocol Buffers 消息类型，发送请求到服务器，并返回服务器的 Protocol Buffers 响应。

#### 同步与异步
同步 RPC 调用会阻塞知道服务器响应到达。网络本质上是异步的，在大部分场景下，在不阻塞当前线程的情况下启动 RPC 很有用

#### RPC 生命周期
##### 一元RPC 
客户端发送单个请求并获得单个响应。

1. 一旦客户端调用存根方法，服务器会收到通知，表明 RPC 已被调用，并带有客户端的此调用 [元数据](https://grpc.org.cn/docs/what-is-grpc/core-concepts/#metadata)、方法名称以及适用的指定 [截止时间](https://grpc.org.cn/docs/what-is-grpc/core-concepts/#deadlines)。
2. 服务器随后可以立即发送回自己的初始元数据（必须在任何响应之前发送），或者等待客户端的请求消息。哪个先发生，取决于应用程序。
3. 一旦服务器收到客户端的请求消息，它会执行必要的工作来创建并填充响应。然后，响应（如果成功）与状态详情（状态码和可选状态消息）以及可选的尾随元数据一起返回给客户端。
4. 如果响应状态为 OK，则客户端收到响应，从而在客户端完成调用。

##### 服务器流式 RPC 
与一元 RPC 类似，不同之处在于服务器响应客户端请求时返回的是消息流。发送完所有消息后，服务器的状态详情（状态码和可选状态消息）和可选的尾随元数据会发送给客户端。这表示服务器端处理完成。**客户端在收到所有服务器消息后完成。**

##### 客户端流式 RPC
与一元 RPC 类似，不同之处在于客户端向服务器发送的是消息流而不是单个消息。服务器会返回**单个消息**（连同其状态详情和可选的尾随元数据），**通常（但不一定）**在收到所有客户端消息之后。

#### 元数据
元数据是关于特定 RPC 调用的信息，形式为键值对列表，键是字符串，值通常是字符串，也可以是二进制数据

键不区分大小写，由 ASCII 字母、数字和特殊字符 `-`、`_`、`.` 组成，且不得以 `grpc-` 开头（此部分保留给 gRPC 自身使用）。二进制值键以 `-bin` 结尾，而 ASCII 值键则不以 `-bin` 结尾。

用户定义的元数据不被 gRPC 使用，它允许客户端向服务器提供与调用相关的信息，反之亦然。

#### 通道
gRPC 通道提供与指定主机和端口上的 gRPC 服务器的连接。它在创建客户端存根时使用。客户端可以指定通道参数来修改 gRPC 的默认行为，例如打开或关闭消息压缩。通道具有状态，包括 `connected`（已连接）和 `idle`（空闲）。

gRPC 处理关闭通道的方式是语言相关的。一些语言也允许查询通道状态

### Grpc应用
#### 原理实现
##### 服务端
###### 拦截器
`chainUnaryInterceptors` 多个拦截器按序执行

递归闭包

假设 `interceptors` 长度为 3：`[Int0, Int1, Int2]`，业务逻辑为 `Final`

**step1** `chainUnaryInterceptors` 返回一个闭包。当你真正发起 RPC 调用时，它执行： `interceptors[0](ctx, req, info, getChainUnaryHandler(..., 0, ...))`

**此时状态**：`Int0` 开始执行。它手里拿到的 `handler` 是 `getChainUnaryHandler` 返回的一个待命函数。 

**step2 **`Int0`执行的`handler`是`getChainUnaryHandler`闭包，此时`curr`为0，`len(interceptors)-1`为2，执行`interceptors[1](ctx, req, info, getChainUnaryHandler(..., 1, ...))`

**此时状态**：执行流进入 `Int1`。

**step3 **跟上述一致，递归执行`Int2`

**step4 **执行`Int2`时，此时 `curr = 2`，满足了 `if curr == len(interceptors)-1`。 这一次，`getChainUnaryHandler` 不再返回调用 `interceptors[3]` 的闭包，而是直接返回`**finalHandler**`

**step5 **`Int2` 调用 `handler`，实际上就是直接运行了业务代码 `Final`

```go
func chainUnaryInterceptors(interceptors []UnaryServerInterceptor) UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *UnaryServerInfo, handler UnaryHandler) (any, error) {
		return interceptors[0](ctx, req, info, getChainUnaryHandler(interceptors, 0, info, handler))
	}
}

func getChainUnaryHandler(interceptors []UnaryServerInterceptor, curr int, info *UnaryServerInfo, finalHandler UnaryHandler) UnaryHandler {
	if curr == len(interceptors)-1 {
		return finalHandler
	}
	return func(ctx context.Context, req any) (any, error) {
		return interceptors[curr+1](ctx, req, info, getChainUnaryHandler(interceptors, curr+1, info, finalHandler))
	}
}
```

###### 请求监听处理
整体作用：不断从监听器 `lis` 调用 `Accept()` 获取新连接，并为每个连接开启一个 goroutine 去处理（调用 `handleRawConn`），直到遇到致命错误或服务器关闭。

1. **临时错误重试：**

通过类型断言判断错误是否实现了 `Temporary() bool`（通常是 net.Error 的临时错误）。

若为临时错误，使用指数退避：初始 5ms，每次翻倍，最大限为 1s（`tempDelay = min(tempDelay, 1*time.Second)`）。

日志记录重试信息（加锁 `s.mu.Lock() -> s.printf() -> s.mu.Unlock()`）。

使用 `time.NewTimer(tempDelay)` 等待退避期，同时在 `select` 中监听 `s.quit.Done()`，如果收到退出信号则停止定时器并返回 `nil`，终止 `Serve`。

2. **非临时错误处理：**

记录 `done serving; Accept = %v` 日志（也在 s.mu 保护下）。

若 `s.quit.HasFired()`（表示是正常的停止/优雅停机触发），返回 `nil`（正常退出），否则返回该错误（将向调用者上报）。

成功接收连接时：

3. **将 tempDelay 重置为 0（清除任何退避状态）。**

在开启处理连接的 goroutine 之前调用 `s.serveWG.Add(1)`：这是为了使 `GracefulStop`/停服流程能正确等待或不在 `race` 条件下清理 `s.conns`（注释说明：确保在并发下不会在连接还没被添加到记录中就被置空）。

启动匿名 `goroutine`：调用 `s.handleRawConn(lis.Addr().String(), rawConn)` 处理该原始连接，结束时调用 `s.serveWG.Done()` 以配对前面的 `Add(1)`。

4. **并发与资源管理要点：**

使用 `serveWG` 跟踪为每个连接启动的 goroutine，确保在优雅停机时能等待它们结束或正确同步。

日志调用被 `s.mu` 保护，避免竞态。

在临时错误等待期间监听 `s.quit.Done()`，保证在服务关闭时不会无谓等待完成退避。

```go
	var tempDelay time.Duration // how long to sleep on accept failure
	for {
		rawConn, err := lis.Accept()
		if err != nil {
			if ne, ok := err.(interface {
				Temporary() bool
			}); ok && ne.Temporary() {
				if tempDelay == 0 {
					tempDelay = 5 * time.Millisecond
				} else {
					tempDelay *= 2
					tempDelay = min(tempDelay, 1*time.Second) // 最大为1秒
				}
				s.mu.Lock()
				s.printf("Accept error: %v; retrying in %v", err, tempDelay)
				s.mu.Unlock()
				timer := time.NewTimer(tempDelay)
				select {
				case <-timer.C:
				case <-s.quit.Done(): //管理员按下停止，退出
					timer.Stop()
					return nil
				}
				continue
			}
			s.mu.Lock()
			s.printf("done serving; Accept = %v", err)
			s.mu.Unlock()

			if s.quit.HasFired() {
				return nil
			}
			return err
		}
		tempDelay = 0
        // Start a new goroutine to deal with rawConn so we don't stall this Accept
		// loop goroutine.
		//
		// Make sure we account for the goroutine so GracefulStop doesn't nil out
		// s.conns before this conn can be added.
		s.serveWG.Add(1)
		go func() {
			s.handleRawConn(lis.Addr().String(), rawConn)
			s.serveWG.Done()
		}()
    }
```

![](/images/yuque/3a382997d74489ec.svg)

##### 客户端
###### Grpc注册
通过类库文件`RegistreService`完成注册，调用grpc server去注册

![](/images/yuque/70c1880d5abf9e8d.png)

编译`.proto`文件，生成了`user_grpc.pb.go`的类库文件，`client`端调用类库文件通过grpc调到请求对象。

初始化`clientConn` -> 初始化重试机制和拦截器 -> 初始化`channelz` -> 验证连接协议方式并初始化 -> 设置请求超时 -> 初始化解析器 -> 与服务连接

![](/images/yuque/ce2530e31fe965d6.png)

#### 如何
加载服务 `map[服务名]*serverInfo(map[方法名]方法)`

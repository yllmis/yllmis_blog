---
title: 中间件
date: '2026-10-01'
summary: >-
  分布式键值存储系统etcd认证与鉴权JWThttps://zhuanlan.zhihu.com/p/1932939645169164990一种后台不做存储的前端身份验证的工具分为三部分
  Header Claims Signature创建JWT用户登录后，服务器颁发一个 JWT，客
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/ibo2skf4aw04sfsh'
---
# 分布式键值存储系统
## etcd
# 认证与鉴权
## JWT
[https://zhuanlan.zhihu.com/p/1932939645169164990](https://zhuanlan.zhihu.com/p/1932939645169164990)

> 一种后台不做存储的前端身份验证的工具
>

分为三部分 Header Claims Signature

### 创建JWT
用户登录后，服务器颁发一个 JWT，客户端每次请求都携带它，无需再查数据库做 Session 验证	

### 解析JWT
## cookie session
> **HTTP协议是无状态的，所以要将用户登录成功通过验证后，将一些代表用户身份的信息保存在客户端或者服务器，实现验证对受限网站的访问功能等**
>

### cookie session的区别
> cookie存在客户端，容易被盗取，而且只有4kb较小
>
> session存在服务端，可存量大
>

![画板](/images/yuque/ae11f48a2852e1e5.jpg)

#### cookie
**在本地计算机保存一些用户操作的历史信息（当然包括登录信息）**，**并在用户再次访问该站点时浏览器通过 HTTP 协议将本地 cookie 内容发送给服务器，从而完成验证**，或继续上一步操作。

cookie有时间限制，根据生命周期分为会话cookie和持久cookie

**会话cookie：**不设置过期时间，生命周期为创建浏览器到关闭为止，只要一关闭，cookie就会消失，一般不保存在硬盘而是内存

**持久cookie：**设置了过期时间（`setMaxAge (606024)`），就会把cookie保存到硬盘上，**关闭后再次打开浏览器，这些 cookie 依然有效直到超过设定的过期时间**。**存储在硬盘上的 cookie 可以在不同的浏览器进程间共享**，比如两个 IE 窗口。而对于保存在内存的 cookie，不同的浏览器有不同的处理方式。

**设置cookie：**通过net/http包`http.SetCookie(w ResponseWriter, cookie *Cookie)`，

cookie是一个struct

```go

type Cookie struct {
    Name  string      // Cookie的名称，用于唯一标识一个Cookie
    Value string      // Cookie的值，存储在Cookie中的具体数据

    Path       string    // Cookie的路径，指定了哪些路径下的页面可以访问该Cookie
    Domain     string    // Cookie的域，指定了哪些域名下可以访问该Cookie
    Expires    time.Time // Cookie的过期时间，表示Cookie在何时之前有效
    RawExpires string    // 仅用于读取Cookie，保存未解析的过期时间信息

    // MaxAge=0 表示没有指定'Max-Age'属性
    // MaxAge<0 表示立即删除Cookie，相当于 'Max-Age: 0'
    // MaxAge>0 表示'Max-Age'属性存在，并以秒为单位给出
    MaxAge   int

    Secure   bool   // Secure属性，指定是否只在使用HTTPS协议时才发送Cookie
    HttpOnly bool   // HttpOnly属性，设置为true时，禁止通过JavaScript访问该Cookie

    SameSite SameSite // SameSite属性，控制是否允许跨站发送Cookie

    Raw      string   // 保存未解析的原始Cookie字符串
    Unparsed []string // 保存未解析的属性-值对文本
}
```

#### session
session，简而言之就是在服务器上保存用户操作的历史信息。**服务器使用 session id 来标识 session，session id 由服务器负责产生，保证随机性与唯一性，相当于一个随机密钥，避免在握手或传输中暴露用户真实密码**。但该方式下，仍然需要将发送请求的客户端与 session 进行对应，所以可以**借助 cookie 机制来获取客户端的标识（即 session id）**，也可以**通过 GET 方式将 id 提交给服务器**。

可能使用类似散列表也可能就是散列表的形式存储

**session存储的方式多种多样, 可以是数据库、缓存、硬盘等等**

**客户端如何将session-id传给服务端**

+ 最佳方式session 通过 cookie，在客户端保存 session id，而将用户的其他会话消息保存在服务端的 session 对象中，与此相对的，cookie 需要将所有信息都保存在客户端。
+ 也可以考虑放 Header，比如说在 Header 里面带一个 session_id。这就需要前端的研发记得在 Header 里面带上。
+ 还可以考虑放查询参数，也就是 ?session_id=xxx。

![](/images/yuque/1f0ee860a6fc15dc.png)

#### [Gin框架中的session](https://www.yuque.com/yllmis/uw8ppk/wdcoanlfsyht3zpp)

[Gin](https://www.yuque.com/yllmis/uw8ppk/wdcoanlfsyht3zpp)

# 性能监控
在业界中针对系统服务的监控有Prometheus+Grafana的方案来解决前面提到的问题，是一个开源的系统监控和警报工具包

+ 系统指标：如cpu利用率、内存使用情况、io、流量等
+ go程序：htp请求时间、内存分配、使用情况

####  prometheus VS ELK
[ELK](https://www.yuque.com/yllmis/uw8ppk/hh3bkdogpb7hhwhv)

1. 数据类型：
    - Prometheus主要用于监控指标数据，例如系统资源利用率、性能指标等，它以时间序列数据模型存储和查询监控数据。
    - ELK则主要用于日志管理和分析，它通过Logstash收集、处理和存储日志数据，然后使用Elasticsearch进行搜 索和分析，并通过Kibana进行可视化。
2. 查询语言：
    - Prometheus使用PromQL作为查询语言，专门针对时间序列数据的查询和分析。
    - ELK使用Elasticsearch的查询语言，通常用于搜索和分析文本日志数据。
3. 监控方式：
    - Prometheus采用pull模型，即由Prometheus服务器定期从被监控的目标上拉取数据。
    - ELK可以使用push或pull模型，可以通过Filebeat等工具将日志数据推送到Logstash，也可以通过Logstash主动拉取日志数据。
4. 优缺点：
    - Prometheus的优点包括高效的时间序列数据存储和查询、内置的监控指标和警报功能、易于部署和配置等。缺点包括不适合存储大量的非时间序列数据、对于日志数据的处理能力有限。
    - ELK的优点包括强大的日志搜索和分析功能、支持多种数据类型的处理、灵活的数据处理管道等。缺点包括对于时间序列数据的存储和查询性能不如Prometheus、配置和管理相对复杂。

#### 信息采集
1. 直接采集

直接采集：就是埋点式的，服务通过调用prometheus的客户端，在自己的应用程序中埋点采集，然后对外暴露出metrics接口，以便于prometheus采集收集，如：etcd、kubenetes、docker以及接下来的案例

2. 间接采集

间接采集：一些成熟软件不好直接去更改内部设置如redis、mysql，那么这个时候需采用间接采集的方式，prometheus就需要用到exporter如mysql-exporter，根据各个服务的特点采集相关的数据

# 消息队列
## RabbitMQ / Kafka / RocketMQ 对比
### 一句话定位
| 中间件 | 设计目标 | 核心场景 |
| --- | --- | --- |
| **RabbitMQ** | 轻量级消息代理，灵活路由 | 企业应用解耦、任务分发、延时消息 |
| **Kafka** | 高吞吐分布式日志系统 | 消息队列、日志收集、流处理、事件溯源 |
| **RocketMQ** | 阿里系高可用消息平台 | 电商交易、金融级可靠投递 |

### 核心对比
| 对比项 | RabbitMQ | Kafka | RocketMQ |
| --- | --- | --- | --- |
| 吞吐量 | 万级/秒 | **百万级/秒** | 十万级/秒 |
| 消息模型 | Exchange + Queue（路由） | **Topic + Partition（分区日志）** | Topic + Queue |
| 顺序消费 | 单 Queue 内有序 | **单 Partition 内有序** | 单 Queue 内有序 |
| 消息确认 | 消费后 ACK，删除消息 | **Offset 提交**，消息不删除 | 消费后 ACK |
| 消息回溯 | 不支持 | **按 Offset/Timestamp 回溯** | 支持有限回溯 |
| 延迟消息 | 插件支持 | 不支持 | **内置延时级别** |
| 堆积能力 | 一般，堆积影响性能 | **极强，基于磁盘顺序读写** | 强 |
| 客户端语言 | 多语言（Erlang 实现） | 多语言（Java/Scala 原生） | Java 为主 |
| 复杂性 | 低，开箱即用 | **中高，需配置调优** | 中 |

### 记忆口诀
**RabbitMQ 路由灵活，Kafka 吞吐称王，RocketMQ 可靠第一**

+ RabbitMQ 适合小规模、路由复杂的业务场景
+ Kafka 适合大吞吐、日志/消息流、可回溯的场景
+ RocketMQ 适合阿里系电商场景，事务消息和延迟消息是差异点

---

## Kafka 核心知识点
### 1. 基础架构
```plain
Producer → Topic(Partition0, Partition1, Partition2) → Consumer Group
                            ↓
                          Broker 集群
```

**五个核心角色：**

+ **Producer**：生产者，发送消息到 Topic
+ **Broker**：Kafka 服务器节点，存储消息
+ **Topic**：消息的分类，一个 Topic 分多个 Partition
+ **Consumer Group**：消费者组，组内消费者分摊 Partition（一个 Partition 只能被组内一个消费者消费）
+ **ZooKeeper / KRaft**：元数据管理（3.0+ 可以去掉 ZK）

### 2. Partition 机制
**为什么 Kafka 吞吐高？**

核心在于 Partition 的并行性和顺序写磁盘：

+ 一个 Topic 分成多个 Partition，每个 Partition 对应一个文件
+ 生产者可以并行写入不同 Partition
+ 消费者组内不同消费者可并行消费不同 Partition
+ **磁盘顺序写**（顺序追加到文件末尾），比随机写快几个数量级

**没有传 Partition Key 会怎样？**

没传 key 消息轮询分配到不同 Partition，同一会话的消息可能落在不同 Partition，失去 Partition 内的顺序保证。

### 3. Offset 和消息不丢失
**消息丢失的三个环节：**

| 环节 | 怎么丢的 | 怎么防 |
| --- | --- | --- |
| **生产端** | 网络分区、Leader 选举 | `acks=all`
（等待所有副本确认）+ 重试 |
| **Broker** | 磁盘损坏、未刷盘 | 副本机制（`replication.factor >= 2`
）+ ISR |
| **消费端** | 处理完前提交 Offset | 改为处理完再提交（手动提交） |

### 4. ISR 机制
+ **ISR（In-Sync Replicas）**：与 Leader 保持同步的副本列表
+ Leader 挂了，从 ISR 中选新 Leader
+ `min.insync.replicas` 控制最小同步副本数（配合 `acks=all` 使用）
+ 如果写入时 ISR 数不足，Producer 会报错

### 5. Kafka 为什么快
1. **磁盘顺序写**：消息追加到 Partition 文件末尾，顺序写 ≈ 内存写速度
2. **零拷贝（Zero Copy）**：消费时数据从磁盘到网卡，不经用户态内存，省去多次拷贝
3. **页缓存（Page Cache）**：利用操作系统页缓存，读写命中缓存时不用走磁盘
4. **批量压缩**：Producer 批量发送，Broker 批量存储，减少网络和磁盘 IO
5. **Partition 并行**：多个 Partition 提供并行读写能力

### 6. Kafka 在 IM 项目中的角色
[即时通讯系统](https://www.yuque.com/yllmis/uw8ppk/fw2fs2iast5g04qs)

**消息流：**

```plain
客户端 → WS Server → Kafka(MsgChatTransfer) → Task Consumer → MongoDB + WS Push
```

**作用：**

1. **削峰填谷**：客户端发消息先写 Kafka，消费者异步处理，防止突发流量打垮后端
2. **解耦**：WS Server 不需要关心消息是否成功持久化，只管扔给 Kafka
3. **异步化**：消息写入 Kafka 后立即返回客户端"发送成功"，实际落地在消费者

**架构局限：**

1. 没传 Partition Key，同一会话消息不能保证顺序
2. `acks` 用的默认值（可能是 1），极端情况可能丢消息
3. 没有设计死信队列，消息处理失败就丢了

### 7. 常见面试题
**Q: Kafka 和传统消息队列的区别？**  
A: 设计差异。Kafka 面向日志流设计——消息不删除、可回溯、靠 Offset 管理进度。传统 MQ 面向任务分发，消费后删除。所以 Kafka 适合日志收集、事件溯源、流处理，不适合延时消息和任务调度。

**Q: 如何保证消息顺序？**  
A: 同一 Partition 内有序。想让同一会话有序，Producer 指定 `key=conversationId`，相同 key 的消息进入同一 Partition。

**Q: 怎么保证消息不重复消费？**  
A: Kafka 保证 At Least Once（至少一次），允许重复。幂等 Producer（`enable.idempotence=true`）防生产端重复，消费端需要自己实现业务幂等。

**Q: Kafka 如何保证高可用？**  
A: Partition 多副本（replication factor ≥ 2），Leader 宕机时从 ISR 中选举新 Leader。

**Q: 什么是 Rebalance？**  
A: 消费者组内成员变化（加入/退出）时，Partition 重新分配。期间该消费者组不可用。减少 Rebalance 的方法：提高 `session.timeout.ms`、使用静态成员分组。

# ELK日志系统
```dockerfile
services:
  elasticsearch:
    image: elasticsearch:7.17.4
    volumes:
      - /etc/localtime:/etc/localtime
      - ./components/elasticsearch/data:/usr/share/elasticsearch/data
    ports:
      - '9200:9200'
      - '9300:9300'
    container_name: elasticsearch
    restart: always
    environment:
      - 'cluster.name=elasticsearch'
      - 'discovery.type=single-node'
      - 'ES_JAVA_OPTS=-Xms1024m -Xmx1024m'
    networks:
      // TODO

  kibana:
    image: kibana:7.17.4
    container_name: kibana
    restart: always
    volumes:
      - /etc/localtime:/etc/localtime
      - ./components/kibana/kibana.yml:/usr/share/kibana/config/kibana.yml
    ports:
      - '5601:5601'
    links:
      - elasticsearch
    depends_on:
      - elasticsearch
    networks:
      //TODO
```

![](/images/yuque/c81ec4220ec81a78.png)

+ Elasticsearch：负责日志检索和储存

+ Kibana：负责日志的可视化

+ Logstash : 日志收集 

首先需要定义好配置文件（拉取镜像或者安装好后已经有默认配置，可以自定义）	

Logstash本身可以采集日志，但是它是java编写的因此程序本身是重量级，所以在业界中并没有直接去采用它采集日志信息，而是采用了用go所编写的系列beats产品。官网地址：[https://www.elastic.co/cn/beats/](https://www.elastic.co/cn/beats/)

其中如下两个应用较多：

    - FileBeat：用于采集日志和其他数据的轻量级采集器
    - Metricbeat：用于系统服务指标数据采集器

FileBeat应用

+ harvester：负责读取单个文件的内容
+ inpust：输入负责管理harvester并查找所有可读取的资源

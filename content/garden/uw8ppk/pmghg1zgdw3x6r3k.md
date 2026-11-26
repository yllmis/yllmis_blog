---
title: Go语言生态
date: '2026-07-02'
summary: >-
  框架WebGin框架Gin框架是基于net/http包实现的，所有应该先对这个包有所了解web框架是基于 客户端-服务端TODO
  ListGin.Context 为什么用 sync.Pool？不用会怎样？中间件的 c.Next() 和 c.Abort() 如何协作？
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/pmghg1zgdw3x6r3k'
---
# 框架
## Web
### Gin框架
> Gin框架是基于net/http包实现的，所有应该先对这个包有所了解
>
> web框架是基于 客户端-服务端
>

#### TODO List
- [ ] Gin.Context 为什么用 sync.Pool？不用会怎样？
- [ ] 中间件的 `c.Next()` 和 `c.Abort()` 如何协作？
- [ ] 路由树如何实现 `/user/:id` 和 `/user/static` 的优先级？

#### net/http 包
##### 服务器端
Request：用户请求的信息，用来解析用户的请求信息，包括 post、get、cookie、url 等信息

Response：服务器需要反馈给客户端的信息

Conn：用户的每次请求链接

Handler：处理请求和生成返回信息的处理逻辑

##### Go 如何让web运行起来
三个问题

1. **如何监听端口**

运行`ListernAndServe`函数，

底层是初始化一个server，调用`net.Listen("tcp", addr)`，利用 TCP 构建起一个服务	

2. **如何接受客户端请求**

监听完端口后，调用`Serve`函数，内部有`for{}`通过Listen监听客户端的请求，创建一个Conn链接`c, err := srv.newConn(rw)`，然后单独创建一个goroutine，把请求的数据当做参数给 conn 服务 `go c.serve`

```go
func (srv *Server) Serve(l net.Listener) error {
    defer l.Close()
    var tempDelay time.Duration // how long to sleep on accept failure
    for {
        rw, e := l.Accept()
        if e != nil {
            if ne, ok := e.(net.Error); ok && ne.Temporary() {
                if tempDelay == 0 {
                    tempDelay = 5 * time.Millisecond
                } else {
                    tempDelay *= 2
                }
                if max := 1 * time.Second; tempDelay > max {
                    tempDelay = max
                }
                log.Printf("http: Accept error: %v; retrying in %v", e, tempDelay)
                time.Sleep(tempDelay)
                continue
            }
            return e
        }
        tempDelay = 0
        c, err := srv.newConn(rw) //客户端的每次请求都会创建一个 Conn
        if err != nil {
            continue
        }
        go c.serve()
    }
}
```

3. **如何分配handler**

conn 解析 request，获取到响应的handler，也是`ListenAndServe`的第二个参数，如果为`nil`，则默认获取到`handler = DefaultServeMux`，这是个路由器，当请求 uri 为 "/"，路由就会转到函数 sayhelloName，DefaultServeMux 会调用 ServeHTTP 方法，这个方法内部其实就是调用 sayhelloName 本身

**详解：**

我们自己定义的函数 `func sayhelloName(w http.ResponseWriter, r *http.Request)`

在调用`http.HandleFunc("/", sayhelloName)`时

`DefaultServeMux.Handle("/", HandlerFunc(sayhelloName))`

→  我们调用了 HandlerFunc (f), 强制类型转换 f 成为 HandlerFunc 类型，这样 f 就拥有了 ServeHTTP 方法。（HandlerFunc类型默认实现了ServeHTTP）

1. 这个新值（类型为 `HandlerFunc`）被存入 `ServeMux` 的路由表。
2. 当请求到来时：

```go
handler := mux.match(r.URL.Path) // 得到 HandlerFunc(sayhelloName)
handler.ServeHTTP(w, r)          // 调用 HandlerFunc.ServeHTTP
```

3. ServeHTTP此时

```go
func (f HandlerFunc) ServeHTTP(w, r) {
    f(w, r) // ← 此时 f 的值就是 sayhelloName，所以等价于 sayhelloName(w, r)
}
```

#### Gin框架中的session
Gin框架没有内置session的支持，需要第三方的Session中间件，常用的是`github.com/gin-contrib/sessions` 

###### Session和Store
> **在Web应用中，会话（session）是一种用于在不同请求之间存储和共享用户信息的机制。通常，会话用于跟踪用户的身份验证状态、存储用户首选项和其他与用户相关的数据。在Gin框架中，会话的管理通常通过**`**session**`**和**`**store**`**两个概念来完成。**
>

###### 5.1 会话（Session）
+ **概念：** 会话是在服务器端存储用户状态的一种机制。每个用户访问网站时，服务器都会为其创建一个唯一的会话标识符（session-id），该标识符存储在用户的浏览器中，通常通过Cookie来实现。服务器可以根据这个标识符来识别用户，并在多个请求之间共享用户的状态信息。
+ **作用：** 主要用于存储用户的身份验证状态、用户的首选项、购物车内容等用户相关的信息，以便在用户访问不同页面或进行不同请求时能够保持一致的用户状态。

###### 5.2 存储（Store）
+ **概念：** 存储是用于实际存储和检索会话数据的地方。存储可以是内存、数据库、文件系统等，具体取决于应用程序的需求。存储负责维护会话数据的持久性和安全性。
+ **作用：** 存储的主要作用是提供对会话数据的 CRUD（Create、Read、Update、Delete）操作。当用户发起请求时，存储会根据会话标识符检索相应的会话数据，服务器可以通过存储来实现会话的管理。

除了Cookie存储，`github.com/gin-contrib/sessions` 还支持其他存储引擎，例如**Redis、文件系统**等。可以根据实际需求选择合适的存储引擎。

基本使用示例

```go
package main

import (
    "github.com/gin-contrib/sessions"
    "github.com/gin-contrib/sessions/cookie"
    "github.com/gin-gonic/gin"
    "net/http"
    "time"
)

func main() {
    // 创建Gin引擎
    r := gin.Default()

    // 使用Cookie存储Session
    store := cookie.NewStore([]byte("secret"))//创建了一个基于Cookie的存储引擎，使用了一个密钥来加密Cookie中的会话数据。
    r.Use(sessions.Sessions("mysession", store))

    // 路由：设置Session
    r.GET("/set", func(c *gin.Context) {
        // 获取默认Session
        session := sessions.Default(c)
        
        // 设置Session中的键值对
        session.Set("user", "example@example.com")
        session.Set("expires", time.Now().Add(24*time.Hour).Unix())
        
        // 保存Session
        session.Save()

        // 返回JSON响应
        c.JSON(http.StatusOK, gin.H{"message": "Session set successfully"})
    })

    // 路由：获取Session
    r.GET("/get", func(c *gin.Context) {
        // 获取默认Session
        session := sessions.Default(c)
        
        // 从Session中获取键值对
        user := session.Get("user")
        expires := session.Get("expires")

        // 返回JSON响应
        c.JSON(http.StatusOK, gin.H{"user": user, "expires": expires})
    })

    // 启动Gin应用，监听端口8080
    r.Run(":8080")
}

```

其它存储引擎

```go
// 使用Redis存储Session的例子
import (
    "github.com/gin-contrib/sessions"
    "github.com/gin-contrib/sessions/redis"
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    // 使用Redis存储Session
    store, _ := redis.NewStore(10, "tcp", "localhost:6379", "", []byte("secret"))
    r.Use(sessions.Sessions("mysession", store))

    // ...
}
```

在实际项目中，选择存储引擎时要考虑性能、可扩展性和持久性等因素。 Cookie 存储适用于小型应用，而对于大型应用，可能需要选择支持分布式的存储引擎，如 Redis。

## 微服务
### go-zero
[go-zero 文档](https://go-zero.dev/zh-cn/)

:::info
框架的选择在于1. 官方的更新维护 2. 社区发展运营 3. 框架热度 4. 框架上手难度 5. 框架功能

:::

> 目的在于解决微服务架构下的一些问题：  （避免重复性造轮子）
>
> + 服务rpc通讯
> + 服务发现
> + 负载均衡
> + 链路跟踪
> + 熔断降级
> + ……
>
> grpc是rpc框架 主要解决rpc通讯中的问题。没有集成链路跟踪、数据读写功能
>

#### 功能
+ web框架核心功能
+ 服务发现注册
+ 链路跟踪
+ 熔断
+ ……

基于微服务架构，服务与服务之间

##### 熔断实现原理
+ 理解熔断机制

![](/images/yuque/189fd07c55689297.png)

+ 源码解析
    - 自适应算法：核心思想通过与googlesre提供的自适应熔断算法来**计算丢弃请求的概率**

$ \max\left(0,\ \frac{\text{requests} - K \times \text{accepts}}{\text{requests} + 1}\right) $

        * requests：一定时间内的请求总数
        * accepts：请求后成功的响应次数
        * k是一个常量，一个敏感度。K越小，越容易丢失请求，一般推荐设置在 1.5～2.0

![](/images/yuque/03d5ca1cf409d7b3.png)

**三个状态**

![](/images/yuque/c7ef2ebc47857120.png)

##### 限流实现
**go-zero实现**

+ channel 

通过有缓存的通道进行阻塞限流。使用时`TryBorrow()`和`Return`需要成对存在

+ 令牌桶（基于redis【rua脚本】）如果redis出现问题，会用内部自己的实现兜底

![](/images/yuque/46151326b0b97bb8.png)

+ 滑动窗口限流（基于redis【rua脚本】）

###### 降级
+ 服务端（框架中已有实现）
    - api中间件应用
    - rpc拦截器应用
+ 客户端
    - 结合熔断器使用（本质是执行失败后的回调函数）【会导致代码入侵】
        * `DoWithFallback` 
        * `DoWithFallbackAcceptable`

该降级方案是自动降级，它是根据系统cpu与最大并发数是否过载来判断是否进行降级，如果达到则就会进行降级。在`adaptiveshedder.go` 同级下存在`adaptiveshedder_test.go`单例测试的方法

该单列测试的示例中就描述了降级的使用方式，其中关键代码为如下

```go
//创建降级器
shedder := NewAdaptiveShedder(
    Withwindow(bucketDuration),
    WithBuckets(buckets),
    WithCpuThreshold(10),
)
//验证是否降级
promise, err := shedder.Allow()// 请求正常的时候执行
promise.Fail()
// 请求异常的时候执行
promise.Pass()
```

##### 自动降级的实现
+ 目标与指标
    - 目标
        * 保证系统不被拖垮
        * 系统稳定的前提下，保持系统吞吐量
    - 指标 
        * cpu是否过载
        * 最大并发数是否过载
+ 实现分析 - **滑动平均算法**

在go-zero中则采用的是滑动平均算法来计算负载情况，它的特点是无需要记录所有历史局部信息，它是用来估算变量的局部均值以此来验证是否过载，非常节省资源。

$ v_t = \beta \cdot v_{t-1} + (1 - \beta) \cdot \theta_t
 $  EWMA 作为迟滞机制，防止降载器在负载波动时频繁抖动

β：常量，范围 [0,1)。通常取0.9

v_t：在某时刻的并发数，vt即在t时刻的并发数。  大于阚值并且实际并发数也大于阚值后触发降级

```plain
可以简单理解为并发数，但不是精确的当前并发数，而是一个"带惯性的并发数"。
直观理解
假设实际在飞请求数（flying）随时间变化：
时刻    flying(实际)    avgFlying(平滑)
t=0        0               0
t=1       100              10    (0.9×0 + 0.1×100 = 10)
t=2       100              19    (0.9×10 + 0.1×100 = 19)
t=3       100              27    (0.9×19 + 0.1×100 = 27)
t=4       100              34    ...
t=5       100              41
...       100              慢慢趋近100

```

$ v_{t-1} $：上一次的平滑值

$ \theta_t
 $：当前实际在飞请求数（瞬时值）

只有 $ v_t $ 超标：$ v_t $ 有惯性，可能实际并发已经降下来了但 $ v_t $ 还没跟上，误判  
只有 flying 超标：可能只是瞬间毛刺，下一秒就恢复了，过度敏感  
两个都超标：确认系统真的过载了，才降载

![](/images/yuque/f2405b9dd18c7cac.png)

###### 源码
![](/images/yuque/1baa043313c774ff.png)

###### 链路跟踪实现
###### 设计思路
![](/images/yuque/27f8f93fd39bd837.png)

###### 具体技术实现
+ 代码少且无入侵
    - AOP思想 与 封装执行（常用中间件）
+ 信息在内部及外程序的传递如何实现
    - 服务内传递用context，服务外传递基于请求头

##### prometheus组件与数据采集器
##### 与ELK的相结合
**本地日志 filebeat拉取推送至logstash**

![](/images/yuque/d4133197e0294164.png)

**基于自定义日志输出**

![](/images/yuque/7df342a82542125f.png)

中间件可以是kafka之类的

```go
type redisIoWriter struct {
	redisKey string
	redis    *redis.Redis
}

func NewRedisIoWriter(redisKey string, rediscfg redis.RedisConf) io.Writer {
	return &redisIoWriter{
		redisKey: redisKey,
		redis:    redis.MustNewRedis(rediscfg),
	}
}

func (r *redisIoWriter) Write(p []byte) (n int, err error) {
	// 写日志
	go r.redis.Rpush(r.redisKey, string(p))

	return 0, nil
}

```

基于go-zero的日志扩展

+ 基于logx.writer 扩展
+ 基于io.writer 扩展（简单）

### Tars-Go
### Dubbo-Go
### Kratos

## 数据库操作
### Gorm
> **学习gorm前，先去学习database/sql库，gorm高度依赖该库，在进行一些故障排查时可以深入了解错误来源**
>

****

#### 介绍
<details class="lake-collapse"><summary id="u7e4c01e8">什么是gorm，先了解一下什么是orm</summary><ol class="ne-ol"><li id="ub0847643" data-lake-index-type="0">orm：将数据库中具体的某一个表结构变成结构体，将对表的操作变成对结构体的操作，高内聚、低耦合</li><li id="u3d5b8b2f" data-lake-index-type="0">gorm提供的功能</li></ol><ol class="ne-list-wrap"><ol ne-level="1" class="ne-ol"><li id="u947d27e4" data-lake-index-type="0">链式操作，降低写sql的难度</li><li id="ua343b5d6" data-lake-index-type="0">作参数转义，变相降低sql注入的风险</li><li id="u0ed495ac" data-lake-index-type="0">维持了MySql的链接池	</li></ol></ol><ol start="3" class="ne-ol"><li id="u2ae60dd1" data-lake-index-type="0">优势：提高了对数据库操作的便捷性</li><li id="u46bebbec" data-lake-index-type="0">问题：降低了写sql的能力</li></ol></details>

#### 写原生
<details class="lake-collapse"><summary id="ua4243010">Raw()</summary><p id="uca6da8d9" class="ne-p">执行任意sql语句 </p><p id="ue83d0fa2" class="ne-p"></p><p id="u2ef211c7" class="ne-p">缺点：</p><ol class="ne-ol"><li id="ua2d1defb" data-lake-index-type="0">如果直接使用用户输入拼接SQL语句，容易受到SQL注入攻击</li><li id="ucd3c01af" data-lake-index-type="0">复杂的原生SQL语句难以阅读和维护（维护成本）</li></ol></details>
<details class="lake-collapse"><summary id="u5ee4e4b3">Exec()</summary><p id="u4e3d8ee5" class="ne-p">执行不带返回结果的SQL语句，如INSERT、UPDATE、DELETE等操作</p><p id="u9e0d5e15" class="ne-p"></p><p id="uc18eb2f3" class="ne-p">缺点：</p><ol class="ne-ol"><li id="ue97fc795" data-lake-index-type="0" style="text-align: left">不适用于带返回结果的查询：Exec()方法主要用于执行不带返回结果的语句，对于需要处理查询结果的场景不太适用。</li><li id="ua7d9c3bc" data-lake-index-type="0" style="text-align: left">功能限制：相对于Raw()方法，Exec()方法的灵活性较低，无法充分利用数据库的特性或进行性能优化。</li><li id="u884a4707" data-lake-index-type="0" style="text-align: left">事务依赖：如果需要使用事务来确保操作的原子性，必须依赖GORM的事务处理机制，可能影响性能。</li></ol></details>
#### 用法
+ **Pluck**方法，查询单列数据，将每一行的数据存到切片当中
+ 

# 自研（原因）
:::info
为什么需要自研框架？在目前市面上有很多成熟且已经应用到实际的框架，那为什么还需要自研呢？

大部分时候自研框架是为了适应公司内部的需求，比如腾讯的tars-go和阿里的dubbo-go等

其次是在学习的时候，自研一款框架，能够更好的将框架应用理论落地到实践，在自研中探索框架要解决的问题，和实现功能时可能遇到的问题及如何去解决

+ 提升认知
+ 定制化满足需求
+ 可扩展性和灵活性
+ 技术核心竞争力

:::

## 框架核心结构设计
> 目录的规划设计是为了提高代码的可维护性、可扩展性和可读性。合理的规划设计可以更容易理解和定位代码，减少开发中的混乱和错误。
>

+ 分层结构 （根据代码功能，例如：控制层（control），视图层（view），模型层（model）；
+ 模块化设计（根据业务划分各个模块，根据模块定义各个层级）
+ 通用组件目录（公共组件，公共操作，封装起来供整个项目使用）
+ 配置文件目录

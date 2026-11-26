---
title: 投票系统
date: '2026-05-16'
summary: >-
  项目视频：https://www.bilibili.com/video/BV1Xi421Z72A?spm_id_from=333.788.videopod.sections&amp;vd_source=c24b6c855005f1f78ff149d24cd409f6构建项目day
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/cg9gn6bimlv8loog'
---
项目视频：[https://www.bilibili.com/video/BV1Xi421Z72A?spm_id_from=333.788.videopod.sections&vd_source=c24b6c855005f1f78ff149d24cd409f6](https://www.bilibili.com/video/BV1Xi421Z72A?spm_id_from=333.788.videopod.sections&vd_source=c24b6c855005f1f78ff149d24cd409f6)

## 构建项目
### day01
使用gorm链接数据库，可以利用 [gotool](https://www.gotool.top/)快速将表sql语句转为gorm

在项目中可以使用 MVC 架构 

[MVC模式](https://www.yuque.com/yllmis/uw8ppk/mnx401tyaz7hr9rz)

在首页时，逻辑层代码需判断是否登录，若没有，利用 `Redirect`方法重定向至登录界面

登录成功后，利用[cookie](https://www.yuque.com/yllmis/uw8ppk/wksxnbyo29r5ssmg)保存登录状态

### day02
表之间的关系：投票和选项之间1对多，用户和投票之间多对多（多对多必须三张表）

投票系统中：user-vote_opt-vote_opt_user 

```go
├── app
│   ├── app.go
│   ├── logic
│   │   ├── index.go
│   │   └── login.go
│   ├── model
│   │   ├── db.go
│   │   ├── model.go
│   │   ├── user.go
│   │   ├── vote.go
│   │   └── vote_test.go
│   ├── router
│   │   └── router.go
│   ├── tools
│   │   └── ecode.go
│   └── view
│       ├── index.tmpl
│       ├── login.tmpl
│       └── vote.tmpl
├── go.mod
├── go.sum
└── main.go
```

将表转化为结构体都放入 `model.go`的文件中

从数据库中查询数据传到前端接口

### day03
#### 新增写入功能
根据页面 id 查询选项，通过cookie查询用户id， 获取POST请求中的投票项 id 和选项提交 id（前端页面中的 value 值），获取时要和 name 字段一样

v0版本完结

#### v1版本
+ 将cookie转为 session 
    - [ ] cookie 和 session区别
    - [ ] 

困难：遇到了前端错误，一直再找bug，和视频中的不同，需要加一段防止默认提交后出现不可跳转的情况

### day04
#### 业务代码：团队开始项目前会开发一个统一的工具包，统一管理统一使用
gorm事务

1.开启事务管道，回滚提交

```go
// 使用gorm中最常用的事务方法
func DoVote(userId int64, voteId int64, optIds []int64) bool {
	tx := Conn.Begin()
	// 记录用户投票行为
	var ret Vote
	if err := tx.Table("vote").Where("id = ?", userId).First(&ret).Error; err != nil {
		fmt.Printf("查询失败, err:%s\n", err.Error())
		tx.Rollback()
	}

	// 更新选项投票数
	for _, value := range optIds {
		if err := Conn.Table("vote_opt").Where("id = ?", value).UpdateColumn("count", gorm.Expr("count + ?", 1)).Error; err != nil {
			fmt.Printf("更新选项投票数失败, err:%s\n", err.Error())
			tx.Rollback()
		}
		user := VoteOptUser{
			UserId:     userId,
			VoteId:     voteId,
			VoteOptId:  value,
			CreateTime: time.Now(),
		}
		_ = Conn.Create(&user).Error // 记录用户投票选项
	}
	tx.Commit()
	return true
}
```

2.自动回滚提交

```go
// 匿名函数 事务方法 好处：代码更简洁，自动提交或回滚
func DoVote2(userId int64, voteId int64, optIds []int64) bool {
	if err := Conn.Transaction(func(tx *gorm.DB) error {
		// 记录用户投票行为
		var ret Vote
		if err := tx.Table("vote").Where("id = ?", userId).First(&ret).Error; err != nil {
			fmt.Printf("查询失败, err:%s\n", err.Error())
			return err
		}

		// 更新选项投票数
		for _, value := range optIds {
			if err := Conn.Table("vote_opt").Where("id = ?", value).UpdateColumn("count", gorm.Expr("count + ?", 1)).Error; err != nil {
				fmt.Printf("更新选项投票数失败, err:%s\n", err.Error())
				return err
			}
			user := VoteOptUser{
				UserId:     userId,
				VoteId:     voteId,
				VoteOptId:  value,
				CreateTime: time.Now(),
			}
			_ = Conn.Create(&user).Error // 记录用户投票选项
		}
		return nil // 无错误则提交
	}); err != nil {
		return false
	}

	return true
}

```

### day05
#### 将页面都换成Ajax，异步接口
#### CURD接口
利用业务代码添加Add，Update，Del等代码（gorm的create，[save](https://juejin.cn/post/7304867278566391860)等方式）

#### 错误与收获：
<details class="lake-collapse"><summary id="u8f00316a">错误与收获：</summary><p id="u29fbc298" class="ne-p">今天又碰到了提交之后和远程不同出现冲突的问题，研究了一下发现是因为提交时用的时提交（修改）方法也就是 <code class="ne-code">git commit -amend</code>,该方法可以用来修改最后一次提交，但如果该提交时已经推送到远程的，就会导致远程和本地冲突需要拉取远程代码，最后进行解决合并问题，非常麻烦。 </p><p id="ub657a9c8" class="ne-p">可以利用<code class="ne-code">git reset --soft origin/main &amp;&amp; git status</code>将本地状态软重置到远程分支的状态，进行重新提交本地代码。</p></details>
### day06
#### 前端利用Echart展示饼状图
收获：了解到`ctx.JSON(http.StatusOK, obj)`获取的JSON可以网页开发者工具中 网络->Fetch/XHR->响应中 中查看是否正确返回

- [x] 是通过POST获取对应的投票id展示对应信息吗（并不是，而是在点击链接后会请求 /result/info?id=1，通过Query获取id）相关代码

```html
   $("#vote_table").append('<a href="#" class="ajax-trigger" data="' + datum.Id + '">' + datum.Title + '</a></h2><br>');
```

- [x] 点击链接后怎么显示的 /info?id＝1

### day07
#### 注册功能
```go
func CreateUser(user *User) error {
    if err := Conn.Create(user).Error; err != nil {
        fmt.Printf("err:%s", err.Error())
        return err
    }
    return nil
}
```

这里传的是结构体指针，原因是因为gorm的Create方法会在插入数据成功后，将自动生成的自增的id填回结构体

#### 利用Apifox测试接口（也可用Postman）
#### 加密密码
```go
// 有风险，密码太简单会被哈希碰撞破解
func encrypt(pwd string) string {
	hash := md5.New()
	hash.Write([]byte(pwd))
	hashBytes := hash.Sum(nil)
	hashString := hex.EncodeToString(hashBytes)
	fmt.Println("MD5加密后的字符串为：", hashString)
	return hashString
}
```

```go
func encrypt2(pwd string) string {
	newPwd := pwd + "yllmis" // 不能随便起，也不能暴露
	hash := md5.New()
	hash.Write([]byte(newPwd))
	hashBytes := hash.Sum(nil)
	hashString := hex.EncodeToString(hashBytes)
	return hashString
}
```

**salt值** (盐值) 在密码学中，是指通过在密码任意固定位置插入特定的字符串，让散列后的结果和使用原始密码的散列结果不相符，这种过程称之为“加盐”。

```go
func encryptV2(pwd string) string {
	//基于Blowfish 实现加密。简单快速，但有安全风险
	//golang.org/x/crypto/ 中有大量的加密算法
	newPwd, err := bcrypt.GenerateFromPassword([]byte(pwd), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("密码加密失败：", err)
		return ""
	}
	newPwdStr := string(newPwd)
	fmt.Printf("加密后的密码：%s\n", newPwdStr)
	return newPwdStr
}
```

存密码的pwd字段最好用char，因为MD5的长度是固定的32个字节，对于固定长度的数据，用char更好，varchar可能有微小的性能损耗

#### 验证码验证
引入[https://github.com/mojocn/base64Captcha](https://github.com/mojocn/base64Captcha) 比较全面，较多使用，支持多种语言

[在线Base64转图片](https://www.lddgo.net/convert/base64-to-image)

该方法有很大风险，会被DDOS和CC攻击，占据大量带宽后死机

办法是直接租用高防服务器，将验证码功能交给前端 

后端工程师可能会遇到的隐患：SQL注入，CSRF/XSS，DDOS，CC

遗留问题：

- [x] [base64](https://www.yuque.com/yllmis/uw8ppk/swyggcgx3opttxbc)是什么 
- [x] 能不能将验证码放到登录界面，怎么做？

### day08
在构建事务时，要将大事务拆成小事务，将耗时长的拆分成多个耗时短的

#### 防止刷票
不要将检验功能塞到model的vote.go中的DoVote(记录投票)功能，会使消耗增大很多，单独写一个方法，在提交选项时检验(index.go中的DoVote方法)

```go
func GetVoteHistory(userId, voteId int64) []VoteOptUser {
    ret := make([]VoteOptUser, 0)
    if err := Conn.Table("vote_opt_user").Where("user_id = ? AND vote_id = ?", userId, voteId).Find(&ret).Error; err != nil {
        fmt.Printf("查询用户投票记录失败, err:%s\n", err.Error())
    }
    return ret
}
```

这个和注册有一样的问题，当发起大量请求时依旧会导致出现重复投票（注册会出现重复名字）的问题，解决这种高并发的问题可以利用 **<u>乐观锁，悲观锁，分布式锁。消息队列（最好）</u>** 

#### 日志包
官方自带包（不好用，功能少且一般）

` log.Printf([print]...)`

` log.Panicf([panic]...)`

` log.Fatalf([error]...)`

##### logrus
仔细看代码中的注释

```go
package tools

import (
	"io"
	"os"

	"github.com/sirupsen/logrus"
)

var Logger *logrus.Entry

func NewLogger() {
	logStore := logrus.New()
	logStore.SetLevel(logrus.DebugLevel)

	w1 := os.Stdout                                                               // Info级别及以上日志输出到控制台
	w2, _ := os.OpenFile("./vote.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644) // Debug级别日志输出到文件

	// 设置不同级别的输出
	logStore.SetOutput(io.MultiWriter(w1, w2)) // 默认输出到文件

	logStore.SetFormatter(&logrus.TextFormatter{})

	Logger = logStore.WithFields(logrus.Fields{ // 便于在集中日志管理平台快速找到相关日志
		"name": "yllmis",
		"app":  "vote_demo",
	})

	// logStore.AddHook() // 出现非常严重错误时发送邮件通知管理员
}

```

##### zap（常用）
[Zap Logger · Go语言中文文档](https://www.topgoer.com/%E9%A1%B9%E7%9B%AE/log/ZapLogger.html)

**为什么要用日志**

+ 调试时用日志而不是format
+ 日志能记录线上的bug情况，便于排查
+ 未雨绸缪
    - 新服务上线，需要持续一段时间观察日志
    - 老服务定时摸排冒烟点，防止发生事故

### day09
增加uuid，如果用mysql自带id，容易被人知道该系统有多少用户等

#### 将接口改造成sql原生接口
1. sql原生语句，插入可以不用改，出问题容易被发现
2. 便于上线后出现查询问题时进行排查，如果不用原生，在业务十分庞大时，如果链式操作，返回的sql语句可能会非常复杂，无法定位
3. 简单业务场景下，减少一次Sql的build过程，提高效率
4. 复查场景下，可以提高准确性（比如拿原生sql直接去数据库试），避免buil的时候出现隐形bug（极低）

能写原生sql尽量写，新手而言不是坏事

1. 对于业务的查询场景有一个清醒的认识。便于后续的优化，排查，建索引等。
2. 提高自己SQL的能力。简单的SQL场景不去练习，是不可能写出来复查场景的SQL的。

##### sql注入
SQL 注入是一种常见的安全漏洞，它发生在应用程序未正确验证、转义或过滤用户提供的输入数据，并将其直接拼接到 SQL 查询语句中的情况下。攻击者可以利用这个漏洞注入恶意的 SQL 代码，从而执行未经授权的数据库操作

```go
select * from user where name = ? limit 1
# 1 OR 1=1 
select * from user where name = 1 OR 1=1  limit 1 //能查到东西
```

gorm会帮助进行转义，防止被sql攻击

#### [Gorm](https://www.yuque.com/yllmis/uw8ppk/okd3xa0d5lmf4l6g)（会用就行）
工作中用的非常多，面试问的少

### day10
#### 接口文档
##### 官方文档
[**swag**](https://github.com/swaggo/swag/blob/master/README_zh-CN.md)

[**gin-swagger**](https://github.com/swaggo/gin-swagger)

##### 为什么写接口文档
1. 公司开发项目，讲究一个 **接口先行**。基于接口文档 mock 数据。
2. 代码和文档 一样重要。顺手 写个文档。每次迭代的时候，写一个优化文档。像流水账一样。复盘文档，，接口文档，模块文档，架构文档

多写文档，多写技术方案，多学习别人的技术方案。

#### redis缓存
引入redis，利用wsl，将其转发到本地端口（ 需改配置 ），可以在主机访问localhost:6379来访问redis。

- [ ] 缓存是什么

缓存在开发中的问题

1. 数据一致性问题。**高频问题  读时更新，写时删除**

> 将数据写入缓存后，读取时直接从缓存中读取，但如果这时候修改了数据库中的值，读取的依然是之前存进去的值，需要删除缓存重新读取后保存到缓存中
>
> 所以我们需要读的时候更新缓存，写入数据库的时候将缓存删除（最简单的解决问题，遇到特殊场景重新考虑）
>

2. 击穿、穿透、雪崩问题
3. 不同业务场景下选择合适的缓存类型 
4. 高并发场景下采取分布式缓存或集群或分布式集群，业务开发不需考虑，往架构发展需要学习

#### 限流策略
一般不放到代码中，而是会放到网关层，比如：Nginx

<details class="lake-collapse"><summary id="ue332f7c5">其他的限流策略</summary><ol class="ne-ol"><li id="uae03f1bf" data-lake-index-type="0">漏斗算法的限流 </li><li id="u5cd1281e" data-lake-index-type="0">令牌桶算法的限流</li><li id="ueab6e23a" data-lake-index-type="0">滑动窗口算法的限流</li><li id="u1aec21e9" data-lake-index-type="0">基于服务器资源使用率的限流</li></ol></details>
常用的限流包：GO小三包里的time/rate

### day11
#### 优化获取投票详情接口
> 进行数据库操作时，如果有两个联查表
>

##### 用两条sql语句查询
原生SQL 就是使用的两次SQL读取。

##### join方法
```sql
select *  from vote 
  join vote_opt 
  on vote.id = vote_opt.vote_id 
  where vote.id = 2;
```

- [ ] ** 数据量大时，不建议这么联表查询**

##### gorm的Preload预加载（这个需要将表构建为结构体时，两个关联的表需要传入各自的对象，否则取出的无法正常赋值）

```go
type Vote struct {
    Id          int64     `gorm:"column:id;primary_key;AUTO_INCREMENT;NOT NULL"`
    Title       string    `gorm:"column:title;default:NULL"`
    Type        int32     `gorm:"column:type;default:NULL;comment:'0单选1多选'"`
    Status      int32     `gorm:"column:status;default:NULL;comment:'0正常1超时'"`
    Time        int64     `gorm:"column:time;default:NULL;comment:'有效时长'"`
    UserId      int64     `gorm:"column:user_id;default:NULL;comment:'创建人'"`
    CreatedTime time.Time `gorm:"column:created_time;default:NULL"`
    UpdatedTime time.Time `gorm:"column:updated_time;default:NULL"`
    Opt         []VoteOpt
}

func GetVoteV2(id int64) (*Vote, error) {
    ret := &Vote{}
    err := Conn.Preload("Opt").
    Table("vote").Where("id = ?", id).
    First(&ret).Error
    if err != nil {
        tools.Logger.Printf("[GetVoteV1]err:%s", err.Error())
        return nil, err
    }

    return ret, nil
}
```

#### 利用channel和waitgroup提高接口性能
利用协程进行数据库操作时，注意要加入channel管道进行一个阻塞，不然函数的主协程会直接return退出，不给子协程执行的机会。

可以利用sync.WaitGroup包，更利于等待

#### 利用雪花算法生成uuid
相较于只能生成string类型的goold uuid（不太适合作主键），雪花算法能生成int类型

使用雪花算法时可能有并发安全，即出现生成了相同uid的情况

#### 投票接口优化，防止刷票 利用redis缓存
查询投票历史，若数据库中有，先加入到redis中

**12.4 新增**

复盘时觉得还是无法解决并发问题，所以查询资料加入了redis锁，每次要发送请求时加入`SetNX`抢锁（如果key不存在，加入；若存在，放弃）

##### 缓存穿透
1. 一直查一个不存在的值，那缓存永远都不会有这东西，次次都会回溯数据库，缓存相当于形同虚设了

> 最简单的解决办法就是有空的话也存入缓存，直接返回空的json？
>

2. 如果一个值过期了怎么办？ 再次查询并放入redis  如果同时又大量请求呢？依旧是并发问题

#### 登录
##### 将session使用redis存储
> 1. 原本的session存在本机上，会消耗大量内存
> 2. 如果session在A服务器，但请求走到B服务器
>

cookie -> session -> session-redis -> 验签服务，专门的分布式缓存

##### 引入JWT登录
> 减少cookie id 到 session 到redis的步骤
>

篡改token的任一一个地方，都无法正确校验

- [ ] 学习jwt

### 12.5 todo List
- [x] 重构项目部分代码
    - [x] 将session转为jwt登录
    - [x] 加入配置文件viper

## 复盘  
![画板](/images/yuque/c0931e7bd6502a85.jpg)

## 困惑
<details class="lake-collapse"><summary id="u932e4311">有必要去熟练sql语句吗，用orm更好还是原生</summary><ol class="ne-ol"><li id="u9976134a" data-lake-index-type="0"></li></ol></details>
<details class="lake-collapse"><summary id="uda9a0491">写接口文档是提前写好再去实现接口吗，那swagger不是写完接口再生成的吗</summary><p id="u819ff04a" class="ne-p"></p></details>

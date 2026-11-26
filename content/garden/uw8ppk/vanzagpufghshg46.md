---
title: RBAC权限管理
date: '2026-06-15'
summary: >-
  用户找角色，角色找权限，用户不直接与权限相关个人项目一、核心思路本项目采用标准 RBAC 模型：用户 -&gt; 角色 -&gt;
  权限用户不直接绑定权限，通过角色间接获得权限权限校验时以用户当前角色对应的权限集合为准二、项目目标与完成情况目标大纲实现简单登录/注册功能实现用户-
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/vanzagpufghshg46'
---
> 用户找角色，角色找权限，用户不直接与权限相关
>

# 个人项目
## 一、核心思路
本项目采用标准 RBAC 模型：

用户 -> 角色 -> 权限  
用户不直接绑定权限，通过角色间接获得权限  
权限校验时以用户当前角色对应的权限集合为准

## 二、项目目标与完成情况
**目标大纲**

+ 实现简单登录/注册功能
+ 实现用户-角色-权限分配
+ 实现管理员增删权限
+ 实现用户鉴权

当前实现状态（按代码实际）

+ 已实现：登录功能（JWT）
+ 已实现：用户-角色分配（单用户单角色策略）
+ 已实现：用户鉴权（中间件 + Redis 缓存 + DB 回源）
+ 部分实现：管理员功能（当前已实现“管理员修改用户角色”接口）
+ 未实现：注册功能
+ 未实现：权限点管理接口（增删改权限）

## 三、表设计（当前项目模型）
  
关系说明：  
用户通过 user_role 找到角色，再通过 role_perm 找到权限，最终得到可访问资源。

## 四、功能实现
### 1）登录功能
实现点：

使用 JWT 生成 token，并将 userId 写入 claims。  
登录成功后，查询用户角色，再查询角色权限。  
将权限结果按 Hash 结构写入 Redis（key：user_perms_{userId}，field：perm_code，value:1）。  
缓存 TTL 初始化为 token 的有效时长。

### 2）鉴权功能
实现想法

从请求头解析 token，获取 userId。

优先查 Redis 缓存中的权限字段。

未命中则回源数据库（用户 -> 角色 -> 权限）。

将查询结果回填 Redis，减少后续数据库压力。

TTL 缓存策略

登录预热：权限 key 初次 TTL = TokenTTL。

请求命中缓存：TTL 同步为 token 剩余时长（同步防御机制，确认剩余时长）

`remaining = expireAt - now = time.Until(expireAt)`

未命中回填：

有权限：TTL = token 剩余时长

无权限：TTL = 30 秒（短 TTL，便于权限调整后快速生效）

### 3）管理员功能（当前）
当前已落地：

修改用户角色（分配角色）

业务规则：

user_id 必须有效  
role_id 必须有效  
用户必须存在  
角色必须存在  
若用户已有该角色 -> 返回已拥有  
若用户已有其他角色 -> 返回先解绑（当前策略是单用户单角色）

## 五、并发处理
1. 鉴权回源时引入了 singleflight

作用  
当大量并发请求同时查询“同一用户 + 同一权限”时：

只触发一次真实数据库查询  
其他同 key 请求复用这次查询结果  
避免缓存未命中瞬间对数据库形成单点击穿  
注意  
这是“同 key 去重”  
不能合并“不同用户/不同权限”的查询  
可防单点击穿，但不能替代全局限流和数据库优化

## 六、总结（按当前项目）
本项目完成了 RBAC 的核心闭环：

登录认证（JWT）  
用户-角色-权限链路

Redis 缓存加速鉴权

TTL 与 token 生命周期联动

singleflight 防单点击穿

管理员可执行用户角色分配

## 前端（vue3）
# gin-vue-admin 源码研读
![画板](/images/yuque/bfa4c6694caefe30.jpg)

### 整体架构思维
遵循**“用户-角色-权限”**三层模型。此基础上做了两个维度的权限控制：

  1. API 接口权限（Casbin 管控）：控制角色能调用哪些 HTTP 接口

  2. 菜单访问权限（数据库关联表管控）：控制角色能看到哪些前端菜单/页面

  3. 按钮操作权限（SysAuthorityBtn 管控）：控制角色在页面内能操作哪些按钮

  4. 数据权限（DataAuthorityId 管控）：控制角色能访问哪些角色范围的数据

请求分为两组

+ PublicGroup
+ PrivateGroup

### 拆分
#### Model层
##### 基础模型
**GVA_MODEL（所有表的基类）**

```go
type GVA_MODEL struct {
    ID        uint           `gorm:"primarykey"`
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`  // 软删除
}
```

所有继承它的表都有这四个字段，`DeletedAt` 非空表示已删除。

---

##### 核心表（5 张实体表）
**sys_users（用户表）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ID | uint | 主键，自增 |
| UUID | uuid | 用户唯一标识 |
| Username | string | 登录名 |
| Password | string | bcrypt 加密密码 |
| NickName | string | 昵称 |
| HeaderImg | string | 头像 |
| AuthorityId | uint | 主角色ID，外键关联 sys_authorities |
| Phone | string | 手机号 |
| Email | string | 邮箱 |
| Enable | int | 1=正常，2=冻结 |
| OriginSetting | JSONMap | 用户个人配置 |

**关键点：** `AuthorityId` 是主角色，用户同一时刻只以一个角色身份行动。`Authorities` 字段是多角色列表，通过中间表关联。

---

**sys_authorities（角色表）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| AuthorityId | uint | 手动指定，非自增（如 888、9528） |
| AuthorityName | string | 角色名 |
| ParentId | *uint | 父角色ID，0 表示顶级 |
| DefaultRouter | string | 默认首页菜单，默认 "dashboard" |

**关键点：**

+ `AuthorityId` 不继承 GVA_MODEL，手动指定主键，这是刻意设计
+ `ParentId` 是指针类型 `*uint`，因为 nil 表示顶级角色
+ `Children` 字段带 `gorm:"-"`，说明不存数据库，只在查询时递归填充

---

**sys_base_menus（菜单表）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ID | uint | 主键，自增（继承 GVA_MODEL） |
| ParentId | uint | 父菜单ID，0 表示顶级 |
| Path | string | 路由路径，如 "authority" |
| Name | string | 路由名，如 "authority" |
| Component | string | 前端组件路径 |
| Sort | int | 排序 |
| Hidden | bool | 是否隐藏 |
| Meta | 嵌入结构 | Title、Icon、KeepAlive 等 |

`Meta` 是嵌入结构体（`gorm:"embedded"`），不是独立表。

---

**sys_base_menu_parameters（菜单参数表）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ID | uint | 主键 |
| SysBaseMenuID | uint | 所属菜单ID |
| Type | string | "params" 或 "query" |
| Key | string | 参数名 |
| Value | string | 参数值 |

一个菜单可以携带多个参数，独立成表而不是 JSON 字段，方便查询和维护。

---

**sys_base_menu_btns（按钮定义表）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ID | uint | 主键 |
| Name | string | 按钮标识 key |
| Desc | string | 按钮说明 |
| SysBaseMenuID | uint | 所属菜单ID |

一个菜单下可以定义多个可操作按钮。

---

##### 关联表（4 张中间表）
**sys_user_authority（用户-角色）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| sys_user_id | uint | 用户ID |
| sys_authority_authority_id | uint | 角色ID |

多对多，一个用户可以有多个角色，一个角色可以被多个用户拥有。

---

**sys_authority_menus（角色-菜单）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| sys_base_menu_id | string | 菜单ID（注意是 string 类型） |
| sys_authority_authority_id | string | 角色ID（也是 string） |

多对多，一个角色可以访问多个菜单，一个菜单可以被多个角色访问。

---

**sys_data_authority_id（数据权限-角色-角色）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| 角色A ID | uint | 发起方 |
| 角色B ID | uint | 被授权方 |

角色 A 拥有角色 B 的数据权限时，记录一条关联。这样角色 A 可以查询角色 B 名下的数据。

---

**sys_authority_btn（角色-按钮）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| authority_id | uint | 角色ID |
| sys_menu_id | uint | 菜单ID |
| sys_base_menu_btn_id | uint | 按钮ID |

三元关联：角色在某个菜单下能操作哪些按钮。

---

菜单表 按钮表 与 角色的关联是优化用户体验，让用户看不到本就无法触发的事件，配合前端。

Casbin为了是真正的系统安全，阻止无法访问的API请求

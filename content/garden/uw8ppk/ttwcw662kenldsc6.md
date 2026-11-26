---
title: 项目中的软件开发规范
date: '2026-11-21'
summary: >-
  Controller、Service、Repository三层架构Code Agent 项目笔记1. ServiceContext 依赖注入模式Go
  项目把所有全局依赖（Config、Logger、HTTP Client 等）打包到一个 struct 里，通过构造函数统一初始化。
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/ttwcw662kenldsc6'
---
# Controller、Service、Repository三层架构
# Code Agent 项目笔记
## 1. ServiceContext 依赖注入模式
Go 项目把所有全局依赖（Config、Logger、HTTP Client 等）打包到一个 struct 里，通过构造函数统一初始化。

```go
type ServiceContext struct {
    Config config.Config
}

func NewServiceContext(c config.Config) *ServiceContext {
    return &ServiceContext{Config: c}
}
```

好处：加新依赖只改 ServiceContext，不改函数签名。main.go 只做组装，业务逻辑通过 ServiceContext 访问依赖。

来源：go-zero 框架的 ServiceContext 模式。

---

## 2. ReAct 模式（Agent 核心循环）
Agent 的行为模式：Reasoning（思考）→ Acting（行动）→ 观察结果 → 继续循环。

```plain
用户提问 → LLM 思考 → 调用工具 → 拿到结果 → LLM 继续思考 → ... → 最终回答
```

关键设计点：

+ System prompt 注入工具列表和调用格式
+ LLM 回复里用约定格式表达"我要调工具"
+ 消息历史要累积，LLM 需要知道之前做了什么
+ 设最大轮次限制，防止无限循环

---

## 3. 工具接口设计（Tool Interface）
每个工具实现三个方法：

+ `Name()` — 工具标识符，LLM 用它定位工具
+ `Description()` — 注入 prompt，告诉 LLM 这个工具干什么
+ `Execute()` — 实际执行，输入参数，返回结果

工具之间有天然配合关系：

+ `list_files` 发现文件 → `read_file` 读内容
+ `search` 定位到文件+行号 → `read_file` 看上下文

LLM 自己决定调哪个、调几次、传什么参数，Agent 循环只负责执行。

---

## 4. Schema 与结构体 Tag
用 Go struct + tag 定义工具参数，通过反射自动生成 Schema 给 LLM 看。

```go
type SearchParams struct {
    Keyword string `json:"keyword" description:"搜索关键词"`
    Path    string `json:"path,omitempty" description:"搜索目录"`
}
```

`StructToSchema` 用反射读取 tag，生成 `ToolSchema`。`omitempty` 表示可选参数。

加新工具只需定义 Params 结构体，Schema 自动生成，不用改 prompt 逻辑。

---

## 5. 反射的适用边界
反射适合"写一次到处用"的基础设施代码，不适合业务逻辑。

判断标准：这段代码是不是只服务于一个特定场景？

+ 基础设施（用反射）：`StructToSchema`、`convertArgs` — 通用工具，所有工具复用
+ 业务逻辑（用类型断言）：`SearchTool.Execute` — 搜索的具体实现

反射的代价：编译器无法检查 tag 是否正确，运行时才报错。业务逻辑里这种风险更高。

---

## 6. 并发工具调用
LLM 可能一次返回多个工具调用，可以同时执行，不用串行等。

```go
var wg sync.WaitGroup
results := make([]string, len(toolCalls))
for i, tc := range toolCalls {
    wg.Add(1)
    go func(i int, tc ToolCall) {
        defer wg.Done()
        results[i] = tool.Execute(tc.Args)
    }(i, tc)
}
wg.Wait()
```

关键点：

+ `sync.WaitGroup` 等所有 goroutine 完成
+ `results` slice 预分配长度，每个 goroutine 写自己的索引，不需要加锁
+ 闭包参数 `i, tc` 传值，避免循环变量捕获问题

---

## 7. JSON 中转做类型转换
把 `map[string]string` 转成对应结构体，用 JSON 序列化/反序列化比手写反射赋值简单。

```go
jsonBytes, _ := json.Marshal(argsMap)
ptr := reflect.New(paramType)
json.Unmarshal(jsonBytes, ptr.Interface())
return ptr.Elem().Interface()
```

代价是多一次 JSON 序列化开销，但对工具调用这种低频场景无所谓。

---

## 8. 错误处理时机
功能跑通之后才做错误处理是不对的。应该和功能一起写。

写完一个函数，马上想"哪里会出错"：

+ `http.NewRequest` 可能失败
+ `chatResp.Choices` 可能为空
+ 用户输入可能为空
+ 文件可能是二进制的

错误信息要有上下文：`fmt.Errorf("创建请求失败: %w", err)` 比 `return err` 好调试。

---

## 9. LLM 工具调用格式
用 `<tool>name:input</tool>` 格式让 LLM 表达"我要调工具"。

多参数格式：

```plain
<tool>
name: search
keyword: func main
path: agent
</tool>

```

解析方式：字符串查找 `<tool>` 和 `</tool>` 标签，按行分割，按 `:` 分割键值对。

比 function calling 简单，不依赖特定 LLM 的 API 格式。

---

## 10. Go HTTP 请求的两种方式
```go
// 方式一：http.Post，简单但不能设自定义 Header
resp, err := http.Post(url, "application/json", body)

// 方式二：http.NewRequest + Do，能加自定义 Header
httpReq, err := http.NewRequest("POST", url, body)
httpReq.Header.Set("api-key", "xxx")
resp, err := http.DefaultClient.Do(httpReq)
```

Mimo API 要求 `api-key` 自定义 header，必须用方式二。

---

## 11. json.NewDecoder vs json.Unmarshal
```go
// 方式一：先读全部到内存，再解析
bodyBytes, _ := io.ReadAll(resp.Body)
json.Unmarshal(bodyBytes, &resp)

// 方式二：边读边解析（流式）
json.NewDecoder(resp.Body).Decode(&resp)
```

方式二更地道，不用先分配大内存。对小响应差别不大，但它是 Go 处理流式数据的标准写法。

---

## 12. 二进制文件过滤
搜索工具需要跳过二进制文件，用扩展名过滤比读文件检测 magic bytes 更快。

```go
func isBinaryFile(path string) bool {
    binaryExts := map[string]bool{
        ".png": true, ".jpg": true, ".exe": true, ".zip": true,
    }
    ext := strings.ToLower(filepath.Ext(path))
    return binaryExts[ext]
}
```

---

## 13. AI 辅助开发的掌握方法
+ **逐行复述**：拿到生成的代码后，自己逐行读，遇到不懂就问
+ **改动验证**：故意改一个地方看会发生什么，改坏了再改回来
+ **自己写一遍**：关键函数关掉 AI 从空白文件写，写不出来说明还没掌握

---

## 14. 单元测试
可以让 AI 生成测试骨架和常规用例，但你需要自己判断：

+ 测试什么（指定重点测哪些场景）
+ 测试是否正确（断言是否充分，有没有"永远通过"的假测试）
+ 测试驱动设计（先写测试用例，再写实现）

当前项目最该测的函数：`parseToolCalls`、`StructToSchema`、`convertArgs`。

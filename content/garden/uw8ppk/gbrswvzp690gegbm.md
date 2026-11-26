---
title: Go 语言
date: '2026-08-28'
summary: >-
  const 定义在const()中添加关键字 iota， 每行的 iota都会+1，第一行默认为0 。const( a = iota //1 b //2 c
  //3 )之后行的公式会跟第一行一样或者新公式以后的行会和新公式一样const(a,b=iota+1,iota+2 // 
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/gbrswvzp690gegbm'
---
## const 定义
在`const()`中添加关键字 `iota`， 每行的 `iota`都会+1，第一行默认为0 。

```go
const(
    a = iota //1
    b //2
    c //3
)
```

之后行的公式会跟第一行一样或者新公式以后的行会和新公式一样

```go
const(a,b=iota+1,iota+2 	// iota =0,a = iota +1,b=iota+2，a=1,b=2
     c,d					//iota =1,c=iota + 1,c=2，d=3
     e,f					//iota=2，e=iota+1 f=iota+2,e=3，f=4
     
     g,h=iota *2，iota *3  //iota=3，g=iota*2，h=iota*3，g=6，h=9
     i,k					//iota=4，i=iota*2，k=iota*3，i=8，·k=12
```

注：`iota`只能和`const()`配合使用

## 多返回值
```go
package main

import "fmt"

func foo1(a int, b string) int {
    fmt.Println("a =", a)
    fmt.Println("b =", b)

    return 100
}

//返回多个返回值 匿名
func fool2(a int, b string) (int, int) {
    fmt.Println("a =", a)
    fmt.Println("b =", b)

    return 100, 200
}

//有形参名称的
func fool3(a int, b string) (r1 int, r2 int) {
    fmt.Println("a =", a)
    fmt.Println("b =", b)
    
    //r1,r2是属于 fool3 的形参 初始化默认的值为0（防止野指针）
    //r1，r2 作用域是fool3整个函数的{}空间
//  fmt.Println("r1 =", r1)   0
//	fmt.Println("r2 =", r2)   0
    
    r1 = 111
    r2 = 222
    return//返回了r1，r2
}

func fool3(a int, b string) (r1，r2 int) {
    fmt.Println("a =", a)
    fmt.Println("b =", b)
    
    
    r1 = 111
    r2 = 222
    return//返回了r1，r2
}

func main() {
    fmt.Println("---fool1---")
    c := foo1(100, "abc")
    fmt.Println("c =", c)

    fmt.Println("---fool2---")
    d, e := fool2(200, "def")
    fmt.Println("d =", d)
    fmt.Println("e =", e)

    fmt.Println("---fool3---")
    f, g := fool3(300, "ghi")
    fmt.Println("f =", f)
    fmt.Println("g =", g)
}

```

输出结果如下：

```plain
---fool1---
a = 100
b = abc
c = 100
---fool2---
a = 200
b = def
d = 100
e = 200
---fool3---
a = 300
b = ghi
f = 111
g = 222
```

## init 函数和 import 导包
![](/images/yuque/4e6afea092270ba6.png)

![](D:/Learn/Computer/Go/note/jichu/image-20251015202101994.png)**Go 1.11（2018年）开始，Go 官方就推荐使用 **`Go Modules`**（模块)来管理项目**

初始化`Go Modules`用`go mod init myproject`

```go
// init/main.go
package main

import (
    "github.com/yllmis/hellogo/init/lib1" //go.mod 管理
    "github.com/yllmis/hellogo/init/lib2" 
)

func main() {
    lib1.Lib1Test()
    lib2.Lib2Test()
}
```

函数首字母大写代表是对外开放，小写代表只能在当前包内调用

```go
// init/lib1/lib1.go
package lib1

import "fmt"

func Lib1Test() {
    fmt.Println("lib1 test() ...")
}

func init() {
    fmt.Println("lib1 init()...")
}
```

```go
// init/lib2/lib2.go
package lib2

import "fmt"

func Lib2Test() {
    fmt.Println("lib2 test() ...")
}

func init() {
    fmt.Println("lib2 init() ...")
}
```

项目路径如下

```plain
D:.Hellogo
│  go.mod
├─function
│      function.go
├─init
      │  main.go
      ├─lib1
      │      lib1.go
      └─lib2
              lib2.go
```

### 匿名及别名导包
+ 匿名：在包名前加`_ `可以在不使用该包的情况下防止报错 `_ "github.com/yllmis/hellogo/init/lib1"`
+ 别名：包名前可以给予别名，在调包时更方便`mylib2 "github.com/yllmis/hellogo/init/lib2"` `mylib2.Lib2Test()`
+ 注意：不要轻易使用`. "github.com/yllmis/hellogo/init/lib2"`，这可以在调用时直接用方法 将当前fmt包中的全部方法，导入到当前本包的作用中，fmt包中的全部的方法可以直接使用API来调用，不需要fmt.API来调

### 闭包
匿名函数

```go
func() {
    sum := 0
    for i := 1; i <= 1e6; i++ {
        sum += i
    }
}()
```

表示参数列表的第一对括号必须紧挨着关键字 `func`，因为匿名函数没有名称。花括号 `{}` 涵盖着函数体，**最后的一对括号表示对该匿名函数的调用**。

## defer关键字
### 执行顺序
func3()->func2->func1

![](D:/Learn/Computer/Go/note/jichu/image-20251017222349923.png)![](/images/yuque/9289b2fcba9bbeee.png)

defer语句在该函数执行完后调用

例如

```go
func main(){
    defer fmt.Println("main defer")
    
    fmt.Println("main::says")
}
```

输出结果会是

```go
main::says
main defer
```

### return和defer谁先谁后
return后的语句先执行，defer后的语句后执行

## slice 切片 动态数组
### 数组
两种写法

```go
func main() {
    var array1 [10]int
    for i := 0; i < len(array1); i++ {
        fmt.Println(array1[i])
    }

    array2 := [10]int{1, 2, 3, 4, 5}
    for index, value := range array2 {//如果只想要其中一个值，可以将index或value改成'_'（表示匿名的变量）
        fmt.Println("index: ", "value:", index, value)
    }

}
```

长度固定时，传进函数固定长度数组时是拷贝的，函数内无法改变数组值

### (slice)动态数组
`myarray := []int{1,2,3,4} //动态数组，切片slice`

`func printArray(myArray []int) //Go 中所有传递都是值传递，但如果这个“值”里面包含指针，那么通过指针就能修改共享的数据`若该函数内改变数组内部值，数组值会改变。不同元素长度的动态数组的形参是一样的

### slice声明方式（四种）
1. `slice1 := []int{1, 2, 3, 4}` 长度为4
2. `var slice1 []int`只是声明，并没有分配空间
    1. `slice1 = make([]int, 3)`开辟3个空间，初始化值为0
3. `var slice1 []int = make([]int, 3)`
4. `slice1 := make([]int, 3)`
+ 通过

```go
if slice == nil {
    fmt.Println("slice是一个空切片")
}
```

### slice切片容量的追加和截取
1. 长度和容量不同，长度表示左指针和右指针之间的距离，一般是已有数据，容量表示左指针至底层数组末尾的距离

![](D:/Learn/Computer/Go/note/jichu/image-20251018235859208.png)![](/images/yuque/487cd910df2a556a.png)

2. 切片扩容机制，append的时候，若长度超过容量，容量翻倍（*2）
3. 截取，下列代码中_s1和s指向的是相同数组地址，所以s1内部值改变s的值也会变_ ，s2通过copy函数拷贝s，不会影响

```go
package main

import "fmt"

func main() {
    s := []int{1, 2, 3}
    s1 := s[0:2]

    fmt.Println(s1)

    s1[0] = 100
    fmt.Println(s)
    fmt.Println(s1)

    //copy函数
    s2 := make([]int, 3)
    copy(s2, s)

    fmt.Println(s2)

    s2[0] = 200
    fmt.Println(s)
    fmt.Println(s2)
}

```

**函数内改变slice时，如果slice发生扩容，会创建新的底层数组原切片不受影响**

```go
func main() {
    doAppend := func(s []int) {
        s = append(s, 1)
        printLengthAndCapacity(s)
    }
    s := make([]int, 8, 8)
    doAppend(s[:4])
    printLengthAndCapacity(s)
    doAppend(s) // 扩容
    printLengthAndCapacity(s)
}
func printLengthAndCapacity(s []int) {
    fmt.Printin(s)
    fmt.Printf ("len=%d cap=%d (n", len(s), cap(s))
}
```

输出结果应该是

> [0,0,0,0,1] len:5 cap:8
>
> [0,0,0,0,1,0,0,0] len:8 cap:8
>
> [0,0,0,0,1,0,0,0,1] len:9 cap:16
>
> [0,0,0,0,10,0,0] len:8 cap:8  （上一步函数操作中的slice扩容了，创建了新的底层数组，不影响s底层数组)
>

### `...`
> “左收右放，上包下拆”。
>

#### 1. 第一种形态：定义处的“打包器” (`...Type`)
+ **出没位置**：函数**定义（声明）**的参数列表中。
    - _例如：_`_func Inserts(data ...Friends)_`
+ **官方学名**：可变长参数（Variadic Parameters）。
+ **核心作用**：**零散进，打包收**。
    - 对**外部调用者**来说，它极其宽容，允许你传入任意数量（0个、1个、甚至100个）的零散对象。
    - 对**函数内部**来说，Go 语言在底层充当了快递员，自动拿了一个纸箱子，把这些零散的参数**打包成了一个真正的切片（Slice）**。在函数大括号内部，`data` 的类型就是彻头彻尾的 `[]Friends`。

#### 2. 第二种形态：调用处的“爆破拆包器” (`slice...`)
+ **出没位置**：函数**调用（执行）**时，紧跟在一个已经存在的切片变量后面。
    - _例如：_`_session.ExecCtx(ctx, sql, args...)_`
+ **官方学名**：展开操作符（Spread Operator）。
+ **核心作用**：**整箱进，拆开喂**。
    - 当某个目标函数（比如 `ExecCtx`）它的嘴巴很小，只接收零散的参数（`arg1, arg2, arg3`）时。
    - 而你手里刚好端着一个装满元素的“大箱子”（切片 `args []any`）。
    - 加上 `...`，就相当于施放了一个爆破魔法，**瞬间把大箱子炸开**，里面的元素全掉出来，平铺成零散的参数喂给目标函数。

---

#### 💻 极简代码沙盘演练
把这两招合在一起，就是 Go 语言里最经典的写法：

Go

```plain
// 1. 定义处：形参定义用 ...int，充当【打包器】
// 虽然接收的是零散参数，但进了函数，nums 就是个切片 []int
func Sum(nums ...int) int {
    total := 0
    for _, n := range nums { // 既然 nums 是切片，就能正常 for range 遍历
        total += n
    }
    return total
}

func main() {
    // 场景 A：直接丢零散数据给它，自动打包
    Sum(1, 2, 3) 

    // 场景 B：手里刚好有个装满数据的切片
    mySlice := []int{4, 5, 6}
    
    // ❌ 错误做法：Sum 想要零散的，你非要塞个整箱子（切片）进去，编译器直接报错
    // Sum(mySlice) 
    
    // ✅ 正确做法：调用处加 ...，充当【拆包器】，把 mySlice 炸碎了传进去
    Sum(mySlice...) 
}
```

## map-哈希键值对
### 三种声明方式
```go
var map1 map[string]int//未分配空间
    map1 = make(map[string]int, 10)
    map1["one"] = 1
    map1["two"] = 2
```

```go
map2 := make(map[string]int)
    map2["three"] = 3
    map2["four"] = 4
```

```go
map3 := map[string]int{
        "five": 5,
        "six":  6,
    }
```

### 使用方法
+ 添加

```go
cityMap := make(map[string]string)
//添加
cityMap["China"] ="Beijing"
cityMap["Japan"] ="Tokyo"
cityMap["USA"] ="NewYork""
```

+ 遍历

```go
func printMap(cityMap map[string]string）{
//cityMap是一个引用传递,可在函数内修改map的值，传递的map指针
    for key,value := range cityMap{
        fmt.Println("key ="，key)
        fmt.Println("value ="，value)
}
```

+ 删除`delete(cityMap,"Japan")`
+ 更改`cityMap["USA"] ="DC"`

## 面向对象
### 基本定义和实现
```go
package main

import "fmt"

type Book struct {
    title  string
    author string
}

func changeBook(book *Book) {//传输地址
    book.title = "New Title"
}

func main() {
    var book1 Book
    book1.title = "Go Programming"
    book1.author = "John Doe"
    fmt.Printf("%v\n", book1)

    changeBook(&book1)
    fmt.Printf("%v\n", book1)
}
```

### 表示与封装
+ 封装

```go
package main

import "fmt"

// 如果类名首字母大写，则表示对外可见，否则表示对外不可见
type Hero struct {
    // 类的属性是大写的，表示对外可见，否则表示对外不可见
    Name  string
    Age   int
    Level int
}

func (this *Hero) Show() {
    fmt.Printf("英雄信息：%v\n", *this)
}

func (this *Hero) GetName() string {
    return this.Name
}

func (this *Hero) SetName(name string) {
    //不加'*'，this是调用该方法的对象的一个副本
    this.Name = name
}

func main() {
    hero := Hero{Name: "zhang3", Age: 18, Level: 1}

    hero.Show()

    fmt.Println("英雄名字是：", hero.GetName())

    hero.SetName("li4")
    fmt.Println("英雄名字是：", hero.GetName())
}
```

    - 将结构体传入函数的时候，需要传入结构体的指针，否则无法改变结构体定义好的信息
    - 类名、属性名、方法名首字母大写表示对外（其他包）可以访问，否则只能够在本包内访问
+ 继承
    - 父类 

```go
type Human struct {
    name string
    sex  string
}
```

```go
func (this *Human) Eat() {
    println(this.name, "在吃饭")
}

func (this *Human) Walk() {
    println(this.name, "在走路")
}
```

    - 子类

```go
type SuperMan struct {
    Human // 匿名字段，继承了Human的所有方法和属性
    level int
}
```

```go
// 重定义父类的方法Eat()
func (this *SuperMan) Eat() {
    println(this.name, "在吃烤肉")
}

// 子类的新方法
func (this *SuperMan) Fly() {
    println(this.name, "在飞")
}
```

        * 定义子类

```go
//定义子类对象
    // s := SuperMan{Human{"li4", "female"}, 8}
    var s SuperMan
    s.name = "li4"
    s.sex = "female"
    s.level = 8
```

+ 多态
    - 基本的要素
        * 有一个父类（有接口）

```go
//本质是一个指针
type AnimalIf interface {
    Sleep()
    GetColor() string
    GetType() string
}
```

        *  

```go
type Cat struct {
    color string
}

func (this *Cat) Sleep() {
    println("Cat Sleep")
}

func (this *Cat) GetColor() string {
    return this.color
}

func (this *Cat) GetType() string {
    return "Cat"
}
```

        * 父类类型的变量（指针） 指向（引用）子类的具体数据变量

```go
var animal AnimalIf //接口的数据类型，父类指针
animal = &Cat{"黄色"}

animal.Sleep()//调用Cat的Sleep方法，多态的现象
```

    - 通用万能类型
        * **interface{}**
            + 空接口
            + int, string, float64, float32, strcut都实现了interface{}
            + 可以用interface{}引用任意的数据类型
        * 类型断言（Go1.8以后加入泛型

```go
//interface{}如何区分此时引用的底层数据类型到底是什么
    //类型断言
    value, ok := arg.(int)
    if ok {
        fmt.Println("arg is int type, value =", value)
    } else {
        fmt.Println("arg is not int type")
        fmt.Printf("Type of arg = %T\n", arg)
    }
```

### 接口
鸭子类型

> If it walks like a duck and quacks like a duck, then it must be a duck.
>

## 反射机制
### pair <type: ,value: >
+ 变量的结构![](D:/Learn/Computer/Go/note/jichu/image-20251020084817196.png)![](/images/yuque/c194714380a80091.png)
+ pair是可传递的，赋值时会将pair一块赋入

```go
package main

type Reader interface {
    ReadBook()
}

type Writer interface {
    WriteBook()
}

type Book struct {
}

func (this *Book) ReadBook() {
    println("Read a book")
}

func (this *Book) WriteBook() {
    println("Write a book")
}

func main() {
    //b: pair<type=Book, value=&Book{}(地址)>
    b := &Book{}

    // r: pair<type: , value: >
    var r Reader
    // r=b: pair<type=Book, value=&Book{}(地址)>
    // Reader接口类型的变量r引用了一个*Book类型的变量b
    // 因为*Book类型实现了Reader接口中的ReadBook方法
    r = b
    r.ReadBook()

    // w: pair<type: , value: >
    var w Writer
    // r: pair<type=Book, value=&Book{}(地址)>
    //Go 不允许不同接口类型直接赋值（即使底层类型相同）
    w = r.(Writer) //此处断言成功的原因是因为r引用的底层数据类型Book实现了Writer接口
    //类型断言 r.(Writer) 成功后，w 会被初始化为一个 Writer 接口变量，其内部的 (type, value) pair 与 r 相同
    w.WriteBook()
}
```

+ reflect 反射机制
    - 反射的目的在于：动态获取未知变量的type和value
    - reflect包![](D:/Learn/Computer/Go/note/jichu/image-20251020122646822.png)![](/images/yuque/f054a02a8d3e7554.png)

```go
package main

import (
    "fmt"
    "reflect"
)

type User struct {
    Id   int
    Name string
    Age  int
}

func (this User) Call() {
    fmt.Println("User Call()...")
    fmt.Printf("%v\n", this)
}

func main() {
    user := User{1, "Alice", 30}

    DoFiledAndMethod(user)

}

func DoFiledAndMethod(input interface{}) {
    //获取input的type
    inputType := reflect.TypeOf(input)
    fmt.Println("input type =", inputType)
    //获取input的value
    inputValue := reflect.ValueOf(input)
    fmt.Println("input value =", inputValue)

    //通过type获取里面的字段
    //1.获取interface的reflect.Type,通过Type的NumField()，进行遍历
    //2.通过Type的Field(i)获取每个字段的定义
    //3。通过filed有一个interface()方法，获取字段的值
    for i := 0; i < inputType.NumField(); i++ {
        field := inputType.Field(i)
        value := inputValue.Field(i).Interface()
        fmt.Printf("%s: %v = %v\n", field.Name, field.Type, value)
    }

    //通过type获取里面的方法
    for i := 0; i < inputType.NumMethod(); i++ {
        method := inputType.Method(i)
        fmt.Printf("method name=%s type=%v\n", method.Name, method.Type)
    }
}

```

### 结构体tag标签
标签用于说明该字段什么含义，别的包使用时可以知道什么用法，可利用反射机制解析。

格式：`` `key:"value" key1:"value"` `` 

```go
 package main
 
 import (
     "fmt"
     "reflect"
 )
 
 type resume struct {
     Name string `info:"name" doc:"我的名字"`
     Sex  string `info:"sex"`
 }
 
 func findTag(str interface{}) {
     t := reflect.TypeOf(str).Elem()
 
     for i := 0; i < t.NumField(); i++ {
         taginfo := t.Field(i).Tag.Get("info")//查询时一般key已知，value未知
         tagdoc := t.Field(i).Tag.Get("doc")
         fmt.Printf("taginfo=%s tagdoc=%s\n", taginfo, tagdoc)
     }
 }
 
 func main() {
     var re resume
     findTag(&re)
 }
```

+ 结构体tag标签在json中的应用
    - json解编码

```go
package main

import (
    "encoding/json"
    "fmt"
)

type Movie struct {
    Title  string   `json:"title"`
    Year   int      `json:"year"`
    Price  int      `json:"rmb"`
    Actors []string `json:"actors"`
}

func main() {
    movie := Movie{"喜剧之王", 200, 10, []string{"周星驰", "张柏芝"}}

    // 编码的过程    结构体 --> json字符串
    jsonStr, err := json.Marshal(movie)
    if err != nil {
        fmt.Println("json marshal failed, err:", err)
        return
    }
    fmt.Printf("jsonStr = %s\n", jsonStr)

    // 解码的过程    json字符串 --> 结构体
    //jsonStr = {"title":"喜剧之王","year":200,"rmb":10,"actors":["周星驰","张柏芝"]}
    myMovie := Movie{}
    err = json.Unmarshal(jsonStr, &myMovie)
    if err != nil {
        fmt.Println("json unmarshal failed, err:", err)
        return
    }

    fmt.Printf("myMovie = %v\n", myMovie)
}
```

## 高阶
### goroutine go语法独特
#### 多线程/多进程
+ CPU分好时间片，若进程A超出时间片，强制切换到进程B，在完整执行一遍后，继续执行之前未完成的进程A宏观上的同时进行（并发）![](D:/Learn/Computer/Go/note/jichu/image-20251021094035414.png)![](/images/yuque/7ec16c2c15c4c014.png)  
这样会导致CPU有时间浪费在切换成本上  
**进程/线程的数量越多，切换成本就越大，也就越浪费**
+ 多线程/多进程壁垒，弊端![](D:/Learn/Computer/Go/note/jichu/image-20251021100541694.png)![](/images/yuque/23fc5c044176c801.png)

#### 内核线程和用户线程 调度器
+ 将一个线程分为内核线程和用户线程，二者相互绑定。CPU对该无感，在操作系统层面不需要动，只在用户态进行改变。
+ 用户线程取名为协程(co-routine)
+ 内核空间的线程（thread）通过协程调度器绑定多个协程，CPU依旧认为只有一个线程，CPU不需切换（N:1）.弊端是如果一个协程阻塞，其它协程会出现问题
+ 所以改成多个线程通过一个协程调度器管理多个协程(M:N)。该方法的瓶颈在于优化协程调度器

#### Golang对协程的处理
协程(co-routine)->Goroutine（内存几KB，可以大量；灵活调度，可常切换）

**GMP**

+ G：goroutine协程
+ P：processor处理器
+ M：thread线程![](D:/Learn/Computer/Go/note/jichu/image-20251021194642584.png)![](/images/yuque/53c5ebaa1884bd48.png)

最大的并行数量是GOMXPROCS的数量

（注解：**并发（Concurrency）**：多个任务交替执行（单核也能并发）

**并行（Parallelism）**：多个任务同时执行（需多核）)

#### 调度器的设计策略
+ 复用线程
    - 偷取（work stealing）机制![](/images/yuque/d69eabb4170dffd3.png)

   ![](D:/Learn/Computer/Go/note/jichu/image-20251021201728692.png)M2空闲，M1和M2不平均分配，M2会从M1中P的本地队列偷取一个协程

    - hand off（分离）机制![](D:/Learn/Computer/Go/note/jichu/image-20251021202001823.png)![](/images/yuque/7b69fe81b8fad1c2.png)M1中G1阻塞，创建/唤醒一个thread，将P1移到新的M3中，将G1与M1绑定，此时M1睡眠。若G1执行完后还需要继续执行，重新加入到其它队列，M1睡眠/销毁。
+ 利用并行GOMAXPROCS限定P的个数
+ 抢占![](D:/Learn/Computer/Go/note/jichu/image-20251021202648726.png)![](/images/yuque/d73a52915133bfb1.png)并发
+ 全局G队列（work stealing机制，从全局偷取）M2本地队列没有任何G，优先从其它队列偷取，若其它也没有，从全局队列获取（需要加锁和解锁，较慢）

#### 创建goroutine
1. 主线程结束，主线程内的子线程也结束

```go
func main() {

    go func() {
        defer fmt.Println("A.defer")
        func() {
            defer fmt.Println("B.defer")
            //退出当前goroutine
            runtime.Goexit()
            fmt.Println("B")
        }()
        fmt.Println("A")
    }()
}
```

### channel
#### 定义
![](D:/Learn/Computer/Go/note/jichu/image-20251021213834931.png)![](D:/Learn/Computer/Go/note/jichu/image-20251021213834931.png)![](/images/yuque/e72a8884adf2741d.png)

![](D:/Learn/Computer/Go/note/jichu/image-20251021213856861.png)![](/images/yuque/81457273b54b2d9f.png)

#### 使用
+ ![](D:/Learn/Computer/Go/note/jichu/image-20251021213926510.png)![](/images/yuque/2dd403c21a8212c1.png)

```go
package main

import "fmt"

func main() {
    c := make(chan int)

    go func() {
        defer fmt.Println("goroutine end")

        fmt.Println("goroutine start")

        c <- 666
    }()

    num := <-c
    fmt.Println("main goroutine num =", num)
}
```

![](D:/Learn/Computer/Go/note/jichu/image-20251021214317265.png)![](/images/yuque/dc67c97c06531906.png)

若是子go程先到传送管道`c <- 666`,但主go程还没到`num := <- c`时，子go程会阻塞，等到主go程到接受时，阻塞才会消失，反之亦然（两边需要同时又接受和发送）。

#### 无缓冲和有缓冲的channel同步问题
##### 无缓冲的channel
1.9.2.2中的例子就是无缓冲

![](D:/Learn/Computer/Go/note/jichu/image-20251025161330880.png)![](/images/yuque/4e081b52a3776df7.png)

+ 第一步，两个 goroutine 都到达通道，但哪个都没有开始执行发送或者接收。
+ 第二步，左侧 goroutine 将它的手伸进了通道，这模拟了向通道发送数据的行为。这时，这个 goroutine 会在通道中被锁住，直到交换完成。
+ 第三步，右侧 goroutine 将它的手放入通道，这模拟了从通道里接收数据。这个 goroutine 一样也会在通道中被锁住，直到交换完成。
+ 第四步和第五步，进行交换，并最终，在第六步，两个 goroutine 都将它们的手从通道里拿出来，这模拟了被锁住的 goroutine得到释放，可以去做别的事。

##### 有缓冲的channel
![](D:/Learn/Computer/Go/note/jichu/image-20251025164018142.png)![](/images/yuque/22ec4b9621a03140.png)

+ 在第1步，右侧的 goroutine 正在从通道接收一个值。
+ 在第2步，右侧的这个 goroutine 独立完成了接收值的动作，而左侧的  
goroutine 正在发送一个新值到通道里。
+ 在第3步，左侧的 goroutine 还在向通道发送新值，而右侧的goroutine 正在从通道接收另外一个值。这个步骤里的两个操作既不是同步的，也不会互相阻塞。
+ 最后，在第4步，所有的发送和接收都完成，而通道里还有几个值，也有一些空间可以存更多的值。
+ 特点
    - 当channel已经满，再向里面写数据，就会阻塞
    - 当channel为空，从里面取数据也会阻塞

#### 关闭channel
```go
func main() {
    c := make(chan int, 5)

    go func() {
        for i := 0; i < 5; i++ {
            c <- i
        }
        close(c)
    }()

    for {
        if data, ok := <-c; ok {
            fmt.Println("data =", data)
        } else {
            fmt.Println("channel 已关闭，读取数据结束")
            break
        }
    }

    fmt.Println("main go程关闭")
}
```

+ channel不像文件一样需要经常去关闭，只有当你确实没有任何发送数据了，或者你想显式的结束range循环之类的，才去关闭channel；
+ 关闭channel后，无法向channel再发送数据（引发panic错误后导致接收立即返回零值）；
+ 关闭channel后，可以继续从channel接收数据；
+ 对于nil channel，无论收发都会被阻塞。

验证`channel`是否关闭的range写法

```go
//使用range来迭代不断操作channel
for data := range c{
    fmt.Println(data)
}

fmt.Println("Main Finished")
```

## base64
**Base64 是一种“把任意数据（比如图片、文件）转成纯文本”的编码方法，方便在网络或文本系统中安全传输。**

---

### 🧩 举个生活中的例子：寄快递
想象你要寄一个**玻璃花瓶**（二进制数据，比如一张图片）：

+ **问题**：快递公司只收**纸箱**（文本系统，比如 JSON、邮件、URL），不收裸露的玻璃瓶。
+ **解决办法**：你把花瓶**装进一个标准纸箱**，纸箱上贴标签写“这是花瓶”，快递就能送了。

✅ **Base64 就是这个“标准纸箱”** —— 它把不能直接放文本里的数据，**打包成一串只包含字母、数字、+、/、= 的安全字符串**。

---

### 🔢 技术上简单说
+ 计算机数据本质是 **字节（0~255）**（二进制）
+ 但有些系统（比如网页、邮件、JSON）**只认文本字符**（如 A-Z, 0-9）
+ Base64 把 **每 3 个字节（24 位）** 拆成 **4 个 6 位的小组**，每个小组对应一个 **0~63 的数字**
+ 这个数字再映射到一个**安全字符表**：

如果不够，就用 `=` 补齐（叫“padding”）

---

### 🌰 举个实际例子
原始数据（字符串）：`"Hi"`

+ 在计算机里是两个字节：`72` 和 `105`

共16位 01001000 01101001 00 补两个0变为6的倍数分为三组，因为原始是二字节，所以补一个 `=`一字节

+ 经过 Base64 编码后变成：`"SGk="`

---

### ✅ 为什么需要 Base64？
| 场景 | 问题 | Base64 的作用 |
| --- | --- | --- |
| **在 JSON 中嵌入图片** | JSON 只能放文本 | 把图片转成 Base64 字符串 |
| **HTML 中内联图片** | `![](data:image/png;base64,...)>` | 避免额外请求 |
| **邮件附件** | 邮件协议是文本协议 | 用 Base64 打包二进制附件 |
| **API 传文件** | 某些老接口只接受字符串 | 把文件转 Base64 传 |

💡 **注意**：Base64 **不是加密**！它只是编码，谁都能解码。

---

### ⚠️ 缺点
+ **体积变大**：3 字节 → 4 字符，**增加约 33% 大小**
+ **不适合大文件**：比如 10MB 图片 → 13MB Base64 字符串，拖慢网页

所以一般只用于**小图标、小配置、临时数据**。

---

### 🆚 对比其他编码
| 编码 | 字符集 | 用途 |
| --- | --- | --- |
| **Base64** | A-Za-z0-9+/= | 通用二进制转文本 |
| **Hex（十六进制）** | 0-9a-f | 调试、颜色值（如 `#ff0000`） |
| **URL 编码** | % + 两位十六进制 | 把特殊字符转安全（如空格 → `%20`） |

---

### ✅ Go 中怎么用？
```go
package main

import (
    "encoding/base64"
    "fmt"
)

func main() {
    data := []byte("Hello, 世界")

    // 编码
    encoded := base64.StdEncoding.EncodeToString(data)
    fmt.Println("Base64:", encoded)
    // 输出: SGVsbG8sIOS4lueVjA==

    // 解码
    decoded, _ := base64.StdEncoding.DecodeString(encoded)
    fmt.Println("原始:", string(decoded))
    // 输出: Hello, 世界
}
```

---

### ✅ 总结（记住这几句）
+ **Base64 = 二进制 → 安全文本**
+ **只用字母、数字、+、/、=，任何系统都能传**
+ **不是加密，只是“打包”**
+ **体积变大 33%，适合小数据**
+ **常见于：图片内联、API 传文件、邮件附件**

就像把“玻璃花瓶”装进“标准纸箱”——**不是改变内容，而是让它能安全送达** 📦✨

 `data:image/png;base64,iVBORw...` 这是**一张被 Base64 打包的图片**

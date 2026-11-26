---
title: 力扣
date: '2026-10-22'
summary: >-
  小记当数组有序且需要查找某个数时，采用二分查找，时间复杂度O(log n )递归破解递归的核心在于准确界定状态的语义。我们必须明确 dfs(n)
  所代表的物理含义，即：针对规模为 n 的子问题，其最终的计算结果或所满足的约束条件是什么
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/gny439m5vxriuqr3'
---
<details class="lake-collapse"><summary id="ua825d103">小记</summary><p id="u6c318fee" class="ne-p"><strong>当数组有序且需要查找某个数时，采用二分查找，时间复杂度</strong><code class="ne-code"><strong>O(log n )</strong></code></p></details>

# 递归
> 破解递归的核心在于**准确界定状态的语义**。我们必须明确 `dfs(n)` 所代表的物理含义，即：**针对规模为 **`**n**`** 的子问题，其最终的计算结果或所满足的约束条件是什么**
>
> 背包问题中：dfs(n)定义为在n的时候当前的最优情况
>
> 人脑不适合深度思考递归，容易爆炸，所以我们只用定义好一个整体，然后用数学归纳法即可。**不要陷入死胡同！！！**
>

递归问题：将原问题变成相似的小问题。但子问题需要把计算结果返给上一级问题这更适合用递归实现

比如在求二叉树的深度的时候，可以转化为左子树和右子树中最大的深度+1，而求左右子树深度也可以用这种方式（左子树和右子树中最大的深度+1）

递：从原问题出发，把问题分成更小的子问题

边界条件：递的尽头

归：到达边界条件后返回

**数学归纳法：**最简单和常见的数学归纳法是证明当n等于任意一个自然数时某命题成立。证明分下面两步：

1.证明“当n=1时命题成立。“(选择数字1因其作为自然数集合中中最小值)

2.证明“若假设在n=m时命题成立，可推导出在n=m+1时命题成立。(m代表任意自然数）“

这种方法的原理在于：首先证明在某个起点值时命题成立，然后证明从一个值到下一个值的过程有效。当这两点都已经证明，那么任意值都可以通过反复使用这个方法推导出来。把这个方法想成多米诺骨牌效应也许更容易理解一些。[2][3]例如：你有一列很长的直立着的多米诺骨牌，如果你可以：

1.证明“第一张骨牌会倒。“

2.证明”只要任意一张骨牌倒了，其下一张骨牌也会因为前面的骨牌倒而跟著倒。“则可下结论：所有的骨牌都会倒下。

## 阶乘
  
1.**第一步：明确函数功能**

![](/images/yuque/9b048650ba640657.png)

**2.第二步：写出基本情况**

![](/images/yuque/60fc221121716a9f.png)

问题被分解到最小，不需要继续分解

**3.第三步：写出递归情况**

**假设递归调用的部分可以得到正确答案 ****先相信**

递和归

![](/images/yuque/04be2f56bdf3397b.png)

**例子：排队问题**

排在一个很长的队伍中，你想要知道自己的位置，需要去问前面的人在第几位，最后加1

前面的人同样也需要自己的位置，然后也会问他前面的人在第几位，加1......

边界条件：到队头，队头知道自己是第一个，就告知前面（归），然后一个一个告诉后面自己的位置

![](/images/yuque/389c755956b8b459.png)

## 139.单词拆分
+ 记忆化搜索 + 递归

```go
func wordBreak(s string, wordDict []string) bool {
    maxLen := 0
    words := make(map[string]bool,len(wordDict))
    for _, w := range wordDict{
        words[w] = true
        maxLen = max(maxLen, len(w))
    }

    n := len(s)

    memo := make([]int8, n+1)
    for i := range memo {
        memo[i] = -1
    }

    var dfs func(int) int8
    dfs = func(i int) (res int8){
        if i == 0 {
            return 1
        }

        p := &memo[i]
        if *p != -1{
            return *p
        }
        defer func() {
            *p = res
        }()
        for j := i - 1; j >= max(i-maxLen, 0); j-- {
            if words[s[j:i]] && dfs(j) == 1{
                return 1
            }
        }

        return 0
    }
    return dfs(n) == 1
}
```

状态定义与状态转移方程

根据上面的讨论，**定义状态为 dfs(i)，表示能否把前缀 s[:i]（表示 s[0] 到 s[i−1] 这段子串）划分成若干段，使得每段都在 wordDict 中。**

# 双指针
283.移动0

![画板](/images/yuque/5a16d0f7ee1ea9de.jpg)

## 15.三数之
## 滑动窗口
### 定长滑动窗口
1456 中等题

![画板](/images/yuque/f170ccfb6f492b79.jpg)

```go
func maxVowels(s string, k int) (ans int) {
    //step1: 先取一个大小为k的窗口，计算个数
    // 从窗口最右边开始算
    count := 0
    for i, right := range s {
         if right == 'a' || right == 'e' || right == 'i' || right == 'o' || right == 'u' {
            count++
        }

        left := i - k + 1
        if left < 0 {
            continue
        }

        ans = max(ans, count)

        out := s[left]
        if out == 'a' || out == 'e' || out == 'i' || out == 'o' || out == 'u' {
            count-- //左端点离开窗口，为下一次循环准备
        }

    }
    return
}
```

# 子串
## 和为K的子数组
1. 利用前缀和思想 前缀和之差为某个子数组的和
2. 算出所有的前缀和的数组，利用两数之和的思路，利用哈希表map[si - k] 算出和为k的子数组和

**核心公式：** 前缀和`_s[0]=0, s[i]=nums[0]+nums[1]+⋯+nums[i−1]_`

_    _设 i<j，如果 nums[i] 到 nums[j−1] 的元素和等于 k，用前缀和表示，就是 `_s[j]−s[i]=k_`

```go
func subarraySum(nums []int, k int) (ans int) {
    // 1. 利用前缀和 和 哈希表
    // 前缀和之差为子数组和
    s := make([]int, len(nums)+1)
    for i, x := range nums {
        s[i+1] = s[i] + x
    }
    // 2. 哈希表 参考两数之和，利用哈希表找是否存在 si - k 的子数组和是否存在
    cnt := make(map[int]int, len(s))
    for _, si := range s{
        ans += cnt[si - k]
        cnt[si] ++ 
    }
    return 
}
```

## 239. 滑动窗口最大值 ——「单调队列」核心笔记
### 一、 核心心法：职场「降本增效」模型
将滑动窗口想象成一家**最多容纳 k 个人的公司**，遍历数组的过程就是不断招入新员工、淘汰老员工的过程：

| **职场规则** | **算法动作** | **队列操作方向** |
| --- | --- | --- |
| **1. 降本增效（实力淘汰）** | 新员工 `x`
 比老员工强（或一样强），老员工既老又弱，永无出头之日，直接裁掉 | **队尾出队**（右出） |
| **2. 新人入职（全员候补）** | 裁完比自己弱的人后，新员工入职（哪怕他很弱，但因为年轻，熬走前辈后可能当老大） | **队尾入队**（右进） |
| **3. 35岁危机（年龄淘汰）** | 能力最强的销冠（队首）一旦超出窗口左边界，强制退休 | **队首出队**（左出） |
| **4. 任命销冠（记录答案）** | 经过上述筛选，留在公司最左边（队首）的永远是当前窗口能力最强的人 | **读取队首** |

### 二、 数据结构设计：为什么这么存？
+ **双端队列（Deque）：** 因为队尾要进人、也要裁人（右进右出），队首还要让超龄员工退休（左出），所以两端都要能操作。
+ **单调递减：** 队首永远是最大值，往队尾方向依次递减（里面存的全是未来可能上位的“年轻候补”）。
+ **存下标，不存数值：** 下标是一石二鸟的——既能通过 `nums[idx]` 查到**能力值**，又能通过下标大小直接算出**员工年龄**（判断是否滑出左边界 `left`）。

### 三、 四步标准流水线（循环内部逻辑）
假设当前遍历到下标 `right`，元素值为 `x`，窗口左边界为 `left := right - k + 1`：

1. **右出（裁掉弱者，维护单调递减）：** 只要队列不为空，且新元素 `x` 大于等于队尾元素，就把队尾元素不断踢出。

```go
for len(q) > 0 && x >= nums[q[len(q)-1]] {
    q = q[:len(q)-1]
}
```

2. **右进（新人入队）：** 将当前元素的下标 `right` 放入队尾。Go

```go
q = append(q, right)
```

3. **左出（到龄退休，维护窗口范围）：** 如果队首下标已经小于窗口左边界 `left`，说明已滑出窗口，从队首移除。G

```go
if q[0] < left {
    q = q[1:]
}
```

4. **记录答案（窗口成型后收集队首）：** 当 `left >= 0`（即遍历满前 $k$ 个元素，第一个完整窗口形成）时，队首 `nums[q[0]]` 就是当前窗口的最大值。

```go
if left >= 0 {
    ans = append(ans, nums[q[0]])
}
```

### 四、 完整标准代码（统一变量名版）
```go
func maxSlidingWindow(nums []int, k int) (ans []int) {
    var q []int // 单调递减双端队列，存储元素下标

    for right, x := range nums {
        // 1. 右出：新员工更强，裁掉队尾所有不如他的老员工
        for len(q) > 0 && x >= nums[q[len(q)-1]] {
            q = q[:len(q)-1]
        }

        // 2. 右进：新员工入职
        q = append(q, right)

        // 3. 左出：队首老大哥超出窗口范围（到龄退休）
        left := right - k + 1
        if q[0] < left {
            q = q[1:]
        }

        // 4. 记答案：窗口达到大小 k 后，队首即为当前最大值
        if left >= 0 {
            ans = append(ans, nums[q[0]])
        }
    }
    return ans
}
```

## 五、 复杂度速记
+ **时间复杂度：**O(n)。虽然 `for` 循环里套了 `for` 循环，但每个元素**最多入队 1 次、出队 1 次**，没有重复进出，均摊下来总操作次数不超过 $2n$。  

+ **空间复杂度：**O(k)。队列中同时存在的下标个数不会超过窗口大小 k（Go 切片直接 `q[1:]` 缩容未释放底层数组时，整体辅助空间可视为 O(n)）。

## 最小覆盖子串
窗口思想，维护右端点，左端点在满足所需条件时，向右端点靠拢

此题条件和之前所有字母异位词的很像，利用涵盖作为判断条件：窗口中与所需字符字母相同的字母数大于等于所需字符内的字母，说明是所需的，然后左端点进行向右靠拢，更新最小窗口

右指针负责扩张，直到**频次全面覆盖**目标字符；一旦覆盖，左指针开始向右挤压水分并更新最小窗口，**直到刚好破坏覆盖状态**（某字符频次不达标）为止。

```go
func minWindow(s string, t string) string {
    var cntS, cntT [128]int
    for _, c := range t {
        cntT[c] ++
    }

    ansLeft, ansRight := -1, len(s)
    left := 0 

    for right, c := range s {
        cntS[c] ++
        for isCovered(cntS[:], cntT[:]) {
            if right - left < ansRight - ansLeft {
                ansLeft, ansRight = left, right
            }
            cntS[s[left]] --
            left ++
        }
    }
    if ansLeft < 0 {
        return ""
    }
    return s[ansLeft : ansRight + 1]    
}

func isCovered(cntS, cntT []int) bool {
    for i := 'A'; i <= 'Z'; i ++{
        if cntS[i] < cntT[i]{
            return false
        }
    }
    
    for i := 'a'; i <= 'z'; i ++ {
        if cntS[i] < cntT[i]{
            return false
        }
    }
    return true
}
```

# 贪心
## 跳跃问题
**I.**能否到达

思路：遍历数组的同时，维护（更新）可到达的最右端点，

如果 i>mx，说明无法跳到 i，返回 false；否则，用 i+nums[i] 更新 mx 的最大值

```go
func canJump(nums []int) bool {
    // 1.下标大于当前最远距离不可到达,自身下标加自身表示能到达的最远距离

    maxTarget := nums[0]

    for i, num := range nums {
        
        if i > maxTarget {//无法到达
            return false
        }
        maxTarget = max(i+num, maxTarget)
    }
    return true

}
```

**II.**必定到达，算最少次数

思路：按建桥想法，维护最右端点，无桥可走后回头挑选可建桥最远右端点

![](/images/yuque/4658437a4b0a9f34.png)

# 普通数组
## 41.缺失的第一个正数
按照对应数字所在数组位置排列，按例子说明更易理解

**示例一：**

```plain
输入：nums = [1,2,0]
输出：3
解释：范围 [1,2] 中的数字都在数组中。
```

假设下标从1开始**（写代码时不要忘了下标和当前位置应对应的数差1）**。此时`nums[1]`是 1，跳过；看`nums[2]`，为2，跳过；看`nums[3]`为0，无法交换。再次遍历，最小是`nums[3]!=3`,返回3.。

`示例二`

假设 nums=[3,4,−1,1]，这是题目中的示例 2。

1. 从 nums[1] 开始。这个座位上的学生，学号是 3，他应当坐在 nums[3] 上，所以他和 nums[3] 交换。交换后 nums=[−1,4,3,1]。
2. 仍然看 nums[1]，这个座位上的学生，学号是 −1，忽略。 	

`**for 1 <= nums[i] && nums[i] <= n && nums[i] != nums[nums[i]-1]**`

3. 向后遍历，nums[2]=4，他应当坐在 nums[4] 上，所以他和 nums[4] 交换。交换后 nums=[−1,1,3,4]。
4. 仍然看 nums[2]=1，他应当坐在 nums[1] 上，所以他和 nums[1] 交换。交换后 nums=[1,−1,3,4]。
5. 仍然看 nums[2]，这个座位上的学生，学号是 −1，忽略。
6. 向后遍历，nums[3]=3，他坐在正确的座位上。
7. 向后遍历，nums[4]=4，他坐在正确的座位上。换座位过程结束。
8. 再次遍历 nums，发现 nums[2]= −1 != 2，说明教室中没有学号为 2 的学生（否则他会坐在 nums[2] 上），所以答案是 2。

上述虽然说是nums[4]=4 即nums[i]=i，但在实际写代码中要记得改成`nums[i]=i+1`才对

`**nums[i] != nums[nums[i]-1]**`如果数组中有重复数字，判断该数应在位置是否已经安放正确，安放正确就遍历下一个。例子：_nums_=[1,1,2]   遍历到nums[2-1]=1时，判断出`nums[2-1] != nums[nums[2]-1] // 1 != nums[0]`不成立，所以跳过，遍历nums[3-1]。

```go
func firstMissingPositive(nums []int) int {
    n := len(nums)
    // 判断nums[i] == i
    for i := range n {
        for 1 <= nums[i] && nums[i] <= n && nums[i] != nums[nums[i]]{
            j := nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
        } 
    }

    for i := range n {
        if nums[i] != i + 1{
            return i+1 
        }
    }

    return n+1 //都在对应位置
}
  
```

## 53.最大子数组和
**自我思考：「方法一」：维护一个 sum，小于 0 就重新开始。在算法界被称为 Kadane 算法（本质上也就是空间优化后的动态规划，或者叫贪心算法）。**

维护一个 sum，小于 0 就重新开始

```go
func maxSubArray(nums []int) int {
    ans := nums[0] // 用第一个数字兜底，防止全负数数组
    sum := 0
    
    for _, x := range nums {
        // 核心逻辑：带上历史资产
        sum += x 
        
        // 随时记录出现过的最高光时刻
        ans = max(ans, sum) 
        
        // 你的核心直觉：如果加完之后资产变成负数了，直接清零，重新开始！
        if sum < 0 {
            sum = 0 
        }
    }
    return ans
}
```

**「方法二」：前缀和 + 贪心**

维护最小前缀和，利用当前前缀和与其差计算最大子数组和

若是只计算最大前缀和可能会出现最小前缀和在最大前缀和的右边，无法形成子数组

（很经典的看到子数组想到的方法，利用前缀和之差进行计算）

```go
func maxSubArray(nums []int) (ans int) {
    ans = math.MinInt
    var current_prefix, min_prefix int
    
    for _, x := range nums {
        current_prefix += x
        
        ans = max(ans, current_prefix - min_prefix)
        min_prefix = min(min_prefix, current_prefix)
    }
    return
}
```

**「方法三」：动态规划**

维护一个dp数组，存每个下标的前缀和，若当前下标之前的前缀和为负数，则从当前下标重新开始计算前缀和（即从当前下标的数重新开始维护子数组）

取dp数组中最大的数，即所求子数组最大和

```go
func maxSubArray(nums []int) (ans int) {
    dp := make([]int, len(nums))
    dp[0] = nums[0]
    for i := 1; i < len(nums); i ++ {
        dp[i] = max(dp[i-1], 0) + nums[i]
    }
    return slices.Max(dp)
}
```

## 56.合并区间
先将数组中的所有集合的左端点按顺序排列

当前编列的数组的右端点小于当前ans数组（已经存入答案的）中的最后一个集合的右端点时，合并

![](/images/yuque/a41b7c486e023d20.png)

```go
func merge(intervals [][]int) (ans [][]int) {
	// 1. 先按每个数组的头元素从小到大进行排序
	slices.SortFunc(intervals, func(p, q []int) int { return p[0] - q[0] })

	for _, p := range intervals {
		n := len(ans)
        // 1. 当前数组左端点小于已有数组的右端点，合并
		if n > 0 && p[0] <= ans[n-1][1] {
			ans[n-1][1] = max(ans[n-1][1], p[1]) // 防止出现[1,4] [2,3]合并后变成[1,3],所以右端点选最大的
		} else { // 2. 直接加入
			ans = append(ans, p)
		}
	}
	return ans
}
```

## 57.反转数组
思路

![](/images/yuque/6acee81796a4bc92.png)

```cpp
while (i < j) {
    swap(nums[i++], nums[j--]);
}
```

```go
func rotate(nums []int, k int)  {
    k %= len(nums)
    slices.Reverse(nums)
    slices.Reverse(nums[:k])
    slices.Reverse(nums[k:])
}
```

## 238.除了自身以外数组的乘积
思路： 以自身为分界，**前后的前缀积**相乘即为_除了自身以外数组的乘积_

```go
func productExceptSelf(nums []int) (ans []int) {
    // 1. 知晓该数前后的前缀积
    n := len(nums)
    // 前
    pre := make([]int, n)
    pre[0] = 1
    for i := 1; i < n; i ++ {
        pre[i] = pre[i-1] * nums[i-1]
    }
    // 后
    suf := make([]int, n)
    suf[n-1] = 1
    for i := n - 2; i >= 0; i -- {
        suf[i] = suf[i+1] * nums[i+1]
    }

    for i, p := range pre {
        ans = append(ans, p * suf[i])
    }
    return 
}
```

# 回溯
## 78.子集
![](/images/yuque/9c93e94ca330e8ec.svg)

```go
func subsets(nums []int) [][]int {
	// 条件 子集长度等于数组长度 停止
	n := len(nums)
	ans := make([][]int, 0, 1<<n) //2^n
	path := make([]int,0,n)

	// nums[i]是否加入path
	var dfs func(int)
	dfs = func(i int) {
		if i == n {
			ans = append(ans, slices.Clone(path))
			return
		}

		// 不选nums[i]
		dfs(i + 1)

		path = append(path, nums[i])
		// 下一个数nums[i+1]选不选
		dfs(i + 1)
		path = path[:len(path)-1] // 回退
	}
    dfs(0)
	return ans
}

```

# 二分查找
:::color5
有序数组       O(logn)     查找某个数

:::

## 34.在排序数组中查找元素的第一个和最后一个位置
<details class="lake-collapse"><summary id="u83fce637"><strong>解题思路推进</strong></summary><p id="uad69fb6e" class="ne-p">第一阶段：识别二分查找</p><p id="ufa5c21e4" class="ne-p" style="text-indent: 2em">有序数组 + \(O(\log n)\) 的复杂度要求，优先考虑二分查找。</p><p id="uf0b9fb03" class="ne-p">第二阶段：寻找左右边界</p><p id="u9b07584f" class="ne-p" style="text-indent: 2em">普通二分只能找到一个匹配位置。通过记录 <code class="ne-code">ans</code>，并继续向左或向右二分寻找边界。</p><p id="ue8fa21a6" class="ne-p">第三阶段：抽象公共逻辑</p><p id="ucb4d43c8" class="ne-p" style="text-indent: 2em">发现 <code class="ne-code">searchLeft</code> 和 <code class="ne-code">searchRight</code> 只有相等时的指针移动方向不同，通过 <code class="ne-code">findLeft</code> 参数合并函数。</p><p id="u345f59ee" class="ne-p">第四阶段：转换为边界问题</p><p id="uff3a85fc" class="ne-p" style="text-indent: 2em">不再寻找等于 <code class="ne-code">target</code> 的元素，而是寻找第一个满足单调条件的位置。利用循环不变量，让 <code class="ne-code">left</code> 自然收敛到分界点。</p></details>
常规思路：

1. 先找到目标数 (target) 
2. 利用有序数组的特点，通过两次二分查找分别确定 target 的左边界和右边界。

当 `nums[mid] == target`时，不立即返回，而是记录当前下标，继续向对应方向缩小搜索区间。

3. 向左寻找（左边的数都是小于等于target的），`right = mid - 1`，反之`left = mid + 1`

```go
func searchRange(nums []int, target int) (an []int){
    // 1. 有序且O（logn），二分查找
    start := search(nums, target, true)
    end := search(nums, target, false)
    an = []int{start, end}
    return 
}
// 2. 找到目标数后，向左右两边继续寻找，找到开始和结束位置
func search(nums []int, target int, findLeft bool) int{
    left, right := 0 , len(nums) - 1
    ans := -1

    for left <= right {
        mid := left + (right-left)/2
        if target < nums[mid] {
            right = mid - 1
        }else if target > nums[mid]{
            left = mid + 1
        }else {
            ans = mid
            if findLeft {
                right = mid - 1
            }else {
                left = mid + 1
            }
        }
    }
    return ans 
}
```

**lower-bound**** **二分查找，找到当前数左边界

核心步骤

第一，`left` 左边的所有元素，都已经确认小于 `target`。

第二，`right` 右边的所有元素，都已经确认大于等于 `target`。`[left, right]`是当前尚未确定的搜索区间。

![](/images/yuque/31fcd7f1b36ce93b.png)

```go
    for left <= right { 
        mid := left + (right-left)/2
        if nums[mid] >= target {
            right = mid - 1 // 范围缩小到 [left, mid-1]
        } else {
            left = mid + 1 // 范围缩小到 [mid+1, right]
        }
    }

```

`lowerBound(nums, target)`第一个 >= target 的位置

`lowerBound(nums, target+1)`第一个 > target 的位置

`lowerBound(nums, target+1)-1`最后一个 == target 的位置

题解

```go
// lowerBound 返回最小的满足 nums[i] >= target 的下标 i
// 如果数组为空，或者所有数都 < target，则返回 len(nums)
// 要求 nums 是非递减的，即 nums[i] <= nums[i + 1]
func lowerBound(nums []int, target int) int {
    left, right := 0, len(nums)-1 // 闭区间 [left, right]
    for left <= right { // 区间不为空
        // 循环不变量：
        // nums[left-1] < target
        // nums[right+1] >= target
        mid := left + (right-left)/2
        if nums[mid] >= target {
            right = mid - 1 // 范围缩小到 [left, mid-1]
        } else {
            left = mid + 1 // 范围缩小到 [mid+1, right]
        }
    }
    // 循环结束后 left = right+1
    // 此时 nums[left-1] < target 而 nums[left] = nums[right+1] >= target
    // 所以 left 就是第一个 >= target 的元素下标
    return left
}

func searchRange(nums []int, target int) []int {
    start := lowerBound(nums, target)
    if start == len(nums) || nums[start] != target {
        return []int{-1, -1} // nums 中没有 target
    }
    // 如果 start 存在，那么 end 必定存在
    end := lowerBound(nums, target+1) - 1
    return []int{start, end}
}

作者：灵茶山艾府
链接：https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
```

## 33. 搜索旋转排序数组
**元素互不相同、原数组严格递增且只旋转一次**

旋转后的数组虽然整体不是有序的，但是局部有序

当`nums[left] < nums[mid]`时， [left, mid] 这部分时有序且递增的，因为断点是在右半部分的  
当`nums[left] > nums[mid]`时， [mid, right] 这部分时有序且递增的，因为断点是在左半部分的

# 矩阵
## 73.矩阵置零
思路：当i行j列的数为0时，将它所在的行和列的第一个元素设置为0。再次遍历整个矩阵，当检测到这个数所在的行或列的第一个元素为0时，将这个数置为0。`if matrix[i][0] == 0 || matrix[0][j] == 0`

当然这个思路需要先考虑原矩阵的第一行或第一列是否有0，如果不先跳过第一行或第一列，会导致我们在第二次遍历置0的步骤时会出现_错误的情况_：_因为我们第一步将它所在的行和列的第一个元素设置为0，所以我们遍历的时候会误以为这个0是自带的，会导致第一行或第一列本来没有0的情况下被我们全部置为0了。_所以这样的情况下，我们判断第一行和第一列是否有0，置0时先跳过，当除了第一行和第一列的数已经被设置后，再通过我们之前的判断重新设置第一行和第一列的数。

```go
func setZeroes(matrix [][]int)  {
    m, n := len(matrix), len(matrix[0]) // 行数， 列数
    // 第一行是否有0
    firstRowZero := slices.Contains(matrix[0], 0)   
    // 第一列是否有0
    firstColZero := false
    for _, row := range matrix {
        if row[0] == 0 {
            firstColZero = true
            break
        }
    }

    for i := 1; i < m ; i ++ {
        for j := 1; j < n; j ++ {
            if matrix[i][j] == 0{
                matrix[i][0] = 0
                matrix[0][j] = 0
            }
        }
    }

    for i := 1; i < m ; i ++ {
        for j := 1; j < n; j ++ {
            if matrix[i][0] == 0 || matrix[0][j] == 0{ // 某行的第一个或者某列的第一个有0
                matrix[i][j] = 0 
            }
        }
    }

    if firstColZero {
        for _, row := range matrix {
            row[0] = 0 
        }
    }

    if firstRowZero {
        for i := 0; i < n; i ++ {
            matrix[0][i] = 0
        }
    }
}
```

## 54.螺旋矩阵
**思路一（标记）：**定义四个方向的二维数组 `dir := [4][2]int{{0,1},{1,0},{0,-1},{-1,0}} //右 下 左 上`

每次先判断下一个数的坐标，如果合理（没有越界，没有遍历过），则加入到答案中；如果不合理，则将二维数组的行数加一（换方向），因为有4个方向，当到3时再转向就是回到0

```go
func spiralOrder(matrix [][]int) []int {
    // 遍历到行列的极限再转弯
    // 1.定义四个方向
    r, c := len(matrix), len(matrix[0]) 
    dir := [4][2]int{{0,1},{1,0},{0,-1},{-1,0}} //右 下 左 上
    i, j, di := 0, 0, 0
    ans := make([]int, r*c)
    // 2.转弯时下标加1
    for k := range ans {
        ans[k] = matrix[i][j]
        matrix[i][j] = 101
        // 先算出下一位置坐标， 判断是否需要转向
        x, y := i + dir[di][0], j + dir[di][1]
        if x < 0 || x >= r || y < 0 || y >= c || matrix[x][y] == 101{
            di = (di + 1) % 4
        }
        i += dir[di][0]
        j += dir[di][1]
    }
    return ans
}
```

**思路二（不标记）：**走的步数是有规律的，可以控制每个方向走多少步。

以下来自灵茶山艾府的思路（需反复细品）： m是行长，n是列长

+ 从 (0,−1) 开始。
+ 一开始，向右走 n 步，每次先走一步，再把数字加入答案。走 n 步即 1→2→3→4，矩阵第一排的数都加入了答案。
+ 然后向下走 m−1 步，即 8→12。
+ 然后向左走 n−1 步，即 11→10→9。
+ 然后向上走 m−2 步，即 5。
+ 然后向右走 n−2 步，即 6→7。
+ 重复上述过程，直到答案的长度等于 mn。

代码实现时，可以这样简化代码：

+ 一开始走 n 步。
+ 把 n,m 分别更新为 m−1,n，这样下一轮循环又可以走 n 步（相当于走了 m−1 步），无需修改其他逻辑。
+ 把 n,m 分别更新为 m−1,n，这样下一轮循环又可以走 n 步（相当于走了 n−1 步）。
+ 把 n,m 分别更新为 m−1,n，这样下一轮循环又可以走 n 步（相当于走了 m−2 步）。
+ 依此类推，每次只需把 n,m 分别更新为 m−1,n 即可。`n, m = m-1, n`

```go
var dirs = [4][2]int{{0, 1}, {1, 0}, {0, -1}, {-1, 0}} // 右下左上

func spiralOrder(matrix [][]int) []int {
    m, n := len(matrix), len(matrix[0])
    ans := make([]int, 0, m*n)
    i, j := 0, -1 // 从 (0, -1) 开始
    for di := 0; len(ans) < cap(ans); di = (di + 1) % 4 {
        for range n { // 走 n 步（注意 n 会减少）
            i += dirs[di][0]
            j += dirs[di][1] // 先走一步
            ans = append(ans, matrix[i][j]) // 再加入答案
        }
        n, m = m-1, n // 减少后面的循环次数
    }
    return ans
}
```

## 48.旋转矩阵
### 顺时针旋转90°
![](/images/yuque/3f5bde2df557a1b9.png)

可以看到，原本在 {i,j} 的元素经过顺时针旋转了90°以后是来到了 {j,n-1-i} 的位置

利用数学思维 可以看成矩阵先转置再行翻转

1. 转置：把矩阵按照主对角线翻转，位于 (i,j) 的元素去到 (j,i)。【行变成列】
2. 行翻转：把每一行翻转，位于 (j,i) 的元素去到 (j,n−1−i)。

```go
func rotate(matrix [][]int)  {
    // {i,j} -> {j, n-1-i}
    n := len(matrix)
    // 沿对角线翻转（转置）
    for i := range n {
        for j := range i {
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        }
    }

    // 左右翻转
    for _, row := range matrix{
        slices.Reverse(row)
    }
}
```

### 顺时针旋转180°
先列翻转再行翻转

```go
func rotate180(matrix [][]int) {
    n := len(matrix)
    
    // 原子操作 1：上下翻转 (利用 Go 切片特性，极速交换整行)
    for i := 0; i < n/2; i++ {
        // 直接交换两行的切片头，而不是交换里面的每一个数字！
        matrix[i], matrix[n-1-i] = matrix[n-1-i], matrix[i]
    }
    
    // 原子操作 2：左右翻转 (遍历每一行，将行内元素首尾对调)
    for i := 0; i < n; i++ {
        for j := 0; j < n/2; j++ {
            matrix[i][j], matrix[i][n-1-j] = matrix[i][n-1-j], matrix[i][j]
        }
    }
}
```

### 顺时针旋转270°（逆时针旋转90°）
![](/images/yuque/fcec21138074e53d.png)

先转置再上下翻转

```go
func rotate270(matrix [][]int) {
    n := len(matrix)
    
    // 原子操作 1：转置 (沿主对角线对调)
    // 注意内层循环 j 从 i 接着往后走，只遍历右上半区，防止换两次变回原样
    for i := 0; i < n; i++ {
        for j := i; j < n; j++ {
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        }
    }
    
    // 原子操作 2：上下翻转 (同样利用 Go 切片指针交换大法)
    for i := 0; i < n/2; i++ {
        matrix[i], matrix[n-1-i] = matrix[n-1-i], matrix[i]
    }
}
```

## 240.搜索二维矩阵
**「方法一」二分法**

求解矩阵中点，判断左上和右下角与所求数的关系（作为剪枝）

判断中心点与目标数的关系，偏大不搜索右下象限，搜索其余三个；偏小不搜索左上象限，搜索其他三个

```go
func searchMatrix(matrix [][]int, target int) bool {
    if len(matrix) == 0 || len(matrix[0]) == 0 {
        return false
    }
    // 启动初始递归，传入整个矩阵的四个边界坐标
    return searchRec(matrix, target, 0, len(matrix)-1, 0, len(matrix[0])-1)
}

func searchRec(matrix [][]int, target, top, bottom, left, right int) bool {
    if left > right || top > bottom {
        return false
    }

    if target < matrix[top][left] || target > matrix[bottom][right] {
        return false // 连最小的都比 target 大，或者最大的都比 target 小，该区域无效
    }

    midRow := top + (bottom - top) / 2
    midCol := left + (right - left) / 2
    midVal := matrix[midRow][midCol]

    if midVal == target {
        return true
    }

    if midVal > target {
        // 中心点偏大，炸毁右下象限。去左上、右上、左下搜索
        return searchRec(matrix, target, top, midRow-1, left, midCol-1) ||   // 左上
               searchRec(matrix, target, top, midRow-1, midCol, right) ||    // 右上
               searchRec(matrix, target, midRow, bottom, left, midCol-1)     // 左下
    } else {
        // 中心点偏小，炸毁左上象限。去右下、右上、左下搜索
        return searchRec(matrix, target, midRow+1, bottom, midCol+1, right) || // 右下
               searchRec(matrix, target, top, midRow, midCol+1, right) ||      // 右上
               searchRec(matrix, target, midRow+1, bottom, left, midCol)       // 左下
    }
}

```

**「方法二」排除法**

判断每个矩阵右上角的数，如果比目标数小，行数加1；如果比目标数大，列数减1

```go
func searchMatrix(matrix [][]int, target int) bool {
    m, n := len(matrix), len(matrix[0])
    i, j := 0, n-1
    for i < m && j >= 0 {
        if matrix[i][j] == target {
            return true
        }

        if matrix[i][j] < target {
            i ++
        }else {
            j --
        }
    }
    return false
}
```

# 堆
## 215.数组中第k个最大的元素
快速选择算法 O(n)

最小堆算法 大量数据场景 O(nlogK)

### 快速选择算法
随机一个除了首尾的数作为基准数

按类似快排的方式，将小于基准数的放左边，大于的放右边

记录基准数下标

若基准数下标大于（n-k）【升序中第k大的元素位置】，则所求数在基准数左边，所以只用去左边的数组中进行再一次的快速选择。

```go
// 在子数组 [left, right] 中随机选择一个基准元素 pivot
// 根据 pivot 重新排列子数组 [left, right]
// 重新排列后，<= pivot 的元素都在 pivot 的左侧，>= pivot 的元素都在 pivot 的右侧
// 返回 pivot 在重新排列后的 nums 中的下标
// 特别地，如果子数组的所有元素都等于 pivot，我们会返回子数组的中心下标，避免退化
func partition(nums []int, left int, right int) int {
    // 1. 在子数组 [left, right] 中随机选择一个基准元素 pivot
    i := left + rand.Intn(right-left+1)
    pivot := nums[i]
    // 把 pivot 与子数组第一个元素交换，避免 pivot 干扰后续划分，从而简化实现逻辑
    nums[i], nums[left] = nums[left], nums[i]

    // 2. 相向双指针遍历子数组 [left + 1, right]
    // 循环不变量：在循环过程中，子数组的数据分布始终如下图
    // [ pivot | <=pivot | 尚未遍历 | >=pivot ]
    //   ^                 ^     ^         ^
    //   left              i     j         right

    i, j := left+1, right
    for {
        for i <= j && nums[i] < pivot {
            i++
        }
        // 此时 nums[i] >= pivot

        for i <= j && nums[j] > pivot {
            j--
        }
        // 此时 nums[j] <= pivot

        if i >= j {
            break
        }

        // 维持循环不变量
        nums[i], nums[j] = nums[j], nums[i]
        i++
        j--
    }

    // 循环结束后
    // [ pivot | <=pivot | >=pivot ]
    //   ^             ^   ^     ^
    //   left          j   i     right

    // 3. 把 pivot 与 nums[j] 交换，完成划分（partition）
    // 为什么与 j 交换？
    // 如果与 i 交换，可能会出现 i = right + 1 的情况，已经下标越界了，无法交换
    // 另一个原因是如果 nums[i] > pivot，交换会导致一个大于 pivot 的数出现在子数组最左边，不是有效划分
    // 与 j 交换，即使 j = left，交换也不会出错
    nums[left], nums[j] = nums[j], nums[left]

    // 交换后
    // [ <=pivot | pivot | >=pivot ]
    //               ^
    //               j

    // 返回 pivot 的下标
    return j
}

func findKthLargest(nums []int, k int) int {
    n := len(nums)
    targetIndex := n - k  // 第 k 大元素在升序数组中的下标是 n - k
    left, right := 0, n-1 // 闭区间
    for {
        i := partition(nums, left, right)
        if i == targetIndex {
            // 找到第 k 大元素
            return nums[i]
        }
        if i > targetIndex {
            // 第 k 大元素在 [left, i - 1] 中
            right = i - 1
        } else {
            // 第 k 大元素在 [i + 1, right] 中
            left = i + 1
        }
    }
}
```

# 链表
> 在链表题中，当有需要删除头节点的步骤时，设置dummy节点（哨兵节点）简化代码
>

## 206.反转链表
![](/images/yuque/56714e21aff2092f.png)

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func reverseList(head *ListNode) *ListNode {
    // 前面的数反过来指向后面的
    var pre *ListNode
    cur := head
    for cur != nil {
        i := cur.Next 
        cur.Next = pre
        pre = cur
        cur = i
    }
    return pre
}
```

## 234.回文链表
1. 找中间节点

一快一慢两指针，快的一次走两步，慢的一次走一步。快的走到头时，慢的正好到一半

2. 翻转中间节点之后的链表形成一个新链表head2

和206反转链表思路一样

3. 开始比较head2和head的各节点值是否相同（head只会到一半）

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func isPalindrome(head *ListNode) bool {
    // 找到中点，以中点为界翻转一边后比较
    mid := midNode(head)
    head2 := reverseList(mid)
    for head2 != nil {
        if head.Val == head2.Val{
            head = head.Next
            head2 = head2.Next
        }else {
            return false
        }
    }
    return true
}

// 找中点
func midNode(head *ListNode) *ListNode {
    // 一慢一块，快的走两步，慢的走一步，最后快的走到头的时候，慢的就是中点
    slow, fast := head, head
    for fast != nil && fast.Next != nil{
        fast = fast.Next.Next
        slow = slow.Next
    }
    return slow
}

func reverseList(head *ListNode) *ListNode {
    var pre *ListNode
    cur := head
    for cur != nil {
        i := cur.Next
        cur.Next = pre
        pre = cur
        cur = i
    }
    return pre
}
```

## 142.环形链表II
**思路一：快慢指针**

环形链表I的思路包含在其中

利用快慢指针

进入环后 

![](/images/yuque/81c2b4da309c8852.png)

假设链表结构如下：

+ 从**链表头**到**环入口**的距离是a。
+ 从**环入口**到快慢指针**相遇点**的距离是 b。
+ 从**相遇点**继续走，回到**环入口**的距离是 c。
+ 所以，环的周长就是 b + c。

当 `slow` 和 `fast` 相遇时：

+ **慢指针走过的距离：**a + b （慢指针入环后，走不完一圈就会被快指针追上）。
+ **快指针走过的距离：**a + n(b+c) + b （快指针可能在环里已经转了 $n$ 圈，其中 $n \ge 1$）。

因为快指针的速度是慢指针的 2 倍，所以相同时间内，**快指针走的路程是慢指针的 2 倍**：

2(a + b) = a + n(b + c) + b

我们来化简这个等式，目的是求出 a（头到入口的距离）：

两边同时减去 a 和 b：

1. a + b = n(b + c)

把式子变形，把 b 移到右边：

2. a = n(b + c) - b

为了看出规律，我们从 $n$ 圈中拿出 1 圈（即 b+c）与末尾的 $-b$ 抵消：

3. a = (n - 1)(b + c) + (b + c) - b

最终得到极其优美的一个结论：

4. a = (n - 1)(b + c) + c  **从“链表头（head）走到环入口的距离 (a)”，刚好等于“slow从相遇点走到环入口的距离 (c)”，再加上不知多少个整圈。 **所以二者相遇在入口	

<details class="lake-collapse"><summary id="ub0cd72ed"><strong>问题：快慢指针相遇时，为什么慢指针的移动距离小于环长？</strong></summary><p id="u2619abae" class="ne-p">![](/images/yuque/bd189ee3b63273f3.png)最坏情况</p><p id="u7ac98ebe" class="ne-p">以最坏情况看，slow进入环时，fast只比slow多一步。fast指针需要走（环长-1）步才能与慢指针相遇，所以慢指针移动距离是小于环长的。</p></details>
```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func detectCycle(head *ListNode) *ListNode {
    fast, slow := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast {
            for head != slow {
                slow = slow.Next
                head = head.Next
            }
            return slow
        }
    }
    return nil
}
```

**思路二：哈希 **

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func detectCycle(head *ListNode) *ListNode {
    seen := map[*ListNode]bool{}
    for head != nil {
        if seen[head]{
            return head
        }
        seen[head] = true
        head = head.Next
    }
    return nil
}
```

## 2.两数相加
链表从左到右 为个位 十位 百位依次增加

![](/images/yuque/b772969703dcba3c.png)

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func addTwoNumbers(l1 *ListNode, l2 *ListNode) *ListNode {
    return addTwo(l1,l2,0)
}

func addTwo(l1, l2 *ListNode, carry int) *ListNode {
    if l1 == nil && l2 == nil && carry ==0 {
        return nil
    }

    s := carry
    if l1 != nil {
        s += l1.Val
        l1 = l1.Next
    }

    if l2 != nil {
        s += l2.Val
        l2 = l2.Next
    }

    return &ListNode{s % 10, addTwo(l1,l2, s/10)}
}
```

## 19.删除链表的倒数第N个节点
两个指针，右指针先移动n步。当右指针到达链表末尾时，此时左指针所在位置为倒数第N个节点的前一个节点

![](/images/yuque/68dc79133f05e55f.png)

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func removeNthFromEnd(head *ListNode, n int) *ListNode {
    // 维护两个指针，差距为n。右端的指针先到末尾，左端的指针此时就是倒数第n个节点
    left, right := head,head
    for i := 0; i < n; i ++{
        right = right.Next
    }
    if right == nil {
        return head.Next
    }
    for right.Next != nil {
        right = right.Next
        left = left.Next
    }
    left.Next = left.Next.Next

    return head
}
```

设置哨兵节点简化代码

```go
func removeNthFromEnd(head *ListNode, n int) *ListNode {
    // 由于可能会删除链表头部，用哨兵节点简化代码
    dummy := &ListNode{Next: head}
    left, right := dummy, dummy
    for ; n > 0; n-- {
        right = right.Next // 右指针先向右走 n 步
    }
    for right.Next != nil {
        left = left.Next
        right = right.Next // 左右指针一起走
    }
    left.Next = left.Next.Next // 左指针的下一个节点就是倒数第 n 个节点
    return dummy.Next
}

```

## 24.两两交换链表的节点
因为最后要返回链表交换后的头节点，头节点会发生改变，所以设置哨兵节点。

利用哈希表判断是否已经交换过（后来思考了可以直接跳两步，因为从哨兵开始下一节点和下下节点是肯定交换过的，所以直接到下下个节点）。利用两个指针left，right，作为相邻指针交换。

```go
left.Next = right.Next
right.Next = left 
cur.Next = right
```

```go
func swapPairs(head *ListNode) *ListNode {
    dummy := &ListNode{Next: head}
    cur := dummy
    for cur.Next != nil && cur.Next.Next != nil{
        left := cur.Next
        right := cur.Next.Next
        left.Next = right.Next
        right.Next = left 
        cur.Next = right  
        cur = cur.Next.Next
    }
    return dummy.Next
}
```

## 25.k个一组的翻转链表
![](/images/yuque/6740b05257de2952.png)

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func reverseKGroup(head *ListNode, k int) *ListNode {
    var n int
    dummy := &ListNode{Next: head}
    p0 := dummy
    cur := head
    for cur != nil {
        n ++
        cur = cur.Next
    }
    var prv *ListNode
    cur = p0.Next
    for n >= k {
        n -= k
        
        for i := 0; i < k; i ++ {
            nxt := cur.Next
            cur.Next = prv
            prv = cur
            cur = nxt
        } // 循环结束后，prv指向原一组链表的尾，cur指向下一组的头

        nxt := p0.Next
        p0.Next.Next = cur // p0.Next指原一组链表的头，现在翻转到了尾要指向下一组的头
        p0.Next = prv
        p0 = nxt //p0更新为下一组的头的上一节点
    }
    return dummy.Next
}
```

## 138.随机链表的复制
![](/images/yuque/482ad34c04b7e101.png)

```go
/**
 * Definition for a Node.
 * type Node struct {
 *     Val int
 *     Next *Node
 *     Random *Node
 * }
 */

func copyRandomList(head *Node) *Node {
    for cur := head; cur != nil; cur = cur.Next.Next {
        cur.Next = &Node{Val: cur.Val, Next: cur.Next}
    }

    for cur := head; cur != nil; cur = cur.Next.Next {
        if cur.Random != nil {
            cur.Next.Random = cur.Random.Next
        }
    }

    dummy := Node{}
    tail := &dummy
    for cur := head; cur != nil; cur, tail = cur.Next, tail.Next {
        clone := cur.Next
        tail.Next = clone
        cur.Next = clone.Next
    }

    return dummy.Next
}
```

## LRU缓存策略
最近最少使用策略，将最近访问过的节点放置于头节点处（先移除，再添加），若数量超过可放置的数量，将最后的节点移除。

```go
type Node struct {
    key, value int
    prev, next *Node
}

type LRUCache struct {
    capacity  int
    dummy     *Node // 哨兵节点
    keyToNode map[int]*Node
}

func Constructor(capacity int) LRUCache {
    dummy := &Node{}
    dummy.prev = dummy
    dummy.next = dummy
    return LRUCache{
        capacity:  capacity,
        dummy:     dummy,
        keyToNode: map[int]*Node{},
    }
}

// 删除一个节点（抽出一本书）
func (c *LRUCache) remove(x *Node) {
    x.prev.next = x.next
    x.next.prev = x.prev
}

// 在链表头添加一个节点（把一本书放到最上面）
func (c *LRUCache) pushFront(x *Node) {
    x.prev = c.dummy
    x.next = c.dummy.next
    x.prev.next = x
    x.next.prev = x
}

// 获取 key 对应的节点，同时把该节点移到链表头部
func (c *LRUCache) getNode(key int) *Node {
    node := c.keyToNode[key]
    if node == nil { // 没有这本书
        return nil
    }
    c.remove(node)    // 把这本书抽出来
    c.pushFront(node) // 放到最上面
    return node
}

func (c *LRUCache) Get(key int) int {
    node := c.getNode(key) // getNode 会把对应节点移到链表头部
    if node == nil {
        return -1
    }
    return node.value
}

func (c *LRUCache) Put(key, value int) {
    node := c.getNode(key) // getNode 会把对应节点移到链表头部
    if node != nil {       // 有这本书
        node.value = value // 更新 value
        return
    }
    node = &Node{key: key, value: value} // 新书
    c.keyToNode[key] = node
    c.pushFront(node) // 放到最上面
    if len(c.keyToNode) > c.capacity { // 书太多了
        backNode := c.dummy.prev
        delete(c.keyToNode, backNode.key)
        c.remove(backNode) // 去掉最后一本书
    }
}

作者：灵茶山艾府
链接：https://leetcode.cn/problems/lru-cache/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
```

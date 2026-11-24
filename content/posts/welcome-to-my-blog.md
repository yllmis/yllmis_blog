---
title: 欢迎来到 yllmis 的博客
date: '2026-11-23'
summary: 第一篇示例技术文章，介绍本博客的 Markdown 存储与双模式架构。
tags:
  - Next.js
  - 博客搭建
---
# 你好，世界

欢迎来到 **yllmis的博客**！这是一个无需数据库、以 Markdown 文件为单一真源的个人博客。

## 核心特性

- 本地运行时直接读写 `content/` 目录下的 `.md` 文件
- 部署到 Vercel 后可配置 GitHub API 直接在线提交更新
- 技术文章支持 **Tag 分类筛选** 与代码高亮

```ts
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

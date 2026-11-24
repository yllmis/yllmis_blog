# yllmis的博客

基于 Next.js (App Router + TypeScript) 与 Tailwind CSS 的无数据库个人博客，所有文章与日记均以标准 Markdown（`.md`）文件存储。

## 功能概览

- **星空沉浸式封面（`/`）**：Canvas 星空微光粒子与鼠标视差背景，居中展示带呼吸光环与悬停缩放动效的头像，点击头像进入个人主页
- **Bento Grid 个人主页（`/home`）**：便当盒卡片布局展示头像名片、智能时段问候语、文章/日记统计、关注领域标签、座右铭及最新内容预览（可在 `src/config/site.ts` 修改）
- **自定义头像**：将头像图片命名为 `avatar.png`（也支持 `.jpg` / `.jpeg` / `.webp`）放入 `public/` 目录即可自动生效；未放图片前自动显示渐变首字母头像
- **文章与随笔（`/posts`）**：支持按 **Tag 标签** 筛选，详情页支持 GFM、代码高亮与顶部阅读进度条
- **日记时间轴（`/diary`）**：独立栏目，按年份分组的垂直时间轴 + 滚动渐显卡片展示（支持心情标签）
- **在线编辑后台（`/admin`）**：单人密码登录保护，提供**左右分栏实时预览**的 Markdown 编辑器
- **双模式 `.md` 存储**：
  - **本地模式（默认）**：直接读写 `content/posts/*.md` 与 `content/diary/*.md`
  - **线上模式（Vercel）**：配置 GitHub 环境变量后，在线保存会通过 GitHub Contents API 自动提交 `.md` 文件到你的仓库

## 本地运行

1. 配置本地环境变量（用于登录 `/admin` 后台）：

```bash
cp .env.example .env.local
# 编辑 .env.local，设置你的 ADMIN_PASSWORD
```

2. 启动开发服务器：

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可访问，直接访问 `/admin`（建议收藏书签）登录后台管理内容。

## 常用命令

```bash
npm test          # 运行单元测试
npm run typecheck # TypeScript 类型检查
npm run build     # 生产环境构建
```

## 部署到 Vercel（启用线上在线编辑）

1. 将本仓库推送到 GitHub，并在 Vercel 导入该项目。
2. 在 GitHub 生成一个 Fine-grained Personal Access Token：
   - **Repository access**：仅选择你的博客仓库
   - **Permissions → Repository permissions → Contents**：`Read and write`
3. 在 Vercel 项目的 **Settings → Environment Variables** 中添加：
   - `ADMIN_PASSWORD`：你的后台登录密码
   - `AUTH_SECRET`：一段随机签名密钥
   - `GITHUB_TOKEN`：上一步生成的 Token
   - `GITHUB_OWNER`：你的 GitHub 用户名
   - `GITHUB_REPO`：博客仓库名
   - `GITHUB_BRANCH`：分支名（默认 `main`）
4. 重新部署后，在公网打开 `/admin` 即可随时随地在线写文章/日记并同步到 GitHub 仓库的 `.md` 文件中。

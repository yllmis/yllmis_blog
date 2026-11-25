export const siteConfig = {
  title: "yllmis的博客",
  author: "yllmis",
  // 封面页头像下方的一句话标语（单句兜底）
  tagline: "种一棵树最好的时间是十年前，其次是现在",
  // 封面页动态打字机轮播标语（可自由增删）
  taglines: [
    "种一棵树最好的时间是十年前，其次是现在",
    "南昌大学 28 届在读 · Golang / AI Agent",
    "记录代码、思考与日常星光",
  ],
  // 封面页单侧极淡溶图暗纹与伴读台词（可自由替换图片或修改台词）
  resonators: [
    {
      id: "xinyuehu",
      name: "心月狐",
      subtitle: "月声尽，心灯明",
      src: "/resonators/xinyuehu.jpg",
      quote: "愿天地无妄，贪恋人间万事如常；留这皓月当空，换此城明灯不没。",
      objectPosition: "56% 28%",
      glow: "rgba(251, 146, 60, 0.14)",
    },
    {
      id: "feixue",
      name: "绯雪",
      subtitle: "不见春",
      src: "/resonators/feixue.jpg",
      quote: "茫茫白无尽，绯色寄新生。待到昭昭如愿日，便是雪后一地春。",
      objectPosition: "50% 20%",
      glow: "rgba(125, 211, 252, 0.15)",
    },
    {
      id: "gordia",
      name: "格尔黛",
      subtitle: "缄默与锋芒",
      src: "/resonators/gordia.jpg",
      // 4.0 新联邦待实装共鸣者，基于官方立绘主题「缄默与锋芒」及《永明的烬焰》凝练，实装后可随时替换原声台词
      quote: "于缄默中敛藏锋芒，待永明的烬焰划破长夜。",
      objectPosition: "50% 24%",
      glow: "rgba(244, 63, 94, 0.14)",
    },
  ],
  // 个人主页简介
  bio: "南昌大学 28 届在读，主力技术栈 Golang、AI Agent 与 TypeScript。在这里记录技术沉淀、项目折腾与生活日常。",
  description:
    "yllmis 的个人博客 — 南昌大学 28 届在读，关注 Golang 与 AI Agent，记录技术文章、随笔与日常日记。",
  // Bento 卡片：坐标、当前状态 & 座右铭
  location: "南昌",
  school: "南昌大学 28 届",
  status: "南昌大学 28 届在读 · 探索 Go & AI Agent",
  motto: "种一棵树最好的时间是十年前，其次是现在。",
  // Bento 卡片：技术栈 / 兴趣标签
  skills: ["Golang", "AI Agent", "TypeScript", "Next.js", "Linux", "Git"],
  links: {
    github: "https://github.com/yllmis",
    email: "2943246638@qq.com",
  },
} as const;

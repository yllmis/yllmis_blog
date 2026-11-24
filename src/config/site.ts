export const siteConfig = {
  title: "yllmis的博客",
  author: "yllmis",
  // 封面页头像下方的一句话标语（单句兜底）
  tagline: "记录代码、思考与日常星光",
  // 封面页动态打字机轮播标语（可自由增删）
  taglines: [
    "记录代码、思考与日常星光",
    "在安静的角落，沉淀技术与生活碎片",
    "保持好奇，认真走好每一段路",
  ],
  // 个人主页简介（留给你之后自由填写）
  bio: "在这里写一段关于你自己的简介……（可在 src/config/site.ts 中修改）",
  description: "yllmis 的个人博客，记录技术文章、随笔与日常日记。",
  // Bento 卡片：当前状态 & 座右铭（可自由修改）
  status: "持续折腾与记录中",
  motto: "保持好奇，认真记录每一段走过的路。",
  // Bento 卡片：技术栈 / 兴趣标签（可自由增删）
  skills: ["Go", "TypeScript", "Next.js", "后端架构", "随笔", "生活记录"],
  links: {
    github: "https://github.com/yllmis",
    email: "",
  },
} as const;

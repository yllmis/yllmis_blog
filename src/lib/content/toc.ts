export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** 将标题文本转换为锚点 id（保留中文、字母与数字，其余字符折叠为连字符） */
export function slugifyHeading(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

/** 按出现顺序为重复标题追加序号，保证锚点唯一（渲染端与目录端共用同一套规则） */
export function createHeadingIdFactory() {
  const seen = new Map<string, number>();
  return (text: string): string => {
    const base = slugifyHeading(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/\s+#+\s*$/, "")
    .trim();
}

/** 从 Markdown 源码中提取二、三级标题（跳过代码块内的 # 行） */
export function extractToc(markdown: string): TocItem[] {
  const nextId = createHeadingIdFactory();
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const text = stripInlineMarkdown(match[2]);
    if (!text) continue;

    // 一级标题也参与 id 计数，确保与渲染端顺序一致，但不进目录
    const id = nextId(text);
    const level = match[1].length;
    if (level === 2 || level === 3) {
      items.push({ id, text, depth: level });
    }
  }

  return items;
}

/**
 * 计算使当前高亮目录项居中的目标 scrollTop：
 * - 前半段（未过容器垂直中线）：保持在顶部 0（从头开始）；
 * - 中间段：平滑居中（保持在容器垂直中间）；
 * - 末尾段：贴底停止，不越界。
 */
export function computeCenteredScrollTop(params: {
  itemTopInScroll: number;
  itemHeight: number;
  containerHeight: number;
  scrollHeight: number;
}): number {
  const { itemTopInScroll, itemHeight, containerHeight, scrollHeight } = params;
  const maxScrollTop = Math.max(0, scrollHeight - containerHeight);
  if (maxScrollTop === 0) return 0;

  const itemCenter = itemTopInScroll + itemHeight / 2;
  const target = itemCenter - containerHeight / 2;
  return Math.max(0, Math.min(target, maxScrollTop));
}

/**
 * 根据各标题相对视口顶部的距离，确定当前处于阅读位置的标题 id：
 * - 长页面滚动到底部时高亮最后一个标题；
 * - 否则取最后一个已越过激活线（top <= activationOffset）的标题；
 * - 若所有标题都在激活线下方（页面顶部）：高亮第一个标题。
 */
export function resolveActiveHeadingId(params: {
  headings: Array<{ id: string; top: number }>;
  activationOffset: number;
  atBottom: boolean;
}): string {
  const { headings, activationOffset, atBottom } = params;
  if (headings.length === 0) return "";
  if (atBottom) {
    return headings[headings.length - 1].id;
  }

  let activeId = headings[0].id;
  for (const heading of headings) {
    if (heading.top <= activationOffset) {
      activeId = heading.id;
    } else {
      break;
    }
  }
  return activeId;
}

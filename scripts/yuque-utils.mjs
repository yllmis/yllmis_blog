import crypto from "crypto";

/**
 * 清洗语雀 Lake 导出的 Markdown 中的 HTML 残留标签，保证在禁用 raw HTML 的渲染器下排版干净。
 * 保留代码块内的原始内容不被误伤。
 */
export function cleanYuqueMarkdown(raw) {
  if (!raw) return "";
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let inFence = false;

  for (let line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }

    if (!inFence) {
      // 将语雀导出的 HTML <img ... src="..."> 转换为标准 Markdown 图片，以便后续本地化转存与安全渲染
      line = line.replace(
        /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*\/?>/gi,
        "![]($1)",
      );
      // 移除语雀自动插入的锚点标签 <a name="..."></a>
      line = line.replace(/<a\s+name="[^"]*"\s*>\s*<\/a>/gi, "");
      // 展开 <font ...>...</font> 与 <span ...>...</span>，保留内部文字
      line = line.replace(/<\/?(?:font|span)(?:\s+[^>]*)?>/gi, "");
      // 替换 <br/> / <br> 为换行
      line = line.replace(/<br\s*\/?>/gi, "\n");
      // 清理语雀 Markdown 图片链接后的冗余 hash 参数（#align=left&display=inline...）
      line = line.replace(
        /(!\[[^\]]*\]\()([^)\s]+?)(#[^)\s]+)(\))/g,
        "$1$2$4",
      );
      // 清理行内多余制表符缩进（语雀偶发用大量 \t 对齐落款）
      line = line.replace(/\t{2,}/g, "  ");
    }

    out.push(line);
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * 提取 Markdown 中指向语雀图床（nlark.com）的图片 URL 列表（去重）。
 */
export function extractYuqueImageUrls(markdown) {
  if (!markdown) return [];
  const urls = new Set();
  const regex = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const cleanUrl = match[1].split("#")[0];
    if (/(?:^|\.)nlark\.com$/i.test(safeHostname(cleanUrl))) {
      urls.add(cleanUrl);
    }
  }
  return Array.from(urls);
}

function safeHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/**
 * 根据图片 URL 生成稳定的本地文件名，避免重复下载。
 */
export function buildLocalImageFilename(url, contentType = "") {
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 16);
  let ext = "";
  try {
    const pathname = new URL(url).pathname;
    const match = /\.(png|jpe?g|gif|webp|svg|avif)$/i.exec(pathname);
    if (match) ext = match[1].toLowerCase();
  } catch {
    // ignore
  }
  if (!ext) {
    if (/png/i.test(contentType)) ext = "png";
    else if (/webp/i.test(contentType)) ext = "webp";
    else if (/gif/i.test(contentType)) ext = "gif";
    else if (/svg/i.test(contentType)) ext = "svg";
    else ext = "jpg";
  }
  if (ext === "jpeg") ext = "jpg";
  return `${hash}.${ext}`;
}

/**
 * 将语雀扁平 TOC 数组转换为嵌套目录树，并过滤隐藏项及未公开/未发布文档。
 */
export function buildTocTree(flatItems, validDocSlugs) {
  const nodeMap = new Map();
  const ordered = [];

  for (const item of flatItems || []) {
    if (item.visible === 0) continue;
    const isDoc = item.type === "DOC" && Boolean(item.slug) && item.slug !== "#";
    const isFolder = item.type === "TITLE";
    if (!isDoc && !isFolder) continue;

    const node = {
      uuid: String(item.uuid || ""),
      parentUuid: String(item.parent_uuid || ""),
      type: isDoc ? "doc" : "folder",
      title: String(item.title || "未命名").trim(),
      slug: isDoc && validDocSlugs.has(item.slug) ? String(item.slug) : undefined,
      children: [],
    };
    nodeMap.set(node.uuid, node);
    ordered.push(node);
  }

  const roots = [];
  for (const node of ordered) {
    if (node.parentUuid && nodeMap.has(node.parentUuid)) {
      nodeMap.get(node.parentUuid).children.push(node);
    } else {
      roots.push(node);
    }
  }

  const prune = (nodes) => {
    const kept = [];
    for (const n of nodes) {
      const children = prune(n.children);
      const hasValidSelf = n.type === "doc" && Boolean(n.slug);
      if (hasValidSelf || children.length > 0) {
        kept.push({
          uuid: n.uuid,
          type: hasValidSelf ? "doc" : "folder",
          title: n.title,
          ...(hasValidSelf ? { slug: n.slug } : {}),
          children,
        });
      }
    }
    return kept;
  };

  return prune(roots);
}

/** 判断知识库是否允许同步（严格仅同步公开知识库，且可按 allowlist 过滤） */
export function isRepoSyncAllowed(repo, allowlist = []) {
  if (!repo || repo.public !== 1) return false;
  if (allowlist.length === 0) return true;
  return allowlist.includes(repo.slug) || allowlist.includes(repo.name);
}

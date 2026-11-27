import crypto from "crypto";

function decodeHtmlEntities(text) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/** 将语雀 Lake 折叠块内部常见 HTML 片段转换为干净的标准 Markdown */
function convertLakeHtmlToMarkdown(html) {
  let text = String(html || "");

  // 先处理多行 <pre><code>...</code></pre>
  text = text.replace(
    /<pre\b[^>]*>\s*(?:<code\b[^>]*>)?([\s\S]*?)(?:<\/code>)?\s*<\/pre>/gi,
    (_, inner) => {
      const code = decodeHtmlEntities(inner.replace(/<[^>]+>/g, "")).trim();
      return `\n\n\`\`\`\n${code}\n\`\`\`\n\n`;
    },
  );

  // 处理 <img>
  text = text.replace(
    /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*\/?>/gi,
    (_, src) => `![](${src.split("#")[0]})`,
  );

  // 处理 <a href="...">label</a>
  text = text.replace(
    /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, label) => {
      const cleanLabel = label.replace(/<[^>]+>/g, "").trim() || href;
      return `[${cleanLabel}](${href})`;
    },
  );

  // 处理标题 <h1>~<h6>
  text = text.replace(
    /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi,
    (_, level, inner) => {
      const clean = inner.replace(/<[^>]+>/g, "").trim();
      if (!clean) return "\n\n";
      const hashes = "#".repeat(Math.min(6, Math.max(3, Number(level) + 2)));
      return `\n\n${hashes} ${clean}\n\n`;
    },
  );

  // 处理行内 <code>、<strong|b>、<em|i>、<u>、<br>
  text = text.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, inner) => {
    const clean = inner.replace(/<[^>]+>/g, "").trim();
    return clean ? `\`${clean}\`` : "";
  });
  text = text.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (_, inner) => {
    const clean = inner.trim();
    return clean ? `**${clean}**` : "";
  });
  text = text.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, (_, inner) => {
    const clean = inner.trim();
    return clean ? `*${clean}*` : "";
  });
  text = text.replace(/<\/?(?:u|font|span|div)(?:\s+[^>]*)?>/gi, "");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // 处理有序与无序列表（含语雀嵌套 <ol class="ne-list-wrap">）
  text = text.replace(/<ol\b[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
    let idx = 0;
    const replaced = inner.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (__, liBody) => {
      idx += 1;
      const clean = liBody.replace(/<\/?p\b[^>]*>/gi, "").trim();
      return clean ? `\n${idx}. ${clean}` : "";
    });
    return `\n\n${replaced.replace(/<\/?(?:ol|ul)\b[^>]*>/gi, "").trim()}\n\n`;
  });
  text = text.replace(/<ul\b[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
    const replaced = inner.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (__, liBody) => {
      const clean = liBody.replace(/<\/?p\b[^>]*>/gi, "").trim();
      return clean ? `\n- ${clean}` : "";
    });
    return `\n\n${replaced.replace(/<\/?(?:ol|ul)\b[^>]*>/gi, "").trim()}\n\n`;
  });
  // 兜底残留孤立 <li>
  text = text.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => {
    const clean = inner.replace(/<\/?p\b[^>]*>/gi, "").trim();
    return clean ? `\n- ${clean}` : "";
  });
  text = text.replace(/<\/?(?:ol|ul)\b[^>]*>/gi, "\n");

  // 处理段落 <p>
  text = text.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => {
    const clean = inner.trim();
    return clean ? `\n\n${clean}\n\n` : "\n\n";
  });

  // 合并相邻加粗碎片（语雀常输出 **2.**** ****using**）
  text = text.replace(/\*\*\s*\*\*/g, " ");

  return decodeHtmlEntities(text)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** 将 <details class="lake-collapse"> 转为安全、标准的 > [!COLLAPSE] 块 */
function convertLakeDetailsBlocks(text) {
  return text.replace(
    /<details\b[^>]*>[\s\S]*?<\/details>/gi,
    (block) => {
      const summaryMatch = /<summary\b[^>]*>([\s\S]*?)<\/summary>/i.exec(block);
      const summaryText = summaryMatch
        ? decodeHtmlEntities(summaryMatch[1].replace(/<[^>]+>/g, ""))
            .replace(/\s+/g, " ")
            .trim()
        : "展开详情";

      const innerHtml = block
        .replace(/^<details\b[^>]*>/i, "")
        .replace(/<\/details>$/i, "")
        .replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, "");

      const innerMd = convertLakeHtmlToMarkdown(innerHtml);
      const bodyLines = innerMd
        ? innerMd.split("\n").map((l) => (l.length > 0 ? `> ${l}` : ">"))
        : [];

      return `\n\n> [!COLLAPSE] ${summaryText}\n>\n${bodyLines.join("\n")}\n\n`;
    },
  );
}

/**
 * 清洗语雀 Lake 导出的 Markdown 中的 HTML 残留标签与异常缩进，
 * 保证在禁用 raw HTML 的渲染器下排版干净且不误伤代码块。
 */
export function cleanYuqueMarkdown(raw) {
  if (!raw) return "";

  // 先按围栏代码块切分，确保只清洗代码块之外的文本（支持跨行 <details>）
  const segments = [];
  const rawLines = raw.replace(/\r\n/g, "\n").split("\n");
  let buf = [];
  let inFence = false;

  for (const line of rawLines) {
    if (/^\s*(```|~~~)/.test(line)) {
      if (!inFence) {
        if (buf.length > 0) segments.push({ type: "prose", text: buf.join("\n") });
        buf = [line];
        inFence = true;
      } else {
        buf.push(line);
        segments.push({ type: "code", text: buf.join("\n") });
        buf = [];
        inFence = false;
      }
    } else {
      buf.push(line);
    }
  }
  if (buf.length > 0) {
    segments.push({ type: inFence ? "code" : "prose", text: buf.join("\n") });
  }

  const cleanedSegments = segments.map((seg) => {
    if (seg.type === "code") return seg.text;

    let text = seg.text;
    // 1. 转换语雀 <details class="lake-collapse"> 折叠块
    text = convertLakeDetailsBlocks(text);

    // 2. 逐行清洗行内语雀 HTML 残留与误触发代码块的异常行首缩进
    const lines = text.split("\n");
    const out = [];
    let prevWasList = false;

    for (let line of lines) {
      // 将语雀导出的 HTML <img ... src="..."> 转换为标准 Markdown 图片
      line = line.replace(
        /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*\/?>/gi,
        "![]($1)",
      );
      // 移除语雀自动插入的锚点标签 <a name="..."></a>
      line = line.replace(/<a\s+name="[^"]*"\s*>\s*<\/a>/gi, "");
      // 展开 <font>, <span>, <u> 标签保留内部文字
      line = line.replace(/<\/?(?:font|span|u)(?:\s+[^>]*)?>/gi, "");
      // 替换 <br/> / <br> 为换行
      line = line.replace(/<br\s*\/?>/gi, "\n");
      // 清理语雀 Markdown 图片链接后的冗余 hash 参数（#align=left&display=inline...）
      line = line.replace(
        /(!\[[^\]]*\]\()([^)\s]+?)(#[^)\s]+)(\))/g,
        "$1$2$4",
      );
      // 清理行内多余制表符缩进（语雀偶发用大量 \t 对齐落款）
      line = line.replace(/\t{2,}/g, "  ");

      const isListLine = /^\s*(?:[-*+]|\d+\.)\s+/.test(line);
      // 非列表上下文中，去掉行首 >=4 空格或 Tab，避免 CommonMark 将右对齐落款（如 --2026.03.27记）误渲染成代码块
      if (!isListLine && !prevWasList && /^(?:\t+| {4,})\S/.test(line)) {
        line = line.trimStart();
      }

      if (line.trim().length > 0) {
        prevWasList = isListLine;
      } else {
        prevWasList = false;
      }

      out.push(line);
    }

    return out.join("\n");
  });

  return cleanedSegments
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

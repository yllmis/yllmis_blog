#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import {
  buildLocalImageFilename,
  buildTocTree,
  cleanYuqueMarkdown,
  extractYuqueImageUrls,
  isRepoSyncAllowed,
} from "./yuque-utils.mjs";

const ROOT = process.cwd();
const GARDEN_DIR = path.join(ROOT, "content", "garden");
const IMAGES_DIR = path.join(ROOT, "public", "images", "yuque");
const API_BASE = "https://www.yuque.com/api/v2";

async function loadLocalEnv() {
  const envFile = path.join(ROOT, ".env.local");
  try {
    const text = await fs.readFile(envFile, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch {
    // .env.local optional in CI
  }
}

async function yuqueGet(endpoint, token) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "X-Auth-Token": token,
      "User-Agent": "yllmis-blog-sync/1.0",
    },
  });
  if (!res.ok) {
    throw new Error(`Yuque API ${endpoint} failed with status ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

async function localizeImages(markdown) {
  const urls = extractYuqueImageUrls(markdown);
  if (urls.length === 0) return { markdown, downloaded: 0 };

  await fs.mkdir(IMAGES_DIR, { recursive: true });
  let updated = markdown;
  let downloaded = 0;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          Referer: "https://www.yuque.com/",
          "User-Agent": "Mozilla/5.0",
        },
      });
      if (!res.ok) {
        console.warn(`[yuque-sync] Skip image (${res.status}): ${url}`);
        continue;
      }
      const contentType = res.headers.get("content-type") || "";
      const filename = buildLocalImageFilename(url, contentType);
      const localPath = path.join(IMAGES_DIR, filename);
      const buffer = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(localPath, buffer);
      updated = updated.split(url).join(`/images/yuque/${filename}`);
      downloaded += 1;
    } catch (err) {
      console.warn(
        `[yuque-sync] Image download error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return { markdown: updated, downloaded };
}

function safeSlug(value) {
  return /^[a-zA-Z0-9_-]{1,120}$/.test(String(value || ""));
}

function formatDate(iso) {
  if (typeof iso === "string" && iso.length >= 10) {
    return iso.slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  await loadLocalEnv();

  const token = process.env.YUQUE_TOKEN?.trim();
  const login = process.env.YUQUE_LOGIN?.trim() || "yllmis";
  const allowlist = (process.env.YUQUE_REPOS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!token) {
    throw new Error("缺少 YUQUE_TOKEN 环境变量，无法同步语雀知识库");
  }

  console.log(`[yuque-sync] Fetching public repos for @${login}...`);
  const allRepos = await yuqueGet(`/users/${encodeURIComponent(login)}/repos?type=Book`, token);
  const publicRepos = (allRepos || []).filter(
    (repo) => isRepoSyncAllowed(repo, allowlist) && safeSlug(repo.slug),
  );

  console.log(
    `[yuque-sync] Found ${publicRepos.length} public repo(s): ${publicRepos.map((r) => `${r.name}(${r.slug})`).join(", ")}`,
  );

  await fs.mkdir(GARDEN_DIR, { recursive: true });
  const catalogRepos = [];
  let totalDocs = 0;
  let totalImages = 0;

  // 追踪本次同步存在的仓库目录，清理已取消公开/删除的旧同步目录
  const activeRepoSlugs = new Set();

  for (const repo of publicRepos) {
    const repoSlug = String(repo.slug);
    activeRepoSlugs.add(repoSlug);

    const repoDir = path.join(GARDEN_DIR, repoSlug);
    await fs.mkdir(repoDir, { recursive: true });

    const repoPath = `${encodeURIComponent(login)}/${encodeURIComponent(repoSlug)}`;
    const tocRaw = await yuqueGet(`/repos/${repoPath}/toc`, token);

    // 分页拉取全部文档列表（每页 100 条，兼容大规模知识库）
    const docsList = [];
    for (let offset = 0; offset < 2000; offset += 100) {
      const batch = await yuqueGet(
        `/repos/${repoPath}/docs?limit=100&offset=${offset}`,
        token,
      );
      if (!Array.isArray(batch) || batch.length === 0) break;
      docsList.push(...batch);
      if (batch.length < 100) break;
    }

    // 严格仅同步「已发布且公开」的文档（status === 1 && public === 1）
    const publishedDocs = docsList.filter(
      (doc) => doc.status === 1 && doc.public === 1 && safeSlug(doc.slug),
    );

    const validDocSlugs = new Set();
    const docMetaMap = {};
    let latestUpdated = "";

    for (const summary of publishedDocs) {
      const docSlug = String(summary.slug);
      const detail = await yuqueGet(
        `/repos/${repoPath}/docs/${encodeURIComponent(docSlug)}`,
        token,
      );

      if (!detail || detail.status !== 1 || detail.public !== 1) continue;

      const cleaned = cleanYuqueMarkdown(detail.body || "");
      const { markdown: localizedBody, downloaded } = await localizeImages(cleaned);
      totalImages += downloaded;

      const updatedAt = formatDate(detail.updated_at || detail.published_at);
      if (updatedAt > latestUpdated) latestUpdated = updatedAt;

      const cleanSummary = String(detail.description || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 140);

      const frontmatter = {
        title: String(detail.title || docSlug).trim(),
        date: updatedAt,
        summary: cleanSummary,
        yuqueUrl: `https://www.yuque.com/${repo.namespace}/${docSlug}`,
      };

      const fileContent = matter.stringify(localizedBody, frontmatter);
      await fs.writeFile(path.join(repoDir, `${docSlug}.md`), fileContent, "utf8");

      validDocSlugs.add(docSlug);
      docMetaMap[docSlug] = {
        slug: docSlug,
        title: frontmatter.title,
        date: updatedAt,
        summary: cleanSummary,
        yuqueUrl: frontmatter.yuqueUrl,
      };
      totalDocs += 1;
    }

    // 清理该知识库下已被语雀删除或转为私密的旧 .md 文件
    const existingFiles = await fs.readdir(repoDir);
    for (const f of existingFiles) {
      if (f.endsWith(".md") && !validDocSlugs.has(f.slice(0, -3))) {
        await fs.unlink(path.join(repoDir, f));
      }
    }

    const toc = buildTocTree(tocRaw, validDocSlugs);
    catalogRepos.push({
      slug: repoSlug,
      name: String(repo.name || repoSlug).trim(),
      description: String(repo.description || "").trim(),
      namespace: String(repo.namespace),
      yuqueUrl: `https://www.yuque.com/${repo.namespace}`,
      updatedAt: latestUpdated || formatDate(repo.updated_at),
      docCount: validDocSlugs.size,
      toc,
      docs: docMetaMap,
    });
  }

  // 清理已不再公开的旧知识库目录
  const existingGardenEntries = await fs.readdir(GARDEN_DIR, { withFileTypes: true });
  for (const entry of existingGardenEntries) {
    if (entry.isDirectory() && !activeRepoSlugs.has(entry.name)) {
      await fs.rm(path.join(GARDEN_DIR, entry.name), { recursive: true, force: true });
    }
  }

  const catalog = {
    syncedAt: new Date().toISOString(),
    login,
    repos: catalogRepos,
  };

  await fs.writeFile(
    path.join(GARDEN_DIR, "catalog.json"),
    `${JSON.stringify(catalog, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `[yuque-sync] Done! Synced ${catalogRepos.length} repo(s), ${totalDocs} public doc(s), ${totalImages} localized image(s).`,
  );
}

main().catch((err) => {
  console.error("[yuque-sync] Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});

import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { countWords, estimateReadingMinutes, validateSlug } from "@/lib/content/markdown";

export interface GardenTocNode {
  uuid: string;
  type: "doc" | "folder";
  title: string;
  slug?: string;
  children: GardenTocNode[];
}

export interface GardenDocMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
  yuqueUrl?: string;
}

export interface GardenRepo {
  slug: string;
  name: string;
  description: string;
  namespace: string;
  yuqueUrl: string;
  updatedAt: string;
  docCount: number;
  toc: GardenTocNode[];
  docs: Record<string, GardenDocMeta>;
}

export interface GardenCatalog {
  syncedAt: string;
  login: string;
  repos: GardenRepo[];
}

export interface GardenDoc extends GardenDocMeta {
  repoSlug: string;
  body: string;
  wordCount: number;
  readingMinutes: number;
}

const GARDEN_DIR = path.resolve(process.cwd(), "content", "garden");

export async function getGardenCatalog(): Promise<GardenCatalog> {
  try {
    const raw = await fs.readFile(path.join(GARDEN_DIR, "catalog.json"), "utf8");
    const parsed = JSON.parse(raw) as GardenCatalog;
    if (!parsed || !Array.isArray(parsed.repos)) {
      return { syncedAt: "", login: "yllmis", repos: [] };
    }
    return parsed;
  } catch {
    return { syncedAt: "", login: "yllmis", repos: [] };
  }
}

export async function getGardenRepo(repoSlug: string): Promise<GardenRepo | null> {
  const validRepo = validateSlug(repoSlug);
  const catalog = await getGardenCatalog();
  return catalog.repos.find((r) => r.slug === validRepo) ?? null;
}

export async function getGardenDoc(
  repoSlug: string,
  docSlug: string,
): Promise<GardenDoc | null> {
  const validRepo = validateSlug(repoSlug);
  const validDoc = validateSlug(docSlug);

  const repoDir = path.resolve(GARDEN_DIR, validRepo);
  const target = path.resolve(repoDir, `${validDoc}.md`);
  if (!repoDir.startsWith(`${GARDEN_DIR}${path.sep}`) || !target.startsWith(`${repoDir}${path.sep}`)) {
    throw new Error("非法路径访问");
  }

  try {
    const raw = await fs.readFile(target, "utf8");
    const { data, content } = matter(raw);
    const body = content.replace(/^\r?\n/, "").replace(/\r?\n$/, "");

    return {
      repoSlug: validRepo,
      slug: validDoc,
      title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : validDoc,
      date:
        typeof data.date === "string" && data.date.trim()
          ? data.date.trim()
          : "",
      summary: typeof data.summary === "string" ? data.summary.trim() : "",
      yuqueUrl: typeof data.yuqueUrl === "string" ? data.yuqueUrl.trim() : undefined,
      body,
      wordCount: countWords(body),
      readingMinutes: estimateReadingMinutes(body),
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

export function flattenGardenTocDocs(
  nodes: GardenTocNode[],
): { slug: string; title: string }[] {
  const list: { slug: string; title: string }[] = [];
  const walk = (items: GardenTocNode[]) => {
    for (const item of items) {
      if (item.type === "doc" && item.slug) {
        list.push({ slug: item.slug, title: item.title });
      }
      if (item.children.length > 0) {
        walk(item.children);
      }
    }
  };
  walk(nodes);
  return list;
}

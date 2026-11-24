import matter from "gray-matter";
import type { ContentItem, ContentType, SaveContentInput } from "./types";

const SLUG_REGEX = /^[a-zA-Z0-9_-]{1,120}$/;

export function validateSlug(slug: string): string {
  const trimmed = slug.trim();
  if (!SLUG_REGEX.test(trimmed)) {
    throw new Error(
      "无效的 slug：仅允许字母、数字、连字符(-)和下划线(_)，长度 1~120",
    );
  }
  return trimmed;
}

export function validateContentType(type: string): ContentType {
  if (type !== "posts" && type !== "diary") {
    throw new Error("无效的内容类型：仅支持 posts 或 diary");
  }
  return type;
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return new Date().toISOString().slice(0, 10);
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);
}

export function parseMarkdown(
  type: ContentType,
  slug: string,
  raw: string,
  sha?: string,
): ContentItem {
  const { data, content } = matter(raw);
  return {
    slug,
    type,
    title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : slug,
    date: normalizeDate(data.date),
    summary: typeof data.summary === "string" ? data.summary.trim() : "",
    tags: normalizeTags(data.tags),
    mood: typeof data.mood === "string" && data.mood.trim() ? data.mood.trim() : undefined,
    sha,
    body: content.replace(/^\r?\n/, "").replace(/\r?\n$/, ""),
  };
}

export function serializeMarkdown(input: SaveContentInput): string {
  const frontmatter: Record<string, unknown> = {
    title: input.title.trim(),
    date: normalizeDate(input.date),
    summary: (input.summary ?? "").trim(),
  };

  if (input.type === "posts") {
    frontmatter.tags = normalizeTags(input.tags);
  } else if (input.mood && input.mood.trim()) {
    frontmatter.mood = input.mood.trim();
  }

  return matter.stringify(input.body ?? "", frontmatter);
}

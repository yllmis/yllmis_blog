import fs from "fs/promises";
import path from "path";
import { parseMarkdown, serializeMarkdown, validateContentType, validateSlug } from "./markdown";
import type { ContentItem, ContentMeta, ContentStore, ContentType, SaveContentInput } from "./types";

export class LocalFsStore implements ContentStore {
  readonly mode = "local" as const;
  private readonly baseDir: string;

  constructor(baseDir: string = path.join(process.cwd(), "content")) {
    this.baseDir = path.resolve(baseDir);
  }

  private getTypeDir(type: ContentType): string {
    const validType = validateContentType(type);
    return path.join(this.baseDir, validType);
  }

  private resolveSafePath(type: ContentType, slug: string): string {
    const dir = this.getTypeDir(type);
    const validSlug = validateSlug(slug);
    const target = path.resolve(dir, `${validSlug}.md`);
    if (!target.startsWith(`${dir}${path.sep}`)) {
      throw new Error("非法路径访问");
    }
    return target;
  }

  async list(type: ContentType): Promise<ContentMeta[]> {
    const dir = this.getTypeDir(type);
    let entries: string[];
    try {
      entries = await fs.readdir(dir);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw err;
    }

    const mdFiles = entries.filter((name) => name.endsWith(".md"));
    const items = await Promise.all(
      mdFiles.map(async (fileName) => {
        const slug = fileName.slice(0, -3);
        const raw = await fs.readFile(path.join(dir, fileName), "utf-8");
        const parsed = parseMarkdown(type, slug, raw);
        const { body: _body, ...meta } = parsed;
        return meta;
      }),
    );

    return items.sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
  }

  async get(type: ContentType, slug: string): Promise<ContentItem | null> {
    const filePath = this.resolveSafePath(type, slug);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      return parseMarkdown(type, validateSlug(slug), raw);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw err;
    }
  }

  async save(input: SaveContentInput): Promise<ContentItem> {
    const validType = validateContentType(input.type);
    const validSlug = validateSlug(input.slug);
    const dir = this.getTypeDir(validType);
    await fs.mkdir(dir, { recursive: true });

    const filePath = this.resolveSafePath(validType, validSlug);
    const serialized = serializeMarkdown({ ...input, type: validType, slug: validSlug });
    await fs.writeFile(filePath, serialized, "utf-8");

    return parseMarkdown(validType, validSlug, serialized);
  }

  async delete(type: ContentType, slug: string): Promise<void> {
    const filePath = this.resolveSafePath(type, slug);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return;
      }
      throw err;
    }
  }
}

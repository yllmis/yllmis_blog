import {
  parseMarkdown,
  serializeMarkdown,
  validateContentType,
  validateSlug,
} from "./markdown";
import type {
  ContentItem,
  ContentMeta,
  ContentStore,
  ContentType,
  SaveContentInput,
} from "./types";

export class StoreConflictError extends Error {
  constructor(message = "文件已被外部修改，请刷新后重试") {
    super(message);
    this.name = "StoreConflictError";
  }
}

export interface GitHubStoreConfig {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
  fetchImpl?: typeof fetch;
}

interface GitHubContentFile {
  name: string;
  path: string;
  sha: string;
  type: "file" | "dir";
  content?: string;
  encoding?: string;
}

export class GitHubStore implements ContentStore {
  readonly mode = "github" as const;
  private readonly token: string;
  private readonly owner: string;
  private readonly repo: string;
  private readonly branch: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: GitHubStoreConfig) {
    this.token = config.token;
    this.owner = config.owner;
    this.repo = config.repo;
    this.branch = config.branch || "main";
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  private apiUrl(repoPath: string, withRef = false): string {
    const encodedPath = repoPath
      .split("/")
      .map((seg) => encodeURIComponent(seg))
      .join("/");
    const base = `https://api.github.com/repos/${encodeURIComponent(this.owner)}/${encodeURIComponent(this.repo)}/contents/${encodedPath}`;
    return withRef ? `${base}?ref=${encodeURIComponent(this.branch)}` : base;
  }

  private headers(): Record<string, string> {
    return {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${this.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };
  }

  private filePath(type: ContentType, slug: string): string {
    const validType = validateContentType(type);
    const validSlug = validateSlug(slug);
    return `content/${validType}/${validSlug}.md`;
  }

  async list(type: ContentType): Promise<ContentMeta[]> {
    const validType = validateContentType(type);
    const res = await this.fetchImpl(this.apiUrl(`content/${validType}`, true), {
      headers: this.headers(),
      cache: "no-store",
    });

    if (res.status === 404) {
      return [];
    }
    if (!res.ok) {
      throw new Error(`GitHub 列表读取失败 (${res.status})`);
    }

    const entries = (await res.json()) as GitHubContentFile[];
    if (!Array.isArray(entries)) return [];

    const mdEntries = entries.filter(
      (entry) => entry.type === "file" && entry.name.endsWith(".md"),
    );

    const items = await Promise.all(
      mdEntries.map(async (entry) => {
        const slug = entry.name.slice(0, -3);
        const item = await this.get(validType, slug);
        if (!item) return null;
        const { body: _body, ...meta } = item;
        return meta;
      }),
    );

    return items
      .filter((item): item is ContentMeta => item !== null)
      .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
  }

  async get(type: ContentType, slug: string): Promise<ContentItem | null> {
    const validType = validateContentType(type);
    const validSlug = validateSlug(slug);
    const res = await this.fetchImpl(this.apiUrl(this.filePath(validType, validSlug), true), {
      headers: this.headers(),
      cache: "no-store",
    });

    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`GitHub 文件读取失败 (${res.status})`);
    }

    const file = (await res.json()) as GitHubContentFile;
    const raw = file.content
      ? Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf-8")
      : "";
    return parseMarkdown(validType, validSlug, raw, file.sha);
  }

  async save(input: SaveContentInput): Promise<ContentItem> {
    const validType = validateContentType(input.type);
    const validSlug = validateSlug(input.slug);
    const repoPath = this.filePath(validType, validSlug);
    const serialized = serializeMarkdown({ ...input, type: validType, slug: validSlug });

    let sha = input.sha;
    if (!sha) {
      const existing = await this.get(validType, validSlug);
      sha = existing?.sha;
    }

    const body: Record<string, unknown> = {
      message: `${sha ? "Update" : "Create"} ${validType}/${validSlug}.md`,
      content: Buffer.from(serialized, "utf-8").toString("base64"),
      branch: this.branch,
    };
    if (sha) {
      body.sha = sha;
    }

    const res = await this.fetchImpl(this.apiUrl(repoPath), {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (res.status === 409) {
      throw new StoreConflictError();
    }
    if (!res.ok) {
      throw new Error(`GitHub 文件保存失败 (${res.status})`);
    }

    const data = (await res.json()) as { content?: { sha?: string } };
    return parseMarkdown(validType, validSlug, serialized, data.content?.sha);
  }

  async delete(type: ContentType, slug: string, sha?: string): Promise<void> {
    const validType = validateContentType(type);
    const validSlug = validateSlug(slug);
    const repoPath = this.filePath(validType, validSlug);

    let targetSha = sha;
    if (!targetSha) {
      const existing = await this.get(validType, validSlug);
      if (!existing?.sha) return;
      targetSha = existing.sha;
    }

    const res = await this.fetchImpl(this.apiUrl(repoPath), {
      method: "DELETE",
      headers: this.headers(),
      body: JSON.stringify({
        message: `Delete ${validType}/${validSlug}.md`,
        sha: targetSha,
        branch: this.branch,
      }),
    });

    if (res.status === 404) return;
    if (res.status === 409) {
      throw new StoreConflictError();
    }
    if (!res.ok) {
      throw new Error(`GitHub 文件删除失败 (${res.status})`);
    }
  }
}

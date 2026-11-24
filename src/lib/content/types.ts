export type ContentType = "posts" | "diary";

export interface ContentMeta {
  slug: string;
  type: ContentType;
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  tags: string[];
  mood?: string;
  sha?: string; // Used by GitHub Contents API for optimistic concurrency
}

export interface ContentItem extends ContentMeta {
  body: string;
}

export interface SaveContentInput {
  type: ContentType;
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags?: string[];
  mood?: string;
  body: string;
  sha?: string;
}

export interface ContentStore {
  readonly mode: "local" | "github";
  list(type: ContentType): Promise<ContentMeta[]>;
  get(type: ContentType, slug: string): Promise<ContentItem | null>;
  save(input: SaveContentInput): Promise<ContentItem>;
  delete(type: ContentType, slug: string, sha?: string): Promise<void>;
}

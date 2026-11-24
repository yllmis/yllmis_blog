import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { LocalFsStore } from "../local-store";
import { validateSlug, parseMarkdown, serializeMarkdown } from "../markdown";

describe("markdown helpers & slug validation", () => {
  it("accepts valid slugs and rejects traversal or invalid characters", () => {
    expect(validateSlug("hello-world-2026")).toBe("hello-world-2026");
    expect(validateSlug("my_post_1")).toBe("my_post_1");
    expect(() => validateSlug("../secret")).toThrow();
    expect(() => validateSlug("a/b")).toThrow();
    expect(() => validateSlug("a\\b")).toThrow();
    expect(() => validateSlug("   ")).toThrow();
    expect(() => validateSlug("hello world")).toThrow();
  });

  it("serializes and parses markdown with frontmatter round-trip", () => {
    const raw = serializeMarkdown({
      type: "posts",
      slug: "demo",
      title: "测试文章",
      date: "2026-11-23",
      summary: "一段摘要",
      tags: ["Next.js", "随笔"],
      body: "# 标题\n\n正文内容",
    });

    const parsed = parseMarkdown("posts", "demo", raw);
    expect(parsed.title).toBe("测试文章");
    expect(parsed.date).toBe("2026-11-23");
    expect(parsed.summary).toBe("一段摘要");
    expect(parsed.tags).toEqual(["Next.js", "随笔"]);
    expect(parsed.body.trim()).toBe("# 标题\n\n正文内容");
  });
});

describe("LocalFsStore", () => {
  let tmpDir: string;
  let store: LocalFsStore;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "blog-test-"));
    store = new LocalFsStore(tmpDir);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("supports create, get, list (sorted by date desc), update, and delete", async () => {
    await store.save({
      type: "posts",
      slug: "older-post",
      title: "旧文章",
      date: "2026-11-01",
      summary: "旧",
      tags: ["Go"],
      body: "old body",
    });
    await store.save({
      type: "posts",
      slug: "newer-post",
      title: "新文章",
      date: "2026-11-23",
      summary: "新",
      tags: ["Next.js", "前端"],
      body: "new body",
    });

    const list = await store.list("posts");
    expect(list.map((i) => i.slug)).toEqual(["newer-post", "older-post"]);

    const item = await store.get("posts", "newer-post");
    expect(item?.title).toBe("新文章");
    expect(item?.body).toBe("new body");

    await store.save({
      type: "posts",
      slug: "newer-post",
      title: "新文章（已更新）",
      date: "2026-11-23",
      summary: "更新摘要",
      tags: ["Next.js"],
      body: "updated body",
    });
    const updated = await store.get("posts", "newer-post");
    expect(updated?.title).toBe("新文章（已更新）");
    expect(updated?.body).toBe("updated body");

    await store.delete("posts", "older-post");
    expect(await store.get("posts", "older-post")).toBeNull();
  });

  it("blocks path traversal attempts in get/save/delete", async () => {
    await expect(store.get("posts", "../etc/passwd")).rejects.toThrow();
    await expect(
      store.save({
        type: "diary",
        slug: "../../evil",
        title: "evil",
        date: "2026-11-23",
        summary: "",
        body: "bad",
      }),
    ).rejects.toThrow();
    await expect(store.delete("posts", "../foo")).rejects.toThrow();
  });
});

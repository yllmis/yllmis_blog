import { describe, it, expect, vi } from "vitest";
import { GitHubStore, StoreConflictError } from "../github-store";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("GitHubStore", () => {
  it("reads and decodes base64 markdown content with sha", async () => {
    const md = `---\ntitle: 云端文章\ndate: "2026-11-23"\nsummary: 测试\ntags:\n  - Vercel\n---\n\n你好 GitHub`;
    const mockFetch = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        name: "cloud-post.md",
        path: "content/posts/cloud-post.md",
        sha: "sha-123",
        type: "file",
        content: Buffer.from(md, "utf-8").toString("base64"),
      }),
    );

    const store = new GitHubStore({
      token: "ghp_test",
      owner: "yllmis",
      repo: "blog",
      fetchImpl: mockFetch as unknown as typeof fetch,
    });

    const item = await store.get("posts", "cloud-post");
    expect(item?.title).toBe("云端文章");
    expect(item?.sha).toBe("sha-123");
    expect(item?.tags).toEqual(["Vercel"]);
    expect(item?.body.trim()).toBe("你好 GitHub");
  });

  it("throws StoreConflictError when GitHub returns 409 on save", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(jsonResponse({ message: "conflict" }, 409));
    const store = new GitHubStore({
      token: "ghp_test",
      owner: "yllmis",
      repo: "blog",
      fetchImpl: mockFetch as unknown as typeof fetch,
    });

    await expect(
      store.save({
        type: "posts",
        slug: "demo",
        title: "标题",
        date: "2026-11-23",
        summary: "",
        body: "content",
        sha: "stale-sha",
      }),
    ).rejects.toBeInstanceOf(StoreConflictError);
  });

  it("deletes file with provided sha", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(jsonResponse({ commit: { sha: "c1" } }, 200));
    const store = new GitHubStore({
      token: "ghp_test",
      owner: "yllmis",
      repo: "blog",
      fetchImpl: mockFetch as unknown as typeof fetch,
    });

    await store.delete("diary", "2026-11-23", "sha-del");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain("content/diary/2026-11-23.md");
    expect(init.method).toBe("DELETE");
  });
});

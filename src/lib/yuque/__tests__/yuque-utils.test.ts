import { describe, it, expect } from "vitest";
import {
  buildLocalImageFilename,
  buildTocTree,
  cleanYuqueMarkdown,
  extractYuqueImageUrls,
  isRepoSyncAllowed,
} from "../../../../scripts/yuque-utils.mjs";

describe("yuque-utils", () => {
  it("cleans Yuque HTML artifacts while preserving fenced code blocks", () => {
    const raw = [
      '<a name="abc12"></a>',
      '**<font style="color:#000;background:#FBDE28;">重点引用</font>**',
      "**<u>乐观锁</u>**",
      "                    --2026.03.27记",
      "",
      "![图](https://cdn.nlark.com/yuque/0/2026/png/1/a.png#align=left&width=100)",
      "",
      "```html",
      '<font color="red">keep inside code</font>',
      "```",
    ].join("\n");

    const cleaned = cleanYuqueMarkdown(raw);
    expect(cleaned).toContain("**重点引用**");
    expect(cleaned).toContain("**乐观锁**");
    expect(cleaned).not.toContain("<u>");
    expect(cleaned).toContain("\n--2026.03.27记\n");
    expect(cleaned).not.toContain("<a name=");
    expect(cleaned).toContain("![图](https://cdn.nlark.com/yuque/0/2026/png/1/a.png)");
    expect(cleaned).toContain('<font color="red">keep inside code</font>');
  });

  it("converts Yuque lake-collapse details blocks into [!COLLAPSE] markdown", () => {
    const raw =
      '<details class="lake-collapse"><summary id="u1"><strong>思考：AI 时代</strong></summary><p id="p1" class="ne-p">第一段 <code class="ne-code">git status</code></p><ol class="ne-ol"><li>要点一</li><li>要点二</li></ol></details>';

    const cleaned = cleanYuqueMarkdown(raw);
    expect(cleaned).toContain("> [!COLLAPSE] 思考：AI 时代");
    expect(cleaned).toContain("> 第一段 `git status`");
    expect(cleaned).toContain("> 1. 要点一");
    expect(cleaned).toContain("> 2. 要点二");
    expect(cleaned).not.toContain("<details");
    expect(cleaned).not.toContain("<p ");
  });

  it("extracts unique nlark.com image URLs and builds deterministic local filenames", () => {
    const md = [
      "![a](https://cdn.nlark.com/yuque/0/2026/png/1/demo.png)",
      "![b](https://cdn.nlark.com/yuque/0/2026/png/1/demo.png)",
      "![c](https://example.com/other.png)",
    ].join("\n");

    const urls = extractYuqueImageUrls(md);
    expect(urls).toEqual(["https://cdn.nlark.com/yuque/0/2026/png/1/demo.png"]);
    expect(buildLocalImageFilename(urls[0])).toMatch(/^[a-f0-9]{16}\.png$/);
  });

  it("builds nested TOC tree and prunes hidden or unpublished nodes", () => {
    const flat = [
      { uuid: "f1", parent_uuid: "", type: "TITLE", title: "章节一", slug: "#", visible: 1 },
      { uuid: "d1", parent_uuid: "f1", type: "DOC", title: "公开文", slug: "pub1", visible: 1 },
      { uuid: "d2", parent_uuid: "f1", type: "DOC", title: "草稿", slug: "draft1", visible: 1 },
      { uuid: "f2", parent_uuid: "", type: "TITLE", title: "空目录", slug: "#", visible: 1 },
      { uuid: "d3", parent_uuid: "", type: "DOC", title: "隐藏文", slug: "hid1", visible: 0 },
    ];

    const tree = buildTocTree(flat, new Set(["pub1", "hid1"]));
    expect(tree).toEqual([
      {
        uuid: "f1",
        type: "folder",
        title: "章节一",
        children: [
          { uuid: "d1", type: "doc", title: "公开文", slug: "pub1", children: [] },
        ],
      },
    ]);
  });

  it("strictly blocks private repos from syncing", () => {
    expect(isRepoSyncAllowed({ slug: "uw8ppk", name: "公开库", public: 1 })).toBe(true);
    expect(isRepoSyncAllowed({ slug: "hqb444", name: "简历", public: 0 })).toBe(false);
    expect(isRepoSyncAllowed({ slug: "hqb444", name: "简历", public: 0 }, ["hqb444"])).toBe(false);
    expect(isRepoSyncAllowed({ slug: "uw8ppk", name: "公开库", public: 1 }, ["uw8ppk"])).toBe(true);
    expect(isRepoSyncAllowed({ slug: "other", name: "其他", public: 1 }, ["uw8ppk"])).toBe(false);
  });
});

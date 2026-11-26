import { describe, it, expect } from "vitest";
import { createHeadingIdFactory, extractToc, slugifyHeading } from "../toc";
import { countWords } from "../markdown";

describe("slugifyHeading", () => {
  it("keeps CJK and alphanumerics, collapses punctuation", () => {
    expect(slugifyHeading("一、开始实习")).toBe("一-开始实习");
    expect(slugifyHeading("Hello, World!")).toBe("hello-world");
    expect(slugifyHeading("！！！")).toBe("section");
  });
});

describe("createHeadingIdFactory", () => {
  it("dedupes repeated headings in order", () => {
    const next = createHeadingIdFactory();
    expect(next("总结")).toBe("总结");
    expect(next("总结")).toBe("总结-1");
    expect(next("总结")).toBe("总结-2");
  });
});

describe("extractToc", () => {
  it("extracts h2/h3, skips code fences, and stays id-consistent with h1", () => {
    const md = [
      "# 标题",
      "## 一、开始实习",
      "正文",
      "```bash",
      "## not a heading",
      "```",
      "### 细节 `code`",
      "## 标题",
    ].join("\n");

    expect(extractToc(md)).toEqual([
      { id: "一-开始实习", text: "一、开始实习", depth: 2 },
      { id: "细节-code", text: "细节 code", depth: 3 },
      { id: "标题-1", text: "标题", depth: 2 },
    ]);
  });
});

describe("countWords", () => {
  it("counts CJK chars and latin words, ignoring code blocks", () => {
    expect(countWords("我在实习 Go 和 AI Agent")).toBe(5 + 3);
    expect(countWords("正文\n```ts\nconst a = 1;\n```")).toBe(2);
    expect(countWords("## 二、想法")).toBe(3);
  });
});

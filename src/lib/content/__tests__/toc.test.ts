import { describe, it, expect } from "vitest";
import {
  computeCenteredScrollTop,
  createHeadingIdFactory,
  extractToc,
  resolveActiveHeadingId,
  slugifyHeading,
} from "../toc";
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

describe("computeCenteredScrollTop", () => {
  it("stays at 0 when content fits inside container", () => {
    expect(
      computeCenteredScrollTop({
        itemTopInScroll: 120,
        itemHeight: 28,
        containerHeight: 400,
        scrollHeight: 320,
      }),
    ).toBe(0);
  });

  it("starts from top, centers active item in the middle, and clamps at bottom", () => {
    // 顶部前半段：中心点 94 < 容器一半 150 -> 保持在 0（从头开始）
    expect(
      computeCenteredScrollTop({
        itemTopInScroll: 80,
        itemHeight: 28,
        containerHeight: 300,
        scrollHeight: 900,
      }),
    ).toBe(0);

    // 中间段：中心点 414 - 容器一半 150 = 264 -> 保持在容器正中
    expect(
      computeCenteredScrollTop({
        itemTopInScroll: 400,
        itemHeight: 28,
        containerHeight: 300,
        scrollHeight: 900,
      }),
    ).toBe(264);

    // 末尾段：理论目标 714 > maxScrollTop 600 -> 贴底停在 600
    expect(
      computeCenteredScrollTop({
        itemTopInScroll: 850,
        itemHeight: 28,
        containerHeight: 300,
        scrollHeight: 900,
      }),
    ).toBe(600);
  });
});

describe("resolveActiveHeadingId", () => {
  const headings = [
    { id: "h1", top: -400 },
    { id: "h2", top: 80 },
    { id: "h3", top: 320 },
  ];

  it("picks the last heading at or above activationOffset", () => {
    expect(
      resolveActiveHeadingId({
        headings,
        activationOffset: 120,
        atBottom: false,
      }),
    ).toBe("h2");
  });

  it("falls back to first heading when all headings are below offset", () => {
    expect(
      resolveActiveHeadingId({
        headings: [
          { id: "h1", top: 200 },
          { id: "h2", top: 500 },
        ],
        activationOffset: 120,
        atBottom: false,
      }),
    ).toBe("h1");
  });

  it("picks the last heading when scrolled to bottom", () => {
    expect(
      resolveActiveHeadingId({
        headings,
        activationOffset: 120,
        atBottom: true,
      }),
    ).toBe("h3");
  });
});

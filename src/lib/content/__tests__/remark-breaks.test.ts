import { describe, it, expect } from "vitest";
import { remarkBreaks } from "../remark-breaks";

describe("remarkBreaks", () => {
  it("converts single newlines in text nodes into break nodes", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "第一行。\n这次\r\n第三行" }],
        },
      ],
    };

    remarkBreaks()(tree);

    expect(tree.children[0].children).toEqual([
      { type: "text", value: "第一行。" },
      { type: "break" },
      { type: "text", value: "这次" },
      { type: "break" },
      { type: "text", value: "第三行" },
    ]);
  });

  it("leaves fenced code blocks and inline code untouched", () => {
    const tree = {
      type: "root",
      children: [
        { type: "code", value: "line1\nline2" },
        {
          type: "paragraph",
          children: [{ type: "inlineCode", value: "a\nb" }],
        },
      ],
    };

    remarkBreaks()(tree);

    expect(tree.children[0]).toEqual({ type: "code", value: "line1\nline2" });
    expect(tree.children[1].children).toEqual([
      { type: "inlineCode", value: "a\nb" },
    ]);
  });
});

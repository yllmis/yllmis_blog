interface MdastNode {
  type: string;
  value?: string;
  children?: MdastNode[];
}

function transformChildren(node: MdastNode): void {
  if (!Array.isArray(node.children)) return;

  const nextChildren: MdastNode[] = [];
  for (const child of node.children) {
    if (child.type === "text" && typeof child.value === "string" && /\r?\n/.test(child.value)) {
      const parts = child.value.split(/\r?\n/);
      parts.forEach((part, idx) => {
        if (part.length > 0) {
          nextChildren.push({ type: "text", value: part });
        }
        if (idx < parts.length - 1) {
          nextChildren.push({ type: "break" });
        }
      });
    } else {
      transformChildren(child);
      nextChildren.push(child);
    }
  }

  node.children = nextChildren;
}

/**
 * Remark 插件：将段落内的单次回车（软换行 \n）转换为硬换行 <br />，
 * 使「按一次回车即换行、按两次回车分段」与编辑器源码视觉完全一致（不影响代码块）。
 */
export function remarkBreaks() {
  return (tree: MdastNode) => {
    transformChildren(tree);
  };
}

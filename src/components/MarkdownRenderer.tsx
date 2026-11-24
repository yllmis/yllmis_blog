"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div
      className={`prose prose-stone max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-headings:font-semibold prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-amber-400 prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

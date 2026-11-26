"use client";

import { isValidElement, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";
import { remarkBreaks } from "@/lib/content/remark-breaks";
import { createHeadingIdFactory } from "@/lib/content/toc";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function extractNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractNodeText).join("");
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractNodeText(node.props.children);
  }
  return "";
}

function extractCodeMeta(children: ReactNode): { language: string; code: string } {
  let language = "";
  if (isValidElement<{ className?: string; children?: ReactNode }>(children)) {
    const cls = children.props.className ?? "";
    const match = /language-([a-zA-Z0-9_+-]+)/.exec(cls);
    if (match) {
      language = match[1].toUpperCase();
    }
  }
  const code = extractNodeText(children).replace(/\n$/, "");
  return { language, code };
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const { language, code } = extractCodeMeta(children);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures in restricted contexts
    }
  };

  return (
    <div className="not-prose my-5 overflow-hidden rounded-2xl border border-stone-800/80 bg-[#0d1117] shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-600/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-stone-600/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-stone-600/80" />
          </span>
          <span className="ml-1 font-mono text-[11px] tracking-wider text-stone-400">
            {language || "CODE"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-stone-400 transition-colors hover:bg-white/10 hover:text-stone-100"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto bg-transparent p-0 text-sm leading-relaxed [&>code.hljs]:rounded-none [&>code.hljs]:bg-transparent [&>code.hljs]:p-4 [&>code]:block [&>code]:p-4 [&>code]:text-stone-100">
        {children}
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const nextHeadingId = createHeadingIdFactory();

  return (
    <div
      className={`prose prose-stone max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-stone-200/80 prose-h2:pb-2.5 prose-h2:text-xl dark:prose-h2:border-stone-800/80 prose-h3:mt-7 prose-h3:mb-3 prose-h3:text-lg prose-p:my-4 prose-p:leading-[1.9] prose-p:text-stone-700 dark:prose-p:text-stone-300 prose-a:text-sky-700 prose-a:underline prose-a:decoration-sky-400/50 prose-a:underline-offset-4 hover:prose-a:decoration-sky-500 dark:prose-a:text-sky-300 prose-blockquote:rounded-r-xl prose-blockquote:border-l-2 prose-blockquote:border-sky-400/70 prose-blockquote:bg-sky-50/50 prose-blockquote:py-1 prose-blockquote:pr-4 prose-blockquote:not-italic dark:prose-blockquote:bg-sky-950/30 prose-strong:font-semibold prose-strong:text-stone-900 dark:prose-strong:text-stone-100 prose-code:rounded-md prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.86em] prose-code:font-medium prose-code:text-stone-800 prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-slate-800/90 dark:prose-code:text-sky-200 prose-img:rounded-2xl prose-img:shadow-sm prose-hr:border-stone-200/80 dark:prose-hr:border-stone-800/80 prose-li:leading-[1.85] prose-li:text-stone-700 dark:prose-li:text-stone-300 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          h1: ({ children }) => (
            <h1 id={nextHeadingId(extractNodeText(children))}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 id={nextHeadingId(extractNodeText(children))}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 id={nextHeadingId(extractNodeText(children))}>{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 id={nextHeadingId(extractNodeText(children))}>{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 id={nextHeadingId(extractNodeText(children))}>{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 id={nextHeadingId(extractNodeText(children))}>{children}</h6>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

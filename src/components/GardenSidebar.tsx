"use client";

import { useState } from "react";
import Link from "next/link";
import { BookMarked, ChevronDown, ChevronRight, FileText, FolderOpen } from "lucide-react";
import type { GardenTocNode } from "@/lib/garden";

interface GardenSidebarProps {
  repoSlug: string;
  repoName: string;
  toc: GardenTocNode[];
  activeSlug: string;
  variant?: "desktop" | "mobile";
}

function containsSlug(node: GardenTocNode, target: string): boolean {
  if (node.slug === target) return true;
  return node.children.some((child) => containsSlug(child, target));
}

function TreeNodeList({
  repoSlug,
  nodes,
  activeSlug,
  depth = 0,
}: {
  repoSlug: string;
  nodes: GardenTocNode[];
  activeSlug: string;
  depth?: number;
}) {
  return (
    <ul className={depth > 0 ? "mt-0.5 space-y-0.5 border-l border-stone-200/80 pl-2.5 dark:border-stone-800" : "space-y-1"}>
      {nodes.map((node) => (
        <TreeNodeItem
          key={node.uuid || `${node.title}-${node.slug ?? ""}`}
          repoSlug={repoSlug}
          node={node}
          activeSlug={activeSlug}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function TreeNodeItem({
  repoSlug,
  node,
  activeSlug,
  depth,
}: {
  repoSlug: string;
  node: GardenTocNode;
  activeSlug: string;
  depth: number;
}) {
  const hasChildren = node.children.length > 0;
  const isActive = node.slug === activeSlug;
  const [open, setOpen] = useState(
    () => depth === 0 || containsSlug(node, activeSlug),
  );

  if (node.type === "folder" && !node.slug) {
    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left font-medium text-stone-700 transition-colors hover:bg-stone-100/80 dark:text-stone-200 dark:hover:bg-slate-800/70"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-stone-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-stone-400" />
          )}
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-sky-500/80" />
          <span className="truncate">{node.title}</span>
        </button>
        {open && hasChildren && (
          <TreeNodeList
            repoSlug={repoSlug}
            nodes={node.children}
            activeSlug={activeSlug}
            depth={depth + 1}
          />
        )}
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-center gap-0.5">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "收起子目录" : "展开子目录"}
            className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-slate-800 dark:hover:text-stone-200"
          >
            {open ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : null}
        <Link
          href={`/garden/${encodeURIComponent(repoSlug)}/${encodeURIComponent(node.slug!)}`}
          className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors ${
            isActive
              ? "bg-sky-50 font-medium text-sky-700 dark:bg-sky-950/70 dark:text-sky-300"
              : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-slate-800/70 dark:hover:text-stone-100"
          }`}
        >
          {!hasChildren && (
            <FileText
              className={`h-3 w-3 shrink-0 ${
                isActive ? "text-sky-500" : "text-stone-400/80"
              }`}
            />
          )}
          <span className="truncate">{node.title}</span>
        </Link>
      </div>

      {open && hasChildren && (
        <TreeNodeList
          repoSlug={repoSlug}
          nodes={node.children}
          activeSlug={activeSlug}
          depth={depth + 1}
        />
      )}
    </li>
  );
}

export function GardenSidebar({
  repoSlug,
  repoName,
  toc,
  activeSlug,
  variant = "desktop",
}: GardenSidebarProps) {
  if (variant === "mobile") {
    return (
      <nav aria-label="知识库目录树" className="text-xs">
        <details className="rounded-2xl border border-stone-200/80 bg-white/75 p-4 backdrop-blur-md dark:border-stone-800/80 dark:bg-slate-900/55">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-stone-700 dark:text-stone-200">
            <BookMarked className="h-4 w-4 text-sky-500" />
            <span>{repoName} · 知识库目录</span>
          </summary>
          <div className="mt-3 max-h-72 overflow-y-auto pr-1">
            <TreeNodeList
              repoSlug={repoSlug}
              nodes={toc}
              activeSlug={activeSlug}
            />
          </div>
        </details>
      </nav>
    );
  }

  return (
    <nav
      aria-label="知识库目录树"
      className="sticky top-28 max-h-[calc(100vh-8.5rem)] overflow-y-auto text-xs"
    >
      <div className="rounded-2xl border border-stone-200/70 bg-white/75 p-3.5 shadow-sm backdrop-blur-xl dark:border-stone-800/70 dark:bg-slate-900/55">
        <Link
          href="/garden"
          className="mb-3 flex items-center gap-1.5 border-b border-stone-200/80 pb-2.5 text-[11px] font-semibold text-stone-700 transition-colors hover:text-sky-600 dark:border-stone-800 dark:text-stone-200 dark:hover:text-sky-300"
        >
          <BookMarked className="h-3.5 w-3.5 shrink-0 text-sky-500" />
          <span className="truncate">{repoName}</span>
        </Link>
        <TreeNodeList repoSlug={repoSlug} nodes={toc} activeSlug={activeSlug} />
      </div>
    </nav>
  );
}

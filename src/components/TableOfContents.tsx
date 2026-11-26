"use client";

import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";
import type { TocItem } from "@/lib/content/toc";

interface TableOfContentsProps {
  items: TocItem[];
  accent?: "sky" | "amber";
  variant?: "desktop" | "mobile";
}

export function TableOfContents({
  items,
  accent = "sky",
  variant = "desktop",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (variant !== "desktop" || items.length < 2) return;

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-90px 0px -65% 0px",
        threshold: 0,
      },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items, variant]);

  if (items.length < 2) {
    return null;
  }

  const activeTextClass =
    accent === "amber"
      ? "border-amber-500 font-medium text-amber-700 dark:border-amber-400 dark:text-amber-300"
      : "border-sky-500 font-medium text-sky-700 dark:border-sky-400 dark:text-sky-300";

  if (variant === "mobile") {
    return (
      <nav aria-label="文章目录" className="text-xs">
        <details className="rounded-2xl border border-stone-200/80 bg-white/75 p-4 backdrop-blur-md dark:border-stone-800/80 dark:bg-slate-900/55">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-stone-700 dark:text-stone-200">
            <ListTree className="h-4 w-4 text-stone-400" />
            目录导航（{items.length}）
          </summary>
          <ul className="mt-3 space-y-1.5 border-l border-stone-200 pl-3 dark:border-stone-800">
            {items.map((item) => (
              <li key={item.id} className={item.depth === 3 ? "pl-3" : ""}>
                <a
                  href={`#${item.id}`}
                  className="block py-0.5 text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </nav>
    );
  }

  return (
    <nav
      aria-label="文章目录"
      className="sticky top-28 max-h-[calc(100vh-8.5rem)] overflow-y-auto text-xs"
    >
      <div className="rounded-2xl border border-stone-200/70 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-stone-800/70 dark:bg-slate-900/55">
        <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          <ListTree className="h-3.5 w-3.5" />
          目录
        </div>
        <ul className="space-y-1 border-l border-stone-200/90 dark:border-stone-800">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setActiveId(item.id)}
                  className={`-ml-px block truncate border-l-2 py-1 pr-2 transition-colors ${
                    item.depth === 3 ? "pl-5" : "pl-3"
                  } ${
                    isActive
                      ? activeTextClass
                      : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-900 dark:text-stone-400 dark:hover:border-stone-700 dark:hover:text-stone-100"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

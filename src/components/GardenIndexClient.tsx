"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookMarked, ExternalLink, FileText, Search } from "lucide-react";
import type { GardenRepo } from "@/lib/garden";

interface FlatGardenEntry {
  repoSlug: string;
  repoName: string;
  slug: string;
  title: string;
  date: string;
  summary: string;
}

interface GardenIndexClientProps {
  repos: GardenRepo[];
  entries: FlatGardenEntry[];
}

export function GardenIndexClient({ repos, entries }: GardenIndexClientProps) {
  const [query, setQuery] = useState("");
  const keyword = query.trim().toLowerCase();

  const filteredEntries = useMemo(() => {
    if (!keyword) return entries;
    return entries.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.summary.toLowerCase().includes(keyword) ||
        item.repoName.toLowerCase().includes(keyword),
    );
  }, [entries, keyword]);

  return (
    <div className="space-y-10">
      {/* 搜索框 */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索知识库笔记标题或关键词..."
          className="w-full rounded-2xl border border-sky-200/70 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-stone-900 backdrop-blur-md transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 dark:border-sky-400/20 dark:bg-slate-900/65 dark:text-stone-100"
        />
      </div>

      {/* 知识库总览卡片 */}
      {!keyword && repos.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2">
          {repos.map((repo) => {
            const firstEntry = entries.find((e) => e.repoSlug === repo.slug);
            const href = firstEntry
              ? `/garden/${encodeURIComponent(repo.slug)}/${encodeURIComponent(firstEntry.slug)}`
              : "/garden";
            return (
              <div
                key={repo.slug}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sky-200/60 bg-white/80 p-6 shadow-[0_8px_30px_rgba(14,165,233,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/70 hover:shadow-[0_12px_32px_rgba(56,189,248,0.14)] dark:border-sky-400/15 dark:bg-slate-900/60 dark:hover:border-sky-400/40"
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-sky-400/80 via-indigo-400/60 to-transparent" />
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 font-medium text-sky-700 dark:bg-sky-950/70 dark:text-sky-300">
                      <BookMarked className="h-3.5 w-3.5" />
                      语雀开放花园
                    </span>
                    <span className="font-mono">{repo.docCount} 篇笔记</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-stone-900 dark:text-stone-50">
                    <Link
                      href={href}
                      className="transition-colors hover:text-sky-700 dark:hover:text-sky-300"
                    >
                      {repo.name}
                    </Link>
                  </h2>
                  {repo.description && (
                    <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                      {repo.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-stone-200/70 pt-3.5 text-xs dark:border-stone-800">
                  <a
                    href={repo.yuqueUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-stone-400 transition-colors hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    语雀原库 <ExternalLink className="h-3 w-3" />
                  </a>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1 font-medium text-sky-700 transition-colors hover:text-sky-500 dark:text-sky-300"
                  >
                    进入目录树 <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* 全部笔记列表 / 搜索结果 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-sky-400 to-indigo-500" />
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {keyword ? `搜索结果（${filteredEntries.length}）` : `全部知识笔记（${entries.length}）`}
            </h2>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500 dark:border-stone-700">
            没有找到匹配的笔记
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredEntries.map((item) => (
              <Link
                key={`${item.repoSlug}/${item.slug}`}
                href={`/garden/${encodeURIComponent(item.repoSlug)}/${encodeURIComponent(item.slug)}`}
                className="group flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white/75 p-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-sky-300/80 hover:shadow-sm dark:border-stone-800/80 dark:bg-slate-900/55 dark:hover:border-sky-400/40"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-stone-400">
                    <span className="inline-flex items-center gap-1 truncate font-medium text-sky-600/90 dark:text-sky-300/90">
                      <FileText className="h-3 w-3 shrink-0" />
                      {item.repoName}
                    </span>
                    <time className="shrink-0 font-mono">{item.date}</time>
                  </div>
                  <h3 className="mt-1.5 font-semibold text-stone-900 transition-colors group-hover:text-sky-700 dark:text-stone-100 dark:group-hover:text-sky-300">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                      {item.summary}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

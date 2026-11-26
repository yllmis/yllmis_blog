import { getGardenCatalog, flattenGardenTocDocs } from "@/lib/garden";
import { GardenIndexClient } from "@/components/GardenIndexClient";

export const dynamic = "force-dynamic";

export default async function GardenPage() {
  const catalog = await getGardenCatalog();

  const entries = catalog.repos.flatMap((repo) => {
    const ordered = flattenGardenTocDocs(repo.toc);
    const seen = new Set<string>();
    const list = [];

    for (const item of ordered) {
      const meta = repo.docs[item.slug];
      if (!meta || seen.has(item.slug)) continue;
      seen.add(item.slug);
      list.push({
        repoSlug: repo.slug,
        repoName: repo.name,
        slug: meta.slug,
        title: meta.title,
        date: meta.date,
        summary: meta.summary,
      });
    }

    // 兜底：不在 TOC 树中但已发布的公开文档
    for (const meta of Object.values(repo.docs)) {
      if (seen.has(meta.slug)) continue;
      list.push({
        repoSlug: repo.slug,
        repoName: repo.name,
        slug: meta.slug,
        title: meta.title,
        date: meta.date,
        summary: meta.summary,
      });
    }

    return list;
  });

  const syncedDate = catalog.syncedAt ? catalog.syncedAt.slice(0, 10) : "";

  return (
    <div className="relative space-y-8">
      {/* 与主页一致的柔和星海顶部氛围光 */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 overflow-hidden"
      >
        <div
          className="mx-auto h-full max-w-4xl opacity-60 blur-3xl dark:opacity-35"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.08) 55%, transparent 80%)",
          }}
        />
      </div>

      <header className="space-y-3">
        {syncedDate && (
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-3 py-1 text-xs text-stone-600 backdrop-blur-md dark:border-sky-400/20 dark:bg-slate-900/60 dark:text-stone-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            语雀开放花园自动同步 · 最近同步 {syncedDate}
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          知识库
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          从语雀开放花园单向同步的体系化学习笔记与成长沉淀，共 {catalog.repos.length} 个公开知识库、
          {entries.length} 篇文档
        </p>
      </header>

      {catalog.repos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white/60 p-12 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-slate-900/40">
          尚未同步语雀知识库，请运行 <code className="font-mono">npm run sync:yuque</code> 或在 GitHub Actions 中触发同步。
        </div>
      ) : (
        <GardenIndexClient repos={catalog.repos} entries={entries} />
      )}
    </div>
  );
}

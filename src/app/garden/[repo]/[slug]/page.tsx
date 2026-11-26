import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
} from "lucide-react";
import { extractToc, validateSlug } from "@/lib/content";
import {
  flattenGardenTocDocs,
  getGardenDoc,
  getGardenRepo,
} from "@/lib/garden";
import { GardenSidebar } from "@/components/GardenSidebar";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TableOfContents } from "@/components/TableOfContents";

export const dynamic = "force-dynamic";

interface GardenDocPageProps {
  params: Promise<{ repo: string; slug: string }>;
}

export default async function GardenDocPage({ params }: GardenDocPageProps) {
  const { repo: rawRepo, slug: rawSlug } = await params;

  let repoSlug: string;
  let docSlug: string;
  try {
    repoSlug = validateSlug(rawRepo);
    docSlug = validateSlug(rawSlug);
  } catch {
    notFound();
  }

  const [repo, doc] = await Promise.all([
    getGardenRepo(repoSlug),
    getGardenDoc(repoSlug, docSlug),
  ]);

  if (!repo || !doc) {
    notFound();
  }

  const toc = extractToc(doc.body);
  const hasToc = toc.length >= 2;

  const flatDocs = flattenGardenTocDocs(repo.toc);
  const idx = flatDocs.findIndex((item) => item.slug === doc.slug);
  const prevDoc = idx > 0 ? flatDocs[idx - 1] : null;
  const nextDoc =
    idx >= 0 && idx < flatDocs.length - 1 ? flatDocs[idx + 1] : null;

  return (
    <>
      <ReadingProgress />

      {/* 与主页呼应的柔和星海顶部氛围光 */}
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

      <article className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/garden"
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/75 px-3.5 py-1.5 text-xs font-medium text-stone-600 backdrop-blur-md transition-all hover:border-sky-300/80 hover:text-sky-700 dark:border-stone-800 dark:bg-slate-900/60 dark:text-stone-300 dark:hover:border-sky-400/40 dark:hover:text-sky-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回知识库 · {repo.name}
          </Link>

          {doc.yuqueUrl && (
            <a
              href={doc.yuqueUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-white/75 px-3 py-1.5 text-xs text-stone-500 backdrop-blur-md transition-colors hover:border-sky-300/80 hover:text-sky-700 dark:border-stone-800 dark:bg-slate-900/60 dark:text-stone-400 dark:hover:text-sky-300"
            >
              在语雀查看原文 <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* 标题与元信息卡片 */}
        <header className="relative overflow-hidden rounded-3xl border border-sky-200/60 bg-white/80 p-6 shadow-[0_8px_30px_rgba(14,165,233,0.05)] backdrop-blur-xl dark:border-sky-400/15 dark:bg-slate-900/60 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-sky-400/75 via-indigo-400/60 to-transparent" />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500 dark:text-stone-400">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 font-medium text-sky-700 dark:bg-sky-950/70 dark:text-sky-300">
              <BookMarked className="h-3 w-3" />
              {repo.name}
            </span>
            {doc.date && (
              <span className="inline-flex items-center gap-1.5 font-mono">
                <Calendar className="h-3.5 w-3.5 text-sky-500" />
                {doc.date}
              </span>
            )}
            <span className="inline-flex items-center gap-1 font-mono">
              <FileText className="h-3.5 w-3.5 text-stone-400" />
              约 {doc.wordCount} 字
            </span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Clock className="h-3.5 w-3.5 text-stone-400" />
              约 {doc.readingMinutes} 分钟
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl sm:leading-tight">
            {doc.title}
          </h1>
        </header>

        {/* 居中正文阅读区 + 左侧悬浮知识库目录树 + 右侧悬浮本页目录 */}
        <div className="relative">
          {/* 窄屏折叠目录区 */}
          <div className="mb-6 space-y-3 xl:hidden">
            <GardenSidebar
              repoSlug={repo.slug}
              repoName={repo.name}
              toc={repo.toc}
              activeSlug={doc.slug}
              variant="mobile"
            />
            {hasToc && (
              <TableOfContents items={toc} accent="sky" variant="mobile" />
            )}
          </div>

          {/* 宽屏左侧：悬浮跟随滚动的知识库多级目录树 */}
          <aside className="absolute bottom-0 right-full top-0 mr-4 hidden w-44 xl:block 2xl:mr-8 2xl:w-56">
            <GardenSidebar
              repoSlug={repo.slug}
              repoName={repo.name}
              toc={repo.toc}
              activeSlug={doc.slug}
              variant="desktop"
            />
          </aside>

          {/* 居中阅读纸张（与标题卡同宽完全居中） */}
          <div className="rounded-3xl border border-stone-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-stone-800/80 dark:bg-slate-900/55 sm:p-10">
            <MarkdownRenderer content={doc.body} />
          </div>

          {/* 宽屏右侧：悬浮跟随滚动的本页章节目录 */}
          {hasToc && (
            <aside className="absolute bottom-0 left-full top-0 ml-4 hidden w-44 xl:block 2xl:ml-8 2xl:w-52">
              <TableOfContents items={toc} accent="sky" variant="desktop" />
            </aside>
          )}
        </div>

        {/* 知识库内上一节 / 下一节导航 */}
        {(prevDoc || nextDoc) && (
          <nav
            aria-label="知识库相邻文档导航"
            className="grid gap-3 pt-2 sm:grid-cols-2"
          >
            {prevDoc ? (
              <Link
                href={`/garden/${encodeURIComponent(repo.slug)}/${encodeURIComponent(prevDoc.slug)}`}
                className="group rounded-2xl border border-stone-200/80 bg-white/75 p-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-sky-300/80 hover:shadow-sm dark:border-stone-800 dark:bg-slate-900/55 dark:hover:border-sky-400/40"
              >
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 group-hover:text-sky-600 dark:group-hover:text-sky-300">
                  <ArrowLeft className="h-3 w-3" />
                  上一节
                </span>
                <p className="mt-1.5 truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {prevDoc.title}
                </p>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}

            {nextDoc && (
              <Link
                href={`/garden/${encodeURIComponent(repo.slug)}/${encodeURIComponent(nextDoc.slug)}`}
                className="group rounded-2xl border border-stone-200/80 bg-white/75 p-4 text-right backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-sky-300/80 hover:shadow-sm dark:border-stone-800 dark:bg-slate-900/55 dark:hover:border-sky-400/40"
              >
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 group-hover:text-sky-600 dark:group-hover:text-sky-300">
                  下一节
                  <ArrowRight className="h-3 w-3" />
                </span>
                <p className="mt-1.5 truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {nextDoc.title}
                </p>
              </Link>
            )}
          </nav>
        )}
      </article>
    </>
  );
}

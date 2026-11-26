import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  Sparkles,
} from "lucide-react";
import { extractToc, getContentStore, validateSlug } from "@/lib/content";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TableOfContents } from "@/components/TableOfContents";

export const dynamic = "force-dynamic";

interface DiaryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DiaryDetailPage({ params }: DiaryDetailPageProps) {
  const { slug } = await params;

  let validSlug: string;
  try {
    validSlug = validateSlug(slug);
  } catch {
    notFound();
  }

  const store = getContentStore();
  const [diary, allDiaries] = await Promise.all([
    store.get("diary", validSlug),
    store.list("diary"),
  ]);
  if (!diary) {
    notFound();
  }

  const toc = extractToc(diary.body);
  const hasToc = toc.length >= 2;

  const currentIdx = allDiaries.findIndex((item) => item.slug === diary.slug);
  const newerDiary = currentIdx > 0 ? allDiaries[currentIdx - 1] : null;
  const olderDiary =
    currentIdx >= 0 && currentIdx < allDiaries.length - 1
      ? allDiaries[currentIdx + 1]
      : null;

  return (
    <>
      <ReadingProgress />

      {/* 柔和暖金+星海顶部氛围光 */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 overflow-hidden"
      >
        <div
          className="mx-auto h-full max-w-4xl opacity-60 blur-3xl dark:opacity-35"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.16), rgba(56, 189, 248, 0.1) 55%, transparent 80%)",
          }}
        />
      </div>

      <article className="space-y-8">
        <Link
          href="/diary"
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/75 px-3.5 py-1.5 text-xs font-medium text-stone-600 backdrop-blur-md transition-all hover:border-amber-300/80 hover:text-amber-700 dark:border-stone-800 dark:bg-slate-900/60 dark:text-stone-300 dark:hover:border-amber-400/40 dark:hover:text-amber-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回日记时间轴
        </Link>

        {/* 日记标题与心情卡片 */}
        <header className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 p-6 shadow-[0_8px_30px_rgba(251,191,36,0.06)] backdrop-blur-xl dark:border-amber-400/15 dark:bg-slate-900/60 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-amber-400/80 via-sky-400/55 to-transparent" />

          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-xs text-stone-500 dark:text-stone-400">
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              {diary.date}
            </span>
            {diary.mood && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                <Sparkles className="h-3 w-3" />
                {diary.mood}
              </span>
            )}
            {diary.wordCount !== undefined && (
              <span className="inline-flex items-center gap-1 font-mono">
                <FileText className="h-3.5 w-3.5 text-stone-400" />
                约 {diary.wordCount} 字
              </span>
            )}
            {diary.readingMinutes && (
              <span className="inline-flex items-center gap-1 font-mono">
                <Clock className="h-3.5 w-3.5 text-stone-400" />
                约 {diary.readingMinutes} 分钟
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl sm:leading-tight">
            {diary.title}
          </h1>

          {diary.summary && (
            <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400 sm:text-base">
              {diary.summary}
            </p>
          )}
        </header>

        {/* 正文阅读区 + 可选悬浮目录 */}
        <div
          className={
            hasToc
              ? "flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_200px] lg:items-start lg:gap-8"
              : ""
          }
        >
          {hasToc && (
            <div className="lg:hidden">
              <TableOfContents items={toc} accent="amber" />
            </div>
          )}

          <div className="rounded-3xl border border-stone-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-stone-800/80 dark:bg-slate-900/55 sm:p-10">
            <MarkdownRenderer content={diary.body} />
          </div>

          {hasToc && (
            <aside className="hidden lg:block">
              <TableOfContents items={toc} accent="amber" />
            </aside>
          )}
        </div>

        {/* 上一篇 / 下一篇日记导航 */}
        {(newerDiary || olderDiary) && (
          <nav
            aria-label="相邻日记导航"
            className="grid gap-3 pt-2 sm:grid-cols-2"
          >
            {newerDiary ? (
              <Link
                href={`/diary/${newerDiary.slug}`}
                className="group rounded-2xl border border-stone-200/80 bg-white/75 p-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-amber-300/80 hover:shadow-sm dark:border-stone-800 dark:bg-slate-900/55 dark:hover:border-amber-400/40"
              >
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-300">
                  <ArrowLeft className="h-3 w-3" />
                  上一篇 · {newerDiary.date}
                </span>
                <p className="mt-1.5 truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {newerDiary.title}
                </p>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}

            {olderDiary && (
              <Link
                href={`/diary/${olderDiary.slug}`}
                className="group rounded-2xl border border-stone-200/80 bg-white/75 p-4 text-right backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-amber-300/80 hover:shadow-sm dark:border-stone-800 dark:bg-slate-900/55 dark:hover:border-amber-400/40"
              >
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-300">
                  下一篇 · {olderDiary.date}
                  <ArrowRight className="h-3 w-3" />
                </span>
                <p className="mt-1.5 truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {olderDiary.title}
                </p>
              </Link>
            )}
          </nav>
        )}
      </article>
    </>
  );
}

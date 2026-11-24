import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { getContentStore, validateSlug } from "@/lib/content";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ReadingProgress } from "@/components/ReadingProgress";

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

  const diary = await getContentStore().get("diary", validSlug);
  if (!diary) {
    notFound();
  }

  return (
    <>
      <ReadingProgress />
      <article className="space-y-8">
      <Link
        href="/diary"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
      >
        <ArrowLeft className="h-4 w-4" />
        返回日记时间轴
      </Link>

      <header className="space-y-4 border-b border-stone-200 pb-6 dark:border-stone-800">
        <div className="flex flex-wrap items-center gap-2.5 text-sm text-stone-500 dark:text-stone-400">
          <span className="inline-flex items-center gap-1.5 font-mono">
            <Calendar className="h-4 w-4" />
            {diary.date}
          </span>
          {diary.mood && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Sparkles className="h-3 w-3" />
              {diary.mood}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
          {diary.title}
        </h1>
      </header>

      <MarkdownRenderer content={diary.body} />
      </article>
    </>
  );
}

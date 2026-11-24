import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getContentStore } from "@/lib/content";
import { RevealOnScroll } from "@/components/RevealOnScroll";

export const dynamic = "force-dynamic";

export default async function DiaryTimelinePage() {
  const diaries = await getContentStore().list("diary");

  // 按年份分组，方便时间轴更有层次感
  const groupedByYear = new Map<string, typeof diaries>();
  for (const item of diaries) {
    const year = item.date.slice(0, 4) || "未分类";
    const list = groupedByYear.get(year) ?? [];
    list.push(item);
    groupedByYear.set(year, list);
  }
  const years = Array.from(groupedByYear.entries());

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          日记时间轴
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          按时间记录生活碎片与当下心情，共 {diaries.length} 篇
        </p>
      </div>

      {years.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-12 text-center text-sm text-stone-500 dark:border-stone-700">
          还没有写过日记，去右上角「写作」记录今天吧。
        </div>
      ) : (
        <div className="space-y-12">
          {years.map(([year, items]) => (
            <section key={year} className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-3.5 py-1 text-sm font-semibold text-white dark:bg-stone-100 dark:text-stone-900">
                {year}
              </div>

              <div className="relative ml-3 space-y-6 border-l-2 border-stone-200 pl-7 dark:border-stone-800 sm:ml-4 sm:pl-9">
                {items.map((diary, index) => {
                  const monthDay = diary.date.slice(5) || diary.date;
                  return (
                    <RevealOnScroll
                      key={diary.slug}
                      delayMs={Math.min(index * 60, 240)}
                      className="relative"
                    >
                      {/* 时间轴圆点 */}
                      <span className="absolute -left-[37px] top-6 flex h-4 w-4 items-center justify-center rounded-full border-2 border-amber-500 bg-stone-50 dark:bg-stone-950 sm:-left-[45px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      </span>

                      {/* 日记卡片 */}
                      <Link
                        href={`/diary/${diary.slug}`}
                        className="group block rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-400/80 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/70 dark:hover:border-amber-600/70 sm:p-6"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <time className="rounded-md bg-stone-100 px-2.5 py-0.5 font-mono text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                              {monthDay}
                            </time>
                            {diary.mood && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                <Sparkles className="h-3 w-3" />
                                {diary.mood}
                              </span>
                            )}
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs text-stone-400 transition-colors group-hover:text-amber-600 dark:text-stone-500 dark:group-hover:text-amber-400">
                            阅读 <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>

                        <h2 className="mt-3 text-lg font-semibold text-stone-900 transition-colors group-hover:text-amber-700 dark:text-stone-100 dark:group-hover:text-amber-400">
                          {diary.title}
                        </h2>

                        {diary.summary && (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                            {diary.summary}
                          </p>
                        )}
                      </Link>
                    </RevealOnScroll>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

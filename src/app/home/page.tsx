import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Compass,
  Quote,
  Sparkles,
  Tag,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { resolveAvatarSrc } from "@/lib/avatar";
import { getContentStore } from "@/lib/content";
import { Avatar } from "@/components/Avatar";
import { Greeting } from "@/components/Greeting";

export const dynamic = "force-dynamic";

export default async function PersonalHomePage() {
  const store = getContentStore();
  const [posts, diaries] = await Promise.all([
    store.list("posts"),
    store.list("diary"),
  ]);
  const avatarSrc = resolveAvatarSrc();

  const recentPosts = posts.slice(0, 4);
  const recentDiaries = diaries.slice(0, 3);
  const uniqueTags = new Set(posts.flatMap((p) => p.tags));

  return (
    <div className="space-y-14">
      {/* Bento Grid 个人名片区 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {/* 主名片卡 */}
        <div className="flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/70 sm:p-8 md:col-span-4">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <div className="inline-block rounded-full p-1 ring-2 ring-stone-200 dark:ring-stone-700">
                <Avatar src={avatarSrc} size="lg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-100/80 px-3 py-0.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {siteConfig.status}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
                <Greeting />，我是 {siteConfig.author}
              </h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-stone-600 dark:text-stone-400 sm:text-base">
            {siteConfig.bio}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href="/posts"
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              <BookOpen className="h-4 w-4" />
              浏览文章
            </Link>
            <Link
              href="/diary"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <CalendarDays className="h-4 w-4" />
              日记时间轴
            </Link>
          </div>
        </div>

        {/* 右侧数据统计双卡 */}
        <div className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-1">
          <Link
            href="/posts"
            className="group flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-400/70 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/70 dark:hover:border-amber-600/60"
          >
            <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400">
              <span>文章与随笔</span>
              <BookOpen className="h-4 w-4 text-amber-500 transition-transform group-hover:scale-110" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                {posts.length}
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                覆盖 {uniqueTags.size} 个标签主题
              </p>
            </div>
          </Link>

          <Link
            href="/diary"
            className="group flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-400/70 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/70 dark:hover:border-sky-500/60"
          >
            <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400">
              <span>日记时间轴</span>
              <CalendarDays className="h-4 w-4 text-sky-500 transition-transform group-hover:scale-110" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                {diaries.length}
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {diaries[0] ? `最近更新 ${diaries[0].date}` : "等待写下第一篇"}
              </p>
            </div>
          </Link>
        </div>

        {/* 技术栈与兴趣标签卡 */}
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/70 md:col-span-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            <Compass className="h-3.5 w-3.5 text-amber-500" />
            关注领域与标签
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {siteConfig.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 dark:border-stone-700/80 dark:bg-stone-800/80 dark:text-stone-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* 座右铭与星空封面入口卡 */}
        <div className="flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-gradient-to-br from-stone-900 via-slate-900 to-indigo-950 p-6 text-stone-100 shadow-sm dark:border-stone-800 md:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <Quote className="h-5 w-5 shrink-0 text-amber-400/80" />
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-stone-200 transition-colors hover:bg-white/20"
            >
              <Sparkles className="h-3 w-3 text-amber-300" />
              星空封面
            </Link>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-stone-200 sm:text-base">
            “{siteConfig.motto}”
          </p>
        </div>
      </section>

      {/* 最新文章 */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            最新文章与随笔
          </h2>
          <Link
            href="/posts"
            className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            查看全部 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 dark:border-stone-700">
            暂时还没有发布文章。
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {recentPosts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/60 dark:hover:border-stone-700"
              >
                <div>
                  <time className="text-xs font-medium text-stone-400 dark:text-stone-500">
                    {post.date}
                  </time>
                  <h3 className="mt-1.5 text-lg font-semibold text-stone-900 transition-colors group-hover:text-amber-700 dark:text-stone-100 dark:group-hover:text-amber-400">
                    <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                  </h3>
                  {post.summary && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                      {post.summary}
                    </p>
                  )}
                </div>

                {post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/posts?tag=${encodeURIComponent(tag)}`}
                        className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 近期日记 */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            近期日记
          </h2>
          <Link
            href="/diary"
            className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            完整时间轴 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentDiaries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 dark:border-stone-700">
            还没有写日记。
          </p>
        ) : (
          <div className="relative ml-2 space-y-4 border-l-2 border-stone-200 pl-6 dark:border-stone-800">
            {recentDiaries.map((diary) => (
              <Link
                key={diary.slug}
                href={`/diary/${diary.slug}`}
                className="group relative block rounded-xl border border-stone-200/80 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900/60 dark:hover:border-amber-700/70"
              >
                <span className="absolute -left-[31px] top-5 h-3 w-3 rounded-full border-2 border-stone-50 bg-amber-500 ring-2 ring-amber-500/20 dark:border-stone-950" />
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
                  <time>{diary.date}</time>
                  {diary.mood && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                      {diary.mood}
                    </span>
                  )}
                </div>
                <h3 className="mt-1 font-medium text-stone-900 group-hover:text-amber-700 dark:text-stone-100 dark:group-hover:text-amber-400">
                  {diary.title}
                </h3>
                {diary.summary && (
                  <p className="mt-1 line-clamp-1 text-sm text-stone-600 dark:text-stone-400">
                    {diary.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

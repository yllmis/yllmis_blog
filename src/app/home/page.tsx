import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  Compass,
  MapPin,
  Quote,
  Sparkles,
  Tag,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { resolveAvatarSrc } from "@/lib/avatar";
import { getContentStore } from "@/lib/content";
import { Avatar } from "@/components/Avatar";
import { Greeting } from "@/components/Greeting";
import { SocialActions } from "@/components/SocialActions";

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

  const glassCard =
    "relative overflow-hidden rounded-3xl border border-sky-200/60 bg-white/75 backdrop-blur-xl shadow-[0_8px_30px_rgba(14,165,233,0.06)] transition-all duration-300 dark:border-sky-400/15 dark:bg-slate-900/60 dark:shadow-[0_8px_32px_rgba(2,6,23,0.45)]";

  return (
    <div className="relative space-y-14">
      {/* 风格 A：星海柔光背景氛围层 + 细腻点阵纹理（呼应星空封面与蓝蝶头像） */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="animate-aurora absolute -left-[10%] -top-[12%] h-[520px] w-[520px] rounded-full opacity-70 blur-3xl dark:opacity-45"
          style={{
            background:
              "radial-gradient(circle, rgba(56, 189, 248, 0.24) 0%, rgba(129, 140, 248, 0.12) 48%, transparent 72%)",
          }}
        />
        <div
          className="animate-aurora absolute -right-[8%] top-[18%] h-[460px] w-[460px] rounded-full opacity-60 blur-3xl dark:opacity-40"
          style={{
            animationDelay: "-6s",
            background:
              "radial-gradient(circle, rgba(165, 180, 252, 0.24) 0%, rgba(251, 191, 36, 0.1) 52%, transparent 74%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(56, 189, 248, 0.28) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Bento Grid 个人名片区（错落入场动效） */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {/* 主名片卡：星海微光头像 + 坐标 + 状态 + 社交快捷操作 */}
        <div
          className={`${glassCard} animate-fade-up flex flex-col justify-between p-6 hover:border-sky-300/80 hover:shadow-[0_12px_40px_rgba(56,189,248,0.12)] dark:hover:border-sky-400/35 sm:p-8 md:col-span-4`}
        >
          {/* 顶部柔和星海高光丝线 */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0 self-start sm:self-auto">
              <span className="pointer-events-none absolute -inset-1.5 rounded-full bg-gradient-to-tr from-sky-400/45 via-indigo-400/35 to-amber-300/35 blur-md" />
              <div className="relative rounded-full bg-white/80 p-1 ring-2 ring-sky-300/60 dark:bg-slate-900/80 dark:ring-sky-400/40">
                <Avatar src={avatarSrc} size="lg" />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/80 bg-sky-50/80 px-2.5 py-0.5 text-xs font-medium text-sky-800 dark:border-sky-400/25 dark:bg-sky-950/60 dark:text-sky-200">
                  <MapPin className="h-3 w-3 text-sky-500" />
                  {siteConfig.location} · {siteConfig.school}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  在线记录中
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
                <Greeting />，我是{" "}
                <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent dark:from-sky-300 dark:via-indigo-300 dark:to-amber-200">
                  {siteConfig.author}
                </span>
              </h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-stone-600 dark:text-stone-300/90 sm:text-base">
            {siteConfig.bio}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/posts"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:from-sky-400 dark:to-indigo-400 dark:text-slate-950"
              >
                <BookOpen className="h-4 w-4" />
                浏览文章
              </Link>
              <Link
                href="/diary"
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-sky-400/70 hover:bg-sky-50/80 dark:border-sky-400/20 dark:bg-slate-900/70 dark:text-stone-200 dark:hover:border-sky-400/45 dark:hover:bg-sky-950/50"
              >
                <CalendarDays className="h-4 w-4 text-sky-500" />
                日记时间轴
              </Link>
            </div>

            <SocialActions />
          </div>
        </div>

        {/* 右侧数据统计双卡 */}
        <div className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-1">
          <Link
            href="/posts"
            style={{ animationDelay: "80ms" }}
            className={`${glassCard} animate-fade-up group flex flex-col justify-between p-5 hover:-translate-y-1 hover:border-sky-400/70 hover:shadow-[0_12px_32px_rgba(56,189,248,0.16)] dark:hover:border-sky-400/45`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400">
              <span>文章与随笔</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100/80 text-sky-600 transition-transform duration-300 group-hover:scale-110 dark:bg-sky-950/80 dark:text-sky-300">
                <BookOpen className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="font-mono text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                {posts.length}
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                覆盖 {uniqueTags.size} 个标签主题
              </p>
            </div>
          </Link>

          <Link
            href="/diary"
            style={{ animationDelay: "140ms" }}
            className={`${glassCard} animate-fade-up group flex flex-col justify-between p-5 hover:-translate-y-1 hover:border-amber-400/70 hover:shadow-[0_12px_32px_rgba(251,191,36,0.14)] dark:hover:border-amber-400/45`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400">
              <span>日记时间轴</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100/80 text-amber-600 transition-transform duration-300 group-hover:scale-110 dark:bg-amber-950/70 dark:text-amber-300">
                <CalendarDays className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="font-mono text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                {diaries.length}
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {diaries[0] ? `最近更新 ${diaries[0].date}` : "等待写下第一篇"}
              </p>
            </div>
          </Link>
        </div>

        {/* 技术栈与兴趣标签卡 */}
        <div
          style={{ animationDelay: "180ms" }}
          className={`${glassCard} animate-fade-up p-6 hover:border-sky-300/80 dark:hover:border-sky-400/35 md:col-span-3`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            <Compass className="h-3.5 w-3.5 text-sky-500" />
            关注领域与技术栈
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {siteConfig.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-xl border border-sky-200/70 bg-sky-50/60 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:border-sky-400/70 hover:bg-sky-100/80 dark:border-sky-400/20 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:border-sky-400/45 dark:hover:bg-sky-900/50"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* 座右铭与星空封面入口卡 */}
        <div
          style={{ animationDelay: "240ms" }}
          className="animate-fade-up relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sky-400/25 bg-gradient-to-br from-[#071128] via-[#0e1b3d] to-[#11274a] p-6 text-stone-100 shadow-[0_12px_36px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300/50 hover:shadow-[0_16px_42px_rgba(56,189,248,0.2)] md:col-span-3"
        >
          {/* 卡片内微光星云装饰 */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 right-8 h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.9)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-20 top-12 h-1 w-1 rounded-full bg-amber-300/80 shadow-[0_0_6px_rgba(252,211,77,0.9)]"
          />

          <div className="relative flex items-start justify-between gap-3">
            <Quote className="h-5 w-5 shrink-0 text-sky-300/80" />
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full border border-sky-300/25 bg-white/10 px-3 py-1 text-[11px] font-medium text-sky-100 backdrop-blur-md transition-colors hover:border-sky-300/50 hover:bg-white/20"
            >
              <Sparkles className="h-3 w-3 text-amber-300" />
              回到星空封面
            </Link>
          </div>
          <p className="relative mt-5 text-sm leading-relaxed text-sky-50/95 sm:text-base">
            “{siteConfig.motto}”
          </p>
        </div>
      </section>

      {/* 最新文章与随笔（顶部星海渐变色条 + 阅读时长估算） */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-sky-400 to-indigo-500" />
            <h2 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              最新文章与随笔
            </h2>
          </div>
          <Link
            href="/posts"
            className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-sky-600 dark:text-stone-400 dark:hover:text-sky-300"
          >
            查看全部 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sky-200/80 bg-white/50 p-8 text-center text-sm text-stone-500 backdrop-blur-sm dark:border-sky-400/20 dark:bg-slate-900/40">
            暂时还没有发布文章。
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {recentPosts.map((post, idx) => (
              <article
                key={post.slug}
                style={{ animationDelay: `${idx * 60}ms` }}
                className="animate-fade-up group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-sky-200/60 bg-white/75 p-5 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/70 hover:shadow-[0_12px_32px_rgba(56,189,248,0.14)] dark:border-sky-400/15 dark:bg-slate-900/60 dark:hover:border-sky-400/40"
              >
                {/* 顶部星海渐变色条 */}
                <span className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-sky-400/70 via-indigo-400/60 to-transparent opacity-65 transition-opacity duration-300 group-hover:opacity-100" />

                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-stone-400 dark:text-stone-500">
                    <time className="font-mono font-medium">{post.date}</time>
                    {post.readingMinutes && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50/90 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:bg-sky-950/70 dark:text-sky-300">
                        <Clock className="h-3 w-3" />
                        约 {post.readingMinutes} 分钟
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2.5 text-lg font-semibold text-stone-900 transition-colors group-hover:text-sky-700 dark:text-stone-100 dark:group-hover:text-sky-300">
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
                        className="inline-flex items-center gap-1 rounded-md border border-sky-200/60 bg-sky-50/60 px-2 py-0.5 text-xs text-slate-600 transition-colors hover:border-sky-400/60 hover:bg-sky-100/80 hover:text-sky-800 dark:border-sky-400/15 dark:bg-sky-950/40 dark:text-stone-300 dark:hover:border-sky-400/40 dark:hover:text-sky-200"
                      >
                        <Tag className="h-3 w-3 text-sky-500/80" />
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

      {/* 近期日记（发光星点时间轴 + 玻璃卡片） */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-amber-400 to-sky-400" />
            <h2 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              近期日记
            </h2>
          </div>
          <Link
            href="/diary"
            className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-sky-600 dark:text-stone-400 dark:hover:text-sky-300"
          >
            完整时间轴 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentDiaries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sky-200/80 bg-white/50 p-8 text-center text-sm text-stone-500 backdrop-blur-sm dark:border-sky-400/20 dark:bg-slate-900/40">
            暂时还没有日记记录。
          </p>
        ) : (
          <div className="relative ml-3 space-y-4">
            {/* 渐变时间轴竖线（中心锚定在 left-0） */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 left-0 top-3 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-400/80 via-indigo-400/45 to-amber-300/20"
            />

            {recentDiaries.map((diary, idx) => (
              <div
                key={diary.slug}
                style={{ animationDelay: `${idx * 70}ms` }}
                className="animate-fade-up group relative pl-7"
              >
                {/* 柔和发光星点（与竖线共享 left-0 -translate-x-1/2，精确落轴且不受卡片边框/悬停位移影响） */}
                <span className="pointer-events-none absolute left-0 top-5 z-10 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-sky-400/20 ring-4 ring-sky-400/10 transition-transform duration-300 group-hover:scale-125">
                  <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.95)]" />
                </span>

                <Link
                  href={`/diary/${diary.slug}`}
                  className="block rounded-2xl border border-sky-200/60 bg-white/75 p-4 backdrop-blur-xl shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-sky-400/75 group-hover:shadow-[0_10px_28px_rgba(56,189,248,0.14)] dark:border-sky-400/15 dark:bg-slate-900/60 dark:group-hover:border-sky-400/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400 dark:text-stone-500">
                    <div className="flex items-center gap-2">
                      <time className="font-mono font-medium text-stone-500 dark:text-stone-400">
                        {diary.date}
                      </time>
                      {diary.mood && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          <Sparkles className="h-3 w-3" />
                          {diary.mood}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-300">
                      阅读 <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  <h3 className="mt-1.5 font-semibold text-stone-900 transition-colors group-hover:text-sky-700 dark:text-stone-100 dark:group-hover:text-sky-300">
                    {diary.title}
                  </h3>
                  {diary.summary && (
                    <p className="mt-1 line-clamp-1 text-sm text-stone-600 dark:text-stone-400">
                      {diary.summary}
                    </p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

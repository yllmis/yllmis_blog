"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock,
  Github,
  Mail,
  Sparkles,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import type { ContentMeta } from "@/lib/content/types";
import { Avatar } from "./Avatar";
import { Greeting } from "./Greeting";
import { StarfieldBackground } from "./StarfieldBackground";

interface LandingCoverProps {
  avatarSrc: string | null;
  postCount: number;
  diaryCount: number;
  latestPost: ContentMeta | null;
  latestDiary: ContentMeta | null;
}

function TypewriterTagline({ phrases }: { phrases: readonly string[] }) {
  const safePhrases = phrases.length > 0 ? phrases : [siteConfig.tagline];
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(safePhrases[0]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || safePhrases.length <= 1) {
      setShown(safePhrases[0]);
      return;
    }

    const current = safePhrases[index % safePhrases.length];
    let delay = deleting ? 42 : 95;

    if (!deleting && shown === current) {
      delay = 2400;
    } else if (deleting && shown === "") {
      delay = 360;
    }

    const timer = window.setTimeout(() => {
      if (!deleting && shown === current) {
        setDeleting(true);
      } else if (deleting && shown === "") {
        setDeleting(false);
        setIndex((prev) => (prev + 1) % safePhrases.length);
      } else if (deleting) {
        setShown(current.slice(0, Math.max(0, shown.length - 1)));
      } else {
        setShown(current.slice(0, shown.length + 1));
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [shown, deleting, index, safePhrases]);

  return (
    <span className="inline-flex min-h-[1.6rem] items-center justify-center">
      <span>{shown}</span>
      <span
        aria-hidden="true"
        className="animate-cursor-blink ml-1 inline-block h-4 w-[2px] rounded-full bg-amber-300/90 shadow-[0_0_8px_rgba(252,211,77,0.8)]"
      />
    </span>
  );
}

function LiveClock() {
  const [time, setTime] = useState<{ hh: string; mm: string; ss: string } | null>(
    null,
  );

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime({
        hh: String(now.getHours()).padStart(2, "0"),
        mm: String(now.getMinutes()).padStart(2, "0"),
        ss: String(now.getSeconds()).padStart(2, "0"),
      });
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!time) {
    return <span className="font-mono text-xs text-stone-400">--:--</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs text-stone-200">
      <Clock className="h-3.5 w-3.5 text-sky-300/80" />
      <span>{time.hh}</span>
      <span className="animate-cursor-blink text-stone-400">:</span>
      <span>{time.mm}</span>
      <span className="hidden text-stone-400 sm:inline">:{time.ss}</span>
    </span>
  );
}

export function LandingCover({
  avatarSrc,
  postCount,
  diaryCount,
  latestPost,
  latestDiary,
}: LandingCoverProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    if (!siteConfig.links.email) return;
    try {
      await navigator.clipboard.writeText(siteConfig.links.email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      // Ignore clipboard failures in restricted contexts
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between gap-8 overflow-hidden px-4 py-6 text-stone-100 sm:px-8 sm:py-8">
      <StarfieldBackground />

      {/* 顶部轻透氛围 HUD 栏 */}
      <header className="animate-fade-up flex w-full max-w-5xl items-center justify-between gap-3">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-xs text-stone-300 backdrop-blur-md">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            <Greeting />，欢迎来到 {siteConfig.title}
          </span>
          <span className="hidden h-3 w-[1px] bg-white/15 sm:inline-block" />
          <div className="hidden sm:block">
            <LiveClock />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] text-stone-400 backdrop-blur-md md:inline-flex">
            <Sparkles className="h-3 w-3 text-amber-300/80" />
            轻点星空放流星
          </span>

          {siteConfig.links.github && (
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-stone-300 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/15 hover:text-white"
            >
              <Github className="h-4 w-4" />
            </a>
          )}

          {siteConfig.links.email && (
            <button
              type="button"
              onClick={() => void handleCopyEmail()}
              aria-label="复制邮箱"
              title={copiedEmail ? "已复制邮箱" : "点击复制邮箱"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-stone-300 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/15 hover:text-white"
            >
              {copiedEmail ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* 中央核心：旋转星轨 + 呼吸悬浮头像 + 打字机标语 */}
      <section className="flex flex-col items-center text-center">
        <Link
          href="/home"
          aria-label="点击头像进入个人主页"
          className="group relative flex flex-col items-center focus:outline-none"
        >
          <div className="relative flex h-52 w-52 items-center justify-center sm:h-60 sm:w-60">
            {/* 外层逆向旋转星轨 + 微光星点 */}
            <div className="animate-orbit-reverse pointer-events-none absolute inset-0 rounded-full border border-dashed border-sky-300/20">
              <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.95)]" />
              <span className="absolute bottom-6 left-4 h-1.5 w-1.5 rounded-full bg-indigo-300/80 shadow-[0_0_8px_rgba(165,180,252,0.9)]" />
            </div>

            {/* 内层顺向旋转星轨 + 琥珀微光星点 */}
            <div className="animate-orbit-slow pointer-events-none absolute inset-5 rounded-full border border-white/15 transition-colors duration-500 group-hover:border-amber-300/40">
              <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.95)]" />
            </div>

            {/* 呼吸悬浮头像 */}
            <div className="animate-avatar-breathe relative flex items-center justify-center">
              <span className="animate-ring-pulse pointer-events-none absolute -inset-3 rounded-full border border-sky-300/40" />
              <span className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-tr from-sky-400/35 via-indigo-400/35 to-amber-300/35 opacity-60 blur-lg transition-all duration-500 group-hover:-inset-4 group-hover:opacity-100" />
              <div className="relative rounded-full p-1 ring-2 ring-white/25 transition-all duration-500 ease-out group-hover:scale-110 group-hover:ring-amber-300/80 group-active:scale-95">
                <Avatar src={avatarSrc} size="xl" />
              </div>
            </div>
          </div>

          {/* 悬停/默认提示胶囊 */}
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-stone-100 backdrop-blur-md transition-all duration-300 group-hover:border-amber-300/60 group-hover:bg-amber-400/20 group-hover:text-amber-100">
            <span>点击头像进入个人主页</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </Link>

        {/* 昵称与动态打字机标语 */}
        <h1
          className="animate-fade-up mt-5 bg-gradient-to-r from-white via-sky-100 to-amber-100 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl"
          style={{ animationDelay: "120ms" }}
        >
          {siteConfig.author}
        </h1>
        <p
          className="animate-fade-up mt-2.5 max-w-lg text-sm leading-relaxed text-stone-300/90 sm:text-base"
          style={{ animationDelay: "220ms" }}
        >
          <TypewriterTagline phrases={siteConfig.taglines} />
        </p>
      </section>

      {/* 底部：最新文章 & 最近日记毛玻璃浮卡 + 快捷导航 */}
      <div
        className="animate-fade-up flex w-full max-w-3xl flex-col items-center gap-5"
        style={{ animationDelay: "300ms" }}
      >
        {(latestPost || latestDiary) && (
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            {latestPost ? (
              <Link
                href={`/posts/${latestPost.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300/40 hover:bg-white/[0.1]"
              >
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="inline-flex items-center gap-1.5 font-medium text-sky-300">
                    <BookOpen className="h-3.5 w-3.5" />
                    最新文章
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono">
                    {latestPost.date}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-200" />
                  </span>
                </div>
                <p className="mt-2 truncate text-sm font-medium text-stone-100 group-hover:text-white">
                  {latestPost.title}
                </p>
                {latestPost.summary && (
                  <p className="mt-1 line-clamp-1 text-xs text-stone-400">
                    {latestPost.summary}
                  </p>
                )}
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-left text-xs text-stone-500 backdrop-blur-sm">
                暂无文章
              </div>
            )}

            {latestDiary ? (
              <Link
                href={`/diary/${latestDiary.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/40 hover:bg-white/[0.1]"
              >
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="inline-flex items-center gap-1.5 font-medium text-amber-300">
                    <CalendarDays className="h-3.5 w-3.5" />
                    最近日记
                    {latestDiary.mood && (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-200">
                        {latestDiary.mood}
                      </span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono">
                    {latestDiary.date}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-200" />
                  </span>
                </div>
                <p className="mt-2 truncate text-sm font-medium text-stone-100 group-hover:text-white">
                  {latestDiary.title}
                </p>
                {latestDiary.summary && (
                  <p className="mt-1 line-clamp-1 text-xs text-stone-400">
                    {latestDiary.summary}
                  </p>
                )}
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-left text-xs text-stone-500 backdrop-blur-sm">
                暂无日记
              </div>
            )}
          </div>
        )}

        <nav
          aria-label="快捷入口"
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          <Link
            href="/home"
            className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-stone-100 backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/20"
          >
            个人主页
          </Link>
          <Link
            href="/posts"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-stone-300 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <BookOpen className="h-3.5 w-3.5" />
            文章 ({postCount})
          </Link>
          <Link
            href="/diary"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-stone-300 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            日记 ({diaryCount})
          </Link>
        </nav>
      </div>
    </div>
  );
}

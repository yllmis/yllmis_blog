"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Avatar } from "./Avatar";
import { Greeting } from "./Greeting";
import { StarfieldBackground } from "./StarfieldBackground";

interface LandingCoverProps {
  avatarSrc: string | null;
  postCount: number;
  diaryCount: number;
}

export function LandingCover({
  avatarSrc,
  postCount,
  diaryCount,
}: LandingCoverProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-4 py-10 text-stone-100">
      <StarfieldBackground />

      {/* 顶部时段问候徽章 */}
      <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-stone-300 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
        <Greeting />，欢迎来到 {siteConfig.title}
      </div>

      {/* 中央核心：呼吸悬浮头像 + 点击进入主页 */}
      <div className="flex flex-col items-center text-center">
        <Link
          href="/home"
          aria-label="点击头像进入个人主页"
          className="group relative flex flex-col items-center focus:outline-none"
        >
          {/* 呼吸悬浮容器 */}
          <div className="animate-avatar-breathe relative flex items-center justify-center">
            {/* 外圈扩散脉冲光环 */}
            <span className="animate-ring-pulse pointer-events-none absolute -inset-3 rounded-full border border-sky-300/40" />
            {/* 悬停泛光底座 */}
            <span className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-tr from-sky-400/35 via-indigo-400/35 to-amber-300/35 opacity-60 blur-lg transition-all duration-500 group-hover:-inset-4 group-hover:opacity-100" />
            {/* 头像主体 */}
            <div className="relative rounded-full p-1 ring-2 ring-white/25 transition-all duration-500 ease-out group-hover:scale-110 group-hover:ring-amber-300/80 group-active:scale-95">
              <Avatar src={avatarSrc} size="xl" />
            </div>
          </div>

          {/* 悬停/默认提示胶囊 */}
          <div className="mt-7 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-stone-100 backdrop-blur-md transition-all duration-300 group-hover:border-amber-300/60 group-hover:bg-amber-400/20 group-hover:text-amber-100">
            <span>点击头像进入个人主页</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </Link>

        {/* 昵称与标语 */}
        <h1
          className="animate-fade-up mt-6 bg-gradient-to-r from-white via-sky-100 to-amber-100 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl"
          style={{ animationDelay: "120ms" }}
        >
          {siteConfig.author}
        </h1>
        <p
          className="animate-fade-up mt-3 max-w-md text-sm leading-relaxed text-stone-300/90 sm:text-base"
          style={{ animationDelay: "220ms" }}
        >
          {siteConfig.tagline}
        </p>
      </div>

      {/* 底部轻量快捷入口 */}
      <nav
        aria-label="快捷入口"
        className="animate-fade-up flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        style={{ animationDelay: "320ms" }}
      >
        <Link
          href="/home"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-stone-300 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
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
  );
}

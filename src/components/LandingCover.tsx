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
import { WuwaIntroOverlay } from "./WuwaIntroOverlay";

interface LandingCoverProps {
  avatarSrc: string | null;
  postCount: number;
  diaryCount: number;
  totalReadingMinutes: number;
  topTags: string[];
  recentFeed: ContentMeta[];
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

/** 极细暖金声波分割线（克制的《鸣潮》频率意象） */
function SoundwaveDivider() {
  return (
    <div
      aria-hidden="true"
      className="mt-4 flex items-center justify-center gap-2 opacity-60"
    >
      <span className="h-[1px] w-14 bg-gradient-to-r from-transparent via-amber-200/50 to-amber-300/80 sm:w-20" />
      <svg
        viewBox="0 0 64 14"
        className="h-3 w-14 text-amber-200/85"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      >
        <path d="M2 7 H12 L16 4 L20 10 L25 2.5 L29 11.5 L32 1.5 L35 11.5 L39 2.5 L44 10 L48 4 L52 7 H62" />
      </svg>
      <span className="h-[1px] w-14 bg-gradient-to-l from-transparent via-amber-200/50 to-amber-300/80 sm:w-20" />
    </div>
  );
}

export function LandingCover({
  avatarSrc,
  postCount,
  diaryCount,
  totalReadingMinutes,
  topTags,
  recentFeed,
  latestPost,
  latestDiary,
}: LandingCoverProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [initialGateOpen, setInitialGateOpen] = useState(true);
  const [replayCount, setReplayCount] = useState(0);
  const [resonatorIdx, setResonatorIdx] = useState(0);
  const [pausedCycle, setPausedCycle] = useState(false);

  const resonators = siteConfig.resonators;
  const activeResonator = resonators[resonatorIdx % resonators.length];

  // 柔和自动轮换单侧溶图暗纹与伴读台词（悬停切换器时暂停）
  useEffect(() => {
    if (pausedCycle || resonators.length <= 1) return;
    const timer = window.setInterval(() => {
      setResonatorIdx((prev) => (prev + 1) % resonators.length);
    }, 9500);
    return () => window.clearInterval(timer);
  }, [pausedCycle, resonators.length]);

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
    <div className="relative flex min-h-screen flex-col items-center justify-between gap-6 overflow-hidden px-4 py-6 text-stone-100 sm:px-8 sm:py-8">
      {/* 首帧同步检测会话标记，已看过入场共鸣则直接放行，零黑屏闪烁 */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("yllmis_wuwa_intro_seen")==="1"){document.documentElement.dataset.wuwaSeen="1"}}catch(e){}`,
        }}
      />

      {initialGateOpen && (
        <WuwaIntroOverlay
          isInitialGate
          onComplete={() => setInitialGateOpen(false)}
        />
      )}

      {replayCount > 0 && (
        <WuwaIntroOverlay
          key={`replay-${replayCount}`}
          onComplete={() => setReplayCount(0)}
        />
      )}

      <StarfieldBackground />

      {/* 左侧 C：极简星盘大圆弧与竖向微声纹底座（纯几何线条托住左侧留白） */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 -z-10 hidden w-[38vw] overflow-hidden lg:block"
      >
        <div
          className="absolute inset-0 opacity-75 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at 18% 48%, ${activeResonator.glow} 0%, transparent 60%)`,
          }}
        />
        <svg
          viewBox="0 0 360 800"
          fill="none"
          className="h-full w-full opacity-75"
          preserveAspectRatio="xMinYMid slice"
        >
          {/* 外圈星盘细弧 */}
          <circle
            cx="-145"
            cy="400"
            r="360"
            stroke="rgba(186, 230, 253, 0.1)"
            strokeWidth="1"
          />
          {/* 内圈虚线星轨弧 */}
          <circle
            cx="-145"
            cy="400"
            r="292"
            stroke="rgba(252, 211, 77, 0.13)"
            strokeWidth="0.9"
            strokeDasharray="3 8"
          />
          {/* 弧上四角微光星锚点 */}
          <path
            d="M215 400 L218 397 L221 400 L218 403 Z"
            fill="rgba(252, 211, 77, 0.45)"
          />
          <path
            d="M126 248 L128.5 245.5 L131 248 L128.5 250.5 Z"
            fill="rgba(125, 211, 252, 0.45)"
          />
          {/* 左缘极细纵向声纹刻度 */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const y = 336 + i * 16;
            const len = i === 4 ? 18 : i % 2 === 0 ? 11 : 6;
            return (
              <line
                key={i}
                x1="16"
                y1={y}
                x2={16 + len}
                y2={y}
                stroke={
                  i === 4
                    ? "rgba(252, 211, 77, 0.38)"
                    : "rgba(186, 230, 253, 0.18)"
                }
                strokeWidth="1"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </div>

      {/* 左侧 A + B：一体化「精简博主微档案 + 近期星历」轻侧栏（仅宽屏悬浮，无厚重外框） */}
      <aside
        aria-label="博主微档案与近期星历"
        style={{ animationDelay: "280ms" }}
        className="animate-fade-up fixed left-7 top-[47%] z-10 hidden w-52 -translate-y-1/2 flex-col gap-5 text-left opacity-85 transition-opacity duration-300 hover:opacity-100 xl:flex 2xl:left-14"
      >
        {/* 简略 A：坐标、方向、沉淀与热门标签 */}
        <div className="relative border-l border-white/15 pl-3.5">
          <span className="absolute -left-[3px] top-1 h-1.5 w-1.5 rotate-45 bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.9)]" />
          <p className="font-mono text-[10px] tracking-[0.2em] text-sky-200/70">
            {siteConfig.location} · {siteConfig.school}
          </p>
          <p className="mt-1 text-xs font-medium text-stone-200/95">
            Golang · AI Agent · Web
          </p>
          <p className="mt-1 font-mono text-[11px] text-stone-400/85">
            {postCount} 篇文章 · {diaryCount} 篇日记 · {totalReadingMinutes}m
          </p>

          {topTags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {topTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/posts?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-stone-300/85 backdrop-blur-sm transition-colors hover:border-sky-300/45 hover:bg-sky-400/15 hover:text-white"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 简略 B：近期星历微时间轴 */}
        {recentFeed.length > 0 && (
          <div className="relative space-y-2 pl-3.5">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1 left-0 top-1 w-[1px] -translate-x-1/2 bg-white/15"
            />
            <p className="font-mono text-[10px] tracking-[0.2em] text-amber-200/70">
              RECENT // 近期星历
            </p>
            <div className="space-y-2">
              {recentFeed.map((item) => (
                <div
                  key={`${item.type}-${item.slug}`}
                  className="group relative"
                >
                  <span
                    className={`pointer-events-none absolute -left-3.5 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full transition-transform group-hover:scale-125 ${
                      item.type === "posts"
                        ? "bg-sky-300/85 shadow-[0_0_6px_rgba(125,211,252,0.8)]"
                        : "bg-amber-300/85 shadow-[0_0_6px_rgba(252,211,77,0.8)]"
                    }`}
                  />
                  <Link
                    href={`/${item.type}/${item.slug}`}
                    className="block transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-400/80">
                      <span>{item.date.slice(5)}</span>
                      <span className="text-stone-500">·</span>
                      <span>{item.type === "posts" ? "文" : "记"}</span>
                    </div>
                    <p className="truncate text-xs text-stone-300/85 transition-colors group-hover:text-white">
                      {item.title}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* 方式 B：单侧极淡边缘羽化溶图暗纹（若隐若现融入星空，不抢博客主体焦点） */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 right-0 -z-10 w-full overflow-hidden md:w-[56vw] lg:w-[50vw]"
      >
        {/* 随角色微调的极淡氛围背光 */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at 68% 44%, ${activeResonator.glow} 0%, transparent 64%)`,
          }}
        />
        {resonators.map((item, idx) => {
          const active = idx === resonatorIdx % resonators.length;
          return (
            <img
              key={item.id}
              src={item.src}
              alt=""
              style={{
                objectPosition: item.objectPosition,
                WebkitMaskImage:
                  "radial-gradient(ellipse 70% 60% at 64% 45%, rgba(0,0,0,1) 22%, rgba(0,0,0,0.68) 52%, rgba(0,0,0,0) 80%)",
                maskImage:
                  "radial-gradient(ellipse 70% 60% at 64% 45%, rgba(0,0,0,1) 22%, rgba(0,0,0,0.68) 52%, rgba(0,0,0,0) 80%)",
              }}
              className={`absolute inset-0 h-full w-full object-cover saturate-[0.88] transition-all duration-1000 ease-out ${
                active
                  ? "scale-100 opacity-[0.24] sm:opacity-[0.34]"
                  : "scale-[1.03] opacity-0"
              }`}
            />
          );
        })}
      </div>

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
          <button
            type="button"
            onClick={() => setReplayCount((c) => c + 1)}
            aria-label="重播共鸣入场动画"
            title="重播鸣潮共鸣动画"
            className="group inline-flex h-8 items-center gap-1.5 rounded-full border border-sky-300/20 bg-sky-400/[0.08] px-3 text-[11px] font-medium text-sky-100 backdrop-blur-md transition-all hover:border-amber-300/50 hover:bg-sky-400/[0.16] hover:text-white"
          >
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="h-3.5 w-3.5 text-amber-300 transition-transform duration-500 group-hover:rotate-90"
              fill="currentColor"
            >
              <path d="M8 0.5 L9.6 6.4 L15.5 8 L9.6 9.6 L8 15.5 L6.4 9.6 L0.5 8 L6.4 6.4 Z" />
            </svg>
            <span className="hidden sm:inline">重播共鸣</span>
          </button>

          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] text-stone-400 backdrop-blur-md lg:inline-flex">
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

      {/* 中央核心：旋转星轨 + 呼吸悬浮头像 + 打字机标语 + 克制声波台词签 */}
      <section className="flex flex-col items-center text-center">
        <Link
          href="/home"
          aria-label="点击头像进入个人主页"
          className="group relative flex flex-col items-center focus:outline-none"
        >
          <div className="relative flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
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
          className="animate-fade-up mt-4 bg-gradient-to-r from-white via-sky-100 to-amber-100 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl"
          style={{ animationDelay: "120ms" }}
        >
          {siteConfig.author}
        </h1>
        <p
          className="animate-fade-up mt-2 max-w-lg text-sm leading-relaxed text-stone-200/90 sm:text-base"
          style={{ animationDelay: "200ms" }}
        >
          <TypewriterTagline phrases={siteConfig.taglines} />
        </p>

        {/* 极细声波分割线 + 克制伴读台词与角色暗纹切换 */}
        <div
          className="animate-fade-up flex max-w-xl flex-col items-center"
          style={{ animationDelay: "260ms" }}
          onMouseEnter={() => setPausedCycle(true)}
          onMouseLeave={() => setPausedCycle(false)}
        >
          <SoundwaveDivider />

          <p
            key={activeResonator.id}
            className="animate-fade-up mt-2.5 px-2 text-xs italic leading-relaxed text-stone-300/80 sm:text-[13px]"
          >
            「{activeResonator.quote}」
          </p>

          <div
            role="tablist"
            aria-label="切换背景共鸣暗纹与台词"
            className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 backdrop-blur-sm"
          >
            {resonators.map((item, idx) => {
              const active = idx === resonatorIdx % resonators.length;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setResonatorIdx(idx)}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-all ${
                    active
                      ? "bg-white/10 font-medium text-amber-200/95"
                      : "text-stone-400/75 hover:text-stone-200"
                  }`}
                >
                  {active && (
                    <span className="h-1 w-1 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.9)]" />
                  )}
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 底部：最新文章 & 最近日记毛玻璃浮卡 + 快捷导航 */}
      <div
        className="animate-fade-up flex w-full max-w-3xl flex-col items-center gap-4"
        style={{ animationDelay: "320ms" }}
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

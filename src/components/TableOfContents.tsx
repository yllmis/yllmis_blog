"use client";

import { useEffect, useRef, useState } from "react";
import { ListTree } from "lucide-react";
import {
  computeCenteredScrollTop,
  resolveActiveHeadingId,
  type TocItem,
} from "@/lib/content/toc";

interface TableOfContentsProps {
  items: TocItem[];
  accent?: "sky" | "amber";
  variant?: "desktop" | "mobile";
}

/** 标题激活线（略大于正文 prose-headings:scroll-mt-24 的 96px，点击跳转后可准确命中） */
const ACTIVATION_OFFSET = 120;
/** 点击目录项后平滑滚动期间的短暂锁定，避免高亮在途经标题上抖动 */
const CLICK_LOCK_MS = 750;

export function TableOfContents({
  items,
  accent = "sky",
  variant = "desktop",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const clickLockUntilRef = useRef<number>(0);
  const hasAutoScrolledRef = useRef<boolean>(false);

  // 监听主页面滚动，准确计算当前阅读的小标题
  useEffect(() => {
    if (variant !== "desktop" || items.length < 2) return;

    hasAutoScrolledRef.current = false;

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    let rafId = 0;

    const syncActiveHeading = () => {
      rafId = 0;
      if (performance.now() < clickLockUntilRef.current) return;

      const docEl = document.documentElement;
      const atBottom =
        window.scrollY > 0 &&
        docEl.scrollHeight > window.innerHeight + 24 &&
        window.scrollY + window.innerHeight >= docEl.scrollHeight - 24;

      const nextId = resolveActiveHeadingId({
        headings: elements.map((el) => ({
          id: el.id,
          top: el.getBoundingClientRect().top,
        })),
        activationOffset: ACTIVATION_OFFSET,
        atBottom,
      });

      if (nextId) {
        setActiveId((prev) => (prev === nextId ? prev : nextId));
      }
    };

    const scheduleSync = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(syncActiveHeading);
    };

    const cancelClickLock = () => {
      clickLockUntilRef.current = 0;
    };

    syncActiveHeading();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync, { passive: true });
    window.addEventListener("wheel", cancelClickLock, { passive: true });
    window.addEventListener("touchstart", cancelClickLock, { passive: true });

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("wheel", cancelClickLock);
      window.removeEventListener("touchstart", cancelClickLock);
    };
  }, [items, variant]);

  // 目录列表内部跟随滚动：从头开始，越过中线后保持当前高亮项居中，末尾贴底
  useEffect(() => {
    if (variant !== "desktop" || !activeId) return;

    const container = scrollContainerRef.current;
    const activeEl = itemRefs.current.get(activeId);
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    const itemTopInScroll =
      itemRect.top - containerRect.top + container.scrollTop;

    const targetScrollTop = computeCenteredScrollTop({
      itemTopInScroll,
      itemHeight: itemRect.height,
      containerHeight: container.clientHeight,
      scrollHeight: container.scrollHeight,
    });

    if (Math.abs(container.scrollTop - targetScrollTop) < 1) {
      hasAutoScrolledRef.current = true;
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    container.scrollTo({
      top: targetScrollTop,
      behavior:
        !hasAutoScrolledRef.current || prefersReducedMotion ? "auto" : "smooth",
    });
    hasAutoScrolledRef.current = true;
  }, [activeId, items, variant]);

  if (items.length < 2) {
    return null;
  }

  const activeTextClass =
    accent === "amber"
      ? "border-amber-500 bg-amber-50/75 font-medium text-amber-700 dark:border-amber-400 dark:bg-amber-950/35 dark:text-amber-300"
      : "border-sky-500 bg-sky-50/75 font-medium text-sky-700 dark:border-sky-400 dark:bg-sky-950/40 dark:text-sky-300";

  if (variant === "mobile") {
    return (
      <nav aria-label="文章目录" className="text-xs">
        <details className="rounded-2xl border border-stone-200/80 bg-white/75 p-4 backdrop-blur-md dark:border-stone-800/80 dark:bg-slate-900/55">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-stone-700 dark:text-stone-200">
            <ListTree className="h-4 w-4 text-stone-400" />
            目录导航（{items.length}）
          </summary>
          <ul className="mt-3 space-y-1.5 border-l border-stone-200 pl-3 dark:border-stone-800">
            {items.map((item) => (
              <li key={item.id} className={item.depth === 3 ? "pl-3" : ""}>
                <a
                  href={`#${item.id}`}
                  className="block py-0.5 text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </nav>
    );
  }

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  );

  return (
    <nav aria-label="文章目录" className="sticky top-28 text-xs">
      <div className="flex max-h-[min(22rem,calc(100vh-11rem))] flex-col rounded-2xl border border-stone-200/70 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-stone-800/70 dark:bg-slate-900/55">
        <div className="mb-3 flex shrink-0 items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          <span className="flex items-center gap-1.5">
            <ListTree className="h-3.5 w-3.5" />
            目录
          </span>
          <span className="font-mono text-[10px] font-normal tabular-nums text-stone-400/85 dark:text-stone-500">
            {activeIndex + 1}/{items.length}
          </span>
        </div>
        <div
          ref={scrollContainerRef}
          className="thin-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1.5"
        >
          <ul className="space-y-1 border-l border-stone-200/90 dark:border-stone-800">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <a
                    ref={(el) => {
                      if (el) itemRefs.current.set(item.id, el);
                      else itemRefs.current.delete(item.id);
                    }}
                    href={`#${item.id}`}
                    title={item.text}
                    aria-current={isActive ? "location" : undefined}
                    onClick={() => {
                      clickLockUntilRef.current =
                        performance.now() + CLICK_LOCK_MS;
                      setActiveId(item.id);
                    }}
                    className={`-ml-px block truncate rounded-r-lg border-l-2 py-1 pr-2 transition-colors ${
                      item.depth === 3 ? "pl-5" : "pl-3"
                    } ${
                      isActive
                        ? activeTextClass
                        : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-900 dark:text-stone-400 dark:hover:border-stone-700 dark:hover:text-stone-100"
                    }`}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}

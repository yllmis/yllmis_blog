"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      setProgress(ratio * 100);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        update();
        rafId = 0;
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 top-16 z-40 h-[2.5px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-500 transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

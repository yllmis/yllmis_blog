"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Navbar } from "./Navbar";

const SECRET_TAP_COUNT = 5;
const SECRET_TAP_WINDOW_MS = 2000;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const tapCountRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLanding = pathname === "/";

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleSecretTap = () => {
    tapCountRef.current += 1;
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    if (tapCountRef.current >= SECRET_TAP_COUNT) {
      tapCountRef.current = 0;
      router.push("/admin");
      return;
    }

    resetTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, SECRET_TAP_WINDOW_MS);
  };

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
      <footer className="border-t border-stone-200/80 py-6 text-center text-xs text-stone-500 dark:border-stone-800/80 dark:text-stone-500">
        <span
          onClick={handleSecretTap}
          className="cursor-default select-none"
        >
          © {new Date().getFullYear()} {siteConfig.author} · {siteConfig.title}
        </span>
      </footer>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Navbar } from "./Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

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
        © {new Date().getFullYear()} {siteConfig.author} · {siteConfig.title}
      </footer>
    </div>
  );
}

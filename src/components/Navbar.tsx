"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

const navItems = [
  { href: "/home", label: "主页" },
  { href: "/posts", label: "文章" },
  { href: "/garden", label: "知识库" },
  { href: "/diary", label: "日记" },
];

export function Navbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-stone-50/75 backdrop-blur-xl dark:border-stone-800/70 dark:bg-stone-950/75">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          title="返回星空封面"
          className="group inline-flex items-center gap-1.5 text-lg font-semibold tracking-tight text-stone-900 transition-opacity hover:opacity-80 dark:text-stone-100"
        >
          <Sparkles className="h-4 w-4 text-amber-500 transition-transform duration-300 group-hover:rotate-12" />
          <span>{siteConfig.title}</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const active =
              item.href === "/home"
                ? pathname === "/home"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900"
                    : "text-stone-600 hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="切换深浅色主题"
            className="ml-1 rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}

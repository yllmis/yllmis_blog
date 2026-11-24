"use client";

import { useState } from "react";
import { Check, Github, Mail } from "lucide-react";
import { siteConfig } from "@/config/site";

export function SocialActions() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    if (!siteConfig.links.email) return;
    try {
      await navigator.clipboard.writeText(siteConfig.links.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {siteConfig.links.github && (
        <a
          href={siteConfig.links.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200/80 bg-white/80 px-3 py-2 text-xs font-medium text-stone-700 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-sky-400/80 hover:bg-sky-50/90 hover:text-sky-900 dark:border-sky-400/20 dark:bg-slate-900/70 dark:text-stone-200 dark:hover:border-sky-400/50 dark:hover:bg-sky-950/60 dark:hover:text-sky-200"
        >
          <Github className="h-3.5 w-3.5" />
          GitHub
        </a>
      )}

      {siteConfig.links.email && (
        <button
          type="button"
          onClick={() => void handleCopyEmail()}
          title={siteConfig.links.email}
          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200/80 bg-white/80 px-3 py-2 text-xs font-medium text-stone-700 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-sky-400/80 hover:bg-sky-50/90 hover:text-sky-900 dark:border-sky-400/20 dark:bg-slate-900/70 dark:text-stone-200 dark:hover:border-sky-400/50 dark:hover:bg-sky-950/60 dark:hover:text-sky-200"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">已复制邮箱</span>
            </>
          ) : (
            <>
              <Mail className="h-3.5 w-3.5" />
              <span>复制邮箱</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

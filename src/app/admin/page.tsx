"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Lock, LogOut, PenSquare, Plus, Trash2 } from "lucide-react";
import type { ContentMeta, ContentType } from "@/lib/content/types";

interface AuthStatus {
  authenticated: boolean;
  configured: boolean;
  storageMode: "local" | "github";
}

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<ContentType>("posts");
  const [items, setItems] = useState<ContentMeta[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAuth = useCallback(async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (res.ok) {
      setAuth((await res.json()) as AuthStatus);
    }
  }, []);

  const fetchList = useCallback(async (type: ContentType) => {
    setLoadingList(true);
    try {
      const res = await fetch(`/api/content?type=${type}`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { items: ContentMeta[] };
        setItems(data.items);
      }
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void fetchAuth();
  }, [fetchAuth]);

  useEffect(() => {
    if (auth?.authenticated) {
      void fetchList(tab);
    }
  }, [auth?.authenticated, tab, fetchList]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setLoginError(data.error || "登录失败");
        return;
      }
      setPassword("");
      await fetchAuth();
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await fetchAuth();
  };

  const handleDelete = async (item: ContentMeta) => {
    if (!window.confirm(`确定要删除「${item.title}」吗？对应的 .md 文件将被移除。`)) {
      return;
    }
    setMessage("");
    const query = item.sha ? `?sha=${encodeURIComponent(item.sha)}` : "";
    const res = await fetch(
      `/api/content/${item.type}/${encodeURIComponent(item.slug)}${query}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setMessage(data.error || "删除失败");
      return;
    }
    setMessage(`已删除「${item.title}」`);
    await fetchList(tab);
  };

  if (!auth) {
    return (
      <div className="py-16 text-center text-sm text-stone-500">正在检查登录状态...</div>
    );
  }

  if (!auth.authenticated) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900/70">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              管理员登录
            </h1>
            <p className="text-xs text-stone-500">登录后可在线新建、编辑和删除 Markdown 内容</p>
          </div>
        </div>

        {!auth.configured ? (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            尚未配置 <code className="font-mono font-semibold">ADMIN_PASSWORD</code> 环境变量。
            请在项目根目录创建 <code className="font-mono font-semibold">.env.local</code>{" "}
            （可参考 <code className="font-mono">.env.example</code>）并重启服务。
          </div>
        ) : (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
                管理员密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入 ADMIN_PASSWORD"
                autoFocus
                className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 focus:border-amber-500 focus:outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
              />
            </div>

            {loginError && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-xl bg-stone-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              {loggingIn ? "登录中..." : "登录"}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            写作与内容管理
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            当前存储模式：
            <span className="ml-1 rounded bg-stone-200 px-1.5 py-0.5 font-mono text-stone-700 dark:bg-stone-800 dark:text-stone-300">
              {auth.storageMode === "github" ? "GitHub 仓库模式" : "本地磁盘 .md 模式"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/editor?type=${tab}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            新建{tab === "posts" ? "文章" : "日记"}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <LogOut className="h-4 w-4" />
            退出
          </button>
        </div>
      </div>

      {/* 栏目切换 */}
      <div className="flex gap-2 border-b border-stone-200 pb-3 dark:border-stone-800">
        {(["posts", "diary"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              tab === key
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                : "text-stone-600 hover:bg-stone-200/70 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            {key === "posts" ? "文章与随笔" : "日记时间轴"}
          </button>
        ))}
      </div>

      {message && (
        <div className="rounded-xl border border-stone-200 bg-stone-100 px-4 py-2 text-sm text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
          {message}
        </div>
      )}

      {loadingList ? (
        <p className="py-10 text-center text-sm text-stone-500">加载中...</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500 dark:border-stone-700">
          该栏目下还没有内容，点击右上角「新建」开始写作。
        </div>
      ) : (
        <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900/70">
          {items.map((item) => (
            <div
              key={item.slug}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${item.type}/${item.slug}`}
                    className="truncate font-medium text-stone-900 hover:text-amber-700 dark:text-stone-100 dark:hover:text-amber-400"
                  >
                    {item.title}
                  </Link>
                  <span className="shrink-0 font-mono text-xs text-stone-400">
                    {item.date}
                  </span>
                </div>
                <p className="mt-0.5 truncate font-mono text-xs text-stone-400">
                  content/{item.type}/{item.slug}.md
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/editor?type=${item.type}&slug=${encodeURIComponent(item.slug)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                >
                  <PenSquare className="h-3.5 w-3.5" />
                  编辑
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDelete(item)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/70 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

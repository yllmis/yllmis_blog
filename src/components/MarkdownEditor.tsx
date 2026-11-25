"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ExternalLink, Save } from "lucide-react";
import type { ContentType } from "@/lib/content/types";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface EditorInitialData {
  type: ContentType;
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  mood?: string;
  body: string;
  sha?: string;
  isNew: boolean;
}

export function MarkdownEditor({ initial }: { initial: EditorInitialData }) {
  const router = useRouter();
  const [type, setType] = useState<ContentType>(initial.type);
  const [slug, setSlug] = useState(initial.slug);
  const [title, setTitle] = useState(initial.title);
  const [date, setDate] = useState(initial.date);
  const [summary, setSummary] = useState(initial.summary);
  const [tagsInput, setTagsInput] = useState(initial.tags.join(", "));
  const [mood, setMood] = useState(initial.mood ?? "");
  const [body, setBody] = useState(initial.body);
  const [sha, setSha] = useState<string | undefined>(initial.sha);
  const [isNew, setIsNew] = useState(initial.isNew);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null,
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const trimmedSlug = slug.trim();
    const trimmedTitle = title.trim();
    if (!trimmedSlug) {
      setStatus({ kind: "error", text: "请填写文件标识（slug），仅支持字母、数字、- 和 _" });
      return;
    }
    if (!trimmedTitle) {
      setStatus({ kind: "error", text: "请填写标题" });
      return;
    }

    const tags = tagsInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      const endpoint = isNew
        ? "/api/content"
        : `/api/content/${encodeURIComponent(type)}/${encodeURIComponent(trimmedSlug)}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          slug: trimmedSlug,
          title: trimmedTitle,
          date,
          summary,
          tags: type === "posts" ? tags : [],
          mood: type === "diary" ? mood : undefined,
          body,
          sha,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        item?: { sha?: string };
      };

      if (res.status === 401) {
        router.push("/admin");
        return;
      }

      if (!res.ok) {
        setStatus({ kind: "error", text: data.error || "保存失败" });
        return;
      }

      setSha(data.item?.sha);
      if (isNew) {
        setIsNew(false);
        router.replace(
          `/admin/editor?type=${encodeURIComponent(type)}&slug=${encodeURIComponent(trimmedSlug)}`,
        );
      }
      setStatus({ kind: "ok", text: "已保存并写入 Markdown 文件" });
    } catch {
      setStatus({ kind: "error", text: "网络请求失败，请稍后重试" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 顶部工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          返回后台列表
        </Link>

        <div className="flex items-center gap-2.5">
          {!isNew && (
            <Link
              href={`/${type}/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              查看页面 <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "保存中..." : "保存 Markdown"}
          </button>
        </div>
      </div>

      {status && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-sm ${
            status.kind === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          }`}
        >
          {status.text}
        </div>
      )}

      {/* 元信息表单 */}
      <div className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/70 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-500">
            内容栏目
          </label>
          <div className="relative">
            <select
              value={type}
              disabled={!isNew}
              onChange={(e) => setType(e.target.value as ContentType)}
              className="w-full appearance-none rounded-lg border border-stone-300 bg-stone-50 py-2 pl-3 pr-9 text-sm text-stone-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            >
              <option value="posts">文章与随笔（content/posts）</option>
              <option value="diary">日记时间轴（content/diary）</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-stone-500">
            文件标识（slug，对应 .md 文件名）
          </label>
          <input
            type="text"
            value={slug}
            disabled={!isNew}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="例如：my-first-post 或 2026-11-23-note"
            className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 font-mono text-sm text-stone-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-stone-500">
            标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入标题"
            className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-stone-500">
            日期
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>

        {type === "posts" ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-500">
              标签（多个用逗号分隔）
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Next.js, 随笔, Go"
              className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-500">
              心情（可选，显示在时间轴卡片上）
            </label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="例如：平静、开心、充实"
              className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-stone-500">
            摘要（显示在列表与时间轴卡片上）
          </label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="简短概括这篇内容"
            className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>
      </div>

      {/* 左右分栏 Markdown 编辑器 */}
      <div className="grid min-h-[520px] grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/70">
          <div className="border-b border-stone-200 px-4 py-2 text-xs font-medium text-stone-500 dark:border-stone-800">
            Markdown 源码
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="在这里写 Markdown 正文..."
            className="min-h-[480px] w-full flex-1 resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-stone-900 focus:outline-none dark:text-stone-100"
          />
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/70">
          <div className="border-b border-stone-200 px-4 py-2 text-xs font-medium text-stone-500 dark:border-stone-800">
            实时预览
          </div>
          <div className="min-h-[480px] flex-1 overflow-y-auto p-5">
            {body.trim() ? (
              <MarkdownRenderer content={body} />
            ) : (
              <p className="text-sm text-stone-400">右侧将实时渲染你的 Markdown 内容……</p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

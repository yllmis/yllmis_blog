import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  Tag,
} from "lucide-react";
import { extractToc, getContentStore, validateSlug } from "@/lib/content";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TableOfContents } from "@/components/TableOfContents";

export const dynamic = "force-dynamic";

interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;

  let validSlug: string;
  try {
    validSlug = validateSlug(slug);
  } catch {
    notFound();
  }

  const store = getContentStore();
  const [post, allPosts] = await Promise.all([
    store.get("posts", validSlug),
    store.list("posts"),
  ]);
  if (!post) {
    notFound();
  }

  const toc = extractToc(post.body);
  const hasToc = toc.length >= 2;

  const currentIdx = allPosts.findIndex((item) => item.slug === post.slug);
  const newerPost = currentIdx > 0 ? allPosts[currentIdx - 1] : null;
  const olderPost =
    currentIdx >= 0 && currentIdx < allPosts.length - 1
      ? allPosts[currentIdx + 1]
      : null;

  return (
    <>
      <ReadingProgress />

      {/* 与主页呼应的柔和星海顶部氛围光 */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 overflow-hidden"
      >
        <div
          className="mx-auto h-full max-w-4xl opacity-60 blur-3xl dark:opacity-35"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.08) 55%, transparent 80%)",
          }}
        />
      </div>

      <article className="space-y-8">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/75 px-3.5 py-1.5 text-xs font-medium text-stone-600 backdrop-blur-md transition-all hover:border-sky-300/80 hover:text-sky-700 dark:border-stone-800 dark:bg-slate-900/60 dark:text-stone-300 dark:hover:border-sky-400/40 dark:hover:text-sky-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回文章列表
        </Link>

        {/* 标题与元信息卡片 */}
        <header className="relative overflow-hidden rounded-3xl border border-sky-200/60 bg-white/80 p-6 shadow-[0_8px_30px_rgba(14,165,233,0.05)] backdrop-blur-xl dark:border-sky-400/15 dark:bg-slate-900/60 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-sky-400/75 via-indigo-400/60 to-transparent" />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500 dark:text-stone-400">
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Calendar className="h-3.5 w-3.5 text-sky-500" />
              {post.date}
            </span>
            {post.wordCount !== undefined && (
              <span className="inline-flex items-center gap-1 font-mono">
                <FileText className="h-3.5 w-3.5 text-stone-400" />
                约 {post.wordCount} 字
              </span>
            )}
            {post.readingMinutes && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 font-medium text-sky-700 dark:bg-sky-950/70 dark:text-sky-300">
                <Clock className="h-3 w-3" />
                约 {post.readingMinutes} 分钟阅读
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl sm:leading-tight">
            {post.title}
          </h1>

          {post.summary && (
            <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400 sm:text-base">
              {post.summary}
            </p>
          )}

          {post.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/posts?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-sky-200/70 bg-sky-50/70 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-sky-400/70 hover:bg-sky-100/80 hover:text-sky-800 dark:border-sky-400/20 dark:bg-sky-950/40 dark:text-sky-200 dark:hover:border-sky-400/45"
                >
                  <Tag className="h-3 w-3 text-sky-500" />
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* 正文居中阅读区 + 宽屏右侧悬浮跟随滚动目录 */}
        <div className="relative">
          {hasToc && (
            <div className="mb-6 xl:hidden">
              <TableOfContents items={toc} accent="sky" variant="mobile" />
            </div>
          )}

          <div className="rounded-3xl border border-stone-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-stone-800/80 dark:bg-slate-900/55 sm:p-10">
            <MarkdownRenderer content={post.body} />
          </div>

          {hasToc && (
            <aside className="absolute bottom-0 left-full top-0 ml-5 hidden w-44 xl:block 2xl:ml-8 2xl:w-52">
              <TableOfContents items={toc} accent="sky" variant="desktop" />
            </aside>
          )}
        </div>

        {/* 上一篇 / 下一篇导航 */}
        {(newerPost || olderPost) && (
          <nav
            aria-label="相邻文章导航"
            className="grid gap-3 pt-2 sm:grid-cols-2"
          >
            {newerPost ? (
              <Link
                href={`/posts/${newerPost.slug}`}
                className="group rounded-2xl border border-stone-200/80 bg-white/75 p-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-sky-300/80 hover:shadow-sm dark:border-stone-800 dark:bg-slate-900/55 dark:hover:border-sky-400/40"
              >
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 group-hover:text-sky-600 dark:group-hover:text-sky-300">
                  <ArrowLeft className="h-3 w-3" />
                  上一篇（较新）
                </span>
                <p className="mt-1.5 truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {newerPost.title}
                </p>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}

            {olderPost && (
              <Link
                href={`/posts/${olderPost.slug}`}
                className="group rounded-2xl border border-stone-200/80 bg-white/75 p-4 text-right backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-sky-300/80 hover:shadow-sm dark:border-stone-800 dark:bg-slate-900/55 dark:hover:border-sky-400/40"
              >
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 group-hover:text-sky-600 dark:group-hover:text-sky-300">
                  下一篇（较早）
                  <ArrowRight className="h-3 w-3" />
                </span>
                <p className="mt-1.5 truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {olderPost.title}
                </p>
              </Link>
            )}
          </nav>
        )}
      </article>
    </>
  );
}

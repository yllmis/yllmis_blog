import Link from "next/link";
import { Tag } from "lucide-react";
import { getContentStore } from "@/lib/content";

export const dynamic = "force-dynamic";

interface PostsPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { tag: activeTag } = await searchParams;
  const allPosts = await getContentStore().list("posts");

  const tagCounts = new Map<string, number>();
  for (const post of allPosts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const sortedTags = Array.from(tagCounts.entries()).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );

  const filteredPosts = activeTag
    ? allPosts.filter((post) => post.tags.includes(activeTag))
    : allPosts;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          文章与随笔
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          技术笔记、架构思考与日常随笔，共 {allPosts.length} 篇
        </p>
      </div>

      {/* Tag 筛选栏 */}
      {sortedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/posts"
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !activeTag
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
            }`}
          >
            全部 ({allPosts.length})
          </Link>
          {sortedTags.map(([tag, count]) => {
            const isActive = activeTag === tag;
            return (
              <Link
                key={tag}
                href={`/posts?tag=${encodeURIComponent(tag)}`}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-amber-600 text-white"
                    : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
                }`}
              >
                <Tag className="h-3 w-3" />
                {tag} ({count})
              </Link>
            );
          })}
        </div>
      )}

      {/* 文章列表 */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-12 text-center text-sm text-stone-500 dark:border-stone-700">
          {activeTag ? `标签「${activeTag}」下暂无文章` : "暂无文章"}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-2xl border border-stone-200/90 bg-white p-6 transition-all hover:border-stone-300 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900/60 dark:hover:border-stone-700"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="text-xl font-semibold text-stone-900 transition-colors group-hover:text-amber-700 dark:text-stone-100 dark:group-hover:text-amber-400">
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                </h2>
                <time className="shrink-0 text-xs font-medium text-stone-400 dark:text-stone-500">
                  {post.date}
                </time>
              </div>

              {post.summary && (
                <p className="mt-2.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {post.summary}
                </p>
              )}

              {post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/posts?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2.5 py-0.5 text-xs text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { getContentStore, validateSlug } from "@/lib/content";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ReadingProgress } from "@/components/ReadingProgress";

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

  const post = await getContentStore().get("posts", validSlug);
  if (!post) {
    notFound();
  }

  return (
    <>
      <ReadingProgress />
      <article className="space-y-8">
      <Link
        href="/posts"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
      >
        <ArrowLeft className="h-4 w-4" />
        返回文章列表
      </Link>

      <header className="space-y-4 border-b border-stone-200 pb-6 dark:border-stone-800">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500 dark:text-stone-400">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {post.date}
          </span>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/posts?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2.5 py-0.5 text-xs text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <MarkdownRenderer content={post.body} />
      </article>
    </>
  );
}

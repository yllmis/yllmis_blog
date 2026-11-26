import { resolveAvatarSrc } from "@/lib/avatar";
import { getContentStore } from "@/lib/content";
import { getGardenCatalog } from "@/lib/garden";
import { LandingCover } from "@/components/LandingCover";

export const dynamic = "force-dynamic";

export default async function CoverPage() {
  const store = getContentStore();
  const [posts, diaries, gardenCatalog] = await Promise.all([
    store.list("posts"),
    store.list("diary"),
    getGardenCatalog(),
  ]);
  const avatarSrc = resolveAvatarSrc();
  const gardenCount = gardenCatalog.repos.reduce((sum, r) => sum + r.docCount, 0);

  // 提取前 3 个高频文章标签（供左侧微档案直达）
  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([tag]) => tag);

  // 合并最近 3 条动态（文章 + 日记按日期倒序），供左侧近期星历展示
  const recentFeed = [...posts, ...diaries]
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug))
    .slice(0, 3);

  const totalReadingMinutes = [...posts, ...diaries].reduce(
    (sum, item) => sum + (item.readingMinutes ?? 1),
    0,
  );

  return (
    <LandingCover
      avatarSrc={avatarSrc}
      postCount={posts.length}
      diaryCount={diaries.length}
      gardenCount={gardenCount}
      totalReadingMinutes={totalReadingMinutes}
      topTags={topTags}
      recentFeed={recentFeed}
      latestPost={posts[0] ?? null}
      latestDiary={diaries[0] ?? null}
    />
  );
}

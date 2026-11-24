import { resolveAvatarSrc } from "@/lib/avatar";
import { getContentStore } from "@/lib/content";
import { LandingCover } from "@/components/LandingCover";

export const dynamic = "force-dynamic";

export default async function CoverPage() {
  const store = getContentStore();
  const [posts, diaries] = await Promise.all([
    store.list("posts"),
    store.list("diary"),
  ]);
  const avatarSrc = resolveAvatarSrc();

  return (
    <LandingCover
      avatarSrc={avatarSrc}
      postCount={posts.length}
      diaryCount={diaries.length}
    />
  );
}

import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getContentStore, validateContentType, validateSlug } from "@/lib/content";
import { MarkdownEditor } from "@/components/MarkdownEditor";

export const dynamic = "force-dynamic";

interface EditorPageProps {
  searchParams: Promise<{ type?: string; slug?: string }>;
}

export default async function AdminEditorPage({ searchParams }: EditorPageProps) {
  if (!(await isAuthenticated())) {
    redirect("/admin");
  }

  const params = await searchParams;
  const type = params.type === "diary" ? "diary" : "posts";
  const today = new Date().toISOString().slice(0, 10);

  if (params.slug) {
    try {
      const validType = validateContentType(type);
      const validSlug = validateSlug(params.slug);
      const existing = await getContentStore().get(validType, validSlug);
      if (existing) {
        return (
          <MarkdownEditor
            initial={{
              type: existing.type,
              slug: existing.slug,
              title: existing.title,
              date: existing.date,
              summary: existing.summary,
              tags: existing.tags,
              mood: existing.mood,
              body: existing.body,
              sha: existing.sha,
              isNew: false,
            }}
          />
        );
      }
    } catch {
      // Fall through to new editor if slug is invalid
    }
  }

  return (
    <MarkdownEditor
      initial={{
        type,
        slug: type === "diary" ? `${today}-note` : "",
        title: "",
        date: today,
        summary: "",
        tags: [],
        mood: "",
        body: "",
        isNew: true,
      }}
    />
  );
}

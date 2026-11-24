import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getContentStore,
  StoreConflictError,
  validateContentType,
  validateSlug,
} from "@/lib/content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawType = searchParams.get("type") ?? "posts";

  try {
    const type = validateContentType(rawType);
    const items = await getContentStore().list(type);
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "读取列表失败" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未登录或会话已过期" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "请求体格式无效" }, { status: 400 });
  }

  try {
    const type = validateContentType(String(body.type ?? ""));
    const slug = validateSlug(String(body.slug ?? ""));
    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }

    const date =
      typeof body.date === "string" && body.date.trim()
        ? body.date.trim()
        : new Date().toISOString().slice(0, 10);
    const summary = typeof body.summary === "string" ? body.summary : "";
    const tags = Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim()).filter(Boolean)
      : [];
    const mood = typeof body.mood === "string" ? body.mood.trim() : undefined;
    const contentBody = typeof body.body === "string" ? body.body : "";
    const sha = typeof body.sha === "string" ? body.sha : undefined;

    const item = await getContentStore().save({
      type,
      slug,
      title,
      date,
      summary,
      tags,
      mood,
      body: contentBody,
      sha,
    });

    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath(`/${type}`);
    revalidatePath(`/${type}/${slug}`);

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    if (err instanceof StoreConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "保存失败" },
      { status: 400 },
    );
  }
}

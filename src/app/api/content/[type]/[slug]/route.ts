import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getContentStore,
  StoreConflictError,
  validateContentType,
  validateSlug,
} from "@/lib/content";

interface RouteContext {
  params: Promise<{ type: string; slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  try {
    const type = validateContentType(params.type);
    const slug = validateSlug(params.slug);
    const item = await getContentStore().get(type, slug);
    if (!item) {
      return NextResponse.json({ error: "内容不存在" }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "参数无效" },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未登录或会话已过期" }, { status: 401 });
  }

  const params = await context.params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "请求体格式无效" }, { status: 400 });
  }

  try {
    const type = validateContentType(params.type);
    const slug = validateSlug(params.slug);
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

    return NextResponse.json({ item });
  } catch (err) {
    if (err instanceof StoreConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "更新失败" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未登录或会话已过期" }, { status: 401 });
  }

  const params = await context.params;
  const { searchParams } = new URL(request.url);
  const sha = searchParams.get("sha") || undefined;

  try {
    const type = validateContentType(params.type);
    const slug = validateSlug(params.slug);
    await getContentStore().delete(type, slug, sha);

    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath(`/${type}`);
    revalidatePath(`/${type}/${slug}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof StoreConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "删除失败" },
      { status: 400 },
    );
  }
}

import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "服务端未配置 ADMIN_PASSWORD，暂无法登录" },
      { status: 503 },
    );
  }

  let body: { password?: unknown };
  try {
    body = (await request.json()) as { password?: unknown };
  } catch {
    return NextResponse.json({ error: "请求体格式无效" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const token = createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());
  return response;
}

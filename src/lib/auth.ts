import crypto from "crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "yllmis_blog_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sha256Buffer(value: string): Buffer {
  return crypto.createHash("sha256").update(value, "utf8").digest();
}

function getSigningSecret(): string | null {
  const secret = process.env.AUTH_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim();
  return secret ? secret : null;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function verifyAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected || !input) return false;
  return crypto.timingSafeEqual(sha256Buffer(input), sha256Buffer(expected));
}

export function createSessionToken(now = Date.now()): string {
  const secret = getSigningSecret();
  if (!secret) {
    throw new Error("未配置 ADMIN_PASSWORD，无法签发管理员会话");
  }
  const payload = Buffer.from(
    JSON.stringify({ iat: now, exp: now + SESSION_TTL_MS }),
    "utf8",
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const secret = getSigningSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  if (!crypto.timingSafeEqual(sha256Buffer(sig), sha256Buffer(expectedSig))) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { exp?: number };
    return typeof decoded.exp === "number" && decoded.exp > now;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

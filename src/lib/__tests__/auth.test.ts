import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createSessionToken,
  verifyAdminPassword,
  verifySessionToken,
} from "../auth";

describe("auth", () => {
  const originalPassword = process.env.ADMIN_PASSWORD;
  const originalSecret = process.env.AUTH_SECRET;

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "super-secret-password";
    process.env.AUTH_SECRET = "signing-secret-xyz";
  });

  afterEach(() => {
    process.env.ADMIN_PASSWORD = originalPassword;
    process.env.AUTH_SECRET = originalSecret;
  });

  it("verifies valid password and rejects wrong or unconfigured password", () => {
    expect(verifyAdminPassword("super-secret-password")).toBe(true);
    expect(verifyAdminPassword("wrong")).toBe(false);

    delete process.env.ADMIN_PASSWORD;
    expect(verifyAdminPassword("super-secret-password")).toBe(false);
  });

  it("signs and verifies session token, rejecting tampered or expired tokens", () => {
    const now = 1_700_000_000_000;
    const token = createSessionToken(now);
    expect(verifySessionToken(token, now + 1000)).toBe(true);
    expect(verifySessionToken(`${token}tamper`, now + 1000)).toBe(false);
    expect(verifySessionToken(token, now + 8 * 24 * 60 * 60 * 1000)).toBe(false);
  });
});

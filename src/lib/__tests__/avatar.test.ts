import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { resolveAvatarSrc } from "../avatar";

describe("resolveAvatarSrc", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "avatar-test-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("returns null when no avatar file exists", () => {
    expect(resolveAvatarSrc(tmpDir)).toBeNull();
  });

  it("detects avatar.png or avatar.jpg when present", async () => {
    await fs.writeFile(path.join(tmpDir, "avatar.jpg"), "fake-jpg");
    expect(resolveAvatarSrc(tmpDir)).toBe("/avatar.jpg");

    await fs.writeFile(path.join(tmpDir, "avatar.png"), "fake-png");
    expect(resolveAvatarSrc(tmpDir)).toBe("/avatar.png");
  });
});

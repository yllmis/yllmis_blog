import fs from "fs";
import path from "path";

const AVATAR_CANDIDATES = [
  "avatar.png",
  "avatar.jpg",
  "avatar.jpeg",
  "avatar.webp",
];

/**
 * 检查 public/ 目录下是否存在自定义头像文件。
 * 找到时返回可直接用于 <img> 的路径（如 /avatar.png），未放文件时返回 null（避免浏览器 404）。
 */
export function resolveAvatarSrc(
  publicDir: string = path.join(process.cwd(), "public"),
): string | null {
  for (const filename of AVATAR_CANDIDATES) {
    if (fs.existsSync(path.join(publicDir, filename))) {
      return `/${filename}`;
    }
  }
  return null;
}

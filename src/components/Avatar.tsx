"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";

interface AvatarProps {
  src: string | null;
  size?: "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  md: "h-14 w-14 text-xl",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 sm:h-32 sm:w-32 text-4xl",
};

export function Avatar({ src, size = "lg", className = "" }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = siteConfig.author.slice(0, 1).toUpperCase();

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={siteConfig.author}
        onError={() => setFailed(true)}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={siteConfig.author}
      className={`flex select-none items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-sky-500 to-amber-400 font-bold tracking-tight text-white shadow-inner ${sizeClasses[size]} ${className}`}
    >
      {initial}
    </div>
  );
}

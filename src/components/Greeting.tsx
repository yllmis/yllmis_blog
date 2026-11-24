"use client";

import { useEffect, useState } from "react";

function getGreetingByHour(hour: number): string {
  if (hour >= 5 && hour < 9) return "早安";
  if (hour >= 9 && hour < 12) return "上午好";
  if (hour >= 12 && hour < 14) return "午安";
  if (hour >= 14 && hour < 18) return "下午好";
  if (hour >= 18 && hour < 23) return "晚上好";
  return "夜深了";
}

export function Greeting({ fallback = "你好" }: { fallback?: string }) {
  const [text, setText] = useState(fallback);

  useEffect(() => {
    setText(getGreetingByHour(new Date().getHours()));
  }, []);

  return <span>{text}</span>;
}

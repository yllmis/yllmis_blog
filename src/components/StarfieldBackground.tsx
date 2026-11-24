"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  depth: number;
  baseAlpha: number;
  phase: number;
  twinkleSpeed: number;
  hue: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
}

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, active: false };
    let stars: Star[] = [];
    let shootingStar: ShootingStar | null = null;
    let nextShootAt = performance.now() + 2600;
    let rafId = 0;

    const initStars = () => {
      const count = Math.min(140, Math.max(65, Math.floor((width * height) / 11000)));
      stars = Array.from({ length: count }, () => {
        const depth = 0.3 + Math.random() * 0.9;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: (0.6 + Math.random() * 1.6) * depth,
          vx: (Math.random() - 0.5) * 0.18 * depth,
          vy: (Math.random() - 0.5) * 0.18 * depth - 0.04 * depth,
          depth,
          baseAlpha: 0.25 + Math.random() * 0.65,
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.008 + Math.random() * 0.02,
          hue: Math.random() > 0.78 ? 42 : Math.random() > 0.45 ? 210 : 250,
        };
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      // 柔和的鼠标跟随插值
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      const offsetX = (mouse.x - width / 2) / Math.max(width, 1);
      const offsetY = (mouse.y - height / 2) / Math.max(height, 1);

      const rendered: { x: number; y: number; r: number }[] = [];

      for (const s of stars) {
        if (!reducedMotion) {
          s.x += s.vx;
          s.y += s.vy;
          s.phase += s.twinkleSpeed;

          if (s.x < -10) s.x = width + 10;
          if (s.x > width + 10) s.x = -10;
          if (s.y < -10) s.y = height + 10;
          if (s.y > height + 10) s.y = -10;
        }

        const px = s.x - offsetX * 26 * s.depth;
        const py = s.y - offsetY * 26 * s.depth;
        const alpha = Math.max(
          0.12,
          Math.min(1, s.baseAlpha + Math.sin(s.phase) * 0.25),
        );

        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 80%, 88%, ${alpha})`;
        ctx.fill();

        if (s.depth > 0.75) {
          rendered.push({ x: px, y: py, r: s.r });
        }
      }

      // 鼠标附近的微弱星图连线（克制、仅局部点亮）
      if (mouse.active && !reducedMotion) {
        const radius = 150;
        for (let i = 0; i < rendered.length; i++) {
          const a = rendered[i];
          const distMouse = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (distMouse > radius) continue;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(148, 197, 255, ${(1 - distMouse / radius) * 0.22})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();

          for (let j = i + 1; j < rendered.length; j++) {
            const b = rendered[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < 110) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(165, 180, 252, ${(1 - dist / 110) * 0.16})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      }

      // 偶发柔和流星
      if (!reducedMotion) {
        if (!shootingStar && now >= nextShootAt) {
          shootingStar = {
            x: width * (0.15 + Math.random() * 0.7),
            y: height * (0.05 + Math.random() * 0.3),
            vx: 6 + Math.random() * 4,
            vy: 3 + Math.random() * 2.5,
            length: 70 + Math.random() * 60,
            alpha: 0.9,
          };
          nextShootAt = now + 4500 + Math.random() * 5500;
        }

        if (shootingStar) {
          const s = shootingStar;
          const tailX = s.x - (s.vx / 10) * s.length;
          const tailY = s.y - (s.vy / 10) * s.length;
          const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
          grad.addColorStop(0, `rgba(255, 250, 235, ${s.alpha})`);
          grad.addColorStop(1, "rgba(255, 250, 235, 0)");

          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          s.x += s.vx;
          s.y += s.vy;
          s.alpha -= 0.018;
          if (s.alpha <= 0 || s.x > width + 100 || s.y > height + 100) {
            shootingStar = null;
          }
        }
      }

      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    rafId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050816]">
      {/* 柔和深空星云渐变 */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 22% 24%, rgba(56, 189, 248, 0.14), transparent 42%), radial-gradient(circle at 78% 74%, rgba(129, 140, 248, 0.16), transparent 45%), radial-gradient(circle at 50% 45%, rgba(251, 191, 36, 0.06), transparent 50%)",
        }}
      />
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

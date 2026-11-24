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

interface Ripple {
  x: number;
  y: number;
  r: number;
  maxR: number;
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

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false,
    };
    let stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];
    const ripples: Ripple[] = [];
    let nextShootAt = performance.now() + 2400;
    let rafId = 0;

    const spawnMeteor = (originX?: number, originY?: number) => {
      if (shootingStars.length >= 4) return;
      const startX =
        originX !== undefined
          ? originX
          : width * (0.12 + Math.random() * 0.7);
      const startY =
        originY !== undefined
          ? originY
          : height * (0.04 + Math.random() * 0.28);
      const dir = startX > width * 0.65 ? -1 : 1;
      shootingStars.push({
        x: startX,
        y: startY,
        vx: (6.5 + Math.random() * 4) * dir,
        vy: 3.2 + Math.random() * 2.5,
        length: 80 + Math.random() * 65,
        alpha: 0.95,
      });
    };

    const initStars = () => {
      const count = Math.min(165, Math.max(75, Math.floor((width * height) / 9500)));
      stars = Array.from({ length: count }, () => {
        const depth = 0.3 + Math.random() * 0.95;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: (0.6 + Math.random() * 1.65) * depth,
          vx: (Math.random() - 0.5) * 0.18 * depth,
          vy: (Math.random() - 0.5) * 0.18 * depth - 0.04 * depth,
          depth,
          baseAlpha: 0.28 + Math.random() * 0.65,
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.008 + Math.random() * 0.022,
          hue: Math.random() > 0.78 ? 42 : Math.random() > 0.45 ? 205 : 252,
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

    const onClick = (e: MouseEvent) => {
      if (reducedMotion) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("a, button")) return;

      ripples.push({
        x: e.clientX,
        y: e.clientY,
        r: 4,
        maxR: 96,
        alpha: 0.65,
      });
      spawnMeteor(e.clientX, e.clientY);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click", onClick);

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;
      const offsetX = (mouse.x - width / 2) / Math.max(width, 1);
      const offsetY = (mouse.y - height / 2) / Math.max(height, 1);

      // 柔和的鼠标星光聚光灯
      if (mouse.active && !reducedMotion) {
        const spot = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          240,
        );
        spot.addColorStop(0, "rgba(125, 211, 252, 0.11)");
        spot.addColorStop(0.5, "rgba(129, 140, 248, 0.045)");
        spot.addColorStop(1, "rgba(5, 8, 22, 0)");
        ctx.fillStyle = spot;
        ctx.fillRect(mouse.x - 240, mouse.y - 240, 480, 480);
      }

      const rendered: { x: number; y: number }[] = [];

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

        const px = s.x - offsetX * 28 * s.depth;
        const py = s.y - offsetY * 28 * s.depth;
        const alpha = Math.max(
          0.12,
          Math.min(1, s.baseAlpha + Math.sin(s.phase) * 0.25),
        );

        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 82%, 88%, ${alpha})`;
        ctx.fill();

        if (s.depth > 0.74) {
          rendered.push({ x: px, y: py });
        }
      }

      // 鼠标附近的微光星图连线
      if (mouse.active && !reducedMotion) {
        const radius = 160;
        for (let i = 0; i < rendered.length; i++) {
          const a = rendered[i];
          const distMouse = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (distMouse > radius) continue;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(148, 197, 255, ${(1 - distMouse / radius) * 0.24})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();

          for (let j = i + 1; j < rendered.length; j++) {
            const b = rendered[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < 115) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(165, 180, 252, ${(1 - dist / 115) * 0.16})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      }

      // 点击星空绽放的微光涟漪
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(186, 230, 253, ${rp.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        rp.r += (rp.maxR - rp.r) * 0.08 + 0.9;
        rp.alpha -= 0.018;
        if (rp.alpha <= 0) {
          ripples.splice(i, 1);
        }
      }

      // 自动 + 手动触发的柔和流星
      if (!reducedMotion) {
        if (now >= nextShootAt) {
          spawnMeteor();
          nextShootAt = now + 4500 + Math.random() * 5000;
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const s = shootingStars[i];
          const speed = Math.hypot(s.vx, s.vy) || 1;
          const tailX = s.x - (s.vx / speed) * s.length;
          const tailY = s.y - (s.vy / speed) * s.length;
          const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
          grad.addColorStop(0, `rgba(255, 250, 235, ${s.alpha})`);
          grad.addColorStop(0.4, `rgba(186, 230, 253, ${s.alpha * 0.55})`);
          grad.addColorStop(1, "rgba(255, 250, 235, 0)");

          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.stroke();

          s.x += s.vx;
          s.y += s.vy;
          s.alpha -= 0.017;
          if (
            s.alpha <= 0 ||
            s.x < -120 ||
            s.x > width + 120 ||
            s.y > height + 120
          ) {
            shootingStars.splice(i, 1);
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
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050816]">
      {/* 深空呼吸极光星云层 */}
      <div
        className="animate-aurora absolute -left-[15%] -top-[15%] h-[65vh] w-[65vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(99, 102, 241, 0.1) 45%, transparent 72%)",
        }}
      />
      <div
        className="animate-aurora absolute -bottom-[20%] -right-[10%] h-[70vh] w-[65vw] rounded-full blur-3xl"
        style={{
          animationDelay: "-7s",
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, rgba(251, 191, 36, 0.08) 48%, transparent 72%)",
        }}
      />
      {/* 极细远景网格纹理，增加空间景深 */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <canvas ref={canvasRef} className="relative block h-full w-full" />
    </div>
  );
}

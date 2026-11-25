"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const WUWA_INTRO_STORAGE_KEY = "yllmis_wuwa_intro_seen";
const TOTAL_DURATION_MS = 2150;

interface WuwaIntroOverlayProps {
  isInitialGate?: boolean;
  onComplete: () => void;
}

interface ButterflySpec {
  baseAngle: number;
  startRadiusFactor: number;
  spiralTurns: number;
  flapSpeed: number;
  flapOffset: number;
  scale: number;
  hue: number;
  delay: number;
}

interface SparkMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  hue: number;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** 绘制发光守岸人双翼星蝶 */
function drawStellarButterfly(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  heading: number,
  flapPhase: number,
  scale: number,
  hue: number,
  alpha: number,
) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading + Math.PI / 2);

  // 3D 扇翅透视压缩
  const wingSpread = 0.22 + 0.78 * Math.abs(Math.cos(flapPhase));
  ctx.scale(scale * wingSpread, scale);

  ctx.shadowColor = `hsla(${hue}, 95%, 72%, ${alpha * 0.9})`;
  ctx.shadowBlur = 16;

  for (const side of [-1, 1] as const) {
    ctx.save();
    ctx.scale(side, 1);

    // 前翼（修长上扬）
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.bezierCurveTo(6, -15, 22, -18, 19, -4);
    ctx.bezierCurveTo(17, 3, 7, 3, 0, 1);
    ctx.closePath();
    const foreGrad = ctx.createLinearGradient(0, -14, 19, 2);
    foreGrad.addColorStop(0, `hsla(${hue}, 95%, 92%, ${alpha * 0.95})`);
    foreGrad.addColorStop(0.55, `hsla(${hue}, 92%, 68%, ${alpha * 0.78})`);
    foreGrad.addColorStop(1, `hsla(${hue + 22}, 90%, 58%, ${alpha * 0.35})`);
    ctx.fillStyle = foreGrad;
    ctx.fill();

    // 后翼（灵动燕尾感）
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.bezierCurveTo(7, 2, 15, 8, 11, 15);
    ctx.bezierCurveTo(8, 19, 3, 14, 0, 6);
    ctx.closePath();
    ctx.fillStyle = `hsla(${hue + 12}, 92%, 74%, ${alpha * 0.68})`;
    ctx.fill();

    ctx.restore();
  }

  // 蝶身微光核
  ctx.beginPath();
  ctx.ellipse(0, 1, 1.1, 5.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(240, 249, 255, ${alpha * 0.95})`;
  ctx.fill();

  ctx.restore();
}

/** 绘制索拉里斯四角共鸣星芒 */
function drawFourPointStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerR: number,
  innerR: number,
  rotation: number,
  fillStyle: string | CanvasGradient,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 4;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

export function markWuwaIntroSeen() {
  try {
    sessionStorage.setItem(WUWA_INTRO_STORAGE_KEY, "1");
    document.documentElement.dataset.wuwaSeen = "1";
  } catch {
    // Ignore storage access errors in private browsing modes
  }
}

export function WuwaIntroOverlay({
  isInitialGate = false,
  onComplete,
}: WuwaIntroOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const finishedRef = useRef(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [syncPercent, setSyncPercent] = useState(0);

  const finishIntro = useCallback(
    (immediate = false) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      markWuwaIntroSeen();

      if (immediate) {
        setFadingOut(true);
        window.setTimeout(() => {
          onComplete();
        }, 220);
      } else {
        onComplete();
      }
    },
    [onComplete],
  );

  useEffect(() => {
    // 若为首屏守门且同会话已播放过，立即卸载不挡路
    if (isInitialGate) {
      try {
        if (sessionStorage.getItem(WUWA_INTRO_STORAGE_KEY) === "1") {
          document.documentElement.dataset.wuwaSeen = "1";
          finishedRef.current = true;
          onComplete();
          return;
        }
      } catch {
        // Continue playing if sessionStorage is unavailable
      }
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      finishIntro(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const butterflies: ButterflySpec[] = Array.from({ length: 7 }, (_, i) => ({
      baseAngle: (i / 7) * Math.PI * 2 + (i % 2 === 0 ? 0.18 : -0.14),
      startRadiusFactor: 0.42 + (i % 3) * 0.11,
      spiralTurns: 1.15 + (i % 2) * 0.32,
      flapSpeed: 0.022 + (i % 3) * 0.004,
      flapOffset: i * 1.1,
      scale: 0.78 + (i % 3) * 0.14,
      hue: i % 3 === 0 ? 192 : i % 3 === 1 ? 202 : 216,
      delay: i * 0.032,
    }));

    const motes: SparkMote[] = [];
    const startTime = performance.now();
    let lastPercent = -1;
    let fadeTriggered = false;
    let rafId = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        finishIntro(true);
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);

    const render = (now: number) => {
      if (finishedRef.current) return;

      const elapsed = now - startTime;
      const progress = clamp01(elapsed / TOTAL_DURATION_MS);

      // 更新 HUD 同步百分比（降频避免过度重渲染）
      const pct = Math.min(100, Math.floor(easeOutCubic(clamp01(progress / 0.76)) * 100));
      if (pct !== lastPercent) {
        lastPercent = pct;
        setSyncPercent(pct);
      }

      // 尾段触发容器柔和揭幕淡出，直通下方守岸人头像与星轨
      if (!fadeTriggered && progress >= 0.78) {
        fadeTriggered = true;
        markWuwaIntroSeen();
        setFadingOut(true);
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      // 微调视觉焦点略偏上，对齐封面中央头像区域
      const cy = height * 0.46;
      const minDim = Math.min(width, height);

      // 中心深空黑海岸微光晕底座
      const baseGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.55);
      baseGlow.addColorStop(0, "rgba(56, 189, 248, 0.14)");
      baseGlow.addColorStop(0.45, "rgba(30, 58, 138, 0.08)");
      baseGlow.addColorStop(1, "rgba(3, 6, 18, 0)");
      ctx.fillStyle = baseGlow;
      ctx.fillRect(0, 0, width, height);

      // ==========================================================
      // 阶段 B：鸣潮声痕频谱共振线（0.00 -> 0.58）
      // ==========================================================
      if (progress < 0.62) {
        const waveAppear = easeOutCubic(progress / 0.18);
        const waveCollapse = 1 - easeInOutCubic((progress - 0.38) / 0.22);
        const waveSpan = width * 0.42 * waveAppear * clamp01(waveCollapse);
        const ampBase =
          (14 + minDim * 0.035) *
          Math.sin(clamp01(progress / 0.58) * Math.PI);

        if (waveSpan > 4) {
          // 细微纵向频谱刻度柱
          const barCount = 32;
          for (let i = -barCount; i <= barCount; i++) {
            const ratio = i / barCount;
            const bx = cx + ratio * waveSpan;
            const env = Math.pow(1 - Math.abs(ratio), 1.7);
            const barH =
              (4 +
                Math.abs(
                  Math.sin(elapsed * 0.014 + i * 0.65) *
                    Math.cos(elapsed * 0.009 - i * 0.3),
                ) *
                  ampBase *
                  1.35) *
              env;
            ctx.fillStyle =
              i % 4 === 0
                ? `rgba(245, 217, 142, ${0.42 * env})`
                : `rgba(103, 232, 249, ${0.26 * env})`;
            ctx.fillRect(bx - 0.75, cy - barH, 1.5, barH * 2);
          }

          // 三重交织正弦声波线（香槟金主频 + 守岸人冰蓝谐波）
          const waves = [
            { freq: 0.024, speed: 0.015, amp: 1.0, color: "rgba(245, 217, 142, 0.9)", lw: 1.6 },
            { freq: 0.033, speed: -0.019, amp: 0.72, color: "rgba(103, 232, 249, 0.8)", lw: 1.3 },
            { freq: 0.017, speed: 0.011, amp: 0.48, color: "rgba(165, 180, 252, 0.55)", lw: 1.0 },
          ];

          for (const w of waves) {
            ctx.beginPath();
            const steps = 110;
            for (let s = 0; s <= steps; s++) {
              const u = (s / steps) * 2 - 1; // -1 .. 1
              const px = cx + u * waveSpan;
              const envelope = Math.pow(1 - u * u, 1.6);
              const py =
                cy +
                Math.sin(u * waveSpan * w.freq + elapsed * w.speed) *
                  ampBase *
                  w.amp *
                  envelope;
              if (s === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = w.color;
            ctx.lineWidth = w.lw;
            ctx.stroke();
          }
        }
      }

      // ==========================================================
      // 阶段 A：黑海岸守岸人幽蓝星蝶盘旋汇聚（0.24 -> 0.84）
      // ==========================================================
      if (progress > 0.2 && progress < 0.88) {
        for (const b of butterflies) {
          const localT = clamp01((progress - 0.22 - b.delay) / 0.54);
          if (localT <= 0 || localT >= 1) continue;

          const eased = easeInOutCubic(localT);
          const maxR = Math.max(width, height) * b.startRadiusFactor;
          const radius = maxR * (1 - eased);
          const theta = b.baseAngle + eased * Math.PI * 2 * b.spiralTurns;

          const bx = cx + Math.cos(theta) * radius;
          const by = cy + Math.sin(theta) * radius * 0.82;

          // 计算切向飞行朝向（指向螺旋中心）
          const nextEased = Math.min(1, eased + 0.02);
          const nextR = maxR * (1 - nextEased);
          const nextTheta = b.baseAngle + nextEased * Math.PI * 2 * b.spiralTurns;
          const nx = cx + Math.cos(nextTheta) * nextR;
          const ny = cy + Math.sin(nextTheta) * nextR * 0.82;
          const heading = Math.atan2(ny - by, nx - bx);

          const alpha =
            Math.min(1, localT * 4.2) * Math.min(1, (1 - localT) * 4.5);

          // 沿途洒下星尘微粒
          if (motes.length < 90 && Math.random() < 0.55) {
            motes.push({
              x: bx + (Math.random() - 0.5) * 8,
              y: by + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 0.6,
              vy: (Math.random() - 0.5) * 0.6 - 0.2,
              r: 0.8 + Math.random() * 1.6,
              alpha: 0.75 * alpha,
              hue: b.hue,
            });
          }

          drawStellarButterfly(
            ctx,
            bx,
            by,
            heading,
            elapsed * b.flapSpeed + b.flapOffset,
            b.scale * (1 - eased * 0.28),
            b.hue,
            alpha,
          );
        }
      }

      // 渲染并衰减星蝶尾迹星尘
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${m.hue}, 95%, 82%, ${m.alpha})`;
        ctx.fill();
        m.x += m.vx;
        m.y += m.vy;
        m.alpha -= 0.024;
        if (m.alpha <= 0) {
          motes.splice(i, 1);
        }
      }

      // ==========================================================
      // 中心索拉里斯四角星芒与共鸣破茧光环（0.36 -> 1.00）
      // ==========================================================
      if (progress > 0.34) {
        const coreBuild = easeOutCubic((progress - 0.34) / 0.42);
        const burstT = clamp01((progress - 0.74) / 0.26);
        const burstEase = easeOutCubic(burstT);

        // 同心声波细环
        const ringR = 26 + coreBuild * 48 + burstEase * minDim * 0.48;
        const ringAlpha = (1 - burstEase) * 0.55 * coreBuild;
        if (ringAlpha > 0.01) {
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(125, 211, 252, ${ringAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(cx, cy, ringR * 0.68, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 217, 142, ${ringAlpha * 0.8})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }

        // 共鸣爆发横向光刃（切开黑海岸帷幕）
        if (progress > 0.7) {
          const bladeIn = easeOutCubic((progress - 0.7) / 0.14);
          const bladeOut = 1 - easeInOutCubic((progress - 0.84) / 0.16);
          const bladeAlpha = bladeIn * clamp01(bladeOut);
          const bladeW = width * (0.35 + bladeIn * 0.65);
          const bladeGrad = ctx.createLinearGradient(
            cx - bladeW / 2,
            cy,
            cx + bladeW / 2,
            cy,
          );
          bladeGrad.addColorStop(0, "rgba(103, 232, 249, 0)");
          bladeGrad.addColorStop(0.35, `rgba(103, 232, 249, ${bladeAlpha * 0.65})`);
          bladeGrad.addColorStop(0.5, `rgba(254, 243, 199, ${bladeAlpha * 0.95})`);
          bladeGrad.addColorStop(0.65, `rgba(103, 232, 249, ${bladeAlpha * 0.65})`);
          bladeGrad.addColorStop(1, "rgba(103, 232, 249, 0)");

          ctx.fillStyle = bladeGrad;
          ctx.fillRect(cx - bladeW / 2, cy - 1.6, bladeW, 3.2);
        }

        // 四角共鸣主星芒
        const starFade = 1 - easeInOutCubic((progress - 0.82) / 0.18);
        const starR = (12 + coreBuild * 24 + burstEase * 28) * clamp01(starFade + 0.15);
        const starAlpha = coreBuild * clamp01(starFade);
        if (starAlpha > 0.01) {
          const starGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, starR);
          starGrad.addColorStop(0, `rgba(255, 251, 235, ${starAlpha})`);
          starGrad.addColorStop(0.5, `rgba(125, 211, 252, ${starAlpha * 0.88})`);
          starGrad.addColorStop(1, "rgba(56, 189, 248, 0)");

          ctx.save();
          ctx.shadowColor = "rgba(103, 232, 249, 0.9)";
          ctx.shadowBlur = 22;
          drawFourPointStar(
            ctx,
            cx,
            cy,
            starR,
            starR * 0.18,
            coreBuild * 0.35,
            starGrad,
          );
          // 45° 交错副星芒（香槟金细针）
          drawFourPointStar(
            ctx,
            cx,
            cy,
            starR * 0.62,
            starR * 0.1,
            Math.PI / 4 + coreBuild * 0.35,
            `rgba(245, 217, 142, ${starAlpha * 0.75})`,
          );
          ctx.restore();
        }
      }

      if (progress >= 1) {
        finishIntro(false);
        return;
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [finishIntro, isInitialGate, onComplete]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="鸣潮主题入场共鸣动画，点击任意位置跳过"
      onClick={(e) => {
        e.stopPropagation();
        finishIntro(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          finishIntro(true);
        }
      }}
      className={`${
        isInitialGate ? "wuwa-initial-gate " : ""
      }fixed inset-0 z-50 flex cursor-pointer select-none flex-col items-center justify-between overflow-hidden bg-[#030612] px-6 py-7 transition-opacity duration-500 ease-out focus:outline-none ${
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 block h-full w-full"
      />

      {/* 顶部机能风终端刻度 */}
      <div className="relative z-10 flex w-full max-w-4xl items-center justify-between font-mono text-[10px] tracking-[0.24em] text-sky-200/55 sm:text-[11px]">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rotate-45 bg-amber-300/80" />
          BLACK SHORES // TETHYS
        </span>
        <span className="text-amber-200/70">SOLARIS-3</span>
      </div>

      {/* 中下部频率同步读数 */}
      <div className="pointer-events-none relative z-10 mt-56 flex flex-col items-center gap-2 text-center sm:mt-64">
        <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.28em] text-sky-100/80">
          <span>RESONANCE SYNCHRONIZING</span>
          <span className="text-amber-300">{String(syncPercent).padStart(3, "0")}%</span>
        </div>
        {/* 极细双色进度丝线 */}
        <div className="h-[1.5px] w-44 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-cyan-200 to-amber-300 transition-[width] duration-75 ease-out"
            style={{ width: `${syncPercent}%` }}
          />
        </div>
      </div>

      {/* 底部跳过微光提示 */}
      <div className="relative z-10 font-mono text-[10px] tracking-[0.2em] text-stone-400/70 transition-colors hover:text-stone-200">
        CLICK ANYWHERE TO SKIP
      </div>
    </div>
  );
}

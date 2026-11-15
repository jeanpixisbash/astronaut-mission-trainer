"use client";
import { useEffect, useRef } from "react";
import type { ParticleKind } from "./scene";

export default function Particles({ kind }: { kind: ParticleKind }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * devicePixelRatio);
    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    window.addEventListener("resize", onResize);

    const N = kind === "stars" || kind === "calm" ? 90 : 140;
    const ps = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (kind === "dust" ? 2 + Math.random() * 4 : 0.6 + Math.random() * 2.2) * devicePixelRatio,
      vx: kind === "dust" ? -(0.6 + Math.random() * 2.2) * devicePixelRatio : (Math.random() - 0.5) * 0.3 * devicePixelRatio,
      vy: kind === "flare" ? -(0.5 + Math.random() * 1.8) * devicePixelRatio : (kind === "dust" ? (Math.random() - 0.3) * 0.8 : (Math.random() - 0.5) * 0.3) * devicePixelRatio,
      a: 0.3 + Math.random() * 0.7,
      tw: Math.random() * Math.PI * 2,
    }));

    const colorFor = (k: ParticleKind) => {
      switch (k) {
        case "dust": return "234,179,106";
        case "flare": return "253,224,71";
        case "radiation": return "196,181,253";
        case "capsule": return "186,230,253";
        default: return "255,255,255";
      }
    };
    const col = colorFor(kind);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.04;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        const twinkle = kind === "stars" || kind === "calm" ? 0.5 + 0.5 * Math.sin(p.tw) : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${(p.a * twinkle).toFixed(2)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches) raf = requestAnimationFrame(tick);
    else {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${p.a.toFixed(2)})`;
        ctx.fill();
      }
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [kind]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}

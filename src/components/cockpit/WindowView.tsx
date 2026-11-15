"use client";
import { AnimatePresence, motion } from "framer-motion";
import Particles from "./Particles";
import type { Scene } from "./scene";

function Craters() {
  return (
    <svg className="absolute bottom-0 left-0 h-[38%] w-full opacity-60" viewBox="0 0 800 120" preserveAspectRatio="none" aria-hidden>
      <ellipse cx="180" cy="70" rx="120" ry="26" fill="rgba(0,0,0,0.28)" />
      <ellipse cx="180" cy="64" rx="120" ry="22" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
      <ellipse cx="560" cy="84" rx="150" ry="30" fill="rgba(0,0,0,0.28)" />
      <ellipse cx="560" cy="77" rx="150" ry="25" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
      <ellipse cx="700" cy="40" rx="60" ry="12" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export default function WindowView({ scene, shakeKey }: { scene: Scene; shakeKey: string }) {
  return (
    <div className="relative overflow-hidden rounded-t-[22px] border-x-[10px] border-t-[10px] border-[#343b4a] bg-black">
      {/* marco superior cabina */}
      <div className="relative z-20 flex items-center justify-between bg-gradient-to-b from-[#3d4454] to-[#232936] px-4 py-1.5">
        <div className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`size-2 rounded-full ${i === 0 ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : i === 1 ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]" : "bg-red-400 shadow-[0_0_6px_#f87171]"}`} />
          ))}
        </div>
        <div className="text-[10px] font-black tracking-[0.2em] text-white/60">VENTANA PRINCIPAL — DÍA {scene.id.replace(/\D/g, "") || "·"}</div>
        <div className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-white/20" />
          ))}
        </div>
      </div>

      {/* 3 paneles como la foto */}
      <motion.div
        key={shakeKey}
        animate={scene.alerta ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative grid grid-cols-[1fr_2fr_1fr] gap-2 bg-[#1a1f2b] p-2"
      >
        {[0, 1, 2].map((pane) => (
          <div
            key={pane}
            className="relative overflow-hidden border-4 border-[#343b4a] bg-black"
            style={{
              borderRadius: pane === 1 ? "18px 18px 40px 40px" : pane === 0 ? "18px 8px 30px 18px" : "8px 18px 18px 30px",
              transform: pane === 0 ? "perspective(400px) rotateY(12deg)" : pane === 2 ? "perspective(400px) rotateY(-12deg)" : undefined,
              minHeight: 190,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0" style={{ background: scene.cielo }} />
                <Particles kind={scene.particulas} />
                <div className="absolute inset-x-0 bottom-0 h-[42%]" style={{ background: scene.suelo }} />
                <Craters />
                {scene.id === "flare" && <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.7),transparent_55%)]" />}
                {scene.id === "noche" && <div className="absolute inset-0 bg-black/45" />}
                {scene.id === "capsula" && (
                  <motion.div
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 60 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 text-4xl"
                  >
                    🚀
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
            {/* reflejo vidrio */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent" />
          </div>
        ))}

        {/* etiqueta escena */}
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id + "-tag"}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            className="absolute bottom-4 left-1/2 z-10 w-max max-w-[90%] -translate-x-1/2 rounded-full border border-white/25 bg-black/65 px-4 py-1.5 text-center backdrop-blur"
          >
            <span className="text-sm font-black text-white">
              {scene.emoji} {scene.titulo}
            </span>
            <span className="ml-2 hidden text-[11px] text-white/70 sm:inline">{scene.subtitulo}</span>
          </motion.div>
        </AnimatePresence>

        {scene.alerta && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-red-400/60 bg-red-500/90 px-3 py-1 text-[11px] font-black text-white shadow-lg"
          >
            ⚠️ {scene.alerta}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

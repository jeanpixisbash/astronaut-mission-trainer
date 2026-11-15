"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { CartaSupervivencia } from "@/lib/cardsCatalog";
import type { Recursos } from "@/lib/gameEngine";

export const META: Record<keyof Recursos, { icon: string; label: string }> = {
  energia: { icon: "⚡", label: "ENERGÍA" },
  oxigeno: { icon: "💧", label: "OXÍGENO" },
  comida: { icon: "🌱", label: "COMIDA" },
  escudo: { icon: "🛡️", label: "ESCUDO" },
};

const FAMILIA_STYLE: Record<string, { bg: string; icon: string }> = {
  energia: { bg: "#f59e0b", icon: "⚡" },
  soporte: { bg: "#06b6d4", icon: "💧" },
  biodomo: { bg: "#10b981", icon: "🌱" },
  blindaje: { bg: "#8b5cf6", icon: "🛡️" },
};

export function ResourceStrip({ recursos, oculto, preview }: { recursos: Recursos; oculto: boolean; preview?: Recursos | null }) {
  return (
    <div className="flex items-center justify-center gap-4 rounded-xl bg-[#10141f] px-4 py-2 sm:gap-8">
      {(Object.keys(META) as (keyof Recursos)[]).map((k) => {
        const v = recursos[k];
        const pv = preview?.[k];
        const delta = pv !== undefined && !oculto ? pv - v : 0;
        const danger = v <= 20 || v >= 85;
        return (
          <div key={k} className="text-center">
            <div className="text-[10px] font-black tracking-widest text-white/55">{META[k].label}</div>
            <div className={`text-lg font-black tabular-nums ${oculto ? "text-white/40" : danger ? "text-red-400" : "text-white"}`}>
              {META[k].icon} {oculto ? "?" : v}
              {!oculto && delta !== 0 && (
                <span className={`ml-1 text-xs ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {delta > 0 ? `▲${delta}` : `▼${delta}`}
                </span>
              )}
            </div>
            <div className="mx-auto mt-1 h-1.5 w-14 overflow-hidden rounded-full bg-white/10 sm:w-20">
              <motion.div
                className={`h-full ${v <= 0 || v >= 100 ? "bg-red-500" : danger ? "bg-amber-400" : "bg-emerald-400"}`}
                animate={{ width: `${oculto ? 50 : Math.max(0, Math.min(100, v))}%`, opacity: oculto ? 0.35 : 1 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Hand({
  mano,
  handIdx,
  pa,
  disabled,
  onPlay,
  onHover,
}: {
  mano: CartaSupervivencia[];
  handIdx: number;
  pa: number;
  disabled: boolean;
  onPlay: (c: CartaSupervivencia) => void;
  onHover: (impacto: Partial<Recursos> | null) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <AnimatePresence mode="popLayout">
        {mano.map((c) => {
          const noPA = pa < c.pa;
          const fam = FAMILIA_STYLE[c.familia] ?? { bg: "#64748b", icon: "◉" };
          return (
            <motion.button
              key={`${c.id}-${handIdx}`}
              layout
              initial={{ rotateY: 90, y: 24, opacity: 0 }}
              animate={{ rotateY: 0, y: 0, opacity: 1 }}
              exit={{ rotateY: -90, y: -16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              whileHover={disabled || noPA ? undefined : { y: -6, scale: 1.02 }}
              whileTap={disabled || noPA ? undefined : { scale: 0.97 }}
              onClick={() => onPlay(c)}
              onMouseEnter={() => onHover(c.impacto)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(c.impacto)}
              onBlur={() => onHover(null)}
              disabled={disabled || noPA}
              className="group relative flex min-h-[210px] flex-col rounded-2xl border-2 border-[#d8cfb4] bg-[#f7f1dd] p-2.5 text-left text-stone-900 shadow-[0_10px_24px_rgba(0,0,0,0.45)] disabled:opacity-45 sm:min-h-[230px] sm:p-3"
            >
              <span className="absolute left-2 top-2 grid size-6 place-items-center rounded-full border border-stone-400 bg-white/70 text-xs" aria-hidden>
                {fam.icon}
              </span>
              <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-black text-white ${noPA ? "bg-red-500" : "bg-stone-900"}`}>
                {c.pa} PA
              </span>
              <span className="mx-auto mt-5 grid size-12 place-items-center rounded-full border-2 border-stone-400 bg-white text-2xl" aria-hidden>
                {c.familia === "energia" ? "⚡" : c.familia === "soporte" ? "💧" : c.familia === "biodomo" ? "🌱" : "🛡️"}
              </span>
              <span className="mt-2 text-center text-[13px] font-black leading-tight sm:text-sm">{c.nombre}</span>
              <span className="mt-1 flex flex-wrap justify-center gap-1">
                {Object.entries(c.impacto).map(([k, v]) => (
                  <span key={k} className={`rounded-full px-1.5 py-0.5 text-[11px] font-black ${v! > 0 ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
                    {v! > 0 ? `+${v}` : v}{META[k as keyof Recursos].icon}
                  </span>
                ))}
              </span>
              <span className="mt-auto line-clamp-2 rounded-lg bg-stone-900/5 px-1.5 py-1 text-center text-[10px] leading-tight text-stone-600">
                <b>NASA:</b> {c.fundamento}
              </span>
              <span className="rounded-full py-1 text-center text-[11px] font-black text-white" style={{ background: fam.bg }}>
                {noPA ? `FALTAN ${c.pa - pa} PA` : disabled ? "···" : `▶ JUGAR`}
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

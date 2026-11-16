"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CartaSupervivencia } from "@/lib/cardsCatalog";
import type { Recursos } from "@/lib/gameEngine";
import { sfx } from "@/lib/sound";

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

export function ResourceStrip({ recursos, oculto, preview, flash }: { recursos: Recursos; oculto: boolean; preview?: Recursos | null; flash?: Partial<Recursos> | null }) {
  return (
    <div className="flex items-center justify-center gap-4 rounded-xl bg-[#10141f] px-4 py-2 sm:gap-8">
      {(Object.keys(META) as (keyof Recursos)[]).map((k) => {
        const v = recursos[k];
        const pv = preview?.[k];
        const delta = pv !== undefined && !oculto ? pv - v : 0;
        const danger = v <= 20 || v >= 85;
        const f = flash?.[k] ?? 0;
        return (
          <div key={k} className="relative text-center">
            <div className="text-xs font-black tracking-widest text-white/55">{META[k].label}</div>
            <div className={`text-lg font-black tabular-nums ${oculto ? "text-white/40" : danger ? "text-red-400" : "text-white"}`}>
              {META[k].icon} {oculto ? "?" : v}
              {!oculto && delta !== 0 && (
                <span className={`ml-1 text-xs ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {delta > 0 ? `▲${delta}` : `▼${delta}`}
                </span>
              )}
            </div>
            <AnimatePresence>
              {f !== 0 && !oculto && (
                <motion.span
                  key={`${k}-${f}`}
                  initial={{ y: 6, opacity: 0, scale: 0.8 }}
                  animate={{ y: -12, opacity: 1, scale: 1.1 }}
                  exit={{ y: -18, opacity: 0 }}
                  className={`pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-xs font-black whitespace-nowrap ${f > 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
                >
                  {f > 0 ? `+${f}` : f}
                </motion.span>
              )}
            </AnimatePresence>
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

export function Crew({ recursos, nombres }: { recursos: Recursos; nombres?: [string, string, string] }) {
  const peor = Math.min(...(Object.values(recursos) as number[]));
  const mood = peor >= 45 ? { cara: "😊", texto: "feliz", color: "text-emerald-300" } : peor >= 28 ? { cara: "😐", texto: "cansada", color: "text-amber-300" } : { cara: "😵", texto: "en peligro", color: "text-red-300" };
  const lista = nombres ?? ["Ada", "Yuri", "Mae"];
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5">
      <span className="text-xs font-black tracking-widest text-white/50">TRIPULACIÓN</span>
      {lista.map((n) => (
        <span key={n} className="flex items-center gap-1" title={`${n}: ${mood.texto}`}>
          <span className="grid size-7 place-items-center rounded-full border border-white/20 bg-black/40 text-lg">{mood.cara}</span>
          <span className="hidden text-xs font-bold text-white/60 sm:inline">{n}</span>
        </span>
      ))}
      <span className={`text-xs font-black ${mood.color}`}>{mood.texto}</span>
    </div>
  );
}

export function DetalleCarta({ c }: { c: CartaSupervivencia }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-cyan-400 bg-[#f7f1dd] p-3 text-stone-900 shadow-lg"
    >
      <div className="text-xs font-black tracking-widest text-stone-500">🔍 ¿QUÉ HACE ESTA CARTA?</div>
      <div className="mt-1 text-sm font-medium leading-5">{c.explicacion}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {Object.entries(c.impacto).map(([k, v]) => (
          <span key={k} className={`rounded-full px-2 py-0.5 text-xs font-black text-white ${v! > 0 ? "bg-emerald-600" : "bg-red-600"}`}>
            {v! > 0 ? `+${v}` : v} {META[k as keyof Recursos].icon} {META[k as keyof Recursos].label}
          </span>
        ))}
        <span className="rounded-full bg-stone-900 px-2 py-0.5 text-xs font-black text-white">Cuesta {c.pa} PA</span>
      </div>
      <div className="mt-2 rounded-xl bg-stone-900/5 p-2 text-xs leading-4 text-stone-700">
        🛰️ <b>Sello NASA:</b> {c.fundamento}{" "}
        <a href={c.fuente.url} target="_blank" rel="noreferrer" className="font-bold text-cyan-700 underline">
          Fuente: {c.fuente.nombre} →
        </a>
      </div>
    </motion.div>
  );
}

export function Hand({
  mano,
  handIdx,
  pa,
  disabled,
  selectedKey,
  resaltarAyuda,
  onPlay,
  onHover,
}: {
  mano: CartaSupervivencia[];
  handIdx: number;
  pa: number;
  disabled: boolean;
  selectedKey: string | null;
  resaltarAyuda?: boolean;
  onPlay: (c: CartaSupervivencia) => void;
  onHover: (impacto: Partial<Recursos> | null) => void;
}) {
  const [giradas, setGiradas] = useState<{ hand: number; map: Record<string, boolean> }>({ hand: handIdx, map: {} });
  const mapaGiradas = giradas.hand === handIdx ? giradas.map : {};
  const girar = (key: string) => {
    sfx.flip();
    setGiradas({ hand: handIdx, map: { ...mapaGiradas, [key]: !mapaGiradas[key] } });
  };
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <AnimatePresence mode="popLayout">
        {mano.map((c) => {
          const noPA = pa < c.pa;
          const fam = FAMILIA_STYLE[c.familia] ?? { bg: "#64748b", icon: "◉" };
          const key = `${c.id}-${handIdx}`;
          const selected = selectedKey === key;
          const girada = !!mapaGiradas[key];
          const bloqueada = disabled || noPA;
          const pros = (Object.entries(c.impacto) as [keyof Recursos, number][]).filter(([, v]) => v > 0);
          const contras = (Object.entries(c.impacto) as [keyof Recursos, number][]).filter(([, v]) => v < 0);
          return (
            <motion.div
              key={key}
              layout
              initial={{ rotateY: 90, y: 24, opacity: 0 }}
              animate={{ rotateY: 0, y: 0, opacity: 1 }}
              exit={{ rotateY: -90, y: -16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative [perspective:900px]"
            >
              <motion.div
                animate={{ rotateY: girada ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                className="relative h-[170px] [transform-style:preserve-3d]"
              >
                <div
                  onClick={() => {
                    if (!bloqueada) onPlay(c);
                  }}
                  onMouseEnter={() => onHover(c.impacto)}
                  onMouseLeave={() => onHover(null)}
                  className={`flex h-[170px] flex-col rounded-2xl border-2 border-[#d8cfb4] bg-[#f7f1dd] p-2 text-left text-stone-900 shadow-[0_10px_24px_rgba(0,0,0,0.45)] [backface-visibility:hidden] ${selected ? "ring-4 ring-cyan-400" : ""} ${bloqueada ? "opacity-45" : "cursor-pointer"}`}
                >
                  <span className="absolute left-2 top-2 grid size-6 place-items-center rounded-full border border-stone-400 bg-white/70 text-xs" aria-hidden>
                    {fam.icon}
                  </span>
                  <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-black text-white ${noPA ? "bg-red-500" : "bg-zinc-900"}`}>
                    {c.pa} PA
                  </span>
                  <span className="mx-auto mt-1 grid size-10 place-items-center rounded-full border-2 border-stone-400 bg-white text-xl" aria-hidden>
                    {c.familia === "energia" ? "⚡" : c.familia === "soporte" ? "💧" : c.familia === "biodomo" ? "🌱" : "🛡️"}
                  </span>
                  <span className="mt-2 text-center text-[13px] font-black leading-tight sm:text-sm">{c.nombre}</span>
                  <span className="mt-1 flex flex-wrap justify-center gap-1">
                    {Object.entries(c.impacto).map(([k, v]) => (
                      <span key={k} className={`rounded-full px-1.5 py-0.5 text-xs font-black ${v! > 0 ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
                        {v! > 0 ? `+${v}` : v}{META[k as keyof Recursos].icon}
                      </span>
                    ))}
                  </span>
                  <span className="mt-auto line-clamp-2 rounded-lg bg-stone-900/5 px-1.5 py-1 text-center text-xs leading-tight text-stone-600">
                    <b>NASA:</b> {c.fundamento}
                  </span>
                  <span className="rounded-full py-1 text-center text-xs font-black text-white" style={{ background: fam.bg }}>
                    {noPA ? `FALTAN ${c.pa - pa} PA` : disabled ? "···" : selected ? "▶ TOCÁ DE NUEVO" : `▶ JUGAR`}
                  </span>
                </div>
                <div className="absolute inset-0 overflow-y-auto rounded-2xl border-2 border-cyan-500 bg-[#f7f1dd] p-2.5 text-left text-stone-900 shadow-[0_10px_24px_rgba(0,0,0,0.45)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-3">
                  <div className="text-xs font-black tracking-widest text-stone-500">❓ ¿QUÉ ES?</div>
                  <p className="mt-0.5 text-xs leading-5">{c.explicacion}</p>
                  <div className="mt-1.5 text-xs font-black tracking-widest text-stone-500">🎯 ¿POR QUÉ JUGARLA?</div>
                  <ul className="mt-0.5 space-y-0.5 text-xs leading-5">
                    {pros.map(([k, v]) => (
                      <li key={k}>✅ Sube {META[k].label} {v}. Úsala cuando esté en rojo.</li>
                    ))}
                    {contras.map(([k, v]) => (
                      <li key={k}>⚠️ Ojo: baja {META[k].label} {v}.</li>
                    ))}
                    <li>⚡ Cuesta {c.pa} {c.pa === 1 ? "acción" : "acciones"}.</li>
                  </ul>
                  <div className="mt-1.5 rounded-lg bg-stone-900/5 p-1.5 text-xs leading-4 text-stone-700">
                    🛰️ <b>Dato NASA:</b> {c.fundamento}{" "}
                    <a
                      href={c.fuente.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-cyan-700 underline"
                    >
                      {c.fuente.nombre} →
                    </a>
                  </div>
                </div>
              </motion.div>
              {/* botón explícito estilo Snap: dice lo que hace, pulsa el día 1 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  girar(key);
                }}
                onMouseEnter={() => onHover(c.impacto)}
                onMouseLeave={() => onHover(null)}
                className={`absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 rounded-full border-2 border-white px-2.5 py-1 text-xs font-black whitespace-nowrap text-white shadow-lg active:scale-90 ${girada ? "bg-zinc-700" : "bg-cyan-600"} ${resaltarAyuda && !girada ? "animate-pulse ring-2 ring-amber-300" : ""}`}
              >
                {girada ? "↩ VOLVER" : "❓ ¿QUÉ HACE?"}
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

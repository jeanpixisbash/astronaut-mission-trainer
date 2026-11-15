"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ATAQUE, EVENTOS_GLOBALES, SUPERVIVENCIA } from "@/lib/cardsCatalog";
import type { Recursos } from "@/lib/gameEngine";

const ICON: Record<string, string> = { energia: "⚡", oxigeno: "💧", comida: "🌱", escudo: "🛡️" };

type Filtro = "todas" | "energia" | "soporte" | "biodomo" | "blindaje" | "rojo" | "eventos";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "energia", label: "⚡ Energía" },
  { id: "soporte", label: "💧 Soporte" },
  { id: "biodomo", label: "🌱 Bio-Domo" },
  { id: "blindaje", label: "🛡️ Blindaje" },
  { id: "rojo", label: "🔴 Ataque" },
  { id: "eventos", label: "🌌 Eventos" },
];

function Chips({ impacto }: { impacto: Partial<Record<string, number>> }) {
  return (
    <span className="flex flex-wrap gap-1">
      {Object.entries(impacto).map(([k, v]) => (
        <span key={k} className={`rounded-full px-2 py-0.5 text-xs font-black text-white ${v! > 0 ? "bg-emerald-600" : "bg-red-600"}`}>
          {v! > 0 ? `+${v}` : v}{ICON[k]}
        </span>
      ))}
    </span>
  );
}

export default function CodexPage() {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [q, setQ] = useState("");

  const matchQ = (t: string) => t.toLowerCase().includes(q.trim().toLowerCase());

  const sup = useMemo(
    () =>
      SUPERVIVENCIA.filter(
        (c) => (filtro === "todas" || c.familia === filtro) && matchQ(`${c.nombre} ${c.explicacion} ${c.fundamento}`)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtro, q]
  );
  const atq = useMemo(
    () => ATAQUE.filter(() => (filtro === "todas" || filtro === "rojo") && true),
    [filtro]
  ).filter((c) => matchQ(`${c.nombre} ${c.explicacion} ${c.fundamento}`));
  const evs = useMemo(
    () => EVENTOS_GLOBALES.filter(() => filtro === "todas" || filtro === "eventos"),
    [filtro]
  ).filter((e) => matchQ(`${e.nombre} ${e.explicacion} ${e.datoReal}`));

  return (
    <div className="min-h-dvh bg-[#05070f] text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070f]/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/play" className="font-black tracking-tight">← Volver al juego</Link>
          <span className="text-sm font-black">📖 CODEX NASA</span>
          <Link href="/" className="text-xs text-white/60">Inicio</Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-10">
        <h1 className="pt-5 text-2xl font-black">📖 Codex del astronauta</h1>
        <p className="mt-1 text-sm text-white/60">
          Todas las cartas y eventos con su explicación y su fuente NASA real. Lee, aprende y vuelve a jugar mejor.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-black ${filtro === f.id ? "bg-white text-black" : "border border-white/15 bg-white/5 text-white/70"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar: oxígeno, polvo, reactor…"
          className="mt-3 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-cyan-400"
        />

        {(filtro === "todas" || ["energia", "soporte", "biodomo", "blindaje"].includes(filtro)) && (
          <>
            <h2 className="mt-6 text-sm font-black tracking-widest text-white/60">CARTAS DE SUPERVIVENCIA ({sup.length})</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sup.map((c) => (
                <div key={c.id} className="rounded-2xl border-2 border-[#d8cfb4] bg-[#f7f1dd] p-3 text-stone-900">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-black leading-tight">{c.nombre}</div>
                    <span className="shrink-0 rounded-full bg-stone-900 px-2 py-0.5 text-xs font-black text-white">{c.pa} PA</span>
                  </div>
                  <div className="mt-1.5"><Chips impacto={c.impacto} /></div>
                  <p className="mt-1.5 text-[13px] leading-5">{c.explicacion}</p>
                  <p className="mt-1.5 rounded-xl bg-stone-900/5 p-2 text-[11px] leading-4 text-stone-700">
                    🛰️ <b>Sello NASA:</b> {c.fundamento}{" "}
                    <a href={c.fuente.url} target="_blank" rel="noreferrer" className="font-bold text-cyan-700 underline">
                      {c.fuente.nombre} →
                    </a>
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {(filtro === "todas" || filtro === "rojo") && (
          <>
            <h2 className="mt-6 text-sm font-black tracking-widest text-white/60">MAZO ROJO — ATAQUE / CLIMA ({atq.length})</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {atq.map((c) => (
                <div key={c.id} className="rounded-2xl border-2 border-red-500 bg-gradient-to-br from-red-500 to-orange-600 p-3 text-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-black leading-tight">{c.nombre}</div>
                    <span className="shrink-0 rounded-full bg-black px-2 py-0.5 text-xs font-black text-white">{c.pa} PA</span>
                  </div>
                  <div className="mt-1.5"><Chips impacto={c.efectoRival as Partial<Record<keyof Recursos, number>>} /></div>
                  <p className="mt-1.5 text-[13px] leading-5 text-white/90">{c.explicacion}</p>
                  <p className="mt-1.5 rounded-xl bg-black/20 p-2 text-[11px] leading-4 text-white/85">
                    🛰️ <b>Sello NASA:</b> {c.fundamento}{" "}
                    <a href={c.fuente.url} target="_blank" rel="noreferrer" className="font-bold underline">
                      {c.fuente.nombre} →
                    </a>
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {(filtro === "todas" || filtro === "eventos") && (
          <>
            <h2 className="mt-6 text-sm font-black tracking-widest text-white/60">EVENTOS GLOBALES NASA ({evs.length})</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {evs.map((e) => (
                <div key={e.id} className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3">
                  <div className="font-black">🌌 {e.nombre}</div>
                  <div className="mt-1.5"><Chips impacto={e.efecto} /></div>
                  <p className="mt-1.5 text-[13px] leading-5 text-white/85">{e.explicacion}</p>
                  <p className="mt-1.5 text-[11px] leading-4 text-white/60">
                    📡 {e.datoReal}{" "}
                    <a href={e.fuente.url} target="_blank" rel="noreferrer" className="font-bold text-violet-300 underline">
                      {e.fuente.nombre} →
                    </a>
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {sup.length + atq.length + evs.length === 0 && (
          <p className="mt-8 text-center text-sm text-white/50">Sin resultados — prueba otra palabra.</p>
        )}

        <p className="mt-8 text-center text-xs text-white/30">
          Fuentes: DONKI, OSDR, Mars Trek, programas NASA (MOXIE, FSP, ECLSS, Veggie) · Enlaces externos a nasa.gov
        </p>
      </main>
    </div>
  );
}

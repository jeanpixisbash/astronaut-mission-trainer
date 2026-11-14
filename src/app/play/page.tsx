"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ATAQUE, SUPERVIVENCIA, EVENTOS_GLOBALES, buildDeckAtaque, buildDeckEventos, buildDeckSupervivencia, type CartaAtaque, type CartaSupervivencia, type EventoGlobal } from "@/lib/cardsCatalog";
import { aplicarCarta, aplicarEventoGlobal, clamp, crearEstadoInicial, debeOcultar, desgasteBase, intercambiar, previewRecursos, verificarColapso, type GameState, type Recursos } from "@/lib/gameEngine";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const META: Record<keyof Recursos, { icon: string; label: string; color: string }> = {
  energia: { icon: "⚡", label: "Energía", color: "bg-amber-400" },
  oxigeno: { icon: "💧", label: "O₂/Agua", color: "bg-cyan-400" },
  comida: { icon: "🌱", label: "Comida", color: "bg-emerald-400" },
  escudo: { icon: "🛡️", label: "Escudo", color: "bg-violet-400" },
};

function Barra({ k, valor, preview, oculto }: { k: keyof Recursos; valor: number; preview?: number; oculto?: boolean }) {
  const m = META[k];
  const delta = preview !== undefined && !oculto ? preview - valor : 0;
  const low = valor <= 20 || valor >= 85;
  return (
    <div className={`rounded-2xl border p-2.5 ${valor <= 0 || valor >= 100 ? "bg-red-500/20 border-red-400" : low ? "bg-amber-500/10 border-amber-400/30" : "bg-black/30 border-white/10"}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-black tracking-wide">
          {m.icon} {m.label.toUpperCase()}
        </span>
        {!oculto && delta !== 0 && <span className={`font-black ${delta > 0 ? "text-emerald-300" : "text-red-300"}`}>{delta > 0 ? `▲ +${delta}` : `▼ ${delta}`}</span>}
        {oculto && <span className="text-[10px] bg-indigo-500 text-white rounded-full px-1.5 py-0.5 font-black">TELEMETRÍA OFF</span>}
      </div>
      <div className="mt-1 h-3 rounded-full bg-white/10 overflow-hidden relative">
        <div className={`h-full transition-all duration-500 ${valor <= 0 || valor >= 100 ? "bg-red-500" : m.color}`} style={{ width: `${oculto ? 50 : clamp(valor)}%`, opacity: oculto ? 0.35 : 1 }} />
        {preview !== undefined && delta !== 0 && !oculto && (
          <div className={`absolute top-0 h-full opacity-60 ${delta > 0 ? "bg-emerald-400" : "bg-red-400"}`} style={{ left: `${Math.min(clamp(valor), clamp(preview))}%`, width: `${Math.abs(clamp(preview) - clamp(valor))}%` }} />
        )}
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="font-black">{oculto ? "??%" : `${clamp(valor)}%`}</span>
        <span className="text-white/40 text-[10px]">0 — 50 — 100 {valor >= 100 ? "🔥" : valor <= 0 ? "💥" : ""}</span>
      </div>
    </div>
  );
}

function CartaView({
  c,
  onPlay,
  onHover,
  disabled,
  paDisponible,
}: {
  c: CartaSupervivencia;
  onPlay: () => void;
  onHover: (on: boolean) => void;
  disabled: boolean;
  paDisponible: number;
}) {
  const noPA = paDisponible < c.pa;
  return (
    <button
      onClick={onPlay}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      disabled={disabled || noPA}
      className={`text-left rounded-[18px] border-2 p-3 bg-white text-zinc-900 shadow-lg flex flex-col gap-2 w-full hover:scale-[1.02] hover:shadow-xl transition disabled:opacity-40 disabled:hover:scale-100 ${disabled ? "" : "cursor-pointer"}`}
    >
      <div className={`h-1.5 rounded-full bg-gradient-to-r ${c.color}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="font-black leading-tight text-sm">{c.nombre}</div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-black ${noPA ? "bg-red-500 text-white" : "bg-zinc-900 text-white"}`}>{c.pa} PA</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {Object.entries(c.impacto).map(([k, v]) => (
          <span
            key={k}
            className={`rounded-full px-2 py-0.5 text-xs font-bold border ${v! > 0 ? "bg-emerald-500 text-white border-emerald-600" : "bg-red-500 text-white border-red-600"}`}
          >
            {v! > 0 ? `+${v}` : `${v}`} {META[k as keyof Recursos].icon}
          </span>
        ))}
      </div>
      <div className="text-[11px] leading-3 text-zinc-600 bg-zinc-100 rounded-xl px-2 py-1.5">
        <span className="font-bold">Sello NASA:</span> {c.fundamento}
      </div>
      <div className="text-[10px] tracking-widest font-black text-white/80 rounded-full px-2 py-1 text-center" style={{ background: c.familia === "energia" ? "#f59e0b" : c.familia === "soporte" ? "#06b6d4" : c.familia === "biodomo" ? "#10b981" : "#8b5cf6" }}>
        {c.familia.toUpperCase()}
      </div>
      {noPA && <div className="text-xs font-black text-red-600">⚠️ Necesitas {c.pa} PA — tienes {paDisponible}</div>}
      {!noPA && !disabled && <div className="rounded-full bg-zinc-900 text-white text-xs font-black py-1.5 text-center">▶ Jugar ({c.pa} PA)</div>}
    </button>
  );
}

function CartaRojaView({ c, pa }: { c: CartaAtaque; pa?: number }) {
  return (
    <div className="rounded-[18px] border-2 border-red-500 p-3 bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-lg flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black tracking-widest bg-black/20 rounded-full px-2 py-1">⚠️ MAZO ROJO — CLIMA / ATAQUE</span>
        {pa !== undefined && <span className="text-xs font-black bg-black text-white rounded-full px-2 py-1">{pa} PA</span>}
      </div>
      <div className="font-black leading-tight">{c.nombre}</div>
      <div className="flex flex-wrap gap-1">
        {Object.entries(c.efectoRival).length === 0 ? (
          <span className="rounded-full bg-indigo-600 border border-indigo-400 px-2 py-0.5 text-xs font-bold">👁️ Oculta tus % 1 turno</span>
        ) : (
          Object.entries(c.efectoRival).map(([k, v]) => (
            <span key={k} className={`rounded-full px-2 py-0.5 text-xs font-bold border ${v! > 0 ? "bg-amber-400 text-black border-amber-500" : "bg-black/30 border-white/30"}`}>
              {v! > 0 ? `+${v}` : `${v}`} {META[k as keyof Recursos].icon} al rival
            </span>
          ))
        )}
      </div>
      <div className="text-[11px] bg-black/20 rounded-xl px-2 py-1">Coste lanzador: {Object.entries(c.costoLanzador).map(([k, v]) => `${v}${META[k as keyof Recursos].icon}`).join(" ") || "—"}</div>
    </div>
  );
}

export default function PlayPage() {
  const [state, setState] = useState<GameState>(() => crearEstadoInicial());
  const [deckSup, setDeckSup] = useState<CartaSupervivencia[]>(() => [...SUPERVIVENCIA]);
  const [deckRojo, setDeckRojo] = useState<CartaAtaque[]>(() => [...ATAQUE, ...ATAQUE].slice(0, 8));
  const [handIdx, setHandIdx] = useState(0);
  const [rojoIdx, setRojoIdx] = useState(0);
  const [timeline, setTimeline] = useState<EventoGlobal[]>(() => EVENTOS_GLOBALES.slice(0, 5));
  const [hoverImpact, setHoverImpact] = useState<Partial<Recursos> | null>(null);
  const [protocolo, setProtocolo] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [fase, setFase] = useState<"negociar" | "planificar">("planificar");
  const [segundos, setSegundos] = useState(20);
  const [dar, setDar] = useState<keyof Recursos>("energia");
  const [recibir, setRecibir] = useState<keyof Recursos>("oxigeno");
  const [ultimoAtaque, setUltimoAtaque] = useState<CartaAtaque | null>(null);

  // shuffle only on client — avoids prerender random mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeckSup(shuffle(buildDeckSupervivencia()));
    setDeckRojo(shuffle(buildDeckAtaque()));
    setTimeline(shuffle(buildDeckEventos()).slice(0, 5));
  }, []);

  // timer negociación 20s (Manual pide 60s — 20s pa' demo ágil)
  useEffect(() => {
    if (fase !== "negociar" || state.gameOver) return;
    if (segundos <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFase("planificar");
      return;
    }
    const t = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [fase, segundos, state.gameOver]);

  const mano = useMemo(() => {
    const out: CartaSupervivencia[] = [];
    for (let i = 0; i < 3; i++) out.push(deckSup[(handIdx + i) % deckSup.length]);
    return out;
  }, [deckSup, handIdx]);

  const eventoHoy: EventoGlobal | null = useMemo(() => {
    if (state.dia % 3 !== 0) return null;
    const idx = Math.floor(state.dia / 3) - 1;
    return timeline[idx] ?? null;
  }, [state.dia, timeline]);

  const preview = useMemo(() => (hoverImpact ? previewRecursos(state.recursos, hoverImpact) : null), [hoverImpact, state.recursos]);

  const avanzar = (carta: CartaSupervivencia) => {
    if (state.gameOver || fase !== "planificar") return;
    if (state.pa < carta.pa) return;

    let next = aplicarCarta(state, carta.impacto, carta.pa, carta.nombre, protocolo);

    // — IA / Clima rojo: 1 carta por turno (PDF: 16 cartas ×2, lanzadas por IA en Solitario)
    const ataque = deckRojo[rojoIdx % deckRojo.length];
    setUltimoAtaque(ataque);
    if (ataque.id === "interferencia") {
      // No toca recursos, solo oculta telemetría 1 turno
      next = { ...next, ocultarHastaDia: next.dia + 1, log: [...next.log, `🔴 IA: ${ataque.nombre} — ¡telemetría oculta 1 turno!`] };
    } else {
      const efecto: Partial<Recursos> = { ...ataque.efectoRival };
      if (protocolo) {
        for (const k of Object.keys(efecto) as (keyof Recursos)[]) efecto[k] = Math.round((efecto[k] ?? 0) / 2);
      }
      if (Object.keys(efecto).length) {
        next = { ...next, recursos: { ...next.recursos } };
        for (const k of Object.keys(efecto) as (keyof Recursos)[]) {
          next.recursos[k] = clamp(next.recursos[k] + (efecto[k] ?? 0));
        }
        next.log = [...next.log, `🔴 Ataque IA: ${ataque.nombre} ${JSON.stringify(efecto)}${protocolo ? " (½ por Protocolo)" : ""}`];
      }
    }

    // — Evento global del día (cada 3)
    if (eventoHoy) {
      let efecto = { ...eventoHoy.efecto };
      if (protocolo) {
        for (const k of Object.keys(efecto) as (keyof Recursos)[]) efecto[k] = Math.round((efecto[k] ?? 0) / 2);
      }
      if (eventoHoy.id === "capsula-reabastecimiento") {
        const entries = Object.entries(next.recursos) as [keyof Recursos, number][];
        const masBaja = entries.sort((a, b) => a[1] - b[1])[0][0];
        efecto = { [masBaja]: 20 } as Partial<Recursos>;
      }
      if (Object.keys(efecto).length) next = aplicarEventoGlobal(next, efecto, eventoHoy.nombre);
    }

    const check = verificarColapso(next);
    if (check.gameOver) {
      setState(check);
      setMensaje(check.causaDerrota ?? (check.won ? "¡Victoria!" : "Colapso"));
      setRojoIdx((i) => (i + 1) % deckRojo.length);
      return;
    }

    const siguienteDia = check.dia + 1;
    let siguiente: GameState = { ...check, dia: siguienteDia, pa: 3, protocoloActivo: false };
    if (siguienteDia > 1 && siguienteDia <= 15) {
      siguiente = desgasteBase(siguiente);
      const check2 = verificarColapso(siguiente);
      if (check2.gameOver) {
        setState(check2);
        setMensaje(check2.causaDerrota ?? "Colapso por desgaste");
        setRojoIdx((i) => (i + 1) % deckRojo.length);
        return;
      }
      siguiente = check2;
    }

    if (siguienteDia > 15) {
      const final = verificarColapso({ ...siguiente, dia: 15 });
      setState(final);
      setMensaje(final.won ? "¡15 días! Equilibrado" : "15 días — desequilibrado");
    } else {
      setState(siguiente);
      // siguiente fase: negociación (Manual 0.4 — 60s, demo 20s)
      setFase("negociar");
      setSegundos(20);
    }
    setHandIdx((i) => (i + 1) % deckSup.length);
    setRojoIdx((i) => (i + 1) % deckRojo.length);
    setProtocolo(false);
    setHoverImpact(null);
  };

  const hacerTrueque = () => {
    if (fase !== "negociar" || dar === recibir) return;
    const res = intercambiar(state.recursos, dar, 6, recibir, 3); // 6 → 3 (2:1 con pérdida, trade-off)
    if (!res.ok) {
      setMensaje(res.msg);
      return;
    }
    setState((s) => ({ ...s, recursos: res.recursos, log: [...s.log, `🤝 Trueque: ${res.msg}`] }));
    setMensaje(`🤝 ${res.msg}`);
  };

  const saltarNegociacion = () => setFase("planificar");

  const reiniciar = () => {
    setState(crearEstadoInicial());
    setDeckSup(shuffle(buildDeckSupervivencia()));
    setDeckRojo(shuffle(buildDeckAtaque()));
    setTimeline(shuffle(buildDeckEventos()).slice(0, 5));
    setHandIdx(0);
    setRojoIdx(0);
    setHoverImpact(null);
    setProtocolo(false);
    setMensaje(null);
    setFase("planificar");
    setSegundos(20);
    setUltimoAtaque(null);
  };

  const puedeGuardarProtocolo = state.pa >= 1 && !state.gameOver;

  return (
    <div className="min-h-dvh flex flex-col bg-[#080c1a] text-zinc-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-[#080c1a]/80 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-2">
          <Link href="/" className="font-black tracking-tight flex items-center gap-2">
            <span className="size-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 grid place-items-center">◉</span>
            <span className="hidden sm:inline">Sobrevive al Sol</span>
            <span className="sm:hidden">Misión</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white text-black px-3 py-1 text-xs font-black">
              DÍA {Math.min(state.dia, 15)}/15
            </span>
            <div className="hidden sm:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
              <span className="text-xs font-bold mr-1">PA</span>
              {[0, 1, 2].map((i) => (
                <span key={i} className={`size-3 rounded-full border ${i < state.pa ? "bg-amber-400 border-amber-500" : "bg-white/10 border-white/20"}`} />
              ))}
            </div>
            <button onClick={reiniciar} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold">
              Reiniciar
            </button>
          </div>
        </div>
      </header>

      {/* Barras 4 — Regla de Oro 0/100 */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black tracking-widest text-white/70">SISTEMAS CRÍTICOS — 0% colapso · 100% colapso · 50% equilibrio</h2>
          <span className={`text-xs rounded-full px-2 py-1 border font-black ${state.gameOver ? (state.won ? "bg-emerald-500 border-emerald-600 text-white" : "bg-red-500 border-red-600 text-white") : "bg-white/10 border-white/10"}`}>
            {state.gameOver ? (state.won ? "✅ Estable" : `💥 ${state.causaDerrota}`) : "● Operativa"}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-2">
          {(Object.keys(META) as (keyof Recursos)[]).map((k) => (
            <Barra key={k} k={k} valor={state.recursos[k]} preview={preview ? preview[k] : undefined} oculto={debeOcultar(state)} />
          ))}
        </div>
        {debeOcultar(state) && <div className="mt-1 text-xs font-bold text-indigo-300">👁️ Interferencia activa — porcentajes ocultos este turno</div>}
      </div>

      {/* Timeline eventos cada 3 días */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-xs font-black tracking-widest">LÍNEA DE TIEMPO — eventos globales (cada 3 días)</div>
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {[3, 6, 9, 12, 15].map((d, i) => {
              const ev = timeline[i];
              const isHoy = state.dia === d;
              const pasado = state.dia > d;
              return (
                <div
                  key={d}
                  className={`shrink-0 rounded-xl border px-3 py-2 min-w-[150px] ${isHoy ? "bg-amber-400 text-black border-amber-500" : pasado ? "bg-white/5 border-white/10 opacity-60" : "bg-black/30 border-white/10"}`}
                >
                  <div className="text-xs font-black">DÍA {d}</div>
                  <div className="text-xs leading-tight font-bold">{ev?.nombre ?? "—"}</div>
                  <div className="text-[11px] leading-tight opacity-70 line-clamp-2">{ev?.datoReal}</div>
                  {ev && Object.keys(ev.efecto).length > 0 && <div className="text-[11px] font-mono">{Object.entries(ev.efecto).map(([k, v]) => `${v! > 0 ? "+" : ""}${v}${META[k as keyof Recursos].icon}`).join(" ")}</div>}
                  {isHoy && <div className="text-xs font-black mt-1">← HOY</div>}
                </div>
              );
            })}
          </div>
          {eventoHoy && (
            <div className="mt-2 rounded-xl bg-amber-400 text-black px-3 py-2 text-sm font-bold">🌌 Evento hoy: {eventoHoy.nombre} — {eventoHoy.datoReal}</div>
          )}
        </div>
      </div>

      {/* Negociación 60s (Manual 0.4 Paso 2) */}
      {fase === "negociar" && !state.gameOver && (
        <div className="mx-auto w-full max-w-6xl px-4 pt-3">
          <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 text-zinc-900 p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-black text-sm">🤝 NEGOCIACIÓN — {segundos}s</h3>
              <div className="flex gap-2">
                <button onClick={saltarNegociacion} className="rounded-full bg-zinc-900 text-white px-3 py-1 text-xs font-black">
                  Saltar → Planificar
                </button>
              </div>
            </div>
            <p className="text-xs text-zinc-600 mt-1">Manual 0.4: 60s para intercambiar fichas (aquí 20s demo). Intercambia 6% de un recurso por 3% de otro. ¡Las promesas no valen, solo el cambio!</p>
            <div className="mt-2 flex flex-wrap gap-2 items-end">
              <label className="text-xs font-bold">
                Doy 6%
                <select value={dar} onChange={(e) => setDar(e.target.value as keyof Recursos)} className="ml-1 rounded-lg border px-2 py-1">
                  {(Object.keys(META) as (keyof Recursos)[]).map((k) => (
                    <option key={k} value={k}>
                      {META[k].icon} {META[k].label}
                    </option>
                  ))}
                </select>
              </label>
              <span className="text-zinc-400">→</span>
              <label className="text-xs font-bold">
                Recibo 3%
                <select value={recibir} onChange={(e) => setRecibir(e.target.value as keyof Recursos)} className="ml-1 rounded-lg border px-2 py-1">
                  {(Object.keys(META) as (keyof Recursos)[]).map((k) => (
                    <option key={k} value={k}>
                      {META[k].icon} {META[k].label}
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={hacerTrueque} disabled={dar === recibir} className="rounded-full bg-amber-500 text-black px-4 py-1.5 text-xs font-black disabled:opacity-40">
                Trueque 6→3
              </button>
              <span className="text-xs text-zinc-500">Reserva común: intercambios ilimitados pero con pérdida (trade-off).</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-zinc-200 overflow-hidden">
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${(segundos / 20) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Último ataque rojo revelado */}
      {ultimoAtaque && (
        <div className="mx-auto w-full max-w-6xl px-4 pt-3">
          <CartaRojaView c={ultimoAtaque} />
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-4 py-3 grid lg:grid-cols-[1.15fr_0.85fr] gap-4 flex-1">
        {/* Izquierda: mano */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm">{fase === "negociar" ? "⏳ NEGOCIANDO — haz trueques" : "MANO — 3 PA por turno · elige 1 carta"}</h3>
            <button
              onClick={() => setProtocolo((v) => !v)}
              disabled={!puedeGuardarProtocolo || fase === "negociar"}
              className={`rounded-full px-3 py-1 text-xs font-black border ${protocolo ? "bg-violet-600 text-white border-violet-700" : puedeGuardarProtocolo && fase !== "negociar" ? "bg-white/10 border-white/20 hover:bg-white/15" : "bg-white/5 border-white/10 opacity-40"}`}
            >
              {protocolo ? "🛡️ Protocolo ON (½ daño)" : "Guardar 1 PA → Protocolo (½ daño)"}
            </button>
          </div>
          <p className="text-xs text-white/60 -mt-2">{fase === "negociar" ? "Fase Manual 0.4 — intercambia antes de jugar. El tiempo corre..." : "Hover para preview ▲▼ en las barras. Ninguna carta es 100% positiva — siempre pagas algo."}</p>

          <div className={`grid sm:grid-cols-3 gap-3 ${fase === "negociar" ? "opacity-40 pointer-events-none" : ""}`}>
            {mano.map((c) => (
              <CartaView
                key={`${c.id}-${handIdx}-${c.nombre}`}
                c={c}
                paDisponible={state.pa}
                disabled={state.gameOver || fase === "negociar"}
                onHover={(on) => setHoverImpact(on ? c.impacto : null)}
                onPlay={() => avanzar(c)}
              />
            ))}
          </div>

          {state.gameOver && (
            <div className={`rounded-2xl border-2 p-4 ${state.won ? "bg-emerald-500 border-emerald-600 text-white" : "bg-red-500 border-red-600 text-white"}`}>
              <div className="text-lg font-black">{state.won ? "🎉 ¡Sobreviviste 15 días!" : `💥 ${state.causaDerrota}`}</div>
              <div className="text-sm mt-1">{state.log[state.log.length - 1]}</div>
              <button onClick={reiniciar} className="mt-3 rounded-full bg-white text-black px-5 py-2 text-sm font-black">
                Jugar de nuevo — baraja nueva
              </button>
            </div>
          )}
        </div>

        {/* Derecha: log + NASA */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <h3 className="font-black text-sm">📋 Bitácora</h3>
            <div className="mt-2 max-h-[220px] overflow-auto rounded-xl bg-black/30 border border-white/10 p-2 text-xs leading-5 font-mono">
              {state.log.map((l, i) => (
                <div key={i} className={i === state.log.length - 1 ? "text-white font-bold" : "text-white/60"}>
                  {l}
                </div>
              ))}
            </div>
            {mensaje && <div className="mt-2 text-xs font-bold text-amber-300">{mensaje}</div>}
            <div className="mt-2 text-[11px] text-white/40">Regla de Oro: si cualquier barra toca 0% o 100% al final del turno, la colonia colapsa. En 15 días gana la más cercana a 50%.</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <h3 className="font-black text-sm">🛰️ Datos reales detrás</h3>
            <div className="mt-2 space-y-2 text-xs leading-4 text-white/70">
              <div className="rounded-xl bg-black/30 border border-white/10 p-2.5">
                <b>DONKI:</b> fulguraciones X/M reales (ccmc.gsfc.nasa.gov/DONKI) — saturan escudo y paneles.
                <a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noreferrer" className="text-violet-300 underline ml-1">
                  abrir →
                </a>
              </div>
              <div className="rounded-xl bg-black/30 border border-white/10 p-2.5">
                <b>LRO / Curiosity:</b> noche lunar 354 h, tormentas marcianas 99% bloqueo — eventos globales.
              </div>
              <div className="rounded-xl bg-black/30 border border-white/10 p-2.5">
                <b>Sello NASA</b> en cada carta: Sabatier 400°C (ISS), regolito vs rayos cósmicos, Kilopower, etc.
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-6 text-center text-xs text-white/30">Misión: Sobrevive al Sol — Prototipo v0.1 fiel al PDF + Manual 0.4 · NASA Space Apps 2026</footer>
    </div>
  );
}

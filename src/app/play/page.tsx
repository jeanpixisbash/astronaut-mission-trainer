"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ATAQUE, SUPERVIVENCIA, EVENTOS_GLOBALES, buildDeckAtaque, buildDeckEventos, buildDeckSupervivencia, type CartaAtaque, type CartaSupervivencia, type EventoGlobal } from "@/lib/cardsCatalog";
import { aplicarCarta, aplicarEventoGlobal, clamp, crearEstadoInicial, debeOcultar, desgasteBase, intercambiar, previewRecursos, verificarColapso, type GameState, type Recursos } from "@/lib/gameEngine";
import WindowView from "@/components/cockpit/WindowView";
import { Hand, META, ResourceStrip } from "@/components/cockpit/TabletCards";
import { sceneFor } from "@/components/cockpit/scene";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type PasoRes = { emoji: string; titulo: string; deltas: Partial<Recursos> };

const FAMILIA_ICON: Record<string, string> = { energia: "⚡", soporte: "💧", biodomo: "🌱", blindaje: "🛡️" };

function SideConsole({ side }: { side: "left" | "right" }) {
  return (
    <div className={`hidden w-24 shrink-0 flex-col gap-2 rounded-2xl border-4 border-[#343b4a] bg-gradient-to-b from-[#2b3242] to-[#171c27] p-2 xl:flex ${side === "left" ? "rounded-r-none border-r-0" : "rounded-l-none border-l-0"}`} aria-hidden>
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={`h-4 rounded-sm ${i % 3 === 0 ? "bg-red-500/70" : i % 3 === 1 ? "bg-emerald-400/70" : "bg-amber-400/70"}`} />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-lg border border-white/10 bg-black/40 p-1.5">
          <div className="h-1.5 rounded bg-cyan-400/60" style={{ width: `${40 + ((i * 37) % 55)}%` }} />
          <div className="mt-1 flex justify-between">
            <span className="size-2 rounded-full bg-white/25" />
            <span className="size-2 rounded-full bg-white/25" />
            <span className="size-2 rounded-full bg-white/25" />
          </div>
        </div>
      ))}
      <div className="mt-auto grid grid-cols-2 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-6 rounded-md border border-white/15 bg-white/5" />
        ))}
      </div>
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
  // P0: resolución por pasos + recap + selección táctil
  const [resol, setResol] = useState<{ pasos: PasoRes[]; vistas: Recursos[]; i: number } | null>(null);
  const [recap, setRecap] = useState<PasoRes[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const seqRef = useRef(0);
  const [needConfirm] = useState(() => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeckSup(shuffle(buildDeckSupervivencia()));
    setDeckRojo(shuffle(buildDeckAtaque()));
    setTimeline(shuffle(buildDeckEventos()).slice(0, 5));
  }, []);

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
  const scene = useMemo(() => sceneFor(eventoHoy, ultimoAtaque, state.dia), [eventoHoy, ultimoAtaque, state.dia]);

  const avanzar = (carta: CartaSupervivencia) => {
    if (state.gameOver || fase !== "planificar" || resol) return;
    if (state.pa < carta.pa) return;

    const pasos: PasoRes[] = [];
    const vistas: Recursos[] = [];
    const seq = ++seqRef.current;

    let next = aplicarCarta(state, carta.impacto, carta.pa, carta.nombre, protocolo);
    pasos.push({ emoji: FAMILIA_ICON[carta.familia] ?? "◉", titulo: carta.nombre, deltas: { ...carta.impacto } });
    vistas.push({ ...next.recursos });

    const ataque = deckRojo[rojoIdx % deckRojo.length];
    if (ataque.id === "interferencia") {
      next = { ...next, ocultarHastaDia: next.dia + 1, log: [...next.log, `🔴 IA: ${ataque.nombre} — ¡telemetría oculta 1 turno!`] };
      pasos.push({ emoji: "👁️", titulo: ataque.nombre, deltas: {} });
      vistas.push({ ...next.recursos });
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
      pasos.push({ emoji: "🔴", titulo: ataque.nombre, deltas: efecto });
      vistas.push({ ...next.recursos });
    }

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
      pasos.push({ emoji: "🌌", titulo: eventoHoy.nombre, deltas: efecto });
      vistas.push({ ...next.recursos });
    }

    const finalizeColapso = (failed: GameState) => {
      if (seqRef.current !== seq) return;
      setState(failed);
      setMensaje(failed.causaDerrota ?? (failed.won ? "¡Victoria!" : "Colapso"));
      setRojoIdx((i) => (i + 1) % deckRojo.length);
      setResol(null);
    };

    const check = verificarColapso(next);
    if (check.gameOver) {
      playSequence(pasos, vistas, seq, () => finalizeColapso(check), ataque);
      return;
    }

    const siguienteDia = check.dia + 1;
    let siguiente: GameState = { ...check, dia: siguienteDia, pa: 3, protocoloActivo: false };
    if (siguienteDia > 1 && siguienteDia <= 15) {
      siguiente = desgasteBase(siguiente);
      pasos.push({ emoji: "😴", titulo: "Desgaste de la noche", deltas: { energia: -5, oxigeno: -5, comida: -5 } });
      vistas.push({ ...siguiente.recursos });
      const check2 = verificarColapso(siguiente);
      if (check2.gameOver) {
        playSequence(pasos, vistas, seq, () => finalizeColapso(check2), ataque);
        return;
      }
      siguiente = check2;
    }

    if (siguienteDia > 15) {
      const final = verificarColapso({ ...siguiente, dia: 15 });
      playSequence(pasos, vistas, seq, () => finalizeColapso(final), ataque);
    } else {
      const go = { ...siguiente };
      playSequence(pasos, vistas, seq, () => {
        if (seqRef.current !== seq) return;
        setState(go);
        setFase("negociar");
        setSegundos(20);
        setHandIdx((i) => (i + 1) % deckSup.length);
        setRojoIdx((i) => (i + 1) % deckRojo.length);
        setProtocolo(false);
        setHoverImpact(null);
        setSel(null);
        setResol(null);
      }, ataque);
    }
  };

  const playSequence = (pasos: PasoRes[], vistas: Recursos[], seq: number, done: () => void, ataque: CartaAtaque) => {
    setUltimoAtaque(ataque);
    setRecap(pasos);
    setSel(null);
    setHoverImpact(null);
    setResol({ pasos, vistas, i: 0 });
    pasos.forEach((_, idx) => {
      setTimeout(() => {
        if (seqRef.current !== seq) return;
        setResol((r) => (r ? { ...r, i: idx + 1 } : r));
      }, 750 * (idx + 1));
    });
    setTimeout(() => {
      if (seqRef.current !== seq) return;
      done();
    }, 750 * pasos.length + 550);
  };

  const hacerTrueque = () => {
    if (fase !== "negociar" || dar === recibir) return;
    const res = intercambiar(state.recursos, dar, 6, recibir, 3);
    if (!res.ok) {
      setMensaje(res.msg);
      return;
    }
    setState((s) => ({ ...s, recursos: res.recursos, log: [...s.log, `🤝 Trueque: ${res.msg}`] }));
    setMensaje(`🤝 ${res.msg}`);
  };

  const saltarNegociacion = () => setFase("planificar");

  const reiniciar = () => {
    seqRef.current++;
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
    setResol(null);
    setRecap([]);
    setSel(null);
  };

  const puedeGuardarProtocolo = state.pa >= 1 && !state.gameOver;
  const proximoAtaque = useMemo(() => deckRojo[rojoIdx % deckRojo.length], [deckRojo, rojoIdx]);

  const jugarCarta = (carta: CartaSupervivencia) => {
    const key = `${carta.id}-${handIdx}`;
    if (needConfirm && sel !== key) {
      setSel(key);
      setHoverImpact(carta.impacto);
      return;
    }
    avanzar(carta);
  };
  const oculto = debeOcultar(state);

  return (
    <div className="min-h-dvh bg-[#05070f] text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070f]/85 backdrop-blur">
        <div className="mx-auto flex h-13 max-w-6xl items-center justify-between gap-2 px-4 py-2">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">◉</span>
            <span className="hidden sm:inline">Sobrevive al Sol</span>
            <span className="sm:hidden">Misión</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">DÍA {Math.min(state.dia, 15)}/15</span>
            <span className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:flex">
              <span className="mr-1 text-xs font-bold">PA</span>
              {[0, 1, 2].map((i) => (
                <span key={i} className={`size-3 rounded-full border ${i < state.pa ? "bg-amber-400 border-amber-500" : "bg-white/10 border-white/20"}`} />
              ))}
            </span>
            <button onClick={reiniciar} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold">
              Reiniciar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-3 pb-8 sm:px-4">
        {/* cockpit */}
        <div className="mt-3 flex items-stretch justify-center gap-0">
          <SideConsole side="left" />
          <div className="min-w-0 flex-1">
            <WindowView scene={scene} shakeKey={`${state.dia}-${ultimoAtaque?.id ?? "none"}`} />

            {/* tablet */}
            <div className="rounded-b-[26px] border-[10px] border-t-0 border-[#343b4a] bg-[#0d1119] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:p-3">
              <div className="flex items-center justify-between gap-2 px-1 pb-2">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${state.gameOver ? (state.won ? "bg-emerald-500 border-emerald-600 text-white" : "bg-red-500 border-red-600 text-white") : "border-white/15 bg-white/5 text-white/80"}`}>
                  {state.gameOver ? (state.won ? "✅ ESTABLE" : `💥 ${state.causaDerrota}`) : resol ? `⏳ ${resol.i >= resol.pasos.length ? "…" : `${resol.pasos[Math.min(resol.i, resol.pasos.length - 1)].emoji} ${resol.pasos[Math.min(resol.i, resol.pasos.length - 1)].titulo}`} (${Math.min(resol.i + 1, resol.pasos.length)}/${resol.pasos.length})` : `● ${fase === "negociar" ? `NEGOCIANDO ${segundos}s` : "ELIGE 1 CARTA"}`}
                </span>
                <button
                  onClick={() => setProtocolo((v) => !v)}
                  disabled={!puedeGuardarProtocolo || fase === "negociar"}
                  className={`rounded-full px-3 py-1 text-[11px] font-black ${protocolo ? "bg-violet-600 text-white" : "bg-white/10 text-white/80"} disabled:opacity-40`}
                >
                  {protocolo ? "🛡️ PROTOCOLO ON" : "🛡️ PROTOCOLO (½ daño)"}
                </button>
              </div>

              <ResourceStrip
                recursos={resol && resol.i > 0 ? resol.vistas[resol.i - 1] : state.recursos}
                oculto={oculto}
                preview={resol ? null : preview}
                flash={resol && resol.i > 0 ? resol.pasos[resol.i - 1].deltas : null}
              />
              {oculto && <div className="pt-1 text-center text-[11px] font-bold text-indigo-300">👁️ Interferencia — porcentajes ocultos este turno</div>}

              {!state.gameOver && !resol && fase === "planificar" && (
                <div className="mt-2 rounded-2xl border border-red-400/50 bg-red-500/15 px-3 py-2 text-xs">
                  <span className="font-black text-red-300">🔭 SE ACERCA: {proximoAtaque.nombre}</span>
                  <span className="ml-2 text-white/70">
                    {Object.entries(proximoAtaque.efectoRival).length === 0
                      ? "ocultará tus % 1 turno"
                      : Object.entries(proximoAtaque.efectoRival).map(([k, v]) => `${v! > 0 ? `+${v}` : v}${META[k as keyof Recursos].icon}`).join(" ")}
                    {" "}· juega escudo o protocolo
                  </span>
                </div>
              )}

              <div className="pt-2">
                <Hand mano={mano} handIdx={handIdx} pa={state.pa} disabled={state.gameOver || fase === "negociar" || resol !== null} selectedKey={sel} onPlay={jugarCarta} onHover={setHoverImpact} />
              </div>
              <p className="px-1 pt-2 text-center text-[11px] text-white/50">
                {needConfirm ? "Tocá una carta para verla · tocá de nuevo para jugarla" : "Toca una carta para jugarla · pasa el mouse para ver ▲▼"} · ninguna carta es 100% buena
              </p>

              <AnimatePresence>
                {fase === "negociar" && !state.gameOver && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    className="mt-2 rounded-2xl border-2 border-amber-400 bg-amber-50 p-3 text-zinc-900"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-black">🤝 NEGOCIACIÓN — {segundos}s</h3>
                      <button onClick={saltarNegociacion} className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-black text-white">
                        Saltar →
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <label className="text-xs font-bold">
                        Doy 6%
                        <select value={dar} onChange={(e) => setDar(e.target.value as keyof Recursos)} className="ml-1 rounded-lg border px-2 py-1">
                          {(Object.keys(META) as (keyof Recursos)[]).map((k) => (
                            <option key={k} value={k}>{META[k].icon} {META[k].label}</option>
                          ))}
                        </select>
                      </label>
                      <span>→</span>
                      <label className="text-xs font-bold">
                        Recibo 3%
                        <select value={recibir} onChange={(e) => setRecibir(e.target.value as keyof Recursos)} className="ml-1 rounded-lg border px-2 py-1">
                          {(Object.keys(META) as (keyof Recursos)[]).map((k) => (
                            <option key={k} value={k}>{META[k].icon} {META[k].label}</option>
                          ))}
                        </select>
                      </label>
                      <button onClick={hacerTrueque} disabled={dar === recibir} className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-black text-black disabled:opacity-40">
                        Trueque 6→3
                      </button>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                      <div className="h-full bg-amber-500 transition-all" style={{ width: `${(segundos / 20) * 100}%` }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {ultimoAtaque && (
                <div className="mt-2 rounded-2xl border border-red-400/50 bg-red-500/15 p-2.5 text-xs">
                  <span className="font-black text-red-300">🔴 CLIMA / IA: {ultimoAtaque.nombre}</span>
                  <span className="ml-2 text-white/70">
                    {Object.entries(ultimoAtaque.efectoRival).length === 0
                      ? "oculta tus % 1 turno"
                      : Object.entries(ultimoAtaque.efectoRival).map(([k, v]) => `${v! > 0 ? `+${v}` : v}${META[k as keyof Recursos].icon}`).join(" ")}
                  </span>
                </div>
              )}

              {state.gameOver && (
                <div className={`mt-2 rounded-2xl border-2 p-4 text-white ${state.won ? "bg-emerald-500 border-emerald-600" : "bg-red-500 border-red-600"}`}>
                  <div className="text-lg font-black">{state.won ? "🎉 ¡Sobreviviste 15 días!" : `💥 ${state.causaDerrota}`}</div>
                  {recap.length > 0 && (
                    <div className="mt-2 rounded-xl bg-black/25 p-2.5">
                      <div className="text-xs font-black tracking-widest opacity-80">📖 ¿QUÉ PASÓ ESTE TURNO?</div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {recap.map((p, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-zinc-900">
                              {p.emoji} {p.titulo}
                            </span>
                            {i < recap.length - 1 && <span className="font-black">→</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={reiniciar} className="mt-2 rounded-full bg-white px-5 py-2 text-sm font-black text-black">
                    Jugar de nuevo
                  </button>
                </div>
              )}
            </div>
          </div>
          <SideConsole side="right" />
        </div>

        {/* debajo: timeline + bitácora */}
        <div className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="text-xs font-black tracking-widest">LÍNEA DE TIEMPO — eventos cada 3 días</div>
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {[3, 6, 9, 12, 15].map((d, i) => {
                const ev = timeline[i];
                const isHoy = state.dia === d;
                return (
                  <div key={d} className={`min-w-[140px] shrink-0 rounded-xl border px-2.5 py-2 ${isHoy ? "bg-amber-400 text-black border-amber-500" : state.dia > d ? "opacity-50 bg-white/5 border-white/10" : "bg-black/30 border-white/10"}`}>
                    <div className="text-xs font-black">DÍA {d}</div>
                    <div className="text-xs font-bold leading-tight">{ev?.nombre ?? "—"}</div>
                    <div className="text-[11px] leading-tight opacity-70 line-clamp-2">{ev?.datoReal}</div>
                  </div>
                );
              })}
            </div>
            {eventoHoy && <div className="mt-2 rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-black">🌌 Hoy: {eventoHoy.nombre} — {eventoHoy.datoReal}</div>}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <h3 className="text-sm font-black">📋 Bitácora</h3>
            <div className="mt-2 max-h-[180px] overflow-auto rounded-xl border border-white/10 bg-black/30 p-2 font-mono text-xs leading-5">
              {state.log.map((l, i) => (
                <div key={i} className={i === state.log.length - 1 ? "font-bold text-white" : "text-white/60"}>{l}</div>
              ))}
            </div>
            {mensaje && <div className="mt-1 text-xs font-bold text-amber-300">{mensaje}</div>}
            <div className="mt-1 text-[11px] text-white/40">Regla de Oro: 0% o 100% = colapso. Gana la más cercana a 50% en el día 15.</div>
          </div>
        </div>
      </main>
    </div>
  );
}

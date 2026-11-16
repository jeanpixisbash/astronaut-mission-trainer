"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ATAQUE, SUPERVIVENCIA, EVENTOS_GLOBALES, buildDeckAtaque, buildDeckEventos, buildDeckSupervivencia, type CartaAtaque, type CartaSupervivencia, type EventoGlobal } from "@/lib/cardsCatalog";
import { aplicarCarta, aplicarEventoGlobal, clamp, crearEstadoInicial, debeOcultar, desgasteBase, intercambiar, previewRecursos, verificarColapso, type GameState, type Recursos } from "@/lib/gameEngine";
import WindowView from "@/components/cockpit/WindowView";
import { Crew, Hand, META, ResourceStrip } from "@/components/cockpit/TabletCards";
import Astronauta, { type Mood } from "@/components/cockpit/Astronauta";
import { sceneFor } from "@/components/cockpit/scene";
import { MISIONES, buildAtaquesFijos, buildDeckFijo, buildTimelineFor, type Mision } from "@/lib/missions";
import {
  ALERTAS,
  BRIEFINGS,
  BRIEFING_DEFAULT,
  EDIFICIO,
  FRACASO_GRACIOSO,
  HOUSTON_CALMA,
  PARCHES,
  REACCION_ATAQUE,
  REACCION_EVENTO,
  RUTINAS,
  enCalma,
  reaccionDesgaste,
  type Alerta,
  type OpcionAlerta,
  type Rutina,
} from "@/lib/historia";
import { loadStars, marcarTutoVisto, saveStar, tutoVisto, loadParches, ganarParche, loadTribu, saveTribu, loadJugadores, saveJugadores, TRIBU_DEFAULT, type Tribu } from "@/lib/progress";
import { isMuted, setMuted, sfx } from "@/lib/sound";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type PasoRes = { emoji: string; titulo: string; detalle: string; houston?: string; deltas: Partial<Recursos> };

const FAMILIA_ICON: Record<string, string> = { energia: "⚡", soporte: "💧", biodomo: "🌱", blindaje: "🛡️" };

function equilibrioDe(r: Recursos): number {
  const vals = Object.values(r) as number[];
  const d = vals.reduce((a, v) => a + Math.abs(v - 50), 0) / vals.length;
  return Math.max(0, Math.min(100, Math.round(100 - d * 2)));
}

function estrellasPara(won: boolean, equi: number): number {
  if (!won) return 0;
  return equi >= 70 ? 3 : equi >= 40 ? 2 : 1;
}

function textoDeltas(deltas: Partial<Recursos>): string {
  const partes = (Object.entries(deltas) as [keyof Recursos, number][]).filter(([, v]) => v !== 0);
  if (partes.length === 0) return "Sin daño directo.";
  return partes.map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${META[k].label}`).join(" · ");
}

function netoPasos(pasos: PasoRes[]): Partial<Recursos> {
  const neto: Partial<Recursos> = {};
  for (const p of pasos) {
    for (const [k, v] of Object.entries(p.deltas) as [keyof Recursos, number][]) {
      neto[k] = (neto[k] ?? 0) + v;
    }
  }
  for (const k of Object.keys(neto) as (keyof Recursos)[]) {
    if (neto[k] === 0) delete neto[k];
  }
  return neto;
}

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
  // P1+P2: misión, estrellas, sonido, tutorial
  const [mision, setMision] = useState<Mision | null>(null);
  const [estrellas, setEstrellas] = useState<Record<string, number>>(() => (typeof window !== "undefined" ? loadStars() : {}));
  const [estrellasGanadas, setEstrellasGanadas] = useState(0);
  const [muted, setMutedState] = useState(() => isMuted());
  const [tutOff, setTutOff] = useState(() => (typeof window !== "undefined" ? tutoVisto() : false));
  const [protocoloUsado, setProtocoloUsado] = useState(false);
  const [truequeUsado, setTruequeUsado] = useState(false);
  const [reforzar, setReforzar] = useState(false);
  const [trueques, setTrueques] = useState(0);
  const [briefing, setBriefing] = useState(false);
  const [houstonMsg, setHoustonMsg] = useState("📡 Houston en línea. ¡Buena suerte!");
  const [rutinaDia, setRutinaDia] = useState<number | null>(null);
  const [alertaActiva, setAlertaActiva] = useState<Alerta | null>(null);
  const alertasRef = useRef<Record<number, string>>({});
  // Diversión infantil: base visible, parches, tribu, red, refuerzos, modo juntos
  const [base, setBase] = useState<string[]>([]);
  const [parches, setParches] = useState<string[]>(() => (typeof window !== "undefined" ? loadParches() : []));
  const [tribu, setTribu] = useState<Tribu>(() => (typeof window !== "undefined" ? loadTribu() : TRIBU_DEFAULT));
  const [jugadores, setJugadores] = useState<string[]>(() => (typeof window !== "undefined" ? loadJugadores() : []));
  const [redUsada, setRedUsada] = useState(false);
  const redRef = useRef(false);
  const [refuerzos, setRefuerzos] = useState(0);

  const darParche = (id: string) => {
    if (typeof window === "undefined") return;
    if (loadParches().includes(id)) return;
    const nombre = PARCHES.find((p) => p.id === id)?.nombre ?? id;
    setParches(ganarParche(id));
    setHoustonMsg(`📡 🎖️ ¡Parche desbloqueado: ${nombre}!`);
    sfx.pop();
  };

  /** 🪂 Red Houston: 1× por partida, rescata lo que tocó 0 (el exceso 100% sí mata). */
  const intentarRed = (failed: GameState): GameState => {
    if (failed.gameOver && !failed.won && !redRef.current && (Object.values(failed.recursos) as number[]).some((v) => v <= 0)) {
      const r = { ...failed.recursos };
      (Object.keys(r) as (keyof Recursos)[]).forEach((k) => {
        if (r[k] <= 0) r[k] = 12;
      });
      redRef.current = true;
      setRedUsada(true);
      setHoustonMsg("📡 ¡Te lancé mi paracaídas! ¡Era el único que tenía!");
      sfx.pop();
      return { ...failed, recursos: r, gameOver: false, causaDerrota: undefined, log: [...failed.log, "🪂 ¡Red Houston! +12 a lo que estaba en 0. ¡Solo había una!"] };
    }
    return failed;
  };

  /** 2 sorpresas por partida (misiones de 6+ días): días al azar, fuera de eventos globales. */
  const programarAlertas = (maxDias: number): Record<number, string> => {
    if (maxDias < 6) return {};
    const elegibles: number[] = [];
    for (let d = 2; d <= maxDias - 1; d++) {
      if (d % 3 !== 0) elegibles.push(d);
    }
    const dias = shuffle(elegibles).slice(0, 2);
    const orden = shuffle([...ALERTAS]);
    const prog: Record<number, string> = {};
    dias.forEach((d, i) => {
      prog[d] = orden[i % orden.length].id;
    });
    return prog;
  };

  const revisarAlerta = (dia: number) => {
    const id = alertasRef.current[dia];
    if (!id) return;
    const resto: Record<number, string> = {};
    for (const k of Object.keys(alertasRef.current)) {
      const n = Number(k);
      if (n !== dia) resto[n] = alertasRef.current[n];
    }
    alertasRef.current = resto;
    const alerta = ALERTAS.find((a) => a.id === id) ?? null;
    if (alerta) {
      sfx.alarm();
      setAlertaActiva(alerta);
      setHoustonMsg(`📡 🚨 ¡Emergencia! ${alerta.titulo}`);
    }
  };
  const [debrief, setDebrief] = useState<{ pasos: PasoRes[]; resultado: "sigue" | "gana" | "pierde" } | null>(null);
  const doneRef = useRef<(() => void) | null>(null);
  const activeSeqRef = useRef(0);
  const resultadoRef = useRef<"sigue" | "gana" | "pierde">("sigue");

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
      revisarAlerta(state.dia);
      return;
    }
    const t = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, segundos, state.gameOver]);

  const mano = useMemo(() => {
    const out: CartaSupervivencia[] = [];
    for (let i = 0; i < 3; i++) out.push(deckSup[(handIdx + i) % deckSup.length]);
    // Tutorial: día 1 solo 2 cartas
    return state.dia === 1 ? out.slice(0, 2) : out;
  }, [deckSup, handIdx, state.dia]);

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
    if (protocolo) setProtocoloUsado(true);

    const pasos: PasoRes[] = [];
    const vistas: Recursos[] = [];
    const seq = ++seqRef.current;

    // Refuerzo estilo Arkham (comprometer a la prueba): +1 PA → +10 al mayor beneficio
    let impacto: Partial<Recursos> = { ...carta.impacto };
    let coste = carta.pa;
    let etiqueta = carta.nombre;
    const usoRefuerzo = reforzar && state.pa >= carta.pa + 1;
    if (usoRefuerzo) {
      const mejor = (Object.entries(impacto) as [keyof Recursos, number][]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])[0];
      if (mejor) {
        impacto = { ...impacto, [mejor[0]]: mejor[1] + 10 };
        coste += 1;
        etiqueta += " ⚡";
      }
    }
    if (usoRefuerzo) {
      const n = refuerzos + 1;
      setRefuerzos(n);
      if (n >= 3) darParche("refuerzos");
    }
    setBase((b) => [...b, carta.id]);

    let next = aplicarCarta(state, impacto, coste, etiqueta, protocolo);
    pasos.push({ emoji: FAMILIA_ICON[carta.familia] ?? "◉", titulo: etiqueta, detalle: carta.explicacion, deltas: { ...impacto } });
    vistas.push({ ...next.recursos });

    const ataque = deckRojo[rojoIdx % deckRojo.length];
    if (ataque.id === "interferencia") {
      next = { ...next, ocultarHastaDia: next.dia + 1, log: [...next.log, `🔴 IA: ${ataque.nombre} — ¡telemetría oculta 1 turno!`] };
      pasos.push({ emoji: "👁️", titulo: ataque.nombre, detalle: ataque.explicacion, houston: REACCION_ATAQUE[ataque.id], deltas: {} });
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
      pasos.push({ emoji: "🔴", titulo: ataque.nombre, detalle: ataque.explicacion, houston: REACCION_ATAQUE[ataque.id] ?? "¡Oh no! ¡Algo golpea la colonia!", deltas: efecto });
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
      if (eventoHoy.id === "conjuncion-solar") {
        next = { ...next, ocultarHastaDia: next.dia + 1, log: [...next.log, `🌌 Evento global: ${eventoHoy.nombre} — ¡radio muerta 1 turno!`] };
      }
      if (Object.keys(efecto).length) next = aplicarEventoGlobal(next, efecto, eventoHoy.nombre);
      pasos.push({ emoji: eventoHoy.id === "conjuncion-solar" ? "👁️" : "🌌", titulo: eventoHoy.nombre, detalle: eventoHoy.explicacion, houston: REACCION_EVENTO[eventoHoy.id] ?? "¡Oh no! ¡El espacio ataca!", deltas: efecto });
      vistas.push({ ...next.recursos });
    }

    const finalizeColapso = (failed: GameState) => {
      if (seqRef.current !== seq) return;
      const equi = equilibrioDe(failed.recursos);
      const stars = estrellasPara(failed.won, equi);
      setEstrellasGanadas(stars);
      if (mision && stars > 0) setEstrellas(saveStar(mision.id, stars));
      if (failed.won && mision?.id === "m0") darParche("graduado");
      if (failed.won && mision?.id === "m3") darParche("veterano");
      if (failed.won && equi >= 85) darParche("equilibrista");
      if (failed.won) sfx.win();
      else sfx.lose();
      const quien = mision ? `¡Misión cumplida, ${tribu.colonia}!` : "¡Misión cumplida!";
      setHoustonMsg(failed.won ? `📡 ${quien} Houston aplaude. 👏` : `📡 Houston… ¿${tribu.colonia}, me copias?… Inténtalo de nuevo. 💔`);
      setState(failed);
      setMensaje(failed.causaDerrota ?? (failed.won ? "¡Victoria!" : "Colapso"));
      setRojoIdx((i) => (i + 1) % deckRojo.length);
      setResol(null);
    };

    const check = intentarRed(verificarColapso(next));
    if (check.gameOver) {
      playSequence(pasos, vistas, seq, () => finalizeColapso(check), ataque, check.won ? "gana" : "pierde");
      return;
    }

    const siguienteDia = check.dia + 1;
    let siguiente: GameState = { ...check, dia: siguienteDia, pa: 3, protocoloActivo: false };
    if (siguienteDia > 1 && siguienteDia <= check.maxDias) {
      siguiente = desgasteBase(siguiente);
      const vals = Object.entries(siguiente.recursos) as [keyof Recursos, number][];
      const peor = [...vals].sort((a, b) => a[1] - b[1])[0];
      pasos.push({
        emoji: "😴",
        titulo: "Desgaste de la noche",
        detalle: "La tripulación respira, bebe y come: la base gasta sola cada noche.",
        houston: peor[1] <= 25 ? reaccionDesgaste(peor[0]) : undefined,
        deltas: { energia: -5, oxigeno: -5, comida: -5 },
      });
      vistas.push({ ...siguiente.recursos });
      const check2 = intentarRed(verificarColapso(siguiente));
      if (check2.gameOver) {
        playSequence(pasos, vistas, seq, () => finalizeColapso(check2), ataque, "pierde");
        return;
      }
      siguiente = check2;
    }

    if (siguienteDia > check.maxDias) {
      const final = intentarRed(verificarColapso({ ...siguiente, dia: check.maxDias }));
      playSequence(pasos, vistas, seq, () => finalizeColapso(final), ataque, final.won ? "gana" : "pierde");
    } else {
      const go = { ...siguiente };
      playSequence(pasos, vistas, seq, () => {
        if (seqRef.current !== seq) return;
        setState(go);
        if (eventoHoy?.id === "noche-lunar") darParche("noche");
        if (eventoHoy?.id === "fulguracion-x") darParche("cazatormentas");
        if (go.recursos.escudo >= 80) darParche("muralla");
        // Houston comenta el nuevo día
        const valsGo = Object.values(go.recursos) as number[];
        const minGo = Math.min(...valsGo);
        if (minGo <= 20) {
          const entriesGo = Object.entries(go.recursos) as [keyof Recursos, number][];
          const peorGo = entriesGo.sort((a, b) => a[1] - b[1])[0][0];
          setHoustonMsg(`📡 ${reaccionDesgaste(peorGo)}`);
        } else if (enCalma(go.recursos)) {
          setHoustonMsg(`📡 ${HOUSTON_CALMA[go.dia % HOUSTON_CALMA.length]}`);
        } else {
          setHoustonMsg(`📡 Día ${go.dia}. Houston vigila.`);
        }
        // Tutorial: negociación recién desde el día 3
        if (go.dia >= 3) {
          setFase("negociar");
          setSegundos(20);
          setTrueques(0);
        }
        if (Math.min(...(Object.values(go.recursos) as number[])) <= 20) sfx.alarm();
        setHandIdx((i) => (i + 1) % deckSup.length);
        setRojoIdx((i) => (i + 1) % deckRojo.length);
        setProtocolo(false);
        setHoverImpact(null);
        setSel(null);
        setResol(null);
      }, ataque, "sigue");
    }
  };

  const playSequence = (pasos: PasoRes[], vistas: Recursos[], seq: number, done: () => void, ataque: CartaAtaque, resultado: "sigue" | "gana" | "pierde") => {
    setUltimoAtaque(ataque);
    setRecap(pasos);
    setSel(null);
    setHoverImpact(null);
    setReforzar(false);
    doneRef.current = done;
    activeSeqRef.current = seq;
    resultadoRef.current = resultado;
    setResol({ pasos, vistas, i: 0 });
  };

  // Resolución manual paso a paso (estilo mesa): el jugador avanza cuando termina de leer.
  // Al final no se aplica nada todavía: primero el astronauta explica (debrief).
  const avanzarPaso = () => {
    if (!resol || seqRef.current !== activeSeqRef.current) return;
    if (resol.i < resol.pasos.length) {
      sfx.click();
      const net = (Object.values(resol.pasos[resol.i].deltas) as number[]).reduce((a, v) => a + v, 0);
      if (net > 0) sfx.pop();
      else if (net < 0) sfx.hit();
      setResol({ ...resol, i: resol.i + 1 });
    } else if (!debrief) {
      sfx.click();
      setDebrief({ pasos: resol.pasos, resultado: resultadoRef.current });
    }
  };

  const cerrarDebrief = () => {
    sfx.click();
    const d = doneRef.current;
    doneRef.current = null;
    setDebrief(null);
    d?.();
  };

  const hacerTrueque = () => {
    if (fase !== "negociar" || dar === recibir) return;
    // Radio limitada estilo La Tripulación: 2 mensajes por negociación
    if (trueques >= 2) {
      setMensaje("📻 La radio solo da para 2 mensajes por negociación");
      return;
    }
    const res = intercambiar(state.recursos, dar, 6, recibir, 3);
    if (!res.ok) {
      setMensaje(res.msg);
      return;
    }
    setState((s) => ({ ...s, recursos: res.recursos, log: [...s.log, `🤝 Trueque: ${res.msg}`] }));
    setMensaje(`🤝 ${res.msg}`);
    setTruequeUsado(true);
    setTrueques((t) => t + 1);
  };

  const elegirOpcionAlerta = (alerta: Alerta, op: OpcionAlerta) => {
    if (state.gameOver) return;
    sfx.click();
    const recursos = { ...state.recursos };
    for (const k of Object.keys(op.efecto) as (keyof Recursos)[]) {
      recursos[k] = clamp(recursos[k] + (op.efecto[k] ?? 0));
    }
    const ns: GameState = { ...state, recursos, log: [...state.log, `🚨 Alerta: ${alerta.titulo} → ${op.nombre}`] };
    setAlertaActiva(null);
    const net = (Object.values(op.efecto) as number[]).reduce((a, v) => a + v, 0);
    if (net > 0) sfx.pop();
    else if (net < 0) sfx.hit();
    const check = intentarRed(verificarColapso(ns));
    if (check.gameOver) {
      const equi = equilibrioDe(check.recursos);
      const stars = estrellasPara(check.won, equi);
      setEstrellasGanadas(stars);
      if (mision && stars > 0) setEstrellas(saveStar(mision.id, stars));
      if (check.won) sfx.win();
      else sfx.lose();
      setHoustonMsg(check.won ? `📡 ¡Misión cumplida, ${tribu.colonia}! Houston aplaude. 👏` : `📡 Houston… ¿${tribu.colonia}, me copias?… Inténtalo de nuevo. 💔`);
      setState(check);
      setMensaje(check.causaDerrota ?? "Colapso");
      return;
    }
    setState(check);
    setHoustonMsg(`📡 ¡Bien decidido! ${op.explicacion}`);
    darParche("sangre");
  };

  const hacerRutina = (r: Rutina) => {
    if (fase !== "planificar" || resol || state.gameOver) return;
    if (rutinaDia === state.dia || !enCalma(state.recursos)) return;
    sfx.click();
    const recursos = { ...state.recursos };
    for (const k of Object.keys(r.efecto) as (keyof Recursos)[]) {
      recursos[k] = clamp(recursos[k] + (r.efecto[k] ?? 0));
    }
    const que = Object.entries(r.efecto)
      .map(([k, v]) => `+${v} ${k}`)
      .join(" ");
    setState((s) => ({ ...s, recursos, log: [...s.log, `📋 Rutina: ${r.nombre} (${que})`] }));
    setRutinaDia(state.dia);
    setHoustonMsg(`📡 ¡Buen mantenimiento! ${r.texto}`);
    sfx.pop();
  };

  const saltarNegociacion = () => {
    setFase("planificar");
    revisarAlerta(state.dia);
  };

  const iniciar = (m: Mision) => {
    seqRef.current++;
    sfx.click();
    setMision(m);
    // Veteranía estilo campaña Arkham: ganar la anterior da +5 en tu barra más baja
    const idx = MISIONES.findIndex((x) => x.id === m.id);
    let st = crearEstadoInicial(m.dias);
    if (idx > 0 && (estrellas[MISIONES[idx - 1].id] ?? 0) > 0) {
      const entries = Object.entries(st.recursos) as [keyof Recursos, number][];
      const masBaja = entries.sort((a, b) => a[1] - b[1])[0][0];
      st = { ...st, recursos: { ...st.recursos, [masBaja]: clamp(st.recursos[masBaja] + 5) } };
      st = { ...st, log: [...st.log, `🎖️ Veteranía: +5 ${masBaja} por ganar ${MISIONES[idx - 1].nombre}.`] };
    }
    setState(st);
    setDeckSup(m.guion ? buildDeckFijo(m.guion) : shuffle(buildDeckSupervivencia()));
    setDeckRojo(m.ataques ? buildAtaquesFijos(m.ataques) : shuffle(buildDeckAtaque()));
    setTimeline(buildTimelineFor(m, shuffle(buildDeckEventos())));
    alertasRef.current = programarAlertas(m.dias);
    setAlertaActiva(null);
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
    setDebrief(null);
    setSel(null);
    setEstrellasGanadas(0);
    setProtocoloUsado(false);
    setTruequeUsado(false);
    setReforzar(false);
    setTrueques(0);
    setBriefing(true);
    setHoustonMsg("📡 Houston en línea. ¡Buena suerte!");
    setRutinaDia(null);
    setBase([]);
    setRedUsada(false);
    redRef.current = false;
    setRefuerzos(0);
    doneRef.current = null;
  };

  const reiniciar = () => {
    seqRef.current++;
    const dias = mision?.dias ?? 15;
    setState(crearEstadoInicial(dias));
    setDeckSup(mision?.guion ? buildDeckFijo(mision.guion) : shuffle(buildDeckSupervivencia()));
    setDeckRojo(mision?.ataques ? buildAtaquesFijos(mision.ataques) : shuffle(buildDeckAtaque()));
    setTimeline(mision ? buildTimelineFor(mision, shuffle(buildDeckEventos())) : shuffle(buildDeckEventos()).slice(0, 5));
    alertasRef.current = programarAlertas(dias);
    setAlertaActiva(null);
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
    setDebrief(null);
    setSel(null);
    setEstrellasGanadas(0);
    setProtocoloUsado(false);
    setTruequeUsado(false);
    setReforzar(false);
    setTrueques(0);
    setBriefing(true);
    setHoustonMsg("📡 Houston en línea. ¡Buena suerte!");
    setRutinaDia(null);
    setBase([]);
    setRedUsada(false);
    redRef.current = false;
    setRefuerzos(0);
    doneRef.current = null;
  };

  const cambiarMision = () => {
    seqRef.current++;
    doneRef.current = null;
    setAlertaActiva(null);
    setMision(null);
    setResol(null);
    setRecap([]);
    setDebrief(null);
    setSel(null);
    setMensaje(null);
    setUltimoAtaque(null);
    setFase("planificar");
  };

  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    setMutedState(m);
    if (!m) sfx.click();
  };

  // Música ambient: loop suave atada al mute (CC BY 4.0 Kevin MacLeod).
  // Vive en un ref: una sola instancia, nace al primer gesto (autoplay policy).
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  useEffect(() => {
    const audio = new Audio("/audio/ambient-espacio.mp3");
    audio.loop = true;
    audio.volume = 0.28;
    audioRef.current = audio;
    const unlock = () => {
      if (!mutedRef.current) audio.play().catch(() => undefined);
      else audio.pause();
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) audio.pause();
    else audio.play().catch(() => undefined);
  }, [muted]);

  const protocoloBloqueado = state.dia < 3;
  const puedeGuardarProtocolo = state.pa >= 1 && !state.gameOver && !protocoloBloqueado;
  const proximoAtaque = useMemo(() => deckRojo[rojoIdx % deckRojo.length], [deckRojo, rojoIdx]);
  const vistaActual = resol && resol.i > 0 ? resol.vistas[resol.i - 1] : state.recursos;
  const mood: Mood = state.gameOver
    ? state.won
      ? "campeon"
      : "triste"
    : Math.min(...(Object.values(vistaActual) as number[])) <= 25
      ? "preocupado"
      : "feliz";
  const pasoActual = resol && resol.i > 0 ? resol.pasos[resol.i - 1] : null;
  const selCarta = sel ? (mano.find((c) => `${c.id}-${handIdx}` === sel) ?? null) : null;
  const chiste = FRACASO_GRACIOSO[(state.causaDerrota?.length ?? 0) % FRACASO_GRACIOSO.length];
  const turnoDe = jugadores.length > 0 ? jugadores[(state.dia - 1) % jugadores.length] : null;
  const refuerzoMax = selCarta ? Math.max(0, ...(Object.values(selCarta.impacto) as number[])) : 0;
  const equi = equilibrioDe(vistaActual);
  const equiColor = equi >= 70 ? "text-emerald-300" : equi >= 40 ? "text-amber-300" : "text-red-300";

  const jugarCarta = (carta: CartaSupervivencia) => {
    const key = `${carta.id}-${handIdx}`;
    if (needConfirm && sel !== key) {
      sfx.click();
      setSel(key);
      setHoverImpact(carta.impacto);
      return;
    }
    sfx.click();
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
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">DÍA {Math.min(state.dia, state.maxDias)}/{state.maxDias}</span>
            <span className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:flex">
              <span className="mr-1 text-xs font-bold">PA</span>
              {[0, 1, 2].map((i) => (
                <span key={i} className={`size-3 rounded-full border ${i < state.pa ? "bg-amber-400 border-amber-500" : "bg-white/10 border-white/20"}`} />
              ))}
            </span>
            <button onClick={toggleMute} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold" title={muted ? "Activar sonido" : "Silenciar"}>
              {muted ? "🔇" : "🔊"}
            </button>
            <button onClick={reiniciar} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold">
              Reiniciar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-3 pb-8 sm:px-4">
        {/* selector de misión */}
        <AnimatePresence>
          {mision === null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            >
              <div className="w-full max-w-2xl rounded-[24px] border-4 border-[#343b4a] bg-[#0d1119] p-4 sm:p-6">
                <h2 className="text-center text-xl font-black">🚀 ELIGE TU MISIÓN</h2>
                <p className="mt-1 text-center text-xs text-white/60">Gana una para desbloquear la siguiente. Las estrellas premian el equilibrio.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {MISIONES.map((m, i) => {
                    const desbloqueada = i === 0 || (estrellas[MISIONES[i - 1].id] ?? 0) > 0 || (estrellas[m.id] ?? 0) > 0;
                    const ms = estrellas[m.id] ?? 0;
                    return (
                      <button
                        key={m.id}
                        onClick={() => desbloqueada && iniciar(m)}
                        disabled={!desbloqueada}
                        className={`rounded-2xl border-2 p-3 text-left transition ${desbloqueada ? "border-amber-400 bg-white text-zinc-900 hover:scale-[1.03]" : "border-white/10 bg-white/5 text-white/40"}`}
                      >
                        <div className="text-3xl">{desbloqueada ? m.emoji : "🔒"}</div>
                        <div className="mt-1 font-black">{m.nombre}</div>
                        <div className="text-xs font-bold opacity-70">{m.dias} días</div>
                        <div className="mt-1 text-[11px] leading-tight opacity-80">{m.descripcion}</div>
                        <div className="mt-1 text-[11px] leading-tight opacity-80">{m.objetivo}</div>
                        <div className="mt-2 text-sm tracking-widest">
                          {[0, 1, 2].map((s) => (
                            <span key={s} className={s < ms ? "text-amber-500" : "text-zinc-300"}>★</span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {/* mi tripulación + modo juntos */}
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs font-black tracking-widest text-white/60">✏️ MI TRIPULACIÓN</div>
                    <label className="mt-2 block text-xs font-bold text-white/70">
                      Colonia
                      <input
                        value={tribu.colonia}
                        onChange={(e) => {
                          const t = { ...tribu, colonia: e.target.value.slice(0, 16) || "Aurora" };
                          setTribu(t);
                          saveTribu(t);
                        }}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white outline-none"
                      />
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {tribu.crew.map((n, i) => (
                        <label key={i} className="block text-xs font-bold text-white/70">
                          Astro {i + 1}
                          <input
                            value={n}
                            onChange={(e) => {
                              const crew = [...tribu.crew] as [string, string, string];
                              crew[i] = e.target.value.slice(0, 10) || TRIBU_DEFAULT.crew[i];
                              const t = { ...tribu, crew };
                              setTribu(t);
                              saveTribu(t);
                            }}
                            className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white outline-none"
                          />
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-bold text-white/70">Traje:</span>
                      {["#22d3ee", "#f472b6", "#a3e635", "#fbbf24"].map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            const t = { ...tribu, color: c };
                            setTribu(t);
                            saveTribu(t);
                            sfx.click();
                          }}
                          className={`size-6 rounded-full border-2 ${tribu.color === c ? "border-white" : "border-transparent"}`}
                          style={{ background: c }}
                          aria-label={`Traje ${c}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs font-black tracking-widest text-white/60">👥 MODO JUNTOS (OPCIONAL)</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">Turnos por día, hot-seat. Uno juega cada día.</p>
                    <input
                      defaultValue={jugadores.join(", ")}
                      onBlur={(e) => {
                        const arr = e.target.value.split(",").map((s) => s.trim().slice(0, 10)).filter(Boolean).slice(0, 4);
                        setJugadores(arr);
                        saveJugadores(arr);
                      }}
                      placeholder="Nombres separados por coma"
                      className="mt-2 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white outline-none placeholder:text-white/25"
                    />
                    {jugadores.length > 0 && (
                      <button
                        onClick={() => {
                          setJugadores([]);
                          saveJugadores([]);
                        }}
                        className="mt-2 text-[11px] font-bold text-white/50 underline"
                      >
                        Quitar modo juntos ({jugadores.join(" · ")})
                      </button>
                    )}
                  </div>
                </div>
                {/* álbum de parches */}
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs font-black tracking-widest text-white/60">
                    🎖️ MIS PARCHES ({parches.length}/{PARCHES.length})
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                    {PARCHES.map((p) => {
                      const tiene = parches.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          title={tiene ? `${p.nombre}: ${p.como}` : `🔒 ${p.nombre}: ${p.como}`}
                          className={`rounded-xl border px-1 py-2 text-center ${tiene ? "border-amber-400 bg-amber-400/15" : "border-white/10 bg-black/30 opacity-45"}`}
                        >
                          <div className="text-2xl">{tiene ? p.emoji : "🔒"}</div>
                          <div className="mt-0.5 text-[9px] font-black leading-tight">{p.nombre}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* debrief: el astronauta explica qué pasó, en grande */}
        <AnimatePresence>
          {debrief && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            >
              <div className="w-full max-w-md rounded-[24px] border-4 border-amber-400 bg-[#0d1119] p-5 text-center">
                <div className="flex justify-center">
                  <Astronauta
                    mood={debrief.resultado === "pierde" ? "triste" : debrief.resultado === "gana" ? "campeon" : "feliz"}
                    size={96}
                  />
                </div>
                <h2 className="mt-2 text-xl font-black">
                  {debrief.resultado === "pierde" ? "💥 ¡OH NO! ¿QUÉ PASÓ?" : debrief.resultado === "gana" ? "🎉 ¡ÚLTIMO DÍA! ¿QUÉ PASÓ?" : "🧑‍🚀 ¿QUÉ PASÓ?"}
                </h2>
                <div className="mt-3 space-y-2 text-left">
                  {debrief.pasos.map((p, i) => (
                    <div key={i} className="rounded-xl bg-white/5 px-3 py-2">
                      <div className="text-sm font-black">
                        {p.emoji} {p.titulo}
                      </div>
                      <div className="text-sm leading-5 text-white/80">{textoDeltas(p.deltas)}</div>
                    </div>
                  ))}
                </div>
                {(() => {
                  const neto = netoPasos(debrief.pasos);
                  const entradas = Object.entries(neto) as [keyof Recursos, number][];
                  if (entradas.length === 0) return null;
                  return (
                    <div className="mt-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                      <div className="text-[11px] font-black tracking-widest text-white/55">📊 TOTAL DEL DÍA</div>
                      <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                        {entradas.map(([k, v]) => (
                          <span key={k} className={`rounded-full px-2.5 py-1 text-sm font-black text-white ${v > 0 ? "bg-emerald-500" : "bg-red-500"}`}>
                            {v > 0 ? `+${v}` : v} {META[k].icon} {META[k].label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <button
                  onClick={cerrarDebrief}
                  className="mt-4 w-full rounded-full bg-white py-3 text-base font-black text-black active:scale-[0.98]"
                >
                  ¡Entendido! →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* alerta sorpresa: el astronauta interrumpe y explica las opciones */}
        <AnimatePresence>
          {alertaActiva && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            >
              <div className="w-full max-w-md rounded-[24px] border-4 border-red-500 bg-[#0d1119] p-5 text-center">
                <div className="flex justify-center">
                  <Astronauta mood="preocupado" size={88} />
                </div>
                <h2 className="mt-2 text-xl font-black">
                  {alertaActiva.emoji} ¡EMERGENCIA! {alertaActiva.titulo}
                </h2>
                <p className="mt-2 rounded-xl bg-white/5 px-3 py-2 text-sm leading-5 text-white/85">
                  📡 {alertaActiva.historia}
                </p>
                <div className="mt-2 text-[11px] font-black tracking-widest text-white/55">
                  HOUSTON TE EXPLICA: NO HAY MALAS, SOLO DISTINTAS
                </div>
                <div className="mt-2 space-y-2 text-left">
                  {alertaActiva.opciones.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => elegirOpcionAlerta(alertaActiva, op)}
                      className="w-full rounded-2xl border-2 border-white/15 bg-white p-3 text-left text-zinc-900 transition hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black">
                          {op.emoji} {op.nombre}
                        </span>
                        <span className="flex gap-1">
                          {Object.entries(op.efecto).map(([k, v]) => (
                            <span key={k} className={`rounded-full px-2 py-0.5 text-xs font-black text-white ${v! > 0 ? "bg-emerald-600" : "bg-red-600"}`}>
                              {v! > 0 ? `+${v}` : v}
                              {META[k as keyof Recursos].icon}
                            </span>
                          ))}
                        </span>
                      </div>
                      <div className="mt-1 text-xs leading-4 text-zinc-600">📡 {op.explicacion}</div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-white/40">Lee tranquilo, la emergencia te espera</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* cockpit */}
        <div className="mt-3 flex items-stretch justify-center gap-0">
          <SideConsole side="left" />
          <div className="min-w-0 flex-1">
            <WindowView scene={scene} shakeKey={`${state.dia}-${ultimoAtaque?.id ?? "none"}`} />

            {/* base visible: cada carta planta su edificio */}
            {base.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto border-x-[10px] border-[#343b4a] bg-[#0b0e17] px-3 py-1.5">
                <span className="shrink-0 text-[10px] font-black tracking-widest text-white/50">🏠 MI BASE</span>
                {base.slice(-18).map((id, i) => (
                  <span key={`${id}-${i}`} className="shrink-0 text-xl" title={id}>
                    {EDIFICIO[id] ?? "🏕️"}
                  </span>
                ))}
              </div>
            )}

            {/* feed Houston con astronauta */}
            {mision && (
              <div className="flex items-center gap-2 border-x-[10px] border-[#343b4a] bg-[#10141f] px-3 py-1.5">
                <Astronauta mood={mood} size={44} color={tribu.color} />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={houstonMsg}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-1 text-xs font-bold leading-4 text-cyan-200"
                  >
                    {houstonMsg}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* briefing Houston */}
            <AnimatePresence>
              {briefing && mision && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                >
                  <div className="w-full max-w-md rounded-[24px] border-4 border-cyan-400 bg-[#0d1119] p-5 text-center">
                    <div className="flex justify-center">
                      <Astronauta mood="feliz" size={88} color={tribu.color} />
                    </div>
                    <h2 className="mt-2 text-lg font-black">{(BRIEFINGS[mision.id] ?? BRIEFING_DEFAULT).titulo}</h2>
                    <div className="mt-3 space-y-2">
                      {(BRIEFINGS[mision.id] ?? BRIEFING_DEFAULT).lineas.map((l, i) => (
                        <p key={i} className="rounded-xl bg-white/5 px-3 py-2 text-sm leading-5 text-white/85">{l}</p>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        sfx.click();
                        setBriefing(false);
                      }}
                      className="mt-4 w-full rounded-full bg-cyan-400 py-2.5 text-sm font-black text-black active:scale-[0.98]"
                    >
                      ¡Entendido, Houston! 🚀
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* tablet */}
            <div className="rounded-b-[26px] border-[10px] border-t-0 border-[#343b4a] bg-[#0d1119] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:p-3">
              <div className="flex items-center justify-between gap-2 px-1 pb-2">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${state.gameOver ? (state.won ? "bg-emerald-500 border-emerald-600 text-white" : "bg-red-500 border-red-600 text-white") : "border-white/15 bg-white/5 text-white/80"}`}>
                  {state.gameOver ? (state.won ? "✅ ESTABLE" : `💥 ${state.causaDerrota}`) : resol ? `⏳ ${resol.i >= resol.pasos.length ? "…" : `${resol.pasos[Math.min(resol.i, resol.pasos.length - 1)].emoji} ${resol.pasos[Math.min(resol.i, resol.pasos.length - 1)].titulo}`} (${Math.min(resol.i + 1, resol.pasos.length)}/${resol.pasos.length})` : `● ${fase === "negociar" ? `NEGOCIANDO ${segundos}s` : "ELIGE 1 CARTA"}`}
                </span>
                <span className={`rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-black ${equiColor}`} title="Cercanía a 50% en las 4 barras">
                  ⚖️ {equi}%
                </span>
                {redUsada && (
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-black text-white/50" title="Houston ya te salvó una vez">
                    🪂 RED USADA
                  </span>
                )}
                {turnoDe && !state.gameOver && (
                  <span className="rounded-full border border-cyan-400/40 bg-cyan-400/15 px-2.5 py-1 text-[11px] font-black text-cyan-200">
                    👥 Turno de {turnoDe}
                  </span>
                )}
                <button
                  onClick={() => setProtocolo((v) => !v)}
                  disabled={!puedeGuardarProtocolo || fase === "negociar"}
                  className={`rounded-full px-3 py-1 text-[11px] font-black ${protocolo ? "bg-violet-600 text-white" : "bg-white/10 text-white/80"} disabled:opacity-40`}
                  title="Guardas 1 acción sin gastar: todo el daño que recibas este turno se parte a la mitad"
                >
                  {protocoloBloqueado ? "🔒 ¡A CUBIERTO! (DÍA 3)" : protocolo ? "🛡️ ¡A CUBIERTO! ON" : "🛡️ ¡A CUBIERTO! (½ daño)"}
                </button>
              </div>
              {mision && !state.gameOver && (
                <div className="px-1 pb-1 text-[11px] font-bold text-white/55">🎯 {mision.nombre}: {mision.objetivo}</div>
              )}

              <Crew recursos={vistaActual} nombres={tribu.crew} />

              {mision?.id === "m0" && !state.gameOver && (
                <div className="mt-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2">
                  <div className="text-[10px] font-black tracking-widest text-white/50">🎓 LISTA DE ENTRENAMIENTO</div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
                    <span className={state.dia > 1 ? "text-emerald-300" : "text-white/60"}>{state.dia > 1 ? "✅" : "⭕"} Juega una carta</span>
                    <span className={state.dia > 2 ? "text-emerald-300" : "text-white/60"}>{state.dia > 2 ? "✅" : "⭕"} Sobrevive al ataque rojo</span>
                    <span className={protocoloUsado || truequeUsado || state.dia > 3 ? "text-emerald-300" : "text-white/60"}>
                      {protocoloUsado || truequeUsado || state.dia > 3 ? "✅" : "⭕"} Protégete (¡a cubierto! o trueque)
                    </span>
                  </div>
                </div>
              )}
              {state.dia === 1 && fase === "planificar" && !resol && !state.gameOver && mision && (
                <div className="animate-bounce pt-1 text-center text-2xl" aria-hidden>👇</div>
              )}
              <AnimatePresence>
                {pasoActual && (
                  <motion.div
                    key={`${state.dia}-${resol?.i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1.5 flex items-center gap-3 rounded-2xl border-2 border-white/20 bg-white/[0.07] p-3"
                  >
                    <Astronauta
                      mood={
                        Object.keys(pasoActual.deltas).length === 0 ||
                        (Object.values(pasoActual.deltas) as number[]).reduce((a, v) => a + v, 0) < 0
                          ? "preocupado"
                          : "feliz"
                      }
                      size={68}
                    />
                    <div className="min-w-0 flex-1 text-left">
                      <div className="text-base font-black leading-5">
                        {pasoActual.emoji} {pasoActual.titulo}
                      </div>
                      <div className="mt-0.5 text-sm leading-5 text-white/90">
                        {pasoActual.houston ? `📡 ${pasoActual.houston}` : pasoActual.detalle}
                      </div>
                      <div className="mt-1 text-sm font-black leading-5">{textoDeltas(pasoActual.deltas)}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!tutOff && !state.gameOver && !resol && fase === "planificar" && state.dia <= 2 && mision && (
                <div className="mt-2 rounded-2xl border-2 border-cyan-400 bg-cyan-50 p-3 text-zinc-900">
                  <div className="text-sm font-black">
                    {state.dia === 1 ? `👉 ${mision.emoji} ${mision.nombre}: ${mision.objetivo}` : "🔭 Mirá lo que SE ACERCA y elegí tu defensa"}
                  </div>
                  <div className="mt-1 text-xs">
                    {state.dia === 1
                      ? "PASO 1: tocá una carta. Lo rojo PAGÁS, lo verde GANÁS. Hoy solo hay 2 para empezar fácil."
                      : "Cada carta roja te pega después de jugar. ¡A cubierto! y la negociación llegan el día 3."}
                  </div>
                  <button
                    onClick={() => {
                      setTutOff(true);
                      marcarTutoVisto();
                    }}
                    className="mt-2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-black text-white"
                  >
                    Entendido
                  </button>
                </div>
              )}

              <ResourceStrip
                recursos={resol && resol.i > 0 ? resol.vistas[resol.i - 1] : state.recursos}
                oculto={oculto}
                preview={resol ? null : preview}
                flash={resol && resol.i > 0 ? resol.pasos[resol.i - 1].deltas : null}
              />
              {oculto && <div className="pt-1 text-center text-[11px] font-bold text-indigo-300">👁️ Sin telemetría este turno — los % vuelven el día {(state.ocultarHastaDia ?? state.dia) + 1}</div>}

              {!state.gameOver && !resol && fase === "planificar" && state.dia >= 2 && (
                <div className="mt-2 rounded-2xl border border-red-400/50 bg-red-500/15 px-3 py-2 text-xs">
                  <span className="font-black text-red-300">🔭 SE ACERCA: {proximoAtaque.nombre}</span>
                  <span className="ml-2 text-white/70">
                    {Object.entries(proximoAtaque.efectoRival).length === 0
                      ? "ocultará tus % 1 turno"
                      : Object.entries(proximoAtaque.efectoRival).map(([k, v]) => `${v! > 0 ? `+${v}` : v}${META[k as keyof Recursos].icon}`).join(" ")}
                    {" "}· juega escudo o ¡a cubierto!
                  </span>
                </div>
              )}

              {!state.gameOver && !resol && fase === "planificar" && rutinaDia !== state.dia && enCalma(state.recursos) && (
                <div className="mt-2 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-2.5">
                  <div className="text-[11px] font-black tracking-widest text-emerald-300">📋 RUTINA GRATIS (1 POR DÍA)</div>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {RUTINAS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => hacerRutina(r)}
                        title={r.texto}
                        className="rounded-xl border border-emerald-400/30 bg-black/30 px-2 py-1.5 text-left transition hover:bg-black/50 active:scale-[0.97]"
                      >
                        <div className="text-base leading-none">{r.emoji}</div>
                        <div className="mt-0.5 text-[11px] font-black leading-tight">{r.nombre}</div>
                        <div className="text-[11px] font-bold text-emerald-300">
                          {Object.entries(r.efecto).map(([k, v]) => `+${v}${META[k as keyof Recursos].icon}`).join(" ")}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Hand mano={mano} handIdx={handIdx} pa={state.pa} disabled={state.gameOver || fase === "negociar" || resol !== null} selectedKey={sel} resaltarAyuda={state.dia === 1} onPlay={jugarCarta} onHover={setHoverImpact} />
              </div>
              {resol && (
                <div className="pt-2">
                  <div className="flex items-center justify-center gap-1.5 pb-2" aria-hidden>
                    {resol.pasos.map((_, idx) => (
                      <span key={idx} className={`size-2.5 rounded-full ${idx < resol.i ? "bg-emerald-400" : idx === resol.i ? "bg-white animate-pulse" : "bg-white/20"}`} />
                    ))}
                  </div>
                  <button
                    onClick={avanzarPaso}
                    className="w-full rounded-full bg-white py-2.5 text-sm font-black text-black shadow-lg active:scale-[0.98]"
                  >
                    {resol.i < resol.pasos.length ? `SIGUIENTE → (${resol.i + 1}/${resol.pasos.length})` : "¡VER RESULTADO! 🎬"}
                  </button>
                  <p className="pt-1 text-center text-[11px] text-white/50">Lee tranquilo, el juego te espera</p>
                </div>
              )}
              <p className="px-1 pt-2 text-center text-[11px] leading-4 text-white/50">
                {needConfirm ? "👆 Toca para ver · de nuevo para jugar · " : ""}
                ❓ ¿QUÉ HACE? te explica cada carta · ⚡ ACCIONES ●●●: jugar gasta, vuelven cada día
              </p>
              <AnimatePresence>
                {selCarta && !resol && fase === "planificar" && !state.gameOver && refuerzoMax > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (state.pa < selCarta.pa + 1 && !reforzar) return;
                        sfx.click();
                        setReforzar((v) => !v);
                      }}
                      disabled={state.pa < selCarta.pa + 1 && !reforzar}
                      className={`w-full rounded-full border-2 py-2 text-xs font-black transition active:scale-[0.98] ${reforzar ? "border-amber-300 bg-amber-400 text-black" : "border-amber-400/60 bg-amber-400/10 text-amber-200"} disabled:opacity-40`}
                    >
                      {reforzar ? `⚡ REFORZADA: +1 PA → +10 (toca para quitar)` : `⚡ REFORZAR: +1 PA → +10 al mayor beneficio`}
                    </button>
                  </div>
                )}
              </AnimatePresence>

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
                      <span className="text-xs font-black text-zinc-500">📻 {trueques}/2 mensajes</span>
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
                      <button onClick={hacerTrueque} disabled={dar === recibir || trueques >= 2} className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-black text-black disabled:opacity-40">
                        {trueques >= 2 ? "📻 Sin señal" : "Trueque 6→3"}
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
                  <div className="flex items-center gap-3">
                    <Astronauta mood={mood} size={64} color={tribu.color} />
                    <div>
                      <div className="text-lg font-black">{state.won ? `🎉 ¡Sobreviviste ${state.maxDias} días!` : `💥 ${state.causaDerrota}`}</div>
                      {!state.won && <div className="mt-1 text-sm font-bold opacity-90">{chiste}</div>}
                      {mision && <div className="text-xs font-bold opacity-80">{mision.emoji} {mision.nombre}</div>}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-1" aria-label={`${estrellasGanadas} de 3 estrellas`}>
                    {[0, 1, 2].map((s) => (
                      <motion.span
                        key={s}
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3 + s * 0.25, type: "spring", stiffness: 300, damping: 12 }}
                        className={`text-3xl ${s < estrellasGanadas ? "text-amber-300" : "text-white/30"}`}
                      >
                        ★
                      </motion.span>
                    ))}
                    <span className="ml-2 text-xs font-bold opacity-80">
                      {state.won ? (estrellasGanadas === 3 ? "¡Equilibrio perfecto!" : estrellasGanadas === 2 ? "¡Muy equilibrado!" : "¡Vivo! Prueba más equilibrio") : "Sin estrellas — inténtalo de nuevo"}
                      {mision && (estrellas[mision.id] ?? 0) > estrellasGanadas && ` · Récord: ${"★".repeat(estrellas[mision.id])}`}
                    </span>
                  </div>
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
                  <button onClick={cambiarMision} className="mt-2 ml-2 rounded-full border border-white/50 px-4 py-2 text-sm font-black text-white">
                    Cambiar misión
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
                const fuera = d > state.maxDias;
                return (
                  <div key={d} className={`min-w-[140px] shrink-0 rounded-xl border px-2.5 py-2 ${fuera ? "opacity-30 bg-white/5 border-white/10" : isHoy ? "bg-amber-400 text-black border-amber-500" : state.dia > d ? "opacity-50 bg-white/5 border-white/10" : "bg-black/30 border-white/10"}`}>
                    <div className="text-xs font-black">DÍA {d}</div>
                    <div className="text-xs font-bold leading-tight">{fuera ? "—" : (ev?.nombre ?? "—")}</div>
                    {!fuera && <div className="text-[11px] leading-tight opacity-70 line-clamp-2">{ev?.datoReal}</div>}
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
            <Link href="/codex" className="mt-2 block rounded-2xl border border-cyan-400/40 bg-cyan-400/10 p-2.5 text-center text-xs font-black text-cyan-200 transition hover:bg-cyan-400/20">
              ❓ ¿CÓMO FUNCIONA CADA COSA? → GUÍA
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

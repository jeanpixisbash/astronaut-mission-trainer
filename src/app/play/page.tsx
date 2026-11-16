"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ATAQUE, SUPERVIVENCIA, EVENTOS_GLOBALES, buildDeckAtaque, buildDeckEventos, buildDeckSupervivencia, type CartaAtaque, type CartaSupervivencia, type EventoGlobal } from "@/lib/cardsCatalog";
import { aplicarCarta, aplicarEventoGlobal, clamp, crearEstadoInicial, debeOcultar, desgasteBase, intercambiar, previewRecursos, verificarColapso, type GameState, type Recursos } from "@/lib/gameEngine";
import WindowView from "@/components/cockpit/WindowView";
import { Crew, Hand, ResourceStrip } from "@/components/cockpit/TabletCards";
import Astronauta, { type Mood } from "@/components/cockpit/Astronauta";
import { sceneFor } from "@/components/cockpit/scene";
import { useLang, LangToggle, fmt, RES_ICON, RES_LABEL, RES_NAME, type Lang } from "@/lib/i18n";
import {
  ALERTAS_EN,
  BRIEFINGS_EN,
  FRACASO_EN,
  HOUSTON_CALMA_EN,
  MISIONES_EN,
  PARCHES_EN,
  RUTINAS_EN,
  REACCION_ATAQUE_EN,
  REACCION_EVENTO_EN,
  cardText,
  reaccionDesgasteEN,
} from "@/lib/i18n-data";
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

function textoDeltas(deltas: Partial<Recursos>, lang: Lang): string {
  const L = RES_LABEL[lang];
  const partes = (Object.entries(deltas) as [keyof Recursos, number][]).filter(([, v]) => v !== 0);
  if (partes.length === 0) return lang === "en" ? "No direct damage." : "Sin daño directo.";
  return partes.map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${L[k]}`).join(" · ");
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

type PanelId = "timeline" | "bitacora" | "mision";

// Config reversible: para cambiar orden/etiquetas edita la lista en PlayPage.
// Para agregar un panel: añade entrada + su bloque en el drawer.
function RailDerecho({ paneles, activo, onToggle }: { paneles: { id: PanelId; titulo: string; icono: string }[]; activo: PanelId | null; onToggle: (p: PanelId) => void }) {
  return (
    <div className="flex shrink-0 flex-col gap-2" role="tablist" aria-label="Paneles">
      {paneles.map((p) => {
        const on = activo === p.id;
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={on}
            onClick={() => onToggle(p.id)}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 transition active:scale-95 ${
              on ? "border-white bg-white text-black shadow-lg" : "border-white/15 bg-white/[0.05] text-white/70 hover:bg-white/10"
            }`}
          >
            <span className="text-lg leading-none" aria-hidden>
              {p.icono}
            </span>
            <span className="text-[10px] font-black tracking-widest [writing-mode:vertical-rl]">{p.titulo}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function PlayPage() {
  const { lang, t } = useLang();
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
  const [panelAbierto, setPanelAbierto] = useState<"timeline" | "bitacora" | "mision" | null>(null);
  const [jugadores, setJugadores] = useState<string[]>(() => (typeof window !== "undefined" ? loadJugadores() : []));
  const [redUsada, setRedUsada] = useState(false);
  const redRef = useRef(false);
  const [refuerzos, setRefuerzos] = useState(0);

  const darParche = (id: string) => {
    if (typeof window === "undefined") return;
    if (loadParches().includes(id)) return;
    const nombre = lang === "en" ? (PARCHES_EN[id]?.nombre ?? id) : (PARCHES.find((p) => p.id === id)?.nombre ?? id);
    setParches(ganarParche(id));
    setHoustonMsg(`📡 🎖️ ${lang === "en" ? "Patch unlocked" : "¡Parche desbloqueado"}: ${nombre}!`);
    sfx.pop();
  };

  // Datos con idioma: español canónico, inglés por override
  const TC = (c: { id: string; nombre: string; explicacion: string; fundamento?: string }) =>
    cardText(lang, { nombre: c.nombre, explicacion: c.explicacion, fundamento: c.fundamento ?? "", id: c.id });
  const briefingDe = (id: string) =>
    lang === "en" ? (BRIEFINGS_EN[id] ?? { titulo: BRIEFINGS[id]?.titulo ?? "", lineas: [] }) : (BRIEFINGS[id] ?? BRIEFING_DEFAULT);
  const rAtq = (id: string) => (lang === "en" ? (REACCION_ATAQUE_EN[id] ?? REACCION_ATAQUE[id]) : REACCION_ATAQUE[id]);
  const rEv = (id: string) => (lang === "en" ? (REACCION_EVENTO_EN[id] ?? REACCION_EVENTO[id]) : REACCION_EVENTO[id]);
  const rDes = (k: keyof Recursos) => (lang === "en" ? reaccionDesgasteEN(k) : reaccionDesgaste(k));
  const calmaDe = (i: number) => (lang === "en" ? HOUSTON_CALMA_EN[i % HOUSTON_CALMA_EN.length] : HOUSTON_CALMA[i % HOUSTON_CALMA.length]);
  const rutinasL = RUTINAS.map((r) => (lang === "en" ? { ...r, ...(RUTINAS_EN[r.id] ?? {}) } : r));
  const alertaL = (a: Alerta) => {
    if (lang === "es") return a;
    const ov = ALERTAS_EN[a.id];
    if (!ov) return a;
    return {
      ...a,
      titulo: ov.titulo,
      historia: ov.historia,
      opciones: a.opciones.map((op) => ({ ...op, ...(ov.opciones[op.id] ?? {}) })),
    };
  };
  const misionL = (m: Mision) => (lang === "en" ? { ...m, ...(MISIONES_EN[m.id] ?? {}) } : m);
  const chisteL = () =>
    lang === "en"
      ? FRACASO_EN[(state.causaDerrota?.length ?? 0) % FRACASO_EN.length]
      : FRACASO_GRACIOSO[(state.causaDerrota?.length ?? 0) % FRACASO_GRACIOSO.length];

  /** 🪂 Red Houston: 1× por partida, rescata lo que tocó 0 (el exceso 100% sí mata). */
  const intentarRed = (failed: GameState): GameState => {
    if (failed.gameOver && !failed.won && !redRef.current && (Object.values(failed.recursos) as number[]).some((v) => v <= 0)) {
      const r = { ...failed.recursos };
      (Object.keys(r) as (keyof Recursos)[]).forEach((k) => {
        if (r[k] <= 0) r[k] = 12;
      });
      redRef.current = true;
      setRedUsada(true);
      setHoustonMsg(`📡 ${t("red")}`);
      sfx.pop();
      return { ...failed, recursos: r, gameOver: false, causaDerrota: undefined, log: [...failed.log, t("red_log")] };
    }
    return failed;
  };

  /** 2 sorpresas por partida (misiones de 6+ días): días al azar, fuera de eventos globales. */
  const programarAlertas = (maxDias: number, cantidad = 2): Record<number, string> => {
    if (maxDias < 6 || cantidad <= 0) return {};
    const elegibles: number[] = [];
    for (let d = 2; d <= maxDias - 1; d++) {
      if (d % 3 !== 0) elegibles.push(d);
    }
    const dias = shuffle(elegibles).slice(0, cantidad);
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
      const alT = lang === "en" ? (ALERTAS_EN[alerta.id]?.titulo ?? alerta.titulo) : alerta.titulo;
      setHoustonMsg(`📡 🚨 ${t("emergencia")} ${alT}`);
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
  const scene = useMemo(() => {
    const baseScene = sceneFor(eventoHoy, ultimoAtaque, state.dia);
    if (lang === "es") return baseScene;
    const titles: Record<string, [string, string]> = {
      noche: ["Lunar night", "No Sun for 354 h — panels asleep"],
      flare: ["Class-X flare", "High radiation — raise shielding"],
      polvo: ["Global Martian storm", "Dust blocks 99% of sunlight"],
      calma: ["Calm solar wind", "Perfect time to charge and repair"],
      capsula: ["Resupply capsule", "Pick what to rescue"],
      rad: ["Galactic radiation peak", "Cosmic rays — seek regolith"],
      [`marte-${state.dia}`]: ["Mars — Valles Marineris", "Light dust · 12 min link"],
      [`luna-${state.dia}`]: ["Moon — Shackleton Crater", "Black sky · hard sunlight"],
    };
    const [titulo, alerta] = titles[baseScene.id] ?? [baseScene.titulo, baseScene.alerta ?? baseScene.subtitulo];
    return { ...baseScene, titulo, alerta: baseScene.alerta ? alerta : undefined };
  }, [eventoHoy, ultimoAtaque, state.dia, lang]);

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
    let etiqueta = TC(carta).nombre;
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

    let next = aplicarCarta(state, impacto, coste, etiqueta, protocolo, lang);
    pasos.push({ emoji: FAMILIA_ICON[carta.familia] ?? "◉", titulo: etiqueta, detalle: TC(carta).explicacion, deltas: { ...impacto } });
    vistas.push({ ...next.recursos });

    const ataqueActivo = state.dia >= (mision?.ataqueDesdeDia ?? 1);
    const ataque = ataqueActivo ? deckRojo[rojoIdx % deckRojo.length] : null;
    const ataqueT = ataque ? TC(ataque) : null;
    if (!ataque) {
      const tranquilo = lang === "en"
        ? "Training day: no attack yet. Watch what your card changes."
        : "Día de entrenamiento: todavía no hay ataque. Mira qué cambia con tu carta.";
      pasos.push({ emoji: "🌤️", titulo: lang === "en" ? "Quiet systems" : "Sistemas tranquilos", detalle: tranquilo, houston: tranquilo, deltas: {} });
      vistas.push({ ...next.recursos });
    } else if (ataque.id === "interferencia") {
      next = { ...next, ocultarHastaDia: next.dia + 1, log: [...next.log, fmt(t("ia_oculta"), { n: ataqueT!.nombre })] };
      pasos.push({ emoji: "👁️", titulo: ataqueT!.nombre, detalle: ataqueT!.explicacion, houston: rAtq(ataque.id), deltas: {} });
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
        next.log = [...next.log, fmt(t("ia_ataque"), { n: ataqueT!.nombre, e: JSON.stringify(efecto), p: protocolo ? t("ia_prot") : "" })];
      }
      pasos.push({ emoji: "🔴", titulo: ataqueT!.nombre, detalle: ataqueT!.explicacion, houston: rAtq(ataque.id) ?? "¡Oh no! ¡Algo golpea la colonia!", deltas: efecto });
      vistas.push({ ...next.recursos });
    }

    if (eventoHoy) {
      const evT = TC({ ...eventoHoy, fundamento: "" });
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
        next = { ...next, ocultarHastaDia: next.dia + 1, log: [...next.log, fmt(t("evento_radio"), { n: evT.nombre })] };
      }
      if (Object.keys(efecto).length) next = aplicarEventoGlobal(next, efecto, evT.nombre, lang);
      pasos.push({ emoji: eventoHoy.id === "conjuncion-solar" ? "👁️" : "🌌", titulo: evT.nombre, detalle: evT.explicacion, houston: rEv(eventoHoy.id) ?? "¡Oh no! ¡El espacio ataca!", deltas: efecto });
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
      const quien = fmt(t("win_msg"), { c: tribu.colonia });
      setHoustonMsg(failed.won ? `📡 ${quien}` : `📡 ${fmt(t("lose_msg"), { c: tribu.colonia })}`);
      setState(failed);
      setMensaje(failed.causaDerrota ?? (failed.won ? (lang === "en" ? "Victory!" : "¡Victoria!") : lang === "en" ? "Collapse" : "Colapso"));
      setRojoIdx((i) => (i + 1) % deckRojo.length);
      setResol(null);
    };

    const check = intentarRed(verificarColapso(next, lang));
    if (check.gameOver) {
      playSequence(pasos, vistas, seq, () => finalizeColapso(check), ataque, check.won ? "gana" : "pierde");
      return;
    }

    const siguienteDia = check.dia + 1;
    let siguiente: GameState = { ...check, dia: siguienteDia, pa: 3 };
    const tutorialNocturnalWear = mision?.id === "m0" && state.dia === 1;
    if (siguienteDia > 1 && siguienteDia <= check.maxDias && !tutorialNocturnalWear) {
      siguiente = desgasteBase(siguiente, lang);
      const vals = Object.entries(siguiente.recursos) as [keyof Recursos, number][];
      const peor = [...vals].sort((a, b) => a[1] - b[1])[0];
      pasos.push({
        emoji: "😴",
        titulo: lang === "en" ? "Night wear" : "Desgaste de la noche",
        detalle:
          lang === "en"
            ? "The crew breathes, drinks and eats: the base spends on its own every night."
            : "La tripulación respira, bebe y come: la base gasta sola cada noche.",
        houston: peor[1] <= 25 ? rDes(peor[0]) : undefined,
        deltas: { energia: -5, oxigeno: -5, comida: -5 },
      });
      vistas.push({ ...siguiente.recursos });
      const check2 = intentarRed(verificarColapso(siguiente, lang));
      if (check2.gameOver) {
        playSequence(pasos, vistas, seq, () => finalizeColapso(check2), ataque, "pierde");
        return;
      }
      siguiente = check2;
    } else if (tutorialNocturnalWear) {
      const tranquilo = lang === "en"
        ? "Training day: night wear is paused so you can learn the next step."
        : "Día de entrenamiento: pausamos el desgaste para que aprendas el siguiente paso.";
      pasos.push({ emoji: "🌤️", titulo: lang === "en" ? "No night wear yet" : "Todavía sin desgaste", detalle: tranquilo, houston: tranquilo, deltas: {} });
      vistas.push({ ...siguiente.recursos });
    }

    if (siguienteDia > check.maxDias) {
      const final = intentarRed(verificarColapso({ ...siguiente, dia: check.maxDias }, lang));
      playSequence(pasos, vistas, seq, () => finalizeColapso(final), ataque, final.won ? "gana" : "pierde");
    } else {
      const go = { ...siguiente };
      playSequence(pasos, vistas, seq, () => {
        if (seqRef.current !== seq) return;
        setState(go);
        // Las alertas también pueden caer en días sin negociación (1-2):
        // revisarAlerta consume la entrada, así que el segundo llamado es no-op.
        revisarAlerta(go.dia);
        if (eventoHoy?.id === "noche-lunar") darParche("noche");
        if (eventoHoy?.id === "fulguracion-x") darParche("cazatormentas");
        if (go.recursos.escudo >= 80) darParche("muralla");
        // Houston comenta el nuevo día
        const valsGo = Object.values(go.recursos) as number[];
        const minGo = Math.min(...valsGo);
        if (minGo <= 20) {
          const entriesGo = Object.entries(go.recursos) as [keyof Recursos, number][];
          const peorGo = entriesGo.sort((a, b) => a[1] - b[1])[0][0];
          setHoustonMsg(`📡 ${rDes(peorGo)}`);
        } else if (enCalma(go.recursos)) {
          setHoustonMsg(`📡 ${calmaDe(go.dia)}`);
        } else {
          setHoustonMsg(`📡 ${fmt(t("vigila"), { d: go.dia })}`);
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

  const playSequence = (pasos: PasoRes[], vistas: Recursos[], seq: number, done: () => void, ataque: CartaAtaque | null, resultado: "sigue" | "gana" | "pierde") => {
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
      setMensaje(t("radio_limit"));
      return;
    }
    const res = intercambiar(state.recursos, dar, 6, recibir, 3, lang);
    if (!res.ok) {
      setMensaje(res.msg);
      return;
    }
    setState((s) => ({ ...s, recursos: res.recursos, log: [...s.log, fmt(t("trueque_log"), { m: res.msg })] }));
    setMensaje(fmt(t("trueque_log"), { m: res.msg }));
    setTruequeUsado(true);
    setTrueques((t) => t + 1);
  };

  const elegirOpcionAlerta = (alerta: Alerta, op: OpcionAlerta) => {
    if (state.gameOver) return;
    sfx.click();
    const opT = lang === "en" ? { ...op, ...(ALERTAS_EN[alerta.id]?.opciones[op.id] ?? {}) } : op;
    const alT = lang === "en" ? ALERTAS_EN[alerta.id]?.titulo ?? alerta.titulo : alerta.titulo;
    const recursos = { ...state.recursos };
    for (const k of Object.keys(opT.efecto) as (keyof Recursos)[]) {
      recursos[k] = clamp(recursos[k] + (opT.efecto[k] ?? 0));
    }
    const ns: GameState = { ...state, recursos, log: [...state.log, fmt(t("alerta_log"), { t: alT, o: opT.nombre })] };
    setAlertaActiva(null);
    const net = (Object.values(op.efecto) as number[]).reduce((a, v) => a + v, 0);
    if (net > 0) sfx.pop();
    else if (net < 0) sfx.hit();
    const check = intentarRed(verificarColapso(ns, lang));
    if (check.gameOver) {
      const equi = equilibrioDe(check.recursos);
      const stars = estrellasPara(check.won, equi);
      setEstrellasGanadas(stars);
      if (mision && stars > 0) setEstrellas(saveStar(mision.id, stars));
      if (check.won) sfx.win();
      else sfx.lose();
      setHoustonMsg(check.won ? `📡 ${fmt(t("win_msg"), { c: tribu.colonia })}` : `📡 ${fmt(t("lose_msg"), { c: tribu.colonia })}`);
      setState(check);
      setMensaje(check.causaDerrota ?? (lang === "en" ? "Collapse" : "Colapso"));
      return;
    }
    setState(check);
    setHoustonMsg(`📡 ${t("bien")} ${opT.explicacion}`);
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
      .map(([k, v]) => `+${v} ${RES_NAME[lang][k as keyof Recursos]}`)
      .join(" ");
    const rT = lang === "en" ? { ...r, ...(RUTINAS_EN[r.id] ?? {}) } : r;
    setState((s) => ({ ...s, recursos, log: [...s.log, fmt(t("rutina_log"), { n: rT.nombre, q: que })] }));
    setRutinaDia(state.dia);
    setHoustonMsg(lang === "en" ? `📡 Good maintenance! ${rT.texto}` : `📡 ¡Buen mantenimiento! ${rT.texto}`);
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
    let st = crearEstadoInicial(m.dias, lang);
    if (idx > 0 && (estrellas[MISIONES[idx - 1].id] ?? 0) > 0) {
      const entries = Object.entries(st.recursos) as [keyof Recursos, number][];
      const masBaja = entries.sort((a, b) => a[1] - b[1])[0][0];
      st = { ...st, recursos: { ...st.recursos, [masBaja]: clamp(st.recursos[masBaja] + 5) } };
      const prevNombre = lang === "en" ? (MISIONES_EN[MISIONES[idx - 1].id]?.nombre ?? MISIONES[idx - 1].nombre) : MISIONES[idx - 1].nombre;
      st = { ...st, log: [...st.log, fmt(t("veterania"), { r: RES_NAME[lang][masBaja], m: prevNombre })] };
    }
    setState(st);
    setDeckSup(m.guion ? buildDeckFijo(m.guion) : shuffle(buildDeckSupervivencia()));
    setDeckRojo(m.ataques ? buildAtaquesFijos(m.ataques) : shuffle(buildDeckAtaque()));
    setTimeline(buildTimelineFor(m, shuffle(buildDeckEventos())));
    alertasRef.current = programarAlertas(m.dias, m.alertas ?? 2);
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
    setHoustonMsg(`📡 ${t("online")}`);
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
    setState(crearEstadoInicial(dias, lang));
    setDeckSup(mision?.guion ? buildDeckFijo(mision.guion) : shuffle(buildDeckSupervivencia()));
    setDeckRojo(mision?.ataques ? buildAtaquesFijos(mision.ataques) : shuffle(buildDeckAtaque()));
    setTimeline(mision ? buildTimelineFor(mision, shuffle(buildDeckEventos())) : shuffle(buildDeckEventos()).slice(0, 5));
    alertasRef.current = programarAlertas(dias, mision?.alertas ?? 2);
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
    setHoustonMsg(`📡 ${t("online")}`);
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
  const AL = alertaActiva ? alertaL(alertaActiva) : null;
  const chiste = chisteL();
  const turnoDe = jugadores.length > 0 ? jugadores[(state.dia - 1) % jugadores.length] : null;
  const paneles = [
    { id: "timeline" as PanelId, titulo: t("timeline"), icono: "🌌" },
    { id: "bitacora" as PanelId, titulo: t("bitacora"), icono: "📋" },
    { id: "mision" as PanelId, titulo: t("mision_p"), icono: "🎯" },
  ];
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
    <div className="h-dvh flex flex-col overflow-hidden bg-[#05070f] text-zinc-100">
      <header className="shrink-0 border-b border-white/10 bg-[#05070f]/85 backdrop-blur">
        <div className="mx-auto flex h-11 max-w-[1400px] items-center justify-between gap-2 px-3 py-1.5">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">◉</span>
            <span className="hidden sm:inline">Sobrevive al Sol</span>
            <span className="sm:hidden">Misión</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">{t("dia")} {Math.min(state.dia, state.maxDias)}/{state.maxDias}</span>
            <span className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:flex">
              <span className="mr-1 text-xs font-bold">{lang === "en" ? "AP" : "PA"}</span>
              {[0, 1, 2].map((i) => (
                <span key={i} className={`size-3 rounded-full border ${i < state.pa ? "bg-amber-400 border-amber-500" : "bg-white/10 border-white/20"}`} />
              ))}
            </span>
            <LangToggle dark />
            <button onClick={toggleMute} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold" title={muted ? t("mute_on") : t("mute_off")}>
              {muted ? "🔇" : "🔊"}
            </button>
            <button onClick={reiniciar} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold">
              {t("reiniciar")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 min-h-0 flex-col px-3 pb-2 [font-size:15px] overflow-hidden">
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
                <h2 className="text-center text-xl font-black">{t("elige_mision")}</h2>
                <p className="mt-1 text-center text-xs text-white/60">{t("elige_sub")}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {MISIONES.map((m, i) => {
                    const desbloqueada = i === 0 || (estrellas[MISIONES[i - 1].id] ?? 0) > 0 || (estrellas[m.id] ?? 0) > 0;
                    const ms = estrellas[m.id] ?? 0;
                    const mT = misionL(m);
                    return (
                      <button
                        key={m.id}
                        onClick={() => desbloqueada && iniciar(m)}
                        disabled={!desbloqueada}
                        className={`rounded-2xl border-2 p-3 text-left transition ${desbloqueada ? "border-amber-400 bg-white text-zinc-900 hover:scale-[1.03]" : "border-white/10 bg-white/5 text-white/40"}`}
                      >
                        <div className="text-3xl">{desbloqueada ? mT.emoji : "🔒"}</div>
                        <div className="mt-1 font-black">{mT.nombre}</div>
                        <div className="text-xs font-bold opacity-70">{mT.dias} {t("dias")}</div>
                        <div className="mt-1 text-xs leading-tight opacity-80">{mT.descripcion}</div>
                        <div className="mt-1 text-xs leading-tight opacity-80">{mT.objetivo}</div>
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
                    <div className="text-xs font-black tracking-widest text-white/60">{t("tribu")}</div>
                    <label className="mt-2 block text-xs font-bold text-white/70">
                      {t("colonia")}
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
                          {t("astro")} {i + 1}
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
                      <span className="text-xs font-bold text-white/70">{t("traje")}</span>
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
                    <div className="text-xs font-black tracking-widest text-white/60">{t("juntos")}</div>
                    <p className="mt-1 text-xs leading-4 text-white/55">{t("juntos_d")}</p>
                    <input
                      defaultValue={jugadores.join(", ")}
                      onBlur={(e) => {
                        const arr = e.target.value.split(",").map((s) => s.trim().slice(0, 10)).filter(Boolean).slice(0, 4);
                        setJugadores(arr);
                        saveJugadores(arr);
                      }}
                      placeholder={t("juntos_ph")}
                      className="mt-2 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white outline-none placeholder:text-white/25"
                    />
                    {jugadores.length > 0 && (
                      <button
                        onClick={() => {
                          setJugadores([]);
                          saveJugadores([]);
                        }}
                        className="mt-2 text-xs font-bold text-white/50 underline"
                      >
                        {t("juntos_off")}{jugadores.join(" · ")})
                      </button>
                    )}
                  </div>
                </div>
                {/* álbum de parches */}
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs font-black tracking-widest text-white/60">
                    {t("parches")} ({parches.length}/{PARCHES.length})
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                    {PARCHES.map((p) => {
                      const tiene = parches.includes(p.id);
                      const pT = lang === "en" ? { ...p, ...(PARCHES_EN[p.id] ?? {}) } : p;
                      return (
                        <div
                          key={p.id}
                          title={tiene ? `${pT.nombre}: ${pT.como}` : `🔒 ${pT.nombre}: ${pT.como}`}
                          className={`rounded-xl border px-1 py-2 text-center ${tiene ? "border-amber-400 bg-amber-400/15" : "border-white/10 bg-black/30 opacity-45"}`}
                        >
                          <div className="text-2xl">{tiene ? pT.emoji : "🔒"}</div>
                          <div className="mt-0.5 text-[9px] font-black leading-tight">{pT.nombre}</div>
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
                  {debrief.resultado === "pierde" ? t("db_pierde") : debrief.resultado === "gana" ? t("db_gana") : t("db_sigue")}
                </h2>
                <div className="mt-3 space-y-2 text-left">
                  {debrief.pasos.map((p, i) => (
                    <div key={i} className="rounded-xl bg-white/5 px-3 py-2">
                      <div className="text-sm font-black">
                        {p.emoji} {p.titulo}
                      </div>
                      <div className="text-sm leading-5 text-white/80">{textoDeltas(p.deltas, lang)}</div>
                    </div>
                  ))}
                </div>
                {(() => {
                  const neto = netoPasos(debrief.pasos);
                  const entradas = Object.entries(neto) as [keyof Recursos, number][];
                  if (entradas.length === 0) return null;
                  return (
                    <div className="mt-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                      <div className="text-xs font-black tracking-widest text-white/55">{t("total_dia")}</div>
                      <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                        {entradas.map(([k, v]) => (
                          <span key={k} className={`rounded-full px-2.5 py-1 text-sm font-black text-white ${v > 0 ? "bg-emerald-500" : "bg-red-500"}`}>
                            {v > 0 ? `+${v}` : v} {RES_ICON[k]} {RES_LABEL[lang][k]}
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
                  {t("entendido_btn")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* alerta sorpresa: el astronauta interrumpe y explica las opciones */}
        <AnimatePresence>
          {AL && (
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
                  {AL.emoji} {t("emergencia")} {AL.titulo}
                </h2>
                <p className="mt-2 rounded-xl bg-white/5 px-3 py-2 text-sm leading-5 text-white/85">
                  📡 {AL.historia}
                </p>
                <div className="mt-2 text-xs font-black tracking-widest text-white/55">
                  {t("alerta_sub")}
                </div>
                <div className="mt-2 space-y-2 text-left">
                  {AL.opciones.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => elegirOpcionAlerta(alertaActiva!, op)}
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
                              {RES_ICON[k as keyof Recursos]}
                            </span>
                          ))}
                        </span>
                      </div>
                      <div className="mt-1 text-xs leading-4 text-zinc-600">📡 {op.explicacion}</div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-white/40">{t("lee")}, {lang === "en" ? "the emergency waits" : "la emergencia te espera"}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* cockpit — consola horizontal: todo visible en una sola pantalla */}
        <div className="mt-2 flex flex-1 min-h-0 items-stretch justify-center gap-2 overflow-hidden">
          <SideConsole side="left" />
          <div className="flex min-w-0 flex-1 flex-col min-h-0">
            <div className="flex-1 shrink-0" style={{ height: "24dvh", minHeight: 150, maxHeight: 220 }}>
              <WindowView scene={scene} shakeKey={`${state.dia}-${ultimoAtaque?.id ?? "none"}`} lang={lang} />
            </div>

            {/* base visible: cada carta planta su edificio */}
            {base.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto border-x-[10px] border-[#343b4a] bg-[#0b0e17] px-3 py-1.5">
                <span className="shrink-0 text-xs font-black tracking-widest text-white/50">🏠 MI BASE</span>
                {base.slice(-18).map((id, i) => (
                  <span key={`${id}-${i}`} className="shrink-0 text-xl" title={id}>
                    {EDIFICIO[id] ?? "🏕️"}
                  </span>
                ))}
              </div>
            )}

            {/* feed Houston con astronauta — compacto */}
            {mision && (
              <div className="flex items-center gap-2 border-x-[10px] border-[#343b4a] bg-[#10141f] px-3 py-1">
                <Astronauta mood={mood} size={34} color={tribu.color} />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={houstonMsg}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-1 truncate text-sm font-bold leading-4 text-cyan-200"
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
                    <h2 className="mt-2 text-lg font-black">{briefingDe(mision.id).titulo}</h2>
                    <div className="mt-3 space-y-2">
                      {briefingDe(mision.id).lineas.map((l, i) => (
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
                      {t("briefing_btn")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* tablet — dock horizontal */}
            <div className="flex flex-1 min-h-0 flex-col rounded-b-[22px] border-[10px] border-t-0 border-[#343b4a] bg-[#0d1119] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between gap-2 px-1 pb-2">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${state.gameOver ? (state.won ? "bg-emerald-500 border-emerald-600 text-white" : "bg-red-500 border-red-600 text-white") : "border-white/15 bg-white/5 text-white/80"}`}>
                  {state.gameOver ? (state.won ? t("estable") : `💥 ${state.causaDerrota}`) : resol ? `⏳ ${resol.i >= resol.pasos.length ? "…" : `${resol.pasos[Math.min(resol.i, resol.pasos.length - 1)].emoji} ${resol.pasos[Math.min(resol.i, resol.pasos.length - 1)].titulo}`} (${Math.min(resol.i + 1, resol.pasos.length)}/${resol.pasos.length})` : `● ${fase === "negociar" ? `${t("negociando")} ${segundos}s` : t("elige")}`}
                </span>
                <span className={`rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-black ${equiColor}`} title={lang === "en" ? "Closeness to 50% on all 4 bars" : "Cercanía a 50% en las 4 barras"}>
                  ⚖️ {equi}%
                </span>
                {redUsada && (
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-black text-white/50" title={lang === "en" ? "Houston already saved you once" : "Houston ya te salvó una vez"}>
                    {t("red_usada")}
                  </span>
                )}
                {turnoDe && !state.gameOver && (
                  <span className="rounded-full border border-cyan-400/40 bg-cyan-400/15 px-2.5 py-1 text-xs font-black text-cyan-200">
                    {fmt(t("turno_de"), { x: turnoDe })}
                  </span>
                )}
                <button
                  onClick={() => setProtocolo((v) => !v)}
                  disabled={!puedeGuardarProtocolo || fase === "negociar"}
                  className={`rounded-full px-3 py-1 text-xs font-black ${protocolo ? "bg-violet-600 text-white" : "bg-white/10 text-white/80"} disabled:opacity-40`}
                  title={t("cubierto_title")}
                >
                  {protocoloBloqueado ? t("cubierto_locked") : protocolo ? t("cubierto_on") : t("cubierto")}
                </button>
              </div>
              <div className="hidden">{mision && !state.gameOver && (
                <div className="px-1 pb-1 text-xs font-bold text-white/55">🎯 {mision.nombre}: {mision.objetivo}</div>
              )}</div>
              <div className="hidden lg:block"><Crew recursos={vistaActual} nombres={tribu.crew} /></div>

              {mision?.id === "m0" && !state.gameOver && (
                <div className="hidden mt-1 rounded-lg border border-white/15 bg-white/[0.05] px-2 py-1 lg:block">
                  <div className="text-xs font-black tracking-widest text-white/50">{t("lista")}</div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
                    <span className={state.dia > 1 ? "text-emerald-300" : "text-white/60"}>{state.dia > 1 ? "✅" : "⭕"} {t("chk1")}</span>
                    <span className={state.dia > 2 ? "text-emerald-300" : "text-white/60"}>{state.dia > 2 ? "✅" : "⭕"} {t("chk2")}</span>
                    <span className={protocoloUsado || truequeUsado || state.dia > 3 ? "text-emerald-300" : "text-white/60"}>
                      {protocoloUsado || truequeUsado || state.dia > 3 ? "✅" : "⭕"} {t("chk3")}
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
                      <div className="mt-1 text-sm font-black leading-5">{textoDeltas(pasoActual.deltas, lang)}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!tutOff && !state.gameOver && !resol && fase === "planificar" && state.dia <= 3 && mision && (
                <div className="mt-2 rounded-2xl border-2 border-cyan-400 bg-cyan-50 p-3 text-zinc-900">
                  <div className="text-sm font-black">
                    {mision.id === "m0"
                      ? state.dia === 1
                        ? `👉 ${t("coach_m0_day1_title")}`
                        : state.dia === 2
                          ? `👉 ${t("coach_m0_day2_title")}`
                          : `👉 ${t("coach_m0_day3_title")}`
                      : state.dia === 1
                        ? `👉 ${misionL(mision).emoji} ${misionL(mision).nombre}: ${misionL(mision).objetivo}`
                        : t("coach_d2t")}
                  </div>
                  <div className="mt-1 text-xs">
                    {mision.id === "m0"
                      ? state.dia === 1
                        ? t("coach_m0_day1")
                        : state.dia === 2
                          ? t("coach_m0_day2")
                          : t("coach_m0_day3")
                      : state.dia === 1
                        ? t("coach_d1d")
                        : t("coach_d2d")}
                  </div>
                  <button
                    onClick={() => {
                      setTutOff(true);
                      marcarTutoVisto();
                    }}
                    className="mt-2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-black text-white"
                  >
                    {t("entendido")}
                  </button>
                </div>
              )}

              <ResourceStrip
                recursos={resol && resol.i > 0 ? resol.vistas[resol.i - 1] : state.recursos}
                oculto={oculto}
                preview={resol ? null : preview}
                flash={resol && resol.i > 0 ? resol.pasos[resol.i - 1].deltas : null}
              />
              {oculto && <div className="pt-1 text-center text-xs font-bold text-indigo-300">{fmt(t("tele_vuelve"), { d: (state.ocultarHastaDia ?? state.dia) + 1 })}</div>}

              {!state.gameOver && !resol && fase === "planificar" && state.dia >= 2 && (
                <div className="mt-2 rounded-2xl border border-red-400/50 bg-red-500/15 px-3 py-2 text-xs">
                  <span className="font-black text-red-300">{t("se_acerca")} {cardText(lang, proximoAtaque).nombre}</span>
                  <span className="ml-2 text-white/70">
                    {Object.entries(proximoAtaque.efectoRival).length === 0
                      ? t("oculta_pct")
                      : Object.entries(proximoAtaque.efectoRival).map(([k, v]) => `${v! > 0 ? `+${v}` : v}${RES_ICON[k as keyof Recursos]}`).join(" ")}
                    {" "}{t("juega_defensa")}
                  </span>
                </div>
              )}

              {!state.gameOver && !resol && fase === "planificar" && rutinaDia !== state.dia && enCalma(state.recursos) && (
                <div className="mt-2 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-2.5">
                  <div className="text-xs font-black tracking-widest text-emerald-300">{t("rutina_t")}</div>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {rutinasL.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => hacerRutina(r)}
                        title={r.texto}
                        className="rounded-xl border border-emerald-400/30 bg-black/30 px-2 py-1.5 text-left transition hover:bg-black/50 active:scale-[0.97]"
                      >
                        <div className="text-base leading-none">{r.emoji}</div>
                        <div className="mt-0.5 text-xs font-black leading-tight">{r.nombre}</div>
                        <div className="text-xs font-bold text-emerald-300">
                          {Object.entries(r.efecto).map(([k, v]) => `+${v}${RES_ICON[k as keyof Recursos]}`).join(" ")}
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
                    {resol.i < resol.pasos.length ? fmt(t("siguiente"), { a: resol.i + 1, b: resol.pasos.length }) : t("ver_resultado")}
                  </button>
                  <p className="pt-1 text-center text-xs text-white/50">{t("lee")}</p>
                </div>
              )}
              <p className="px-1 pt-2 text-center text-xs leading-4 text-white/50">
                {needConfirm ? t("hint_touch") : ""}
                {t("hint_all")}
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
                      {reforzar ? t("reforzada") : t("reforzar")}
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
                      <h3 className="text-sm font-black">{t("neg_t")} — {segundos}s</h3>
                      <span className="text-xs font-black text-zinc-500">{fmt(t("radio_n"), { a: trueques })}</span>
                      <button onClick={saltarNegociacion} className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-black text-white">
                        {t("saltar")}
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <label className="text-xs font-bold">
                        {t("doy")}
                        <select value={dar} onChange={(e) => setDar(e.target.value as keyof Recursos)} className="ml-1 rounded-lg border px-2 py-1">
                          {(Object.keys(RES_LABEL[lang]) as (keyof Recursos)[]).map((k) => (
                            <option key={k} value={k}>{RES_ICON[k]} {RES_LABEL[lang][k]}</option>
                          ))}
                        </select>
                      </label>
                      <span>→</span>
                      <label className="text-xs font-bold">
                        {t("recibo")}
                        <select value={recibir} onChange={(e) => setRecibir(e.target.value as keyof Recursos)} className="ml-1 rounded-lg border px-2 py-1">
                          {(Object.keys(RES_LABEL[lang]) as (keyof Recursos)[]).map((k) => (
                            <option key={k} value={k}>{RES_ICON[k]} {RES_LABEL[lang][k]}</option>
                          ))}
                        </select>
                      </label>
                      <button onClick={hacerTrueque} disabled={dar === recibir || trueques >= 2} className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-black text-black disabled:opacity-40">
                        {trueques >= 2 ? t("sin_senal") : t("trueque")}
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
                  <span className="font-black text-red-300">🔴 {lang === "en" ? "WEATHER / AI" : "CLIMA / IA"}: {cardText(lang, ultimoAtaque).nombre}</span>
                  <span className="ml-2 text-white/70">
                    {Object.entries(ultimoAtaque.efectoRival).length === 0
                      ? t("oculta_pct")
                      : Object.entries(ultimoAtaque.efectoRival).map(([k, v]) => `${v! > 0 ? `+${v}` : v}${RES_ICON[k as keyof Recursos]}`).join(" ")}
                  </span>
                </div>
              )}

              {state.gameOver && (
                <div className={`mt-2 rounded-2xl border-2 p-4 text-white ${state.won ? "bg-emerald-500 border-emerald-600" : "bg-red-500 border-red-600"}`}>
                  <div className="flex items-center gap-3">
                    <Astronauta mood={mood} size={64} color={tribu.color} />
                    <div>
                      <div className="text-lg font-black">{state.won ? fmt(t("sobreviviste"), { d: state.maxDias }) : `💥 ${state.causaDerrota}`}</div>
                      {!state.won && <div className="mt-1 text-sm font-bold opacity-90">{chiste}</div>}
                      {mision && <div className="text-xs font-bold opacity-80">{misionL(mision).emoji} {misionL(mision).nombre}</div>}
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
                      {state.won ? (estrellasGanadas === 3 ? t("est3") : estrellasGanadas === 2 ? t("est2") : t("est1")) : t("est0")}
                      {mision && (estrellas[mision.id] ?? 0) > estrellasGanadas && `${t("record")}${"★".repeat(estrellas[mision.id])}`}
                    </span>
                  </div>
                  {recap.length > 0 && (
                    <div className="mt-2 rounded-xl bg-black/25 p-2.5">
                      <div className="text-xs font-black tracking-widest opacity-80">{t("recap")}</div>
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
                    {t("otro")}
                  </button>
                  <button onClick={cambiarMision} className="mt-2 ml-2 rounded-full border border-white/50 px-4 py-2 text-sm font-black text-white">
                    {t("cambiar")}
                  </button>
                </div>
              )}
            </div>
          </div>
          <SideConsole side="right" />
          <RailDerecho paneles={paneles} activo={panelAbierto} onToggle={(p) => setPanelAbierto(panelAbierto === p ? null : p)} />
          {/* drawer: contenido del panel activo, apilado a la derecha y reversible vía PANELES */}
          <AnimatePresence>
            {panelAbierto && (
              <motion.aside
                key={panelAbierto}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2 }}
                className="fixed bottom-0 right-0 top-0 z-40 w-72 overflow-y-auto border-l border-white/10 bg-[#0b0e17]/95 p-3 backdrop-blur lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:border-l-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-0"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-white/60">
                    {paneles.find((p) => p.id === panelAbierto)?.icono} {paneles.find((p) => p.id === panelAbierto)?.titulo}
                  </span>
                  <button onClick={() => setPanelAbierto(null)} className="rounded-full border border-white/15 px-2 py-0.5 text-xs font-black text-white/70" aria-label="Cerrar panel">
                    ✕
                  </button>
                </div>
                {panelAbierto === "timeline" && (
                  <div className="space-y-1.5">
                    {[3, 6, 9, 12, 15].map((d, i) => {
                      const ev = timeline[i];
                      const isHoy = state.dia === d;
                      const fuera = d > state.maxDias;
                      return (
                        <div key={d} className={`rounded-xl border px-2.5 py-2 ${fuera ? "opacity-30 bg-white/5 border-white/10" : isHoy ? "bg-amber-400 text-black border-amber-500" : state.dia > d ? "opacity-50 bg-white/5 border-white/10" : "bg-black/30 border-white/10"}`}>
                          <div className="text-sm font-black">{t("dia")} {d}</div>
                          <div className="text-sm font-bold leading-tight">{fuera ? "—" : (ev ? cardText(lang, { ...ev, fundamento: "" }).nombre : "—")}</div>
                          {!fuera && ev && <div className="text-xs leading-tight opacity-70 line-clamp-2">{ev.datoReal}</div>}
                        </div>
                      );
                    })}
                    {eventoHoy && <div className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-black">{t("hoy")} {cardText(lang, { ...eventoHoy, fundamento: "" }).nombre} — {eventoHoy.datoReal}</div>}
                  </div>
                )}
                {panelAbierto === "bitacora" && (
                  <div>
                    <div className="max-h-[340px] overflow-auto rounded-xl border border-white/10 bg-black/30 p-2 font-mono text-sm leading-6">
                      {state.log.map((l, i) => (
                        <div key={i} className={i === state.log.length - 1 ? "font-bold text-white" : "text-white/60"}>{l}</div>
                      ))}
                    </div>
                    {mensaje && <div className="mt-1 text-sm font-bold text-amber-300">{mensaje}</div>}
                    <div className="mt-1 text-xs leading-4 text-white/40">{t("regla")}</div>
                    <Link href="/codex" className="mt-2 block rounded-2xl border border-cyan-400/40 bg-cyan-400/10 p-2.5 text-center text-xs font-black text-cyan-200 transition hover:bg-cyan-400/20">
                      {t("guia")}
                    </Link>
                  </div>
                )}
                {panelAbierto === "mision" && (
                  <div>
                    {mision ? (
                      <div>
                        <div className="text-sm font-black">
                          {misionL(mision).emoji} {misionL(mision).nombre}
                        </div>
                        <p className="mt-1 text-xs leading-4 text-white/70">{misionL(mision).objetivo}</p>
                        <p className="mt-1 text-xs leading-4 text-white/55">{misionL(mision).descripcion}</p>
                        <div className="mt-2 border-t border-white/10 pt-2 text-xs text-white/60">
                          {t("dia")} {state.dia}/{state.maxDias} · PA {state.pa}/3 · ⚖️ {equi}%
                        </div>
                        {turnoDe && <div className="mt-1 text-xs font-black text-cyan-200">{t("guion")} {turnoDe}</div>}
                      </div>
                    ) : (
                      <p className="text-sm text-white/60">{t("mision_detalle")}</p>
                    )}
                  </div>
                )}
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

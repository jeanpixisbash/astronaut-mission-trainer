import type { Lang, ResKey } from "./i18n";
import { RES_NAME } from "./i18n";

export type Recursos = {
  energia: number;
  oxigeno: number;
  comida: number;
  escudo: number;
};

export type GameState = {
  dia: number;
  maxDias: number;
  recursos: Recursos;
  pa: number;
  ocultarHastaDia: number | null; // Interferencia de Telemetría
  log: string[];
  gameOver: boolean;
  won: boolean;
  causaDerrota?: string;
};

export const INICIAL: Recursos = { energia: 50, oxigeno: 50, comida: 50, escudo: 50 };

export function crearEstadoInicial(maxDias = 15, lang: Lang = "es"): GameState {
  const inicio =
    lang === "en"
      ? `Day 1 — Colony online. 4 bars at 50%. Survive ${maxDias} days without touching 0% or 100%.`
      : `Día 1 — Colonia online. 4 barras en 50%. Sobrevive ${maxDias} días sin tocar 0% ni 100%.`;
  return {
    dia: 1,
    maxDias,
    recursos: { ...INICIAL },
    pa: 3,
    ocultarHastaDia: null,
    log: [inicio],
    gameOver: false,
    won: false,
  };
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function puedePagar(pa: number, coste: number) {
  return pa >= coste;
}

export function aplicarImpacto(recursos: Recursos, impacto: Partial<Recursos>): Recursos {
  const r = { ...recursos };
  for (const k of Object.keys(impacto) as (keyof Recursos)[]) {
    r[k] = clamp(r[k] + (impacto[k] ?? 0));
  }
  return r;
}

export function desgasteBase(s: GameState, lang: Lang = "es"): GameState {
  if (s.dia === 1) return s; // día 1 sin desgaste (preparación)
  let r = { ...s.recursos };
  r = aplicarImpacto(r, { energia: -5, oxigeno: -5, comida: -5 });
  const msg =
    lang === "en"
      ? `Day ${s.dia}: wear −5% Power/O₂/Food`
      : `Día ${s.dia}: desgaste -5% Energía/O₂/Comida`;
  return { ...s, recursos: r, log: [...s.log, msg] };
}

export function verificarColapso(s: GameState, lang: Lang = "es"): GameState {
  const rn = (k: keyof Recursos) => RES_NAME[lang][k as ResKey];
  for (const k of Object.keys(s.recursos) as (keyof Recursos)[]) {
    const v = s.recursos[k];
    if (v <= 0)
      return {
        ...s,
        gameOver: true,
        won: false,
        causaDerrota:
          lang === "en" ? `${rn(k)} shortage collapse (0%)` : `Colapso por escasez de ${k} (0%)`,
        log: [...s.log, lang === "en" ? `💥 ${rn(k)} at 0% — colony collapses` : `💥 ${k} en 0% — colonia colapsa`],
      };
    if (v >= 100) {
      const causa =
        lang === "en"
          ? k === "energia"
            ? "Electrical overload and fire"
            : k === "oxigeno"
              ? "Hyperoxia — flammable air"
              : k === "comida"
                ? "Biological overgrowth"
                : "Structural overpressure"
          : k === "energia"
            ? "Sobrecarga eléctrica e incendio"
            : k === "oxigeno"
              ? "Hiperoxia — atmósfera inflamable"
              : k === "comida"
                ? "Sobreproducción biológica"
                : "Sobrepresión estructural";
      return {
        ...s,
        gameOver: true,
        won: false,
        causaDerrota: `${causa} (${rn(k)} 100%)`,
        log: [...s.log, lang === "en" ? `💥 ${rn(k)} at 100% — ${causa}` : `💥 ${rn(k)} en 100% — ${causa}`],
      };
    }
  }
  if (s.dia > s.maxDias) {
    const equilibrado = Object.values(s.recursos).every((v) => v > 20 && v < 80);
    return {
      ...s,
      gameOver: true,
      won: equilibrado,
      log: [
        ...s.log,
        equilibrado
          ? lang === "en"
            ? `🎉 ${s.maxDias} days! Stable, balanced colony.`
            : `🎉 ¡${s.maxDias} días! Colonia estable y equilibrada.`
          : lang === "en"
            ? "⚠️ You survived, but unbalanced."
            : "⚠️ Sobreviviste pero desequilibrado.",
      ],
    };
  }
  return s;
}

export function aplicarCarta(s: GameState, impacto: Partial<Recursos>, paCoste: number, nombre: string, protocolo: boolean, lang: Lang = "es"): GameState {
  if (s.gameOver) return s;
  if (!puedePagar(s.pa, paCoste)) return s;
  const r = aplicarImpacto(s.recursos, impacto);
  const paRestante = s.pa - paCoste + (protocolo ? 0 : 0); // protocolo no consume extra, solo requiere guardar 1 PA
  const ap = lang === "en" ? "AP" : "PA";
  const logExtra = protocolo
    ? lang === "en"
      ? " + Emergency Protocol (½ damage taken)"
      : " + Protocolo Emergencia (½ daño recibido)"
    : "";
  const dia = lang === "en" ? `Day ${s.dia}` : `Día ${s.dia}`;
  return { ...s, recursos: r, pa: paRestante, log: [...s.log, `${dia}: ${nombre} (${paCoste} ${ap})${logExtra}`] };
}

export function aplicarEventoGlobal(s: GameState, efecto: Partial<Recursos>, nombre: string, lang: Lang = "es"): GameState {
  if (!efecto || Object.keys(efecto).length === 0) return s;
  const r = aplicarImpacto(s.recursos, efecto);
  return { ...s, recursos: r, log: [...s.log, lang === "en" ? `🌌 Global event: ${nombre} ${JSON.stringify(efecto)}` : `🌌 Evento global: ${nombre} ${JSON.stringify(efecto)}`] };
}

export function previewRecursos(recursos: Recursos, impacto: Partial<Recursos>): Recursos {
  return aplicarImpacto(recursos, impacto);
}

export function intercambiar(recursos: Recursos, dar: keyof Recursos, quitar: number, recibir: keyof Recursos, darCantidad: number, lang: Lang = "es"): { ok: boolean; recursos: Recursos; msg: string } {
  const rn = (k: keyof Recursos) => RES_NAME[lang][k];
  if (recursos[dar] < quitar)
    return { ok: false, recursos, msg: lang === "en" ? `You don't have ${quitar}% ${rn(dar)}` : `No tienes ${quitar}% ${dar}` };
  const r = { ...recursos };
  r[dar] = clamp(r[dar] - quitar);
  r[recibir] = clamp(r[recibir] + darCantidad);
  return {
    ok: true,
    recursos: r,
    msg:
      lang === "en"
        ? `Trade ${quitar}% ${rn(dar)} → +${darCantidad}% ${rn(recibir)}`
        : `Intercambio ${quitar}% ${dar} → +${darCantidad}% ${recibir}`,
  };
}

export function debeOcultar(state: GameState): boolean {
  // Exactamente 1 turno: solo el día marcado (el siguiente a la interferencia)
  return state.ocultarHastaDia !== null && state.dia === state.ocultarHastaDia;
}

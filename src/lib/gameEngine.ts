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
  maxPa: number;
  protocoloActivo: boolean;
  ocultarHastaDia: number | null; // Interferencia de Telemetría
  log: string[];
  gameOver: boolean;
  won: boolean;
  causaDerrota?: string;
};

export const INICIAL: Recursos = { energia: 50, oxigeno: 50, comida: 50, escudo: 50 };

export function crearEstadoInicial(): GameState {
  return {
    dia: 1,
    maxDias: 15,
    recursos: { ...INICIAL },
    pa: 3,
    maxPa: 3,
    protocoloActivo: false,
    ocultarHastaDia: null,
    log: ["Día 1 — Colonia online. 4 barras en 50%. Sobrevive 15 días sin tocar 0% ni 100%."],
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

export function desgasteBase(s: GameState): GameState {
  if (s.dia === 1) return s; // día 1 sin desgaste (preparación)
  let r = { ...s.recursos };
  r = aplicarImpacto(r, { energia: -5, oxigeno: -5, comida: -5 });
  return { ...s, recursos: r, log: [...s.log, `Día ${s.dia}: desgaste -5% Energía/O₂/Comida`] };
}

export function verificarColapso(s: GameState): GameState {
  for (const k of Object.keys(s.recursos) as (keyof Recursos)[]) {
    const v = s.recursos[k];
    if (v <= 0) return { ...s, gameOver: true, won: false, causaDerrota: `Colapso por escasez de ${k} (0%)`, log: [...s.log, `💥 ${k} en 0% — colonia colapsa`] };
    if (v >= 100) {
      const causa =
        k === "energia"
          ? "Sobrecarga eléctrica e incendio"
          : k === "oxigeno"
            ? "Hiperoxia — atmósfera inflamable"
            : k === "comida"
              ? "Sobreproducción biológica"
              : "Sobrepresión estructural";
      return { ...s, gameOver: true, won: false, causaDerrota: `${causa} (${k} 100%)`, log: [...s.log, `💥 ${k} en 100% — ${causa}`] };
    }
  }
  if (s.dia > s.maxDias) {
    const equilibrado = Object.values(s.recursos).every((v) => v > 20 && v < 80);
    return { ...s, gameOver: true, won: equilibrado, log: [...s.log, equilibrado ? "🎉 ¡15 días! Colonia estable y equilibrada." : "⚠️ Sobreviviste pero desequilibrado."] };
  }
  return s;
}

export function aplicarCarta(s: GameState, impacto: Partial<Recursos>, paCoste: number, nombre: string, protocolo: boolean): GameState {
  if (s.gameOver) return s;
  if (!puedePagar(s.pa, paCoste)) return s;
  const r = aplicarImpacto(s.recursos, impacto);
  const paRestante = s.pa - paCoste + (protocolo ? 0 : 0); // protocolo no consume extra, solo requiere guardar 1 PA
  const logExtra = protocolo ? " + Protocolo Emergencia (½ daño recibido)" : "";
  return { ...s, recursos: r, pa: paRestante, log: [...s.log, `Día ${s.dia}: ${nombre} (${paCoste} PA)${logExtra}`] };
}

export function aplicarEventoGlobal(s: GameState, efecto: Partial<Recursos>, nombre: string): GameState {
  if (!efecto || Object.keys(efecto).length === 0) return s;
  const r = aplicarImpacto(s.recursos, efecto);
  return { ...s, recursos: r, log: [...s.log, `🌌 Evento global: ${nombre} ${JSON.stringify(efecto)}`] };
}

export function previewRecursos(recursos: Recursos, impacto: Partial<Recursos>): Recursos {
  return aplicarImpacto(recursos, impacto);
}

export function intercambiar(recursos: Recursos, dar: keyof Recursos, quitar: number, recibir: keyof Recursos, darCantidad: number): { ok: boolean; recursos: Recursos; msg: string } {
  if (recursos[dar] < quitar) return { ok: false, recursos, msg: `No tienes ${quitar}% ${dar}` };
  const r = { ...recursos };
  r[dar] = clamp(r[dar] - quitar);
  r[recibir] = clamp(r[recibir] + darCantidad);
  return { ok: true, recursos: r, msg: `Intercambio ${quitar}% ${dar} → +${darCantidad}% ${recibir}` };
}

export function debeOcultar(state: GameState): boolean {
  return state.ocultarHastaDia !== null && state.dia <= state.ocultarHastaDia;
}

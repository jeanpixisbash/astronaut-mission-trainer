import { EVENTOS_GLOBALES, type EventoGlobal } from "./cardsCatalog";

export type Mision = {
  id: string;
  nombre: string;
  emoji: string;
  dias: number;
  descripcion: string;
  objetivo: string;
  /** día -> id de evento forzado en el timeline */
  forzados: Record<number, string>;
};

export const MISIONES: Mision[] = [
  {
    id: "m1",
    nombre: "Primera noche",
    emoji: "🌙",
    dias: 6,
    descripcion: "Tu primera colonia. Pocas cartas, noches largas.",
    objetivo: "Sobrevive 6 días. Día 3: noche lunar — guarda energía.",
    forzados: { 3: "noche-lunar", 6: "viento-calmo" },
  },
  {
    id: "m2",
    nombre: "Tormenta roja",
    emoji: "🌪️",
    dias: 9,
    descripcion: "Marte se pone bravo. Sol, polvo y radiación seguidos.",
    objetivo: "Sobrevive 9 días. Días 3, 6 y 9 pegan fuerte.",
    forzados: { 3: "fulguracion-x", 6: "tormenta-global-marte", 9: "pico-radiacion" },
  },
  {
    id: "m3",
    nombre: "Misión completa",
    emoji: "🚀",
    dias: 15,
    descripcion: "La misión real: 15 días, eventos sorpresa.",
    objetivo: "Sobrevive 15 días manteniendo el equilibrio cerca de 50%.",
    forzados: {},
  },
];

/** Timeline de 5 slots (días 3/6/9/12/15) con forzados de la misión pisando el azar. */
export function buildTimelineFor(m: Mision, azar: EventoGlobal[]): EventoGlobal[] {
  const base = azar.slice(0, 5);
  while (base.length < 5) base.push(azar[base.length % azar.length]);
  const dias = [3, 6, 9, 12, 15];
  return base.map((ev, i) => {
    const forzadoId = m.forzados[dias[i]];
    if (!forzadoId) return ev;
    return EVENTOS_GLOBALES.find((e) => e.id === forzadoId) ?? ev;
  });
}

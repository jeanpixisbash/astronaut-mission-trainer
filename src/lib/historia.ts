import type { Recursos } from "./gameEngine";

// Director narrativo: Houston habla. Briefing al inicio, reacciones cuando
// algo pasa y calma con rutinas cuando todo está normal.

export const BRIEFINGS: Record<string, { titulo: string; lineas: string[] }> = {
  m0: {
    titulo: "📡 Llamada entrante: HOUSTON",
    lineas: [
      "¡Hola, próximo astronauta! Soy Houston, tu voz en la Tierra.",
      "Estos 3 días son tu entrenamiento: juega cartas, aguanta y aprende.",
      "Completa la lista y te gradúas. ¡Te vigilo desde aquí!",
    ],
  },
  m1: {
    titulo: "📡 Llamada entrante: HOUSTON",
    lineas: [
      "¡Hola, astronauta! Misión real: tu colonia debe aguantar 6 días.",
      "Ojo: el día 3 cae la noche lunar. Guarda energía antes.",
      "Si sobrevives, te esperan tormentas peores. ¡Vamos!",
    ],
  },
  m2: {
    titulo: "📡 Llamada entrante: HOUSTON",
    lineas: [
      "Marte se puso bravo: fulguración, polvo y radiación los días 3, 6 y 9.",
      "Escudo alto y reservas llenas. ¡Que no te agarren vacío!",
      "9 días. Tú puedes.",
    ],
  },
  m3: {
    titulo: "📡 Llamada entrante: HOUSTON",
    lineas: [
      "La misión completa: 15 días con sorpresas cada 3.",
      "Equilibrio cerca de 50% en todo. Ni mucho ni poco.",
      "De la frontera a las estrellas. ¡Houston contigo!",
    ],
  },
};

export const BRIEFING_DEFAULT = {
  titulo: "📡 Llamada entrante: HOUSTON",
  lineas: ["¡Hola, astronauta! Sobrevive y mantén el equilibrio.", "Houston contigo."],
};

export const REACCION_ATAQUE: Record<string, string> = {
  "pulso-sobrecarga": "¡Oh no! ¡Te están metiendo energía a la fuerza! ¡Ojo con el 100%!",
  "inyeccion-o2": "¡Cuidado! ¡Oxígeno de más y todo arde!",
  "tormenta-polvo": "¡Polvo en los paneles! ¡Sacúdelos pronto!",
  "micrometeoritos": "¡Oh no! ¡Piedritas en el casco! ¡Revisa fugas!",
  "interferencia": "…shhk… ¿me copias?… …shhk… ¡Te perdí!",
  "plaga-biodomo": "¡Hongos en el invernadero! ¡Que no se riegue!",
  "fuga-criogenica": "¡Fuga en los tanques fríos! ¡Se escapa el aire!",
  "sabotaje-termico": "¡Apagaron tus calefactores! ¡Te congelas!",
  "polvo-lunar": "¡Polvo lunar en los sellos! ¡Eso raya todo!",
  "percloratos": "¡Sales tóxicas a bordo! ¡A lavar todo!",
};

export const REACCION_EVENTO: Record<string, string> = {
  "noche-lunar": "¡Se fue el Sol por 354 horas! ¡Aguanta la noche!",
  "fulguracion-x": "¡Fulguración clase X! ¡Todo el mundo al refugio!",
  "tormenta-global-marte": "¡Tormenta planetaria! ¡Ni Opportunity la contó!",
  "viento-calmo": "¡Día perfecto! ¡Carga todo lo que puedas!",
  "capsula-reabastecimiento": "¡Cápsula en camino! ¡Elige qué rescatar!",
  "pico-radiacion": "¡Radiación galáctica! ¡Detrás del regolito, ya!",
  "conjuncion-solar": "Marte tras el Sol… vuelas a ciegas, astronauta.",
  "amanecer-90": "¡Amanece otra vez! En órbita el Sol no espera.",
};

export function reaccionDesgaste(barra: keyof Recursos): string {
  switch (barra) {
    case "energia":
      return "¡Energía en rojo! ¡Enciende algo o se apaga todo!";
    case "oxigeno":
      return "¡El aire se acaba! ¡Actúa ya!";
    case "comida":
      return "¡La despensa vacía! ¡A sembrar ya!";
    case "escudo":
      return "¡El casco cruje! ¡Refuérzalo ya!";
  }
}

export const HOUSTON_CALMA = [
  "Todo en orden por aquí. Perfecto para una rutina.",
  "Noche tranquila en la colonia. Aprovecha la calma.",
  "Sistemas estables. Houston sonríe. Haz tu rutina.",
];

export const HOUSTON_WIN = "¡Misión cumplida, astronauta! Houston aplaude. 👏";
export const HOUSTON_LOSE = "Houston… ¿me copias?… Misión perdida. Inténtalo de nuevo. 💔";

export type Rutina = {
  id: string;
  nombre: string;
  emoji: string;
  efecto: Partial<Recursos>;
  texto: string;
};

export const RUTINAS: Rutina[] = [
  { id: "limpiar", nombre: "Limpiar paneles", emoji: "🧹", efecto: { energia: 4 }, texto: "Le quitas el polvo a los paneles con el cepillo." },
  { id: "revisar", nombre: "Revisar reciclador", emoji: "🔧", efecto: { oxigeno: 4 }, texto: "Ajustas válvulas y el aire fluye mejor." },
  { id: "podar", nombre: "Podar invernadero", emoji: "🌱", efecto: { comida: 4 }, texto: "Cortas hojas secas y la lechuga respira." },
  { id: "tornillos", nombre: "Apretar tornillos", emoji: "🔩", efecto: { escudo: 4 }, texto: "Una vuelta más al casco y queda sólido." },
];

/** Calma = todo entre 25 y 75: ni crisis ni exceso. Ahí sí hay rutinas. */
export function enCalma(r: Recursos): boolean {
  return (Object.values(r) as number[]).every((v) => v >= 25 && v <= 75);
}

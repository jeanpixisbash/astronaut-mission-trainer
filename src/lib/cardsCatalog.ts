// Catálogo fiel al PDF "Misión: Sobrevive al Sol — Prototipo v0.1"
// 16 Supervivencia (×2 =32), 8 Ataque (×2=16), 12 Eventos Globales
// 4 barras 0–100%, inicio 50%, fail 0 o 100. 3 PA por turno.

export type Familia = "energia" | "soporte" | "biodomo" | "blindaje" | "ataque";

export type CartaSupervivencia = {
  id: string;
  nombre: string;
  familia: Familia;
  pa: 1 | 2 | 3;
  impacto: Partial<Record<"energia" | "oxigeno" | "comida" | "escudo", number>>;
  fundamento: string;
  color: string; // tailwind
  copias: number;
};

export type CartaAtaque = {
  id: string;
  nombre: string;
  pa: 1 | 2;
  efectoRival: Partial<Record<"energia" | "oxigeno" | "comida" | "escudo", number>>;
  costoLanzador: Partial<Record<"energia" | "oxigeno" | "comida" | "escudo", number>>;
  tipo: string;
  color: string;
};

export type EventoGlobal = {
  id: string;
  nombre: string;
  efecto: Partial<Record<"energia" | "oxigeno" | "comida" | "escudo", number>>;
  datoReal: string;
  copias: number;
};

export const SUPERVIVENCIA: CartaSupervivencia[] = [
  { id: "paneles-gigantes", nombre: "Paneles Solares Gigantes", familia: "energia", pa: 1, impacto: { energia: 30, escudo: -15 }, fundamento: "Amplia superficie expuesta a micrometeoritos.", color: "from-amber-400 to-yellow-500", copias: 2 },
  { id: "kilopower", nombre: "Mini-Reactor Kilopower", familia: "energia", pa: 2, impacto: { energia: 40, escudo: -20 }, fundamento: "Fisión compacta constante; exige disipación térmica.", color: "from-amber-500 to-orange-600", copias: 2 },
  { id: "baterias-solido", nombre: "Baterías de Estado Sólido", familia: "energia", pa: 1, impacto: { energia: 20, comida: -10 }, fundamento: "Instalación pesada; reduce turno de cosecha.", color: "from-yellow-400 to-amber-500", copias: 2 },
  { id: "hibernacion", nombre: "Modo Hibernación", familia: "energia", pa: 2, impacto: { energia: 25, oxigeno: 15, escudo: -20 }, fundamento: "Apaga sistemas no vitales; sin mantenimiento activo.", color: "from-slate-400 to-slate-600", copias: 2 },
  { id: "sabatier", nombre: "Reactor Sabatier", familia: "soporte", pa: 2, impacto: { oxigeno: 35, energia: -25 }, fundamento: "Recupera agua del CO₂ en la ISS a 400 °C.", color: "from-cyan-400 to-sky-500", copias: 2 },
  { id: "reciclador-orina", nombre: "Reciclador de Orina/Sudor", familia: "soporte", pa: 1, impacto: { oxigeno: 25, energia: -15 }, fundamento: "Bombas y destiladores de alto consumo eléctrico.", color: "from-cyan-300 to-teal-500", copias: 2 },
  { id: "electrolisis-hielo", nombre: "Electrólisis de Hielo Lunar", familia: "soporte", pa: 2, impacto: { oxigeno: 30, escudo: 10, energia: -30 }, fundamento: "Extrae oxígeno del hielo polar (Cráter Shackleton).", color: "from-sky-400 to-blue-600", copias: 2 },
  { id: "zeolita", nombre: "Depurador de Zeolita", familia: "soporte", pa: 1, impacto: { oxigeno: 20, comida: -10 }, fundamento: "Regeneración química de aire; ocupa espacio de cultivo.", color: "from-teal-400 to-cyan-500", copias: 2 },
  { id: "hidroponico", nombre: "Cultivo Hidropónico LED", familia: "biodomo", pa: 2, impacto: { comida: 30, oxigeno: 10, energia: -20 }, fundamento: "Fotosíntesis artificial; demanda luz y riego continuo.", color: "from-emerald-400 to-green-600", copias: 2 },
  { id: "espirulina", nombre: "Biorreactor de Espirulina", familia: "biodomo", pa: 1, impacto: { comida: 20, oxigeno: 15, energia: -20 }, fundamento: "Microalgas de alta densidad proteica y captura de CO₂.", color: "from-lime-400 to-emerald-500", copias: 2 },
  { id: "raciones", nombre: "Raciones Deshidratadas", familia: "biodomo", pa: 1, impacto: { comida: 20, oxigeno: -10 }, fundamento: "Alimento listo de Tierra; requiere rehidratación.", color: "from-orange-300 to-amber-500", copias: 2 },
  { id: "cosecha-intensiva", nombre: "Cosecha Intensiva", familia: "biodomo", pa: 2, impacto: { comida: 35, energia: -15, escudo: -15 }, fundamento: "Abre domos a luz solar directa; expone estructura.", color: "from-green-500 to-lime-600", copias: 2 },
  { id: "muro-regolito", nombre: "Muro de Regolito", familia: "blindaje", pa: 2, impacto: { escudo: 35, energia: -15, comida: -10 }, fundamento: "Suelo lunar/marciano apilado frena rayos cósmicos.", color: "from-stone-400 to-stone-600", copias: 2 },
  { id: "cupula-hielo", nombre: "Cúpula de Hielo Protector", familia: "blindaje", pa: 2, impacto: { escudo: 40, oxigeno: -25, energia: -10 }, fundamento: "El hidrógeno del agua congelada bloquea radiación.", color: "from-blue-300 to-cyan-500", copias: 2 },
  { id: "tunel-lava", nombre: "Túnel de Lava Subterráneo", familia: "blindaje", pa: 3, impacto: { escudo: 45, energia: -30 }, fundamento: "Excavación profunda; iluminación 100% artificial.", color: "from-zinc-500 to-stone-700", copias: 2 },
  { id: "sellado", nombre: "Sellado de Emergencia", familia: "blindaje", pa: 1, impacto: { escudo: 20, oxigeno: -10 }, fundamento: "Compresores de casco; purga aire de esclusas.", color: "from-zinc-400 to-slate-600", copias: 2 },
];

export const ATAQUE: CartaAtaque[] = [
  { id: "pulso-sobrecarga", nombre: "Pulso de Sobrecarga Solar", pa: 2, efectoRival: { energia: 30, escudo: -15 }, costoLanzador: { energia: -10 }, tipo: "Ataque", color: "from-red-500 to-orange-600" },
  { id: "inyeccion-o2", nombre: "Inyección de O₂ Puro", pa: 2, efectoRival: { oxigeno: 30 }, costoLanzador: { oxigeno: -10 }, tipo: "Ataque", color: "from-cyan-500 to-sky-600" },
  { id: "tormenta-polvo", nombre: "Tormenta de Polvo Dirigida", pa: 2, efectoRival: { energia: -25, escudo: -10 }, costoLanzador: { escudo: -10 }, tipo: "Ataque", color: "from-amber-700 to-stone-700" },
  { id: "micrometeoritos", nombre: "Enjambre de Micrometeoritos", pa: 2, efectoRival: { escudo: -30, oxigeno: -10 }, costoLanzador: { energia: -10 }, tipo: "Ataque", color: "from-zinc-600 to-stone-800" },
  { id: "interferencia", nombre: "Interferencia de Telemetría", pa: 1, efectoRival: {}, costoLanzador: { energia: -5 }, tipo: "Ataque", color: "from-indigo-500 to-violet-600" },
  { id: "plaga-biodomo", nombre: "Plaga en Bio-Domo", pa: 2, efectoRival: { comida: -25, oxigeno: -10 }, costoLanzador: { comida: -10 }, tipo: "Ataque", color: "from-lime-600 to-green-800" },
  { id: "fuga-criogenica", nombre: "Fuga Criogénica", pa: 1, efectoRival: { oxigeno: -20 }, costoLanzador: { energia: -10 }, tipo: "Ataque", color: "from-sky-600 to-cyan-700" },
  { id: "sabotaje-termico", nombre: "Sabotaje Térmico", pa: 1, efectoRival: { energia: -20 }, costoLanzador: { escudo: -10 }, tipo: "Ataque", color: "from-orange-600 to-red-700" },
];

export const EVENTOS_GLOBALES: EventoGlobal[] = [
  { id: "noche-lunar", nombre: "Noche Lunar de 14 Días", efecto: { energia: -25, comida: -10 }, datoReal: "En la Luna la noche dura ~354 h sin sol.", copias: 2 },
  { id: "fulguracion-x", nombre: "Fulguración Solar Clase X", efecto: { escudo: -30, energia: 15 }, datoReal: "Eyecciones de masa coronal saturan paneles y elevan radiación (DONKI).", copias: 2 },
  { id: "tormenta-global-marte", nombre: "Tormenta Global Marciana", efecto: { energia: -20, comida: -15 }, datoReal: "Polvo bloquea hasta 99% de luz solar en Marte.", copias: 2 },
  { id: "viento-calmo", nombre: "Viento Solar Calmo", efecto: { energia: 15, escudo: 10 }, datoReal: "Condiciones óptimas de irradiancia registradas por LRO.", copias: 2 },
  { id: "capsula-reabastecimiento", nombre: "Cápsula de Reabastecimiento", efecto: {}, datoReal: "Misiones CLPS — eliges una barra +20%.", copias: 2 },
  { id: "pico-radiacion", nombre: "Pico de Radiación Galáctica", efecto: { escudo: -25, oxigeno: -10 }, datoReal: "Rayos cósmicos galácticos penetran hábitats sin regolito.", copias: 2 },
];

export function buildDeckSupervivencia(): CartaSupervivencia[] {
  const deck: CartaSupervivencia[] = [];
  for (const c of SUPERVIVENCIA) for (let i = 0; i < c.copias; i++) deck.push({ ...c });
  return deck;
}
export function buildDeckAtaque(): CartaAtaque[] {
  const deck: CartaAtaque[] = [];
  for (const c of ATAQUE) for (let i = 0; i < 2; i++) deck.push({ ...c });
  return deck;
}
export function buildDeckEventos(): EventoGlobal[] {
  const deck: EventoGlobal[] = [];
  for (const c of EVENTOS_GLOBALES) for (let i = 0; i < c.copias; i++) deck.push({ ...c });
  return deck;
}

// Catálogo "Misión: Sobrevive al Sol" — v0.2 con coherencia NASA.
// 20 Supervivencia (×2=40), 10 Ataque (×2=20), 8 Eventos Globales (×2=16).
// 4 barras 0–100%, inicio 50%, fail 0 o 100. 3 PA por turno.
// Cada carta trae: explicacion (palabras de niño), fundamento (dato real) y fuente (link).

export type Familia = "energia" | "soporte" | "biodomo" | "blindaje" | "ataque";

export type Fuente = { nombre: string; url: string };

const F = {
  donki: { nombre: "DONKI · Clima espacial", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/" },
  osdr: { nombre: "OSDR · Salud espacial", url: "https://osdr.nasa.gov/bio/repo/" },
  trek: { nombre: "Mars Trek", url: "https://trek.nasa.gov/mars/" },
  mars: { nombre: "NASA Mars", url: "https://mars.nasa.gov/" },
  moon: { nombre: "NASA Moon", url: "https://www.nasa.gov/moon" },
  moxie: {
    nombre: "MOXIE · NASA",
    url: "https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/",
  },
  fsp: {
    nombre: "Fission Surface Power · NASA",
    url: "https://www.nasa.gov/exploration-systems-development-mission-directorate/fission-surface-power",
  },
  eclss: {
    nombre: "ECLSS · NASA",
    url: "https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss",
  },
  ejercicio: {
    nombre: "Ejercicio astronauta · NASA",
    url: "https://www.nasa.gov/missions/station/iss-research/astronaut-exercise",
  },
  veggie: {
    nombre: "Veggie · NASA",
    url: "https://www.nasa.gov/missions/station/veggie-plant-growth-system-activated-on-international-space-station",
  },
  aph: { nombre: "Advanced Plant Habitat · NASA", url: "https://science.nasa.gov/mission/advanced-plant-habitat" },
  radiacion: {
    nombre: "Reto radiación · NASA",
    url: "https://www.nasa.gov/wp-content/uploads/2017/04/radiationchallenge.pdf",
  },
  whipple: { nombre: "Escudos Whipple · NASA JSC", url: "https://hvit.jsc.nasa.gov/shield-development/" },
  refugio: { nombre: "Refugio RadWorks · NTRS", url: "https://ntrs.nasa.gov/citations/20170002287" },
  icehome: { nombre: "Mars Ice Home · NASA Langley", url: "https://space.com/35101-mars-ice-home-design.html" },
  sabatier: { nombre: "CO₂ en la ISS · NTRS", url: "https://ntrs.nasa.gov/citations/20190030370" },
};

export type CartaSupervivencia = {
  id: string;
  nombre: string;
  familia: Familia;
  pa: 1 | 2 | 3;
  impacto: Partial<Record<"energia" | "oxigeno" | "comida" | "escudo", number>>;
  explicacion: string;
  fundamento: string;
  fuente: Fuente;
  color: string;
  copias: number;
};

export type CartaAtaque = {
  id: string;
  nombre: string;
  pa: 1 | 2;
  efectoRival: Partial<Record<"energia" | "oxigeno" | "comida" | "escudo", number>>;
  costoLanzador: Partial<Record<"energia" | "oxigeno" | "comida" | "escudo", number>>;
  explicacion: string;
  fundamento: string;
  fuente: Fuente;
  tipo: string;
  color: string;
};

export type EventoGlobal = {
  id: string;
  nombre: string;
  efecto: Partial<Record<"energia" | "oxigeno" | "comida" | "escudo", number>>;
  explicacion: string;
  datoReal: string;
  fuente: Fuente;
  copias: number;
};

export const SUPERVIVENCIA: CartaSupervivencia[] = [
  { id: "paneles-gigantes", nombre: "Paneles Solares Gigantes", familia: "energia", pa: 1, impacto: { energia: 30, escudo: -15 }, explicacion: "Mucha energía del Sol, pero tanta superficie expuesta invita micrometeoritos.", fundamento: "Amplia superficie expuesta a micrometeoritos.", fuente: F.mars, color: "from-amber-400 to-yellow-500", copias: 2 },
  { id: "fsp", nombre: "Reactor de Superficie FSP", familia: "energia", pa: 2, impacto: { energia: 40, escudo: -20 }, explicacion: "Electricidad nuclear día y noche, con polvo y todo. Calienta y hay que disipar ese calor.", fundamento: "Artemis planea 40 kW de fisión en la Luna (NASA + DOE). KRUSTY lo probó en Nevada, 2018.", fuente: F.fsp, color: "from-amber-500 to-orange-600", copias: 2 },
  { id: "rtg-mmrtg", nombre: "Generador RTG", familia: "energia", pa: 1, impacto: { energia: 25, escudo: -10 }, explicacion: "Una pastilla caliente hace electricidad sin sol. Poco, pero nunca se apaga.", fundamento: "Los MMRTG llevan Curiosity y Perseverance: funcionan de noche y con tormenta.", fuente: F.mars, color: "from-yellow-400 to-amber-500", copias: 2 },
  { id: "apagado-modulos", nombre: "Apagado de Módulos", familia: "energia", pa: 2, impacto: { energia: 25, oxigeno: 15, escudo: -20 }, explicacion: "Apagas lo no vital y ahorras un montón. Pero sin mantenimiento, el casco sufre.", fundamento: "La ISS apaga sistemas no vitales en eclipse para ahorrar energía.", fuente: F.eclss, color: "from-slate-400 to-slate-600", copias: 2 },
  { id: "sabatier", nombre: "Reactor Sabatier", familia: "soporte", pa: 2, impacto: { oxigeno: 35, energia: -25 }, explicacion: "Cocina el CO₂ que exhalas y saca agua. Gasta mucha electricidad porque hierve a 400 °C.", fundamento: "Recupera agua del CO₂ en la ISS operando a 400 °C.", fuente: F.sabatier, color: "from-cyan-400 to-sky-500", copias: 2 },
  { id: "reciclador-orina", nombre: "Reciclador de Orina/Sudor", familia: "soporte", pa: 1, impacto: { oxigeno: 25, energia: -15 }, explicacion: "Destila el sudor y la orina hasta dejarla potable. Las bombas tragan electricidad.", fundamento: "La ISS ya recupera el 98% del agua con UPA + destiladores.", fuente: F.eclss, color: "from-cyan-300 to-teal-500", copias: 2 },
  { id: "electrolisis-hielo", nombre: "Electrólisis de Hielo Lunar", familia: "soporte", pa: 2, impacto: { oxigeno: 30, escudo: 10, energia: -30 }, explicacion: "Derrites hielo polar y lo partes en oxígeno. Carísimo en energía, y minarlo aún es prospección.", fundamento: "LCROSS confirmó agua en los polos (2009); extraerla sigue en prospección.", fuente: F.moon, color: "from-sky-400 to-blue-600", copias: 2 },
  { id: "zeolita", nombre: "Depurador de Zeolita", familia: "soporte", pa: 1, impacto: { oxigeno: 20, comida: -10 }, explicacion: "Piedritas que atrapan el CO₂ del aire. Ocupan el lugar del cultivo.", fundamento: "El CDRA de la ISS usa zeolita y manda ese CO₂ al Sabatier para hacer agua.", fuente: F.sabatier, color: "from-teal-400 to-cyan-500", copias: 2 },
  { id: "moxie", nombre: "MOXIE Ampliado", familia: "soporte", pa: 2, impacto: { oxigeno: 30, energia: -20 }, explicacion: "Chupa CO₂ del aire marciano y escupe oxígeno respirable, como en Perseverance.", fundamento: "MOXIE logró 12 g/h al 98% de pureza en Marte (2021-2023).", fuente: F.moxie, color: "from-cyan-500 to-blue-600", copias: 2 },
  { id: "ared", nombre: "Bici + ARED", familia: "soporte", pa: 1, impacto: { oxigeno: 15, energia: -15 }, explicacion: "Pesas y bici sin gravedad para que huesos y músculos no se derritan. Cansa y gasta luz.", fundamento: "Sin ejercicio se pierde 1-2% de hueso al mes; la ARED es el gym de la ISS.", fuente: F.ejercicio, color: "from-orange-400 to-rose-500", copias: 2 },
  { id: "hidroponico", nombre: "Cultivo Hidropónico LED", familia: "biodomo", pa: 2, impacto: { comida: 30, oxigeno: 10, energia: -20 }, explicacion: "Lechugas bajo luces moradas que además sueltan oxígeno. Comen luz y agua sin parar.", fundamento: "Veggie y el hábitat APH cultivan en la ISS con luz artificial.", fuente: F.veggie, color: "from-emerald-400 to-green-600", copias: 2 },
  { id: "espirulina", nombre: "Biorreactor de Espirulina", familia: "biodomo", pa: 1, impacto: { comida: 20, oxigeno: 15, energia: -20 }, explicacion: "Microalgas que dan proteína y tragan CO₂. Hay que iluminarlas siempre.", fundamento: "Microalgas de alta densidad proteica y captura de CO₂.", fuente: F.osdr, color: "from-lime-400 to-emerald-500", copias: 2 },
  { id: "raciones", nombre: "Raciones Deshidratadas", familia: "biodomo", pa: 1, impacto: { comida: 20, oxigeno: -10 }, explicacion: "Comida lista traída de la Tierra. Para comerla hay que gastar agua.", fundamento: "Alimento listo de Tierra; requiere rehidratación.", fuente: F.eclss, color: "from-orange-300 to-amber-500", copias: 2 },
  { id: "cosecha-intensiva", nombre: "Cosecha Intensiva", familia: "biodomo", pa: 2, impacto: { comida: 35, energia: -15, escudo: -15 }, explicacion: "Abres los domos al Sol directo: cosechón, pero la estructura queda expuesta.", fundamento: "Abre domos a luz solar directa; expone la estructura.", fuente: F.aph, color: "from-green-500 to-lime-600", copias: 2 },
  { id: "muro-regolito", nombre: "Muro de Regolito", familia: "blindaje", pa: 2, impacto: { escudo: 35, energia: -15, comida: -10 }, explicacion: "Apilas suelo lunar como muralla: frena rayos cósmicos. Mover tierra cansa y gasta.", fundamento: "Suelo lunar/marciano apilado frena rayos cósmicos.", fuente: F.radiacion, color: "from-stone-400 to-stone-600", copias: 2 },
  { id: "ice-home", nombre: "Mars Ice Home", familia: "blindaje", pa: 2, impacto: { escudo: 40, oxigeno: -25, energia: -10 }, explicacion: "Casa de hielo: el hidrógeno del agua bloquea radiación. Pero esa agua ya no se bebe.", fundamento: "Concepto NASA Langley: casa de hielo para 4 tripulantes en Marte.", fuente: F.icehome, color: "from-blue-300 to-cyan-500", copias: 2 },
  { id: "tunel-lava", nombre: "Túnel de Lava Subterráneo", familia: "blindaje", pa: 3, impacto: { escudo: 45, energia: -30 }, explicacion: "Vivir bajo tierra: blindaje total, pero todo con luz artificial carísima.", fundamento: "Tubos de lava reales (Marius Hills); iluminación 100% artificial.", fuente: F.moon, color: "from-zinc-500 to-stone-700", copias: 2 },
  { id: "sellado", nombre: "Sellado de Emergencia", familia: "blindaje", pa: 1, impacto: { escudo: 20, oxigeno: -10 }, explicacion: "Compresores que tapan fugas ya. Al purgar esclusas se escapa aire.", fundamento: "Compresores de casco; purga aire de esclusas.", fuente: F.eclss, color: "from-zinc-400 to-slate-600", copias: 2 },
  { id: "whipple", nombre: "Escudo Whipple", familia: "blindaje", pa: 1, impacto: { escudo: 20, energia: -10 }, explicacion: "Doble pared: la primera rompe la piedrita en polvo y la segunda ataja los pedazos.", fundamento: "Pared doble estándar en la ISS contra micrometeoritos.", fuente: F.whipple, color: "from-slate-300 to-slate-500", copias: 2 },
  { id: "refugio-tormenta", nombre: "Refugio de Tormenta", familia: "blindaje", pa: 1, impacto: { escudo: 25, comida: -15 }, explicacion: "Todos al módulo más blindado hasta que pase el Sol. Encerrados, comen reservas.", fundamento: "Procedimiento real ante fulguración X; diseños de refugio RadWorks.", fuente: F.refugio, color: "from-violet-400 to-purple-600", copias: 2 },
];

export const ATAQUE: CartaAtaque[] = [
  { id: "pulso-sobrecarga", nombre: "Pulso de Sobrecarga Solar", pa: 2, efectoRival: { energia: 30, escudo: -15 }, costoLanzador: { energia: -10 }, explicacion: "Le metes tanta energía que lo empujas al 100%: sobrecarga e incendio.", fundamento: "El exceso también mata: sobrecarga eléctrica e incendio.", fuente: F.donki, tipo: "Ataque", color: "from-red-500 to-orange-600" },
  { id: "inyeccion-o2", nombre: "Inyección de O₂ Puro", pa: 2, efectoRival: { oxigeno: 30 }, costoLanzador: { oxigeno: -10 }, explicacion: "Oxígeno de más = aire inflamable. Un chispazo y arde todo.", fundamento: "Hiperoxia: atmósfera saturada altamente inflamable.", fuente: F.eclss, tipo: "Ataque", color: "from-cyan-500 to-sky-600" },
  { id: "tormenta-polvo", nombre: "Tormenta de Polvo Dirigida", pa: 2, efectoRival: { energia: -25, escudo: -10 }, costoLanzador: { escudo: -10 }, explicacion: "Polvo sobre sus paneles: se queda sin luz y sin energía.", fundamento: "En 2018 el polvo apagó a Opportunity para siempre.", fuente: F.mars, tipo: "Ataque", color: "from-amber-700 to-stone-700" },
  { id: "micrometeoritos", nombre: "Enjambre de Micrometeoritos", pa: 2, efectoRival: { escudo: -30, oxigeno: -10 }, costoLanzador: { energia: -10 }, explicacion: "Piedritas a 70 km/s que pican el casco y abren microfugas.", fundamento: "Riesgo MMOD real; la ISS se blinda con Whipple.", fuente: F.whipple, tipo: "Ataque", color: "from-zinc-600 to-stone-800" },
  { id: "interferencia", nombre: "Interferencia de Telemetría", pa: 1, efectoRival: {}, costoLanzador: { energia: -5 }, explicacion: "Ruido solar que deja su telemetría a ciegas un turno.", fundamento: "Las tormentas solares degradan radio y telemetría.", fuente: F.donki, tipo: "Ataque", color: "from-indigo-500 to-violet-600" },
  { id: "plaga-biodomo", nombre: "Plaga en Bio-Domo", pa: 2, efectoRival: { comida: -25, oxigeno: -10 }, costoLanzador: { comida: -10 }, explicacion: "Hongos en el invernadero: se pierde la cosecha y el aire se vicia.", fundamento: "Moho y microbios son plaga real en la ISS.", fuente: F.osdr, tipo: "Ataque", color: "from-lime-600 to-green-800" },
  { id: "fuga-criogenica", nombre: "Fuga Criogénica", pa: 1, efectoRival: { oxigeno: -20 }, costoLanzador: { energia: -10 }, explicacion: "Sus tanques superfríos evaporan y pierden aire al vacío.", fundamento: "Los criogénicos hierven y se evaporan: hay que reponerlos.", fuente: F.eclss, tipo: "Ataque", color: "from-sky-600 to-cyan-700" },
  { id: "sabotaje-termico", nombre: "Sabotaje Térmico", pa: 1, efectoRival: { energia: -20 }, costoLanzador: { escudo: -10 }, explicacion: "Le apagas los calefactores: gasta energía de emergencia o se congela.", fundamento: "Sin control térmico la noche lunar (-130 °C) congela todo.", fuente: F.moon, tipo: "Ataque", color: "from-orange-600 to-red-700" },
  { id: "polvo-lunar", nombre: "Polvo Lunar Abrasivo", pa: 2, efectoRival: { escudo: -20, energia: -10 }, costoLanzador: { energia: -10 }, explicacion: "Regolito = vidrio molido: raya visores, traba sellos y pela paneles.", fundamento: "El polvo lunar degradó trajes y sellos del Apollo.", fuente: F.moon, tipo: "Ataque", color: "from-stone-500 to-stone-700" },
  { id: "percloratos", nombre: "Percloratos Marcianos", pa: 2, efectoRival: { comida: -20, energia: -10 }, costoLanzador: { oxigeno: -10 }, explicacion: "Sales tóxicas en el polvo: hay que lavar todo antes de comer, y lavar gasta.", fundamento: "Percloratos en el suelo de Marte; tóxicos para humanos.", fuente: F.mars, tipo: "Ataque", color: "from-orange-700 to-red-800" },
];

export const EVENTOS_GLOBALES: EventoGlobal[] = [
  { id: "noche-lunar", nombre: "Noche Lunar de 14 Días", efecto: { energia: -25, comida: -10 }, explicacion: "Se va el Sol por 354 horas: los paneles duermen y la comida escasea.", datoReal: "En la Luna la noche dura ~354 h sin sol.", fuente: F.moon, copias: 2 },
  { id: "fulguracion-x", nombre: "Fulguración Solar Clase X", efecto: { escudo: -30, energia: 15 }, explicacion: "El Sol escupe radiación: el escudo sufre, pero los paneles se saturan de luz.", datoReal: "Eyecciones de masa coronal saturan paneles y elevan radiación (DONKI).", fuente: F.donki, copias: 2 },
  { id: "tormenta-global-marte", nombre: "Tormenta Global Marciana", efecto: { energia: -20, comida: -15 }, explicacion: "Polvo planetario: tapa el Sol y arruina cosechas.", datoReal: "Polvo bloquea hasta 99% de luz solar en Marte.", fuente: F.mars, copias: 2 },
  { id: "viento-calmo", nombre: "Viento Solar Calmo", efecto: { energia: 15, escudo: 10 }, explicacion: "Sol tranquilo y limpio: día perfecto para cargar y reparar.", datoReal: "Condiciones óptimas de irradiancia registradas por LRO.", fuente: F.trek, copias: 2 },
  { id: "capsula-reabastecimiento", nombre: "Cápsula de Reabastecimiento", efecto: {}, explicacion: "Carga comercial: eliges qué barra rescatar con +20.", datoReal: "Misiones CLPS — eliges una barra +20%.", fuente: F.mars, copias: 2 },
  { id: "pico-radiacion", nombre: "Pico de Radiación Galáctica", efecto: { escudo: -25, oxigeno: -10 }, explicacion: "Rayos de fuera del sistema que atraviesan casi todo.", datoReal: "Rayos cósmicos galácticos penetran hábitats sin regolito.", fuente: F.radiacion, copias: 2 },
  { id: "conjuncion-solar", nombre: "Conjunción Solar", efecto: {}, explicacion: "Marte se esconde tras el Sol: radio muerta, vuelas a ciegas un turno.", datoReal: "Cada 26 meses hay conjunción y se pierde telemetría.", fuente: F.mars, copias: 2 },
  { id: "amanecer-90", nombre: "Amanecer cada 90 min", efecto: { energia: 10, escudo: 5 }, explicacion: "En órbita amanece 16 veces al día: los paneles despiertan a cada rato.", datoReal: "16 amaneceres por día en órbita baja.", fuente: F.eclss, copias: 2 },
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

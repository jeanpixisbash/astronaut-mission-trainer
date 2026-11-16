import type { Lang } from "./i18n";

// English overrides keyed by id. Spanish stays canonical in cardsCatalog.ts / historia.ts.
export type CardTXT = { nombre: string; explicacion: string; fundamento: string };

export const CARD_EN: Record<string, CardTXT> = {
  // supervivencia
  "paneles-gigantes": {
    nombre: "Giant Solar Panels",
    explicacion: "Lots of energy from the Sun, but so much exposed surface invites micrometeorites.",
    fundamento: "Huge surface exposed to micrometeorites.",
  },
  fsp: {
    nombre: "FSP Surface Reactor",
    explicacion: "Nuclear electricity day and night, dust or not. It runs hot and that heat must go somewhere.",
    fundamento: "Artemis plans 40 kW of fission on the Moon (NASA + DOE). KRUSTY tested it in Nevada, 2018.",
  },
  "rtg-mmrtg": {
    nombre: "RTG Generator",
    explicacion: "A hot pellet makes electricity with no Sun. Little, but it never turns off.",
    fundamento: "MMRTGs power Curiosity and Perseverance: they work at night and in storms.",
  },
  "apagado-modulos": {
    nombre: "Module Shutdown",
    explicacion: "You switch off the non-vital stuff and save a ton. But with no maintenance, the hull suffers.",
    fundamento: "The ISS switches off non-vital systems during eclipses to save power.",
  },
  sabatier: {
    nombre: "Sabatier Reactor",
    explicacion: "It cooks the CO₂ you breathe out and makes water. Burns lots of electricity boiling at 400 °C.",
    fundamento: "It recovers water from CO₂ on the ISS running at 400 °C.",
  },
  "reciclador-orina": {
    nombre: "Pee/Sweat Recycler",
    explicacion: "It distills sweat and pee until drinkable. The pumps eat electricity.",
    fundamento: "The ISS already recovers 98% of water with UPA + distillers.",
  },
  "electrolisis-hielo": {
    nombre: "Lunar Ice Electrolysis",
    explicacion: "You melt polar ice and split it into oxygen. Crazy expensive in power, and mining is still prospecting.",
    fundamento: "LCROSS confirmed water at the poles (2009); mining it is still prospecting.",
  },
  zeolita: {
    nombre: "Zeolite Scrubber",
    explicacion: "Little rocks that trap CO₂ from the air. They take up crop space.",
    fundamento: "The ISS CDRA uses zeolite and sends that CO₂ to Sabatier to make water.",
  },
  moxie: {
    nombre: "MOXIE XL",
    explicacion: "It sucks CO₂ from Martian air and breathes out oxygen, like on Perseverance.",
    fundamento: "MOXIE hit 12 g/h at 98% purity on Mars (2021-2023).",
  },
  ared: {
    nombre: "Bike + ARED",
    explicacion: "Weights and bike with no gravity so bones and muscles don't melt. Tiring and power-hungry.",
    fundamento: "Without exercise you lose 1-2% of bone per month; ARED is the ISS gym.",
  },
  hidroponico: {
    nombre: "LED Hydroponics",
    explicacion: "Lettuce under purple lights that also puffs out oxygen. Eats light and water nonstop.",
    fundamento: "Veggie and the APH habitat grow crops on the ISS with artificial light.",
  },
  espirulina: {
    nombre: "Spirulina Bioreactor",
    explicacion: "Micro-algae that give protein and gulp CO₂. They must stay lit always.",
    fundamento: "High-protein micro-algae that capture CO₂.",
  },
  raciones: {
    nombre: "Dehydrated Rations",
    explicacion: "Ready food brought from Earth. Eating it costs water.",
    fundamento: "Ready-made Earth food; needs rehydrating.",
  },
  "cosecha-intensiva": {
    nombre: "Intensive Harvest",
    explicacion: "You open the domes to direct Sun: huge harvest, but the structure stays exposed.",
    fundamento: "Opens domes to direct sunlight; exposes the structure.",
  },
  "muro-regolito": {
    nombre: "Regolith Wall",
    explicacion: "You pile Moon dirt as a wall: it stops cosmic rays. Moving dirt is hard work.",
    fundamento: "Piled lunar/Martian soil stops cosmic rays.",
  },
  "ice-home": {
    nombre: "Mars Ice Home",
    explicacion: "Ice house: hydrogen in water blocks radiation. But that water is gone for drinking.",
    fundamento: "NASA Langley concept: ice house for a crew of 4 on Mars.",
  },
  "tunel-lava": {
    nombre: "Lava Tube Hideout",
    explicacion: "Living underground: total shielding, but everything runs on pricey artificial light.",
    fundamento: "Real lava tubes (Marius Hills); 100% artificial lighting.",
  },
  sellado: {
    nombre: "Emergency Seal",
    explicacion: "Compressors that plug leaks right now. Purging airlocks lets air escape.",
    fundamento: "Hull compressors; airlock purges.",
  },
  whipple: {
    nombre: "Whipple Shield",
    explicacion: "Double wall: the first shatters the pebble into dust, the second catches the pieces.",
    fundamento: "Standard double wall on the ISS against micrometeorites.",
  },
  "refugio-tormenta": {
    nombre: "Storm Shelter",
    explicacion: "Everyone into the most shielded module until the Sun passes. Locked in, eating reserves.",
    fundamento: "Real procedure for X flares; RadWorks shelter designs.",
  },
  // ataque
  "pulso-sobrecarga": {
    nombre: "Solar Overload Pulse",
    explicacion: "You pump in so much energy it gets pushed to 100%: overload and fire.",
    fundamento: "Excess kills too: electrical overload and fire.",
  },
  "inyeccion-o2": {
    nombre: "Pure O₂ Injection",
    explicacion: "Too much oxygen = flammable air. One spark and everything burns.",
    fundamento: "Hyperoxia: saturated, highly flammable atmosphere.",
  },
  "tormenta-polvo": {
    nombre: "Aimed Dust Storm",
    explicacion: "Dust over their panels: no light, no power.",
    fundamento: "In 2018 dust shut Opportunity down forever.",
  },
  micrometeoritos: {
    nombre: "Micrometeorite Swarm",
    explicacion: "Pebbles at 70 km/s that chip the hull and open micro-leaks.",
    fundamento: "Real MMOD risk; the ISS armors up with Whipple.",
  },
  interferencia: {
    nombre: "Telemetry Interference",
    explicacion: "Solar noise that leaves their telemetry blind for a turn.",
    fundamento: "Solar storms degrade radio and telemetry.",
  },
  "plaga-biodomo": {
    nombre: "Bio-Dome Plague",
    explicacion: "Fungus in the greenhouse: harvest lost and air goes stale.",
    fundamento: "Mold and microbes are a real plague on the ISS.",
  },
  "fuga-criogenica": {
    nombre: "Cryogenic Leak",
    explicacion: "Their super-cold tanks boil off and leak air into the void.",
    fundamento: "Cryogenics boil and evaporate: they must be refilled.",
  },
  "sabotaje-termico": {
    nombre: "Thermal Sabotage",
    explicacion: "You switch off their heaters: burn emergency power or freeze.",
    fundamento: "With no thermal control the lunar night (−130 °C) freezes everything.",
  },
  "polvo-lunar": {
    nombre: "Abrasive Moon Dust",
    explicacion: "Regolith = ground glass: scratches visors, jams seals, peels panels.",
    fundamento: "Moon dust degraded Apollo suits and seals.",
  },
  percloratos: {
    nombre: "Martian Perchlorates",
    explicacion: "Toxic salts in the dust: wash everything before eating, and washing costs.",
    fundamento: "Perchlorates in Mars soil; toxic to humans.",
  },
  // eventos
  "noche-lunar": {
    nombre: "14-Day Lunar Night",
    explicacion: "The Sun leaves for 354 hours: panels sleep and food runs short.",
    fundamento: "On the Moon, night lasts ~354 h with no Sun.",
  },
  "fulguracion-x": {
    nombre: "Class-X Solar Flare",
    explicacion: "The Sun spits radiation: shielding suffers, but panels soak up light.",
    fundamento: "Coronal mass ejections flood panels and raise radiation (DONKI).",
  },
  "tormenta-global-marte": {
    nombre: "Global Mars Storm",
    explicacion: "Planet-wide dust: blocks the Sun and ruins crops.",
    fundamento: "Dust blocks up to 99% of sunlight on Mars.",
  },
  "viento-calmo": {
    nombre: "Calm Solar Wind",
    explicacion: "Quiet, clean Sun: perfect day to charge and repair.",
    fundamento: "Optimal irradiance conditions recorded by LRO.",
  },
  "capsula-reabastecimiento": {
    nombre: "Resupply Capsule",
    explicacion: "Commercial cargo: you pick which bar to rescue with +20.",
    fundamento: "CLPS missions — you pick one bar +20%.",
  },
  "pico-radiacion": {
    nombre: "Galactic Radiation Peak",
    explicacion: "Rays from outside the system that pierce almost everything.",
    fundamento: "Galactic cosmic rays pierce habitats with no regolith.",
  },
  "conjuncion-solar": {
    nombre: "Solar Conjunction",
    explicacion: "Mars hides behind the Sun: dead radio, you fly blind for a turn.",
    fundamento: "Every 26 months comes conjunction and telemetry is lost.",
  },
  "amanecer-90": {
    nombre: "Sunrise every 90 min",
    explicacion: "In orbit the Sun rises 16 times a day: panels wake up all the time.",
    fundamento: "16 sunrises per day in low orbit.",
  },
};

export const FUENTE_EN: Record<string, string> = {
  "DONKI · Clima espacial": "DONKI · Space weather",
  "OSDR · Salud espacial": "OSDR · Space health",
  "Mars Trek": "Mars Trek",
  "NASA Mars": "NASA Mars",
  "NASA Moon": "NASA Moon",
};

export function cardText(lang: Lang, item: { id: string; nombre: string; explicacion: string; fundamento: string }) {
  if (lang === "es") return item;
  const ov = CARD_EN[item.id];
  if (!ov) return item;
  return { ...item, ...ov };
}

export function fuenteNombre(lang: Lang, nombre: string): string {
  if (lang === "es") return nombre;
  return FUENTE_EN[nombre] ?? nombre;
}

// ---- Houston ----

export const BRIEFINGS_EN: Record<string, { titulo: string; lineas: string[] }> = {
  m0: {
    titulo: "📡 Incoming call: HOUSTON",
    lineas: [
      "Hello, future astronaut! I'm Houston, your voice on Earth.",
      "These 3 days are your training: play cards, hold on and learn.",
      "Finish the list and you graduate. I'm watching over you!",
    ],
  },
  m1: {
    titulo: "📡 Incoming call: HOUSTON",
    lineas: [
      "Hello, astronaut! Real mission: your colony must hold 6 days.",
      "Watch out: lunar night falls on day 3. Save power before that.",
      "Survive, and worse storms await. Let's go!",
    ],
  },
  m2: {
    titulo: "📡 Incoming call: HOUSTON",
    lineas: [
      "Mars turned nasty: flare, dust and radiation on days 3, 6 and 9.",
      "High shielding and full reserves. Don't get caught empty!",
      "9 days. You can do it.",
    ],
  },
  m3: {
    titulo: "📡 Incoming call: HOUSTON",
    lineas: [
      "The full mission: 15 days with surprises every 3.",
      "Balance near 50% on everything. Not too much, not too little.",
      "From the frontier to the stars. Houston with you!",
    ],
  },
};

export const REACCION_ATAQUE_EN: Record<string, string> = {
  "pulso-sobrecarga": "Oh no! They're pumping energy in by force! Watch the 100%!",
  "inyeccion-o2": "Careful! Too much oxygen and everything burns!",
  "tormenta-polvo": "Dust on the panels! Shake it off soon!",
  micrometeoritos: "Oh no! Pebbles on the hull! Check for leaks!",
  interferencia: "…shhk… do you copy?… …shhk… I lost you!",
  "plaga-biodomo": "Fungus in the greenhouse! Don't let it spread!",
  "fuga-criogenica": "Leak in the cold tanks! Air is escaping!",
  "sabotaje-termico": "They killed your heaters! You're freezing!",
  "polvo-lunar": "Moon dust in the seals! That scratches everything!",
  percloratos: "Toxic salts on board! Wash everything!",
};

export const REACCION_EVENTO_EN: Record<string, string> = {
  "noche-lunar": "The Sun is gone for 354 hours! Hold the night!",
  "fulguracion-x": "Class-X flare! Everyone to shelter!",
  "tormenta-global-marte": "Planet-wide storm! Even Opportunity didn't make it!",
  "viento-calmo": "Perfect day! Charge everything you can!",
  "capsula-reabastecimiento": "Capsule on the way! Pick what to rescue!",
  "pico-radiacion": "Galactic radiation! Get behind regolith, now!",
  "conjuncion-solar": "Mars behind the Sun… you're flying blind, astronaut.",
  "amanecer-90": "Sunrise again! In orbit the Sun never waits.",
};

export function reaccionDesgasteEN(barra: string): string {
  switch (barra) {
    case "energia":
      return "Power in the red! Switch something on or it all shuts down!";
    case "oxigeno":
      return "Air running out! Act now!";
    case "comida":
      return "Pantry empty! Time to grow!";
    default:
      return "Hull creaking! Reinforce it now!";
  }
}

export const HOUSTON_CALMA_EN = [
  "All quiet here. Perfect for a routine.",
  "Calm night at the colony. Enjoy the quiet.",
  "Systems stable. Houston smiles. Do your routine.",
];

export const RUTINAS_EN: Record<string, { nombre: string; texto: string }> = {
  limpiar: { nombre: "Clean panels", texto: "You brush dust off the panels." },
  revisar: { nombre: "Check recycler", texto: "You tweak valves and air flows better." },
  podar: { nombre: "Prune greenhouse", texto: "You trim dry leaves and lettuce breathes." },
  tornillos: { nombre: "Tighten bolts", texto: "One more turn on the hull and it's solid." },
};

export const ALERTAS_EN: Record<string, { titulo: string; historia: string; opciones: Record<string, { nombre: string; explicacion: string }> }> = {
  fuego: {
    titulo: "Fire on board!",
    historia: "Spark in the power module! Smells like burning. Act NOW.",
    opciones: {
      cortar: { nombre: "Cut the power", explicacion: "No spark, no fire: gain shield but spend power." },
      ventilar: { nombre: "Vent the module", explicacion: "You dump the smoke and save power, but air escapes." },
      aguantar: { nombre: "Let it burn out", explicacion: "You save everything… but fire bites the hull. Risky." },
    },
  },
  basura: {
    titulo: "Space junk!",
    historia: "A dead satellite is coming straight at you! Seconds to decide.",
    opciones: {
      esquivar: { nombre: "Evasive burn", explicacion: "You burn power to dodge it: intact but empty." },
      girar: { nombre: "Show the armor", explicacion: "You turn the base and the hit lands on the hard side. Everyone inside eats reserves." },
      nada: { nombre: "Do nothing", explicacion: "You save fuel… and pray. If it hits, it hits hard." },
    },
  },
};

export const PARCHES_EN: Record<string, { nombre: string; como: string }> = {
  graduado: { nombre: "Graduated", como: "Win Training" },
  noche: { nombre: "Night owl", como: "Survive the lunar night" },
  cazatormentas: { nombre: "Storm hunter", como: "Survive an X flare" },
  muralla: { nombre: "Wall", como: "Reach 80 shield without overshooting" },
  refuerzos: { nombre: "All in", como: "Use 3 boosts in one run" },
  sangre: { nombre: "Cold blood", como: "Solve an alert without collapsing" },
  equilibrista: { nombre: "Balancer", como: "Win with 85%+ balance" },
  veterano: { nombre: "Veteran", como: "Win the full Mission" },
};

export const FRACASO_EN = [
  "The crew floats upside down… but with style! 🌀",
  "Houston asks for another try. And a coffee. ☕",
  "The Martians applaud your attempt. 👽",
  "Not even the rover laughs… well, a little. 🤖",
];

export const MISIONES_EN: Record<string, { nombre: string; descripcion: string; objetivo: string }> = {
  m0: {
    nombre: "Training",
    descripcion: "Scripted practice: easy cards and a gentle rival.",
    objetivo: "Finish the list: play, survive and protect.",
  },
  m1: {
    nombre: "First night",
    descripcion: "Your first real colony. Few cards, long nights.",
    objetivo: "Survive 6 days. Day 3: lunar night — save power.",
  },
  m2: {
    nombre: "Red storm",
    descripcion: "Mars turns nasty. Sun, dust and radiation back to back.",
    objetivo: "Survive 9 days. Days 3, 6 and 9 hit hard.",
  },
  m3: {
    nombre: "Full mission",
    descripcion: "The real mission: 15 days, surprise events.",
    objetivo: "Survive 15 days keeping balance near 50%.",
  },
};

export const GUIA_EN: { titulo: string; que: string; como: string }[] = [
  { titulo: "The goal", que: "Keep your colony alive every day of the mission.", como: "If any bar hits 0% or 100%, the colony collapses. Both extremes kill!" },
  { titulo: "Power", que: "Electricity from panels and reactors. Everything spends it.", como: "With no power there's no oxygen or food. Protect it at night and in dust." },
  { titulo: "Oxygen & water", que: "The air you breathe and the water you drink and recycle.", como: "The crew spends every night. The ISS recycles 98% of water." },
  { titulo: "Food", que: "Rations and whatever grows in the greenhouse.", como: "Each astronaut needs about 2500 kcal a day. Time to grow!" },
  { titulo: "Shield", que: "Your hull against radiation and space pebbles.", como: "With strong Sun or storms, raise it. With no shield the crew gets sick." },
  { titulo: "Actions (AP)", que: "Your moves each day. You have 3.", como: "Each card costs 1 to 3. They run out: choose well. Back every sunrise." },
  { titulo: "Take cover!", que: "You hide and damage is cut in half.", como: "Use it the day something ugly comes. Unlocks on day 3." },
  { titulo: "Boost", que: "You add +1 action to a card for +10 to its best effect.", como: "Only if you have a spare action. Worth it? You decide." },
  { titulo: "Flip cards", que: "Every card flips like real ones.", como: "The back says what it is, why play it and the NASA fact." },
  { titulo: "Incoming…", que: "The red attack coming tomorrow, in sight.", como: "Read what it does and prepare your defense today. No surprises." },
  { titulo: "Global events", que: "Space hits every 3 days: night, Sun, dust…", como: "Watch them on the timeline and save resources ahead." },
  { titulo: "Night wear", que: "Sleeping spends too: −5 power, oxygen and food.", como: "Happens alone, every night. So never save everything for later." },
  { titulo: "Surprise alerts", que: "Fire or space junk, no warning.", como: "The astronaut stops you and explains the 3 options. Choose calmly." },
  { titulo: "Negotiation", que: "You trade 6% of something for 3% of something else.", como: "Radio only allows 2 messages a day. Make them count!" },
  { titulo: "Routines", que: "Tiny free chores when everything is calm.", como: "If everything is between 25 and 75, pick 1 per day: +4 free." },
  { titulo: "No telemetry", que: "The % hide and you see ??.", como: "Lasts 1 turn. Play from memory… or wait for tomorrow!" },
  { titulo: "Balance", que: "How close everything is to 50%.", como: "More balance = more stars. Extremes collapse." },
  { titulo: "Stars", que: "Your grade: 1 for winning, up to 3 for balance.", como: "Win to unlock the next mission. Collect them!" },
  { titulo: "Veteran", que: "Winning a mission helps in the next one.", como: "You start with +5 on your lowest bar. Veterans help!" },
];

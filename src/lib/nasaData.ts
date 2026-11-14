// Curated REAL NASA data + Card deck for kids 7-12
export const REAL_MISSION_DATA = {
  donkiFlares: [
    { id: "FLR-2024-05-14-X8.7", date: "2024-05-14", class: "X8.7", label: "X8.7 — biggest of Solar Cycle 25", source: "DONKI", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/", effect: "Need shielding!" },
    { id: "FLR-2023-12-14-X2.8", date: "2023-12-14", class: "X2.8", label: "X2.8 flare", source: "DONKI", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/", effect: "Comms blackout" },
    { id: "FLR-2025-01-03-M7.6", date: "2025-01-03", class: "M7.6", label: "M7.6 flare", source: "DONKI", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/", effect: "Solar panels -20%" },
  ],
  radLabDose: {
    issAvg_mSvPerDay: 0.4,
    lunarSurface_mSvPerDay: 1.1,
    marsSurface_mSvPerDay: 0.64,
    note: "ISS dosimeters",
    source: "RadLab OSDR",
    url: "https://visualization.osdr.nasa.gov/radlab/gui/data-api/",
  },
  o2Consumption: {
    kgPerPersonPerDay: 0.84,
    waterPerPersonPerDay_L: 3.5,
    foodKcalPerPersonPerDay: 2500,
    source: "NASA Human Research Program / OSDR",
    url: "https://osdr.nasa.gov/bio/repo/",
  },
  marsFacts: { solHours: 24.65, commDelayMinMinutes: 12, moonDelaySeconds: 1.3, gravityVsEarth: 0.38, source: "Mars Trek", url: "https://trek.nasa.gov/mars/" },
};

export type CardChoice = {
  label: string;
  emoji: string;
  cost: Record<string, number>;
  gain: Record<string, number>;
  tag: string;
  funFact?: string;
};

export type SituationCard = {
  id: string;
  title: string;
  emoji: string;
  color: string; // tailwind bg
  desc: string; // plain kid language
  why: string; // one-liner NASA truth
  choices: CardChoice[];
};

export const SITUATIONS: SituationCard[] = [
  {
    id: "solar-flare",
    title: "Solar Storm!",
    emoji: "☀️",
    color: "from-amber-400 to-orange-500",
    desc: "The Sun shot a big flare. Radiation is coming! What do you do?",
    why: "Real DONKI data: X-class flares raise radiation 30%+ if shielding is low.",
    choices: [
      { label: "Close shutters", emoji: "🛡️", cost: { power: 20 }, gain: { shielding: 30, health: 8 }, tag: "SAFE", funFact: "ISS astronauts shelter behind water walls" },
      { label: "Hide & wait", emoji: "🏠", cost: { food: 5 }, gain: { shielding: 15, health: 5 }, tag: "OK" },
      { label: "Ignore it", emoji: "😎", cost: {}, gain: { power: 10, health: -18, shielding: -15 }, tag: "RISKY" },
    ],
  },
  {
    id: "oxygen-leak",
    title: "Air Leak!",
    emoji: "💨",
    color: "from-cyan-400 to-sky-500",
    desc: "Hiss! A seal is leaking oxygen. Fix it now or later?",
    why: "Astronauts use 0.84 kg O₂ per day — leaks matter!",
    choices: [
      { label: "Spacewalk fix", emoji: "🧑‍🚀", cost: { power: 18, oxygen: 10 }, gain: { health: 12, shielding: 5 }, tag: "FIX NOW" },
      { label: "Tape patch", emoji: "🩹", cost: { oxygen: 18 }, gain: { power: 8, health: -8 }, tag: "LATER" },
      { label: "Ask Earth", emoji: "📡", cost: { power: 8 }, gain: { health: 6, science: 5 }, tag: "WAIT" },
    ],
  },
  {
    id: "greenhouse",
    title: "Hungry Plants!",
    emoji: "🌱",
    color: "from-emerald-400 to-teal-500",
    desc: "Lettuce is thirsty. Water it now or wait for a bigger harvest?",
    why: "Need 2500 kcal per person per day — grown on site saves trips from Earth.",
    choices: [
      { label: "Water now", emoji: "💧", cost: { power: 12, oxygen: 5 }, gain: { food: 18, health: 5 }, tag: "NOW" },
      { label: "Wait 1 sol", emoji: "⏳", cost: { power: 6 }, gain: { food: 32, health: -6 }, tag: "BIGGER" },
      { label: "Skip harvest", emoji: "💤", cost: {}, gain: { power: 10, food: -8 }, tag: "SAVE" },
    ],
  },
  {
    id: "dust-storm",
    title: "Dust Storm!",
    emoji: "🌪️",
    color: "from-stone-400 to-amber-600",
    desc: "Mars wind is covering solar panels. Less power tomorrow!",
    why: "Mars Trek shows real dust opacity — it really dims panels 40%.",
    choices: [
      { label: "Charge batteries", emoji: "🔋", cost: { food: 8 }, gain: { power: 22 }, tag: "CHARGE" },
      { label: "Brush panels", emoji: "🧹", cost: { power: 15, oxygen: 8 }, gain: { power: 12, shielding: 10 }, tag: "CLEAN" },
      { label: "Do nothing", emoji: "😴", cost: {}, gain: { power: -18, health: -10 }, tag: "RISKY" },
    ],
  },
  {
    id: "science",
    title: "Cool Discovery!",
    emoji: "🔬",
    color: "from-violet-400 to-fuchsia-500",
    desc: "A dust devil! Study it for science points or save power?",
    why: "Science vs survival — same trade NASA planners face daily.",
    choices: [
      { label: "Study it!", emoji: "🧪", cost: { power: 22, oxygen: 6 }, gain: { science: 30, health: 3 }, tag: "SCIENCE!" },
      { label: "Take photo", emoji: "📸", cost: { power: 10 }, gain: { science: 12 }, tag: "QUICK" },
      { label: "Save power", emoji: "🔌", cost: {}, gain: { power: 14, food: 5 }, tag: "SAVE" },
    ],
  },
  {
    id: "comms-delay",
    title: "Message Delay!",
    emoji: "📡",
    color: "from-indigo-400 to-violet-500",
    desc: "Earth sent help but it takes 12 minutes to arrive. Wait or act now?",
    why: "Mars delay is 12–24 min vs Moon 1.3 sec — real!",
    choices: [
      { label: "Wait for Earth", emoji: "⏰", cost: { power: 6 }, gain: { health: 10, science: 6 }, tag: "PATIENT" },
      { label: "Decide alone", emoji: "🧠", cost: {}, gain: { science: 14, health: -7, power: 8 }, tag: "FAST" },
      { label: "Send robot", emoji: "🤖", cost: { power: 12 }, gain: { science: 18, health: 2 }, tag: "ROBOT" },
    ],
  },
  {
    id: "cold-night",
    title: "Freezing Night!",
    emoji: "❄️",
    color: "from-blue-400 to-cyan-500",
    desc: "Night on Mars is -80°C. Heat the habitat or save power?",
    why: "Real Moon/Mars nights need heaters — every watt counts.",
    choices: [
      { label: "Heaters on", emoji: "🔥", cost: { power: 24 }, gain: { health: 14, food: -4 }, tag: "WARM" },
      { label: "Blankets only", emoji: "🧣", cost: { power: 8 }, gain: { health: -6, power: 8 }, tag: "COLD" },
      { label: "Huddle", emoji: "🤗", cost: {}, gain: { health: -12, power: 12 }, tag: "FREEZE" },
    ],
  },
];

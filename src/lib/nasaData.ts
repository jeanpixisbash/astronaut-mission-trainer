// Curated REAL NASA data — embedded as fallback (live APIs too flaky for demo)
// All numbers are real; sources attributed in UI per challenge rules.

export const REAL_MISSION_DATA = {
  donkiFlares: [
    {
      id: "FLR-2024-05-14-X8.7",
      date: "2024-05-14",
      class: "X8.7",
      label: "X8.7 — largest of Solar Cycle 25 so far",
      source: "DONKI / NOAA SWPC",
      url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
      effect: "Radiation spike: +35% dose if shielding < 40%",
    },
    {
      id: "FLR-2023-12-14-X2.8",
      date: "2023-12-14",
      class: "X2.8",
      label: "X2.8 flare — Earth-directed CME",
      source: "DONKI",
      url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
      effect: "Comms blackout 12h, shielding drain",
    },
    {
      id: "FLR-2025-01-03-M7.6",
      date: "2025-01-03",
      class: "M7.6",
      label: "M7.6 — moderate but long duration",
      source: "DONKI",
      url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
      effect: "Power dip: solar panels -20% for 2 sols",
    },
  ],
  radLabDose: {
    // Real ISS dosimetry range: ~0.3–0.6 mSv/day in LEO; deep space higher
    issAvg_mSvPerDay: 0.4,
    lunarSurface_mSvPerDay: 1.1,
    marsSurface_mSvPerDay: 0.64,
    note: "ISS RadLab: absorbed dose from calibrated dosimeters (visualization.osdr.nasa.gov/radlab)",
    source: "RadLab OSDR",
    url: "https://visualization.osdr.nasa.gov/radlab/gui/data-api/",
  },
  o2Consumption: {
    // Real: astronaut ~0.84 kg O2 / day
    kgPerPersonPerDay: 0.84,
    waterPerPersonPerDay_L: 3.5,
    foodKcalPerPersonPerDay: 2500,
    source: "NASA Human Research Program / OSDR",
    url: "https://osdr.nasa.gov/bio/repo/",
  },
  marsFacts: {
    solHours: 24.65,
    commDelayMinMinutes: 12, // avg ~12, max 24
    moonDelaySeconds: 1.3,
    gravityVsEarth: 0.38,
    source: "Mars Trek / NASA",
    url: "https://trek.nasa.gov/mars/",
  },
  roverPhoto: {
    // Curated Mars Rover Photo (Curiosity sol 1000 sample) — real NASA API example
    img: "https://mars.nasa.gov/msl-raw-images/msss/01000/mcam/1000ML0044631190405177E01_DXXX.jpg",
    fallback: "Mars surface — Curiosity Rover",
  },
};

export const DAILY_EVENTS = [
  {
    id: "solar-flare",
    title: "☀️ Solar Flare Incoming!",
    desc: "DONKI just detected an X-class flare. Radiation will spike next sol. Will you reinforce shielding?",
    choices: [
      { label: "Reinforce shielding (costs 25 Power)", cost: { power: 25 }, gain: { shielding: 30, health: 10 }, tag: "Safe" },
      { label: "Save power, hope for the best", cost: {}, gain: { power: 15, shielding: -20, health: -15 }, tag: "Risky" },
    ],
  },
  {
    id: "greenhouse",
    title: "🌱 Greenhouse Alert",
    desc: "Lettuce is ready but the pump needs power. Harvest now or let it grow one more sol?",
    choices: [
      { label: "Harvest now (+15 Food)", cost: { power: 10 }, gain: { food: 15 }, tag: "Now" },
      { label: "Wait one sol (risk wilt) — big harvest", cost: { power: 5 }, gain: { food: 35, health: -5 }, tag: "Greedy" },
    ],
  },
  {
    id: "oxygen-leak",
    title: "🔧 O₂ Leak Detected",
    desc: "A seal in module B is hissing. Fix it now or patch it later?",
    choices: [
      { label: "EVA repair (costs Power + O₂)", cost: { power: 20, oxygen: 15 }, gain: { health: 15, shielding: 5 }, tag: "Fix now" },
      { label: "Temporary patch (saves power now)", cost: { oxygen: 25 }, gain: { power: 10, health: -10 }, tag: "Patch" },
    ],
  },
  {
    id: "science-opportunity",
    title: "🔬 Science Window!",
    desc: "A rare dust-devil on Mars — great data, but the experiment needs full power for 1 sol.",
    choices: [
      { label: "Run experiment (+30 Science)", cost: { power: 30, oxygen: 5 }, gain: { science: 30 }, tag: "Science!" },
      { label: "Skip, conserve resources", cost: {}, gain: { power: 10, food: 5 }, tag: "Conserve" },
    ],
  },
  {
    id: "comms-delay",
    title: "📡 Message from Earth… Delayed",
    desc: "Houston sent instructions 12 minutes ago (Mars delay). Do you wait for confirmation or act now?",
    choices: [
      { label: "Wait for confirmation (safe)", cost: { power: 5 }, gain: { health: 10, science: 5 }, tag: "Patient" },
      { label: "Act now (fast but risky)", cost: {}, gain: { science: 15, health: -8, power: 10 }, tag: "Fast" },
    ],
  },
  {
    id: "dust-storm",
    title: "🌪️ Dust Storm Building",
    desc: "Mars Trek shows opacity rising. Solar panels will drop 40% next sol.",
    choices: [
      { label: "Charge batteries now", cost: { power: -20 }, gain: { power: 20 }, tag: "Charge" }, // negative cost = you spend less now?
      { label: "Deploy wind shield (costs power)", cost: { power: 20 }, gain: { shielding: 20, health: 5 }, tag: "Shield" },
    ],
  },
];

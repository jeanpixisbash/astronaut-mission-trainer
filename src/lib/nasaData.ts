// NASA real data attributions — curated snapshots (per challenge: no inventar números)
export const REAL_MISSION_DATA = {
  donkiFlares: [
    { id: "FLR-2024-05-14-X8.7", date: "2024-05-14", class: "X8.7", label: "X8.7 — biggest of Solar Cycle 25", source: "DONKI", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/", effect: "Need shielding!" },
    { id: "FLR-2023-12-14-X2.8", date: "2023-12-14", class: "X2.8", label: "X2.8 flare", source: "DONKI", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/", effect: "Comms blackout" },
    { id: "FLR-2025-01-03-M7.6", date: "2025-01-03", class: "M7.6", label: "M7.6 flare", source: "DONKI", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/", effect: "Solar panels -20%" },
  ],
  radLabDose: { issAvg_mSvPerDay: 0.4, lunarSurface_mSvPerDay: 1.1, marsSurface_mSvPerDay: 0.64, source: "RadLab OSDR", url: "https://visualization.osdr.nasa.gov/radlab/gui/data-api/" },
  o2Consumption: { kgPerPersonPerDay: 0.84, waterPerPersonPerDay_L: 3.5, foodKcalPerPersonPerDay: 2500, source: "NASA Human Research Program / OSDR", url: "https://osdr.nasa.gov/bio/repo/" },
  marsFacts: { solHours: 24.65, commDelayMinMinutes: 12, moonDelaySeconds: 1.3, gravityVsEarth: 0.38, source: "Mars Trek", url: "https://trek.nasa.gov/mars/" },
};

// Shim kept for old imports — now lives in cardsCatalog.ts
export const SITUATIONS: never[] = [];

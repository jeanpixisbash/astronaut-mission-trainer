export type Resources = {
  power: number;
  oxygen: number;
  food: number;
  shielding: number;
  health: number;
  science: number;
};

export type GameState = {
  sol: number;
  maxSol: number;
  location: "moon" | "mars";
  resources: Resources;
  log: string[];
  gameOver: boolean;
  won: boolean;
};

export const INITIAL_RESOURCES: Resources = {
  power: 70,
  oxygen: 75,
  food: 65,
  shielding: 55,
  health: 100,
  science: 0,
};

export function createInitialState(location: "moon" | "mars" = "mars"): GameState {
  return {
    sol: 1,
    maxSol: 7,
    location,
    resources: { ...INITIAL_RESOURCES },
    log: [`Sol 1 — Outpost ready on ${location === "mars" ? "Mars" : "Moon"}!`],
    gameOver: false,
    won: false,
  };
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function canAfford(resources: Resources, cost: Partial<Resources>): boolean {
  for (const k of Object.keys(cost) as (keyof Resources)[]) {
    if ((resources[k] ?? 0) < (cost[k] ?? 0)) return false;
  }
  return true;
}

export function applyDailyUpkeep(s: GameState): GameState {
  const r = { ...s.resources };
  // Habitat burns resources every sol — no free lunch
  r.power = clamp(r.power - (s.location === "moon" ? 7 : 9));
  r.oxygen = clamp(r.oxygen - 10);
  r.food = clamp(r.food - 8);
  // Radiation if shielding low
  if (r.shielding < 30) r.health = clamp(r.health - 14);
  else if (r.shielding < 50) r.health = clamp(r.health - 6);
  // No air/food = health drops fast
  if (r.oxygen < 18) r.health = clamp(r.health - 16);
  if (r.food < 12) r.health = clamp(r.health - 10);
  if (r.power <= 0) r.health = clamp(r.health - 12); // blackout hurts
  return { ...s, resources: r };
}

export function checkEnd(s: GameState): GameState {
  if (s.resources.health <= 0 || s.resources.oxygen <= 0) {
    return { ...s, gameOver: true, won: false, log: [...s.log, `💥 Mission failed on Sol ${s.sol}. No air or health left!`] };
  }
  if (s.resources.power <= 0 && s.resources.oxygen < 25) {
    return { ...s, gameOver: true, won: false, log: [...s.log, `🔋 Blackout! No power to make oxygen — mission failed.`] };
  }
  if (s.sol >= s.maxSol) {
    const survived = s.resources.health > 25 && s.resources.oxygen > 12;
    return {
      ...s,
      gameOver: true,
      won: survived,
      log: [...s.log, survived ? `🎉 You did it! 7 sols survived with ${s.resources.science} science!` : `⚠️ Out of time — crew exhausted. Try better trade-offs!`],
    };
  }
  return s;
}

export function applyChoice(s: GameState, cost: Partial<Resources>, gain: Partial<Resources>, label: string): GameState {
  if (s.gameOver) return s;
  const r = { ...s.resources };
  for (const k of Object.keys(cost) as (keyof Resources)[]) r[k] = clamp(r[k] - (cost[k] ?? 0));
  for (const k of Object.keys(gain) as (keyof Resources)[]) {
    if (k === "science") r[k] = Math.max(0, r[k] + (gain[k] ?? 0));
    else r[k] = clamp(r[k] + (gain[k] ?? 0));
  }
  return { ...s, resources: r, log: [...s.log, `Sol ${s.sol}: ${label}`] };
}

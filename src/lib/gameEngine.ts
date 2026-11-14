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
  pendingEventId: string | null;
};

export const INITIAL_RESOURCES: Resources = {
  power: 75,
  oxygen: 80,
  food: 70,
  shielding: 60,
  health: 100,
  science: 0,
};

export function createInitialState(location: "moon" | "mars" = "mars"): GameState {
  return {
    sol: 1,
    maxSol: 7,
    location,
    resources: { ...INITIAL_RESOURCES },
    log: [`Sol 1 — Outpost online. ${location === "mars" ? "Mars" : "Moon"} environment loaded.`],
    gameOver: false,
    won: false,
    pendingEventId: null,
  };
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function applyDailyDecay(s: GameState): GameState {
  const r = { ...s.resources };
  // Base consumption — mirrors real astronaut needs
  r.power = clamp(r.power - (s.location === "moon" ? 8 : 10));
  r.oxygen = clamp(r.oxygen - 12);
  r.food = clamp(r.food - 10);
  // Radiation wear if shielding low
  if (r.shielding < 35) r.health = clamp(r.health - 12);
  else if (r.shielding < 50) r.health = clamp(r.health - 5);
  // Starvation / O2 crisis
  if (r.oxygen < 20) r.health = clamp(r.health - 15);
  if (r.food < 15) r.health = clamp(r.health - 8);
  return { ...s, resources: r };
}

export function checkEnd(s: GameState): GameState {
  if (s.resources.health <= 0 || s.resources.oxygen <= 0) {
    return {
      ...s,
      gameOver: true,
      won: false,
      log: [...s.log, `💥 Mission failed on Sol ${s.sol}. Crew health critical.`],
    };
  }
  if (s.sol >= s.maxSol) {
    const survived = s.resources.health > 30 && s.resources.oxygen > 10;
    return {
      ...s,
      gameOver: true,
      won: survived,
      log: [
        ...s.log,
        survived
          ? `🎉 Mission complete! You kept the crew alive for ${s.maxSol} sols with ${s.resources.science} science points.`
          : `⚠️ Mission ended — crew exhausted. Try balancing power better next time.`,
      ],
    };
  }
  return s;
}

export function applyChoice(
  s: GameState,
  cost: Partial<Resources>,
  gain: Partial<Resources>,
  label: string
): GameState {
  const r = { ...s.resources };
  (Object.keys(cost) as (keyof Resources)[]).forEach((k) => {
    r[k] = clamp(r[k] - (cost[k] ?? 0));
  });
  (Object.keys(gain) as (keyof Resources)[]).forEach((k) => {
    // allow science to exceed 100
    if (k === "science") r[k] = Math.max(0, r[k] + (gain[k] ?? 0));
    else r[k] = clamp(r[k] + (gain[k] ?? 0));
  });
  return {
    ...s,
    resources: r,
    log: [...s.log, `Sol ${s.sol}: ${label}`],
  };
}

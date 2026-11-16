// Progreso persistido (localStorage): estrellas por misión + tutorial visto.
const STARS_KEY = "sobrevive-sol-estrellas";
const TUTO_KEY = "sobrevive-sol-tuto-off";
const PARCHES_KEY = "sobrevive-sol-parches";
const TRIBU_KEY = "sobrevive-sol-tribu";
const JUGADORES_KEY = "sobrevive-sol-jugadores";

export function loadStars(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STARS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function saveStar(id: string, n: number): Record<string, number> {
  const s = loadStars();
  if (n > (s[id] ?? 0)) {
    s[id] = n;
    try {
      localStorage.setItem(STARS_KEY, JSON.stringify(s));
    } catch {
      /* sin storage, no persiste */
    }
  }
  return s;
}

export function tutoVisto(): boolean {
  try {
    return localStorage.getItem(TUTO_KEY) === "1";
  } catch {
    return false;
  }
}

export function marcarTutoVisto() {
  try {
    localStorage.setItem(TUTO_KEY, "1");
  } catch {
    /* sin storage */
  }
}

export function loadParches(): string[] {
  try {
    const raw = localStorage.getItem(PARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function ganarParche(id: string): string[] {
  const p = loadParches();
  if (p.includes(id)) return p;
  const n = [...p, id];
  try {
    localStorage.setItem(PARCHES_KEY, JSON.stringify(n));
  } catch {
    /* sin storage */
  }
  return n;
}

export type Tribu = { colonia: string; crew: [string, string, string]; color: string };

export const TRIBU_DEFAULT: Tribu = { colonia: "Aurora", crew: ["Ada", "Yuri", "Mae"], color: "#22d3ee" };

export function loadTribu(): Tribu {
  try {
    const raw = localStorage.getItem(TRIBU_KEY);
    if (!raw) return TRIBU_DEFAULT;
    const t = JSON.parse(raw) as Partial<Tribu>;
    return {
      colonia: t.colonia?.slice(0, 16) || TRIBU_DEFAULT.colonia,
      crew: [0, 1, 2].map((i) => t.crew?.[i]?.slice(0, 10) || TRIBU_DEFAULT.crew[i]) as [string, string, string],
      color: t.color || TRIBU_DEFAULT.color,
    };
  } catch {
    return TRIBU_DEFAULT;
  }
}

export function saveTribu(t: Tribu) {
  try {
    localStorage.setItem(TRIBU_KEY, JSON.stringify(t));
  } catch {
    /* sin storage */
  }
}

export function loadJugadores(): string[] {
  try {
    const raw = localStorage.getItem(JUGADORES_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return arr.map((s) => s.slice(0, 10)).filter(Boolean).slice(0, 4);
  } catch {
    return [];
  }
}

export function saveJugadores(j: string[]) {
  try {
    localStorage.setItem(JUGADORES_KEY, JSON.stringify(j));
  } catch {
    /* sin storage */
  }
}

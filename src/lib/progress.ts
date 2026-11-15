// Progreso persistido (localStorage): estrellas por misión + tutorial visto.
const STARS_KEY = "sobrevive-sol-estrellas";
const TUTO_KEY = "sobrevive-sol-tuto-off";

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

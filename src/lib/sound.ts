// Tiny WebAudio SFX — sin assets, bleeps kid-friendly.
// El contexto se crea en el primer gesto (jugarCarta) para respetar autoplay policies.
let ctx: AudioContext | null = null;
let muted =
  typeof localStorage !== "undefined" &&
  (() => {
    try {
      return localStorage.getItem("sobrevive-sol-mute") === "1";
    } catch {
      return false;
    }
  })();

export function isMuted() {
  return muted;
}

export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem("sobrevive-sol-mute", m ? "1" : "0");
  } catch {
    /* sin storage, sigue sonando */
  }
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur = 0.12, type: OscillatorType = "sine", vol = 0.12, delay = 0, slide = 0) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  click() {
    tone(520, 0.07, "triangle", 0.08);
  },
  flip() {
    if (muted) return;
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(600, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.08);
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + 0.12);
  },
  pop() {
    tone(440, 0.1, "sine", 0.14);
    tone(660, 0.12, "sine", 0.12, 0.07);
  },
  hit() {
    tone(220, 0.18, "sawtooth", 0.1, 0, -120);
  },
  alarm() {
    tone(880, 0.12, "square", 0.07);
    tone(880, 0.12, "square", 0.07, 0.16);
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, "triangle", 0.12, i * 0.1));
  },
  lose() {
    [392, 330, 262, 196].forEach((f, i) => tone(f, 0.2, "sawtooth", 0.08, i * 0.12));
  },
};

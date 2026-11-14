"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SITUATIONS, REAL_MISSION_DATA } from "@/lib/nasaData";
import { applyChoice, applyDailyUpkeep, canAfford, checkEnd, clamp, createInitialState, type GameState, type Resources } from "@/lib/gameEngine";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const RESOURCE_META: Record<string, { icon: string; label: string; color: string }> = {
  power: { icon: "⚡", label: "Power", color: "bg-amber-400" },
  oxygen: { icon: "💨", label: "Oxygen", color: "bg-cyan-400" },
  food: { icon: "🍎", label: "Food", color: "bg-emerald-400" },
  shielding: { icon: "🛡️", label: "Shield", color: "bg-violet-400" },
  health: { icon: "❤️", label: "Health", color: "bg-rose-400" },
  science: { icon: "🔬", label: "Science", color: "bg-amber-300" },
};

function Bar({ k, value }: { k: string; value: number }) {
  const meta = RESOURCE_META[k];
  const low = k !== "science" && value < 28;
  const pct = k === "science" ? Math.min(100, value) : clamp(value);
  return (
    <div className={`rounded-2xl border p-2.5 ${low ? "bg-red-500/10 border-red-400/30" : "bg-black/30 border-white/10"}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold tracking-wide">
          {meta.icon} {meta.label.toUpperCase()}
        </span>
        {low && <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">LOW!</span>}
      </div>
      <div className="mt-1 h-3 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full transition-all duration-500 ${low ? "bg-red-400" : meta.color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-sm font-black">{k === "science" ? `${value} pts` : `${clamp(value)}%`}</div>
    </div>
  );
}

function CostGain({ cost, gain }: { cost: Record<string, number>; gain: Record<string, number> }) {
  const hasCost = Object.keys(cost).length > 0;
  const gainEntries = Object.entries(gain).filter(([, v]) => v !== 0);
  return (
    <div className="space-y-1.5 text-xs">
      {hasCost ? (
        <div className="rounded-xl bg-red-500/15 border border-red-400/20 px-2.5 py-1.5">
          <div className="text-[10px] tracking-widest text-red-300 font-bold">YOU PAY</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(cost).map(([k, v]) => (
              <span key={k} className="rounded-full bg-red-500 text-white px-2 py-0.5 font-bold">
                -{v} {RESOURCE_META[k]?.icon} {RESOURCE_META[k]?.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5 text-white/50">No cost — but watch the downside!</div>
      )}
      <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/20 px-2.5 py-1.5">
        <div className="text-[10px] tracking-widest text-emerald-300 font-bold">YOU GET</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {gainEntries.map(([k, v]) => {
            const positive = v > 0;
            return (
              <span
                key={k}
                className={`rounded-full px-2 py-0.5 font-bold ${positive ? "bg-emerald-500 text-white" : "bg-amber-500 text-black"}`}
              >
                {v > 0 ? `+${v}` : `${v}`} {RESOURCE_META[k]?.icon} {RESOURCE_META[k]?.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PlayPage() {
  const [location, setLocation] = useState<"moon" | "mars">("mars");
  const [state, setState] = useState<GameState>(() => createInitialState("mars"));
  const [order, setOrder] = useState(() => [...SITUATIONS]);
  const [anim, setAnim] = useState<string | null>(null);

  useEffect(() => {
    // shuffle deck once on mount — random must not run during prerender
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(shuffle(SITUATIONS));
  }, []);

  const situation = useMemo(() => order[(state.sol - 1) % order.length], [order, state.sol]);
  const flare = REAL_MISSION_DATA.donkiFlares[(state.sol - 1) % REAL_MISSION_DATA.donkiFlares.length];

  const handleLocation = (loc: "moon" | "mars") => {
    setLocation(loc);
    if (state.sol === 1) {
      setState(createInitialState(loc));
      setOrder(shuffle(SITUATIONS));
    }
  };

  const play = (idx: number) => {
    if (state.gameOver) return;
    const choice = situation.choices[idx];
    if (!canAfford(state.resources, choice.cost as Partial<Resources>)) return;
    let next = applyChoice(state, choice.cost as Partial<Resources>, choice.gain as Partial<Resources>, `${situation.title} → ${choice.label}`);
    // daily habitat cost
    next = applyDailyUpkeep(next);
    next.sol += 1;
    next = checkEnd(next);
    setState(next);
    setAnim(choice.label);
    setTimeout(() => setAnim(null), 700);
  };

  const reset = () => {
    setState(createInitialState(location));
    setOrder(shuffle(SITUATIONS));
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#080c1a] text-zinc-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-[#080c1a]/80 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-2">
          <Link href="/" className="font-black tracking-tight flex items-center gap-2">
            <span className="size-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 grid place-items-center">◉</span>
            <span className="hidden sm:inline">Junior Astronaut</span>
            <span className="sm:hidden">Trainer</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex rounded-full border border-white/10 bg-white/5 p-1">
              {(["mars", "moon"] as const).map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocation(loc)}
                  disabled={state.sol !== 1}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${location === loc ? "bg-white text-black" : "text-white/60"} disabled:opacity-40`}
                >
                  {loc === "mars" ? "♂ Mars" : "☾ Moon"}
                </button>
              ))}
            </div>
            <span className="rounded-full bg-white text-black px-3 py-1 text-xs font-black">
              SOL {Math.min(state.sol, state.maxSol)}/{state.maxSol}
            </span>
            <button onClick={reset} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold">
              Restart
            </button>
          </div>
        </div>
      </header>

      {/* Top meters — big and kid-friendly */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <Bar k="power" value={state.resources.power} />
          <Bar k="oxygen" value={state.resources.oxygen} />
          <Bar k="food" value={state.resources.food} />
          <Bar k="shielding" value={state.resources.shielding} />
          <Bar k="health" value={state.resources.health} />
          <Bar k="science" value={state.resources.science} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className={`rounded-full px-2.5 py-1 border font-bold ${state.gameOver ? (state.won ? "bg-emerald-500 text-white border-emerald-600" : "bg-red-500 text-white border-red-600") : "bg-white/10 border-white/10"}`}>
            {state.gameOver ? (state.won ? "🎉 You survived 7 sols!" : "💥 Mission failed") : `👩‍🚀 Crew ${state.resources.health > 60 ? "happy 😊" : state.resources.health > 30 ? "tired 😐" : "in danger 😵"}`}
          </span>
          <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1">
            {location === "mars" ? "Mars • 12 min radio delay • dust storms" : "Moon • 1.3 sec delay • freezing nights"}
          </span>
        </div>
      </div>

      {/* Table */}
      <main className="mx-auto w-full max-w-6xl px-4 py-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-4 flex-1">
        {/* Left: Situation + hand */}
        <div className="space-y-3">
          {/* Situation card */}
          <div className={`rounded-[24px] border border-white/10 p-4 bg-gradient-to-br ${situation.color} text-white shadow-xl relative overflow-hidden`}>
            <div className="absolute -right-8 -top-8 text-7xl opacity-20 rotate-12">{situation.emoji}</div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/20 border border-white/20 px-3 py-1 text-xs font-black">
                <span className="size-2 rounded-full bg-white animate-pulse" /> SITUATION • SOL {state.sol}
              </div>
              <h2 className="mt-2 text-2xl font-black leading-none">
                {situation.emoji} {situation.title}
              </h2>
              <p className="mt-1 text-sm font-medium leading-5 text-white/90 max-w-[32ch]">{situation.desc}</p>
              <p className="mt-2 text-xs bg-black/20 border border-white/20 rounded-full inline-block px-2.5 py-1">
                🛰️ Why? {situation.why}
              </p>
            </div>
          </div>

          {/* Hand of 3 cards */}
          <div>
            <h3 className="text-sm font-black tracking-wide">YOUR CARDS — pick one!</h3>
            <p className="text-xs text-white/60">Each card helps one thing but hurts another. No free lunch in space!</p>
            <div className="mt-2 grid sm:grid-cols-3 gap-3">
              {situation.choices.map((c, i) => {
                const affordable = canAfford(state.resources, c.cost as Partial<Resources>);
                const disabled = state.gameOver || !affordable;
                return (
                  <button
                    key={i}
                    onClick={() => play(i)}
                    disabled={disabled}
                    className={`text-left rounded-[20px] border-2 p-3 bg-white text-zinc-900 shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:opacity-45 disabled:scale-100 disabled:cursor-not-allowed relative overflow-hidden ${anim === c.label ? "ring-4 ring-violet-400 scale-[1.02]" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{c.emoji}</span>
                      <span className={`text-[10px] font-black tracking-widest rounded-full px-2 py-1 ${c.tag === "RISKY" || c.tag === "FREEZE" ? "bg-amber-400 text-black" : c.tag.includes("SAFE") || c.tag === "WARM" ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white"}`}>
                        {c.tag}
                      </span>
                    </div>
                    <div className="mt-1 font-black leading-tight">{c.label}</div>
                    {c.funFact && <div className="text-[11px] text-zinc-500 leading-3 mt-0.5">{c.funFact}</div>}
                    <div className="mt-2">
                      <CostGain cost={c.cost} gain={c.gain} />
                    </div>
                    {!affordable && <div className="mt-2 text-xs font-bold text-red-600">⚠️ Not enough {Object.entries(c.cost).filter(([k, v]) => state.resources[k as keyof typeof state.resources] < v).map(([k]) => RESOURCE_META[k]?.label).join(", ")}!</div>}
                    <div className="mt-2 rounded-full bg-zinc-900 text-white text-xs font-black py-1.5 text-center">
                      {disabled ? (state.gameOver ? "Game over" : "Can't play") : "▶ Play this card"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {state.gameOver && (
            <div className={`rounded-[20px] border-2 p-4 ${state.won ? "bg-emerald-500 border-emerald-600 text-white" : "bg-red-500 border-red-600 text-white"}`}>
              <div className="text-lg font-black">{state.won ? "🎉 Mission complete!" : "💥 Outpost failed"}</div>
              <div className="text-sm font-medium mt-1">{state.log[state.log.length - 1]}</div>
              <button onClick={reset} className="mt-3 rounded-full bg-white text-black px-5 py-2 text-sm font-black">
                Play again — shuffle deck
              </button>
            </div>
          )}
        </div>

        {/* Right: log + NASA data */}
        <div className="space-y-3">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
            <h3 className="font-black text-sm">📋 Mission Log</h3>
            <div className="mt-2 max-h-[200px] overflow-auto rounded-xl bg-black/30 border border-white/10 p-2 text-xs leading-5 font-mono">
              {state.log.map((l, i) => (
                <div key={i} className={i === state.log.length - 1 ? "text-white font-bold" : "text-white/60"}>
                  {l}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
            <h3 className="font-black text-sm">🛰️ Real NASA data behind this card</h3>
            <div className="mt-2 space-y-2 text-sm">
              <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                <div className="text-xs text-white/50">DONKI flare (real)</div>
                <div className="font-bold text-white">{flare.label} — {flare.date}</div>
                <div className="text-xs text-white/60">{flare.effect}</div>
                <a href={flare.url} target="_blank" rel="noreferrer" className="text-xs text-violet-300 underline">Source: {flare.source} →</a>
              </div>
              <div className="rounded-xl bg-black/30 border border-white/10 p-3 text-xs leading-4 text-white/70">
                <b>For teachers:</b> ask “Which resource did you sacrifice and why?” Cards shuffle each game — try again and find a better trade!
              </div>
            </div>
          </div>

          <div className="rounded-[20px] bg-white text-zinc-900 p-4">
            <div className="font-black">How to win?</div>
            <div className="text-sm text-zinc-600 mt-1">Keep ❤️ Health & 💨 Oxygen above 0 for 7 sols. Every card shows <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs">YOU PAY</span> vs <span className="bg-emerald-500 text-white rounded-full px-1.5 py-0.5 text-xs">YOU GET</span>. If a card is grey, you can&apos;t afford it — that&apos;s the lesson!</div>
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-6 text-center text-xs text-white/30">
        NASA Space Apps 2026 • Junior Astronaut Mission Trainer • Uses public NASA open data • Not affiliated with NASA
      </footer>
    </div>
  );
}

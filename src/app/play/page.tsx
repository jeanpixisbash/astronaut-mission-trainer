"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { DAILY_EVENTS, REAL_MISSION_DATA } from "@/lib/nasaData";
import { applyChoice, applyDailyDecay, checkEnd, clamp, createInitialState, type GameState, type Resources } from "@/lib/gameEngine";

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  const low = value < 30;
  return (
    <div className="rounded-2xl bg-black/30 border border-white/10 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-widest text-white/50">{label}</span>
        {low && <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 rounded-full px-1.5 py-0.5">LOW</span>}
      </div>
      <div className="mt-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full transition-all ${color}`} style={{ width: `${clamp(value)}%` }} />
      </div>
      <div className="mt-1 text-sm font-bold">{clamp(value)}%</div>
    </div>
  );
}

export default function PlayPage() {
  const [location, setLocation] = useState<"moon" | "mars">("mars");
  const [state, setState] = useState<GameState>(() => createInitialState("mars"));
  const [eventIdx, setEventIdx] = useState(0);
  const [powerAlloc, setPowerAlloc] = useState({ life: 30, shield: 20, greenhouse: 20, science: 15 });
  const [showInfo, setShowInfo] = useState<string | null>(null);

  const handleLocationChange = (loc: "moon" | "mars") => {
    setLocation(loc);
    if (state.sol === 1 && state.log.length === 1) setState(createInitialState(loc));
  };

  const currentEvent = useMemo(() => DAILY_EVENTS[eventIdx % DAILY_EVENTS.length], [eventIdx]);
  const powerTotal = powerAlloc.life + powerAlloc.shield + powerAlloc.greenhouse + powerAlloc.science;
  const powerOk = powerTotal <= 85; // you get 85 usable; pushing to 100 strains system

  const advance = (choiceIdx: number) => {
    if (state.gameOver) return;
    const choice = currentEvent.choices[choiceIdx];
    let next = applyChoice(state, choice.cost as Partial<Resources>, choice.gain as Partial<Resources>, `${currentEvent.title} → ${choice.label}`);
    const allocGain: Partial<Resources> = {
      oxygen: Math.round(powerAlloc.life / 3),
      shielding: Math.round(powerAlloc.shield / 4),
      food: Math.round(powerAlloc.greenhouse / 3),
      science: Math.round(powerAlloc.science / 2),
      power: -Math.round(powerTotal / 6),
    };
    next = applyChoice(next, {}, allocGain, `Power split: Life ${powerAlloc.life}·Shield ${powerAlloc.shield}·Green ${powerAlloc.greenhouse}·Sci ${powerAlloc.science}`);
    next = applyDailyDecay(next);
    next.sol += 1;
    next = checkEnd(next);
    setState(next);
    setEventIdx((i) => i + 1);
  };

  const reset = () => {
    setState(createInitialState(location));
    setEventIdx(Math.floor(Math.random() * DAILY_EVENTS.length));
    setPowerAlloc({ life: 30, shield: 20, greenhouse: 20, science: 15 });
  };

  const flare = REAL_MISSION_DATA.donkiFlares[eventIdx % REAL_MISSION_DATA.donkiFlares.length];

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-20 backdrop-blur bg-[#080c1a]/80 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="font-semibold tracking-tight flex items-center gap-2">
            <span className="size-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 grid place-items-center text-xs">◉</span>
            <span className="hidden sm:inline">Junior Astronaut Trainer</span>
            <span className="sm:hidden">Trainer</span>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <div className="hidden sm:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
              {(["mars", "moon"] as const).map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocationChange(loc)}
                  disabled={state.sol !== 1}
                  className={`px-3 py-1 rounded-full capitalize font-medium transition ${location === loc ? "bg-white text-black" : "text-white/70 hover:text-white"} disabled:opacity-40`}
                >
                  {loc === "mars" ? "♂ Mars" : "☾ Moon"}
                </button>
              ))}
            </div>
            <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 font-medium">
              Sol {Math.min(state.sol, state.maxSol)}/{state.maxSol}
            </span>
            <button onClick={reset} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 hover:bg-white/10">
              Restart
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 grid lg:grid-cols-[1.15fr_0.85fr] gap-5 flex-1">
        {/* Left: dashboard */}
        <div className="space-y-4">
          {/* Status */}
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">
                Outpost — {location === "mars" ? "Mars · Valles Marineris" : "Moon · Shackleton Crater"}
                <span className="ml-2 text-xs font-normal text-white/50">
                  {location === "mars" ? `Comm delay ~${REAL_MISSION_DATA.marsFacts.commDelayMinMinutes} min` : `Delay ~1.3s`}
                </span>
              </div>
              <span
                className={`text-xs rounded-full px-2.5 py-1 border ${state.gameOver ? (state.won ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30") : "bg-white/10 text-white/70 border-white/10"}`}
              >
                {state.gameOver ? (state.won ? "● Mission Success" : "● Mission Failed") : "● Crew Nominal"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Bar label="POWER" value={state.resources.power} color="bg-amber-400" />
              <Bar label="OXYGEN" value={state.resources.oxygen} color="bg-cyan-400" />
              <Bar label="FOOD" value={state.resources.food} color="bg-emerald-400" />
              <Bar label="SHIELDING" value={state.resources.shielding} color="bg-violet-400" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/30 border border-white/10 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] tracking-widest text-white/50">CREW HEALTH</div>
                  <div className="text-sm font-bold">{clamp(state.resources.health)}%</div>
                </div>
                <div className="text-xl">{state.resources.health > 60 ? "😊" : state.resources.health > 30 ? "😐" : "😵"}</div>
              </div>
              <div className="rounded-2xl bg-black/30 border border-white/10 p-3">
                <div className="text-[10px] tracking-widest text-white/50">SCIENCE</div>
                <div className="text-sm font-bold">{state.resources.science} pts</div>
                <div className="text-xs text-white/50">Experiments & discoveries</div>
              </div>
            </div>

            {state.gameOver && (
              <div className={`mt-4 rounded-2xl border p-4 ${state.won ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                <div className="font-semibold">{state.won ? "🎉 You did it!" : "💥 Outpost in trouble"}</div>
                <div className="text-sm text-white/70 mt-1">
                  {state.won
                    ? "You balanced everything for 7 sols. Real NASA planners do the same math every day."
                    : "Try again — focus on 2–3 resources at a time. No choice is free in space."}
                </div>
                <button onClick={reset} className="mt-3 rounded-full bg-white text-black px-4 py-2 text-sm font-semibold">
                  Play again
                </button>
              </div>
            )}
          </div>

          {/* Power allocation */}
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">⚡ Power allocation — you have 85W usable</h3>
              <span className={`text-xs rounded-full px-2 py-1 border ${powerOk ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" : "bg-amber-500/15 text-amber-300 border-amber-500/20"}`}>
                {powerTotal} / 85W {powerOk ? "✓ balanced" : "⚠ over budget"}
              </span>
            </div>
            <p className="text-xs text-white/55 mt-1">Slide each system. More power here = less somewhere else. Kids 7–12: try keeping Life Support above 25W!</p>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              {[
                { key: "life", label: "Life Support (O₂)", hint: "Makes oxygen — need 0.84 kg/person/day", color: "accent-cyan-400" },
                { key: "shield", label: "Radiation Shield", hint: "Protects from flares — real dose 0.4–1.1 mSv/day", color: "accent-violet-400" },
                { key: "greenhouse", label: "Greenhouse (Food)", hint: "Grows lettuce — 2500 kcal/person/day", color: "accent-emerald-400" },
                { key: "science", label: "Science Lab", hint: "Scores points but burns power", color: "accent-amber-400" },
              ].map((s) => (
                <label key={s.key} className="rounded-2xl bg-black/25 border border-white/10 p-3 block">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-white/60">{powerAlloc[s.key as keyof typeof powerAlloc]}W</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={powerAlloc[s.key as keyof typeof powerAlloc]}
                    onChange={(e) => setPowerAlloc((p) => ({ ...p, [s.key]: Number(e.target.value) }))}
                    className="w-full mt-2"
                  />
                  <div className="text-[11px] text-white/45 leading-3 mt-1">{s.hint}</div>
                </label>
              ))}
            </div>
            <button
              onClick={() => setShowInfo(showInfo ? null : "power")}
              className="mt-2 text-xs text-white/50 underline underline-offset-4"
            >
              What is a watt? →
            </button>
            {showInfo === "power" && (
              <div className="mt-2 text-xs leading-4 text-white/70 bg-black/30 border border-white/10 rounded-xl p-3">
                A <b>watt</b> is power — like water flow. Your habitat makes ~85 watts from solar. Split it: every watt to shielding is a watt not making oxygen. That is the trade-off NASA lives with.
              </div>
            )}
          </div>

          {/* Event card */}
          {!state.gameOver && (
            <div className="rounded-[20px] border border-amber-400/30 bg-amber-400/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold">{currentEvent.title}</div>
                  <div className="text-sm text-white/75 leading-5 mt-1">{currentEvent.desc}</div>
                </div>
                <span className="shrink-0 text-[11px] rounded-full bg-black/30 border border-white/10 px-2 py-1">Sol {state.sol}</span>
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {currentEvent.choices.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => advance(idx)}
                    className={`rounded-2xl border p-3 text-left transition ${idx === 0 ? "bg-white text-black border-white hover:bg-zinc-100" : "bg-white/5 border-white/15 hover:bg-white/10 text-white"}`}
                  >
                    <div className="text-sm font-semibold leading-4">{c.label}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {c.cost && Object.keys(c.cost).length ? `Cost: ${Object.entries(c.cost).map(([k, v]) => `${v} ${k}`).join(", ")}` : "No upfront cost"}
                      {"  "}· + {Object.entries(c.gain).map(([k, v]) => `${v} ${k}`).join(", ")}
                    </div>
                    <span className="inline-block mt-1 text-[10px] tracking-widest opacity-60">{c.tag}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-white/50">Tip for 7–12: there is no perfect answer — pick the trade you understand.</div>
            </div>
          )}
        </div>

        {/* Right: log + data */}
        <div className="space-y-4">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
            <h3 className="font-semibold text-sm">📋 Mission Log</h3>
            <div className="mt-2 max-h-[220px] overflow-auto rounded-xl bg-black/30 border border-white/10 p-2 text-xs leading-5 font-mono">
              {state.log.map((l, i) => (
                <div key={i} className="text-white/75">
                  {l}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
            <h3 className="font-semibold text-sm">🛰️ Real NASA data in this sol</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                <div className="text-xs text-white/50">DONKI Flare (real)</div>
                <div className="font-medium">{flare.label}</div>
                <div className="text-xs text-white/60">{flare.date} · {flare.effect}</div>
                <a href={flare.url} target="_blank" rel="noreferrer" className="text-xs text-violet-300 underline underline-offset-4">
                  Source: {flare.source} →
                </a>
              </div>
              <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                <div className="text-xs text-white/50">Radiation dose (real)</div>
                <div className="text-xs leading-4 text-white/70">
                  ISS avg <b>{REAL_MISSION_DATA.radLabDose.issAvg_mSvPerDay} mSv/day</b> · Moon ~{REAL_MISSION_DATA.radLabDose.lunarSurface_mSvPerDay} · Mars ~{REAL_MISSION_DATA.radLabDose.marsSurface_mSvPerDay}
                </div>
                <a href={REAL_MISSION_DATA.radLabDose.url} target="_blank" rel="noreferrer" className="text-xs text-violet-300 underline underline-offset-4">
                  Source: {REAL_MISSION_DATA.radLabDose.source} →
                </a>
              </div>
              <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                <div className="text-xs text-white/50">Life support (real)</div>
                <div className="text-xs leading-4 text-white/70">
                  Astronaut needs <b>{REAL_MISSION_DATA.o2Consumption.kgPerPersonPerDay} kg O₂</b>, {REAL_MISSION_DATA.o2Consumption.waterPerPersonPerDay_L} L water, {REAL_MISSION_DATA.o2Consumption.foodKcalPerPersonPerDay} kcal per day.
                </div>
                <a href={REAL_MISSION_DATA.o2Consumption.url} target="_blank" rel="noreferrer" className="text-xs text-violet-300 underline underline-offset-4">
                  Source: OSDR →
                </a>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-white/35">
              Curated snapshots embedded for demo stability. Labeled honestly per challenge rules. Live APIs at api.nasa.gov.
            </p>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-gradient-to-br from-violet-600/20 to-cyan-500/20 p-4">
            <div className="font-semibold text-sm">Teacher / Parent mode</div>
            <div className="text-xs text-white/70 mt-1 leading-4">
              Ask: “Why did you pick shielding over science?” Replay — events shuffle each run. Talk about real trade-offs: power vs air vs discovery.
            </div>
            <Link href="/" className="inline-block mt-2 text-xs underline underline-offset-4 text-white">
              Back to overview →
            </Link>
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-6 text-center text-xs text-white/30">
        Built for NASA Space Apps 2026 · Junior Astronaut Mission Trainer · Uses public NASA open data · Not affiliated with NASA
      </footer>
    </div>
  );
}

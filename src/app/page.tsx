import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh bg-[#080c1a] text-zinc-100 selection:bg-violet-500/30">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-[#080c1a]/70 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="size-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 grid place-items-center text-sm">
              ◉
            </span>
            Junior Astronaut Trainer
            <span className="hidden sm:inline text-xs font-normal text-white/60 ml-1">
              NASA Space Apps 2026
            </span>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <a href="#how" className="hidden sm:block text-white/70 hover:text-white">
              How it works
            </a>
            <a href="#data" className="hidden sm:block text-white/70 hover:text-white">
              NASA Data
            </a>
            <Link href="/codex" className="hidden sm:block text-white/70 hover:text-white">
              📖 Codex
            </Link>
            <Link
              href="/play"
              className="rounded-full bg-white text-black px-4 py-1.5 font-medium hover:bg-zinc-100 transition"
            >
              Play now →
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_20%_10%,rgba(124,58,237,0.25),transparent),radial-gradient(500px_500px_at_90%_20%,rgba(6,182,212,0.18),transparent)] pointer-events-none" />
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 relative">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Beginner · Games · Space Exploration
              <span className="hidden sm:inline text-white/40">•</span>
              <span className="hidden sm:inline">Ages 7–12</span>
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-[0.95] tracking-tight">
              Run a <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">lunar or Martian</span>{" "}
              outpost.
              <br />
              Every watt has a cost.
            </h1>
            <p className="mt-4 text-[15px] leading-6 text-white/70 max-w-xl">
              You are in charge of life support, radiation shielding, power, food and comms. A choice that saves power
              today might cost oxygen tomorrow. Learn the real trade-offs NASA planners face — through play, not a quiz.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/play"
                className="rounded-full bg-white text-black px-6 py-3 font-semibold hover:bg-zinc-100 transition shadow-lg shadow-white/10"
              >
                ▶ Start Mission — 7 Sols
              </Link>
              <a
                href="#how"
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium hover:bg-white/10 transition"
              >
                How it works
              </a>
            </div>
            <p className="mt-3 text-xs text-white/50">
              No download · No login · Browser playable · Built with real NASA open data
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
              {[
                { k: "Power", v: "Budget it", d: "Split 100W between life support, shielding, greenhouse & science" },
                { k: "O₂ / Food", v: "Keep alive", d: "Astronauts need 0.84 kg O₂ & 2500 kcal / day — for real" },
                { k: "Radiation", v: "Shield or risk", d: "Real DONKI flares & ISS RadLab dose data" },
              ].map((c) => (
                <div key={c.k} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[11px] tracking-widest text-white/50 uppercase">{c.k}</div>
                  <div className="text-sm font-semibold">{c.v}</div>
                  <div className="text-xs text-white/60 leading-4 mt-1">{c.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission card */}
          <div className="relative">
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 sm:p-5 shadow-2xl">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span className="rounded-full bg-white/10 px-2.5 py-1">◉ Outpost — Mars · Sol 3/7</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-2 py-1">
                  ● Crew OK
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: "POWER", value: 62, color: "bg-amber-400" },
                  { label: "OXYGEN", value: 48, color: "bg-cyan-400" },
                  { label: "FOOD", value: 55, color: "bg-emerald-400" },
                  { label: "SHIELDING", value: 38, color: "bg-violet-400" },
                ].map((r) => (
                  <div key={r.label} className="rounded-2xl bg-black/30 border border-white/10 p-3">
                    <div className="text-[10px] tracking-widest text-white/50">{r.label}</div>
                    <div className="mt-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full ${r.color}`} style={{ width: `${r.value}%` }} />
                    </div>
                    <div className="mt-1 text-sm font-semibold">{r.value}%</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-amber-400/15 border border-amber-400/30 p-3">
                <div className="text-sm font-semibold">☀️ Solar Flare Incoming!</div>
                <div className="text-xs text-white/70">
                  DONKI detected an X8.7 flare. Reinforce shielding now or save power?
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="flex-1 rounded-full bg-white text-black text-xs font-semibold py-1.5 text-center">
                    Reinforce (+30 Shield, −25 Power)
                  </span>
                  <span className="flex-1 rounded-full border border-white/20 bg-white/5 text-xs font-medium py-1.5 text-center">
                    Save power (Risky)
                  </span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-white/45 text-center">
                Grounds gameplay in real NASA open data — not invented stats.
              </p>
            </div>
            <div className="absolute -z-10 -right-6 -bottom-6 size-48 rounded-full bg-violet-600/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="text-xl font-semibold">How the training works</h2>
        <p className="text-sm text-white/60 mt-1 max-w-2xl">
          Turn-based survival for 7 sols. No safe choice — every decision trades one resource for another, just like real
          mission planning.
        </p>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            {
              n: "01",
              t: "Allocate power",
              d: "You get ~100W per sol. Split it between life support (O₂), shielding, greenhouse and science. Plain language, big sliders, instant feedback.",
            },
            {
              n: "02",
              t: "Face an event",
              d: "Real DONKI flares, dust storms, greenhouse alerts and comm delays. Choose: safe & costly or risky & cheap?",
            },
            {
              n: "03",
              t: "Watch consequences",
              d: "Choices compound. Low shielding → health drops. Low O₂ → crisis. Science points reward smart risk.",
            },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs text-white/40">{s.n}</div>
              <div className="font-semibold mt-1">{s.t}</div>
              <div className="text-sm text-white/65 leading-5 mt-1">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Data */}
      <section id="data" className="mx-auto max-w-6xl px-5 pb-10">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <h3 className="font-semibold">Grounded in real NASA open data</h3>
          <p className="text-sm text-white/60 mt-1">
            We embed curated real datasets and attribute them inside the game — honest about what is live vs curated, as
            the challenge asks.
          </p>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            {[
              { name: "DONKI", desc: "Solar flares & CMEs — radiation risk", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/" },
              { name: "RadLab OSDR", desc: "ISS radiation dosimetry — real dose rates", url: "https://visualization.osdr.nasa.gov/radlab/" },
              { name: "OSDR Bio", desc: "Astronaut health — bone, muscle, immune", url: "https://osdr.nasa.gov/bio/repo/" },
              { name: "Mars Trek", desc: "Mars terrain & imagery", url: "https://trek.nasa.gov/mars/" },
            ].map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/10 bg-black/20 p-3 hover:bg-black/30 transition block"
              >
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-white/60">{r.desc}</div>
                <div className="text-xs text-violet-300 mt-1 underline underline-offset-4">open →</div>
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/40">
            Tip: live DONKI/Mars APIs work with a free api.nasa.gov key. For demo stability we ship curated snapshots
            and label them as such.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="mx-auto max-w-6xl px-5 pb-14">
        <div className="rounded-[24px] bg-white text-black p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-lg">Ready to command the outpost?</div>
            <div className="text-sm text-black/60">7 sols. 3 resources. No free choices. Ages 7–12 (fun for grown-ups too).</div>
          </div>
          <Link href="/play" className="rounded-full bg-black text-white px-6 py-3 font-semibold hover:bg-zinc-800 transition">
            Launch Mission →
          </Link>
          <Link href="/codex" className="rounded-full border border-black/15 px-6 py-3 font-semibold hover:bg-black/5 transition">
            📖 Codex NASA
          </Link>
        </div>
        <p className="text-center text-xs text-white/30 mt-4">
          Built for NASA Space Apps 2026 · Junior Astronaut Mission Trainer · Not affiliated with NASA — uses public open data.
        </p>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { LangToggle, useLang } from "@/lib/i18n";

export default function Home() {
  const { t } = useLang();
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
              {t("l_nav_how")}
            </a>
            <a href="#data" className="hidden sm:block text-white/70 hover:text-white">
              {t("l_nav_data")}
            </a>
            <Link href="/codex" className="hidden sm:block text-white/70 hover:text-white">
              📖 Codex
            </Link>
            <LangToggle dark />
            <Link
              href="/play"
              className="rounded-full bg-white text-black px-4 py-1.5 font-medium hover:bg-zinc-100 transition"
            >
              {t("l_nav_play")}
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
              {t("l_badge")}
              <span className="hidden sm:inline text-white/40">•</span>
              <span className="hidden sm:inline">{t("l_ages")}</span>
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-[0.95] tracking-tight">
              {t("l_h1a")}{" "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{t("l_h1b")}</span>{" "}
              {t("l_h1c")}
            </h1>
            <p className="mt-4 text-[15px] leading-6 text-white/70 max-w-xl">{t("l_sub")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/play"
                className="rounded-full bg-white text-black px-6 py-3 font-semibold hover:bg-zinc-100 transition shadow-lg shadow-white/10"
              >
                {t("l_cta1")}
              </Link>
              <a
                href="#how"
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium hover:bg-white/10 transition"
              >
                {t("l_cta2")}
              </a>
            </div>
            <p className="mt-3 text-xs text-white/50">{t("l_note")}</p>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
              {[
                { k: t("l_p1k"), v: t("l_p1v"), d: t("l_p1d") },
                { k: t("l_p2k"), v: t("l_p2v"), d: t("l_p2d") },
                { k: t("l_p3k"), v: t("l_p3v"), d: t("l_p3d") },
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
                <span className="rounded-full bg-white/10 px-2.5 py-1">{t("l_card_outpost")}</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-2 py-1">
                  {t("l_card_crew")}
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
                <div className="text-sm font-semibold">{t("l_card_flare_t")}</div>
                <div className="text-xs text-white/70">{t("l_card_flare_d")}</div>
                <div className="mt-2 flex gap-2">
                  <span className="flex-1 rounded-full bg-white text-black text-xs font-semibold py-1.5 text-center">
                    {t("l_card_b1")}
                  </span>
                  <span className="flex-1 rounded-full border border-white/20 bg-white/5 text-xs font-medium py-1.5 text-center">
                    {t("l_card_b2")}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-white/45 text-center">{t("l_card_ground")}</p>
            </div>
            <div className="absolute -z-10 -right-6 -bottom-6 size-48 rounded-full bg-violet-600/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="text-xl font-semibold">{t("l_how_t")}</h2>
        <p className="text-sm text-white/60 mt-1 max-w-2xl">{t("l_how_sub")}</p>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            { n: "01", t: t("l_s1t"), d: t("l_s1d") },
            { n: "02", t: t("l_s2t"), d: t("l_s2d") },
            { n: "03", t: t("l_s3t"), d: t("l_s3d") },
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
          <h3 className="font-semibold">{t("l_data_t")}</h3>
          <p className="text-sm text-white/60 mt-1">{t("l_data_sub")}</p>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            {[
              { name: "DONKI", desc: t("l_d1d"), url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/" },
              { name: "RadLab OSDR", desc: t("l_d2d"), url: "https://visualization.osdr.nasa.gov/radlab/" },
              { name: "OSDR Bio", desc: t("l_d3d"), url: "https://osdr.nasa.gov/bio/repo/" },
              { name: "Mars Trek", desc: t("l_d4d"), url: "https://trek.nasa.gov/mars/" },
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
                <div className="text-xs text-violet-300 mt-1 underline underline-offset-4">{t("l_open")}</div>
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/40">{t("l_tip")}</p>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="mx-auto max-w-6xl px-5 pb-14">
        <div className="rounded-[24px] bg-white text-black p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-lg">{t("l_cta_t")}</div>
            <div className="text-sm text-black/60">{t("l_cta_sub")}</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/play" className="rounded-full bg-black text-white px-6 py-3 font-semibold hover:bg-zinc-800 transition">
              {t("l_nav_play")}
            </Link>
            <Link href="/codex" className="rounded-full border border-black/15 px-6 py-3 font-semibold hover:bg-black/5 transition">
              📖 Codex NASA
            </Link>
          </div>
        </div>
        <p className="text-center text-xs text-white/30 mt-4">{t("l_footer")}</p>
      </div>
    </div>
  );
}

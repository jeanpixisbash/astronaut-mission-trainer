"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ATAQUE, EVENTOS_GLOBALES, SUPERVIVENCIA } from "@/lib/cardsCatalog";
import type { Recursos } from "@/lib/gameEngine";
import { LangToggle, RES_ICON, useLang } from "@/lib/i18n";
import { GUIA_EN, cardText, fuenteNombre } from "@/lib/i18n-data";

type Filtro = "todas" | "energia" | "soporte" | "biodomo" | "blindaje" | "rojo" | "eventos";

type Tab = "cartas" | "guia";

const GUIA: { emoji: string; titulo: string; que: string; como: string }[] = [
  { emoji: "🎯", titulo: "El objetivo", que: "Mantén tu colonia viva todos los días de la misión.", como: "Si cualquier barra llega a 0% o a 100%, la colonia colapsa. ¡Los dos extremos matan!" },
  { emoji: "⚡", titulo: "Energía", que: "Electricidad de paneles y reactores. Todo la gasta.", como: "Sin energía no hay oxígeno ni comida. Cuídala de noche y con polvo." },
  { emoji: "💧", titulo: "Oxígeno y agua", que: "El aire que respiras y el agua que bebes y reciclas.", como: "La tripulación gasta cada noche. La ISS recicla el 98% del agua." },
  { emoji: "🌱", titulo: "Comida", que: "Raciones y lo que crece en el invernadero.", como: "Cada astronauta necesita unas 2500 kcal al día. ¡A sembrar!" },
  { emoji: "🛡️", titulo: "Escudo", que: "Tu casco contra radiación y piedritas espaciales.", como: "Con Sol fuerte o tormenta, súbelo. Sin escudo, la tripulación se enferma." },
  { emoji: "⚡", titulo: "Acciones (PA)", que: "Tus movimientos de cada día. Tienes 3.", como: "Cada carta gasta 1 a 3. Se acaban: elige bien. Vuelven cada amanecer." },
  { emoji: "🛡️", titulo: "¡A cubierto!", que: "Te escondes y el daño se parte a la mitad.", como: "Úsalo el día que venga algo feo. Se desbloquea el día 3." },
  { emoji: "⚡", titulo: "Reforzar", que: "Le metes +1 acción a una carta para +10 a su mejor efecto.", como: "Solo si te sobra una acción. ¿Vale la pena? Tú decides." },
  { emoji: "🔄", titulo: "Girar cartas", que: "Cada carta se puede voltear como las de verdad.", como: "Atrás dice qué es, por qué jugarla y el dato NASA." },
  { emoji: "🔭", titulo: "Se acerca…", que: "El ataque rojo que viene mañana, a la vista.", como: "Lee qué hace y prepara tu defensa hoy. Sin sorpresas." },
  { emoji: "🌌", titulo: "Eventos globales", que: "El espacio pega cada 3 días: noche, Sol, polvo…", como: "Míralos en la línea de tiempo y guarda recursos antes." },
  { emoji: "😴", titulo: "Desgaste de la noche", que: "Dormir también gasta: −5 energía, oxígeno y comida.", como: "Pasa solo, cada noche. Por eso nunca guardes todo para después." },
  { emoji: "🚨", titulo: "Alertas sorpresa", que: "Fuego o basura espacial, sin aviso.", como: "El astronauta te frena y te explica las 3 opciones. Elige con calma." },
  { emoji: "🤝", titulo: "Negociación", que: "Cambias 6% de algo por 3% de otra cosa.", como: "La radio solo da para 2 mensajes por día. ¡Que valgan!" },
  { emoji: "📋", titulo: "Rutinas", que: "Tareas chiquitas gratis cuando todo está en calma.", como: "Si todo está entre 25 y 75, elige 1 por día: +4 gratis." },
  { emoji: "👁️", titulo: "Sin telemetría", que: "Los % se esconden y ves ??.", como: "Dura 1 turno. Juega de memoria… ¡o espera al día siguiente!" },
  { emoji: "⚖️", titulo: "Equilibrio", que: "Qué tan cerca está todo de 50%.", como: "Más equilibrio = más estrellas. Lo extremo colapsa." },
  { emoji: "★", titulo: "Estrellas", que: "Tu nota: 1 por ganar, hasta 3 por equilibrio.", como: "Gana para desbloquear la siguiente misión. ¡Colecciónalas!" },
  { emoji: "🎖️", titulo: "Veteranía", que: "Ganar una misión ayuda en la siguiente.", como: "Empiezas con +5 en tu barra más baja. ¡Los veteranos ayudan!" },
];

function Chips({ impacto }: { impacto: Partial<Record<string, number>> }) {
  return (
    <span className="flex flex-wrap gap-1">
      {Object.entries(impacto).map(([k, v]) => (
        <span key={k} className={`rounded-full px-2 py-0.5 text-xs font-black text-white ${v! > 0 ? "bg-emerald-600" : "bg-red-600"}`}>
          {v! > 0 ? `+${v}` : v}{RES_ICON[k as keyof Recursos]}
        </span>
      ))}
    </span>
  );
}

export default function CodexPage() {
  const { lang, t } = useLang();
  const [tab, setTab] = useState<Tab>("cartas");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [q, setQ] = useState("");

  const FAM: Record<string, string> =
    lang === "en"
      ? { energia: "ENERGY", soporte: "LIFE SUPPORT", biodomo: "BIO-DOME", blindaje: "SHIELDING" }
      : { energia: "ENERGÍA", soporte: "SOPORTE", biodomo: "BIO-DOMO", blindaje: "BLINDAJE" };

  const FILTROS: { id: Filtro; label: string }[] = [
    { id: "todas", label: t("filtro_todas") },
    { id: "energia", label: `⚡ ${FAM.energia}` },
    { id: "soporte", label: `💧 ${FAM.soporte}` },
    { id: "biodomo", label: `🌱 ${FAM.biodomo}` },
    { id: "blindaje", label: `🛡️ ${FAM.blindaje}` },
    { id: "rojo", label: t("filtro_rojo") },
    { id: "eventos", label: t("filtro_eventos") },
  ];

  const guia = GUIA.map((g, i) => (lang === "en" ? { ...g, ...GUIA_EN[i] } : g));

  const matchQ = (t: string) => t.toLowerCase().includes(q.trim().toLowerCase());
  const txtQ = (c: { id: string; nombre: string; explicacion: string; fundamento?: string }) => {
    const m = cardText(lang, { nombre: c.nombre, explicacion: c.explicacion, fundamento: c.fundamento ?? "", id: c.id });
    return `${m.nombre} ${m.explicacion} ${m.fundamento}`;
  };

  const sup = useMemo(
    () =>
      SUPERVIVENCIA.filter(
        (c) => (filtro === "todas" || c.familia === filtro) && matchQ(txtQ(c))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtro, q, lang]
  );
  const atq = useMemo(
    () => ATAQUE.filter(() => (filtro === "todas" || filtro === "rojo") && true),
    [filtro]
  ).filter((c) => matchQ(txtQ(c)));
  const evs = useMemo(
    () => EVENTOS_GLOBALES.filter(() => filtro === "todas" || filtro === "eventos"),
    [filtro]
  ).filter((e) => matchQ(txtQ({ ...e, fundamento: "" }) + " " + e.datoReal));

  return (
    <div className="min-h-dvh bg-[#05070f] text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070f]/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/play" className="font-black tracking-tight">{t("volver_juego")}</Link>
          <span className="text-sm font-black">{t("codex_h")}</span>
          <div className="flex items-center gap-2">
            <LangToggle dark />
            <Link href="/" className="text-xs text-white/60">{t("inicio")}</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-10">
        <h1 className="pt-5 text-2xl font-black">{t("codex_t")}</h1>
        <p className="mt-1 text-sm text-white/60">
          {t("codex_sub")}
        </p>

        <div className="mt-3 flex gap-2">
          {(
            [
              { id: "cartas", label: t("tab_cartas") },
              { id: "guia", label: t("tab_guia") },
            ] as { id: Tab; label: string }[]
          ).map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex-1 rounded-2xl py-2.5 text-sm font-black ${tab === tb.id ? "bg-white text-black" : "border border-white/15 bg-white/5 text-white/70"}`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {tab === "guia" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {guia.map((g) => (
              <div key={g.titulo + g.emoji} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="text-base font-black">
                  {g.emoji} {g.titulo}
                </div>
                <p className="mt-1 text-[13px] leading-5 text-white/85">{g.que}</p>
                <p className="mt-1 rounded-xl bg-black/30 px-2.5 py-1.5 text-[13px] leading-5 text-white/70">
                  <b className="text-emerald-300">{lang === "en" ? "How does it work?" : "¿Cómo funciona?"}</b> {g.como}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-black ${filtro === f.id ? "bg-white text-black" : "border border-white/15 bg-white/5 text-white/70"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("buscar_ph")}
          className="mt-3 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-cyan-400"
        />

        {(filtro === "todas" || ["energia", "soporte", "biodomo", "blindaje"].includes(filtro)) && (
          <>
            <h2 className="mt-6 text-sm font-black tracking-widest text-white/60">{t("sec_sup")} ({sup.length})</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sup.map((c) => {
                const tc = cardText(lang, c);
                return (
                  <div key={c.id} className="rounded-2xl border-2 border-[#d8cfb4] bg-[#f7f1dd] p-3 text-stone-900">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-black leading-tight">{tc.nombre}</div>
                      <span className="shrink-0 rounded-full bg-stone-900 px-2 py-0.5 text-xs font-black text-white">{c.pa} {lang === "en" ? "AP" : "PA"}</span>
                    </div>
                    <div className="mt-1.5"><Chips impacto={c.impacto} /></div>
                    <p className="mt-1.5 text-[13px] leading-5">{tc.explicacion}</p>
                    <p className="mt-1.5 rounded-xl bg-stone-900/5 p-2 text-[11px] leading-4 text-stone-700">
                      🛰️ <b>{t("sello")}</b> {tc.fundamento}{" "}
                      <a href={c.fuente.url} target="_blank" rel="noreferrer" className="font-bold text-cyan-700 underline">
                        {t("fuente")} {fuenteNombre(lang, c.fuente.nombre)} →
                      </a>
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {(filtro === "todas" || filtro === "rojo") && (
          <>
            <h2 className="mt-6 text-sm font-black tracking-widest text-white/60">{t("sec_rojo")} ({atq.length})</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {atq.map((c) => {
                const tc = cardText(lang, c);
                return (
                  <div key={c.id} className="rounded-2xl border-2 border-red-500 bg-gradient-to-br from-red-500 to-orange-600 p-3 text-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-black leading-tight">{tc.nombre}</div>
                      <span className="shrink-0 rounded-full bg-black px-2 py-0.5 text-xs font-black text-white">{c.pa} {lang === "en" ? "AP" : "PA"}</span>
                    </div>
                    <div className="mt-1.5"><Chips impacto={c.efectoRival as Partial<Record<keyof Recursos, number>>} /></div>
                    <p className="mt-1.5 text-[13px] leading-5 text-white/90">{tc.explicacion}</p>
                    <p className="mt-1.5 rounded-xl bg-black/20 p-2 text-[11px] leading-4 text-white/85">
                      🛰️ <b>{t("sello")}</b> {tc.fundamento}{" "}
                      <a href={c.fuente.url} target="_blank" rel="noreferrer" className="font-bold underline">
                        {t("fuente")} {fuenteNombre(lang, c.fuente.nombre)} →
                      </a>
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {(filtro === "todas" || filtro === "eventos") && (
          <>
            <h2 className="mt-6 text-sm font-black tracking-widest text-white/60">{t("sec_eventos")} ({evs.length})</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {evs.map((e) => {
                const tc = cardText(lang, { ...e, fundamento: "" });
                return (
                  <div key={e.id} className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3">
                    <div className="font-black">🌌 {tc.nombre}</div>
                    <div className="mt-1.5"><Chips impacto={e.efecto} /></div>
                    <p className="mt-1.5 text-[13px] leading-5 text-white/85">{tc.explicacion}</p>
                    <p className="mt-1.5 text-[11px] leading-4 text-white/60">
                      📡 {e.datoReal}{" "}
                      <a href={e.fuente.url} target="_blank" rel="noreferrer" className="font-bold text-violet-300 underline">
                        {t("fuente")} {fuenteNombre(lang, e.fuente.nombre)} →
                      </a>
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {sup.length + atq.length + evs.length === 0 && (
          <p className="mt-8 text-center text-sm text-white/50">{t("sin_res")}</p>
        )}

        <p className="mt-8 text-center text-xs text-white/30">
          {t("codex_fuentes")}
        </p>
          </>
        )}
      </main>
    </div>
  );
}

"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "es" | "en";
export type ResKey = "energia" | "oxigeno" | "comida" | "escudo";

const LANG_KEY = "sobrevive-sol-lang";

export const RES_ICON: Record<ResKey, string> = {
  energia: "⚡",
  oxigeno: "💧",
  comida: "🌱",
  escudo: "🛡️",
};

export const RES_LABEL: Record<Lang, Record<ResKey, string>> = {
  es: { energia: "ENERGÍA", oxigeno: "OXÍGENO", comida: "COMIDA", escudo: "ESCUDO" },
  en: { energia: "POWER", oxigeno: "OXYGEN", comida: "FOOD", escudo: "SHIELD" },
};

/** Nombre de recurso en minúscula para frases (logs, veteranía). */
export const RES_NAME: Record<Lang, Record<ResKey, string>> = {
  es: { energia: "energía", oxigeno: "oxígeno", comida: "comida", escudo: "escudo" },
  en: { energia: "power", oxigeno: "oxygen", comida: "food", escudo: "shield" },
};

const UI = {
  dia: { es: "DÍA", en: "DAY" },
  dias: { es: "días", en: "days" },
  reiniciar: { es: "Reiniciar", en: "Restart" },
  mute_off: { es: "Silenciar", en: "Mute" },
  mute_on: { es: "Activar sonido", en: "Unmute" },
  elige: { es: "ELIGE 1 CARTA", en: "PICK 1 CARD" },
  negociando: { es: "NEGOCIANDO", en: "NEGOTIATING" },
  estable: { es: "✅ ESTABLE", en: "✅ STABLE" },
  red_usada: { es: "🪂 RED USADA", en: "🪂 NET USED" },
  turno_de: { es: "👥 Turno de {x}", en: "👥 {x}'s turn" },
  cubierto: { es: "🛡️ ¡A CUBIERTO! (½ daño)", en: "🛡️ TAKE COVER! (½ damage)" },
  cubierto_on: { es: "🛡️ ¡A CUBIERTO! ON", en: "🛡️ COVER ON" },
  cubierto_locked: { es: "🔒 ¡A CUBIERTO! (DÍA 3)", en: "🔒 TAKE COVER! (DAY 3)" },
  cubierto_title: {
    es: "Guardas 1 acción sin gastar: todo el daño que recibas este turno se parte a la mitad",
    en: "Hold 1 unspent action: all damage you take this turn is halved",
  },
  tripulacion: { es: "TRIPULACIÓN", en: "CREW" },
  feliz: { es: "feliz", en: "happy" },
  cansada: { es: "cansada", en: "tired" },
  peligro: { es: "en peligro", en: "in danger" },
  lista: { es: "🎓 LISTA DE ENTRENAMIENTO", en: "🎓 TRAINING CHECKLIST" },
  chk1: { es: "Juega una carta", en: "Play a card" },
  chk2: { es: "Sobrevive al ataque rojo", en: "Survive the red attack" },
  chk3: { es: "Protégete (¡a cubierto! o trueque)", en: "Protect yourself (cover or trade)" },
  coach_d1d: {
    es: "PASO 1: tocá una carta. Lo rojo PAGÁS, lo verde GANÁS. Hoy solo hay 2 para empezar fácil.",
    en: "STEP 1: tap a card. Red you PAY, green you GAIN. Only 2 today to start easy.",
  },
  coach_d2t: { es: "🔭 Mirá lo que SE ACERCA y elegí tu defensa", en: "🔭 Watch what's COMING and pick your defense" },
  coach_d2d: {
    es: "Cada carta roja te pega después de jugar. ¡A cubierto! y la negociación llegan el día 3.",
    en: "Each red card hits after you play. Cover and negotiation unlock on day 3.",
  },
  coach_m0_day1_title: { es: "PASO 1 · TU DECISIÓN", en: "STEP 1 · YOUR DECISION" },
  coach_m0_day1: {
    es: "Hoy solo aprenderás las cartas. No hay ataque ni desgaste: toca una carta y mira qué cambia.",
    en: "Today you only learn cards. No attack or night wear: tap a card and watch what changes.",
  },
  coach_m0_day2_title: { es: "PASO 2 · UNA AMENAZA", en: "STEP 2 · ONE THREAT" },
  coach_m0_day2: {
    es: "Ahora aparecerá un ataque rojo después de tu carta. No lo causaste tú: es un problema externo.",
    en: "A red attack now appears after your card. You didn't cause it: it's an outside problem.",
  },
  coach_m0_day3_title: { es: "PASO 3 · EL ESPACIO RESPONDE", en: "STEP 3 · SPACE RESPONDS" },
  coach_m0_day3: {
    es: "Hoy llega un evento global. Después de esto ya conoces el ciclo completo de una misión.",
    en: "A global event arrives today. After this, you know the complete mission cycle.",
  },
  entendido: { es: "Entendido", en: "Got it" },
  se_acerca: { es: "🔭 SE ACERCA:", en: "🔭 INCOMING:" },
  oculta_pct: { es: "ocultará tus % 1 turno", en: "will hide your % for 1 turn" },
  juega_defensa: { es: "· juega escudo o ¡a cubierto!", en: "· play shield or take cover!" },
  rutina_t: { es: "📋 RUTINA GRATIS (1 POR DÍA)", en: "📋 FREE ROUTINE (1 PER DAY)" },
  hint_touch: { es: "👆 Toca para ver · de nuevo para jugar · ", en: "👆 Tap to preview · tap again to play · " },
  hint_all: {
    es: "❓ ¿QUÉ HACE? te explica cada carta · ⚡ ACCIONES ●●●: jugar gasta, vuelven cada día",
    en: "❓ WHAT DOES IT DO? explains each card · ⚡ ACTIONS ●●●: playing spends them, they return daily",
  },
  reforzar: { es: "⚡ REFORZAR: +1 PA → +10 al mayor beneficio", en: "⚡ BOOST: +1 AP → +10 to biggest gain" },
  reforzada: { es: "⚡ REFORZADA: +1 PA → +10 (toca para quitar)", en: "⚡ BOOSTED: +1 AP → +10 (tap to remove)" },
  neg_t: { es: "🤝 NEGOCIACIÓN", en: "🤝 NEGOTIATION" },
  saltar: { es: "Saltar →", en: "Skip →" },
  doy: { es: "Doy 6%", en: "Give 6%" },
  recibo: { es: "Recibo 3%", en: "Get 3%" },
  trueque: { es: "Trueque 6→3", en: "Trade 6→3" },
  sin_senal: { es: "📻 Sin señal", en: "📻 No signal" },
  radio_n: { es: "📻 {a}/2 mensajes", en: "📻 {a}/2 messages" },
  radio_limit: { es: "📻 La radio solo da para 2 mensajes por negociación", en: "📻 Radio only allows 2 messages per negotiation" },
  siguiente: { es: "SIGUIENTE → ({a}/{b})", en: "NEXT → ({a}/{b})" },
  ver_resultado: { es: "¡VER RESULTADO! 🎬", en: "SEE RESULT! 🎬" },
  lee: { es: "Lee tranquilo, el juego te espera", en: "Read easy, the game waits" },
  db_sigue: { es: "🧑‍🚀 ¿QUÉ PASÓ?", en: "🧑‍🚀 WHAT HAPPENED?" },
  db_pierde: { es: "💥 ¡OH NO! ¿QUÉ PASÓ?", en: "💥 OH NO! WHAT HAPPENED?" },
  db_gana: { es: "🎉 ¡ÚLTIMO DÍA! ¿QUÉ PASÓ?", en: "🎉 LAST DAY! WHAT HAPPENED?" },
  total_dia: { es: "📊 TOTAL DEL DÍA", en: "📊 DAY TOTAL" },
  entendido_btn: { es: "¡Entendido! →", en: "Got it! →" },
  emergencia: { es: "¡EMERGENCIA!", en: "EMERGENCY!" },
  alerta_sub: {
    es: "HOUSTON TE EXPLICA: NO HAY MALAS, SOLO DISTINTAS",
    en: "HOUSTON EXPLAINS: NO BAD ONES, JUST DIFFERENT",
  },
  bien: { es: "¡Bien decidido!", en: "Good call!" },
  briefing_btn: { es: "¡Entendido, Houston! 🚀", en: "Got it, Houston! 🚀" },
  elige_mision: { es: "🚀 ELIGE TU MISIÓN", en: "🚀 PICK YOUR MISSION" },
  elige_sub: {
    es: "Gana una para desbloquear la siguiente. Las estrellas premian el equilibrio.",
    en: "Win one to unlock the next. Stars reward balance.",
  },
  tribu: { es: "✏️ MI TRIPULACIÓN", en: "✏️ MY CREW" },
  colonia: { es: "Colonia", en: "Colony" },
  astro: { es: "Astro", en: "Astro" },
  traje: { es: "Traje:", en: "Suit:" },
  juntos: { es: "👥 MODO JUNTOS (OPCIONAL)", en: "👥 PARTY MODE (OPTIONAL)" },
  juntos_d: {
    es: "Turnos por día, hot-seat. Uno juega cada día.",
    en: "One player per day, hot-seat. Each day a different player.",
  },
  juntos_ph: { es: "Nombres separados por coma", en: "Comma-separated names" },
  juntos_off: { es: "Quitar modo juntos (", en: "Remove party mode (" },
  parches: { es: "🎖️ MIS PARCHES", en: "🎖️ MY PATCHES" },
  sobreviviste: { es: "🎉 ¡Sobreviviste {d} días!", en: "🎉 You survived {d} days!" },
  otro: { es: "Jugar de nuevo", en: "Play again" },
  cambiar: { es: "Cambiar misión", en: "Change mission" },
  est3: { es: "¡Equilibrio perfecto!", en: "Perfect balance!" },
  est2: { es: "¡Muy equilibrado!", en: "Well balanced!" },
  est1: { es: "¡Vivo! Prueba más equilibrio", en: "Alive! Try more balance" },
  est0: { es: "Sin estrellas — inténtalo de nuevo", en: "No stars — try again" },
  record: { es: " · Récord: ", en: " · Best: " },
  recap: { es: "📖 ¿QUÉ PASÓ ESTE TURNO?", en: "📖 WHAT HAPPENED THIS TURN?" },
  win_msg: { es: "¡Misión cumplida, {c}! Houston aplaude. 👏", en: "Mission complete, {c}! Houston applauds. 👏" },
  lose_msg: { es: "Houston… ¿{c}, me copias?… Inténtalo de nuevo. 💔", en: "Houston… {c}, do you copy?… Try again. 💔" },
  bitacora: { es: "📋 BITÁCORA", en: "📋 LOG" },
  regla: {
    es: "Regla de Oro: 0% o 100% = colapso. Gana la más cercana a 50%.",
    en: "Golden rule: 0% or 100% = collapse. Closest to 50% wins.",
  },
  guia: { es: "❓ ¿CÓMO FUNCIONA CADA COSA? → GUÍA", en: "❓ HOW DOES EACH THING WORK? → GUIDE" },
  hoy: { es: "🌌 Hoy:", en: "🌌 Today:" },
  timeline: { es: "🌌 TIMELINE", en: "🌌 TIMELINE" },
  mision_p: { es: "🎯 MISIÓN", en: "🎯 MISSION" },
  mision_detalle: { es: "Elige una misión para ver su detalle.", en: "Pick a mission to see details." },
  guion: { es: "👥 Guion:", en: "👥 Turn:" },
  online: { es: "📡 Houston en línea. ¡Buena suerte!", en: "📡 Houston online. Good luck!" },
  vigila: { es: "📡 Día {d}. Houston vigila.", en: "📡 Day {d}. Houston watching." },
  red: { es: "📡 ¡Te lancé mi paracaídas! ¡Era el único que tenía!", en: "📡 I threw you my parachute! It was my only one!" },
  red_log: {
    es: "🪂 ¡Red Houston! +12 a lo que estaba en 0. ¡Solo había una!",
    en: "🪂 Houston net! +12 to whatever hit 0. I only had one!",
  },
  ia_oculta: { es: "🔴 IA: {n} — ¡telemetría oculta 1 turno!", en: "🔴 AI: {n} — telemetry hidden 1 turn!" },
  ia_ataque: { es: "🔴 Ataque IA: {n} {e}{p}", en: "🔴 AI attack: {n} {e}{p}" },
  ia_prot: { es: " (½ por Protocolo)", en: " (½ via Protocol)" },
  evento_radio: { es: "🌌 Evento global: {n} — ¡radio muerta 1 turno!", en: "🌌 Global event: {n} — radio dead 1 turn!" },
  veterania: { es: "🎖️ Veteranía: +5 {r} por ganar {m}.", en: "🎖️ Veteran: +5 {r} for winning {m}." },
  trueque_log: { es: "🤝 Trueque: {m}", en: "🤝 Trade: {m}" },
  rutina_log: { es: "📋 Rutina: {n} ({q})", en: "📋 Routine: {n} ({q})" },
  alerta_log: { es: "🚨 Alerta: {t} → {o}", en: "🚨 Alert: {t} → {o}" },
  falta: { es: "FALTAN {a} PA — tienes {b}", en: "NEED {a} AP — you have {b}" },
  tocad: { es: "▶ TOCÁ DE NUEVO", en: "▶ TAP AGAIN" },
  jugar: { es: "▶ JUGAR", en: "▶ PLAY" },
  puntos: { es: "···", en: "···" },
  que_es: { es: "❓ ¿QUÉ ES?", en: "❓ WHAT IS IT?" },
  porque: { es: "🎯 ¿POR QUÉ JUGARLA?", en: "🎯 WHY PLAY IT?" },
  usala: { es: "Sube {r} {v}. Úsala cuando esté en rojo.", en: "Raises {r} {v}. Play it when it's in the red." },
  ojo: { es: "Ojo: baja {r} {v}.", en: "Watch out: lowers {r} {v}." },
  cuesta1: { es: "Cuesta {n} acción.", en: "Costs {n} action." },
  cuestaN: { es: "Cuesta {n} acciones.", en: "Costs {n} actions." },
  dato: { es: "Dato NASA:", en: "NASA fact:" },
  fuente: { es: "Fuente:", en: "Source:" },
  saber: { es: "❓ ¿QUÉ HACE?", en: "❓ WHAT DOES IT DO?" },
  volver: { es: "↩ VOLVER", en: "↩ BACK" },
  sello: { es: "Sello NASA:", en: "NASA stamp:" },
  detalle_t: { es: "🔍 ¿QUÉ HACE ESTA CARTA?", en: "🔍 WHAT DOES THIS CARD DO?" },
  cuesta_pa: { es: "Cuesta {n} PA", en: "Costs {n} AP" },
  sin_dano: { es: "Sin daño directo.", en: "No direct damage." },
  tele_vuelve: {
    es: "👁️ Sin telemetría este turno — los % vuelven el día {d}",
    en: "👁️ No telemetry this turn — % back on day {d}",
  },
  objetivo_chip: { es: "🎯 {n}: {o}", en: "🎯 {n}: {o}" },
  codex_t: { es: "📖 Codex del astronauta", en: "📖 Astronaut codex" },
  codex_sub: {
    es: "Lee las cartas o aprende cómo funciona cada cosa. Houston te explica todo.",
    en: "Read the cards or learn how everything works. Houston explains it all.",
  },
  tab_cartas: { es: "🃏 Cartas", en: "🃏 Cards" },
  tab_guia: { es: "🎓 ¿Cómo funciona?", en: "🎓 How does it work?" },
  buscar_ph: { es: "Buscar: oxígeno, polvo, reactor…", en: "Search: oxygen, dust, reactor…" },
  sec_sup: { es: "CARTAS DE SUPERVIVENCIA", en: "SURVIVAL CARDS" },
  sec_rojo: { es: "MAZO ROJO — ATAQUE / CLIMA", en: "RED DECK — ATTACK / WEATHER" },
  sec_eventos: { es: "EVENTOS GLOBALES NASA", en: "NASA GLOBAL EVENTS" },
  sin_res: { es: "Sin resultados — prueba otra palabra.", en: "No results — try another word." },
  codex_fuentes: {
    es: "Fuentes: DONKI, OSDR, Mars Trek, programas NASA (MOXIE, FSP, ECLSS, Veggie) · Enlaces externos a nasa.gov",
    en: "Sources: DONKI, OSDR, Mars Trek, NASA programs (MOXIE, FSP, ECLSS, Veggie) · External links to nasa.gov",
  },
  volver_juego: { es: "← Volver al juego", en: "← Back to game" },
  inicio: { es: "Inicio", en: "Home" },
  codex_h: { es: "📖 CODEX NASA", en: "📖 NASA CODEX" },
  filtro_todas: { es: "Todas", en: "All" },
  filtro_rojo: { es: "🔴 Ataque", en: "🔴 Attack" },
  filtro_eventos: { es: "🌌 Eventos", en: "🌌 Events" },
  l_nav_how: { es: "Cómo funciona", en: "How it works" },
  l_nav_data: { es: "Datos NASA", en: "NASA Data" },
  l_nav_play: { es: "Jugar →", en: "Play now →" },
  l_badge: { es: "Principiante · Juegos · Exploración espacial", en: "Beginner · Games · Space Exploration" },
  l_ages: { es: "Edades 7–12", en: "Ages 7–12" },
  l_h1a: { es: "Dirige una base", en: "Run a" },
  l_h1b: { es: "lunar o marciana", en: "lunar or Martian" },
  l_h1c: { es: "Cada vatio cuesta.", en: "outpost. Every watt has a cost." },
  l_sub: {
    es: "Estás a cargo del soporte vital, el escudo de radiación, la energía y la comida. Lo que ahorra energía hoy puede costar oxígeno mañana. Aprende los dilemas reales de NASA jugando, no en un quiz.",
    en: "You are in charge of life support, radiation shielding, power and food. A choice that saves power today might cost oxygen tomorrow. Learn the real trade-offs NASA planners face — through play, not a quiz.",
  },
  l_cta1: { es: "▶ Empezar misión", en: "▶ Start Mission" },
  l_cta2: { es: "Cómo funciona", en: "How it works" },
  l_note: {
    es: "Sin descargas · Sin cuentas · Se juega en el navegador · Datos abiertos reales de NASA",
    en: "No download · No login · Browser playable · Built with real NASA open data",
  },
  l_p1k: { es: "Energía", en: "Power" },
  l_p1v: { es: "Repártela", en: "Budget it" },
  l_p1d: { es: "3 acciones por día entre soporte vital, escudo, invernadero y refuerzos", en: "3 actions a day across life support, shielding, greenhouse and boosts" },
  l_p2k: { es: "O₂ / Comida", en: "O₂ / Food" },
  l_p2v: { es: "Mantén la vida", en: "Keep alive" },
  l_p2d: { es: "Los astronautas usan 0.84 kg de O₂ al día — de verdad", en: "Astronauts use 0.84 kg of O₂ per day — for real" },
  l_p3k: { es: "Radiación", en: "Radiation" },
  l_p3v: { es: "Escudo o riesgo", en: "Shield or risk" },
  l_p3d: { es: "Fulguraciones DONKI reales y dosis RadLab de la ISS", en: "Real DONKI flares & ISS RadLab dose data" },
  l_card_outpost: { es: "◉ Base — Marte · Día 3", en: "◉ Outpost — Mars · Day 3" },
  l_card_crew: { es: "● Tripulación OK", en: "● Crew OK" },
  l_card_flare_t: { es: "☀️ ¡Fulguración en camino!", en: "☀️ Solar Flare Incoming!" },
  l_card_flare_d: {
    es: "DONKI detectó una fulguración X8.7. ¿Refuerzas el escudo o ahorras energía?",
    en: "DONKI detected an X8.7 flare. Reinforce shielding or save power?",
  },
  l_card_b1: { es: "Reforzar (+30 Escudo, −25 Energía)", en: "Reinforce (+30 Shield, −25 Power)" },
  l_card_b2: { es: "Ahorrar (riesgoso)", en: "Save power (Risky)" },
  l_card_ground: {
    es: "Mecánica con datos abiertos reales de NASA — no números inventados.",
    en: "Grounds gameplay in real NASA open data — not invented stats.",
  },
  l_how_t: { es: "Cómo funciona el entrenamiento", en: "How the training works" },
  l_how_sub: {
    es: "Supervivencia por turnos en misiones con historia. Ninguna opción es gratis — cada carta ayuda un sistema y daña otro, como planear de verdad.",
    en: "Turn-based survival across story missions. No safe choice — every card helps one system and hurts another, just like real mission planning.",
  },
  l_s1t: { es: "Juega una carta", en: "Play a card" },
  l_s1d: {
    es: "Tienes 3 acciones por día. Gira cualquier carta para saber qué hace y juégala. Consecuencias claras, palabras simples, todo al instante.",
    en: "You get 3 actions per day. Flip any card to learn what it does, then play it. Clear consequences, plain words, instant feedback.",
  },
  l_s2t: { es: "Enfrenta el mazo rojo", en: "Face the red deck" },
  l_s2d: {
    es: "Fulguraciones, polvo, micrometeoritos y apagones te pegan después de jugar. Lee el pronóstico y protégete… o escóndete.",
    en: "Flares, dust, micrometeorites and blackouts hit after you play. Read the forecast and shield up — or hide.",
  },
  l_s3t: { es: "Mira las consecuencias", en: "Watch consequences" },
  l_s3d: {
    es: "Cada paso se resuelve frente a ti con números reales. Mantén las 4 barras lejos del 0% y del 100% — los dos extremos matan.",
    en: "Every step resolves in front of you with real numbers. Keep all 4 bars away from 0% and 100% — both extremes kill.",
  },
  l_data_t: { es: "Con datos abiertos reales de NASA", en: "Grounded in real NASA open data" },
  l_data_sub: {
    es: "Datos reales curados con fuentes dentro del juego — honestos sobre qué es en vivo y qué es archivo, como pide el reto.",
    en: "We embed curated real datasets and attribute them inside the game — honest about what is live vs curated, as the challenge asks.",
  },
  l_d1d: { es: "Fulguraciones y CMEs — riesgo de radiación", en: "Solar flares & CMEs — radiation risk" },
  l_d2d: { es: "Dosimetría ISS — dosis reales", en: "ISS radiation dosimetry — real dose rates" },
  l_d3d: { es: "Salud astronauta — hueso, músculo, defensa", en: "Astronaut health — bone, muscle, immune" },
  l_d4d: { es: "Terreno e imágenes de Marte", en: "Mars terrain & imagery" },
  l_open: { es: "abrir →", en: "open →" },
  l_tip: {
    es: "Tip: DONKI/Marte en vivo funcionan con una key gratis de api.nasa.gov. Para la demo usamos archivos curados y lo decimos.",
    en: "Tip: live DONKI/Mars APIs work with a free api.nasa.gov key. For demo stability we ship curated snapshots and label them as such.",
  },
  l_cta_t: { es: "¿Lista tu colonia?", en: "Ready to command the outpost?" },
  l_cta_sub: { es: "4 misiones. 4 sistemas. Sin opciones gratis. 7–12 años (y adultos también).", en: "4 missions. 4 systems. No free choices. Ages 7–12 (fun for grown-ups too)." },
  l_footer: {
    es: "Hecho para NASA Space Apps 2026 · Junior Astronaut Mission Trainer · Sin afiliación con NASA — usa datos públicos.",
    en: "Built for NASA Space Apps 2026 · Junior Astronaut Mission Trainer · Not affiliated with NASA — uses public open data.",
  },
} as const;

export type UIKey = keyof typeof UI;

export function fmt(s: string, v: Record<string, string | number>): string {
  return Object.entries(v).reduce((a, [k, val]) => a.replaceAll(`{${k}}`, String(val)), s);
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: UIKey) => string };

const LangCtx = createContext<Ctx>({ lang: "es", setLang: () => undefined, t: (k) => UI[k].es });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      if (typeof localStorage === "undefined") return "es";
      const s = localStorage.getItem(LANG_KEY);
      return s === "en" ? "en" : "es";
    } catch {
      return "es";
    }
  });
  useEffect(() => {
    try {
      document.documentElement.lang = lang;
    } catch {
      /* ssr */
    }
  }, [lang ]);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* sin storage */
    }
  };
  const t = (k: UIKey) => UI[k][lang];
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLang(): Ctx {
  return useContext(LangCtx);
}

export function LangToggle({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`flex items-center gap-1 rounded-full border px-1 py-0.5 text-xs font-black ${
        dark ? "border-white/15 bg-white/5" : "border-black/15 bg-black/5"
      }`}
      role="group"
      aria-label="Idioma / Language"
    >
      {(["es", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2 py-0.5 uppercase transition ${
            lang === l ? (dark ? "bg-white text-black" : "bg-black text-white") : "opacity-60 hover:opacity-100"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

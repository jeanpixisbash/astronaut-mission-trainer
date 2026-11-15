import type { CartaAtaque, EventoGlobal } from "@/lib/cardsCatalog";

export type ParticleKind = "stars" | "dust" | "flare" | "radiation" | "calm" | "snow" | "capsule";

export type Scene = {
  id: string;
  emoji: string;
  titulo: string;
  subtitulo: string;
  cielo: string; // css gradient
  suelo: string;
  particulas: ParticleKind;
  alerta?: string;
};

export function sceneFor(
  eventoHoy: EventoGlobal | null,
  ultimoAtaque: CartaAtaque | null,
  dia: number
): Scene {
  if (eventoHoy) {
    switch (eventoHoy.id) {
      case "noche-lunar":
        return { id: "noche", emoji: "🌑", titulo: "Noche lunar", subtitulo: eventoHoy.datoReal, cielo: "linear-gradient(to bottom, #020617 0%, #0b1026 60%, #1a1333 100%)", suelo: "linear-gradient(to bottom, #3f3a4a, #23202e)", particulas: "stars", alerta: "Sin sol 354 h — paneles dormidos" };
      case "fulguracion-x":
        return { id: "flare", emoji: "☀️", titulo: "Fulguración clase X", subtitulo: eventoHoy.datoReal, cielo: "linear-gradient(to bottom, #431407 0%, #9a3412 45%, #fbbf24 75%, #fff7ed 100%)", suelo: "linear-gradient(to bottom, #8a6a4a, #4a3421)", particulas: "flare", alerta: "Radiación alta — sube el escudo" };
      case "tormenta-global-marte":
        return { id: "polvo", emoji: "🌪️", titulo: "Tormenta global marciana", subtitulo: eventoHoy.datoReal, cielo: "linear-gradient(to bottom, #451a03 0%, #92400e 55%, #d97706 100%)", suelo: "linear-gradient(to bottom, #b45309, #78350f)", particulas: "dust", alerta: "Polvo bloquea 99% del sol" };
      case "viento-calmo":
        return { id: "calma", emoji: "✨", titulo: "Viento solar calmo", subtitulo: eventoHoy.datoReal, cielo: "linear-gradient(to bottom, #020617 0%, #1e1b4b 55%, #312e81 100%)", suelo: "linear-gradient(to bottom, #9a8f7a, #5a5346)", particulas: "calm" };
      case "capsula-reabastecimiento":
        return { id: "capsula", emoji: "🚀", titulo: "Cápsula de reabastecimiento", subtitulo: eventoHoy.datoReal, cielo: "linear-gradient(to bottom, #082f49 0%, #0c4a6e 60%, #38bdf8 100%)", suelo: "linear-gradient(to bottom, #9a8f7a, #5a5346)", particulas: "capsule" };
      case "pico-radiacion":
        return { id: "rad", emoji: "☢️", titulo: "Pico de radiación galáctica", subtitulo: eventoHoy.datoReal, cielo: "linear-gradient(to bottom, #2e1065 0%, #6d28d9 55%, #c4b5fd 100%)", suelo: "linear-gradient(to bottom, #6b6257, #3f3a33)", particulas: "radiation", alerta: "Rayos cósmicos — busca regolito" };
    }
  }
  if (ultimoAtaque && dia > 1) {
    if (ultimoAtaque.id === "tormenta-polvo")
      return { id: `atk-polvo-${dia}`, emoji: "🌪️", titulo: "Polvo dirigido", subtitulo: "La IA te lanzó una tormenta", cielo: "linear-gradient(to bottom, #451a03, #92400e 60%, #d97706)", suelo: "linear-gradient(to bottom, #b45309, #78350f)", particulas: "dust", alerta: "Ataque rojo en curso" };
    if (ultimoAtaque.id === "micrometeoritos")
      return { id: `atk-micro-${dia}`, emoji: "☄️", titulo: "Micrometeoritos", subtitulo: "Impactos en el casco", cielo: "linear-gradient(to bottom, #020617, #1e293b 60%, #475569)", suelo: "linear-gradient(to bottom, #8a8474, #4a463d)", particulas: "snow", alerta: "Microfugas — revisa escudo" };
    if (ultimoAtaque.id === "pulso-sobrecarga")
      return { id: `atk-pulso-${dia}`, emoji: "⚡", titulo: "Pulso de sobrecarga", subtitulo: "Te empujan hacia el 100%", cielo: "linear-gradient(to bottom, #431407, #c2410c 55%, #fde68a)", suelo: "linear-gradient(to bottom, #8a6a4a, #4a3421)", particulas: "flare", alerta: "Ojo con el 100% — también colapsa" };
  }
  // default: luna tranquila, alterna marte cada 2 días
  const marte = dia % 2 === 0;
  return marte
    ? { id: `marte-${dia}`, emoji: "♂", titulo: "Marte — Valles Marineris", subtitulo: "Polvo leve · enlace 12 min", cielo: "linear-gradient(to bottom, #0c0a09 0%, #451a03 55%, #b45309 80%, #e7a06a 100%)", suelo: "linear-gradient(to bottom, #c2703d, #7c3f1d)", particulas: "calm" }
    : { id: `luna-${dia}`, emoji: "☾", titulo: "Luna — Cráter Shackleton", subtitulo: "Cielo negro · Sol duro", cielo: "linear-gradient(to bottom, #020617 0%, #0b1026 60%, #3b3654 82%, #9a8f7a 100%)", suelo: "linear-gradient(to bottom, #a8a094, #6e675c)", particulas: "stars" };
}

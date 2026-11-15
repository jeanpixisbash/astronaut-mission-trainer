# Roadmap — Sobrevive al Sol

> Propuestas de mejora investigadas 2026-11-15 (referentes: Reigns, Slay the Spire, Tharsis + tutorialización infantil).
> Estado: **P0 en implementación**. P1/P2 guardados para si alcanza la hackathon.

## P0 — Entender qué pasa (HECHO ✅ commit a1103e4)
Ataca la queja "tiro cartas sin saber qué pasa": preview solo-hover, resolución instantánea, sin pronóstico.

- [x] **1. Secuencia de resolución por pasos** — animar carta → ataque IA → evento → desgaste con números flotantes `+X/−X` sobre cada barra (~700ms por paso). Mismo cálculo, solo mostrado.
- [x] **2. Intent del enemigo** (Slay the Spire) — mostrar la carta roja que viene *antes* de jugar: "🔴 Se acerca: …". Sorpresa → estrategia.
- [x] **3. Consecuencia siempre visible** — en táctil (sin hover) primer tap = preview ampliado, segundo tap = jugar. En desktop con hover, un click juega.
- [x] **4. Recap de muerte** — "¿Qué te mató?": cadena de iconos del último turno en vez de solo texto.

## P1 — Sentir qué pasa (HECHO ✅ commit 28144ae)
- [ ] **5. Tripulación con cara** (Tharsis) — 3 astronautas 😊→😐→😵 según la barra más baja; el daño tiene a quién dolerle.
- [ ] **6. Tutorial guionado días 1-2** — día 1: solo 2 cartas + fantasma que señala; protocolo y negociación se desbloquean día 3. Una mecánica por día.
- [ ] **7. Sonido + juice** — pop al ganar recurso, golpe grave al perder, alarma en <20%.

## P2 — Querer volver (HECHO ✅ commit 28144ae)
- [ ] **8. Medidor de equilibrio** — dial "⚖️ Equilibrio %" (cercanía a 50%) siempre visible; objetivo deja de ser abstracto.
- [ ] **9. Estrellas por partida** (1-3) según equilibrio + días — meta para rejugar.
- [ ] **10. Modo historia corto** — 3 misiones con guion en vez de solo endless 15 días.

# Junior Astronaut Mission Trainer — NASA Space Apps 2026

> **Run a lunar or Martian outpost. Every watt has a cost.**
> Interactive game for kids 7–12 to experience the real trade-offs NASA astronauts and planners face.

Challenge: [Build a Junior Astronaut Mission Trainer](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/) · Video: https://www.youtube.com/watch?v=_R0y4i3iY_M

## Quick start

```bash
pnpm install
pnpm dev   # http://localhost:3000
pnpm build # production check
```

## Routes

- `/` — Landing (overview, data sources, CTA)
- `/play` — Playable 7-sol mission (no login, browser-only)

## Core loop

1. **Allocate power** — split 85W between Life Support (O₂), Shielding, Greenhouse, Science
2. **Face an event** — DONKI flare, dust storm, O₂ leak, greenhouse alert, comms delay, science window
3. **Pay the trade-off** — no safe choice; every decision moves 2–3 resources
4. **Survive 7 sols** — keep health & O₂ > 0, score science

Two locations: **Mars** (12 min comm delay, dust storms) / **Moon** (1.3s, harsher power). Events shuffle for replayability.

## Real NASA data (embedded snapshots — labeled honestly)

| Dataset | Use in game |
|---------|-------------|
| **DONKI** (ccmc.gsfc.nasa.gov/tools/DONKI/) | X8.7 / X2.8 / M7.6 flares drive radiation events |
| **RadLab OSDR** (visualization.osdr.nasa.gov/radlab) | Real ISS dose 0.4 mSv/day, Moon 1.1, Mars 0.64 |
| **OSDR Bio** (osdr.nasa.gov/bio/repo) | O₂ 0.84 kg/day, 2500 kcal/day, bio research |
| **Mars Trek** (trek.nasa.gov/mars) | Mars terrain & comm delay |
| **CSA Youth** | Food in space toolkit (future greenhouse) |

Live APIs at `api.nasa.gov` — ship curated snapshots for demo stability, per challenge guidance.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind 4 + Turbopack. No DB/auth — intentional for kids (browser-playable, no download).

## Next steps (if time)

- [ ] Fetch live DONKI feed with `api.nasa.gov` key (fallback to curated)
- [ ] Mars Rover photo background (api.nasa.gov/mars-photos)
- [ ] Sound + haptics for 7–12, i18n ES, PWA offline
- [ ] Classroom worksheet export (what did you trade & why?)
- [ ] Vercel deploy + `vercel env`

## Attribution

Not affiliated with NASA. Uses public open data per challenge resources. Challenge owns the brief — this is a participant-built trainer.

Music: "Mesmerizing Galaxy Loop" by Kevin MacLeod (incompetech.com) — CC BY 4.0,
file `public/audio/ambient-espacio.mp3` (loop ambient 🔊 at 0.28, honours the mute toggle).

## License

MIT — do what you want, credit the crew.

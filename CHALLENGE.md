# Junior Astronaut Mission Trainer — NASA Space Apps 2026

> Fuente: https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/ (mirror: hackathlone.com)
> Video: https://www.youtube.com/watch?v=_R0y4i3iY_M

## El reto en una frase
Diseñar y construir un **juego/app interactiva** donde niños de **7-12 años** operen un **outpost lunar o marciano**, balanceando recursos con trade-offs reales — cada decisión tiene costo y enseña la lógica real de NASA para mantener humanos vivos fuera de la Tierra.

## Prompt oficial (objetivo)
> Your challenge is to design and build an interactive game or app that lets kids ages 7–12 manage a lunar or Martian outpost, making real decisions about life support, radiation shielding, power budgeting, food production, and communication delay, and experiencing how those choices play out over the course of a simulated mission.

No es un quiz ni slideshow — es una **simulación viva** donde cada elección cuesta algo.

## Background
- NASA busca presencia sostenida en Luna y camino a Marte.
- Astronautas balancean: power limitado → life support vs comms vs ciencia; radiación vs objetivos de misión; cada decisión tiene costo que se acumula.
- Mission planners usan datos reales: DONKI (solar/radiation), OSDR (salud astronáutica), Artemis/Mars surface data.
- Gap: contenido STEM infantil es o muy abstracto o muy técnico. Falta traducir trade-offs reales de forma tangible + divertida.

## Mecánicas sugeridas (formato abierto)
- Survival resource management
- Narrative decision trees
- Dashboard mission control simulator
- Cualquiera que enseñe el trade-off — browser, mobile, desktop. Prototipo funcional.

**Core idea:** mecánica > visual. Elección que ahorra power hoy puede costar oxígeno mañana. Grounding en datos reales de NASA, no números inventados.

## Consideraciones potenciales
### Audiencia
- 7-12 años (pero que pueda enganchar hermanos mayores/padres/clase)
- Plain language > jargon; explicar términos como radiation dose, microgravity, sol in-context
- Browser-playable sin download/cuenta = mejor reach y judging

### Datos reales
- Pull de APIs/datasets públicos de NASA donde sea posible
- Atribuir fuentes dentro del tool
- Si no hay tiempo para live API, dataset curado embebido es válido (no presentar static como live)

### Pitfalls
- Evitar "safe choice" sin costo
- Visual polish no sustituye mecánica precisa
- No abrumar con 5-6 sistemas; 2-3 core (life support, power, shielding) es más efectivo

### Stand out
- Vincular decisión a consecuencia real (ej: shielding → data real de space weather)
- Replayability con eventos que varían entre runs
- Explicar qué datasets se usaron y por qué (traceable para judges)

## Resources oficiales (7)
| # | Recurso | URL | Uso |
|---|---------|-----|-----|
| 1 | NASA Open APIs | https://api.nasa.gov/ | Portal central APIs (APOD, Mars Rover Photos, DONKI). Free API key. |
| 2 | DONKI | https://ccmc.gsfc.nasa.gov/tools/DONKI/ | Solar flares, CME, radiation risk — para mecánica de shielding/comms |
| 3 | OSDR | https://osdr.nasa.gov/bio/repo/ | Space biology / astronaut health (bone, muscle, immune, sleep) |
| 4 | OSDR Search API | https://osdr.nasa.gov/osdr/data/search?term=KEYWORD | Searchable por keyword |
| 5 | RadLab | https://visualization.osdr.nasa.gov/radlab/gui/data-api/ | Radiation dosimetry ISS — absorbed dose rate real |
| 6 | Mars Trek | https://trek.nasa.gov/mars/ | Mars imagery/elevation/terrain (Curiosity/Perseverance) |
| 7 | CSA STEM Youth | https://www.asc-csa.gc.ca/eng/youth-educators/toolkits.asp | Toolkit CSA para youth |
| 8 | CSA Food in Space | https://www.asc-csa.gc.ca/eng/youth-educators/food-production-moon-remote-areas.asp | Food production Luna/áreas remotas |

## Constraints traducidos a gameplay
- **Power budget** limitado (solar + baterías)
- **Life support** (O₂, agua, CO₂)
- **Radiation shielding** vs power/weight
- **Food production** (invernadero, calorías/día)
- **Communication delay** (Luna ~1.3s, Marte 4-24 min)
- **No unlimited resource mode** — todo es trade-off

## Stack propuesto
Next.js (App Router) + TypeScript + Tailwind + Supabase opcional + Vercel
Alternativa si queremos 100% offline para niños: solo Next.js + datos embebidos + localStorage (sin auth).

## Video transcript key quote
> "What does it feel like to trade oxygen reserves for an extra research opportunity, or to reinforce shielding against a radiation event at the cost of tonight's power supply? How will you represent competing resources so that no choice is free, and every decision teaches something true about what astronauts actually navigate?"

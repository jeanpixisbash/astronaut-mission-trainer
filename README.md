# Sobrevive al Sol — Junior Astronaut Mission Trainer

Juego web educativo para **NASA Space Apps Challenge 2026**. El jugador dirige una colonia lunar o marciana y aprende, mediante cartas y decisiones, cómo los astronautas deben equilibrar energía, oxígeno, comida y protección contra la radiación.

> **Cada decisión ayuda un sistema y sacrifica otro. No hay opciones perfectas: hay decisiones distintas.**

**Demo:** https://astronaut-mission-trainer-seven.vercel.app/play  
**Codex NASA:** https://astronaut-mission-trainer-seven.vercel.app/codex  
**Repositorio:** https://github.com/jeanpixisbash/astronaut-mission-trainer

> No es un producto oficial de NASA ni representa especificaciones oficiales de una misión. Es un prototipo educativo basado en tecnologías, datos y recursos públicos de NASA.

## Qué se puede hacer

- Elegir una misión con dificultad progresiva:
  - **Entrenamiento:** tutorial guiado de 3 días.
  - **Primera noche:** misión fácil de 6 días.
  - **Tormenta roja:** misión normal de 9 días.
  - **Misión completa:** desafío de 15 días.
- Jugar cartas de supervivencia con efectos positivos y negativos.
- Girar cada carta para leer qué hace, por qué conviene usarla y qué tecnología NASA la inspira.
- Ver las consecuencias paso a paso, con un astronauta que explica lo ocurrido.
- Enfrentar ataques de clima espacial y eventos globales.
- Resolver alertas sorpresa: fuego a bordo y basura espacial.
- Hacer rutinas gratuitas cuando la colonia está estable.
- Personalizar el nombre de la colonia, tripulación y color de traje.
- Construir una base visual con los edificios de las cartas jugadas.
- Desbloquear parches y estrellas por equilibrio y supervivencia.
- Jugar en español o inglés.
- Consultar el Codex con cartas, eventos y una guía de reglas.

## Reglas principales

La colonia tiene cuatro sistemas críticos, todos entre 0% y 100%:

| Sistema | Icono | Qué representa |
|---|---:|---|
| Energía | ⚡ | Paneles, reactores, baterías y calefacción |
| Oxígeno/agua | 💧 | Aire respirable, agua y reciclaje |
| Comida | 🌱 | Raciones e invernaderos |
| Escudo | 🛡️ | Radiación y micrometeoritos |

- Cada misión comienza con las barras cerca del 50%.
- El jugador tiene **3 PA/AP por día**.
- Cada carta cuesta entre 1 y 3 acciones.
- Si una barra llega a **0% o 100%**, la colonia colapsa.
- La noche consume energía, oxígeno y comida.
- Los ataques rojos y eventos globales se explican antes de resolver sus consecuencias.
- El botón **¡A cubierto!** puede reducir el daño del turno a la mitad.
- Las cartas pueden reforzarse gastando una acción adicional.

## Tutorial progresivo

La misión Entrenamiento no usa todas las reglas de golpe:

1. **Día 1 — Tu decisión:** carta sin ataque ni desgaste nocturno.
2. **Día 2 — Una amenaza:** aparece un ataque rojo suave.
3. **Día 3 — El espacio responde:** aparece un evento global y se completa el ciclo.

Houston explica cada etapa y el jugador avanza la resolución manualmente con el botón **Siguiente**, sin textos que desaparezcan demasiado rápido.

## Datos y recursos NASA utilizados

Las cartas usan hechos y tecnologías reales como base. Los modificadores del juego son abstracciones didácticas para niños de 7 a 12 años.

- [DONKI — Space Weather Database](https://ccmc.gsfc.nasa.gov/tools/DONKI/) — fulguraciones, tormentas solares y riesgo de radiación.
- [NASA Open Science Data Repository](https://osdr.nasa.gov/bio/repo/) — biología y salud espacial.
- [RadLab — NASA OSDR](https://visualization.osdr.nasa.gov/radlab/gui/data-api/) — dosimetría de radiación.
- [NASA Mars Exploration](https://mars.nasa.gov/) — polvo marciano, rovers y ambiente de Marte.
- [Mars Trek](https://trek.nasa.gov/mars/) — terreno e imágenes de Marte.
- [NASA Moon](https://www.nasa.gov/moon) — noche lunar, hielo, regolito y tubos de lava.
- [MOXIE](https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/) — producción de oxígeno en Marte.
- [Fission Surface Power](https://www.nasa.gov/exploration-systems-development-mission-directorate/fission-surface-power) — energía nuclear para la Luna.
- [ECLSS](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss) — soporte vital y reciclaje.
- [Astronaut Exercise / ARED](https://www.nasa.gov/missions/station/iss-research/astronaut-exercise) — ejercicio y pérdida ósea/muscular.
- [Veggie](https://www.nasa.gov/missions/station/veggie-plant-growth-system-activated-on-international-space-station) — cultivo de plantas en la ISS.
- [Advanced Plant Habitat](https://science.nasa.gov/mission/advanced-plant-habitat) — investigación de crecimiento vegetal.
- [Space Radiation Challenge](https://www.nasa.gov/wp-content/uploads/2017/04/radiationchallenge.pdf) — radiación espacial y refugios.
- [Whipple Shields — NASA JSC](https://hvit.jsc.nasa.gov/shield-development/) — protección contra micrometeoritos.
- [RadWorks Storm Shelter — NASA NTRS](https://ntrs.nasa.gov/citations/20170002287) — refugios ante eventos solares.
- [CO₂ Removal and Sabatier — NASA NTRS](https://ntrs.nasa.gov/citations/20190030370) — eliminación de CO₂ y recuperación de agua.

## Otros recursos y herramientas

- [NASA Space Apps Challenge — reto](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/)
- [NASA Space Apps Resources](https://www.spaceappschallenge.org/resources/)
- [Next.js](https://nextjs.org/) — framework web.
- [React](https://react.dev/) — interfaz interactiva.
- [Motion](https://motion.dev/) — animaciones de cartas, cockpit y astronauta.
- [Vercel](https://vercel.com/) — deployment.
- [Mesmerizing Galaxy — Kevin MacLeod](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN2300011) — música ambient CC BY 4.0.

## Ejecutar localmente

Requiere Node.js y pnpm.

```bash
pnpm install
pnpm dev
```

Abrir:

```text
http://localhost:3000
http://localhost:3000/play
http://localhost:3000/codex
```

## Verificación

```bash
pnpm lint
pnpm build
```

## Estructura principal

```text
src/app/page.tsx                         Landing
src/app/play/page.tsx                    Juego/cockpit y flujo de misión
src/app/codex/page.tsx                   Cartas, eventos y guía
src/components/cockpit/                   Ventana, astronauta, cartas y partículas
src/lib/cardsCatalog.ts                  Cartas y eventos con fuentes NASA
src/lib/gameEngine.ts                    Reglas y estados de la colonia
src/lib/missions.ts                      Misiones y dificultad progresiva
src/lib/historia.ts                      Houston, alertas y rutinas
src/lib/i18n.tsx                         Español/inglés y selector de idioma
src/lib/i18n-data.ts                     Traducciones de cartas y textos
src/lib/progress.ts                      Estrellas, parches y personalización
src/lib/sound.ts                         Efectos de sonido
public/audio/ambient-espacio.mp3         Música ambiental con licencia CC BY 4.0
```

## Licencia y atribución

Código del proyecto bajo MIT. Los datos, marcas y recursos de NASA pertenecen a sus respectivos propietarios. NASA no respalda ni patrocina este proyecto. La música de Kevin MacLeod se usa bajo Creative Commons Attribution 4.0.

# RC&E — The System Comes Alive

A concept demo of an immersive, scroll-driven website for **RC&E — Refrigeration Construction & Engineering**
([rcenh3.com](https://rcenh3.com/)). As you scroll, a conceptual industrial refrigeration system is engineered,
built, started up, serviced, supplied, audited and insulated, then shown as one system.

> Concept demo by Yojoa Labs. Not the official RC&E website. The 3D is a visual metaphor for RC&E's published
> capabilities, not a depiction of real projects or client facilities.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview
```

## Where things live

```
src/
├── data/
│   ├── content.ts        ← SOURCE OF TRUTH: every claim + source URL + confidence,
│   │                        creative copy (not claims), and what was left out
│   └── chapters.ts       ← chapter order, scroll length (in viewport heights), copy side
├── animations/
│   ├── timeline.ts       ← native scroll → damped narrative position; drives DOM reveals/steps
│   ├── director.ts       ← THE CHOREOGRAPHY: every 3D parameter as a function of scroll
│   ├── cameraPath.ts     ← camera keyframes per chapter (+ portrait/mobile pull-back weights)
│   └── interaction.ts    ← jacket-material choice, DOM↔3D label registry
├── 3d/
│   ├── PieceBuilder.ts   ← merges pieces into one geometry with per-piece animation attributes
│   ├── materials.ts      ← the build shader (assembly, explode, spin, flow, highlights, weld map)
│   ├── components/       ← modular parts: piping, equipment, structure, buildings, primitives
│   └── layouts/          ← the conceptual plant and the industries network, composed from components
├── scenes/               ← R3F scene graph: stage, camera, ground, plant, network, parts, insulation,
│                            anchor projector (pins HTML labels to 3D points)
├── sections/             ← one file per chapter: copy, steps, pinned labels
├── components/           ← Story primitives (Chapter, Reveal, Step, Fact, Anchor), header, rail, sources
└── styles/global.css     ← design tokens, desktop + mobile layouts
```

### Common edits

- **Change copy.** Edit the chapter in `src/sections/`. Factual text must be wrapped in
  `<Fact id="…">` with an id from `content.ts`. Add the claim there first.
- **Retime a moment.** Edit `director.ts` (what happens) or `cameraPath.ts` (where the camera is).
  Times are chapter-local, 0..1.
- **Lengthen or shorten a chapter.** Change `length` in `chapters.ts`.
- **Change the plant.** Edit `3d/layouts/plantLayout.ts`. `orderA` is the hero build order and `orderB`
  the construction build order.
- **Review sources.** Open **Sources** in the header, and toggle *Show source markers* to number every fact
  in the story.

## Notes

- Stack: React 19, TypeScript, Vite, three.js + React Three Fiber. No GSAP: native scroll plus one damped
  timeline covers it without scroll-jacking. No Tailwind: one token-based stylesheet.
- Research summary, 3D inventory, desktop/mobile plan and performance strategy: [`docs/RESEARCH.md`](docs/RESEARCH.md).

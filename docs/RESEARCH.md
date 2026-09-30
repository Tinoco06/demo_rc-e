# RC&E — Research summary & experience plan

Research pass: **30 Sep 2026**. Sources: the live site (Home, About, Engineering, Construction, Service,
Parts, Safety & Compliance, Contact, Portfolio, Gallery) and RC&E's LinkedIn company page, cross-checked
against `RCE_Research_Brief_for_ClaudeCode.md`. Where they differ, the live site wins.

Every factual line in the UI is a `<Fact id>` pointing to `src/data/content.ts`
(`claim · source · sourceUrl · confidence`). The in-app **Sources** panel renders that file.

## 1. What the live site added or corrected vs. the brief

| Item | Finding |
|---|---|
| Insulation | No standalone page. The detail is on the **homepage**: dedicated crews, "Dow Extruded Polystyrene with a Saran Vapor Barrier" *in most cases*, jacket at customer's discretion (aluminum, stainless, galvanized steel, PVC, colored PVC), jacketing "typically at a greater thickness than generally required". |
| Service | Homepage adds: techs "proficient in Compressor and Central System Controls and perform our own start ups"; cross-trained. Service line (817) 348-0600. |
| Safety | Homepage adds: ammonia awareness for all employees, HazMat Technician training for many, confined space and site incident command for foremen and techs, forklift/aerial lift certification, program for OSHA 29 CFR 1910.120(q), "any other chemical that may be located on site". |
| Parts | "Genuine OEM" (parts page). Parts department 24/7 (homepage). Parts manager contact exists but is not used (personal data). |
| Energy | Official wording is **"energy analysis … to help determine payback"**. "Energy modeling" is **not** on the site, so it's not used. |
| Engineering | "process water", not "wash-down water"; "process piping" is not listed as such. |
| About | Name history: Refrigeration, Construction, & Engineering, Inc. → RC&E, Inc. (2006). Departments added over time. |

## 2. Deliberately not used

See `notUsed` in `src/data/content.ts`. The notable ones are an undated "2-3 weeks ahead of schedule" stat,
an undated "perfect safety record for 10 years", Project Blue figures (these come from a partner, not
RC&E), and gallery/portfolio photos (client watermarks, 2009–2010 date stamps).

## 3. Visual resource inventory

- **Logo** (`/wp-content/uploads/2024/09/cropped-RCE_aKGco_Logo_REVISED.png`): graphite "RC&E",
  navy + red arcs, "a Kelvin group company". The demo uses a typeset wordmark with a navy/red hairline
  nod rather than the raster logo.
- **Site palette** (WordPress presets): `#03263B`, `#0b3954`, `#bddae6`, `#ff6663`. The demo uses a
  navy-graphite base, `#bddae6` as the technical accent, and brand red only as a hairline.
- **Gallery** (47 images, 2017 uploads). Used as art direction only: aluminum-jacketed lines on rooftop
  racks, bare lines painted in muted orange, screw-compressor packages, evaporative condensers,
  horizontal vessels. The 3D palette echoes this. No photo is displayed.

## 4. What becomes 3D (modular, `src/3d/components`)

`PipeSegment · Elbow · Tee · Flange · Weld · Valve` (piping) — `Compressor · Condenser · Evaporator ·
HeatExchanger · Pump · HorizontalVessel · VerticalVessel · ControlPanel` (equipment) —
`StructuralFrame · Slab` (structure) — `Building` (cold storage, food, beverage, ice, petrochemical) —
jacketed sleeves via `route()` and a dedicated insulation cutaway.

All of it is a **conceptual** system. It is not a real project, client facility or engineered design,
and it has no specs, capacities or refrigerant flow rates.

## 5. Story (scroll = camera)

| # | Chapter | What the visitor sees | Claims |
|---|---|---|---|
| 00 | Hero | First header spool appears, then fittings, valves, equipment and rack; the camera pulls back | founded, HQ, Kelvin |
| 01 | Engineering | Solid → blueprint lines → exploded BIM layers (piping / equipment / structure / layout) → plan view + 3-D weld map | eng-* |
| 02 | Construction | Blueprint → structure → equipment → piping → welds (heat glow) → jacketed insulation → test sweep | con-*, ins-crews |
| 03 | Industries | Pull-back: conceptual facility types connected by jacketed lines | ind-* |
| 04 | Startup | Dim plant; controls light, compressors → pumps → condensers → evaporators spin up, piping activates | svc-startups |
| 05 | Service | 24/7 → reticle on a compressor package, amber attention → resolved, system keeps running | svc-* |
| 06 | Parts | Component library (only parts RC&E lists) floats, then each part flies to its place in the system | parts-* |
| 07 | Safety | Slower. Ghosted technical model; PSM/RMP → PHA → MI → SOP → Training highlight one area at a time | safe-* |
| 08 | Insulation | Cutaway: pipe → XPS half-shells → vapor barrier wraps → jacket wraps; jacket material is selectable | ins-* |
| 09 | One system | Everything converges; network returns; CTA to the real contact page | co-*, contact |

## 6. Desktop vs mobile

- **Desktop:** copy in a side column (left/right alternates with the subject), camera view-offset keeps
  the subject clear of the text, pointer parallax, HTML labels pinned to 3D points.
- **Mobile (≤820 px):** its own composition. The frame shifts up and the copy sits in a bottom sheet over a
  scrim. The camera pulls back per shot (wide shots more, close-ups less). Only three facility types
  appear. Parts are shown **one at a time**, large. Steps show only the active item. No hover dependency.

## 7. Performance strategy

- **The whole plant is 1 mesh + 1 line draw call.** `PieceBuilder` merges every piece and bakes per-piece
  animation data into vertex attributes; one shader (`materials.ts`) animates assembly, explode, spin,
  flow and highlights on the GPU. The network adds 2 more draw calls, parts 8, and the cutaway 6.
- No textures at all: procedural materials plus a generated `RoomEnvironment` env map. No post-processing,
  no real-time shadows.
- three.js + R3F sit in one **lazy chunk** (≈250 kB gzip), so the copy paints first. A loader
  fades out when WebGL is ready.
- DPR is capped (1.5 on mobile/low tier), there's no MSAA on the low tier, and segment counts drop there.
- Scroll is native (no scroll-jacking). One damped timeline drives the DOM (direct style writes, no React
  re-renders per frame) and the scene.
- **Reduced motion:** no autoplay intro, no damping, no parallax, no spinning equipment or flow animation.
- **No WebGL:** the same sections render as a static, readable page.

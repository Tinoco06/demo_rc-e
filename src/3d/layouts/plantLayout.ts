import * as THREE from 'three';
import { PieceBuilder, ZONES } from '../PieceBuilder';
import { FINISH, v3 } from '../components/primitives';
import { route, weldLog, type RouteOptions } from '../components/piping';
import {
  Compressor,
  Condenser,
  ControlPanel,
  Evaporator,
  HeatExchanger,
  HorizontalVessel,
  Pump,
  VerticalVessel,
} from '../components/equipment';
import { Slab, StructuralFrame } from '../components/structure';

/**
 * The conceptual refrigeration system used throughout the story.
 * It is a visual metaphor for RC&E's scope — not a real project, client
 * facility, or engineered design. Units are roughly metres.
 */

export const EXPLODE = {
  piping: v3(0, 4.6, 0),
  equipment: v3(0, 0, 0),
  structure: v3(0, -5.4, 0),
  layout: v3(0, -8.2, 0),
};

const Y = v3(0, 1, 0);
const Z = v3(0, 0, 1);
const X = v3(1, 0, 0);

export interface PlantAnchors {
  compressor1: THREE.Vector3;
  compressor2: THREE.Vector3;
  controls: THREE.Vector3;
  receiver: THREE.Vector3;
  condenser: THREE.Vector3;
  evaporator: THREE.Vector3;
  heatExchanger: THREE.Vector3;
  pumps: THREE.Vector3;
  vessel: THREE.Vector3;
  headerValve: THREE.Vector3;
  headerMid: THREE.Vector3;
  layers: { piping: THREE.Vector3; equipment: THREE.Vector3; structure: THREE.Vector3; layout: THREE.Vector3 };
}

export function buildPlant() {
  const b = new PieceBuilder();
  weldLog.length = 0;

  // ── Layout layer ─────────────────────────────────────────────────────
  Slab(
    b,
    [23.5, 11],
    [
      { x: -7.2, z: 3.3, w: 3.8, d: 2.3 },
      { x: -3.4, z: 3.3, w: 3.8, d: 2.3 },
      { x: -0.4, z: 3.6, w: 2.1, d: 0.9 },
      { x: 3.0, z: 3.3, w: 4.4, d: 1.8 },
      { x: 7.15, z: 3.5, w: 3.3, d: 1.0 },
      { x: 9.9, z: 3.2, w: 1.5, d: 1.5 },
      { x: 5.5, z: -3.6, w: 4.4, d: 2.6 },
      { x: -1.6, z: -3.6, w: 3.6, d: 1.6 },
      { x: -6.5, z: -3.4, w: 4.8, d: 1.4 },
    ],
    EXPLODE.layout,
  );

  // ── Structure ────────────────────────────────────────────────────────
  StructuralFrame(
    b,
    { xs: [-10, -6, -2, 2, 6, 10], zHalf: 1.2, height: 4.5, tiers: [3.6, 4.5] },
    [0.58, 0.78],
    [0.04, 0.2],
    EXPLODE.structure,
  );

  // ── Equipment ────────────────────────────────────────────────────────
  const y0 = 0.12;
  const eq = (orderA: number, orderB: number) => ({ orderA, orderB, arrive: v3(0, 2.2, 0), explode: EXPLODE.equipment });
  const c1 = Compressor(b, eq(0.3, 0.2), -7.2, y0, 3.3);
  const c2 = Compressor(b, eq(0.34, 0.23), -3.4, y0, 3.3);
  const panel = ControlPanel(b, eq(0.38, 0.26), -0.4, y0, 3.6);
  const rec = HorizontalVessel(b, eq(0.41, 0.28), 3.0, y0, 3.3);
  const hx = HeatExchanger(b, eq(0.44, 0.3), -6.5, y0, -3.4);
  const evap = Evaporator(b, eq(0.47, 0.33), -1.6, y0, -3.6);
  const cond = Condenser(b, eq(0.5, 0.35), 5.5, y0, -3.6);
  const p1 = Pump(b, eq(0.54, 0.38), 6.4, y0, 3.5);
  const p2 = Pump(b, eq(0.56, 0.39), 7.9, y0, 3.5);
  const vv = VerticalVessel(b, eq(0.58, 0.41), 9.9, y0, 3.2);

  // ── Piping ───────────────────────────────────────────────────────────
  const pipe = (o: Omit<RouteOptions, 'explode'>) => route(b, { explode: EXPLODE.piping, zone: ZONES.piping, ...o });
  const HX0 = -10.6;
  const HX1 = 10.6;

  // Headers on the rack. The first spool of H1 is the very first thing the visitor sees.
  const h1 = pipe({
    points: [v3(HX0, 4.92, -0.72), v3(HX1, 4.92, -0.72)],
    r: 0.2,
    insulation: 0.13,
    finish: FINISH.bareSteel,
    orderA: [0.0, 0.16],
    orderB: [0.42, 0.52],
    weldB: [0.6, 0.72],
    insB: [0.8, 0.9],
    spoolMax: 3.6,
    blindEnds: true,
    valves: [{ seg: 0, t: 0.53, stem: Y }],
    flowStart: 0,
  });
  pipe({
    points: [v3(HX0, 4.74, 0.4), v3(HX1, 4.74, 0.4)],
    r: 0.15,
    finish: FINISH.painted,
    orderA: [0.12, 0.26],
    orderB: [0.44, 0.54],
    weldB: [0.62, 0.74],
    spoolMax: 3.6,
    blindEnds: true,
    valves: [{ seg: 0, t: 0.3, stem: Y }],
    flowStart: 3,
  });
  pipe({
    points: [v3(HX0, 4.78, -0.12), v3(HX1, 4.78, -0.12)],
    r: 0.1,
    insulation: 0.09,
    finish: FINISH.bareSteel,
    orderA: [0.16, 0.3],
    orderB: [0.45, 0.55],
    weldB: [0.62, 0.74],
    insB: [0.82, 0.92],
    spoolMax: 3.6,
    blindEnds: true,
    flowStart: 7,
  });
  pipe({
    points: [v3(HX0, 3.91, -0.5), v3(HX1, 3.91, -0.5)],
    r: 0.12,
    insulation: 0.1,
    finish: FINISH.bareSteel,
    orderA: [0.2, 0.33],
    orderB: [0.46, 0.56],
    weldB: [0.63, 0.75],
    insB: [0.83, 0.93],
    spoolMax: 3.6,
    blindEnds: true,
    flowStart: 11,
  });
  pipe({
    points: [v3(HX0, 3.8, 0.62), v3(HX1, 3.8, 0.62)],
    r: 0.11,
    finish: FINISH.painted,
    orderA: [0.22, 0.35],
    orderB: [0.47, 0.57],
    weldB: [0.63, 0.75],
    spoolMax: 3.6,
    blindEnds: true,
    flowStart: 5,
  });

  // Branches: header ⇄ equipment. Each gets its own slice of both build orders.
  let bi = 0;
  const branch = (o: Omit<RouteOptions, 'explode' | 'orderA' | 'orderB' | 'weldB' | 'insB' | 'finish'> & { hot?: boolean }) => {
    const i = bi++;
    const a0 = 0.7 + i * 0.018;
    const b0 = 0.5 + i * 0.011;
    return pipe({
      finish: o.hot ? FINISH.painted : FINISH.bareSteel,
      orderA: [a0, a0 + 0.07],
      orderB: [b0, b0 + 0.05],
      weldB: [0.66 + i * 0.008, 0.72 + i * 0.008],
      insB: [0.86 + i * 0.008, 0.9 + i * 0.006],
      arrive: 'slide',
      flowStart: i * 2.3,
      ...o,
    });
  };

  // Compressor suction (from H1) and discharge (to H3)
  for (const [c, x] of [[c1, -7.2], [c2, -3.4]] as const) {
    branch({
      points: [v3(x + 0.45, 4.92, -0.72), v3(x + 0.45, 5.75, -0.72), v3(x + 0.45, 5.75, 3.65), c.suction],
      r: 0.14,
      insulation: 0.1,
      startOnHeader: 0.33,
      valves: [{ seg: 2, t: 0.42, stem: Z }],
    });
    branch({
      points: [c.discharge, v3(x + 0.9, 5.35, 2.8), v3(x + 0.9, 5.35, 0.4), v3(x + 0.9, 4.74, 0.4)],
      r: 0.1,
      hot: true,
      valves: [{ seg: 0, t: 0.55, stem: Z }],
    });
  }
  // Evaporator suction + liquid feed
  branch({
    points: [v3(-1.2, 4.92, -0.72), v3(-1.2, 5.75, -0.72), v3(-1.2, 5.75, -3.6), v3(-1.2, evap.top.y, -3.6)],
    r: 0.14,
    insulation: 0.1,
    startOnHeader: 0.33,
  });
  branch({
    points: [v3(-2.3, 4.78, -0.12), v3(-2.3, 5.45, -0.12), v3(-2.3, 5.45, -3.3), v3(-2.3, evap.top.y, -3.3)],
    r: 0.07,
    insulation: 0.07,
    startOnHeader: 0.19,
    valves: [{ seg: 2, t: 0.45, stem: X }],
  });
  // Receiver → liquid header
  branch({
    points: [rec.topA, v3(rec.topA.x, 5.3, 3.3), v3(rec.topA.x, 5.3, -0.12), v3(rec.topA.x, 4.78, -0.12)],
    r: 0.09,
    insulation: 0.08,
    valves: [{ seg: 0, t: 0.3, stem: Z }],
  });
  // Hot gas to condenser, condensed liquid to receiver
  branch({
    points: [v3(7.3, 4.74, 0.4), v3(7.3, 5.5, 0.4), v3(7.3, 5.5, -1.9), v3(7.3, cond.inlet.y, -1.9), v3(7.3, cond.inlet.y, -2.5)],
    r: 0.13,
    hot: true,
    startOnHeader: 0.15,
    valves: [{ seg: 2, t: 0.5, stem: X }],
  });
  branch({
    points: [v3(3.8, 0.57, -2.5), v3(3.8, 0.57, 2.0), v3(3.8, 1.23, 2.0), v3(3.8, 1.23, 2.64)],
    r: 0.1,
    hot: true,
  });
  // Pump discharges
  for (const p of [p1, p2]) {
    branch({
      points: [p.discharge, v3(p.discharge.x, 5.2, 3.5), v3(p.discharge.x, 5.2, -0.12), v3(p.discharge.x, 4.78, -0.12)],
      r: 0.08,
      insulation: 0.07,
      valves: [{ seg: 0, t: 0.35, stem: Z }],
    });
  }
  // Vessel vapour return
  branch({
    points: [vv.top, v3(9.9, 5.8, 3.2), v3(9.9, 5.8, -0.72), v3(9.9, 4.92, -0.72)],
    r: 0.16,
    insulation: 0.11,
  });
  // Heat exchanger
  branch({
    points: [v3(-7.2, 3.91, -0.5), v3(-7.2, 2.5, -0.5), v3(-7.2, 2.5, -3.4), hx.inlet],
    r: 0.1,
    insulation: 0.1,
    startOnHeader: 0.22,
    valves: [{ seg: 0, t: 0.5, stem: X }],
  });
  branch({
    points: [hx.outlet, v3(-5.7, 3.1, -3.4), v3(-5.7, 3.1, 0.62), v3(-5.7, 3.8, 0.62)],
    r: 0.1,
    hot: true,
  });

  const { mesh, lines } = b.build();
  const welds = weldLog.splice(0);

  const anchors: PlantAnchors = {
    compressor1: c1.focus,
    compressor2: c2.focus,
    controls: panel.focus,
    receiver: rec.focus,
    condenser: cond.focus,
    evaporator: evap.focus,
    heatExchanger: hx.focus,
    pumps: v3(7.15, 0.6, 3.5),
    vessel: vv.focus,
    headerValve: h1.valves[0],
    headerMid: v3(0, 4.92, -0.72),
    layers: {
      piping: v3(-11.4, 5.2, 0).add(EXPLODE.piping),
      equipment: v3(-11.4, 1.6, 3.2),
      structure: v3(-11.4, 3.0, 0).add(EXPLODE.structure),
      layout: v3(-11.8, 0, 5.5).add(EXPLODE.layout),
    },
  };
  return { mesh, lines, anchors, welds };
}

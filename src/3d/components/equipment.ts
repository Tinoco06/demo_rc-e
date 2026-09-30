import * as THREE from 'three';
import { FLAGS, ZONES, type PieceBuilder, type PieceOptions } from '../PieceBuilder';
import { FINISH, SEG, alongY, at, box, cyl, hemi, rotAxis, v3 } from './primitives';

/**
 * Stylised, conceptual industrial refrigeration equipment. Proportions are
 * representative only — no specific manufacturer, model or capacity is implied.
 */

const X = v3(1, 0, 0);
const NX = v3(-1, 0, 0);
const Y = v3(0, 1, 0);
const NY = v3(0, -1, 0);
const Z = v3(0, 0, 1);

/** Offset a piece's build order so a sub-assembly lands in sequence. */
const step = (o: PieceOptions, i: number, k = 0.014): PieceOptions => ({
  ...o,
  orderA: o.orderA + i * k,
  orderB: o.orderB + i * k,
});

/** Horizontal pressure vessel along X with elliptical heads. */
function hVessel(piece: ReturnType<PieceBuilder['piece']>, c: THREE.Vector3, r: number, L: number, finish = FINISH.equipment) {
  piece.add(cyl(r, L, SEG.vessel, true), alongY(c, X), { ...finish, edgeAngle: 20 });
  piece.add(hemi(r), alongY(c.clone().add(v3(L / 2, 0, 0)), X, v3(1, 0.5, 1)), { ...finish, lines: 'none' });
  piece.add(hemi(r), alongY(c.clone().add(v3(-L / 2, 0, 0)), NX, v3(1, 0.5, 1)), { ...finish, lines: 'none' });
}

export function Compressor(b: PieceBuilder, o: PieceOptions, x: number, y: number, z: number) {
  const zone = ZONES.compressors;
  const base = { ...o, zone };
  const skid = b.piece(step(base, 0));
  skid.add(box(3.4, 0.25, 1.9), at(x, y + 0.125, z), FINISH.equipmentDark);

  const cz = z + 0.35;
  const cy = y + 0.25 + 0.52;
  const motor = b.piece(step({ ...base, arrive: v3(0, 2.4, 0) }, 1));
  motor.add(cyl(0.4, 1.2, SEG.vessel), alongY(v3(x - 0.95, cy, cz), X), FINISH.navy);
  motor.add(cyl(0.32, 0.2, SEG.vessel), alongY(v3(x - 1.65, cy, cz), X), FINISH.equipmentDark);
  motor.add(box(1.0, 0.18, 0.7), at(x - 0.95, y + 0.34, cz), FINISH.equipmentDark);

  // Coupling — spins when the compressors are running.
  const couplingPos = v3(x - 0.18, cy, cz);
  const coupling = b.piece({ ...step(base, 2), pivot: couplingPos, spinAxis: X });
  coupling.add(cyl(0.27, 0.16, 20), alongY(couplingPos, X), { ...FINISH.bareSteel, spinRate: 2 });
  coupling.add(box(0.1, 0.12, 0.12), at(x - 0.18, cy + 0.25, cz), { ...FINISH.handwheel, spinRate: 2, lines: 'none' });

  const comp = b.piece(step({ ...base, arrive: v3(0, 2.4, 0) }, 3));
  comp.add(cyl(0.37, 0.95, SEG.vessel), alongY(v3(x + 0.45, cy, cz), X), FINISH.equipment);
  comp.add(cyl(0.44, 0.1, SEG.vessel), alongY(v3(x + 0.0, cy, cz), X), FINISH.equipmentDark);
  comp.add(cyl(0.44, 0.1, SEG.vessel), alongY(v3(x + 0.92, cy, cz), X), FINISH.equipmentDark);
  comp.add(cyl(0.14, 0.34, 14), alongY(v3(x + 0.45, cy + 0.5, cz), Y), FINISH.equipment); // suction nozzle
  comp.add(cyl(0.1, 0.55, 12), alongY(v3(x + 1.0, cy + 0.08, z - 0.12), Z), FINISH.painted); // to separator

  const sep = b.piece(step({ ...base, zone: ZONES.vessels, arrive: v3(0, 2.6, 0) }, 4));
  const sc = v3(x + 0.35, y + 1.3, z - 0.5);
  hVessel(sep, sc, 0.42, 2.3);
  sep.add(box(0.14, 0.9, 0.5), at(x - 0.45, y + 0.7, z - 0.5), FINISH.equipmentDark);
  sep.add(box(0.14, 0.9, 0.5), at(x + 1.15, y + 0.7, z - 0.5), FINISH.equipmentDark);
  sep.add(cyl(0.12, 0.35, 14), alongY(v3(x + 0.9, y + 1.85, z - 0.5), Y), FINISH.equipment); // discharge nozzle

  const panel = b.piece(step(base, 5));
  panel.add(box(0.55, 0.62, 0.22), at(x + 1.45, y + 0.25 + 0.6, z + 0.75), FINISH.navy);
  for (let i = 0; i < 2; i++) {
    panel.add(cyl(0.03, 0.03, 8), rotAxis(v3(x + 1.35 + i * 0.2, y + 1.02, z + 0.865), X, Math.PI / 2), {
      color: i ? '#f0b541' : '#5fd08f',
      metal: 0,
      rough: 0.3,
      flags: FLAGS.lamp,
      lines: 'none',
    });
  }

  return {
    suction: v3(x + 0.45, cy + 0.67, cz),
    discharge: v3(x + 0.9, y + 2.02, z - 0.5),
    focus: v3(x, cy + 0.3, z),
  };
}

export function Condenser(b: PieceBuilder, o: PieceOptions, x: number, y: number, z: number) {
  const base = { ...o, zone: ZONES.condenser };
  const W = 4.0;
  const D = 2.2;
  const shell = b.piece(step({ ...base, arrive: v3(0, 3, 0) }, 0));
  shell.add(box(W, 0.6, D), at(x, y + 0.3, z), FINISH.equipmentDark);
  shell.add(box(W, 2.4, D), at(x, y + 0.6 + 1.2, z), FINISH.galvanized);
  shell.add(box(W + 0.06, 0.12, D + 0.06), at(x, y + 3.06, z), FINISH.galvanized);
  // Air-inlet louvres on the front face
  for (let i = 0; i < 6; i++) {
    shell.add(box(W - 0.3, 0.05, 0.06), at(x, y + 0.8 + i * 0.2, z + D / 2 + 0.03), { ...FINISH.equipmentDark, lines: 'none' });
  }
  // Access ladder
  shell.add(box(0.04, 3.1, 0.04), at(x + W / 2 + 0.08, y + 1.55, z + 0.25), { ...FINISH.structure, lines: 'none' });
  shell.add(box(0.04, 3.1, 0.04), at(x + W / 2 + 0.08, y + 1.55, z - 0.25), { ...FINISH.structure, lines: 'none' });
  for (let i = 0; i < 9; i++) {
    shell.add(box(0.03, 0.03, 0.5), at(x + W / 2 + 0.08, y + 0.3 + i * 0.33, z), { ...FINISH.structure, lines: 'none' });
  }

  const fans: THREE.Vector3[] = [];
  for (const fx of [-1, 1]) {
    const c = v3(x + fx * 1.0, y + 3.12, z);
    const shroud = b.piece(step({ ...base, arrive: v3(0, 1.5, 0) }, 1 + (fx + 1) / 2));
    shroud.add(cyl(0.92, 0.6, 32, true), alongY(c.clone().add(v3(0, 0.3, 0)), Y), FINISH.galvanized);
    const hub = c.clone().add(v3(0, 0.42, 0));
    const blades = b.piece({ ...step(base, 3 + (fx + 1) / 2), pivot: hub, spinAxis: Y, spinArrive: 1.2 });
    blades.add(cyl(0.12, 0.14, 12), alongY(hub, Y), { ...FINISH.blade, spinRate: 1 });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const m = new THREE.Matrix4()
        .makeRotationY(a)
        .multiply(new THREE.Matrix4().makeRotationX(0.28))
        .multiply(new THREE.Matrix4().makeTranslation(0.45, 0, 0));
      m.premultiply(new THREE.Matrix4().makeTranslation(hub.x, hub.y, hub.z));
      blades.add(box(0.72, 0.025, 0.22), m, { ...FINISH.blade, spinRate: 1, lines: 'none' });
    }
    fans.push(hub);
  }
  return { inlet: v3(x + 1.6, y + 2.6, z + D / 2), outlet: v3(x - 1.7, y + 0.45, z + D / 2), fans, focus: v3(x, y + 2.2, z) };
}

export function Evaporator(b: PieceBuilder, o: PieceOptions, x: number, y: number, z: number) {
  const base = { ...o, zone: ZONES.evaporator };
  const H = 2.05;
  const stand = b.piece(step(base, 0));
  for (const dx of [-1.45, 1.45]) {
    for (const dz of [-0.5, 0.5]) stand.add(box(0.1, H, 0.1), at(x + dx, y + H / 2, z + dz), FINISH.structure);
  }
  stand.add(box(3.3, 0.08, 1.3), at(x, y + H - 0.04, z), FINISH.structure);

  const casing = b.piece(step({ ...base, arrive: v3(0, 2.2, 0) }, 1));
  casing.add(box(3.2, 1.1, 1.2), at(x, y + H + 0.55, z), FINISH.galvanized);
  casing.add(box(3.24, 0.06, 1.24), at(x, y + H + 1.13, z), FINISH.equipmentDark);
  // Coil face on the rear
  for (let i = 0; i < 7; i++) {
    casing.add(box(3.0, 0.02, 0.02), at(x, y + H + 0.15 + i * 0.13, z - 0.61), { ...FINISH.equipmentDark, lines: 'none' });
  }

  const fans: THREE.Vector3[] = [];
  for (let i = -1; i <= 1; i++) {
    const c = v3(x + i * 1.02, y + H + 0.55, z + 0.62);
    const ring = b.piece(step(base, 2 + i * 0.3));
    ring.add(cyl(0.4, 0.12, 28, true), alongY(c, Z), FINISH.equipmentDark);
    const blades = b.piece({ ...step(base, 3 + i * 0.3), pivot: c, spinAxis: Z, spinArrive: 1.2 });
    blades.add(cyl(0.07, 0.1, 10), alongY(c, Z), { ...FINISH.blade, spinRate: 1 });
    for (let k = 0; k < 4; k++) {
      const m = new THREE.Matrix4()
        .makeTranslation(c.x, c.y, c.z)
        .multiply(new THREE.Matrix4().makeRotationZ((k / 4) * Math.PI * 2))
        .multiply(new THREE.Matrix4().makeRotationX(0.35))
        .multiply(new THREE.Matrix4().makeTranslation(0.19, 0, 0));
      blades.add(box(0.3, 0.12, 0.015), m, { ...FINISH.blade, spinRate: 1, lines: 'none' });
    }
    fans.push(c);
  }
  return { top: v3(x, y + H + 1.16, z), fans, focus: v3(x, y + H + 0.5, z) };
}

export function HeatExchanger(b: PieceBuilder, o: PieceOptions, x: number, y: number, z: number) {
  const base = { ...o, zone: ZONES.vessels };
  const cy = y + 1.0;
  const supports = b.piece(step(base, 0));
  for (const dx of [-1.0, 1.0]) supports.add(box(0.26, cy - y - 0.3, 0.9), at(x + dx, y + (cy - y - 0.3) / 2, z), FINISH.equipmentDark);

  const shell = b.piece(step({ ...base, arrive: v3(0, 2.4, 0) }, 1));
  shell.add(cyl(0.46, 3.2, SEG.vessel, true), alongY(v3(x, cy, z), X), { ...FINISH.equipment, edgeAngle: 20 });
  shell.add(hemi(0.46), alongY(v3(x + 1.72, cy, z), X, v3(1, 0.5, 1)), { ...FINISH.equipment, lines: 'none' });
  shell.add(cyl(0.6, 0.1, SEG.vessel), alongY(v3(x + 1.62, cy, z), X), FINISH.equipmentDark);
  shell.add(cyl(0.6, 0.1, SEG.vessel), alongY(v3(x - 1.62, cy, z), X), FINISH.equipmentDark);
  shell.add(cyl(0.14, 0.4, 14), alongY(v3(x - 0.7, cy + 0.6, z), Y), FINISH.equipment);
  shell.add(cyl(0.14, 0.4, 14), alongY(v3(x + 0.8, cy + 0.6, z), Y), FINISH.equipment);

  const head = b.piece(step({ ...base, arrive: v3(-1.6, 0.4, 0) }, 2));
  head.add(cyl(0.5, 0.55, SEG.vessel, true), alongY(v3(x - 1.95, cy, z), X), FINISH.navy);
  head.add(hemi(0.5), alongY(v3(x - 2.22, cy, z), NX, v3(1, 0.45, 1)), { ...FINISH.navy, lines: 'none' });
  head.add(cyl(0.11, 0.4, 12), alongY(v3(x - 1.95, cy, z + 0.6), Z), FINISH.equipment);

  return { inlet: v3(x - 0.7, cy + 0.8, z), outlet: v3(x + 0.8, cy + 0.8, z), focus: v3(x, cy, z) };
}

export function Pump(b: PieceBuilder, o: PieceOptions, x: number, y: number, z: number) {
  const base = { ...o, zone: ZONES.pumps };
  const p = b.piece(step({ ...base, arrive: v3(0, 1.8, 0) }, 0));
  p.add(box(1.25, 0.12, 0.6), at(x, y + 0.06, z), FINISH.equipmentDark);
  p.add(cyl(0.21, 0.58, 20), alongY(v3(x - 0.28, y + 0.42, z), X), FINISH.navy);
  p.add(cyl(0.27, 0.22, 24), alongY(v3(x + 0.42, y + 0.42, z), Z), FINISH.equipment);
  p.add(cyl(0.085, 0.36, 12), alongY(v3(x + 0.42, y + 0.84, z), Y), FINISH.equipment);
  p.add(cyl(0.095, 0.3, 12), alongY(v3(x + 0.7, y + 0.42, z), X), FINISH.equipment);
  const cpos = v3(x + 0.08, y + 0.42, z);
  const coupling = b.piece({ ...step(base, 1), pivot: cpos, spinAxis: X });
  coupling.add(cyl(0.13, 0.08, 14), alongY(cpos, X), { ...FINISH.bareSteel, spinRate: 3 });
  coupling.add(box(0.05, 0.06, 0.06), at(cpos.x, cpos.y + 0.12, cpos.z), { ...FINISH.handwheel, spinRate: 3, lines: 'none' });
  return { discharge: v3(x + 0.42, y + 1.02, z), focus: v3(x, y + 0.45, z) };
}

export function HorizontalVessel(b: PieceBuilder, o: PieceOptions, x: number, y: number, z: number, r = 0.66, L = 4.0) {
  const base = { ...o, zone: ZONES.vessels };
  const cy = y + r + 0.45;
  const saddles = b.piece(step(base, 0));
  for (const dx of [-L * 0.32, L * 0.32]) saddles.add(box(0.24, cy - y, r * 1.5), at(x + dx, y + (cy - y) / 2, z), FINISH.equipmentDark);
  const v = b.piece(step({ ...base, arrive: v3(0, 2.6, 0) }, 1));
  hVessel(v, v3(x, cy, z), r, L);
  v.add(cyl(0.12, 0.3, 12), alongY(v3(x - L * 0.3, cy + r + 0.1, z), Y), FINISH.equipment);
  v.add(cyl(0.12, 0.3, 12), alongY(v3(x + L * 0.3, cy + r + 0.1, z), Y), FINISH.equipment);
  // level gauge
  v.add(cyl(0.025, r * 1.6, 8), alongY(v3(x + L * 0.1, cy, z + r + 0.1), Y), { ...FINISH.bareSteel, lines: 'none' });
  return { topA: v3(x - L * 0.3, cy + r + 0.25, z), topB: v3(x + L * 0.3, cy + r + 0.25, z), side: v3(x + L * 0.15, cy, z - r), focus: v3(x, cy, z) };
}

export function VerticalVessel(b: PieceBuilder, o: PieceOptions, x: number, y: number, z: number, r = 0.55, H = 2.2) {
  const base = { ...o, zone: ZONES.vessels };
  const y0 = y + 0.55;
  const legs = b.piece(step(base, 0));
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.4;
    legs.add(cyl(0.05, 0.75, 8), alongY(v3(x + Math.cos(a) * r * 0.8, y + 0.375, z + Math.sin(a) * r * 0.8), Y), FINISH.structure);
  }
  const v = b.piece(step({ ...base, arrive: v3(0, 3, 0) }, 1));
  v.add(cyl(r, H, SEG.vessel, true), alongY(v3(x, y0 + H / 2, z), Y), { ...FINISH.equipment, edgeAngle: 20 });
  v.add(hemi(r), alongY(v3(x, y0 + H, z), Y, v3(1, 0.5, 1)), { ...FINISH.equipment, lines: 'none' });
  v.add(hemi(r), alongY(v3(x, y0, z), NY, v3(1, 0.5, 1)), { ...FINISH.equipment, lines: 'none' });
  v.add(cyl(0.14, 0.3, 12), alongY(v3(x, y0 + H + r * 0.5 + 0.1, z), Y), FINISH.equipment);
  return { top: v3(x, y0 + H + r * 0.5 + 0.25, z), focus: v3(x, y0 + H / 2, z) };
}

export function ControlPanel(b: PieceBuilder, o: PieceOptions, x: number, y: number, z: number) {
  const base = { ...o, zone: ZONES.controls };
  const cab = b.piece(step({ ...base, arrive: v3(0, 2.2, 0) }, 0));
  cab.add(box(1.8, 0.1, 0.62), at(x, y + 0.05, z), FINISH.equipmentDark);
  cab.add(box(1.7, 2.0, 0.52), at(x, y + 1.1, z), FINISH.navy);
  cab.add(box(0.012, 1.9, 0.01), at(x, y + 1.1, z + 0.265), { ...FINISH.equipmentDark, lines: 'none' });
  cab.add(box(0.03, 0.22, 0.04), at(x - 0.12, y + 1.1, z + 0.28), { ...FINISH.bareSteel, lines: 'none' });
  cab.add(box(0.03, 0.22, 0.04), at(x + 0.12, y + 1.1, z + 0.28), { ...FINISH.bareSteel, lines: 'none' });

  const hmi = b.piece(step(base, 1));
  hmi.add(box(0.6, 0.4, 0.02), at(x - 0.45, y + 1.62, z + 0.27), { color: '#0c1e2b', metal: 0.2, rough: 0.25, flags: FLAGS.screen, lines: 'none' });
  const colors = ['#5fd08f', '#5fd08f', '#e8f1f5', '#5fd08f', '#f0b541', '#5fd08f'];
  colors.forEach((c, i) => {
    hmi.add(cyl(0.035, 0.03, 10), rotAxis(v3(x + 0.25 + (i % 3) * 0.16, y + 1.68 - Math.floor(i / 3) * 0.16, z + 0.27), X, Math.PI / 2), {
      color: c,
      metal: 0,
      rough: 0.3,
      flags: FLAGS.lamp,
      lines: 'none',
    });
  });
  return { focus: v3(x, y + 1.3, z), top: v3(x, y + 2.1, z) };
}

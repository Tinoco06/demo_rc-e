import * as THREE from 'three';
import type { PieceBuilder, PieceOptions } from '../PieceBuilder';
import { FINISH, at, box, rotAxis, v3 } from './primitives';
import { lerp } from '../../utils/math';

export interface RackSpec {
  xs: number[];
  zHalf: number;
  height: number;
  tiers: number[];
}

/**
 * A two-tier pipe rack: columns, cross beams, longitudinal stringers and bracing.
 * Columns rise in from below; beams drop in from above.
 */
export function StructuralFrame(
  b: PieceBuilder,
  spec: RackSpec,
  orderA: [number, number],
  orderB: [number, number],
  explode: THREE.Vector3,
) {
  const { xs, zHalf, height, tiers } = spec;
  const n = xs.length;
  const oa = (i: number) => lerp(orderA[0], orderA[1], i / n);
  const ob = (i: number) => lerp(orderB[0], orderB[1], i / n);
  const s = 0.22;

  xs.forEach((x, i) => {
    const col: PieceOptions = { orderA: oa(i), orderB: ob(i), arrive: v3(0, -height * 0.7, 0), explode };
    const c = b.piece(col);
    for (const z of [-zHalf, zHalf]) {
      c.add(box(s, height, s), at(x, height / 2, z), FINISH.structure);
      c.add(box(0.45, 0.04, 0.45), at(x, 0.02, z), FINISH.structure);
    }
    const beams = b.piece({ orderA: oa(i) + 0.05, orderB: ob(i) + 0.05, arrive: v3(0, 1.8, 0), explode });
    for (const y of tiers) beams.add(box(0.16, 0.18, zHalf * 2 + 0.4), at(x, y, 0), FINISH.structure);
    // knee braces
    for (const z of [-zHalf, zHalf]) {
      const dz = z > 0 ? -1 : 1;
      beams.add(box(0.06, 0.9, 0.06), rotAxis(v3(x, tiers[0] - 0.4, z + dz * 0.32), v3(1, 0, 0), dz * 0.72), { ...FINISH.structure, lines: 'none' });
    }
  });

  // Longitudinal stringers and X-bracing in alternate bays
  const x0 = xs[0];
  const x1 = xs[n - 1];
  const L = x1 - x0;
  const top = tiers[tiers.length - 1];
  const str = b.piece({ orderA: orderA[1], orderB: orderB[1], arrive: v3(0, 1.8, 0), explode });
  for (const z of [-zHalf, zHalf]) str.add(box(L + 0.3, 0.14, 0.14), at((x0 + x1) / 2, top - 0.02, z), FINISH.structure);
  for (let i = 0; i < n - 1; i += 2) {
    const bx = (xs[i] + xs[i + 1]) / 2;
    const w = xs[i + 1] - xs[i];
    const h = tiers[0] - 0.6;
    const len = Math.hypot(w, h);
    const ang = Math.atan2(h, w);
    for (const sgn of [1, -1]) {
      str.add(box(len, 0.05, 0.05), rotAxis(v3(bx, 0.3 + h / 2, -zHalf), v3(0, 0, 1), sgn * ang), { ...FINISH.structure, lines: 'none' });
    }
  }
}

/** Concrete slab + equipment pads + system-layout footprint lines. */
export function Slab(
  b: PieceBuilder,
  size: [number, number],
  pads: { x: number; z: number; w: number; d: number }[],
  explode: THREE.Vector3,
) {
  const slab = b.piece({ orderA: 0.3, orderB: 0.0, explode });
  slab.add(box(size[0], 0.3, size[1]), at(0, -0.15, 0), { ...FINISH.concrete, lines: 'none' });
  const hw = size[0] / 2;
  const hd = size[1] / 2;
  slab.addLines([
    v3(-hw, 0.001, -hd), v3(hw, 0.001, -hd),
    v3(hw, 0.001, -hd), v3(hw, 0.001, hd),
    v3(hw, 0.001, hd), v3(-hw, 0.001, hd),
    v3(-hw, 0.001, hd), v3(-hw, 0.001, -hd),
  ]);
  pads.forEach((p, i) => {
    const pad = b.piece({ orderA: 0.32 + i * 0.01, orderB: 0.01 + i * 0.004, explode });
    pad.add(box(p.w, 0.12, p.d), at(p.x, 0.06, p.z), FINISH.pad);
    // grid bubble + centrelines, as on a layout drawing
    pad.addLines([
      v3(p.x - p.w / 2 - 0.6, 0.13, p.z), v3(p.x + p.w / 2 + 0.6, 0.13, p.z),
      v3(p.x, 0.13, p.z - p.d / 2 - 0.6), v3(p.x, 0.13, p.z + p.d / 2 + 0.6),
    ]);
  });
}

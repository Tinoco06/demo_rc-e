import * as THREE from 'three';
import type { PieceBuilder, PieceOptions } from '../PieceBuilder';
import { at, box, cone, cyl, rotAxis, v3 } from './primitives';

/**
 * Generic facility massing for the "industries" chapter. These are conceptual
 * building types for industries RC&E lists — never real client facilities.
 */

export type BuildingKind = 'coldStorage' | 'food' | 'beverage' | 'ice' | 'petro';

const WALL = { color: '#a3acb4', metal: 0.2, rough: 0.66 };
const WALL_LIGHT = { color: '#c3cad0', metal: 0.2, rough: 0.6 };
const ROOF = { color: '#4f575f', metal: 0.3, rough: 0.7 };
const DARK = { color: '#20262c', metal: 0.2, rough: 0.8 };
const TANK = { color: '#b9c1c7', metal: 0.8, rough: 0.35 };

export function Building(b: PieceBuilder, kind: BuildingKind, o: PieceOptions, x: number, z: number) {
  const rise = { ...o, arrive: v3(0, -10, 0) };
  const p = b.piece(rise);
  const top = new THREE.Vector3(x, 0, z);

  switch (kind) {
    case 'coldStorage': {
      const W = 56, H = 13, D = 34;
      p.add(box(W, H, D), at(x, H / 2, z), WALL_LIGHT);
      p.add(box(W + 0.6, 0.5, D + 0.6), at(x, H + 0.25, z), ROOF);
      // insulated panel joints
      const seams: THREE.Vector3[] = [];
      for (let i = 1; i < 14; i++) {
        const sx = x - W / 2 + (i * W) / 14;
        seams.push(v3(sx, 0.2, z + D / 2 + 0.02), v3(sx, H, z + D / 2 + 0.02));
      }
      p.addLines(seams);
      // dock doors on the long side
      for (let i = 0; i < 10; i++) {
        p.add(box(3, 3.4, 0.4), at(x - W / 2 + 6 + i * 4.8, 1.9, z + D / 2 + 0.1), { ...DARK, lines: 'none' });
      }
      p.add(box(W - 6, 0.3, 4), at(x + 1, 4.6, z + D / 2 + 2), ROOF);
      // engine-room penthouse + rooftop condensers
      const r = b.piece({ ...rise, orderA: o.orderA + 0.04, arrive: v3(0, 6, 0) });
      r.add(box(12, 4, 9), at(x - W / 2 + 9, H + 2.5, z - 6), WALL);
      r.add(box(4, 3.2, 2.4), at(x - W / 2 + 6, H + 2.1, z + 6), WALL_LIGHT);
      r.add(box(4, 3.2, 2.4), at(x - W / 2 + 11, H + 2.1, z + 6), WALL_LIGHT);
      top.set(x, H + 5, z);
      break;
    }
    case 'food': {
      p.add(box(40, 9, 28), at(x, 4.5, z), WALL);
      p.add(box(40.6, 0.5, 28.6), at(x, 9.25, z), ROOF);
      const hall = b.piece({ ...rise, orderA: o.orderA + 0.03 });
      hall.add(box(18, 13, 16), at(x + 12, 6.5, z - 4), WALL_LIGHT);
      hall.add(box(18.6, 0.5, 16.6), at(x + 12, 13.25, z - 4), ROOF);
      for (let i = 0; i < 3; i++) hall.add(cyl(0.5, 5, 12), at(x - 12 + i * 5, 11.5, z - 6), DARK);
      for (let i = 0; i < 4; i++) hall.add(box(3, 1.6, 2), at(x - 14 + i * 7, 10.3, z + 7), WALL_LIGHT);
      top.set(x, 15, z);
      break;
    }
    case 'beverage': {
      p.add(box(30, 10, 22), at(x, 5, z), WALL);
      p.add(box(30.6, 0.5, 22.6), at(x, 10.25, z), ROOF);
      const tanks = b.piece({ ...rise, orderA: o.orderA + 0.04 });
      for (let i = 0; i < 4; i++) {
        const tx = x - 10 + i * 6.4;
        const tz = z - 17;
        tanks.add(cyl(2.4, 12, 24), at(tx, 8, tz), TANK);
        tanks.add(cone(2.4, 0.4, 1.6, 24), at(tx, 14.8, tz), TANK);
        tanks.add(cone(0.4, 2.4, 2, 24), at(tx, 1, tz), TANK);
      }
      tanks.add(box(26, 0.4, 3), at(x - 0.4, 14, z - 13.5), DARK);
      top.set(x, 17, z - 6);
      break;
    }
    case 'ice': {
      p.add(box(36, 7, 24), at(x, 3.5, z), WALL);
      // barrel-vault roof
      p.add(cyl(12, 36, 32, false), rotAxis(v3(x, 7, z), v3(0, 0, 1), Math.PI / 2, v3(0.42, 1, 1)), ROOF);
      const plant = b.piece({ ...rise, orderA: o.orderA + 0.04 });
      plant.add(box(10, 6, 8), at(x + 23, 3, z + 6), WALL_LIGHT);
      top.set(x, 13, z);
      break;
    }
    case 'petro': {
      for (let i = 0; i < 3; i++) {
        const t = b.piece({ ...rise, orderA: o.orderA + i * 0.02 });
        const tx = x - 22 + i * 16;
        t.add(cyl(6.5, 8, 36), at(tx, 4, z), TANK);
        t.add(cone(6.6, 1, 1.4, 36), at(tx, 8.7, z), TANK);
      }
      const cols = b.piece({ ...rise, orderA: o.orderA + 0.06 });
      cols.add(cyl(1.3, 24, 20), at(x + 26, 12, z - 4), TANK);
      cols.add(cyl(1.0, 18, 20), at(x + 31, 9, z + 1), TANK);
      cols.add(box(10, 0.4, 8), at(x + 28, 8, z - 1.5), DARK);
      cols.add(box(10, 0.4, 8), at(x + 28, 14, z - 1.5), DARK);
      for (const [cx, cz] of [[23, -5.5], [33, -5.5], [23, 2.5], [33, 2.5]]) {
        cols.add(box(0.4, 14, 0.4), at(x + cx, 7, z + cz), DARK);
      }
      top.set(x, 26, z - 4);
      break;
    }
  }
  return { top };
}

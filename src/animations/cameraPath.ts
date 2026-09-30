import * as THREE from 'three';
import { rangeOf, type ChapterId } from '../data/chapters';
import { clamp, smoothstep } from '../utils/math';

/**
 * Camera keyframes, authored per chapter in local 0..1 time.
 * `mw` = how strongly a key pulls back on portrait screens
 * (1 = wide establishing shot, lower = close-up that should stay close).
 */
interface Key {
  ch: ChapterId;
  t: number;
  pos: [number, number, number];
  tgt: [number, number, number];
  mw?: number;
}

const KEYS: Key[] = [
  { ch: 'hero', t: 0, pos: [21, 11.5, 31], tgt: [-1.2, 1.6, 0], mw: 0.4 },
  { ch: 'hero', t: 1, pos: [22.5, 13, 33], tgt: [-1.2, 1.4, 0], mw: 0.45 },

  { ch: 'engineering', t: 0.25, pos: [19, 9.5, 25], tgt: [0, 2, 0] },
  { ch: 'engineering', t: 0.46, pos: [30, 5.5, 35], tgt: [1.5, 1.2, 0] },
  { ch: 'engineering', t: 0.62, pos: [26, 7, 38], tgt: [1.5, 1.2, 0] },
  { ch: 'engineering', t: 0.84, pos: [0, 34, 3], tgt: [0, 0, 0] },
  { ch: 'engineering', t: 1, pos: [0, 35, 3.2], tgt: [0, 0, 0.2] },

  { ch: 'construction', t: 0.16, pos: [-21, 15, 25], tgt: [2.5, 1.5, 1] },
  { ch: 'construction', t: 0.4, pos: [-18, 8.5, 19], tgt: [1, 2.2, 1] },
  { ch: 'construction', t: 0.6, pos: [-13.5, 8, 11.5], tgt: [-1.5, 4, 0], mw: 0.6 },
  { ch: 'construction', t: 0.76, pos: [-11.5, 7.2, 9], tgt: [-1.8, 4.6, 0.6], mw: 0.5 },
  { ch: 'construction', t: 0.92, pos: [-17, 9.5, 21], tgt: [2, 2.8, 0] },
  { ch: 'construction', t: 1, pos: [-16, 10.5, 23], tgt: [2, 2.5, 0] },

  { ch: 'network', t: 0.36, pos: [42, 96, 132], tgt: [0, 0, -4] },
  { ch: 'network', t: 0.84, pos: [-30, 100, 136], tgt: [0, 0, -4] },

  // One steady wide shot with a slow push-in — the labels point out each stage as it starts.
  { ch: 'startup', t: 0.12, pos: [-19.5, 11, 26], tgt: [2.8, 2, 1.8], mw: 0.6 },
  { ch: 'startup', t: 0.9, pos: [-17, 9.8, 23], tgt: [2.8, 2.1, 1.8], mw: 0.6 },

  { ch: 'service', t: 0.2, pos: [-4.2, 2.9, 9], tgt: [-7.2, 1.3, 3.3], mw: 0.5 },
  { ch: 'service', t: 0.8, pos: [-5.6, 3.3, 9.8], tgt: [-7.2, 1.3, 3.3], mw: 0.5 },

  { ch: 'parts', t: 0.12, pos: [0, 12.9, 21], tgt: [0, 13.4, 6], mw: 0.3 },
  { ch: 'parts', t: 0.68, pos: [0, 12.9, 20.2], tgt: [0, 13.4, 6], mw: 0.3 },
  { ch: 'parts', t: 0.92, pos: [2, 13, 27], tgt: [0, 2.5, 0] },

  { ch: 'safety', t: 0.1, pos: [16, 16, 18], tgt: [0, 1.8, 0] },
  { ch: 'safety', t: 0.3, pos: [7, 8.5, 14], tgt: [-4.6, 1.6, 2] },
  { ch: 'safety', t: 0.5, pos: [-4, 11, 13], tgt: [1, 4.5, 0] },
  { ch: 'safety', t: 0.72, pos: [2.6, 3.2, 9.5], tgt: [-0.4, 1.5, 3.6], mw: 0.5 },
  { ch: 'safety', t: 0.92, pos: [-16, 15, 18], tgt: [0, 1.8, 0] },

  { ch: 'insulation', t: 0.14, pos: [2.2, 5, 11.5], tgt: [1.2, 3, 0], mw: 0.7 },
  { ch: 'insulation', t: 0.5, pos: [-2.8, 5.2, 11], tgt: [0.4, 3, 0], mw: 0.7 },
  { ch: 'insulation', t: 0.88, pos: [-8.4, 4.6, 7.2], tgt: [-0.6, 3, 0], mw: 0.7 },

  { ch: 'final', t: 0.5, pos: [22, 20, 36], tgt: [0, 1.5, 0] },
  { ch: 'final', t: 1, pos: [40, 68, 108], tgt: [0, 0, -5] },
];

/** The hero intro starts tight on the first header spool. */
export const INTRO_KEY = { pos: new THREE.Vector3(-12.8, 5.5, 2.6), tgt: new THREE.Vector3(-4.5, 4.9, -0.72) };

interface Flat {
  s: number;
  pos: THREE.Vector3;
  tgt: THREE.Vector3;
  mw: number;
}

const flat: Flat[] = KEYS.map((k) => {
  const r = rangeOf(k.ch);
  return {
    s: r.start + k.t * r.length,
    pos: new THREE.Vector3(...k.pos),
    tgt: new THREE.Vector3(...k.tgt),
    mw: k.mw ?? 1,
  };
}).sort((a, b) => a.s - b.s);

const _d = new THREE.Vector3();

/**
 * Sample the path at scroll position `s`.
 * `portrait` = how much to compensate for a narrow viewport (0 on desktop).
 */
export function sampleCamera(s: number, portrait: number, pos: THREE.Vector3, tgt: THREE.Vector3) {
  let i = 0;
  while (i < flat.length - 2 && s > flat[i + 1].s) i++;
  const a = flat[i];
  const b = flat[i + 1];
  const t = smoothstep(clamp((s - a.s) / Math.max(1e-6, b.s - a.s)));
  pos.lerpVectors(a.pos, b.pos, t);
  tgt.lerpVectors(a.tgt, b.tgt, t);
  const mw = a.mw + (b.mw - a.mw) * t;
  if (portrait > 0) {
    const f = 1 + mw * portrait;
    _d.subVectors(pos, tgt).multiplyScalar(f);
    pos.copy(tgt).add(_d);
  }
}

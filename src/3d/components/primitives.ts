import * as THREE from 'three';
import type { PartOptions } from '../PieceBuilder';

/** Geometry cache — pieces clone on add, so shared templates are safe. */
const cache = new Map<string, THREE.BufferGeometry>();
const cached = (key: string, make: () => THREE.BufferGeometry) => {
  let g = cache.get(key);
  if (!g) {
    g = make();
    cache.set(key, g);
  }
  return g;
};

/** Segment counts drop on the low tier. */
export let SEG = { pipe: 18, vessel: 32, torusRadial: 14, torusTubular: 10 };
export function setLowDetail(low: boolean) {
  SEG = low
    ? { pipe: 12, vessel: 22, torusRadial: 10, torusTubular: 7 }
    : { pipe: 18, vessel: 32, torusRadial: 14, torusTubular: 10 };
  cache.clear();
}

export const cyl = (r: number, h: number, seg = SEG.pipe, open = false) =>
  cached(`c${r}|${h}|${seg}|${open}`, () => new THREE.CylinderGeometry(r, r, h, seg, 1, open));
export const cone = (r0: number, r1: number, h: number, seg = SEG.pipe, open = false) =>
  cached(`k${r0}|${r1}|${h}|${seg}|${open}`, () => new THREE.CylinderGeometry(r1, r0, h, seg, 1, open));
export const box = (w: number, h: number, d: number) =>
  cached(`b${w}|${h}|${d}`, () => new THREE.BoxGeometry(w, h, d));
export const sphere = (r: number, seg = 18) =>
  cached(`s${r}|${seg}`, () => new THREE.SphereGeometry(r, seg, Math.max(8, seg >> 1)));
export const hemi = (r: number, seg = SEG.vessel) =>
  cached(`h${r}|${seg}`, () => new THREE.SphereGeometry(r, seg, 10, 0, Math.PI * 2, 0, Math.PI / 2));
export const torus = (R: number, r: number, arc = Math.PI * 2, radial = SEG.torusRadial, tubular = SEG.torusTubular) =>
  cached(`t${R}|${r}|${arc}|${radial}|${tubular}`, () => new THREE.TorusGeometry(R, r, radial, tubular, arc));

const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3(1, 1, 1);

export const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Matrix placing a Y-up template at `pos`, with its Y axis along `dir`. */
export function alongY(pos: THREE.Vector3, dir: THREE.Vector3 = Y, scale?: THREE.Vector3) {
  _q.setFromUnitVectors(Y, dir.clone().normalize());
  return new THREE.Matrix4().compose(pos, _q, scale ?? _s);
}

/** Matrix placing a Z-normal template (torus, disc) facing `dir`. */
export function facingZ(pos: THREE.Vector3, dir: THREE.Vector3, scale?: THREE.Vector3) {
  _q.setFromUnitVectors(Z, dir.clone().normalize());
  return new THREE.Matrix4().compose(pos, _q, scale ?? _s);
}

export const at = (x: number, y: number, z: number, scale?: THREE.Vector3) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), scale ?? _s);

export function rotY(pos: THREE.Vector3, angle: number) {
  return new THREE.Matrix4().compose(pos, new THREE.Quaternion().setFromAxisAngle(Y, angle), _s);
}

export function rotAxis(pos: THREE.Vector3, axis: THREE.Vector3, angle: number, scale?: THREE.Vector3) {
  return new THREE.Matrix4().compose(pos, new THREE.Quaternion().setFromAxisAngle(axis.clone().normalize(), angle), scale ?? _s);
}

/** Any unit vector perpendicular to `d`. */
export function perpendicular(d: THREE.Vector3) {
  const ref = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : Y;
  return new THREE.Vector3().crossVectors(d, ref).normalize();
}

// ─── Palette (conceptual finishes, echoing the jacketed racks in RC&E's field photos) ──
type Finish = Pick<PartOptions, 'color' | 'metal' | 'rough'>;
export const FINISH = {
  aluminum: { color: '#c3cad0', metal: 0.85, rough: 0.34 },
  bareSteel: { color: '#838b93', metal: 0.6, rough: 0.4 },
  painted: { color: '#a5623a', metal: 0.2, rough: 0.55 },
  equipment: { color: '#7c868f', metal: 0.4, rough: 0.48 },
  equipmentDark: { color: '#2b3137', metal: 0.4, rough: 0.55 },
  navy: { color: '#1f426b', metal: 0.35, rough: 0.42 },
  galvanized: { color: '#a3abb2', metal: 0.75, rough: 0.46 },
  structure: { color: '#434b53', metal: 0.5, rough: 0.6 },
  concrete: { color: '#272c31', metal: 0.0, rough: 0.95 },
  pad: { color: '#30363c', metal: 0.0, rough: 0.9 },
  handwheel: { color: '#b3141e', metal: 0.3, rough: 0.45 },
  weld: { color: '#6f655c', metal: 0.6, rough: 0.4 },
  blade: { color: '#1d2227', metal: 0.3, rough: 0.6 },
  xps: { color: '#8db6d3', metal: 0.0, rough: 0.8 },
} satisfies Record<string, Finish>;

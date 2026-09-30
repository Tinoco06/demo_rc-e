import * as THREE from 'three';
import { FLAGS, type PartOptions, type Piece, type PieceBuilder, type PieceOptions } from '../PieceBuilder';
import { FINISH, SEG, alongY, box, cyl, facingZ, perpendicular, sphere, torus } from './primitives';
import { lerp } from '../../utils/math';

type Finish = Pick<PartOptions, 'color' | 'metal' | 'rough'>;

// ─── Single components ────────────────────────────────────────────────

/** A straight pipe spool from a to b. */
export function PipeSegment(
  piece: Piece,
  a: THREE.Vector3,
  b: THREE.Vector3,
  r: number,
  finish: Finish,
  flowStart?: number,
  lines = true,
) {
  const d = b.clone().sub(a);
  const len = d.length();
  d.normalize();
  const mid = a.clone().add(b).multiplyScalar(0.5);
  piece.add(cyl(r, len, SEG.pipe, true), alongY(mid, d), {
    ...finish,
    lines: lines ? 'edges' : 'none',
    flow: flowStart === undefined ? undefined : (p) => flowStart + p.y + len / 2,
  });
  if (lines) {
    const n = perpendicular(d).multiplyScalar(r);
    const up = new THREE.Vector3().crossVectors(d, n).normalize().multiplyScalar(r);
    piece.addLines([a.clone().add(n), b.clone().add(n), a.clone().sub(n), b.clone().sub(n)]);
    piece.addLines([a.clone().add(up), b.clone().add(up)]);
  }
}

/**
 * A 90° elbow joining a run travelling `dIn` to one travelling `dOut`
 * around the corner point `c` with centreline bend radius `R`.
 */
export function Elbow(
  piece: Piece,
  c: THREE.Vector3,
  dIn: THREE.Vector3,
  dOut: THREE.Vector3,
  r: number,
  R: number,
  finish: Finish,
  flowStart?: number,
  lines = true,
) {
  const x = dOut.clone().negate();
  const y = dIn.clone();
  const z = new THREE.Vector3().crossVectors(x, y);
  const origin = c.clone().sub(dIn.clone().multiplyScalar(R)).add(dOut.clone().multiplyScalar(R));
  const m = new THREE.Matrix4().makeBasis(x, y, z).setPosition(origin);
  piece.add(torus(R, r, Math.PI / 2), m, {
    ...finish,
    lines: 'none',
    flow: flowStart === undefined ? undefined : (p) => flowStart + Math.atan2(p.y, p.x) * R,
  });
  if (lines) {
    // centreline arc + end rings, drawn as a blueprint would
    const pts: THREE.Vector3[] = [];
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      for (const k of [i, i + 1]) {
        const u = (k / steps) * (Math.PI / 2);
        pts.push(new THREE.Vector3(Math.cos(u) * R, Math.sin(u) * R, 0).applyMatrix4(m));
      }
    }
    piece.addLines(pts);
  }
}

/** Butt-weld bead. Glows briefly while it is laid during construction. */
export function Weld(piece: Piece, pos: THREE.Vector3, dir: THREE.Vector3, r: number) {
  piece.add(torus(r * 1.03, Math.max(0.014, r * 0.085), Math.PI * 2, 8, 20), facingZ(pos, dir), {
    ...FINISH.weld,
    flags: FLAGS.weld,
    lines: 'none',
  });
}

export function Flange(piece: Piece, pos: THREE.Vector3, dir: THREE.Vector3, r: number, finish: Finish = FINISH.bareSteel) {
  piece.add(cyl(r * 1.75, Math.max(0.05, r * 0.35)), alongY(pos, dir), { ...finish, edgeAngle: 40 });
}

/** A blind flange closing a header end. */
export function BlindEnd(piece: Piece, pos: THREE.Vector3, dir: THREE.Vector3, r: number) {
  Flange(piece, pos, dir, r, FINISH.equipmentDark);
}

/** Branch boss where a line leaves a header. */
export function Tee(piece: Piece, pos: THREE.Vector3, branchDir: THREE.Vector3, r: number, finish: Finish) {
  piece.add(cyl(r * 1.08, r * 2.4), alongY(pos.clone().add(branchDir.clone().multiplyScalar(r * 1.2)), branchDir), {
    ...finish,
  });
}

/**
 * Isolation valve: body, flanges, bonnet, stem. The handwheel is its own piece so it
 * can turn as it lands.
 */
export function Valve(
  b: PieceBuilder,
  opts: PieceOptions,
  pos: THREE.Vector3,
  dir: THREE.Vector3,
  stem: THREE.Vector3,
  r: number,
) {
  const body = b.piece(opts);
  body.add(sphere(r * 1.45, 16), alongY(pos, dir, new THREE.Vector3(1, 1.2, 1)), { ...FINISH.bareSteel, edgeAngle: 60 });
  Flange(body, pos.clone().add(dir.clone().multiplyScalar(r * 1.55)), dir, r);
  Flange(body, pos.clone().sub(dir.clone().multiplyScalar(r * 1.55)), dir, r);
  const bonnetLen = Math.max(0.16, r * 2);
  body.add(cyl(r * 0.55, bonnetLen, 12), alongY(pos.clone().add(stem.clone().multiplyScalar(r * 1.1 + bonnetLen / 2)), stem), {
    ...FINISH.equipmentDark,
  });
  const stemTop = r * 1.1 + bonnetLen;
  body.add(cyl(0.022, 0.2, 8), alongY(pos.clone().add(stem.clone().multiplyScalar(stemTop + 0.1)), stem), {
    ...FINISH.bareSteel,
    lines: 'none',
  });

  const wheelR = Math.max(0.15, r * 1.3);
  const wheelPos = pos.clone().add(stem.clone().multiplyScalar(stemTop + 0.2));
  const wheel = b.piece({
    ...opts,
    orderA: opts.orderA + 0.012,
    orderB: opts.orderB + 0.012,
    pivot: wheelPos,
    spinAxis: stem,
    spinArrive: Math.PI * 1.25,
  });
  wheel.add(torus(wheelR, 0.03, Math.PI * 2, 8, 24), facingZ(wheelPos, stem), { ...FINISH.handwheel, lines: 'none' });
  const spokeDir = perpendicular(stem);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), spokeDir);
  const m = new THREE.Matrix4().compose(wheelPos, q, new THREE.Vector3(1, 1, 1));
  wheel.add(box(wheelR * 2, 0.03, 0.03), m, { ...FINISH.handwheel, lines: 'none' });
  const q2 = new THREE.Quaternion().setFromAxisAngle(stem, Math.PI / 2).multiply(q);
  wheel.add(box(wheelR * 2, 0.03, 0.03), new THREE.Matrix4().compose(wheelPos, q2, new THREE.Vector3(1, 1, 1)), {
    ...FINISH.handwheel,
    lines: 'none',
  });
  return { body, wheel, wheelPos };
}

// ─── Routes ───────────────────────────────────────────────────────────

export interface RouteOptions {
  points: THREE.Vector3[];
  r: number;
  finish: Finish;
  /** Insulation thickness; adds jacketed sleeves (see Insulation stage). */
  insulation?: number;
  orderA: [number, number];
  orderB: [number, number];
  weldB?: [number, number];
  insB?: [number, number];
  explode: THREE.Vector3;
  zone?: number;
  valves?: { seg: number; t: number; stem: THREE.Vector3 }[];
  spoolMax?: number;
  flowStart?: number;
  /** Arrival style for the spools. */
  arrive?: 'slide' | 'drop';
  /** Radius of the header this branch starts on (adds a boss + weld there). */
  startOnHeader?: number;
  blindEnds?: boolean;
}

export interface RouteResult {
  length: number;
  valves: THREE.Vector3[];
}

export const WELD_B: [number, number] = [0.6, 0.8];

/** Every route weld, for the 3-D weld-map overlay. Cleared by the layout before building. */
export const weldLog: THREE.Vector3[] = [];
export const INS_B: [number, number] = [0.8, 0.98];

export function route(b: PieceBuilder, o: RouteOptions): RouteResult {
  const pts = o.points;
  const n = pts.length - 1;
  const dirs: THREE.Vector3[] = [];
  const lens: number[] = [];
  for (let i = 0; i < n; i++) {
    const d = pts[i + 1].clone().sub(pts[i]);
    lens.push(d.length());
    dirs.push(d.normalize());
  }
  const outer = o.r + (o.insulation ?? 0);
  const R = Math.max(o.r * 1.6, outer * 1.2);
  const arcLen = (Math.PI / 2) * R;

  // Path parametrisation for build order + flow.
  const straights = dirs.map((d, i) => {
    const a = pts[i].clone().add(d.clone().multiplyScalar(i > 0 ? R : 0));
    const e = pts[i + 1].clone().sub(d.clone().multiplyScalar(i < n - 1 ? R : 0));
    return { a, e, d, len: a.distanceTo(e) };
  });
  const total = straights.reduce((s, x) => s + x.len, 0) + arcLen * (n - 1);
  const flow0 = o.flowStart ?? 0;
  const oa = (s: number) => lerp(o.orderA[0], o.orderA[1], s / total);
  const ob = (s: number) => lerp(o.orderB[0], o.orderB[1], s / total);
  const wb = o.weldB ?? WELD_B;
  const ib = o.insB ?? INS_B;
  const owb = (s: number) => lerp(wb[0], wb[1], s / total);
  const oib = (s: number) => lerp(ib[0], ib[1], s / total);
  const spoolMax = o.spoolMax ?? 4.5;
  const zone = o.zone ?? 1;
  const base = { explode: o.explode, zone };
  const valvesOut: THREE.Vector3[] = [];

  const arriveFor = (d: THREE.Vector3) =>
    o.arrive === 'drop'
      ? new THREE.Vector3(0, 1.6, 0)
      : d.clone().multiplyScalar(-1.3).add(new THREE.Vector3(0, 0.35, 0));

  const weldAt = (pos: THREE.Vector3, d: THREE.Vector3, s: number) => {
    const w = b.piece({ ...base, orderA: oa(s) + 0.02, orderB: owb(s) });
    Weld(w, pos, d, o.r);
    weldLog.push(pos.clone());
  };

  if (o.startOnHeader) {
    const boss = b.piece({ ...base, orderA: oa(0), orderB: ob(0), arrive: arriveFor(dirs[0]) });
    Tee(boss, pts[0], dirs[0], o.r, o.finish);
    weldAt(pts[0].clone().add(dirs[0].clone().multiplyScalar(o.startOnHeader)), dirs[0], 0);
  }

  let s = 0;
  straights.forEach((st, i) => {
    // Pipe spools
    const k = Math.max(1, Math.ceil(st.len / spoolMax));
    for (let j = 0; j < k; j++) {
      const a = st.a.clone().add(st.d.clone().multiplyScalar((st.len * j) / k));
      const e = st.a.clone().add(st.d.clone().multiplyScalar((st.len * (j + 1)) / k));
      const s0 = s + (st.len * j) / k;
      const sm = s0 + st.len / k / 2;
      const p = b.piece({ ...base, orderA: oa(sm), orderB: ob(sm), arrive: arriveFor(st.d) });
      PipeSegment(p, a, e, o.r, o.finish, flow0 + s0);
      if (j > 0) weldAt(a, st.d, s0);
    }

    // Valves on this straight
    const gaps: [number, number][] = [];
    for (const v of o.valves ?? []) {
      if (v.seg !== i) continue;
      const pos = st.a.clone().add(st.d.clone().multiplyScalar(st.len * v.t));
      const sv = s + st.len * v.t;
      Valve(b, { ...base, orderA: oa(sv) + 0.03, orderB: ob(sv) + 0.02, arrive: new THREE.Vector3(0, 0.9, 0) }, pos, st.d, v.stem, o.r);
      valvesOut.push(pos);
      const half = o.r * 2.4;
      gaps.push([st.len * v.t - half, st.len * v.t + half]);
    }

    // Jacketed insulation sleeves
    if (o.insulation) {
      const sleeveMax = 1.25;
      const spans: [number, number][] = [];
      let cursor = 0;
      for (const g of gaps.sort((x, y) => x[0] - y[0])) {
        if (g[0] > cursor) spans.push([cursor, g[0]]);
        cursor = g[1];
      }
      if (cursor < st.len) spans.push([cursor, st.len]);
      for (const [u0, u1] of spans) {
        const m = Math.max(1, Math.ceil((u1 - u0) / sleeveMax));
        for (let j = 0; j < m; j++) {
          const w0 = u0 + ((u1 - u0) * j) / m + 0.008;
          const w1 = u0 + ((u1 - u0) * (j + 1)) / m - 0.008;
          if (w1 - w0 < 0.05) continue;
          const a = st.a.clone().add(st.d.clone().multiplyScalar(w0));
          const e = st.a.clone().add(st.d.clone().multiplyScalar(w1));
          const sm = s + (w0 + w1) / 2;
          const p = b.piece({
            ...base,
            orderA: oa(sm) + 0.05,
            orderB: oib(sm),
            arrive: new THREE.Vector3(0, 0.25, 0),
          });
          PipeSegment(p, a, e, outer, FINISH.aluminum, flow0 + s + w0, false);
        }
      }
    }
    s += st.len;

    // Elbow into the next straight
    if (i < n - 1) {
      const c = pts[i + 1];
      const dOut = dirs[i + 1];
      const p = b.piece({ ...base, orderA: oa(s + arcLen / 2), orderB: ob(s + arcLen / 2), arrive: arriveFor(st.d) });
      Elbow(p, c, st.d, dOut, o.r, R, o.finish, flow0 + s);
      weldAt(st.e, st.d, s);
      weldAt(straights[i + 1].a, dOut, s + arcLen);
      if (o.insulation) {
        const pi = b.piece({ ...base, orderA: oa(s + arcLen / 2) + 0.05, orderB: oib(s + arcLen / 2), arrive: new THREE.Vector3(0, 0.25, 0) });
        Elbow(pi, c, st.d, dOut, outer, R, FINISH.aluminum, flow0 + s, false);
      }
      s += arcLen;
    }
  });

  if (o.blindEnds) {
    const first = b.piece({ ...base, orderA: oa(0) + 0.06, orderB: ob(0) + 0.02 });
    BlindEnd(first, pts[0], dirs[0], o.r);
    const last = b.piece({ ...base, orderA: oa(total) + 0.02, orderB: ob(total) });
    BlindEnd(last, pts[n], dirs[n - 1], o.r);
  }

  return { length: total, valves: valvesOut };
}

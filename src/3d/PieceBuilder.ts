import * as THREE from 'three';

/**
 * Collects many small "pieces" (a pipe spool, an elbow, a valve, a compressor…)
 * and merges them into ONE mesh geometry and ONE line geometry.
 *
 * Every vertex carries its piece's animation data (pivot, build order, arrival
 * offset, explode offset, spin), so the GPU animates every piece independently
 * while the whole plant costs two draw calls. See `materials.ts`.
 */

export interface PieceOptions {
  /** Build order during the hero assembly, 0..1. */
  orderA: number;
  /** Build order during the construction chapter, 0..1. */
  orderB: number;
  /** Offset the piece travels from while arriving. */
  arrive?: THREE.Vector3;
  /** Offset applied when the model is exploded into layers. */
  explode?: THREE.Vector3;
  /** Axis + angle the piece rotates through while it lands (e.g. a handwheel). */
  spinAxis?: THREE.Vector3;
  spinArrive?: number;
  /** Safety / service highlight zone (see ZONES). */
  zone?: number;
  /** Rotation pivot. Defaults to the piece's bounding-box centre. */
  pivot?: THREE.Vector3;
}

export interface PartOptions {
  color: THREE.ColorRepresentation;
  metal?: number;
  rough?: number;
  /** 0 none · 1 weld · 2 indicator lamp · 3 screen */
  flags?: number;
  /** Continuous spin once the zone is running (integer multiplier). */
  spinRate?: number;
  /** Per-vertex distance along a pipe run, for the conceptual flow bands. */
  flow?: (local: THREE.Vector3) => number;
  /** Whether to emit blueprint lines for this part. */
  lines?: 'edges' | 'none';
  edgeAngle?: number;
}

export const ZONES = {
  none: 0,
  piping: 1,
  vessels: 2,
  compressors: 3,
  controls: 4,
  condenser: 5,
  evaporator: 6,
  pumps: 7,
} as const;

export const FLAGS = { none: 0, weld: 1, lamp: 2, screen: 3 } as const;

interface MeshChunk {
  geom: THREE.BufferGeometry;
  part: PartOptions;
  /** Geometry-space positions before the part's matrix, for flow evaluation. */
  localPositions?: Float32Array;
}

interface LineChunk {
  positions: number[];
}

const ORIGIN = new THREE.Vector3();

export class Piece {
  meshes: MeshChunk[] = [];
  lines: LineChunk[] = [];
  constructor(public opts: PieceOptions) {}

  /**
   * Add a geometry to this piece. `matrix` places it in plant space.
   * Geometry is cloned; the caller may reuse it.
   */
  add(geometry: THREE.BufferGeometry, matrix: THREE.Matrix4, part: PartOptions): this {
    const g = geometry.clone();
    for (const name of Object.keys(g.attributes)) {
      if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
    }
    if (!g.getAttribute('normal')) g.computeVertexNormals();
    const localPositions = part.flow
      ? new Float32Array(g.getAttribute('position').array as ArrayLike<number>)
      : undefined;
    g.applyMatrix4(matrix);
    if (!g.index) {
      const n = g.getAttribute('position').count;
      const idx = new Uint32Array(n);
      for (let i = 0; i < n; i++) idx[i] = i;
      g.setIndex(new THREE.BufferAttribute(idx, 1));
    }
    this.meshes.push({ geom: g, part, localPositions });

    if ((part.lines ?? 'edges') === 'edges') {
      const edges = new THREE.EdgesGeometry(geometry, part.edgeAngle ?? 30);
      edges.applyMatrix4(matrix);
      this.lines.push({ positions: Array.from(edges.getAttribute('position').array as ArrayLike<number>) });
      edges.dispose();
    }
    return this;
  }

  /** Add raw line segments (pairs of points) in plant space. */
  addLines(points: THREE.Vector3[]): this {
    const arr: number[] = [];
    for (const p of points) arr.push(p.x, p.y, p.z);
    this.lines.push({ positions: arr });
    return this;
  }

  pivot(): THREE.Vector3 {
    if (this.opts.pivot) return this.opts.pivot;
    const box = new THREE.Box3();
    for (const m of this.meshes) {
      m.geom.computeBoundingBox();
      box.union(m.geom.boundingBox!);
    }
    if (box.isEmpty()) {
      for (const l of this.lines) {
        for (let i = 0; i < l.positions.length; i += 3) {
          box.expandByPoint(new THREE.Vector3(l.positions[i], l.positions[i + 1], l.positions[i + 2]));
        }
      }
    }
    return box.isEmpty() ? ORIGIN.clone() : box.getCenter(new THREE.Vector3());
  }
}

export class PieceBuilder {
  pieces: Piece[] = [];

  piece(opts: PieceOptions): Piece {
    const p = new Piece(opts);
    this.pieces.push(p);
    return p;
  }

  build(): { mesh: THREE.BufferGeometry; lines: THREE.BufferGeometry } {
    let vCount = 0;
    let iCount = 0;
    let lCount = 0;
    for (const p of this.pieces) {
      for (const m of p.meshes) {
        vCount += m.geom.getAttribute('position').count;
        iCount += m.geom.index!.count;
      }
      for (const l of p.lines) lCount += l.positions.length / 3;
    }

    const position = new Float32Array(vCount * 3);
    const normal = new Float32Array(vCount * 3);
    const color = new Float32Array(vCount * 3);
    const aMR = new Float32Array(vCount * 2);
    const aPivot = new Float32Array(vCount * 3);
    const aOrder = new Float32Array(vCount * 2);
    const aArrive = new Float32Array(vCount * 3);
    const aExplode = new Float32Array(vCount * 3);
    const aSpin = new Float32Array(vCount * 4);
    const aMisc = new Float32Array(vCount * 4);
    const index = new Uint32Array(iCount);

    const lPosition = new Float32Array(lCount * 3);
    const lPivot = new Float32Array(lCount * 3);
    const lOrder = new Float32Array(lCount * 2);
    const lArrive = new Float32Array(lCount * 3);
    const lExplode = new Float32Array(lCount * 3);

    const c = new THREE.Color();
    const tmp = new THREE.Vector3();
    let v = 0;
    let ii = 0;
    let lv = 0;

    for (const p of this.pieces) {
      const pivot = p.pivot();
      const o = p.opts;
      const arrive = o.arrive ?? ORIGIN;
      const explode = o.explode ?? ORIGIN;
      const spinAxis = o.spinAxis ? o.spinAxis.clone().normalize() : ORIGIN;
      const zone = o.zone ?? 0;

      for (const m of p.meshes) {
        const pos = m.geom.getAttribute('position');
        const nor = m.geom.getAttribute('normal');
        const idx = m.geom.index!;
        const base = v;
        c.set(m.part.color).convertSRGBToLinear();
        for (let i = 0; i < pos.count; i++, v++) {
          position[v * 3] = pos.getX(i);
          position[v * 3 + 1] = pos.getY(i);
          position[v * 3 + 2] = pos.getZ(i);
          normal[v * 3] = nor.getX(i);
          normal[v * 3 + 1] = nor.getY(i);
          normal[v * 3 + 2] = nor.getZ(i);
          color[v * 3] = c.r;
          color[v * 3 + 1] = c.g;
          color[v * 3 + 2] = c.b;
          aMR[v * 2] = m.part.metal ?? 0.2;
          aMR[v * 2 + 1] = m.part.rough ?? 0.6;
          aPivot.set([pivot.x, pivot.y, pivot.z], v * 3);
          aOrder[v * 2] = o.orderA;
          aOrder[v * 2 + 1] = o.orderB;
          aArrive.set([arrive.x, arrive.y, arrive.z], v * 3);
          aExplode.set([explode.x, explode.y, explode.z], v * 3);
          aSpin.set([spinAxis.x, spinAxis.y, spinAxis.z, o.spinArrive ?? 0], v * 4);
          let flow = -1;
          if (m.part.flow && m.localPositions) {
            tmp.fromArray(m.localPositions, i * 3);
            flow = m.part.flow(tmp);
          }
          aMisc.set([m.part.spinRate ?? 0, zone, m.part.flags ?? 0, flow], v * 4);
        }
        for (let k = 0; k < idx.count; k++) index[ii++] = base + idx.getX(k);
        m.geom.dispose();
      }

      for (const l of p.lines) {
        for (let i = 0; i < l.positions.length; i += 3, lv++) {
          lPosition[lv * 3] = l.positions[i];
          lPosition[lv * 3 + 1] = l.positions[i + 1];
          lPosition[lv * 3 + 2] = l.positions[i + 2];
          lPivot.set([pivot.x, pivot.y, pivot.z], lv * 3);
          lOrder[lv * 2] = o.orderA;
          lOrder[lv * 2 + 1] = o.orderB;
          lArrive.set([arrive.x, arrive.y, arrive.z], lv * 3);
          lExplode.set([explode.x, explode.y, explode.z], lv * 3);
        }
      }
    }

    const mesh = new THREE.BufferGeometry();
    mesh.setAttribute('position', new THREE.BufferAttribute(position, 3));
    mesh.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
    mesh.setAttribute('color', new THREE.BufferAttribute(color, 3));
    mesh.setAttribute('aMR', new THREE.BufferAttribute(aMR, 2));
    mesh.setAttribute('aPivot', new THREE.BufferAttribute(aPivot, 3));
    mesh.setAttribute('aOrder', new THREE.BufferAttribute(aOrder, 2));
    mesh.setAttribute('aArrive', new THREE.BufferAttribute(aArrive, 3));
    mesh.setAttribute('aExplode', new THREE.BufferAttribute(aExplode, 3));
    mesh.setAttribute('aSpin', new THREE.BufferAttribute(aSpin, 4));
    mesh.setAttribute('aMisc', new THREE.BufferAttribute(aMisc, 4));
    mesh.setIndex(new THREE.BufferAttribute(index, 1));
    mesh.computeBoundingSphere();
    // Pieces travel during assembly/explode; never let the culler drop the plant.
    mesh.boundingSphere!.radius += 40;

    const lines = new THREE.BufferGeometry();
    lines.setAttribute('position', new THREE.BufferAttribute(lPosition, 3));
    lines.setAttribute('aPivot', new THREE.BufferAttribute(lPivot, 3));
    lines.setAttribute('aOrder', new THREE.BufferAttribute(lOrder, 2));
    lines.setAttribute('aArrive', new THREE.BufferAttribute(lArrive, 3));
    lines.setAttribute('aExplode', new THREE.BufferAttribute(lExplode, 3));
    lines.computeBoundingSphere();
    if (lines.boundingSphere) lines.boundingSphere.radius += 40;

    return { mesh, lines };
  }
}

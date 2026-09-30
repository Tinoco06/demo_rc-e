import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { stage } from '../animations/director';
import { PieceBuilder } from '../3d/PieceBuilder';
import { createBuildMaterial, createBuildUniforms } from '../3d/materials';
import { Compressor, Condenser, Evaporator, HeatExchanger, Pump } from '../3d/components/equipment';
import { Elbow, Flange, PipeSegment, Tee, Valve, Weld } from '../3d/components/piping';
import { FINISH, v3 } from '../3d/components/primitives';
import { getPlant } from './plantData';
import { device } from '../utils/device';
import { band, clamp, easeInOutCubic, sramp } from '../utils/math';

/** Only components RC&E's parts page lists (claim `parts-list`). */
export const PART_LABELS = [
  'Compressor packages',
  'Condensers',
  'Evaporators',
  'Heat exchangers',
  'Pumps',
  'Valves',
  'Fittings',
  'Piping components',
];

/** Written each frame for the label projector. */
export const partsAnchors = PART_LABELS.map(() => ({ pos: new THREE.Vector3(), vis: 0 }));

const O = { orderA: 0, orderB: 0 };
const X = v3(1, 0, 0);
const Y = v3(0, 1, 0);

function buildItem(i: number) {
  const b = new PieceBuilder();
  switch (i) {
    case 0: Compressor(b, O, 0, 0, 0); break;
    case 1: Condenser(b, O, 0, 0, 0); break;
    case 2: Evaporator(b, O, 0, 0, 0); break;
    case 3: HeatExchanger(b, O, 0, 0, 0); break;
    case 4: Pump(b, O, 0, 0, 0); break;
    case 5: Valve(b, O, v3(0, 0, 0), X, Y, 0.22); break;
    case 6: {
      // Compact cluster: a tee on a short run, turning down through an elbow.
      const p = b.piece(O);
      const NY = v3(0, -1, 0);
      PipeSegment(p, v3(-0.6, 0, 0), v3(0.3, 0, 0), 0.18, FINISH.bareSteel);
      Tee(p, v3(0, 0, 0), Y, 0.18, FINISH.bareSteel);
      Elbow(p, v3(0.6, 0, 0), X, NY, 0.18, 0.3, FINISH.bareSteel);
      Flange(p, v3(-0.6, 0, 0), X, 0.18);
      Flange(p, v3(0, 0.44, 0), Y, 0.18);
      Flange(p, v3(0.6, -0.3, 0), NY, 0.18);
      Weld(p, v3(0.3, 0, 0), X, 0.18);
      break;
    }
    case 7: {
      const p = b.piece(O);
      PipeSegment(p, v3(-1, 0, 0), v3(1, 0, 0), 0.2, FINISH.painted);
      Flange(p, v3(-1, 0, 0), X, 0.2);
      Flange(p, v3(1, 0, 0), X, 0.2);
      Weld(p, v3(0, 0, 0), X, 0.2);
      break;
    }
  }
  const { mesh, lines } = b.build();
  lines.dispose();
  mesh.computeBoundingBox();
  const box = mesh.boundingBox!;
  const center = box.getCenter(new THREE.Vector3());
  // Recentre (the build attributes carry pivots, so translate those too).
  mesh.translate(-center.x, -center.y, -center.z);
  const pivot = mesh.getAttribute('aPivot') as THREE.BufferAttribute;
  for (let k = 0; k < pivot.count; k++) {
    pivot.setXYZ(k, pivot.getX(k) - center.x, pivot.getY(k) - center.y, pivot.getZ(k) - center.z);
  }
  mesh.computeBoundingSphere();
  const radius = box.getSize(new THREE.Vector3()).length() / 2;
  // Undo the builder's culling padding: size by the true half-diagonal.
  mesh.boundingSphere!.radius = radius;
  return { geometry: mesh, fit: 1 / radius };
}

export function PartsLibrary() {
  const plant = getPlant();
  const items = useMemo(() => PART_LABELS.map((_, i) => buildItem(i)), []);
  const uniforms = useMemo(() => {
    const u = createBuildUniforms();
    u.uPower.value = 1;
    return u;
  }, []);
  const material = useMemo(() => createBuildMaterial(uniforms), [uniforms]);
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  const targets = useMemo(() => {
    const a = plant.anchors;
    return [a.compressor1, a.condenser, a.evaporator, a.heatExchanger, a.pumps, a.headerValve, v3(-6.75, 5.75, -0.72), a.headerMid];
  }, [plant]);

  useEffect(() => () => {
    material.dispose();
    items.forEach((it) => it.geometry.dispose());
  }, [material, items]);

  const tmp = useMemo(() => ({ slot: new THREE.Vector3(), p: new THREE.Vector3() }), []);

  useFrame((state) => {
    const p = stage.parts;
    const g = group.current;
    if (!g) return;
    g.visible = stage.partsVisible;
    if (!g.visible) {
      partsAnchors.forEach((a) => (a.vis = 0));
      return;
    }
    const t = device.reducedMotion ? 0 : state.clock.elapsedTime;
    const n = items.length;
    const mobile = device.mobile;
    // Fit the row to ~80% of the visible width at the shelf depth, so it never clips.
    const cam = state.camera as THREE.PerspectiveCamera;
    const depth = Math.max(4, Math.abs(cam.position.z - 6));
    const visibleW = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * depth * (state.size.width / state.size.height);
    const spacing = Math.min(1.9, (visibleW * 0.8) / n);
    const k = spacing / 1.9;

    items.forEach((it, i) => {
      const m = meshes.current[i];
      if (!m) return;
      let scale: number;
      let presence: number;
      if (mobile) {
        const w0 = 0.06 + i * 0.078;
        presence = band(p, w0, w0 + 0.025, w0 + 0.07, w0 + 0.085);
        tmp.slot.set(0, 13.6, 6);
        scale = 1.9 * it.fit;
      } else {
        // A flat catalogue row: equal spacing, equal footprint, labels on one baseline.
        const x = (i - (n - 1) / 2) * spacing;
        tmp.slot.set(x, 12 + Math.sin(t * 0.8 + i) * 0.04, 6);
        presence = sramp(p, 0.06 + i * 0.03, 0.15 + i * 0.03);
        scale = 0.74 * k * it.fit;
      }
      // Fly into the system
      const fly = easeInOutCubic(clamp((p - (0.7 + i * 0.016)) / 0.16));
      if (mobile && fly > 0) presence = 1;
      tmp.p.lerpVectors(tmp.slot, targets[i], fly);
      tmp.p.y += Math.sin(fly * Math.PI) * 2.5 - (1 - presence) * 1.2;
      const s = scale * presence * (1 - fly * 0.55) * (fly > 0.97 ? (1 - fly) / 0.03 : 1);
      m.position.copy(tmp.p);
      m.scale.setScalar(Math.max(0.0001, s));
      // Hold a readable three-quarter view with a slow sway (a full spin shows wide parts end-on).
      m.rotation.set(0.18, -0.55 + Math.sin(t * 0.35 + i * 0.9) * 0.3 + (1 - presence) * 1.2, 0);
      m.visible = s > 0.001;
      partsAnchors[i].pos.set(tmp.slot.x, mobile ? tmp.slot.y - 1.7 : 12 - 0.95 * k, tmp.slot.z);
      partsAnchors[i].vis = presence * (1 - clamp(fly * 4));
    });
  }, -3);

  return (
    <group ref={group} visible={false}>
      {items.map((it, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
          }}
          geometry={it.geometry}
          material={material}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}

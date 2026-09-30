import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { stage } from '../animations/director';
import { JACKETS, interaction } from '../animations/interaction';
import { device } from '../utils/device';
import { damp, sramp } from '../utils/math';

/**
 * Close-up cutaway: pipe → insulation → vapor barrier → protective jacket.
 * Layers are staggered at the near end so the finished section reads like a
 * technical cutaway. Materials follow RC&E's published "in most cases" spec
 * (claim `ins-materials`); the jacket is switchable (claim `ins-jacket`).
 */

export const STUDY_CENTER = new THREE.Vector3(0, 3, 0);
const PIPE = { r0: 0.42, r1: 0.5, a: -4, b: 4 };
const XPS = { r1: 0.95, a: -3.0, b: 4 };
const BARRIER = { r: 0.965, a: -2.6, b: 4 };
const JACKET = { r: 1.0, a: -2.2, b: 4 };

/** Anchors (world) for the layer labels + their visibility, written each frame. */
export const insulationAnchors = {
  pipe: { pos: new THREE.Vector3(), vis: 0 },
  xps: { pos: new THREE.Vector3(), vis: 0 },
  barrier: { pos: new THREE.Vector3(), vis: 0 },
  jacket: { pos: new THREE.Vector3(), vis: 0 },
};

function ringLathe(r0: number, r1: number, a: number, b: number, phiStart = 0, phiLength = Math.PI * 2, seg = 72) {
  const pts = [new THREE.Vector2(r0, a), new THREE.Vector2(r1, a), new THREE.Vector2(r1, b), new THREE.Vector2(r0, b), new THREE.Vector2(r0, a)];
  return new THREE.LatheGeometry(pts, seg, phiStart, phiLength);
}

/** Open cylinder with an angular reveal attribute (0..1 around the circumference). */
function wrapCylinder(r: number, a: number, b: number, seg = 96) {
  const g = new THREE.CylinderGeometry(r, r, b - a, seg, 1, true);
  g.translate(0, (a + b) / 2, 0);
  const uv = g.getAttribute('uv');
  const u = new Float32Array(uv.count);
  for (let i = 0; i < uv.count; i++) u[i] = uv.getX(i);
  g.setAttribute('aU', new THREE.BufferAttribute(u, 1));
  return g;
}

function revealMaterial(params: THREE.MeshStandardMaterialParameters) {
  const reveal = { value: 0 };
  const m = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, ...params });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = reveal;
    shader.vertexShader = 'attribute float aU;\nvarying float vU;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvU = aU;');
    shader.fragmentShader =
      'uniform float uReveal;\nvarying float vU;\n' +
      shader.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (vU > uReveal) discard;');
  };
  m.customProgramCacheKey = () => 'reveal';
  return { material: m, reveal };
}

export function InsulationStudy() {
  const group = useRef<THREE.Group>(null);
  const pipeRef = useRef<THREE.Mesh>(null);
  const topRef = useRef<THREE.Mesh>(null);
  const botRef = useRef<THREE.Mesh>(null);
  const barrierRef = useRef<THREE.Mesh>(null);
  const jacketRef = useRef<THREE.Mesh>(null);

  const geo = useMemo(
    () => ({
      pipe: ringLathe(PIPE.r0, PIPE.r1, PIPE.a, PIPE.b),
      // phi 0..π faces local +x (world −y after the group rotation): bottom half.
      bottom: ringLathe(PIPE.r1 + 0.002, XPS.r1, XPS.a, XPS.b, 0, Math.PI, 48),
      top: ringLathe(PIPE.r1 + 0.002, XPS.r1, XPS.a, XPS.b, Math.PI, Math.PI, 48),
      barrier: wrapCylinder(BARRIER.r, BARRIER.a, BARRIER.b),
      jacket: wrapCylinder(JACKET.r, JACKET.a, JACKET.b),
      rim: new THREE.TorusGeometry(JACKET.r, 0.018, 8, 96),
    }),
    [],
  );

  const mats = useMemo(() => {
    const barrier = revealMaterial({ color: '#dfe9ef', metalness: 0, roughness: 0.18, transparent: true, opacity: 0.42, depthWrite: false });
    const jacket = revealMaterial({ color: JACKETS[0].color, metalness: JACKETS[0].metal, roughness: JACKETS[0].rough });
    return {
      pipe: new THREE.MeshStandardMaterial({ color: '#6b737a', metalness: 0.75, roughness: 0.36, transparent: true }),
      xps: new THREE.MeshStandardMaterial({ color: '#6f9ec4', metalness: 0, roughness: 0.85, transparent: true }),
      barrier,
      jacket,
      rim: new THREE.MeshStandardMaterial({ color: '#b9c1c7', metalness: 0.9, roughness: 0.3, transparent: true }),
      jacketColor: new THREE.Color(JACKETS[0].color),
    };
  }, []);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      mats.pipe.dispose();
      mats.xps.dispose();
      mats.barrier.material.dispose();
      mats.jacket.material.dispose();
      mats.rim.dispose();
    },
    [geo, mats],
  );

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    g.visible = stage.insulationVisible;
    const A = insulationAnchors;
    if (!g.visible) {
      A.pipe.vis = A.xps.vis = A.barrier.vis = A.jacket.vis = 0;
      return;
    }
    const p = stage.insulation;
    const exit = 1 - stage.alpha * (stage.insulation >= 1 ? 1 : 0);

    // 1 · the pipe slides in
    const e1 = sramp(p, 0.04, 0.22);
    pipeRef.current!.position.y = (1 - e1) * 9;
    mats.pipe.opacity = e1 * exit;
    // 2 · insulation halves close around it
    const eTop = sramp(p, 0.22, 0.4);
    const eBot = sramp(p, 0.26, 0.44);
    topRef.current!.position.x = -(1 - eTop) * 2.4;
    botRef.current!.position.x = (1 - eBot) * 2.4;
    mats.xps.opacity = Math.min(1, eTop * 3) * exit;
    botRef.current!.visible = eBot > 0.001;
    topRef.current!.visible = eTop > 0.001;
    // 3 · vapor barrier wraps
    mats.barrier.reveal.value = sramp(p, 0.46, 0.62);
    barrierRef.current!.visible = mats.barrier.reveal.value > 0.001;
    mats.barrier.material.opacity = 0.42 * exit;
    // 4 · protective jacket wraps
    const eJ = sramp(p, 0.64, 0.82);
    mats.jacket.reveal.value = eJ;
    jacketRef.current!.visible = eJ > 0.001;
    mats.rim.opacity = sramp(p, 0.8, 0.86) * exit;

    // Jacket choice (lerped so a change feels physical)
    const j = JACKETS.find((x) => x.id === interaction.jacket) ?? JACKETS[0];
    const k = device.reducedMotion ? 1 : damp(6, dt);
    const jm = mats.jacket.material;
    jm.color.lerp(mats.jacketColor.set(j.color), k);
    jm.metalness += (j.metal - jm.metalness) * k;
    jm.roughness += (j.rough - jm.roughness) * k;
    jm.transparent = exit < 1;
    jm.opacity = exit;

    // Slow idle turn for the finished section
    g.rotation.x = device.reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.2) * 0.04;

    // Labels at the stepped end (world space: local y → world x)
    const c = STUDY_CENTER;
    A.pipe.pos.set(c.x + PIPE.a + 0.3, c.y - PIPE.r1 - 0.02, c.z);
    A.xps.pos.set(c.x + XPS.a + 0.25, c.y - XPS.r1, c.z);
    A.barrier.pos.set(c.x + BARRIER.a + 0.2, c.y + BARRIER.r, c.z);
    A.jacket.pos.set(c.x + JACKET.a + 1.6, c.y + JACKET.r, c.z);
    const labels = sramp(p, 0.84, 0.9);
    A.pipe.vis = Math.max(sramp(p, 0.14, 0.22) * (1 - sramp(p, 0.3, 0.36)), labels) * exit;
    A.xps.vis = Math.max(sramp(p, 0.38, 0.44) * (1 - sramp(p, 0.5, 0.56)), labels) * exit;
    A.barrier.vis = Math.max(sramp(p, 0.56, 0.62) * (1 - sramp(p, 0.68, 0.72)), labels) * exit;
    A.jacket.vis = Math.max(sramp(p, 0.76, 0.82), labels) * exit;
  }, -3);

  return (
    <group ref={group} position={STUDY_CENTER} visible={false}>
      <group rotation-z={-Math.PI / 2}>
        <mesh ref={pipeRef} geometry={geo.pipe} material={mats.pipe} />
        <mesh ref={topRef} geometry={geo.top} material={mats.xps} />
        <mesh ref={botRef} geometry={geo.bottom} material={mats.xps} />
        <mesh ref={barrierRef} geometry={geo.barrier} material={mats.barrier.material} renderOrder={3} />
        <mesh ref={jacketRef} geometry={geo.jacket} material={mats.jacket.material} />
        <mesh geometry={geo.rim} material={mats.rim} position-y={JACKET.a} rotation-x={Math.PI / 2} />
      </group>
    </group>
  );
}

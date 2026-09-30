import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { stage } from '../animations/director';
import { createBuildMaterial, createBuildUniforms, createLineMaterial } from '../3d/materials';
import { getPlant } from './plantData';
import { device } from '../utils/device';

const ICE = new THREE.Color('#bddae6');
const AMBER = new THREE.Color('#f0b541');
const TAU = Math.PI * 2;

export function Plant() {
  const plant = getPlant();
  const uniforms = useMemo(createBuildUniforms, []);
  const material = useMemo(() => createBuildMaterial(uniforms), [uniforms]);
  const line = useMemo(() => createLineMaterial(uniforms, '#8fc0da'), [uniforms]);
  const runAngle = useMemo(() => new Array(8).fill(0) as number[], []);

  // 3-D weld map: every weld as a screen-space marker (legible at plan-view distance).
  const weldMap = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(plant.welds);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: { uAlpha: { value: 0 }, uSize: { value: 9 * Math.min(2, window.devicePixelRatio) }, uColor: { value: new THREE.Color('#ffb36b') } },
      vertexShader: /* glsl */ `
        uniform float uSize;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uAlpha;
        uniform vec3 uColor;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float ring = smoothstep(0.62, 0.72, d) * (1.0 - smoothstep(0.86, 1.0, d));
          float core = 1.0 - smoothstep(0.18, 0.3, d);
          gl_FragColor = vec4(uColor, (ring + core) * uAlpha);
        }`,
    });
    return { geometry, material };
  }, [plant]);

  useEffect(
    () => () => {
      material.dispose();
      line.material.dispose();
      weldMap.geometry.dispose();
      weldMap.material.dispose();
    },
    [material, line, weldMap],
  );

  useFrame((state, dt) => {
    const u = uniforms;
    u.uTime.value = device.reducedMotion ? 0 : state.clock.elapsedTime;
    u.uBuildA.value = stage.buildA;
    u.uBuildB.value = stage.buildB;
    u.uExplode.value = stage.explode;
    u.uAlpha.value = stage.alpha;
    u.uFlow.value = device.reducedMotion ? stage.flow * 0.5 : stage.flow;
    u.uPower.value = stage.power;
    u.uWeldShow.value = stage.weldShow;
    for (let i = 0; i < 8; i++) {
      // Spin accumulates with the run level so equipment spins up and coasts down.
      if (!device.reducedMotion) runAngle[i] = (runAngle[i] + dt * 4.2 * stage.run[i]) % TAU;
      u.uRun.value[i] = runAngle[i];
      u.uZoneW.value[i] = stage.zoneW[i];
    }
    u.uHiColor.value.copy(stage.attention ? AMBER : ICE);
    material.depthWrite = stage.alpha > 0.98;
    line.alpha.value = stage.lineAlpha;
    weldMap.material.uniforms.uAlpha.value = stage.weldShow;
  });

  return (
    <group>
      <mesh geometry={plant.mesh} material={material} frustumCulled={false} renderOrder={1} />
      <lineSegments geometry={plant.lines} material={line.material} frustumCulled={false} renderOrder={2} />
      <points geometry={weldMap.geometry} material={weldMap.material} frustumCulled={false} renderOrder={4} />
    </group>
  );
}

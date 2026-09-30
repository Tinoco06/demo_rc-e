import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { stage } from '../animations/director';
import { createBuildMaterial, createBuildUniforms, createLineMaterial } from '../3d/materials';
import { getNetwork } from './networkData';
import { device } from '../utils/device';

export function Network() {
  const net = getNetwork();
  const group = useRef<THREE.Group>(null);
  const uniforms = useMemo(() => {
    const u = createBuildUniforms();
    u.uWinA.value = 0.22;
    return u;
  }, []);
  const material = useMemo(() => createBuildMaterial(uniforms), [uniforms]);
  const line = useMemo(() => createLineMaterial(uniforms, '#7fa9c2'), [uniforms]);

  useEffect(
    () => () => {
      material.dispose();
      line.material.dispose();
    },
    [material, line],
  );

  useFrame((state) => {
    const u = uniforms;
    u.uBuildA.value = stage.networkBuild;
    u.uAlpha.value = stage.networkAlpha;
    u.uTime.value = device.reducedMotion ? 0 : state.clock.elapsedTime * 3;
    u.uFlow.value = stage.networkFlow * 0.8;
    material.depthWrite = stage.networkAlpha > 0.98;
    line.alpha.value = 0.28 * stage.networkAlpha;
    if (group.current) group.current.visible = stage.networkAlpha > 0.003;
  });

  return (
    <group ref={group}>
      <mesh geometry={net.mesh} material={material} frustumCulled={false} />
      <lineSegments geometry={net.lines} material={line.material} frustumCulled={false} />
    </group>
  );
}

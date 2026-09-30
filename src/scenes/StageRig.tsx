import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { direct, stage } from '../animations/director';

const BG = new THREE.Color('#0a0f14');
const BLUEPRINT = new THREE.Color('#0a2135');

/**
 * Runs the director once per frame (before any scene reads `stage`), and owns
 * background, fog, exposure, lights and the generated environment map.
 */
export function StageRig() {
  const { gl, scene } = useThree();
  const color = useMemo(() => BG.clone(), []);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    scene.background = color;
    scene.fog = new THREE.Fog(color, 30, 120);
    room.dispose();
    pmrem.dispose();
    return () => env.dispose();
  }, [gl, scene, color]);

  useFrame((state) => {
    direct(state.clock.elapsedTime);
    color.copy(BG).lerp(BLUEPRINT, stage.blueprint);
    gl.toneMappingExposure = stage.exposure;
  }, -10);

  return (
    <>
      <hemisphereLight args={['#dfe8f0', '#161b20', 0.75]} />
      <directionalLight position={[14, 22, 16]} intensity={2.3} color="#fff3e4" />
      <directionalLight position={[-16, 9, -12]} intensity={0.7} color="#9cc2dc" />
      <directionalLight position={[0, -6, 12]} intensity={0.18} color="#bddae6" />
    </>
  );
}

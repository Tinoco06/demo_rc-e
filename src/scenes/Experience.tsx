import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { StageRig } from './StageRig';
import { CameraRig } from './CameraRig';
import { Ground } from './Ground';
import { Plant } from './Plant';
import { Network } from './Network';
import { PartsLibrary } from './PartsLibrary';
import { InsulationStudy } from './InsulationStudy';
import { AnchorProjector } from './AnchorProjector';
import { device } from '../utils/device';

/**
 * The single persistent WebGL canvas behind the story. Lazily loaded so the
 * copy paints before three.js is parsed.
 */
export default function Experience({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      className="experience-canvas"
      dpr={[1, device.maxDpr]}
      gl={{
        antialias: device.tier === 'high',
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
      }}
      camera={{ fov: 34, near: 0.1, far: 900, position: [15, 8.5, 21] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        onReady?.();
      }}
      aria-hidden="true"
    >
      <StageRig />
      <CameraRig />
      <Ground />
      <Plant />
      <Network />
      <PartsLibrary />
      <InsulationStudy />
      <AnchorProjector />
    </Canvas>
  );
}

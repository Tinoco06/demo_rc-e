import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { INTRO_KEY, sampleCamera } from '../animations/cameraPath';
import { stage } from '../animations/director';
import { timeline } from '../animations/timeline';
import { chapterRanges } from '../data/chapters';
import { clamp, damp, easeInOutCubic, ramp, smoothstep } from '../utils/math';
import { device } from '../utils/device';

const SIDE = { left: 1, right: -1, center: 0 } as const;

/** Which side of the frame the copy occupies, blended across chapter boundaries. */
function textSideAt(s: number) {
  let i = 0;
  while (i < chapterRanges.length - 1 && s >= chapterRanges[i + 1].start) i++;
  const cur = SIDE[chapterRanges[i].textSide];
  const prev = i > 0 ? SIDE[chapterRanges[i - 1].textSide] : cur;
  const t = smoothstep(clamp((s - chapterRanges[i].start) / 0.45));
  return prev + (cur - prev) * t;
}

export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const scene = useThree((s) => s.scene);
  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tgt: new THREE.Vector3(),
      curPos: new THREE.Vector3(15, 8.5, 21),
      curTgt: new THREE.Vector3(0, 2.4, 0),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      side: 0,
      init: false,
    }),
    [],
  );

  useFrame((_, dt) => {
    const aspect = size.width / Math.max(1, size.height);
    const portrait = aspect < 1.2 ? clamp(1.05 / aspect - 0.55, 0, 1.6) : 0;

    sampleCamera(timeline.s, portrait, tmp.pos, tmp.tgt);

    // Hero intro: start tight on the first spool and pull back as the system assembles.
    if (stage.intro < 1) {
      const e = easeInOutCubic(ramp(stage.intro, 0.06, 0.96));
      const close = INTRO_KEY.pos.clone();
      const closeT = INTRO_KEY.tgt.clone();
      if (portrait > 0) close.sub(closeT).multiplyScalar(1 + 0.5 * portrait).add(closeT);
      tmp.pos.lerpVectors(close, tmp.pos, e);
      tmp.tgt.lerpVectors(closeT, tmp.tgt, e);
    }

    if (!tmp.init || device.reducedMotion) {
      tmp.curPos.copy(tmp.pos);
      tmp.curTgt.copy(tmp.tgt);
      tmp.init = true;
    } else {
      const k = damp(3.2, dt);
      tmp.curPos.lerp(tmp.pos, k);
      tmp.curTgt.lerp(tmp.tgt, k);
    }

    camera.position.copy(tmp.curPos);
    // Subtle depth from the pointer — scaled by distance so it reads the same at every scale.
    if (!device.reducedMotion && !device.mobile) {
      tmp.fwd.subVectors(tmp.curTgt, tmp.curPos);
      const dist = tmp.fwd.length();
      tmp.fwd.normalize();
      tmp.right.crossVectors(tmp.fwd, THREE.Object3D.DEFAULT_UP).normalize();
      tmp.up.crossVectors(tmp.right, tmp.fwd).normalize();
      const a = dist * 0.028 * stage.parallax;
      camera.position.addScaledVector(tmp.right, timeline.mouse.x * a);
      camera.position.addScaledVector(tmp.up, -timeline.mouse.y * a * 0.55);
    }
    camera.lookAt(tmp.curTgt);

    const fov = portrait > 0 ? 34 + 10 * Math.min(1, portrait) : 34;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    // Leave room for the copy: shift the frame away from the text column.
    const side = textSideAt(timeline.s);
    tmp.side += (side - tmp.side) * damp(4, dt);
    const w = size.width;
    const h = size.height;
    if (device.mobile || aspect < 1.2) {
      camera.setViewOffset(w, h, 0, h * 0.16, w, h);
    } else {
      camera.setViewOffset(w, h, -tmp.side * w * 0.13, 0, w, h);
    }

    // Fog follows the framing distance so far elements melt into the background.
    const d = tmp.curPos.distanceTo(tmp.curTgt);
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fog.near = d * 0.9;
      fog.far = d * 3.2 + 20;
    }
  }, -5);

  return null;
}

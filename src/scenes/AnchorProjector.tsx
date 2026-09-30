import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { stage } from '../animations/director';
import { anchorEls } from '../animations/interaction';
import { timeline } from '../animations/timeline';
import { EXPLODE } from '../3d/layouts/plantLayout';
import { getPlant } from './plantData';
import { getNetwork } from './networkData';
import { partsAnchors } from './PartsLibrary';
import { insulationAnchors } from './InsulationStudy';
import { band, sramp } from '../utils/math';
import { v3 } from '../3d/components/primitives';

interface AnchorSpec {
  id: string;
  world: (out: THREE.Vector3) => THREE.Vector3;
  vis: () => number;
}

/**
 * Pins DOM labels (rendered by the sections) to points in the 3D scene.
 * Writes transforms directly — no React re-renders per frame.
 */
export function AnchorProjector() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const specs = useMemo<AnchorSpec[]>(() => {
    const { anchors } = getPlant();
    const net = getNetwork();
    const L = timeline.local.bind(timeline);
    const layer = (base: THREE.Vector3, ex: THREE.Vector3) => (out: THREE.Vector3) =>
      out.copy(base).addScaledVector(ex, stage.explode - 1);
    const fixed = (p: THREE.Vector3) => (out: THREE.Vector3) => out.copy(p);
    const layerVis = () => sramp(stage.explode, 0.55, 0.9);

    const list: AnchorSpec[] = [
      { id: 'layer-piping', world: layer(anchors.layers.piping, EXPLODE.piping), vis: layerVis },
      { id: 'layer-equipment', world: layer(anchors.layers.equipment, EXPLODE.equipment), vis: layerVis },
      { id: 'layer-structure', world: layer(anchors.layers.structure, EXPLODE.structure), vis: layerVis },
      { id: 'layer-layout', world: layer(anchors.layers.layout, EXPLODE.layout), vis: layerVis },

      { id: 'up-controls', world: fixed(anchors.controls.clone().add(v3(0, 1.1, 0))), vis: () => band(L('startup'), 0.12, 0.16, 0.26, 0.3) },
      { id: 'up-compressors', world: fixed(anchors.compressor2.clone().add(v3(0, 1.2, 0))), vis: () => band(L('startup'), 0.3, 0.34, 0.4, 0.44) },
      { id: 'up-condenser', world: fixed(anchors.condenser.clone().add(v3(0, 1.8, 0))), vis: () => band(L('startup'), 0.44, 0.48, 0.54, 0.57) },
      { id: 'up-evaporator', world: fixed(anchors.evaporator.clone().add(v3(0, 1.0, 0.6))), vis: () => band(L('startup'), 0.58, 0.61, 0.66, 0.69) },
      { id: 'up-piping', world: fixed(v3(3, 5.6, -0.4)), vis: () => band(L('startup'), 0.72, 0.76, 0.84, 0.88) },

      { id: 'svc-reticle', world: fixed(anchors.compressor1), vis: () => band(L('service'), 0.14, 0.22, 0.86, 0.94) },

      { id: 'safe-pha', world: fixed(v3(-5.3, 2.6, 3.3)), vis: () => band(L('safety'), 0.26, 0.32, 0.44, 0.48) },
      { id: 'safe-mi', world: fixed(v3(0.5, 5.4, -0.7)), vis: () => band(L('safety'), 0.46, 0.52, 0.64, 0.68) },
      { id: 'safe-sop', world: fixed(anchors.controls.clone().add(v3(0, 0.9, 0.3))), vis: () => band(L('safety'), 0.66, 0.72, 0.82, 0.86) },
    ];

    for (const [id, top] of Object.entries(net.tops)) {
      list.push({
        id,
        world: fixed(top.clone().add(v3(0, 1.5, 0))),
        vis: () => band(L('network'), 0.34, 0.46, 0.9, 0.98) * sramp(stage.networkBuild, 0.5, 0.9),
      });
    }
    partsAnchors.forEach((a, i) => list.push({ id: `part-${i}`, world: (o) => o.copy(a.pos), vis: () => a.vis }));
    for (const [k, a] of Object.entries(insulationAnchors)) {
      list.push({ id: `ins-${k}`, world: (o) => o.copy(a.pos), vis: () => a.vis });
    }
    return list;
  }, []);

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    for (const spec of specs) {
      const el = anchorEls.get(spec.id);
      if (!el) continue;
      const vis = spec.vis();
      if (vis <= 0.002) {
        if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
        continue;
      }
      spec.world(tmp).project(camera);
      if (tmp.z > 1 || tmp.z < -1) {
        el.style.visibility = 'hidden';
        continue;
      }
      const x = (tmp.x * 0.5 + 0.5) * size.width;
      const y = (-tmp.y * 0.5 + 0.5) * size.height;
      el.style.visibility = 'visible';
      el.style.opacity = vis.toFixed(3);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  }, -1);

  return null;
}

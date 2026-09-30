import * as THREE from 'three';
import { PieceBuilder } from '../PieceBuilder';
import { Building, type BuildingKind } from '../components/buildings';
import { route, weldLog } from '../components/piping';
import { FINISH, v3 } from '../components/primitives';

/**
 * Conceptual facility types around the central system, connected by jacketed
 * piping. Kinds map to industries RC&E lists on rcenh3.com (claim `ind-core`).
 */
export interface NetworkSite {
  id: string;
  kind: BuildingKind;
  x: number;
  z: number;
  path: THREE.Vector3[];
}

const Yp = 0.9;
export const SITES: NetworkSite[] = [
  { id: 'net-cold', kind: 'coldStorage', x: -62, z: -40, path: [v3(-11.8, Yp, -1.6), v3(-44, Yp, -1.6), v3(-44, Yp, -23)] },
  { id: 'net-food', kind: 'food', x: 58, z: -42, path: [v3(11.8, Yp, -1.6), v3(50, Yp, -1.6), v3(50, Yp, -28)] },
  { id: 'net-bev', kind: 'beverage', x: -60, z: 46, path: [v3(-11.8, Yp, 1.6), v3(-52, Yp, 1.6), v3(-52, Yp, 35)] },
  { id: 'net-ice', kind: 'ice', x: 60, z: 46, path: [v3(11.8, Yp, 1.6), v3(52, Yp, 1.6), v3(52, Yp, 34)] },
  { id: 'net-petro', kind: 'petro', x: -4, z: -96, path: [v3(-2, Yp, -5.8), v3(-2, Yp, -88)] },
];

export function buildNetwork(mobile: boolean) {
  const sites = mobile ? SITES.filter((s) => s.kind !== 'ice' && s.kind !== 'petro') : SITES;
  const b = new PieceBuilder();
  const tops: Record<string, THREE.Vector3> = {};
  const n = sites.length;

  sites.forEach((site, i) => {
    const a0 = (i / n) * 0.8;
    // Two parallel jacketed lines — the thread that ties every facility to the system.
    for (const off of [-0.7, 0.7]) {
      const pts = site.path.map((p, k) => {
        const next = site.path[Math.min(k + 1, site.path.length - 1)];
        const prev = site.path[Math.max(k - 1, 0)];
        const d = next.clone().sub(prev).normalize();
        const side = new THREE.Vector3(-d.z, 0, d.x);
        return p.clone().add(side.multiplyScalar(off));
      });
      route(b, {
        points: pts,
        r: 0.34,
        insulation: 0.22,
        finish: FINISH.bareSteel,
        orderA: [a0, a0 + 0.14],
        orderB: [0, 0],
        explode: v3(0, 0, 0),
        spoolMax: 12,
        flowStart: off > 0 ? 0 : 3,
      });
    }
    const { top } = Building(b, site.kind, { orderA: a0 + 0.1, orderB: 0 }, site.x, site.z);
    tops[site.id] = top;
  });

  const { mesh, lines } = b.build();
  weldLog.length = 0;
  return { mesh, lines, tops, sites };
}

import { buildPlant } from '../3d/layouts/plantLayout';
import { setLowDetail } from '../3d/components/primitives';
import { device } from '../utils/device';

let plant: ReturnType<typeof buildPlant> | null = null;

/** The plant is built once, on first use, inside the lazily loaded 3D chunk. */
export function getPlant() {
  if (!plant) {
    setLowDetail(device.tier === 'low');
    plant = buildPlant();
  }
  return plant;
}

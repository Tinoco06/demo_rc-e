import { buildNetwork } from '../3d/layouts/networkLayout';
import { device } from '../utils/device';

let network: ReturnType<typeof buildNetwork> | null = null;

export function getNetwork() {
  if (!network) network = buildNetwork(device.mobile);
  return network;
}

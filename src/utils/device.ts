export type QualityTier = 'high' | 'low';

export interface DeviceProfile {
  mobile: boolean;
  reducedMotion: boolean;
  webgl: boolean;
  tier: QualityTier;
  maxDpr: number;
}

function hasWebGL2(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

export function detectDevice(): DeviceProfile {
  const mq = (q: string) => window.matchMedia?.(q).matches ?? false;
  const mobile = mq('(max-width: 820px)') || mq('(pointer: coarse) and (max-width: 1100px)');
  const reducedMotion = mq('(prefers-reduced-motion: reduce)');
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const tier: QualityTier = mobile || cores <= 4 || memory <= 4 ? 'low' : 'high';
  return {
    mobile,
    reducedMotion,
    webgl: hasWebGL2(),
    tier,
    maxDpr: mobile ? 1.5 : tier === 'high' ? 2 : 1.5,
  };
}

export const device: DeviceProfile =
  typeof window === 'undefined'
    ? { mobile: false, reducedMotion: false, webgl: false, tier: 'high', maxDpr: 1 }
    : detectDevice();

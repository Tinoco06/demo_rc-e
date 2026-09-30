export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Normalised position of v within [a, b], clamped to 0..1. */
export const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export const smoothstep = (t: number) => t * t * (3 - 2 * t);
export const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Smooth ramp: 0 before a, 1 after b, smootherstep in between. */
export const sramp = (v: number, a: number, b: number) => smootherstep(ramp(v, a, b));

/** A plateau: rises over [a, b], holds, falls over [c, d]. */
export const band = (v: number, a: number, b: number, c: number, d: number) =>
  sramp(v, a, b) * (1 - sramp(v, c, d));

/** Frame-rate independent exponential damping factor. */
export const damp = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt);

/**
 * Small shared stores between DOM and WebGL that are not scroll-driven.
 */

export type JacketId = 'aluminum' | 'stainless' | 'galvanized' | 'pvc' | 'coloredPvc';

export const JACKETS: { id: JacketId; label: string; color: string; metal: number; rough: number }[] = [
  { id: 'aluminum', label: 'Aluminum', color: '#c9d0d6', metal: 0.9, rough: 0.3 },
  { id: 'stainless', label: 'Stainless', color: '#dde2e6', metal: 0.95, rough: 0.16 },
  { id: 'galvanized', label: 'Galvanized steel', color: '#a1a9ae', metal: 0.8, rough: 0.5 },
  { id: 'pvc', label: 'PVC', color: '#eceeee', metal: 0.0, rough: 0.42 },
  { id: 'coloredPvc', label: 'Colored PVC', color: '#2b5a86', metal: 0.0, rough: 0.42 },
];

export const interaction = {
  jacket: 'aluminum' as JacketId,
};

/** DOM elements pinned to 3D anchors, keyed by anchor id. Written by the 3D projector. */
export const anchorEls = new Map<string, HTMLElement>();

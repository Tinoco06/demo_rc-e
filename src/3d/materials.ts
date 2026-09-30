import * as THREE from 'three';

/**
 * Shader injection for the merged "build" geometry produced by PieceBuilder.
 *
 * Per piece, on the GPU:
 *   – assembly (two independent build orders: hero intro + construction chapter)
 *   – arrival offset, slight scale, and an optional landing rotation
 *   – exploded-layer offset (engineering / BIM view)
 *   – continuous spin for running equipment (fans, couplings) gated per zone
 * Per fragment:
 *   – per-vertex metalness/roughness (one material for the whole plant)
 *   – conceptual flow bands along piping, zone highlights, weld heat, lamps
 */

export interface BuildUniforms {
  uBuildA: { value: number };
  uBuildB: { value: number };
  uWinA: { value: number };
  uWinB: { value: number };
  uExplode: { value: number };
  uAlpha: { value: number };
  uTime: { value: number };
  uFlow: { value: number };
  uFlowColor: { value: THREE.Color };
  uPower: { value: number };
  uRun: { value: number[] };
  uZoneW: { value: number[] };
  uHiColor: { value: THREE.Color };
  uWeldShow: { value: number };
}

export function createBuildUniforms(): BuildUniforms {
  return {
    uBuildA: { value: 1 },
    uBuildB: { value: 1 },
    uWinA: { value: 0.14 },
    uWinB: { value: 0.12 },
    uExplode: { value: 0 },
    uAlpha: { value: 1 },
    uTime: { value: 0 },
    uFlow: { value: 0 },
    uFlowColor: { value: new THREE.Color('#6fb6dc') },
    uPower: { value: 0 },
    uRun: { value: [0, 0, 0, 0, 0, 0, 0, 0] },
    uZoneW: { value: [0, 0, 0, 0, 0, 0, 0, 0] },
    uHiColor: { value: new THREE.Color('#bddae6') },
    uWeldShow: { value: 0 },
  };
}

const VERT_PARS = /* glsl */ `
attribute vec3 aPivot;
attribute vec2 aOrder;
attribute vec3 aArrive;
attribute vec3 aExplode;
uniform float uBuildA;
uniform float uBuildB;
uniform float uWinA;
uniform float uWinB;
uniform float uExplode;
varying float vPresence;
#ifdef BLD_FULL
attribute vec2 aMR;
attribute vec4 aSpin;
attribute vec4 aMisc;
uniform float uRun[8];
varying vec2 vMR;
varying float vZone;
varying float vFlags;
varying float vFlow;
varying float vTB;
#endif

float bldLocal(float build, float order, float win) {
  return clamp((build - order * (1.0 - win)) / win, 0.0, 1.0);
}
vec3 bldRot(vec3 v, vec3 k, float a) {
  float c = cos(a); float s = sin(a);
  return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c);
}
float bldT() {
  return min(bldLocal(uBuildA, aOrder.x, uWinA), bldLocal(uBuildB, aOrder.y, uWinB));
}
#ifdef BLD_FULL
float bldAngle(float e) {
  return aSpin.w * (1.0 - e) + aMisc.x * uRun[int(aMisc.y + 0.5)];
}
#endif
`;

const VERT_NORMAL = /* glsl */ `
#include <beginnormal_vertex>
#ifdef BLD_FULL
{
  float tN = bldT();
  float eN = 1.0 - pow(1.0 - tN, 3.0);
  if (dot(aSpin.xyz, aSpin.xyz) > 0.0) objectNormal = bldRot(objectNormal, aSpin.xyz, bldAngle(eN));
}
#endif
`;

const VERT_BEGIN = /* glsl */ `
#include <begin_vertex>
{
  float tP = bldT();
  float e = 1.0 - pow(1.0 - tP, 3.0);
  vPresence = smoothstep(0.0, 0.5, tP);
  vec3 lp = transformed - aPivot;
  #ifdef BLD_FULL
    if (dot(aSpin.xyz, aSpin.xyz) > 0.0) lp = bldRot(lp, aSpin.xyz, bldAngle(e));
    vMR = aMR;
    vZone = aMisc.y;
    vFlags = aMisc.z;
    vFlow = aMisc.w;
    vTB = bldLocal(uBuildB, aOrder.y, uWinB);
  #endif
  transformed = aPivot + lp * mix(0.78, 1.0, e) + aArrive * (1.0 - e) + aExplode * uExplode;
}
`;

const FRAG_PARS = /* glsl */ `
uniform float uAlpha;
varying float vPresence;
#ifdef BLD_FULL
uniform float uTime;
uniform float uFlow;
uniform vec3 uFlowColor;
uniform float uPower;
uniform float uZoneW[8];
uniform vec3 uHiColor;
uniform float uWeldShow;
varying vec2 vMR;
varying float vZone;
varying float vFlags;
varying float vFlow;
varying float vTB;
#endif
`;

const FRAG_ALPHA = /* glsl */ `
#include <color_fragment>
#ifdef BLD_FULL
{
  // Highlighted zones surface out of the ghosted model; welds show as a weld map.
  float aMul = max(uAlpha, clamp(uZoneW[int(vZone + 0.5)] * 2.2, 0.0, 1.0));
  if (vFlags > 0.5 && vFlags < 1.5) aMul = max(aMul, uWeldShow);
  diffuseColor.a *= vPresence * aMul;
}
if (vFlags > 1.5 && vFlags < 2.5) diffuseColor.rgb *= mix(0.22, 1.0, uPower);
#else
diffuseColor.a *= vPresence * uAlpha;
#endif
if (diffuseColor.a < 0.004) discard;
`;

const FRAG_EMISSIVE = /* glsl */ `
#include <emissivemap_fragment>
#ifdef BLD_FULL
if (vFlow >= 0.0) {
  float f = fract(vFlow * 0.16 - uTime * 0.5);
  float bandv = smoothstep(0.0, 0.08, f) * (1.0 - smoothstep(0.08, 0.42, f));
  totalEmissiveRadiance += uFlowColor * bandv * uFlow * 0.55;
}
totalEmissiveRadiance += uHiColor * uZoneW[int(vZone + 0.5)];
if (vFlags > 0.5 && vFlags < 1.5) {
  float g = sin(clamp(vTB, 0.0, 1.0) * 3.14159);
  totalEmissiveRadiance += vec3(1.0, 0.42, 0.1) * g * g * 2.4;
  totalEmissiveRadiance += vec3(1.0, 0.62, 0.3) * uWeldShow * 1.4;
}
if (vFlags > 1.5 && vFlags < 2.5) totalEmissiveRadiance += diffuseColor.rgb * uPower * 1.8;
if (vFlags > 2.5) totalEmissiveRadiance += vec3(0.42, 0.62, 0.72) * uPower * 0.7;
#endif
`;

function inject(shader: THREE.WebGLProgramParametersWithUniforms, full: boolean) {
  const define = full ? '#define BLD_FULL\n' : '';
  shader.vertexShader = define + VERT_PARS + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', VERT_BEGIN);
  if (full) shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', VERT_NORMAL);
  shader.fragmentShader = define + FRAG_PARS + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', FRAG_ALPHA);
  if (full) {
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = vMR.y;')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = vMR.x;')
      .replace('#include <emissivemap_fragment>', FRAG_EMISSIVE);
  }
}

/** The single physically-based material the whole plant renders with. */
export function createBuildMaterial(u: BuildUniforms): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({
    vertexColors: true,
    transparent: true,
    envMapIntensity: 1,
  });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    inject(shader, true);
  };
  m.customProgramCacheKey = () => 'bld-full';
  return m;
}

/** Blueprint line material. Uses its own uBuildB (lines stay present while the solids rebuild). */
export function createLineMaterial(
  u: BuildUniforms,
  color: THREE.ColorRepresentation = '#8fbcd4',
): { material: THREE.LineBasicMaterial; alpha: { value: number }; buildB: { value: number } } {
  const alpha = { value: 0 };
  const buildB = { value: 1 };
  const m = new THREE.LineBasicMaterial({ color, transparent: true, depthWrite: false });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, {
      uBuildA: u.uBuildA,
      uBuildB: buildB,
      uWinA: u.uWinA,
      uWinB: u.uWinB,
      uExplode: u.uExplode,
      uAlpha: alpha,
    });
    inject(shader, false);
  };
  m.customProgramCacheKey = () => 'bld-lines';
  return { material: m, alpha, buildB };
}

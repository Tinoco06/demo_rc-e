import { timeline } from './timeline';
import type { ChapterId } from '../data/chapters';
import { band, clamp, ramp, sramp } from '../utils/math';
import { ZONES } from '../3d/PieceBuilder';

/**
 * The choreography. Every visual parameter of the experience is derived here
 * from the damped scroll position, once per frame. Scenes only read `stage`.
 */

export const stage = {
  t: 0,
  s: 0,
  intro: 0,
  // plant
  buildA: 1,
  buildB: 1,
  explode: 0,
  alpha: 1,
  lineAlpha: 0,
  weldShow: 0,
  flow: 0,
  power: 0,
  run: new Array(8).fill(0) as number[],
  zoneW: new Array(8).fill(0) as number[],
  /** 0 = ice highlight, 1 = amber attention */
  attention: 0,
  // environment
  blueprint: 0,
  groundAlpha: 1,
  exposure: 1,
  // other scenes
  networkBuild: 0,
  networkAlpha: 0,
  networkFlow: 0,
  parts: 0,
  partsVisible: false,
  insulation: 0,
  insulationVisible: false,
  /** Mouse parallax amount */
  parallax: 1,
};

const L = (id: ChapterId, s: number) => timeline.local(id, s);

export function direct(time: number) {
  const s = timeline.s;
  const st = stage;
  st.t = time;
  st.s = s;
  st.intro = timeline.intro;

  const hero = L('hero', s);
  const eng = L('engineering', s);
  const con = L('construction', s);
  const net = L('network', s);
  const up = L('startup', s);
  const svc = L('service', s);
  const parts = L('parts', s);
  const safe = L('safety', s);
  const ins = L('insulation', s);
  const fin = L('final', s);
  void hero;

  const inConstruction = con > 0;

  // ── Assembly ──────────────────────────────────────────────────────────
  st.buildA = timeline.intro;
  st.buildB = inConstruction ? ramp(con, 0.04, 0.86) : 1;

  // ── Engineering: physical → technical model → exploded layers → plan ──
  const toBlueprint = sramp(eng, 0.04, 0.26);
  st.explode = sramp(eng, 0.3, 0.52) * (1 - sramp(eng, 0.66, 0.82));
  st.weldShow = band(eng, 0.8, 0.88, 0.97, 1.0) * (inConstruction ? 0 : 1);

  // ── Solid alpha across chapters ──────────────────────────────────────
  let alpha = inConstruction ? 1 : 1 - toBlueprint;
  alpha *= 1 - 0.84 * band(safe, 0.0, 0.1, 0.9, 1.0);
  alpha *= 1 - sramp(ins, 0.0, 0.12);
  if (fin > 0) alpha = sramp(fin, 0.0, 0.18);
  st.alpha = clamp(alpha);

  // ── Blueprint lines ──────────────────────────────────────────────────
  let lines = inConstruction ? 1 - sramp(con, 0.68, 0.9) : sramp(eng, 0.02, 0.22);
  lines = Math.max(lines, 0.7 * band(safe, 0.0, 0.1, 0.9, 1.0));
  if (ins > 0 && safe >= 1) lines *= 1 - sramp(ins, 0, 0.1);
  st.lineAlpha = clamp(lines);

  // ── Environment ──────────────────────────────────────────────────────
  const bp = inConstruction ? 1 - sramp(con, 0.0, 0.34) : toBlueprint;
  st.blueprint = clamp(Math.max(bp, 0.55 * band(safe, 0.0, 0.1, 0.9, 1.0)));
  st.groundAlpha = 1 - st.blueprint * 0.92;
  const dim = sramp(up, 0.0, 0.1) * (1 - sramp(up, 0.5, 0.88));
  st.exposure = 1 - 0.26 * dim;

  // ── Startup and running state (stays on once started) ────────────────
  const safetyCalm = 1 - 0.65 * band(safe, 0.0, 0.1, 0.9, 1.0);
  st.power = sramp(up, 0.14, 0.24);
  const run = st.run;
  run.fill(0);
  run[ZONES.compressors] = sramp(up, 0.28, 0.4) * safetyCalm;
  run[ZONES.pumps] = sramp(up, 0.34, 0.44) * safetyCalm;
  run[ZONES.condenser] = sramp(up, 0.42, 0.52) * safetyCalm;
  run[ZONES.evaporator] = sramp(up, 0.5, 0.6) * safetyCalm;
  st.flow = sramp(up, 0.56, 0.78) * (1 - 0.7 * band(safe, 0.0, 0.1, 0.9, 1.0));

  // ── Highlights ───────────────────────────────────────────────────────
  const z = st.zoneW;
  z.fill(0);
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.6);
  // Construction: pressure-test sweep along the piping (conceptual)
  z[ZONES.piping] += band(con, 0.86, 0.9, 0.96, 1.0) * 0.09;
  // Service: an attention moment on a compressor package, then resolved
  const attn = band(svc, 0.16, 0.24, 0.44, 0.52);
  const resolved = band(svc, 0.5, 0.56, 0.8, 0.9);
  z[ZONES.compressors] += attn * (0.07 + 0.09 * pulse) + resolved * 0.07;
  st.attention = attn > 0.01 ? 1 : 0;
  // Safety: precise, steady, one system area at a time
  if (safe > 0 && safe < 1) {
    const w = band(safe, 0.02, 0.08, 0.92, 1.0);
    const k = 0.34 * w;
    const s1 = band(safe, 0.06, 0.1, 0.24, 0.28);
    const s2 = band(safe, 0.26, 0.3, 0.44, 0.48);
    const s3 = band(safe, 0.46, 0.5, 0.64, 0.68);
    const s4 = band(safe, 0.66, 0.7, 0.82, 0.86);
    const s5 = band(safe, 0.84, 0.88, 0.96, 1.0);
    for (let i = 1; i < 8; i++) z[i] += k * (0.35 * s1 + 0.2 * s5);
    z[ZONES.compressors] += k * s2;
    z[ZONES.vessels] += k * (s2 + s3);
    z[ZONES.piping] += k * s3;
    z[ZONES.controls] += k * s4 * 1.4;
  }

  // ── Network ──────────────────────────────────────────────────────────
  const netIn = ramp(net, 0.1, 0.62);
  const netOut = 1 - sramp(up, 0.0, 0.12);
  st.networkBuild = fin > 0 ? 1 : netIn;
  st.networkAlpha = fin > 0 ? sramp(fin, 0.2, 0.6) : net > 0 ? netOut : 0;
  st.networkFlow = sramp(net, 0.5, 0.75) + (fin > 0 ? 1 : 0);

  // ── Parts & insulation study ─────────────────────────────────────────
  st.parts = parts;
  st.partsVisible = parts > 0 && parts < 1;
  st.insulation = ins;
  st.insulationVisible = ins > 0 && fin < 0.3;

  st.parallax = timeline.local('engineering', s) > 0 ? 0.35 : 1;
}

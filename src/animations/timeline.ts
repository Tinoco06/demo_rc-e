import { chapterRanges, totalLength, type ChapterId, rangeOf } from '../data/chapters';
import { clamp, damp } from '../utils/math';
import { device } from '../utils/device';

/**
 * One scroll timeline drives both the DOM copy and the WebGL scene.
 *
 * `raw` is the native scroll position in viewport heights; `s` is the damped
 * value everything animates from (gives physical inertia without scroll-jacking).
 */
const INTRO_SECONDS = 6.8;

type Listener = () => void;

interface StepEl {
  el: HTMLElement;
  chapter: ChapterId;
  from: number;
  to: number;
  state: string;
}

interface RevealEl {
  el: HTMLElement;
  chapter: ChapterId;
  from: number;
  to: number;
  last: number;
}

class Timeline {
  raw = 0;
  s = 0;
  velocity = 0;
  /** Hero assembly intro, time based 0..1. */
  intro = device.reducedMotion ? 1 : 0;
  /** Pointer in -1..1, damped. */
  mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  activeIndex = 0;

  private reveals = new Set<RevealEl>();
  private steps = new Set<StepEl>();
  private chapterEls = new Map<ChapterId, HTMLElement>();
  private progressEl: HTMLElement | null = null;
  private listeners = new Set<Listener>();
  private last = 0;
  private running = false;

  /** Local 0..1 progress within a chapter, from the damped position. */
  local(id: ChapterId, value = this.s): number {
    const r = rangeOf(id);
    return clamp((value - r.start) / r.length);
  }

  get total() {
    return totalLength;
  }

  start() {
    if (this.running) return;
    this.running = true;
    // Map the document's scroll range onto the narrative length. Using the real
    // scroll range (not vh) keeps mobile URL-bar resizes from shifting the story.
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      this.raw = max > 0 ? (window.scrollY / max) * totalLength : 0;
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      this.mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    if (!device.reducedMotion) window.addEventListener('pointermove', onPointer, { passive: true });
    onScroll();
    this.s = this.raw;
    this.last = performance.now();
    const loop = (now: number) => {
      this.tick(Math.min(0.1, (now - this.last) / 1000));
      this.last = now;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private tick(dt: number) {
    const prev = this.s;
    if (device.reducedMotion) this.s = this.raw;
    else this.s += (this.raw - this.s) * damp(5.5, dt);
    if (Math.abs(this.raw - this.s) < 1e-4) this.s = this.raw;
    this.velocity = (this.s - prev) / Math.max(dt, 1e-3);

    if (this.intro < 1) {
      const speed = this.raw > 0.04 ? 4 : 1;
      this.intro = Math.min(1, this.intro + (dt / INTRO_SECONDS) * speed);
    }

    const m = this.mouse;
    const k = damp(2.2, dt);
    m.x += (m.tx - m.x) * k;
    m.y += (m.ty - m.y) * k;

    let idx = 0;
    for (let i = 0; i < chapterRanges.length; i++) {
      if (this.s + 0.35 >= chapterRanges[i].start) idx = i;
    }
    if (idx !== this.activeIndex) {
      this.activeIndex = idx;
      this.listeners.forEach((l) => l());
    }

    this.updateDom();
  }

  private updateDom() {
    this.updateSteps();
    for (const [id, el] of this.chapterEls) {
      el.style.setProperty('--p', this.local(id).toFixed(4));
    }
    if (this.progressEl) {
      this.progressEl.style.transform = `scaleY(${clamp(this.s / totalLength).toFixed(4)})`;
    }
    const introGate = this.intro;
    for (const r of this.reveals) {
      const p = this.local(r.chapter);
      const span = Math.min(0.08, (r.to - r.from) / 3);
      // The first chapter's copy is present at the very top; the last chapter's stays at the bottom.
      const inV = r.chapter === 'hero' && r.from <= 0 ? 1 : clamp((p - r.from) / span);
      const outV = r.chapter === 'final' && r.to >= 1 ? 1 : clamp((r.to - p) / span);
      let vis = inV * outV;
      // Nothing in the hero appears until the assembly intro has had its moment.
      if (r.chapter === 'hero') vis *= clamp((introGate - 0.42) / 0.3);
      if (Math.abs(vis - r.last) < 0.002) continue;
      r.last = vis;
      const e = vis * vis * (3 - 2 * vis);
      r.el.style.opacity = e.toFixed(3);
      r.el.style.transform = `translate3d(0, ${((1 - e) * 18).toFixed(2)}px, 0)`;
      r.el.style.visibility = vis <= 0.001 ? 'hidden' : 'visible';
      r.el.style.pointerEvents = vis > 0.6 ? 'auto' : 'none';
    }
  }

  private updateSteps() {
    for (const st of this.steps) {
      const p = this.local(st.chapter);
      const state = p >= st.to ? 'done' : p >= st.from ? 'active' : 'todo';
      if (state !== st.state) {
        st.state = state;
        st.el.dataset.state = state;
      }
    }
  }

  registerStep(el: HTMLElement, chapter: ChapterId, from: number, to: number) {
    const st: StepEl = { el, chapter, from, to, state: '' };
    this.steps.add(st);
    return () => {
      this.steps.delete(st);
    };
  }

  registerReveal(el: HTMLElement, chapter: ChapterId, from: number, to: number) {
    const r: RevealEl = { el, chapter, from, to, last: -1 };
    this.reveals.add(r);
    return () => {
      this.reveals.delete(r);
    };
  }

  registerChapter(id: ChapterId, el: HTMLElement) {
    this.chapterEls.set(id, el);
    return () => {
      this.chapterEls.delete(id);
    };
  }

  registerProgress(el: HTMLElement | null) {
    this.progressEl = el;
  }

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  };

  getActive = () => this.activeIndex;

  scrollTo(id: ChapterId, offset = 0.02) {
    const r = rangeOf(id);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: ((r.start + r.length * offset) / totalLength) * max,
      behavior: device.reducedMotion ? 'auto' : 'smooth',
    });
  }
}

export const timeline = new Timeline();

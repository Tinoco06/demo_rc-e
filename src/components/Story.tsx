import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from 'react';
import { timeline } from '../animations/timeline';
import { anchorEls } from '../animations/interaction';
import { claimById, claims } from '../data/content';
import type { ChapterId } from '../data/chapters';

/** Immersive (scroll-choreographed) vs static (no-WebGL fallback) rendering. */
export const StoryMode = createContext<'immersive' | 'static'>('immersive');

const ChapterCtx = createContext<ChapterId>('hero');

interface ChapterProps {
  id: ChapterId;
  side: 'left' | 'right' | 'center';
  label: string;
  children: ReactNode;
}

export function Chapter({ id, side, label, children }: ChapterProps) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => (ref.current ? timeline.registerChapter(id, ref.current) : undefined), [id]);
  return (
    <ChapterCtx.Provider value={id}>
      <section ref={ref} id={`ch-${id}`} className={`chapter chapter--${side}`} aria-label={label} data-chapter={id}>
        {children}
      </section>
    </ChapterCtx.Provider>
  );
}

interface RevealProps {
  from: number;
  to: number;
  as?: 'div' | 'span';
  className?: string;
  children: ReactNode;
}

/** Shows its children while the chapter's local progress is inside [from, to]. */
export function Reveal({ from, to, as = 'div', className, children }: RevealProps) {
  const Tag = as as 'div';
  const chapter = useContext(ChapterCtx);
  const mode = useContext(StoryMode);
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (mode !== 'immersive' || !ref.current) return;
    const el = ref.current;
    el.style.opacity = '0';
    el.style.visibility = 'hidden';
    return timeline.registerReveal(el, chapter, from, to);
  }, [chapter, from, to, mode]);
  return (
    <Tag ref={ref} className={`reveal ${className ?? ''}`}>
      {children}
    </Tag>
  );
}

interface StepProps {
  from: number;
  to: number;
  label: string;
  children?: ReactNode;
}

/** A progress step whose data-state follows the scroll (todo · active · done). */
export function Step({ from, to, label, children }: StepProps) {
  const chapter = useContext(ChapterCtx);
  const mode = useContext(StoryMode);
  const ref = useRef<HTMLLIElement>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    if (mode !== 'immersive') {
      ref.current.dataset.state = 'active';
      return;
    }
    return timeline.registerStep(ref.current, chapter, from, to);
  }, [chapter, from, to, mode]);
  return (
    <li ref={ref} className="step" data-state="todo">
      <span className="step__label">{label}</span>
      {children && <span className="step__detail">{children}</span>}
    </li>
  );
}

/** A factual statement traceable to a claim in data/content.ts. */
export function Fact({ id, children }: { id: string; children: ReactNode }) {
  const claim = claimById.get(id);
  if (!claim && import.meta.env.DEV) console.warn(`Unknown claim id: ${id}`);
  const n = claims.findIndex((c) => c.id === id) + 1;
  return (
    <span className="fact" data-claim={id} title={claim ? `Source: ${claim.sourceUrl}` : undefined}>
      {children}
      {/* A <sup>, not a link: facts also appear inside CTAs and links. Clicks are delegated in App. */}
      <sup className="fact__ref" data-open-sources={id} title={`Source ${n}`}>
        {n}
      </sup>
    </span>
  );
}

/** A DOM label pinned to a 3D point (positioned by the WebGL AnchorProjector). */
export function Anchor({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  const mode = useContext(StoryMode);
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || mode !== 'immersive') return;
    el.style.visibility = 'hidden';
    anchorEls.set(id, el);
    return () => {
      anchorEls.delete(id);
    };
  }, [id, mode]);
  if (mode !== 'immersive') return null;
  return (
    <div ref={ref} className={`anchor ${className ?? ''}`} aria-hidden="true">
      {children}
    </div>
  );
}

export function Index({ n, label }: { n: string; label: string }) {
  return (
    <p className="index">
      <span className="index__n">{n}</span>
      <span className="index__rule" />
      <span>{label}</span>
    </p>
  );
}

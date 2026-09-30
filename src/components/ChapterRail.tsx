import { useSyncExternalStore } from 'react';
import { timeline } from '../animations/timeline';
import { chapters } from '../data/chapters';

/** Chapter index on the right edge (desktop) — also a thin progress bar on mobile. */
export function ChapterRail() {
  const active = useSyncExternalStore(timeline.subscribe, timeline.getActive, () => 0);
  return (
    <nav className="rail" aria-label="Chapters">
      <div className="rail__track" aria-hidden="true">
        <div className="rail__fill" ref={(el) => timeline.registerProgress(el)} />
      </div>
      <ol>
        {chapters.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              className="rail__item"
              data-active={i === active}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => timeline.scrollTo(c.id, c.id === 'hero' ? 0 : 0.12)}
            >
              <span className="rail__n">{c.index}</span>
              <span className="rail__label">{c.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

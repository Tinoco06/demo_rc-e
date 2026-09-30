import { useEffect, useRef } from 'react';
import { claims, creativeCopy, notUsed, type SectionKey } from '../data/content';

const SECTION_LABEL: Record<SectionKey, string> = {
  company: 'Company',
  engineering: 'Engineering & Design',
  construction: 'Construction',
  service: 'Service',
  parts: 'Parts',
  safety: 'Safety & Compliance',
  insulation: 'Insulation',
  industries: 'Industries',
  portfolio: 'Portfolio',
  contact: 'Contact',
};

interface Props {
  open: boolean;
  focusId: string | null;
  markers: boolean;
  onMarkers: (v: boolean) => void;
  onClose: () => void;
}

/**
 * Every factual line in the story, its source wording and URL — plus the creative
 * copy (not claims) and what was deliberately left out.
 */
export function SourcesPanel({ open, focusId, markers, onMarkers, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    if (focusId) {
      const el = document.getElementById(`src-${focusId}`);
      el?.scrollIntoView({ block: 'center' });
      el?.classList.add('is-focus');
      setTimeout(() => el?.classList.remove('is-focus'), 1800);
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, focusId, onClose]);

  const groups = Object.keys(SECTION_LABEL)
    .map((k) => ({ key: k as SectionKey, items: claims.filter((c) => c.section === k) }))
    .filter((g) => g.items.length);

  return (
    <div className="sources" data-open={open} aria-hidden={!open}>
      <div className="sources__backdrop" onClick={onClose} />
      <div ref={ref} className="sources__panel" role="dialog" aria-modal="true" aria-labelledby="sources-title">
        <div className="sources__head">
          <div>
            <p className="mono">Source of truth</p>
            <h2 id="sources-title">Where every claim comes from</h2>
          </div>
          <button ref={closeRef} type="button" className="hdr-link" onClick={onClose}>
            Close
          </button>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={markers} onChange={(e) => onMarkers(e.target.checked)} />
          <span>Show source markers in the story</span>
        </label>
        <p className="sources__intro">
          Research verified on 30 September 2026 against <a href="https://rcenh3.com/" target="_blank" rel="noreferrer">rcenh3.com</a>{' '}
          and RC&amp;E’s LinkedIn page. The 3D system, facility types, startup sequence and flow animation are conceptual
          visualizations of RC&amp;E’s published capabilities — not depictions of actual RC&amp;E projects or client facilities.
        </p>

        {groups.map((g) => (
          <section key={g.key} className="sources__group">
            <h3>{SECTION_LABEL[g.key]}</h3>
            <ol>
              {g.items.map((c) => (
                <li key={c.id} id={`src-${c.id}`} className="claim">
                  <span className="claim__n mono">{claims.indexOf(c) + 1}</span>
                  <div>
                    <p className="claim__text">{c.claim}</p>
                    <p className="claim__source">{c.source}</p>
                    <p className="claim__meta mono">
                      <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                        {c.sourceUrl.replace('https://', '')}
                      </a>
                      <span data-confidence={c.confidence}>{c.confidence}</span>
                    </p>
                    {c.note && <p className="claim__note">{c.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <section className="sources__group">
          <h3>Creative copy — not company claims</h3>
          <ul className="plain">
            {creativeCopy.map((c) => (
              <li key={c.text}>
                <span>“{c.text}”</span> <span className="claim__note">{c.where}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="sources__group">
          <h3>Researched, deliberately not used</h3>
          <ul className="plain">
            {notUsed.map((n) => (
              <li key={n.item}>
                <p className="claim__text">{n.item}</p>
                <p className="claim__note">{n.reason}</p>
              </li>
            ))}
          </ul>
        </section>
        <p className="sources__foot">Concept demo prepared by Yojoa Labs for RC&amp;E. Not the official RC&amp;E website.</p>
      </div>
    </div>
  );
}

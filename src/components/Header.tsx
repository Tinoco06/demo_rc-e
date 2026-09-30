import { timeline } from '../animations/timeline';
import { contact } from '../data/content';

export function Header({ onSources }: { onSources: () => void }) {
  return (
    <header className="site-header">
      <a
        className="wordmark"
        href="#ch-hero"
        onClick={(e) => {
          e.preventDefault();
          timeline.scrollTo('hero', 0);
        }}
      >
        <span className="wordmark__mark">RC&amp;E</span>
        <span className="wordmark__sub">Refrigeration Construction &amp; Engineering</span>
      </a>
      <span className="concept-pill" title="Concept demo — not the official RC&E website">
        Concept
      </span>
      <nav className="site-header__nav" aria-label="Utility">
        <button type="button" className="hdr-link" onClick={onSources}>
          Sources
        </button>
        <a className="btn btn--small" href={contact.contactUrl} target="_blank" rel="noreferrer">
          Start a Project
        </a>
      </nav>
    </header>
  );
}

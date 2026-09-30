import { Anchor, Chapter, Fact, Index, Reveal } from '../components/Story';

/** Static on purpose: nothing in the scene changes per service, so scroll shouldn't step through them. */
const SERVICES = ['Startup', 'Preventive maintenance', 'Emergency service', 'Operations', 'Repairs', 'Retrofits'];
import { contact } from '../data/content';

export function Service() {
  return (
    <Chapter id="service" side="left" label="Service">
      <Reveal from={0.03} to={0.38} className="copy copy--big">
        <p className="huge" aria-label="24 hours a day, 7 days a week">
          24<span className="huge__slash">/</span>7
        </p>
        <p>
          <Fact id="svc-247">Service by a trained technician — 24 hours a day, 7 days a week.</Fact>
        </p>
      </Reveal>

      <Reveal from={0.38} to={0.97} className="copy">
        <Index n="05" label="Service" />
        <h2>Installation isn’t the finish line.</h2>
        <p>
          <Fact id="svc-not-over">RC&amp;E believes the job is not over when the installation is complete.</Fact>
        </p>
        <ul className="pills">
          {SERVICES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="small">
          <Fact id="svc-list">Preventative maintenance, emergency service, operations, repairs and retrofits for all systems.</Fact>{' '}
          <Fact id="svc-crosstrained">Technicians are cross-trained in most types of industrial refrigeration systems and equipment.</Fact>
        </p>
        <a className="link-line" href={contact.serviceHref}>
          <span className="mono">Service line</span>
          <Fact id="svc-phone">{contact.service}</Fact>
        </a>
      </Reveal>

      <Anchor id="svc-reticle" className="anchor--reticle">
        <span className="reticle" />
        <span className="reticle__label mono">Service · technician on call</span>
      </Anchor>
    </Chapter>
  );
}

import { Chapter, Fact, Reveal } from '../components/Story';
import { contact } from '../data/content';

export function Final() {
  return (
    <Chapter id="final" side="center" label="One system, one partner">
      <Reveal from={0.28} to={1} className="copy copy--final">
        <p className="disciplines disciplines--all">
          <span>Engineering</span>
          <span>Construction</span>
          <span>Service</span>
          <span>Parts</span>
          <span>Safety &amp; Compliance</span>
          <span>Insulation</span>
        </p>
        <h2 className="display display--final">
          One system.
          <span className="display__soft">One partner.</span>
        </h2>
        <p className="wordmark-lg">RC&amp;E</p>
        <p className="tagline">
          <Fact id="co-tagline">Industrial Refrigeration that’s Sustainable by Design</Fact>
        </p>
        <div className="cta-row">
          <a className="btn btn--primary" href={contact.contactUrl} target="_blank" rel="noreferrer">
            Start a Project
            <span aria-hidden="true">→</span>
          </a>
          <a className="btn btn--ghost" href={contact.officeHref}>
            <span className="mono">Office</span>
            <Fact id="ct-office">{contact.office}</Fact>
          </a>
          <a className="btn btn--ghost" href={contact.serviceHref}>
            <span className="mono">24/7 Service</span>
            <Fact id="svc-phone">{contact.service}</Fact>
          </a>
        </div>
        <p className="meta meta--center">
          <Fact id="co-founded">Since 1997</Fact>
          <span aria-hidden="true">·</span>
          <Fact id="co-projects">Hundreds of completed projects</Fact>
          <span aria-hidden="true">·</span>
          <Fact id="co-kelvin">A Kelvin Group company</Fact>
          <span aria-hidden="true">·</span>
          <Fact id="co-hq">{contact.address}</Fact>
        </p>
      </Reveal>
    </Chapter>
  );
}

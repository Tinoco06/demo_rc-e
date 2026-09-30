import { Chapter, Fact, Reveal } from '../components/Story';

export function Hero() {
  return (
    <Chapter id="hero" side="left" label="Industrial refrigeration, engineered from the ground up">
      <Reveal from={0} to={0.62} className="copy copy--hero">
        <p className="eyebrow">Refrigeration Construction &amp; Engineering</p>
        <h1 className="display">
          Industrial Refrigeration.
          <span className="display__soft">Engineered from the ground up.</span>
        </h1>
        <p className="disciplines">
          <span>Engineering</span>
          <span>Construction</span>
          <span>Service</span>
        </p>
        <p className="meta">
          <Fact id="co-founded">Since 1997</Fact>
          <span aria-hidden="true">·</span>
          <Fact id="co-hq">Fort Worth, Texas</Fact>
          <span aria-hidden="true">·</span>
          <Fact id="co-kelvin">A Kelvin Group company</Fact>
        </p>
      </Reveal>
      <Reveal from={0} to={0.3} className="scroll-cue">
        <span className="scroll-cue__line" />
        <span>Scroll to walk the system</span>
      </Reveal>
    </Chapter>
  );
}

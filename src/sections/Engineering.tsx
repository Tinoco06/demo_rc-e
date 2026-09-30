import { Anchor, Chapter, Fact, Index, Reveal } from '../components/Story';

export function Engineering() {
  return (
    <Chapter id="engineering" side="left" label="Engineering and design">
      <Reveal from={0.04} to={0.34} className="copy">
        <Index n="01" label="Engineering & Design" />
        <h2>Designed around your&nbsp;process.</h2>
        <p>
          <Fact id="eng-specific">
            We design systems to meet your specific needs — within your budget, alongside your general contractor or
            design group.
          </Fact>
        </p>
        <p className="transform-tag">
          <span>Physical system</span>
          <span className="transform-tag__arrow" aria-hidden="true">→</span>
          <span>Technical model</span>
        </p>
      </Reveal>

      <Reveal from={0.34} to={0.68} className="copy">
        <Index n="01" label="Model in layers" />
        <h3>Every layer resolved before the first weld.</h3>
        <ul className="facts">
          <li><Fact id="eng-revit">3-D design for Building Information Management systems, utilizing REVIT.</Fact></li>
          <li><Fact id="eng-drafting">Design and drafting that integrates with the largest companies’ systems.</Fact></li>
          <li><Fact id="eng-disciplines">Electrical, steam, process water, heating, cooling and industrial ventilation engineering.</Fact></li>
        </ul>
      </Reveal>

      <Reveal from={0.7} to={1} className="copy">
        <Index n="01" label="System layout" />
        <h3>Mapped down to the weld.</h3>
        <ul className="facts">
          <li><Fact id="eng-asme-3d">Every ASME code weld on your project can be mapped in 3-D.</Fact></li>
          <li><Fact id="eng-energy">Energy analysis for efficiency ideas — to help determine payback.</Fact></li>
          <li><Fact id="eng-equipment">Blast cells, spiral freezers, IQF and chill tunnels, contact freezers, scraped surface heat exchangers.</Fact></li>
        </ul>
      </Reveal>

      <Anchor id="layer-piping" className="anchor--layer"><span>Piping</span></Anchor>
      <Anchor id="layer-equipment" className="anchor--layer"><span>Equipment</span></Anchor>
      <Anchor id="layer-structure" className="anchor--layer"><span>Structure</span></Anchor>
      <Anchor id="layer-layout" className="anchor--layer"><span>System layout</span></Anchor>
    </Chapter>
  );
}

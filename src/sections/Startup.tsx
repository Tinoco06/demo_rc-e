import { Anchor, Chapter, Fact, Index, Reveal, Step } from '../components/Story';

export function Startup() {
  return (
    <Chapter id="startup" side="right" label="System startup">
      <Reveal from={0.04} to={0.97} className="copy">
        <Index n="04" label="Startup" />
        <h2>A system engineered to operate.</h2>
        <p>
          <Fact id="svc-startups">
            RC&amp;E service technicians are proficient in compressor and central system controls — and perform RC&amp;E’s own
            start-ups.
          </Fact>
        </p>
        <div className="status">
          <div className="status__head">
            <span className="mono">System status</span>
            <span className="status__word">
              <Reveal from={0} to={0.84} as="span" className="status__standby">
                Standby
              </Reveal>
              <Reveal from={0.84} to={1.01} as="span" className="status__online">
                Online
              </Reveal>
            </span>
          </div>
          <ol className="steps steps--compact">
            <Step from={0.14} to={0.28} label="Controls" />
            <Step from={0.28} to={0.42} label="Compressors" />
            <Step from={0.34} to={0.46} label="Pumps" />
            <Step from={0.42} to={0.54} label="Condensers" />
            <Step from={0.5} to={0.62} label="Evaporators" />
            <Step from={0.56} to={0.86} label="Piping active" />
          </ol>
          <p className="note">Conceptual startup sequence for illustration.</p>
        </div>
      </Reveal>

      <Anchor id="up-controls" className="anchor--tag">
        <span>Controls</span>
      </Anchor>
      <Anchor id="up-compressors" className="anchor--tag">
        <span>Compressors</span>
      </Anchor>
      <Anchor id="up-condenser" className="anchor--tag">
        <span>Condensers</span>
      </Anchor>
      <Anchor id="up-evaporator" className="anchor--tag">
        <span>Evaporators</span>
      </Anchor>
      <Anchor id="up-piping" className="anchor--tag">
        <span>Piping active</span>
      </Anchor>
    </Chapter>
  );
}

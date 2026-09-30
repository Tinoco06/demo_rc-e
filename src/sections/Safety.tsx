import { Anchor, Chapter, Fact, Index, Reveal, Step } from '../components/Story';

export function Safety() {
  return (
    <Chapter id="safety" side="left" label="Safety and compliance">
      <Reveal from={0.03} to={0.97} className="copy">
        <Index n="07" label="Safety & Compliance" />
        <h2>Precision is a safety practice.</h2>
        <p>
          <Fact id="safe-contractor">
            A full-service PSM/RMP contractor for ammonia refrigeration facilities throughout the United States.
          </Fact>
        </p>
        <ol className="steps">
          <Step from={0.06} to={0.26} label="PSM / RMP">
            <Fact id="safe-osha-epa">A full PSM/RMP program covering both OSHA and EPA requirements.</Fact>
          </Step>
          <Step from={0.26} to={0.46} label="Process Hazard Analysis">
            <Fact id="safe-pha">Initial and revalidation PHA, and RMP hazard assessment.</Fact>
          </Step>
          <Step from={0.46} to={0.66} label="Mechanical Integrity">
            <Fact id="safe-audits">PSM/RMP audits, compliance audits and mechanical integrity audits.</Fact>
          </Step>
          <Step from={0.66} to={0.84} label="SOP">
            <Fact id="safe-sop">SOP development, review and training — plus P&amp;ID corrections.</Fact>
          </Step>
          <Step from={0.84} to={1.01} label="Training">
            <Fact id="safe-seminar">Four-day PSM training seminars.</Fact>{' '}
            <Fact id="safe-people">
              Ammonia awareness for every employee; confined space and site incident command for foremen and service
              technicians.
            </Fact>
          </Step>
        </ol>
      </Reveal>
      <Anchor id="safe-pha" className="anchor--callout">
        <span className="mono">PHA</span>
        <span>Process hazard analysis</span>
      </Anchor>
      <Anchor id="safe-mi" className="anchor--callout">
        <span className="mono">MI</span>
        <span>Mechanical integrity</span>
      </Anchor>
      <Anchor id="safe-sop" className="anchor--callout">
        <span className="mono">SOP</span>
        <span>Operating procedures</span>
      </Anchor>
    </Chapter>
  );
}

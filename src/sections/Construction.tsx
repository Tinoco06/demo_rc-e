import { Chapter, Fact, Index, Reveal, Step } from '../components/Story';

export function Construction() {
  return (
    <Chapter id="construction" side="right" label="Construction">
      <Reveal from={0.02} to={0.985} className="copy">
        <Index n="02" label="Construction" />
        <h2>This is how the system comes together.</h2>
        <p>
          <Fact id="con-as-engineered">Installed as engineered — on time, with quality craftsmanship and safely.</Fact>
        </p>
        <ol className="steps">
          <Step from={0.04} to={0.2} label="Structure">
            <Fact id="con-supervision">Field supervised by a very experienced foreman or superintendent.</Fact>
          </Step>
          <Step from={0.2} to={0.42} label="Equipment">
            <Fact id="co-departments">Construction and engineering — plus service, insulation, parts and process safety departments.</Fact>
          </Step>
          <Step from={0.42} to={0.62} label="Piping">
            <Fact id="con-materials">Copper, black steel, stainless, HE-PEX or PVC — joined by code-compliant methods.</Fact>
          </Step>
          <Step from={0.62} to={0.8} label="Welding">
            <Fact id="con-asme-welders">ASME code welders, tested to RC&amp;E’s ASME code specifications.</Fact>
          </Step>
          <Step from={0.8} to={0.9} label="Insulation">
            <Fact id="ins-crews">Crews that do nothing but insulate pipe and equipment.</Fact>
          </Step>
          <Step from={0.9} to={1.01} label="Testing">
            <Fact id="con-testing">Tested per the ASME and local codes after installation.</Fact>
          </Step>
        </ol>
        <p className="small">
          <Fact id="con-field-training">Field personnel current on HAZMAT and OSHA training, certified on the equipment they operate.</Fact>
        </p>
      </Reveal>
    </Chapter>
  );
}

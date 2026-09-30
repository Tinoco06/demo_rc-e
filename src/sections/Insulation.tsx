import { useState } from 'react';
import { Anchor, Chapter, Fact, Index, Reveal, Step } from '../components/Story';
import { JACKETS, interaction, type JacketId } from '../animations/interaction';

export function Insulation() {
  const [jacket, setJacket] = useState<JacketId>(interaction.jacket);
  const choose = (id: JacketId) => {
    interaction.jacket = id;
    setJacket(id);
  };
  return (
    <Chapter id="insulation" side="right" label="Insulation">
      <Reveal from={0.03} to={0.985} className="copy">
        <Index n="08" label="Insulation" />
        <h2>The layer that protects everything else.</h2>
        <p>
          <Fact id="ins-important">Insulation is one of the most important components of the refrigeration system</Fact> —{' '}
          <Fact id="ins-crews">applied by crews that do nothing but insulate pipe and equipment.</Fact>
        </p>
        <ol className="steps steps--compact">
          <Step from={0.04} to={0.22} label="Pipe" />
          <Step from={0.22} to={0.46} label="Insulation" />
          <Step from={0.46} to={0.64} label="Vapor barrier" />
          <Step from={0.64} to={0.84} label="Protective jacket" />
          <Step from={0.84} to={1.01} label="Finished system" />
        </ol>
        <p className="small">
          <Fact id="ins-materials">In most cases: Dow extruded polystyrene with a Saran vapor barrier.</Fact>
        </p>

        <Reveal from={0.82} to={0.985} className="chooser-wrap">
          <p className="mono chooser__title">
            <Fact id="ins-jacket">Protective jacket — at the customer’s discretion</Fact>
          </p>
          <div className="chooser" role="radiogroup" aria-label="Protective jacket material">
            {JACKETS.map((j) => (
              <button
                key={j.id}
                type="button"
                role="radio"
                aria-checked={jacket === j.id}
                className="chip"
                onClick={() => choose(j.id)}
              >
                <span className="chip__swatch" style={{ background: j.color }} />
                {j.label}
              </button>
            ))}
          </div>
          <p className="note">
            <Fact id="ins-thickness">Typically at a greater thickness than generally required.</Fact>
          </p>
        </Reveal>
      </Reveal>

      <Anchor id="ins-pipe" className="anchor--tag anchor--below">
        <span>Pipe</span>
      </Anchor>
      <Anchor id="ins-xps" className="anchor--tag anchor--below">
        <span>Extruded polystyrene</span>
      </Anchor>
      <Anchor id="ins-barrier" className="anchor--tag">
        <span>Vapor barrier</span>
      </Anchor>
      <Anchor id="ins-jacket" className="anchor--tag">
        <span>Protective jacket</span>
      </Anchor>
    </Chapter>
  );
}

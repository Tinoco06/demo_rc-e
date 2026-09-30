import { Anchor, Chapter, Fact, Index, Reveal } from '../components/Story';

/** Mirrors PART_LABELS in scenes/PartsLibrary (kept here so the copy chunk has no three.js import). */
const LABELS = [
  'Compressor packages',
  'Condensers',
  'Evaporators',
  'Heat exchangers',
  'Pumps',
  'Valves',
  'Fittings',
  'Piping components',
];

export function Parts() {
  return (
    <Chapter id="parts" side="center" label="Parts">
      <Reveal from={0.02} to={0.96} className="copy copy--top">
        <Index n="06" label="Parts" />
        <h2>The right component keeps the system moving.</h2>
        <p>
          <Fact id="parts-oem">Genuine OEM refrigeration system parts and service</Fact> —{' '}
          <Fact id="parts-manufacturers">parts for all the major manufacturers, from people with construction and service experience.</Fact>
        </p>
      </Reveal>
      <Reveal from={0.5} to={0.96} className="copy copy--bottom">
        <ul className="facts facts--row">
          <li>
            <Fact id="parts-aftermarket">Aftermarket parts, compressor seals, filters and lubricating oils</Fact>
          </li>
          <li>
            <Fact id="parts-rebuild">Compressor &amp; pump vibration testing and rebuilding</Fact>
          </li>
          <li>
            <Fact id="parts-bulk">Scheduled bulk ammonia and CO2 deliveries</Fact>
          </li>
          <li>
            <Fact id="parts-247">Parts department 24/7</Fact>
          </li>
        </ul>
      </Reveal>
      {LABELS.map((l, i) => (
        <Anchor key={l} id={`part-${i}`} className="anchor--part">
          <span className="mono">{String(i + 1).padStart(2, '0')}</span>
          <span>{l}</span>
        </Anchor>
      ))}
    </Chapter>
  );
}

import { Anchor, Chapter, Fact, Index, Reveal } from '../components/Story';

const SITES: [string, string][] = [
  ['net-cold', 'Cold storage'],
  ['net-food', 'Food processing'],
  ['net-bev', 'Beverage'],
  ['net-ice', 'Ice plants & rinks'],
  ['net-petro', 'Petrochemical'],
];

export function Network() {
  return (
    <Chapter id="network" side="left" label="Industries served">
      <Reveal from={0.06} to={0.95} className="copy">
        <Index n="03" label="Industries" />
        <h2>One discipline. Many industries.</h2>
        <p>
          <Fact id="ind-core">Food plants, cold storage, beverage plants, petrochemical, ice plants and ice rinks.</Fact>
        </p>
        <p className="small">
          <Fact id="eng-food-focus">Refrigeration design for all industries — with a focus on industrial refrigeration for the food industry:</Fact>
        </p>
        <ul className="tags">
          <li>Refrigerated public storage</li>
          <li>Grocery &amp; foodservice distribution</li>
          <li>Fruit &amp; vegetable</li>
          <li>Milk, butter &amp; cheese</li>
          <li>Poultry</li>
          <li>Meat cutting</li>
          <li>Prepared foods</li>
        </ul>
        <p className="note">
          <Fact id="ind-food">Industry list per RC&amp;E’s engineering page.</Fact> Facilities shown are conceptual types — not client sites.
        </p>
      </Reveal>
      {SITES.map(([id, label]) => (
        <Anchor key={id} id={id} className="anchor--site">
          <span>{label}</span>
        </Anchor>
      ))}
    </Chapter>
  );
}

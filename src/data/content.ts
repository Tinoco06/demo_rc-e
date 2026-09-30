/**
 * RC&E — factual source of truth for the demo.
 *
 * Every factual sentence rendered in the UI references a claim `id` from this file
 * (via <Fact id="…">). Creative / conceptual lines live in `creativeCopy` and are
 * never presented as company claims.
 *
 * Research pass: 2026-09-30, against the live site https://rcenh3.com/ and its
 * internal pages, plus RC&E's LinkedIn company page. Where this file and the
 * research brief disagree, the live official page wins.
 */

export type Confidence = 'high' | 'medium' | 'low';

export type SectionKey =
  | 'company'
  | 'engineering'
  | 'construction'
  | 'service'
  | 'parts'
  | 'safety'
  | 'insulation'
  | 'industries'
  | 'portfolio'
  | 'contact';

export interface Claim {
  id: string;
  section: SectionKey;
  /** The claim as used in the demo (paraphrase kept faithful to the source). */
  claim: string;
  /** Verbatim / near-verbatim wording on the source page. */
  source: string;
  sourceUrl: string;
  confidence: Confidence;
  note?: string;
}

const HOME = 'https://rcenh3.com/';
const ABOUT = 'https://rcenh3.com/about/';
const ENG = 'https://rcenh3.com/engineering/';
const CON = 'https://rcenh3.com/construction/';
const SVC = 'https://rcenh3.com/service/';
const PARTS = 'https://rcenh3.com/parts/';
const SAFE = 'https://rcenh3.com/safety-compliance/';
const CONTACT = 'https://rcenh3.com/contact/';
const LINKEDIN = 'https://www.linkedin.com/company/rceinc';

export const claims: Claim[] = [
  // ─── Company ──────────────────────────────────────────────────────────
  {
    id: 'co-founded',
    section: 'company',
    claim: 'Founded in 1997.',
    source: '“The company was founded in 1997 by three individuals who envisioned the need to provide a higher level of customer satisfaction within the industry.”',
    sourceUrl: ABOUT,
    confidence: 'high',
  },
  {
    id: 'co-projects',
    section: 'company',
    claim: 'Hundreds of completed projects.',
    source: '“Currently, RC&E has over 60 employees and has successfully completed hundreds of projects.”',
    sourceUrl: ABOUT,
    confidence: 'high',
    note: 'Headcount intentionally not displayed (LinkedIn size band differs; not needed for the story).',
  },
  {
    id: 'co-kelvin',
    section: 'company',
    claim: 'A Kelvin Group company.',
    source: '“RC&E is part of Kelvin Group, the premier national refrigeration platform…” — logo lockup: “a Kelvin group company”.',
    sourceUrl: ABOUT,
    confidence: 'high',
  },
  {
    id: 'co-tagline',
    section: 'company',
    claim: 'Industrial Refrigeration that’s Sustainable by Design.',
    source: 'Site tagline: “Industrial Refrigeration that’s Sustainable by Design”.',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'co-departments',
    section: 'company',
    claim: 'Construction and engineering, plus service, insulation, parts and process safety & risk management departments.',
    source: '“We still offer the same refrigeration construction and engineering services and have added a service department, insulation department, parts department and process safety and risk management department.”',
    sourceUrl: ABOUT,
    confidence: 'high',
  },
  {
    id: 'co-hq',
    section: 'company',
    claim: 'Fort Worth, Texas.',
    source: '“1350 Forum Way S, Fort Worth, TX 76140”',
    sourceUrl: CONTACT,
    confidence: 'high',
  },
  {
    id: 'co-lifecycle',
    section: 'company',
    claim: 'A total refrigeration solution — from project inception through operation — for food & beverage processing and cold storage.',
    source: 'LinkedIn overview: “RC&E is a provider of Refrigeration Engineering and Construction Services to the food and beverage processing and cold storage industry… a total refrigeration solution”.',
    sourceUrl: LINKEDIN,
    confidence: 'medium',
    note: 'LinkedIn copy; consistent with the official site but not on rcenh3.com itself.',
  },

  // ─── Engineering & Design ─────────────────────────────────────────────
  {
    id: 'eng-specific',
    section: 'engineering',
    claim: 'Systems designed to meet your specific needs, within your budget — working with your general contractor or design group.',
    source: '“We design systems to meet your specific needs. We will work with a general contractor or design group to give you a system with-in your budget that meets your specific requirements.”',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'eng-food-focus',
    section: 'engineering',
    claim: 'Refrigeration design for all industries, with a focus on industrial refrigeration for the food industry.',
    source: '“We offer refrigeration design for all industries.” / “We focus on industrial refrigeration for the food industry.”',
    sourceUrl: ENG,
    confidence: 'high',
  },
  {
    id: 'eng-revit',
    section: 'engineering',
    claim: '3-D design for Building Information Management systems, utilizing REVIT.',
    source: '“We offer 3-D design for Building Information Management systems utilizing REVIT.”',
    sourceUrl: ENG,
    confidence: 'high',
  },
  {
    id: 'eng-asme-3d',
    section: 'engineering',
    claim: 'Every ASME code weld on a project can be mapped in 3-D.',
    source: '“…map every ASME code weld on your project in 3-D if needed.”',
    sourceUrl: ENG,
    confidence: 'high',
  },
  {
    id: 'eng-drafting',
    section: 'engineering',
    claim: 'Design and drafting that integrates with the largest companies’ systems.',
    source: '“Our design and drafting capabilities are on par with the largest companies in the industry, in fact, we integrate well with their systems.”',
    sourceUrl: ENG,
    confidence: 'high',
  },
  {
    id: 'eng-disciplines',
    section: 'engineering',
    claim: 'Additional engineering for electrical, steam, process water, heating, cooling and industrial ventilation.',
    source: 'Engineering page lists electrical, steam, process water, heating, cooling and industrial ventilation engineering.',
    sourceUrl: ENG,
    confidence: 'high',
  },
  {
    id: 'eng-energy',
    section: 'engineering',
    claim: 'Energy analysis for implementing efficiency ideas, to help determine payback.',
    source: '“We will perform an energy analysis for implementation of energy efficiency ideas to help determine payback.”',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'eng-equipment',
    section: 'engineering',
    claim: 'Engineered process equipment includes blast cells, spiral freezers, IQF and chill tunnels, screw conveyors, contact freezers and scraped surface heat exchangers.',
    source: 'Engineering page equipment list.',
    sourceUrl: ENG,
    confidence: 'high',
  },

  // ─── Construction ────────────────────────────────────────────────────
  {
    id: 'con-as-engineered',
    section: 'construction',
    claim: 'Systems installed as engineered — on time, with quality craftsmanship and safely.',
    source: '“Our construction personnel install the systems as engineered – on time, with quality craftsmanship and safely!”',
    sourceUrl: CON,
    confidence: 'high',
  },
  {
    id: 'con-supervision',
    section: 'construction',
    claim: 'Managed by industry experts; field supervised by an experienced foreman or superintendent.',
    source: '“Your project will be managed by an team of industry experts in the company and the field supervised by a very experienced foreman or superintendent.”',
    sourceUrl: CON,
    confidence: 'high',
  },
  {
    id: 'con-asme-welders',
    section: 'construction',
    claim: 'All welders are ASME code welders, tested to RC&E’s ASME code specifications.',
    source: '“Our welders are all ASME code welders tested to our ASME code specifications.”',
    sourceUrl: CON,
    confidence: 'high',
  },
  {
    id: 'con-materials',
    section: 'construction',
    claim: 'Copper, black steel, stainless, HE-PEX or PVC — joined by up-to-date, code-compliant methods.',
    source: '“Whether your system is copper, black steel, stainless, HE-PEX or PVC you can bet it will be joined by the most up to date, code compliant methods.”',
    sourceUrl: CON,
    confidence: 'high',
  },
  {
    id: 'con-fitters',
    section: 'construction',
    claim: 'Pipe fitters with years of industrial and refrigeration piping experience.',
    source: '“The pipe fitters on your project will have years of industrial and refrigeration piping experience.”',
    sourceUrl: CON,
    confidence: 'high',
  },
  {
    id: 'con-testing',
    section: 'construction',
    claim: 'After installation, the system is tested per ASME and local codes.',
    source: '“After installation, your system will be tested per the ASME and local codes…”',
    sourceUrl: CON,
    confidence: 'high',
  },
  {
    id: 'con-field-training',
    section: 'construction',
    claim: 'Field personnel are current on HAZMAT and OSHA training and certified on the equipment they operate.',
    source: '“Our personnel are all up to date on HAZMAT training, OSHA training, and certified on all equipment they are tasked to operate.”',
    sourceUrl: CON,
    confidence: 'high',
  },

  // ─── Service ─────────────────────────────────────────────────────────
  {
    id: 'svc-not-over',
    section: 'service',
    claim: 'The job is not over when the installation is complete.',
    source: '“RC&E believes that our job is not over when the installation is complete.”',
    sourceUrl: SVC,
    confidence: 'high',
  },
  {
    id: 'svc-list',
    section: 'service',
    claim: 'Preventative maintenance, emergency service, operations, repairs and retrofits for all systems.',
    source: '“…preventative maintenance, emergency service, operations, repairs, and retrofits for all systems.”',
    sourceUrl: SVC,
    confidence: 'high',
  },
  {
    id: 'svc-247',
    section: 'service',
    claim: 'Service by a trained technician, 24 hours a day, 7 days a week.',
    source: '“Service by a trained service technician is available 24 hours a day; 7 days a week”',
    sourceUrl: SVC,
    confidence: 'high',
  },
  {
    id: 'svc-startups',
    section: 'service',
    claim: 'Technicians are proficient in compressor and central system controls and perform RC&E’s own start-ups.',
    source: '“Our Service Tech’s are proficient in Compressor and Central System Controls and perform our own start ups.”',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'svc-crosstrained',
    section: 'service',
    claim: 'Service technicians are cross-trained in most types of industrial refrigeration systems and equipment.',
    source: '“All of our service technicians are cross trained in most types of industrial refrigeration systems and equipment.”',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'svc-phone',
    section: 'service',
    claim: 'Service line: (817) 348-0600 — after-hours personnel reach the technician on call.',
    source: '“(817) 348-0600” / “Our after hour’s personnel will get you to the service technician on call.”',
    sourceUrl: SVC,
    confidence: 'high',
  },

  // ─── Parts ───────────────────────────────────────────────────────────
  {
    id: 'parts-oem',
    section: 'parts',
    claim: 'Genuine OEM refrigeration system parts and service.',
    source: '“RC&E, Inc. is fast becoming one of the industry’s leading sources to go to for genuine OEM refrigeration system parts and service.”',
    sourceUrl: PARTS,
    confidence: 'high',
  },
  {
    id: 'parts-list',
    section: 'parts',
    claim: 'Compressor packages, condensers, evaporators, heat exchangers, pumps, valves, fittings and other piping components.',
    source: '“…compressor packages, condensers, evaporators, heat exchangers, pumps, valves, fittings and other piping components.”',
    sourceUrl: PARTS,
    confidence: 'high',
  },
  {
    id: 'parts-aftermarket',
    section: 'parts',
    claim: 'Aftermarket parts, compressor seals, filters and compressor lubricating oils.',
    source: 'Parts page: aftermarket parts; “Compressor seals, filters and Compressor lubricating oils”.',
    sourceUrl: PARTS,
    confidence: 'high',
  },
  {
    id: 'parts-bulk',
    section: 'parts',
    claim: 'Bulk ammonia and CO2 deliveries can be scheduled.',
    source: 'Parts page: bulk ammonia and CO2 delivery scheduling.',
    sourceUrl: PARTS,
    confidence: 'high',
  },
  {
    id: 'parts-rebuild',
    section: 'parts',
    claim: 'Repairs, compressor and pump vibration testing, compressor rebuilding and pump rebuilding.',
    source: 'Parts page: repair services, “compressor and pump vibration testing”, “compressor rebuilding and pump rebuilding”.',
    sourceUrl: PARTS,
    confidence: 'high',
  },
  {
    id: 'parts-manufacturers',
    section: 'parts',
    claim: 'Parts for all the major manufacturers — from people with construction and service experience.',
    source: '“We carry parts for all the major manufacturers. Our parts personnel have not only experience in parts, but they have some experience in construction and service of the systems as well.”',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'parts-247',
    section: 'parts',
    claim: 'The parts department is available 24 hours, 7 days a week.',
    source: '“As with the service department, our parts department is 24 hours, 7 days a week.” / Parts page: “You can count on service 24/7.”',
    sourceUrl: HOME,
    confidence: 'high',
  },

  // ─── Safety & Compliance ─────────────────────────────────────────────
  {
    id: 'safe-contractor',
    section: 'safety',
    claim: 'A full-service PSM/RMP contractor for ammonia refrigeration facilities throughout the United States.',
    source: '“We are a full service PSM/RMP contractor for ammonia refrigeration facilities throughout the United States.”',
    sourceUrl: SAFE,
    confidence: 'high',
  },
  {
    id: 'safe-osha-epa',
    section: 'safety',
    claim: 'A full PSM/RMP program covering both OSHA and EPA requirements.',
    source: '“…a full PSM/RMP program to cover both OSHA and EPA requirements”',
    sourceUrl: SAFE,
    confidence: 'high',
  },
  {
    id: 'safe-pha',
    section: 'safety',
    claim: 'Initial and revalidation Process Hazard Analysis, and RMP hazard assessment.',
    source: 'Specialties: “Initial and Revalidation Process Hazard Analysis”, “RMP Hazard Assessment”.',
    sourceUrl: SAFE,
    confidence: 'high',
  },
  {
    id: 'safe-audits',
    section: 'safety',
    claim: 'PSM/RMP audits, compliance audits and mechanical integrity audits.',
    source: 'Safety page: “PSM/RMP Audits”; Home: “compliance audits, mechanical integrity audits”.',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'safe-sop',
    section: 'safety',
    claim: 'SOP training, SOP development and review, and P&ID corrections.',
    source: '“…SOP Training, SOP developement and review, P&ID corrections, and more.”',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'safe-seminar',
    section: 'safety',
    claim: 'Four-day PSM training seminars.',
    source: '“Four day PSM training seminars”',
    sourceUrl: SAFE,
    confidence: 'high',
  },
  {
    id: 'safe-people',
    section: 'safety',
    claim: 'Every employee receives at least ammonia awareness classes; many receive Hazardous Material Technician level training; foremen and service technicians are certified in confined space and site incident command.',
    source: '“All of our employees at the very least receive ammonia awareness classes. Many of our employees receive Hazardous Material Technician Level training. Our foreman and service technicians are certified in confined space and site incident command.”',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'safe-other-chem',
    section: 'safety',
    claim: 'Coverage can extend to any other chemical located on site.',
    source: '“We can also cover any other chemical that may be located on site.”',
    sourceUrl: HOME,
    confidence: 'high',
  },

  // ─── Insulation ──────────────────────────────────────────────────────
  {
    id: 'ins-crews',
    section: 'insulation',
    claim: 'Dedicated insulation crews that do nothing but insulate pipe and equipment.',
    source: '“Our insulation crews that do nothing but insulate pipe and equipment. All of our insulators are experienced in industrial refrigeration pipe insulation.”',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'ins-important',
    section: 'insulation',
    claim: 'Insulation is one of the most important components of the refrigeration system.',
    source: '“…we feel that insulation is one of the most important components to the refrigeration system.” / Construction: “One of the most underrated, least appreciated and yet most important aspects of your whole system is the insulation.”',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'ins-materials',
    section: 'insulation',
    claim: 'In most cases: Dow extruded polystyrene with a Saran vapor barrier.',
    source: '“In most cases, we use Dow Extruded Polystyrene with a Saran Vapor Barrier.”',
    sourceUrl: HOME,
    confidence: 'high',
    note: 'Always shown with the “in most cases” qualifier — not every project uses the same material.',
  },
  {
    id: 'ins-jacket',
    section: 'insulation',
    claim: 'Protective jacket at the customer’s discretion: aluminum, stainless, galvanized steel, PVC or colored PVC.',
    source: '“Protective jacket used is at the customer’s discretion whether it be aluminum, Stainless, Galvanized Steel, PVC or colored PVC.”',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'ins-thickness',
    section: 'insulation',
    claim: 'Protective jacketing is typically thicker than generally required.',
    source: '“Typically our protective jacketing is at a greater thickness than generally required.”',
    sourceUrl: HOME,
    confidence: 'high',
  },

  // ─── Industries ──────────────────────────────────────────────────────
  {
    id: 'ind-core',
    section: 'industries',
    claim: 'Food plants, cold storage, beverage plants, petrochemical, ice plants and ice rinks.',
    source: '“Whether it be a food plant, cold storage, beverage plant, petrochemical, ice plants, or ice rinks, we can provide you with an energy efficient system that meets your budget.”',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'ind-food',
    section: 'industries',
    claim: 'Refrigerated public storage, grocery and foodservice distribution, fruit and vegetable storage, dairy, beverage, poultry, meat cutting and prepared food processing.',
    source: 'Engineering page industry list.',
    sourceUrl: ENG,
    confidence: 'high',
  },

  // ─── Contact ─────────────────────────────────────────────────────────
  {
    id: 'ct-office',
    section: 'contact',
    claim: 'Office: 888-357-2665.',
    source: '“Call 888-357-2665 to reach our office.”',
    sourceUrl: HOME,
    confidence: 'high',
  },
  {
    id: 'ct-email',
    section: 'contact',
    claim: 'contact@rce-nh3.com',
    source: 'Contact page email.',
    sourceUrl: CONTACT,
    confidence: 'high',
  },
];

/** Creative / conceptual copy. Displayed as design language, never as a company claim. */
export const creativeCopy: { text: string; where: string }[] = [
  { text: 'Engineered from the ground up.', where: 'Hero headline (brief-supplied)' },
  { text: 'Designed around your process.', where: 'Engineering headline' },
  { text: 'This is how the system comes together.', where: 'Construction headline' },
  { text: 'One discipline. Many industries.', where: 'Network headline' },
  { text: 'A system engineered to operate.', where: 'Startup headline' },
  { text: 'Installation isn’t the finish line.', where: 'Service headline (paraphrases svc-not-over)' },
  { text: 'The right component keeps the system moving.', where: 'Parts headline' },
  { text: 'Precision is a safety practice.', where: 'Safety headline' },
  { text: 'The layer that protects everything else.', where: 'Insulation headline' },
  { text: 'One system. One partner.', where: 'Final headline' },
  { text: 'All 3D geometry, facility types, flow animation and status read-outs.', where: 'Conceptual visualization only' },
];

/** Found during research but deliberately NOT used. Kept for review. */
export const notUsed: { item: string; reason: string; sourceUrl?: string }[] = [
  {
    item: '“We are on average 2-3 weeks ahead of original schedules.”',
    reason: 'Published on the homepage but undated; a performance statistic should be re-confirmed with RC&E before display.',
    sourceUrl: HOME,
  },
  {
    item: '“Our safety record for our service technicians has been perfect for the last 10 years.”',
    reason: 'Undated relative claim (“last 10 years”); cannot be tied to a current period.',
    sourceUrl: HOME,
  },
  {
    item: 'Service technicians’ certified training at named manufacturers.',
    reason: 'Verified on the homepage, but omitted to avoid featuring third-party brands in a concept piece.',
    sourceUrl: HOME,
  },
  {
    item: 'Project Blue (Fort Worth cold storage) square footage, dock doors, pallet positions.',
    reason: 'Figures come from a project partner’s post, not RC&E. The generic cold-storage model is not Project Blue.',
    sourceUrl: LINKEDIN,
  },
  {
    item: 'Portfolio entries and gallery photos.',
    reason: 'Several photos carry client names/watermarks and 2009–2010 date stamps. Used only as art-direction reference (jacketed rooftop racks, compressor packages, evaporative condensers) — never displayed.',
    sourceUrl: 'https://rcenh3.com/gallery/',
  },
  {
    item: '“Energy modeling”, “wash-down water”, “process piping” as capabilities.',
    reason: 'Not found on the official site. Official wording is “energy analysis” and “process water”, which are used instead.',
  },
  {
    item: 'Headcount (“over 60 employees”).',
    reason: 'Verified on About, but conflicts with LinkedIn’s size band and is not needed for the story.',
    sourceUrl: ABOUT,
  },
  {
    item: 'Delivery times / inventory levels for parts.',
    reason: 'Not published.',
  },
];

export const claimById = new Map(claims.map((c) => [c.id, c]));

export const contact = {
  office: '888-357-2665',
  officeHref: 'tel:+18883572665',
  service: '(817) 348-0600',
  serviceHref: 'tel:+18173480600',
  email: 'contact@rce-nh3.com',
  address: '1350 Forum Way S, Fort Worth, TX 76140',
  contactUrl: CONTACT,
  site: HOME,
} as const;

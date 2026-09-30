/**
 * The scroll narrative. `length` is measured in viewport heights of scroll.
 * `textSide` tells the camera which side to leave free for the copy (desktop).
 */
export type ChapterId =
  | 'hero'
  | 'engineering'
  | 'construction'
  | 'network'
  | 'startup'
  | 'service'
  | 'parts'
  | 'safety'
  | 'insulation'
  | 'final';

export interface Chapter {
  id: ChapterId;
  index: string;
  label: string;
  length: number;
  textSide: 'left' | 'right' | 'center';
}

export const chapters: Chapter[] = [
  { id: 'hero', index: '00', label: 'System', length: 1.6, textSide: 'left' },
  { id: 'engineering', index: '01', label: 'Engineering', length: 2.6, textSide: 'left' },
  { id: 'construction', index: '02', label: 'Construction', length: 3.0, textSide: 'right' },
  { id: 'network', index: '03', label: 'Industries', length: 2.0, textSide: 'left' },
  { id: 'startup', index: '04', label: 'Startup', length: 2.4, textSide: 'right' },
  { id: 'service', index: '05', label: 'Service', length: 1.7, textSide: 'left' },
  { id: 'parts', index: '06', label: 'Parts', length: 2.4, textSide: 'center' },
  { id: 'safety', index: '07', label: 'Safety', length: 2.4, textSide: 'left' },
  { id: 'insulation', index: '08', label: 'Insulation', length: 2.6, textSide: 'right' },
  { id: 'final', index: '09', label: 'One System', length: 1.8, textSide: 'center' },
];

export interface ChapterRange extends Chapter {
  start: number;
  end: number;
}

let acc = 0;
export const chapterRanges: ChapterRange[] = chapters.map((c) => {
  const r = { ...c, start: acc, end: acc + c.length };
  acc += c.length;
  return r;
});

/** Total narrative length in viewport heights. The last viewport is the resting frame. */
export const totalLength = acc;

export const rangeOf = (id: ChapterId): ChapterRange =>
  chapterRanges.find((c) => c.id === id)!;

/** Read-side shapes for the Seerah knowledge graph. Mirrors backend/services/seerahService.js. */

export type NodeType = 'ayah' | 'seerahEvent' | 'hadithRef' | 'tafsirPassage';

export type Relation =
  | 'revealed_concerning'
  | 'references'
  | 'thematically_related'
  | 'attested_by'
  | 'explained_by'
  | 'dated_by';

/** The tiers the UI is allowed to show. Never a bare check mark. */
export type ReviewState = 'unreviewed' | 'reviewed' | 'contested' | 'returned';

export type GradingLabel =
  | 'sahih'
  | 'hasan'
  | 'daif'
  | 'mursal'
  | 'no-isnad'
  | 'curatorial'
  | 'textual';

export interface AyahNode {
  type: 'ayah';
  verseKey: string;
}

export interface EventNode {
  type: 'seerahEvent';
  id: string;
  slug: string;
  title: string;
}

export interface HadithNode {
  type: 'hadithRef';
  id: string;
  collection: string;
  number: string;
  gloss: string;
  gradings: Array<{ grade: string; grader: string; source: string }>;
  sunnahComUrl: string | null;
}

export interface TafsirNode {
  type: 'tafsirPassage';
  id: string;
  work: string;
  verseKey: string;
  locator: string;
  summary: string;
  externalUrl: string | null;
}

export type GraphNode = AyahNode | EventNode | HadithNode | TafsirNode;

export interface Edge {
  id: string;
  from: GraphNode;
  to: GraphNode;
  relation: Relation;
  source: { work: string; locator: string; url: string | null };
  grading: { label: GradingLabel; basis: string };
  confidence: 'established' | 'reported' | 'contested' | 'weak';
  disagreement: { flag: boolean; summary: string };
  review: { state: ReviewState; domain: string };
}

export interface Dating {
  source: string;
  hijriYear: number;
  hijriMonth?: number;
  hijriDay?: number;
  note?: string;
}

export interface SeerahEvent {
  id: string;
  _id: string;
  slug: string;
  title: string;
  titleArabic: string;
  segment: string;
  narrativeOrder: number;
  summary: string;
  dating: Dating[];
  participants: string[];
  places: string[];
  review: { state: 'unreviewed' | 'reviewed' };
  links: Edge[];
}

export interface SegmentResponse {
  success: boolean;
  segment: string;
  events: SeerahEvent[];
  /** ayah -> tafsirPassage edges, which belong to no event */
  tafsirEdges: Edge[];
  counts: {
    events: number;
    links: number;
    hadithRefs: number;
    tafsirPassages: number;
  };
}

export interface EventResponse {
  success: boolean;
  event: SeerahEvent;
}

import { ExternalLink } from 'lucide-react';
import { ReviewBadge, GradingBadge } from './ReviewBadge';
import type { Edge, GraphNode, Relation } from '../types';

/** The verb is the honest label — render it, don't flatten every edge to "source". */
const RELATION_LABELS: Record<Relation, string> = {
  revealed_concerning: 'Revealed concerning',
  references: 'References',
  thematically_related: 'Thematically related',
  attested_by: 'Attested by',
  explained_by: 'Explained by',
  dated_by: 'Dated by',
};

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Ula', 'Jumada al-Akhira',
  'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah',
];

export function formatDating(d: { hijriYear: number; hijriMonth?: number; hijriDay?: number }) {
  const month = d.hijriMonth ? HIJRI_MONTHS[d.hijriMonth - 1] : null;
  if (d.hijriDay && month) return `${d.hijriDay} ${month} ${d.hijriYear} AH`;
  if (month) return `${month} ${d.hijriYear} AH`;
  return `${d.hijriYear} AH`;
}

const COLLECTION_LABELS: Record<string, string> = {
  bukhari: 'Sahih al-Bukhari',
  muslim: 'Sahih Muslim',
  ahmad: 'Musnad Ahmad',
};

const WORK_LABELS: Record<string, string> = {
  'ibn-kathir': 'Ibn Kathir',
  jalalayn: 'al-Jalalayn',
};

function nodeTitle(node: GraphNode): string {
  switch (node.type) {
    case 'ayah':
      return `Qur'an ${node.verseKey}`;
    case 'hadithRef':
      return `${COLLECTION_LABELS[node.collection] ?? node.collection} ${node.number}`;
    case 'tafsirPassage':
      return `${WORK_LABELS[node.work] ?? node.work} — ${node.locator}`;
    case 'seerahEvent':
      return node.title;
  }
}

function nodeBody(node: GraphNode): string | null {
  if (node.type === 'hadithRef') return node.gloss;
  if (node.type === 'tafsirPassage') return node.summary;
  return null;
}

function nodeUrl(node: GraphNode): string | null {
  if (node.type === 'hadithRef') return node.sunnahComUrl;
  if (node.type === 'tafsirPassage') return node.externalUrl;
  return null;
}

/**
 * One edge, rendered as a citation with its own provenance visible.
 *
 * `perspective` says which endpoint the reader is standing on, so the card shows
 * the *other* one. On an event page you want "attested by Bukhari 3007"; on an
 * ayah you want "explained by Ibn Kathir".
 */
export function EdgeCard({ edge, perspective }: { edge: Edge; perspective: 'from' | 'to' }) {
  const other = perspective === 'from' ? edge.to : edge.from;
  const body = nodeBody(other);
  const url = nodeUrl(other);

  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {RELATION_LABELS[edge.relation]}
        </span>
        <ReviewBadge state={edge.review.state} />
        <GradingBadge label={edge.grading.label} basis={edge.grading.basis} />
      </div>

      <div className="flex items-start justify-between gap-3">
        <h4 className="font-medium leading-snug">{nodeTitle(other)}</h4>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Open ${nodeTitle(other)} in a new tab`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {body && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>}

      <dl className="mt-3 space-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium">Source</dt>
          <dd>
            {edge.source.work}
            {edge.source.locator ? `, ${edge.source.locator}` : ''}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium">Basis</dt>
          <dd>{edge.grading.basis}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium">Confidence</dt>
          <dd className="capitalize">{edge.confidence}</dd>
        </div>
      </dl>

      {/* Disagreement is shown, never collapsed into a single boolean verdict. */}
      {edge.disagreement.flag && (
        <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-300">
          <span className="font-medium">Scholars differ: </span>
          {edge.disagreement.summary || 'A disagreement is recorded on this link.'}
        </p>
      )}
    </div>
  );
}

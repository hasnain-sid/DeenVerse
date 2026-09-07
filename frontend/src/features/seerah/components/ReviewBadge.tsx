import { cn } from '@/lib/utils';
import type { ReviewState, GradingLabel } from '../types';

/**
 * The authority badge.
 *
 * Tiers per docs/quran-seerah-integration-plan.md §1.6: Unreviewed (grey),
 * Reviewed (a named reviewer accepted it), Contested (positions differ).
 * **Never a bare check mark** — a green tick with nobody behind it is the
 * `isScholarVerified` failure with a nicer UI.
 *
 * Everything ships Unreviewed today, and the label says so in as many words
 * rather than implying a review that has not happened.
 */

const STATE_STYLES: Record<ReviewState, { label: string; className: string; title: string }> = {
  unreviewed: {
    label: 'Unreviewed',
    className: 'bg-muted/60 text-muted-foreground border-border',
    title:
      'Provenance is complete — source, grading and confidence are all recorded — but no scholar has reviewed this link.',
  },
  reviewed: {
    label: 'Reviewed',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    title: 'A credentialed reviewer has accepted this link in its domain.',
  },
  contested: {
    label: 'Contested',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    title: 'Reviewers recorded differing positions on this link.',
  },
  returned: {
    label: 'Returned',
    className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    title: 'A reviewer returned this link to the author for correction.',
  },
};

/** Grading is the strength of the link's *evidence* — a different claim from review state. */
const GRADING_STYLES: Record<GradingLabel, string> = {
  sahih: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  hasan: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  daif: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  mursal: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'no-isnad': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  curatorial: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  textual: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
};

const pill =
  'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap';

export function ReviewBadge({ state, className }: { state: ReviewState; className?: string }) {
  const s = STATE_STYLES[state] ?? STATE_STYLES.unreviewed;
  return (
    <span className={cn(pill, s.className, className)} title={s.title}>
      {s.label}
    </span>
  );
}

export function GradingBadge({
  label,
  basis,
  className,
}: {
  label: GradingLabel;
  basis?: string;
  className?: string;
}) {
  return (
    <span className={cn(pill, GRADING_STYLES[label] ?? GRADING_STYLES.curatorial, className)} title={basis}>
      {label}
    </span>
  );
}

import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Info, ScrollText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeerahSegment } from './useSeerah';
import { formatDating } from './components/EdgeCard';
import type { SeerahEvent } from './types';

/** How many of each kind of source back an event — shown so the timeline isn't opaque. */
function sourceSummary(event: SeerahEvent) {
  const hadith = event.links.filter(
    (l) => l.from.type === 'hadithRef' || l.to.type === 'hadithRef'
  ).length;
  const ayat = event.links.filter((l) => l.from.type === 'ayah' || l.to.type === 'ayah').length;
  return { hadith, ayat };
}

/** Total events authored for the segment. Events without a citable source stay unpublished. */
const AUTHORED_EVENT_COUNT = 10;

export function SeerahPage() {
  const { data, isLoading, isError, error } = useSeerahSegment('badr');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-3 h-9 w-64" />
        <Skeleton className="mb-8 h-16 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="mb-3 h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
          Could not load the Seerah timeline. {(error as Error)?.message}
        </div>
      </div>
    );
  }

  const events = data?.events ?? [];
  const hidden = Math.max(0, AUTHORED_EVENT_COUNT - events.length);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <ScrollText className="h-4 w-4" />
          <span>Seerah</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">The Battle of Badr</h1>
        <p className="mt-2 text-muted-foreground">
          The events in the order they happened, each with the reports and verses that stand
          behind it. {data?.counts.links} links across {data?.counts.hadithRefs} hadith
          references and {data?.counts.tafsirPassages} tafsir passages.
        </p>
      </header>

      {/*
        Said plainly rather than buried. Everything here is Unreviewed, and the honest
        statement of that is the point — not a disclaimer to be minimised.
      */}
      <div className="mb-8 flex gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-muted-foreground">
          Every link below is marked <span className="font-medium text-foreground">Unreviewed</span>.
          That means its provenance is complete — a named source, a grading and a confidence are
          recorded for each one — but no scholar has yet reviewed them. The label is what it says,
          and it will change only when a credentialed reviewer signs off.
        </p>
      </div>

      <ol className="relative space-y-3 border-l border-border pl-6">
        {events.map((event) => {
          const { hadith, ayat } = sourceSummary(event);
          const dating = event.dating?.[0];

          return (
            <li key={event.id} className="relative">
              <span className="absolute -left-[31px] top-5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-[10px] font-semibold text-muted-foreground">
                {event.narrativeOrder}
              </span>

              <Link
                to={`/seerah/${event.slug}`}
                className="group block rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-foreground/20 hover:bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold leading-snug group-hover:underline">
                      {event.title}
                    </h2>
                    {dating && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDating(dating)}
                        {dating.note ? ` · ${dating.note}` : ''}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{event.summary}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {hadith > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {hadith} hadith {hadith === 1 ? 'report' : 'reports'}
                    </span>
                  )}
                  {ayat > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <ScrollText className="h-3 w-3" />
                      {ayat} {ayat === 1 ? 'ayah' : 'ayat'}
                    </span>
                  )}
                  {hadith === 0 && ayat === 0 && <span>No sources linked yet</span>}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      {/*
        Some events carry no citable source yet and are held back rather than shown
        unbacked. Saying so beats a timeline that silently skips numbers.
      */}
      {hidden > 0 && (
        <p className="mt-6 text-xs text-muted-foreground">
          {hidden} further {hidden === 1 ? 'event has' : 'events have'} been drafted but{' '}
          {hidden === 1 ? 'is' : 'are'} not shown: no citable source stands behind{' '}
          {hidden === 1 ? 'it' : 'them'} yet, and inventing one to fill the gap would fabricate
          provenance.
        </p>
      )}
    </div>
  );
}

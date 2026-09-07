import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeerahEvent, useSeerahSegment } from './useSeerah';
import { EdgeCard, formatDating } from './components/EdgeCard';
import type { Edge } from './types';

/** Group an event's edges by what sits on the other end. */
function partition(links: Edge[], slug: string) {
  const other = (e: Edge) =>
    e.from.type === 'seerahEvent' && e.from.slug === slug ? e.to : e.from;
  return {
    hadith: links.filter((e) => other(e).type === 'hadithRef'),
    ayat: links.filter((e) => other(e).type === 'ayah'),
  };
}

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useSeerahEvent(slug);
  // The segment is already cached by the timeline, so this is free and lets each
  // ayah show the tafsir that explains it.
  const { data: segment } = useSeerahSegment('badr');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-3 h-8 w-72" />
        <Skeleton className="mb-6 h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data?.event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          to="/seerah"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the timeline
        </Link>
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          This event could not be found.
        </div>
      </div>
    );
  }

  const event = data.event;
  const { hadith, ayat } = partition(event.links, event.slug);

  /** Tafsir edges for a verse this event is linked to. */
  const tafsirFor = (verseKey: string) =>
    (segment?.tafsirEdges ?? []).filter(
      (e) => e.from.type === 'ayah' && e.from.verseKey === verseKey
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/seerah"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to the timeline
      </Link>

      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        {event.titleArabic && (
          <p className="mt-1 text-xl text-muted-foreground" dir="rtl" lang="ar">
            {event.titleArabic}
          </p>
        )}
      </header>

      <p className="mb-6 leading-relaxed">{event.summary}</p>

      {/*
        Dating is plural on purpose in the schema: sources disagree, and each attested
        dating carries its own source. Render them all rather than picking one.
      */}
      {event.dating?.length > 0 && (
        <section className="mb-6 rounded-lg border border-border bg-card/50 p-4">
          <h2 className="mb-2 text-sm font-semibold">Dating</h2>
          <ul className="space-y-2 text-sm">
            {event.dating.map((d, i) => (
              <li key={i}>
                <span className="font-medium">{formatDating(d)}</span>
                <span className="text-muted-foreground"> — {d.source}</span>
                {d.note && <p className="mt-0.5 text-xs text-muted-foreground">{d.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(event.participants?.length > 0 || event.places?.length > 0) && (
        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {event.participants?.length > 0 && (
            <p className="inline-flex items-start gap-1.5">
              <Users className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{event.participants.join(', ')}</span>
            </p>
          )}
          {event.places?.length > 0 && (
            <p className="inline-flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{event.places.join(', ')}</span>
            </p>
          )}
        </div>
      )}

      {hadith.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">
            Hadith {hadith.length === 1 ? 'report' : 'reports'}
          </h2>
          <div className="space-y-3">
            {hadith.map((e) => (
              <EdgeCard key={e.id} edge={e} perspective="from" />
            ))}
          </div>
        </section>
      )}

      {ayat.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Qur'anic verses</h2>
          <div className="space-y-3">
            {ayat.map((e) => {
              const verseKey = e.from.type === 'ayah' ? e.from.verseKey : null;
              const tafsir = verseKey ? tafsirFor(verseKey) : [];
              return (
                <div key={e.id}>
                  <EdgeCard edge={e} perspective="to" />
                  {tafsir.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2 border-l border-border pl-4">
                      {tafsir.map((t) => (
                        <EdgeCard key={t.id} edge={t} perspective="from" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {event.links.length === 0 && (
        <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          No sources are linked to this event yet.
        </p>
      )}
    </div>
  );
}

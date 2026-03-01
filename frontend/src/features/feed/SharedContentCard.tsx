import { BookOpen, BookMarked, Heart, Sun, Compass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SharedContent } from '@/types/post';

interface SharedContentCardProps {
  sharedContent: SharedContent;
}

function kindConfig(kind: SharedContent['kind']) {
  switch (kind) {
    case 'hadith':
      return { label: 'Hadith', icon: BookMarked, accent: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/40' };
    case 'ayah':
      return { label: 'Ayah', icon: BookOpen, accent: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/40' };
    case 'ruku':
      return { label: 'Ruku', icon: BookOpen, accent: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-900/40' };
    case 'juzz':
      return { label: 'Juzz', icon: Compass, accent: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-900/40' };
    case 'mood':
      return { label: 'Quran by Mood', icon: Heart, accent: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-900/40' };
    case 'sign':
      return { label: 'Iman Boost', icon: Sparkles, accent: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-900/40' };
    default:
      return { label: 'Shared', icon: Sun, accent: 'text-primary', border: 'border-border' };
  }
}

export function SharedContentCard({ sharedContent }: SharedContentCardProps) {
  const { label, icon: Icon, accent, border } = kindConfig(sharedContent.kind);

  const cardContent = (
    <div className={`mt-3 rounded-xl border ${border} bg-card p-4 transition-colors hover:bg-secondary/30`}>
      {/* Kind badge */}
      <div className={`mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${accent}`}>
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>

      {/* Title */}
      {sharedContent.title && (
        <p className="text-sm font-semibold leading-snug text-foreground">
          {sharedContent.title}
        </p>
      )}

      {/* Arabic text — full width, generous line-height for readability */}
      {sharedContent.arabic && (
        <p
          dir="rtl"
          className="mt-3 rounded-lg bg-secondary/50 px-3 py-2.5 text-right text-lg leading-[2] font-arabic text-foreground"
        >
          {sharedContent.arabic}
        </p>
      )}

      {/* Translation (if backend enriched it) */}
      {sharedContent.translation && (
        <p className="mt-2 text-sm italic leading-relaxed text-muted-foreground">
          {sharedContent.translation}
        </p>
      )}

      {/* Excerpt / description */}
      {sharedContent.excerpt && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-5">
          {sharedContent.excerpt}
        </p>
      )}

      {/* Source ref + meta pills */}
      {(sharedContent.sourceRef || (sharedContent.meta && sharedContent.meta.length > 0)) && (
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          {sharedContent.sourceRef && (
            <span className={`rounded-full border ${border} bg-secondary px-2.5 py-0.5 font-medium text-foreground`}>
              {sharedContent.sourceRef}
            </span>
          )}
          {sharedContent.meta?.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // Wrap in a link if the backend provided a sourceRoute
  if (sharedContent.sourceRoute) {
    return (
      <Link to={sharedContent.sourceRoute} className="block no-underline" aria-label={`View ${label}: ${sharedContent.title ?? 'shared content'}`}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

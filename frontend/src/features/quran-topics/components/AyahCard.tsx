import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AyahItem } from '../types';

interface AyahCardProps {
  ayah: AyahItem;
  index: number;
}

export function AyahCard({ ayah, index }: AyahCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-5 space-y-4',
        'transition-all hover:border-primary/30',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>
            {ayah.surah} ({ayah.surahArabic}) — {ayah.surahNumber}:{ayah.ayahNumber}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">#{index + 1}</span>
      </div>

      {/* Arabic text */}
      <p
        className="text-right text-xl leading-loose font-arabic text-foreground"
        dir="rtl"
        lang="ar"
      >
        {ayah.arabic}
      </p>

      {/* Translation */}
      <p className="text-sm leading-relaxed text-muted-foreground">{ayah.translation}</p>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-secondary px-2 py-0.5">Juz {ayah.juzNumber}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5">Page {ayah.page}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 capitalize">{ayah.revelationType}</span>
      </div>
    </div>
  );
}

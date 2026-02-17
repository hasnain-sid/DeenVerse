import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HadithDetail } from './useHadith';
import { useThemeStore } from '@/stores/themeStore';

interface HadithCardProps {
  hadith: HadithDetail | undefined;
  isLoading: boolean;
  isBookmarked: boolean;
  onBookmark: () => void;
  onShare: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number;
  totalCount: number;
}

export function HadithCard({
  hadith,
  isLoading,
  isBookmarked,
  onBookmark,
  onShare,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
}: HadithCardProps) {
  const { fontSize, fontFamily } = useThemeStore();

  if (isLoading) {
    return <HadithSkeleton />;
  }

  if (!hadith) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No hadith to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Hadith of the Day
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1} / {totalCount}
        </span>
      </div>

      {/* Content */}
      <CardContent className="p-0">
        <div
          id="hadith-content"
          className="px-6 py-8 space-y-6"
          style={{ fontSize: `${fontSize}px`, fontFamily }}
        >
          {/* Title */}
          <h2 className="text-xl font-semibold text-center leading-relaxed">
            {hadith.title}
          </h2>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Hadith Text */}
          <blockquote className="hadith-accent pl-4 py-2">
            <p className="leading-relaxed text-foreground/90 italic">
              {hadith.hadeeth}
            </p>
          </blockquote>

          {/* Attribution / Grade */}
          {hadith.attribution && (
            <p className="text-sm text-muted-foreground text-center">
              — {hadith.attribution}
              {hadith.grade && (
                <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {hadith.grade}
                </span>
              )}
            </p>
          )}

          {/* Explanation */}
          {hadith.explanation && (
            <div className="rounded-lg bg-secondary/50 p-4 mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Explanation
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">
                {hadith.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between border-t px-6 py-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onBookmark}
            >
              <Bookmark
                className={cn(
                  'h-4 w-4',
                  isBookmarked && 'fill-primary text-primary'
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HadithSkeleton() {
  return (
    <Card>
      <div className="border-b px-6 py-3">
        <Skeleton className="h-4 w-32" />
      </div>
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Skeleton className="h-px w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

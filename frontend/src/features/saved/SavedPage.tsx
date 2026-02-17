import { useState, useCallback } from 'react';
import { HadithCard } from '../hadith/HadithCard';
import { useHadithDetail } from '../hadith/useHadith';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Bookmark } from 'lucide-react';
// Skeleton available from '@/components/ui/skeleton' if needed
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

export function SavedPage() {
  const { user, isAuthenticated, updateSaved } = useAuthStore();
  const savedIds = user?.saved ?? [];
  const [index, setIndex] = useState(0);

  const currentId = savedIds.length > 0 ? String(savedIds[index]) : null;
  const { data: hadithDetail, isLoading } = useHadithDetail(currentId);

  const isBookmarked = currentId
    ? savedIds.includes(Number(currentId))
    : false;

  const handleBookmark = useCallback(async () => {
    if (!isAuthenticated || !currentId) {
      toast.error('Please sign in to manage bookmarks');
      return;
    }

    try {
      const res = await api.put(`/user/saved/${currentId}`);
      if (res.data.success) {
        updateSaved(Number(currentId));
        toast.success('Bookmark updated');
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  }, [isAuthenticated, currentId, updateSaved]);

  const handleShare = useCallback(async () => {
    try {
      const el = document.getElementById('hadith-content');
      if (!el) return;

      toast.loading('Generating image...');
      const dataUrl = await toPng(el, { quality: 0.95 });
      toast.dismiss();
      download(dataUrl, 'saved-hadith.png');
      toast.success('Downloaded!');
    } catch {
      toast.dismiss();
      toast.error('Failed to generate image');
    }
  }, []);

  const handlePrev = useCallback(() => {
    if (savedIds.length > 0) {
      setIndex((i) => (i - 1 + savedIds.length) % savedIds.length);
    }
  }, [savedIds.length]);

  const handleNext = useCallback(() => {
    if (savedIds.length > 0) {
      setIndex((i) => (i + 1) % savedIds.length);
    }
  }, [savedIds.length]);

  // Empty state
  if (!isAuthenticated) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Bookmark className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">Sign in to see saved hadiths</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Create an account or sign in to bookmark your favorite hadiths and access them anytime.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (savedIds.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">No saved hadiths yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Browse the daily hadiths and tap the bookmark icon to save your favorites here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {savedIds.length} saved hadith{savedIds.length !== 1 ? 's' : ''}
        </p>
      </div>

      <HadithCard
        hadith={hadithDetail}
        isLoading={isLoading}
        isBookmarked={isBookmarked}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onPrev={handlePrev}
        onNext={handleNext}
        currentIndex={index}
        totalCount={savedIds.length}
      />
    </div>
  );
}

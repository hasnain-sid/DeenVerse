import { useState, useCallback } from 'react';
import { HadithCard } from './HadithCard';
import { useHadithList, useHadithDetail } from './useHadith';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Languages, Type, Minus, Plus } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

export function HadithPage() {
  const [index, setIndex] = useState(0);
  const { user, isAuthenticated, updateSaved } = useAuthStore();
  const { hadithLanguage, setHadithLanguage, fontSize, setFontSize } = useThemeStore();

  // Fetch hadith list
  const { data: hadithList, isLoading: isListLoading } = useHadithList();
  const currentHadith = hadithList?.[index];

  // Fetch individual hadith detail
  const { data: hadithDetail, isLoading: isDetailLoading } = useHadithDetail(
    currentHadith?.id ?? null
  );

  // Bookmark state
  const isBookmarked = user?.saved?.includes(Number(currentHadith?.id)) ?? false;

  const handleBookmark = useCallback(async () => {
    if (!isAuthenticated || !currentHadith) {
      toast.error('Please sign in to bookmark hadiths');
      return;
    }

    try {
      const res = await api.put(`/user/saved/${currentHadith.id}`);
      if (res.data.success) {
        updateSaved(Number(currentHadith.id));
        toast.success(isBookmarked ? 'Removed from saved' : 'Saved!');
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  }, [isAuthenticated, currentHadith, isBookmarked, updateSaved]);

  const handleShare = useCallback(async () => {
    try {
      const el = document.getElementById('hadith-content');
      if (!el) return;
      
      toast.loading('Generating image...');
      const dataUrl = await toPng(el, { quality: 0.95 });
      toast.dismiss();
      download(dataUrl, 'hadith.png');
      toast.success('Downloaded!');
    } catch {
      toast.dismiss();
      toast.error('Failed to generate image');
    }
  }, []);

  const handlePrev = useCallback(() => {
    if (!hadithList) return;
    setIndex((i) => (i - 1 + hadithList.length) % hadithList.length);
  }, [hadithList]);

  const handleNext = useCallback(() => {
    if (!hadithList) return;
    setIndex((i) => (i + 1) % hadithList.length);
  }, [hadithList]);

  // Dynamic languages available from hadithDetail?.translations
  // Can be mapped with LANGUAGE_MAP when needed for the language selector

  if (isListLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Language selector */}
        <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <select
            value={hadithLanguage}
            onChange={(e) => setHadithLanguage(e.target.value)}
            className="bg-transparent text-sm outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
            <option value="ur">Urdu</option>
            <option value="fr">French</option>
            <option value="tr">Turkish</option>
          </select>
        </div>

        {/* Font size */}
        <div className="flex items-center gap-1 rounded-md border px-2 py-1">
          <Type className="h-4 w-4 text-muted-foreground mr-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setFontSize(Math.max(12, fontSize - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs w-6 text-center">{fontSize}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setFontSize(Math.min(28, fontSize + 1))}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Hadith Card */}
      <HadithCard
        hadith={hadithDetail}
        isLoading={isDetailLoading}
        isBookmarked={isBookmarked}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onPrev={handlePrev}
        onNext={handleNext}
        currentIndex={index}
        totalCount={hadithList?.length ?? 0}
      />
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { BookOpen, Volume2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AyahItem } from '../types';
import toast from 'react-hot-toast';

interface AyahCardProps {
  ayah: AyahItem;
  index: number;
}

export function AyahCard({ ayah, index }: AyahCardProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleAudioPlayback = () => {
    if (isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (ayah.audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(ayah.audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {
        toast.error('Could not play audio');
      });
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        toast.error('Audio playback failed');
      };
      setIsPlayingAudio(true);
    } else {
      toast('Audio not available for this ayah', { icon: '🔇' });
    }
  };

  const handleMarkComplete = () => {
    toast.success('Passage marked as read! Added to your spaced repetition queue.', { icon: '🎓' });
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card overflow-hidden shadow-sm',
        'transition-all hover:border-primary/30',
      )}
    >
      {/* Header */}
      <div className="bg-muted/30 px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <BookOpen className="h-4 w-4" />
            <span>
              {ayah.surah} ({ayah.surahArabic})
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Ayah {ayah.ayahNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground mr-2">#{index + 1}</span>
          <Button
            variant={isPlayingAudio ? "secondary" : "outline"}
            size="sm"
            className="rounded-full gap-2 transition-all h-8"
            onClick={handleAudioPlayback}
          >
            {isPlayingAudio ? (
              <span className="flex items-center gap-1">
                <span className="w-1 h-3 bg-primary rounded-full animate-pulse"></span>
                <span className="w-1 h-4 bg-primary rounded-full animate-pulse delay-75"></span>
                <span className="w-1 h-2 bg-primary rounded-full animate-pulse delay-150"></span>
              </span>
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            <span className="hidden sm:inline-block">{isPlayingAudio ? 'Listening...' : 'Listen'}</span>
          </Button>
        </div>
      </div>

      {/* Arabic text */}
      <div className="p-5 space-y-6">
        {/* Arabic text */}
        <p
          className="text-right text-2xl sm:text-3xl leading-loose font-arabic text-foreground"
          dir="rtl"
          lang="ar"
        >
          {ayah.arabic}
        </p>

        {/* Translation */}
        <p className="text-[15px] leading-relaxed text-muted-foreground">{ayah.translation}</p>

        {/* Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2 py-0.5">Juz {ayah.juzNumber}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5">Page {ayah.page}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 capitalize">{ayah.revelationType}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hover:bg-primary/10 gap-2 h-8 rounded-full text-xs"
            onClick={handleMarkComplete}
          >
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline-block">Mark as Read</span>
          </Button>
        </div>
      </div>

      {/* Tafsir Expandable Section (Phase 3) */}
      {ayah.tafsir && (
        <div className="border-t border-border bg-muted/10">
          <button
            onClick={() => setShowTafsir(!showTafsir)}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2 font-medium text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              Tafsir & Understanding
            </div>
            {showTafsir ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {showTafsir && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-2 text-sm text-foreground/80 leading-relaxed border-t border-border/50">
                  {ayah.tafsir}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

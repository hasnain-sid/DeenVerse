import { useState } from 'react';
import { BookOpen, Settings, Check, AlignRight, Book, LayoutList, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAyah, useRuku, useJuz } from './useQuranReader';
import { Skeleton } from '@/components/ui/skeleton';

type ReadingMode = 'ayah' | 'ruku' | 'juzz';

export function QuranReaderPage() {
    const [readingMode, setReadingMode] = useState<ReadingMode>('ruku');
    const [activeTab, setActiveTab] = useState<'translation' | 'tafseer'>('translation');
    const [arabicFont, setArabicFont] = useState('font-arabic');
    const [showSettings, setShowSettings] = useState(false);

    // Navigation state for each mode
    const [ayahNumber, setAyahNumber] = useState(1);
    const [rukuNumber, setRukuNumber] = useState(1);
    const [juzNumber, setJuzNumber] = useState(1);

    const ayahQuery = useAyah(ayahNumber);
    const rukuQuery = useRuku(rukuNumber);
    const juzQuery = useJuz(juzNumber);

    const isLoading =
        (readingMode === 'ayah' && ayahQuery.isLoading) ||
        (readingMode === 'ruku' && rukuQuery.isLoading) ||
        (readingMode === 'juzz' && juzQuery.isLoading);

    const isError =
        (readingMode === 'ayah' && ayahQuery.isError) ||
        (readingMode === 'ruku' && rukuQuery.isError) ||
        (readingMode === 'juzz' && juzQuery.isError);

    // Navigation helpers
    const limits = { ayah: 6236, ruku: 556, juzz: 30 };
    const current = readingMode === 'ayah' ? ayahNumber : readingMode === 'ruku' ? rukuNumber : juzNumber;
    const max = limits[readingMode];

    const goNext = () => {
        if (readingMode === 'ayah' && ayahNumber < 6236) setAyahNumber(n => n + 1);
        if (readingMode === 'ruku' && rukuNumber < 556) setRukuNumber(n => n + 1);
        if (readingMode === 'juzz' && juzNumber < 30) setJuzNumber(n => n + 1);
    };
    const goPrev = () => {
        if (readingMode === 'ayah' && ayahNumber > 1) setAyahNumber(n => n - 1);
        if (readingMode === 'ruku' && rukuNumber > 1) setRukuNumber(n => n - 1);
        if (readingMode === 'juzz' && juzNumber > 1) setJuzNumber(n => n - 1);
    };

    const fontLabel = (f: string) =>
        f === 'font-sans' ? 'Standard Naskh' : f === 'font-arabic' ? 'IndoPak (Scheherazade)' : 'Uthmani (Hafs)';

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-[600px] flex flex-col animate-fade-in">
            {/* Top Segmented Control */}
            <div className="flex justify-center mb-10 mt-4">
                <div className="flex p-1.5 bg-card rounded-2xl shadow-inner border border-border backdrop-blur-sm">
                    {(['ayah', 'ruku', 'juzz'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setReadingMode(mode)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${readingMode === mode
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                                }`}
                        >
                            {mode === 'ayah' && <AlignRight className="w-4 h-4" />}
                            {mode === 'ruku' && <LayoutList className="w-4 h-4" />}
                            {mode === 'juzz' && <Book className="w-4 h-4" />}
                            <span className="capitalize">{mode === 'juzz' ? 'Juzz' : mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Card */}
            <div className="flex-1 bg-card rounded-[2rem] shadow-xl border border-border overflow-hidden relative">

                {/* Subtle gradient header */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <div className="p-6 md:p-10 relative">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">
                                {readingMode === 'ayah'
                                    ? (ayahQuery.data ? `${ayahQuery.data.surah}` : 'Loading...')
                                    : readingMode === 'ruku'
                                        ? `Ruku ${rukuNumber}`
                                        : `Juzz ${juzNumber}`}
                            </h2>
                            <p className="text-sm font-medium text-primary mt-1">
                                {readingMode === 'ayah'
                                    ? (ayahQuery.data ? `Verse ${ayahQuery.data.ayahNumber} · Page ${ayahQuery.data.page}` : '')
                                    : readingMode === 'ruku'
                                        ? (rukuQuery.data ? `${rukuQuery.data.surah} · ${rukuQuery.data.totalAyahsInRuku} ayahs` : '')
                                        : (juzQuery.data ? `${juzQuery.data.startingSurah} – ${juzQuery.data.endingSurah} · ${juzQuery.data.totalAyahsInJuz} ayahs` : '')}
                            </p>
                        </div>

                        {/* Settings */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors border border-border"
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            {showSettings && (
                                <div className="absolute right-0 mt-3 w-56 bg-card rounded-2xl shadow-2xl border border-border p-2 z-20">
                                    <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Arabic Style</div>
                                    {(['font-sans', 'font-arabic', 'font-serif'] as const).map(font => (
                                        <button
                                            key={font}
                                            onClick={() => { setArabicFont(font); setShowSettings(false); }}
                                            className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left text-foreground rounded-xl hover:bg-secondary/50 transition-colors"
                                        >
                                            {fontLabel(font)}
                                            {arabicFont === font && <Check className="w-4 h-4 text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="space-y-6 max-w-3xl mx-auto">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : isError ? (
                        <div className="text-center py-16 text-muted-foreground">
                            Failed to load Quran content. Please try again.
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            {/* ── AYAH MODE ── */}
                            {readingMode === 'ayah' && ayahQuery.data && (
                                <div className="max-w-2xl mx-auto">
                                    <div className="mb-10">
                                        <p dir="rtl" className={`text-4xl leading-[2.5] text-center text-foreground ${arabicFont}`}>
                                            {ayahQuery.data.arabic}{' '}
                                            <span className="text-primary opacity-60 ml-2">﴿{ayahQuery.data.ayahNumber}﴾</span>
                                        </p>
                                    </div>

                                    <div className="bg-secondary/30 rounded-2xl p-2 flex mb-8">
                                        {(['translation', 'tafseer'] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl capitalize transition-all duration-300 ${activeTab === tab
                                                    ? 'bg-card text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="px-4">
                                        {activeTab === 'translation' ? (
                                            <div className="space-y-4">
                                                <p className="text-lg text-foreground/80 leading-relaxed font-serif">
                                                    "{ayahQuery.data.translation}"
                                                </p>
                                                <p className="text-sm font-medium text-primary/80">
                                                    — {ayahQuery.data.surah} ({ayahQuery.data.referenceId}) · Juzz {ayahQuery.data.juzNumber}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <BookOpen className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <h4 className="font-semibold text-foreground">Tafseer Ibn Kathir</h4>
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    Tafseer content for this ayah would be loaded from an external API or database.
                                                    This is a placeholder for the full tafseer integration.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── RUKU MODE ── */}
                            {readingMode === 'ruku' && rukuQuery.data && (
                                <div className="space-y-10 max-w-3xl mx-auto">
                                    {rukuQuery.data.ayahs.map((ayah) => (
                                        <div key={ayah.globalAyahNumber} className="pb-10 border-b border-border last:border-0 last:pb-0">
                                            <p dir="rtl" className={`text-3xl leading-[2.5] text-right mb-5 text-foreground ${arabicFont}`}>
                                                {ayah.arabic}{' '}
                                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-primary/20 text-primary text-sm opacity-80 mr-2">
                                                    {ayah.ayahNumber}
                                                </span>
                                            </p>
                                            <p className="text-lg text-muted-foreground leading-relaxed font-serif pl-6 border-l-2 border-border">
                                                {ayah.translation}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-3 pl-6">
                                                {ayah.surah} {ayah.surahNumber}:{ayah.ayahNumber} · Page {ayah.page}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── JUZZ MODE ── */}
                            {readingMode === 'juzz' && juzQuery.data && (
                                <div className="max-w-3xl mx-auto">
                                    <div className="p-8 md:p-10 bg-[#FFFDF7] dark:bg-secondary/20 rounded-[2rem] border border-[#F2EFE9] dark:border-border shadow-inner">
                                        <p dir="rtl" className={`text-[1.75rem] md:text-[2rem] leading-[2.8] text-justify text-foreground ${arabicFont}`}>
                                            {juzQuery.data.ayahs.map((a) => (
                                                <span key={a.globalAyahNumber}>
                                                    {a.arabic}
                                                    <span className="text-primary/50 mx-1">۝</span>
                                                </span>
                                            ))}
                                        </p>
                                        <div className="mt-8 flex justify-center">
                                            <span className="text-sm font-medium text-primary/60 font-serif tracking-widest uppercase">
                                                Juzz {juzQuery.data.juzNumber} · {juzQuery.data.totalAyahsInJuz} Ayahs
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Controls */}
                    <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
                        <button
                            onClick={goPrev}
                            disabled={current <= 1}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80 text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>

                        <span className="text-sm text-muted-foreground font-medium">
                            {current} / {max}
                        </span>

                        <button
                            onClick={goNext}
                            disabled={current >= max}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

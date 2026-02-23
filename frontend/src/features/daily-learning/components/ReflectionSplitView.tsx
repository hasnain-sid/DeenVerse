import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type LearningUnitType = 'ayah' | 'ruku' | 'juzz';

/** Per-ayah data returned for ruku/juzz types */
export interface AyahEntry {
    ayahNumber: number;
    globalAyahNumber: number;
    arabic: string;
    translation: string;
    surahNumber: number;
    surah: string;
    surahArabic: string;
    juzNumber: number;
    page: number;
}

/** Shape returned by GET /api/v1/daily-learning?type=... */
export interface DailyLearningContent {
    type: LearningUnitType;
    referenceId: string;
    arabic: string;
    translation: string;
    surah: string;
    title: string;
    context: string;
    actionItem: string;
    // Ayah-specific fields
    surahArabic?: string;
    surahNumber?: number;
    ayahNumber?: number;
    globalAyahNumber?: number;
    juzNumber?: number;
    page?: number;
    revelationType?: string;
    // Ruku-specific fields
    rukuNumber?: number;
    startingAyah?: number;
    totalAyahsInRuku?: number;
    // Juzz-specific fields
    surahsIncluded?: string[];
    startingSurah?: string;
    endingSurah?: string;
    endingAyah?: number;
    totalAyahsInJuz?: number;
    // Per-ayah array for ruku/juzz
    ayahs?: AyahEntry[];
}

interface ReflectionSplitViewProps {
    content: DailyLearningContent | null;
    onComplete?: () => void;
}

/** Renders a single ayah view matching the Daily Learning Prototype 1 design */
function SingleAyahPanel({ content }: { content: DailyLearningContent }) {
    return (
        <div className="md:col-span-5 bg-[#0f0f0f] rounded-2xl border border-zinc-800/60 p-6 md:p-8 flex flex-col justify-between">
            {/* Arabic Text */}
            <div className="mb-10">
                <p dir="rtl" className="text-3xl md:text-5xl leading-[2.2] text-emerald-500 font-arabic text-right">
                    {content.arabic}
                </p>
            </div>

            {/* Translation */}
            <div>
                <h4 className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-4">
                    Translation
                </h4>
                <p className="text-lg text-zinc-100 leading-relaxed font-medium mb-4">
                    "{content.translation}"
                </p>
                <p className="text-sm text-emerald-600/80 font-medium">
                    {content.surah} ({content.referenceId})
                    {content.juzNumber != null && <span className="ml-2">· Juzz {content.juzNumber}</span>}
                    {content.page != null && <span className="ml-2">· Page {content.page}</span>}
                </p>
            </div>
        </div>
    );
}

/** Renders a scrollable list of ayahs (for ruku/juzz tabs) */
function MultiAyahPanel({ content }: { content: DailyLearningContent }) {
    const ayahs = content.ayahs ?? [];
    const label = content.type === 'ruku'
        ? `Ruku ${content.rukuNumber}`
        : `Juzz ${content.juzNumber ?? ''}`;

    return (
        <div className="md:col-span-5 bg-gradient-to-br from-card to-background rounded-2xl border border-border p-6 flex flex-col">
            {/* Header with stats */}
            <div className="mb-4 pb-3 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">{label}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {content.surah}
                    {content.type !== 'ruku' && content.surahsIncluded && content.surahsIncluded.length > 1 && (
                        <span className="block mt-0.5">
                            Surahs: {content.surahsIncluded.join(', ')}
                        </span>
                    )}
                    <span className="block mt-0.5">
                        {ayahs.length} ayah{ayahs.length !== 1 ? 's' : ''}
                    </span>
                </p>
            </div>

            {/* Scrollable ayah list */}
            <div className="flex-1 overflow-y-auto max-h-[60vh] space-y-6 pr-1">
                {ayahs.map((ayah) => (
                    <div key={ayah.globalAyahNumber} className="space-y-2">
                        <div className="text-right">
                            <p className="font-arabic text-2xl leading-relaxed text-primary">
                                {ayah.arabic}
                            </p>
                        </div>
                        <p className="text-sm text-foreground font-medium">
                            "{ayah.translation}"
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {ayah.surah} {ayah.surahNumber}:{ayah.ayahNumber} · Page {ayah.page}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ReflectionSplitView({ content, onComplete }: ReflectionSplitViewProps) {
    if (!content) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                Loading today's learning…
            </div>
        );
    }

    const isMultiAyah = content.type !== 'ayah' && content.ayahs && content.ayahs.length > 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px] bg-[#0a0a0a] text-white p-6 md:p-10 rounded-3xl border border-zinc-800 shadow-2xl">
            {/* Left Panel: The Source */}
            {isMultiAyah
                ? <MultiAyahPanel content={content} />
                : <SingleAyahPanel content={content} />
            }

            {/* Right Panel: Practical Context & Action */}
            <div className="md:col-span-7 bg-[#141414] rounded-2xl border border-zinc-800/60 p-6 md:p-8 flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-4">{content.title}</h3>

                <p className="text-zinc-400 text-lg leading-relaxed mb-8 flex-1">
                    {content.context}
                </p>

                <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-xl p-6 mb-8">
                    <h4 className="text-sm font-semibold text-emerald-500 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Action Item
                    </h4>
                    <p className="text-zinc-300 leading-relaxed">
                        {content.actionItem}
                    </p>
                </div>

                <Button
                    onClick={onComplete}
                    variant="secondary"
                    className="w-full py-4 rounded-xl font-semibold bg-zinc-800/50 hover:bg-emerald-500/20 text-zinc-200 hover:text-emerald-400 border border-zinc-700/50 hover:border-emerald-500/30 transition-all duration-300"
                >
                    I completed this reflection
                </Button>
            </div>
        </div>
    );
}

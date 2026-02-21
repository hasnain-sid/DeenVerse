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

/** Renders a single ayah view (for the "ayah" tab) */
function SingleAyahPanel({ content }: { content: DailyLearningContent }) {
    return (
        <div className="md:col-span-5 bg-gradient-to-br from-card to-background rounded-2xl border border-border p-6 flex flex-col justify-center">
            <div className="text-right mb-8">
                <p className="font-arabic text-3xl leading-relaxed text-primary">
                    {content.arabic}
                </p>
            </div>
            <div>
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-semibold">
                    Translation
                </h4>
                <p className="text-foreground font-medium">
                    "{content.translation}"
                </p>
                <p className="text-sm text-primary/80 mt-2">
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Panel: The Source */}
            {isMultiAyah
                ? <MultiAyahPanel content={content} />
                : <SingleAyahPanel content={content} />
            }

            {/* Right Panel: Practical Context & Action */}
            <div className="md:col-span-7 bg-card rounded-2xl border border-border p-6 md:p-8 flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">{content.title}</h3>

                <div className="prose prose-invert prose-sm text-muted-foreground mb-8 flex-1">
                    <p>{content.context}</p>
                </div>

                <div className="bg-background/50 p-4 rounded-xl border border-border mb-6">
                    <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Action Item
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        {content.actionItem}
                    </p>
                </div>

                <Button
                    onClick={onComplete}
                    variant="secondary"
                    className="w-full rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                    I completed this reflection
                </Button>
            </div>
        </div>
    );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ArrowRight, BookOpen } from 'lucide-react';
import { useTadabburAyahs, useSavePractice } from './api/useRuhani';
import { useAyahByVerseKey } from '../quran/useQuranReader';
import { useReflectionDraft } from './hooks/useReflectionDraft';
import { DraftStatus } from './components/DraftStatus';
import {
    GuidedReflectionForm,
    emptyGuidedValue,
    hasGuidedContent,
    toGuidedAnswers,
    type GuidedReflectionValue,
} from './components/GuidedReflectionForm';
import type { TadabburAyah } from './types';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

/**
 * The Tadabbur methodology, applied to any ayah that isn't individually curated.
 * Comprehension → personal application → action.
 */
const GENERIC_TADABBUR_QUESTIONS = [
    'What is Allah telling us in this verse?',
    'How does this verse relate to your life right now?',
    'What is one thing you will change after reading this?',
];

export function TadabburPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const preselectedAyahKey = location.state?.preselectedAyahKey as string | undefined;
    const linkedPracticeId = location.state?.linkedPracticeId as string | undefined;

    const { data: ayahs, isLoading } = useTadabburAyahs();
    const { mutate: savePractice, isPending } = useSavePractice();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const [selectedAyah, setSelectedAyah] = useState<TadabburAyah | null>(null);
    const [value, setValue] = useState<GuidedReflectionValue>(emptyGuidedValue(0));
    const [isSaved, setIsSaved] = useState(false);
    const [savedPracticeId, setSavedPracticeId] = useState<string | null>(null);

    const curated = useMemo(
        () => ayahs?.find((a) => a.verseKey === preselectedAyahKey) ?? null,
        [ayahs, preselectedAyahKey]
    );

    // Any of the ~6,200 ayahs without a curated entry is still worth pondering —
    // fetch the canonical text and apply the generic methodology.
    const needsFetch = !!preselectedAyahKey && !!ayahs && !curated;
    const { data: fetchedAyah, isLoading: isFetchingAyah, isError: ayahFetchFailed } =
        useAyahByVerseKey(preselectedAyahKey, needsFetch);

    useEffect(() => {
        if (curated) {
            setSelectedAyah(curated);
            return;
        }
        if (fetchedAyah) {
            setSelectedAyah({
                slug: fetchedAyah.referenceId,
                verseKey: fetchedAyah.referenceId,
                arabicText: fetchedAyah.arabic,
                translation: fetchedAyah.translation,
                context: '',
                guidedQuestions: GENERIC_TADABBUR_QUESTIONS,
                linkedTafakkurSlugs: [],
                theme: '',
            });
        }
    }, [curated, fetchedAyah]);

    const prompts = selectedAyah?.guidedQuestions ?? [];

    const { restored, savedAt, clearDraft } = useReflectionDraft<GuidedReflectionValue>(
        {
            practiceType: 'tadabbur',
            sourceRef: selectedAyah?.verseKey ?? null,
            sourceTitle: selectedAyah ? `Quran ${selectedAyah.verseKey}` : undefined,
        },
        value
    );

    useEffect(() => {
        setValue(emptyGuidedValue(prompts.length));
        setIsSaved(false);
        setSavedPracticeId(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAyah?.verseKey]);

    useEffect(() => {
        if (!restored) return;
        setValue({
            answers: Array.from({ length: prompts.length }, (_, i) => restored.answers?.[i] ?? ''),
            freeform: restored.freeform ?? '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restored]);

    const canSave = hasGuidedContent(value);

    const handleSave = () => {
        if (!canSave || !selectedAyah) return;

        if (!isAuthenticated) {
            toast.error('Please log in to save your reflection — your writing is kept on this device.');
            navigate('/login', { state: { from: location } });
            return;
        }

        savePractice(
            {
                practiceType: 'tadabbur',
                sourceRef: selectedAyah.verseKey,
                sourceTitle: `Quran ${selectedAyah.verseKey}`,
                guidedAnswers: toGuidedAnswers(prompts, value),
                reflectionText: value.freeform.trim() || undefined,
                linkedPracticeId: linkedPracticeId || undefined,
            },
            {
                onSuccess: (saved) => {
                    setIsSaved(true);
                    setSavedPracticeId(saved?._id ?? null);
                    clearDraft();
                }
            }
        );
    };

    if (isLoading || (needsFetch && isFetchingAyah)) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-500">
                <div role="status" aria-live="polite">
                    <div className="h-6 w-6 rounded-full border-2 border-zinc-500 dark:border-zinc-500 border-t-transparent animate-spin" />
                    <span className="sr-only">Loading verse…</span>
                </div>
            </div>
        );
    }

    if (!selectedAyah) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800/50 transition-colors duration-500">
                <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
                    <button
                        onClick={() => navigate('/ruhani')}
                        className="flex items-center text-sm tracking-wider text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-12 transition-colors uppercase rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Hub
                    </button>

                    <div className="mb-12">
                        <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100 mb-2">Tadabbur</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-light">Ponder the words of Allah deeply today.</p>
                    </div>

                    {ayahFetchFailed && preselectedAyahKey && (
                        <div className="mb-8 p-4 rounded-2xl border border-amber-300 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20">
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                We couldn't load Quran {preselectedAyahKey} just now. Choose a verse below, or try again in a moment.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        {ayahs?.map((ayah) => (
                            <button
                                key={ayah.slug}
                                onClick={() => setSelectedAyah(ayah)}
                                className="group text-left p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20 hover:bg-zinc-50 hover:dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-4 max-w-2xl">
                                        <div className="text-zinc-600 dark:text-zinc-400 text-sm tracking-widest uppercase font-semibold">Quran {ayah.verseKey}</div>
                                        <p lang="ar" dir="rtl" className="text-xl text-zinc-800 dark:text-zinc-200 font-arabic text-right leading-loose mb-2">{ayah.arabicText}</p>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-base italic">"{ayah.translation}"</p>
                                    </div>
                                    <div className="text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors ml-4 mt-2" aria-hidden="true">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800/50 transition-colors duration-500">
            <div className="max-w-3xl mx-auto py-12 px-6 animate-in fade-in duration-500">
                <button
                    onClick={() => {
                        if (preselectedAyahKey) navigate('/ruhani');
                        else setSelectedAyah(null);
                    }}
                    className="flex items-center text-sm tracking-wider text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-12 transition-colors uppercase rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {preselectedAyahKey ? 'Back' : 'Ayahs'}
                </button>

                <div className="space-y-12">
                    <div className="text-center space-y-8 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/40 bg-white dark:bg-zinc-900/30">
                        <div className="text-zinc-600 dark:text-zinc-400 text-sm tracking-widest uppercase font-semibold">Quran {selectedAyah.verseKey}</div>

                        <p lang="ar" dir="rtl" className="text-3xl font-arabic text-zinc-900 dark:text-zinc-100 leading-loose mx-auto max-w-2xl">
                            {selectedAyah.arabicText}
                        </p>

                        <p className="text-zinc-700 dark:text-zinc-300 text-lg italic font-serif opacity-90 mx-auto max-w-xl">
                            "{selectedAyah.translation}"
                        </p>

                        {selectedAyah.context && (
                            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/50">
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-xl mx-auto">
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-300">Context:</span> {selectedAyah.context}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm tracking-widest uppercase text-zinc-600 dark:text-zinc-400 font-semibold mb-6 flex items-center">
                            <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-700 mr-4" aria-hidden="true"></span>
                            Guided Reflection
                            <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-700 ml-4" aria-hidden="true"></span>
                        </h3>

                        <GuidedReflectionForm
                            prompts={prompts}
                            value={value}
                            onChange={setValue}
                            idPrefix="tadabbur"
                            disabled={isSaved || isPending}
                        />

                        <div className="flex items-center justify-between pt-4 gap-4 flex-wrap">
                            <DraftStatus savedAt={savedAt} isAuthenticated={isAuthenticated} />

                            {!isSaved ? (
                                <button
                                    onClick={handleSave}
                                    disabled={!canSave || isPending}
                                    className={`flex items-center space-x-2 px-8 py-3 rounded-full text-sm tracking-widest uppercase font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950 ${canSave
                                        ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white border border-transparent'
                                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                                        }`}
                                >
                                    {isPending ? 'Saving...' : 'Save Reflection'}
                                </button>
                            ) : (
                                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                                    <button
                                        onClick={() => navigate('/ruhani')}
                                        className="px-6 py-3 rounded-full text-sm tracking-widest uppercase font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                                    >
                                        Return to Hub
                                    </button>

                                    {selectedAyah.linkedTraitSlug && (
                                        <button
                                            onClick={() => navigate('/ruhani/tazkia', {
                                                state: {
                                                    preselectedTraitSlug: selectedAyah.linkedTraitSlug,
                                                    linkedPracticeId: savedPracticeId,
                                                }
                                            })}
                                            className="flex items-center space-x-2 px-8 py-3 rounded-full text-sm tracking-widest uppercase font-semibold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950"
                                        >
                                            Continue to Tazkia
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

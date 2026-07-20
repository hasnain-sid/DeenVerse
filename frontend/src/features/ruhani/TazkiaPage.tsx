import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Check, ArrowRight } from 'lucide-react';
import { useTazkiaTraits, useSavePractice } from './api/useRuhani';
import { useReflectionDraft } from './hooks/useReflectionDraft';
import { DraftStatus } from './components/DraftStatus';
import {
    GuidedReflectionForm,
    emptyGuidedValue,
    hasGuidedContent,
    toGuidedAnswers,
    type GuidedReflectionValue,
} from './components/GuidedReflectionForm';
import type { TazkiaTrait } from './types';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const DEFAULT_HABITS = [
    { id: 'fajr', text: 'Prayed Fajr on time', done: false },
    { id: 'quran', text: 'Read a portion of Quran', done: false },
    { id: 'smile', text: 'Consciously smiled at someone', done: false },
];

const RATING_LABELS = ['Struggled', 'Slipping', 'Mixed', 'Steady', 'Alhamdulillah'];

/** Keyed by today's date so habits reset daily */
function getTodayKey() {
    return `ruhani-habits-${new Date().toISOString().slice(0, 10)}`;
}

function loadHabits() {
    try {
        const stored = localStorage.getItem(getTodayKey());
        if (stored) return JSON.parse(stored) as typeof DEFAULT_HABITS;
    } catch { /* corrupted data — fall back */ }
    return DEFAULT_HABITS.map((h) => ({ ...h }));
}

function saveHabits(habits: typeof DEFAULT_HABITS) {
    try {
        localStorage.setItem(getTodayKey(), JSON.stringify(habits));
    } catch { /* quota exceeded — ignore */ }
}

export function TazkiaPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const linkedPracticeId = location.state?.linkedPracticeId as string | undefined;

    const { data: traits, isLoading } = useTazkiaTraits();
    const { mutate: savePractice, isPending } = useSavePractice();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const [selectedTrait, setSelectedTrait] = useState<TazkiaTrait | null>(null);
    const [value, setValue] = useState<GuidedReflectionValue>(emptyGuidedValue(0));
    const [rating, setRating] = useState<number | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const prompts = selectedTrait?.muhasabaPrompts ?? [];

    // Auto-select trait if provided via router state
    useEffect(() => {
        if (location.state?.preselectedTraitSlug && traits) {
            const trait = traits.find((t: TazkiaTrait) => t.slug === location.state.preselectedTraitSlug);
            if (trait) setSelectedTrait(trait);
        }
    }, [location.state?.preselectedTraitSlug, traits]);

    const { restored, savedAt, clearDraft } = useReflectionDraft<GuidedReflectionValue>(
        {
            practiceType: 'tazkia',
            sourceRef: selectedTrait?.slug ?? null,
            sourceTitle: selectedTrait?.title,
        },
        value
    );

    useEffect(() => {
        setValue(emptyGuidedValue(prompts.length));
        setRating(null);
        setIsSaved(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTrait?.slug]);

    useEffect(() => {
        if (!restored) return;
        setValue({
            answers: Array.from({ length: prompts.length }, (_, i) => restored.answers?.[i] ?? ''),
            freeform: restored.freeform ?? '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restored]);

    // Daily habits state — persisted in localStorage, keyed by today's date
    const [habits, setHabits] = useState(loadHabits);

    const toggleHabit = useCallback((id: string) => {
        setHabits((prev) => {
            const next = prev.map(h => h.id === id ? { ...h, done: !h.done } : h);
            saveHabits(next);
            return next;
        });
    }, []);

    const canSave = hasGuidedContent(value) && rating !== null;

    const handleSave = () => {
        if (!canSave || !selectedTrait) return;

        if (!isAuthenticated) {
            toast.error('Please log in to save your reflection — your writing is kept on this device.');
            navigate('/login', { state: { from: location } });
            return;
        }

        savePractice(
            {
                practiceType: 'tazkia',
                sourceRef: selectedTrait.slug,
                sourceTitle: selectedTrait.title,
                guidedAnswers: toGuidedAnswers(prompts, value),
                reflectionText: value.freeform.trim() || undefined,
                traitRating: rating ?? undefined,
                habitChecks: habits.map(h => ({ habit: h.text, completed: h.done })),
                linkedPracticeId: linkedPracticeId || undefined,
            },
            {
                onSuccess: () => {
                    setIsSaved(true);
                    clearDraft();
                    // Deliberately no auto-navigate: this is the emotional peak of the
                    // session, and the spiral continues from here rather than ending.
                }
            }
        );
    };

    const handleContinueToTafakkur = () => {
        if (!selectedTrait?.suggestedTafakkurSlug) return;
        navigate('/ruhani/tafakkur', {
            state: { preselectedTopicSlug: selectedTrait.suggestedTafakkurSlug }
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-500">
                <div role="status" aria-live="polite">
                    <div className="h-6 w-6 rounded-full border-2 border-zinc-500 dark:border-zinc-500 border-t-transparent animate-spin" />
                    <span className="sr-only">Loading character traits…</span>
                </div>
            </div>
        );
    }

    if (!selectedTrait) {
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
                        <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100 mb-2">Tazkia</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-light">Purify your soul and build beautiful character.</p>
                    </div>

                    {/* Daily Habits Quick Check */}
                    <div className="mb-12 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/30 bg-white dark:bg-zinc-900/10">
                        <h3 id="daily-muhasaba-heading" className="text-sm tracking-widest uppercase text-zinc-600 dark:text-zinc-400 font-semibold mb-6">Daily Muhasaba (Self-Check)</h3>
                        <div className="space-y-4" role="group" aria-labelledby="daily-muhasaba-heading">
                            {habits.map(habit => (
                                <button
                                    key={habit.id}
                                    onClick={() => toggleHabit(habit.id)}
                                    role="checkbox"
                                    aria-checked={habit.done}
                                    className="flex items-center w-full group rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
                                >
                                    <div aria-hidden="true" className={`w-5 h-5 rounded-md border mr-4 flex items-center justify-center transition-colors ${habit.done ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100' : 'border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-500'
                                        }`}>
                                        {habit.done && <Check className="w-3 h-3 text-white dark:text-zinc-950" />}
                                    </div>
                                    <span className={`text-sm transition-colors ${habit.done ? 'text-zinc-500 dark:text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white'}`}>
                                        {habit.text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <h3 className="text-sm tracking-widest uppercase text-zinc-600 dark:text-zinc-400 font-semibold mb-6">Traits to work on</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {traits?.map((trait) => (
                            <button
                                key={trait.slug}
                                onClick={() => setSelectedTrait(trait)}
                                className="text-left p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20 hover:bg-zinc-50 hover:dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
                            >
                                <h3 className="text-lg text-zinc-800 dark:text-zinc-200 font-medium mb-1">{trait.title}</h3>
                                <p lang="ar" dir="rtl" className="text-sm text-zinc-600 dark:text-zinc-400 font-arabic mb-4">{trait.arabicTitle}</p>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{trait.description}</p>
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
                    onClick={() => setSelectedTrait(null)}
                    className="flex items-center text-sm tracking-wider text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-12 transition-colors uppercase rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Traits
                </button>

                <div className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-light text-zinc-900 dark:text-zinc-100">{selectedTrait.title}</h2>
                        <p lang="ar" dir="rtl" className="text-xl font-arabic text-zinc-600 dark:text-zinc-400">{selectedTrait.arabicTitle}</p>
                        <p className="text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed max-w-xl mx-auto font-light mt-6">
                            {selectedTrait.description}
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/40 bg-white dark:bg-zinc-900/30">
                        <div className="text-center mb-6">
                            <span className="text-xs tracking-widest uppercase text-zinc-600 dark:text-zinc-500 font-semibold">Prophetic Guidance</span>
                        </div>
                        <p className="text-zinc-800 dark:text-zinc-300 text-center text-lg leading-loose font-serif italic">
                            "{selectedTrait.primaryHadith}"
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm tracking-widest uppercase text-zinc-600 dark:text-zinc-400 font-semibold mb-6 flex items-center">
                                <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-700 mr-4" aria-hidden="true"></span>
                                Self-Assessment
                                <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-700 ml-4" aria-hidden="true"></span>
                            </h3>

                            <div className="mb-8 p-6 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl bg-white dark:bg-zinc-900/20">
                                <label htmlFor="trait-rating" className="block text-zinc-700 dark:text-zinc-300 text-sm mb-4 text-center">
                                    How well did you embody {selectedTrait.title} this week?
                                </label>
                                {rating === null && (
                                    <p id="trait-rating-hint" className="text-xs text-amber-700 dark:text-amber-400 text-center mb-3">
                                        Please select a rating
                                    </p>
                                )}
                                <input
                                    id="trait-rating"
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="1"
                                    value={rating ?? 3}
                                    onChange={(e) => setRating(parseInt(e.target.value))}
                                    disabled={isSaved}
                                    aria-valuemin={1}
                                    aria-valuemax={5}
                                    aria-valuenow={rating ?? 3}
                                    aria-valuetext={
                                        rating === null
                                            ? 'No rating selected'
                                            : `${rating} of 5 — ${RATING_LABELS[rating - 1]}`
                                    }
                                    aria-describedby={rating === null ? 'trait-rating-hint' : undefined}
                                    className="w-full accent-zinc-500 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                                />
                                <div className="flex justify-between text-xs tracking-widest uppercase text-zinc-600 dark:text-zinc-500 mt-4 font-semibold" aria-hidden="true">
                                    <span>Struggled</span>
                                    <span>Alhamdulillah</span>
                                </div>
                                {rating !== null && (
                                    <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-3" aria-live="polite">
                                        {RATING_LABELS[rating - 1]}
                                    </p>
                                )}
                            </div>

                            <GuidedReflectionForm
                                prompts={prompts}
                                value={value}
                                onChange={setValue}
                                idPrefix="tazkia"
                                disabled={isSaved || isPending}
                                freeformLabel="Your commitment — what will you do differently?"
                                freeformPlaceholder={`Example: ${selectedTrait.actionTemplate}`}
                            />

                            <div className="flex items-center justify-between pt-6 gap-4 flex-wrap">
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
                                        {isPending ? 'Saving...' : 'Commit Action'}
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 flex-wrap justify-end">
                                        <button
                                            onClick={() => navigate('/ruhani')}
                                            className="px-6 py-3 rounded-full text-sm tracking-widest uppercase font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                                        >
                                            Return to Hub
                                        </button>

                                        {selectedTrait.suggestedTafakkurSlug && (
                                            <button
                                                onClick={handleContinueToTafakkur}
                                                className="flex items-center space-x-2 px-8 py-3 rounded-full text-sm tracking-widest uppercase font-semibold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950"
                                            >
                                                Continue to Tafakkur
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* The bridge that closes the spiral back to contemplation */}
                            {isSaved && selectedTrait.transitionPrompt && (
                                <div className="mt-8 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-900/20 animate-in fade-in">
                                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-center font-light">
                                        {selectedTrait.transitionPrompt}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import { useTazkiaTraits, useSavePractice } from './api/useRuhani';
import type { TazkiaTrait } from './types';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const DEFAULT_HABITS = [
    { id: 'fajr', text: 'Prayed Fajr on time', done: false },
    { id: 'quran', text: 'Read a portion of Quran', done: false },
    { id: 'smile', text: 'Consciously smiled at someone', done: false },
];

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
    const { data: traits, isLoading } = useTazkiaTraits();
    const { mutate: savePractice, isPending } = useSavePractice();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const [selectedTrait, setSelectedTrait] = useState<TazkiaTrait | null>(null);
    const [reflection, setReflection] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-select trait if provided via router state
    useEffect(() => {
        if (location.state?.preselectedTraitSlug && traits) {
            const trait = traits.find((t: TazkiaTrait) => t.slug === location.state.preselectedTraitSlug);
            if (trait) setSelectedTrait(trait);
        }
    }, [location.state?.preselectedTraitSlug, traits]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Daily habits state — persisted in localStorage, keyed by today's date
    const [habits, setHabits] = useState(loadHabits);

    const toggleHabit = useCallback((id: string) => {
        setHabits((prev) => {
            const next = prev.map(h => h.id === id ? { ...h, done: !h.done } : h);
            saveHabits(next);
            return next;
        });
    }, []);

    const handleSave = () => {
        if (!reflection.trim() || !selectedTrait || rating === null) return;

        if (!isAuthenticated) {
            toast.error('Please log in to save your reflection');
            navigate('/login');
            return;
        }

        savePractice(
            {
                practiceType: 'tazkia',
                sourceRef: selectedTrait.slug,
                sourceTitle: selectedTrait.title,
                reflectionText: reflection,
                traitRating: rating,
                habitChecks: habits.map(h => ({ habit: h.text, completed: h.done })),
            },
            {
                onSuccess: () => {
                    setIsSaved(true);
                    timerRef.current = setTimeout(() => {
                        navigate('/ruhani');
                    }, 1500);
                }
            }
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-500">
                <div className="h-6 w-6 rounded-full border-2 border-zinc-500 dark:border-zinc-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!selectedTrait) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800/50 transition-colors duration-500">
                <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
                    <button
                        onClick={() => navigate('/ruhani')}
                        className="flex items-center text-sm tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mb-12 transition-colors uppercase"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Hub
                    </button>

                    <div className="mb-12">
                        <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100 mb-2">Tazkia</h2>
                        <p className="text-zinc-500 dark:text-zinc-500 font-light">Purify your soul and build beautiful character.</p>
                    </div>

                    {/* Daily Habits Quick Check */}
                    <div className="mb-12 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/30 bg-white dark:bg-zinc-900/10">
                        <h3 className="text-sm tracking-widest uppercase text-zinc-400 dark:text-zinc-500 font-semibold mb-6">Daily Muhasaba (Self-Check)</h3>
                        <div className="space-y-4">
                            {habits.map(habit => (
                                <button
                                    key={habit.id}
                                    onClick={() => toggleHabit(habit.id)}
                                    className="flex items-center w-full group"
                                >
                                    <div className={`w-5 h-5 rounded-md border mr-4 flex items-center justify-center transition-colors ${habit.done ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100' : 'border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-500'
                                        }`}>
                                        {habit.done && <Check className="w-3 h-3 text-white dark:text-zinc-950" />}
                                    </div>
                                    <span className={`text-sm transition-colors ${habit.done ? 'text-zinc-400 dark:text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white'}`}>
                                        {habit.text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <h3 className="text-sm tracking-widest uppercase text-zinc-400 dark:text-zinc-500 font-semibold mb-6">Traits to work on</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {traits?.map((trait) => (
                            <button
                                key={trait.slug}
                                onClick={() => setSelectedTrait(trait)}
                                className="text-left p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20 hover:bg-zinc-50 hover:dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-300"
                            >
                                <h3 className="text-lg text-zinc-800 dark:text-zinc-200 font-medium mb-1">{trait.title}</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-500 font-arabic mb-4">{trait.arabicTitle}</p>
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
                    className="flex items-center text-sm tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mb-12 transition-colors uppercase"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Traits
                </button>

                <div className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-light text-zinc-900 dark:text-zinc-100">{selectedTrait.title}</h2>
                        <p className="text-xl font-arabic text-zinc-500 dark:text-zinc-500">{selectedTrait.arabicTitle}</p>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto font-light mt-6">
                            {selectedTrait.description}
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/40 bg-white dark:bg-zinc-900/30">
                        <div className="text-center mb-6">
                            <span className="text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-600 font-semibold">Prophetic Guidance</span>
                        </div>
                        <p className="text-zinc-800 dark:text-zinc-300 text-center text-lg leading-loose font-serif italic">
                            "{selectedTrait.primaryHadith}"
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm tracking-widest uppercase text-zinc-500 dark:text-zinc-500 font-semibold mb-6 flex items-center">
                                <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-700 mr-4"></span>
                                Self-Assessment
                                <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-700 ml-4"></span>
                            </h3>

                            <div className="mb-8 p-6 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl bg-white dark:bg-zinc-900/20">
                                <label className="block text-zinc-600 dark:text-zinc-400 text-sm mb-4 text-center">How well did you embody this trait this week?</label>
                                {rating === null && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center mb-3">Please select a rating</p>
                                )}
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={rating ?? 3}
                                    onChange={(e) => setRating(parseInt(e.target.value))}
                                    className="w-full accent-zinc-500 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-600 mt-4 font-semibold">
                                    <span>Struggled</span>
                                    <span>Alhamdulillah</span>
                                </div>
                            </div>

                            <ul className="space-y-4 text-zinc-600 dark:text-zinc-400 mb-8 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800/50">
                                {selectedTrait.muhasabaPrompts?.map((q, idx) => (
                                    <li key={idx} className="leading-relaxed">{q}</li>
                                ))}
                            </ul>

                            <div className="relative">
                                <textarea
                                    value={reflection}
                                    onChange={(e) => setReflection(e.target.value)}
                                    placeholder={`Commit to an action. What will you do differently?\nExample: ${selectedTrait.actionTemplate}`}
                                    className="w-full bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-6 text-zinc-900 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600/50 focus:bg-zinc-50 dark:focus:bg-zinc-900/50 transition-all min-h-[150px] resize-none"
                                />
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={handleSave}
                                    disabled={!reflection.trim() || rating === null || isSaved || isPending}
                                    className={`flex items-center space-x-2 px-8 py-3 rounded-full text-sm tracking-widest uppercase font-semibold transition-all duration-300 ${isSaved
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800/50'
                                        : reflection.trim() && rating !== null
                                            ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white border border-transparent'
                                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                                        }`}
                                >
                                    {isSaved ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Saved
                                        </>
                                    ) : isPending ? (
                                        'Saving...'
                                    ) : (
                                        'Commit Action'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

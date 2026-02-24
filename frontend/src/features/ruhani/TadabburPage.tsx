import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ArrowRight, BookOpen } from 'lucide-react';
import { useTadabburAyahs, useSavePractice } from './api/useRuhani';
import type { TadabburAyah } from './types';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export function TadabburPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const preselectedAyahKey = location.state?.preselectedAyahKey as string | undefined;
    const { data: ayahs, isLoading } = useTadabburAyahs();
    const { mutate: savePractice, isPending } = useSavePractice();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [selectedAyah, setSelectedAyah] = useState<TadabburAyah | null>(null);
    const [reflection, setReflection] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    // Auto-select if preselectedAyahKey is provided (e.g., coming from Tafakkur)
    useEffect(() => {
        if (preselectedAyahKey && ayahs) {
            const ayah = ayahs.find(a => a.verseKey === preselectedAyahKey);
            if (ayah) setSelectedAyah(ayah);
        }
    }, [preselectedAyahKey, ayahs]);

    const handleSave = () => {
        if (!reflection.trim() || !selectedAyah) return;

        if (!isAuthenticated) {
            toast.error('Please log in to save your reflection');
            navigate('/login');
            return;
        }

        savePractice(
            {
                practiceType: 'tadabbur',
                sourceRef: selectedAyah.verseKey,
                sourceTitle: `Quran ${selectedAyah.verseKey}`,
                reflectionText: reflection,
            },
            {
                onSuccess: () => {
                    setIsSaved(true);
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

    if (!selectedAyah) {
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
                        <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100 mb-2">Tadabbur</h2>
                        <p className="text-zinc-500 dark:text-zinc-500 font-light">Ponder the words of Allah deeply today.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {ayahs?.map((ayah) => (
                            <button
                                key={ayah.slug}
                                onClick={() => setSelectedAyah(ayah)}
                                className="group text-left p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20 hover:bg-zinc-50 hover:dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-4 max-w-2xl">
                                        <div className="text-zinc-500 dark:text-zinc-400 text-sm tracking-widest uppercase font-semibold">Quran {ayah.verseKey}</div>
                                        <p className="text-xl text-zinc-800 dark:text-zinc-200 font-arabic text-right leading-loose dir-rtl mb-2">{ayah.arabicText}</p>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-base italic">"{ayah.translation}"</p>
                                    </div>
                                    <div className="text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors ml-4 mt-2">
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
                    className="flex items-center text-sm tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mb-12 transition-colors uppercase"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {preselectedAyahKey ? 'Back' : 'Ayahs'}
                </button>

                {/* Main contemplation card */}
                <div className="space-y-12">
                    <div className="text-center space-y-8 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/40 bg-white dark:bg-zinc-900/30">
                        <div className="text-zinc-500 dark:text-zinc-500 text-sm tracking-widest uppercase font-semibold">Quran {selectedAyah.verseKey}</div>

                        <p className="text-3xl font-arabic text-zinc-900 dark:text-zinc-100 leading-loose dir-rtl mx-auto max-w-2xl">
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
                        <h3 className="text-sm tracking-widest uppercase text-zinc-500 dark:text-zinc-500 font-semibold mb-6 flex items-center">
                            <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-700 mr-4"></span>
                            Guided Reflection
                            <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-700 ml-4"></span>
                        </h3>

                        <ul className="space-y-4 text-zinc-600 dark:text-zinc-400 mb-8 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800/50">
                            {selectedAyah.guidedQuestions.map((q, idx) => (
                                <li key={idx} className="leading-relaxed">{q}</li>
                            ))}
                        </ul>

                        <div className="relative">
                            <textarea
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                placeholder="How does this verse relate to your life? What will you change?"
                                className="w-full bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-6 text-zinc-900 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600/50 focus:bg-zinc-50 dark:focus:bg-zinc-900/50 transition-all min-h-[200px] resize-none"
                                disabled={isSaved || isPending}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            {!isSaved ? (
                                <button
                                    onClick={handleSave}
                                    disabled={!reflection.trim() || isPending}
                                    className={`flex items-center space-x-2 px-8 py-3 rounded-full text-sm tracking-widest uppercase font-semibold transition-all duration-300 ${reflection.trim()
                                        ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white border border-transparent'
                                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                                        }`}
                                >
                                    {isPending ? 'Saving...' : 'Save Reflection'}
                                </button>
                            ) : (
                                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                                    <button
                                        onClick={() => navigate('/ruhani')}
                                        className="px-6 py-3 rounded-full text-sm tracking-widest uppercase font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                                    >
                                        Return to Hub
                                    </button>

                                    {selectedAyah.linkedTraitSlug && (
                                        <button
                                            onClick={() => navigate('/ruhani/tazkia', { state: { preselectedTraitSlug: selectedAyah.linkedTraitSlug } })}
                                            className="flex items-center space-x-2 px-8 py-3 rounded-full text-sm tracking-widest uppercase font-semibold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white transition-all"
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

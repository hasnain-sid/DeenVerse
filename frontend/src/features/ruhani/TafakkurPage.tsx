import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useRuhaniTopics, useSavePractice } from './api/useRuhani';
import type { TafakkurTopic } from './types';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export function TafakkurPage() {
    const navigate = useNavigate();
    const { data: topics, isLoading } = useRuhaniTopics();
    const { mutate: savePractice, isPending } = useSavePractice();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const [selectedTopic, setSelectedTopic] = useState<TafakkurTopic | null>(null);
    const [reflection, setReflection] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [isContinuing, setIsContinuing] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleSave = () => {
        if (!reflection.trim() || !selectedTopic) return;

        if (!isAuthenticated) {
            toast.error('Please log in to save your reflection');
            navigate('/login');
            return;
        }

        savePractice(
            {
                practiceType: 'tafakkur',
                sourceRef: selectedTopic.slug,
                sourceTitle: selectedTopic.title,
                reflectionText: reflection,
            },
            {
                onSuccess: () => {
                    setIsSaved(true);
                }
            }
        );
    };

    const handleReturnToHub = () => {
        setIsContinuing(true);
        navigate('/ruhani');
    };

    const handleContinueToTadabbur = () => {
        if (!selectedTopic?.linkedAyahKey) return;
        setIsContinuing(true);
        navigate('/ruhani/tadabbur', {
            state: { preselectedAyahKey: selectedTopic.linkedAyahKey }
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-500">
                <div className="h-6 w-6 rounded-full border-2 border-zinc-500 dark:border-zinc-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!selectedTopic) {
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
                        <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100 mb-2">Tafakkur</h2>
                        <p className="text-zinc-500 dark:text-zinc-500 font-light">Choose a sign in creation to contemplate today.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {topics?.map((topic) => (
                            <button
                                key={topic.slug}
                                onClick={() => setSelectedTopic(topic)}
                                className="group text-left p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20 hover:bg-zinc-50 hover:dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-300"
                            >
                                <div className="text-3xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity">{topic.icon}</div>
                                <h3 className="text-lg text-zinc-800 dark:text-zinc-200 font-medium mb-1">{topic.title}</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-4">{topic.arabicTitle}</p>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 leading-relaxed">{topic.contemplate}</p>
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
                    onClick={() => setSelectedTopic(null)}
                    className="flex items-center text-sm tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mb-12 transition-colors uppercase"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Topics
                </button>

                {/* Main contemplation card */}
                <div className="space-y-12">
                    <div className="text-center space-y-6">
                        <div className="text-4xl opacity-80">{selectedTopic.icon}</div>
                        <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100">{selectedTopic.title}</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto font-light">
                            {selectedTopic.contemplate}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm tracking-widest uppercase text-zinc-500 dark:text-zinc-500 font-semibold mb-6 flex items-center">
                            <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-700 mr-4"></span>
                            Guided Reflection
                            <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-700 ml-4"></span>
                        </h3>

                        <ul className="space-y-4 text-zinc-600 dark:text-zinc-400 mb-8 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800/50">
                            {selectedTopic.guidedQuestions?.map((q, idx) => (
                                <li key={idx} className="leading-relaxed">{q}</li>
                            ))}
                        </ul>

                        <div className="relative">
                            <textarea
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                placeholder="Write your reflection here... Take your time."
                                className="w-full bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-6 text-zinc-900 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600/50 focus:bg-zinc-50 dark:focus:bg-zinc-900/50 transition-all min-h-[200px] resize-none"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            {!isSaved ? (
                                <button
                                    onClick={handleSave}
                                    disabled={!reflection.trim() || isPending}
                                    className={`flex items-center space-x-2 px-8 py-3 rounded-full text-sm tracking-widest uppercase font-semibold transition-all duration-300 ${isSaved
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800/50'
                                        : reflection.trim()
                                            ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white border border-transparent'
                                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                                        }`}
                                >
                                    {isPending ? 'Saving...' : 'Save Reflection'}
                                </button>
                            ) : (
                                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                                    <button
                                        onClick={handleReturnToHub}
                                        disabled={isContinuing}
                                        className="px-6 py-3 rounded-full text-sm tracking-widest uppercase font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                                    >
                                        Return to Hub
                                    </button>

                                    {selectedTopic.linkedAyahKey && (
                                        <button
                                            onClick={handleContinueToTadabbur}
                                            disabled={isContinuing}
                                            className="flex items-center space-x-2 px-8 py-3 rounded-full text-sm tracking-widest uppercase font-semibold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white transition-all disabled:opacity-50"
                                        >
                                            Continue to Tadabbur
                                            {/* <ArrowRight className="w-4 h-4 ml-2" /> */}
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

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useRuhaniTopics, useSavePractice } from './api/useRuhani';
import { useReflectionDraft } from './hooks/useReflectionDraft';
import { DraftStatus } from './components/DraftStatus';
import {
    GuidedReflectionForm,
    emptyGuidedValue,
    hasGuidedContent,
    toGuidedAnswers,
    type GuidedReflectionValue,
} from './components/GuidedReflectionForm';
import type { TafakkurTopic } from './types';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export function TafakkurPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: topics, isLoading } = useRuhaniTopics();
    const { mutate: savePractice, isPending } = useSavePractice();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const [selectedTopic, setSelectedTopic] = useState<TafakkurTopic | null>(null);
    const [value, setValue] = useState<GuidedReflectionValue>(emptyGuidedValue(0));
    const [isSaved, setIsSaved] = useState(false);
    const [isContinuing, setIsContinuing] = useState(false);
    /** Id of the practice just saved — carried forward so the spiral can be chained. */
    const [savedPracticeId, setSavedPracticeId] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const prompts = selectedTopic?.guidedQuestions ?? [];

    // Arriving from Tazkia — the spiral handing back to contemplation
    const preselectedTopicSlug = location.state?.preselectedTopicSlug as string | undefined;
    useEffect(() => {
        if (!preselectedTopicSlug || !topics) return;
        const topic = topics.find((t) => t.slug === preselectedTopicSlug);
        if (topic) setSelectedTopic(topic);
    }, [preselectedTopicSlug, topics]);

    const { restored, savedAt, clearDraft } = useReflectionDraft<GuidedReflectionValue>(
        {
            practiceType: 'tafakkur',
            sourceRef: selectedTopic?.slug ?? null,
            sourceTitle: selectedTopic?.title,
        },
        value
    );

    // Reset the editor when moving between topics
    useEffect(() => {
        setValue(emptyGuidedValue(prompts.length));
        setIsSaved(false);
        setSavedPracticeId(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTopic?.slug]);

    // Apply a recovered draft, tolerating a prompt count that has since changed
    useEffect(() => {
        if (!restored) return;
        setValue({
            answers: Array.from({ length: prompts.length }, (_, i) => restored.answers?.[i] ?? ''),
            freeform: restored.freeform ?? '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restored]);

    useEffect(() => {
        const timeout = timerRef.current;
        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, []);

    const canSave = hasGuidedContent(value);

    const handleSave = () => {
        if (!canSave || !selectedTopic) return;

        if (!isAuthenticated) {
            toast.error('Please log in to save your reflection — your writing is kept on this device.');
            navigate('/login', { state: { from: location } });
            return;
        }

        savePractice(
            {
                practiceType: 'tafakkur',
                sourceRef: selectedTopic.slug,
                sourceTitle: selectedTopic.title,
                guidedAnswers: toGuidedAnswers(prompts, value),
                reflectionText: value.freeform.trim() || undefined,
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

    const handleContinueToTadabbur = () => {
        if (!selectedTopic?.linkedAyahKey) return;
        setIsContinuing(true);
        navigate('/ruhani/tadabbur', {
            state: {
                preselectedAyahKey: selectedTopic.linkedAyahKey,
                linkedPracticeId: savedPracticeId,
            }
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-500">
                <div role="status" aria-live="polite">
                    <div className="h-6 w-6 rounded-full border-2 border-zinc-500 dark:border-zinc-500 border-t-transparent animate-spin" />
                    <span className="sr-only">Loading contemplation topics…</span>
                </div>
            </div>
        );
    }

    if (!selectedTopic) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800/50 transition-colors duration-500">
                <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
                    <button
                        onClick={() => navigate('/ruhani')}
                        className="flex items-center text-sm tracking-wider text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-12 transition-colors uppercase rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Hub
                    </button>

                    <div className="mb-12">
                        <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100 mb-2">Tafakkur</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-light">Choose a sign in creation to contemplate today.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {topics?.map((topic) => (
                            <button
                                key={topic.slug}
                                onClick={() => setSelectedTopic(topic)}
                                className="group text-left p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20 hover:bg-zinc-50 hover:dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
                            >
                                <div className="text-3xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden="true">{topic.icon}</div>
                                <h3 className="text-lg text-zinc-800 dark:text-zinc-200 font-medium mb-1">{topic.title}</h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 font-arabic" lang="ar" dir="rtl">{topic.arabicTitle}</p>
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
                    className="flex items-center text-sm tracking-wider text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-12 transition-colors uppercase rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Topics
                </button>

                <div className="space-y-12">
                    <div className="text-center space-y-6">
                        <div className="text-4xl opacity-80" aria-hidden="true">{selectedTopic.icon}</div>
                        <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100">{selectedTopic.title}</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed max-w-xl mx-auto font-light">
                            {selectedTopic.contemplate}
                        </p>
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
                            idPrefix="tafakkur"
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
                                        disabled={isContinuing}
                                        className="px-6 py-3 rounded-full text-sm tracking-widest uppercase font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                                    >
                                        Return to Hub
                                    </button>

                                    {selectedTopic.linkedAyahKey && (
                                        <button
                                            onClick={handleContinueToTadabbur}
                                            disabled={isContinuing}
                                            className="flex items-center space-x-2 px-8 py-3 rounded-full text-sm tracking-widest uppercase font-semibold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950"
                                        >
                                            Continue to Tadabbur
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

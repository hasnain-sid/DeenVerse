import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Moon, Heart, Compass } from 'lucide-react';
import { useRuhaniJournal } from './api/useRuhani';
import type { SpiritualPracticeEntry } from './types';

const PAGE_SIZE = 20;

export function RuhaniJournalPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useRuhaniJournal(page, PAGE_SIZE);

    const getIcon = (type: string) => {
        switch (type) {
            case 'tafakkur': return <Moon className="w-4 h-4" />;
            case 'tazkia': return <Heart className="w-4 h-4" />;
            case 'tadabbur': return <Compass className="w-4 h-4" />;
            default: return <Moon className="w-4 h-4" />;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-500">
                <div className="h-6 w-6 rounded-full border-2 border-zinc-500 dark:border-zinc-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-500">
                <div className="text-center">
                    <p className="text-zinc-600 dark:text-zinc-400 mb-2">Failed to load journal.</p>
                    <button onClick={() => window.location.reload()} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const entries: SpiritualPracticeEntry[] = data?.practices || [];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800/50 transition-colors duration-500">
            <div className="max-w-3xl mx-auto py-12 px-6 animate-in fade-in duration-500">
                <button
                    onClick={() => navigate('/ruhani')}
                    className="flex items-center text-sm tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mb-12 transition-colors uppercase"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Hub
                </button>

                <div className="mb-12">
                    <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100 mb-2">My Ruhani Journal</h2>
                    <p className="text-zinc-500 dark:text-zinc-500 font-light">A private record of your spiritual journey.</p>
                </div>

                {entries.length === 0 ? (
                    <div className="text-center py-20 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl bg-white dark:bg-zinc-900/10">
                        <p className="text-zinc-600 dark:text-zinc-500">Your journal is empty.</p>
                        <p className="text-zinc-500 dark:text-zinc-600 text-sm mt-2">Complete a Tafakkur or Tazkia session to see it here.</p>
                    </div>
                ) : (
                    <div className="relative border-l border-zinc-200 dark:border-zinc-800/50 pl-8 ml-4 space-y-12">
                        {entries.map((entry) => (
                            <div key={entry._id} className="relative group">
                                {/* Timeline dot */}
                                <div className="absolute -left-[41px] top-6 w-5 h-5 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-colors duration-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 group-hover:bg-zinc-600 dark:group-hover:bg-zinc-400 transition-colors"></div>
                                </div>

                                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/30 bg-white dark:bg-zinc-900/10 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-500 text-xs tracking-widest uppercase font-semibold">
                                            <span>{getIcon(entry.practiceType)}</span>
                                            <span>{entry.practiceType}</span>
                                        </div>
                                        <div className="text-zinc-500 dark:text-zinc-600 text-sm flex gap-4 items-center">
                                            {entry.traitRating && (
                                                <span className="bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded text-xs">Score: {entry.traitRating}/5</span>
                                            )}
                                            <span>{formatDate(entry.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg text-zinc-800 dark:text-zinc-200 font-medium">{entry.sourceTitle}</h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light text-sm mt-2 whitespace-pre-wrap">
                                                {entry.reflectionText}
                                            </p>
                                        </div>

                                        {entry.habitChecks && entry.habitChecks.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/50">
                                                <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-2">Habits checked</p>
                                                <ul className="space-y-1">
                                                    {entry.habitChecks.filter((h) => h.completed).map((h, i) => (
                                                        <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600"></div>
                                                            {h.habit}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Start of timeline (only on last page) */}
                        {data && page >= data.totalPages && (
                            <div className="relative">
                                <div className="absolute -left-[41px] top-2 w-5 h-5 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-colors duration-500">
                                    <div className="w-2 h-2 rounded-full border border-zinc-400 dark:border-zinc-600"></div>
                                </div>
                                <p className="text-zinc-500 dark:text-zinc-700 text-sm italic py-2">Beginning of your journey</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800/30">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="flex items-center gap-1 px-4 py-2 text-sm tracking-wider uppercase text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                        </button>
                        <span className="text-sm text-zinc-500 dark:text-zinc-500 tabular-nums">
                            {page} / {data.totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                            disabled={page >= data.totalPages}
                            className="flex items-center gap-1 px-4 py-2 text-sm tracking-wider uppercase text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useNavigate } from 'react-router-dom';
import { Moon, BookOpen, Heart, BookMarked, ArrowRight } from 'lucide-react';
import { useRuhaniJournal } from './api/useRuhani';
import { useAuthStore } from '@/stores/authStore';

export function RuhaniHubPage() {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { data: journalData } = useRuhaniJournal(1, 1, undefined, isAuthenticated);
    const lastEntry = journalData?.practices?.[0];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800/50 transition-colors duration-500">
            {/* Subtle ambient gradient */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(244,244,245,0.8)_0%,rgba(250,250,250,1)_60%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(39,39,42,0.1)_0%,rgba(9,9,11,1)_60%)] transition-colors duration-500"></div>

            <div className="relative z-10 max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-700">
                {/* Header section */}
                <div className="text-center space-y-4 mb-20">
                    <div className="flex items-center justify-center mb-6">
                        <div className="h-12 w-12 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 flex items-center justify-center transition-colors duration-500">
                            <Moon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light tracking-wide text-zinc-900 dark:text-zinc-100">
                        Ruhani Space
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-500 font-light tracking-wider text-sm max-w-md mx-auto">
                        Quiet your mind. Deepen your connection.
                    </p>
                </div>

                {/* Main Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    <button
                        onClick={() => navigate('/ruhani/tafakkur')}
                        className="group relative p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20 hover:bg-zinc-50 hover:dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-500 text-left flex flex-col justify-between min-h-[220px]"
                    >
                        <div className="space-y-4">
                            <Moon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
                            <h2 className="text-xl font-medium text-zinc-800 dark:text-zinc-200">Tafakkur</h2>
                            <p className="text-zinc-500 dark:text-zinc-500 text-sm leading-relaxed">
                                Contemplate Allah's signs in creation.
                            </p>
                        </div>
                        <div className="mt-8 flex items-center text-xs text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-600 uppercase tracking-widest font-semibold dark:group-hover:text-zinc-400 transition-colors">
                            Begin <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/ruhani/tadabbur')}
                        className="group relative p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20 hover:bg-zinc-50 hover:dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-500 text-left flex flex-col justify-between min-h-[220px]"
                    >
                        <div className="space-y-4">
                            <BookOpen className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
                            <h2 className="text-xl font-medium text-zinc-800 dark:text-zinc-200">Tadabbur</h2>
                            <p className="text-zinc-500 dark:text-zinc-500 text-sm leading-relaxed">
                                Ponder the Quran deeply. "Do they not ponder?"
                            </p>
                        </div>
                        <div className="mt-8 flex items-center text-xs text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-600 uppercase tracking-widest font-semibold dark:group-hover:text-zinc-400 transition-colors">
                            Begin <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/ruhani/tazkia')}
                        className="group relative p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20 hover:bg-zinc-50 hover:dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-500 text-left flex flex-col justify-between min-h-[220px]"
                    >
                        <div className="space-y-4">
                            <Heart className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
                            <h2 className="text-xl font-medium text-zinc-800 dark:text-zinc-200">Tazkia</h2>
                            <p className="text-zinc-500 dark:text-zinc-500 text-sm leading-relaxed">
                                Purify your soul. Self-account and build virtues.
                            </p>
                        </div>
                        <div className="mt-8 flex items-center text-xs text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-600 uppercase tracking-widest font-semibold dark:group-hover:text-zinc-400 transition-colors">
                            Begin <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                    </button>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent mb-12"></div>

                {/* Guided Session Entry (Disabled for Phase 1) */}
                <div className="mb-12">
                    <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/20 bg-zinc-50 dark:bg-zinc-900/10 opacity-60 flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h3 className="text-zinc-700 dark:text-zinc-300 font-medium mb-2">Start a Guided Session</h3>
                            <p className="text-zinc-500 text-sm">We'll weave all three practices for you.</p>
                        </div>
                        <div className="mt-4 md:mt-0 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800/50 text-xs text-zinc-500 uppercase tracking-wider">
                            Coming in Phase 3
                        </div>
                    </div>
                </div>

                {/* Journal Entry */}
                <div>
                    <button
                        onClick={() => navigate('/ruhani/journal')}
                        className="w-full group p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-all duration-300 flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                                <BookMarked className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-zinc-800 dark:text-zinc-300 font-medium">My Ruhani Journal</h3>
                                <p className="text-zinc-500 text-xs mt-1">
                                    {lastEntry
                                        ? `Last entry: ${new Date(lastEntry.createdAt).toLocaleDateString()}`
                                        : 'No entries yet. Start your journey.'}
                                </p>
                            </div>
                        </div>
                        <div className="text-xs text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-600 uppercase tracking-widest font-semibold dark:group-hover:text-zinc-400 transition-colors flex items-center">
                            View All <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

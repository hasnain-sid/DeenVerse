import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, BookOpen, Heart, BookMarked, ArrowRight, RotateCcw } from 'lucide-react';
import { useRuhaniJournal, useTodayTafakkurTopic, useRuhaniStats } from './api/useRuhani';
import { listDrafts } from './hooks/useReflectionDraft';
import { useAuthStore } from '@/stores/authStore';

const PRACTICE_ROUTES: Record<string, string> = {
    tafakkur: '/ruhani/tafakkur',
    tadabbur: '/ruhani/tadabbur',
    tazkia: '/ruhani/tazkia',
};

function relativeDay(timestamp: number) {
    const days = Math.floor((Date.now() - timestamp) / 86_400_000);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
}

export function RuhaniHubPage() {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { data: journalData } = useRuhaniJournal(1, 1, undefined, isAuthenticated);
    const { data: stats } = useRuhaniStats(isAuthenticated);
    const { data: todayTopic } = useTodayTafakkurTopic();

    const lastEntry = journalData?.practices?.[0];
    // Drafts are local, so this works signed out too. Read once on mount rather
    // than rescanning localStorage on every render.
    const [openDraft] = useState(() => listDrafts()[0]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800/50 transition-colors duration-500">
            {/* Subtle ambient gradient */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(244,244,245,0.8)_0%,rgba(250,250,250,1)_60%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(39,39,42,0.1)_0%,rgba(9,9,11,1)_60%)] transition-colors duration-500"></div>

            <div className="relative z-10 max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-700">
                {/* Header section */}
                <div className="text-center space-y-4 mb-16">
                    <div className="flex items-center justify-center mb-6">
                        <div className="h-12 w-12 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 flex items-center justify-center transition-colors duration-500">
                            <Moon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light tracking-wide text-zinc-900 dark:text-zinc-100">
                        Ruhani Space
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 font-light tracking-wider text-sm max-w-md mx-auto">
                        Quiet your mind. Deepen your connection.
                    </p>
                </div>

                {/* Resume an unfinished reflection — offered before anything new is suggested */}
                {openDraft && (
                    <button
                        onClick={() => navigate(PRACTICE_ROUTES[openDraft.practiceType] ?? '/ruhani')}
                        className="w-full mb-8 p-5 rounded-2xl border border-zinc-300 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/30 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 flex items-center justify-between text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                        <div className="flex items-center gap-4">
                            <RotateCcw className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" aria-hidden="true" />
                            <div>
                                <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">Continue where you left off</p>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                    {openDraft.sourceTitle || openDraft.sourceRef} — started {relativeDay(openDraft.updatedAt)}
                                </p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" aria-hidden="true" />
                    </button>
                )}

                {/* Today's contemplation — the recommended entry path */}
                {todayTopic && (
                    <button
                        onClick={() => navigate('/ruhani/tafakkur', { state: { preselectedTopicSlug: todayTopic.slug } })}
                        className="w-full mb-12 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-500 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                        <div className="text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-500 font-semibold mb-6">
                            Today's Contemplation
                        </div>
                        <div className="flex items-start gap-5">
                            <div className="text-4xl opacity-80 shrink-0" aria-hidden="true">{todayTopic.icon}</div>
                            <div className="min-w-0">
                                <div className="flex items-baseline gap-3 flex-wrap">
                                    <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100">{todayTopic.title}</h2>
                                    <span lang="ar" dir="rtl" className="font-arabic text-zinc-600 dark:text-zinc-400">{todayTopic.arabicTitle}</span>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-light mt-3">
                                    {todayTopic.contemplate}
                                </p>
                                <div className="mt-6 flex items-center text-xs text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-200 uppercase tracking-widest font-semibold transition-colors">
                                    Begin
                                    <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" aria-hidden="true" />
                                </div>
                            </div>
                        </div>
                    </button>
                )}

                <p className="text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-500 font-semibold mb-6 text-center">
                    Or choose your own path
                </p>

                {/* Main Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {[
                        { to: '/ruhani/tafakkur', Icon: Moon, title: 'Tafakkur', body: "Contemplate Allah's signs in creation." },
                        { to: '/ruhani/tadabbur', Icon: BookOpen, title: 'Tadabbur', body: 'Ponder the Quran deeply. "Do they not ponder?"' },
                        { to: '/ruhani/tazkia', Icon: Heart, title: 'Tazkia', body: 'Purify your soul. Self-account and build virtues.' },
                    ].map(({ to, Icon, title, body }) => (
                        <button
                            key={to}
                            onClick={() => navigate(to)}
                            className="group relative p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20 hover:bg-zinc-50 hover:dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-500 text-left flex flex-col justify-between min-h-[170px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                        >
                            <div className="space-y-3">
                                <Icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" aria-hidden="true" />
                                <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">{title}</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{body}</p>
                            </div>
                            <div className="mt-6 flex items-center text-xs text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 uppercase tracking-widest font-semibold dark:group-hover:text-zinc-200 transition-colors">
                                Begin <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" aria-hidden="true" />
                            </div>
                        </button>
                    ))}
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent mb-12" aria-hidden="true"></div>

                {/* Journal */}
                <button
                    onClick={() => navigate('/ruhani/journal')}
                    className="w-full group p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-all duration-300 flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                            <BookMarked className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-zinc-800 dark:text-zinc-300 font-medium">
                                My Ruhani Journal
                                {stats && stats.total > 0 && (
                                    <span className="text-zinc-500 dark:text-zinc-500 font-normal">
                                        {' · '}{stats.total} {stats.total === 1 ? 'entry' : 'entries'}
                                    </span>
                                )}
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-1">
                                {lastEntry
                                    ? `Last entry: ${new Date(lastEntry.createdAt).toLocaleDateString()}`
                                    : 'No entries yet. Start your journey.'}
                            </p>
                        </div>
                    </div>
                    <div className="text-xs text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-200 uppercase tracking-widest font-semibold transition-colors flex items-center">
                        View All <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" aria-hidden="true" />
                    </div>
                </button>
            </div>
        </div>
    );
}

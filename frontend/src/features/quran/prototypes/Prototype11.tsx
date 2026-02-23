import { useState } from 'react';
import { Sun, CheckCircle2, BookOpen, Quote } from 'lucide-react';

export default function Prototype11() {
    const [completed, setCompleted] = useState(false);

    return (
        <div className="max-w-lg mx-auto p-4 md:p-8 min-h-[700px] flex flex-col justify-center">

            {/* Date Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl mb-4">
                    <Sun className="w-6 h-6 text-amber-500" />
                </div>
                <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400">Monday, Oct 24</h2>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mt-1">Daily Briefing</h1>
            </div>

            {/* Main Card */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-100 dark:border-zinc-800 overflow-hidden transform transition-all hover:scale-[1.01] duration-500">

                {/* Soft background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/30 dark:from-indigo-900/10 dark:via-zinc-900 dark:to-emerald-900/10 pointer-events-none" />

                <div className="relative p-8 md:p-10 flex flex-col h-full">

                    <div className="flex items-center justify-center gap-2 mb-8">
                        <BookOpen className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Surah Al-Baqarah 2:286</span>
                    </div>

                    <div className="relative mb-10">
                        <Quote className="absolute -top-4 -left-2 w-8 h-8 text-zinc-100 dark:text-zinc-800 rotate-180" />
                        <p dir="rtl" className="text-3xl leading-loose text-center text-zinc-800 dark:text-zinc-100 font-serif relative z-10">
                            لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا
                        </p>
                    </div>

                    <div className="mb-10 text-center">
                        <p className="text-lg text-zinc-600 dark:text-zinc-300 font-serif leading-relaxed italic">
                            "Allah does not burden a soul beyond that it can bear."
                        </p>
                    </div>

                    <div className="mt-auto">
                        <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800/80">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                Today's Practical Focus
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                                When you feel overwhelmed today, pause and remind yourself that you are fully equipped to handle exactly what is in front of you. Take one deep breath before responding to a stressful situation.
                            </p>

                            <button
                                onClick={() => setCompleted(!completed)}
                                className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all duration-300 ${completed
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 translate-y-0.5'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 hover:-translate-y-0.5'
                                    }`}
                            >
                                <CheckCircle2 className={`w-5 h-5 transition-transform duration-500 ${completed ? 'scale-110' : 'scale-100'}`} />
                                {completed ? "Completed for Today" : "I Commit to This"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { PenLine, Save, Calendar, ArrowRight } from 'lucide-react';

export default function Prototype13() {
    const [reflection, setReflection] = useState('');
    const [saved, setSaved] = useState(false);

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 min-h-[700px] flex items-center justify-center">
            <div className="w-full bg-[#FAFAFA] dark:bg-zinc-950 rounded-[2rem] shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col md:flex-row">

                {/* Left Side: Ayah Context */}
                <div className="w-full md:w-2/5 md:bg-white md:dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-8 flex flex-col">
                    <div className="mb-auto">
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Reflection Journal</span>
                        </div>

                        <h3 className="text-zinc-900 dark:text-white font-bold text-xl mb-6">Ad-Duha 93:3</h3>

                        <p dir="rtl" className="text-3xl leading-relaxed font-serif text-emerald-700 dark:text-emerald-500 mb-6 text-right">
                            مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ
                        </p>

                        <p className="text-zinc-600 dark:text-zinc-400 font-serif leading-relaxed">
                            "Your Lord has not taken leave of you, [O Muhammad], nor has He detested [you]."
                        </p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="block text-xs font-bold uppercase text-zinc-400 mb-2">Today's Prompt</span>
                        <p className="text-zinc-900 dark:text-zinc-200 font-medium">
                            When was a time you felt abandoned, but later realized Allah was preparing something better for you?
                        </p>
                    </div>
                </div>

                {/* Right Side: Journal Area */}
                <div className="w-full md:w-3/5 p-8 flex flex-col bg-[#FDFDFD] dark:bg-zinc-950 relative">

                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                            <PenLine className="w-5 h-5 text-zinc-400" />
                            Your Thoughts
                        </h4>
                        <span className="text-xs text-zinc-400 font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <div className="flex-1 relative mb-6">
                        <textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            placeholder="Start writing here. Your reflections are private..."
                            className="w-full h-full min-h-[300px] resize-none bg-transparent border-0 focus:ring-0 text-zinc-800 dark:text-zinc-200 leading-8 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none text-lg custom-scrollbar"
                            style={{
                                backgroundImage: 'linear-gradient(transparent, transparent 31px, rgba(161, 161, 170, 0.1) 31px)',
                                backgroundSize: '100% 32px',
                                lineHeight: '32px'
                            }}
                        />
                    </div>

                    <div className="flex justify-end mt-auto pt-4">
                        <button
                            onClick={() => {
                                if (reflection.trim().length > 0) {
                                    setSaved(true);
                                    setTimeout(() => setSaved(false), 3000);
                                }
                            }}
                            className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all ${saved
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : reflection.trim().length > 0
                                        ? 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 shadow-md'
                                        : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 cursor-not-allowed'
                                }`}
                        >
                            {saved ? (
                                <>Saved Successfully</>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Save Journal Entry
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

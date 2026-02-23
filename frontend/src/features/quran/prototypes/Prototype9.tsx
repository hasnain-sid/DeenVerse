import { useState } from 'react';
import { Type, MessageSquare, Check } from 'lucide-react';

export default function Prototype9() {
    const [arabicFont, setArabicFont] = useState('font-sans');
    const [tafseerScope, setTafseerScope] = useState<'ayah' | 'ruku' | 'juzz'>('ayah');
    const [showTafseer, setShowTafseer] = useState(false);
    const [showFontMenu, setShowFontMenu] = useState(false);

    return (
        <div className="max-w-3xl mx-auto rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[700px]">

            {/* Header Bar */}
            <div className="px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <BookIcon />
                    </div>
                    <div>
                        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Al-Kahf</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Juzz 16 • Verse 75</p>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowFontMenu(!showFontMenu)}
                        className="p-2 text-zinc-500 hover:text-emerald-600 bg-zinc-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors"
                    >
                        <Type className="w-5 h-5" />
                    </button>

                    {showFontMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-2 z-20">
                            {['font-sans', 'font-serif', 'font-mono'].map(font => (
                                <button
                                    key={font}
                                    onClick={() => { setArabicFont(font); setShowFontMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 flex justify-between items-center"
                                >
                                    <span className={font === 'font-sans' ? 'font-sans' : font === 'font-serif' ? 'font-serif' : 'font-mono'}>
                                        {font === 'font-sans' ? 'Naskh' : font === 'font-serif' ? 'Uthmani' : 'IndoPak'}
                                    </span>
                                    {arabicFont === font && <Check className="w-4 h-4 text-emerald-500" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-opacity-5">

                {/* Arabic Bubble (Right aligned visually due to RTL, but block is right-aligned) */}
                <div className="flex justify-end w-full">
                    <div className="bg-emerald-600 dark:bg-emerald-700 text-white p-6 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
                        <p dir="rtl" className={`text-3xl leading-relaxed ${arabicFont}`}>
                            ۞ قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن تَسْتَطِيعَ مَعِيَ صَبْرًا
                        </p>
                        <div className="flex justify-start mt-2 opacity-70">
                            <span className="text-xs font-mono">18:75</span>
                        </div>
                    </div>
                </div>

                {/* Translation Bubble (Left aligned) */}
                <div className="flex justify-start w-full">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 p-5 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
                        <p className="text-lg font-serif">
                            "[Al-Khidhr] said, 'Did I not tell you that with me you would never be able to have patience?'"
                        </p>
                    </div>
                </div>

                {/* Action Button */}
                {!showTafseer && (
                    <div className="flex justify-center my-8">
                        <button
                            onClick={() => setShowTafseer(true)}
                            className="px-6 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/50 transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Explain Tafseer
                        </button>
                    </div>
                )}

                {/* Tafseer Thread */}
                {showTafseer && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                        <div className="flex justify-center">
                            <div className="bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                                Tafseer Generated
                            </div>
                        </div>

                        <div className="flex justify-start w-full gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 mt-2">
                                <BookIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 p-5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm w-full">

                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                    <span className="font-semibold text-sm">Ibn Kathir Explanation</span>
                                    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-md">
                                        {(['ayah', 'ruku', 'juzz'] as const).map(scope => (
                                            <button
                                                key={scope}
                                                onClick={() => setTafseerScope(scope)}
                                                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${tafseerScope === scope ? 'bg-white dark:bg-zinc-600 text-indigo-600 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                            >
                                                {scope.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-sm leading-relaxed space-y-3">
                                    <p>
                                        The condition set by Al-Khidhr to Musa (peace be upon him) highlights the difficulty of remaining patient when witnessing events whose inner wisdom is hidden from us. This serves as a vital lesson in placing trust in divine wisdom even when external factors seem confusing or challenging.
                                    </p>
                                    {tafseerScope !== 'ayah' && (
                                        <p className="text-zinc-500 dark:text-zinc-400">
                                            In the broader scope of this {tafseerScope}, we see a recurring theme of profound laws and reasons beyond human comprehension. Musa's commitment to patience is repeatedly tested, illustrating the spiritual journey required for gaining divine knowledge.
                                        </p>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* Dummy div to force scroll if needed */}
                <div className="h-6"></div>
            </div>
        </div>
    );
}

function BookIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
    );
}

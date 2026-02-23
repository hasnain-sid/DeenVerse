import { useState } from 'react';
import { Type, BookOpen, Layers } from 'lucide-react';

export default function Prototype7() {
    const [arabicFont, setArabicFont] = useState('font-serif');
    const [tafseerScope, setTafseerScope] = useState<'ayah' | 'ruku' | 'juzz'>('ruku');
    const [activeTab, setActiveTab] = useState<'translation' | 'tafseer'>('translation');

    const fonts = [
        { id: 'font-sans', label: 'Naskh', desc: 'Standard reading' },
        { id: 'font-serif', label: 'Uthmani', desc: 'Script of Madinah' },
        { id: 'font-mono', label: 'IndoPak', desc: 'Subcontinental script' },
    ];

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="bg-white dark:bg-zinc-950 rounded-[2rem] shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col lg:flex-row">

                {/* Left Side: Font Configuration */}
                <div className="w-full lg:w-64 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-zinc-100">
                            <Type className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-semibold">Typography</h3>
                        </div>
                        <div className="space-y-3">
                            {fonts.map(font => (
                                <button
                                    key={font.id}
                                    onClick={() => setArabicFont(font.id)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all ${arabicFont === font.id
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                            : 'bg-white dark:bg-zinc-800 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'
                                        }`}
                                >
                                    <p className={`font-medium ${arabicFont === font.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                        {font.label}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1">{font.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-zinc-100">
                            <Layers className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-semibold">Context</h3>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 rounded-xl p-1 shadow-sm border border-zinc-200 dark:border-zinc-700">
                            {(['ayah', 'ruku', 'juzz'] as const).map(scope => (
                                <button
                                    key={scope}
                                    onClick={() => setTafseerScope(scope)}
                                    className={`w-full py-2 px-3 text-sm font-medium rounded-lg capitalize text-left transition-colors ${tafseerScope === scope
                                            ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                        }`}
                                >
                                    {scope} Level
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Top: Arabic */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-sm font-medium text-zinc-500">Al-Kahf 18:75</span>
                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded-full">Juzz 16</span>
                        </div>
                        <p dir="rtl" className={`text-4xl md:text-5xl lg:text-6xl leading-[1.8] text-right text-zinc-900 dark:text-white ${arabicFont}`}>
                            ۞ قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن تَسْتَطِيعَ مَعِيَ صَبْرًا
                        </p>
                    </div>

                    {/* Bottom: Translation / Tafseer */}
                    <div className="h-64 bg-zinc-50/50 dark:bg-zinc-900/50 p-6 md:p-8 flex flex-col">
                        <div className="flex gap-6 border-b border-zinc-200 dark:border-zinc-800 mb-6">
                            <button
                                onClick={() => setActiveTab('translation')}
                                className={`pb-4 text-sm font-bold uppercase tracking-wider relative ${activeTab === 'translation' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                                    }`}
                            >
                                Translation
                                {activeTab === 'translation' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-400"></span>}
                            </button>
                            <button
                                onClick={() => setActiveTab('tafseer')}
                                className={`pb-4 text-sm font-bold uppercase tracking-wider relative ${activeTab === 'tafseer' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                                    }`}
                            >
                                Tafseer
                                {activeTab === 'tafseer' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-400"></span>}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 text-zinc-700 dark:text-zinc-300">
                            {activeTab === 'translation' ? (
                                <p className="text-xl font-serif leading-relaxed">
                                    "[Al-Khidhr] said, 'Did I not tell you that with me you would never be able to have patience?'"
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2">
                                        <BookOpen className="w-4 h-4" />
                                        <span className="font-medium">Scope: {tafseerScope.charAt(0).toUpperCase() + tafseerScope.slice(1)}</span>
                                    </div>
                                    <p className="leading-relaxed text-sm md:text-base">
                                        The condition set by Al-Khidhr to Musa (peace be upon him) highlights the difficulty of remaining patient when witnessing events whose inner wisdom is hidden from us. This serves as a vital lesson in placing trust in divine wisdom even when external factors seem confusing or challenging.
                                    </p>
                                    {tafseerScope !== 'ayah' && (
                                        <p className="leading-relaxed text-sm md:text-base">
                                            The broader context of this {tafseerScope} reinforces the narrative of true knowledge belonging solely to Allah. Musa's journey with Al-Khidhr is a profound illustration that the unseen domain possesses laws and reasons beyond human comprehension.
                                        </p>
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

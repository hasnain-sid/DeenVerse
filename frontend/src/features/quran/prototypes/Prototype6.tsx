import { useState } from 'react';
import { BookOpen, Type, FileText } from 'lucide-react';

export default function Prototype6() {
    const [isFlipped, setIsFlipped] = useState(false);
    const [arabicFont, setArabicFont] = useState('font-sans');
    const [tafseerScope, setTafseerScope] = useState<'ayah' | 'ruku' | 'juzz'>('ayah');
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 perspective-1000">
            <div
                className={`relative w-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                style={{ minHeight: '400px' }}
            >
                {/* Front Side: Arabic Text */}
                <div className={`absolute inset-0 w-full h-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between backface-hidden ${isFlipped ? 'invisible' : 'visible'}`}>
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Juzz 16 • Al-Kahf 18:75</span>
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <Type className="w-5 h-5" />
                            </button>
                            {showSettings && (
                                <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 py-2 z-10">
                                    <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase">Arabic Font</div>
                                    <button onClick={() => { setArabicFont('font-sans'); setShowSettings(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700">Standard Naskh</button>
                                    <button onClick={() => { setArabicFont('font-serif'); setShowSettings(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700">Uthmani</button>
                                    <button onClick={() => { setArabicFont('font-mono'); setShowSettings(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700">IndoPak</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center py-12">
                        <p dir="rtl" className={`text-5xl leading-tight text-center text-zinc-800 dark:text-zinc-100 ${arabicFont}`}>
                            ۞ قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن تَسْتَطِيعَ مَعِيَ صَبْرًا
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={() => setIsFlipped(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-colors shadow-md shadow-emerald-500/20"
                        >
                            <FileText className="w-4 h-4" />
                            Meaning & Tafseer
                        </button>
                    </div>
                </div>

                {/* Back Side: Translation & Tafseer */}
                <div className={`absolute inset-0 w-full h-full bg-zinc-50 dark:bg-zinc-950 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col backface-hidden rotate-y-180 ${!isFlipped ? 'invisible' : 'visible'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => setIsFlipped(false)}
                            className="text-sm font-medium text-zinc-500 hover:text-emerald-600 transition-colors"
                        >
                            ← Back to Arabic
                        </button>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 flex gap-1">
                            {(['ayah', 'ruku', 'juzz'] as const).map(scope => (
                                <button
                                    key={scope}
                                    onClick={() => setTafseerScope(scope)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${tafseerScope === scope
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-sm'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                        }`}
                                >
                                    {scope}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Translation</h4>
                            <p className="text-lg text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif">
                                "[Al-Khidhr] said, 'Did I not tell you that with me you would never be able to have patience?'"
                            </p>
                        </div>

                        <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800"></div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Tafseer ({tafseerScope} Context)
                            </h4>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-4">
                                <p>
                                    This verse demonstrates the condition set by Al-Khidhr to Musa (peace be upon him). It highlights the difficulty of remaining patient when witnessing events whose inner wisdom is hidden from us.
                                </p>
                                {tafseerScope !== 'ayah' && (
                                    <p>
                                        In the broader context of the {tafseerScope}, this story serves as a profound lesson on the limitations of human knowledge versus Divine wisdom. The narrative teaches that there are reasons behind events that might appear unjust or confusing initially.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Required CSS for 3D flip effect which Tailwind doesn't have built-in utilities for all backface visibility cases by default */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
        </div>
    );
}

import { useState } from 'react';
import { Settings, X, BookOpen, Minimize2 } from 'lucide-react';

export default function Prototype8() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [arabicFont, setArabicFont] = useState('font-sans');
    const [tafseerScope, setTafseerScope] = useState<'ayah' | 'ruku' | 'juzz'>('ayah');
    const [showFontMenu, setShowFontMenu] = useState(false);

    const fonts = [
        { id: 'font-sans', label: 'Standard Naskh' },
        { id: 'font-serif', label: 'Uthmani Script' },
        { id: 'font-mono', label: 'IndoPak Script' },
    ];

    return (
        <div className="relative h-[800px] max-h-screen w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-zinc-950 flex font-sans">

            {/* Main Focus Area (Arabic) */}
            <div className={`flex-1 transition-all duration-500 ease-in-out flex flex-col items-center justify-center p-8 relative ${isDrawerOpen ? 'mr-0 md:mr-96 opacity-60' : 'mr-0 opacity-100'}`}>

                {/* Top Info */}
                <div className="absolute top-8 text-center w-full opacity-50 tracking-[0.2em] font-light text-xs uppercase text-zinc-400">
                    Juzz 16 • Al-Kahf 18:75
                </div>

                {/* Central Arabic Text */}
                <div className="max-w-3xl w-full text-center group cursor-pointer" onClick={() => !isDrawerOpen && setIsDrawerOpen(true)}>
                    <p dir="rtl" className={`text-5xl md:text-7xl leading-loose text-white opacity-90 transition-opacity hover:opacity-100 ${arabicFont}`}>
                        ۞ قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن تَسْتَطِيعَ مَعِيَ صَبْرًا
                    </p>
                    <div className="mt-12 text-zinc-500 text-lg md:text-2xl font-serif max-w-2xl mx-auto leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        "[Al-Khidhr] said, 'Did I not tell you that with me you would never be able to have patience?'"
                    </div>
                </div>

                {/* Floating Controls Layer */}
                <div className="absolute bottom-8 left-8 flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowFontMenu(!showFontMenu); }}
                            className="p-4 bg-zinc-900/80 backdrop-blur-md rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all shadow-lg border border-zinc-800"
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        {showFontMenu && (
                            <div className="absolute bottom-full left-0 mb-4 w-56 bg-zinc-900/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-zinc-800">
                                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Typography</div>
                                {fonts.map(font => (
                                    <button
                                        key={font.id}
                                        onClick={() => { setArabicFont(font.id); setShowFontMenu(false); }}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${arabicFont === font.id ? 'bg-emerald-900/50 text-emerald-400' : 'text-zinc-300 hover:bg-zinc-800'}`}
                                    >
                                        {font.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className={`absolute bottom-8 right-8 flex items-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium transition-all shadow-lg shadow-emerald-900/50 ${isDrawerOpen ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}
                >
                    <BookOpen className="w-5 h-5" />
                    Read Tafseer
                </button>
            </div>

            {/* Slide-out Drawer (Tafseer) */}
            <div
                className={`absolute top-0 right-0 h-full w-full md:w-96 bg-zinc-900 border-l border-zinc-800 shadow-2xl transform transition-transform duration-500 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="h-full flex flex-col">
                    {/* Drawer Header */}
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/95 backdrop-blur-sm sticky top-0 z-10">
                        <h3 className="font-semibold text-lg text-white">Tafseer</h3>
                        <button
                            onClick={() => setIsDrawerOpen(false)}
                            className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                        {/* Scope Selector */}
                        <div className="bg-zinc-950 p-1.5 rounded-xl flex mb-8">
                            {(['ayah', 'ruku', 'juzz'] as const).map(scope => (
                                <button
                                    key={scope}
                                    onClick={() => setTafseerScope(scope)}
                                    className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${tafseerScope === scope ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {scope}
                                </button>
                            ))}
                        </div>

                        {/* Content Text */}
                        <div className="space-y-6 text-zinc-300">
                            <div className="flex items-center gap-2 mb-4 text-emerald-500">
                                <Minimize2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Context: {tafseerScope.toUpperCase()}</span>
                            </div>

                            <p className="leading-relaxed">
                                The condition set by Al-Khidhr to Musa (peace be upon him) highlights the difficulty of remaining patient when witnessing events whose inner wisdom is hidden from us. This serves as a vital lesson in placing trust in divine wisdom even when external factors seem confusing or challenging.
                            </p>

                            {tafseerScope !== 'ayah' && (
                                <p className="leading-relaxed text-zinc-400 border-l-2 border-zinc-800 pl-4">
                                    The broader context of this {tafseerScope} reinforces the narrative of true knowledge belonging solely to Allah. Musa's journey with Al-Khidhr is a profound illustration that the unseen domain possesses laws and reasons beyond human comprehension.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

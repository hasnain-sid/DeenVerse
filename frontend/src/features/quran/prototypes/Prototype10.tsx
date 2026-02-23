import { useState } from 'react';
import { Settings, BookOpen, Quote, ChevronDown } from 'lucide-react';

export default function Prototype10() {
    const [arabicFont, setArabicFont] = useState('font-serif');
    const [tafseerScope, setTafseerScope] = useState<'ayah' | 'ruku' | 'juzz'>('ayah');
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl relative bg-[#f4ebd8] dark:bg-[#2c261e] border-8 border-[#e6d5b8] dark:border-[#3d362a]">

            {/* Decorative Border Overlay */}
            <div className="absolute inset-2 border-2 border-[#d4b88f] dark:border-[#5a4d3c] rounded-lg pointer-events-none"></div>

            <div className="p-10 md:p-14">

                {/* Header (Chapter / Ornamentation) */}
                <div className="flex justify-between items-center mb-12 relative z-10">
                    <div className="text-center flex-1 font-serif text-[#8b6d41] dark:text-[#c4a97f]">
                        <h2 className="text-2xl font-bold tracking-widest uppercase">Surah Al-Kahf</h2>
                        <p className="text-sm tracking-widest uppercase mt-1">Juzz 16 • Verse 75</p>
                    </div>

                    {/* Settings / Font Toggle */}
                    <div className="absolute right-0 top-0">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-3 text-[#8b6d41] hover:text-[#5a4629] dark:text-[#c4a97f] dark:hover:text-[#e4d2b2] bg-[#ebd8bb] hover:bg-[#dfc8a5] dark:bg-[#3d362a] dark:hover:bg-[#4d4436] rounded-full transition-colors border border-[#d4b88f] dark:border-[#5a4d3c]"
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        {showSettings && (
                            <div className="absolute right-0 top-full mt-3 w-56 bg-[#f9f4ea] dark:bg-[#201c15] rounded-lg shadow-xl border border-[#d4b88f] dark:border-[#5a4d3c] py-2 z-20">
                                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#8b6d41] dark:text-[#a38c6b] text-center border-b border-[#ebd8bb] dark:border-[#3d362a] mb-2">
                                    Script Style
                                </div>
                                {['font-sans', 'font-serif', 'font-mono'].map(font => (
                                    <button
                                        key={font}
                                        onClick={() => { setArabicFont(font); setShowSettings(false); }}
                                        className={`w-full text-left px-5 py-2.5 text-sm hover:bg-[#f1e6d4] dark:hover:bg-[#2c261e] transition-colors text-[#5a4629] dark:text-[#e4d2b2] ${arabicFont === font ? 'font-bold bg-[#ebd8bb] dark:bg-[#3d362a]' : ''}`}
                                    >
                                        {font === 'font-sans' ? 'Naskh (Standard)' : font === 'font-serif' ? 'Uthmani (Madinah)' : 'IndoPak (Subcontinent)'}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

                    {/* Left Column: Translation & Tafseer */}
                    <div className="flex-1 lg:max-w-sm flex flex-col gap-10">

                        {/* Translation Book block */}
                        <div className="relative">
                            <Quote className="absolute -top-4 -left-4 w-8 h-8 text-[#d4b88f] dark:text-[#4d4436] opacity-50" />
                            <div className="pl-4 border-l-4 border-[#d4b88f] dark:border-[#5a4d3c]">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8b6d41] dark:text-[#a38c6b] mb-4">Meaning</h4>
                                <p className="text-lg text-[#3a2e20] dark:text-[#d3c0a5] leading-relaxed font-serif">
                                    "[Al-Khidhr] said, 'Did I not tell you that with me you would never be able to have patience?'"
                                </p>
                            </div>
                        </div>

                        <div className="w-16 h-[1px] bg-[#d4b88f] dark:bg-[#5a4d3c] mx-auto lg:mx-0"></div>

                        {/* Tafseer Block */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8b6d41] dark:text-[#a38c6b] flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" /> Tafseer
                                </h4>

                                {/* Context Selector mimicking an ink well button */}
                                <div className="relative group">
                                    <button className="flex items-center gap-1 text-xs text-[#8b6d41] dark:text-[#a38c6b] bg-[#ebd8bb] dark:bg-[#3d362a] px-3 py-1.5 rounded-full uppercase tracking-wider font-semibold border border-[#d4b88f] dark:border-[#4d4436]">
                                        {tafseerScope} <ChevronDown className="w-3 h-3" />
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-[#f9f4ea] dark:bg-[#201c15] rounded border border-[#d4b88f] dark:border-[#5a4d3c] shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center">
                                        {(['ayah', 'ruku', 'juzz'] as const).map(scope => (
                                            <button
                                                key={scope}
                                                onClick={() => setTafseerScope(scope)}
                                                className="block w-full px-4 py-2 text-xs uppercase tracking-wider text-[#5a4629] dark:text-[#c4a97f] hover:bg-[#ebd8bb] dark:hover:bg-[#3d362a]"
                                            >
                                                {scope}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-[#5a4629] dark:prose-invert max-w-none font-serif text-sm md:text-base leading-loose text-[#4a3a28] dark:text-[#bba992]">
                                <p>
                                    <strong>Ibn Kathir:</strong> The condition set by Al-Khidhr to Musa (peace be upon him) highlights the difficulty of remaining patient when witnessing events whose inner wisdom is hidden from us. This serves as a vital lesson in placing trust in divine wisdom.
                                </p>
                                {tafseerScope !== 'ayah' && (
                                    <p className="mt-4">
                                        Within the {tafseerScope}, this interaction emphasizes that true knowledge is vast, and humans only possess a fraction of it. Musa's commitment is continuously tested, illustrating the spiritual fortitude required for higher understanding.
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Arabic Text (Classical Layout focuses heavily on text on right/center) */}
                    <div className="flex-[1.5] flex items-center justify-center relative min-h-[400px]">
                        {/* Faint Background Ornamentation */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 dark:opacity-5 pointer-events-none rounded-2xl"></div>

                        <div className="relative z-10 text-center px-4">
                            <p dir="rtl" className={`text-5xl md:text-6xl lg:text-[5rem] leading-[2.2] text-[#3a2e20] dark:text-[#e4d2b2] ${arabicFont}`} style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.05)' }}>
                                ۞ قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن تَسْتَطِيعَ مَعِيَ صَبْرًا
                            </p>

                            {/* Ayah End Marker */}
                            <div className="mt-8 relative inline-flex items-center justify-center w-16 h-16 text-[#8b6d41] dark:text-[#a38c6b]">
                                <svg className="absolute w-full h-full opacity-60" viewBox="0 0 100 100">
                                    <path d="M50 5 L60 40 L95 50 L60 60 L50 95 L40 60 L5 50 L40 40 Z" fill="currentColor" stroke="none" />
                                </svg>
                                <span className="relative z-10 font-bold text-lg leading-none" style={{ paddingTop: '2px' }}>٧٥</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

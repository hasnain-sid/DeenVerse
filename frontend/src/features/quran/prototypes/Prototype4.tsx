import React, { useState } from 'react';
import { Maximize2, Settings, BookOpen, Type } from 'lucide-react';

export default function Prototype4() {
  const [showControls, setShowControls] = useState(false);
  const [arabicFont, setArabicFont] = useState('font-sans');
  const [showTafseer, setShowTafseer] = useState(false);
  const [tafseerScope, setTafseerScope] = useState<'ayah' | 'ruku' | 'juzz'>('ayah');

  return (
    <div 
      className="max-w-4xl mx-auto min-h-[600px] bg-zinc-950 rounded-3xl overflow-hidden relative flex flex-col items-center justify-center p-12 transition-all duration-500"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Floating Top Bar */}
      <div className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-zinc-400 text-sm font-medium tracking-widest uppercase">
          Juzz 16 • Al-Kahf
        </div>
        <div className="flex gap-3">
          <select 
            value={arabicFont}
            onChange={(e) => setArabicFont(e.target.value)}
            className="bg-zinc-900/80 text-zinc-300 text-xs border border-zinc-800 rounded-full px-3 py-1.5 outline-none backdrop-blur-sm"
          >
            <option value="font-sans">Standard</option>
            <option value="font-serif">Uthmani</option>
            <option value="font-mono">IndoPak</option>
          </select>
          <button className="p-2 bg-zinc-900/80 text-zinc-400 hover:text-white rounded-full backdrop-blur-sm border border-zinc-800 transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl text-center space-y-12 z-10">
        {/* Arabic */}
        <p 
          dir="rtl" 
          className={`text-5xl md:text-6xl leading-[2] text-emerald-400 drop-shadow-lg transition-all duration-500 ${arabicFont}`}
        >
          ۞ قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن تَسْتَطِيعَ مَعِيَ صَبْرًا
        </p>

        {/* Translation */}
        <p className={`text-xl text-zinc-300 font-light leading-relaxed transition-opacity duration-500 ${showTafseer ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          "[Al-Khidhr] said, 'Did I not tell you that with me you would never be able to have patience?'"
        </p>

        {/* Tafseer Overlay */}
        {showTafseer && (
          <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl text-left animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-4">
              <h3 className="text-emerald-400 font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Tafseer Ibn Kathir
              </h3>
              <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {(['ayah', 'ruku', 'juzz'] as const).map((scope) => (
                  <button
                    key={scope}
                    onClick={() => setTafseerScope(scope)}
                    className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${tafseerScope === scope ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {scope}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              This verse demonstrates the condition set by Al-Khidhr to Musa (peace be upon him). It highlights the difficulty of remaining patient when witnessing events whose inner wisdom is hidden from us. The repetition of the warning emphasizes the gravity of the agreement they made.
            </p>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button 
          onClick={() => setShowTafseer(!showTafseer)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium shadow-lg shadow-emerald-900/20 transition-all"
        >
          <BookOpen className="w-4 h-4" />
          {showTafseer ? 'Show Translation' : 'Read Tafseer'}
        </button>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}

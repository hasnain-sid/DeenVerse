import { useState } from 'react';
import { AlignRight, Settings2, Type } from 'lucide-react';

export default function Prototype2() {
  const [arabicFont, setArabicFont] = useState('font-sans');
  const [tafseerScope, setTafseerScope] = useState<'ayah' | 'ruku' | 'juzz'>('ayah');

  return (
    <div className="max-w-5xl mx-auto bg-zinc-50 dark:bg-zinc-950 rounded-3xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row">
      
      {/* Left Panel: Translation & Tafseer */}
      <div className="w-full md:w-1/2 p-8 bg-white dark:bg-zinc-900 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full">
            Al-Kahf 18:75
          </span>
          <div className="flex gap-2">
            <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-8">
          {/* Translation */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Translation</h4>
            <p className="text-xl text-zinc-800 dark:text-zinc-100 leading-relaxed font-serif">
              "[Al-Khidhr] said, 'Did I not tell you that with me you would never be able to have patience?'"
            </p>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Tafseer Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tafseer</h4>
              <select 
                value={tafseerScope}
                onChange={(e) => setTafseerScope(e.target.value as any)}
                className="text-xs bg-zinc-100 dark:bg-zinc-800 border-none rounded-md px-2 py-1 text-zinc-600 dark:text-zinc-300 focus:ring-0 cursor-pointer"
              >
                <option value="ayah">This Ayah</option>
                <option value="ruku">Full Ruku</option>
                <option value="juzz">Full Juzz</option>
              </select>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <strong className="text-zinc-900 dark:text-zinc-100 font-medium">Ibn Kathir:</strong> The condition set by Al-Khidhr to Musa (peace be upon him) highlights the difficulty of remaining patient when witnessing events whose inner wisdom is hidden from us...
              </p>
              <button className="mt-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline flex items-center gap-1">
                Read full tafseer <AlignRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Arabic Text */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center relative bg-emerald-900/5 dark:bg-emerald-900/10">
        {/* Font Selector Overlay */}
        <div className="absolute top-6 right-6 flex gap-2">
          {['font-sans', 'font-serif', 'font-mono'].map((f, i) => (
            <button 
              key={f}
              onClick={() => setArabicFont(f)}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${arabicFont === f ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
              title={`Font Option ${i + 1}`}
            >
              <Type className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="text-center space-y-6 mt-12">
          <p className="text-sm font-medium text-emerald-600/60 dark:text-emerald-400/60 tracking-widest uppercase">
            Juzz 16
          </p>
          <p 
            dir="rtl" 
            className={`text-4xl md:text-5xl leading-[2.5] text-emerald-800 dark:text-emerald-300 ${arabicFont}`}
          >
            ۞ قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن تَسْتَطِيعَ مَعِيَ صَبْرًا
          </p>
          <div className="w-12 h-12 mx-auto border-2 border-emerald-200 dark:border-emerald-800 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-500 font-bold">
            ٧٥
          </div>
        </div>
      </div>

    </div>
  );
}

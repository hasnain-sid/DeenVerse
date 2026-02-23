import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Layers } from 'lucide-react';

export default function Prototype3() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [arabicFont, setArabicFont] = useState('font-sans');
  const [tafseerScope, setTafseerScope] = useState<'ayah' | 'ruku' | 'juzz'>('ayah');

  return (
    <div className="max-w-3xl mx-auto">
      {/* Global Toolbar */}
      <div className="flex justify-between items-center mb-4 px-4 py-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <Layers className="w-4 h-4 text-emerald-500" />
          Juzz 16 • Surah Al-Kahf
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">Arabic Font:</span>
          <select 
            value={arabicFont}
            onChange={(e) => setArabicFont(e.target.value)}
            className="text-sm bg-zinc-100 dark:bg-zinc-800 border-none rounded-md px-2 py-1 text-zinc-700 dark:text-zinc-200 focus:ring-0 cursor-pointer"
          >
            <option value="font-sans">Standard Naskh</option>
            <option value="font-serif">Uthmani</option>
            <option value="font-mono">IndoPak</option>
          </select>
        </div>
      </div>

      {/* Ayah List Item */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700/50">
        <div className="p-6">
          {/* Ayah Header */}
          <div className="flex justify-between items-start mb-4">
            <span className="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-sm font-bold">
              75
            </span>
            <div className="flex-1 ml-4">
              <p dir="rtl" className={`text-3xl leading-loose text-right text-zinc-900 dark:text-zinc-100 ${arabicFont}`}>
                ۞ قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن تَسْتَطِيعَ مَعِيَ صَبْرًا
              </p>
            </div>
          </div>

          {/* Translation */}
          <div className="pl-12">
            <p className="text-zinc-600 dark:text-zinc-300 text-lg">
              "[Al-Khidhr] said, 'Did I not tell you that with me you would never be able to have patience?'"
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            {isExpanded ? 'Hide Tafseer' : 'Read Tafseer'}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <div className="flex gap-2">
            {/* Quick actions could go here */}
          </div>
        </div>

        {/* Expandable Tafseer Section */}
        {isExpanded && (
          <div className="px-6 py-5 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">Tafseer Ibn Kathir</h4>
              
              {/* Scope Selector */}
              <div className="flex bg-zinc-200/50 dark:bg-zinc-800 p-1 rounded-lg">
                {(['ayah', 'ruku', 'juzz'] as const).map((scope) => (
                  <button
                    key={scope}
                    onClick={() => setTafseerScope(scope)}
                    className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${tafseerScope === scope ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                  >
                    {scope}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
              <p>
                <strong>Context ({tafseerScope}):</strong> This verse demonstrates the condition set by Al-Khidhr to Musa (peace be upon him). It highlights the difficulty of remaining patient when witnessing events whose inner wisdom is hidden from us. The repetition of the warning emphasizes the gravity of the agreement they made.
              </p>
              <p className="mt-2">
                Musa's haste in questioning the actions of Al-Khidhr shows the natural human inclination to judge based on outward appearances, whereas Al-Khidhr was acting upon divine revelation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';

const MOCK_DATA = {
  arabic: "فَسَوْفَ تَعْلَمُونَ مَن يَأْتِيهِ عَذَابٌ يُخْزِيهِ وَيَحِلُّ عَلَيْهِ عَذَابٌ مُّقِيمٌ",
  translation: "\"And you are going to know who will get a punishment that will disgrace him [on earth] and upon whom will descend an enduring punishment [in the Hereafter].\"",
  reference: "Hud (11:39)",
  reflectionTitle: "Observe Allah's Signs",
  reflectionText: "The Quran points to the natural world as signs (ayat) of Allah — in the sky, the mountains, the rain, and in ourselves.",
  actionItem: "Step outside today, look at the sky or a plant, and spend 30 seconds reflecting: \"SubhanAllah — this is from You.\""
};

export default function Prototype4() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="max-w-2xl mx-auto bg-[#fcfbf9] dark:bg-[#121212] min-h-[600px] p-8 md:p-16 font-serif text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      
      <div className="text-center mb-16">
        <span className="text-xs font-sans tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
          Daily Reflection
        </span>
      </div>

      <div className="space-y-12">
        {/* Verse Section */}
        <div className="space-y-8">
          <p dir="rtl" className="text-4xl md:text-5xl leading-[2.5] text-center text-zinc-900 dark:text-zinc-100">
            {MOCK_DATA.arabic}
          </p>
          
          <div className="max-w-lg mx-auto text-center">
            <p className="text-xl leading-relaxed text-zinc-600 dark:text-zinc-400 italic mb-4">
              {MOCK_DATA.translation}
            </p>
            <p className="text-sm font-sans text-zinc-400 dark:text-zinc-500">
              — {MOCK_DATA.reference}
            </p>
          </div>
        </div>

        <div className="w-12 h-px bg-zinc-300 dark:bg-zinc-800 mx-auto"></div>

        {/* Reflection Section */}
        <div className="max-w-lg mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100">
            {MOCK_DATA.reflectionTitle}
          </h2>
          <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 text-justify">
            {MOCK_DATA.reflectionText}
          </p>
        </div>

        {/* Action Item (Minimalist Checklist) */}
        <div className="max-w-lg mx-auto pt-8">
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="mt-1 relative flex items-center justify-center">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={checked}
                onChange={() => setChecked(!checked)}
              />
              <div className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 rounded transition-colors peer-checked:bg-zinc-900 peer-checked:border-zinc-900 dark:peer-checked:bg-white dark:peer-checked:border-white flex items-center justify-center">
                <CheckSquare className={`w-4 h-4 text-white dark:text-zinc-900 transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </div>
            <div className={`transition-opacity duration-300 ${checked ? 'opacity-50 line-through' : 'opacity-100'}`}>
              <span className="block text-sm font-sans font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Practical Action
              </span>
              <span className="text-lg text-zinc-800 dark:text-zinc-200">
                {MOCK_DATA.actionItem}
              </span>
            </div>
          </label>
        </div>

      </div>
    </div>
  );
}

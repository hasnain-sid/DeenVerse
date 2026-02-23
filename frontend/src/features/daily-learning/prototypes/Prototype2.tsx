import { useState } from 'react';
import { CheckCircle2, Target } from 'lucide-react';

const MOCK_DATA = {
  arabic: "فَسَوْفَ تَعْلَمُونَ مَن يَأْتِيهِ عَذَابٌ يُخْزِيهِ وَيَحِلُّ عَلَيْهِ عَذَابٌ مُّقِيمٌ",
  translation: "\"And you are going to know who will get a punishment that will disgrace him [on earth] and upon whom will descend an enduring punishment [in the Hereafter].\"",
  reference: "Hud (11:39)",
  reflectionTitle: "Observe Allah's Signs",
  reflectionText: "The Quran points to the natural world as signs (ayat) of Allah — in the sky, the mountains, the rain, and in ourselves.",
  actionItem: "Step outside today, look at the sky or a plant, and spend 30 seconds reflecting: \"SubhanAllah — this is from You.\""
};

export default function Prototype2() {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800">
      {/* Hero Banner for Ayah */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 p-10 md:p-16 text-center relative overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold tracking-widest uppercase rounded-full mb-8 border border-emerald-500/30">
            Daily Ayah • {MOCK_DATA.reference}
          </span>
          
          <p dir="rtl" className="text-4xl md:text-5xl leading-[2.2] text-white font-serif mb-8 drop-shadow-md">
            {MOCK_DATA.arabic}
          </p>
          
          <p className="text-xl text-emerald-50/90 font-light leading-relaxed max-w-2xl mx-auto">
            {MOCK_DATA.translation}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 md:p-12 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 text-center">
            {MOCK_DATA.reflectionTitle}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed text-center mb-10">
            {MOCK_DATA.reflectionText}
          </p>

          {/* Action Card */}
          <div className={`relative p-8 rounded-2xl border-2 transition-all duration-500 ${
            completed 
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 shadow-emerald-500/20 shadow-lg' 
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full shrink-0 ${completed ? 'bg-emerald-500 text-white' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'}`}>
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Today's Action</h3>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  {MOCK_DATA.actionItem}
                </p>
                
                <button 
                  onClick={() => setCompleted(!completed)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                    completed 
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 active:scale-95'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 ${completed ? 'text-emerald-500' : ''}`} />
                  {completed ? 'Completed!' : 'Mark as Done'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

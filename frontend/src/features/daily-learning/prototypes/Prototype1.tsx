import { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

const MOCK_DATA = {
  arabic: "فَسَوْفَ تَعْلَمُونَ مَن يَأْتِيهِ عَذَابٌ يُخْزِيهِ وَيَحِلُّ عَلَيْهِ عَذَابٌ مُّقِيمٌ",
  translation: "\"And you are going to know who will get a punishment that will disgrace him [on earth] and upon whom will descend an enduring punishment [in the Hereafter].\"",
  reference: "Hud (11:39) • Juzz 12 • Page 226",
  reflectionTitle: "Observe Allah's Signs",
  reflectionText: "The Quran points to the natural world as signs (ayat) of Allah — in the sky, the mountains, the rain, and in ourselves.",
  actionItem: "Step outside today, look at the sky or a plant, and spend 30 seconds reflecting: \"SubhanAllah — this is from You.\""
};

export default function Prototype1() {
  const [scope, setScope] = useState<'Ayah' | 'Ruku' | 'Juzz'>('Ayah');
  const [completed, setCompleted] = useState(false);

  return (
    <div className="min-h-[600px] bg-[#0a0a0a] text-white p-6 md:p-10 font-sans rounded-3xl border border-zinc-800 shadow-2xl max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-emerald-500" />
          <h1 className="text-2xl font-bold tracking-tight">Daily Learning</h1>
        </div>
        
        {/* Scope Toggle */}
        <div className="flex bg-zinc-900/80 rounded-full p-1 border border-zinc-800">
          {(['Ayah', 'Ruku', 'Juzz'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                scope === s 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Ayah Card */}
        <div className="bg-[#0f0f0f] border border-zinc-800/60 rounded-2xl p-8 flex flex-col justify-between">
          <div className="mb-12">
            <p dir="rtl" className="text-4xl md:text-5xl leading-[2.2] text-emerald-500 font-serif text-right">
              {MOCK_DATA.arabic}
            </p>
          </div>
          
          <div>
            <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-4">Translation</h3>
            <p className="text-lg text-zinc-100 leading-relaxed mb-6 font-medium">
              {MOCK_DATA.translation}
            </p>
            <p className="text-sm text-emerald-600/80 font-medium">
              {MOCK_DATA.reference}
            </p>
          </div>
        </div>

        {/* Right Column: Reflection Card */}
        <div className="bg-[#141414] border border-zinc-800/60 rounded-2xl p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-4">
            {MOCK_DATA.reflectionTitle}
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            {MOCK_DATA.reflectionText}
          </p>

          {/* Action Item Box */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 text-emerald-500 font-semibold mb-3">
              <Sparkles className="w-5 h-5" />
              <span>Action Item</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              {MOCK_DATA.actionItem}
            </p>
          </div>

          {/* Completion Button */}
          <div className="mt-auto">
            <button 
              onClick={() => setCompleted(!completed)}
              className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                completed 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/50'
              }`}
            >
              {completed ? '✓ Reflection Completed' : 'I completed this reflection'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

const MOCK_DATA = {
  arabic: "فَسَوْفَ تَعْلَمُونَ مَن يَأْتِيهِ عَذَابٌ يُخْزِيهِ وَيَحِلُّ عَلَيْهِ عَذَابٌ مُّقِيمٌ",
  translation: "\"And you are going to know who will get a punishment that will disgrace him [on earth] and upon whom will descend an enduring punishment [in the Hereafter].\"",
  reference: "Hud (11:39)",
  reflectionTitle: "Observe Allah's Signs",
  reflectionText: "The Quran points to the natural world as signs (ayat) of Allah — in the sky, the mountains, the rain, and in ourselves.",
  actionItem: "Step outside today, look at the sky or a plant, and spend 30 seconds reflecting: \"SubhanAllah — this is from You.\""
};

export default function Prototype5() {
  const [cardIndex, setCardIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const cards = [
    {
      type: 'ayah',
      content: (
        <div className="flex flex-col h-full justify-center items-center text-center space-y-8 p-8">
          <span className="text-sm font-medium text-emerald-600/80 dark:text-emerald-400/80 tracking-widest uppercase">
            {MOCK_DATA.reference}
          </span>
          <p dir="rtl" className="text-4xl md:text-5xl leading-[2.2] text-zinc-900 dark:text-white font-serif">
            {MOCK_DATA.arabic}
          </p>
        </div>
      )
    },
    {
      type: 'translation',
      content: (
        <div className="flex flex-col h-full justify-center items-center text-center space-y-6 p-8">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Translation</h3>
          <p className="text-2xl text-zinc-800 dark:text-zinc-200 leading-relaxed font-light">
            {MOCK_DATA.translation}
          </p>
        </div>
      )
    },
    {
      type: 'reflection',
      content: (
        <div className="flex flex-col h-full justify-center items-center text-center space-y-6 p-8">
          <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Reflection</h3>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
            {MOCK_DATA.reflectionTitle}
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {MOCK_DATA.reflectionText}
          </p>
        </div>
      )
    },
    {
      type: 'action',
      content: (
        <div className="flex flex-col h-full justify-center items-center text-center space-y-8 p-8">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Action Item
          </h2>
          <p className="text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            {MOCK_DATA.actionItem}
          </p>
        </div>
      )
    }
  ];

  const nextCard = () => setCardIndex(Math.min(cards.length - 1, cardIndex + 1));
  const prevCard = () => setCardIndex(Math.max(0, cardIndex - 1));

  return (
    <div className="max-w-md mx-auto h-[650px] bg-zinc-100 dark:bg-zinc-950 rounded-[2.5rem] p-4 shadow-2xl border-8 border-zinc-200 dark:border-zinc-900 relative overflow-hidden flex flex-col">
      
      {/* Progress Bar */}
      <div className="flex gap-2 mb-4 px-2 pt-2">
        {cards.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              idx <= cardIndex ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-800'
            }`}
          />
        ))}
      </div>

      {/* Card Content Area */}
      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
        {/* Swipeable Container (Simulated with absolute positioning and transitions) */}
        <div 
          className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${cardIndex * 100}%)` }}
        >
          {cards.map((card, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0">
              {card.content}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="mt-4 flex justify-between items-center px-2 pb-2">
        <button 
          onClick={prevCard}
          disabled={cardIndex === 0}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            cardIndex === 0 
              ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed' 
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {cardIndex === cards.length - 1 ? (
          <button 
            onClick={() => setCompleted(!completed)}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              completed 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600'
            }`}
          >
            {completed ? 'Completed' : 'Mark Done'}
          </button>
        ) : (
          <button 
            onClick={nextCard}
            className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

    </div>
  );
}

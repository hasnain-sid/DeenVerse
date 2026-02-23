import { useState } from 'react';
import { ArrowRight, Check, Book, Lightbulb, Activity } from 'lucide-react';

const MOCK_DATA = {
  arabic: "فَسَوْفَ تَعْلَمُونَ مَن يَأْتِيهِ عَذَابٌ يُخْزِيهِ وَيَحِلُّ عَلَيْهِ عَذَابٌ مُّقِيمٌ",
  translation: "\"And you are going to know who will get a punishment that will disgrace him [on earth] and upon whom will descend an enduring punishment [in the Hereafter].\"",
  reference: "Hud (11:39)",
  reflectionTitle: "Observe Allah's Signs",
  reflectionText: "The Quran points to the natural world as signs (ayat) of Allah — in the sky, the mountains, the rain, and in ourselves.",
  actionItem: "Step outside today, look at the sky or a plant, and spend 30 seconds reflecting: \"SubhanAllah — this is from You.\""
};

export default function Prototype3() {
  const [step, setStep] = useState(1);

  const steps = [
    { id: 1, title: 'Recite', icon: Book },
    { id: 2, title: 'Reflect', icon: Lightbulb },
    { id: 3, title: 'Act', icon: Activity },
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 min-h-[500px] flex flex-col">
      
      {/* Stepper Header */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-100 dark:bg-zinc-800 -z-10 rounded-full"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>
        
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = step >= s.id;
          const isCurrent = step === s.id;
          
          return (
            <div key={s.id} className="flex flex-col items-center gap-2 bg-white dark:bg-zinc-900 px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                isActive 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'
              }`}>
                {step > s.id ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500" key={step}>
        
        {step === 1 && (
          <div className="text-center space-y-8">
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
              {MOCK_DATA.reference}
            </span>
            <p dir="rtl" className="text-4xl md:text-5xl leading-[2.2] text-zinc-900 dark:text-zinc-100 font-serif">
              {MOCK_DATA.arabic}
            </p>
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              {MOCK_DATA.translation}
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-6 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
              {MOCK_DATA.reflectionTitle}
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {MOCK_DATA.reflectionText}
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-8 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <Activity className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                Your Mission Today
              </h2>
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl">
                <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {MOCK_DATA.actionItem}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div className="mt-12 flex justify-between items-center pt-6 border-t border-zinc-100 dark:border-zinc-800">
        <button 
          onClick={() => setStep(Math.max(1, step - 1))}
          className={`px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors ${step === 1 ? 'invisible' : ''}`}
        >
          Back
        </button>
        
        {step < 3 ? (
          <button 
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={() => alert('Reflection saved!')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Check className="w-5 h-5" /> Complete Daily Learning
          </button>
        )}
      </div>
    </div>
  );
}
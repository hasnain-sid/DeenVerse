import React, { useState } from 'react';
import Prototype1 from './Prototype1';
import Prototype2 from './Prototype2';
import Prototype3 from './Prototype3';
import Prototype4 from './Prototype4';
import Prototype5 from './Prototype5';
import Prototype6 from './Prototype6';
import Prototype7 from './Prototype7';
import Prototype8 from './Prototype8';
import Prototype9 from './Prototype9';
import Prototype10 from './Prototype10';
import Prototype11 from './Prototype11';
import Prototype12 from './Prototype12';
import Prototype13 from './Prototype13';
import Prototype14 from './Prototype14';
import Prototype15 from './Prototype15';

export default function PrototypesViewer() {
  const [activePrototype, setActivePrototype] = useState(1);

  const renderPrototype = () => {
    switch (activePrototype) {
      case 1: return <Prototype1 />;
      case 2: return <Prototype2 />;
      case 3: return <Prototype3 />;
      case 4: return <Prototype4 />;
      case 5: return <Prototype5 />;
      case 6: return <Prototype6 />;
      case 7: return <Prototype7 />;
      case 8: return <Prototype8 />;
      case 9: return <Prototype9 />;
      case 10: return <Prototype10 />;
      case 11: return <Prototype11 />;
      case 12: return <Prototype12 />;
      case 13: return <Prototype13 />;
      case 14: return <Prototype14 />;
      case 15: return <Prototype15 />;
      default: return <Prototype1 />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col items-start gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Quran UI Prototypes</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a prototype to view the design</p>
          </div>

          <div className="w-full">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Original & Others</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setActivePrototype(num)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activePrototype === num
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">Daily Ayah + Practical Concept</h2>
            <div className="flex flex-wrap gap-2">
              {[11, 12, 13, 14, 15].map((num) => (
                <button
                  key={num}
                  onClick={() => setActivePrototype(num)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${activePrototype === num
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                >
                  {num === 11 ? '11: Morning Briefing' :
                    num === 12 ? '12: Story Mode' :
                      num === 13 ? '13: Journal Prompt' :
                        num === 14 ? '14: Action Checklist' :
                          '15: Deep Dive Article'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="transition-all duration-300">
        {renderPrototype()}
      </div>
    </div>
  );
}

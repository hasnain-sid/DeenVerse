import { useState } from 'react';
import Prototype1 from './Prototype1';
import Prototype2 from './Prototype2';
import Prototype3 from './Prototype3';
import Prototype4 from './Prototype4';
import Prototype5 from './Prototype5';

export default function PrototypesViewer() {
  const [activePrototype, setActivePrototype] = useState(1);

  const renderPrototype = () => {
    switch (activePrototype) {
      case 1: return <Prototype1 />;
      case 2: return <Prototype2 />;
      case 3: return <Prototype3 />;
      case 4: return <Prototype4 />;
      case 5: return <Prototype5 />;
      default: return <Prototype1 />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Daily Learning Prototypes</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a prototype to view the design</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setActivePrototype(num)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePrototype === num 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                Prototype {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="transition-all duration-300">
        {renderPrototype()}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { BookOpen, Settings, Info, Check, AlignRight, Book, LayoutList } from 'lucide-react';

type ReadingMode = 'ayah' | 'ruku' | 'juzz';

const mockAyahs = [
  { text: "۞ قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن تَسْتَطِيعَ مَعِيَ صَبْرًا", trans: "\"[Al-Khidhr] said, 'Did I not tell you that with me you would never be able to have patience?'\"", num: "75" },
  { text: "قَالَ إِن سَأَلْتُكَ عَن شَيْءٍ بَعْدَهَا فَلَا تُصَاحِبْنِي ۖ قَدْ بَلَغْتَ مِن لَّدُنِّي عُذْرًا", trans: "[Moses] said, 'If I should ask you about anything after this, then do not keep me as a companion. You have obtained from me an excuse.'", num: "76" },
  { text: "فَانطَلَقَا حَتَّىٰ إِذَا أَتَيَا أَهْلَ قَرْيَةٍ اسْتَطْعَمَا أَهْلَهَا فَأَبَوْا أَن يُضَيِّفُوهُمَا فَوَجَدَا فِيهَا جِدَارًا يُرِيدُ أَن يَنقَضَّ فَأَقَامَهُ ۖ قَالَ لَوْ شِئْتَ لَاتَّخَذْتَ عَلَيْهِ أَجْرًا", trans: "So they set out, until when they came to the people of a town, they asked its people for food, but they refused to offer them hospitality. And they found therein a wall about to collapse, so he [Al-Khidhr] restored it. [Moses] said, 'If you wished, you could have taken for it a payment.'", num: "77" }
];

export default function Prototype1() {
  const [readingMode, setReadingMode] = useState<ReadingMode>('ayah');
  const [activeTab, setActiveTab] = useState<'translation' | 'tafseer'>('translation');
  const [arabicFont, setArabicFont] = useState('font-serif');
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-[600px] flex flex-col">
      {/* Top Segmented Control */}
      <div className="flex justify-center mb-10 mt-4">
        <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-900/80 rounded-2xl shadow-inner border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
          {(['ayah', 'ruku', 'juzz'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setReadingMode(mode)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${readingMode === mode
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
            >
              {mode === 'ayah' && <AlignRight className="w-4 h-4" />}
              {mode === 'ruku' && <LayoutList className="w-4 h-4" />}
              {mode === 'juzz' && <Book className="w-4 h-4" />}
              <span className="capitalize">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="flex-1 bg-white dark:bg-zinc-950 rounded-[2rem] shadow-xl shadow-zinc-200/20 dark:shadow-black/40 border border-zinc-100 dark:border-zinc-800/60 overflow-hidden relative">

        {/* Subtle Decorative Header Pattern */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-50/50 dark:from-emerald-900/10 to-transparent pointer-events-none"></div>

        <div className="p-8 md:p-12 relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {readingMode === 'ayah' ? 'Surah Al-Kahf' : readingMode === 'ruku' ? 'Ruku 10' : 'Juzz 16'}
              </h2>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500 mt-1">
                {readingMode === 'ayah' ? 'Verse 75' : readingMode === 'ruku' ? 'Verses 75-82' : 'Pages 302-321'}
              </p>
            </div>

            {/* Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 transition-colors border border-zinc-200 dark:border-zinc-800"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 p-2 z-20 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Arabic Style</div>
                  {(['font-sans', 'font-serif', 'font-mono']).map(font => (
                    <button
                      key={font}
                      onClick={() => { setArabicFont(font); setShowSettings(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      {font === 'font-sans' ? 'Standard Naskh' : font === 'font-serif' ? 'Uthmani (Hafs)' : 'IndoPak'}
                      {arabicFont === font && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Content Based on Mode */}
          <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
            {readingMode === 'ayah' && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-12">
                  <p dir="rtl" className={`text-4xl leading-[2.5] text-center text-zinc-800 dark:text-zinc-100 ${arabicFont}`}>
                    {mockAyahs[0].text} <span className="text-emerald-600 dark:text-emerald-500 opacity-60 ml-2">﴿{mockAyahs[0].num}﴾</span>
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-2 flex">
                  {(['translation', 'tafseer'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl capitalize transition-all duration-300 ${activeTab === tab
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="mt-8 px-4">
                  {activeTab === 'translation' ? (
                    <div className="space-y-4 animate-in fade-in">
                      <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif">
                        {mockAyahs[0].trans}
                      </p>
                      <p className="text-sm font-medium text-emerald-600/80 dark:text-emerald-500/80">— Sahih International</p>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Tafseer Ibn Kathir</h4>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed prose prose-zinc dark:prose-invert">
                        This verse demonstrates the condition set by Al-Khidhr to Musa (peace be upon him). It highlights the difficulty of remaining patient when witnessing events whose inner wisdom is hidden from us. The repetition of the warning emphasizes the gravity of the agreement.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {readingMode === 'ruku' && (
              <div className="space-y-12 max-w-3xl mx-auto">
                {mockAyahs.map((ayah, idx) => (
                  <div key={idx} className="group pb-12 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 last:pb-0 relative">
                    <p dir="rtl" className={`text-3xl leading-[2.5] text-right mb-6 text-zinc-800 dark:text-zinc-100 ${arabicFont}`}>
                      {ayah.text} <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-500 text-sm opacity-80 mr-2">
                        {ayah.num}
                      </span>
                    </p>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-serif pl-6 border-l-2 border-zinc-200 dark:border-zinc-800">
                      {ayah.trans}
                    </p>

                    {/* Hover actions */}
                    <div className="absolute top-0 right-full mr-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                      <button className="p-2 rounded-full bg-zinc-50 hover:bg-emerald-50 dark:bg-zinc-900 dark:hover:bg-emerald-900/20 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                        <BookOpen className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {readingMode === 'juzz' && (
              <div className="col-span-1 md:col-span-2 prose prose-lg dark:prose-invert max-w-3xl mx-auto">
                <div className="p-10 bg-[#FFFDF7] dark:bg-zinc-900 rounded-[2rem] border border-[#F2EFE9] dark:border-zinc-800 shadow-inner">
                  <p dir="rtl" className={`text-[2rem] leading-[2.8] text-justify text-zinc-800 dark:text-zinc-200 ${arabicFont}`}>
                    {mockAyahs.map(a => a.text).join(' ۝ ')} <span className="opacity-80">۝</span> {mockAyahs.map(a => a.text).reverse().join(' ۝ ')} <span className="opacity-80">۝</span>
                  </p>

                  <div className="mt-8 flex justify-center">
                    <span className="text-sm font-medium text-emerald-600/60 dark:text-emerald-500/60 font-serif tracking-widest uppercase">Page 302</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


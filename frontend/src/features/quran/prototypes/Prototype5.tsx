import { useState } from 'react';

export default function Prototype5() {
  const [arabicFont, setArabicFont] = useState('font-serif');
  const [tafseerScope, setTafseerScope] = useState<'ayah' | 'ruku' | 'juzz'>('ayah');

  return (
    <div className="max-w-4xl mx-auto bg-[#fdfbf7] dark:bg-[#1a1918] rounded-sm shadow-2xl border-8 border-[#e8e4d9] dark:border-[#2a2826] overflow-hidden relative">
      
      {/* Page Header (Ornate) */}
      <div className="flex justify-between items-center px-8 py-4 border-b-2 border-[#e8e4d9] dark:border-[#2a2826] bg-[#f4f1e8] dark:bg-[#22201e]">
        <div className="text-[#8c7b62] dark:text-[#a3947c] font-serif text-sm tracking-widest uppercase">
          Juzz 16
        </div>
        <div className="text-[#8c7b62] dark:text-[#a3947c] font-serif text-sm tracking-widest uppercase">
          Surah Al-Kahf
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-10 md:p-16">
        
        {/* Settings Bar (Subtle) */}
        <div className="flex justify-end mb-8 opacity-50 hover:opacity-100 transition-opacity">
          <select 
            value={arabicFont}
            onChange={(e) => setArabicFont(e.target.value)}
            className="text-xs bg-transparent border border-[#d4cebd] dark:border-[#403d39] text-[#5c5446] dark:text-[#b5ab9a] rounded px-2 py-1 outline-none"
          >
            <option value="font-serif">Uthmani Script</option>
            <option value="font-sans">Standard Naskh</option>
            <option value="font-mono">IndoPak Script</option>
          </select>
        </div>

        {/* Arabic Text Block */}
        <div className="text-center mb-12 relative">
          <p 
            dir="rtl" 
            className={`text-4xl md:text-5xl leading-[2.5] text-[#2c2a26] dark:text-[#e6e2d8] ${arabicFont}`}
          >
            ۞ قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن تَسْتَطِيعَ مَعِيَ صَبْرًا
            <span className="inline-flex items-center justify-center w-10 h-10 mx-2 text-lg border border-[#d4cebd] dark:border-[#403d39] rounded-full text-[#8c7b62] dark:text-[#a3947c]">
              ٧٥
            </span>
          </p>
        </div>

        {/* Ornate Divider */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px bg-[#d4cebd] dark:bg-[#403d39] flex-1"></div>
          <div className="w-3 h-3 rotate-45 bg-[#8c7b62] dark:bg-[#a3947c]"></div>
          <div className="h-px bg-[#d4cebd] dark:bg-[#403d39] flex-1"></div>
        </div>

        {/* Two Column Layout for Translation & Tafseer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Translation Column */}
          <div>
            <h3 className="text-sm font-bold text-[#8c7b62] dark:text-[#a3947c] uppercase tracking-widest mb-4 border-b border-[#e8e4d9] dark:border-[#2a2826] pb-2">
              Translation
            </h3>
            <p className="text-lg text-[#4a4742] dark:text-[#c4bdaf] leading-relaxed font-serif">
              "[Al-Khidhr] said, 'Did I not tell you that with me you would never be able to have patience?'"
            </p>
          </div>

          {/* Tafseer Column */}
          <div>
            <div className="flex justify-between items-end mb-4 border-b border-[#e8e4d9] dark:border-[#2a2826] pb-2">
              <h3 className="text-sm font-bold text-[#8c7b62] dark:text-[#a3947c] uppercase tracking-widest">
                Tafseer
              </h3>
              <select 
                value={tafseerScope}
                onChange={(e) => setTafseerScope(e.target.value as any)}
                className="text-xs bg-transparent text-[#8c7b62] dark:text-[#a3947c] outline-none cursor-pointer"
              >
                <option value="ayah">This Ayah</option>
                <option value="ruku">Full Ruku</option>
                <option value="juzz">Full Juzz</option>
              </select>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-[#5c5446] dark:text-[#a8a193] leading-relaxed font-serif text-justify">
                <span className="text-2xl float-left mr-2 text-[#8c7b62] dark:text-[#a3947c]">T</span>
                his verse demonstrates the condition set by Al-Khidhr to Musa (peace be upon him). It highlights the difficulty of remaining patient when witnessing events whose inner wisdom is hidden from us. The repetition of the warning emphasizes the gravity of the agreement they made.
              </p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Page Footer */}
      <div className="text-center py-4 text-[#8c7b62] dark:text-[#a3947c] font-serif text-sm border-t-2 border-[#e8e4d9] dark:border-[#2a2826] bg-[#f4f1e8] dark:bg-[#22201e]">
        Page 302
      </div>
    </div>
  );
}

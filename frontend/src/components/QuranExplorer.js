import React, { useState, useEffect } from 'react';
import { MdSearch, MdTranslate, MdMenu, MdBookmark, MdShare, MdOutlineViewSidebar, MdClose, MdOutlineZoomOut, MdOutlineZoomIn, MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { FaQuran, FaBookOpen, FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const QuranExplorer = () => {
  // State variables
  const [currentSurah, setCurrentSurah] = useState(1);
  const [currentVerse, setCurrentVerse] = useState(1);
  const [translation, setTranslation] = useState('en-sahih');
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsirSource, setTafsirSource] = useState('ibn-kathir');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [arabicTextSize, setArabicTextSize] = useState(36);
  const [translationTextSize, setTranslationTextSize] = useState(16);
  
  // Mock data for surahs
  const surahs = [
    { id: 1, name: 'Al-Fatiha', arabicName: 'الفاتحة', versesCount: 7 },
    { id: 2, name: 'Al-Baqarah', arabicName: 'البقرة', versesCount: 286 },
    { id: 3, name: 'Ali \'Imran', arabicName: 'آل عمران', versesCount: 200 },
    // ... more surahs
  ];
  
  // Mock data for translations
  const translations = [
    { id: 'en-sahih', name: 'Sahih International', language: 'English' },
    { id: 'en-pickthall', name: 'Pickthall', language: 'English' },
    { id: 'ur-jalandhry', name: 'Jalandhry', language: 'Urdu' },
    { id: 'ar-muyassar', name: 'King Fahad Quran Complex', language: 'Arabic' },
  ];
  
  // Mock data for tafsir sources
  const tafsirSources = [
    { id: 'ibn-kathir', name: 'Ibn Kathir', language: 'English' },
    { id: 'maariful-quran', name: 'Maariful Quran', language: 'English' },
    { id: 'tabari', name: 'Tabari', language: 'Arabic' },
  ];
  
  // Mock verse data
  const verses = {
    1: [
      { 
        id: 1, 
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 
        translations: {
          'en-sahih': 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
          'en-pickthall': 'In the name of Allah, the Beneficent, the Merciful.',
          'ur-jalandhry': 'اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
        },
        tafsir: {
          'ibn-kathir': 'The Tafsir of Bismillah (In the Name of Allah, the Most Gracious, the Most Merciful). The Basmallah is the first Ayah of Al-Fatihah according to the majority of the scholars. Allah\'s statement "In the Name of Allah, the Most Gracious, the Most Merciful" means, I start with every name that belongs to Allah. Further, Allah\'s names qualify the most honored one, Who is Allah, meaning "I seek help from Allah by these names."',
          'maariful-quran': 'Every chapter of the Holy Qur\'an begins with this verse which has come to be known as the "Bismillah", with the sole exception of the Surah Al-Bara\'ah or Al-Taubah. Since the "Bismillah" appears at the head of every Surah and also at the beginning of every human action, the commentators of the Holy Qur\'an have laid great emphasis on this verse, and have given elaborate explanations of it. The verse means: "I begin with the name of Allah, the All-Merciful, the Very-Merciful."',
        },
        audio: 'https://audio.example.com/1/1.mp3',
      },
      { 
        id: 2, 
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 
        translations: {
          'en-sahih': 'All praise is due to Allah, Lord of the worlds',
          'en-pickthall': 'Praise be to Allah, Lord of the Worlds',
          'ur-jalandhry': 'سب طرح کی تعریف اللہ ہی کے لیے ہے جو تمام جہانوں کا پالنے والا ہے',
        },
        tafsir: {
          'ibn-kathir': 'Allah praises Himself for being the Lord of the worlds, meaning Master of all creation, their Owner, Creator, Provider and Sustainer. "Lord" means the owner who is worshipped and obeyed. Worlds refers to all that exists in the heavens and the earth and between them, including angels, humans, jinns, animals and all created things.',
          'maariful-quran': 'This verse begins with the phrase Al-hamdulillah, which has usually been translated into English as "praise be to Allah" or "all praise belongs to Allah". But the word "hamd" in Arabic is much more comprehensive than the English word "praise". The word "hamd" signifies not only the recognition of the excellence of someone, but also the admission that such excellence is beyond one\'s comprehension.',
        },
        audio: 'https://audio.example.com/1/2.mp3',
      },
      // ... more verses
    ],
    // ... more surahs
  };
  
  // Search function
  const searchQuran = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Mock search results
    const results = [
      { surahId: 1, verseId: 1, text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
      { surahId: 1, verseId: 3, text: 'The Entirely Merciful, the Especially Merciful.' },
      { surahId: 55, verseId: 1, text: 'The Most Merciful' },
      // ... more results
    ].filter(item => 
      item.text.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
  };
  
  // Effect for search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchQuran(searchQuery);
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);
  
  // Navigate to verse
  const goToVerse = (surahId, verseId) => {
    setCurrentSurah(surahId);
    setCurrentVerse(verseId);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control audio playback
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real app, this would control audio volume
  };
  
  // Next verse
  const nextVerse = () => {
    const currentSurahVerses = verses[currentSurah]?.length || 0;
    
    if (currentVerse < currentSurahVerses) {
      setCurrentVerse(currentVerse + 1);
    } else if (currentSurah < surahs.length) {
      // Move to next surah
      setCurrentSurah(currentSurah + 1);
      setCurrentVerse(1);
    }
  };
  
  // Previous verse
  const prevVerse = () => {
    if (currentVerse > 1) {
      setCurrentVerse(currentVerse - 1);
    } else if (currentSurah > 1) {
      // Move to previous surah's last verse
      const prevSurahId = currentSurah - 1;
      const prevSurahVerses = verses[prevSurahId]?.length || 1;
      setCurrentSurah(prevSurahId);
      setCurrentVerse(prevSurahVerses);
    }
  };
  
  // Get current verse data
  const currentVerseData = verses[currentSurah]?.[currentVerse - 1] || {
    arabic: '',
    translations: { [translation]: 'Verse not found' },
    tafsir: { [tafsirSource]: '' }
  };
  
  // Current surah info
  const currentSurahInfo = surahs.find(s => s.id === currentSurah) || { name: '', arabicName: '', versesCount: 0 };
  
  return (
    <div className="flex flex-col h-screen bg-theme-background">
      {/* Top navigation */}
      <div className="bg-theme-card-bg border-b border-theme-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <FaQuran className="text-theme-primary-accent text-2xl mr-2" />
            <h1 className="text-theme-text-primary text-xl font-bold">Quran Explorer</h1>
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="ml-4 p-2 rounded-full text-theme-text-secondary hover:bg-theme-border md:hidden"
            >
              <MdOutlineViewSidebar size={20} />
            </button>
          </div>
          
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the Quran..."
                className="w-full bg-theme-background border border-theme-border rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-theme-primary-accent"
              />
              <MdSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary" size={20} />
              
              {/* Search results dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-theme-card-bg border border-theme-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => goToVerse(result.surahId, result.verseId)}
                      className="block w-full text-left p-3 hover:bg-theme-background border-b border-theme-border last:border-b-0"
                    >
                      <div className="font-medium text-theme-text-primary">
                        {surahs.find(s => s.id === result.surahId)?.name} {result.verseId}
                      </div>
                      <div className="text-sm text-theme-text-secondary line-clamp-2">
                        {result.text}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="p-2 rounded-full text-theme-text-secondary hover:bg-theme-border">
              <MdBookmark size={20} />
            </button>
            <button className="p-2 rounded-full text-theme-text-secondary hover:bg-theme-border">
              <MdShare size={20} />
            </button>
            <select
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="bg-theme-background border border-theme-border rounded-md text-theme-text-primary px-2 py-1 text-sm"
            >
              {translations.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - list of surahs */}
        {showSidebar && (
          <div className="w-64 bg-theme-card-bg border-r border-theme-border overflow-y-auto hidden md:block">
            <div className="p-4 border-b border-theme-border">
              <h2 className="text-theme-text-primary font-semibold">Surahs</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {surahs.map(surah => (
                <button
                  key={surah.id}
                  onClick={() => goToVerse(surah.id, 1)}
                  className={`w-full text-left p-3 border-b border-theme-border hover:bg-theme-background ${
                    currentSurah === surah.id ? 'bg-theme-primary-accent bg-opacity-10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-theme-primary-accent bg-opacity-10 text-theme-primary-accent font-medium mr-2">
                        {surah.id}
                      </span>
                      <span className="text-theme-text-primary">{surah.name}</span>
                    </span>
                    <span className="text-theme-text-secondary text-sm">{surah.arabicName}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Mobile sidebar drawer */}
        {showSidebar && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowSidebar(false)}></div>
            <div className="absolute inset-y-0 left-0 w-64 bg-theme-card-bg shadow-lg">
              <div className="p-4 border-b border-theme-border flex justify-between items-center">
                <h2 className="text-theme-text-primary font-semibold">Surahs</h2>
                <button onClick={() => setShowSidebar(false)} className="text-theme-text-secondary">
                  <MdClose size={20} />
                </button>
              </div>
              <div className="overflow-y-auto h-full">
                {surahs.map(surah => (
                  <button
                    key={surah.id}
                    onClick={() => {
                      goToVerse(surah.id, 1);
                      setShowSidebar(false);
                    }}
                    className={`w-full text-left p-3 border-b border-theme-border ${
                      currentSurah === surah.id ? 'bg-theme-primary-accent bg-opacity-10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-theme-primary-accent bg-opacity-10 text-theme-primary-accent font-medium mr-2">
                          {surah.id}
                        </span>
                        <span className="text-theme-text-primary">{surah.name}</span>
                      </span>
                      <span className="text-theme-text-secondary text-sm">{surah.arabicName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Surah header */}
          <div className="p-6 bg-theme-primary-accent bg-opacity-10 border-b border-theme-border">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-1">
                Surah {currentSurahInfo.name} ({currentSurahInfo.arabicName})
              </h2>
              <div className="flex justify-between items-center">
                <span className="text-theme-text-secondary">
                  {currentVerse} of {currentSurahInfo.versesCount} verses
                </span>
                <div className="flex space-x-3">
                  <button 
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-theme-primary-accent text-white"
                  >
                    {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
                  </button>
                  <button 
                    onClick={toggleMute}
                    className="p-2 rounded-full bg-theme-background text-theme-text-primary"
                  >
                    {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Verse content */}
          <div className="p-6">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Arabic text */}
              <div className="text-right">
                <p 
                  className="font-arabic leading-loose" 
                  style={{ fontSize: `${arabicTextSize}px` }}
                >
                  {currentVerseData.arabic}
                </p>
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => setArabicTextSize(Math.max(24, arabicTextSize - 2))}
                    className="p-1 rounded-full bg-theme-background text-theme-text-secondary"
                  >
                    <MdOutlineZoomOut size={16} />
                  </button>
                  <button 
                    onClick={() => setArabicTextSize(Math.min(48, arabicTextSize + 2))}
                    className="p-1 rounded-full bg-theme-background text-theme-text-secondary ml-1"
                  >
                    <MdOutlineZoomIn size={16} />
                  </button>
                </div>
              </div>
              
              {/* Translation */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-theme-text-primary">Translation</h3>
                  <div className="flex items-center">
                    <MdTranslate className="text-theme-text-secondary mr-1" size={16} />
                    <span className="text-sm text-theme-text-secondary">
                      {translations.find(t => t.id === translation)?.name}
                    </span>
                  </div>
                </div>
                <p 
                  className="text-theme-text-primary leading-relaxed" 
                  style={{ fontSize: `${translationTextSize}px` }}
                >
                  {currentVerseData.translations[translation] || 'Translation not available'}
                </p>
                <div className="flex mt-2">
                  <button 
                    onClick={() => setTranslationTextSize(Math.max(12, translationTextSize - 1))}
                    className="p-1 rounded-full bg-theme-background text-theme-text-secondary"
                  >
                    <MdOutlineZoomOut size={16} />
                  </button>
                  <button 
                    onClick={() => setTranslationTextSize(Math.min(24, translationTextSize + 1))}
                    className="p-1 rounded-full bg-theme-background text-theme-text-secondary ml-1"
                  >
                    <MdOutlineZoomIn size={16} />
                  </button>
                </div>
              </div>
              
              {/* Tafsir (Exegesis) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-theme-text-primary">Tafsir (Exegesis)</h3>
                  <button 
                    onClick={() => setShowTafsir(!showTafsir)}
                    className="text-theme-primary-accent text-sm flex items-center"
                  >
                    <FaBookOpen className="mr-1" size={14} />
                    {showTafsir ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showTafsir && (
                  <div className="bg-theme-card-bg border border-theme-border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <select
                        value={tafsirSource}
                        onChange={(e) => setTafsirSource(e.target.value)}
                        className="bg-theme-background border border-theme-border rounded-md text-theme-text-primary px-2 py-1 text-sm"
                      >
                        {tafsirSources.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-theme-text-primary text-sm leading-relaxed">
                      {currentVerseData.tafsir[tafsirSource] || 'Tafsir not available'}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Navigation between verses */}
              <div className="flex justify-between pt-4 border-t border-theme-border">
                <button
                  onClick={prevVerse}
                  disabled={currentSurah === 1 && currentVerse === 1}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    currentSurah === 1 && currentVerse === 1
                      ? 'opacity-50 cursor-not-allowed bg-theme-background text-theme-text-secondary'
                      : 'bg-theme-background text-theme-text-primary hover:bg-theme-border'
                  }`}
                >
                  <MdOutlineKeyboardArrowLeft className="mr-1" size={20} />
                  Previous Verse
                </button>
                <button
                  onClick={nextVerse}
                  className="flex items-center px-4 py-2 rounded-lg bg-theme-background text-theme-text-primary hover:bg-theme-border"
                >
                  Next Verse
                  <MdOutlineKeyboardArrowRight className="ml-1" size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranExplorer;

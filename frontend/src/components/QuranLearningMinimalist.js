import React, { useState, useRef, useEffect } from 'react';
import {
  MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdScreenShare,
  MdChat, MdPeople, MdPanTool, MdSettings, MdFormatListBulleted,
  MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight, MdClose,
  MdVolumeUp, MdPlayArrow, MdPause, MdTranslate, MdBookmark,
  MdContentCopy, MdEdit, MdOutlineImageSearch, MdDownload
} from 'react-icons/md';
import { FaQuran, FaEraser, FaPen, FaUndo, FaRedo } from 'react-icons/fa';

const QuranLearningMinimalist = () => {
  // State variables
  const [activeTab, setActiveTab] = useState('whiteboard');
  const [showVideoPanel, setShowVideoPanel] = useState(true);
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(1);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedTool, setSelectedTool] = useState('pen');
  const [isPlaying, setIsPlaying] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  
  // Refs
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const chatInputRef = useRef(null);
  
  // Toggle functions
  const toggleMic = () => setMicEnabled(!micEnabled);
  const toggleVideo = () => setVideoEnabled(!videoEnabled);
  const toggleScreenSharing = () => setScreenSharing(!screenSharing);
  const toggleHandRaised = () => setHandRaised(!handRaised);
  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleVideoPanel = () => setShowVideoPanel(!showVideoPanel);
  const toggleControlPanel = () => setShowControlPanel(!showControlPanel);
  
  // Mock verse data
  const verses = [
    { id: 1, arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful', transliteration: 'Bismillahi r-rahmani r-raheem' },
    { id: 2, arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'All praise is due to Allah, Lord of the worlds', transliteration: 'Alhamdu lillahi rabbil alamin' },
    { id: 3, arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Entirely Merciful, the Especially Merciful', transliteration: 'Ar-rahmani r-raheem' },
    { id: 4, arabic: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Sovereign of the Day of Recompense', transliteration: 'Maliki yawmid deen' },
    { id: 5, arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'It is You we worship and You we ask for help', transliteration: 'Iyyaka nabudu wa iyyaka nastaeen' },
    { id: 6, arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path', transliteration: 'Ihdinas siratal mustaqeem' },
    { id: 7, arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray', transliteration: 'Siratal latheena anamta alayhim, ghayril maghdubi alayhim walad dalleen' },
  ];
  
  // Mock participants
  const participants = [
    { id: 1, name: 'Sheikh Abdullah', isTeacher: true, micOn: true, videoOn: true },
    { id: 2, name: 'Student Ahmed', isTeacher: false, micOn: false, videoOn: true, handRaised: false },
    { id: 3, name: 'Student Fatima', isTeacher: false, micOn: false, videoOn: false, handRaised: true },
  ];
  
  // Mock chat messages
  const chatMessages = [
    { id: 1, sender: 'Sheikh Abdullah', message: 'Please focus on the correct pronunciation of ح', time: '10:05 AM', isTeacher: true },
    { id: 2, sender: 'Student Ahmed', message: 'I find it difficult to differentiate between ض and ظ', time: '10:07 AM' },
    { id: 3, sender: 'Sheikh Abdullah', message: 'Let me demonstrate the difference on the whiteboard', time: '10:08 AM', isTeacher: true },
  ];
  
  // Whiteboard canvas setup
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match parent
      const resizeCanvas = () => {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // Initial clear
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, []);
  
  const nextVerse = () => {
    setCurrentVerse(prev => (prev < verses.length ? prev + 1 : prev));
  };
  
  const prevVerse = () => {
    setCurrentVerse(prev => (prev > 1 ? prev - 1 : prev));
  };
  
  const sendMessage = () => {
    if (chatInputRef.current && chatInputRef.current.value.trim()) {
      console.log('Message sent:', chatInputRef.current.value);
      chatInputRef.current.value = '';
    }
  };
  
  const colorOptions = ['#000000', '#FF0000', '#0000FF', '#008000', '#FFA500', '#800080'];
  
  return (
    <div className="flex flex-col h-screen bg-theme-background">
      {/* Header with minimal controls */}
      <div className="bg-theme-card-bg border-b border-theme-border p-2 flex items-center justify-between">
        <div className="flex items-center">
          <FaQuran className="text-theme-primary-accent mr-2" size={20} />
          <h1 className="text-theme-text-primary font-semibold text-lg hidden sm:block">Quran Learning Session</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleMic}
            className={`p-2 rounded-full ${micEnabled ? 'bg-theme-primary-accent text-white' : 'bg-red-500 text-white'}`}
          >
            {micEnabled ? <MdMic size={18} /> : <MdMicOff size={18} />}
          </button>
          <button 
            onClick={toggleVideo}
            className={`p-2 rounded-full ${videoEnabled ? 'bg-theme-primary-accent text-white' : 'bg-red-500 text-white'}`}
          >
            {videoEnabled ? <MdVideocam size={18} /> : <MdVideocamOff size={18} />}
          </button>
          <button 
            onClick={toggleHandRaised}
            className={`p-2 rounded-full ${handRaised ? 'bg-yellow-500 text-white' : 'bg-theme-card-bg text-theme-text-primary border border-theme-border'}`}
          >
            <MdPanTool size={18} />
          </button>
          <button 
            onClick={toggleScreenSharing}
            className={`hidden sm:block p-2 rounded-full ${screenSharing ? 'bg-theme-primary-accent text-white' : 'bg-theme-card-bg text-theme-text-primary border border-theme-border'}`}
          >
            <MdScreenShare size={18} />
          </button>
          <button 
            className="p-2 rounded-full bg-red-500 text-white"
          >
            <MdClose size={18} />
          </button>
        </div>
      </div>
      
      {/* Main content area with flexible layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar for verse navigation and tools - conditionally shown */}
        {showControlPanel && (
          <div className="w-64 border-r border-theme-border bg-theme-card-bg hidden md:flex flex-col">
            {/* Surah/verse navigation */}
            <div className="p-4 border-b border-theme-border">
              <h2 className="text-theme-text-primary font-semibold mb-2">Surah Al-Fatiha</h2>
              <div className="flex justify-between items-center mb-3">
                <button 
                  onClick={prevVerse}
                  disabled={currentVerse === 1}
                  className={`p-1 rounded ${currentVerse === 1 ? 'text-theme-text-secondary' : 'text-theme-text-primary hover:bg-theme-border'}`}
                >
                  <MdOutlineKeyboardArrowLeft size={20} />
                </button>
                <span className="text-theme-text-primary">Verse {currentVerse} of {verses.length}</span>
                <button 
                  onClick={nextVerse}
                  disabled={currentVerse === verses.length}
                  className={`p-1 rounded ${currentVerse === verses.length ? 'text-theme-text-secondary' : 'text-theme-text-primary hover:bg-theme-border'}`}
                >
                  <MdOutlineKeyboardArrowRight size={20} />
                </button>
              </div>
              
              <div className="bg-theme-background border border-theme-border rounded-lg p-3 mb-2">
                <p className="text-right text-xl mb-2 leading-relaxed" dir="rtl">{verses[currentVerse-1].arabic}</p>
                <div className="text-theme-text-secondary text-sm mt-2">{verses[currentVerse-1].transliteration}</div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-theme-text-secondary">
                <button className="flex items-center">
                  <MdVolumeUp className="mr-1" />
                  Listen
                </button>
                <button className="flex items-center">
                  <MdTranslate className="mr-1" />
                  Translate
                </button>
                <button className="flex items-center">
                  <MdBookmark className="mr-1" />
                  Save
                </button>
              </div>
            </div>
            
            {/* Whiteboard tools */}
            <div className="p-4 border-b border-theme-border">
              <h2 className="text-theme-text-primary font-semibold mb-3">Whiteboard Tools</h2>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <button 
                  onClick={() => setSelectedTool('pen')}
                  className={`p-2 rounded ${selectedTool === 'pen' ? 'bg-theme-primary-accent text-white' : 'bg-theme-card-bg text-theme-text-primary border border-theme-border'}`}
                >
                  <FaPen size={16} />
                </button>
                <button 
                  onClick={() => setSelectedTool('eraser')}
                  className={`p-2 rounded ${selectedTool === 'eraser' ? 'bg-theme-primary-accent text-white' : 'bg-theme-card-bg text-theme-text-primary border border-theme-border'}`}
                >
                  <FaEraser size={16} />
                </button>
                <button 
                  onClick={() => setSelectedTool('text')}
                  className={`p-2 rounded ${selectedTool === 'text' ? 'bg-theme-primary-accent text-white' : 'bg-theme-card-bg text-theme-text-primary border border-theme-border'}`}
                >
                  <MdEdit size={16} />
                </button>
                <button 
                  onClick={() => setSelectedTool('image')}
                  className={`p-2 rounded ${selectedTool === 'image' ? 'bg-theme-primary-accent text-white' : 'bg-theme-card-bg text-theme-text-primary border border-theme-border'}`}
                >
                  <MdOutlineImageSearch size={16} />
                </button>
              </div>
              
              <div className="mb-3">
                <div className="text-theme-text-secondary text-sm mb-1">Color</div>
                <div className="flex space-x-2">
                  {colorOptions.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full ${selectedColor === color ? 'ring-2 ring-offset-2 ring-theme-primary-accent' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="p-2 rounded bg-theme-card-bg text-theme-text-primary border border-theme-border">
                  <FaUndo size={16} />
                </button>
                <button className="p-2 rounded bg-theme-card-bg text-theme-text-primary border border-theme-border">
                  <FaRedo size={16} />
                </button>
                <button className="flex-1 p-2 rounded bg-theme-card-bg text-theme-text-primary border border-theme-border text-sm">
                  Clear All
                </button>
              </div>
            </div>
            
            {/* Tajweed rules reference */}
            <div className="p-4 border-b border-theme-border">
              <h2 className="text-theme-text-primary font-semibold mb-2">Tajweed Rules</h2>
              <div className="text-sm text-theme-text-secondary space-y-2">
                <div className="flex items-start">
                  <div className="bg-red-100 text-red-600 px-2 py-1 rounded mr-2">ن/م</div>
                  <div>Ghunnah - Nasalization</div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded mr-2">ق</div>
                  <div>Qalqalah - Vibration</div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 text-green-600 px-2 py-1 rounded mr-2">ر</div>
                  <div>Idghaam - Merging</div>
                </div>
              </div>
            </div>
            
            {/* Session actions */}
            <div className="p-4 mt-auto">
              <button className="w-full mb-2 p-2 rounded bg-theme-primary-accent text-white text-sm">
                Save Session Notes
              </button>
              <button className="w-full p-2 rounded bg-theme-card-bg text-theme-text-primary border border-theme-border text-sm flex items-center justify-center">
                <MdDownload className="mr-1" size={16} />
                Download Recording
              </button>
            </div>
          </div>
        )}
        
        {/* Mobile control panel toggle */}
        <button 
          onClick={toggleControlPanel}
          className="md:hidden absolute left-0 top-1/2 transform -translate-y-1/2 bg-theme-card-bg border border-theme-border p-1 rounded-r-md z-10"
        >
          {showControlPanel ? <MdOutlineKeyboardArrowLeft size={20} /> : <MdOutlineKeyboardArrowRight size={20} />}
        </button>
        
        {/* Main whiteboard/content area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs for whiteboard/content switching */}
          <div className="bg-theme-card-bg border-b border-theme-border flex">
            <button 
              onClick={() => setActiveTab('whiteboard')}
              className={`px-4 py-2 ${activeTab === 'whiteboard' ? 'text-theme-primary-accent border-b-2 border-theme-primary-accent' : 'text-theme-text-secondary'}`}
            >
              Whiteboard
            </button>
            <button 
              onClick={() => setActiveTab('quran')}
              className={`px-4 py-2 ${activeTab === 'quran' ? 'text-theme-primary-accent border-b-2 border-theme-primary-accent' : 'text-theme-text-secondary'}`}
            >
              Quran Text
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 ${activeTab === 'notes' ? 'text-theme-primary-accent border-b-2 border-theme-primary-accent' : 'text-theme-text-secondary'}`}
            >
              Notes
            </button>
            
            {/* Mobile tools */}
            <div className="ml-auto md:hidden flex items-center pr-2">
              <button className="p-1 text-theme-text-secondary">
                <MdFormatListBulleted size={20} />
              </button>
              <button className="p-1 text-theme-text-secondary">
                <MdSettings size={20} />
              </button>
            </div>
          </div>
          
          {/* Content area based on active tab */}
          <div className="flex-1 relative">
            {/* Whiteboard */}
            {activeTab === 'whiteboard' && (
              <div className="absolute inset-0 bg-white">
                <canvas 
                  ref={canvasRef}
                  className="w-full h-full cursor-crosshair"
                />
                
                {/* Mobile whiteboard tools */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:hidden bg-theme-card-bg border border-theme-border rounded-full shadow-lg p-1 flex space-x-1">
                  <button 
                    onClick={() => setSelectedTool('pen')}
                    className={`p-2 rounded-full ${selectedTool === 'pen' ? 'bg-theme-primary-accent text-white' : 'text-theme-text-primary'}`}
                  >
                    <FaPen size={16} />
                  </button>
                  <button 
                    onClick={() => setSelectedTool('eraser')}
                    className={`p-2 rounded-full ${selectedTool === 'eraser' ? 'bg-theme-primary-accent text-white' : 'text-theme-text-primary'}`}
                  >
                    <FaEraser size={16} />
                  </button>
                  <div className="border-r border-theme-border mx-1 h-8"></div>
                  {colorOptions.slice(0, 4).map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full ${selectedColor === color ? 'ring-2 ring-theme-primary-accent' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Quran text */}
            {activeTab === 'quran' && (
              <div className="p-4 h-full overflow-auto">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-xl font-semibold text-center mb-4">Surah Al-Fatiha</h2>
                  
                  {verses.map(verse => (
                    <div 
                      key={verse.id} 
                      className={`mb-6 p-4 rounded-lg ${verse.id === currentVerse ? 'bg-theme-primary-accent bg-opacity-10 border border-theme-primary-accent' : 'bg-theme-card-bg border border-theme-border'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 rounded-full bg-theme-primary-accent text-white flex items-center justify-center">
                          {verse.id}
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-theme-text-secondary hover:text-theme-primary-accent">
                            <MdContentCopy size={18} />
                          </button>
                          <button className="text-theme-text-secondary hover:text-theme-primary-accent">
                            <MdVolumeUp size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-right text-2xl mb-3 leading-relaxed" dir="rtl">{verse.arabic}</p>
                      <p className="text-theme-text-secondary italic mb-2">{verse.transliteration}</p>
                      <p className="text-theme-text-primary">{verse.translation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Notes */}
            {activeTab === 'notes' && (
              <div className="p-4 h-full overflow-auto">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-xl font-semibold mb-4">Session Notes</h2>
                  
                  <div className="mb-4">
                    <textarea 
                      className="w-full h-64 p-3 border border-theme-border rounded-lg bg-theme-card-bg text-theme-text-primary"
                      placeholder="Take notes during your Quran learning session..."
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <button className="bg-theme-card-bg border border-theme-border text-theme-text-primary px-4 py-2 rounded">
                      Clear
                    </button>
                    <button className="bg-theme-primary-accent text-white px-4 py-2 rounded">
                      Save Notes
                    </button>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="font-semibold text-theme-text-primary mb-2">Previously Saved Notes</h3>
                    
                    <div className="border border-theme-border rounded-lg divide-y">
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium text-theme-text-primary">Surah Al-Fatiha Notes</h4>
                          <span className="text-sm text-theme-text-secondary">May 20, 2025</span>
                        </div>
                        <p className="text-sm text-theme-text-secondary">Notes on proper pronunciation of specific letters in Surah Al-Fatiha...</p>
                      </div>
                      
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium text-theme-text-primary">Tajweed Rules</h4>
                          <span className="text-sm text-theme-text-secondary">May 15, 2025</span>
                        </div>
                        <p className="text-sm text-theme-text-secondary">Important rules for Idghaam and Qalqalah...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right sidebar for video and chat */}
        {showVideoPanel && (
          <div className="w-72 border-l border-theme-border bg-theme-card-bg hidden sm:flex flex-col">
            {/* Tabs for video/chat/participants */}
            <div className="flex border-b border-theme-border">
              <button 
                onClick={() => setActiveTab('video')}
                className="flex-1 py-2 text-center text-sm font-medium text-theme-primary-accent"
              >
                Video
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className="flex-1 py-2 text-center text-sm font-medium text-theme-text-secondary"
              >
                Chat
              </button>
              <button 
                onClick={() => setActiveTab('participants')}
                className="flex-1 py-2 text-center text-sm font-medium text-theme-text-secondary"
              >
                People
              </button>
            </div>
            
            {/* Video feeds */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {/* Teacher video */}
              <div className="relative w-full h-40 bg-gray-900 rounded-lg overflow-hidden">
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                  Sheikh Abdullah (Teacher)
                </div>
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1585036156171-384164a8c675?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                />
              </div>
              
              {/* Student videos */}
              {participants.filter(p => !p.isTeacher).map(participant => (
                <div key={participant.id} className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
                  {participant.handRaised && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full">
                      <MdPanTool size={12} />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                    {participant.name}
                  </div>
                  {participant.videoOn ? (
                    <img 
                      src={`https://i.pravatar.cc/150?u=${participant.id}`}
                      alt={participant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <div className="w-12 h-12 rounded-full bg-theme-primary-accent flex items-center justify-center text-white text-xl font-bold">
                        {participant.name.charAt(0)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Chat section */}
            <div className="h-1/3 border-t border-theme-border flex flex-col">
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {chatMessages.map(message => (
                  <div key={message.id} className={`flex ${message.isTeacher ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-lg p-2 ${message.isTeacher ? 'bg-theme-primary-accent bg-opacity-10 text-theme-text-primary' : 'bg-theme-primary-accent text-white'}`}>
                      <div className="font-semibold text-xs">{message.sender}</div>
                      <div className="text-sm">{message.message}</div>
                      <div className="text-xs opacity-70 text-right">{message.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-2 border-t border-theme-border">
                <div className="flex">
                  <input 
                    ref={chatInputRef}
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-theme-background border border-theme-border rounded-l px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-theme-primary-accent"
                  />
                  <button 
                    onClick={sendMessage}
                    className="bg-theme-primary-accent text-white px-3 py-1 rounded-r"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile video panel toggle */}
        <button 
          onClick={toggleVideoPanel}
          className="sm:hidden absolute right-0 top-1/2 transform -translate-y-1/2 bg-theme-card-bg border border-theme-border p-1 rounded-l-md z-10"
        >
          {showVideoPanel ? <MdOutlineKeyboardArrowRight size={20} /> : <MdOutlineKeyboardArrowLeft size={20} />}
        </button>
      </div>
    </div>
  );
};

export default QuranLearningMinimalist;

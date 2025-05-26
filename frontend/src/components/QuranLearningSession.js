import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {   MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdScreenShare, MdStopScreenShare,
  MdChat, MdPeople, MdRateReview, MdPanTool, MdRecordVoiceOver, MdBookmark,
  MdTranslate, MdChatBubble, MdAudiotrack, MdPlayArrow, MdPause, MdSettings,
  MdFullscreen, MdFullscreenExit, MdOutlineZoomIn, MdOutlineZoomOut,
  MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight, MdClose, MdSave
} from 'react-icons/md';
import { FaChalkboardTeacher, FaQuran } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';

// Import components
import DigitalWhiteboard from './DigitalWhiteboard';
import TajweedAssistant from './TajweedAssistant';
import { useWebRTC } from '../utils/webRTC';

const QuranLearningSession = () => {
  // Get roomId from URL or generate a random one
  const location = useLocation();
  const roomId = new URLSearchParams(location.search).get('roomId') || `room-${Date.now()}`;
  const navigate = useNavigate();
  
  // WebRTC state
  const { 
    localStream, 
    remoteStreams, 
    participants, 
    isConnected,
    isMicEnabled,
    isVideoEnabled,
    isScreenSharing,
    error,
    initializeLocalMedia,
    toggleMicrophone,
    toggleCamera,
    toggleScreenSharing,
    leaveRoom
  } = useWebRTC(roomId, { name: 'You', isTeacher: false });
  
  // UI state
  const [isTeacher, setIsTeacher] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [tajweedOpen, setTajweedOpen] = useState(false);
  const [recitationPlaying, setRecitationPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [currentView, setCurrentView] = useState('gallery'); // gallery, focus, sidebar
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTab, setCurrentTab] = useState('chat');
  const [currentSurah, setCurrentSurah] = useState({ id: 1, name: 'Al-Fatiha' });
  const [currentVerse, setCurrentVerse] = useState(1);
  
  // Refs
  const mainVideoRef = useRef(null);
  const selfVideoRef = useRef(null);
  const chatInputRef = useRef(null);
  const sessionContainerRef = useRef(null);
  
  // Mock data
  const chatMessages = [
    { id: 1, sender: 'Sheikh Abdullah', message: 'Welcome to today\'s Quran lesson!', time: '10:00 AM', isTeacher: true },
    { id: 2, sender: 'Student Fatima', message: 'I have a question about the pronunciation of ض', time: '10:05 AM' },
    { id: 3, sender: 'Sheikh Abdullah', message: 'Good question! Let me demonstrate...', time: '10:06 AM', isTeacher: true },
  ];
  
  // Mock surah data
  const surahs = [
    { id: 1, name: 'Al-Fatiha', versesCount: 7 },
    { id: 2, name: 'Al-Baqarah', versesCount: 286 },
    { id: 112, name: 'Al-Ikhlas', versesCount: 4 },
    { id: 113, name: 'Al-Falaq', versesCount: 5 },
    { id: 114, name: 'An-Nas', versesCount: 6 },
  ];
  
  // Mock verse data for Al-Fatiha
  const verses = {
    1: [
      { id: 1, arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful' },
      { id: 2, arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'All praise is due to Allah, Lord of the worlds' },
      { id: 3, arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Entirely Merciful, the Especially Merciful' },
      { id: 4, arabic: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Sovereign of the Day of Recompense' },
      { id: 5, arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'It is You we worship and You we ask for help' },
      { id: 6, arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path' },
      { id: 7, arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray' },
    ]
  };
  
  // Initialize media when component mounts
  useEffect(() => {
    initializeLocalMedia();
    
    return () => {
      leaveRoom();
    };
  }, []);
  
  // Update local video element when stream is available
  useEffect(() => {
    if (localStream && selfVideoRef.current) {
      selfVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  // Toggle functions
  const toggleHandRaised = () => setHandRaised(!handRaised);
  const toggleChat = () => {
    setChatOpen(!chatOpen);
    setCurrentTab('chat');
  };
  const toggleParticipants = () => {
    setParticipantsOpen(!participantsOpen);
    setCurrentTab('participants');
  };
  const toggleWhiteboard = () => {
    setWhiteboardOpen(!whiteboardOpen);
    setCurrentTab('whiteboard');
  };
  const toggleTajweed = () => {
    setTajweedOpen(!tajweedOpen);
    setCurrentTab('tajweed');
  };
  const toggleRecitation = () => setRecitationPlaying(!recitationPlaying);
  const toggleRecording = () => setRecording(!recording);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      sessionContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Send chat message
  const sendMessage = () => {
    if (chatInputRef.current && chatInputRef.current.value.trim()) {
      console.log('Message sent:', chatInputRef.current.value);
      // In a real app, this would send the message to other participants
      chatInputRef.current.value = '';
    }
  };
  
  // Leave meeting
  const leaveMeeting = () => {
    leaveRoom();
    navigate('/quran-learning');
  };
  
  // Switch to a different verse
  const goToVerse = (verseNumber) => {
    if (verses[currentSurah.id] && verseNumber > 0 && verseNumber <= verses[currentSurah.id].length) {
      setCurrentVerse(verseNumber);
    }
  };
  
  // Next verse
  const nextVerse = () => {
    if (verses[currentSurah.id] && currentVerse < verses[currentSurah.id].length) {
      setCurrentVerse(currentVerse + 1);
    }
  };
  
  // Previous verse
  const prevVerse = () => {
    if (currentVerse > 1) {
      setCurrentVerse(currentVerse - 1);
    }
  };
  
  return (
    <div 
      ref={sessionContainerRef}
      className="flex flex-col h-screen bg-theme-background"
    >
      {/* Top control bar */}
      <div className="p-4 border-b border-theme-border flex justify-between items-center bg-theme-card-bg">
        <div className="flex items-center">
          <FaQuran className="text-theme-primary-accent text-2xl mr-2" />
          <h1 className="text-theme-text-primary text-xl font-bold">Learn Quran Session</h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={toggleFullscreen}
              className="bg-theme-primary-accent bg-opacity-10 p-2 rounded-full text-theme-primary-accent"
            >
              {isFullscreen ? <MdFullscreenExit size={20} /> : <MdFullscreen size={20} />}
            </button>
            <select 
              className="bg-theme-card-bg text-theme-text-primary border border-theme-border rounded-md p-1 text-sm"
              value={currentSurah.id}
              onChange={(e) => {
                const surahId = parseInt(e.target.value);
                const surah = surahs.find(s => s.id === surahId);
                setCurrentSurah(surah);
                setCurrentVerse(1);
              }}
            >
              {surahs.map(surah => (
                <option key={surah.id} value={surah.id}>Surah {surah.name}</option>
              ))}
            </select>
            <select 
              className="bg-theme-card-bg text-theme-text-primary border border-theme-border rounded-md p-1 text-sm"
              value={currentVerse}
              onChange={(e) => setCurrentVerse(parseInt(e.target.value))}
            >
              {verses[currentSurah.id] && 
                Array.from({ length: verses[currentSurah.id].length }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Verse {i + 1}</option>
                ))
              }
            </select>
          </div>
          <button 
            onClick={leaveMeeting}
            className="p-2 rounded-full bg-red-500 text-white"
          >
            Leave
          </button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main video area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Quran verse display - shown when whiteboard is not open */}
          {!whiteboardOpen && verses[currentSurah.id] && (
            <div className="absolute top-4 left-4 right-4 bg-theme-card-bg bg-opacity-80 rounded-lg p-4 z-10">
              <div className="flex justify-between items-center mb-2">
                <button 
                  onClick={prevVerse}
                  disabled={currentVerse <= 1}
                  className={`p-1 rounded-full ${currentVerse <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-theme-primary-accent hover:text-white'}`}
                >
                  <MdOutlineKeyboardArrowLeft size={20} />
                </button>
                <h3 className="text-center text-theme-text-primary font-semibold">
                  Surah {currentSurah.name} - Verse {currentVerse}
                </h3>
                <button 
                  onClick={nextVerse}
                  disabled={currentVerse >= verses[currentSurah.id].length}
                  className={`p-1 rounded-full ${currentVerse >= verses[currentSurah.id].length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-theme-primary-accent hover:text-white'}`}
                >
                  <MdOutlineKeyboardArrowRight size={20} />
                </button>
              </div>
              
              <p className="text-right leading-loose text-xl md:text-2xl font-arabic">
                {verses[currentSurah.id][currentVerse - 1]?.arabic}
              </p>
              <p className="text-sm text-theme-text-secondary mt-2">
                {verses[currentSurah.id][currentVerse - 1]?.translation}
              </p>
              
              <div className="flex justify-end mt-2">
                <button 
                  onClick={() => {}} 
                  className="text-theme-primary-accent text-sm flex items-center"
                >
                  <MdPlayArrow className="mr-1" /> Listen
                </button>
              </div>
            </div>
          )}
          
          {/* Whiteboard or Video Area */}
          {whiteboardOpen ? (
            <div className="flex-1 p-4">
              <DigitalWhiteboard />
            </div>
          ) : (
            <div className="flex-1 flex flex-wrap justify-center items-center gap-4 p-4 overflow-auto">
              {/* Main video - Teacher */}
              <div className="relative w-full md:w-4/5 h-[300px] md:h-[400px] bg-gray-900 rounded-xl overflow-hidden">
                {recording && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs py-1 px-2 rounded-md z-10">Recording</div>
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm py-1 px-2 rounded-md z-10">
                  Sheikh Abdullah (Teacher)
                </div>
                <video 
                  ref={mainVideoRef} 
                  className="w-full h-full object-cover" 
                  poster="https://images.unsplash.com/photo-1585036156171-384164a8c675?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                />
              </div>
              
              {/* Student videos */}
              {participants.filter(p => !p.isTeacher).map(participant => (
                <div key={participant.id} className="relative w-full xs:w-[48%] md:w-[30%] h-[150px] bg-gray-800 rounded-lg overflow-hidden">
                  {participant.handRaised && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full z-10">
                      <MdPanTool size={16} />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs py-1 px-2 rounded-md z-10">
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
                      <div className="w-16 h-16 rounded-full bg-theme-primary-accent flex items-center justify-center text-white text-2xl font-bold">
                        {participant.name.charAt(0)}
                      </div>
                    </div>
                  )}
                  {!participant.micOn && (
                    <div className="absolute bottom-2 right-2 bg-red-500 p-1 rounded-full z-10">
                      <MdMicOff size={16} color="white" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Self video */}
              <div className="relative w-full xs:w-[48%] md:w-[30%] h-[150px] bg-gray-800 rounded-lg overflow-hidden">
                {handRaised && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full z-10">
                    <MdPanTool size={16} />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs py-1 px-2 rounded-md z-10">
                  You
                </div>
                <video 
                  ref={selfVideoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!isMicEnabled && (
                  <div className="absolute bottom-2 right-2 bg-red-500 p-1 rounded-full z-10">
                    <MdMicOff size={16} color="white" />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Bottom controls */}
          <div className="p-4 bg-theme-card-bg border-t border-theme-border flex flex-wrap justify-center items-center space-x-1 md:space-x-4">
            <button 
              onClick={toggleMicrophone}
              className={`p-3 rounded-full ${isMicEnabled ? 'bg-theme-primary-accent text-white' : 'bg-red-500 text-white'}`}
            >
              {isMicEnabled ? <MdMic size={20} /> : <MdMicOff size={20} />}
            </button>
            <button 
              onClick={toggleCamera}
              className={`p-3 rounded-full ${isVideoEnabled ? 'bg-theme-primary-accent text-white' : 'bg-red-500 text-white'}`}
            >
              {isVideoEnabled ? <MdVideocam size={20} /> : <MdVideocamOff size={20} />}
            </button>
            <button 
              onClick={toggleScreenSharing}
              className={`p-3 rounded-full ${isScreenSharing ? 'bg-theme-primary-accent text-white' : 'bg-theme-card-bg text-theme-text-primary border border-theme-border'}`}
            >
              {isScreenSharing ? <MdStopScreenShare size={20} /> : <MdScreenShare size={20} />}
            </button>
            <button 
              onClick={toggleHandRaised}
              className={`p-3 rounded-full ${handRaised ? 'bg-yellow-500 text-white' : 'bg-theme-card-bg text-theme-text-primary border border-theme-border'}`}
            >
              <MdPanTool size={20} />
            </button>
            <button 
              onClick={toggleChat}
              className={`p-3 rounded-full ${chatOpen && currentTab === 'chat' ? 'bg-theme-primary-accent text-white' : 'bg-theme-card-bg text-theme-text-primary border border-theme-border'}`}
            >
              <MdChat size={20} />
            </button>
            <button 
              onClick={toggleParticipants}
              className={`p-3 rounded-full ${participantsOpen && currentTab === 'participants' ? 'bg-theme-primary-accent text-white' : 'bg-theme-card-bg text-theme-text-primary border border-theme-border'}`}
            >
              <MdPeople size={20} />
            </button>
            
            {/* Additional controls */}
            <div className="relative group">
              <button className="p-3 rounded-full bg-theme-card-bg text-theme-text-primary border border-theme-border">
                <BsThreeDotsVertical size={20} />
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-theme-card-bg border border-theme-border rounded-lg shadow-lg w-48 z-20">
                <ul className="py-2">
                  <li className="px-4 py-2 hover:bg-theme-border flex items-center cursor-pointer" onClick={toggleWhiteboard}>
                    <FaChalkboardTeacher className="mr-2" size={16} />
                    <span>Whiteboard</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-theme-border flex items-center cursor-pointer" onClick={toggleTajweed}>
                    <MdRecordVoiceOver className="mr-2" size={16} />
                    <span>Tajweed Assistant</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-theme-border flex items-center cursor-pointer" onClick={toggleRecitation}>
                    <MdPlayArrow className="mr-2" size={16} />
                    <span>Recitation</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-theme-border flex items-center cursor-pointer">
                    <MdBookmark className="mr-2" size={16} />
                    <span>Bookmark</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-theme-border flex items-center cursor-pointer">
                    <MdTranslate className="mr-2" size={16} />
                    <span>Translation</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-theme-border flex items-center cursor-pointer" onClick={toggleRecording}>
                    <MdAudiotrack className="mr-2" size={16} />
                    <span>{recording ? 'Stop Recording' : 'Start Recording'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right sidebar - conditionally shown */}
        {(chatOpen || participantsOpen || tajweedOpen) && (
          <div className="hidden md:block w-80 border-l border-theme-border bg-theme-card-bg">
            {/* Tabs for chat, participants, tajweed */}
            <div className="flex border-b border-theme-border">
              <button 
                onClick={() => {setCurrentTab('chat'); setChatOpen(true); setParticipantsOpen(false); setTajweedOpen(false);}}
                className={`flex-1 py-3 text-center ${currentTab === 'chat' ? 'border-b-2 border-theme-primary-accent text-theme-primary-accent' : 'text-theme-text-secondary'}`}
              >
                Chat
              </button>
              <button 
                onClick={() => {setCurrentTab('participants'); setChatOpen(false); setParticipantsOpen(true); setTajweedOpen(false);}}
                className={`flex-1 py-3 text-center ${currentTab === 'participants' ? 'border-b-2 border-theme-primary-accent text-theme-primary-accent' : 'text-theme-text-secondary'}`}
              >
                Participants
              </button>
              <button 
                onClick={() => {setCurrentTab('tajweed'); setChatOpen(false); setParticipantsOpen(false); setTajweedOpen(true);}}
                className={`flex-1 py-3 text-center ${currentTab === 'tajweed' ? 'border-b-2 border-theme-primary-accent text-theme-primary-accent' : 'text-theme-text-secondary'}`}
              >
                Tajweed
              </button>
            </div>
            
            {/* Content for each tab */}
            <div className="h-[calc(100%-3.5rem)] overflow-hidden">
              {/* Chat panel */}
              {currentTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map(message => (
                      <div key={message.id} className={`flex ${message.isTeacher ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${message.isTeacher ? 'bg-theme-primary-accent bg-opacity-10 text-theme-text-primary' : 'bg-theme-primary-accent text-white'}`}>
                          <div className="font-semibold text-sm">{message.sender}</div>
                          <div>{message.message}</div>
                          <div className="text-xs opacity-70 text-right mt-1">{message.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-theme-border">
                    <div className="flex">
                      <input 
                        ref={chatInputRef}
                        type="text" 
                        placeholder="Type a message..." 
                        className="flex-1 bg-theme-background border border-theme-border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-theme-primary-accent"
                      />
                      <button 
                        onClick={sendMessage}
                        className="bg-theme-primary-accent text-white px-4 py-2 rounded-r-lg"
                      >
                        <MdChatBubble size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Participants panel */}
              {currentTab === 'participants' && (
                <div className="h-full overflow-y-auto p-4">
                  <div className="mb-4">
                    <h3 className="font-semibold text-theme-text-primary">Teacher</h3>
                    {participants.filter(p => p.isTeacher).map(teacher => (
                      <div key={teacher.id} className="flex items-center justify-between p-2 border-b border-theme-border">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-theme-primary-accent flex items-center justify-center text-white font-bold mr-2">
                            {teacher.name.charAt(0)}
                          </div>
                          <span className="text-theme-text-primary">{teacher.name}</span>
                        </div>
                        <div className="flex space-x-1">
                          {!teacher.micOn && <MdMicOff className="text-red-500" />}
                          {!teacher.videoOn && <MdVideocamOff className="text-red-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-text-primary">Students ({participants.filter(p => !p.isTeacher).length})</h3>
                    {participants.filter(p => !p.isTeacher).map(student => (
                      <div key={student.id} className="flex items-center justify-between p-2 border-b border-theme-border">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold mr-2">
                            {student.name.charAt(0)}
                          </div>
                          <span className="text-theme-text-primary">{student.name}</span>
                          {student.handRaised && (
                            <MdPanTool className="ml-2 text-yellow-500" size={16} />
                          )}
                        </div>
                        <div className="flex space-x-1">
                          {!student.micOn && <MdMicOff className="text-red-500" />}
                          {!student.videoOn && <MdVideocamOff className="text-red-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tajweed Assistant panel */}
              {currentTab === 'tajweed' && (
                <div className="h-full overflow-y-auto">
                  <TajweedAssistant />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Mobile view for sidebar - shown as a modal */}
        {(chatOpen || participantsOpen || tajweedOpen) && (
          <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
            <div className="bg-theme-card-bg w-full rounded-t-xl max-h-[80vh] overflow-hidden">
              <div className="flex border-b border-theme-border">
                <button 
                  onClick={() => {setCurrentTab('chat'); setChatOpen(true); setParticipantsOpen(false); setTajweedOpen(false);}}
                  className={`flex-1 py-3 text-center ${currentTab === 'chat' ? 'border-b-2 border-theme-primary-accent text-theme-primary-accent' : 'text-theme-text-secondary'}`}
                >
                  Chat
                </button>
                <button 
                  onClick={() => {setCurrentTab('participants'); setChatOpen(false); setParticipantsOpen(true); setTajweedOpen(false);}}
                  className={`flex-1 py-3 text-center ${currentTab === 'participants' ? 'border-b-2 border-theme-primary-accent text-theme-primary-accent' : 'text-theme-text-secondary'}`}
                >
                  Participants
                </button>
                <button 
                  onClick={() => {setCurrentTab('tajweed'); setChatOpen(false); setParticipantsOpen(false); setTajweedOpen(true);}}
                  className={`flex-1 py-3 text-center ${currentTab === 'tajweed' ? 'border-b-2 border-theme-primary-accent text-theme-primary-accent' : 'text-theme-text-secondary'}`}
                >
                  Tajweed
                </button>
                <button 
                  onClick={() => {setChatOpen(false); setParticipantsOpen(false); setTajweedOpen(false);}}
                  className="py-3 px-4 text-theme-text-secondary"
                >
                  <MdClose />
                </button>
              </div>
              
              <div className="max-h-[calc(80vh-3.5rem)] overflow-auto">
                {/* Content for each tab - same as desktop but optimized for mobile */}
                {currentTab === 'chat' && (
                  <div className="flex flex-col h-[60vh]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {chatMessages.map(message => (
                        <div key={message.id} className={`flex ${message.isTeacher ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 ${message.isTeacher ? 'bg-theme-primary-accent bg-opacity-10 text-theme-text-primary' : 'bg-theme-primary-accent text-white'}`}>
                            <div className="font-semibold text-sm">{message.sender}</div>
                            <div>{message.message}</div>
                            <div className="text-xs opacity-70 text-right mt-1">{message.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-theme-border">
                      <div className="flex">
                        <input 
                          type="text" 
                          placeholder="Type a message..." 
                          className="flex-1 bg-theme-background border border-theme-border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-theme-primary-accent"
                        />
                        <button 
                          onClick={sendMessage}
                          className="bg-theme-primary-accent text-white px-4 py-2 rounded-r-lg"
                        >
                          <MdChatBubble size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentTab === 'participants' && (
                  <div className="h-[60vh] overflow-y-auto p-4">
                    {/* Same as desktop participants panel */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-theme-text-primary">Teacher</h3>
                      {participants.filter(p => p.isTeacher).map(teacher => (
                        <div key={teacher.id} className="flex items-center justify-between p-2 border-b border-theme-border">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-theme-primary-accent flex items-center justify-center text-white font-bold mr-2">
                              {teacher.name.charAt(0)}
                            </div>
                            <span className="text-theme-text-primary">{teacher.name}</span>
                          </div>
                          <div className="flex space-x-1">
                            {!teacher.micOn && <MdMicOff className="text-red-500" />}
                            {!teacher.videoOn && <MdVideocamOff className="text-red-500" />}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-text-primary">Students ({participants.filter(p => !p.isTeacher).length})</h3>
                      {participants.filter(p => !p.isTeacher).map(student => (
                        <div key={student.id} className="flex items-center justify-between p-2 border-b border-theme-border">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold mr-2">
                              {student.name.charAt(0)}
                            </div>
                            <span className="text-theme-text-primary">{student.name}</span>
                            {student.handRaised && (
                              <MdPanTool className="ml-2 text-yellow-500" size={16} />
                            )}
                          </div>
                          <div className="flex space-x-1">
                            {!student.micOn && <MdMicOff className="text-red-500" />}
                            {!student.videoOn && <MdVideocamOff className="text-red-500" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {currentTab === 'tajweed' && (
                  <div className="h-[60vh] overflow-y-auto">
                    <TajweedAssistant />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Error modal */}
      {error && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-theme-card-bg rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-semibold text-theme-text-primary mb-4">Connection Error</h3>
            <p className="text-theme-text-secondary mb-6">{error}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => navigate('/quran-learning')}
                className="px-4 py-2 bg-theme-primary-accent text-white rounded-lg"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranLearningSession;

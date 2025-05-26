import React, { useState, useRef, useEffect } from 'react';
import { 
  MdMic, MdStop, MdPlayArrow, MdFileDownload, MdInfoOutline,
  MdHelp, MdSave, MdSettings, MdPause
} from 'react-icons/md';

// Tajweed rules highlighting component
export const TajweedHighlighter = ({ text, rules }) => {
  // Function to apply highlighting based on tajweed rules
  const highlightText = (text, rules) => {
    if (!rules || rules.length === 0) return text;
    
    let highlightedText = text;
    
    // Replace text based on rule locations
    rules.forEach(rule => {
      // This is a simplified example - in a real app, you would need more sophisticated
      // text processing with proper Arabic text support
      const start = rule.startIndex;
      const end = rule.endIndex;
      const highlightedPart = `<span class="tajweed-highlight" style="color: ${rule.color}; background-color: ${rule.color}20;" title="${rule.description}">${text.substring(start, end)}</span>`;
      
      // In a real implementation, you would need to handle overlapping highlights
      highlightedText = highlightedText.substring(0, start) + highlightedPart + highlightedText.substring(end);
    });
    
    return highlightedText;
  };
  
  return (
    <div 
      className="text-right leading-loose text-2xl my-4 p-4 font-arabic"
      dangerouslySetInnerHTML={{ __html: highlightText(text, rules) }}
    />
  );
};

const TajweedAssistant = () => {
  // State variables
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState('1');
  const [selectedVerse, setSelectedVerse] = useState('1');
  const [verseText, setVerseText] = useState('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('practice'); // practice or test
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  
  // Mock tajweed rules for highlighting (in a real app, these would be dynamically generated based on AI analysis)
  const [tajweedRules, setTajweedRules] = useState([
    { startIndex: 0, endIndex: 4, color: '#FF5722', ruleName: 'idgham', description: 'Idgham - Merging of Noon Sakinah' },
    { startIndex: 12, endIndex: 16, color: '#4CAF50', ruleName: 'ghunnah', description: 'Ghunnah - Nasalization' },
  ]);
  
  // Mock surahs data
  const surahs = [
    { id: '1', name: 'Al-Fatiha', versesCount: 7 },
    { id: '2', name: 'Al-Baqarah', versesCount: 286 },
    { id: '112', name: 'Al-Ikhlas', versesCount: 4 },
  ];
  
  // Mock verses data for Al-Fatiha
  const verses = {
    '1': [
      { id: '1', text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
      { id: '2', text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
      { id: '3', text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
      { id: '4', text: 'مَالِكِ يَوْمِ الدِّينِ' },
      { id: '5', text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
      { id: '6', text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
      { id: '7', text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
    ]
  };
  
  // Update verse text when surah or verse selection changes
  useEffect(() => {
    if (verses[selectedSurah] && verses[selectedSurah].length >= selectedVerse) {
      setVerseText(verses[selectedSurah][parseInt(selectedVerse) - 1].text);
    }
  }, [selectedSurah, selectedVerse]);
  
  // Start recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // In a real app, this is where you would send the audio to a server for analysis
        analyzeTajweed(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };
  
  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  // Play/pause recorded audio
  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    
    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle audio player events
  useEffect(() => {
    const audioElement = audioPlayerRef.current;
    if (!audioElement) return;
    
    const handleEnded = () => setIsPlaying(false);
    
    audioElement.addEventListener('ended', handleEnded);
    
    return () => {
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioPlayerRef.current]);
  
  // Mock tajweed analysis function
  const analyzeTajweed = (audioBlob) => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock feedback data
      const mockFeedback = {
        overallScore: 85,
        pronunciation: 82,
        tajweedRules: 88,
        rhythm: 85,
        details: [
          { type: 'error', text: 'Improper pronunciation of ح in الرَّحْمَٰنِ', timestamp: '00:02' },
          { type: 'warning', text: 'Slight pause missing between الرَّحْمَٰنِ and الرَّحِيمِ', timestamp: '00:04' },
          { type: 'success', text: 'Excellent medd (elongation) in بِسْمِ', timestamp: '00:01' },
        ],
        // Highlighted rules in the verse text
        rules: [
          { startIndex: 0, endIndex: 4, color: '#FF5722', ruleName: 'idgham', description: 'Idgham - Merging of Noon Sakinah' },
          { startIndex: 12, endIndex: 16, color: '#4CAF50', ruleName: 'ghunnah', description: 'Ghunnah - Nasalization' },
          { startIndex: 19, endIndex: 22, color: '#2196F3', ruleName: 'ikhfa', description: 'Ikhfa - Hiding of Noon Sakinah' },
        ]
      };
      
      setFeedback(mockFeedback);
      setTajweedRules(mockFeedback.rules);
      setLoading(false);
    }, 2000);
  };
  
  // Download recording
  const downloadRecording = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `tajweed-practice-surah-${selectedSurah}-verse-${selectedVerse}.wav`;
    a.click();
  };
  
  return (
    <div className="bg-theme-card-bg border border-theme-border rounded-lg p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-theme-text-primary">Tajweed Assistant</h2>
        <div className="flex space-x-2">
          <button className="p-2 rounded-full bg-theme-background text-theme-text-secondary hover:text-theme-primary-accent">
            <MdHelp size={20} />
          </button>
          <button className="p-2 rounded-full bg-theme-background text-theme-text-secondary hover:text-theme-primary-accent">
            <MdSettings size={20} />
          </button>
        </div>
      </div>
      
      {/* Surah and verse selection */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-theme-text-secondary mb-1 text-sm">Surah</label>
          <select 
            className="w-full bg-theme-background border border-theme-border rounded-md p-2 text-theme-text-primary"
            value={selectedSurah}
            onChange={(e) => setSelectedSurah(e.target.value)}
          >
            {surahs.map(surah => (
              <option key={surah.id} value={surah.id}>
                {surah.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-theme-text-secondary mb-1 text-sm">Verse</label>
          <select 
            className="w-full bg-theme-background border border-theme-border rounded-md p-2 text-theme-text-primary"
            value={selectedVerse}
            onChange={(e) => setSelectedVerse(e.target.value)}
          >
            {Array.from({ length: surahs.find(s => s.id === selectedSurah)?.versesCount || 0 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-theme-text-secondary mb-1 text-sm">Mode</label>
          <select 
            className="w-full bg-theme-background border border-theme-border rounded-md p-2 text-theme-text-primary"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="practice">Practice Mode</option>
            <option value="test">Test Mode</option>
          </select>
        </div>
      </div>
      
      {/* Verse display with tajweed highlights */}
      <div className="bg-theme-background border border-theme-border rounded-lg p-4 mb-4">
        <TajweedHighlighter text={verseText} rules={tajweedRules} />
      </div>
      
      {/* Recording controls */}
      <div className="flex justify-center space-x-4 mb-6">
        {isRecording ? (
          <button 
            onClick={stopRecording}
            className="bg-red-500 text-white p-4 rounded-full flex items-center justify-center"
          >
            <MdStop size={24} />
          </button>
        ) : (
          <button 
            onClick={startRecording}
            className="bg-theme-primary-accent text-white p-4 rounded-full flex items-center justify-center"
          >
            <MdMic size={24} />
          </button>
        )}
        
        {audioUrl && (
          <>
            <button 
              onClick={togglePlayback}
              className="bg-theme-primary-accent text-white p-4 rounded-full flex items-center justify-center"
              disabled={isRecording}
            >
              {isPlaying ? <MdPause size={24} /> : <MdPlayArrow size={24} />}
            </button>
            <button 
              onClick={downloadRecording}
              className="bg-theme-background border border-theme-border text-theme-text-primary p-4 rounded-full flex items-center justify-center"
              disabled={isRecording}
            >
              <MdFileDownload size={24} />
            </button>
          </>
        )}
      </div>
      
      {/* Audio player (hidden but functional) */}
      {audioUrl && (
        <audio ref={audioPlayerRef} src={audioUrl} className="hidden" />
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center mb-4">
          <div className="loader w-8 h-8 border-4 border-theme-primary-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-theme-text-secondary">Analyzing recitation...</span>
        </div>
      )}
      
      {/* Feedback display */}
      {feedback && !loading && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-2">Feedback</h3>
          
          {/* Overall score */}
          <div className="bg-theme-background border border-theme-border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-theme-text-primary font-medium">Overall Score</span>
              <span className="text-theme-primary-accent font-bold text-xl">{feedback.overallScore}%</span>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-theme-text-secondary">Pronunciation</span>
                  <span className="text-theme-text-primary">{feedback.pronunciation}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-theme-primary-accent h-1.5 rounded-full" style={{ width: `${feedback.pronunciation}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-theme-text-secondary">Tajweed Rules</span>
                  <span className="text-theme-text-primary">{feedback.tajweedRules}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-theme-primary-accent h-1.5 rounded-full" style={{ width: `${feedback.tajweedRules}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-theme-text-secondary">Rhythm & Flow</span>
                  <span className="text-theme-text-primary">{feedback.rhythm}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-theme-primary-accent h-1.5 rounded-full" style={{ width: `${feedback.rhythm}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Detailed feedback */}
          <div className="space-y-2">
            {feedback.details.map((item, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg flex items-start ${
                  item.type === 'error' 
                    ? 'bg-red-50 border border-red-200 text-red-700' 
                    : item.type === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                      : 'bg-green-50 border border-green-200 text-green-700'
                }`}
              >
                <MdInfoOutline className="mt-0.5 mr-2 flex-shrink-0" size={18} />
                <div className="flex-1">
                  <div className="font-medium">{item.text}</div>
                  <div className="text-xs opacity-70">Time: {item.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end mt-4 space-x-3">
            <button className="px-4 py-2 border border-theme-border rounded-lg text-theme-text-primary">
              Review Details
            </button>
            <button className="px-4 py-2 bg-theme-primary-accent text-white rounded-lg flex items-center">
              <MdSave className="mr-2" />
              Save Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TajweedAssistant;

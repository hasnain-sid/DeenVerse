import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MdVideoCall, MdSchedule, MdBook, MdPerson, MdSearch, 
  MdPlayCircleOutline, MdFavorite, MdStar, MdLanguage, MdRecordVoiceOver
} from 'react-icons/md';
import { FaQuran, FaChalkboardTeacher } from 'react-icons/fa';

const QuranLearningHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live');
  
  // Mock data
  const upcomingClasses = [
    { id: 1, title: 'Tajweed Basics', teacher: 'Sheikh Abdullah', time: '10:00 AM', date: 'Tomorrow', level: 'Beginner' },
    { id: 2, title: 'Surah Al-Baqarah', teacher: 'Sheikh Yusuf', time: '2:30 PM', date: 'Today', level: 'Intermediate' },
    { id: 3, title: 'Memorization Techniques', teacher: 'Sheikh Ibrahim', time: '6:00 PM', date: 'Today', level: 'All Levels' },
  ];
  
  const availableTeachers = [
    { id: 1, name: 'Sheikh Abdullah', specialty: 'Tajweed', rating: 4.8, availability: 'Available now', image: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Sheikh Yusuf', specialty: 'Memorization', rating: 4.9, availability: 'Available in 30 min', image: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Sheikh Ibrahim', specialty: 'Tafsir', rating: 4.7, availability: 'Available now', image: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, name: 'Sheikh Ahmad', specialty: 'Qira\'at', rating: 4.6, availability: 'Available now', image: 'https://i.pravatar.cc/150?u=4' },
  ];
  
  const recommendedLessons = [
    { id: 1, title: 'Understanding Tajweed Rules', level: 'Beginner', duration: '45 min', views: '1.2k', image: 'https://images.unsplash.com/photo-1584286595398-a88ba4bfb4be?q=80&w=300' },
    { id: 2, title: 'Perfecting Your Recitation', level: 'Intermediate', duration: '60 min', views: '856', image: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?q=80&w=300' },
    { id: 3, title: 'Memorization Techniques', level: 'All Levels', duration: '30 min', views: '2.3k', image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=300' },
  ];
  
  const savedLessons = [
    { id: 1, title: 'Introduction to Tajweed', progress: 60, lastViewed: '2 days ago', image: 'https://images.unsplash.com/photo-1637655356053-141c216a716e?q=80&w=300' },
    { id: 2, title: 'Surah Al-Fatiha: Detailed Study', progress: 25, lastViewed: 'Yesterday', image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=300' },
  ];
    const joinSession = (id) => {
    // In a real app, this would join the specific session
    navigate('/quran-learning/session?roomId=' + id);
  };
  
  return (
    <div className="bg-theme-background min-h-screen">
      {/* Hero section */}
      <div className="relative bg-theme-primary-accent text-white p-6 md:p-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585036156171-384164a8c675?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center space-x-3 mb-6">
            <FaQuran className="text-3xl" />
            <h1 className="text-2xl md:text-3xl font-bold">Learn Quran Interactive</h1>
          </div>
          <p className="text-lg md:text-xl max-w-2xl mb-8">Connect with qualified teachers for personalized Quran learning sessions with interactive features to enhance your understanding and recitation.</p>          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => navigate('/quran-learning/session')} 
              className="bg-white text-theme-primary-accent px-6 py-3 rounded-lg font-semibold flex items-center justify-center"
            >
              <MdVideoCall size={24} className="mr-2" />
              Join Live Session
            </button>
            <button 
              onClick={() => navigate('/quran-learning/minimalist')}
              className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center"
            >
              <FaChalkboardTeacher size={24} className="mr-2" />
              Whiteboard Mode
            </button>
            <button 
              onClick={() => navigate('/quran-learning/explorer')}
              className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center"
            >
              <FaQuran size={24} className="mr-2" />
              Quran Explorer
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search bar */}
        <div className="relative mb-8">
          <input 
            type="text" 
            placeholder="Search for teachers, lessons, or topics..." 
            className="w-full py-3 pl-12 pr-4 rounded-lg border border-theme-border bg-theme-card-bg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-primary-accent"
          />
          <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-text-secondary" size={20} />
        </div>
        
        {/* Tabs */}
        <div className="border-b border-theme-border mb-6">
          <div className="flex space-x-1 md:space-x-4">
            <button 
              onClick={() => setActiveTab('live')} 
              className={`py-3 px-4 font-medium ${activeTab === 'live' ? 'text-theme-primary-accent border-b-2 border-theme-primary-accent' : 'text-theme-text-secondary'}`}
            >
              Live Sessions
            </button>
            <button 
              onClick={() => setActiveTab('teachers')} 
              className={`py-3 px-4 font-medium ${activeTab === 'teachers' ? 'text-theme-primary-accent border-b-2 border-theme-primary-accent' : 'text-theme-text-secondary'}`}
            >
              Find Teachers
            </button>
            <button 
              onClick={() => setActiveTab('lessons')} 
              className={`py-3 px-4 font-medium ${activeTab === 'lessons' ? 'text-theme-primary-accent border-b-2 border-theme-primary-accent' : 'text-theme-text-secondary'}`}
            >
              Recommended Lessons
            </button>
            <button 
              onClick={() => setActiveTab('saved')} 
              className={`py-3 px-4 font-medium ${activeTab === 'saved' ? 'text-theme-primary-accent border-b-2 border-theme-primary-accent' : 'text-theme-text-secondary'}`}
            >
              My Lessons
            </button>
          </div>
        </div>
        
        {/* Tab content */}
        <div className="mb-10">
          {/* Live Sessions Tab */}
          {activeTab === 'live' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-theme-text-primary mb-4">Upcoming Live Classes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingClasses.map(classItem => (
                    <div key={classItem.id} className="bg-theme-card-bg border border-theme-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-theme-text-primary">{classItem.title}</h3>
                          <span className="bg-theme-primary-accent bg-opacity-10 text-theme-primary-accent text-xs px-2 py-1 rounded">
                            {classItem.level}
                          </span>
                        </div>
                        <div className="flex items-center text-theme-text-secondary text-sm mb-2">
                          <FaChalkboardTeacher className="mr-2" />
                          <span>{classItem.teacher}</span>
                        </div>
                        <div className="flex items-center text-theme-text-secondary text-sm mb-4">
                          <MdSchedule className="mr-2" />
                          <span>{classItem.time} • {classItem.date}</span>
                        </div>
                        <button 
                          onClick={() => joinSession(classItem.id)}
                          className="w-full bg-theme-primary-accent text-white py-2 rounded-lg font-medium flex items-center justify-center"
                        >
                          <MdVideoCall size={20} className="mr-2" />
                          Join Class
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-theme-text-primary mb-4">Create Your Own Session</h2>
                <div className="bg-theme-card-bg border border-theme-border rounded-lg p-6">
                  <p className="text-theme-text-secondary mb-4">
                    Need a session tailored to your specific needs? Create a custom session and invite others to join.
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <button className="bg-theme-primary-accent text-white py-2 px-4 rounded-lg font-medium">
                      Create New Session
                    </button>
                    <button className="bg-theme-card-bg border border-theme-border text-theme-text-primary py-2 px-4 rounded-lg font-medium">
                      Schedule for Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Teachers Tab */}
          {activeTab === 'teachers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-theme-text-primary">Available Teachers</h2>
                <div className="flex items-center">
                  <span className="text-sm text-theme-text-secondary mr-2">Filter by:</span>
                  <select className="bg-theme-card-bg border border-theme-border text-theme-text-primary rounded px-2 py-1 text-sm">
                    <option>All Specialties</option>
                    <option>Tajweed</option>
                    <option>Memorization</option>
                    <option>Tafsir</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableTeachers.map(teacher => (
                  <div key={teacher.id} className="bg-theme-card-bg border border-theme-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <img src={teacher.image} alt={teacher.name} className="w-12 h-12 rounded-full object-cover mr-3" />
                        <div>
                          <h3 className="font-semibold text-theme-text-primary">{teacher.name}</h3>
                          <div className="flex items-center text-sm">
                            <span className="text-yellow-500 mr-1">
                              <MdStar />
                            </span>
                            <span className="text-theme-text-primary">{teacher.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm mb-3">
                        <div className="flex items-center text-theme-text-secondary mb-1">
                          <MdPerson size={16} className="mr-1" />
                          <span>Specialty: {teacher.specialty}</span>
                        </div>
                        <div className={`flex items-center ${teacher.availability.includes('now') ? 'text-green-500' : 'text-yellow-500'}`}>
                          <MdSchedule size={16} className="mr-1" />
                          <span>{teacher.availability}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => joinSession(teacher.id)}
                          className="flex-1 bg-theme-primary-accent text-white py-2 rounded-lg text-sm font-medium"
                        >
                          Start Session
                        </button>
                        <button className="flex-1 border border-theme-border text-theme-text-primary py-2 rounded-lg text-sm font-medium">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-theme-text-primary mb-4">Recommended Lessons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedLessons.map(lesson => (
                    <div key={lesson.id} className="bg-theme-card-bg border border-theme-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-40 overflow-hidden">
                        <img src={lesson.image} alt={lesson.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          {lesson.duration}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-theme-text-primary mb-2">{lesson.title}</h3>
                        <div className="flex justify-between items-center text-sm text-theme-text-secondary mb-3">
                          <span>{lesson.level}</span>
                          <span>{lesson.views} views</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="flex-1 bg-theme-primary-accent text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center">
                            <MdPlayCircleOutline size={18} className="mr-1" />
                            Watch
                          </button>
                          <button className="w-10 flex items-center justify-center border border-theme-border text-theme-text-primary py-2 rounded-lg">
                            <MdFavorite size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-theme-text-primary mb-4">Browse by Topic</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {['Tajweed', 'Memorization', 'Tafsir', 'Recitation', 'Grammar', 'Translation'].map(topic => (
                    <div key={topic} className="bg-theme-card-bg border border-theme-border rounded-lg p-4 text-center hover:border-theme-primary-accent cursor-pointer transition-colors">
                      <h3 className="text-theme-text-primary font-medium">{topic}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-theme-text-primary mb-4">Your Saved Lessons</h2>
                {savedLessons.length > 0 ? (
                  <div className="space-y-4">
                    {savedLessons.map(lesson => (
                      <div key={lesson.id} className="bg-theme-card-bg border border-theme-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4 h-40 md:h-auto overflow-hidden">
                            <img src={lesson.image} alt={lesson.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4 flex flex-col justify-between flex-1">
                            <div>
                              <h3 className="font-semibold text-theme-text-primary mb-2">{lesson.title}</h3>
                              <div className="text-sm text-theme-text-secondary mb-3">
                                Last viewed: {lesson.lastViewed}
                              </div>
                              <div className="mb-3">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-theme-text-secondary">Progress: {lesson.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-theme-primary-accent h-2 rounded-full" style={{ width: `${lesson.progress}%` }}></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="bg-theme-primary-accent text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
                                <MdPlayCircleOutline size={18} className="mr-1" />
                                Continue
                              </button>
                              <button className="border border-theme-border text-theme-text-primary py-2 px-4 rounded-lg text-sm font-medium">
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-theme-card-bg border border-theme-border rounded-lg p-6 text-center">
                    <p className="text-theme-text-secondary mb-4">You haven't saved any lessons yet.</p>
                    <button className="bg-theme-primary-accent text-white py-2 px-4 rounded-lg font-medium">
                      Browse Lessons
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-theme-text-primary mb-4">Learning Statistics</h2>
                <div className="bg-theme-card-bg border border-theme-border rounded-lg p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-theme-background p-4 rounded-lg text-center">
                      <p className="text-theme-text-secondary text-sm mb-1">Total Time</p>
                      <p className="text-2xl font-bold text-theme-text-primary">12h 30m</p>
                    </div>
                    <div className="bg-theme-background p-4 rounded-lg text-center">
                      <p className="text-theme-text-secondary text-sm mb-1">Lessons Completed</p>
                      <p className="text-2xl font-bold text-theme-text-primary">8</p>
                    </div>
                    <div className="bg-theme-background p-4 rounded-lg text-center">
                      <p className="text-theme-text-secondary text-sm mb-1">Current Streak</p>
                      <p className="text-2xl font-bold text-theme-text-primary">5 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Featured section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-theme-text-primary mb-4">Featured Resources</h2>
          <div className="bg-theme-card-bg border border-theme-border rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 mb-4 md:mb-0 md:mr-6">
                  <h3 className="text-lg font-semibold text-theme-text-primary mb-3">Tajweed Rules Reference</h3>
                  <p className="text-theme-text-secondary mb-4">
                    Access a comprehensive guide to Tajweed rules with interactive examples and audio demonstrations.
                  </p>
                  <div className="flex space-x-3">
                    <button className="bg-theme-primary-accent text-white py-2 px-4 rounded-lg text-sm font-medium">
                      Open Guide
                    </button>
                    <button className="border border-theme-border text-theme-text-primary py-2 px-4 rounded-lg text-sm font-medium">
                      Download PDF
                    </button>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-theme-background p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MdBook className="text-theme-primary-accent mr-2" size={20} />
                        <h4 className="font-medium text-theme-text-primary">Digital Mushaf</h4>
                      </div>
                      <p className="text-xs text-theme-text-secondary">Interactive Quran with translations and audio</p>
                    </div>
                    <div className="bg-theme-background p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MdRecordVoiceOver className="text-theme-primary-accent mr-2" size={20} />
                        <h4 className="font-medium text-theme-text-primary">Pronunciation</h4>
                      </div>
                      <p className="text-xs text-theme-text-secondary">Audio examples of correct pronunciation</p>
                    </div>
                    <div className="bg-theme-background p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FaChalkboardTeacher className="text-theme-primary-accent mr-2" size={20} />
                        <h4 className="font-medium text-theme-text-primary">Expert Tips</h4>
                      </div>
                      <p className="text-xs text-theme-text-secondary">Advice from qualified teachers</p>
                    </div>
                    <div className="bg-theme-background p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MdLanguage className="text-theme-primary-accent mr-2" size={20} />
                        <h4 className="font-medium text-theme-text-primary">Translations</h4>
                      </div>
                      <p className="text-xs text-theme-text-secondary">Multiple languages available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranLearningHome;

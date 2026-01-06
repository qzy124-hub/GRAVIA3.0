import React, { useState, useEffect, useCallback } from 'react';
import { User, Connection, MoodType, Coordinates, JournalEntry } from './types';
import { MOOD_COLORS, getVisualAttributes, generateHistory, generateMockUsers } from './constants';
import { analyzeEntry, findMatches } from './services/geminiService';
import GlobeVisual from './components/GlobeVisual';
import JournalModal from './components/JournalModal';
import ConnectionPanel from './components/ConnectionPanel';
import UserProfileModal from './components/UserProfileModal';
import NebulaSpace from './components/NebulaSpace';
import SettingsPanel from './components/SettingsPanel';
import LegendPanel from './components/LegendPanel';
import { Plus, Activity, Settings, X } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    brightness: 1.0,
    color: '#8b5cf6', // Default Nebula Purple
    language: 'zh' as 'zh' | 'en'
  });

  // UI State
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isConnectionPanelOpen, setIsConnectionPanelOpen] = useState(false);
  const [isNebulaSpaceOpen, setIsNebulaSpaceOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);

  // --- Initialization ---
  useEffect(() => {
    // Inject Custom Keyframes
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes flowHorizontal {
        0% { left: 25%; opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { left: 75%; opacity: 0; }
      }
      .animate-flow-horizontal {
        animation: flowHorizontal 2s infinite ease-in-out;
      }
      .animate-slide-in-left {
        animation: slideInLeft 0.3s ease-out forwards;
      }
      .animate-fade-in-right {
        animation: fadeInRight 0.5s ease-out forwards;
      }
      @keyframes fadeInRight {
        from { transform: translateX(20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideInLeft {
        from { transform: translateX(-20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes glowLine {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      .animate-glow-line {
        background-size: 200% 200%;
        animation: glowLine 3s linear infinite;
      }
    `;
    document.head.appendChild(styleSheet);

    // Initial Geolocation and User Gen
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          initializeUniverse({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          });
        },
        () => initializeUniverse({ lat: 31.23, lng: 121.47 }) 
      );
    } else {
      initializeUniverse({ lat: 31.23, lng: 121.47 });
    }

    return () => {
        document.head.removeChild(styleSheet);
    }
  }, []); // Run once on mount

  // Re-generate content if language changes
  useEffect(() => {
     if (currentUser) {
         const newMockUsers = generateMockUsers(300, settings.language);
         setUsers([currentUser, ...newMockUsers]);
     }
  }, [settings.language]);


  const initializeUniverse = (coords: Coordinates) => {
    const history = generateHistory(settings.language);
    
    const newUser: User = {
      id: 'current-user',
      name: 'Me',
      location: coords,
      currentMoods: [MoodType.JOY], 
      color: '#ffffff', 
      friends: [],
      entries: history 
    };
    
    const mockUsers = generateMockUsers(300, settings.language);

    setCurrentUser(newUser);
    setUsers([newUser, ...mockUsers]);
  };

  // --- Handlers ---

  const handleSettingsUpdate = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleJournalSubmit = async (text: string, isPublic: boolean, manualMoods: MoodType[], manualSubMoods: string[]) => {
    if (!currentUser) return;
    setIsProcessing(true);

    try {
      const analysis = await analyzeEntry(text, manualMoods, manualSubMoods);
      
      const newEntry: JournalEntry = {
        id: `entry-${Date.now()}`,
        content: text,
        timestamp: new Date(),
        moods: analysis.moods,
        subMoods: analysis.subMoods,
        isPublic,
        topics: analysis.topics,
        visuals: analysis.visuals,
        nebulaLocation: {
             lat: (Math.random() * 180) - 90,
             lng: (Math.random() * 360) - 180
        }
      };

      const updatedUser = {
        ...currentUser,
        currentMoods: analysis.moods,
        color: MOOD_COLORS[analysis.moods[0]], 
        entries: [newEntry, ...currentUser.entries]
      };

      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === 'current-user' ? updatedUser : u));

      const potentialMatches = users.filter(u => u.id !== 'current-user');
      const newConnections = await findMatches(text, analysis, potentialMatches);
      setConnections(newConnections);

      setIsJournalOpen(false);
      setIsConnectionPanelOpen(true); 
      
    } catch (error) {
      console.error("Process failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUserClick = useCallback((user: User) => {
    if (user.id === 'current-user') {
      setIsNebulaSpaceOpen(true);
    } else {
      setSelectedUser(user);
    }
  }, []);

  const handleConnectRequest = () => {
    if (!currentUser || !selectedUser) return;

    const updatedUser = {
      ...currentUser,
      friends: [...currentUser.friends, selectedUser.id]
    };
    
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === 'current-user' ? updatedUser : u));

    const msg = settings.language === 'zh' 
        ? `你与 ${selectedUser.name} 建立了稳定连接！` 
        : `Stable connection established with ${selectedUser.name}!`;

    alert(msg);
    setSelectedUser(null);
    setIsConnectionPanelOpen(false);
    setIsNebulaSpaceOpen(true); 
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      
      {/* 3D Globe Background */}
      <GlobeVisual 
        users={users} 
        connections={connections}
        currentUser={currentUser}
        onUserClick={handleUserClick}
        settings={settings}
      />

      {/* Overlay UI: Top Bar */}
      {/* Adjusted padding and flex layout for mobile */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex flex-col md:flex-row justify-between items-start pointer-events-none z-10">
        <div className="pointer-events-auto mt-12 md:mt-0 pl-2 md:pl-16">
          {/* Responsive Font Size */}
          <h1 className="text-3xl md:text-5xl font-extralight tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 drop-shadow-[0_0_15px_rgba(147,51,234,0.5)]">
            GRAVIA LINK
          </h1>
          <p className="text-[10px] md:text-xs text-blue-200/70 font-mono mt-2 tracking-widest uppercase">
            Planetary Emotional Resonance Network
          </p>
        </div>
        
        {/* Connection Counter */}
        {connections.length > 0 && (
          <div className="pointer-events-auto mt-4 md:mt-0 self-end bg-black/40 backdrop-blur-md border border-purple-500/30 px-4 py-2 md:px-6 md:py-3 rounded-full text-purple-200 text-xs md:text-sm flex items-center shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-fade-in">
            <span className="w-2 h-2 bg-pink-400 rounded-full mr-3 animate-ping"></span>
            <span className="font-light tracking-wider">
                {settings.language === 'zh' ? '共鸣点:' : 'Resonance Points:'} <b className="text-white ml-1">{connections.length}</b>
            </span>
          </div>
        )}
      </div>

      {/* Right Side: Legend (Hidden on Mobile) */}
      <LegendPanel />

      {/* Left Settings Button */}
      {/* Moved slightly for safe area */}
      <div className="absolute top-6 left-4 md:top-8 md:left-8 z-30 pointer-events-auto">
        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 flex items-center justify-center text-white/70 hover:text-white transition-all"
        >
          {isSettingsOpen ? <X size={20} /> : <Settings size={20} />}
        </button>
      </div>

      <SettingsPanel 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={handleSettingsUpdate}
      />

      {/* Center Bottom: Record Button */}
      {/* Moved up slightly on mobile to avoid overlap with bottom navigation bar if it exists, and separate from Nebula toggle */}
      {currentUser && (
        <div className="absolute bottom-16 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
          <button 
            onClick={() => setIsJournalOpen(true)}
            className="group relative flex items-center justify-center w-52 h-14 md:w-64 md:h-16 bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(147,51,234,0.5)] hover:scale-105 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors"></div>
            <Plus size={20} className="text-white mr-2 md:mr-3 group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-white text-sm md:text-lg font-light tracking-widest whitespace-nowrap">
                {settings.language === 'zh' ? '记录感悟' : 'Record Emotion'}
            </span>
          </button>
        </div>
      )}

      {/* Bottom Right: Nebula Space Toggle */}
      {/* Reduced size on mobile */}
      <div className="absolute bottom-6 right-4 md:bottom-8 md:right-8 z-20 pointer-events-auto">
        <button 
          onClick={() => setIsNebulaSpaceOpen(!isNebulaSpaceOpen)}
          className="flex flex-col items-center group"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/50 backdrop-blur-xl border border-pink-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)] group-hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] group-hover:scale-110 transition-all duration-300">
             <Activity className="text-pink-300 group-hover:text-white transition-colors" size={20} />
          </div>
          <span className="mt-2 text-[8px] md:text-[10px] text-pink-200/70 tracking-widest uppercase">
              {settings.language === 'zh' ? '星云空间' : 'Nebula Space'}
          </span>
        </button>
      </div>

      {/* Intro Modal */}
      {introVisible && (
        <div className="absolute top-1/2 left-1/2 md:left-10 transform -translate-x-1/2 -translate-y-1/2 md:translate-x-0 w-[90%] md:max-w-sm bg-black/30 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/10 text-white pointer-events-auto animate-fade-in-up z-50">
          <button onClick={() => setIntroVisible(false)} className="absolute top-4 right-4 text-white/30 hover:text-white"><X size={20}/></button>
          
          <h3 className="text-xl md:text-2xl font-light text-blue-200 mb-4">
              {settings.language === 'zh' ? '你不是孤独的' : 'You Are Not Alone'}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed font-light mb-4">
            {settings.language === 'zh' 
                ? '地球上有上亿的人，因为地区、文化、语言、宗教等差异让人产生隔阂，但情感是互通的。' 
                : 'Billions of people are separated by geography and culture, but emotions are universal.'}
          </p>
          <div className="text-xs text-purple-300/80 border-l-2 border-purple-500 pl-3">
             {settings.language === 'zh' ? (
                 <>
                 1. 记录此刻心情<br/>
                 2. 匹配对应色轮情绪<br/>
                 3. 建立引力连接
                 </>
             ) : (
                 <>
                 1. Record your feeling<br/>
                 2. Match emotional spectrum<br/>
                 3. Establish connection
                 </>
             )}
          </div>
        </div>
      )}

      {/* Modals */}
      {isJournalOpen && (
        <JournalModal 
          onSubmit={handleJournalSubmit} 
          onClose={() => setIsJournalOpen(false)}
          isProcessing={isProcessing}
        />
      )}

      {isConnectionPanelOpen && (
        <ConnectionPanel 
          connections={connections} 
          users={users}
          onClose={() => setIsConnectionPanelOpen(false)}
          onUserSelect={(u) => setSelectedUser(u)}
        />
      )}

      {selectedUser && (
        <UserProfileModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          onConnect={handleConnectRequest}
        />
      )}

      {/* My Nebula Space */}
      <NebulaSpace 
        isOpen={isNebulaSpaceOpen}
        onClose={() => setIsNebulaSpaceOpen(false)}
        currentUser={currentUser}
        users={users}
      />

    </div>
  );
};

export default App;
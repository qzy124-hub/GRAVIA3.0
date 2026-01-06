import React, { useState, useEffect } from 'react';
import { User, JournalEntry } from '../types';
import { X, Link2, ArrowLeft, Activity } from 'lucide-react';
import EmotionGallery from './EmotionGallery';
import EntryDetailModal from './EntryDetailModal';
import NebulaIslandView from './NebulaIslandView';

interface NebulaSpaceProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  users: User[];
}

type ViewMode = 'list' | 'solo' | 'match' | 'gallery';

const NebulaSpace: React.FC<NebulaSpaceProps> = ({ isOpen, onClose, currentUser, users }) => {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedFriendId(null);
      setViewMode('list');
      setSelectedEntry(null);
    }
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  // 1. Data Prep
  const friends = users.filter(u => currentUser.friends.includes(u.id));
  const activeFriend = selectedFriendId ? users.find(u => u.id === selectedFriendId) : null;
  
  // 2. Logic for Nebula Users (Solo vs Match)
  const nebulaUsers = activeFriend && viewMode === 'match' 
    ? [currentUser, activeFriend] 
    : [currentUser];

  // Handlers
  const handleViewMyNebula = () => {
    setSelectedFriendId(null);
    setViewMode('solo');
  };

  const handleSelectFriend = (id: string) => {
    setSelectedFriendId(id);
    setViewMode('match');
  };

  const handleEntryClick = (entry: JournalEntry) => {
     // Security Check: If it's a friend's private entry, do not open details
     const isFriend = entry && activeFriend && !activeFriend.entries.includes(entry); // Rough check
     const isOwner = entry && currentUser.entries.find(e => e.id === entry.id);
     
     if (!entry.isPublic && !isOwner) {
         // Locked feedback handled by tooltip, double check here
         return; 
     }
     setSelectedEntry(entry);
  };

  // --- RENDER ---

  // Gallery View (Full History)
  if (viewMode === 'gallery') {
      return <EmotionGallery user={currentUser} onClose={() => setViewMode('solo')} />
  }

  // List View (Default entry) - Responsive: Sidebar on Desktop, Bottom Sheet on Mobile
  if (viewMode === 'list') {
    return (
      <div className="fixed inset-x-0 bottom-0 md:bottom-24 md:right-10 md:left-auto md:w-80 h-[50vh] md:h-auto bg-black/90 md:bg-black/80 backdrop-blur-md border-t md:border border-gray-800 rounded-t-2xl md:rounded-2xl shadow-2xl z-50 animate-fade-in-up flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-purple-400">
            <Link2 size={16} />
            <h2 className="font-mono text-xs uppercase tracking-widest">Resonance Links</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={16} /></button>
        </div>

        <div className="p-2 space-y-2 overflow-y-auto custom-scrollbar flex-1">
           <button 
             onClick={handleViewMyNebula}
             className="w-full py-3 px-4 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/20 rounded-lg text-blue-100 flex items-center justify-between group transition-all"
           >
             <span className="text-xs font-bold tracking-wider">PERSONAL NEBULA</span>
             <ArrowLeft size={14} className="opacity-0 group-hover:opacity-100 rotate-180 transition-all" />
           </button>

           <div className="h-px bg-gray-800 my-2"></div>

           {friends.length === 0 ? (
             <div className="text-center py-6 text-gray-600 text-[10px] uppercase tracking-wider">No active links</div>
           ) : (
             friends.map(friend => (
                <button 
                  key={friend.id} 
                  onClick={() => handleSelectFriend(friend.id)}
                  className="w-full flex items-center p-2 rounded-lg hover:bg-gray-800 transition-colors group"
                >
                   <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black mr-3 shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: friend.color }}>
                      {friend.name.charAt(0)}
                   </div>
                   <div className="text-left">
                      <div className="text-sm text-gray-200">{friend.name}</div>
                      <div className="text-[10px] text-green-500 flex items-center"><Activity size={8} className="mr-1"/> Stable</div>
                   </div>
                </button>
             ))
           )}
        </div>
      </div>
    );
  }

  // 3D Nebula View (Solo or Match)
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-scale-in overflow-hidden">
      
      {/* Background Layers */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80 z-0"></div>
      <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 z-0"></div>

      {/* Header */}
      <div className="relative z-10 px-4 py-4 md:px-10 md:py-8 flex justify-between items-center w-full">
        <button 
          onClick={() => setViewMode('list')} 
          className="flex items-center px-3 py-1 md:px-4 md:py-2 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border border-gray-800 rounded-full transition-all text-xs uppercase tracking-widest backdrop-blur-sm"
        >
          <ArrowLeft size={14} className="mr-2" /> <span className="hidden md:inline">Return</span>
        </button>
        <div className="text-right">
             <h1 className="text-lg md:text-xl font-bold text-white tracking-[0.2em] uppercase">
                {viewMode === 'solo' ? 'My Nebula' : 'Resonance Path'}
             </h1>
             <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1">
                Visualizing Emotional Gravity
             </p>
        </div>
      </div>

      {/* 3D Scene */}
      <NebulaIslandView 
         users={nebulaUsers} 
         currentUser={currentUser}
         onEntryClick={handleEntryClick}
      />

      {/* Footer / Legend */}
      <div className="absolute bottom-6 md:bottom-10 w-full text-center pointer-events-none z-10 px-4">
        <p className="text-[8px] md:text-[10px] tracking-[0.3em] text-gray-600 uppercase leading-relaxed">
          {viewMode === 'match' ? 'Locked particles are private • White line indicates connection' : 'Click "Expand Timeline" to see gallery'}
        </p>
        {viewMode === 'solo' && (
             <button 
                onClick={() => setViewMode('gallery')}
                className="pointer-events-auto mt-2 md:mt-4 px-4 py-2 md:px-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-[10px] md:text-xs uppercase tracking-widest transition-all"
             >
                Expand Timeline
             </button>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <EntryDetailModal 
            entry={selectedEntry} 
            onClose={() => setSelectedEntry(null)} 
        />
      )}
    </div>
  );
};

export default NebulaSpace;
import React from 'react';
import { User } from '../types';
import { X, MapPin, Calendar, Heart, MessageSquare } from 'lucide-react';
import { MOOD_COLORS } from '../constants';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onConnect: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onConnect }) => {
  // Only get the latest entry
  const latestEntry = user.entries[0];
  
  if (!latestEntry) return null;

  const timeAgo = (date: Date) => {
      const diff = (new Date().getTime() - date.getTime()) / 1000 / 60 / 60; // hours
      if (diff < 1) return "Just now";
      if (diff < 24) return `${Math.floor(diff)}h ago`;
      return "Yesterday";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative">
        
        {/* Glowing Background Accent */}
        <div 
            className="absolute top-0 left-0 w-full h-32 opacity-20 blur-3xl" 
            style={{ backgroundColor: user.color }}
        ></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all z-10">
            <X size={20} />
        </button>

        <div className="p-8 pt-10 flex flex-col items-center text-center relative z-0">
             {/* Avatar Halo */}
             <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full blur-md opacity-60 animate-pulse" style={{ backgroundColor: user.color }}></div>
                <div 
                    className="relative w-24 h-24 rounded-full border-4 border-gray-900 flex items-center justify-center text-3xl font-bold text-white shadow-2xl"
                    style={{ backgroundColor: user.color }}
                >
                    {user.name.charAt(0)}
                </div>
             </div>

             <h2 className="text-2xl font-bold text-white tracking-wider">{user.name}</h2>
             <div className="flex items-center text-gray-400 mt-2 space-x-3 text-xs uppercase tracking-widest">
                <span className="flex items-center"><MapPin size={10} className="mr-1"/> {user.location.lat.toFixed(1)}, {user.location.lng.toFixed(1)}</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="text-blue-300">{timeAgo(latestEntry.timestamp)}</span>
             </div>

             {/* The Single Latest Entry */}
             <div className="mt-8 w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-left relative overflow-hidden group hover:bg-white/10 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: user.color }}></div>
                
                <div className="flex justify-between items-start mb-4">
                     <div className="flex gap-2">
                        {latestEntry.moods.map(m => (
                            <span key={m} className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-black/40 text-white border border-white/10" style={{ color: MOOD_COLORS[m] }}>
                                {m}
                            </span>
                        ))}
                     </div>
                     <MessageSquare size={14} className="text-gray-600"/>
                </div>

                <p className="text-gray-200 font-light text-lg leading-relaxed italic line-clamp-4">
                    "{latestEntry.isPublic ? latestEntry.content : 'Private thought...'}"
                </p>

                <div className="mt-4 flex gap-2">
                    {latestEntry.topics.map(t => (
                        <span key={t} className="text-[10px] uppercase text-gray-500">#{t}</span>
                    ))}
                </div>
             </div>

             {/* Action */}
             <button 
                onClick={onConnect}
                className="mt-8 w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center shadow-lg group"
            >
                <Heart size={18} className="mr-2 text-red-500 fill-current group-hover:scale-110 transition-transform" />
                ESTABLISH RESONANCE
             </button>
        </div>

      </div>
    </div>
  );
};

export default UserProfileModal;
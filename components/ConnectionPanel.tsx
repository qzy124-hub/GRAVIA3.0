import React from 'react';
import { User, Connection } from '../types';
import { X, User as UserIcon, MessageSquare } from 'lucide-react';
import { MOOD_COLORS } from '../constants';

interface ConnectionPanelProps {
  connections: Connection[];
  users: User[];
  onClose: () => void;
  onUserSelect: (user: User) => void;
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({ connections, users, onClose, onUserSelect }) => {
  return (
    <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-gray-900/95 md:bg-gray-900/90 backdrop-blur-md border-l border-gray-800 shadow-2xl z-40 transform transition-transform animate-slide-in-right flex flex-col pt-16 md:pt-0">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-light text-white">Constellation</h2>
          <p className="text-xs text-blue-400 mt-1">{connections.length} active resonance links</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {connections.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>Scanning the nebula for resonance...</p>
          </div>
        ) : (
          connections.map((conn) => {
            const user = users.find(u => u.id === conn.toUserId);
            if (!user) return null;
            
            return (
              <div 
                key={conn.toUserId}
                onClick={() => onUserSelect(user)}
                className="group bg-gray-800/50 hover:bg-gray-800 rounded-xl p-4 cursor-pointer border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full shadow-[0_0_8px]" 
                      style={{ backgroundColor: user.color, boxShadow: `0 0 10px ${user.color}` }}
                    />
                    <span className="font-medium text-white">{user.name}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-500">{(conn.strength * 100).toFixed(0)}% Match</span>
                </div>
                
                <p className="text-sm text-gray-300 italic mb-3 line-clamp-2">
                  "{user.entries[0].content}"
                </p>

                <div className="flex items-center text-xs text-blue-300 bg-blue-900/20 px-3 py-2 rounded-lg">
                  <span className="mr-1">✨</span>
                  {conn.reason}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConnectionPanel;
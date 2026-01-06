import React from 'react';
import { JournalEntry, MoodType } from '../types';
import { MOOD_COLORS } from '../constants';
import { X, Calendar, MessageSquare, Mic, Image as ImageIcon, Activity } from 'lucide-react';

interface EntryDetailModalProps {
  entry: JournalEntry;
  onClose: () => void;
}

const EntryDetailModal: React.FC<EntryDetailModalProps> = ({ entry, onClose }) => {
  const formattedDate = new Date(entry.timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 p-8 flex justify-between items-start">
            <div className="absolute inset-0 opacity-30" style={{ backgroundColor: MOOD_COLORS[entry.moods[0]] }}></div>
            <div className="relative z-10">
                {/* Updated: Removed the question mark */}
                <h2 className="text-3xl font-light text-white tracking-widest">{entry.moods[0].toUpperCase()}</h2>
                <div className="flex items-center text-gray-400 mt-2 space-x-2">
                    <Calendar size={14} />
                    <span className="text-sm font-mono">{formattedDate}</span>
                </div>
            </div>
            <button onClick={onClose} className="relative z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
            
            {/* Composition Section */}
            <div>
                <h3 className="text-xs uppercase text-gray-500 tracking-[0.2em] mb-4">Emotional Composition</h3>
                <div className="flex flex-wrap gap-4">
                    {entry.moods.map((mood, idx) => (
                        <div key={idx} className="flex items-center space-x-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                             <div 
                                className="w-4 h-4 rounded-full shadow-[0_0_10px]"
                                style={{ backgroundColor: MOOD_COLORS[mood], boxShadow: `0 0 8px ${MOOD_COLORS[mood]}` }}
                             ></div>
                             <div className="flex flex-col">
                                 <span className="text-sm text-white font-medium">{mood}</span>
                                 <span className="text-[10px] text-gray-400">Primary Tone</span>
                             </div>
                        </div>
                    ))}
                    {entry.subMoods.map((sub, idx) => (
                         <div key={`sub-${idx}`} className="flex items-center space-x-2 bg-gray-800/30 px-3 py-2 rounded-lg border border-gray-700/50">
                            <span className="text-xs text-gray-300 italic">{sub}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Text */}
            <div>
                 <h3 className="text-xs uppercase text-gray-500 tracking-[0.2em] mb-4 flex items-center">
                    <MessageSquare size={12} className="mr-2"/> Experience & Reflection
                 </h3>
                 <p className="text-lg text-gray-200 leading-relaxed font-light border-l-2 border-gray-700 pl-4 whitespace-pre-wrap">
                    "{entry.content}"
                 </p>
            </div>

            {/* Updated: Display Actual Image if available */}
            {entry.imageUrl ? (
                <div>
                     <h3 className="text-xs uppercase text-gray-500 tracking-[0.2em] mb-4 flex items-center">
                        <ImageIcon size={12} className="mr-2"/> Visual Memory
                     </h3>
                     <div className="rounded-xl overflow-hidden border border-gray-700/50 shadow-lg relative group">
                        <img 
                            src={entry.imageUrl} 
                            alt="User upload" 
                            className="w-full h-auto max-h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                     </div>
                </div>
            ) : (
                /* Fallback Placeholders (Only shown if no image) */
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 h-32 hover:bg-gray-800/50 transition-colors cursor-pointer">
                        <ImageIcon size={24} className="mb-2"/>
                        <span className="text-xs">Visual Snapshot</span>
                        {/* Simulated visual */}
                        <div className="w-full h-1 mt-2 rounded overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent w-full"></div>
                        </div>
                     </div>
                     <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 h-32 hover:bg-gray-800/50 transition-colors cursor-pointer">
                        <Mic size={24} className="mb-2"/>
                        <span className="text-xs">Voice Note</span>
                        {/* Simulated Waveform */}
                        <div className="flex items-end h-4 gap-1 mt-2">
                            {[1,3,2,4,2,3,1,2].map((h, i) => (
                                <div key={i} className="w-1 bg-gray-600 rounded-full" style={{ height: `${h * 20}%`}}></div>
                            ))}
                        </div>
                     </div>
                </div>
            )}
            
            {/* Metadata */}
            <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-600">
                <span>Entry ID: {entry.id.split('-').slice(0,2).join('-')}...</span>
                <span className="flex items-center"><Activity size={10} className="mr-1"/> Visual Roughness: {entry.visuals.roughness.toFixed(2)}</span>
            </div>

        </div>
      </div>
    </div>
  );
};

export default EntryDetailModal;
import React, { useState } from 'react';
import { Send, Lock, Globe as GlobeIcon, X, Image as ImageIcon, Mic } from 'lucide-react';
import { MOOD_COLORS, MOOD_HIERARCHY } from '../constants';
import { MoodType } from '../types';

interface JournalModalProps {
  onSubmit: (text: string, isPublic: boolean, moods: MoodType[], subMoods: string[]) => void;
  onClose: () => void;
  isProcessing: boolean;
}

const JournalModal: React.FC<JournalModalProps> = ({ onSubmit, onClose, isProcessing }) => {
  const [text, setText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // Multi-select state
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([]);
  const [selectedSubMoods, setSelectedSubMoods] = useState<string[]>([]);
  
  const [hasImage, setHasImage] = useState(false); 

  const handleMoodSelect = (mood: MoodType) => {
    if (selectedMoods.includes(mood)) {
      // Remove
      setSelectedMoods(prev => prev.filter(m => m !== mood));
    } else {
      // Add if less than 3
      if (selectedMoods.length < 3) {
        setSelectedMoods(prev => [...prev, mood]);
      }
    }
  };

  const toggleSubMood = (sub: string) => {
    if (selectedSubMoods.includes(sub)) {
      setSelectedSubMoods(prev => prev.filter(s => s !== sub));
    } else {
      if (selectedSubMoods.length < 3) {
        setSelectedSubMoods(prev => [...prev, sub]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && selectedMoods.length > 0) {
      onSubmit(text, isPublic, selectedMoods, selectedSubMoods);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-2 md:p-0">
      <div className="w-full md:w-3/4 lg:w-2/3 h-[90vh] md:h-2/3 bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row animate-scale-in relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 z-50 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        {/* LEFT COLUMN: Input */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-b from-transparent to-black/20 h-1/2 md:h-full">
          <h2 className="text-xl md:text-2xl font-light text-white tracking-widest uppercase mb-4 md:mb-6">
            Record Experience
          </h2>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What is flowing through you right now? Describe the moment..."
            className="flex-1 bg-transparent text-base md:text-lg text-white placeholder-gray-600 outline-none resize-none mb-4 md:mb-6 font-light leading-relaxed"
            disabled={isProcessing}
          />

          {/* Media Attachments */}
          <div className="flex gap-4 mb-4 md:mb-8">
            <button 
              onClick={() => setHasImage(!hasImage)}
              className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl border transition-all ${hasImage ? 'bg-blue-500/20 border-blue-500 text-blue-200' : 'border-gray-700 text-gray-500 hover:text-white hover:border-gray-500'}`}
            >
              <ImageIcon size={18} />
            </button>
            <button className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl border border-gray-700 text-gray-500 hover:text-white hover:border-gray-500 transition-all">
              <Mic size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-auto">
             <div className="flex space-x-4 text-xs font-medium text-gray-400">
                <button onClick={() => setIsPublic(true)} className={`flex items-center transition-colors ${isPublic ? 'text-blue-400' : 'hover:text-white'}`}>
                  <GlobeIcon size={14} className="mr-1" /> Public
                </button>
                <button onClick={() => setIsPublic(false)} className={`flex items-center transition-colors ${!isPublic ? 'text-blue-400' : 'hover:text-white'}`}>
                  <Lock size={14} className="mr-1" /> Private
                </button>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Classification */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col bg-black/40 relative overflow-y-auto custom-scrollbar h-1/2 md:h-full">
          <h2 className="text-lg md:text-xl font-light text-gray-400 tracking-widest uppercase mb-4 flex items-center justify-between">
            <span>Identify Resonance</span>
            <span className="text-xs tracking-normal opacity-50">Select up to 3</span>
          </h2>

          {/* Selected Moods Indicator */}
          <div className="flex space-x-2 mb-4 md:mb-6 h-8 overflow-x-auto hide-scrollbar">
            {selectedMoods.map((mood, idx) => (
              <div key={mood} className="flex items-center bg-gray-800 rounded-full px-3 py-1 border border-white/10 animate-fade-in-right whitespace-nowrap">
                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: MOOD_COLORS[mood] }}></span>
                <span className="text-xs text-white uppercase tracking-wider">{idx + 1}. {mood}</span>
                <button onClick={() => handleMoodSelect(mood)} className="ml-2 text-gray-500 hover:text-white"><X size={10}/></button>
              </div>
            ))}
            {selectedMoods.length === 0 && <span className="text-xs text-gray-600 italic py-1">No emotions selected yet...</span>}
          </div>

          <div className="flex-1 flex flex-col">
              {/* Level 1: Primary Emotions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
                {Object.values(MoodType).map((mood) => {
                  const isSelected = selectedMoods.includes(mood);
                  const selectionIndex = selectedMoods.indexOf(mood);
                  
                  return (
                    <button
                      key={mood}
                      onClick={() => handleMoodSelect(mood)}
                      className={`group relative h-12 md:h-16 rounded-xl border overflow-hidden transition-all duration-300 ${isSelected ? 'border-white ring-1 ring-white/50 scale-[0.98]' : 'border-white/5 hover:border-white/20 hover:scale-[1.01]'}`}
                    >
                      <div 
                        className="absolute inset-0 transition-opacity duration-300"
                        style={{ 
                            backgroundColor: MOOD_COLORS[mood],
                            opacity: isSelected ? 0.3 : 0.1
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-between px-3 md:px-4">
                        <span className={`text-xs md:text-sm font-medium tracking-wider uppercase drop-shadow-md ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                          {mood}
                        </span>
                        {isSelected && (
                            <span className="flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full bg-white text-black text-[10px] md:text-xs font-bold">
                                {selectionIndex + 1}
                            </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Level 2: Sub Emotions (Only show for selected moods) */}
              {selectedMoods.length > 0 && (
                 <div className="mb-4 animate-fade-in-up">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Refine Nuances</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedMoods.flatMap(m => MOOD_HIERARCHY[m]).map((sub) => (
                           <button
                             key={sub}
                             onClick={() => toggleSubMood(sub)}
                             className={`px-3 py-1 rounded-full text-[10px] uppercase border transition-all ${
                               selectedSubMoods.includes(sub)
                                 ? 'border-white text-white bg-white/10'
                                 : 'border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
                             }`}
                           >
                             {sub}
                           </button>
                        ))}
                    </div>
                 </div>
              )}
          </div>

          <div className="mt-auto flex justify-end items-center pt-4 border-t border-white/5">
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || selectedMoods.length === 0 || isProcessing}
                className="px-6 py-2 md:px-8 md:py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isProcessing ? 'Crystalizing...' : 'Generate Particle'} 
                <Send size={16} className="ml-2" />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalModal;
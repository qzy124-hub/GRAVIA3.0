import React from 'react';
import { MOOD_COLORS, MOOD_HIERARCHY } from '../constants';
import { MoodType } from '../types';

const LegendPanel: React.FC = () => {
  // Order based on the Plutchik wheel flow roughly
  const orderedMoods = [
    MoodType.JOY,
    MoodType.TRUST,
    MoodType.ANTICIPATION,
    MoodType.ANGER,
    MoodType.FEAR,
    MoodType.DISGUST,
    MoodType.SADNESS,
    MoodType.SURPRISE
  ];

  return (
    <div className="absolute right-8 top-32 z-20 hidden md:flex flex-col animate-fade-in-right">
      <div className="bg-black/80 backdrop-blur-xl px-5 py-6 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center w-20">
        <h3 className="text-[10px] text-gray-500 uppercase tracking-[0.1em] mb-6 font-medium text-center">
          Spectrum
        </h3>
        <div className="flex flex-col space-y-5">
          {orderedMoods.map((mood) => (
            <div key={mood} className="group relative flex items-center justify-center">
              {/* Glowing Dot */}
              <div 
                className="w-3 h-3 rounded-full transition-all duration-300 group-hover:scale-150 cursor-help"
                style={{ 
                  backgroundColor: MOOD_COLORS[mood],
                  boxShadow: `0 0 10px ${MOOD_COLORS[mood]}`,
                }}
              ></div>
              
              {/* Tooltip for sub-emotions (Appears to the left) */}
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 w-48 bg-gray-900/95 border border-white/10 p-3 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-30 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                   <p className="text-sm font-bold uppercase tracking-wider" style={{ color: MOOD_COLORS[mood] }}>{mood}</p>
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MOOD_COLORS[mood], boxShadow: `0 0 5px ${MOOD_COLORS[mood]}` }}></div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {MOOD_HIERARCHY[mood].map(sub => (
                    <span key={sub} className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded border border-white/5 hover:bg-white/10 transition-colors">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegendPanel;
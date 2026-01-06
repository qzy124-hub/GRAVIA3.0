import React from 'react';
import { Moon, Sun, Palette, Globe, X } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    brightness: number;
    color: string;
    language: 'zh' | 'en';
  };
  onUpdate: (key: string, value: any) => void;
}

const THEME_COLORS = [
  { name: 'Nebula Purple', value: '#8b5cf6' },
  { name: 'Cosmic Blue', value: '#3b82f6' },
  { name: 'Starlight Gold', value: '#eab308' },
  { name: 'Void White', value: '#ffffff' }
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-auto md:top-24 md:left-8 z-40 flex items-center justify-center md:block p-4 md:p-0 bg-black/50 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
      <div className="w-full max-w-sm md:w-72 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-slide-in-left p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-light tracking-[0.2em] uppercase text-sm">System Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Language */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center">
              <Globe size={12} className="mr-2" /> Language
            </label>
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button 
                onClick={() => onUpdate('language', 'zh')}
                className={`flex-1 py-1.5 text-xs rounded-md transition-all ${settings.language === 'zh' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
              >
                中文
              </button>
              <button 
                onClick={() => onUpdate('language', 'en')}
                className={`flex-1 py-1.5 text-xs rounded-md transition-all ${settings.language === 'en' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
              >
                English
              </button>
            </div>
          </div>

          {/* Brightness */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center">
              {settings.brightness > 1 ? <Sun size={12} className="mr-2"/> : <Moon size={12} className="mr-2"/>} 
              Atmosphere
            </label>
            <input 
              type="range" 
              min="0.2" 
              max="1.5" 
              step="0.1"
              value={settings.brightness}
              onChange={(e) => onUpdate('brightness', parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>Dark</span>
              <span>Bright</span>
            </div>
          </div>

          {/* Theme Color */}
          <div className="space-y-3">
            <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center">
              <Palette size={12} className="mr-2" /> Link Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {THEME_COLORS.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => onUpdate('color', theme.value)}
                  className={`w-full aspect-square rounded-full border-2 transition-all ${settings.color === theme.value ? 'border-white scale-110 shadow-[0_0_10px_white]' : 'border-transparent hover:scale-110'}`}
                  style={{ backgroundColor: theme.value }}
                  title={theme.name}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
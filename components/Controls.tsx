import React from 'react';
import { Gender, Size, Ethnicity, ModelSettings } from '../types';

interface ControlsProps {
  settings: ModelSettings;
  setSettings: React.Dispatch<React.SetStateAction<ModelSettings>>;
  disabled?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ settings, setSettings, disabled }) => {
  
  const handleChange = (key: keyof ModelSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 p-6 bg-fashion-dark rounded-2xl border border-white/10 shadow-xl">
      <h3 className="text-xl font-serif text-fashion-accent mb-4">Model Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gender</label>
          <select 
            disabled={disabled}
            value={settings.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full bg-fashion-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-fashion-accent focus:ring-1 focus:ring-fashion-accent outline-none transition-all appearance-none cursor-pointer"
          >
            {Object.values(Gender).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Size */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Size</label>
          <select 
            disabled={disabled}
            value={settings.size}
            onChange={(e) => handleChange('size', e.target.value)}
            className="w-full bg-fashion-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-fashion-accent focus:ring-1 focus:ring-fashion-accent outline-none transition-all"
          >
            {Object.values(Size).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Ethnicity */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Model Ethnicity</label>
          <select 
            disabled={disabled}
            value={settings.ethnicity}
            onChange={(e) => handleChange('ethnicity', e.target.value)}
            className="w-full bg-fashion-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-fashion-accent focus:ring-1 focus:ring-fashion-accent outline-none transition-all"
          >
            {Object.values(Ethnicity).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        
        {/* Vibe */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Environment / Vibe</label>
          <input
            type="text"
            disabled={disabled}
            value={settings.vibe}
            onChange={(e) => handleChange('vibe', e.target.value)}
            placeholder="e.g. Paris street style, Cyberpunk neon, Minimalist beige..."
            className="w-full bg-fashion-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-fashion-accent focus:ring-1 focus:ring-fashion-accent outline-none transition-all placeholder-gray-600"
          />
        </div>
      </div>
    </div>
  );
};
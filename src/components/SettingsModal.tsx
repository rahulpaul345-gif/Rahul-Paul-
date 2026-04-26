import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Volume2, User, Sliders, Cloud, CloudOff } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    language: string;
    voiceName: string;
    playbackSpeed: number;
    pitch: number;
    cloudSync: boolean;
  };
  setSettings: (s: any) => void;
}

export function SettingsModal({ isOpen, onClose, settings, setSettings }: SettingsModalProps) {
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'hi-IN', name: 'Hindi (India)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'de-DE', name: 'German (Germany)' },
  ];

  const voices = [
    { id: 'Kore', name: 'Kore (Default)' },
    { id: 'Puck', name: 'Puck (Soft)' },
    { id: 'Charon', name: 'Charon (Deep)' },
    { id: 'Fenrir', name: 'Fenrir (Power)' },
    { id: 'Zephyr', name: 'Zephyr (Bright)' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Neural Settings</h3>
                  <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Calibration Interface</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${settings.cloudSync ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                      {settings.cloudSync ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Cloud Link</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Multi-Device Sync</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, cloudSync: !settings.cloudSync })}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.cloudSync ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <motion.div
                      animate={{ x: settings.cloudSync ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Globe className="w-3 h-3" /> Linguistic Profile
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSettings({ ...settings, language: lang.code })}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-sm font-medium ${
                        settings.language === lang.code 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      {lang.name}
                      {settings.language === lang.code && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Volume2 className="w-3 h-3" /> Synthesis Voice
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {voices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSettings({ ...settings, voiceName: voice.id })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        settings.voiceName === voice.id
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {voice.name}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2"><Sliders className="w-3 h-3" /> Voice Profile</div>
                  <div className="flex gap-4">
                    <span className="text-indigo-600 tabular-nums">S: {settings.playbackSpeed.toFixed(1)}x</span>
                    <span className="text-purple-600 tabular-nums">P: {settings.pitch.toFixed(1)}x</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Speed</div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    value={settings.playbackSpeed}
                    onChange={(e) => setSettings({ ...settings, playbackSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="text-[10px] text-slate-400 uppercase font-bold mt-2">Pitch (Neural Simulation)</div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    value={settings.pitch}
                    onChange={(e) => setSettings({ ...settings, pitch: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              </section>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all transform hover:-translate-y-1 active:translate-y-0"
              >
                Synchronize Configuration
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Palette, Type, Layout, MousePointer2, Check, Sparkles } from 'lucide-react';
import { CustomTheme, BackgroundConfig, ButtonConfig } from '../types';
import { FONTS } from '../constants/themes';
import { BackgroundCreationModal } from './BackgroundCreationModal';
import { ButtonCreationModal } from './ButtonCreationModal';

interface CustomThemeModalProps {
  onSave: (theme: CustomTheme) => void;
  onDelete: () => void;
  onClose: () => void;
  initialTheme?: CustomTheme;
}

export const CustomThemeModal: React.FC<CustomThemeModalProps> = ({ onSave, onDelete, onClose, initialTheme }) => {
  const [showBackgroundCreator, setShowBackgroundCreator] = useState(false);
  const [showButtonCreator, setShowButtonCreator] = useState(false);
  const [theme, setTheme] = useState<CustomTheme>(initialTheme || {
    id: 'custom-' + Date.now(),
    name: 'My Custom Theme',
    backgroundColor: '#f8fafc',
    buttonColor: '#6366f1',
    interfaceName: 'Arcane Exams',
    fontStyle: 'sans',
    backgroundConfig: {
      backgroundColor: '#f8fafc',
      overlays: [],
      shapes: []
    },
    buttonConfig: {
      borderRadius: 16,
      borderWidth: 0,
      borderColor: '#6366f1',
      backgroundColor: '#6366f1',
      textColor: '#ffffff',
      fontSize: 14,
      fontWeight: 900,
      paddingX: 24,
      paddingY: 12,
      shadow: 'lg',
      hoverScale: 1.05,
      activeScale: 0.95,
      animation: 'none',
      letterSpacing: 0,
      textTransform: 'uppercase',
      italic: true
    }
  });

  const handleSaveBackground = (config: BackgroundConfig) => {
    setTheme(prev => ({
      ...prev,
      backgroundConfig: config,
      backgroundColor: config.backgroundColor // Sync base background color
    }));
    setShowBackgroundCreator(false);
  };

  const handleSaveButton = (config: ButtonConfig) => {
    setTheme(prev => ({
      ...prev,
      buttonConfig: config,
      buttonColor: config.backgroundColor // Sync base button color
    }));
    setShowButtonCreator(false);
  };

  const handleSave = () => {
    onSave(theme);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-6 sm:p-10 space-y-8 border-2 border-slate-100 dark:border-slate-800 relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none text-slate-900 dark:text-white">Create Custom Theme</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Design your own experience</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Layout className="w-3 h-3" /> Interface Name
              </label>
              <input
                type="text"
                value={theme.interfaceName}
                onChange={(e) => setTheme({ ...theme, interfaceName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                placeholder="e.g. Arcane Exams"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Palette className="w-3 h-3" /> Background Creation
              </label>
              <button
                onClick={() => setShowBackgroundCreator(true)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
              >
                <Palette className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                Customize Background
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <MousePointer2 className="w-3 h-3" /> Button Creation
              </label>
              <button
                onClick={() => setShowButtonCreator(true)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                Customize Button
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Palette className="w-3 h-3" /> Background Color
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={theme.backgroundColor}
                  onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={theme.backgroundColor}
                  onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <MousePointer2 className="w-3 h-3" /> Button Color
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={theme.buttonColor}
                  onChange={(e) => setTheme({ ...theme, buttonColor: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={theme.buttonColor}
                  onChange={(e) => setTheme({ ...theme, buttonColor: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Type className="w-3 h-3" /> Font Style
              </label>
              <div className="grid grid-cols-1 gap-2">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTheme({ ...theme, fontStyle: f.id })}
                    className={`px-4 py-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                      theme.fontStyle === f.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-transparent bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                    style={{ fontFamily: f.family }}
                  >
                    <span>{f.name}</span>
                    {theme.fontStyle === f.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Preview</h4>
            <div 
              className="aspect-video rounded-3xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden relative flex flex-col items-center justify-center p-6 transition-colors duration-500"
              style={{ backgroundColor: theme.backgroundColor }}
            >
              <div className="text-center space-y-4">
                <h1 
                  className="text-2xl font-black uppercase italic tracking-tighter leading-none text-slate-900 dark:text-white"
                  style={{ fontFamily: FONTS.find(f => f.id === theme.fontStyle)?.family }}
                >
                  {theme.interfaceName}
                </h1>
                <button
                  className="px-6 py-3 text-white font-black uppercase tracking-tighter rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: theme.buttonConfig?.backgroundColor || theme.buttonColor,
                    color: theme.buttonConfig?.textColor || '#ffffff',
                    borderRadius: theme.buttonConfig ? `${theme.buttonConfig.borderRadius}px` : '12px',
                    borderWidth: theme.buttonConfig ? `${theme.buttonConfig.borderWidth}px` : '0px',
                    borderColor: theme.buttonConfig?.borderColor || theme.buttonColor,
                    fontSize: theme.buttonConfig ? `${theme.buttonConfig.fontSize}px` : '14px',
                    fontWeight: theme.buttonConfig?.fontWeight || 900,
                    padding: theme.buttonConfig ? `${theme.buttonConfig.paddingY}px ${theme.buttonConfig.paddingX}px` : '12px 24px',
                    letterSpacing: theme.buttonConfig ? `${theme.buttonConfig.letterSpacing}px` : '0px',
                    textTransform: theme.buttonConfig?.textTransform || 'uppercase',
                    fontStyle: theme.buttonConfig?.italic ? 'italic' : 'normal',
                    fontFamily: FONTS.find(f => f.id === theme.fontStyle)?.family 
                  }}
                >
                  Start Exam
                </button>
              </div>
              
              {/* Decorative dots */}
              <div className="absolute top-4 left-4 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Theme ID</span>
                <span className="font-mono">{theme.id}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                This theme will be saved to your local session and applied across the application.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          {initialTheme && (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-rose-200 dark:border-rose-800 text-rose-500 font-black uppercase tracking-widest text-xs hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
            >
              Delete Theme
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save & Apply Theme
          </button>
        </div>
      </motion.div>
      {/* Background Creator Modal */}
      <AnimatePresence>
        {showBackgroundCreator && (
          <BackgroundCreationModal 
            config={theme.backgroundConfig || { backgroundColor: theme.backgroundColor, overlays: [], shapes: [] }}
            onSave={handleSaveBackground}
            onClose={() => setShowBackgroundCreator(false)}
          />
        )}
      </AnimatePresence>

      {/* Button Creator Modal */}
      <AnimatePresence>
        {showButtonCreator && (
          <ButtonCreationModal 
            config={theme.buttonConfig || {
              borderRadius: 16,
              borderWidth: 0,
              borderColor: theme.buttonColor,
              backgroundColor: theme.buttonColor,
              textColor: '#ffffff',
              fontSize: 14,
              fontWeight: 900,
              paddingX: 24,
              paddingY: 12,
              shadow: 'lg',
              hoverScale: 1.05,
              activeScale: 0.95,
              animation: 'none',
              letterSpacing: 0,
              textTransform: 'uppercase',
              italic: true
            }}
            onSave={handleSaveButton}
            onClose={() => setShowButtonCreator(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

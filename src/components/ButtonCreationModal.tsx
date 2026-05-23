import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Save, MousePointer2, Type, Square, Maximize, Sparkles, Zap } from 'lucide-react';
import { ButtonConfig } from '../types';

interface ButtonCreationModalProps {
  config: ButtonConfig;
  onSave: (config: ButtonConfig) => void;
  onClose: () => void;
}

const SHADOWS = ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'inner'] as const;
const ANIMATIONS = ['none', 'pulse', 'shimmer', 'bounce', 'glow'] as const;
const TRANSFORMS = ['none', 'uppercase', 'lowercase', 'capitalize'] as const;

export const ButtonCreationModal: React.FC<ButtonCreationModalProps> = ({ config, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState<ButtonConfig>(config);
  const [activeTab, setActiveTab] = useState<'style' | 'text' | 'effects'>('style');

  const handleUpdate = (updates: Partial<ButtonConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
  };

  const getButtonStyles = () => {
    const {
      borderRadius,
      borderWidth,
      borderColor,
      backgroundColor,
      textColor,
      fontSize,
      fontWeight,
      paddingX,
      paddingY,
      shadow,
      letterSpacing,
      textTransform,
      italic
    } = localConfig;

    const shadowStyles: Record<string, string> = {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)'
    };

    return {
      borderRadius: `${borderRadius}px`,
      borderWidth: `${borderWidth}px`,
      borderColor,
      backgroundColor,
      color: textColor,
      fontSize: `${fontSize}px`,
      fontWeight,
      padding: `${paddingY}px ${paddingX}px`,
      boxShadow: shadowStyles[shadow],
      letterSpacing: `${letterSpacing}px`,
      textTransform,
      fontStyle: italic ? 'italic' : 'normal',
      borderStyle: 'solid'
    };
  };

  const getAnimationProps = () => {
    const { animation, hoverScale, activeScale } = localConfig;
    
    const props: any = {
      whileHover: { scale: hoverScale },
      whileTap: { scale: activeScale }
    };

    switch (animation) {
      case 'pulse':
        props.animate = { scale: [1, 1.05, 1] };
        props.transition = { duration: 2, repeat: Infinity, ease: "easeInOut" };
        break;
      case 'bounce':
        props.animate = { y: [0, -4, 0] };
        props.transition = { duration: 0.6, repeat: Infinity, ease: "easeInOut" };
        break;
      case 'glow':
        props.animate = { boxShadow: [`0 0 0px ${localConfig.backgroundColor}`, `0 0 20px ${localConfig.backgroundColor}`, `0 0 0px ${localConfig.backgroundColor}`] };
        props.transition = { duration: 2, repeat: Infinity, ease: "easeInOut" };
        break;
    }

    return props;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-950 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-4xl h-[95vh] sm:h-[85vh] flex flex-col overflow-hidden border-2 border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <MousePointer2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Button Creation</h2>
              <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1">Design your interactive elements</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => onSave(localConfig)}
              className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-indigo-600 text-white font-black uppercase text-[10px] sm:text-xs rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Save</span>
            </button>
            <button onClick={onClose} className="p-2 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden custom-scrollbar">
          {/* Main Preview Area - On mobile it's at the top */}
          <div className="w-full lg:flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 items-center justify-center p-6 sm:p-8 relative min-h-[300px] lg:min-h-0 lg:h-full lg:overflow-y-auto custom-scrollbar order-1 lg:order-2 border-b lg:border-b-0 border-slate-200 dark:border-slate-800">
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interactive Preview</span>
            </div>

            <div className="space-y-8 sm:space-y-12 text-center w-full max-w-md mx-auto">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Normal State</p>
                <div className="flex justify-center p-4">
                  <motion.button
                    style={getButtonStyles()}
                    {...getAnimationProps()}
                  >
                    Action Button
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">On Mobile</p>
                  <div className="mx-auto w-[160px] h-[280px] sm:w-[180px] sm:h-[320px] bg-white dark:bg-slate-950 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4">
                    <motion.button
                      style={{ ...getButtonStyles(), fontSize: `${Math.max(10, localConfig.fontSize * 0.8)}px`, padding: `${localConfig.paddingY * 0.7}px ${localConfig.paddingX * 0.7}px` }}
                      {...getAnimationProps()}
                    >
                      Mobile
                    </motion.button>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">On Tablet</p>
                  <div className="mx-auto w-[220px] h-[160px] sm:w-[240px] sm:h-[180px] bg-white dark:bg-slate-950 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4">
                    <motion.button
                      style={getButtonStyles()}
                      {...getAnimationProps()}
                    >
                      Tablet
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Controls */}
          <div className="w-full lg:w-80 lg:h-full border-r-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/30 lg:overflow-y-auto custom-scrollbar order-2 lg:order-1">
            <div className="p-4 flex gap-1 shrink-0 sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 border-b border-slate-100 dark:border-slate-800 lg:relative lg:bg-transparent lg:backdrop-blur-none lg:border-b-0">
              <button 
                onClick={() => setActiveTab('style')}
                className={`flex-1 px-3 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'style' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
              >
                <Square className="w-3 h-3" /> Style
              </button>
              <button 
                onClick={() => setActiveTab('text')}
                className={`flex-1 px-3 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'text' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
              >
                <Type className="w-3 h-3" /> Text
              </button>
              <button 
                onClick={() => setActiveTab('effects')}
                className={`flex-1 px-3 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'effects' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
              >
                <Sparkles className="w-3 h-3" /> Effects
              </button>
            </div>

            <div className="flex-1 p-4 space-y-6">
              {activeTab === 'style' && (
                <div className="space-y-6">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Colors</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Background</label>
                        <div className="flex gap-2">
                          <input type="color" value={localConfig.backgroundColor} onChange={(e) => handleUpdate({ backgroundColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer" />
                          <input type="text" value={localConfig.backgroundColor} onChange={(e) => handleUpdate({ backgroundColor: e.target.value })} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-xs font-mono" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Border</label>
                        <div className="flex gap-2">
                          <input type="color" value={localConfig.borderColor} onChange={(e) => handleUpdate({ borderColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer" />
                          <input type="text" value={localConfig.borderColor} onChange={(e) => handleUpdate({ borderColor: e.target.value })} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-xs font-mono" />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shape & Border</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Radius: {localConfig.borderRadius}px</label>
                        <input type="range" min="0" max="50" value={localConfig.borderRadius} onChange={(e) => handleUpdate({ borderRadius: parseInt(e.target.value) })} className="w-full accent-indigo-600" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Border Width: {localConfig.borderWidth}px</label>
                        <input type="range" min="0" max="10" value={localConfig.borderWidth} onChange={(e) => handleUpdate({ borderWidth: parseInt(e.target.value) })} className="w-full accent-indigo-600" />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Padding</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">X: {localConfig.paddingX}px</label>
                        <input type="range" min="8" max="64" value={localConfig.paddingX} onChange={(e) => handleUpdate({ paddingX: parseInt(e.target.value) })} className="w-full accent-indigo-600" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Y: {localConfig.paddingY}px</label>
                        <input type="range" min="4" max="32" value={localConfig.paddingY} onChange={(e) => handleUpdate({ paddingY: parseInt(e.target.value) })} className="w-full accent-indigo-600" />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'text' && (
                <div className="space-y-6">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Typography</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Text Color</label>
                        <div className="flex gap-2">
                          <input type="color" value={localConfig.textColor} onChange={(e) => handleUpdate({ textColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer" />
                          <input type="text" value={localConfig.textColor} onChange={(e) => handleUpdate({ textColor: e.target.value })} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-xs font-mono" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Size: {localConfig.fontSize}px</label>
                        <input type="range" min="8" max="32" value={localConfig.fontSize} onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) })} className="w-full accent-indigo-600" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Weight: {localConfig.fontWeight}</label>
                        <input type="range" min="100" max="900" step="100" value={localConfig.fontWeight} onChange={(e) => handleUpdate({ fontWeight: parseInt(e.target.value) })} className="w-full accent-indigo-600" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Letter Spacing: {localConfig.letterSpacing}px</label>
                        <input type="range" min="-2" max="10" step="0.5" value={localConfig.letterSpacing} onChange={(e) => handleUpdate({ letterSpacing: parseFloat(e.target.value) })} className="w-full accent-indigo-600" />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Formatting</h4>
                    <div className="flex flex-wrap gap-2">
                      {TRANSFORMS.map(t => (
                        <button
                          key={t}
                          onClick={() => handleUpdate({ textTransform: t })}
                          className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${localConfig.textTransform === t ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                        >
                          {t}
                        </button>
                      ))}
                      <button
                        onClick={() => handleUpdate({ italic: !localConfig.italic })}
                        className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${localConfig.italic ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                      >
                        Italic
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'effects' && (
                <div className="space-y-6">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shadow</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {SHADOWS.map(s => (
                        <button
                          key={s}
                          onClick={() => handleUpdate({ shadow: s })}
                          className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${localConfig.shadow === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Animation</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {ANIMATIONS.map(a => (
                        <button
                          key={a}
                          onClick={() => handleUpdate({ animation: a })}
                          className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${localConfig.animation === a ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interaction</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Hover Scale: {localConfig.hoverScale}x</label>
                        <input type="range" min="0.8" max="1.2" step="0.01" value={localConfig.hoverScale} onChange={(e) => handleUpdate({ hoverScale: parseFloat(e.target.value) })} className="w-full accent-indigo-600" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Active Scale: {localConfig.activeScale}x</label>
                        <input type="range" min="0.8" max="1.2" step="0.01" value={localConfig.activeScale} onChange={(e) => handleUpdate({ activeScale: parseFloat(e.target.value) })} className="w-full accent-indigo-600" />
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Zap, Type, Scaling, Square, Maximize, Eye, Box, Layers, Baseline, Sparkles, Wand2, Move } from 'lucide-react';
import { UICustomization, AppTheme } from '../types';
import { getArcaneStyles } from '../utils/arcaneThemes';
import { TrueBlackHoleHUD, TrueBlackHoleBackground } from './TrueBlackHoleEffects';
import { GeometricAuraHUD, GeometricAuraBlackHoleBackground } from './GeometricAuraBlackHoleEffects';

interface UICustomizationModalProps {
  uiCustomization: UICustomization;
  setUICustomization: (config: UICustomization) => void;
  onClose: () => void;
  theme: AppTheme;
  onUpdateTheme?: (t: Partial<AppTheme>) => void;
}

export const UICustomizationModal: React.FC<UICustomizationModalProps> = ({
  uiCustomization,
  setUICustomization,
  onClose,
  theme,
  onUpdateTheme
}) => {
  const [activeTabState, setActiveTab] = useState('general');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isArcane = theme.visualStyle === 'arcane' || theme.visualStyle === 'virus';

  const tabs = [
    { id: 'general', label: 'Layout & Perf', icon: <Scaling className="w-4 h-4" />, colorClass: 'bg-emerald-500 shadow-emerald-500/20 text-white', hoverText: 'hover:text-emerald-500', bgTint: 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50' },
    { id: 'typography', label: 'Typography', icon: <Type className="w-4 h-4" />, colorClass: 'bg-indigo-500 shadow-indigo-500/20 text-white', hoverText: 'hover:text-indigo-500', bgTint: 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/50' },
    { id: 'effects', label: 'Visual Effects', icon: <Eye className="w-4 h-4" />, colorClass: 'bg-rose-500 shadow-rose-500/20 text-white', hoverText: 'hover:text-rose-500', bgTint: 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/50' },
  ];

  const themeMagicThemes = ['arcane', 'ultimate', 'hollow-knight', 'liquid-glass', 'fluid', 'black-hole'];
  if (themeMagicThemes.includes(theme.visualStyle)) {
    tabs.push({ id: 'theme', label: 'Theme Magic', icon: <Wand2 className="w-4 h-4" />, colorClass: 'bg-amber-500 shadow-amber-500/20 text-white', hoverText: 'hover:text-amber-500', bgTint: 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/50' });
  }

  const activeTab = tabs.find(t => t.id === activeTabState) ? activeTabState : tabs[0].id;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  const arcane = isArcane 
    ? getArcaneStyles(theme.accentColor) 
    : { border: 'border-slate-100 dark:border-slate-800', glow: '', text: 'text-slate-800 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif', bg: 'bg-slate-50 dark:bg-slate-800/50', accent: 'bg-indigo-500', accentText: 'text-indigo-500', card: '', button: '', iconGlow: '' };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUICustomization({ ...uiCustomization, customFontUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFont = () => {
    setUICustomization({ ...uiCustomization, customFontUrl: null });
  };

  const puddleImageInputRef = useRef<HTMLInputElement>(null);
  const puddleVideoInputRef = useRef<HTMLInputElement>(null);

  const handlePuddleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUICustomization({ 
          ...uiCustomization, 
          puddleCustomBackground: result,
          puddleCustomBackgroundType: type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPuddleBackground = () => {
    setUICustomization({ 
      ...uiCustomization, 
      puddleCustomBackground: undefined,
      puddleCustomBackgroundType: undefined 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/60 backdrop-blur-md group-[.visual-fluid]/fluid:bg-black/60 group-[.visual-fluid]/fluid:backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`brutal-modal relative w-[calc(100%-1rem)] max-h-[calc(100dvh-1rem)] sm:w-[calc(100%-2rem)] sm:max-h-[calc(100dvh-2rem)] md:max-h-[90vh] max-w-7xl mx-auto flex flex-col sm:rounded-[2.5rem] rounded-2xl border-0 sm:border-2 transition-all duration-500 overflow-hidden ${isArcane ? `bg-slate-950 ${arcane.border} ${arcane.glow}` : 'bg-white dark:bg-slate-900 sm:border-slate-100 dark:sm:border-slate-800 border-transparent dark:border-transparent group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none'} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:!backdrop-blur-none group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none group-[.visual-fluid]/fluid:!backdrop-blur-none group-[.visual-fluid]/fluid:fluid-progress-panel`}
      >
        {/* Fixed Header */}
        <div className={`flex items-center justify-between p-6 pb-4 sm:border-b ${isArcane ? 'sm:border-slate-800' : 'sm:border-slate-100 dark:sm:border-slate-800'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!backdrop-blur-none group-[.visual-liquid-glass]/liquid-glass:!border-b group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!p-4 group-[.visual-fluid]/fluid:!-mx-8 group-[.visual-fluid]/fluid:!-mt-8 group-[.visual-fluid]/fluid:!border-b group-[.visual-fluid]/fluid:!border-white/10 group-[.visual-fluid]/fluid:!rounded-t-[2.5rem]`}>
          <h3 className={`text-lg sm:text-xl font-black uppercase tracking-widest transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-800 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`}>UI Settings</h3>
          <button onClick={onClose} className="p-2.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors no-hat group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!text-white">
            <X className={`w-6 h-6 sm:w-5 sm:h-5 ${isArcane ? arcane.text : 'text-slate-600 dark:text-slate-400'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`} />
          </button>
        </div>

        {/* Tab Navigation & Content Wrapper */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Sidebar Tabs */}
          <div className={`w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-2 p-4 sm:p-6 border-b md:border-b-0 md:border-r overflow-x-auto custom-scrollbar flex-nowrap ${isArcane ? 'border-slate-800' : 'border-slate-100 dark:border-slate-800'} group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-fluid]/fluid:!border-white/10`}>
            {tabs.map(tab => (
              <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all min-w-[max-content] md:min-w-0 ${
                   activeTab === tab.id 
                     ? (isArcane ? `${arcane.bg} ${arcane.text} ${arcane.border} border` : `${tab.colorClass} group-[.visual-liquid-glass]/liquid-glass:!bg-white/20 group-[.visual-fluid]/fluid:!bg-white/20`) 
                     : `text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 ${tab.hoverText} ${isArcane ? 'hover:'+arcane.bg : ''} group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/10 group-[.visual-fluid]/fluid:hover:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white/60 group-[.visual-fluid]/fluid:!text-white/60 group-[.visual-hollow-knight]/hollow-knight:hover:text-[var(--color-hk-text)]`
                 }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
            <AnimatePresence mode="popLayout">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, scale: 0.98, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 1.02, y: -10 }}
               transition={{ duration: 0.2 }}
               className="grid grid-cols-1 xl:grid-cols-2 gap-6 content-start"
             >
               {activeTab === 'general' && (
                 <>
            <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20`}>
            <div className="flex items-center gap-3">
              <Zap className={`w-5 h-5 ${isArcane ? arcane.text : 'text-emerald-500'} group-[.visual-liquid-glass]/liquid-glass:!text-emerald-300 group-[.visual-fluid]/fluid:!text-emerald-300`} />
              <div className="flex flex-col">
                <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`}>Performance Mode</span>
                <span className="text-[10px] text-slate-500 group-[.visual-liquid-glass]/liquid-glass:!text-white/50 group-[.visual-fluid]/fluid:!text-white/50">Reduces animations for weak devices</span>
              </div>
            </div>
            <button
              onClick={() => setUICustomization({ ...uiCustomization, performanceMode: !uiCustomization.performanceMode })}
              className={`p-0 w-12 h-6 rounded-full transition-all duration-300 relative cursor-pointer no-hat ${uiCustomization.performanceMode ? `${arcane.accent} shadow-lg ${isArcane ? arcane.glow : 'shadow-emerald-500/40'}` : 'bg-slate-200 dark:bg-slate-600'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!shadow-none group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/20`}
            >
              <motion.div
                animate={{ x: uiCustomization.performanceMode ? 26 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm bg-white group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-liquid-glass]/liquid-glass:!bg-white group-[.visual-fluid]/fluid:!bg-white"
              />
            </button>
          </div>

          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20`}>
            <div className="flex items-center gap-3">
              <Sparkles className={`w-5 h-5 ${isArcane ? arcane.text : 'text-amber-500'} group-[.visual-liquid-glass]/liquid-glass:!text-amber-300 group-[.visual-fluid]/fluid:!text-amber-300`} />
              <div className="flex flex-col">
                <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`}>Optimization Mode</span>
                <span className="text-[10px] text-slate-500 group-[.visual-liquid-glass]/liquid-glass:!text-white/50 group-[.visual-fluid]/fluid:!text-white/50">Maximum performance: removes blurs, shadows, and heavy effects but keeps animations</span>
              </div>
            </div>
            <button
              onClick={() => setUICustomization({ ...uiCustomization, optimizationMode: !uiCustomization.optimizationMode })}
              className={`p-0 w-12 h-6 rounded-full transition-all duration-300 relative cursor-pointer no-hat ${uiCustomization.optimizationMode ? `${arcane.accent} shadow-lg ${isArcane ? arcane.glow : 'shadow-amber-500/40'}` : 'bg-slate-200 dark:bg-slate-600'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!shadow-none group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/20`}
            >
              <motion.div
                animate={{ x: uiCustomization.optimizationMode ? 26 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm bg-white group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-liquid-glass]/liquid-glass:!bg-white group-[.visual-fluid]/fluid:!bg-white"
              />
            </button>
          </div>

                 </>
               )}
               {activeTab === 'effects' && (
                 <>
          <div className={`space-y-3 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Layers className={`w-5 h-5 ${isArcane ? arcane.text : 'text-blue-500'} group-[.visual-liquid-glass]/liquid-glass:!text-blue-300 group-[.visual-fluid]/fluid:!text-blue-300`} />
                <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`}>Dynamic Background</span>
              </div>
              <button
                onClick={() => setUICustomization({ ...uiCustomization, dynamicBackgroundEnabled: !uiCustomization.dynamicBackgroundEnabled })}
                className={`p-0 w-12 h-6 rounded-full transition-all duration-300 relative cursor-pointer no-hat ${uiCustomization.dynamicBackgroundEnabled ? `${arcane.accent} shadow-lg ${isArcane ? arcane.glow : 'shadow-blue-500/40'}` : 'bg-slate-200 dark:bg-slate-600'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!shadow-none group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/20`}
              >
                <motion.div
                  animate={{ x: uiCustomization.dynamicBackgroundEnabled ? 26 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm bg-white group-[.visual-liquid-glass]/liquid-glass:!bg-white group-[.visual-fluid]/fluid:!bg-white`}
                />
              </button>
            </div>
            {uiCustomization.dynamicBackgroundEnabled && (
              <div className="space-y-2">
                <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-tighter font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50 group-[.visual-fluid]/fluid:!text-white/50`}>
                  <span>Intensity</span>
                  <span>{(uiCustomization.dynamicBackgroundIntensity * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="1" step="0.05"
                  value={isNaN(uiCustomization.dynamicBackgroundIntensity) ? 1.0 : uiCustomization.dynamicBackgroundIntensity}
                  onChange={(e) => setUICustomization({ ...uiCustomization, dynamicBackgroundIntensity: parseFloat(e.target.value) })}
                  className={`w-full ${isArcane ? 'accent-current' : 'accent-blue-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white group-[.visual-fluid]/fluid:!accent-white`}
                />
              </div>
            )}
          </div>
                 </>
               )}
               {activeTab === 'general' && (
                 <>

          <div className={`space-y-3 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20`}>
            <div className="flex items-center gap-3 mb-2">
              <Scaling className={`w-5 h-5 ${isArcane ? arcane.text : 'text-indigo-500'} group-[.visual-liquid-glass]/liquid-glass:!text-indigo-300 group-[.visual-fluid]/fluid:!text-indigo-300`} />
              <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`}>UI Size Scale</span>
              <span className={`ml-auto text-xs font-mono px-2 py-1 rounded-md ${isArcane ? arcane.bg + ' ' + arcane.text : 'bg-slate-200 dark:bg-slate-700'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!text-white`}>{uiCustomization.uiSize.toFixed(2)}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" max="1.5" step="0.05"
              value={isNaN(uiCustomization.uiSize) ? 1.0 : uiCustomization.uiSize}
              onChange={(e) => setUICustomization({ ...uiCustomization, uiSize: parseFloat(e.target.value) })}
              className={`w-full ${isArcane ? 'accent-current' : 'accent-indigo-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white group-[.visual-fluid]/fluid:!accent-white`}
            />
          </div>

          <div className={`space-y-3 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20`}>
            <div className="flex items-center gap-3 mb-2">
              <Square className={`w-5 h-5 ${isArcane ? arcane.text : 'text-amber-500'} group-[.visual-liquid-glass]/liquid-glass:!text-amber-300 group-[.visual-fluid]/fluid:!text-amber-300`} />
              <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`}>Border Radius</span>
              <span className={`ml-auto text-xs font-mono px-2 py-1 rounded-md ${isArcane ? arcane.bg + ' ' + arcane.text : 'bg-slate-200 dark:bg-slate-700'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!text-white`}>{uiCustomization.borderRadius}px</span>
            </div>
            <input 
              type="range" 
              min="0" max="40" step="2"
              value={isNaN(uiCustomization.borderRadius) ? 16 : uiCustomization.borderRadius}
              onChange={(e) => setUICustomization({ ...uiCustomization, borderRadius: parseInt(e.target.value) })}
              className={`w-full ${isArcane ? 'accent-current' : 'accent-amber-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white group-[.visual-fluid]/fluid:!accent-white`}
            />
          </div>

          <div className={`space-y-3 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20`}>
            <div className="flex items-center gap-3 mb-2">
              <Maximize className={`w-5 h-5 ${isArcane ? arcane.text : 'text-rose-500'} group-[.visual-liquid-glass]/liquid-glass:!text-rose-300 group-[.visual-fluid]/fluid:!text-rose-300`} />
              <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`}>Spacing Scale</span>
              <span className={`ml-auto text-xs font-mono px-2 py-1 rounded-md ${isArcane ? arcane.bg + ' ' + arcane.text : 'bg-slate-200 dark:bg-slate-700'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!text-white`}>{uiCustomization.spacing.toFixed(2)}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" max="2" step="0.1"
              value={isNaN(uiCustomization.spacing) ? 1.0 : uiCustomization.spacing}
              onChange={(e) => setUICustomization({ ...uiCustomization, spacing: parseFloat(e.target.value) })}
              className={`w-full ${isArcane ? 'accent-current' : 'accent-rose-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white group-[.visual-fluid]/fluid:!accent-white`}
            />
          </div>

                 </>
               )}
               {activeTab === 'effects' && (
                 <>
          <div className={`space-y-3 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Eye className={`w-5 h-5 ${isArcane ? arcane.text : 'text-fuchsia-500'} group-[.visual-liquid-glass]/liquid-glass:!text-fuchsia-300 group-[.visual-fluid]/fluid:!text-fuchsia-300`} />
                <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`}>Glass Blur Effects</span>
              </div>
              <button
                onClick={() => setUICustomization({ ...uiCustomization, blurEnabled: !uiCustomization.blurEnabled })}
                className={`p-0 w-12 h-6 rounded-full transition-all duration-300 relative cursor-pointer group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/20 group-[.visual-fluid]/fluid:!shadow-none ${uiCustomization.blurEnabled ? `${arcane.accent} shadow-lg ${isArcane ? arcane.glow : 'shadow-fuchsia-500/40'}` : 'bg-slate-200 dark:bg-slate-600'}`}
              >
                <motion.div
                  animate={{ x: uiCustomization.blurEnabled ? 26 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm bg-white group-[.visual-liquid-glass]/liquid-glass:!bg-white group-[.visual-fluid]/fluid:!bg-white`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Box className={`w-5 h-5 ${isArcane ? arcane.text : 'text-violet-500'} group-[.visual-liquid-glass]/liquid-glass:!text-violet-300 group-[.visual-fluid]/fluid:!text-violet-300`} />
                <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`}>Drop Shadows</span>
              </div>
              <button
                onClick={() => setUICustomization({ ...uiCustomization, shadowsEnabled: !uiCustomization.shadowsEnabled })}
                className={`p-0 w-12 h-6 rounded-full transition-all duration-300 relative cursor-pointer group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/20 group-[.visual-fluid]/fluid:!shadow-none ${uiCustomization.shadowsEnabled ? `${arcane.accent} shadow-lg ${isArcane ? arcane.glow : 'shadow-violet-500/40'}` : 'bg-slate-200 dark:bg-slate-600'}`}
              >
                <motion.div
                  animate={{ x: uiCustomization.shadowsEnabled ? 26 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm bg-white group-[.visual-liquid-glass]/liquid-glass:!bg-white group-[.visual-fluid]/fluid:!bg-white`}
                />
              </button>
            </div>
          </div>

                 </>
               )}
               {activeTab === 'typography' && (
                 <>
          <div className={`space-y-4 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20`}>
            <div className="flex items-center gap-3 mb-2">
              <Baseline className={`w-5 h-5 ${isArcane ? arcane.text : 'text-cyan-500'} group-[.visual-liquid-glass]/liquid-glass:!text-cyan-300 group-[.visual-fluid]/fluid:!text-cyan-300`} />
              <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`}>Text Controls</span>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50 group-[.visual-fluid]/fluid:!text-white/50`}>
                  <span>Font Size</span>
                  <span>{uiCustomization.textFontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="12" max="24" step="1"
                  value={isNaN(uiCustomization.textFontSize) ? 16 : uiCustomization.textFontSize}
                  onChange={(e) => setUICustomization({ ...uiCustomization, textFontSize: parseInt(e.target.value) })}
                  className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white group-[.visual-fluid]/fluid:!accent-white`}
                />
              </div>

              <div className="space-y-1">
                <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50 group-[.visual-fluid]/fluid:!text-white/50`}>
                  <span>Font Weight</span>
                  <span>{uiCustomization.textFontWeight}</span>
                </div>
                <input 
                  type="range" 
                  min="100" max="900" step="100"
                  value={isNaN(uiCustomization.textFontWeight) ? 400 : uiCustomization.textFontWeight}
                  onChange={(e) => setUICustomization({ ...uiCustomization, textFontWeight: parseInt(e.target.value) })}
                  className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white group-[.visual-fluid]/fluid:!accent-white`}
                />
              </div>

              <div className="space-y-1">
                <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50 group-[.visual-fluid]/fluid:!text-white/50`}>
                  <span>Letter Spacing</span>
                  <span>{uiCustomization.textLetterSpacing}px</span>
                </div>
                <input 
                  type="range" 
                  min="-2" max="10" step="0.5"
                  value={isNaN(uiCustomization.textLetterSpacing) ? 0 : uiCustomization.textLetterSpacing}
                  onChange={(e) => setUICustomization({ ...uiCustomization, textLetterSpacing: parseFloat(e.target.value) })}
                  className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white group-[.visual-fluid]/fluid:!accent-white`}
                />
              </div>

              <div className="space-y-1">
                <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50 group-[.visual-fluid]/fluid:!text-white/50`}>
                  <span>Line Height</span>
                  <span>{uiCustomization.textLineHeight}x</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="2.5" step="0.1"
                  value={isNaN(uiCustomization.textLineHeight) ? 1.5 : uiCustomization.textLineHeight}
                  onChange={(e) => setUICustomization({ ...uiCustomization, textLineHeight: parseFloat(e.target.value) })}
                  className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white group-[.visual-fluid]/fluid:!accent-white`}
                />
              </div>
            </div>
          </div>

          <div className={`space-y-4 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Type className={`w-5 h-5 ${isArcane ? arcane.text : 'text-purple-500'} group-[.visual-liquid-glass]/liquid-glass:!text-purple-300 group-[.visual-fluid]/fluid:!text-purple-300`} />
                <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`}>Text Animations</span>
              </div>
              <button
                onClick={() => onUpdateTheme?.({ textAnimationEnabled: !theme.textAnimationEnabled })}
                className={`p-0 w-12 h-6 rounded-full transition-all duration-300 relative cursor-pointer group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/20 group-[.visual-fluid]/fluid:!shadow-none ${theme.textAnimationEnabled ? `${arcane.accent} shadow-lg ${isArcane ? arcane.glow : 'shadow-purple-500/40'}` : 'bg-slate-200 dark:bg-slate-600'}`}
              >
                <motion.div
                  animate={{ x: theme.textAnimationEnabled ? 26 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm bg-white group-[.visual-liquid-glass]/liquid-glass:!bg-white group-[.visual-fluid]/fluid:!bg-white`}
                />
              </button>
            </div>
            
            {theme.textAnimationEnabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {(['typewriter', 'scramble', 'fade-up', 'blur-in', 'glitch', 'reveal', 'bounce', 'wave', 'flip', 'shimmer', 'pop', 'elastic'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => onUpdateTheme?.({ textAnimationType: type })}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${theme.textAnimationType === type ? (isArcane ? `${arcane.bg} ${arcane.border} border ${arcane.text}` : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]') : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-transparent'} group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!text-white/60 group-[.visual-liquid-glass]/liquid-glass:[&.bg-purple-100]:!bg-white/20 group-[.visual-liquid-glass]/liquid-glass:[&.bg-purple-100]:!text-white group-[.visual-liquid-glass]/liquid-glass:[&.bg-purple-100]:!border-white/30 group-[.visual-fluid]/fluid:!border-white/20 group-[.visual-fluid]/fluid:!text-white/60 group-[.visual-fluid]/fluid:[&.bg-purple-100]:!bg-white/20 group-[.visual-fluid]/fluid:[&.bg-purple-100]:!text-white group-[.visual-fluid]/fluid:[&.bg-purple-100]:!border-white/30`}
                    >
                      {type.replace('-', ' ')}
                    </button>
                  ))}
                </div>

                <div className={`space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-fluid]/fluid:!border-white/10`}>
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50 group-[.visual-fluid]/fluid:!text-white/50`}>
                    <span>Animation Speed</span>
                    <span>{theme.textAnimationSpeed?.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.2" max="3.0" step="0.1"
                    value={theme.textAnimationSpeed || 1.0}
                    onChange={(e) => onUpdateTheme?.({ textAnimationSpeed: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-purple-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white group-[.visual-fluid]/fluid:!accent-white`}
                  />
                  <div className={`flex justify-between text-[8px] text-slate-400 uppercase font-medium group-[.visual-liquid-glass]/liquid-glass:!text-white/30 group-[.visual-fluid]/fluid:!text-white/30`}>
                    <span>Slower</span>
                    <span>Faster</span>
                  </div>
                </div>
              </div>
            )}
          </div>
                 </>
               )}
               {activeTab === 'theme' && (
                 <>

          {(theme.visualStyle === 'arcane' || theme.visualStyle === 'ultimate' || theme.visualStyle === 'hollow-knight') && (
            <div className={`space-y-4 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Sparkles className={`w-5 h-5 ${isArcane ? arcane.text : 'text-yellow-500'}`} />
                  <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'}`}>Particle Settings</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Reduce Lag</span>
                  <button
                    onClick={() => setUICustomization({ ...uiCustomization, particleReduceLag: !uiCustomization.particleReduceLag })}
                    className={`p-0 w-12 h-6 rounded-full transition-all duration-300 relative cursor-pointer ${uiCustomization.particleReduceLag ? `${arcane.accent} shadow-lg ${isArcane ? arcane.glow : 'shadow-yellow-500/40'}` : 'bg-slate-200 dark:bg-slate-600'}`}
                    title="Reduce Particle Lag"
                  >
                    <motion.div
                      animate={{ x: uiCustomization.particleReduceLag ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Max Connections</span>
                    <span>{uiCustomization.particleMaxConnections ?? 3}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="10" step="1"
                    value={isNaN(uiCustomization.particleMaxConnections ?? 3) ? 3 : (uiCustomization.particleMaxConnections ?? 3)}
                    onChange={(e) => setUICustomization({ ...uiCustomization, particleMaxConnections: parseInt(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-yellow-500'} ${isArcane ? arcane.text : ''}`}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Connection Distance</span>
                    <span>{uiCustomization.particleConnectionDistance ?? 150}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" max="300" step="10"
                    value={isNaN(uiCustomization.particleConnectionDistance ?? 150) ? 150 : (uiCustomization.particleConnectionDistance ?? 150)}
                    onChange={(e) => setUICustomization({ ...uiCustomization, particleConnectionDistance: parseInt(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-yellow-500'} ${isArcane ? arcane.text : ''}`}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Max Size</span>
                    <span>{uiCustomization.particleMaxSize ?? 4}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="10" step="0.5"
                    value={isNaN(uiCustomization.particleMaxSize ?? 4) ? 4 : (uiCustomization.particleMaxSize ?? 4)}
                    onChange={(e) => setUICustomization({ ...uiCustomization, particleMaxSize: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-yellow-500'} ${isArcane ? arcane.text : ''}`}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Particle Count</span>
                    <span>{uiCustomization.particleCount ?? 50}</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" max="200" step="5"
                    value={isNaN(uiCustomization.particleCount ?? 50) ? 50 : (uiCustomization.particleCount ?? 50)}
                    onChange={(e) => setUICustomization({ ...uiCustomization, particleCount: parseInt(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-yellow-500'} ${isArcane ? arcane.text : ''}`}
                  />
                </div>
              </div>
            </div>
          )}

          {theme.visualStyle === 'liquid-glass' && (
            <div className={`space-y-4 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20`}>
              <div className="flex items-center gap-3 mb-2">
                <Layers className={`w-5 h-5 ${isArcane ? arcane.text : 'text-cyan-500'} group-[.visual-liquid-glass]/liquid-glass:!text-cyan-300`} />
                <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white`}>Liquid Glass Settings</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Glass Shape Layer</span>
                  </div>
                  <select 
                    value={uiCustomization.liquidGlassShape || 'convex_squircle'}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassShape: e.target.value as any })}
                    className={`w-full bg-transparent border rounded-md text-sm p-1 ${isArcane ? arcane.border + ' ' + arcane.text : 'border-slate-300 dark:border-slate-600'} group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!text-white`}
                  >
                    <option value="convex_squircle" className="text-black">Convex Squircle</option>
                    <option value="convex_circle" className="text-black">Convex Circle</option>
                    <option value="concave" className="text-black">Concave</option>
                    <option value="lip" className="text-black">Lip</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Glass Thickness</span>
                    <span>{uiCustomization.liquidGlassThickness ?? 50}</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" max="200" step="1"
                    value={uiCustomization.liquidGlassThickness ?? 50}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassThickness: parseInt(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Bezel Width</span>
                    <span>{uiCustomization.liquidGlassBezel ?? 60}</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" max="60" step="1"
                    value={uiCustomization.liquidGlassBezel ?? 60}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassBezel: parseInt(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Refractive Index</span>
                    <span>{(uiCustomization.liquidGlassIOR ?? 3.0).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1.0" max="3.0" step="0.05"
                    value={uiCustomization.liquidGlassIOR ?? 3.0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassIOR: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Blur Amount</span>
                    <span>{(uiCustomization.liquidGlassBlur ?? 1.5).toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="12" step="0.5"
                    value={uiCustomization.liquidGlassBlur ?? 1.5}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassBlur: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Specular</span>
                    <span>{(uiCustomization.liquidGlassSpecular ?? 0.55).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={uiCustomization.liquidGlassSpecular ?? 0.55}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassSpecular: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Tint %</span>
                    <span>{uiCustomization.liquidGlassTint ?? 8}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="40" step="1"
                    value={uiCustomization.liquidGlassTint ?? 8}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassTint: parseInt(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Tint Color</span>
                  </div>
                  <input 
                    type="color" 
                    value={uiCustomization.liquidGlassTintColor || '#ffffff'}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassTintColor: e.target.value })}
                    className={`w-full h-8 rounded-md cursor-pointer border-none p-0`}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Shadow Opacity</span>
                    <span>{(uiCustomization.liquidGlassShadow ?? 0).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={uiCustomization.liquidGlassShadow ?? 0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassShadow: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Shadow Color</span>
                  </div>
                  <input 
                    type="color" 
                    value={uiCustomization.liquidGlassShadowColor || '#000000'}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassShadowColor: e.target.value })}
                    className={`w-full h-8 rounded-md cursor-pointer border-none p-0`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Inner Shadow Spread</span>
                    <span>{(uiCustomization.liquidGlassInnerShadowSpread ?? 0.6).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" max="2.0" step="0.1"
                    value={uiCustomization.liquidGlassInnerShadowSpread ?? 0.6}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassInnerShadowSpread: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Outer Shadow Blur</span>
                    <span>{(uiCustomization.liquidGlassOuterShadowBlur ?? 24).toFixed(0)}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="60" step="1"
                    value={uiCustomization.liquidGlassOuterShadowBlur ?? 24}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassOuterShadowBlur: parseInt(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Chromatic Aberration</span>
                    <span>{(uiCustomization.liquidGlassChromatic ?? 0).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={uiCustomization.liquidGlassChromatic ?? 0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassChromatic: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Frosted Noise (Grain)</span>
                    <span>{(uiCustomization.liquidGlassNoise ?? 0).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="0.5" step="0.01"
                    value={uiCustomization.liquidGlassNoise ?? 0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassNoise: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Edge Glow (Specular)</span>
                    <span>{(uiCustomization.liquidGlassEdgeGlow ?? 0.3).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={uiCustomization.liquidGlassEdgeGlow ?? 0.3}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassEdgeGlow: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Backdrop Saturation</span>
                    <span>{(uiCustomization.liquidGlassSaturation ?? 2.5).toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="5" step="0.1"
                    value={uiCustomization.liquidGlassSaturation ?? 2.5}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassSaturation: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Scale Ratio</span>
                    <span>{(uiCustomization.liquidGlassScaleRatio ?? 1.0).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="2.0" step="0.05"
                    value={uiCustomization.liquidGlassScaleRatio ?? 1.0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassScaleRatio: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Iridescence Amount</span>
                    <span>{(uiCustomization.liquidGlassIridescence ?? 0.08).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="1.0" step="0.01"
                    value={uiCustomization.liquidGlassIridescence ?? 0.08}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassIridescence: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Iridescence Speed</span>
                    <span>{(uiCustomization.liquidGlassIridescenceSpeed ?? 0.5).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" max="2.0" step="0.1"
                    value={uiCustomization.liquidGlassIridescenceSpeed ?? 0.5}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassIridescenceSpeed: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Light Direction X</span>
                    <span>{(uiCustomization.liquidGlassLightDirX ?? 0.5).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="-1" max="1" step="0.1"
                    value={uiCustomization.liquidGlassLightDirX ?? 0.5}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassLightDirX: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                    <span>Light Direction Y</span>
                    <span>{(uiCustomization.liquidGlassLightDirY ?? -0.7).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="-1" max="1" step="0.1"
                    value={uiCustomization.liquidGlassLightDirY ?? -0.7}
                    onChange={(e) => setUICustomization({ ...uiCustomization, liquidGlassLightDirY: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-cyan-500'} ${isArcane ? arcane.text : ''} group-[.visual-liquid-glass]/liquid-glass:!accent-white`}
                  />
                </div>
              </div>
            </div>
          )}

          {theme.visualStyle === 'fluid' && (
            <div className={`space-y-4 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? (arcane.bg + ' ' + arcane.border) : (currentTab.bgTint + ' group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none')} group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20`}>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className={`w-5 h-5 ${isArcane ? arcane.text : 'text-indigo-500'} group-[.visual-fluid]/fluid:!text-indigo-300`} />
                <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-fluid]/fluid:!text-white`}>Fluid Theme Settings</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-fluid]/fluid:!text-white/50`}>
                    <span>Border Thickness</span>
                    <span>{uiCustomization.fluidBorderThickness ?? 2}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="20" step="1"
                    value={uiCustomization.fluidBorderThickness ?? 2}
                    onChange={(e) => setUICustomization({ ...uiCustomization, fluidBorderThickness: parseInt(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-indigo-500'} ${isArcane ? arcane.text : ''} group-[.visual-fluid]/fluid:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-fluid]/fluid:!text-white/50`}>
                    <span>Animation Speed</span>
                    <span>{(uiCustomization.fluidAnimationSpeed ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" max="5.0" step="0.1"
                    value={uiCustomization.fluidAnimationSpeed ?? 1.0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, fluidAnimationSpeed: parseFloat(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-indigo-500'} ${isArcane ? arcane.text : ''} group-[.visual-fluid]/fluid:!accent-white`}
                  />
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-fluid]/fluid:!text-white/50`}>
                    <span>Blob Count</span>
                    <span>{uiCustomization.fluidBlobCount ?? 3}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="10" step="1"
                    value={uiCustomization.fluidBlobCount ?? 3}
                    onChange={(e) => setUICustomization({ ...uiCustomization, fluidBlobCount: parseInt(e.target.value) })}
                    className={`w-full ${isArcane ? 'accent-current' : 'accent-indigo-500'} ${isArcane ? arcane.text : ''} group-[.visual-fluid]/fluid:!accent-white`}
                  />
                </div>
              </div>
            </div>
          )}

          {theme.visualStyle === 'black-hole' && theme.accentColor !== 'space-black-hole-orange' && theme.accentColor !== 'neural-black-hole' && theme.accentColor !== 'puddle-black-hole' && theme.accentColor !== 'bubbles-blackhole' && theme.accentColor !== 'emissive-black-hole' && theme.accentColor !== 'geometric-aura-black-hole' && (
            <div className={`space-y-4 p-4 rounded-2xl border transition-all duration-500 bg-black/40 border-white/10`}>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className={`w-5 h-5 text-indigo-400`} />
                <span className={`text-sm font-bold text-white`}>Event Horizon Settings</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className={`flex items-center justify-between text-[10px] text-white/50 uppercase font-bold`}>
                    <span>Animation Shape</span>
                    <span className="capitalize">{theme.blackHoleSettings?.shape || 'infinity'}</span>
                  </div>
                  <select 
                    value={theme.blackHoleSettings?.shape || 'infinity'}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#ffffff', '#000000', '#222222', '#111111', '#555555'],
                          colorChangeOnClick: true,
                          shape: 'infinity',
                          interactWithCursor: true
                        }), 
                        shape: e.target.value as any 
                      } 
                    })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2 text-sm focus:outline-none focus:border-white/30"
                  >
                    <option value="infinity">Infinity</option>
                    <option value="circle">Circle</option>
                    <option value="flower">Flower</option>
                    <option value="chaos">Chaos</option>
                    <option value="spiral">Spiral</option>
                    <option value="orbit">Orbit</option>
                    <option value="wave">Wave</option>
                    <option value="cyclone">Cyclone</option>
                    <option value="hypnotic">Hypnotic</option>
                    <option value="pulsar">Pulsar</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Color Change on Click</span>
                    <span className="text-[10px] text-white/50">Randomises colors when clicked</span>
                  </div>
                  <button
                    onClick={() => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#ffffff', '#000000', '#222222', '#111111', '#555555'],
                          colorChangeOnClick: true,
                          shape: 'infinity',
                          interactWithCursor: true
                        }), 
                        colorChangeOnClick: !(theme.blackHoleSettings?.colorChangeOnClick ?? true)
                      } 
                    })}
                    className={`p-0 w-12 h-6 rounded-full transition-all duration-300 relative cursor-pointer border border-white/20 shadow-none ${(theme.blackHoleSettings?.colorChangeOnClick ?? true) ? 'bg-indigo-500 border-indigo-400' : 'bg-white/10'}`}
                  >
                    <motion.div
                      animate={{ x: (theme.blackHoleSettings?.colorChangeOnClick ?? true) ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm bg-white"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Cursor Interaction</span>
                    <span className="text-[10px] text-white/50">Follows cursor movement if supported</span>
                  </div>
                  <button
                    onClick={() => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#ffffff', '#000000', '#222222', '#111111', '#555555'],
                          colorChangeOnClick: true,
                          shape: 'infinity',
                          interactWithCursor: true
                        }), 
                        interactWithCursor: !(theme.blackHoleSettings?.interactWithCursor ?? true)
                      } 
                    })}
                    className={`p-0 w-12 h-6 rounded-full transition-all duration-300 relative cursor-pointer border border-white/20 shadow-none ${(theme.blackHoleSettings?.interactWithCursor ?? true) ? 'bg-indigo-500 border-indigo-400' : 'bg-white/10'}`}
                  >
                    <motion.div
                      animate={{ x: (theme.blackHoleSettings?.interactWithCursor ?? true) ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm bg-white"
                    />
                  </button>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-white/50 uppercase font-bold">
                    <span>Number of Strands</span>
                    <span>{theme.blackHoleSettings?.strandCount ?? 16}</span>
                  </div>
                  <input
                    type="range"
                    min="5" max="64" step="1"
                    value={theme.blackHoleSettings?.strandCount ?? 16}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#ffffff', '#000000', '#222222', '#111111', '#555555'],
                          colorChangeOnClick: true,
                          shape: 'infinity',
                          interactWithCursor: true
                        }), 
                        strandCount: parseInt(e.target.value) 
                      } 
                    })}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>Less</span>
                    <span>More</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-white/50 uppercase font-bold">
                    <span>Duration Before Disappearing (Trail Length)</span>
                    <span>{theme.blackHoleSettings?.strandLength ?? 128}</span>
                  </div>
                  <input
                    type="range"
                    min="16" max="1024" step="16"
                    value={theme.blackHoleSettings?.strandLength ?? 128}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...theme.blackHoleSettings!, 
                        strandLength: parseInt(e.target.value) 
                      } 
                    })}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>Fast Disappear</span>
                    <span>Slow Disappear</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-white/50 uppercase font-bold">
                    <span>Animation Pace (Speed)</span>
                    <span>{theme.blackHoleSettings?.animationSpeed ?? 1.0}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1" max="5.0" step="0.1"
                    value={theme.blackHoleSettings?.animationSpeed ?? 1.0}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...theme.blackHoleSettings!, 
                        animationSpeed: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-white/50 uppercase font-bold">
                    <span>Custom Colors</span>
                    <span>{(theme.blackHoleSettings?.colors?.length || 5)} Total</span>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    {(theme.blackHoleSettings?.colors || ['#ffffff', '#000000', '#222222', '#111111', '#555555']).map((color, index) => (
                        <div key={index} className="relative group">
                          <input
                            title={`Color ${index + 1}`}
                            type="color"
                            value={color || '#ffffff'}
                            onChange={(e) => {
                              const currentColors = theme.blackHoleSettings?.colors || ['#ffffff', '#000000', '#222222', '#111111', '#555555'];
                              let newColors = [...currentColors];
                              newColors[index] = e.target.value;
                              onUpdateTheme?.({ 
                                blackHoleSettings: { 
                                  ...theme.blackHoleSettings!, 
                                  colors: newColors
                                } 
                              });
                            }}
                            className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer bg-transparent overflow-hidden"
                            style={{ clipPath: 'circle(40%)' }}
                          />
                          {(theme.blackHoleSettings?.colors?.length || 5) > 1 && (
                            <button
                              onClick={() => {
                                const currentColors = theme.blackHoleSettings?.colors || ['#ffffff', '#000000', '#222222', '#111111', '#555555'];
                                const newColors = currentColors.filter((_, i) => i !== index);
                                onUpdateTheme?.({
                                  blackHoleSettings: {
                                    ...theme.blackHoleSettings!,
                                    colors: newColors
                                  }
                                });
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="text-white text-[10px] font-bold leading-none">&times;</span>
                            </button>
                          )}
                        </div>
                    ))}
                    {(theme.blackHoleSettings?.colors?.length || 5) < 64 && (
                      <button
                        onClick={() => {
                          const currentColors = theme.blackHoleSettings?.colors || ['#ffffff', '#000000', '#222222', '#111111', '#555555'];
                          onUpdateTheme?.({
                            blackHoleSettings: {
                              ...theme.blackHoleSettings!, 
                              colors: [...currentColors, '#ffffff']
                            }
                          });
                        }}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <span className="text-white font-bold leading-none">+</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {theme.visualStyle === 'black-hole' && theme.accentColor === 'space-black-hole-orange' && (
            <>
              <div className={`space-y-4 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20`}>
                <div className="flex items-center gap-3 mb-2">
                  <Layers className={`w-5 h-5 ${isArcane ? arcane.text : 'text-orange-500'} group-[.visual-liquid-glass]/liquid-glass:!text-orange-300`} />
                  <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white`}>Accretion Disk Settings</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                      <span>Disk Color</span>
                      <span>{uiCustomization.spaceBlackHoleColor || '#ff5500'}</span>
                    </div>
                    <input 
                      type="color" 
                      value={uiCustomization.spaceBlackHoleColor || '#ff5500'}
                      onChange={(e) => setUICustomization({ ...uiCustomization, spaceBlackHoleColor: e.target.value })}
                      className={`w-full h-8 rounded-md cursor-pointer border-none p-0`}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                      <span>Lensing Strength</span>
                      <span>{(uiCustomization.spaceBlackHoleLensing ?? 0.12).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0" max="0.5" step="0.01"
                      value={uiCustomization.spaceBlackHoleLensing ?? 0.12}
                      onChange={(e) => setUICustomization({ ...uiCustomization, spaceBlackHoleLensing: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-orange-500 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                      <span>Disk Rotation Speed</span>
                      <span>{(uiCustomization.spaceBlackHoleDiskSpeed ?? 0.22).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0" max="1.0" step="0.01"
                      value={uiCustomization.spaceBlackHoleDiskSpeed ?? 0.22}
                      onChange={(e) => setUICustomization({ ...uiCustomization, spaceBlackHoleDiskSpeed: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-orange-500 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className={`flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
                      <span>Noise Complexity</span>
                      <span>{(uiCustomization.spaceBlackHoleNoiseScale ?? 2.5).toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5" max="10.0" step="0.1"
                      value={uiCustomization.spaceBlackHoleNoiseScale ?? 2.5}
                      onChange={(e) => setUICustomization({ ...uiCustomization, spaceBlackHoleNoiseScale: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-orange-500 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10"
                    />
                  </div>
                </div>
              </div>

              {/* Holographic 3D HUD Controller & Live Interactive Preview Column */}
              <div className="space-y-4 p-4 rounded-2xl border bg-black/40 border-orange-500/20 shadow-[0_0_20px_rgba(234,88,12,0.05)] transition-all duration-500 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-1 bg-gradient-to-r from-orange-500/10 to-transparent p-2 rounded-lg border-l-2 border-orange-500">
                  <Move className="w-5 h-5 text-orange-500 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-white tracking-widest uppercase">Holographic 3D HUD</span>
                    <span className="text-[9px] text-orange-400 font-bold tracking-wide">SPACETIME MANIPULATION GRID</span>
                  </div>
                </div>

                <TrueBlackHoleHUD customization={uiCustomization} setUICustomization={setUICustomization} />

                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                      Live Spacetime Warp Preview
                    </span>
                    <span className="text-[8px] text-orange-500/80 font-mono animate-pulse">● INTERACTIVE</span>
                  </div>
                  <TrueBlackHoleBackground theme={theme} customization={uiCustomization} isMini={true} />
                </div>
              </div>
            </>
          )}

          {theme.visualStyle === 'black-hole' && theme.accentColor === 'neural-black-hole' && (
            <div className={`space-y-4 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint}`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20`}>
              <div className="flex items-center gap-3 mb-2">
                <Layers className={`w-5 h-5 ${isArcane ? arcane.text : 'text-cyan-500'}`} />
                <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200'}`}>Neural Synapse Settings</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Base Core Color</span>
                    <span>{uiCustomization.neuralBaseColor || '#00ffc8'}</span>
                  </div>
                  <input 
                    type="color" 
                    value={uiCustomization.neuralBaseColor || '#00ffc8'}
                    onChange={(e) => setUICustomization({ ...uiCustomization, neuralBaseColor: e.target.value })}
                    className="w-full h-8 rounded-md cursor-pointer border-none p-0"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Accent Shape</span>
                    <span className="capitalize">{uiCustomization.neuralShape || 'neuron'}</span>
                  </div>
                  <div className="flex gap-2">
                    {(['neuron', 'tree', 'spiral'] as const).map((shape) => (
                      <button
                        key={shape}
                        onClick={() => setUICustomization({ ...uiCustomization, neuralShape: shape })}
                        className={`flex-1 py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${
                          (uiCustomization.neuralShape || 'neuron') === shape
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                            : 'bg-slate-200 dark:bg-slate-700/50 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {shape.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Shape Size</span>
                    <span>{(uiCustomization.neuralScale ?? 1.0).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2" max="3.0" step="0.1"
                    value={uiCustomization.neuralScale ?? 1.0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, neuralScale: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Pulse Speed (Rate of Signal)</span>
                    <span>{(uiCustomization.neuralPulseSpeed ?? 1.0).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1" max="5.0" step="0.1"
                    value={uiCustomization.neuralPulseSpeed ?? 1.0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, neuralPulseSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Branch Density</span>
                    <span>{uiCustomization.neuralDensity ?? 18}</span>
                  </div>
                  <input
                    type="range"
                    min="5" max="50" step="1"
                    value={uiCustomization.neuralDensity ?? 18}
                    onChange={(e) => setUICustomization({ ...uiCustomization, neuralDensity: parseInt(e.target.value, 10) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Camera Auto-Rotate Speed</span>
                    <span>{(uiCustomization.neuralCameraSpeed ?? 0.7).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0" max="5.0" step="0.1"
                    value={uiCustomization.neuralCameraSpeed ?? 0.7}
                    onChange={(e) => setUICustomization({ ...uiCustomization, neuralCameraSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Glow Strength (Bloom)</span>
                    <span>{(uiCustomization.neuralGlowStrength ?? 1.5).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0" max="5.0" step="0.1"
                    value={uiCustomization.neuralGlowStrength ?? 1.5}
                    onChange={(e) => setUICustomization({ ...uiCustomization, neuralGlowStrength: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Synapse Pulse Glow</span>
                    <span>{(uiCustomization.neuralPulseGlow ?? 3.0).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0" max="10.0" step="0.1"
                    value={uiCustomization.neuralPulseGlow ?? 3.0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, neuralPulseGlow: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Rainbow Mode</span>
                    <button
                      onClick={() => setUICustomization({ ...uiCustomization, neuralRainbowMode: (uiCustomization.neuralRainbowMode ?? 1.0) > 0.5 ? 0.0 : 1.0 })}
                      className={`w-8 h-4 rounded-full transition-colors duration-300 relative ${ (uiCustomization.neuralRainbowMode ?? 1.0) > 0.5 ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600' }`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${ (uiCustomization.neuralRainbowMode ?? 1.0) > 0.5 ? 'translate-x-4.5' : 'translate-x-0.5' }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {theme.visualStyle === 'black-hole' && theme.accentColor === 'puddle-black-hole' && (
            <div className={`space-y-4 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint}`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20`}>
              <div className="flex items-center gap-3 mb-2">
                <Layers className={`w-5 h-5 ${isArcane ? arcane.text : 'text-cyan-500'}`} />
                <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200'}`}>Puddle Settings</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Speed</span>
                    <span>{(uiCustomization.puddleSpeed ?? 3.0).toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="10" step="0.1"
                    value={uiCustomization.puddleSpeed ?? 3.0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, puddleSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Power</span>
                    <span>{(uiCustomization.puddlePower ?? 4.0).toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="20" step="0.1"
                    value={uiCustomization.puddlePower ?? 4.0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, puddlePower: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Damping</span>
                    <span>{(uiCustomization.puddleDamping ?? 0.80).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5" max="0.999" step="0.001"
                    value={uiCustomization.puddleDamping ?? 0.80}
                    onChange={(e) => setUICustomization({ ...uiCustomization, puddleDamping: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Hardness</span>
                    <span>{(uiCustomization.puddleHardness ?? 0.25).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="1" step="0.01"
                    value={uiCustomization.puddleHardness ?? 0.25}
                    onChange={(e) => setUICustomization({ ...uiCustomization, puddleHardness: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Size</span>
                    <span>{(uiCustomization.puddleSize ?? 0.03).toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="0.2" step="0.001"
                    value={uiCustomization.puddleSize ?? 0.03}
                    onChange={(e) => setUICustomization({ ...uiCustomization, puddleSize: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Auto-Raindrops</span>
                    <button
                      type="button"
                      onClick={() => setUICustomization({ ...uiCustomization, puddleRaindrops: !(uiCustomization.puddleRaindrops ?? false) })}
                      className={`p-0 w-10 h-5 rounded-full transition-all duration-300 relative cursor-pointer border border-white/20 shadow-none ${(uiCustomization.puddleRaindrops ?? false) ? 'bg-cyan-500 border-cyan-400' : 'bg-white/10'}`}
                    >
                      <motion.div
                        className="w-4 h-4 bg-white rounded-full mx-0.5 shadow-sm absolute top-0.5"
                        initial={false}
                        animate={{ x: (uiCustomization.puddleRaindrops ?? false) ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </div>

                {(uiCustomization.puddleRaindrops ?? false) && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                      <span>Rain Frequency</span>
                      <span>{(uiCustomization.puddleRaindropsIntensity ?? 0.5).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="1" step="0.05"
                      value={uiCustomization.puddleRaindropsIntensity ?? 0.5}
                      onChange={(e) => setUICustomization({ ...uiCustomization, puddleRaindropsIntensity: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Lighting Specular</span>
                    <span>{(uiCustomization.puddleSpecular ?? 0.5).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="2" step="0.05"
                    value={uiCustomization.puddleSpecular ?? 0.5}
                    onChange={(e) => setUICustomization({ ...uiCustomization, puddleSpecular: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Refraction Distortion</span>
                    <span>{(uiCustomization.puddleRefraction ?? 1.0).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="5" step="0.1"
                    value={uiCustomization.puddleRefraction ?? 1.0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, puddleRefraction: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Custom Background</span>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={puddleImageInputRef}
                      onChange={(e) => handlePuddleUpload(e, 'image')}
                      className="hidden"
                    />
                    <input 
                      type="file" 
                      accept="video/*" 
                      ref={puddleVideoInputRef}
                      onChange={(e) => handlePuddleUpload(e, 'video')}
                      className="hidden"
                    />
                    <button 
                      onClick={() => puddleImageInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900/40 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      Image
                    </button>
                    <button 
                      onClick={() => puddleVideoInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 text-[10px] font-bold text-blue-700 dark:text-blue-300 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      Video
                    </button>
                  </div>
                  {uiCustomization.puddleCustomBackground && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-200 dark:bg-slate-800/80 mt-2">
                       <span className="text-[9px] font-mono truncate max-w-[150px]">
                        {uiCustomization.puddleCustomBackgroundType === 'video' ? '📽️ Video Loaded' : '🖼️ Image Loaded'}
                       </span>
                       <button 
                        onClick={clearPuddleBackground}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-rose-500 rounded-md transition-colors"
                       >
                        <X className="w-3 h-3" />
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {theme.visualStyle === 'black-hole' && theme.accentColor === 'bubbles-blackhole' && (
            <div className={`space-y-4 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint}`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20`}>
              <div className="flex items-center gap-3 mb-2">
                <Layers className={`w-5 h-5 ${isArcane ? arcane.text : 'text-teal-500'}`} />
                <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200'}`}>Bubbles Settings</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Hue Shift</span>
                    <span>{uiCustomization.bubblesHue ?? 280}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="360" step="1"
                    value={uiCustomization.bubblesHue ?? 280}
                    onChange={(e) => setUICustomization({ ...uiCustomization, bubblesHue: parseInt(e.target.value) })}
                    className="w-full accent-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Blob Size</span>
                    <span>{uiCustomization.bubblesSize ?? 150}px</span>
                  </div>
                  <input
                    type="range"
                    min="50" max="250" step="10"
                    value={uiCustomization.bubblesSize ?? 150}
                    onChange={(e) => setUICustomization({ ...uiCustomization, bubblesSize: parseInt(e.target.value) })}
                    className="w-full accent-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Viscosity (Blur)</span>
                    <span>{uiCustomization.bubblesBlur ?? 15}</span>
                  </div>
                  <input
                    type="range"
                    min="5" max="30" step="1"
                    value={uiCustomization.bubblesBlur ?? 15}
                    onChange={(e) => setUICustomization({ ...uiCustomization, bubblesBlur: parseInt(e.target.value) })}
                    className="w-full accent-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Animation Speed</span>
                    <span>{(uiCustomization.bubblesSpeed ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1" max="3.0" step="0.1"
                    value={uiCustomization.bubblesSpeed ?? 1.0}
                    onChange={(e) => setUICustomization({ ...uiCustomization, bubblesSpeed: parseFloat(e.target.value) })}
                    className="w-full accent-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Orb Count</span>
                    <span>{uiCustomization.bubblesOrbCount ?? 5}</span>
                  </div>
                  <input
                    type="range"
                    min="1" max="15" step="1"
                    value={uiCustomization.bubblesOrbCount ?? 5}
                    onChange={(e) => setUICustomization({ ...uiCustomization, bubblesOrbCount: parseInt(e.target.value) })}
                    className="w-full accent-teal-500"
                  />
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold mt-4 pt-4 border-t border-slate-700/50">
                  <span>Push Other Bubbles</span>
                  <button
                    onClick={() => setUICustomization({ ...uiCustomization, bubblesPushing: !(uiCustomization.bubblesPushing ?? true) })}
                    className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        (uiCustomization.bubblesPushing ?? true) ? 'bg-teal-500' : 'bg-slate-600'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        (uiCustomization.bubblesPushing ?? true) ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Magnetic Pull Power</span>
                    <span>{theme.blackHoleSettings?.bubblesPullPower ?? 0}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="2000" step="50"
                    value={theme.blackHoleSettings?.bubblesPullPower ?? 0}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#ffffff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        bubblesPullPower: parseInt(e.target.value) 
                      } 
                    })}
                    className="w-full accent-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Repulsion Push Power</span>
                    <span>{theme.blackHoleSettings?.bubblesPushPower ?? 400}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="1500" step="50"
                    value={theme.blackHoleSettings?.bubblesPushPower ?? 400}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#ffffff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        bubblesPushPower: parseInt(e.target.value) 
                      } 
                    })}
                    className="w-full accent-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Squish & Stretch Amount</span>
                    <span>{((theme.blackHoleSettings?.bubblesSquishPower ?? 0.02) * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0" max="0.2" step="0.01"
                    value={theme.blackHoleSettings?.bubblesSquishPower ?? 0.02}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#ffffff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        bubblesSquishPower: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full accent-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Micro Particles Count</span>
                    <span>{theme.blackHoleSettings?.bubblesMicroParticles ?? 200}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="800" step="50"
                    value={theme.blackHoleSettings?.bubblesMicroParticles ?? 200}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#ffffff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        bubblesMicroParticles: parseInt(e.target.value) 
                      } 
                    })}
                    className="w-full accent-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {theme.visualStyle === 'black-hole' && theme.accentColor === 'emissive-black-hole' && (
            <div className={`space-y-4 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint}`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20`}>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className={`w-5 h-5 text-blue-400`} />
                <span className={`text-sm font-bold text-white`}>Emissive Dissolve Settings</span>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>3D Geometry Shape</span>
                    <span className="capitalize">{theme.blackHoleSettings?.emissiveShape || 'torusKnot'}</span>
                  </div>
                  <select 
                    value={theme.blackHoleSettings?.emissiveShape || 'torusKnot'}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        emissiveShape: e.target.value as any 
                      } 
                    })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2 text-sm focus:outline-none focus:border-white/30"
                  >
                    <option value="torusKnot" className="bg-slate-900 text-white">Torus Knot (Default)</option>
                    <option value="torus" className="bg-slate-900 text-white">Torus (Donut)</option>
                    <option value="sphere" className="bg-slate-900 text-white">Quantum Sphere</option>
                    <option value="icosahedron" className="bg-slate-900 text-white">Crystalline Icosahedron</option>
                    <option value="cube" className="bg-slate-900 text-white">Hypercube</option>
                    <option value="cylinder" className="bg-slate-900 text-white">Cylinder</option>
                    <option value="cone" className="bg-slate-900 text-white">Cone</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Amplitude</span>
                    <span>{theme.blackHoleSettings?.emissiveAmplitude ?? 9.0}</span>
                  </div>
                  <input
                    type="range"
                    min="1" max="40" step="1"
                    value={theme.blackHoleSettings?.emissiveAmplitude ?? 9.0}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        emissiveAmplitude: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Frequency</span>
                    <span>{theme.blackHoleSettings?.emissiveFrequency ?? 0.25}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05" max="2.0" step="0.05"
                    value={theme.blackHoleSettings?.emissiveFrequency ?? 0.25}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        emissiveFrequency: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Edge Width</span>
                    <span>{theme.blackHoleSettings?.emissiveEdgeWidth ?? 0.1}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="0.5" step="0.05"
                    value={theme.blackHoleSettings?.emissiveEdgeWidth ?? 0.1}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        emissiveEdgeWidth: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>Thin</span>
                    <span>Thick</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Animation Speed</span>
                    <span>{theme.blackHoleSettings?.emissiveSpeed ?? 0.9}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1" max="5.0" step="0.1"
                    value={theme.blackHoleSettings?.emissiveSpeed ?? 0.9}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        emissiveSpeed: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Bloom Strength</span>
                    <span>{theme.blackHoleSettings?.emissiveBloom ?? 0.1}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="1" step="0.05"
                    value={theme.blackHoleSettings?.emissiveBloom ?? 0.1}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        emissiveBloom: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>None</span>
                    <span>Intense</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Bloom Threshold</span>
                    <span>{theme.blackHoleSettings?.emissiveBloomThreshold ?? 0.15}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0" max="1.0" step="0.05"
                    value={theme.blackHoleSettings?.emissiveBloomThreshold ?? 0.15}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        emissiveBloomThreshold: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>Glow All (0.0)</span>
                    <span>Glow Highlights (1.0)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Bloom Radius</span>
                    <span>{theme.blackHoleSettings?.emissiveBloomRadius ?? 1.0}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0" max="2.0" step="0.1"
                    value={theme.blackHoleSettings?.emissiveBloomRadius ?? 1.0}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        emissiveBloomRadius: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>Tight</span>
                    <span>Wide Spread</span>
                  </div>
                            <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Particle Visible</span>
                    <span>{theme.blackHoleSettings?.emissiveParticleVisible !== false ? 'Yes' : 'No'}</span>
                  </div>
                  <button
                    onClick={() => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        emissiveParticleVisible: theme.blackHoleSettings?.emissiveParticleVisible === false ? true : false 
                      } 
                    })}
                    className="w-full flex items-center justify-center py-2 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    Toggle Visibility
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Particle Base Size</span>
                    <span>{theme.blackHoleSettings?.emissiveParticleBaseSize ?? 55}</span>
                  </div>
                  <input
                    type="range"
                    min="10" max="100" step="1"
                    value={theme.blackHoleSettings?.emissiveParticleBaseSize ?? 55}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        emissiveParticleBaseSize: parseInt(e.target.value) 
                      } 
                    })}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>Small</span>
                    <span>Large (100)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Particle Speed Factor</span>
                    <span>{theme.blackHoleSettings?.emissiveParticleSpeedFactor ?? 0.022}</span>
                  </div>
                  <input
                    type="range"
                    min="0.001" max="0.1" step="0.001"
                    value={theme.blackHoleSettings?.emissiveParticleSpeedFactor ?? 0.022}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        emissiveParticleSpeedFactor: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Wave Amplitude</span>
                    <span>{theme.blackHoleSettings?.emissiveWaveAmplitude ?? 1.5}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="5" step="0.1"
                    value={theme.blackHoleSettings?.emissiveWaveAmplitude ?? 1.5}
                    onChange={(e) => onUpdateTheme?.({ 
                      blackHoleSettings: { 
                        ...(theme.blackHoleSettings || { 
                          colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                        }), 
                        emissiveWaveAmplitude: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[8px] text-white/30 uppercase font-medium">
                    <span>None</span>
                    <span>High (5)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold text-center">Velocity X</div>
                    <input
                      type="range"
                      min="-10" max="10" step="0.1"
                      value={theme.blackHoleSettings?.emissiveVelocityFactorX ?? 2.5}
                      onChange={(e) => onUpdateTheme?.({ 
                        blackHoleSettings: { 
                          ...(theme.blackHoleSettings || { 
                            colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                          }), 
                          emissiveVelocityFactorX: parseFloat(e.target.value) 
                        } 
                      })}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold text-center">Velocity Y</div>
                    <input
                      type="range"
                      min="-10" max="10" step="0.1"
                      value={theme.blackHoleSettings?.emissiveVelocityFactorY ?? 2.0}
                      onChange={(e) => onUpdateTheme?.({ 
                        blackHoleSettings: { 
                          ...(theme.blackHoleSettings || { 
                            colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                          }), 
                          emissiveVelocityFactorY: parseFloat(e.target.value) 
                        } 
                      })}
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>      </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Accent Background</span>
                    <span className="text-[9px] text-white/40">
                      {theme.blackHoleSettings?.emissiveCustomBackgroundType || 'Default Slate'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <label className="flex-1 flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-slate-700 hover:border-slate-500 bg-slate-950/60 cursor-pointer text-center text-xs text-slate-300 transition-colors">
                      <span className="font-semibold text-[10px] text-blue-400">Upload Photo/Video</span>
                      <span className="text-[8px] text-white/40 mt-0.5">Click to browse file...</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            const isVideo = file.type.startsWith('video/');
                            onUpdateTheme?.({
                              blackHoleSettings: {
                                ...(theme.blackHoleSettings || {
                                  colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true
                                }),
                                emissiveCustomBackground: result,
                                emissiveCustomBackgroundType: isVideo ? 'video' : 'image'
                              }
                            });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {theme.blackHoleSettings?.emissiveCustomBackground && (
                      <button
                        onClick={() => {
                          onUpdateTheme?.({
                            blackHoleSettings: {
                              ...(theme.blackHoleSettings || {
                                colors: ['#88ccff'], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true
                              }),
                              emissiveCustomBackground: undefined,
                              emissiveCustomBackgroundType: 'none'
                            }
                          });
                        }}
                        className="px-3 bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-900/50 hover:border-rose-700 rounded-lg text-[10px] uppercase font-bold transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span>Dissolve Color Accent</span>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap mt-2">
                    <input
                      title="Dissolve Accent Color"
                      type="color"
                      value={theme.blackHoleSettings?.colors?.[0] || '#88ccff'}
                      onChange={(e) => {
                        const currentColors = theme.blackHoleSettings?.colors || ['#88ccff'];
                        let newColors = [...currentColors];
                        newColors[0] = e.target.value;
                        onUpdateTheme?.({ 
                          blackHoleSettings: { 
                            ...(theme.blackHoleSettings || { 
                              colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                            }), 
                            colors: newColors
                          } 
                        });
                      }}
                      className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer bg-transparent overflow-hidden"
                      style={{ clipPath: 'circle(40%)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {theme.visualStyle === 'black-hole' && theme.accentColor === 'geometric-aura-black-hole' && (
            <>
              <div className={`space-y-4 p-4 rounded-2xl border transition-all duration-500 bg-slate-900 border-white/10`}>
                <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-2">
                  <Sparkles className={`w-5 h-5 text-sky-400`} />
                  <span className={`text-sm font-bold text-white`}>Geometric Aura Cosmic Panel</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Aura Core Shape</div>
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
                      {[
                        { id: 'icosahedron', label: 'Ico' },
                        { id: 'torusKnot', label: 'T-Knot' },
                        { id: 'torus', label: 'Torus' },
                        { id: 'sphere', label: 'Sphere' },
                        { id: 'octahedron', label: 'Octa' },
                        { id: 'dodecahedron', label: 'Dodeca' },
                        { id: 'brain', label: 'Brain' },
                        { id: 'heart', label: 'Heart' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onUpdateTheme?.({
                          blackHoleSettings: {
                            ...(theme.blackHoleSettings || { 
                              colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                            }),
                            geometricAuraShape: s.id as any
                          }
                        })}
                        className={`px-2 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-tight text-center border transition-all cursor-pointer ${
                          (theme.blackHoleSettings?.geometricAuraShape || 'icosahedron') === s.id
                            ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-[0_0_12px_rgba(14,165,233,0.2)]'
                            : 'bg-transparent text-white/40 border-transparent hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-white/50 uppercase font-bold">
                      <span>Aura Speed</span>
                      <span>{theme.blackHoleSettings?.geometricAuraSpeed ?? 1}x</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="3" step="0.1"
                      value={theme.blackHoleSettings?.geometricAuraSpeed ?? 1}
                      onChange={(e) => onUpdateTheme?.({ 
                        blackHoleSettings: { 
                          ...(theme.blackHoleSettings || { 
                            colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                          }), 
                          geometricAuraSpeed: parseFloat(e.target.value) 
                        } 
                      })}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-white/50 uppercase font-bold">
                      <span>Aura Scale</span>
                      <span>{theme.blackHoleSettings?.geometricAuraScale ?? 1}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5" max="3" step="0.1"
                      value={theme.blackHoleSettings?.geometricAuraScale ?? 1}
                      onChange={(e) => onUpdateTheme?.({ 
                        blackHoleSettings: { 
                          ...(theme.blackHoleSettings || { 
                            colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                          }), 
                          geometricAuraScale: parseFloat(e.target.value) 
                        } 
                      })}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-bold">
                      <span>Bloom Intensity</span>
                      <span>{theme.blackHoleSettings?.geometricAuraBloomStrength ?? 0.8}x</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="3" step="0.1"
                      value={theme.blackHoleSettings?.geometricAuraBloomStrength ?? 0.8}
                      onChange={(e) => onUpdateTheme?.({ 
                        blackHoleSettings: { 
                          ...(theme.blackHoleSettings || { 
                            colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                          }), 
                          geometricAuraBloomStrength: parseFloat(e.target.value) 
                        } 
                      })}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-bold">
                      <span>Wireframe Opacity</span>
                      <span>{Math.round((theme.blackHoleSettings?.geometricAuraWireOpacity ?? 0.25) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="1" step="0.05"
                      value={theme.blackHoleSettings?.geometricAuraWireOpacity ?? 0.25}
                      onChange={(e) => onUpdateTheme?.({ 
                        blackHoleSettings: { 
                          ...(theme.blackHoleSettings || { 
                            colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                          }), 
                          geometricAuraWireOpacity: parseFloat(e.target.value) 
                        } 
                      })}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-white/50 uppercase font-bold">
                      <span>Star Density</span>
                      <span>{theme.blackHoleSettings?.geometricAuraStarCount ?? 800}</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="3000" step="50"
                      value={theme.blackHoleSettings?.geometricAuraStarCount ?? 800}
                      onChange={(e) => onUpdateTheme?.({ 
                        blackHoleSettings: { 
                          ...(theme.blackHoleSettings || { 
                            colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                          }), 
                          geometricAuraStarCount: parseInt(e.target.value) 
                        } 
                      })}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-bold bg-black/20 p-2.5 rounded-xl border border-white/5 h-[34px] mt-4">
                    <span>Space Grid</span>
                    <input
                      type="checkbox"
                      checked={theme.blackHoleSettings?.geometricAuraGridVisible ?? true}
                      onChange={(e) => onUpdateTheme?.({ 
                        blackHoleSettings: { 
                          ...(theme.blackHoleSettings || { 
                            colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                          }), 
                          geometricAuraGridVisible: e.target.checked 
                        } 
                      })}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-sky-500 focus:ring-sky-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-3">
                  <div className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Aura Color Tuning</div>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => onUpdateTheme?.({
                        blackHoleSettings: {
                          ...(theme.blackHoleSettings || { 
                            colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                          }),
                          geometricAuraRainbowMode: false,
                          geometricAuraSmartColorEnabled: false
                        }
                      })}
                      className={`py-1 rounded-lg text-[10px] uppercase font-bold text-center border transition-all cursor-pointer ${
                        !theme.blackHoleSettings?.geometricAuraRainbowMode && !theme.blackHoleSettings?.geometricAuraSmartColorEnabled
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-[0_0_8px_rgba(14,165,233,0.15)]'
                          : 'bg-transparent text-white/40 border-transparent hover:text-white/70'
                      }`}
                    >
                      Fine Tune
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => onUpdateTheme?.({
                        blackHoleSettings: {
                          ...(theme.blackHoleSettings || { 
                            colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                          }),
                          geometricAuraRainbowMode: false,
                          geometricAuraSmartColorEnabled: true
                        }
                      })}
                      className={`py-1 rounded-lg text-[10px] uppercase font-bold text-center border transition-all cursor-pointer ${
                        theme.blackHoleSettings?.geometricAuraSmartColorEnabled
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-[0_0_8px_rgba(14,165,233,0.15)]'
                          : 'bg-transparent text-white/40 border-transparent hover:text-white/70'
                      }`}
                    >
                      Smart Harmonize
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateTheme?.({
                        blackHoleSettings: {
                          ...(theme.blackHoleSettings || { 
                            colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                          }),
                          geometricAuraRainbowMode: true,
                          geometricAuraSmartColorEnabled: false
                        }
                      })}
                      className={`py-1 rounded-lg text-[10px] uppercase font-bold text-center border transition-all cursor-pointer ${
                        theme.blackHoleSettings?.geometricAuraRainbowMode
                          ? 'bg-gradient-to-r from-red-500/20 via-green-500/20 to-blue-500/20 text-fuchsia-400 border-fuchsia-500/40 shadow-[0_0_8px_rgba(217,70,239,0.15)]'
                          : 'bg-transparent text-white/40 border-transparent hover:text-white/70'
                      }`}
                    >
                      Rainbow 🌈
                    </button>
                  </div>
                </div>

                {theme.blackHoleSettings?.geometricAuraSmartColorEnabled ? (
                  <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-white/5 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-zinc-300 uppercase font-black">Harmonizer Base Color</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={theme.blackHoleSettings?.geometricAuraBaseColor || '#66ccff'}
                        onChange={(e) => onUpdateTheme?.({ 
                          blackHoleSettings: { 
                            ...(theme.blackHoleSettings || { 
                              colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                            }), 
                            geometricAuraBaseColor: e.target.value 
                          } 
                        })}
                        className="w-10 h-10 p-0 border-0 rounded-full cursor-pointer bg-transparent overflow-hidden"
                        style={{ clipPath: 'circle(50%)' }}
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{theme.blackHoleSettings?.geometricAuraBaseColor || '#66CCFF'}</span>
                        <span className="text-[8px] text-white/40 leading-tight">All internal textures (core, meshes, gas cloud, space rings, neon helper grid, bright particles) will automatically update harmoniously from this single pick.</span>
                      </div>
                    </div>
                  </div>
                ) : theme.blackHoleSettings?.geometricAuraRainbowMode ? (
                  <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-white/5 border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/5 to-transparent">
                    <div className="flex items-center justify-between text-[10px] text-zinc-300 uppercase font-black">
                      <span>Rainbow Cycle Speed</span>
                      <span>{theme.blackHoleSettings?.geometricAuraRainbowSpeed ?? 1.0}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.1" max="5" step="0.1"
                      value={theme.blackHoleSettings?.geometricAuraRainbowSpeed ?? 1.0}
                      onChange={(e) => onUpdateTheme?.({ 
                        blackHoleSettings: { 
                          ...(theme.blackHoleSettings || { 
                            colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                          }), 
                          geometricAuraRainbowSpeed: parseFloat(e.target.value) 
                        } 
                      })}
                      className="w-full accent-fuchsia-500 cursor-pointer"
                    />
                    <p className="text-[8px] text-fuchsia-400 font-bold leading-none select-none">
                      🌈 Continuous spectral rotation is active. Material lighting orbits harmoniously.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-bold">
                      <span>Fine Tune Colors</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="color"
                          value={theme.blackHoleSettings?.geometricAuraCoreColor || '#4a7a5c'}
                          onChange={(e) => onUpdateTheme?.({ 
                            blackHoleSettings: { 
                              ...(theme.blackHoleSettings || { 
                                colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                              }), 
                              geometricAuraCoreColor: e.target.value 
                            } 
                          })}
                          className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer bg-transparent overflow-hidden"
                          style={{ clipPath: 'circle(50%)' }}
                        />
                        <span className="text-[8px] text-white/50 text-center font-medium leading-none">Core</span>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="color"
                          value={theme.blackHoleSettings?.geometricAuraWireColor || '#66ccff'}
                          onChange={(e) => onUpdateTheme?.({ 
                            blackHoleSettings: { 
                              ...(theme.blackHoleSettings || { 
                                colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                              }), 
                              geometricAuraWireColor: e.target.value 
                            } 
                          })}
                          className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer bg-transparent overflow-hidden"
                          style={{ clipPath: 'circle(50%)' }}
                        />
                        <span className="text-[8px] text-white/50 text-center font-medium leading-none">Wire</span>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="color"
                          value={theme.blackHoleSettings?.geometricAuraStarColor || '#aaccff'}
                          onChange={(e) => onUpdateTheme?.({ 
                            blackHoleSettings: { 
                              ...(theme.blackHoleSettings || { 
                                colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                              }), 
                              geometricAuraStarColor: e.target.value 
                            } 
                          })}
                          className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer bg-transparent overflow-hidden"
                          style={{ clipPath: 'circle(50%)' }}
                        />
                        <span className="text-[8px] text-white/50 text-center font-medium leading-none">Stars</span>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="color"
                          value={theme.blackHoleSettings?.geometricAuraInnerRingColor || '#88aaff'}
                          onChange={(e) => onUpdateTheme?.({ 
                            blackHoleSettings: { 
                              ...(theme.blackHoleSettings || { 
                                colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                              }), 
                              geometricAuraInnerRingColor: e.target.value 
                            } 
                          })}
                          className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer bg-transparent overflow-hidden"
                          style={{ clipPath: 'circle(50%)' }}
                        />
                        <span className="text-[8px] text-white/50 text-center font-medium leading-none">Inner R.</span>
                      </div>

                      <div className="flex flex-col items-center gap-1 mt-1.5">
                        <input
                          type="color"
                          value={theme.blackHoleSettings?.geometricAuraOuterRingColor || '#ffaa08'}
                          onChange={(e) => onUpdateTheme?.({ 
                            blackHoleSettings: { 
                              ...(theme.blackHoleSettings || { 
                                colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                              }), 
                              geometricAuraOuterRingColor: e.target.value 
                            } 
                          })}
                          className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer bg-transparent overflow-hidden"
                          style={{ clipPath: 'circle(50%)' }}
                        />
                        <span className="text-[8px] text-white/50 text-center font-medium leading-none">Outer R.</span>
                      </div>

                      <div className="flex flex-col items-center gap-1 mt-1.5">
                        <input
                          type="color"
                          value={theme.blackHoleSettings?.geometricAuraGasColor || '#77aaff'}
                          onChange={(e) => onUpdateTheme?.({ 
                            blackHoleSettings: { 
                              ...(theme.blackHoleSettings || { 
                                colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                              }), 
                              geometricAuraGasColor: e.target.value 
                            } 
                          })}
                          className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer bg-transparent overflow-hidden"
                          style={{ clipPath: 'circle(50%)' }}
                        />
                        <span className="text-[8px] text-white/50 text-center font-medium leading-none">Gas Cl.</span>
                      </div>

                      <div className="flex flex-col items-center gap-1 mt-1.5">
                        <input
                          type="color"
                          value={theme.blackHoleSettings?.geometricAuraGridColor || '#335588'}
                          onChange={(e) => onUpdateTheme?.({ 
                            blackHoleSettings: { 
                              ...(theme.blackHoleSettings || { 
                                colors: [], colorChangeOnClick: true, shape: 'infinity', interactWithCursor: true 
                              }), 
                              geometricAuraGridColor: e.target.value 
                            } 
                          })}
                          className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer bg-transparent overflow-hidden"
                          style={{ clipPath: 'circle(50%)' }}
                        />
                        <span className="text-[8px] text-white/50 text-center font-medium leading-none">Grid</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Holographic 3D HUD Controller & Live Interactive Preview Column for Geometric Aura */}
            <div 
              className="space-y-4 p-4 rounded-2xl border bg-black/40 shadow-[0_0_20px_rgba(0,225,255,0.05)] transition-all duration-500 flex flex-col justify-between"
              style={{ borderColor: `${theme.blackHoleSettings?.geometricAuraBaseColor || '#00e1ff'}33`, boxShadow: `0 0 20px ${theme.blackHoleSettings?.geometricAuraBaseColor || '#00e1ff'}08` }}
            >
              <div 
                className="flex items-center gap-3 mb-1 p-2 rounded-lg border-l-2"
                style={{ 
                  backgroundImage: `linear-gradient(to right, ${theme.blackHoleSettings?.geometricAuraBaseColor || '#00e1ff'}1a, transparent)`,
                  borderLeftColor: theme.blackHoleSettings?.geometricAuraBaseColor || '#00e1ff' 
                }}
              >
                <Move className="w-5 h-5 animate-pulse" style={{ color: theme.blackHoleSettings?.geometricAuraBaseColor || '#00e1ff' }} />
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-white tracking-widest uppercase">Geometric Aura HUD</span>
                  <span className="text-[9px] font-bold tracking-wide uppercase" style={{ color: theme.blackHoleSettings?.geometricAuraBaseColor || '#00e1ff' }}>HOLOGRAPHIC 3D VIEWPORT</span>
                </div>
              </div>

              <GeometricAuraHUD customization={uiCustomization} setUICustomization={setUICustomization} baseColor={theme.blackHoleSettings?.geometricAuraBaseColor || '#00e1ff'} />

              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">
                    Live Geometric Aura Preview
                  </span>
                  <span className="text-[8px] font-mono animate-pulse" style={{ color: theme.blackHoleSettings?.geometricAuraBaseColor || '#00e1ff' }}>● OSCILLATING</span>
                </div>
                <GeometricAuraBlackHoleBackground settings={theme.blackHoleSettings} customization={uiCustomization} isMini={true} />
              </div>
            </div>
          </>
        )}
                 </>
               )}
               {activeTab === 'typography' && (
                 <>

          <div className={`space-y-3 p-4 rounded-2xl border transition-all duration-500 ${isArcane ? `${arcane.bg} ${arcane.border}` : `${currentTab.bgTint} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none`} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20`}>
            <div className="flex items-center gap-3 mb-2">
              <Type className={`w-5 h-5 ${isArcane ? arcane.text : 'text-indigo-500'} group-[.visual-liquid-glass]/liquid-glass:!text-indigo-300 group-[.visual-fluid]/fluid:!text-indigo-300`} />
              <span className={`text-sm font-bold transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`}>Custom Font Upload</span>
            </div>
            <div className="flex flex-col gap-2">
              <input 
                type="file" 
                accept=".ttf,.otf,.woff,.woff2" 
                ref={fileInputRef}
                onChange={handleFontUpload}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl transition-colors text-sm font-bold no-hat ${isArcane ? `${arcane.bg} ${arcane.text} hover:bg-white/20` : 'bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!text-white group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/20`}
              >
                <Upload className="w-4 h-4" />
                Upload Font File
              </button>
              {uiCustomization.customFontUrl && (
                <button 
                  onClick={clearFont}
                  className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 font-bold mt-1 no-hat group-[.visual-liquid-glass]/liquid-glass:!text-rose-400 group-[.visual-fluid]/fluid:!text-rose-400"
                >
                  Clear Custom Font
                </button>
              )}
            </div>
          </div>
                 </>
               )}
             </motion.div>
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-fluid]/fluid:!border-white/10 flex flex-col items-center">
              <button
            onClick={() => {
              setUICustomization({
                // ... same reset logic
                enabled: true,
                uiSize: 1.0,
                customFontUrl: null,
                performanceMode: false,
                dynamicBackgroundEnabled: true,
                dynamicBackgroundIntensity: 1.0,
                borderRadius: 16,
                spacing: 1.0,
                blurEnabled: true,
                shadowsEnabled: true,
                textFontSize: 16,
                textFontWeight: 400,
                textLetterSpacing: 0,
                textLineHeight: 1.5,
                particleMaxConnections: 3,
                particleConnectionDistance: 150,
                particleMaxSize: 4,
                particleCount: 50,
                particleReduceLag: false,
                optimizationMode: false,
                liquidGlassThickness: 50,
                liquidGlassBezel: 60,
                liquidGlassIOR: 3.0,
                liquidGlassBlur: 1.5,
                liquidGlassSpecular: 0.55,
                liquidGlassTint: 8,
                liquidGlassShadow: 0,
                liquidGlassTintColor: '#ffffff',
                liquidGlassIridescence: 0.08,
                liquidGlassIridescenceSpeed: 0.5,
                liquidGlassLightDirX: 0.5,
                liquidGlassLightDirY: -0.7,
                liquidGlassShape: 'convex_squircle',
                liquidGlassScaleRatio: 1.0,
                liquidGlassShadowColor: '#000000',
                liquidGlassInnerShadowSpread: 0.6,
                liquidGlassOuterShadowBlur: 24,
                liquidGlassChromatic: 0.0,
                liquidGlassNoise: 0,
                liquidGlassEdgeGlow: 0.3,
                liquidGlassSaturation: 2.5,
                spaceBlackHoleColor: '#ea580c',
                spaceBlackHoleLensing: 0.12,
                spaceBlackHoleDiskSpeed: 0.22,
                spaceBlackHoleNoiseScale: 2.5,
                puddleSpeed: 3.0,
                puddlePower: 4.0,
                puddleDamping: 0.80,
                puddleHardness: 0.25,
                puddleSize: 0.03,
                puddleRaindrops: false,
                puddleRaindropsIntensity: 0.5,
                puddleSpecular: 0.5,
                puddleRefraction: 1.0,
                neuralBaseColor: '#00ffc8',
                neuralPulseSpeed: 1.0,
                neuralDensity: 18,
                neuralCameraSpeed: 0.7,
                neuralGlowStrength: 1.5,
                neuralPulseGlow: 3.0,
                neuralRainbowMode: 1.0,
                neuralShape: 'neuron',
                neuralScale: 1.0,
              });
              onUpdateTheme?.({
                textAnimationEnabled: false,
                textAnimationType: 'typewriter',
                textAnimationSpeed: 1.0,
                blackHoleSettings: {
                  colors: ['#ffffff', '#000000', '#222222', '#111111', '#555555'],
                  colorChangeOnClick: true,
                  shape: 'infinity',
                  interactWithCursor: true
                }
              });
            }}
            className={`w-full py-3 px-4 rounded-xl transition-colors text-sm font-bold uppercase tracking-wider no-hat ${isArcane ? `${arcane.bg} ${arcane.text} hover:bg-white/20` : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!text-white group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/20`}
          >
            Reset to Defaults
          </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

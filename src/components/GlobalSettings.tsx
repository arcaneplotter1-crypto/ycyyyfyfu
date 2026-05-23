import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Moon, Sun, Palette, Zap, Map as MapIcon, History, 
  ChevronRight, Library, Layers, Save, FileText, Sparkles,
  Gamepad2, Settings as SettingsIcon
} from 'lucide-react';
import { AppTheme } from '../types';
import { getArcaneStyles } from '../utils/arcaneThemes';

interface GlobalSettingsProps {
  appMode: 'exams' | 'pdfs' | 'presentations' | 'uploader';
  setAppMode: (mode: 'exams' | 'pdfs' | 'presentations' | 'uploader') => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  theme: AppTheme;
  onClose: () => void;
  onOpenHistory: () => void;
  onOpenThemes: () => void;
  onOpenBank: () => void;
  onOpenUICustomization: () => void;
  onOpenPowerSettings: () => void;
  onOpenSavedExams: () => void;
  onOpenSavedPdfs: () => void;
  onOpenSavedAugmentations: () => void;
  onOpenUploader: () => void;
  rpgModeEnabled: boolean;
  setRpgModeEnabled: (v: boolean) => void;
  onOpenRpgShop: () => void;
  coins: number;
}

export const GlobalSettings: React.FC<GlobalSettingsProps> = ({ 
  appMode,
  setAppMode,
  darkMode, 
  setDarkMode, 
  theme,
  onClose,
  onOpenHistory,
  onOpenThemes,
  onOpenBank,
  onOpenUICustomization,
  onOpenPowerSettings,
  onOpenSavedExams,
  onOpenSavedPdfs,
  onOpenSavedAugmentations,
  onOpenUploader,
  rpgModeEnabled,
  setRpgModeEnabled,
  onOpenRpgShop,
  coins
}) => {
  const isUndertale = theme.visualStyle === 'undertale';
  const isBlackHole = theme.visualStyle === 'black-hole' || theme.visualStyle === 'space-black-hole';
  const forceDarkMode = isUndertale || isBlackHole;
  const isArcane = theme.visualStyle === 'arcane' || theme.visualStyle === 'virus';
  const isHollowKnight = theme.visualStyle === 'hollow-knight';
  
  const hkStyles = {
    modalItem: 'group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)]/80 group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/40 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:font-serif',
    textHighlight: 'group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:font-serif',
    textMain: 'group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif',
    modalContainer: 'group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-card)]/90 group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:border-2'
  };

  const arcane = isArcane 
    ? getArcaneStyles(theme.accentColor) 
    : { border: 'border-white/20 dark:border-slate-800/50', glow: '', text: 'text-indigo-500', bg: 'bg-slate-50 dark:bg-slate-800/50' };

  const liquidGlassClass = "group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:!backdrop-blur-none";
  const fluidClass = "group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20 group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!shadow-none group-[.visual-fluid]/fluid:!backdrop-blur-none";
  const panelBaseClass = `p-5 sm:p-6 rounded-3xl border transition-all duration-500 flex flex-col gap-4 ${isArcane ? `${arcane.bg} ${arcane.border}` : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 shadow-sm'} ${liquidGlassClass} ${fluidClass} ${hkStyles.modalItem}`;
  const btnBaseClass = `w-full flex items-center justify-between p-4 rounded-2xl border transition-all no-hat group hover:scale-[1.02] active:scale-[0.98] ${liquidGlassClass} ${fluidClass} ${hkStyles.modalItem} group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)]`;

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 group/hollow-knight ${isHollowKnight ? 'visual-hollow-knight' : ''}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`brutal-modal relative w-[calc(100%-1rem)] max-h-[calc(100dvh-1rem)] sm:w-[calc(100%-2rem)] sm:max-h-[calc(100dvh-2rem)] md:max-h-[85vh] max-w-5xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800/60 overflow-hidden flex flex-col transition-all duration-500 mx-auto ${arcane.glow} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:!backdrop-blur-none group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none group-[.visual-fluid]/fluid:!backdrop-blur-none group-[.visual-fluid]/fluid:fluid-progress-panel ${hkStyles.modalContainer}`}
      >
        {/* Header */}
        <div className={`p-6 sm:p-8 border-b flex items-center justify-between sticky top-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl z-20 ${isArcane ? arcane.border : 'border-slate-200/50 dark:border-slate-800/50'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!backdrop-blur-none group-[.visual-liquid-glass]/liquid-glass:!border-b group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!border-b group-[.visual-fluid]/fluid:!border-white/10 group-[.visual-fluid]/fluid:!backdrop-blur-none group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)]/90 group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50`}>
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 ${isArcane ? arcane.bg : ''} group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-hover)]`}>
              <SettingsIcon className={`w-5 h-5 ${isArcane ? arcane.text : 'text-indigo-500'} ${hkStyles.textHighlight}`} />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-black tracking-tight ${isArcane ? arcane.text : 'text-slate-800 dark:text-slate-100'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white ${hkStyles.textMain}`}>Global Settings</h3>
              <p className={`text-[10px] sm:text-xs font-medium uppercase tracking-widest text-slate-500 group-[.visual-liquid-glass]/liquid-glass:!text-white/60 group-[.visual-fluid]/fluid:!text-white/60 ${hkStyles.textHighlight}`}>Control Center</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-colors no-hat group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!text-white group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)]">
            <X className={`w-5 h-5 ${isArcane ? arcane.text : 'text-slate-500'} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white`} />
          </button>
        </div>

        {/* Content Bento Grid */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Column 1: Core Hub */}
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className={panelBaseClass}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className={`w-4 h-4 ${isArcane ? arcane.text : 'text-indigo-500'} ${hkStyles.textHighlight}`} />
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${isArcane ? arcane.text : 'text-slate-500 dark:text-slate-400'} ${hkStyles.textMain}`}>
                    {appMode === 'exams' ? 'Exam Tools' : appMode === 'pdfs' ? 'PDF Tools' : appMode === 'presentations' ? 'Slide Tools' : 'App Tools'}
                  </h4>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap sm:flex-nowrap items-center bg-slate-200/50 dark:bg-slate-900/50 rounded-xl p-1 w-full gap-1 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-card)] group-[.visual-hollow-knight]/hollow-knight:rounded-none border border-transparent dark:border-slate-800/50 group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/30">
                    <button
                      onClick={(e) => { e.stopPropagation(); setAppMode('exams'); }}
                      className={`flex-1 min-w-[30%] py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${appMode === 'exams' ? 'bg-white dark:bg-slate-700 shadow flex-grow-[1.2] text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'} group-[.visual-liquid-glass]/liquid-glass:!text-white/60 group-[.visual-liquid-glass]/liquid-glass:[&.bg-white]:!bg-white/20 group-[.visual-liquid-glass]/liquid-glass:[&.bg-white]:!text-white group-[.visual-fluid]/fluid:!text-white/60 group-[.visual-fluid]/fluid:[&.bg-white]:!bg-white/20 group-[.visual-fluid]/fluid:[&.bg-white]:!text-white group-[.visual-hollow-knight]/hollow-knight:[&.bg-white]:!bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)]/70 group-[.visual-hollow-knight]/hollow-knight:[&.bg-white]:!text-[var(--color-hk-text)]`}
                    >
                      Exams
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAppMode('pdfs'); }}
                      className={`flex-1 min-w-[30%] py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${appMode === 'pdfs' ? 'bg-white dark:bg-slate-700 shadow flex-grow-[1.2] text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'} group-[.visual-liquid-glass]/liquid-glass:!text-white/60 group-[.visual-liquid-glass]/liquid-glass:[&.bg-white]:!bg-white/20 group-[.visual-liquid-glass]/liquid-glass:[&.bg-white]:!text-white group-[.visual-fluid]/fluid:!text-white/60 group-[.visual-fluid]/fluid:[&.bg-white]:!bg-white/20 group-[.visual-fluid]/fluid:[&.bg-white]:!text-white group-[.visual-hollow-knight]/hollow-knight:[&.bg-white]:!bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)]/70 group-[.visual-hollow-knight]/hollow-knight:[&.bg-white]:!text-[var(--color-hk-text)]`}
                    >
                      PDFs
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAppMode('presentations'); }}
                      className={`flex-1 min-w-[30%] py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${appMode === 'presentations' ? 'bg-white dark:bg-slate-700 shadow flex-grow-[1.2] text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'} group-[.visual-liquid-glass]/liquid-glass:!text-white/60 group-[.visual-liquid-glass]/liquid-glass:[&.bg-white]:!bg-white/20 group-[.visual-liquid-glass]/liquid-glass:[&.bg-white]:!text-white group-[.visual-fluid]/fluid:!text-white/60 group-[.visual-fluid]/fluid:[&.bg-white]:!bg-white/20 group-[.visual-fluid]/fluid:[&.bg-white]:!text-white group-[.visual-hollow-knight]/hollow-knight:[&.bg-white]:!bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)]/70 group-[.visual-hollow-knight]/hollow-knight:[&.bg-white]:!text-[var(--color-hk-text)]`}
                    >
                      Slides
                    </button>
                  </div>

                  <div className={`mt-2 flex items-center justify-between p-4 rounded-xl transition-all ${isArcane ? `${arcane.bg} ${arcane.border}` : 'bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60 shadow-sm'} ${forceDarkMode ? 'opacity-50 cursor-not-allowed' : ''} group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!border-white/10 ${hkStyles.modalItem}`}>
                    <div className="flex items-center gap-3">
                      {darkMode ? <Moon className={`w-4 h-4 text-indigo-400`} /> : <Sun className="w-4 h-4 text-amber-500" />}
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold tracking-tight ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200'} ${hkStyles.textMain}`}>Dark Mode</span>
                        {forceDarkMode && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-0.5">Forced</span>}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        if (forceDarkMode) return;
                        e.stopPropagation();
                        setDarkMode(!darkMode);
                      }}
                      disabled={forceDarkMode}
                      className={`p-0 w-12 h-6 rounded-full transition-all duration-300 relative no-hat ${forceDarkMode ? 'cursor-not-allowed' : 'cursor-pointer'} ${darkMode ? 'bg-indigo-500 shadow-lg shadow-indigo-500/40' : 'bg-slate-300 dark:bg-slate-600'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/20 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-fluid]/fluid:!bg-white/20 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:rounded-none border-none`}
                      aria-label="Toggle Dark Mode"
                    >
                      <motion.div
                        animate={{ x: darkMode ? 26 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm bg-white group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-accent-light)] group-[.visual-hollow-knight]/hollow-knight:rounded-none`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className={panelBaseClass}>
                <div className="flex items-center gap-2 mb-2">
                  <Gamepad2 className={`w-4 h-4 text-amber-500 ${hkStyles.textHighlight}`} />
                  <h4 className={`text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 ${hkStyles.textMain}`}>Progression</h4>
                </div>
                
                <div className={`flex items-center justify-between p-4 rounded-xl transition-all ${isArcane ? `${arcane.bg} ${arcane.border}` : 'bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60 shadow-sm'} ${hkStyles.modalItem}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold tracking-tight ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200'} ${hkStyles.textMain}`}>RPG Mode</span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Earn coins & powers</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setRpgModeEnabled(!rpgModeEnabled); }}
                    className={`p-0 w-12 h-6 rounded-full transition-all duration-300 relative no-hat ${rpgModeEnabled ? 'bg-amber-500 shadow-lg shadow-amber-500/40' : 'bg-slate-300 dark:bg-slate-600'} border-none group-[.visual-liquid-glass]/liquid-glass:!bg-white/20 group-[.visual-fluid]/fluid:!bg-white/20 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:rounded-none`}
                  >
                    <motion.div
                      animate={{ x: rpgModeEnabled ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm bg-white group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-accent-light)] group-[.visual-hollow-knight]/hollow-knight:rounded-none`}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {rpgModeEnabled && (
                    <motion.button
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={onOpenRpgShop}
                      className="w-full mt-2 py-4 bg-gradient-to-r from-amber-200 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/20 border border-amber-300 dark:border-amber-700 rounded-xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all no-hat group shadow-sm overflow-hidden"
                    >
                      <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
                      <span className="text-sm font-black uppercase tracking-widest text-amber-900 dark:text-amber-100">
                        Shop (🪙 {coins})
                      </span>
                      <ChevronRight className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Column 2: Appearance */}
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className={`${panelBaseClass} h-full`}>
                <div className="flex items-center gap-2 mb-2">
                  <Palette className={`w-4 h-4 text-emerald-500 ${hkStyles.textHighlight}`} />
                  <h4 className={`text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 ${hkStyles.textMain}`}>Appearance</h4>
                </div>
                
                <div className="flex flex-col gap-3 h-full">
                  <button
                    onClick={onOpenThemes}
                    className={`${btnBaseClass} flex-1 ${isArcane ? `${arcane.bg} ${arcane.border}` : 'bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60'} group`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                        <Palette className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <span className={`text-sm font-bold tracking-tight ${isArcane ? arcane.text : 'text-slate-700 dark:text-slate-200'} ${hkStyles.textMain}`}>Theme Gallery</span>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Discover visual styles</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={onOpenUICustomization}
                    className={`${btnBaseClass} flex-1 ${isArcane ? `${arcane.bg} ${arcane.border}` : 'bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/60 dark:border-emerald-800/40'} group`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <span className={`text-sm font-bold tracking-tight text-emerald-800 dark:text-emerald-300 ${hkStyles.textMain}`}>Layout & Tweaks</span>
                        <span className="text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/70">Fine-tune the interface</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-emerald-600 dark:text-emerald-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: App-Specific Tools */}
            <div className="flex flex-col gap-4 sm:gap-6 md:col-span-2 lg:col-span-1">
              <div className={`${panelBaseClass} h-full`}>
                <div className="flex items-center gap-2 mb-2">
                  <Library className={`w-4 h-4 text-blue-500 ${hkStyles.textHighlight}`} />
                  <h4 className={`text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 ${hkStyles.textMain}`}>
                    {appMode === 'exams' ? 'Exam Tools' : appMode === 'pdfs' ? 'PDF Tools' : 'Slide Tools'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {appMode === 'exams' && [
                    { icon: MapIcon, label: 'Question Bank', desc: 'Manage your library', onClick: onOpenBank, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/80 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800/40', iconBg: 'bg-indigo-100 dark:bg-indigo-800/40' },
                    { icon: Save, label: 'Saved Exams', desc: 'Ready to play', onClick: onOpenSavedExams, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/80 dark:bg-rose-900/20', border: 'border-rose-100 dark:border-rose-800/40', iconBg: 'bg-rose-100 dark:bg-rose-800/40' },
                    { icon: History, label: 'Exam History', desc: 'Review past results', onClick: onOpenHistory, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50/80 dark:bg-cyan-900/20', border: 'border-cyan-100 dark:border-cyan-800/40', iconBg: 'bg-cyan-100 dark:bg-cyan-800/40' },
                    { icon: Zap, label: 'Power Settings', desc: 'Configure abilities', onClick: onOpenPowerSettings, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/80 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-800/40', iconBg: 'bg-amber-100 dark:bg-amber-800/40' },
                    { icon: Sparkles, label: 'Uploader Mode', desc: 'Drop files directly', onClick: onOpenUploader, color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50/80 dark:bg-fuchsia-900/20', border: 'border-fuchsia-100 dark:border-fuchsia-800/40', iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-800/40' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.onClick}
                      className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all no-hat group ${item.bg} ${item.border} hover:scale-[1.02] active:scale-[0.98] ${liquidGlassClass} ${fluidClass} ${hkStyles.modalItem} group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)]`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 sm:p-2.5 rounded-xl ${item.iconBg} ${item.color} group-hover:scale-110 transition-transform`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className={`text-sm font-bold tracking-tight ${item.color} ${hkStyles.textMain}`}>{item.label}</span>
                          <span className="text-[9px] sm:text-[10px] font-medium opacity-70">{item.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 opacity-40 group-hover:opacity-100 ${item.color}`} />
                    </button>
                  ))}

                  {appMode === 'pdfs' && [
                    { icon: Library, label: 'Saved Pdfs', desc: 'Stored documents', onClick: onOpenSavedPdfs, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/80 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800/40', iconBg: 'bg-indigo-100 dark:bg-indigo-800/40' },
                    { icon: Zap, label: 'Saved Augments', desc: 'Knowledge layers', onClick: onOpenSavedAugmentations, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/80 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800/40', iconBg: 'bg-emerald-100 dark:bg-emerald-800/40' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.onClick}
                      className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all no-hat group ${item.bg} ${item.border} hover:scale-[1.02] active:scale-[0.98] ${liquidGlassClass} ${fluidClass} ${hkStyles.modalItem} group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)]`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${item.iconBg} ${item.color} group-hover:scale-110 transition-transform`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className={`text-sm font-bold tracking-tight ${item.color} ${hkStyles.textMain}`}>{item.label}</span>
                          <span className="text-[10px] font-medium opacity-70">{item.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 opacity-40 group-hover:opacity-100 ${item.color}`} />
                    </button>
                  ))}
                  
                  {appMode === 'presentations' && (
                     <div className="flex items-center justify-center p-6 text-center h-full">
                       <p className="text-sm font-medium text-slate-500 opacity-60">No specific slide tools available yet.</p>
                     </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Zap, BrainCircuit, Dices, Hourglass, Sparkles, 
  ShieldCheck, Wand2, Eye, Cpu, Paintbrush, FlipHorizontal, 
  CloudFog, Waves, Tv, FlipVertical, Vibrate, Rainbow, 
  Snowflake, ScanLine, BatteryLow, MousePointerClick, 
  Crosshair, Disc, Bug, Grid3X3, Sliders, LayoutGrid, 
  Ghost, Anchor, Thermometer, Film, Wine, CupSoda, Play, ChevronRight 
} from 'lucide-react';
import { Power, AppTheme, QuestionType } from '../../types';
import { OffensivePowersOverlay } from './OffensivePowers';
import { InteractivePowersOverlay } from './InteractivePowers';

const ICON_MAP: Record<string, any> = {
  Zap,
  BrainCircuit,
  Dices,
  Hourglass,
  Sparkles,
  ShieldCheck,
  Wand2,
  Eye,
  Cpu,
  Paintbrush,
  FlipHorizontal,
  CloudFog,
  Waves,
  Tv,
  FlipVertical,
  Vibrate,
  Rainbow,
  Snowflake,
  ScanLine,
  BatteryLow,
  MousePointerClick,
  Crosshair,
  Disc,
  Bug,
  Grid3X3,
  Sliders,
  LayoutGrid,
  Ghost,
  Anchor,
  Thermometer,
  Film,
  Wine,
  CupSoda
};

interface PowerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  powers: Power[];
  onUsePower: (power: Power) => void;
  theme: AppTheme;
  currentQuestionType?: QuestionType;
}

export const PowerMenu: React.FC<PowerMenuProps> = ({ isOpen, onClose, powers, onUsePower, theme, currentQuestionType }) => {
  const [previewPower, setPreviewPower] = React.useState<Power | null>(null);
  
  const filteredPowers = powers.filter(power => {
    if (!power.supportedQuestionTypes || !currentQuestionType) return true;
    return power.supportedQuestionTypes.includes(currentQuestionType);
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50, rotateX: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] z-[101] border-4 border-white dark:border-slate-800 overflow-hidden perspective-1000"
          >
            {/* Preview Overlay */}
            <AnimatePresence>
              {previewPower && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-[110] bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
                >
                  <div className="absolute top-4 right-4 z-[120]">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewPower(null);
                      }}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="relative w-full h-48 mb-6 rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Power-specific preview animation */}
                      {previewPower.type === 'offensive' && (
                        <OffensivePowersOverlay 
                          activePowers={[previewPower.id]} 
                          onPowerEnd={() => {}} 
                          theme={theme}
                          performanceMode={true}
                        />
                      )}
                      {previewPower.type === 'interactive' && (
                        <InteractivePowersOverlay 
                          activePowers={[previewPower.id]} 
                          onPowerEnd={() => {}} 
                          theme={theme}
                          performanceMode={true}
                        />
                      )}
                      {previewPower.type === 'advantage' && (
                        <div className="flex flex-col items-center gap-4">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                            className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg"
                          >
                            {React.createElement(ICON_MAP[previewPower.icon] || Zap, { className: "w-8 h-8" })}
                          </motion.div>
                          <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Advantage Power</p>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-[10px] font-black text-white/50 uppercase tracking-widest">
                      Preview Mode
                    </div>
                  </div>

                  <h4 className="text-xl font-black text-white uppercase italic mb-2">{previewPower.name}</h4>
                  <p className="text-slate-400 text-sm mb-6">{previewPower.description}</p>
                  
                  <button
                    onClick={() => {
                      onUsePower(previewPower);
                      onClose();
                    }}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                  >
                    Use This Power
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Animated Background Glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 via-transparent to-rose-500/5 animate-pulse" />
            
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="relative">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white leading-none">
                    Obtained Powers
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1 w-12 bg-indigo-500 rounded-full" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Choose your advantage</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90 group"
                >
                  <X className="w-6 h-6 text-slate-400 group-hover:text-rose-500 transition-colors" />
                </button>
              </div>

              {filteredPowers.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="relative w-24 h-24 mx-auto">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                      transition={{ repeat: Infinity, duration: 2, type: "tween" }}
                      className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-full blur-xl"
                    />
                    <div className="relative w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center border-4 border-slate-100 dark:border-slate-700">
                      <Zap className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                      {powers.length > 0 ? 'No Compatible Powers' : 'Empty Inventory'}
                    </p>
                    <p className="text-xs font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                      {powers.length > 0 ? 'These powers don\'t work on this question type!' : 'Answer correctly to earn powers!'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredPowers.map((power, idx) => {
                    const Icon = ICON_MAP[power.icon] || Zap;
                    const isOffensive = power.type === 'offensive';
                    const isInteractive = power.type === 'interactive';
                    
                    return (
                      <motion.div
                        key={`${power.id}-${idx}`}
                        initial={{ opacity: 0, x: -20, rotateY: -10 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ 
                          scale: 1.02, 
                          x: 8,
                          rotateY: 5,
                          rotateX: -2,
                          z: 20
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onUsePower(power);
                          onClose();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onUsePower(power);
                            onClose();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`group relative flex items-center gap-5 p-5 rounded-3xl border-2 transition-all text-left overflow-hidden perspective-1000 cursor-pointer ${
                          isOffensive 
                            ? 'border-rose-100 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-900/10 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20' 
                            : isInteractive
                            ? 'border-purple-100 bg-purple-50/50 dark:border-purple-900/30 dark:bg-purple-900/10 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                            : 'border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-900/10 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                        }`}
                      >
                        {/* Scanning Light Beam */}
                        <motion.div
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className={`absolute inset-0 w-1/3 skew-x-12 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent`}
                        />

                        {/* Hover Glow */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r ${
                          isOffensive ? 'from-rose-500 to-transparent' : isInteractive ? 'from-purple-500 to-transparent' : 'from-indigo-500 to-transparent'
                        }`} />

                        <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-6 ${
                          isOffensive 
                            ? 'bg-rose-500 text-white shadow-[0_8px_24px_-8px_rgba(244,63,94,0.6)]' 
                            : isInteractive
                            ? 'bg-purple-500 text-white shadow-[0_8px_24px_-8px_rgba(168,85,247,0.6)]'
                            : 'bg-indigo-500 text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)]'
                        }`}>
                          <Icon className="w-7 h-7" />
                          <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
                        </div>

                        <div className="flex-1 min-w-0 relative">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-black text-base uppercase tracking-tight text-slate-900 dark:text-white truncate">
                              {power.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewPower(power);
                                }}
                                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors group/preview"
                                title="Preview Power"
                              >
                                <Play className="w-3.5 h-3.5 text-slate-400 group-hover/preview:text-indigo-500" />
                              </button>
                              <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shrink-0 ${
                                isOffensive 
                                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' 
                                  : isInteractive
                                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400'
                                  : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400'
                              }`}>
                                {power.type}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {power.description}
                          </p>
                        </div>
                        
                        {/* Animated Arrow */}
                        <div className={`opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 ${
                          isOffensive ? 'text-rose-500' : isInteractive ? 'text-purple-500' : 'text-indigo-500'
                        }`}>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Bottom Accent with Animation */}
            <div className="relative h-2 w-full overflow-hidden">
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className={`absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent z-10`}
              />
              <div className={`absolute inset-0 ${theme.visualStyle === 'tadc' ? 'bg-red-600' : 'bg-indigo-600'}`} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

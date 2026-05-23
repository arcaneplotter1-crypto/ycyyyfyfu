import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Zap, Check, Play, Clock, Info, BrainCircuit, Dices, 
  Hourglass, Sparkles, ShieldCheck, Wand2, Eye, Cpu, 
  Paintbrush, FlipHorizontal, CloudFog, Waves, Tv, 
  FlipVertical, Vibrate, Rainbow, Snowflake, ScanLine, 
  BatteryLow, MousePointerClick, Crosshair, Disc, Bug, 
  Grid3X3, Sliders, LayoutGrid, Ghost, Anchor, 
  Thermometer, Film, Wine, CupSoda 
} from 'lucide-react';
import { Power, ExamSettings, AppTheme } from '../../types';
import { POWERS } from '../../constants/powers';

interface PowerSettingsModalProps {
  settings: ExamSettings;
  updateSettings: (s: Partial<ExamSettings>) => void;
  onClose: () => void;
  theme: AppTheme;
}

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

export const PowerSettingsModal: React.FC<PowerSettingsModalProps> = ({ settings, updateSettings, onClose, theme }) => {
  const [previewPower, setPreviewPower] = useState<string | null>(null);

  const allowedPowerIds = settings?.allowedPowerIds || POWERS.map(p => p.id);
  const powerDurations = settings?.powerDurations || {
    glitch: 5000,
    ink_splash: 5000,
    mirror: 5000,
    fog: 5000,
    earthquake: 5000,
    static_noise: 5000,
    upside_down: 5000,
    vibration: 5000,
    color_shift: 5000,
    pixelate: 5000,
    blackout: 5000,
    gravity: 5000,
    thermal: 5000,
    old_movie: 5000,
    drunken: 5000,
    juice: 45000
  };

  const togglePower = (id: string) => {
    const newAllowed = allowedPowerIds.includes(id)
      ? allowedPowerIds.filter(pid => pid !== id)
      : [...allowedPowerIds, id];
    updateSettings({ allowedPowerIds: newAllowed });
  };

  const updateDuration = (id: string, duration: number) => {
    updateSettings({
      powerDurations: { ...powerDurations, [id]: duration }
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md group-[.visual-fluid]/fluid:bg-black/60 group-[.visual-fluid]/fluid:backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none group-[.visual-fluid]/fluid:!backdrop-blur-none group-[.visual-fluid]/fluid:fluid-progress-panel group-[.visual-fluid]/fluid:!p-8"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!p-4 group-[.visual-fluid]/fluid:!-mx-8 group-[.visual-fluid]/fluid:!-mt-8 group-[.visual-fluid]/fluid:!mb-4 group-[.visual-fluid]/fluid:!border-b group-[.visual-fluid]/fluid:!border-white/10 group-[.visual-fluid]/fluid:!rounded-t-[2.5rem] group-[.visual-fluid]/fluid:!sticky">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/20">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-[.visual-fluid]/fluid:!text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200 group-[.visual-fluid]/fluid:!text-white">Power System</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-[.visual-fluid]/fluid:!text-white/50">Customize Abilities & Effects</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!text-white">
            <X className="w-5 h-5 text-slate-400 group-[.visual-fluid]/fluid:!text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 group-[.visual-fluid]/fluid:!px-0 group-[.visual-fluid]/fluid:!py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {POWERS.map((power) => {
              const Icon = ICON_MAP[power.icon] || Zap;
              const isAllowed = allowedPowerIds.includes(power.id);
              const hasDuration = power.type === 'offensive';

              return (
                <div 
                  key={power.id}
                  className={`p-4 rounded-3xl border-2 transition-all group/power-item ${
                    isAllowed 
                      ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 shadow-lg shadow-indigo-500/5' 
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60'
                  } group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-white/20 group-[.visual-fluid]/fluid:!shadow-none group-[.visual-fluid]/fluid:!opacity-100`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isAllowed ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'} group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/20 group-[.visual-fluid]/fluid:!text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-800 dark:text-slate-200 group-[.visual-fluid]/fluid:!text-white">{power.name}</h4>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${power.type === 'advantage' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'} group-[.visual-fluid]/fluid:!bg-white/20 group-[.visual-fluid]/fluid:!text-white`}>
                          {power.type}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => togglePower(power.id)}
                      className={`w-10 h-6 rounded-full transition-all relative ${isAllowed ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'} group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/20 group-[.visual-fluid]/fluid:!shadow-none`}
                    >
                      <motion.div 
                        animate={{ x: isAllowed ? 18 : 2 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm group-[.visual-fluid]/fluid:!bg-white"
                      />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed group-[.visual-fluid]/fluid:!text-white/60">
                    {power.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setPreviewPower(power.id)}
                      className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!text-white group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/10"
                    >
                      <Play className="w-3 h-3" />
                      Preview
                    </button>
                    
                    {hasDuration && isAllowed && (
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/10">
                        <Clock className="w-3 h-3 text-slate-400 group-[.visual-fluid]/fluid:!text-white/50" />
                        <input 
                          type="number"
                          value={powerDurations[power.id] / 1000}
                          onChange={(e) => updateDuration(power.id, parseInt(e.target.value) * 1000)}
                          className="w-8 bg-transparent text-[10px] font-black text-slate-700 dark:text-slate-200 outline-none group-[.visual-fluid]/fluid:!text-white"
                        />
                        <span className="text-[8px] font-bold text-slate-400 uppercase group-[.visual-fluid]/fluid:!text-white/40">sec</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!p-4 group-[.visual-fluid]/fluid:!-mx-8 group-[.visual-fluid]/fluid:!-mb-8 group-[.visual-fluid]/fluid:!mt-4 group-[.visual-fluid]/fluid:!border-t group-[.visual-fluid]/fluid:!border-white/10 group-[.visual-fluid]/fluid:!rounded-b-[2.5rem]">
          <div className="flex items-center gap-2 text-slate-400 group-[.visual-fluid]/fluid:!text-white/40">
            <Info className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Changes apply to new exams</span>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-[0_4px_0_rgb(49,46,129)] hover:shadow-[0_2px_0_rgb(49,46,129)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!text-white group-[.visual-fluid]/fluid:!border group-[.visual-fluid]/fluid:!border-white/20 group-[.visual-fluid]/fluid:!shadow-none group-[.visual-fluid]/fluid:!hover:bg-white/20"
          >
            Save Settings
          </button>
        </div>
      </motion.div>

      {/* Preview Overlay */}
      <AnimatePresence>
        {previewPower && (
          <PowerPreviewOverlay 
            powerId={previewPower} 
            onClose={() => setPreviewPower(null)} 
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const PowerPreviewOverlay: React.FC<{ powerId: string; onClose: () => void; theme: AppTheme }> = ({ powerId, onClose, theme }) => {
  // We'll reuse the OffensivePowersOverlay logic or similar for preview
  // For now, let's just show a simple notification and the effect for 3 seconds
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(false);
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-4 border-indigo-500 flex flex-col items-center gap-4"
        >
          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl">
            <Zap className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-200">Previewing Power</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Observe the effect below</p>
        </motion.div>
      </div>

      {/* Re-implementing effects for preview specifically */}
      {powerId === 'glitch' && (
        <div className="absolute inset-0 z-[202] mix-blend-overlay opacity-50">
           <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
           <div className="absolute inset-0 bg-blue-500/10 animate-pulse" style={{ animationDelay: '0.1s' }} />
        </div>
      )}

      {powerId === 'ink_splash' && (
        <div className="absolute inset-0 z-[202]">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              className="absolute w-64 h-64 bg-slate-900 rounded-full blur-xl"
              style={{ left: `${20 + i * 15}%`, top: `${30 + (i % 2) * 20}%` }}
            />
          ))}
        </div>
      )}

      {powerId === 'fog' && (
        <div className="absolute inset-0 z-[202] bg-slate-200/60 backdrop-blur-md" />
      )}

      {powerId === 'mirror' && (
        <style dangerouslySetInnerHTML={{ __html: `
          body { transform: scaleX(-1); }
        `}} />
      )}

      {powerId === 'earthquake' && (
        <style dangerouslySetInnerHTML={{ __html: `
          body { animation: earthquake 0.1s infinite; }
          @keyframes earthquake {
            0% { transform: translate(0, 0); }
            25% { transform: translate(-10px, 10px); }
            50% { transform: translate(10px, -10px); }
            75% { transform: translate(-10px, -10px); }
            100% { transform: translate(10px, 10px); }
          }
        `}} />
      )}

      {powerId === 'static_noise' && (
        <div className="absolute inset-0 z-[202] bg-gray-500/10 opacity-30 animate-pulse" />
      )}

      {powerId === 'upside_down' && (
        <style dangerouslySetInnerHTML={{ __html: `
          body { transform: scaleY(-1); }
        `}} />
      )}

      {powerId === 'vibration' && (
        <style dangerouslySetInnerHTML={{ __html: `
          body { animation: vibrate 0.05s infinite; }
          @keyframes vibrate {
            0% { transform: translate(0); }
            25% { transform: translate(-2px, 2px); }
            50% { transform: translate(2px, -2px); }
            75% { transform: translate(-2px, -2px); }
            100% { transform: translate(2px, 2px); }
          }
        `}} />
      )}

      {powerId === 'color_shift' && (
        <style dangerouslySetInnerHTML={{ __html: `
          body { animation: colorShiftFilter 3s infinite linear; }
          @keyframes colorShiftFilter {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
          }
        `}} />
      )}

      {powerId === 'pixelate' && (
        <style dangerouslySetInnerHTML={{ __html: `
          body { filter: blur(2px) contrast(120%) brightness(110%); image-rendering: pixelated; }
        `}} />
      )}

      {powerId === 'blackout' && (
        <motion.div
          animate={{ opacity: [0, 1, 0, 0, 1, 0, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity, times: [0, 0.05, 0.1, 0.5, 0.55, 0.6, 0.9, 1] }}
          className="absolute inset-0 z-[202] bg-black"
        />
      )}

      {powerId === 'gravity' && (
        <style dangerouslySetInnerHTML={{ __html: `
          body { animation: gravityShift 3s infinite ease-in-out; }
          @keyframes gravityShift {
            0% { transform: translateY(0); }
            50% { transform: translateY(20px); }
            100% { transform: translateY(0); }
          }
        `}} />
      )}

      {powerId === 'thermal' && (
        <style dangerouslySetInnerHTML={{ __html: `
          body { filter: invert(1) hue-rotate(180deg) contrast(1.5) brightness(1.2); }
        `}} />
      )}

      {powerId === 'old_movie' && (
        <div className="absolute inset-0 z-[202] bg-amber-900/20">
          <style dangerouslySetInnerHTML={{ __html: `
            body { filter: sepia(0.8) contrast(1.2) brightness(0.9); animation: jitter 0.2s infinite; }
            @keyframes jitter {
              0% { transform: translate(0,0); }
              20% { transform: translate(-1px, 1px); }
              40% { transform: translate(1px, -1px); }
              60% { transform: translate(-1px, -1px); }
              80% { transform: translate(1px, 1px); }
              100% { transform: translate(0,0); }
            }
          `}} />
        </div>
      )}

      {powerId === 'drunken' && (
        <style dangerouslySetInnerHTML={{ __html: `
          body { animation: drunkenSway 4s infinite ease-in-out; }
          @keyframes drunkenSway {
            0% { transform: rotate(0deg) translate(0, 0); }
            25% { transform: rotate(1.5deg) translate(5px, 5px); }
            50% { transform: rotate(-1.5deg) translate(-5px, 10px); }
            75% { transform: rotate(1deg) translate(8px, -5px); }
            100% { transform: rotate(0deg) translate(0, 0); }
          }
        `}} />
      )}

      {powerId === 'click_challenge' && (
        <div className="absolute inset-0 z-[202] bg-slate-950/80 flex items-center justify-center">
          <div className="text-white text-center">
            <MousePointerClick className="w-16 h-16 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-black italic">CLICK CHALLENGE PREVIEW</h3>
          </div>
        </div>
      )}

      {powerId === 'circle_hunt' && (
        <div className="absolute inset-0 z-[202] bg-slate-950/80 flex items-center justify-center">
          <div className="text-white text-center">
            <Crosshair className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-black italic">CIRCLE HUNT PREVIEW</h3>
          </div>
        </div>
      )}

      {powerId === 'spin_wheel' && (
        <div className="absolute inset-0 z-[202] bg-slate-950/80 flex items-center justify-center">
          <div className="text-white text-center">
            <Disc className="w-16 h-16 mx-auto mb-4 animate-spin" />
            <h3 className="text-2xl font-black italic">SPIN WHEEL PREVIEW</h3>
          </div>
        </div>
      )}

      {powerId === 'absolutely_smart' && (
        <div className="absolute inset-0 z-[202] border-[20px] border-yellow-400/50 animate-pulse" />
      )}

      {powerId === 'fifty_fifty' && (
        <div className="absolute inset-0 z-[202] flex items-center justify-center">
           <div className="w-full h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)]" />
        </div>
      )}

      {powerId === 'juice' && (
        <div className="absolute inset-0 z-[202] bg-orange-500/20 flex items-center justify-center">
          <div className="text-white text-center">
            <CupSoda className="w-16 h-16 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">JUICE BOX PREVIEW</h3>
          </div>
        </div>
      )}
    </div>
  );
};

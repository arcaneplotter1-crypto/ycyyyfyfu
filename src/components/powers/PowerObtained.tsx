import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, BrainCircuit, Dices, Hourglass, Sparkles, 
  ShieldCheck, Wand2, Eye, Cpu, Paintbrush, FlipHorizontal, 
  CloudFog, Waves, Tv, FlipVertical, Vibrate, Rainbow, 
  Snowflake, ScanLine, BatteryLow, MousePointerClick, 
  Crosshair, Disc, Bug, Grid3X3, Sliders, LayoutGrid, 
  Ghost, Anchor, Thermometer, Film, Wine 
} from 'lucide-react';
import { Power, AppTheme } from '../../types';

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
  Wine
};

interface PowerObtainedProps {
  power: Power | null;
  onClose: () => void;
  theme: AppTheme;
}

export const PowerObtained: React.FC<PowerObtainedProps> = ({ power, onClose, theme }) => {
  useEffect(() => {
    if (power) {
      const timer = setTimeout(onClose, 1500); // Shorter duration
      return () => clearTimeout(timer);
    }
  }, [power, onClose]);

  return (
    <AnimatePresence mode="wait">
      {power && (
        <motion.div
          key={power.id}
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8, filter: 'blur(10px)' }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
        >
          <div className="relative">
            <div className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl ${
              power.type === 'offensive' 
                ? 'bg-rose-500 border-rose-400 text-white' 
                : power.type === 'interactive'
                ? 'bg-purple-600 border-purple-400 text-white'
                : 'bg-amber-500 border-amber-400 text-white'
            }`}>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                {(() => {
                  const Icon = ICON_MAP[power.icon] || Zap;
                  return <Icon className="w-5 h-5" />;
                })()}
              </div>
              
              <div className="flex flex-col">
                <p className="text-[7px] font-black uppercase tracking-[0.2em] opacity-70 leading-none">Power Obtained</p>
                <h4 className="text-sm font-black uppercase italic tracking-tight mt-0.5">{power.name}</h4>
              </div>

              {/* Minimal Particle Burst */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ 
                      x: (Math.random() - 0.5) * 80, 
                      y: (Math.random() - 0.5) * 80, 
                      opacity: 0,
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-white/40"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

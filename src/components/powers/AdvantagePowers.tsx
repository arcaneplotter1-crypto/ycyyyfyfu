import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Clock, Shield, Zap, Info, Sun } from 'lucide-react';

interface AdvantagePowersProps {
  isAbsolutelySmartActive: boolean;
  correctAnswer?: string;
  currentOptions?: string[];
}

export const AbsolutelySmartEffect: React.FC<AdvantagePowersProps> = ({ isAbsolutelySmartActive, correctAnswer, currentOptions }) => {
  if (!isAbsolutelySmartActive) return null;

  return (
    <div className="absolute top-4 right-4 z-20">
      <motion.div
        initial={{ scale: 0, rotate: -45, filter: 'blur(10px)' }}
        animate={{ scale: 1, rotate: 0, filter: 'blur(0px)' }}
        className="relative group"
      >
        {/* Brain Wave Pulse */}
        <motion.div
          animate={{ 
            scale: [1, 2.5],
            opacity: [0.6, 0]
          }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-yellow-400 rounded-full blur-xl"
        />

        {/* Glow Effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.6, 0.9, 0.6]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-yellow-400 rounded-full blur-md"
        />
        
        <div className="relative bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 text-black p-2.5 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.6)] border-2 border-white flex items-center justify-center">
          <Brain className="w-6 h-6 animate-pulse" />
          
          {/* Orbiting Particles */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-200 rounded-full shadow-[0_0_5px_white]" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export const TimeWarpEffect: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.5 }}
          animate={{ opacity: 1, y: -100, scale: 1.5 }}
          exit={{ opacity: 0, scale: 2 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-blue-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-3">
            <Clock className="w-8 h-8 animate-spin-slow" />
            <span className="font-black text-2xl">+30s</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ShieldEffect: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="absolute top-4 left-4 z-20">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        className="relative"
      >
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-blue-400 rounded-full blur-xl"
        />
        <div className="relative bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white/50">
          <Shield className="w-6 h-6" />
        </div>
      </motion.div>
    </div>
  );
};

export const AutoCompleteEffect: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="absolute top-20 right-4 z-20">
      <motion.div
        animate={{ 
          y: [0, -5, 0],
          filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)']
        }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-2xl shadow-lg border-2 border-white/30 flex items-center gap-2"
      >
        <Zap className="w-4 h-4 fill-current" />
        <span className="text-xs font-black uppercase tracking-tighter">Auto-Complete Ready</span>
      </motion.div>
    </div>
  );
};

export const ClarityEffect: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1 }}
          className="fixed inset-0 bg-white z-[200] pointer-events-none flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-64 h-64 bg-yellow-400 rounded-full blur-3xl"
          />
          <div className="relative flex flex-col items-center gap-4">
            <Sun className="w-32 h-32 text-yellow-500 animate-spin-slow" />
            <span className="text-4xl font-black text-slate-900 uppercase tracking-widest italic">CLARITY!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

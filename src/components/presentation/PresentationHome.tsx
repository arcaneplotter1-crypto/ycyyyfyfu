import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, GitMerge, LayoutTemplate } from 'lucide-react';

interface PresentationHomeProps {
  onStart: () => void;
  onStartMindmap: () => void;
  onStartBlocks: () => void;
}

export const PresentationHome: React.FC<PresentationHomeProps> = ({ onStart, onStartMindmap, onStartBlocks }) => {
  const [stickerText, setStickerText] = useState('still under development');

  useEffect(() => {
    const timer = setInterval(() => {
      setStickerText((prev) => 
        prev === 'still under development' 
          ? 'i got bored' 
          : 'still under development'
      );
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl text-center relative"
      >
        <div className="relative">
          <h1 className="text-5xl md:text-7xl font-black mb-12 tracking-tight drop-shadow-sm flex flex-wrap justify-center items-center gap-x-4">
            <span>Presen<span className="opacity-20">tation</span></span>
            <span className="text-indigo-600">Mode</span>
          </h1>
          
          <motion.div
            initial={{ rotate: -15, scale: 0.9, opacity: 0 }}
            animate={{ rotate: -12, scale: 1, opacity: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[240px] h-14 md:h-16 bg-[#E6B89C] border-b-2 border-r-2 border-black/10 rounded-sm shadow-xl z-10 cursor-default select-none pointer-events-none origin-center flex items-center justify-center overflow-hidden"
            style={{
              backgroundImage: `radial-gradient(#C5987C 1.5px, transparent 0)`,
              backgroundSize: '10px 10px',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05), 4px 6px 12px rgba(0,0,0,0.1)'
            }}
          >
            {/* Bandage texture overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
            
            {/* Center gauze pad area */}
            <div className="absolute inset-y-1 inset-x-16 bg-[#F5D5C0] border-x border-black/5 shadow-inner" />

            <AnimatePresence mode="wait">
              <motion.span
                key={stickerText}
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(4px)' }}
                transition={{ duration: 0.4 }}
                className="relative text-xs md:text-sm font-black text-[#5C4033] uppercase tracking-tighter block text-center px-4 mix-blend-multiply"
              >
                {stickerText}
              </motion.span>
            </AnimatePresence>
            
            {/* Bandage sticky ends detail */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/5" />
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-black/5" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 justify-center items-center gap-6 w-full max-w-4xl mx-auto mt-6">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-4 px-6 py-5 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-[2rem] shadow-[0_8px_0_var(--color-indigo-950)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all w-full"
          >
            <Play className="w-5 h-5 fill-current" />
            Slideshow Mode
            
            <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={onStartBlocks}
            className="group relative inline-flex items-center justify-center gap-4 px-6 py-5 bg-indigo-950 text-white font-black uppercase tracking-widest text-xs rounded-[2rem] shadow-[0_8px_0_#11112b] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all w-full"
          >
            <LayoutTemplate className="w-5 h-5 animate-pulse" />
            Slides
            
            <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={onStartMindmap}
            className="group relative inline-flex items-center justify-center gap-4 px-6 py-5 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-[2rem] shadow-[0_8px_0_#064e3b] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all w-full"
          >
            <GitMerge className="w-5 h-5" />
            Mindmap Mode
            
            <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

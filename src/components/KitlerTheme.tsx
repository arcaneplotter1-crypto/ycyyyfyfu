import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const FighterJet: React.FC<{ top: string; delay: number; duration: number; scale: number }> = ({ top, delay, duration, scale }) => (
  <motion.div
    className="absolute left-[-100px] opacity-20 grayscale brightness-0"
    style={{ top, scale }}
    initial={{ x: '-10vw', rotate: 90 }}
    animate={{ x: '110vw' }}
    transition={{ 
      duration, 
      delay, 
      repeat: Infinity, 
      ease: "linear" 
    }}
  >
    <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
      <path d="M 50 0 L 58 35 L 95 65 L 58 70 L 58 90 L 42 90 L 42 70 L 5 65 L 42 35 Z" />
    </svg>
  </motion.div>
);

export const KitlerBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#FF0000] pointer-events-none overflow-hidden flex items-center justify-center z-[-1]">
      {/* Fighter Jets */}
      <FighterJet top="15%" delay={0} duration={15} scale={0.8} />
      <FighterJet top="40%" delay={5} duration={12} scale={1.2} />
      <FighterJet top="70%" delay={2} duration={18} scale={0.6} />
      <FighterJet top="85%" delay={10} duration={14} scale={1} />

      {/* Large spinning pattern */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.img 
          src="https://image2url.com/r2/default/images/1775604583047-869eb01c-a72f-474e-8a9c-b93870ddebee.png"
          alt="Background Pattern"
          className="w-[300vmax] h-[300vmax] max-w-none opacity-30 grayscale"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          referrerPolicy="no-referrer"
        />
      </div>
      
      {/* Central White Circle with Image */}
      <div 
        className="relative w-[60vmin] h-[60vmin] min-w-[280px] min-h-[280px] max-w-[600px] max-h-[600px] rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.5)] border-[12px] border-black z-[20]"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <img 
          src="https://image2url.com/r2/default/images/1775604583047-869eb01c-a72f-474e-8a9c-b93870ddebee.png"
          alt="Central Icon"
          className="w-[70%] h-[70%] object-contain grayscale"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      
      {/* Debug text - will be hidden but helps verify rendering in dev tools */}
      <span className="sr-only">Kitler Background Active</span>
    </div>
  );
};

export const KitlerLogoMark: React.FC<{ isHome: boolean }> = ({ isHome }) => {
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);

  if (!isHome) return null;

  const handleLogoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent React bubbling
    e.nativeEvent.stopPropagation(); // Prevent native bubbling to window
    e.nativeEvent.stopImmediatePropagation(); // Prevent other listeners on the same level
    
    const newClick = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY
    };
    setClicks(prev => [...prev, newClick]);
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== newClick.id));
    }, 1000);
  };

  return (
    <>
      {/* Theme Logo Mark - Bottom Right */}
      <div 
        className="fixed bottom-8 right-8 w-32 h-32 md:w-48 md:h-48 pointer-events-auto cursor-pointer group/logo kitler-logo-mark z-[9999]"
        onClick={handleLogoClick}
      >
        <img 
          src="https://image2url.com/r2/default/images/1775608225721-067531f7-5a3a-49a2-a40e-7bfe194b8ad7.png"
          alt="Theme Logo"
          className="w-full h-full object-contain transition-transform group-active/logo:scale-90"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Custom Floating Text Animation */}
      <AnimatePresence>
        {clicks.map(click => (
          <motion.div
            key={click.id}
            initial={{ opacity: 0, y: 0, x: "-50%" }}
            animate={{ opacity: [0, 1, 1, 0], y: -100 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="fixed z-[10000] pointer-events-none text-black font-black text-4xl uppercase italic"
            style={{ 
              left: click.x, 
              top: click.y,
              textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 0 4px 8px rgba(0,0,0,0.8)'
            }}
          >
            Heil
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
};

export interface KitlerStyles {
  card: string;
  button: string;
  text: string;
  accent: string;
  border: string;
  input: string;
  header: string;
  badge: string;
  icon: string;
  glow: string;
}

export const getKitlerStyles = (isDark: boolean): KitlerStyles => {
  return {
    card: "bg-white dark:bg-black border-[6px] border-black dark:border-white rounded-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all duration-300",
    button: "bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest px-8 py-4 transition-all duration-200",
    text: "text-black dark:text-white font-black uppercase tracking-tighter",
    accent: "bg-black dark:bg-white",
    border: "border-black dark:border-white",
    input: "bg-white dark:bg-black border-4 border-black dark:border-white text-black dark:text-white rounded-none focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-bold",
    header: "bg-black dark:bg-white text-white dark:text-black p-6 border-b-8 border-white dark:border-black",
    badge: "bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest",
    icon: "text-black dark:text-white",
    glow: "shadow-[0_0_30px_rgba(0,0,0,0.3)] dark:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
  };
};

export const KitlerText: React.FC<{ children: React.ReactNode; className?: string; onRed?: boolean }> = ({ children, className = "", onRed = false }) => {
  const outlineStyle = {
    textShadow: onRed 
      ? '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' 
      : 'inherit' // Will inherit from global kitler.css rules
  };

  return (
    <span 
      className={`${onRed ? 'text-white' : 'text-black dark:text-white'} font-black uppercase tracking-tighter ${className}`}
      style={outlineStyle}
    >
      {children}
    </span>
  );
};

export const KitlerUI: React.FC<{ children: React.ReactNode; isDark: boolean }> = ({ children, isDark }) => {
  const styles = getKitlerStyles(isDark);
  return (
    <div className={`kitler-theme-container min-h-screen min-h-[100dvh] ${styles.text}`}>
      {children}
    </div>
  );
};

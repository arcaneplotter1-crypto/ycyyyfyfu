import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Clock, Sparkles, Zap, Star, Heart, Ghost, Bird, User, Flame, Trophy, AlertCircle } from 'lucide-react';
import { VisualStyle, AccentColor } from '../types';

interface FeedbackNotificationProps {
  status: 'correct' | 'incorrect' | 'timeout' | 'none';
  theme: VisualStyle;
  accent: AccentColor;
  show: boolean;
}

export const FeedbackNotification: React.FC<FeedbackNotificationProps> = ({ status, theme, accent, show }) => {
  if (status === 'none') return null;

  const isCorrect = status === 'correct';
  const isTimeout = status === 'timeout';

  const getAccentColor = () => {
    switch (accent) {
      case 'indigo': return '#4f46e5';
      case 'emerald': return '#10b981';
      case 'rose': return '#f43f5e';
      case 'amber': return '#f59e0b';
      case 'cyan': return '#06b6d4';
      case 'lime': return '#84cc16';
      case 'brutal-red': return '#D32F2F';
      case 'brutal-blue': return '#1976D2';
      case 'brutal-yellow': return '#FBC02D';
      case 'brutal-green': return '#388E3C';
      case 'creeper-green': return '#5eed5e';
      case 'enderman-purple': return '#800080';
      case 'tadc-kinger': return '#6b21a8';
      case 'tadc-caine': return '#dc2626';
      case 'duck-yellow': return '#FFD700';
      case 'duck-orange': return '#FF8C00';
      case 'duck-blue': return '#00BFFF';
      case 'duck-white': return '#F0F8FF';
      case 'undertale-red': return '#ff0000';
      case 'undertale-blue': return '#00ffff';
      case 'saidi-white': return '#f5f5dc';
      case 'saidi-cream': return '#fff8e1';
      case 'saidi-dark': return '#1a1a1a';
      case 'saidi-gold': return '#ffd700';
      case 'arcane-violet': return '#8a2be2';
      case 'arcane-red': return '#ef4444';
      case 'arcane-blue': return '#3b82f6';
      case 'arcane-gold': return '#f59e0b';
      case 'arcane-green': return '#10b981';
      case 'arcane-neon-pink': return '#ff00ff';
      case 'arcane-plasma-cyan': return '#00ffff';
      case 'arcane-void-purple': return '#4a00e0';
      case 'arcane-solar-flare': return '#ff3300';
      case 'virus-marburg': return '#dc2626';
      case 'virus-rabies': return '#22c55e';
      case 'virus-hiv': return '#d946ef';
      case 'virus-smallpox': return '#f59e0b';
      case 'virus-influenza': return '#06b6d4';
      case 'finn-blue': return '#00A2E8';
      case 'jake-yellow': return '#FFC90E';
      case 'ultimate-cosmic': return '#8b5cf6';
      case 'ultimate-easter': return '#fbcfe8';
      case 'superhero-spiderman': return '#E23636';
      case 'superhero-batman': return '#1A1A1A';
      case 'superhero-superman': return '#005BBF';
      default: return '#6366f1';
    }
  };

  const accentColor = getAccentColor();

  const getBadgeStyles = () => {
    const base = "absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-2 sm:px-8 sm:py-3 flex items-center gap-2 sm:gap-3 transition-all";
    
    // Special accent logic
    const isSpecialAccent = accent.includes('tadc') || accent.includes('arcane') || accent.includes('ultimate') || accent.includes('superhero');
    const accentBorder = isSpecialAccent ? `border-${accentColor}` : '';
    
    switch (theme) {
      case 'ultimate':
        return `${base} rounded-2xl bg-black/80 backdrop-blur-xl border-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] text-white font-black italic tracking-[0.3em] uppercase`;
      case 'brutalist':
        return `${base} rounded-none ${isCorrect ? 'bg-[#00ff00] text-black' : isTimeout ? 'bg-[#ffff00] text-black' : 'bg-[#ff00ff] text-black'} border-4 border-black shadow-[8px_8px_0_0_#000] font-black uppercase tracking-widest text-xs sm:text-lg`;
      case 'game-minecraft':
        return `${base} rounded-none bg-[#3c3c3c] border-4 border-black shadow-[4px_4px_0_0_#000] text-white font-pixel text-[10px] sm:text-xs uppercase`;
      case 'tadc':
        return `${base} rounded-xl bg-white text-black border-4 border-black shadow-[4px_4px_0_0_#000] font-black italic tracking-tighter text-sm sm:text-lg animate-tadc-glitch`;
      case 'adventure-time':
        return `${base} rounded-[2rem] bg-white text-indigo-700 border-4 border-indigo-700 shadow-[0_6px_0_0_#4338ca] font-black italic text-sm sm:text-lg tracking-tight`;
      case 'duck':
        return `${base} rounded-full ${isCorrect ? 'bg-yellow-400 text-black border-yellow-600' : 'bg-blue-500 text-white border-blue-700'} shadow-lg font-black uppercase tracking-widest text-xs sm:text-sm`;
      case 'undertale':
        return `${base} rounded-none bg-black text-white border-2 border-white font-pixel text-[10px] sm:text-xs tracking-widest`;
      case 'saidi':
        return `${base} rounded-xl bg-white text-amber-900 border-2 border-amber-200 shadow-xl font-serif italic text-sm sm:text-base tracking-wide`;
      case 'arcane':
      case 'virus':
        return `${base} rounded-lg bg-slate-900/90 backdrop-blur-md border-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] text-indigo-100 font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs`;
      case 'superhero':
        return `${base} rounded-none bg-yellow-400 text-black border-4 border-black shadow-[6px_6px_0_0_#000] font-black italic uppercase tracking-tighter text-sm sm:text-xl -rotate-2`;
      case 'minimal':
        return `${base} rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm font-medium text-[10px] sm:text-xs tracking-widest uppercase`;
      case 'hollow-knight':
        return `${base} rounded-none bg-black text-white border-2 border-slate-500 shadow-[0_0_20px_rgba(0,0,0,0.8)] font-serif italic text-sm sm:text-lg tracking-widest uppercase px-12 py-4`;
      case 'modern':
      default:
        return `${base} rounded-2xl ${isCorrect ? 'bg-emerald-50/90 dark:bg-emerald-950/90' : isTimeout ? 'bg-amber-50/90 dark:bg-amber-950/90' : 'bg-rose-50/90 dark:bg-rose-950/90'} backdrop-blur-xl text-slate-900 dark:text-white border-2 ${isCorrect ? 'border-emerald-500/30' : isTimeout ? 'border-amber-500/30' : 'border-rose-500/30'} shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-black uppercase tracking-[0.2em] text-xs sm:text-sm`;
    }
  };

  const getIcon = () => {
    const iconSize = "w-5 h-5 sm:w-6 sm:h-6";
    if (isTimeout) return <Clock className={iconSize} />;
    
    switch (theme) {
      case 'tadc':
        if (accent === 'tadc-kinger') return isCorrect ? <Bird className={iconSize} /> : <Zap className={iconSize} />; // Kinger bird/glitch
        if (accent === 'tadc-caine') return isCorrect ? <Star className={iconSize} /> : <Flame className={iconSize} />; // Caine star/flame
        return isCorrect ? <CheckCircle2 className={iconSize} /> : <XCircle className={iconSize} />;
      case 'ultimate': return isCorrect ? <Sparkles className={iconSize} /> : <Zap className={iconSize} />;
      case 'game-minecraft': return isCorrect ? <Trophy className={iconSize} /> : <AlertCircle className={iconSize} />;
      case 'undertale': return <Heart className={`${iconSize} ${isCorrect ? 'fill-red-500 text-red-500' : 'fill-slate-700 text-slate-700'}`} />;
      case 'duck': return <Bird className={iconSize} />;
      case 'adventure-time': return isCorrect ? <Star className={iconSize} /> : <XCircle className={iconSize} />;
      case 'superhero': return isCorrect ? <Zap className={iconSize} /> : <XCircle className={iconSize} />;
      case 'hollow-knight': return isCorrect ? <Sparkles className={iconSize} /> : <Ghost className={iconSize} />;
      case 'modern': return isCorrect ? <CheckCircle2 className={`${iconSize} text-emerald-500`} /> : <XCircle className={`${iconSize} text-rose-500`} />;
      default: return isCorrect ? <CheckCircle2 className={iconSize} /> : <XCircle className={iconSize} />;
    }
  };

  const getLabel = () => {
    if (isTimeout) return 'TIMED OUT';
    
    switch (theme) {
      case 'ultimate': return isCorrect ? 'ASCENDED' : 'FRACTURED';
      case 'game-minecraft': return isCorrect ? 'LEVEL UP!' : 'GAME OVER';
      case 'undertale': return isCorrect ? 'DETERMINATION' : 'STAY DETERMINED';
      case 'tadc':
        if (accent === 'tadc-kinger') return isCorrect ? 'STABLE... FOR NOW' : 'Hoo-Hoo-Hoo! BUG!';
        if (accent === 'tadc-caine') return isCorrect ? 'ABSOLUTELY SPECTACULAR!' : 'I REQUIRE YOU TO STOP!';
        return isCorrect ? 'AMAZING!' : 'OH NO!';
      case 'adventure-time': return isCorrect ? 'ALGEBRAIC!' : 'BUMMER!';
      case 'superhero': return isCorrect ? 'BOOM!' : 'WHAM!';
      case 'saidi': return isCorrect ? 'EXCELLENCE' : 'IMPROVE';
      case 'hollow-knight': return isCorrect ? 'SOUL' : 'VOID';
      case 'virus': return isCorrect ? 'MUTATION SUCCESS' : 'MUTATION FAILED';
      case 'duck': return isCorrect ? 'QUACKTASTIC!' : 'WADDLE WRONG';
      case 'modern': return isCorrect ? 'Spot On!' : 'Not Quite';
      default: return isCorrect ? 'CORRECT' : 'INCORRECT';
    }
  };

  const getAnimation = () => {
    switch (theme) {
      case 'modern':
        return {
          initial: { opacity: 0, y: -60, scale: 0.9, filter: "blur(10px)" },
          animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
          exit: { opacity: 0, y: -40, scale: 1.1, filter: "blur(10px)" },
          transition: { type: "spring", stiffness: 400, damping: 20 }
        };
      case 'ultimate':
        return {
          initial: { opacity: 0, scale: 0, y: 50, rotate: -45 },
          animate: { opacity: 1, scale: 1, y: 0, rotate: 0 },
          exit: { opacity: 0, scale: 0, y: -50, rotate: 45 },
          transition: { type: "spring", stiffness: 300, damping: 20 }
        };
      case 'brutalist':
        return {
          initial: { opacity: 0, y: -100, scale: 1.5 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -100, scale: 0.5 },
          transition: { type: "spring", stiffness: 400, damping: 15 }
        };
      case 'game-minecraft':
        return {
          initial: { opacity: 0, y: 40 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -40 },
          transition: { duration: 0.4, ease: "linear" }
        };
      case 'tadc':
        return {
          initial: { opacity: 0, scale: 0, rotate: -180 },
          animate: { opacity: 1, scale: 1, rotate: 0 },
          exit: { opacity: 0, scale: 0, rotate: 180 },
          transition: { type: "spring", stiffness: 200, damping: 10 }
        };
      case 'superhero':
        return {
          initial: { opacity: 0, scale: 0, rotate: 20 },
          animate: { opacity: 1, scale: 1, rotate: -2 },
          exit: { opacity: 0, scale: 2, rotate: -20 },
          transition: { type: "spring", stiffness: 300, damping: 20 }
        };
      case 'undertale':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.3 }
        };
      case 'hollow-knight':
        return {
          initial: { opacity: 0, scale: 0.9, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 1.1, y: -20 },
          transition: { duration: 0.5, ease: "easeOut" }
        };
      default:
        return {
          initial: { opacity: 0, y: -40, scale: 0.8 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -40, scale: 0.8 },
          transition: { type: "spring", stiffness: 300, damping: 25 }
        };
    }
  };

  const anim = getAnimation();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={anim.initial}
          animate={anim.animate}
          exit={anim.exit}
          transition={anim.transition as any}
          className={`${getBadgeStyles()}`}
          style={{ 
            color: (theme === 'modern' || theme === 'minimal' || theme === 'arcane' || theme === 'virus' || theme === 'ultimate') ? (isCorrect ? '#10b981' : isTimeout ? '#f59e0b' : '#f43f5e') : undefined,
            borderColor: accentColor,
            boxShadow: theme === 'ultimate' ? `0 0 30px ${accentColor}40` : undefined
          }}
        >
          {getIcon()}
          <span>{getLabel()}</span>
          
          {/* Theme-specific extra elements */}
          {theme === 'superhero' && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-black rotate-45" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MousePointer2, Zap, Sparkles, Target, RotateCw, Trophy, Skull, Bug, Lock, MoveRight, ChevronRight } from 'lucide-react';
import { AppTheme, Power } from '../../types';
import { POWERS } from '../../constants/powers';

interface InteractivePowersOverlayProps {
  activePowers: string[];
  onPowerEnd: (powerId: string) => void;
  onGrantPower?: (power: Power) => void;
  theme: AppTheme;
  performanceMode?: boolean;
  allowedPowerIds?: string[];
}

export const InteractivePowersOverlay: React.FC<InteractivePowersOverlayProps> = ({ activePowers, onPowerEnd, onGrantPower, theme, performanceMode, allowedPowerIds }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
      <AnimatePresence>
        {activePowers.includes('click_challenge') && (
          <ClickChallenge key="click_challenge" onComplete={() => onPowerEnd('click_challenge')} theme={theme} performanceMode={performanceMode} />
        )}
        {activePowers.includes('circle_hunt') && (
          <CircleHunt key="circle_hunt" onComplete={() => onPowerEnd('circle_hunt')} theme={theme} performanceMode={performanceMode} />
        )}
        {activePowers.includes('spin_wheel') && (
          <SpinWheel key="spin_wheel" allowedPowerIds={allowedPowerIds} onComplete={(prize) => {
            if (prize && onGrantPower) {
              if ('id' in prize && prize.id === 'jackpot') {
                const smartPower = POWERS.find(p => p.id === 'absolutely_smart');
                if (smartPower && (!allowedPowerIds || allowedPowerIds.includes('absolutely_smart'))) {
                  for (let i = 0; i < 5; i++) onGrantPower(smartPower);
                }
              } else {
                onGrantPower(prize as Power);
              }
            }
            onPowerEnd('spin_wheel');
          }} theme={theme} performanceMode={performanceMode} />
        )}
        {activePowers.includes('bug_squasher') && (
          <BugSquasher key="bug_squasher" onComplete={() => onPowerEnd('bug_squasher')} theme={theme} performanceMode={performanceMode} />
        )}
        {activePowers.includes('pattern_lock') && (
          <PatternLock key="pattern_lock" onComplete={() => onPowerEnd('pattern_lock')} theme={theme} performanceMode={performanceMode} />
        )}
        {activePowers.includes('slider_unlock') && (
          <SliderUnlock key="slider_unlock" onComplete={() => onPowerEnd('slider_unlock')} theme={theme} performanceMode={performanceMode} />
        )}
      </AnimatePresence>
    </div>
  );
};

const ClickChallenge: React.FC<{ onComplete: () => void; theme: AppTheme; performanceMode?: boolean }> = ({ onComplete, theme, performanceMode }) => {
  const [clicks, setClicks] = useState(0);
  const target = 50;
  const [shake, setShake] = useState(0);

  useEffect(() => {
    if (clicks >= target) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [clicks, onComplete]);

  const handleClick = () => {
    if (clicks < target) {
      setClicks(prev => prev + 1);
      setShake(prev => prev + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[10005] bg-slate-950/90 flex flex-col items-center justify-center pointer-events-auto cursor-pointer select-none ${performanceMode ? '' : 'backdrop-blur-xl'}`}
      onClick={handleClick}
    >
      <div className="relative flex flex-col items-center gap-8 max-w-md w-full px-6 text-center">
        {/* Decorative background glow */}
        {!performanceMode && <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full -z-10" />}
        
        <motion.div
          key={shake}
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -2, 2, 0]
          }}
          transition={{ duration: 0.1, type: "tween" }}
          className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)] border-2 border-indigo-400"
        >
          <MousePointer2 className="w-12 h-12 text-white" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Click Challenge!</h2>
          <p className="text-indigo-300 font-bold uppercase tracking-widest text-sm">Tap the screen {target} times to break free</p>
        </div>

        <div className="relative w-full h-32 flex items-center justify-center">
          <motion.span 
            key={clicks}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-black text-white tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            {clicks}
          </motion.span>
          <span className="absolute bottom-0 text-indigo-400/50 font-black text-xl uppercase tracking-widest">/ {target}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-white/10 p-1">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(clicks / target) * 100}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          />
        </div>

        <div className="flex items-center gap-2 text-indigo-400/60 animate-pulse">
          <Zap className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">System Locked by Power</span>
        </div>
      </div>

      {/* Floating particles on click */}
      <AnimatePresence>
        {!performanceMode && shake > 0 && (
          <motion.div
            key={`particle-${shake}`}
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2, y: -100 }}
            exit={{ opacity: 0 }}
            className="absolute pointer-events-none"
            style={{ 
              left: `${Math.random() * 80 + 10}%`, 
              top: `${Math.random() * 80 + 10}%` 
            }}
          >
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CircleHunt: React.FC<{ onComplete: () => void; theme: AppTheme; performanceMode?: boolean }> = ({ onComplete, theme, performanceMode }) => {
  const [circles, setCircles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [clickedCount, setClickedCount] = useState(0);
  const target = 10;
  const nextId = useRef(0);

  useEffect(() => {
    // Generate initial circles
    const initialCircles = Array.from({ length: 5 }).map(() => ({
      id: nextId.current++,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 25, // Avoid top 25% and bottom 15%
      size: Math.random() * 40 + 40
    }));
    setCircles(initialCircles);
  }, []);

  useEffect(() => {
    if (clickedCount >= target) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [clickedCount, onComplete]);

  const handleCircleClick = (id: number) => {
    const newClickedCount = clickedCount + 1;
    setClickedCount(newClickedCount);

    setCircles(prev => {
      const filtered = prev.filter(c => c.id !== id);
      // Add a new circle if we haven't reached the target yet
      if (newClickedCount + filtered.length < target) {
        return [...filtered, {
          id: nextId.current++,
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 25,
          size: Math.random() * 40 + 40
        }];
      }
      return filtered;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[10005] bg-slate-950/95 pointer-events-auto overflow-hidden ${performanceMode ? '' : 'backdrop-blur-2xl'}`}
    >
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Circle Hunt!</h2>
        <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Find and click {target - clickedCount} more circles</p>
        <div className="mt-4 flex gap-1 justify-center">
          {Array.from({ length: target }).map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full border-2 ${i < clickedCount ? 'bg-emerald-500 border-emerald-300' : 'bg-slate-800 border-slate-700'}`} 
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {circles.map(circle => (
          <motion.button
            key={circle.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleCircleClick(circle.id)}
            className="absolute rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_30px_rgba(52,211,153,0.4)] border-4 border-emerald-200 flex items-center justify-center"
            style={{
              left: `${circle.x}%`,
              top: `${circle.y}%`,
              width: circle.size,
              height: circle.size,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Target className="w-1/2 h-1/2 text-white opacity-50" />
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Ambient background effects */}
      {!performanceMode && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 blur-[150px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500 blur-[150px] rounded-full" />
        </div>
      )}
    </motion.div>
  );
};

const SpinWheel: React.FC<{ onComplete: (prize: Power | { id: 'jackpot' } | null) => void; theme: AppTheme; performanceMode?: boolean; allowedPowerIds?: string[] }> = ({ onComplete, theme, performanceMode, allowedPowerIds }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // Random rotation between 5 and 10 full spins plus a random offset
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomOffset = Math.floor(Math.random() * 360);
    const totalRotation = rotation + (extraSpins * 360) + randomOffset;
    
    setRotation(totalRotation);

    setTimeout(() => {
      // Calculate prize based on final angle (0-360)
      const finalAngle = (totalRotation % 360);
      let prize: Power | { id: 'jackpot' } | null = null;
      let resultText = "";

      const filterByAllowed = (powers: Power[]) => {
        if (!allowedPowerIds) return powers;
        return powers.filter(p => allowedPowerIds.includes(p.id));
      };

      if (finalAngle < 108) {
        prize = null;
        resultText = "Better luck next time!";
      } else if (finalAngle < 180) {
        const offensive = filterByAllowed(POWERS.filter(p => p.type === 'offensive'));
        if (offensive.length > 0) {
          prize = offensive[Math.floor(Math.random() * offensive.length)];
          resultText = `Won: ${prize.name}!`;
        } else {
          prize = null;
          resultText = "No allowed powers available!";
        }
      } else if (finalAngle < 252) {
        const advantage = filterByAllowed(POWERS.filter(p => p.type === 'advantage'));
        if (advantage.length > 0) {
          prize = advantage[Math.floor(Math.random() * advantage.length)];
          resultText = `Won: ${prize.name}!`;
        } else {
          prize = null;
          resultText = "No allowed powers available!";
        }
      } else if (finalAngle < 306) {
        const interactive = filterByAllowed(POWERS.filter(p => p.type === 'interactive' && p.id !== 'spin_wheel'));
        if (interactive.length > 0) {
          prize = interactive[Math.floor(Math.random() * interactive.length)];
          resultText = `Won: ${prize.name}!`;
        } else {
          prize = null;
          resultText = "No allowed powers available!";
        }
      } else if (finalAngle < 342) {
        const shield = POWERS.find(p => p.id === 'shield');
        if (shield && (!allowedPowerIds || allowedPowerIds.includes('shield'))) {
          prize = shield;
          resultText = `Won: ${shield.name}!`;
        } else {
          prize = null;
          resultText = "Better luck next time!";
        }
      } else {
        if (!allowedPowerIds || allowedPowerIds.includes('absolutely_smart')) {
          prize = { id: 'jackpot' };
          resultText = "JACKPOT! 5x Absolutely Smart!";
        } else {
          prize = null;
          resultText = "Jackpot was disabled!";
        }
      }

      setResult(resultText);
      setTimeout(() => onComplete(prize), 2000);
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[10005] bg-slate-950/90 flex flex-col items-center justify-center pointer-events-auto overflow-hidden ${performanceMode ? '' : 'backdrop-blur-xl'}`}
    >
      <div className="relative flex flex-col items-center gap-12 max-w-md w-full px-6 text-center">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Wheel of Power</h2>
          <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Spin to win epic rewards</p>
        </div>

        <div className="relative w-64 h-64 sm:w-80 sm:h-80">
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="w-8 h-10 bg-rose-500 rounded-b-full shadow-lg flex items-center justify-center border-2 border-white">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {/* The Wheel */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.15, 0, 0.15, 1] }}
            className="w-full h-full rounded-full border-8 border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden"
            style={{
              background: `conic-gradient(
                #334155 0deg 108deg,
                #e11d48 108deg 180deg,
                #4f46e5 180deg 252deg,
                #9333ea 252deg 306deg,
                #3b82f6 306deg 342deg,
                #eab308 342deg 360deg
              )`
            }}
          >
            {/* Labels */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute top-1/4 right-1/4 rotate-45 text-white/40 font-black text-[10px]">NOTHING</div>
              <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-white/80 font-black text-[10px]">OFFENSIVE</div>
              <div className="absolute top-1/2 left-1/4 -rotate-90 text-white/80 font-black text-[10px]">ADVANTAGE</div>
              <div className="absolute top-1/4 left-1/4 rotate-45 text-white/80 font-black text-[10px]">INTERACTIVE</div>
              <div className="absolute top-[15%] left-[40%] -rotate-12 text-white/80 font-black text-[8px]">SHIELD</div>
              <div className="absolute top-[8%] left-1/2 -translate-x-1/2 text-slate-900 font-black text-[8px]">JACKPOT</div>
            </div>
          </motion.div>

          {/* Center Button */}
          <button
            onClick={spin}
            disabled={isSpinning}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full z-30 flex flex-col items-center justify-center shadow-2xl transition-all ${
              isSpinning ? 'bg-slate-800 scale-90 cursor-not-allowed' : 'bg-white hover:scale-110 active:scale-95'
            }`}
          >
            <RotateCw className={`w-8 h-8 ${isSpinning ? 'text-slate-600 animate-spin' : 'text-indigo-600'}`} />
            {!isSpinning && <span className="text-[10px] font-black text-indigo-600 uppercase">SPIN</span>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`p-6 rounded-3xl border-2 shadow-2xl ${
                result.includes('JACKPOT') ? 'bg-yellow-500 border-yellow-300 text-slate-900' :
                result.includes('Won') ? 'bg-indigo-600 border-indigo-400 text-white' :
                'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                {result.includes('JACKPOT') ? <Trophy className="w-8 h-8" /> : 
                 result.includes('Won') ? <Zap className="w-8 h-8" /> : 
                 <Skull className="w-8 h-8" />}
                <h3 className="text-xl font-black uppercase italic">{result}</h3>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const BugSquasher: React.FC<{ onComplete: () => void; theme: AppTheme; performanceMode?: boolean }> = ({ onComplete, theme, performanceMode }) => {
  const [bugs, setBugs] = useState<{ id: number; x: number; y: number; angle: number; speed: number }[]>([]);
  const [splats, setSplats] = useState<{ id: number; x: number; y: number; angle: number }[]>([]);
  const [squashed, setSquashed] = useState(0);
  const target = 5;
  const nextId = useRef(0);

  useEffect(() => {
    const initialBugs = Array.from({ length: 5 }).map(() => ({
      id: nextId.current++,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      angle: Math.random() * 360,
      speed: 0.5 + Math.random() * 1
    }));
    setBugs(initialBugs);

    const interval = setInterval(() => {
      setBugs(prev => prev.map(bug => {
        let nx = bug.x + Math.cos(bug.angle * Math.PI / 180) * bug.speed;
        let ny = bug.y + Math.sin(bug.angle * Math.PI / 180) * bug.speed;
        let na = bug.angle;

        if (nx < 5 || nx > 95) na = 180 - na;
        if (ny < 5 || ny > 95) na = -na;

        return { ...bug, x: nx, y: ny, angle: na };
      }));
    }, performanceMode ? 60 : 30);

    return () => clearInterval(interval);
  }, [performanceMode]);

  useEffect(() => {
    if (squashed >= target) {
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [squashed, onComplete]);

  const squashBug = (bug: { id: number; x: number; y: number; angle: number }) => {
    setSquashed(prev => prev + 1);
    setSplats(prev => [...prev, { ...bug }]);
    setBugs(prev => prev.filter(b => b.id !== bug.id));
    
    // Play a subtle sound effect if we had one, but we'll use haptic-like visual feedback
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[10005] bg-slate-950/90 pointer-events-auto overflow-hidden ${performanceMode ? '' : 'backdrop-blur-xl'}`}
    >
      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-10">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Bug Squasher!</h2>
        <p className="text-amber-400 font-bold uppercase tracking-widest text-xs">Squash {target - squashed} more bugs</p>
        <div className="mt-4 flex gap-2 justify-center">
          {Array.from({ length: target }).map((_, i) => (
            <div 
              key={i} 
              className={`w-8 h-2 rounded-full transition-all duration-300 ${i < squashed ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800'}`} 
            />
          ))}
        </div>
      </div>

      {/* Render Splats */}
      <AnimatePresence>
        {splats.map(splat => (
          <motion.div
            key={`splat-${splat.id}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1.1], opacity: 0.6 }}
            transition={{ type: "tween" }}
            className="absolute pointer-events-none"
            style={{
              left: `${splat.x}%`,
              top: `${splat.y}%`,
              transform: `translate(-50%, -50%) rotate(${splat.angle}deg)`
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-amber-900/40 blur-xl rounded-full scale-150" />
              <Bug className="w-16 h-16 text-amber-900/80 scale-y-50 rotate-45" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-amber-600/30 blur-md rounded-full" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Render Active Bugs */}
      {bugs.map(bug => (
        <motion.button
          key={bug.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8 }}
          onClick={() => squashBug(bug)}
          className="absolute text-amber-600 hover:text-amber-400 transition-colors z-20"
          style={{
            left: `${bug.x}%`,
            top: `${bug.y}%`,
            transform: `translate(-50%, -50%) rotate(${bug.angle + 90}deg)`
          }}
        >
          <div className="relative group">
            <Bug className="w-12 h-12 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
            {/* Leg animations */}
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="absolute inset-0 pointer-events-none"
            />
          </div>
        </motion.button>
      ))}

      {/* Click Feedback */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes splat-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.5); }
          100% { transform: scale(1.2); }
        }
      `}} />
    </motion.div>
  );
};

const PatternLock: React.FC<{ onComplete: () => void; theme: AppTheme; performanceMode?: boolean }> = ({ onComplete, theme, performanceMode }) => {
  const [pattern, setPattern] = useState<number[]>([]);
  const [targetPattern] = useState(() => {
    const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    return nums.sort(() => Math.random() - 0.5).slice(0, 4);
  });

  useEffect(() => {
    if (pattern.length === targetPattern.length && targetPattern.length > 0) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pattern, targetPattern, onComplete]);

  const handleDotClick = (index: number) => {
    if (pattern.includes(index)) return;
    
    const nextPattern = [...pattern, index];
    if (nextPattern[nextPattern.length - 1] !== targetPattern[nextPattern.length - 1]) {
      setPattern([]); // Reset on wrong dot
      return;
    }

    setPattern(nextPattern);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[10005] bg-slate-950/95 flex flex-col items-center justify-center pointer-events-auto ${performanceMode ? '' : 'backdrop-blur-2xl'}`}
    >
      <div className="mb-12 text-center">
        <Lock className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Pattern Lock</h2>
        <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Follow the sequence to unlock</p>
      </div>

      <div className="grid grid-cols-3 gap-6 p-8 bg-slate-900/50 rounded-3xl border border-white/10">
        {[...Array(9)].map((_, i) => {
          const isTarget = targetPattern.includes(i);
          const isCorrect = pattern.includes(i);
          
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDotClick(i)}
              className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
                isCorrect ? 'bg-indigo-500 border-indigo-300 shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 
                'bg-slate-800 border-slate-700 hover:border-slate-500'
              }`}
            >
              {isCorrect && <span className="text-white font-black">{pattern.indexOf(i) + 1}</span>}
              {!isCorrect && isTarget && <div className="w-2 h-2 bg-indigo-500/20 rounded-full" />}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 flex gap-2">
        {targetPattern.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full ${i < pattern.length ? 'bg-indigo-500' : 'bg-slate-800'}`} />
        ))}
      </div>
    </motion.div>
  );
};

const SliderUnlock: React.FC<{ onComplete: () => void; theme: AppTheme; performanceMode?: boolean }> = ({ onComplete, theme, performanceMode }) => {
  const [value, setValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (value >= 98) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [value, onComplete]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setValue(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[10005] bg-slate-950/90 flex flex-col items-center justify-center pointer-events-auto ${performanceMode ? '' : 'backdrop-blur-xl'}`}
    >
      <div className="max-w-xs w-full px-6 text-center">
        <MoveRight className="w-16 h-16 text-emerald-500 mx-auto mb-6 animate-bounce-x" />
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Slider Unlock</h2>
        <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-12">Slide to the right to unlock</p>

        <div className="relative h-20 bg-slate-900 rounded-full border-2 border-white/10 p-2 flex items-center overflow-hidden">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-emerald-500/20"
            style={{ width: `${value}%` }}
          />
          
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={handleInput}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => {
              setIsDragging(false);
              if (value < 95) setValue(0);
            }}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => {
              setIsDragging(false);
              if (value < 95) setValue(0);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <motion.div
            animate={{ x: `${value * 2.4}px` }} // Approximate for max-w-xs
            className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center pointer-events-none z-20"
          >
            <ChevronRight className={`w-8 h-8 text-emerald-600 transition-transform ${isDragging ? 'scale-110' : ''}`} />
          </motion.div>

          <div className="absolute right-6 text-white/20 font-black italic pointer-events-none">UNLOCK</div>
        </div>
      </div>
    </motion.div>
  );
};

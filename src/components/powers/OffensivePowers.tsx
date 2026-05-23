import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Clock, FastForward, Radio, ArrowDownUp, Smartphone, Palette, Snowflake, Scan, BatteryLow, Grid, Moon, ArrowDown, Flame, Film, Beer, CupSoda } from 'lucide-react';
import { AppTheme } from '../../types';

const POWER_INFO: Record<string, { message: string, icon: any, color: string, duration: number }> = {
  glitch: { message: 'SYSTEM GLITCH!', icon: Zap, color: 'bg-indigo-600', duration: 5000 },
  ink_splash: { message: 'INK SPLASHED!', icon: Zap, color: 'bg-slate-900', duration: 5000 },
  mirror: { message: 'MIRROR MODE', icon: Zap, color: 'bg-indigo-600', duration: 5000 },
  fog: { message: 'FOG DESCENDING', icon: Zap, color: 'bg-slate-400', duration: 5000 },
  earthquake: { message: 'EARTHQUAKE!', icon: Zap, color: 'bg-amber-800', duration: 5000 },
  static_noise: { message: 'STATIC NOISE', icon: Radio, color: 'bg-gray-700', duration: 5000 },
  upside_down: { message: 'UPSIDE DOWN', icon: ArrowDownUp, color: 'bg-purple-600', duration: 5000 },
  vibration: { message: 'VIBRATION', icon: Smartphone, color: 'bg-blue-600', duration: 5000 },
  color_shift: { message: 'COLOR SHIFT', icon: Palette, color: 'bg-pink-600', duration: 5000 },
  frost: { message: 'FROZEN SCREEN!', icon: Snowflake, color: 'bg-sky-400', duration: 5000 },
  scanner: { message: 'SCANNING...', icon: Scan, color: 'bg-red-600', duration: 5000 },
  low_battery: { message: 'LOW BATTERY!', icon: BatteryLow, color: 'bg-amber-600', duration: 5000 },
  pixelate: { message: 'PIXELATING...', icon: Grid, color: 'bg-emerald-600', duration: 5000 },
  blackout: { message: 'BLACKOUT!', icon: Moon, color: 'bg-black', duration: 5000 },
  gravity: { message: 'GRAVITY SHIFT!', icon: ArrowDown, color: 'bg-slate-700', duration: 5000 },
  thermal: { message: 'THERMAL VISION', icon: Flame, color: 'bg-orange-600', duration: 5000 },
  old_movie: { message: 'OLD MOVIE MODE', icon: Film, color: 'bg-amber-900', duration: 5000 },
  drunken: { message: 'DRUNKEN MODE', icon: Beer, color: 'bg-green-700', duration: 5000 },
  juice: { message: 'JUICE BOX!', icon: CupSoda, color: 'bg-orange-500', duration: 45000 },
};

interface OffensivePowersOverlayProps {
  activePowers: string[];
  onPowerEnd: (powerId: string) => void;
  theme: AppTheme;
  performanceMode?: boolean;
}

export const OffensivePowersOverlay: React.FC<OffensivePowersOverlayProps> = ({ activePowers, onPowerEnd, theme, performanceMode }) => {
  const [notifications, setNotifications] = useState<{ id: string; message: string; icon: any; color: string }[]>([]);
  const processedPowers = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    activePowers.forEach(powerId => {
      if (!processedPowers.current.has(powerId) && POWER_INFO[powerId]) {
        const info = POWER_INFO[powerId];
        setNotifications(prev => [...prev, { id: `${powerId}_${Date.now()}`, ...info }]);
        processedPowers.current.add(powerId);
        
        setTimeout(() => {
          onPowerEnd(powerId);
          processedPowers.current.delete(powerId);
        }, info.duration);
      }
    });
  }, [activePowers, onPowerEnd]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Drunken Effect */}
      {activePowers.includes('drunken') && (
        <style dangerouslySetInnerHTML={{ __html: `
          #root { animation: drunkenSway 4s infinite ease-in-out; }
          @keyframes drunkenSway {
            0% { transform: rotate(0deg) translate(0, 0); }
            25% { transform: rotate(1.5deg) translate(5px, 5px); }
            50% { transform: rotate(-1.5deg) translate(-5px, 10px); }
            75% { transform: rotate(1deg) translate(8px, -5px); }
            100% { transform: rotate(0deg) translate(0, 0); }
          }
        `}} />
      )}

      {/* Juice Effect */}
      {activePowers.includes('juice') && (
        <JuiceEffect performanceMode={performanceMode} />
      )}

      {/* Thermal Effect */}
      {activePowers.includes('thermal') && (
        <style dangerouslySetInnerHTML={{ __html: `
          body { 
            filter: invert(1) hue-rotate(180deg) contrast(1.5) brightness(1.2);
            transition: filter 0.5s ease;
          }
        `}} />
      )}

      {/* Old Movie Effect */}
      {activePowers.includes('old_movie') && (
        <div className="absolute inset-0 z-[10008] pointer-events-none overflow-hidden">
          <style dangerouslySetInnerHTML={{ __html: `
            body { 
              filter: sepia(0.8) contrast(1.2) brightness(0.9);
              animation: jitter 0.2s infinite;
            }
            @keyframes jitter {
              0% { transform: translate(0,0); }
              20% { transform: translate(-1px, 1px); }
              40% { transform: translate(1px, -1px); }
              60% { transform: translate(-1px, -1px); }
              80% { transform: translate(1px, 1px); }
              100% { transform: translate(0,0); }
            }
          `}} />
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          {/* Scratches */}
          {[...Array(performanceMode ? 2 : 5)].map((_, i) => (
            <motion.div
              key={`scratch-${i}`}
              initial={{ left: Math.random() * 100 + "%", opacity: 0 }}
              animate={{ 
                left: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                opacity: [0, 0.2, 0]
              }}
              transition={{ duration: 0.1, repeat: Infinity, repeatDelay: Math.random() * 2 }}
              className="absolute top-0 bottom-0 w-[1px] bg-white/30"
            />
          ))}
          {/* Dust particles */}
          {!performanceMode && [...Array(10)].map((_, i) => (
            <motion.div
              key={`dust-${i}`}
              initial={{ 
                left: Math.random() * 100 + "%", 
                top: Math.random() * 100 + "%",
                scale: Math.random() * 2,
                opacity: 0 
              }}
              animate={{ 
                opacity: [0, 0.5, 0],
                scale: [0.5, 1.5, 0.5]
              }}
              transition={{ duration: 0.2, repeat: Infinity, repeatDelay: Math.random() * 3 }}
              className="absolute w-1 h-1 bg-black rounded-full"
            />
          ))}
        </div>
      )}

      {/* Gravity Effect */}
      {activePowers.includes('gravity') && (
        <style dangerouslySetInnerHTML={{ __html: `
          #root { animation: gravityShift 3s infinite ease-in-out; }
          @keyframes gravityShift {
            0% { transform: translateY(0); }
            50% { transform: translateY(20px); }
            100% { transform: translateY(0); }
          }
        `}} />
      )}

      {/* Pixelate Effect */}
      {activePowers.includes('pixelate') && (
        <style dangerouslySetInnerHTML={{ __html: `
          body { 
            filter: blur(${performanceMode ? '1px' : '2px'}) contrast(120%) brightness(110%);
            image-rendering: pixelated;
          }
        `}} />
      )}

      {/* Blackout Effect */}
      {activePowers.includes('blackout') && (
        <motion.div
          animate={{ 
            opacity: [0, 1, 0, 0, 1, 0, 0, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            times: [0, 0.05, 0.1, 0.5, 0.55, 0.6, 0.9, 1]
          }}
          className="absolute inset-0 z-[10007] bg-black pointer-events-none"
        />
      )}

      {/* Static Noise Effect */}
      {activePowers.includes('static_noise') && (
        <div className="absolute inset-0 z-[10003] pointer-events-none overflow-hidden">
          {/* Base Noise Layer */}
          <div className="absolute inset-0 bg-slate-950 opacity-60" />
          
          {/* Dynamic Noise Texture */}
          <div className="absolute inset-0 opacity-30 mix-blend-screen animate-noise-grain" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px'
          }} />

          {/* Color Aberration / Ghosting */}
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.3, 0.2, 0.4, 0.1],
              x: [-4, 4, -2, 6, -4],
              y: [2, -2, 4, -4, 2]
            }}
            transition={{ duration: 0.08, repeat: Infinity }}
            className="absolute inset-0 bg-red-500/10 mix-blend-screen"
          />
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.3, 0.2, 0.4, 0.1],
              x: [4, -4, 2, -6, 4],
              y: [-2, 2, -4, 4, -2]
            }}
            transition={{ duration: 0.07, repeat: Infinity }}
            className="absolute inset-0 bg-blue-500/10 mix-blend-screen"
          />

          {/* Moving Tracking Lines */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`tracking-${i}`}
              animate={{ 
                top: ['-20%', '120%'],
                opacity: [0, 0.3, 0.5, 0.3, 0]
              }}
              transition={{ 
                duration: 2 + i, 
                repeat: Infinity, 
                ease: "linear",
                delay: i * 1.5
              }}
              className="absolute left-0 right-0 h-24 bg-white/5 blur-md"
            />
          ))}

          {/* Intense Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
          
          {/* CRT Vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] pointer-events-none" />

          {/* Random White Flashes (Snow) */}
          {!performanceMode && [...Array(5)].map((_, i) => (
            <motion.div
              key={`snow-${i}`}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0],
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                width: (Math.random() * 10 + 5) + 'px',
                height: '1px'
              }}
              transition={{ 
                duration: 0.1, 
                repeat: Infinity, 
                repeatDelay: Math.random() * 0.5 
              }}
              className="absolute bg-white z-10"
            />
          ))}
        </div>
      )}

      {/* Upside Down Effect */}
      {activePowers.includes('upside_down') && (
        <style dangerouslySetInnerHTML={{ __html: `
          #root { transform: scaleY(-1); transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        `}} />
      )}

      {/* Vibration Effect */}
      {activePowers.includes('vibration') && (
        <style dangerouslySetInnerHTML={{ __html: `
          #root { animation: vibrate 0.05s infinite; }
        `}} />
      )}

      {/* Color Shift Effect */}
      {activePowers.includes('color_shift') && (
        <style dangerouslySetInnerHTML={{ __html: `
          body { 
            animation: colorShiftFilter 3s infinite linear; 
          }
          @keyframes colorShiftFilter {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
          }
        `}} />
      )}
      {/* Ink Splash Effect */}
      {activePowers.includes('ink_splash') && (
        <div className="absolute inset-0 z-[10001] pointer-events-none overflow-hidden">
          {[...Array(performanceMode ? 4 : 8)].map((_, i) => (
            <motion.div
              key={`ink-${i}`}
              initial={{ 
                scale: 0, 
                opacity: 0, 
                left: Math.random() * 100 + '%', 
                top: Math.random() * 100 + '%' 
              }}
              animate={{ 
                scale: [0, 1.5, 1.3], 
                opacity: [0, 0.9, 0.85],
                rotate: Math.random() * 360,
                borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 50% 50% / 50% 50% 50% 50%", "70% 30% 30% 70% / 70% 70% 30% 30%"]
              }}
              transition={{ 
                duration: 0.6, 
                delay: i * 0.05,
                borderRadius: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className={`absolute w-48 h-48 sm:w-80 sm:h-80 bg-slate-950 mix-blend-multiply ${performanceMode ? '' : 'blur-2xl'}`}
              style={{ 
                filter: performanceMode ? 'none' : 'contrast(150%) brightness(80%)',
              }}
            />
          ))}
          {/* Subtle drip effect */}
          {!performanceMode && (
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-slate-950/10 backdrop-blur-[2px]"
            />
          )}
        </div>
      )}

      {/* Fog Effect */}
      {activePowers.includes('fog') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 z-[10002] bg-slate-200/30 pointer-events-none ${performanceMode ? '' : 'backdrop-blur-sm'}`}
        >
          {[...Array(performanceMode ? 3 : 6)].map((_, i) => (
            <motion.div
              key={`fog-cloud-${i}`}
              animate={{ 
                x: ['-10%', '110%'],
                y: [Math.random() * 100 + '%', Math.random() * 100 + '%']
              }}
              transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, ease: 'linear' }}
              className={`absolute w-96 h-96 bg-white/20 rounded-full ${performanceMode ? '' : 'blur-3xl'}`}
            />
          ))}
        </motion.div>
      )}

      {/* Mirror Effect is handled via global CSS class on body or main container */}
      {activePowers.includes('mirror') && (
        <style dangerouslySetInnerHTML={{ __html: `
          #root { transform: scaleX(-1); transition: transform 0.5s ease-in-out; }
        `}} />
      )}

      {/* Earthquake Effect is handled via global CSS class */}
      {activePowers.includes('earthquake') && (
        <style dangerouslySetInnerHTML={{ __html: `
          #root { animation: earthquake 0.1s infinite; }
          @keyframes earthquake {
            0% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(-5px, 5px) rotate(-1deg); }
            50% { transform: translate(5px, -5px) rotate(1deg); }
            75% { transform: translate(-5px, -5px) rotate(-1deg); }
            100% { transform: translate(5px, 5px) rotate(1deg); }
          }
        `}} />
      )}

      {/* Glitch Effect */}
      {activePowers.includes('glitch') && (
        <div className="absolute inset-0 z-[10000] pointer-events-none overflow-hidden">
          {/* Chromatic Aberration / Color Shift Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.2, 0.15, 0.3, 0.1, 0.25, 0.2],
              x: [-2, 2, -1, 3, -2, 0],
              y: [1, -1, 2, -2, 1, 0],
              filter: [
                'hue-rotate(0deg) contrast(1.2) brightness(1.1)',
                'hue-rotate(90deg) contrast(1.5) brightness(1.3)',
                'hue-rotate(180deg) contrast(1.2) brightness(1.1)',
                'hue-rotate(270deg) contrast(1.5) brightness(1.3)',
                'hue-rotate(360deg) contrast(1.2) brightness(1.1)'
              ]
            }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay backdrop-hue-rotate-180"
          />
          
          {/* Floating ERROR texts */}
          {[...Array(performanceMode ? 6 : 15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0,
                left: (Math.random() * 90 + 5) + "%",
                top: (Math.random() * 90 + 5) + "%"
              }}
              animate={{ 
                opacity: [0, 1, 0.8, 1, 0, 0, 0],
                scale: [0.5, 1.2, 0.9, 1.4, 0.5, 0, 0],
                color: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
                x: [0, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, 0],
                y: [0, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, 0],
                skewX: [0, 30, -30, 15, 0],
                rotate: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60]
              }}
              transition={{ 
                duration: 0.8 + Math.random() * 1.2, 
                repeat: Infinity,
                repeatDelay: Math.random() * 2,
                ease: "linear"
              }}
              className="absolute font-black text-4xl sm:text-7xl drop-shadow-[0_0_10px_rgba(255,0,0,0.4)] italic tracking-tighter select-none -translate-x-1/2 -translate-y-1/2"
            >
              ERROR
            </motion.div>
          ))}

          {/* Horizontal Glitch Lines */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`line-${i}`}
              initial={{ top: Math.random() * 100 + "%", left: "-100%", width: "100%", height: "2px" }}
              animate={{ left: "100%", backgroundColor: ['rgba(255,255,255,0.2)', 'rgba(255,0,0,0.2)', 'rgba(0,255,255,0.2)'] }}
              transition={{ 
                duration: 0.2 + Math.random() * 0.3, 
                repeat: Infinity, 
                repeatDelay: Math.random() * 2,
                ease: "linear"
              }}
              className="absolute mix-blend-overlay"
            />
          ))}
        </div>
      )}

      {/* Low Battery Effect */}
      {activePowers.includes('low_battery') && (
        <div className="absolute inset-0 z-[10004] pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              opacity: [0.3, 0.5, 0.4, 0.6, 0.3],
              backgroundColor: ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.5)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-lg border-2 border-white shadow-lg"
          >
            <div className="w-6 h-3 border-2 border-white relative rounded-sm">
              <div className="absolute inset-y-0 left-0 w-1 bg-white" />
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1 h-1.5 bg-white rounded-r-sm" />
            </div>
            <span className="text-[10px] font-black text-white uppercase italic">1%</span>
          </motion.div>
        </div>
      )}

      {/* Scanner Effect */}
      {activePowers.includes('scanner') && (
        <div className="absolute inset-0 z-[10005] pointer-events-none overflow-hidden">
          <motion.div
            animate={{ 
              top: ['-10%', '110%', '-10%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-red-500 shadow-[0_0_20px_#ef4444,0_0_40px_#ef4444]"
          />
          <motion.div
            animate={{ 
              top: ['-10%', '110%', '-10%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-red-500/10 to-transparent"
          />
        </div>
      )}

      {/* Frost Effect */}
      {activePowers.includes('frost') && (
        <div className="absolute inset-0 z-[10006] pointer-events-none overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 bg-sky-100/10 ${performanceMode ? '' : 'backdrop-blur-[1px]'}`}
          />
          {/* Frost Edges */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`frost-${i}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute w-full h-48 bg-gradient-to-b from-white/40 to-transparent pointer-events-none ${performanceMode ? '' : 'blur-2xl'}`}
              style={{
                top: i === 0 ? 0 : 'auto',
                bottom: i === 1 ? 0 : 'auto',
                left: i === 2 ? 0 : 'auto',
                right: i === 3 ? 0 : 'auto',
                transform: i === 1 ? 'rotate(180deg)' : i === 2 ? 'rotate(-90deg)' : i === 3 ? 'rotate(90deg)' : 'none',
                height: (i === 2 || i === 3) ? '100%' : '12rem',
                width: (i === 2 || i === 3) ? '12rem' : '100%'
              }}
            />
          ))}
          {/* Ice Crystals */}
          {[...Array(performanceMode ? 6 : 12)].map((_, i) => (
            <motion.div
              key={`crystal-${i}`}
              initial={{ scale: 0, opacity: 0, rotate: Math.random() * 360 }}
              animate={{ scale: 1, opacity: 0.3 }}
              className={`absolute w-32 h-32 bg-white/20 ${performanceMode ? '' : 'blur-xl'}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
              }}
            />
          ))}
        </div>
      )}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col gap-3 items-center w-full max-w-xs sm:max-w-md">
        <AnimatePresence mode="popLayout">
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              layout
              initial={{ y: -50, opacity: 0, scale: 0.5, rotateX: -45 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ y: -20, opacity: 0, scale: 0.8 }}
              onAnimationComplete={() => {
                setTimeout(() => {
                  setNotifications(prev => prev.filter(n => n.id !== notif.id));
                }, 3000);
              }}
              className={`${notif.color} text-white px-6 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 border-2 border-white/30 backdrop-blur-md relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <notif.icon className="w-6 h-6 animate-bounce" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 leading-none">Power Alert</span>
                <span className="font-black uppercase tracking-tight text-lg italic mt-1">{notif.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes noise-grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }
        .animate-noise-grain {
          animation: noise-grain 0.2s steps(1) infinite;
        }
        @keyframes glitch-overlay {
          0% { transform: translate(0); }
          20% { transform: translate(-5px, 5px); }
          40% { transform: translate(-5px, -5px); }
          60% { transform: translate(5px, 5px); }
          80% { transform: translate(5px, -5px); }
          100% { transform: translate(0); }
        }
        @keyframes vibrate {
          0% { transform: translate(0); }
          25% { transform: translate(-2px, 2px); }
          50% { transform: translate(2px, -2px); }
          75% { transform: translate(-2px, -2px); }
          100% { transform: translate(2px, 2px); }
        }
        .animate-glitch-overlay {
          animation: glitch-overlay 0.2s infinite;
        }
        .animate-vibrate {
          animation: vibrate 0.1s infinite;
        }
      `}} />
    </div>
  );
};

const JuiceEffect: React.FC<{ performanceMode?: boolean }> = ({ performanceMode }) => {
  const [phase, setPhase] = useState<'video' | 'audio' | 'none'>('video');
  const [loopCount, setLoopCount] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleVideoEnded = () => {
    if (loopCount < 2) {
      setLoopCount(prev => prev + 1);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    } else {
      setPhase('audio');
    }
  };

  if (phase === 'none') return null;

  return (
    <div className="fixed inset-0 z-[10010] flex items-center justify-center pointer-events-none">
      {phase === 'video' && (
        <div className="relative w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
           <video
            ref={videoRef}
            src="https://image2url.com/r2/default/videos/1775592473324-62b27410-44f5-45f9-9a82-1383978fb910.mp4"
            autoPlay
            playsInline
            onEnded={handleVideoEnded}
            className="max-w-[90%] max-h-[90%] object-contain shadow-2xl rounded-lg"
          />
        </div>
      )}
      {phase === 'audio' && (
        <JuiceAudioPhase onEnd={() => setPhase('none')} />
      )}
    </div>
  );
};

const JuiceAudioPhase: React.FC<{ onEnd: () => void }> = ({ onEnd }) => {
  return (
    <>
      <audio
        src="https://image2url.com/r2/default/audio/1775592541918-f8e862e6-4be0-4e91-b970-8c989ff333c4.mp3"
        autoPlay
        onEnded={onEnd}
      />
      <motion.div
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-[10011]"
      >
        <motion.img
          src="https://image2url.com/r2/default/images/1775592494128-b6abe0df-7f0f-4c1b-bbab-2623ca4f5213.png"
          style={{
            width: '75vmin',
            height: '75vmin',
            objectFit: 'contain'
          }}
          animate={{
            x: ['-70vw', '70vw', '70vw', '-70vw', '-70vw'],
            scaleX: [1, 1, -1, -1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.48, 0.52, 0.98, 1]
          }}
        />
      </motion.div>
    </>
  );
};

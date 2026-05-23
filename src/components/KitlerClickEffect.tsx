import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Shot {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  angle: number;
}

export const KitlerClickEffect: React.FC<{ active: boolean }> = ({ active }) => {
  const [shots, setShots] = useState<Shot[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current = new Audio('https://image2url.com/r2/default/audio/1775609026699-27226c56-b50a-4bf1-b674-81cb7618af9f.mp3');
    }
    audioRef.current.play().catch(e => console.error("Audio play error:", e));
  }, []);

  useEffect(() => {
    if (!active) return;

    const handleClick = (e: MouseEvent) => {
      // Ignore clicks on the theme logo mark to allow its own animation to play exclusively
      if ((e.target as HTMLElement).closest('.kitler-logo-mark')) return;

      const targetX = e.clientX;
      const targetY = e.clientY;
      
      // Nearer radius (120-200px)
      const radius = 120 + Math.random() * 80;
      const spawnAngle = Math.random() * Math.PI * 2;
      
      // Calculate and clamp within screen view
      let startX = targetX + Math.cos(spawnAngle) * radius;
      let startY = targetY + Math.sin(spawnAngle) * radius;
      
      // Clamping with padding
      const padding = 50;
      startX = Math.max(padding, Math.min(window.innerWidth - padding, startX));
      startY = Math.max(padding, Math.min(window.innerHeight - padding, startY));

      const angle = Math.atan2(targetY - startY, targetX - startX) * (180 / Math.PI);
      
      const newShot: Shot = {
        id: Date.now(),
        startX,
        startY,
        targetX,
        targetY,
        angle
      };

      setShots(prev => [...prev, newShot]);
      playSound();

      // Cleanup shot after animation
      setTimeout(() => {
        setShots(prev => prev.filter(s => s.id !== newShot.id));
      }, 3500);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [active, playSound]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {shots.map(shot => (
          <React.Fragment key={shot.id}>
            {/* The Target Image */}
            <motion.div
              initial={{ x: shot.targetX - 40, y: shot.targetY - 40, scale: 0, opacity: 0, rotate: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                rotate: [0, 0, 90],
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                scale: { duration: 0.3 },
                opacity: { duration: 0.3 },
                rotate: { duration: 0.4, delay: 0.75 }
              }}
              className="absolute z-[9998]"
            >
              <div className="relative w-20 h-20">
                <img 
                  src="https://image2url.com/r2/default/images/1775603255038-38938143-ca89-473c-9e07-b13c43e6e3bc.png" 
                  alt="Target"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                
                {/* Red X Animation with Black Outline (Smaller) */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  {/* First line outline */}
                  <motion.path
                    d="M 35 35 L 65 65"
                    stroke="#000000"
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                  />
                  {/* First line red */}
                  <motion.path
                    d="M 35 35 L 65 65"
                    stroke="#ff0000"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                  />
                  {/* Second line outline */}
                  <motion.path
                    d="M 65 35 L 35 65"
                    stroke="#000000"
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 1.1 }}
                  />
                  {/* Second line red */}
                  <motion.path
                    d="M 65 35 L 35 65"
                    stroke="#ff0000"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 1.1 }}
                  />
                </svg>
              </div>
            </motion.div>

            {/* The Gun */}
            <motion.div
              initial={{ 
                x: shot.startX - 30, 
                y: shot.startY - 15, 
                rotate: shot.angle, 
                scale: 0.6,
                opacity: 0 
              }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                x: [
                  shot.startX - 30, 
                  shot.startX - 30 - Math.cos(shot.angle * Math.PI / 180) * 45, 
                  shot.startX - 30
                ],
                y: [
                  shot.startY - 15, 
                  shot.startY - 15 - Math.sin(shot.angle * Math.PI / 180) * 45, 
                  shot.startY - 15
                ],
                rotate: [shot.angle, shot.angle - 20, shot.angle], // Stronger rotation kick
                scale: [0.6, 1.0, 0.9, 0.8] // Scale pulse
              }}
              transition={{ 
                duration: 1.2, 
                times: [0, 0.1, 0.25, 1],
                ease: "easeOut"
              }}
              className="absolute z-[10001]"
              style={{ transformOrigin: 'center' }}
            >
              <div className="relative w-24 h-16">
                {/* Gun with animated slide */}
                <svg width="80" height="54" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Grip & Frame */}
                  <path d="M25 35L10 75H35L45 35H25Z" fill="black" stroke="white" strokeWidth="4"/>
                  <path d="M45 35C45 45 60 45 60 35" stroke="white" strokeWidth="3"/>
                  
                  {/* Animated Slide */}
                  <motion.rect 
                    x="20" y="10" width="90" height="25" 
                    fill="black" stroke="white" strokeWidth="4"
                    animate={{ x: [0, -20, 0] }}
                    transition={{ duration: 0.2, delay: 0.15 }}
                  />
                  
                  {/* Barrel Tip (Fixed) */}
                  <rect x="110" y="15" width="5" height="15" fill="white"/>
                </svg>
                
                {/* Muzzle Flash */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 3, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.15, delay: 0.15, type: "tween" }}
                  className="absolute -right-1 top-[12px] w-10 h-10 bg-yellow-400 rounded-full blur-md z-[-1]"
                />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.1, delay: 0.15, type: "tween" }}
                  className="absolute -right-0 top-[12px] w-6 h-6 bg-white rounded-full z-[-1]"
                />
              </div>
            </motion.div>

            {/* The Bullet */}
            <motion.div
              initial={{ 
                x: shot.startX, 
                y: shot.startY, 
                rotate: shot.angle, 
                opacity: 0,
                scale: 0.5
              }}
              animate={{ 
                x: shot.targetX, 
                y: shot.targetY,
                opacity: [0, 1, 1, 0],
                scale: [0.5, 0.8, 0.8, 0.8]
              }}
              transition={{ 
                duration: 0.6, 
                times: [0, 0.1, 0.95, 1],
                ease: "linear",
                delay: 0.15
              }}
              className="absolute z-[10000]"
            >
              <div className="relative w-8 h-3 flex items-center">
                <div className="w-6 h-2 bg-[#C5A059] border border-black rounded-l-sm rounded-r-full shadow-sm" />
                <div className="absolute -left-10 w-10 h-[2px] bg-gradient-to-r from-transparent to-white/40" />
              </div>
            </motion.div>
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};

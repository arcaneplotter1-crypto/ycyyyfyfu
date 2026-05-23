import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { TextAnimationType } from '../types';

interface TextAnimatorProps {
  text: string;
  type: TextAnimationType;
  enabled: boolean;
  baseDelay?: number;
  speed?: number;
}

const SCRAMBLE_CHARS = '<>-_\\/[]{}—=+*^?#________';

const Letter: React.FC<{ 
  char: string; 
  type: TextAnimationType; 
  delay: number; 
  enabled: boolean;
  isLast: boolean;
  speed: number;
  onComplete?: () => void;
}> = ({ char, type, delay, enabled, isLast, speed, onComplete }) => {
  const [displayedChar, setDisplayedChar] = useState(char);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplayedChar(char);
      setIsVisible(true);
      return;
    }

    const startTimeout = setTimeout(() => {
      setIsVisible(true);
      
      if (type === 'scramble') {
        setIsScrambling(true);
        let iteration = 0;
        const maxIterations = 8; // Increased iterations for better effect
        timerRef.current = setInterval(() => {
          setDisplayedChar(SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]);
          iteration++;
          if (iteration >= maxIterations) {
            if (timerRef.current) clearInterval(timerRef.current);
            setDisplayedChar(char);
            setIsScrambling(false);
            onComplete?.();
          }
        }, 30 / speed);
      } else {
        onComplete?.();
      }
    }, delay * 1000);

    return () => {
      clearTimeout(startTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [char, type, delay, enabled, speed, onComplete]);

  if (!enabled) return <span className="inline">{char}</span>;

  // Handle whitespace
  if (char === ' ') {
    return <span className="whitespace-pre"> </span>;
  }

  // For typewriter, we don't want to reserve space for letters that haven't appeared yet
  // so the cursor stays next to the last typed letter.
  if (type === 'typewriter' && !isVisible) {
    return null;
  }

  const renderContent = () => {
    if (type === 'typewriter') {
      return (
        <motion.span
          initial={{ opacity: 0, scale: 0.5, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.15 / speed,
            ease: [0.23, 1, 0.32, 1] // Custom cubic-bezier for snappy feel
          }}
          className="inline-block"
        >
          {char}
        </motion.span>
      );
    }

    if (type === 'scramble') {
      return (
        <span className="relative inline-block">
          <span className="invisible select-none" aria-hidden="true">{char}</span>
          {isVisible ? (
            <span className="absolute inset-0">
              {isScrambling && (
                <>
                  <motion.span
                    animate={{ 
                      x: [-2, 2, -1, 1, 0], 
                      opacity: [0.2, 0.8, 0.4, 0.9, 0.5],
                      filter: ['blur(0px)', 'blur(2px)', 'blur(0px)']
                    }}
                    transition={{ duration: 0.15 / speed, repeat: Infinity }}
                    className="absolute inset-0 text-cyan-400 font-mono select-none z-0"
                  >
                    {displayedChar}
                  </motion.span>
                  <motion.span
                    animate={{ 
                      x: [2, -2, 1, -1, 0], 
                      opacity: [0.2, 0.8, 0.4, 0.9, 0.5],
                      filter: ['blur(0px)', 'blur(2px)', 'blur(0px)']
                    }}
                    transition={{ duration: 0.15 / speed, repeat: Infinity }}
                    className="absolute inset-0 text-rose-400 font-mono select-none z-0"
                  >
                    {displayedChar}
                  </motion.span>
                </>
              )}
              <motion.span 
                animate={isScrambling ? {
                  color: ['#6366f1', '#a855f7', '#ec4899', '#6366f1'],
                  opacity: [0.7, 1, 0.8, 1],
                  scale: [1, 1.1, 1],
                } : {
                  color: 'inherit',
                  opacity: 1,
                  scale: 1,
                  textShadow: [
                    '0 0 10px rgba(99,102,241,0.5)',
                    '0 0 0px rgba(99,102,241,0)'
                  ]
                }}
                transition={isScrambling ? { 
                  duration: 0.2 / speed, 
                  repeat: Infinity 
                } : { 
                  duration: 0.4 / speed,
                  times: [0, 1]
                }}
                className={isScrambling ? 'font-mono font-black relative z-10' : 'relative z-10'}
              >
                {displayedChar}
              </motion.span>
            </span>
          ) : null}
        </span>
      );
    }

    if (type === 'fade-up') {
      return (
        <motion.span
          initial={{ opacity: 0, y: 15, rotateX: -45, scale: 0.8 }}
          animate={isVisible ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : { opacity: 0, y: 15, rotateX: -45, scale: 0.8 }}
          transition={{ 
            duration: 0.4 / speed, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="inline-block"
        >
          {char}
        </motion.span>
      );
    }

    if (type === 'blur-in') {
      return (
        <motion.span
          initial={{ opacity: 0, filter: 'blur(12px)', scale: 1.3 }}
          animate={isVisible ? { opacity: 1, filter: 'blur(0px)', scale: 1 } : { opacity: 0, filter: 'blur(12px)', scale: 1.3 }}
          transition={{ 
            duration: 0.5 / speed, 
            ease: "easeOut" 
          }}
          className="inline-block"
        >
          {char}
        </motion.span>
      );
    }

    if (type === 'glitch') {
      return (
        <motion.span
          initial={{ opacity: 0, x: -5, skewX: 10 }}
          animate={isVisible ? { 
            opacity: [0, 1, 0.8, 1, 0.9, 1], 
            x: [-5, 3, -2, 4, -1, 0],
            skewX: [20, -15, 10, -5, 0],
            color: ['#ef4444', '#3b82f6', '#10b981', 'inherit'],
          } : { opacity: 0, x: -5 }}
          transition={{ 
            duration: 0.3 / speed, 
            ease: "easeInOut",
            times: [0, 0.2, 0.4, 0.6, 0.8, 1]
          }}
          className="inline-block font-bold"
        >
          {char}
        </motion.span>
      );
    }

    if (type === 'reveal') {
      return (
        <span className="inline-block overflow-hidden align-bottom">
          <motion.span
            initial={{ y: '100%' }}
            animate={isVisible ? { y: 0 } : { y: '100%' }}
            transition={{ 
              duration: 0.4 / speed, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="inline-block"
          >
            {char}
          </motion.span>
        </span>
      );
    }

    if (type === 'bounce') {
      return (
        <motion.span
          initial={{ opacity: 0, y: 20, scale: 0.3 }}
          animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.3 }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 15,
            mass: 1,
            delay: 0 // delay is handled by parent
          }}
          className="inline-block"
        >
          {char}
        </motion.span>
      );
    }

    if (type === 'wave') {
      return (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={isVisible ? { 
            opacity: 1, 
            y: [10, -10, 0],
          } : { opacity: 0, y: 10 }}
          transition={{ 
            duration: 0.5 / speed,
            ease: "easeOut"
          }}
          className="inline-block"
        >
          {char}
        </motion.span>
      );
    }

    if (type === 'flip') {
      return (
        <motion.span
          initial={{ opacity: 0, rotateY: 90, scale: 0.5 }}
          animate={isVisible ? { opacity: 1, rotateY: 0, scale: 1 } : { opacity: 0, rotateY: 90, scale: 0.5 }}
          transition={{ 
            duration: 0.6 / speed,
            ease: [0.23, 1, 0.32, 1]
          }}
          className="inline-block"
          style={{ perspective: 1000 }}
        >
          {char}
        </motion.span>
      );
    }

    if (type === 'shimmer') {
      return (
        <motion.span
          initial={{ opacity: 0 }}
          animate={isVisible ? { 
            opacity: 1,
            backgroundPosition: ['-200% 0', '200% 0'],
          } : { opacity: 0 }}
          transition={{ 
            opacity: { duration: 0.3 / speed },
            backgroundPosition: { duration: 2.0 / speed, repeat: Infinity, ease: "linear" }
          }}
          className="inline-block bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%] bg-clip-text text-transparent relative"
          style={{ WebkitBackgroundClip: 'text' }}
        >
          <span className="absolute inset-0 text-inherit opacity-100 mix-blend-overlay pointer-events-none" aria-hidden="true">{char}</span>
          <span className="text-inherit opacity-50">{char}</span>
        </motion.span>
      );
    }

    if (type === 'pop') {
      return (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={isVisible ? { opacity: 1, scale: [0, 1.4, 1] } : { opacity: 0, scale: 0 }}
          transition={{ 
            duration: 0.4 / speed,
            times: [0, 0.7, 1],
            ease: "easeOut"
          }}
          className="inline-block"
        >
          {char}
        </motion.span>
      );
    }

    if (type === 'elastic') {
      return (
        <motion.span
          initial={{ opacity: 0, scaleY: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, scaleY: [0, 1.5, 0.8, 1.1, 1], y: 0 } : { opacity: 0, scaleY: 0, y: 20 }}
          transition={{ 
            duration: 0.8 / speed,
            times: [0, 0.3, 0.5, 0.7, 1],
            ease: "easeInOut"
          }}
          className="inline-block origin-bottom"
        >
          {char}
        </motion.span>
      );
    }

    return <span>{char}</span>;
  };

  return renderContent();
};

export const TextAnimator: React.FC<TextAnimatorProps> = ({ text, type, enabled, baseDelay = 0, speed = 1.0 }) => {
  const chars = useMemo(() => text.split(''), [text]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [prevText, setPrevText] = useState(text);
  const hasAnimatedRef = useRef(false);

  // Reset animation state immediately when text changes to prevent "flash" of full text
  if (text !== prevText) {
    setPrevText(text);
    setHasAnimated(false);
    hasAnimatedRef.current = false;
    setIsActive(false);
  }

  useEffect(() => {
    if (!enabled || hasAnimatedRef.current) return;
    const timer = setTimeout(() => {
      setIsActive(true);
    }, baseDelay * 1000);
    return () => clearTimeout(timer);
  }, [baseDelay, enabled, text]);

  const charData = useMemo(() => {
    let currentDelay = baseDelay;
    return chars.map((char, i) => {
      const delay = currentDelay;
      
      let duration = 0;
      if (type === 'typewriter') duration = 0.03 / speed;
      else if (type === 'scramble') duration = 0.08 / speed;
      else if (type === 'glitch') duration = 0.05 / speed;
      else duration = 0.04 / speed;
      
      currentDelay += duration;
      return { char, delay };
    });
  }, [chars, type, baseDelay, speed]);

  if (!enabled || hasAnimatedRef.current || text.length === 0) {
    return <>{text}</>;
  }

  return (
    <span className="inline">
      {charData.map((data, i) => (
        <Letter
          key={`${i}-${data.char}`}
          char={data.char}
          type={type}
          delay={data.delay}
          enabled={enabled}
          isLast={i === chars.length - 1}
          speed={speed}
          onComplete={i === chars.length - 1 ? () => {
            setHasAnimated(true);
            hasAnimatedRef.current = true;
            setIsActive(false);
          } : undefined}
        />
      ))}
      {type === 'typewriter' && isActive && !hasAnimated && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.4 / speed, repeat: Infinity, ease: "linear" }}
          className="inline-block w-2 h-[1.1em] bg-brand-primary ml-0.5 align-middle shadow-[0_0_8px_rgba(99,102,241,0.6)]"
        />
      )}
    </span>
  );
};

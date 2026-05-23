import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star as StarIcon, Heart, Hexagon, Pentagon } from 'lucide-react';

import { VisualStyle, UICustomization, CustomTheme, BackgroundShape, BackgroundOverlay, BackgroundConfig } from '../types';
import { CustomBackground } from './CustomBackground';
import { KitlerBackground } from './KitlerTheme';
import { LiquidGlassFilters, LiquidGlassBackground } from './LiquidGlassEffects';

interface Star {
  id: number;
  x: number;
  y: number;
  rx: number;
  ry: number;
  variant?: number;
}

interface UltimateBackgroundProps {
  variant: number;
  setVariant: React.Dispatch<React.SetStateAction<number>>;
  view: string;
  uiCustomization?: UICustomization;
  customTheme?: CustomTheme;
  visualStyle?: VisualStyle;
  accentColor?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
  targetX: number;
  targetY: number;
  ease: number;
}

export const getVariantStyles = (v: number) => {
  let accent1 = '#8a2be2';
  let accent2 = '#ff00ff';
  let accent3 = '#00ffff';
  let shape = 'four-point-star';

  if (v === 2) {
    accent1 = '#ff3300';
    accent2 = '#ffaa00';
    accent3 = '#ffcc00';
    shape = 'flare';
  } else if (v === 3) {
    accent1 = '#00ff00';
    accent2 = '#00fa9a';
    accent3 = '#20b2aa';
    shape = 'hexagon';
  } else if (v === 4) {
    accent1 = '#00bfff';
    accent2 = '#87ceeb';
    accent3 = '#e0ffff';
    shape = 'cross';
  } else if (v === 5) {
    accent1 = '#ff4500';
    accent2 = '#dc143c';
    accent3 = '#8b0000';
    shape = 'triangle';
  } else if (v === 6) { 
    accent1 = '#ffd700';
    accent2 = '#ffffff';
    accent3 = '#87cefa';
    shape = 'five-point-star';
  } else if (v === 7) { 
    accent1 = '#39ff14';
    accent2 = '#ff00ff';
    accent3 = '#00ffff';
    shape = 'diamond';
  } else if (v === 8) { 
    accent1 = '#000080';
    accent2 = '#008080';
    accent3 = '#00ff7f';
    shape = 'bubble';
  } else if (v === 9) {
    // Easter Variant
    accent1 = '#ffb7ce'; // Pastel Pink
    accent2 = '#ffffd1'; // Pastel Yellow
    accent3 = '#b2e2f2'; // Pastel Blue
    shape = 'egg';
  } else if (v === 10) {
    // Matrix Easter Egg
    accent1 = '#00ff41'; // Matrix Green
    accent2 = '#008f11'; // Darker Green
    accent3 = '#ffffff'; // White
    shape = 'diamond';
  } else if (v === 11) {
    // Cyberpunk Easter Egg
    accent1 = '#ff003c'; // Cyberpunk Red
    accent2 = '#fcee0a'; // Cyberpunk Yellow
    accent3 = '#00f0ff'; // Cyberpunk Blue
    shape = 'cross';
  }
  return { accent1, accent2, accent3, shape };
};

const getStarPath = (x: number, y: number, s: number, shape: string) => {
  if (shape === 'four-point-star') {
    return `M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`;
  } else if (shape === 'flare') {
    return `M ${x} ${y - s*1.5} L ${x + s*0.2} ${y - s*0.2} L ${x + s*1.5} ${y} L ${x + s*0.2} ${y + s*0.2} L ${x} ${y + s*1.5} L ${x - s*0.2} ${y + s*0.2} L ${x - s*1.5} ${y} L ${x - s*0.2} ${y - s*0.2} Z`;
  } else if (shape === 'hexagon') {
    const h = s * Math.sqrt(3) / 2;
    const s2 = s * 0.6;
    const h2 = s2 * Math.sqrt(3) / 2;
    return `M ${x} ${y - s} L ${x + h} ${y - s/2} L ${x + h} ${y + s/2} L ${x} ${y + s} L ${x - h} ${y + s/2} L ${x - h} ${y - s/2} Z M ${x} ${y - s2} L ${x + h2} ${y - s2/2} L ${x + h2} ${y + s2/2} L ${x} ${y + s2} L ${x - h2} ${y + s2/2} L ${x - h2} ${y - s2/2} Z`;
  } else if (shape === 'cross') {
    const w = s * 0.3;
    return `M ${x - w} ${y - s} L ${x + w} ${y - s} L ${x + w} ${y - w} L ${x + s} ${y - w} L ${x + s} ${y + w} L ${x + w} ${y + w} L ${x + w} ${y + s} L ${x - w} ${y + s} L ${x - w} ${y + w} L ${x - s} ${y + w} L ${x - s} ${y - w} L ${x - w} ${y - w} Z`;
  } else if (shape === 'triangle') {
    return `M ${x} ${y - s} L ${x + s} ${y + s} L ${x - s} ${y + s} Z`;
  } else if (shape === 'five-point-star') {
    let path = `M ${x} ${y - s}`;
    for (let i = 1; i < 10; i++) {
      const angle = i * Math.PI / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? s : s * 0.4;
      path += ` L ${x + Math.cos(angle) * radius} ${y + Math.sin(angle) * radius}`;
    }
    return path + ' Z';
  } else if (shape === 'diamond') {
    return `M ${x} ${y - s} L ${x + s*0.7} ${y} L ${x} ${y + s} L ${x - s*0.7} ${y} Z`;
  } else if (shape === 'bubble') {
    return `M ${x} ${y - s} A ${s} ${s} 0 1 1 ${x} ${y + s} A ${s} ${s} 0 1 1 ${x} ${y - s} Z`;
  } else if (shape === 'egg') {
    return `M ${x} ${y - s * 1.2} 
            C ${x + s} ${y - s * 1.2} ${x + s} ${y + s} ${x} ${y + s} 
            C ${x - s} ${y + s} ${x - s} ${y - s * 1.2} ${x} ${y - s * 1.2} Z`;
  } else if (shape === 'mask') {
    // Hollow Knight Mask shape
    return `M ${x} ${y - s} 
            C ${x + s} ${y - s} ${x + s} ${y + s*0.5} ${x} ${y + s} 
            C ${x - s} ${y + s*0.5} ${x - s} ${y - s} ${x} ${y - s} 
            M ${x - s*0.3} ${y - s*0.2} A ${s*0.2} ${s*0.3} 0 1 0 ${x - s*0.3} ${y + s*0.1}
            M ${x + s*0.3} ${y - s*0.2} A ${s*0.2} ${s*0.3} 0 1 0 ${x + s*0.3} ${y + s*0.1}`;
  } else if (shape === 'needle') {
    // Silksong Needle shape
    return `M ${x} ${y - s*1.5} L ${x + s*0.2} ${y} L ${x} ${y + s*1.5} L ${x - s*0.2} ${y} Z`;
  } else if (shape === 'silk') {
    // Silk thread shape
    return `M ${x - s} ${y} Q ${x} ${y - s} ${x + s} ${y} Q ${x} ${y + s} ${x - s} ${y}`;
  }
  return `M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`;
};

export const UltimateBackground: React.FC<UltimateBackgroundProps> = React.memo(({ variant, setVariant, view, uiCustomization, customTheme, visualStyle, accentColor }) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [bursts, setBursts] = useState<{id: number, x: number, y: number, color: string}[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const clickPathRef = useRef<{x: number, y: number, time: number}[]>([]);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const specialEffectRef = useRef<{
    active: boolean;
    type: 'singularity' | 'tesseract' | 'starburst' | 'dna' | 'wormhole' | 'supernova' | 'vortex' | 'rainbow' | 'gravity' | 'freeze' | 'hatch' | 'ultimate' | 'hell' | 'heaven' | 'guardian' | 'virus';
    x: number;
    y: number;
    startTime: number;
    phase: 'pull' | 'push' | 'form' | 'shatter' | 'ignite' | 'explode' | 'helix' | 'open' | 'detonate' | 'spin' | 'cycle' | 'fall' | 'still' | 'transcend' | 'unleash' | 'ascend' | 'summon' | 'infect';
    duration: number;
    points?: {x: number, y: number}[];
  }>({ active: false, type: 'singularity', x: 0, y: 0, startTime: 0, phase: 'pull', duration: 0 });
  const shockwavesRef = useRef<{
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    speed: number;
    opacity: number;
    color: string;
    life: number;
    type: 'pull' | 'push';
  }[]>([]);

  const triggerSpecial = (type: 'singularity' | 'tesseract' | 'starburst' | 'dna' | 'wormhole' | 'supernova' | 'vortex' | 'rainbow' | 'gravity' | 'freeze' | 'hatch' | 'ultimate' | 'hell' | 'heaven' | 'guardian' | 'virus', x: number, y: number, points?: {x: number, y: number}[]) => {
    const special = specialEffectRef.current;
    if (special.active) return;

    special.active = true;
    special.type = type;
    special.x = x;
    special.y = y;
    special.startTime = performance.now();
    special.points = points;

    if (type === 'singularity') {
      special.phase = 'pull';
      special.duration = 3500;
    } else if (type === 'tesseract') {
      special.phase = 'form';
      special.duration = 4000;
    } else if (type === 'starburst') {
      special.phase = 'ignite';
      special.duration = 3000;
    } else if (type === 'dna') {
      special.phase = 'helix';
      special.duration = 12000;
    } else if (type === 'wormhole') {
      special.phase = 'open';
      special.duration = 25000;
    } else if (type === 'supernova') {
      special.phase = 'detonate';
      special.duration = 4000;
    } else if (type === 'vortex') {
      special.phase = 'spin';
      special.duration = 5000;
    } else if (type === 'rainbow') {
      special.phase = 'cycle';
      special.duration = 6000;
    } else if (type === 'gravity') {
      special.phase = 'fall';
      special.duration = 4000;
    } else if (type === 'freeze') {
      special.phase = 'still';
      special.duration = 4000;
    } else if (type === 'hatch') {
      special.phase = 'form';
      special.duration = 4000;
    } else if (type === 'ultimate') {
      special.phase = 'transcend';
      special.duration = 8000;
    } else if (type === 'hell') {
      special.phase = 'unleash';
      special.duration = 8000;
    } else if (type === 'heaven') {
      special.phase = 'ascend';
      special.duration = 20000;
    } else if (type === 'guardian') {
      special.phase = 'summon';
      special.duration = 25000;
    } else if (type === 'virus') {
      special.phase = 'infect';
      special.duration = 35000;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (view !== 'home') {
      setStars([]);
    }
  }, [view]);

  useEffect(() => {
    starsRef.current = stars;
  }, [stars]);

  const secretCodeRef = useRef('');
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'home') return;
      if (e.key.length === 1) {
        secretCodeRef.current += e.key.toLowerCase();
        if (secretCodeRef.current.length > 10) {
          secretCodeRef.current = secretCodeRef.current.slice(-10);
        }
        if (secretCodeRef.current.includes('matrix')) {
          setVariant(10);
          secretCodeRef.current = '';
        } else if (secretCodeRef.current.includes('cyber')) {
          setVariant(11);
          secretCodeRef.current = '';
        } else if (secretCodeRef.current.includes('boom')) {
          triggerSpecial('supernova', window.innerWidth / 2, window.innerHeight / 2);
          secretCodeRef.current = '';
        } else if (secretCodeRef.current.includes('spin')) {
          triggerSpecial('vortex', window.innerWidth / 2, window.innerHeight / 2);
          secretCodeRef.current = '';
        } else if (secretCodeRef.current.includes('rainbow')) {
          triggerSpecial('rainbow', window.innerWidth / 2, window.innerHeight / 2);
          secretCodeRef.current = '';
        } else if (secretCodeRef.current.includes('heavy')) {
          triggerSpecial('gravity', window.innerWidth / 2, window.innerHeight / 2);
          secretCodeRef.current = '';
        } else if (secretCodeRef.current.includes('stop')) {
          triggerSpecial('freeze', window.innerWidth / 2, window.innerHeight / 2);
          secretCodeRef.current = '';
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setVariant]);

  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (view !== 'home') return;
      const touch = e.touches[0];
      touchPosRef.current = { x: touch.clientX, y: touch.clientY };
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
      touchTimerRef.current = setTimeout(() => {
        triggerSpecial('hatch', touchPosRef.current.x, touchPosRef.current.y);
      }, 800);
    };

    const handleTouchEnd = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const dist = Math.sqrt(Math.pow(touch.clientX - touchPosRef.current.x, 2) + Math.pow(touch.clientY - touchPosRef.current.y, 2));
      if (dist > 20) {
        if (touchTimerRef.current) {
          clearTimeout(touchTimerRef.current);
          touchTimerRef.current = null;
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (view !== 'home') return;
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea, .brutal-modal, .glass')) {
        return;
      }
      touchPosRef.current = { x: e.clientX, y: e.clientY };
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
      touchTimerRef.current = setTimeout(() => {
        triggerSpecial('hatch', touchPosRef.current.x, touchPosRef.current.y);
      }, 800);
    };

    const handleMouseUp = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!touchTimerRef.current) return;
      const dist = Math.sqrt(Math.pow(e.clientX - touchPosRef.current.x, 2) + Math.pow(e.clientY - touchPosRef.current.y, 2));
      if (dist > 20) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const easterEggRef = useRef({
    count: 0,
    firstX: 0,
    firstY: 0,
    lastTime: 0
  });

  const handleClick = useCallback((e: MouseEvent) => {
    if (view !== 'home') return; // Disable clicks outside home screen

    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, .brutal-modal, .glass')) {
      return;
    }

    // Easter Egg Logic: 6 clicks in the same spot
    const now = Date.now();
    const egg = easterEggRef.current;
    const dist = Math.sqrt(Math.pow(e.clientX - egg.firstX, 2) + Math.pow(e.clientY - egg.firstY, 2));

    if (egg.count === 0 || (dist < 20 && now - egg.lastTime < 2000)) {
      if (egg.count === 0) {
        egg.firstX = e.clientX;
        egg.firstY = e.clientY;
      }
      egg.count += 1;
      egg.lastTime = now;

      if (egg.count === 6) {
        setVariant(prev => (prev % 9) + 1);
        egg.count = 0; // Reset after trigger
      }
    } else {
      // Reset if too far or too slow
      egg.count = 1;
      egg.firstX = e.clientX;
      egg.firstY = e.clientY;
      egg.lastTime = now;
    }

    // Shift + Click: Singularity
    if (e.shiftKey) {
      triggerSpecial('singularity', e.clientX, e.clientY);
      return;
    }

    // Shape Easter Egg Logic (Triangle & Square)
    clickPathRef.current.push({ x: e.clientX, y: e.clientY, time: now });
    
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      const points = clickPathRef.current;
      clickPathRef.current = []; // Reset after evaluation

      if (points.length === 3) {
        const [p1, p2, p3] = points;
        if (now - p1.time < 2500) {
          const area = Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
          if (area > 5000) {
            const cx = (p1.x + p2.x + p3.x) / 3;
            const cy = (p1.y + p2.y + p3.y) / 3;
            triggerSpecial('singularity', cx, cy, points);
          } else {
            const dist = Math.sqrt(Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2));
            if (dist > 150) {
              const cx = (p1.x + p2.x + p3.x) / 3;
              const cy = (p1.y + p2.y + p3.y) / 3;
              triggerSpecial('dna', cx, cy, points);
            }
          }
        }
      } else if (points.length === 4) {
        const [p1, p2, p3, p4] = points;
        if (now - p1.time < 3000) {
          const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
          const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
          const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
          const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);
          const area = (maxX - minX) * (maxY - minY);
          
          if (area > 10000) {
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            triggerSpecial('tesseract', cx, cy, points);
          }
        }
      } else if (points.length === 5) {
        const [p1, p2, p3, p4, p5] = points;
        if (now - p1.time < 3500) {
          const minX = Math.min(p1.x, p2.x, p3.x, p4.x, p5.x);
          const maxX = Math.max(p1.x, p2.x, p3.x, p4.x, p5.x);
          const minY = Math.min(p1.y, p2.y, p3.y, p4.y, p5.y);
          const maxY = Math.max(p1.y, p2.y, p3.y, p4.y, p5.y);
          const area = (maxX - minX) * (maxY - minY);
          
          if (area > 10000) {
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            triggerSpecial('starburst', cx, cy, points);
          }
        }
      } else if (points.length === 6) {
        if (now - points[0].time < 4000) {
          const minX = Math.min(...points.map(p => p.x));
          const maxX = Math.max(...points.map(p => p.x));
          const minY = Math.min(...points.map(p => p.y));
          const maxY = Math.max(...points.map(p => p.y));
          const area = (maxX - minX) * (maxY - minY);
          
          if (area > 15000) {
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            triggerSpecial('wormhole', cx, cy, points);
          }
        }
      } else if (points.length === 7) {
        if (now - points[0].time < 4500) {
          const cx = points.reduce((sum, p) => sum + p.x, 0) / 7;
          const cy = points.reduce((sum, p) => sum + p.y, 0) / 7;
          triggerSpecial('hell', cx, cy, points);
        }
      } else if (points.length === 8) {
        if (now - points[0].time < 5000) {
          const cx = points.reduce((sum, p) => sum + p.x, 0) / 8;
          const cy = points.reduce((sum, p) => sum + p.y, 0) / 8;
          triggerSpecial('ultimate', cx, cy, points);
        }
      } else if (points.length === 9) {
        if (now - points[0].time < 5500) {
          const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
          const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
          triggerSpecial('heaven', cx, cy, points);
        }
      } else if (points.length === 10) {
        if (now - points[0].time < 6000) {
          const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
          const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
          triggerSpecial('guardian', cx, cy, points);
        }
      } else if (points.length >= 11) {
        if (now - points[0].time < 7000) {
          const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
          const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
          triggerSpecial('virus', cx, cy, points);
        }
      }
    }, 400);

    if (view !== 'home') return; // Only add stars on home screen

    const newStar = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      rx: (Math.random() - 0.5) * 30,
      ry: (Math.random() - 0.5) * 30,
      variant: variant,
    };

    setStars(prev => {
      const updated = [...prev, newStar];
      if (updated.length > 5) {
        return updated.slice(updated.length - 5);
      }
      return updated;
    });
  }, [variant, view]);

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [handleClick]);

  const uiCustomizationRef = useRef(uiCustomization);

  useEffect(() => {
    uiCustomizationRef.current = uiCustomization;
  }, [uiCustomization]);

  // Canvas Particle Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (fogCanvasRef.current) {
        fogCanvasRef.current.width = window.innerWidth;
        fogCanvasRef.current.height = window.innerHeight;
      }
      initParticles();
    };

    const initParticles = () => {
      const particleCount = uiCustomizationRef.current?.particleCount ?? 35;
      const maxSize = uiCustomizationRef.current?.particleMaxSize ?? 4;
      
      // Re-initialize if count changes
      if (particlesRef.current.length !== particleCount) {
        particlesRef.current = [];
      }

      if (particlesRef.current.length === 0) {
        for (let i = 0; i < particleCount; i++) {
          let type = 'circle';
          if (variant === 1) {
            type = Math.random() > 0.5 ? 'star' : 'diamond';
          } else if (variant === 2) { // Solar
            type = Math.random() > 0.5 ? 'flare' : 'gear';
          } else if (variant === 3) { // Emerald
            type = Math.random() > 0.5 ? 'bubble' : 'hexagon';
          } else if (variant === 4) { // Glacier
            type = Math.random() > 0.5 ? 'cross' : 'triangle';
          } else if (variant === 5) { // Magma
            type = Math.random() > 0.5 ? 'hex' : 'gear';
          } else if (variant === 6) { // Celestial
            type = 'star';
          } else if (variant === 7) { // Cyberpunk
            type = Math.random() > 0.5 ? 'triangle' : 'cross';
          } else if (variant === 8) { // Abyssal
            type = 'bubble';
          } else if (variant === 9) { // Easter
            type = Math.random() > 0.5 ? 'egg' : 'star';
          } else if (variant === 10) { // Matrix
            type = 'diamond';
          } else if (variant === 11) { // Cyberpunk
            type = Math.random() > 0.5 ? 'cross' : 'hexagon';
          }

          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * maxSize + 2,
            type: type,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            opacity: 0.2 + Math.random() * 0.4,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.03,
            targetX: Math.random() * canvas.width,
            targetY: Math.random() * canvas.height,
            ease: 0.002 + Math.random() * 0.005,
          });
        }
      } else {
        // Update existing particles' types for the new variant
        particlesRef.current.forEach(p => {
          let type = 'circle';
          if (variant === 1) {
            type = Math.random() > 0.5 ? 'star' : 'diamond';
          } else if (variant === 2) { // Solar
            type = Math.random() > 0.5 ? 'flare' : 'gear';
          } else if (variant === 3) { // Emerald
            type = Math.random() > 0.5 ? 'bubble' : 'hexagon';
          } else if (variant === 4) { // Glacier
            type = Math.random() > 0.5 ? 'cross' : 'triangle';
          } else if (variant === 5) { // Magma
            type = Math.random() > 0.5 ? 'hex' : 'gear';
          } else if (variant === 6) { // Celestial
            type = 'star';
          } else if (variant === 7) { // Cyberpunk
            type = Math.random() > 0.5 ? 'triangle' : 'cross';
          } else if (variant === 8) { // Abyssal
            type = 'bubble';
          } else if (variant === 9) { // Easter
            type = Math.random() > 0.5 ? 'egg' : 'star';
          } else if (variant === 10) { // Matrix
            type = 'diamond';
          } else if (variant === 11) { // Cyberpunk
            type = Math.random() > 0.5 ? 'cross' : 'hexagon';
          }
          p.type = type;
        });
      }
    };

    const drawShape = (ctx: CanvasRenderingContext2D, p: Particle, x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.rotation);
      
      if (p.type === 'hexagon' || p.type === 'hex') {
        const sides = 6;
        const sSize = size * 1.5;
        
        // Outer glow simulation (much faster than shadowBlur)
        ctx.globalAlpha = p.opacity * 0.3;
        ctx.beginPath();
        for (let s = 0; s <= sides; s++) {
          const angle = (s * 2 * Math.PI) / sides;
          ctx.lineTo((sSize * 1.4) * Math.cos(angle), (sSize * 1.4) * Math.sin(angle));
        }
        ctx.closePath();
        ctx.fill();
        
        // Main body
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        for (let s = 0; s <= sides; s++) {
          const angle = (s * 2 * Math.PI) / sides;
          ctx.lineTo(sSize * Math.cos(angle), sSize * Math.sin(angle));
        }
        ctx.closePath();
        ctx.fill();
        
        // Inner wireframe
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = p.opacity * 0.8;
        
        ctx.beginPath();
        for (let s = 0; s <= sides; s++) {
          const angle = (s * 2 * Math.PI) / sides;
          ctx.lineTo((sSize * 0.6) * Math.cos(angle), (sSize * 0.6) * Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();

        // Connect opposite vertices
        ctx.beginPath();
        for (let s = 0; s < 3; s++) {
          const angle1 = (s * 2 * Math.PI) / sides;
          const angle2 = ((s + 3) * 2 * Math.PI) / sides;
          ctx.moveTo(sSize * Math.cos(angle1), sSize * Math.sin(angle1));
          ctx.lineTo(sSize * Math.cos(angle2), sSize * Math.sin(angle2));
        }
        ctx.stroke();

        // Rotating inner hexagon
        ctx.save();
        ctx.rotate(-p.rotation * 2);
        ctx.beginPath();
        const innerSize = sSize * 0.4 * (1 + Math.sin(p.pulse * 2) * 0.2);
        for (let s = 0; s <= sides; s++) {
          const angle = (s * 2 * Math.PI) / sides;
          ctx.lineTo(innerSize * Math.cos(angle), innerSize * Math.sin(angle));
        }
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = ctx.fillStyle as string;
        ctx.stroke();
        ctx.restore();
        
        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0, size * 0.2), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else if (p.type === 'egg') {
        const sSize = size * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -sSize * 1.2);
        ctx.bezierCurveTo(sSize, -sSize * 1.2, sSize, sSize, 0, sSize);
        ctx.bezierCurveTo(-sSize, sSize, -sSize, -sSize * 1.2, 0, -sSize * 1.2);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'diamond') {
        const sSize = size * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -sSize);
        ctx.lineTo(sSize * 0.7, 0);
        ctx.lineTo(0, sSize);
        ctx.lineTo(-sSize * 0.7, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'gear') {
        const teeth = 8;
        const rInner = size * 0.7;
        const rOuter = size * 1.2;
        ctx.beginPath();
        for (let t = 0; t < teeth * 2; t++) {
          const angle = (t * Math.PI) / teeth;
          const r = t % 2 === 0 ? rOuter : rInner;
          ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'bubble') {
        ctx.beginPath();
        ctx.rect(-size, -size, size * 2, size * 2);
        ctx.fill();
      } else if (p.type === 'triangle') {
        const sSize = size * 1.8;
        ctx.beginPath();
        ctx.moveTo(0, -sSize);
        ctx.lineTo(sSize * 0.866, sSize * 0.5);
        ctx.lineTo(-sSize * 0.866, sSize * 0.5);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'cross') {
        const sSize = size * 1.5;
        const w = sSize * 0.3;
        ctx.beginPath();
        ctx.moveTo(-w, -sSize);
        ctx.lineTo(w, -sSize);
        ctx.lineTo(w, -w);
        ctx.lineTo(sSize, -w);
        ctx.lineTo(sSize, w);
        ctx.lineTo(w, w);
        ctx.lineTo(w, sSize);
        ctx.lineTo(-w, sSize);
        ctx.lineTo(-w, w);
        ctx.lineTo(-sSize, w);
        ctx.lineTo(-sSize, -w);
        ctx.lineTo(-w, -w);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'star') {
        const spikes = 5;
        const outerRadius = size * 1.5;
        const innerRadius = size * 0.7;
        ctx.beginPath();
        for (let j = 0; j < spikes * 2; j++) {
          const radius = j % 2 === 0 ? outerRadius : innerRadius;
          const angle = (j * Math.PI) / spikes;
          if (j === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'flare') {
        const spikes = 8;
        const outerRadius = size * 2 + Math.random() * 2;
        const innerRadius = size * 0.5;
        ctx.beginPath();
        for (let j = 0; j < spikes * 2; j++) {
          const radius = j % 2 === 0 ? outerRadius : innerRadius;
          const angle = (j * Math.PI) / spikes;
          if (j === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0, size), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const render = () => {
      if (view !== 'home') {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      ctx.save();
      
      let shakeX = 0;
      let shakeY = 0;
      let dimAlpha = 0;
      
      const time = Date.now() * 0.001;
      const special = specialEffectRef.current;
      
      if (special.active && (special.type === 'wormhole' || special.type === 'supernova') && (special.phase === 'open' || special.phase === 'detonate')) {
        const elapsed = Date.now() - special.startTime;
        const progress = Math.max(0, Math.min(1, elapsed / special.duration));
        const easeProgress = Math.sin(progress * Math.PI);
        
        const intensity = special.type === 'supernova' ? easeProgress * 40 : easeProgress * 15;
        shakeX = (Math.random() - 0.5) * intensity;
        shakeY = (Math.random() - 0.5) * intensity;
        
        dimAlpha = special.type === 'supernova' ? easeProgress * 0.9 : easeProgress * 0.6;
      }
      
      ctx.translate(shakeX, shakeY);
      
      // Clear a slightly larger area to account for shake
      ctx.clearRect(-50, -50, canvas.width + 100, canvas.height + 100);

      if (dimAlpha > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${dimAlpha})`;
        ctx.fillRect(-50, -50, canvas.width + 100, canvas.height + 100);
      }
      
      let { accent1, accent2, accent3 } = getVariantStyles(variant);

      particlesRef.current.forEach((p, i) => {
        let currentSize = p.size;
        // Special Effect Logic (Pull/Push/Form/Shatter)
        // Target Movement (Shortest Path in Wrapped Space)
        let dxTarget = p.targetX - p.x;
        if (dxTarget > canvas.width / 2) dxTarget -= canvas.width;
        if (dxTarget < -canvas.width / 2) dxTarget += canvas.width;
        
        let dyTarget = p.targetY - p.y;
        if (dyTarget > canvas.height / 2) dyTarget -= canvas.height;
        if (dyTarget < -canvas.height / 2) dyTarget += canvas.height;

        if (special.active) {
          const elapsed = performance.now() - special.startTime;
          const dxSpecial = special.x - p.x;
          const dySpecial = special.y - p.y;
          const distSpecialSq = dxSpecial * dxSpecial + dySpecial * dySpecial;
          const distSpecial = Math.sqrt(distSpecialSq);

          if (special.type === 'singularity') {
            if (special.phase === 'pull') {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              const pullForce = (progress * progress) * 0.15; // Exponential pull
              p.x += dxSpecial * pullForce;
              p.y += dySpecial * pullForce;
              
              // Add some swirling
              const swirlStrength = progress * 0.2;
              p.x += dySpecial * swirlStrength;
              p.y -= dxSpecial * swirlStrength;
            } else if (special.phase === 'push') {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              const pushForce = (1 - progress) * 2000 / Math.max(10, distSpecial);
              p.x -= dxSpecial * pushForce * 0.05;
              p.y -= dySpecial * pushForce * 0.05;
            }
          } else if (special.type === 'tesseract') {
            if (special.phase === 'form') {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              // Pull particles into a grid/square formation
              if (distSpecial < 400) {
                const targetGridX = special.x + Math.round(dxSpecial / 50) * 50;
                const targetGridY = special.y + Math.round(dySpecial / 50) * 50;
                p.x += (targetGridX - p.x) * progress * 0.1;
                p.y += (targetGridY - p.y) * progress * 0.1;
                p.rotationSpeed = 0;
                p.rotation = Math.PI / 4; // Align to grid
              }
            } else if (special.phase === 'shatter') {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              if (distSpecial < 600) {
                // Chaotic scatter
                p.x += (Math.random() - 0.5) * 50 * (1 - progress);
                p.y += (Math.random() - 0.5) * 50 * (1 - progress);
                p.rotationSpeed = (Math.random() - 0.5) * 0.5;
              }
            }
          } else if (special.type === 'starburst') {
            if (special.phase === 'ignite') {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              // Pull particles into a tight star formation with a spiral
              if (distSpecial < 600) {
                const angle = Math.atan2(dySpecial, dxSpecial);
                const starPoints = 5;
                const starAngle = Math.round(angle / (Math.PI * 2 / starPoints)) * (Math.PI * 2 / starPoints);
                
                // Spiral effect
                const spiral = (1 - progress) * 5;
                const targetDist = 40 + Math.sin(starAngle * starPoints + time * 10) * 80 * progress;
                
                const targetX = special.x - Math.cos(starAngle + spiral) * targetDist;
                const targetY = special.y - Math.sin(starAngle + spiral) * targetDist;
                
                p.x += (targetX - p.x) * progress * 0.2;
                p.y += (targetY - p.y) * progress * 0.2;
                p.rotationSpeed = 0.2 * progress;
              }
            } else if (special.phase === 'explode') {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              if (distSpecial < 1000) {
                // Shoot outwards in star rays with more force
                const angle = Math.atan2(dySpecial, dxSpecial);
                const starPoints = 5;
                const starAngle = Math.round(angle / (Math.PI * 2 / starPoints)) * (Math.PI * 2 / starPoints);
                
                const force = 60 * (1 - progress);
                p.x -= Math.cos(starAngle + (Math.random() - 0.5) * 0.2) * force;
                p.y -= Math.sin(starAngle + (Math.random() - 0.5) * 0.2) * force;
                p.rotationSpeed = (Math.random() - 0.5) * 3;
              }
            }
          } else if (special.type === 'dna') {
            if (special.phase === 'helix') {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              if (distSpecial < 800) {
                const lineAngle = special.points && special.points.length >= 2 
                  ? Math.atan2(special.points[special.points.length-1].y - special.points[0].y, special.points[special.points.length-1].x - special.points[0].x)
                  : 0;
                
                const pxRel = p.x - special.x;
                const pyRel = p.y - special.y;
                const proj = pxRel * Math.cos(lineAngle) + pyRel * Math.sin(lineAngle);
                
                let targetX = p.x;
                let targetY = p.y;
                
                if (variant === 1) { // Violet: Double Helix
                  const helixFreq = 0.02;
                  const helixAmp = 80 * Math.sin(progress * Math.PI);
                  const phaseOffset = i % 2 === 0 ? 0 : Math.PI;
                  const perpOffset = Math.sin(proj * helixFreq + time * 8 + phaseOffset) * helixAmp;
                  const depthOffset = Math.cos(proj * helixFreq + time * 8 + phaseOffset) * 20;
                  targetX = special.x + proj * Math.cos(lineAngle) - perpOffset * Math.sin(lineAngle);
                  targetY = special.y + proj * Math.sin(lineAngle) + perpOffset * Math.cos(lineAngle);
                  currentSize = Math.max(1, p.size + depthOffset * 0.1); // Fake 3D depth
                } else if (variant === 2) { // Solar: Pulsing energy beam
                  const beamWidth = 10 + Math.sin(time * 30 + i) * 60 * Math.sin(progress * Math.PI);
                  const perpOffset = (i % 2 === 0 ? 1 : -1) * beamWidth * Math.random();
                  targetX = special.x + proj * Math.cos(lineAngle) - perpOffset * Math.sin(lineAngle);
                  targetY = special.y + proj * Math.sin(lineAngle) + perpOffset * Math.cos(lineAngle);
                  p.rotationSpeed = 0.5;
                } else if (variant === 3) { // Emerald: Zig-zag toxic vines
                  const zigZag = Math.abs(((proj + time * 100) % 120) - 60) - 30;
                  const perpOffset = zigZag * 2.5 * Math.sin(progress * Math.PI) * (i % 2 === 0 ? 1 : -1);
                  targetX = special.x + proj * Math.cos(lineAngle) - perpOffset * Math.sin(lineAngle);
                  targetY = special.y + proj * Math.sin(lineAngle) + perpOffset * Math.cos(lineAngle);
                } else if (variant === 4) { // Glacier: Digital barcode / equalizer
                  const eqHeight = Math.abs(Math.sin(proj * 0.15 + time * 15)) * 150 * Math.sin(progress * Math.PI);
                  const perpOffset = (i % 2 === 0 ? 1 : -1) * eqHeight * Math.random();
                  targetX = special.x + Math.round(proj / 20) * 20 * Math.cos(lineAngle) - perpOffset * Math.sin(lineAngle);
                  targetY = special.y + Math.round(proj / 20) * 20 * Math.sin(lineAngle) + perpOffset * Math.cos(lineAngle);
                  p.rotation = lineAngle;
                } else if (variant === 5) { // Magma: Braided fire
                  const braid1 = Math.sin(proj * 0.04 + time * 12) * 70;
                  const braid2 = Math.sin(proj * 0.04 + time * 12 + Math.PI * 2 / 3) * 70;
                  const braid3 = Math.sin(proj * 0.04 + time * 12 + Math.PI * 4 / 3) * 70;
                  const perpOffset = (i % 3 === 0 ? braid1 : (i % 3 === 1 ? braid2 : braid3)) * Math.sin(progress * Math.PI);
                  targetX = special.x + proj * Math.cos(lineAngle) - perpOffset * Math.sin(lineAngle);
                  targetY = special.y + proj * Math.sin(lineAngle) + perpOffset * Math.cos(lineAngle);
                } else if (variant === 6) { // Celestial: Orbiting planetary rings
                  const ringRadius = 120 * Math.sin(progress * Math.PI);
                  const angle = proj * 0.08 + time * 5;
                  const perpOffset = Math.sin(angle) * ringRadius;
                  const projOffset = Math.cos(angle) * ringRadius * 0.4; // Tilt
                  targetX = special.x + (proj + projOffset) * Math.cos(lineAngle) - perpOffset * Math.sin(lineAngle);
                  targetY = special.y + (proj + projOffset) * Math.sin(lineAngle) + perpOffset * Math.cos(lineAngle);
                } else if (variant === 7) { // Cyberpunk: Square wave data stream
                  const sqWave = Math.sign(Math.sin(proj * 0.08 - time * 15)) * 60 * Math.sin(progress * Math.PI);
                  const perpOffset = sqWave * (i % 2 === 0 ? 1 : -1);
                  targetX = special.x + proj * Math.cos(lineAngle) - perpOffset * Math.sin(lineAngle);
                  targetY = special.y + proj * Math.sin(lineAngle) + perpOffset * Math.cos(lineAngle);
                } else if (variant === 8) { // Abyssal: Swirling vortex tube
                  const vortexRadius = (60 + Math.sin(proj * 0.03 - time * 2) * 30) * Math.sin(progress * Math.PI);
                  const angle = i * 0.8 + time * 8;
                  const perpOffset = Math.sin(angle) * vortexRadius;
                  const projOffset = Math.cos(angle) * vortexRadius * 0.5;
                  targetX = special.x + (proj + projOffset) * Math.cos(lineAngle) - perpOffset * Math.sin(lineAngle);
                  targetY = special.y + (proj + projOffset) * Math.sin(lineAngle) + perpOffset * Math.cos(lineAngle);
                } else { // Easter Variant
                  const helixFreq = 0.025;
                  const helixAmp = 80 * Math.sin(progress * Math.PI);
                  const phaseOffset = i % 2 === 0 ? 0 : Math.PI;
                  const perpOffset = Math.sin(proj * helixFreq + time * 6 + phaseOffset) * helixAmp;
                  const depthOffset = Math.cos(proj * helixFreq + time * 6 + phaseOffset) * 30;
                  targetX = special.x + proj * Math.cos(lineAngle) - perpOffset * Math.sin(lineAngle);
                  targetY = special.y + proj * Math.sin(lineAngle) + perpOffset * Math.cos(lineAngle);
                  currentSize = Math.max(1, p.size + depthOffset * 0.15);
                }
                
                p.x += (targetX - p.x) * progress * 0.25;
                p.y += (targetY - p.y) * progress * 0.25;
                p.rotationSpeed = 0.2 * progress;
              }
            }
          } else if (special.type === 'hatch') {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            if (progress < 0.5) {
              // Pull in slightly to form the egg
              if (distSpecial < 500) {
                const pullForce = (progress / 0.5) * 0.15;
                p.x += dxSpecial * pullForce;
                p.y += dySpecial * pullForce;
                p.rotationSpeed *= 0.9;
              }
            } else {
              // Push out on shatter
              if (distSpecial < 800) {
                const pushForce = (1 - (progress - 0.5) / 0.5) * 50;
                const angle = Math.atan2(dySpecial, dxSpecial);
                p.x -= Math.cos(angle) * pushForce;
                p.y -= Math.sin(angle) * pushForce;
                p.rotationSpeed = (Math.random() - 0.5) * 2;
              }
            }
          } else if (special.type === 'wormhole') {
            if (special.phase === 'open') {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              const easeProgress = Math.sin(progress * Math.PI);
              
              if (distSpecial < 1800) {
                const angle = Math.atan2(dySpecial, dxSpecial);
                // Swirling vortex effect instead of just straight pull
                const swirlAngle = angle + Math.PI / 2 * (1 - distSpecial / 1800);
                const pullForce = 1200 / (distSpecial + 20) * easeProgress;
                
                p.x += Math.cos(swirlAngle) * pullForce;
                p.y += Math.sin(swirlAngle) * pullForce;
                
                // Add some jitter
                p.x += (Math.random() - 0.5) * 5 * easeProgress;
                p.y += (Math.random() - 0.5) * 5 * easeProgress;
                
                if (distSpecial < 80) {
                  // Spawn them exactly on the screen borders
                  const side = Math.floor(Math.random() * 4);
                  if (side === 0) { // Top
                    p.x = Math.random() * canvas.width;
                    p.y = 0;
                  } else if (side === 1) { // Right
                    p.x = canvas.width;
                    p.y = Math.random() * canvas.height;
                  } else if (side === 2) { // Bottom
                    p.x = Math.random() * canvas.width;
                    p.y = canvas.height;
                  } else { // Left
                    p.x = 0;
                    p.y = Math.random() * canvas.height;
                  }
                  p.targetX = special.x;
                  p.targetY = special.y;
                  // Make them shoot back in faster
                  p.ease = 0.05 + Math.random() * 0.05;
                }
                
                p.rotationSpeed = 1.5 * easeProgress;
                p.pulseSpeed = 0.5 * easeProgress;
              }
            }
          } else if (special.type === 'supernova') {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            if (progress < 0.3) {
              // Pull in
              const pullProgress = progress / 0.3;
              const pullForce = pullProgress * 0.4;
              p.x += dxSpecial * pullForce;
              p.y += dySpecial * pullForce;
              currentSize = p.size * (1 - pullProgress * 0.8);
            } else {
              // Explode
              const explodeProgress = (progress - 0.3) / 0.7;
              const force = (1 - explodeProgress) * 150;
              const angle = Math.atan2(dySpecial, dxSpecial) + Math.PI;
              p.x += Math.cos(angle) * force;
              p.y += Math.sin(angle) * force;
              currentSize = p.size * (1 + (1 - explodeProgress) * 5);
              p.rotationSpeed = (1 - explodeProgress) * 2;

              if (elapsed > special.duration * 0.35 && elapsed < special.duration * 0.4) {
                // Change variant mid-explosion once
                if (i === 0) setVariant(Math.floor(Math.random() * 9) + 1);
              }
            }
          } else if (special.type === 'vortex') {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            const angle = Math.atan2(dySpecial, dxSpecial);
            const swirlAngle = angle + Math.PI / 2 + progress * Math.PI * 4;
            const targetDist = 150 + Math.sin(time * 2 + i) * 100;
            const targetX = special.x - Math.cos(swirlAngle) * targetDist;
            const targetY = special.y - Math.sin(swirlAngle) * targetDist;
            
            p.x += (targetX - p.x) * easeProgress * 0.1;
            p.y += (targetY - p.y) * easeProgress * 0.1;
            p.rotationSpeed = 0.5 * easeProgress;
          } else if (special.type === 'rainbow') {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            if (i === 0) {
              const cycleVariant = Math.floor((progress * 9 * 4) % 9) + 1;
              setVariant(cycleVariant);
            }
            p.rotationSpeed = 0.3;
          } else if (special.type === 'gravity') {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            p.y += 15 * easeProgress;
            p.vx *= 0.9;
            p.vy *= 0.9;
          } else if (special.type === 'freeze') {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            p.x -= dxTarget * p.ease * easeProgress;
            p.y -= dyTarget * p.ease * easeProgress;
            p.rotationSpeed *= (1 - easeProgress);
          } else if (special.type === 'ultimate') {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            
            if (variant === 1) { // Violet: Event Horizon Collapse
              if (progress < 0.5) {
                // Form a massive spinning ring
                const ringProgress = progress / 0.5;
                const angle = i * 0.5 + time * 5;
                const targetDist = 300 * (1 - ringProgress * 0.8);
                const targetX = special.x + Math.cos(angle) * targetDist;
                const targetY = special.y + Math.sin(angle) * targetDist;
                p.x += (targetX - p.x) * 0.1;
                p.y += (targetY - p.y) * 0.1;
                p.rotationSpeed = 1.5;
              } else {
                // Explode into galaxy spiral
                const expProgress = (progress - 0.5) / 0.5;
                const angle = i * 0.5 + time * 2;
                const targetDist = expProgress * 1000;
                const targetX = special.x + Math.cos(angle + expProgress * Math.PI * 2) * targetDist;
                const targetY = special.y + Math.sin(angle + expProgress * Math.PI * 2) * targetDist;
                p.x += (targetX - p.x) * 0.1;
                p.y += (targetY - p.y) * 0.1;
                currentSize = p.size * (1 + expProgress * 3);
              }
            } else if (variant === 2) { // Solar: Supernova Awakening
              if (progress < 0.4) {
                // Form giant sun
                const pullProgress = progress / 0.4;
                const targetDist = 100 * Math.random() * (1 - pullProgress * 0.5);
                const angle = Math.random() * Math.PI * 2;
                const targetX = special.x + Math.cos(angle) * targetDist;
                const targetY = special.y + Math.sin(angle) * targetDist;
                p.x += (targetX - p.x) * 0.2;
                p.y += (targetY - p.y) * 0.2;
                currentSize = p.size * (1 + pullProgress * 4);
              } else if (progress < 0.6) {
                // Pulsate
                const pulse = Math.sin((progress - 0.4) * Math.PI * 10);
                p.x += (Math.random() - 0.5) * 10 * pulse;
                p.y += (Math.random() - 0.5) * 10 * pulse;
                currentSize = p.size * 5 * (1 + pulse * 0.2);
              } else {
                // Erupt
                const expProgress = (progress - 0.6) / 0.4;
                const angle = Math.atan2(dySpecial, dxSpecial) + Math.PI;
                p.x += Math.cos(angle) * expProgress * 100;
                p.y += Math.sin(angle) * expProgress * 100;
                currentSize = p.size * (1 + (1 - expProgress) * 5);
              }
            } else if (variant === 3) { // Emerald: World Tree Genesis
              const treeProgress = progress;
              if (i % 3 === 0) { // Trunk
                const targetX = special.x + Math.sin(p.y * 0.05 + time) * 20;
                const targetY = special.y + 400 - treeProgress * 800 * (i / particlesRef.current.length);
                p.x += (targetX - p.x) * 0.1;
                p.y += (targetY - p.y) * 0.1;
                currentSize = p.size * 2;
              } else { // Leaves/Branches
                const branchAngle = -Math.PI / 2 + (i % 2 === 0 ? 1 : -1) * (0.2 + Math.random() * 0.8);
                const branchDist = treeProgress * 400 * Math.random();
                const targetX = special.x + Math.cos(branchAngle) * branchDist;
                const targetY = special.y + 200 - treeProgress * 400 + Math.sin(branchAngle) * branchDist;
                p.x += (targetX - p.x) * 0.05;
                p.y += (targetY - p.y) * 0.05;
                p.rotationSpeed = 0.5;
                if (progress > 0.8) { // Fall
                  p.y += (progress - 0.8) * 200;
                  p.x += Math.sin(time * 5 + i) * 10;
                }
              }
            } else if (variant === 4) { // Glacier: Absolute Zero Matrix
              if (progress < 0.5) {
                // Grid formation
                const targetGridX = special.x + Math.round(dxSpecial / 80) * 80;
                const targetGridY = special.y + Math.round(dySpecial / 80) * 80;
                p.x += (targetGridX - p.x) * 0.2;
                p.y += (targetGridY - p.y) * 0.2;
                p.rotation = 0;
                p.rotationSpeed = 0;
              } else {
                // Shatter into giant diamond
                const shatterProgress = (progress - 0.5) / 0.5;
                const diamondSize = 300;
                const angle = (i / particlesRef.current.length) * Math.PI * 2;
                const targetX = special.x + Math.cos(angle) * diamondSize * (1 - shatterProgress * 0.5);
                const targetY = special.y + Math.sin(angle) * diamondSize * (1 - shatterProgress * 0.5);
                p.x += (targetX - p.x) * 0.1;
                p.y += (targetY - p.y) * 0.1;
                p.rotationSpeed = shatterProgress * 2;
              }
            } else if (variant === 5) { // Magma: Core Eruption
              if (progress < 0.3) {
                // Split ground
                const targetY = special.y + 200 + Math.sin(p.x * 0.05) * 20;
                p.x += (p.x - p.x) * 0.1; // Stay on X
                p.y += (targetY - p.y) * 0.2;
              } else {
                // Erupt
                const eruptProgress = (progress - 0.3) / 0.7;
                if (i % 2 === 0) {
                  const eruptAngle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
                  const eruptForce = eruptProgress * 800 * Math.random();
                  p.x = special.x + Math.cos(eruptAngle) * eruptForce;
                  p.y = special.y + 200 + Math.sin(eruptAngle) * eruptForce + eruptProgress * eruptProgress * 500; // Gravity
                }
                currentSize = Math.max(0.1, p.size * (1 + Math.sin(time * 10 + i) * 2));
              }
            } else if (variant === 6) { // Celestial: Constellation Weaver
              const angle = (i / particlesRef.current.length) * Math.PI * 2 + time * 0.5;
              const radius = 200 + Math.sin(i * Math.PI * 4 / particlesRef.current.length) * 100;
              const targetX = special.x + Math.cos(angle) * radius;
              const targetY = special.y + Math.sin(angle) * radius;
              p.x += (targetX - p.x) * 0.05;
              p.y += (targetY - p.y) * 0.05;
              if (progress > 0.2 && progress < 0.8) {
                // Connect lines handled in drawing phase
                p.rotationSpeed = 0.1;
              }
            } else if (variant === 7) { // Cyberpunk: System Override
              if (progress < 0.2 || (progress > 0.4 && progress < 0.5) || (progress > 0.7 && progress < 0.8)) {
                // Glitch jumps
                p.x += (Math.random() - 0.5) * 200;
                p.y += (Math.random() - 0.5) * 50;
                currentSize = p.size * (1 + Math.random() * 3);
              } else {
                // Form skull/face shape roughly
                const faceAngle = (i / particlesRef.current.length) * Math.PI * 2;
                const faceRadius = 150 + (i % 5) * 20;
                let targetX = special.x + Math.cos(faceAngle) * faceRadius;
                let targetY = special.y + Math.sin(faceAngle) * faceRadius * 1.5;
                if (i % 10 === 0) { // Eyes
                  targetX = special.x + (i % 20 === 0 ? -60 : 60);
                  targetY = special.y - 40;
                  currentSize = p.size * 4;
                }
                p.x += (targetX - p.x) * 0.1;
                p.y += (targetY - p.y) * 0.1;
              }
            } else if (variant === 8) { // Abyssal: Leviathan's Grasp
              const spiralAngle = i * 0.5 + time * 3 + progress * Math.PI * 10;
              const spiralRadius = 800 * (1 - progress);
              const targetX = special.x + Math.cos(spiralAngle) * spiralRadius;
              const targetY = special.y + Math.sin(spiralAngle) * spiralRadius;
              p.x += (targetX - p.x) * 0.1;
              p.y += (targetY - p.y) * 0.1;
              currentSize = p.size * (1 + (1 - progress) * 2);
            } else if (variant === 9) { // Easter: Spring Awakening
              if (progress < 0.3) {
                // Form Egg
                const eggAngle = (i / particlesRef.current.length) * Math.PI * 2;
                const eggRadiusX = 100;
                const eggRadiusY = 150;
                const targetX = special.x + Math.cos(eggAngle) * eggRadiusX;
                const targetY = special.y + Math.sin(eggAngle) * eggRadiusY;
                p.x += (targetX - p.x) * 0.1;
                p.y += (targetY - p.y) * 0.1;
              } else {
                // Hatch and flutter
                const flutterProgress = (progress - 0.3) / 0.7;
                p.x += Math.sin(time * 10 + i) * 15;
                p.y -= 10 + Math.cos(time * 8 + i) * 5;
                p.rotationSpeed = 1.5;
              }
            } else if (variant === 10) { // Matrix: The Source
              if (progress < 0.4) {
                // Rain down perfectly
                p.x = special.x + (i - particlesRef.current.length / 2) * 30;
                p.y += 20;
                p.rotation = Math.PI / 2;
              } else {
                // Form Eye
                const eyeAngle = (i / particlesRef.current.length) * Math.PI * 2;
                const eyeRadiusX = 200;
                const eyeRadiusY = 80;
                let targetX = special.x + Math.cos(eyeAngle) * eyeRadiusX;
                let targetY = special.y + Math.sin(eyeAngle) * eyeRadiusY;
                if (i % 5 === 0) { // Pupil
                  targetX = special.x + Math.cos(eyeAngle) * 40;
                  targetY = special.y + Math.sin(eyeAngle) * 40;
                }
                p.x += (targetX - p.x) * 0.1;
                p.y += (targetY - p.y) * 0.1;
                if (progress > 0.8 && progress < 0.9) { // Blink
                  p.y += (special.y - p.y) * 0.5;
                }
              }
            } else if (variant === 11) { // Cyberpunk 2: Neon Overdrive
              const tunnelAngle = (i / particlesRef.current.length) * Math.PI * 2 + time;
              const tunnelRadius = 50 + progress * 800;
              const targetX = special.x + Math.cos(tunnelAngle) * tunnelRadius;
              const targetY = special.y + Math.sin(tunnelAngle) * tunnelRadius;
              p.x += (targetX - p.x) * 0.2;
              p.y += (targetY - p.y) * 0.2;
              currentSize = p.size * (1 + progress * 5);
              // Stretch particles
            }
          } else if (special.type === 'hell') {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            const maxDim = Math.max(canvas.width, canvas.height);
            
            if (variant === 1) { // Violet: Demonic Eye
              const eyeAngle = (i / particlesRef.current.length) * Math.PI * 2 + time * 2;
              const eyeRadiusX = maxDim * 0.4 * easeProgress;
              const eyeRadiusY = maxDim * 0.2 * easeProgress;
              let targetX = special.x + Math.cos(eyeAngle) * eyeRadiusX;
              let targetY = special.y + Math.sin(eyeAngle) * eyeRadiusY;
              if (i % 3 === 0) { // Slit pupil
                targetX = special.x + Math.cos(eyeAngle) * (maxDim * 0.05);
                targetY = special.y + Math.sin(eyeAngle) * (maxDim * 0.25) * easeProgress;
              }
              p.x += (targetX - p.x) * 0.15;
              p.y += (targetY - p.y) * 0.15;
              currentSize = p.size * (1 + easeProgress * 4);
            } else if (variant === 2) { // Solar: Hellfire Tornado
              const tornadoAngle = i * 0.8 + time * 15;
              const tornadoRadius = (p.y / canvas.height) * maxDim * 0.5 * easeProgress;
              const targetX = special.x + Math.cos(tornadoAngle) * tornadoRadius;
              const targetY = special.y - maxDim * 0.5 + (i / particlesRef.current.length) * maxDim * 1.5;
              p.x += (targetX - p.x) * 0.2;
              p.y += (targetY - p.y) * 0.2;
              currentSize = p.size * (1 + Math.random() * 5);
            } else if (variant === 3) { // Emerald: Toxic Hydra
              const headCount = 7;
              const headIndex = i % headCount;
              const headAngle = (headIndex / headCount) * Math.PI * 2 + Math.sin(time * 3) * 0.8;
              const neckLength = maxDim * 0.4 * easeProgress;
              const targetX = special.x + Math.cos(headAngle) * neckLength + Math.sin(time * 8 + i) * 50;
              const targetY = special.y + Math.sin(headAngle) * neckLength + Math.cos(time * 8 + i) * 50;
              p.x += (targetX - p.x) * 0.15;
              p.y += (targetY - p.y) * 0.15;
              currentSize = p.size * 3;
            } else if (variant === 4) { // Glacier: Frozen Hellscape
              const spikeAngle = (i / particlesRef.current.length) * Math.PI * 2;
              const spikeLength = (i % 2 === 0 ? maxDim * 0.8 : maxDim * 0.3) * easeProgress;
              const targetX = special.x + Math.cos(spikeAngle) * spikeLength;
              const targetY = special.y + Math.sin(spikeAngle) * spikeLength;
              p.x += (targetX - p.x) * 0.4;
              p.y += (targetY - p.y) * 0.4;
              p.rotation = spikeAngle;
            } else if (variant === 5) { // Magma: Underworld Rift
              const riftWidth = maxDim * 0.8 * easeProgress;
              const targetX = special.x + (Math.random() - 0.5) * riftWidth;
              const targetY = special.y + (i % 2 === 0 ? 1 : -1) * Math.sqrt(Math.abs(riftWidth/2 - Math.abs(targetX - special.x))) * 100;
              p.x += (targetX - p.x) * 0.15;
              p.y += (targetY - p.y) * 0.15;
              p.vy -= 10 * easeProgress; // Intense heat rising
            } else if (variant === 6) { // Celestial: Fallen Angel Wings
              const wingSide = i % 2 === 0 ? 1 : -1;
              const wingProgress = (i / particlesRef.current.length) * Math.PI;
              const targetX = special.x + wingSide * (maxDim * 0.2 + Math.sin(wingProgress) * maxDim * 0.6) * easeProgress;
              const targetY = special.y - Math.cos(wingProgress) * maxDim * 0.8 * easeProgress + Math.sin(time * 8) * 50;
              p.x += (targetX - p.x) * 0.15;
              p.y += (targetY - p.y) * 0.15;
            } else if (variant === 7) { // Cyberpunk: Corrupted Core
              const glitchX = (Math.random() - 0.5) * maxDim * easeProgress;
              const glitchY = (Math.random() - 0.5) * maxDim * easeProgress;
              if (Math.random() > 0.7) {
                p.x = special.x + glitchX;
                p.y = special.y + glitchY;
              } else {
                p.x += (special.x - p.x) * 0.1;
                p.y += (special.y - p.y) * 0.1;
              }
              currentSize = p.size * (Math.random() * 8);
            } else if (variant === 8) { // Abyssal: Kraken Tentacles
              const tentacleCount = 12;
              const tIndex = i % tentacleCount;
              const tAngle = (tIndex / tentacleCount) * Math.PI * 2 + Math.sin(time*2) * 0.8;
              const tDist = (i / particlesRef.current.length) * maxDim * 0.8 * easeProgress;
              const targetX = special.x + Math.cos(tAngle + tDist * 0.005) * tDist;
              const targetY = special.y + Math.sin(tAngle + tDist * 0.005) * tDist;
              p.x += (targetX - p.x) * 0.15;
              p.y += (targetY - p.y) * 0.15;
            } else if (variant === 9) { // Easter: Demonic Bunny
              const earSide = i % 2 === 0 ? 1 : -1;
              const earHeight = maxDim * 0.6 * easeProgress;
              let targetX = special.x;
              let targetY = special.y;
              if (i % 3 === 0) { // Ears
                targetX = special.x + earSide * (maxDim * 0.15) + Math.sin(time * 15) * 40;
                targetY = special.y - earHeight + (i / particlesRef.current.length) * (maxDim * 0.4);
              } else { // Face
                targetX = special.x + Math.cos(i) * (maxDim * 0.3) * easeProgress;
                targetY = special.y + Math.sin(i) * (maxDim * 0.3) * easeProgress;
              }
              p.x += (targetX - p.x) * 0.15;
              p.y += (targetY - p.y) * 0.15;
            } else if (variant === 10) { // Matrix: System Failure
              p.y += 50 * easeProgress;
              if (p.y > canvas.height) p.y = 0;
              if (Math.random() > 0.8) p.x += (Math.random() - 0.5) * 200;
              p.rotation = Math.PI / 2;
              currentSize = p.size * 5;
            } else if (variant === 11) { // Cyberpunk 2: Digital Demon
              const demonAngle = (i / particlesRef.current.length) * Math.PI * 2;
              const demonRadius = maxDim * 0.4 * easeProgress * (1 + Math.sin(demonAngle * 8 + time * 15) * 0.8);
              const targetX = special.x + Math.cos(demonAngle) * demonRadius;
              const targetY = special.y + Math.sin(demonAngle) * demonRadius;
              p.x += (targetX - p.x) * 0.25;
              p.y += (targetY - p.y) * 0.25;
            }
          } else if (special.type === 'guardian') {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            const maxDim = Math.max(canvas.width, canvas.height);
            
            // Guardian formation
            const totalParticles = particlesRef.current.length;
            const segment = i / totalParticles;
            
            let targetX = special.x;
            let targetY = special.y;
            
            if (variant === 1) { // Violet: Black Hole Singularity
              // Spiraling into the center
              const spiralAngle = segment * Math.PI * 20 + time * 5;
              const spiralRadius = (1 - segment) * maxDim * 0.5 * easeProgress;
              targetX = special.x + Math.cos(spiralAngle) * spiralRadius;
              targetY = special.y + Math.sin(spiralAngle) * spiralRadius;
              currentSize = p.size * (1 + (1 - segment) * 4);
            } else if (variant === 2) { // Solar: Phoenix
              // Wings and tail formation
              const wingSide = i % 2 === 0 ? 1 : -1;
              const wingProgress = (i % (totalParticles / 2)) / (totalParticles / 2);
              const flap = Math.sin(time * 10) * 100 * easeProgress;
              
              targetX = special.x + wingSide * wingProgress * maxDim * 0.4 * easeProgress;
              targetY = special.y - wingProgress * maxDim * 0.2 * easeProgress + flap * wingProgress;
              
              // Tail feathers
              if (segment > 0.8) {
                targetX = special.x + Math.sin(time * 5 + i) * 50;
                targetY = special.y + (segment - 0.8) * maxDim * 0.5 * easeProgress;
              }
              currentSize = p.size * (2 + Math.random() * 3);
            } else if (variant === 3) { // Emerald: Tree of Life
              // Branching upwards
              const branchAngle = (segment - 0.5) * Math.PI * 0.8;
              const branchDist = segment * maxDim * 0.6 * easeProgress;
              targetX = special.x + Math.sin(branchAngle) * branchDist;
              targetY = special.y - Math.cos(branchAngle) * branchDist;
              currentSize = p.size * (1 + (1 - segment) * 5);
            } else if (variant === 4) { // Glacier: Frost Titan
              // Massive blocky formation
              const gridX = (i % 10) - 5;
              const gridY = Math.floor(i / 10) - 10;
              targetX = special.x + gridX * 40 * easeProgress;
              targetY = special.y + gridY * 40 * easeProgress;
              p.rotation = Math.PI / 4;
              currentSize = p.size * 3;
            } else if (variant === 5) { // Magma: Fire Elemental
              // Chaotic rising flames
              targetX = special.x + (Math.random() - 0.5) * 300 * easeProgress;
              targetY = special.y + maxDim * 0.3 - segment * maxDim * 0.8 * easeProgress;
              currentSize = p.size * (2 + Math.random() * 5);
            } else if (variant === 6) { // Celestial: Galaxy Spiral
              // Double spiral arms
              const arm = i % 2 === 0 ? 0 : Math.PI;
              const spiralAngle = segment * Math.PI * 4 + time * 2 + arm;
              const spiralRadius = segment * maxDim * 0.5 * easeProgress;
              targetX = special.x + Math.cos(spiralAngle) * spiralRadius;
              targetY = special.y + Math.sin(spiralAngle) * spiralRadius;
              currentSize = p.size * (1 + Math.random() * 2);
            } else if (variant === 7) { // Cyberpunk: Digital Matrix
              // Falling code blocks
              targetX = special.x + (segment - 0.5) * maxDim * 0.8 * easeProgress;
              targetY = special.y - maxDim * 0.5 + ((time * 500 + i * 100) % (maxDim)) * easeProgress;
              currentSize = p.size * 4;
            } else if (variant === 8) { // Abyssal: Kraken Tentacles
              // Multiple waving arms
              const tentacleId = i % 8;
              const tentacleProgress = (i % (totalParticles / 8)) / (totalParticles / 8);
              const angle = (tentacleId / 8) * Math.PI * 2;
              const wave = Math.sin(tentacleProgress * 5 - time * 5) * 50 * easeProgress;
              
              targetX = special.x + Math.cos(angle) * tentacleProgress * maxDim * 0.4 * easeProgress + Math.cos(angle + Math.PI/2) * wave;
              targetY = special.y + Math.sin(angle) * tentacleProgress * maxDim * 0.4 * easeProgress + Math.sin(angle + Math.PI/2) * wave;
              currentSize = p.size * 3;
            } else if (variant === 9) { // Easter: Giant Egg
              // Oval formation
              const angle = segment * Math.PI * 2;
              const rx = maxDim * 0.25 * easeProgress;
              const ry = maxDim * 0.35 * easeProgress;
              targetX = special.x + Math.cos(angle) * rx;
              targetY = special.y + Math.sin(angle) * ry;
              currentSize = p.size * (2 + Math.sin(time * 5 + i) * 2);
            } else if (variant === 10) { // Matrix: The Architect
              // Geometric cube formation
              const side = Math.floor(segment * 6);
              const subProgress = (segment * 6) % 1;
              const s = maxDim * 0.3 * easeProgress;
              
              if (side === 0) { targetX = special.x - s + subProgress * 2 * s; targetY = special.y - s; }
              else if (side === 1) { targetX = special.x + s; targetY = special.y - s + subProgress * 2 * s; }
              else if (side === 2) { targetX = special.x + s - subProgress * 2 * s; targetY = special.y + s; }
              else if (side === 3) { targetX = special.x - s; targetY = special.y + s - subProgress * 2 * s; }
              else { targetX = special.x + (Math.random() - 0.5) * s * 2; targetY = special.y + (Math.random() - 0.5) * s * 2; }
              currentSize = p.size * 2;
            } else if (variant === 11) { // Cyberpunk 2: Mecha Titan
              // Symmetrical mechanical wings
              const side = i % 2 === 0 ? 1 : -1;
              const wingProg = (i % (totalParticles / 2)) / (totalParticles / 2);
              targetX = special.x + side * (50 + wingProg * maxDim * 0.4) * easeProgress;
              targetY = special.y + (Math.sin(wingProg * 10) * 100) * easeProgress;
              currentSize = p.size * 4;
            } else {
              targetX = special.x + Math.cos(segment * Math.PI * 4 + time * 4) * 150 * easeProgress;
              targetY = special.y + Math.sin(segment * Math.PI * 4 + time * 4) * 150 * easeProgress;
            }
            
            p.x += (targetX - p.x) * 0.1;
            p.y += (targetY - p.y) * 0.1;
          }
        } else if (special.type === 'virus') {
          const elapsed = Date.now() - special.startTime;
          if (elapsed <= special.duration) {
            const progress = elapsed / special.duration;
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const maxDim = Math.max(canvas.width, canvas.height);
            const infectionRadius = easeProgress * maxDim * 1.5;
            const dx = p.x - special.x;
            const dy = p.y - special.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < infectionRadius) {
                // Particle is infected!
                
                // Draw infected aura
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = (variant === 10 || variant === 7 || variant === 11 || variant === 5) ? 'rgba(255,0,0,0.6)' : 
                                variant === 3 ? 'rgba(0,255,0,0.6)' : 
                                variant === 4 ? 'rgba(0,255,255,0.6)' : 
                                variant === 8 ? 'rgba(255,0,0,0.8)' : 
                                variant === 9 ? 'rgba(255,20,147,0.6)' :
                                variant === 1 ? 'rgba(100,0,200,0.6)' :
                                `rgba(255,255,255,0.5)`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, currentSize * 2.5, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();

                if (variant === 1) { // Violet: Void corruption
                    p.vx += (Math.random() - 0.5) * 3;
                    p.vy += (Math.random() - 0.5) * 3;
                    currentSize = Math.max(currentSize, Math.random() * 8 + 2);
                } else if (variant === 2) { // Solar: Plasma
                    p.vy -= Math.random() * 2;
                    p.vx += Math.sin(time * 10 + i) * 2;
                } else if (variant === 3) { // Emerald: Overgrowth lattice
                    p.vx *= 0.7; p.vy *= 0.7;
                    p.x += Math.sin(time * 5 + p.y * 0.01) * 2;
                } else if (variant === 4) { // Glacier: Snap to grid
                    p.x += ((Math.round(p.x / 40) * 40) - p.x) * 0.15;
                    p.y += ((Math.round(p.y / 40) * 40) - p.y) * 0.15;
                    p.vx *= 0.4; p.vy *= 0.4;
                } else if (variant === 5) { // Magma: Ash fall
                    p.vy += 0.8;
                    p.vx += Math.sin(time + i) * 0.8;
                } else if (variant === 6) { // Celestial: Orbiting nodes
                    const angle = Math.atan2(dy, dx) + 0.08;
                    p.x = special.x + Math.cos(angle) * dist;
                    p.y = special.y + Math.sin(angle) * dist;
                } else if (variant === 7 || variant === 11) { // Cyberpunk: Glitch
                    if (Math.random() > 0.85) {
                        p.x += (Math.random() - 0.5) * 150;
                        p.y += (Math.random() - 0.5) * 150;
                    }
                } else if (variant === 8) { // Abyssal: Swarm
                    p.vx += Math.cos(time * 3 + i) * 2;
                    p.vy += Math.sin(time * 3 + i) * 2;
                } else if (variant === 9) { // Easter: Sugar rush
                    p.vx = Math.sin(time * 12 + i) * 10;
                    p.vy = Math.cos(time * 12 + i) * 10;
                } else if (variant === 10) { // Matrix: Red override
                    p.vy += 3;
                    p.x += Math.sin(p.y * 0.08) * 6;
                }
            }
          }
        }

        p.x += dxTarget * p.ease;
        p.y += dyTarget * p.ease;
        
        // Add some sine wave motion
        p.x += Math.sin(time + i) * 0.2;
        p.y += Math.cos(time + i) * 0.2;

        // Mouse Interaction
        const dxMouse = mouseRef.current.x - p.x;
        const dyMouse = mouseRef.current.y - p.y;
        const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
        
        if (distMouseSq < 40000) { // 200 * 200
          const distMouse = Math.sqrt(distMouseSq);
          const force = (200 - distMouse) / 200;
          p.x -= dxMouse * force * 0.05;
          p.y -= dyMouse * force * 0.05;
        }

        const distToTargetSq = dxTarget * dxTarget + dyTarget * dyTarget;
        if (distToTargetSq < 400) {
          p.targetX = Math.random() * canvas.width;
          p.targetY = Math.random() * canvas.height;
        }

        p.rotation += p.rotationSpeed;
        p.pulse += p.pulseSpeed;

        // Wrap around (Portal to opposite side)
        p.x = (p.x % canvas.width + canvas.width) % canvas.width;
        p.y = (p.y % canvas.height + canvas.height) % canvas.height;

        const finalSize = currentSize * (1 + Math.sin(p.pulse) * 0.3);
        const finalOpacity = p.opacity;

        const color = i % 3 === 0 ? accent1 : (i % 3 === 1 ? accent2 : accent3);

        // Draw connections
        let connections = 0;
        const maxConnections = uiCustomizationRef.current?.particleMaxConnections ?? 3;
        const maxDist = uiCustomizationRef.current?.particleConnectionDistance ?? 150;
        const reduceLag = uiCustomizationRef.current?.particleReduceLag ?? false;

        if (!reduceLag) {
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            if (connections >= maxConnections) break;
            const other = particlesRef.current[j];
            const dx = p.x - other.x;
            const dy = p.y - other.y;
            
            // Quick bounding box check before expensive distance calc
            if (Math.abs(dx) > maxDist || Math.abs(dy) > maxDist) continue;

            const distSq = dx * dx + dy * dy;
            
            if (distSq < maxDist * maxDist) {
              connections++;
              const dist = Math.sqrt(distSq);
            ctx.beginPath();
            
            if (variant === 1) { // Violet/Purple (Gravity Lensing)
              const midX = (p.x + other.x) * 0.5;
              const midY = (p.y + other.y) * 0.5;
              const cx = canvas.width * 0.5;
              const cy = canvas.height * 0.5;
              const pullX = (cx - midX) * 0.15;
              const pullY = (cy - midY) * 0.15;
              ctx.moveTo(p.x, p.y);
              ctx.quadraticCurveTo(midX + pullX, midY + pullY, other.x, other.y);
            } else if (variant === 2) { // Solar (Jagged Plasma Arcs)
              const midX = (p.x + other.x) * 0.5 + Math.sin(time * 10 + i) * 10;
              const midY = (p.y + other.y) * 0.5 + Math.cos(time * 10 + j) * 10;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(midX, midY);
              ctx.lineTo(other.x, other.y);
            } else if (variant === 3) { // Emerald (Toxic/Wavy)
              const midX = (p.x + other.x) / 2 + Math.sin(time * 2 + i) * 20;
              const midY = (p.y + other.y) / 2 + Math.cos(time * 2 + j) * 20;
              ctx.moveTo(p.x, p.y);
              ctx.quadraticCurveTo(midX, midY, other.x, other.y);
            } else if (variant === 4) { // Glacier (Digital/Grid)
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(other.x, p.y);
              ctx.lineTo(other.x, other.y);
            } else if (variant === 5) { // Magma (Organic)
              const midX = (p.x + other.x) / 2 + Math.sin(time + i) * 30;
              const midY = (p.y + other.y) / 2 + Math.cos(time + j) * 30;
              ctx.moveTo(p.x, p.y);
              ctx.quadraticCurveTo(midX, midY, other.x, other.y);
            } else if (variant === 6) { // Celestial (Constellations)
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(other.x, other.y);
              // Add a small star at the midpoint
              if (dist < 80) {
                const midX = (p.x + other.x) / 2;
                const midY = (p.y + other.y) / 2;
                ctx.rect(midX - 1, midY - 1, 2, 2);
              }
            } else if (variant === 7) { // Cyberpunk (Circuit traces)
              const midX = (p.x + other.x) / 2;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(midX, p.y);
              ctx.lineTo(midX, other.y);
              ctx.lineTo(other.x, other.y);
            } else if (variant === 8) { // Abyssal (Tentacles)
              const midX = (p.x + other.x) / 2 + Math.sin(time * 3 + i) * 40;
              const midY = (p.y + other.y) / 2 + Math.cos(time * 3 + j) * 40;
              ctx.moveTo(p.x, p.y);
              ctx.bezierCurveTo(p.x, midY, midX, other.y, other.x, other.y);
            }
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.0;
            ctx.globalAlpha = (1 - dist / maxDist) * 0.7 * finalOpacity;
            ctx.stroke();
          }
        }
        }

        ctx.fillStyle = color;
        ctx.globalAlpha = finalOpacity;

        drawShape(ctx, p, p.x, p.y, finalSize);
      });

      // Special Effect Visuals
      if (special.active) {
        const elapsed = performance.now() - special.startTime;
        
        if (special.type === 'singularity') {
          if (special.phase === 'pull') {
            if (elapsed > special.duration) {
              special.phase = 'push';
              special.startTime = performance.now();
              special.duration = 2000;
              
              shockwavesRef.current.push({
                x: special.x,
                y: special.y,
                radius: 0,
                maxRadius: Math.max(canvas.width, canvas.height) * 2,
                speed: 30,
                opacity: 1,
                color: accent1,
                life: 2.5,
                type: 'push'
              });
            } else {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              const easeProgress = progress * progress * (3 - 2 * progress);
              ctx.save();
              ctx.translate(special.x, special.y);
              
              // Core
              const coreRadius = Math.max(0, 60 * (1 + Math.sin(time * 30) * 0.15) * easeProgress);
              const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 2.5);
              coreGrad.addColorStop(0, '#000000');
              coreGrad.addColorStop(0.3, '#000000');
              coreGrad.addColorStop(0.6, accent1);
              coreGrad.addColorStop(1, 'transparent');
              
              ctx.fillStyle = coreGrad;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, coreRadius * 2.5), 0, Math.PI * 2);
              ctx.fill();

              // Sucking Particles
              ctx.fillStyle = accent2;
              for (let i = 0; i < 20; i++) {
                const pAngle = (i * Math.PI * 2) / 20 + time * 10;
                const pDist = (400 * (1 - ((progress * 5 + i * 0.1) % 1))) + coreRadius;
                const px = pDist * Math.cos(pAngle);
                const py = pDist * Math.sin(pAngle);
                ctx.beginPath();
                ctx.arc(px, py, Math.max(0, 2 * (1 - progress)), 0, Math.PI * 2);
                ctx.fill();
              }

              // Variant specific visuals
              ctx.strokeStyle = accent3;
              ctx.lineWidth = 3;
              ctx.globalAlpha = easeProgress;

              if (variant === 1) {
                // Violet: Black Hole
                const r = Math.max(0, 180 * easeProgress);
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, r), 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                ctx.lineWidth = 6;
                ctx.strokeStyle = accent1;
                ctx.stroke();
                
                for (let i = 0; i < 12; i++) {
                  const angle = (i * Math.PI * 2) / 12 + time * 4;
                  const swirlR = r * (1 + Math.sin(time * 2 + i) * 0.2);
                  ctx.beginPath();
                  ctx.moveTo(swirlR * Math.cos(angle), swirlR * Math.sin(angle));
                  ctx.quadraticCurveTo(
                    swirlR * 2.5 * Math.cos(angle + 2), swirlR * 2.5 * Math.sin(angle + 2),
                    swirlR * 5 * Math.cos(angle + 4), swirlR * 5 * Math.sin(angle + 4)
                  );
                  ctx.lineWidth = 1.5;
                  ctx.strokeStyle = accent2;
                  ctx.stroke();
                }
              } else if (variant === 2) {
                // Solar: Coronal Mass Ejection
                const r = Math.max(0, 120 * easeProgress);
                const corePulse = Math.sin(time * 20) * 10;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, r + corePulse), 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                for (let i = 0; i < 16; i++) {
                  const angle = (i * Math.PI * 2) / 16 + time * 2;
                  const flareLength = r * 2 + Math.sin(time * 10 + i) * r;
                  ctx.beginPath();
                  ctx.moveTo(r * Math.cos(angle), r * Math.sin(angle));
                  ctx.lineTo(flareLength * Math.cos(angle), flareLength * Math.sin(angle));
                  ctx.strokeStyle = accent2;
                  ctx.lineWidth = 4;
                  ctx.stroke();
                }
              } else if (variant === 3) {
                // Emerald: Toxic vortex
                for (let i = 0; i < 30; i++) {
                  const angle = (i * Math.PI * 2) / 30 + time * 10;
                  const r = Math.max(0, 150 * easeProgress * (1 + Math.sin(time * 7 + i) * 0.3));
                  ctx.beginPath();
                  ctx.arc(r * Math.cos(angle), r * Math.sin(angle), Math.max(0, 6 * easeProgress), 0, Math.PI * 2);
                  ctx.stroke();
                  if (i % 3 === 0) {
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
                    ctx.stroke();
                  }
                }
              } else if (variant === 4) {
                // Glacier: Digital grid collapse
                const size = 300 * easeProgress;
                ctx.lineWidth = 1;
                for (let i = -8; i <= 8; i++) {
                  ctx.beginPath();
                  ctx.moveTo(i * 40 * easeProgress, -size);
                  ctx.lineTo(i * 40 * easeProgress, size);
                  ctx.stroke();
                  ctx.beginPath();
                  ctx.moveTo(-size, i * 40 * easeProgress);
                  ctx.lineTo(size, i * 40 * easeProgress);
                  ctx.stroke();
                }
                ctx.lineWidth = 2;
                ctx.beginPath();
                const scanRadius = Math.max(0, (time * 500) % Math.max(1, 400 * easeProgress));
                ctx.arc(0, 0, Math.max(0, scanRadius), 0, Math.PI * 2);
                ctx.stroke();
              } else if (variant === 5) {
                // Magma: Organic pulsing veins
                for (let i = 0; i < 16; i++) {
                  const angle = (i * Math.PI * 2) / 16 + time * 6;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  for (let r = 0; r < 250 * easeProgress; r += 5) {
                    const x = r * Math.cos(angle + Math.sin(r * 0.08 + time * 15) * 0.8);
                    const y = r * Math.sin(angle + Math.sin(r * 0.08 + time * 15) * 0.8);
                    ctx.lineTo(x, y);
                  }
                  ctx.stroke();
                }
              } else if (variant === 6) {
                // Celestial: Supernova collapsing
                const r = Math.max(0, 200 * easeProgress);
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, r), 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(0, r));
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.5, accent1);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fill();
                
                // Starburst rays
                for (let i = 0; i < 24; i++) {
                  const angle = (i * Math.PI * 2) / 24 + time;
                  const rayLen = r * 1.5 * (1 + Math.sin(time * 15 + i) * 0.5);
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(rayLen * Math.cos(angle), rayLen * Math.sin(angle));
                  ctx.strokeStyle = accent2;
                  ctx.lineWidth = 2;
                  ctx.stroke();
                }
              } else if (variant === 7) {
                // Cyberpunk: Digital black hole with binary rings
                const r = Math.max(0, 160 * easeProgress);
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, r), 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 4;
                ctx.stroke();
                
                // Concentric dashed rings
                for (let i = 1; i <= 4; i++) {
                  ctx.beginPath();
                  ctx.arc(0, 0, Math.max(0, r + i * 30 * easeProgress), 0, Math.PI * 2);
                  ctx.setLineDash([10, 15]);
                  ctx.strokeStyle = i % 2 === 0 ? accent2 : accent3;
                  ctx.lineWidth = 2;
                  ctx.stroke();
                  ctx.setLineDash([]);
                }
              } else if (variant === 8) {
                // Abyssal: Deep sea maelstrom
                const r = Math.max(0, 220 * easeProgress);
                for (let i = 0; i < 5; i++) {
                  ctx.beginPath();
                  ctx.arc(0, 0, Math.max(0, r - i * 40 * easeProgress), 0, Math.PI * 2);
                  ctx.strokeStyle = i % 2 === 0 ? accent1 : accent2;
                  ctx.lineWidth = 10 * easeProgress;
                  ctx.stroke();
                }
                // Swirling tentacles
                for (let i = 0; i < 8; i++) {
                  const angle = (i * Math.PI * 2) / 8 - time * 5;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  for (let j = 0; j < 10; j++) {
                    const tAngle = angle + j * 0.5;
                    const tDist = j * 30 * easeProgress;
                    ctx.lineTo(tDist * Math.cos(tAngle), tDist * Math.sin(tAngle));
                  }
                  ctx.strokeStyle = accent3;
                  ctx.lineWidth = 4;
                  ctx.stroke();
                }
              }
              ctx.restore();
            }
          } else if (special.phase === 'push') {
            if (elapsed > special.duration) {
              special.active = false;
            }
          }
        } else if (special.type === 'tesseract') {
          if (special.phase === 'form') {
            if (elapsed > special.duration) {
              special.phase = 'shatter';
              special.startTime = performance.now();
              special.duration = 1500;
              
              // Add shatter shockwaves
              for (let i = 0; i < 4; i++) {
                shockwavesRef.current.push({
                  x: special.x + (Math.random() - 0.5) * 100,
                  y: special.y + (Math.random() - 0.5) * 100,
                  radius: 0,
                  maxRadius: 800,
                  speed: 20 + Math.random() * 10,
                  opacity: 1,
                  color: i % 2 === 0 ? accent2 : accent3,
                  life: 1.5,
                  type: 'push'
                });
              }
            } else {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              const easeProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
              
              ctx.save();
              ctx.translate(special.x, special.y);
              
              // Variant specific tesseract projection
              ctx.globalAlpha = easeProgress;
              const size = 150 * easeProgress;
              const angle1 = time * 2;
              const angle2 = time * 1.5;
              
              if (variant === 1) {
                // Violet: Gravity-distorted tesseract
                const s1 = size;
                const s2 = size * 0.4;
                ctx.shadowBlur = 20;
                ctx.shadowColor = accent1;
                ctx.lineWidth = 3;
                
                ctx.strokeStyle = accent1;
                ctx.beginPath();
                for(let i=0; i<4; i++) {
                   const t1 = angle1 + (i*Math.PI)/2;
                   const t2 = angle1 + ((i+1)*Math.PI)/2;
                   ctx.moveTo(s1*Math.cos(t1), s1*Math.sin(t1));
                   ctx.quadraticCurveTo(0, 0, s1*Math.cos(t2), s1*Math.sin(t2));
                }
                ctx.stroke();
                
                ctx.strokeStyle = accent2;
                ctx.beginPath();
                for(let i=0; i<4; i++) {
                   const t1 = angle2 + (i*Math.PI)/2;
                   const t2 = angle2 + ((i+1)*Math.PI)/2;
                   ctx.moveTo(s2*Math.cos(t1), s2*Math.sin(t1));
                   const midX = (s2*Math.cos(t1) + s2*Math.cos(t2))/2;
                   const midY = (s2*Math.sin(t1) + s2*Math.sin(t2))/2;
                   ctx.quadraticCurveTo(midX*2, midY*2, s2*Math.cos(t2), s2*Math.sin(t2));
                }
                ctx.stroke();
                
                ctx.strokeStyle = accent3;
                ctx.beginPath();
                for(let i=0; i<4; i++) {
                   const t1 = angle1 + (i*Math.PI)/2;
                   const t2 = angle2 + (i*Math.PI)/2;
                   ctx.moveTo(s1*Math.cos(t1), s1*Math.sin(t1));
                   ctx.quadraticCurveTo(0, 0, s2*Math.cos(t2), s2*Math.sin(t2));
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
              } else if (variant === 2) {
                // Solar: Fiery, jagged tesseract
                const s1 = size * (1 + Math.sin(time * 10) * 0.05);
                const s2 = size * 0.5 * (1 + Math.cos(time * 12) * 0.05);
                const drawJaggedLine = (x1: number, y1: number, x2: number, y2: number) => {
                  ctx.moveTo(x1, y1);
                  const steps = 5;
                  for(let i=1; i<=steps; i++) {
                    const t = i/steps;
                    const nx = x1 + (x2-x1)*t + (Math.random()-0.5)*20;
                    const ny = y1 + (y2-y1)*t + (Math.random()-0.5)*20;
                    ctx.lineTo(nx, ny);
                  }
                };
                ctx.lineWidth = 3;
                ctx.strokeStyle = accent1;
                ctx.beginPath();
                for(let i=0; i<4; i++) {
                   const t1 = angle1 + (i*Math.PI)/2;
                   const t2 = angle1 + ((i+1)*Math.PI)/2;
                   drawJaggedLine(s1*Math.cos(t1), s1*Math.sin(t1), s1*Math.cos(t2), s1*Math.sin(t2));
                }
                ctx.stroke();
                ctx.strokeStyle = accent2;
                ctx.beginPath();
                for(let i=0; i<4; i++) {
                   const t1 = angle2 + (i*Math.PI)/2;
                   const t2 = angle2 + ((i+1)*Math.PI)/2;
                   drawJaggedLine(s2*Math.cos(t1), s2*Math.sin(t1), s2*Math.cos(t2), s2*Math.sin(t2));
                }
                ctx.stroke();
                ctx.strokeStyle = accent3;
                ctx.beginPath();
                for(let i=0; i<4; i++) {
                   const t1 = angle1 + (i*Math.PI)/2;
                   const t2 = angle2 + (i*Math.PI)/2;
                   drawJaggedLine(s1*Math.cos(t1), s1*Math.sin(t1), s2*Math.cos(t2), s2*Math.sin(t2));
                }
                ctx.stroke();
              } else if (variant === 3) {
                // Emerald: Toxic, wavy tesseract
                const s1 = size;
                const s2 = size * 0.5;
                const drawWavyLine = (x1: number, y1: number, x2: number, y2: number, offset: number) => {
                  ctx.moveTo(x1, y1);
                  const steps = 10;
                  for(let i=1; i<=steps; i++) {
                    const t = i/steps;
                    const midX = x1 + (x2-x1)*t;
                    const midY = y1 + (y2-y1)*t;
                    const wave = Math.sin(t * Math.PI * 4 + time * 5 + offset) * 15;
                    const dx = x2-x1; const dy = y2-y1;
                    const len = Math.sqrt(dx*dx+dy*dy);
                    const px = -dy/len * wave;
                    const py = dx/len * wave;
                    ctx.lineTo(midX + px, midY + py);
                  }
                };
                ctx.lineWidth = 4;
                ctx.strokeStyle = accent1;
                ctx.beginPath();
                for(let i=0; i<4; i++) {
                   const t1 = angle1 + (i*Math.PI)/2;
                   const t2 = angle1 + ((i+1)*Math.PI)/2;
                   drawWavyLine(s1*Math.cos(t1), s1*Math.sin(t1), s1*Math.cos(t2), s1*Math.sin(t2), i);
                }
                ctx.stroke();
                ctx.strokeStyle = accent2;
                ctx.beginPath();
                for(let i=0; i<4; i++) {
                   const t1 = angle2 + (i*Math.PI)/2;
                   const t2 = angle2 + ((i+1)*Math.PI)/2;
                   drawWavyLine(s2*Math.cos(t1), s2*Math.sin(t1), s2*Math.cos(t2), s2*Math.sin(t2), i+4);
                }
                ctx.stroke();
                ctx.strokeStyle = accent3;
                ctx.beginPath();
                for(let i=0; i<4; i++) {
                   const t1 = angle1 + (i*Math.PI)/2;
                   const t2 = angle2 + (i*Math.PI)/2;
                   drawWavyLine(s1*Math.cos(t1), s1*Math.sin(t1), s2*Math.cos(t2), s2*Math.sin(t2), i+8);
                }
                ctx.stroke();
              } else if (variant === 4) {
                // Glacier: High-tech, multi-layered tesseract
                const s1 = size * 1.2;
                const s2 = size * 0.8;
                const s3 = size * 0.4;
                ctx.lineWidth = 2;
                [s1, s2, s3].forEach((s, idx) => {
                  ctx.strokeStyle = idx === 0 ? accent1 : (idx === 1 ? accent2 : accent3);
                  ctx.beginPath();
                  ctx.rect(-s, -s, s*2, s*2);
                  ctx.stroke();
                  ctx.fillStyle = accent3;
                  [[-s,-s], [s,-s], [s,s], [-s,s]].forEach(([nx, ny]) => {
                     ctx.fillRect(nx-4, ny-4, 8, 8);
                  });
                });
                ctx.strokeStyle = accent2;
                ctx.beginPath();
                [[-1,-1], [1,-1], [1,1], [-1,1]].forEach(([dx, dy]) => {
                   ctx.moveTo(dx*s1, dy*s1);
                   ctx.lineTo(dx*s3, dy*s3);
                });
                ctx.stroke();
                const scanY = -s1 + (time * 200) % (s1 * 2);
                ctx.strokeStyle = accent3;
                ctx.beginPath();
                ctx.moveTo(-s1*1.5, scanY);
                ctx.lineTo(s1*1.5, scanY);
                ctx.stroke();
              } else if (variant === 5) {
                // Magma: Pulsing, organic tesseract
                const pulse = Math.sin(time * 8) * 0.2;
                const s1 = size * (1 + pulse);
                const s2 = size * 0.5 * (1 - pulse);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                const drawPulsingSquare = (s: number, a: number, color: string, width: number) => {
                  ctx.strokeStyle = color;
                  ctx.lineWidth = width;
                  ctx.beginPath();
                  for (let i = 0; i < 4; i++) {
                    const theta = a + (i * Math.PI) / 2;
                    const px = s * Math.cos(theta);
                    const py = s * Math.sin(theta);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                  }
                  ctx.closePath();
                  ctx.stroke();
                };
                
                drawPulsingSquare(s1, angle1, accent1, 6 + pulse*10);
                drawPulsingSquare(s2, angle2, accent2, 4 - pulse*5);
                
                ctx.strokeStyle = accent3;
                ctx.lineWidth = 5;
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                  const t1 = angle1 + (i * Math.PI) / 2;
                  const t2 = angle2 + (i * Math.PI) / 2;
                  ctx.moveTo(s1 * Math.cos(t1), s1 * Math.sin(t1));
                  ctx.lineTo(s2 * Math.cos(t2), s2 * Math.sin(t2));
                }
                ctx.stroke();
                ctx.lineCap = 'butt';
                ctx.lineJoin = 'miter';
              } else if (variant === 6) {
                // Celestial: Constellation tesseract
                const s1 = size;
                const s2 = size * 0.5;
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = accent2;
                
                const drawConstellationSquare = (s: number, a: number) => {
                  ctx.beginPath();
                  for (let i = 0; i < 4; i++) {
                    const theta = a + (i * Math.PI) / 2;
                    const px = s * Math.cos(theta);
                    const py = s * Math.sin(theta);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                  }
                  ctx.closePath();
                  ctx.stroke();
                  
                  // Draw stars at corners
                  ctx.fillStyle = accent1;
                  for (let i = 0; i < 4; i++) {
                    const theta = a + (i * Math.PI) / 2;
                    const px = s * Math.cos(theta);
                    const py = s * Math.sin(theta);
                    ctx.beginPath();
                    ctx.arc(px, py, Math.max(0, 4 + Math.sin(time * 10 + i) * 2), 0, Math.PI * 2);
                    ctx.fill();
                  }
                };
                
                drawConstellationSquare(s1, angle1);
                drawConstellationSquare(s2, angle2);
                
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                  const t1 = angle1 + (i * Math.PI) / 2;
                  const t2 = angle2 + (i * Math.PI) / 2;
                  ctx.moveTo(s1 * Math.cos(t1), s1 * Math.sin(t1));
                  ctx.lineTo(s2 * Math.cos(t2), s2 * Math.sin(t2));
                }
                ctx.strokeStyle = accent3;
                ctx.stroke();
              } else if (variant === 7) {
                // Cyberpunk: Wireframe with digital rain
                const s1 = size;
                const s2 = size * 0.6;
                ctx.lineWidth = 2;
                
                const drawNeonSquare = (s: number, a: number, color: string) => {
                  ctx.strokeStyle = color;
                  ctx.shadowBlur = 10;
                  ctx.shadowColor = color;
                  ctx.beginPath();
                  for (let i = 0; i < 4; i++) {
                    const theta = a + (i * Math.PI) / 2;
                    const px = s * Math.cos(theta);
                    const py = s * Math.sin(theta);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                  }
                  ctx.closePath();
                  ctx.stroke();
                  ctx.shadowBlur = 0;
                };
                
                drawNeonSquare(s1, angle1, accent1);
                drawNeonSquare(s2, angle2, accent2);
                
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                  const t1 = angle1 + (i * Math.PI) / 2;
                  const t2 = angle2 + (i * Math.PI) / 2;
                  ctx.moveTo(s1 * Math.cos(t1), s1 * Math.sin(t1));
                  ctx.lineTo(s2 * Math.cos(t2), s2 * Math.sin(t2));
                }
                ctx.strokeStyle = accent3;
                ctx.stroke();
              } else if (variant === 8) {
                // Abyssal: Water cube
                const s1 = size * (1 + Math.sin(time * 3) * 0.1);
                const s2 = size * 0.5 * (1 + Math.cos(time * 2) * 0.1);
                ctx.lineWidth = 3;
                
                const drawWaterSquare = (s: number, a: number, color: string) => {
                  ctx.strokeStyle = color;
                  ctx.fillStyle = color + '40'; // transparent fill
                  ctx.beginPath();
                  for (let i = 0; i < 4; i++) {
                    const theta = a + (i * Math.PI) / 2;
                    const px = s * Math.cos(theta);
                    const py = s * Math.sin(theta);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.quadraticCurveTo(0, 0, px, py); // Wavy edges
                  }
                  ctx.closePath();
                  ctx.fill();
                  ctx.stroke();
                };
                
                drawWaterSquare(s1, angle1, accent1);
                drawWaterSquare(s2, angle2, accent2);
                
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                  const t1 = angle1 + (i * Math.PI) / 2;
                  const t2 = angle2 + (i * Math.PI) / 2;
                  ctx.moveTo(s1 * Math.cos(t1), s1 * Math.sin(t1));
                  ctx.lineTo(s2 * Math.cos(t2), s2 * Math.sin(t2));
                }
                ctx.strokeStyle = accent3;
                ctx.stroke();
              }
              
              ctx.restore();
            }
          } else if (special.phase === 'shatter') {
            if (elapsed > special.duration) {
              special.active = false;
            } else {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              ctx.save();
              ctx.translate(special.x, special.y);
              
              // Variant specific shatter
              ctx.globalAlpha = 1 - progress;
              if (variant === 1) {
                // Void: Implodes into a point, then fades
                const r = 150 * (1 - progress);
                ctx.fillStyle = accent1;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, r), 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = accent2;
                ctx.lineWidth = 5;
                ctx.strokeRect(-r, -r, r*2, r*2);
              } else if (variant === 2) {
                // Solar: Explodes into fiery sparks
                for (let i = 0; i < 30; i++) {
                  const angle = (i * Math.PI * 2) / 30 + Math.random();
                  const dist = progress * 600 * Math.random();
                  const r = 10 * (1 - progress) * Math.random();
                  ctx.fillStyle = Math.random() > 0.5 ? accent1 : accent2;
                  ctx.beginPath();
                  ctx.arc(dist * Math.cos(angle), dist * Math.sin(angle), Math.max(0, r), 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (variant === 3) {
                // Emerald: Melts into puddles dropping down
                for (let i = 0; i < 15; i++) {
                  const x = (Math.random() - 0.5) * 300;
                  const y = progress * 500 + Math.random() * 100;
                  const w = 30 * (1 - progress);
                  const h = 60 * (1 - progress) * Math.random();
                  ctx.fillStyle = accent3;
                  ctx.beginPath();
                  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (variant === 4) {
                // Glacier: Glitches out horizontally
                for (let i = 0; i < 20; i++) {
                  const y = (Math.random() - 0.5) * 300;
                  const x = (Math.random() - 0.5) * 600 * progress;
                  const w = 100 * Math.random() * (1 - progress);
                  const h = 10;
                  ctx.fillStyle = accent1;
                  ctx.fillRect(x, y, w, h);
                }
              } else if (variant === 5) {
                // Magma: Splatters outward
                for (let i = 0; i < 25; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const dist = progress * 500 * (0.5 + Math.random() * 0.5);
                  const r = 25 * (1 - progress) * Math.random();
                  ctx.fillStyle = accent2;
                  ctx.beginPath();
                  ctx.arc(dist * Math.cos(angle), dist * Math.sin(angle), Math.max(0, r), 0, Math.PI * 2);
                  ctx.fill();
                  ctx.strokeStyle = accent1;
                  ctx.lineWidth = r;
                  ctx.beginPath();
                  ctx.moveTo(dist * Math.cos(angle), dist * Math.sin(angle));
                  ctx.lineTo((dist - 50) * Math.cos(angle), (dist - 50) * Math.sin(angle));
                  ctx.stroke();
                }
              } else if (variant === 6) {
                // Celestial: Shoots shooting stars outwards
                for (let i = 0; i < 12; i++) {
                  const angle = (i * Math.PI * 2) / 12 + time;
                  const dist = progress * 800;
                  ctx.fillStyle = accent1;
                  ctx.beginPath();
                  ctx.arc(dist * Math.cos(angle), dist * Math.sin(angle), Math.max(0, 5 * (1 - progress)), 0, Math.PI * 2);
                  ctx.fill();
                  
                  // Trail
                  ctx.strokeStyle = accent2;
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.moveTo(dist * Math.cos(angle), dist * Math.sin(angle));
                  ctx.lineTo((dist - 100) * Math.cos(angle), (dist - 100) * Math.sin(angle));
                  ctx.stroke();
                }
              } else if (variant === 7) {
                // Cyberpunk: Digital rain/matrix shatter
                ctx.font = "20px monospace";
                for (let i = 0; i < 40; i++) {
                  const x = (Math.random() - 0.5) * 400;
                  const y = (Math.random() - 0.5) * 400 + progress * 300;
                  ctx.fillStyle = Math.random() > 0.5 ? accent1 : accent3;
                  ctx.fillText(Math.random() > 0.5 ? "0" : "1", x, y);
                }
              } else if (variant === 8) {
                // Abyssal: Bursts into bubbles
                for (let i = 0; i < 30; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const dist = progress * 400 * Math.random();
                  const r = 30 * (1 - progress) * Math.random();
                  ctx.strokeStyle = accent3;
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.arc(dist * Math.cos(angle), dist * Math.sin(angle), Math.max(0, r), 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.fillStyle = accent1 + '80';
                  ctx.fill();
                }
              }
              
              ctx.restore();
            }
          }
        } else if (special.type === 'starburst') {
          if (special.phase === 'ignite') {
            if (elapsed > special.duration) {
              special.phase = 'explode';
              special.startTime = performance.now();
              special.duration = 3000;
              
              // Triple Shockwave
              [0, 200, 400].forEach((delay, i) => {
                setTimeout(() => {
                  shockwavesRef.current.push({
                    x: special.x,
                    y: special.y,
                    radius: 0,
                    maxRadius: Math.max(canvas.width, canvas.height) * 2,
                    speed: 40 - i * 5,
                    opacity: 1,
                    color: i === 0 ? accent1 : (i === 1 ? accent2 : accent3),
                    life: 3.5,
                    type: 'push'
                  });
                }, delay);
              });
            } else {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              const easeProgress = progress * progress * (3 - 2 * progress);
              
              // Screen Shake during ignition
              const shake = (Math.random() - 0.5) * 10 * progress;
              ctx.save();
              ctx.translate(special.x + shake, special.y + shake);
              
              // Draw a massive glowing star with pulsing core
              const starSize = 120 * easeProgress * (1 + Math.sin(time * 30) * 0.2);
              
              // Variant specific star shape
              const drawStar = (size: number) => {
                ctx.beginPath();
                if (variant === 1 || variant === 7) {
                  // Diamond/4-point
                  for (let i = 0; i < 8; i++) {
                    const angle = i * Math.PI / 4 + time * 2;
                    const radius = i % 2 === 0 ? size : size * 0.2;
                    if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                    else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                  }
                } else if (variant === 3 || variant === 8 || variant === 9) {
                  // Hexagon/Bubble/Easter
                  const points = variant === 9 ? 8 : 6;
                  for (let i = 0; i < points; i++) {
                    const angle = i * Math.PI * 2 / points + time;
                    const radius = variant === 9 ? size * (1 + Math.sin(time * 5 + i) * 0.1) : size;
                    if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                    else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                  }
                } else {
                  // 5-point star
                  for (let i = 0; i < 10; i++) {
                    const angle = i * Math.PI / 5 - Math.PI / 2 + time * 4;
                    const radius = i % 2 === 0 ? size : size * 0.35;
                    if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                    else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                  }
                }
                ctx.closePath();
              };

              // Multi-layered glow
              for (let i = 3; i > 0; i--) {
                ctx.save();
                const layerSize = starSize * (1 + i * 0.3);
                drawStar(layerSize);
                ctx.globalAlpha = 0.2 / i;
                ctx.fillStyle = i === 1 ? '#ffffff' : (i === 2 ? accent2 : accent1);
                ctx.fill();
                ctx.restore();
              }

              drawStar(starSize);
              const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(0, starSize));
              grad.addColorStop(0, '#ffffff');
              grad.addColorStop(0.4, variant === 9 ? accent1 : accent2);
              grad.addColorStop(1, 'transparent');
              
              ctx.fillStyle = grad;
              ctx.fill();
              
              ctx.strokeStyle = variant === 9 ? accent3 : accent1;
              ctx.lineWidth = 5 * easeProgress;
              ctx.stroke();
              
              // Energy gathering lines (Swirling in)
              for (let i = 0; i < 24; i++) {
                const angle = (i * Math.PI * 2) / 24 + time * 8;
                const dist = 400 * (1 - ((progress * 4 + i * 0.1) % 1));
                const swirl = Math.sin(progress * Math.PI) * 100;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * dist + Math.sin(angle) * swirl, Math.sin(angle) * dist - Math.cos(angle) * swirl);
                ctx.lineTo(Math.cos(angle) * (dist - 30), Math.sin(angle) * (dist - 30));
                ctx.strokeStyle = i % 2 === 0 ? accent2 : accent3;
                ctx.lineWidth = 2;
                ctx.stroke();
              }
              
              ctx.restore();
            }
          } else if (special.phase === 'explode') {
            if (elapsed > special.duration) {
              special.active = false;
            } else {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              
              // Screen Shake during explosion
              const shake = (Math.random() - 0.5) * 20 * (1 - progress);
              ctx.save();
              ctx.translate(special.x + shake, special.y + shake);
              
              // Fading star with rotation
              const starSize = 120 * (1 - progress);
              
              const drawStar = (size: number) => {
                ctx.beginPath();
                const rot = time * 10 * (1 - progress);
                if (variant === 1 || variant === 7) {
                  for (let i = 0; i < 8; i++) {
                    const angle = i * Math.PI / 4 + rot;
                    const radius = i % 2 === 0 ? size : size * 0.2;
                    if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                    else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                  }
                } else if (variant === 3 || variant === 8 || variant === 9) {
                  const points = variant === 9 ? 8 : 6;
                  for (let i = 0; i < points; i++) {
                    const angle = i * Math.PI * 2 / points + rot;
                    if (i === 0) ctx.moveTo(Math.cos(angle) * size, Math.sin(angle) * size);
                    else ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
                  }
                } else {
                  for (let i = 0; i < 10; i++) {
                    const angle = i * Math.PI / 5 - Math.PI / 2 + rot;
                    const radius = i % 2 === 0 ? size : size * 0.35;
                    if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                    else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                  }
                }
                ctx.closePath();
              };

              drawStar(starSize);
              ctx.fillStyle = accent2;
              ctx.globalAlpha = 1 - progress;
              ctx.fill();
              
              // Intense explosion particles
              for (let i = 0; i < 40; i++) {
                const angle = (i * Math.PI * 2) / 40 + (Math.random() - 0.5) * 0.5;
                const dist = progress * 1200 * (0.5 + Math.random() * 0.5);
                const r = 20 * (1 - progress) * Math.random();
                
                ctx.beginPath();
                if (variant === 6 || variant === 9) {
                  // Celestial/Easter: Starburst rays + sparkles
                  ctx.moveTo(dist * Math.cos(angle), dist * Math.sin(angle));
                  ctx.lineTo((dist + 100 * (1 - progress)) * Math.cos(angle), (dist + 100 * (1 - progress)) * Math.sin(angle));
                  
                  if (variant === 9) {
                    const colors = ['#ffb7ce', '#ffffd1', '#b2e2f2', '#e0c3fc', '#fdfd96', '#ffdab9'];
                    ctx.strokeStyle = colors[i % colors.length];
                  } else {
                    ctx.strokeStyle = i % 2 === 0 ? accent1 : accent2;
                  }
                  
                  ctx.lineWidth = 4 * (1 - progress);
                  ctx.stroke();
                  
                  if (Math.random() > 0.7) {
                    ctx.beginPath();
                    if (variant === 9) {
                      // Draw small egg shapes
                      ctx.ellipse(dist * Math.cos(angle), dist * Math.sin(angle), r * 0.6, r * 0.8, angle, 0, Math.PI * 2);
                    } else {
                      ctx.arc(dist * Math.cos(angle), dist * Math.sin(angle), Math.max(0, r * 0.5), 0, Math.PI * 2);
                    }
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                  }
                } else if (variant === 7) {
                  // Cyberpunk: Digital fragments
                  ctx.rect(dist * Math.cos(angle), dist * Math.sin(angle), r, r);
                  ctx.fillStyle = i % 2 === 0 ? accent1 : accent3;
                  ctx.fill();
                } else {
                  // Default
                  ctx.arc(dist * Math.cos(angle), dist * Math.sin(angle), Math.max(0, r), 0, Math.PI * 2);
                  ctx.fillStyle = i % 3 === 0 ? accent1 : (i % 3 === 1 ? accent2 : accent3);
                  ctx.fill();
                }
              }
              
              ctx.restore();
            }
          }
        } else if (special.type === 'dna') {
          if (special.phase === 'helix') {
            if (elapsed > special.duration) {
              special.active = false;
            } else {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              const easeProgress = Math.sin(progress * Math.PI); // Fade in and out
              
              ctx.save();
              ctx.translate(special.x, special.y);
              
              const lineAngle = special.points && special.points.length >= 2 
                ? Math.atan2(special.points[special.points.length-1].y - special.points[0].y, special.points[special.points.length-1].x - special.points[0].x)
                : 0;
              
              ctx.rotate(lineAngle);
              
              ctx.globalAlpha = easeProgress * 0.8;
              
              // Draw the central axis or connections
              const length = 800;
              
              if (variant === 1) {
                // Violet: Neural Network Pulse
                ctx.globalCompositeOperation = 'screen';
                
                // Central Axis Glow
                const axisGrad = ctx.createLinearGradient(-length/2, 0, length/2, 0);
                axisGrad.addColorStop(0, 'transparent');
                axisGrad.addColorStop(0.5, accent1 + '80');
                axisGrad.addColorStop(1, 'transparent');
                ctx.strokeStyle = axisGrad;
                ctx.lineWidth = 10 * easeProgress;
                ctx.beginPath();
                ctx.moveTo(-length/2, 0);
                ctx.lineTo(length/2, 0);
                ctx.stroke();

                // Data Streams
                for (let i = 0; i < 3; i++) {
                  ctx.beginPath();
                  ctx.moveTo(-length/2, 0);
                  for (let x = -length/2; x < length/2; x += 20) {
                    const freq = 0.015;
                    const amp = 60 * easeProgress;
                    const y = Math.sin(x * freq + time * 10 + i * Math.PI / 1.5) * amp;
                    ctx.lineTo(x, y);
                    
                    // Data Nodes
                    if (x % 60 === 0) {
                      ctx.fillStyle = i === 0 ? accent1 : (i === 1 ? accent2 : accent3);
                      ctx.beginPath();
                      ctx.arc(x, y, 4 * easeProgress, 0, Math.PI * 2);
                      ctx.fill();
                    }
                  }
                  ctx.strokeStyle = i === 0 ? accent1 : (i === 1 ? accent2 : accent3);
                  ctx.lineWidth = 2;
                  ctx.stroke();
                }
              } else if (variant === 2) {
                // Solar: Plasma Filament
                ctx.globalCompositeOperation = 'lighter';
                
                // Heat Haze
                ctx.fillStyle = accent1 + '10';
                for (let i = 0; i < 5; i++) {
                  const hx = (time * 200 + i * 100) % length - length/2;
                  ctx.fillRect(hx, -100, 50, 200);
                }

                // Core Plasma Arc
                ctx.beginPath();
                ctx.moveTo(-length/2, 0);
                for (let x = -length/2; x < length/2; x += 5) {
                  const jitter = (Math.random() - 0.5) * 20 * easeProgress;
                  ctx.lineTo(x, jitter);
                }
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4 * easeProgress;
                ctx.shadowBlur = 30;
                ctx.shadowColor = accent1;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Solar Flares
                for (let i = 0; i < 8; i++) {
                  const fx = (i / 8) * length - length/2;
                  const fy = Math.sin(time * 5 + i) * 40;
                  const fGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 60 * easeProgress);
                  fGrad.addColorStop(0, accent2 + '80');
                  fGrad.addColorStop(1, 'transparent');
                  ctx.fillStyle = fGrad;
                  ctx.beginPath();
                  ctx.arc(fx, fy, 60 * easeProgress, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (variant === 3) {
                // Emerald: Ancient Root Growth
                ctx.globalCompositeOperation = 'source-over';
                
                for (let i = 0; i < 4; i++) {
                  ctx.beginPath();
                  ctx.moveTo(-length/2, 0);
                  for (let x = -length/2; x < length/2; x += 15) {
                    const noise = Math.sin(x * 0.03 + time * 2 + i) * 20;
                    const y = Math.sin(x * 0.01 + time + i * Math.PI / 2) * 50 * easeProgress + noise;
                    ctx.lineTo(x, y);
                    
                    // Thorns and Leaves
                    if (x % 45 === 0) {
                      ctx.save();
                      ctx.translate(x, y);
                      ctx.rotate(Math.atan2(y, x) + Math.PI/2);
                      ctx.fillStyle = accent1;
                      ctx.beginPath();
                      ctx.moveTo(0, 0);
                      ctx.lineTo(-5, -15);
                      ctx.lineTo(5, -15);
                      ctx.fill();
                      
                      if (easeProgress > 0.6) {
                        ctx.fillStyle = accent3;
                        ctx.beginPath();
                        ctx.arc(0, -20, 5, 0, Math.PI * 2);
                        ctx.fill();
                      }
                      ctx.restore();
                    }
                  }
                  ctx.strokeStyle = i % 2 === 0 ? accent1 : accent2;
                  ctx.lineWidth = 8 * (1 - i/4) * easeProgress;
                  ctx.stroke();
                }
              } else if (variant === 4) {
                // Glacier: Crystal Lattice
                ctx.globalCompositeOperation = 'lighter';
                
                // Frost Particles
                for (let i = 0; i < 50; i++) {
                  const px = (Math.random() - 0.5) * length;
                  const py = (Math.random() - 0.5) * 200;
                  ctx.fillStyle = '#ffffff80';
                  ctx.beginPath();
                  ctx.arc(px, py, 2 * easeProgress, 0, Math.PI * 2);
                  ctx.fill();
                }

                for (let x = -length/2; x < length/2; x += 40) {
                  const size = (30 + Math.sin(x * 0.1 + time * 5) * 20) * easeProgress;
                  ctx.save();
                  ctx.translate(x, 0);
                  ctx.rotate(time + x * 0.01);
                  
                  ctx.strokeStyle = accent1;
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  for (let j = 0; j < 6; j++) {
                    const a = j * Math.PI / 3;
                    ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
                  }
                  ctx.closePath();
                  ctx.stroke();
                  
                  ctx.fillStyle = accent2 + '30';
                  ctx.fill();
                  ctx.restore();
                }
                
                ctx.beginPath();
                ctx.moveTo(-length/2, 0);
                ctx.lineTo(length/2, 0);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
              } else if (variant === 5) {
                // Magma: Lava Fissure
                ctx.globalCompositeOperation = 'lighter';
                
                // Glowing Fissure
                const fissureGrad = ctx.createLinearGradient(0, -40, 0, 40);
                fissureGrad.addColorStop(0, 'transparent');
                fissureGrad.addColorStop(0.5, accent1);
                fissureGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = fissureGrad;
                ctx.fillRect(-length/2, -40 * easeProgress, length, 80 * easeProgress);

                // Embers
                for (let i = 0; i < 40; i++) {
                  const ex = (Math.random() - 0.5) * length;
                  const ey = (Math.random() - 0.5) * 100 - (time * 100 % 200);
                  ctx.fillStyle = accent2;
                  ctx.beginPath();
                  ctx.arc(ex, ey, 2 * easeProgress, 0, Math.PI * 2);
                  ctx.fill();
                }

                for (let i = 0; i < 3; i++) {
                  ctx.beginPath();
                  ctx.moveTo(-length/2, 0);
                  for (let x = -length/2; x < length/2; x += 10) {
                    const y = (Math.random() - 0.5) * 30 * easeProgress;
                    ctx.lineTo(x, y);
                  }
                  ctx.strokeStyle = accent3;
                  ctx.lineWidth = 3;
                  ctx.stroke();
                }
              } else if (variant === 6) {
                // Celestial: Stellar Bridge
                ctx.globalCompositeOperation = 'lighter';
                
                // Nebula Path
                const nebGrad = ctx.createLinearGradient(-length/2, 0, length/2, 0);
                nebGrad.addColorStop(0, 'transparent');
                nebGrad.addColorStop(0.3, accent1 + '40');
                nebGrad.addColorStop(0.7, accent2 + '40');
                nebGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = nebGrad;
                ctx.fillRect(-length/2, -60 * easeProgress, length, 120 * easeProgress);

                // Stars and Constellations
                ctx.strokeStyle = '#ffffff40';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let i = 0; i < 15; i++) {
                  const sx = (i / 15) * length - length/2;
                  const sy = Math.sin(i * 0.8 + time) * 40;
                  if (i === 0) ctx.moveTo(sx, sy);
                  else ctx.lineTo(sx, sy);
                  
                  ctx.fillStyle = '#ffffff';
                  ctx.beginPath();
                  ctx.arc(sx, sy, 3 * easeProgress, 0, Math.PI * 2);
                  ctx.fill();
                }
                ctx.stroke();

                // Orbiting Moons
                for (let i = 0; i < 5; i++) {
                  const mx = (i / 5) * length - length/2 + Math.cos(time * 3 + i) * 50;
                  const my = Math.sin(time * 3 + i) * 50;
                  ctx.fillStyle = accent3;
                  ctx.beginPath();
                  ctx.arc(mx, my, 6 * easeProgress, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (variant === 7 || variant === 11) {
                // Cyberpunk: Digital Circuit Bypass
                ctx.globalCompositeOperation = 'screen';
                
                // Background Grid
                ctx.strokeStyle = accent1 + '20';
                ctx.lineWidth = 1;
                for (let i = -5; i <= 5; i++) {
                  ctx.beginPath();
                  ctx.moveTo(-length/2, i * 20);
                  ctx.lineTo(length/2, i * 20);
                  ctx.stroke();
                }

                // Main Data Line
                ctx.beginPath();
                ctx.moveTo(-length/2, 0);
                for (let x = -length/2; x < length/2; x += 40) {
                  const step = Math.sin(time * 10 + x * 0.01) > 0 ? 30 : -30;
                  ctx.lineTo(x, step * easeProgress);
                  ctx.lineTo(x + 40, step * easeProgress);
                }
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 4;
                ctx.stroke();

                // Scrolling Hex Code
                ctx.font = '12px monospace';
                ctx.fillStyle = accent2;
                for (let i = 0; i < 10; i++) {
                  const hx = (i * 80 + time * 200) % length - length/2;
                  ctx.fillText("0x" + Math.floor(Math.random()*256).toString(16).toUpperCase(), hx, 50);
                }

                // Power Nodes
                for (let x = -length/2; x < length/2; x += 100) {
                  ctx.fillStyle = accent3;
                  ctx.fillRect(x - 8, -8, 16, 16);
                  ctx.strokeStyle = '#ffffff';
                  ctx.strokeRect(x - 8, -8, 16, 16);
                }
              } else if (variant === 8) {
                // Abyssal: Deep Sea Trench
                ctx.globalCompositeOperation = 'screen';
                
                // Bubbles
                for (let i = 0; i < 30; i++) {
                  const bx = (i * 30 + time * 50) % length - length/2;
                  const by = Math.sin(time * 2 + i) * 80;
                  ctx.strokeStyle = '#ffffff40';
                  ctx.beginPath();
                  ctx.arc(bx, by, 5 * easeProgress, 0, Math.PI * 2);
                  ctx.stroke();
                }

                // Bioluminescent Rift
                const riftGrad = ctx.createLinearGradient(0, -50, 0, 50);
                riftGrad.addColorStop(0, 'transparent');
                riftGrad.addColorStop(0.5, accent1 + '60');
                riftGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = riftGrad;
                ctx.fillRect(-length/2, -50 * easeProgress, length, 100 * easeProgress);

                for (let i = 0; i < 5; i++) {
                  ctx.beginPath();
                  ctx.moveTo(-length/2, 0);
                  for (let x = -length/2; x < length/2; x += 20) {
                    const y = Math.sin(x * 0.02 + time * 3 + i) * 40 * easeProgress;
                    ctx.lineTo(x, y);
                  }
                  ctx.strokeStyle = i % 2 === 0 ? accent2 : accent3;
                  ctx.lineWidth = 3;
                  ctx.stroke();
                }
                
                // Shadowy Fish
                for (let i = 0; i < 3; i++) {
                  const fx = (time * 150 + i * 300) % length - length/2;
                  const fy = Math.sin(time + i) * 60;
                  ctx.fillStyle = '#000010';
                  ctx.beginPath();
                  ctx.ellipse(fx, fy, 20, 10, 0, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (variant === 10) {
                // Matrix: Source Code Stream
                ctx.font = 'bold 20px monospace';
                for (let i = 0; i < 20; i++) {
                  const x = (i * 40) - length/2;
                  const yOffset = Math.sin(time * 5 + i) * 30;
                  ctx.fillStyle = accent1;
                  ctx.globalAlpha = easeProgress;
                  ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), x, yOffset);
                  
                  // Glitch Effect
                  if (Math.random() > 0.95) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), x + 5, yOffset);
                  }
                }
                
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-length/2, 0);
                ctx.lineTo(length/2, 0);
                ctx.stroke();
              } else {
                // Easter Variant: Candy Ribbon
                const colors = ['#ffb7ce', '#ffffd1', '#b2e2f2', '#e0c3fc', '#fdfd96', '#ffdab9'];
                
                // Swirling Ribbon
                for (let i = 0; i < 6; i++) {
                  ctx.beginPath();
                  ctx.moveTo(-length/2, 0);
                  for (let x = -length/2; x < length/2; x += 10) {
                    const y = Math.sin(x * 0.03 + time * 8 + i * Math.PI / 3) * 60 * easeProgress;
                    ctx.lineTo(x, y);
                  }
                  ctx.strokeStyle = colors[i];
                  ctx.lineWidth = 12 * easeProgress;
                  ctx.stroke();
                }

                // Bouncing Jelly Beans
                for (let i = 0; i < 10; i++) {
                  const jx = (i / 10) * length - length/2;
                  const jy = Math.abs(Math.sin(time * 10 + i)) * -100 * easeProgress;
                  ctx.fillStyle = colors[i % colors.length];
                  ctx.beginPath();
                  ctx.ellipse(jx, jy, 12, 8, 0, 0, Math.PI * 2);
                  ctx.fill();
                }
                
                // Sparkles
                for (let i = 0; i < 20; i++) {
                  const sx = (Math.random() - 0.5) * length;
                  const sy = (Math.random() - 0.5) * 150;
                  ctx.fillStyle = '#ffffff';
                  ctx.beginPath();
                  ctx.arc(sx, sy, 2 * easeProgress, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
              
              ctx.restore();
            }
          }
        } else if (special.type === 'wormhole') {
          if (special.phase === 'open') {
            if (elapsed > special.duration) {
              special.active = false;
            } else {
              const progress = Math.max(0, Math.min(1, elapsed / special.duration));
              const easeProgress = Math.sin(progress * Math.PI);
              
              ctx.save();
              ctx.translate(special.x, special.y);
              
              const rotation = time * 2;
              ctx.rotate(rotation);
              
              ctx.globalAlpha = easeProgress;
              
              if (variant === 1) {
                // Violet: The Neon Abyss - Extreme Digital Dimension
                ctx.globalCompositeOperation = 'screen';
                
                // Background Digital Rain
                ctx.font = '10px monospace';
                ctx.fillStyle = accent1 + '20';
                for (let i = 0; i < 30; i++) {
                  const rx = (i * 40 + time * 100) % 1200 - 600;
                  ctx.fillText("0101101011", rx, (Math.sin(i + time) * 500));
                }

                // Energy Beams
                for (let i = 0; i < 4; i++) {
                  const angle = i * Math.PI / 2 + time * 0.5;
                  const beamGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * 1000, Math.sin(angle) * 1000);
                  beamGrad.addColorStop(0, accent3 + '80');
                  beamGrad.addColorStop(1, 'transparent');
                  ctx.strokeStyle = beamGrad;
                  ctx.lineWidth = 50 * easeProgress;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(Math.cos(angle) * 1200, Math.sin(angle) * 1200);
                  ctx.stroke();
                }

                // Central Singularity with Pulsing Core
                const singGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 200 * easeProgress);
                singGrad.addColorStop(0, '#ffffff');
                singGrad.addColorStop(0.2, accent1);
                singGrad.addColorStop(0.5, accent2 + '80');
                singGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = singGrad;
                ctx.beginPath();
                ctx.arc(0, 0, 200 * easeProgress, 0, Math.PI * 2);
                ctx.fill();

                for (let i = 0; i < 60; i++) {
                  const depth = i / 60;
                  const radius = 10 + Math.pow(depth, 1.3) * 1000 * easeProgress;
                  const rot = depth * Math.PI * 4 + time * 2;
                  const pulse = Math.sin(time * 8 + i * 0.4) * 0.2 + 0.8;
                  
                  ctx.beginPath();
                  ctx.ellipse(0, 0, radius * pulse, radius * 0.4 * pulse, rot, 0, Math.PI * 2);
                  ctx.strokeStyle = i % 3 === 0 ? accent1 : (i % 3 === 1 ? accent2 : accent3);
                  ctx.lineWidth = 12 * (1 - depth) * easeProgress;
                  ctx.globalAlpha = easeProgress * (1 - depth);
                  ctx.stroke();
                  
                  // Orbiting Data Bits
                  if (i % 10 === 0) {
                    const bitA = time * 3 + i;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(Math.cos(bitA) * radius, Math.sin(bitA) * radius, 5, 5);
                  }
                }
              } else if (variant === 2) {
                // Solar: The Event Horizon - Ultimate Black Hole Journey
                
                // Star Swallowing Particles
                for (let i = 0; i < 100; i++) {
                  const startR = 800 + i * 5;
                  const r = startR - (time * 400 + i * 10) % 800;
                  if (r < 140) continue;
                  const a = i * 0.2 + time * 2;
                  ctx.fillStyle = '#ffffff';
                  ctx.globalAlpha = (r / 800) * easeProgress;
                  ctx.beginPath();
                  ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 2, 0, Math.PI * 2);
                  ctx.fill();
                }

                ctx.shadowBlur = 120 * easeProgress;
                ctx.shadowColor = accent1;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, 150 * easeProgress), 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                
                ctx.shadowBlur = 0;
                ctx.globalCompositeOperation = 'lighter';
                
                // Accretion Disk with Intense Heat Shimmer
                for (let i = 0; i < 20; i++) {
                  const rX = Math.max(1, 400 * easeProgress + Math.sin(time * 15 + i) * 60);
                  const rY = Math.max(1, 120 * easeProgress + Math.cos(time * 8 + i) * 20);
                  const rot = i * Math.PI / 10 + time * 5;
                  ctx.beginPath();
                  ctx.ellipse(0, 0, rX, rY, rot, 0, Math.PI * 2);
                  ctx.strokeStyle = i % 2 === 0 ? accent1 : accent2;
                  ctx.lineWidth = 25 * (1 - i/20) * easeProgress;
                  ctx.stroke();
                }
                
                // Relativistic Jets with Shockwaves
                const jetLen = 800 * easeProgress;
                for (let j = 0; j < 3; j++) {
                  const jetPulse = Math.sin(time * 25 + j) * 0.3 + 0.7;
                  const grad = ctx.createLinearGradient(0, -jetLen, 0, jetLen);
                  grad.addColorStop(0, 'transparent');
                  grad.addColorStop(0.5, accent3);
                  grad.addColorStop(1, 'transparent');
                  ctx.fillStyle = grad;
                  ctx.fillRect(-20 * jetPulse + (j-1)*10, -jetLen, 40 * jetPulse, jetLen * 2);
                }

                // Gravitational Ripples
                ctx.strokeStyle = accent1 + '30';
                for (let i = 1; i < 5; i++) {
                  const r = (time * 300 + i * 200) % 1000;
                  ctx.beginPath();
                  ctx.arc(0, 0, r * easeProgress, 0, Math.PI * 2);
                  ctx.lineWidth = 2;
                  ctx.stroke();
                }
              } else if (variant === 3) {
                // Emerald: The Overgrowth - Ancient Forest Singularity
                ctx.globalCompositeOperation = 'lighter';
                
                // Floating Ancient Runes
                ctx.font = '20px serif';
                for (let i = 0; i < 20; i++) {
                  const ra = i * 0.3 + time * 0.5;
                  const rr = 400 * easeProgress + Math.sin(time + i) * 50;
                  ctx.fillStyle = accent2 + '60';
                  ctx.fillText("᚛᚜ᚙᚚ", Math.cos(ra) * rr, Math.sin(ra) * rr);
                }

                // Nature Pulse Background
                const bgPulse = Math.sin(time * 2) * 0.1 + 0.1;
                ctx.fillStyle = accent1 + Math.floor(bgPulse * 255).toString(16).padStart(2, '0');
                ctx.fillRect(-1000, -1000, 2000, 2000);

                for (let i = 0; i < 800; i++) {
                  const angle = i * 137.5 * (Math.PI / 180) + time * 2;
                  const radius = 14 * Math.sqrt(i) * easeProgress;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const pulse = Math.sin(time * 15 - i * 0.1) * 0.5 + 0.5;
                  
                  // Glowing Vines with Thorns
                  if (i > 0 && i % 4 === 0) {
                    const prevAngle = (i - 4) * 137.5 * (Math.PI / 180) + time * 2;
                    const prevRadius = 14 * Math.sqrt(i - 4) * easeProgress;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(prevAngle) * prevRadius, Math.sin(prevAngle) * prevRadius);
                    ctx.lineTo(x, y);
                    ctx.strokeStyle = pulse > 0.9 ? '#ffffff' : accent1 + '90';
                    ctx.lineWidth = 4 * (1 - i/800);
                    ctx.stroke();
                  }

                  // Floating Leaves
                  if (i % 30 === 0) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(time * 3 + i);
                    ctx.fillStyle = accent2;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 10 * easeProgress, 5 * easeProgress, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                  }
                }
              } else if (variant === 4) {
                // Glacier: The Crystal Cathedral - Prismatic Ice Dimension
                
                // Ice Refraction Overlay
                for (let i = 0; i < 10; i++) {
                  const rx = (Math.random()-0.5)*2000;
                  const ry = (Math.random()-0.5)*2000;
                  const rw = 200 + Math.random()*300;
                  const rh = 200 + Math.random()*300;
                  ctx.fillStyle = '#ffffff05';
                  ctx.fillRect(rx, ry, rw, rh);
                }

                // Frost Growth at Edges
                ctx.strokeStyle = '#ffffff40';
                ctx.lineWidth = 2;
                for (let i = 0; i < 36; i++) {
                  const a = i * Math.PI / 18;
                  ctx.beginPath();
                  ctx.moveTo(Math.cos(a) * 800, Math.sin(a) * 800);
                  ctx.lineTo(Math.cos(a) * 700 * easeProgress, Math.sin(a) * 700 * easeProgress);
                  ctx.stroke();
                }

                for (let i = 0; i < 30; i++) {
                  const size = 800 - i * 30 * easeProgress;
                  if (size <= 0) continue;
                  
                  ctx.save();
                  ctx.rotate(time * (0.3 + i * 0.03) * (i % 2 === 0 ? 1 : -1));
                  
                  // Prismatic Rainbow Shards
                  const shardGrad = ctx.createLinearGradient(-size, -size, size, size);
                  shardGrad.addColorStop(0, accent1 + '40');
                  shardGrad.addColorStop(0.5, accent2 + '40');
                  shardGrad.addColorStop(1, accent3 + '40');
                  ctx.fillStyle = shardGrad;
                  
                  ctx.beginPath();
                  for (let j = 0; j < 6; j++) {
                    const angle = j * Math.PI / 3;
                    const x = Math.cos(angle) * size;
                    const y = Math.sin(angle) * size;
                    if (j === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                  }
                  ctx.closePath();
                  ctx.fill();
                  
                  ctx.strokeStyle = '#ffffff';
                  ctx.lineWidth = 10 * (1 - i/30) * easeProgress;
                  ctx.stroke();
                  ctx.restore();
                }
              } else if (variant === 5) {
                // Magma: The Core Breach - Volcanic Cataclysm
                ctx.globalCompositeOperation = 'lighter';
                
                // Smoke Clouds
                for (let i = 0; i < 10; i++) {
                  const sa = i * 0.7 + time * 0.3;
                  const sr = 400 + Math.sin(time + i) * 100;
                  const grad = ctx.createRadialGradient(Math.cos(sa)*sr, Math.sin(sa)*sr, 0, Math.cos(sa)*sr, Math.sin(sa)*sr, 200);
                  grad.addColorStop(0, '#33333380');
                  grad.addColorStop(1, 'transparent');
                  ctx.fillStyle = grad;
                  ctx.fillRect(-1000, -1000, 2000, 2000);
                }

                // Lava Rivers
                for (let i = 0; i < 6; i++) {
                  const la = i * Math.PI / 3 + time;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  for (let j = 0; j < 20; j++) {
                    const lr = j * 50 * easeProgress;
                    const lx = Math.cos(la + Math.sin(time * 2 + j * 0.3) * 0.5) * lr;
                    const ly = Math.sin(la + Math.sin(time * 2 + j * 0.3) * 0.5) * lr;
                    ctx.lineTo(lx, ly);
                  }
                  ctx.strokeStyle = accent1;
                  ctx.lineWidth = 40 * easeProgress;
                  ctx.stroke();
                }

                for (let i = 0; i < 50; i++) {
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  for (let j = 0; j < 60; j++) {
                    const radius = j * 20 * easeProgress;
                    const angle = i * Math.PI / 25 + j * 0.2 - time * 12;
                    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                  }
                  ctx.strokeStyle = i % 2 === 0 ? accent1 : accent2;
                  ctx.lineWidth = 20 * easeProgress;
                  ctx.stroke();
                }
                
                // Obsidian Shards
                for (let i = 0; i < 30; i++) {
                  const ox = (Math.random()-0.5)*1500;
                  const oy = (Math.random()-0.5)*1500;
                  ctx.fillStyle = '#000000';
                  ctx.beginPath();
                  ctx.moveTo(ox, oy);
                  ctx.lineTo(ox+20, oy+10);
                  ctx.lineTo(ox+10, oy+30);
                  ctx.closePath();
                  ctx.fill();
                }
              } else if (variant === 6) {
                // Celestial: The Cosmic Singularity - Galactic Rebirth
                
                // Galactic Spirals
                for (let i = 0; i < 3; i++) {
                  ctx.save();
                  ctx.rotate(time * 0.2 + i);
                  const spiralGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 800 * easeProgress);
                  spiralGrad.addColorStop(0, accent1 + '40');
                  spiralGrad.addColorStop(1, 'transparent');
                  ctx.fillStyle = spiralGrad;
                  for (let j = 0; j < 1000; j++) {
                    const r = j * 0.8 * easeProgress;
                    const a = j * 0.1;
                    ctx.fillRect(Math.cos(a)*r, Math.sin(a)*r, 2, 2);
                  }
                  ctx.restore();
                }

                // Gravitational Waves (Ripples)
                ctx.strokeStyle = '#ffffff20';
                for (let i = 0; i < 10; i++) {
                  const r = (time * 500 + i * 150) % 1500;
                  ctx.beginPath();
                  ctx.arc(0, 0, r * easeProgress, 0, Math.PI * 2);
                  ctx.lineWidth = 5;
                  ctx.stroke();
                }

                // Pulsar Center with Intense Rays
                ctx.globalCompositeOperation = 'lighter';
                for (let i = 0; i < 24; i++) {
                  const angle = i * Math.PI / 12 + time * 15;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(Math.cos(angle) * 1500 * easeProgress, Math.sin(angle) * 1500 * easeProgress);
                  ctx.strokeStyle = i % 2 === 0 ? accent1 + '40' : accent3 + '40';
                  ctx.lineWidth = 30;
                  ctx.stroke();
                }
                
                // Nebula Gas Clouds
                for (let i = 0; i < 15; i++) {
                  const ga = i * 0.5 + time * 0.4;
                  const gr = 300 + Math.sin(time + i) * 200;
                  const gGrad = ctx.createRadialGradient(Math.cos(ga)*gr, Math.sin(ga)*gr, 0, Math.cos(ga)*gr, Math.sin(ga)*gr, 300);
                  gGrad.addColorStop(0, i % 2 === 0 ? accent1 + '20' : accent2 + '20');
                  gGrad.addColorStop(1, 'transparent');
                  ctx.fillStyle = gGrad;
                  ctx.beginPath();
                  ctx.arc(Math.cos(ga)*gr, Math.sin(ga)*gr, 300, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (variant === 7 || variant === 11) {
                // Cyberpunk: The Data Stream - Neon Metropolis Singularity
                
                // Holographic Ads / Kanji
                ctx.font = 'bold 40px sans-serif';
                ctx.fillStyle = accent1;
                for (let i = 0; i < 5; i++) {
                  const text = ["NEON", "CYBER", "DATA", "VOID", "ERROR"][i];
                  const ta = i * 1.2 + time;
                  const tr = 400 * easeProgress;
                  ctx.save();
                  ctx.translate(Math.cos(ta)*tr, Math.sin(ta)*tr);
                  ctx.rotate(ta + Math.PI/2);
                  ctx.fillText(text, 0, 0);
                  ctx.restore();
                }

                // Scanlines & Noise
                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                for (let i = 0; i < 100; i++) {
                  ctx.fillRect(-1000, (Math.random()-0.5)*2000, 2000, 1);
                }

                // Circuit Traces with Flowing Data
                for (let i = 0; i < 15; i++) {
                  let cx = (Math.random()-0.5)*1200;
                  let cy = (Math.random()-0.5)*1200;
                  ctx.beginPath();
                  ctx.moveTo(cx, cy);
                  for (let j = 0; j < 8; j++) {
                    if (Math.random() > 0.5) cx += 150; else cy += 150;
                    ctx.lineTo(cx, cy);
                  }
                  ctx.strokeStyle = accent2 + '60';
                  ctx.lineWidth = 3;
                  ctx.stroke();
                  
                  // Flowing data bit
                  const flowPos = (time * 5 + i) % 1;
                  ctx.fillStyle = '#ffffff';
                  ctx.beginPath();
                  ctx.arc(cx * flowPos, cy * flowPos, 4, 0, Math.PI * 2);
                  ctx.fill();
                }

                // Holographic Concentric Rings
                for (let i = 0; i < 12; i++) {
                  const r = (150 + i * 90) * easeProgress;
                  ctx.beginPath();
                  ctx.arc(0, 0, r, time * 3 + i, time * 3 + i + 1.2);
                  ctx.strokeStyle = i % 2 === 0 ? accent1 : accent3;
                  ctx.lineWidth = 8;
                  ctx.stroke();
                }
              } else if (variant === 8) {
                // Abyssal: The Deep Sea Maelstrom - Leviathan's Eye
                
                // Water Distortion (Wavy Screen)
                ctx.save();
                const waveScale = 1 + Math.sin(time * 3) * 0.05;
                ctx.scale(waveScale, waveScale);

                // Marine Snow
                for (let i = 0; i < 200; i++) {
                  const sx = (Math.random()-0.5)*2000;
                  const sy = ((time * 100 + i * 10) % 2000) - 1000;
                  ctx.fillStyle = '#ffffff40';
                  ctx.beginPath();
                  ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
                  ctx.fill();
                }

                // Shadowy Leviathan Tentacles
                for (let i = 0; i < 12; i++) {
                  const ta = i * Math.PI / 6 + time * 0.4;
                  ctx.beginPath();
                  ctx.moveTo(Math.cos(ta) * 50, Math.sin(ta) * 50);
                  for (let j = 0; j < 30; j++) {
                    const tr = 50 + j * 45 * easeProgress;
                    const tx = Math.cos(ta + Math.sin(time * 1.5 + j * 0.25) * 0.8) * tr;
                    const ty = Math.sin(ta + Math.sin(time * 1.5 + j * 0.25) * 0.8) * tr;
                    ctx.lineTo(tx, ty);
                  }
                  ctx.strokeStyle = '#000010c0';
                  ctx.lineWidth = 30;
                  ctx.stroke();
                }

                for (let i = 0; i < 30; i++) {
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  for (let j = 0; j < 80; j++) {
                    const radius = j * 18 * easeProgress;
                    const angle = i * Math.PI / 15 + j * 0.22 + time * 9;
                    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                  }
                  ctx.strokeStyle = accent1 + '80';
                  ctx.lineWidth = 20 * easeProgress;
                  ctx.stroke();
                }
                ctx.restore();
              } else if (variant === 10) {
                // Matrix: The Digital Void - System Breach
                
                // Code Cascades
                ctx.font = 'bold 24px monospace';
                for (let i = 0; i < 40; i++) {
                  const x = (i * 40) - 800;
                  const yOffset = (time * 1000 + i * 100) % 1600 - 800;
                  ctx.fillStyle = accent1;
                  for (let j = 0; j < 10; j++) {
                    ctx.globalAlpha = (1 - j/10) * easeProgress;
                    ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), x, yOffset - j * 25);
                  }
                }

                // 3D Perspective Binary Rain
                for (let i = 0; i < 300; i++) {
                  const z = (i * 0.005 + time * 0.6) % 1;
                  const x = (Math.random() - 0.5) * 2500 * z;
                  const y = (Math.random() - 0.5) * 2500 * z;
                  ctx.font = (8 + z * 50) + 'px monospace';
                  ctx.fillStyle = Math.random() > 0.9 ? '#ffffff' : accent1;
                  ctx.globalAlpha = z * easeProgress;
                  ctx.fillText(Math.random() > 0.5 ? "1" : "0", x, y);
                }

                // System Breach Alerts
                if (Math.sin(time * 6) > 0.7) {
                  ctx.font = 'bold 80px monospace';
                  ctx.fillStyle = '#ff0000';
                  ctx.fillText("CRITICAL_BREACH", -350, Math.sin(time*10)*50);
                }
              } else {
                // Easter: The Candy Vortex - Rainbow Sugar Rush
                const colors = ['#ffb7ce', '#ffffd1', '#b2e2f2', '#e0c3fc', '#fdfd96', '#ffdab9'];
                
                // Rainbow Trails
                for (let i = 0; i < 6; i++) {
                  ctx.strokeStyle = colors[i];
                  ctx.lineWidth = 100 * easeProgress;
                  ctx.beginPath();
                  ctx.arc(0, 0, 300 + i * 20, time, time + Math.PI);
                  ctx.stroke();
                }

                // Floating Eggs hatching into Chicks
                for (let i = 0; i < 8; i++) {
                  const ea = i * Math.PI * 2 / 8 + time * 1.5;
                  const er = 500 * easeProgress;
                  const ex = Math.cos(ea) * er;
                  const ey = Math.sin(ea) * er;
                  
                  ctx.save();
                  ctx.translate(ex, ey);
                  ctx.rotate(Math.sin(time * 12) * 0.3);
                  
                  // Egg
                  ctx.fillStyle = colors[i % colors.length];
                  ctx.beginPath();
                  ctx.ellipse(0, 0, 25, 35, 0, 0, Math.PI * 2);
                  ctx.fill();
                  
                  // Chick (if progress > 0.5)
                  if (easeProgress > 0.5) {
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.arc(0, -10, 15, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(-5, -15, 2, 2);
                    ctx.fillRect(3, -15, 2, 2);
                  }
                  ctx.restore();
                }

                // Confetti Explosion
                for (let i = 0; i < 150; i++) {
                  const cx = (Math.random()-0.5)*1800;
                  const cy = (Math.random()-0.5)*1800;
                  ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                  ctx.save();
                  ctx.translate(cx, cy);
                  ctx.rotate(time * 5 + i);
                  ctx.fillRect(-5, -5, 10, 10);
                  ctx.restore();
                }

                for (let i = 0; i < 20; i++) {
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  for (let j = 0; j < 100; j++) {
                    const radius = j * 20 * easeProgress;
                    const bounce = Math.sin(time * 20 + j * 0.3) * 20;
                    const angle = i * Math.PI / 10 + j * 0.12 - time * 8;
                    ctx.lineTo(Math.cos(angle) * (radius + bounce), Math.sin(angle) * (radius + bounce));
                  }
                  ctx.strokeStyle = colors[i % colors.length];
                  ctx.lineWidth = 30 * easeProgress;
                  ctx.stroke();
                }
              }
              
              ctx.restore();
            }
          }
        } else if (special.type === 'hatch') {
          if (elapsed > special.duration) {
            special.active = false;
          } else {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            ctx.save();
            ctx.translate(special.x, special.y);
            
            const baseSize = 80; // Reduced size as requested

            if (progress < 0.4) {
              // Phase 1: Incubation & Energy Gathering
              const incubationProgress = progress / 0.4;
              const sSize = baseSize * Math.pow(incubationProgress, 0.5);
              const pulse = 1 + Math.sin(time * 20) * 0.08 * incubationProgress;
              
              // Energy Gathering Particles
              for (let i = 0; i < 15; i++) {
                const angle = (i * Math.PI * 2) / 15 + time * 5;
                const dist = (1 - incubationProgress) * 400 + Math.sin(time * 10 + i) * 20;
                const px = Math.cos(angle) * dist;
                const py = Math.sin(angle) * dist;
                ctx.fillStyle = i % 2 === 0 ? accent1 : '#ffffff';
                ctx.globalAlpha = incubationProgress * 0.6;
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
              }

              ctx.globalAlpha = 1;
              
              if (variant === 1) { // Violet: Singularity Orb
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, sSize * pulse), 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(0, sSize * pulse));
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.5, accent1);
                grad.addColorStop(1, '#000000');
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.strokeStyle = accent2;
                ctx.lineWidth = 2;
                ctx.stroke();
              } else if (variant === 2) { // Solar: Pulsing Star
                ctx.beginPath();
                for (let i = 0; i < 16; i++) {
                  const angle = (i * Math.PI * 2) / 16 + time * 2;
                  const r = i % 2 === 0 ? sSize * 1.5 * pulse : sSize * 0.8 * pulse;
                  if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                  else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                }
                ctx.closePath();
                ctx.fillStyle = accent1;
                ctx.shadowBlur = 30 * incubationProgress;
                ctx.shadowColor = accent2;
                ctx.fill();
                ctx.shadowBlur = 0;
              } else if (variant === 3) { // Emerald: Vine Cocoon
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 4;
                for (let i = 0; i < 5; i++) {
                  ctx.beginPath();
                  for (let j = 0; j < Math.PI * 4; j += 0.2) {
                    const r = sSize * pulse * (1 - j / (Math.PI * 4));
                    const angle = j + time * 3 + i * (Math.PI * 2 / 5);
                    if (j === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                  }
                  ctx.stroke();
                }
              } else if (variant === 4) { // Glacier: Ice Crystal
                ctx.fillStyle = accent1 + '80';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                  const angle = i * Math.PI / 3 + time;
                  const r = sSize * pulse;
                  if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                  else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
              } else if (variant === 5) { // Magma: Lava Sphere
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, sSize * pulse), 0, Math.PI * 2);
                ctx.fillStyle = accent1;
                ctx.fill();
                ctx.fillStyle = accent2;
                for (let i = 0; i < 5; i++) {
                  ctx.beginPath();
                  ctx.arc((Math.random() - 0.5) * sSize, (Math.random() - 0.5) * sSize, sSize * 0.3 * Math.random(), 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (variant === 6) { // Celestial: Nebula Core
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(0, sSize * 1.5 * pulse));
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, accent1);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, sSize * 1.5 * pulse), 0, Math.PI * 2);
                ctx.fill();
              } else if (variant === 7 || variant === 11) { // Cyberpunk: Data Cube
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 3;
                ctx.fillStyle = '#00000080';
                ctx.beginPath();
                ctx.rect(-sSize * pulse, -sSize * pulse, sSize * 2 * pulse, sSize * 2 * pulse);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = accent3;
                ctx.font = '10px monospace';
                ctx.fillText('01', -10, 5);
              } else if (variant === 8) { // Abyssal: Bioluminescent Bubble
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, sSize * pulse), 0, Math.PI * 2);
                ctx.fillStyle = accent1 + '40';
                ctx.fill();
                ctx.strokeStyle = accent2;
                ctx.lineWidth = 2;
                ctx.stroke();
              } else if (variant === 9) { // Easter: Gift Box
                ctx.fillStyle = accent1;
                ctx.fillRect(-sSize * pulse, -sSize * pulse, sSize * 2 * pulse, sSize * 2 * pulse);
                ctx.fillStyle = accent2;
                ctx.fillRect(-sSize * pulse, -sSize * 0.2 * pulse, sSize * 2 * pulse, sSize * 0.4 * pulse);
                ctx.fillRect(-sSize * 0.2 * pulse, -sSize * pulse, sSize * 0.4 * pulse, sSize * 2 * pulse);
              } else if (variant === 10) { // Matrix: Code Cluster
                ctx.fillStyle = '#00ff00';
                ctx.font = '14px monospace';
                for (let i = 0; i < 10; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const r = Math.random() * sSize * pulse;
                  ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), Math.cos(angle) * r, Math.sin(angle) * r);
                }
              }

              // Core Light
              ctx.fillStyle = '#ffffff';
              ctx.globalAlpha = Math.sin(time * 30) * 0.3 + 0.3;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, sSize * 0.4), 0, Math.PI * 2);
              ctx.fill();
            } else if (progress < 0.6) {
              // Phase 2: Overload & Destabilize
              const crackProgress = (progress - 0.4) / 0.2;
              const sSize = baseSize;
              
              const vx = (Math.random() - 0.5) * 25 * crackProgress;
              const vy = (Math.random() - 0.5) * 25 * crackProgress;
              ctx.translate(vx, vy);
              
              ctx.globalAlpha = 1;
              
              if (variant === 1) { // Violet: Singularity Orb
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, sSize), 0, Math.PI * 2);
                ctx.fillStyle = accent1;
                ctx.fill();
              } else if (variant === 2) { // Solar: Pulsing Star
                ctx.beginPath();
                for (let i = 0; i < 16; i++) {
                  const angle = (i * Math.PI * 2) / 16 + time * 5;
                  const r = i % 2 === 0 ? sSize * 1.8 : sSize * 0.5;
                  if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                  else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                }
                ctx.closePath();
                ctx.fillStyle = '#ffffff';
                ctx.fill();
              } else if (variant === 3) { // Emerald: Vine Cocoon
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, sSize), 0, Math.PI * 2);
                ctx.fillStyle = accent1;
                ctx.fill();
              } else if (variant === 4) { // Glacier: Ice Crystal
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                  const angle = i * Math.PI / 3 + time * 2;
                  if (i === 0) ctx.moveTo(Math.cos(angle) * sSize, Math.sin(angle) * sSize);
                  else ctx.lineTo(Math.cos(angle) * sSize, Math.sin(angle) * sSize);
                }
                ctx.closePath();
                ctx.fill();
              } else if (variant === 5) { // Magma: Lava Sphere
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, sSize), 0, Math.PI * 2);
                ctx.fillStyle = '#ff0000';
                ctx.fill();
              } else if (variant === 6) { // Celestial: Nebula Core
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, sSize), 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
              } else if (variant === 7 || variant === 11) { // Cyberpunk: Data Cube
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-sSize, -sSize, sSize * 2, sSize * 2);
              } else if (variant === 8) { // Abyssal: Bioluminescent Bubble
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, sSize), 0, Math.PI * 2);
                ctx.fillStyle = accent2;
                ctx.fill();
              } else if (variant === 9) { // Easter: Gift Box
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-sSize, -sSize, sSize * 2, sSize * 2);
              } else if (variant === 10) { // Matrix: Code Cluster
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-sSize, -sSize, sSize * 2, sSize * 2);
              }
              
              if (variant === 1) { // Violet: Gravity distortion
                ctx.strokeStyle = accent2;
                ctx.lineWidth = 2 + crackProgress * 5;
                for (let i = 0; i < 5; i++) {
                  ctx.beginPath();
                  ctx.arc(0, 0, Math.max(0, sSize * (1 + crackProgress * i * 0.5)), 0, Math.PI * 2);
                  ctx.stroke();
                }
              } else if (variant === 2) { // Solar: Solar flares
                ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 8; i++) {
                  const angle = (i * Math.PI * 2) / 8 + time * 10;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(Math.cos(angle - 0.2) * sSize * 2 * crackProgress, Math.sin(angle - 0.2) * sSize * 2 * crackProgress);
                  ctx.lineTo(Math.cos(angle + 0.2) * sSize * 2 * crackProgress, Math.sin(angle + 0.2) * sSize * 2 * crackProgress);
                  ctx.fill();
                }
              } else if (variant === 3) { // Emerald: Toxic spores
                ctx.fillStyle = accent2;
                for (let i = 0; i < 15; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const r = sSize + Math.random() * sSize * crackProgress;
                  ctx.beginPath();
                  ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, Math.max(0, 3 + Math.random() * 5), 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (variant === 4) { // Glacier: Ice shards
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2 + crackProgress * 4;
                for (let i = 0; i < 10; i++) {
                  const angle = (i * Math.PI * 2) / 10 + (Math.random() - 0.5);
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(Math.cos(angle) * sSize * 1.8 * crackProgress, Math.sin(angle) * sSize * 1.8 * crackProgress);
                  ctx.stroke();
                }
              } else if (variant === 5) { // Magma: Eruption
                ctx.fillStyle = '#ff8c00';
                for (let i = 0; i < 12; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const r = sSize + Math.random() * sSize * 1.5 * crackProgress;
                  ctx.beginPath();
                  ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, Math.max(0, 4 + Math.random() * 6), 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (variant === 6) { // Celestial: Starburst
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 3 + crackProgress * 5;
                for (let i = 0; i < 16; i++) {
                  const angle = (i * Math.PI * 2) / 16 + time * 5;
                  ctx.beginPath();
                  ctx.moveTo(Math.cos(angle) * sSize, Math.sin(angle) * sSize);
                  ctx.lineTo(Math.cos(angle) * sSize * (1 + crackProgress), Math.sin(angle) * sSize * (1 + crackProgress));
                  ctx.stroke();
                }
              } else if (variant === 7 || variant === 11) { // Cyberpunk: Glitch lines
                ctx.fillStyle = accent2;
                for (let i = 0; i < 10; i++) {
                  const y = (Math.random() - 0.5) * sSize * 2;
                  ctx.fillRect(-sSize * 1.5 * crackProgress, y, sSize * 3 * crackProgress, 4);
                }
              } else if (variant === 8) { // Abyssal: Water ripples
                ctx.strokeStyle = accent3;
                ctx.lineWidth = 4 * crackProgress;
                for (let i = 0; i < 3; i++) {
                  ctx.beginPath();
                  ctx.arc(0, 0, Math.max(0, sSize + i * 20 * crackProgress), 0, Math.PI * 2);
                  ctx.stroke();
                }
              } else if (variant === 9) { // Easter: Ribbon burst
                ctx.strokeStyle = accent3;
                ctx.lineWidth = 5;
                for (let i = 0; i < 8; i++) {
                  const angle = (i * Math.PI * 2) / 8 + time * 2;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.quadraticCurveTo(Math.cos(angle + 0.5) * sSize, Math.sin(angle + 0.5) * sSize, Math.cos(angle) * sSize * 1.5 * crackProgress, Math.sin(angle) * sSize * 1.5 * crackProgress);
                  ctx.stroke();
                }
              } else if (variant === 10) { // Matrix: Binary explosion
                ctx.fillStyle = '#00ff00';
                ctx.font = '16px monospace';
                for (let i = 0; i < 15; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const r = sSize + Math.random() * sSize * crackProgress;
                  ctx.fillText(Math.random() > 0.5 ? '0' : '1', Math.cos(angle) * r, Math.sin(angle) * r);
                }
              }
              ctx.shadowBlur = 0;
            } else {
              // Phase 3: Shattering & Grand Entity Emergence
              const hatchProgress = (progress - 0.6) / 0.4;
              const sSize = baseSize;
              
              // Initial Flash
              if (hatchProgress < 0.1) {
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = (0.1 - hatchProgress) * 10;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
              }

              // Shockwave
              const swRadius = hatchProgress * 1200;
              const swGrad = ctx.createRadialGradient(0, 0, Math.max(0, swRadius * 0.85), 0, 0, Math.max(0, swRadius));
              swGrad.addColorStop(0, 'transparent');
              swGrad.addColorStop(0.5, accent1);
              swGrad.addColorStop(1, 'transparent');
              ctx.fillStyle = swGrad;
              ctx.globalAlpha = (1 - hatchProgress) * 0.6;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, swRadius), 0, Math.PI * 2);
              ctx.fill();
              
              // Entity Emergence
              ctx.save();
              ctx.globalAlpha = (1 - hatchProgress) * 0.9;
              ctx.scale(1 + hatchProgress * 2.5, 1 + hatchProgress * 2.5);
              
              if (variant === 9) { // Easter: Detailed Bunny
                ctx.fillStyle = '#ffffff';
                // Body
                ctx.beginPath();
                ctx.arc(0, 20, 40, 0, Math.PI * 2);
                ctx.fill();
                // Head
                ctx.beginPath();
                ctx.arc(0, -30, 25, 0, Math.PI * 2);
                ctx.fill();
                // Ears
                ctx.ellipse(-12, -65, 12, 35, -0.2, 0, Math.PI * 2);
                ctx.ellipse(12, -65, 12, 35, 0.2, 0, Math.PI * 2);
                ctx.fill();
                // Eyes
                ctx.fillStyle = accent1;
                ctx.beginPath();
                ctx.arc(-8, -35, 3, 0, Math.PI * 2);
                ctx.arc(8, -35, 3, 0, Math.PI * 2);
                ctx.fill();
              } else if (variant === 1) { // Violet: Phoenix
                ctx.fillStyle = accent1;
                // Wings
                for (let i = 0; i < 3; i++) {
                  ctx.globalAlpha = (1 - hatchProgress) * (1 - i * 0.2);
                  ctx.save();
                  ctx.scale(1 - i * 0.1, 1 - i * 0.1);
                  ctx.beginPath();
                  ctx.moveTo(0, -40);
                  ctx.quadraticCurveTo(70, -30, 90, 50);
                  ctx.quadraticCurveTo(0, 30, -90, 50);
                  ctx.quadraticCurveTo(-70, -30, 0, -40);
                  ctx.fill();
                  ctx.restore();
                }
                // Tail
                ctx.beginPath();
                ctx.moveTo(0, 40);
                ctx.lineTo(20, 80);
                ctx.lineTo(0, 70);
                ctx.lineTo(-20, 80);
                ctx.closePath();
                ctx.fill();
              } else if (variant === 2) { // Solar: Supernova Flare
                const spikes = 16;
                for (let j = 0; j < 2; j++) {
                  ctx.fillStyle = j === 0 ? '#fff700' : '#ffffff';
                  const rot = time * (j === 0 ? 3 : -2);
                  for (let i = 0; i < spikes; i++) {
                    const a = (i * Math.PI * 2) / spikes + rot;
                    const len = j === 0 ? 120 : 80;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(a - 0.08) * len * 0.6, Math.sin(a - 0.08) * len * 0.6);
                    ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
                    ctx.lineTo(Math.cos(a + 0.08) * len * 0.6, Math.sin(a + 0.08) * len * 0.6);
                    ctx.fill();
                  }
                }
                // Core pulse
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, 30 + Math.sin(time * 10) * 10), 0, Math.PI * 2);
                ctx.fill();
              } else if (variant === 3) { // Emerald: Toxic Serpent
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 15;
                ctx.lineCap = 'round';
                ctx.beginPath();
                for (let i = 0; i < 50; i++) {
                  const r = i * 2;
                  const a = i * 0.3 + time * 5;
                  const px = Math.cos(a) * r;
                  const py = Math.sin(a) * r;
                  if (i === 0) ctx.moveTo(px, py);
                  else ctx.lineTo(px, py);
                }
                ctx.stroke();
                // Eyes
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(Math.cos(time * 5) * 100, Math.sin(time * 5) * 100, 5, 0, Math.PI * 2);
                ctx.fill();
              } else if (variant === 4) { // Glacier: Crystalline Snowflake
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                for (let i = 0; i < 6; i++) {
                  ctx.save();
                  ctx.rotate(i * Math.PI / 3 + time);
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(0, -100);
                  // Branches
                  for (let j = 1; j <= 3; j++) {
                    const y = -j * 25;
                    ctx.moveTo(0, y);
                    ctx.lineTo(20, y - 20);
                    ctx.moveTo(0, y);
                    ctx.lineTo(-20, y - 20);
                  }
                  ctx.stroke();
                  ctx.restore();
                }
              } else if (variant === 5) { // Magma: Fire Elemental
                for (let i = 0; i < 5; i++) {
                  ctx.fillStyle = i % 2 === 0 ? '#ff4500' : '#ff8c00';
                  ctx.globalAlpha = (1 - hatchProgress) * (1 - i * 0.15);
                  ctx.beginPath();
                  ctx.moveTo(0, 40);
                  ctx.bezierCurveTo(40, 40, 40, -40, 0, -80 - i * 10);
                  ctx.bezierCurveTo(-40, -40, -40, 40, 0, 40);
                  ctx.fill();
                }
              } else if (variant === 6) { // Celestial: Spiral Galaxy
                for (let i = 0; i < 5; i++) {
                  ctx.save();
                  ctx.rotate(time * 2 + i * 0.5);
                  ctx.beginPath();
                  ctx.ellipse(0, 0, 100 - i * 15, 30 - i * 5, 0, 0, Math.PI * 2);
                  ctx.strokeStyle = i % 2 === 0 ? accent1 : accent2;
                  ctx.lineWidth = 4;
                  ctx.stroke();
                  // Stars in rings
                  for (let j = 0; j < 10; j++) {
                    const sa = j * Math.PI / 5 + time;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(Math.cos(sa) * (100 - i * 15), Math.sin(sa) * (30 - i * 5), 2, 0, Math.PI * 2);
                    ctx.fill();
                  }
                  ctx.restore();
                }
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, 15, 0, Math.PI * 2);
                ctx.fill();
              } else if (variant === 7 || variant === 11) { // Cyberpunk: Glitch Skull
                ctx.fillStyle = accent1;
                const glitch = Math.random() > 0.8 ? (Math.random() - 0.5) * 20 : 0;
                ctx.translate(glitch, 0);
                // Skull top
                ctx.fillRect(-40, -50, 80, 60);
                // Jaw
                ctx.fillRect(-25, 10, 50, 30);
                // Eyes
                ctx.fillStyle = '#000000';
                ctx.fillRect(-25, -30, 20, 20);
                ctx.fillRect(5, -30, 20, 20);
                // Glitch lines
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-60, -20); ctx.lineTo(60, -20);
                ctx.moveTo(-60, 20); ctx.lineTo(60, 20);
                ctx.stroke();
              } else if (variant === 8) { // Abyssal: Deep Sea Jellyfish
                ctx.fillStyle = accent1;
                ctx.globalAlpha = (1 - hatchProgress) * 0.6;
                // Bell
                ctx.beginPath();
                ctx.arc(0, -20, 50, Math.PI, 0);
                ctx.lineTo(50, 10);
                ctx.quadraticCurveTo(0, 30, -50, 10);
                ctx.closePath();
                ctx.fill();
                // Tentacles
                ctx.strokeStyle = accent2;
                ctx.lineWidth = 3;
                for (let i = 0; i < 6; i++) {
                  ctx.beginPath();
                  ctx.moveTo(-40 + i * 16, 20);
                  for (let j = 0; j < 5; j++) {
                    const tx = -40 + i * 16 + Math.sin(time * 5 + j + i) * 15;
                    const ty = 20 + j * 20;
                    ctx.lineTo(tx, ty);
                  }
                  ctx.stroke();
                }
              } else if (variant === 10) { // Matrix: Code Pillar
                ctx.fillStyle = '#00ff00';
                ctx.font = 'bold 20px monospace';
                for (let i = 0; i < 5; i++) {
                  const x = (i - 2) * 25;
                  for (let j = 0; j < 10; j++) {
                    const char = String.fromCharCode(0x30A0 + Math.random() * 96);
                    const y = -100 + j * 25 + (time * 200) % 25;
                    ctx.globalAlpha = (1 - hatchProgress) * (1 - j * 0.1);
                    ctx.fillText(char, x, y);
                  }
                }
              } else { // Default: Hyper-Geometric
                for (let i = 0; i < 4; i++) {
                  ctx.save();
                  ctx.rotate(time * 3 + (i * Math.PI / 4));
                  ctx.strokeStyle = i % 2 === 0 ? '#ffffff' : accent1;
                  ctx.lineWidth = 3;
                  const boxSize = 60 - i * 10;
                  ctx.strokeRect(-boxSize/2, -boxSize/2, boxSize, boxSize);
                  ctx.restore();
                }
              }
              ctx.restore();
              
              // Enhanced Shards (Triangles and Rects)
              for (let i = 0; i < 20; i++) {
                const angle = (i * Math.PI * 2) / 20 + i;
                const dist = hatchProgress * 600 + Math.sin(i * 12) * 60;
                const sx = Math.cos(angle) * dist;
                const sy = Math.sin(angle) * dist;
                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(hatchProgress * 12 + i);
                ctx.fillStyle = i % 2 === 0 ? accent1 : accent2;
                ctx.beginPath();
                if (i % 3 === 0) {
                  ctx.moveTo(-12, -12); ctx.lineTo(12, 0); ctx.lineTo(0, 12);
                } else {
                  ctx.rect(-8, -8, 16, 16);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
              }
              
              // Dense Burst Particles
              for (let i = 0; i < 60; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = hatchProgress * 1000 * Math.pow(Math.random(), 0.5);
                const px = Math.cos(angle) * dist;
                const py = Math.sin(angle) * dist;
                ctx.fillStyle = i % 3 === 0 ? accent1 : (i % 3 === 1 ? accent2 : '#ffffff');
                ctx.globalAlpha = (1 - hatchProgress) * Math.random();
                ctx.beginPath();
                ctx.arc(px, py, Math.max(0, 2 + Math.random() * 4), 0, Math.PI * 2);
                ctx.fill();
              }
            }
            
            ctx.restore();
          }
        } else if (special.type === 'supernova') {
          if (elapsed > special.duration) {
            special.active = false;
          } else {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            ctx.save();
            ctx.translate(special.x, special.y);
            const r = Math.max(0, canvas.width * 1.5 * progress);
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(0, r));
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.2, '#ffffff');
            grad.addColorStop(0.4, accent1);
            grad.addColorStop(0.7, accent2);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.globalAlpha = 1 - progress;
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(0, r), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } else if (special.type === 'vortex') {
          if (elapsed > special.duration) {
            special.active = false;
          } else {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            ctx.save();
            ctx.translate(special.x, special.y);
            ctx.globalAlpha = easeProgress;
            for (let i = 0; i < 12; i++) {
              const angle = (i * Math.PI * 2) / 12 + time * 5;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              for (let j = 0; j < 20; j++) {
                const r = j * 20 * easeProgress;
                const a = angle + j * 0.2;
                ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
              }
              ctx.strokeStyle = i % 2 === 0 ? accent1 : accent3;
              ctx.lineWidth = 4;
              ctx.stroke();
            }
            ctx.restore();
          }
        } else if (special.type === 'rainbow') {
          if (elapsed > special.duration) {
            special.active = false;
          } else {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            ctx.save();
            ctx.translate(special.x, special.y);
            ctx.globalAlpha = easeProgress * 0.5;
            for (let i = 0; i < 36; i++) {
              const angle = (i * Math.PI * 2) / 36 + time;
              const r = 200 + Math.sin(time * 5 + i) * 50;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, r), angle, angle + 0.1);
              ctx.strokeStyle = `hsl(${i * 10 + time * 100}, 100%, 50%)`;
              ctx.lineWidth = 20;
              ctx.stroke();
            }
            ctx.restore();
          }
        } else if (special.type === 'gravity') {
          if (elapsed > special.duration) {
            special.active = false;
          } else {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            ctx.save();
            ctx.globalAlpha = easeProgress * 0.3;
            ctx.strokeStyle = accent2;
            ctx.lineWidth = 2;
            for (let i = 0; i < 20; i++) {
              const x = (i / 20) * canvas.width;
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, canvas.height);
              ctx.stroke();
            }
            ctx.restore();
          }
        } else if (special.type === 'freeze') {
          if (elapsed > special.duration) {
            special.active = false;
          } else {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            ctx.save();
            ctx.globalAlpha = easeProgress * 0.4;
            ctx.fillStyle = '#e0ffff';
            for (let i = 0; i < 100; i++) {
              const x = Math.random() * canvas.width;
              const y = Math.random() * canvas.height;
              const s = Math.random() * 10 + 5;
              ctx.beginPath();
              ctx.moveTo(x, y - s);
              ctx.lineTo(x + s, y);
              ctx.lineTo(x, y + s);
              ctx.lineTo(x - s, y);
              ctx.closePath();
              ctx.fill();
            }
            ctx.restore();
          }
        } else if (special.type === 'ultimate') {
          if (elapsed > special.duration) {
            special.active = false;
          } else {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            const powerProgress = Math.pow(progress, 2);
            
            ctx.save();
            ctx.translate(special.x, special.y);
            
            // Screen shake for all ultimates
            const shake = Math.sin(progress * Math.PI) * 30 * (Math.random() > 0.5 ? 1 : -1);
            ctx.translate(Math.random() * shake, Math.random() * shake);
            
            ctx.globalCompositeOperation = 'screen'; // Make everything pop more
            
            if (variant === 1) { // Violet: Event Horizon Collapse & Reality Tear
              ctx.globalAlpha = easeProgress;
              
              // Reality Grid Distortion
              ctx.strokeStyle = accent3 + '40';
              ctx.lineWidth = 2;
              for(let i = -1000; i <= 1000; i += 100) {
                ctx.beginPath();
                ctx.moveTo(i, -1000);
                ctx.quadraticCurveTo(i * (1 - easeProgress), 0, i, 1000);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(-1000, i);
                ctx.quadraticCurveTo(0, i * (1 - easeProgress), 1000, i);
                ctx.stroke();
              }

              // Accretion disk - multiple layers
              for(let j = 0; j < 5; j++) {
                ctx.beginPath();
                ctx.ellipse(0, 0, (400 + j*50) * easeProgress, (100 + j*10) * easeProgress, time * (2 + j*0.5), 0, Math.PI * 2);
                ctx.strokeStyle = j % 2 === 0 ? accent1 : accent2;
                ctx.lineWidth = 10 + j * 5;
                ctx.stroke();
              }
              
              // Black hole core
              ctx.globalCompositeOperation = 'source-over';
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, 150 * easeProgress), 0, Math.PI * 2);
              ctx.fillStyle = '#000000';
              ctx.fill();
              ctx.shadowBlur = 100 * easeProgress;
              ctx.shadowColor = accent1;
              ctx.strokeStyle = accent2;
              ctx.lineWidth = 10;
              ctx.stroke();
              ctx.shadowBlur = 0;
              
              // Jets
              ctx.globalCompositeOperation = 'screen';
              ctx.beginPath();
              ctx.moveTo(0, -1500 * easeProgress);
              ctx.lineTo(0, 1500 * easeProgress);
              ctx.strokeStyle = accent3;
              ctx.lineWidth = 60 * easeProgress * (0.5 + Math.random() * 0.5);
              ctx.stroke();
              
              // Energy particles getting sucked in
              for(let i=0; i<50; i++) {
                const a = Math.random() * Math.PI * 2;
                const d = 150 + Math.random() * 800 * (1 - progress);
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(Math.cos(a)*d, Math.sin(a)*d, Math.max(0, Math.random()*5), 0, Math.PI*2);
                ctx.fill();
              }

              if (progress > 0.7) {
                const exp = (progress - 0.7) * 3.33;
                ctx.globalAlpha = 1 - exp;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, canvas.width * 2 * exp), 0, Math.PI * 2);
                ctx.fill();
              }
            } else if (variant === 2) { // Solar: Supernova Awakening & Cosmic Flare
              ctx.globalAlpha = easeProgress;
              const r = 400 * easeProgress * (1 + Math.sin(time * 50) * 0.1);
              
              // Massive Aura
              const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(0, r * 2));
              grad.addColorStop(0, '#ffffff');
              grad.addColorStop(0.1, accent1);
              grad.addColorStop(0.4, accent2);
              grad.addColorStop(1, 'transparent');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, r * 2), 0, Math.PI * 2);
              ctx.fill();
              
              // Solar flares - intense
              ctx.strokeStyle = accent1;
              ctx.lineCap = 'round';
              for (let i=0; i<16; i++) {
                const a = i * Math.PI / 8 + time * 5;
                ctx.lineWidth = 15 + Math.random() * 15;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5);
                ctx.quadraticCurveTo(Math.cos(a + 1) * r * 2, Math.sin(a + 1) * r * 2, Math.cos(a + 2) * r * 0.5, Math.sin(a + 2) * r * 0.5);
                ctx.stroke();
              }
              
              // Coronal Mass Ejections
              for(let i=0; i<5; i++) {
                const a = Math.random() * Math.PI * 2;
                const dist = r * 3 * progress;
                ctx.fillStyle = accent2;
                ctx.beginPath();
                ctx.arc(Math.cos(a)*dist, Math.sin(a)*dist, Math.max(0, 30 * (1-progress)), 0, Math.PI*2);
                ctx.fill();
              }

              if (progress > 0.5) {
                const exp = (progress - 0.5) * 2;
                ctx.globalAlpha = 1 - exp;
                ctx.fillStyle = accent1;
                ctx.fillRect(-canvas.width*2, -canvas.height*2, canvas.width*4, canvas.height*4);
              }
            } else if (variant === 3) { // Emerald: Yggdrasil Genesis
              ctx.globalAlpha = easeProgress;
              
              // Roots
              ctx.strokeStyle = accent3;
              ctx.lineWidth = 20 * easeProgress;
              ctx.lineCap = 'round';
              for(let i=0; i<8; i++) {
                const a = Math.PI/2 + (i-3.5) * 0.3;
                ctx.beginPath();
                ctx.moveTo(0, 400);
                ctx.quadraticCurveTo(Math.cos(a)*500, Math.sin(a)*500 + 400, Math.cos(a)*1000*easeProgress, Math.sin(a)*1000*easeProgress + 400);
                ctx.stroke();
              }

              // Tree Trunk
              ctx.strokeStyle = accent1;
              ctx.lineWidth = 80 * easeProgress;
              ctx.beginPath();
              ctx.moveTo(0, 800);
              ctx.quadraticCurveTo(150 * Math.sin(time * 3), 0, 0, -400 * easeProgress);
              ctx.stroke();
              
              // Fractal Branches
              const drawBranch = (x: number, y: number, angle: number, length: number, depth: number) => {
                if (depth === 0) return;
                const nx = x + Math.cos(angle) * length;
                const ny = y + Math.sin(angle) * length;
                ctx.strokeStyle = depth % 2 === 0 ? accent2 : accent1;
                ctx.lineWidth = depth * 4 * easeProgress;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(nx, ny);
                ctx.stroke();
                
                // Leaves
                if (depth <= 2) {
                  ctx.fillStyle = accent3;
                  ctx.beginPath();
                  ctx.arc(nx, ny, Math.max(0, 20 * easeProgress * Math.random()), 0, Math.PI * 2);
                  ctx.fill();
                }
                
                drawBranch(nx, ny, angle - 0.5 + Math.sin(time)*0.1, length * 0.7, depth - 1);
                drawBranch(nx, ny, angle + 0.5 + Math.sin(time)*0.1, length * 0.7, depth - 1);
              };
              
              drawBranch(0, -200 * easeProgress, -Math.PI/2, 250 * easeProgress, 5);
              
              // Glowing Runes/Spores
              ctx.fillStyle = '#ffffff';
              ctx.font = '24px sans-serif';
              for(let i=0; i<30; i++) {
                const a = Math.random() * Math.PI * 2;
                const d = Math.random() * 800 * easeProgress;
                ctx.fillText('✧', Math.cos(a)*d, Math.sin(a)*d - 200);
              }

              // Aura
              const grad = ctx.createRadialGradient(0, -200, 0, 0, -200, Math.max(0, 800 * easeProgress));
              grad.addColorStop(0, accent1 + '80');
              grad.addColorStop(1, 'transparent');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(0, -200, Math.max(0, 800 * easeProgress), 0, Math.PI * 2);
              ctx.fill();
            } else if (variant === 4) { // Glacier: Absolute Zero Matrix & Shatter
              ctx.globalAlpha = easeProgress;
              
              // Freezing Fog
              const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, canvas.width);
              grad.addColorStop(0, '#ffffff40');
              grad.addColorStop(0.5, accent1 + '40');
              grad.addColorStop(1, 'transparent');
              ctx.fillStyle = grad;
              ctx.fillRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2);

              // Giant Fractal Snowflake
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 12;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              for (let i=0; i<6; i++) {
                ctx.save();
                ctx.rotate(i * Math.PI / 3 + time * 0.2);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -800 * easeProgress);
                for (let j=1; j<=6; j++) {
                  const y = -j * 120 * easeProgress;
                  const size = (7-j) * 30 * easeProgress;
                  ctx.moveTo(0, y);
                  ctx.lineTo(size, y - size);
                  ctx.moveTo(0, y);
                  ctx.lineTo(-size, y - size);
                  // Sub-branches
                  if (j % 2 === 0) {
                    ctx.moveTo(size/2, y - size/2);
                    ctx.lineTo(size/2 + 20, y - size/2 - 20);
                    ctx.moveTo(-size/2, y - size/2);
                    ctx.lineTo(-size/2 - 20, y - size/2 - 20);
                  }
                }
                ctx.stroke();
                ctx.restore();
              }
              
              // Ice Spikes from edges
              ctx.fillStyle = accent2;
              for(let i=0; i<20; i++) {
                const a = i * Math.PI / 10;
                const d = 1000 - 500 * easeProgress;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a)*1000, Math.sin(a)*1000);
                ctx.lineTo(Math.cos(a-0.1)*1000, Math.sin(a-0.1)*1000);
                ctx.lineTo(Math.cos(a)*d, Math.sin(a)*d);
                ctx.fill();
              }

              if (progress > 0.8) {
                // Shatter effect
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 5;
                for(let i=0; i<30; i++) {
                  ctx.beginPath();
                  ctx.moveTo((Math.random()-0.5)*2000, (Math.random()-0.5)*2000);
                  ctx.lineTo((Math.random()-0.5)*2000, (Math.random()-0.5)*2000);
                  ctx.stroke();
                }
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = (progress - 0.8) * 5;
                ctx.fillRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2);
              }
            } else if (variant === 5) { // Magma: The Infernal Engine
              ctx.globalAlpha = easeProgress;
              
              // Swirling Fire Vortex Background
              ctx.save();
              ctx.rotate(time * 0.5);
              for (let i = 0; i < 12; i++) {
                const angle = (i * Math.PI * 2) / 12;
                const grad = ctx.createLinearGradient(0, 0, Math.cos(angle) * 1000, Math.sin(angle) * 1000);
                grad.addColorStop(0, accent1 + '00');
                grad.addColorStop(0.5, accent2 + '40');
                grad.addColorStop(1, accent1 + '00');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle - 0.2) * 1200, Math.sin(angle - 0.2) * 1200);
                ctx.lineTo(Math.cos(angle + 0.2) * 1200, Math.sin(angle + 0.2) * 1200);
                ctx.fill();
              }
              ctx.restore();

              // The Infernal Engine (Rotating Magma Gears)
              const gearCount = 3;
              for (let g = 0; g < gearCount; g++) {
                ctx.save();
                const gearSize = (400 - g * 100) * easeProgress;
                const rotSpeed = (0.5 + g * 0.3) * (g % 2 === 0 ? 1 : -1);
                ctx.rotate(time * rotSpeed);
                
                // Gear Body
                ctx.fillStyle = g === 0 ? '#1a0500' : accent1;
                ctx.strokeStyle = accent2;
                ctx.lineWidth = 10;
                
                ctx.beginPath();
                const teeth = 12 + g * 4;
                for (let i = 0; i < teeth * 2; i++) {
                  const angle = (i * Math.PI) / teeth;
                  const r = i % 2 === 0 ? gearSize : gearSize * 0.85;
                  if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                  else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Glowing Core of Gear
                const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(0, gearSize * 0.5));
                coreGrad.addColorStop(0, '#ffffff');
                coreGrad.addColorStop(0.5, accent2);
                coreGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = coreGrad;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, gearSize * 0.5), 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
              }

              // Molten Geysers (Steam Vents)
              for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8 + time;
                const dist = 500 * easeProgress;
                const gx = Math.cos(angle) * dist;
                const gy = Math.sin(angle) * dist;
                
                ctx.save();
                ctx.translate(gx, gy);
                ctx.rotate(angle + Math.PI / 2);
                
                const ventLength = 300 * Math.abs(Math.sin(time * 5 + i)) * easeProgress;
                const grad = ctx.createLinearGradient(0, 0, 0, -ventLength);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.5, accent1);
                grad.addColorStop(1, 'transparent');
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(-20, 0);
                ctx.lineTo(20, 0);
                ctx.lineTo(50, -ventLength);
                ctx.lineTo(-50, -ventLength);
                ctx.fill();
                
                // Sparks from vent
                for (let j = 0; j < 5; j++) {
                  const sparkY = -Math.random() * ventLength;
                  const sparkX = (Math.random() - 0.5) * 40;
                  ctx.fillStyle = '#ffffff';
                  ctx.beginPath();
                  ctx.arc(sparkX, sparkY, Math.max(0, Math.random() * 3), 0, Math.PI * 2);
                  ctx.fill();
                }
                
                ctx.restore();
              }

              // Screen Shake & Heat Haze (Simulated with random offsets)
              const shake = (Math.random() - 0.5) * 15 * easeProgress;
              ctx.translate(shake, shake);
              
            } else if (variant === 6) { // Celestial: Constellation Weaver & Astrolabe
              ctx.globalAlpha = easeProgress;
              
              // Giant Astrolabe Rings
              ctx.strokeStyle = accent1;
              ctx.lineWidth = 8;
              for(let i=0; i<4; i++) {
                ctx.save();
                ctx.rotate(time * (i%2===0?1:-1) * (0.2 + i*0.1));
                ctx.beginPath();
                ctx.ellipse(0, 0, (300 + i*150) * easeProgress, (100 + i*50) * easeProgress, i*Math.PI/4, 0, Math.PI * 2);
                ctx.stroke();
                // Notches
                for(let j=0; j<12; j++) {
                  const a = j * Math.PI / 6;
                  ctx.fillStyle = accent2;
                  ctx.beginPath();
                  ctx.arc(Math.cos(a)*(300+i*150)*easeProgress, Math.sin(a)*(100+i*50)*easeProgress, 8, 0, Math.PI*2);
                  ctx.fill();
                }
                ctx.restore();
              }

              // Complex Constellation Web
              ctx.strokeStyle = accent3;
              ctx.lineWidth = 3;
              const stars = [];
              for(let i=0; i<30; i++) {
                stars.push({
                  x: (Math.random()-0.5)*1500 * easeProgress,
                  y: (Math.random()-0.5)*1500 * easeProgress
                });
              }
              ctx.beginPath();
              for(let i=0; i<stars.length; i++) {
                for(let j=i+1; j<stars.length; j++) {
                  if (Math.random() > 0.9) {
                    ctx.moveTo(stars[i].x, stars[i].y);
                    ctx.lineTo(stars[j].x, stars[j].y);
                  }
                }
              }
              ctx.stroke();
              
              // Stars
              ctx.fillStyle = '#ffffff';
              ctx.shadowBlur = 20;
              ctx.shadowColor = '#ffffff';
              stars.forEach(s => {
                ctx.beginPath();
                ctx.arc(s.x, s.y, Math.max(0, 4 + Math.random()*6), 0, Math.PI*2);
                ctx.fill();
              });
              ctx.shadowBlur = 0;

              // Center Galaxy Core
              const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(0, 200 * easeProgress));
              grad.addColorStop(0, '#ffffff');
              grad.addColorStop(0.2, accent1);
              grad.addColorStop(1, 'transparent');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, 200 * easeProgress), 0, Math.PI * 2);
              ctx.fill();
            } else if (variant === 7) { // Cyberpunk: System Override & Matrix Collapse
              ctx.globalAlpha = easeProgress;
              
              // Hexagonal Grid Overlay
              ctx.strokeStyle = accent3 + '40';
              ctx.lineWidth = 2;
              const hexSize = 50;
              for(let x = -1000; x < 1000; x += hexSize * 1.5) {
                for(let y = -1000; y < 1000; y += hexSize * Math.sqrt(3)) {
                  const offset = (Math.abs(x) / (hexSize * 1.5)) % 2 === 1 ? hexSize * Math.sqrt(3) / 2 : 0;
                  ctx.beginPath();
                  for(let i=0; i<6; i++) {
                    const a = i * Math.PI / 3;
                    const px = x + Math.cos(a) * hexSize;
                    const py = y + offset + Math.sin(a) * hexSize;
                    if(i===0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                  }
                  ctx.closePath();
                  ctx.stroke();
                }
              }

              // Giant Glitch Skull - More detailed
              ctx.fillStyle = accent1;
              const glitchX = (Math.random() - 0.5) * 100 * powerProgress;
              const glitchY = (Math.random() - 0.5) * 100 * powerProgress;
              ctx.translate(glitchX, glitchY);
              
              // Skull base
              ctx.fillRect(-300 * easeProgress, -350 * easeProgress, 600 * easeProgress, 450 * easeProgress);
              ctx.fillRect(-180 * easeProgress, 100 * easeProgress, 360 * easeProgress, 200 * easeProgress);
              
              // Eyes
              ctx.fillStyle = '#000000';
              ctx.fillRect(-200 * easeProgress, -150 * easeProgress, 150 * easeProgress, 120 * easeProgress);
              ctx.fillRect(50 * easeProgress, -150 * easeProgress, 150 * easeProgress, 120 * easeProgress);
              
              // Teeth
              ctx.fillStyle = accent1;
              for(let i=0; i<5; i++) {
                ctx.fillRect((-150 + i*70) * easeProgress, 150 * easeProgress, 20 * easeProgress, 100 * easeProgress);
              }

              // Warning text multiplying
              ctx.fillStyle = accent2;
              ctx.font = 'bold 100px monospace';
              ctx.textAlign = 'center';
              for(let i=0; i<5; i++) {
                ctx.fillText('FATAL ERROR', (Math.random()-0.5)*200, 400 * easeProgress + i*100);
              }
              
              // Digital Rain
              ctx.fillStyle = accent3;
              ctx.font = '20px monospace';
              for(let i=0; i<100; i++) {
                ctx.fillText(Math.random()>0.5?'0':'1', (Math.random()-0.5)*2000, (Math.random()-0.5)*2000);
              }

              if (progress > 0.8) {
                ctx.fillStyle = Math.random() > 0.5 ? accent3 : '#ffffff';
                ctx.fillRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2);
              }
            } else if (variant === 8) { // Abyssal: Leviathan's Grasp & Deep Sea Terror
              ctx.globalAlpha = easeProgress;
              
              // Deep sea distortion
              const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1000);
              grad.addColorStop(0, '#000000');
              grad.addColorStop(0.5, accent1 + '80');
              grad.addColorStop(1, 'transparent');
              ctx.fillStyle = grad;
              ctx.fillRect(-1500, -1500, 3000, 3000);

              // Giant tentacles - more of them, more detailed
              ctx.strokeStyle = accent1;
              ctx.lineCap = 'round';
              for (let i=0; i<12; i++) {
                ctx.lineWidth = 60 * easeProgress;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                const a = i * Math.PI / 6 + time * 0.5;
                const wave = Math.sin(time * 2 + i) * 200;
                ctx.bezierCurveTo(
                  Math.cos(a + 0.5) * 400 * easeProgress, Math.sin(a + 0.5) * 400 * easeProgress + wave,
                  Math.cos(a - 0.5) * 800 * easeProgress, Math.sin(a - 0.5) * 800 * easeProgress - wave,
                  Math.cos(a) * 1500 * easeProgress, Math.sin(a) * 1500 * easeProgress
                );
                ctx.stroke();
                
                // Bioluminescent Suckers
                ctx.fillStyle = accent2;
                ctx.shadowBlur = 20;
                ctx.shadowColor = accent2;
                for (let j=1; j<=8; j++) {
                  const t = j / 8;
                  const sx = Math.cos(a) * 1500 * easeProgress * t + Math.cos(a+Math.PI/2)*wave*t;
                  const sy = Math.sin(a) * 1500 * easeProgress * t + Math.sin(a+Math.PI/2)*wave*t;
                  ctx.beginPath();
                  ctx.arc(sx, sy, Math.max(0, 25 * easeProgress * (1-t*0.5)), 0, Math.PI * 2);
                  ctx.fill();
                }
                ctx.shadowBlur = 0;
              }
              
              // Giant Glowing Eye
              ctx.fillStyle = accent3;
              ctx.beginPath();
              ctx.ellipse(0, 0, 250 * easeProgress, 100 * easeProgress, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#000000';
              ctx.beginPath();
              ctx.ellipse(0, 0, 50 * easeProgress, 100 * easeProgress, 0, 0, Math.PI * 2);
              ctx.fill();
              
              // Bubbles
              ctx.strokeStyle = '#ffffff40';
              ctx.lineWidth = 2;
              for(let i=0; i<50; i++) {
                ctx.beginPath();
                ctx.arc((Math.random()-0.5)*2000, (Math.random()-0.5)*2000, Math.max(0, Math.random()*30), 0, Math.PI*2);
                ctx.stroke();
              }
            } else if (variant === 9) { // Easter: Spring Awakening & Cosmic Bunny
              ctx.globalAlpha = easeProgress;
              
              // Giant glowing egg cracking
              const eggW = 300 * easeProgress;
              const eggH = 450 * easeProgress;
              
              if (progress < 0.5) {
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(0, eggH));
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.5, accent1);
                grad.addColorStop(1, accent2);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, eggW, eggH, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Crack lines
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.moveTo(-eggW*0.5, -eggH*0.5);
                ctx.lineTo(0, 0);
                ctx.lineTo(eggW*0.3, eggH*0.2);
                ctx.lineTo(-eggW*0.2, eggH*0.6);
                ctx.stroke();
              } else {
                // Cosmic Bunny Emerges
                const bunnyProg = (progress - 0.5) * 2;
                ctx.scale(1 + bunnyProg*2, 1 + bunnyProg*2);
                
                // Rainbow Aura
                for(let i=0; i<10; i++) {
                  ctx.fillStyle = `hsla(${i*36 + time*100}, 100%, 50%, ${0.2 * (1-bunnyProg)})`;
                  ctx.beginPath();
                  ctx.arc(0, 0, Math.max(0, 400 + i*50), 0, Math.PI*2);
                  ctx.fill();
                }

                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 50;
                ctx.shadowColor = accent1;
                // Body
                ctx.beginPath(); ctx.arc(0, 100, 150, 0, Math.PI * 2); ctx.fill();
                // Head
                ctx.beginPath(); ctx.arc(0, -50, 120, 0, Math.PI * 2); ctx.fill();
                // Ears
                ctx.beginPath(); ctx.ellipse(-50, -200, 40, 120, -0.2, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(50, -200, 40, 120, 0.2, 0, Math.PI * 2); ctx.fill();
                // Inner Ears
                ctx.fillStyle = accent2;
                ctx.beginPath(); ctx.ellipse(-50, -200, 20, 80, -0.2, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(50, -200, 20, 80, 0.2, 0, Math.PI * 2); ctx.fill();
                // Eyes
                ctx.fillStyle = accent3;
                ctx.beginPath(); ctx.arc(-40, -60, 15, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(40, -60, 15, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                
                // Flower explosion
                for(let i=0; i<30; i++) {
                  const a = Math.random() * Math.PI * 2;
                  const d = bunnyProg * 1000 * Math.random();
                  ctx.fillStyle = Math.random()>0.5 ? accent1 : accent2;
                  ctx.beginPath();
                  for(let j=0; j<5; j++) {
                    const fa = j * Math.PI*2/5;
                    ctx.arc(Math.cos(a)*d + Math.cos(fa)*20, Math.sin(a)*d + Math.sin(fa)*20, 15, 0, Math.PI*2);
                  }
                  ctx.fill();
                  ctx.fillStyle = '#ffffff';
                  ctx.beginPath();
                  ctx.arc(Math.cos(a)*d, Math.sin(a)*d, 10, 0, Math.PI*2);
                  ctx.fill();
                }
              }
            } else if (variant === 10) { // Matrix: The Source & Data Tornado
              ctx.globalAlpha = easeProgress;
              
              // Data Tornado
              ctx.fillStyle = '#00ff00';
              ctx.font = 'bold 24px monospace';
              for(let i=0; i<200; i++) {
                const a = i * 0.1 + time * 5;
                const r = i * 5 * easeProgress;
                const y = -1000 + i * 10 + Math.sin(time*10)*100;
                const x = Math.cos(a) * r;
                const z = Math.sin(a) * r;
                // Pseudo 3D
                const scale = 1000 / (1000 + z);
                ctx.save();
                ctx.translate(x * scale, y * scale);
                ctx.scale(scale, scale);
                ctx.globalAlpha = Math.min(1, scale) * easeProgress;
                ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), 0, 0);
                ctx.restore();
              }

              // Giant Eye of the Source
              ctx.globalAlpha = easeProgress;
              ctx.fillStyle = '#00ff00';
              ctx.shadowBlur = 100;
              ctx.shadowColor = '#00ff00';
              ctx.beginPath();
              ctx.ellipse(0, 0, 600 * easeProgress, 300 * easeProgress, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#000000';
              ctx.beginPath();
              ctx.ellipse(0, 0, 550 * easeProgress, 270 * easeProgress, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, 200 * easeProgress), 0, Math.PI * 2);
              ctx.fill();
              // Pupil
              ctx.fillStyle = '#000000';
              ctx.beginPath();
              ctx.ellipse(0, 0, 50 * easeProgress, 150 * easeProgress, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
              
              if (progress > 0.8) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2);
              }
            } else if (variant === 11) { // Cyberpunk 2: Neon Overdrive & Hyperspace Jump
              ctx.globalAlpha = easeProgress;
              
              // Hyperspace Grid Tunnel
              ctx.strokeStyle = accent1;
              ctx.lineWidth = 8;
              for (let i=0; i<20; i++) {
                const z = (i * 100 - time * 2000) % 2000;
                if (z < 0) continue;
                const scale = 2000 / Math.max(1, z);
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, 100 * scale * easeProgress), 0, Math.PI * 2);
                ctx.globalAlpha = Math.min(1, z/2000) * easeProgress;
                ctx.stroke();
              }
              
              // Radial Grid lines
              ctx.globalAlpha = easeProgress;
              ctx.strokeStyle = accent2;
              ctx.lineWidth = 4;
              for(let i=0; i<16; i++) {
                const a = i * Math.PI / 8;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a)*100, Math.sin(a)*100);
                ctx.lineTo(Math.cos(a)*2000, Math.sin(a)*2000);
                ctx.stroke();
              }

              // Synthwave Sun
              ctx.fillStyle = accent3;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, 300 * easeProgress), 0, Math.PI * 2);
              ctx.fill();
              // Sun stripes
              ctx.globalCompositeOperation = 'destination-out';
              for(let i=0; i<10; i++) {
                ctx.fillRect(-300, i*30, 600, 10 + i*2);
              }
              ctx.globalCompositeOperation = 'screen';

              // Intense Speed lines
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 10;
              for (let i=0; i<50; i++) {
                const a = Math.random() * Math.PI * 2;
                const d1 = 400 + Math.random() * 1000;
                const d2 = d1 + 200 + Math.random() * 500;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a)*d1, Math.sin(a)*d1);
                ctx.lineTo(Math.cos(a)*d2, Math.sin(a)*d2);
                ctx.stroke();
              }
              
              if (progress > 0.8) {
                const exp = (progress - 0.8) * 5;
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = exp;
                ctx.fillRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2);
              }
            }
            
            ctx.restore();
          }
        } else if (special.type === 'hell') {
          if (elapsed > special.duration) {
            special.active = false;
          } else {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            const cw = canvas.width;
            const ch = canvas.height;
            const maxDim = Math.max(cw, ch);
            const baseDim = Math.min(cw, ch) * 0.55; // Further scaled down the core elements
            
            ctx.save();
            ctx.translate(special.x, special.y);
            
            // Subtle rumble instead of annoying shake
            const shakeIntensity = Math.pow(progress, 2) * 15; 
            const shakeX = Math.sin(progress * Math.PI * 40) * shakeIntensity;
            const shakeY = Math.cos(progress * Math.PI * 47) * shakeIntensity;
            ctx.translate(shakeX, shakeY);
            
            // Global suffering overlay
            ctx.globalCompositeOperation = variant === 6 ? 'screen' : 'multiply';
            ctx.fillStyle = variant === 6 ? `rgba(255, 255, 200, ${easeProgress * 0.3})` : `rgba(50, 0, 0, ${easeProgress * 0.5})`;
            ctx.fillRect(-maxDim*2, -maxDim*2, maxDim*4, maxDim*4);
            
            ctx.globalCompositeOperation = 'screen';
            
            if (variant === 1) { // Violet: The Eye of Judgment
              ctx.globalAlpha = easeProgress;
              
              // Giant slit eye covering the screen
              ctx.beginPath();
              ctx.ellipse(0, 0, baseDim * 0.8 * easeProgress, baseDim * 0.4 * easeProgress, 0, 0, Math.PI * 2);
              ctx.fillStyle = '#050010';
              ctx.fill();
              ctx.lineWidth = 20;
              ctx.strokeStyle = accent1;
              ctx.stroke();
              
              // Iris
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, baseDim * 0.3 * easeProgress), 0, Math.PI * 2);
              const irisGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 0.3);
              irisGrad.addColorStop(0, accent2);
              irisGrad.addColorStop(0.5, accent1);
              irisGrad.addColorStop(1, '#000000');
              ctx.fillStyle = irisGrad;
              ctx.fill();
              
              // Slit pupil
              ctx.beginPath();
              ctx.ellipse(0, 0, baseDim * 0.05 * easeProgress, baseDim * 0.25 * easeProgress, 0, 0, Math.PI * 2);
              ctx.fillStyle = '#000000';
              ctx.fill();

              // Blood tears
              ctx.fillStyle = '#ff0000';
              for(let i=0; i<20; i++) {
                const dropY = (time * 1500 + i * 150) % (baseDim * 1.5);
                ctx.beginPath();
                ctx.arc((i - 10) * 40, baseDim * 0.2 + dropY, 10, 0, Math.PI*2);
                ctx.fill();
              }
              
              // Void tendrils ripping the screen
              for(let i=0; i<80; i++) {
                const angle = (i / 80) * Math.PI * 2 + time * 0.8;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle)*baseDim*0.3, Math.sin(angle)*baseDim*0.3);
                ctx.quadraticCurveTo(
                  Math.cos(angle+2)*baseDim*0.8, Math.sin(angle+2)*baseDim*0.8,
                  Math.cos(angle)*baseDim*1.5, Math.sin(angle)*baseDim*1.5
                );
                ctx.strokeStyle = i % 2 === 0 ? accent3 : '#000000';
                ctx.lineWidth = 10 + Math.random() * 20;
                ctx.stroke();
              }

              ctx.font = `bold ${baseDim*0.15}px serif`;
              ctx.textAlign = 'center';
              ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
              ctx.fillText("I SEE YOUR SINS", 0, baseDim*0.6);
            } else if (variant === 2) { // Solar: The Eternal Furnace
              ctx.globalAlpha = easeProgress;
              
              // Fire tornado base
              const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 1.2 * easeProgress);
              grad.addColorStop(0, '#ffffff');
              grad.addColorStop(0.1, accent1);
              grad.addColorStop(0.3, accent2);
              grad.addColorStop(0.8, '#330000');
              grad.addColorStop(1, 'transparent');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, baseDim * 1.2 * easeProgress), 0, Math.PI * 2);
              ctx.fill();
              
              // Swirling fire pillars
              for(let i=0; i<30; i++) {
                const angle = (i / 30) * Math.PI * 2 + time * 12;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                for(let r=0; r<baseDim*1.5; r+=50) {
                  const spiralAngle = angle + r * 0.005;
                  ctx.lineTo(Math.cos(spiralAngle)*r, Math.sin(spiralAngle)*r - r*1.5);
                }
                ctx.strokeStyle = i % 3 === 0 ? accent3 : (i % 3 === 1 ? accent1 : '#ff0000');
                ctx.lineWidth = 30 + Math.sin(time*20+i)*20;
                ctx.stroke();
              }

              // Chains of damnation pulling down
              ctx.strokeStyle = '#111111';
              ctx.lineWidth = 15;
              for(let i=0; i<20; i++) {
                const cx = (i - 10) * (baseDim / 6);
                ctx.beginPath();
                ctx.moveTo(cx, -baseDim*1.5);
                ctx.lineTo(cx, baseDim * 1.5 * easeProgress);
                ctx.stroke();
                // Chain links
                for(let y=-baseDim*1.5; y<baseDim*1.5*easeProgress; y+=60) {
                  ctx.beginPath();
                  ctx.ellipse(cx, y, 10, 20, y % 120 === 0 ? 0 : Math.PI/2, 0, Math.PI*2);
                  ctx.stroke();
                }
              }

              ctx.font = `bold ${baseDim*0.15}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
              ctx.fillText("BURN ETERNALLY", 0, 0);
            } else if (variant === 3) { // Emerald: The Plague
              ctx.globalAlpha = easeProgress;
              
              // Poison clouds
              for(let i=0; i<60; i++) {
                const angle = (i / 60) * Math.PI * 2 + time * 0.8;
                const dist = baseDim * 0.6 * easeProgress + Math.sin(time*4+i)*150;
                ctx.beginPath();
                ctx.arc(Math.cos(angle)*dist, Math.sin(angle)*dist, Math.max(0, baseDim * 0.5 * easeProgress), 0, Math.PI * 2);
                const cloudGrad = ctx.createRadialGradient(Math.cos(angle)*dist, Math.sin(angle)*dist, 0, Math.cos(angle)*dist, Math.sin(angle)*dist, baseDim * 0.5 * easeProgress);
                cloudGrad.addColorStop(0, accent1);
                cloudGrad.addColorStop(0.5, accent2);
                cloudGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = cloudGrad;
                ctx.fill();
              }
              
              // Acid rain
              ctx.strokeStyle = accent3;
              ctx.lineWidth = 5;
              for(let i=0; i<500; i++) {
                const x = (Math.random() - 0.5) * baseDim * 2.5;
                const y = (Math.random() - 0.5) * baseDim * 2.5 + (time * 3000) % baseDim;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 20, y + 100);
                ctx.stroke();
              }

              // Giant rotting skulls (abstract)
              ctx.fillStyle = '#051005';
              for(let i=0; i<8; i++) {
                const angle = (i / 8) * Math.PI * 2 - time * 1.5;
                const dist = baseDim * 0.4;
                ctx.save();
                ctx.translate(Math.cos(angle)*dist, Math.sin(angle)*dist);
                ctx.rotate(angle + Math.PI/2);
                ctx.beginPath();
                ctx.arc(0, 0, 150, Math.PI, 0);
                ctx.lineTo(100, 150);
                ctx.lineTo(-100, 150);
                ctx.fill();
                ctx.fillStyle = accent1;
                ctx.beginPath();
                ctx.arc(-50, -50, 30, 0, Math.PI*2);
                ctx.arc(50, -50, 30, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
              }

              ctx.font = `bold ${baseDim*0.15}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
              ctx.fillText("ROT AND DECAY", 0, baseDim*0.5);
            } else if (variant === 4) { // Glacier: The Frozen Hell
              ctx.globalAlpha = easeProgress;
              
              // Giant jagged ice spikes impaling the screen
              for(let i=0; i<36; i++) {
                const angle = (i / 36) * Math.PI * 2 + (i%2===0 ? time*0.3 : -time*0.3);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle - 0.1)*baseDim*0.2, Math.sin(angle - 0.1)*baseDim*0.2);
                ctx.lineTo(Math.cos(angle)*baseDim*1.5*easeProgress, Math.sin(angle)*baseDim*1.5*easeProgress);
                ctx.lineTo(Math.cos(angle + 0.1)*baseDim*0.2, Math.sin(angle + 0.1)*baseDim*0.2);
                ctx.fillStyle = i % 3 === 0 ? accent1 : (i % 3 === 1 ? accent2 : '#ffffff');
                ctx.fill();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 8;
                ctx.stroke();
              }
              
              // Freezing fog
              const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 1.2 * easeProgress);
              grad.addColorStop(0, accent3);
              grad.addColorStop(0.5, accent1);
              grad.addColorStop(1, 'transparent');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, baseDim * 1.2 * easeProgress), 0, Math.PI * 2);
              ctx.fill();

              // Shattered glass effect
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 3;
              for(let i=0; i<100; i++) {
                ctx.beginPath();
                ctx.moveTo((Math.random()-0.5)*baseDim*2.5, (Math.random()-0.5)*baseDim*2.5);
                ctx.lineTo((Math.random()-0.5)*baseDim*2.5, (Math.random()-0.5)*baseDim*2.5);
                ctx.stroke();
              }

              ctx.font = `bold ${baseDim*0.15}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
              ctx.fillText("ABSOLUTE ZERO", 0, -baseDim*0.5);
            } else if (variant === 5) { // Magma: The Great Rift
              ctx.globalAlpha = easeProgress;
              
              // The screen splits in half, revealing a massive demonic maw
              ctx.beginPath();
              ctx.moveTo(-baseDim*1.5, 0);
              ctx.quadraticCurveTo(0, baseDim * 1.2 * easeProgress, baseDim*1.5, 0);
              ctx.quadraticCurveTo(0, -baseDim * 1.2 * easeProgress, -baseDim*1.5, 0);
              ctx.fillStyle = '#110000';
              ctx.fill();
              ctx.lineWidth = 40;
              ctx.strokeStyle = accent1;
              ctx.stroke();

              // Teeth of the rift
              ctx.fillStyle = '#000000';
              for(let i=-baseDim*1.5; i<baseDim*1.5; i+=100) {
                ctx.beginPath();
                ctx.moveTo(i, baseDim * 0.6 * easeProgress * (1 - Math.abs(i)/(baseDim*1.5)));
                ctx.lineTo(i+50, 0);
                ctx.lineTo(i+100, baseDim * 0.6 * easeProgress * (1 - Math.abs(i+100)/(baseDim*1.5)));
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(i, -baseDim * 0.6 * easeProgress * (1 - Math.abs(i)/(baseDim*1.5)));
                ctx.lineTo(i+50, 0);
                ctx.lineTo(i+100, -baseDim * 0.6 * easeProgress * (1 - Math.abs(i+100)/(baseDim*1.5)));
                ctx.fill();
              }
              
              // Lava erupting from rift
              for(let i=0; i<150; i++) {
                const x = (Math.random() - 0.5) * baseDim * 2;
                const y = (Math.random() - 0.5) * 200;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + (Math.random()-0.5)*300, y - baseDim*1.2 - Math.random()*baseDim);
                ctx.strokeStyle = Math.random() > 0.5 ? accent2 : accent3;
                ctx.lineWidth = 10 + Math.random()*20;
                ctx.stroke();
              }

              ctx.font = `bold ${baseDim*0.2}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
              ctx.fillText("CONSUMED", 0, 0);
            } else if (variant === 6) { // Celestial: The Cosmic Singularity
              ctx.globalAlpha = easeProgress;
              
              // Blinding cosmic light
              const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 1.5 * easeProgress);
              grad.addColorStop(0, '#ffffff');
              grad.addColorStop(0.2, accent1);
              grad.addColorStop(0.5, accent2);
              grad.addColorStop(1, 'transparent');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, baseDim * 1.5 * easeProgress), 0, Math.PI * 2);
              ctx.fill();

              // Interlocking fractal rings
              ctx.lineWidth = 30;
              for(let r=1; r<=4; r++) {
                ctx.save();
                ctx.rotate(time * r * 0.8);
                ctx.scale(1, 0.2 + r*0.2);
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 0.4 * r * easeProgress, 0, Math.PI*2);
                ctx.strokeStyle = accent3;
                ctx.stroke();
                
                // Pulsing energy nodes on rings
                for(let e=0; e<12*r; e++) {
                  const eAngle = (e / (12*r)) * Math.PI * 2;
                  const ex = Math.cos(eAngle) * baseDim * 0.4 * r * easeProgress;
                  const ey = Math.sin(eAngle) * baseDim * 0.4 * r * easeProgress;
                  ctx.fillStyle = '#ffffff';
                  ctx.beginPath();
                  ctx.arc(ex, ey, 15 + Math.sin(time * 10 + e) * 5, 0, Math.PI*2);
                  ctx.fill();
                }
                ctx.restore();
              }
              
              // Beams of pure energy
              for(let i=0; i<16; i++) {
                const angle = (i / 16) * Math.PI * 2 + time * 1.5;
                const dist = baseDim * 0.6 * easeProgress;
                ctx.save();
                ctx.translate(Math.cos(angle)*dist, Math.sin(angle)*dist);
                ctx.rotate(angle + Math.PI/2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = accent1;
                ctx.shadowBlur = 50;
                // Abstract energy shards instead of crosses
                ctx.beginPath();
                ctx.moveTo(0, -baseDim * 1.5);
                ctx.lineTo(40, 0);
                ctx.lineTo(0, baseDim * 1.5);
                ctx.lineTo(-40, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
              }
              ctx.shadowBlur = 0;

              ctx.font = `bold ${baseDim*0.15}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.fillText("ASCEND TO THE VOID", 0, baseDim*0.8);

              ctx.font = `bold ${baseDim*0.15}px serif`;
              ctx.textAlign = 'center';
              ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
              ctx.fillText("BEYOND THE STARS", 0, baseDim*0.7);
            } else if (variant === 7) { // Cyberpunk: The System Hell
              ctx.globalAlpha = easeProgress;
              
              // Red screen of death
              ctx.fillStyle = accent1;
              ctx.fillRect(-maxDim*2, -maxDim*2, maxDim*4, maxDim*4);
              
              // Massive Glitch blocks
              ctx.fillStyle = '#000000';
              for(let i=0; i<300; i++) {
                ctx.fillRect(
                  (Math.random() - 0.5) * baseDim * 2.5,
                  (Math.random() - 0.5) * baseDim * 2.5,
                  Math.random() * baseDim * 1.2,
                  Math.random() * 100
                );
              }
              
              // Giant warning symbol & Text
              ctx.strokeStyle = accent2;
              ctx.lineWidth = 60;
              ctx.beginPath();
              ctx.moveTo(0, -baseDim*0.8);
              ctx.lineTo(baseDim*0.8, baseDim*0.5);
              ctx.lineTo(-baseDim*0.8, baseDim*0.5);
              ctx.closePath();
              ctx.stroke();
              ctx.fillStyle = accent2;
              ctx.fillRect(-30, -baseDim*0.3, 60, baseDim*0.5);
              ctx.fillRect(-30, baseDim*0.3, 60, 60);

              ctx.font = `bold ${baseDim*0.25}px monospace`;
              ctx.textAlign = 'center';
              ctx.fillStyle = '#ffffff';
              ctx.fillText("FATAL ERROR", 0, -baseDim*0.9);
              ctx.fillText("JUDGMENT", 0, baseDim*0.9);
              
              for(let i=0; i<10; i++) {
                ctx.fillStyle = accent3;
                ctx.fillText("SUFFER", (Math.random()-0.5)*baseDim*1.5, (Math.random()-0.5)*baseDim*1.5);
              }
            } else if (variant === 8) { // Abyssal: The Leviathan
              ctx.globalAlpha = easeProgress;
              
              // Giant whirlpool
              for(let i=0; i<40; i++) {
                const angle = (i / 40) * Math.PI * 2 + time * 4;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                for(let r=0; r<baseDim*2; r+=60) {
                  const spiralAngle = angle + r * 0.003;
                  ctx.lineTo(Math.cos(spiralAngle)*r, Math.sin(spiralAngle)*r);
                }
                ctx.strokeStyle = i % 2 === 0 ? accent1 : accent2;
                ctx.lineWidth = 40;
                ctx.stroke();
              }
              
              // Massive tentacles wrapping the screen
              for(let i=0; i<16; i++) {
                const angle = (i / 16) * Math.PI * 2 - time * 0.8;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle)*baseDim*1.5, Math.sin(angle)*baseDim*1.5);
                ctx.quadraticCurveTo(
                  Math.cos(angle+1)*baseDim*0.6, Math.sin(angle+1)*baseDim*0.6,
                  0, 0
                );
                ctx.strokeStyle = accent3;
                ctx.lineWidth = 80 * easeProgress;
                ctx.stroke();
                
                // Suckers
                for(let s=0; s<12; s++) {
                  const sDist = s * 0.08;
                  const sx = Math.cos(angle)*(baseDim*1.5*(1-sDist));
                  const sy = Math.sin(angle)*(baseDim*1.5*(1-sDist));
                  ctx.beginPath();
                  ctx.arc(sx, sy, 25 * easeProgress, 0, Math.PI*2);
                  ctx.fillStyle = accent1;
                  ctx.fill();
                }
              }

              // Giant teeth in the center
              ctx.fillStyle = '#050510';
              ctx.beginPath();
              ctx.arc(0, 0, baseDim*0.4*easeProgress, 0, Math.PI*2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              for(let i=0; i<50; i++) {
                const angle = (i / 50) * Math.PI * 2 - time*3;
                const r = baseDim*0.4 * easeProgress;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r);
                ctx.lineTo(Math.cos(angle+0.1)*r, Math.sin(angle+0.1)*r);
                ctx.lineTo(Math.cos(angle+0.05)*(r-baseDim*0.2), Math.sin(angle+0.05)*(r-baseDim*0.2));
                ctx.fill();
              }

              ctx.font = `bold ${baseDim*0.15}px serif`;
              ctx.textAlign = 'center';
              ctx.fillStyle = 'rgba(0, 100, 255, 0.6)';
              ctx.fillText("DROWN IN DESPAIR", 0, 0);
            } else if (variant === 9) { // Easter: The Beast
              ctx.globalAlpha = easeProgress;
              
              // Giant corrupted egg/body
              ctx.beginPath();
              ctx.ellipse(0, 0, baseDim*0.6 * easeProgress, baseDim*0.9 * easeProgress, 0, 0, Math.PI * 2);
              ctx.fillStyle = '#110000';
              ctx.fill();
              ctx.strokeStyle = accent1;
              ctx.lineWidth = 40;
              ctx.stroke();
              
              // Cracks glowing
              ctx.strokeStyle = accent2;
              ctx.lineWidth = 20;
              ctx.beginPath();
              ctx.moveTo(0, -baseDim*0.9*easeProgress);
              ctx.lineTo(baseDim*0.2, -baseDim*0.4);
              ctx.lineTo(-baseDim*0.2, 0);
              ctx.lineTo(baseDim*0.3, baseDim*0.4);
              ctx.lineTo(0, baseDim*0.9*easeProgress);
              ctx.stroke();
              
              // Demonic bunny shadows & claws
              ctx.fillStyle = 'rgba(0,0,0,0.9)';
              for(let i=0; i<10; i++) {
                const angle = (i / 10) * Math.PI * 2 + time * 2;
                const dist = baseDim * 1.0 * easeProgress;
                ctx.beginPath();
                ctx.arc(Math.cos(angle)*dist, Math.sin(angle)*dist, baseDim*0.3, 0, Math.PI*2);
                ctx.fill();
                // Ears
                ctx.ellipse(Math.cos(angle)*dist - baseDim*0.1, Math.sin(angle)*dist - baseDim*0.35, baseDim*0.08, baseDim*0.3, -0.3, 0, Math.PI*2);
                ctx.ellipse(Math.cos(angle)*dist + baseDim*0.1, Math.sin(angle)*dist - baseDim*0.35, baseDim*0.08, baseDim*0.3, 0.3, 0, Math.PI*2);
                ctx.fill();
                
                // Claws
                ctx.strokeStyle = accent3;
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle)*dist, Math.sin(angle)*dist);
                ctx.lineTo(0, 0);
                ctx.stroke();
              }

              // Blood splatters
              ctx.fillStyle = '#ff0000';
              for(let i=0; i<80; i++) {
                ctx.beginPath();
                ctx.arc((Math.random()-0.5)*baseDim*2.5, (Math.random()-0.5)*baseDim*2.5, Math.random()*50, 0, Math.PI*2);
                ctx.fill();
              }

              ctx.font = `bold ${baseDim*0.15}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
              ctx.fillText("NO RESURRECTION", 0, baseDim*0.8);
            } else if (variant === 10) { // Matrix: The Code Hell
              ctx.globalAlpha = easeProgress;
              
              // Cascading red code walls
              ctx.fillStyle = accent1;
              ctx.font = `bold ${baseDim*0.1}px monospace`;
              for(let x=-baseDim*1.5; x<baseDim*1.5; x+=baseDim*0.1) {
                for(let y=-baseDim*1.5; y<baseDim*1.5; y+=baseDim*0.1) {
                  if (Math.random() > 0.2) {
                    ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), x, y + (time * 1500) % (baseDim*0.15));
                  }
                }
              }
              
              // Giant red purge beams
              ctx.fillStyle = '#ff0000';
              ctx.globalAlpha = easeProgress * 0.9;
              for(let i=0; i<8; i++) {
                ctx.fillRect((Math.random()-0.5)*baseDim*2.5, -baseDim*1.5, baseDim*0.2, baseDim*3);
              }

              // Giant "PURGE" text
              ctx.globalAlpha = easeProgress;
              ctx.font = `bold ${baseDim*0.5}px monospace`;
              ctx.textAlign = 'center';
              ctx.fillStyle = '#ffffff';
              ctx.fillText("PURGE", 0, 0);
              ctx.font = `bold ${baseDim*0.15}px monospace`;
              ctx.fillText("SYSTEM ANNIHILATION", 0, baseDim*0.3);
            } else if (variant === 11) { // Cyberpunk 2: The Digital Demon
              ctx.globalAlpha = easeProgress;
              
              // Grid floor warped into a funnel
              ctx.strokeStyle = accent1;
              ctx.lineWidth = 10;
              for(let i=0; i<40; i++) {
                const angle = (i / 40) * Math.PI * 2 + time * 1.5;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle)*baseDim*2, Math.sin(angle)*baseDim*2);
                ctx.stroke();
              }
              for(let r=50; r<baseDim*2; r*=1.4) {
                ctx.beginPath();
                ctx.arc(0, 0, r * (1 + Math.sin(time*8)*0.3), 0, Math.PI*2);
                ctx.stroke();
              }
              
              // Giant neon demon skull
              ctx.strokeStyle = accent2;
              ctx.lineWidth = 40;
              ctx.beginPath();
              ctx.arc(0, -baseDim*0.3, baseDim*0.6 * easeProgress, Math.PI, 0);
              ctx.lineTo(baseDim*0.5 * easeProgress, baseDim*0.6 * easeProgress);
              ctx.lineTo(-baseDim*0.5 * easeProgress, baseDim*0.6 * easeProgress);
              ctx.closePath();
              ctx.stroke();
              
              // Glowing eyes
              ctx.fillStyle = accent3;
              ctx.beginPath();
              ctx.arc(-baseDim*0.25 * easeProgress, -baseDim*0.3 * easeProgress, baseDim*0.15, 0, Math.PI*2);
              ctx.arc(baseDim*0.25 * easeProgress, -baseDim*0.3 * easeProgress, baseDim*0.15, 0, Math.PI*2);
              ctx.fill();

              // Digital teeth
              ctx.fillStyle = accent1;
              for(let i=-baseDim*0.4; i<=baseDim*0.4; i+=baseDim*0.15) {
                ctx.fillRect(i * easeProgress, baseDim*0.6 * easeProgress, baseDim*0.08, baseDim*0.2);
                ctx.fillRect(i * easeProgress, baseDim*0.85 * easeProgress, baseDim*0.08, baseDim*0.2);
              }

              ctx.font = `bold ${baseDim*0.15}px monospace`;
              ctx.textAlign = 'center';
              ctx.fillStyle = '#ffffff';
              ctx.fillText("SOUL DELETED", 0, baseDim*0.2);
            }
            
            if (progress > 0.7) {
              const exp = (progress - 0.7) * 3.33; // 0 to 1
              ctx.fillStyle = variant === 6 ? '#ffffff' : '#000000';
              ctx.globalAlpha = exp;
              ctx.fillRect(-maxDim*2, -maxDim*2, maxDim*4, maxDim*4);
            }
            
            ctx.restore();
          }
        } else if (special.type === 'heaven') {
          if (elapsed > special.duration) {
            special.active = false;
          } else {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            const cw = canvas.width;
            const ch = canvas.height;
            const maxDim = Math.max(cw, ch);
            const baseDim = Math.min(cw, ch) * 0.45; // Reduced size to 45% of minimum screen dimension
            
            // Particle Interaction
            const particles = particlesRef.current;
            for (let i = 0; i < particles.length; i++) {
              const p = particles[i];
              const dx = special.x - p.x;
              const dy = special.y - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0) {
                // Majestic particle dance: pull in, orbit, then explode outwards
                const pullPhase = Math.sin(progress * Math.PI);
                const orbitPhase = Math.cos(progress * Math.PI * 4);
                const pushPhase = Math.pow(progress, 4) * 50;
                
                p.vx += (dx / dist) * pullPhase * 0.05;
                p.vy += (dy / dist) * pullPhase * 0.05;
                
                p.vx += (-dy / dist) * orbitPhase * 0.05;
                p.vy += (dx / dist) * orbitPhase * 0.05;
                
                p.vx -= (dx / dist) * pushPhase * 0.02;
                p.vy -= (dy / dist) * pushPhase * 0.02;
                
                // Permanently increase particle size during heaven
                p.size += 0.015 * easeProgress;
                if (p.size > 15) p.size = 15;
              }
            }
            
            ctx.save();
            ctx.translate(special.x, special.y);
            
            // Gentle floating effect with a majestic sway
            const floatY = Math.sin(progress * Math.PI * 6) * 30 * easeProgress;
            const floatX = Math.cos(progress * Math.PI * 4) * 15 * easeProgress;
            ctx.translate(floatX, floatY);
            
            // Global heavenly glow overlay
            ctx.globalCompositeOperation = 'screen';
            const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxDim);
            glowGrad.addColorStop(0, `rgba(255, 255, 255, ${easeProgress * 0.6})`);
            glowGrad.addColorStop(0.5, `${accent1}${Math.floor(easeProgress * 128).toString(16).padStart(2, '0')}`);
            glowGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGrad;
            ctx.fillRect(-maxDim, -maxDim, maxDim*2, maxDim*2);
            
            // Majestic God-Rays (Light Beams)
            ctx.save();
            ctx.rotate(time * 0.2);
            for (let i = 0; i < 24; i++) {
              ctx.rotate((Math.PI * 2) / 24);
              const rayGrad = ctx.createLinearGradient(0, 0, maxDim, 0);
              rayGrad.addColorStop(0, `rgba(255, 255, 255, ${easeProgress * 0.3})`);
              rayGrad.addColorStop(1, 'transparent');
              ctx.fillStyle = rayGrad;
              ctx.beginPath();
              ctx.moveTo(0, -10 * easeProgress);
              ctx.lineTo(maxDim, -50 * easeProgress);
              ctx.lineTo(maxDim, 50 * easeProgress);
              ctx.lineTo(0, 10 * easeProgress);
              ctx.fill();
            }
            ctx.restore();

            // Additional Global Visual Effects: Rotating Sacred Geometry Halo
            ctx.save();
            ctx.globalAlpha = easeProgress * 0.5;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.rotate(-time * 0.15);
            for (let r = 1; r <= 3; r++) {
              const radius = baseDim * (1 + r * 0.3);
              ctx.beginPath();
              ctx.arc(0, 0, radius, 0, Math.PI * 2);
              ctx.stroke();
              
              // Draw small diamonds on the rings
              const numDiamonds = 8 * r;
              for (let i = 0; i < numDiamonds; i++) {
                const angle = (i * Math.PI * 2) / numDiamonds + time * (r % 2 === 0 ? 0.5 : -0.5);
                const dx = Math.cos(angle) * radius;
                const dy = Math.sin(angle) * radius;
                ctx.save();
                ctx.translate(dx, dy);
                ctx.rotate(angle + Math.PI / 4);
                ctx.fillStyle = accent2;
                ctx.fillRect(-4, -4, 8, 8);
                ctx.restore();
              }
            }
            ctx.restore();
            
            // Floating ethereal particles around the center
            ctx.save();
            ctx.globalAlpha = easeProgress * 0.8;
            for (let i = 0; i < 40; i++) {
              const angle = (i * Math.PI * 2) / 40 + time * 0.5;
              const radius = baseDim * 0.5 + Math.sin(time * 2 + i) * baseDim * 0.8;
              const dx = Math.cos(angle) * radius;
              const dy = Math.sin(angle) * radius;
              ctx.beginPath();
              ctx.arc(dx, dy, 2 + Math.sin(time * 5 + i) * 2, 0, Math.PI * 2);
              ctx.fillStyle = i % 2 === 0 ? '#ffffff' : accent1;
              ctx.fill();
            }
            ctx.restore();

            // Ascending Stardust (Rising light streaks)
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            for (let i = 0; i < 60; i++) {
              const startX = Math.sin(i * 123.45) * maxDim;
              const speed = 2 + (i % 5);
              const yPos = maxDim - ((time * speed * 50 + i * 100) % (maxDim * 2));
              const alpha = easeProgress * (0.1 + (i % 5) * 0.1);
              
              ctx.globalAlpha = alpha;
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(startX, yPos, 1 + (i % 3), 0, Math.PI * 2);
              ctx.fill();
              
              ctx.beginPath();
              ctx.moveTo(startX, yPos);
              ctx.lineTo(startX, yPos + 15 + speed * 3);
              ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
            ctx.restore();

            // Orbital Energy Trails (Comets orbiting the center)
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            for (let i = 0; i < 3; i++) {
              ctx.save();
              ctx.rotate(time * (2 + i) * (i % 2 === 0 ? 1 : -1));
              const trailRadius = baseDim * (0.9 + i * 0.25);
              
              const trailGrad = ctx.createConicGradient(0, 0, 0);
              trailGrad.addColorStop(0, 'transparent');
              trailGrad.addColorStop(0.7, 'transparent');
              trailGrad.addColorStop(1, accent1);
              
              ctx.beginPath();
              ctx.arc(0, 0, trailRadius, 0, Math.PI * 2);
              ctx.strokeStyle = trailGrad;
              ctx.lineWidth = 3 + i * 1.5;
              ctx.stroke();
              
              // Comet head
              ctx.beginPath();
              ctx.arc(trailRadius, 0, 4 + i, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = accent1;
              ctx.shadowBlur = 10;
              ctx.fill();
              ctx.restore();
            }
            ctx.restore();

            // Core Lens Flare (Intense cross at the center)
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const flareSize = baseDim * 1.8 * easeProgress * (1 + Math.sin(time * 8) * 0.05);
            
            const flareGradX = ctx.createLinearGradient(-flareSize, 0, flareSize, 0);
            flareGradX.addColorStop(0, 'transparent');
            flareGradX.addColorStop(0.4, accent1);
            flareGradX.addColorStop(0.5, '#ffffff');
            flareGradX.addColorStop(0.6, accent1);
            flareGradX.addColorStop(1, 'transparent');
            ctx.fillStyle = flareGradX;
            ctx.fillRect(-flareSize, -1.5, flareSize * 2, 3);
            
            const flareGradY = ctx.createLinearGradient(0, -flareSize, 0, flareSize);
            flareGradY.addColorStop(0, 'transparent');
            flareGradY.addColorStop(0.4, accent1);
            flareGradY.addColorStop(0.5, '#ffffff');
            flareGradY.addColorStop(0.6, accent1);
            flareGradY.addColorStop(1, 'transparent');
            ctx.fillStyle = flareGradY;
            ctx.fillRect(-1.5, -flareSize, 3, flareSize * 2);
            ctx.restore();
            
            // Variant-Specific Wings
            ctx.save();
            ctx.globalAlpha = easeProgress * 0.9;
            ctx.scale(easeProgress, easeProgress);
            
            const drawWing = (side: 1 | -1, v: number) => {
              ctx.save();
              ctx.scale(side, 1); // Flip for left/right
              
              if (v === 1) { // Violet: Seraphim Energy Wings (6 wings)
                for (let w = 0; w < 3; w++) {
                  ctx.save();
                  const angleOffset = (w - 1) * 0.4;
                  const flap = Math.sin(time * 3 + w) * 0.2;
                  ctx.rotate(angleOffset + flap);
                  
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.bezierCurveTo(baseDim * 0.5, -baseDim * 0.2, baseDim * 1.5, -baseDim * 0.8, baseDim * 2, -baseDim * 1.2);
                  ctx.bezierCurveTo(baseDim * 1.8, -baseDim * 0.5, baseDim * 1.2, 0, 0, baseDim * 0.2);
                  
                  const grad = ctx.createLinearGradient(0, 0, baseDim * 2, -baseDim);
                  grad.addColorStop(0, '#ffffff');
                  grad.addColorStop(0.3, accent1);
                  grad.addColorStop(1, 'transparent');
                  ctx.fillStyle = grad;
                  ctx.fill();
                  
                  // Feathers
                  for(let f=0; f<10; f++) {
                     ctx.beginPath();
                     ctx.moveTo(baseDim * (0.2 + f*0.15), -baseDim * (0.1 + f*0.1));
                     ctx.lineTo(baseDim * (0.4 + f*0.15), -baseDim * (0.3 + f*0.1) + Math.sin(time*5+f)*10);
                     ctx.strokeStyle = accent2;
                     ctx.lineWidth = 2;
                     ctx.stroke();
                  }
                  ctx.restore();
                }
              } else if (v === 2) { // Solar: Fiery Jagged Wings (2 massive)
                const flap = Math.sin(time * 4) * 0.3;
                ctx.rotate(flap);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                for(let f=0; f<8; f++) {
                  ctx.lineTo(baseDim * (0.5 + f*0.2), -baseDim * (0.2 + f*0.2) + (f%2===0 ? -baseDim*0.3 : 0));
                }
                ctx.lineTo(baseDim * 1.5, baseDim * 0.5);
                ctx.lineTo(0, baseDim * 0.2);
                const grad = ctx.createRadialGradient(0, 0, 0, baseDim*2, 0, baseDim*2);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.4, accent1);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.shadowColor = accent2;
                ctx.shadowBlur = 20;
                ctx.fill();
              } else if (v === 3) { // Emerald: Faerie/Butterfly Wings (4 wings)
                for (let w = 0; w < 2; w++) {
                  ctx.save();
                  const flap = Math.sin(time * 6) * (w === 0 ? 0.4 : 0.6);
                  ctx.rotate((w === 0 ? -0.2 : 0.5) + flap);
                  ctx.beginPath();
                  ctx.ellipse(baseDim * 0.8, -baseDim * 0.2, baseDim * 0.8, baseDim * 0.4, -Math.PI/6, 0, Math.PI*2);
                  const grad = ctx.createRadialGradient(baseDim*0.8, -baseDim*0.2, 0, baseDim*0.8, -baseDim*0.2, baseDim);
                  grad.addColorStop(0, 'rgba(255,255,255,0.8)');
                  grad.addColorStop(0.5, accent1);
                  grad.addColorStop(1, 'transparent');
                  ctx.fillStyle = grad;
                  ctx.fill();
                  ctx.strokeStyle = accent2;
                  ctx.lineWidth = 3;
                  ctx.stroke();
                  // Inner pattern
                  ctx.beginPath();
                  ctx.ellipse(baseDim * 0.8, -baseDim * 0.2, baseDim * 0.4, baseDim * 0.2, -Math.PI/6, 0, Math.PI*2);
                  ctx.stroke();
                  ctx.restore();
                }
              } else if (v === 4) { // Glacier: Crystalline Geometric Wings (6 wings)
                for (let w = 0; w < 3; w++) {
                  ctx.save();
                  const angle = -0.5 + w * 0.4;
                  ctx.rotate(angle);
                  const scale = 1 - w * 0.2;
                  ctx.scale(scale, scale);
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(baseDim * 0.5, -baseDim * 0.2);
                  ctx.lineTo(baseDim * 1.5, -baseDim * 0.8);
                  ctx.lineTo(baseDim * 1.2, -baseDim * 0.1);
                  ctx.lineTo(baseDim * 0.4, baseDim * 0.2);
                  ctx.closePath();
                  ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
                  ctx.fill();
                  ctx.strokeStyle = accent1;
                  ctx.lineWidth = 2;
                  ctx.stroke();
                  
                  // Crystal facets
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(baseDim * 1.5, -baseDim * 0.8);
                  ctx.stroke();
                  ctx.restore();
                }
              } else if (v === 5) { // Magma: Dragon/Demon Wings (2 wings)
                const flap = Math.sin(time * 2) * 0.2;
                ctx.rotate(flap);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(baseDim * 0.5, -baseDim * 0.8);
                ctx.lineTo(baseDim * 1.2, -baseDim * 1.2);
                ctx.quadraticCurveTo(baseDim * 1.0, -baseDim * 0.5, baseDim * 1.8, -baseDim * 0.2);
                ctx.quadraticCurveTo(baseDim * 1.2, 0, baseDim * 1.5, baseDim * 0.5);
                ctx.quadraticCurveTo(baseDim * 0.8, baseDim * 0.2, 0, baseDim * 0.4);
                ctx.fillStyle = `rgba(50, 0, 0, 0.8)`;
                ctx.fill();
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 4;
                ctx.stroke();
                // Wing bones
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(baseDim * 0.5, -baseDim * 0.8);
                ctx.lineTo(baseDim * 1.8, -baseDim * 0.2);
                ctx.moveTo(baseDim * 0.5, -baseDim * 0.8);
                ctx.lineTo(baseDim * 1.5, baseDim * 0.5);
                ctx.stroke();
              } else if (v === 6) { // Celestial: Nebula/Starry Wings (4 wings)
                for (let w = 0; w < 2; w++) {
                  ctx.save();
                  const flap = Math.sin(time * 1.5 + w) * 0.3;
                  ctx.rotate((w === 0 ? -0.3 : 0.3) + flap);
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.quadraticCurveTo(baseDim, -baseDim, baseDim * 2, -baseDim * 0.5);
                  ctx.quadraticCurveTo(baseDim * 1.5, baseDim * 0.5, 0, baseDim * 0.5);
                  const grad = ctx.createLinearGradient(0, 0, baseDim * 2, 0);
                  grad.addColorStop(0, accent1);
                  grad.addColorStop(0.5, accent2);
                  grad.addColorStop(1, 'transparent');
                  ctx.fillStyle = grad;
                  ctx.globalCompositeOperation = 'screen';
                  ctx.fill();
                  // Stars in wings
                  ctx.fillStyle = '#ffffff';
                  for(let s=0; s<15; s++) {
                    ctx.beginPath();
                    ctx.arc(baseDim * (0.5 + Math.random()), -baseDim * 0.5 + Math.random() * baseDim, Math.random() * 3, 0, Math.PI*2);
                    ctx.fill();
                  }
                  ctx.restore();
                }
              } else if (v === 7 || v === 11) { // Cyberpunk: Holographic Mecha Wings (8 wings)
                for (let w = 0; w < 4; w++) {
                  ctx.save();
                  const angle = -0.6 + w * 0.3;
                  const flap = Math.sin(time * 8 + w) * 0.1;
                  ctx.rotate(angle + flap);
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(baseDim * 0.8, -baseDim * 0.1);
                  ctx.lineTo(baseDim * 1.6, -baseDim * 0.2);
                  ctx.lineTo(baseDim * 1.4, 0);
                  ctx.lineTo(baseDim * 0.6, baseDim * 0.1);
                  ctx.closePath();
                  ctx.fillStyle = `rgba(0, 255, 255, 0.2)`;
                  ctx.fill();
                  ctx.strokeStyle = w % 2 === 0 ? accent1 : accent2;
                  ctx.lineWidth = 2;
                  ctx.setLineDash([10, 5]);
                  ctx.stroke();
                  ctx.setLineDash([]);
                  ctx.restore();
                }
              } else if (v === 8) { // Abyssal: Bioluminescent Ribbon Fin Wings (6 wings)
                for (let w = 0; w < 3; w++) {
                  ctx.save();
                  const angle = -0.4 + w * 0.4;
                  ctx.rotate(angle);
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  for (let i = 0; i <= 20; i++) {
                    const t = i / 20;
                    const x = t * baseDim * 2;
                    const y = Math.sin(t * Math.PI * 3 - time * 5 + w) * baseDim * 0.3 - t * baseDim * 0.5;
                    ctx.lineTo(x, y);
                  }
                  for (let i = 20; i >= 0; i--) {
                    const t = i / 20;
                    const x = t * baseDim * 2;
                    const y = Math.sin(t * Math.PI * 3 - time * 5 + w) * baseDim * 0.3 - t * baseDim * 0.5 + baseDim * 0.2 * (1-t);
                    ctx.lineTo(x, y);
                  }
                  const grad = ctx.createLinearGradient(0, 0, baseDim * 2, 0);
                  grad.addColorStop(0, accent1);
                  grad.addColorStop(1, 'transparent');
                  ctx.fillStyle = grad;
                  ctx.fill();
                  ctx.restore();
                }
              } else if (v === 9) { // Easter: Angelic Feathered Wings (2 huge wings)
                const flap = Math.sin(time * 3) * 0.25;
                ctx.rotate(-0.2 + flap);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(baseDim * 0.5, -baseDim * 1.5, baseDim * 2, -baseDim * 1.2);
                ctx.quadraticCurveTo(baseDim * 1.5, -baseDim * 0.2, baseDim * 0.5, baseDim * 0.5);
                const grad = ctx.createLinearGradient(0, 0, baseDim * 2, 0);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.6, accent1);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fill();
                
                // Draw individual feathers
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                for (let f = 0; f < 15; f++) {
                  ctx.beginPath();
                  const fx = baseDim * (0.3 + f * 0.1);
                  const fy = -baseDim * (0.2 + f * 0.05);
                  ctx.moveTo(fx, fy);
                  ctx.quadraticCurveTo(fx + baseDim * 0.2, fy + baseDim * 0.2, fx - baseDim * 0.1, fy + baseDim * 0.5);
                  ctx.stroke();
                }
              } else if (v === 10) { // Matrix: Digital Code Stream Wings (2 wings)
                const flap = Math.sin(time * 5) * 0.1;
                ctx.rotate(-0.3 + flap);
                ctx.font = `${baseDim * 0.08}px monospace`;
                ctx.fillStyle = accent1;
                for (let col = 0; col < 15; col++) {
                  const x = col * baseDim * 0.12;
                  const height = baseDim * (1.5 - Math.abs(col - 5) * 0.1);
                  for (let row = 0; row < height / (baseDim * 0.08); row++) {
                    if (Math.random() > 0.3) {
                      const y = -height * 0.8 + row * baseDim * 0.08 + Math.sin(time * 10 + col) * 20;
                      ctx.globalAlpha = Math.random() * 0.8 + 0.2;
                      ctx.fillText(Math.random() > 0.5 ? '1' : '0', x, y);
                    }
                  }
                }
                ctx.globalAlpha = 1;
              }
              
              ctx.restore();
            };
            
            // Draw Left Wing
            drawWing(-1, variant);
            // Draw Right Wing
            drawWing(1, variant);
            
            ctx.restore();
            
            if (variant === 1) { // Violet: Cosmic Lotus
              ctx.globalAlpha = easeProgress;
              // Outer ethereal petals
              for (let i = 0; i < 24; i++) {
                ctx.save();
                ctx.rotate(time * 0.3 + (i * Math.PI * 2) / 24);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(baseDim * 0.4, baseDim * 0.05, baseDim * 0.6, baseDim * 0.6, 0, baseDim * 0.75);
                ctx.bezierCurveTo(-baseDim * 0.6, baseDim * 0.6, -baseDim * 0.4, baseDim * 0.05, 0, 0);
                const grad = ctx.createLinearGradient(0, 0, 0, baseDim * 0.75);
                grad.addColorStop(0, 'rgba(255,255,255,0.8)');
                grad.addColorStop(0.5, accent2);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
              }
              // Inner glowing petals
              for (let i = 0; i < 12; i++) {
                ctx.save();
                ctx.rotate(-time * 0.5 + (i * Math.PI * 2) / 12);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(baseDim * 0.25, baseDim * 0.1, baseDim * 0.4, baseDim * 0.4, 0, baseDim * 0.5);
                ctx.bezierCurveTo(-baseDim * 0.4, baseDim * 0.4, -baseDim * 0.25, baseDim * 0.1, 0, 0);
                const grad = ctx.createLinearGradient(0, 0, 0, baseDim * 0.5);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.5, accent1);
                grad.addColorStop(1, accent3);
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
              }
              // Core energy singularity
              ctx.fillStyle = '#ffffff';
              ctx.shadowBlur = 50;
              ctx.shadowColor = accent1;
              ctx.beginPath();
              ctx.arc(0, 0, baseDim * 0.25 * (1 + Math.sin(time * 8) * 0.1), 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            } else if (variant === 2) { // Solar: Golden Rings of Creation
              ctx.globalAlpha = easeProgress;
              // Massive Corona
              for (let i = 0; i < 36; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI * 2) / 36 + time);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(baseDim * 0.2, baseDim * 0.8, 0, baseDim * 1.5 + Math.sin(time * 5 + i) * baseDim * 0.5);
                ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(time * 10 + i) * 0.5})`;
                ctx.lineWidth = 10;
                ctx.stroke();
                ctx.restore();
              }
              // Interlocking Golden Rings
              for (let i = 0; i < 12; i++) {
                ctx.save();
                ctx.rotate(time * (i % 2 === 0 ? 1.5 : -1.5) + i * Math.PI / 6);
                ctx.scale(1, 0.2 + Math.sin(time * 3 + i) * 0.15);
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 0.9, 0, Math.PI * 2);
                ctx.strokeStyle = i % 3 === 0 ? '#ffffff' : (i % 3 === 1 ? accent1 : accent2);
                ctx.lineWidth = 20;
                ctx.stroke();
                // Ring glow
                ctx.shadowBlur = 30;
                ctx.shadowColor = accent1;
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.restore();
              }
              // Blinding core
              const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 0.6);
              coreGrad.addColorStop(0, '#ffffff');
              coreGrad.addColorStop(0.3, '#fff700');
              coreGrad.addColorStop(0.6, accent1);
              coreGrad.addColorStop(1, 'transparent');
              ctx.fillStyle = coreGrad;
              ctx.beginPath();
              ctx.arc(0, 0, baseDim * 0.6, 0, Math.PI * 2);
              ctx.fill();
            } else if (variant === 3) { // Emerald: World Tree Mandala
              ctx.globalAlpha = easeProgress;
              // Expanding roots/branches
              ctx.strokeStyle = accent1;
              ctx.lineWidth = 6;
              ctx.lineCap = 'round';
              for (let i = 0; i < 24; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI * 2) / 24 + time * 0.1);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                for (let j = 0; j < 8; j++) {
                  const r = (j / 8) * baseDim * 1.5;
                  const a = Math.sin(time * 2 + j + i) * 0.8;
                  ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.stroke();
                // Glowing Leaves
                ctx.fillStyle = accent2;
                ctx.shadowBlur = 15;
                ctx.shadowColor = accent2;
                ctx.beginPath();
                ctx.arc(Math.cos(Math.sin(time * 2 + 7 + i) * 0.8) * baseDim * 1.5, Math.sin(Math.sin(time * 2 + 7 + i) * 0.8) * baseDim * 1.5, 20 + Math.sin(time * 5 + i) * 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
              }
              // Central geometric bloom
              ctx.fillStyle = '#ffffff';
              for(let i=0; i<12; i++) {
                ctx.save();
                ctx.rotate(i * Math.PI/6 + time * 1.5);
                ctx.beginPath();
                ctx.ellipse(baseDim*0.15, 0, baseDim*0.25, baseDim*0.08, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.strokeStyle = accent3;
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.restore();
              }
              // Core seed
              ctx.fillStyle = accent1;
              ctx.beginPath();
              ctx.arc(0, 0, baseDim * 0.1, 0, Math.PI * 2);
              ctx.fill();
            } else if (variant === 4) { // Glacier: Infinite Prism Palace
              ctx.globalAlpha = easeProgress;
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 4;
              // Rotating complex fractals (9-pointed star / nonagram)
              for (let i = 0; i < 9; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI * 2) / 9 + time * 0.8);
                for (let j = 1; j <= 5; j++) {
                  const size = (j / 5) * baseDim * 1.2;
                  
                  // Outer 9-pointed star
                  ctx.beginPath();
                  for (let k = 0; k < 18; k++) {
                    const angle = (k * Math.PI * 2) / 18 - Math.PI / 2;
                    const r = k % 2 === 0 ? size : size * 0.45;
                    if (k === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                  }
                  ctx.closePath();
                  ctx.fillStyle = `rgba(255, 255, 255, ${0.15 * j})`;
                  ctx.fill();
                  ctx.stroke();
                  
                  // Inner 9-pointed star (offset)
                  ctx.beginPath();
                  for (let k = 0; k < 18; k++) {
                    const angle = (k * Math.PI * 2) / 18 - Math.PI / 2 + (Math.PI * 2 / 18);
                    const r = k % 2 === 0 ? size * 0.7 : size * 0.3;
                    if (k === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                  }
                  ctx.closePath();
                  ctx.stroke();
                }
                ctx.restore();
              }
              // Intense Light beams
              for (let i = 0; i < 24; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI * 2) / 24 - time * 1.5);
                const grad = ctx.createLinearGradient(0, 0, 0, baseDim * 1.5);
                grad.addColorStop(0, 'rgba(255,255,255,0.9)');
                grad.addColorStop(0.5, accent1);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(-15, 0);
                ctx.lineTo(15, 0);
                ctx.lineTo(45, baseDim * 1.5);
                ctx.lineTo(-45, baseDim * 1.5);
                ctx.fill();
                ctx.restore();
              }
            } else if (variant === 5) { // Magma: Sphere of Creation
              ctx.globalAlpha = easeProgress;
              // Massive erupting prominences
              for (let i = 0; i < 30; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI * 2) / 30 + time * 1.2);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(baseDim * 0.8, baseDim * 0.8 * Math.sin(time * 8 + i), 0, baseDim * 1.4);
                ctx.strokeStyle = i % 3 === 0 ? '#ffffff' : (i % 3 === 1 ? '#ffd700' : accent1);
                ctx.lineWidth = 20 + Math.sin(time * 5 + i) * 10;
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.restore();
              }
              // Perfect sphere with swirling texture
              const sphereGrad = ctx.createRadialGradient(0, 0, baseDim * 0.3, 0, 0, baseDim * 0.8);
              sphereGrad.addColorStop(0, '#ffffff');
              sphereGrad.addColorStop(0.4, '#ffd700');
              sphereGrad.addColorStop(0.8, accent1);
              sphereGrad.addColorStop(1, 'transparent');
              ctx.fillStyle = sphereGrad;
              ctx.beginPath();
              ctx.arc(0, 0, baseDim * 0.8, 0, Math.PI * 2);
              ctx.fill();
              // Swirling core lines
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 5;
              for (let i = 0; i < 10; i++) {
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 0.7 * (i/10), time * 2 + i, time * 2 + i + Math.PI);
                ctx.stroke();
              }
            } else if (variant === 6) { // Celestial: Constellation Entity
              ctx.globalAlpha = easeProgress;
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 5;
              // Multiple interlocking constellations
              for (let c = 0; c < 3; c++) {
                ctx.save();
                ctx.rotate(time * (c + 1) * 0.5);
                const points = [];
                for (let i = 0; i < 40; i++) {
                  const a = (i * Math.PI * 2) / 40 + Math.sin(time * 3 + i + c) * 0.8;
                  const r = baseDim * 1.2 * (0.4 + Math.sin(time * 4 + i * 3 + c) * 0.4);
                  points.push({x: Math.cos(a) * r, y: Math.sin(a) * r});
                }
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                  ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.closePath();
                ctx.strokeStyle = c === 0 ? '#ffffff' : (c === 1 ? accent1 : accent2);
                ctx.stroke();
                // Stars at points
                ctx.fillStyle = '#ffffff';
                for (const p of points) {
                  ctx.beginPath();
                  ctx.arc(p.x, p.y, 10 + Math.sin(time * 15 + p.x) * 6, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.shadowBlur = 30;
                  ctx.shadowColor = accent1;
                  ctx.fill();
                  ctx.shadowBlur = 0;
                }
                ctx.restore();
              }
              // Inner massive nebula
              const nebGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 1.2);
              nebGrad.addColorStop(0, '#ffffff');
              nebGrad.addColorStop(0.3, accent1);
              nebGrad.addColorStop(0.7, accent2);
              nebGrad.addColorStop(1, 'transparent');
              ctx.fillStyle = nebGrad;
              ctx.beginPath();
              ctx.arc(0, 0, baseDim * 1.2, 0, Math.PI * 2);
              ctx.fill();
            } else if (variant === 7 || variant === 11) { // Cyberpunk: Digital Utopia Sphere
              ctx.globalAlpha = easeProgress;
              ctx.strokeStyle = accent1;
              ctx.lineWidth = 4;
              // Complex Wireframe sphere
              for (let i = 0; i < 16; i++) {
                ctx.beginPath();
                ctx.ellipse(0, 0, baseDim * 1.2, baseDim * 1.2 * (i / 16), time * 0.5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(0, 0, baseDim * 1.2 * (i / 16), baseDim * 1.2, time * 0.5, 0, Math.PI * 2);
                ctx.stroke();
              }
              // Massive Data streams
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 20px monospace';
              for (let i = 0; i < 100; i++) {
                const x = (Math.random() - 0.5) * baseDim * 2.5;
                const y = (Math.random() - 0.5) * baseDim * 2.5;
                if (x*x + y*y < baseDim*baseDim*1.44) {
                  ctx.globalAlpha = Math.random() * easeProgress;
                  ctx.fillText(Math.random() > 0.5 ? '1' : '0', x, y - (time * 200) % 100);
                }
              }
              ctx.globalAlpha = easeProgress;
              // Core processor cube
              ctx.save();
              ctx.rotate(time * 2);
              ctx.fillStyle = accent2;
              ctx.fillRect(-baseDim*0.3, -baseDim*0.3, baseDim*0.6, baseDim*0.6);
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 8;
              ctx.strokeRect(-baseDim*0.3, -baseDim*0.3, baseDim*0.6, baseDim*0.6);
              // Inner core
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(-baseDim*0.1, -baseDim*0.1, baseDim*0.2, baseDim*0.2);
              ctx.restore();
            } else if (variant === 8) { // Abyssal: Ascending Light Jellyfish
              ctx.globalAlpha = easeProgress;
              // Majestic Bell with pulsing veins
              const bellGrad = ctx.createLinearGradient(0, -baseDim * 1.2, 0, 0);
              bellGrad.addColorStop(0, '#ffffff');
              bellGrad.addColorStop(0.4, accent1);
              bellGrad.addColorStop(0.8, accent2);
              bellGrad.addColorStop(1, 'transparent');
              ctx.fillStyle = bellGrad;
              ctx.beginPath();
              ctx.moveTo(0, -baseDim * 1.2);
              ctx.bezierCurveTo(baseDim * 1.2, -baseDim * 1.2, baseDim * 1.2, 0, 0, baseDim * 0.3);
              ctx.bezierCurveTo(-baseDim * 1.2, 0, -baseDim * 1.2, -baseDim * 1.2, 0, -baseDim * 1.2);
              ctx.fill();
              // Glowing Veins
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 3;
              for(let i=0; i<8; i++) {
                ctx.beginPath();
                ctx.moveTo(0, -baseDim * 1.1);
                ctx.quadraticCurveTo((i-3.5)*baseDim*0.3, -baseDim*0.5, (i-3.5)*baseDim*0.2, baseDim*0.2);
                ctx.stroke();
              }
              // Flowing Tentacles of Light
              ctx.strokeStyle = accent2;
              ctx.lineWidth = 12;
              ctx.lineCap = 'round';
              for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                const startX = (i - 9.5) * (baseDim * 0.12);
                ctx.moveTo(startX, 0);
                for (let j = 0; j < 15; j++) {
                  const tx = startX + Math.sin(time * 4 + j * 0.4 + i) * baseDim * 0.3;
                  const ty = j * baseDim * 0.15;
                  ctx.lineTo(tx, ty);
                }
                ctx.stroke();
              }
              // Bioluminescent sparkles
              ctx.fillStyle = '#ffffff';
              for(let i=0; i<60; i++) {
                const px = (Math.random()-0.5)*baseDim*2;
                const py = (Math.random()-0.5)*baseDim*2;
                ctx.beginPath();
                ctx.arc(px, py, Math.random()*6, 0, Math.PI*2);
                ctx.fill();
              }
            } else if (variant === 9) { // Easter: Infinite Ribbon Knot
              ctx.globalAlpha = easeProgress;
              const colors = ['#ffb7ce', '#ffffd1', '#b2e2f2', '#e0c3fc', '#fdfd96', '#ffdab9'];
              ctx.lineWidth = 40;
              ctx.lineCap = 'round';
              // Multiple interwoven knots
              for (let k = 0; k < 3; k++) {
                ctx.save();
                ctx.scale(1 - k*0.2, 1 - k*0.2);
                ctx.rotate(time * (k % 2 === 0 ? 1 : -1));
                for (let i = 0; i < 6; i++) {
                  ctx.strokeStyle = colors[(i + k) % 6];
                  ctx.beginPath();
                  for (let j = 0; j <= Math.PI * 2; j += 0.05) {
                    const a = j + time * 3;
                    const r = baseDim * 0.8 * (1 + 0.4 * Math.sin(4 * j + i));
                    const x = Math.cos(a) * r;
                    const y = Math.sin(a) * r;
                    if (j === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                  }
                  ctx.closePath();
                  ctx.stroke();
                  // Ribbon highlight
                  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                  ctx.lineWidth = 10;
                  ctx.stroke();
                  ctx.lineWidth = 40;
                }
                ctx.restore();
              }
              // Central blinding light
              ctx.fillStyle = '#ffffff';
              ctx.shadowBlur = 100;
              ctx.shadowColor = '#ffffff';
              ctx.beginPath();
              ctx.arc(0, 0, baseDim * 0.4, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            } else if (variant === 10) { // Matrix: Harmony Construct
              ctx.globalAlpha = easeProgress;
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 30px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              // Perfect geometric rings of code, much denser
              for (let r = 1; r <= 8; r++) {
                const radius = (r / 8) * baseDim * 1.2;
                const chars = r * 16;
                for (let i = 0; i < chars; i++) {
                  const a = (i * Math.PI * 2) / chars + time * (r % 2 === 0 ? 1.5 : -1.5);
                  const x = Math.cos(a) * radius;
                  const y = Math.sin(a) * radius;
                  ctx.fillStyle = Math.random() > 0.9 ? '#ffffff' : accent1;
                  ctx.fillText(Math.random() > 0.5 ? '1' : '0', x, y);
                }
              }
              // Connecting data lines
              ctx.strokeStyle = accent2;
              ctx.lineWidth = 2;
              for(let i=0; i<24; i++) {
                const a = i * Math.PI / 12 + time;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(a)*baseDim*1.2, Math.sin(a)*baseDim*1.2);
                ctx.stroke();
              }
              // Central glowing core
              const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 0.3);
              coreGrad.addColorStop(0, '#ffffff');
              coreGrad.addColorStop(0.5, accent1);
              coreGrad.addColorStop(1, 'transparent');
              ctx.fillStyle = coreGrad;
              ctx.beginPath();
              ctx.arc(0, 0, baseDim * 0.3, 0, Math.PI * 2);
              ctx.fill();
            }
            
            // Final Shockwave instead of flash
            if (progress > 0.8) {
              const shockProgress = (progress - 0.8) * 5; // 0 to 1
              const shockRadius = shockProgress * maxDim * 1.5;
              const shockAlpha = 1 - shockProgress;
              
              ctx.save();
              ctx.globalCompositeOperation = 'screen';
              ctx.globalAlpha = shockAlpha;
              
              if (variant === 1) { // Violet: Ethereal Ripple
                ctx.beginPath();
                ctx.arc(0, 0, shockRadius, 0, Math.PI * 2);
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 40 * shockAlpha;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, shockRadius * 0.8, 0, Math.PI * 2);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 15 * shockAlpha;
                ctx.stroke();
              } else if (variant === 2) { // Solar: Fire Ring
                ctx.beginPath();
                for(let i=0; i<60; i++) {
                  const a = (i/60)*Math.PI*2;
                  const r = shockRadius + (Math.random() * 80 * shockAlpha);
                  if(i===0) ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);
                  else ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
                }
                ctx.closePath();
                ctx.strokeStyle = accent2;
                ctx.lineWidth = 50 * shockAlpha;
                ctx.stroke();
              } else if (variant === 3) { // Emerald: Toxic Wave
                ctx.beginPath();
                ctx.arc(0, 0, shockRadius, 0, Math.PI * 2);
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 60 * shockAlpha;
                ctx.setLineDash([30, 40]);
                ctx.stroke();
                ctx.setLineDash([]);
              } else if (variant === 4) { // Glacier: Ice Shatter
                ctx.beginPath();
                for(let i=0; i<16; i++) {
                  const a = (i/16)*Math.PI*2;
                  ctx.moveTo(Math.cos(a)*shockRadius*0.5, Math.sin(a)*shockRadius*0.5);
                  ctx.lineTo(Math.cos(a)*shockRadius*1.2, Math.sin(a)*shockRadius*1.2);
                }
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 15 * shockAlpha;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, shockRadius, 0, Math.PI * 2);
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 8 * shockAlpha;
                ctx.stroke();
              } else if (variant === 5) { // Magma: Lava Eruption
                ctx.beginPath();
                ctx.arc(0, 0, shockRadius, 0, Math.PI * 2);
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 100 * shockAlpha;
                ctx.stroke();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 30 * shockAlpha;
                ctx.stroke();
              } else if (variant === 6) { // Celestial: Nebula Burst
                const grad = ctx.createRadialGradient(0, 0, shockRadius*0.8, 0, 0, shockRadius*1.2);
                grad.addColorStop(0, 'transparent');
                grad.addColorStop(0.5, accent1);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, shockRadius*1.2, 0, Math.PI * 2);
                ctx.fill();
              } else if (variant === 7 || variant === 11) { // Cyberpunk: Glitch Wave
                ctx.strokeStyle = variant === 7 ? accent1 : accent2;
                ctx.lineWidth = 30 * shockAlpha;
                ctx.strokeRect(-shockRadius, -shockRadius, shockRadius*2, shockRadius*2);
                ctx.strokeStyle = variant === 7 ? accent2 : accent1;
                ctx.lineWidth = 15 * shockAlpha;
                ctx.strokeRect(-shockRadius*1.1, -shockRadius*0.9, shockRadius*2.2, shockRadius*1.8);
              } else if (variant === 8) { // Abyssal: Sonar
                for(let i=0; i<4; i++) {
                  ctx.beginPath();
                  ctx.arc(0, 0, Math.max(0, shockRadius - i*60), 0, Math.PI * 2);
                  ctx.strokeStyle = accent1;
                  ctx.lineWidth = 8 * shockAlpha;
                  ctx.stroke();
                }
              } else if (variant === 9) { // Easter: Ribbon Wave
                ctx.beginPath();
                for(let i=0; i<120; i++) {
                  const a = (i/120)*Math.PI*2;
                  const r = shockRadius + Math.sin(i*15)*40;
                  if(i===0) ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);
                  else ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
                }
                ctx.closePath();
                ctx.strokeStyle = accent2;
                ctx.lineWidth = 20 * shockAlpha;
                ctx.stroke();
              } else if (variant === 10) { // Matrix: Code Wave
                ctx.font = `${30 + shockRadius*0.15}px monospace`;
                ctx.fillStyle = accent1;
                for(let i=0; i<40; i++) {
                  const a = (i/40)*Math.PI*2;
                  ctx.fillText(Math.random()>0.5?'1':'0', Math.cos(a)*shockRadius, Math.sin(a)*shockRadius);
                }
              }
              ctx.restore();
              
              // Push particles with the shockwave
              const particles = particlesRef.current;
              for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const dx = p.x - special.x;
                const dy = p.y - special.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // If particle is near the shockwave front
                if (Math.abs(dist - shockRadius) < 150) {
                  const pushForce = (1 - Math.abs(dist - shockRadius) / 150) * 25 * shockAlpha;
                  p.vx += (dx / dist) * pushForce;
                  p.vy += (dy / dist) * pushForce;
                  // Extra size burst on hit
                  p.size = Math.max(p.size, p.size + 3 * shockAlpha);
                }
              }
            }
            
            ctx.restore();
          }
        } else if (special.type === 'guardian') {
          if (elapsed > special.duration) {
            special.active = false;
          } else {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = Math.sin(progress * Math.PI);
            const cw = canvas.width;
            const ch = canvas.height;
            const maxDim = Math.max(cw, ch);
            const baseDim = Math.min(cw, ch) * 0.55;
            
            ctx.save();
            
            // Screen shake effect
            let shakeX = 0;
            let shakeY = 0;
            if (progress < 0.1) {
              const shakeIntensity = (0.1 - progress) * 200;
              shakeX = (Math.random() - 0.5) * shakeIntensity;
              shakeY = (Math.random() - 0.5) * shakeIntensity;
            } else if (progress > 0.9) {
              const shakeIntensity = (progress - 0.9) * 200;
              shakeX = (Math.random() - 0.5) * shakeIntensity;
              shakeY = (Math.random() - 0.5) * shakeIntensity;
            }
            
            ctx.translate(special.x + shakeX, special.y + shakeY);
            
            // Flash effect
            if (progress < 0.05) {
              ctx.fillStyle = `rgba(255, 255, 255, ${(0.05 - progress) * 20})`;
              ctx.fillRect(-maxDim * 2, -maxDim * 2, maxDim * 4, maxDim * 4);
            } else if (progress > 0.95) {
              ctx.fillStyle = `rgba(255, 255, 255, ${(progress - 0.95) * 20})`;
              ctx.fillRect(-maxDim * 2, -maxDim * 2, maxDim * 4, maxDim * 4);
            }
            
            // Variant-Specific Guardian Background Effects
            const drawGuardianBackground = (v: number) => {
              ctx.save();
              const pulse = Math.sin(time * 5) * 0.1 + 1;
              if (v === 1) { // Violet: Black Hole
                const rot = time * 2;
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 1.5);
                grad.addColorStop(0, '#000000');
                grad.addColorStop(0.2, '#000000');
                grad.addColorStop(0.5, accent1);
                grad.addColorStop(0.8, accent2);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 1.5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.rotate(rot);
                for (let i=0; i<3; i++) {
                  ctx.strokeStyle = i === 0 ? accent2 : accent3;
                  ctx.lineWidth = 15 - i * 5;
                  ctx.beginPath();
                  ctx.ellipse(0, 0, baseDim * (1.1 + i*0.1), baseDim * (0.2 + i*0.05), 0.5 + i*0.2, 0, Math.PI * 2);
                  ctx.stroke();
                }
                
                // Event Horizon Jets
                ctx.fillStyle = 'rgba(200, 0, 255, 0.4)';
                ctx.beginPath();
                ctx.moveTo(-20, 0);
                ctx.lineTo(0, -baseDim * 2);
                ctx.lineTo(20, 0);
                ctx.lineTo(0, baseDim * 2);
                ctx.fill();
                
                // Orbiting Debris
                ctx.fillStyle = '#ffffff';
                for(let i=0; i<20; i++) {
                    const angle = time * (3 + i*0.1) + i;
                    const r = baseDim * (0.3 + i*0.05);
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, Math.random()*3+1, 0, Math.PI*2); ctx.fill();
                }
                
              } else if (v === 2) { // Solar: Phoenix Aura
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 2.5 * pulse);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.1, '#fff7e6');
                grad.addColorStop(0.3, '#ffcc00');
                grad.addColorStop(0.6, '#ff4400');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 2.5 * pulse, 0, Math.PI * 2);
                ctx.fill();
                
                // Sun rays
                ctx.fillStyle = 'rgba(255, 200, 0, 0.1)';
                for (let i=0; i<12; i++) {
                  ctx.beginPath();
                  ctx.moveTo(0,0);
                  ctx.arc(0, 0, baseDim * 3, time + i * Math.PI/6, time + i * Math.PI/6 + 0.1);
                  ctx.fill();
                }
                
                // Prominences
                ctx.strokeStyle = 'rgba(255, 100, 0, 0.6)';
                ctx.lineWidth = 8;
                for(let i=0; i<5; i++) {
                    const angle = i * Math.PI*2/5 + time*0.5;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(angle)*baseDim*0.8, Math.sin(angle)*baseDim*0.8);
                    ctx.quadraticCurveTo(Math.cos(angle+0.5)*baseDim*1.5, Math.sin(angle+0.5)*baseDim*1.5, Math.cos(angle+1)*baseDim*0.8, Math.sin(angle+1)*baseDim*0.8);
                    ctx.stroke();
                }
                
                // Solar Flares
                if (Math.random() > 0.7) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    const angle = Math.random() * Math.PI * 2;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*baseDim, Math.sin(angle)*baseDim, Math.random()*50+20, 0, Math.PI*2); ctx.fill();
                }
                
              } else if (v === 3) { // Emerald: Sacred Grove
                ctx.rotate(time * 0.2);
                for(let i=0; i<16; i++) {
                   ctx.rotate(Math.PI/8);
                   const grad = ctx.createLinearGradient(0, 0, baseDim * 2, 0);
                   grad.addColorStop(0, accent1);
                   grad.addColorStop(0.5, accent2);
                   grad.addColorStop(1, 'transparent');
                   ctx.fillStyle = grad;
                   ctx.beginPath();
                   ctx.moveTo(0, 0);
                   ctx.quadraticCurveTo(baseDim * 0.8, baseDim * 0.5, baseDim * 2, 0);
                   ctx.quadraticCurveTo(baseDim * 0.8, -baseDim * 0.5, 0, 0);
                   ctx.fill();
                }
                
                // Floating Spores
                ctx.fillStyle = '#aaffaa';
                for(let i=0; i<40; i++) {
                    const angle = Math.random() * Math.PI * 2 + time*0.2;
                    const r = Math.random() * baseDim * 1.5;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, Math.random()*3+1, 0, Math.PI*2); ctx.fill();
                }
                
                // Ancient Roots
                ctx.strokeStyle = '#225522';
                ctx.lineWidth = 15;
                ctx.lineCap = 'round';
                for(let i=0; i<8; i++) {
                    const angle = i * Math.PI/4 - time*0.1;
                    ctx.beginPath();
                    ctx.moveTo(0,0);
                    ctx.bezierCurveTo(Math.cos(angle-0.5)*baseDim*0.5, Math.sin(angle-0.5)*baseDim*0.5, Math.cos(angle+0.5)*baseDim, Math.sin(angle+0.5)*baseDim, Math.cos(angle)*baseDim*1.5, Math.sin(angle)*baseDim*1.5);
                    ctx.stroke();
                }
                
              } else if (v === 4) { // Glacier: Ice Fortress
                ctx.rotate(time * 0.1);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                for(let i=0; i<12; i++) {
                   ctx.rotate(Math.PI/6);
                   ctx.lineWidth = i % 2 === 0 ? 4 : 1;
                   ctx.strokeRect(-baseDim * (0.8 + i*0.1), -baseDim * (0.8 + i*0.1), baseDim * (1.6 + i*0.2), baseDim * (1.6 + i*0.2));
                }
                
                // Snowfall
                ctx.fillStyle = '#ffffff';
                for(let i=0; i<60; i++) {
                    const x = (Math.random() - 0.5) * baseDim * 4;
                    const y = ((time * 200 + i*30) % (baseDim*4)) - baseDim*2;
                    ctx.beginPath(); ctx.arc(x, y, Math.random()*2+1, 0, Math.PI*2); ctx.fill();
                }
                
                // Ice Shards
                ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
                for(let i=0; i<8; i++) {
                    const angle = i * Math.PI/4 + time*0.5;
                    ctx.save();
                    ctx.translate(Math.cos(angle)*baseDim, Math.sin(angle)*baseDim);
                    ctx.rotate(angle + Math.PI/2);
                    ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(20, 20); ctx.lineTo(-20, 20); ctx.fill();
                    ctx.restore();
                }
                
              } else if (v === 5) { // Magma: Inferno
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 2.5);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.2, '#ffaa00');
                grad.addColorStop(0.5, '#ff4400');
                grad.addColorStop(0.8, '#8b0000');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 2.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Ash Fall
                ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
                for(let i=0; i<50; i++) {
                    const x = (Math.random() - 0.5) * baseDim * 4;
                    const y = ((time * 100 + i*50) % (baseDim*4)) - baseDim*2;
                    ctx.fillRect(x, y, Math.random()*4+2, Math.random()*4+2);
                }
                
                // Lava Plumes
                ctx.fillStyle = 'rgba(255, 50, 0, 0.6)';
                for(let i=0; i<6; i++) {
                    const angle = i * Math.PI/3 + time*0.3;
                    const height = baseDim * (0.5 + Math.abs(Math.sin(time*2+i))*0.5);
                    ctx.save();
                    ctx.translate(Math.cos(angle)*baseDim*0.5, Math.sin(angle)*baseDim*0.5);
                    ctx.rotate(angle + Math.PI/2);
                    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(0, -height); ctx.lineTo(20, 0); ctx.fill();
                    ctx.restore();
                }
                
              } else if (v === 6) { // Celestial: Deep Space
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 3);
                grad.addColorStop(0, '#000044');
                grad.addColorStop(0.4, '#110033');
                grad.addColorStop(0.8, '#000011');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Nebula clouds
                ctx.fillStyle = 'rgba(100, 0, 255, 0.1)';
                for (let i=0; i<5; i++) {
                  ctx.beginPath();
                  ctx.ellipse(Math.cos(time+i)*baseDim, Math.sin(time+i)*baseDim, baseDim*1.5, baseDim, time*0.5+i, 0, Math.PI*2);
                  ctx.fill();
                }
                
                // Starfield
                ctx.fillStyle = '#ffffff';
                for(let i=0; i<100; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * baseDim * 3;
                    const twinkle = Math.sin(time*5 + i) > 0 ? 1 : 0.2;
                    ctx.globalAlpha = twinkle;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, Math.random()*2, 0, Math.PI*2); ctx.fill();
                }
                ctx.globalAlpha = 1;
                
                // Quasar Beams
                ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(0, -baseDim*4); ctx.lineTo(10, 0); ctx.lineTo(0, baseDim*4); ctx.fill();
                ctx.beginPath(); ctx.moveTo(-baseDim*4, 0); ctx.lineTo(0, -10); ctx.lineTo(baseDim*4, 0); ctx.lineTo(0, 10); ctx.fill();
                
              } else if (v === 7 || v === 11) { // Cyberpunk: Grid
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.4;
                
                // Perspective grid
                for(let i=-20; i<=20; i++) {
                   ctx.beginPath();
                   ctx.moveTo(i * 60, -maxDim);
                   ctx.lineTo(i * 60, maxDim);
                   ctx.stroke();
                   ctx.beginPath();
                   ctx.moveTo(-maxDim, i * 60);
                   ctx.lineTo(maxDim, i * 60);
                   ctx.stroke();
                }
                
                // Concentric circles
                ctx.strokeStyle = accent2;
                for (let i=1; i<=5; i++) {
                  ctx.beginPath();
                  ctx.arc(0, 0, baseDim * 0.5 * i, 0, Math.PI*2);
                  ctx.stroke();
                }
                ctx.globalAlpha = 1;
                
                // Floating Hexagons
                ctx.strokeStyle = accent3;
                ctx.lineWidth = 1;
                for(let i=0; i<15; i++) {
                    const angle = time * 0.5 + i * Math.PI*2/15;
                    const r = baseDim * (0.5 + Math.sin(time+i)*0.2);
                    ctx.save();
                    ctx.translate(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.rotate(time + i);
                    ctx.beginPath();
                    for(let j=0; j<6; j++) {
                        const hAngle = j * Math.PI/3;
                        if(j===0) ctx.moveTo(Math.cos(hAngle)*20, Math.sin(hAngle)*20);
                        else ctx.lineTo(Math.cos(hAngle)*20, Math.sin(hAngle)*20);
                    }
                    ctx.closePath(); ctx.stroke();
                    ctx.restore();
                }
                
                // Digital Rain
                ctx.fillStyle = accent1;
                ctx.font = '14px monospace';
                for(let i=0; i<20; i++) {
                    const x = (Math.random() - 0.5) * baseDim * 3;
                    const yOffset = (time * 200 + i*50) % (baseDim*3) - baseDim*1.5;
                    for(let j=0; j<5; j++) {
                        ctx.fillText(Math.random()>0.5?'1':'0', x, yOffset + j*15);
                    }
                }
                
              } else if (v === 8) { // Abyssal: Trench
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 2.5);
                grad.addColorStop(0, '#000022');
                grad.addColorStop(0.5, '#001133');
                grad.addColorStop(0.8, '#000011');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 2.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Water ripples
                ctx.strokeStyle = 'rgba(0, 100, 255, 0.1)';
                ctx.lineWidth = 10;
                for (let i=0; i<3; i++) {
                  ctx.beginPath();
                  ctx.arc(0, 0, baseDim * (1 + (time*2+i)%2), 0, Math.PI*2);
                  ctx.stroke();
                }
                
                // Rising Bubbles
                ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
                for(let i=0; i<40; i++) {
                    const x = (Math.random() - 0.5) * baseDim * 2;
                    const y = baseDim - ((time * 50 + i*20) % (baseDim*2));
                    ctx.beginPath(); ctx.arc(x, y, Math.random()*5+2, 0, Math.PI*2); ctx.fill();
                }
                
                // Glowing Kelp
                ctx.strokeStyle = 'rgba(0, 255, 100, 0.3)';
                ctx.lineWidth = 8;
                ctx.lineCap = 'round';
                for(let i=-5; i<=5; i++) {
                    const x = i * (baseDim / 5);
                    ctx.beginPath();
                    ctx.moveTo(x, baseDim);
                    ctx.quadraticCurveTo(x + Math.sin(time+i)*30, baseDim*0.5, x + Math.sin(time*1.5+i)*50, 0);
                    ctx.stroke();
                }
                
              } else if (v === 9) { // Easter: Pastel Glow
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 2);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, '#fff0f5');
                grad.addColorStop(0.6, '#e6e6fa');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Rainbow rays
                for (let i=0; i<12; i++) {
                  ctx.fillStyle = `hsla(${i*30}, 100%, 80%, 0.2)`;
                  ctx.beginPath();
                  ctx.moveTo(0,0);
                  ctx.arc(0, 0, baseDim * 2.5, time*0.5 + i * Math.PI/6, time*0.5 + i * Math.PI/6 + 0.2);
                  ctx.fill();
                }
                
                // Floating Eggs
                for(let i=0; i<6; i++) {
                    const angle = i * Math.PI/3 - time*0.5;
                    const r = baseDim * (0.6 + Math.sin(time*2+i)*0.1);
                    ctx.save();
                    ctx.translate(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.rotate(angle + Math.PI/2);
                    ctx.fillStyle = `hsl(${i*60}, 80%, 70%)`;
                    ctx.beginPath(); ctx.ellipse(0, 0, 15, 20, 0, 0, Math.PI*2); ctx.fill();
                    // Egg pattern
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke();
                    ctx.restore();
                }
                
                // Confetti Rain
                for(let i=0; i<40; i++) {
                    const x = (Math.random() - 0.5) * baseDim * 3;
                    const y = ((time * 150 + i*40) % (baseDim*3)) - baseDim*1.5;
                    ctx.fillStyle = `hsl(${Math.random()*360}, 100%, 50%)`;
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(time * 5 + i);
                    ctx.fillRect(-5, -2, 10, 4);
                    ctx.restore();
                }
                
              } else if (v === 10) { // Matrix: Code Field
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 2.5);
                grad.addColorStop(0, 'rgba(0, 50, 0, 0.9)');
                grad.addColorStop(0.5, 'rgba(0, 20, 0, 0.8)');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 2.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Matrix Rain Background
                ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
                ctx.font = '16px monospace';
                for(let i=-20; i<=20; i++) {
                    const x = i * 30;
                    const yOffset = (time * 150 + i*70) % (baseDim*3) - baseDim*1.5;
                    for(let j=0; j<15; j++) {
                        ctx.fillText(String.fromCharCode(0x30A0 + Math.random()*96), x, yOffset + j*20);
                    }
                }
                
                // Glowing Code Rings
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                for(let i=1; i<=3; i++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, baseDim * 0.5 * i + Math.sin(time*2)*20, 0, Math.PI*2);
                    ctx.stroke();
                }
                
              } else {
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 2);
                grad.addColorStop(0, accent1);
                grad.addColorStop(0.5, accent2);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                
                // Sacred Geometry
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                for(let i=0; i<8; i++) {
                    const angle = i * Math.PI/4 + time*0.2;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(angle)*baseDim, Math.sin(angle)*baseDim);
                    ctx.lineTo(Math.cos(angle+Math.PI*0.75)*baseDim, Math.sin(angle+Math.PI*0.75)*baseDim);
                    ctx.stroke();
                }
                
                // Energy Pulses
                ctx.strokeStyle = accent3;
                ctx.lineWidth = 3;
                for(let i=0; i<3; i++) {
                    const r = (time * 100 + i*100) % baseDim;
                    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke();
                }
                
              }
              ctx.restore();
            };

            drawGuardianBackground(variant);

            // Ambient Effects
            const drawGuardianAmbient = (v: number) => {
              ctx.save();
              ctx.globalCompositeOperation = 'screen';
              if (v === 1) { // Void particles
                for(let i=0; i<40; i++) {
                  const a = Math.random() * Math.PI * 2;
                  const r = Math.random() * baseDim * 2;
                  ctx.fillStyle = Math.random() > 0.5 ? accent1 : accent2;
                  ctx.beginPath();
                  ctx.arc(Math.cos(a)*r, Math.sin(a)*r, Math.random() * 3 + 1, 0, Math.PI*2);
                  ctx.fill();
                }
              } else if (v === 2) { // Fire sparks
                for(let i=0; i<50; i++) {
                  const x = (Math.random()-0.5) * baseDim * 4;
                  const y = (Math.random()-0.5) * baseDim * 4 - time * 150;
                  ctx.fillStyle = Math.random() > 0.5 ? '#ffcc00' : '#ffffff';
                  ctx.beginPath();
                  ctx.arc(x, (y % (baseDim*4)) + baseDim*2, Math.random() * 3 + 1, 0, Math.PI*2);
                  ctx.fill();
                }
              } else if (v === 3) { // Floating leaves & spores
                for(let i=0; i<30; i++) {
                  const x = Math.sin(time + i) * baseDim * 1.5 + Math.cos(time*0.5 + i)*50;
                  const y = Math.cos(time * 0.5 + i) * baseDim * 1.5 + Math.sin(time*0.8 + i)*50;
                  ctx.fillStyle = i % 2 === 0 ? accent3 : accent1;
                  ctx.beginPath();
                  ctx.ellipse(x, y, 12, 6, Math.sin(time + i), 0, Math.PI*2);
                  ctx.fill();
                }
              } else if (v === 4) { // Snowflakes & ice dust
                for(let i=0; i<60; i++) {
                  const x = (Math.random()-0.5) * baseDim * 4 + Math.sin(time + i)*20;
                  const y = (Math.random()-0.5) * baseDim * 4 + time * 80;
                  ctx.fillStyle = '#ffffff';
                  ctx.beginPath();
                  ctx.arc(x, (y % (baseDim*4)) - baseDim*2, Math.random() * 2 + 1, 0, Math.PI*2);
                  ctx.fill();
                }
              } else if (v === 5) { // Magma embers
                for(let i=0; i<40; i++) {
                  const x = (Math.random()-0.5) * baseDim * 3;
                  const y = (Math.random()-0.5) * baseDim * 3 - time * 200;
                  ctx.fillStyle = '#ff4500';
                  ctx.beginPath();
                  ctx.arc(x + Math.sin(time*5+i)*30, (y % (baseDim*3)) + baseDim*1.5, Math.random() * 4 + 2, 0, Math.PI*2);
                  ctx.fill();
                }
              } else if (v === 6) { // Stardust
                for(let i=0; i<80; i++) {
                  const a = Math.random() * Math.PI * 2;
                  const r = Math.random() * baseDim * 2.5;
                  ctx.fillStyle = Math.random() > 0.8 ? '#ffffff' : accent2;
                  ctx.beginPath();
                  ctx.arc(Math.cos(a)*r, Math.sin(a)*r, Math.random() * 2, 0, Math.PI*2);
                  ctx.fill();
                }
              } else if (v === 7 || v === 11) { // Cyberpunk data streams
                ctx.fillStyle = accent1;
                for(let i=0; i<30; i++) {
                  const x = (Math.random()-0.5) * baseDim * 3;
                  const y = (Math.random()-0.5) * baseDim * 3 + time * 300;
                  ctx.fillRect(x, (y % (baseDim*3)) - baseDim*1.5, 2, Math.random() * 40 + 10);
                }
              } else if (v === 8) { // Abyssal bubbles
                for(let i=0; i<40; i++) {
                  const x = (Math.random()-0.5) * baseDim * 3 + Math.sin(time*2+i)*20;
                  const y = (Math.random()-0.5) * baseDim * 3 - time * 50;
                  ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.arc(x, (y % (baseDim*3)) + baseDim*1.5, Math.random() * 5 + 2, 0, Math.PI*2);
                  ctx.stroke();
                }
              } else if (v === 9) { // Easter confetti
                for(let i=0; i<50; i++) {
                  const x = (Math.random()-0.5) * baseDim * 3;
                  const y = (Math.random()-0.5) * baseDim * 3 + time * 100;
                  ctx.fillStyle = ['#ffb6c1', '#87cefa', '#98fb98', '#dda0dd', '#ffffba'][i%5];
                  ctx.save();
                  ctx.translate(x, (y % (baseDim*3)) - baseDim*1.5);
                  ctx.rotate(time * 5 + i);
                  ctx.fillRect(-5, -5, 10, 10);
                  ctx.restore();
                }
              } else if (v === 10) { // Matrix rain
                ctx.font = '20px monospace';
                ctx.fillStyle = '#00ff00';
                for(let i=0; i<40; i++) {
                  const x = (i - 20) * 30;
                  const y = (time * 500 + i * 150) % (baseDim * 4) - baseDim * 2;
                  ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), x, y);
                  ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                  ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), x, y - 20);
                  ctx.fillStyle = '#00ff00';
                }
              } else {
                for(let i=0; i<30; i++) {
                  const a = Math.random() * Math.PI * 2;
                  const r = Math.random() * baseDim * 2;
                  ctx.fillStyle = accent1;
                  ctx.beginPath();
                  ctx.arc(Math.cos(a)*r, Math.sin(a)*r, Math.random() * 3 + 1, 0, Math.PI*2);
                  ctx.fill();
                }
              }
              ctx.restore();
            };

            drawGuardianAmbient(variant);

            const drawGuardianVisual = (v: number) => {
              ctx.save();
              
              if (v === 1) { // Violet: Singularity Core
                const pulse = Math.sin(time * 5) * 0.2 + 1;
                
                // Accretion disk
                ctx.save();
                ctx.rotate(time);
                ctx.scale(1, 0.3);
                const diskGrad = ctx.createRadialGradient(0, 0, baseDim * 0.5, 0, 0, baseDim * 2);
                diskGrad.addColorStop(0, '#ffffff');
                diskGrad.addColorStop(0.2, accent1);
                diskGrad.addColorStop(0.5, accent2);
                diskGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = diskGrad;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Core
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 0.6 * pulse);
                grad.addColorStop(0, '#000000');
                grad.addColorStop(0.8, '#000000');
                grad.addColorStop(0.9, '#ffffff');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 0.6 * pulse, 0, Math.PI * 2);
                ctx.fill();
                
                // Orbiting rings with particles
                for(let i=0; i<5; i++) {
                  ctx.save();
                  ctx.rotate(time * (i+1) * 0.8 + i * Math.PI/2);
                  ctx.strokeStyle = i % 2 === 0 ? accent1 : accent2;
                  ctx.lineWidth = 3 + Math.sin(time * 2 + i) * 2;
                  ctx.shadowBlur = 15;
                  ctx.shadowColor = ctx.strokeStyle;
                  ctx.beginPath();
                  ctx.ellipse(0, 0, baseDim * (0.8 + i*0.2), baseDim * (0.2 + i*0.1), 0, 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.restore();
                }

                // Polar jets
                const jetGrad = ctx.createLinearGradient(0, -baseDim * 3, 0, baseDim * 3);
                jetGrad.addColorStop(0, 'transparent');
                jetGrad.addColorStop(0.4, accent3);
                jetGrad.addColorStop(0.5, '#ffffff');
                jetGrad.addColorStop(0.6, accent3);
                jetGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = jetGrad;
                ctx.globalCompositeOperation = 'screen';
                ctx.beginPath();
                ctx.moveTo(-20, 0);
                ctx.lineTo(0, -baseDim * 3 * pulse);
                ctx.lineTo(20, 0);
                ctx.lineTo(0, baseDim * 3 * pulse);
                ctx.fill();
                
                // Hawking Radiation
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                for(let i=0; i<30; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = baseDim * 0.6 * pulse + Math.random() * 20;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, Math.random()*2, 0, Math.PI*2); ctx.fill();
                }
                
                // Gravitational Lensing Rings
                ctx.strokeStyle = 'rgba(200, 200, 255, 0.2)';
                ctx.lineWidth = 1;
                for(let i=1; i<=3; i++) {
                    ctx.beginPath(); ctx.arc(0, 0, baseDim * (0.8 + i*0.2 + Math.sin(time)*0.05), 0, Math.PI*2); ctx.stroke();
                }

              } else if (v === 2) { // Solar: Phoenix
                const flap = Math.sin(time * 10) * 0.4;
                
                // Multiple wing layers
                for (let layer = 0; layer < 3; layer++) {
                  const layerScale = 1 - layer * 0.2;
                  for(let side of [-1, 1]) {
                    ctx.save();
                    ctx.scale(side * layerScale, layerScale);
                    ctx.rotate(flap * (1 + layer * 0.5));
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(baseDim * 0.5, -baseDim * 0.8, baseDim * 2.0, -baseDim * 1.5, baseDim * 2.5, -baseDim * 0.2);
                    ctx.bezierCurveTo(baseDim * 1.8, baseDim * 0.2, baseDim * 0.8, baseDim * 0.8, 0, 0);
                    
                    const grad = ctx.createLinearGradient(0, 0, baseDim * 2.5, 0);
                    grad.addColorStop(0, layer === 0 ? '#ffffff' : '#ffcc00');
                    grad.addColorStop(0.5, '#ff4400');
                    grad.addColorStop(1, 'transparent');
                    ctx.fillStyle = grad;
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#ff4400';
                    ctx.fill();
                    ctx.restore();
                  }
                }

                // Glowing Core / Body
                const corePulse = 1 + Math.sin(time * 15) * 0.2;
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 50;
                ctx.shadowColor = '#ffaa00';
                ctx.beginPath();
                ctx.ellipse(0, 0, baseDim * 0.3 * corePulse, baseDim * 0.6 * corePulse, 0, 0, Math.PI * 2);
                ctx.fill();

                // Tail feathers
                for (let i = 0; i < 5; i++) {
                  ctx.save();
                  ctx.rotate(Math.sin(time * 5 + i) * 0.2);
                  ctx.beginPath();
                  ctx.moveTo(0, baseDim * 0.4);
                  ctx.quadraticCurveTo((i - 2) * 40, baseDim * 1.5, (i - 2) * 60, baseDim * 2.5);
                  ctx.strokeStyle = i % 2 === 0 ? '#ffcc00' : '#ff4400';
                  ctx.lineWidth = 10 - i;
                  ctx.stroke();
                  ctx.restore();
                }
                
                // Phoenix Crown
                ctx.fillStyle = '#ffcc00';
                for(let i=-2; i<=2; i++) {
                    ctx.save();
                    ctx.rotate(i * 0.2 + Math.sin(time*5)*0.1);
                    ctx.beginPath(); ctx.moveTo(0, -baseDim*0.5); ctx.lineTo(10, -baseDim*0.8); ctx.lineTo(-10, -baseDim*0.8); ctx.fill();
                    ctx.restore();
                }
                
                // Ember Trail
                ctx.fillStyle = '#ff5500';
                for(let i=0; i<20; i++) {
                    const x = (Math.random() - 0.5) * baseDim;
                    const y = baseDim * 0.5 + Math.random() * baseDim * 1.5;
                    ctx.beginPath(); ctx.arc(x, y, Math.random()*4+1, 0, Math.PI*2); ctx.fill();
                }

              } else if (v === 3) { // Emerald: Tree Spirit
                // Massive glowing roots
                ctx.strokeStyle = '#1a4314';
                ctx.lineWidth = 15;
                ctx.lineCap = 'round';
                for (let i = 0; i < 8; i++) {
                  ctx.beginPath();
                  ctx.moveTo(0, baseDim * 0.5);
                  ctx.bezierCurveTo(
                    (Math.random() - 0.5) * baseDim, baseDim,
                    (Math.random() - 0.5) * baseDim * 2, baseDim * 1.5,
                    (i - 3.5) * baseDim * 0.4, baseDim * 2
                  );
                  ctx.stroke();
                }

                // Trunk with glowing runes
                const trunkGrad = ctx.createLinearGradient(-baseDim * 0.4, 0, baseDim * 0.4, 0);
                trunkGrad.addColorStop(0, '#2d5a27');
                trunkGrad.addColorStop(0.5, '#4a8541');
                trunkGrad.addColorStop(1, '#2d5a27');
                ctx.fillStyle = trunkGrad;
                ctx.beginPath();
                ctx.moveTo(-baseDim * 0.4, baseDim * 0.8);
                ctx.quadraticCurveTo(-baseDim * 0.2, 0, -baseDim * 0.1, -baseDim);
                ctx.lineTo(baseDim * 0.1, -baseDim);
                ctx.quadraticCurveTo(baseDim * 0.2, 0, baseDim * 0.4, baseDim * 0.8);
                ctx.fill();

                // Runes
                ctx.fillStyle = '#00ff00';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#00ff00';
                ctx.font = 'bold 30px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('ᛉ', 0, 0);
                ctx.fillText('ᛟ', 0, baseDim * 0.4);

                // Layered Canopy
                for (let layer = 0; layer < 4; layer++) {
                  ctx.fillStyle = layer % 2 === 0 ? accent1 : accent2;
                  ctx.globalAlpha = 0.8 - layer * 0.15;
                  ctx.beginPath();
                  ctx.arc(0, -baseDim * (1 + layer * 0.4), baseDim * (1.2 - layer * 0.2), 0, Math.PI * 2);
                  ctx.fill();
                }
                ctx.globalAlpha = 1;

                // Spores/Fireflies
                for(let i=0; i<30; i++) {
                  const a = Math.random() * Math.PI * 2;
                  const r = Math.random() * baseDim * 1.5;
                  ctx.fillStyle = '#ccffcc';
                  ctx.shadowBlur = 5;
                  ctx.beginPath();
                  ctx.arc(Math.cos(a)*r, Math.sin(a)*r - baseDim, Math.random() * 4 + 2, 0, Math.PI*2);
                  ctx.fill();
                }
                
                // Spirit Wisps
                ctx.fillStyle = 'rgba(150, 255, 150, 0.6)';
                for(let i=0; i<8; i++) {
                    const angle = time + i * Math.PI/4;
                    const r = baseDim * (0.8 + Math.sin(time*2+i)*0.2);
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, 8 + Math.sin(time*5)*3, 0, Math.PI*2); ctx.fill();
                }
                
                // Falling Leaves
                ctx.fillStyle = '#00aa00';
                for(let i=0; i<15; i++) {
                    const x = (Math.random() - 0.5) * baseDim * 2;
                    const y = ((time * 50 + i*30) % (baseDim*2)) - baseDim;
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(time*2 + i);
                    ctx.beginPath(); ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI*2); ctx.fill();
                    ctx.restore();
                }

              } else if (v === 4) { // Glacier: Ice Golem
                // Crystal Aura
                const pulse = Math.sin(time * 4) * 0.2 + 1;
                ctx.fillStyle = 'rgba(176, 224, 230, 0.2)';
                ctx.beginPath();
                ctx.moveTo(0, -baseDim * 2 * pulse);
                ctx.lineTo(baseDim * pulse, 0);
                ctx.lineTo(0, baseDim * 2 * pulse);
                ctx.lineTo(-baseDim * pulse, 0);
                ctx.fill();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.lineJoin = 'bevel';

                // Draw jagged crystal formations
                const drawCrystal = (x: number, y: number, w: number, h: number, rot: number) => {
                  ctx.save();
                  ctx.translate(x, y);
                  ctx.rotate(rot);
                  const grad = ctx.createLinearGradient(-w, -h, w, h);
                  grad.addColorStop(0, '#ffffff');
                  grad.addColorStop(0.5, '#00bfff');
                  grad.addColorStop(1, '#00008b');
                  ctx.fillStyle = grad;
                  ctx.beginPath();
                  ctx.moveTo(0, -h);
                  ctx.lineTo(w, 0);
                  ctx.lineTo(0, h);
                  ctx.lineTo(-w, 0);
                  ctx.closePath();
                  ctx.fill();
                  ctx.stroke();
                  
                  // Inner highlight
                  ctx.beginPath();
                  ctx.moveTo(0, -h*0.8);
                  ctx.lineTo(w*0.2, 0);
                  ctx.lineTo(0, h*0.8);
                  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                  ctx.lineWidth = 2;
                  ctx.stroke();
                  ctx.restore();
                };

                // Shoulders
                drawCrystal(-baseDim*0.6, -baseDim*0.4, baseDim*0.4, baseDim*0.6, -Math.PI/6);
                drawCrystal(baseDim*0.6, -baseDim*0.4, baseDim*0.4, baseDim*0.6, Math.PI/6);
                
                // Torso
                drawCrystal(0, 0, baseDim*0.5, baseDim*0.8, 0);
                
                // Head
                drawCrystal(0, -baseDim*0.9, baseDim*0.3, baseDim*0.4, 0);
                
                // Glowing Eyes
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ffffff';
                ctx.fillRect(-baseDim*0.15, -baseDim*0.95, baseDim*0.1, baseDim*0.05);
                ctx.fillRect(baseDim*0.05, -baseDim*0.95, baseDim*0.1, baseDim*0.05);
                
                // Frost Breath
                ctx.fillStyle = 'rgba(200, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.moveTo(0, -baseDim*0.2);
                ctx.lineTo(-baseDim, -baseDim*1.5);
                ctx.lineTo(baseDim, -baseDim*1.5);
                ctx.fill();
                
                // Glowing Ice Core
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#00ffff';
                ctx.beginPath(); ctx.arc(0, 0, baseDim*0.15 + Math.sin(time*5)*10, 0, Math.PI*2); ctx.fill();
                ctx.shadowBlur = 0;

              } else if (v === 5) { // Magma: Fire Elemental
                const pulse = Math.sin(time * 8) * 0.2 + 1;
                
                // Heat distortion aura
                ctx.fillStyle = 'rgba(255, 69, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 1.5 * pulse, 0, Math.PI * 2);
                ctx.fill();

                // Multi-layered flame core
                for (let i = 0; i < 4; i++) {
                  ctx.fillStyle = i === 0 ? '#8b0000' : i === 1 ? '#ff0000' : i === 2 ? '#ff8c00' : '#ffff00';
                  ctx.beginPath();
                  ctx.moveTo(0, -baseDim * (1.5 - i * 0.2) * pulse);
                  ctx.quadraticCurveTo(
                    baseDim * (0.8 - i * 0.15) * pulse + Math.sin(time * 10 + i) * 20, 
                    baseDim * 0.2, 
                    0, 
                    baseDim * (0.8 - i * 0.1)
                  );
                  ctx.quadraticCurveTo(
                    -baseDim * (0.8 - i * 0.15) * pulse + Math.cos(time * 12 + i) * 20, 
                    baseDim * 0.2, 
                    0, 
                    -baseDim * (1.5 - i * 0.2) * pulse
                  );
                  ctx.fill();
                }

                // Floating obsidian shards
                ctx.fillStyle = '#1a1a1a';
                ctx.strokeStyle = '#ff4500';
                ctx.lineWidth = 2;
                for(let i=0; i<8; i++) {
                  const angle = time * 2 + i * Math.PI / 4;
                  const r = baseDim * 0.8 + Math.sin(time * 5 + i) * 20;
                  ctx.save();
                  ctx.translate(Math.cos(angle) * r, Math.sin(angle) * r);
                  ctx.rotate(time * 5 + i);
                  ctx.beginPath();
                  ctx.moveTo(0, -20);
                  ctx.lineTo(15, 10);
                  ctx.lineTo(-15, 10);
                  ctx.closePath();
                  ctx.fill();
                  ctx.stroke();
                  ctx.restore();
                }
                
                // Magma Veins
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-baseDim*0.3, baseDim*0.5); ctx.lineTo(-baseDim*0.1, baseDim*0.8); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(baseDim*0.3, baseDim*0.5); ctx.lineTo(baseDim*0.1, baseDim*0.8); ctx.stroke();
                
                // Erupting Sparks
                ctx.fillStyle = '#ffffff';
                for(let i=0; i<15; i++) {
                    const x = (Math.random() - 0.5) * baseDim;
                    const y = -baseDim * 0.5 - Math.random() * baseDim;
                    ctx.beginPath(); ctx.arc(x, y, Math.random()*3+1, 0, Math.PI*2); ctx.fill();
                }

              } else if (v === 6) { // Celestial: Star Spirit
                const pulse = Math.sin(time * 3) * 0.1 + 1;
                
                // Astrolabe / Mandala background rings
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                for (let i = 1; i <= 4; i++) {
                  ctx.save();
                  ctx.rotate(time * 0.5 * (i % 2 === 0 ? 1 : -1));
                  ctx.beginPath();
                  ctx.arc(0, 0, baseDim * 0.4 * i, 0, Math.PI * 2);
                  ctx.stroke();
                  // Add nodes on rings
                  for (let j = 0; j < 6; j++) {
                    ctx.beginPath();
                    ctx.arc(Math.cos(j * Math.PI / 3) * baseDim * 0.4 * i, Math.sin(j * Math.PI / 3) * baseDim * 0.4 * i, 5, 0, Math.PI * 2);
                    ctx.fillStyle = accent1;
                    ctx.fill();
                  }
                  ctx.restore();
                }

                // Central Starburst
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * pulse);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.2, accent2);
                grad.addColorStop(0.6, accent1);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                
                ctx.beginPath();
                for(let i=0; i<12; i++) {
                  ctx.rotate(Math.PI * 2 / 12);
                  ctx.lineTo(0, -baseDim * (i % 2 === 0 ? 1.2 : 0.5) * pulse);
                }
                ctx.fill();

                // Core singularity
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 0.2, 0, Math.PI * 2);
                ctx.fill();
                
                // Orbiting Moons
                ctx.fillStyle = '#aaaaaa';
                for(let i=0; i<3; i++) {
                    const angle = time * (1 + i*0.5) + i * Math.PI*2/3;
                    const r = baseDim * (1.2 + i*0.3);
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, 10 + i*5, 0, Math.PI*2); ctx.fill();
                }
                
                // Supernova Rings
                ctx.strokeStyle = 'rgba(255, 200, 255, 0.4)';
                ctx.lineWidth = 2;
                for(let i=1; i<=3; i++) {
                    const r = (time * 100 + i*50) % (baseDim*2);
                    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke();
                }

              } else if (v === 7 || v === 11) { // Cyberpunk: Mech Core
                ctx.lineJoin = 'miter';
                
                // Outer rotating gear
                ctx.save();
                ctx.rotate(time);
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 10;
                ctx.beginPath();
                for (let i = 0; i < 12; i++) {
                  const angle = i * Math.PI / 6;
                  const r1 = baseDim * 0.8;
                  const r2 = baseDim * 0.9;
                  ctx.lineTo(Math.cos(angle - 0.1) * r1, Math.sin(angle - 0.1) * r1);
                  ctx.lineTo(Math.cos(angle - 0.1) * r2, Math.sin(angle - 0.1) * r2);
                  ctx.lineTo(Math.cos(angle + 0.1) * r2, Math.sin(angle + 0.1) * r2);
                  ctx.lineTo(Math.cos(angle + 0.1) * r1, Math.sin(angle + 0.1) * r1);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.restore();

                // Inner Hexagon Core
                ctx.strokeStyle = accent3;
                ctx.lineWidth = 5;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                  const angle = i * Math.PI / 3 + Math.PI / 6;
                  ctx.lineTo(Math.cos(angle) * baseDim * 0.6, Math.sin(angle) * baseDim * 0.6);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Glitching Eye
                const glitchOffset = Math.random() > 0.9 ? (Math.random() - 0.5) * 20 : 0;
                ctx.fillStyle = accent2;
                ctx.shadowBlur = 20;
                ctx.shadowColor = accent2;
                ctx.fillRect(-baseDim*0.3 + glitchOffset, -baseDim*0.1, baseDim*0.6, baseDim*0.2);
                
                // HUD Elements
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 0.4, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(-baseDim * 0.5, 0); ctx.lineTo(baseDim * 0.5, 0);
                ctx.moveTo(0, -baseDim * 0.5); ctx.lineTo(0, baseDim * 0.5);
                ctx.stroke();
                
                // Data Streams
                ctx.fillStyle = accent1;
                ctx.font = '10px monospace';
                for(let i=0; i<8; i++) {
                    const angle = i * Math.PI/4;
                    ctx.save();
                    ctx.rotate(angle);
                    for(let j=0; j<5; j++) {
                        ctx.fillText(Math.random().toString(16).substr(2, 4), baseDim * 1.1 + j*30, 0);
                    }
                    ctx.restore();
                }
                
                // Warning Signs
                if (Math.random() > 0.8) {
                    ctx.fillStyle = 'red';
                    ctx.font = 'bold 20px sans-serif';
                    ctx.fillText('SYSTEM OVERRIDE', -80, -baseDim * 1.2);
                }

              } else if (v === 8) { // Abyssal: Kraken Eye
                // Massive dark aura
                const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 1.5);
                auraGrad.addColorStop(0, '#000000');
                auraGrad.addColorStop(0.5, '#000022');
                auraGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = auraGrad;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 1.5, 0, Math.PI * 2);
                ctx.fill();

                // Thick, detailed tentacles
                for(let i=0; i<8; i++) {
                  ctx.save();
                  ctx.rotate(i * Math.PI / 4 + time * 0.5);
                  
                  // Tentacle base
                  ctx.beginPath();
                  ctx.moveTo(baseDim * 0.4, -20);
                  ctx.quadraticCurveTo(baseDim * 1.0, Math.sin(time*3 + i)*50 - 20, baseDim * 1.8, 0);
                  ctx.quadraticCurveTo(baseDim * 1.0, Math.sin(time*3 + i)*50 + 20, baseDim * 0.4, 20);
                  const tGrad = ctx.createLinearGradient(baseDim * 0.4, 0, baseDim * 1.8, 0);
                  tGrad.addColorStop(0, '#0a1a3c');
                  tGrad.addColorStop(1, '#000000');
                  ctx.fillStyle = tGrad;
                  ctx.fill();

                  // Bioluminescent suction cups
                  ctx.fillStyle = accent3;
                  ctx.shadowBlur = 10;
                  ctx.shadowColor = accent3;
                  for (let j = 1; j < 6; j++) {
                    const tx = baseDim * 0.4 + j * baseDim * 0.2;
                    const ty = Math.sin(time*3 + i) * (j * 8) + 15;
                    ctx.beginPath();
                    ctx.ellipse(tx, ty, 8 - j, 4 - j*0.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                  }
                  ctx.restore();
                }

                // The Eye
                ctx.fillStyle = '#1a2a6c';
                ctx.strokeStyle = accent2;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.ellipse(0, 0, baseDim * 0.6, baseDim * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                
                // Iris
                const irisGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 0.3);
                irisGrad.addColorStop(0, accent3);
                irisGrad.addColorStop(1, '#000033');
                ctx.fillStyle = irisGrad;
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 0.3, 0, Math.PI * 2);
                ctx.fill();

                // Slit Pupil
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.ellipse(0, 0, baseDim * 0.05, baseDim * 0.25, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Ink Clouds
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                for(let i=0; i<10; i++) {
                    const angle = time * 0.5 + i * Math.PI*2/10;
                    const r = baseDim * (0.8 + Math.sin(time+i)*0.3);
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, 30 + Math.sin(time*2+i)*10, 0, Math.PI*2); ctx.fill();
                }
                
                // Deep Sea Lightning
                if (Math.random() > 0.9) {
                    ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    let lx = 0, ly = 0;
                    ctx.moveTo(lx, ly);
                    for(let i=0; i<5; i++) {
                        lx += (Math.random() - 0.5) * baseDim;
                        ly += (Math.random() - 0.5) * baseDim;
                        ctx.lineTo(lx, ly);
                    }
                    ctx.stroke();
                }

              } else if (v === 9) { // Easter: Golden Egg
                // Glowing Halo
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(0, 0, baseDim * 1.2, 0, Math.PI * 2);
                ctx.fill();

                // Ornate Egg Base
                const grad = ctx.createLinearGradient(-baseDim*0.4, -baseDim*0.6, baseDim*0.4, baseDim*0.6);
                grad.addColorStop(0, '#ffeeaa');
                grad.addColorStop(0.5, '#ffd700');
                grad.addColorStop(1, '#cc9900');
                ctx.fillStyle = grad;
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#ffd700';
                ctx.beginPath();
                ctx.ellipse(0, 0, baseDim * 0.5, baseDim * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Intricate Patterns (Fabergé style)
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.shadowBlur = 0;
                
                // Horizontal bands
                for (let y = -baseDim * 0.4; y <= baseDim * 0.4; y += baseDim * 0.2) {
                  ctx.beginPath();
                  ctx.ellipse(0, y, baseDim * 0.45 * Math.cos(y / (baseDim * 0.7)), baseDim * 0.1, 0, 0, Math.PI);
                  ctx.stroke();
                  
                  // Jewels on bands
                  for (let x = -baseDim * 0.3; x <= baseDim * 0.3; x += baseDim * 0.15) {
                    ctx.fillStyle = ['#ff00ff', '#00ffff', '#00ff00'][Math.floor(Math.random() * 3)];
                    ctx.beginPath();
                    ctx.arc(x, y + baseDim * 0.1, 5, 0, Math.PI * 2);
                    ctx.fill();
                  }
                }

                // Floating ribbons
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 8;
                ctx.lineCap = 'round';
                for (let i = 0; i < 4; i++) {
                  ctx.beginPath();
                  ctx.moveTo(0, -baseDim * 0.7);
                  ctx.bezierCurveTo(
                    (i % 2 === 0 ? 1 : -1) * baseDim, -baseDim + Math.sin(time * 3 + i) * 50,
                    (i % 2 === 0 ? 1 : -1) * baseDim * 1.5, Math.cos(time * 2 + i) * 50,
                    (i % 2 === 0 ? 1 : -1) * baseDim * 0.5, baseDim + Math.sin(time * 4 + i) * 50
                  );
                  ctx.stroke();
                }
                
                // Sparkle Aura
                ctx.fillStyle = '#ffffff';
                for(let i=0; i<20; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = baseDim * 0.7 + Math.random() * baseDim * 0.5;
                    ctx.save();
                    ctx.translate(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.rotate(time * 5 + i);
                    ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(2, -1); ctx.lineTo(6, 0); ctx.lineTo(2, 1); ctx.lineTo(0, 5); ctx.lineTo(-2, 1); ctx.lineTo(-6, 0); ctx.lineTo(-2, -1); ctx.fill();
                    ctx.restore();
                }

              } else if (v === 10) { // Matrix: Digital Entity
                // Glowing wireframe cube / tesseract
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 3;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00ff00';
                
                const s = baseDim * 0.5;
                const offset = Math.sin(time * 2) * s * 0.3;
                
                // Inner square
                ctx.strokeRect(-s/2, -s/2, s, s);
                // Outer square
                ctx.strokeRect(-s + offset, -s + offset, s*2, s*2);
                
                // Connecting lines
                ctx.beginPath();
                ctx.moveTo(-s/2, -s/2); ctx.lineTo(-s + offset, -s + offset);
                ctx.moveTo(s/2, -s/2); ctx.lineTo(s + offset, -s + offset);
                ctx.moveTo(-s/2, s/2); ctx.lineTo(-s + offset, s + offset);
                ctx.moveTo(s/2, s/2); ctx.lineTo(s + offset, s + offset);
                ctx.stroke();

                // Central Avatar Outline
                ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
                ctx.beginPath();
                ctx.moveTo(0, -s*0.8);
                ctx.lineTo(s*0.4, -s*0.2);
                ctx.lineTo(s*0.2, s*0.8);
                ctx.lineTo(-s*0.2, s*0.8);
                ctx.lineTo(-s*0.4, -s*0.2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Text Overlay
                ctx.font = 'bold 30px monospace';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                if (Math.random() > 0.1) {
                  ctx.fillText('WAKE UP', 0, -s * 1.2);
                }
                
                // Binary rings
                ctx.font = '12px monospace';
                ctx.fillStyle = '#00ff00';
                for (let i = 0; i < 36; i++) {
                  const angle = i * Math.PI / 18 + time;
                  const r = baseDim * 1.2;
                  ctx.fillText(Math.random() > 0.5 ? '1' : '0', Math.cos(angle) * r, Math.sin(angle) * r);
                }
                
                // Glitch Blocks
                ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                for(let i=0; i<5; i++) {
                    if(Math.random() > 0.5) {
                        const gx = (Math.random() - 0.5) * baseDim * 2;
                        const gy = (Math.random() - 0.5) * baseDim * 2;
                        ctx.fillRect(gx, gy, Math.random()*50+10, Math.random()*10+2);
                    }
                }

              } else { // Default: Energy Orb
                const pulse = Math.sin(time * 5) * 0.1 + 1;
                
                // Multiple layered glowing orbs
                for (let i = 3; i > 0; i--) {
                  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 0.3 * i * pulse);
                  grad.addColorStop(0, i === 1 ? '#ffffff' : accent1);
                  grad.addColorStop(1, 'transparent');
                  ctx.fillStyle = grad;
                  ctx.beginPath();
                  ctx.arc(0, 0, baseDim * 0.3 * i * pulse, 0, Math.PI * 2);
                  ctx.fill();
                }
                
                // Orbiting energy trails
                ctx.strokeStyle = accent2;
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                for (let i = 0; i < 4; i++) {
                  ctx.beginPath();
                  ctx.arc(0, 0, baseDim * 0.8, time * 3 + i * Math.PI/2, time * 3 + i * Math.PI/2 + Math.PI/2);
                  ctx.stroke();
                }
                
                // Geometric Shell
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 1;
                for(let i=0; i<3; i++) {
                    ctx.save();
                    ctx.rotate(time * (i%2===0?1:-1) + i*Math.PI/3);
                    ctx.beginPath();
                    ctx.moveTo(0, -baseDim);
                    ctx.lineTo(baseDim*0.866, baseDim*0.5);
                    ctx.lineTo(-baseDim*0.866, baseDim*0.5);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.restore();
                }
                
                // Core Particles
                ctx.fillStyle = '#ffffff';
                for(let i=0; i<10; i++) {
                    const angle = time * 5 + i * Math.PI*2/10;
                    const r = baseDim * 0.2 + Math.sin(time*10+i)*10;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, 2, 0, Math.PI*2); ctx.fill();
                }

              }
              
              ctx.restore();
            };
            
            drawGuardianVisual(variant);
            
            // Guardian Aura
            const auraPulse = Math.sin(time * 10) * 0.2 + 0.8;
            ctx.globalCompositeOperation = 'screen';
            const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseDim * 1.5 * auraPulse);
            auraGrad.addColorStop(0, `${accent1}66`);
            auraGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(0, 0, baseDim * 1.5 * auraPulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';

            // Special Move (At peak)
            if (progress > 0.45 && progress < 0.55) {
               const peakAlpha = Math.sin((progress - 0.45) * 10 * Math.PI);
               ctx.save();
               ctx.globalAlpha = peakAlpha;
               ctx.globalCompositeOperation = 'screen';
               
               const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxDim);
               grad.addColorStop(0, accent1);
               grad.addColorStop(1, 'transparent');
               ctx.fillStyle = grad;
               ctx.beginPath();
               ctx.arc(0, 0, maxDim, 0, Math.PI * 2);
               ctx.fill();
               
               ctx.restore();
            }
            
            ctx.restore();
            
            // Final Shockwave
            if (progress > 0.8) {
              const shockProgress = (progress - 0.8) * 5;
              const shockRadius = shockProgress * maxDim * 1.5;
              const shockAlpha = 1 - shockProgress;
              
              ctx.save();
              ctx.translate(special.x, special.y);
              ctx.globalCompositeOperation = 'screen';
              ctx.globalAlpha = shockAlpha;
              
              // Inner blast
              ctx.beginPath();
              ctx.arc(0, 0, shockRadius * 0.8, 0, Math.PI * 2);
              ctx.fillStyle = accent2;
              ctx.fill();

              // Outer ring
              ctx.beginPath();
              ctx.arc(0, 0, shockRadius, 0, Math.PI * 2);
              ctx.strokeStyle = accent1;
              ctx.lineWidth = 100 * shockAlpha;
              ctx.stroke();
              
              // Rays
              for (let i=0; i<24; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                const angle = i * Math.PI / 12 + time;
                ctx.lineTo(Math.cos(angle) * shockRadius * 1.2, Math.sin(angle) * shockRadius * 1.2);
                ctx.strokeStyle = accent3;
                ctx.lineWidth = 20 * shockAlpha;
                ctx.stroke();
              }
              
              ctx.restore();
              
              // Push particles
              const particles = particlesRef.current;
              for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const dx = p.x - special.x;
                const dy = p.y - special.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (Math.abs(dist - shockRadius) < 200) {
                  const pushForce = (1 - Math.abs(dist - shockRadius) / 200) * 40 * shockAlpha;
                  p.vx += (dx / dist) * pushForce;
                  p.vy += (dy / dist) * pushForce;
                  p.size = Math.max(p.size, p.size + 5 * shockAlpha);
                }
              }
            }
          }
        } else if (special.type === 'virus') {
          if (elapsed > special.duration) {
            special.active = false;
          } else {
            const progress = Math.max(0, Math.min(1, elapsed / special.duration));
            const easeProgress = 1 - Math.pow(1 - progress, 4); // Quartic ease out for smoother expansion
            const cw = canvas.width;
            const ch = canvas.height;
            const maxDim = Math.max(cw, ch);
            const infectionRadius = easeProgress * maxDim * 1.5;
            
            ctx.save();
            ctx.translate(special.x, special.y);
            
            // Screen shake effect for virus
            let shakeX = 0;
            let shakeY = 0;
            if (progress < 0.1) {
              const shakeIntensity = (0.1 - progress) * 100;
              shakeX = (Math.random() - 0.5) * shakeIntensity;
              shakeY = (Math.random() - 0.5) * shakeIntensity;
            } else if (progress > 0.9) {
              const shakeIntensity = (progress - 0.9) * 150;
              shakeX = (Math.random() - 0.5) * shakeIntensity;
              shakeY = (Math.random() - 0.5) * shakeIntensity;
            }
            ctx.translate(shakeX, shakeY);

            // Draw Virus Visuals based on variant
            const drawVirusVisual = (v: number) => {
              ctx.save();
              if (v === 1) { // Violet: Void Corruption
                // Deep void background
                ctx.fillStyle = `rgba(10, 0, 20, ${0.8 * easeProgress})`;
                ctx.beginPath(); ctx.arc(0, 0, infectionRadius, 0, Math.PI * 2); ctx.fill();
                
                // Swirling dark matter tendrils
                for(let j=0; j<3; j++) {
                    ctx.save();
                    ctx.rotate(time * (j%2===0?1:-1) * 0.5);
                    ctx.strokeStyle = `rgba(0, 0, 0, ${0.8 - j*0.2})`;
                    ctx.lineWidth = 20 - j*5;
                    ctx.lineCap = 'round';
                    for (let i = 0; i < 24; i++) {
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        const angle = i * Math.PI / 12 + Math.sin(time + i) * 0.5;
                        const r = infectionRadius * (0.8 + Math.sin(i * 3 + time*2) * 0.2);
                        ctx.quadraticCurveTo(
                            Math.cos(angle + 1) * r * 0.5, Math.sin(angle + 1) * r * 0.5,
                            Math.cos(angle) * r, Math.sin(angle) * r
                        );
                        ctx.stroke();
                    }
                    ctx.restore();
                }
                
                // Void Lightning
                ctx.strokeStyle = '#aa00ff';
                ctx.lineWidth = 3;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#aa00ff';
                for(let i=0; i<5; i++) {
                    ctx.beginPath();
                    ctx.moveTo(0,0);
                    let lx=0, ly=0;
                    const baseAngle = Math.random() * Math.PI * 2;
                    for(let k=0; k<10; k++) {
                        lx += Math.cos(baseAngle + (Math.random()-0.5)) * (infectionRadius/10);
                        ly += Math.sin(baseAngle + (Math.random()-0.5)) * (infectionRadius/10);
                        ctx.lineTo(lx, ly);
                    }
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
                
                // Glowing core
                const coreGrad = ctx.createRadialGradient(0,0,0, 0,0, infectionRadius * 0.3);
                coreGrad.addColorStop(0, '#000000');
                coreGrad.addColorStop(0.5, accent1);
                coreGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = coreGrad;
                ctx.beginPath(); ctx.arc(0, 0, infectionRadius * 0.3, 0, Math.PI*2); ctx.fill();
                
                // Event Horizon Distortion
                ctx.strokeStyle = 'rgba(150, 0, 255, 0.4)';
                ctx.lineWidth = 2;
                for(let i=1; i<=5; i++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, infectionRadius * (i/5) * (0.8 + Math.sin(time*3+i)*0.1), 0, Math.PI*2);
                    ctx.stroke();
                }
                
                // Floating Runes
                ctx.font = '20px serif';
                ctx.fillStyle = '#aa00ff';
                for(let i=0; i<12; i++) {
                    const angle = i * Math.PI/6 - time*0.5;
                    const r = infectionRadius * 0.6;
                    ctx.fillText(String.fromCharCode(0x16A0 + (i%20)), Math.cos(angle)*r, Math.sin(angle)*r);
                }
                
                // Accretion Disk
                ctx.save();
                ctx.scale(1, 0.3);
                ctx.rotate(time);
                const accGrad = ctx.createRadialGradient(0,0,infectionRadius*0.2, 0,0,infectionRadius*0.8);
                accGrad.addColorStop(0, 'rgba(200, 0, 255, 0.8)');
                accGrad.addColorStop(0.5, 'rgba(100, 0, 255, 0.4)');
                accGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = accGrad;
                ctx.beginPath(); ctx.arc(0,0,infectionRadius*0.8, 0, Math.PI*2); ctx.fill();
                ctx.restore();
                
                // Spaghettification Lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;
                for(let i=0; i<20; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r1 = infectionRadius * (0.2 + Math.random()*0.8);
                    const r2 = r1 - (Math.random() * 50 + 20);
                    ctx.beginPath(); ctx.moveTo(Math.cos(angle)*r1, Math.sin(angle)*r1); ctx.lineTo(Math.cos(angle)*r2, Math.sin(angle)*r2); ctx.stroke();
                }
                
              } else if (v === 2) { // Solar: Plasma Virus
                // Intense corona
                const grad = ctx.createRadialGradient(0,0,0, 0,0, infectionRadius);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.2, '#ffaa00');
                grad.addColorStop(0.8, 'rgba(255, 68, 0, 0.5)');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(0, 0, infectionRadius, 0, Math.PI*2); ctx.fill();
                
                // Jagged plasma flares
                ctx.strokeStyle = '#ff4400';
                ctx.lineWidth = 12;
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ffaa00';
                for (let i = 0; i < 30; i++) {
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  let cx = 0, cy = 0;
                  for (let j = 1; j <= 6; j++) {
                    const angle = i * Math.PI / 15 + (Math.random() - 0.5) * 0.8;
                    const r = (infectionRadius / 6) * j;
                    cx += Math.cos(angle) * r;
                    cy += Math.sin(angle) * r;
                    ctx.lineTo(cx, cy);
                  }
                  ctx.stroke();
                }
                
                // Solar Prominences (Loops)
                ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
                ctx.lineWidth = 8;
                for(let i=0; i<8; i++) {
                    const angle = i * Math.PI/4 + time;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(angle)*infectionRadius*0.5, Math.sin(angle)*infectionRadius*0.5);
                    ctx.quadraticCurveTo(
                        Math.cos(angle+0.5)*infectionRadius*1.2, Math.sin(angle+0.5)*infectionRadius*1.2,
                        Math.cos(angle+1)*infectionRadius*0.5, Math.sin(angle+1)*infectionRadius*0.5
                    );
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
                
                // Sunspots
                ctx.fillStyle = '#330000';
                for(let i=0; i<8; i++) {
                    const angle = i * Math.PI/4 + time*0.2;
                    const r = infectionRadius * 0.4 * Math.sin(time+i);
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, 15 + Math.sin(time*5)*5, 0, Math.PI*2); ctx.fill();
                }
                
                // Coronal Mass Ejections
                ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
                for(let i=0; i<5; i++) {
                    const angle = i * Math.PI*2/5 + time*2;
                    ctx.beginPath();
                    ctx.arc(Math.cos(angle)*infectionRadius*0.8, Math.sin(angle)*infectionRadius*0.8, 30, 0, Math.PI*2);
                    ctx.fill();
                }
                
                // Magnetic Field Lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 2;
                for(let i=0; i<12; i++) {
                    const angle1 = i * Math.PI/6 + time*0.1;
                    const angle2 = angle1 + Math.PI/3;
                    const r = infectionRadius * 0.6;
                    ctx.beginPath(); ctx.moveTo(Math.cos(angle1)*r, Math.sin(angle1)*r);
                    ctx.quadraticCurveTo(Math.cos((angle1+angle2)/2)*r*1.5, Math.sin((angle1+angle2)/2)*r*1.5, Math.cos(angle2)*r, Math.sin(angle2)*r);
                    ctx.stroke();
                }
                
                // Solar Wind Particles
                ctx.fillStyle = '#ffffaa';
                for(let i=0; i<40; i++) {
                    const angle = (i * Math.PI*2/40) + time;
                    const r = (time * 200 + i*15) % infectionRadius;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, 2, 0, Math.PI*2); ctx.fill();
                }
                
              } else if (v === 3) { // Emerald: Parasitic Vine
                // Spore cloud background
                ctx.fillStyle = `rgba(0, 40, 0, ${0.6 * easeProgress})`;
                ctx.beginPath(); ctx.arc(0, 0, infectionRadius, 0, Math.PI*2); ctx.fill();
                
                // Massive intertwining roots
                ctx.lineCap = 'round';
                for (let i = 0; i < 16; i++) {
                  ctx.strokeStyle = i % 2 === 0 ? '#004400' : '#002200';
                  ctx.lineWidth = 25 - (i%3)*5;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  const angle = i * Math.PI / 8 + time * (i%2===0?0.2:-0.2);
                  const r = infectionRadius;
                  ctx.bezierCurveTo(
                    Math.cos(angle + 1.5) * r * 0.3, Math.sin(angle + 1.5) * r * 0.3,
                    Math.cos(angle - 1.5) * r * 0.6, Math.sin(angle - 1.5) * r * 0.6,
                    Math.cos(angle) * r, Math.sin(angle) * r
                  );
                  ctx.stroke();
                  
                  // Blooming toxic flowers
                  if (i % 2 === 0) {
                    ctx.fillStyle = '#00ff00';
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#00ff00';
                    for(let f=0; f<5; f++) {
                        const fAngle = f * Math.PI*2/5 + time;
                        ctx.beginPath();
                        ctx.ellipse(
                            Math.cos(angle) * r * 0.8 + Math.cos(fAngle)*20, 
                            Math.sin(angle) * r * 0.8 + Math.sin(fAngle)*20, 
                            15, 5, fAngle, 0, Math.PI*2
                        );
                        ctx.fill();
                    }
                    ctx.shadowBlur = 0;
                  }
                }
                
                // Toxic Gas Clouds
                ctx.fillStyle = 'rgba(100, 255, 50, 0.2)';
                for(let i=0; i<10; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * infectionRadius;
                    ctx.beginPath();
                    ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, Math.random()*100+50, 0, Math.PI*2);
                    ctx.fill();
                }
                
                // Swarming Insects
                ctx.fillStyle = '#000000';
                for(let i=0; i<40; i++) {
                    const angle = Math.random() * Math.PI*2 + time*5;
                    const r = Math.random() * infectionRadius;
                    ctx.fillRect(Math.cos(angle)*r, Math.sin(angle)*r, 3, 3);
                }
                
                // Pulsating Veins
                ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
                ctx.lineWidth = 4;
                for(let i=0; i<8; i++) {
                    ctx.beginPath();
                    ctx.moveTo(0,0);
                    const angle = i * Math.PI/4 + Math.sin(time)*0.2;
                    ctx.quadraticCurveTo(Math.cos(angle+0.5)*infectionRadius*0.5, Math.sin(angle+0.5)*infectionRadius*0.5, Math.cos(angle)*infectionRadius, Math.sin(angle)*infectionRadius);
                    ctx.stroke();
                }
                
                // Snapping Jaws/Flytraps
                ctx.fillStyle = '#005500';
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                for(let i=0; i<6; i++) {
                    const angle = i * Math.PI/3 - time*0.5;
                    const r = infectionRadius * 0.7;
                    const jawOpen = Math.abs(Math.sin(time*3 + i));
                    ctx.save();
                    ctx.translate(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.rotate(angle + Math.PI/2);
                    ctx.beginPath(); ctx.arc(0, 0, 20, -jawOpen, Math.PI + jawOpen); ctx.fill(); ctx.stroke();
                    ctx.beginPath(); ctx.arc(0, 0, 20, Math.PI - jawOpen, Math.PI*2 + jawOpen); ctx.fill(); ctx.stroke();
                    ctx.restore();
                }
                
                // Dripping Acid
                ctx.fillStyle = '#aaff00';
                for(let i=0; i<20; i++) {
                    const x = (Math.random() - 0.5) * infectionRadius * 1.5;
                    const y = ((time * 150 + i*30) % (infectionRadius*2)) - infectionRadius;
                    ctx.beginPath(); ctx.ellipse(x, y, 3, 8, 0, 0, Math.PI*2); ctx.fill();
                }
                
              } else if (v === 4) { // Glacier: Ice Plague
                // Freezing mist
                const grad = ctx.createRadialGradient(0,0,0, 0,0, infectionRadius);
                grad.addColorStop(0, 'rgba(255,255,255,0.8)');
                grad.addColorStop(0.5, 'rgba(100,200,255,0.4)');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(0, 0, infectionRadius, 0, Math.PI*2); ctx.fill();
                
                // Sharp fractal branches
                ctx.strokeStyle = 'rgba(200, 255, 255, 0.9)';
                ctx.lineWidth = 10;
                ctx.lineCap = 'square';
                for (let i = 0; i < 8; i++) {
                  const angle = i * Math.PI / 4 + time*0.1;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(Math.cos(angle) * infectionRadius, Math.sin(angle) * infectionRadius);
                  ctx.stroke();
                  
                  // Sub-branches
                  for (let j = 1; j < 6; j++) {
                    const d = infectionRadius * (j / 6);
                    const bx = Math.cos(angle) * d;
                    const by = Math.sin(angle) * d;
                    ctx.lineWidth = 8 - j;
                    ctx.beginPath();
                    ctx.moveTo(bx, by);
                    ctx.lineTo(bx + Math.cos(angle + 0.8) * d * 0.5, by + Math.sin(angle + 0.8) * d * 0.5);
                    ctx.moveTo(bx, by);
                    ctx.lineTo(bx + Math.cos(angle - 0.8) * d * 0.5, by + Math.sin(angle - 0.8) * d * 0.5);
                    ctx.stroke();
                  }
                }
                
                // Shattering Ice Shards
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                for(let i=0; i<30; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * infectionRadius;
                    ctx.save();
                    ctx.translate(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.rotate(Math.random() * Math.PI);
                    ctx.beginPath();
                    ctx.moveTo(0, -20);
                    ctx.lineTo(10, 20);
                    ctx.lineTo(-10, 20);
                    ctx.fill();
                    ctx.restore();
                }
                
                // Blizzard Wind Lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 2;
                for(let i=0; i<30; i++) {
                    const y = (Math.random()-0.5) * infectionRadius * 2;
                    const x = ((time * 500 + i*100) % (infectionRadius*2)) - infectionRadius;
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 50, y); ctx.stroke();
                }
                
                // Frozen Geometric Crystals
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 3;
                for(let i=0; i<6; i++) {
                    const angle = i * Math.PI/3 - time;
                    const r = infectionRadius * 0.5;
                    ctx.save();
                    ctx.translate(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.rotate(time*2);
                    ctx.strokeRect(-15, -15, 30, 30);
                    ctx.restore();
                }
                
                // Hailstorm
                ctx.fillStyle = '#ffffff';
                for(let i=0; i<50; i++) {
                    const x = (Math.random() - 0.5) * infectionRadius * 2;
                    const y = ((time * 300 + i*20) % (infectionRadius*2)) - infectionRadius;
                    ctx.beginPath(); ctx.arc(x, y, Math.random()*3+1, 0, Math.PI*2); ctx.fill();
                }
                
                // Cracking Ice Surface
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 1;
                for(let i=0; i<5; i++) {
                    ctx.beginPath();
                    let cx = 0, cy = 0;
                    const baseAngle = i * Math.PI*2/5;
                    ctx.moveTo(cx, cy);
                    for(let j=0; j<5; j++) {
                        cx += Math.cos(baseAngle + (Math.random()-0.5)) * (infectionRadius/5);
                        cy += Math.sin(baseAngle + (Math.random()-0.5)) * (infectionRadius/5);
                        ctx.lineTo(cx, cy);
                    }
                    ctx.stroke();
                }
                
              } else if (v === 5) { // Magma: Ash Blight
                // Lava pool
                ctx.fillStyle = `rgba(50, 0, 0, ${0.8 * easeProgress})`;
                ctx.beginPath(); ctx.arc(0, 0, infectionRadius, 0, Math.PI*2); ctx.fill();
                
                // Lava fissures
                ctx.strokeStyle = '#ff4400';
                ctx.lineWidth = 20;
                ctx.lineCap = 'round';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ff0000';
                for (let i = 0; i < 10; i++) {
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  let cx = 0, cy = 0;
                  for (let j = 1; j <= 5; j++) {
                    const angle = i * Math.PI / 5 + (j % 2 === 0 ? 0.5 : -0.5) + Math.sin(time)*0.2;
                    const r = (infectionRadius / 5) * j;
                    cx += Math.cos(angle) * r;
                    cy += Math.sin(angle) * r;
                    ctx.lineTo(cx, cy);
                  }
                  ctx.stroke();
                }
                ctx.shadowBlur = 0;
                
                // Volcanic bombs
                ctx.fillStyle = '#000000';
                for(let i=0; i<20; i++) {
                    const angle = i * Math.PI / 10 + time;
                    const r = infectionRadius * (0.3 + Math.random()*0.6);
                    ctx.beginPath();
                    ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, Math.random()*20+10, 0, Math.PI*2);
                    ctx.fill();
                }
                
                // Pyroclastic Smoke
                ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
                for(let i=0; i<15; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * infectionRadius;
                    ctx.beginPath();
                    ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, Math.random()*150+50, 0, Math.PI*2);
                    ctx.fill();
                }
                
                // Lava Bubbles
                ctx.strokeStyle = '#ffaa00';
                ctx.lineWidth = 3;
                for(let i=0; i<15; i++) {
                    const angle = i * Math.PI*2/15 + time*0.3;
                    const r = infectionRadius * 0.6 * Math.abs(Math.sin(time*0.5+i));
                    const bubbleRadius = (time*10 + i*5) % 30;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, Math.max(0, bubbleRadius), 0, Math.PI*2); ctx.stroke();
                }
                
                // Heat Distortion Waves
                ctx.strokeStyle = 'rgba(255, 50, 0, 0.2)';
                ctx.lineWidth = 10;
                for(let i=1; i<=4; i++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, Math.max(0, infectionRadius * (i/4) + Math.sin(time*10)*10), 0, Math.PI*2);
                    ctx.stroke();
                }
                
                // Obsidian Spikes
                ctx.fillStyle = '#111111';
                ctx.strokeStyle = '#ff4400';
                ctx.lineWidth = 1;
                for(let i=0; i<12; i++) {
                    const angle = i * Math.PI/6 + time*0.1;
                    const r = infectionRadius * 0.8;
                    ctx.save();
                    ctx.translate(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.rotate(angle + Math.PI/2);
                    ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(10, 10); ctx.lineTo(-10, 10); ctx.fill(); ctx.stroke();
                    ctx.restore();
                }
                
                // Lava Rivers
                ctx.strokeStyle = '#ffaa00';
                ctx.lineWidth = 8;
                ctx.lineCap = 'round';
                for(let i=0; i<3; i++) {
                    ctx.beginPath();
                    const startAngle = i * Math.PI*2/3 - time*0.2;
                    ctx.moveTo(Math.cos(startAngle)*infectionRadius*0.2, Math.sin(startAngle)*infectionRadius*0.2);
                    ctx.bezierCurveTo(
                        Math.cos(startAngle+1)*infectionRadius*0.5, Math.sin(startAngle+1)*infectionRadius*0.5,
                        Math.cos(startAngle-1)*infectionRadius*0.8, Math.sin(startAngle-1)*infectionRadius*0.8,
                        Math.cos(startAngle)*infectionRadius, Math.sin(startAngle)*infectionRadius
                    );
                    ctx.stroke();
                }
                
              } else if (v === 6) { // Celestial: Cosmic Horror
                // Dark matter void
                ctx.fillStyle = `rgba(0, 0, 0, ${0.9 * easeProgress})`;
                ctx.beginPath();
                ctx.arc(0, 0, infectionRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Swirling galaxies / rifts
                ctx.strokeStyle = '#ff00ff';
                ctx.lineWidth = 8;
                for (let i = 0; i < 24; i++) {
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  const angle = i * Math.PI / 12 + time * 1.5;
                  ctx.lineTo(Math.cos(angle) * infectionRadius, Math.sin(angle) * infectionRadius);
                  ctx.stroke();
                  
                  // Eldritch Eyes with blinking
                  const blink = Math.sin(time * 5 + i) > 0.8 ? 0.1 : 1;
                  ctx.fillStyle = '#ffffff';
                  ctx.beginPath();
                  ctx.ellipse(Math.cos(angle) * infectionRadius * 0.7, Math.sin(angle) * infectionRadius * 0.7, 25, 12 * blink, angle, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.fillStyle = '#ff0000';
                  ctx.beginPath();
                  ctx.arc(Math.cos(angle) * infectionRadius * 0.7, Math.sin(angle) * infectionRadius * 0.7, 6 * blink, 0, Math.PI * 2);
                  ctx.fill();
                }
                
                // Cosmic Web
                ctx.strokeStyle = 'rgba(100, 0, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for(let i=0; i<50; i++) {
                    const a1 = Math.random() * Math.PI * 2;
                    const r1 = Math.random() * infectionRadius;
                    const a2 = Math.random() * Math.PI * 2;
                    const r2 = Math.random() * infectionRadius;
                    ctx.moveTo(Math.cos(a1)*r1, Math.sin(a1)*r1);
                    ctx.lineTo(Math.cos(a2)*r2, Math.sin(a2)*r2);
                }
                ctx.stroke();
                
                // Nebula Dust Clouds
                for(let i=0; i<10; i++) {
                    ctx.fillStyle = i%2===0 ? 'rgba(100, 0, 255, 0.1)' : 'rgba(255, 0, 100, 0.1)';
                    const angle = i * Math.PI*2/10 + time*0.5;
                    const r = infectionRadius * 0.5;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, infectionRadius*0.4, 0, Math.PI*2); ctx.fill();
                }
                
                // Warping Constellations
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for(let i=0; i<15; i++) {
                    const angle = (i * Math.PI*2/15) + Math.sin(time+i)*0.5;
                    const r = infectionRadius * (0.4 + Math.sin(time*2+i)*0.2);
                    if(i===0) ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r);
                    else ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
                }
                ctx.closePath(); ctx.stroke();
                
                // Supernova Flashes
                if (Math.random() > 0.8) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * infectionRadius;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, Math.random()*40+10, 0, Math.PI*2); ctx.fill();
                }
                
                // Orbiting Planets
                for(let i=0; i<5; i++) {
                    const angle = time * (1 + i*0.5) + i;
                    const r = infectionRadius * (0.3 + i*0.15);
                    ctx.fillStyle = `hsl(${i*60}, 70%, 50%)`;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, 10 + i*2, 0, Math.PI*2); ctx.fill();
                    // Planet rings
                    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.ellipse(Math.cos(angle)*r, Math.sin(angle)*r, 20+i*4, 5+i, angle, 0, Math.PI*2); ctx.stroke();
                }
                
              } else if (v === 7 || v === 11) { // Cyberpunk: Malware Glitch
                // Red screen tear
                ctx.fillStyle = `rgba(255, 0, 0, ${0.4 * easeProgress})`;
                ctx.fillRect(-infectionRadius, -infectionRadius, infectionRadius * 2, infectionRadius * 2);
                
                // Glitch blocks
                for (let i = 0; i < 150 * easeProgress; i++) {
                  const x = (Math.random() - 0.5) * infectionRadius * 2;
                  const y = (Math.random() - 0.5) * infectionRadius * 2;
                  const w = Math.random() * 200 + 50;
                  const h = Math.random() * 40 + 5;
                  ctx.fillStyle = Math.random() > 0.5 ? '#ff0000' : '#000000';
                  ctx.globalAlpha = Math.random() * 0.8;
                  ctx.fillRect(x, y, w, h);
                }
                ctx.globalAlpha = 1;
                
                // Warning rings
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 15;
                ctx.setLineDash([50, 20, 10, 20]);
                ctx.beginPath(); ctx.arc(0, 0, infectionRadius * 0.8, 0, Math.PI*2); ctx.stroke();
                ctx.beginPath(); ctx.arc(0, 0, infectionRadius * 0.4, 0, Math.PI*2); ctx.stroke();
                ctx.setLineDash([]);
                
                // Hex Dump Overlay
                ctx.font = '14px monospace';
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.textAlign = 'left';
                for(let i=0; i<20; i++) {
                    let hex = '';
                    for(let j=0; j<8; j++) hex += Math.floor(Math.random()*256).toString(16).padStart(2, '0') + ' ';
                    ctx.fillText(`0x${(i*8).toString(16).padStart(4, '0')}: ${hex}`, -infectionRadius*0.8, -infectionRadius*0.8 + i*20);
                }
                
                // Warning Text
                ctx.font = 'bold 150px monospace';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (Math.random() > 0.1) {
                    ctx.fillText('SYSTEM FAILURE', (Math.random()-0.5)*20, (Math.random()-0.5)*20);
                    ctx.fillStyle = 'rgba(255,0,0,0.5)';
                    ctx.fillText('SYSTEM FAILURE', (Math.random()-0.5)*40, (Math.random()-0.5)*40);
                }
                
                // Scanlines
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                for(let i=-infectionRadius; i<infectionRadius; i+=10) {
                    const yOffset = (time * 100) % 10;
                    ctx.fillRect(-infectionRadius, i + yOffset, infectionRadius*2, 2);
                }
                
                // Barcode fragments
                ctx.fillStyle = '#ff0000';
                for(let i=0; i<5; i++) {
                    ctx.save();
                    ctx.translate((Math.random()-0.5)*infectionRadius, (Math.random()-0.5)*infectionRadius);
                    for(let j=0; j<10; j++) {
                        ctx.fillRect(j*8, 0, Math.random()*5+1, 40);
                    }
                    ctx.restore();
                }
                
                // BSOD Flashes
                if (Math.random() > 0.95) {
                    ctx.fillStyle = 'rgba(0, 0, 170, 0.8)';
                    ctx.fillRect(-infectionRadius, -infectionRadius, infectionRadius*2, infectionRadius*2);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '20px monospace';
                    ctx.fillText('*** STOP: 0x000000ED', 0, -50);
                    ctx.fillText('UNMOUNTABLE_BOOT_VOLUME', 0, 0);
                }
                
                // Data Streams
                ctx.fillStyle = '#00ff00';
                ctx.font = '12px monospace';
                for(let i=0; i<20; i++) {
                    const x = (i - 10) * (infectionRadius / 10);
                    const yOffset = (time * 300 + i*40) % (infectionRadius*2) - infectionRadius;
                    for(let j=0; j<10; j++) {
                        ctx.fillText(String.fromCharCode(0x30A0 + Math.random()*96), x, yOffset + j*12);
                    }
                }
                
              } else if (v === 8) { // Abyssal: Ink Flood
                // Massive ink cloud
                ctx.fillStyle = `rgba(0, 0, 0, ${0.95 * easeProgress})`;
                ctx.beginPath();
                for (let i = 0; i < 60; i++) {
                  const angle = i * Math.PI / 30;
                  const r = infectionRadius * (0.8 + Math.sin(time * 5 + i * 4) * 0.2);
                  if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                  else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                }
                ctx.closePath();
                ctx.fill();
                
                // Giant Tentacles
                ctx.strokeStyle = '#111111';
                ctx.lineWidth = 40;
                ctx.lineCap = 'round';
                for(let i=0; i<8; i++) {
                    ctx.beginPath();
                    ctx.moveTo(0,0);
                    const angle = i * Math.PI/4 + Math.sin(time*0.5)*0.2;
                    ctx.quadraticCurveTo(
                        Math.cos(angle+0.5)*infectionRadius*0.5, Math.sin(angle+0.5)*infectionRadius*0.5,
                        Math.cos(angle)*infectionRadius*0.9, Math.sin(angle)*infectionRadius*0.9
                    );
                    ctx.stroke();
                    // Suckers
                    ctx.fillStyle = '#220000';
                    for(let j=1; j<5; j++) {
                        ctx.beginPath();
                        ctx.arc(Math.cos(angle)*infectionRadius*0.2*j, Math.sin(angle)*infectionRadius*0.2*j, 10, 0, Math.PI*2);
                        ctx.fill();
                    }
                }
                
                // Bioluminescent lures / eyes
                ctx.fillStyle = '#ff0000';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ff0000';
                for (let i = 0; i < 20; i++) {
                  const angle = i * Math.PI / 10 + time * 0.5;
                  const r = infectionRadius * (0.4 + Math.sin(i)*0.3);
                  ctx.beginPath();
                  ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 15 + Math.sin(time*10+i)*5, 0, Math.PI * 2);
                  ctx.fill();
                }
                ctx.shadowBlur = 0;
                
                // Sonar Ripples
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                for(let i=0; i<3; i++) {
                    const r = (time * 100 + i * (infectionRadius/3)) % (infectionRadius || 1);
                    ctx.beginPath(); ctx.arc(0, 0, Math.max(0, r), 0, Math.PI*2); ctx.stroke();
                }
                
                // Deep Sea Parasites
                ctx.strokeStyle = '#ff0055';
                ctx.lineWidth = 3;
                for(let i=0; i<12; i++) {
                    const angle = i * Math.PI/6 + time*2;
                    const r = infectionRadius * 0.7;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.quadraticCurveTo(Math.cos(angle+0.2)*r*0.9, Math.sin(angle+0.2)*r*0.9, Math.cos(angle+0.4)*r, Math.sin(angle+0.4)*r);
                    ctx.stroke();
                }
                
                // Bioluminescent Plankton
                ctx.fillStyle = '#00ffff';
                for(let i=0; i<80; i++) {
                    const angle = Math.random() * Math.PI * 2 + time*0.1;
                    const r = Math.random() * infectionRadius;
                    ctx.globalAlpha = Math.random() * 0.8 + 0.2;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, Math.random()*2+1, 0, Math.PI*2); ctx.fill();
                }
                ctx.globalAlpha = 1;
                
                // Ghostly Leviathan Silhouettes
                ctx.strokeStyle = 'rgba(0, 50, 100, 0.4)';
                ctx.lineWidth = 15;
                ctx.lineCap = 'round';
                for(let i=0; i<2; i++) {
                    const angle = time * 0.2 + i*Math.PI;
                    const r = infectionRadius * 0.8;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.quadraticCurveTo(0, 0, Math.cos(angle+Math.PI*0.8)*r, Math.sin(angle+Math.PI*0.8)*r);
                    ctx.stroke();
                }
                
              } else if (v === 9) { // Easter: Sugar Rot
                // Neon syrup base
                ctx.fillStyle = `rgba(255, 20, 147, ${0.8 * easeProgress})`; // Deep pink
                for (let i = 0; i < 24; i++) {
                  const angle = i * Math.PI / 12;
                  const r = infectionRadius * 0.8;
                  ctx.beginPath();
                  ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, infectionRadius * 0.4, 0, Math.PI * 2);
                  ctx.fill();
                }
                
                // Melting Chocolate Drips
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.arc(0, 0, infectionRadius * 0.7, 0, Math.PI*2);
                for(let i=0; i<12; i++) {
                    const angle = i * Math.PI/6;
                    ctx.arc(Math.cos(angle)*infectionRadius*0.7, Math.sin(angle)*infectionRadius*0.7, infectionRadius*0.2, 0, Math.PI*2);
                }
                ctx.fill();
                
                // Lime green swirling center
                ctx.fillStyle = '#32cd32';
                ctx.beginPath();
                for(let i=0; i<10; i++) {
                    const angle = i * Math.PI / 5 + time*2;
                    ctx.arc(Math.cos(angle)*infectionRadius*0.4, Math.sin(angle)*infectionRadius*0.4, infectionRadius*0.3, 0, Math.PI*2);
                }
                ctx.fill();
                
                // Confetti explosions
                for(let i=0; i<50; i++) {
                    ctx.fillStyle = ['#ffff00', '#00ffff', '#ff00ff'][i%3];
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * infectionRadius;
                    ctx.save();
                    ctx.translate(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.rotate(time * 10 + i);
                    ctx.fillRect(-10, -10, 20, 20);
                    ctx.restore();
                }
                
                // Gummy Worms
                ctx.lineWidth = 15;
                ctx.lineCap = 'round';
                for(let i=0; i<8; i++) {
                    ctx.strokeStyle = i%2===0 ? '#ffaa00' : '#00aaff';
                    const angle = i * Math.PI/4 + time;
                    const r = infectionRadius * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.quadraticCurveTo(Math.cos(angle+0.5)*r*1.2, Math.sin(angle+0.5)*r*1.2, Math.cos(angle+1)*r, Math.sin(angle+1)*r);
                    ctx.stroke();
                }
                
                // Hard Candy Shards
                for(let i=0; i<15; i++) {
                    ctx.fillStyle = `hsl(${i*24}, 100%, 50%)`;
                    const angle = i * Math.PI*2/15 - time*1.5;
                    const r = infectionRadius * 0.8;
                    ctx.save();
                    ctx.translate(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.rotate(time*3 + i);
                    ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(10, 10); ctx.lineTo(-10, 10); ctx.fill();
                    ctx.restore();
                }
                
                // Bouncing Jawbreakers
                for(let i=0; i<8; i++) {
                    const angle = i * Math.PI/4 + time;
                    const r = infectionRadius * 0.6 * Math.abs(Math.sin(time*3 + i));
                    ctx.fillStyle = `hsl(${i*45}, 100%, 60%)`;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, 15, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r - 4, Math.sin(angle)*r - 4, 4, 0, Math.PI*2); ctx.fill();
                }
                
                // Cotton Candy Clouds
                ctx.fillStyle = 'rgba(255, 150, 200, 0.4)';
                for(let i=0; i<5; i++) {
                    const angle = i * Math.PI*2/5 - time*0.5;
                    const r = infectionRadius * 0.7;
                    ctx.beginPath();
                    ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, 40, 0, Math.PI*2);
                    ctx.arc(Math.cos(angle)*r + 20, Math.sin(angle)*r - 20, 30, 0, Math.PI*2);
                    ctx.arc(Math.cos(angle)*r - 20, Math.sin(angle)*r - 10, 35, 0, Math.PI*2);
                    ctx.fill();
                }
                
              } else if (v === 10) { // Matrix: Red Pill Override
                // Red tint
                ctx.fillStyle = `rgba(50, 0, 0, ${0.7 * easeProgress})`;
                ctx.beginPath(); ctx.arc(0, 0, infectionRadius, 0, Math.PI*2); ctx.fill();
                
                // Red wireframe geometry
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 4;
                for(let r = 1; r <= 4; r++) {
                    ctx.beginPath();
                    for(let i=0; i<8; i++) {
                        const angle = i * Math.PI / 4 + time * (r%2===0?0.5:-0.5);
                        const radius = infectionRadius * 0.25 * r;
                        if(i===0) ctx.moveTo(Math.cos(angle)*radius, Math.sin(angle)*radius);
                        else ctx.lineTo(Math.cos(angle)*radius, Math.sin(angle)*radius);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
                
                // Red code rings
                ctx.font = 'bold 24px monospace';
                ctx.fillStyle = '#ff0000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for(let r = 1; r <= 5; r++) {
                    const radius = infectionRadius * 0.2 * r;
                    const chars = Math.floor(radius * Math.PI * 2 / 30);
                    for(let i=0; i<chars; i++) {
                        const angle = (i / chars) * Math.PI * 2 + (r%2===0?time:-time);
                        ctx.fillText(Math.random()>0.5?'1':'0', Math.cos(angle)*radius, Math.sin(angle)*radius);
                    }
                }
                
                // Red Grid Floor
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for(let i=-10; i<=10; i++) {
                    ctx.moveTo(-infectionRadius, i*40);
                    ctx.lineTo(infectionRadius, i*40);
                    ctx.moveTo(i*40, -infectionRadius);
                    ctx.lineTo(i*40, infectionRadius);
                }
                ctx.stroke();
                
                // Corrupted Agent Silhouettes
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                for(let i=0; i<5; i++) {
                    const angle = i * Math.PI*2/5 + time*0.5;
                    const r = infectionRadius * 0.6;
                    ctx.save();
                    ctx.translate(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.fillRect(-20, -50, 40, 100); // Body
                    ctx.beginPath(); ctx.arc(0, -70, 20, 0, Math.PI*2); ctx.fill(); // Head
                    // Red glowing eyes
                    ctx.fillStyle = '#ff0000';
                    ctx.beginPath(); ctx.arc(-8, -75, 3, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(8, -75, 3, 0, Math.PI*2); ctx.fill();
                    ctx.restore();
                }
                
                // Falling Red Code Columns
                ctx.fillStyle = '#ff0000';
                ctx.font = '16px monospace';
                for(let i=-10; i<=10; i++) {
                    const x = i * 40;
                    const yOffset = (time * 200 + i*50) % (infectionRadius*2) - infectionRadius;
                    for(let j=0; j<5; j++) {
                        ctx.fillText(Math.random()>0.5?'1':'0', x, yOffset + j*20);
                    }
                }
                
                // Glitching Sentinels
                ctx.strokeStyle = '#550000';
                ctx.lineWidth = 3;
                for(let i=0; i<6; i++) {
                    const angle = i * Math.PI/3 - time*2;
                    const r = infectionRadius * 0.8;
                    ctx.beginPath();
                    ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, 15, 0, Math.PI*2);
                    ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.lineTo(Math.cos(angle-0.2)*r*1.2, Math.sin(angle-0.2)*r*1.2);
                    ctx.stroke();
                }
                
                // "Wake Up" Text
                ctx.fillStyle = `rgba(255, 0, 0, ${Math.abs(Math.sin(time*2))})`;
                ctx.font = 'bold 40px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('WAKE UP', 0, -infectionRadius*0.5);
                
                // Green Code Corruption (fighting back)
                ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
                ctx.font = '14px monospace';
                for(let i=0; i<30; i++) {
                    const x = (Math.random() - 0.5) * infectionRadius * 2;
                    const y = (Math.random() - 0.5) * infectionRadius * 2;
                    ctx.fillText(String.fromCharCode(0x30A0 + Math.random()*96), x, y);
                }
                
              } else { // Default
                ctx.strokeStyle = accent1;
                ctx.lineWidth = 25;
                ctx.beginPath();
                ctx.arc(0, 0, infectionRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = `rgba(0,0,0,${0.8 * easeProgress})`;
                ctx.fill();
                
                for(let i=0; i<8; i++) {
                    ctx.beginPath();
                    ctx.moveTo(0,0);
                    const angle = i * Math.PI/4 + time;
                    ctx.lineTo(Math.cos(angle)*infectionRadius, Math.sin(angle)*infectionRadius);
                    ctx.stroke();
                }
                
                // Pulsing Inner Rings
                ctx.strokeStyle = accent2;
                ctx.lineWidth = 5;
                for(let i=1; i<=3; i++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, infectionRadius * (i/4) * (0.8 + Math.sin(time*5)*0.2), 0, Math.PI*2);
                    ctx.stroke();
                }
                
                // Geometric Overlay
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for(let i=0; i<6; i++) {
                    const angle = i * Math.PI/3 + time*0.5;
                    if(i===0) ctx.moveTo(Math.cos(angle)*infectionRadius, Math.sin(angle)*infectionRadius);
                    else ctx.lineTo(Math.cos(angle)*infectionRadius, Math.sin(angle)*infectionRadius);
                }
                ctx.closePath();
                ctx.stroke();
                
                // Digital Noise
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                for(let i=0; i<100; i++) {
                    const angle = Math.random() * Math.PI*2;
                    const r = Math.random() * infectionRadius;
                    ctx.fillRect(Math.cos(angle)*r, Math.sin(angle)*r, 2, 2);
                }
                
                // Fractal Triangles
                ctx.strokeStyle = accent3;
                ctx.lineWidth = 2;
                for(let i=0; i<3; i++) {
                    const angle = time + i*Math.PI*2/3;
                    const r = infectionRadius * 0.6;
                    ctx.save();
                    ctx.translate(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.rotate(time*2);
                    ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(25, 20); ctx.lineTo(-25, 20); ctx.closePath(); ctx.stroke();
                    ctx.restore();
                }
                
                // Pulsing Hexagon Grid
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1;
                const hexSize = 30;
                for(let x = -infectionRadius; x < infectionRadius; x += hexSize*1.5) {
                    for(let y = -infectionRadius; y < infectionRadius; y += hexSize*Math.sqrt(3)) {
                        const offset = (Math.abs(x/hexSize/1.5) % 2 === 1) ? hexSize*Math.sqrt(3)/2 : 0;
                        if (x*x + (y+offset)*(y+offset) < infectionRadius*infectionRadius) {
                            ctx.beginPath();
                            for(let i=0; i<6; i++) {
                                const angle = i * Math.PI/3;
                                const hx = x + Math.cos(angle)*hexSize;
                                const hy = y + offset + Math.sin(angle)*hexSize;
                                if(i===0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
                            }
                            ctx.closePath(); ctx.stroke();
                        }
                    }
                }
                
                // Orbiting Data Nodes
                ctx.fillStyle = accent1;
                ctx.strokeStyle = accent2;
                ctx.lineWidth = 2;
                for(let i=0; i<8; i++) {
                    const angle = i * Math.PI/4 - time;
                    const r = infectionRadius * 0.8;
                    ctx.beginPath(); ctx.arc(Math.cos(angle)*r, Math.sin(angle)*r, 8, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r);
                    ctx.lineTo(Math.cos(angle+Math.PI/4)*r, Math.sin(angle+Math.PI/4)*r); ctx.stroke();
                }
                
              }
              ctx.restore();
            };
            
            drawVirusVisual(variant);
            
            // Final Assimilation Flash
            if (progress > 0.9) {
                ctx.fillStyle = `rgba(255, 255, 255, ${(progress - 0.9) * 10})`;
                ctx.fillRect(-maxDim * 2, -maxDim * 2, maxDim * 4, maxDim * 4);
            }
            
            // Virus Aura
            ctx.globalCompositeOperation = 'screen';
            const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, infectionRadius * 1.2);
            auraGrad.addColorStop(0, `${accent1}88`);
            auraGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(0, 0, infectionRadius * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            
            ctx.restore();
          }
        }
      }

      // Draw Shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += sw.speed;
        sw.opacity -= 1 / (60 * sw.life);
        
        if (sw.opacity <= 0 || sw.radius > sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, Math.max(0, sw.radius), 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 10 * sw.opacity;
        ctx.globalAlpha = sw.opacity;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, Math.max(0, sw.radius * 0.8), 0, Math.PI * 2);
        ctx.lineWidth = 4 * sw.opacity;
        ctx.stroke();
        ctx.restore();
      }

      // Draw Screen Border Portal Effect (Removed as per user request)

      if (special.active && special.type === 'wormhole' && special.phase === 'open') {
        const elapsed = Date.now() - special.startTime;
        const progress = Math.max(0, Math.min(1, elapsed / special.duration));
        const easeProgress = Math.sin(progress * Math.PI);
        
        ctx.save();
        ctx.globalAlpha = easeProgress * 0.8;
        ctx.lineWidth = 15;
        ctx.strokeStyle = accent1;
        ctx.shadowBlur = 30;
        ctx.shadowColor = accent2;
        
        // Pulsing border
        const pulse = Math.sin(time * 10) * 5;
        ctx.strokeRect(pulse, pulse, canvas.width - pulse * 2, canvas.height - pulse * 2);
        
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(pulse, pulse, canvas.width - pulse * 2, canvas.height - pulse * 2);
        
        ctx.restore();
      }
      
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    const handleClick = (e: MouseEvent) => {
      if (view !== 'home') return; // Restrict spawning particles to home screen
    };

    window.addEventListener('resize', resize);
    window.addEventListener('click', handleClick);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant, view, uiCustomization?.particleCount, uiCustomization?.particleMaxSize]);

  const lines = useMemo(() => {
    const l = [];
    if (stars.length < 2) return l;

    for (let i = 1; i < stars.length; i++) {
      const s1 = stars[i - 1];
      const s2 = stars[i];
      
      const midX = (s1.x + s2.x) / 2;
      const midY = (s1.y + s2.y) / 2;
      
      const dx = s2.x - s1.x;
      const dy = s2.y - s1.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      
      const nx = -dy / dist;
      const ny = dx / dist;
      
      const offset1 = Math.min(dist * 0.2, 80);
      const offset2 = -Math.min(dist * 0.15, 60);
      
      const cx1 = midX + nx * offset1 + s1.rx;
      const cy1 = midY + ny * offset1 + s1.ry;
      
      const cx2 = midX + nx * offset2 - s2.rx;
      const cy2 = midY + ny * offset2 - s2.ry;

      const path1 = `M ${s1.x} ${s1.y} Q ${cx1} ${cy1} ${s2.x} ${s2.y}`;
      const path2 = `M ${s1.x} ${s1.y} Q ${cx2} ${cy2} ${s2.x} ${s2.y}`;

      l.push({
        id: `${s1.id}-${s2.id}`,
        path1,
        path2,
      });
    }

    // Link last star with the first one if there are more than 2 stars
    if (stars.length > 2) {
      const s1 = stars[stars.length - 1];
      const s2 = stars[0];
      
      const midX = (s1.x + s2.x) / 2;
      const midY = (s1.y + s2.y) / 2;
      
      const dx = s2.x - s1.x;
      const dy = s2.y - s1.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      
      const nx = -dy / dist;
      const ny = dx / dist;
      
      const offset1 = Math.min(dist * 0.2, 80);
      const offset2 = -Math.min(dist * 0.15, 60);
      
      const cx1 = midX + nx * offset1 + s1.rx;
      const cy1 = midY + ny * offset1 + s1.ry;
      
      const cx2 = midX + nx * offset2 - s2.rx;
      const cy2 = midY + ny * offset2 - s2.ry;

      const path1 = `M ${s1.x} ${s1.y} Q ${cx1} ${cy1} ${s2.x} ${s2.y}`;
      const path2 = `M ${s1.x} ${s1.y} Q ${cx2} ${cy2} ${s2.x} ${s2.y}`;

      l.push({
        id: `${s1.id}-${s2.id}-loop`,
        path1,
        path2,
      });
    }

    return l;
  }, [stars]);

  const getAnimationProps = useCallback((element: BackgroundShape | BackgroundOverlay) => {
    const animation = element.animation || 'none';
    if (animation === 'none' || uiCustomization?.performanceMode) return {};

    const speed = element.animationSpeed || 1;
    const duration = element.animationDuration || 2;
    const delay = element.animationDelay || 0;
    const rotation = element.rotation || 0;

    // Stable seed for randomness based on ID
    const getSeed = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    };
    const seed = getSeed(element.id);

    const baseTransition = {
      duration: duration / speed,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut" as const
    };

    switch (animation) {
      case 'hover':
        return {
          animate: { y: [0, -15, 0] },
          transition: baseTransition
        };
      case 'spin':
        return {
          animate: { rotate: [rotation, rotation + 360] },
          transition: { ...baseTransition, ease: "linear" as const }
        };
      case 'pulse':
        return {
          animate: { scale: [1, 1.1, 1] },
          transition: baseTransition
        };
      case 'float':
        return {
          animate: { 
            y: [0, -25, 0],
            x: [0, 15, 0],
            rotate: [rotation - 8, rotation + 8, rotation - 8]
          },
          transition: { 
            ...baseTransition, 
            duration: (duration * 2) / speed,
            ease: "easeInOut" as const
          }
        };
      case 'bounce':
        return {
          animate: { y: [0, -40, 0] },
          transition: { 
            ...baseTransition, 
            ease: "easeOut" as const,
            repeatType: "mirror" as const
          }
        };
      case 'shake':
        return {
          animate: { x: [0, -5, 5, -5, 5, 0] },
          transition: { ...baseTransition, duration: 0.5 / speed }
        };
      case 'swing':
        return {
          animate: { rotate: [rotation - 15, rotation + 15, rotation - 15] },
          transition: baseTransition
        };
      case 'slide':
        return {
          animate: { x: [-10, 10, -10] },
          transition: { ...baseTransition, duration: 3 / speed }
        };
      case 'zoom':
        return {
          animate: { scale: [0.9, 1.1, 0.9] },
          transition: { ...baseTransition, duration: 4 / speed }
        };
      case 'glitch':
        return {
          animate: { 
            x: [0, -2, 2, -1, 1, 0],
            opacity: [element.opacity, 0.5, element.opacity, 0.8, element.opacity]
          },
          transition: { 
            ...baseTransition, 
            duration: 0.2 / speed, 
            repeatDelay: (seed % 30) / 10 // Stable repeat delay between 0 and 3s
          }
        };
      default:
        return {};
    }
  }, [uiCustomization?.performanceMode]);

  const getWillChange = (animation: string) => {
    if (uiCustomization?.performanceMode) return 'auto';
    switch (animation) {
      case 'hover':
      case 'float':
      case 'bounce':
      case 'shake':
      case 'slide':
      case 'zoom':
      case 'pulse':
      case 'spin':
      case 'swing':
        return 'transform';
      case 'glitch':
        return 'transform, opacity';
      default:
        return 'auto';
    }
  };

  const isDark = uiCustomization?.dynamicBackgroundIntensity ? uiCustomization.dynamicBackgroundIntensity > 0.5 : true;

  const getBackgroundStyle = () => {
    if (!customTheme) return {};
    const config = customTheme.backgroundConfig;
    if (!config) return { backgroundColor: customTheme.backgroundColor };

    const styles: React.CSSProperties = { backgroundColor: config.backgroundColor };

    if (config.backgroundGradient?.enabled) {
      const { type, colors, angle } = config.backgroundGradient;
      if (type === 'linear') {
        styles.background = `linear-gradient(${angle}deg, ${colors.join(', ')})`;
      } else if (type === 'radial') {
        styles.background = `radial-gradient(circle, ${colors.join(', ')})`;
      } else if (type === 'conic') {
        styles.background = `conic-gradient(from ${angle}deg, ${colors.join(', ')})`;
      }
    }

    return styles;
  };

  const renderPattern = () => {
    if (!customTheme?.backgroundConfig?.pattern || customTheme.backgroundConfig.pattern.type === 'none') return null;
    const { type, color, opacity, size, thickness } = customTheme.backgroundConfig.pattern;
    
    let backgroundImage = '';
    let backgroundSize = `${size}px ${size}px`;

    switch (type) {
      case 'dots':
        backgroundImage = `radial-gradient(${color} ${thickness}px, transparent ${thickness}px)`;
        break;
      case 'grid':
        backgroundImage = `linear-gradient(${color} ${thickness}px, transparent ${thickness}px), linear-gradient(90deg, ${color} ${thickness}px, transparent ${thickness}px)`;
        break;
      case 'stripes':
        backgroundImage = `linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 50%, ${color} 50%, ${color} 75%, transparent 75%, transparent)`;
        backgroundSize = `${size}px ${size}px`;
        break;
      case 'waves':
        backgroundImage = `radial-gradient(circle at 100% 50%, transparent 20%, ${color} 21%, ${color} 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, ${color} 21%, ${color} 34%, transparent 35%, transparent)`;
        backgroundSize = `${size}px ${size * 2}px`;
        break;
      case 'zigzag':
        backgroundImage = `linear-gradient(135deg, ${color} 25%, transparent 25%), linear-gradient(225deg, ${color} 25%, transparent 25%), linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(315deg, ${color} 25%, transparent 25%)`;
        backgroundSize = `${size}px ${size}px`;
        break;
    }

    return (
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage,
          backgroundSize,
          opacity,
          zIndex: 1
        }}
      />
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[0] pointer-events-none overflow-hidden transition-colors duration-500"
      style={getBackgroundStyle()}
    >
      {/* Pattern Layer */}
      {renderPattern()}

      {/* Soul/Silk Bursts */}
      <AnimatePresence>
        {bursts.map(burst => (
          <motion.div
            key={burst.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 2, 3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute pointer-events-none z-[10]"
            style={{
              left: burst.x,
              top: burst.y,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: burst.color,
              boxShadow: `0 0 20px ${burst.color}`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </AnimatePresence>

      {/* Custom Background Config Rendering */}
      {customTheme?.backgroundConfig && (
        <CustomBackground config={customTheme.backgroundConfig} />
      )}

      {!customTheme?.backgroundConfig && (
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full"
        />
      )}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="ult-glow-bg" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {!customTheme?.backgroundConfig && (
          <>
            <AnimatePresence>
              {lines.map((line) => (
                <motion.path
                  key={line.id}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: 0.6,
                    d: [line.path1, line.path2, line.path1]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    pathLength: { duration: 0.5, ease: "easeOut" },
                    opacity: { duration: 0.5 },
                    d: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  stroke="var(--ult-accent-1)"
                  strokeWidth="2"
                  fill="none"
                  filter="url(#ult-glow-bg)"
                  strokeDasharray="6 6"
                />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {stars.map((star: any) => {
                const starSize = 14;
                const styles = getVariantStyles(star.variant || 1);
                const starPath = getStarPath(star.x, star.y, starSize, styles.shape);
                
                return (
                  <motion.g 
                    key={star.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    style={{ transformOrigin: `${star.x}px ${star.y}px` }}
                    transition={{ duration: 0.4, type: "spring" }}
                  >
                    <motion.g
                      animate={{ 
                        x: [0, star.rx * 0.3, 0, -star.rx * 0.3, 0],
                        y: [0, star.ry * 0.3, 0, -star.ry * 0.3, 0],
                        rotate: [0, 90, 180, 270, 360]
                      }}
                      transition={{ 
                        x: { duration: 3 + Math.random(), repeat: Infinity, ease: "easeInOut" },
                        y: { duration: 3.5 + Math.random(), repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 15 + Math.random() * 5, repeat: Infinity, ease: "linear" }
                      }}
                      style={{ transformOrigin: `${star.x}px ${star.y}px` }}
                    >
                      <motion.path
                        d={starPath}
                        fill={styles.accent2}
                        filter="url(#ult-glow-bg)"
                      />
                      <circle
                        cx={star.x}
                        cy={star.y}
                        r="3"
                        fill="var(--ult-text)"
                      />
                    </motion.g>
                    
                    <motion.circle
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      cx={star.x}
                      cy={star.y}
                      r="15"
                      stroke={styles.accent3}
                      strokeWidth="2"
                      fill="none"
                    />
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </>
        )}
      </svg>
    </div>
  );
});

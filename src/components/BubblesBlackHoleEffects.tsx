import React, { useEffect, useRef, useState } from 'react';
import { UICustomization } from '../types';

interface BubblesBlackHoleBackgroundProps {
  features?: UICustomization;
  accentColor?: string;
  isDark?: boolean;
  performanceMode?: boolean;
  settings?: any; // Will fix type in types.ts
}

export const BubblesBlackHoleBackground: React.FC<BubblesBlackHoleBackgroundProps> = ({
  features,
  accentColor,
  isDark,
  performanceMode,
  settings
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorBlobRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRealPos = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 500 });
  const isMagnetic = useRef(false);
  
  const [orbs, setOrbs] = useState<{ id: string; size: number; x: number; y: number; hueOffset: number; vx: number; vy: number; }[]>([]);
  const activeCollisions = useRef<Set<string>>(new Set());
  
  const hue = features?.bubblesHue ?? 280;
  const size = features?.bubblesSize ?? 150;
  const blur = features?.bubblesBlur ?? 15;
  const speed = features?.bubblesSpeed ?? 1;
  const orbCount = features?.bubblesOrbCount ?? 5;
  
  // Safe multiplier logic from user code
  const safeMultiplier = Math.max(0.01, speed);
  const animSpeed = `${(20 / safeMultiplier).toFixed(1)}s`;

  useEffect(() => {
    // Spawn Orbs
    const newOrbs = Array.from({ length: orbCount }).map((_, i) => {
      const orbSize = Math.max(20, Math.random() * 80);
      const hueOffset = i % 2 === 0 ? -30 : 45;
      
      const angle = Math.random() * Math.PI * 2;
      const speedPct = (1 + Math.random() * 3); // 1 to 4 scale
      
      return {
        id: `bubbles-orb-${i}`,
        size: orbSize,
        x: Math.random() * 100,
        y: Math.random() * 100,
        hueOffset,
        vx: Math.cos(angle) * speedPct,
        vy: Math.sin(angle) * speedPct,
      };
    });
    setOrbs(newOrbs);
  }, [orbCount]);

  useEffect(() => {
    if (!containerRef.current || !cursorBlobRef.current) return;

    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let targetX = cursorX;
    let targetY = cursorY;

    const handleMove = (x: number, y: number) => {
      targetX = x;
      targetY = y;
    };

    const handlePointerDown = () => { isMagnetic.current = true; };
    const handlePointerUp = () => { isMagnetic.current = false; };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onMouseLeave = () => {
      targetX = window.innerWidth / 2;
      targetY = window.innerHeight / 2;
      isMagnetic.current = false;
    };

    const container = containerRef.current;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchend", handlePointerUp);
    container.addEventListener("mouseleave", onMouseLeave);

    let animationFrameId: number;

    const animate = () => {
      if (!containerRef.current || !cursorBlobRef.current) return;

      cursorX += (targetX - cursorX) * 0.15;
      cursorY += (targetY - cursorY) * 0.15;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const padding = 20;
      const constrainedX = Math.max(padding, Math.min(cursorX, width - padding));
      const constrainedY = Math.max(padding, Math.min(cursorY, height - padding));

      cursorRealPos.current.x = constrainedX;
      cursorRealPos.current.y = constrainedY;

      cursorBlobRef.current.style.left = `${constrainedX}px`;
      cursorBlobRef.current.style.top = `${constrainedY}px`;

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchend", handlePointerUp);
      container.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    if (orbs.length === 0) return;

    const pushEnabled = features?.bubblesPushing ?? true;

    const orbStates = orbs.map(orb => ({
      el: document.getElementById(orb.id),
      x: orb.x,
      y: orb.y,
      vx: orb.vx * safeMultiplier,
      vy: orb.vy * safeMultiplier,
      orbSize: orb.size,
      pushVx: 0,
      pushVy: 0,
    }));

    let animationFrameId: number;
    let lastTime = performance.now();

    const interactiveRadius = Math.max(30, size * 0.6) / 2;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      orbStates.forEach(orbState => {
        if (!orbState.el) return;

        if (pushEnabled) {
          const px = (orbState.x * screenW) / 100;
          const py = (orbState.y * screenH) / 100;
          const dx = px - cursorRealPos.current.x;
          const dy = py - cursorRealPos.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (isMagnetic.current) {
            // Magnetic attraction: pull towards cursor with larger radius
            const pullPower = settings?.bubblesPullPower ?? 0;
            const pullRadius = interactiveRadius * 4 + orbState.orbSize;
            if (dist < pullRadius && dist > 2) {
              const force = (pullRadius - dist) / pullRadius;
              orbState.pushVx -= (dx / dist) * force * pullPower * dt;
              orbState.pushVy -= (dy / dist) * force * pullPower * dt;
            }
          } else {
            // Repulsion
            const pushPower = settings?.bubblesPushPower ?? 400;
            const orbRadius = orbState.orbSize / 2;
            const pushRadius = interactiveRadius + orbRadius;
            
            if (dist < pushRadius && dist > 1) {
              const force = (pushRadius - dist) / pushRadius;
              // Apply a strong push force when they start touching
              orbState.pushVx += (dx / dist) * force * pushPower * dt;
              orbState.pushVy += (dy / dist) * force * pushPower * dt;
            }
          }
        }
        
        orbState.pushVx *= 0.92;
        orbState.pushVy *= 0.92;

        const currentVx = (orbState.vx + orbState.pushVx);
        const currentVy = (orbState.vy + orbState.pushVy);

        orbState.x += currentVx * dt * 5;
        orbState.y += currentVy * dt * 5;

        // Portal effect: wrap around screen limits
        if (orbState.x > 110) orbState.x = -10;
        else if (orbState.x < -10) orbState.x = 110;

        if (orbState.y > 110) orbState.y = -10;
        else if (orbState.y < -10) orbState.y = 110;

        // Squish & Stretch
        const velocityMag = Math.sqrt(currentVx * currentVx + currentVy * currentVy);
        // Only apply stretch if moving fast enough to avoid jitter
        let stretch = 1;
        let squish = 1;
        let angle = 0;
        const squishPower = settings?.bubblesSquishPower ?? 0.02;
        
        if (velocityMag > 0.1) {
          angle = Math.atan2(currentVy, currentVx);
          stretch = 1 + Math.min(velocityMag * squishPower, 1.5); // cap stretching
          squish = 1 / stretch;
        }

        orbState.el.style.left = `${orbState.x}%`;
        orbState.el.style.top = `${orbState.y}%`;
        orbState.el.style.transform = `translate(-50%, -50%) rotate(${angle}rad) scale(${stretch}, ${squish})`;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [orbs, safeMultiplier, size, settings?.bubblesPullPower, settings?.bubblesPushPower, settings?.bubblesSquishPower]);

  // Micro-Particle Nebula Canvas
  useEffect(() => {
    if (performanceMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = settings?.bubblesMicroParticles ?? 200;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.5 + 0.1,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    let animationFrameId: number;

    const animateParticles = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx * safeMultiplier;
        p.y += p.vy * safeMultiplier;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animateParticles);
    };

    animateParticles();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [performanceMode, hue, safeMultiplier, settings?.bubblesMicroParticles]);

  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none z-[-15] transition-colors duration-500"
      style={{
        backgroundColor: '#05050a',
        backgroundImage: `radial-gradient(circle at 10% 20%, rgba(20, 10, 50, 0.5) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(10, 40, 40, 0.4) 0%, transparent 40%)`
      }}
    >
      {/* Micro-Particle Nebula */}
      {!performanceMode && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 opacity-60"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      <svg style={{ visibility: 'hidden', position: 'absolute' }} width="0" height="0" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" id="svg-blur" />
            <feColorMatrix in="blur" mode="matrix" values="
                    1 0 0 0 0  
                    0 1 0 0 0  
                    0 0 1 0 0  
                    0 0 0 25 -10" result="gooey-matrix" id="svg-matrix" />
            <feBlend in="SourceGraphic" in2="gooey-matrix" operator="atop" />
          </filter>
        </defs>
      </svg>
      
      <style>{`
        html body div.bubbles-artboard, html body .optimization-mode div.bubbles-artboard {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          filter: url("#gooey") !important;
          transform: translateZ(0); /* Hardware acceleration */
          will-change: filter;
        }
        html body div.bubbles-blob, html body .optimization-mode div.bubbles-blob {
          position: absolute;
          border-radius: 50%;
          transform-origin: center center;
          will-change: transform, left, top;
          transition: width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.3s;
          box-shadow: var(--orb-shadow) !important;
        }
        html body .bubbles-main-blob, html body .optimization-mode .bubbles-main-blob {
          width: max(50px, ${size}px);
          height: max(50px, ${size}px);
          background: hsl(${hue}, 80%, 60%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          --orb-shadow: 0 0 calc(${size}px * 0.4) hsl(${hue}, 80%, 50%);
          animation: bubbles-organic-movement ${animSpeed} ease-in-out infinite alternate;
        }
        html body .bubbles-interactive-blob, html body .optimization-mode .bubbles-interactive-blob {
          width: max(30px, calc(${size}px * 0.6));
          height: max(30px, calc(${size}px * 0.6));
          background: hsl(calc(${hue} + 40), 90%, 65%);
          transform: translate(-50%, -50%);
          pointer-events: none;
          --orb-shadow: 0 0 calc(${size}px * 0.2) hsl(calc(${hue} + 40), 90%, 50%);
        }
        @keyframes bubbles-organic-movement {
          0% { transform: translate(-50%, -50%) scale(1) translate(0, 0) rotate(0deg); }
          33% { transform: translate(-50%, -50%) scale(1.2) translate(15%, -15%) rotate(15deg); }
          66% { transform: translate(-50%, -50%) scale(0.8) translate(-15%, 15%) rotate(-10deg); }
          100% { transform: translate(-50%, -50%) scale(1.1) translate(5%, 10%) rotate(5deg); }
        }
      `}</style>
      
      <div className="bubbles-artboard" ref={containerRef} style={{ pointerEvents: 'none' }}>
        <div className="bubbles-blob bubbles-main-blob" />
        <div className="bubbles-blob bubbles-interactive-blob" ref={cursorBlobRef} />
        {orbs.map(orb => (
          <div
            key={orb.id}
            id={orb.id}
            className="bubbles-blob"
            style={{
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              background: `hsl(calc(${hue} + ${orb.hueOffset}), 80%, 60%)`,
              '--orb-shadow': `0 0 20px hsl(calc(${hue} + ${orb.hueOffset}), 80%, 50%)`
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};


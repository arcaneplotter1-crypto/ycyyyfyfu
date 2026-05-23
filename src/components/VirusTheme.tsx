import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const VirusBackground = ({ accentColor, isDark, performanceMode, optimizationMode, isActive = true }: { accentColor: string, isDark?: boolean, performanceMode?: boolean, optimizationMode?: boolean, isActive?: boolean }) => {
  if (performanceMode) return null;

  const getColors = () => {
    switch (accentColor) {
      case 'virus-marburg': return isDark ? { bg: 'bg-slate-950', grid: '#450a0a', border: 'border-red-600/30', glow: 'rgba(220,38,38,0.3)', virus: '#ef4444', cell: 'bg-red-500/20', cellBorder: 'border-red-400/30' } : { bg: 'bg-red-50', grid: '#fecdd3', border: 'border-red-300/50', glow: 'rgba(248,113,113,0.3)', virus: '#b91c1c', cell: 'bg-red-400/20', cellBorder: 'border-red-500/30' };
      case 'virus-rabies': return isDark ? { bg: 'bg-slate-950', grid: '#052e16', border: 'border-green-500/30', glow: 'rgba(34,197,94,0.3)', virus: '#22c55e', cell: 'bg-green-500/20', cellBorder: 'border-green-400/30' } : { bg: 'bg-lime-50', grid: '#d9f99d', border: 'border-lime-300/50', glow: 'rgba(163,230,53,0.3)', virus: '#4d7c0f', cell: 'bg-lime-400/20', cellBorder: 'border-lime-500/30' };
      case 'virus-hiv': return isDark ? { bg: 'bg-slate-950', grid: '#4a044e', border: 'border-fuchsia-500/30', glow: 'rgba(217,70,239,0.3)', virus: '#d946ef', cell: 'bg-fuchsia-500/20', cellBorder: 'border-fuchsia-400/30' } : { bg: 'bg-fuchsia-50', grid: '#fbcfe8', border: 'border-fuchsia-300/50', glow: 'rgba(232,121,249,0.3)', virus: '#a21caf', cell: 'bg-fuchsia-400/20', cellBorder: 'border-fuchsia-500/30' };
      case 'virus-smallpox': return isDark ? { bg: 'bg-slate-950', grid: '#451a03', border: 'border-amber-500/30', glow: 'rgba(245,158,11,0.3)', virus: '#f59e0b', cell: 'bg-amber-500/20', cellBorder: 'border-amber-400/30' } : { bg: 'bg-amber-50', grid: '#fde68a', border: 'border-amber-300/50', glow: 'rgba(251,191,36,0.3)', virus: '#b45309', cell: 'bg-amber-400/20', cellBorder: 'border-amber-500/30' };
      case 'virus-influenza': default: return isDark ? { bg: 'bg-slate-950', grid: '#083344', border: 'border-cyan-500/30', glow: 'rgba(6,182,212,0.3)', virus: '#06b6d4', cell: 'bg-cyan-500/20', cellBorder: 'border-cyan-400/30' } : { bg: 'bg-cyan-50', grid: '#cffafe', border: 'border-cyan-300/50', glow: 'rgba(34,211,238,0.3)', virus: '#0e7490', cell: 'bg-cyan-400/20', cellBorder: 'border-cyan-500/30' };
    }
  };

  const colors = getColors();

  return (
    <div className={`fixed inset-0 z-[-10] pointer-events-none overflow-hidden opacity-0 group-[.visual-virus]/virus:opacity-100 transition-opacity duration-500 ${colors.bg}`}>
      {/* Global Scanline Overlay */}
      <div className="absolute inset-0 z-50 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }} />

      {/* Vignette overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: `radial-gradient(circle at center, transparent 30%, ${isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.1)'} 100%)` }} />

      {isActive && (
        <>
          {isDark ? (
            // Tech lab grid with subtle animation
            <motion.div 
              className="absolute inset-0 opacity-30" 
              style={{ backgroundImage: `linear-gradient(${colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${colors.grid} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
              animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            // Organic visceral texture
            <motion.div 
              className="absolute inset-0 opacity-40" 
              style={{ backgroundImage: `radial-gradient(circle at 50% 50%, ${colors.grid} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${colors.grid} 0%, transparent 40%)` }} 
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", type: "tween" }}
            />
          )}

          {/* Biohazard Warning Tape (Top & Bottom) */}
          {isDark && (
            <>
              <div className="absolute top-0 left-0 right-0 h-2 sm:h-4 opacity-20 z-20" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${colors.virus}, ${colors.virus} 10px, transparent 10px, transparent 20px)` }} />
              <div className="absolute bottom-0 left-0 right-0 h-2 sm:h-4 opacity-20 z-20" style={{ backgroundImage: `repeating-linear-gradient(-45deg, ${colors.virus}, ${colors.virus} 10px, transparent 10px, transparent 20px)` }} />
            </>
          )}
          
          {/* Microscope circle with pulsing glow */}
          <motion.div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmin] h-[150vmin] sm:w-[200vmin] sm:h-[200vmin] rounded-full border-2 sm:border-4 ${colors.border}`} 
            animate={{ boxShadow: [`inset 0 0 40px ${colors.glow}`, `inset 0 0 100px ${colors.glow}`, `inset 0 0 40px ${colors.glow}`] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* 3D Virus Canvas inline optimized */}
          <div className="absolute inset-0 mix-blend-screen opacity-90 pointer-events-none flex items-center justify-center transition-opacity duration-1000">
            <Virus3DCanvas virusType={accentColor.replace('virus-', '')} color={colors.virus} isDark={isDark || false} optimizationMode={optimizationMode || false} isActive={isActive} />
          </div>
        </>
      )}
    </div>
  );
};

const Virus3DCanvas = ({ virusType, color, isDark, optimizationMode, isActive }: { virusType: string, color: string, isDark: boolean, optimizationMode: boolean, isActive: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 600;

    const updateSize = () => {
      if (!canvas) return;
      const minDim = Math.min(window.innerWidth, window.innerHeight);
      // Make it a lot bigger, e.g., 2.5x the min dimension
      const targetSize = Math.max(minDim * 2.5, 800);
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = targetSize * dpr;
      canvas.height = targetSize * dpr;
      
      canvas.style.width = `${targetSize}px`;
      canvas.style.height = `${targetSize}px`;
      
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      const scaleFactor = targetSize / 600;
      ctx.scale(scaleFactor, scaleFactor);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    let points: {x: number, y: number, z: number, type?: string, nx?: number, ny?: number, nz?: number}[] = [];
    let lines: {p1: number, p2: number}[] = [];

    // Generate 3D structures based on virus type
    const numPoints = optimizationMode ? 150 : 400;

    if (virusType === 'marburg') {
      // Filamentous, worm-like (U or 6 shape) with inner helical core
      const segments = optimizationMode ? 40 : 100;
      const radius = 15;
      for (let i = 0; i < segments; i++) {
        const t = i / segments;
        // Parametric curve for a tangled '6' shape
        const angle = t * Math.PI * 4;
        const r = 120 - t * 60;
        const cx = Math.cos(angle) * r;
        const cy = Math.sin(angle) * r;
        const cz = (t - 0.5) * 150 + Math.sin(t * Math.PI * 6) * 20;

        // Add points around the cross-section
        const crossSectionPoints = optimizationMode ? 4 : 7;
        for (let j = 0; j < crossSectionPoints; j++) {
          const a2 = (j / crossSectionPoints) * Math.PI * 2 + (t * Math.PI); // Twist along the tube
          points.push({
            x: cx + Math.cos(a2) * radius,
            y: cy + Math.sin(a2) * radius,
            z: cz + Math.cos(a2) * radius * 0.5,
            type: 'surface'
          });
        }
        
        // Add central core point
        points.push({ x: cx, y: cy, z: cz, type: 'core' });
        if (i > 0) {
          lines.push({ p1: points.length - 1, p2: points.length - 1 - crossSectionPoints - 1 });
        }
      }
    } else if (virusType === 'rabies') {
      // Bullet shape
      const rings = optimizationMode ? 15 : 25;
      const pointsPerRing = optimizationMode ? 10 : 20;
      const length = 150;
      const radius = 40;

      for (let i = 0; i <= rings; i++) {
        const t = i / rings;
        const z = (t - 0.5) * length;
        // Hemispherical top, flat bottom
        let r = radius;
        if (t > 0.8) {
          const ht = (t - 0.8) / 0.2; // 0 to 1
          r = radius * Math.sqrt(1 - ht * ht);
        }

        for (let j = 0; j < pointsPerRing; j++) {
          const angle = (j / pointsPerRing) * Math.PI * 2;
          points.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r,
            z: z,
            type: 'surface'
          });
        }
      }
      
      // Helical inner core typical of Rhabdoviridae
      const helixPoints = optimizationMode ? 40 : 80;
      for (let i = 0; i < helixPoints; i++) {
        const t = i / helixPoints;
        const z = (t - 0.5) * length * 0.8;
        const hr = radius * 0.5;
        const angle = t * Math.PI * 2 * 6; // 6 turns
        points.push({
          x: Math.cos(angle) * hr,
          y: Math.sin(angle) * hr,
          z: z,
          type: 'core'
        });
        if (i > 0) lines.push({ p1: points.length - 2, p2: points.length - 1 });
      }
    } else if (virusType === 'hiv' || virusType === 'influenza') {
      // Spherical with spikes
      const radius = 80;
      const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

      for (let i = 0; i < numPoints; i++) {
        const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
        const r = Math.sqrt(1 - y * y);
        const theta = phi * i;

        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;

        points.push({ x: x * radius, y: y * radius, z: z * radius, type: 'surface', nx: x, ny: y, nz: z });

        // Add spikes
        if (i % (virusType === 'hiv' ? 8 : 5) === 0) {
          if (virusType === 'hiv') {
            const spikeLength = 35;
            points.push({ x: x * (radius + spikeLength), y: y * (radius + spikeLength), z: z * (radius + spikeLength), type: 'spike-env' });
            lines.push({ p1: points.length - 2, p2: points.length - 1 });
          } else {
            // Influenza: distinct HA and NA spikes
            const isNA = i % 10 === 0;
            const spikeLength = isNA ? 20 : 30;
            points.push({ x: x * (radius + spikeLength), y: y * (radius + spikeLength), z: z * (radius + spikeLength), type: isNA ? 'spike-na' : 'spike-ha' });
            lines.push({ p1: points.length - 2, p2: points.length - 1 });
          }
        }
      }
      
      // Inner cores
      if (virusType === 'hiv') {
        // Conical capsid for HIV
        const corePoints = optimizationMode ? 30 : 60;
        for (let i = 0; i < corePoints; i++) {
          const t = i / corePoints;
          const z = (t - 0.5) * 80;
          const cr = (1 - t) * 25 + 5; // Tapering cone
          const angle = t * Math.PI * 15;
          points.push({
            x: Math.cos(angle) * cr,
            y: Math.sin(angle) * cr,
            z: z,
            type: 'core'
          });
          if (i > 0) lines.push({ p1: points.length - 2, p2: points.length - 1 });
        }
      } else {
        // Influenza: scattered segmented RNA inside
        for (let i = 0; i < 8; i++) {
          const ox = (Math.random() - 0.5) * 60;
          const oy = (Math.random() - 0.5) * 60;
          const oz = (Math.random() - 0.5) * 60;
          for (let j = 0; j < 5; j++) {
            points.push({ x: ox + j * 4, y: oy + Math.sin(j) * 4, z: oz + j * 4, type: 'core' });
            if (j > 0) lines.push({ p1: points.length - 2, p2: points.length - 1 });
          }
        }
      }
    } else if (virusType === 'smallpox') {
      // Brick/oval shape with complex surface
      const rings = optimizationMode ? 20 : 30;
      const pointsPerRing = optimizationMode ? 15 : 25;
      const rx = 90;
      const ry = 60;
      const rz = 60;

      for (let i = 0; i <= rings; i++) {
        const theta = (i / rings) * Math.PI; // 0 to PI
        for (let j = 0; j < pointsPerRing; j++) {
          const phi = (j / pointsPerRing) * Math.PI * 2; // 0 to 2PI
          
          // Slightly rectangular ellipsoid
          let x = Math.sin(theta) * Math.cos(phi);
          let y = Math.sin(theta) * Math.sin(phi);
          let z = Math.cos(theta);
          
          // Make it more brick-like by pushing points outward
          const power = 2.0; // More rectangular for upgraded look
          const norm = Math.pow(Math.pow(Math.abs(x), power) + Math.pow(Math.abs(y), power) + Math.pow(Math.abs(z), power), 1/power);
          x /= norm; y /= norm; z /= norm;

          // Add surface bumps and complex ridges typical of poxviruses
          const bump = Math.sin(theta * 12) * Math.cos(phi * 12) * 6;

          points.push({
            x: x * rx + x * bump,
            y: y * ry + y * bump,
            z: z * rz + z * bump,
            type: 'surface'
          });
        }
      }
      
      // Lateral bodies (dense cores on sides)
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          points.push({
            x: side * 50,
            y: Math.cos(angle) * 30,
            z: Math.sin(angle) * 30,
            type: 'core'
          });
          if (i > 0) lines.push({ p1: points.length - 2, p2: points.length - 1 });
        }
      }

      // Inner dumbbell core
      for(let i=0; i<40; i++) {
        const t = i/40;
        const cx = 0;
        const cy = 0;
        const cz = (t - 0.5) * 100;
        const radius = 15 + Math.sin(t * Math.PI * 2) * 10;
        const angle = t * Math.PI * 8;
        points.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: cz,
            type: 'core'
        });
        if (i > 0) lines.push({ p1: points.length - 2, p2: points.length - 1 });
      }
    }

    let angleX = 0;
    let angleY = 0;
    let time = 0;
    let animationFrameId: number;

    // Generate secondary orbiting particles (RNA/DNA fragments)
    const secondaryPoints: {x: number, y: number, z: number, speed: number, offset: number, size: number}[] = [];
    if (!optimizationMode) {
      // Add more ambient floating cellular debris directly to the canvas to replace the DOM divs
      for (let i = 0; i < 80; i++) {
        secondaryPoints.push({
          x: (Math.random() - 0.5) * 800,
          y: (Math.random() - 0.5) * 800,
          z: (Math.random() - 0.5) * 800,
          speed: Math.random() * 0.01 + 0.005,
          offset: Math.random() * Math.PI * 2,
          size: Math.random() * 2 + 0.5
        });
      }
      
      // Pre-calculate capsid web (O(N^2) but only once instead of every frame)
      const surfacePoints = points.map((p, i) => ({ ...p, originalIdx: i })).filter(p => p.type === 'surface');
      const thresholdSq = virusType === 'smallpox' ? 1200 : 800; // pre-square
      for (let i = 0; i < surfacePoints.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < surfacePoints.length; j++) {
          const p1 = surfacePoints[i];
          const p2 = surfacePoints[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const distSq = dx*dx + dy*dy + dz*dz;
          
          if (distSq < thresholdSq) {
            lines.push({p1: p1.originalIdx, p2: p2.originalIdx});
            connections++;
            if (connections > 6) break; // Limit density to maintain clean look and speed
          }
        }
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.05;
      angleX += 0.005;
      angleY += 0.007;

      // Pulsating effect
      const pulseScale = 1 + Math.sin(time * 0.5) * 0.05;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const projectedPoints = points.map((p, i) => {
        // Apply pulse
        let px = p.x * pulseScale;
        let py = p.y * pulseScale;
        let pz = p.z * pulseScale;

        // Rotate Y
        let x1 = px * cosY - pz * sinY;
        let z1 = pz * cosY + px * sinY;
        // Rotate X
        let y2 = py * cosX - z1 * sinX;
        let z2 = z1 * cosX + py * sinX;

        const focalLength = 300;
        const scale = focalLength / (focalLength + z2 + 200);

        return {
          idx: i,
          x: x1 * scale + width / 2,
          y: y2 * scale + height / 2,
          z: z2,
          scale,
          type: p.type
        };
      });

      const projectedSecondary = secondaryPoints.map((p, i) => {
        // Orbiting motion (make it a bit larger so it fills the screen more)
        let px = p.x * Math.cos(time * p.speed + p.offset) - p.z * Math.sin(time * p.speed + p.offset);
        let py = p.y + Math.sin(time * p.speed * 2 + p.offset) * 40;
        let pz = p.z * Math.cos(time * p.speed + p.offset) + p.x * Math.sin(time * p.speed + p.offset);

        // Rotate Y
        let x1 = px * cosY - pz * sinY;
        let z1 = pz * cosY + px * sinY;
        // Rotate X
        let y2 = py * cosX - z1 * sinX;
        let z2 = z1 * cosX + py * sinX;

        const focalLength = 300;
        const scale = focalLength / (focalLength + z2 + 200);

        return {
          idx: i + points.length, // Ensure unique idx
          x: x1 * scale + width / 2,
          y: y2 * scale + height / 2,
          z: z2,
          scale,
          type: 'secondary',
          size: p.size
        };
      });

      const allPoints = [...projectedPoints, ...projectedSecondary];

      // Sort by Z for proper depth rendering
      allPoints.sort((a, b) => b.z - a.z);

      // Draw lines (spikes and capsid web)
      ctx.lineWidth = 1;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      
      // We already calculated the capsid web connections in 'lines'.
      // Draw them together with the spikes!
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const p1 = projectedPoints[line.p1];
        const p2 = projectedPoints[line.p2];
        if (p1 && p2) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
      ctx.stroke();

      // Draw glowing core
      if (!optimizationMode) {
        const coreGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, 100 * pulseScale);
        coreGradient.addColorStop(0, `${color}40`); // 25% opacity
        coreGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGradient;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(width/2, height/2, 100 * pulseScale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw points
      allPoints.forEach(p => {
        // Depth of field: fade out points that are far away
        ctx.globalAlpha = Math.min(1, Math.max(0.05, (p.z + 250) / 500));
        
        ctx.beginPath();
        
        let r = p.type === 'spike' ? 3 * p.scale : 2 * p.scale;
        
        // Handle new upgraded specific spike types and cores
        if (p.type === 'spike-env') r = 3.5 * p.scale;
        if (p.type === 'spike-ha') r = 2.5 * p.scale;
        if (p.type === 'spike-na') r = 4.0 * p.scale;
        if (p.type === 'core') r = 1.5 * p.scale;
        
        if (virusType === 'smallpox' && p.type !== 'secondary') r = 2.5 * p.scale;
        if (virusType === 'marburg' && p.type !== 'secondary') r = 4 * p.scale;
        
        // Use custom sizing for secondary debris points
        if (p.type === 'secondary') {
          r = Math.max(((p as any).size || 2.0) * p.scale * 1.5, 0.5);
        }
        
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        
        if (p.type === 'core') {
          ctx.fillStyle = isDark ? '#ffffff' : '#000000';
        } else {
          ctx.fillStyle = p.type === 'secondary' ? (isDark ? '#ffffff' : color) : color;
        }
        
        // Add blur effect for depth of field
        if (!optimizationMode) {
          const blurAmount = Math.max(0, Math.abs(p.z) / 100 - 1);
          if (blurAmount > 0) {
            ctx.shadowBlur = blurAmount * 2;
            ctx.shadowColor = ctx.fillStyle;
          } else {
            ctx.shadowBlur = 0;
          }
        }

        ctx.fill();
        
        if (!isDark && p.type === 'surface') {
          // Organic mode: add a slight glowing core to points
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = ctx.globalAlpha * 0.5;
          ctx.fill();
        }
      });

      // Reset shadow
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
    };
  }, [virusType, color, isDark, optimizationMode]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
}

export const VirusClickEffect: React.FC<{ isDark: boolean, accentColor?: string }> = ({ isDark, accentColor = 'virus-marburg' }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const getColor = () => {
    switch (accentColor) {
      case 'virus-marburg': return '#dc2626';
      case 'virus-rabies': return '#22c55e';
      case 'virus-hiv': return '#d946ef';
      case 'virus-smallpox': return '#f59e0b';
      case 'virus-influenza': return '#06b6d4';
      default: return '#dc2626';
    }
  };

  const color = getColor();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Check if clicked element is a button or within a button
      const target = e.target as HTMLElement;
      const isButton = target.closest('button') || target.closest('[role="button"]');
      
      if (isButton) {
        const rect = isButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const newParticles: Particle[] = Array.from({ length: 6 }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / 6 + (Math.random() * 0.5 - 0.25);
          const speed = Math.random() * 60 + 30;
          return {
            id: Date.now() + i,
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 20, // Upward bias for "cough"
            size: Math.random() * 14 + 6,
            rotation: Math.random() * 360,
          };
        });

        setParticles(prev => [...prev, ...newParticles]);

        setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 800);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 0, rotate: p.rotation }}
            animate={{ 
              x: p.x + p.vx, 
              y: p.y + p.vy + 50, // Add gravity
              opacity: 0, 
              scale: Math.random() * 1.5 + 0.5,
              rotate: p.rotation + (Math.random() * 180 - 90)
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 + Math.random() * 0.3, ease: "easeOut" }}
            className="absolute"
            style={{ width: p.size, height: p.size, marginLeft: -p.size/2, marginTop: -p.size/2 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-lg" style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill={`${color}80`} stroke="none" />
              <path d="M12 6v2M12 16v2M6 12H4M20 12h-2M7.76 7.76l-1.42-1.42M17.66 17.66l-1.42-1.42M7.76 16.24l-1.42 1.42M17.66 6.34l-1.42 1.42" strokeWidth="3" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

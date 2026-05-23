import React, { useEffect, useRef, useState } from 'react';
import { UICustomization } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  isBurst?: boolean;
}

interface HollowKnightBackgroundEffectProps {
  variant: number; // 12 for HK, 13 for Silksong
  view: string;
  uiCustomization?: UICustomization;
}

const MAX_FILL = 500;

export const HollowKnightBackgroundEffect: React.FC<HollowKnightBackgroundEffectProps> = ({
  variant,
  view,
  uiCustomization
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vesselParticlesRef = useRef<Particle[]>([]);
  const burstParticlesRef = useRef<Particle[]>([]);
  const vesselFillRef = useRef<number>(0);
  const [shake, setShake] = useState(false);
  const shockwavesRef = useRef<{x: number, y: number, r: number, alpha: number}[]>([]);
  const slashesRef = useRef<{x: number, y: number, angle: number, life: number}[]>([]);
  const burstStateRef = useRef<{ active: boolean, time: number, type: 'hk' | 'silk' }>({ active: false, time: 0, type: 'hk' });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    let flashOpacity = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const render = () => {
      time += 0.016; // Approx 60fps step
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 0. Draw Platform (Scenic element)
      ctx.save();
      const platformY = canvas.height - 100;
      const isSilksong = variant === 13;
      
      // Draw hanging vines from ceiling
      ctx.strokeStyle = isSilksong ? '#2a0a0a' : '#151520';
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        const vx = (canvas.width / 12) * i + (Math.sin(time + i) * 50);
        const vlen = 150 + Math.sin(time * 0.5 + i) * 100;
        ctx.beginPath();
        ctx.moveTo(vx, 0);
        ctx.quadraticCurveTo(vx + Math.sin(time + i) * 30, vlen / 2, vx, vlen);
        ctx.stroke();
        // Leaves/Details on vines
        ctx.fillStyle = isSilksong ? '#441111' : '#223344';
        for (let j = 0; j < 3; j++) {
          const ly = (vlen / 3) * j + 20;
          ctx.beginPath();
          ctx.ellipse(vx + Math.sin(time + i + j) * 10, ly, 5, 8, Math.PI/4, 0, Math.PI*2);
          ctx.fill();
        }
      }

      // Draw a dark, ornate platform at the bottom
      ctx.fillStyle = isSilksong ? '#1a0505' : '#0a0a0f';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(0, platformY);
      // Add some jaggedness to the platform
      for (let x = 0; x <= canvas.width; x += 100) {
        ctx.lineTo(x + 50, platformY - 20 + Math.sin(x * 0.01) * 10);
        ctx.lineTo(x + 100, platformY);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.fill();
      
      // Platform rim
      ctx.strokeStyle = isSilksong ? '#441111' : '#223344';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Add some spikes/details on the platform
      ctx.fillStyle = isSilksong ? '#2a0a0a' : '#151520';
      for (let i = 0; i < 8; i++) {
        const px = (canvas.width / 8) * i + 50;
        ctx.beginPath();
        ctx.moveTo(px, platformY);
        ctx.lineTo(px + 20, platformY - 40);
        ctx.lineTo(px + 40, platformY);
        ctx.fill();
      }
      ctx.restore();

      const targetX = canvas.width / 2;
      const targetY = canvas.width < 640 ? 110 : 130; 
      const color = isSilksong ? '#ff3366' : '#ffffff';
      const darkColor = isSilksong ? '#880022' : '#445566';

      ctx.globalCompositeOperation = 'source-over';

      // 1. Draw Shockwaves
      shockwavesRef.current.forEach((sw, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = sw.alpha;
        ctx.stroke();
        ctx.restore();
        
        sw.r += 8;
        sw.alpha -= 0.03;
        if (sw.alpha <= 0) shockwavesRef.current.splice(i, 1);
      });

      // 1.1 Draw Slashes
      slashesRef.current.forEach((s, i) => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.beginPath();
        ctx.arc(0, 0, 40, -Math.PI/4, Math.PI/4);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.globalAlpha = s.life;
        ctx.stroke();
        
        // Inner glow
        ctx.strokeStyle = isSilksong ? '#ff3366' : '#88ccff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.restore();
        s.life -= 0.1;
        if (s.life <= 0) slashesRef.current.splice(i, 1);
      });

      // 2. Draw Vessel (Optimized, no shadowBlur)
      ctx.save();
      ctx.translate(targetX, targetY);
      
      const fillRatio = Math.min(1, vesselFillRef.current / MAX_FILL);
      const pulse = 1 + Math.sin(time * 3) * 0.03 * (1 + fillRatio);
      ctx.scale(pulse, pulse);

      if (isSilksong) {
        // Silksong Spool (Diamond shape with needle)
        // Needle through the center
        ctx.beginPath();
        ctx.moveTo(0, -65); ctx.lineTo(0, 65);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#e0e0e0';
        ctx.stroke();
        ctx.beginPath(); ctx.ellipse(0, -55, 2, 8, 0, 0, Math.PI*2); ctx.stroke(); // Needle eye
        
        // Spool body
        ctx.beginPath();
        ctx.moveTo(-25, -40); ctx.lineTo(25, -40);
        ctx.lineTo(15, -20); ctx.lineTo(15, 20);
        ctx.lineTo(25, 40); ctx.lineTo(-25, 40);
        ctx.lineTo(-15, 20); ctx.lineTo(-15, -20);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ff3366';
        ctx.stroke();

        // Fill (Silk wrapping)
        if (fillRatio > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(-25, 40 - (80 * fillRatio), 50, 80 * fillRatio);
          ctx.clip();
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          // Draw criss-crossing threads
          for(let i=0; i<50; i++) {
            const y1 = -40 + (i * 1.6);
            const y2 = -40 + ((i + 6) * 1.6);
            ctx.moveTo(-20, y1); ctx.lineTo(20, y2);
            ctx.moveTo(20, y1); ctx.lineTo(-20, y2);
          }
          ctx.globalAlpha = 0.9 + Math.sin(time * 15) * 0.1;
          ctx.stroke();
          ctx.restore();
        }
      } else {
        // Hollow Knight Soul Meter (Ornate Circle)
        ctx.beginPath();
        ctx.arc(0, 0, 45, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fill();
        
        // Ornate Rim
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#aabacc';
        ctx.stroke();
        
        // Top Notch
        ctx.beginPath(); ctx.moveTo(-10, -45); ctx.lineTo(10, -45); ctx.lineTo(0, -55); ctx.closePath(); ctx.fillStyle = '#aabacc'; ctx.fill();
        // Bottom Notch
        ctx.beginPath(); ctx.moveTo(-8, 45); ctx.lineTo(8, 45); ctx.lineTo(0, 52); ctx.closePath(); ctx.fillStyle = '#aabacc'; ctx.fill();

        // Inner Eye
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.strokeStyle = '#aabacc';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Fill (Liquid Soul)
        if (fillRatio > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(0, 0, 41, 0, Math.PI * 2);
          ctx.clip();
          
          const fillHeight = fillRatio * 82;
          const yBase = 41;
          
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.95;
          
          // Wavy top
          ctx.beginPath();
          ctx.moveTo(-45, yBase - fillHeight);
          for(let x = -45; x <= 45; x += 5) {
            ctx.lineTo(x, yBase - fillHeight + Math.sin(x * 0.1 + time * 5) * 4);
          }
          ctx.lineTo(45, yBase);
          ctx.lineTo(-45, yBase);
          ctx.closePath();
          ctx.fill();
          
          // Inner glow
          const grad = ctx.createRadialGradient(0, yBase - fillHeight/2, 0, 0, yBase - fillHeight/2, 40);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.6 + Math.sin(time * 8) * 0.2;
          ctx.fillRect(-45, yBase - fillHeight, 90, fillHeight);
          
          ctx.restore();
        }
      }
      ctx.restore();

      // 3. Draw Particles (Ultra-fast motion blur ellipses)
      ctx.globalCompositeOperation = 'screen';
      
      // Burst Particles
      for (let i = burstParticlesRef.current.length - 1; i >= 0; i--) {
        const p = burstParticlesRef.current[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.95; p.vy *= 0.95;
        p.life -= 0.02;
        
        if (p.life <= 0) { burstParticlesRef.current.splice(i, 1); continue; }
        
        const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        const angle = Math.atan2(p.vy, p.vx);
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, speed * 1.5 + p.size, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Absorption Particles
      for (let i = vesselParticlesRef.current.length - 1; i >= 0; i--) {
        const p = vesselParticlesRef.current[i];
        const dx = targetX - p.x;
        const dy = targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 30) {
          vesselFillRef.current += 3;
          vesselParticlesRef.current.splice(i, 1);
          continue;
        }

        const force = 1.2;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
        
        // Wavy turbulence
        p.vx += Math.sin(time * 10 + p.y) * 1.5;
        p.vy += Math.cos(time * 10 + p.x) * 1.5;

        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.005;

        if (p.life <= 0) {
          vesselParticlesRef.current.splice(i, 1);
          continue;
        }

        const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        const angle = Math.atan2(p.vy, p.vx);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.globalAlpha = p.life;
        
        // Glow core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.ellipse(0, 0, speed + p.size, p.size * 0.5, 0, 0, Math.PI * 2); ctx.fill();
        
        // Outer aura
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 0.5;
        ctx.beginPath(); ctx.ellipse(0, 0, speed * 2 + p.size * 2, p.size * 1.5, 0, 0, Math.PI * 2); ctx.fill();
        
        ctx.restore();
      }
      ctx.globalCompositeOperation = 'source-over';

      // 4. Burst Animation Logic
      if (vesselFillRef.current >= MAX_FILL && !burstStateRef.current.active) {
        burstStateRef.current = { active: true, time: 0, type: isSilksong ? 'silk' : 'hk' };
        setShake(true);
      }

      if (burstStateRef.current.active) {
        const b = burstStateRef.current;
        b.time += 0.016;

        ctx.save();

        if (b.type === 'hk') {
          // Hollow Knight: The Abyss Shriek / Void Eruption + Radiance Flash
          if (b.time < 0.6) {
            // Gathering Soul (Smoother easing)
            ctx.translate(targetX, targetY);
            const progress = Math.min(1, b.time / 0.6);
            const easeProgress = progress * (2 - progress); // Ease out
            
            ctx.fillStyle = `rgba(255, 255, 255, ${easeProgress})`;
            ctx.beginPath(); ctx.arc(0, 0, 45 + easeProgress * 30, 0, Math.PI*2); ctx.fill();
            
            // Soul Shockwave preview (Smoother)
            ctx.strokeStyle = `rgba(255, 255, 255, ${easeProgress * 0.6})`;
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0, 0, easeProgress * 250, 0, Math.PI*2); ctx.stroke();
            
            // Soul Vortex (Sucking in particles)
            for(let i=0; i<10; i++) {
              const ang = i * (Math.PI * 2 / 10) + time * 10;
              const dist = 300 * (1 - easeProgress);
              ctx.fillStyle = '#ffffff';
              ctx.beginPath(); ctx.arc(Math.cos(ang)*dist, Math.sin(ang)*dist, 5 * easeProgress, 0, Math.PI*2); ctx.fill();
            }
          } else if (b.time < 3.0) {
            const progress = (b.time - 0.6) / 2.4; // 0 to 1
            const easeProgress = Math.sin(progress * Math.PI);
            
            // Screen darkens (The Abyss)
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.95, easeProgress * 2)})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Void Heart / Shade Silhouette in center
            ctx.save();
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.scale(easeProgress, easeProgress);
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(0, 0, 100, 0, Math.PI*2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.ellipse(-30, -10, 15, 25, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(30, -10, 15, 25, 0, 0, Math.PI*2); ctx.fill();
            ctx.restore();

            // Void Particles rising (Smoother)
            ctx.fillStyle = '#000000';
            ctx.globalAlpha = easeProgress;
            for(let i=0; i<40; i++) {
              const px = (Math.sin(i * 123.45) * 0.5 + 0.5) * canvas.width;
              const py = canvas.height - ((progress * 1.8 + i * 0.02) % 1.0) * canvas.height;
              const size = (Math.sin(i * 987.65) * 0.5 + 0.5) * 12 + 4;
              ctx.fillRect(px, py, size, size);
            }
            ctx.globalAlpha = 1.0;

            // Void Tentacles rising from bottom (More segments, smoother)
            ctx.fillStyle = '#000000';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            for(let i=0; i<16; i++) {
               const startX = (canvas.width / 16) * i + (canvas.width / 32);
               const height = canvas.height * 1.1 * easeProgress * (0.7 + (i%4)*0.1);
               const sway = Math.sin(time * 5 + i) * 200;
               
               ctx.beginPath();
               ctx.moveTo(startX - 50, canvas.height);
               ctx.bezierCurveTo(startX + sway, canvas.height - height/3, startX - sway, canvas.height - 2*height/3, startX, canvas.height - height);
               ctx.bezierCurveTo(startX + sway, canvas.height - 2*height/3, startX - sway, canvas.height - height/3, startX + 50, canvas.height);
               ctx.fill();
               
               ctx.globalAlpha = 0.7;
               ctx.stroke();
               ctx.globalAlpha = 1.0;
            }
            
            // Dream Gate / Radiance Flash in center (More rays)
            if (progress > 0.15 && progress < 0.85) {
               const flashP = Math.sin(((progress - 0.15) / 0.7) * Math.PI);
               ctx.save();
               ctx.translate(canvas.width/2, canvas.height/2);
               
               // Infection Bubbles (Orange)
               ctx.fillStyle = '#ff9900';
               ctx.globalAlpha = flashP * 0.4;
               for(let k=0; k<12; k++) {
                 const ang = k * (Math.PI * 2 / 12) + time * 1.2;
                 const d = 250 * flashP + Math.sin(time * 6 + k) * 30;
                 ctx.beginPath(); ctx.arc(Math.cos(ang)*d, Math.sin(ang)*d, 15 * flashP, 0, Math.PI*2); ctx.fill();
               }

               ctx.rotate(time * 2);
               ctx.fillStyle = `rgba(255, 255, 255, ${flashP * 0.9})`;
               // Removed shadowBlur for performance
               for(let j=0; j<12; j++) {
                 ctx.beginPath();
                 ctx.moveTo(0, -50);
                 ctx.lineTo(40, -250 * flashP - 150);
                 ctx.lineTo(-40, -250 * flashP - 150);
                 ctx.fill();
                 ctx.rotate(Math.PI / 6);
               }
               ctx.restore();
            }
          } else {
            b.active = false;
            vesselFillRef.current = 0;
            setShake(false);
          }
        } else {
          // Silksong: Gossamer Storm / Full Screen Silk Bind
          if (b.time < 0.6) {
            // Spool spins wildly (Smoother)
            ctx.translate(targetX, targetY);
            const progress = Math.min(1, b.time / 0.6);
            const easeProgress = progress * (2 - progress);
            ctx.rotate(easeProgress * Math.PI * 16);
            ctx.fillStyle = `rgba(255, 51, 102, ${easeProgress})`;
            ctx.fillRect(-60, -80, 120, 160);
            
            // Silk threads gathering (Smoother)
            ctx.strokeStyle = '#ff3366';
            ctx.lineWidth = 3;
            for(let i=0; i<16; i++) {
              const ang = i * (Math.PI * 2 / 16) + time * 6;
              const d = 400 * (1 - easeProgress);
              ctx.beginPath(); ctx.moveTo(Math.cos(ang)*d, Math.sin(ang)*d); ctx.lineTo(0,0); ctx.stroke();
            }
          } else if (b.time < 3.0) {
            const progress = (b.time - 0.6) / 2.4;
            const easeProgress = Math.sin(progress * Math.PI);
            
            // Red flash background
            ctx.fillStyle = `rgba(120, 0, 30, ${easeProgress * 0.95})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Silk Spores (Golden embers, more dynamic)
            ctx.fillStyle = '#ffcc00';
            ctx.globalAlpha = easeProgress;
            for(let i=0; i<60; i++) {
              const px = (Math.cos(i * 456.78) * 0.5 + 0.5) * canvas.width + Math.cos(time * 2 + i) * 100;
              const py = (Math.sin(i * 123.45) * 0.5 + 0.5) * canvas.height + Math.sin(time * 2 + i) * 100;
              const size = (Math.sin(i * 789.01) * 0.5 + 0.5) * 8 + 3;
              ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI*2); ctx.fill();
            }

            // Massive Web covering screen (More detail, smoother)
            const cx = canvas.width/2;
            const cy = canvas.height/2;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.strokeStyle = '#ff3366';
            ctx.globalAlpha = easeProgress;
            
            // Web radials (Reduced count)
            ctx.lineWidth = 5;
            for(let i=0; i<16; i++) {
              ctx.beginPath();
              ctx.moveTo(0,0);
              ctx.lineTo(Math.cos(i*Math.PI/8)*2500, Math.sin(i*Math.PI/8)*2500);
              ctx.stroke();
            }
            
            // Web spirals (Reduced density)
            ctx.lineWidth = 3;
            for(let r=50; r<1500; r+=100) {
              ctx.beginPath();
              for(let i=0; i<=16; i++) {
                const angle = i*Math.PI/8 + (r * 0.0008) + time * 0.1;
                const x = Math.cos(angle)*r;
                const y = Math.sin(angle)*r;
                if(i===0) ctx.moveTo(x,y);
                else ctx.lineTo(x,y);
              }
              ctx.stroke();
            }
            
            // Giant Needle Strikes raining down (Reduced count, no shadowBlur)
            if (progress > 0.1 && progress < 0.9) {
               ctx.lineWidth = 14;
               ctx.strokeStyle = '#ffffff';
               
               // Draw multiple needles striking
               for(let n=0; n<5; n++) {
                 const strikeP = ((progress - 0.1) / 0.8 + (n * 0.2)) % 1.0;
                 const offsetX = (n - 2) * 600 + Math.sin(time * 3 + n) * 80;
                 const yPos = strikeP * 4000 - 2000;
                 
                 ctx.save();
                 ctx.translate(offsetX, yPos);
                 ctx.rotate(Math.PI / 12 * Math.sin(n * 2));
                 
                 ctx.beginPath(); 
                 ctx.moveTo(0, 0); 
                 ctx.lineTo(0, 800); 
                 ctx.stroke();
                 
                 // Needle eye
                 ctx.beginPath();
                 ctx.ellipse(0, 80, 6, 25, 0, 0, Math.PI*2);
                 ctx.stroke();
                 
                 // Silk Seal (Simplified)
                 if (strikeP > 0.48 && strikeP < 0.52) {
                   ctx.lineWidth = 2;
                   ctx.globalAlpha = 1 - Math.abs(strikeP - 0.5) * 50;
                   ctx.beginPath(); ctx.arc(0, 400, 120, 0, Math.PI*2); ctx.stroke();
                 }
                 ctx.restore();
               }
            }
            ctx.restore();
          } else {
            b.active = false;
            vesselFillRef.current = 0;
            setShake(false);
          }
        }
        ctx.restore();
      }

      // 5. Flash Effect
      if (flashOpacity > 0) {
        ctx.globalAlpha = flashOpacity * 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flashOpacity -= 0.05;
      }

      if (vesselFillRef.current > 0 && !burstStateRef.current.active) {
        vesselFillRef.current -= 0.1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleClick = (e: MouseEvent) => {
      if (view !== 'home') return;
      const isSilksong = variant === 13;
      const color = isSilksong ? '#ff3366' : '#88ccff';
      const particleCount = (uiCustomization && uiCustomization.performanceMode) ? 5 : 12;
      
      shockwavesRef.current.push({ x: e.clientX, y: e.clientY, r: 5, alpha: 0.6 });
      slashesRef.current.push({ x: e.clientX, y: e.clientY, angle: Math.random() * Math.PI * 2, life: 1.0 });
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 10 + 2;
        vesselParticlesRef.current.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 1.0, color: color, size: Math.random() * 3 + 1
        });
      }
      setShake(true);
      setTimeout(() => setShake(false), 100);
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
  }, [variant, view, uiCustomization?.performanceMode]);

  if (view !== 'home') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-10 transition-transform duration-200 ${shake ? 'scale-[1.01]' : 'scale-100'}`}
    />
  );
};

import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Menu, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw];

interface DustParticlesProps {
  active: boolean;
  color?: string;
  count?: number;
}

export const DustParticles: React.FC<DustParticlesProps> = ({ active, color = "rgba(255, 255, 255, 0.2)", count = 30 }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedY: Math.random() * 0.5 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      maxOpacity: Math.random() * 0.5 + 0.2
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, color, count]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
    />
  );
};

export const HollowKnightBackground: React.FC<{ active: boolean; accent?: string; performanceMode?: boolean; view?: string }> = ({ active, accent, performanceMode = false, view = 'home' }) => {
  if (!active) return null;
  const isSilksong = accent === 'hollow-knight-silksong';
  const particleColor = isSilksong ? "rgba(255, 120, 140, 0.3)" : "rgba(136, 204, 255, 0.3)";
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-[#0a0f18] overflow-hidden">
      {/* Rich Parallax Scene */}
      <HollowKnightScene isSilksong={isSilksong} performanceMode={performanceMode} view={view} />
      
      {/* Dust Particles */}
      <DustParticles active={active && view === 'home'} color={particleColor} count={performanceMode ? 20 : (isSilksong ? 50 : 40)} />
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)] pointer-events-none z-10" />
    </div>
  );
};

const HollowKnightScene: React.FC<{ isSilksong: boolean; performanceMode: boolean; view?: string }> = ({ isSilksong, performanceMode, view = 'home' }) => {
  if (performanceMode || view !== 'home') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isSilksong ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#4a0808] via-[#2a0505] to-[#120000]" />
            {/* Deep texture layer */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ff4d6d 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            <svg className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              {/* Back layers */}
              <path d="M-100,1000 L200,300 L450,1000 Z M300,1000 L600,150 L950,1000 Z M700,1000 L1000,400 L1300,1000 Z" fill="#4a1010" />
              {/* Mid layers */}
              <path d="M-50,1000 L300,500 L600,1000 Z M400,1000 L700,250 L1050,1000 Z M850,1000 L1100,600 L1300,1000 Z" fill="#6a1515" />
              {/* Front layers */}
              <path d="M100,1000 L400,700 L650,1000 Z M500,1000 L800,450 L1100,1000 Z" fill="#2a0505" />
              
              {/* Wire/string details (Silksong theme) */}
              <path d="M0,100 Q400,400 1000,200" fill="none" stroke="#ff4d6d" strokeWidth="6" opacity="0.4" />
              <path d="M0,250 Q700,600 1000,150" fill="none" stroke="#ffb9c6" strokeWidth="3" opacity="0.6" />
              <path d="M0,500 Q500,900 1000,400" fill="none" stroke="#ff4d6d" strokeWidth="8" opacity="0.3" />
              <path d="M0,750 Q300,1100 1000,600" fill="none" stroke="#ff8096" strokeWidth="4" opacity="0.5" />
              <path d="M0,900 Q800,1200 1000,850" fill="none" stroke="#ff1a40" strokeWidth="10" opacity="0.2" />

              {/* Glowing spores/bells */}
              <circle cx="250" cy="350" r="15" fill="#ffb9c6" opacity="0.8" />
              <circle cx="250" cy="350" r="40" fill="#ff4d6d" opacity="0.2" />
              <circle cx="750" cy="200" r="10" fill="#ffb9c6" opacity="0.6" />
              <circle cx="750" cy="200" r="30" fill="#ff4d6d" opacity="0.2" />
              <circle cx="850" cy="700" r="20" fill="#ffb9c6" opacity="0.7" />
              <circle cx="850" cy="700" r="60" fill="#ff4d6d" opacity="0.15" />
            </svg>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,200,50,0.08),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,100,100,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(255,50,80,0.15),transparent_70%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2a0505] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#ff4d6d]/20 to-transparent mix-blend-screen" />
            <div className="absolute top-0 left-0 right-0 h-[20%] bg-gradient-to-b from-[#120000] to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1526] via-[#060c16] to-[#010305]" />
            {/* Deep texture layer */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#88ccff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            
            <svg className="absolute inset-0 w-full h-full opacity-50 mix-blend-screen" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              {/* Distant background stalactites and stalagmites */}
              <path d="M-50,0 L150,400 L300,0 Z M200,0 L450,550 L600,0 Z M500,0 L800,450 L1100,0 Z" fill="#08111f" />
              <path d="M-100,1000 L250,200 L600,1000 Z M400,1000 L750,150 L1100,1000 Z" fill="#0c182c" />
              
              {/* Midground structures */}
              <path d="M50,1000 L350,400 L700,1000 Z M550,1000 L850,250 L1200,1000 Z" fill="#12233f" />
              <path d="M100,0 L300,300 L450,0 Z M650,0 L900,350 L1050,0 Z" fill="#0c182c" />
              
              {/* Foreground pillars */}
              <rect x="250" y="400" width="40" height="600" fill="#060c16" />
              <rect x="230" y="380" width="80" height="40" fill="#0a1526" />
              <rect x="270" y="0" width="15" height="300" fill="#060c16" />
              
              <rect x="750" y="300" width="50" height="700" fill="#060c16" />
              <rect x="725" y="270" width="100" height="40" fill="#0a1526" />
              <rect x="765" y="0" width="25" height="200" fill="#060c16" />

              {/* Glowing City of Tears lamps */}
              <circle cx="270" cy="360" r="60" fill="#aaddff" opacity="0.05" />
              <circle cx="270" cy="360" r="20" fill="#aaddff" opacity="0.15" />
              <ellipse cx="270" cy="360" rx="8" ry="15" fill="#eef8ff" opacity="0.8" />
              
              <circle cx="775" cy="250" r="80" fill="#aaddff" opacity="0.05" />
              <circle cx="775" cy="250" r="30" fill="#aaddff" opacity="0.15" />
              <ellipse cx="775" cy="250" rx="10" ry="20" fill="#eef8ff" opacity="0.8" />
              
              <circle cx="500" cy="700" r="100" fill="#aaddff" opacity="0.03" />

              {/* Rain/Water streaks */}
              <path d="M200,0 L200,500" stroke="#aaddff" strokeWidth="2" strokeDasharray="30 40" opacity="0.1" />
              <path d="M350,0 L350,800" stroke="#aaddff" strokeWidth="1" strokeDasharray="20 60" opacity="0.05" />
              <path d="M500,0 L500,1000" stroke="#aaddff" strokeWidth="3" strokeDasharray="40 80" opacity="0.08" />
              <path d="M650,0 L650,600" stroke="#aaddff" strokeWidth="1.5" strokeDasharray="25 50" opacity="0.1" />
              <path d="M850,0 L850,900" stroke="#aaddff" strokeWidth="2" strokeDasharray="35 70" opacity="0.06" />
            </svg>

            {/* Fog layers */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(136,204,255,0.08),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,rgba(136,204,255,0.05),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(136,204,255,0.04),transparent_60%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-[#02050a] via-[#060c16]/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#88ccff]/10 to-transparent mix-blend-screen" />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {isSilksong ? (
        // Silksong Scene (Pharloom Citadel / Deep Docks)
        <>
          {/* Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#6a1a1a] via-[#4a0a0a] to-[#2a0505]" />
          
          {/* Layer 1: Deep Back (Distant Citadel Spires) */}
          <motion.div 
            className="absolute inset-0 opacity-40"
            animate={{ x: ['-1%', '1%', '-1%'] }}
            transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              <defs>
                <filter id="blur-l1-silk"><feGaussianBlur stdDeviation="8" /></filter>
              </defs>
              <g filter="url(#blur-l1-silk)">
                {/* Distant Spires */}
                <path d="M100,1000 L150,400 L200,1000 Z" fill="#9a2525" />
                <path d="M400,1000 L450,300 L500,1000 Z" fill="#9a2525" />
                <path d="M750,1000 L800,450 L850,1000 Z" fill="#9a2525" />
                {/* Distant glowing windows */}
                <rect x="440" y="500" width="20" height="40" fill="#ffc733" opacity="0.6" />
                <rect x="440" y="600" width="20" height="40" fill="#ffc733" opacity="0.6" />
                <rect x="145" y="650" width="10" height="30" fill="#ffc733" opacity="0.6" />
              </g>
            </svg>
          </motion.div>

          {/* Layer 2: Mid-Back (Gears & Scaffolding) */}
          <motion.div 
            className="absolute inset-0 opacity-60"
            animate={{ x: ['-2%', '2%', '-2%'] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              <defs>
                <filter id="blur-l2-silk"><feGaussianBlur stdDeviation="5" /></filter>
              </defs>
              <g filter="url(#blur-l2-silk)">
                {/* Massive Gears */}
                <g className="origin-[150px_800px] animate-[spin_20s_linear_infinite]">
                  <circle cx="150" cy="800" r="150" fill="none" stroke="#7a1515" strokeWidth="40" strokeDasharray="30 20" />
                  <circle cx="150" cy="800" r="100" fill="none" stroke="#7a1515" strokeWidth="10" />
                  <path d="M0,800 L300,800 M150,650 L150,950" stroke="#7a1515" strokeWidth="20" />
                </g>
                
                <g className="origin-[850px_700px] animate-[spin_30s_linear_infinite_reverse]">
                  <circle cx="850" cy="700" r="200" fill="none" stroke="#7a1515" strokeWidth="50" strokeDasharray="40 30" />
                  <circle cx="850" cy="700" r="130" fill="none" stroke="#7a1515" strokeWidth="15" />
                  <path d="M650,700 L1050,700 M850,500 L850,900" stroke="#7a1515" strokeWidth="25" />
                </g>
                
                {/* Scaffolding */}
                <path d="M0,850 L1000,850 M0,900 L1000,900" stroke="#7a1515" strokeWidth="10" />
                <path d="M100,850 L150,900 M200,850 L250,900 M300,850 L350,900 M400,850 L450,900 M500,850 L550,900 M600,850 L650,900 M700,850 L750,900 M800,850 L850,900 M900,850 L950,900" stroke="#7a1515" strokeWidth="8" />
              </g>
            </svg>
          </motion.div>

          {/* Layer 3: Mid-Front (Bells & Bone Structures) */}
          <motion.div 
            className="absolute inset-0 opacity-85"
            animate={{ x: ['-4%', '4%', '-4%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              <defs>
                <filter id="blur-l3-silk"><feGaussianBlur stdDeviation="2" /></filter>
              </defs>
              <g filter="url(#blur-l3-silk)">
                {/* Distinct Bone Platform */}
                <path d="M250,850 Q500,800 750,850 L800,1000 L200,1000 Z" fill="#4a0f0f" stroke="#ff6d8d" strokeWidth="4" />
                <path d="M300,850 L300,1000 M400,835 L400,1000 M500,825 L500,1000 M600,835 L600,1000 M700,850 L700,1000" stroke="#2a0505" strokeWidth="10" />

                {/* Bone/Coral Mounds */}
                <path d="M-50,1000 Q50,750 150,600 Q250,750 350,1000 Z" fill="#5a1515" />
                <path d="M700,1000 Q850,700 950,500 Q1050,700 1150,1000 Z" fill="#5a1515" />
                
                {/* Hanging Bells */}
                <path d="M150,-50 L150,400" stroke="#3a0808" strokeWidth="6" />
                <path d="M120,400 Q150,350 180,400 L170,420 L130,420 Z" fill="#c03030" />
                <circle cx="150" cy="425" r="8" fill="#ffc733" />

                <path d="M550,-50 L550,300" stroke="#3a0808" strokeWidth="8" />
                <path d="M510,300 Q550,230 590,300 L575,330 L525,330 Z" fill="#c03030" />
                <circle cx="550" cy="340" r="12" fill="#ffc733" />

                <path d="M850,-50 L850,450" stroke="#3a0808" strokeWidth="5" />
                <path d="M825,450 Q850,410 875,450 L865,465 L835,465 Z" fill="#c03030" />
                <circle cx="850" cy="470" r="6" fill="#ffc733" />

                {/* Glowing Embers */}
                <circle cx="300" cy="600" r="14" fill="#ffc733" opacity="0.9" filter="blur(4px)" />
                <circle cx="600" cy="400" r="20" fill="#ffc733" opacity="0.8" filter="blur(6px)" />
                <circle cx="850" cy="700" r="12" fill="#ffc733" opacity="1" filter="blur(3px)" />
              </g>
            </svg>
          </motion.div>

          {/* Layer 4: Foreground (Sharp Needles & Silk Threads) */}
          <motion.div 
            className="absolute inset-0 opacity-100"
            animate={{ x: ['-6%', '6%', '-6%'] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              {/* Sharp Foreground Silhouettes */}
              <path d="M-100,1000 L100,600 L250,1000 Z" fill="#3a0808" />
              <path d="M200,1000 L350,500 L500,1000 Z" fill="#3a0808" />
              <path d="M600,1000 L750,400 L900,1000 Z" fill="#3a0808" />
              <path d="M850,1000 L1000,550 L1150,1000 Z" fill="#3a0808" />
              
              {/* Top hanging needles */}
              <path d="M-50,-50 L50,350 L150,-50 Z" fill="#3a0808" />
              <path d="M350,-50 L450,400 L550,-50 Z" fill="#3a0808" />
              <path d="M750,-50 L850,300 L950,-50 Z" fill="#3a0808" />

              {/* Silk Threads */}
              <path d="M-50,200 Q400,400 1050,100" fill="none" stroke="#ff6d8d" strokeWidth="4" opacity="0.9" />
              <path d="M-50,800 Q500,600 1050,900" fill="none" stroke="#ff6d8d" strokeWidth="6" opacity="0.8" />
              <path d="M200,-50 Q300,500 150,1050" fill="none" stroke="#ff6d8d" strokeWidth="3" opacity="1" />
              <path d="M800,-50 Q700,500 850,1050" fill="none" stroke="#ff6d8d" strokeWidth="5" opacity="0.9" />
            </svg>
          </motion.div>

          {/* Layer 5: Extreme Foreground (Blurred Silk & Spores) */}
          <motion.div 
            className="absolute inset-0 opacity-90"
            animate={{ x: ['-10%', '10%', '-10%'], y: ['-2%', '2%', '-2%'] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              <defs>
                <filter id="blur-l5-silk"><feGaussianBlur stdDeviation="12" /></filter>
              </defs>
              <g filter="url(#blur-l5-silk)">
                <path d="M-100,900 Q500,1100 1100,800" fill="none" stroke="#ff4d6d" strokeWidth="40" />
                <path d="M-100,100 Q500,-100 1100,200" fill="none" stroke="#ff4d6d" strokeWidth="30" />
                
                {/* Floating Spores */}
                <circle cx="200" cy="800" r="15" fill="#ffc733" opacity="0.6" />
                <circle cx="800" cy="200" r="25" fill="#ffc733" opacity="0.5" />
                <circle cx="500" cy="900" r="20" fill="#ffc733" opacity="0.7" />
                <circle cx="300" cy="100" r="18" fill="#ffc733" opacity="0.6" />
                <circle cx="900" cy="700" r="22" fill="#ffc733" opacity="0.5" />
              </g>
            </svg>
          </motion.div>
          
          {/* Fog/Glow */}
          <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-[#ff4d6d]/30 via-[#ff4d6d]/10 to-transparent mix-blend-screen" />
        </>
      ) : (
        // Hollow Knight Scene (City of Tears / Forgotten Crossroads)
        <>
          {/* Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a2a40] via-[#101a2a] to-[#0a101a]" />
          
          {/* Layer 1: Deep Back (City of Tears Windows) */}
          <motion.div 
            className="absolute inset-0 opacity-50"
            animate={{ x: ['-1%', '1%', '-1%'] }}
            transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              <defs>
                <filter id="blur-l1-hk"><feGaussianBlur stdDeviation="8" /></filter>
              </defs>
              <g filter="url(#blur-l1-hk)">
                {/* Distant Buildings */}
                <rect x="100" y="400" width="150" height="600" fill="#2a3b55" />
                <rect x="400" y="300" width="200" height="700" fill="#2a3b55" />
                <rect x="750" y="450" width="180" height="550" fill="#2a3b55" />
                
                {/* Glowing Blue Windows */}
                <rect x="130" y="450" width="20" height="40" fill="#88ccff" opacity="0.7" rx="10" />
                <rect x="180" y="450" width="20" height="40" fill="#88ccff" opacity="0.7" rx="10" />
                <rect x="130" y="520" width="20" height="40" fill="#88ccff" opacity="0.7" rx="10" />
                <rect x="180" y="520" width="20" height="40" fill="#88ccff" opacity="0.7" rx="10" />

                <rect x="450" y="350" width="30" height="60" fill="#88ccff" opacity="0.8" rx="15" />
                <rect x="520" y="350" width="30" height="60" fill="#88ccff" opacity="0.8" rx="15" />
                <rect x="450" y="450" width="30" height="60" fill="#88ccff" opacity="0.8" rx="15" />
                <rect x="520" y="450" width="30" height="60" fill="#88ccff" opacity="0.8" rx="15" />

                <rect x="800" y="500" width="25" height="50" fill="#88ccff" opacity="0.6" rx="12" />
                <rect x="860" y="500" width="25" height="50" fill="#88ccff" opacity="0.6" rx="12" />
              </g>
            </svg>
          </motion.div>

          {/* Layer 1.5: City of Tears Rain */}
          <motion.div 
            className="absolute -inset-[100%] opacity-40 pointer-events-none"
            animate={{ y: ['0%', '50%'] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          >
            <svg width="100%" height="100%" preserveAspectRatio="none">
              <pattern id="rain" width="100" height="100" patternUnits="userSpaceOnUse">
                <line x1="50" y1="0" x2="30" y2="60" stroke="#88ccff" strokeWidth="1.5" />
                <line x1="10" y1="40" x2="-10" y2="100" stroke="#88ccff" strokeWidth="1" opacity="0.5" />
                <line x1="90" y1="20" x2="70" y2="80" stroke="#88ccff" strokeWidth="2" opacity="0.8" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#rain)" />
            </svg>
          </motion.div>

          {/* Layer 2: Mid-Back (Hanging Chains & Arches) */}
          <motion.div 
            className="absolute inset-0 opacity-70"
            animate={{ x: ['-2%', '2%', '-2%'] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              <defs>
                <filter id="blur-l2-hk"><feGaussianBlur stdDeviation="4" /></filter>
              </defs>
              <g filter="url(#blur-l2-hk)">
                {/* Large Background Arches */}
                <path d="M-100,1000 Q200,300 500,1000" fill="none" stroke="#253040" strokeWidth="60" />
                <path d="M400,1000 Q750,200 1100,1000" fill="none" stroke="#253040" strokeWidth="80" />
                
                {/* Hanging Chains */}
                <path d="M250,-50 L250,600" stroke="#152030" strokeWidth="12" strokeDasharray="20 10" />
                <path d="M750,-50 L750,750" stroke="#152030" strokeWidth="16" strokeDasharray="25 15" />
                <path d="M500,-50 L500,400" stroke="#152030" strokeWidth="8" strokeDasharray="15 8" />
              </g>
            </svg>
          </motion.div>

          {/* Layer 3: Mid-Front (Stalagmites, Bench & Lampposts) */}
          <motion.div 
            className="absolute inset-0 opacity-90"
            animate={{ x: ['-4%', '4%', '-4%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              <defs>
                <filter id="blur-l3-hk"><feGaussianBlur stdDeviation="2" /></filter>
              </defs>
              <g filter="url(#blur-l3-hk)">
                {/* Ground / Stalagmites */}
                <path d="M-50,1000 Q100,800 200,650 Q300,800 400,1000 Z" fill="#152030" />
                <path d="M750,1000 Q850,800 950,650 Q1050,800 1150,1000 Z" fill="#152030" />
                
                {/* Distinct Stone Platform */}
                <path d="M350,850 L650,850 L700,1000 L300,1000 Z" fill="#101a2a" stroke="#2a3b55" strokeWidth="4" />
                
                {/* Iron Bench Silhouette */}
                <path d="M450,850 L550,850 L550,830 L450,830 Z" fill="#0a101a" />
                <path d="M460,850 L460,900 M540,850 L540,900" stroke="#0a101a" strokeWidth="8" />
                <path d="M450,830 Q500,780 550,830" fill="none" stroke="#0a101a" strokeWidth="6" />

                {/* Lampposts */}
                <rect x="250" y="650" width="10" height="350" fill="#0a101a" />
                <path d="M225,650 L285,650 L270,610 L240,610 Z" fill="#0a101a" />
                <circle cx="255" cy="630" r="45" fill="#aaddff" opacity="0.8" filter="blur(15px)" />
                <circle cx="255" cy="630" r="15" fill="#ffffff" />
                
                <rect x="800" y="550" width="8" height="450" fill="#0a101a" />
                <path d="M780,550 L828,550 L815,515 L793,515 Z" fill="#0a101a" />
                <circle cx="804" cy="532" r="40" fill="#aaddff" opacity="0.8" filter="blur(12px)" />
                <circle cx="804" cy="532" r="12" fill="#ffffff" />
              </g>
            </svg>
          </motion.div>

          {/* Layer 4: Foreground (Dark Silhouettes & Thorny Vines) */}
          <motion.div 
            className="absolute inset-0 opacity-100"
            animate={{ x: ['-6%', '6%', '-6%'] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              {/* Foreground Rocks */}
              <path d="M-100,1000 Q100,800 250,650 Q400,800 500,1000 Z" fill="#0a101a" />
              <path d="M400,1000 Q550,750 700,600 Q850,750 950,1000 Z" fill="#0a101a" />
              <path d="M850,1000 Q1000,700 1150,550 Q1300,700 1400,1000 Z" fill="#0a101a" />
              
              {/* Top hanging stalactites */}
              <path d="M-50,-50 Q50,200 150,400 Q200,200 250,-50 Z" fill="#0a101a" />
              <path d="M350,-50 Q450,300 550,500 Q600,300 650,-50 Z" fill="#0a101a" />
              <path d="M750,-50 Q850,250 950,350 Q1000,250 1050,-50 Z" fill="#0a101a" />
              
              {/* Thorny Vines */}
              <path d="M150,-50 Q180,150 120,450" fill="none" stroke="#0a101a" strokeWidth="16" />
              <path d="M150,100 L180,80 M140,200 L110,180 M130,300 L160,280" stroke="#0a101a" strokeWidth="4" /> {/* Thorns */}

              <path d="M550,-50 Q520,250 580,550" fill="none" stroke="#0a101a" strokeWidth="20" />
              <path d="M540,150 L510,130 M560,300 L590,280 M550,450 L520,430" stroke="#0a101a" strokeWidth="5" /> {/* Thorns */}

              <path d="M950,-50 Q920,200 980,400" fill="none" stroke="#0a101a" strokeWidth="12" />
              <path d="M940,100 L910,80 M960,250 L990,230" stroke="#0a101a" strokeWidth="3" /> {/* Thorns */}
            </svg>
          </motion.div>

          {/* Layer 5: Extreme Foreground (Blurred Spikes & Void Flakes) */}
          <motion.div 
            className="absolute inset-0 opacity-95"
            animate={{ x: ['-10%', '10%', '-10%'], y: ['-2%', '2%', '-2%'] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 1000">
              <defs>
                <filter id="blur-l5-hk"><feGaussianBlur stdDeviation="12" /></filter>
              </defs>
              <g filter="url(#blur-l5-hk)">
                <path d="M-100,1100 L50,700 L200,1100 Z" fill="#050a10" />
                <path d="M800,1100 L950,650 L1100,1100 Z" fill="#050a10" />
                
                {/* Void Flakes / Infection Particles */}
                <circle cx="150" cy="300" r="18" fill="#000000" opacity="0.8" />
                <circle cx="850" cy="800" r="22" fill="#000000" opacity="0.7" />
                <circle cx="450" cy="150" r="15" fill="#000000" opacity="0.9" />
                <circle cx="200" cy="600" r="12" fill="#000000" opacity="0.6" />
                <circle cx="700" cy="100" r="20" fill="#000000" opacity="0.8" />
              </g>
            </svg>
          </motion.div>
          
          {/* Fog/Glow */}
          <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-[#88ccff]/35 via-[#88ccff]/15 to-transparent mix-blend-screen" />
        </>
      )}
    </div>
  );
};


export const ScreenShake: React.FC<{ active: boolean; children: React.ReactNode }> = ({ active, children }) => {
  return (
    <motion.div
      animate={active ? {
        x: [0, -5, 5, -5, 5, 0],
        y: [0, 2, -2, 2, -2, 0],
      } : {}}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
};

export const SoulAbsorption: React.FC<{ active: boolean; color?: string; performanceMode?: boolean }> = ({ active, color = "#ffffff", performanceMode = false }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particleCount = performanceMode ? 10 : 20;
    const targetY = window.innerWidth < 640 ? 110 : 130;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      targetX: canvas.width / 2,
      targetY: targetY, // Aligned with background vessel
      size: Math.random() * 3 + 1.5,
      speed: Math.random() * 0.08 + 0.04,
      opacity: 1,
      life: 1
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      
      const targetY = canvas.width < 640 ? 110 : 130;
      
      // Removed shadowBlur for performance

      let allDone = true;
      particles.forEach(p => {
        if (p.life <= 0) return;
        allDone = false;

        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        p.x += dx * p.speed;
        p.y += dy * p.speed;
        p.life -= 0.01;

        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!allDone) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, color]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
    />
  );
};

export const HollowKnightDialogue: React.FC<{ 
  text: string; 
  active: boolean; 
  accent?: string;
  onTermClick?: (title: string, word: string) => void;
}> = ({ text, active, accent, onTermClick }) => {
  if (!active) return null;
  const isSilksong = accent === 'hollow-knight-silksong';
  const borderColor = isSilksong ? 'border-rose-900/40' : 'border-white/10';
  const cornerColor = isSilksong ? 'border-rose-500/30' : 'border-white/20';
  const titleColor = isSilksong ? 'text-rose-500/40' : 'text-white/30';
  const dotColor = isSilksong ? 'bg-rose-500/30' : 'bg-white/20';

  const markdownComponents = {
    p: ({children}: any) => <p className="mb-4 last:mb-0">{children}</p>,
    strong: ({children}: any) => <strong className={`font-black ${isSilksong ? 'text-rose-400' : 'text-white'}`}>{children}</strong>,
    em: ({children}: any) => <em className="italic opacity-80">{children}</em>,
    mark: ({children}: any) => (
      <mark className={`px-1.5 py-0.5 rounded-sm bg-transparent border-b-2 ${isSilksong ? 'border-rose-500 text-rose-200' : 'border-slate-400 text-slate-100'}`}>
        {children}
      </mark>
    ),
    term: ({ title, children }: any) => (
      <span 
        onClick={() => onTermClick?.(title || '', String(children))}
        className={`cursor-help border-b border-dashed ${isSilksong ? 'border-rose-400 text-rose-300 hover:text-rose-100' : 'border-slate-400 text-slate-200 hover:text-white'} transition-colors`}
        title={title}
      >
        {children}
      </span>
    ),
    ul: ({children}: any) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
    li: ({children}: any) => <li className="text-sm sm:text-base">{children}</li>,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        filter: 'blur(0px)',
        y: [0, -5, 0]
      }}
      transition={{ 
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
        filter: { duration: 0.5 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }}
      className={`relative p-8 sm:p-10 ${isSilksong ? 'bg-[#1a0505]' : 'bg-[#0a0a0a]'} border-2 ${borderColor} rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.4)] max-w-3xl mx-auto overflow-hidden font-serif will-change-transform`}
    >
      {/* Background vignette */}
      <div className={`absolute inset-0 ${isSilksong ? 'bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.03)_0%,transparent_70%)]' : 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]'} pointer-events-none`} />
      
      {/* Glitch Overlay */}
      <motion.div 
        animate={{ opacity: [0, 0.1, 0, 0.05, 0] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
        className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay"
      />
      
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-6 ${isSilksong ? 'bg-[#1a0505]' : 'bg-[#0a0a0a]'} border-x-2 border-t-2 ${borderColor} text-[10px] uppercase tracking-[0.4em] ${titleColor}`}>
        {isSilksong ? "Pharloom's Journal" : "The Hunter's Journal"}
      </div>
      
      <div className="text-slate-200 text-lg sm:text-xl leading-relaxed tracking-wide italic text-center relative z-10 markdown-journal">
        <ReactMarkdown 
          remarkPlugins={REMARK_PLUGINS} 
          rehypePlugins={REHYPE_PLUGINS}
          components={markdownComponents as any}
        >
          {text}
        </ReactMarkdown>
      </div>
      
      <div className="mt-6 flex justify-center gap-3 relative z-10">
        {[0, 0.3, 0.6].map((delay, i) => (
          <motion.div 
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay }}
            className={`w-1.5 h-1.5 ${dotColor} rounded-full`} 
          />
        ))}
      </div>

      {/* Decorative corners */}
      <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 ${cornerColor}`} />
      <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 ${cornerColor}`} />
      <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 ${cornerColor}`} />
      <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 ${cornerColor}`} />
    </motion.div>
  );
};

export const HollowKnightHeader: React.FC<{ 
  score: number; 
  total: number; 
  accent: string;
}> = ({ score, total, accent }) => {
  const isSilksong = accent === 'hollow-knight-silksong';
  const vesselColor = isSilksong ? '#e63946' : '#ffffff';
  const progress = (score / total) * 100;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20">
        {/* Main Vessel */}
        <div className={`absolute inset-0 rounded-full border-4 ${isSilksong ? 'border-[#441111] dark:border-[#441111]' : 'border-slate-200 dark:border-[#333]'} bg-slate-100 dark:bg-[#111] overflow-hidden shadow-2xl`}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${progress}%` }}
            className="absolute bottom-0 left-0 w-full transition-all duration-1000"
            style={{ 
              backgroundColor: vesselColor,
              boxShadow: isSilksong ? `0 0 20px ${vesselColor}88` : `0 0 20px rgba(0,0,0,0.1)`
            }}
          >
            {/* Liquid Effect */}
            <motion.div
              animate={{ x: [-5, 5, -5], y: [0, 2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-[120%] h-4 -translate-y-1/2 opacity-50 will-change-transform"
              style={{ backgroundColor: vesselColor, borderRadius: '50%' }}
            />
            <motion.div
              animate={{ x: [5, -5, 5], y: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-[120%] h-4 -translate-y-1/2 opacity-30 will-change-transform"
              style={{ backgroundColor: vesselColor, borderRadius: '50%' }}
            />
          </motion.div>
        </div>
        
        {/* Decorative Horns/Needles */}
        {!isSilksong ? (
          <>
            <div className="absolute -top-4 left-2 w-4 h-8 bg-slate-200 dark:bg-[#333] rounded-t-full -rotate-12 border-t-2 border-slate-400 dark:border-white/10" />
            <div className="absolute -top-4 right-2 w-4 h-8 bg-slate-200 dark:bg-[#333] rounded-t-full rotate-12 border-t-2 border-slate-400 dark:border-white/10" />
          </>
        ) : (
          <>
            {/* Hornet's Horns */}
            <div className="absolute -top-6 left-1 w-3 h-10 bg-[#441111] rounded-t-full -rotate-15 border-t-2 border-rose-500/30" />
            <div className="absolute -top-6 right-1 w-3 h-10 bg-[#441111] rounded-t-full rotate-15 border-t-2 border-rose-500/30" />
            {/* Silk Threads */}
            <motion.div 
              animate={{ opacity: [0.2, 0.5, 0.2], scaleY: [0.9, 1.1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 w-[1px] h-10 bg-rose-500/40" 
            />
          </>
        )}
      </div>

      <div className="flex flex-col">
        <span className={`text-[10px] uppercase tracking-[0.4em] font-serif ${isSilksong ? 'text-rose-600 dark:text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
          {isSilksong ? 'Silk' : 'Soul'}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-serif italic text-slate-800 dark:text-slate-200 tracking-tighter">
            {score}
          </span>
          <span className="text-slate-300 dark:text-slate-600 font-serif">/</span>
          <span className="text-lg font-serif text-slate-500 dark:text-slate-400">
            {total}
          </span>
        </div>
      </div>
    </div>
  );
};

export const HollowKnightExamUI: React.FC<{
  currentQuestionIndex: number;
  totalQuestions: number;
  progress: number;
  timeRemaining: number;
  accent: string;
  onShowMap: () => void;
}> = ({ currentQuestionIndex, totalQuestions, progress, timeRemaining, accent, onShowMap }) => {
  const isSilksong = accent === 'hollow-knight-silksong';
  const primaryColor = isSilksong ? 'text-rose-600 dark:text-rose-500' : 'text-slate-800 dark:text-white';
  const borderColor = isSilksong ? 'border-rose-900/50' : 'border-slate-200 dark:border-white/20';
  const bgColor = 'bg-white dark:bg-[#0a0a0a]';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="sticky top-0 z-50 space-y-2 sm:space-y-4 pt-2 sm:pt-4 bg-transparent -mx-2 sm:-mx-4 px-2 sm:px-4">
      <div className={`flex flex-col xs:flex-row items-stretch xs:items-center justify-between ${bgColor} p-2 sm:p-4 md:p-5 rounded-sm shadow-2xl border-2 ${borderColor} gap-2 sm:gap-6 relative overflow-hidden`}>
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Floating Particles in Header Removed for Performance - Global Particles are enough */}
        
        <div className="flex items-center justify-between xs:justify-start gap-2 sm:gap-4 relative z-10">
          <button
            onClick={onShowMap}
            className={`p-2 sm:p-3 bg-slate-50 dark:bg-black/40 rounded-sm text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-white transition-all border-2 ${borderColor} active:translate-y-0.5 group/hk-btn`}
          >
            <Menu className="w-4 h-4 sm:w-5 h-5 md:w-6 md:h-6 group-hover/hk-btn:scale-110 transition-transform" />
          </button>
          <div className="flex flex-col">
            <p className={`text-[8px] sm:text-[10px] font-serif italic uppercase ${isSilksong ? 'text-rose-400' : 'text-slate-400 dark:text-slate-500'} tracking-[0.3em] leading-none`}>Journal Entry</p>
            <p className={`text-sm sm:text-lg md:text-xl font-serif italic ${primaryColor} leading-tight`}>{currentQuestionIndex + 1} <span className="text-slate-300 dark:text-slate-700 mx-0.5">/</span> {totalQuestions}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-w-0 px-2 sm:px-4 relative z-10">
           {/* Custom HK Progress Bar */}
           <div className="w-full max-w-md space-y-1">
             <div className={`h-3 sm:h-4 bg-slate-100 dark:bg-black/60 border-2 ${borderColor} rounded-sm relative overflow-hidden p-0.5`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 40, damping: 20 }}
                  className={`h-full ${isSilksong ? 'bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.5)]' : 'bg-slate-300 dark:bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'} rounded-sm relative overflow-hidden will-change-[width]`}
                >
                  {/* Silk/Soul shine */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 skew-x-12 will-change-transform"
                  />
                </motion.div>
             </div>
             <div className="flex justify-between items-center px-1">
                <span className={`text-[7px] sm:text-[8px] font-serif italic uppercase ${isSilksong ? 'text-rose-400' : 'text-slate-400'} tracking-[0.2em]`}>Completion</span>
                <span className={`text-[7px] sm:text-[8px] font-serif italic ${primaryColor}`}>{Math.round(progress)}%</span>
             </div>
           </div>
        </div>

        <div className="flex items-center justify-between xs:justify-end gap-2 sm:gap-4 relative z-10">
          <div className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-sm font-serif italic text-xs sm:text-base md:text-lg flex items-center gap-1.5 sm:gap-2 border-2 ${borderColor} transition-colors ${
            timeRemaining < 10 && timeRemaining > 0 ? 'bg-rose-500/10 text-rose-600 animate-pulse' : 
            'bg-slate-50 dark:bg-black/40 text-slate-800 dark:text-slate-200'
          }`}>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Decorative corners */}
        <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${borderColor}`} />
        <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${borderColor}`} />
        <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${borderColor}`} />
        <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${borderColor}`} />
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { Box, Circle, Triangle, Square, Activity, Cpu, Database, Layers, Shield, Zap } from 'lucide-react';
import { SlideType } from '../../../presentationTypes';

interface SlideBackgroundProps {
  type: SlideType;
}

export const SlideBackground: React.FC<SlideBackgroundProps> = ({ type }) => {
  const commonTransition = {
    duration: 0,
    repeat: 0,
    repeatType: "reverse" as const,
    ease: "linear" as const,
  };

  const noiseTexture = (
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
  );

  const FloatingShapes = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border bg-white/5 backdrop-blur-[2px]"
          style={{
            width: Math.random() * 300 + 100,
            height: Math.random() * 300 + 100,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)',
            transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );

  const MetricGrid = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none opacity-5 ${className}`}>
      <div className="grid grid-cols-8 grid-rows-8 w-64 h-64 border" style={{ borderColor: 'var(--accent-color, #6366f1)' }}>
        {[...Array(64)].map((_, i) => (
          <div key={i} className="border-[0.5px] flex items-center justify-center" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }}>
            {i % 11 === 0 && <div className="w-1 h-1 rounded-sm opacity-40" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />}
          </div>
        ))}
      </div>
    </div>
  );

  const BoxMarker = ({ className = "" }: { className?: string }) => (
    <div className={`absolute w-3 h-3 border pointer-events-none ${className}`} style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 30%, transparent)' }}>
      <div className="absolute inset-[2px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
    </div>
  );

  const FloatingDots = ({ count = 30 }: { count?: number }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => {
        const size = Math.random() * 3 + 1;
        return (
          <div
            key={i}
            className={`absolute rounded-full`}
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3,
              backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 40%, transparent)',
            }}
          />
        );
      })}
    </div>
  );

  const Grid = ({ size = 60, opacity = 0.05, style = {}, color = 'indigo' }: { size?: number, opacity?: number, style?: React.CSSProperties, color?: string }) => (
    <div className={`absolute inset-0 pointer-events-none`}
         style={{ 
           opacity,
           backgroundImage: `linear-gradient(to right, color-mix(in srgb, ${color.startsWith('var') ? color : 'var(--accent-color, #6366f1)'} 20%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, ${color.startsWith('var') ? color : 'var(--accent-color, #6366f1)'} 20%, transparent) 1px, transparent 1px)`,
           backgroundSize: `${size}px ${size}px`,
           ...style
         }} />
  );

  const dotsSvg = (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='${encodeURIComponent(color)}' fill-opacity='0.2'/%3E%3C/svg%3E")`;

  const Dots = ({ size = 20, color = 'var(--accent-color, #6366f1)', className = "", style = {} }: { size?: number, color?: string, className?: string, style?: React.CSSProperties }) => (
    <div className={`absolute pointer-events-none ${className}`}
         style={{ 
           backgroundImage: color.startsWith('#') || color.startsWith('rgb') ? dotsSvg(color) : `radial-gradient(${color} 1px, transparent 0)`,
           backgroundSize: `${size}px ${size}px`,
           ...style
         }} />
  );
  
  const TechLines = ({ className = "" }: { className?: string }) => (
    <div className={`absolute flex flex-col gap-4 pointer-events-none ${className}`}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 opacity-20">
          <div className="h-[1px] w-12" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
        </div>
      ))}
    </div>
  );

  const CrossMarkers = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none opacity-20 ${className}`}>
      <div className="relative w-8 h-8">
        <div className="absolute top-1/2 left-0 w-full h-[1px]" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
        <div className="absolute top-0 left-1/2 w-[1px] h-full" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
      </div>
    </div>
  );

  const LMarker = ({ className = "" }: { className?: string }) => (
    <div className={`absolute w-4 h-4 border-l-2 border-t-2 pointer-events-none ${className}`} style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
  );

  const Ring = ({ className = "", size = "w-64 h-64", style = {} }: { className?: string, size?: string, style?: React.CSSProperties }) => (
    <div className={`absolute border-[1px] rounded-full pointer-events-none ${size} ${className}`} style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)', ...style }}>
      <div className="absolute inset-4 border-[1px] rounded-full" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 5%, transparent)' }} />
    </div>
  );

  const IconDecor = ({ icon: Icon, className = "" }: { icon: any, className?: string }) => (
    <div className={`absolute opacity-10 pointer-events-none ${className}`} style={{ color: 'var(--accent-color, #6366f1)' }}>
      <Icon size={48} strokeWidth={1} />
    </div>
  );

  const Chevron = ({ className = "" }: { className?: string }) => (
    <div className={`flex gap-1.5 ${className}`}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-3 h-6 border-r-2 border-t-2 rotate-45" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
      ))}
    </div>
  );

  const CornerBrackets = ({ className = "" }: { className?: string }) => (
    <div className={`absolute inset-4 pointer-events-none ${className}`}>
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
    </div>
  );

  const PlusGrid = ({ className = "" }: { className?: string }) => (
    <div className={`absolute grid grid-cols-4 grid-rows-4 gap-8 pointer-events-none opacity-20 ${className}`}>
      {[...Array(16)].map((_, i) => (
        <CrossMarkers key={i} className="opacity-100" />
      ))}
    </div>
  );

  const CircleGrid = ({ className = "" }: { className?: string }) => (
    <div className={`absolute grid grid-cols-4 grid-rows-4 gap-4 pointer-events-none opacity-30 ${className}`}>
      {[...Array(16)].map((_, i) => (
        <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
      ))}
    </div>
  );

  const GeometricCluster = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none ${className}`}>
      <div className="w-32 h-32 border-[1px] rounded-full absolute top-0 left-0" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
      <div className="w-16 h-16 border-[1px] absolute top-8 left-8 rotate-45" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
      <div className="w-4 h-4 rounded-full absolute top-14 left-14" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
      <div className="w-24 h-24 border-[1px] border-dashed rounded-full absolute top-4 left-4" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
      <DashedCircle className="top-2 left-2 w-28 h-28 opacity-10" />
    </div>
  );

  const ScanLines = ({ className = "" }: { className?: string }) => (
    <div className={`absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 ${className}`}>
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, color-mix(in srgb, var(--accent-color, #6366f1) 30%, transparent), transparent)` }} />
      ))}
    </div>
  );

  const RotatingCircle = ({ className = "", duration = 20, style = {} }: { className?: string, duration?: number, style?: React.CSSProperties }) => (
    <div
      className={`absolute border-t-[1px] border-l-[1px] rounded-full pointer-events-none ${className}`}
      style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)', ...style }}
    />
  );

  const DecorativePath = ({ className = "" }: { className?: string }) => (
    <svg className={`absolute pointer-events-none opacity-10 ${className}`} style={{ color: 'var(--accent-color, #6366f1)' }} width="100" height="100" viewBox="0 0 100 100">
      <path d="M10 10 L90 10 L90 90 L10 90 Z" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      <circle cx="90" cy="90" r="1.5" fill="currentColor" />
    </svg>
  );

  const DashedCircle = ({ className = "", duration = 25 }: { className?: string, duration?: number }) => (
    <div
      className={`absolute border-[1px] border-dashed rounded-full pointer-events-none ${className}`}
      style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }}
    />
  );

  const HexagonGrid = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none opacity-10 flex gap-1 ${className}`}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-8 h-9 clip-path-hexagon" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
      ))}
    </div>
  );

  const BarSystem = ({ className = "" }: { className?: string }) => (
    <div className={`absolute flex items-end gap-1 pointer-events-none opacity-20 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`w-1 rounded-full`} style={{ height: `${20 + Math.random() * 40}px`, backgroundColor: 'var(--accent-color, #6366f1)' }} />
      ))}
    </div>
  );

  const SignalWave = ({ className = "" }: { className?: string }) => (
    <svg className={`absolute pointer-events-none opacity-20 ${className}`} style={{ color: 'var(--accent-color, #6366f1)' }} width="120" height="20" viewBox="0 0 120 20">
      <path
        d="M0 10 Q 15 0, 30 10 T 60 10 T 90 10 T 120 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );

  const Brackets = ({ className = "" }: { className?: string }) => (
    <div className={`absolute w-8 h-8 pointer-events-none opacity-20 ${className}`}>
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t" style={{ borderColor: 'var(--accent-color, #6366f1)' }} />
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t" style={{ borderColor: 'var(--accent-color, #6366f1)' }} />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b" style={{ borderColor: 'var(--accent-color, #6366f1)' }} />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b" style={{ borderColor: 'var(--accent-color, #6366f1)' }} />
    </div>
  );

  const TargetReticle = ({ className = "" }: { className?: string }) => (
    <div className={`absolute w-12 h-12 pointer-events-none opacity-20 ${className}`}>
      <div className="absolute inset-0 border rounded-full" style={{ borderColor: 'var(--accent-color, #6366f1)' }} />
      <div className="absolute top-1/2 left-0 w-full h-[1px]" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
      <div className="absolute top-0 left-1/2 w-[1px] h-full" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
    </div>
  );

  const CircuitPath = ({ className = "" }: { className?: string }) => (
    <svg className={`absolute pointer-events-none opacity-10 ${className}`} style={{ color: 'var(--accent-color, #6366f1)' }} width="100" height="40" viewBox="0 0 100 40">
      <path d="M0 20 H40 L60 0 H100" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="0" cy="20" r="1.5" fill="currentColor" />
      <circle cx="100" cy="0" r="1.5" fill="currentColor" />
    </svg>
  );

  const Coordinates = ({ className = "" }: { className?: string }) => (
    <div className={`absolute flex gap-4 pointer-events-none opacity-20 ${className}`}>
      <div className="flex flex-col gap-1">
        <div className="w-8 h-[1px]" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
        <div className="w-12 h-[1px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 60%, transparent)' }} />
      </div>
      <div className="grid grid-cols-2 gap-1">
        {[...Array(4)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />)}
      </div>
    </div>
  );

  const PulseCircle = ({ className = "" }: { className?: string }) => (
    <div
      className={`absolute border-[1px] rounded-full pointer-events-none ${className}`}
      style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 30%, transparent)' }}
    />
  );

  const ScannerSweep = ({ className = "" }: { className?: string }) => (
    <div
      className={`absolute left-0 top-1/2 w-full h-[1px] pointer-events-none ${className}`}
      style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)', boxShadow: `0 0 15px color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)` }}
    />
  );

  const VertexNode = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none opacity-20 ${className}`}>
        <div className="relative w-6 h-6">
            <div className="absolute top-1/2 left-0 w-full h-[0.5px]" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
            <div className="absolute top-0 left-1/2 w-[0.5px] h-full" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 border bg-white rotate-45" style={{ borderColor: 'var(--accent-color, #6366f1)' }} />
        </div>
    </div>
  );

  const FlickeringPoint = ({ className = "" }: { className?: string }) => (
    <div
      className={`absolute w-1 h-1 rounded-full pointer-events-none opacity-50 ${className}`}
      style={{ backgroundColor: 'var(--accent-color, #6366f1)' }}
    />
  );

  const GiantAsterisk = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none opacity-[0.03] flex items-center justify-center ${className}`}>
      <div className="absolute w-px h-full rotate-[0deg]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 80%, black)' }} />
      <div className="absolute w-px h-full rotate-[45deg]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 80%, black)' }} />
      <div className="absolute w-px h-full rotate-[90deg]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 80%, black)' }} />
      <div className="absolute w-px h-full rotate-[135deg]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 80%, black)' }} />
    </div>
  );

  const ListRail = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none ${className}`}>
      <div className="absolute left-[39px] top-0 bottom-0 w-px" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="absolute left-8 flex items-center gap-4" style={{ top: `${i * 140 + 80}px` }}>
          <div className="w-5 h-5 rounded-full border bg-[#f8faff] flex items-center justify-center shadow-sm" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 30%, transparent)' }}>
             <div className="w-1.5 h-1.5 rounded-full opacity-80" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
          </div>
          <div className="h-px w-24" style={{ background: `linear-gradient(to right, color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent), transparent)` }} />
        </div>
      ))}
    </div>
  );

  const AgendaMatrix = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none opacity-[0.03] ${className}`}>
      <div className="grid grid-cols-4 grid-rows-4 w-full h-full">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="border-t border-l flex p-4" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 80%, black)' }}>
            <span className="text-xl font-mono font-bold" style={{ color: 'color-mix(in srgb, var(--accent-color, #6366f1) 80%, black)' }}>{(i + 1).toString().padStart(2, '0')}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const HugeQuoteMark = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none opacity-[0.03] text-[800px] font-serif leading-none select-none tracking-tighter ${className}`} style={{ color: 'color-mix(in srgb, var(--accent-color, #6366f1) 80%, black)' }}>
      "
    </div>
  );

  const LayoutFrames = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none ${className}`}>
      <div className="absolute top-0 left-0 w-[500px] h-[600px] border-[2px] shadow-sm -rotate-6 rounded-3xl" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
      <div className="absolute top-12 left-12 w-[500px] h-[600px] border-[2px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] rotate-3 backdrop-blur-sm rounded-3xl" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
      <div className="absolute top-24 left-24 w-[400px] h-[400px] border-[1px] border-dashed rotate-12 rounded-full" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
    </div>
  );

  const AbstractTextBlocks = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none opacity-[0.04] flex flex-col gap-8 w-[800px] ${className}`}>
      <div className="w-3/4 h-12 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 80%, black)' }} />
      <div className="flex flex-col gap-5 w-full">
        <div className="w-full h-4 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 70%, black)' }} />
        <div className="w-[90%] h-4 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 70%, black)' }} />
        <div className="w-[95%] h-4 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 70%, black)' }} />
        <div className="w-[80%] h-4 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 70%, black)' }} />
      </div>
      <div className="flex flex-col gap-5 w-full mt-10">
        <div className="w-[85%] h-4 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 70%, black)' }} />
        <div className="w-full h-4 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 70%, black)' }} />
        <div className="w-[70%] h-4 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 70%, black)' }} />
      </div>
    </div>
  );

  const SplitDividers = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none ${className}`}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border rotate-45" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[840px] h-[840px] border rotate-45" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-dashed rotate-45" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
    </div>
  );

  const GraphicFrame = () => (
    <div className="absolute inset-10 border-[1.5px] pointer-events-none rounded-[1.5rem]" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 30%, transparent)' }}>
      <div className="absolute -top-[1.5px] -left-[1.5px] w-20 h-20 border-l-[3px] border-t-[3px] rounded-tl-[1.5rem]" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 80%, transparent)' }} />
      <div className="absolute -bottom-[1.5px] -right-[1.5px] w-20 h-20 border-r-[3px] border-b-[3px] rounded-br-[1.5rem]" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 80%, transparent)' }} />
      
      <RotatingCircle className="top-4 left-4 w-12 h-12" />
      <RotatingCircle className="bottom-4 right-4 w-16 h-16" />

      <CircuitPath className="top-12 left-10 opacity-20" />
      <CircuitPath className="bottom-12 right-10 rotate-180 opacity-20" />

      <PulseCircle className="top-8 left-8 w-12 h-12" />
      <PulseCircle className="bottom-8 right-8 w-16 h-16" />

      {/* Detail markers */}
      <div className="absolute top-12 left-[-3px] flex flex-col gap-1.5">
        {[...Array(8)].map((_, i) => <div key={i} className="w-1.5 h-[1.5px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 30%, transparent)' }} />)}
      </div>
      <div className="absolute right-[-3px] bottom-12 flex flex-col gap-1.5 items-end">
        {[...Array(8)].map((_, i) => <div key={i} className="w-1.5 h-[1.5px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 30%, transparent)' }} />)}
      </div>
      
      <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 flex gap-4">
        <div className="w-16 h-4 bg-white border border-slate-100 rounded-full flex items-center justify-center gap-1.5 px-3 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
        </div>
      </div>
    </div>
  );

  switch (type) {
    case 'title':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#f8faff]">
          <GiantAsterisk className="top-1/2 left-3/4 w-[1200px] h-[1200px] -translate-x-1/2 -translate-y-1/2 rotate-12" />
          <div className="absolute top-0 right-0 w-1/2 h-full blur-[100px] rounded-full translate-x-1/4 translate-y-1/4" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 15%, transparent)' }} />
          <div className="absolute bottom-0 left-0 w-1/3 h-full blur-[80px] rounded-full -translate-x-1/4" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
          <Grid size={40} opacity={0.03} />
          <Grid size={120} opacity={0.05} color="var(--accent-color, #6366f1)" />
          <div className="absolute top-0 right-0 w-1/2 h-full -skew-x-12 translate-x-1/4" style={{ background: `linear-gradient(to left, color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent), transparent)` }} />
          <div className="absolute top-1/4 right-[20%] w-[3px] h-[30%] rotate-12" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-slate-50/40 skew-x-12 -translate-x-1/4" />
          
          <Dots className="top-24 left-24 w-64 h-64" />
          <Dots className="bottom-24 right-24 w-80 h-40" />
          
          <Ring className="top-[-10%] right-[-5%] w-[500px] h-[500px] opacity-40" />
          <Ring className="bottom-[-10%] left-[-5%] w-[400px] h-[400px] opacity-30" />
          
          <CornerBrackets />
          <ScanLines />
          
          <IconDecor icon={Cpu} className="top-32 right-32" />
          <IconDecor icon={Zap} className="bottom-32 left-32" />
          
          <RotatingCircle className="top-1/4 left-1/4 w-32 h-32 opacity-20" duration={30} />
          <RotatingCircle className="bottom-1/4 right-1/4 w-48 h-48 opacity-10" duration={45} />
          <DecorativePath className="top-1/3 right-1/4" />
          
          <CrossMarkers className="top-24 left-24" />
          <CrossMarkers className="bottom-24 right-24" />
          <LMarker className="top-12 left-12" />
          <LMarker className="bottom-12 right-12 rotate-180" />
          
          <MetricGrid className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 rotate-45" />
          <BoxMarker className="top-64 left-64" />
          <BoxMarker className="bottom-64 right-64" />
          
          <HexagonGrid className="top-48 left-12" />
          <SignalWave className="top-24 left-1/2 -translate-x-1/2 opacity-10" />
          <Brackets className="top-1/3 left-1/4 scale-150 rotate-12" />
          <BarSystem className="top-12 right-64" />
          <CircuitPath className="top-32 right-1/3" />
          <Coordinates className="bottom-32 left-1/4" />
          <PlusGrid className="top-1/4 left-1/4 scale-150 opacity-15" />
          <CircleGrid className="bottom-1/4 right-1/4 scale-125 opacity-25" />
          <GeometricCluster className="top-1/4 right-1/3 scale-150 opacity-20" />
          <FlickeringPoint className="top-1/4 left-1/3" />
          <FlickeringPoint className="bottom-1/3 right-1/4" />
          <TargetReticle className="top-1/4 right-1/4 scale-150" />
          <DashedCircle className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%]" duration={40} />
          
          <ScannerSweep className="opacity-10" />
          <VertexNode className="top-1/4 right-1/4" />
          <VertexNode className="bottom-1/4 left-1/4" />
          <Chevron className="top-12 left-1/2 -translate-x-1/2 opacity-20" />
          <Chevron className="bottom-12 left-1/2 -translate-x-1/2 rotate-180 opacity-20" />
          
          <TechLines className="top-1/4 right-32" />
          <TechLines className="bottom-1/4 left-32 rotate-180" />
          
          <GraphicFrame />
          {noiseTexture}
        </div>
      );

    case 'agenda':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
          <AgendaMatrix className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10" />
          <Grid size={30} opacity={0.02} color="slate" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-slate-50/80 to-transparent" />
          <div className="absolute top-0 left-0 w-[6px] h-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
          
          <CornerBrackets className="inset-12" />
          <Ring className="top-[-10%] right-[-10%] w-[400px] h-[400px] opacity-20" />
          <Dots className="top-48 right-[-20px] w-32 h-64 opacity-30" />
          
          <IconDecor icon={Layers} className="top-24 right-24" />
          <RotatingCircle className="top-32 right-12 w-24 h-24" duration={25} />
          <Brackets className="bottom-1/3 right-1/4" />
          <SignalWave className="top-1/2 right-4 opacity-10 rotate-90" />
          <ScannerSweep className="opacity-5 rotate-90" />
          <VertexNode className="top-12 right-24" />
          <DashedCircle className="bottom-12 right-12 w-48 h-48" duration={30} />
          <CircuitPath className="top-12 left-1/2 -translate-x-1/2 opacity-20" />
          <PulseCircle className="bottom-24 left-1/4 w-32 h-32" />
          <HexagonGrid className="bottom-24 left-32 rotate-90" />
          <DecorativePath className="bottom-24 left-32" />
          
          <CrossMarkers className="top-8 left-8 scale-75" />
          <LMarker className="top-4 right-1/2" />
          <LMarker className="bottom-4 left-1/2 rotate-90" />
          
          <MetricGrid className="bottom-12 right-12 opacity-10" />
          <BoxMarker className="top-48 right-32" />
          
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50/50 rounded-tr-[6rem]" />
          <Chevron className="bottom-20 left-12 scale-75 opacity-20" />
          
          <TechLines className="top-12 left-24 opacity-30" />
          <div className="absolute top-1/2 right-12 -translate-y-1/2 w-48 h-[1px] bg-slate-100 rotate-90" />
          
          <PlusGrid className="top-1/4 left-1/4 scale-125 opacity-15" />
          <CircleGrid className="bottom-1/3 right-1/4 scale-150 opacity-10" />
          <GeometricCluster className="top-1/2 right-1/4 scale-150 opacity-20" />

          {noiseTexture}
        </div>
      );

    case 'bullets':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
          <ListRail className="top-0 left-0 bottom-0 min-w-32 opacity-80" />
          <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-bl-full blur-[100px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-tr-full blur-[80px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 6%, transparent)' }} />
          <Grid size={50} opacity={0.03} />
          <Grid size={200} opacity={0.02} color="var(--accent-color, #6366f1)" />
          <div className="absolute top-0 left-0 w-4 h-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 4%, transparent)' }} />
          <div className="absolute top-0 left-0 w-px h-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 15%, transparent)' }} />
          
          <CornerBrackets className="inset-8" />
          <div className="absolute bottom-[-15%] right-[-10%] w-2/3 aspect-square rounded-full blur-[120px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 5%, transparent)' }} />
          
          <div className="absolute top-1/4 right-[10%] w-[300px] h-[300px] border-[20px] rounded-full" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 2%, transparent)' }} />
          
          <Dots className="top-24 left-16 w-32 h-[80%]" />
          <Dots className="top-12 right-48 w-64 h-32 opacity-20" color="var(--accent-color, #6366f1)" />
          
          <Ring className="top-[-5%] right-[-5%] w-[300px] h-[300px] opacity-40 rotate-12" />
          <Ring className="bottom-1/4 left-1/4 w-[500px] h-[500px] opacity-10" />
          
          <IconDecor icon={Database} className="top-48 right-12" />
          
          <RotatingCircle className="top-12 left-1/4 w-20 h-20 opacity-10" duration={12} />
          <Brackets className="top-1/4 right-32" />
          <SignalWave className="bottom-12 left-1/2 -translate-x-1/2 opacity-20" />
          <SignalWave className="top-32 right-1/4 rotate-90 opacity-10" />
          <DashedCircle className="top-12 left-1/4 w-28 h-28 opacity-5" duration={20} />
          <VertexNode className="top-1/2 right-8" />
          <VertexNode className="bottom-1/3 left-1/4 scale-150 opacity-20" />
          <ScannerSweep className="opacity-10" />
          <TargetReticle className="bottom-48 right-1/4 rotate-45" />
          <TargetReticle className="top-1/3 left-12 opacity-10 scale-150" />
          <CircuitPath className="top-1/2 right-12 rotate-90 scale-75" />
          <Coordinates className="top-24 left-12" />
          <Coordinates className="bottom-1/3 right-1/4" />
          <BarSystem className="top-1/2 left-8 -translate-y-1/2 rotate-90" />
          <DecorativePath className="bottom-48 left-12 scale-50" />
          
          <CrossMarkers className="top-12 right-24" />
          <LMarker className="top-4 left-4" />
          <LMarker className="bottom-24 right-8" />
          
          <MetricGrid className="top-1/4 left-12 scale-75" />
          <MetricGrid className="bottom-1/4 right-32 scale-150 opacity-10" />
          <BoxMarker className="bottom-32 left-32" />
          <BoxMarker className="top-1/2 right-16 scale-150" />
          
          <PlusGrid className="top-12 left-1/3 opacity-10" />
          <CircleGrid className="bottom-12 right-1/4 scale-150 opacity-15" />
          <GeometricCluster className="bottom-1/3 left-1/3 scale-125 opacity-20" />
          
          <div className="absolute bottom-16 right-16 flex flex-col gap-4">
            <ScanLines className="h-32 w-64 opacity-5" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-2 items-center opacity-25">
                <div className="w-16 h-[1px] bg-slate-300" />
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
              </div>
            ))}
          </div>
          
          {noiseTexture}
        </div>
      );

    case 'quote':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#f9faff]">
          <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at center, color-mix(in srgb, var(--accent-color, #6366f1) 4%, transparent) 0%, transparent 100%)` }} />
          <HugeQuoteMark className="-top-24 -left-12 rotate-[-5deg]" />
          <HugeQuoteMark className="-bottom-24 -right-12 rotate-[175deg]" />
          
          <Grid size={80} opacity={0.02} color="var(--accent-color, #6366f1)" />
          <CornerBrackets className="inset-24 opacity-30" />
          <Dots className="top-0 left-12 w-px h-full opacity-20 border-l-[40px] border-dotted" style={{ backgroundImage: 'none', borderImage: 'radial-gradient(color-mix(in srgb, var(--accent-color, #c7d2fe) 30%, transparent) 2px, transparent 2px) 1 repeat' }} />
          <Dots className="top-0 right-12 w-px h-full opacity-20 border-l-[40px] border-dotted" style={{ backgroundImage: 'none', borderImage: 'radial-gradient(color-mix(in srgb, var(--accent-color, #c7d2fe) 30%, transparent) 2px, transparent 2px) 1 repeat' }} />
          
          <Ring className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] opacity-10" />
          <TechLines className="top-24 left-1/2 -translate-x-1/2 opacity-20" />
          <TargetReticle className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[4] opacity-5" />
          <DashedCircle className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%]" />
          <VertexNode className="top-12 left-12" />
          <VertexNode className="top-12 right-12" />
          <ScannerSweep className="opacity-20 scale-x-75" />
          <SignalWave className="top-12 left-12 scale-150" />
          <Brackets className="bottom-12 right-12" />
          <PulseCircle className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96" />
          <CircuitPath className="top-1/4 left-12" />
          <CircuitPath className="bottom-1/4 right-12 rotate-180" />
          <BarSystem className="bottom-12 left-1/2 -translate-x-1/2" />
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-1">
            {[...Array(12)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 15%, transparent)' }} />)}
          </div>
          <RotatingCircle className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-slate-100" duration={40} />
          
          {noiseTexture}
        </div>
      );

    case 'images':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-100">
          <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(ellipse at center, color-mix(in srgb, var(--accent-color, #6366f1) 5%, transparent) 0%, transparent 100%)` }} />
          <Grid size={80} opacity={0.05} color="slate" />
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] border-[1px] rounded-full -translate-x-1/2 -translate-y-1/2" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-[1px] border-slate-500/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-[1200px] h-[1200px] border-[1px] border-dashed rounded-full -translate-x-1/2 -translate-y-1/2 rotate-45" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
          
          <PlusGrid className="top-12 left-12 opacity-10 drop-shadow-md" />
          <PlusGrid className="bottom-12 right-12 opacity-10 drop-shadow-md" />
          
          <CrossMarkers className="top-12 left-12" />
          <CrossMarkers className="bottom-12 right-12" />
          <CrossMarkers className="top-12 right-12" />
          <CrossMarkers className="bottom-12 left-12" />

          {noiseTexture}
        </div>
      );

    case 'image-text':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
          <LayoutFrames className="bottom-12 right-1/4 scale-75 opacity-40 origin-bottom-right" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/60 skew-x-[-12deg] translate-x-1/4" />
          <div className="absolute bottom-0 right-0 w-[80%] h-[80%] rounded-tl-full blur-[100px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 15%, transparent)' }} />
          <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-br-full blur-[80px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
          <Grid size={40} opacity={0.02} />
          <Grid size={120} opacity={0.03} color="var(--accent-color, #6366f1)" />
          
          <CornerBrackets className="inset-10" />
          <div className="absolute top-16 left-12 w-32 h-2 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
          <div className="absolute top-20 left-12 w-16 h-1 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
          <Dots className="bottom-16 left-12 w-48 h-48 opacity-40" />
          
          <Ring className="top-[-10%] right-[-10%] w-[400px] h-[400px] opacity-30" />
          <Ring className="top-1/4 right-1/4 w-[600px] h-[600px] opacity-10" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 40%, transparent)' }} />
          
          <HexagonGrid className="top-12 right-12 scale-125" />
          <HexagonGrid className="bottom-48 left-24 scale-150 opacity-20" />
          <SignalWave className="top-1/4 right-32 opacity-10" />
          <Brackets className="bottom-1/4 left-1/3" />
          <BarSystem className="bottom-12 right-32" />
          <CircuitPath className="top-1/2 left-32 -translate-y-1/2" />
          <Coordinates className="bottom-24 right-48" />
          <TargetReticle className="top-1/4 right-32" />
          <TargetReticle className="bottom-1/3 left-16 scale-150 opacity-10" />

          <PlusGrid className="top-1/3 left-1/2 opacity-15" />
          <CircleGrid className="bottom-1/4 left-1/4 scale-150 opacity-20" />
          <GeometricCluster className="bottom-12 right-1/4 scale-75 opacity-25" />
          
          <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-10 h-1.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 5%, transparent)' }} />
            ))}
          </div>
          
          <div className="absolute bottom-1/4 right-32 flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-sm border" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 20%, transparent)' }} />
            ))}
          </div>
          
          <TechLines className="top-1/4 left-24 opacity-40" />
          <ScanLines className="w-64 h-full left-0 opacity-5" />
          
          {noiseTexture}
        </div>
      );

    case 'text':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
          <AbstractTextBlocks className="top-1/4 right-[5%] rotate-[-2deg]" />
          <div className="absolute top-0 left-0 w-full h-2/5" style={{ background: `linear-gradient(to bottom, color-mix(in srgb, var(--accent-color, #6366f1) 8%, transparent), transparent)` }} />
          <div className="absolute bottom-0 right-0 w-1/2 h-full blur-3xl opacity-30" style={{ background: `linear-gradient(to left, color-mix(in srgb, var(--accent-color, #6366f1) 15%, transparent), transparent)` }} />
          <Grid size={60} opacity={0.03} color="var(--accent-color, #6366f1)" />
          <Grid size={120} opacity={0.02} color="slate" />
          
          <div className="absolute top-1/3 right-1/4 w-[800px] h-[800px] border-[1px] rounded-full" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 5%, transparent)' }} />
          <div className="absolute top-1/3 right-1/4 w-[840px] h-[840px] border-[1px] border-dashed rounded-full" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 5%, transparent)' }} />
          
          <CornerBrackets />
          <Ring className="top-12 right-12 w-[350px] h-[350px] opacity-30" />
          <Dots className="top-32 right-24 w-40 h-40 opacity-40" />
          
          <RotatingCircle className="top-48 right-48 w-64 h-64" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 5%, transparent)' }} duration={60} />
          <DashedCircle className="top-12 right-12 w-[400px] h-[400px] opacity-10" duration={50} />
          <ScannerSweep className="opacity-5 rotate-45" />
          <VertexNode className="bottom-1/4 left-32" />
          <BarSystem className="top-8 right-1/2 translate-x-1/2" />
          <CircuitPath className="bottom-1/4 left-24 opacity-20" />
          <Coordinates className="top-24 right-32" />
          <HexagonGrid className="bottom-12 right-12 opacity-5" />
          <DecorativePath className="top-12 left-24" />
          
          <PlusGrid className="top-1/4 right-1/4 scale-125 opacity-15" />
          <CircleGrid className="bottom-1/3 left-1/4 scale-150 opacity-20" />
          <GeometricCluster className="bottom-12 left-1/3 scale-150 opacity-20" />
          
          <CrossMarkers className="bottom-12 right-24" />
          <LMarker className="top-8 right-8" />
          <LMarker className="bottom-4 left-1/2" />
          
          <MetricGrid className="top-32 right-1/4 rotate-12 scale-50" />
          <BoxMarker className="top-12 left-12" />

          <PlusGrid className="bottom-1/3 right-1/3 opacity-20" />
          <CircleGrid className="top-1/4 left-1/3 scale-125 opacity-15" />
          <GeometricCluster className="top-12 right-1/4 scale-150 opacity-20" />
          
          <IconDecor icon={Shield} className="bottom-24 left-1/2 -translate-x-1/2" />
          
          <div className="absolute bottom-16 left-16 w-64 h-3 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 5%, transparent)' }} />
          <Chevron className="bottom-32 left-16 scale-75 opacity-20" />
          
          <TechLines className="bottom-48 right-24 opacity-30" />
          <ScanLines className="h-64 bottom-0 opacity-5" />
          
          <div className="absolute top-1/4 left-1/4 grid grid-cols-5 gap-2 opacity-10">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
            ))}
          </div>

          {noiseTexture}
        </div>
      );

    case 'split-text':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
          <SplitDividers className="top-1/2 left-1/2 w-full h-full" />
          <div className="absolute left-1/2 top-0 w-px h-full bg-slate-200" />
          <Grid size={45} opacity={0.02} color="slate" />
          
          <CornerBrackets className="inset-16 opacity-50" />
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-14 h-14 bg-white border-[6px] rounded-full z-10 shadow-sm" style={{ borderColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 10%, transparent)' }} />
          
          <Dots className="top-24 left-10 w-20 h-40 opacity-30" />
          <Dots className="top-24 right-10 w-20 h-40 opacity-30" />
          
          <TargetReticle className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150" />
          <SignalWave className="top-24 left-1/2 -translate-x-1/2" />
          <Brackets className="bottom-24 left-12" />
          <Brackets className="bottom-24 right-12" />
          <ScannerSweep className="opacity-10" />
          <VertexNode className="top-1/2 left-1/4" />
          <VertexNode className="top-1/2 right-1/4" />
          <PulseCircle className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48" />
          <CircuitPath className="bottom-12 left-1/2 -translate-x-1/2 scale-75" />
          <BarSystem className="top-12 left-12" />
          <BarSystem className="top-12 right-12" />
          
          <Ring className="bottom-[-10%] left-[-10%] w-[300px] h-[300px] opacity-20" />
          <Ring className="bottom-[-10%] right-[-10%] w-[300px] h-[300px] opacity-20" />
          
          <RotatingCircle className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-slate-100" duration={40} />
          <DecorativePath className="top-32 left-1/4" />
          <DecorativePath className="top-32 right-1/4" />
          
          <div className="absolute bottom-0 left-0 w-1/3 h-40 rounded-tr-[5rem]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #6366f1) 5%, transparent)' }} />
          <div className="absolute bottom-0 right-0 w-1/3 h-40 bg-slate-50/40 rounded-tl-[5rem]" />
          
          <ScanLines className="w-1/2 left-0 h-full opacity-5" />
          <ScanLines className="w-1/2 right-0 h-full opacity-5" />
          
          <PlusGrid className="top-1/4 left-12 scale-125 opacity-15" />
          <CircleGrid className="bottom-1/3 right-1/4 scale-150 opacity-10" />
          <GeometricCluster className="top-1/2 left-1/4 scale-150 opacity-20" />
          <GeometricCluster className="bottom-1/4 right-32 scale-75 opacity-15" />

          {noiseTexture}
        </div>
      );


    case 'chart':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#fbfcff]">
          <MetricGrid className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[2.5] rotate-12 opacity-[0.03]" />
          <Grid size={20} opacity={0.02} color="slate" />
          <Grid size={100} opacity={0.03} color="var(--accent-color, #6366f1)" />
          
          <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/40" />
          <div className="absolute top-0 left-0 w-1 h-full opacity-10" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
          
          <CornerBrackets className="inset-12 opacity-30" />
          
          <div className="absolute bottom-12 left-12 flex items-end gap-2 opacity-20">
             {[...Array(8)].map((_, i) => (
                <div key={i} className="w-1.5 rounded-t-sm" style={{ height: `${20 + Math.random() * 60}px`, backgroundColor: 'var(--accent-color, #6366f1)' }} />
             ))}
          </div>
          
          <SignalWave className="top-1/4 left-1/4 rotate-12 opacity-10" />
          <TargetReticle className="top-24 right-1/4 opacity-15" />
          
          <div className="absolute bottom-24 right-16 flex flex-col gap-2 items-end opacity-20">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-1 bg-slate-200 rounded-full" style={{ width: `${60 + Math.random() * 120}px` }} />
            ))}
          </div>
          
          <RotatingCircle className="top-1/2 right-12 w-64 h-64 border-slate-100 opacity-20" duration={60} />
          <DashedCircle className="top-1/2 right-12 w-80 h-80 opacity-10" duration={80} />
          
          <TechLines className="top-48 right-12 opacity-30" />
          <ScanLines className="opacity-[0.03]" />
          
          <PlusGrid className="top-1/4 left-1/3 opacity-10" />
          <CircleGrid className="bottom-1/4 right-1/4 scale-150 opacity-15" />
          
          <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-6 opacity-20">
            <Activity size={20} style={{ color: 'var(--accent-color, #6366f1)' }} />
            <Database size={20} style={{ color: 'var(--accent-color, #6366f1)' }} />
            <Cpu size={20} style={{ color: 'var(--accent-color, #6366f1)' }} />
          </div>

          <Dots className="top-12 left-12 w-32 h-64 opacity-20" />
          <Brackets className="top-1/3 left-1/4 rotate-12 opacity-20" />
          
          {noiseTexture}
        </div>
      );

    default:
      return null;
  }
};

import { Sparkles, Zap, Gamepad2, Cpu, Tent, Bird, Heart, User, Flame } from 'lucide-react';
import { AccentColor, VisualStyle } from '../types';

export interface ThemeOption {
  id: AccentColor;
  name: string;
  colors: string[];
  style: VisualStyle;
}

export interface VisualStyleOption {
  id: VisualStyle;
  name: string;
  desc: string;
  icon: any;
  bestFit: AccentColor;
}

export const THEMES: ThemeOption[] = [
  // Modern
  { id: 'indigo', name: 'Indigo', colors: ['bg-indigo-600', 'bg-indigo-400'], style: 'modern' },
  { id: 'emerald', name: 'Emerald', colors: ['bg-emerald-600', 'bg-emerald-400'], style: 'modern' },
  { id: 'rose', name: 'Rose', colors: ['bg-rose-600', 'bg-rose-400'], style: 'modern' },
  { id: 'amber', name: 'Amber', colors: ['bg-amber-600', 'bg-amber-400'], style: 'modern' },
  { id: 'cyan', name: 'Cyan', colors: ['bg-cyan-500', 'bg-cyan-300'], style: 'modern' },
  { id: 'lime', name: 'Lime', colors: ['bg-lime-500', 'bg-lime-300'], style: 'modern' },
  
  // Brutalist
  { id: 'brutal-red', name: 'Brutal Red', colors: ['bg-[#D32F2F]', 'bg-[#B71C1C]'], style: 'brutalist' },
  { id: 'brutal-blue', name: 'Brutal Blue', colors: ['bg-[#1976D2]', 'bg-[#0D47A1]'], style: 'brutalist' },
  { id: 'brutal-yellow', name: 'Brutal Yellow', colors: ['bg-[#FBC02D]', 'bg-[#F57F17]'], style: 'brutalist' },
  { id: 'brutal-green', name: 'Brutal Green', colors: ['bg-[#388E3C]', 'bg-[#1B5E20]'], style: 'brutalist' },
  
  // Minecraft
  { id: 'creeper-green', name: 'Creeper', colors: ['bg-[#5eed5e]', 'bg-[#3aae3a]'], style: 'game-minecraft' },
  { id: 'enderman-purple', name: 'Enderman', colors: ['bg-[#800080]', 'bg-[#4d004d]'], style: 'game-minecraft' },

  // TADC
  { id: 'tadc-kinger', name: 'Kinger', colors: ['bg-[#6b21a8]', 'bg-[#4c1d95]'], style: 'tadc' },
  { id: 'tadc-caine', name: 'Caine', colors: ['bg-[#dc2626]', 'bg-[#991b1b]'], style: 'tadc' },

  // Duck
  { id: 'duck-yellow', name: 'Rubber Yellow', colors: ['bg-[#FFD700]', 'bg-[#FFA500]'], style: 'duck' },
  { id: 'duck-orange', name: 'Beak Orange', colors: ['bg-[#FF8C00]', 'bg-[#FF4500]'], style: 'duck' },
  { id: 'duck-blue', name: 'Bath Blue', colors: ['bg-[#00BFFF]', 'bg-[#1E90FF]'], style: 'duck' },
  { id: 'duck-white', name: 'Soap White', colors: ['bg-[#F0F8FF]', 'bg-[#E6E6FA]'], style: 'duck' },

  // Undertale
  { id: 'undertale-red', name: 'Chara (Determination)', colors: ['bg-[#ff0000]', 'bg-[#aa0000]'], style: 'undertale' },
  { id: 'undertale-blue', name: 'Sans (Integrity)', colors: ['bg-[#00ffff]', 'bg-[#00aaaa]'], style: 'undertale' },

  // Saidi
  { id: 'saidi-white', name: 'Desert Heritage', colors: ['bg-[#f5f5dc]', 'bg-[#3d2c1e]'], style: 'saidi' },
  { id: 'saidi-cream', name: 'Classic Cream', colors: ['bg-[#fff8e1]', 'bg-[#b8860b]'], style: 'saidi' },
  { id: 'saidi-dark', name: 'Night Dignity', colors: ['bg-[#1a1a1a]', 'bg-[#f5f5dc]'], style: 'saidi' },
  { id: 'saidi-gold', name: 'Royal Pride', colors: ['bg-[#ffd700]', 'bg-[#8b0000]'], style: 'saidi' },

  // Arcane
  { id: 'arcane-violet', name: 'Chaos Violet', colors: ['bg-[#8a2be2]', 'bg-[#000000]'], style: 'arcane' },
  { id: 'arcane-red', name: 'Unstable Red', colors: ['bg-[#ef4444]', 'bg-[#000000]'], style: 'arcane' },
  { id: 'arcane-blue', name: 'Digital Blue', colors: ['bg-[#3b82f6]', 'bg-[#000000]'], style: 'arcane' },
  { id: 'arcane-gold', name: 'Hextech Gold', colors: ['bg-[#f59e0b]', 'bg-[#000000]'], style: 'arcane' },
  { id: 'arcane-green', name: 'Chemtech Green', colors: ['bg-[#10b981]', 'bg-[#000000]'], style: 'arcane' },
  { id: 'arcane-neon-pink', name: 'Neon Pink', colors: ['bg-[#ff00ff]', 'bg-[#000000]'], style: 'arcane' },
  { id: 'arcane-plasma-cyan', name: 'Plasma Cyan', colors: ['bg-[#00ffff]', 'bg-[#000000]'], style: 'arcane' },
  { id: 'arcane-void-purple', name: 'Void Singularity', colors: ['bg-[#4a00e0]', 'bg-[#000000]'], style: 'arcane' },
  { id: 'arcane-solar-flare', name: 'Solar Flare', colors: ['bg-[#ff3300]', 'bg-[#000000]'], style: 'arcane' },

  // Adventure Time
  { id: 'finn-blue', name: 'Finn', colors: ['bg-[#00A2E8]', 'bg-[#FFFFFF]'], style: 'adventure-time' },
  { id: 'jake-yellow', name: 'Jake', colors: ['bg-[#FFC90E]', 'bg-[#FFA500]'], style: 'adventure-time' },

  // Ultimate
  { id: 'ultimate-cosmic', name: 'Cosmic Ultimate', colors: ['bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600', 'bg-black'], style: 'ultimate' },
  { id: 'ultimate-easter', name: 'Easter Ultimate', colors: ['bg-gradient-to-r from-green-200 via-yellow-100 to-pink-200', 'bg-[#fdf2f8]'], style: 'ultimate' },

  // Superhero
  { id: 'superhero-spiderman', name: 'Spiderman', colors: ['bg-[#E23636]', 'bg-[#5048E5]'], style: 'superhero' },
  { id: 'superhero-batman', name: 'Batman', colors: ['bg-[#1A1A1A]', 'bg-[#F5D300]'], style: 'superhero' },
  { id: 'superhero-superman', name: 'Superman', colors: ['bg-[#005BBF]', 'bg-[#ED1C24]'], style: 'superhero' },

  // Hollow Knight
  { id: 'hollow-knight-pale', name: 'Pale Knight', colors: ['bg-[#f5f5f5]', 'bg-[#1a1a1a]'], style: 'hollow-knight' },
  { id: 'hollow-knight-silksong', name: 'Silksong', colors: ['bg-[#e63946]', 'bg-[#ffb703]'], style: 'hollow-knight' },
  { id: 'kitler', name: 'Kitler', colors: ['bg-[#FF0000]', 'bg-[#000000]'], style: 'kitler' },

  // Virus
  { id: 'virus-marburg', name: 'Marburg', colors: ['bg-red-900', 'bg-red-500'], style: 'virus' },
  { id: 'virus-rabies', name: 'Rabies', colors: ['bg-green-900', 'bg-green-500'], style: 'virus' },
  { id: 'virus-hiv', name: 'HIV', colors: ['bg-fuchsia-900', 'bg-fuchsia-500'], style: 'virus' },
  { id: 'virus-smallpox', name: 'Smallpox', colors: ['bg-amber-900', 'bg-amber-500'], style: 'virus' },
  { id: 'virus-influenza', name: 'Influenza', colors: ['bg-cyan-900', 'bg-cyan-500'], style: 'virus' },

  // Liquid Glass
  { id: 'liquid-glass-blue', name: 'Liquid Glass', colors: ['bg-[#0033cc]', 'bg-[#66b3ff]'], style: 'liquid-glass' },

  // Fluid
  { id: 'fluid-blue', name: 'Ocean Fluid', colors: ['bg-blue-600', 'bg-blue-300'], style: 'fluid' },
  { id: 'fluid-neon', name: 'Neon Fluid', colors: ['bg-fuchsia-600', 'bg-cyan-400'], style: 'fluid' },
  { id: 'fluid-dark', name: 'Dark Fluid', colors: ['bg-indigo-900', 'bg-slate-800'], style: 'fluid' },
  { id: 'fluid-gold', name: 'Golden Fluid', colors: ['bg-amber-600', 'bg-yellow-400'], style: 'fluid' },
  { id: 'fluid-emerald', name: 'Emerald Fluid', colors: ['bg-emerald-600', 'bg-green-400'], style: 'fluid' },
  { id: 'fluid-crimson', name: 'Crimson Fluid', colors: ['bg-red-600', 'bg-rose-400'], style: 'fluid' },
  { id: 'fluid-violet', name: 'Violet Fluid', colors: ['bg-purple-600', 'bg-violet-400'], style: 'fluid' },

  // Black Hole
  { id: 'black-hole-dark', name: 'Event Horizon', colors: ['bg-gray-900', 'bg-black'], style: 'black-hole' },
  { id: 'space-black-hole-orange', name: 'Accretion Disk', colors: ['bg-orange-600', 'bg-orange-800'], style: 'black-hole' },
  { id: 'neural-black-hole', name: 'Neural Synapse', colors: ['bg-cyan-500', 'bg-blue-600'], style: 'black-hole' },
  { id: 'puddle-black-hole', name: 'Puddle', colors: ['bg-cyan-600', 'bg-blue-800'], style: 'black-hole' },
  { id: 'bubbles-blackhole', name: 'Bubbles', colors: ['bg-teal-500', 'bg-emerald-600'], style: 'black-hole' },
  { id: 'emissive-black-hole', name: 'Emissive Dissolve', colors: ['bg-blue-500', 'bg-indigo-600'], style: 'black-hole' },
  { id: 'geometric-aura-black-hole', name: '3D Geometric Aura', colors: ['bg-sky-500', 'bg-slate-900'], style: 'black-hole' },
];

export const VISUAL_STYLES: VisualStyleOption[] = [
  { id: 'modern', name: 'Modern', desc: 'Sleek, rounded, and smooth', icon: Sparkles, bestFit: 'indigo' },
  { id: 'brutalist', name: 'Brutalist', desc: 'Bold, sharp, and high-contrast', icon: Zap, bestFit: 'brutal-red' },
  { id: 'game-minecraft', name: 'Minecraft', desc: 'Pixelated, blocky, and nostalgic', icon: Gamepad2, bestFit: 'creeper-green' },
  { id: 'tadc', name: 'TADC', desc: 'The Amazing Digital Circus style', icon: Tent, bestFit: 'tadc-caine' },
  { id: 'duck', name: 'Duck', desc: 'Quack! Yellow rubber duck style', icon: Bird, bestFit: 'duck-yellow' },
  { id: 'undertale', name: 'Undertale', desc: 'Stay determined. Retro RPG style', icon: Heart, bestFit: 'undertale-red' },
  { id: 'saidi', name: 'الصعيدي', desc: 'Heritage, dignity, and pride', icon: User, bestFit: 'saidi-white' },
  { id: 'arcane', name: 'Arcane', desc: 'Chaos incarnate. Violet and black.', icon: Flame, bestFit: 'arcane-violet' },
  { id: 'adventure-time', name: 'Adventure Time', desc: 'Mathematical! Finn and Jake style', icon: Sparkles, bestFit: 'finn-blue' },
  { id: 'ultimate', name: 'Ultimate', desc: 'The ultimate visual experience', icon: Sparkles, bestFit: 'ultimate-cosmic' },
  { id: 'superhero', name: 'Superhero', desc: 'Comic-inspired heroic themes', icon: Zap, bestFit: 'superhero-spiderman' },
  { id: 'hollow-knight', name: 'Hollow Knight', desc: 'Ancient bugs and silk threads', icon: Gamepad2, bestFit: 'hollow-knight-pale' },
  { id: 'kitler', name: 'Kitler', desc: 'Bright red, black, and white. Refined.', icon: Flame, bestFit: 'kitler' },
  { id: 'virus', name: 'Biohazard', desc: 'Deadliest viruses in history', icon: Zap, bestFit: 'virus-marburg' },
  { id: 'liquid-glass', name: 'Liquid Glass', desc: 'Modern, frosted glassmorphism', icon: Sparkles, bestFit: 'liquid-glass-blue' },
  { id: 'fluid', name: 'Fluid', desc: 'Perfect fluid liquid effect', icon: Flame, bestFit: 'fluid-blue' },
  { id: 'black-hole', name: 'Black Hole', desc: 'Event horizon with cursor tubes', icon: Sparkles, bestFit: 'black-hole-dark' },
];

export const FONTS = [
  { id: 'sans', name: 'Modern Sans', family: '"Plus Jakarta Sans", sans-serif' },
  { id: 'mono', name: 'JetBrains Mono', family: '"JetBrains Mono", monospace' },
  { id: 'display', name: 'Space Grotesk', family: '"Space Grotesk", sans-serif' },
  { id: 'pixel', name: 'Press Start 2P', family: '"Press Start 2P", cursive' },
  { id: 'serif', name: 'Amiri Serif', family: '"Amiri", serif' },
];

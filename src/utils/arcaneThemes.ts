import { AccentColor } from '../types';

export interface ArcaneStyle {
  border: string;
  glow: string;
  text: string;
  bg: string;
  accent: string;
  accentText: string;
  card: string;
  button: string;
  pattern?: string;
  animation?: string;
  font?: string;
  iconGlow?: string;
  progress?: string;
  mapItem?: string;
  option?: string;
  overlay?: string;
  markdown?: string;
  interactiveText?: string;
}

export const getArcaneStyles = (accentColor: AccentColor): ArcaneStyle => {
  switch (accentColor) {
    case 'arcane-red':
      return {
        border: 'border-red-600/60 shadow-[0_0_15px_rgba(220,38,38,0.4)]',
        glow: 'shadow-[0_0_30px_rgba(220,38,38,0.5)]',
        text: 'text-red-500 font-black tracking-tighter',
        bg: 'bg-red-950/20 backdrop-blur-xl',
        accent: 'bg-red-600',
        accentText: 'text-red-100',
        card: 'rounded-none border-l-4 border-red-600 bg-slate-950/90',
        button: 'bg-red-600 hover:bg-red-500 text-white uppercase italic skew-x-[-10deg]',
        iconGlow: 'drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]',
        animation: 'animate-pulse',
        progress: 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]',
        mapItem: 'rounded-none skew-x-[-10deg]',
        option: 'border-l-2 border-red-600 bg-red-950/10',
        overlay: 'bg-[repeating-linear-gradient(90deg,rgba(220,38,38,0.05)_0px,rgba(220,38,38,0.05)_1px,transparent_1px,transparent_10px)]',
        markdown: 'prose-red dark:prose-invert prose-p:text-red-900/80 dark:prose-p:text-red-200/80',
        interactiveText: 'text-red-500 font-black tracking-tighter'
      };
    case 'arcane-blue':
      return {
        border: 'border-cyan-500/40 border-dashed',
        glow: 'shadow-[0_0_25px_rgba(6,182,212,0.4)]',
        text: 'text-cyan-400 font-mono tracking-widest',
        bg: 'bg-slate-950/80 border-cyan-500/20',
        accent: 'bg-cyan-500',
        accentText: 'text-cyan-950',
        card: 'rounded-sm border border-cyan-500/30 bg-slate-900/95 relative overflow-hidden before:absolute before:inset-0 before:bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] before:bg-[length:100%_2px,3px_100%] before:pointer-events-none',
        button: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold border-b-4 border-cyan-700 active:border-b-0 active:translate-y-1',
        iconGlow: 'drop-shadow-[0_0_10px_rgba(6,182,212,0.9)]',
        progress: 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]',
        mapItem: 'rounded-sm border-dashed',
        option: 'font-mono border border-cyan-500/20 bg-cyan-950/10',
        overlay: 'bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:20px_20px]',
        markdown: 'prose-cyan dark:prose-invert prose-p:text-cyan-900/80 dark:prose-p:text-cyan-200/80 font-mono',
        interactiveText: 'text-cyan-400 font-mono tracking-widest'
      };
    case 'arcane-gold':
      return {
        border: 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
        glow: 'shadow-[0_0_40px_rgba(245,158,11,0.3)]',
        text: 'text-amber-500 font-serif italic',
        bg: 'bg-amber-950/10 backdrop-blur-md border-amber-500/20',
        accent: 'bg-gradient-to-br from-amber-400 to-amber-600',
        accentText: 'text-amber-950',
        card: 'rounded-[2rem] border-2 border-amber-500/40 bg-slate-900/90 shadow-[inset_0_0_30px_rgba(245,158,11,0.1)]',
        button: 'bg-amber-600 hover:bg-amber-500 text-white rounded-full px-6 py-2 shadow-lg hover:shadow-amber-500/40 transition-all duration-300',
        iconGlow: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]',
        progress: 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
        mapItem: 'rounded-full border-2',
        option: 'font-serif italic border-amber-500/20 bg-amber-950/5',
        overlay: 'bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.05),transparent)]',
        markdown: 'prose-amber dark:prose-invert prose-p:text-amber-900/80 dark:prose-p:text-amber-200/80 font-serif italic',
        interactiveText: 'text-amber-500 font-serif italic'
      };
    case 'arcane-green':
      return {
        border: 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        glow: 'shadow-[0_0_35px_rgba(16,185,129,0.4)]',
        text: 'text-emerald-400 font-bold tracking-tight',
        bg: 'bg-emerald-950/20 border-emerald-500/30',
        accent: 'bg-emerald-500',
        accentText: 'text-emerald-950',
        card: 'rounded-3xl border-2 border-emerald-500/20 bg-slate-950/90 overflow-hidden relative after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent)] after:pointer-events-none',
        button: 'bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl border-t border-emerald-400/30 shadow-xl',
        iconGlow: 'drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]',
        progress: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
        mapItem: 'rounded-xl border-emerald-500/30',
        option: 'rounded-xl border border-emerald-500/20 bg-emerald-950/10',
        overlay: 'bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.05),transparent)]',
        markdown: 'prose-emerald dark:prose-invert prose-p:text-emerald-900/80 dark:prose-p:text-emerald-200/80 font-bold',
        interactiveText: 'text-emerald-400 font-bold tracking-tight'
      };
    case 'arcane-neon-pink':
      return {
        border: 'border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.4)]',
        glow: 'shadow-[0_0_40px_rgba(236,72,153,0.5)]',
        text: 'text-pink-400 font-black italic tracking-widest uppercase',
        bg: 'bg-pink-950/30 backdrop-blur-2xl border-pink-500/40',
        accent: 'bg-pink-500',
        accentText: 'text-white',
        card: 'rounded-none border-4 border-pink-500 bg-slate-950/95 skew-x-[-2deg] shadow-[10px_10px_0_0_rgba(236,72,153,0.3)]',
        button: 'bg-pink-500 hover:bg-pink-400 text-white font-black tracking-tighter uppercase px-8 py-3 skew-x-[5deg]',
        iconGlow: 'drop-shadow-[0_0_15px_rgba(236,72,153,1)]',
        progress: 'bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.6)]',
        mapItem: 'rounded-none skew-x-[5deg]',
        option: 'rounded-none border-2 border-pink-500/30 bg-pink-950/10',
        overlay: 'bg-[repeating-linear-gradient(-45deg,rgba(236,72,153,0.05)_0px,rgba(236,72,153,0.05)_2px,transparent_2px,transparent_12px)]',
        markdown: 'prose-pink dark:prose-invert prose-p:text-pink-900/80 dark:prose-p:text-pink-200/80 font-black italic tracking-widest uppercase',
        interactiveText: 'text-pink-400 font-black italic tracking-widest uppercase'
      };
    case 'arcane-plasma-cyan':
      return {
        border: 'border-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.3)]',
        glow: 'shadow-[0_0_50px_rgba(34,211,238,0.4)]',
        text: 'text-cyan-300 font-light tracking-[0.2em]',
        bg: 'bg-cyan-950/20 border-cyan-400/20',
        accent: 'bg-cyan-400',
        accentText: 'text-cyan-950',
        card: 'rounded-[3rem] border border-cyan-400/30 bg-slate-900/80 backdrop-blur-3xl shadow-[inset_0_0_50px_rgba(34,211,238,0.05)]',
        button: 'bg-cyan-400 hover:bg-cyan-300 text-cyan-950 rounded-full font-black tracking-widest transition-all duration-500 hover:scale-110 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]',
        iconGlow: 'drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]',
        progress: 'bg-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.5)]',
        mapItem: 'rounded-full border-cyan-400/40',
        option: 'rounded-full border border-cyan-400/20 bg-cyan-950/10',
        overlay: 'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05),transparent_60%)]',
        markdown: 'prose-cyan dark:prose-invert prose-p:text-cyan-900/80 dark:prose-p:text-cyan-200/80 font-light tracking-[0.2em]',
        interactiveText: 'text-cyan-300 font-light tracking-[0.2em]'
      };
    case 'arcane-void-purple':
      return {
        border: 'border-indigo-600/40 shadow-[0_0_30px_rgba(79,70,229,0.2)]',
        glow: 'shadow-[0_0_60px_rgba(79,70,229,0.3)]',
        text: 'text-indigo-400 font-thin tracking-widest',
        bg: 'bg-black/90 border-indigo-900/50',
        accent: 'bg-indigo-600',
        accentText: 'text-white',
        card: 'rounded-full border-2 border-indigo-900/30 bg-black/95 shadow-[0_0_100px_rgba(79,70,229,0.1)] p-12',
        button: 'bg-indigo-900/50 hover:bg-indigo-800 text-indigo-100 border border-indigo-500/30 rounded-full transition-all duration-700 hover:tracking-[0.5em]',
        iconGlow: 'drop-shadow-[0_0_20px_rgba(79,70,229,0.6)]',
        progress: 'bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.4)]',
        mapItem: 'rounded-full border-indigo-600/30',
        option: 'rounded-full border border-indigo-600/20 bg-indigo-950/10',
        overlay: 'bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.02),transparent_80%)]',
        markdown: 'prose-indigo dark:prose-invert prose-p:text-indigo-900/80 dark:prose-p:text-indigo-200/80 font-thin tracking-widest',
        interactiveText: 'text-indigo-400 font-thin tracking-widest'
      };
    case 'arcane-solar-flare':
      return {
        border: 'border-orange-500/60 shadow-[0_0_25px_rgba(249,115,22,0.4)]',
        glow: 'shadow-[0_0_50px_rgba(249,115,22,0.5)]',
        text: 'text-orange-400 font-black tracking-tighter',
        bg: 'bg-orange-950/30 border-orange-500/40',
        accent: 'bg-orange-500',
        accentText: 'text-white',
        card: 'rounded-xl border-b-8 border-orange-600 bg-slate-950/90 shadow-[0_20px_50px_rgba(249,115,22,0.2)]',
        button: 'bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-white font-black rounded-lg shadow-2xl transition-transform hover:-translate-y-1',
        iconGlow: 'drop-shadow-[0_0_15px_rgba(249,115,22,0.9)]',
        progress: 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]',
        mapItem: 'rounded-lg border-orange-500/40',
        option: 'rounded-lg border border-orange-500/20 bg-orange-950/10',
        overlay: 'bg-[linear-gradient(45deg,rgba(249,115,22,0.05)_0%,transparent_70%)]',
        markdown: 'prose-orange dark:prose-invert prose-p:text-orange-900/80 dark:prose-p:text-orange-200/80 font-black tracking-tighter',
        interactiveText: 'text-orange-400 font-black tracking-tighter'
      };
    case 'virus-marburg':
      return {
        border: 'dark:border-red-600/80 border-red-500/80 dark:shadow-[0_0_20px_rgba(220,38,38,0.6)] shadow-[0_0_20px_rgba(248,113,113,0.6)]',
        glow: 'dark:shadow-[0_0_40px_rgba(220,38,38,0.7)] shadow-[0_0_40px_rgba(248,113,113,0.7)]',
        text: 'dark:text-red-500 text-red-700 font-sans tracking-tight drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]',
        bg: 'dark:bg-slate-950/90 bg-red-50/90 backdrop-blur-xl dark:border-red-600/40 border-red-400/40',
        accent: 'dark:bg-red-600 bg-red-500',
        accentText: 'text-white',
        card: 'dark:rounded-none rounded-[2rem] border-y-4 dark:border-red-600 border-red-500 dark:bg-gradient-to-b dark:from-slate-950/95 dark:to-red-950/90 bg-gradient-to-b from-white/95 to-red-50/90 backdrop-blur-xl dark:shadow-[inset_0_0_40px_rgba(220,38,38,0.2),0_10px_40px_rgba(0,0,0,0.8)] shadow-[inset_0_0_40px_rgba(248,113,113,0.2),0_10px_40px_rgba(248,113,113,0.3)] relative overflow-hidden before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.03)_10px,rgba(220,38,38,0.03)_20px)] before:pointer-events-none',
        button: 'relative overflow-hidden dark:bg-red-950/80 bg-red-100/80 dark:hover:bg-red-900 hover:bg-red-200 text-red-700 dark:text-red-400 dark:rounded-none rounded-full border border-red-500/50 hover:border-red-400 dark:shadow-[0_0_20px_rgba(220,38,38,0.5)] shadow-[0_5px_20px_rgba(248,113,113,0.4)] transition-all duration-300 before:absolute before:inset-0 before:bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,rgba(220,38,38,0.1)_4px,rgba(220,38,38,0.1)_8px)] before:pointer-events-none hover:scale-[1.02]',
        iconGlow: 'dark:drop-shadow-[0_0_15px_rgba(220,38,38,0.9)] drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]',
        progress: 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse-glow',
        mapItem: 'rounded-none rotate-45 scale-75 border-2',
        option: 'border-l-4 border-red-600 dark:bg-red-950/20 bg-red-50/50',
        overlay: 'bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.05),transparent_70%)]',
        markdown: 'prose-red dark:prose-invert prose-p:text-red-900/80 dark:prose-p:text-red-200/80 prose-headings:text-red-600 dark:prose-headings:text-red-400 prose-strong:text-red-700 dark:prose-strong:text-red-300',
        interactiveText: 'text-red-600 dark:text-red-400 font-bold animate-pulse-glow'
      };
    case 'virus-rabies':
      return {
        border: 'dark:border-green-500/80 border-lime-500/80 dark:shadow-[0_0_20px_rgba(34,197,94,0.6)] shadow-[0_0_20px_rgba(163,230,53,0.6)]',
        glow: 'dark:shadow-[0_0_40px_rgba(34,197,94,0.7)] shadow-[0_0_40px_rgba(163,230,53,0.7)]',
        text: 'dark:text-green-400 text-lime-700 font-mono tracking-widest drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]',
        bg: 'dark:bg-slate-950/90 bg-lime-50/90 backdrop-blur-xl dark:border-green-500/40 border-lime-400/40',
        accent: 'dark:bg-green-600 bg-lime-500',
        accentText: 'text-white',
        card: 'dark:rounded-lg rounded-[2rem] border-x-4 dark:border-green-500 border-lime-500 dark:bg-gradient-to-b dark:from-slate-950/95 dark:to-green-950/90 bg-gradient-to-b from-white/95 to-lime-50/90 backdrop-blur-xl dark:shadow-[inset_0_0_40px_rgba(34,197,94,0.2),0_10px_40px_rgba(0,0,0,0.8)] shadow-[inset_0_0_40px_rgba(163,230,53,0.2),0_10px_40px_rgba(163,230,53,0.3)] relative overflow-hidden before:absolute before:inset-0 before:bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(34,197,94,0.05)_2px,rgba(34,197,94,0.05)_4px)] before:pointer-events-none',
        button: 'relative overflow-hidden dark:bg-green-950/80 bg-lime-100/80 dark:hover:bg-green-900 hover:bg-lime-200 text-lime-700 dark:text-green-400 dark:rounded rounded-full font-mono border border-green-500/50 hover:border-green-400 dark:shadow-[0_0_20px_rgba(34,197,94,0.5)] shadow-[0_5px_20px_rgba(163,230,53,0.4)] transition-all duration-300 before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(34,197,94,0.1)_2px,rgba(34,197,94,0.1)_4px)] before:pointer-events-none hover:scale-[1.02]',
        iconGlow: 'dark:drop-shadow-[0_0_15px_rgba(34,197,94,0.9)] drop-shadow-[0_0_15px_rgba(163,230,53,0.8)]',
        progress: 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-virus-jitter',
        mapItem: 'rounded-full border-dashed border-2',
        option: 'border-2 border-dashed border-green-500/30 dark:bg-green-950/10 bg-lime-50/30',
        overlay: 'bg-[repeating-conic-gradient(rgba(34,197,94,0.02)_0deg_10deg,transparent_10deg_20deg)]',
        markdown: 'prose-green dark:prose-invert prose-p:text-green-900/80 dark:prose-p:text-green-200/80 prose-headings:text-green-600 dark:prose-headings:text-green-400 prose-code:text-green-500 dark:prose-code:text-green-300 font-mono',
        interactiveText: 'text-green-600 dark:text-green-400 font-mono animate-virus-jitter'
      };
    case 'virus-hiv':
      return {
        border: 'dark:border-fuchsia-500/80 border-fuchsia-500/80 dark:shadow-[0_0_20px_rgba(217,70,239,0.6)] shadow-[0_0_20px_rgba(232,121,249,0.6)]',
        glow: 'dark:shadow-[0_0_40px_rgba(217,70,239,0.7)] shadow-[0_0_40px_rgba(232,121,249,0.7)]',
        text: 'dark:text-fuchsia-400 text-fuchsia-700 font-sans tracking-tight drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]',
        bg: 'dark:bg-slate-950/90 bg-fuchsia-50/90 backdrop-blur-xl dark:border-fuchsia-500/40 border-fuchsia-400/40',
        accent: 'dark:bg-fuchsia-600 bg-fuchsia-500',
        accentText: 'text-white',
        card: 'dark:rounded-lg rounded-[2rem] border-2 dark:border-fuchsia-500 border-fuchsia-500 dark:bg-gradient-to-br dark:from-slate-950/95 dark:to-fuchsia-950/90 bg-gradient-to-br from-white/95 to-fuchsia-50/90 backdrop-blur-xl dark:shadow-[inset_0_0_40px_rgba(217,70,239,0.2),0_10px_40px_rgba(0,0,0,0.8)] shadow-[inset_0_0_40px_rgba(232,121,249,0.2),0_10px_40px_rgba(232,121,249,0.3)] relative overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(217,70,239,0.05)_100%)] before:pointer-events-none',
        button: 'relative overflow-hidden dark:bg-fuchsia-950/80 bg-fuchsia-100/80 dark:hover:bg-fuchsia-900 hover:bg-fuchsia-200 text-fuchsia-700 dark:text-fuchsia-400 dark:rounded rounded-full border border-fuchsia-500/50 hover:border-fuchsia-400 dark:shadow-[0_0_20px_rgba(217,70,239,0.5)] shadow-[0_5px_20px_rgba(232,121,249,0.4)] transition-all duration-300 hover:shadow-[inset_0_0_15px_rgba(217,70,239,0.5)] hover:scale-[1.02]',
        iconGlow: 'dark:drop-shadow-[0_0_15px_rgba(217,70,239,0.9)] drop-shadow-[0_0_15px_rgba(232,121,249,0.8)]',
        progress: 'bg-fuchsia-600 shadow-[0_0_15px_rgba(217,70,239,0.6)]',
        mapItem: 'clip-path-hexagon border-2',
        option: 'rounded-none border-2 border-fuchsia-500/40 dark:bg-fuchsia-950/20 bg-fuchsia-50/50',
        overlay: 'bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")] opacity-[0.03]',
        markdown: 'prose-fuchsia dark:prose-invert prose-p:text-fuchsia-900/80 dark:prose-p:text-fuchsia-200/80 prose-headings:text-fuchsia-600 dark:prose-headings:text-fuchsia-400 prose-a:text-fuchsia-500 hover:prose-a:text-fuchsia-400',
        interactiveText: 'text-fuchsia-600 dark:text-fuchsia-400 font-medium tracking-tight'
      };
    case 'virus-smallpox':
      return {
        border: 'dark:border-amber-500/80 border-amber-500/80 dark:shadow-[0_0_20px_rgba(245,158,11,0.6)] shadow-[0_0_20px_rgba(251,191,36,0.6)]',
        glow: 'dark:shadow-[0_0_40px_rgba(245,158,11,0.7)] shadow-[0_0_40px_rgba(251,191,36,0.7)]',
        text: 'dark:text-amber-400 text-amber-700 font-serif drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]',
        bg: 'dark:bg-slate-950/90 bg-amber-50/90 backdrop-blur-xl dark:border-amber-500/40 border-amber-400/40',
        accent: 'dark:bg-amber-600 bg-amber-500',
        accentText: 'text-white',
        card: 'dark:rounded-lg rounded-[2rem] border-4 border-double dark:border-amber-500 border-amber-500 dark:bg-gradient-to-b dark:from-slate-950/95 dark:to-amber-950/90 bg-gradient-to-b from-white/95 to-amber-50/90 backdrop-blur-xl dark:shadow-[inset_0_0_40px_rgba(245,158,11,0.2),0_10px_40px_rgba(0,0,0,0.8)] shadow-[inset_0_0_40px_rgba(251,191,36,0.2),0_10px_40px_rgba(251,191,36,0.3)] relative overflow-hidden',
        button: 'relative overflow-hidden dark:bg-amber-950/80 bg-amber-100/80 dark:hover:bg-amber-900 hover:bg-amber-200 text-amber-700 dark:text-amber-400 dark:rounded rounded-full border border-amber-500/50 hover:border-amber-400 dark:shadow-[0_0_20px_rgba(245,158,11,0.5)] shadow-[0_5px_20px_rgba(251,191,36,0.4)] transition-all duration-300 before:absolute before:inset-0 before:bg-[repeating-radial-gradient(circle_at_center,transparent,transparent_5px,rgba(245,158,11,0.1)_5px,rgba(245,158,11,0.1)_10px)] before:pointer-events-none hover:scale-[1.02]',
        iconGlow: 'dark:drop-shadow-[0_0_15px_rgba(245,158,11,0.9)] drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]',
        progress: 'bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.6)]',
        mapItem: 'rounded-xl border-4 border-double',
        option: 'border-4 border-double border-amber-500/40 dark:bg-amber-950/20 bg-amber-50/50',
        overlay: 'bg-[url("https://www.transparenttextures.com/patterns/criss-cross.png")] opacity-[0.05]',
        markdown: 'prose-amber dark:prose-invert prose-p:text-amber-900/80 dark:prose-p:text-amber-200/80 prose-headings:text-amber-600 dark:prose-headings:text-amber-400 font-serif',
        interactiveText: 'text-amber-600 dark:text-amber-400 font-serif italic underline decoration-double'
      };
    case 'virus-influenza':
      return {
        border: 'dark:border-cyan-500/80 border-cyan-500/80 dark:shadow-[0_0_20px_rgba(6,182,212,0.6)] shadow-[0_0_20px_rgba(34,211,238,0.6)]',
        glow: 'dark:shadow-[0_0_40px_rgba(6,182,212,0.7)] shadow-[0_0_40px_rgba(34,211,238,0.7)]',
        text: 'dark:text-cyan-400 text-cyan-700 font-sans tracking-tight drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]',
        bg: 'dark:bg-slate-950/90 bg-cyan-50/90 backdrop-blur-xl dark:border-cyan-500/40 border-cyan-400/40',
        accent: 'dark:bg-cyan-600 bg-cyan-500',
        accentText: 'text-white',
        card: 'dark:rounded-lg rounded-[2rem] border-y-2 border-x-8 dark:border-cyan-500 border-cyan-500 dark:bg-gradient-to-b dark:from-slate-950/95 dark:to-cyan-950/90 bg-gradient-to-b from-white/95 to-cyan-50/90 backdrop-blur-xl dark:shadow-[inset_0_0_40px_rgba(6,182,212,0.2),0_10px_40px_rgba(0,0,0,0.8)] shadow-[inset_0_0_40px_rgba(34,211,238,0.2),0_10px_40px_rgba(34,211,238,0.3)] relative overflow-hidden before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(6,182,212,0.05)_0%,transparent_50%,rgba(6,182,212,0.05)_100%)] before:pointer-events-none',
        button: 'relative overflow-hidden dark:bg-cyan-950/80 bg-cyan-100/80 dark:hover:bg-cyan-900 hover:bg-cyan-200 text-cyan-700 dark:text-cyan-400 dark:rounded rounded-full border border-cyan-500/50 hover:border-cyan-400 dark:shadow-[0_0_20px_rgba(6,182,212,0.5)] shadow-[0_5px_20px_rgba(34,211,238,0.4)] transition-all duration-300 before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(6,182,212,0.1)_6px,rgba(6,182,212,0.1)_12px)] before:pointer-events-none hover:scale-[1.02]',
        iconGlow: 'dark:drop-shadow-[0_0_15px_rgba(6,182,212,0.9)] drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]',
        progress: 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]',
        mapItem: 'rounded-sm skew-x-12 border-2',
        option: 'border-y-2 border-cyan-500/40 dark:bg-cyan-950/20 bg-cyan-50/50',
        overlay: 'bg-[url("https://www.transparenttextures.com/patterns/diagonal-stripes.png")] opacity-[0.05]',
        markdown: 'prose-cyan dark:prose-invert prose-p:text-cyan-900/80 dark:prose-p:text-cyan-200/80 prose-headings:text-cyan-600 dark:prose-headings:text-cyan-400 prose-blockquote:border-cyan-500',
        interactiveText: 'text-cyan-600 dark:text-cyan-400 font-light tracking-widest uppercase'
      };
    case 'arcane-violet':
    default:
      return {
        border: 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
        glow: 'shadow-[0_0_40px_rgba(168,85,247,0.4)]',
        text: 'text-purple-500 font-black italic tracking-tighter',
        bg: 'bg-purple-950/10 backdrop-blur-xl border-purple-500/20',
        accent: 'bg-purple-600',
        accentText: 'text-white',
        card: 'rounded-[2.5rem] border-2 border-purple-500/30 bg-slate-950/90 shadow-[0_0_50px_rgba(168,85,247,0.1)]',
        button: 'bg-purple-600 hover:bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105',
        iconGlow: 'drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]'
      };
  }
};

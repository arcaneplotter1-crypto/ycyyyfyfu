import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { X, Trophy, Clock, Target, Brain, Zap, Sparkles } from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar,
  Cell,
  AreaChart,
  Area,
  LabelList
} from 'recharts';
import { Question, EssayFeedback, AppTheme, VisualStyle } from '../types';

const AnimatedCounter = ({ from, to, duration = 1, format = (v: number) => Math.round(v).toString() }: { from: number, to: number, duration?: number, format?: (v: number) => string | React.ReactNode }) => {
  const count = useMotionValue(from);
  const [displayValue, setDisplayValue] = useState(format(from));

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(format(latest))
    });
    return controls.stop;
  }, [to, duration]);

  return <>{displayValue}</>;
};

const ThemeBackgrounds = ({ theme }: { theme: AppTheme }) => {
  if (theme.visualStyle === 'arcane' || theme.visualStyle === 'ultimate') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, ${theme.accentColor === 'ultimate-cosmic' ? '#d946ef' : '#818cf8'} 0%, transparent 70%)`,
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.15 + 0.05,
            }}
            animate={{
              y: [0, Math.random() * -100 - 50, 0],
              x: [0, Math.random() * 100 - 50, 0],
              scale: [1, Math.random() * 0.5 + 1, 1]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    );
  }
  if (theme.visualStyle === 'virus') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`code-${i}`}
            className="absolute text-[#00ff41] font-mono text-xs whitespace-nowrap"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10%`,
            }}
            animate={{ y: ['0vh', '110vh'] }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          >
            {Math.random().toString(36).substring(2, 12)}
          </motion.div>
        ))}
      </div>
    );
  }
  if (theme.visualStyle === 'duck') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute bg-white rounded-full blur-[2px]"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 40 + 20,
              left: `-20%`,
              top: `${Math.random() * 80}%`,
            }}
            animate={{ x: ['0vw', '120vw'] }}
            transition={{
              duration: Math.random() * 30 + 20,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
          />
        ))}
      </div>
    );
  }
  return null;
};

// --- Custom High-End Tooltip ---
const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    const isRetro = theme.visualStyle === 'game-minecraft' || theme.visualStyle === 'brutalist' || theme.visualStyle === 'undertale';
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`p-4 border shadow-xl backdrop-blur-md ${isRetro ? 'bg-black border-[4px] border-white rounded-none shadow-[4px_4px_0_#fff]' : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700 rounded-xl'}`}
      >
        <p className={`mb-3 ${isRetro ? 'font-[Press Start 2P] text-[10px] text-white uppercase' : 'font-black tracking-tight text-slate-800 dark:text-white text-sm'}`}>{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            const color = entry.color || entry.fill || entry.payload.fill;
            return (
              <div key={index} className="flex justify-between items-center gap-8">
                <span className={`flex items-center gap-2 ${isRetro ? 'font-[Press Start 2P] text-[8px] text-white' : 'text-sm font-medium text-slate-600 dark:text-slate-300'}`}>
                   <div className="w-2.5 h-2.5 shadow-sm" style={{ backgroundColor: color, borderRadius: isRetro ? '0' : '999px' }} />
                   {entry.name}
                </span>
                <span className={`${isRetro ? 'font-[Press Start 2P] text-[8px] text-white' : 'font-mono font-black text-slate-900 dark:text-white text-sm'}`}>
                  {entry.value}{entry.name?.includes('%') || entry.dataKey === 'A' ? '%' : entry.name?.includes('Sec') ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }
  return null;
};

interface ExamAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  answers: Record<string, string>;
  essayFeedback: Record<string, EssayFeedback>;
  wrongPartSelections?: Record<string, string>;
  questionTimes?: Record<string, number>;
  theme: AppTheme;
}

export const ExamAnalysisModal: React.FC<ExamAnalysisModalProps> = ({
  isOpen,
  onClose,
  questions,
  answers,
  essayFeedback,
  wrongPartSelections,
  questionTimes = {},
  theme
}) => {
  const [chartRenderKey, setChartRenderKey] = useState(0);

  // Force chart re-render after animation
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setChartRenderKey(prev => prev + 1), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // --- Data Calculations ---
  const typeStats: Record<string, { total: number; correct: number; totalTime: number }> = {};
  
  const typeLabels: Record<string, string> = {
    mcq: 'MCQ',
    multi_select: 'Multi-Select',
    true_false: 'True/False',
    essay: 'Essay',
    fill_in_blanks: 'Blanks',
    matching: 'Matching',
    locate_on_image: 'Locate'
  };

  questions.forEach(q => {
    if (!typeStats[q.type]) {
      typeStats[q.type] = { total: 0, correct: 0, totalTime: 0 };
    }
    
    typeStats[q.type].total += 1;
    typeStats[q.type].totalTime += (questionTimes[q.id] || 0);

    let isCorrect = false;
    if (q.type === 'mcq' || q.type === 'true_false') {
      isCorrect = (q.type === 'true_false' && q.correctAnswer === 'False' && q.wrongPart)
        ? answers[q.id] === 'False' && wrongPartSelections?.[q.id] === q.wrongPart
        : answers[q.id] === q.correctAnswer;
    } else if (q.type === 'multi_select') {
      const selected = (answers[q.id] || '').split('|').filter(Boolean).sort();
      const correct = (q.correctAnswers || []).slice().sort();
      isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
    } else if (q.type === 'fill_in_blanks') {
      const selected = (answers[q.id] || '').split('|');
      const correct = q.blanks || [];
      isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
    } else if (q.type === 'matching') {
      const selected = (answers[q.id] || '').split('|').filter(Boolean).sort();
      const correct = (q.matchingPairs || []).map(p => `${p.term}:${p.definition}`).sort();
      isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
    } else if (q.type === 'locate_on_image') {
      try {
        const selected = JSON.parse(answers[q.id] || '[]');
        const correct = q.imageTargets || [];
        isCorrect = selected.length === correct.length && correct.length > 0 && correct.every((target: any) => {
          const sel = selected.find((s: any) => s.targetId === target.id);
          if (!sel) return false;
          const dist = Math.sqrt(Math.pow(sel.x - target.x, 2) + Math.pow(sel.y - target.y, 2));
          return dist <= target.radius;
        });
      } catch (e) { isCorrect = false; }
    } else {
      isCorrect = (essayFeedback[q.id]?.score || 0) >= 50;
    }

    if (isCorrect) typeStats[q.type].correct += 1;
  });

  const sortedTypeStatsEntries = Object.entries(typeStats).sort((a, b) => b[1].total - a[1].total);

  const radarData = sortedTypeStatsEntries.map(([type, stats]) => ({
    subject: typeLabels[type] || type,
    A: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    fullMark: 100
  }));

  const timeData = Object.entries(typeStats).map(([type, stats]) => ({
    name: typeLabels[type] || type,
    avgTime: stats.totalTime > 0 ? Math.round(stats.totalTime / stats.total / 1000) : 0
  })).sort((a, b) => b.avgTime - a.avgTime);

  const correctData = sortedTypeStatsEntries.map(([type, stats]) => ({
    name: typeLabels[type] || type,
    correct: stats.correct,
    incorrect: stats.total - stats.correct,
    total: stats.total,
    percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
  }));

  const totalTimeSpent = Object.values(typeStats).reduce((acc, s) => acc + s.totalTime, 0);
  const totalCorrect = Object.values(typeStats).reduce((acc, s) => acc + s.correct, 0);
  const totalQuestions = questions.length;
  const totalPercentage = Math.round((totalCorrect / totalQuestions) * 100);
  const avgPulse = totalTimeSpent > 0 ? Math.round(totalTimeSpent / totalQuestions / 1000) : 0;

  // --- Dynamic Theme Configurations ---
  
  const getUIConfig = (visualStyle: VisualStyle, accentColor: string) => {
    switch (visualStyle) {
      case 'brutalist':
        return {
          overlay: 'bg-black/60',
          container: 'bg-white border-[6px] border-black rounded-none shadow-[16px_16px_0px_rgba(0,0,0,1)]',
          header: 'p-8 border-b-[6px] border-black bg-yellow-400',
          title: 'text-4xl font-black uppercase text-black italic leading-none',
          subtitle: 'text-sm font-black text-black border-2 border-black inline-block px-3 py-1 bg-white mt-4 uppercase',
          closeBtn: 'bg-red-500 border-[4px] border-black text-black hover:bg-black hover:text-white transition-colors h-14 w-14 flex items-center justify-center p-0 rounded-none shadow-[4px_4px_0_#000]',
          card: 'bg-white border-[4px] border-black shadow-[8px_8px_0_#000] p-6',
          cardIcon: 'text-black w-8 h-8',
          cardLabel: 'text-xs font-black uppercase text-black',
          cardValue: 'text-5xl font-black text-black mt-4',
          cardSub: 'text-xs font-bold bg-black text-white px-2 py-0.5 inline-block mt-2 italic',
          sectionContainer: 'bg-white border-[4px] border-black p-8 shadow-[12px_12px_0_#000]',
          sectionTitle: 'text-2xl font-black uppercase text-black border-b-[4px] border-black pb-2 mb-4 block',
          sectionSub: 'hidden',
          chartColors: { primary: '#000', secondary: '#ef4444', text: '#000', grid: '#00000030' },
          footer: 'p-8 border-t-[6px] border-black bg-blue-400 flex flex-col items-center gap-6 text-center text-black font-black uppercase',
          buttonType: 'bg-green-400 text-black border-[4px] border-black font-black uppercase px-12 py-4 shadow-[8px_8px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xl w-full sm:w-auto'
        };
      case 'undertale':
        return {
          overlay: 'bg-black/80 flex items-center justify-center',
          container: 'bg-black border-[6px] border-white rounded-none p-2 w-[95%] max-w-5xl mx-auto',
          header: 'p-6 border-b-[4px] border-white/30 bg-black',
          title: 'text-2xl font-pixel text-white leading-tight uppercase',
          subtitle: 'text-[10px] font-pixel text-white/50 pt-2 block',
          closeBtn: 'text-white border-[4px] border-white bg-black hover:bg-white hover:text-black font-pixel transition-colors p-2',
          card: 'bg-black border-[4px] border-white p-6 shadow-none',
          cardIcon: 'text-white w-6 h-6',
          cardLabel: 'text-[10px] font-pixel text-white/70 uppercase',
          cardValue: 'text-3xl font-pixel text-white mt-6',
          cardSub: 'text-[8px] font-pixel text-yellow-400 mt-2 block opacity-80',
          sectionContainer: 'bg-black border-[4px] border-white p-6 rounded-none',
          sectionTitle: 'text-lg font-pixel uppercase text-white mb-2 block',
          sectionSub: 'text-[8px] font-pixel text-gray-400 mb-6 block',
          chartColors: { primary: '#fbbf24', secondary: '#ef4444', text: '#fff', grid: '#ffffff20' },
          footer: 'p-8 border-t-[4px] border-white bg-black text-center font-pixel text-[10px] sm:text-xs text-white leading-[2]',
          buttonType: 'bg-black text-white border-[4px] border-white font-pixel uppercase px-8 py-4 hover:bg-white hover:text-black transition-colors w-full sm:w-auto mt-6'
        };
      case 'saidi':
        return {
          overlay: 'bg-[#1a1109]/80 backdrop-blur-sm',
          container: 'bg-[#f4efe6] border-[12px] border-[#c0a062] rounded-none shadow-[0_0_50px_rgba(192,160,98,0.3)]',
          header: 'p-10 border-b-2 border-[#8b6b42] bg-[#e8deca] flex items-center justify-between',
          title: 'text-4xl font-serif font-bold text-[#3d2c1e] text-center w-full',
          subtitle: 'text-lg font-serif text-[#8b6b42] text-center italic mt-2 block w-full',
          closeBtn: 'text-[#3d2c1e] hover:bg-[#c0a062]/20 rounded-full p-2 absolute right-6 top-6',
          card: 'bg-[#fbf9f6] border border-[#d6c5a3] p-6 shadow-[2px_2px_0_#c0a062]',
          cardIcon: 'text-[#8b6b42] w-6 h-6 bg-[#e8deca] rounded-full p-1',
          cardLabel: 'text-xs font-serif font-black text-[#5a422b] uppercase tracking-wider',
          cardValue: 'text-4xl font-serif text-[#3d2c1e] mt-4 block',
          cardSub: 'text-xs font-serif text-[#8b6b42] mt-2 block',
          sectionContainer: 'bg-[#fbf9f6] border border-[#d6c5a3] p-8 shadow-[4px_4px_0_rgba(192,160,98,0.3)]',
          sectionTitle: 'text-3xl font-serif font-bold text-[#3d2c1e] mb-2 border-b-2 border-[#c0a062] pb-4 block',
          sectionSub: 'text-sm font-serif text-[#8b6b42] mt-2 block mb-6 italic',
          chartColors: { primary: '#8b6b42', secondary: '#c0a062', text: '#3d2c1e', grid: '#8b6b4220' },
          footer: 'p-10 bg-[#e8deca] border-t border-[#c0a062] text-center font-serif text-[#3d2c1e] text-lg',
          buttonType: 'bg-[#8b6b42] text-[#f4efe6] px-12 py-4 font-serif text-xl border-2 border-[#3d2c1e] shadow-[4px_4px_0_#3d2c1e] hover:translate-y-1 hover:shadow-none transition-all relative overflow-hidden group w-full sm:w-auto mt-6'
        };
      case 'game-minecraft':
        return {
          overlay: 'bg-black/80',
          container: 'bg-[#8b8b8b] border-[6px] border-[#3f3f3f] rounded-none shadow-[inset_4px_4px_0_#c6c6c6,inset_-4px_-4px_0_#555]',
          header: 'p-8 bg-[#636363] border-b-[6px] border-[#3f3f3f] shadow-[inset_0_-4px_0_#555]',
          title: 'text-2xl sm:text-3xl font-game uppercase text-white drop-shadow-[4px_4px_0_#000]',
          subtitle: 'text-[10px] sm:text-xs font-game text-[#a0a0a0] drop-shadow-[2px_2px_0_#000] mt-4 block',
          closeBtn: 'bg-[#c6c6c6] border-[4px] border-[#fff_#555_#555_#fff] text-black w-10 h-10 flex items-center justify-center hover:bg-[#a0a0a0] transition-colors p-0 rounded-none absolute right-6 top-6',
          card: 'bg-[#707070] border-[4px] border-[#fff_#555_#555_#fff] p-6',
          cardIcon: 'text-[#555] w-8 h-8 drop-shadow-[2px_2px_0_#fff]',
          cardLabel: 'text-[10px] sm:text-xs font-game text-[#c6c6c6] uppercase drop-shadow-[2px_2px_0_#3f3f3f]',
          cardValue: 'text-2xl sm:text-3xl font-game text-yellow-300 drop-shadow-[4px_4px_0_#3f3f3f] mt-6 block',
          cardSub: 'text-[8px] font-game text-[#a0a0a0] mt-4 block leading-tight',
          sectionContainer: 'bg-[#707070] border-[4px] border-[#fff_#555_#555_#fff] p-8',
          sectionTitle: 'text-sm sm:text-base font-game text-white drop-shadow-[4px_4px_0_#3f3f3f] mb-6 block',
          sectionSub: 'hidden',
          chartColors: { primary: '#10b981', secondary: '#ef4444', text: '#fff', grid: '#ffffff40' },
          footer: 'p-8 bg-[#555555] border-t-[4px] border-[#fff_#3f3f3f_#3f3f3f_#fff] text-center font-game text-white text-[10px] sm:text-xs leading-[2]',
          buttonType: 'bg-[#c6c6c6] text-black font-game text-[10px] sm:text-xs px-10 py-5 border-[4px] border-[#fff_#555_#555_#fff] hover:bg-[#a0a0a0] active:border-[#555_#fff_#fff_#555] transition-colors w-full sm:w-auto mt-6'
        };
      case 'tadc':
        return {
          overlay: 'bg-black/50 backdrop-blur-md',
          container: 'bg-[repeating-linear-gradient(45deg,#ff3b30,#ff3b30_20px,#34c759_20px,#34c759_40px,#007aff_40px,#007aff_60px,#ffcc00_60px,#ffcc00_80px)] p-3 rounded-[3rem] shadow-[0_0_50px_rgba(255,59,48,0.5)]',
          innerContainer: 'w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col border-[6px] border-black',
          header: 'p-10 bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiAvPgo8cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjZjBmMGYwIiAvPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjZjBmMGYwIiAvPgo8L3N2Zz4=")] border-b-8 border-black border-dashed',
          title: 'text-4xl sm:text-5xl font-black uppercase text-blue-600 drop-shadow-[3px_3px_0_#ffcc00]',
          subtitle: 'text-sm sm:text-base font-black text-green-600 uppercase tracking-widest mt-4 block px-4 py-1 bg-black text-white w-fit rounded-full',
          closeBtn: 'bg-red-500 text-white rounded-full p-4 border-[4px] border-black hover:rotate-180 hover:bg-yellow-400 hover:text-black transition-all duration-300 shadow-[4px_4px_0_#000]',
          card: 'bg-white border-4 border-black rounded-[2rem] p-6 shadow-[8px_8px_0_#ff3b30] relative overflow-hidden group/card hover:translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_#007aff] transition-all',
          cardIcon: 'text-blue-600 w-10 h-10',
          cardLabel: 'text-sm font-black uppercase text-black tracking-widest',
          cardValue: 'text-5xl font-black text-red-600 mt-4 block',
          cardSub: 'text-[10px] font-black text-white bg-green-600 px-3 py-1 rounded-full uppercase absolute bottom-4 right-4',
          sectionContainer: 'bg-yellow-50 border-4 border-black rounded-[2.5rem] p-8 shadow-[12px_12px_0_#34c759]',
          sectionTitle: 'text-3xl font-black text-black uppercase mb-4 block drop-shadow-[2px_2px_0_#007aff]',
          sectionSub: 'text-sm font-black text-red-500 uppercase tracking-widest block mb-8',
          chartColors: { primary: '#007aff', secondary: '#ff3b30', text: '#000', grid: '#00000020' },
          footer: 'p-10 bg-blue-100 border-t-[8px] border-black border-dashed text-center flex flex-col items-center gap-8',
          buttonType: 'bg-red-500 text-white border-[6px] border-black rounded-full px-16 py-5 font-black text-2xl uppercase hover:scale-110 hover:bg-yellow-400 hover:text-black active:scale-95 transition-all shadow-[8px_8px_0_#000] w-full sm:w-auto tracking-widest'
        };
      case 'hollow-knight':
        return {
          overlay: 'bg-black/95 backdrop-blur-2xl',
          container: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1c23] to-[#0a0a0c] border border-[#374151] rounded-[2rem] shadow-[0_0_100px_rgba(255,255,255,0.03)]',
          header: 'p-12 border-b border-[#ffffff10] text-center relative flex flex-col items-center',
          title: 'text-3xl sm:text-4xl font-serif text-[#f3f4f6] tracking-[0.3em] font-light',
          subtitle: 'text-[10px] font-serif text-[#6b7280] uppercase tracking-[0.5em] mt-6 block',
          closeBtn: 'absolute right-8 top-8 text-white/30 hover:text-white transition-colors p-2',
          card: 'bg-black/40 border border-[#ffffff10] rounded-2xl p-8 backdrop-blur-sm shadow-[inset_0_0_40px_rgba(255,255,255,0.01)]',
          cardIcon: 'text-[#6b7280] w-6 h-6 opacity-50 mb-6 mx-auto',
          cardLabel: 'text-[10px] font-serif text-[#9ca3af] uppercase tracking-[0.3em] text-center block',
          cardValue: 'text-4xl font-serif text-white mt-4 font-light text-center block',
          cardSub: 'hidden',
          sectionContainer: 'bg-[#1e2329]/20 border border-[#ffffff05] rounded-[2rem] p-10 relative overflow-hidden',
          sectionTitle: 'text-xl font-serif text-[#d1d5db] tracking-[0.1em] mb-4 text-center block font-light',
          sectionSub: 'text-[10px] font-serif text-[#6b7280] tracking-[0.2em] uppercase text-center block mb-8',
          chartColors: { primary: '#f3f4f6', secondary: '#4b5563', text: '#9ca3af', grid: '#ffffff0a' },
          footer: 'p-12 border-t border-[#ffffff05] text-center text-[#6b7280] font-serif tracking-[0.1em] text-xs leading-[2.5]',
          buttonType: 'border border-[#ffffff20] text-white px-16 py-4 font-serif uppercase tracking-[0.4em] text-[10px] hover:bg-white hover:text-black transition-all duration-500 rounded-full w-full sm:w-auto mt-8'
        };
      case 'duck':
        return {
          overlay: 'bg-sky-200/90 backdrop-blur-md',
          container: 'bg-white rounded-[4rem] border-8 border-yellow-400 shadow-[0_30px_0_rgba(250,204,21,0.3)]',
          header: 'p-10 bg-yellow-400 rounded-t-[3.5rem] text-center border-b-8 border-yellow-500 relative',
          title: 'text-4xl sm:text-5xl font-black text-white drop-shadow-[0_4px_0_rgba(202,138,4,0.5)] tracking-wide',
          subtitle: 'text-yellow-800 font-black uppercase tracking-widest mt-4 block bg-white/30 px-6 py-2 rounded-full w-fit mx-auto',
          closeBtn: 'absolute right-8 top-8 bg-white text-yellow-500 rounded-full p-3 hover:bg-sky-100 hover:text-sky-500 hover:scale-110 hover:rotate-90 transition-all shadow-[0_4px_0_rgba(202,138,4,0.3)]',
          card: 'bg-sky-50 border-4 border-sky-200 rounded-[2.5rem] p-8 text-center shadow-[0_8px_0_#bae6fd] transform transition hover:-translate-y-2 hover:shadow-[0_12px_0_#bae6fd]',
          cardIcon: 'text-sky-400 w-10 h-10 mx-auto mb-4 bg-white p-2 rounded-full shadow-sm',
          cardLabel: 'text-sm font-black text-sky-800 uppercase tracking-widest',
          cardValue: 'text-5xl font-black text-sky-600 mt-4 block',
          cardSub: 'text-[11px] font-bold text-white bg-sky-400 px-3 py-1 rounded-full mt-4 inline-block',
          sectionContainer: 'bg-yellow-50 border-4 border-yellow-200 rounded-[3rem] p-10 mt-4 relative',
          sectionTitle: 'text-3xl font-black text-yellow-600 mb-2 block tracking-tight',
          sectionSub: 'text-sm font-bold text-yellow-500/80 mb-8 block',
          chartColors: { primary: '#38bdf8', secondary: '#fbbf24', text: '#0284c7', grid: '#38bdf830' },
          footer: 'p-10 text-center text-sky-800 font-bold bg-sky-100 border-t-8 border-sky-200 rounded-b-[3.5rem]',
          buttonType: 'bg-gradient-to-b from-yellow-300 to-yellow-500 text-white font-black text-xl px-16 py-5 rounded-full shadow-[0_8px_0_#ca8a04] hover:-translate-y-2 hover:shadow-[0_12px_0_#ca8a04] active:translate-y-2 active:shadow-none transition-all uppercase tracking-wider w-full sm:w-auto mt-6'
        };
      case 'virus':
        return {
          overlay: 'bg-black/95',
          container: 'bg-black border-2 border-[#00ff41]/50 rounded-lg shadow-[0_0_30px_rgba(0,255,65,0.1)] relative overflow-hidden',
          innerContainer: 'before:content-[""] before:absolute before:inset-0 before:bg-[linear-gradient(rgba(0,255,65,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.05)_1px,transparent_1px)] before:bg-[size:20px_20px] before:z-0',
          header: 'p-8 border-b-2 border-[#00ff41]/50 bg-[#00ff41]/10 relative z-10',
          title: 'text-2xl sm:text-3xl font-mono text-[#00ff41] font-bold tracking-widest uppercase glitched-text',
          subtitle: 'text-xs font-mono text-[#00ff41]/70 mt-4 block before:content-[">_"] before:mr-2',
          closeBtn: 'text-[#00ff41] hover:bg-[#00ff41]/20 p-2 border border-transparent hover:border-[#00ff41]/50 font-mono transition-colors absolute right-6 top-6',
          card: 'bg-black/80 border border-[#00ff41]/30 p-6 shadow-[inset_0_0_20px_rgba(0,255,65,0.05)] relative z-10 group/card hover:border-[#00ff41] transition-colors',
          cardIcon: 'text-[#00ff41] w-6 h-6 mb-4 opacity-70 group-hover/card:opacity-100 transition-opacity',
          cardLabel: 'text-[10px] sm:text-xs font-mono text-[#00ff41]/80 uppercase string-type block mb-2',
          cardValue: 'text-4xl sm:text-5xl font-mono text-[#00ff41] mt-2 variable-type block',
          cardSub: 'text-[10px] font-mono text-[#00ff41]/60 mt-4 block before:content-["//_"]',
          sectionContainer: 'bg-black/80 border border-[#00ff41]/30 p-8 relative z-10 backdrop-blur-sm',
          sectionTitle: 'text-xl font-mono text-[#00ff41] border-b border-[#00ff41]/20 pb-4 mb-6 function-type block',
          sectionSub: 'hidden',
          chartColors: { primary: '#00ff41', secondary: '#ef4444', text: '#00ff41', grid: '#00ff4120' },
          footer: 'p-8 border-t-2 border-[#00ff41]/50 bg-black/90 text-center font-mono text-[#00ff41]/70 text-xs sm:text-sm leading-[2] relative z-10',
          buttonType: 'bg-transparent border-2 border-[#00ff41] text-[#00ff41] font-mono uppercase tracking-[0.2em] text-sm sm:text-base px-12 py-4 hover:bg-[#00ff41] hover:text-black transition-colors w-full sm:w-auto mt-8 shadow-[0_0_15px_rgba(0,255,65,0.2)] hover:shadow-[0_0_25px_rgba(0,255,65,0.5)]'
        };
      case 'arcane':
      case 'ultimate':
        const isOpt = theme.uiCustomization?.optimizationMode;
        return {
          overlay: 'bg-[#030712]/90 backdrop-blur-xl',
          container: `bg-[#0f172a]/80 border border-[#6366f1]/30 rounded-[2.5rem] ${isOpt ? '' : 'shadow-[0_0_80px_rgba(99,102,241,0.15)]'} backdrop-blur-2xl relative overflow-hidden`,
          innerContainer: 'before:absolute before:-inset-40 before:bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_50%)] before:pointer-events-none',
          header: 'p-10 border-b border-[#6366f1]/20 bg-gradient-to-b from-[#6366f1]/10 to-transparent relative z-10',
          title: 'text-3xl sm:text-4xl font-black uppercase text-white tracking-[0.3em] font-sans drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] text-center',
          subtitle: 'text-[10px] sm:text-xs font-bold text-[#818cf8] uppercase tracking-[0.4em] mt-4 block text-center',
          closeBtn: 'p-3 text-[#818cf8] hover:text-white hover:bg-[#6366f1]/20 rounded-2xl transition-colors absolute right-8 top-8',
          card: 'bg-white/5 border border-[#6366f1]/20 rounded-[2rem] p-8 relative z-10 hover:bg-white/10 transition-colors shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm',
          cardIcon: 'text-[#a5b4fc] w-8 h-8 mb-6',
          cardLabel: 'text-[10px] font-black tracking-[0.25em] uppercase text-[#818cf8] block',
          cardValue: 'text-5xl font-black text-white mt-4 block drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]',
          cardSub: 'text-[10px] font-bold text-[#6366f1] mt-4 block px-3 py-1 bg-[#6366f1]/10 rounded-full w-fit',
          sectionContainer: 'bg-[#0f172a]/50 border border-[#6366f1]/20 rounded-[2.5rem] p-10 relative z-10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm mt-4',
          sectionTitle: 'text-2xl font-black text-white uppercase tracking-[0.2em] mb-4 block drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] flex items-center gap-4',
          sectionSub: 'text-xs font-bold text-[#818cf8] uppercase tracking-[0.2em] mb-8 block',
          chartColors: { primary: accentColor === 'ultimate-cosmic' ? '#d946ef' : '#818cf8', secondary: '#475569', text: '#cbd5e1', grid: '#ffffff10' },
          footer: 'p-10 border-t border-[#6366f1]/20 bg-[#030712]/80 text-center relative z-10',
          buttonType: 'px-16 py-5 rounded-full border border-[#6366f1]/50 bg-gradient-to-b from-[#6366f1]/30 to-[#4f46e5]/10 text-white font-black uppercase tracking-[0.3em] text-xs sm:text-sm hover:from-[#6366f1]/50 hover:to-[#4f46e5]/30 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto mt-8 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
        };
      case 'liquid-glass':
        return {
          overlay: 'bg-black/40 backdrop-blur-md',
          container: 'liquid-glass-card border-none !rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)]',
          innerContainer: 'relative z-10',
          header: 'p-12 border-b border-white/10 bg-white/5 relative z-10',
          title: 'text-4xl sm:text-5xl font-black uppercase text-white drop-shadow-[0_10px_20px_rgba(255,255,255,0.4)] text-center tracking-tighter',
          subtitle: 'text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-[0.5em] mt-6 block text-center',
          closeBtn: 'p-4 text-white/50 hover:text-white bg-white/10 rounded-[1.5rem] transition-all hover:scale-110 active:scale-95 absolute right-10 top-12 backdrop-blur-md border border-white/20',
          card: 'liquid-glass-item p-10 relative z-10',
          cardIcon: 'text-white w-10 h-10 mb-8 drop-shadow-[0_5px_15px_rgba(255,255,255,0.4)]',
          cardLabel: 'text-[10px] font-black tracking-[0.4em] uppercase text-white/50 block',
          cardValue: 'text-6xl font-black text-white mt-6 block drop-shadow-[0_5px_20px_rgba(255,255,255,0.5)]',
          cardSub: 'text-[10px] font-black text-white/70 mt-6 block px-6 py-2 bg-white/10 rounded-full w-fit backdrop-blur-md border border-white/20',
          sectionContainer: 'liquid-glass-item p-12 relative z-10 mt-6 !rounded-[2.5rem]',
          sectionTitle: 'text-3xl font-black text-white uppercase tracking-[0.2em] mb-6 block drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center gap-6',
          sectionSub: 'text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-10 block',
          chartColors: { primary: '#ffffff', secondary: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.6)', grid: 'rgba(255,255,255,0.05)' },
          footer: 'p-12 border-t border-white/10 bg-white/5 text-center relative z-10',
          buttonType: 'liquid-glass-btn liquid-glass-btn-primary !px-20 !py-6 text-sm !rounded-full'
        };
      case 'modern':
      case 'minimal':
      case 'adventure-time':
      case 'superhero':
      case 'kitler':
      default:
        return {
          overlay: 'bg-[#0f172a]/50 backdrop-blur-md',
          container: 'bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800',
          header: 'p-8 sm:p-10 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-transparent rounded-t-[2.5rem]',
          title: 'text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight',
          subtitle: 'text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 mt-2 block',
          closeBtn: 'p-3 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors bg-slate-100 dark:bg-slate-800/50 absolute right-6 top-6 sm:right-8 sm:top-8',
          card: 'bg-white dark:bg-[#1e293b] rounded-[1.5rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow',
          cardIcon: 'text-indigo-500 w-8 h-8 mb-4 p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl',
          cardLabel: 'text-xs sm:text-sm font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider block',
          cardValue: 'text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight',
          cardSub: 'text-[11px] sm:text-xs font-semibold text-indigo-500 mt-4 block px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg w-fit',
          sectionContainer: 'bg-white dark:bg-[#1e293b] rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm p-8 sm:p-10',
          sectionTitle: 'text-2xl font-bold text-slate-900 dark:text-white mb-2 block tracking-tight',
          sectionSub: 'text-sm font-medium text-slate-500 dark:text-slate-400 block mb-8',
          chartColors: { primary: '#6366f1', secondary: '#cbd5e1', text: '#64748b', grid: '#e2e8f080' },
          footer: 'p-8 sm:p-10 bg-slate-50 dark:bg-[#0f172a] rounded-b-[2.5rem] border-t border-slate-200 dark:border-slate-800 flex flex-col items-center',
          buttonType: 'bg-indigo-600 text-white px-12 py-4 rounded-full font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:scale-95 transition-all text-sm sm:text-base w-full sm:w-auto mt-6'
        };
    }
  };

  const ui = getUIConfig(theme.visualStyle, theme.accentColor);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className={`fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto ${ui.overlay} ${theme.visualStyle === 'brutalist' ? 'group/brutalist' : ''}`}
        onClick={onClose}
      >
        <ThemeBackgrounds theme={theme} />
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className={`relative w-full max-w-6xl flex flex-col ${ui.container} ${theme.visualStyle === 'tadc' || theme.visualStyle === 'virus' || theme.visualStyle === 'arcane' || theme.visualStyle === 'ultimate' ? ui.innerContainer : ''} overflow-hidden shadow-2xl`}
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
        >
          {/* Universal Absolute Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 sm:p-3 bg-black/10 dark:bg-white/10 hover:bg-red-500 hover:text-white rounded-full backdrop-blur-md transition-all duration-200 border border-black/10 dark:border-white/10 flex items-center justify-center group"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Scrolling Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 space-y-8 custom-scrollbar relative z-10">
            
            {/* Inline Title header */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.1 }}
              className="pr-12 md:pr-16 mb-2"
            >
              <h2 className={`text-2xl sm:text-4xl md:text-5xl font-black flex items-center gap-2 sm:gap-4 flex-wrap leading-tight ${theme.visualStyle === 'virus' ? 'text-[#00ff41] font-mono' : 'text-slate-900 dark:text-white'}`} style={theme.visualStyle !== 'virus' && theme.visualStyle !== 'brutalist' && theme.visualStyle !== 'undertale' ? { color: ui.chartColors.primary } : {}}>
                <Sparkles className="w-6 h-6 sm:w-10 sm:h-10 animate-pulse" style={{ color: theme.visualStyle === 'brutalist' ? '#000' : ui.chartColors.primary }} />
                <span className={ui.title.replace('text-center', '').replace('text-4xl sm:text-5xl', '')}>Performance Analysis</span>
              </h2>
              <div className="mt-2">
                 <span className={ui.subtitle.replace('text-center', '').replace('mx-auto', '')}>Session Metrics & Statistical Insights</span>
              </div>
            </motion.div>

            {/* Top Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.02 }} className={`${ui.card} relative overflow-hidden`}>
                {/* Accuracy Color Indicator */}
                <div className={`absolute top-0 right-0 w-2 h-full ${totalPercentage >= 80 ? 'bg-green-500' : totalPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 sm:p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: totalPercentage >= 80 ? '#22c55e' : totalPercentage >= 50 ? '#eab308' : '#ef4444' }} />
                  </div>
                </div>
                <span className={ui.cardLabel}>Accuracy</span>
                <span className={`${ui.cardValue} ${totalPercentage >= 80 ? 'text-green-600 dark:text-green-400' : totalPercentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  <AnimatedCounter from={0} to={totalPercentage} duration={1.5} format={(v) => `${Math.round(v)}%`} />
                </span>
                {ui.cardSub !== 'hidden' && <span className={ui.cardSub}>Global Precision</span>}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.02 }} className={`${ui.card} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 sm:p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                  </div>
                </div>
                <span className={ui.cardLabel}>Correct Count</span>
                <span className={`${ui.cardValue} text-blue-600 dark:text-blue-400`}>
                  <AnimatedCounter from={0} to={totalCorrect} duration={1.5} /> / {totalQuestions}
                </span>
                {ui.cardSub !== 'hidden' && <span className={ui.cardSub}>Valid Responses</span>}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.02 }} className={`${ui.card} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-2 h-full bg-purple-500" />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 sm:p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                  </div>
                </div>
                <span className={ui.cardLabel}>Flow Time</span>
                <span className={`${ui.cardValue} text-purple-600 dark:text-purple-400`}>
                  <AnimatedCounter 
                    from={0} 
                    to={totalTimeSpent / 1000} 
                    duration={1.5} 
                    format={(v) => {
                      const m = Math.floor(v / 60);
                      const s = Math.floor(v % 60);
                      return <>{m}<span className="text-[0.6em] opacity-70 ml-1">m</span> {s}<span className="text-[0.6em] opacity-70 ml-1">s</span></>;
                    }} 
                  />
                </span>
                {ui.cardSub !== 'hidden' && <span className={ui.cardSub}>Total Active Focus</span>}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} whileHover={{ scale: 1.02 }} className={`${ui.card} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-2 h-full bg-orange-500" />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 sm:p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                  </div>
                </div>
                <span className={ui.cardLabel}>Cognitive Pulse</span>
                <span className={`${ui.cardValue} text-orange-600 dark:text-orange-400`}>
                  <AnimatedCounter from={0} to={avgPulse} duration={1.5} format={(v) => <>{Math.round(v)}<span className="text-[0.6em] opacity-70 ml-1">s</span></>} />
                </span>
                {ui.cardSub !== 'hidden' && <span className={ui.cardSub}>Per Question Pace</span>}
              </motion.div>
            </div>

            {/* Charts Row 1: Radar & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Radar: Strength by Category */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className={ui.sectionContainer}>
                <div className="flex items-center gap-4 mb-6 sm:mb-8 border-b border-black/10 dark:border-white/10 pb-4">
                  <div className="p-2 sm:p-3 bg-black/5 dark:bg-white/5 rounded-2xl shrink-0">
                    <Brain className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: ui.chartColors.primary }} />
                  </div>
                  <div>
                    <span className={ui.sectionTitle.replace('mb-4', '').replace('mb-2', '').replace('mb-6', '').replace('mb-8', '')}>
                      Cognitive Mastery Map
                    </span>
                    <span className={ui.sectionSub.replace('mb-4', '').replace('mb-8', '')}>
                      Performance efficiency across different formats
                    </span>
                  </div>
                </div>
                
                <div className="h-[250px] sm:h-[350px] md:h-[400px] relative w-full overflow-hidden">
                  {radarData.length >= 3 ? (
                    <ResponsiveContainer width="100%" height="100%" key={`radar-${chartRenderKey}`}>
                      <RadarChart cx="50%" cy="50%" outerRadius={theme.visualStyle === 'brutalist' ? '80%' : '75%'} data={radarData}>
                        <defs>
                          <linearGradient id="radarRadial" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ui.chartColors.primary as string} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={ui.chartColors.primary as string} stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <PolarGrid stroke={ui.chartColors.grid} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: ui.chartColors.text, fontSize: window.innerWidth < 640 ? 9 : 11, fontWeight: typeof ui.chartColors.text === 'string' && ui.chartColors.text.includes('#000') ? 'bold' : 'normal', fontFamily: theme.visualStyle === 'game-minecraft' || theme.visualStyle === 'undertale' ? '"Press Start 2P"' : 'inherit' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: ui.chartColors.text, fontSize: 10, opacity: 0.5 }} />
                        <Radar
                          name="Accuracy %"
                          dataKey="A"
                          stroke={ui.chartColors.primary}
                          fill={theme.visualStyle === 'brutalist' || theme.visualStyle === 'game-minecraft' ? ui.chartColors.primary : "url(#radarRadial)"}
                          fillOpacity={theme.visualStyle === 'brutalist' ? 1 : 1}
                          strokeWidth={theme.visualStyle === 'brutalist' || theme.visualStyle === 'game-minecraft' ? 4 : 3}
                          dot={{ r: 4, fill: ui.chartColors.primary as string, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                        />
                        <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ fill: 'transparent' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%" key={`radar-fallback-${chartRenderKey}`}>
                      <BarChart data={radarData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barRadial" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ui.chartColors.primary as string} stopOpacity={0.9} />
                            <stop offset="95%" stopColor={ui.chartColors.primary as string} stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={ui.chartColors.grid} vertical={false} />
                        <XAxis dataKey="subject" tick={{ fill: ui.chartColors.text, fontSize: window.innerWidth < 640 ? 10 : 12, fontFamily: theme.visualStyle === 'game-minecraft' || theme.visualStyle === 'undertale' ? '"Press Start 2P"' : 'inherit' }} />
                        <YAxis domain={[0, 100]} tick={{ fill: ui.chartColors.text, fontSize: window.innerWidth < 640 ? 10 : 12, fontFamily: theme.visualStyle === 'game-minecraft' || theme.visualStyle === 'undertale' ? '"Press Start 2P"' : 'inherit' }} />
                        <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                        <Bar dataKey="A" name="Accuracy %" radius={theme.visualStyle === 'brutalist' || theme.visualStyle === 'undertale' || theme.visualStyle === 'game-minecraft' || theme.visualStyle === 'saidi' ? [0, 0, 0, 0] : [8, 8, 0, 0]} fill={theme.visualStyle === 'brutalist' || theme.visualStyle === 'game-minecraft' ? ui.chartColors.primary : "url(#barRadial)"} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>

              {/* Bar: Question Success Distribution */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} className={ui.sectionContainer}>
                <div className="flex items-center gap-4 mb-6 sm:mb-8 border-b border-black/10 dark:border-white/10 pb-4">
                  <div className="p-2 sm:p-3 bg-black/5 dark:bg-white/5 rounded-2xl shrink-0">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: ui.chartColors.primary }} />
                  </div>
                  <div>
                    <span className={ui.sectionTitle.replace('mb-4', '').replace('mb-2', '').replace('mb-6', '').replace('mb-8', '')}>
                      Success Distribution
                    </span>
                    <span className={ui.sectionSub.replace('mb-4', '').replace('mb-8', '')}>
                      Ratio of correct vs missed attempts per type
                    </span>
                  </div>
                </div>
                 
                <div className="h-[250px] sm:h-[350px] md:h-[400px] relative w-full">
                  <ResponsiveContainer width="100%" height="100%" key={`dist-${chartRenderKey}`}>
                    <BarChart data={correctData} layout="vertical" margin={{ left: 0, right: 35, top: 20, bottom: 20 }} barSize={18} barGap={-18}>
                      <defs>
                        <linearGradient id="barHorizontal" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor={ui.chartColors.primary as string} stopOpacity={0.9} />
                          <stop offset="95%" stopColor={ui.chartColors.primary as string} stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={ui.chartColors.grid} horizontal={true} vertical={false} opacity={0.3} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" tick={{ fill: ui.chartColors.text, fontSize: window.innerWidth < 640 ? 10 : 11, fontFamily: theme.visualStyle === 'game-minecraft' || theme.visualStyle === 'undertale' ? '"Press Start 2P"' : 'inherit' }} width={window.innerWidth < 640 ? 75 : 95} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                      
                      <Bar 
                        dataKey="total" 
                        fill={ui.chartColors.text as string} 
                        fillOpacity={0.15}
                        radius={theme.visualStyle === 'brutalist' || theme.visualStyle === 'undertale' || theme.visualStyle === 'game-minecraft' || theme.visualStyle === 'saidi' ? [0, 0, 0, 0] : [100, 100, 100, 100]} 
                        name="Total Questions" 
                      />
                      <Bar 
                        dataKey="correct" 
                        fill={theme.visualStyle === 'brutalist' || theme.visualStyle === 'game-minecraft' ? ui.chartColors.primary : "url(#barHorizontal)"} 
                        radius={theme.visualStyle === 'brutalist' || theme.visualStyle === 'undertale' || theme.visualStyle === 'game-minecraft' || theme.visualStyle === 'saidi' ? [0, 0, 0, 0] : [100, 100, 100, 100]} 
                        name="Correct Answers" 
                      >
                        <LabelList dataKey="percentage" position="right" formatter={(val: number) => `${val}%`} fill={ui.chartColors.text as string} fontSize={12} fontWeight="bold" fontFamily={theme.visualStyle === 'game-minecraft' || theme.visualStyle === 'undertale' ? '"Press Start 2P"' : 'inherit'} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Charts Row 2: Pace Analysis */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className={ui.sectionContainer}>
                <div className="flex items-center gap-4 mb-6 sm:mb-8 border-b border-black/10 dark:border-white/10 pb-4">
                  <div className="p-2 sm:p-3 bg-black/5 dark:bg-white/5 rounded-2xl shrink-0">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: ui.chartColors.primary }} />
                  </div>
                  <div>
                    <span className={ui.sectionTitle.replace('mb-4', '').replace('mb-2', '').replace('mb-6', '').replace('mb-8', '')}>
                      Temporal Efficiency
                    </span>
                    <span className={ui.sectionSub.replace('mb-4', '').replace('mb-8', '')}>
                      Average time spent per question type (Seconds)
                    </span>
                  </div>
                </div>
               
               <div className="h-[250px] sm:h-[350px] relative w-full">
                 <ResponsiveContainer width="100%" height="100%" key={`pace-${chartRenderKey}`}>
                   <AreaChart data={timeData} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={ui.chartColors.primary as string} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={ui.chartColors.primary as string} stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke={ui.chartColors.grid} vertical={false} />
                     <XAxis dataKey="name" tick={{ fill: ui.chartColors.text, fontSize: window.innerWidth < 640 ? 9 : 11, fontFamily: theme.visualStyle === 'game-minecraft' || theme.visualStyle === 'undertale' ? '"Press Start 2P"' : 'inherit' }} />
                     <YAxis tick={{ fill: ui.chartColors.text, fontSize: window.innerWidth < 640 ? 10 : 11, fontFamily: theme.visualStyle === 'game-minecraft' || theme.visualStyle === 'undertale' ? '"Press Start 2P"' : 'inherit' }} />
                     <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ stroke: ui.chartColors.grid, strokeWidth: 2, fill: 'transparent' }} />
                     <Area 
                       type={theme.visualStyle === 'brutalist' || theme.visualStyle === 'game-minecraft' ? "step" : "monotone"} 
                       dataKey="avgTime" 
                       name="Avg Secs" 
                       stroke={ui.chartColors.primary} 
                       strokeWidth={theme.visualStyle === 'brutalist' || theme.visualStyle === 'game-minecraft' ? 4 : 3}
                       fillOpacity={1} 
                       fill={theme.visualStyle === 'brutalist' || theme.visualStyle === 'game-minecraft' ? 'transparent' : "url(#colorTime)"}
                       activeDot={{ r: 6, fill: '#fff', stroke: ui.chartColors.primary as string, strokeWidth: 2 }} 
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

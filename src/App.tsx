/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  Play, 
  FileText, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Map as MapIcon,
  X,
  RotateCcw,
  AlertCircle,
  Zap,
  XCircle,
  Menu,
  MessageSquare,
  Image as ImageIcon,
  Flag,
  Sparkles,
  Copy,
  Check,
  Sun,
  Moon,
  Trash2,
  Edit3,
  Star,
  PlayCircle,
  History,
  Palette,
  Paintbrush,
  Gamepad2,
  Info,
  Search,
  Download,
  Upload,
  Library,
  BookMarked,
  Layers,
  Users,
  PlusCircle,
  Plus,
  Trash,
  Save,
  FileCode,
  Eye,
  Heart,
  BookOpen,
  Shuffle,
  ListChecks,
  LayoutList,
  TextCursorInput,
  GitMerge,
  GripVertical,
  Shield,
  Bug,
  MousePointer2,
  Bird
} from 'lucide-react';
import { Question, ExamSettings, ExamState, EssayFeedback, ExamHistoryItem, AppTheme, AccentColor, VisualStyle, TextAnimationType, SavedTerm, UICustomization, Power, SavedExam, RpgProgression } from './types';
import { getArcaneStyles } from './utils/arcaneThemes';
import { parseInput, gradeEssay, stem, STOP_WORDS, initSpellChecker, isFuzzyMatch, copyToClipboard, encodeExamData, decodeExamData } from './utils';
import { GlobalSettings } from './components/GlobalSettings';
import { UICustomizationModal } from './components/UICustomizationModal';
import { ThemeSelectionModal } from './components/ThemeSelectionModal';
import { UltimateBackground, getVariantStyles } from './components/UltimateBackground';
import { QuestionBankModal } from './components/QuestionBankModal';
import { ReadyExams } from './components/ReadyExams';
import { HistoryModal } from './components/HistoryModal';
import { SavedExams } from './components/SavedExams';
import { SavedPdfsModal } from './components/SavedPdfsModal';
import { SavedAugmentationsModal } from './components/SavedAugmentationsModal';
import { CustomThemeModal } from './components/CustomThemeModal';
import { KitlerBackground, getKitlerStyles, KitlerLogoMark } from './components/KitlerTheme';
import { KitlerClickEffect } from './components/KitlerClickEffect';
import './kitler.css';
import { FONTS } from './constants/themes';
import { renderThemeUI } from './components/ResultsThemeUI';
import { TextAnimator } from './components/TextAnimator';
import { animateChildren } from './utils/animateChildren';
import ReactMarkdown from 'react-markdown';
import { injectCustomModernColor } from './utils/customModernTheme';
import { generateStandaloneExam } from './utils/exportHtml';
import { convertQuestionsToPdfDocument } from './utils/examPdfExport';
import { ExamAnalysisModal } from './components/ExamAnalysisModal';
import { pdf } from '@react-pdf/renderer';
import { ReactPdfOutput } from './components/PdfExport';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { PowerMenu } from './components/powers/PowerMenu';
import { OffensivePowersOverlay } from './components/powers/OffensivePowers';
import { AbsolutelySmartEffect, TimeWarpEffect, ShieldEffect, AutoCompleteEffect, ClarityEffect } from './components/powers/AdvantagePowers';
import { PowerObtained } from './components/powers/PowerObtained';
import { PowerSettingsModal } from './components/powers/PowerSettingsModal';
import { InteractivePowersOverlay } from './components/powers/InteractivePowers';
import { POWERS } from './constants/powers';
import { RpgGame } from './components/themes/rpg/RpgGame';
import { RpgShopModal } from './components/RpgShopModal';
import { Brain, Split, FastForward } from 'lucide-react';
import { FeedbackEffects } from './components/FeedbackEffects';
import { FeedbackNotification } from './components/FeedbackNotification';
import { ScreenShake, HollowKnightDialogue, HollowKnightHeader, DustParticles, HollowKnightExamUI, HollowKnightBackground, SoulAbsorption } from './components/HollowKnightEffects';
import { HollowKnightBackgroundEffect } from './components/HollowKnightBackgroundEffect';
import { VirusBackground, VirusClickEffect } from './components/VirusTheme';
import { PdfHome, PdfParser, PdfViewer, PdfTheme } from './PdfMode';
import { PdfAugmenter, PdfAugmentedViewer } from './PdfAugmentationMode';
import { DocumentParser, DocumentViewer, DocumentNode, DocumentSettings } from './DocumentMode';
import { PdfDocument, PdfAugmentedDocument, SavedPdf, SavedAugmentation } from './types';
import { EasyQuestionWizard } from './components/EasyQuestionWizard';
import { PresentationMode } from './PresentationMode';
import { UploaderMode } from './components/UploaderMode';
import { LiquidGlassFilters, LiquidGlassBackground, LiquidGlassOverlay } from './components/LiquidGlassEffects';
import './liquid-glass.css';
import { FluidBackground, FluidButtonOverlay } from './components/FluidEffects';
import { BlackHoleBackground } from './components/BlackHoleEffects';
import { TrueBlackHoleBackground } from './components/TrueBlackHoleEffects';
import { NeuralBlackHoleBackground } from './components/NeuralBlackHoleEffects';
import { PuddleBlackHoleBackground } from './components/PuddleBlackHoleEffects';
import { BubblesBlackHoleBackground } from './components/BubblesBlackHoleEffects';
import { EmissiveBlackHoleBackground } from './components/EmissiveBlackHoleEffects';
import { GeometricAuraBlackHoleBackground } from './components/GeometricAuraBlackHoleEffects';
import { io, PeerSocket as Socket } from './utils/peerSocket';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import MultiplayerLeaderboard from './components/MultiplayerLeaderboard';
import { AVATAR_OPTIONS, AvatarIcon } from './components/MultiplayerChat';
import { calculateQuestionPoints } from './utils/scoreUtils';

// Global SVG Filters for Text Visibility
const TextStrokeFilters = ({ accentColor }: { accentColor?: string }) => (
  <svg width="0" height="0" className="absolute pointer-events-none opacity-0">
    <defs>
      {/* Black Outline */}
      <filter id="text-outline-black" x="-20%" y="-20%" width="140%" height="140%">
        <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="1" />
        <feFlood floodColor="rgba(0,0,0,0.8)" result="OUTLINE_COLOR" />
        <feComposite in="OUTLINE_COLOR" in2="DILATED" operator="in" result="OUTLINE" />
        <feMerge>
          <feMergeNode in="OUTLINE" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* White Outline */}
      <filter id="text-outline-white" x="-20%" y="-20%" width="140%" height="140%">
        <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="1" />
        <feFlood floodColor="rgba(255,255,255,0.8)" result="OUTLINE_COLOR" />
        <feComposite in="OUTLINE_COLOR" in2="DILATED" operator="in" result="OUTLINE" />
        <feMerge>
          <feMergeNode in="OUTLINE" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* Accent Color Outline */}
      <filter id="text-outline-accent" x="-20%" y="-20%" width="140%" height="140%">
        <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="1.2" />
        <feFlood floodColor="var(--accent-color, #6366f1)" result="OUTLINE_COLOR" />
        <feComposite in="OUTLINE_COLOR" in2="DILATED" operator="in" result="OUTLINE" />
        <feComponentTransfer in="OUTLINE" result="DIMMED_OUTLINE">
          <feFuncA type="linear" slope="0.5" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="DIMMED_OUTLINE" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw];

// --- Components ---

const SuperheroBackground = ({ accentColor, performanceMode, optimizationMode, isDark }: { accentColor?: AccentColor, performanceMode?: boolean, optimizationMode?: boolean, isDark?: boolean }) => {
  if (performanceMode) return null;

  const floatingConfig = optimizationMode ? [
    { left: '15%', top: '20%', size: 40, duration: 15, delay: 0 },
    { left: '75%', top: '15%', size: 60, duration: 20, delay: 2 },
    { left: '25%', top: '70%', size: 50, duration: 18, delay: 5 },
  ] : [
    { left: '15%', top: '20%', size: 40, duration: 15, delay: 0 },
    { left: '75%', top: '15%', size: 60, duration: 20, delay: 2 },
    { left: '25%', top: '70%', size: 50, duration: 18, delay: 5 },
    { left: '80%', top: '65%', size: 45, duration: 22, delay: 1 },
    { left: '50%', top: '85%', size: 35, duration: 16, delay: 3 },
    { left: '45%', top: '10%', size: 55, duration: 19, delay: 4 },
  ];

  const getFloatingSvg = () => {
    if (accentColor === 'superhero-spiderman') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5"/><path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5"/>
        </svg>
      );
    }
    if (accentColor === 'superhero-batman') {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 12 C 6 8, 10 12, 12 16 C 14 12, 18 8, 22 12 C 18 4, 14 6, 12 10 C 10 6, 6 4, 2 12 Z"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 22 8.5 12 22 2 8.5 12 2"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8.5" x2="22" y2="8.5"/>
      </svg>
    );
  };

  const floatingColor = accentColor === 'superhero-spiderman' ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') :
                        accentColor === 'superhero-batman' ? (isDark ? 'rgba(245, 211, 0, 0.4)' : 'rgba(0,0,0,0.4)') :
                        (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(237, 28, 36, 0.4)');

  return (
    <div className="absolute inset-0 z-[-10] pointer-events-none overflow-hidden opacity-0 group-[.visual-superhero]/superhero:opacity-100 transition-opacity duration-500">
      {/* Floating Elements */}
      {floatingConfig.map((config, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: config.left, top: config.top, width: config.size, height: config.size, color: floatingColor }}
          animate={{ 
            y: [0, -30, 0], 
            x: [0, 20, 0],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ duration: config.duration, repeat: Infinity, ease: "easeInOut", delay: config.delay }}
        >
          {getFloatingSvg()}
        </motion.div>
      ))}

      {accentColor === 'superhero-spiderman' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)' }} />
          {/* Halftone dots */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle, ${isDark ? '#fff' : '#000'} 2px, transparent 2.5px)`, backgroundSize: '16px 16px' }} />
          {/* Swinging web left */}
          <motion.div className="absolute top-0 left-[10%] w-[2px] h-[40%]" style={{ background: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', transformOrigin: 'top center' }} animate={{ rotate: [-15, 15, -15] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
          {/* Swinging web right */}
          <motion.div className="absolute top-0 right-[20%] w-[2px] h-[50%]" style={{ background: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', transformOrigin: 'top center' }} animate={{ rotate: [10, -20, 10] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div 
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, ${isDark ? '#fff' : '#000'} 40px, ${isDark ? '#fff' : '#000'} 42px), repeating-linear-gradient(-45deg, transparent, transparent 40px, ${isDark ? '#fff' : '#000'} 40px, ${isDark ? '#fff' : '#000'} 42px)`
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
          >
            <svg width="600" height="600" viewBox="0 0 100 100" fill={isDark ? '#fff' : '#000'} style={{ filter: isDark ? 'drop-shadow(0 0 15px rgba(226, 54, 54, 0.8))' : 'none' }}>
              <circle cx="50" cy="40" r="8" />
              <ellipse cx="50" cy="60" rx="10" ry="15" />
              <path d="M 45 40 Q 30 20 20 30" fill="none" stroke={isDark ? '#fff' : '#000'} strokeWidth="3" strokeLinecap="round" />
              <path d="M 55 40 Q 70 20 80 30" fill="none" stroke={isDark ? '#fff' : '#000'} strokeWidth="3" strokeLinecap="round" />
              <path d="M 45 45 Q 20 40 15 55" fill="none" stroke={isDark ? '#fff' : '#000'} strokeWidth="3" strokeLinecap="round" />
              <path d="M 55 45 Q 80 40 85 55" fill="none" stroke={isDark ? '#fff' : '#000'} strokeWidth="3" strokeLinecap="round" />
              <path d="M 45 55 Q 20 60 15 80" fill="none" stroke={isDark ? '#fff' : '#000'} strokeWidth="3" strokeLinecap="round" />
              <path d="M 55 55 Q 80 60 85 80" fill="none" stroke={isDark ? '#fff' : '#000'} strokeWidth="3" strokeLinecap="round" />
              <path d="M 45 65 Q 35 80 30 95" fill="none" stroke={isDark ? '#fff' : '#000'} strokeWidth="3" strokeLinecap="round" />
              <path d="M 55 65 Q 65 80 70 95" fill="none" stroke={isDark ? '#fff' : '#000'} strokeWidth="3" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>
      )}

      {accentColor === 'superhero-batman' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
          {/* Fog at bottom */}
          <motion.div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/60 to-transparent blur-xl" animate={{ opacity: [0.5, 0.8, 0.5], y: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
          {/* Flying bats */}
          {[...Array(4)].map((_, i) => (
            <motion.div key={`bat-${i}`} className="absolute" style={{ top: `${15 + i * 20}%`, left: '-10%', color: isDark ? 'rgba(245, 211, 0, 0.3)' : 'rgba(0,0,0,0.4)' }} animate={{ x: ['0vw', '110vw'], y: [0, Math.sin(i)*30, 0] }} transition={{ duration: 15 + i*5, repeat: Infinity, ease: "linear", delay: i * 3 }}>
              <svg width="40" height="20" viewBox="0 0 100 60" fill="currentColor"><path d="M 50 20 L 48 10 L 45 20 C 30 15 10 20 0 30 C 10 30 20 40 25 50 C 30 40 40 45 50 60 C 60 45 70 40 75 50 C 80 40 90 30 100 30 C 90 20 70 15 55 20 L 52 10 Z" /></svg>
            </motion.div>
          ))}
          
          <motion.div
            animate={{ scale: [1, 1.02, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
          >
            <svg width="800" height="400" viewBox="0 0 100 60" fill="none" stroke="#F5D300" strokeWidth="1.5" style={{ filter: isDark ? 'drop-shadow(0 0 15px rgba(245, 211, 0, 0.9))' : 'drop-shadow(0 0 8px rgba(245, 211, 0, 0.6))' }}>
              <path d="M 50 20 L 48 10 L 45 20 C 30 15 10 20 0 30 C 10 30 20 40 25 50 C 30 40 40 45 50 60 C 60 45 70 40 75 50 C 80 40 90 30 100 30 C 90 20 70 15 55 20 L 52 10 Z" />
            </svg>
          </motion.div>
        </div>
      )}

      {accentColor === 'superhero-superman' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 to-transparent" />
          {/* Speed lines */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {[...Array(15)].map((_, i) => (
              <motion.div key={`speed-${i}`} className="absolute w-[2px] h-[30%]" style={{ left: `${5 + i * 6.5}%`, top: '-30%', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.8), transparent)' }} animate={{ y: ['0vh', '130vh'] }} transition={{ duration: 0.8 + (i % 3) * 0.5, repeat: Infinity, ease: "linear", delay: (i % 5) * 0.4 }} />
            ))}
          </div>
          {/* Clouds */}
          <motion.div className="absolute bottom-[10%] left-[-20%] opacity-20" animate={{ x: ['0vw', '120vw'] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
            <svg width="200" height="100" viewBox="0 0 24 24" fill="#fff"><path d="M17.5 19c-2.48 0-4.5-2.02-4.5-4.5 0-.25.02-.5.06-.74-.46-.16-.95-.26-1.46-.26-2.48 0-4.5 2.02-4.5 4.5S9.12 22.5 11.6 22.5c.34 0 .67-.04 1-.11.7.67 1.66 1.11 2.7 1.11 2.21 0 4-1.79 4-4 0-.15-.01-.3-.03-.45.01 0 .02-.05.03-.05zM12 12c-2.76 0-5 2.24-5 5 0 .28.02.55.07.81-.53-.16-1.09-.26-1.67-.26-3.04 0-5.5 2.46-5.5 5.5s2.46 5.5 5.5 5.5c.42 0 .83-.05 1.22-.14.87.83 2.06 1.39 3.38 1.39 2.76 0 5-2.24 5-5 0-.19-.01-.37-.04-.55.01 0 .03-.05.04-.05z" opacity=".3"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
          </motion.div>
          <motion.div
            animate={{ y: ['100%', '-100%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #fff 2px, transparent 2px)',
              backgroundSize: '100px 100px'
            }}
          />
          <motion.div
            animate={{ y: ['100%', '-100%'] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 5 }}
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #fff 3px, transparent 3px)',
              backgroundSize: '150px 150px',
              backgroundPosition: '50px 50px'
            }}
          />
          
          <motion.div
            animate={{ y: [-10, 10, -10], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
          >
            <svg width="600" height="600" viewBox="0 0 100 100" fill="none" stroke="#ED1C24" strokeWidth="4" style={{ filter: isDark ? 'drop-shadow(0 0 15px rgba(237, 28, 36, 0.8))' : 'none' }}>
              <polygon points="10,30 50,10 90,30 50,90" fill="rgba(237, 28, 36, 0.1)" strokeLinejoin="round" />
              <path d="M 80 35 C 80 35 70 25 50 25 C 30 25 25 35 25 40 C 25 50 45 55 50 60 C 60 70 65 80 50 80 C 35 80 30 70 30 70 L 20 75 C 20 75 30 90 50 90 C 70 90 75 75 75 65 C 75 50 50 45 45 40 C 40 35 45 30 50 30 C 65 30 75 40 75 40 Z" fill="#ED1C24" />
            </svg>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const MinecraftDynamicBackground = ({ accentColor, performanceMode, optimizationMode }: { accentColor?: AccentColor, performanceMode?: boolean, optimizationMode?: boolean }) => (
  <div className="absolute inset-0 z-[-10] pointer-events-none overflow-hidden opacity-0 group-[.visual-game-minecraft]/game-minecraft:opacity-100 transition-opacity duration-500">
    {/* Static Fallback / Base */}
    <div className="static-fallback absolute inset-0 bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF] dark:from-[#0B0B2A] dark:to-[#1B1B4A]">
      <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] [image-rendering:pixelated]" />
    </div>
    
    {!performanceMode && (
      <>
        {/* Scrolling Sky Pattern */}
        {!optimizationMode && <div className="mc-sky-layer" />}
        
        {/* Moving Clouds */}
        {!optimizationMode ? (
          <>
            <div className="mc-cloud" style={{ top: '10%', left: '-10%', animationDuration: '120s', animationDelay: '0s' }} />
            <div className="mc-cloud" style={{ top: '25%', left: '-15%', animationDuration: '180s', animationDelay: '-40s' }} />
            <div className="mc-cloud" style={{ top: '15%', left: '-20%', animationDuration: '150s', animationDelay: '-80s' }} />
            <div className="mc-cloud" style={{ top: '35%', left: '-5%', animationDuration: '200s', animationDelay: '-120s' }} />
            <div className="mc-cloud" style={{ top: '5%', left: '-25%', animationDuration: '140s', animationDelay: '-20s' }} />
          </>
        ) : (
          <div className="mc-cloud" style={{ top: '15%', left: '-10%', animationDuration: '150s', animationDelay: '0s', opacity: 0.3 }} />
        )}
        
        {/* Floating Blocks */}
        <div className="absolute top-[15%] left-[10%] w-12 h-12 bg-[var(--mc-dirt)] border-4 border-t-[var(--mc-dirt-dark)] border-l-[var(--mc-dirt-dark)] border-b-[#3d2c1e] border-r-[#3d2c1e] animate-float" style={{ imageRendering: 'pixelated' }}>
          <div className="absolute inset-0 bg-[var(--mc-grass)] h-3 border-b-4 border-[#3aae3a]" />
        </div>
        {!optimizationMode && (
          <>
            <div className="absolute top-[40%] right-[15%] w-10 h-10 bg-[var(--mc-stone)] border-4 border-t-[var(--mc-stone-light)] border-l-[var(--mc-stone-light)] border-b-[var(--mc-stone-dark)] border-r-[var(--mc-stone-dark)] animate-float" style={{ animationDelay: '1.5s', imageRendering: 'pixelated' }} />
            <div className="absolute bottom-[30%] left-[20%] w-14 h-14 bg-[#6b4e31] border-4 border-t-[#8b6540] border-l-[#8b6540] border-b-[#4a3622] border-r-[#4a3622] animate-float" style={{ animationDelay: '2s', imageRendering: 'pixelated' }} />
          </>
        )}
        
        {/* Creeper and Skeleton Walking */}
        {accentColor === 'creeper-green' && !optimizationMode && (
          <>
            <motion.div
              initial={{ x: '-100px' }}
              animate={{ x: '100vw' }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[120px] z-[1] mc-mob-creeper"
            >
              <div className="w-12 h-20 bg-[#51a03e] border-4 border-[#3a7a2d] relative shadow-lg" style={{ imageRendering: 'pixelated' }}>
                {/* Creeper Face */}
                <div className="absolute top-3 left-2 w-8 h-8 flex flex-col gap-1">
                  <div className="flex justify-between w-full h-2">
                    <div className="w-2 h-2 bg-black" />
                    <div className="w-2 h-2 bg-black" />
                  </div>
                  <div className="w-4 h-4 bg-black mx-auto mt-1" />
                  <div className="flex justify-between w-full h-2 -mt-1">
                    <div className="w-2 h-2 bg-black" />
                    <div className="w-2 h-2 bg-black" />
                  </div>
                </div>
                {/* Feet Animation */}
                <div className="absolute -bottom-2 -left-1 w-5 h-4 bg-[#3a7a2d] border-2 border-[#2a5a20] animate-bounce" style={{ animationDuration: '0.5s' }} />
                <div className="absolute -bottom-2 -right-1 w-5 h-4 bg-[#3a7a2d] border-2 border-[#2a5a20] animate-bounce" style={{ animationDuration: '0.5s', animationDelay: '0.25s' }} />
              </div>
            </motion.div>
    
            {/* Normal Skeleton */}
            <motion.div
              initial={{ x: '-250px' }}
              animate={{ x: '100vw' }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear", delay: 2 }}
              className="absolute bottom-[120px] z-[1] mc-mob-skeleton"
            >
              <div className="relative w-10 h-32 flex flex-col items-center" style={{ imageRendering: 'pixelated' }}>
                {/* Head */}
                <div className="w-10 h-10 bg-[#d1d1d1] border-2 border-[#a0a0a0] relative">
                  <div className="absolute top-3 left-2 w-2 h-2 bg-[#404040]" />
                  <div className="absolute top-3 right-2 w-2 h-2 bg-[#404040]" />
                  <div className="absolute bottom-1 left-2 right-2 h-2 bg-[#404040] opacity-40" />
                </div>
                {/* Body */}
                <div className="w-4 h-12 bg-[#d1d1d1] border-x-2 border-[#a0a0a0] relative">
                  <div className="absolute inset-0 flex flex-col justify-around py-1">
                    <div className="h-0.5 bg-[#a0a0a0] w-full" />
                    <div className="h-0.5 bg-[#a0a0a0] w-full" />
                    <div className="h-0.5 bg-[#a0a0a0] w-full" />
                  </div>
                  {/* Arms */}
                  <div className="absolute top-0 -left-3 w-2 h-12 bg-[#d1d1d1] border-2 border-[#a0a0a0] mc-skeleton-arm origin-top" />
                  <div className="absolute top-0 -right-3 w-2 h-12 bg-[#d1d1d1] border-2 border-[#a0a0a0] mc-skeleton-arm origin-top" style={{ animationDelay: '0.75s' }} />
                </div>
                {/* Legs */}
            <div className="flex gap-1">
              <div className="w-2 h-12 bg-[#d1d1d1] border-2 border-[#a0a0a0] mc-skeleton-leg origin-top" />
              <div className="w-2 h-12 bg-[#d1d1d1] border-2 border-[#a0a0a0] mc-skeleton-leg origin-top" style={{ animationDelay: '0.75s' }} />
            </div>
          </div>
        </motion.div>
          </>
        )}
        {/* Enderman and Wither Skeleton Walking */}
        {accentColor === 'enderman-purple' && (
          <>
        <motion.div
          initial={{ x: '100vw' }}
          animate={{ 
            x: ['100vw', '80vw', '80vw', '60vw', '60vw', '30vw', '30vw', '-200px'],
            opacity: [1, 1, 0, 0, 1, 1, 0, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear",
            times: [0, 0.2, 0.21, 0.3, 0.31, 0.6, 0.61, 1]
          }}
          className="absolute bottom-[120px] z-[1] mc-mob-enderman"
        >
          <div className="relative w-12 h-48 flex flex-col items-center animate-mc-ender-glitch" style={{ imageRendering: 'pixelated' }}>
            {/* Enderman Head */}
            <motion.div 
              animate={{ y: [0, -1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-10 h-10 bg-[#161616] border-2 border-[#000] relative z-10"
            >
              {/* Eyes */}
              <div className="absolute top-4 left-1 w-3 h-1.5 bg-[#ff00ff] shadow-[0_0_5px_#ff00ff]" />
              <div className="absolute top-4 right-1 w-3 h-1.5 bg-[#ff00ff] shadow-[0_0_5px_#ff00ff]" />
            </motion.div>

            {/* Enderman Body */}
            <div className="w-10 h-16 bg-[#161616] border-2 border-[#000] -mt-0.5 relative">
              {/* Arms */}
              <motion.div 
                animate={{ rotate: [5, -5, 5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 -left-2 w-2 h-32 bg-[#161616] border-2 border-[#000] origin-top"
              />
              <motion.div 
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-0 -right-2 w-2 h-32 bg-[#161616] border-2 border-[#000] origin-top"
              />
            </div>

            {/* Legs */}
            <div className="flex gap-2">
              <motion.div 
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-32 bg-[#161616] border-2 border-[#000] origin-top"
              />
              <motion.div 
                animate={{ rotate: [10, -10, 10] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.75 }}
                className="w-2 h-32 bg-[#161616] border-2 border-[#000] origin-top"
              />
            </div>

            {/* Ender Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [-20, -80], 
                  x: [0, (Math.random() - 0.5) * 60],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 0.8 + Math.random(), 
                  repeat: Infinity, 
                  delay: Math.random() * 2 
                }}
                className="absolute w-1.5 h-1.5 bg-[#ff00ff] shadow-[0_0_5px_#ff00ff]"
              />
            ))}
          </div>
        </motion.div>

        {/* Wither Skeleton */}
        <motion.div
          initial={{ x: '120vw' }}
          animate={{ x: '-300px' }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 5 }}
          className="absolute bottom-[120px] z-[1] mc-mob-wither-skeleton"
        >
          <div className="relative w-12 h-40 flex flex-col items-center" style={{ imageRendering: 'pixelated' }}>
            {/* Head */}
            <div className="w-12 h-12 bg-[#1a1a1a] border-2 border-[#000] relative">
              <div className="absolute top-4 left-2 w-3 h-3 bg-[#404040]" />
              <div className="absolute top-4 right-2 w-3 h-3 bg-[#404040]" />
              <div className="absolute bottom-1 left-2 right-2 h-3 bg-[#000] opacity-60" />
            </div>
            {/* Body */}
            <div className="w-5 h-16 bg-[#1a1a1a] border-x-2 border-[#000] relative">
              <div className="absolute inset-0 flex flex-col justify-around py-1">
                <div className="h-1 bg-[#000] w-full" />
                <div className="h-1 bg-[#000] w-full" />
                <div className="h-1 bg-[#000] w-full" />
              </div>
              {/* Arms */}
              <div className="absolute top-0 -left-4 w-3 h-16 bg-[#1a1a1a] border-2 border-[#000] mc-skeleton-arm origin-top" />
              <div className="absolute top-0 -right-4 w-3 h-16 bg-[#1a1a1a] border-2 border-[#000] mc-skeleton-arm origin-top" style={{ animationDelay: '0.75s' }} />
            </div>
            {/* Legs */}
            <div className="flex gap-1.5">
              <div className="w-3 h-16 bg-[#1a1a1a] border-2 border-[#000] mc-skeleton-leg origin-top" />
              <div className="w-3 h-16 bg-[#1a1a1a] border-2 border-[#000] mc-skeleton-leg origin-top" style={{ animationDelay: '0.75s' }} />
            </div>
          </div>
        </motion.div>
          </>
        )}
      </>
    )}

    {/* Bottom Landscape */}
    <div className="mc-landscape" />
  </div>
);

const SuperheroClickEffect = ({ active, isHome, accentColor, performanceMode, superheroAttackIndex = 0 }: { active: boolean; isHome: boolean; accentColor: string; performanceMode: boolean; superheroAttackIndex?: number }) => {
  const [effects, setEffects] = useState<{ id: number; x: number; y: number; startX: number; startY: number; attackType: number }[]>([]);

  useEffect(() => {
    if (!active || !isHome || performanceMode) {
      setEffects([]);
      return;
    }

    const handleClick = (e: MouseEvent) => {
      if (!isHome || performanceMode) return;
      const id = Date.now();
      
      // Calculate random border start position
      const side = Math.floor(Math.random() * 4);
      let startX = 0;
      let startY = 0;
      if (side === 0) { // top
        startX = Math.random() * window.innerWidth;
        startY = -50;
      } else if (side === 1) { // right
        startX = window.innerWidth + 50;
        startY = Math.random() * window.innerHeight;
      } else if (side === 2) { // bottom
        startX = Math.random() * window.innerWidth;
        startY = window.innerHeight + 50;
      } else { // left
        startX = -50;
        startY = Math.random() * window.innerHeight;
      }

      setEffects(prev => [...prev.slice(-2), { id, x: e.clientX, y: e.clientY, startX, startY, attackType: superheroAttackIndex }]);
      
      setTimeout(() => {
        setEffects(prev => prev.filter(eff => eff.id !== id));
      }, 3000); // Increased timeout for longer animations
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [active, isHome, performanceMode, superheroAttackIndex]);

  if (!active || !isHome || performanceMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {effects.map(eff => {
          const angle = Math.atan2(eff.y - eff.startY, eff.x - eff.startX) * (180 / Math.PI);
          const distance = Math.sqrt(Math.pow(eff.x - eff.startX, 2) + Math.pow(eff.y - eff.startY, 2));

          if (accentColor === 'superhero-batman') {
            const attack = eff.attackType;

            if (attack === 0) {
              // Batarang (Existing)
              return (
                <motion.div key={eff.id}>
                  {/* Batarang flying */}
                  <motion.div
                    className="absolute"
                    initial={{ left: eff.startX, top: eff.startY, rotate: 0, opacity: 1, scale: 0.5 }}
                    animate={{ left: eff.x, top: eff.y, rotate: 1440, opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1] }}
                    transition={{ duration: 0.7, ease: "easeIn", times: [0, 0.2, 0.9, 1] }}
                    style={{ marginLeft: -15, marginTop: -15 }}
                  >
                    <svg width="30" height="30" viewBox="0 0 100 60" fill="none" stroke="#F5D300" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 12px rgba(245, 211, 0, 1))' }}>
                      <path d="M 50 20 L 48 10 L 45 20 C 30 15 10 20 0 30 C 10 30 20 40 25 50 C 30 40 40 45 50 60 C 60 45 70 40 75 50 C 80 40 90 30 100 30 C 90 20 70 15 55 20 L 52 10 Z" />
                    </svg>
                  </motion.div>
                  {/* Explosion Core */}
                  <motion.div
                    className="absolute rounded-full"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 2, 3], opacity: [0, 1, 0] }}
                    transition={{ delay: 0.65, duration: 0.6, ease: "easeOut" }}
                    style={{ 
                      width: 40, height: 40, marginLeft: -20, marginTop: -20,
                      background: 'radial-gradient(circle, #F5D300 0%, #ff9900 50%, transparent 80%)',
                      filter: 'drop-shadow(0 0 15px #F5D300)'
                    }}
                  />
                  {/* Explosion Shockwave */}
                  <motion.div
                    className="absolute rounded-full border-2 border-[#F5D300]"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ delay: 0.65, duration: 0.8, ease: "easeOut" }}
                    style={{ width: 50, height: 50, marginLeft: -25, marginTop: -25, filter: 'drop-shadow(0 0 8px #F5D300)' }}
                  />
                  {/* Sparks */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div key={`spark-${i}`} className="absolute bg-[#F5D300] rounded-full"
                      initial={{ left: eff.x, top: eff.y, scale: 1, opacity: 1 }}
                      animate={{
                        x: Math.cos(i * 45 * Math.PI / 180) * (80 + Math.random() * 40),
                        y: Math.sin(i * 45 * Math.PI / 180) * (80 + Math.random() * 40),
                        scale: 0, opacity: 0
                      }}
                      transition={{ delay: 0.65, duration: 0.5 + Math.random() * 0.3, ease: "easeOut" }}
                      style={{ width: 4, height: 4, marginLeft: -2, marginTop: -2, filter: 'drop-shadow(0 0 5px #F5D300)' }}
                    />
                  ))}
                </motion.div>
              );
            } else if (attack === 1) {
              // Grapple Hook
              return (
                <motion.div key={eff.id}>
                  {/* Grapple Line */}
                  <motion.div
                    className="absolute bg-gray-800"
                    style={{
                      left: eff.startX, top: eff.startY, height: 4,
                      transformOrigin: 'left center', rotate: angle,
                      filter: 'drop-shadow(0 0 2px #000)',
                      borderTop: '1px solid #F5D300', borderBottom: '1px solid #F5D300'
                    }}
                    initial={{ width: 0, opacity: 1 }}
                    animate={{ width: distance, opacity: [1, 1, 0] }}
                    transition={{ duration: 0.4, ease: "easeOut", opacity: { delay: 0.8, duration: 0.2 } }}
                  />
                  {/* Grapple Claw Impact */}
                  <motion.div
                    className="absolute"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0, rotate: angle }}
                    animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                    transition={{ delay: 0.3, duration: 0.6, type: "tween", ease: "easeOut" }}
                    style={{ marginLeft: -20, marginTop: -20 }}
                  >
                    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="#F5D300" strokeWidth="4">
                      <path d="M 50 50 L 20 20 M 50 50 L 80 20 M 50 50 L 50 10" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="50" cy="50" r="10" fill="#333" />
                    </svg>
                  </motion.div>
                  {/* Impact Dust */}
                  <motion.div
                    className="absolute rounded-full bg-gray-500/50"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
                    style={{ width: 30, height: 30, marginLeft: -15, marginTop: -15, filter: 'blur(4px)' }}
                  />
                </motion.div>
              );
            } else if (attack === 2) {
              // Smoke Pellet
              return (
                <motion.div key={eff.id}>
                  {/* Pellet Drop */}
                  <motion.div
                    className="absolute bg-gray-800 rounded-full"
                    initial={{ left: eff.x, top: eff.y - 200, scale: 0.5, opacity: 0 }}
                    animate={{ top: eff.y, scale: 1, opacity: [0, 1, 0] }}
                    transition={{ duration: 0.4, ease: "easeIn" }}
                    style={{ width: 16, height: 16, marginLeft: -8, marginTop: -8, border: '2px solid #F5D300' }}
                  />
                  {/* Smoke Clouds */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div key={`smoke-${i}`} className="absolute rounded-full"
                      initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 3 + Math.random() * 2], 
                        opacity: [0, 0.8, 0],
                        x: (Math.random() - 0.5) * 100,
                        y: (Math.random() - 0.5) * 100
                      }}
                      transition={{ delay: 0.35 + i * 0.05, duration: 1.5 + Math.random(), ease: "easeOut" }}
                      style={{ 
                        width: 60, height: 60, marginLeft: -30, marginTop: -30,
                        background: i % 2 === 0 ? '#1f2937' : '#374151',
                        filter: 'blur(10px)'
                      }}
                    />
                  ))}
                  {/* Small flash */}
                  <motion.div
                    className="absolute rounded-full bg-[#F5D300]"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ delay: 0.35, duration: 0.3, ease: "easeOut" }}
                    style={{ width: 40, height: 40, marginLeft: -20, marginTop: -20, filter: 'blur(5px)' }}
                  />
                </motion.div>
              );
            } else if (attack === 3) {
              // Bat-Swarm / Sonar
              return (
                <motion.div key={eff.id}>
                  {/* Sonar Rings */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div key={`sonar-${i}`} className="absolute rounded-full border-2 border-[#F5D300]"
                      initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                      animate={{ scale: 6 + i * 2, opacity: 0 }}
                      transition={{ delay: i * 0.2, duration: 1.2, ease: "easeOut" }}
                      style={{ width: 40, height: 40, marginLeft: -20, marginTop: -20, filter: 'drop-shadow(0 0 5px #F5D300)' }}
                    />
                  ))}
                  {/* Bats Flying Out */}
                  {[...Array(6)].map((_, i) => {
                    const batAngle = (i * 60) + (Math.random() * 30);
                    return (
                      <motion.div key={`bat-${i}`} className="absolute"
                        initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0, rotate: batAngle + 90 }}
                        animate={{ 
                          x: Math.cos(batAngle * Math.PI / 180) * 200,
                          y: Math.sin(batAngle * Math.PI / 180) * 200,
                          scale: [0, 1, 1.5, 0], 
                          opacity: [0, 1, 1, 0] 
                        }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        style={{ marginLeft: -15, marginTop: -15 }}
                      >
                        <svg width="30" height="30" viewBox="0 0 100 60" fill="#111" stroke="#F5D300" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 3px #F5D300)' }}>
                          <path d="M 50 20 L 48 10 L 45 20 C 30 15 10 20 0 30 C 10 30 20 40 25 50 C 30 40 40 45 50 60 C 60 45 70 40 75 50 C 80 40 90 30 100 30 C 90 20 70 15 55 20 L 52 10 Z" />
                        </svg>
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            } else if (attack === 4) {
              // Explosive Gel
              return (
                <motion.div key={eff.id}>
                  {/* Gel Spray */}
                  <motion.div
                    className="absolute bg-blue-400/80 rounded-full"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 1] }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ width: 40, height: 40, marginLeft: -20, marginTop: -20, filter: 'blur(4px)', border: '2px solid #F5D300' }}
                  />
                  {/* Detonation */}
                  <motion.div
                    className="absolute rounded-full"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 6], opacity: [0, 1, 0] }}
                    transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
                    style={{ width: 40, height: 40, marginLeft: -20, marginTop: -20, background: 'radial-gradient(circle, #fff 0%, #F5D300 50%, transparent 80%)' }}
                  />
                  <motion.div
                    className="absolute text-[#F5D300] font-black italic text-2xl"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0, rotate: -10 }}
                    animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0], y: -50 }}
                    transition={{ delay: 1.2, duration: 0.8, type: "tween", ease: "easeOut" }}
                    style={{ marginLeft: -50, width: 100, textAlign: 'center' }}
                  >
                    KABOOM!
                  </motion.div>
                </motion.div>
              );
            } else if (attack === 5) {
              // Detective Mode Pulse
              return (
                <motion.div key={eff.id}>
                  {/* Grid Pulse */}
                  <motion.div
                    className="absolute border-2 border-blue-500/30 rounded-full"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: 20, opacity: 0 }}
                    transition={{ duration: 1.5, ease: "linear" }}
                    style={{ width: 100, height: 100, marginLeft: -50, marginTop: -50, background: 'radial-gradient(circle, transparent 70%, rgba(59, 130, 246, 0.1) 100%)' }}
                  />
                  {/* Silhouette Highlights */}
                  {[...Array(4)].map((_, i) => {
                    const angle = (i * 90) + Math.random() * 45;
                    const dist = 100 + Math.random() * 150;
                    return (
                      <motion.div key={`detective-${i}`} className="absolute"
                        initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0 }}
                        animate={{ 
                          x: Math.cos(angle * Math.PI / 180) * dist,
                          y: Math.sin(angle * Math.PI / 180) * dist,
                          scale: [0, 1, 1], opacity: [0, 0.8, 0] 
                        }}
                        transition={{ delay: 0.5, duration: 1.0 }}
                        style={{ marginLeft: -15, marginTop: -15 }}
                      >
                        <div className="w-8 h-12 bg-blue-500/20 border border-blue-400 rounded-sm blur-[1px]" />
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            } else {
              // Bat-Signal
              return (
                <motion.div key={eff.id}>
                  {/* Light Beam from Bottom */}
                  <motion.div
                    className="absolute"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: [0, 0.4, 0.4, 0], height: window.innerHeight }}
                    transition={{ duration: 2.0, times: [0, 0.2, 0.8, 1] }}
                    style={{ 
                      left: eff.x - 40, top: eff.y - window.innerHeight, width: 80,
                      background: 'linear-gradient(to top, rgba(245, 211, 0, 0.3) 0%, transparent 100%)',
                      clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                    }}
                  />
                  {/* Projected Logo */}
                  <motion.div
                    className="absolute"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0, rotate: -10 }}
                    animate={{ scale: [0, 2.5, 2.5, 0], opacity: [0, 0.8, 0.8, 0], rotate: 0 }}
                    transition={{ duration: 2.0, times: [0, 0.2, 0.8, 1] }}
                    style={{ marginLeft: -40, marginTop: -24 }}
                  >
                    <svg width="80" height="48" viewBox="0 0 100 60" fill="#F5D300" style={{ filter: 'drop-shadow(0 0 15px #F5D300)' }}>
                      <path d="M 50 20 L 48 10 L 45 20 C 30 15 10 20 0 30 C 10 30 20 40 25 50 C 30 40 40 45 50 60 C 60 45 70 40 75 50 C 80 40 90 30 100 30 C 90 20 70 15 55 20 L 52 10 Z" />
                    </svg>
                  </motion.div>
                </motion.div>
              );
            }
          }

          if (accentColor === 'superhero-spiderman') {
            const attack = eff.attackType;

            if (attack === 0) {
              // Web line (Existing)
              return (
                <motion.div key={eff.id}>
                  {/* Web line */}
                  <motion.div
                    className="absolute bg-white"
                    style={{
                      left: eff.startX,
                      top: eff.startY,
                      height: 3,
                      transformOrigin: 'left center',
                      rotate: angle,
                      filter: 'drop-shadow(0 0 6px rgba(255,255,255,1))'
                    }}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: distance, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.0, ease: "easeOut", times: [0, 0.2, 0.8, 1] }}
                  />
                  {/* Web splat */}
                  <motion.div
                    className="absolute"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0, rotate: -20 }}
                    animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1, 0], rotate: 0 }}
                    transition={{ delay: 0.4, duration: 1.5, ease: "easeOut", times: [0, 0.15, 0.8, 1] }}
                    style={{ marginLeft: -35, marginTop: -35 }}
                  >
                    <svg width="70" height="70" viewBox="0 0 100 100" fill="none" stroke="rgba(255,255,255,1)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' }}>
                      <circle cx="50" cy="50" r="12" />
                      <circle cx="50" cy="50" r="28" />
                      <circle cx="50" cy="50" r="45" />
                      <line x1="50" y1="5" x2="50" y2="95" />
                      <line x1="5" y1="50" x2="95" y2="50" />
                      <line x1="18" y1="18" x2="82" y2="82" />
                      <line x1="18" y1="82" x2="82" y2="18" />
                    </svg>
                  </motion.div>
                  {/* Web droplets */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div key={`drop-${i}`} className="absolute bg-white rounded-full"
                      initial={{ left: eff.x, top: eff.y, scale: 1, opacity: 1 }}
                      animate={{
                        x: Math.cos(i * 60 * Math.PI / 180) * (40 + Math.random() * 30),
                        y: Math.sin(i * 60 * Math.PI / 180) * (40 + Math.random() * 30),
                        scale: 0, opacity: 0
                      }}
                      transition={{ delay: 0.45, duration: 0.6 + Math.random() * 0.4, ease: "easeOut" }}
                      style={{ width: 6, height: 6, marginLeft: -3, marginTop: -3, filter: 'drop-shadow(0 0 4px #fff)' }}
                    />
                  ))}
                </motion.div>
              );
            } else if (attack === 1) {
              // Web Barrage
              return (
                <motion.div key={eff.id}>
                  {[...Array(4)].map((_, i) => {
                    const offsetX = (Math.random() - 0.5) * 80;
                    const offsetY = (Math.random() - 0.5) * 80;
                    const delay = i * 0.15;
                    return (
                      <motion.div key={`barrage-${i}`}>
                        {/* Small Web Line */}
                        <motion.div
                          className="absolute bg-white"
                          style={{
                            left: eff.startX, top: eff.startY, height: 2,
                            transformOrigin: 'left center', rotate: angle,
                            filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
                          }}
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: distance, opacity: [0, 1, 1, 0] }}
                          transition={{ delay, duration: 0.4, ease: "easeOut" }}
                        />
                        {/* Small Splat */}
                        <motion.div
                          className="absolute"
                          initial={{ left: eff.x + offsetX, top: eff.y + offsetY, scale: 0, opacity: 0, rotate: Math.random() * 360 }}
                          animate={{ scale: [0, 1, 1], opacity: [0, 1, 1, 0] }}
                          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
                          style={{ marginLeft: -15, marginTop: -15 }}
                        >
                          <svg width="30" height="30" viewBox="0 0 100 100" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' }}>
                            <circle cx="50" cy="50" r="15" />
                            <line x1="50" y1="10" x2="50" y2="90" />
                            <line x1="10" y1="50" x2="90" y2="50" />
                            <line x1="22" y1="22" x2="78" y2="78" />
                            <line x1="22" y1="78" x2="78" y2="22" />
                          </svg>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            } else if (attack === 2) {
              // Spider-Sense
              return (
                <motion.div key={eff.id}>
                  {/* Head/Center pulse */}
                  <motion.div
                    className="absolute rounded-full bg-red-500/20"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ width: 60, height: 60, marginLeft: -30, marginTop: -30, filter: 'blur(5px)' }}
                  />
                  {/* Tingle Lines */}
                  {[...Array(6)].map((_, i) => {
                    const tingleAngle = (i * 60) + (Math.random() * 20 - 10);
                    return (
                      <motion.div key={`tingle-${i}`} className="absolute"
                        initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0, rotate: tingleAngle }}
                        animate={{ 
                          scale: [0, 1.5, 1.5, 0], 
                          opacity: [0, 1, 1, 0],
                          x: Math.cos(tingleAngle * Math.PI / 180) * 50,
                          y: Math.sin(tingleAngle * Math.PI / 180) * 50
                        }}
                        transition={{ duration: 0.8, ease: "easeOut", times: [0, 0.2, 0.8, 1] }}
                        style={{ marginLeft: -10, marginTop: -30 }}
                      >
                        <svg width="20" height="60" viewBox="0 0 20 60" fill="none" stroke="#ef4444" strokeWidth="4" style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }}>
                          <path d="M 10 60 L 15 40 L 5 20 L 10 0" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            } else if (attack === 3) {
              // Web Zip Impact
              return (
                <motion.div key={eff.id}>
                  {/* Thick Web Line */}
                  <motion.div
                    className="absolute bg-white"
                    style={{
                      left: eff.startX, top: eff.startY, height: 6,
                      transformOrigin: 'left center', rotate: angle,
                      filter: 'drop-shadow(0 0 8px rgba(255,255,255,1))'
                    }}
                    initial={{ width: 0, opacity: 1 }}
                    animate={{ width: distance, opacity: [1, 1, 0] }}
                    transition={{ duration: 0.3, ease: "easeIn" }}
                  />
                  {/* Spidey Landing Impact */}
                  <motion.div
                    className="absolute rounded-full border-[8px] border-red-500"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: 5, opacity: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                    style={{ width: 60, height: 60, marginLeft: -30, marginTop: -30, filter: 'drop-shadow(0 0 10px #ef4444)' }}
                  />
                  <motion.div
                    className="absolute rounded-full border-[4px] border-blue-500"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: 8, opacity: 0 }}
                    transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
                    style={{ width: 60, height: 60, marginLeft: -30, marginTop: -30, filter: 'drop-shadow(0 0 10px #3b82f6)' }}
                  />
                  {/* Ground Debris */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div key={`debris-${i}`} className="absolute bg-gray-400 rounded-sm"
                      initial={{ left: eff.x, top: eff.y, scale: 1, opacity: 1 }}
                      animate={{
                        x: (Math.random() - 0.5) * 150,
                        y: (Math.random() - 0.5) * 150,
                        scale: 0, opacity: 0, rotate: Math.random() * 360
                      }}
                      transition={{ delay: 0.3, duration: 0.6 + Math.random() * 0.4, ease: "easeOut" }}
                      style={{ width: 8, height: 8, marginLeft: -4, marginTop: -4 }}
                    />
                  ))}
                </motion.div>
              );
            } else if (attack === 4) {
              // Spider-Drone
              return (
                <motion.div key={eff.id}>
                  <motion.div
                    className="absolute"
                    initial={{ left: eff.startX, top: eff.startY, scale: 0.5, rotate: 0 }}
                    animate={{ left: eff.x, top: eff.y, scale: 1, rotate: 360 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ marginLeft: -20, marginTop: -20 }}
                  >
                    <svg width="40" height="40" viewBox="0 0 100 100" fill="#333" stroke="#ef4444" strokeWidth="2">
                      <circle cx="50" cy="50" r="15" />
                      <circle cx="45" cy="45" r="3" fill="#ef4444" />
                      <circle cx="55" cy="45" r="3" fill="#ef4444" />
                      <path d="M 35 50 Q 20 40 10 50 M 35 55 Q 20 65 10 55" fill="none" />
                      <path d="M 65 50 Q 80 40 90 50 M 65 55 Q 80 65 90 55" fill="none" />
                    </svg>
                  </motion.div>
                  {/* Zap */}
                  <motion.div
                    className="absolute rounded-full bg-cyan-400"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                    style={{ width: 30, height: 30, marginLeft: -15, marginTop: -15, filter: 'blur(4px)' }}
                  />
                </motion.div>
              );
            } else if (attack === 5) {
              // Venom Blast
              return (
                <motion.div key={eff.id}>
                  <motion.div
                    className="absolute rounded-full"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 4, 5], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ 
                      width: 60, height: 60, marginLeft: -30, marginTop: -30,
                      background: 'radial-gradient(circle, #fbbf24 0%, #000 70%, transparent 100%)',
                      filter: 'drop-shadow(0 0 15px #fbbf24)'
                    }}
                  />
                  {/* Electricity */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div key={`venom-${i}`} className="absolute bg-yellow-400"
                      initial={{ left: eff.x, top: eff.y, scale: 1, opacity: 1 }}
                      animate={{
                        x: (Math.random() - 0.5) * 120,
                        y: (Math.random() - 0.5) * 120,
                        scale: [1, 2, 0], opacity: [1, 1, 0]
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      style={{ width: 2, height: 15, marginLeft: -1, marginTop: -7.5, rotate: Math.random() * 360 }}
                    />
                  ))}
                </motion.div>
              );
            } else {
              // Iron Spider Legs
              return (
                <motion.div key={eff.id}>
                  {[...Array(4)].map((_, i) => {
                    const legAngle = (i * 90) + 45;
                    return (
                      <motion.div key={`leg-${i}`} className="absolute"
                        initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0, rotate: legAngle }}
                        animate={{ scale: [0, 1.5, 1], opacity: [1, 1, 0] }}
                        transition={{ duration: 0.8, type: "tween", ease: "backOut" }}
                        style={{ marginLeft: -10, marginTop: -80, transformOrigin: 'bottom center' }}
                      >
                        <svg width="20" height="80" viewBox="0 0 20 80" fill="#fbbf24">
                          <path d="M 10 80 L 15 60 L 18 30 L 10 0 L 2 30 L 5 60 Z" />
                        </svg>
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            }
          }

          if (accentColor === 'superhero-superman') {
            const extendDistance = distance + 2000;
            const impactTime = (distance / extendDistance) * 0.6;
            const attack = eff.attackType;

            if (attack === 0) {
              // Heat Vision
              return (
                <motion.div key={eff.id}>
                  {/* Laser beam */}
                  <motion.div
                    className="absolute"
                    style={{
                      left: eff.startX,
                      top: eff.startY,
                      height: 8,
                      background: 'linear-gradient(90deg, rgba(237,28,36,0), rgba(237,28,36,1) 40%, #ffffff 80%, #ffffff 100%)',
                      transformOrigin: 'left center',
                      rotate: angle,
                      filter: 'drop-shadow(0 0 15px #ED1C24)'
                    }}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: extendDistance, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 0.8, ease: "easeIn", times: [0, 0.1, 0.8, 1] }}
                  />
                  {/* Impact flash core */}
                  <motion.div
                    className="absolute rounded-full"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
                    transition={{ delay: impactTime, duration: 0.5, ease: "easeOut" }}
                    style={{ 
                      width: 80, height: 80, marginLeft: -40, marginTop: -40,
                      background: 'radial-gradient(circle, #ffffff 0%, #ED1C24 30%, transparent 70%)',
                      filter: 'drop-shadow(0 0 20px #ED1C24)'
                    }}
                  />
                  {/* Impact shockwave */}
                  <motion.div
                    className="absolute rounded-full border-4 border-[#ED1C24]"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: 6, opacity: 0 }}
                    transition={{ delay: impactTime, duration: 0.8, ease: "easeOut" }}
                    style={{ width: 40, height: 40, marginLeft: -20, marginTop: -20, filter: 'drop-shadow(0 0 10px #ED1C24)' }}
                  />
                </motion.div>
              );
            } else if (attack === 1) {
              // Freeze Breath
              return (
                <motion.div key={eff.id}>
                  {/* Cold wind beam */}
                  <motion.div
                    className="absolute"
                    style={{
                      left: eff.startX, top: eff.startY, height: 80,
                      background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(165,243,252,0.6) 50%, rgba(255,255,255,0.8) 100%)',
                      transformOrigin: 'left center', rotate: angle, filter: 'drop-shadow(0 0 15px #a5f3fc)',
                      marginTop: -40,
                      clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 60%)'
                    }}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: distance + 150, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.2, ease: "easeOut", times: [0, 0.2, 0.8, 1] }}
                  />
                  {/* Ice Crystals */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div key={`ice-${i}`} className="absolute bg-cyan-50"
                      initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0, rotate: Math.random() * 360 }}
                      animate={{ scale: [0, 1.5 + Math.random(), 1.5 + Math.random()], opacity: [0, 0.9, 0] }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 1.5, ease: "easeOut" }}
                      style={{
                        width: 30 + Math.random() * 30, height: 6 + Math.random() * 6,
                        marginLeft: -15, marginTop: -3,
                        clipPath: 'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)',
                        filter: 'drop-shadow(0 0 10px #22d3ee)'
                      }}
                    />
                  ))}
                </motion.div>
              );
            } else if (attack === 2) {
              // Super Punch / Ground Smash
              return (
                <motion.div key={eff.id}>
                  {/* Central Impact Flash */}
                  <motion.div
                    className="absolute rounded-full bg-white"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: [0, 4, 0], opacity: [1, 1, 0] }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ width: 100, height: 100, marginLeft: -50, marginTop: -50, filter: 'drop-shadow(0 0 30px #3b82f6)' }}
                  />
                  {/* Shockwave 1 */}
                  <motion.div
                    className="absolute rounded-full border-[12px] border-blue-500"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: 10, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ width: 80, height: 80, marginLeft: -40, marginTop: -40 }}
                  />
                  {/* Shockwave 2 */}
                  <motion.div
                    className="absolute rounded-full border-[6px] border-red-500"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: 15, opacity: 0 }}
                    transition={{ delay: 0.15, duration: 0.9, ease: "easeOut" }}
                    style={{ width: 80, height: 80, marginLeft: -40, marginTop: -40 }}
                  />
                  {/* Ground Cracks */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div key={`crack-${i}`} className="absolute bg-gradient-to-r from-blue-600 to-transparent"
                      initial={{ left: eff.x, top: eff.y, width: 0, opacity: 1, rotate: i * 45 + (Math.random() * 20) }}
                      animate={{ width: 150 + Math.random() * 100, opacity: [1, 0] }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{ height: 6, transformOrigin: 'left center', marginTop: -3, filter: 'drop-shadow(0 0 5px #3b82f6)' }}
                    />
                  ))}
                </motion.div>
              );
            } else if (attack === 3) {
              // Sonic Flight Dash
              return (
                <motion.div key={eff.id}>
                  {/* Flight Streak */}
                  <motion.div
                    className="absolute"
                    style={{
                      left: eff.startX, top: eff.startY, height: 30,
                      background: 'linear-gradient(90deg, rgba(37,99,235,0), rgba(37,99,235,0.9) 40%, rgba(220,38,38,1) 80%, #ffffff 100%)',
                      transformOrigin: 'left center', rotate: angle, filter: 'drop-shadow(0 0 20px #2563eb)',
                      marginTop: -15, borderRadius: '15px'
                    }}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: extendDistance, opacity: [0, 1, 1, 0], x: [0, Math.cos(angle * Math.PI/180)*500] }}
                    transition={{ duration: 0.7, ease: "easeIn", times: [0, 0.1, 0.8, 1] }}
                  />
                  {/* Mach Cones */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div key={`cone-${i}`} className="absolute border-r-[6px] border-white rounded-full"
                      initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0, rotate: angle }}
                      animate={{ scale: [0, 3 + i], opacity: [0, 0.9, 0], x: Math.cos(angle * Math.PI/180) * (i * 80) }}
                      transition={{ delay: impactTime + i * 0.08, duration: 0.6, ease: "easeOut" }}
                      style={{ width: 100, height: 100, marginLeft: -50, marginTop: -50, filter: 'drop-shadow(0 0 15px #ffffff)' }}
                    />
                  ))}
                </motion.div>
              );
            } else if (attack === 4) {
              // Heat Vision Burst
              return (
                <motion.div key={eff.id}>
                  {/* Expanding Heat Sphere */}
                  <motion.div
                    className="absolute rounded-full"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 6, 8], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ 
                      width: 60, height: 60, marginLeft: -30, marginTop: -30,
                      background: 'radial-gradient(circle, #fff 0%, #ED1C24 40%, #ED1C24 70%, transparent 100%)',
                      filter: 'drop-shadow(0 0 30px #ED1C24)'
                    }}
                  />
                  {/* Heat Distortion */}
                  <motion.div
                    className="absolute rounded-full bg-red-500/10 backdrop-blur-sm"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 12], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ width: 60, height: 60, marginLeft: -30, marginTop: -30 }}
                  />
                </motion.div>
              );
            } else if (attack === 5) {
              // X-Ray Vision
              return (
                <motion.div key={eff.id}>
                  {/* X-Ray Frame */}
                  <motion.div
                    className="absolute border-2 border-cyan-400/50 bg-cyan-900/20 backdrop-blur-sm"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2.0, times: [0, 0.1, 0.8, 1], type: "tween" }}
                    style={{ width: 200, height: 150, marginLeft: -100, marginTop: -75, borderRadius: '8px', boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' }}
                  >
                    {/* Skeleton/Mechanical Grid */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-2 p-4 opacity-40">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="bg-cyan-200/30 rounded-sm" />
                      ))}
                    </div>
                    <div className="absolute top-2 left-2 text-[8px] font-mono text-cyan-400 uppercase tracking-widest">X-RAY SCANNING...</div>
                  </motion.div>
                </motion.div>
              );
            } else {
              // Cape Swish
              return (
                <motion.div key={eff.id}>
                  <motion.div
                    className="absolute bg-red-600"
                    initial={{ left: -500, top: eff.y - 100, width: 500, height: 200, skewX: -45, opacity: 0 }}
                    animate={{ left: window.innerWidth + 500, opacity: [0, 0.8, 0.8, 0] }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    style={{ 
                      filter: 'blur(20px)',
                      background: 'linear-gradient(to right, transparent, #dc2626 50%, transparent)'
                    }}
                  />
                  {/* Sonic Snap */}
                  <motion.div
                    className="absolute rounded-full border-2 border-white/30"
                    initial={{ left: eff.x, top: eff.y, scale: 0, opacity: 1 }}
                    animate={{ scale: 10, opacity: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{ width: 40, height: 40, marginLeft: -20, marginTop: -20 }}
                  />
                </motion.div>
              );
            }
          }

          return null;
        })}
      </AnimatePresence>
    </div>
  );
};

const EndermanTeleportEffect = ({ active, isHome }: { active: boolean; isHome: boolean }) => {
  const [effects, setEffects] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (!active || !isHome) {
      setEffects([]);
      return;
    }

    const handleClick = (e: MouseEvent) => {
      if (!isHome) return;
      const id = Date.now();
      // Only keep 1 effect at a time for maximum performance
      setEffects([{ id, x: e.clientX, y: e.clientY }]);
      
      setTimeout(() => {
        setEffects(prev => prev.filter(eff => eff.id !== id));
      }, 800);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [active, isHome]);

  if (!active || !isHome) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence mode="popLayout">
        {effects.map(eff => (
          <motion.div 
            key={eff.id} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute" 
            style={{ left: eff.x, top: eff.y }}
          >
            {/* Screen Glitch Effect (Localized) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.5], skewX: [0, 10, -10, 0] }}
              transition={{ duration: 0.3 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#ff00ff]/10 blur-3xl rounded-full"
            />

            {/* Teleport Flash */}
            <div className="mc-teleport-flash" />

            {/* Ender Eye Blink Visuals */}
            <div className="absolute -translate-x-[20px] -translate-y-[10px] flex gap-4">
              <div className="mc-ender-eye" />
              <div className="mc-ender-eye" />
            </div>
            
            {/* Ender particles - Increased count and spread */}
            {[...Array(16)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-1.5 h-1.5 bg-[#ff00ff] animate-mc-ender-particle"
                style={{ 
                  '--dx': `${(Math.random() - 0.5) * 300}px`,
                  '--dy': `${(Math.random() - 0.5) * 300}px`,
                  animationDelay: `${Math.random() * 0.3}s`,
                  imageRendering: 'pixelated'
                } as any}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const CreeperExplosionEffect = ({ active, isHome }: { active: boolean; isHome: boolean }) => {
  const [explosions, setExplosions] = useState<{ id: number; x: number; y: number; stage: 'tnt' | 'boom' }[]>([]);

  useEffect(() => {
    if (!active || !isHome) {
      setExplosions([]);
      return;
    }

    const handleClick = (e: MouseEvent) => {
      if (!isHome) return;
      const id = Date.now();
      
      setExplosions(prev => [...prev, { id, x: e.clientX, y: e.clientY, stage: 'tnt' }]);
      
      setTimeout(() => {
        setExplosions(prev => prev.map(exp => exp.id === id ? { ...exp, stage: 'boom' } : exp));
        
        setTimeout(() => {
          setExplosions(prev => prev.filter(exp => exp.id !== id));
        }, 800);
      }, 400);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [active, isHome]);

  if (!active || !isHome) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {explosions.map(exp => (
        <div key={exp.id} className="absolute" style={{ left: exp.x, top: exp.y }}>
          {exp.stage === 'tnt' ? (
            <div className="mc-tnt-block animate-mc-tnt-fuse" />
          ) : (
            <div className="relative">
              <div className="mc-explosion-flash" />
              <div className="mc-explosion-cloud" />
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-3 h-3 bg-[#555] animate-mc-explosion-particle"
                  style={{ 
                    '--dx': `${(Math.random() - 0.5) * 300}px`,
                    '--dy': `${(Math.random() - 0.5) * 300}px`,
                    animationDelay: `${Math.random() * 0.1}s`
                  } as any}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const SpecialGasterBlaster = ({ sourceX, sourceY, angle }: { key?: React.Key, sourceX: number, sourceY: number, angle: number }) => {
  return (
    <motion.div
      className="absolute z-[9999]"
      initial={{ left: sourceX, top: sourceY, scale: 0, rotate: angle, x: '-50%', y: '-50%' }}
      animate={{ scale: [0, 1, 2, 2, 2], opacity: [0, 1, 1, 1, 0] }}
      transition={{ duration: 9, times: [0, 0.05, 0.77, 0.95, 1] }}
      style={{ transformOrigin: 'center center' }}
    >
      <div className="relative z-10 w-[48px] h-[36px]">
        <svg width="48" height="36" viewBox="0 0 32 24" style={{ imageRendering: 'pixelated' }}>
          <path d="M6 2 h12 v2 h4 v2 h2 v4 h2 v6 h-2 v2 h-16 v-2 h-4 v-10 h2 v-2 h2 z" fill="white"/>
          <rect x="14" y="8" width="6" height="6" fill="black"/>
          <rect x="16" y="10" width="2" height="2" fill="cyan" className="animate-pulse"/>
          <rect x="22" y="14" width="2" height="2" fill="black"/>
          <path d="M8 18 h14 v2 h-14 z" fill="white"/>
          <path d="M10 20 h10 v2 h-10 z" fill="white"/>
        </svg>
      </div>
      
      {/* Rainbow Particles Absorbing */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
              left: '36px',
              top: '18px',
            }}
            initial={{ 
              x: (Math.random() - 0.5) * 200, 
              y: (Math.random() - 0.5) * 200, 
              opacity: 0 
            }}
            animate={{ 
              x: 0, 
              y: 0, 
              opacity: [0, 1, 0] 
            }}
            transition={{ 
              duration: 0.5 + Math.random() * 0.5, 
              repeat: 10,
              ease: "easeIn" 
            }}
          />
        ))}
      </div>

      {/* Rainbow Beam */}
      <motion.div 
        className="absolute top-1/2 left-[36px] -translate-y-1/2 origin-left z-0"
        style={{
          background: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
          boxShadow: '0 0 30px rgba(255,255,255,0.8), inset 0 0 15px white',
          borderRadius: '0 40px 40px 0',
          height: '40px'
        }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: [0, 3000, 3000, 0], opacity: [0, 1, 1, 0] }}
        transition={{ delay: 7, duration: 2, times: [0, 0.1, 0.8, 1] }}
      />
    </motion.div>
  );
};

const DeterminationSlash = ({ targetX, targetY }: { key?: React.Key, targetX: number, targetY: number }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Screen Flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0 bg-red-600"
      />

      {/* Central Heart */}
      <motion.div
        initial={{ scale: 0, x: '-50%', y: '-50%' }}
        animate={{ 
          scale: [0, 2, 1.8, 1.8, 0],
          opacity: [0, 1, 1, 1, 0],
          rotate: [0, 0, -5, 5, -5, 5, 0]
        }}
        transition={{ 
          duration: 2.5, 
          times: [0, 0.1, 0.4, 0.5, 0.6, 0.7, 1], 
          ease: "easeInOut" 
        }}
        className="absolute"
        style={{ left: targetX, top: targetY }}
      >
        <svg width="40" height="40" viewBox="0 0 32 32" style={{ imageRendering: 'pixelated', filter: 'drop-shadow(0 0 20px red)' }}>
          <path d="M16 28 L4 16 A8 8 0 0 1 16 6 A8 8 0 0 1 28 16 Z" fill="red" />
        </svg>
      </motion.div>

      {/* Slashes */}
      {[0, 45, -45].map((angle, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleX: 0, x: '-50%', y: '-50%', rotate: angle }}
          animate={{ 
            opacity: [0, 1, 0],
            scaleX: [0, 6, 8],
            scaleY: [1, 0.4, 0]
          }}
          transition={{ duration: 1.2, delay: i * 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute w-[300px] h-[30px] bg-gradient-to-r from-transparent via-red-500 to-transparent"
          style={{ left: targetX, top: targetY }}
        />
      ))}

      {/* Shatter Particles */}
      {[...Array(20)].map((_, i) => {
        const angle = (i * 360) / 20;
        const rad = (angle * Math.PI) / 180;
        const dist = 200 + Math.random() * 200;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: '-50%', y: '-50%', left: targetX, top: targetY }}
            animate={{ 
              opacity: [0, 1, 0],
              left: targetX + Math.cos(rad) * dist,
              top: targetY + Math.sin(rad) * dist,
              rotate: Math.random() * 1440
            }}
            transition={{ duration: 3.0, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
            className="absolute w-2 h-2 bg-red-600"
            style={{ imageRendering: 'pixelated' }}
          />
        );
      })}
    </div>
  );
};

const UltimateSansAttack = ({ targetX, targetY, onComplete }: { targetX: number, targetY: number, onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 35000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden flex items-center justify-center">
      {/* Responsive Scaling Container */}
      <div className="relative w-full h-full max-w-[100vw] max-h-[100dvh] flex items-center justify-center">
        {/* Background Flashes & Screen Shake */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0, 1, 0, 0.5, 0],
            backgroundColor: ["#000", "#000", "#000", "#000", "#000", "#000", "#000"]
          }}
          transition={{ duration: 2, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1] }}
          className="absolute inset-0 bg-black mix-blend-normal"
        />

        {/* Fight UI Overlay */}
        <motion.div 
          className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] flex flex-col gap-2 z-50"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: [0, 1, 1, 0], y: [50, 0, 0, 50] }}
          transition={{ delay: 1, duration: 33, times: [0, 0.05, 0.95, 1] }}
        >
          {/* HP Bar */}
          <div className="flex items-center gap-4 font-pixel text-white text-sm md:text-base">
            <span>SANS</span>
            <div className="flex-1 h-4 bg-red-600 relative">
              <motion.div 
                className="absolute left-0 top-0 h-full bg-yellow-400"
                animate={{ width: ['100%', '80%', '40%', '10%', '0%'] }}
                transition={{ delay: 2, duration: 30, ease: "linear" }}
              />
              <motion.div 
                className="absolute left-0 top-0 h-full bg-purple-500"
                animate={{ width: ['0%', '10%', '30%', '50%', '100%'] }}
                transition={{ delay: 5, duration: 25, ease: "linear" }}
                style={{ opacity: 0.5 }}
              />
            </div>
            <span>HP 1/1</span>
          </div>
          {/* Buttons */}
          <div className="flex justify-between gap-2">
            {['FIGHT', 'ACT', 'ITEM', 'MERCY'].map((btn) => (
              <div key={btn} className="flex-1 border-2 border-orange-400 p-1 text-center font-pixel text-orange-400 text-[10px] md:text-xs">
                {btn}
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Phase 1: Gaster Blaster Circle (0s - 5s) */}
        <motion.div
          className="absolute will-change-transform"
          style={{ left: targetX, top: targetY }}
          animate={{ 
            x: [-5, 5, -5, 5, 0], 
            y: [-5, 5, 5, -5, 0],
            scale: [0.9, 1, 0.9]
          }}
          transition={{ duration: 1, repeat: 5, ease: "linear" }}
        >
          {[...Array(8)].map((_, i) => {
            const angle = (i * 360) / 8;
            return (
              <motion.div
                key={`blaster-${i}`}
                className="absolute top-0 left-0"
                initial={{ scale: 0, rotate: angle, x: '-50%', y: '-50%' }}
                animate={{ 
                  scale: [0, 1.5, 1.5, 0],
                  rotate: [angle, angle + 45, angle + 45, angle]
                }}
                transition={{ duration: 4.5, times: [0, 0.1, 0.9, 1], delay: 0.2 }}
                style={{ transformOrigin: 'center center' }}
              >
                <div className="relative z-10 w-[30px] h-[22px] -translate-y-[15vmin]">
                  <svg width="30" height="22" viewBox="0 0 32 24" style={{ imageRendering: 'pixelated' }}>
                    <path d="M6 2 h12 v2 h4 v2 h2 v4 h2 v6 h-2 v2 h-16 v-2 h-4 v-10 h2 v-2 h2 z" fill="white"/>
                    <rect x="14" y="8" width="6" height="6" fill="black"/>
                    <motion.rect 
                      x="16" y="10" width="2" height="2" fill="cyan" 
                      animate={{ fill: ['#00ffff', '#ffffff', '#00ffff'] }}
                      transition={{ duration: 0.2, repeat: Infinity }}
                    />
                    <rect x="22" y="14" width="2" height="2" fill="black"/>
                    <path d="M8 18 h14 v2 h-14 z" fill="white"/>
                    <path d="M10 20 h10 v2 h-10 z" fill="white"/>
                  </svg>
                  <motion.div 
                    className="absolute top-full left-1/2 -translate-x-1/2 origin-top z-0 w-[15px] h-[150vmin]"
                    style={{
                      background: 'linear-gradient(180deg, #ffffff, #00ffff, #0000ff)',
                      boxShadow: '0 0 20px #00ffff, inset 0 0 10px white',
                    }}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                    transition={{ delay: 1.2, duration: 3.0, times: [0, 0.1, 0.8, 1] }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Phase 2: Horizontal Bone Slides (5s - 10s) */}
        <motion.div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`h-bone-${i}`}
              className="absolute bg-white h-2 rounded-full shadow-[0_0_6px_white]"
              style={{ 
                width: '100px', 
                left: i % 2 === 0 ? '-120px' : '110%',
                top: `${10 + i * 7}%`
              }}
              initial={{ x: 0, opacity: 0 }}
              animate={{ 
                x: i % 2 === 0 ? '120vw' : '-120vw',
                opacity: [0, 1, 1, 0]
              }}
              transition={{ delay: 5 + (i * 0.3), duration: 2.0, ease: "linear" }}
            >
              <div className="absolute top-0 left-0 w-3 h-5 bg-white rounded-full -translate-y-1.5" />
              <div className="absolute bottom-0 left-0 w-3 h-5 bg-white rounded-full translate-y-1.5" />
            </motion.div>
          ))}
        </motion.div>

        {/* Phase 3: Blue Soul Gravity & Walls (10s - 15s) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay: 10, duration: 5, times: [0, 0.1, 0.9, 1] }}
        >
          <motion.div
            className="relative z-50"
            animate={{ 
              y: [0, 200, -200, 200, -200, 0],
              x: [0, -100, 100, -100, 100, 0],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ delay: 10.5, duration: 4, ease: "easeInOut" }}
          >
            <Heart className="w-8 h-8 text-cyan-400 fill-cyan-400 shadow-[0_0_15px_cyan]" />
            <motion.div 
              className="absolute -top-6 left-1/2 -translate-x-1/2 font-pixel text-white text-[10px]"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: 11, duration: 0.8, repeat: 4 }}
            >
              MISS
            </motion.div>
          </motion.div>

          {/* Dynamic Bone Walls */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`bone-slam-${i}`}
              className="absolute bg-white w-3 h-32 rounded-t-full"
              style={{ bottom: 0, left: `${i * 10}%` }}
              initial={{ y: '100%' }}
              animate={{ y: ['100%', '0%', '100%'] }}
              transition={{ delay: 11 + (i * 0.1), duration: 1.0, repeat: 3 }}
            />
          ))}
        </motion.div>

        {/* Phase 4: Mega Blaster (15s - 20s) */}
        <motion.div
          className="absolute left-1/2 top-0 -translate-x-1/2"
          initial={{ scale: 0, y: -200 }}
          animate={{ scale: [0, 2.5, 2.5, 0], y: [-200, 30, 30, -200] }}
          transition={{ delay: 15, duration: 5, times: [0, 0.1, 0.9, 1] }}
        >
          <svg width="40" height="30" viewBox="0 0 32 24" className="fill-white drop-shadow-[0_0_12px_cyan]">
            <path d="M6 2 h12 v2 h4 v2 h2 v4 h2 v6 h-2 v2 h-16 v-2 h-4 v-10 h2 v-2 h2 z" />
          </svg>
          <motion.div 
            className="absolute top-full left-1/2 -translate-x-1/2 w-16 h-[100vh] bg-cyan-300 origin-top"
            style={{ boxShadow: '0 0 60px #00ffff' }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 1, 0] }}
            transition={{ delay: 16.5, duration: 3 }}
          />
        </motion.div>

        {/* Phase 5: Screen Flip & Gravity Chaos (20s - 25s) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            rotate: [0, 180, 180, 360, 360, 0],
            scale: [1, 1.2, 1, 1.2, 1]
          }}
          transition={{ delay: 20, duration: 5, ease: "easeInOut" }}
        >
          <motion.div
            className="font-pixel text-cyan-400 text-2xl"
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            transition={{ delay: 20, duration: 5 }}
          >
            GRAVITY CONTROL
          </motion.div>
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`grav-bone-${i}`}
              className="absolute bg-white w-2 h-20 rounded-full"
              style={{ 
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                rotate: Math.random() * 360
              }}
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 1, 1, 0],
                x: [0, (Math.random() - 0.5) * 500],
                y: [0, (Math.random() - 0.5) * 500]
              }}
              transition={{ delay: 20 + (i * 0.2), duration: 2 }}
            />
          ))}
        </motion.div>

        {/* Phase 6: Gaster Blaster Spiral (25s - 30s) */}
        <motion.div className="absolute inset-0 flex items-center justify-center">
          {[...Array(12)].map((_, i) => {
            const angle = (i * 360) / 12;
            return (
              <motion.div
                key={`spiral-blaster-${i}`}
                className="absolute"
                initial={{ scale: 0, rotate: angle }}
                animate={{ 
                  scale: [0, 1.2, 1.2, 0],
                  rotate: [angle, angle + 720]
                }}
                transition={{ delay: 25 + (i * 0.2), duration: 4 }}
              >
                <div className="w-[20px] h-[15px] -translate-y-[25vmin] bg-white rounded-sm" />
                <motion.div 
                  className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-[100vmin] bg-cyan-400 origin-top"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: [0, 1, 0] }}
                  transition={{ delay: 26 + (i * 0.2), duration: 0.8 }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Phase 7: Final Chaos & Dunk (30s - 35s) */}
        <motion.div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={`chaos-v4-${i}`}
              className="absolute"
              style={{ 
                top: `${Math.random() * 80 + 10}%`, 
                left: `${Math.random() * 80 + 10}%`,
                rotate: Math.random() * 360
              }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 0] }}
              transition={{ delay: 30 + (i * 0.15), duration: 1.2 }}
            >
              <svg width="15" height="12" viewBox="0 0 32 24" className="fill-white">
                <path d="M6 2 h12 v2 h4 v2 h2 v4 h2 v6 h-2 v2 h-16 v-2 h-4 v-10 h2 v-2 h2 z" />
              </svg>
              <motion.div 
                className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-[120vh] bg-cyan-400 origin-top"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: [0, 1, 0] }}
                transition={{ delay: 30.3 + (i * 0.15), duration: 0.4 }}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ backgroundColor: "rgba(0,0,0,0)" }}
          animate={{ backgroundColor: ["rgba(0,0,0,0)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0)"] }}
          transition={{ delay: 32, duration: 3, times: [0, 0.1, 0.9, 1] }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2, 1.5, 0], opacity: [0, 1, 1, 0] }}
            transition={{ delay: 32, duration: 3 }}
            className="font-pixel text-3xl md:text-6xl text-white drop-shadow-[0_0_20px_cyan] text-center px-4"
            style={{ textShadow: '3px 3px 0px #000, -3px -3px 0px #00ffff' }}
          >
            GET DUNKED ON
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const UltimateCharaAttack = ({ targetX, targetY, onComplete }: { targetX: number, targetY: number, onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 35000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden flex items-center justify-center bg-black/95">
      {/* Responsive Scaling Container */}
      <div className="relative w-full h-full max-w-[100vw] max-h-[100dvh] flex items-center justify-center">
        {/* Background Glitch Effect */}
        <motion.div
          className="absolute inset-0 bg-red-900/10"
          animate={{ opacity: [0, 0.4, 0, 0.6, 0] }}
          transition={{ duration: 0.15, repeat: 230 }}
        />

        {/* Fight UI Overlay (Broken) */}
        <motion.div 
          className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] flex flex-col gap-2 z-50"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: [0, 1, 1, 0], y: [50, 0, 0, 50] }}
          transition={{ delay: 1, duration: 33, times: [0, 0.05, 0.95, 1] }}
        >
          {/* HP Bar */}
          <div className="flex items-center gap-4 font-pixel text-red-600 text-sm md:text-base">
            <span>CHARA</span>
            <div className="flex-1 h-4 bg-red-950 relative border border-red-600">
              <motion.div 
                className="absolute left-0 top-0 h-full bg-red-600"
                animate={{ width: ['100%', '99%', '100%', '99%', '100%'] }}
                transition={{ duration: 0.1, repeat: Infinity }}
              />
            </div>
            <span>HP 99/99</span>
          </div>
          {/* Buttons (Red/Broken) */}
          <div className="flex justify-between gap-2">
            {['FIGHT', 'ACT', 'ITEM', 'MERCY'].map((btn) => (
              <div key={btn} className="flex-1 border-2 border-red-600 p-1 text-center font-pixel text-red-600 text-[10px] md:text-xs bg-red-900/20">
                {btn}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Phase 1: Giant Slashes (0s - 5s) */}
        <motion.div
          className="absolute will-change-transform"
          style={{ left: targetX, top: targetY }}
          animate={{ x: [-20, 20, -20, 20, 0], y: [-20, 20, 20, -20, 0] }}
          transition={{ duration: 0.3, repeat: 16 }}
        >
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`slash-v4-${i}`}
              initial={{ opacity: 0, scaleX: 0, rotate: i * 36, x: '-50%', y: '-50%' }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scaleX: [0, 10, 10, 0],
                scaleY: [1, 4, 0.1]
              }}
              transition={{ duration: 3, delay: i * 0.2, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-[10vmin] h-[20px] bg-red-600 shadow-[0_0_30px_red] origin-center"
            />
          ))}
        </motion.div>

        {/* Phase 2: Spinning Knife Circle (5s - 10s) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay: 5, duration: 5, times: [0, 0.1, 0.9, 1] }}
        >
          {[...Array(12)].map((_, i) => {
            const angle = (i * 360) / 12;
            return (
              <motion.div
                key={`spin-knife-v2-${i}`}
                className="absolute"
                initial={{ rotate: angle, x: 0, y: 0 }}
                animate={{ 
                  rotate: [angle, angle + 1080],
                  x: [Math.cos(angle) * 300, 0, Math.cos(angle) * 300],
                  y: [Math.sin(angle) * 300, 0, Math.sin(angle) * 300]
                }}
                transition={{ delay: 5.5, duration: 4, ease: "easeInOut" }}
              >
                <div className="w-4 h-16 bg-white rounded-t-full shadow-[0_0_10px_red]" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Phase 3: Vertical Knife Rain (10s - 15s) */}
        <motion.div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`rain-knife-v2-${i}`}
              className="absolute"
              style={{ left: `${(i * 3.3)}%`, top: i % 2 === 0 ? '-100px' : '110%' }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ 
                y: i % 2 === 0 ? '120vh' : '-120vh',
                opacity: [0, 1, 1, 0]
              }}
              transition={{ delay: 10 + (i * 0.1), duration: 0.8, ease: "linear" }}
            >
              <div className="w-3 h-12 bg-white rounded-t-full shadow-[0_0_8px_red]" />
              <div className="w-3 h-3 bg-red-900 -mt-1" />
            </motion.div>
          ))}
        </motion.div>

        {/* Phase 4: Cross Slashes & Red Void (15s - 20s) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[45, -45, 0, 90].map((angle, i) => (
            <motion.div
              key={`cross-v2-${i}`}
              className="absolute w-full h-16 bg-red-600 shadow-[0_0_60px_red]"
              initial={{ scaleX: 0, opacity: 0, rotate: angle }}
              animate={{ scaleX: [0, 1.5, 1.5, 0], opacity: [0, 1, 1, 0] }}
              transition={{ delay: 15 + (i * 0.3), duration: 3 }}
            />
          ))}
          <motion.div
            className="absolute inset-0 bg-red-600/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 16, duration: 4 }}
          />
        </div>

        {/* Phase 5: Knife Barrage from Sides (20s - 25s) */}
        <motion.div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`side-knife-${i}`}
              className="absolute"
              style={{ 
                top: `${(i * 5)}%`, 
                left: i % 2 === 0 ? '-100px' : '110%',
                rotate: i % 2 === 0 ? 90 : -90
              }}
              initial={{ x: 0, opacity: 0 }}
              animate={{ 
                x: i % 2 === 0 ? '120vw' : '-120vw',
                opacity: [0, 1, 1, 0]
              }}
              transition={{ delay: 20 + (i * 0.15), duration: 0.6, ease: "linear" }}
            >
              <div className="w-4 h-16 bg-white rounded-t-full shadow-[0_0_10px_red]" />
            </motion.div>
          ))}
        </motion.div>

        {/* Phase 6: Shattering Heart & Glitch (25s - 30s) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 2.5, 2.5, 0],
              opacity: [0, 1, 1, 0],
              rotate: [0, 0, 15, -15, 0],
              x: [0, 5, -5, 5, 0]
            }}
            transition={{ delay: 25, duration: 5, times: [0, 0.2, 0.8, 1] }}
            className="relative z-50"
          >
            <Heart className="w-20 h-20 text-red-600 fill-red-600 shadow-[0_0_40px_red]" />
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`shatter-v2-${i}`}
                className="absolute top-1/2 left-1/2 w-32 h-1 bg-white"
                style={{ rotate: i * 30, x: '-50%', y: '-50%' }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: [0, 1.5], opacity: [0, 1, 0] }}
                transition={{ delay: 28 + (i * 0.08), duration: 0.4 }}
              />
            ))}
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-red-900/40"
            animate={{ opacity: [0, 0.8, 0, 0.8, 0] }}
            transition={{ delay: 25, duration: 0.1, repeat: 50 }}
          />
        </div>

        {/* Phase 7: The Void & ERASED (30s - 35s) */}
        <motion.div
          className="absolute inset-0 bg-red-950/40 mix-blend-color-burn"
          animate={{ opacity: [0, 1, 0, 1, 0] }}
          transition={{ delay: 30, duration: 0.3, repeat: 16 }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ delay: 28, duration: 3 }}
            className="absolute font-pixel text-red-600 text-xl md:text-3xl"
          >
            But nobody came.
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [2, 1, 1, 0.2] }}
            transition={{ delay: 31, duration: 4 }}
            className="font-pixel text-4xl md:text-7xl text-white tracking-[0.4em] text-center px-4"
            style={{ textShadow: '0 0 30px red' }}
          >
            ERASED.
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: [0, 1, 1, 0], y: [100, -200] }}
            transition={{ delay: 32, duration: 3 }}
            className="absolute font-pixel text-red-600 text-3xl md:text-5xl"
          >
            -999999999999
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], y: -400 }}
          transition={{ delay: 27, duration: 4 }}
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 font-pixel text-6xl md:text-8xl text-red-600"
        >
          -9999999999999999
        </motion.div>
        
        <motion.div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 font-pixel text-white text-sm md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 25, duration: 3 }}
        >
          But nobody came.
        </motion.div>
      </div>
    </div>
  );
};

const UndertaleClickEffect = ({ active, isHome, accentColor }: { active: boolean; isHome: boolean; accentColor: string }) => {
  const [blasters, setBlasters] = useState<{ id: number; targetX: number; targetY: number; sourceX: number; sourceY: number; angle: number; isSpecial?: boolean }[]>([]);
  const [knives, setKnives] = useState<{ id: number; targetX: number; targetY: number; sourceX: number; sourceY: number; angle: number; isSpecial?: boolean }[]>([]);
  const [ultimateSans, setUltimateSans] = useState<{ id: number; x: number; y: number } | null>(null);
  const [ultimateChara, setUltimateChara] = useState<{ id: number; x: number; y: number } | null>(null);
  const clickCountRef = useRef(0);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const isChara = accentColor === 'undertale-red';

  useEffect(() => {
    if (!active || !isHome) {
      setBlasters([]);
      setKnives([]);
      setUltimateSans(null);
      setUltimateChara(null);
      return;
    }

    const handlePointerDown = (e: PointerEvent) => {
      if (!isHome) return;
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea, .brutal-modal, .glass')) {
        return;
      }
      
      isLongPressRef.current = false;
      startPosRef.current = { x: e.clientX, y: e.clientY };
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      
      pressTimerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        if (isChara) {
          setUltimateChara({ id: Date.now(), x: e.clientX, y: e.clientY });
        } else {
          setUltimateSans({ id: Date.now(), x: e.clientX, y: e.clientY });
        }
      }, 1000);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isHome) return;
      
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }

      if (isLongPressRef.current) {
        isLongPressRef.current = false;
        return;
      }

      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea, .brutal-modal, .glass')) {
        return;
      }

      clickCountRef.current += 1;
      const isSpecial = clickCountRef.current % 50 === 0;
      
      const id = Date.now();
      const targetX = e.clientX;
      const targetY = e.clientY;
      
      const theta = Math.random() * Math.PI * 2;
      const distance = isChara ? 300 + Math.random() * 200 : 80 + Math.random() * 60;
      const sourceX = targetX + Math.cos(theta) * distance;
      const sourceY = targetY + Math.sin(theta) * distance;
      
      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      if (isChara) {
        setKnives(prev => [...prev, { id, targetX, targetY, sourceX, sourceY, angle, isSpecial }]);
        setTimeout(() => {
          setKnives(prev => prev.filter(k => k.id !== id));
        }, isSpecial ? 5000 : 600);
      } else {
        setBlasters(prev => [...prev, { id, targetX, targetY, sourceX, sourceY, angle, isSpecial }]);
        setTimeout(() => {
          setBlasters(prev => prev.filter(b => b.id !== id));
        }, isSpecial ? 9000 : 1000);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (pressTimerRef.current) {
        const dist = Math.sqrt(Math.pow(e.clientX - startPosRef.current.x, 2) + Math.pow(e.clientY - startPosRef.current.y, 2));
        if (dist > 15) {
          clearTimeout(pressTimerRef.current);
          pressTimerRef.current = null;
        }
      }
    };

    const handlePointerCancel = () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (isLongPressRef.current) {
        e.preventDefault();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('pointerleave', handlePointerCancel);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('pointerleave', handlePointerCancel);
      window.removeEventListener('contextmenu', handleContextMenu);
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    };
  }, [active, isHome, isChara]);

  if (!active || !isHome) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {ultimateSans && (
        <UltimateSansAttack 
          targetX={ultimateSans.x} 
          targetY={ultimateSans.y} 
          onComplete={() => setUltimateSans(null)} 
        />
      )}
      {ultimateChara && (
        <UltimateCharaAttack 
          targetX={ultimateChara.x} 
          targetY={ultimateChara.y} 
          onComplete={() => setUltimateChara(null)} 
        />
      )}
      {blasters.map(b => b.isSpecial ? (
        <SpecialGasterBlaster key={b.id} sourceX={b.sourceX} sourceY={b.sourceY} angle={b.angle} />
      ) : (
        <div
          key={b.id}
          className="gaster-blaster-container"
          style={{
            left: b.sourceX,
            top: b.sourceY,
            transform: `translate(-50%, -50%) rotate(${b.angle}deg)`,
          }}
        >
          <div className="gaster-blaster-skull">
            <svg width="48" height="36" viewBox="0 0 32 24" style={{ imageRendering: 'pixelated' }}>
              <path d="M6 2 h12 v2 h4 v2 h2 v4 h2 v6 h-2 v2 h-16 v-2 h-4 v-10 h2 v-2 h2 z" fill="white"/>
              <rect x="14" y="8" width="6" height="6" fill="black"/>
              <rect x="16" y="10" width="2" height="2" fill="cyan" className="gb-eye-glow"/>
              <rect x="22" y="14" width="2" height="2" fill="black"/>
              <path d="M8 18 h14 v2 h-14 z" fill="white" className="gb-jaw"/>
              <path d="M10 20 h10 v2 h-10 z" fill="white" className="gb-jaw"/>
            </svg>
          </div>
          <div className="gaster-blaster-beam" />
        </div>
      ))}
      {knives.map(k => k.isSpecial ? (
        <DeterminationSlash key={k.id} targetX={k.targetX} targetY={k.targetY} />
      ) : (
        <div
          key={k.id}
          className="chara-knife-container"
          style={{
            left: k.sourceX,
            top: k.sourceY,
            '--target-x': `${k.targetX - k.sourceX}px`,
            '--target-y': `${k.targetY - k.sourceY}px`,
          } as any}
        >
          <div style={{ transform: `rotate(${k.angle + 45}deg)` }}>
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
              <path d="M28 2 h-4 v2 h-2 v2 h-2 v2 h-2 v2 h-2 v2 h-2 v2 h-2 v2 h-2 v2 h-2 v2 h-2 v2 h-2 v2 h-2 v2 h2 v2 h2 v-2 h2 v-2 h2 v-2 h2 v-2 h2 v-2 h2 v-2 h2 v-2 h2 v-2 h2 v-2 h2 v-2 h2 v-2 h2 v-2 h2 v-2 h2 v-2 z" fill="#ff0000"/>
              <path d="M24 2 h4 v4 h-4 z" fill="#aa0000"/>
              <path d="M22 4 h2 v2 h-2 z M20 6 h2 v2 h-2 z M18 8 h2 v2 h-2 z M16 10 h2 v2 h-2 z M14 12 h2 v2 h-2 z M12 14 h2 v2 h-2 z M10 16 h2 v2 h-2 z M8 18 h2 v2 h-2 z M6 20 h2 v2 h-2 z" fill="#ffaaaa"/>
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

const HighlightedText = ({ text, usedTerms, misspelledWords = [] }: { text: string; usedTerms: string[]; misspelledWords?: string[] }) => {
  const usedTermsArray = Array.from(new Set(usedTerms));
  const misspelledSet = new Set(misspelledWords.map(w => w.toLowerCase()));
  
  // Split by words but preserve everything else
  const parts = text.split(/(\s+|[.,\/#!$%\^&\*;:{}=\-_`~()])/);
  
  return (
    <div className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (!part) return null;
        
        // Check if it's a word
        const cleanPart = part.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
        if (cleanPart && cleanPart.length >= 3) {
          const stemmed = stem(cleanPart);
          const isKeywordMatch = !STOP_WORDS.has(cleanPart) && usedTermsArray.some(term => isFuzzyMatch(stemmed, term));
          
          if (isKeywordMatch) {
            return (
              <span key={i} className="bg-emerald-100 text-emerald-800 px-0.5 rounded-sm font-bold border-b-2 border-emerald-400">
                {part}
              </span>
            );
          }
          
          if (misspelledSet.has(cleanPart)) {
            return (
              <span key={i} className="bg-amber-100 text-amber-800 px-0.5 rounded-sm font-bold border-b-2 border-amber-400" title="Misspelled word">
                {part}
              </span>
            );
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

const Term = ({ title, children, active, onClick }: { title?: string, children: React.ReactNode, active: boolean, onClick: (title: string, word: string) => void }) => {
  const textContent = React.useMemo(() => {
    const extractText = (node: any): string => {
      if (typeof node === 'string') return node;
      if (typeof node === 'number') return String(node);
      if (Array.isArray(node)) return node.map(extractText).join('');
      if (React.isValidElement(node)) return extractText((node as React.ReactElement<any>).props.children);
      return '';
    };
    return extractText(children);
  }, [children]);

  if (!title) return <>{children}</>;
  
  return (
    <span 
      onClick={(e) => {
        if (!active) return;
        e.stopPropagation();
        onClick(title, textContent);
      }}
      className={`
        inline relative transition-[color,filter,text-decoration-color] duration-200
        ${active 
          ? 'text-indigo-600 dark:text-indigo-400 font-black underline decoration-indigo-300 dark:decoration-indigo-700 decoration-2 underline-offset-4 cursor-help hover:text-indigo-500 hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.4)] [.visual-liquid-glass_&]:text-white [.visual-liquid-glass_&]:decoration-white/60 [.visual-liquid-glass_&]:hover:text-white [.visual-liquid-glass_&]:hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' 
          : 'text-inherit font-black cursor-default [.visual-liquid-glass_&]:text-white/90'
        }
        /* Undertale style overrides */
        ${active ? '[.visual-undertale_&]:font-pixel [.visual-undertale_&]:text-white [.visual-undertale_&]:no-underline [.visual-undertale_&]:font-normal [.visual-undertale_&]:border-b-2 [.visual-undertale_&]:border-white [.visual-undertale_&]:hover:text-yellow-400 [.visual-undertale_&]:hover:border-yellow-400 [.visual-undertale_&]:hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : '[.visual-undertale_&]:font-pixel [.visual-undertale_&]:font-normal'}
        /* Brutalist style overrides */
        ${active ? '[.visual-brutalist_&]:bg-black [.visual-brutalist_&]:text-white [.dark.visual-brutalist_&]:bg-white [.dark.visual-brutalist_&]:text-black [.visual-brutalist_&]:px-1 [.visual-brutalist_&]:no-underline [.visual-brutalist_&]:hover:bg-[var(--accent-color)] [.visual-brutalist_&]:hover:text-white' : ''}
        /* Ultimate style overrides */
        ${active ? '[.visual-ultimate_&]:ultimate-term' : ''}
      `}
    >
      {children}
      {active && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse [.visual-undertale_&]:hidden [.visual-brutalist_&]:hidden" />}
    </span>
  );
};

const SCRAMBLE_CHARS = '<>-_\\/[]{}—=+*^?#________';
const GLITCH_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const GlitchText = React.memo(({ text, active }: { text: string, active: boolean }) => {
  const [glitchedText, setGlitchedText] = useState(text);
  const [color, setColor] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (!active) {
      setGlitchedText(text);
      setColor(undefined);
      return;
    }
    
    const interval = setInterval(() => {
      const chars = text.split('');
      const glitched = chars.map(c => {
        if (c === ' ') return ' ';
        if (Math.random() > 0.85) {
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        return c;
      }).join('');
      setGlitchedText(glitched);
      setColor(GLITCH_COLORS[Math.floor(Math.random() * GLITCH_COLORS.length)]);
    }, 150);
    
    return () => clearInterval(interval);
  }, [text, active]);
  
  return <span style={{ color }}>{glitchedText}</span>;
});

const AnimatedText = React.memo(({ children, className = "", theme, style = {}, isGlitchActive = false }: { children: React.ReactNode; className?: string; theme: AppTheme; style?: React.CSSProperties; isGlitchActive?: boolean }) => {
  const isBrutalist = theme.visualStyle === 'brutalist';
  const isUndertale = theme.visualStyle === 'undertale';

  const content = typeof children === 'string' && isGlitchActive ? (
    <GlitchText text={children} active={true} />
  ) : children;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: isBrutalist ? 0.2 : 0.5, 
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={`inline-block ${className} ${(theme.visualStyle === 'virus' || theme.visualStyle === 'arcane') ? getArcaneStyles(theme.accentColor).markdown : ''}`}
      style={style}
    >
      {typeof content === 'string' ? (
        <ReactMarkdown 
          components={{ 
            p: ({children}) => <>{animateChildren(children, theme)}</>,
            strong: ({node, children, ...props}: any) => <strong className={`font-black underline decoration-2 underline-offset-2 ${isUndertale ? 'text-white no-underline font-normal' : isBrutalist ? 'bg-black text-white dark:bg-white dark:text-black px-1 no-underline' : theme.visualStyle === 'ultimate' ? '' : (theme.visualStyle === 'virus' || theme.visualStyle === 'arcane') ? 'text-[var(--accent-color)] decoration-[var(--accent-color)]/50' : 'text-indigo-700 dark:text-indigo-400 decoration-indigo-200 dark:decoration-indigo-800'}`} {...props}>{animateChildren(children, theme)}</strong>,
            em: ({node, children, ...props}: any) => <em className={`font-medium italic ${isUndertale ? 'text-white not-italic font-normal' : isBrutalist ? 'not-italic uppercase tracking-widest text-xs border-b-2 border-black dark:border-white' : theme.visualStyle === 'ultimate' ? '' : (theme.visualStyle === 'virus' || theme.visualStyle === 'arcane') ? 'text-slate-300 dark:text-slate-500 italic' : 'text-slate-600 dark:text-slate-400'}`} {...props}>{animateChildren(children, theme)}</em>,
            mark: ({node, children, ...props}: any) => <mark className={`px-2 py-0.5 rounded-lg font-black shadow-sm inline-block mx-0.5 ${isUndertale ? 'bg-white text-black rounded-none font-normal' : isBrutalist ? 'bg-[var(--accent-color)] text-white border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]' : theme.visualStyle === 'ultimate' ? '' : (theme.visualStyle === 'virus' || theme.visualStyle === 'arcane') ? 'bg-black/20 dark:bg-black/40 text-[var(--accent-color)] border border-[var(--accent-color)]/30' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-b-2 border-amber-400 dark:border-amber-600'}`} {...props}>{animateChildren(children, theme)}</mark>,
            term: ({children}: any) => <>{animateChildren(children, theme)}</>,
          } as any}
          remarkPlugins={REMARK_PLUGINS}
          rehypePlugins={REHYPE_PLUGINS}
        >
          {content}
        </ReactMarkdown>
      ) : (
        content
      )}
    </motion.div>
  );
});













const ButterflyDesign = () => (
  <div className="relative w-10 h-10 flex items-center justify-center drop-shadow-[0_0_12px_rgba(253,224,71,0.8)]">
    <motion.svg 
      viewBox="0 0 100 100" 
      className="w-full h-full fill-yellow-300 stroke-yellow-100 stroke-[1.5]"
      animate={{ scaleX: [1, 0.1, 1] }}
      transition={{ duration: 0.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M50,20 C40,0 0,10 10,40 C15,55 35,50 45,60 C35,70 10,80 20,95 C30,105 45,80 50,70 C55,80 70,105 80,95 C90,80 65,70 55,60 C65,50 85,55 90,40 C100,10 60,0 50,20 Z" />
    </motion.svg>
  </div>
);

const TadcClickEffect = ({ active, isHome, accentColor }: { active: boolean; isHome: boolean; accentColor: string }) => {
  const [butterflies, setButterflies] = useState<{ id: number; x: number; y: number; targetX: number; targetY: number }[]>([]);
  const [stickers, setStickers] = useState<{ id: number; x: number; y: number; rotation: number }[]>([]);
  
  const isKinger = accentColor === 'tadc-kinger';
  const isCaine = accentColor === 'tadc-caine';

  useEffect(() => {
    if (!active || !isHome) return;

    const handleClick = (e: MouseEvent) => {
      // Don't trigger if clicking on interactive elements
      if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;

      const id = Date.now() + Math.random();
      
      if (isKinger) {
        // Fly in different directions (360 degrees)
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 80;
        const targetX = e.clientX + Math.cos(angle) * distance;
        const targetY = e.clientY + Math.sin(angle) * distance;
        
        setButterflies(prev => [...prev, { id, x: e.clientX, y: e.clientY, targetX, targetY }]);
        
        setTimeout(() => {
          setButterflies(prev => prev.filter(b => b.id !== id));
        }, 1500); // 1.5 seconds total
      } else if (isCaine) {
        const rotation = (Math.random() - 0.5) * 20;
        
        setStickers(prev => [...prev, { id, x: e.clientX, y: e.clientY, rotation }]);
        
        setTimeout(() => {
          setStickers(prev => prev.filter(s => s.id !== id));
        }, 1200); // Disappear after 1.2s
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [active, isHome, isKinger, isCaine]);

  if (!active || !isHome) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {butterflies.map(b => (
          <motion.div
            key={b.id}
            initial={{ x: b.x, y: b.y, opacity: 0, scale: 0.5 }}
            animate={{ 
              x: [b.x, b.targetX, b.targetX], 
              y: [b.y, b.targetY, b.targetY], 
              opacity: [0, 1, 1, 0], 
              scale: [0.5, 1, 1, 0.8] 
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeOut",
              x: { duration: 1.5, times: [0, 0.6, 1] },
              y: { duration: 1.5, times: [0, 0.6, 1] },
              opacity: { duration: 1.5, times: [0, 0.2, 0.6, 1] },
              scale: { duration: 1.5, times: [0, 0.2, 0.6, 1] }
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform"
          >
            <motion.div 
              animate={{ 
                y: [-10, 10, -10], 
                x: [-10, 10, -10], 
                rotate: [-5, 5, -5] 
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ButterflyDesign />
            </motion.div>
          </motion.div>
        ))}
        
        {stickers.map(s => (
          <motion.div
            key={s.id}
            initial={{ x: s.x, y: s.y, opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
          >
            <motion.img 
              animate={{ rotate: [s.rotation - 15, s.rotation + 15, s.rotation - 15] }}
              transition={{ duration: 0.15, repeat: Infinity, ease: "linear" }}
              src="https://image2url.com/r2/default/images/1775004195360-415d8907-e4b9-4c60-99e1-7e5324847539.png" 
              alt="Censored" 
              className="w-32 h-auto drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const DuckClickEffect = ({ active, isHome }: { active: boolean; isHome: boolean }) => {
  const [ducks, setDucks] = useState<{ id: number; x: number; y: number; image: string }[]>([]);
  
  const sounds = [
    'https://image2url.com/r2/default/audio/1775006570564-05be7dd2-67c9-4a2c-93a1-fa848c025510.mp3',
    'https://image2url.com/r2/default/audio/1775006595189-892a74dd-2482-4dcc-aa8d-0aa29dbad07e.mp3',
    'https://image2url.com/r2/default/audio/1775006608366-6796376f-879a-4509-b5dc-7b2d39b868f6.mp3'
  ];

  const images = [
    'https://image2url.com/r2/default/images/1775006467588-3cdd1dcf-2f55-4e49-9e93-c1a5397ff2ce.webp',
    'https://image2url.com/r2/default/images/1775007293578-0c0e0a24-81cb-4a04-b57b-c56a5f643b5f.webp',
    'https://image2url.com/r2/default/images/1775007276111-950050f5-278a-41ec-b4e6-4596755ee09d.webp',
    'https://image2url.com/r2/default/images/1775007258881-1ebccb0e-9c97-4c1e-a2d7-688ac1c36222.webp'
  ];

  useEffect(() => {
    if (!active || !isHome) return;

    const handleClick = (e: MouseEvent) => {
      // Don't trigger if clicking on interactive elements
      if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;

      const id = Date.now() + Math.random();
      const randomImage = images[Math.floor(Math.random() * images.length)];
      
      setDucks(prev => [...prev, { id, x: e.clientX, y: e.clientY, image: randomImage }]);
      
      // Play sound
      const audio = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Audio play failed:", e));
      
      setTimeout(() => {
        setDucks(prev => prev.filter(d => d.id !== id));
      }, 600); // Disappear quickly
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [active, isHome]);

  if (!active || !isHome) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {ducks.map(d => (
          <motion.div
            key={d.id}
            initial={{ x: d.x, y: d.y, opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, y: d.y - 20 }}
            exit={{ opacity: 0, scale: 0.5, y: d.y - 40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
          >
            <motion.img 
              animate={{ rotate: [-15, 15, -15], y: [0, -5, 0] }}
              transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
              src={d.image || undefined} 
              alt="Duck" 
              className="w-16 h-auto drop-shadow-lg"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const ArcaneCanvas = ({ accentColor, isDark, isHome, uiCustomization }: { accentColor: AccentColor, isDark: boolean, isHome: boolean, uiCustomization?: UICustomization }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const mouseRef = React.useRef({ x: -1000, y: -1000 });
  const shockwavesRef = React.useRef<any[]>([]);
  const nextWaveTypeRef = React.useRef<'push' | 'pull'>('push');
  const isHomeRef = React.useRef(isHome);
  const uiCustomizationRef = React.useRef(uiCustomization);
  const clickCountRef = React.useRef(0);
  const longPressTimeoutRef = React.useRef<any>(null);
  const mousedownTimeRef = React.useRef<number>(0);
  const mousedownPosRef = React.useRef({ x: 0, y: 0 });
  const isMouseDownRef = React.useRef(false);
  const specialEffectRef = React.useRef<{
    active: boolean;
    x: number;
    y: number;
    startTime: number;
    phase: 'pull' | 'push' | 'done';
    duration: number;
    type?: string;
  }>({ active: false, x: 0, y: 0, startTime: 0, phase: 'done', duration: 0 });

  React.useEffect(() => {
    isHomeRef.current = isHome;
  }, [isHome]);

  React.useEffect(() => {
    uiCustomizationRef.current = uiCustomization;
  }, [uiCustomization]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      pulse: number;
      pulseSpeed: number;
      targetX: number;
      targetY: number;
      ease: number;
      angle: number;
      rotationSpeed?: number;
      type?: string;
    }

    let nodes: Node[] = [];
    const baseNodeCount = accentColor === 'arcane-red' ? 75 : (accentColor === 'arcane-blue' ? 105 : (accentColor === 'arcane-gold' ? 60 : (accentColor === 'arcane-neon-pink' ? 120 : (accentColor === 'arcane-plasma-cyan' ? 100 : (accentColor === 'arcane-void-purple' ? 60 : (accentColor === 'arcane-solar-flare' ? 80 : 90))))));
    let nodeCount = uiCustomizationRef.current?.particleCount ?? baseNodeCount;
    
    if (uiCustomizationRef.current?.optimizationMode) {
      nodeCount = Math.min(nodeCount, 30);
    }

    const getArcaneColor = (color: string, type: 'glow' | 'base' | 'shock' | 'particle' = 'glow') => {
      const isDark = isDarkRef.current;
      switch (color) {
        case 'arcane-red':
          if (type === 'base') return '#991b1b';
          if (type === 'shock') return '#ff0000';
          if (type === 'particle') return isDark ? '#ef4444' : '#b91c1c';
          return '#ef4444';
        case 'arcane-blue':
          if (type === 'base') return '#1e3a8a';
          if (type === 'shock') return '#00ffff';
          if (type === 'particle') return isDark ? '#3b82f6' : '#2563eb';
          return '#3b82f6';
        case 'arcane-gold':
          if (type === 'base') return '#92400e';
          if (type === 'shock') return '#ffffff';
          if (type === 'particle') return '#f59e0b';
          return '#f59e0b';
        case 'arcane-green':
          if (type === 'base') return '#064e3b';
          if (type === 'shock') return '#00ff00';
          if (type === 'particle') return '#10b981';
          return '#10b981';
        case 'arcane-neon-pink':
          if (type === 'base') return '#660066';
          if (type === 'shock') return '#ff00ff';
          if (type === 'particle') return '#ff00ff';
          return '#ff00ff';
        case 'arcane-plasma-cyan':
          if (type === 'base') return '#006666';
          if (type === 'shock') return '#00ffff';
          if (type === 'particle') return '#00ffff';
          return '#00ffff';
        case 'arcane-void-purple':
          if (type === 'base') return '#2c0080';
          if (type === 'shock') return '#8e2de2';
          if (type === 'particle') return isDark ? '#8e2de2' : '#4a00e0';
          return '#8e2de2';
        case 'arcane-solar-flare':
          if (type === 'base') return '#991100';
          if (type === 'shock') return '#ffaa00';
          if (type === 'particle') return isDark ? '#ffaa00' : '#ff3300';
          return '#ffaa00';
        default:
          if (type === 'base') return '#4c1d95';
          if (type === 'shock') return '#ff00ff';
          if (type === 'particle') return isDark ? '#a855f7' : '#7c3aed';
          return '#8b5cf6';
      }
    };

    const isDarkRef = { current: isDark };
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };

    const initNodes = () => {
      nodes = [];
      const maxSize = uiCustomizationRef.current?.particleMaxSize ?? 4;
      for (let i = 0; i < nodeCount; i++) {
        const isRed = accentColor === 'arcane-red';
        const isBlue = accentColor === 'arcane-blue';
        const isGold = accentColor === 'arcane-gold';
        const isGreen = accentColor === 'arcane-green';
        const isPink = accentColor === 'arcane-neon-pink';
        const isCyan = accentColor === 'arcane-plasma-cyan';
        const isVoid = accentColor === 'arcane-void-purple';
        const isSolar = accentColor === 'arcane-solar-flare';
        const isViolet = !isRed && !isBlue && !isGold && !isGreen && !isPink && !isCyan;
        
        let color = isDark ? '#6366f1' : '#4c1d95'; // Default violet
        if (isRed) color = Math.random() > 0.8 ? (isDark ? '#f59e0b' : '#b91c1c') : (isDark ? '#ef4444' : '#dc2626');
        else if (isBlue) color = Math.random() > 0.8 ? (isDark ? '#06b6d4' : '#0891b2') : (isDark ? '#3b82f6' : '#2563eb');
        else if (isGold) color = Math.random() > 0.7 ? (isDark ? '#fbbf24' : '#d97706') : (isDark ? '#f59e0b' : '#b45309');
        else if (isGreen) color = Math.random() > 0.8 ? (isDark ? '#34d399' : '#047857') : (isDark ? '#10b981' : '#065f46');
        else if (isPink) color = Math.random() > 0.8 ? (isDark ? '#ff66ff' : '#cc00cc') : (isDark ? '#ff00ff' : '#b300b3');
        else if (isCyan) color = Math.random() > 0.8 ? (isDark ? '#66ffff' : '#009999') : (isDark ? '#00ffff' : '#00b3b3');
        else color = Math.random() > 0.9 ? (isDark ? '#f59e0b' : '#7c3aed') : (Math.random() > 0.5 ? '#a855f7' : '#8a2be2');

        const baseSize = isRed ? Math.random() * 4 + 2 : (isBlue ? Math.random() * 2 + 1 : (isGold ? Math.random() * 6 + 3 : (isPink ? Math.random() * 5 + 2 : (isCyan ? Math.random() * 3 + 1 : (isVoid ? Math.random() * 8 + 4 : (isSolar ? Math.random() * 5 + 3 : Math.random() * 3 + 1.5))))));
        const finalSize = uiCustomizationRef.current?.particleMaxSize ? (baseSize / 4) * uiCustomizationRef.current.particleMaxSize : baseSize;

        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: finalSize,
          color: color,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: isSolar ? 0.05 + Math.random() * 0.1 : 0.01 + Math.random() * 0.02,
          targetX: Math.random() * canvas.width,
          targetY: Math.random() * canvas.height,
          ease: isRed ? 0.001 + Math.random() * 0.003 : (isBlue ? 0.005 + Math.random() * 0.01 : (isGold ? 0.0005 : (isPink ? 0.003 + Math.random() * 0.006 : (isCyan ? 0.006 + Math.random() * 0.012 : 0.002 + Math.random() * 0.005)))),
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          type: isGold ? (Math.random() > 0.5 ? 'gear' : 'hex') : (isGreen ? 'bubble' : (isBlue ? 'hexagon' : (isPink ? 'triangle' : (isCyan ? 'cross' : (isVoid ? 'star' : (isSolar ? 'flare' : (isViolet ? 'diamond' : 'default')))))))
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!isHomeRef.current) return;
      mousedownTimeRef.current = performance.now();
      mousedownPosRef.current = { x: e.clientX, y: e.clientY };
      isMouseDownRef.current = true;
      
      longPressTimeoutRef.current = setTimeout(() => {
        const duration = performance.now() - mousedownTimeRef.current;
        if (duration >= 800) {
          // Trigger Ultimate Animation
          specialEffectRef.current = {
            active: true,
            x: mousedownPosRef.current.x,
            y: mousedownPosRef.current.y,
            startTime: performance.now(),
            phase: 'pull',
            duration: 8000, // Much longer duration for ultimate
            type: 'ultimate'
          };
          // Visual feedback for long press start
          shockwavesRef.current.push({
            x: mousedownPosRef.current.x,
            y: mousedownPosRef.current.y,
            radius: 0,
            maxRadius: 800,
            speed: 15,
            opacity: 1,
            color: '#ffffff',
            life: 1,
            type: 'push'
          });
        }
      }, 800);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isHomeRef.current) return;
      const touch = e.touches[0];
      mousedownTimeRef.current = performance.now();
      mousedownPosRef.current = { x: touch.clientX, y: touch.clientY };
      isMouseDownRef.current = true;
      
      longPressTimeoutRef.current = setTimeout(() => {
        const duration = performance.now() - mousedownTimeRef.current;
        if (duration >= 800) {
          specialEffectRef.current = {
            active: true,
            x: mousedownPosRef.current.x,
            y: mousedownPosRef.current.y,
            startTime: performance.now(),
            phase: 'pull',
            duration: 8000,
            type: 'ultimate'
          };
          shockwavesRef.current.push({
            x: mousedownPosRef.current.x,
            y: mousedownPosRef.current.y,
            radius: 0,
            maxRadius: 800,
            speed: 15,
            opacity: 1,
            color: '#ffffff',
            life: 1,
            type: 'push'
          });
        }
      }, 800);
    };

    const handleMouseUp = (e: MouseEvent) => {
      isMouseDownRef.current = false;
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
      
      const duration = performance.now() - mousedownTimeRef.current;
      if (mousedownTimeRef.current > 0 && duration < 800) {
        handleAction(e.clientX, e.clientY);
      }
      mousedownTimeRef.current = 0;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      isMouseDownRef.current = false;
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
      
      const duration = performance.now() - mousedownTimeRef.current;
      if (mousedownTimeRef.current > 0 && duration < 800) {
        const touch = e.changedTouches[0];
        handleAction(touch.clientX, touch.clientY);
      }
      mousedownTimeRef.current = 0;
    };

    const handleAction = (x: number, y: number) => {
      if (!isHomeRef.current) return;
      
      clickCountRef.current += 1;

      if (clickCountRef.current >= 50) {
        clickCountRef.current = 0;
        specialEffectRef.current = {
          active: true,
          x: x,
          y: y,
          startTime: performance.now(),
          phase: 'pull',
          duration: 3500, // 3.5 seconds pull
          type: 'standard'
        };
        return;
      }

      const type = nextWaveTypeRef.current;
      shockwavesRef.current.push({
        x: x,
        y: y,
        radius: 0,
        maxRadius: 400 + Math.random() * 200,
        speed: type === 'push' ? 6 + Math.random() * 3 : 4 + Math.random() * 2,
        opacity: 1,
        color: accentColor === 'arcane-red' ? '#ef4444' : (accentColor === 'arcane-blue' ? '#3b82f6' : (accentColor === 'arcane-gold' ? '#f59e0b' : (accentColor === 'arcane-green' ? '#10b981' : (accentColor === 'arcane-neon-pink' ? '#ff00ff' : (accentColor === 'arcane-plasma-cyan' ? '#00ffff' : (accentColor === 'arcane-void-purple' ? '#4a00e0' : (accentColor === 'arcane-solar-flare' ? '#ff3300' : '#8a2be2'))))))),
        life: 1,
        type: type
      });
      nextWaveTypeRef.current = type === 'push' ? 'pull' : 'push';
    };

    const handleClick = (e: MouseEvent) => {
      // Replaced by handleAction in handleMouseUp/handleTouchEnd
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    resize();

    const render = (timestamp: number) => {
      if (!isHomeRef.current) {
        // Clear canvas and arrays to optimize when not on home screen
        if (nodes.length > 0 || shockwavesRef.current.length > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          nodes = [];
          shockwavesRef.current = [];
          // Reset interaction states
          isMouseDownRef.current = false;
          mousedownTimeRef.current = 0;
          if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
          }
        }
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      // Re-initialize if we just came back to home screen
      if (nodes.length === 0) {
        initNodes();
      }

      time += 0.005;
      
      // Shifting Gradient Base
      const grad = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time * 0.5) * 200,
        canvas.height / 2 + Math.cos(time * 0.3) * 200,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 1.2
      );
      
      if (accentColor === 'arcane-red') {
        grad.addColorStop(0, isDark ? '#1a0505' : '#fff1f1');
        grad.addColorStop(0.5, isDark ? '#0a0000' : '#fffafa'); 
        grad.addColorStop(1, isDark ? '#050202' : '#ffffff'); 
      } else if (accentColor === 'arcane-blue') {
        grad.addColorStop(0, isDark ? '#050a1a' : '#eff6ff');
        grad.addColorStop(0.5, isDark ? '#00050a' : '#f8faff'); 
        grad.addColorStop(1, isDark ? '#020205' : '#ffffff'); 
      } else if (accentColor === 'arcane-gold') {
        grad.addColorStop(0, isDark ? '#1a1005' : '#fffbeb');
        grad.addColorStop(0.5, isDark ? '#0a0500' : '#fffdf5'); 
        grad.addColorStop(1, isDark ? '#050200' : '#ffffff'); 
      } else if (accentColor === 'arcane-green') {
        grad.addColorStop(0, isDark ? '#051a10' : '#f0fdf4');
        grad.addColorStop(0.5, isDark ? '#000a05' : '#f8fffb'); 
        grad.addColorStop(1, isDark ? '#000502' : '#ffffff'); 
      } else if (accentColor === 'arcane-neon-pink') {
        grad.addColorStop(0, isDark ? '#1a001a' : '#ffe6ff');
        grad.addColorStop(0.5, isDark ? '#0a000a' : '#fff0ff'); 
        grad.addColorStop(1, isDark ? '#050005' : '#ffffff'); 
      } else if (accentColor === 'arcane-plasma-cyan') {
        grad.addColorStop(0, isDark ? '#001a1a' : '#e6ffff');
        grad.addColorStop(0.5, isDark ? '#000a0a' : '#f0ffff'); 
        grad.addColorStop(1, isDark ? '#000505' : '#ffffff'); 
      } else if (accentColor === 'arcane-void-purple') {
        grad.addColorStop(0, isDark ? '#050010' : '#f5f0ff');
        grad.addColorStop(0.5, isDark ? '#030008' : '#f8f5ff'); 
        grad.addColorStop(1, isDark ? '#010003' : '#ffffff'); 
      } else if (accentColor === 'arcane-solar-flare') {
        grad.addColorStop(0, isDark ? '#100200' : '#fff2f0');
        grad.addColorStop(0.5, isDark ? '#080100' : '#fff8f5'); 
        grad.addColorStop(1, isDark ? '#030000' : '#ffffff'); 
      } else {
        grad.addColorStop(0, isDark ? '#0a0a1a' : '#f5f3ff');
        grad.addColorStop(0.5, isDark ? '#05000a' : '#faf9ff'); 
        grad.addColorStop(1, isDark ? '#020205' : '#ffffff'); 
      }
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Charging Effect for Long Press
      if (isMouseDownRef.current && mousedownTimeRef.current > 0) {
        const chargeElapsed = performance.now() - mousedownTimeRef.current;
        if (chargeElapsed < 800) {
          const chargeProgress = chargeElapsed / 800;
          const { x, y } = mousedownPosRef.current;
          
          ctx.save();
          ctx.translate(x, y);
          
          // Outer Ring
          ctx.beginPath();
          ctx.arc(0, 0, 40 * (1 - chargeProgress), 0, Math.PI * 2);
          ctx.strokeStyle = getArcaneColor(accentColor, 'glow');
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Inner Glow
          const chargeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 20 * chargeProgress);
          chargeGrad.addColorStop(0, ctx.strokeStyle as string);
          chargeGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = chargeGrad;
          ctx.globalAlpha = chargeProgress * 0.5;
          ctx.beginPath();
          ctx.arc(0, 0, 20 * chargeProgress, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
      }

      // Special Effect Logic
      const special = specialEffectRef.current;
      if (special.active) {
        const elapsed = performance.now() - special.startTime;
        
        if (special.phase === 'pull') {
          if (elapsed > special.duration) {
            special.phase = 'push';
            special.startTime = performance.now();
            special.duration = special.type === 'ultimate' ? 5000 : 2000; // Longer push for ultimate
            
            // Add a massive shockwave
            shockwavesRef.current.push({
              x: special.x,
              y: special.y,
              radius: 0,
              maxRadius: Math.max(canvas.width, canvas.height) * (special.type === 'ultimate' ? 4 : 2),
              speed: special.type === 'ultimate' ? 50 : 30,
              opacity: 1,
              color: getArcaneColor(accentColor, 'shock'),
              life: special.type === 'ultimate' ? 6 : 2.5,
              type: 'push'
            });
          } else {
            // Draw Effect based on type
            const progress = Math.min(1, elapsed / special.duration);
            const easeProgress = progress * progress * (3 - 2 * progress); // Smoothstep
            
            if (special.type === 'standard') {
              ctx.save();
              ctx.translate(special.x, special.y);
              
              const baseColor = getArcaneColor(accentColor, 'base');
              const glowColor = getArcaneColor(accentColor, 'glow');
              
              // Implosion Burst right before push (themed and accent-colored)
              if (progress > 0.7) {
                const burstProgress = (progress - 0.7) / 0.3;
                ctx.save();
                ctx.globalAlpha = burstProgress * 0.7;
                ctx.strokeStyle = glowColor;
                ctx.lineWidth = 2;
                
                const ringCount = 3;
                for (let i = 0; i < ringCount; i++) {
                  const ringRadius = Math.max(0, (100 + i * 50) * burstProgress);
                  const ringAlpha = (1 - (i / ringCount)) * burstProgress;
                  ctx.globalAlpha = ringAlpha * 0.8;
                  
                  if (accentColor === 'arcane-blue') {
                    // Square rings for digital
                    ctx.strokeRect(-ringRadius, -ringRadius, ringRadius * 2, ringRadius * 2);
                  } else if (accentColor === 'arcane-gold') {
                    // Hexagonal rings for hextech
                    ctx.beginPath();
                    for (let j = 0; j < 6; j++) {
                      const angle = (j * Math.PI * 2) / 6 + time;
                      const px = ringRadius * Math.cos(angle);
                      const py = ringRadius * Math.sin(angle);
                      if (j === 0) ctx.moveTo(px, py);
                      else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.stroke();
                  } else {
                    // Circular rings for others
                    ctx.beginPath();
                    ctx.arc(0, 0, Math.max(0, ringRadius), 0, Math.PI * 2);
                    ctx.stroke();
                  }
                }
                
                // Central flare
                const flareRadius = Math.max(0, 150 * burstProgress);
                const flareGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, flareRadius);
                flareGrad.addColorStop(0, '#ffffff');
                flareGrad.addColorStop(0.2, glowColor);
                flareGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = flareGrad;
                ctx.globalAlpha = burstProgress * 0.5;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, flareRadius), 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
              }

              // Core
              const coreRadius = Math.max(0, 60 * (1 + Math.sin(time * 30) * 0.15) * easeProgress);
              const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 2.5);
              coreGrad.addColorStop(0, '#000000');
              coreGrad.addColorStop(0.3, '#000000');
              coreGrad.addColorStop(0.6, baseColor);
              coreGrad.addColorStop(1, 'transparent');
              
              ctx.fillStyle = coreGrad;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, coreRadius * 2.5), 0, Math.PI * 2);
              ctx.fill();

              // Sucking Particles
              ctx.fillStyle = glowColor;
              for (let i = 0; i < 20; i++) {
                const pAngle = (i * Math.PI * 2) / 20 + time * 10;
                const pDist = (400 * (1 - ((progress * 5 + i * 0.1) % 1))) + coreRadius;
                const px = pDist * Math.cos(pAngle);
                const py = pDist * Math.sin(pAngle);
                ctx.beginPath();
                ctx.arc(px, py, Math.max(0, 2 * (1 - progress)), 0, Math.PI * 2);
                ctx.fill();
              }

              // Accent specific visuals
              ctx.strokeStyle = glowColor;
              ctx.lineWidth = 3;
              ctx.globalAlpha = easeProgress;

              if (accentColor === 'arcane-red') {
                // Red: Organic pulsing veins + extra chaos
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
              } else if (accentColor === 'arcane-blue') {
                // Blue: Digital grid collapse + scanning lines
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
                // Scanning circles
                ctx.lineWidth = 2;
                ctx.beginPath();
                const scanRadius = Math.max(0, (time * 500) % Math.max(1, 400 * easeProgress));
                ctx.arc(0, 0, scanRadius, 0, Math.PI * 2);
                ctx.stroke();
              } else if (accentColor === 'arcane-gold') {
                // Gold: Clockwork implosion + gear teeth
                for (let i = 0; i < 5; i++) {
                  ctx.save();
                  ctx.rotate(time * (i + 1) * (i % 2 === 0 ? 1 : -1));
                  const r = (60 + i * 50) * easeProgress;
                  ctx.strokeRect(-r, -r, r * 2, r * 2);
                  // Gear teeth on rectangles
                  for (let j = 0; j < 4; j++) {
                    ctx.rotate(Math.PI / 2);
                    ctx.strokeRect(r - 10, -10, 20, 20);
                  }
                  ctx.restore();
                }
              } else if (accentColor === 'arcane-green') {
                // Green: Toxic vortex + bubbling trails
                for (let i = 0; i < 30; i++) {
                  const angle = (i * Math.PI * 2) / 30 + time * 10;
                  const r = Math.max(0, 150 * easeProgress * (1 + Math.sin(time * 7 + i) * 0.3));
                  ctx.beginPath();
                  ctx.arc(r * Math.cos(angle), r * Math.sin(angle), Math.max(0, 6 * easeProgress), 0, Math.PI * 2);
                  ctx.stroke();
                  // Connecting lines
                  if (i % 3 === 0) {
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
                    ctx.stroke();
                  }
                }
              } else if (accentColor === 'arcane-neon-pink') {
                // Neon Pink: Cyberpunk glitch spikes
                for (let i = 0; i < 20; i++) {
                  const angle = (i * Math.PI * 2) / 20 + time * 12;
                  const r = 300 * easeProgress * (0.5 + Math.random() * 0.5);
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
                  ctx.stroke();
                  // Glitch offsets
                  if (Math.random() > 0.8) {
                    ctx.save();
                    ctx.strokeStyle = '#00ffff';
                    ctx.beginPath();
                    ctx.moveTo(10, 10);
                    ctx.lineTo(r * Math.cos(angle) + 10, r * Math.sin(angle) + 10);
                    ctx.stroke();
                    ctx.restore();
                  }
                }
              } else if (accentColor === 'arcane-plasma-cyan') {
                // Plasma Cyan: High-energy laser beams
                for (let i = 0; i < 8; i++) {
                  const angle = (i * Math.PI * 2) / 8 + time * 4;
                  const r = 400 * easeProgress;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
                  ctx.lineWidth = 4 + Math.random() * 4;
                  ctx.stroke();
                  // Core beam
                  ctx.save();
                  ctx.strokeStyle = '#ffffff';
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
                  ctx.stroke();
                  ctx.restore();
                }
              } else if (accentColor === 'arcane-void-purple') {
                // Black Hole / Singularity - UPGRADED
                const r = Math.max(0, 180 * easeProgress);
                
                // Event Horizon
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, r), 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                ctx.lineWidth = 6;
                ctx.strokeStyle = '#8e2de2';
                ctx.shadowBlur = 40;
                ctx.shadowColor = '#4a00e0';
                ctx.stroke();
                
                // Gravitational Lensing / Distortion Ring
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, r * 1.2), 0, Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = `rgba(142, 45, 226, ${0.5 * (1 - easeProgress)})`;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Accretion Disk / Swirling Energy - More complex
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
                  ctx.strokeStyle = `rgba(142, 45, 226, ${0.8 * (1 - easeProgress)})`;
                  ctx.stroke();
                }
                
                // Sucking in particles
                for (let i = 0; i < 20; i++) {
                  const pAngle = Math.random() * Math.PI * 2;
                  const pDist = (400 * (1 - easeProgress)) + r;
                  const px = pDist * Math.cos(pAngle);
                  const py = pDist * Math.sin(pAngle);
                  ctx.fillStyle = '#8e2de2';
                  ctx.beginPath();
                  ctx.arc(px, py, 2, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (accentColor === 'arcane-solar-flare') {
                // Massive Coronal Mass Ejection - UPGRADED
                const r = Math.max(0, 120 * easeProgress);
                
                // Core - Pulsing
                const corePulse = Math.sin(time * 20) * 10;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, r + corePulse), 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.shadowBlur = 60;
                ctx.shadowColor = '#ff3300';
                
                // Plasma Tendrils - More chaotic
                for (let i = 0; i < 32; i++) {
                  const angle = (i * Math.PI * 2) / 32 + time * (i % 2 === 0 ? 3 : -3);
                  const length = r * (2.5 + Math.random() * 4);
                  ctx.beginPath();
                  ctx.moveTo(r * Math.cos(angle), r * Math.sin(angle));
                  
                  // Wavy tendril with more segments
                  const midAngle = angle + Math.sin(time * 5 + i) * 0.5;
                  const cp1x = r * 2 * Math.cos(midAngle);
                  const cp1y = r * 2 * Math.sin(midAngle);
                  const cp2x = length * 0.7 * Math.cos(angle - Math.sin(time * 3) * 0.3);
                  const cp2y = length * 0.7 * Math.sin(angle - Math.sin(time * 3) * 0.3);
                  
                  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, length * Math.cos(angle), length * Math.sin(angle));
                  ctx.lineWidth = 3 + Math.random() * 5;
                  ctx.strokeStyle = i % 3 === 0 ? '#ffaa00' : (i % 3 === 1 ? '#ff3300' : '#ffff00');
                  ctx.stroke();
                  
                  // Solar sparks at the end of tendrils
                  if (Math.random() > 0.7) {
                    ctx.beginPath();
                    ctx.arc(length * Math.cos(angle), length * Math.sin(angle), 3, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                  }
                }
                ctx.shadowBlur = 0;
              } else {
                // Violet: Arcane storm + lightning bolts
                for (let i = 0; i < 12; i++) {
                  const angle = (i * Math.PI * 2) / 12 - time * 5;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.bezierCurveTo(
                    80 * easeProgress * Math.cos(angle + 1.5), 80 * easeProgress * Math.sin(angle + 1.5),
                    180 * easeProgress * Math.cos(angle - 1.5), 180 * easeProgress * Math.sin(angle - 1.5),
                    300 * easeProgress * Math.cos(angle), 300 * easeProgress * Math.sin(angle)
                  );
                  ctx.stroke();
                  // Random sparks
                  if (Math.random() > 0.95) {
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(400 * easeProgress * Math.cos(angle + Math.random() * 0.5), 400 * easeProgress * Math.sin(angle + Math.random() * 0.5));
                    ctx.stroke();
                  }
                }
              }
              
              ctx.restore();
            } else if (special.type === 'ultimate') {
              // ULTIMATE ANIMATION - THE MOST CREATIVE THING EVER
              const progress = Math.min(1, elapsed / special.duration);
              // Custom ease: fast in, slow middle, fast out
              const easeProgress = progress < 0.5 ? 
                Math.pow(progress * 2, 2) : 
                Math.pow(1 - (progress - 0.5) * 2, 2);
              
              ctx.save();
              ctx.translate(special.x, special.y);
              
              const glowColor = getArcaneColor(accentColor, 'glow');

              if (accentColor === 'arcane-red') {
                // CRIMSON NOVA: The Heart of the Beast
                // Pulsing Aura
                const auraSize = 400 * easeProgress;
                const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, auraSize);
                auraGrad.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
                auraGrad.addColorStop(0.5, 'rgba(128, 0, 0, 0.1)');
                auraGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = auraGrad;
                ctx.beginPath();
                ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
                ctx.fill();

                // Central Beating Heart
                const heartScale = 1 + Math.sin(time * 15) * 0.2 * easeProgress;
                ctx.save();
                ctx.scale(heartScale * easeProgress, heartScale * easeProgress);
                ctx.beginPath();
                ctx.moveTo(0, 30);
                ctx.bezierCurveTo(-50, -20, -100, 40, 0, 100);
                ctx.bezierCurveTo(100, 40, 50, -20, 0, 30);
                const heartGrad = ctx.createRadialGradient(0, 50, 0, 0, 50, 100);
                heartGrad.addColorStop(0, '#ff0000');
                heartGrad.addColorStop(0.7, '#660000');
                heartGrad.addColorStop(1, '#330000');
                ctx.fillStyle = heartGrad;
                ctx.fill();
                
                // Heart Glow
                ctx.shadowBlur = 40 * easeProgress;
                ctx.shadowColor = '#ff0000';
                ctx.stroke();
                ctx.restore();

                // Floating Blood Orbs
                for (let i = 0; i < 24; i++) {
                  const orbAngle = time * 1.5 + i * (Math.PI * 2 / 24);
                  const orbDist = 200 * easeProgress + Math.sin(time * 4 + i) * 80 * easeProgress;
                  const ox = Math.cos(orbAngle) * orbDist;
                  const oy = Math.sin(orbAngle) * orbDist;
                  ctx.beginPath();
                  ctx.arc(ox, oy, (3 + Math.sin(time * 5 + i) * 2) * easeProgress, 0, Math.PI * 2);
                  ctx.fillStyle = '#ff0000';
                  ctx.fill();
                }

                // Branching Veins
                ctx.shadowBlur = 20 * easeProgress;
                ctx.shadowColor = '#ff0000';
                for (let i = 0; i < 16; i++) {
                  const angle = (i * Math.PI * 2) / 16 + time * 1.2;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  let cx = 0, cy = 0;
                  for (let r = 0; r < 1000 * easeProgress; r += 10) {
                    const jitter = Math.sin(r * 0.04 + time * 12 + i) * 40;
                    cx += Math.cos(angle + jitter / 250) * 10;
                    cy += Math.sin(angle + jitter / 250) * 10;
                    ctx.lineTo(cx, cy);
                    
                    // Capillaries
                    if (r % 80 === 0 && r > 0) {
                      ctx.save();
                      ctx.translate(cx, cy);
                      ctx.rotate(angle + Math.PI / 2 + Math.sin(time * 3 + i) * 0.5);
                      ctx.beginPath();
                      ctx.moveTo(0, 0);
                      ctx.lineTo(40 * easeProgress, 30 * easeProgress);
                      ctx.stroke();
                      ctx.restore();
                    }
                  }
                  ctx.strokeStyle = `rgba(255, 0, 0, ${0.9 * easeProgress})`;
                  ctx.lineWidth = (4 * (1 - progress)) * easeProgress;
                  ctx.stroke();
                }
              } else if (accentColor === 'arcane-blue') {
                // AZURE SINGULARITY: The Digital Overlord
                // 3D Grid Floor Effect
                ctx.save();
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                for (let i = -10; i <= 10; i++) {
                  // Horizontal lines
                  ctx.beginPath();
                  ctx.moveTo(-1000 * easeProgress, i * 100 * easeProgress);
                  ctx.lineTo(1000 * easeProgress, i * 100 * easeProgress);
                  ctx.stroke();
                  // Vertical lines
                  ctx.beginPath();
                  ctx.moveTo(i * 100 * easeProgress, -1000 * easeProgress);
                  ctx.lineTo(i * 100 * easeProgress, 1000 * easeProgress);
                  ctx.stroke();
                }
                ctx.restore();

                // Wireframe Sphere
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 1.5;
                const sphereSize = 400 * easeProgress;
                for (let i = 0; i < 12; i++) {
                  const r = sphereSize * Math.sin((i / 12) * Math.PI);
                  const z = sphereSize * Math.cos((i / 12) * Math.PI);
                  ctx.beginPath();
                  ctx.ellipse(0, z * Math.sin(time * 0.5), r, r * Math.cos(time * 0.5), 0, 0, Math.PI * 2);
                  ctx.stroke();
                }
                for (let i = 0; i < 12; i++) {
                  ctx.save();
                  ctx.rotate((i / 12) * Math.PI * 2 + time * 0.8);
                  ctx.beginPath();
                  ctx.ellipse(0, 0, sphereSize, sphereSize * Math.sin(time * 0.5), 0, 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.restore();
                }

                // Floating Holographic Data Panels
                for (let i = 0; i < 6; i++) {
                  const panelAngle = time * 0.5 + i * (Math.PI * 2 / 6);
                  const px = Math.cos(panelAngle) * 350 * easeProgress;
                  const py = Math.sin(panelAngle) * 350 * easeProgress;
                  ctx.save();
                  ctx.translate(px, py);
                  ctx.rotate(panelAngle + Math.PI / 2);
                  ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
                  ctx.fillRect(-60 * easeProgress, -40 * easeProgress, 120 * easeProgress, 80 * easeProgress);
                  ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                  ctx.strokeRect(-60 * easeProgress, -40 * easeProgress, 120 * easeProgress, 80 * easeProgress);
                  
                  // Scrolling Text in Panel
                  ctx.font = `${8 * easeProgress}px monospace`;
                  ctx.fillStyle = '#00ffff';
                  for (let j = 0; j < 5; j++) {
                    const text = Math.random().toString(16).slice(2, 10).toUpperCase();
                    ctx.fillText(text, -50 * easeProgress, (-25 + j * 12) * easeProgress);
                  }
                  ctx.restore();
                }

                // Binary Rain
                ctx.font = `${14 * easeProgress}px monospace`;
                ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
                for (let i = 0; i < 60; i++) {
                  const x = (i - 30) * 40;
                  const speed = 400 + (i % 5) * 100;
                  const yOffset = (time * speed + i * 150) % 1200 - 600;
                  const char = Math.random() > 0.5 ? "1" : "0";
                  ctx.fillText(char, x, yOffset * easeProgress);
                }

                // Circuit Traces
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 12; i++) {
                  const angle = (i * Math.PI * 2) / 12 + time * 0.2;
                  ctx.moveTo(0, 0);
                  const r1 = 250 * easeProgress;
                  const r2 = 350 * easeProgress;
                  ctx.lineTo(r1 * Math.cos(angle), r1 * Math.sin(angle));
                  ctx.lineTo(r1 * Math.cos(angle) + 40 * easeProgress * Math.cos(angle + 0.5), r1 * Math.sin(angle) + 40 * easeProgress * Math.sin(angle + 0.5));
                  ctx.lineTo(r2 * Math.cos(angle + 0.5), r2 * Math.sin(angle + 0.5));
                }
                ctx.stroke();
              } else if (accentColor === 'arcane-gold') {
                // MIDAS RADIANCE: The Alchemical Engine
                // Central Alchemical Seal
                ctx.save();
                ctx.rotate(time * 0.5);
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(0, 0, 100 * easeProgress, 0, Math.PI * 2);
                ctx.stroke();
                // Inner Triangle
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                  const a = (i * Math.PI * 2) / 3;
                  ctx.lineTo(100 * easeProgress * Math.cos(a), 100 * easeProgress * Math.sin(a));
                }
                ctx.closePath();
                ctx.stroke();
                ctx.restore();

                // Interlocking Gears
                for (let i = 0; i < 8; i++) {
                  ctx.save();
                  const gearDist = 250 * easeProgress;
                  const gearX = Math.cos((i * Math.PI * 2) / 8 + time * 0.2) * gearDist;
                  const gearY = Math.sin((i * Math.PI * 2) / 8 + time * 0.2) * gearDist;
                  ctx.translate(gearX, gearY);
                  ctx.rotate(time * 3 * (i % 2 === 0 ? 1 : -1));
                  
                  const r = 80 * easeProgress;
                  ctx.beginPath();
                  for (let j = 0; j < 16; j++) {
                    const a = (j * Math.PI * 2) / 16;
                    ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
                    ctx.lineTo((r + 20) * Math.cos(a + 0.05), (r + 20) * Math.sin(a + 0.05));
                    ctx.lineTo((r + 20) * Math.cos(a + 0.3), (r + 20) * Math.sin(a + 0.3));
                    ctx.lineTo(r * Math.cos(a + 0.35), r * Math.sin(a + 0.35));
                  }
                  ctx.closePath();
                  ctx.strokeStyle = '#f59e0b';
                  ctx.lineWidth = 4;
                  ctx.stroke();
                  
                  // Gear Spokes
                  ctx.beginPath();
                  ctx.arc(0, 0, 15 * easeProgress, 0, Math.PI * 2);
                  for (let j = 0; j < 4; j++) {
                    const a = (j * Math.PI * 2) / 4;
                    ctx.moveTo(0, 0);
                    ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
                  }
                  ctx.stroke();
                  ctx.restore();
                }

                // Floating Alchemical Symbols
                const symbols = ["☉", "☽", "☿", "♀", "♂", "♃", "♄", "🜁", "🜂", "🜃", "🜄"];
                ctx.font = `${30 * easeProgress}px serif`;
                ctx.fillStyle = '#f59e0b';
                for (let i = 0; i < 12; i++) {
                  const symAngle = time * 0.4 + i * (Math.PI * 2 / 12);
                  const symDist = 450 * easeProgress + Math.sin(time * 2 + i) * 50 * easeProgress;
                  const sx = Math.cos(symAngle) * symDist;
                  const sy = Math.sin(symAngle) * symDist;
                  ctx.save();
                  ctx.translate(sx, sy);
                  ctx.rotate(symAngle + Math.PI / 2);
                  ctx.fillText(symbols[i % symbols.length], -15 * easeProgress, 15 * easeProgress);
                  ctx.restore();
                }

                // Sacred Geometry (Metatron's Cube)
                ctx.beginPath();
                const size = 500 * easeProgress;
                for (let i = 0; i < 12; i++) {
                  const a1 = (i * Math.PI * 2) / 12 + time * 0.1;
                  const x1 = size * Math.cos(a1);
                  const y1 = size * Math.sin(a1);
                  for (let j = 0; j < 12; j++) {
                    const a2 = (j * Math.PI * 2) / 12 + time * 0.1;
                    const x2 = size * Math.cos(a2);
                    const y2 = size * Math.sin(a2);
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                  }
                }
                ctx.strokeStyle = `rgba(245, 158, 11, ${0.3 * easeProgress})`;
                ctx.lineWidth = 1;
                ctx.stroke();
              } else if (accentColor === 'arcane-green') {
                // EMERALD OVERGROWTH: The Living Jungle
                // Forest Floor Aura
                const forestGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 600 * easeProgress);
                forestGrad.addColorStop(0, 'rgba(6, 78, 59, 0.4)');
                forestGrad.addColorStop(0.6, 'rgba(16, 185, 129, 0.1)');
                forestGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = forestGrad;
                ctx.beginPath();
                ctx.arc(0, 0, 600 * easeProgress, 0, Math.PI * 2);
                ctx.fill();

                // Fractal Branches
                const drawBranch = (x: number, y: number, len: number, angle: number, depth: number) => {
                  if (depth === 0) return;
                  const x2 = x + Math.cos(angle) * len * easeProgress;
                  const y2 = y + Math.sin(angle) * len * easeProgress;
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                  ctx.lineTo(x2, y2);
                  ctx.strokeStyle = '#064e3b';
                  ctx.lineWidth = depth * 3 * easeProgress;
                  ctx.stroke();
                  
                  if (depth < 4) {
                    // Bloom / Flower
                    ctx.save();
                    ctx.translate(x2, y2);
                    ctx.rotate(time + depth);
                    ctx.beginPath();
                    for (let p = 0; p < 5; p++) {
                      const pa = (p * Math.PI * 2) / 5;
                      ctx.ellipse(10 * easeProgress, 0, 10 * easeProgress, 4 * easeProgress, pa, 0, Math.PI * 2);
                    }
                    ctx.fillStyle = depth % 2 === 0 ? '#10b981' : '#34d399';
                    ctx.fill();
                    ctx.restore();
                  }

                  const wind = Math.sin(time + depth) * 0.1;
                  drawBranch(x2, y2, len * 0.75, angle - 0.4 + wind, depth - 1);
                  drawBranch(x2, y2, len * 0.75, angle + 0.4 + wind, depth - 1);
                };

                for (let i = 0; i < 12; i++) {
                  drawBranch(0, 0, 180, (i * Math.PI * 2) / 12 + time * 0.5, 6);
                }

                // Falling Leaves
                for (let i = 0; i < 40; i++) {
                  const leafAngle = time * 0.3 + i * (Math.PI * 2 / 40);
                  const leafDist = (time * 100 + i * 50) % 800 * easeProgress;
                  const lx = Math.cos(leafAngle) * leafDist;
                  const ly = Math.sin(leafAngle) * leafDist;
                  ctx.save();
                  ctx.translate(lx, ly);
                  ctx.rotate(time * 2 + i);
                  ctx.beginPath();
                  ctx.ellipse(0, 0, 8 * easeProgress, 4 * easeProgress, 0, 0, Math.PI * 2);
                  ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
                  ctx.fill();
                  ctx.restore();
                }

                // Spores / Fireflies
                for (let i = 0; i < 50; i++) {
                  const a = Math.random() * Math.PI * 2 + time * 0.2;
                  const r = Math.random() * 800 * easeProgress;
                  ctx.beginPath();
                  ctx.arc(r * Math.cos(a), r * Math.sin(a), (1 + Math.random() * 2) * easeProgress, 0, Math.PI * 2);
                  ctx.fillStyle = `rgba(52, 211, 153, ${Math.random() * easeProgress})`;
                  ctx.shadowBlur = 10 * easeProgress;
                  ctx.shadowColor = '#34d399';
                  ctx.fill();
                }
                ctx.shadowBlur = 0;
              } else if (accentColor === 'arcane-neon-pink') {
                // CYBER GLITCH: The Reality Error
                // Background Static / Noise
                ctx.save();
                for (let i = 0; i < 100; i++) {
                  const nx = (Math.random() - 0.5) * canvas.width;
                  const ny = (Math.random() - 0.5) * canvas.height;
                  ctx.fillStyle = `rgba(255, 255, 255, ${0.05 * easeProgress})`;
                  ctx.fillRect(nx, ny, 2, 2);
                }
                ctx.restore();

                // Chromatic Aberration Split
                const offset = 30 * Math.sin(time * 60) * easeProgress;
                
                // Red Channel Ghost
                ctx.save();
                ctx.translate(offset, offset * 0.5);
                ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
                ctx.fillRect(-300 * easeProgress, -300 * easeProgress, 600 * easeProgress, 600 * easeProgress);
                ctx.restore();

                // Blue Channel Ghost
                ctx.save();
                ctx.translate(-offset, -offset * 0.5);
                ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
                ctx.fillRect(-300 * easeProgress, -300 * easeProgress, 600 * easeProgress, 600 * easeProgress);
                ctx.restore();

                // VCR OSD Elements
                ctx.font = `bold ${40 * easeProgress}px monospace`;
                ctx.fillStyle = '#ffffff';
                if (Math.random() > 0.5) {
                  ctx.fillText("PLAY ▶", -400 * easeProgress, -300 * easeProgress);
                  ctx.fillText("00:00:00:00", 200 * easeProgress, 350 * easeProgress);
                }
                if (Math.sin(time * 10) > 0) {
                  ctx.fillStyle = '#ff0000';
                  ctx.beginPath();
                  ctx.arc(-420 * easeProgress, -315 * easeProgress, 10 * easeProgress, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.fillStyle = '#ffffff';
                  ctx.fillText("REC", -400 * easeProgress, -300 * easeProgress);
                }

                // Glitch Strips & Blocks
                for (let i = 0; i < 25; i++) {
                  const y = (Math.random() - 0.5) * 1200 * easeProgress;
                  const h = Math.random() * 80 * easeProgress;
                  const w = canvas.width;
                  const xOffset = (Math.random() - 0.5) * 100 * easeProgress;
                  ctx.fillStyle = i % 2 === 0 ? `rgba(255, 0, 255, ${Math.random() * 0.6 * easeProgress})` : `rgba(0, 255, 255, ${Math.random() * 0.4 * easeProgress})`;
                  ctx.fillRect(-w/2 + xOffset, y, w, h);
                  
                  // Random text glitch strings
                  if (Math.random() > 0.85) {
                    const glitchTexts = ["CRITICAL_ERROR", "DATA_CORRUPT", "VOID_NULL", "0xDEADBEEF", "SYSTEM_HALT"];
                    ctx.font = `${20 + Math.random() * 30}px monospace`;
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText(glitchTexts[Math.floor(Math.random() * glitchTexts.length)], (Math.random() - 0.5) * 800, y);
                  }
                }

                // Scanlines
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.lineWidth = 1;
                for (let i = -20; i < 20; i++) {
                  ctx.beginPath();
                  ctx.moveTo(-canvas.width/2, i * 30 * easeProgress);
                  ctx.lineTo(canvas.width/2, i * 30 * easeProgress);
                  ctx.stroke();
                }
              } else if (accentColor === 'arcane-plasma-cyan') {
                // PLASMA STORM: The Ionized Tempest
                // Magnetic Field Arcs
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 12; i++) {
                  const a = (i * Math.PI * 2) / 12 + time * 0.5;
                  ctx.beginPath();
                  ctx.arc(0, 0, 400 * easeProgress, a, a + 1.5);
                  ctx.stroke();
                }

                // Branching Lightning
                const drawLightning = (x1: number, y1: number, angle: number, len: number, iterations: number) => {
                  if (iterations === 0) return;
                  const x2 = x1 + Math.cos(angle) * len;
                  const y2 = y1 + Math.sin(angle) * len;
                  ctx.beginPath();
                  ctx.moveTo(x1, y1);
                  ctx.lineTo(x2, y2);
                  ctx.strokeStyle = '#ffffff';
                  ctx.lineWidth = iterations * 2 * easeProgress;
                  ctx.shadowBlur = 15 * easeProgress;
                  ctx.shadowColor = '#00ffff';
                  ctx.stroke();
                  
                  const branches = 1 + Math.floor(Math.random() * 2);
                  for (let i = 0; i < branches; i++) {
                    drawLightning(x2, y2, angle + (Math.random() - 0.5) * 1.8, len * 0.75, iterations - 1);
                  }
                };

                if (Math.random() > 0.6) {
                  for (let i = 0; i < 8; i++) {
                    const startAngle = (i * Math.PI * 2) / 8 + time * 2;
                    drawLightning(0, 0, startAngle, 120 * easeProgress, 6);
                  }
                }

                // Plasma Orbs & Ionized Gas
                for (let i = 0; i < 8; i++) {
                  const a = time * 2.5 + (i * Math.PI * 2) / 8;
                  const r = 300 * easeProgress + Math.sin(time * 4 + i) * 50 * easeProgress;
                  const ox = r * Math.cos(a);
                  const oy = r * Math.sin(a);
                  
                  // Orb Core
                  const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, 70 * easeProgress);
                  orbGrad.addColorStop(0, '#ffffff');
                  orbGrad.addColorStop(0.3, '#00ffff');
                  orbGrad.addColorStop(1, 'transparent');
                  ctx.fillStyle = orbGrad;
                  ctx.beginPath();
                  ctx.arc(ox, oy, 70 * easeProgress, 0, Math.PI * 2);
                  ctx.fill();
                  
                  // Arcs between orbs
                  if (i > 0) {
                    const prevA = time * 2.5 + ((i-1) * Math.PI * 2) / 8;
                    const prevR = 300 * easeProgress + Math.sin(time * 4 + (i-1)) * 50 * easeProgress;
                    const pox = prevR * Math.cos(prevA);
                    const poy = prevR * Math.sin(prevA);
                    ctx.beginPath();
                    ctx.moveTo(ox, oy);
                    ctx.quadraticCurveTo(0, 0, pox, poy);
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    ctx.lineWidth = 2 * easeProgress;
                    ctx.stroke();
                  }
                }
                ctx.shadowBlur = 0;
              } else if (accentColor === 'arcane-void-purple') {
                // ABYSSAL MAW: The End of All Things
                // Gravitational Lensing (Distortion Aura)
                const lensGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 800 * easeProgress);
                lensGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
                lensGrad.addColorStop(0.2, 'rgba(44, 0, 128, 0.8)');
                lensGrad.addColorStop(0.5, 'rgba(142, 45, 226, 0.2)');
                lensGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = lensGrad;
                ctx.beginPath();
                ctx.arc(0, 0, 800 * easeProgress, 0, Math.PI * 2);
                ctx.fill();

                // Accretion Disk with High-Speed Particles
                const r = 250 * easeProgress;
                ctx.rotate(time * 4);
                
                for (let i = 0; i < 100; i++) {
                  const angle = (i / 100) * Math.PI * 2 + time * (i % 2 === 0 ? 2 : 1);
                  const dist = r * (1.2 + Math.sin(angle * 4 + time * 6) * 0.6);
                  ctx.beginPath();
                  ctx.moveTo(r * Math.cos(angle), r * Math.sin(angle));
                  ctx.lineTo(dist * Math.cos(angle), dist * Math.sin(angle));
                  ctx.strokeStyle = `hsla(${260 + Math.sin(time + i) * 40}, 100%, 60%, ${0.7 * easeProgress})`;
                  ctx.lineWidth = (2 + Math.random() * 4) * easeProgress;
                  ctx.stroke();
                }

                // Event Horizon (The Void)
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                ctx.shadowBlur = 120 * easeProgress;
                ctx.shadowColor = '#8e2de2';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2 * easeProgress;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Star Particles being sucked in
                for (let i = 0; i < 40; i++) {
                  const sa = (i * Math.PI * 2) / 40 + time;
                  const sd = (1000 - (time * 800 + i * 25) % 1000) * easeProgress;
                  if (sd > r) {
                    ctx.beginPath();
                    ctx.arc(sd * Math.cos(sa), sd * Math.sin(sa), 2 * easeProgress, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                  }
                }

                // Quasar Jets (Dual Beams)
                const jetGrad = ctx.createLinearGradient(0, -1500 * easeProgress, 0, 1500 * easeProgress);
                jetGrad.addColorStop(0, 'transparent');
                jetGrad.addColorStop(0.2, '#ffffff');
                jetGrad.addColorStop(0.5, 'rgba(142, 45, 226, 0.8)');
                jetGrad.addColorStop(0.8, '#ffffff');
                jetGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = jetGrad;
                ctx.fillRect(-8 * easeProgress, -1500 * easeProgress, 16 * easeProgress, 3000 * easeProgress);
                
                // Hawking Radiation (Faint edge sparks)
                for (let i = 0; i < 20; i++) {
                  const ha = Math.random() * Math.PI * 2;
                  const hd = r + Math.random() * 20;
                  ctx.beginPath();
                  ctx.arc(hd * Math.cos(ha), hd * Math.sin(ha), 1, 0, Math.PI * 2);
                  ctx.fillStyle = '#ffffff';
                  ctx.fill();
                }
              } else if (accentColor === 'arcane-solar-flare') {
                // SOLAR ERUPTION: The Star's Fury
                // Coronal Aura
                const coronaGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1000 * easeProgress);
                coronaGrad.addColorStop(0, 'rgba(255, 170, 0, 0.5)');
                coronaGrad.addColorStop(0.4, 'rgba(255, 51, 0, 0.2)');
                coronaGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = coronaGrad;
                ctx.beginPath();
                ctx.arc(0, 0, 1000 * easeProgress, 0, Math.PI * 2);
                ctx.fill();

                // Sun Core with Sunspots
                const r = 200 * easeProgress;
                const sunGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
                sunGrad.addColorStop(0, '#ffffff');
                sunGrad.addColorStop(0.2, '#ffff00');
                sunGrad.addColorStop(0.5, '#ffaa00');
                sunGrad.addColorStop(0.9, '#ff3300');
                sunGrad.addColorStop(1, '#660000');
                ctx.fillStyle = sunGrad;
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();
                
                // Sunspots
                ctx.fillStyle = 'rgba(51, 0, 0, 0.6)';
                for (let i = 0; i < 5; i++) {
                  const sa = time * 0.5 + i;
                  const sd = r * 0.6 * Math.sin(i);
                  ctx.beginPath();
                  ctx.ellipse(sd * Math.cos(sa), sd * Math.sin(sa), 15 * easeProgress, 10 * easeProgress, sa, 0, Math.PI * 2);
                  ctx.fill();
                }

                // Solar Loops (Prominences) - More detailed
                for (let i = 0; i < 16; i++) {
                  const angle = (i * Math.PI * 2) / 16 + time * 0.8;
                  ctx.beginPath();
                  const loopR = 120 * easeProgress + Math.sin(time * 2 + i) * 30 * easeProgress;
                  ctx.arc(r * Math.cos(angle), r * Math.sin(angle), loopR, angle - 1.2, angle + 1.2);
                  ctx.strokeStyle = i % 2 === 0 ? '#ffaa00' : '#ff3300';
                  ctx.lineWidth = 8 * easeProgress;
                  ctx.stroke();
                  
                  // Secondary thinner loop
                  ctx.beginPath();
                  ctx.arc(r * Math.cos(angle), r * Math.sin(angle), loopR * 0.8, angle - 1, angle + 1);
                  ctx.strokeStyle = '#ffffff';
                  ctx.lineWidth = 2 * easeProgress;
                  ctx.stroke();
                }

                // Blinding Rays & Solar Wind
                for (let i = 0; i < 80; i++) {
                  const a = (i * Math.PI * 2) / 80 + (Math.random() - 0.5) * 0.1;
                  const len = r + (Math.random() * 1200 + 200) * easeProgress;
                  ctx.beginPath();
                  ctx.moveTo(r * Math.cos(a), r * Math.sin(a));
                  ctx.lineTo(len * Math.cos(a), len * Math.sin(a));
                  ctx.strokeStyle = i % 10 === 0 ? `rgba(255, 255, 255, ${0.4 * easeProgress})` : `rgba(255, 170, 0, ${0.15 * easeProgress})`;
                  ctx.lineWidth = i % 10 === 0 ? 3 : 1;
                  ctx.stroke();
                }
              } else {
                // VIOLET: The Arcane Rift
                // Dimensional Distortion
                const distGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 700 * easeProgress);
                distGrad.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
                distGrad.addColorStop(0.7, 'rgba(138, 43, 226, 0.1)');
                distGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = distGrad;
                ctx.beginPath();
                ctx.arc(0, 0, 700 * easeProgress, 0, Math.PI * 2);
                ctx.fill();

                // Magic Circle - Multiple Layers
                for (let i = 0; i < 5; i++) {
                  ctx.save();
                  ctx.rotate(time * (i + 1) * 0.25 * (i % 2 === 0 ? 1 : -1));
                  const r = (120 + i * 60) * easeProgress;
                  ctx.strokeStyle = i % 2 === 0 ? '#8b5cf6' : '#a855f7';
                  ctx.lineWidth = (5 - i) * easeProgress;
                  
                  // Main Ring
                  ctx.beginPath();
                  ctx.arc(0, 0, r, 0, Math.PI * 2);
                  ctx.stroke();
                  
                  // Runes & Symbols
                  const runes = ["᚛", "᚜", "ᚿ", "ᛀ", "ᛂ", "ᛄ", "ᛅ", "ᛆ", "✧", "✦", "❂"];
                  ctx.font = `${24 * easeProgress}px serif`;
                  ctx.fillStyle = ctx.strokeStyle;
                  for (let j = 0; j < 12; j++) {
                    const ra = (j * Math.PI * 2) / 12;
                    ctx.save();
                    ctx.translate(r * Math.cos(ra), r * Math.sin(ra));
                    ctx.rotate(ra + Math.PI / 2);
                    ctx.fillText(runes[(i + j) % runes.length], -10 * easeProgress, 10 * easeProgress);
                    ctx.restore();
                  }
                  
                  // Geometric Patterns
                  if (i === 2) {
                    ctx.beginPath();
                    for (let j = 0; j < 6; j++) {
                      const a = (j * Math.PI * 2) / 6;
                      ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
                    }
                    ctx.closePath();
                    ctx.stroke();
                  }
                  ctx.restore();
                }

                // Central Rift (Dimensional Eye)
                ctx.save();
                ctx.shadowBlur = 50 * easeProgress;
                ctx.shadowColor = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(-200 * easeProgress, 0);
                ctx.quadraticCurveTo(0, -100 * Math.sin(time * 5) * easeProgress, 200 * easeProgress, 0);
                ctx.quadraticCurveTo(0, 100 * Math.sin(time * 5) * easeProgress, -200 * easeProgress, 0);
                const riftGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 200 * easeProgress);
                riftGrad.addColorStop(0, '#ffffff');
                riftGrad.addColorStop(0.3, '#8b5cf6');
                riftGrad.addColorStop(1, '#2c0080');
                ctx.fillStyle = riftGrad;
                ctx.fill();
                ctx.restore();

                // Arcane Storm / Lightning
                for (let i = 0; i < 16; i++) {
                  const angle = (i * Math.PI * 2) / 16 + time;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.bezierCurveTo(
                    150 * easeProgress * Math.cos(angle + 1), 150 * easeProgress * Math.sin(angle + 1),
                    300 * easeProgress * Math.cos(angle - 1), 300 * easeProgress * Math.sin(angle - 1),
                    500 * easeProgress * Math.cos(angle), 500 * easeProgress * Math.sin(angle)
                  );
                  ctx.strokeStyle = `rgba(168, 85, 247, ${0.6 * easeProgress})`;
                  ctx.lineWidth = 3 * easeProgress;
                  ctx.stroke();
                }
              }
              
              ctx.restore();
            }
          }
        } else if (special.phase === 'push') {
          const elapsed = performance.now() - special.startTime;
          const progress = Math.min(1, elapsed / special.duration);
          
          // Screen Flash
          ctx.save();
          ctx.globalAlpha = (1 - progress) * (special.type === 'ultimate' ? 0.6 : 0.3);
          ctx.fillStyle = getArcaneColor(accentColor, 'shock');
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();

          if (elapsed > special.duration) {
            special.active = false;
            special.phase = 'done';
          }
        }
      }

      // Update Shockwaves
      shockwavesRef.current.forEach(sw => {
        sw.radius += sw.speed;
        sw.life -= 0.015;
      });
      shockwavesRef.current = shockwavesRef.current.filter(sw => sw.life > 0);

      shockwavesRef.current.forEach(sw => {
        sw.opacity = Math.max(0, Math.min(1, sw.life));

        ctx.save();
        ctx.translate(sw.x, sw.y);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.opacity * 0.6;

        // --- UNIQUE WAVE DRAWING LOGIC ---
        if (accentColor === 'arcane-red') {
          // UNSTABLE RED: Organic, pulsing, vein-like
          const pulse = Math.sin(time * 10) * 5;
          ctx.beginPath();
          ctx.lineWidth = sw.type === 'push' ? 3 : 1.5;
          for (let a = 0; a < Math.PI * 2; a += 0.1) {
            const r = sw.radius + Math.sin(a * 5 + time * 5) * 10 + pulse;
            const px = r * Math.cos(a);
            const py = r * Math.sin(a);
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          
          // Vein lines
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6 + time;
            const rStart = sw.type === 'push' ? sw.radius * 0.7 : sw.radius * 1.3;
            const rEnd = sw.type === 'push' ? sw.radius * 1.3 : sw.radius * 0.7;
            ctx.beginPath();
            ctx.moveTo(rStart * Math.cos(angle), rStart * Math.sin(angle));
            ctx.quadraticCurveTo(
              (sw.radius * 1.1) * Math.cos(angle + 0.5), (sw.radius * 1.1) * Math.sin(angle + 0.5),
              rEnd * Math.cos(angle), rEnd * Math.sin(angle)
            );
            ctx.stroke();
          }
        } else if (accentColor === 'arcane-blue') {
          // DIGITAL BLUE: Square, grid-based, pixelated
          ctx.lineWidth = 2;
          const size = sw.radius * 0.8;
          ctx.strokeRect(-size, -size, size * 2, size * 2);
          
          // Grid fragments
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const dist = sw.radius * (sw.type === 'push' ? 1.1 : 0.9);
            ctx.strokeRect(dist * Math.cos(angle) - 5, dist * Math.sin(angle) - 5, 10, 10);
          }
          
          // Digital lines
          for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12;
            const r1 = sw.type === 'push' ? sw.radius * 0.8 : sw.radius * 1.2;
            const r2 = sw.type === 'push' ? sw.radius * 1.2 : sw.radius * 0.8;
            ctx.beginPath();
            ctx.moveTo(r1 * Math.cos(angle), r1 * Math.sin(angle));
            ctx.lineTo(r2 * Math.cos(angle), r2 * Math.sin(angle));
            ctx.stroke();
          }
        } else if (accentColor === 'arcane-gold') {
          // HEXTECH GOLD: Mechanical, gear-like, precise
          const teeth = 12;
          const rInner = sw.radius * 0.9;
          const rOuter = sw.radius * 1.1;
          ctx.beginPath();
          ctx.lineWidth = 2;
          for (let t = 0; t < teeth * 2; t++) {
            const angle = (t * Math.PI) / teeth + time;
            const r = t % 2 === 0 ? rOuter : rInner;
            ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
          }
          ctx.closePath();
          ctx.stroke();
          
          // Clockwork lines
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8 - time * 2;
            const r1 = sw.type === 'push' ? sw.radius * 0.5 : sw.radius * 1.5;
            const r2 = sw.type === 'push' ? sw.radius * 1.5 : sw.radius * 0.5;
            ctx.beginPath();
            ctx.moveTo(r1 * Math.cos(angle), r1 * Math.sin(angle));
            ctx.lineTo(r2 * Math.cos(angle), r2 * Math.sin(angle));
            ctx.stroke();
          }
        } else if (accentColor === 'arcane-green') {
          // CHEMTECH GREEN: Bubbling, liquid, toxic
          ctx.beginPath();
          ctx.lineWidth = 1;
          for (let a = 0; a < Math.PI * 2; a += 0.2) {
            const r = sw.radius + Math.sin(a * 8 + time * 10) * 15;
            const px = r * Math.cos(a);
            const py = r * Math.sin(a);
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          
          // Bubbles
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI * 2) / 10 + time;
            const dist = sw.radius + Math.sin(time * 5 + i) * 20;
            ctx.beginPath();
            ctx.arc(dist * Math.cos(angle), dist * Math.sin(angle), 4, 0, Math.PI * 2);
            ctx.stroke();
          }
          
          // Toxic currents
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6 + time;
            const r1 = sw.type === 'push' ? sw.radius * 0.6 : sw.radius * 1.4;
            const r2 = sw.type === 'push' ? sw.radius * 1.4 : sw.radius * 0.6;
            ctx.beginPath();
            ctx.moveTo(r1 * Math.cos(angle), r1 * Math.sin(angle));
            ctx.bezierCurveTo(
              (sw.radius) * Math.cos(angle + 1), (sw.radius) * Math.sin(angle + 1),
              (sw.radius) * Math.cos(angle - 1), (sw.radius) * Math.sin(angle - 1),
              r2 * Math.cos(angle), r2 * Math.sin(angle)
            );
            ctx.stroke();
          }
        } else if (accentColor === 'arcane-neon-pink') {
          // NEON PINK: Cyberpunk, sharp, neon glitch
          ctx.lineWidth = 2;
          const size = sw.radius * 0.9;
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(size, 0);
          ctx.lineTo(0, size);
          ctx.lineTo(-size, 0);
          ctx.closePath();
          ctx.stroke();
          
          // Glitch ring
          if (Math.random() > 0.5) {
            ctx.save();
            ctx.strokeStyle = '#00ffff';
            ctx.globalAlpha = sw.opacity * 0.4;
            ctx.beginPath();
            ctx.moveTo(10, -size + 10);
            ctx.lineTo(size + 10, 10);
            ctx.lineTo(10, size + 10);
            ctx.lineTo(-size + 10, 10);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
          }
          
          // Sharp energy lines
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8 + (Math.random() - 0.5) * 0.1;
            const r1 = sw.type === 'push' ? sw.radius * 0.7 : sw.radius * 1.3;
            const r2 = sw.type === 'push' ? sw.radius * 1.3 : sw.radius * 0.7;
            ctx.beginPath();
            ctx.moveTo(r1 * Math.cos(angle), r1 * Math.sin(angle));
            ctx.lineTo(r2 * Math.cos(angle), r2 * Math.sin(angle));
            ctx.stroke();
          }
        } else if (accentColor === 'arcane-plasma-cyan') {
          // PLASMA CYAN: High-energy, laser, plasma wave
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0, sw.radius), 0, Math.PI * 2);
          ctx.stroke();
          
          // Inner plasma ring
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0, sw.radius * 0.8), 0, Math.PI * 2);
          ctx.stroke();
          
          // Laser beams
          for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12 + time * 2;
            const r1 = sw.type === 'push' ? sw.radius * 0.5 : sw.radius * 1.5;
            const r2 = sw.type === 'push' ? sw.radius * 1.5 : sw.radius * 0.5;
            ctx.beginPath();
            ctx.moveTo(r1 * Math.cos(angle), r1 * Math.sin(angle));
            ctx.lineTo(r2 * Math.cos(angle), r2 * Math.sin(angle));
            ctx.stroke();
          }
        } else if (accentColor === 'arcane-void-purple') {
          // VOID SINGULARITY: Gravity well, warping rings
          ctx.lineWidth = 2;
          
          // Concentric warping rings
          for (let i = 0; i < 3; i++) {
            const r = sw.radius * (1 - i * 0.15);
            if (r < 0) continue;
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 2; a += 0.2) {
              const distortion = Math.sin(a * 4 + time * 5) * 10 * sw.life;
              const px = (r + distortion) * Math.cos(a);
              const py = (r + distortion) * Math.sin(a);
              if (a === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.globalAlpha = sw.opacity * (0.8 - i * 0.2);
            ctx.stroke();
          }
          
          // Void streaks
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8 + time;
            const r1 = sw.radius * 0.5;
            const r2 = sw.radius * 1.5;
            ctx.beginPath();
            ctx.moveTo(r1 * Math.cos(angle), r1 * Math.sin(angle));
            ctx.quadraticCurveTo(0, 0, r2 * Math.cos(angle + 0.5), r2 * Math.sin(angle + 0.5));
            ctx.stroke();
          }
        } else if (accentColor === 'arcane-solar-flare') {
          // SOLAR FLARE: Coronal wave, fiery jagged edges
          ctx.lineWidth = 4;
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 2; a += 0.1) {
            const noise = (Math.random() - 0.5) * 20 * sw.life;
            const r = sw.radius + noise + Math.sin(a * 12 + time * 10) * 10;
            const px = r * Math.cos(a);
            const py = r * Math.sin(a);
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          
          // Radiating flares
          for (let i = 0; i < 16; i++) {
            const angle = (i * Math.PI * 2) / 16 + time * 2;
            const flareLen = 30 * sw.life;
            ctx.beginPath();
            ctx.moveTo(sw.radius * Math.cos(angle), sw.radius * Math.sin(angle));
            ctx.lineTo((sw.radius + flareLen) * Math.cos(angle), (sw.radius + flareLen) * Math.sin(angle));
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          
          // Heat haze particles
          for (let i = 0; i < 5; i++) {
            const pAngle = Math.random() * Math.PI * 2;
            const pDist = sw.radius + (Math.random() - 0.5) * 20;
            ctx.beginPath();
            ctx.arc(pDist * Math.cos(pAngle), pDist * Math.sin(pAngle), 2, 0, Math.PI * 2);
            ctx.fillStyle = sw.color;
            ctx.fill();
          }
        } else {
          // CHAOS VIOLET: Glitchy, sharp, unstable
          ctx.lineWidth = 1.5;
          const jitter = Math.random() > 0.8 ? (Math.random() - 0.5) * 10 : 0;
          
          // Main ring
          ctx.beginPath();
          ctx.arc(jitter, jitter, Math.max(0, sw.radius), 0, Math.PI * 2);
          ctx.stroke();
          
          // Glitch ring
          if (Math.random() > 0.7) {
            ctx.beginPath();
            ctx.arc(-jitter, -jitter, Math.max(0, sw.radius + 10), 0, Math.PI * 2);
            ctx.globalAlpha = sw.opacity * 0.2;
            ctx.stroke();
          }
          
          // Sharp energy lines
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI * 2) / 10 + (Math.random() - 0.5) * 0.2;
            const r1 = sw.type === 'push' ? sw.radius * 0.8 : sw.radius * 1.2;
            const r2 = sw.type === 'push' ? sw.radius * 1.2 : sw.radius * 0.8;
            ctx.beginPath();
            ctx.moveTo(r1 * Math.cos(angle), r1 * Math.sin(angle));
            ctx.lineTo(r2 * Math.cos(angle), r2 * Math.sin(angle));
            ctx.stroke();
          }
        }
        
        ctx.restore();
      });

      // Update and Draw Nodes/Wireframes
      nodes.forEach((node, i) => {
        // Special Effect Interaction
        if (special.active) {
          const dxSpecial = special.x - node.x;
          const dySpecial = special.y - node.y;
          const distSpecialSq = dxSpecial * dxSpecial + dySpecial * dySpecial;
          
          if (special.phase === 'pull' && distSpecialSq > 100) {
            const distSpecial = Math.sqrt(distSpecialSq);
            const force = 1500 / (distSpecial + 100);
            node.x += (dxSpecial / distSpecial) * force * 2;
            node.y += (dySpecial / distSpecial) * force * 2;
          }
        }

        // Mouse Interaction
        const dxMouse = mouseRef.current.x - node.x;
        const dyMouse = mouseRef.current.y - node.y;
        const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
        
        if (distMouseSq < 40000) { // 200 * 200
          const distMouse = Math.sqrt(distMouseSq);
          const force = (200 - distMouse) / 200;
          node.x -= dxMouse * force * 0.05;
          node.y -= dyMouse * force * 0.05;
        }

        // Shockwave Interaction
        shockwavesRef.current.forEach(sw => {
          const dxSw = node.x - sw.x;
          const dySw = node.y - sw.y;
          const distSwSq = dxSw * dxSw + dySw * dySw;
          const pushDist = 50;
          
          // Optimization: roughly check if within bounds before sqrt
          const maxInfluence = sw.radius + pushDist;
          if (distSwSq < maxInfluence * maxInfluence) {
            const distSw = Math.sqrt(distSwSq);
            if (Math.abs(distSw - sw.radius) < pushDist) {
              const force = (pushDist - Math.abs(distSw - sw.radius)) / pushDist;
              const multiplier = sw.type === 'push' ? 10 : -15;
              const pushX = (dxSw / distSw) * force * multiplier * sw.life;
              const pushY = (dySw / distSw) * force * multiplier * sw.life;
              node.x += pushX;
              node.y += pushY;
            }
          }
        });

        // Portal Effect (Wrapping)
        if (node.x < -50) node.x = canvas.width + 50;
        if (node.x > canvas.width + 50) node.x = -50;
        if (node.y < -50) node.y = canvas.height + 50;
        if (node.y > canvas.height + 50) node.y = -50;

        // Target Movement (Shortest Path in Wrapped Space)
        let dxTarget = node.targetX - node.x;
        if (dxTarget > canvas.width / 2) dxTarget -= canvas.width;
        if (dxTarget < -canvas.width / 2) dxTarget += canvas.width;
        
        let dyTarget = node.targetY - node.y;
        if (dyTarget > canvas.height / 2) dyTarget -= canvas.height;
        if (dyTarget < -canvas.height / 2) dyTarget += canvas.height;

        node.x += dxTarget * node.ease;
        node.y += dyTarget * node.ease;
        
        if (accentColor === 'arcane-void-purple') {
          // Orbiting / Swirling motion
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const dxCenter = node.x - cx;
          const dyCenter = node.y - cy;
          const angleToCenter = Math.atan2(dyCenter, dxCenter);
          
          // Smooth orbiting motion
          const orbitRadius = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
          const orbitSpeed = 1 / (orbitRadius * 0.05 + 10);
          node.x -= Math.cos(angleToCenter) * 0.2; // Gentle pull
          node.y -= Math.sin(angleToCenter) * 0.2;
          node.x += Math.cos(angleToCenter + Math.PI / 2) * orbitSpeed * 50;
          node.y += Math.sin(angleToCenter + Math.PI / 2) * orbitSpeed * 50;
        } else if (accentColor === 'arcane-solar-flare') {
          // Boiling plasma motion - using sine instead of random for smoothness
          node.x += Math.sin(time * 5 + i) * 1.5;
          node.y += Math.cos(time * 4 + i * 0.5) * 1.5;
        } else {
          node.x += Math.sin(time + i) * 0.2;
          node.y += Math.cos(time + i) * 0.2;
        }

        const distToTargetSq = dxTarget * dxTarget + dyTarget * dyTarget;
        if (distToTargetSq < 400) { // 20 * 20
          node.targetX = Math.random() * canvas.width;
          node.targetY = Math.random() * canvas.height;
        }

        node.pulse += node.pulseSpeed;
        const currentOpacity = 0.3 + Math.sin(node.pulse) * 0.15;
        const currentSize = accentColor === 'arcane-solar-flare' ? node.size * (1 + Math.sin(node.pulse * 2) * 0.2) : node.size;

        // Draw connections based on theme
        const maxConnections = uiCustomizationRef.current?.optimizationMode ? 2 : (uiCustomizationRef.current?.particleMaxConnections ?? 3);
        const baseMaxDist = accentColor === 'arcane-red' ? 180 : (accentColor === 'arcane-blue' ? 120 : (accentColor === 'arcane-gold' ? 200 : (accentColor === 'arcane-neon-pink' ? 160 : (accentColor === 'arcane-plasma-cyan' ? 140 : (accentColor === 'arcane-void-purple' ? 160 : (accentColor === 'arcane-solar-flare' ? 140 : 150))))));
        let maxDist = uiCustomizationRef.current?.particleConnectionDistance ?? baseMaxDist;
        if (uiCustomizationRef.current?.optimizationMode) {
          maxDist = Math.min(maxDist, 100);
        }
        const maxDistSq = maxDist * maxDist;
        const reduceLag = uiCustomizationRef.current?.particleReduceLag ?? false;

        if (!reduceLag) {
          let connections = 0;
          for (let j = i + 1; j < nodes.length; j++) {
            if (connections >= maxConnections) break;
            const other = nodes[j];
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < maxDistSq) {
              connections++;
              const dist = Math.sqrt(distSq);
              ctx.beginPath();
              
              if (accentColor === 'arcane-red') {
              const midX = (node.x + other.x) / 2 + Math.sin(time + i) * 30;
              const midY = (node.y + other.y) / 2 + Math.cos(time + j) * 30;
              ctx.moveTo(node.x, node.y);
              ctx.quadraticCurveTo(midX, midY, other.x, other.y);
              ctx.strokeStyle = node.color === '#f59e0b' ? '#f59e0b' : '#991b1b';
              ctx.lineWidth = 0.8;
            } else if (accentColor === 'arcane-blue') {
              // Digital/Grid
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = node.color === '#06b6d4' ? '#06b6d4' : '#1e40af';
              ctx.lineWidth = 1.2;
            } else if (accentColor === 'arcane-gold') {
              // Mechanical/Thin
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(180, 83, 9, 0.2)';
              ctx.lineWidth = 0.5;
            } else if (accentColor === 'arcane-green') {
              // Toxic/Wavy
              const midX = (node.x + other.x) / 2 + Math.sin(time * 2 + i) * 20;
              const midY = (node.y + other.y) / 2 + Math.cos(time * 2 + j) * 20;
              ctx.moveTo(node.x, node.y);
              ctx.quadraticCurveTo(midX, midY, other.x, other.y);
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 0.4;
            } else if (accentColor === 'arcane-neon-pink') {
              // Cyberpunk/Glitchy
              const glitchX = Math.random() > 0.9 ? (Math.random() - 0.5) * 30 : 0;
              const glitchY = Math.random() > 0.9 ? (Math.random() - 0.5) * 30 : 0;
              ctx.moveTo(node.x + glitchX, node.y + glitchY);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = Math.random() > 0.5 ? '#ff00ff' : '#00ffff';
              ctx.lineWidth = 1.5;
            } else if (accentColor === 'arcane-plasma-cyan') {
              // Plasma/Laser
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = '#00ffff';
              ctx.lineWidth = 2;
            } else if (accentColor === 'arcane-void-purple') {
              // Gravity Lensing (Curved lines) - Optimized
              const midX = (node.x + other.x) * 0.5;
              const midY = (node.y + other.y) * 0.5;
              const cx = canvas.width * 0.5;
              const cy = canvas.height * 0.5;
              const pullX = (cx - midX) * 0.15;
              const pullY = (cy - midY) * 0.15;
              ctx.moveTo(node.x, node.y);
              ctx.quadraticCurveTo(midX + pullX, midY + pullY, other.x, other.y);
              ctx.strokeStyle = isDark ? '#8e2de2' : '#4a00e0';
              ctx.lineWidth = 1.0;
            } else if (accentColor === 'arcane-solar-flare') {
              // Jagged Plasma Arcs - Optimized (No Math.random)
              const midX = (node.x + other.x) * 0.5 + Math.sin(time * 10 + i) * 10;
              const midY = (node.y + other.y) * 0.5 + Math.cos(time * 10 + j) * 10;
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(midX, midY);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = (i + j) % 2 === 0 ? '#ffaa00' : '#ff3300';
              ctx.lineWidth = 1.2;
            } else {
              // Glitchy/Straight
              const glitch = Math.random() > 0.99 ? (Math.random() - 0.5) * 20 : 0;
              ctx.moveTo(node.x + glitch, node.y + glitch);
              ctx.lineTo(other.x, other.y);
              const isCyan = node.color === '#06b6d4' || other.color === '#06b6d4';
              const isAmber = node.color === '#f59e0b' || other.color === '#f59e0b';
              ctx.strokeStyle = isAmber ? '#f59e0b' : (isCyan ? '#06b6d4' : '#8a2be2');
              ctx.lineWidth = 1.0;
            }
            
            ctx.globalAlpha = (1 - dist / maxDist) * 0.7 * currentOpacity;
            ctx.stroke();
          }
        }
      }

        // Draw node
        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.rotate(node.angle + time * (node.rotationSpeed || 0.01));
        
        ctx.beginPath();
        if (node.type === 'hexagon') {
          const sides = 6;
          const size = currentSize * 1.5;
          for (let s = 0; s <= sides; s++) {
            const angle = (s * 2 * Math.PI) / sides;
            ctx.lineTo(size * Math.cos(angle), size * Math.sin(angle));
          }
        } else if (node.type === 'diamond') {
          const size = currentSize * 1.5;
          ctx.moveTo(0, -size);
          ctx.lineTo(size * 0.7, 0);
          ctx.lineTo(0, size);
          ctx.lineTo(-size * 0.7, 0);
          ctx.closePath();
        } else if (node.type === 'gear') {
          const teeth = 8;
          const rInner = currentSize * 0.7;
          const rOuter = currentSize * 1.2;
          for (let t = 0; t < teeth * 2; t++) {
            const angle = (t * Math.PI) / teeth;
            const r = t % 2 === 0 ? rOuter : rInner;
            ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
          }
          ctx.closePath();
        } else if (node.type === 'bubble') {
          ctx.rect(-currentSize, -currentSize, currentSize * 2, currentSize * 2);
        } else if (node.type === 'triangle') {
          const size = currentSize * 1.8;
          ctx.moveTo(0, -size);
          ctx.lineTo(size * 0.866, size * 0.5);
          ctx.lineTo(-size * 0.866, size * 0.5);
          ctx.closePath();
        } else if (node.type === 'cross') {
          const size = currentSize * 1.5;
          const w = size * 0.3;
          ctx.moveTo(-w, -size);
          ctx.lineTo(w, -size);
          ctx.lineTo(w, -w);
          ctx.lineTo(size, -w);
          ctx.lineTo(size, w);
          ctx.lineTo(w, w);
          ctx.lineTo(w, size);
          ctx.lineTo(-w, size);
          ctx.lineTo(-w, w);
          ctx.lineTo(-size, w);
          ctx.lineTo(-size, -w);
          ctx.lineTo(-w, -w);
          ctx.closePath();
        } else if (node.type === 'star') {
          const spikes = 5;
          const outerRadius = currentSize * 1.5;
          const innerRadius = currentSize * 0.7;
          ctx.shadowBlur = 15;
          ctx.shadowColor = isDark ? '#8e2de2' : '#4a00e0';
          for (let j = 0; j < spikes * 2; j++) {
            const radius = j % 2 === 0 ? outerRadius : innerRadius;
            const angle = (j * Math.PI) / spikes;
            if (j === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
          ctx.closePath();
        } else if (node.type === 'flare') {
          const spikes = 8;
          const outerRadius = currentSize * 2 + Math.random() * 2; // Flicker
          const innerRadius = currentSize * 0.5;
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#ff3300';
          for (let j = 0; j < spikes * 2; j++) {
            const radius = j % 2 === 0 ? outerRadius : innerRadius;
            const angle = (j * Math.PI) / spikes;
            if (j === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
          ctx.closePath();
        } else {
          // Default/Organic
          const distortion = accentColor === 'arcane-red' ? Math.sin(time * 5 + i) * 2 : (accentColor === 'arcane-void-purple' ? Math.sin(time * 3 + i) * 3 : (accentColor === 'arcane-solar-flare' ? Math.cos(time * 8 + i) * 4 : 0));
          ctx.arc(0, 0, Math.max(0, node.size + distortion), 0, Math.PI * 2);
        }
        
        ctx.fillStyle = node.color;
        ctx.globalAlpha = currentOpacity;
        ctx.fill();
        
        if (node.color === '#f59e0b' && Math.random() > 0.98) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#f59e0b';
          ctx.fill();
        }
        ctx.restore();
      });

      // Subtle Floating Particles (Constellations)
      ctx.globalAlpha = isDark ? 0.1 : 0.15;
      const particleColor = getArcaneColor(accentColor, 'particle');
      for (let i = 0; i < 20; i++) {
        const px = (Math.sin(time * 0.1 + i * 1.5) * 0.4 + 0.5) * canvas.width;
        const py = (Math.cos(time * 0.08 + i * 2.2) * 0.4 + 0.5) * canvas.height;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, [accentColor, isDark, uiCustomization?.particleCount, uiCustomization?.particleMaxSize]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

const PerformanceShapes = ({ accentColor, isDark }: { accentColor: string, isDark: boolean }) => {
  const getGlowColor = () => {
    switch (accentColor) {
      case 'arcane-red': return isDark ? 'rgba(239, 68, 68, 0.6)' : 'rgba(220, 38, 38, 0.4)';
      case 'arcane-blue': return isDark ? 'rgba(59, 130, 246, 0.6)' : 'rgba(37, 99, 235, 0.4)';
      case 'arcane-gold': return isDark ? 'rgba(245, 158, 11, 0.6)' : 'rgba(217, 119, 6, 0.4)';
      case 'arcane-green': return isDark ? 'rgba(16, 185, 129, 0.6)' : 'rgba(5, 150, 105, 0.4)';
      case 'arcane-neon-pink': return isDark ? 'rgba(255, 0, 255, 0.6)' : 'rgba(255, 0, 255, 0.4)';
      case 'arcane-plasma-cyan': return isDark ? 'rgba(0, 255, 255, 0.6)' : 'rgba(0, 255, 255, 0.4)';
      case 'arcane-void-purple': return isDark ? 'rgba(142, 45, 226, 0.6)' : 'rgba(74, 0, 224, 0.4)';
      case 'arcane-solar-flare': return isDark ? 'rgba(255, 170, 0, 0.6)' : 'rgba(255, 51, 0, 0.4)';
      default: return isDark ? 'rgba(138, 43, 226, 0.6)' : 'rgba(124, 58, 237, 0.4)';
    }
  };

  const glow = getGlowColor();

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      <motion.div
        animate={{
          y: [0, -30, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-96 h-96 flex items-center justify-center"
      >
        {/* Main Shape */}
        <div 
          className={`w-40 h-40 border-2 transition-all duration-1000`}
          style={{ 
            borderColor: glow,
            boxShadow: `0 0 50px ${glow}, inset 0 0 25px ${glow}`,
            clipPath: 
              accentColor === 'arcane-violet' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' :
              accentColor === 'arcane-blue' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
              accentColor === 'arcane-gold' ? 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)' :
              accentColor === 'arcane-neon-pink' ? 'polygon(0 0, 100% 20%, 80% 100%, 20% 80%)' :
              accentColor === 'arcane-plasma-cyan' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' :
              'none',
            borderRadius: accentColor === 'arcane-red' || accentColor === 'arcane-green' ? '50%' : '0%'
          }}
        />
        
        {/* Secondary Orbiting Shape */}
        <motion.div
          animate={{
            x: [70, 100, 70],
            y: [-70, -100, -70],
            scale: [1, 1.1, 1],
            rotate: [0, -20, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-20 h-20 border transition-all duration-1000"
          style={{ 
            borderColor: glow,
            opacity: 0.7,
            boxShadow: `0 0 30px ${glow}`,
            clipPath: 
              accentColor === 'arcane-violet' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' :
              accentColor === 'arcane-blue' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
              accentColor === 'arcane-gold' ? 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)' :
              accentColor === 'arcane-neon-pink' ? 'polygon(0 0, 100% 20%, 80% 100%, 20% 80%)' :
              accentColor === 'arcane-plasma-cyan' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' :
              'none',
            borderRadius: accentColor === 'arcane-red' || accentColor === 'arcane-green' ? '50%' : '0%'
          }}
        />
      </motion.div>
    </div>
  );
};

const ArcaneBackground = ({ performanceMode, accentColor, isDark, isHome, uiCustomization }: { performanceMode: boolean, accentColor: AccentColor, isDark: boolean, isHome: boolean, uiCustomization?: UICustomization }) => {
  const arcane = getArcaneStyles(accentColor);
  
  return (
    <div className={`absolute inset-0 z-[-10] overflow-hidden opacity-0 group-[.visual-arcane]/arcane:opacity-100 transition-opacity duration-1000 ${isDark ? 'bg-[#020205]' : 'bg-[#f8f7ff]'}`}>
      
      {/* Performance Mode Fallback - Unique Static Designs per Accent */}
      <div className={`static-fallback absolute inset-0 transition-colors duration-1000 ${
        accentColor === 'arcane-red' ? (isDark ? 'bg-[#0a0202]' : 'bg-[#fff5f5]') : 
        accentColor === 'arcane-blue' ? (isDark ? 'bg-[#02050a]' : 'bg-[#f0f7ff]') : 
        accentColor === 'arcane-gold' ? (isDark ? 'bg-[#0a0500]' : 'bg-[#fffdf0]') : 
        accentColor === 'arcane-green' ? (isDark ? 'bg-[#020a05]' : 'bg-[#f0fff4]') : 
        accentColor === 'arcane-neon-pink' ? (isDark ? 'bg-[#0a000a]' : 'bg-[#fff0ff]') : 
        accentColor === 'arcane-plasma-cyan' ? (isDark ? 'bg-[#000a0a]' : 'bg-[#f0ffff]') : 
        accentColor === 'arcane-void-purple' ? (isDark ? 'bg-[#05000a]' : 'bg-[#f5f0ff]') :
        accentColor === 'arcane-solar-flare' ? (isDark ? 'bg-[#0a0500]' : 'bg-[#fff5f0]') :
        (isDark ? 'bg-[#020205]' : 'bg-[#f8f7ff]')
      }`}>
        {/* Static Atmospheric Layers */}
        <div className={`absolute inset-0 opacity-30 ${
          accentColor === 'arcane-red' ? 'bg-[radial-gradient(circle_at_20%_30%,_rgba(239,68,68,0.2)_0%,_transparent_50%),_radial-gradient(circle_at_80%_70%,_rgba(153,27,27,0.15)_0%,_transparent_60%)]' :
          accentColor === 'arcane-blue' ? 'bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.15)_0%,_transparent_70%),_linear-gradient(rgba(59,130,246,0.05)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(59,130,246,0.05)_1px,_transparent_1px)] bg-[size:100%_100%,_40px_40px,_40px_40px]' :
          accentColor === 'arcane-gold' ? 'bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.15)_0%,_transparent_70%),_repeating-radial-gradient(circle_at_center,_rgba(245,158,11,0.05)_0,_rgba(245,158,11,0.05)_2px,_transparent_2px,_transparent_60px)]' :
          accentColor === 'arcane-green' ? 'bg-[radial-gradient(circle_at_30%_40%,_rgba(16,185,129,0.2)_0%,_transparent_50%),_radial-gradient(circle_at_70%_60%,_rgba(6,95,70,0.15)_0%,_transparent_50%)]' :
          accentColor === 'arcane-neon-pink' ? 'bg-[radial-gradient(circle_at_20%_30%,_rgba(255,0,255,0.2)_0%,_transparent_50%),_radial-gradient(circle_at_80%_70%,_rgba(0,255,255,0.15)_0%,_transparent_60%)]' :
          accentColor === 'arcane-plasma-cyan' ? 'bg-[radial-gradient(circle_at_50%_50%,_rgba(0,255,255,0.15)_0%,_transparent_70%),_linear-gradient(rgba(0,255,255,0.05)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(0,255,255,0.05)_1px,_transparent_1px)] bg-[size:100%_100%,_40px_40px,_40px_40px]' :
          accentColor === 'arcane-void-purple' ? 'bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.1)_0%,_transparent_80%),_conic-gradient(from_0deg_at_50%_50%,_rgba(79,70,229,0.05),_transparent)]' :
          accentColor === 'arcane-solar-flare' ? 'bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.2)_0%,_transparent_60%),_repeating-conic-gradient(from_0deg_at_50%_50%,_rgba(249,115,22,0.05)_0deg_10deg,_transparent_10deg_20deg)]' :
          'bg-[radial-gradient(circle_at_20%_30%,_rgba(138,43,226,0.15)_0%,_transparent_50%),_radial-gradient(circle_at_80%_70%,_rgba(99,102,241,0.1)_0%,_transparent_50%)]'
        }`} />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)] pointer-events-none" />
        
        {/* Dynamic Performance Shapes */}
        {performanceMode && <PerformanceShapes accentColor={accentColor} isDark={isDark} />}
      </div>

      {/* Atmospheric Shifting Waves (CSS Layer) */}
      {!performanceMode && (
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_50%)] animate-[spin_120s_linear_infinite] ${
            accentColor === 'arcane-red' ? (isDark ? 'bg-[rgba(239,68,68,0.05)]' : 'bg-[rgba(239,68,68,0.1)]') : 
            accentColor === 'arcane-blue' ? (isDark ? 'bg-[rgba(59,130,246,0.05)]' : 'bg-[rgba(59,130,246,0.1)]') : 
            accentColor === 'arcane-gold' ? (isDark ? 'bg-[rgba(245,158,11,0.05)]' : 'bg-[rgba(245,158,11,0.1)]') : 
            accentColor === 'arcane-green' ? (isDark ? 'bg-[rgba(16,185,129,0.05)]' : 'bg-[rgba(16,185,129,0.1)]') : 
            accentColor === 'arcane-neon-pink' ? (isDark ? 'bg-[rgba(255,0,255,0.05)]' : 'bg-[rgba(255,0,255,0.1)]') : 
            accentColor === 'arcane-plasma-cyan' ? (isDark ? 'bg-[rgba(0,255,255,0.05)]' : 'bg-[rgba(0,255,255,0.1)]') : 
            accentColor === 'arcane-void-purple' ? (isDark ? 'bg-[rgba(79,70,229,0.05)]' : 'bg-[rgba(79,70,229,0.1)]') :
            accentColor === 'arcane-solar-flare' ? (isDark ? 'bg-[rgba(249,115,22,0.05)]' : 'bg-[rgba(249,115,22,0.1)]') : ''
          }`} />
          <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(138,43,226,0.03)_0%,_transparent_60%)] animate-[spin_180s_linear_infinite_reverse] ${
            accentColor === 'arcane-red' ? (isDark ? 'bg-[rgba(153,27,27,0.03)]' : 'bg-[rgba(153,27,27,0.06)]') : 
            accentColor === 'arcane-blue' ? (isDark ? 'bg-[rgba(30,64,175,0.03)]' : 'bg-[rgba(30,64,175,0.06)]') : 
            accentColor === 'arcane-gold' ? (isDark ? 'bg-[rgba(180,83,9,0.03)]' : 'bg-[rgba(180,83,9,0.06)]') : 
            accentColor === 'arcane-green' ? (isDark ? 'bg-[rgba(6,95,70,0.03)]' : 'bg-[rgba(6,95,70,0.06)]') : 
            accentColor === 'arcane-neon-pink' ? (isDark ? 'bg-[rgba(153,0,153,0.03)]' : 'bg-[rgba(153,0,153,0.06)]') : 
            accentColor === 'arcane-plasma-cyan' ? (isDark ? 'bg-[rgba(0,153,153,0.03)]' : 'bg-[rgba(0,153,153,0.06)]') : 
            accentColor === 'arcane-void-purple' ? (isDark ? 'bg-[rgba(49,46,129,0.03)]' : 'bg-[rgba(49,46,129,0.06)]') :
            accentColor === 'arcane-solar-flare' ? (isDark ? 'bg-[rgba(124,45,18,0.03)]' : 'bg-[rgba(124,45,18,0.06)]') : ''
          }`} />
        </div>
      )}

      {/* Arcane Canvas Logic */}
      {!performanceMode && <ArcaneCanvas accentColor={accentColor} isDark={isDark} isHome={isHome} uiCustomization={uiCustomization} />}
      
      {/* Overlay Grain / Noise for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aWNoVGlsZXM9InN0aWNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIvPjwvc3ZnPg==')]" />
    </div>
  );
};

const TreeFort = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 800 1000" className={className} preserveAspectRatio="xMidYMax meet">
    <g>
      {/* Background Leaves */}
      <circle cx="400" cy="350" r="250" fill="#4CAF50" stroke="#1B5E20" strokeWidth="10" />
      <circle cx="250" cy="450" r="180" fill="#4CAF50" stroke="#1B5E20" strokeWidth="10" />
      <circle cx="550" cy="450" r="180" fill="#4CAF50" stroke="#1B5E20" strokeWidth="10" />
      <circle cx="400" cy="200" r="150" fill="#4CAF50" stroke="#1B5E20" strokeWidth="10" />
      
      {/* Trunk */}
      <path d="M 320 1000 Q 350 700 350 500 L 450 500 Q 450 700 480 1000 Z" fill="#795548" stroke="#3E2723" strokeWidth="10" />
      <path d="M 350 500 Q 300 400 200 350 L 220 320 Q 320 380 380 500 Z" fill="#795548" stroke="#3E2723" strokeWidth="10" />
      <path d="M 450 500 Q 500 400 600 350 L 580 320 Q 480 380 420 500 Z" fill="#795548" stroke="#3E2723" strokeWidth="10" />

      {/* Main House Structure */}
      <rect x="300" y="450" width="200" height="150" rx="20" fill="#FFB74D" stroke="#E65100" strokeWidth="10" />
      <rect x="320" y="480" width="50" height="50" rx="25" fill="#81D4FA" stroke="#01579B" strokeWidth="8" />
      <rect x="430" y="480" width="50" height="50" rx="25" fill="#81D4FA" stroke="#01579B" strokeWidth="8" />
      <path d="M 380 600 L 420 600 L 420 550 Q 400 530 380 550 Z" fill="#8D6E63" stroke="#3E2723" strokeWidth="8" />
      
      {/* Boat on Top */}
      <path d="M 320 450 L 480 450 L 500 400 L 300 400 Z" fill="#D7CCC8" stroke="#4E342E" strokeWidth="10" />
      <rect x="380" y="350" width="40" height="50" fill="#FFB74D" stroke="#E65100" strokeWidth="8" />
      
      {/* Telescope */}
      <path d="M 420 380 L 550 320 L 560 340 L 430 400 Z" fill="#B0BEC5" stroke="#263238" strokeWidth="8" />
      <circle cx="560" cy="330" r="15" fill="#81D4FA" stroke="#01579B" strokeWidth="6" />
      
      {/* Banner/Flag */}
      <path d="M 380 350 L 380 250 L 300 280 L 380 310" fill="#EF5350" stroke="#b71c1c" strokeWidth="6" />
      
      {/* Foreground Leaves */}
      <circle cx="300" cy="550" r="80" fill="#66BB6A" stroke="#1B5E20" strokeWidth="8" />
      <circle cx="500" cy="550" r="80" fill="#66BB6A" stroke="#1B5E20" strokeWidth="8" />
      <circle cx="400" cy="650" r="60" fill="#66BB6A" stroke="#1B5E20" strokeWidth="8" />
      
      {/* Ladder */}
      <path d="M 400 600 L 400 1000 M 420 600 L 420 1000" stroke="#5D4037" strokeWidth="8" />
      <path d="M 400 650 L 420 650 M 400 700 L 420 700 M 400 750 L 420 750 M 400 800 L 420 800 M 400 850 L 420 850 M 400 900 L 420 900 M 400 950 L 420 950" stroke="#5D4037" strokeWidth="8" />
    </g>
  </svg>
);

const FinnCharacter = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 400" className={className}>
    {/* Backpack */}
    <rect x="40" y="120" width="120" height="100" rx="30" fill="#8BC34A" stroke="#1B5E20" strokeWidth="8" />
    <rect x="40" y="120" width="120" height="50" rx="25" fill="#7CB342" stroke="#1B5E20" strokeWidth="8" />
    
    {/* Legs */}
    <rect x="70" y="250" width="15" height="80" fill="#FFCCBC" stroke="#000" strokeWidth="6" />
    <rect x="115" y="250" width="15" height="80" fill="#FFCCBC" stroke="#000" strokeWidth="6" />
    
    {/* Socks */}
    <rect x="68" y="300" width="19" height="30" fill="#FFF" stroke="#000" strokeWidth="6" />
    <rect x="113" y="300" width="19" height="30" fill="#FFF" stroke="#000" strokeWidth="6" />
    
    {/* Shoes */}
    <path d="M 60 330 L 90 330 Q 90 350 75 350 Q 60 350 60 330 Z" fill="#000" />
    <path d="M 110 330 L 140 330 Q 140 350 125 350 Q 110 350 110 330 Z" fill="#000" />
    
    {/* Shorts */}
    <path d="M 60 220 L 140 220 L 145 270 L 105 270 L 100 240 L 95 270 L 55 270 Z" fill="#1565C0" stroke="#000" strokeWidth="6" strokeLinejoin="round" />
    
    {/* Shirt */}
    <rect x="65" y="130" width="70" height="100" rx="10" fill="#64B5F6" stroke="#000" strokeWidth="6" />
    <path d="M 65 130 L 40 180 L 60 190 L 65 160 Z" fill="#64B5F6" stroke="#000" strokeWidth="6" strokeLinejoin="round" />
    <path d="M 135 130 L 160 180 L 140 190 L 135 160 Z" fill="#64B5F6" stroke="#000" strokeWidth="6" strokeLinejoin="round" />
    
    {/* Arms */}
    <g>
      <path d="M 45 180 Q 30 230 40 260" fill="none" stroke="#000" strokeWidth="18" strokeLinecap="round" />
      <path d="M 45 180 Q 30 230 40 260" fill="none" stroke="#FFCCBC" strokeWidth="12" strokeLinecap="round" />
    </g>
    <g>
      <path d="M 155 180 Q 170 230 160 260" fill="none" stroke="#000" strokeWidth="18" strokeLinecap="round" />
      <path d="M 155 180 Q 170 230 160 260" fill="none" stroke="#FFCCBC" strokeWidth="12" strokeLinecap="round" />
    </g>
    
    {/* Hat */}
    <rect x="60" y="40" width="80" height="100" rx="40" fill="#FFF" stroke="#000" strokeWidth="6" />
    <path d="M 60 80 Q 40 40 60 30 Q 80 20 80 50 Z" fill="#FFF" stroke="#000" strokeWidth="6" />
    <path d="M 140 80 Q 160 40 140 30 Q 120 20 120 50 Z" fill="#FFF" stroke="#000" strokeWidth="6" />
    
    {/* Face hole */}
    <rect x="75" y="70" width="50" height="40" rx="20" fill="#FFCCBC" stroke="#000" strokeWidth="4" />
    
    {/* Eyes */}
    <circle cx="90" cy="85" r="3" fill="#000" />
    <circle cx="110" cy="85" r="3" fill="#000" />
    
    {/* Mouth */}
    <path d="M 90 95 Q 100 105 110 95" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const JakeCharacter = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 200 300" className={className} style={style}>
    {/* Legs */}
    <g stroke="#000" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M 75 215 L 75 270 L 85 270" />
      <path d="M 125 215 L 125 270 L 135 270" />
    </g>
    <g stroke="#FFB900" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M 75 215 L 75 270 L 85 270" />
      <path d="M 125 215 L 125 270 L 135 270" />
    </g>
    
    {/* Arms */}
    <g stroke="#000" strokeWidth="18" strokeLinecap="round" fill="none">
      <path d="M 40 160 Q 10 180 25 220" />
      <path d="M 160 160 Q 190 180 175 220" />
    </g>
    <g stroke="#FFB900" strokeWidth="10" strokeLinecap="round" fill="none">
      <path d="M 40 160 Q 10 180 25 220" />
      <path d="M 160 160 Q 190 180 175 220" />
    </g>
    
    {/* Ears */}
    <g stroke="#000" strokeWidth="18" strokeLinecap="round" fill="none">
      <path d="M 55 90 Q 20 90 30 140" />
      <path d="M 145 90 Q 180 90 170 140" />
    </g>
    <g stroke="#FFB900" strokeWidth="10" strokeLinecap="round" fill="none">
      <path d="M 55 90 Q 20 90 30 140" />
      <path d="M 145 90 Q 180 90 170 140" />
    </g>
    
    {/* Body */}
    <rect x="40" y="70" width="120" height="150" rx="60" fill="#FFB900" stroke="#000" strokeWidth="8" />
    
    {/* Eyes */}
    <circle cx="75" cy="115" r="22" fill="#FFF" stroke="#000" strokeWidth="6" />
    <circle cx="125" cy="115" r="22" fill="#FFF" stroke="#000" strokeWidth="6" />
    
    {/* Pupils */}
    <circle cx="82" cy="115" r="5" fill="#000" />
    <circle cx="118" cy="115" r="5" fill="#000" />
    
    {/* Jowls (Muzzle) */}
    <path d="M 100 135 C 70 135, 60 160, 75 175 C 85 185, 95 170, 100 155 C 105 170, 115 185, 125 175 C 140 160, 130 135, 100 135 Z" fill="#FFB900" stroke="#000" strokeWidth="6" strokeLinejoin="round" />
    
    {/* Nose */}
    <ellipse cx="100" cy="128" rx="14" ry="9" fill="#000" />
  </svg>
);

const FinnClickOverlay = () => {
  const [clicks, setClicks] = useState<{id: number, x: number, y: number, rotation: number, text: string}[]>([]);

  useEffect(() => {
    const texts = ['MATH!', 'ALGEBRAIC!', 'RHOMBUS!', 'BAM!', 'SHMOWZOW!'];
    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
      
      const newClick = { 
        id: Date.now(), 
        x: e.clientX, 
        y: e.clientY, 
        rotation: Math.random() * 60 - 30,
        text: texts[Math.floor(Math.random() * texts.length)]
      };
      setClicks(prev => [...prev, newClick]);
      
      setTimeout(() => {
        setClicks(prev => prev.filter(c => c.id !== newClick.id));
      }, 800);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 50 }}>
      <AnimatePresence>
        {clicks.map(click => (
          <motion.div
            key={click.id}
            initial={{ opacity: 1, scale: 0.5, rotate: click.rotation - 20 }}
            animate={{ opacity: 0, scale: 1.5, rotate: click.rotation }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute flex items-center justify-center"
            style={{ left: click.x, top: click.y, x: '-50%', y: '-50%' }}
          >
            <svg width="120" height="120" viewBox="0 0 120 120" className="absolute">
              <path d="M 60 0 L 70 45 L 120 60 L 70 75 L 60 120 L 50 75 L 0 60 L 50 45 Z" fill="#FFF" stroke="#00A2E8" strokeWidth="6" strokeLinejoin="round" />
              <circle cx="60" cy="60" r="30" fill="none" stroke="#FFD700" strokeWidth="4" strokeDasharray="10 10" />
            </svg>
            <div className="relative font-black text-white text-2xl italic tracking-wider" style={{ textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', WebkitTextStroke: '1px black' }}>
              {click.text}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const JakeStretchOverlayInner = ({ activeClick }: { activeClick: {x: number, y: number} }) => {
  const xTarget = useMotionValue(activeClick.x);
  const yTarget = useMotionValue(activeClick.y);

  const springConfig = { stiffness: 150, damping: 20, mass: 1 };
  
  const x9 = useSpring(xTarget, springConfig);
  const y9 = useSpring(yTarget, springConfig);
  
  const x8 = useSpring(x9, springConfig);
  const y8 = useSpring(y9, springConfig);
  
  const x7 = useSpring(x8, springConfig);
  const y7 = useSpring(y8, springConfig);
  
  const x6 = useSpring(x7, springConfig);
  const y6 = useSpring(y7, springConfig);
  
  const x5 = useSpring(x6, springConfig);
  const y5 = useSpring(y6, springConfig);
  
  const x4 = useSpring(x5, springConfig);
  const y4 = useSpring(y5, springConfig);
  
  const x3 = useSpring(x4, springConfig);
  const y3 = useSpring(y4, springConfig);
  
  const x2 = useSpring(x3, springConfig);
  const y2 = useSpring(y3, springConfig);
  
  const x1 = useSpring(x2, springConfig);
  const y1 = useSpring(y2, springConfig);
  
  const x0 = useSpring(x1, springConfig);
  const y0 = useSpring(y1, springConfig);

  const lastAngleRef = useRef(0);

  useEffect(() => {
    xTarget.set(activeClick.x);
    yTarget.set(activeClick.y);
  }, [activeClick, xTarget, yTarget]);

  const pathD = useTransform(
    [x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6, x7, y7, x8, y8, x9, y9],
    (values) => {
      const [vx0, vy0, vx1, vy1, vx2, vy2, vx3, vy3, vx4, vy4, vx5, vy5, vx6, vy6, vx7, vy7, vx8, vy8, vx9, vy9] = values as number[];
      let d = `M ${vx0} ${vy0}`;
      const pts = [
        {x: vx0, y: vy0}, {x: vx1, y: vy1}, {x: vx2, y: vy2},
        {x: vx3, y: vy3}, {x: vx4, y: vy4}, {x: vx5, y: vy5},
        {x: vx6, y: vy6}, {x: vx7, y: vy7}, {x: vx8, y: vy8}, {x: vx9, y: vy9}
      ];
      for (let i = 1; i < pts.length - 1; i++) {
        if (i === pts.length - 2) {
          d += ` Q ${pts[i].x} ${pts[i].y} ${pts[i+1].x} ${pts[i+1].y}`;
        } else {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          d += ` Q ${pts[i].x} ${pts[i].y} ${xc} ${yc}`;
        }
      }
      return d;
    }
  );

  const angle = useTransform([x8, y8, x9, y9], (values) => {
    const [vx8, vy8, vx9, vy9] = values as number[];
    const dx = vx9 - vx8;
    const dy = vy9 - vy8;
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      lastAngleRef.current = Math.atan2(dy, dx) * (180 / Math.PI);
    }
    return lastAngleRef.current;
  });

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 50 }}>
      {/* Body Outline */}
      <motion.path
        d={pathD}
        stroke="#000" strokeWidth="32" strokeLinecap="round" fill="none"
      />
      {/* Body Fill */}
      <motion.path
        d={pathD}
        stroke="#FFB900" strokeWidth="24" strokeLinecap="round" fill="none"
      />
      
      {/* Tail */}
      <motion.g style={{ x: x0, y: y0 }}>
        <circle cx="0" cy="0" r="16" fill="#FFB900" stroke="#000" strokeWidth="4" />
        <path d="M -16 0 C -24 -9, -24 9, -18 3" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" />
      </motion.g>

      {/* Head */}
      <motion.g style={{ x: x9, y: y9, rotate: angle }}>
        {/* Ears */}
        <path d="M -9 -12 Q -18 -18 -12 -24" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" />
        <path d="M -9 -12 Q -18 -18 -12 -24" fill="none" stroke="#FFB900" strokeWidth="4" strokeLinecap="round" />
        <path d="M -9 12 Q -18 18 -12 24" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" />
        <path d="M -9 12 Q -18 18 -12 24" fill="none" stroke="#FFB900" strokeWidth="4" strokeLinecap="round" />
        
        {/* Head Base */}
        <circle cx="0" cy="0" r="20" fill="#FFB900" stroke="#000" strokeWidth="4" />
        
        {/* Eyes */}
        <circle cx="7" cy="-8" r="7" fill="#FFF" stroke="#000" strokeWidth="2.5" />
        <circle cx="7" cy="8" r="7" fill="#FFF" stroke="#000" strokeWidth="2.5" />
        
        {/* Pupils */}
        <circle cx="9" cy="-8" r="2.5" fill="#000" />
        <circle cx="9" cy="8" r="2.5" fill="#000" />
        
        {/* Jowls */}
        <path d="M 9 -6 C 21 -9, 27 -3, 21 0 C 27 3, 21 9, 9 6 Z" fill="#FFB900" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
        
        {/* Nose */}
        <ellipse cx="19" cy="0" rx="4" ry="5.5" fill="#000" />
      </motion.g>
    </svg>
  );
};

const JakeStretchOverlay = () => {
  const [activeClick, setActiveClick] = useState<{x: number, y: number} | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
      setActiveClick({ x: e.clientX, y: e.clientY });
      setLastClickTime(Date.now());
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (!activeClick) return;
    const timer = setTimeout(() => setActiveClick(null), 8000);
    return () => clearTimeout(timer);
  }, [activeClick, lastClickTime]);

  if (!activeClick) return null;

  return <JakeStretchOverlayInner activeClick={activeClick} />;
};

const BMOCharacter = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 140" className={className}>
    {/* Body */}
    <rect x="10" y="10" width="80" height="120" rx="10" fill="#4DB6AC" stroke="#004D40" strokeWidth="4" />
    {/* Screen */}
    <rect x="20" y="20" width="60" height="50" rx="5" fill="#E0F2F1" stroke="#004D40" strokeWidth="3" />
    {/* Face */}
    <circle cx="40" cy="40" r="2" fill="#004D40" />
    <circle cx="60" cy="40" r="2" fill="#004D40" />
    <path d="M 45 55 Q 50 60 55 55" fill="none" stroke="#004D40" strokeWidth="2" strokeLinecap="round" />
    {/* Buttons */}
    <circle cx="30" cy="85" r="6" fill="#D32F2F" stroke="#004D40" strokeWidth="2" />
    <rect x="50" y="80" width="25" height="10" rx="2" fill="#FBC02D" stroke="#004D40" strokeWidth="2" />
    <circle cx="35" cy="110" r="4" fill="#1976D2" stroke="#004D40" strokeWidth="2" />
    <circle cx="55" cy="110" r="4" fill="#388E3C" stroke="#004D40" strokeWidth="2" />
    <circle cx="75" cy="110" r="4" fill="#7B1FA2" stroke="#004D40" strokeWidth="2" />
    {/* Controller Port */}
    <rect x="20" y="125" width="20" height="5" fill="#004D40" />
  </svg>
);

const LadyRainicorn = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 400 100" className={className}>
    <defs>
      <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF0000" />
        <stop offset="20%" stopColor="#FF7F00" />
        <stop offset="40%" stopColor="#FFFF00" />
        <stop offset="60%" stopColor="#00FF00" />
        <stop offset="80%" stopColor="#0000FF" />
        <stop offset="100%" stopColor="#4B0082" />
      </linearGradient>
    </defs>
    {/* Body */}
    <path d="M 0 50 Q 50 20 100 50 T 200 50 T 300 50 T 400 50" fill="none" stroke="url(#rainbow)" strokeWidth="30" strokeLinecap="round" className="animate-pulse" />
    {/* Head */}
    <g transform="translate(380, 40)">
      <ellipse cx="0" cy="0" rx="25" ry="15" fill="#F8BBD0" stroke="#880E4F" strokeWidth="3" />
      <circle cx="10" cy="-5" r="3" fill="#000" />
      <path d="M 20 -10 L 40 -30" stroke="#FFF" strokeWidth="5" strokeLinecap="round" />
      <path d="M -10 10 Q -5 25 10 15" fill="#F06292" />
    </g>
  </svg>
);

const AdventureTimeDynamicBackground = ({ accentColor, isDark, isHome, performanceMode, optimizationMode }: { accentColor?: AccentColor, isDark: boolean, isHome: boolean, performanceMode?: boolean, optimizationMode?: boolean }) => {
  const isFinn = accentColor === 'finn-blue';
  
  return (
    <div className={`absolute inset-0 z-[-10] pointer-events-none overflow-hidden opacity-0 group-[.visual-adventure-time]/adventure-time:opacity-100 transition-opacity duration-500 ${isDark ? 'bg-[#1A202C]' : (isFinn ? 'bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF]' : 'bg-gradient-to-b from-[#FFF9C4] to-[#FFF176]')}`}>
      {/* Static Fallback */}
      <div className="static-fallback absolute inset-0 opacity-20" />
      
      {!performanceMode && (
        <>
          {/* Shared Environment: Sky, Clouds, Grass, Tree Fort */}
          <div className="absolute bottom-0 left-0 w-full h-[30%] bg-[#7CFC00] dark:bg-[#2E8B57] rounded-t-[100px] shadow-[0_-10px_0_rgba(0,0,0,0.1)]" />
          {!optimizationMode && <div className="absolute bottom-[-10%] left-[-10%] w-[120%] h-[20%] bg-[#32CD32] dark:bg-[#006400] rounded-t-[50%] opacity-50" />}
          
          {/* Clouds */}
          <div className="at-cloud w-32 h-12 top-[10%]" style={{ animationDuration: '40s', animationDelay: '0s' }} />
          {!optimizationMode && (
            <>
              <div className="at-cloud w-48 h-16 top-[25%]" style={{ animationDuration: '60s', animationDelay: '-20s', opacity: 0.6 }} />
              <div className="at-cloud w-24 h-10 top-[15%]" style={{ animationDuration: '35s', animationDelay: '-15s' }} />
            </>
          )}
          
          {/* Tree Fort */}
          <TreeFort className="absolute bottom-[10%] left-[10%] w-[40vw] max-w-[500px] min-w-[300px] opacity-90 drop-shadow-2xl" />
        </>
      )}

      {isFinn ? (
        <>
          {/* Candy Kingdom Silhouettes */}
          {!performanceMode && !optimizationMode && (
            <div className="absolute bottom-[25%] right-[5%] flex gap-4 opacity-30">
              <div className="w-16 h-32 bg-[#F48FB1] rounded-t-full" />
              <div className="w-12 h-24 bg-[#CE93D8] rounded-t-full" />
              <div className="w-20 h-40 bg-[#F06292] rounded-t-full" />
            </div>
          )}

          {/* BMO Character */}
          {!performanceMode && (
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
                x: [0, 10, -10, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] left-[20%]"
            >
              <BMOCharacter className="w-[8vw] max-w-[100px] min-w-[60px] drop-shadow-lg" />
            </motion.div>
          )}

          {/* Finn Character */}
          {!performanceMode && <FinnCharacter className="absolute bottom-[10%] left-[50%] w-[15vw] max-w-[200px] min-w-[120px] drop-shadow-xl animate-bounce-soft" />}
          
          {/* Finn's Sword (Animated) */}
          {!performanceMode && (
            <div className="absolute bottom-[20%] right-[10%] w-8 h-32 finn-sword-anim">
              <div className="w-2 h-20 bg-[#FFD700] mx-auto border-2 border-black rounded-t-full" />
              <div className="w-8 h-2 bg-[#FFD700] border-2 border-black rounded-sm" />
              <div className="w-2 h-6 bg-[#8B4513] mx-auto border-x-2 border-black" />
              <div className="w-4 h-4 bg-[#FF0000] mx-auto border-2 border-black rounded-full" />
            </div>
          )}
        </>
      ) : (
        <>
          {/* Lady Rainicorn */}
          {!performanceMode && (
            <motion.div
              initial={{ x: '-100vw' }}
              animate={{ x: '100vw' }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-[15%] w-full"
            >
              <LadyRainicorn className="w-[30vw] max-w-[400px] min-w-[200px] opacity-80" />
            </motion.div>
          )}

          {/* Jake's Theme: Stretchy Yellow Patterns */}
          {!performanceMode && <div className="absolute inset-0 opacity-30 dark:opacity-10 bg-[radial-gradient(circle_at_center,_#FFB900_0%,_transparent_70%)]" />}
          
          {/* Jake Character */}
          {!performanceMode && <JakeCharacter className="absolute bottom-[10%] left-[50%] w-[15vw] max-w-[200px] min-w-[120px] drop-shadow-xl jake-stretch-anim" style={{ transformOrigin: 'bottom center' }} />}
          
          {/* Jake's Stretchy Arms/Body (Background elements) */}
          {!performanceMode && (
            <>
              <div className="absolute top-[20%] right-[-10%] w-[60%] h-12 bg-[#FFB900] dark:bg-[#D4A000] border-y-4 border-black rounded-full jake-stretch-anim" style={{ transformOrigin: 'right center' }} />
              <div className="absolute bottom-[30%] right-[-10%] w-[40%] h-16 bg-[#FFB900] dark:bg-[#D4A000] border-y-4 border-black rounded-full jake-stretch-anim" style={{ transformOrigin: 'right center', animationDelay: '-1s' }} />
              <div className="absolute top-[40%] left-[-5%] w-[30%] h-10 bg-[#FFB900] dark:bg-[#D4A000] border-y-4 border-black rounded-full jake-stretch-anim" style={{ transformOrigin: 'left center', animationDelay: '-0.5s' }} />
            </>
          )}
        </>
      )}

      {/* Interactive Click Overlays */}
      {isHome && !performanceMode && (isFinn ? <FinnClickOverlay /> : <JakeStretchOverlay />)}
    </div>
  );
};

const SaidiBackground = ({ performanceMode, optimizationMode }: { performanceMode?: boolean, optimizationMode?: boolean }) => (
  <div className="absolute inset-0 z-[-10] pointer-events-none overflow-hidden opacity-0 group-[.visual-saidi]/saidi:opacity-100 transition-opacity duration-500">
    {/* Base Gradient & Texture */}
    <div className="static-fallback absolute inset-0 bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-secondary)] opacity-10 dark:opacity-30" />
    
    {!performanceMode && (
      <>
        {/* Atmospheric Heat Shimmer */}
        {!optimizationMode && <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_0%,_transparent_100%)]" />}

        {/* Far Mountains (The Gabal) - Multi-layered for depth */}
        <div className={`absolute bottom-[20%] left-0 w-full h-[40%] opacity-10 dark:opacity-20`}>
          <div className="absolute bottom-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjMwMCI+PHBhdGggZD0iTTAgMzAwIFYgMjUwIFEgMTUwIDE1MCAzMDAgMjAwIFQgNjAwIDEyMCBUIDEwMDAgMTgwIFYgMzAwIFoiIGZpbGw9IiMzZDJjMWUiLz48L3N2Zz4=')] bg-repeat-x bg-bottom animate-parallax-slow" style={{ backgroundSize: '2000px 100%' }} />
        </div>
        {!optimizationMode && (
          <div className="absolute bottom-[15%] left-0 w-full h-[30%] opacity-20 dark:opacity-30">
            <div className="absolute bottom-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjMwMCI+PHBhdGggZD0iTTAgMzAwIFYgMjgwIFEgMjAwIDIwMCA0MDAgMjYwIFQgODAwIDE4MCBUIDEwMDAgMjQwIFYgMzAwIFoiIGZpbGw9IiMzZDJjMWUiLz48L3N2Zz4=')] bg-repeat-x bg-bottom animate-parallax-medium" style={{ backgroundSize: '1500px 100%', filter: 'blur(2px)' }} />
          </div>
        )}

    {/* The Nile (River) - Layered with reflections */}
    <div className="absolute bottom-0 left-0 w-full h-[25%] bg-gradient-to-t from-sky-600/10 to-transparent dark:from-sky-900/30" />
    <div className="absolute bottom-0 left-0 w-full h-[15%] overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMjAiPgo8cGF0aCBkPSJNMCAxMCBDIDI1IDAgNzUgMjAgMTAwIDEwIEwgMTAwIDIwIEwgMCAyMCBaIiBmaWxsPSIjM2I4MmY2Ii8+Cjwvc3ZnPg==')] bg-repeat-x animate-river-flow" style={{ backgroundSize: '400px 100%' }} />
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-river-shimmer" />
    </div>

    {/* Sakia (Water Wheel) - More detailed SVG */}
    <div className="absolute bottom-[10%] left-[15%] w-32 h-32 opacity-40 dark:opacity-60">
      <svg viewBox="0 0 100 100" className="w-full h-full animate-sakia">
        <circle cx="50" cy="50" r="45" stroke="#3d2c1e" strokeWidth="3" fill="none" />
        <circle cx="50" cy="50" r="5" fill="#3d2c1e" />
        {[...Array(12)].map((_, i) => (
          <line key={i} x1="50" y1="50" x2={50 + 45 * Math.cos(i * Math.PI / 6)} y2={50 + 45 * Math.sin(i * Math.PI / 6)} stroke="#3d2c1e" strokeWidth="2" />
        ))}
        {[...Array(12)].map((_, i) => (
          <rect key={i} x={45 + 45 * Math.cos(i * Math.PI / 6)} y={45 + 45 * Math.sin(i * Math.PI / 6)} width="10" height="10" fill="#3d2c1e" transform={`rotate(${i * 30 + 45}, ${50 + 45 * Math.cos(i * Math.PI / 6)}, ${50 + 45 * Math.sin(i * Math.PI / 6)})`} />
        ))}
      </svg>
      <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-6 h-20 bg-[#3d2c1e] rounded-t-lg" />
    </div>

    {/* Felucca (Traditional Boat) - Smoother sailing */}
    <div className="absolute bottom-[12%] left-[-150px] animate-felucca-sail opacity-60 dark:opacity-80">
      <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 80 L90 80 L95 70 L5 70 Z" fill="#3d2c1e" />
        <path d="M50 70 L50 10 L90 65 Z" fill="#f5f5dc" opacity="0.9" className="animate-sail-flutter" />
        <path d="M50 70 L50 20 L20 65 Z" fill="#f5f5dc" opacity="0.7" className="animate-sail-flutter-delayed" />
        <rect x="48" y="10" width="4" height="60" fill="#3d2c1e" />
      </svg>
    </div>

    {/* Pigeon Towers (Iconic Saidi Architecture) */}
    <div className="absolute bottom-[15%] right-[20%] w-32 h-64 opacity-25 dark:opacity-40">
      <div className="absolute bottom-0 w-full h-[80%] bg-[#3d2c1e] rounded-t-[5rem] shadow-2xl" />
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-20 h-16 bg-[#3d2c1e] rounded-full" />
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 grid grid-cols-4 gap-3">
        {[...Array(16)].map((_, i) => <div key={i} className="w-2 h-2 bg-black/30 rounded-full" />)}
      </div>
      <div className="absolute bottom-0 -left-4 w-2 h-48 bg-[#5d4037] rounded-full rotate-[-12deg] opacity-60 shadow-lg" />
    </div>

    {/* Palm Trees - More organic sway */}
    <div className="absolute bottom-[12%] left-[8%] w-40 h-80 opacity-20 dark:opacity-40 animate-palm-sway">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-full bg-[#3d2c1e] rounded-t-full" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#3d2c1e] opacity-80" style={{ clipPath: 'polygon(50% 0%, 100% 30%, 80% 100%, 50% 70%, 20% 100%, 0% 30%)', filter: 'blur(1px)' }} />
    </div>

    {/* Naboot (Stick) - Floating/Swaying */}
    <div className="absolute bottom-[10%] left-[35%] w-2.5 h-72 bg-gradient-to-b from-[#8d6e63] to-[#3d2c1e] rounded-full animate-naboot opacity-70 dark:opacity-90 shadow-2xl origin-bottom" />

    {/* Flying Pigeons */}
    <div className="absolute top-[20%] left-[-10%] animate-pigeon-flock">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="absolute w-4 h-2 bg-[#3d2c1e]/40 rounded-full animate-wing-flap" 
          style={{ 
            top: `${i * 15}px`, 
            left: `${i * 25}px`,
            animationDelay: `${i * 0.1}s`
          }} 
        />
      ))}
    </div>

    {/* Atmospheric Dust/Sand Particles */}
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-1 h-1 bg-amber-200/10 rounded-full animate-dust-drift"
          style={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}
        />
      ))}
    </div>

    {/* Sun/Moon Glow */}
    <div className="absolute top-[5%] right-[10%] w-64 h-64 bg-amber-400/10 dark:bg-amber-600/5 rounded-full blur-[100px] animate-pulse-soft" />
      </>
    )}
  </div>
);

const ModernBackground = ({ performanceMode, optimizationMode }: { performanceMode?: boolean, optimizationMode?: boolean }) => (
  <div className="absolute inset-0 z-[-10] pointer-events-none overflow-hidden opacity-0 group-[.visual-modern]/modern:opacity-100 transition-opacity duration-500">
    {/* Static Fallback / Base */}
    <div className="static-fallback absolute inset-0 bg-slate-50 dark:bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white dark:from-indigo-900/20 dark:via-slate-950 dark:to-slate-950" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CiAgPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPgo8L3N2Zz4=')] opacity-50" />
    </div>
    {!performanceMode && (
      <>
        {!optimizationMode && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] animate-pulse-soft" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDuration: '6s' }} />
            <div className="absolute top-[15%] left-[15%] w-16 h-16 bg-indigo-400/20 dark:bg-indigo-400/10 rounded-[2rem] rotate-12 animate-float" />
            <div className="absolute bottom-[20%] right-[15%] w-24 h-24 bg-purple-400/20 dark:bg-purple-400/10 rounded-full animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-[40%] right-[20%] w-12 h-12 bg-amber-400/20 dark:bg-amber-400/10 rounded-2xl -rotate-12 animate-float" style={{ animationDelay: '2s' }} />
          </>
        )}
        {optimizationMode && (
          <div className="absolute inset-0 bg-indigo-500/5 animate-pulse-soft" style={{ animationDuration: '10s' }} />
        )}
      </>
    )}
  </div>
);

const KingerButterfly = ({ performanceMode, optimizationMode }: { performanceMode?: boolean, optimizationMode?: boolean }) => {
  if (performanceMode || optimizationMode) return null;
  const [key, setKey] = React.useState(0);
  const [path, setPath] = React.useState({
    startX: '-10vw', endX: '110vw',
    startY: '50vh', endY: '20vh',
    midY1: '10vh', midY2: '80vh',
    duration: 12
  });

  React.useEffect(() => {
    const randomize = () => {
      const startLeft = Math.random() > 0.5;
      setPath({
        startX: startLeft ? '-10vw' : '110vw',
        endX: startLeft ? '110vw' : '-10vw',
        startY: `${Math.random() * 80 + 10}vh`,
        endY: `${Math.random() * 80 + 10}vh`,
        midY1: `${Math.random() * 80 + 10}vh`,
        midY2: `${Math.random() * 80 + 10}vh`,
        duration: 10 + Math.random() * 10
      });
      setKey(prev => prev + 1);
    };
    const interval = setInterval(randomize, path.duration * 1000);
    return () => clearInterval(interval);
  }, [path.duration]);

  return (
    <motion.div
      key={key}
      className="absolute z-50 pointer-events-none"
      initial={{ x: path.startX, y: path.startY }}
      animate={{
        x: [path.startX, path.endX],
        y: [path.startY, path.midY1, path.midY2, path.endY],
      }}
      transition={{
        duration: path.duration,
        ease: "linear"
      }}
    >
      <motion.div 
        animate={{ y: [-15, 15, -15], x: [-10, 10, -10], rotate: [-10, 10, -10] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ButterflyDesign />
      </motion.div>
    </motion.div>
  );
};

const KingerStar = ({ delay }: { key?: React.Key, delay: number }) => {
  const [position, setPosition] = React.useState({
    top: `${20 + Math.random() * 50}%`,
    left: `${10 + Math.random() * 80}%`
  });

  React.useEffect(() => {
    // Initial delay before starting the cycle
    const timeout = setTimeout(() => {
      // Update position every 6 seconds (matching animation duration)
      const interval = setInterval(() => {
        setPosition({
          top: `${20 + Math.random() * 50}%`,
          left: `${10 + Math.random() * 80}%`
        });
      }, 6000);
      return () => clearInterval(interval);
    }, delay * 1000);
    
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <motion.div
      className="absolute flex items-center justify-center"
      style={position}
      animate={{ 
        opacity: [0, 1, 0, 0], 
        scale: [0.5, 1.5, 0.5, 0.5],
        rotate: [0, 90, 180, 180]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
        times: [0, 0.4, 0.8, 1]
      }}
    >
      <svg width="60" height="60" viewBox="0 0 100 100" className="fill-yellow-200 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]">
        <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
      </svg>
    </motion.div>
  );
};

const KingerStars = ({ isDarkMode, optimizationMode }: { isDarkMode: boolean, optimizationMode?: boolean }) => {
  return (
    <AnimatePresence>
      {isDarkMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          {/* 3 Big Stars */}
          {[...Array(optimizationMode ? 1 : 3)].map((_, i) => (
            <KingerStar key={i} delay={i * 2} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CaineLightning = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <AnimatePresence>
      {isDarkMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-0"
        >
          {/* Blue Lightning */}
          <motion.svg 
            className="absolute inset-0 w-full h-full drop-shadow-[0_0_12px_#3b82f6]" 
            viewBox="0 0 200 200"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 0.15, repeat: Infinity, ease: "linear" }}
          >
            <path d="M100,100 L70,40 L85,35 L50,10 M100,100 L140,60 L130,50 L170,20 M100,100 L40,120 L50,135 L10,160 M100,100 L160,140 L150,155 L190,180" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M100,100 L80,70 L95,65 L60,30 M100,100 L120,80 L110,70 L150,40" fill="none" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
          
          {/* Red Lightning */}
          <motion.svg 
            className="absolute inset-0 w-full h-full drop-shadow-[0_0_12px_#ef4444]" 
            viewBox="0 0 200 200"
            animate={{ opacity: [0.4, 1, 0.4], scale: [1.02, 0.98, 1.02] }}
            transition={{ duration: 0.2, repeat: Infinity, ease: "linear", delay: 0.05 }}
          >
            <path d="M100,100 L60,80 L50,90 L20,60 M100,100 L130,120 L145,110 L180,140 M100,100 L80,150 L90,160 L50,190 M100,100 L150,70 L140,60 L180,30" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M100,100 L70,90 L60,100 L30,70 M100,100 L120,110 L135,100 L170,130" fill="none" stroke="#fca5a5" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TadcBackground = ({ accentColor, isDarkMode, performanceMode, optimizationMode }: { accentColor: string, isDarkMode: boolean, performanceMode?: boolean, optimizationMode?: boolean }) => {
  if (accentColor === 'tadc-kinger') {
    return (
      <div className={`absolute inset-0 z-[-10] pointer-events-none overflow-hidden opacity-0 group-[.visual-tadc]/tadc:opacity-100 transition-colors duration-1000 ${isDarkMode ? 'bg-gradient-to-b from-[#0f172a] via-[#312e81] to-[#4c1d95]' : 'bg-gradient-to-b from-[#7e22ce] via-[#d946ef] to-[#f472b6]'}`}>
        {/* The Void / Glitchy Background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,#ffffff_0%,transparent_70%)] animate-pulse-soft" />
        
        {!performanceMode && (
          <>
            {/* Starry Night Sky (Dark Mode Only) */}
            <KingerStars isDarkMode={isDarkMode} optimizationMode={optimizationMode} />

            {!optimizationMode && (
              <>
                {/* Floating Spheres (from reference image) */}
                <motion.div 
                  animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full bg-[#b45309] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),inset_10px_10px_20px_rgba(255,255,255,0.3)] opacity-80"
                />
                <motion.div 
                  animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-[30%] right-[15%] w-20 h-20 rounded-full bg-[#92400e] shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.5),inset_5px_5px_15px_rgba(255,255,255,0.3)] opacity-90"
                />
                <motion.div 
                  animate={{ y: [-15, 15, -15], rotate: [0, 180, 360] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute top-[5%] right-[30%] w-16 h-16 rounded-full bg-[#b45309] shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.5),inset_5px_5px_10px_rgba(255,255,255,0.3)] opacity-70"
                />
              </>
            )}

            {!isDarkMode && (
              <>
                <KingerButterfly performanceMode={performanceMode} optimizationMode={optimizationMode} />
                <KingerButterfly performanceMode={performanceMode} optimizationMode={optimizationMode} />
              </>
            )}

        {/* KINGER - The King */}
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 animate-tadc-kinger">
          <motion.div 
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex flex-col items-center"
          >
            
            {/* Kinger's Head / Wooden Neck */}
            <div className="relative z-20 flex flex-col items-center">
              {/* Easter Egg: Bucket worn on head in Dark Mode */}
              {isDarkMode && (
                <motion.div
                  initial={{ y: -150, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, rotate: [-2, 2, -2] }}
                  transition={{ duration: 0.5, rotate: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-28 z-50 flex flex-col items-center"
                >
                  {/* Main Bucket Body */}
                  <div className="w-24 h-24 bg-gradient-to-b from-[#a1a1aa] to-[#71717a] border-4 border-black rounded-b-lg relative overflow-hidden shadow-2xl flex flex-col justify-end pb-2">
                    {/* Bucket ridges */}
                    <div className="w-full h-3 bg-[#52525b] border-y-2 border-black mb-1" />
                    <div className="w-full h-3 bg-[#52525b] border-y-2 border-black mb-1" />
                    <div className="w-full h-3 bg-[#52525b] border-y-2 border-black" />
                  </div>
                  {/* Bucket Bottom (facing up) */}
                  <div className="w-[6.5rem] h-6 bg-[#d4d4d8] border-4 border-black rounded-full absolute -top-3 z-10" />
                  {/* Bucket Handle */}
                  <div className="absolute top-10 w-36 h-20 border-4 border-black rounded-b-2xl z-20 pointer-events-none flex justify-center items-end" style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}>
                    <div className="w-16 h-5 bg-[#8b5a2b] border-4 border-black rounded-full absolute -bottom-2.5 pointer-events-auto" />
                  </div>
                </motion.div>
              )}

              {/* Wooden Head Base */}
              <div className="w-16 h-16 bg-[#d4a373] border-4 border-black rounded-t-full relative z-10">
                {/* Jittery Eyes (Hidden if bucket is on) */}
                <div className={`absolute top-2 -left-4 flex gap-6 transition-opacity duration-300 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="w-12 h-12 bg-white rounded-full border-4 border-black flex items-center justify-center animate-tadc-eye-jitter shadow-lg">
                    <div className="w-4 h-4 bg-black rounded-full" />
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full border-4 border-black flex items-center justify-center animate-tadc-eye-jitter shadow-lg" style={{ animationDelay: '0.05s' }}>
                    <div className="w-3 h-3 bg-black rounded-full" />
                  </div>
                </div>
              </div>
              
              {/* Wooden Neck with ridges */}
              <div className="w-12 h-16 bg-[#d4a373] border-x-4 border-black relative z-10 flex flex-col justify-evenly items-center py-1">
                <div className="w-14 h-3 bg-[#bc8a5f] border-2 border-black rounded-full" />
                <div className="w-12 h-3 bg-[#bc8a5f] border-2 border-black rounded-full" />
                <div className="w-14 h-3 bg-[#bc8a5f] border-2 border-black rounded-full" />
              </div>
            </div>

            {/* Ermine Collar */}
            <div className="w-36 h-16 bg-white border-4 border-black rounded-full relative z-30 -mt-6 flex items-center justify-center overflow-hidden shadow-lg">
              <div className="w-2 h-4 bg-black rounded-full absolute top-2 left-6 rotate-12" />
              <div className="w-2 h-3 bg-black rounded-full absolute bottom-3 left-12 -rotate-12" />
              <div className="w-2 h-4 bg-black rounded-full absolute top-4 right-10 rotate-45" />
              <div className="w-2 h-3 bg-black rounded-full absolute bottom-2 right-6 -rotate-12" />
            </div>

            {/* Purple Robe */}
            <div className="w-32 h-56 bg-[#312e81] border-4 border-black rounded-t-3xl -mt-8 relative overflow-hidden z-20 shadow-2xl">
              {/* Front Ermine Trim */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-full bg-white border-x-4 border-black flex flex-col items-center py-4 gap-8">
                <div className="w-2 h-4 bg-black rounded-full rotate-12" />
                <div className="w-2 h-4 bg-black rounded-full -rotate-12" />
                <div className="w-2 h-4 bg-black rounded-full rotate-45" />
                <div className="w-2 h-4 bg-black rounded-full -rotate-12" />
              </div>
            </div>

            {/* Floating Hands */}
            <motion.div 
              animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-40 -left-20 w-16 h-16 bg-white border-4 border-black rounded-full z-40 shadow-lg flex items-center justify-center"
            >
              <div className="absolute -left-2 top-2 w-6 h-6 bg-white border-4 border-black rounded-full" />
              <div className="absolute -left-3 top-8 w-6 h-6 bg-white border-4 border-black rounded-full" />
            </motion.div>
            
            <motion.div 
              animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-32 -right-24 w-16 h-16 bg-white border-4 border-black rounded-full z-40 shadow-lg flex items-center justify-center"
            >
              <div className="absolute -right-2 top-2 w-6 h-6 bg-white border-4 border-black rounded-full" />
              <div className="absolute -right-3 top-8 w-6 h-6 bg-white border-4 border-black rounded-full" />
              <div className="absolute right-2 -top-3 w-6 h-6 bg-white border-4 border-black rounded-full" />
            </motion.div>

          </motion.div>
        </div>
      </>
    )}

    {/* Glitch Overlay */}
    <div className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none opacity-0 group-[.visual-tadc]/tadc:animate-tadc-glitch-intense" />
      </div>
    );
  }

  // Caine Background
  return (
    <div className="absolute inset-0 z-[-10] pointer-events-none overflow-hidden opacity-0 group-[.visual-tadc]/tadc:opacity-100 transition-opacity duration-500 bg-[#0a0a0a]">
      {!performanceMode && (
        <>
          {/* Circus Tent Stripes (Dynamic) */}
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#dc2626_0px,#dc2626_100px,#fcd34d_100px,#fcd34d_200px)] animate-tadc-grid" style={{ backgroundSize: '400px 400px' }} />

      {/* Side Curtains */}
      <div className="absolute top-0 left-0 w-[15%] h-full bg-[#dc2626] border-r-8 border-black shadow-[20px_0_30px_rgba(0,0,0,0.8)] animate-tadc-curtain origin-left z-20" />
      <div className="absolute top-0 right-0 w-[15%] h-full bg-[#dc2626] border-l-8 border-black shadow-[-20px_0_30px_rgba(0,0,0,0.8)] animate-tadc-curtain origin-right z-20" />

      {/* Floating Stars */}
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-[15%] left-[20%] w-16 h-16 bg-yellow-400 border-4 border-black rotate-45"
      />
      <motion.div 
        animate={{ rotate: -360, scale: [1, 1.5, 1] }}
        transition={{ duration: 15, repeat: Infinity, type: "tween", ease: "linear" }}
        className="absolute bottom-[20%] right-[25%] w-24 h-24 bg-blue-500 border-4 border-black rotate-45 rounded-full"
      />

      {/* CAINE - The Ringmaster */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 animate-tadc-caine z-10">
        <CaineLightning isDarkMode={isDarkMode} />
        <motion.div 
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex flex-col items-center"
        >
          {/* Top Hat */}
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-24 w-24 h-20 bg-black border-4 border-white rounded-t-sm z-30"
          >
            <div className="absolute bottom-0 w-36 h-3 bg-black border-4 border-white left-1/2 -translate-x-1/2 rounded-full" />
            <div className="absolute bottom-3 w-full h-4 bg-red-600" />
          </motion.div>
          
          {/* Head (Teeth) */}
          <div className="relative z-20">
            {/* Top Jaw */}
            <motion.div 
              animate={{ rotateX: [0, -20, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="w-48 h-16 bg-[#dc2626] border-8 border-black rounded-t-full flex items-end justify-around px-3 pb-1 origin-bottom"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-5 h-8 bg-white border-4 border-black rounded-b-sm" />
              ))}
            </motion.div>
            
            {/* Eyes (Floating in the middle) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-6 justify-center py-2 z-10 w-full">
              {/* Left Eye (Blue) */}
              <motion.div 
                animate={{
                  backgroundColor: isDarkMode ? "#3b82f6" : "#ffffff",
                  boxShadow: isDarkMode ? "0 0 30px 10px rgba(59, 130, 246, 0.8)" : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  borderColor: isDarkMode ? "#60a5fa" : "#000000"
                }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 rounded-full border-4 flex items-center justify-center animate-tadc-eye-jitter relative overflow-hidden"
              >
                <motion.div 
                  animate={{ opacity: isDarkMode ? 0 : 1 }}
                  className="w-6 h-6 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-black rounded-full" />
                </motion.div>
              </motion.div>
              
              {/* Right Eye (Red) */}
              <motion.div 
                animate={{
                  backgroundColor: isDarkMode ? "#ef4444" : "#ffffff",
                  boxShadow: isDarkMode ? "0 0 30px 10px rgba(239, 68, 68, 0.8)" : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  borderColor: isDarkMode ? "#f87171" : "#000000"
                }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 rounded-full border-4 flex items-center justify-center animate-tadc-eye-jitter" style={{ animationDelay: '0.1s' }}
              >
                <motion.div 
                  animate={{ opacity: isDarkMode ? 0 : 1 }}
                  className="w-6 h-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-black rounded-full" />
                </motion.div>
              </motion.div>
            </div>

            {/* Bottom Jaw */}
            <motion.div 
              animate={{ rotateX: [0, 20, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="w-48 h-16 bg-[#dc2626] border-8 border-black rounded-b-full flex items-start justify-around px-3 pt-1 origin-top mt-4"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-5 h-8 bg-white border-4 border-black rounded-t-sm" />
              ))}
            </motion.div>
          </div>

          {/* Body (Suit) */}
          <div className="w-32 h-40 bg-[#dc2626] border-8 border-black rounded-t-[3rem] -mt-4 relative z-0">
            {/* Shirt & Bowtie */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-full bg-white border-x-4 border-black">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-6 bg-black flex items-center justify-center">
                <div className="w-4 h-4 bg-red-600 rounded-full" />
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rounded-full" />
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rounded-full" />
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rounded-full" />
            </div>
            {/* Lapels */}
            <div className="absolute top-0 left-0 w-8 h-32 bg-black rounded-br-full" />
            <div className="absolute top-0 right-0 w-8 h-32 bg-black rounded-bl-full" />
          </div>

          {/* Floating Hands (Gloves) */}
          <motion.div 
            animate={{ y: [-15, 15, -15], x: [-10, 10, -10], rotate: [-10, 10, -10] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-32 -left-24 w-16 h-20 bg-white border-4 border-black rounded-full z-30 shadow-lg"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-black rounded-b-full opacity-20" />
          </motion.div>
          <motion.div 
            animate={{ y: [15, -15, 15], x: [10, -10, 10], rotate: [10, -10, 10] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute top-24 -right-24 w-16 h-20 bg-white border-4 border-black rounded-full z-30 shadow-lg flex items-center justify-center"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-black rounded-b-full opacity-20" />
            {/* Cane */}
            <div className="absolute -top-16 w-4 h-40 bg-black border-2 border-white rotate-12 -z-10" />
          </motion.div>

          </motion.div>
        </div>
      </>
    )}

    {/* Glitch Overlay */}
    <div className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none opacity-0 group-[.visual-tadc]/tadc:opacity-100 transition-opacity duration-500 animate-tadc-glitch-intense" />
  </div>
);
};

const FloatingQuack = ({ className, style }: { className: string, style: React.CSSProperties }) => {
  const [text, setText] = React.useState("Quack!");

  React.useEffect(() => {
    if (Math.random() < 1/15) {
      setText("Ahmed Hamed");
    }
  }, []);

  const handleAnimationIteration = () => {
    if (Math.random() < 1/15) {
      setText("Ahmed Hamed");
    } else {
      setText("Quack!");
    }
  };

  return (
    <div 
      className={`whitespace-nowrap ${className}`} 
      style={style} 
      onAnimationIteration={handleAnimationIteration}
    >
      {text}
    </div>
  );
};

const getDuckColors = (color: string) => {
  switch (color) {
    case 'duck-orange':
      return {
        body: 'bg-orange-400',
        border: 'border-orange-600',
        beak: 'bg-yellow-500',
        wing: 'bg-orange-500',
        text1: 'text-orange-500',
        text2: 'text-orange-400',
        text3: 'text-orange-300',
        shadow1: '#c2410c',
        shadow2: '#ea580c',
        shadow3: '#f97316',
      };
    case 'duck-blue':
      return {
        body: 'bg-blue-400',
        border: 'border-blue-600',
        beak: 'bg-orange-500',
        wing: 'bg-blue-500',
        text1: 'text-blue-500',
        text2: 'text-blue-400',
        text3: 'text-blue-300',
        shadow1: '#1d4ed8',
        shadow2: '#2563eb',
        shadow3: '#3b82f6',
      };
    case 'duck-white':
      return {
        body: 'bg-slate-100',
        border: 'border-slate-300',
        beak: 'bg-orange-500',
        wing: 'bg-slate-200',
        text1: 'text-slate-500',
        text2: 'text-slate-400',
        text3: 'text-slate-300',
        shadow1: '#64748b',
        shadow2: '#94a3b8',
        shadow3: '#cbd5e1',
      };
    case 'duck-yellow':
    default:
      return {
        body: 'bg-yellow-400',
        border: 'border-orange-500',
        beak: 'bg-orange-500',
        wing: 'bg-yellow-500',
        text1: 'text-yellow-500',
        text2: 'text-orange-400',
        text3: 'text-yellow-400',
        shadow1: '#ea580c',
        shadow2: '#f97316',
        shadow3: '#fb923c',
      };
  }
};

const DuckBackground = ({ theme, performanceMode, optimizationMode }: { theme: AppTheme, performanceMode?: boolean, optimizationMode?: boolean }) => {
  const colors = getDuckColors(theme.accentColor);
  const showCoolDuck = useMemo(() => Math.random() < 1/15, []);
  return (
  <div className="absolute inset-0 z-[-10] pointer-events-none overflow-hidden opacity-0 group-[.visual-duck]/duck:opacity-100 transition-opacity duration-500">
    {/* Static Fallback / Base */}
    <div className="static-fallback absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-100 dark:from-sky-900 dark:to-sky-800">
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-400/30 to-transparent" />
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxwYXRoIGQ9Ik0zMCAxMWE1IDUgMCAwIDEtNS01IDUgNSAwIDAgMSAxMCAwIDUgNSAwIDAgMS01IDV6IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')]" />
    </div>

    {!performanceMode && (
      <>
        {/* Sky Elements */}
        {!optimizationMode && (
          <>
            <div className="absolute top-[10%] left-[-150px] w-32 h-12 bg-white/80 dark:bg-white/20 rounded-full blur-[2px] animate-[cloud-drift_30s_linear_infinite]" />
            <div className="absolute top-[25%] left-[-150px] w-48 h-16 bg-white/60 dark:bg-white/10 rounded-full blur-[2px] animate-[cloud-drift_45s_linear_infinite]" style={{ animationDelay: '15s' }} />
            <div className="absolute top-[5%] left-[-150px] w-24 h-8 bg-white/70 dark:bg-white/15 rounded-full blur-[2px] animate-[cloud-drift_25s_linear_infinite]" style={{ animationDelay: '5s' }} />
          </>
        )}
        
        <div className="absolute top-[10%] right-[10%] w-24 h-24 bg-yellow-300 dark:bg-yellow-500/50 rounded-full blur-md animate-pulse" style={{ animationDuration: '4s' }} />

        {/* Water Base */}
        <div className="absolute bottom-0 left-0 w-full h-[35%] bg-blue-300/20 dark:bg-blue-500/10" />

        {/* Water Waves */}
        <div className="absolute bottom-[25%] left-0 w-[200%] h-[20%] bg-blue-400/20 dark:bg-blue-500/10 rounded-t-[100%] animate-[marquee_20s_linear_infinite]" />
        <div className="absolute bottom-[15%] left-[-50%] w-[200%] h-[25%] bg-blue-300/30 dark:bg-blue-400/15 rounded-t-[100%] animate-[marquee_15s_linear_infinite_reverse]" />
        
        {/* Cool Duck with Dark Glasses */}
        {showCoolDuck && (
          <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-24 h-24 animate-[duck-bob-y_4s_ease-in-out_infinite]">
            <div className={`relative w-full h-full ${colors.body} rounded-full border-4 ${colors.border}`}>
              {/* Dark Glasses */}
              <div className="absolute top-4 left-2 right-2 h-6 bg-black rounded-sm flex items-center justify-center gap-2 z-10">
                <div className="w-6 h-4 bg-slate-800 rounded-sm" />
                <div className="w-6 h-4 bg-slate-800 rounded-sm" />
              </div>
              <div className={`absolute top-10 right-[-15px] w-10 h-6 ${colors.beak} rounded-full`} />
              <div className={`absolute bottom-[-5px] left-[15px] w-12 h-6 ${colors.wing} rounded-full`} />
              <div className={`absolute top-[15px] left-[-15px] w-10 h-10 ${colors.body} rounded-full border-l-4 border-t-4 ${colors.border} -rotate-45`} />
            </div>
          </div>
        )}

        {/* Swimming Ducks */}
        <div className="absolute bottom-[20%] left-0 w-full h-16 animate-[duck-swim-x_15s_linear_infinite]">
          <div className={`absolute left-[-150px] w-16 h-16 ${colors.body} rounded-full border-4 ${colors.border} animate-[duck-bob-y_2s_ease-in-out_infinite]`}>
            <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full border-2 border-black flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
            </div>
            <div className={`absolute top-6 right-[-10px] w-6 h-4 ${colors.beak} rounded-full`} />
            <div className={`absolute bottom-[-4px] left-[10px] w-8 h-4 ${colors.wing} rounded-full`} />
            <div className={`absolute top-[10px] left-[-10px] w-6 h-6 ${colors.body} rounded-full border-l-4 border-t-4 ${colors.border} -rotate-45`} /> {/* Tail */}
          </div>
        </div>

        {!optimizationMode && (
          <>
            <div className="absolute bottom-[35%] left-0 w-full h-12 animate-[duck-swim-x-reverse_20s_linear_infinite]" style={{ animationDelay: '5s' }}>
              <div className={`absolute right-[-150px] w-12 h-12 ${colors.body} rounded-full border-4 ${colors.border} animate-[duck-bob-y-reverse_2.5s_ease-in-out_infinite]`}>
                <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full border-2 border-black flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full" />
                </div>
                <div className={`absolute top-4 right-[-8px] w-4 h-3 ${colors.beak} rounded-full`} />
                <div className={`absolute bottom-[-3px] left-[8px] w-6 h-3 ${colors.wing} rounded-full`} />
                <div className={`absolute top-[8px] left-[-8px] w-4 h-4 ${colors.body} rounded-full border-l-4 border-t-4 ${colors.border} -rotate-45`} /> {/* Tail */}
              </div>
            </div>

            <div className="absolute bottom-[10%] left-0 w-full h-20 animate-[duck-swim-x_25s_linear_infinite]" style={{ animationDelay: '10s' }}>
              <div className={`absolute left-[-150px] w-20 h-20 ${colors.body} rounded-full border-4 ${colors.border} animate-[duck-bob-y_3s_ease-in-out_infinite]`}>
                <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full border-2 border-black flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full" />
                </div>
                <div className={`absolute top-8 right-[-12px] w-8 h-5 ${colors.beak} rounded-full`} />
                <div className={`absolute bottom-[-5px] left-[12px] w-10 h-5 ${colors.wing} rounded-full`} />
                <div className={`absolute top-[12px] left-[-12px] w-8 h-8 ${colors.body} rounded-full border-l-4 border-t-4 ${colors.border} -rotate-45`} /> {/* Tail */}
              </div>
            </div>

            {/* Bubbles */}
            <div className="absolute bottom-[10%] left-[15%] w-4 h-4 bg-white/50 rounded-full animate-float" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-[25%] right-[25%] w-6 h-6 bg-white/40 rounded-full animate-float" style={{ animationDuration: '4s', animationDelay: '1s' }} />
            <div className="absolute top-[40%] left-[40%] w-3 h-3 bg-white/60 rounded-full animate-float" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
            <div className="absolute top-[15%] right-[15%] w-8 h-8 bg-white/30 rounded-full animate-float" style={{ animationDuration: '5s', animationDelay: '2s' }} />

            {/* Soap Bubbles */}
            <div className="absolute bottom-[20%] left-[25%] w-8 h-8 rounded-full border-2 border-white/40 bg-white/10 opacity-0 animate-[soap-bubble-pop_5s_ease-in_infinite]" style={{ animationDelay: '0.5s' }}>
              <div className="absolute top-1 right-2 w-2 h-2 bg-white/60 rounded-full" />
            </div>
            <div className="absolute bottom-[15%] right-[35%] w-12 h-12 rounded-full border-2 border-white/40 bg-white/10 opacity-0 animate-[soap-bubble-pop_6s_ease-in_infinite]" style={{ animationDelay: '2.5s' }}>
              <div className="absolute top-2 right-3 w-3 h-3 bg-white/60 rounded-full" />
            </div>
          </>
        )}

        {/* Quacks */}
        <FloatingQuack className={`absolute top-[30%] left-[20%] ${colors.text1} font-black text-2xl opacity-0 animate-[quack-float_4s_ease-out_infinite]`} style={{ animationDelay: '1s', textShadow: `2px 2px 0 ${colors.shadow1}` }} />
        {!optimizationMode && (
          <>
            <FloatingQuack className={`absolute top-[60%] right-[30%] ${colors.text2} font-black text-xl opacity-0 animate-[quack-float_5s_ease-out_infinite]`} style={{ animationDelay: '3s', textShadow: `2px 2px 0 ${colors.shadow2}` }} />
            <FloatingQuack className={`absolute top-[40%] left-[60%] ${colors.text3} font-black text-3xl opacity-0 animate-[quack-float_6s_ease-out_infinite]`} style={{ animationDelay: '2s', textShadow: `2px 2px 0 ${colors.shadow3}` }} />
          </>
        )}
      </>
    )}
  </div>
  );
};

const UndertaleBackground = ({ theme, performanceMode, optimizationMode }: { theme: AppTheme, performanceMode?: boolean, optimizationMode?: boolean }) => {
  const [currentPhrase, setCurrentPhrase] = useState<{ id: number; text: string } | null>(null);
  
  const isChara = theme.accentColor === 'undertale-red';

  const charaQuotes = [
    "Since when were you the one in control?",
    "Greetings.",
    "I am Chara.",
    "Let us erase this pointless world.",
    "Right. You are a great partner.",
    "We'll be together forever, won't we?",
    "No chocolate.",
    "Where are the knives.",
    "In this world, it's kill or be killed.",
    "But nobody came.",
    "You felt your sins crawling on your back."
  ];

  const sansQuotes = [
    "you're gonna have a bad time.",
    "it's a beautiful day outside.",
    "birds are singing, flowers are blooming...",
    "on days like these, kids like you...",
    "Should be burning in hell.",
    "do you wanna have a bad time?",
    "get dunked on!",
    "here we go.",
    "welp, i'm going to grillby's.",
    "papyrus, do you want anything?",
    "just kidding."
  ];

  const undertaleQuotes = isChara ? charaQuotes : sansQuotes;

  useEffect(() => {
    if (theme.visualStyle !== 'undertale' || performanceMode) return;

    const spawnPhrase = () => {
      const id = Date.now();
      const text = undertaleQuotes[Math.floor(Math.random() * undertaleQuotes.length)];
      
      setCurrentPhrase({ id, text });
      
      // Clear phrase after 5 seconds
      setTimeout(() => {
        setCurrentPhrase(prev => prev?.id === id ? null : prev);
      }, 5000);
    };

    // Initial spawn
    spawnPhrase();

    // Interval to spawn a new phrase every 8 seconds (5s display + 3s gap)
    const interval = setInterval(() => {
      spawnPhrase();
    }, 8000);

    return () => clearInterval(interval);
  }, [theme.visualStyle, isChara, performanceMode]);

  return (
    <div className="absolute inset-0 z-[-10] pointer-events-none overflow-hidden opacity-0 group-[.visual-undertale]/undertale:opacity-100 transition-opacity duration-500 bg-black">
      {/* Static Fallback / Base */}
      <div className="static-fallback absolute inset-0 bg-black">
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CiAgPHJlY3QgeD0iOSIgeT0iOSIgd2lkdGg9IjIiIGhlaWdodD0iMiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=')] [image-rendering:pixelated]" />
      </div>

      {!performanceMode && (
        <>
          {/* Starry Background */}
          {[...Array(optimizationMode ? 20 : 100)].map((_, i) => (
        <div
          key={i}
          className={`absolute ${isChara ? 'bg-red-500' : 'bg-cyan-400'} rounded-full animate-pulse`}
          style={{
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animationDelay: Math.random() * 5 + 's',
            animationDuration: Math.random() * 3 + 2 + 's',
            opacity: Math.random() * 0.5 + 0.2
          }}
        />
      ))}

      {/* Floating Soul (Heart) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-10">
        <Heart 
          className={`w-96 h-96 ${isChara ? 'text-red-600' : 'text-cyan-500'} animate-undertale-heart fill-current blur-sm`} 
          strokeWidth={0.5}
        />
      </div>

      {/* Random Floating Phrases */}
      <AnimatePresence mode="wait">
        {currentPhrase && (
          <motion.div
            key={currentPhrase.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-10 pointer-events-none left-1/2 -translate-x-1/2 bottom-16 w-full flex justify-center px-4"
          >
            <div className={`animate-undertale-phrase ${isChara ? 'text-[#ff0000] drop-shadow-[0_0_12px_rgba(255,0,0,0.9)]' : 'text-[#00ffff] drop-shadow-[0_0_12px_rgba(0,255,255,0.9)]'} font-pixel text-xs sm:text-sm md:text-base text-center max-w-[85vw] break-words`}>
              <span className="undertale-shine-text leading-relaxed">{currentPhrase.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centered Video Frame */}
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12 z-0">
        <div className="relative w-full max-w-[90vw] sm:max-w-[75vw] md:max-w-[640px] aspect-video video-container group-[.visual-undertale]/undertale:animate-undertale-float">
          {/* Main Battle Box Border */}
          <div className="absolute -inset-[4px] border-[6px] border-white bg-black" />
          
          {/* Inner Content Area */}
          <div className="absolute inset-0 bg-black overflow-hidden">
            <video 
              src="https://image2url.com/r2/default/videos/1774807605895-ed7215fc-de45-4b10-a3aa-cc81c0bb20e2.mp4"
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover opacity-80 mix-blend-screen"
            />
            
            {/* Video Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none" />
            
            {/* Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
          </div>

          {/* Undertale Corner Brackets */}
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-white" />
          <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-white" />
          <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-white" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-white" />
          
          {/* Decorative Pixel Dots */}
          <div className="absolute top-1/2 -left-1 w-2 h-2 bg-white -translate-y-1/2" />
          <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white -translate-y-1/2" />
          <div className="absolute left-1/2 -top-1 w-2 h-2 bg-white -translate-x-1/2" />
          <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-white -translate-x-1/2" />
        </div>
      </div>

      {/* Scanlines Overlay */}
      <div className="undertale-scanlines opacity-30" />

      {/* Retro CRT Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,3px_100%] pointer-events-none" />
        </>
      )}
    </div>
  );
};

const ExamCreator = ({ onGenerate, setView, theme, settings }: { onGenerate: (questions: Question[]) => void, setView: (v: View) => void, theme: AppTheme, settings: ExamSettings }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [parseText, setParseText] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'build' | 'parse' | 'wizard'>('build');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      question: '',
      options: (type === 'mcq' || type === 'multi_select') ? ['', '', '', ''] : undefined,
      correctAnswer: type === 'mcq' ? '' : type === 'true_false' ? 'True' : '',
      correctAnswers: type === 'multi_select' ? [] : undefined,
      matchingPairs: type === 'matching' ? [{ term: '', definition: '' }] : undefined,
      matchingDistractors: type === 'matching' ? [] : undefined,
      blanks: type === 'fill_in_blanks' ? [] : undefined,
      wordBank: type === 'fill_in_blanks' ? [] : undefined,
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
    setEditingIndex(questions.length);
    setActiveTab('build');
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateQuestion(index, { imageUrl: base64 });
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleHtmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const match = content.match(/const EXAM_DATA = (\[[\s\S]*?\]);\s*[\s\S]*?const THEME =/s);
        if (match && match[1]) {
          const parsedQuestions = JSON.parse(match[1]);
          if (Array.isArray(parsedQuestions)) {
            setQuestions(parsedQuestions);
            setActiveTab('build');
          }
        }
      } catch (err) {
        setError('Failed to parse the uploaded HTML file.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleParse = () => {
    // When parsing, pull the active image vault if it exists, or let parseInput resolve it internally
    const parsed = parseInput(parseText);
    if (parsed.length > 0) {
      setQuestions([...questions, ...parsed]);
      setParseText('');
      setActiveTab('build');
    } else {
      setError('No valid questions found in the text.');
    }
  };

  const handleDownload = () => {
    if (questions.length === 0) return;
    const htmlContent = generateStandaloneExam(questions, theme, settings);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `created-exam-${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-b-8 border-indigo-100 dark:border-indigo-900 shadow-xl">
        <div className="space-y-2">
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-indigo-500 font-black uppercase text-[10px] tracking-widest hover:translate-x-[-4px] transition-all">
            <ChevronLeft className="w-3 h-3" /> Back to Home
          </button>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">Exam Creator</h2>
          <p className="text-indigo-500 font-black text-xs uppercase tracking-[0.2em]">Build or edit your exam manually</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input type="file" accept=".html" ref={fileInputRef} onChange={handleHtmlUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase text-[10px] rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <button onClick={handleDownload} disabled={questions.length === 0} className="px-6 py-3 bg-indigo-600 text-white font-black uppercase text-[10px] rounded-xl shadow-[0_4px_0_var(--color-indigo-900)] hover:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={() => onGenerate(questions)} disabled={questions.length === 0} className="px-6 py-3 bg-emerald-600 text-white font-black uppercase text-[10px] rounded-xl shadow-[0_4px_0_rgb(5,150,105)] hover:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50">
            <PlayCircle className="w-3.5 h-3.5" /> Start
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row border-b-2 border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('build')}
            className={`flex-1 py-4 font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'build' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 sm:border-b-4 sm:border-r-0 border-r-0 border-b-4 sm:border-b-4 border-indigo-500' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            Build Questions
          </button>
          <button 
            onClick={() => setActiveTab('parse')}
            className={`flex-1 py-4 font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'parse' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 sm:border-b-4 border-b-4 border-indigo-500' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            Parse Code
          </button>
          <button 
            onClick={() => setActiveTab('wizard')}
            className={`flex-1 flex justify-center items-center gap-2 py-4 font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'wizard' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-b-4 border-amber-500' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Sparkles className="w-4 h-4" /> Easy Photo Mode
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'wizard' ? (
            <EasyQuestionWizard onBack={() => setActiveTab('build')} />
          ) : activeTab === 'build' ? (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <button onClick={() => addQuestion('mcq')} className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-100 transition-all">
                  <PlusCircle className="w-4 h-4" /> Multiple Choice
                </button>
                <button onClick={() => addQuestion('multi_select')} className="px-4 py-3 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-violet-100 transition-all">
                  <PlusCircle className="w-4 h-4" /> Multi-Select
                </button>
                <button onClick={() => addQuestion('true_false')} className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-100 transition-all">
                  <PlusCircle className="w-4 h-4" /> True / False
                </button>
                <button onClick={() => addQuestion('matching')} className="px-4 py-3 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-cyan-100 transition-all">
                  <PlusCircle className="w-4 h-4" /> Matching
                </button>
                <button onClick={() => addQuestion('fill_in_blanks')} className="px-4 py-3 bg-lime-50 dark:bg-lime-900/20 text-lime-600 dark:text-lime-400 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-lime-100 transition-all">
                  <PlusCircle className="w-4 h-4" /> Fill in Blanks
                </button>
                <button onClick={() => addQuestion('essay')} className="px-4 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-rose-100 transition-all">
                  <PlusCircle className="w-4 h-4" /> Essay
                </button>
                <button onClick={() => addQuestion('multi_essay')} className="px-4 py-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-pink-100 transition-all">
                  <PlusCircle className="w-4 h-4" /> Multi Essay
                </button>
                <button onClick={() => addQuestion('locate_on_image')} className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-amber-100 transition-all">
                  <PlusCircle className="w-4 h-4" /> Locate on Image
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className={`bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 transition-all ${editingIndex === idx ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className="p-5 flex items-start gap-4">
                      <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center font-black text-slate-500 shrink-0 text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0 space-y-4">
                        {editingIndex === idx ? (
                          <div className="space-y-4">
                            <textarea
                              value={q.question}
                              onChange={(e) => updateQuestion(idx, { question: e.target.value })}
                              className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold outline-none focus:border-indigo-500"
                              placeholder="Type your question..."
                            />
                            
                            <div className="flex flex-wrap items-center gap-2">
                              <Star className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider shrink-0">Badge (optional):</span>
                              <input
                                placeholder="Important, Focus..."
                                value={q.badge || ''}
                                onChange={(e) => updateQuestion(idx, { badge: e.target.value })}
                                className="flex-1 min-w-0 px-3 py-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-xs font-bold rounded-lg outline-none focus:border-amber-500"
                              />
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4">
                              {q.imageUrl && (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                                  <img src={q.imageUrl} className="w-full h-full object-cover" />
                                  <button onClick={() => updateQuestion(idx, { imageUrl: undefined })} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                              <button onClick={() => imageInputRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all">
                                <ImageIcon className="w-5 h-5" />
                                <span className="text-[7px] font-black uppercase">Image</span>
                              </button>
                              <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleImageUpload(e, idx)} className="hidden" />
                            </div>

                            {q.type === 'mcq' && q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct-${q.id}`}
                                      checked={q.correctAnswer === opt && opt !== ''}
                                      onChange={() => updateQuestion(idx, { correctAnswer: opt })}
                                      className="w-4 h-4 text-indigo-600"
                                    />
                                    <input
                                      value={opt}
                                      onChange={(e) => {
                                        const newOpts = [...q.options!];
                                        newOpts[optIdx] = e.target.value;
                                        updateQuestion(idx, { options: newOpts });
                                      }}
                                      className="flex-1 min-w-0 p-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                                      placeholder={`Option ${optIdx + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {q.type === 'multi_select' && q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={q.correctAnswers?.includes(opt) && opt !== ''}
                                      onChange={() => {
                                        const newAnswers = q.correctAnswers ? [...q.correctAnswers] : [];
                                        if (newAnswers.includes(opt)) {
                                          updateQuestion(idx, { correctAnswers: newAnswers.filter(a => a !== opt) });
                                        } else {
                                          updateQuestion(idx, { correctAnswers: [...newAnswers, opt] });
                                        }
                                      }}
                                      className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    <input
                                      value={opt}
                                      onChange={(e) => {
                                        const newOpts = [...q.options!];
                                        const oldVal = newOpts[optIdx];
                                        newOpts[optIdx] = e.target.value;
                                        const newAnswers = q.correctAnswers?.map(a => a === oldVal ? e.target.value : a) || [];
                                        updateQuestion(idx, { options: newOpts, correctAnswers: newAnswers });
                                      }}
                                      className="flex-1 min-w-0 p-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                                      placeholder={`Option ${optIdx + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {q.type === 'matching' && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pairs</p>
                                  {(q.matchingPairs || []).map((pair, pIdx) => (
                                    <div key={pIdx} className="flex items-center gap-2">
                                      <input
                                        value={pair.term}
                                        onChange={(e) => {
                                          const newPairs = [...q.matchingPairs!];
                                          newPairs[pIdx] = { ...pair, term: e.target.value };
                                          updateQuestion(idx, { matchingPairs: newPairs });
                                        }}
                                        className="flex-1 min-w-0 p-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                                        placeholder="Term"
                                      />
                                      <input
                                        value={pair.definition}
                                        onChange={(e) => {
                                          const newPairs = [...q.matchingPairs!];
                                          newPairs[pIdx] = { ...pair, definition: e.target.value };
                                          updateQuestion(idx, { matchingPairs: newPairs });
                                        }}
                                        className="flex-1 min-w-0 p-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                                        placeholder="Definition"
                                      />
                                      <button onClick={() => {
                                        const newPairs = q.matchingPairs!.filter((_, i) => i !== pIdx);
                                        updateQuestion(idx, { matchingPairs: newPairs });
                                      }} className="p-1 text-red-500">
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                  <button onClick={() => updateQuestion(idx, { matchingPairs: [...(q.matchingPairs || []), { term: '', definition: '' }] })} className="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add Pair
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distractors (Extra Definitions)</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(q.matchingDistractors || []).map((dist, dIdx) => (
                                      <div key={dIdx} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                        <input
                                          value={dist}
                                          onChange={(e) => {
                                            const newDist = [...q.matchingDistractors!];
                                            newDist[dIdx] = e.target.value;
                                            updateQuestion(idx, { matchingDistractors: newDist });
                                          }}
                                          className="bg-transparent text-[10px] font-bold outline-none w-20"
                                        />
                                        <button onClick={() => updateQuestion(idx, { matchingDistractors: q.matchingDistractors!.filter((_, i) => i !== dIdx) })} className="text-red-500">
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                    <button onClick={() => updateQuestion(idx, { matchingDistractors: [...(q.matchingDistractors || []), ''] })} className="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-1">
                                      <Plus className="w-3 h-3" /> Add Distractor
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {q.type === 'fill_in_blanks' && (
                              <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Use "__________" (10 underscores) for blanks</p>
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct Words (in order)</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(q.blanks || []).map((blank, bIdx) => (
                                      <div key={bIdx} className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                        <input
                                          value={blank}
                                          onChange={(e) => {
                                            const newBlanks = [...q.blanks!];
                                            newBlanks[bIdx] = e.target.value;
                                            updateQuestion(idx, { blanks: newBlanks });
                                          }}
                                          className="bg-transparent text-[10px] font-bold outline-none w-20 text-emerald-600 dark:text-emerald-400"
                                        />
                                        <button onClick={() => updateQuestion(idx, { blanks: q.blanks!.filter((_, i) => i !== bIdx) })} className="text-red-500">
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                    <button onClick={() => updateQuestion(idx, { blanks: [...(q.blanks || []), ''] })} className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                                      <Plus className="w-3 h-3" /> Add Blank
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Word Bank (all options)</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(q.wordBank || []).map((word, wIdx) => (
                                      <div key={wIdx} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                        <input
                                          value={word}
                                          onChange={(e) => {
                                            const newBank = [...q.wordBank!];
                                            newBank[wIdx] = e.target.value;
                                            updateQuestion(idx, { wordBank: newBank });
                                          }}
                                          className="bg-transparent text-[10px] font-bold outline-none w-20"
                                        />
                                        <button onClick={() => updateQuestion(idx, { wordBank: q.wordBank!.filter((_, i) => i !== wIdx) })} className="text-red-500">
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                    <button onClick={() => updateQuestion(idx, { wordBank: [...(q.wordBank || []), ''] })} className="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-1">
                                      <Plus className="w-3 h-3" /> Add Word
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {q.type === 'true_false' && (
                              <div className="space-y-3">
                                <div className="flex gap-3">
                                  {['True', 'False'].map((val) => (
                                    <button
                                      key={val}
                                      onClick={() => updateQuestion(idx, { correctAnswer: val })}
                                      className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${q.correctAnswer === val ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 border-2 border-slate-100 dark:border-slate-800'}`}
                                    >
                                      {val}
                                    </button>
                                  ))}
                                </div>
                                {q.correctAnswer === 'False' && (
                                  <input
                                    value={q.wrongPart || ''}
                                    onChange={(e) => updateQuestion(idx, { wrongPart: e.target.value })}
                                    className="w-full p-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                                    placeholder="Word that makes it false..."
                                  />
                                )}
                              </div>
                            )}

                            {q.type === 'essay' && (
                              <textarea
                                value={q.correctAnswer}
                                onChange={(e) => updateQuestion(idx, { correctAnswer: e.target.value })}
                                className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold outline-none focus:border-indigo-500"
                                placeholder="Reference answer for AI grading..."
                              />
                            )}

                            {q.type === 'locate_on_image' && (
                              <div className="space-y-4">
                                {!q.imageUrl ? (
                                  <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600">
                                      <ImageIcon className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">No Image Uploaded</p>
                                      <p className="text-xs text-slate-400 max-w-[200px]">Upload an image using the button above to start adding targets.</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between px-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interactive Canvas</p>
                                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">Click to add targets</span>
                                      </div>
                                      <div 
                                        className="relative w-full rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl cursor-crosshair group"
                                        onClick={(e) => {
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                                          const newTarget = {
                                            id: Math.random().toString(36).substring(2, 9),
                                            x, y, radius: 5, label: `Target ${(q.imageTargets?.length || 0) + 1}`
                                          };
                                          updateQuestion(idx, { imageTargets: [...(q.imageTargets || []), newTarget] });
                                        }}
                                      >
                                        {q.imageUrl && <img src={q.imageUrl} className="w-full h-auto block pointer-events-none" />}
                                        <AnimatePresence>
                                          {q.imageTargets?.map((target, tIdx) => (
                                            <motion.div 
                                              key={target.id}
                                              initial={{ scale: 0, opacity: 0 }}
                                              animate={{ scale: 1, opacity: 1 }}
                                              exit={{ scale: 0, opacity: 0 }}
                                              className="absolute border-4 border-amber-500 bg-amber-500/20 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group/target"
                                              style={{ left: `${target.x}%`, top: `${target.y}%`, width: `${target.radius * 2}%`, height: `${target.radius * 2}%`, minWidth: '30px', minHeight: '30px' }}
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <div className="absolute -bottom-8 px-2 py-0.5 bg-amber-600 text-white text-[10px] font-black rounded-lg shadow-lg whitespace-nowrap z-10">
                                                {target.label}
                                              </div>
                                              <button 
                                                className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/target:opacity-100 transition-all hover:scale-110 z-20"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  updateQuestion(idx, { imageTargets: q.imageTargets!.filter(t => t.id !== target.id) });
                                                }}
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </motion.div>
                                          ))}
                                        </AnimatePresence>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between px-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Configuration</p>
                                        <button 
                                          onClick={() => updateQuestion(idx, { imageTargets: [] })}
                                          className="text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest flex items-center gap-1"
                                        >
                                          <RotateCcw className="w-3 h-3" /> Clear All
                                        </button>
                                      </div>
                                      
                                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(!q.imageTargets || q.imageTargets.length === 0) ? (
                                          <div className="h-40 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[1.5rem]">
                                            <MousePointer2 className="w-8 h-8 mb-2 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-tighter">Click image to add targets</p>
                                          </div>
                                        ) : (
                                          q.imageTargets.map((target, tIdx) => (
                                            <motion.div 
                                              key={target.id} 
                                              initial={{ x: 20, opacity: 0 }}
                                              animate={{ x: 0, opacity: 1 }}
                                              className="flex flex-col gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 shadow-sm"
                                            >
                                              <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-inner">{tIdx + 1}</span>
                                                <input 
                                                  value={target.label || ''} 
                                                  onChange={(e) => {
                                                    const newTargets = [...q.imageTargets!];
                                                    newTargets[tIdx] = { ...target, label: e.target.value };
                                                    updateQuestion(idx, { imageTargets: newTargets });
                                                  }}
                                                  className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 dark:focus:border-amber-600 rounded-xl px-3 py-2 text-sm font-bold outline-none transition-all"
                                                  placeholder="Target label (e.g., Moon)"
                                                />
                                                <button 
                                                  onClick={() => updateQuestion(idx, { imageTargets: q.imageTargets!.filter(t => t.id !== target.id) })}
                                                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                              </div>
                                              <div className="flex items-center gap-4 px-1">
                                                <div className="flex-1 space-y-1">
                                                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span>Target Size</span>
                                                    <span>{target.radius}%</span>
                                                  </div>
                                                  <input 
                                                    type="range" 
                                                    min="1" max="25" 
                                                    value={isNaN(target.radius) ? 5 : target.radius} 
                                                    onChange={(e) => {
                                                      const newTargets = [...q.imageTargets!];
                                                      newTargets[tIdx] = { ...target, radius: parseInt(e.target.value) };
                                                      updateQuestion(idx, { imageTargets: newTargets });
                                                    }}
                                                    className="w-full accent-amber-500"
                                                  />
                                                </div>
                                              </div>
                                            </motion.div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            <textarea
                              value={q.explanation}
                              onChange={(e) => updateQuestion(idx, { explanation: e.target.value })}
                              className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-medium outline-none focus:border-indigo-500"
                              placeholder="Explanation..."
                            />

                            <div className="flex justify-end">
                              <button onClick={() => setEditingIndex(null)} className="px-6 py-2 bg-indigo-600 text-white font-black uppercase text-[10px] rounded-lg shadow-[0_3px_0_var(--color-indigo-900)] hover:translate-y-0.5 active:shadow-none transition-all">
                                Save Question
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{q.question || <span className="text-slate-400 italic">Empty question...</span>}</p>
                              <div className="flex gap-2">
                                <span className="text-[8px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded">{q.type}</span>
                                {q.imageUrl && <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">Image</span>}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => setEditingIndex(idx)} className="p-2 text-slate-400 hover:text-indigo-500 transition-all">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteQuestion(idx)} className="p-2 text-slate-400 hover:text-red-500 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {questions.length === 0 && (
                  <div className="py-16 text-center space-y-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto text-slate-300">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="font-black uppercase text-slate-400 tracking-widest text-xs">Start by adding a question above</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black uppercase text-[10px] text-slate-400 tracking-widest">Paste JSON or CSV</h3>
                <button onClick={() => setParseText('')} className="text-[10px] font-black uppercase text-indigo-500 hover:underline">Clear</button>
              </div>
              <textarea
                value={parseText}
                onChange={(e) => setParseText(e.target.value)}
                placeholder="[ { 'question': '...', 'type': 'mcq', ... } ]"
                className="w-full h-64 p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-mono outline-none focus:border-indigo-500 transition-all"
              />
              <button onClick={handleParse} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-xs rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                <FileCode className="w-4 h-4" /> Parse & Add to List
              </button>
              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Home = ({ onStart, onStartCreator, onStartReadyExams, onStartMultiplayer, theme, ultVariant }: { onStart: () => void, onStartCreator: () => void, onStartReadyExams: () => void, onStartMultiplayer: () => void, theme: AppTheme, ultVariant: number }) => {
  const [clicks, setClicks] = useState<{id: number, x: number, y: number, rot: number}[]>([]);
  
  const handleScreenClick = (e: React.MouseEvent) => {
    if (theme.visualStyle === 'saidi') {
      const rot = Math.random() * 40 - 20;
      const newClick = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY, rot };
      
      // Play Saidi sound
      const audio = new Audio('https://image2url.com/r2/default/audio/1775099380152-ee63eaea-59c5-470b-b0fd-6f86a50dabdc.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.error("Saidi audio play failed:", err));

      setClicks(prev => {
        const next = [...prev, newClick];
        return next.length > 15 ? next.slice(next.length - 15) : next;
      });
      setTimeout(() => {
        setClicks(prev => prev.filter(c => c.id !== newClick.id));
      }, 1200);
    }
  };

  return (
  <div onClick={handleScreenClick} className={`flex flex-col items-center justify-center min-h-[80vh] text-center px-4 relative overflow-hidden group/modern group/game-minecraft group/tadc group/duck group/adventure-time group/undertale group/saidi visual-${theme.visualStyle}`}>
    <AnimatePresence>
      {clicks.map(click => (
        <motion.div
          key={click.id}
          initial={{ opacity: 0, x: "-50%", y: "-50%", scale: 0.3, rotate: click.rot - 30 }}
          animate={{ opacity: [0, 1, 0.8, 0], x: "-50%", y: ["-50%", "-150%", "-250%"], scale: [0.3, 1.5, 1.2], rotate: click.rot }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="fixed pointer-events-none z-[100] text-5xl sm:text-6xl font-black text-amber-600 dark:text-amber-400"
          style={{ 
            left: click.x, 
            top: click.y,
            textShadow: '0 4px 12px rgba(0,0,0,0.3), 0 0 20px rgba(217, 119, 6, 0.5)',
            WebkitTextStroke: '1.5px rgba(255,255,255,0.8)',
          }}
        >
          وه
        </motion.div>
      ))}
    </AnimatePresence>
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-8 sm:space-y-12 relative z-10 w-full max-w-4xl"
    >
      <div className="space-y-2 sm:space-y-4">
        {/* Removed redundant vessel as HollowKnightBackgroundEffect handles it */}
        <h1 className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none drop-shadow-sm flex flex-wrap justify-center gap-x-3 sm:gap-x-6 group-[.visual-tadc]/tadc:animate-tadc-glitch group-[.visual-undertale]/undertale:font-pixel group-[.visual-undertale]/undertale:text-5xl sm:group-[.visual-undertale]/undertale:text-7xl group-[.visual-undertale]/undertale:not-italic group-[.visual-undertale]/undertale:tracking-widest chaos-element filter-stroke-black" style={{ fontFamily: theme.customTheme ? 'var(--custom-font-family)' : undefined }}>
          {theme.customTheme ? (
            <AnimatedText theme={theme} data-text={theme.customTheme.interfaceName}>
              {theme.customTheme.interfaceName}
            </AnimatedText>
          ) : (
            <>
              <AnimatedText 
                theme={theme} 
                data-text={theme.visualStyle === 'adventure-time' ? 'Adventure' : theme.visualStyle === 'ultimate' ? 'Arcane' : theme.visualStyle === 'virus' ? 'Bio' : 'Arcane'} 
                className={`group-[.visual-arcane]/arcane:text-transparent group-[.visual-arcane]/arcane:bg-clip-text group-[.visual-arcane]/arcane:bg-gradient-to-r group-[.visual-arcane]/arcane:from-violet-500 group-[.visual-arcane]/arcane:via-fuchsia-500 group-[.visual-arcane]/arcane:to-purple-600 group-[.visual-arcane]/arcane:drop-shadow-[0_0_15px_rgba(138,43,226,0.8)] group-[.visual-ultimate]/ultimate:text-transparent group-[.visual-ultimate]/ultimate:bg-clip-text group-[.visual-ultimate]/ultimate:bg-gradient-to-r group-[.visual-ultimate]/ultimate:from-cyan-400 group-[.visual-ultimate]/ultimate:via-fuchsia-500 group-[.visual-ultimate]/ultimate:to-purple-600 group-[.ult-variant-9]/ultimate:from-green-400 group-[.ult-variant-9]/ultimate:via-yellow-300 group-[.ult-variant-9]/ultimate:to-pink-400 group-[.visual-virus]/virus:text-inherit group-[.visual-virus]/virus:!-webkit-text-fill-color-inherit ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : ''}`}
                style={theme.visualStyle === 'ultimate' ? { color: getVariantStyles(ultVariant).accent1, backgroundImage: 'none', WebkitTextFillColor: 'initial' } : theme.visualStyle === 'virus' ? { backgroundImage: 'none', WebkitTextFillColor: 'initial', color: 'inherit' } : {}}
              >
                {theme.visualStyle === 'adventure-time' ? 'Adventure' : theme.visualStyle === 'ultimate' ? 'Arcane' : theme.visualStyle === 'virus' ? 'Bio' : 'Arcane'}
              </AnimatedText>
              <AnimatedText 
                theme={theme} 
                className={`text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-indigo-400 group-[.visual-tadc]/tadc:from-red-600 group-[.visual-tadc]/tadc:to-blue-600 group-[.visual-undertale]/undertale:text-white group-[.visual-undertale]/undertale:bg-none group-[.visual-arcane]/arcane:text-white group-[.visual-arcane]/arcane:drop-shadow-[0_0_15px_rgba(138,43,226,0.8)] group-[.visual-arcane]/arcane:bg-none group-[.visual-ultimate]/ultimate:from-purple-600 group-[.visual-ultimate]/ultimate:via-fuchsia-500 group-[.visual-ultimate]/ultimate:to-cyan-400 group-[.ult-variant-9]/ultimate:from-pink-400 group-[.ult-variant-9]/ultimate:via-yellow-300 group-[.ult-variant-9]/ultimate:to-green-400 group-[.visual-virus]/virus:bg-none group-[.visual-virus]/virus:text-inherit group-[.visual-virus]/virus:!-webkit-text-fill-color-inherit ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : ''}`} 
                data-text={theme.visualStyle === 'adventure-time' ? 'Time' : theme.visualStyle === 'ultimate' ? 'Exam' : theme.visualStyle === 'virus' ? 'Hazard' : 'EXAMS'}
                style={theme.visualStyle === 'ultimate' ? { color: getVariantStyles(ultVariant).accent2, backgroundImage: 'none', WebkitTextFillColor: 'initial' } : theme.visualStyle === 'virus' ? { backgroundImage: 'none', WebkitTextFillColor: 'initial', color: 'inherit' } : {}}
              >
                {theme.visualStyle === 'adventure-time' ? 'Time' : theme.visualStyle === 'ultimate' ? 'Exam' : theme.visualStyle === 'virus' ? 'Hazard' : 'EXAMS'}
              </AnimatedText>
            </>
          )}
        </h1>
      </div>
      
      <div className="flex flex-col items-center gap-4 sm:gap-6 w-full px-2 sm:px-0">
        <button
          onClick={() => { onStart(); }}
          className={`group relative z-10 px-6 py-4 sm:px-16 sm:py-8 md:px-20 md:py-10 bg-indigo-600 text-white font-black text-lg sm:text-2xl md:text-3xl uppercase tracking-tighter rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_8px_0_var(--color-indigo-900)] sm:hover:shadow-[0_6px_0_var(--color-indigo-900)] hover:translate-y-1 sm:hover:translate-y-1.5 active:shadow-none active:translate-y-2 sm:active:translate-y-3 transition-all overflow-hidden w-full max-w-md group-[.visual-modern]/modern:rounded-[2rem] sm:group-[.visual-modern]/modern:rounded-[3rem] group-[.visual-undertale]/undertale:border-4 group-[.visual-undertale]/undertale:border-white group-[.visual-undertale]/undertale:bg-black group-[.visual-undertale]/undertale:shadow-none group-[.visual-undertale]/undertale:rounded-none home-start-button filter-stroke-black ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : ''}`}
          style={theme.customTheme ? { backgroundColor: theme.customTheme.buttonColor, fontFamily: 'var(--custom-font-family)' } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 group-[.visual-undertale]/undertale:hidden" />
          <span className="relative z-10 flex items-center justify-center gap-3 sm:gap-4">
            Solo mode <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
          </span>
        </button>

        <button
          onClick={() => { onStartMultiplayer(); }}
          className={`group relative z-10 px-6 py-4 sm:px-10 sm:py-6 bg-violet-600 text-white font-black text-base sm:text-xl uppercase tracking-tighter rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_6px_0_var(--color-violet-900)] sm:shadow-[0_8px_0_var(--color-violet-900)] hover:shadow-[0_3px_0_var(--color-violet-900)] sm:hover:shadow-[0_4px_0_var(--color-violet-900)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all overflow-hidden w-full max-w-md group-[.visual-modern]/modern:rounded-[2rem] sm:group-[.visual-modern]/modern:rounded-[2.5rem] group-[.visual-undertale]/undertale:border-4 group-[.visual-undertale]/undertale:border-white group-[.visual-undertale]/undertale:bg-black group-[.visual-undertale]/undertale:shadow-none group-[.visual-undertale]/undertale:rounded-none home-start-button filter-stroke-black ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 group-[.visual-undertale]/undertale:hidden" />
          <span className="relative z-10 flex items-center justify-center gap-3">
            Multiplayer <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </span>
        </button>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md">
          <button
            onClick={() => { onStartCreator(); }}
            className={`group relative z-10 flex-1 px-6 py-4 sm:px-10 sm:py-6 bg-emerald-600 text-white font-black text-base sm:text-xl uppercase tracking-tighter rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_6px_0_var(--color-emerald-900)] sm:shadow-[0_8px_0_var(--color-emerald-900)] hover:shadow-[0_3px_0_var(--color-emerald-900)] sm:hover:shadow-[0_4px_0_var(--color-emerald-900)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all overflow-hidden group-[.visual-modern]/modern:rounded-[2rem] sm:group-[.visual-modern]/modern:rounded-[2.5rem] group-[.visual-undertale]/undertale:border-4 group-[.visual-undertale]/undertale:border-white group-[.visual-undertale]/undertale:bg-black group-[.visual-undertale]/undertale:shadow-none group-[.visual-undertale]/undertale:rounded-none home-start-button filter-stroke-black ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 group-[.visual-undertale]/undertale:hidden" />
            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
              Create <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
          </button>
          
          <button
            onClick={() => { onStartReadyExams(); }}
            className={`group relative z-10 flex-1 px-6 py-4 sm:px-10 sm:py-6 bg-amber-600 text-white font-black text-base sm:text-xl uppercase tracking-tighter rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_6px_0_var(--color-amber-900)] sm:shadow-[0_8px_0_var(--color-amber-900)] hover:shadow-[0_3px_0_var(--color-amber-900)] sm:hover:shadow-[0_4px_0_var(--color-amber-900)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all overflow-hidden group-[.visual-modern]/modern:rounded-[2rem] sm:group-[.visual-modern]/modern:rounded-[2.5rem] group-[.visual-undertale]/undertale:border-4 group-[.visual-undertale]/undertale:border-white group-[.visual-undertale]/undertale:bg-black group-[.visual-undertale]/undertale:shadow-none group-[.visual-undertale]/undertale:rounded-none home-start-button filter-stroke-black ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 group-[.visual-undertale]/undertale:hidden" />
            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
              READY EXAMS <Library className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
          </button>
        </div>
      </div>
    </motion.div>
    {theme.visualStyle === 'brutalist' && (
      <div className="absolute bottom-10 left-0 w-full brutal-marquee">
        <span>BRUTALIST MODE ACTIVATED • NO MERCY • MAXIMUM CONTRAST • BRUTALIST MODE ACTIVATED • NO MERCY • MAXIMUM CONTRAST • </span>
        <span>BRUTALIST MODE ACTIVATED • NO MERCY • MAXIMUM CONTRAST • BRUTALIST MODE ACTIVATED • NO MERCY • MAXIMUM CONTRAST • </span>
      </div>
    )}
  </div>
  );
};

export const Parser = ({ onGenerate, theme }: { onGenerate: (questions: Question[]) => void, theme: AppTheme }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [showPromptModal, setShowPromptModal] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleHtmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const match = content.match(/const EXAM_DATA = (\[[\s\S]*?\]);\s*[\s\S]*?const THEME =/s);
        if (match && match[1]) {
          const parsedQuestions = JSON.parse(match[1]);
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            onGenerate(parsedQuestions);
          } else {
            setError('No valid questions found in the uploaded HTML file.');
          }
        } else {
          setError('Could not find exam data in the uploaded HTML file.');
        }
      } catch (err) {
        setError('Failed to parse the uploaded HTML file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = () => {
    const questions = parseInput(text);
    if (questions.length === 0) {
      setError('No valid questions found. Please check your JSON or CSV format.');
      return;
    }
    onGenerate(questions);
  };

  const questionCount = useMemo(() => {
    if (!text.trim()) return 0;
    try {
      return parseInput(text).length;
    } catch {
      return 0;
    }
  }, [text]);

  const loadSample = () => {
    const sample = JSON.stringify([
      {
        "question": "Which of these is **NOT** a planet in our solar system?",
        "type": "mcq",
        "badge": "Planet",
        "options": ["Mars", "Pluto", "Earth", "Venus"],
        "correctAnswer": "Pluto",
        "explanation": "**Pluto** is classified as a <mark>dwarf planet</mark>. It is an example of a <term title='A celestial body that orbits the sun and has enough mass to be spherical but has not cleared its orbit of other debris.'>dwarf planet</term>.\n\n### Key Facts:\n- Pluto was discovered in **1930**.\n- It was reclassified in **2006** by the IAU.\n- It has five known moons, the largest being *Charon*."
      },
      {
        "question": "The <term title='The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll.'>photosynthesis</term> process occurs primarily in the *roots* of a plant.",
        "type": "true_false",
        "badge": "Science",
        "correctAnswer": "False",
        "wrongPart": "roots",
        "explanation": "Photosynthesis occurs primarily in the **leaves**, specifically within the <mark>chloroplasts</mark>.\n\n> \"Plants are the lungs of the world.\"\n\n| Part | Function |\n| :--- | :--- |\n| Leaves | Photosynthesis |\n| Roots | Water absorption |\n| Stem | Support |"
      },
      {
        "question": "Explain how a **Large Language Model** (LLM) works.",
        "type": "essay",
        "badge": "AI Sticker",
        "correctAnswer": "A Large Language Model (LLM) works by using deep learning techniques, specifically transformer architectures, to process and understand vast amounts of text data. It predicts the next word (or token) in a sequence by analyzing the context and statistical probabilities learned during training.",
        "explanation": "An **LLM** is a type of AI trained on vast amounts of text. It uses a <term title='A deep learning architecture that relies on the attention mechanism to process sequential data.'>transformer</term> architecture to predict the next <mark>token</mark> in a sequence based on statistical probabilities.\n\n```python\ndef predict_next_token(context):\n    # Simplified LLM logic\n    return \"probability_based_word\"\n```"
      },
      {
        "question": "Identify the **Red Planet** in the image below.",
        "imageUrl": "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=1000",
        "type": "mcq",
        "badge": "Image Sticker",
        "options": ["Mars", "Venus", "Jupiter", "Saturn"],
        "correctAnswer": "Mars",
        "explanation": "This is **Mars**. It appears red due to <mark>iron oxide</mark> on its surface. It is home to *Olympus Mons*, the largest volcano in the solar system."
      },
      {
        "question": "Which of the following are **programming languages**?",
        "type": "multi_select",
        "badge": "Code Sticker",
        "options": ["Python", "HTML", "Java", "CSS", "Rust"],
        "correctAnswers": ["Python", "Java", "Rust"],
        "explanation": "**Python**, **Java**, and **Rust** are programming languages. HTML is a markup language, and CSS is a style sheet language."
      },
      {
        "question": "The capital of France is __________ and the capital of Japan is __________.",
        "type": "fill_in_blanks",
        "badge": "Geography Sticker",
        "blanks": ["Paris", "Tokyo"],
        "wordBank": ["Paris", "London", "Tokyo", "Beijing", "Berlin"],
        "explanation": "**Paris** is the capital of France, and **Tokyo** is the capital of Japan."
      },
      {
        "question": "Match the following scientific terms to their definitions.",
        "type": "matching",
        "badge": "Biology Sticker",
        "matchingPairs": [
          { "term": "Nucleus", "definition": "The control center of the cell." },
          { "term": "Mitochondria", "definition": "The powerhouse of the cell." },
          { "term": "Ribosome", "definition": "Site of protein synthesis." }
        ],
        "matchingDistractors": [
          "Stores water and nutrients.",
          "Provides structural support in plant cells."
        ],
        "explanation": "The **nucleus** contains the cell's DNA. **Mitochondria** generate most of the cell's supply of ATP. **Ribosomes** link amino acids together in the order specified by mRNA."
      },
      {
        "question": "Read the following case study and answer the questions below:\n\n**Case Study: The Apollo 11 Mission**\nIn 1969, Apollo 11 became the first manned mission to land on the Moon. The crew consisted of Neil Armstrong, Buzz Aldrin, and Michael Collins.",
        "type": "multi_essay",
        "badge": "History Sticker",
        "subQuestions": [
          {
            "id": "sq1",
            "question": "Who was the first person to walk on the Moon?",
            "correctAnswer": "Neil Armstrong was the first person to walk on the Moon."
          },
          {
            "id": "sq2",
            "question": "What was the year of this historic event?",
            "correctAnswer": "The Apollo 11 mission took place in 1969."
          }
        ],
        "explanation": "The Apollo 11 mission was a landmark event in human history. Neil Armstrong became the first person to walk on the Moon in 1969."
      }
    ], null, 2);
    setText(sample);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-12 px-2 sm:px-4 space-y-6 sm:space-y-10 group/modern group/game-minecraft group/tadc group/duck group/adventure-time">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-3 text-center md:text-left">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none group-[.visual-hollow-knight]/hollow-knight:font-serif group-[.visual-hollow-knight]/hollow-knight:not-italic group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)]">Load Data</h2>
          <p className="text-indigo-500 font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)]/70">Paste your JSON or CSV content</p>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end gap-2 sm:gap-3 items-center">
          <input
            type="file"
            accept=".html"
            ref={fileInputRef}
            onChange={handleHtmlUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none px-3 py-2.5 sm:px-6 sm:py-4 bg-white dark:bg-slate-900 border-b-4 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[9px] sm:text-xs rounded-xl sm:rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5 sm:gap-3 shadow-sm active:translate-y-1 active:border-b-0 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-card)]/80 group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/40 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:font-serif group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:backdrop-blur-sm"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 group-[.visual-hollow-knight]/hollow-knight:opacity-70" /> Upload HTML
          </button>
          <button
            onClick={() => setShowPromptModal(true)}
            className="relative flex-1 sm:flex-none px-3 py-2.5 sm:px-6 sm:py-4 bg-indigo-50 dark:bg-indigo-900/20 border-b-4 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[9px] sm:text-xs rounded-xl sm:rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:border-indigo-300 transition-all flex items-center justify-center gap-1.5 sm:gap-3 shadow-sm active:translate-y-1 active:border-b-0 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-hover)]/80 group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-accent-light)]/50 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:font-serif group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:backdrop-blur-sm"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 group-[.visual-hollow-knight]/hollow-knight:opacity-70" /> AI Prompt
            <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg border-2 border-white shadow-sm group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/40 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:font-serif">
              7 TYPES
            </div>
          </button>
          <button
            onClick={loadSample}
            className="relative flex-1 sm:flex-none px-3 py-2.5 sm:px-6 sm:py-4 bg-white dark:bg-slate-900 border-b-4 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[9px] sm:text-xs rounded-xl sm:rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5 sm:gap-3 shadow-sm active:translate-y-1 active:border-b-0 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-card)]/80 group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/40 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:font-serif group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:backdrop-blur-sm"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 group-[.visual-hollow-knight]/hollow-knight:opacity-70" /> Load Sample
            <div className="absolute -top-2 -right-2 bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg border-2 border-white shadow-sm animate-bounce group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:font-serif">
              8 QS
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPromptModal && (
          <AIPromptModal onClose={() => setShowPromptModal(false)} />
        )}
      </AnimatePresence>

      <div className="relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 rounded-[2rem] sm:rounded-[2.5rem] blur-xl opacity-10 group-hover:opacity-20 transition duration-1000 group-[.visual-hollow-knight]/hollow-knight:hidden"></div>
        <div className={`relative bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-1 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 group-[.visual-tadc]/tadc:question-card group-[.visual-tadc]/tadc:animate-tadc-glitch group-[.visual-arcane]/arcane:chaos-element-slow ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card : ''} group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/30 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:shadow-[0_0_20px_rgba(136,204,255,0.05)]`}>
          <div className="absolute top-4 right-4 z-10">
            <AnimatePresence>
              {questionCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-full font-black text-[10px] sm:text-xs uppercase shadow-lg border-2 border-white dark:border-slate-800 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-accent-light)]/50 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:font-serif"
                >
                  <ListChecks className="w-3 h-3 sm:w-4 sm:h-4" />
                  {questionCount} Questions Captured
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setError(''); }}
            placeholder={`Paste JSON or CSV exam data...\n\nExample JSON: [{"question": "...", "type": "mcq", "explanation": "...", ...}]\nExample CSV: Question,Type,Options,CorrectAnswer,ImageUrl,Explanation,WrongPart,Keywords`}
            className={`w-full h-[250px] sm:h-[300px] md:h-[400px] p-4 sm:p-6 md:p-10 bg-slate-50/50 dark:bg-slate-800/50 rounded-[1.3rem] sm:rounded-[1.8rem] font-mono text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-0 outline-none transition-all resize-none border-none text-slate-900 dark:text-slate-100 ${theme.visualStyle === 'virus' ? 'bg-transparent dark:bg-transparent focus:bg-transparent dark:focus:bg-transparent' : ''} group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif group-[.visual-hollow-knight]/hollow-knight:focus:bg-transparent`}
          />
        </div>
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-10 left-10 flex items-center gap-3 text-white font-black text-xs uppercase bg-gradient-to-r from-red-500 to-rose-600 px-6 py-3 rounded-2xl shadow-xl z-20"
          >
            <AlertCircle className="w-5 h-5" /> {error}
          </motion.div>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleGenerate}
          disabled={!text.trim()}
          className={`group relative px-8 py-4 sm:px-12 sm:py-6 md:px-16 md:py-8 bg-indigo-600 text-white font-black text-lg sm:text-xl uppercase tracking-tighter rounded-[2rem] shadow-[0_10px_0_var(--color-indigo-900)] hover:shadow-[0_5px_0_var(--color-indigo-900)] hover:translate-y-1 active:shadow-none active:translate-y-2.5 disabled:opacity-50 transition-all flex items-center gap-4 ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : ''} group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-card)]/80 group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/60 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:shadow-none group-[.visual-hollow-knight]/hollow-knight:font-serif group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:backdrop-blur-md group-[.visual-hollow-knight]/hollow-knight:hover:translate-y-0 group-[.visual-hollow-knight]/hollow-knight:active:translate-y-0 group-[.visual-hollow-knight]/hollow-knight:hover:scale-[1.02]`}
        >
          GENERATE EXAM <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const AIPromptModal = ({ onClose }: { onClose: () => void }) => {
  const [format, setFormat] = useState<'json' | 'csv'>(() => {
    const saved = localStorage.getItem('ai_prompt_format');
    return (saved as 'json' | 'csv') || 'json';
  });
  const [types, setTypes] = useState(() => {
    const saved = localStorage.getItem('ai_prompt_types');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { mcq: true, essay: true, multi_essay: true, true_false: true, multi_select: true, fill_in_blanks: true, matching: true, images: false, stickers: false, explanations: true };
      }
    }
    return { mcq: true, essay: true, multi_essay: true, true_false: true, multi_select: true, fill_in_blanks: true, matching: true, images: false, stickers: false, explanations: true };
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('ai_prompt_format', format);
  }, [format]);

  useEffect(() => {
    localStorage.setItem('ai_prompt_types', JSON.stringify(types));
  }, [types]);

  const generatePrompt = () => {
    let prompt = `Please generate an exam in ${format.toUpperCase()} format. `;
    const enabledTypes = [];
    if (types.mcq) enabledTypes.push('Multiple Choice Questions (MCQ)');
    if (types.essay) enabledTypes.push('Essay Questions');
    if (types.multi_essay) enabledTypes.push('Structured Multi-Part Essays');
    if (types.true_false) enabledTypes.push('True/False Questions');
    if (types.multi_select) enabledTypes.push('Multi-Select Questions');
    if (types.fill_in_blanks) enabledTypes.push('Fill in the Blanks Questions');
    if (types.matching) enabledTypes.push('Matching Questions');
    
    prompt += `The exam should include ${enabledTypes.join(' and ')}. `;
    if (types.images) prompt += `Some questions should include image URLs. `;
    if (types.stickers) prompt += `Each question MUST include a "badge" property with a creative sticker name (e.g., "Science", "History", "Rocket"). `;
    
    if (types.essay) {
      prompt += `\n\n### Essay Questions Specifics\n`;
      prompt += `For Essay questions, the expected answer in the "correctAnswer" property MUST be super brief. Provide exactly only the core answer with the minimum amount of text possible. Do NOT include full sentences. E.g., if the question is "Who was the first person to walk on the Moon?", the answer must be "Neil Armstrong", NOT "Neil Armstrong was the first person to walk on the Moon."\n`;
    }
    if (types.multi_essay) {
      prompt += `\n\n### Multi-Part Essay Questions Specifics\n`;
      prompt += `For Multi-Part Essay questions, you MUST provide a "subQuestions" array. Each object in this array should have a "question" (the specific sub-prompt) and a "correctAnswer". The "correctAnswer" MUST be super brief, using the minimum amount of text possible, just like standard Essay questions.\n`;
    }
    if (types.true_false) {
      prompt += `\n\n### True/False Questions Specifics\n`;
      prompt += `For True/False questions where the answer is **False**, you MUST identify the specific word or phrase in the question that makes it false. `;
      prompt += `Provide this in a property called **wrongPart**. This must be an EXACT substring of the question text.\n`;
    }
    if (types.multi_select) {
      prompt += `\n\n### Multi-Select Questions Specifics\n`;
      prompt += `For Multi-Select questions, provide the options in the "options" array. Provide the correct answers in a "correctAnswers" array.\n`;
    }
    if (types.fill_in_blanks) {
      prompt += `\n\n### Fill in the Blanks Questions Specifics\n`;
      prompt += `For Fill in the Blanks questions, use "__________" (10 underscores) to represent each blank in the question text. Provide the correct answers in a "blanks" array in the order they appear. Provide a "wordBank" array containing correct answers and some distractors.\n`;
    }
    if (types.matching) {
      prompt += `\n\n### Matching Questions Specifics\n`;
      prompt += `For Matching questions, provide a "matchingPairs" array of objects, each with a "term" and a "definition".\n`;
    }

    prompt += `\n\n### Question Formatting\n`;
    prompt += `Questions can also use Markdown for emphasis. Specifically:\n`;
    prompt += `- Use **bold** or *italics* for negative constraints like **NOT**, **EXCEPT**, or **INCORRECT**.\n`;
    prompt += `- Use **bold** for specific numbers or key identifiers in the question.\n`;

    if (types.explanations) {
      prompt += `\n\n### IMPORTANT: Explanation Formatting\n`;
      prompt += `It is ESSENTIAL that each question includes a detailed, correct explanation. `;
      prompt += `The explanation MUST use Markdown for better readability and emphasis:\n`;
      prompt += `- Use **bold** for key terms and concepts.\n`;
      prompt += `- Use *italics* for emphasis or secondary points.\n`;
      prompt += `- Use <mark>highlight</mark> tags for the most critical takeaways or the final answer.\n`;
      prompt += `- Use \`<term title="Definition here">unfamiliar word</term>\` for technical terms or complex vocabulary that students might not know. This will create an interactive tooltip in the app.\n`;
      prompt += `Explanations without these Markdown elements are considered incomplete.\n`;
    } else {
      prompt += `\n\n### IMPORTANT: Skip Explanations\n`;
      prompt += `Do NOT provide explanations for the questions. Keep the "explanation" field empty or omit it.\n`;
    }

    if (format === 'json') {
      prompt += `\nFormat the output as a JSON array of objects with the following structure:\n`;
      prompt += `[\n  {\n    "question": "The question text (use **bold** for **NOT**, **EXCEPT**, etc.)",\n    "type": "mcq", "essay", "multi_essay", "true_false", "multi_select", "fill_in_blanks", or "matching",\n`;
      if (types.mcq || types.true_false || types.multi_select) prompt += `    "options": ["Option A", "Option B", "Option C", "Option D"] (for MCQ/Multi-Select) or ["True", "False"] (for True/False),\n`;
      prompt += `    "correctAnswer": "The reference rubric for Essay, or correct option text for MCQ/True/False",\n`;
      if (types.multi_essay) prompt += `    "subQuestions": [\n      {"id": "sub1", "question": "Sub-prompt 1", "correctAnswer": "Rubric 1"},\n      {"id": "sub2", "question": "Sub-prompt 2", "correctAnswer": "Rubric 2"}\n    ],\n`;
      if (types.multi_select) prompt += `    "correctAnswers": ["Option A", "Option C"] (for Multi-Select),\n`;
      if (types.fill_in_blanks) prompt += `    "blanks": ["Answer 1", "Answer 2"],\n    "wordBank": ["Answer 1", "Answer 2", "Distractor 1"],\n`;
      if (types.matching) {
        prompt += `    "matchingPairs": [{"term": "Term 1", "definition": "Definition 1"}],\n`;
        prompt += `    "matchingDistractors": ["Extra definition 1", "Extra definition 2"],\n`;
      }
      prompt += `    "wrongPart": "The incorrect part of the question (for True/False where answer is False)",\n`;
      if (types.images) prompt += `    "imageUrl": "https://example.com/image.jpg",\n`;
      if (types.stickers) prompt += `    "badge": "Rocket",\n`;
      if (types.explanations) prompt += `    "explanation": "Detailed explanation using **bold**, *italics*, <mark>highlight</mark>, and <term title='Definition'>Terminology</term> tags. You can also use Markdown tables, lists, and code blocks."\n`;
      prompt += `  }\n]`;
    } else {
      prompt += `\nFormat the output as a CSV with the following header:\n`;
      prompt += `Question,Type,Options,CorrectAnswer,ImageUrl,Explanation,WrongPart,CorrectAnswers,Blanks,WordBank,MatchingPairs,MatchingDistractors${types.stickers ? ',Badge' : ''}\n`;
      prompt += `\nRules for CSV:\n`;
      if (types.stickers) prompt += `- For Badge, use a creative name (e.g., "History").\n`;
      prompt += `- Use "mcq", "essay", "true_false", "multi_select", "fill_in_blanks", or "matching" for the Type column.\n`;
      prompt += `- For MCQ, separate options with a pipe character (|) in the Options column.\n`;
      prompt += `- For Multi-Select, separate options and correct answers with a pipe character (|).\n`;
      prompt += `- For Fill in the Blanks, separate blanks and wordBank with a pipe character (|).\n`;
      prompt += `- For Matching, use the format "Term1:Definition1|Term2:Definition2" in the MatchingPairs column, and separate distractors with a pipe character (|) in the MatchingDistractors column.\n`;
      prompt += `- For True/False (False), specify the incorrect part of the question in the WrongPart column.\n`;
      prompt += `- Wrap fields in double quotes if they contain commas.\n`;
      if (types.explanations) prompt += `- Use Markdown in the Explanation column: **bold**, *italics*, <mark>highlight</mark>, and <term title='Definition'>Terminology</term>.\n`;
      prompt += `- Example: "Which of these is **NOT** a planet?",mcq,"Mars|Pluto|Earth|Venus",Pluto,,"${types.explanations ? '**Pluto** is classified as a <mark>dwarf planet</mark>. It is an example of <term title=\'A celestial body that orbits the sun and has enough mass to be spherical but has not cleared its orbit of other debris.\'>dwarf planet</term>.' : ''}",,,,,${types.stickers ? 'Planet' : ''}`;
    }
    
    return prompt;
  };

  const handleCopy = () => {
    copyToClipboard(generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    {
      title: 'CORE QUESTIONS',
      color: 'blue',
      items: [
        { id: 'mcq', label: 'MCQ', icon: Zap },
        { id: 'true_false', label: 'T / F', icon: CheckCircle2 },
      ]
    },
    {
      title: 'WRITTEN & LOGIC',
      color: 'emerald',
      items: [
        { id: 'essay', label: 'Essay', icon: FileText },
        { id: 'multi_essay', label: 'Case Study', icon: LayoutList },
        { id: 'fill_in_blanks', label: 'Fill Blanks', icon: TextCursorInput },
        { id: 'matching', label: 'Matching', icon: GitMerge },
        { id: 'multi_select', label: 'Multi-Select', icon: ListChecks },
      ]
    },
    {
      title: 'ENHANCEMENTS',
      color: 'amber',
      items: [
        { id: 'images', label: 'Images', icon: ImageIcon },
        { id: 'explanations', label: 'Explanations', icon: MessageSquare, badge: 'READY' },
        { id: 'stickers', label: 'Stickers', icon: Star, badge: 'HOT' },
      ]
    }
  ];

  const toggleCategory = (catItems: { id: string }[]) => {
    const allSelected = catItems.every(item => types[item.id as keyof typeof types]);
    const newState = { ...types };
    catItems.forEach(item => {
      newState[item.id as keyof typeof types] = !allSelected;
    });
    setTypes(newState);
  };

  const getCategoryTheme = (color: string) => {
    switch (color) {
      case 'blue': return { 
        dot: 'bg-blue-500', 
        text: 'text-blue-500', 
        active: 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400 ring-4 ring-blue-500/10',
        activeIcon: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
      };
      case 'emerald': return { 
        dot: 'bg-emerald-500', 
        text: 'text-emerald-500', 
        active: 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-400 ring-4 ring-emerald-500/10',
        activeIcon: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
      };
      case 'amber': return { 
        dot: 'bg-amber-500', 
        text: 'text-amber-500', 
        active: 'bg-amber-50 border-amber-500 text-amber-600 dark:bg-amber-900/20 dark:border-amber-500 dark:text-amber-400 ring-4 ring-amber-500/10',
        activeIcon: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
      };
      default: return { dot: 'bg-slate-500', text: 'text-slate-500', active: '', activeIcon: '' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] w-full max-w-xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 transition-all duration-500 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-card)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/50 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:border-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div className="space-y-0.5">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white group-[.visual-hollow-knight]/hollow-knight:font-serif">PROMPT BUILDER</h3>
            <p className="text-[9px] sm:text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 h-3" /> Configure AI Instructions
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl sm:rounded-2xl transition-all">
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 sm:space-y-10 custom-scrollbar">
          {/* Format Selection - Refined */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 sm:w-1.5 sm:h-6 bg-slate-900 dark:bg-white rounded-full group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-border)]" />
              <p className="text-[10px] sm:text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] group-[.visual-hollow-knight]/hollow-knight:font-serif">Output Format</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {(['json', 'csv'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`group relative py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] font-black uppercase text-xs sm:text-sm tracking-widest transition-all overflow-hidden ${
                    format === f
                      ? 'bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900 scale-[1.01]'
                      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {format === f && (
                    <motion.div layoutId="format-bg" className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20" />
                  )}
                  <span className="relative z-10">{f} Mode</span>
                  {format === f && <Check className="absolute top-2 right-2 sm:top-3 sm:right-3 w-3 h-3 sm:w-4 sm:h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          {categories.map((cat, idx) => {
            const themeClasses = getCategoryTheme(cat.color);
            return (
              <div key={idx} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-5 sm:w-1.5 sm:h-6 ${themeClasses.dot} rounded-full group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-border)]`} />
                    <p className={`text-[10px] sm:text-[11px] font-black uppercase ${themeClasses.text} tracking-[0.2em] group-[.visual-hollow-knight]/hollow-knight:font-serif`}>{cat.title}</p>
                  </div>
                  <button 
                    onClick={() => toggleCategory(cat.items)}
                    className="text-[8px] sm:text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                  >
                    {cat.items.every(item => types[item.id as keyof typeof types]) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {cat.items.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTypes({ ...types, [t.id]: !types[t.id as keyof typeof types] })}
                      className={`relative flex flex-col items-start gap-2.5 sm:gap-3 p-4 sm:p-5 rounded-2xl sm:rounded-3xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all border-2 ${
                        types[t.id as keyof typeof types]
                          ? themeClasses.active
                          : 'bg-slate-50 text-slate-300 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-600 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        types[t.id as keyof typeof types] ? themeClasses.activeIcon : 'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        <t.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="leading-none">{t.label}</span>
                      {t.badge && (
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[6px] sm:text-[7px] px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm text-slate-500">
                          {t.badge}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="p-5 sm:p-7 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleCopy}
            className={`w-full group relative py-4 sm:py-5 font-black uppercase text-base sm:text-lg tracking-tighter rounded-2xl sm:rounded-[2rem] transition-all flex items-center justify-center gap-3 sm:gap-4 ${
              copied 
                ? 'bg-emerald-500 text-white shadow-[0_6px_0_#059669]' 
                : 'bg-indigo-600 text-white shadow-[0_6px_0_#4338ca] hover:shadow-[0_3px_0_#4338ca] hover:translate-y-0.5 active:shadow-none active:translate-y-1'
            }`}
          >
            {copied ? (
              <>COPIED! <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /></>
            ) : (
              <>COPY PROMPT <Copy className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" /></>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Settings = ({ 
  onStart, 
  initialSettings, 
  theme, 
  buttonText = "BEGIN EXAM", 
}: { 
  onStart: (settings: ExamSettings) => void, 
  initialSettings?: ExamSettings | null, 
  theme: AppTheme, 
  buttonText?: string, 
}) => {
  const [settings, setSettings] = useState<ExamSettings>(() => {
    let baseSettings: ExamSettings;
    if (initialSettings) {
      baseSettings = { ...initialSettings };
    } else {
      try {
        const key = 'last_exam_settings';
        const saved = localStorage.getItem(key);
        const parsed = saved ? JSON.parse(saved) : null;
        
        if (parsed) {
          baseSettings = { randomizeQuestions: false, powerSystemEnabled: false, guaranteedPowerPerCorrect: false, ...parsed };
        } else {
          baseSettings = {
            timeLimitType: 'none',
            timeLimitValue: 60,
            instantFeedback: true,
            essaysLast: false,
            imagesLast: false,
            randomizeQuestions: false,
            powerSystemEnabled: false,
            guaranteedPowerPerCorrect: false
          };
        }
      } catch (e) {
        baseSettings = {
          timeLimitType: 'none',
          timeLimitValue: 60,
          instantFeedback: true,
          essaysLast: false,
          imagesLast: false,
          randomizeQuestions: false,
          powerSystemEnabled: false,
          guaranteedPowerPerCorrect: false
        };
      }
    }

    return baseSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const key = 'last_exam_settings';
    localStorage.setItem(key, JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-12 px-2 sm:px-4 space-y-8 sm:space-y-12 group/modern group/game-minecraft group/tadc group/duck group/adventure-time">
      <div className="text-center space-y-2 sm:space-y-4 relative">
        <h2 
          className={`text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:iridescent-text`}
          data-text="Exam Settings"
        >
          Exam Settings
        </h2>
        <p className={`text-indigo-500 font-black text-[8px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>
          Configure your exam parameters
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Time Limit Mode */}
        <div className={`bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4 sm:space-y-6 transition-all duration-500 group-[.visual-tadc]/tadc:question-card group-[.visual-tadc]/tadc:animate-tadc-glitch group-[.visual-arcane]/arcane:chaos-element-slow group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none`}>
          <div className="flex items-center gap-3 sm:gap-4 text-slate-900 dark:text-white group-[.visual-liquid-glass]/liquid-glass:!text-white">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${theme.visualStyle === 'liquid-glass' ? 'bg-white/10 border border-white/20 shadow-inner text-white' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'}`}>
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Time Limit</h3>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3">
            {(['none', 'per-question', 'per-exam'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSettings({ ...settings, timeLimitType: type })}
                className={`py-3 sm:py-4 px-2 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all border-b-4 ${
                  settings.timeLimitType === type
                    ? (theme.visualStyle === 'liquid-glass' ? 'bg-white/20 text-white border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-indigo-600 text-white border-indigo-800 shadow-lg')
                    : (theme.visualStyle === 'liquid-glass' ? 'bg-white/5 text-white/50 border-white/10' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50')
                } ${theme.visualStyle === 'liquid-glass' ? '!border-b-2' : ''}`}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>
          {settings.timeLimitType !== 'none' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="pt-4 overflow-hidden"
            >
              <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-3 tracking-widest group-[.visual-liquid-glass]/liquid-glass:!text-white/50">
                Duration ({settings.timeLimitType === 'per-question' ? 'Seconds' : 'Minutes'})
              </label>
              <input
                type="range"
                min={settings.timeLimitType === 'per-question' ? 5 : 1}
                max={settings.timeLimitType === 'per-question' ? 120 : 180}
                value={isNaN(settings.timeLimitValue) ? 30 : settings.timeLimitValue}
                onChange={(e) => setSettings({ ...settings, timeLimitValue: parseInt(e.target.value) || 0 })}
                className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-600 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10"
              />
              <div className="flex justify-between mt-3 text-lg font-black text-indigo-600 dark:text-indigo-400 italic group-[.visual-liquid-glass]/liquid-glass:!text-white">
                <span>{settings.timeLimitType === 'per-question' ? '5s' : '1m'}</span>
                <span className={`px-4 py-1 rounded-full ${theme.visualStyle === 'liquid-glass' ? 'bg-white/10 border border-white/20' : 'bg-indigo-50 dark:bg-indigo-900/20'}`}>{settings.timeLimitValue}{settings.timeLimitType === 'per-question' ? 's' : 'm'}</span>
                <span>{settings.timeLimitType === 'per-question' ? '120s' : '180m'}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Instant Feedback */}
        <button
          onClick={() => {
            setSettings({ ...settings, instantFeedback: !settings.instantFeedback });
          }}
          className={`group w-full flex items-center justify-between p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-b-8 transition-all ${
            settings.instantFeedback
              ? (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).bg} ${getArcaneStyles(theme.accentColor).border.split(' ')[0]} ${getArcaneStyles(theme.accentColor).text}` : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!border-white/20')
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!border-white/10 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none'
          } group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
              settings.instantFeedback 
                ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent : (theme.visualStyle === 'liquid-glass' ? 'bg-white/20 text-white border border-white/30 shadow-inner' : 'bg-emerald-500 text-white')) 
                : (theme.visualStyle === 'liquid-glass' ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500')
            }`}>
              <Zap className={`w-5 h-5 sm:w-6 sm:h-6 ${theme.visualStyle === 'liquid-glass' && settings.instantFeedback ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : ''}`} />
            </div>
            <div className="text-left">
              <h3 className={`text-lg sm:text-xl font-black uppercase tracking-tight group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!drop-shadow-sm ${settings.instantFeedback && theme.visualStyle === 'liquid-glass' ? 'group-[.visual-liquid-glass]/liquid-glass:iridescent-text' : ''}`}>Instant Feedback</h3>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase opacity-60 group-[.visual-liquid-glass]/liquid-glass:!text-white/50">
                Show results immediately after answering
              </p>
            </div>
          </div>
          <div className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full relative transition-colors shrink-0 ${
            settings.instantFeedback 
              ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent : (theme.visualStyle === 'liquid-glass' ? 'bg-white/30 shadow-inner border border-white/20' : 'bg-emerald-500')) 
              : (theme.visualStyle === 'liquid-glass' ? 'bg-black/20 border border-white/10' : 'bg-slate-300 dark:bg-slate-700')
          }`}>
            <div className={`absolute top-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-all ${
              settings.instantFeedback 
                ? (theme.visualStyle === 'liquid-glass' ? 'left-6 sm:left-7 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'left-6 sm:left-7') 
                : 'left-1'
            }`} />
          </div>
        </button>

        {/* Essays Last */}
        <button
          onClick={() => setSettings({ ...settings, essaysLast: !settings.essaysLast })}
          className={`group w-full flex items-center justify-between p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-b-8 transition-all ${
            settings.essaysLast
              ? (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).bg} ${getArcaneStyles(theme.accentColor).border.split(' ')[0]} ${getArcaneStyles(theme.accentColor).text}` : 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!border-white/20')
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!border-white/10 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none'
          } group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
              settings.essaysLast 
                ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent : (theme.visualStyle === 'liquid-glass' ? 'bg-white/20 text-white border border-white/30 shadow-inner' : 'bg-indigo-500 text-white')) 
                : (theme.visualStyle === 'liquid-glass' ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500')
            }`}>
              <FileText className={`w-5 h-5 sm:w-6 sm:h-6 ${theme.visualStyle === 'liquid-glass' && settings.essaysLast ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : ''}`} />
            </div>
            <div className="text-left">
              <h3 className={`text-lg sm:text-xl font-black uppercase tracking-tight group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!drop-shadow-sm ${settings.essaysLast && theme.visualStyle === 'liquid-glass' ? 'group-[.visual-liquid-glass]/liquid-glass:iridescent-text' : ''}`}>Essays Last</h3>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase opacity-60 group-[.visual-liquid-glass]/liquid-glass:!text-white/50">Move all essay questions to the end</p>
            </div>
          </div>
          <div className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full relative transition-colors shrink-0 ${
            settings.essaysLast 
              ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent : (theme.visualStyle === 'liquid-glass' ? 'bg-white/30 shadow-inner border border-white/20' : 'bg-indigo-500')) 
              : (theme.visualStyle === 'liquid-glass' ? 'bg-black/20 border border-white/10' : 'bg-slate-300 dark:bg-slate-700')
          }`}>
            <div className={`absolute top-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-all ${
              settings.essaysLast 
                ? (theme.visualStyle === 'liquid-glass' ? 'left-6 sm:left-7 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'left-6 sm:left-7') 
                : 'left-1'
            }`} />
          </div>
        </button>

        {/* Images Last */}
        <button
          onClick={() => setSettings({ ...settings, imagesLast: !settings.imagesLast })}
          className={`group w-full flex items-center justify-between p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-b-8 transition-all ${
            settings.imagesLast
              ? (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).bg} ${getArcaneStyles(theme.accentColor).border.split(' ')[0]} ${getArcaneStyles(theme.accentColor).text}` : 'bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-100 group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!border-white/20')
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!border-white/10 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none'
          } group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
              settings.imagesLast 
                ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent : (theme.visualStyle === 'liquid-glass' ? 'bg-white/20 text-white border border-white/30 shadow-inner' : 'bg-cyan-500 text-white')) 
                : (theme.visualStyle === 'liquid-glass' ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500')
            }`}>
              <ImageIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${theme.visualStyle === 'liquid-glass' && settings.imagesLast ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : ''}`} />
            </div>
            <div className="text-left">
              <h3 className={`text-lg sm:text-xl font-black uppercase tracking-tight group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!drop-shadow-sm ${settings.imagesLast && theme.visualStyle === 'liquid-glass' ? 'group-[.visual-liquid-glass]/liquid-glass:iridescent-text' : ''}`}>Images Last</h3>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase opacity-60 group-[.visual-liquid-glass]/liquid-glass:!text-white/50">Move questions with images to the end</p>
            </div>
          </div>
          <div className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full relative transition-colors shrink-0 ${
            settings.imagesLast 
              ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent : (theme.visualStyle === 'liquid-glass' ? 'bg-white/30 shadow-inner border border-white/20' : 'bg-cyan-500')) 
              : (theme.visualStyle === 'liquid-glass' ? 'bg-black/20 border border-white/10' : 'bg-slate-300 dark:bg-slate-700')
          }`}>
            <div className={`absolute top-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-all ${
              settings.imagesLast 
                ? (theme.visualStyle === 'liquid-glass' ? 'left-6 sm:left-7 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'left-6 sm:left-7') 
                : 'left-1'
            }`} />
          </div>
        </button>

        {/* Randomize Questions */}
        <button
          onClick={() => setSettings({ ...settings, randomizeQuestions: !settings.randomizeQuestions })}
          className={`group w-full flex items-center justify-between p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-b-8 transition-all ${
            settings.randomizeQuestions
              ? (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).bg} ${getArcaneStyles(theme.accentColor).border.split(' ')[0]} ${getArcaneStyles(theme.accentColor).text}` : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!border-white/20')
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!border-white/10 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none'
          } group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
              settings.randomizeQuestions 
                ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent : (theme.visualStyle === 'liquid-glass' ? 'bg-white/20 text-white border border-white/30 shadow-inner' : 'bg-amber-500 text-white')) 
                : (theme.visualStyle === 'liquid-glass' ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500')
            }`}>
              <Shuffle className={`w-5 h-5 sm:w-6 sm:h-6 ${theme.visualStyle === 'liquid-glass' && settings.randomizeQuestions ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : ''}`} />
            </div>
            <div className="text-left">
              <h3 className={`text-lg sm:text-xl font-black uppercase tracking-tight group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!drop-shadow-sm ${settings.randomizeQuestions && theme.visualStyle === 'liquid-glass' ? 'group-[.visual-liquid-glass]/liquid-glass:iridescent-text' : ''}`}>Randomize Questions</h3>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase opacity-60 group-[.visual-liquid-glass]/liquid-glass:!text-white/50">Shuffle the order of questions</p>
            </div>
          </div>
          <div className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full relative transition-colors shrink-0 ${
            settings.randomizeQuestions 
              ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent : (theme.visualStyle === 'liquid-glass' ? 'bg-white/30 shadow-inner border border-white/20' : 'bg-amber-500')) 
              : (theme.visualStyle === 'liquid-glass' ? 'bg-black/20 border border-white/10' : 'bg-slate-300 dark:bg-slate-700')
          }`}>
            <div className={`absolute top-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-all ${
              settings.randomizeQuestions 
                ? (theme.visualStyle === 'liquid-glass' ? 'left-6 sm:left-7 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'left-6 sm:left-7') 
                : 'left-1'
            }`} />
          </div>
        </button>

        {/* RPG Mode */}
        <button
          onClick={() => setSettings({ ...settings, rpgModeEnabled: !settings.rpgModeEnabled })}
          className={`group w-full flex items-center justify-between p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-b-8 transition-all ${
            settings.rpgModeEnabled
              ? (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).bg} ${getArcaneStyles(theme.accentColor).border.split(' ')[0]} ${getArcaneStyles(theme.accentColor).text}` : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100 group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!border-white/20')
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!border-white/10 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none'
          } group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
              settings.rpgModeEnabled 
                ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent : (theme.visualStyle === 'liquid-glass' ? 'bg-white/20 text-white border border-white/30 shadow-inner' : 'bg-red-500 text-white')) 
                : (theme.visualStyle === 'liquid-glass' ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500')
            }`}>
              <Gamepad2 className={`w-5 h-5 sm:w-6 sm:h-6 ${theme.visualStyle === 'liquid-glass' && settings.rpgModeEnabled ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : ''}`} />
            </div>
            <div className="text-left">
              <h3 className={`text-lg sm:text-xl font-black uppercase tracking-tight group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!drop-shadow-sm ${settings.rpgModeEnabled && theme.visualStyle === 'liquid-glass' ? 'group-[.visual-liquid-glass]/liquid-glass:iridescent-text' : ''}`}>RPG Mode (BETA)</h3>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase opacity-60 group-[.visual-liquid-glass]/liquid-glass:!text-white/50">Permanent upgrades & coin collection</p>
            </div>
          </div>
          <div className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full relative transition-colors shrink-0 ${
            settings.rpgModeEnabled 
              ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent : (theme.visualStyle === 'liquid-glass' ? 'bg-white/30 shadow-inner border border-white/20' : 'bg-red-500')) 
              : (theme.visualStyle === 'liquid-glass' ? 'bg-black/20 border border-white/10' : 'bg-slate-300 dark:bg-slate-700')
          }`}>
            <div className={`absolute top-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-all ${
              settings.rpgModeEnabled 
                ? (theme.visualStyle === 'liquid-glass' ? 'left-6 sm:left-7 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'left-6 sm:left-7') 
                : 'left-1'
            }`} />
          </div>
        </button>

        {/* Power System */}
        <div className="space-y-3">
          <button
            onClick={() => setSettings({ ...settings, powerSystemEnabled: !settings.powerSystemEnabled })}
            className={`group w-full flex items-center justify-between p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-b-8 transition-all ${
              settings.powerSystemEnabled
                ? (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).bg} ${getArcaneStyles(theme.accentColor).border.split(' ')[0]} ${getArcaneStyles(theme.accentColor).text}` : 'bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800 text-violet-900 dark:text-violet-100 group-[.visual-fluid]/fluid:!bg-white/10 group-[.visual-fluid]/fluid:!border-white/20')
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!border-white/10 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none'
            } group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none`}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                settings.powerSystemEnabled 
                  ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent : (theme.visualStyle === 'liquid-glass' ? 'bg-white/20 text-white border border-white/30 shadow-inner' : 'bg-violet-500 text-white')) 
                  : (theme.visualStyle === 'liquid-glass' ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500')
              }`}>
                <Zap className={`w-5 h-5 sm:w-6 sm:h-6 ${theme.visualStyle === 'liquid-glass' && settings.powerSystemEnabled ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse' : ''}`} />
              </div>
              <div className="text-left">
                <h3 className={`text-lg sm:text-xl font-black uppercase tracking-tight group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!drop-shadow-sm ${settings.powerSystemEnabled && theme.visualStyle === 'liquid-glass' ? 'group-[.visual-liquid-glass]/liquid-glass:iridescent-text' : ''}`}>Power System</h3>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase opacity-60 group-[.visual-liquid-glass]/liquid-glass:!text-white/50">Earn and use special abilities during the exam</p>
              </div>
            </div>
            <div className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full relative transition-colors shrink-0 ${
              settings.powerSystemEnabled 
                ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent : (theme.visualStyle === 'liquid-glass' ? 'bg-white/30 shadow-inner border border-white/20' : 'bg-violet-500')) 
                : (theme.visualStyle === 'liquid-glass' ? 'bg-black/20 border border-white/10' : 'bg-slate-300 dark:bg-slate-700')
            }`}>
              <div className={`absolute top-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-all ${
                settings.powerSystemEnabled 
                  ? (theme.visualStyle === 'liquid-glass' ? 'left-6 sm:left-7 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'left-6 sm:left-7') 
                  : 'left-1'
              }`} />
            </div>
          </button>
          
          <AnimatePresence>
            {settings.powerSystemEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="overflow-hidden px-4"
              >
                <button
                  onClick={() => setSettings({ ...settings, guaranteedPowerPerCorrect: !settings.guaranteedPowerPerCorrect })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    settings.guaranteedPowerPerCorrect
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-emerald-100'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      settings.guaranteedPowerPerCorrect ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-200 dark:bg-slate-700'
                    }`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-tight">1 Power Per Correct</p>
                      <p className="text-[8px] font-bold uppercase opacity-60">100% chance to get a power on correct answers</p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${
                    settings.guaranteedPowerPerCorrect ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      settings.guaranteedPowerPerCorrect ? 'left-5' : 'left-1'
                    }`} />
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <button
          onClick={() => {
            localStorage.setItem('last_exam_settings', JSON.stringify(settings));
            onStart(settings);
          }}
          className={theme.customTheme?.buttonConfig ? "group relative transition-all overflow-hidden flex items-center justify-center" : "group relative px-10 py-5 sm:px-16 sm:py-8 md:px-20 md:py-10 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tighter rounded-[2.5rem] shadow-[0_12px_0_var(--color-indigo-900)] hover:shadow-[0_6px_0_var(--color-indigo-900)] hover:translate-y-1.5 active:shadow-none active:translate-y-3 transition-all overflow-hidden group-[.visual-fluid]/fluid:fluid-progress-panel group-[.visual-fluid]/fluid:!bg-white/5 group-[.visual-fluid]/fluid:!shadow-none group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!rounded-full group-[.visual-fluid]/fluid:hover:!bg-white/10 group-[.visual-fluid]/fluid:active:!bg-white/20"}
          style={theme.customTheme?.buttonConfig ? {
            borderRadius: `${theme.customTheme.buttonConfig.borderRadius}px`,
            borderWidth: `${theme.customTheme.buttonConfig.borderWidth}px`,
            borderColor: theme.customTheme.buttonConfig.borderColor,
            backgroundColor: theme.customTheme.buttonConfig.backgroundColor,
            color: theme.customTheme.buttonConfig.textColor,
            fontSize: `${theme.customTheme.buttonConfig.fontSize * 1.5}px`,
            fontWeight: theme.customTheme.buttonConfig.fontWeight,
            padding: `${theme.customTheme.buttonConfig.paddingY * 1.5}px ${theme.customTheme.buttonConfig.paddingX * 1.5}px`,
            letterSpacing: `${theme.customTheme.buttonConfig.letterSpacing}px`,
            textTransform: theme.customTheme.buttonConfig.textTransform,
            fontStyle: theme.customTheme.buttonConfig.italic ? 'italic' : 'normal',
            boxShadow: theme.customTheme.buttonConfig.shadow === 'none' ? 'none' : 
                       theme.customTheme.buttonConfig.shadow === 'sm' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' :
                       theme.customTheme.buttonConfig.shadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' :
                       theme.customTheme.buttonConfig.shadow === 'lg' ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' :
                       theme.customTheme.buttonConfig.shadow === 'xl' ? '0 20px 25px -5px rgb(0 0 0 / 0.1)' :
                       theme.customTheme.buttonConfig.shadow === '2xl' ? '0 25px 50px -12px rgb(0 0 0 / 0.25)' :
                       'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)'
          } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="relative z-10 flex items-center gap-4">
            {buttonText} {buttonText === "BEGIN EXAM" ? <Play className="w-8 h-8 fill-current" /> : <Check className="w-8 h-8" />}
          </span>
        </button>
      </div>
    </div>
  );
};

const QuestionMap = ({ 
  questions, 
  currentIdx, 
  answers, 
  onSelect, 
  onClose,
  showResults,
  questionTimes,
  timeLimitType,
  flags,
  essayFeedback,
  wrongPartSelections,
  theme,
  searchQuery,
  onSearchChange
}: { 
  questions: Question[], 
  currentIdx: number, 
  answers: Record<string, string>,
  onSelect: (idx: number) => void,
  onClose: () => void,
  showResults: boolean,
  questionTimes?: Record<string, number>,
  timeLimitType: string,
  flags?: Record<string, { isFlagged: boolean; percentage?: number }>,
  essayFeedback?: Record<string, EssayFeedback>,
  wrongPartSelections?: Record<string, string>,
  theme: AppTheme,
  searchQuery: string,
  onSearchChange: (val: string) => void
}) => {
  const filteredQuestions = questions.map((q, idx) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return { ...q, matches: false };
    
    const matchesQuestion = q.question.toLowerCase().includes(query);
    const matchesOptions = q.options?.some(opt => opt.toLowerCase().includes(query));
    const matchesExplanation = q.explanation?.toLowerCase().includes(query);
    
    return { ...q, matches: matchesQuestion || matchesOptions || matchesExplanation };
  });

  const getThemeOutline = (isMatch: boolean) => {
    if (!isMatch) return '';
    
    const isDark = document.documentElement.classList.contains('dark');
    
    switch (theme.visualStyle) {
      case 'hollow-knight':
        const isSilksong = theme.accentColor === 'silksong-red' || theme.accentColor === 'silksong-gold';
        const hkBorderColor = isSilksong ? 'border-rose-900/50' : 'border-slate-200 dark:border-white/20';
        const glowColor = isSilksong ? 'rgba(225,29,72,0.4)' : 'rgba(255,255,255,0.2)';
        return `ring-4 ${isSilksong ? 'ring-rose-900/30' : 'ring-slate-200/30 dark:ring-white/10'} shadow-[0_0_30px_${glowColor}] border-2 ${hkBorderColor} z-10 scale-105 font-serif italic`;
      case 'arcane':
        const arcane = getArcaneStyles(theme.accentColor);
        const borderColor = arcane.border.split(' ')[0];
        return `ring-4 ${borderColor} shadow-[0_0_30px_rgba(255,255,255,0.4),0_0_50px_rgba(255,255,255,0.2)] ${arcane.glow} border-2 ${borderColor} z-10 scale-105`;
      case 'tadc':
        return 'ring-4 ring-red-500 shadow-[0_0_40px_rgba(239,68,68,0.9),inset_0_0_20px_rgba(239,68,68,0.5),10px_10px_0_rgba(59,130,246,0.5)] animate-tadc-glitch border-4 border-black z-10 scale-105';
      case 'game-minecraft':
        return theme.accentColor === 'creeper-green' 
          ? 'ring-4 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.8),8px_8px_0_rgba(0,0,0,0.3)] border-4 border-emerald-400 z-10 scale-105' 
          : 'ring-4 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.8),8px_8px_0_rgba(0,0,0,0.3)] border-4 border-purple-400 z-10 scale-105';
      case 'undertale':
        return 'ring-4 ring-white shadow-[0_0_40px_rgba(255,255,255,1),0_0_10px_rgba(255,255,255,0.8)] border-2 border-white z-10 scale-110';
      case 'duck':
        return 'ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.9),0_0_60px_rgba(250,204,21,0.4)] border-4 border-yellow-500 z-10 scale-105';
      case 'brutalist':
        return 'ring-4 ring-black dark:ring-white shadow-[16px_16px_0_0_rgba(0,0,0,1)] dark:shadow-[16px_16px_0_0_rgba(255,255,255,1)] border-4 border-black dark:border-white z-10 -translate-x-1 -translate-y-1';
      case 'adventure-time':
        return 'ring-4 ring-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.9),0_0_15px_rgba(255,255,255,0.5)] border-4 border-blue-300 z-10 scale-105';
      case 'superhero':
        return 'ring-4 ring-red-600 shadow-[0_0_40px_rgba(220,38,38,1),10px_10px_0_rgba(0,0,0,1)] border-4 border-black z-10 scale-105';
      case 'ultimate':
        return 'ring-4 ring-purple-600 shadow-[0_0_40px_rgba(147,51,234,1),inset_0_0_25px_rgba(147,51,234,0.6)] animate-pulse border-4 border-white z-10 scale-105';
      case 'saidi':
        return 'ring-4 ring-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.9),0_0_15px_rgba(255,255,255,0.4)] border-4 border-amber-500 z-10 scale-105';
      case 'minimal':
        return isDark 
          ? 'ring-4 ring-slate-300 shadow-[0_0_25px_rgba(255,255,255,0.4)] border-2 border-white z-10 scale-105' 
          : 'ring-4 ring-slate-900 shadow-[0_0_25px_rgba(0,0,0,0.2)] border-2 border-black z-10 scale-105';
      default:
        return 'ring-4 ring-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.8)] border-2 border-indigo-400 z-10 scale-105';
    }
  };

  return (
    <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={(e) => e.stopPropagation()}
      className="brutal-modal bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md p-5 sm:p-8 !overflow-y-auto max-h-[85vh] border border-slate-100 dark:border-slate-800 group-[.visual-tadc]/tadc:question-card group-[.visual-tadc]/tadc:animate-tadc-glitch group-[.visual-arcane]/arcane:chaos-element-slow hk-card"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white group-[.visual-tadc]/tadc:text-red-600 group-[.visual-tadc]/tadc:animate-tadc-bounce group-[.visual-hollow-knight]/hollow-knight:font-serif">Question Map</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`w-4 h-4 ${searchQuery ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
        </div>
        <input
          type="text"
          placeholder="Search questions, options..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-2xl text-sm font-bold focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 
            ${searchQuery 
              ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
              : 'border-slate-100 dark:border-slate-700 focus:border-indigo-500'
            }
            group-[.visual-tadc]/tadc:border-4 group-[.visual-tadc]/tadc:border-black group-[.visual-tadc]/tadc:rounded-[var(--radius-button)] group-[.visual-tadc]/tadc:animate-tadc-glitch
            group-[.visual-arcane]/arcane:border-purple-500/50 group-[.visual-arcane]/arcane:bg-slate-950/50
            group-[.visual-game-minecraft]/game-minecraft:rounded-none group-[.visual-game-minecraft]/game-minecraft:border-4 group-[.visual-game-minecraft]/game-minecraft:border-slate-800
            group-[.visual-brutalist]/brutalist:rounded-none group-[.visual-brutalist]/brutalist:border-4 group-[.visual-brutalist]/brutalist:border-black group-[.visual-brutalist]/brutalist:shadow-[4px_4px_0_0_rgba(0,0,0,1)]
            group-[.visual-hollow-knight]/hollow-knight:font-serif group-[.visual-hollow-knight]/hollow-knight:rounded-sm group-[.visual-hollow-knight]/hollow-knight:bg-black/50 group-[.visual-hollow-knight]/hollow-knight:border-white/10
          `}
        />
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 group-[.visual-tadc]/tadc:gap-5">
        {filteredQuestions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined && answers[q.id].trim() !== '';
          const isCurrent = currentIdx === idx;
          const isCorrect = (q.type === 'mcq' || q.type === 'true_false') 
            ? (q.type === 'true_false' && q.correctAnswer === 'False' && q.wrongPart)
              ? answers[q.id] === 'False' && wrongPartSelections?.[q.id] === q.wrongPart
              : answers[q.id] === q.correctAnswer
            : (essayFeedback?.[q.id]?.score ?? 0) >= 50;
          const isTimedOut = timeLimitType === 'per-question' && (questionTimes?.[q.id] ?? 1) <= 0;
          const isMatch = q.matches;
          
          let bgClass = 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50';
          
          if (theme.visualStyle === 'hollow-knight') {
            const isSilksong = theme.accentColor === 'silksong-red' || theme.accentColor === 'silksong-gold';
            if (isCurrent) {
              bgClass = isSilksong 
                ? 'bg-rose-700 text-white border-rose-900 shadow-lg hk-map-pin hk-map-pin-silksong-active' 
                : 'bg-slate-200 dark:bg-white text-black border-slate-400 dark:border-slate-200 shadow-lg hk-map-pin hk-map-pin-active';
            } else if (showResults && isAnswered) {
              bgClass = isCorrect 
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50' 
                : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/50';
            } else if (isAnswered) {
              bgClass = isSilksong ? 'bg-rose-900/20 text-rose-400 border-rose-900/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            } else {
              bgClass = 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/20 hover:border-white/40';
            }
            bgClass += ' font-serif italic rounded-sm transition-all duration-300 group-[.visual-hollow-knight]/hollow-knight:font-serif';
          } else if (theme.visualStyle === 'virus' || theme.visualStyle === 'arcane') {
            const styles = getArcaneStyles(theme.accentColor);
            if (isCurrent) {
              bgClass = `${styles.accent} ${styles.accentText} ${styles.border.split(' ')[0]} ${styles.mapItem || ''} shadow-[0_4px_0_rgba(0,0,0,0.5)]`;
            } else if (showResults && isAnswered) {
               if (q.type === 'mcq' || q.type === 'true_false') {
                 bgClass = isCorrect 
                   ? `bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/50 ${styles.mapItem || ''}` 
                   : `bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/50 ${styles.mapItem || ''}`;
               } else {
                 const feedback = essayFeedback?.[q.id];
                 if (feedback) {
                   bgClass = feedback.score >= 50
                     ? `bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/50 ${styles.mapItem || ''}`
                     : `bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/50 ${styles.mapItem || ''}`;
                 } else {
                   bgClass = `${styles.bg} ${styles.text} ${styles.border.split(' ')[0]} ${styles.mapItem || ''}`;
                 }
               }
            } else if (isAnswered) {
              bgClass = `${styles.bg} ${styles.text} ${styles.border.split(' ')[0]} ${styles.mapItem || ''}`;
            } else if (isTimedOut) {
              bgClass = `bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/50 ${styles.mapItem || ''}`;
            } else {
              bgClass = `bg-black/20 dark:bg-black/40 text-slate-400 dark:text-slate-500 border-white/10 ${styles.mapItem || ''}`;
            }
          } else if (isCurrent) {
            bgClass = 'bg-indigo-600 text-white border-indigo-800 shadow-[0_4px_0_var(--color-indigo-900)]';
          } else if (showResults && isAnswered) {
             if (q.type === 'mcq' || q.type === 'true_false') {
               bgClass = isCorrect 
                 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/30' 
                 : 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800 hover:bg-rose-200 dark:hover:bg-rose-900/30';
             } else {
               const feedback = essayFeedback?.[q.id];
               if (feedback) {
                 bgClass = feedback.score >= 50
                   ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/30'
                   : 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800 hover:bg-rose-200 dark:hover:bg-rose-900/30';
               } else {
                 bgClass = 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-900/30';
               }
             }
          } else if (isAnswered) {
            bgClass = 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-900/30';
          } else if (isTimedOut) {
            bgClass = 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/30';
          }

          return (
            <motion.button
              key={q.id}
              whileHover={{ scale: 1.05, y: -2, rotate: theme.visualStyle === 'tadc' ? (idx % 2 === 0 ? 5 : -5) : 0 }}
              whileTap={{ scale: 0.95 }}
              animate={isMatch ? { 
                scale: [1, 1.05, 1],
                transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              } : isCurrent ? { 
                scale: [1, 1.1, 1],
                rotate: theme.visualStyle === 'tadc' ? [0, 5, -5, 0] : 0
              } : { 
                scale: 1,
                rotate: theme.visualStyle === 'tadc' ? (idx % 3 === 0 ? 2 : idx % 3 === 1 ? -2 : 0) : 0
              }}
              transition={isMatch ? undefined : theme.visualStyle === 'tadc' && isCurrent ? {
                duration: 0.5,
                repeat: Infinity,
                ease: "linear"
              } : { duration: 0.3, type: "tween" }}
              onClick={() => { onSelect(idx); onClose(); }}
              className={`relative aspect-square rounded-xl font-black text-sm sm:text-base transition-all border-b-4 flex flex-col items-center justify-center gap-1 ${bgClass} ${getThemeOutline(isMatch)} group-[.visual-tadc]/tadc:question-map-btn ${isCurrent ? 'group-[.visual-tadc]/tadc:active' : isAnswered ? 'group-[.visual-tadc]/tadc:answered' : 'group-[.visual-tadc]/tadc:unanswered'} ${theme.visualStyle === 'hollow-knight' ? 'hk-map-pin' : ''}`}
            >
              <span className="relative z-10">{idx + 1}</span>
              
              <AnimatePresence>
                {isMatch && (
                  <motion.div 
                    layoutId="search-highlight"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 z-0 bg-white/10 dark:bg-white/5 rounded-xl pointer-events-none"
                  />
                )}

                {isMatch && (
                  <motion.div
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 5, opacity: 0 }}
                    className="absolute -top-1 -left-1 z-20"
                  >
                    <div className={`p-1 rounded-full shadow-lg ${
                      theme.visualStyle === 'arcane' ? 'bg-purple-500 text-white shadow-purple-500/50' :
                      theme.visualStyle === 'tadc' ? 'bg-red-600 text-white shadow-red-600/50' :
                      theme.visualStyle === 'game-minecraft' ? 'bg-emerald-600 text-white shadow-emerald-600/50' :
                      theme.visualStyle === 'undertale' ? 'bg-white text-black shadow-white/50' :
                      'bg-indigo-600 text-white shadow-indigo-600/50'
                    }`}>
                      <Search className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    </div>
                  </motion.div>
                )}
                {/* Type Indicator */}
                {!isCurrent && q.type === 'essay' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-1 right-1 opacity-40">
                    <FileText className="w-3 h-3" />
                  </motion.div>
                )}

                {/* Photo Indicator */}
                {q.imageUrl && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`absolute top-1 left-1 ${isCurrent ? 'opacity-80' : 'opacity-40'}`}>
                    <ImageIcon className="w-3 h-3" />
                  </motion.div>
                )}

                {/* Flag Indicator */}
                {flags?.[q.id]?.isFlagged && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-1 left-1 flex items-center gap-0.5">
                    <Flag className={`w-3 h-3 ${isCurrent ? 'text-white' : getFlagIconColor(flags[q.id].percentage)}`} fill="currentColor" />
                    {flags[q.id].percentage !== undefined && (
                      <span className={`text-[8px] font-black ${isCurrent ? 'text-white' : getFlagIconColor(flags[q.id].percentage)}`}>
                        {flags[q.id].percentage}%
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Badge Indicator */}
                {q.badge && (
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className={`absolute -top-1 -right-1 z-20 ${isCurrent ? 'text-amber-300' : 'text-amber-500'}`}>
                    {q.badge.toLowerCase().includes('sticker') ? (
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current drop-shadow-md text-indigo-500" />
                    ) : (
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current drop-shadow-md" />
                    )}
                  </motion.div>
                )}
                
                {/* Result Indicator */}
                {showResults && isAnswered && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow-sm"
                  >
                    {(q.type === 'mcq' || q.type === 'true_false') ? (
                      isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                      )
                    ) : (
                      essayFeedback?.[q.id] ? (
                        essayFeedback[q.id].score >= 50 ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                        )
                      ) : (
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                      )
                    )}
                  </motion.div>
                )}
                {isTimedOut && !isAnswered && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow-sm"
                  >
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                  </motion.div>
                )}
                {!showResults && isAnswered && !isCurrent && !isTimedOut && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-8 space-y-3 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] group-[.visual-tadc]/tadc:border-4 group-[.visual-tadc]/tadc:border-black group-[.visual-tadc]/tadc:rounded-[var(--radius-button)] group-[.visual-tadc]/tadc:bg-white group-[.visual-tadc]/tadc:shadow-[8px_8px_0px_#000]">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest group-[.visual-tadc]/tadc:text-black">
          <div className="w-4 h-4 bg-indigo-600 rounded-md shadow-sm group-[.visual-tadc]/tadc:bg-red-600 group-[.visual-tadc]/tadc:border-2 group-[.visual-tadc]/tadc:border-black group-[.visual-tadc]/tadc:rounded-[var(--radius-button)]" /> Current
        </div>
        {!showResults && (
          <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest group-[.visual-tadc]/tadc:text-black">
            <div className="w-4 h-4 bg-indigo-100 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-md relative flex items-center justify-center group-[.visual-tadc]/tadc:bg-blue-600 group-[.visual-tadc]/tadc:border-black group-[.visual-tadc]/tadc:rounded-[var(--radius-button)]">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border border-white dark:border-slate-900 group-[.visual-tadc]/tadc:bg-white group-[.visual-tadc]/tadc:border-black" />
            </div> Answered
          </div>
        )}
        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest group-[.visual-tadc]/tadc:text-black">
          <div className="w-4 h-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-md flex items-center justify-center group-[.visual-tadc]/tadc:border-black group-[.visual-tadc]/tadc:rounded-[var(--radius-button)]"><Flag className="w-2.5 h-2.5 text-rose-500 group-[.visual-tadc]/tadc:text-red-600" fill="currentColor" /></div> Flagged
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest group-[.visual-tadc]/tadc:text-black">
          <div className="w-4 h-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-md flex items-center justify-center group-[.visual-tadc]/tadc:border-black group-[.visual-tadc]/tadc:rounded-[var(--radius-button)]">
            <FileText className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500 group-[.visual-tadc]/tadc:text-black" />
          </div> Essay
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest group-[.visual-tadc]/tadc:text-black">
          <div className="w-4 h-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-md group-[.visual-tadc]/tadc:bg-yellow-400 group-[.visual-tadc]/tadc:border-black group-[.visual-tadc]/tadc:rounded-[var(--radius-button)]" /> Unanswered
        </div>
        {timeLimitType === 'per-question' && (
          <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
            <div className="w-4 h-4 bg-amber-100 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-md flex items-center justify-center"><Clock className="w-3 h-3 text-amber-500" /></div> Timed Out
          </div>
        )}
        {showResults && (
          <>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-md flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-emerald-500" /></div> Correct
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              <div className="w-4 h-4 bg-rose-100 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-md flex items-center justify-center"><XCircle className="w-3 h-3 text-rose-500" /></div> Incorrect
            </div>
          </>
        )}
      </div>
    </motion.div>
  </motion.div>
  );
};

const getFlagColor = (percentage?: number) => {
  if (percentage === undefined) return 'text-rose-500 bg-rose-50 border-rose-200';
  if (percentage <= 25) return 'text-rose-600 bg-rose-50 border-rose-200';
  if (percentage <= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
  if (percentage <= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-emerald-600 bg-emerald-50 border-emerald-200';
};

const getFlagIconColor = (percentage?: number) => {
  if (percentage === undefined) return 'text-rose-500';
  if (percentage <= 25) return 'text-rose-600';
  if (percentage <= 50) return 'text-amber-600';
  if (percentage <= 75) return 'text-yellow-600';
  return 'text-emerald-600';
};

const MinecraftHearts = ({ timeRemaining, timeLimitValue }: { timeRemaining: number; timeLimitValue: number }) => {
  const hearts = Math.ceil((timeRemaining / timeLimitValue) * 10);
  return (
    <div className="flex gap-0.5 sm:gap-1 opacity-0 group-[.visual-game-minecraft]/game-minecraft:opacity-100 transition-opacity duration-500 scale-75 sm:scale-100">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="relative w-3 h-3 sm:w-4 sm:h-4" style={{ imageRendering: 'pixelated' }}>
          {/* Heart Background (Empty) */}
          <div className="absolute inset-0 bg-[#333] border border-black" />
          {/* Heart Fill (Full) */}
          {i < hearts && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 bg-[#ff5555] border border-t-[#ffaaaa] border-l-[#ffaaaa] border-b-[#aa0000] border-r-[#aa0000]" 
            />
          )}
        </div>
      ))}
    </div>
  );
};

const HollowKnightVessels = ({ timeRemaining, timeLimitValue, accent }: { timeRemaining: number; timeLimitValue: number; accent: string }) => {
  const isSilksong = accent === 'hollow-knight-silksong' || accent === 'silksong-red' || accent === 'silksong-gold';
  const vesselCount = 5;
  const percentage = (timeRemaining / timeLimitValue) * 100;
  const fullVessels = Math.floor((percentage / 100) * vesselCount);
  const partialVessel = (percentage / 100) * vesselCount - fullVessels;

  return (
    <div className="flex items-center gap-2 sm:gap-3 scale-90 sm:scale-100">
      {Array.from({ length: vesselCount }).map((_, i) => (
        <div key={i} className="relative w-6 h-6 sm:w-8 sm:h-8">
          {/* Vessel Container */}
          <div className={`absolute inset-0 rounded-full border-2 ${isSilksong ? 'border-[#5a1515] bg-[#2a0a0a]' : 'border-slate-400 dark:border-white/30 bg-slate-200 dark:bg-black/60'} overflow-hidden shadow-inner`}>
             {/* Liquid Fill */}
             <motion.div
               initial={{ height: 0 }}
               animate={{ height: `${i < fullVessels ? 100 : i === fullVessels ? partialVessel * 100 : 0}%` }}
               className={`absolute bottom-0 left-0 w-full ${isSilksong ? 'bg-gradient-to-t from-rose-900 to-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.6)]' : 'bg-gradient-to-t from-slate-200 to-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'}`}
             >
               {/* Bubbles/Soul Effect */}
               <motion.div 
                 animate={{ y: [0, -20], opacity: [0, 1, 0] }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                 className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
               />
             </motion.div>
          </div>
          
          {/* Ornate Horns / Spool Ends */}
          {!isSilksong ? (
            <>
              <div className="absolute -top-2 left-0 w-1.5 h-4 bg-slate-400 dark:bg-white/30 rounded-t-full -rotate-20 shadow-sm" />
              <div className="absolute -top-2 right-0 w-1.5 h-4 bg-slate-400 dark:bg-white/30 rounded-t-full rotate-20 shadow-sm" />
              {/* Eye detail */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-black/20 rounded-full" />
            </>
          ) : (
            <>
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-1 h-5 bg-[#5a1515] rounded-t-full" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#5a1515] rounded-full" />
              {/* Needle Eye */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/20 rounded-full" />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export const Exam = React.memo(({ 
  questions, 
  settings, 
  onFinish,
  onSaveToBank,
  theme,
  reviewMode = false,
  initialAnswers = {},
  initialEssayFeedback = {},
  isSavedToBank,
  onAnswer,
  wrongPartSelections: initialWrongPartSelections = {},
  isHost = false,
  onForceNext,
  onTimeout,
  participantCount = 0,
  answeredCount = 0,
  participants = [],
  externalQuestionIndex,
  isSynchronizedMode = false,
  syncIsTransitioning = false,
  roomData,
  searchQuery = '',
  onSearchChange,
  onUsePower,
  performanceMode = false
}: { 
  questions: Question[], 
  settings: ExamSettings,
  onFinish: (answers: Record<string, string>, wrongPartSelections?: Record<string, string>, questionTimes?: Record<string, number>) => void,
  onSaveToBank?: (question: Question) => void,
  theme: AppTheme,
  reviewMode?: boolean,
  initialAnswers?: Record<string, string>,
  initialEssayFeedback?: Record<string, EssayFeedback>,
  wrongPartSelections?: Record<string, string>,
  isSavedToBank?: (id: string) => boolean,
  onAnswer?: (questionId: string, answer: string, isCorrect: boolean, timeTaken: number, points: number) => void,
  isHost?: boolean,
  onForceNext?: () => void,
  onTimeout?: () => void,
  participantCount?: number,
  answeredCount?: number,
  participants?: { id: string, name: string, answered: boolean }[],
  externalQuestionIndex?: number,
  isSynchronizedMode?: boolean,
  syncIsTransitioning?: boolean,
  roomData?: any,
  searchQuery?: string,
  onSearchChange?: (val: string) => void,
  onUsePower?: (power: Power) => void,
  performanceMode?: boolean
}) => {
  const [state, setState] = useState<ExamState>({
    questions,
    currentQuestionIndex: externalQuestionIndex !== undefined ? externalQuestionIndex : 0,
    answers: initialAnswers || {},
    essayFeedback: initialEssayFeedback || {},
    wrongPartSelections: initialWrongPartSelections || {},
    isFinished: reviewMode || false,
    startTime: Date.now(),
    lastActiveTime: Date.now(),
    timeRemaining: settings.timeLimitType === 'per-exam' 
      ? settings.timeLimitValue * 60 
      : 0,
    questionTimes: settings.timeLimitType === 'per-question'
      ? questions.reduce((acc, q) => ({ ...acc, [q.id]: settings.timeLimitValue }), {})
      : {},
    spentTimes: {},
    obtainedPowers: [],
    activeOffensivePowers: [],
    activeInteractivePowers: [],
    powerEffects: {}
  });
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [lastObtainedPower, setLastObtainedPower] = useState<Power | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showInstantFeedback, setShowInstantFeedback] = useState(reviewMode);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showFlagSlider, setShowFlagSlider] = useState(false);
  const [flagHoldTimer, setFlagHoldTimer] = useState<NodeJS.Timeout | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isShakeActive, setIsShakeActive] = useState(false);
  const [direction, setDirection] = useState(1);
  const [peekedAnswer, setPeekedAnswer] = useState<{ questionId: string, answer: string } | null>(null);
  const [activeTerm, setActiveTerm] = useState<{ title: string, word: string } | null>(null);

  const goToQuestion = useCallback((index: number) => {
    if (!reviewMode) setShowInstantFeedback(false);
    setShowExplanation(false);
    setState(prev => {
      setDirection(index > prev.currentQuestionIndex ? 1 : -1);
      return { 
        ...prev, 
        currentQuestionIndex: index,
        powerEffects: { ...prev.powerEffects, isHintActive: false }
      };
    });
  }, [reviewMode]);

  const currentQuestion = questions[state.currentQuestionIndex];

  const displayOptions = React.useMemo(() => {
    if (!currentQuestion.options) return [];
    return [...currentQuestion.options];
  }, [currentQuestion]);

  const [currentTime, setCurrentTime] = React.useState(Date.now());

  const handleFlagPress = () => {
    const timer = setTimeout(() => {
      setShowFlagSlider(true);
    }, 500);
    setFlagHoldTimer(timer);
  };

  useEffect(() => {
    if (externalQuestionIndex !== undefined && externalQuestionIndex !== state.currentQuestionIndex) {
      goToQuestion(externalQuestionIndex);
    }
  }, [externalQuestionIndex, goToQuestion]);

  const handleFlagRelease = () => {
    if (flagHoldTimer) {
      clearTimeout(flagHoldTimer);
      setFlagHoldTimer(null);
    }
  };

  const handleFlagClick = () => {
    if (!showFlagSlider) {
      setState(prev => {
        const currentFlags = prev.flags || {};
        const currentFlag = currentFlags[currentQuestion.id];
        return {
          ...prev,
          flags: {
            ...currentFlags,
            [currentQuestion.id]: {
              ...currentFlag,
              isFlagged: !currentFlag?.isFlagged
            }
          }
        };
      });
    }
  };

  const setFlagPercentage = (percentage: number) => {
    setState(prev => {
      const currentFlags = prev.flags || {};
      return {
        ...prev,
        flags: {
          ...currentFlags,
          [currentQuestion.id]: {
            isFlagged: true,
            percentage
          }
        }
      };
    });
  };

  const powerEffectsRef = React.useRef(state.powerEffects);
  React.useEffect(() => {
    powerEffectsRef.current = state.powerEffects;
  }, [state.powerEffects]);

  const onAnswerRef = React.useRef(onAnswer);
  React.useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  useEffect(() => {
    const handleTimeModifier = (e: CustomEvent<{ amount: number }>) => {
      setState(prev => {
        if (settings.timeLimitType === 'per-question') {
          const currentQId = prev.questions[prev.currentQuestionIndex].id;
          const currentQTime = prev.questionTimes?.[currentQId] ?? settings.timeLimitValue;
          const newTime = Math.max(0, currentQTime + e.detail.amount);
          return { ...prev, questionTimes: { ...prev.questionTimes, [currentQId]: newTime } };
        } else if (settings.timeLimitType === 'per-exam') {
          return { ...prev, timeRemaining: Math.max(0, prev.timeRemaining + e.detail.amount) };
        }
        return prev;
      });
    };

    const handleForceAnswer = (e: CustomEvent<{ questionId: string, answer: string, isCorrect?: boolean }>) => {
      setState(prev => {
        const { questionId, answer, isCorrect: eventIsCorrect } = e.detail;
        const qIndex = prev.questions.findIndex(q => q.id === questionId);
        if (qIndex === -1) return prev;
        
        const question = prev.questions[qIndex];
        const isCorrect = eventIsCorrect !== undefined ? eventIsCorrect : (answer === question.correctAnswer);
        
        const newAnswers = { ...prev.answers, [questionId]: answer };

        if (onAnswerRef.current) {
          const points = calculateQuestionPoints(question, answer, prev.wrongPartSelections?.[questionId], prev.essayFeedback?.[questionId], settings.rpgModeEnabled);
          onAnswerRef.current(questionId, answer, isCorrect, 0, points);
        }

        return { ...prev, answers: newAnswers };
      });
    };

    const handlePeekResult = (e: CustomEvent<{ questionId: string, answer: string }>) => {
      setPeekedAnswer(e.detail);
      setTimeout(() => setPeekedAnswer(null), 10000); // Clear after 10s
    };

    const handlePowerUsed = (e: CustomEvent<{ power: Power, name: string, userId: string }>) => {
      const { power } = e.detail;
      
      if (power.type === 'offensive') {
        // Check for shield using ref to avoid stale state
        if (powerEffectsRef.current.isShieldActive) {
          setState(prev => ({
            ...prev,
            powerEffects: { ...prev.powerEffects, isShieldActive: false }
          }));
          // Show shield block animation/notification
          console.log("Shield blocked an attack!");
          return;
        }

        const duration = (settings.powerDurations?.[power.id as keyof typeof settings.powerDurations] || (power.id === 'juice' ? 45000 : 5000));
        
        setState(prev => ({
          ...prev,
          activeOffensivePowers: [...prev.activeOffensivePowers, power.id],
          powerEffects: {
            ...prev.powerEffects,
            [power.id === 'glitch' ? 'isGlitchActive' : 
             power.id === 'ink_splash' ? 'isInkSplashActive' :
             power.id === 'mirror' ? 'isMirrorActive' :
             power.id === 'fog' ? 'isFogActive' :
             power.id === 'earthquake' ? 'isEarthquakeActive' :
             power.id === 'static_noise' ? 'isStaticNoiseActive' :
             power.id === 'upside_down' ? 'isUpsideDownActive' :
             power.id === 'vibration' ? 'isVibrationActive' :
             power.id === 'color_shift' ? 'isColorShiftActive' :
             power.id === 'pixelate' ? 'isPixelateActive' :
             power.id === 'blackout' ? 'isBlackoutActive' :
             power.id === 'gravity' ? 'isGravityActive' :
             power.id === 'thermal' ? 'isThermalActive' :
             power.id === 'old_movie' ? 'isOldMovieActive' :
             power.id === 'drunken' ? 'isDrunkenActive' :
             power.id === 'frost' ? 'isFrostActive' :
             power.id === 'scanner' ? 'isScannerActive' :
             power.id === 'low_battery' ? 'isLowBatteryActive' :
             power.id === 'juice' ? 'isJuiceActive' : '']: true
          }
        }));

        setTimeout(() => {
          setState(prev => ({
            ...prev,
            activeOffensivePowers: prev.activeOffensivePowers.filter(id => id !== power.id),
            powerEffects: {
              ...prev.powerEffects,
              [power.id === 'glitch' ? 'isGlitchActive' : 
               power.id === 'ink_splash' ? 'isInkSplashActive' :
               power.id === 'mirror' ? 'isMirrorActive' :
               power.id === 'fog' ? 'isFogActive' :
               power.id === 'earthquake' ? 'isEarthquakeActive' :
               power.id === 'static_noise' ? 'isStaticNoiseActive' :
               power.id === 'upside_down' ? 'isUpsideDownActive' :
               power.id === 'vibration' ? 'isVibrationActive' :
               power.id === 'color_shift' ? 'isColorShiftActive' :
               power.id === 'pixelate' ? 'isPixelateActive' :
               power.id === 'blackout' ? 'isBlackoutActive' :
               power.id === 'gravity' ? 'isGravityActive' :
               power.id === 'thermal' ? 'isThermalActive' :
               power.id === 'old_movie' ? 'isOldMovieActive' :
               power.id === 'drunken' ? 'isDrunkenActive' :
               power.id === 'frost' ? 'isFrostActive' :
               power.id === 'scanner' ? 'isScannerActive' :
               power.id === 'low_battery' ? 'isLowBatteryActive' :
               power.id === 'juice' ? 'isJuiceActive' : '']: false
            }
          }));
        }, duration);
      } else if (power.type === 'interactive') {
        // Check for shield
        if (powerEffectsRef.current.isShieldActive) {
          setState(prev => ({
            ...prev,
            powerEffects: { ...prev.powerEffects, isShieldActive: false }
          }));
          return;
        }

        setState(prev => ({
          ...prev,
          activeInteractivePowers: [...prev.activeInteractivePowers, power.id],
          powerEffects: {
            ...prev.powerEffects,
            [power.id === 'click_challenge' ? 'isClickChallengeActive' : 
             power.id === 'circle_hunt' ? 'isCircleHuntActive' :
             power.id === 'spin_wheel' ? 'isSpinWheelActive' :
             power.id === 'bug_squasher' ? 'isBugSquasherActive' :
             power.id === 'pattern_lock' ? 'isPatternLockActive' :
             power.id === 'slider_unlock' ? 'isSliderUnlockActive' : '']: true
          }
        }));
      }
    };

    window.addEventListener('time_modifier' as any, handleTimeModifier);
    window.addEventListener('force_answer' as any, handleForceAnswer);
    window.addEventListener('peek_result' as any, handlePeekResult);
    window.addEventListener('power_used' as any, handlePowerUsed);
    return () => {
      window.removeEventListener('time_modifier' as any, handleTimeModifier);
      window.removeEventListener('force_answer' as any, handleForceAnswer);
      window.removeEventListener('peek_result' as any, handlePeekResult);
      window.removeEventListener('power_used' as any, handlePowerUsed);
    };
  }, [settings.timeLimitType]);

  useEffect(() => {
    if (state.isFinished || reviewMode) return;

    const timer = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        const deltaMs = now - (prev.lastActiveTime || now);
        const currentQId = prev.questions[prev.currentQuestionIndex].id;
        
        const updatedSpentTimes = { ...prev.spentTimes };
        updatedSpentTimes[currentQId] = (updatedSpentTimes[currentQId] || 0) + deltaMs;

        let nextQuestionTimes = { ...prev.questionTimes };
        let nextTimeRemaining = prev.timeRemaining;
        let nextIsFinished = prev.isFinished;

        if (settings.timeLimitType === 'per-question') {
          const timeLeft = nextQuestionTimes[currentQId] ?? settings.timeLimitValue;
          if (timeLeft > 0) {
            nextQuestionTimes[currentQId] = Math.max(0, timeLeft - 1);
          }
        }

        if (settings.timeLimitType === 'per-exam') {
          if (prev.timeRemaining <= 1) {
            onFinish(prev.answers, prev.wrongPartSelections, updatedSpentTimes);
            nextIsFinished = true;
            nextTimeRemaining = 0;
          } else {
            nextTimeRemaining = prev.timeRemaining - 1;
          }
        }
        
        return { 
          ...prev, 
          spentTimes: updatedSpentTimes, 
          questionTimes: nextQuestionTimes,
          timeRemaining: nextTimeRemaining,
          isFinished: nextIsFinished,
          lastActiveTime: now 
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings, state.isFinished, onFinish, reviewMode]);

  useEffect(() => {
    if (!state.powerEffects.isAutoCompleteActive || !currentQuestion) return;

    if (currentQuestion.type === 'fill_in_blanks' && currentQuestion.blanks) {
      const currentAnswers = (state.answers[currentQuestion.id] || '').split('|');
      const firstEmptyIndex = currentQuestion.blanks.findIndex((_, idx) => !currentAnswers[idx]);
      
      if (firstEmptyIndex !== -1) {
        const newAnswers = [...currentAnswers];
        while (newAnswers.length < currentQuestion.blanks.length) newAnswers.push('');
        newAnswers[firstEmptyIndex] = currentQuestion.blanks[firstEmptyIndex];
        handleAnswer(newAnswers.join('|'), false);
      }
    } else if (currentQuestion.type === 'matching' && currentQuestion.matchingPairs) {
      const currentAnswers = (state.answers[currentQuestion.id] || '').split('|');
      const firstEmptyIndex = currentQuestion.matchingPairs.findIndex((_, idx) => !currentAnswers[idx]);
      
      if (firstEmptyIndex !== -1) {
        const newAnswers = [...currentAnswers];
        while (newAnswers.length < currentQuestion.matchingPairs.length) newAnswers.push('');
        newAnswers[firstEmptyIndex] = currentQuestion.matchingPairs[firstEmptyIndex].definition;
        handleAnswer(newAnswers.join('|'), false);
      }
    }

    // Deactivate after use
    setState(prev => ({ ...prev, powerEffects: { ...prev.powerEffects, isAutoCompleteActive: false } }));
  }, [state.powerEffects.isAutoCompleteActive, currentQuestion?.id]);

  const isTimedOut = settings.timeLimitType === 'per-question' && (state.questionTimes?.[currentQuestion.id] ?? 1) <= 0;
  
  useEffect(() => {
    if (isTimedOut && onTimeout) {
      onTimeout();
    }
  }, [isTimedOut, onTimeout]);

  const isAnswered = state.answers[currentQuestion.id] !== undefined;
  const isWrongPartNeeded = currentQuestion.type === 'true_false' && currentQuestion.correctAnswer === 'False' && !!currentQuestion.wrongPart;
  const isWrongPartSelected = !!state.wrongPartSelections?.[currentQuestion.id];

  let feedbackVisible = !!(showInstantFeedback || isTimedOut || (settings.instantFeedback && isAnswered && (currentQuestion.type === 'mcq' || (currentQuestion.type === 'true_false' && (!isWrongPartNeeded || isWrongPartSelected || state.answers[currentQuestion.id] === 'True')) || state.essayFeedback?.[currentQuestion.id])) || reviewMode);
  let isLocked = feedbackVisible;

  if (isSynchronizedMode) {
    feedbackVisible = syncIsTransitioning || reviewMode;
    isLocked = syncIsTransitioning || isTimedOut || reviewMode;
  }

  let isCorrect = false;
  if (currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false') {
    isCorrect = (currentQuestion.type === 'true_false' && isWrongPartNeeded)
      ? state.answers[currentQuestion.id] === 'False' && state.wrongPartSelections?.[currentQuestion.id] === currentQuestion.wrongPart
      : state.answers[currentQuestion.id] === currentQuestion.correctAnswer;
  } else if (currentQuestion.type === 'multi_select') {
    const selected = (state.answers[currentQuestion.id] || '').split('|').filter(Boolean).sort();
    const correct = (currentQuestion.correctAnswers || []).slice().sort();
    isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
  } else if (currentQuestion.type === 'fill_in_blanks') {
    const selected = (state.answers[currentQuestion.id] || '').split('|');
    const correct = currentQuestion.blanks || [];
    isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
  } else if (currentQuestion.type === 'matching') {
    const selected = (state.answers[currentQuestion.id] || '').split('|').filter(Boolean).sort();
    const correct = (currentQuestion.matchingPairs || []).map(p => `${p.term}:${p.definition}`).sort();
    isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
  } else if (currentQuestion.type === 'locate_on_image') {
    try {
      const selected = JSON.parse(state.answers[currentQuestion.id] || '[]');
      const correct = currentQuestion.imageTargets || [];
      if (selected.length === correct.length && correct.length > 0) {
        isCorrect = correct.every((target: any) => {
          const sel = selected.find((s: any) => s.targetId === target.id);
          if (!sel) return false;
          const dx = sel.x - target.x;
          const dy = sel.y - target.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return dist <= target.radius;
        });
      } else {
        isCorrect = false;
      }
    } catch (e) {
      isCorrect = false;
    }
  } else {
    isCorrect = (state.essayFeedback?.[currentQuestion.id]?.score ?? 0) >= 50;
  }

  const feedbackStatus = !feedbackVisible ? 'none' 
    : (isTimedOut && !isAnswered) ? (isSynchronizedMode ? 'incorrect' : 'timeout')
    : (reviewMode && !isAnswered) ? 'none'
    : isCorrect ? 'correct' : 'incorrect';

  useEffect(() => {
    if (feedbackStatus !== 'none' && feedbackStatus !== 'timeout' && !reviewMode) {
      setShowNotification(true);
      if (feedbackStatus === 'incorrect' && theme.visualStyle === 'hollow-knight') {
        setIsShakeActive(true);
        setTimeout(() => setIsShakeActive(false), 400);
      }
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setShowNotification(false);
    }
  }, [feedbackStatus, reviewMode, state.currentQuestionIndex, theme.visualStyle]);

  useEffect(() => {
    if (isTimedOut && !reviewMode) {
      if ((currentQuestion.type === 'essay' || currentQuestion.type === 'multi_select' || currentQuestion.type === 'fill_in_blanks' || currentQuestion.type === 'matching' || currentQuestion.type === 'locate_on_image') && !state.essayFeedback?.[currentQuestion.id]) {
        handleComplexSubmit(true, false);
      } else if ((currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false') && (!isAnswered || (currentQuestion.type === 'true_false' && isWrongPartNeeded && !isWrongPartSelected))) {
        handleAnswer(state.answers[currentQuestion.id] || '', true, undefined, false);
      }
    }
  }, [isTimedOut, reviewMode, currentQuestion.id, currentQuestion.type, isAnswered, isWrongPartNeeded, isWrongPartSelected, state.answers]);

  const displayTime = settings.timeLimitType === 'per-question' 
    ? Math.max(0, state.questionTimes?.[currentQuestion.id] ?? settings.timeLimitValue)
    : state.timeRemaining;

  useEffect(() => {
    // Reset advantageous power effects on question change
    setState(prev => ({
      ...prev,
      powerEffects: {
        ...prev.powerEffects,
        isFiftyFiftyActive: false,
        isAbsolutelySmartActive: false
      }
    }));
  }, [state.currentQuestionIndex]);

  const getRandomPower = useCallback(() => {
    const allowedIds = settings?.allowedPowerIds || POWERS.map(p => p.id);
    const availablePowers = POWERS.filter(p => allowedIds.includes(p.id));
    if (availablePowers.length === 0) return null;
    return availablePowers[Math.floor(Math.random() * availablePowers.length)];
  }, [settings?.allowedPowerIds]);

  const handleAnswer = (answer: string, isAutoSubmit = false, wrongPartOverride?: string, isManual = true) => {
    if (isTimedOut && !isAutoSubmit) return;
    if (isLocked && !isAutoSubmit) return;
    
    const isWrongPartNeeded = currentQuestion.type === 'true_false' && currentQuestion.correctAnswer === 'False' && !!currentQuestion.wrongPart;
    const currentWrongPartSelection = wrongPartOverride || state.wrongPartSelections?.[currentQuestion.id];
    const isWrongPartSelected = !!currentWrongPartSelection;

    // Prevent changing answer if instant feedback is enabled and already answered/submitted
    if (settings.instantFeedback && state.answers[currentQuestion.id] !== undefined) {
      if (currentQuestion.type === 'true_false' && isWrongPartNeeded && !state.wrongPartSelections?.[currentQuestion.id] && answer === 'False') {
        // Allow it to proceed
      } else if (currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false' || state.essayFeedback?.[currentQuestion.id]) {
        return;
      }
    }

    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: answer },
      powerEffects: { ...prev.powerEffects, isHintActive: false }
    }));

    if (currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false' || isAutoSubmit) {
      // If T/F and answer is False and wrongPart is needed, only call onAnswer if wrongPart is selected or if it's an auto-submit from timeout
      if (currentQuestion.type === 'true_false' && isWrongPartNeeded && !isWrongPartSelected && !isAutoSubmit && answer === 'False') {
        // Don't call onAnswer yet, wait for wrong part selection
        return;
      }

      let isCorrect = false;
      if (currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false') {
        isCorrect = (currentQuestion.type === 'true_false' && isWrongPartNeeded)
          ? answer === 'False' && currentWrongPartSelection === currentQuestion.wrongPart
          : answer === currentQuestion.correctAnswer;
      } else if (currentQuestion.type === 'multi_select') {
        const selected = answer.split('|').filter(Boolean).sort();
        const correct = (currentQuestion.correctAnswers || []).slice().sort();
        isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
      } else if (currentQuestion.type === 'fill_in_blanks') {
        const selected = answer.split('|');
        const correct = currentQuestion.blanks || [];
        isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
      } else if (currentQuestion.type === 'matching') {
        const selected = answer.split('|').filter(Boolean).sort();
        const correct = (currentQuestion.matchingPairs || []).map(p => `${p.term}:${p.definition}`).sort();
        isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
      } else if (currentQuestion.type === 'locate_on_image') {
        try {
          const selected = JSON.parse(answer || '[]');
          const correct = currentQuestion.imageTargets || [];
          if (selected.length === correct.length && correct.length > 0) {
            isCorrect = correct.every((target: any) => {
              const sel = selected.find((s: any) => s.targetId === target.id);
              if (!sel) return false;
              const dx = sel.x - target.x;
              const dy = sel.y - target.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              return dist <= target.radius;
            });
          } else {
            isCorrect = false;
          }
        } catch (e) {
          isCorrect = false;
        }
      }

      const timeTaken = settings.timeLimitType === 'per-question' 
        ? (settings.timeLimitValue - displayTime) * 1000 
        : Date.now() - state.startTime;
      
      if (onAnswer) {
        const points = calculateQuestionPoints(currentQuestion, answer, state.wrongPartSelections?.[currentQuestion.id], state.essayFeedback?.[currentQuestion.id], settings.rpgModeEnabled);
        onAnswer(currentQuestion.id, answer, isCorrect, timeTaken, points);
      }

      // Power System: Grant power on correct answer
      if (settings.powerSystemEnabled && settings.instantFeedback && isCorrect && isManual) {
        const chance = settings.guaranteedPowerPerCorrect ? 1.0 : 0.3;
        if (Math.random() < chance) {
          const randomPower = getRandomPower();
          if (randomPower) {
            setState(prev => ({
              ...prev,
              obtainedPowers: [...prev.obtainedPowers, randomPower]
            }));
            setLastObtainedPower(randomPower);
          }
        }
      }
    }

    if (settings.instantFeedback && isAutoSubmit) {
      setShowInstantFeedback(true);
    }
  };

  const handleComplexSubmit = (isAutoSubmit = false, isManual = true) => {
    const answer = state.answers[currentQuestion.id] || '';
    if (!answer.trim() && !isAutoSubmit && (currentQuestion.type === 'essay' || currentQuestion.type === 'multi_essay')) return;
    
    if (currentQuestion.type === 'essay' || currentQuestion.type === 'multi_essay') {
      let feedback = {} as EssayFeedback;

      if (currentQuestion.type === 'essay') {
        feedback = gradeEssay(answer, currentQuestion.correctAnswer || '');
      } else {
        const parsedAnswers = (typeof answer === 'string' && answer.startsWith('{')) ? JSON.parse(answer) : {};
        const subFeedbacks: Record<string, EssayFeedback> = {};
        let totalScore = 0;
        let totalLength = 0;
        const subQuestions = currentQuestion.subQuestions || [];
        
        subQuestions.forEach(sq => {
           const subAns = parsedAnswers[sq.id] || '';
           const fb = gradeEssay(subAns, sq.correctAnswer || '');
           subFeedbacks[sq.id] = fb;
           totalScore += fb.score;
           totalLength += fb.length;
        });
        
        const avgScore = subQuestions.length > 0 ? (totalScore / subQuestions.length) : 0;
        feedback = {
           score: avgScore,
           grade: avgScore >= 90 ? 'A' : avgScore >= 80 ? 'B' : avgScore >= 70 ? 'C' : avgScore >= 60 ? 'D' : 'F',
           feedback: 'Feedback provided per sub-question.',
           usedTerms: [],
           missingTerms: [],
           length: totalLength,
           hasParagraphs: true,
           subFeedbacks
        };
      }

      setState(prev => ({
        ...prev,
        essayFeedback: {
          ...prev.essayFeedback,
          [currentQuestion.id]: feedback
        }
      }));

      if (onAnswer) {
        const timeTaken = settings.timeLimitType === 'per-question' 
          ? (settings.timeLimitValue - displayTime) * 1000 
          : Date.now() - state.startTime;
        const points = calculateQuestionPoints(currentQuestion, answer, undefined, feedback, settings.rpgModeEnabled);
        const passed = currentQuestion.type === 'multi_essay' ? feedback.score >= 50 : feedback.score >= 50;
        onAnswer(currentQuestion.id, answer, passed, timeTaken, points);
      }

      // Power System: Grant power on correct answer
      if (settings.powerSystemEnabled && settings.instantFeedback && feedback.score >= 50 && isManual) {
        const chance = settings.guaranteedPowerPerCorrect ? 1.0 : 0.3;
        if (Math.random() < chance) {
          const randomPower = getRandomPower();
          if (randomPower) {
            setState(prev => ({
              ...prev,
              obtainedPowers: [...prev.obtainedPowers, randomPower]
            }));
            setLastObtainedPower(randomPower);
          }
        }
      }
    } else {
      let isCorrect = false;
      if (currentQuestion.type === 'multi_select') {
        const selected = answer.split('|').filter(Boolean).sort();
        const correct = (currentQuestion.correctAnswers || []).slice().sort();
        isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
      } else if (currentQuestion.type === 'fill_in_blanks') {
        const selected = answer.split('|');
        const correct = currentQuestion.blanks || [];
        isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
      } else if (currentQuestion.type === 'matching') {
        const selected = answer.split('|').filter(Boolean).sort();
        const correct = (currentQuestion.matchingPairs || []).map(p => `${p.term}:${p.definition}`).sort();
        isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
      } else if (currentQuestion.type === 'locate_on_image') {
        try {
          const selected = JSON.parse(answer || '[]');
          const correct = currentQuestion.imageTargets || [];
          if (selected.length === correct.length && correct.length > 0) {
            isCorrect = correct.every((target: any) => {
              const sel = selected.find((s: any) => s.targetId === target.id);
              if (!sel) return false;
              const dx = sel.x - target.x;
              const dy = sel.y - target.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              return dist <= target.radius;
            });
          } else {
            isCorrect = false;
          }
        } catch (e) {
          isCorrect = false;
        }
      }

      setState(prev => ({
        ...prev,
        essayFeedback: {
          ...prev.essayFeedback,
          [currentQuestion.id]: { score: isCorrect ? 100 : 0, grade: '', feedback: '', usedTerms: [], missingTerms: [], length: 0, hasParagraphs: false }
        }
      }));

      if (onAnswer) {
        const timeTaken = settings.timeLimitType === 'per-question' 
          ? (settings.timeLimitValue - displayTime) * 1000 
          : Date.now() - state.startTime;
        const points = calculateQuestionPoints(currentQuestion, answer, state.wrongPartSelections?.[currentQuestion.id], state.essayFeedback?.[currentQuestion.id] || { score: isCorrect ? 100 : 0 }, settings.rpgModeEnabled);
        onAnswer(currentQuestion.id, answer, isCorrect, timeTaken, points);
      }

      // Power System: Grant power on correct answer
      if (settings.powerSystemEnabled && settings.instantFeedback && isCorrect && isManual) {
        const chance = settings.guaranteedPowerPerCorrect ? 1.0 : 0.3;
        if (Math.random() < chance) {
          const randomPower = getRandomPower();
          if (randomPower) {
            setState(prev => ({
              ...prev,
              obtainedPowers: [...prev.obtainedPowers, randomPower]
            }));
            setLastObtainedPower(randomPower);
          }
        }
      }
    }

    setShowInstantFeedback(true);
  };

  const handleWrongPartClick = (part: string) => {
    if (feedbackVisible || reviewMode) return;
    if (state.answers[currentQuestion.id] !== 'False') return;

    setState(prev => ({
      ...prev,
      wrongPartSelections: { ...prev.wrongPartSelections, [currentQuestion.id]: part }
    }));

    // After selecting the wrong part, we submit the answer
    handleAnswer('False', true, part);
  };

  const nextQuestion = () => {
    if (state.currentQuestionIndex < questions.length - 1) {
      goToQuestion(state.currentQuestionIndex + 1);
    } else if (!reviewMode) {
      onFinish(state.answers, state.wrongPartSelections, state.spentTimes);
    }
  };

  const prevQuestion = () => {
    if (state.currentQuestionIndex > 0) {
      goToQuestion(state.currentQuestionIndex - 1);
    }
  };

  const handleUsePower = (power: Power) => {
    if (power.type === 'advantage') {
      if (power.id === 'fifty_fifty') {
        setState(prev => ({ ...prev, powerEffects: { ...prev.powerEffects, isFiftyFiftyActive: true } }));
      } else if (power.id === 'absolutely_smart') {
        setState(prev => ({ ...prev, powerEffects: { ...prev.powerEffects, isAbsolutelySmartActive: true } }));
      } else if (power.id === 'time_warp') {
        setState(prev => ({ ...prev, timeRemaining: prev.timeRemaining + 30, powerEffects: { ...prev.powerEffects, isTimeWarpActive: true } }));
        setTimeout(() => setState(prev => ({ ...prev, powerEffects: { ...prev.powerEffects, isTimeWarpActive: false } })), 3000);
      } else if (power.id === 'hint_master') {
        setState(prev => ({ ...prev, powerEffects: { ...prev.powerEffects, isHintActive: true } }));
      } else if (power.id === 'shield') {
        setState(prev => ({ ...prev, powerEffects: { ...prev.powerEffects, isShieldActive: true } }));
      } else if (power.id === 'auto_complete') {
        setState(prev => ({ ...prev, powerEffects: { ...prev.powerEffects, isAutoCompleteActive: true } }));
      } else if (power.id === 'clarity') {
        setState(prev => ({ 
          ...prev, 
          activeOffensivePowers: [], 
          powerEffects: { ...prev.powerEffects, isClarityActive: true } 
        }));
        setTimeout(() => setState(prev => ({ ...prev, powerEffects: { ...prev.powerEffects, isClarityActive: false } })), 2000);
      }
    } else {
      if (onUsePower) {
        onUsePower(power);
      } else {
        // In solo mode, trigger locally
        window.dispatchEvent(new CustomEvent('power_used', { detail: { power, name: 'You', userId: 'local' } }));
      }
    }
    
    // Remove used power from obtained powers
    setState(prev => {
      const index = prev.obtainedPowers.findIndex(p => p.id === power.id);
      if (index === -1) return prev;
      const newPowers = [...prev.obtainedPowers];
      newPowers.splice(index, 1);
      return { ...prev, obtainedPowers: newPowers };
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const markdownComponents = useMemo(() => ({
    p: ({children}: any) => <>{animateChildren(children, theme)}</>,
    mark: ({node, className, children, ...props}: any) => (
      <mark 
        className={`px-2 py-0.5 rounded-lg font-black shadow-sm inline-block mx-0.5 transition-transform hover:scale-105 ${theme.visualStyle === 'undertale' ? 'bg-white text-black rounded-none font-normal' : theme.visualStyle === 'brutalist' ? 'bg-[var(--accent-color)] text-white border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]' : theme.visualStyle === 'ultimate' ? '' : theme.visualStyle === 'virus' ? 'bg-black/20 dark:bg-black/40 text-[var(--accent-color)] border border-[var(--accent-color)]/30' : theme.visualStyle === 'liquid-glass' ? 'bg-white/25 text-white border border-white/40 shadow-[0_4px_12px_rgba(255,255,255,0.2)] backdrop-blur-md rounded-xl' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-b-2 border-amber-400 dark:border-amber-600'} ${className || ''}`} 
        {...props} 
      >
        {animateChildren(children, theme)}
      </mark>
    ),
    strong: ({node, className, children, ...props}: any) => (
      <strong 
        className={`font-black underline decoration-2 underline-offset-2 ${theme.visualStyle === 'undertale' ? 'text-white no-underline font-normal' : theme.visualStyle === 'brutalist' ? 'bg-black text-white dark:bg-white dark:text-black px-1 no-underline' : theme.visualStyle === 'ultimate' ? '' : theme.visualStyle === 'virus' ? 'text-[var(--accent-color)] decoration-[var(--accent-color)]/50' : theme.visualStyle === 'liquid-glass' ? 'text-white decoration-white/50 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-indigo-700 dark:text-indigo-400 decoration-indigo-200 dark:decoration-indigo-800'} ${className || ''}`} 
        {...props} 
      >
        {animateChildren(children, theme)}
      </strong>
    ),
    em: ({node, className, children, ...props}: any) => (
      <em 
        className={`font-medium italic ${theme.visualStyle === 'undertale' ? 'text-white not-italic font-normal' : theme.visualStyle === 'brutalist' ? 'not-italic uppercase tracking-widest text-xs border-b-2 border-black dark:border-white' : theme.visualStyle === 'ultimate' ? '' : theme.visualStyle === 'liquid-glass' ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'} ${className || ''}`} 
        {...props} 
      >
        {animateChildren(children, theme)}
      </em>
    ),
    term: ({ node, title, children, ...props }: any) => (
      <Term 
        title={title} 
        active={feedbackVisible} 
        onClick={(title, word) => setActiveTerm({ title, word })}
      >
        {animateChildren(children, theme)}
      </Term>
    ),
    img: ({node, ...props}: any) => (
      <img 
        {...props} 
        className="max-w-full h-auto rounded-xl shadow-lg my-4 mx-auto block border-2 border-white/20 dark:border-slate-800"
        referrerPolicy="no-referrer"
      />
    ),
  }), [feedbackVisible, theme]);

  const clickableWordsComponents = useMemo(() => ({
    p: ({node, children, ...props}: any) => {
      let wordCounter = 0;
      const renderClickableWords = (childNode: React.ReactNode): React.ReactNode => {
        if (typeof childNode === 'string') {
          return childNode.split(/(\s+)/).map((word) => {
            const currentKey = wordCounter++;
            if (!word.trim()) return <span key={`space-${currentKey}`}>{word}</span>;
            const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
            const isSelected = state.wrongPartSelections?.[currentQuestion?.id] === cleanWord;
            return (
              <motion.span
                key={`word-${currentKey}`}
                whileHover={{ scale: 1.1, color: theme.visualStyle === 'virus' ? 'var(--accent-color)' : theme.visualStyle === 'liquid-glass' ? '#ffffff' : 'var(--color-indigo-600)' }}
                onClick={() => handleWrongPartClick(cleanWord)}
                className={`cursor-pointer transition-all rounded-md px-1 inline-block ${
                  isSelected
                    ? (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).accent} ${getArcaneStyles(theme.accentColor).accentText} shadow-[0_0_10px_rgba(0,0,0,0.3)]` : theme.visualStyle === 'liquid-glass' ? 'bg-white/40 text-white shadow-[0_0_20px_rgba(255,255,255,0.6)] ring-2 ring-white/50 backdrop-blur-sm' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400')
                    : (theme.visualStyle === 'virus' ? 'hover:bg-black/20 dark:hover:bg-black/40' : theme.visualStyle === 'liquid-glass' ? 'hover:bg-white/10 text-white/80' : 'hover:bg-slate-100 dark:hover:bg-slate-800')
                }`}
              >
                {word}
              </motion.span>
            );
          });
        }
        if (React.isValidElement(childNode)) {
          return React.cloneElement(
            childNode,
            childNode.props,
            React.Children.map((childNode as React.ReactElement<any>).props.children, renderClickableWords)
          );
        }
        if (Array.isArray(childNode)) {
          return React.Children.map(childNode, renderClickableWords);
        }
        return childNode;
      };
      
      return <span className="inline-flex flex-wrap gap-x-2 gap-y-1" {...props}>{renderClickableWords(children)}</span>;
    },
    term: ({children}: any) => <>{children}</>,
    strong: ({node, children, ...props}: any) => <strong className={`font-black underline decoration-2 underline-offset-2 ${theme.visualStyle === 'undertale' ? 'text-white no-underline font-normal' : theme.visualStyle === 'brutalist' ? 'bg-black text-white dark:bg-white dark:text-black px-1 no-underline' : theme.visualStyle === 'ultimate' ? '' : 'text-indigo-700 dark:text-indigo-400 decoration-indigo-200 dark:decoration-indigo-800'}`} {...props}>{children}</strong>,
    em: ({node, children, ...props}: any) => <em className={`font-medium italic ${theme.visualStyle === 'undertale' ? 'text-white not-italic font-normal' : theme.visualStyle === 'brutalist' ? 'not-italic uppercase tracking-widest text-xs border-b-2 border-black dark:border-white' : theme.visualStyle === 'ultimate' ? '' : 'text-slate-600 dark:text-slate-400'}`} {...props}>{children}</em>,
    mark: ({node, children, ...props}: any) => <mark className={`px-2 py-0.5 rounded-lg font-black shadow-sm inline-block mx-0.5 ${theme.visualStyle === 'undertale' ? 'bg-white text-black rounded-none font-normal' : theme.visualStyle === 'brutalist' ? 'bg-[var(--accent-color)] text-white border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]' : theme.visualStyle === 'ultimate' ? '' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-b-2 border-amber-400 dark:border-amber-600'}`} {...props}>{children}</mark>,
    img: ({node, ...props}: any) => (
      <img 
        {...props} 
        className="max-w-full h-auto rounded-xl shadow-lg my-4 mx-auto block border-2 border-white/20 dark:border-slate-800"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    ),
  }), [state.wrongPartSelections, currentQuestion?.id, state.answers[currentQuestion?.id]]);

  const getCardAnimation = () => {
    const baseAnimate = { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0, filter: 'none', skewX: 0 };
    const baseTransition = { type: "spring", stiffness: 300, damping: 30 };

    if (!showNotification || feedbackStatus === 'none' || reviewMode) {
      return { animate: baseAnimate, transition: baseTransition };
    }

    // Dynamic color based on accent
    const accentGlow = theme.accentColor.includes('brutal') ? 'rgba(0,0,0,0.5)' : 
                       theme.accentColor.includes('arcane') ? 'rgba(138,43,226,0.6)' :
                       feedbackStatus === 'correct' ? 'rgba(16,185,129,0.6)' : 'rgba(244,63,94,0.6)';

    switch (theme.visualStyle) {
      case 'ultimate':
        if (feedbackStatus === 'correct') {
          return {
            animate: { ...baseAnimate, scale: [1, 1.05, 0.95, 1], rotate: [0, 2, -2, 0], filter: ['none', `drop-shadow(0 0 20px ${accentGlow})`, 'none'] },
            transition: { duration: 0.6, ease: "backOut" } as any
          };
        } else if (feedbackStatus === 'incorrect') {
          return {
            animate: { ...baseAnimate, x: [0, -15, 15, -10, 10, -5, 5, 0], rotate: [0, -5, 5, -2, 2, 0], filter: ['none', `drop-shadow(0 0 20px ${accentGlow})`, 'none'] },
            transition: { duration: 0.5, ease: "easeInOut" } as any
          };
        }
        break;
      case 'brutalist':
        if (feedbackStatus === 'correct') {
          return {
            animate: { ...baseAnimate, scale: [1, 1.1, 0.9, 1], rotate: [0, -3, 3, 0], x: [0, 5, -5, 0] },
            transition: { duration: 0.4, ease: "circOut" } as any
          };
        } else if (feedbackStatus === 'incorrect') {
          return {
            animate: { ...baseAnimate, x: [0, -20, 20, -15, 15, -10, 10, 0], rotate: [0, -4, 4, -2, 2, 0], skewX: [0, 10, -10, 0] },
            transition: { duration: 0.4, ease: "linear" } as any
          };
        }
        break;
      case 'game-minecraft':
        if (feedbackStatus === 'correct') {
          return {
            animate: { ...baseAnimate, y: [0, -25, 0, -12, 0], scale: [1, 1.05, 1] },
            transition: { duration: 0.6, ease: "easeOut" } as any
          };
        } else if (feedbackStatus === 'incorrect') {
          return {
            animate: { ...baseAnimate, x: [0, -12, 12, -12, 12, 0], filter: ['none', 'brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(5)', 'none'] },
            transition: { duration: 0.5 } as any
          };
        }
        break;
      case 'tadc':
        if (feedbackStatus === 'correct') {
          return {
            animate: { ...baseAnimate, scale: [1, 1.15, 0.85, 1.1, 1], rotate: [0, 10, -10, 5, 0], y: [0, -10, 10, 0] },
            transition: { duration: 0.7, ease: "easeInOut" } as any
          };
        } else if (feedbackStatus === 'incorrect') {
          return {
            animate: { ...baseAnimate, x: [0, -15, 15, -15, 15, 0], skewX: [0, 15, -15, 7, -7, 0], filter: ['none', 'invert(1)', 'none', 'hue-rotate(180deg)', 'none'] },
            transition: { duration: 0.6 } as any
          };
        }
        break;
      case 'adventure-time':
        if (feedbackStatus === 'correct') {
          return {
            animate: { ...baseAnimate, scale: [1, 1.2, 0.8, 1.1, 1], rotate: [0, -5, 5, 0], y: [0, -20, 0] },
            transition: { duration: 0.6, ease: "backOut" } as any
          };
        } else if (feedbackStatus === 'incorrect') {
          return {
            animate: { ...baseAnimate, x: [0, -12, 12, -8, 8, 0], skewX: [0, -8, 8, 0], scale: [1, 0.9, 1] },
            transition: { duration: 0.5, ease: "easeInOut" } as any
          };
        }
        break;
      case 'duck':
        if (feedbackStatus === 'correct') {
          return {
            animate: { ...baseAnimate, y: [0, -20, 10, -5, 0], scale: [1, 1.1, 0.9, 1.05, 1], rotate: [0, 2, -2, 0] },
            transition: { duration: 0.7, ease: "easeInOut" } as any
          };
        } else if (feedbackStatus === 'incorrect') {
          return {
            animate: { ...baseAnimate, rotate: [0, -8, 8, -8, 8, 0], x: [0, -8, 8, -8, 8, 0], scale: [1, 0.95, 1] },
            transition: { duration: 0.5, ease: "easeInOut" } as any
          };
        }
        break;
      case 'undertale':
        if (feedbackStatus === 'correct') {
          return {
            animate: { ...baseAnimate, scale: [1, 1.03, 1], filter: ['none', `drop-shadow(0 0 25px ${accentGlow})`, 'none'] },
            transition: { duration: 0.8, ease: "easeInOut" } as any
          };
        } else if (feedbackStatus === 'incorrect') {
          return {
            animate: { ...baseAnimate, x: [0, -12, 12, -12, 12, 0], filter: ['none', 'grayscale(1)', 'none'] },
            transition: { duration: 0.4, ease: "linear" } as any
          };
        }
        break;
      case 'saidi':
        if (feedbackStatus === 'correct') {
          return {
            animate: { ...baseAnimate, y: [0, -15, 0], scale: [1, 1.04, 1], filter: ['none', 'brightness(1.2)', 'none'] },
            transition: { duration: 0.6, ease: "easeOut" } as any
          };
        } else if (feedbackStatus === 'incorrect') {
          return {
            animate: { ...baseAnimate, x: [0, -8, 8, -5, 5, 0], rotate: [0, -1, 1, 0] },
            transition: { duration: 0.5, ease: "easeInOut" } as any
          };
        }
        break;
      case 'arcane':
        if (feedbackStatus === 'correct') {
          return {
            animate: { ...baseAnimate, scale: [1, 1.08, 0.95, 1], rotate: [0, 3, -3, 0], filter: ['none', `drop-shadow(0 0 30px ${accentGlow})`, 'none'] },
            transition: { duration: 0.6, ease: "backOut" } as any
          };
        } else if (feedbackStatus === 'incorrect') {
          return {
            animate: { ...baseAnimate, x: [0, -12, 12, -12, 12, 0], skewX: [0, 10, -10, 0], filter: ['none', 'hue-rotate(90deg) blur(2px)', 'none'] },
            transition: { duration: 0.5 } as any
          };
        }
        break;
      case 'superhero':
        if (feedbackStatus === 'correct') {
          return {
            animate: { ...baseAnimate, scale: [1, 1.1, 1], rotate: [0, 2, -2, 0], y: [0, -10, 0] },
            transition: { duration: 0.4, ease: "easeOut" } as any
          };
        } else if (feedbackStatus === 'incorrect') {
          return {
            animate: { ...baseAnimate, x: [0, -10, 10, -10, 10, 0], rotate: [0, -3, 3, 0] },
            transition: { duration: 0.4 } as any
          };
        }
        break;
      case 'minimal':
        if (feedbackStatus === 'correct') {
          return {
            animate: { ...baseAnimate, scale: [1, 1.02, 1], y: [0, -2, 0] },
            transition: { duration: 0.4, ease: "easeInOut" } as any
          };
        } else if (feedbackStatus === 'incorrect') {
          return {
            animate: { ...baseAnimate, x: [0, -5, 5, -3, 3, 0] },
            transition: { duration: 0.4, ease: "easeInOut" } as any
          };
        }
        break;
      case 'modern':
      default:
        if (feedbackStatus === 'correct') {
          return {
            animate: { ...baseAnimate, scale: [1, 1.04, 1], y: [0, -6, 0], filter: ['none', `drop-shadow(0 0 15px ${accentGlow})`, 'none'] },
            transition: { duration: 0.5, ease: "easeOut" } as any
          };
        } else if (feedbackStatus === 'incorrect') {
          return {
            animate: { ...baseAnimate, x: [0, -8, 8, -6, 6, 0], rotate: [0, -1, 1, 0] },
            transition: { duration: 0.5, ease: "easeInOut" } as any
          };
        }
        break;
    }
    return { animate: baseAnimate, transition: baseTransition };
  };

  const getOptionAnimation = (isSelected: boolean, isCorrect: boolean, isPeeked: boolean) => {
    if (isPeeked) return { scale: [1, 1.03, 1], transition: { duration: 1, repeat: Infinity } };
    if (!feedbackVisible) return { x: 0, scale: 1, y: 0, rotate: 0 };

    const accentGlow = theme.accentColor.includes('brutal') ? 'rgba(0,0,0,0.5)' : 
                       theme.accentColor.includes('arcane') ? 'rgba(138,43,226,0.6)' :
                       isCorrect ? 'rgba(16,185,129,0.6)' : 'rgba(244,63,94,0.6)';

    if (isSelected && !isCorrect) {
      switch (theme.visualStyle) {
        case 'ultimate': return { x: [-10, 10, -10, 10, 0], rotate: [0, -5, 5, -5, 5, 0], scale: [1, 0.9, 1], filter: [`drop-shadow(0 0 10px ${accentGlow})`, 'none'], transition: { duration: 0.5, ease: "easeInOut" } as any };
        case 'brutalist': return { x: [-12, 12, -10, 10, -5, 5, 0], rotate: [0, -3, 3, -1, 1, 0], skewX: [0, 5, -5, 0], transition: { duration: 0.4, ease: "linear" } as any };
        case 'game-minecraft': return { x: [-8, 8, -8, 8, 0], filter: ['brightness(1)', 'brightness(0.5) sepia(1)', 'brightness(1)'], transition: { duration: 0.4 } as any };
        case 'tadc': return { x: [-12, 12, -12, 12, 0], skewX: [0, 10, -10, 0], filter: ['none', 'invert(0.5)', 'none'], transition: { duration: 0.4 } as any };
        case 'adventure-time': return { x: [-10, 10, -6, 6, 0], skewX: [0, -5, 5, 0], scale: [1, 0.95, 1], transition: { duration: 0.4 } as any };
        case 'duck': return { rotate: [0, -5, 5, -5, 5, 0], y: [0, 5, 0], transition: { duration: 0.4 } as any };
        case 'undertale': return { x: [-8, 8, -8, 8, 0], filter: ['none', 'grayscale(1)', 'none'], transition: { duration: 0.3 } as any };
        case 'saidi': return { x: [-6, 6, -6, 6, 0], transition: { duration: 0.4, ease: "easeInOut" } as any };
        case 'arcane': return { x: [-10, 10, -10, 10, 0], filter: ['none', 'hue-rotate(45deg)', 'none'], transition: { duration: 0.4 } as any };
        case 'superhero': return { x: [-10, 10, -10, 10, 0], rotate: [0, -2, 2, 0], transition: { duration: 0.4 } as any };
        case 'liquid-glass': return { x: [-12, 12, -8, 8, -4, 4, 0], skewX: [0, -10, 10, 0], filter: ['brightness(1)', 'brightness(0.7)', 'brightness(1)'], transition: { duration: 0.5, ease: "easeInOut" } as any };
        case 'minimal': return { x: [-4, 4, -3, 3, 0], transition: { duration: 0.3 } as any };
        case 'modern':
        default: return { x: [-10, 10, -8, 8, -6, 6, 0], transition: { duration: 0.5, ease: "easeInOut" } as any };
      }
    } else if (isCorrect) {
      switch (theme.visualStyle) {
        case 'ultimate': return { scale: [1, 1.15, 0.9, 1.05, 1], rotate: [0, 5, -5, 0], filter: [`drop-shadow(0 0 15px ${accentGlow})`, 'none'], transition: { duration: 0.6, ease: "backOut" } as any };
        case 'brutalist': return { scale: [1, 1.1, 0.95, 1], rotate: [0, -2, 2, 0], transition: { duration: 0.4, ease: "circOut" } as any };
        case 'game-minecraft': return { y: [0, -15, 0, -8, 0], transition: { duration: 0.5, ease: "easeOut" } as any };
        case 'tadc': return { scale: [1, 1.15, 0.85, 1], rotate: [0, 5, -5, 0], y: [0, -5, 5, 0], transition: { duration: 0.5, ease: "easeInOut" } as any };
        case 'adventure-time': return { scale: [1, 1.2, 0.9, 1], rotate: [0, -3, 3, 0], transition: { duration: 0.5, ease: "backOut" } as any };
        case 'duck': return { y: [0, -15, 8, 0], scale: [1, 1.1, 1], transition: { duration: 0.5 } as any };
        case 'undertale': return { scale: [1, 1.05, 1], filter: [`drop-shadow(0 0 15px ${accentGlow})`, 'none'], transition: { duration: 0.6 } as any };
        case 'saidi': return { scale: [1, 1.05, 1], y: [0, -4, 0], transition: { duration: 0.5, ease: "easeOut" } as any };
        case 'arcane': return { scale: [1, 1.1, 1], filter: [`drop-shadow(0 0 20px ${accentGlow})`, 'none'], transition: { duration: 0.5, ease: "easeOut" } as any };
        case 'superhero': return { scale: [1, 1.15, 1], y: [0, -8, 0], transition: { duration: 0.4, ease: "easeOut" } as any };
        case 'liquid-glass': return { scale: [1, 1.12, 0.95, 1.05, 1], rotate: [0, -3, 3, 0], filter: ['brightness(1)', 'brightness(1.8)', 'brightness(1)'], transition: { duration: 0.6, ease: "circOut" } as any };
        case 'minimal': return { scale: [1, 1.02, 1], transition: { duration: 0.3 } as any };
        case 'modern':
        default: return { scale: [1, 1.08, 1], transition: { duration: 0.5, ease: "easeOut" } as any };
      }
    }
    return { x: 0, scale: 1, y: 0, rotate: 0 };
  };

  const getFlashAnimation = () => {
    if (feedbackStatus === 'none' || !showNotification || reviewMode) return null;

    const baseTransition = { duration: 0.5, ease: "easeOut" };

    if (feedbackStatus === 'correct') {
      switch (theme.visualStyle) {
        case 'ultimate': return { animate: { opacity: [0, 0.8, 0], scale: [1, 1.05, 1], backgroundColor: '#00ffff' }, transition: { duration: 0.6, ease: "backOut" } };
        case 'brutalist': return { animate: { opacity: [0, 0.8, 0], scale: [1, 1.02, 1], backgroundColor: '#10b981' }, transition: { duration: 0.3, ease: "linear" } };
        case 'game-minecraft': return { animate: { opacity: [0, 0.4, 0], backgroundColor: '#34d399' }, transition: { duration: 0.4, ease: "linear" } };
        case 'tadc': return { animate: { opacity: [0, 0.6, 0], scale: [1, 1.1, 1], rotate: [0, 2, -2, 0], backgroundColor: '#34d399' }, transition: { duration: 0.5, ease: "easeInOut" } };
        case 'adventure-time': return { animate: { opacity: [0, 0.5, 0], scale: [1, 1.1, 1], backgroundColor: '#32CD32' }, transition: { duration: 0.5, ease: "backOut" } };
        case 'duck': return { animate: { opacity: [0, 0.5, 0], scale: [1, 1.05, 1], backgroundColor: '#fbbf24' }, transition: { duration: 0.4 } };
        case 'undertale': return { animate: { opacity: [0, 0.3, 0], backgroundColor: '#10b981' }, transition: { duration: 0.6 } as any };
        case 'saidi': return { animate: { opacity: [0, 0.4, 0], backgroundColor: '#fcd34d' }, transition: { duration: 0.5 } as any };
        case 'minimal': return { animate: { opacity: [0, 0.2, 0], backgroundColor: '#34d399' }, transition: { duration: 0.3 } as any };
        case 'modern':
          return { animate: { opacity: [0, 0.3, 0], scale: [1, 1.05, 1], backgroundColor: '#10b981' }, transition: { duration: 0.6, ease: "easeOut" } } as any;
        default: return { animate: { opacity: [0, 0.5, 0], scale: [1, 1.05, 1], backgroundColor: '#34d399' }, transition: baseTransition };
      }
    } else {
      switch (theme.visualStyle) {
        case 'ultimate': return { animate: { opacity: [0, 0.8, 0], scale: [1, 0.95, 1], backgroundColor: '#ff00ff' }, transition: { duration: 0.6, ease: "easeInOut" } };
        case 'brutalist': return { animate: { opacity: [0, 0.8, 0], x: [-10, 10, -10, 10, 0], backgroundColor: '#ef4444' }, transition: { duration: 0.4, ease: "linear" } };
        case 'game-minecraft': return { animate: { opacity: [0, 0.5, 0], backgroundColor: '#ef4444' }, transition: { duration: 0.4, ease: "linear" } };
        case 'tadc': return { animate: { opacity: [0, 0.7, 0], scale: [1, 0.95, 1], rotate: [0, -5, 5, 0], backgroundColor: '#ef4444' }, transition: { duration: 0.5, ease: "easeInOut" } };
        case 'adventure-time': return { animate: { opacity: [0, 0.6, 0], x: [-5, 5, -5, 5, 0], backgroundColor: '#FF0000' }, transition: { duration: 0.4, ease: "easeInOut" } };
        case 'duck': return { animate: { opacity: [0, 0.5, 0], backgroundColor: '#ef4444' }, transition: { duration: 0.4 } };
        case 'undertale': return { animate: { opacity: [0, 0.6, 0], backgroundColor: '#ef4444' }, transition: { duration: 0.2, repeat: 2 } as any };
        case 'saidi': return { animate: { opacity: [0, 0.4, 0], backgroundColor: '#991b1b' }, transition: { duration: 0.4 } as any };
        case 'minimal': return { animate: { opacity: [0, 0.2, 0], backgroundColor: '#ef4444' }, transition: { duration: 0.3 } as any };
        case 'modern':
          return { animate: { opacity: [0, 0.3, 0], x: [-5, 5, -5, 5, 0], backgroundColor: '#f43f5e' }, transition: { duration: 0.5 } } as any;
        default: return { animate: { opacity: [0, 0.5, 0], backgroundColor: '#f87171' }, transition: baseTransition };
      }
    }
  };

  const flashAnim = getFlashAnimation();
  const cardAnim = getCardAnimation();

  const examProgressCount = Object.values(state.answers || {}).filter((a: any) => typeof a === 'string' && a.trim() !== '').length;
  const progress = (examProgressCount / questions.length) * 100;

  const syncLiveParticipants = roomData?.participants?.filter((p: any) => !p.finished) || [];
  const syncTotalLiveCount = Math.max(1, syncLiveParticipants.length);
  const syncAnsweredCount = syncLiveParticipants.filter((p: any) => !!roomData?.answers?.[p.participantId]?.[currentQuestion?.id]).length;
  const syncAnswerProgress = isSynchronizedMode ? (syncAnsweredCount / syncTotalLiveCount) * 100 : 0;

  return (
    <div className={`max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-4 flex flex-col lg:flex-row gap-4 lg:gap-8 relative group/undertale`}>
      {/* Sidebar Question Map */}
      <AnimatePresence mode="wait">
        {showMap && !isSynchronizedMode && (
            <QuestionMap 
              questions={questions}
              currentIdx={state.currentQuestionIndex}
              answers={state.answers}
              onSelect={goToQuestion}
              onClose={() => setShowMap(false)}
              showResults={settings.instantFeedback || reviewMode}
              questionTimes={state.questionTimes}
              timeLimitType={settings.timeLimitType}
              flags={state.flags}
              essayFeedback={state.essayFeedback}
              wrongPartSelections={state.wrongPartSelections}
              theme={theme}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange || (() => {})}
            />
        )}
      </AnimatePresence>

      <div className="flex-1 space-y-4 sm:space-y-8">
        {(theme.visualStyle as any) === 'hollow-knight' ? (
            <HollowKnightExamUI 
              currentQuestionIndex={state.currentQuestionIndex}
              totalQuestions={questions.length}
              progress={progress}
              timeRemaining={displayTime}
              accent={theme.accentColor}
              onShowMap={() => setShowMap(true)}
            />
          ) : (
            <div className="sticky top-0 z-50 space-y-2 sm:space-y-4 pt-2 sm:pt-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm -mx-2 sm:-mx-4 px-2 sm:px-4 group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!backdrop-blur-none group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!backdrop-blur-none transition-all duration-300">
              <div className={`flex flex-col xs:flex-row items-stretch xs:items-center justify-between p-2 sm:p-4 md:p-5 rounded-2xl sm:rounded-[2rem] shadow-xl border gap-2 sm:gap-6 group-[.visual-liquid-glass]/liquid-glass:liquid-glass-progress group-[.visual-fluid]/fluid:fluid-progress-panel ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/20 dark:border-slate-800/50'} group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none`}>
                <div className="flex items-center justify-between xs:justify-start gap-2 sm:gap-4">
                  {!isSynchronizedMode && (
                  <button
                    onClick={() => setShowMap(true)}
                    className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all border-b-4 active:translate-y-0.5 active:border-b-0 no-webgl ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border-slate-200 dark:border-slate-700'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!border-b-0`}
                  >
                    <Menu className="w-4 h-4 sm:w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  )}
                  <div className="flex flex-col">
                    <p className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : 'text-slate-400 dark:text-slate-500'} group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}>Question</p>
                    <p className={`text-sm sm:text-lg md:text-xl font-black italic leading-tight ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : 'text-slate-900 dark:text-white'} group-[.visual-liquid-glass]/liquid-glass:!text-white`}>{state.currentQuestionIndex + 1} <span className={`${theme.visualStyle === 'virus' ? 'opacity-30' : 'text-slate-300 dark:text-slate-700'} mx-0.5 group-[.visual-liquid-glass]/liquid-glass:!text-white/30`}>/</span> {questions.length}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center min-w-0 px-2 sm:px-4">
                  {(theme.visualStyle as any) === 'hollow-knight' ? (
                    <HollowKnightVessels timeRemaining={displayTime} timeLimitValue={settings.timeLimitType === 'per-question' ? settings.timeLimitValue : settings.timeLimitValue} accent={theme.accentColor} />
                  ) : (
                    <MinecraftHearts timeRemaining={displayTime} timeLimitValue={settings.timeLimitType === 'per-question' ? settings.timeLimitValue : settings.timeLimitValue} />
                  )}
                  <div className={`exam-progress-container w-full h-2 sm:h-4 rounded-full overflow-hidden p-0.5 shadow-inner relative mt-1 max-w-md group-[.visual-liquid-glass]/liquid-glass:liquid-glass-progress-container group-[.visual-fluid]/fluid:fluid-progress-container ${theme.visualStyle === 'virus' ? 'bg-black/40 border border-white/10' : 'bg-slate-100 dark:bg-slate-800'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-none`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 60, damping: 15 }}
                      className={`exam-progress-fill h-full rounded-full relative overflow-hidden group-[.visual-liquid-glass]/liquid-glass:liquid-glass-progress-fill group-[.visual-fluid]/fluid:fluid-progress-fill ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).progress : 'bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]'} group-[.visual-liquid-glass]/liquid-glass:!bg-gradient-to-r group-[.visual-liquid-glass]/liquid-glass:!from-white/80 group-[.visual-liquid-glass]/liquid-glass:!to-white/40 group-[.visual-liquid-glass]/liquid-glass:!shadow-[0_0_15px_rgba(255,255,255,0.6)] group-[.visual-fluid]/fluid:!bg-gradient-to-r group-[.visual-fluid]/fluid:!from-white group-[.visual-fluid]/fluid:!to-white/50`}
                    >
                      <motion.div
                        key={progress}
                        initial={{ x: '-100%', opacity: 0.8 }}
                        animate={{ x: '200%', opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 skew-x-12"
                      />
                      {theme.visualStyle === 'virus' && (
                        <>
                          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.1)_5px,rgba(0,0,0,0.1)_10px)] pointer-events-none" />
                          <div className="absolute inset-y-0 right-0 w-2 bg-white/30 blur-sm animate-pulse" />
                        </>
                      )}
                    </motion.div>
                  </div>
                  {!isSynchronizedMode ? (
                    <p className={`text-center text-[7px] sm:text-[9px] font-black uppercase mt-1 tracking-[0.15em] ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).interactiveText : 'text-slate-400 dark:text-slate-500'} group-[.visual-liquid-glass]/liquid-glass:!text-white/40`}>{Math.round(progress)}%</p>
                  ) : (
                    <div className="w-full max-w-md mt-1 mb-1">
                      <div className="flex items-center justify-between px-2 mb-0.5">
                        <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Live Answers</span>
                        <span className="text-[8px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400">{syncAnsweredCount} / {syncLiveParticipants.length} Answered</span>
                      </div>
                      <div className="w-full h-1.5 sm:h-2 rounded-full overflow-hidden p-0.5 shadow-inner relative bg-indigo-100 dark:bg-slate-800">
                        <motion.div
                          animate={{ width: `${syncAnswerProgress}%` }}
                          transition={{ type: "spring", stiffness: 60, damping: 15 }}
                          className="h-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] relative overflow-hidden"
                        >
                          <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                          />
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between xs:justify-end gap-2 sm:gap-4">
                  {settings.timeLimitType !== 'none' && !reviewMode && (
                    <div className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl font-black italic text-xs sm:text-base md:text-lg flex items-center gap-1.5 sm:gap-2 border-b-4 transition-colors ${
                      displayTime < 10 && displayTime > 0 ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse' : 
                      displayTime === 0 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
                      (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).bg} ${getArcaneStyles(theme.accentColor).text} ${getArcaneStyles(theme.accentColor).border.split(' ')[0]}` : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800')
                    } group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!border-b`}>
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      {formatTime(displayTime)}
                    </div>
                  )}
                  {reviewMode && (
                    <div className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl font-black italic text-[8px] sm:text-xs md:text-sm flex items-center gap-1.5 sm:gap-2 border-b-4 ${theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).bg} ${getArcaneStyles(theme.accentColor).text} ${getArcaneStyles(theme.accentColor).border.split(' ')[0]}` : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'} group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!border-b`}>
                      REVIEW
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

      {/* Question Card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            layout
            variants={{
              initial: (dir: number) => ({ opacity: 0, scale: 0.96, x: dir * 40 }),
              animate: { opacity: 1, scale: 1, x: 0 },
              exit: (dir: number) => ({ opacity: 0, scale: 0.96, x: dir * -40 })
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ 
              duration: 0.4, 
              ease: [0.23, 1, 0.32, 1], // Custom cubic-bezier for smoother feel
              opacity: { duration: 0.25 },
              scale: { duration: 0.4 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (isSynchronizedMode) return;
              const swipeThreshold = 50;
              if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
                if (info.offset.x < -swipeThreshold) {
                  nextQuestion();
                } else if (info.offset.x > swipeThreshold) {
                  prevQuestion();
                }
              }
            }}
            className="w-full"
          >
          <ScreenShake active={isShakeActive}>
            <motion.div
              layout
              animate={cardAnim.animate}
              transition={cardAnim.transition}
              className={`rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 md:p-10 lg:p-12 shadow-2xl border-4 space-y-6 sm:space-y-10 relative overflow-hidden transition-all duration-500 question-card group-[.visual-tadc]/tadc:animate-tadc-glitch group-[.visual-arcane]/arcane:chaos-element-slow hk-card group-[.visual-liquid-glass]/liquid-glass:liquid-glass-card group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!shadow-none ${
                theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card :
                theme.visualStyle === 'duck' 
                  ? feedbackStatus === 'correct' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 shadow-[0_0_40px_rgba(255,215,0,0.4)]' :
                    feedbackStatus === 'incorrect' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 shadow-[0_0_40px_rgba(0,191,255,0.4)]' :
                    'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                : theme.visualStyle === 'liquid-glass'
                  ? feedbackStatus === 'correct' ? 'border-emerald-500/50 shadow-emerald-500/20' :
                    feedbackStatus === 'incorrect' ? 'border-rose-500/50 shadow-rose-500/20' :
                    'border-white/20'
                  : (!showNotification || feedbackStatus === 'none') 
                    ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-card)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:shadow-[0_0_40px_rgba(0,0,0,0.9),inset_0_0_15px_rgba(0,0,0,0.5)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)]' :
                  feedbackStatus === 'correct' ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-emerald-500/20' :
                  feedbackStatus === 'incorrect' ? 'bg-white dark:bg-slate-900 border-rose-500 shadow-rose-500/20' :
                  'bg-white dark:bg-slate-900 border-amber-500 shadow-amber-500/20'
              }`}
            >
              {theme.visualStyle === 'liquid-glass' && <div className="liquid-glass-card-gloss z-[1] absolute inset-0 pointer-events-none" />}
              {/* Theme-specific Overlay */}
              {theme.visualStyle === 'virus' && (
                <div className={`absolute inset-0 pointer-events-none z-0 ${getArcaneStyles(theme.accentColor).overlay}`} />
              )}
              {/* Theme-specific Feedback Effects */}
              <FeedbackEffects 
                status={feedbackStatus === 'correct' ? 'correct' : feedbackStatus === 'incorrect' ? 'incorrect' : 'none'} 
                theme={theme.visualStyle} 
                accent={theme.accentColor} 
              />

              {/* Answer Feedback Notification Badge */}
              <FeedbackNotification 
                status={feedbackStatus as any} 
                theme={theme.visualStyle} 
                accent={theme.accentColor} 
                show={showNotification && feedbackStatus !== 'none' && !reviewMode} 
              />

              {/* Duck Theme Specific Card Feedback Decoration */}
              {theme.visualStyle === 'duck' && feedbackStatus !== 'none' && (
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -bottom-4 -right-4 opacity-20 pointer-events-none"
                >
                  <Bird className={`w-32 h-32 ${feedbackStatus === 'correct' ? 'text-yellow-500' : 'text-blue-500'}`} />
                </motion.div>
              )}

          {/* Flash Effect Overlay */}
          <AnimatePresence>
            {flashAnim && (
              <motion.div
                key={`flash-${currentQuestion.id}-${feedbackStatus}`}
                initial={{ opacity: 0 }}
                animate={flashAnim.animate}
                exit={{ opacity: 0 }}
                transition={flashAnim.transition}
                className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay"
              />
            )}
          </AnimatePresence>

          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-bl-[4rem] sm:rounded-bl-[5rem] -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 opacity-50" />
          
          <div className="space-y-4 sm:space-y-6 relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest border ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800'} ${theme.visualStyle === 'liquid-glass' ? 'text-white' : ''}`}>
                  Q{state.currentQuestionIndex + 1}
                </div>
                {theme.visualStyle === 'hollow-knight' && (
                  <div className="ml-2">
                    <HollowKnightHeader 
                      score={Object.values(state.answers).length} 
                      total={questions.length} 
                      accent={theme.accentColor} 
                    />
                  </div>
                )}
                <div className="relative">
                  <button
                    onMouseDown={handleFlagPress}
                    onMouseUp={handleFlagRelease}
                    onMouseLeave={handleFlagRelease}
                    onTouchStart={handleFlagPress}
                    onTouchEnd={handleFlagRelease}
                    onClick={handleFlagClick}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${
                      state.flags?.[currentQuestion.id]?.isFlagged 
                        ? (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).accent} ${getArcaneStyles(theme.accentColor).accentText} border-transparent` : getFlagColor(state.flags[currentQuestion.id].percentage))
                        : (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 border-transparent')
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" fill={state.flags?.[currentQuestion.id]?.isFlagged ? "currentColor" : "none"} />
                    {state.flags?.[currentQuestion.id]?.percentage !== undefined && (
                      <span className="text-[10px] font-black">{state.flags[currentQuestion.id].percentage}%</span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showFlagSlider && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 w-48 flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Confidence</span>
                          <button onClick={() => setShowFlagSlider(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                            <X className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          </button>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          step="25"
                          value={isNaN(state.flags?.[currentQuestion.id]?.percentage as number) ? 50 : (state.flags?.[currentQuestion.id]?.percentage ?? 50)}
                          onChange={(e) => setFlagPercentage(parseInt(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500">
                          <span className="text-rose-500">0%</span>
                          <span className="text-amber-500">50%</span>
                          <span className="text-emerald-500">100%</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {(reviewMode || feedbackVisible) && onSaveToBank && (
                  <button
                    onClick={() => onSaveToBank(currentQuestion)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-b-[3px] ${
                      isSavedToBank?.(currentQuestion.id)
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-100 dark:hover:border-rose-800 group/save'
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                    }`}
                  >
                    {isSavedToBank?.(currentQuestion.id) ? (
                      <>
                        <Check className="w-3 h-3 group-hover/save:hidden" />
                        <Trash2 className="w-3 h-3 hidden group-hover/save:block" />
                        <span className="group-hover/save:hidden">Saved</span>
                        <span className="hidden group-hover/save:block">Remove</span>
                      </>
                    ) : (
                      <>
                        <MapIcon className="w-3 h-3" />
                        Save
                      </>
                    )}
                  </button>
                )}
                <AnimatePresence>
                  {feedbackVisible && currentQuestion.explanation && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setShowExplanation(!showExplanation)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-b-[3px] shadow-sm ${
                        showExplanation
                          ? theme.visualStyle === 'liquid-glass'
                            ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                            : (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : 'bg-indigo-600 text-white border-indigo-800')
                          : theme.visualStyle === 'liquid-glass'
                            ? 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                            : (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).bg} ${getArcaneStyles(theme.accentColor).text} ${getArcaneStyles(theme.accentColor).border.split(' ')[0]}` : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50')
                      }`}
                    >
                      <Info className="w-3 h-3" />
                      {theme.visualStyle === 'saidi' ? 'افهم الاصول' : 'Explanation'}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          <div className="relative">
            {currentQuestion.imageUrl && currentQuestion.type !== 'locate_on_image' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mb-8 rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800"
              >
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question reference" 
                  className="w-full max-h-[400px] object-contain"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            )}
            {currentQuestion.badge && (
              <motion.div 
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: currentQuestion.badge.toLowerCase().includes('sticker') ? -5 : 0 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 mb-6 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                  currentQuestion.badge.toLowerCase().includes('sticker')
                    ? theme.visualStyle === 'virus'
                      ? `${getArcaneStyles(theme.accentColor).accent} ${getArcaneStyles(theme.accentColor).accentText} border-2 border-white/40 rotate-[-5deg] ${getArcaneStyles(theme.accentColor).glow} scale-110 ml-2`
                      : theme.visualStyle === 'liquid-glass'
                        ? 'bg-white/20 text-white border-2 border-white/40 rotate-[-5deg] shadow-[0_0_20px_rgba(255,255,255,0.4)] backdrop-blur-md scale-110 ml-2'
                        : 'bg-white text-indigo-600 border-2 border-indigo-600 rotate-[-5deg] shadow-[4px_4px_0_var(--color-indigo-600)] scale-110 ml-2'
                    : theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).bg} ${getArcaneStyles(theme.accentColor).text}` : theme.visualStyle === 'liquid-glass' ? 'bg-white/10 text-white border border-white/20 backdrop-blur-sm' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
                }`}
              >
                {currentQuestion.badge.toLowerCase().includes('sticker') ? (
                  <Zap className={`w-3.5 h-3.5 fill-current ${theme.visualStyle === 'virus' ? 'animate-pulse' : ''}`} />
                ) : (
                  <Star className={`w-3.5 h-3.5 fill-current ${theme.visualStyle === 'virus' ? 'animate-pulse' : ''}`} />
                )}
                {currentQuestion.badge}
              </motion.div>
            )}
            {currentQuestion.type !== 'fill_in_blanks' && (
              <h3 className={`font-black tracking-tight text-slate-900 dark:text-white leading-tight ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).interactiveText : (theme.visualStyle === 'arcane' ? getArcaneStyles(theme.accentColor).interactiveText : '')} ${theme.visualStyle === 'liquid-glass' ? 'text-white glass-text' : ''} text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl`}>
                {currentQuestion.type === 'true_false' && state.answers[currentQuestion.id] === 'False' && !feedbackVisible ? (
                  <div className="space-y-4">
                    <div className={`flex flex-wrap gap-x-2 gap-y-1 ${ (theme.visualStyle === 'virus' || theme.visualStyle === 'arcane') ? getArcaneStyles(theme.accentColor).markdown : ''}`}>
                      <ReactMarkdown
                        components={clickableWordsComponents as any}
                        remarkPlugins={REMARK_PLUGINS}
                        rehypePlugins={REHYPE_PLUGINS}
                      >
                        {currentQuestion.question}
                      </ReactMarkdown>
                    </div>
                    <motion.p 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit border ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800'}`}
                    >
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      Identify the incorrect part
                    </motion.p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbackVisible ? (
                      <div className={`leading-relaxed max-w-none ${ (theme.visualStyle === 'virus' || theme.visualStyle === 'arcane') ? getArcaneStyles(theme.accentColor).markdown : ''} ${theme.visualStyle === 'liquid-glass' ? 'text-white liquid-glass-text-shadow' : ''}`}>
                      <div className={theme.visualStyle === 'liquid-glass' ? '' : ''}>
                        {
                          <ReactMarkdown 
                              remarkPlugins={REMARK_PLUGINS} 
                              rehypePlugins={REHYPE_PLUGINS}
                              components={markdownComponents}
                            >
                              {currentQuestion.question}
                            </ReactMarkdown>
                        }
                        </div>
                      </div>
                    ) : (
                      currentQuestion.type === 'mcq' && currentQuestion.question.includes('___') ? (
                        <div className={`flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-3 sm:gap-y-4`}>
                          {currentQuestion.question.split('___').map((part, i, arr) => (
                            <React.Fragment key={i}>
                              <span className={theme.visualStyle === 'liquid-glass' ? '' : ''}>
                                <AnimatedText theme={theme} isGlitchActive={state.activeOffensivePowers.includes('glitch')}>{part}</AnimatedText>
                              </span>
                              {i < arr.length - 1 && (
                                <motion.span 
                                  animate={state.answers[currentQuestion.id] ? { scale: [1, 1.05, 1] } : {}}
                                  transition={{ duration: 0.4 }}
                                  className={`min-w-[80px] sm:min-w-[120px] px-2 py-1 sm:px-4 sm:py-2 border-b-4 rounded-xl text-center font-black transition-all shadow-sm text-xs sm:text-base ${
                                    state.answers[currentQuestion.id] 
                                      ? (theme.visualStyle === 'liquid-glass' ? 'bg-white/40 border-white/60 text-white shadow-[0_0_20px_rgba(255,255,255,0.5)] group-[.visual-liquid-glass]/liquid-glass:!border-b' : 'bg-indigo-600 text-white border-indigo-800') 
                                      : (theme.visualStyle === 'liquid-glass' ? 'bg-white/10 border-white/20 text-white/40 border-dashed group-[.visual-liquid-glass]/liquid-glass:!border-b' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:border-dashed')
                                  }`}
                                >
                                  {state.answers[currentQuestion.id] ? (
                                    <GlitchText text={state.answers[currentQuestion.id]} active={state.activeOffensivePowers.includes('glitch')} />
                                  ) : '..........'}
                                </motion.span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      ) : (
                        <div className={`prose prose-lg sm:prose-xl max-w-none dark:prose-invert ${ (theme.visualStyle === 'virus' || theme.visualStyle === 'arcane') ? getArcaneStyles(theme.accentColor).markdown : ''}`}>
                          <ReactMarkdown 
                            remarkPlugins={REMARK_PLUGINS} 
                            rehypePlugins={REHYPE_PLUGINS}
                            components={markdownComponents}
                          >
                            {currentQuestion.question}
                          </ReactMarkdown>
                        </div>
                      )
                    )}
                    {feedbackVisible && currentQuestion.type === 'true_false' && currentQuestion.correctAnswer === 'False' && currentQuestion.wrongPart && (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 flex items-center gap-2 sm:gap-3 shadow-sm ${
                          state.wrongPartSelections?.[currentQuestion.id] === currentQuestion.wrongPart
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                            : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400'
                        }`}
                      >
                        <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-inner ${
                          state.wrongPartSelections?.[currentQuestion.id] === currentQuestion.wrongPart
                            ? 'bg-emerald-100 dark:bg-emerald-900/40'
                            : 'bg-rose-100 dark:bg-rose-900/40'
                        }`}>
                          {state.wrongPartSelections?.[currentQuestion.id] === currentQuestion.wrongPart ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        </div>
                        <div>
                          <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">Wrong Part Identified</p>
                          <p className="text-xs sm:text-sm font-black">
                            {state.wrongPartSelections?.[currentQuestion.id] || 'None selected'} 
                            {state.wrongPartSelections?.[currentQuestion.id] !== currentQuestion.wrongPart && (
                              <span className="ml-2 opacity-60 font-bold">(Correct: {currentQuestion.wrongPart})</span>
                            )}
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {state.powerEffects.isAbsolutelySmartActive && !feedbackVisible && currentQuestion.type === 'true_false' && currentQuestion.correctAnswer === 'False' && currentQuestion.wrongPart && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl sm:rounded-2xl flex items-center gap-3 shadow-sm"
                      >
                        <Brain className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-yellow-700 dark:text-yellow-400">Smart Hint</p>
                          <p className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200">The incorrect part is: <span className="text-indigo-600 dark:text-indigo-400">"{currentQuestion.wrongPart}"</span></p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </h3>
            )}
            
            <AnimatePresence>
              {state.powerEffects.isHintActive && (currentQuestion.keywords || currentQuestion.explanation) && !feedbackVisible && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mt-6 p-5 bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-sm border-2 border-amber-200 dark:border-amber-800 rounded-[2rem] flex items-start gap-4 shadow-lg shadow-amber-500/10 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Info className="w-12 h-12 text-amber-500" />
                  </div>
                  <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-lg shadow-amber-500/30 relative z-10">
                    <Info className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">Hint Master Revealed</p>
                    <p className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-100 leading-relaxed italic">
                      {currentQuestion.keywords?.length 
                        ? `Focus on these keywords: ${currentQuestion.keywords.join(', ')}` 
                        : currentQuestion.explanation?.slice(0, 150) + '...'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>

          <div className="space-y-4 relative z-10">
            {(currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false' || currentQuestion.type === 'multi_select') ? (
              <div className="space-y-4">
                <div className={`grid ${theme.visualStyle === 'liquid-glass' ? 'gap-3 sm:gap-4' : 'gap-4 sm:gap-6 md:gap-6'} grid-cols-1 md:grid-cols-2`}>
                  {displayOptions.map((option, idx) => {
                     const isSelected = currentQuestion.type === 'multi_select'
                       ? (state.answers[currentQuestion.id] || '').split('|').includes(option)
                       : state.answers[currentQuestion.id] === option;
                     const isCorrect = currentQuestion.type === 'multi_select'
                       ? (currentQuestion.correctAnswers || []).includes(option)
                       : option === currentQuestion.correctAnswer;
                     const showResult = feedbackVisible && (isSelected || isCorrect);
                     const isPeeked = peekedAnswer?.questionId === currentQuestion.id && peekedAnswer?.answer === option;

                     const isFiftyFiftyHidden = state.powerEffects.isFiftyFiftyActive && 
                                              !isCorrect && 
                                              currentQuestion.options?.indexOf(option) !== undefined &&
                                              (currentQuestion.options.filter(o => o !== currentQuestion.correctAnswer).slice(0, 2).includes(option));

                     if (isFiftyFiftyHidden) return null;

                     return (
                      <motion.button
                        key={idx}
                        whileHover={!feedbackVisible ? { scale: 1.01, y: -1 } : {}}
                        whileTap={!feedbackVisible ? { scale: 0.99 } : {}}
                        animate={state.activeOffensivePowers.includes('glitch') ? {
                          ...getOptionAnimation(isSelected, isCorrect, isPeeked),
                          x: [0, -2, 2, -1, 1, 0],
                          color: ['#ef4444', '#3b82f6', '#10b981', '#ef4444'],
                          borderColor: ['#ef4444', '#3b82f6', '#10b981', '#ef4444'],
                        } : getOptionAnimation(isSelected, isCorrect, isPeeked)}
                        transition={state.activeOffensivePowers.includes('glitch') ? {
                          x: { duration: 0.2, repeat: Infinity },
                          color: { duration: 0.5, repeat: Infinity },
                          borderColor: { duration: 0.5, repeat: Infinity }
                        } : { duration: 0.3, delay: idx * 0.05 }}
                        onClick={() => {
                          if (feedbackVisible) return;
                          if (currentQuestion.type === 'multi_select') {
                            const currentAnswers = (state.answers[currentQuestion.id] || '').split('|').filter(Boolean);
                            const newAnswers = currentAnswers.includes(option)
                              ? currentAnswers.filter(a => a !== option)
                              : [...currentAnswers, option];
                            handleAnswer(newAnswers.join('|'), false, undefined, true);
                          } else {
                            const isWrongPartNeeded = currentQuestion.type === 'true_false' && currentQuestion.correctAnswer === 'False' && !!currentQuestion.wrongPart;
                            if (isWrongPartNeeded && option === 'False') {
                              handleAnswer(option, false, undefined, true);
                            } else {
                              handleAnswer(option, false, undefined, true);
                            }
                          }
                        }}
                        disabled={feedbackVisible || isTimedOut}
                        className={`relative ${
                          feedbackVisible
                            ? theme.visualStyle === 'liquid-glass'
                              ? `liquid-glass-item p-4 sm:p-5 md:p-6 !rounded-[1.8rem] text-left font-black text-sm sm:text-base md:text-lg transition-all ${isCorrect ? 'is-correct' : isSelected ? 'is-incorrect' : 'is-dimmed'}`
                              : theme.visualStyle === 'modern'
                                ? isCorrect
                                  ? 'bg-emerald-500 dark:bg-emerald-600 text-white shadow-[0_10px_30px_rgba(16,185,129,0.4)] p-4 sm:p-5 md:p-6 rounded-[1.5rem] text-left font-black text-sm sm:text-base md:text-lg transition-all border-2 border-emerald-400/50 scale-[1.02] z-10'
                                  : isSelected
                                    ? 'bg-rose-500 dark:bg-rose-600 text-white shadow-[0_10px_30px_rgba(244,63,94,0.4)] p-4 sm:p-5 md:p-6 rounded-[1.5rem] text-left font-black text-sm sm:text-base md:text-lg transition-all border-2 border-rose-400/50'
                                    : 'opacity-40 grayscale-[0.5] p-4 sm:p-5 md:p-6 rounded-[1.5rem] text-left font-black text-sm sm:text-base md:text-lg transition-all border-2 border-transparent'
                                : theme.visualStyle === 'duck'
                                  ? isCorrect
                                    ? 'bg-[#00c853] text-white shadow-[0_4px_0_#008c3a] p-4 sm:p-5 md:p-6 rounded-[3rem] text-left font-black text-sm sm:text-base md:text-lg transition-all scale-[1.02] z-10'
                                    : isSelected
                                      ? 'bg-[#ff2052] text-white shadow-[0_4px_0_#bd002c] p-4 sm:p-5 md:p-6 rounded-[3rem] text-left font-black text-sm sm:text-base md:text-lg transition-all z-10'
                                      : 'bg-white/50 dark:bg-slate-800/50 text-slate-400 p-4 sm:p-5 md:p-6 rounded-[3rem] text-left font-black text-sm sm:text-base md:text-lg transition-all opacity-40 grayscale'
                                : theme.visualStyle === 'tadc'
                                  ? isCorrect
                                    ? theme.accentColor === 'tadc-kinger'
                                      ? 'bg-purple-600 text-white border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all scale-[1.05] z-10 before:content-["♔"] before:absolute before:-top-4 before:-left-2 before:text-3xl before:text-purple-300 before:opacity-50 before:rotate-[-20deg]'
                                      : 'bg-blue-600 text-white border-2 border-red-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all scale-[1.05] z-10 after:absolute after:inset-0 after:bg-[radial-gradient(circle,white_10%,transparent_10%)] after:bg-[length:20px_20px] after:opacity-10 overflow-hidden'
                                    : isSelected
                                      ? theme.accentColor === 'tadc-kinger'
                                        ? 'bg-purple-950 text-purple-200 border-2 border-purple-700 p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all opacity-80 overflow-hidden after:content-["BUG!"] after:absolute after:bottom-1 after:right-2 after:text-[10px] after:font-mono after:text-purple-600 after:animate-pulse'
                                        : 'bg-black text-red-600 border-2 border-red-900 p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all line-through decoration-white/50 before:content-["NON-CANON"] before:absolute before:-top-2 before:right-2 before:text-[8px] before:font-bold before:bg-red-600 before:text-white before:px-1 before:tracking-widest'
                                      : 'opacity-20 grayscale p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all'
                                : theme.visualStyle === 'brutalist'
                                  ? isCorrect
                                    ? 'bg-[#00ff00] text-black border-4 border-black shadow-[10px_10px_0_0_#000] p-4 sm:p-5 md:p-6 rounded-none text-left font-black text-sm sm:text-base md:text-lg transition-all scale-[1.05] z-10'
                                    : isSelected
                                      ? 'bg-[#ff00ff] text-black border-4 border-black shadow-[10px_10px_0_0_#000] p-4 sm:p-5 md:p-6 rounded-none text-left font-black text-sm sm:text-base md:text-lg transition-all'
                                      : 'bg-white text-slate-300 border-4 border-slate-200 p-4 sm:p-5 md:p-6 rounded-none text-left font-black text-sm sm:text-base md:text-lg transition-all opacity-40 grayscale'
                                : isCorrect
                                  ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all border-b-4 sm:border-b-6 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:font-serif group-[.visual-hollow-knight]/hollow-knight:border-2'
                                  : isSelected
                                    ? 'bg-rose-500/20 border-rose-500/50 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all border-b-4 sm:border-b-6 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:font-serif group-[.visual-hollow-knight]/hollow-knight:border-2'
                                    : 'opacity-40 grayscale-[0.5] p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all border-b-4 sm:border-b-6 group-[.visual-hollow-knight]/hollow-knight:hk-btn-primary group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:font-serif group-[.visual-hollow-knight]/hollow-knight:border-2'
                            : isSelected
                            ? (theme.visualStyle === 'virus' || theme.visualStyle === 'arcane' ? `group relative p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all border-b-4 sm:border-b-6 ${getArcaneStyles(theme.accentColor).accent} ${getArcaneStyles(theme.accentColor).accentText} ${getArcaneStyles(theme.accentColor).border.split(' ')[0]} shadow-[0_2px_0_rgba(0,0,0,0.5)] translate-y-1` : theme.visualStyle === 'liquid-glass' ? 'liquid-glass-item !bg-white/30 border-white/60 !rounded-[1.8rem] p-4 sm:p-5 md:p-6 text-left font-black text-white shadow-[0_20px_40px_rgba(255,255,255,0.2)] translate-y-1' : 'group relative p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all border-b-4 sm:border-b-6 bg-indigo-600 border-indigo-800 text-white shadow-[0_2px_0_var(--color-indigo-900)] translate-y-1 group-[.visual-hollow-knight]/hollow-knight:!bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:!text-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:!border-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:shadow-[0_0_20px_rgba(0,0,0,0.8)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:font-serif')
                            : isPeeked
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-800 text-amber-700 dark:text-amber-400 shadow-[0_4px_0_rgb(245,158,11)] p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all border-b-4 sm:border-b-6'
                            : (theme.visualStyle === 'virus' || theme.visualStyle === 'arcane' ? `group relative p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all border-b-4 sm:border-b-6 ${getArcaneStyles(theme.accentColor).bg} ${getArcaneStyles(theme.accentColor).text} ${getArcaneStyles(theme.accentColor).border.split(' ')[0]} ${getArcaneStyles(theme.accentColor).option || ''} shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:scale-[1.02]` : theme.visualStyle === 'liquid-glass' ? 'liquid-glass-item !rounded-[1.8rem] p-4 sm:p-5 md:p-6 text-left font-black text-white' : 'group relative p-4 sm:p-5 md:p-6 rounded-2xl text-left font-black text-sm sm:text-base md:text-lg transition-all border-b-4 sm:border-b-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 shadow-[0_4px_0_rgb(226,232,240)] dark:shadow-[0_4px_0_rgb(30,41,59)] group-[.visual-hollow-knight]/hollow-knight:hk-btn-primary group-[.visual-hollow-knight]/hollow-knight:shadow-[0_4px_0_#000]')
                        }`}
                      >
                        {state.powerEffects.isAbsolutelySmartActive && isCorrect && !feedbackVisible && (
                          <div className="absolute inset-0 ring-4 ring-yellow-400 border-yellow-500 shadow-[0_0_30px_rgba(251,191,36,0.6)] rounded-2xl z-20 pointer-events-none animate-pulse" />
                        )}
                        {state.powerEffects.isAbsolutelySmartActive && isCorrect && !feedbackVisible && (
                          <AbsolutelySmartEffect 
                            isAbsolutelySmartActive={true} 
                            correctAnswer={currentQuestion.correctAnswer || ''} 
                            currentOptions={displayOptions} 
                          />
                        )}
                        {/* Background highlight animation for correct/incorrect */}
                        <AnimatePresence>
                          {showResult && isCorrect && (
                            <motion.div
                              initial={{ scaleX: 0, opacity: 0 }}
                              animate={{ scaleX: 1, opacity: 0.15 }}
                              className={`absolute inset-0 origin-left ${
                                theme.visualStyle === 'tadc'
                                  ? theme.accentColor === 'tadc-kinger' ? 'bg-purple-500' : 'bg-blue-500'
                                  : 'bg-emerald-500'
                              }`}
                              transition={{ duration: 0.5, ease: "circOut" }}
                            />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.15 }}
                              className={`absolute inset-0 ${
                                theme.visualStyle === 'tadc'
                                  ? theme.accentColor === 'tadc-kinger' ? 'bg-purple-900' : 'bg-black'
                                  : 'bg-rose-500'
                              }`}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                          )}
                        </AnimatePresence>

                        <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                          <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-black transition-all ${
                            isSelected && !showResult ? 'bg-white/20 text-white' : 
                            isCorrect && showResult ? (
                              theme.visualStyle === 'tadc'
                                ? theme.accentColor === 'tadc-kinger' ? 'bg-purple-300 text-purple-900 shadow-sm' : 'bg-blue-300 text-blue-900 shadow-sm'
                                : 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 shadow-sm'
                            ) :
                            isSelected && showResult && !isCorrect ? (
                              theme.visualStyle === 'tadc'
                                ? theme.accentColor === 'tadc-kinger' ? 'bg-purple-900 text-purple-100 shadow-sm' : 'bg-red-900 text-red-100 shadow-sm'
                                : 'bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200 shadow-sm'
                            ) :
                            theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accent + ' ' + getArcaneStyles(theme.accentColor).accentText :
                            theme.visualStyle === 'liquid-glass' ? 'bg-white/10 text-white group-hover:bg-white/20' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:border group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:rounded-none'
                          }`}>
                            {currentQuestion.type === 'true_false' ? (
                              option === 'True' ? <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" /> : <XCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                            ) : currentQuestion.type === 'multi_select' ? (
                              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected || (showResult && isCorrect) ? 'border-current bg-transparent' : 'border-slate-400 dark:border-slate-500'}`}>
                                {(isSelected || (showResult && isCorrect)) && <Check className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={3} />}
                              </div>
                            ) : String.fromCharCode(65 + idx)}
                          </span>
                          <span className={`flex-1 leading-tight ${theme.visualStyle === 'liquid-glass' ? '' : ''}`}>
                            <GlitchText text={option} active={state.activeOffensivePowers.includes('glitch')} />
                          </span>
                        </div>
                        
                        <AnimatePresence>
                          {showResult && (
                            <motion.div 
                              initial={{ scale: 0, opacity: 0, rotate: -45 }}
                              animate={{ scale: 1, opacity: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.05 }}
                              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10"
                            >
                              {isCorrect ? (
                                <div className={theme.visualStyle === 'liquid-glass' 
                                  ? "bg-emerald-500 backdrop-blur-md rounded-full p-1.5 border border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.6)]" 
                                  : theme.visualStyle === 'tadc'
                                    ? theme.accentColor === 'tadc-kinger' ? 'bg-purple-500 rounded-full p-1 shadow-lg' : 'bg-blue-500 rounded-full p-1 shadow-lg'
                                    : theme.visualStyle === 'duck'
                                      ? "bg-white rounded-full p-0.5 shadow-md"
                                      : "bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-1"
                                }>
                                  <CheckCircle2 className={theme.visualStyle === 'liquid-glass' 
                                    ? "w-6 h-6 sm:w-9 sm:h-9 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                                    : theme.visualStyle === 'tadc' ? "w-5 h-5 sm:w-8 sm:h-8 text-white" : theme.visualStyle === 'duck' ? "w-6 h-6 sm:w-8 sm:h-8 text-[#00c853]" : "w-5 h-5 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400"
                                  } />
                                </div>
                              ) : (isSelected ? (
                                <div className={theme.visualStyle === 'liquid-glass'
                                  ? "bg-rose-500 backdrop-blur-md rounded-full p-1.5 border border-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.6)]"
                                  : theme.visualStyle === 'tadc'
                                    ? theme.accentColor === 'tadc-kinger' ? 'bg-purple-900 rounded-full p-1 shadow-lg' : 'bg-black rounded-full p-1 shadow-lg'
                                    : theme.visualStyle === 'duck'
                                      ? "bg-white rounded-full p-0.5 shadow-md"
                                      : "bg-rose-100 dark:bg-rose-900/30 rounded-full p-1"
                                }>
                                  <XCircle className={theme.visualStyle === 'liquid-glass'
                                    ? "w-6 h-6 sm:w-9 sm:h-9 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                    : theme.visualStyle === 'tadc' ? "w-5 h-5 sm:w-8 sm:h-8 text-red-500" : theme.visualStyle === 'duck' ? "w-6 h-6 sm:w-8 sm:h-8 text-[#ff2052]" : "w-5 h-5 sm:w-8 sm:h-8 text-rose-600 dark:text-rose-400"
                                  } />
                                </div>
                              ) : null)}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
                {currentQuestion.type === 'multi_select' && settings.instantFeedback && !feedbackVisible && !reviewMode && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleComplexSubmit()}
                      disabled={!state.answers[currentQuestion.id] || isLocked}
                      className={`px-6 py-3 text-white font-black uppercase text-xs rounded-2xl transition-all disabled:opacity-50 ${
                        theme.visualStyle === 'virus' 
                          ? `${getArcaneStyles(theme.accentColor).button} ${getArcaneStyles(theme.accentColor).glow}` 
                          : theme.visualStyle === 'liquid-glass'
                            ? 'bg-white/20 border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-white/30 hover:scale-[1.02]'
                            : 'bg-indigo-600 shadow-[0_4px_0_var(--color-indigo-900)] hover:shadow-[0_2px_0_var(--color-indigo-900)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:shadow-[0_0_10px_rgba(0,0,0,0.5)] group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:hover:shadow-[0_0_15px_var(--color-hk-hover)]'
                      }`}
                    >
                      Submit Answer
                    </button>
                  </div>
                )}
              </div>
            ) : currentQuestion.type === 'fill_in_blanks' ? (
              <div className="space-y-6">
                <div className={`text-lg font-medium leading-relaxed p-10 rounded-[2.5rem] border-2 shadow-2xl ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card : theme.visualStyle === 'liquid-glass' ? 'liquid-glass-card' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`} style={{ lineHeight: '3.5rem' }}>
                  {currentQuestion.question.split('__________').map((part, i, arr) => {
                    const currentAnswers = (state.answers[currentQuestion.id] || '').split('|');
                    const currentWord = currentAnswers[i] || '';
                    return (
                    <React.Fragment key={i}>
                      <span className={theme.visualStyle === 'liquid-glass' ? 'text-white' : ''}>{part}</span>
                      {i < arr.length - 1 && (
                        <motion.span 
                          layout
                          className={`relative inline-flex items-center justify-center min-w-[120px] h-10 px-4 mx-2 align-middle rounded-xl border-b-4 transition-all cursor-pointer overflow-hidden ${
                            feedbackVisible
                              ? theme.visualStyle === 'liquid-glass'
                                ? `liquid-glass-item ${currentWord === (currentQuestion.blanks || [])[i] ? 'is-correct' : 'is-incorrect'}`
                                : theme.visualStyle === 'modern'
? currentWord === (currentQuestion.blanks || [])[i]
  ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_5px_15px_rgba(16,185,129,0.4)] scale-[1.05] z-10 !border-b-0 border-2'
  : 'bg-rose-500 text-white border-rose-400 shadow-[0_5px_15px_rgba(244,63,94,0.4)] !border-b-0 border-2'
                                : theme.visualStyle === 'tadc'
? currentWord === (currentQuestion.blanks || [])[i]
  ? theme.accentColor === 'tadc-kinger'
    ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-[1.05] z-10 !border-b-4 border-2'
    : 'bg-blue-600 text-white border-red-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-[1.05] z-10 !border-b-4 border-2'
  : theme.accentColor === 'tadc-kinger'
    ? 'bg-purple-950 text-purple-400 border-purple-800 opacity-60 !border-b-4 border-2'
    : 'bg-black text-red-600 border-red-900 opacity-60 !border-b-4 border-2'
                                : theme.visualStyle === 'brutalist'
? currentWord === (currentQuestion.blanks || [])[i]
  ? 'bg-[#00ff00] text-black border-4 border-black shadow-[5px_5px_0_0_#000] scale-[1.05] z-10 !border-b-4'
  : 'bg-[#ff00ff] text-black border-4 border-black shadow-[5px_5px_0_0_#000] !border-b-4'
                                : currentWord === (currentQuestion.blanks || [])[i]
                                  ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                  : 'bg-rose-500/20 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                              : currentWord
                                ? (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).accent} ${getArcaneStyles(theme.accentColor).accentText} border-white/20` : theme.visualStyle === 'liquid-glass' ? 'bg-white/20 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.4)] shadow-inner' : 'bg-indigo-100 border-indigo-400 text-indigo-800 hover:bg-rose-100 hover:border-rose-400 hover:text-rose-800')
                                : (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).button} border-slate-700 border-dashed` : theme.visualStyle === 'liquid-glass' ? 'bg-white/5 border-white/20 border-dashed text-white/40 hover:bg-white/10' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 border-dashed hover:border-indigo-400')
                          }`}
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add(theme.visualStyle === 'virus' ? 'opacity-100' : 'border-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/30'); }}
                          onDragLeave={(e) => { e.currentTarget.classList.remove(theme.visualStyle === 'virus' ? 'opacity-100' : 'border-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/30'); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/30');
                            if (feedbackVisible || isLocked) return;
                            const word = e.dataTransfer.getData('text/plain');
                            if (word) {
                              const newAnswers = [...currentAnswers];
                              while (newAnswers.length < arr.length - 1) newAnswers.push('');
                              newAnswers[i] = word;
                              handleAnswer(newAnswers.join('|'), false);
                            }
                          }}
                          onClick={() => {
                            if (feedbackVisible || isLocked || !currentWord) return;
                            const newAnswers = [...currentAnswers];
                            newAnswers[i] = '';
                            handleAnswer(newAnswers.join('|'), false);
                          }}
                        >
                          <AnimatePresence mode="popLayout">
                            {currentWord ? (
                              <motion.span
                                key={currentWord}
                                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: -10 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="font-bold whitespace-nowrap"
                              >
                                <GlitchText text={currentWord} active={state.activeOffensivePowers.includes('glitch')} />
                              </motion.span>
                            ) : state.powerEffects.isAbsolutelySmartActive ? (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                className="text-yellow-600 dark:text-yellow-400 font-black text-xs animate-pulse"
                              >
                                {(currentQuestion.blanks || [])[i]}
                              </motion.span>
                            ) : (
                              <span key="empty" className="text-transparent">blank</span>
                            )}
                          </AnimatePresence>
                        </motion.span>
                      )}
                      {feedbackVisible && i < arr.length - 1 && currentWord !== (currentQuestion.blanks || [])[i] && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1 text-sm bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                          {(currentQuestion.blanks || [])[i]}
                        </span>
                      )}
                    </React.Fragment>
                  )})}
                </div>

                <div className={`flex flex-wrap gap-4 justify-center mt-8 p-8 rounded-[2.5rem] border-2 min-h-[6rem] shadow-xl ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card : theme.visualStyle === 'liquid-glass' ? 'liquid-glass-card' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:shadow-none'}`}>
                  {(currentQuestion.wordBank || []).map((word, wIdx) => {
                    const currentAnswers = (state.answers[currentQuestion.id] || '').split('|');
                    const usedCount = currentAnswers.filter(a => a === word).length;
                    const totalCount = (currentQuestion.wordBank || []).filter(w => w === word).length;
                    const isUsed = usedCount >= totalCount;
                    const isCorrectWord = (currentQuestion.blanks || []).includes(word);
                    const shouldHighlight = state.powerEffects.isAbsolutelySmartActive && isCorrectWord && !feedbackVisible;

                    if (isUsed && !feedbackVisible) return null;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={`${word}-${wIdx}`}
                      >
                        <div
                          draggable={!feedbackVisible && !isLocked}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', word);
                            e.currentTarget.classList.add('opacity-50', 'scale-95');
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.classList.remove('opacity-50', 'scale-95');
                          }}
                          onClick={() => {
                            if (feedbackVisible || isLocked) return;
                            const blanksCount = (currentQuestion.question.match(/__________/g) || []).length;
                            const newAnswers = [...currentAnswers];
                            while (newAnswers.length < blanksCount) newAnswers.push('');
                            const firstEmptyIdx = newAnswers.findIndex(a => !a);
                            if (firstEmptyIdx !== -1) {
                              newAnswers[firstEmptyIdx] = word;
                              handleAnswer(newAnswers.join('|'), false);
                            }
                          }}
                          className={`px-5 py-2.5 rounded-2xl border-2 transition-all font-black text-sm sm:text-base shadow-md ${
                            feedbackVisible || isLocked
                              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                              : shouldHighlight
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-500 text-yellow-700 dark:text-yellow-300 shadow-[0_4px_0_rgb(234,179,8)]'
                                : theme.visualStyle === 'virus'
                                  ? `${getArcaneStyles(theme.accentColor).button} cursor-grab active:cursor-grabbing hover:translate-y-[-2px]`
                                  : theme.visualStyle === 'liquid-glass'
                                    ? 'liquid-glass-btn border-white/20 cursor-grab'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:hover:border-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:hover:shadow-[0_0_15px_var(--color-hk-hover)]'
                          }`}
                        >
                          <GlitchText text={word} active={state.activeOffensivePowers.includes('glitch')} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                {settings.instantFeedback && !feedbackVisible && !reviewMode && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleComplexSubmit()}
                      disabled={((state.answers[currentQuestion.id] || '').split('|').filter(Boolean).length !== (currentQuestion.blanks || []).length) || isLocked}
                      className={`px-6 py-3 text-white font-black uppercase text-xs rounded-2xl transition-all disabled:opacity-50 ${
                        theme.visualStyle === 'virus' 
                          ? `${getArcaneStyles(theme.accentColor).button} ${getArcaneStyles(theme.accentColor).glow}` 
                          : theme.visualStyle === 'liquid-glass'
                            ? 'bg-white/20 border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-white/30 hover:scale-[1.02]'
                            : 'bg-indigo-600 shadow-[0_4px_0_var(--color-indigo-900)] hover:shadow-[0_2px_0_var(--color-indigo-900)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:shadow-[0_0_10px_rgba(0,0,0,0.5)] group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:hover:shadow-[0_0_15px_var(--color-hk-hover)]'
                      }`}
                    >
                      Submit Answer
                    </button>
                  </div>
                )}
              </div>
            ) : currentQuestion.type === 'matching' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className={`font-black uppercase text-[10px] tracking-[0.5em] ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : theme.visualStyle === 'liquid-glass' ? 'text-white/40' : 'text-slate-500'}`}>Items</h4>
                    {(currentQuestion.matchingPairs || []).map((pair, i) => {
                      const currentAnswers = (state.answers[currentQuestion.id] || '').split('|').filter(Boolean);
                      const currentMatch = currentAnswers.find(a => a.startsWith(`${pair.term}:`))?.split(':')[1] || '';
                      
                      return (
                        <div key={i} className={`flex flex-col gap-4 p-6 sm:p-8 rounded-[2.5rem] border-2 shadow-2xl ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card : theme.visualStyle === 'liquid-glass' ? 'liquid-glass-card' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:shadow-none'}`}>
                          <div className={`font-black text-lg ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : theme.visualStyle === 'liquid-glass' ? 'text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]' : 'text-slate-800 dark:text-slate-200 group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:font-serif'}`}>
                            <GlitchText text={pair.term} active={state.activeOffensivePowers.includes('glitch')} />
                          </div>
                          <div 
                            className={`min-h-[4rem] p-4 rounded-2xl border-2 transition-all flex items-center justify-center text-center text-sm font-black shadow-inner ${
                              feedbackVisible
                                ? theme.visualStyle === 'liquid-glass'
                                  ? `liquid-glass-item ${currentMatch === pair.definition ? 'is-correct' : 'is-incorrect'}`
                                  : theme.visualStyle === 'modern'
? currentMatch === pair.definition
  ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_5px_15px_rgba(16,185,129,0.4)] scale-[1.05] z-10 border-2'
  : 'bg-rose-500 text-white border-rose-400 shadow-[0_5px_15px_rgba(244,63,94,0.4)] border-2'
                                  : theme.visualStyle === 'tadc'
? currentMatch === pair.definition
  ? theme.accentColor === 'tadc-kinger'
    ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-[1.05] z-10 border-2'
    : 'bg-blue-600 text-white border-red-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-[1.05] z-10 border-2'
  : theme.accentColor === 'tadc-kinger'
    ? 'bg-purple-950 text-purple-400 border-purple-800 opacity-60 border-2'
    : 'bg-black text-red-600 border-red-900 opacity-60 border-2'
                                  : theme.visualStyle === 'brutalist'
? currentMatch === pair.definition
  ? 'bg-[#00ff00] text-black border-4 border-black shadow-[8px_8px_0_0_#000] scale-[1.05] z-10'
  : 'bg-[#ff00ff] text-black border-4 border-black shadow-[8px_8px_0_0_#000]'
                                  : currentMatch === pair.definition
                                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                    : 'bg-rose-500/20 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                                : state.powerEffects.isAbsolutelySmartActive && !currentMatch
                                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-500 text-yellow-700 dark:text-yellow-300 border-dashed animate-pulse ring-4 ring-yellow-400/50'
                                  : currentMatch
                                    ? theme.visualStyle === 'virus'
                                      ? `${getArcaneStyles(theme.accentColor).accent} ${getArcaneStyles(theme.accentColor).accentText} border-solid shadow-sm cursor-pointer hover:scale-[0.98]`
                                      : theme.visualStyle === 'liquid-glass'
                                        ? 'bg-white/20 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.4)] border-solid cursor-pointer'
                                        : 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 cursor-pointer hover:bg-rose-50 hover:border-rose-400 hover:text-rose-700 border-solid shadow-sm group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:hover:border-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:hover:text-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:border-2'
                                    : theme.visualStyle === 'virus'
                                      ? `${getArcaneStyles(theme.accentColor).button} border-dashed opacity-50`
                                      : theme.visualStyle === 'liquid-glass'
                                        ? 'bg-white/5 border-white/20 text-white/30 border-dashed'
                                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-400 border-dashed group-[.visual-hollow-knight]:bg-[var(--color-hk-card)] group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-card)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2'
                            }`}
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-400', 'bg-indigo-50/50'); }}
                            onDragLeave={(e) => { e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50/50'); }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50/50');
                              if (feedbackVisible || isLocked) return;
                              const definition = e.dataTransfer.getData('text/plain');
                              if (definition) {
                                // Remove any existing match for this term or this definition
                                let newAnswers = currentAnswers.filter(a => !a.startsWith(`${pair.term}:`) && !a.endsWith(`:${definition}`));
                                newAnswers.push(`${pair.term}:${definition}`);
                                handleAnswer(newAnswers.join('|'), false);
                              }
                            }}
                            onClick={() => {
                              // Allow clicking to remove a match
                              if (feedbackVisible || isLocked || !currentMatch) return;
                              let newAnswers = currentAnswers.filter(a => !a.startsWith(`${pair.term}:`));
                              handleAnswer(newAnswers.join('|'), false);
                            }}
                            title={currentMatch && !feedbackVisible && !isLocked ? "Click to remove" : ""}
                          >
                            {currentMatch ? (
                              <div className="flex items-center gap-2 font-medium">
                                <GlitchText text={currentMatch} active={state.activeOffensivePowers.includes('glitch')} />
                                {!feedbackVisible && !isLocked && <X className="w-4 h-4 opacity-50 hover:opacity-100" />}
                              </div>
                            ) : state.powerEffects.isAbsolutelySmartActive ? (
                              <div className="flex flex-col items-center gap-1">
                                <Brain className="w-4 h-4 text-yellow-600 animate-bounce" />
                                <span className="text-[10px] font-black text-yellow-700 dark:text-yellow-400 uppercase">Correct: {pair.definition}</span>
                              </div>
                            ) : 'Drop match here'}
                          </div>
                          {feedbackVisible && currentMatch !== pair.definition && (
                            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md mt-1">
                              Correct: {pair.definition}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-4">
                    <h4 className={`font-bold uppercase text-[10px] sm:text-xs tracking-widest ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : theme.visualStyle === 'liquid-glass' ? 'text-white/60' : 'text-slate-500'}`}>Matches</h4>
                    <div className="flex flex-col gap-4">
                      {[...(currentQuestion.matchingPairs || []).map(p => p.definition), ...(currentQuestion.matchingDistractors || [])]
                        .sort()
                        .map((def, i) => {
                          const currentAnswers = (state.answers[currentQuestion.id] || '').split('|').filter(Boolean);
                          const isUsed = currentAnswers.some(a => a.endsWith(`:${def}`));
                          
                          if (isUsed && !feedbackVisible) return null;
                          
                          return (
                            <motion.div
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              key={`${def}-${i}`}
                            >
                              <div
                                draggable={!feedbackVisible && !isLocked}
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', def);
                                  e.currentTarget.classList.add('opacity-50', 'scale-95');
                                }}
                                onDragEnd={(e) => {
                                  e.currentTarget.classList.remove('opacity-50', 'scale-95');
                                }}
                                className={`p-5 rounded-2xl font-black text-sm flex items-center gap-4 transition-all shadow-xl ${
                                  feedbackVisible || isLocked
                                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                                    : theme.visualStyle === 'virus'
                                      ? `${getArcaneStyles(theme.accentColor).button} cursor-grab active:cursor-grabbing hover:translate-x-1`
                                      : theme.visualStyle === 'liquid-glass'
                                        ? 'liquid-glass-btn border-white/20'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:hover:border-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:hover:shadow-[0_0_15px_var(--color-hk-hover)]'
                                }`}
                              >
                                {!feedbackVisible && !isLocked && <GripVertical className={`w-5 h-5 shrink-0 ${theme.visualStyle === 'liquid-glass' ? 'text-white/30' : 'text-slate-400'}`} />}
                                <GlitchText text={def} active={state.activeOffensivePowers.includes('glitch')} />
                              </div>
                            </motion.div>
                          );
                        })}
                        {/* Show a message if all definitions are used */}
                        {(state.answers[currentQuestion.id] || '').split('|').filter(Boolean).length === (currentQuestion.matchingPairs || []).length && (
                          <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-center text-sm font-medium">
                            All items matched!
                          </div>
                        )}
                    </div>
                  </div>
                </div>
                {settings.instantFeedback && !feedbackVisible && !reviewMode && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleComplexSubmit()}
                      disabled={((state.answers[currentQuestion.id] || '').split('|').filter(Boolean).length !== (currentQuestion.matchingPairs || []).length) || isLocked}
                      className={`px-6 py-3 text-white font-black uppercase text-xs rounded-2xl transition-all disabled:opacity-50 ${
                        theme.visualStyle === 'virus' 
                          ? `${getArcaneStyles(theme.accentColor).button} ${getArcaneStyles(theme.accentColor).glow}` 
                          : theme.visualStyle === 'liquid-glass'
                            ? 'bg-white/20 border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-white/30 hover:scale-[1.02]'
                            : 'bg-indigo-600 shadow-[0_4px_0_var(--color-indigo-900)] hover:shadow-[0_2px_0_var(--color-indigo-900)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:shadow-[0_0_10px_rgba(0,0,0,0.5)] group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:hover:shadow-[0_0_15px_var(--color-hk-hover)]'
                      }`}
                    >
                      Submit Answer
                    </button>
                  </div>
                )}
              </div>
            ) : currentQuestion.type === 'multi_essay' ? (
              <div className="space-y-6">
                {(currentQuestion.subQuestions || []).map((sq) => {
                  const storedValue = state.answers[currentQuestion.id] || '{}';
                  let parsedValues: Record<string, string> = {};
                  try {
                    parsedValues = JSON.parse(storedValue);
                  } catch(e) {}
                  const val = parsedValues[sq.id] || '';
                  
                  // Extract specific feedback if it exists
                  const fb = state.essayFeedback?.[currentQuestion.id]?.subFeedbacks?.[sq.id];

                  return (
                    <div key={sq.id} className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 first:border-0 first:pt-0">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                           <div className={`prose prose-sm xl:prose-base dark:prose-invert font-medium ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : theme.visualStyle === 'liquid-glass' ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                             <ReactMarkdown 
                               remarkPlugins={REMARK_PLUGINS} 
                               rehypePlugins={REHYPE_PLUGINS}
                               components={markdownComponents}
                             >
                               {sq.question}
                             </ReactMarkdown>
                           </div>
                        </div>
                      </div>

                      <div className="relative">
                          <textarea
                            value={val}
                            onChange={(e) => {
                              const newVals = { ...parsedValues, [sq.id]: e.target.value };
                              handleAnswer(JSON.stringify(newVals), false);
                            }}
                            disabled={feedbackVisible || isLocked}
                            placeholder={isLocked ? "Your answer is locked!" : isTimedOut ? "Time's up!" : feedbackVisible ? "Answer locked" : "Type your answer here..."}
                            className={`w-full h-32 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-b-6 font-medium text-sm sm:text-base md:text-lg outline-none transition-all resize-y ${
                              theme.visualStyle === 'virus' 
                                ? `${getArcaneStyles(theme.accentColor).card} focus:${getArcaneStyles(theme.accentColor).accent}` 
                                : theme.visualStyle === 'liquid-glass'
                                  ? 'bg-white/10 border-white/20 focus:bg-white/20 focus:border-white/40 text-white placeholder-white/30'
                                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-200 dark:focus:border-indigo-800 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20'
                            } text-slate-900 dark:text-slate-100 ${feedbackVisible ? 'opacity-0' : 'opacity-100'}`}
                          />
                          {feedbackVisible && fb && (
                            <div className={`absolute inset-0 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-b-6 font-medium text-sm sm:text-base md:text-lg overflow-y-auto text-slate-900 dark:text-slate-100 ${
                              theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card : theme.visualStyle === 'liquid-glass' ? 'bg-white/10 border-white/20 backdrop-blur-xl' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                            }`}>
                              <HighlightedText 
                                text={val} 
                                usedTerms={fb.usedTerms || []} 
                                misspelledWords={fb.misspelledWords || []}
                              />
                            </div>
                          )}
                      </div>

                      <AnimatePresence>
                        {feedbackVisible && fb && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden space-y-4"
                          >
                            <div className={`p-4 rounded-3xl border-2 shadow-sm space-y-4 ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card : theme.visualStyle === 'liquid-glass' ? 'bg-white/5 border-white/20 backdrop-blur-xl' : 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900'}`}>
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : theme.visualStyle === 'liquid-glass' ? 'text-white/60' : 'text-indigo-400 dark:text-indigo-500'}`}>Grade</p>
                                    <h4 className={`text-xl font-black italic ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).interactiveText : theme.visualStyle === 'liquid-glass' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>{fb.grade}</h4>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : theme.visualStyle === 'liquid-glass' ? 'text-white/60' : 'text-indigo-400 dark:text-indigo-500'}`}>Score</p>
                                    <h4 className={`text-xl font-black italic ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).interactiveText : theme.visualStyle === 'liquid-glass' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>{fb.score}%</h4>
                                  </div>
                                </div>
                                <p className={`font-medium leading-relaxed p-3 rounded-xl border text-sm ${theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).button} opacity-90` : theme.visualStyle === 'liquid-glass' ? 'bg-white/10 border-white/20 text-white shadow-inner' : 'text-slate-600 dark:text-slate-400 bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-50 dark:border-indigo-900/30'}`}>
                                  {fb.feedback}
                                </p>
                                <div className={`p-4 rounded-xl border-l-4 mt-2 ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card : theme.visualStyle === 'liquid-glass' ? 'bg-white/5 border-white/20 border-l-white backdrop-blur-md' : 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500'}`}>
                                  <p className="text-[10px] font-black uppercase mb-1 tracking-widest">Suggested Content</p>
                                  <div className="prose prose-sm dark:prose-invert font-medium italic text-sm">
                                    <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS} components={markdownComponents}>{sq.correctAnswer || ''}</ReactMarkdown>
                                  </div>
                                </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                {settings.instantFeedback && !feedbackVisible && !reviewMode && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => handleComplexSubmit()}
                      disabled={isLocked}
                      className={`px-6 py-3 text-white font-black uppercase text-xs rounded-2xl transition-all disabled:opacity-50 ${
                        theme.visualStyle === 'virus' 
                          ? `${getArcaneStyles(theme.accentColor).button} ${getArcaneStyles(theme.accentColor).glow}` 
                          : theme.visualStyle === 'liquid-glass'
                            ? 'bg-white/20 border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-white/30 hover:scale-[1.02]'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
                      }`}
                    >
                      Submit for Grading
                    </button>
                  </div>
                )}
              </div>
            ) : currentQuestion.type === 'locate_on_image' ? (
              <div className="space-y-6">
                <div className={`relative w-full rounded-[2rem] overflow-hidden border-4 shadow-2xl group ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card : theme.visualStyle === 'liquid-glass' ? 'bg-white/5 border-white/20 backdrop-blur-xl' : 'bg-slate-100 dark:bg-slate-900 border-white dark:border-slate-800'}`}>
                  {currentQuestion.imageUrl && <img src={currentQuestion.imageUrl} className="w-full h-auto block select-none pointer-events-none" />}
                  
                  {/* Render existing targets */}
                  {(() => {
                    let selected: any[] = [];
                    try {
                      selected = JSON.parse(state.answers[currentQuestion.id] || '[]');
                    } catch (e) {}

                    return (
                      <>
                        {/* Render correct targets if feedback is visible or Absolutely Smart is active */}
                        <AnimatePresence>
                          {(feedbackVisible || state.powerEffects.isAbsolutelySmartActive) && (currentQuestion.imageTargets || []).map((target, idx) => (
                            <motion.div 
                              key={`correct-${target.id}`}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`absolute border-4 border-dashed rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 ${
                                feedbackVisible ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-yellow-400/60 bg-yellow-400/10 animate-pulse'
                              }`}
                              style={{ left: `${target.x}%`, top: `${target.y}%`, width: `${target.radius * 2}%`, height: `${target.radius * 2}%`, minWidth: '30px', minHeight: '30px' }}
                            >
                              <div className={`absolute -bottom-8 px-2 py-0.5 text-white text-[10px] font-black rounded-lg shadow-lg whitespace-nowrap ${
                                feedbackVisible ? 'bg-emerald-600' : 'bg-yellow-600'
                              }`}>
                                <GlitchText text={target.label} active={state.activeOffensivePowers.includes('glitch')} />
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {/* Render user selected points */}
                        {selected.map((sel, idx) => {
                          const target = (currentQuestion.imageTargets || []).find(t => t.id === sel.targetId);
                          const isCorrectPoint = target && Math.sqrt(Math.pow(sel.x - target.x, 2) + Math.pow(sel.y - target.y, 2)) <= target.radius;
                          
                          return (
                            <motion.div 
                              key={`sel-${idx}`}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              whileHover={{ scale: 1.1 }}
                              className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center shadow-xl z-20 transition-all ${
                                feedbackVisible 
                                  ? theme.visualStyle === 'liquid-glass'
                                    ? isCorrectPoint ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 is-correct' : 'bg-rose-500 text-white ring-4 ring-rose-500/30 is-incorrect'
                                    : theme.visualStyle === 'modern'
? isCorrectPoint ? 'bg-emerald-500 text-white ring-4 ring-emerald-400 scale-[1.2] shadow-[0_0_30px_rgba(16,185,129,0.5)] z-30' : 'bg-rose-500 text-white ring-4 ring-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                                    : theme.visualStyle === 'tadc'
? isCorrectPoint 
  ? theme.accentColor === 'tadc-kinger'
    ? 'bg-purple-600 text-white ring-4 ring-purple-400 scale-[1.2] shadow-[0_0_30px_rgba(168,85,247,0.6)] z-30'
    : 'bg-blue-600 text-white ring-4 ring-red-500 scale-[1.2] shadow-[0_0_30px_rgba(59,130,246,0.6)] z-30'
  : theme.accentColor === 'tadc-kinger'
    ? 'bg-purple-950 text-purple-400 ring-4 ring-purple-900 opacity-80'
    : 'bg-black text-red-600 ring-4 ring-red-900 opacity-80'
                                    : theme.visualStyle === 'brutalist'
? isCorrectPoint ? 'bg-[#00ff00] text-black border-4 border-black scale-[1.3] shadow-[10px_10px_0_0_#000] z-30' : 'bg-[#ff00ff] text-black border-4 border-black shadow-[10px_10px_0_0_#000]'
                                    : isCorrectPoint ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30' : 'bg-rose-500 text-white ring-4 ring-rose-500/30'
                                  : theme.visualStyle === 'virus'
                                    ? `${getArcaneStyles(theme.accentColor).accent} ${getArcaneStyles(theme.accentColor).accentText} cursor-pointer ring-4 ring-white/20 hover:scale-110`
                                    : theme.visualStyle === 'liquid-glass'
                                      ? 'bg-white/80 text-slate-900 cursor-pointer ring-4 ring-white/30 hover:scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                                      : 'bg-indigo-600 text-white cursor-pointer ring-4 ring-indigo-500/30 hover:bg-indigo-700'
                              }`}
                              style={{ left: `${sel.x}%`, top: `${sel.y}%` }}
                              onClick={(e) => {
                                if (isLocked) return;
                                e.stopPropagation();
                                const newSelected = selected.filter((_, i) => i !== idx);
                                handleAnswer(JSON.stringify(newSelected), false);
                              }}
                            >
                              <span className="text-xs font-black">{idx + 1}</span>
                              {!feedbackVisible && (
                                <motion.div 
                                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                  transition={{ repeat: Infinity, duration: 2, type: "tween" }}
                                  className="absolute inset-0 rounded-full bg-indigo-500 -z-10"
                                />
                              )}
                            </motion.div>
                          );
                        })}
                      </>
                    );
                  })()}

                  {/* Click area for adding points */}
                  {!isLocked && (
                    <div 
                      className="absolute inset-0 cursor-crosshair"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        
                        let selected: any[] = [];
                        try {
                          selected = JSON.parse(state.answers[currentQuestion.id] || '[]');
                        } catch (e) {}

                        const targets = currentQuestion.imageTargets || [];
                        if (selected.length < targets.length) {
                          const targetToPlace = targets[selected.length];
                          const newSelected = [...selected, { targetId: targetToPlace.id, x, y }];
                          handleAnswer(JSON.stringify(newSelected), false);
                        } else {
                          // If all placed, allow replacing the last one if clicked again
                          const newSelected = [...selected.slice(0, -1), { targetId: targets[targets.length-1].id, x, y }];
                          handleAnswer(JSON.stringify(newSelected), false);
                        }
                      }}
                    />
                  )}
                </div>

                {/* Instructions / Legend */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {(currentQuestion.imageTargets || []).map((target, idx) => {
                      let selected: any[] = [];
                      try {
                        selected = JSON.parse(state.answers[currentQuestion.id] || '[]');
                      } catch (e) {}
                      
                      const isPlaced = selected.length > idx;
                      const isCurrent = selected.length === idx;

                      return (
                        <motion.div 
                          key={`legend-${target.id}`}
                          whileHover={{ y: -2 }}
                          className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-3 transition-all shadow-sm ${
                            isPlaced 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-100 dark:border-emerald-800' 
                              : isCurrent && !isLocked
                                ? theme.visualStyle === 'virus'
                                  ? `${getArcaneStyles(theme.accentColor).accent} ${getArcaneStyles(theme.accentColor).accentText} border-2 border-white/40 shadow-lg`
                                  : theme.visualStyle === 'liquid-glass'
                                    ? 'bg-white/20 border-white/40 text-white shadow-lg shadow-white/20'
                                    : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                : theme.visualStyle === 'virus'
                                  ? `${getArcaneStyles(theme.accentColor).button} border-2 opacity-70`
                                  : theme.visualStyle === 'liquid-glass'
                                    ? 'bg-white/5 border border-white/10 text-white/50'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-slate-100 dark:border-slate-700'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                            isPlaced ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="uppercase tracking-wider">
                            <GlitchText text={target.label} active={state.activeOffensivePowers.includes('glitch')} />
                          </span>
                          {isPlaced && <Check className="w-3 h-3" />}
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center px-4">
                    <button
                      onClick={() => handleAnswer('[]', false)}
                      disabled={isLocked || !state.answers[currentQuestion.id] || state.answers[currentQuestion.id] === '[]'}
                      className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-0"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Pins
                    </button>

                    {settings.instantFeedback && !feedbackVisible && !reviewMode && (
                      <button
                        onClick={() => handleComplexSubmit()}
                        disabled={
                          (() => {
                            try {
                              return JSON.parse(state.answers[currentQuestion.id] || '[]').length !== (currentQuestion.imageTargets || []).length;
                            } catch (e) { return true; }
                          })() || isLocked
                        }
                        className={`px-8 py-3 text-white font-black uppercase text-xs rounded-2xl transition-all disabled:opacity-50 ${
                          theme.visualStyle === 'virus' 
                            ? `${getArcaneStyles(theme.accentColor).button} ${getArcaneStyles(theme.accentColor).glow}` 
                            : 'bg-indigo-600 shadow-[0_6px_0_var(--color-indigo-900)] hover:shadow-[0_3px_0_var(--color-indigo-900)] hover:translate-y-0.5 active:shadow-none active:translate-y-1'
                        }`}
                      >
                        Submit Answer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                    <textarea
                      value={state.answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswer(e.target.value, false)}
                      disabled={feedbackVisible || isLocked}
                      placeholder={isLocked ? "Your answer is locked!" : isTimedOut ? "Time's up!" : feedbackVisible ? "Answer locked" : "Type your answer here..."}
                      className={`w-full h-32 sm:h-48 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-b-6 font-medium text-sm sm:text-base md:text-lg outline-none transition-all resize-none ${
                        theme.visualStyle === 'virus' 
                          ? `${getArcaneStyles(theme.accentColor).card} focus:${getArcaneStyles(theme.accentColor).accent}` 
                          : theme.visualStyle === 'liquid-glass'
                            ? 'bg-white/10 border-white/20 focus:bg-white/20 focus:border-white/40 text-white placeholder-white/30'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-200 dark:focus:border-indigo-800 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:focus:bg-[var(--color-hk-card)]'
                      } text-slate-900 dark:text-slate-100 ${feedbackVisible ? 'opacity-0' : 'opacity-100'}`}
                      style={state.activeOffensivePowers.includes('glitch') ? { color: GLITCH_COLORS[Math.floor(Math.random() * GLITCH_COLORS.length)] } : {}}
                    />
                  {state.powerEffects.isAbsolutelySmartActive && !feedbackVisible && currentQuestion.keywords && currentQuestion.keywords.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-yellow-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700 dark:text-yellow-400">Key Terms to Include</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentQuestion.keywords.map((kw, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs font-bold border border-yellow-100 dark:border-yellow-900 text-slate-700 dark:text-slate-300">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {feedbackVisible && (
                    <div className={`absolute inset-0 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-b-6 font-medium text-sm sm:text-base md:text-lg overflow-y-auto text-slate-900 dark:text-slate-100 ${
                      theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card : theme.visualStyle === 'liquid-glass' ? 'bg-white/10 border-white/20 backdrop-blur-xl' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                    }`}>
                      <HighlightedText 
                        text={state.answers[currentQuestion.id] || ''} 
                        usedTerms={state.essayFeedback?.[currentQuestion.id]?.usedTerms || []} 
                        misspelledWords={state.essayFeedback?.[currentQuestion.id]?.misspelledWords || []}
                      />
                    </div>
                  )}
                </div>
                {settings.instantFeedback && !feedbackVisible && !reviewMode && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleComplexSubmit()}
                      disabled={!(state.answers[currentQuestion.id]?.trim()) || isLocked}
                      className={`px-6 py-3 text-white font-black uppercase text-xs rounded-2xl transition-all disabled:opacity-50 ${
                        theme.visualStyle === 'virus' 
                          ? `${getArcaneStyles(theme.accentColor).button} ${getArcaneStyles(theme.accentColor).glow}` 
                          : theme.visualStyle === 'liquid-glass'
                            ? 'bg-white/20 border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-white/30 hover:scale-[1.02]'
                            : 'bg-indigo-600 shadow-[0_4px_0_var(--color-indigo-900)] hover:shadow-[0_2px_0_var(--color-indigo-900)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)] group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)] group-[.visual-hollow-knight]/hollow-knight:border-2 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:shadow-[0_0_10px_rgba(0,0,0,0.5)] group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:hover:shadow-[0_0_15px_var(--color-hk-hover)]'
                      }`}
                    >
                      Submit for Grading
                    </button>
                  </div>
                )}
                <AnimatePresence>
                  {feedbackVisible && currentQuestion.type === 'essay' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="overflow-hidden space-y-4"
                    >
                      {state.essayFeedback?.[currentQuestion.id] && (
                        <div className={`p-6 rounded-3xl border-2 shadow-sm space-y-6 ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card : theme.visualStyle === 'liquid-glass' ? 'bg-white/5 border-white/20 backdrop-blur-xl' : 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900'}`}>
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className={`text-[10px] font-black uppercase tracking-widest ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : theme.visualStyle === 'liquid-glass' ? 'text-white/60' : 'text-indigo-400 dark:text-indigo-500'}`}>Essay Grade</p>
                              <h4 className={`text-2xl font-black italic ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).interactiveText : theme.visualStyle === 'liquid-glass' ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'text-indigo-600 dark:text-indigo-400'}`}>{state.essayFeedback[currentQuestion.id].grade}</h4>
                            </div>
                            <div className="text-right">
                              <p className={`text-[10px] font-black uppercase tracking-widest ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : theme.visualStyle === 'liquid-glass' ? 'text-white/60' : 'text-indigo-400 dark:text-indigo-500'}`}>Score</p>
                              <h4 className={`text-2xl font-black italic ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).interactiveText : theme.visualStyle === 'liquid-glass' ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'text-indigo-600 dark:text-indigo-400'}`}>{state.essayFeedback[currentQuestion.id].score}%</h4>
                            </div>
                          </div>
                          
                          <p className={`font-medium leading-relaxed p-4 rounded-2xl border ${theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).button} opacity-90` : theme.visualStyle === 'liquid-glass' ? 'bg-white/10 border-white/20 text-white shadow-inner' : 'text-slate-600 dark:text-slate-400 bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-50 dark:border-indigo-900/30'}`}>
                            {state.essayFeedback[currentQuestion.id].feedback}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Key Terms Used</p>
                              <div className="flex flex-wrap gap-2">
                                {state.essayFeedback[currentQuestion.id].usedTerms.map((term, i) => (
                                  <span key={i} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-100 dark:border-emerald-800">{term}</span>
                                ))}
                                {state.essayFeedback[currentQuestion.id].usedTerms.length === 0 && <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">None detected</span>}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Missing Concepts</p>
                              <div className="flex flex-wrap gap-2">
                                {state.essayFeedback[currentQuestion.id].missingTerms.map((term, i) => (
                                  <span key={i} className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-bold border border-rose-100 dark:border-rose-800">{term}</span>
                                ))}
                                {state.essayFeedback[currentQuestion.id].missingTerms.length === 0 && <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">None missing</span>}
                              </div>
                            </div>
                          </div>

                          {state.essayFeedback[currentQuestion.id].misspelledWords && state.essayFeedback[currentQuestion.id].misspelledWords.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Misspelled Words</p>
                              <div className="flex flex-wrap gap-2">
                                {state.essayFeedback[currentQuestion.id].misspelledWords.map((word, i) => (
                                  <span key={i} className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold border border-amber-100 dark:border-amber-800">{word}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-indigo-400" />
                              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{state.essayFeedback[currentQuestion.id].length} Characters</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${state.essayFeedback[currentQuestion.id].hasParagraphs ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
                              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{state.essayFeedback[currentQuestion.id].hasParagraphs ? 'Paragraphs Used' : 'No Paragraphs'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className={`p-6 rounded-2xl border-l-8 mt-2 ${
                        theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).card : theme.visualStyle === 'liquid-glass' ? 'bg-white/5 border-white/20 border-l-white backdrop-blur-md shadow-lg shadow-white/5' : 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500'
                      }`}>
                        <p className={`text-[10px] font-black uppercase mb-2 tracking-widest ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : theme.visualStyle === 'liquid-glass' ? 'text-white/60' : 'text-indigo-400 dark:text-indigo-500'}`}>Suggested Content</p>
                        <div className={`prose prose-sm dark:prose-invert font-medium italic ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).interactiveText : theme.visualStyle === 'liquid-glass' ? 'text-white' : 'text-indigo-900 dark:text-indigo-100'}`}>
                          <ReactMarkdown 
                            remarkPlugins={REMARK_PLUGINS} 
                            rehypePlugins={REHYPE_PLUGINS}
                            components={markdownComponents}
                          >
                            {currentQuestion.correctAnswer || ''}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showExplanation && currentQuestion.explanation && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-10 overflow-hidden"
              >
                {(theme.visualStyle as any) === 'hollow-knight' ? (
                  <div className="py-6">
                    <HollowKnightDialogue 
                      text={currentQuestion.explanation} 
                      active={true} 
                      accent={theme.accentColor}
                      onTermClick={(title, word) => setActiveTerm({ title, word })}
                    />
                  </div>
                ) : (
                  <div className={theme.visualStyle === 'liquid-glass' 
                    ? "liquid-glass-modal rounded-[3rem] p-1 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden group mb-8"
                    : `p-6 sm:p-8 rounded-[2rem] border space-y-3 ${theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).bg} ${getArcaneStyles(theme.accentColor).border.split(' ')[0]}` : 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30'}`
                  }>
                    {theme.visualStyle === 'liquid-glass' && (
                      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                        <Zap className="w-32 h-32 text-indigo-400 blur-[2px]" />
                      </div>
                    )}
                    
                    <div className={theme.visualStyle === 'liquid-glass' ? "relative z-10 bg-black/40 backdrop-blur-xl rounded-[2.8rem] p-8 space-y-6" : "space-y-3"}>
                      <div className={`flex items-center gap-3 ${
                        theme.visualStyle === 'liquid-glass' 
                          ? 'flex-col sm:flex-row sm:justify-start text-center sm:text-left' 
                          : ''
                      }`}>
                        <div className={theme.visualStyle === 'liquid-glass' 
                          ? "liquid-glass-item p-4 !rounded-2xl border border-white/20 shadow-inner group/info" 
                          : `flex items-center gap-2 ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : 'text-indigo-600 dark:text-indigo-400'}`
                        }>
                          <Info className={theme.visualStyle === 'liquid-glass' ? "w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "w-4 h-4"} />
                          {theme.visualStyle !== 'liquid-glass' && (
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Question Explanation</span>
                          )}
                        </div>
                        {theme.visualStyle === 'liquid-glass' && (
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 leading-none">The Insight</h4>
                            <h3 className="text-xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">Explanation</h3>
                          </div>
                        )}
                      </div>

                      <div className={theme.visualStyle === 'liquid-glass' 
                        ? "liquid-glass-item p-8 !rounded-[2.2rem] bg-white/5 border border-white/10 shadow-inner group/content" 
                        : `font-medium leading-relaxed prose prose-indigo dark:prose-invert max-w-none ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : 'text-slate-700 dark:text-slate-300'}`
                      }>
                        <div className={theme.visualStyle === 'liquid-glass' ? "prose prose-invert prose-p:text-white/90 prose-p:leading-relaxed prose-strong:text-white prose-strong:font-black prose-p:text-lg max-w-none text-center sm:text-left" : ""}>
                          <ReactMarkdown 
                            remarkPlugins={REMARK_PLUGINS} 
                            rehypePlugins={REHYPE_PLUGINS}
                            components={markdownComponents}
                          >
                            {currentQuestion.explanation}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {theme.visualStyle === 'liquid-glass' && (
                        <div className="flex justify-center pt-2">
                           <div className="w-12 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 sm:pt-6 relative z-10 gap-4">
            <div className={`flex items-center gap-4 w-full justify-between ${!isSynchronizedMode ? 'sm:w-auto sm:justify-start' : 'justify-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-2'}`}>
              {!isSynchronizedMode && (
                <button
                  onClick={prevQuestion}
                  disabled={state.currentQuestionIndex === 0}
                  className={`px-4 py-2.5 sm:px-8 sm:py-3.5 font-black uppercase text-[10px] sm:text-xs rounded-xl border-b-4 transition-all active:translate-y-0.5 active:border-b-0 hk-btn-primary ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  {theme.visualStyle === 'saidi' ? 'الي قبله' : 'Previous'}
                </button>
              )}

              {/* Power System Button */}
              {settings.powerSystemEnabled && !reviewMode && (
                <button
                  onClick={() => setShowPowerMenu(!showPowerMenu)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:px-8 sm:py-3.5 font-black uppercase text-[10px] sm:text-xs rounded-xl border-b-4 transition-all active:translate-y-0.5 active:border-b-0 relative overflow-hidden group ${
                    state.obtainedPowers.length > 0
                      ? (theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-orange-700 shadow-lg shadow-orange-500/20')
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                  } ${isSynchronizedMode ? 'w-full max-w-sm mx-auto' : ''}`}
                >
                  <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${state.obtainedPowers.length > 0 ? 'animate-pulse' : ''}`} />
                  Powers
                  {state.obtainedPowers.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-rose-500 text-white text-[8px] sm:text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-bounce">
                      {state.obtainedPowers.length}
                    </span>
                  )}
                </button>
              )}
            </div>
            
            {!isSynchronizedMode && (
              <button
                onClick={nextQuestion}
                disabled={reviewMode && state.currentQuestionIndex === questions.length - 1}
                className={`group w-full sm:w-auto relative px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 text-white font-black text-sm sm:text-base md:text-lg uppercase tracking-tight rounded-2xl sm:rounded-[1.5rem] shadow-[0_6px_0_var(--color-indigo-900)] hover:shadow-[0_3px_0_var(--color-indigo-900)] hover:translate-y-0.5 active:shadow-none active:translate-y-1.5 transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme.visualStyle === 'hollow-knight' 
                    ? (theme.accentColor === 'silksong-red' || theme.accentColor === 'silksong-gold' ? 'hk-btn-silksong' : 'hk-btn-primary') 
                    : theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : 'bg-indigo-600'
                }`}
                style={theme.customTheme ? { backgroundColor: theme.customTheme.buttonColor, fontFamily: 'var(--custom-font-family)' } : {}}
              >
                {state.currentQuestionIndex === questions.length - 1 && !reviewMode ? (theme.visualStyle === 'saidi' ? 'يلا بينا' : 'Submit Exam') : (theme.visualStyle === 'saidi' ? 'الي بعده' : 'Next Question')}
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </motion.div>
        </ScreenShake>
        </motion.div>
        </AnimatePresence>
      </div>

      {/* Power System UI */}
      {settings.powerSystemEnabled && (
        <>
          <PowerMenu 
            isOpen={showPowerMenu} 
            onClose={() => setShowPowerMenu(false)} 
            powers={state.obtainedPowers} 
            onUsePower={handleUsePower}
            theme={theme}
            currentQuestionType={currentQuestion?.type}
          />
          <OffensivePowersOverlay 
            activePowers={state.activeOffensivePowers} 
            onPowerEnd={(powerId) => {
              setState(prev => ({
                ...prev,
                activeOffensivePowers: prev.activeOffensivePowers.filter(id => id !== powerId),
                powerEffects: {
                  ...prev.powerEffects,
                  [powerId === 'glitch' ? 'isGlitchActive' : 
                   powerId === 'ink_splash' ? 'isInkSplashActive' :
                   powerId === 'mirror' ? 'isMirrorActive' :
                   powerId === 'fog' ? 'isFogActive' :
                   powerId === 'earthquake' ? 'isEarthquakeActive' :
                   powerId === 'static_noise' ? 'isStaticNoiseActive' :
                   powerId === 'upside_down' ? 'isUpsideDownActive' :
                   powerId === 'vibration' ? 'isVibrationActive' :
                   powerId === 'color_shift' ? 'isColorShiftActive' :
                   powerId === 'pixelate' ? 'isPixelateActive' :
                   powerId === 'blackout' ? 'isBlackoutActive' :
                   powerId === 'gravity' ? 'isGravityActive' :
                   powerId === 'thermal' ? 'isThermalActive' :
                   powerId === 'old_movie' ? 'isOldMovieActive' :
                   powerId === 'drunken' ? 'isDrunkenActive' :
                   powerId === 'frost' ? 'isFrostActive' :
                   powerId === 'scanner' ? 'isScannerActive' :
                   powerId === 'low_battery' ? 'isLowBatteryActive' :
                   powerId === 'juice' ? 'isJuiceActive' : '']: false
                }
              }));
            }}
            theme={theme}
            performanceMode={performanceMode}
          />
          <InteractivePowersOverlay
            activePowers={state.activeInteractivePowers}
            onPowerEnd={(powerId) => {
              setState(prev => ({
                ...prev,
                activeInteractivePowers: prev.activeInteractivePowers.filter(id => id !== powerId),
                powerEffects: {
                  ...prev.powerEffects,
                  [powerId === 'click_challenge' ? 'isClickChallengeActive' : 
                   powerId === 'circle_hunt' ? 'isCircleHuntActive' :
                   powerId === 'spin_wheel' ? 'isSpinWheelActive' :
                   powerId === 'bug_squasher' ? 'isBugSquasherActive' :
                   powerId === 'pattern_lock' ? 'isPatternLockActive' :
                   powerId === 'slider_unlock' ? 'isSliderUnlockActive' : '']: false
                }
              }));
            }}
            onGrantPower={(power) => {
              setState(prev => ({
                ...prev,
                obtainedPowers: [...prev.obtainedPowers, power]
              }));
              setLastObtainedPower(power);
            }}
            theme={theme}
            performanceMode={performanceMode}
            allowedPowerIds={settings.allowedPowerIds}
          />
          <AnimatePresence>
            {lastObtainedPower && (
              <PowerObtained 
                power={lastObtainedPower} 
                onClose={() => setLastObtainedPower(null)} 
                theme={theme}
              />
            )}
          </AnimatePresence>
          
          {/* Advantage Effects */}
          <TimeWarpEffect active={!!state.powerEffects.isTimeWarpActive} />
          <ShieldEffect active={!!state.powerEffects.isShieldActive} />
          <AutoCompleteEffect active={!!state.powerEffects.isAutoCompleteActive} />
          <ClarityEffect active={!!state.powerEffects.isClarityActive} />
        </>
      )}

      {/* Term Modal */}
      <AnimatePresence>
        {activeTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setActiveTerm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={theme.visualStyle === 'liquid-glass' 
                ? "liquid-glass-modal bg-white/10 backdrop-blur-2xl rounded-[3.5rem] p-1 shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/20 relative overflow-hidden group max-w-md w-full"
                : "bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-indigo-500 relative"
              }
              onClick={e => e.stopPropagation()}
            >
              {theme.visualStyle === 'liquid-glass' && (
                <>
                  <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                </>
              )}
              
              <div className={theme.visualStyle === 'liquid-glass' ? "relative z-10 bg-black/40 backdrop-blur-md rounded-[3.2rem] p-8 space-y-6 overflow-hidden" : "space-y-4"}>
                <button 
                  onClick={() => setActiveTerm(null)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-all z-20 ${
                    theme.visualStyle === 'liquid-glass' 
                      ? 'bg-white/10 hover:bg-white/20 border border-white/10 text-white' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className={`flex items-center gap-4 ${theme.visualStyle === 'liquid-glass' ? 'flex-col text-center' : ''}`}>
                  <div className={theme.visualStyle === 'liquid-glass' 
                    ? "liquid-glass-item p-5 bg-white/10 rounded-[2.2rem] border border-white/20 shadow-inner relative overflow-hidden group/icon" 
                    : "p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl"
                  }>
                    {theme.visualStyle === 'liquid-glass' && <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />}
                    <BookMarked className={theme.visualStyle === 'liquid-glass' ? "w-8 h-8 text-white relative z-10 drop-shadow-lg" : "w-6 h-6 text-indigo-600 dark:text-indigo-400"} />
                  </div>
                  <div>
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] leading-none ${theme.visualStyle === 'liquid-glass' ? 'text-white/50 mb-2' : 'text-indigo-500'}`}>Terminology</h4>
                    <h3 className={`font-black leading-tight mt-1 ${theme.visualStyle === 'liquid-glass' ? 'text-3xl text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]' : 'text-2xl italic text-slate-900 dark:text-white'}`}>{activeTerm.word}</h3>
                  </div>
                </div>

                <div className={theme.visualStyle === 'liquid-glass' 
                  ? "liquid-glass-item p-8 bg-white/5 rounded-[2.8rem] border border-white/10 shadow-inner relative group/content overflow-hidden" 
                  : "p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
                }>
                  {theme.visualStyle === 'liquid-glass' && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-30 group-hover/content:opacity-50 transition-opacity" />}
                  <p className={`font-medium leading-relaxed italic relative z-10 ${theme.visualStyle === 'liquid-glass' ? 'text-white/95 text-xl text-center drop-shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>
                    {activeTerm.title}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTerm(null)}
                  className={theme.visualStyle === 'liquid-glass' 
                    ? "liquid-glass-btn-primary w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all hover:bg-white/90"
                    : "w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                  }
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const Results = ({ 
  questions, 
  answers, 
  essayFeedback,
  wrongPartSelections,
  questionTimes,
  onRestart,
  onReview,
  onSaveExam,
  theme,
  settings,
  multiplayerSocket,
  multiplayerRoomId,
  onShareLink
}: { 
  questions: Question[], 
  answers: Record<string, string>,
  essayFeedback: Record<string, EssayFeedback>,
  wrongPartSelections?: Record<string, string>,
  questionTimes?: Record<string, number>,
  onRestart: () => void,
  onReview: () => void,
  onSaveExam: (name: string) => void,
  theme: AppTheme,
  settings: ExamSettings,
  multiplayerSocket?: Socket | null,
  multiplayerRoomId?: string | null,
  onShareLink?: () => void
}) => {
  const [roomData, setRoomData] = useState<any>(null);

  useEffect(() => {
    if (multiplayerSocket && multiplayerRoomId) {
      const handleRoomUpdate = (data: any) => {
        setRoomData(JSON.parse(JSON.stringify(data)));
      };
      multiplayerSocket.on('room_update', handleRoomUpdate);
      // Trigger a room update to get the latest stats
      multiplayerSocket.emit('join_room', { roomId: multiplayerRoomId, name: localStorage.getItem('participantName') || 'Player', avatar: localStorage.getItem('participantAvatar') || 'User', participantId: localStorage.getItem('participantId') || null }, () => {});

      return () => {
        multiplayerSocket.off('room_update', handleRoomUpdate);
      };
    }
  }, [multiplayerSocket, multiplayerRoomId]);

  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterEggGif, setEasterEggGif] = useState('');
  const [eggBorderColor, setEggBorderColor] = useState('border-indigo-600');
  const [isSaved, setIsSaved] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isShareable, setIsShareable] = useState(false);

  useEffect(() => {
    let active = true;
    const checkShareability = async () => {
      try {
        const shareCode = await encodeExamData(questions, settings, theme);
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareCode}`;
        if (active) {
          setIsShareable(shareUrl.length <= 2048);
        }
      } catch (err) {
        console.error("Failed to check shareability:", err);
        if (active) setIsShareable(false);
      }
    };
    checkShareability();
    return () => {
      active = false;
    };
  }, [questions, settings, theme]);

  const handleSave = () => {
    const defaultName = `Exam ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    let name: string | null = null;
    try {
      name = window.prompt('Enter a name for this exam:', defaultName);
    } catch (e) {
      console.warn("Prompt blocked or unavailable, using default name.");
      name = defaultName;
    }

    if (name !== null) {
      onSaveExam(name || defaultName);
      setIsSaved(true);
    }
  };

  const handleDownloadHtml = () => {
    const htmlContent = generateStandaloneExam(questions, theme, settings, false);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interactive-exam-offline-${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadOnlineHtml = () => {
    const htmlContent = generateStandaloneExam(questions, theme, settings, true);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interactive-exam-online-${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async (showAnswers: boolean = false, includeExplanations: boolean = false, photoPushBlocks: number = 1) => {
    try {
      const isResultsMode = !showAnswers; // If we're not just exporting a blank key, use results
      const doc = convertQuestionsToPdfDocument(
        questions, 
        `Exam Report - ${new Date().toLocaleDateString()}`, 
        theme, 
        showAnswers, 
        includeExplanations, 
        photoPushBlocks,
        isResultsMode ? answers : undefined,
        isResultsMode ? essayFeedback : undefined
      );
      const blob = await pdf(
        <ReactPdfOutput 
          documents={[doc]} 
          themeColor={theme.accentColor} 
          includeToc={false}
          includeCover={true}
          customTheme={theme.customTheme || (theme as any).customTheme}
          isExam={true}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Arcane-Exam-Report-${showAnswers ? 'Answered-' : ''}${new Date().getTime()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export PDF", e);
      alert("Failed to export PDF. Please try again.");
    }
  };

  const gifs67 = [
    'https://cdn3.emoji.gg/emojis/450289-67clash.gif',
    'https://cdn3.emoji.gg/emojis/426426-67.gif'
  ];

  const gifs0 = [
    'https://cdn3.emoji.gg/emojis/27577-clown-pepe.gif',
    'https://cdn3.emoji.gg/emojis/77240-skull-clown.png',
    'https://cdn3.emoji.gg/emojis/6093-peepogiggles.png',
    'https://cdn3.emoji.gg/emojis/3257_pepe_clownmeme.gif',
    'https://cdn3.emoji.gg/emojis/7538_clowning.gif'
  ];

  const gifs100 = [
    'https://cdn3.emoji.gg/emojis/948835-lethimcook.gif',
    'https://cdn3.emoji.gg/emojis/5009-strong-doge.png',
    'https://cdn3.emoji.gg/emojis/5187-sigmaface.gif',
    'https://cdn3.emoji.gg/emojis/3277-scarypatrick.png',
    'https://cdn3.emoji.gg/emojis/6392-gigachad.png',
    'https://cdn3.emoji.gg/emojis/5537_lil_swag.gif'
  ];

  const score = questions.reduce((acc, q) => {
    const isCorrect = (q.type === 'mcq' || q.type === 'true_false') 
      ? (q.type === 'true_false' && q.correctAnswer === 'False' && q.wrongPart)
        ? answers[q.id] === 'False' && wrongPartSelections?.[q.id] === q.wrongPart
        : answers[q.id] === q.correctAnswer
      : (essayFeedback[q.id]?.score ?? 0) >= 50;
    return isCorrect ? acc + 1 : acc;
  }, 0);

  const percentage = Math.round((score / questions.length) * 100);
  
  useEffect(() => {
    if (percentage === 67) {
      const randomGif = gifs67[Math.floor(Math.random() * gifs67.length)];
      setEasterEggGif(randomGif);
      setEggBorderColor('border-indigo-600');
      setShowEasterEgg(true);
      const timer = setTimeout(() => setShowEasterEgg(false), 7000);
      return () => clearTimeout(timer);
    } else if (percentage === 0) {
      const randomGif = gifs0[Math.floor(Math.random() * gifs0.length)];
      setEasterEggGif(randomGif);
      setEggBorderColor('border-red-500');
      setShowEasterEgg(true);
      const timer = setTimeout(() => setShowEasterEgg(false), 5000);
      return () => clearTimeout(timer);
    } else if (percentage === 100) {
      const randomGif = gifs100[Math.floor(Math.random() * gifs100.length)];
      setEasterEggGif(randomGif);
      setEggBorderColor('border-amber-500');
      setShowEasterEgg(true);
      const timer = setTimeout(() => setShowEasterEgg(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [percentage]);

  const getRank = () => {
    if (percentage >= 90) return { title: 'EXPERT', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    if (percentage >= 70) return { title: 'PROFICIENT', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' };
    if (percentage >= 50) return { title: 'COMPETENT', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    return { title: 'BEGINNER', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/50' };
  };

  const rank = getRank();

  return (
    <>
      <AnimatePresence>
        {showAnalysis && (
          <ExamAnalysisModal
            isOpen={showAnalysis}
            onClose={() => setShowAnalysis(false)}
            questions={questions}
            answers={answers}
            essayFeedback={essayFeedback}
            wrongPartSelections={wrongPartSelections}
            questionTimes={questionTimes}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {renderThemeUI(
        theme,
        { score, total: questions.length, percentage, rank },
        { 
          onReview, 
          onDownload: handleDownloadHtml, 
          onDownloadOnline: handleDownloadOnlineHtml, 
          onRestart, 
          onSave: handleSave, 
          isSaved, 
          onExportPdf: handleExportPdf,
          onAnalysis: () => setShowAnalysis(true),
          onShareLink: isShareable ? onShareLink : undefined
        },
        { show: showEasterEgg, gif: easterEggGif, borderColor: eggBorderColor }
      )}

      {roomData && (
        <div className="fixed top-1/2 right-4 -translate-y-1/2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-indigo-100 dark:border-indigo-900 overflow-hidden z-50">
          <div className="bg-indigo-600 text-white p-4 font-bold flex items-center justify-between">
            <span className="flex items-center gap-2"><Users className="w-5 h-5"/> Leaderboard</span>
            <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded">Room: {multiplayerRoomId}</span>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {roomData.participants
              .sort((a: any, b: any) => {
                // finished takes precedence, then score DESC, then time ASC
                if (a.finished && !b.finished) return -1;
                if (!a.finished && b.finished) return 1;
                if (b.score !== a.score) return b.score - a.score;
                return a.time - b.time;
              })
              .map((p: any, idx: number) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-8 h-8 rounded-full flex flex-col items-center justify-center font-bold shadow-inner ${!p.avatarBg1 ? (idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' : idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400') : 'text-white'}`}
                    style={p.avatarBg1 ? { backgroundImage: `linear-gradient(to bottom right, ${p.avatarBg1}, ${p.avatarBg2})` } : {}}
                  >
                    <AvatarIcon name={p.avatar || 'User'} className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.name} {p.id === multiplayerSocket?.id && '(You)'}</span>
                    <span className="text-xs text-slate-500">{p.finished ? 'Finished' : 'Playing...'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{p.score} pts</span>
                    {p.time > 0 && <span className="text-xs text-slate-500">{Math.round(p.time/1000)}s</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// --- Main App ---

type View = 'home' | 'parser' | 'settings' | 'exam' | 'results' | 'review' | 'exam-creator' | 'ready-exams' | 'saved-exams' | 'multiplayer-lobby' | 'multiplayer-parser' | 'multiplayer-settings' | 'uploader';

export default function App() {
  useEffect(() => {
    initSpellChecker();
  }, []);

  const [appMode, setAppMode] = useState<'exams' | 'pdfs' | 'presentations' | 'uploader'>(() => {
    return (localStorage.getItem('appMode') as 'exams' | 'pdfs' | 'presentations') || 'exams';
  });

  useEffect(() => {
    localStorage.setItem('appMode', appMode);
  }, [appMode]);

  const [pdfView, setPdfView] = useState<'home' | 'parser' | 'viewer' | 'augmenter' | 'augmented-viewer' | 'document-parser' | 'document-viewer'>('home');
  const [presentationView, setPresentationView] = useState<'home' | 'parser' | 'viewer' | 'mindmap' | 'blocks' | 'block-viewer'>('home');
  const [mindmapActiveState, setMindmapActiveState] = useState<'parser' | 'map'>('parser');
  const [pdfTargetFormat, setPdfTargetFormat] = useState<'pdf' | 'augment' | 'document'>('pdf');
  const [pdfDocuments, setPdfDocuments] = useState<PdfDocument[]>([]);
  const [pdfAugmentedDocument, setPdfAugmentedDocument] = useState<PdfAugmentedDocument | null>(null);
  const [documentData, setDocumentData] = useState<DocumentNode | null>(null);
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings | undefined>(undefined);
  const [pdfTheme, setPdfTheme] = useState<PdfTheme>(() => {
    return (localStorage.getItem('pdfTheme') as PdfTheme) || 'modern';
  });

  const [isPhotoModeEnabled, setIsPhotoModeEnabled] = useState(() => {
    return localStorage.getItem("pdfPhotoModeEnabled") === "true";
  });

  useEffect(() => {
    localStorage.setItem("pdfPhotoModeEnabled", isPhotoModeEnabled.toString());
  }, [isPhotoModeEnabled]);

  useEffect(() => {
    localStorage.setItem('pdfTheme', pdfTheme);
  }, [pdfTheme]);
  const [view, setView] = useState<View>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('room')) return 'multiplayer-lobby';
    }
    return 'home';
  });
  const [multiplayerSocket, setMultiplayerSocket] = useState<Socket | null>(null);
  const [multiplayerRoomId, setMultiplayerRoomId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('room') || null;
    }
    return null;
  });
  const [multiplayerMode, setMultiplayerMode] = useState<string | null>(null);
  const [syncQuestionIndex, setSyncQuestionIndex] = useState(0);
  const [syncIsTransitioning, setSyncIsTransitioning] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);

  useEffect(() => {
    const s = io();
    setMultiplayerSocket(s);

    s.on("room_update", (room) => {
      setRoomData(JSON.parse(JSON.stringify(room)));
      if (room.status === "finished") {
        setView("results");
      }
      if (room.mode === "synchronized") {
        setSyncQuestionIndex(room.currentQuestionIndex || 0);
        setSyncIsTransitioning(room.isTransitioning || false);
      }
    });

    s.on("next_question", (index) => {
      setSyncQuestionIndex(index);
      setSyncIsTransitioning(false);
    });

    s.on("power_used", ({ power, name, userId }) => {
      window.dispatchEvent(new CustomEvent('power_used', { detail: { power, name, userId } }));
    });

    return () => {
      s.disconnect();
    };
  }, []);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<ExamSettings>(() => {
    try {
      const saved = localStorage.getItem('last_exam_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          timeLimitType: 'none',
          timeLimitValue: 60,
          instantFeedback: true,
          essaysLast: false,
          imagesLast: false,
          randomizeQuestions: false,
          powerSystemEnabled: false,
          guaranteedPowerPerCorrect: false,
          ...parsed
        };
      }
    } catch (e) {}
    return {
      timeLimitType: 'none',
      timeLimitValue: 60,
      instantFeedback: true,
      essaysLast: false,
      imagesLast: false,
      randomizeQuestions: false,
      powerSystemEnabled: false,
      guaranteedPowerPerCorrect: false
    };
  });
  const [examResults, setExamResults] = useState<Record<string, string>>({});
  const [spentTimes, setSpentTimes] = useState<Record<string, number>>({});
  const [wrongPartSelections, setWrongPartSelections] = useState<Record<string, string>>({});
  const [essayFeedback, setEssayFeedback] = useState<Record<string, EssayFeedback>>({});

  const [questionBank, setQuestionBank] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('question_bank');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [examHistory, setExamHistory] = useState<ExamHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('exam_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('dark_mode');
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showPowerSettings, setShowPowerSettings] = useState(false);
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [showUICustomization, setShowUICustomization] = useState(false);
  const [showSoulEffect, setShowSoulEffect] = useState(false);
  const [showTermsBank, setShowTermsBank] = useState(false);
  const [showSavedPdfs, setShowSavedPdfs] = useState(false);
  const [showSavedAugmentations, setShowSavedAugmentations] = useState(false);
  const [showRpgShop, setShowRpgShop] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [termsBankMode, setTermsBankMode] = useState<'list' | 'flashcards' | 'grid'>('list');

  const [savedPdfs, setSavedPdfs] = useState<SavedPdf[]>(() => {
    try {
      const saved = localStorage.getItem('arcane_saved_pdfs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [savedAugmentations, setSavedAugmentations] = useState<SavedAugmentation[]>(() => {
    try {
      const saved = localStorage.getItem('arcane_saved_augmentations');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('arcane_saved_pdfs', JSON.stringify(savedPdfs));
    } catch (e) {}
  }, [savedPdfs]);

  useEffect(() => {
    try {
      localStorage.setItem('arcane_saved_augmentations', JSON.stringify(savedAugmentations));
    } catch (e) {}
  }, [savedAugmentations]);
  const [savedTerms, setSavedTerms] = useState<SavedTerm[]>(() => {
    try {
      const saved = localStorage.getItem('exam_saved_terms');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [savedExams, setSavedExams] = useState<SavedExam[]>(() => {
    try {
      const saved = localStorage.getItem('saved_exams');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [rpgProgression, setRpgProgression] = useState<RpgProgression>(() => {
    const defaultProgression: RpgProgression = {
      totalCoins: 0,
      stats: {
        maxHp: 100,
        attack: 10,
        defense: 5
      },
      unlockedUpgrades: {},
      inventory: [],
      equipped: {
        weapon: null,
        armor: null,
        accessory: null
      }
    };

    try {
      const saved = localStorage.getItem('rpg_progression');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultProgression,
          ...parsed,
          stats: { ...defaultProgression.stats, ...(parsed.stats || {}) },
          unlockedUpgrades: parsed.unlockedUpgrades || {},
          inventory: parsed.inventory || [],
          equipped: { ...defaultProgression.equipped, ...(parsed.equipped || {}) }
        };
      }
    } catch (e) {}
    return defaultProgression;
  });

  useEffect(() => {
    localStorage.setItem('rpg_progression', JSON.stringify(rpgProgression));
  }, [rpgProgression]);

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info', visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const handleOnUsePower = useCallback((power: Power) => {
    if (multiplayerSocket && multiplayerRoomId) {
      multiplayerSocket.emit('use_power', { 
        roomId: multiplayerRoomId, 
        power, 
        name: localStorage.getItem('participantName') || 'Player' 
      });
    } else {
      // In solo mode, trigger the power_used event locally so it affects the user
      window.dispatchEvent(new CustomEvent('power_used', { detail: { power, name: 'You', userId: 'local' } }));
    }
  }, [multiplayerSocket, multiplayerRoomId]);

  useEffect(() => {
    try {
      localStorage.setItem('exam_saved_terms', JSON.stringify(savedTerms));
    } catch (e) {}
  }, [savedTerms]);

  useEffect(() => {
    try {
      localStorage.setItem('saved_exams', JSON.stringify(savedExams));
    } catch (e) {}
  }, [savedExams]);

  const handleSaveExam = useCallback((name: string, questions: Question[]) => {
    if (!questions || questions.length === 0) {
      showToast("Cannot save an empty exam!", "error");
      return;
    }

    // Check for duplicates (same name and same questions)
    const isDuplicate = savedExams.some(exam => 
      exam.name === name && 
      exam.questions.length === questions.length &&
      JSON.stringify(exam.questions) === JSON.stringify(questions)
    );

    if (isDuplicate) {
      showToast("This exam is already saved!", "info");
      return;
    }

    const newExam: SavedExam = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      questions,
      date: Date.now()
    };
    setSavedExams(prev => [newExam, ...prev]);
    showToast("Exam saved successfully!", "success");
  }, [savedExams, showToast]);

  const handleDeleteSavedExam = (id: string) => {
    setSavedExams(prev => prev.filter(exam => exam.id !== id));
  };

  const handleRenameSavedExam = (id: string, newName: string) => {
    setSavedExams(prev => prev.map(exam => exam.id === id ? { ...exam, name: newName } : exam));
  };

  const handleSavePdf = useCallback((docs: PdfDocument[]) => {
    if (!docs || docs.length === 0) return;
    const defaultName = `PDF Package ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    const name = window.prompt("Enter a name for this PDF:", defaultName) || defaultName;
    const newPdf: SavedPdf = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      documents: docs,
      date: Date.now()
    };
    setSavedPdfs(prev => [newPdf, ...prev]);
    showToast("PDF saved to library!", "success");
  }, [showToast]);

  const handleSaveAugmentation = useCallback((doc: PdfAugmentedDocument) => {
    if (!doc) return;
    const defaultName = `Augmentation ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    const name = window.prompt("Enter a name for this augmentation:", defaultName) || defaultName;
    const newAug: SavedAugmentation = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      document: doc,
      date: Date.now()
    };
    setSavedAugmentations(prev => [newAug, ...prev]);
    showToast("Augmentation saved successfully!", "success");
  }, [showToast]);

  const handleCombinePdfs = useCallback((ids: string[], newName: string) => {
    const selected = savedPdfs.filter(pdf => ids.includes(pdf.id));
    if (selected.length === 0) return;
    const combinedDocs = selected.flatMap(s => s.documents);
    const newPdf: SavedPdf = {
      id: Math.random().toString(36).substring(2, 9),
      name: newName,
      documents: combinedDocs,
      date: Date.now()
    };
    setSavedPdfs(prev => [newPdf, ...prev]);
    showToast("PDFs combined successfully!", "success");
  }, [savedPdfs, showToast]);

  const handleCombineAugmentations = useCallback((ids: string[], newName: string) => {
    const selected = savedAugmentations.filter(aug => ids.includes(aug.id));
    if (selected.length === 0) return;
    const first = selected[0];
    const mergedAugmentations = selected.flatMap(s => s.document.augmentations);
    const newAug: SavedAugmentation = {
      id: Math.random().toString(36).substring(2, 9),
      name: newName,
      document: {
        ...first.document,
        augmentations: mergedAugmentations
      },
      date: Date.now()
    };
    setSavedAugmentations(prev => [newAug, ...prev]);
    showToast("Augmentations combined successfully!", "success");
  }, [savedAugmentations, showToast]);

  const handleDeleteSavedPdf = useCallback((id: string) => {
    setSavedPdfs(prev => prev.filter(p => p.id !== id));
    showToast("PDF deleted from library", "info");
  }, [showToast]);

  const handleRenameSavedPdf = useCallback((id: string, newName: string) => {
    setSavedPdfs(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
    showToast("PDF renamed successfully", "success");
  }, [showToast]);

  const handleDeleteSavedAugmentation = useCallback((id: string) => {
    setSavedAugmentations(prev => prev.filter(a => a.id !== id));
    showToast("Augmentation deleted", "info");
  }, [showToast]);

  const handleRenameSavedAugmentation = useCallback((id: string, newName: string) => {
    setSavedAugmentations(prev => prev.map(a => a.id === id ? { ...a, name: newName } : a));
    showToast("Augmentation renamed", "success");
  }, [showToast]);

  const handleSaveTerm = useCallback((term: { title: string, word: string }) => {
    if (savedTerms.some(t => t.word.toLowerCase() === term.word.toLowerCase())) return;
    
    const newTerm: SavedTerm = {
      id: Math.random().toString(36).substring(2, 9),
      word: term.word,
      definition: term.title,
      date: Date.now()
    };
    setSavedTerms(prev => [newTerm, ...prev]);
  }, [savedTerms]);

  const handleDeleteTerm = useCallback((id: string) => {
    setSavedTerms(prev => prev.filter(t => t.id !== id));
  }, []);

  const [uiCustomization, setUICustomization] = useState<UICustomization>(() => {
    try {
      const saved = localStorage.getItem('ui_customization');
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        enabled: true,
        uiSize: 1.0,
        customFontUrl: null,
        performanceMode: false,
        dynamicBackgroundEnabled: true,
        dynamicBackgroundIntensity: 1.0,
        borderRadius: 16,
        spacing: 1.0,
        blurEnabled: true,
        shadowsEnabled: true,
        textFontSize: 16,
        textFontWeight: 400,
        textLetterSpacing: 0,
        textLineHeight: 1.5,
        particleMaxConnections: 3,
        particleConnectionDistance: 150,
        particleMaxSize: 4,
        particleCount: 50,
        particleReduceLag: false,
        optimizationMode: true,
        fluidBorderThickness: 2,
        fluidAnimationSpeed: 1,
        fluidBlobCount: 3,
        liquidGlassNoise: 0,
        puddleSpeed: 3.0,
        puddlePower: 4.0,
        puddleDamping: 0.80,
        puddleHardness: 0.25,
        puddleSize: 0.03,
        ...parsed
      };
    } catch (e) {
      return {
        enabled: true,
        uiSize: 1.0,
        customFontUrl: null,
        performanceMode: false,
        dynamicBackgroundEnabled: true,
        dynamicBackgroundIntensity: 1.0,
        borderRadius: 16,
        spacing: 1.0,
        blurEnabled: true,
        shadowsEnabled: true,
        textFontSize: 16,
        textFontWeight: 400,
        textLetterSpacing: 0,
        textLineHeight: 1.5,
        particleMaxConnections: 3,
        particleConnectionDistance: 150,
        particleMaxSize: 4,
        particleCount: 50,
        particleReduceLag: false,
        optimizationMode: true,
        fluidBorderThickness: 2,
        fluidAnimationSpeed: 1,
        fluidBlobCount: 3,
        liquidGlassNoise: 0,
        puddleSpeed: 3.0,
        puddlePower: 4.0,
        puddleDamping: 0.80,
        puddleHardness: 0.25,
        puddleSize: 0.03
      };
    }
  });

  const [theme, setTheme] = useState<AppTheme>(() => {
    const defaultTheme: AppTheme = {
      visualStyle: 'modern',
      accentColor: 'indigo',
      textAnimationEnabled: false,
      textAnimationType: 'typewriter',
      textAnimationSpeed: 1.0,
      superheroAttackIndex: 0
    };
    try {
      const saved = localStorage.getItem('app_theme');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultTheme, ...parsed };
      }
      return defaultTheme;
    } catch (e) {
      return defaultTheme;
    }
  });

  const handleShareLink = useCallback(async () => {
    try {
      const shareCode = await encodeExamData(questions, settings, theme);
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareCode}`;
      copyToClipboard(shareUrl);
      showToast("Share link copied to clipboard! Share it with others to take this exact exam.", "success");
    } catch (err) {
      console.error("Failed to generate share link:", err);
      showToast("Failed to generate share link.", "error");
    }
  }, [questions, settings, theme, showToast]);

  useEffect(() => {
    const checkShare = async () => {
      try {
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const encodedData = urlParams.get('share');
          if (encodedData) {
            const result = await decodeExamData(encodedData);
            if (result) {
              setQuestions(result.questions);
              setSettings(result.settings);
              if (result.theme) {
                setTheme(result.theme);
              }
              setView('settings');
              const newUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
              showToast("Shared exam loaded successfully!", "success");
            } else {
              showToast("Could not load the shared exam. The link might be corrupt.", "error");
            }
          }
        }
      } catch (err) {
        console.error("Error loading shared exam:", err);
      }
    };
    checkShare();
  }, [showToast]);

  useEffect(() => {
    try {
      localStorage.setItem('exam_history', JSON.stringify(examHistory));
    } catch (e) {}
  }, [examHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('question_bank', JSON.stringify(questionBank));
    } catch (e) {}
  }, [questionBank]);

  useEffect(() => {
    if ((theme.visualStyle === 'undertale' || theme.visualStyle === 'black-hole' || theme.visualStyle === 'space-black-hole') && !darkMode) {
      setDarkMode(true);
    }
    if (theme.visualStyle === 'virus') {
      if (!theme.accentColor.startsWith('virus-')) {
        setTheme(prev => ({ ...prev, accentColor: 'virus-marburg' }));
      }
    }
  }, [theme.visualStyle, darkMode, theme.accentColor]);

  useEffect(() => {
    if (theme.visualStyle === 'black-hole') {
      if (theme.accentColor === 'space-black-hole-orange') {
        setUICustomization(prev => ({ ...prev, spaceBlackHoleNoiseScale: (prev.spaceBlackHoleNoiseScale || 2.5) + 0.0001 }));
        const timeout = setTimeout(() => {
          setUICustomization(prev => ({ ...prev, spaceBlackHoleNoiseScale: Math.max(0, (prev.spaceBlackHoleNoiseScale || 2.5) - 0.0001) }));
        }, 50);
        return () => clearTimeout(timeout);
      } else if (theme.accentColor === 'neural-black-hole') {
        setUICustomization(prev => ({ ...prev, neuralPulseSpeed: (prev.neuralPulseSpeed || 1.0) + 0.0001 }));
        const timeout = setTimeout(() => {
          setUICustomization(prev => ({ ...prev, neuralPulseSpeed: Math.max(0, (prev.neuralPulseSpeed || 1.0) - 0.0001) }));
        }, 50);
        return () => clearTimeout(timeout);
      } else if (theme.accentColor === 'geometric-aura-black-hole') {
        setUICustomization(prev => ({ ...prev, performanceMode: true }));
        const timeout = setTimeout(() => {
          setUICustomization(prev => ({ ...prev, performanceMode: false }));
        }, 50);
        return () => clearTimeout(timeout);
      }
    }
  }, [theme.accentColor, theme.visualStyle]);

  useEffect(() => {
    try {
      localStorage.setItem('app_theme', JSON.stringify(theme));
    } catch (e) {}

    // Apply accent color
    // Remove any existing theme-* classes
    const classesToRemove = Array.from(document.documentElement.classList).filter(c => c.startsWith('theme-'));
    classesToRemove.forEach(c => document.documentElement.classList.remove(c));
    
    document.documentElement.classList.add(`theme-${theme.accentColor}`);
    
    const customHex = localStorage.getItem('custom_modern_color');
    if (customHex) {
      injectCustomModernColor(customHex);
    }
    
    if (theme.customTheme) {
      document.documentElement.style.setProperty('--accent-color', theme.customTheme.buttonColor);
      document.documentElement.style.setProperty('--custom-bg-color', theme.customTheme.backgroundColor);
      document.documentElement.style.setProperty('--custom-font-family', FONTS.find(f => f.id === theme.customTheme?.fontStyle)?.family || 'inherit');
    } else {
      document.documentElement.style.removeProperty('--accent-color');
      document.documentElement.style.removeProperty('--custom-bg-color');
      document.documentElement.style.removeProperty('--custom-font-family');
    }

    // Apply visual style
    const visualClassesToRemove = Array.from(document.documentElement.classList).filter(c => c.startsWith('visual-'));
    visualClassesToRemove.forEach(c => document.documentElement.classList.remove(c));
    document.documentElement.classList.add(`visual-${theme.visualStyle}`);

  }, [theme]);

  const handleOnAnswer = useCallback((questionId: string, answer: string, isCorrect: boolean, timeTaken: number = 0, points: number = 0) => {
    if (multiplayerSocket && multiplayerRoomId) {
      multiplayerSocket.emit('submit_answer', {
        roomId: multiplayerRoomId,
        questionId,
        answer,
        isCorrect,
        timeTaken,
        points
      });
    }
    
    if (isCorrect && theme.visualStyle === 'hollow-knight') {
      setShowSoulEffect(true);
      setTimeout(() => setShowSoulEffect(false), 1500);
    }
  }, [theme.visualStyle, multiplayerSocket, multiplayerRoomId]);

  useEffect(() => {
    try {
      localStorage.setItem('ui_customization', JSON.stringify(uiCustomization));
    } catch (e) {}

    const root = document.documentElement;
    root.style.setProperty('--ui-scale', uiCustomization.uiSize.toString());
    root.style.setProperty('--ui-radius', `${uiCustomization.borderRadius}px`);
    root.style.setProperty('--ui-spacing', uiCustomization.spacing.toString());
    root.style.setProperty('--text-size', `${uiCustomization.textFontSize}px`);
    root.style.setProperty('--text-weight', uiCustomization.textFontWeight.toString());
    root.style.setProperty('--text-spacing', `${uiCustomization.textLetterSpacing}px`);
    root.style.setProperty('--text-height', uiCustomization.textLineHeight.toString());
    
    // Liquid Glass Additions
    root.style.setProperty('--liquid-noise', (uiCustomization.liquidGlassNoise ?? 0).toString());
    root.style.setProperty('--liquid-edge', `rgba(255, 255, 255, ${uiCustomization.liquidGlassEdgeGlow ?? 0.3})`);
    root.style.setProperty('--liquid-sat', `saturate(${((uiCustomization.liquidGlassSaturation ?? 2.5) * 100).toFixed(0)}%)`);
    
    const disableBlur = !uiCustomization.blurEnabled || uiCustomization.performanceMode || uiCustomization.optimizationMode;
    const disableShadows = !uiCustomization.shadowsEnabled || uiCustomization.performanceMode || uiCustomization.optimizationMode;

    if (disableBlur) root.classList.add('no-blur');
    else root.classList.remove('no-blur');

    if (disableShadows) root.classList.add('no-shadows');
    else root.classList.remove('no-shadows');

    if (uiCustomization.optimizationMode) root.classList.add('optimization-mode');
    else root.classList.remove('optimization-mode');

    if (uiCustomization.customFontUrl) {
      const newStyle = document.createElement('style');
      newStyle.id = 'custom-font-style';
      newStyle.appendChild(document.createTextNode(`
        @font-face {
          font-family: 'CustomUserFont';
          src: url('${uiCustomization.customFontUrl}');
        }
        :root {
          --font-sans: 'CustomUserFont', ui-sans-serif, system-ui, sans-serif !important;
          --font-mono: 'CustomUserFont', ui-monospace, SFMono-Regular, monospace !important;
        }
        body, button, input, textarea, select {
          font-family: 'CustomUserFont', sans-serif !important;
        }
      `));
      
      const existingStyle = document.getElementById('custom-font-style');
      if (existingStyle) {
        existingStyle.remove();
      }
      document.head.appendChild(newStyle);
    } else {
      const existingStyle = document.getElementById('custom-font-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    }

    if (uiCustomization.performanceMode) {
      document.documentElement.classList.add('performance-mode');
    } else {
      document.documentElement.classList.remove('performance-mode');
    }
  }, [uiCustomization]);

  useEffect(() => {
    if (settings) {
      try {
        localStorage.setItem('last_exam_settings', JSON.stringify(settings));
      } catch (e) {}
    }
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme.visualStyle === 'arcane') {
      const styles = getArcaneStyles(theme.accentColor);
      root.style.setProperty('--arcane-border', styles.border);
      root.style.setProperty('--arcane-glow', styles.glow);
      root.style.setProperty('--arcane-text', styles.text);
      root.style.setProperty('--arcane-bg', styles.bg);
      root.style.setProperty('--arcane-accent', styles.accent);
      root.style.setProperty('--arcane-accent-text', styles.accentText);
      root.style.setProperty('--arcane-card', styles.card);
      root.style.setProperty('--arcane-button', styles.button);
      root.style.setProperty('--arcane-icon-glow', styles.iconGlow);
    } else {
      root.style.removeProperty('--arcane-border');
      root.style.removeProperty('--arcane-glow');
      root.style.removeProperty('--arcane-text');
      root.style.removeProperty('--arcane-bg');
      root.style.removeProperty('--arcane-accent');
      root.style.removeProperty('--arcane-accent-text');
      root.style.removeProperty('--arcane-card');
      root.style.removeProperty('--arcane-button');
      root.style.removeProperty('--arcane-icon-glow');
    }
  }, [theme.visualStyle, theme.accentColor]);

  useEffect(() => {
    if (theme.visualStyle === 'black-hole' && theme.accentColor === 'bubbles-blackhole' && view === 'home') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [theme.visualStyle, theme.accentColor, view]);

  useEffect(() => {
    try {
      localStorage.setItem('dark_mode', String(darkMode));
    } catch (e) {}
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
      console.log('Theme: Dark mode activated');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Theme: Light mode activated');
    }
  }, [darkMode]);

  useEffect(() => {
    if (view !== 'home') {
      setShowGlobalSettings(false);
      setShowHistory(false);
      setShowThemes(false);
      setShowUICustomization(false);
    }
  }, [view]);

  const handleStartSolo = () => setView('parser');
  
  const handleGenerate = (qs: Question[]) => {
    setQuestions(qs);
    setView('settings');
  };

  const handleStartExam = (s: ExamSettings) => {
    // Save settings to local storage
    try {
      localStorage.setItem('last_exam_settings', JSON.stringify(s));
    } catch (e) {}

    // Sort questions based on settings
    let sortedQuestions = [...questions];

    if (s.rpgModeEnabled) {
      sortedQuestions = sortedQuestions.filter(q => q.type === 'mcq' || q.type === 'true_false' || q.type === 'multi_select');
    }

    if (s.randomizeQuestions) {
      // Shuffle all questions first
      for (let i = sortedQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sortedQuestions[i], sortedQuestions[j]] = [sortedQuestions[j], sortedQuestions[i]];
      }
    }

    sortedQuestions.sort((a, b) => {
      // Primary sort: MCQ vs Essay
      if (s.essaysLast) {
        const aIsEssay = a.type === 'essay';
        const bIsEssay = b.type === 'essay';
        if (!aIsEssay && bIsEssay) return -1;
        if (aIsEssay && !bIsEssay) return 1;
      }

      // Secondary sort: Images
      if (s.imagesLast) {
        const aHasImg = !!a.imageUrl;
        const bHasImg = !!b.imageUrl;
        if (!aHasImg && bHasImg) return -1;
        if (aHasImg && !bHasImg) return 1;
      }

      return 0;
    });

    setQuestions(sortedQuestions);
    setSettings(s);
    setView('exam');
  };

  const handleFinishExam = (answers: Record<string, string>, wrongPartSelections?: Record<string, string>, questionSpentTimes?: Record<string, number>, goldEarned?: number) => {
    if (multiplayerSocket && multiplayerRoomId) {
      multiplayerSocket.emit('finish_exam', { 
        roomId: multiplayerRoomId, 
        timeTaken: Object.values(questionSpentTimes || {}).reduce((a, b) => a + b, 0) 
      });
    }

    if (settings.rpgModeEnabled && goldEarned) {
      setRpgProgression(prev => ({
        ...prev,
        totalCoins: prev.totalCoins + goldEarned
      }));
      showToast(`🏆 RPG Run Finished! Collected 🪙 ${goldEarned} coins.`, 'success');
    }

    const feedback: Record<string, EssayFeedback> = {};
    let pointsAccumulated = 0;

    if (questionSpentTimes) setSpentTimes(questionSpentTimes);

    questions.forEach(q => {
      let isCorrect = false;
      if (q.type === 'essay' && answers[q.id]) {
        const f = gradeEssay(answers[q.id], q.correctAnswer || '');
        feedback[q.id] = f;
        if (f.score >= 50) isCorrect = true;
      } else {
        if (q.type === 'mcq' || q.type === 'true_false') {
          isCorrect = (q.type === 'true_false' && q.correctAnswer === 'False' && q.wrongPart && !settings.rpgModeEnabled)
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
            if (selected.length === correct.length && correct.length > 0) {
              isCorrect = correct.every((target: any) => {
                const sel = selected.find((s: any) => s.targetId === target.id);
                if (!sel) return false;
                const dx = sel.x - target.x;
                const dy = sel.y - target.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                return dist <= target.radius;
              });
            } else {
              isCorrect = false;
            }
          } catch (e) {
            isCorrect = false;
          }
        }
        
        if (q.type !== 'mcq' && q.type !== 'true_false') {
          feedback[q.id] = { score: isCorrect ? 100 : 0, grade: '', feedback: '', usedTerms: [], missingTerms: [], length: 0, hasParagraphs: false };
        }
      }
      pointsAccumulated += calculateQuestionPoints(q, answers[q.id], wrongPartSelections?.[q.id], feedback[q.id], settings.rpgModeEnabled);
    });

    // Save to history
    const historyItem: ExamHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Exam ${examHistory.length + 1}`,
      date: Date.now(),
      score: pointsAccumulated,
      totalQuestions: questions.reduce((acc, q) => {
        if (q.type === 'mcq') return acc + 1;
        if (q.type === 'essay') return acc + 2;
        if (q.type === 'fill_in_blanks') return acc + (q.blanks?.length || 0) * 0.5;
        if (q.type === 'matching') return acc + ((q.matchingPairs?.length || 0) * 0.5);
        if (q.type === 'locate_on_image') return acc + 1.5;
        if (q.type === 'true_false') return acc + (q.correctAnswer === 'False' && q.wrongPart ? 1.5 : 1);
        return acc + 1;
      }, 0),
      questions: questions,
      settings: settings!,
      results: answers,
      wrongPartSelections: wrongPartSelections,
      essayFeedback: feedback
    };

    setExamHistory(prev => [historyItem, ...prev]);
    setEssayFeedback(feedback);
    setExamResults(answers);
    setWrongPartSelections(wrongPartSelections || {});
    setView('results');
  };

  const handleDeleteHistory = (id: string) => {
    setExamHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleRenameHistory = (id: string, newName: string) => {
    setExamHistory(prev => prev.map(item => item.id === id ? { ...item, name: newName } : item));
  };

  const handleRetakeHistory = (item: ExamHistoryItem) => {
    setQuestions(item.questions);
    setSettings(item.settings);
    setExamResults({});
    setWrongPartSelections({});
    setEssayFeedback({});
    setView('settings');
    setShowGlobalSettings(false);
    setShowHistory(false);
  };

  const handleRestart = () => {
    if (view === 'multiplayer-parser') {
      setView('multiplayer-lobby');
      return;
    }
    if (multiplayerRoomId) {
      multiplayerSocket?.emit('leave_room', { roomId: multiplayerRoomId });
      setMultiplayerRoomId(null);
      setMultiplayerMode(null);
    }
    setView('home');
    setPdfView('home');
    setPresentationView('home');
    setQuestions([]);
    setExamResults({});
    setWrongPartSelections({});
    setEssayFeedback({});
  };

  const handleSaveToBank = (question: Question) => {
    setQuestionBank(prev => {
      const exists = prev.some(q => q.id === question.id);
      if (exists) {
        return prev.filter(q => q.id !== question.id);
      }
      return [...prev, question];
    });
  };

  const isSavedToBank = (id: string) => {
    return questionBank.some(q => q.id === id);
  };

  const [ultVariant, setUltVariant] = useState(() => {
    const saved = localStorage.getItem('ult-variant');
    return saved ? parseInt(saved, 10) : 1;
  });

  useEffect(() => {
    if (theme.visualStyle === 'ultimate') {
      localStorage.setItem('ult-variant', ultVariant.toString());
    }
    if (theme.visualStyle === 'hollow-knight') {
      if (theme.accentColor === 'hollow-knight-pale' && ultVariant !== 12) {
        setUltVariant(12);
      } else if (theme.accentColor === 'hollow-knight-silksong' && ultVariant !== 13) {
        setUltVariant(13);
      }
    }
  }, [ultVariant, theme.visualStyle, theme.accentColor]);

  return (
    <MotionConfig reducedMotion={uiCustomization.performanceMode ? "always" : "user"}>
      <TextStrokeFilters accentColor={theme.accentColor} />
      <div 
        className={`min-h-[100dvh] text-slate-900 dark:text-slate-50 selection:bg-indigo-600 selection:text-white relative overflow-x-hidden transition-colors duration-300 visual-${theme.visualStyle} group/${theme.visualStyle} group-[.visual-undertale]/undertale group-[.visual-saidi]/saidi group-[.visual-arcane]/arcane group-[.visual-ultimate]/ultimate group-[.visual-hollow-knight]/hollow-knight group-[.visual-kitler]/kitler group-[.visual-virus]/virus group-[.visual-liquid-glass]/liquid-glass group-[.visual-fluid]/fluid group-[.visual-black-hole]/black-hole ${theme.visualStyle === 'ultimate' && ultVariant > 1 ? `ult-variant-${ultVariant}` : ''} ${view === 'exam' ? 'is-exam' : ''} ${theme.visualStyle === 'black-hole' && theme.accentColor === 'puddle-black-hole' && view === 'home' ? 'overflow-y-hidden h-[100dvh] touch-none' : ''}`}
        style={theme.customTheme ? { '--custom-font-family': FONTS.find(f => f.id === theme.customTheme?.fontStyle)?.family } as React.CSSProperties : {}}
        data-theme={theme.accentColor}
      >
      {/* Global Background Color */}
      {!(appMode !== 'exams' && pdfView !== 'home') && (
        <div 
          className={`fixed inset-0 z-[-20] transition-colors duration-300 ${theme.visualStyle === 'hollow-knight' || theme.visualStyle === 'black-hole' ? 'bg-black dark:bg-black' : 'bg-slate-50 dark:bg-slate-950'}`} 
          style={theme.customTheme ? { backgroundColor: theme.customTheme.backgroundColor } : {}}
        />
      )}

      <KitlerClickEffect active={view === 'home' && theme.visualStyle === 'kitler'} />
      
      {theme.visualStyle === 'virus' && (
        <>
          <VirusBackground accentColor={theme.accentColor} isDark={darkMode} performanceMode={uiCustomization.performanceMode} optimizationMode={uiCustomization.optimizationMode} isActive={view === 'home'} />
          <VirusClickEffect isDark={darkMode} accentColor={theme.accentColor} />
        </>
      )}

      {(theme.visualStyle as any) === 'liquid-glass' && (
        <>
          <LiquidGlassBackground isDark={darkMode} accentColor={theme.accentColor} view={view} customization={uiCustomization} />
          <LiquidGlassFilters customization={uiCustomization} />
        </>
      )}

      {theme.visualStyle === 'fluid' && (
        <>
          <FluidBackground 
            accentColor={theme.accentColor} 
            isHome={view === 'home'} 
            borderThickness={uiCustomization.fluidBorderThickness}
            animationSpeed={uiCustomization.fluidAnimationSpeed}
            blobCount={uiCustomization.fluidBlobCount}
          />
          <FluidButtonOverlay 
            accentColor={theme.accentColor} 
            borderThickness={uiCustomization.fluidBorderThickness}
            animationSpeed={uiCustomization.fluidAnimationSpeed}
            blobCount={uiCustomization.fluidBlobCount}
          />
        </>
      )}

      {theme.visualStyle === 'black-hole' && theme.accentColor !== 'space-black-hole-orange' && theme.accentColor !== 'neural-black-hole' && theme.accentColor !== 'puddle-black-hole' && theme.accentColor !== 'bubbles-blackhole' && theme.accentColor !== 'emissive-black-hole' && theme.accentColor !== 'geometric-aura-black-hole' && (
        <BlackHoleBackground theme={theme} isHome={view === 'home'} />
      )}

      {theme.visualStyle === 'black-hole' && theme.accentColor === 'space-black-hole-orange' && (
        <TrueBlackHoleBackground theme={theme} customization={uiCustomization} isHome={view === 'home'} />
      )}

      {theme.visualStyle === 'black-hole' && theme.accentColor === 'neural-black-hole' && (
        <NeuralBlackHoleBackground theme={theme} customization={uiCustomization} />
      )}

      {theme.visualStyle === 'black-hole' && theme.accentColor === 'puddle-black-hole' && (
        <PuddleBlackHoleBackground theme={theme} customization={uiCustomization} />
      )}

      {theme.visualStyle === 'black-hole' && theme.accentColor === 'bubbles-blackhole' && (
        <BubblesBlackHoleBackground features={uiCustomization} accentColor={theme.accentColor} isDark={darkMode} performanceMode={uiCustomization?.performanceMode} settings={theme.blackHoleSettings} />
      )}

      {theme.visualStyle === 'black-hole' && theme.accentColor === 'emissive-black-hole' && (
        <EmissiveBlackHoleBackground performanceMode={uiCustomization?.performanceMode} settings={theme.blackHoleSettings} />
      )}

      {theme.visualStyle === 'black-hole' && theme.accentColor === 'geometric-aura-black-hole' && (
        <GeometricAuraBlackHoleBackground performanceMode={uiCustomization?.performanceMode} settings={theme.blackHoleSettings} customization={uiCustomization} />
      )}


      {!(appMode !== 'exams' && pdfView !== 'home') && (theme.visualStyle === 'ultimate' || theme.visualStyle === 'hollow-knight' || theme.customTheme) && (
        <div className={`transition-opacity duration-1000 ${view === 'home' || theme.visualStyle === 'hollow-knight' || theme.customTheme ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {theme.visualStyle === 'hollow-knight' ? (
            <>
              <HollowKnightBackground active={true} accent={theme.accentColor} performanceMode={uiCustomization.performanceMode} view={view} />
              <HollowKnightBackgroundEffect 
                variant={ultVariant} 
                view={view}
                uiCustomization={uiCustomization}
              />
            </>
          ) : (
            <UltimateBackground 
              variant={ultVariant} 
              setVariant={setUltVariant} 
              view={view}
              uiCustomization={uiCustomization}
              customTheme={theme.customTheme}
              visualStyle={theme.visualStyle}
              accentColor={theme.accentColor}
            />
          )}
          {(theme.visualStyle as any) === 'hollow-knight' && (
            <SoulAbsorption 
              active={showSoulEffect} 
              color={theme.accentColor === 'hollow-knight-silksong' ? "#e63946" : "#ffffff"} 
              performanceMode={uiCustomization.performanceMode}
            />
          )}
        </div>
      )}

      {/* Global Menu Button */}
      {(appMode === 'exams' ? view === 'home' : (appMode === 'presentations' ? presentationView === 'home' : pdfView === 'home')) && (
        <div className="fixed top-6 right-6 z-[110]">
          <button
            onClick={() => setShowGlobalSettings(!showGlobalSettings)}
            className={`p-4 glass rounded-2xl hover:scale-110 active:scale-95 transition-all group no-hat ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : ''}`}
          >
            <Menu className={`w-6 h-6 transition-transform duration-300 group-hover:rotate-90 ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accentText : 'text-slate-600 dark:text-slate-300'}`} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {showGlobalSettings && (
          <GlobalSettings 
            appMode={appMode}
            setAppMode={setAppMode}
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            theme={theme}
            onOpenThemes={() => {
              setShowThemes(true);
              setShowGlobalSettings(false);
            }}
            onOpenHistory={() => {
              setShowHistory(true);
              setShowGlobalSettings(false);
            }}
            onOpenBank={() => {
              setShowBank(true);
              setShowGlobalSettings(false);
            }}
            onOpenUICustomization={() => {
              setShowUICustomization(true);
              setShowGlobalSettings(false);
            }}
            onOpenPowerSettings={() => {
              setShowPowerSettings(true);
              setShowGlobalSettings(false);
            }}
            onOpenSavedExams={() => {
              setView('saved-exams');
              setShowGlobalSettings(false);
            }}
            onOpenSavedPdfs={() => {
              setShowSavedPdfs(true);
              setShowGlobalSettings(false);
            }}
            onOpenSavedAugmentations={() => {
              setShowSavedAugmentations(true);
              setShowGlobalSettings(false);
            }}
            onOpenUploader={() => {
              setView('uploader');
              setShowGlobalSettings(false);
            }}
            rpgModeEnabled={settings.rpgModeEnabled || false}
            setRpgModeEnabled={(v) => setSettings({ ...settings, rpgModeEnabled: v })}
            onOpenRpgShop={() => {
              setShowRpgShop(true);
              setShowGlobalSettings(false);
            }}
            coins={rpgProgression.totalCoins}
            onClose={() => setShowGlobalSettings(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRpgShop && (
          <RpgShopModal
            progression={rpgProgression}
            onUpdateProgression={setRpgProgression}
            onClose={() => setShowRpgShop(false)}
            theme={theme}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPowerSettings && settings && (
          <PowerSettingsModal
            settings={settings}
            updateSettings={(s) => setSettings(prev => prev ? { ...prev, ...s } : { ...s } as ExamSettings)}
            onClose={() => setShowPowerSettings(false)}
            theme={theme}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUICustomization && (
          <UICustomizationModal
            theme={theme}
            onUpdateTheme={(t) => {
              setTheme(prev => {
                if (t.accentColor && t.accentColor !== prev.accentColor) {
                  if (t.accentColor === 'emissive-black-hole') {
                    setUICustomization(uiPrev => ({ 
                      ...uiPrev, 
                      previousPerformanceMode: uiPrev.performanceMode,
                      performanceMode: true 
                    }));
                  } else if (prev.accentColor === 'emissive-black-hole') {
                    setUICustomization(uiPrev => ({ 
                      ...uiPrev, 
                      performanceMode: uiPrev.previousPerformanceMode ?? uiPrev.performanceMode 
                    }));
                  }
                }
                return { ...prev, ...t };
              });
            }}
            uiCustomization={uiCustomization}
            setUICustomization={setUICustomization}
            onClose={() => setShowUICustomization(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showThemes && (
          <ThemeSelectionModal
            currentTheme={theme}
            onUpdateTheme={(update) => {
              setTheme(prev => {
                if (update.accentColor && update.accentColor !== prev.accentColor) {
                  if (update.accentColor === 'emissive-black-hole') {
                    setUICustomization(uiPrev => ({ 
                      ...uiPrev, 
                      previousPerformanceMode: uiPrev.performanceMode,
                      performanceMode: true 
                    }));
                  } else if (prev.accentColor === 'emissive-black-hole') {
                    setUICustomization(uiPrev => ({ 
                      ...uiPrev, 
                      performanceMode: uiPrev.previousPerformanceMode ?? uiPrev.performanceMode 
                    }));
                  }
                }
                return { ...prev, ...update };
              });
            }}
            onClose={() => setShowThemes(false)}
            onCreateTheme={() => {
              setShowThemes(false);
              setShowCustomTheme(true);
            }}
            onRemoveCustomTheme={() => {
              setTheme(prev => {
                const { customTheme, ...rest } = prev;
                return rest as AppTheme;
              });
              // Clear custom styles from document
              document.documentElement.style.removeProperty('--accent-color');
              document.documentElement.style.removeProperty('--custom-bg-color');
              document.documentElement.style.removeProperty('--custom-font-family');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCustomTheme && (
          <CustomThemeModal
            initialTheme={theme.customTheme}
            onSave={(customTheme) => {
              setTheme(prev => ({ ...prev, customTheme }));
            }}
            onDelete={() => {
              setTheme(prev => {
                const { customTheme, ...rest } = prev;
                return rest as AppTheme;
              });
              // Clear custom styles from document
              document.documentElement.style.removeProperty('--accent-color');
              document.documentElement.style.removeProperty('--custom-bg-color');
              document.documentElement.style.removeProperty('--custom-font-family');
            }}
            onClose={() => setShowCustomTheme(false)}
          />
        )}
      </AnimatePresence>


      <AnimatePresence>
        {showSavedPdfs && (
          <SavedPdfsModal
            theme={theme}
            savedPdfs={savedPdfs}
            onDelete={handleDeleteSavedPdf}
            onRename={handleRenameSavedPdf}
            onReopen={(pdf) => {
              setPdfDocuments(pdf.documents);
              setPdfView('viewer');
              setShowSavedPdfs(false);
            }}
            onCombine={handleCombinePdfs}
            onClose={() => setShowSavedPdfs(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSavedAugmentations && (
          <SavedAugmentationsModal
            theme={theme}
            savedAugmentations={savedAugmentations}
            onDelete={handleDeleteSavedAugmentation}
            onRename={handleRenameSavedAugmentation}
            onReopen={(aug) => {
              setPdfAugmentedDocument(aug.document);
              setPdfView('augmented-viewer');
              setShowSavedAugmentations(false);
            }}
            onCombine={handleCombineAugmentations}
            onClose={() => setShowSavedAugmentations(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <HistoryModal
            theme={theme}
            history={examHistory}
            onDeleteHistory={handleDeleteHistory}
            onRenameHistory={handleRenameHistory}
            onRetakeHistory={handleRetakeHistory}
            onSaveExam={handleSaveExam}
            onClose={() => setShowHistory(false)}
          />
        )}
        {showBank && (
          <QuestionBankModal
            theme={theme}
            bank={questionBank}
            onDeleteFromBank={(ids) => setQuestionBank(prev => prev.filter(q => !ids.includes(q.id)))}
            onStartExam={(selectedQuestions) => {
              setQuestions(selectedQuestions);
              setView('settings');
              setShowBank(false);
            }}
            onClose={() => setShowBank(false)}
          />
        )}
      </AnimatePresence>

      {/* Global Background Elements */}
      {theme.visualStyle === 'kitler' && (
        <>
          <KitlerBackground />
          <KitlerLogoMark isHome={view === 'home'} />
        </>
      )}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-10]" style={{ opacity: uiCustomization.dynamicBackgroundEnabled ? uiCustomization.dynamicBackgroundIntensity : 0 }}>
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-[150px]" />
        
        <SuperheroBackground performanceMode={uiCustomization.performanceMode} optimizationMode={uiCustomization.optimizationMode} accentColor={theme.accentColor} isDark={darkMode} />
        <MinecraftDynamicBackground performanceMode={uiCustomization.performanceMode} optimizationMode={uiCustomization.optimizationMode} accentColor={theme.accentColor} />
        <TadcBackground performanceMode={uiCustomization.performanceMode} optimizationMode={uiCustomization.optimizationMode} accentColor={theme.accentColor} isDarkMode={darkMode} />
        <ModernBackground performanceMode={uiCustomization.performanceMode} optimizationMode={uiCustomization.optimizationMode} />
        <DuckBackground performanceMode={uiCustomization.performanceMode} optimizationMode={uiCustomization.optimizationMode} theme={theme} />
        <UndertaleBackground performanceMode={uiCustomization.performanceMode} optimizationMode={uiCustomization.optimizationMode} theme={theme} />
        <SaidiBackground performanceMode={uiCustomization.performanceMode} optimizationMode={uiCustomization.optimizationMode} />
        <ArcaneBackground performanceMode={uiCustomization.performanceMode} accentColor={theme.accentColor} isDark={darkMode} isHome={view === 'home'} uiCustomization={uiCustomization} />
        <AdventureTimeDynamicBackground performanceMode={uiCustomization.performanceMode} optimizationMode={uiCustomization.optimizationMode} accentColor={theme.accentColor} isDark={darkMode} isHome={view === 'home'} />
      </div>

      {/* Saidi Logo */}
      <div className="saidi-logo opacity-0 group-[.visual-saidi]/saidi:opacity-100 transition-opacity duration-500" />

      {/* Navigation Bar */}
      {!(appMode === 'pdfs' && pdfView === 'viewer') && !(appMode === 'presentations') && !(view === 'exam' && settings?.rpgModeEnabled) && (
        <nav className={`px-4 py-4 sm:px-8 sm:py-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center sticky top-0 z-40 group-[.visual-virus]/virus:bg-transparent group-[.visual-virus]/virus:border-none group-[.visual-virus]/virus:pt-8 group-[.visual-virus]/virus:backdrop-blur-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-header group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-fluid]/fluid:fluid-header group-[.visual-fluid]/fluid:!shadow-none group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-bg)]/70 group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/30 group-[.visual-hollow-knight]/hollow-knight:backdrop-blur-md`}>
          <div 
            className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic cursor-pointer flex items-center gap-2 group group-[.visual-hollow-knight]/hollow-knight:font-serif group-[.visual-hollow-knight]/hollow-knight:not-italic"
            onClick={handleRestart}
          >
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white transition-all duration-300 group-hover:rotate-12 ${theme.visualStyle === 'superhero' ? (theme.accentColor === 'superhero-spiderman' ? 'bg-red-600 shadow-lg' : theme.accentColor === 'superhero-batman' ? 'bg-slate-900 shadow-lg' : 'bg-blue-600 shadow-lg') : (theme.visualStyle === 'virus' ? `${getArcaneStyles(theme.accentColor).accent} ${getArcaneStyles(theme.accentColor).glow}` : 'bg-indigo-600 shadow-lg')} group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:!backdrop-blur-none group-[.visual-fluid]/fluid:fluid-logo-container group-[.visual-fluid]/fluid:!bg-transparent group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none group-[.visual-hollow-knight]/hollow-knight:bg-transparent group-[.visual-hollow-knight]/hollow-knight:border group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-accent)]/40 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:shadow-[0_0_10px_rgba(136,204,255,0.2)]`}>
              {theme.visualStyle === 'superhero' ? (
                theme.accentColor === 'superhero-spiderman' ? <Bug className="w-5 h-5 sm:w-6 sm:h-6" /> :
                theme.accentColor === 'superhero-batman' ? <Moon className="w-5 h-5 sm:w-6 sm:h-6" /> :
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <FileText className={`w-5 h-5 sm:w-6 sm:h-6 ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).accentText : ''} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)]`} />
              )}
            </div>
            <AnimatedText theme={theme} className={`flex items-center gap-2 ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).text : ''} group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-fluid]/fluid:!text-white group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-text)]`}>
              {theme.visualStyle === 'adventure-time' ? 'Adventure' : 
               theme.visualStyle === 'ultimate' ? (
                 <span style={{ color: getVariantStyles(ultVariant).accent1 }}>Arcane</span>
               ) : 
               theme.visualStyle === 'superhero' ? 'Hero' : 
               theme.visualStyle === 'virus' ? 'Arcane' : 'Arcane'} 
              <span className={`${theme.visualStyle === 'ultimate' ? "" : (theme.visualStyle === 'virus' ? "" : (theme.visualStyle === 'fluid' ? "text-white" : "text-indigo-600"))} group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)]`} style={theme.visualStyle === 'ultimate' ? { color: getVariantStyles(ultVariant).accent2 } : {}}>
                {appMode === 'pdfs' ? 'Pdfs' : (theme.visualStyle === 'adventure-time' ? 'Time' : theme.visualStyle === 'superhero' ? 'EXAMS' : theme.visualStyle === 'ultimate' ? 'Exam' : 'EXAMS')}
              </span>
              {theme.visualStyle === 'ultimate' && ultVariant === 9 && (
                <motion.span 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="ml-2 px-2 py-0.5 bg-gradient-to-r from-pink-300 to-blue-300 text-white text-[10px] font-black rounded-full shadow-sm border border-white"
                >
                  EASTER
                </motion.span>
              )}
            </AnimatedText>
          </div>
          <div className="flex items-center gap-4">
            {view !== 'home' && (
              <button 
                onClick={handleRestart}
                className={`px-4 py-2 sm:px-6 sm:py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-all no-hat no-webgl ${theme.visualStyle === 'virus' ? getArcaneStyles(theme.accentColor).button : ''} group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-fluid]/fluid:fluid-settings-item group-[.visual-fluid]/fluid:!text-white group-[.visual-fluid]/fluid:!border-none group-[.visual-fluid]/fluid:!shadow-none group-[.visual-hollow-knight]/hollow-knight:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:text-[var(--color-hk-accent)] group-[.visual-hollow-knight]/hollow-knight:border group-[.visual-hollow-knight]/hollow-knight:border-[var(--color-hk-border)]/40 group-[.visual-hollow-knight]/hollow-knight:rounded-none group-[.visual-hollow-knight]/hollow-knight:hover:bg-[var(--color-hk-hover)] group-[.visual-hollow-knight]/hollow-knight:hover:text-[var(--color-hk-text)]`}
              >
                EXIT EXAM
              </button>
            )}
            {/* Spacer for the floating menu button which is fixed but we want to avoid overlap if needed */}
            <div className="w-12 h-12 hidden sm:block" />
          </div>
        </nav>
      )}

      <main className={`relative z-10 ${(appMode === 'presentations' && (presentationView === 'viewer' || presentationView === 'block-viewer' || (presentationView === 'mindmap' && mindmapActiveState === 'map'))) ? 'pb-0 h-screen overflow-hidden' : 'pb-20'}`}>
        {appMode === 'presentations' ? (
          <PresentationMode 
            view={presentationView} 
            setView={setPresentationView} 
            onMindmapStateChange={setMindmapActiveState}
          />
        ) : appMode === 'exams' ? (
          <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Home 
                onStart={handleStartSolo} 
                onStartCreator={() => setView('exam-creator')}
                onStartReadyExams={() => setView('ready-exams')}
                onStartMultiplayer={() => setView('multiplayer-lobby')}
                theme={theme} 
                ultVariant={ultVariant}
              />
            </motion.div>
          )}
          {view === 'uploader' && (
            <motion.div key="uploader" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <UploaderMode
                theme={theme}
                setParsedQuestions={setQuestions}
                onBack={() => setView('home')}
                onContinue={() => setView('settings')}
              />
            </motion.div>
          )}
          {view === 'multiplayer-lobby' && (
            <motion.div key="multiplayer-lobby" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                <MultiplayerLobby
                  socket={multiplayerSocket}
                  onBack={() => setView('home')}
                  onJoinRoom={(roomId, mode, examQs, examSettings) => {
                    setMultiplayerRoomId(roomId);
                    setMultiplayerMode(mode);
                    setQuestions(examQs);
                    setSettings(examSettings);
                    setView('exam');
                  }}
                  onStartParsing={() => setView('multiplayer-parser')}
                  onConfigureSettings={(roomSettings, roomExam, roomMode) => {
                      setSettings(roomSettings);
                      setQuestions(roomExam);
                      setMultiplayerMode(roomMode);
                      setView('multiplayer-settings');
                  }}
                  initialRoomId={multiplayerRoomId}
                  onRoomCreated={(roomId) => setMultiplayerRoomId(roomId)}
                  theme={theme}
                  savedExams={savedExams}
                />
            </motion.div>
          )}
          {view === 'multiplayer-parser' && (
            <motion.div key="multiplayer-parser" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Parser 
                onGenerate={(newQuestions) => {
                  const defaultSettings = {
                      timeLimitType: 'none',
                      timeLimitValue: 60,
                      instantFeedback: true,
                      essaysLast: false,
                      imagesLast: false,
                      randomizeQuestions: false,
                      powerSystemEnabled: false,
                      guaranteedPowerPerCorrect: false
                  };
                  if (multiplayerSocket && multiplayerRoomId) {
                      multiplayerSocket.emit('update_settings', { roomId: multiplayerRoomId, exam: newQuestions, settings: defaultSettings, mode: 'independent' });
                  }
                  setView('multiplayer-lobby');
                }} 
                theme={theme} 
              />
            </motion.div>
          )}
          {view === 'multiplayer-settings' && (
            <motion.div key="multiplayer-settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Settings 
                onStart={(newSettings) => {
                  if (multiplayerSocket && multiplayerRoomId) {
                      multiplayerSocket.emit('update_settings', { 
                          roomId: multiplayerRoomId, 
                          exam: questions, 
                          settings: newSettings, 
                          mode: multiplayerMode || 'independent' 
                      });
                  }
                  setView('multiplayer-lobby');
                }} 
                initialSettings={settings} 
                theme={theme} 
                buttonText="SAVE SETTINGS FOR ROOM"
              />
            </motion.div>
          )}
          {view === 'parser' && (
            <motion.div key="parser" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Parser onGenerate={handleGenerate} theme={theme} />
            </motion.div>
          )}
          {view === 'ready-exams' && (
            <motion.div key="ready-exams" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <ReadyExams onGenerate={handleGenerate} onSaveExam={handleSaveExam} savedExams={savedExams} setView={setView} theme={theme} />
            </motion.div>
          )}
          {view === 'saved-exams' && (
            <motion.div key="saved-exams" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <SavedExams 
                savedExams={savedExams} 
                onDelete={handleDeleteSavedExam} 
                onRename={handleRenameSavedExam} 
                onStartExam={(qs) => {
                  setQuestions(qs);
                  setView('settings');
                }}
                onBack={() => setView('home')}
                theme={theme}
              />
            </motion.div>
          )}
          {view === 'exam-creator' && (
            <motion.div key="exam-creator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <ExamCreator onGenerate={handleGenerate} setView={setView} theme={theme} settings={settings || { timeLimitType: 'none', timeLimitValue: 0, instantFeedback: false, essaysLast: false, imagesLast: false, randomizeQuestions: false, powerSystemEnabled: false, guaranteedPowerPerCorrect: false }} />
            </motion.div>
          )}
          {view === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Settings onStart={handleStartExam} initialSettings={settings} theme={theme} />
            </motion.div>
          )}
          {view === 'exam' && settings && (
            <motion.div key="exam" className={settings.rpgModeEnabled ? 'fixed inset-0 z-50 block' : ''} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              {theme.visualStyle === 'hollow-knight' && (
                <>
                  {/* No vignette needed here as it is in background */}
                </>
              )}
              {settings.rpgModeEnabled ? (
                <RpgGame 
                  questions={questions}
                  rpgProgression={rpgProgression}
                  onUpdateProgression={setRpgProgression}
                  onQuit={handleRestart}
                  onFinish={(answers, wrongParts, times, gold) => {
                    handleFinishExam(answers, wrongParts || {}, times || {}, gold);
                  }}
                />
              ) : (
                <Exam 
                  questions={questions} 
                  settings={settings} 
                  onFinish={handleFinishExam} 
                  onAnswer={handleOnAnswer}
                  theme={theme} 
                  onSaveToBank={handleSaveToBank}
                  isSavedToBank={isSavedToBank}
                  searchQuery={mapSearchQuery}
                  onSearchChange={setMapSearchQuery}
                  performanceMode={uiCustomization.performanceMode}
                  onUsePower={handleOnUsePower}
                  externalQuestionIndex={multiplayerMode === 'synchronized' ? syncQuestionIndex : undefined}
                  isSynchronizedMode={multiplayerMode === 'synchronized'}
                  syncIsTransitioning={syncIsTransitioning}
                  roomData={roomData}
                  isHost={roomData?.hostId === multiplayerSocket?.id}
                  onTimeout={() => multiplayerSocket?.emit('sync_timeout', { roomId: multiplayerRoomId })}
                />
              )}
            </motion.div>
          )}
          {view === 'review' && settings && (
            <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Exam 
                questions={questions} 
                settings={settings} 
                onFinish={(answers, wrongParts, times) => {
                  if (times) setSpentTimes(times);
                  setView('results');
                }} 
                onAnswer={handleOnAnswer}
                theme={theme}
                reviewMode={true}
                initialAnswers={examResults}
                initialEssayFeedback={essayFeedback}
                wrongPartSelections={wrongPartSelections}
                onSaveToBank={handleSaveToBank}
                isSavedToBank={isSavedToBank}
                searchQuery={mapSearchQuery}
                onSearchChange={setMapSearchQuery}
                performanceMode={uiCustomization.performanceMode}
              />
            </motion.div>
          )}
          {view === 'results' && settings && (
            <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              {multiplayerRoomId ? (
                <MultiplayerLeaderboard 
                  questions={questions} 
                  answers={examResults} 
                  essayFeedback={essayFeedback}
                  wrongPartSelections={wrongPartSelections}
                  onRestart={handleRestart}
                  onReview={() => setView('review')}
                  theme={theme}
                  settings={settings}
                  multiplayerSocket={multiplayerSocket}
                  multiplayerRoomId={multiplayerRoomId}
                />
              ) : (
                <Results 
                  questions={questions} 
                  answers={examResults} 
                  essayFeedback={essayFeedback}
                  wrongPartSelections={wrongPartSelections}
                  questionTimes={spentTimes}
                  onRestart={handleRestart}
                  onReview={() => setView('review')}
                  onSaveExam={(name) => handleSaveExam(name, questions)}
                  theme={theme}
                  settings={settings}
                  multiplayerSocket={multiplayerSocket}
                  multiplayerRoomId={multiplayerRoomId}
                  onShareLink={handleShareLink}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        ) : (
          <AnimatePresence mode="wait">
            {pdfView === 'home' && (
              <motion.div key="pdf-home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                <PdfHome onStart={(format) => {
                  setPdfTargetFormat(format || 'pdf');
                  if (format === 'document') {
                    setPdfView('document-parser');
                  } else if (format === 'augment') {
                    setPdfView('augmenter');
                  } else {
                    setPdfView('parser');
                  }
                }} />
              </motion.div>
            )}
            {pdfView === 'document-parser' && (
              <motion.div key="document-parser" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                <DocumentParser 
                  onGenerate={(doc, settings) => {
                    setDocumentData(doc);
                    setDocumentSettings(settings);
                    setPdfView('document-viewer');
                  }} 
                />
              </motion.div>
            )}
            {pdfView === 'document-viewer' && documentData && (
              <motion.div key="document-viewer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                <DocumentViewer 
                  documentData={documentData} 
                  initialSettings={documentSettings}
                  onBack={() => {
                    setPdfView('home');
                    setDocumentSettings(undefined);
                  }} 
                />
              </motion.div>
            )}
            {pdfView === 'augmenter' && (
              <motion.div key="pdf-augmenter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                <PdfAugmenter 
                  onBack={() => setPdfView('home')} 
                  onComplete={(doc) => {
                    setPdfAugmentedDocument(doc);
                    setPdfView('augmented-viewer');
                  }} 
                />
              </motion.div>
            )}
            {pdfView === 'augmented-viewer' && (
              <motion.div key="pdf-augmented-viewer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                {pdfAugmentedDocument && (
                  <PdfAugmentedViewer 
                    document={pdfAugmentedDocument} 
                    onBack={() => setPdfView('home')} 
                    onSaveAugmentation={() => handleSaveAugmentation(pdfAugmentedDocument)}
                  />
                )}
              </motion.div>
            )}
            {pdfView === 'parser' && (
              <motion.div key="pdf-parser" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                <PdfParser onGenerate={(docs) => {
                  setPdfDocuments(docs);
                  setPdfView('viewer');
                }} />
              </motion.div>
            )}
            {pdfView === 'viewer' && (
              <motion.div key="pdf-viewer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                <PdfViewer documents={pdfDocuments} onBack={() => setPdfView('home')} setDarkMode={setDarkMode} pdfTheme={pdfTheme} setPdfTheme={setPdfTheme} isPhotoModeEnabled={isPhotoModeEnabled} setIsPhotoModeEnabled={setIsPhotoModeEnabled} onSavePdf={() => handleSavePdf(pdfDocuments)} appTheme={theme.visualStyle} onOpenGlobalThemes={() => setShowThemes(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
      
      <SuperheroClickEffect 
        active={theme.visualStyle === 'superhero'} 
        isHome={view === 'home'} 
        accentColor={theme.accentColor} 
        performanceMode={uiCustomization.performanceMode} 
        superheroAttackIndex={theme.superheroAttackIndex}
      />
      <EndermanTeleportEffect active={theme.visualStyle === 'game-minecraft' && theme.accentColor === 'enderman-purple'} isHome={view === 'home'} />
      <CreeperExplosionEffect active={theme.visualStyle === 'game-minecraft' && theme.accentColor === 'creeper-green'} isHome={view === 'home'} />
      <UndertaleClickEffect active={theme.visualStyle === 'undertale'} isHome={view === 'home'} accentColor={theme.accentColor} />
      <TadcClickEffect active={theme.visualStyle === 'tadc'} isHome={view === 'home'} accentColor={theme.accentColor} />
      <DuckClickEffect active={theme.visualStyle === 'duck'} isHome={view === 'home'} />
      
    </div>
    {theme.visualStyle === 'liquid-glass' && <LiquidGlassOverlay />}
    
    {/* Global Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-2xl border-2 flex items-center gap-3 backdrop-blur-xl"
            style={{
              backgroundColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(59, 130, 246, 0.9)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white'
            }}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
            <span className="font-bold tracking-tight">{toast.message}</span>
            <button 
              onClick={() => setToast(prev => ({ ...prev, visible: false }))}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

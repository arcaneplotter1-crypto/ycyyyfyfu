import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  Upload,
  Sparkles,
  RotateCcw,
  AlertCircle,
  FileText,
  ChevronLeft,
  Download,
  AlertTriangle,
  Code,
  Quote,
  Table as TableIcon,
  CheckCircle,
  ListOrdered,
  BookOpen,
  MoreVertical,
  Printer,
  Share2,
  Copy,
  X,
  Check,
  PlayCircle,
  Settings,
  List,
  DownloadCloud,
  Save,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Star,
  Info,
  Zap,
  Heart,
  ImagePlus,
  Trash2,
  MonitorPlay,
  Languages,
  Volume2,
  Search,
  CheckCircle2,
  MessageSquare,
  Sparkle,
  HelpCircle,
  XCircle,
  RefreshCw,
  Stethoscope,
  Brain,
  Lightbulb,
  Mic,
  Square,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronFirst,
  ChevronLast,
  Trophy,
  Image as ImageIcon,
  GraduationCap,
  Layers,
  Activity,
  Repeat,
  Microscope,
  Scissors,
  Highlighter,
  Underline as UnderlineIcon,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Box,
  Type,
  Loader2,
  Syringe,
  Pill,
  ShieldAlert,
  Dna,
  Skull,
  Palette,
} from "lucide-react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { PdfNativeExportButton } from "./components/PdfExport";
import {
  PdfDocument,
  PdfBlock,
  PdfAugmentation,
  PdfAugmentedDocument,
  OverlaySettings,
  DrawingPath,
  HighlightInfo,
  ToolMode,
} from "./types";
import { copyToClipboard } from "./utils";

export const OverlayPortal = ({ children }: { children: React.ReactNode }) => {
  return createPortal(children, document.body);
};

// Set worker source locally
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const cleanText = (text: string) => {
  if (!text) return "";
  return String(text)
    .replace(/\{\{(.*?)\|(.*?)\}\}/g, "$1")
    .replace(/!!(.*?)\|(.*?)!!/g, "$1")
    .replace(/>>(.*?)\|(.*?)<</g, "$1")
    .replace(/\(\((.*?)\|(.*?)\)\)/g, "$1")
    .replace(/\?\?(.*?)\|(.*?)\?\?/g, "$1")
    .replace(/@@([^|@]+)\|((?:[^@]|@(?!@))*)@@/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/§§(.*?)\|([\s\S]*?)§§/g, "$1");
};

export type ThemeColor =
  | "indigo"
  | "blue"
  | "emerald"
  | "rose"
  | "amber"
  | "purple"
  | "teal"
  | "pink"
  | "cyan"
  | "fuchsia"
  | "violet"
  | "sky"
  | "lime"
  | "orange"
  | "zinc"
  | "slate"
  | "red"
  | "yellow"
  | "mint"
  | "lavender"
  | "crimson"
  | "forest"
  | "midnight"
  | "gold"
  | "coral"
  | "aqua"
  | "plum"
  | "custom"
  | (string & {});

export interface PdfCustomTheme {
  enabled: boolean;
  logo?: string;
  customUploadedFont?: { name: string; dataUrl: string; fontFamilyName?: string };
  headingFont: string;
  bodyFont: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
  margins: number;
  contentGap: number;
}

export const fontPairs = [
  { name: "Modern Sans", heading: "Inter", body: "Inter" },
  { name: "Modern Serif", heading: "Playfair Display", body: "Inter" },
  {
    name: "Classic Editorial",
    heading: "Libre Baskerville",
    body: "Source Sans Pro",
  },
  { name: "Tech Minimal", heading: "Space Grotesk", body: "JetBrains Mono" },
  { name: "Elegant Sans", heading: "Outfit", body: "Plus Jakarta Sans" },
  { name: "Brutalist Mono", heading: "Syne", body: "Space Mono" },
];

export type PdfTheme = "modern" | "brutalist" | "liquid-glass";

export const getGradientPair = (colors: ThemeColor[], index: number): [ThemeColor, ThemeColor] => {
  if (colors.length === 0) return ['indigo', 'indigo'];
  if (colors.length === 1) return [colors[0], colors[0]];
  const startIdx = (index * 2) % colors.length;
  const isOdd = colors.length % 2 !== 0;
  let endIdx = (startIdx + 1) % colors.length;
  // wait, the user says "if I have 3 colors, red->green".
  // so if 3 colors:
  // idx = 0: start=0, end=1
  // idx = 1: start=2, end=0
  // startIdx is: index == 0 ? 0 : 2
  // index 2: start=1, end=2 (since startIdx = 4 % 3 = 1) -> ok!
  return [colors[startIdx], colors[endIdx]];
};

const colorThemesBase: Record<string, any> = {
  indigo: {
    text: "text-indigo-600 dark:text-indigo-300",
    bg: "bg-indigo-600",
    bgLight: "bg-indigo-50 dark:bg-indigo-900/30",
    border: "border-indigo-600",
    borderLight: "border-indigo-500/30",
    highlight: "bg-indigo-300 dark:bg-indigo-500/50",
    gradient: "from-indigo-500 to-indigo-600",
    shadow: "shadow-indigo-500/40",
    swatch: "bg-indigo-500",
  },
  blue: {
    text: "text-blue-600 dark:text-blue-300",
    bg: "bg-blue-600",
    bgLight: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-600",
    borderLight: "border-blue-500/30",
    highlight: "bg-blue-300 dark:bg-blue-500/50",
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/40",
    swatch: "bg-blue-500",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-300",
    bg: "bg-emerald-600",
    bgLight: "bg-emerald-50 dark:bg-emerald-900/30",
    border: "border-emerald-600",
    borderLight: "border-emerald-500/30",
    highlight: "bg-emerald-300 dark:bg-emerald-500/50",
    gradient: "from-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-500/40",
    swatch: "bg-emerald-500",
  },
  rose: {
    text: "text-rose-600 dark:text-rose-300",
    bg: "bg-rose-600",
    bgLight: "bg-rose-50 dark:bg-rose-900/30",
    border: "border-rose-600",
    borderLight: "border-rose-500/30",
    highlight: "bg-rose-300 dark:bg-rose-500/50",
    gradient: "from-rose-500 to-rose-600",
    shadow: "shadow-rose-500/40",
    swatch: "bg-rose-500",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-300",
    bg: "bg-amber-600",
    bgLight: "bg-amber-50 dark:bg-amber-900/30",
    border: "border-amber-600",
    borderLight: "border-amber-500/30",
    highlight: "bg-amber-300 dark:bg-amber-500/50",
    gradient: "from-amber-500 to-amber-600",
    shadow: "shadow-amber-500/40",
    swatch: "bg-amber-500",
  },
  purple: {
    text: "text-purple-600 dark:text-purple-300",
    bg: "bg-purple-600",
    bgLight: "bg-purple-50 dark:bg-purple-900/30",
    border: "border-purple-600",
    borderLight: "border-purple-500/30",
    highlight: "bg-purple-300 dark:bg-purple-500/50",
    gradient: "from-purple-500 to-purple-600",
    shadow: "shadow-purple-500/40",
    swatch: "bg-purple-500",
  },
  teal: {
    text: "text-teal-600 dark:text-teal-300",
    bg: "bg-teal-600",
    bgLight: "bg-teal-50 dark:bg-teal-900/30",
    border: "border-teal-600",
    borderLight: "border-teal-500/30",
    highlight: "bg-teal-300 dark:bg-teal-500/50",
    gradient: "from-teal-500 to-teal-600",
    shadow: "shadow-teal-500/40",
    swatch: "bg-teal-500",
  },
  pink: {
    text: "text-pink-600 dark:text-pink-300",
    bg: "bg-pink-600",
    bgLight: "bg-pink-50 dark:bg-pink-900/30",
    border: "border-pink-600",
    borderLight: "border-pink-500/30",
    highlight: "bg-pink-300 dark:bg-pink-500/50",
    gradient: "from-pink-500 to-pink-600",
    shadow: "shadow-pink-500/40",
    swatch: "bg-pink-500",
  },
  fuchsia: {
    text: "text-fuchsia-600 dark:text-fuchsia-300",
    bg: "bg-fuchsia-600",
    bgLight: "bg-fuchsia-50 dark:bg-fuchsia-900/30",
    border: "border-fuchsia-600",
    borderLight: "border-fuchsia-500/30",
    highlight: "bg-fuchsia-300 dark:bg-fuchsia-500/50",
    gradient: "from-fuchsia-500 to-fuchsia-600",
    shadow: "shadow-fuchsia-500/40",
    swatch: "bg-fuchsia-500",
  },
  violet: {
    text: "text-violet-600 dark:text-violet-300",
    bg: "bg-violet-600",
    bgLight: "bg-violet-50 dark:bg-violet-900/30",
    border: "border-violet-600",
    borderLight: "border-violet-500/30",
    highlight: "bg-violet-300 dark:bg-violet-500/50",
    gradient: "from-violet-500 to-violet-600",
    shadow: "shadow-violet-500/40",
    swatch: "bg-violet-500",
  },
  sky: {
    text: "text-sky-600 dark:text-sky-300",
    bg: "bg-sky-600",
    bgLight: "bg-sky-50 dark:bg-sky-900/30",
    border: "border-sky-600",
    borderLight: "border-sky-500/30",
    highlight: "bg-sky-300 dark:bg-sky-500/50",
    gradient: "from-sky-500 to-sky-600",
    shadow: "shadow-sky-500/40",
    swatch: "bg-sky-500",
  },
  lime: {
    text: "text-lime-600 dark:text-lime-300",
    bg: "bg-lime-600",
    bgLight: "bg-lime-50 dark:bg-lime-900/30",
    border: "border-lime-600",
    borderLight: "border-lime-500/30",
    highlight: "bg-lime-300 dark:bg-lime-500/50",
    gradient: "from-lime-500 to-lime-600",
    shadow: "shadow-lime-500/40",
    swatch: "bg-lime-500",
  },
  orange: {
    text: "text-orange-600 dark:text-orange-300",
    bg: "bg-orange-600",
    bgLight: "bg-orange-50 dark:bg-orange-900/30",
    border: "border-orange-600",
    borderLight: "border-orange-500/30",
    highlight: "bg-orange-300 dark:bg-orange-500/50",
    gradient: "from-orange-500 to-orange-600",
    shadow: "shadow-orange-500/40",
    swatch: "bg-orange-500",
  },
  cyan: {
    text: "text-cyan-600 dark:text-cyan-300",
    bg: "bg-cyan-600",
    bgLight: "bg-cyan-50 dark:bg-cyan-900/30",
    border: "border-cyan-600",
    borderLight: "border-cyan-500/30",
    highlight: "bg-cyan-300 dark:bg-cyan-500/50",
    gradient: "from-cyan-500 to-cyan-600",
    shadow: "shadow-cyan-500/40",
    swatch: "bg-cyan-500",
  },
  zinc: {
    text: "text-zinc-600 dark:text-zinc-300",
    bg: "bg-zinc-600",
    bgLight: "bg-zinc-50 dark:bg-zinc-900/30",
    border: "border-zinc-800",
    borderLight: "border-zinc-500/30",
    highlight: "bg-zinc-300 dark:bg-zinc-500/50",
    gradient: "from-zinc-700 to-zinc-800",
    shadow: "shadow-zinc-500/40",
    swatch: "bg-zinc-700",
  },
  slate: {
    text: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-600",
    bgLight: "bg-slate-50 dark:bg-slate-900/30",
    border: "border-slate-800",
    borderLight: "border-slate-500/30",
    highlight: "bg-slate-300 dark:bg-slate-500/50",
    gradient: "from-slate-700 to-slate-800",
    shadow: "shadow-slate-500/40",
    swatch: "bg-slate-700",
  },
  red: {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-600",
    bgLight: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-600",
    borderLight: "border-red-500/30",
    highlight: "bg-red-300 dark:bg-red-500/40",
    gradient: "from-red-500 to-red-600",
    shadow: "shadow-red-500/40",
    swatch: "bg-red-500",
  },
  yellow: {
    text: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500",
    bgLight: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-500",
    borderLight: "border-yellow-400/30",
    highlight: "bg-yellow-200 dark:bg-yellow-500/40",
    gradient: "from-yellow-400 to-yellow-500",
    shadow: "shadow-yellow-500/40",
    swatch: "bg-yellow-500",
  },
  mint: {
    text: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-400",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-400",
    borderLight: "border-emerald-300/30",
    highlight: "bg-emerald-100 dark:bg-emerald-500/30",
    gradient: "from-emerald-300 to-emerald-400",
    shadow: "shadow-emerald-400/30",
    swatch: "bg-emerald-400",
  },
  lavender: {
    text: "text-violet-500 dark:text-violet-300",
    bg: "bg-violet-400",
    bgLight: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-400",
    borderLight: "border-violet-300/30",
    highlight: "bg-violet-100 dark:bg-violet-500/30",
    gradient: "from-violet-300 to-violet-400",
    shadow: "shadow-violet-400/30",
    swatch: "bg-violet-400",
  },
  crimson: {
    text: "text-red-700 dark:text-red-500",
    bg: "bg-red-800",
    bgLight: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-800",
    borderLight: "border-red-700/30",
    highlight: "bg-red-200 dark:bg-red-500/30",
    gradient: "from-red-700 to-red-800",
    shadow: "shadow-red-800/40",
    swatch: "bg-red-800",
  },
  forest: {
    text: "text-emerald-900 dark:text-emerald-400",
    bg: "bg-emerald-900",
    bgLight: "bg-emerald-100 dark:bg-emerald-950/40",
    border: "border-emerald-900",
    borderLight: "border-emerald-800/40",
    highlight: "bg-emerald-200 dark:bg-emerald-800/30",
    gradient: "from-emerald-800 to-emerald-900",
    shadow: "shadow-emerald-900/50",
    swatch: "bg-emerald-900",
  },
  midnight: {
    text: "text-slate-900 dark:text-white",
    bg: "bg-slate-950",
    bgLight: "bg-slate-100 dark:bg-slate-900/40",
    border: "border-slate-950",
    borderLight: "border-slate-800/40",
    highlight: "bg-slate-300 dark:bg-slate-700/30",
    gradient: "from-slate-900 to-slate-950",
    shadow: "shadow-slate-900/50",
    swatch: "bg-slate-950",
  },
  gold: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-600",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-600",
    borderLight: "border-amber-500/30",
    highlight: "bg-amber-200 dark:bg-amber-500/30",
    gradient: "from-amber-500 to-amber-600",
    shadow: "shadow-amber-500/40",
    swatch: "bg-amber-600",
  },
  coral: {
    text: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-500",
    bgLight: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-500",
    borderLight: "border-orange-400/30",
    highlight: "bg-orange-100 dark:bg-orange-500/30",
    gradient: "from-orange-400 to-orange-500",
    shadow: "shadow-orange-400/30",
    swatch: "bg-orange-500",
  },
  aqua: {
    text: "text-cyan-500 dark:text-cyan-300",
    bg: "bg-cyan-400",
    bgLight: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-400",
    borderLight: "border-cyan-300/30",
    highlight: "bg-cyan-100 dark:bg-cyan-500/30",
    gradient: "from-cyan-300 to-cyan-400",
    shadow: "shadow-cyan-400/30",
    swatch: "bg-cyan-400",
  },
  plum: {
    text: "text-purple-900 dark:text-purple-400",
    bg: "bg-purple-900",
    bgLight: "bg-purple-100 dark:bg-purple-950/40",
    border: "border-purple-900",
    borderLight: "border-purple-800/40",
    highlight: "bg-purple-200 dark:bg-purple-800/30",
    gradient: "from-purple-800 to-purple-900",
    shadow: "shadow-purple-900/50",
    swatch: "bg-purple-950",
  },
  custom: {
    text: "",
    bg: "",
    bgLight: "",
    border: "",
    borderLight: "",
    highlight: "",
    gradient: "",
    shadow: "",
    swatch: "",
  },
};

export const colorThemes: Record<string, any> = new Proxy(colorThemesBase, {
  get(target, prop: string) {
    if (prop && prop.startsWith('custom-')) {
      return {
        text: `text-${prop}`,
        bg: `bg-${prop}`,
        bgLight: `bg-${prop}-light`,
        border: `border-${prop}`,
        borderLight: `border-${prop}-light`,
        highlight: `bg-${prop}-highlight`,
        gradient: `from-${prop}-start to-${prop}-end`,
        shadow: `shadow-${prop}`,
        swatch: `bg-${prop}`,
      };
    }
    return target[prop] || target['indigo'];
  }
});

const brutalistColorThemesBase: Record<string, any> = {
  indigo: {
    text: "text-black dark:text-white",
    bg: "bg-[#0000FF]",
    bgLight: "bg-[#0000FF]/10",
    bgMedium: "bg-[#3333FF]",
    accent: "bg-[#FFFF00]",
    secondary: "bg-[#00FFFF]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#0000FF] to-[#3333FF]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#0000FF]",
  },
  blue: {
    text: "text-black dark:text-white",
    bg: "bg-[#00FFFF]",
    bgLight: "bg-[#00FFFF]/10",
    bgMedium: "bg-[#33FFFF]",
    accent: "bg-[#FF00FF]",
    secondary: "bg-[#FFFF00]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#00FFFF] to-[#33FFFF]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#00FFFF]",
  },
  emerald: {
    text: "text-black dark:text-white",
    bg: "bg-[#00FF00]",
    bgLight: "bg-[#00FF00]/10",
    bgMedium: "bg-[#33FF33]",
    accent: "bg-[#FF0000]",
    secondary: "bg-[#0000FF]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#00FF00] to-[#33FF33]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#00FF00]",
  },
  rose: {
    text: "text-black dark:text-white",
    bg: "bg-[#FF00FF]",
    bgLight: "bg-[#FF00FF]/10",
    bgMedium: "bg-[#FF33FF]",
    accent: "bg-[#00FFFF]",
    secondary: "bg-[#FFFF00]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#FF00FF] to-[#FF33FF]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#FF00FF]",
  },
  amber: {
    text: "text-black dark:text-white",
    bg: "bg-[#FFFF00]",
    bgLight: "bg-[#FFFF00]/10",
    bgMedium: "bg-[#FFFF33]",
    accent: "bg-[#0000FF]",
    secondary: "bg-[#FF00FF]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#00FFFF]",
    gradient: "from-[#FFFF00] to-[#FFFF33]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#FFFF00]",
  },
  purple: {
    text: "text-black dark:text-white",
    bg: "bg-[#8000FF]",
    bgLight: "bg-[#8000FF]/10",
    bgMedium: "bg-[#9933FF]",
    accent: "bg-[#00FF00]",
    secondary: "bg-[#FFFF00]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#8000FF] to-[#9933FF]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#8000FF]",
  },
  teal: {
    text: "text-black dark:text-white",
    bg: "bg-[#008080]",
    bgLight: "bg-[#008080]/10",
    bgMedium: "bg-[#009999]",
    accent: "bg-[#FF8000]",
    secondary: "bg-[#FFFF00]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#008080] to-[#009999]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#008080]",
  },
  pink: {
    text: "text-black dark:text-white",
    bg: "bg-[#FF0080]",
    bgLight: "bg-[#FF0080]/10",
    bgMedium: "bg-[#FF3399]",
    accent: "bg-[#00FFFF]",
    secondary: "bg-[#FFFF00]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#FF0080] to-[#FF3399]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#FF0080]",
  },
  cyan: {
    text: "text-black dark:text-white",
    bg: "bg-[#00FFFF]",
    bgLight: "bg-[#00FFFF]/10",
    bgMedium: "bg-[#33FFFF]",
    accent: "bg-[#FF00FF]",
    secondary: "bg-[#FFFF00]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#00FFFF] to-[#33FFFF]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#00FFFF]",
  },
  fuchsia: {
    text: "text-black dark:text-white",
    bg: "bg-[#FF00FF]",
    bgLight: "bg-[#FF00FF]/10",
    bgMedium: "bg-[#FF33FF]",
    accent: "bg-[#00FFFF]",
    secondary: "bg-[#FFFF00]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#FF00FF] to-[#FF33FF]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#FF00FF]",
  },
  violet: {
    text: "text-black dark:text-white",
    bg: "bg-[#7F00FF]",
    bgLight: "bg-[#7F00FF]/10",
    bgMedium: "bg-[#9933FF]",
    accent: "bg-[#00FF00]",
    secondary: "bg-[#FFFF00]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#7F00FF] to-[#9933FF]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#7F00FF]",
  },
  sky: {
    text: "text-black dark:text-white",
    bg: "bg-[#00BFFF]",
    bgLight: "bg-[#00BFFF]/10",
    bgMedium: "bg-[#33CCFF]",
    accent: "bg-[#FF4500]",
    secondary: "bg-[#FFFF00]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#00BFFF] to-[#33CCFF]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#00BFFF]",
  },
  lime: {
    text: "text-black dark:text-white",
    bg: "bg-[#BFFF00]",
    bgLight: "bg-[#BFFF00]/10",
    bgMedium: "bg-[#CCFF33]",
    accent: "bg-[#0000FF]",
    secondary: "bg-[#FF00FF]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#0000FF]",
    gradient: "from-[#BFFF00] to-[#CCFF33]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#BFFF00]",
  },
  orange: {
    text: "text-black dark:text-white",
    bg: "bg-[#FF8000]",
    bgLight: "bg-[#FF8000]/10",
    bgMedium: "bg-[#FF9933]",
    accent: "bg-[#00FFFF]",
    secondary: "bg-[#0000FF]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#00FFFF]",
    gradient: "from-[#FF8000] to-[#FF9933]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#FF8000]",
  },
  zinc: {
    text: "text-black dark:text-white",
    bg: "bg-[#808080]",
    bgLight: "bg-[#808080]/10",
    bgMedium: "bg-[#999999]",
    accent: "bg-[#FFFF00]",
    secondary: "bg-[#000000]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#808080] to-[#999999]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#808080]",
  },
  slate: {
    text: "text-black dark:text-white",
    bg: "bg-[#1e293b]",
    bgLight: "bg-[#1e293b]/10",
    bgMedium: "bg-[#334155]",
    accent: "bg-[#FFFF00]",
    secondary: "bg-[#000000]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#1e293b] to-[#334155]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#1e293b]",
  },
  red: {
    text: "text-black dark:text-white",
    bg: "bg-[#FF0000]",
    bgLight: "bg-[#FF0000]/10",
    bgMedium: "bg-[#FF3333]",
    accent: "bg-[#00FFFF]",
    secondary: "bg-[#000000]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#FF0000] to-[#FF3333]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#FF0000]",
  },
  yellow: {
    text: "text-black dark:text-white",
    bg: "bg-[#FFFF00]",
    bgLight: "bg-[#FFFF00]/10",
    bgMedium: "bg-[#FFFF33]",
    accent: "bg-[#0000FF]",
    secondary: "bg-[#000000]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#00FFFF]",
    gradient: "from-[#FFFF00] to-[#FFFF33]",
    shadow:
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#FFFF00]",
  },
  mint: {
    text: "text-black dark:text-white",
    bg: "bg-[#7FFF00]",
    bgLight: "bg-[#7FFF00]/10",
    bgMedium: "bg-[#99FF33]",
    accent: "bg-[#FF00FF]",
    secondary: "bg-[#000000]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FF00FF]",
    gradient: "from-[#7FFF00] to-[#99FF33]",
    shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#7FFF00]",
  },
  lavender: {
    text: "text-black dark:text-white",
    bg: "bg-[#E6E6FA]",
    bgLight: "bg-[#E6E6FA]/10",
    bgMedium: "bg-[#CCCCFF]",
    accent: "bg-[#FFFF00]",
    secondary: "bg-[#000000]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#E6E6FA] to-[#CCCCFF]",
    shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#E6E6FA]",
  },
  crimson: {
    text: "text-white",
    bg: "bg-[#DC143C]",
    bgLight: "bg-[#DC143C]/10",
    bgMedium: "bg-[#FF3366]",
    accent: "bg-[#00FFFF]",
    secondary: "bg-[#000000]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#00FFFF]",
    gradient: "from-[#DC143C] to-[#FF3366]",
    shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#DC143C]",
  },
  forest: {
    text: "text-white",
    bg: "bg-[#228B22]",
    bgLight: "bg-[#228B22]/10",
    bgMedium: "bg-[#32CD32]",
    accent: "bg-[#FF8C00]",
    secondary: "bg-[#000000]",
    border: "border-black dark:border-white",
    borderLight: "border-black/40 dark:border-white/40",
    highlight: "bg-[#FF8C00]",
    gradient: "from-[#228B22] to-[#32CD32]",
    shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    swatch: "bg-[#228B22]",
  },
  midnight: {
    text: "text-white",
    bg: "bg-[#191970]",
    bgLight: "bg-[#191970]/10",
    bgMedium: "bg-[#252585]",
    accent: "bg-[#FFFF00]",
    secondary: "bg-[#000000]",
    border: "border-white",
    borderLight: "border-white/40",
    highlight: "bg-[#FFFF00]",
    gradient: "from-[#191970] to-[#252585]",
    shadow: "shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]",
    swatch: "bg-[#191970]",
  },
  gold: {
    text: "text-black",
    bg: "bg-[#FFD700]",
    bgLight: "bg-[#FFD700]/10",
    bgMedium: "bg-[#FFEC8B]",
    accent: "bg-[#0000FF]",
    secondary: "bg-[#000000]",
    border: "border-black",
    borderLight: "border-black/40",
    highlight: "bg-[#0000FF]",
    gradient: "from-[#FFD700] to-[#FFEC8B]",
    shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    swatch: "bg-[#FFD700]",
  },
  coral: {
    text: "text-black",
    bg: "bg-[#FF7F50]",
    bgLight: "bg-[#FF7F50]/10",
    bgMedium: "bg-[#FF8C69]",
    accent: "bg-[#00FFFF]",
    secondary: "bg-[#000000]",
    border: "border-black",
    borderLight: "border-black/40",
    highlight: "bg-[#00FFFF]",
    gradient: "from-[#FF7F50] to-[#FF8C69]",
    shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    swatch: "bg-[#FF7F50]",
  },
  aqua: {
    text: "text-black",
    bg: "bg-[#00FFFF]",
    bgLight: "bg-[#00FFFF]/10",
    bgMedium: "bg-[#70FFFF]",
    accent: "bg-[#FF00FF]",
    secondary: "bg-[#000000]",
    border: "border-black",
    borderLight: "border-black/40",
    highlight: "bg-[#FF00FF]",
    gradient: "from-[#00FFFF] to-[#70FFFF]",
    shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    swatch: "bg-[#00FFFF]",
  },
  plum: {
    text: "text-white",
    bg: "bg-[#DDA0DD]",
    bgLight: "bg-[#DDA0DD]/10",
    bgMedium: "bg-[#EE82EE]",
    accent: "bg-[#00FF00]",
    secondary: "bg-[#000000]",
    border: "border-black",
    borderLight: "border-black/40",
    highlight: "bg-[#00FF00]",
    gradient: "from-[#DDA0DD] to-[#EE82EE]",
    shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  }
};

export const brutalistColorThemes: Record<string, any> = new Proxy(brutalistColorThemesBase, {
  get(target, prop: string) {
    if (prop && prop.startsWith('custom-')) {
      return {
        text: "text-black dark:text-white",
        bg: `bg-${prop}`,
        bgLight: `bg-${prop}-light`,
        bgMedium: `bg-${prop}-medium`,
        accent: `bg-${prop}-accent`,
        secondary: `bg-${prop}-secondary`,
        border: "border-black dark:border-white",
        borderLight: "border-black/40 dark:border-white/40",
        highlight: `bg-${prop}-highlight`,
        gradient: `from-${prop}-start to-${prop}-end`,
        shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
        swatch: `bg-${prop}`,
      };
    }
    return target[prop] || target['indigo'];
  }
});

export const CustomColorStyles = ({ colors }: { colors: string[] }) => {
  return (
    <style dangerouslySetInnerHTML={{__html: colors.map(c => {
      if (!c.startsWith('custom-')) return '';
      const hex = '#' + c.replace('custom-', '');
      const bgLight = hex + '20'; // 12% opacity
      const borderLight = hex + '40';
      const shadowHex = hex + '66';
      
      return `
        .text-${c} { color: ${hex} !important; }
        .bg-${c} { background-color: ${hex} !important; }
        .bg-${c}-light { background-color: ${bgLight} !important; }
        .bg-${c}-medium { background-color: ${hex}CC !important; }
        .bg-${c}-accent { background-color: ${hex}99 !important; }
        .bg-${c}-secondary { background-color: ${hex}66 !important; }
        .border-${c} { border-color: ${hex} !important; }
        .border-${c}-light { border-color: ${borderLight} !important; }
        .bg-${c}-highlight { background-color: ${hex}40 !important; }
        .from-${c}-start { --tw-gradient-from: ${hex} !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(255, 255, 255, 0)) !important; }
        .to-${c}-end { --tw-gradient-to: ${hex} !important; }
        .shadow-${c} { box-shadow: 0 4px 14px 0 ${shadowHex} !important; }
      `;
    }).join('\n')}} />
  );
};

export const PdfHome = ({
  onStart,
}: {
  onStart: (format?: "pdf" | "augment" | "document") => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-12"
      >
        <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full" />
        <h1 className="relative text-6xl sm:text-8xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
          Document{" "}
          <span className="text-indigo-600 drop-shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            Engine
          </span>
        </h1>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
        <button
          onClick={() => onStart("pdf")}
          className="group relative px-10 py-6 bg-indigo-600 text-white font-black text-xl uppercase tracking-tighter rounded-[2rem] shadow-[0_8px_0_var(--color-indigo-900)] hover:shadow-[0_4px_0_var(--color-indigo-900)] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px] transition-all overflow-hidden flex items-center justify-center gap-4 min-w-[240px]"
        >
          <span className="relative z-10 flex items-center gap-3">
            <FileText className="w-6 h-6" />
            PDF MODE
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>

        <button
          onClick={() => onStart("augment")}
          className="group relative px-10 py-6 bg-emerald-600 text-white font-black text-xl uppercase tracking-tighter rounded-[2rem] shadow-[0_8px_0_#064e3b] hover:shadow-[0_4px_0_#064e3b] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px] transition-all overflow-hidden flex items-center justify-center gap-4 min-w-[240px]"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            AUGMENT MODE
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>

        <button
          onClick={() => onStart("document")}
          className="group relative px-10 py-6 bg-purple-600 text-white font-black text-xl uppercase tracking-tighter rounded-[2rem] shadow-[0_8px_0_#4c1d95] hover:shadow-[0_4px_0_#4c1d95] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px] transition-all overflow-hidden flex items-center justify-center gap-4 min-w-[240px]"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Layers className="w-6 h-6" />
            DOCUMENT MODE
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>
    </div>
  );
};

export const PdfParser = ({
  onGenerate,
}: {
  onGenerate: (docs: PdfDocument[]) => void;
}) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const match = content.match(
          /window\.jsonData\s*=\s*(\[[\s\S]*?\]);\s*[\s\S]*?document\.addEventListener/s,
        );
        if (match && match[1]) {
          const jsonStr = match[1].replace(/\\u003c/g, "<");
          const parsedDocs = JSON.parse(jsonStr);
          if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
            onGenerate(parsedDocs);
          } else {
            setError("No valid documents found in the uploaded document.");
          }
        } else {
          setError(
            "Could not find document data in the uploaded HTML file. Make sure it is an exported document.",
          );
        }
      } catch (err) {
        setError("Failed to parse the uploaded document file.");
      }
    };
    reader.readAsText(file);
    if (docFileInputRef.current) {
      docFileInputRef.current.value = "";
    }
  };

  const handleGenerate = () => {
    try {
      const trimmed = text.trim();

      // Helper to extract JSON objects from text, handling stacked objects and surrounding text
      const extractJsonObjects = (str: string) => {
        const objects: any[] = [];
        let depth = 0;
        let start = -1;
        let inString = false;
        let escape = false;

        for (let i = 0; i < str.length; i++) {
          const char = str[i];
          if (inString) {
            if (escape) {
              escape = false;
            } else if (char === "\\") {
              escape = true;
            } else if (char === '"') {
              inString = false;
            }
          } else {
            if (char === '"') {
              inString = true;
            } else if (char === "{") {
              if (depth === 0) start = i;
              depth++;
            } else if (char === "}") {
              depth--;
              if (depth === 0 && start !== -1) {
                try {
                  const objStr = str.substring(start, i + 1);
                  // Try to fix common JSON errors like trailing commas
                  const fixedObjStr = objStr.replace(/,\s*([}\]])/g, "$1");
                  const obj = JSON.parse(fixedObjStr);
                  if (obj && typeof obj === "object") {
                    objects.push(obj);
                  }
                } catch (e) {
                  console.warn("Failed to parse extracted JSON object:", e);
                }
                start = -1;
              }
            } else if (char === "[") {
              if (depth === 0) start = i;
              depth++;
            } else if (char === "]") {
              depth--;
              if (depth === 0 && start !== -1) {
                try {
                  const arrStr = str.substring(start, i + 1);
                  const fixedArrStr = arrStr.replace(/,\s*([}\]])/g, "$1");
                  const arr = JSON.parse(fixedArrStr);
                  if (Array.isArray(arr)) {
                    objects.push(...arr);
                  }
                } catch (e) {
                  console.warn("Failed to parse extracted JSON array:", e);
                }
                start = -1;
              }
            }
          }
        }
        return objects;
      };

      if (
        trimmed.startsWith("[") ||
        trimmed.startsWith("{") ||
        trimmed.includes("{")
      ) {
        let docs: any[] = [];
        try {
          // First try standard parsing, fixing trailing commas
          const fixedTrimmed = trimmed.replace(/,\s*([}\]])/g, "$1");
          let jsonToParse = fixedTrimmed;

          // Handle stacked JSON objects like }{ or } {
          if (fixedTrimmed.startsWith("{") && fixedTrimmed.endsWith("}")) {
            if (fixedTrimmed.match(/\}\s*\{/)) {
              jsonToParse = `[${fixedTrimmed.replace(/\}\s*\{/g, "},{")}]`;
            }
          }

          const parsed = JSON.parse(jsonToParse);
          docs = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // Fallback to robust extraction
          console.log(
            "Standard JSON parse failed, falling back to robust extraction",
            e,
          );
          docs = extractJsonObjects(trimmed);
        }

        if (Array.isArray(docs) && docs.length > 0) {
          // Filter out non-document objects
          const validDocs = docs.filter(
            (doc) => doc && doc.blocks && Array.isArray(doc.blocks),
          );
          if (validDocs.length > 0) {
            onGenerate(validDocs);
          } else {
            setError(
              'Found JSON objects, but they do not match the expected document format (missing "blocks" array).',
            );
          }
        } else {
          setError("Could not extract valid JSON documents from the input.");
        }
      } else {
        // Try CSV parsing
        const parsedCsv = parseCSV(trimmed);
        if (parsedCsv.length < 2) {
          setError(
            "Invalid CSV format. Must have headers and at least one row.",
          );
          return;
        }
        const headers = parsedCsv[0].map((h) =>
          h.toLowerCase().replace(/[^a-z0-9]/g, ""),
        );

        const groupIdx = headers.indexOf("group");
        const titleIdx = headers.indexOf("documenttitle");
        const typeIdx = headers.indexOf("blocktype");
        const contentIdx = headers.indexOf("content");
        const itemsIdx = headers.indexOf("items");
        const langIdx = headers.indexOf("language");
        const termIdx = headers.indexOf("term");
        const defIdx = headers.indexOf("definition");
        const colsIdx = headers.indexOf("columns");
        const rowsIdx = headers.indexOf("rows");
        const imgUrlIdx = headers.indexOf("imageurl");
        const imgCapIdx = headers.indexOf("imagecaption");

        if (titleIdx === -1 || typeIdx === -1) {
          setError("CSV must contain DocumentTitle and BlockType columns.");
          return;
        }

        const docsMap = new Map<string, PdfDocument>();

        for (let i = 1; i < parsedCsv.length; i++) {
          const row = parsedCsv[i];
          if (row.length === 0 || (row.length === 1 && !row[0])) continue;

          const title = row[titleIdx] || "Untitled Document";
          const group = groupIdx !== -1 ? row[groupIdx] : undefined;
          const docKey = `${group || "Ungrouped"}-${title}`;
          const type = row[typeIdx] as any;

          if (!docsMap.has(docKey)) {
            docsMap.set(docKey, { title, group, blocks: [] });
          }

          const block: any = { type };
          if (contentIdx !== -1 && row[contentIdx])
            block.content = row[contentIdx];
          if (langIdx !== -1 && row[langIdx]) block.language = row[langIdx];
          if (termIdx !== -1 && row[termIdx]) block.term = row[termIdx];
          if (defIdx !== -1 && row[defIdx]) block.definition = row[defIdx];
          if (imgUrlIdx !== -1 && row[imgUrlIdx])
            block.imageUrl = row[imgUrlIdx];
          if (imgCapIdx !== -1 && row[imgCapIdx])
            block.imageCaption = row[imgCapIdx];

          try {
            if (itemsIdx !== -1 && row[itemsIdx])
              block.items = JSON.parse(row[itemsIdx]);
            if (colsIdx !== -1 && row[colsIdx])
              block.columns = JSON.parse(row[colsIdx]);
            if (rowsIdx !== -1 && row[rowsIdx])
              block.rows = JSON.parse(row[rowsIdx]);
          } catch (e) {
            console.warn("Failed to parse JSON in CSV column for row", i);
          }

          docsMap.get(docKey)!.blocks.push(block);
        }

        onGenerate(Array.from(docsMap.values()));
      }
    } catch (e) {
      setError("Invalid format. Please ensure your JSON/CSV is valid.");
    }
  };

  function parseCSV(csv: string) {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentVal = "";
    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];
      if (inQuotes) {
        if (char === '"') {
          if (csv[i + 1] === '"') {
            currentVal += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          currentVal += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          row.push(currentVal);
          currentVal = "";
        } else if (char === "\n") {
          row.push(currentVal);
          result.push(row);
          row = [];
          currentVal = "";
        } else if (char !== "\r") {
          currentVal += char;
        }
      }
    }
    if (currentVal || csv[csv.length - 1] === ",") {
      row.push(currentVal);
    }
    if (row.length > 0) {
      result.push(row);
    }
    return result;
  }

  const loadSample = () => {
    const sample = JSON.stringify(
      [
        {
          group: "Medical Sciences",
          title: "Cardiovascular Physiology & Anatomy",
          blocks: [
            { type: "heading", content: "1. The Heart: An Overview" },
            { type: "subheading", content: "Cardiac Chambers and Internal Structures" },
            {
              type: "paragraph",
              content:
                "The heart is a complex muscular organ responsible for pumping blood throughout the body. It consists of **four chambers**: two atria and two ventricles. The flow of blood is regulated by valves that ensure a one-way circuit. §§Teacher|The heart is the central muscular organ of the cardiovascular system. It is uniquely composed of cardiac muscle, which never tires. The heart functions as a sophisticated dual pump. The right side receives oxygen-poor blood from the body and pumps it to the lungs. The left side receives oxygen-rich blood from the lungs and forcefully ejects it to the rest of the body. To accomplish this, the mammalian heart uses four distinct chambers: the right atrium and right ventricle, and the left atrium and left ventricle. Between these chambers and the major vessels are specialized valves (tricuspid, pulmonary, mitral, aortic) that act as one-way doors, snapping shut to prevent any backflow of blood, thereby maintaining a highly efficient, unidirectional flow.|**Chambers:** 4 total (2 atria receive, 2 ventricles pump out). **Valves:** Ensure one-way traffic. **Function:** Relentless muscular pump.|F::Why does the heart have atria and ventricles?::To separate low-pressure receiving and high-pressure pumping.|The evolutionary development of the four-chambered heart is a fascinating topic. Lower vertebrates like fish have a simple two-chambered heart, while amphibians have three. The four-chambered design in birds and mammals ensures that oxygenated and deoxygenated blood never mix. This highly efficient system supports the high metabolic rates required for endothermy (warm-bloodedness). Additionally, the heart's muscle cells (cardiomyocytes) are connected by specialized junctions called intercalated discs, allowing them to contract synchronously as a single functional unit.§§",
            },
            {
              type: "clinical_correlation",
              content:
                "Understanding the cardiac cycle is essential for diagnosing conditions like **Atrial Fibrillation** or **Heart Failure**. The efficiency of the left ventricle is often measured by the *Ejection Fraction*. §§Teacher|The cardiac cycle comprises everything that happens during one single heartbeat, specifically the sequence of electrical and mechanical events (systole and diastole). Atrial fibrillation (Afib) is a condition where the electrical signals in the atria become chaotic, causing the atria to quiver instead of contracting effectively. This can lead to blood pooling and forming clots, which might cause a stroke. Heart Failure does not mean the heart stops, but rather that it's failing to pump adequately to meet the body's needs. Ejection Fraction is the primary metric we use here: it measures the percentage of blood leaving your heart each time it contracts. An Ejection Fraction of 60% means 60% of the total amount of blood in the left ventricle is pushed out with each heartbeat.|**Cardiac Cycle:** One complete heartbeat. **Afib:** Chaotic atrial rhythm. **Heart Failure:** Inadequate pumping. **Ejection Fraction:** % of blood pumped per beat.|M::What does a 50% ejection fraction indicate?::Superb function::Borderline/Reduced function::Death::No blood is pumping::1|It's vitally important to understand that there are two main types of Heart Failure: Systolic and Diastolic. Systolic heart failure (reduced ejection fraction) means the heart muscle is weak and can't squeeze properly. Diastolic heart failure (preserved ejection fraction) means the heart muscle is stiff and can't relax to fill with enough blood. Both lead to similar symptoms (like fluid backing up into the lungs), but the underlying mechanics and treatments are quite different. Heart failure often triggers biological compensatory mechanisms, such as sympathetic nervous system activation and the Renin-Angiotensin-Aldosterone System (RAAS), which initially help but ultimately worsen the heart's condition over time.§§",
            },
            {
              type: "high_yield",
              content:
                "The **SA Node** (Sinoatrial Node) is the natural pacemaker of the heart, located in the right atrium. It initiates the electrical impulse for each heartbeat. §§Teacher|The Sinoatrial (SA) Node is a microscopic cluster of specialized, self-exciting cells nestled in the upper wall of the right atrium. Unlike regular muscle cells, these pacemaking cells possess a property called 'automaticity,' meaning they can spontaneously generate electrical impulses without any external nervous input. The SA node sets the heart's rhythm, firing at an intrinsic rate of about 60-100 beats per minute. When it fires, a wave of depolarization sweeps across the atria, causing them to contract and push blood down into the ventricles. This electrical spark is the very beginning of the cardiac cycle.|**SA Node:** The true natural pacemaker. **Location:** Right atrium. **Function:** Initiates every single heartbeat. **Property:** Automaticity (spontaneous firing).|F::What is automaticity?::The ability to spontaneously generate electrical impulses without external input.|While the SA node is the primary pacemaker, the heart has built-in backup systems. If the SA node fails, the Atrioventricular (AV) node can take over, but at a slower intrinsic rate of 40-60 beats per minute. If the AV node also fails, the Purkinje fibers in the ventricles can generate an escape rhythm, but at a life-threateningly slow rate of 20-40 beats per minute. Furthermore, the SA node's rate is heavily regulated by the autonomic nervous system: sympathetic stimulation (norepinephrine) increases the rate (tachycardia), while parasympathetic stimulation (vagus nerve releasing acetylcholine) slows it down (bradycardia).§§",
            },
            {
              type: "example",
              content:
                "Think of the heart as a dual-pump system. The right side pumps deoxygenated blood to the lungs (Pulmonary Circuit), while the left side pumps oxygenated blood to the rest of the body (Systemic Circuit). §§Teacher|The cardiovascular system is brilliantly split into two continuous loops. The RIGHT side of the heart is dedicated to the Pulmonary Circuit: it receives dark, oxygen-depleted blood from the body via the vena cavae, and pumps it out through the pulmonary artery to the lungs, where it drops off carbon dioxide and picks up fresh oxygen. The LEFT side of the heart manages the Systemic Circuit: it receives this bright red, oxygen-rich blood from the lungs via the pulmonary veins and pumps it out forcefully through the mighty aorta to nourish every single cell in the body. The left ventricle is significantly thicker and more muscular than the right because it must generate enough pressure to overcome systemic vascular resistance and reach the toes, whereas the lungs are right next door and offer low resistance.|**Two Circuits:** Pulmonary (lungs) & Systemic (body). **Right Heart:** Handles O2-poor blood, low pressure. **Left Heart:** Handles O2-rich blood, high pressure.|M::Which ventricle has more muscle mass?::Right Ventricle::Left Ventricle::They are equal::Neither::1|A fascinating consequence of this dual-circuit design is how congenital heart defects affect babies. In conditions like a Ventricular Septal Defect (VSD) - a 'hole in the heart' between the ventricles - blood typically shunts from the high-pressure left side to the low-pressure right side. This means oxygenated blood recycles unnecessarily through the lungs, causing heart murmurs and eventually leading to pulmonary hypertension and heart failure if left unfixed. Interestingly, before birth, the fetal circulation bypasses the non-functioning lungs using two shunts: the foramen ovale (between atria) and the ductus arteriosus (connecting the pulmonary artery to the aorta). These normally close right after the first breath.§§",
            },
            {
              type: "explanation",
              content:
                "Depolarization of the heart muscle cells leads to contraction (systole), while repolarization leads to relaxation (diastole). This electrical activity is what we measure with an ECG. §§Teacher|To understand heart function, you must grasp the link between electricity and muscle mechanics. An electrical current (Depolarization) sweeps through the heart cells, causing a sudden influx of calcium ions, which triggers the actin and myosin filaments inside the cells to slide together and produce mechanical Contraction (Systole). Once the impulse passes, the cells electrically reset themselves (Repolarization), pumping calcium back out, which allows the muscle fibers to physically uncouple and Relax (Diastole). An Electrocardiogram (ECG or EKG) uses electrodes on the skin to detect these massive waves of electricity. The P wave is atrial depolarization, the QRS complex is massive ventricular depolarization, and the T wave is ventricular repolarization.|**Depolarization:** Electrical trigger for muscle contraction. **Systole:** The physical squeeze. **Repolarization:** Electrical reset. **Diastole:** The resting, filling phase. **ECG:** Measures these waves.|F::What do ECG waves correlate with?::Electrical depolarization and repolarization, which trigger mechanical systole and diastole.|An ECG doesn't actually measure muscle contraction; it strictly measures electrical voltage over time. You can actually have normal-looking electrical activity on a monitor but virtually no mechanical pumping by the heart—a terrifying, fatal state known as Pulseless Electrical Activity (PEA). The action potential of a cardiac muscle cell is also entirely unique. Unlike a quick nerve impulse, the cardiac action potential has a prolonged 'plateau phase' maintained by slow calcium channels. This plateau extends the refractory period (the time it cannot be stimulated again), preventing the heart from going into tetany (sustained, locked contraction) which would stop it from pumping.§§",
            },
            {
              type: "tip",
              content:
                "Remember the mnemonic **'A' for Artery** (vessels that carry blood *Away* from the heart) and **'V' for Vein** (vessels that carry blood *to* the heart). §§Teacher|This is the most fundamental rule of vascular anatomy: Arteries ALWAYS carry blood away from the heart, and Veins ALWAYS carry blood toward the heart. A common misconception is that arteries only carry oxygenated blood and veins only carry deoxygenated blood. This is false! In the systemic circulation, arteries do carry oxygen-rich blood. However, in the pulmonary circulation, it's reversed: the pulmonary artery carries oxygen-poor blood away from the right ventricle to the lungs, while the pulmonary veins proudly carry bright red, oxygen-rich blood from the lungs back to the left atrium.|**Arteries:** Away from heart. **Veins:** Volume returning to heart. **Exception Rule:** Pulmonary vessels flip the oxygenation script.|F::Do all arteries carry oxygen-rich blood?::No, the pulmonary artery carries oxygen-poor blood.|Arteries and veins are structurally adapted for their roles. Arteries face the full brunt of the heart's pressure wave; therefore, they possess thick, elastic, muscular walls that expand and recoil (which is what you feel when taking a pulse). Veins operate under very low pressure, so their walls are thinner and highly compliant, allowing them to act as blood reservoirs (capacitance vessels). Because venous pressure is so low, especially in the legs, veins contain specialized one-way valves. When skeletal muscles in your legs contract while walking, they squeeze these veins, acting as a 'muscle pump' to push blood upward against gravity, while the valves slam shut to prevent it from sliding back down.§§",
            },
            {
              type: "dialogue",
              content:
                "Doctor: 'How long have you been feeling this shortness of breath?'\nPatient: 'It started about two weeks ago, especially when I climb stairs.' §§Teacher|This clinical vignette perfectly illustrates 'Dyspnea on exertion' (shortness of breath during physical activity). It's a classic hallmark of congestive heart failure. When the left heart fails to pump blood forward efficiently, fluid pressure backs up into the pulmonary circulation (the lungs). The delicate air sacs (alveoli) become congested with fluid (pulmonary edema). Because oxygen cannot easily diffuse through this fluid, the patient feels profoundly breathless, especially when physical exertion demands more oxygen. Asking 'how far can you walk without stopping?' is a vital diagnostic question for doctors evaluating heart failure severity.|**Dyspnea:** Shortness of breath. **Exertional Link:** A key sign of a failing pump. **Mechanism:** Fluid backing up into the fragile lung tissues.|M::Why does left heart failure cause breathlessness?::Lack of oxygen in blood::Fluid backups into lungs (pulmonary edema)::Increased heart rate::Muscle cramps::1|In diagnosing heart failure, cardiologists look for other tell-tale symptoms. Beyond dyspnea on exertion, patients often experience Orthopnea: severe breathlessness when lying flat. When lying down, blood volume shifts from the legs back to the central circulation, overwhelming the failing heart and rapidly flooding the lungs. This is why heart failure patients often sleep propped up on three pillows or in a recliner. Another specific symptom is Paroxysmal Nocturnal Dyspnea (PND)—waking up in the middle of the night gasping for air. To combat fluid overload, these patients are heavily reliant on powerful diuretic medications ('water pills') to force the kidneys to excrete the excess fluid.§§",
            },
            {
              type: "reference",
              content:
                "Source: *Guyton and Hall Textbook of Medical Physiology, 14th Edition* §§Teacher|This specific textbook, Guyton and Hall, is considered one of the foremost, most respected physiology texts in global medical education. It is renowned for its unparalleled depth in cardiovascular physiology, largely because the original author, Arthur Guyton, revolutionized our understanding of how the heart relies on venous return and total peripheral resistance. Citing authoritative sources like this isn't just about giving credit; in medical science, referencing seminal texts establishes the bedrock truth upon which clinical decisions are made over decades of study.|**Guyton & Hall:** The gold standard of medical physiology. **Arthur Guyton:** A pioneer in cardiac output research.|F::Who wrote the foundational text of medical physiology?::Arthur Guyton|Arthur Guyton's contributions are legendary. He proved that the heart itself does not solely dictate cardiac output; rather, it is the peripheral circulation and venous return that primarily dictate how much blood the heart will pump. He mathematically mapped this out using complex systems analysis, creating 'Guyton's Curves'. Astonishingly, Guyton suffered severe paralysis from polio in the 1950s, losing the use of his arms and legs. Despite this, he invented numerous medical devices, including the motorized wheelchair and special hoists, and went on to write the first edition of this textbook entirely by himself, dictating to his wife, profoundly shaping modern medical science.§§",
            },
            { type: "heading", content: "2. Interactive Anatomy & Terms" },
            {
              type: "paragraph",
              content:
                "Let's explore some interactive terms. The {{Myocardium|The muscular tissue of the heart}} is responsible for the actual pumping action. The ^^Aorta|ay-OR-tah^^ is the largest artery in the body. §§Teacher|Myocardium is the muscle. Aorta is the main artery.|Myocardium = muscle. Aorta = big artery.|M::What is the largest artery?::Vena Cava::Aorta::Pulmonary Artery::Carotid::1|The myocardium requires a constant supply of oxygenated blood.§§",
            },
            {
              type: "paragraph",
              content:
                "We can also look at corrections: The heart has ~~three|four~~ chambers. And translations: The heart (%%Cor|Latin for heart%%) is a vital organ. §§Teacher|The human heart has four chambers, not three. 'Cor' is Latin for heart.|Four chambers, Cor = Heart.|F::How many chambers does the human heart have?::Four (2 atria, 2 ventricles)|Reptiles usually have a three-chambered heart.§§",
            },
            {
              type: "paragraph",
              content:
                "For a deep dive: The **Bundle of His|A collection of heart muscle cells specialized for electrical conduction that transmits the electrical impulses from the AV node to the point of the apex of the fascicular branches via the bundle branches.** is crucial for conduction. §§Teacher|The Bundle of His transmits electrical impulses from the AV node to the ventricles.|Bundle of His = AV node to ventricles.|M::What does the Bundle of His connect?::SA Node to AV Node::AV Node to Ventricles::Atria to Ventricles directly::Right to Left Atrium::1|Bundle branch blocks occur when this pathway is interrupted.§§",
            },
            {
              type: "paragraph",
              content:
                "((Star|Important)) **Reveal Answer**: Which valve separates the left atrium from the left ventricle? !!Click to reveal|The Mitral (Bicuspid) Valve!! §§Teacher|The mitral valve, also known as the bicuspid valve, separates the left atrium and left ventricle.|Mitral/Bicuspid = Left atrium to left ventricle.|F::Which valve separates the left atrium and left ventricle?::The Mitral (Bicuspid) Valve|Mitral valve prolapse is a common valvular abnormality.§§",
            },
            {
              type: "paragraph",
              content:
                ">>The History of the Stethoscope|The stethoscope was invented in France in 1816 by René Laennec at the Necker-Enfants Malades Hospital in Paris. It consisted of a wooden tube and was monaural. Laennec invented the stethoscope because he was not comfortable placing his ear directly onto a woman's chest to listen to her heart.<< §§Teacher|René Laennec invented the stethoscope in 1816 because placing an ear against a patient's chest was inappropriate and sometimes ineffective.|Laennec invented stethoscope in 1816.|M::Who invented the stethoscope?::Rene Laennec::Louis Pasteur::Marie Curie::Florence Nightingale::0|Modern stethoscopes are binaural and have a bell and diaphragm for different frequencies.§§",
            },
            {
              type: "paragraph",
              content:
                "??Cardiac Output|Cardiac output (CO) is the amount of blood pumped by the heart per minute. It is the product of the heart rate (HR), which is the number of heartbeats per minute, and the stroke volume (SV), which is the amount of blood pumped from the ventricle with each beat. CO = HR × SV.?? Click to see the full breakdown. §§Teacher|Cardiac output is Stroke Volume multiplied by Heart Rate. It measures how effectively the heart pumps blood per minute.|CO = HR × SV.|F::What is the formula for Cardiac Output (CO)?::CO = Heart Rate (HR) × Stroke Volume (SV)|A normal cardiac output for an adult at rest is roughly 5 liters per minute.§§",
            },
            {
              type: "paragraph",
              content:
                "@@Echocardiogram|An ultrasound of the heart used to visualize its structure and function.@@ Click to upload an example scan! §§Teacher|An echocardiogram uses sound waves to create moving pictures of the heart.|Echocardiogram = heart ultrasound.|M::What uses ultrasound for the heart?::CT Scan::MRI::Echocardiogram::X-Ray::2|Doppler echocardiography can also measure the speed and direction of blood flow.§§",
            },
            {
              type: "vocabulary",
              term: "Systole",
              definition:
                "The phase of the heartbeat when the heart muscle contracts and pumps blood from the chambers into the arteries. §§Teacher|Systole is the active contraction phase of the cardiac cycle.|Systole = Contraction.|F::What is the contraction phase called?::Systole|During systole, the blood pressure in the arteries reaches its peak, known as systolic blood pressure.§§",
            },
            {
              type: "disease",
              title: "Myocardial Infarction",
              children: [
                {
                  type: "text",
                  subType: "Definition",
                  content: "A myocardial infarction (MI), commonly known as a heart attack, occurs when blood flow decreases or stops to a part of the heart, causing damage to the heart muscle. §§Teacher|A myocardial infarction, or heart attack, is the irreversible death of heart muscle due to a lack of oxygenated blood flow.|MI = Heart attack (muscle death).|M::Another name for a myocardial infarction is:::Stroke::Heart Attack::Aneurysm::Arrhythmia::1|The term 'infarction' means tissue death (necrosis) due to inadequate blood supply.§§"
                },
                {
                  type: "text",
                  subType: "Classification",
                  content: "- **STEMI**: ST-segment elevation myocardial infarction (transmural).\n- **NSTEMI**: Non-ST-segment elevation myocardial infarction (subendocardial). §§Teacher|MIs are classified typically by ECG findings into STEMI (full thickness damage) and NSTEMI (partial thickness).|STEMI = transmural, NSTEMI = subendocardial.|F::What does STEMI stand for?::ST-segment Elevation Myocardial Infarction|STEMI usually requires immediate reperfusion therapy like PCI.§§"
                },
                {
                  type: "text",
                  subType: "Etiology",
                  content: "Most commonly caused by acute thrombus formation at the site of a ruptured atherosclerotic plaque. Less commonly caused by coronary artery spasm. §§Teacher|The most common cause is a blood clot forming on a ruptured cholesterol plaque in a coronary artery.|Cause: thrombus on ruptured plaque.|M::What typically causes blood flow to stop in an MI?::Atherosclerotic plaque rupture with thrombus::Low blood pressure::High blood sugar::Dehydration::0|Prinzmetal's angina involves coronary artery spasms that can mimic MI symptoms.§§"
                },
                {
                  type: "text",
                  subType: "Clinical Features",
                  content: "Sudden onset of severe, crushing chest pain that radiates. Patients typically appear pale, diaphoretic, and in significant distress. §§Teacher|Patients often present with crushing chest pain, sweating, and pale skin.|Symptoms: sudden crushing pain, sweating.|F::What are classic signs of an MI presentation?::Pale, diaphoretic, severe chest pain.|The pain is often described as 'an elephant sitting on the chest' (Levine's sign).§§"
                },
                {
                  type: "text",
                  subType: "Signs",
                  content: "- Diaphoresis\n- Tachycardia or bradycardia\n- Gallop rhythm (S4)\n- Hypotension/Shock §§Teacher|Signs include sweating, abnormal heart rates, extra heart sounds, or shock.|Signs: sweating, abnormal HR, shock.|M::What is diaphoresis?::High fever::Profuse sweating::Dry skin::Blue skin::1|An S4 gallop is often heard due to a stiff, non-compliant left ventricle.§§"
                },
                {
                  type: "text",
                  subType: "Symptoms",
                  content: "- Chest pain or discomfort (angina) which may travel into the shoulder, arm, back, neck, or jaw.\n- Shortness of breath.\n- Nausea, feeling faint, a cold sweat, or feeling tired. §§Teacher|Symptoms can radiate to the arm or jaw and include shortness of breath and nausea.|Symptoms: radiating pain, dyspnea, nausea.|F::Where can MI chest pain radiate?::Shoulder, arm, back, neck, or jaw.|Women and elderly patients may present with atypical symptoms like unexplained fatigue.§§"
                },
                {
                  type: "text",
                  subType: "Diagnosis",
                  content: "- **ECG**: ST elevation, T wave inversion, or new LBBB.\n- **Biomarkers**: Elevated Troponin I or T, CK-MB. §§Teacher|Diagnosis relies on an ECG showing specific changes and blood tests for cardiac biomarkers like Troponin.|Diagnosis: ECG and Troponin.|M::Which biomarker is most specific for cardiac damage?::AST::Troponin::Amylase::Lipase::1|Serial troponin measurements are essential as levels peak later and remain elevated for days.§§"
                },
                {
                  type: "text",
                  subType: "Differential Diagnosis",
                  content: "- Aortic Dissection\n- Pulmonary Embolism\n- Acute Pericarditis\n- Gastroesophageal Reflux §§Teacher|Other serious conditions can mimic an MI, so they must be ruled out.|Differentials: Dissection, PE, Pericarditis, GERD.|F::Name a condition mimicking an MI.::Aortic Dissection (and others like PE, Pericarditis)|Aortic dissection is often described as a 'tearing' pain radiating to the back.§§"
                },
                {
                  type: "text",
                  subType: "Management",
                  content: "Immediate hospital admission, preferably to an intensive care or coronary care unit. Continuous ECG monitoring and symptom relief. §§Teacher|Patients require immediate hospitalization with cardiac monitoring.|Management: ICU/CCU, ECG monitoring.|M::Ideally, where is an MI patient admitted?::General Medical Floor::Psychiatric Ward::ICU or Coronary Care Unit::Outpatient Clinic::2|Continuous telemetry is vital to catch fatal arrhythmias before they cause cardiac arrest.§§"
                },
                {
                  type: "text",
                  subType: "Treatment",
                  content: "- **Initial**: Aspirin, Nitroglycerin, Oxygen (if sats low), Morphine.\n- **Reperfusion**: Percutaneous Coronary Intervention (PCI) or Thrombolytic therapy. §§Teacher|Initial treatment includes aspirin and nitroglycerin. The definitive treatment is reperfusion via PCI or drugs.|Mnemonic: MONA (Morphine, Oxygen, Nitroglycerin, Aspirin).|F::What does PCI stand for?::Percutaneous Coronary Intervention|PCI, commonly known as stenting, is the preferred reperfusion strategy if available quickly.§§"
                },
                {
                  type: "text",
                  subType: "Complications",
                  content: "- Arrhythmias (e.g., Ventricular fibrillation)\n- Heart failure\n- Cardiogenic shock\n- Ventricular wall rupture §§Teacher|Complications can be fatal, including dangerous rhythms or heart failure.|Complications: arrhythmias, shock, failure.|M::What is a fatal arrhythmia commonly seen post-MI?::Sinus Tachycardia::Ventricular Fibrillation::Atrial Flutter::Premature Atrial Contractions::1|Ventricular wall rupture typically occurs 3-5 days post-infarct due to macrophage-mediated tissue softening.§§"
                },
                {
                  type: "text",
                  subType: "Risk Factors",
                  content: "- Age, male gender\n- Smoking\n- Hypertension\n- Hyperlipidemia\n- Diabetes mellitus\n- Family history §§Teacher|Risk factors include smoking, high blood pressure, cholesterol, diabetes, and family history.|Risk factors: Smoking, HTN, Diabetes, Lipids.|F::Which risk factors are modifiable?::Smoking, hypertension, hyperlipidemia, diabetes.|Managing these risk factors is the cornerstone of primary and secondary prevention.§§"
                },
                {
                  type: "text",
                  subType: "Exam Traps & Keys",
                  content: "1. **The Silent MI**: Women, diabetics, and elderly patients often lack chest pain; look for 'dyspnea on exertion' or unexplained fatigue.\n2. **Time is Muscle**: Reperfusion within the 'Golden Hour' (first 60-90 mins) is the single most important prognostic factor.\n3. **Normal ECG?**: A normal initial ECG does NOT rule out MI; repeat serial ECGs and check high-sensitivity Troponins. §§Teacher|Always remember these clinical pearls for exams, especially regarding atypical presentations and rapid intervention.|Pearls: Silent MI, Time is Muscle, Serial ECGs.|M::Does a normal initial ECG rule out an MI?::Yes, absolutely.::No, repeat ECGs and biomarkers are needed.::Yes, if the patient has no pain.::Yes, if the patient is young.::1|A 'silent MI' may only be discovered years later on a routine ECG showing a pathological Q wave.§§"
                }
              ]
            },
            {
              type: "table",
              columns: ["Chamber", "Inflow", "Outflow"],
              rows: [
                ["Right Atrium", "Vena Cava", "Tricuspid Valve"],
                ["Right Ventricle", "Tricuspid Valve", "Pulmonary Valve"],
                ["Left Atrium", "Pulmonary Veins", "Mitral Valve"],
                ["Left Ventricle", "Mitral Valve", "Aortic Valve §§Teacher|The left ventricle pumps to the aorta.|Left ventricle -> Aortic Valve.|F::Which valve does the left ventricle pump through?::The Aortic Valve|The aortic valve has three leaflets.§§"],
              ],
            },
            {
              type: "step",
              items: [
                "Electrical impulse starts at the **SA Node**.",
                "Impulse travels through the atria causing contraction.",
                "Impulse reaches the **AV Node** where it is slightly delayed.",
                "Impulse travels down the **Bundle of His** and **Purkinje Fibers**.",
                "Ventricles contract, pumping blood out. §§Teacher|These steps outine the cardiac conduction pathway.|Conduction: SA -> AV -> Bundle of His -> Purkinje.|M::Where does the cardiac electrical impulse start?::AV Node::Purkinje Fibers::SA Node::Bundle of His::2|The AV delay allows atria to fully empty into ventricles.§§",
              ],
            },
            {
              type: "list",
              items: [
                "((Check|Done)) Anatomy Review",
                "((Zap|Fast)) Physiology Overview",
                "((Info|Note)) Clinical Correlations",
                "??What is the natural pacemaker of the heart?|AV Node|SA Node|Bundle of His|1?? §§Teacher|This list summarizes our review modules and tests knowledge.|Review: Anatomy, Physio, Clinical.|F::What section covers diseases?::Clinical Correlations|Clinical correlations bridge basic science to patient care.§§",
              ],
            },
            {
              type: "tip",
              content:
                "((Zap|Pro)) **Pro Tip**: Highlight key stats or quick facts in a visually dense but clean way. §§Teacher|Pro tips help memorize complex physiology effectively.|Tips are useful.|F::What is a pro tip for?::Highlighting key facts or strategies.|Learning strategies enhance long-term retention.§§",
            },
            {
              type: "paragraph",
              content: "The heart beats about **100,000** times a day. §§Teacher|The heart is an incredibly durable muscle beating continuously.|Beats 100k times a day.|M::How many times does the heart beat daily?::10,000::50,000::100,000::500,000::2|Over a lifetime, it beats over 2.5 billion times.§§",
            },
            {
              type: "paragraph",
              content: "It pumps about **2,000** gallons of blood. §§Teacher|The heart pumps a massive volume of blood daily to sustain life.|Pumps 2,000 gallons daily.|F::How many gallons does the heart pump daily?::About 2,000 gallons.|The total blood volume of an adult is only about 1.5 gallons.§§",
            },
            {
              type: "flashcard",
              front:
                "Which chamber of the heart has the thickest muscular wall?",
              back: "The **Left Ventricle**, because it must pump blood to the entire systemic circulation. §§Teacher|The left ventricle has the most myocardium to overcome systemic resistance.|Left ventricle = thickest.|M::Which chamber has the thickest wall?::Right Atrium::Right Ventricle::Left Atrium::Left Ventricle::3|In hypertension, the left ventricle hypertrophies further.§§",
            },
            {
              type: "paragraph",
              content:
                "Test your knowledge with this interactive matcher: [[Match|Mitochondria:Powerhouse|Nucleus:Brain|Ribosome:Protein Factory]] §§Teacher|Interactive elements reinforce learning via active recall.|Interactive elements aid memory.|F::How do interactive matchers help?::Reinforce learning via active recall.|Active recall ensures stronger synaptic connections.§§",
            },
            {
              type: "paragraph",
              content:
                'Can you find the error in this sentence? "The human body has !!FindError|206|105|An adult human has 206 bones!! bones." §§Teacher|Identify factual errors to improve critical thinking.|Spotting mistakes is key.|M::How many bones are in an adult human body?::105::206::300::350::1|Infants have about 300 bones that fuse over time.§§',
            },
            {
              type: "paragraph",
              content:
                "Practice your pronunciation: (((Record|Deoxyribonucleic Acid))) §§Teacher|Pronunciation helps internalize complex medical terminology.|Saying terms out loud helps.|F::What does DNA stand for?::Deoxyribonucleic Acid.|DNA's double helix structure was discovered in 1953.§§",
            },
            {
              type: "summary",
              content:
                "In summary, the cardiovascular system is a highly efficient transport network. By using interactive blocks like {{Ejection Fraction|The percentage of blood leaving your heart each time it contracts}}, students can better visualize and retain complex physiological concepts. §§Teacher|The cardiovascular network ensures all cells receive nutrients and oxygen while removing waste.|The system is vital for survival.|M::What does the cardiovascular system transport?::Nutrients, oxygen, and waste::Only oxygen::Only waste::Nerve impulses::0|This system is intimately linked with the respiratory and renal systems for homeostasis.§§",
            },
          ],
        },
      ],
      null,
      2,
    );
    setText(sample);
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-12 px-2 sm:px-4 space-y-6 sm:space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-3 text-center md:text-left">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Load Data
          </h2>
          <p className="text-indigo-500 font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em]">
            Paste your JSON content
          </p>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end gap-2 sm:gap-3">
          <input
            type="file"
            accept=".html"
            ref={docFileInputRef}
            onChange={handleDocUpload}
            className="hidden"
          />
          <button
            onClick={() => docFileInputRef.current?.click()}
            className="flex-1 sm:flex-none px-3 py-2.5 sm:px-6 sm:py-4 bg-white dark:bg-slate-900 border-b-4 border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 font-black uppercase text-[9px] sm:text-xs rounded-xl sm:rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 transition-all flex items-center justify-center gap-1.5 sm:gap-3 shadow-sm active:translate-y-1 active:border-b-0"
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> Upload Doc
          </button>
          <button
            onClick={() => setShowPromptMenu(true)}
            className="flex-1 sm:flex-none px-3 py-2.5 sm:px-6 sm:py-4 bg-indigo-50 dark:bg-indigo-900/20 border-b-4 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[9px] sm:text-xs rounded-xl sm:rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:border-indigo-300 transition-all flex items-center justify-center gap-1.5 sm:gap-3 shadow-sm active:translate-y-1 active:border-b-0"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> AI Prompt
          </button>
          <button
            onClick={loadSample}
            className="flex-1 sm:flex-none px-3 py-2.5 sm:px-6 sm:py-4 bg-white dark:bg-slate-900 border-b-4 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[9px] sm:text-xs rounded-xl sm:rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5 sm:gap-3 shadow-sm active:translate-y-1 active:border-b-0"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" /> Load Sample
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPromptMenu && (
          <PromptMenu onClose={() => setShowPromptMenu(false)} />
        )}
      </AnimatePresence>

      <div className="relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 rounded-[2rem] sm:rounded-[2.5rem] blur-xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-1 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
            placeholder={`Paste JSON document data...\n\nExample JSON: [{"title": "...", "blocks": [{"type": "heading", "content": "..."}]}]`}
            className="w-full h-[250px] sm:h-[300px] md:h-[400px] p-4 sm:p-6 md:p-10 bg-slate-50/50 dark:bg-slate-800/50 rounded-[1.3rem] sm:rounded-[1.8rem] font-mono text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-0 outline-none transition-all resize-none border-none text-slate-900 dark:text-slate-100"
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
          className="group relative px-8 py-4 sm:px-12 sm:py-6 md:px-16 md:py-8 bg-indigo-600 text-white font-black text-lg sm:text-xl uppercase tracking-tighter rounded-[2rem] shadow-[0_10px_0_var(--color-indigo-900)] hover:shadow-[0_5px_0_var(--color-indigo-900)] hover:translate-y-1 active:shadow-none active:translate-y-2.5 disabled:opacity-50 transition-all flex items-center gap-4"
        >
          GENERATE PDFS{" "}
          <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const PromptMenu = ({ onClose }: { onClose: () => void }) => {
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [targetMode, setTargetMode] = useState<"document" | "presentation">(
    "document",
  );
  const [syntaxes, setSyntaxes] = useState<Record<string, boolean>>({
    tooltips: true,
    reveal: true,
    expandable: true,
    badges: true,
    quiz: true,
    explanation: true,
    photo: false,
    translation: false,
    correction: false,
    pronunciation: false,
    deep_dive: false,
    find_error: false,
    voice: false,
    matcher: false,
    teacher: false,
  });
  const [types, setTypes] = useState<Record<string, boolean>>({
    heading: true,
    subheading: true,
    paragraph: true,
    high_yield: true,
    note: true,
    warning: false,
    summary: false,
    code: false,
    quote: false,
    list: true,
    step: false,
    vocabulary: false,
    table: false,
    image: false,
    example: true,
    explanation: true,
    clinical_correlation: true,
    tip: true,
    reference: true,
    dialogue: true,
    flashcard: true,
    disease: false,
  });
  const [diseaseSubtypes, setDiseaseSubtypes] = useState<Record<string, boolean>>({
    definition: true,
    etiology: true,
    classification: true,
    riskFactors: true,
    clinicalFeatures: true,
    signs: true,
    symptoms: true,
    diagnosis: true,
    differentialDiagnosis: true,
    complications: true,
    management: true,
    treatment: true,
    traps: true,
  });
  const [copied, setCopied] = useState(false);

  const toggleType = (key: string) => {
    setTypes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDiseaseSubtype = (key: string) => {
    setDiseaseSubtypes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSyntax = (key: string) => {
    setSyntaxes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const interactiveSyntaxData = [
    {
      id: "tooltips",
      label: "Term Tooltips",
      syntax: "{{Term|Def}}",
      desc: "Shows a definition on hover.",
      sample: "The {{Myocardium|Heart muscle}} is thick.",
    },
    {
      id: "reveal",
      label: "Reveal",
      syntax: "!!Label|Content!!",
      desc: "Click to reveal hidden content.",
      sample: "Answer: !!Click|The SA Node!!",
    },
    {
      id: "expandable",
      label: "Expandable",
      syntax: ">>Title|Content<<",
      desc: "A collapsible section for details.",
      sample: ">>ECG Analysis|The P-wave...<<",
    },
    {
      id: "badges",
      label: "Badges",
      syntax: "((Type|Content))",
      desc: "Visual icons (Star, Info, etc).",
      sample: "((Star|High Yield)) Important.",
    },
    {
      id: "quiz",
      label: "Quiz",
      syntax: "??Q|O1|O2|Idx??",
      desc: "Multiple choice questions.",
      sample: "??2+2?|3|4|5|1??",
    },
    {
      id: "explanation",
      label: "Explanation",
      syntax: "??Text|Info??",
      desc: "Dashed underline for extra info.",
      sample: "The ??Cycle|Events...?? is complex.",
    },
    {
      id: "photo",
      label: "Interactive Photo",
      syntax: "@@Text|Info@@",
      desc: "Click to upload/view related image.",
      sample: "See the @@Valve|Info@@ in action.",
    },
    {
      id: "translation",
      label: "Translation",
      syntax: "%%Text|Trans%%",
      desc: "Shows translation on hover.",
      sample: "Heart (%%Cor|Latin%%) is vital.",
    },
    {
      id: "correction",
      label: "Correction",
      syntax: "~~Old|New~~",
      desc: "Strikethrough with correction.",
      sample: "Heart has ~~3|4~~ chambers.",
    },
    {
      id: "pronunciation",
      label: "Pronunciation",
      syntax: "^^Text|Phonetic^^",
      desc: "Shows how to say the word.",
      sample: "The ^^Aorta|ay-OR-tah^^ is large.",
    },
    {
      id: "deep_dive",
      label: "Deep Dive",
      syntax: "**Text|Detail**",
      desc: "Bold text with a popup detail.",
      sample: "The **Bundle|Detail** transmits.",
    },
    {
      id: "find_error",
      label: "Find Error",
      syntax: "!!FindError|...!!",
      desc: "Interactive error finding game.",
      sample: "!!FindError|4|3|Heart has 4!!",
    },
    {
      id: "voice",
      label: "Voice Record",
      syntax: "(((Record|Phrase)))",
      desc: "Practice speaking the phrase.",
      sample: "Say: (((Record|Heart)))",
    },
    {
      id: "matcher",
      label: "Matcher",
      syntax: "[[Match|A:1|B:2]]",
      desc: "Drag and drop matching game.",
      sample: "[[Match|Heart:Pump|Lungs:Air]]",
    },
    {
      id: "teacher",
      label: "Teacher",
      syntax: "§§Word|Expl|Mem|Quiz|Expand§§",
      desc: "Teacher explanation with memory, quiz and expand.",
      sample: "§§Learn|This means...|Key parts...|F::What does this mean?::It means this.|Expand...§§",
    },
  ];

  const applyTemplate = (template: string) => {
    if (template === "medical") {
      setTypes((prev) => ({
        ...prev,
        heading: true,
        paragraph: true,
        clinical_correlation: true,
        high_yield: true,
        flashcard: true,
      }));
      setSyntaxes((prev) => ({
        ...prev,
        tooltips: true,
        reveal: true,
        explanation: true,
        photo: true,
        deep_dive: true,
      }));
    } else if (template === "language") {
      setTypes((prev) => ({
        ...prev,
        heading: true,
        paragraph: true,
        vocabulary: true,
        dialogue: true,
        flashcard: true,
      }));
      setSyntaxes((prev) => ({
        ...prev,
        translation: true,
        pronunciation: true,
        voice: true,
        matcher: true,
      }));
    } else if (template === "quiz") {
      setTypes((prev) => ({
        ...prev,
        heading: true,
        flashcard: true,
      }));
      setSyntaxes((prev) => ({
        ...prev,
        quiz: true,
        reveal: true,
        find_error: true,
        matcher: true,
      }));
    }
  };

  const handleCopy = () => {
    let prompt = `Act as an expert content creator. Generate a ${targetMode === "presentation" ? "presentation-optimized" : "structured"} document in ${format.toUpperCase()} format.\n\n`;

    if (targetMode === "presentation") {
      prompt += `PRESENTATION OPTIMIZATION RULES:\n`;
      prompt += `- Each block will be rendered as a SINGLE SLIDE.\n`;
      prompt += `- Content per slide should be "fitting": not just one sentence, but not a wall of text either. Aim for 3-5 key points or a well-structured paragraph.\n`;
      prompt += `- Use "heading" blocks for title slides or section breaks.\n`;
      prompt += `- Use "high_yield", "warning", and "summary" blocks for high-impact visual slides.\n`;
      prompt += `- Break complex topics into a sequence of slides rather than cramming one slide.\n`;
      prompt += `- Ensure a logical flow from one slide (block) to the next.\n\n`;
    }

    if (format === "json") {
      prompt += `The output MUST be an array of objects, where each object represents a document.\n`;
      prompt += `Document Structure:\n[\n  {\n    "group": "Category Name (Optional)",\n    "title": "Document Title",\n    "blocks": [\n`;
      prompt += `      // Blocks go here\n    ]\n  }\n]\n\n`;
    } else {
      prompt += `The output MUST be a CSV with the following columns: Group, DocumentTitle, BlockType, Content, Items, Language, Term, Definition, Columns, Rows, ImageUrl, ImageCaption.\n`;
      prompt += `Use JSON strings for arrays in CSV columns like Items, Columns, and Rows.\n\n`;
    }

    prompt += `Available Block Types (use ONLY these):\n`;

    if (types.heading)
      prompt += `- "heading": Main titles. Example: {"type": "heading", "content": "Anatomy of the Heart"}\n`;
    if (types.subheading)
      prompt += `- "subheading": Targeted sub-headers for sections. Example: {"type": "subheading", "content": "Valves and Vessels"}\n`;
    if (types.paragraph)
      prompt += `- "paragraph": Standard text. Example: {"type": "paragraph", "content": "The heart is a muscular organ..."}\n`;
    if (types.high_yield)
      prompt += `- "high_yield": Critical facts. Example: {"type": "high_yield", "content": "The left ventricle is the thickest chamber."}\n`;
    if (types.note)
      prompt += `- "note": Supplementary info. Example: {"type": "note", "content": "The heart beats about 100,000 times a day."}\n`;
    if (types.warning)
      prompt += `- "warning": Alerts/pitfalls. Example: {"type": "warning", "content": "Do not confuse the atrium with the ventricle."}\n`;
    if (types.summary)
      prompt += `- "summary": Executive summaries. Example: {"type": "summary", "content": "In summary, the heart pumps blood through two circuits."}\n`;
    if (types.example)
      prompt += `- "example": Illustrative examples. Example: {"type": "example", "content": "Consider a pump in a water system..."}\n`;
    if (types.explanation)
      prompt += `- "explanation": Detailed breakdowns. Example: {"type": "explanation", "content": "The process of depolarization begins at the SA node..."}\n`;
    if (types.clinical_correlation)
      prompt += `- "clinical_correlation": Medical/practical links. Example: {"type": "clinical_correlation", "content": "Atrial fibrillation increases stroke risk."}\n`;
    if (types.tip)
      prompt += `- "tip": Helpful hints. Example: {"type": "tip", "content": "Remember 'A' for Artery (Away from heart)."}\n`;
    if (types.reference)
      prompt += `- "reference": Citations/sources. Example: {"type": "reference", "content": "Guyton and Hall, Textbook of Medical Physiology"}\n`;
    if (types.dialogue)
      prompt += `- "dialogue": Quotes or conversations. Example: {"type": "dialogue", "content": "Patient: 'I feel a fluttering in my chest.'"}\n`;
    if (types.flashcard)
      prompt += `- "flashcard": A 3D flip card for self-testing. Example: {"type": "flashcard", "front": "What is X?", "back": "X is..."}\n`;
    if (types.code)
      prompt += `- "code": Code snippets. Example: {"type": "code", "content": "print('Heart rate: 72')", "language": "python"}\n`;
    if (types.quote)
      prompt += `- "quote": Famous quotes. Example: {"type": "quote", "content": "The heart has its reasons..."}\n`;
    if (types.list)
      prompt += `- "list": Bullet points. Example: {"type": "list", "items": ["Atria", "Ventricles"]}\n`;
    if (types.step)
      prompt += `- "step": Sequential steps. Example: {"type": "step", "items": ["Deoxygenated blood enters...", "Right atrium contracts..."]}\n`;
    if (types.vocabulary)
      prompt += `- "vocabulary": Terms/Defs. Example: {"type": "vocabulary", "term": "Systole", "definition": "Contraction phase"}\n`;
    if (types.table)
      prompt += `- "table": Data grids. Example: {"type": "table", "columns": ["Chamber", "Function"], "rows": [["RA", "Receives blood"], ["RV", "Pumps blood"]]}\n`;
    if (types.image)
      prompt += `- "image": Visuals. Example: {"type": "image", "imageUrl": "url", "imageCaption": "Heart diagram"}\n`;
    if (types.disease) {
      const diseaseActiveMap: Record<string, string> = {
        definition: "Definition",
        classification: "Classification",
        etiology: "Etiology",
        clinicalFeatures: "Clinical Features",
        signs: "Signs",
        symptoms: "Symptoms",
        diagnosis: "Diagnosis",
        differentialDiagnosis: "Differential Diagnosis",
        management: "Management",
        treatment: "Treatment",
        complications: "Complications",
        riskFactors: "Risk Factors",
        traps: "Exam Traps & Keys"
      };
      const activeDiseaseList = Object.entries(diseaseSubtypes)
        .filter(([_, isEnabled]) => isEnabled)
        .map(([key]) => diseaseActiveMap[key] || key)
        .join(", ");
      
      const exampleChildren = Object.entries(diseaseSubtypes)
        .filter(([_, isEnabled]) => isEnabled)
        .map(([key]) => `{"type": "text", "subType": "${key}", "content": "..."}`)
        .join(", ");

      prompt += `- "disease": Comprehensive disease overviews. Works as a container for specific sub-types. Set the title of the disease on "title". Depending on the provided text, extract the information and generate child blocks ONLY for the following allowed sections: ${activeDiseaseList || 'None'}. YOU MUST ADD A SEPARATE CHILD BLOCK FOR EACH SECTION. Each child block must have "type" as "text" (or "list", "paragraph", etc.) AND "subType" property set exactly to the raw key of the section (e.g. "definition", "etiology", "clinicalFeatures", "traps"). Example: {"type": "disease", "title": "Pneumonia", "children": [${exampleChildren}]}. Note: The "traps" section should focus on the most important high-yield facts, common exam pitfalls, and a summary of critical "must-know" information.\n`;
    }

    prompt += `\nMARKDOWN INSTRUCTIONS:\n`;
    prompt += `You MUST use Markdown formatting inside "content", "definition", "items", and table cells to enhance readability.\n`;
    prompt += `- Use **bold** for emphasis.\n`;
    prompt += `- Use *italics* for secondary emphasis.\n`;
    prompt += `- Use \`inline code\` for technical terms.\n`;

    prompt += `\nINTERACTIVE SYNTAX (CRITICAL):\n`;
    prompt += `You MUST use these special syntaxes frequently to make the document interactive:\n`;
    if (syntaxes.tooltips)
      prompt += `- **Term Tooltips**: {{Term|Definition}} or [[Term|Definition]]. Example: "The {{Myocardium|The muscular tissue of the heart}} is thick."\n`;
    if (syntaxes.reveal)
      prompt += `- **Reveal**: !!Label|Hidden Content!!. Example: "Answer: !!Click to see|The SA Node!!" \n`;
    if (syntaxes.expandable)
      prompt += `- **Expandable**: >>Title|Content<<. Example: ">>Detailed ECG Analysis|The P-wave represents atrial depolarization...<<" \n`;
    if (syntaxes.badges)
      prompt += `- **Badges**: ((Type|Content)). Types: Star, Info, Check, Zap, Heart. Example: "((Star|High Yield)) Focus on this."\n`;
    if (syntaxes.quiz)
      prompt += `- **Quiz**: ??Question|Option1|Option2|...|CorrectIndex??. Example: "??What is 2+2?|3|4|5|1??" (CorrectIndex is 0-indexed)\n`;
    if (syntaxes.explanation)
      prompt += `- **Explanation**: ??Text|Detailed Explanation??. Example: "The ??Cardiac Cycle|The sequence of events...?? is complex."\n`;
    if (syntaxes.photo)
      prompt += `- **Interactive Photo**: @@Text|Detailed Info@@. Example: "See the @@Mitral Valve|A dual-flap valve...@@ in action."\n`;
    if (syntaxes.translation)
      prompt += `- **Translation**: %%Text|Translation%%. Example: "The heart (%%Cor|Latin for heart%%) is vital."\n`;
    if (syntaxes.correction)
      prompt += `- **Correction**: ~~Incorrect Text|Corrected Text~~. Example: "The heart has ~~three|four~~ chambers."\n`;
    if (syntaxes.pronunciation)
      prompt += `- **Pronunciation**: ^^Text|Pronunciation^^. Example: "The ^^Aorta|ay-OR-tah^^ is the largest artery."\n`;
    if (syntaxes.deep_dive)
      prompt += `- **Deep Dive**: **Text|Detail**. Example: "The **Bundle of His|A collection of heart muscle cells...** transmits impulses."\n`;
    if (syntaxes.find_error)
      prompt += `- **Find the Error**: !!FindError|Correct Text|The Error|Explanation!!. Example: "The heart has !!FindError|four|three|The human heart has 4 chambers!! chambers."\n`;
    if (syntaxes.voice)
      prompt += `- **Voice Record**: (((Record|Target Phrase))). Example: "Practice saying: (((Record|Mitochondria)))"\n`;
    if (syntaxes.matcher)
      prompt += `- **Matcher**: [[Match|Term1:Def1|Term2:Def2|...]]. Example: "[[Match|Heart:Pumps blood|Lungs:Gas exchange]]"\n`;
    if (syntaxes.teacher)
      prompt += `- **Teacher**: §§Word|Explanation|Memory|Quiz|Expand§§. You MUST append this exactly at the end of the last word in EVERY single block's content except for "heading" and "subheading" blocks. EVERY block MUST have it, NO EXCEPTION. It creates a clickable button for students to learn more.\n  - The 'Explanation' MUST be extremely detailed. Explain literally every thing with utmost importance. Everything is important, every thing should be mentioned, and every thing that is mentioned should be thoroughly explained.\n  - The 'Quiz' MUST be an interactive question. Use one of two formats: F::Question Here?::Answer Here (for a flashcard) OR M::Question Here?::Opt1::Opt2::Opt3::Opt4::CorrectIndex0to3 (for a multiple choice question).\n  - The 'Expand' section MUST be directly related to the majority of the content of the block and delve much deeper into the topic.\n  Example: "The heart pumps blood. §§Teacher|The heart is the primary organ of the circulatory system. It acts as a dual pump for the entire body, tirelessly beating to circulate blood...|[List of key takeaways]|M::How many chambers does the heart have?::Two::Three::Four::Five::2|[Broaden horizons: Explaining how the heart also acts as an endocrine organ producing ANP]§§"\n`;

    copyToClipboard(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <OverlayPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
              AI Prompt Builder
            </h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
              Select blocks & format
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8">
          {/* Quick Templates */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              0. Quick Templates
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyTemplate("medical")}
                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                Medical Case Study
              </button>
              <button
                onClick={() => applyTemplate("language")}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-colors"
              >
                Language Learning
              </button>
              <button
                onClick={() => applyTemplate("quiz")}
                className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-800 hover:bg-amber-100 transition-colors"
              >
                Interactive Quiz
              </button>
            </div>
          </div>

          {/* Target Experience Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              1. Target Experience
            </h4>
            <div className="flex gap-4">
              <button
                onClick={() => setTargetMode("document")}
                className={`flex-1 py-3 rounded-xl font-bold uppercase text-sm border-2 transition-all flex items-center justify-center gap-2 ${targetMode === "document" ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"}`}
              >
                <FileText className="w-4 h-4" /> Document
              </button>
              <button
                onClick={() => setTargetMode("presentation")}
                className={`flex-1 py-3 rounded-xl font-bold uppercase text-sm border-2 transition-all flex items-center justify-center gap-2 ${targetMode === "presentation" ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"}`}
              >
                <PlayCircle className="w-4 h-4" /> Presentation
              </button>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              2. Output Format
            </h4>
            <div className="flex gap-4">
              <button
                onClick={() => setFormat("json")}
                className={`flex-1 py-3 rounded-xl font-bold uppercase text-sm border-2 transition-all ${format === "json" ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"}`}
              >
                JSON
              </button>
              <button
                onClick={() => setFormat("csv")}
                className={`flex-1 py-3 rounded-xl font-bold uppercase text-sm border-2 transition-all ${format === "csv" ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"}`}
              >
                CSV
              </button>
            </div>
          </div>

          {/* Block Types */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              3. Enable Block Types
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(types).map(([key, isEnabled]) => (
                <button
                  key={key}
                  onClick={() => toggleType(key)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isEnabled ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-500" : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"}`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${isEnabled ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700"}`}
                  >
                    {isEnabled && <Check className="w-3 h-3" />}
                  </div>
                  <span
                    className={`font-bold text-sm capitalize ${isEnabled ? "text-indigo-900 dark:text-indigo-100" : "text-slate-600 dark:text-slate-200"}`}
                  >
                    {key.replace("_", " ")}
                  </span>
                </button>
              ))}
            </div>
            {types.disease && (
              <div className="mt-8 p-4 md:p-6 rounded-2xl border-2 border-rose-100 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-900/10 space-y-4">
                <h4 className="flex items-center gap-2 font-black uppercase text-sm tracking-wider text-slate-800 dark:text-white">
                  <Syringe className="w-4 h-4 text-rose-500" />
                  Disease Subtypes Configuration
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {Object.entries(diseaseSubtypes).map(([key, isEnabled]) => (
                    <button
                      key={key}
                      onClick={() => toggleDiseaseSubtype(key)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isEnabled ? "border-rose-500 bg-rose-50/50 dark:bg-rose-900/20 dark:border-rose-500" : "border-rose-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-slate-700"}`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${isEnabled ? "bg-rose-600 text-white" : "bg-slate-200 dark:bg-slate-700"}`}
                      >
                        {isEnabled && <Check className="w-3 h-3" />}
                      </div>
                      <span
                        className={`font-bold text-sm capitalize ${isEnabled ? "text-rose-900 dark:text-rose-100" : "text-slate-600 dark:text-slate-200"}`}
                      >
                         {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Syntaxes */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              4. Interactive Syntaxes
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {interactiveSyntaxData.map((item) => {
                const isEnabled = syntaxes[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSyntax(item.id)}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${isEnabled ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-500" : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"}`}
                  >
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isEnabled ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700"}`}
                      >
                        {isEnabled && <Check className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`font-black text-sm ${isEnabled ? "text-indigo-900 dark:text-indigo-100" : "text-slate-900 dark:text-white"}`}
                        >
                          {item.label}
                        </span>
                        <code className="text-[10px] font-mono text-indigo-500 font-bold">
                          {item.syntax}
                        </code>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 font-medium leading-tight mb-1">
                        {item.desc}
                      </p>
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-[9px] font-mono text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
                          Sample: {item.sample}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={handleCopy}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" /> Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" /> Copy AI Instructions
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  </OverlayPortal>
);
};

const TableOfContents = ({
  documents,
  pdfTheme,
  themeColor,
  onClose,
  customTheme,
}: {
  documents: PdfDocument[];
  pdfTheme: PdfTheme;
  themeColor: ThemeColor;
  onClose: () => void;
  customTheme?: PdfCustomTheme;
}) => {
  const activeColorThemes = colorThemes;
  const theme = activeColorThemes[themeColor];

  const headings = documents.flatMap((doc) =>
    doc.blocks
      .filter((b) => b.type === "heading")
      .map((b) => ({
        title: doc.title,
        content: b.content,
        id: `heading-${cleanText(b.content).toLowerCase().replace(/\s+/g, "-")}`,
      })),
  );

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className={`fixed left-0 top-0 h-full w-80 z-[200] ${false ? "bg-white border-r-8 border-black p-8" : false ? "bg-slate-950/90 backdrop-blur-2xl border-r-2 border-indigo-500/30 p-8" : "bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-r border-slate-100 dark:border-slate-800 p-8"} shadow-2xl overflow-y-auto custom-scrollbar group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:border-r group-[.visual-liquid-glass]/liquid-glass:border-white/10 group-[.visual-liquid-glass]/liquid-glass:p-10 group-[.visual-liquid-glass]/liquid-glass:shadow-none`}
      style={
        customTheme?.enabled
          ? {
              backgroundColor: customTheme.backgroundColor,
              borderRightColor: customTheme.primaryColor,
              fontFamily: customTheme.bodyFont,
            }
          : {}
      }
    >
      <div className="flex justify-between items-center mb-8">
        <h2
          className={`text-2xl font-black uppercase tracking-tighter ${false ? "text-white" : "text-slate-900 dark:text-white"}`}
          style={
            customTheme?.enabled
              ? {
                  color: customTheme.primaryColor,
                  fontFamily: customTheme.headingFont,
                }
              : {}
          }
        >
          Contents
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X
            className="w-6 h-6"
            style={customTheme?.enabled ? { color: customTheme.textColor } : {}}
          />
        </button>
      </div>
      <div className="space-y-6">
        {headings.length === 0 ? (
          <p
            className="text-slate-500 text-sm italic"
            style={
              customTheme?.enabled
                ? { color: customTheme.textColor + "88" }
                : {}
            }
          >
            No headings found in document.
          </p>
        ) : (
          headings.map((h, i) => (
            <button
              key={i}
              onClick={() => scrollTo(h.id)}
              className={`w-full text-left group transition-all`}
            >
              <p
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"
                style={
                  customTheme?.enabled
                    ? { color: customTheme.primaryColor + "88" }
                    : {}
                }
              >
                {h.title}
              </p>
              <p
                className={`text-sm font-bold ${false ? "text-indigo-200 group-hover:text-white" : "text-slate-700 dark:text-slate-300 group-hover:text-indigo-600"} transition-colors`}
                style={
                  customTheme?.enabled ? { color: customTheme.textColor } : {}
                }
              >
                {cleanText(h.content)}
              </p>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
};

const ThemeBuilderModal = ({
  theme,
  onUpdate,
  onClose,
  pdfTheme,
}: {
  theme: PdfCustomTheme;
  onUpdate: (theme: PdfCustomTheme) => void;
  onClose: () => void;
  pdfTheme: PdfTheme;
}) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...theme, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar ${false ? "bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-8" : false ? "bg-slate-950 border-2 border-indigo-500/30 rounded-[2.5rem] p-10" : "bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2
              className={`text-3xl font-black uppercase tracking-tighter ${false ? "text-white" : "text-slate-900 dark:text-white"}`}
            >
              Theme Builder
            </h2>
            <p className="text-slate-500 font-medium">
              Customize your document's visual identity
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Logo Upload */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">
              Custom Logo
            </label>
            <div className="flex items-center gap-6">
              <div
                className={`w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800/50`}
              >
                {theme.logo ? (
                  <img
                    src={theme.logo}
                    className="w-full h-full object-contain"
                    alt="Logo preview"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-indigo-700 transition-colors"
                >
                  Upload Logo
                </label>
                {theme.logo && (
                  <button
                    onClick={() => onUpdate({ ...theme, logo: undefined })}
                    className="block text-xs font-bold text-rose-500 hover:text-rose-600"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Font Pairs */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">
              Font Pairing
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fontPairs.map((pair) => (
                <button
                  key={pair.name}
                  onClick={() =>
                    onUpdate({
                      ...theme,
                      headingFont: pair.heading,
                      bodyFont: pair.body,
                    })
                  }
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${theme.headingFont === pair.heading ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"}`}
                >
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    {pair.name}
                  </p>
                  <p
                    className="text-lg font-bold text-slate-900 dark:text-white"
                    style={{ fontFamily: pair.heading }}
                  >
                    Heading Font
                  </p>
                  <p
                    className="text-sm text-slate-500"
                    style={{ fontFamily: pair.body }}
                  >
                    Body text preview
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">
              Color Palette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Primary
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) =>
                      onUpdate({ ...theme, primaryColor: e.target.value })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold">
                    {theme.primaryColor}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Secondary
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) =>
                      onUpdate({ ...theme, secondaryColor: e.target.value })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold">
                    {theme.secondaryColor}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Accent
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) =>
                      onUpdate({ ...theme, accentColor: e.target.value })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold">
                    {theme.accentColor}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Background
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) =>
                      onUpdate({ ...theme, backgroundColor: e.target.value })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold">
                    {theme.backgroundColor}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Text
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.textColor}
                    onChange={(e) =>
                      onUpdate({ ...theme, textColor: e.target.value })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold">
                    {theme.textColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Typography */}
          <div className="space-y-6">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">
              Advanced Typography
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Font Weight
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600">
                    {theme.fontWeight}
                  </span>
                </div>
                <select
                  value={theme.fontWeight}
                  onChange={(e) =>
                    onUpdate({ ...theme, fontWeight: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold"
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semibold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra Bold (800)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Line Height
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600">
                    {theme.lineHeight}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.1"
                  value={theme.lineHeight}
                  onChange={(e) =>
                    onUpdate({
                      ...theme,
                      lineHeight: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Letter Spacing
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600">
                    {theme.letterSpacing}px
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="5"
                  step="0.5"
                  value={theme.letterSpacing}
                  onChange={(e) =>
                    onUpdate({
                      ...theme,
                      letterSpacing: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Layout & Spacing */}
          <div className="space-y-6">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">
              Layout & Spacing
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Page Margins
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600">
                    {theme.margins}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="4"
                  value={theme.margins}
                  onChange={(e) =>
                    onUpdate({ ...theme, margins: parseInt(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Content Gap
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600">
                    {theme.contentGap}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="4"
                  value={theme.contentGap}
                  onChange={(e) =>
                    onUpdate({ ...theme, contentGap: parseInt(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button
              onClick={() => onUpdate({ ...theme, enabled: !theme.enabled })}
              className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${theme.enabled ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
            >
              {theme.enabled ? "Custom Theme Active" : "Enable Custom Theme"}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const optimizePdfBlocks = (blocks: PdfBlock[]): PdfBlock[] => {
  return blocks;
};

export const PdfViewer = ({
  documents: initialDocuments,
  onBack,
  setDarkMode,
  pdfTheme,
  setPdfTheme,
  isPhotoModeEnabled,
  setIsPhotoModeEnabled,
  onSavePdf,
  appTheme,
  onOpenGlobalThemes,
}: {
  documents: PdfDocument[];
  onBack: () => void;
  setDarkMode?: (dark: boolean) => void;
  pdfTheme: PdfTheme;
  setPdfTheme: (theme: PdfTheme) => void;
  isPhotoModeEnabled: boolean;
  setIsPhotoModeEnabled: (val: boolean) => void;
  onSavePdf?: (docs: PdfDocument[]) => void;
  appTheme?: string;
  onOpenGlobalThemes?: () => void;
}) => {
  const isOverlayMode = appTheme === 'arcane' || appTheme === 'liquid-glass' || appTheme === 'fluid' || appTheme === 'hollow-knight';

  const [documents, setDocuments] = useState(() =>
    initialDocuments.map((doc) => ({
      ...doc,
      blocks: optimizePdfBlocks(doc.blocks),
    })),
  );
  const [showMenu, setShowMenu] = useState(false);
  const [isPhotoModeOpen, setIsPhotoModeOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PdfBlock | null>(null);
  const [targetInsert, setTargetInsert] = useState<{ docIndex: number; blockIndex: number } | null>(null);

  const [showToc, setShowToc] = useState(false);
  const [includeToc, setIncludeToc] = useState(() => {
    const saved = localStorage.getItem("pdfIncludeToc");
    return saved ? JSON.parse(saved) === true : true;
  });
  const [includeCover, setIncludeCover] = useState(() => {
    const saved = localStorage.getItem("pdfIncludeCover");
    return saved ? JSON.parse(saved) === true : true;
  });
  const [exportStyle, setExportStyle] = useState<'standard'|'drastic'|'fancy'|'theme'>(() => {
    const saved = localStorage.getItem("pdfExportStyle");
    return (saved as 'standard'|'drastic'|'fancy'|'theme') || 'standard';
  });
  const [enableGradients, setEnableGradients] = useState(() => {
    const saved = localStorage.getItem("pdfEnableGradients");
    return saved ? JSON.parse(saved) === true : false;
  });

  const [colorCycleTrigger, setColorCycleTrigger] = useState<'group' | 'document' | 'heading' | 'subheading'>(() => {
    const saved = localStorage.getItem("pdfColorCycleTrigger");
    return (saved as any) || 'group';
  });

  useEffect(() => {
    localStorage.setItem("pdfIncludeToc", JSON.stringify(includeToc));
  }, [includeToc]);

  useEffect(() => {
    localStorage.setItem("pdfIncludeCover", JSON.stringify(includeCover));
  }, [includeCover]);

  useEffect(() => {
    localStorage.setItem("pdfExportStyle", exportStyle);
  }, [exportStyle]);

  useEffect(() => {
    localStorage.setItem("pdfEnableGradients", JSON.stringify(enableGradients));
  }, [enableGradients]);

  useEffect(() => {
    localStorage.setItem("pdfColorCycleTrigger", colorCycleTrigger);
  }, [colorCycleTrigger]);
  const [customTheme, setCustomTheme] = useState<PdfCustomTheme>(() => {
    const saved = localStorage.getItem("pdfCustomTheme");
    return saved
      ? JSON.parse(saved)
      : {
          enabled: false,
          headingFont: "Inter",
          bodyFont: "Inter",
          primaryColor: "#4f46e5",
          secondaryColor: "#6366f1",
          accentColor: "#818cf8",
          backgroundColor: "#f8fafc",
          textColor: "#0f172a",
          fontWeight: "400",
          lineHeight: 1.6,
          letterSpacing: 0,
          margins: 40,
          contentGap: 24,
        };
  });

  const [uploadedPdfFont, setUploadedPdfFont] = useState<{name: string, dataUrl: string, fontFamilyName: string} | null>(() => {
    const saved = localStorage.getItem("uploadedPdfFont");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (uploadedPdfFont) {
        localStorage.setItem("uploadedPdfFont", JSON.stringify(uploadedPdfFont));
    } else {
        localStorage.removeItem("uploadedPdfFont");
    }
  }, [uploadedPdfFont]);

  useEffect(() => {
    if (uploadedPdfFont) {
      const style = document.createElement("style");
      style.innerHTML = `
        @font-face {
          font-family: '${uploadedPdfFont.fontFamilyName}';
          src: url('${uploadedPdfFont.dataUrl}');
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [uploadedPdfFont]);

  useEffect(() => {
    localStorage.setItem("pdfCustomTheme", JSON.stringify(customTheme));
    if (customTheme.enabled) {
      if (customTheme.customUploadedFont && customTheme.headingFont === customTheme.customUploadedFont.fontFamilyName) {
        const style = document.createElement("style");
        style.innerHTML = `
          @font-face {
            font-family: '${customTheme.customUploadedFont.fontFamilyName}';
            src: url('${customTheme.customUploadedFont.dataUrl}');
          }
        `;
        document.head.appendChild(style);
        return () => {
          document.head.removeChild(style);
        };
      } else {
        const fonts = [customTheme.headingFont, customTheme.bodyFont];
        const link = document.createElement("link");
        link.href = `https://fonts.googleapis.com/css2?family=${fonts.map((f) => f.replace(/\s+/g, "+")).join("&family=")}&display=swap`;
        link.rel = "stylesheet";
        document.head.appendChild(link);
        return () => {
          document.head.removeChild(link);
        };
      }
    }
  }, [customTheme]);

  const [zoom, setZoom] = useState(() => {
    const saved = localStorage.getItem("pdfZoom");
    return saved ? parseInt(saved, 10) : 100;
  });

  useEffect(() => {
    localStorage.setItem("pdfZoom", zoom.toString());
  }, [zoom]);

  useEffect(() => {
    if (false && setDarkMode) {
      setDarkMode(true);
    }
  }, [pdfTheme, setDarkMode]);

  const [colorSequence, setColorSequence] = useState<ThemeColor[]>(() => {
    const saved = localStorage.getItem("pdfColorSequence");
    return saved ? JSON.parse(saved) : ["indigo", "emerald", "rose"];
  });

  const [customColorPool, setCustomColorPool] = useState<string[]>(() => {
    const saved = localStorage.getItem("pdfCustomColorPool");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("pdfCustomColorPool", JSON.stringify(customColorPool));
  }, [customColorPool]);

  useEffect(() => {
    localStorage.setItem("pdfColorSequence", JSON.stringify(colorSequence));
  }, [colorSequence]);

  const availableColors: ThemeColor[] = [
    "indigo", "blue", "emerald", "rose", "amber", "purple", "teal", "pink", "cyan", "fuchsia", "violet", "sky", "lime", "orange", "zinc", "slate", "red", "yellow", "mint", "lavender", "crimson", "forest", "midnight", "gold", "coral", "aqua", "plum"
  ];
  const viewerRef = useRef<HTMLDivElement>(null);

  const activeColorThemes =
    pdfTheme === "brutalist"
        ? brutalistColorThemes
        : colorThemes;

  const addColorToSequence = (color: ThemeColor) => {
    setColorSequence((prev) => [...prev, color]);
  };

  const removeColorFromSequence = (index: number) => {
    setColorSequence((prev) => {
      if (prev.length <= 1) return prev;
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = async () => {
    if (!viewerRef.current) return;

    const clone = viewerRef.current.cloneNode(true) as HTMLElement;

    // Remove UI elements not meant for the exported document
    const elementsToRemove = clone.querySelectorAll(".export-remove");
    elementsToRemove.forEach((el) => el.remove());

    // Fix the menu dropdown state for export
    const menuDropdown = clone.querySelector("#export-menu-dropdown");
    if (menuDropdown) {
      menuDropdown.removeAttribute("style");
      menuDropdown.classList.add("hidden");
    }

    // Gather all styles to make it work offline
    let styles = "";
    const styleElements = document.querySelectorAll("style");
    styleElements.forEach((style) => {
      styles += style.innerHTML + "\n";
    });

    const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
    for (let i = 0; i < linkElements.length; i++) {
      try {
        const href = (linkElements[i] as HTMLLinkElement).href;
        if (href) {
          const response = await fetch(href);
          const css = await response.text();
          styles += css + "\n";
        }
      } catch (e) {
        console.warn("Could not fetch stylesheet", linkElements[i]);
      }
    }

    const scriptContent = `
      window.pdfTheme = ${JSON.stringify(pdfTheme)};
      window.allColorThemes = {
        modern: ${JSON.stringify(colorThemesBase)},
        brutalist: ${JSON.stringify(brutalistColorThemesBase)},
      };
      const customProxyHandler = {
        get(target, prop) {
          if (prop && prop.startsWith('custom-')) {
            const hex = '#' + prop.replace('custom-', '');
            if (window.pdfTheme === 'brutalist') {
              return {
                text: "text-black dark:text-white",
                bg: \`bg-\${prop}\`,
                bgLight: \`bg-\${prop}-light\`,
                bgMedium: \`bg-\${prop}-medium\`,
                accent: \`bg-\${prop}-accent\`,
                secondary: \`bg-\${prop}-secondary\`,
                border: "border-black dark:border-white",
                borderLight: "border-black/40 dark:border-white/40",
                highlight: \`bg-\${prop}-highlight\`,
                gradient: \`from-\${prop}-start to-\${prop}-end\`,
                shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
                swatch: \`bg-\${prop}\`,
              };
            }
            return {
              text: \`text-\${prop}\`,
              bg: \`bg-\${prop}\`,
              bgLight: \`bg-\${prop}-light\`,
              border: \`border-\${prop}\`,
              borderLight: \`border-\${prop}-light\`,
              highlight: \`bg-\${prop}-highlight\`,
              gradient: \`from-\${prop}-start to-\${prop}-end\`,
              shadow: \`shadow-\${prop}\`,
              swatch: \`bg-\${prop}\`,
            };
          }
          return target[prop] || target['indigo'];
        }
      };
      window.allColorThemes.modern = new Proxy(window.allColorThemes.modern, customProxyHandler);
      window.allColorThemes.brutalist = new Proxy(window.allColorThemes.brutalist, customProxyHandler);

      window.colorSequence = ${JSON.stringify(colorSequence)};
      window.colorCycleTrigger = ${JSON.stringify(colorCycleTrigger)};
      window.jsonData = ${JSON.stringify(documents).replace(/</g, "\\u003c")};
      window.customTheme = ${JSON.stringify(customTheme)};
      window.enableGradients = ${JSON.stringify(enableGradients)};

      window.getGradientPair = (colors, index) => {
        if (colors.length === 0) return ['indigo', 'indigo'];
        if (colors.length === 1) return [colors[0], colors[0]];
        const startIdx = (index * 2) % colors.length;
        let endIdx = (startIdx + 1) % colors.length;
        return [colors[startIdx], colors[endIdx]];
      };

      document.addEventListener('DOMContentLoaded', () => {
        const menuBtn = document.getElementById('export-menu-btn');
        const menuDropdown = document.getElementById('export-menu-dropdown');
        const zoomSlider = document.getElementById('export-zoom-slider');
        const zoomText = document.getElementById('export-zoom-text');
        const printBtn = document.getElementById('export-print-btn');
        const copyJsonBtn = document.getElementById('export-copy-json-btn');
        const colorBtns = document.querySelectorAll('.export-color-btn');
        const docContent = document.getElementById('export-document-content');
        const theme = window.pdfTheme;
        const colorThemes = window.allColorThemes[theme];

        if (menuBtn && menuDropdown) {
          menuBtn.addEventListener('click', () => {
            menuDropdown.classList.toggle('hidden');
          });
        }

        if (zoomSlider && zoomText && docContent) {
          zoomSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            zoomText.innerText = val + '%';
            docContent.style.zoom = val / 100;
            docContent.style.width = val > 100 ? (10000 / val) + '%' : '100%';
            docContent.style.maxWidth = (64 * (100 / val)) + 'rem';
          });
        }

        if (printBtn) {
          printBtn.addEventListener('click', () => {
            window.print();
          });
        }

        if (copyJsonBtn) {
          copyJsonBtn.addEventListener('click', () => {
            const text = JSON.stringify(window.jsonData, null, 2);
            if (navigator.clipboard && window.isSecureContext) {
              navigator.clipboard.writeText(text).then(() => {
                alert('Document JSON copied to clipboard!');
              }).catch(() => {
                // Fallback for non-focused docs
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                textArea.style.top = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                  document.execCommand('copy');
                  alert('Document JSON copied to clipboard!');
                } catch (err) {}
                document.body.removeChild(textArea);
              });
            } else {
              const textArea = document.createElement('textarea');
              textArea.value = text;
              textArea.style.position = 'fixed';
              textArea.style.left = '-9999px';
              textArea.style.top = '0';
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              try {
                document.execCommand('copy');
                alert('Document JSON copied to clipboard!');
              } catch (err) {}
              document.body.removeChild(textArea);
            }
          });
        }

        function updateColors() {
          const colorThemes = window.allColorThemes[window.pdfTheme];
          let colorCounter = -1;
          
          const groups = document.querySelectorAll('.export-group');
          groups.forEach((group, gIdx) => {
            if (window.colorCycleTrigger === 'group') colorCounter++;
            
            const groupColorIndex = Math.max(0, colorCounter);
            const groupThemeName = window.colorSequence[groupColorIndex % window.colorSequence.length] || 'indigo';
            let groupTheme = { ...colorThemes[groupThemeName] };

            if (window.enableGradients && window.colorSequence.length > 1 && !window.customTheme.enabled) {
              const [startColor, endColor] = window.getGradientPair(window.colorSequence, groupColorIndex);
              const startT = colorThemes[startColor];
              const endT = colorThemes[endColor];
              const fromClass = (startT.gradient || \`from-\${startColor}-500\`).split(' ')[0];
              const toClass = (endT.gradient || \`to-\${endColor}-600\`).split(' ')[1];
              groupTheme = {
                ...startT,
                bg: \`bg-gradient-to-br \${fromClass} \${toClass}\`,
                text: startT.text,
                gradientText: \`text-transparent bg-clip-text bg-gradient-to-br \${fromClass} \${toClass}\`,
              };
            }

            // Update Group level classes
            const oldGroupThemeJson = group.getAttribute('data-applied-theme-json');
            let oldGroupParams = null;
            try { if (oldGroupThemeJson) oldGroupParams = JSON.parse(oldGroupThemeJson); } catch(e){}
            if (!oldGroupParams) oldGroupParams = colorThemes[group.getAttribute('data-current-theme') || 'indigo'];

            // Apply to group background and direct children not in doc pages
            applyThemeToElement(group, oldGroupParams, groupTheme);
            group.setAttribute('data-current-theme', groupThemeName);
            group.setAttribute('data-applied-theme-json', JSON.stringify(groupTheme));

            // Iterate Documents
            const docs = group.querySelectorAll('.pdf-document-page');
            docs.forEach((doc, dIdx) => {
              if (window.colorCycleTrigger === 'document') colorCounter++;
              
              const docColorIndex = Math.max(0, colorCounter);
              const docThemeName = window.colorCycleTrigger === 'document' ? 
                (window.colorSequence[docColorIndex % window.colorSequence.length] || 'indigo') : groupThemeName;
              
              let docTheme = groupTheme;
              if (window.colorCycleTrigger === 'document') {
                docTheme = { ...colorThemes[docThemeName] };
                if (window.enableGradients && window.colorSequence.length > 1 && !window.customTheme.enabled) {
                  const [startColor, endColor] = window.getGradientPair(window.colorSequence, docColorIndex);
                  const startT = colorThemes[startColor];
                  const endT = colorThemes[endColor];
                  const fromClass = (startT.gradient || \`from-\${startColor}-500\`).split(' ')[0];
                  const toClass = (endT.gradient || \`to-\${endColor}-600\`).split(' ')[1];
                  docTheme = {
                    ...startT,
                    bg: \`bg-gradient-to-br \${fromClass} \${toClass}\`,
                    text: startT.text,
                    gradientText: \`text-transparent bg-clip-text bg-gradient-to-br \${fromClass} \${toClass}\`,
                  };
                }
              }

              const oldDocThemeJson = doc.getAttribute('data-applied-doc-theme-json');
              let oldDocParams = null;
              try { if (oldDocThemeJson) oldDocParams = JSON.parse(oldDocThemeJson); } catch(e){}
              if (!oldDocParams) oldDocParams = oldGroupParams;

              applyThemeToElement(doc, oldDocParams, docTheme);
              doc.setAttribute('data-doc-theme', docThemeName);
              doc.setAttribute('data-applied-doc-theme-json', JSON.stringify(docTheme));

              // Iterate Blocks for Header/Subheader triggers
              const blocks = doc.querySelectorAll('.pdf-block');
              blocks.forEach(block => {
                const bType = block.getAttribute('data-block-type');
                if (window.colorCycleTrigger === 'heading' && bType === 'heading') colorCounter++;
                if (window.colorCycleTrigger === 'subheading' && bType === 'subheading') colorCounter++;

                const blockColorIndex = Math.max(0, colorCounter);
                const blockThemeName = (window.colorCycleTrigger === 'heading' || window.colorCycleTrigger === 'subheading') ?
                  (window.colorSequence[blockColorIndex % window.colorSequence.length] || 'indigo') : docThemeName;

                let blockTheme = docTheme;
                if (window.colorCycleTrigger === 'heading' || window.colorCycleTrigger === 'subheading') {
                  blockTheme = colorThemes[blockThemeName];
                }

                const oldBlockThemeName = block.getAttribute('data-block-theme') || docThemeName;
                const oldBlockParams = colorThemes[oldBlockThemeName];
                
                applyThemeToElement(block, oldBlockParams, blockTheme);
                block.setAttribute('data-block-theme', blockThemeName);
              });
            });
          });

          function applyThemeToElement(root, oldTheme, newTheme) {
            const elements = [root, ...root.querySelectorAll('*')];
            elements.forEach(el => {
              Object.keys(oldTheme).forEach(key => {
                if (!newTheme[key]) return;
                const oldClasses = oldTheme[key].split(' ').filter(c => c);
                const newClasses = newTheme[key].split(' ').filter(c => c);

                let hasAll = true;
                for (let c of oldClasses) {
                  if (!el.classList.contains(c)) { hasAll = false; break; }
                }
                if (hasAll) {
                  for (let c of oldClasses) el.classList.remove(c);
                  for (let c of newClasses) el.classList.add(c);
                }
              });
            });
          }




            const oldThemeJson = group.getAttribute('data-applied-theme-json');
            let oldThemeParams = null;
            try { 
              if (oldThemeJson) oldThemeParams = JSON.parse(oldThemeJson); 
            } catch(e){}
            if (!oldThemeParams) oldThemeParams = colorThemes[oldThemeName];

            const elements = [group, ...group.querySelectorAll('*')];
            elements.forEach(el => {
              Object.keys(oldThemeParams).forEach(key => {
                const oldClasses = oldThemeParams[key].split(' ').filter(c => c);
                const newClasses = newTheme[key] ? newTheme[key].split(' ').filter(c => c) : [];

                let hasAll = true;
                for (let c of oldClasses) {
                  if (!el.classList.contains(c)) { hasAll = false; break; }
                }
                if (hasAll) {
                  for (let c of oldClasses) el.classList.remove(c);
                  for (let c of newClasses) el.classList.add(c);
                }
              });
            });
        }

        const colorList = document.getElementById('export-color-list');
        if (colorList) {
          function updateColorList() {
            const currentThemes = window.allColorThemes[window.pdfTheme];
            colorList.innerHTML = window.colorSequence.map((color, idx) => \`
              <div class="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group">
                <div class="w-4 h-4 rounded-full \${currentThemes[color]?.swatch || ''}" \${color.startsWith('custom-') ? \`style="background-color: #\${color.replace('custom-', '')}"\` : ''}></div>
                <span class="text-[10px] font-bold uppercase text-slate-500">\${color}</span>
                <button onclick="window.removeColorFromSequence(\${idx})" class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg class="w-3 h-3 text-slate-400 hover:text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            \`).join('');
          }
          window.removeColorFromSequence = (idx) => {
            if (window.colorSequence.length > 1) {
              window.colorSequence.splice(idx, 1);
              updateColors();
              updateColorList();
            }
          };
          // Patch updateColors to also refresh this list
          const originalUpdateColors = updateColors;
          updateColors = () => {
            originalUpdateColors();
            updateColorList();
          };
          updateColorList();
        }

        colorBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            if (color) {
              window.colorSequence.push(color);
              updateColors();
            }
          });
        });

        const colorPickers = document.querySelectorAll('.export-color-picker');
        colorPickers.forEach(picker => {
          picker.addEventListener('change', (e) => {
            const newHex = e.target.value.substring(1);
            const cName = \`custom-\${newHex}\`;
            window.colorSequence.push(cName);
            updateColors();
          });
        });

        // Create Main Modal
        const createMainModal = () => {
          const modal = document.createElement('div');
          modal.id = 'interactive-modal';
          modal.className = 'fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md hidden';
          
                    const isBrutalist = theme === 'brutalist';
          
          const containerClass = isBrutalist 
            ? 'bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]' 
            : 'bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800';
          
          const headerClass = 'p-6 sm:p-8 text-white relative overflow-hidden shrink-0';
          const closeBtnClass = isBrutalist ? 'bg-white border-4 border-black text-black' : 'bg-black/10 hover:bg-black/20 rounded-full';
          
          modal.innerHTML = \`
            <div class="\${containerClass} w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div id="interactive-modal-header" class="\${headerClass}">
                <div class="relative z-10">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl flex items-center justify-center">
                      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </div>
                    <span id="interactive-modal-label" class="font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs opacity-80">Information</span>
                  </div>
                  <h3 id="interactive-modal-title" class="text-xl sm:text-3xl font-black tracking-tight uppercase italic break-words"></h3>
                </div>
                <button id="interactive-modal-close-x" class="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 \${closeBtnClass} flex items-center justify-center transition-colors">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div class="p-6 sm:p-10 overflow-y-auto">
                <div id="interactive-modal-content" class="prose \${'text-slate-600'} max-w-none font-medium leading-relaxed text-sm sm:text-base"></div>
                <div class="pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end mt-6">
                  <button id="interactive-modal-close-btn" class="w-full sm:w-auto px-8 py-3 text-white font-black uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm sm:text-base">
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          \`;
          document.body.appendChild(modal);
          
          const close = () => modal.classList.add('hidden');
          document.getElementById('interactive-modal-close-x').addEventListener('click', close);
          document.getElementById('interactive-modal-close-btn').addEventListener('click', close);
          modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
        };
        
        createMainModal();

        function showModal(title, content, themeColor = 'indigo', label = 'Information') {
          const modal = document.getElementById('interactive-modal');
          const modalTitle = document.getElementById('interactive-modal-title');
          const modalContent = document.getElementById('interactive-modal-content');
          const modalHeader = document.getElementById('interactive-modal-header');
          const modalLabel = document.getElementById('interactive-modal-label');
          const modalCloseBtn = document.getElementById('interactive-modal-close-btn');
          
          const t = colorThemes[themeColor] || colorThemes.indigo;
          
          if (modalTitle) modalTitle.innerText = title;
          if (modalContent) modalContent.innerHTML = content;
          if (modalLabel) modalLabel.innerText = label;
          
          if (modalHeader) {
            modalHeader.className = modalHeader.className.replace(/bg-\S+/g, '');
            modalHeader.classList.add(t.bg);
          }
          
          if (modalCloseBtn) {
            modalCloseBtn.className = modalCloseBtn.className.replace(/bg-\S+/g, '');
            modalCloseBtn.classList.add(t.bg);
          }

          modal.classList.remove('hidden');
        }

        // Initialize Matchers
        document.querySelectorAll('[data-interactive="matcher"]').forEach(matcher => {
          const pairs = JSON.parse(matcher.getAttribute('data-pairs'));
          const terms = pairs.map((p, i) => ({ id: i, text: p.term })).sort(() => Math.random() - 0.5);
          const defs = pairs.map((p, i) => ({ id: i, text: p.def })).sort(() => Math.random() - 0.5);
          
          const termsContainer = matcher.querySelector('.grid > div:first-child');
          const defsContainer = matcher.querySelector('.grid > div:last-child');
          
          if (termsContainer && defsContainer) {
            termsContainer.innerHTML = terms.map(t => \`
              <button class="w-full p-4 rounded-xl font-bold text-sm transition-all border-2 text-left bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300" data-id="\${t.id}">\${t.text}</button>
            \`).join('');
            defsContainer.innerHTML = defs.map(d => \`
              <button class="w-full p-4 rounded-xl font-bold text-sm transition-all border-2 text-left bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300" data-id="\${d.id}">\${d.text}</button>
            \`).join('');
          }
        });

        // Global Event Listener for Interactivity
        document.addEventListener('click', (e) => {
          const trigger = e.target.closest('[data-interactive]');
          
          // Special case for Expandable which has its own header button
          const expandableHeader = e.target.closest('.expandable-header');
          if (expandableHeader) {
            e.preventDefault();
            e.stopPropagation();
            const container = expandableHeader.closest('.expandable-container');
            const content = container ? container.querySelector('.expandable-content') : null;
            const icon = expandableHeader.querySelector('svg');
            if (content) {
              const isHidden = content.classList.contains('max-h-0') || content.style.maxHeight === '0px';
              if (isHidden) {
                content.classList.remove('max-h-0', 'opacity-0');
                content.style.maxHeight = '10000px';
                content.style.opacity = '1';
                if (icon) icon.style.transform = 'rotate(180deg)';
              } else {
                content.classList.add('max-h-0', 'opacity-0');
                content.style.maxHeight = '0px';
                content.style.opacity = '0';
                if (icon) icon.style.transform = 'rotate(0deg)';
              }
            }
            return;
          }

          if (!trigger) return;

          const type = trigger.getAttribute('data-interactive');
          const themeColor = trigger.getAttribute('data-theme') || 'indigo';
          const t = colorThemes[themeColor] || colorThemes.indigo;

          if (type === 'reveal') {
            const isRevealed = trigger.getAttribute('data-revealed') === 'true';
            const label = trigger.querySelector('.reveal-label');
            const secret = trigger.querySelector('.reveal-secret');
            const revealedClasses = (trigger.getAttribute('data-revealed-classes') || '').split(' ');
            const unrevealedClasses = (trigger.getAttribute('data-unrevealed-classes') || '').split(' ');
            
            if (isRevealed) {
              trigger.setAttribute('data-revealed', 'false');
              if (label) label.classList.remove('hidden');
              if (secret) secret.classList.add('hidden');
              revealedClasses.forEach(c => c && trigger.classList.remove(c));
              unrevealedClasses.forEach(c => c && trigger.classList.add(c));
            } else {
              trigger.setAttribute('data-revealed', 'true');
              if (label) label.classList.add('hidden');
              if (secret) secret.classList.remove('hidden');
              unrevealedClasses.forEach(c => c && trigger.classList.remove(c));
              revealedClasses.forEach(c => c && trigger.classList.add(c));
            }
          } else if (type === 'flashcard') {
            const inner = trigger.querySelector('.preserve-3d');
            if (inner) {
              const isFlipped = inner.style.transform === 'rotateY(180deg)';
              inner.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
            }
          } else if (type === 'find-error') {
            const status = trigger.getAttribute('data-status') || 'idle';
            if (status === 'idle') {
              trigger.setAttribute('data-status', 'correct');
              const textSpan = trigger.querySelector('span');
              const explanationDiv = trigger.querySelector('div');
              if (textSpan) {
                textSpan.innerText = trigger.getAttribute('data-correct');
                textSpan.classList.add('bg-emerald-500', 'text-white', 'shadow-lg');
                textSpan.classList.remove('hover:bg-slate-100', 'dark:hover:bg-slate-800');
              }
              if (explanationDiv) {
                explanationDiv.classList.remove('hidden');
                explanationDiv.style.height = 'auto';
                explanationDiv.style.opacity = '1';
              }
            }
          } else if (type === 'voice-record') {
            const btn = e.target.closest('button');
            if (!btn) return;
            const phrase = trigger.getAttribute('data-phrase');
            
            if (btn.title === 'Listen to AI') {
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(phrase);
                window.speechSynthesis.speak(utterance);
              }
            } else {
              // Simulation
              if (btn.classList.contains('bg-rose-500')) {
                btn.classList.remove('bg-rose-500', 'animate-pulse');
                btn.classList.add('bg-slate-200', 'dark:bg-slate-700');
                btn.innerHTML = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>';
              } else {
                btn.classList.add('bg-rose-500', 'animate-pulse');
                btn.classList.remove('bg-slate-200', 'dark:bg-slate-700');
                btn.innerHTML = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>';
              }
            }
          } else if (type === 'matcher') {
            const btn = e.target.closest('button');
            if (!btn || btn.disabled) return;
            
            const isTerm = btn.closest('.grid > div:first-child');
            const id = parseInt(btn.getAttribute('data-id'));
            
            if (isTerm) {
              const prevSelected = trigger.querySelector('.term-selected');
              if (prevSelected) prevSelected.classList.remove('term-selected', 'ring-4', 'ring-indigo-500', 'scale-105');
              btn.classList.add('term-selected', 'ring-4', 'ring-indigo-500', 'scale-105');
              trigger.setAttribute('data-selected-term', id);
            } else {
              const prevSelected = trigger.querySelector('.def-selected');
              if (prevSelected) prevSelected.classList.remove('def-selected', 'ring-4', 'ring-indigo-500', 'scale-105');
              btn.classList.add('def-selected', 'ring-4', 'ring-indigo-500', 'scale-105');
              trigger.setAttribute('data-selected-def', id);
            }
            
            const termId = trigger.getAttribute('data-selected-term');
            const defId = trigger.getAttribute('data-selected-def');
            
            if (termId !== null && defId !== null) {
              const termBtn = trigger.querySelector('.term-selected');
              const defBtn = trigger.querySelector('.def-selected');
              
              if (termId === defId) {
                [termBtn, defBtn].forEach(b => {
                  b.classList.remove('term-selected', 'def-selected', 'ring-4', 'ring-indigo-500', 'scale-105', 'bg-white', 'dark:bg-slate-800');
                  b.classList.add('bg-emerald-500', 'border-emerald-600', 'text-white', 'opacity-50');
                  b.disabled = true;
                });
                const matches = (parseInt(trigger.getAttribute('data-matches') || '0')) + 1;
                trigger.setAttribute('data-matches', matches);
                const total = JSON.parse(trigger.getAttribute('data-pairs')).length;
                if (matches === total) {
                  const winMsg = document.createElement('div');
                  winMsg.className = 'mt-6 text-center text-emerald-500 font-black uppercase tracking-widest flex items-center justify-center gap-2';
                  winMsg.innerHTML = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> All Matched!';
                  trigger.appendChild(winMsg);
                }
              } else {
                [termBtn, defBtn].forEach(b => {
                  b.classList.add('bg-rose-500', 'border-rose-600', 'text-white');
                });
                setTimeout(() => {
                  [termBtn, defBtn].forEach(b => {
                    b.classList.remove('bg-rose-500', 'border-rose-600', 'text-white', 'term-selected', 'def-selected', 'ring-4', 'ring-indigo-500', 'scale-105');
                  });
                }, 1000);
              }
              trigger.removeAttribute('data-selected-term');
              trigger.removeAttribute('data-selected-def');
            }
          } else if (type === 'quiz') {
            const question = trigger.getAttribute('data-question');
            const options = JSON.parse(trigger.getAttribute('data-options'));
            const correctIndex = parseInt(trigger.getAttribute('data-correct-index'));
            
            let quizHtml = \`
              <div class="space-y-6">
                <div class="text-xl font-black text-slate-900 dark:text-white mb-6">\${question}</div>
                <div class="space-y-3">
                  \${options.map((opt, i) => \`
                    <button class="quiz-option w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-left font-bold hover:border-indigo-500 transition-all" data-index="\${i}">
                      \${opt}
                    </button>
                  \`).join('')}
                </div>
                <div id="quiz-feedback" class="hidden p-4 rounded-xl font-black text-center uppercase tracking-widest text-sm"></div>
              </div>
            \`;
            
            showModal('Quick Quiz', quizHtml, themeColor, 'Quick Quiz');
            
            const modal = document.getElementById('interactive-modal');
            const optionBtns = modal.querySelectorAll('.quiz-option');
            const feedback = document.getElementById('quiz-feedback');
            
            optionBtns.forEach(btn => {
              btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                optionBtns.forEach(b => b.disabled = true);
                
                if (idx === correctIndex) {
                  btn.classList.add('bg-emerald-500', 'border-emerald-600', 'text-white');
                  feedback.innerText = '✨ Correct! Well Done! ✨';
                  feedback.classList.add('bg-emerald-50', 'text-emerald-700', 'border-2', 'border-emerald-200');
                } else {
                  btn.classList.add('bg-rose-500', 'border-rose-600', 'text-white');
                  optionBtns[correctIndex].classList.add('bg-emerald-500', 'border-emerald-600', 'text-white');
                  feedback.innerText = '❌ Incorrect. Try again!';
                  feedback.classList.add('bg-rose-50', 'text-rose-700', 'border-2', 'border-rose-200');
                }
                feedback.classList.remove('hidden');
              });
            });
          } else if (type === 'photo-upload') {
             const text = trigger.getAttribute('data-text');
             const explanation = trigger.getAttribute('data-explanation');
             const photoUrl = trigger.getAttribute('data-photo');
             
             let photoHtml = \`
               <div class="space-y-6">
                 \${photoUrl ? \`
                   <div class="relative rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 p-2">
                     <img src="\${photoUrl}" class="w-full max-h-64 object-contain rounded-xl" />
                   </div>
                 \` : \`
                   <div class="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                     <svg class="w-12 h-12 text-slate-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                     <p class="text-slate-500 font-medium">No photo uploaded yet</p>
                   </div>
                 \`}
                 <div class="prose dark:prose-invert text-slate-600 max-w-none font-medium leading-relaxed">\${explanation}</div>
               </div>
             \`;
             showModal(text, photoHtml, themeColor, 'Interactive Photo');
          } else if (type === 'teacher') {
             const word = trigger.getAttribute('data-word') || 'Teacher Mode';
             const explanation = trigger.getAttribute('data-explanation') || '';
             const memory = trigger.getAttribute('data-memory') || '';
             const quiz = trigger.getAttribute('data-quiz') || '';
             const expand = trigger.getAttribute('data-expand') || '';
             
             let quizParsed = { type: 'text', content: 'No quiz provided' };
             if (quiz && quiz.startsWith('F::')) {
               const parts = quiz.split('::');
               quizParsed = { type: 'flashcard', question: parts[1], answer: parts[2] || '' };
             } else if (quiz && quiz.startsWith('M::')) {
               const parts = quiz.split('::');
               quizParsed = { type: 'mcq', question: parts[1], options: [parts[2], parts[3], parts[4], parts[5]].filter(Boolean), correctIndex: parseInt(parts[6] || '0', 10) };
             } else if (quiz) {
               quizParsed = { type: 'text', content: quiz };
             }
             
             let quizHtml = '';
             if (quizParsed.type === 'text') {
               quizHtml = \`<div class="prose dark:prose-invert max-w-none">\${quizParsed.content}</div>\`;
             } else if (quizParsed.type === 'flashcard') {
               quizHtml = \`
                 <div class="relative w-full cursor-pointer [perspective:1000px] group teacher-flashcard" style="min-height: 16rem;">
                   <div class="w-full h-full min-h-[16rem] transition-all duration-500 [transform-style:preserve-3d] relative flex items-center justify-center teacher-flashcard-inner">
                     <div class="absolute inset-0 [backface-visibility:hidden] w-full h-full bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                       <h3 class="text-xl font-bold">\${quizParsed.question}</h3>
                       <p class="absolute bottom-6 text-xs text-slate-400 font-bold uppercase tracking-widest">Click to flip</p>
                     </div>
                     <div class="absolute inset-0 [backface-visibility:hidden] w-full h-full bg-slate-100 dark:bg-slate-700 rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] shadow-sm overflow-auto flashcard-back">
                       <div class="prose dark:prose-invert max-w-none text-sm">\${quizParsed.answer}</div>
                       <p class="mt-4 text-xs text-slate-400 font-bold uppercase tracking-widest">Click to flip back</p>
                     </div>
                   </div>
                 </div>\`;
             } else if (quizParsed.type === 'mcq') {
                quizHtml = \`
                 <div class="space-y-6 flex flex-col items-center">
                   <div class="text-xl font-bold w-full">\${quizParsed.question}</div>
                   <div class="space-y-3 w-full">
                     \${quizParsed.options.map((opt, i) => \`
                       <button class="teacher-mcq-option w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-left font-bold hover:border-slate-300 dark:hover:border-slate-600 transition-all bg-white dark:bg-slate-800" data-index="\${i}">\${opt}</button>
                     \`).join('')}
                   </div>
                   <div id="teacher-mcq-feedback" class="hidden w-full p-4 rounded-xl font-black text-center uppercase tracking-widest text-sm mt-4"></div>
                 </div>\`;
             }
             
             let teacherHtml = \`
               <div class="flex flex-col md:flex-row gap-6">
                 <div class="md:w-1/4 flex flex-row md:flex-col gap-2 overflow-x-auto border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-4 md:pb-0 md:pr-4">
                   <button class="teacher-tab-btn active text-left px-4 py-3 rounded-2xl font-bold text-sm bg-slate-100 dark:bg-slate-800 shadow-sm border-t-white dark:border-t-slate-700 text-slate-800 dark:text-slate-200" data-target="teacher-exp">Explanation</button>
                   <button class="teacher-tab-btn text-left px-4 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" data-target="teacher-mem">Memory</button>
                   <button class="teacher-tab-btn text-left px-4 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" data-target="teacher-quiz">Quiz</button>
                   <button class="teacher-tab-btn text-left px-4 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" data-target="teacher-exp2">Expand</button>
                 </div>
                 <div class="md:w-3/4">
                   <div id="teacher-exp" class="teacher-tab-content block prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed bg-white dark:bg-slate-900">\${explanation}</div>
                   <div id="teacher-mem" class="teacher-tab-content hidden prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">\${memory}</div>
                   <div id="teacher-quiz" class="teacher-tab-content hidden bg-white dark:bg-slate-900">\${quizHtml}</div>
                   <div id="teacher-exp2" class="teacher-tab-content hidden prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed bg-white dark:bg-slate-900">\${expand}</div>
                 </div>
               </div>
             \`;
             showModal(word, teacherHtml, themeColor, 'Teacher Mode');
             
             const modal = document.getElementById('interactive-modal');
             const tabBtns = modal.querySelectorAll('.teacher-tab-btn');
             const tabContents = modal.querySelectorAll('.teacher-tab-content');
             tabBtns.forEach(btn => {
               btn.addEventListener('click', () => {
                 tabBtns.forEach(b => { 
                   b.classList.remove('active', 'bg-slate-100', 'dark:bg-slate-800', 'border-t-white', 'dark:border-t-slate-700', 'shadow-sm', 'text-slate-800', 'dark:text-slate-200'); 
                   b.classList.add('hover:bg-slate-50', 'dark:hover:bg-slate-800', 'text-slate-500', 'dark:text-slate-400');
                 });
                 btn.classList.add('active', 'bg-slate-100', 'dark:bg-slate-800', 'border-t-white', 'dark:border-t-slate-700', 'shadow-sm', 'text-slate-800', 'dark:text-slate-200');
                 btn.classList.remove('hover:bg-slate-50', 'dark:hover:bg-slate-800', 'text-slate-500', 'dark:text-slate-400');
                 tabContents.forEach(c => c.classList.add('hidden'));
                 document.getElementById(btn.getAttribute('data-target')).classList.remove('hidden');
               });
             });
             
             if (quizParsed.type === 'flashcard') {
               const fc = modal.querySelector('.teacher-flashcard');
               if (fc) {
                 const inner = fc.querySelector('.teacher-flashcard-inner');
                 fc.addEventListener('click', () => {
                   const isFlipped = inner.style.transform === 'rotateY(180deg)';
                   inner.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
                 });
               }
             } else if (quizParsed.type === 'mcq') {
               const opts = modal.querySelectorAll('.teacher-mcq-option');
               const fb = document.getElementById('teacher-mcq-feedback');
               opts.forEach(btn => {
                 btn.addEventListener('click', () => {
                   const idx = parseInt(btn.getAttribute('data-index'));
                   opts.forEach(b => b.disabled = true);
                   if (idx === quizParsed.correctIndex) {
                     btn.classList.add('bg-emerald-500', 'border-emerald-600', 'text-white');
                     btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-700');
                     if(fb) {
                      fb.innerText = '✨ Correct! Well Done! ✨';
                      fb.classList.add('bg-emerald-50', 'text-emerald-700', 'border-2', 'border-emerald-200');
                      fb.classList.remove('hidden');
                     }
                   } else {
                     btn.classList.add('bg-rose-500', 'border-rose-600', 'text-white');
                     btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-700');
                     const correctBtn = Array.from(opts).find(b => parseInt(b.getAttribute('data-index')) === quizParsed.correctIndex);
                     if (correctBtn) {
                       correctBtn.classList.add('bg-emerald-500', 'border-emerald-600', 'text-white');
                       correctBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-700');
                     }
                     if(fb) {
                      fb.innerText = '❌ Incorrect. Try again!';
                      fb.classList.add('bg-rose-50', 'text-rose-700', 'border-2', 'border-rose-200');
                      fb.classList.remove('hidden');
                     }
                   }
                 });
               });
             }
          } else {
            // Standard Overlays
            const title = trigger.getAttribute('data-term') || trigger.getAttribute('data-text') || trigger.getAttribute('data-type') || 'Information';
            const content = trigger.getAttribute('data-definition') || trigger.getAttribute('data-explanation') || trigger.getAttribute('data-content') || trigger.getAttribute('data-translation') || trigger.getAttribute('data-pronunciation') || trigger.getAttribute('data-correction') || trigger.getAttribute('data-detail');
            
            let label = 'Information';
            if (type === 'term') label = 'Terminology';
            if (type === 'explanation') label = "Teacher's Insight";
            if (type === 'translation') label = 'Translation';
            if (type === 'pronunciation') label = 'Pronunciation';
            if (type === 'correction') label = 'Correction';
            if (type === 'detail') label = 'Deep Dive';
            if (type === 'badge') label = trigger.getAttribute('data-type').toUpperCase();

            showModal(title, content, themeColor, label);
          }
        });
      });
    `;

    const customThemeStyles = customTheme.enabled
      ? `
    :root {
      --custom-primary: ${customTheme.primaryColor};
      --custom-secondary: ${customTheme.secondaryColor};
      --custom-accent: ${customTheme.accentColor};
      --custom-bg: ${customTheme.backgroundColor};
      --custom-text: ${customTheme.textColor};
      --custom-font-heading: '${customTheme.headingFont}', sans-serif;
      --custom-font-body: '${customTheme.bodyFont}', sans-serif;
      --custom-font-weight: ${customTheme.fontWeight};
      --custom-line-height: ${customTheme.lineHeight};
      --custom-letter-spacing: ${customTheme.letterSpacing}px;
    }
    body {
      background-color: var(--custom-bg) !important;
      color: var(--custom-text) !important;
      font-family: var(--custom-font-body) !important;
      font-weight: var(--custom-font-weight) !important;
      line-height: var(--custom-line-height) !important;
      letter-spacing: var(--custom-letter-spacing) !important;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--custom-font-heading) !important;
    }
    .export-group, .export-group > div {
      background-color: var(--custom-bg) !important;
      color: var(--custom-text) !important;
      border-color: var(--custom-primary) !important;
    }
    /* Override tailwind classes that might interfere */
    .tracking-tighter, .tracking-tight, .tracking-normal, .tracking-wide, .tracking-wider, .tracking-widest {
      letter-spacing: var(--custom-letter-spacing) !important;
    }
    .leading-none, .leading-tight, .leading-snug, .leading-normal, .leading-relaxed, .leading-loose {
      line-height: var(--custom-line-height) !important;
    }
    .font-thin, .font-extralight, .font-light, .font-normal, .font-medium, .font-semibold, .font-bold, .font-extrabold, .font-black {
      font-weight: var(--custom-font-weight) !important;
    }
    `
      : "";

    const uploadedFontStyle = uploadedPdfFont
      ? `
      @font-face {
        font-family: '${uploadedPdfFont.fontFamilyName}';
        src: url('${uploadedPdfFont.dataUrl}');
      }
      body, .export-group, .export-group div, .export-group p, h1, h2, h3, h4, h5, h6, span {
         font-family: '${uploadedPdfFont.fontFamilyName}', sans-serif !important;
      }
      `
      : "";

    const fontLink = customTheme.enabled
      ? `<link href="https://fonts.googleapis.com/css2?family=${[customTheme.headingFont, customTheme.bodyFont].map((f) => f.replace(/\s+/g, "+")).join("&family=")}&display=swap" rel="stylesheet">`
      : "";

    const htmlContent = `<!DOCTYPE html>
<html lang="en" class="${false ? "dark" : "light"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  ${fontLink}
  <style>
    ${styles}
    ${customThemeStyles}
    ${uploadedFontStyle}
    body { 
      background-color: ${false ? "#030303" : "#f8fafc"}; 
      font-family: system-ui, -apple-system, sans-serif; 
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
    
    ${
      false
        ? `
    body::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at center, #111 0%, #030303 100%);
      z-index: -1;
    }
    @keyframes float {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      50% { opacity: 0.3; }
      100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
    }
    .particle {
      position: fixed;
      width: 2px;
      height: 2px;
      background: #6366f1;
      border-radius: 50%;
      pointer-events: none;
      z-index: -1;
      animation: float 15s infinite linear;
    }
    `
        : ""
    }

    .explanation-trigger { border-bottom: 2px dashed currentColor; cursor: help; padding: 0 2px; font-weight: 700; }
    .explanation-trigger:hover { background-color: rgba(0,0,0,0.05); }
    
    .hidden { display: none !important; }
    
    @media print {
      body { padding: 0; background-color: white !important; }
      body::before { display: none; }
      .particle { display: none; }
      .print\\:break-inside-avoid { break-inside: avoid; }
      .print\\:break-before-page { break-before: page; }
      .print\\:break-after-avoid { break-after: avoid; }
      .print\\:shadow-none { box-shadow: none !important; }
      .print\\:border-none { border: none !important; }
      .print\\:p-0 { padding: 0 !important; }
      .print\\:m-0 { margin: 0 !important; }
      .print\\:hidden { display: none !important; }
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.2); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.4); }
  </style>
</head>
<body class="${false ? "bg-[#050510] text-indigo-100" : "bg-slate-50 text-slate-900"}">
  ${
    false
      ? Array(20)
          .fill(0)
          .map(
            () =>
              `<div class="particle" style="left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation-delay: ${Math.random() * 15}s; animation-duration: ${10 + Math.random() * 10}s;"></div>`,
          )
          .join("")
      : ""
  }
  ${clone.outerHTML}
  <script>${scriptContent}</script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exported-document.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const handleCopyJson = () => {
    copyToClipboard(JSON.stringify(documents, null, 2));
    alert("Document JSON copied to clipboard!");
    setShowMenu(false);
  };

  const handleAddPhoto = (docIndex: number, block: PdfBlock, insertIndex?: number) => {
    setDocuments((prev) => {
      const newDocs = [...prev];
      if (insertIndex !== undefined) {
        const newBlocks = [...newDocs[docIndex].blocks];
        newBlocks.splice(insertIndex + 1, 0, block);
        newDocs[docIndex] = {
          ...newDocs[docIndex],
          blocks: newBlocks,
        };
      } else {
        newDocs[docIndex] = {
          ...newDocs[docIndex],
          blocks: [...newDocs[docIndex].blocks, block],
        };
      }
      return newDocs;
    });
  };

  const handleUpdatePhoto = (docIndex: number, blockIndex: number, block: PdfBlock) => {
    setDocuments((prev) => {
      const newDocs = [...prev];
      const newBlocks = [...newDocs[docIndex].blocks];
      newBlocks[blockIndex] = block;
      newDocs[docIndex] = {
        ...newDocs[docIndex],
        blocks: newBlocks,
      };
      return newDocs;
    });
  };

  const handleDeleteBlock = (docTitle: string, blockIndex: number) => {
    setDocuments((prev) => {
      return prev.map((doc) => {
        if (doc.title === docTitle) {
          const newBlocks = [...doc.blocks];
          newBlocks.splice(blockIndex, 1);
          return { ...doc, blocks: newBlocks };
        }
        return doc;
      });
    });
  };

  const groupedDocs: Record<string, PdfDocument[]> = documents.reduce(
    (acc, doc) => {
      const group = doc.group || "Ungrouped";
      if (!acc[group]) acc[group] = [];
      acc[group].push(doc);
      return acc;
    },
    {} as Record<string, PdfDocument[]>,
  );

  return (
    <div
      className={`pdf-viewer-container fixed inset-0 overflow-y-auto z-[200] transition-colors duration-500 ${false ? "bg-[#f0f0f0] font-mono" : false ? "bg-[#030303] bg-[radial-gradient(circle_at_center,_#111_0%,_#030303_100%)]" : "bg-slate-50 dark:bg-slate-950"}`}
    >
      <style>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          /* Hide UI elements specifically instead of blanket hiding parents */
          nav, .action-bar, .export-remove, .particle, .global-settings-btn, [class*="fixed"]:not(.pdf-viewer-container), [class*="absolute"]:not(.export-group *) {
            display: none !important;
          }
          .pdf-viewer-container {
            position: static !important;
            overflow: visible !important;
            height: auto !important;
            width: 100% !important;
            background: white !important;
            z-index: auto !important;
            padding: 0 !important;
          }
          .export-document-content-container {
            zoom: 1 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }
          .export-group {
            margin-top: 0 !important;
            padding-top: 0 !important;
            page-break-before: auto !important;
          }
          .export-group:not(:first-child) {
            page-break-before: always !important;
          }
          .min-h-screen {
            min-height: auto !important;
            height: auto !important;
            position: static !important;
            overflow: visible !important;
          }
          .max-w-5xl {
            max-width: none !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Font size adjustments for print */
          .export-document-content-container h3,
          .export-document-content-container h4,
          .export-document-content-container [class*="text-4xl"],
          .export-document-content-container [class*="text-5xl"],
          .export-document-content-container [class*="text-6xl"],
          .export-document-content-container [class*="text-7xl"],
          .export-document-content-container [class*="text-8xl"],
          .export-document-content-container [class*="text-9xl"] {
            font-size: 22pt !important;
            line-height: 1.1 !important;
            margin-top: 12pt !important;
            margin-bottom: 8pt !important;
          }
          .export-document-content-container p,
          .export-document-content-container li,
          .export-document-content-container td,
          .export-document-content-container th,
          .export-document-content-container .text-lg,
          .export-document-content-container .text-xl,
          .export-document-content-container .text-2xl,
          .export-document-content-container .text-3xl,
          .export-document-content-container .text-4xl:not(h3):not(h4) {
            font-size: 11pt !important;
            line-height: 1.4 !important;
          }
          .export-document-content-container .text-sm,
          .export-document-content-container .text-xs {
            font-size: 9pt !important;
          }
          .export-document-content-container .mt-32,
          .export-document-content-container .mt-24,
          .export-document-content-container .mt-20 {
            margin-top: 18pt !important;
          }
          .export-document-content-container .mb-24,
          .export-document-content-container .mb-16,
          .export-document-content-container .mb-12,
          .export-document-content-container .mb-10 {
            margin-bottom: 12pt !important;
          }
          .export-document-content-container .p-16,
          .export-document-content-container .p-20,
          .export-document-content-container .p-12,
          .export-document-content-container .p-10,
          .export-document-content-container .p-8 {
            padding: 12pt !important;
          }
          .export-document-content-container .space-y-12,
          .export-document-content-container .space-y-16,
          .export-document-content-container .space-y-8 {
            gap: 8pt !important;
          }
          /* Ensure tables fit */
          .export-document-content-container table {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
          }
          .export-document-content-container th, 
          .export-document-content-container td {
            word-wrap: break-word !important;
            padding: 6pt !important;
          }
        }
      `}</style>
      {customTheme.enabled && (
        <>
          <link
            href={`https://fonts.googleapis.com/css2?family=${[customTheme.headingFont, customTheme.bodyFont].map((f) => f.replace(/\s+/g, "+")).join("&family=")}&display=swap`}
            rel="stylesheet"
          />
          <style>{`
            .export-document-content-container {
              --custom-primary: ${customTheme.primaryColor};
              --custom-secondary: ${customTheme.secondaryColor};
              --custom-accent: ${customTheme.accentColor};
              --custom-bg: ${customTheme.backgroundColor};
              --custom-text: ${customTheme.textColor};
              --custom-font-heading: '${customTheme.headingFont}', sans-serif;
              --custom-font-body: '${customTheme.bodyFont}', sans-serif;
              --custom-font-weight: ${customTheme.fontWeight};
              --custom-line-height: ${customTheme.lineHeight};
              --custom-letter-spacing: ${customTheme.letterSpacing}px;
            }
            .export-document-content-container {
              font-family: var(--custom-font-body) !important;
              font-weight: var(--custom-font-weight) !important;
              line-height: var(--custom-line-height) !important;
              letter-spacing: var(--custom-letter-spacing) !important;
              color: var(--custom-text) !important;
            }
            .export-document-content-container h1, 
            .export-document-content-container h2, 
            .export-document-content-container h3, 
            .export-document-content-container h4, 
            .export-document-content-container h5, 
            .export-document-content-container h6 {
              font-family: var(--custom-font-heading) !important;
            }
            .export-document-content-container .tracking-tighter, 
            .export-document-content-container .tracking-tight, 
            .export-document-content-container .tracking-normal, 
            .export-document-content-container .tracking-wide, 
            .export-document-content-container .tracking-wider, 
            .export-document-content-container .tracking-widest {
              letter-spacing: var(--custom-letter-spacing) !important;
            }
            .export-document-content-container .leading-none, 
            .export-document-content-container .leading-tight, 
            .export-document-content-container .leading-snug, 
            .export-document-content-container .leading-normal, 
            .export-document-content-container .leading-relaxed, 
            .export-document-content-container .leading-loose {
              line-height: var(--custom-line-height) !important;
            }
            .export-document-content-container .font-thin, 
            .export-document-content-container .font-extralight, 
            .export-document-content-container .font-light, 
            .export-document-content-container .font-normal, 
            .export-document-content-container .font-medium, 
            .export-document-content-container .font-semibold, 
            .export-document-content-container .font-bold, 
            .export-document-content-container .font-extrabold, 
            .export-document-content-container .font-black {
              font-weight: var(--custom-font-weight) !important;
            }
          `}</style>
        </>
      )}
      <CustomColorStyles colors={customColorPool} />
      {false && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${15 + Math.random() * 15}s`,
              }}
            />
          ))}
        </div>
      )}
      <div
        className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-4 space-y-8 relative pb-32"
        ref={viewerRef}
      >
        {customTheme.enabled && customTheme.logo && (
          <div className="flex justify-center mb-12">
            <img
              src={customTheme.logo}
              alt="Logo"
              className="max-h-32 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        {/* Top Bar */}
        <div
          className={`flex justify-between items-center action-bar print:hidden sticky top-0 z-[100] ${false ? "bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 rounded-b-3xl border-b border-slate-100 dark:border-slate-800 shadow-xl"} group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:!border-b group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:!rounded-none`}
          style={
            customTheme.enabled
              ? {
                  backgroundColor: customTheme.backgroundColor,
                  borderColor: customTheme.primaryColor + "33",
                }
              : {}
          }
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`export-remove flex items-center gap-2 ${false ? "text-black font-black border-2 border-black px-4 py-2 hover:bg-black hover:text-white" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"} transition-colors uppercase text-xs tracking-wider`}
              style={
                customTheme.enabled ? { color: customTheme.textColor } : {}
              }
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setShowToc(true)}
              className={`p-3 ${false ? "bg-white border-2 border-black hover:bg-black hover:text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:scale-105"} transition-all`}
              style={
                customTheme.enabled
                  ? {
                      backgroundColor: customTheme.primaryColor + "22",
                      color: customTheme.primaryColor,
                    }
                  : {}
              }
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <div className="relative ml-auto">
            <button
              id="export-menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              className={`p-3 ${false ? "bg-black text-white border-2 border-black hover:bg-white hover:text-black" : "bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-105"} transition-all group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:!border-white/20`}
              style={
                customTheme.enabled
                  ? { backgroundColor: customTheme.primaryColor }
                  : {}
              }
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {(() => {
              const menuContent = (
                <motion.div
                  key="export-menu-dropdown-motion"
                  id="export-menu-dropdown"
                  initial={isOverlayMode ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
                  animate={isOverlayMode ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                  exit={isOverlayMode ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
                  onClick={(e) => {
                    if (isOverlayMode && e.target === e.currentTarget) setShowMenu(false);
                  }}
                  className={isOverlayMode 
                    ? `fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 ${
                        appTheme === 'arcane' ? 'bg-[#020617]/95 backdrop-blur-xl' : 
                        appTheme === 'liquid-glass' ? 'bg-slate-900/40 dark:bg-black/60 backdrop-blur-md' :
                        appTheme === 'fluid' ? 'bg-indigo-950/60 backdrop-blur-2xl' :
                        appTheme === 'hollow-knight' ? 'bg-black/90 backdrop-blur-sm' :
                        'bg-slate-900/40 dark:bg-black/60 backdrop-blur-md'
                      } transition-all duration-500 ease-out` 
                    : "absolute right-0 sm:-right-4 mt-2 w-[calc(100vw-3rem)] sm:w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 py-6 z-[250] overflow-y-auto max-h-[75vh] origin-top-right custom-scrollbar group-[.visual-liquid-glass]/liquid-glass:!bg-slate-900/60 group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:border-white/20 group-[.visual-liquid-glass]/liquid-glass:shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
                  }
                >
                  {isOverlayMode ? (
                    <motion.div 
                      className={
                        appTheme === 'arcane' 
                        ? "w-full max-w-2xl bg-[#0f172a] border-2 border-[#fbbf24]/50 shadow-[0_0_100px_rgba(56,189,248,0.2)] rounded-[32px] sm:rounded-[48px] relative overflow-hidden flex flex-col max-h-[90vh] transition-all border-glow-arcane" 
                        : appTheme === 'liquid-glass'
                        ? "w-full max-w-lg bg-white/20 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-[32px] relative overflow-hidden flex flex-col max-h-[90vh] py-6 transition-all"
                        : appTheme === 'fluid'
                        ? "w-full max-w-lg bg-white/10 dark:bg-indigo-950/40 backdrop-blur-2xl border border-indigo-400/30 shadow-[0_30px_80px_rgba(79,70,229,0.4)] rounded-[40px] relative overflow-hidden flex flex-col max-h-[90vh] py-6 transition-all ring-1 ring-white/20"
                        : appTheme === 'hollow-knight'
                        ? "w-full max-w-lg bg-[#0a0a0a] border border-[#d4d4d8]/30 shadow-[0_0_80px_rgba(255,255,255,0.1)] rounded-[24px] relative overflow-hidden flex flex-col max-h-[90vh] py-6 transition-all font-serif ring-1 ring-white/10"
                        : "w-full max-w-lg bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-[32px] relative overflow-hidden flex flex-col max-h-[90vh] py-6 transition-all"
                      }
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    >
                      <div className={`flex items-center justify-between px-6 sm:px-8 ${appTheme === 'arcane' ? 'py-6 border-b border-[#334155]/50 bg-[#1e293b]/30' : 'pb-4 border-b border-white/10 mb-2'}`}>
                        <div className="flex items-center gap-4">
                          {appTheme === 'arcane' && (
                            <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/10 flex items-center justify-center border border-[#38bdf8]/30 relative overflow-hidden group">
                              <div className="absolute inset-0 bg-gradient-to-tr from-[#38bdf8]/20 to-transparent animate-pulse" />
                              <Settings className="w-6 h-6 text-[#38bdf8] relative z-10 animate-spin-slow" />
                            </div>
                          )}
                          <div>
                            {appTheme === 'arcane' ? (
                              <h3 className="text-base font-black text-[#fbbf24] uppercase tracking-[0.3em] font-mono leading-none mb-1">Hexcore Protocols</h3>
                            ) : appTheme === 'fluid' ? (
                              <h3 className="text-lg font-black text-white uppercase tracking-widest bg-gradient-to-r from-indigo-300 to-white bg-clip-text text-transparent">Configuration</h3>
                            ) : appTheme === 'hollow-knight' ? (
                              <h3 className="text-xl font-normal text-[#d4d4d8] tracking-[0.15em] font-serif">Charms & Relics</h3>
                            ) : (
                              <h3 className="text-sm font-black text-white uppercase tracking-widest">Settings</h3>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowMenu(false)}
                          className={appTheme === 'arcane' 
                            ? "w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-rose-500/10 text-[#475569] hover:text-rose-400 transition-all border border-[#334155] hover:border-rose-500/30 group" 
                            : "p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors group"
                          }
                        >
                          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                      </div>

                      <div className="overflow-y-auto custom-scrollbar flex-1 p-6 sm:p-8 space-y-6">
                        
                        {/* THEME SPECIFIC STYLES LIST (COLOR SETTINGS) */}
                        <div className="space-y-3">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${
                            appTheme === 'arcane' ? 'text-[#38bdf8] font-mono' :
                            appTheme === 'hollow-knight' ? 'text-[#a1a1aa] font-serif tracking-widest' :
                            'text-white/40'
                          }`}>
                            Selected Sequence
                          </p>
                          <div id="export-color-list" className="flex flex-wrap gap-2 sm:gap-3">
                            {colorSequence.map((color, idx) => (
                              <div key={`${color}-${idx}`} className="relative group/color">
                                <button 
                                  onClick={() => removeColorFromSequence(idx)}
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md transition-transform hover:scale-110 active:scale-95 ${activeColorThemes[color].swatch} ${appTheme === 'hollow-knight' ? 'ring-1 ring-white/10' : 'ring-1 ring-white/20'}`}
                                  title="Click to remove"
                                >
                                  {idx + 1}
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover/color:opacity-100 transition-opacity">
                                    <X className="w-4 h-4 text-white" />
                                  </div>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${
                            appTheme === 'arcane' ? 'text-[#38bdf8] font-mono' :
                            appTheme === 'hollow-knight' ? 'text-[#a1a1aa] font-serif tracking-widest' :
                            'text-white/40'
                          }`}>
                            Export Theme
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(["modern", "brutalist"] as PdfTheme[]).map((t) => (
                              <button
                                key={t}
                                onClick={() => setPdfTheme && setPdfTheme(t)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  pdfTheme === t 
                                    ? (appTheme === 'arcane' ? "bg-[#38bdf8] text-[#0f172a]" : "bg-white text-indigo-900 shadow-xl")
                                    : (appTheme === 'arcane' ? "bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155]" : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10")
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                            {onOpenGlobalThemes && (
                              <button
                                onClick={onOpenGlobalThemes}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  appTheme === 'arcane' ? "bg-[#1e293b] text-[#38bdf8] border border-[#38bdf8]/30 hover:bg-[#38bdf8]/10" : "bg-white/5 text-indigo-300 border border-indigo-500/30 hover:bg-white/10 hover:text-indigo-200"
                                }`}
                              >
                                <Palette className="w-3 h-3" /> App Theme
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${
                            appTheme === 'arcane' ? 'text-[#38bdf8] font-mono' :
                            appTheme === 'hollow-knight' ? 'text-[#a1a1aa] font-serif tracking-widest' :
                            'text-white/40'
                          }`}>
                            Add Color
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {availableColors.map((color) => (
                              <button
                                key={color}
                                onClick={() => addColorToSequence(color)}
                                className={`w-8 h-8 rounded-full transition-all hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-offset-transparent hover:ring-white/50 export-color-btn ${activeColorThemes[color].swatch}`}
                                data-color={color}
                                title={`Add ${color}`}
                              />
                            ))}
                            {customColorPool.map((color) => {
                              const hex = color.replace('custom-', '#');
                              return (
                                <button
                                  key={color}
                                  onClick={() => addColorToSequence(color)}
                                  className={`w-8 h-8 rounded-full transition-all hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-offset-transparent hover:ring-white/50 export-color-btn`}
                                  style={{ backgroundColor: hex }}
                                  data-color={color}
                                  title={`Add custom color ${hex}`}
                                />
                              );
                            })}
                            <label className="w-8 h-8 rounded-full transition-all hover:scale-110 border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer overflow-hidden relative" title="Add new custom color">
                                <Plus className="w-4 h-4 text-white/50" />
                                <input type="color" className="absolute opacity-0 w-[200%] h-[200%] z-10 cursor-pointer export-color-picker" onChange={(e) => {
                                  const newHex = e.target.value.substring(1);
                                  const cName = `custom-${newHex}`;
                                  if (!customColorPool.includes(cName)) {
                                    setCustomColorPool(p => [...p, cName]);
                                  }
                                  addColorToSequence(cName);
                                }} />
                            </label>
                          </div>
                        </div>

                        {appTheme === 'arcane' && (
                          <div className="space-y-4 pt-4 border-t border-[#334155]/50">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-[#cbd5e1] font-mono">Zoom Matrix</span>
                              <span id="export-zoom-text" className="text-xs font-black text-[#fbbf24] font-mono">{zoom}%</span>
                            </div>
                            <input
                              id="export-zoom-slider"
                              type="range" min="25" max="400" value={zoom}
                              onChange={(e) => setZoom(parseInt(e.target.value))}
                              className="w-full h-2 bg-[#1e293b] rounded-none appearance-none cursor-pointer accent-[#fbbf24] border border-[#475569]"
                            />
                            
                            <div className="flex flex-col pt-3 border-t border-[#334155]">
                              <span className="text-xs font-bold text-[#cbd5e1] font-mono">Override Font</span>
                              <div className="flex items-center gap-2 mt-2">
                                  <input
                                    type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" id="doc-font-upload-overlay"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setUploadedPdfFont({ name: file.name.split('.')[0], dataUrl: reader.result as string, fontFamilyName: `CustomFont_${Date.now()}` });
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                  <label htmlFor="doc-font-upload-overlay" className="flex-1 text-center py-2 bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/50 rounded-none font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-[#fbbf24]/20 transition-colors">
                                    Upload Font
                                  </label>
                                  {uploadedPdfFont && (
                                    <button onClick={() => setUploadedPdfFont(null)} className="p-2 text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 rounded-none transition-colors">
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-[#334155]">
                              <span className="text-xs font-bold text-[#cbd5e1] font-mono">Shielding (Cover)</span>
                              <button onClick={() => setIncludeCover(!includeCover)} className={`w-8 h-4 rounded-none transition-colors relative border ${includeCover ? 'bg-[#fbbf24]/20 border-[#fbbf24]' : 'bg-[#0f172a] border-[#475569]'}`}>
                                <motion.div animate={{ x: includeCover ? 18 : 2 }} className={`absolute top-0.5 w-2.5 h-2.5 rounded-none shadow-[0_0_5px_rgba(251,191,36,0.5)] ${includeCover ? 'bg-[#fbbf24]' : 'bg-[#475569]'}`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-[#334155]">
                              <span className="text-xs font-bold text-[#cbd5e1] font-mono">Gradient Mode</span>
                              <button onClick={() => setEnableGradients(!enableGradients)} className={`w-8 h-4 rounded-none transition-colors relative border ${enableGradients ? 'bg-[#38bdf8]/20 border-[#38bdf8]' : 'bg-[#0f172a] border-[#475569]'}`}>
                                <motion.div animate={{ x: enableGradients ? 18 : 2 }} className={`absolute top-0.5 w-2.5 h-2.5 rounded-none shadow-[0_0_5px_rgba(56,189,248,0.5)] ${enableGradients ? 'bg-[#38bdf8]' : 'bg-[#475569]'}`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-[#334155]">
                              <span className="text-xs font-bold text-[#cbd5e1] font-mono">Export Protocol</span>
                              <select value={exportStyle} onChange={(e) => setExportStyle(e.target.value as 'standard'|'drastic'|'fancy'|'theme')} className="bg-[#1e293b] border border-[#475569] text-xs font-mono font-bold px-2 py-1 rounded-none outline-none text-[#fbbf24] shadow-[0_0_10px_rgba(56,189,248,0.1)]">
                                <option value="standard">Standard</option>
                                <option value="drastic">Drastic</option>
                                <option value="fancy">Fancy</option>
                                <option value="theme">Arcane</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {appTheme !== 'arcane' && (
                          <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white/80">Zoom Level</span>
                              <span id="export-zoom-text" className="text-xs font-black text-white">{zoom}%</span>
                            </div>
                            <input
                              id="export-zoom-slider"
                              type="range" min="25" max="400" value={zoom}
                              onChange={(e) => setZoom(parseInt(e.target.value))}
                              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                            />
                            
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs font-bold text-white/80">Include TOC</span>
                              <button onClick={() => setIncludeToc(!includeToc)} className={`w-10 h-6 rounded-full transition-colors relative ${includeToc ? 'bg-emerald-500' : 'bg-white/10'}`}>
                                <motion.div animate={{ x: includeToc ? 20 : 4 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs font-bold text-white/80">Include Cover</span>
                              <button onClick={() => setIncludeCover(!includeCover)} className={`w-10 h-6 rounded-full transition-colors relative ${includeCover ? 'bg-emerald-500' : 'bg-white/10'}`}>
                                <motion.div animate={{ x: includeCover ? 20 : 4 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs font-bold text-white/80">Gradient Mode</span>
                              <button onClick={() => setEnableGradients(!enableGradients)} className={`w-10 h-6 rounded-full transition-colors relative ${enableGradients ? 'bg-indigo-500' : 'bg-white/10'}`}>
                                <motion.div animate={{ x: enableGradients ? 20 : 4 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-white/80">Export Style</span>
                              </div>
                              <select value={exportStyle} onChange={(e) => setExportStyle(e.target.value as 'standard'|'drastic'|'fancy'|'theme')} className="bg-black/20 text-xs font-bold px-2 py-1 rounded-md outline-none text-white border border-white/10">
                                <option value="standard">Standard</option>
                                <option value="drastic">Drastic</option>
                                <option value="fancy">Fancy</option>
                                <option value="theme">Theme Based</option>
                              </select>
                            </div>
                            
                            <div className="flex flex-col pt-2 border-t border-white/10">
                              <span className="text-xs font-bold text-white/80">Custom Font</span>
                              <div className="flex items-center gap-2 mt-2">
                                  <input
                                    type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" id="doc-font-upload-overlay2"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setUploadedPdfFont({ name: file.name.split('.')[0], dataUrl: reader.result as string, fontFamilyName: `CustomFont_${Date.now()}` });
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                  <label htmlFor="doc-font-upload-overlay2" className="flex-1 text-center py-3 bg-white/10 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-white/20 transition-colors">
                                    Upload Custom Font
                                  </label>
                                  {uploadedPdfFont && (
                                    <button onClick={() => setUploadedPdfFont(null)} className="p-3 text-white bg-rose-500/50 hover:bg-rose-500/80 rounded-xl transition-colors">
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className={`pt-4 border-t ${appTheme === 'arcane' ? 'border-[#334155]/50' : 'border-white/10'}`}>
                          <PdfNativeExportButton 
                            documents={documents}
                            themeColor={colorSequence[0]}
                            includeToc={includeToc}
                            includeCover={includeCover}
                            customTheme={customTheme}
                            colorSequence={colorSequence}
                            enableGradients={enableGradients}
                            exportStyle={exportStyle}
                            appTheme={appTheme}
                            className={`w-full flex items-center justify-center gap-2 py-4 mb-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                              appTheme === 'arcane' ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 hover:bg-[#38bdf8]/20' :
                              appTheme === 'hollow-knight' ? 'bg-white/10 text-[#d4d4d8] border border-[#d4d4d8]/30 hover:bg-white/20 font-serif' :
                              'bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 hover:scale-[1.02]'
                            }`}
                          >
                            {(isGenerating) => (
                              <>
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                                {isGenerating ? 'Generating...' : 'Download PDF'}
                              </>
                            )}
                          </PdfNativeExportButton>

                          <button
                            onClick={handleDownloadHtml}
                            className={`w-full flex items-center justify-center gap-2 py-4 mb-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                              appTheme === 'arcane' ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 hover:bg-[#38bdf8]/20' :
                              appTheme === 'hollow-knight' ? 'bg-white/10 text-[#d4d4d8] border border-[#d4d4d8]/30 hover:bg-white/20 font-serif' :
                              'bg-purple-500 text-white shadow-lg hover:bg-purple-600 hover:scale-[1.02]'
                            }`}
                          >
                            <Code className="w-4 h-4" /> Export HTML
                          </button>

                          <button
                            onClick={() => onSavePdf && onSavePdf(documents)}
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                              appTheme === 'arcane' ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 hover:bg-[#38bdf8]/20' :
                              appTheme === 'hollow-knight' ? 'bg-white/10 text-[#d4d4d8] border border-[#d4d4d8]/30 hover:bg-white/20 font-serif' :
                              'bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 hover:scale-[1.02]'
                            }`}
                          >
                            <Save className="w-4 h-4" /> Save PDF to Library
                          </button>
                          
                          <button
                            onClick={onBack}
                            className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider ${
                              appTheme === 'arcane' ? 'text-rose-400 hover:bg-rose-500/10' :
                              'text-white/60 hover:text-rose-400 hover:bg-white/5'
                            } transition-colors`}
                          >
                            <RotateCcw className="w-4 h-4" /> Reset Parser
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="contents">
                      {/* STANDARD DROPDOWN MODE CONTENT */}
                      <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          Selected Sequence
                        </p>
                        <div id="export-color-list" className="flex flex-wrap gap-2 mb-4">
                          {colorSequence.map((color, idx) => (
                            <div key={`${color}-${idx}`} className="relative group/color">
                              <button 
                                onClick={() => removeColorFromSequence(idx)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm transition-transform hover:scale-110 active:scale-95 ${activeColorThemes[color].swatch}`}
                              >
                                {idx + 1}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover/color:opacity-100 transition-opacity">
                                  <X className="w-3 h-3 text-white" />
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          Export Theme
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(["modern", "brutalist"] as PdfTheme[]).map((t) => (
                            <button
                              key={t}
                              onClick={() => setPdfTheme && setPdfTheme(t)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${pdfTheme === t ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"}`}
                            >
                              {t}
                            </button>
                          ))}
                          {onOpenGlobalThemes && (
                            <button
                              onClick={onOpenGlobalThemes}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                            >
                              <Palette className="w-3 h-3" /> App Theme
                            </button>
                          )}
                        </div>

                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          Add Color
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => addColorToSequence(color)}
                              className={`w-6 h-6 rounded-full transition-all hover:scale-110 hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 dark:hover:ring-slate-700 export-color-btn ${activeColorThemes[color].swatch}`}
                              data-color={color}
                            />
                          ))}
                          <label className="w-6 h-6 rounded-full transition-all hover:scale-110 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden relative">
                              <Plus className="w-3 h-3 text-slate-400" />
                              <input type="color" className="absolute opacity-0 w-[200%] h-[200%] z-10 cursor-pointer export-color-picker" onChange={(e) => {
                                const newHex = e.target.value.substring(1);
                                const cName = `custom-${newHex}`;
                                if (!customColorPool.includes(cName)) {
                                  setCustomColorPool(p => [...p, cName]);
                                }
                                addColorToSequence(cName);
                              }} />
                          </label>
                        </div>
                      </div>

                      <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                           Document Settings
                         </p>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Zoom Level</span>
                            <span id="export-zoom-text" className="text-xs font-black text-indigo-600">{zoom}%</span>
                          </div>
                          <input
                            id="export-zoom-slider"
                            type="range" min="25" max="400" value={zoom}
                            onChange={(e) => setZoom(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Include TOC</span>
                            <button 
                              onClick={() => setIncludeToc(!includeToc)}
                              className={`w-8 h-4 rounded-full transition-colors relative ${includeToc ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                              <motion.div animate={{ x: includeToc ? 18 : 2 }} className="absolute top-1 w-2 h-2 rounded-full bg-white shadow-sm" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Include Cover</span>
                            <button 
                              onClick={() => setIncludeCover(!includeCover)}
                              className={`w-8 h-4 rounded-full transition-colors relative ${includeCover ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                              <motion.div animate={{ x: includeCover ? 18 : 2 }} className="absolute top-1 w-2 h-2 rounded-full bg-white shadow-sm" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Gradient Mode</span>
                            <button 
                              onClick={() => setEnableGradients(!enableGradients)}
                              className={`w-8 h-4 rounded-full transition-colors relative ${enableGradients ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                              <motion.div animate={{ x: enableGradients ? 18 : 2 }} className="absolute top-1 w-2 h-2 rounded-full bg-white shadow-sm" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Color Trigger</span>
                            </div>
                            <select value={colorCycleTrigger} onChange={(e) => setColorCycleTrigger(e.target.value as any)} className="bg-slate-100 dark:bg-slate-800 text-xs font-bold px-2 py-1 rounded-md outline-none text-slate-700 dark:text-slate-300">
                              <option value="group">By Group</option>
                              <option value="document">By Document</option>
                              <option value="heading">By Header</option>
                              <option value="subheading">By Subheader</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Export Style</span>
                            </div>
                            <select value={exportStyle} onChange={(e) => setExportStyle(e.target.value as 'standard'|'drastic'|'fancy'|'theme')} className="bg-slate-100 dark:bg-slate-800 text-xs font-bold px-2 py-1 rounded-md outline-none text-slate-700 dark:text-slate-300">
                              <option value="standard">Standard</option>
                              <option value="drastic">Drastic</option>
                              <option value="fancy">Fancy</option>
                              <option value="theme">Theme Based</option>
                            </select>
                          </div>

                          <div className="flex flex-col pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Custom Font</span>
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                  type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" id="doc-font-upload-standard"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => setUploadedPdfFont({ name: file.name.split('.')[0], dataUrl: reader.result as string, fontFamilyName: `CustomFont_${Date.now()}` });
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <label htmlFor="doc-font-upload-standard" className="flex-1 text-center py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                                  Upload Font
                                </label>
                                {uploadedPdfFont && (
                                  <button onClick={() => setUploadedPdfFont(null)} className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg transition-colors">
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                            </div>
                            {uploadedPdfFont && (
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-2 truncate">
                                Active: {uploadedPdfFont.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-6 py-4 space-y-3">
                        <PdfNativeExportButton 
                            documents={documents}
                            themeColor={colorSequence[0]}
                            includeToc={includeToc}
                            includeCover={includeCover}
                            customTheme={customTheme}
                            colorSequence={colorSequence}
                            enableGradients={enableGradients}
                            exportStyle={exportStyle}
                            appTheme={appTheme}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_4px_0_var(--color-indigo-900)] hover:translate-y-0.5 active:shadow-none transition-all"
                        >
                            {(isGenerating) => (
                              <>
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                                {isGenerating ? 'Generating...' : 'Download PDF'}
                              </>
                            )}
                        </PdfNativeExportButton>

                        <button
                          onClick={handleDownloadHtml}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_4px_0_rgb(88,28,135)] hover:translate-y-0.5 active:shadow-none transition-all"
                        >
                          <Code className="w-4 h-4" /> Export HTML
                        </button>

                        <button
                          onClick={() => onSavePdf && onSavePdf(documents)}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_4px_0_rgb(5,150,105)] hover:translate-y-0.5 active:shadow-none transition-all"
                        >
                          <Save className="w-4 h-4" /> Save PDF
                        </button>
                        
                        <button
                          onClick={onBack}
                          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" /> Reset Parser
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
              return isOverlayMode 
                ? <OverlayPortal><AnimatePresence>{showMenu && menuContent}</AnimatePresence></OverlayPortal>
                : <AnimatePresence>{showMenu && menuContent}</AnimatePresence>;
            })()}
          </div>
        </div>

        <AnimatePresence>
          {isPhotoModeOpen && (
            <PhotoModeModal
              documents={documents}
              onAdd={handleAddPhoto}
              onUpdate={handleUpdatePhoto}
              onDelete={(dIdx, bIdx) => {
                const doc = documents[dIdx];
                if (doc) {
                  handleDeleteBlock(doc.title, bIdx);
                }
              }}
              initialTarget={targetInsert}
              initialBlock={editingBlock}
              onClose={() => {
                setIsPhotoModeOpen(false);
                setTargetInsert(null);
                setEditingBlock(null);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          
        </AnimatePresence>

        <AnimatePresence>
          {showToc && (
            <TableOfContents
              documents={documents}
              pdfTheme={pdfTheme}
              themeColor={colorSequence[0] || "indigo"}
              onClose={() => setShowToc(false)}
              customTheme={customTheme}
            />
          )}
        </AnimatePresence>

        <div className="overflow-x-auto custom-scrollbar pb-12">
          <div
            id="export-document-content"
            className="export-document-content-container transition-all duration-200 ease-out space-y-12 w-full group-[.visual-liquid-glass]/liquid-glass:!p-12"
            style={{
              zoom: zoom / 100,
              width: zoom > 100 ? `${10000 / zoom}%` : "100%",
              maxWidth: zoom > 100 ? "none" : "100%",
              margin: "0 auto",
            }}
          >
            {(() => {
              let colorCounter = -1;
              return Object.entries(groupedDocs).map(([groupName, docs], gIdx) => {
                if (colorCycleTrigger === 'group') colorCounter++;
                const groupColorIndex = Math.max(0, colorCounter);
                const baseTheme = colorSequence[groupColorIndex % colorSequence.length] || "indigo";
                const activeColorThemes = pdfTheme === "brutalist" ? brutalistColorThemes : colorThemes;
                let t = { ...activeColorThemes[baseTheme] };

                if (enableGradients && colorSequence.length > 1 && !customTheme.enabled) {
                  const [startColor, endColor] = getGradientPair(colorSequence, groupColorIndex);
                  const startT = activeColorThemes[startColor];
                  const endT = activeColorThemes[endColor];
                  
                  const fromClass = (startT.gradient || `from-${startColor}-500`).split(' ')[0];
                  const toClass = (endT.gradient || `to-${endColor}-600`).split(' ')[1];

                  t = {
                    ...startT,
                    bg: `bg-gradient-to-br ${fromClass} ${toClass}`,
                    text: startT.text,
                    gradientText: `text-transparent bg-clip-text bg-gradient-to-br ${fromClass} ${toClass}`,
                  };
                }


              // Apply custom theme overrides if enabled
              const customStyles = customTheme.enabled
                ? {
                    primaryColor: customTheme.primaryColor,
                    secondaryColor: customTheme.secondaryColor,
                    accentColor: customTheme.accentColor,
                    bg: customTheme.backgroundColor,
                    textColor: customTheme.textColor,
                    headingFont: customTheme.headingFont,
                    bodyFont: customTheme.bodyFont,
                    fontWeight: customTheme.fontWeight,
                    lineHeight: customTheme.lineHeight,
                    letterSpacing: customTheme.letterSpacing,
                    margins: customTheme.margins,
                    contentGap: customTheme.contentGap,
                  }
                : null;

              return (
                <div
                  key={groupName}
                  data-current-theme={baseTheme}
                  data-applied-theme-json={JSON.stringify(t)}
                  className={`export-group space-y-12 ${gIdx > 0 ? "print:break-before-page mt-32" : ""} relative group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none`}
                  style={
                    customStyles
                      ? {
                          fontFamily: customStyles.bodyFont,
                          lineHeight: customStyles.lineHeight,
                          letterSpacing: customStyles.letterSpacing + "px",
                          fontWeight: customStyles.fontWeight,
                        }
                      : {}
                  }
                >
                  {false && !customTheme.enabled && (
                    <div
                      className={`absolute inset-0 ${t.bg} opacity-10 blur-[120px] pointer-events-none -z-10`}
                    />
                  )}
                  {groupName !== "Ungrouped" && (
                    <div
                      className={`relative mb-24 overflow-hidden ${false ? `border-[12px] border-black ${t.bgLight} p-16 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] transform -rotate-1` : false ? `border-2 ${t.border} bg-slate-950/80 p-20 rounded-[4rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]` : ""}`}
                      style={
                        customStyles
                          ? {
                              borderColor: customStyles.primaryColor,
                              backgroundColor: customStyles.bg,
                            }
                          : {}
                      }
                    >
                      {true && (
                        <div
                          className={`absolute -left-10 top-1/2 -translate-y-1/2 text-[15rem] font-black ${false ? "text-white/5" : "text-slate-100 dark:text-slate-800/30"} select-none pointer-events-none uppercase tracking-tighter leading-none`}
                          style={
                            customStyles
                              ? { color: customStyles.primaryColor + "11" }
                              : {}
                          }
                        >
                          {groupName.slice(0, 3)}
                        </div>
                      )}
                      {false && !customTheme.enabled && (
                        <>
                          <div
                            className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ backgroundImage: t.bgPattern }}
                          />
                          <MysticBorder t={t} />
                        </>
                      )}
                      <div
                        className={`relative z-10 flex items-end gap-10 ${false ? "border-b-[12px] border-black pb-10" : false ? "border-b-4 " + t.border + " pb-12 group" : "border-b-[12px] " + t.border + " pb-8 group"}`}
                        style={
                          customStyles
                            ? { borderBottomColor: customStyles.primaryColor }
                            : {}
                        }
                      >
                        <div
                          className={`${false ? `w-32 h-32 ${t.bg} text-white flex items-center justify-center text-7xl font-black border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-3` : false ? "w-32 h-32 " + t.bg + " flex items-center justify-center text-white text-6xl font-black rounded-[2.5rem] shadow-[0_0_30px_rgba(var(--color-accent),0.4)] group-hover:rotate-[360deg] transition-transform duration-1000" : "w-24 h-24 " + t.bg + " flex items-center justify-center text-white text-5xl font-black rounded-3xl shadow-2xl " + t.shadow + " group-hover:rotate-12 transition-transform duration-500"} group-[.visual-liquid-glass]/liquid-glass:!bg-white/20 group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-xl group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/40 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:font-majestic`}
                          style={
                            customStyles
                              ? { backgroundColor: customStyles.primaryColor }
                              : {}
                          }
                        >
                          {false && !customTheme.enabled ? (
                            <RuneDecoration
                              className="text-4xl"
                              color="white"
                            />
                          ) : (
                            gIdx + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-6 mb-4">
                            <div
                              className={`h-1 w-20 ${t.bg} ${false ? t.glow : "border-2 border-black"} group-[.visual-liquid-glass]/liquid-glass:!bg-white group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:!w-12 group-[.visual-liquid-glass]/liquid-glass:!h-px`}
                              style={
                                customStyles
                                  ? {
                                      backgroundColor:
                                        customStyles.primaryColor,
                                    }
                                  : {}
                              }
                            />
                            <p
                              className={`text-sm font-black ${t.gradientText || t.text} uppercase tracking-[0.6em] ${false ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : ""} group-[.visual-liquid-glass]/liquid-glass:!italic group-[.visual-liquid-glass]/liquid-glass:font-majestic group-[.visual-liquid-glass]/liquid-glass:tracking-[0.8em] group-[.visual-liquid-glass]/liquid-glass:!text-white/60`}
                              style={
                                customStyles
                                  ? { color: customStyles.primaryColor }
                                  : {}
                              }
                            >
                              Module {String(gIdx + 1).padStart(2, "0")}
                            </p>
                          </div>
                          <h1
                            className={`text-7xl sm:text-9xl font-black ${false ? "text-black" : false ? "text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-slate-900 dark:text-white"} uppercase tracking-tighter leading-[0.8] break-words ${true ? "group-hover:translate-x-4 transition-transform duration-500" : "italic"} group-[.visual-liquid-glass]/liquid-glass:font-majestic group-[.visual-liquid-glass]/liquid-glass:font-normal group-[.visual-liquid-glass]/liquid-glass:capitalize group-[.visual-liquid-glass]/liquid-glass:tracking-tight group-[.visual-liquid-glass]/liquid-glass:text-9xl group-[.visual-liquid-glass]/liquid-glass:leading-[0.9] group-[.visual-liquid-glass]/liquid-glass:italic group-[.visual-liquid-glass]/liquid-glass:drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]`}
                            style={
                              customStyles
                                ? {
                                    color: customStyles.textColor,
                                    fontFamily: customStyles.headingFont,
                                  }
                                : {}
                            }
                          >
                            {groupName}
                          </h1>
                        </div>
                      </div>
                      {false && (
                        <div
                          className={`absolute top-0 right-0 w-32 h-32 ${t.accent} border-b-8 border-l-8 border-black transform translate-x-16 -translate-y-16 rotate-45`}
                          style={
                            customStyles
                              ? { backgroundColor: customStyles.accentColor }
                              : {}
                          }
                        />
                      )}
                    </div>
                  )}
                  {docs.map((doc, idx) => {
                    if (colorCycleTrigger === 'document') colorCounter++;
                    const docColorIndex = Math.max(0, colorCounter);
                    const docBaseTheme = colorCycleTrigger === 'document' 
                      ? (colorSequence[docColorIndex % colorSequence.length] || "indigo")
                      : baseTheme;
                    
                    let docT = t;
                    if (colorCycleTrigger === 'document') {
                       docT = { ...activeColorThemes[docBaseTheme] };
                       if (enableGradients && colorSequence.length > 1 && !customTheme.enabled) {
                         const [startColor, endColor] = getGradientPair(colorSequence, docColorIndex);
                         const startT = activeColorThemes[startColor];
                         const endT = activeColorThemes[endColor];
                         const fromClass = (startT.gradient || `from-${startColor}-500`).split(' ')[0];
                         const toClass = (endT.gradient || `to-${endColor}-600`).split(' ')[1];
                         docT = {
                           ...startT,
                           bg: `bg-gradient-to-br ${fromClass} ${toClass}`,
                           text: startT.text,
                           gradientText: `text-transparent bg-clip-text bg-gradient-to-br ${fromClass} ${toClass}`,
                         };
                       }
                    }

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`${false ? `bg-white border-8 border-black p-12 sm:p-24 shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] space-y-20 relative overflow-hidden` : false ? `bg-slate-950/40 backdrop-blur-xl rounded-[4rem] p-12 sm:p-20 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-2 ${docT.border} space-y-16 relative overflow-hidden` : "bg-white dark:bg-slate-900 rounded-[3rem] p-10 sm:p-16 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-12"} print:shadow-none print:border-none print:p-0 print:m-0 group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item`}
                        data-doc-theme={docBaseTheme}
                        data-applied-doc-theme-json={JSON.stringify(docT)}
                        style={
                          customStyles
                            ? {
                                backgroundColor: customStyles.bg,
                                borderColor: customStyles.primaryColor + "44",
                                padding: customStyles.margins + "px",
                              }
                            : {}
                        }
                      >
                        {false && (
                          <div
                            className={`absolute top-0 left-0 w-full h-4 ${docT.bg}`}
                            style={
                              customStyles
                                ? { backgroundColor: customStyles.primaryColor }
                                : {}
                            }
                          />
                        )}
                        {false && !customTheme.enabled && (
                          <>
                            <div
                              className="absolute inset-0 opacity-5 pointer-events-none"
                              style={{ backgroundImage: docT.bgPattern }}
                            />
                            <MysticBorder t={docT} />
                          </>
                        )}
                        <div
                          className={`space-y-6 ${false ? "border-b-[12px] border-black pb-12" : false ? "border-b-4 " + docT.border + " pb-12" : "border-b-8 border-slate-900 dark:border-white pb-8"} print:break-after-avoid`}
                          style={
                            customStyles
                              ? { borderBottomColor: customStyles.primaryColor }
                              : {}
                          }
                        >
                          <div className="flex justify-between items-start gap-8">
                            <h2
                              className={`text-6xl sm:text-8xl font-black ${false ? "text-black" : false ? "text-white font-serif drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-slate-900 dark:text-white"} tracking-tighter leading-[0.85] break-words uppercase italic flex-1 group-[.visual-liquid-glass]/liquid-glass:font-majestic group-[.visual-liquid-glass]/liquid-glass:font-normal group-[.visual-liquid-glass]/liquid-glass:capitalize group-[.visual-liquid-glass]/liquid-glass:tracking-tight group-[.visual-liquid-glass]/liquid-glass:text-8xl group-[.visual-liquid-glass]/liquid-glass:leading-[0.9] group-[.visual-liquid-glass]/liquid-glass:italic group-[.visual-liquid-glass]/liquid-glass:drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)] group-[.visual-liquid-glass]/liquid-glass:text-white`}
                              dir="auto"
                              style={
                                customStyles
                                  ? {
                                      color: customStyles.textColor,
                                      fontFamily: customStyles.headingFont,
                                    }
                                  : {}
                              }
                            >
                              {doc.title}
                            </h2>
                            {customTheme.enabled && customTheme.logo && (
                              <img
                                src={customTheme.logo}
                                className="h-24 w-auto object-contain"
                                alt="Custom Logo"
                              />
                            )}
                          </div>
                          <div
                            className={`flex items-center gap-8 ${false ? "text-black" : false ? "text-indigo-400" : "text-slate-400 dark:text-slate-100"} font-black uppercase text-sm tracking-[0.4em]`}
                            style={
                              customStyles
                                ? { color: customStyles.primaryColor }
                                : {}
                            }
                          >
                            <span className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 ${false ? docT.bg + " border-2 border-black" : false ? "rounded-full " + docT.bg + " " + docT.glow : "rounded-full " + docT.bg}`}
                                style={
                                  customStyles
                                    ? {
                                        backgroundColor:
                                          customStyles.primaryColor,
                                      }
                                    : {}
                                }
                              />{" "}
                              {customTheme.enabled
                                ? "CUSTOM THEME"
                                : "PDF ENGINE"}
                            </span>
                            <span
                              className={`w-2 h-2 ${false ? "bg-black" : "bg-slate-300 dark:bg-slate-700 rounded-full"}`}
                              style={
                                customStyles
                                  ? {
                                      backgroundColor:
                                        customStyles.primaryColor + "44",
                                    }
                                  : {}
                              }
                            />
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div
                          className="space-y-12"
                          style={
                            customStyles
                              ? {
                                  gap: customStyles.contentGap + "px",
                                  display: "flex",
                                  flexDirection: "column",
                                }
                              : {}
                          }
                        >
                          {doc.blocks.map((block, bIdx) => {
                            if (colorCycleTrigger === 'heading' && block.type === 'heading') colorCounter++;
                            if (colorCycleTrigger === 'subheading' && block.type === 'subheading') colorCounter++;
                            
                            const blockColorIndex = Math.max(0, colorCounter);
                            const blockBaseTheme = (colorCycleTrigger === 'heading' || colorCycleTrigger === 'subheading')
                              ? (colorSequence[blockColorIndex % colorSequence.length] || "indigo")
                              : docBaseTheme;

                            // Resolve keywords
                            const keywords: Record<string, string> = {};
                            doc.blocks.forEach((b) => {
                              if (
                                b.type === "vocabulary" &&
                                b.term &&
                                b.definition
                              ) {
                                keywords[b.term] = b.definition;
                              }
                            });

                            return (
                              <div
                                key={bIdx}
                                className="print:break-inside-avoid"
                                data-block-theme={blockBaseTheme}
                              >
                                <PdfBlockRenderer
                                  block={block}
                                  theme={(colorCycleTrigger === 'heading' || colorCycleTrigger === 'subheading') ? blockBaseTheme as any : (colorCycleTrigger === 'document' ? JSON.stringify(docT) : JSON.stringify(t)) as any}
                                  keywords={keywords}
                                  pdfTheme={pdfTheme}
                                  customTheme={
                                    customTheme.enabled ? customTheme : undefined
                                  }
                                  onDelete={
                                    block.type === "image"
                                      ? () => handleDeleteBlock(doc.title, bIdx)
                                      : undefined
                                  }
                                  onUpdate={(newBlock) => {
                                    setDocuments((prev) => {
                                      const newDocs = [...prev];
                                      const foundDIdx = newDocs.findIndex(
                                        (d) => d.title === doc.title,
                                      );
                                      if (foundDIdx !== -1) {
                                        const newBlocks = [
                                          ...newDocs[foundDIdx].blocks,
                                        ];
                                        newBlocks[bIdx] = newBlock;
                                        newDocs[foundDIdx] = {
                                          ...newDocs[foundDIdx],
                                          blocks: newBlocks,
                                        };
                                      }
                                      return newDocs;
                                    });
                                  }}
                                  onSettings={() => {
                                    const dIdxFound = documents.findIndex(d => d.title === doc.title);
                                    setTargetInsert({ docIndex: dIdxFound, blockIndex: bIdx });
                                    setEditingBlock(block);
                                    setIsPhotoModeOpen(true);
                                  }}
                                  isEditMode={isPhotoModeEnabled}
                                />
                                {isPhotoModeEnabled && (
                                  <div className="flex justify-center -mb-8 mt-4 relative z-10 print:hidden">
                                     <button
                                       onClick={() => {
                                         const dIdxFound = documents.findIndex(d => d.title === doc.title);
                                         setTargetInsert({ docIndex: dIdxFound, blockIndex: bIdx });
                                         setIsPhotoModeOpen(true);
                                       }}
                                       className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-125 hover:rotate-90 active:scale-95 transition-all group"
                                       title="Add photo block here"
                                     >
                                       <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
                                       <div className="absolute top-full mt-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest shadow-xl">
                                         Add Block
                                       </div>
                                     </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            });
          })()}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExplanationOverlay = ({
  text,
  explanation,
  theme,
  pdfTheme = "modern",
}: {
  text: string;
  explanation: string;
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  return (
    <>
      <span
        onClick={() => setIsOpen(true)}
        className={`explanation-trigger inline-flex items-center cursor-help border-b-4 ${t.border} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-2 py-0.5 rounded-none font-black text-slate-900 dark:text-white mx-1 ${pdfTheme === 'brutalist' ? "bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" : pdfTheme === 'liquid-glass' ? "bg-slate-900/50 text-indigo-100 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]" : ""} group-[.visual-liquid-glass]/liquid-glass:!border-b group-[.visual-liquid-glass]/liquid-glass:!border-white/40 group-[.visual-liquid-glass]/liquid-glass:!font-majestic group-[.visual-liquid-glass]/liquid-glass:!font-normal group-[.visual-liquid-glass]/liquid-glass:!italic group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/10`}
        data-interactive="explanation"
        data-text={text}
        data-explanation={explanation}
        data-theme={theme}
      >
        {text}
        <Sparkles
          className={`w-4 h-4 ml-2 ${t.text} ${pdfTheme === 'liquid-glass' ? "animate-pulse" : ""}`}
        />
      </span>

      <AnimatePresence>
        {isOpen && (
          <OverlayPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`${false ? "bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]" : false ? "bg-slate-950 border-2 border-indigo-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2.5rem]" : "bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800"} w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`p-6 sm:p-8 ${t.bg} text-white relative overflow-hidden shrink-0`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                  <BookOpen className="w-24 h-24 sm:w-32 sm:h-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`${pdfTheme === 'brutalist' ? "w-10 h-10 bg-white border-4 border-black text-black" : pdfTheme === 'liquid-glass' ? "w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white" : "w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl text-white"} flex items-center justify-center`}
                    >
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs text-white/80">
                      Teacher's Insight
                    </span>
                  </div>
                  <h3
                    className="text-xl sm:text-3xl font-black tracking-tight uppercase italic break-words !text-white"
                    dir="auto"
                  >
                    {text}
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 ${false ? "bg-white border-4 border-black text-black" : false ? "bg-white/10 hover:bg-white/20 rounded-full border border-white/10" : "bg-black/10 hover:bg-black/20 rounded-full"} flex items-center justify-center transition-colors`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="p-6 sm:p-10 space-y-6 overflow-y-auto">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`w-1 h-full min-h-[3rem] sm:min-h-[4rem] ${t.bg} rounded-full opacity-20`}
                  />
                  <div
                    className={`prose dark:prose-invert max-w-none ${false ? "text-black font-black" : false ? "text-indigo-100 font-medium" : "text-slate-600 dark:text-slate-300 font-medium"} leading-relaxed text-sm sm:text-base`}
                  >
                    <MarkdownRenderer
                      content={explanation}
                      theme={theme}
                      pdfTheme={pdfTheme}
                    />
                  </div>
                </div>
                <div className="pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`w-full sm:w-auto px-8 py-3 ${pdfTheme === 'brutalist' ? "bg-black text-white border-4 border-black hover:bg-white hover:text-black" : pdfTheme === 'liquid-glass' ? "bg-indigo-600 text-white rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95" : t.bg + " text-white rounded-xl sm:rounded-2xl shadow-lg hover:scale-105 active:scale-95"} transition-all text-sm sm:text-base font-black uppercase tracking-widest`}
                  >
                    Got it, Teacher!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </OverlayPortal>
        )}
      </AnimatePresence>
    </>
  );
};

const PhotoModeModal = ({
  documents,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
  initialTarget,
  initialBlock,
}: {
  documents: PdfDocument[];
  onAdd: (docIndex: number, block: PdfBlock, insertIndex?: number) => void;
  onUpdate?: (docIndex: number, blockIndex: number, block: PdfBlock) => void;
  onDelete?: (docIndex: number, blockIndex: number) => void;
  onClose: () => void;
  initialTarget?: { docIndex: number; blockIndex: number } | null;
  initialBlock?: PdfBlock | null;
}) => {
  const [selectedDocIndex, setSelectedDocIndex] = useState(initialTarget?.docIndex ?? 0);
  const [imageUrl, setImageUrl] = useState(initialBlock?.imageUrl || "");
  const [caption, setCaption] = useState(initialBlock?.imageCaption || initialBlock?.content || "");
  const [width, setWidth] = useState(initialBlock?.imageWidth || 100);
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(
    initialBlock?.imageAlignment || "center",
  );
  const [pushedBlocks, setPushedBlocks] = useState(initialBlock?.imageBlocks ?? 2);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTarget) {
      setSelectedDocIndex(initialTarget.docIndex);
    }
  }, [initialTarget]);

  useEffect(() => {
    if (initialBlock) {
      setImageUrl(initialBlock.imageUrl || "");
      setCaption(initialBlock.imageCaption || initialBlock.content || "");
      setWidth(initialBlock.imageWidth || 100);
      setAlignment(initialBlock.imageAlignment || "center");
      setPushedBlocks(initialBlock.imageBlocks ?? 2);
    }
  }, [initialBlock]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!imageUrl) return;
    const blockData: PdfBlock = {
      type: "image",
      content: caption,
      imageUrl,
      imageWidth: width,
      imageAlignment: alignment,
      imageCaption: caption,
      imageBlocks: pushedBlocks,
    };

    if (initialBlock && initialTarget && onUpdate) {
      onUpdate(initialTarget.docIndex, initialTarget.blockIndex, blockData);
    } else {
      onAdd(selectedDocIndex, blockData, initialTarget?.blockIndex);
    }
    onClose();
  };

  return (
    <OverlayPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 bg-indigo-600 text-white relative overflow-hidden shrink-0">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <ImagePlus className="w-6 h-6" />
              </div>
              <span className="font-black uppercase tracking-[0.2em] text-xs opacity-80">
                Photo Mode
              </span>
            </div>
            <h3 className="text-3xl font-black tracking-tight uppercase italic">
              {initialBlock ? "Edit Photo" : "Add a Photo"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Target Document
            </label>
            <select
              value={selectedDocIndex}
              onChange={(e) => setSelectedDocIndex(parseInt(e.target.value))}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
            >
              {documents.map((doc, i) => (
                <option key={i} value={i}>
                  {doc.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Image Source
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Paste URL or upload file..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Upload className="w-6 h-6" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {imageUrl && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg shadow-md"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Width ({width}%)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Alignment
              </label>
              <div className="flex gap-2">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => setAlignment(align)}
                    className={`flex-1 py-2 rounded-xl font-bold uppercase text-[10px] border-2 transition-all ${alignment === align ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "border-slate-100 text-slate-400 dark:border-slate-800"}`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Pushed Blocks ({pushedBlocks})
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={pushedBlocks}
                  onChange={(e) => setPushedBlocks(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 min-w-[20px] text-center">
                  {pushedBlocks}
                </span>
              </div>
            </div>
            <div className="space-y-2 flex flex-col justify-center">
              <p className="text-[10px] text-slate-400 font-medium leading-tight">
                Adjusts how many text blocks are pulled alongside the photo in the Standard PDF layout.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Caption (Optional)
            </label>
            <input
              type="text"
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex gap-4">
            {initialBlock && initialTarget && onDelete && (
              <button
                onClick={() => {
                  onDelete(initialTarget.docIndex, initialTarget.blockIndex);
                  onClose();
                }}
                className="px-6 py-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" /> Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!imageUrl}
              className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${imageUrl ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
            >
              <Sparkles className="w-5 h-5" /> {initialBlock ? "Save Changes" : "Insert Photo"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </OverlayPortal>
);
};

const RevealOverlay = ({
  label,
  secret,
  theme,
  pdfTheme = "modern",
}: {
  label: string;
  secret: string;
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  const revealedClasses =
    pdfTheme === 'brutalist'
      ? `bg-white border-4 border-black text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1`
      : pdfTheme === 'liquid-glass'
        ? `bg-slate-900/80 ${t.text} ring-1 ${t.border} shadow-[0_0_15px_rgba(var(--color-accent),0.3)]`
        : `${t.bgLight} ${t.text} ring-2 ${t.border}`;

  const unrevealedClasses =
    pdfTheme === 'brutalist'
      ? `bg-white border-4 border-black text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:scale-105 hover:bg-yellow-300 transition-all`
      : pdfTheme === 'liquid-glass'
        ? "bg-slate-950 text-indigo-400/50 border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]"
        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-700";

  return (
    <span
      onClick={() => setIsRevealed(!isRevealed)}
      className={`reveal-trigger inline-flex items-center cursor-pointer px-4 py-1.5 rounded-xl transition-all duration-500 font-black mx-1 group relative overflow-hidden ${
        isRevealed ? revealedClasses : unrevealedClasses
      }`}
      data-interactive="reveal"
      data-label={label}
      data-secret={secret}
      data-theme={theme}
      data-revealed-classes={revealedClasses}
      data-unrevealed-classes={unrevealedClasses}
    >
      {!isRevealed && true && (
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />
      )}
      <span
        className={`reveal-label flex items-center gap-3 ${isRevealed ? "hidden" : ""}`}
      >
        <span
          className="uppercase tracking-widest text-[10px] sm:text-xs"
          dir="auto"
        >
          {label}
        </span>
        <div
          className={`p-1 rounded-full ${pdfTheme === 'brutalist' ? "bg-white text-black" : "bg-white/10"}`}
        >
          <Eye className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
        </div>
      </span>
      <span
        className={`reveal-secret flex items-center gap-3 ${isRevealed ? "" : "hidden"}`}
      >
        <div className="prose-sm dark:prose-invert">
          <MarkdownRenderer
            content={secret}
            theme={theme}
            pdfTheme={pdfTheme}
          />
        </div>
        <div
          className={`p-1 rounded-full ${pdfTheme === 'brutalist' ? "bg-black text-white" : "bg-black/10"}`}
        >
          <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
      </span>
    </span>
  );
};

const ExpandableOverlay = ({
  title,
  content,
  theme,
  pdfTheme = "modern",
}: {
  title: string;
  content: string;
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  return (
    <div
      className={`expandable-container my-8 ${
        pdfTheme === 'brutalist'
          ? `border-8 border-black bg-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transform rotate-1`
          : pdfTheme === 'liquid-glass'
            ? `border-2 ${t.border} bg-[#0a0a1a]/60 backdrop-blur-md rounded-[2rem] shadow-[0_0_30px_rgba(0,0,0,0.3)]`
            : "border-2 " + t.borderLight + " " + t.bgLight + " rounded-3xl"
      } overflow-hidden transition-all duration-500`}
      data-interactive="expandable"
      data-title={title}
      data-content={content}
      data-theme={theme}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className={`expandable-header w-full flex items-center justify-between p-6 sm:p-10 ${pdfTheme === 'brutalist' ? "bg-black text-white" : pdfTheme === 'liquid-glass' ? "bg-white/5 hover:bg-white/10" : "hover:bg-white/50 dark:hover:bg-slate-800/50"} transition-colors`}
      >
        <div className="flex items-center gap-6">
          <div
            className={`${false ? `w-14 h-14 ${t.bg} border-4 border-white text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]` : false ? `w-12 h-12 rounded-xl border-2 ${t.border} ${t.bg} text-white shadow-[0_0_15px_rgba(var(--color-accent),0.5)]` : "w-10 h-10 rounded-2xl " + t.bg + " text-white shadow-lg"} flex items-center justify-center shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          >
            {isExpanded ? (
              <ChevronUp className="w-8 h-8" />
            ) : (
              <ChevronDown className="w-8 h-8" />
            )}
          </div>
          <span
            className={`text-2xl sm:text-4xl font-black tracking-tighter uppercase italic text-left ${false ? "text-white" : false ? t.text + " font-serif" : "text-slate-900 dark:text-white"}`}
            dir="auto"
          >
            {title}
          </span>
        </div>
        <div
          className={`px-4 py-2 ${false ? `${t.accent} text-black border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]` : false ? `border ${t.border} ${t.text} bg-white/5` : t.bg + " text-white"} text-xs font-black rounded-none uppercase tracking-[0.3em] hidden sm:block`}
        >
          {false ? "PDF_EXP" : "INTERACTIVE"}
        </div>
      </button>

      <div
        className={`expandable-content transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div
          className={`p-8 sm:p-12 border-t-8 ${false ? "border-black bg-white" : false ? `border-t-2 ${t.border} bg-slate-900/40` : t.borderLight + " bg-white/50 dark:bg-slate-900/50"}`}
        >
          <div
            className={`prose dark:prose-invert max-w-none ${pdfTheme === 'brutalist' ? "text-black font-black text-xl leading-tight" : pdfTheme === 'liquid-glass' ? "text-indigo-100 font-medium font-serif" : "text-slate-600 dark:text-slate-100 font-medium"} leading-relaxed text-base sm:text-lg group-[.visual-liquid-glass]/liquid-glass:!text-white`}
          >
            <MarkdownRenderer
              content={content}
              theme={theme}
              pdfTheme={pdfTheme}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const BadgeOverlay = ({
  type,
  content,
  theme,
  pdfTheme = "modern",
}: {
  type: string;
  content: string;
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];
  const getIcon = () => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("star") || lowerType.includes("important"))
      return <Star className="w-3 h-3" />;
    if (lowerType.includes("info")) return <Info className="w-3 h-3" />;
    if (lowerType.includes("check") || lowerType.includes("done"))
      return <CheckCircle className="w-3 h-3" />;
    if (lowerType.includes("zap") || lowerType.includes("fast"))
      return <Zap className="w-3 h-3" />;
    if (lowerType.includes("heart")) return <Heart className="w-3 h-3" />;
    return <Sparkles className="w-3 h-3" />;
  };

  return (
    <span
      className={`badge-overlay inline-flex items-center gap-3 px-4 py-1.5 ${
        pdfTheme === 'brutalist'
          ? `bg-black text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform rotate-2`
          : pdfTheme === 'liquid-glass'
            ? `bg-slate-900/80 ${t.text} border ${t.border} rounded-lg shadow-[0_0_10px_rgba(var(--color-accent),0.3)]`
            : t.bg + " text-white rounded-full shadow-lg"
      } font-black text-[11px] uppercase tracking-[0.2em] mx-1 transform hover:scale-110 transition-transform cursor-default group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-xl group-[.visual-liquid-glass]/liquid-glass:border group-[.visual-liquid-glass]/liquid-glass:border-white/20 group-[.visual-liquid-glass]/liquid-glass:!shadow-[0_8px_32px_rgba(0,0,0,0.2)] group-[.visual-liquid-glass]/liquid-glass:!rounded-xl`}
      data-interactive="badge"
      data-type={type}
      data-content={content}
      data-theme={theme}
    >
      <div
        className={
          false
            ? `p-1 ${t.bg} border-2 border-white`
            : false
              ? `animate-pulse`
              : ""
        }
      >
        {getIcon()}
      </div>
      <MarkdownRenderer content={content} theme={theme} pdfTheme={pdfTheme} />
    </span>
  );
};

const TermOverlay = ({
  term,
  definition,
  theme,
  pdfTheme = "modern",
}: {
  term: string;
  definition?: string;
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  return (
    <>
      <span
        onClick={() => setIsOpen(true)}
        className={`term-trigger inline-flex items-center cursor-pointer border-b-4 ${t.border} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-2 py-0.5 rounded-none font-black text-slate-900 dark:text-white mx-1 ${pdfTheme === 'brutalist' ? "bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" : pdfTheme === 'liquid-glass' ? "bg-slate-900/50 text-indigo-100 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]" : ""} group-[.visual-liquid-glass]/liquid-glass:!border-b group-[.visual-liquid-glass]/liquid-glass:!border-white/40 group-[.visual-liquid-glass]/liquid-glass:!font-majestic group-[.visual-liquid-glass]/liquid-glass:!font-normal group-[.visual-liquid-glass]/liquid-glass:!italic group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/10`}
        data-interactive="term"
        data-term={term}
        data-definition={definition}
        data-theme={theme}
      >
        {term}
        <Info
          className={`w-4 h-4 ml-2 ${t.text} ${pdfTheme === 'liquid-glass' ? "animate-pulse" : ""}`}
        />
      </span>

      <AnimatePresence>
        {isOpen && (
          <OverlayPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            >
                <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`${pdfTheme === 'brutalist' ? "bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]" : pdfTheme === 'liquid-glass' ? "bg-slate-950 border-2 border-indigo-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2.5rem]" : "bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800"} w-full max-w-lg overflow-hidden flex flex-col group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`p-6 sm:p-8 ${t.bg} text-white relative overflow-hidden shrink-0`}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`${pdfTheme === 'brutalist' ? "w-10 h-10 bg-white border-4 border-black text-black" : pdfTheme === 'liquid-glass' ? "w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white" : "w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl text-white"} flex items-center justify-center`}
                    >
                      <Info className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs text-white/80">
                      Terminology
                    </span>
                  </div>
                  <h3
                    className="text-xl sm:text-3xl font-black tracking-tight uppercase italic break-words !text-white"
                    dir="auto"
                  >
                    {term}
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 ${false ? "bg-white border-4 border-black text-black" : false ? "bg-white/10 hover:bg-white/20 rounded-full border border-white/10" : "bg-black/10 hover:bg-black/20 rounded-full"} flex items-center justify-center transition-colors`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="p-6 sm:p-10">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`w-1 h-full min-h-[3rem] sm:min-h-[4rem] ${t.bg} rounded-full opacity-20`}
                  />
                  <div
                    className={`prose dark:prose-invert max-w-none ${false ? "text-black font-black" : false ? "text-indigo-100 font-medium" : "text-slate-600 dark:text-slate-300 font-medium"} leading-relaxed text-sm sm:text-base`}
                  >
                    <MarkdownRenderer
                      content={definition || "No definition available."}
                      theme={theme}
                      pdfTheme={pdfTheme}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </OverlayPortal>
        )}
      </AnimatePresence>
    </>
  );
};

export const TeacherOverlay = ({
  word,
  explanation,
  memory,
  quiz,
  expand,
  theme,
  pdfTheme,
}: {
  word: string;
  explanation: string;
  memory: string;
  quiz: string;
  expand: string;
  theme: ThemeColor;
  pdfTheme: PdfTheme;
  key?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"explanation" | "memory" | "quiz" | "expand">("explanation");
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    setIsFlipped(false);
    setSelectedOption(null);
  }, [quiz, activeTab]);

  const parsedQuiz = useMemo(() => {
    if (!quiz) return { type: 'text', content: "No quiz provided." };
    if (quiz.startsWith('F::')) {
      const parts = quiz.split('::');
      return { type: 'flashcard', question: parts[1], answer: parts[2] || '' };
    } else if (quiz.startsWith('M::')) {
      const parts = quiz.split('::');
      return { 
        type: 'mcq', 
        question: parts[1], 
        options: [parts[2], parts[3], parts[4], parts[5]].filter(Boolean), 
        correctIndex: parseInt(parts[6] || '0', 10) 
      };
    }
    return { type: 'text', content: quiz };
  }, [quiz]);

  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  const tabs = [
    { id: "explanation", label: "Explanation", icon: BookOpen },
    { id: "memory", label: "Memory", icon: Brain },
    { id: "quiz", label: "Quiz", icon: HelpCircle },
    { id: "expand", label: "Expand", icon: Sparkles },
  ] as const;

  return (
    <span className="inline-block align-middle mx-1 my-0.5">
      <button 
        onClick={() => setIsOpen(true)}
        className={`group relative inline-flex items-center justify-center pl-2.5 pr-3 py-1.5 rounded-full overflow-hidden transition-all shadow-sm active:scale-95 ${t.bgLight} border ${t.borderLight} hover:shadow-md cursor-pointer`}
        title="Teacher Mode"
        data-interactive="teacher"
        data-word={word}
        data-explanation={explanation}
        data-memory={memory}
        data-quiz={quiz}
        data-expand={expand}
        data-theme={typeof theme === 'string' && !theme.startsWith('{') ? theme : undefined}
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${t.bg}`} />
        <div className={`flex items-center justify-center p-1 rounded-full mr-2 ${t.bg} text-white shadow-sm ring-2 ring-white/50 dark:ring-black/20`}>
          <GraduationCap className="w-3 h-3" />
        </div>
        <span className={`text-xs font-black uppercase tracking-wider ${t.text}`}>
          {word && word !== "Teacher" ? word : "Learn More"}
        </span>
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <OverlayPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row max-h-[85vh]`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Left Sidebar for Tabs (Desktop) / Top Bar (Mobile) */}
                <div className={`shrink-0 flex flex-row md:flex-col ${t.bgLight} border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 md:w-64 p-3 md:p-4 gap-2 overflow-x-auto custom-scrollbar relative overflow-hidden`}>
                  <div className="hidden md:flex items-center gap-3 mb-6 px-2 mt-2">
                    <div className={`p-2.5 rounded-xl ${t.bg} text-white shadow-lg shadow-${t.shadow}`}>
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-black uppercase tracking-widest text-[10px] opacity-60 ${t.text}`}>Teacher Mode</h3>
                      <p className={`font-bold text-lg leading-tight ${t.text}`}>{word && word !== "Teacher" ? word : "Insights"}</p>
                    </div>
                  </div>

                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider transition-colors z-10 shrink-0 md:shrink-auto whitespace-nowrap cursor-pointer ${
                          isActive ? t.text : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTabIndicatorTeacher"
                            className={`absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 -z-10`}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          />
                        )}
                        <Icon className={`w-4 h-4 ${isActive ? t.text : 'opacity-70'}`} />
                        {tab.label}
                      </button>
                    );
                  })}

                  <div className="flex-1 hidden md:block" />
                  
                  <button onClick={() => setIsOpen(false)} className="hidden md:flex items-center justify-center gap-2 mt-auto p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase text-xs font-bold tracking-widest rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                    <X className="w-4 h-4" /> Close
                  </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                  {/* Mobile Header */}
                  <div className={`md:hidden flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${t.bg} text-white`}>
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className={`font-black uppercase tracking-wider text-sm ${t.text}`}>
                        {word && word !== "Teacher" ? word : "Teacher Mode"}
                      </span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 bg-white dark:bg-slate-900 w-full relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-prose w-full mx-auto"
                      >
                        {activeTab === 'explanation' && (
                          <div className="space-y-6">
                            <div className={`teacher-header ${t.bgLight} ${t.text} border-white/50 dark:border-black/20 mb-2`} dir="auto">
                              <BookOpen className="w-3.5 h-3.5" /> 
                              <span>Comprehensive Explanation</span>
                            </div>
                            <div className={`prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:${t.text} prose-a:${t.text}`} dir="auto">
                              <MarkdownRenderer content={explanation || "No explanation provided."} theme={theme} pdfTheme={pdfTheme} />
                            </div>
                          </div>
                        )}
                        {activeTab === 'memory' && (
                          <div className="space-y-6">
                            <div className={`teacher-header ${t.bgLight} ${t.text} border-white/50 dark:border-black/20 mb-2`} dir="auto">
                              <Brain className="w-3.5 h-3.5" /> 
                              <span>Key Takeaways</span>
                            </div>
                            <div className={`p-6 sm:p-8 rounded-3xl ${t.bgLight} border border-white/50 dark:border-slate-700/50 shadow-inner relative overflow-hidden`} dir="auto">
                              <div className={`absolute top-0 right-0 p-8 opacity-5 ${t.text} pointer-events-none`}>
                                <Brain className="w-32 h-32" />
                              </div>
                              <div className={`relative z-10 prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:${t.text} prose-a:${t.text}`}>
                                <MarkdownRenderer content={memory || "No memory notes provided."} theme={theme} pdfTheme={pdfTheme} />
                              </div>
                            </div>
                          </div>
                        )}
                        {activeTab === 'quiz' && (
                          <div className="space-y-6">
                            {parsedQuiz.type === 'text' && (
                              <>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${t.bgLight} ${t.text} text-xs font-black uppercase tracking-widest mb-2 border border-white/50 dark:border-black/20 shadow-sm`}>
                                  <HelpCircle className="w-3.5 h-3.5" /> Knowledge Check
                                </div>
                                <div className={`p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 relative overflow-hidden`}>
                                   <div className={`absolute -bottom-4 -right-4 p-8 opacity-[0.03] text-slate-900 dark:text-white pointer-events-none`}>
                                    <HelpCircle className="w-40 h-40" />
                                  </div>
                                  <div className={`relative z-10 prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:${t.text} prose-a:${t.text}`}>
                                    <MarkdownRenderer content={parsedQuiz.content} theme={theme} pdfTheme={pdfTheme} />
                                  </div>
                                </div>
                              </>
                            )}

                            {parsedQuiz.type === 'flashcard' && (
                              <div 
                                className={`relative w-full min-h-[16rem] cursor-pointer [perspective:1000px] group`}
                                onClick={() => setIsFlipped(!isFlipped)}
                              >
                                <div className={`w-full h-full min-h-[16rem] transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''} relative`}>
                                  {/* Front */}
                                  <div className={`absolute inset-0 [backface-visibility:hidden] w-full h-full bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-sm group-hover:shadow-md transition-shadow`}>
                                    <div className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${t.bgLight} ${t.text}`}>
                                      Flashcard
                                    </div>
                                    <HelpCircle className={`w-10 h-10 mb-4 opacity-20 ${t.text}`} />
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100" dir="auto">{parsedQuiz.question}</h3>
                                    <p className="absolute bottom-6 text-xs text-slate-400 font-bold uppercase tracking-widest">Click to flip</p>
                                  </div>
                                  
                                  {/* Back */}
                                  <div className={`absolute inset-0 [backface-visibility:hidden] w-full h-full bg-slate-50 dark:bg-slate-800/80 rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-6 sm:p-8 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] shadow-sm group-hover:shadow-md transition-shadow overflow-y-auto custom-scrollbar flashcard-back`}>
                                    <div className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${t.bgLight} ${t.text}`}>
                                      Answer
                                    </div>
                                    <CheckCircle2 className={`w-10 h-10 mb-4 opacity-20 ${t.text}`} />
                                    <div className={`prose prose-sm dark:prose-invert prose-headings:${t.text} max-w-none`}>
                                      <MarkdownRenderer content={parsedQuiz.answer!} theme={theme} pdfTheme={pdfTheme} />
                                    </div>
                                    <p className="mt-8 text-xs text-slate-400 font-bold uppercase tracking-widest">Click to flip back</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {parsedQuiz.type === 'mcq' && (
                              <div className={`flex flex-col bg-white dark:bg-slate-800/50 rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm relative overflow-hidden`}>
                                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${t.bg} opacity-[0.03] dark:opacity-5 rounded-bl-full pointer-events-none`} />
                                <div className={`inline-flex items-center self-start gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${t.bgLight} ${t.text} mb-6`}>
                                  Knowledge Check
                                </div>
                                
                                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-8 z-10" dir="auto">{parsedQuiz.question}</h3>
                                
                                <div className="space-y-3 z-10" dir="auto">
                                  {parsedQuiz.options?.map((opt, i) => {
                                    const isSelected = selectedOption === i;
                                    const isCorrect = i === parsedQuiz.correctIndex;
                                    const showResult = selectedOption !== null;
                                    
                                    let btnClasses = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50";
                                    let Icon = null;
                                    
                                    if (showResult) {
                                      if (isCorrect) {
                                        btnClasses = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500";
                                        Icon = CheckCircle2;
                                      } else if (isSelected) {
                                        btnClasses = "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300";
                                        Icon = XCircle;
                                      } else {
                                        btnClasses = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 opacity-50";
                                      }
                                    }
                                    
                                    return (
                                      <button
                                        key={i}
                                        disabled={showResult}
                                        onClick={() => setSelectedOption(i)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${btnClasses}`}
                                      >
                                        <span className="font-semibold">{opt}</span>
                                        {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>
                                
                                <AnimatePresence>
                                  {selectedOption !== null && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                      animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                      className="text-center"
                                    >
                                      {selectedOption === parsedQuiz.correctIndex ? (
                                        <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">
                                          <CheckCircle2 className="w-5 h-5" />
                                          Correct! Outstanding.
                                        </div>
                                      ) : (
                                        <div className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-xl">
                                          <XCircle className="w-5 h-5" />
                                          Not quite. The correct answer was: <span className="font-black ml-1">{parsedQuiz.options![parsedQuiz.correctIndex!]}</span>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}

                          </div>
                        )}
                        {activeTab === 'expand' && (
                          <div className="space-y-6">
                            <div className={`teacher-header ${t.bgLight} ${t.text} border-white/50 dark:border-black/20 mb-2`} dir="auto">
                              <Sparkles className="w-3.5 h-3.5" /> 
                              <span>Broaden Horizons</span>
                            </div>
                            <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden`} dir="auto">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
                              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
                              <div className={`relative z-10 prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:${t.text} prose-a:${t.text}`}>
                                <MarkdownRenderer content={expand || "No expanded knowledge provided."} theme={theme} pdfTheme={pdfTheme} />
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </OverlayPortal>
        )}
      </AnimatePresence>
    </span>
  );
};

const PhotoUploadOverlay = ({
  text,
  explanation,
  initialPhotoUrl,
  originalMarkup,
  theme,
  onPhotoUpdate,
  pdfTheme = "modern",
}: {
  text: string;
  explanation: string;
  initialPhotoUrl?: string | null;
  originalMarkup: string;
  theme: ThemeColor;
  onPhotoUpdate?: (url: string | null) => void;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    initialPhotoUrl || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  useEffect(() => {
    if (initialPhotoUrl !== undefined) {
      setPhotoUrl(initialPhotoUrl);
    }
  }, [initialPhotoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setPhotoUrl(url);
        if (onPhotoUpdate) onPhotoUpdate(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPhotoUrl(null);
    if (onPhotoUpdate) onPhotoUpdate(null);
  };

  return (
    <>
      <span
        onClick={() => setIsOpen(true)}
        className={`photo-upload-trigger inline-flex items-center cursor-pointer border-b-4 ${t.border} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-2 py-0.5 rounded-none font-black text-slate-900 dark:text-white mx-1 ${pdfTheme === 'brutalist' ? "bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" : pdfTheme === 'liquid-glass' ? "bg-slate-900/50 text-indigo-100 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]" : ""}`}
        data-interactive="photo-upload"
        data-text={text}
        data-explanation={explanation}
        data-photo={photoUrl || ""}
        data-original-markup={originalMarkup}
      >
        {text}
        <ImagePlus
          className={`w-4 h-4 ml-2 ${t.text} ${false ? "animate-pulse" : ""}`}
        />
      </span>

      <AnimatePresence>
        {isOpen && (
          <OverlayPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`${false ? "bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]" : false ? "bg-slate-950 border-2 border-indigo-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2.5rem]" : "bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800"} w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`p-6 sm:p-8 ${t.bg} text-white relative overflow-hidden shrink-0`}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`${pdfTheme === 'brutalist' ? "w-10 h-10 bg-white border-4 border-black text-black" : pdfTheme === 'liquid-glass' ? "w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white" : "w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl text-white"} flex items-center justify-center`}
                    >
                      <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs text-white/80">
                      Interactive Photo
                    </span>
                  </div>
                  <h3
                    className="text-xl sm:text-3xl font-black tracking-tight uppercase italic break-words !text-white"
                    dir="auto"
                  >
                    {text}
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 ${false ? "bg-white border-4 border-black text-black" : false ? "bg-white/10 hover:bg-white/20 rounded-full border border-white/10" : "bg-black/10 hover:bg-black/20 rounded-full"} flex items-center justify-center transition-colors`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="p-6 sm:p-10 space-y-6 overflow-y-auto">
                {!photoUrl ? (
                  <div
                    className={`flex flex-col items-center justify-center py-12 border-2 border-dashed ${false ? "border-black bg-[#f0f0f0]" : false ? "border-indigo-500/30 bg-slate-900/50" : "border-slate-200 dark:border-slate-700"} rounded-2xl`}
                  >
                    <ImagePlus
                      className={`w-12 h-12 ${false ? "text-black" : false ? "text-indigo-400" : "text-slate-400"} mb-4`}
                    />
                    <p
                      className={`${false ? "text-black font-black" : false ? "text-indigo-100 font-black" : "text-slate-500 font-medium"} mb-4`}
                    >
                      Upload a photo for "{text}"
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`px-6 py-3 ${false ? "bg-black text-white border-2 border-black hover:bg-white hover:text-black" : false ? "bg-indigo-600 text-white rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105" : t.bg + " text-white rounded-xl shadow-lg hover:scale-105"} active:scale-95 transition-all text-sm font-black uppercase tracking-widest`}
                    >
                      Choose Photo
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div
                      className={`relative rounded-2xl overflow-hidden border-2 ${false ? "border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"} p-2`}
                    >
                      <img
                        src={photoUrl}
                        alt={text}
                        className={`w-full max-h-64 object-contain rounded-xl ${false ? "grayscale" : ""}`}
                      />
                      <button
                        onClick={handleRemove}
                        className={`absolute top-4 right-4 p-2 ${false ? "bg-[#FF0000] text-white border-2 border-black" : "bg-white/90 dark:bg-slate-800/90 text-rose-500 rounded-full backdrop-blur-sm"} shadow-lg hover:scale-110 transition-all`}
                        title="Remove Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div
                        className={`w-1 h-full min-h-[3rem] sm:min-h-[4rem] ${t.bg} rounded-full opacity-20`}
                      />
                      <div
                        className={`prose dark:prose-invert max-w-none ${pdfTheme === 'brutalist' ? "text-black font-black" : pdfTheme === 'liquid-glass' ? "text-indigo-100 font-medium" : "text-slate-600 dark:text-slate-300 font-medium"} leading-relaxed text-sm sm:text-base group-[.visual-liquid-glass]/liquid-glass:!text-white`}
                      >
                        <MarkdownRenderer
                          content={explanation}
                          theme={theme}
                          pdfTheme={pdfTheme}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </OverlayPortal>
        )}
      </AnimatePresence>
    </>
  );
};

const TranslationOverlay = ({
  text,
  translation,
  theme,
  pdfTheme = "modern",
}: {
  text: string;
  translation: string;
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  const handleSpeak = (content: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <span
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center cursor-pointer border-b-2 border-dashed ${t.border} hover:bg-slate-100 dark:hover:bg-slate-800 transition-all px-2 py-0.5 rounded-lg font-bold text-slate-800 dark:text-slate-200 mx-1 group group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border-white/40 group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/10`}
        data-interactive="translation"
        data-text={text}
        data-translation={translation}
        data-theme={theme}
      >
        <Languages
          className={`w-3 h-3 mr-1.5 opacity-50 group-hover:opacity-100 transition-opacity ${t.text}`}
        />
        {text}
        <span
          className={`ml-1.5 text-[9px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-md ${t.bg} text-white shadow-sm`}
        >
          TR
        </span>
      </span>

      <AnimatePresence>
        {isOpen && (
          <OverlayPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            >
            <motion.div
              initial={{ scale: 0.9, y: 20, rotate: -2 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.9, y: 20, rotate: 2 }}
              className={`bg-white dark:bg-slate-900 p-8 max-w-lg w-full rounded-[2.5rem] shadow-2xl border-4 ${t.border} relative overflow-hidden group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 ${t.bg} opacity-5 rounded-full -mr-16 -mt-16`}
              />
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-2xl ${t.bg} text-white shadow-lg`}
                  >
                    <Languages className="w-6 h-6" />
                  </div>
                  <div>
                    <div
                      className={`text-[10px] font-black uppercase tracking-[0.3em] ${t.text}`}
                    >
                      Translation
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      Cross-Language Insight
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="space-y-6 relative z-10">
                <div className="group/item">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Original
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(text);
                      }}
                      className={`p-1.5 rounded-lg ${t.bgLight} ${t.text} opacity-0 group-hover/item:opacity-100 transition-all hover:scale-110 active:scale-95`}
                      title="Listen to original"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">
                    {text}
                  </div>
                </div>
                <div className={`h-1 w-12 ${t.bg} rounded-full opacity-30`} />
                <div className="group/item">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Translated
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(translation);
                      }}
                      className={`p-1.5 rounded-lg ${t.bgLight} ${t.text} opacity-0 group-hover/item:opacity-100 transition-all hover:scale-110 active:scale-95`}
                      title="Listen to translation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div
                    className={`text-2xl font-bold ${t.text} leading-relaxed italic`}
                  >
                    {translation}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </OverlayPortal>
        )}
      </AnimatePresence>
    </>
  );
};

const CorrectionOverlay = ({
  text,
  correction,
  theme,
  pdfTheme = "modern",
}: {
  text: string;
  correction: string;
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  return (
    <>
      <span
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center cursor-pointer line-through decoration-red-500/50 decoration-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all px-2 py-0.5 rounded-lg font-bold text-slate-500 dark:text-slate-200 mx-1 group group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/10`}
        data-interactive="correction"
        data-text={text}
        data-correction={correction}
        data-theme={theme}
      >
        <AlertCircle className="w-3 h-3 mr-1.5 text-red-500 opacity-50 group-hover:opacity-100 transition-opacity" />
        {text}
        <span className="ml-1.5 text-[9px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-md bg-red-500 text-white shadow-sm">
          FIX
        </span>
      </span>

      <AnimatePresence>
        {isOpen && (
          <OverlayPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`bg-white dark:bg-slate-900 p-8 max-w-lg w-full rounded-[2.5rem] shadow-2xl border-4 border-emerald-500 relative overflow-hidden group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-5 rounded-full -mr-16 -mt-16" />
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
                      Correction
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      Accuracy Improved
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="space-y-6 relative z-10">
                <div className="opacity-50">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    Incorrect
                  </div>
                  <div className="text-2xl font-black text-slate-400 dark:text-slate-600 line-through tracking-tight italic">
                    {text}
                  </div>
                </div>
                <div className="h-1 w-12 bg-emerald-500 rounded-full opacity-30" />
                <div>
                  <div className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">
                    Corrected
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">
                    {correction}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </OverlayPortal>
        )}
      </AnimatePresence>
    </>
  );
};

const PronunciationOverlay = ({
  text,
  pronunciation,
  theme,
  pdfTheme = "modern",
}: {
  text: string;
  pronunciation: string;
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  const handleSpeak = (content: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <span
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center cursor-pointer border-b-2 ${t.border} hover:bg-slate-100 dark:hover:bg-slate-800 transition-all px-2 py-0.5 rounded-lg font-bold text-slate-800 dark:text-slate-200 mx-1 group group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border-white/40 group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/10`}
        data-interactive="pronunciation"
        data-text={text}
        data-pronunciation={pronunciation}
        data-theme={theme}
      >
        <Volume2
          className={`w-3 h-3 mr-1.5 opacity-50 group-hover:opacity-100 transition-opacity ${t.text}`}
        />
        {text}
        <span
          className={`ml-1.5 text-[9px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-md ${t.bg} text-white shadow-sm`}
        >
          PR
        </span>
      </span>

      <AnimatePresence>
        {isOpen && (
          <OverlayPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`bg-white dark:bg-slate-900 p-8 max-w-lg w-full rounded-[2.5rem] shadow-2xl border-4 ${t.border} relative overflow-hidden group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 ${t.bg} opacity-5 rounded-full -mr-16 -mt-16`}
              />
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-2xl ${t.bg} text-white shadow-lg`}
                  >
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div
                      className={`text-[10px] font-black uppercase tracking-[0.3em] ${t.text}`}
                    >
                      Pronunciation
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      Phonetic Guide
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="space-y-6 relative z-10">
                <div className="group/item flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      Word
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                      {text}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(text);
                    }}
                    className={`p-3 rounded-2xl ${t.bgLight} ${t.text} hover:scale-110 active:scale-95 transition-all shadow-sm`}
                    title="Listen to word"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>
                <div className={`h-1 w-12 ${t.bg} rounded-full opacity-30`} />
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 relative group/guide">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    Phonetic
                  </div>
                  <div
                    className={`text-3xl font-mono ${t.text} tracking-widest`}
                  >
                    /{pronunciation}/
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(pronunciation);
                    }}
                    className={`absolute bottom-4 right-4 p-2 rounded-xl ${t.bg} text-white opacity-0 group-hover/guide:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg`}
                    title="Listen to pronunciation guide"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </OverlayPortal>
        )}
      </AnimatePresence>
    </>
  );
};

const DetailOverlay = ({
  text,
  detail,
  theme,
  pdfTheme = "modern",
}: {
  text: string;
  detail: string;
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  return (
    <>
      <span
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all px-2 py-1 rounded-xl font-black ${t.text} mx-1 group border-b-2 ${t.border}`}
        data-interactive="detail"
        data-text={text}
        data-detail={detail}
        data-theme={theme}
      >
        <Search className="w-3 h-3 mr-1.5 opacity-50 group-hover:opacity-100 transition-opacity" />
        {text}
        <span
          className={`ml-1.5 text-[9px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-md ${t.bg} text-white shadow-sm`}
        >
          DIVE
        </span>
      </span>

      <AnimatePresence>
        {isOpen && (
          <OverlayPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`bg-white dark:bg-slate-900 p-8 max-w-2xl w-full rounded-[3rem] shadow-2xl border-4 ${t.border} relative overflow-hidden flex flex-col max-h-[85vh] group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`absolute top-0 right-0 w-64 h-64 ${t.bg} opacity-5 rounded-full -mr-32 -mt-32`}
              />
              <div className="flex justify-between items-start mb-8 relative z-10 shrink-0">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-4 rounded-[1.5rem] ${t.bg} text-white shadow-xl ${t.shadow}`}
                  >
                    <Search className="w-8 h-8" />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-black uppercase tracking-[0.4em] ${t.text}`}
                    >
                      Deep Dive
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      Advanced Technical Analysis
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-8 h-8 text-slate-400" />
                </button>
              </div>

              <div className="relative z-10 overflow-hidden flex flex-col flex-1">
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-6 border-b-4 border-slate-100 dark:border-slate-800 pb-6 tracking-tight italic shrink-0">
                  {text}
                </div>
                <div className="overflow-y-auto pr-4 custom-scrollbar">
                  <div className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 font-medium group-[.visual-liquid-glass]/liquid-glass:!text-white">
                    <MarkdownRenderer
                      content={detail}
                      theme={theme}
                      pdfTheme={pdfTheme}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Comprehensive Study Material
                </div>
                <div className={t.text}>PDF Engine v2.0</div>
              </div>
            </motion.div>
          </motion.div>
        </OverlayPortal>
        )}
      </AnimatePresence>
    </>
  );
};

const FindErrorOverlay = ({
  correct,
  error,
  explanation,
  theme,
  pdfTheme = "modern",
}: {
  correct: string;
  error: string;
  explanation: string;
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  return (
    <span
      className="inline-flex flex-col items-center mx-1 align-middle"
      data-interactive="find-error"
      data-correct={correct}
      data-error={error}
      data-explanation={explanation}
      data-theme={theme}
    >
      <motion.span
        animate={status === "wrong" ? { x: [-5, 5, -5, 5, 0] } : {}}
        onClick={() => {
          if (status === "idle") setStatus("correct");
        }}
        className={`cursor-pointer px-2 py-0.5 rounded-lg transition-all duration-300 font-bold ${
          status === "correct"
            ? "bg-emerald-500 text-white shadow-lg"
            : status === "wrong"
              ? "bg-rose-500 text-white"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 border-b-2 border-transparent hover:border-slate-300"
        }`}
      >
        {status === "correct" ? correct : error}
      </motion.span>
      <AnimatePresence>
        {status === "correct" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`text-[10px] mt-1 font-medium ${t.text} max-w-[200px] text-center leading-tight`}
          >
            {explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

const VoiceRecordOverlay = ({
  phrase,
  theme,
  pdfTheme = "modern",
}: {
  phrase: string;
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const playOriginal = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      window.speechSynthesis.speak(utterance);
    }
  };

  const playRecorded = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 ${t.border} ${t.bgLight} mx-1 align-middle group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-md group-[.visual-liquid-glass]/liquid-glass:!border-white/20`}
      data-interactive="voice-record"
      data-phrase={phrase}
      data-theme={theme}
    >
      <button
        onClick={playOriginal}
        className={`p-1.5 rounded-lg ${t.bg} text-white hover:scale-110 transition-transform group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:ring-1 group-[.visual-liquid-glass]/liquid-glass:ring-white/20`}
        title="Listen to AI"
      >
        <Volume2 className="w-4 h-4" />
      </button>
      <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 group-[.visual-liquid-glass]/liquid-glass:!bg-white/20" />
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-1.5 rounded-lg ${isRecording ? "bg-rose-500 animate-pulse" : "bg-slate-200 dark:bg-slate-700"} text-slate-700 dark:text-slate-200 hover:scale-110 transition-transform group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:ring-1 group-[.visual-liquid-glass]/liquid-glass:ring-white/10`}
      >
        {isRecording ? (
          <Square className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
      {audioUrl && (
        <button
          onClick={playRecorded}
          className={`p-1.5 rounded-lg bg-emerald-500 text-white hover:scale-110 transition-transform group-[.visual-liquid-glass]/liquid-glass:!bg-emerald-500/40 group-[.visual-liquid-glass]/liquid-glass:ring-1 group-[.visual-liquid-glass]/liquid-glass:ring-emerald-400/30`}
        >
          <Play className="w-4 h-4" />
        </button>
      )}
      <span className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1 group-[.visual-liquid-glass]/liquid-glass:!text-white">
        Record
      </span>
    </span>
  );
};

const MatcherOverlay = ({
  pairs,
  theme,
  pdfTheme = "modern",
}: {
  pairs: { term: string; def: string }[];
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [shuffledTerms, setShuffledTerms] = useState<
    { id: number; text: string }[]
  >([]);
  const [shuffledDefs, setShuffledDefs] = useState<
    { id: number; text: string }[]
  >([]);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [selectedDef, setSelectedDef] = useState<number | null>(null);
  const [matches, setMatches] = useState<number[]>([]);
  const [wrongMatch, setWrongMatch] = useState<[number, number] | null>(null);

  useEffect(() => {
    const terms = pairs.map((p, i) => ({ id: i, text: p.term }));
    const defs = pairs.map((p, i) => ({ id: i, text: p.def }));
    setShuffledTerms([...terms].sort(() => Math.random() - 0.5));
    setShuffledDefs([...defs].sort(() => Math.random() - 0.5));
  }, [pairs]);

  useEffect(() => {
    if (selectedTerm !== null && selectedDef !== null) {
      if (selectedTerm === selectedDef) {
        setMatches((prev) => [...prev, selectedTerm]);
        setSelectedTerm(null);
        setSelectedDef(null);
      } else {
        setWrongMatch([selectedTerm, selectedDef]);
        setTimeout(() => {
          setWrongMatch(null);
          setSelectedTerm(null);
          setSelectedDef(null);
        }, 1000);
      }
    }
  }, [selectedTerm, selectedDef]);

  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  return (
    <div
      className={`my-8 p-6 rounded-[2rem] border-4 ${t.border} ${t.bgLight} shadow-xl group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:!border-white/20`}
      data-interactive="matcher"
      data-pairs={JSON.stringify(pairs)}
      data-theme={theme}
    >
      <div className="flex items-center gap-3 mb-6">
        <Trophy className={`w-6 h-6 ${t.text}`} />
        <h4 className="text-xl font-black uppercase tracking-tighter italic text-slate-800 dark:text-white">
          Match the Terms
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-3">
          {shuffledTerms.map((term) => {
            const isMatched = matches.includes(term.id);
            const isSelected = selectedTerm === term.id;
            const isWrong = wrongMatch?.[0] === term.id;
            const matchIndex = matches.indexOf(term.id) + 1;
            return (
              <button
                key={term.id}
                disabled={isMatched}
                onClick={() => setSelectedTerm(term.id)}
                className={`w-full p-4 rounded-xl font-bold text-sm transition-all border-2 text-left flex items-center justify-between gap-3 ${
                  isMatched
                    ? "bg-emerald-500 border-emerald-600 text-white opacity-80 shadow-inner"
                    : isWrong
                      ? "bg-rose-500 border-rose-600 text-white animate-shake"
                      : isSelected
                        ? `border-${t.bg.split("-")[1]}-500 bg-white dark:bg-slate-800 shadow-md scale-[1.02] text-slate-800 dark:text-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-${t.bg.split("-")[1]}-400 group-[.visual-liquid-glass]/liquid-glass:!bg-white/20 group-[.visual-liquid-glass]/liquid-glass:!text-white`
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-100 group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!text-white/80 group-[.visual-liquid-glass]/liquid-glass:!border-white/10"
                }`}
              >
                <span className="flex-1">{term.text}</span>
                {isMatched && (
                  <span className="bg-white/25 px-2 py-0.5 rounded text-[10px] font-black min-w-[20px] text-center shrink-0">
                    {matchIndex}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {shuffledDefs.map((def) => {
            const isMatched = matches.includes(def.id);
            const isSelected = selectedDef === def.id;
            const isWrong = wrongMatch?.[1] === def.id;
            const matchIndex = matches.indexOf(def.id) + 1;
            return (
              <button
                key={def.id}
                disabled={isMatched}
                onClick={() => setSelectedDef(def.id)}
                className={`w-full p-4 rounded-xl font-bold text-sm transition-all border-2 text-left flex items-center justify-between gap-3 ${
                  isMatched
                    ? "bg-emerald-500 border-emerald-600 text-white opacity-80 shadow-inner"
                    : isWrong
                      ? "bg-rose-500 border-rose-600 text-white animate-shake"
                      : isSelected
                        ? `border-${t.bg.split("-")[1]}-500 bg-white dark:bg-slate-800 shadow-md scale-[1.02] text-slate-800 dark:text-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-${t.bg.split("-")[1]}-400 group-[.visual-liquid-glass]/liquid-glass:!bg-white/20 group-[.visual-liquid-glass]/liquid-glass:!text-white`
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-100 group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!text-white/80 group-[.visual-liquid-glass]/liquid-glass:!border-white/10"
                }`}
              >
                <span className="flex-1">{def.text}</span>
                {isMatched && (
                  <span className="bg-white/25 px-2 py-0.5 rounded text-[10px] font-black min-w-[20px] text-center shrink-0">
                    {matchIndex}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {matches.length === pairs.length && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-6 text-center text-emerald-500 font-black uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" /> All Matched!
        </motion.div>
      )}
    </div>
  );
};

const QuizOverlay = ({
  question,
  options,
  correctIndex,
  theme,
  pdfTheme = "modern",
}: {
  question: string;
  options: string[];
  correctIndex: number;
  theme: ThemeColor;
  pdfTheme?: PdfTheme;
  key?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const activeColorThemes = colorThemes;
  const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setIsCorrect(index === correctIndex);
  };

  const resetQuiz = () => {
    setSelectedOption(null);
    setIsCorrect(null);
  };

  return (
    <>
      <span
        onClick={() => {
          setIsOpen(true);
          resetQuiz();
        }}
        className={`inline-flex items-center cursor-pointer border-2 ${t.border} bg-white dark:bg-slate-900 hover:scale-105 transition-all px-2 py-1 rounded-xl font-black text-xs mx-1 group shadow-sm`}
        data-interactive="quiz"
        data-question={question}
        data-options={JSON.stringify(options)}
        data-correct-index={correctIndex}
        data-theme={theme}
      >
        <HelpCircle className={`w-3 h-3 mr-1.5 ${t.text}`} />
        <span className={t.text}>QUIZ</span>
      </span>

      <AnimatePresence>
        {isOpen && (
          <OverlayPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`bg-white dark:bg-slate-900 p-8 max-w-lg w-full rounded-[2.5rem] shadow-2xl border-4 ${t.border} relative overflow-hidden group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-3xl group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 ${t.bg} opacity-5 rounded-full -mr-16 -mt-16`}
              />
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-2xl ${t.bg} text-white shadow-lg`}
                  >
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div
                      className={`text-[10px] font-black uppercase tracking-[0.3em] ${t.text}`}
                    >
                      Quick Quiz
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      Test Your Knowledge
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight italic">
                  {question}
                </div>

                <div className="space-y-3">
                  {options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrectOption = index === correctIndex;
                    let bgColor = "bg-slate-50 dark:bg-slate-800";
                    let borderColor = "border-slate-200 dark:border-slate-700";
                    let textColor = "text-slate-700 dark:text-slate-100 group-[.visual-liquid-glass]/liquid-glass:!text-white";

                    if (selectedOption !== null) {
                      if (isCorrectOption) {
                        bgColor = "bg-emerald-50 dark:bg-emerald-900/20";
                        borderColor = "border-emerald-500";
                        textColor = "text-emerald-600 dark:text-emerald-400";
                      } else if (isSelected) {
                        bgColor = "bg-rose-50 dark:bg-rose-900/20";
                        borderColor = "border-rose-500";
                        textColor = "text-rose-600 dark:text-rose-400";
                      }
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(index)}
                        disabled={selectedOption !== null}
                        className={`w-full text-left p-4 rounded-2xl border-2 ${borderColor} ${bgColor} ${textColor} font-bold transition-all flex items-center justify-between group`}
                      >
                        <span>{option}</span>
                        {selectedOption !== null && isCorrectOption && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                        {selectedOption !== null &&
                          isSelected &&
                          !isCorrectOption && (
                            <XCircle className="w-5 h-5 text-rose-500" />
                          )}
                      </button>
                    );
                  })}
                </div>

                {isCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border-2 ${isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"} font-black text-center uppercase tracking-widest text-sm`}
                  >
                    {isCorrect
                      ? "✨ Correct! Well Done! ✨"
                      : "❌ Incorrect. Try again next time!"}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </OverlayPortal>
        )}
      </AnimatePresence>
    </>
  );
};

export const MarkdownRenderer = memo(
  ({
    content,
    theme,
    pdfTheme = "modern",
    keywords = {},
    onUpdate,
    customTheme,
  }: {
    content: string;
    theme: ThemeColor;
    pdfTheme?: PdfTheme;
    keywords?: Record<string, string>;
    onUpdate?: (newContent: string) => void;
    customTheme?: PdfCustomTheme;
  }) => {
  const activeColorThemes = colorThemes;
    const t = (typeof theme === 'string' && theme.startsWith('{')) 
      ? JSON.parse(theme as string) 
      : activeColorThemes[theme as keyof typeof activeColorThemes];

    // More robust theme name detection for the CSS variable class
    let activeThemeName = (typeof theme === 'string' && !theme.startsWith('{') && !theme.startsWith('#') && !theme.startsWith('text-')) 
      ? theme 
      : '';
      
    if (!activeThemeName && t && t.swatch && typeof t.swatch === 'string') {
      const match = t.swatch.match(/bg-([a-z-]+)-500/);
      if (match) activeThemeName = match[1];
    }

    const themeClass = activeThemeName ? `theme-${activeThemeName}` : '';

    // Extract a fallback color for SSR/unstyled elements
    const fallbackColor = (t as any).swatch ? (t as any).swatch.replace('bg-', '') : 'indigo-600';

    // Pre-process specific interactive strings into placeholders so they aren't mangled by Markdown
    const { placeholders, safeContent } = useMemo(() => {
      let temp = content;
      const found: string[] = [];
      
      const regex = /(\[\[[\s\S]*?\]\]|\{\{[\s\S]*?\}\}|!![\s\S]*?!!|>>[\s\S]*?<<|\(\(\([\s\S]*?\)\)\)|\(\([\s\S]*?\)\)|\?\?[\s\S]*?\?\?|@@(?:[^@]|@(?!@))*@@|%%[\s\S]*?%%|\^\^[\s\S]*?\^\^|§§[\s\S]*?§§|==[\s\S]*?==)/g;
      
      temp = temp.replace(regex, (match) => {
        const id = found.length;
        found.push(match);
        return `XYZZYINTERACT${id}XYZZY`;
      });

      // Prevent Markdown from treating >> as blockquotes which breaks the Expandable syntax
      return { placeholders: found, safeContent: temp.replace(/>>/g, "\\>\\>") };
    }, [content]);

    const processText = useCallback(
      (text: string) => {
        const parts = text.split(/(XYZZYINTERACT\d+XYZZY)/g);
        const finalParts: (string | React.ReactNode)[] = [];

        parts.forEach((part, k) => {
          const match = part.match(/XYZZYINTERACT(\d+)XYZZY/);
          if (match) {
            const id = parseInt(match[1], 10);
            const tPart = placeholders[id];
            if (!tPart) {
              finalParts.push(part);
              return;
            }

            const j = k; // Unique key component
            
            if (tPart.startsWith("==") && tPart.endsWith("==")) {
              finalParts.push(
                <mark
                  key={`h-${j}`}
                  className={`px-2 py-0.5 rounded-lg font-black shadow-sm inline-block mx-0.5 ${t.highlight} ${t.text} border border-current/30`}
                >
                  {tPart.slice(2, -2)}
                </mark>
              );
            } else if (tPart.startsWith("[[") && tPart.endsWith("]]")) {
              const inner = tPart.slice(2, -2);
              if (inner.startsWith("Match|")) {
                const pairs = inner
                  .slice(6)
                  .split("|")
                  .map((p) => {
                    const [term, def] = p.split(":");
                    return { term, def };
                  });
                finalParts.push(
                  <MatcherOverlay
                    key={`m-${j}`}
                    pairs={pairs}
                    theme={theme}
                    pdfTheme={pdfTheme}
                  />,
                );
              } else {
                const [term, ...defParts] = inner.split("|");
                finalParts.push(
                  <TermOverlay
                    key={`t-${j}`}
                    term={term}
                    definition={defParts.join("|")}
                    theme={theme}
                    pdfTheme={pdfTheme}
                  />,
                );
              }
            } else if (tPart.startsWith("{{") && tPart.endsWith("}}")) {
              const inner = tPart.slice(2, -2);
              const [term, ...defParts] = inner.split("|");
              finalParts.push(
                <TermOverlay
                  key={`t-${j}`}
                  term={term}
                  definition={defParts.join("|")}
                  theme={theme}
                  pdfTheme={pdfTheme}
                />,
              );
            } else if (tPart.startsWith("!!") && tPart.endsWith("!!")) {
              const inner = tPart.slice(2, -2);
              if (inner.startsWith("FindError|")) {
                const parts = inner.split("|");
                const correct = parts[1] || "";
                const error = parts[2] || "";
                const explanation = parts[3] || "";
                finalParts.push(
                  <FindErrorOverlay
                    key={`fe-${j}`}
                    correct={correct}
                    error={error}
                    explanation={explanation}
                    theme={theme}
                    pdfTheme={pdfTheme}
                  />,
                );
              } else {
                const [label, ...secretParts] = inner.split("|");
                finalParts.push(
                  <RevealOverlay
                    key={`r-${j}`}
                    label={label}
                    secret={secretParts.join("|") || label}
                    theme={theme}
                    pdfTheme={pdfTheme}
                  />,
                );
              }
            } else if (tPart.startsWith("(((") && tPart.endsWith(")))")) {
              const inner = tPart.slice(3, -3);
              const parts = inner.split("|");
              const phrase = parts.length > 1 ? parts[1] : parts[0];
              finalParts.push(
                <VoiceRecordOverlay
                  key={`vr-${j}`}
                  phrase={phrase}
                  theme={theme}
                  pdfTheme={pdfTheme}
                />,
              );
            } else if (tPart.startsWith(">>") && tPart.endsWith("<<")) {
              const inner = tPart.slice(2, -2);
              const [title, ...contentParts] = inner.split("|");
              finalParts.push(
                <ExpandableOverlay
                  key={`e-${j}`}
                  title={title}
                  content={contentParts.join("|") || ""}
                  theme={theme}
                  pdfTheme={pdfTheme}
                />,
              );
            } else if (tPart.startsWith("((") && tPart.endsWith("))")) {
              const inner = tPart.slice(2, -2);
              const [type, ...contentParts] = inner.split("|");
              finalParts.push(
                <BadgeOverlay
                  key={`b-${j}`}
                  type={type}
                  content={contentParts.join("|") || type}
                  theme={theme}
                  pdfTheme={pdfTheme}
                />,
              );
            } else if (tPart.startsWith("??") && tPart.endsWith("??")) {
              const inner = tPart.slice(2, -2);
              const parts = inner.split("|");
              if (parts.length > 2) {
                // Quiz: Question|Option1|Option2|...|CorrectIndex
                const question = parts[0];
                const correctIndex = parseInt(parts[parts.length - 1]);
                const options = parts.slice(1, -1);
                finalParts.push(
                  <QuizOverlay
                    key={`qz-${j}`}
                    question={question}
                    options={options}
                    correctIndex={correctIndex}
                    theme={theme}
                    pdfTheme={pdfTheme}
                  />,
                );
              } else {
                // Explanation: Text|Explanation
                const [text, ...explanationParts] = parts;
                finalParts.push(
                  <ExplanationOverlay
                    key={`ex-${j}`}
                    text={text}
                    explanation={explanationParts.join("|") || ""}
                    theme={theme}
                    pdfTheme={pdfTheme}
                  />,
                );
              }
            } else if (tPart.startsWith("%%") && tPart.endsWith("%%")) {
              const inner = tPart.slice(2, -2);
              const [text, ...translationParts] = inner.split("|");
              finalParts.push(
                <TranslationOverlay
                  key={`tr-${j}`}
                  text={text}
                  translation={translationParts.join("|") || ""}
                  theme={theme}
                  pdfTheme={pdfTheme}
                />,
              );
            } else if (tPart.startsWith("^^") && tPart.endsWith("^^")) {
              const inner = tPart.slice(2, -2);
              const [text, ...pronunciationParts] = inner.split("|");
              finalParts.push(
                <PronunciationOverlay
                  key={`pr-${j}`}
                  text={text}
                  pronunciation={pronunciationParts.join("|") || ""}
                  theme={theme}
                  pdfTheme={pdfTheme}
                />,
              );
            } else if (tPart.startsWith("@@") && tPart.endsWith("@@")) {
              const inner = tPart.slice(2, -2);
              const parts = inner.split("|");
              const text = parts[0];
              const explanation = parts[1] || "";
              const photoUrl = parts[2] || null;
              finalParts.push(
                <PhotoUploadOverlay
                  key={`pu-${j}`}
                  text={text}
                  explanation={explanation}
                  initialPhotoUrl={photoUrl}
                  originalMarkup={tPart}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  onPhotoUpdate={(newUrl) => {
                    if (onUpdate) {
                      const newPart = newUrl
                        ? `@@${text}|${explanation}|${newUrl}@@`
                        : `@@${text}|${explanation}@@`;
                      onUpdate(content.replace(tPart, newPart));
                    }
                  }}
                />,
              );
            } else if (tPart.startsWith("§§") && tPart.endsWith("§§")) {
              const inner = tPart.slice(2, -2);
              const [word, explanation, memory, quiz, expand] = inner.split("|");
              finalParts.push(
                <TeacherOverlay
                  key={`to-${j}`}
                  word={word || ""}
                  explanation={explanation || ""}
                  memory={memory || ""}
                  quiz={quiz || ""}
                  expand={expand || ""}
                  theme={theme}
                  pdfTheme={pdfTheme}
                />
              );
            } else {
              finalParts.push(tPart);
            }
          } else if (part) {
            // Check for known keywords in the remaining text part
            if (Object.keys(keywords).length > 0) {
              const escapedKeywords = Object.keys(keywords).map((k) =>
                k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
              );
              const keywordRegex = new RegExp(
                `\\b(${escapedKeywords.join("|")})\\b`,
                "gi",
              );

              const kwParts = part.split(keywordRegex);
              kwParts.forEach((kwPart, kwIdx) => {
                const lowerKwPart = kwPart.toLowerCase();
                const matchedKeyword = Object.keys(keywords).find(
                  (k) => k.toLowerCase() === lowerKwPart,
                );
                if (matchedKeyword) {
                  finalParts.push(
                    <TermOverlay
                      key={`kw-${k}-${kwIdx}`}
                      term={kwPart}
                      definition={keywords[matchedKeyword]}
                      theme={theme}
                      pdfTheme={pdfTheme}
                    />,
                  );
                } else {
                  finalParts.push(kwPart);
                }
              });
            } else {
              finalParts.push(part);
            }
          }
        });

        return finalParts;
      },
      [t.highlight, theme, pdfTheme, placeholders, keywords, onUpdate, content]
    );

    return (
      <div 
        className={`markdown-content ${themeClass}`} 
        dir="auto"
        style={{
          '--accent-color': (typeof theme === 'string' && theme.startsWith('#')) ? theme : 
                            (t && t.bg && typeof t.bg === 'string' && t.bg.startsWith('bg-[#')) ? t.bg.slice(4, -1) : 
                            (t && t.swatch && typeof t.swatch === 'string' && t.swatch.startsWith('bg-[#')) ? t.swatch.slice(4, -1) :
                            undefined
        } as any}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            strong: ({ children }) => {
              const text = React.Children.toArray(children).join("");
              if (text.includes("|")) {
                const [tName, ...d] = text.split("|");
                return (
                  <DetailOverlay
                    text={tName}
                    detail={d.join("|")}
                    theme={theme}
                    pdfTheme={pdfTheme}
                  />
                );
              }
              return (
                <strong
                  className={`font-black decoration-2 underline-offset-2 decoration-current/30 ${t.text}`}
                  style={customTheme ? { color: customTheme.textColor } : {}}
                >
                  {children}
                </strong>
              );
            },
            del: ({ children }) => {
              const text = React.Children.toArray(children).join("");
              if (text.includes("|")) {
                const [t, ...c] = text.split("|");
                return (
                  <CorrectionOverlay
                    text={t}
                    correction={c.join("|")}
                    theme={theme}
                    pdfTheme={pdfTheme}
                  />
                );
              }
              return (
                <del
                  className="opacity-50 line-through"
                  style={
                    customTheme ? { color: customTheme.textColor + "88" } : {}
                  }
                >
                  {children}
                </del>
              );
            },
            p: ({ children }) => {
              const processedChildren = React.Children.map(
                children,
                (child) => {
                  if (typeof child === "string") {
                    return processText(child);
                  }
                  return child;
                },
              );
              return (
                <div
                  className="leading-relaxed break-words mb-4 last:mb-0 text-slate-800 dark:text-slate-100"
                  dir="auto"
                  style={
                    customTheme
                      ? {
                          color: customTheme.textColor,
                          fontFamily: customTheme.bodyFont,
                        }
                      : {}
                  }
                >
                  {processedChildren}
                </div>
              );
            },
            li: ({ children }) => {
              const processedChildren = React.Children.map(
                children,
                (child) => {
                  if (typeof child === "string") {
                    return processText(child);
                  }
                  return child;
                },
              );
              return (
                <li
                  className="leading-relaxed break-words"
                  dir="auto"
                  style={
                    customTheme
                      ? {
                          color: customTheme.textColor,
                          fontFamily: customTheme.bodyFont,
                        }
                      : {}
                  }
                >
                  {processedChildren}
                </li>
              );
            },
            em: ({ children }) => (
              <em
                className={`italic font-bold ${t.text}`}
                dir="auto"
                style={customTheme ? { color: customTheme.primaryColor } : { opacity: 0.9 }}
              >
                {children}
              </em>
            ),
            mark: ({ children }) => (
              <mark 
                className={`px-2 py-0.5 rounded-lg font-black shadow-sm inline-block mx-0.5 ${t.highlight} ${t.text} border border-current/30`}
              >
                {children}
              </mark>
            ),
          }}
        >
          {safeContent}
        </ReactMarkdown>
      </div>
    );
  },
);

const RuneDecoration = ({
  className,
  color,
}: {
  className?: string;
  color?: string;
}) => {
  return (
    <motion.span
      className={`inline-flex items-center justify-center ${className}`}
      animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{
        color: color,
        filter: `drop-shadow(0 0 8px ${color || "currentColor"})`,
      }}
    >
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
      >
        <path d="M12 2L12.9 8.1L19 9L12.9 9.9L12 16L11.1 9.9L5 9L11.1 8.1L12 2Z" />
      </svg>
    </motion.span>
  );
};

const MysticBorder = ({ t }: { t: any }) => {
  const glowColor = t.borderGlow
    ? t.borderGlow.match(/rgba\([^)]+\)/)?.[0] || "rgba(255,255,255,0.5)"
    : "rgba(255,255,255,0.5)";
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-0"
      style={{
        boxShadow: `inset 0 0 40px ${glowColor.replace(/0\.[0-9]+\)/, "0.15)")}, 0 0 25px ${glowColor}`,
      }}
    >
      <div
        className={`absolute inset-0 border-2 ${t.border} rounded-[inherit] mix-blend-screen opacity-80`}
      />
      <motion.div
        className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <div
        className={`absolute -top-12 -left-12 w-32 h-32 rounded-full ${t.highlight} blur-[50px] opacity-70`}
      />
      <div
        className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full ${t.highlight} blur-[50px] opacity-70`}
      />
    </div>
  );
};

const FlashcardBlock = memo(
  ({
    block,
    theme,
    pdfTheme = "modern",
    customTheme,
    keywords = {},
  }: {
    block: PdfBlock;
    theme: ThemeColor;
    pdfTheme?: PdfTheme;
    customTheme?: PdfCustomTheme;
    keywords?: Record<string, string>;
  }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const activeColorThemes = colorThemes;
    const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

    const frontContent = block.front || block.content || "";
    const backContent = block.back || block.definition || "";

    return (
      <div
        className="perspective-1000 w-full my-12 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
        data-interactive="flashcard"
        data-front={frontContent}
        data-back={backContent}
        data-theme={theme}
        data-theme-bg={t.bg}
        data-theme-border={t.border}
      >
        <motion.div
          className="relative w-full transition-all duration-500 preserve-3d grid grid-cols-1 grid-rows-1 items-stretch"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div
            className={`col-start-1 row-start-1 backface-hidden rounded-[2.5rem] border-4 ${t.border} bg-white dark:bg-slate-900 flex flex-col p-10 text-center shadow-xl min-h-[280px] relative overflow-hidden`}
            style={
              customTheme
                ? {
                    borderColor: customTheme.primaryColor,
                    backgroundColor: customTheme.backgroundColor,
                  }
                : {}
            }
          >
            <div
              className={`text-[10px] font-black uppercase tracking-[0.4em] ${t.text} mb-8 shrink-0`}
              style={customTheme ? { color: customTheme.primaryColor } : {}}
            >
              Question
            </div>
            <div
              className="flex-1 flex items-center justify-center w-full"
              style={
                customTheme
                  ? {
                      color: customTheme.textColor,
                      fontFamily: customTheme.bodyFont,
                    }
                  : {}
              }
            >
              <div className="w-full text-2xl font-black text-slate-900 dark:text-white italic leading-tight markdown-body prose dark:prose-invert max-w-none">
                <MarkdownRenderer
                  content={frontContent}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  keywords={keywords}
                />
              </div>
            </div>
            <div
              className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 shrink-0"
              style={customTheme ? { color: customTheme.textColor + "88" } : {}}
            >
              <RefreshCw className="w-3 h-3" /> Click to flip
            </div>
          </div>

          {/* Back */}
          <div
            className={`col-start-1 row-start-1 backface-hidden rounded-[2.5rem] border-4 ${t.border} ${t.bg} flex flex-col p-10 text-center shadow-xl rotate-y-180 min-h-[280px] relative overflow-hidden flashcard-back`}
            style={
              customTheme
                ? {
                    borderColor: customTheme.primaryColor,
                    backgroundColor: customTheme.secondaryColor,
                  }
                : {}
            }
          >
            <div
              className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-8 shrink-0"
              style={customTheme ? { color: customTheme.textColor + "88" } : {}}
            >
              Answer
            </div>
            <div
              className="flex-1 flex items-center justify-center w-full"
              style={
                customTheme
                  ? {
                      color: customTheme.textColor,
                      fontFamily: customTheme.bodyFont,
                    }
                  : {}
              }
            >
              <div className="w-full text-2xl font-black text-white italic leading-tight markdown-body prose-invert max-w-none">
                <MarkdownRenderer
                  content={backContent}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  keywords={keywords}
                />
              </div>
            </div>
            <div
              className="mt-8 text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center justify-center gap-2 shrink-0"
              style={customTheme ? { color: customTheme.textColor + "88" } : {}}
            >
              <RefreshCw className="w-3 h-3" /> Click to flip back
            </div>
          </div>
        </motion.div>
      </div>
    );
  },
);

const BentoGridBlock = memo(
  ({
    block,
    theme,
    pdfTheme = "modern",
    keywords,
    customTheme,
  }: {
    block: PdfBlock;
    theme: ThemeColor;
    pdfTheme?: PdfTheme;
    keywords?: Record<string, string>;
    customTheme?: PdfCustomTheme;
  }) => {
  const activeColorThemes = colorThemes;
    const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

    return (
      <div className="flex flex-col gap-6 my-12 w-full">
        {block.blocks?.map((subBlock, idx) => (
          <div key={idx} className="w-full">
            <PdfBlockRenderer
              block={subBlock}
              theme={theme}
              pdfTheme={pdfTheme}
              keywords={keywords}
              customTheme={customTheme}
            />
          </div>
        ))}
      </div>
    );
  },
);

const PdfBlockRenderer = memo(
  ({
    block,
    theme,
    keywords = {},
    onDelete,
    onUpdate,
    onSettings,
    pdfTheme = "modern",
    customTheme,
    isEditMode = false,
  }: {
    block: PdfBlock;
    theme: ThemeColor;
    keywords?: Record<string, string>;
    onDelete?: () => void;
    onUpdate?: (newBlock: PdfBlock) => void;
    onSettings?: () => void;
    pdfTheme?: PdfTheme;
    customTheme?: PdfCustomTheme;
    isEditMode?: boolean;
  }) => {
  const activeColorThemes = colorThemes;
    const t = (typeof theme === 'string' && theme.startsWith('{')) ? JSON.parse(theme as string) : activeColorThemes[theme as keyof typeof activeColorThemes];

    const headingId =
      block.type === "heading" || block.type === "subheading"
        ? `heading-${cleanText(block.content || "").toLowerCase().replace(/\s+/g, "-")}`
        : undefined;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onUpdate) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onUpdate({
            ...block,
            imageUrl: event.target?.result as string,
          });
        };
        reader.readAsDataURL(file);
      }
    };

    if (block.type === "container") {
      return (
        <div 
          className="pdf-block flex flex-col gap-6 w-full my-8" 
          data-block-type="container"
        >
          <div className="flex flex-col gap-6">
            {block.children?.map((child, idx) => (
              <PdfBlockRenderer
                key={idx}
                block={child}
                theme={theme}
                keywords={keywords}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
              />
            ))}
          </div>
        </div>
      );
    }

    if (block.type === "disease") {
      return (
        <div 
          className="relative my-12 overflow-hidden print:overflow-visible rounded-[2rem] border-[6px] border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] bg-white dark:bg-slate-900"
          style={customTheme ? { borderColor: customTheme.primaryColor, backgroundColor: customTheme.backgroundColor } : {}}
        >
          <div className="absolute top-0 right-0 -m-12 opacity-[0.03] dark:opacity-10 pointer-events-none">
            <Activity size={350} strokeWidth={1} />
          </div>
          
          <div className="p-8 sm:p-10 border-b-[6px] border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center gap-6 relative z-10"
               style={customTheme ? { borderColor: customTheme.primaryColor, backgroundColor: customTheme.primaryColor + '10' } : {}}>
             <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-lg shrink-0">
               <Stethoscope className="w-12 h-12 text-rose-500" style={customTheme ? { color: customTheme.primaryColor } : {}} />
             </div>
             <div className="flex-1">
                 <div className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 dark:text-slate-500" style={customTheme ? { color: customTheme.accentColor } : {}}>Disease Overview</div>
                 <h2 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tight break-words">
                   <MarkdownRenderer content={block.title || block.content || "Disease Overview"} theme={theme} pdfTheme={pdfTheme} customTheme={customTheme} />
                 </h2>
             </div>
          </div>
          
          <div className="p-6 sm:p-10 flex flex-col gap-6 relative z-10">
            {[...(block.children || [])].sort((a, b) => {
              const getRank = (c: PdfBlock) => {
                const s = (c.subType || c.title || c.content || "").toLowerCase();
                if (s.includes("definition")) return 0;
                if (s.includes("etiology") || s.includes("cause")) return 1;
                if (s.includes("classification")) return 2;
                if (s.includes("risk")) return 3;
                if (s.includes("clinical") || s.includes("feature")) return 4;
                if (s.includes("signs")) return 5;
                if (s.includes("symptom")) return 6;
                if (s.includes("diagnosis") || s.includes("investigation")) return 7;
                if (s.includes("differential")) return 8;
                if (s.includes("complication")) return 9;
                if (s.includes("management")) return 10;
                if (s.includes("treatment")) return 11;
                if (s.includes("traps") || s.includes("trap")) return 12;
                return 100;
              };
              return getRank(a) - getRank(b);
            }).map((child, idx) => {
              const subTypeStr = (child.subType || child.title || child.content || "").toLowerCase();
              let Icon = CheckCircle2;
              let styleClasses = "border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700/50";
              let titleColor = "text-slate-800 dark:text-white";
              let iconBg = "bg-white dark:bg-slate-800";
              let iconColor = "text-slate-400 dark:text-slate-500";
              let iconBorder = "border border-slate-100 dark:border-slate-700";
              
              if (subTypeStr.includes("definition")) { Icon = BookOpen; styleClasses = "border-sky-200 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-800/50"; iconColor = "text-sky-500"; iconBg = "bg-sky-100 dark:bg-sky-900"; iconBorder = "border-sky-200 dark:border-sky-700"; }
              else if (subTypeStr.includes("classification")) { Icon = Layers; styleClasses = "border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800/50"; iconColor = "text-indigo-500"; iconBg = "bg-indigo-100 dark:bg-indigo-900"; iconBorder = "border-indigo-200 dark:border-indigo-700"; }
              else if (subTypeStr.includes("etiology") || subTypeStr.includes("cause")) { Icon = Dna; styleClasses = "border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800/50"; iconColor = "text-purple-500"; iconBg = "bg-purple-100 dark:bg-purple-900"; iconBorder = "border-purple-200 dark:border-purple-700"; }
              else if (subTypeStr.includes("clinical") || subTypeStr.includes("feature")) { Icon = Activity; styleClasses = "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800/50"; iconColor = "text-amber-500"; iconBg = "bg-amber-100 dark:bg-amber-900"; iconBorder = "border-amber-200 dark:border-amber-700"; }
              else if (subTypeStr.includes("signs")) { Icon = Eye; styleClasses = "border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800/50"; iconColor = "text-orange-500"; iconBg = "bg-orange-100 dark:bg-orange-900"; iconBorder = "border-orange-200 dark:border-orange-700"; }
              else if (subTypeStr.includes("symptom")) { Icon = AlertCircle; styleClasses = "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800/50"; iconColor = "text-yellow-600 dark:text-yellow-400"; iconBg = "bg-yellow-100 dark:bg-yellow-900/50"; iconBorder = "border-yellow-200 dark:border-yellow-700"; }
              else if (subTypeStr.includes("differential")) { Icon = Microscope; styleClasses = "border-teal-200 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-800/50"; iconColor = "text-teal-500"; iconBg = "bg-teal-100 dark:bg-teal-900"; iconBorder = "border-teal-200 dark:border-teal-700"; }
              else if (subTypeStr.includes("diagnosis") || subTypeStr.includes("investigation")) { Icon = Stethoscope; styleClasses = "border-cyan-200 bg-cyan-50 dark:bg-cyan-900/20 dark:border-cyan-800/50"; iconColor = "text-cyan-500"; iconBg = "bg-cyan-100 dark:bg-cyan-900"; iconBorder = "border-cyan-200 dark:border-cyan-700"; }
              else if (subTypeStr.includes("management")) { Icon = ShieldAlert; styleClasses = "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800/50"; iconColor = "text-emerald-500"; iconBg = "bg-emerald-100 dark:bg-emerald-900"; iconBorder = "border-emerald-200 dark:border-emerald-700"; }
              else if (subTypeStr.includes("treatment")) { Icon = Pill; styleClasses = "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800/50"; iconColor = "text-green-600 dark:text-green-400"; iconBg = "bg-green-100 dark:bg-green-900"; iconBorder = "border-green-200 dark:border-green-700"; }
              else if (subTypeStr.includes("complication")) { Icon = AlertTriangle; styleClasses = "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50"; iconColor = "text-red-500"; iconBg = "bg-red-100 dark:bg-red-900"; iconBorder = "border-red-200 dark:border-red-700"; }
              else if (subTypeStr.includes("risk")) { Icon = Syringe; styleClasses = "border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800/50"; iconColor = "text-rose-500"; iconBg = "bg-rose-100 dark:bg-rose-900"; iconBorder = "border-rose-200 dark:border-rose-700"; }
              else if (subTypeStr.includes("traps") || subTypeStr.includes("trap")) { Icon = Skull; styleClasses = "border-rose-600 bg-rose-600 text-white dark:border-rose-600 dark:bg-rose-600 shadow-[0_5px_20px_rgba(225,29,72,0.4)]"; titleColor = "text-white"; iconColor = "text-rose-600"; iconBg = "bg-white"; iconBorder = "border-white/50"; }

              // For non-matched subTypes we use the default fallback block rendering.
              // IF it matched, process the content
              return (
                <div key={idx} className={`relative flex flex-col sm:flex-row gap-5 p-6 rounded-[1.5rem] border-2 ${styleClasses} transition-all hover:-translate-y-1 hover:shadow-xl duration-300 print:break-inside-avoid print:shadow-none print:transform-none`}>
                   <div className={`flex-shrink-0 flex items-center justify-center p-3 rounded-2xl shadow-sm w-16 h-16 self-start ${iconBg} ${iconBorder}`}>
                     <Icon className={`w-8 h-8 ${iconColor}`} />
                   </div>
                   <div className="flex-1 space-y-3 pt-1">
                     <h3 className={`text-xl sm:text-2xl font-bold uppercase tracking-wider ${titleColor} opacity-90 block`}>
                       {child.subType || child.title || "Section"}
                     </h3>
                     <div className={`prose dark:prose-invert max-w-none prose-lg font-medium ${subTypeStr.includes('trap') ? '!prose-p:text-white !prose-strong:text-white !prose-li:text-white border-l-4 border-white/50 pl-4' : ''}`}>
                       <MarkdownRenderer
                         content={child.content || ""}
                         theme={theme}
                         keywords={keywords}
                         pdfTheme={pdfTheme}
                         customTheme={customTheme}
                       />
                     </div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (pdfTheme === "brutalist") {
      switch (block.type) {
        case "heading":
          return (
            <div className={`pdf-block relative mt-32 mb-16 group`} id={headingId} data-block-type="heading">
              <div
                className={`absolute -inset-4 ${t.bg} opacity-20 transform skew-x-12 -rotate-1 group-hover:skew-x-0 group-hover:rotate-0 transition-transform duration-500`}
                style={
                  customTheme
                    ? { backgroundColor: customTheme.primaryColor + "33" }
                    : {}
                }
              />
              <div
                className={`relative border-l-[24px] ${t.border} pl-10 py-8 ${t.accent} ${t.shadow} transform -rotate-1 hover:rotate-0 transition-transform`}
                style={
                  customTheme
                    ? {
                        borderLeftColor: customTheme.primaryColor,
                        backgroundColor: customTheme.accentColor,
                      }
                    : {}
                }
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-black opacity-10" />
                <h3
                  className="text-4xl sm:text-6xl font-black text-black tracking-tighter uppercase italic leading-none break-words"
                  dir="auto"
                  style={
                    customTheme
                      ? {
                          color: customTheme.textColor,
                          fontFamily: customTheme.headingFont,
                        }
                      : {}
                  }
                >
                  <MarkdownRenderer
                    content={block.content || ""}
                    theme={theme}
                    pdfTheme={pdfTheme}
                    customTheme={customTheme}
                    onUpdate={
                      onUpdate
                        ? (newContent) =>
                            onUpdate({ ...block, content: newContent })
                        : undefined
                    }
                  />
                </h3>
                <div
                  className={`absolute -top-6 -right-6 w-16 h-16 ${t.bg} border-8 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                  style={
                    customTheme
                      ? { backgroundColor: customTheme.primaryColor }
                      : {}
                  }
                >
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          );
        case "subheading":
          return (
            <div className={`pdf-block relative mt-16 mb-8 group`} data-block-type="subheading">
              <div
                className={`absolute -inset-y-2 -inset-x-4 ${t.bg} opacity-10 transform -rotate-1 group-hover:rotate-0 transition-transform rounded-sm`}
                style={
                  customTheme
                    ? { backgroundColor: customTheme.primaryColor + "1a" }
                    : {}
                }
              />
              <div
                className={`relative border-l-8 ${t.border} pl-6 py-4 transform hover:translate-x-1 transition-transform bg-white/40 backdrop-blur-sm shadow-sm`}
                style={
                  customTheme
                    ? { borderLeftColor: customTheme.primaryColor }
                    : {}
                }
              >
                <h4
                  className="text-2xl sm:text-4xl font-black text-black tracking-tight uppercase leading-tight break-words flex items-center gap-3"
                  dir="auto"
                  style={
                    customTheme
                      ? {
                          color: customTheme.textColor,
                          fontFamily: customTheme.headingFont,
                        }
                      : {}
                  }
                >
                  <span className={`${t.text}`}>▶</span>
                  <MarkdownRenderer
                    content={block.content || ""}
                    theme={theme}
                    pdfTheme={pdfTheme}
                    customTheme={customTheme}
                    onUpdate={
                      onUpdate
                        ? (newContent) =>
                            onUpdate({ ...block, content: newContent })
                        : undefined
                    }
                  />
                </h4>
              </div>
            </div>
          );
        case "example":
          return (
            <div
              className={`relative mb-10 group border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}
              style={
                customTheme
                  ? {
                      borderColor: customTheme.primaryColor,
                      backgroundColor: customTheme.backgroundColor,
                      boxShadow: `8px 8px 0px 0px ${customTheme.primaryColor}`,
                    }
                  : {}
              }
            >
              <div
                className={`text-xs font-black uppercase tracking-widest ${t.text} mb-2`}
                style={customTheme ? { color: customTheme.primaryColor } : {}}
              >
                Example
              </div>
              <div
                className={`text-black leading-relaxed text-lg sm:text-xl font-bold tracking-tight`}
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        fontFamily: customTheme.bodyFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          );
        case "explanation":
          return (
            <div
              className={`relative mb-10 group border-l-8 border-dashed border-black pl-6 py-2`}
              style={
                customTheme ? { borderLeftColor: customTheme.primaryColor } : {}
              }
            >
              <div
                className={`text-xs font-black uppercase tracking-widest text-slate-500 mb-2`}
              >
                Explanation
              </div>
              <div
                className={`text-slate-800 leading-relaxed text-lg sm:text-xl font-medium tracking-tight`}
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        fontFamily: customTheme.bodyFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          );
        case "clinical_correlation":
          return (
            <div
              className={`relative mb-10 group border-4 border-black p-6 ${t.bgLight} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}
              style={
                customTheme
                  ? {
                      borderColor: customTheme.primaryColor,
                      backgroundColor: customTheme.secondaryColor,
                      boxShadow: `8px 8px 0px 0px ${customTheme.primaryColor}`,
                    }
                  : {}
              }
            >
              <div className={`flex items-center gap-2 mb-3`}>
                <div
                  className="w-4 h-4 bg-red-500 border-2 border-black"
                  style={
                    customTheme ? { borderColor: customTheme.primaryColor } : {}
                  }
                />
                <div
                  className={`text-sm font-black uppercase tracking-widest text-black`}
                  style={customTheme ? { color: customTheme.textColor } : {}}
                >
                  Clinical Correlation
                </div>
              </div>
              <div
                className={`text-black leading-relaxed text-lg sm:text-xl font-bold tracking-tight`}
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        fontFamily: customTheme.bodyFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          );
        case "tip":
          return (
            <div
              className={`relative mb-10 group border-b-8 border-black pb-4`}
              style={
                customTheme
                  ? { borderBottomColor: customTheme.primaryColor }
                  : {}
              }
            >
              <div
                className={`text-xs font-black uppercase tracking-widest ${t.text} mb-2`}
                style={customTheme ? { color: customTheme.primaryColor } : {}}
              >
                Tip
              </div>
              <div
                className={`text-black leading-relaxed text-lg sm:text-xl font-bold tracking-tight italic`}
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        fontFamily: customTheme.bodyFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          );
        case "reference":
          return (
            <div className={`relative mb-10 group text-right`}>
              <div
                className={`text-slate-500 leading-[1.2] text-sm font-mono font-bold tracking-widest uppercase`}
                style={
                  customTheme ? { color: customTheme.textColor + "88" } : {}
                }
              >
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          );
        case "dialogue":
          return (
            <div
              className={`relative mb-10 group pl-8 border-l-8 border-black`}
              style={
                customTheme ? { borderLeftColor: customTheme.primaryColor } : {}
              }
            >
              <div
                className={`text-black leading-relaxed text-lg sm:text-xl font-bold tracking-tight font-mono`}
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        fontFamily: customTheme.bodyFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          );
        case "bento":
          return (
            <BentoGridBlock
              block={block}
              theme={theme}
              pdfTheme={pdfTheme}
              keywords={keywords}
              customTheme={customTheme}
            />
          );
        case "flashcard":
          return (
            <FlashcardBlock
              block={block}
              theme={theme}
              pdfTheme={pdfTheme}
              customTheme={customTheme}
              keywords={keywords}
            />
          );
        case "expandable":
        case "reveal":
        case "paragraph":
        case "text":
        case "plain":
          return (
            <div className={`relative mb-10 group`}>
              <div
                className={`absolute left-0 top-0 bottom-0 w-2 ${t.bg} opacity-0 group-hover:opacity-100 transition-opacity`}
                style={
                  customTheme
                    ? { backgroundColor: customTheme.primaryColor }
                    : {}
                }
              />
              <div
                className={`text-black leading-relaxed text-lg sm:text-xl font-black tracking-tight border-l-8 ${t.border} pl-8 py-4 bg-white/50 hover:bg-white transition-colors`}
                style={
                  customTheme
                    ? {
                        borderLeftColor: customTheme.primaryColor,
                        color: customTheme.textColor,
                        fontFamily: customTheme.bodyFont,
                      }
                    : {}
                }
              >
                <div
                  className={`w-6 h-6 ${t.bg} mb-4 border-4 border-black`}
                  style={
                    customTheme
                      ? {
                          backgroundColor: customTheme.primaryColor,
                          borderColor: customTheme.primaryColor,
                        }
                      : {}
                  }
                />
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          );
        case "subtitle":
          return (
            <div className={`relative inline-block mb-10 group`}>
              <div
                className={`absolute inset-0 ${t.secondary} transform translate-x-2 translate-y-2 border-4 border-black`}
                style={
                  customTheme
                    ? {
                        backgroundColor: customTheme.secondaryColor,
                        borderColor: customTheme.primaryColor,
                      }
                    : {}
                }
              />
              <div
                className={`relative ${t.bg} text-white p-8 border-4 border-black ${t.shadow} transform hover:-translate-y-1 hover:-translate-x-1 transition-transform`}
                style={
                  customTheme
                    ? {
                        backgroundColor: customTheme.primaryColor,
                        borderColor: customTheme.primaryColor,
                        boxShadow: `8px 8px 0px 0px ${customTheme.primaryColor}`,
                      }
                    : {}
                }
              >
                <div className="text-4xl font-black tracking-tighter leading-none break-words uppercase italic flex items-center gap-4">
                  <div className="w-3 h-12 bg-white/30" />
                  <MarkdownRenderer
                    content={block.content}
                    theme={theme}
                    pdfTheme={pdfTheme}
                    customTheme={customTheme}
                    onUpdate={
                      onUpdate
                        ? (newContent) =>
                            onUpdate({ ...block, content: newContent })
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>
          );
        case "caption":
          return (
            <div
              className={`text-sm font-black text-black uppercase tracking-[0.2em] border-4 border-black ${t.bgLight} p-4 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
              style={
                customTheme
                  ? {
                      borderColor: customTheme.primaryColor,
                      backgroundColor: customTheme.secondaryColor,
                      color: customTheme.textColor,
                      boxShadow: `4px 4px 0px 0px ${customTheme.primaryColor}`,
                    }
                  : {}
              }
            >
              <MarkdownRenderer
                content={block.content}
                theme={theme}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </div>
          );
        case "high_yield":
          return (
            <div
              className={`relative border-[12px] border-black p-16 ${t.bg} ${t.shadow} transform rotate-1 my-20 overflow-hidden group`}
              style={
                customTheme
                  ? {
                      borderColor: customTheme.primaryColor,
                      backgroundColor: customTheme.primaryColor,
                      boxShadow: `32px 32px 0px 0px ${customTheme.primaryColor}`,
                    }
                  : {}
              }
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)",
                  backgroundSize: "60px 60px",
                }}
              />
              <div className="absolute top-0 left-0 w-full h-4 bg-black/20" />
              <div
                className={`absolute -top-10 -left-10 ${t.accent} border-8 border-black p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] z-10 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500`}
                style={
                  customTheme
                    ? {
                        backgroundColor: customTheme.accentColor,
                        borderColor: customTheme.primaryColor,
                        boxShadow: `12px 12px 0px 0px ${customTheme.primaryColor}`,
                      }
                    : {}
                }
              >
                <div className="flex flex-col items-center gap-2">
                  <Sparkles
                    className="w-12 h-12 text-black"
                    style={customTheme ? { color: customTheme.textColor } : {}}
                  />
                  <span
                    className="text-2xl font-black uppercase tracking-[0.3em] text-black leading-none"
                    style={customTheme ? { color: customTheme.textColor } : {}}
                  >
                    VITAL
                  </span>
                </div>
              </div>
              <div
                className="relative z-10 text-white font-black text-4xl sm:text-6xl leading-[0.8] uppercase italic tracking-tighter mt-8"
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        fontFamily: customTheme.headingFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
              <div className="absolute bottom-4 right-4 text-white/20 font-black text-8xl select-none pointer-events-none">
                01
              </div>
            </div>
          );
        case "note":
          return (
            <div
              className={`border-8 border-black p-12 ${t.bgLight} shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden my-12 group`}
              style={
                customTheme
                  ? {
                      borderColor: customTheme.primaryColor,
                      backgroundColor: customTheme.secondaryColor,
                      boxShadow: `20px 20px 0px 0px ${customTheme.primaryColor}`,
                    }
                  : {}
              }
            >
              <div
                className={`absolute top-0 right-0 w-48 h-48 ${t.bg} opacity-10 transform rotate-45 translate-x-24 -translate-y-24 group-hover:translate-x-20 group-hover:-translate-y-20 transition-transform`}
                style={
                  customTheme
                    ? { backgroundColor: customTheme.primaryColor }
                    : {}
                }
              />
              <div
                className="flex items-center justify-between mb-10 border-b-8 border-black pb-6"
                style={
                  customTheme
                    ? { borderBottomColor: customTheme.primaryColor }
                    : {}
                }
              >
                <div
                  className="flex items-center gap-6 text-black font-black text-xl uppercase tracking-[0.5em]"
                  style={customTheme ? { color: customTheme.textColor } : {}}
                >
                  <FileText className="w-12 h-12" /> DATA POINT
                </div>
                <div
                  className={`w-8 h-8 ${t.bg} border-4 border-black`}
                  style={
                    customTheme
                      ? {
                          backgroundColor: customTheme.primaryColor,
                          borderColor: customTheme.primaryColor,
                        }
                      : {}
                  }
                />
              </div>
              <div
                className="text-black font-black text-xl sm:text-2xl leading-tight uppercase tracking-tighter italic"
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        fontFamily: customTheme.bodyFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          );
        case "warning":
          return (
            <div
              className={`border-[16px] border-black p-16 ${t.accent} text-black shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 my-20 relative overflow-hidden group`}
              style={
                customTheme
                  ? {
                      borderColor: customTheme.primaryColor,
                      backgroundColor: customTheme.accentColor,
                      boxShadow: `32px 32px 0px 0px ${customTheme.primaryColor}`,
                    }
                  : {}
              }
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(-45deg, #000, #000 20px, transparent 20px, transparent 40px)",
                }}
              />
              <div className="absolute top-0 left-0 w-full h-8 bg-black group-hover:h-4 transition-all" />
              <div
                className="relative z-10 flex items-center gap-10 font-black text-4xl uppercase tracking-[0.6em] mb-12 border-b-[12px] border-black pb-10"
                style={
                  customTheme
                    ? {
                        borderBottomColor: customTheme.primaryColor,
                        color: customTheme.textColor,
                      }
                    : {}
                }
              >
                <AlertTriangle className="w-24 h-24 animate-pulse" /> ALERT
              </div>
              <div
                className="relative z-10 font-black text-4xl sm:text-7xl leading-[0.75] uppercase italic tracking-tighter"
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        fontFamily: customTheme.headingFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          );
        case "summary":
          return (
            <div
              className={`${t.bgMedium} p-20 border-[12px] border-black ${t.shadow} my-20 relative overflow-hidden group`}
              style={
                customTheme
                  ? {
                      borderColor: customTheme.primaryColor,
                      backgroundColor: customTheme.secondaryColor,
                      boxShadow: `32px 32px 0px 0px ${customTheme.primaryColor}`,
                      color: "#ffffff" // Ensure white text for high contrast on dark bg
                    }
                  : {}
              }
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #000 4px, transparent 4px)",
                  backgroundSize: "30px 30px",
                }}
              />
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div
                className={`relative z-10 flex items-center justify-between mb-16`}
              >
                <div
                  className="flex items-center gap-8 text-white font-black text-4xl uppercase tracking-[0.8em]"
                  style={customTheme ? { color: customTheme.textColor } : {}}
                >
                  <CheckCircle className="w-20 h-20" /> RECAP
                </div>
                <div className="flex gap-4">
                  <div
                    className="w-6 h-6 bg-white border-4 border-black"
                    style={
                      customTheme
                        ? { borderColor: customTheme.primaryColor }
                        : {}
                    }
                  />
                  <div
                    className="w-6 h-6 bg-white border-4 border-black opacity-50"
                    style={
                      customTheme
                        ? { borderColor: customTheme.primaryColor }
                        : {}
                    }
                  />
                  <div
                    className="w-6 h-6 bg-white border-4 border-black opacity-20"
                    style={
                      customTheme
                        ? { borderColor: customTheme.primaryColor }
                        : {}
                    }
                  />
                </div>
              </div>
              <div
                className="relative z-10 text-white font-black text-4xl sm:text-6xl leading-[0.85] uppercase italic tracking-tighter border-l-[12px] border-white pl-12"
                style={
                  customTheme
                    ? {
                        borderLeftColor: customTheme.textColor,
                        color: customTheme.textColor,
                        fontFamily: customTheme.headingFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  keywords={keywords}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          );
        case "code":
          return (
            <div
              className={`border-[12px] border-black ${t.bgLight} shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] overflow-hidden my-12 relative group`}
              style={
                customTheme
                  ? {
                      borderColor: customTheme.primaryColor,
                      backgroundColor: customTheme.secondaryColor,
                      boxShadow: `24px 24px 0px 0px ${customTheme.primaryColor}`,
                    }
                  : {}
              }
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 transform rotate-45 translate-x-16 -translate-y-16" />
              <div
                className="bg-black px-10 py-6 flex justify-between items-center border-b-[12px] border-black"
                style={
                  customTheme
                    ? { borderBottomColor: customTheme.primaryColor }
                    : {}
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-4 h-12 ${t.bg}`}
                    style={
                      customTheme
                        ? { backgroundColor: customTheme.primaryColor }
                        : {}
                    }
                  />
                  <div
                    className={`text-xl font-black ${t.text} uppercase tracking-[0.5em]`}
                    style={
                      customTheme ? { color: customTheme.primaryColor } : {}
                    }
                  >
                    {block.language || "SYS_LOG"}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-red-500 border-4 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                  <div className="w-6 h-6 bg-yellow-500 border-4 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                  <div className="w-6 h-6 bg-green-500 border-4 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                </div>
              </div>
              <pre
                className="p-12 font-mono text-lg sm:text-xl font-black leading-tight text-black overflow-x-auto selection:bg-black selection:text-white"
                style={customTheme ? { color: customTheme.textColor } : {}}
              >
                <code>{block.content}</code>
              </pre>
              <div className="absolute bottom-4 right-4 text-black/10 font-mono text-xs uppercase tracking-widest">
                END_OF_FILE
              </div>
            </div>
          );
        case "quote":
          return (
            <div
              className={`relative py-32 px-20 border-[12px] border-black text-center ${t.secondary} shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] my-24 transform rotate-1 group`}
              style={
                customTheme
                  ? {
                      borderColor: customTheme.primaryColor,
                      backgroundColor: customTheme.secondaryColor,
                      boxShadow: `32px 32px 0px 0px ${customTheme.primaryColor}`,
                    }
                  : {}
              }
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 10px)",
                }}
              />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <div
                  className={`p-6 ${t.bg} border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}
                  style={
                    customTheme
                      ? {
                          backgroundColor: customTheme.primaryColor,
                          borderColor: customTheme.primaryColor,
                          boxShadow: `8px 8px 0px 0px ${customTheme.primaryColor}`,
                        }
                      : {}
                  }
                >
                  <Quote
                    className="w-16 h-16 text-white"
                    style={
                      customTheme ? { color: customTheme.backgroundColor } : {}
                    }
                  />
                </div>
              </div>
              <div
                className="relative z-10 text-4xl sm:text-7xl font-black text-black uppercase leading-[0.75] tracking-tighter break-words italic selection:bg-black selection:text-white"
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        fontFamily: customTheme.headingFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  keywords={keywords}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
              <div
                className={`absolute -bottom-12 -right-12 w-32 h-32 ${t.bg} border-[12px] border-black flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform`}
                style={
                  customTheme
                    ? {
                        backgroundColor: customTheme.primaryColor,
                        borderColor: customTheme.primaryColor,
                      }
                    : {}
                }
              >
                <div className="w-12 h-12 bg-white border-4 border-black" />
              </div>
            </div>
          );
        case "list":
          return (
            <div className="space-y-8 my-12">
              {block.items?.map((item, i) => (
                <div
                  key={i}
                  className={`relative flex gap-10 items-center ${t.bgLight} border-8 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform ${i % 2 === 0 ? "rotate-1" : "-rotate-1"} hover:rotate-0 transition-transform group`}
                  style={
                    customTheme
                      ? {
                          borderColor: customTheme.primaryColor,
                          backgroundColor: customTheme.secondaryColor,
                          boxShadow: `12px 12px 0px 0px ${customTheme.primaryColor}`,
                        }
                      : {}
                  }
                >
                  <div
                    className={`w-16 h-16 ${t.bg} border-[10px] border-black shrink-0 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center group-hover:scale-110 transition-transform`}
                    style={
                      customTheme
                        ? {
                            backgroundColor: customTheme.primaryColor,
                            borderColor: customTheme.primaryColor,
                            boxShadow: `6px 6px 0px 0px ${customTheme.primaryColor}`,
                          }
                        : {}
                    }
                  >
                    <div
                      className="w-4 h-4 bg-white border-2 border-black"
                      style={
                        customTheme
                          ? { borderColor: customTheme.primaryColor }
                          : {}
                      }
                    />
                  </div>
                  <div
                    className="text-black font-black text-xl sm:text-2xl tracking-tighter uppercase leading-tight selection:bg-black selection:text-white"
                    style={
                      customTheme
                        ? {
                            color: customTheme.textColor,
                            fontFamily: customTheme.bodyFont,
                          }
                        : {}
                    }
                  >
                    <MarkdownRenderer
                      content={item}
                      theme={theme}
                      keywords={keywords}
                      pdfTheme={pdfTheme}
                      customTheme={customTheme}
                      onUpdate={
                        onUpdate
                          ? (newContent) => {
                              const newItems = [...(block.items || [])];
                              newItems[i] = newContent;
                              onUpdate({ ...block, items: newItems });
                            }
                          : undefined
                      }
                    />
                  </div>
                  <div className="absolute top-2 right-2 text-[10px] font-black opacity-20">
                    ITEM_{i + 1}
                  </div>
                </div>
              ))}
            </div>
          );
        case "step":
          return (
            <div className="space-y-8 my-8">
              {block.items?.map((item, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <div className="relative shrink-0">
                    <div
                      className={`absolute inset-0 ${t.bg} border-4 border-black transform translate-x-2 translate-y-2`}
                      style={
                        customTheme
                          ? {
                              backgroundColor: customTheme.primaryColor,
                              borderColor: customTheme.primaryColor,
                            }
                          : {}
                      }
                    />
                    <div
                      className={`relative w-16 h-16 bg-black text-white flex items-center justify-center font-black text-3xl border-4 border-black group-hover:-translate-y-1 group-hover:-translate-x-1 transition-transform`}
                      style={
                        customTheme
                          ? {
                              borderColor: customTheme.primaryColor,
                              backgroundColor: customTheme.backgroundColor,
                              color: customTheme.textColor,
                            }
                          : {}
                      }
                    >
                      {i + 1}
                    </div>
                  </div>
                  <div
                    className={`flex-1 pt-3 text-black font-black text-xl sm:text-2xl tracking-tighter uppercase italic border-b-[6px] ${t.border} pb-6 relative`}
                    style={
                      customTheme
                        ? {
                            borderBottomColor: customTheme.primaryColor,
                            color: customTheme.textColor,
                            fontFamily: customTheme.headingFont,
                          }
                        : {}
                    }
                  >
                    <div
                      className={`absolute -left-3 top-0 w-1.5 h-full ${t.bg} opacity-20`}
                      style={
                        customTheme
                          ? { backgroundColor: customTheme.primaryColor }
                          : {}
                      }
                    />
                    <MarkdownRenderer
                      content={item}
                      theme={theme}
                      keywords={keywords}
                      pdfTheme={pdfTheme}
                      customTheme={customTheme}
                      onUpdate={
                        onUpdate
                          ? (newContent) => {
                              const newItems = [...(block.items || [])];
                              newItems[i] = newContent;
                              onUpdate({ ...block, items: newItems });
                            }
                          : undefined
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        case "vocabulary":
          return (
            <div
              className={`border-[12px] border-black ${t.bgLight} shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] p-16 my-16 relative group overflow-hidden`}
              style={
                customTheme
                  ? {
                      borderColor: customTheme.primaryColor,
                      backgroundColor: customTheme.secondaryColor,
                      boxShadow: `32px 32px 0px 0px ${customTheme.primaryColor}`,
                    }
                  : {}
              }
            >
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 20px)",
                }}
              />
              <div
                className={`relative z-10 text-7xl sm:text-9xl font-black text-black uppercase italic tracking-tighter leading-[0.7] mb-12 border-b-[12px] border-black pb-10 ${t.gradientText || t.text} selection:bg-black selection:text-white`}
                dir="auto"
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        borderBottomColor: customTheme.primaryColor,
                        fontFamily: customTheme.headingFont,
                      }
                    : {}
                }
              >
                {block.term}
              </div>
              <div
                className={`absolute top-4 right-4 px-6 py-2 ${t.bg} text-white font-black text-xs uppercase tracking-[0.4em] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                style={
                  customTheme
                    ? {
                        backgroundColor: customTheme.primaryColor,
                        borderColor: customTheme.primaryColor,
                        boxShadow: `4px 4px 0px 0px ${customTheme.primaryColor}`,
                      }
                    : {}
                }
              >
                DEF_ID: {Math.floor(Math.random() * 10000)}
              </div>
              <div
                className="relative z-10 text-black font-black text-2xl sm:text-4xl leading-tight uppercase tracking-tighter border-l-[12px] border-black pl-10"
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        borderLeftColor: customTheme.primaryColor,
                        fontFamily: customTheme.bodyFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.definition || ""}
                  theme={theme}
                  keywords={keywords}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, definition: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          );
        case "table":
          return (
            <div
              className={`border-[12px] border-black shadow-[40px_40px_0px_0px_rgba(0,0,0,1)] overflow-x-auto ${t.bgLight} my-16 relative`}
              style={
                customTheme
                  ? {
                      borderColor: customTheme.primaryColor,
                      backgroundColor: customTheme.secondaryColor,
                      boxShadow: `40px 40px 0px 0px ${customTheme.primaryColor}`,
                    }
                  : {}
              }
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-black opacity-20" />
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={`${t.bg} text-white border-b-[12px] border-black`}
                    style={
                      customTheme
                        ? {
                            backgroundColor: customTheme.primaryColor,
                            borderBottomColor: customTheme.primaryColor,
                          }
                        : {}
                    }
                  >
                    {block.columns?.map((col, i) => (
                      <th
                        key={i}
                        className="p-10 text-xl sm:text-2xl font-black uppercase tracking-[0.4em] border-r-[12px] border-black last:border-0 relative"
                        style={
                          customTheme
                            ? {
                                borderRightColor: customTheme.primaryColor,
                                color: customTheme.backgroundColor,
                                fontFamily: customTheme.headingFont,
                              }
                            : {}
                        }
                      >
                        <div className="absolute top-2 left-2 w-2 h-2 bg-white/30" />
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows?.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b-[12px] border-black last:border-0 ${i % 2 === 0 ? "bg-white" : t.bgLight} hover:bg-black hover:text-white transition-colors group`}
                      style={
                        customTheme
                          ? { borderBottomColor: customTheme.primaryColor }
                          : {}
                      }
                    >
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className="p-10 text-xl sm:text-2xl font-black border-r-[12px] border-black last:border-0 relative"
                          style={
                            customTheme
                              ? {
                                  borderRightColor: customTheme.primaryColor,
                                  color: customTheme.textColor,
                                  fontFamily: customTheme.bodyFont,
                                }
                              : {}
                          }
                        >
                          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-black opacity-20 group-hover:border-white" />
                          <MarkdownRenderer
                            content={cell}
                            theme={theme}
                            keywords={keywords}
                            pdfTheme={pdfTheme}
                            customTheme={customTheme}
                            onUpdate={
                              onUpdate
                                ? (newContent) => {
                                    const newRows = [...(block.rows || [])];
                                    newRows[i] = [...newRows[i]];
                                    newRows[i][j] = newContent;
                                    onUpdate({ ...block, rows: newRows });
                                  }
                                : undefined
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        case "image":
          return (
            <div
              className={`flex flex-col items-${block.imageAlignment === "left" ? "start" : block.imageAlignment === "right" ? "end" : "center"} gap-12 my-24 relative group/image`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <div
                className={`relative group border-[16px] border-black bg-white shadow-[48px_48px_0px_0px_rgba(0,0,0,1)] overflow-hidden transform hover:scale-[1.02] transition-all duration-500 cursor-pointer min-h-[200px] flex flex-col`}
                onClick={(e) => {
                  if (isEditMode && onSettings) {
                    e.stopPropagation();
                    onSettings();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                style={
                  customTheme
                    ? {
                        width: `${block.imageWidth || 100}%`,
                        borderColor: customTheme.primaryColor,
                        backgroundColor: customTheme.backgroundColor,
                        boxShadow: `48px 48px 0px 0px ${customTheme.primaryColor}`,
                      }
                    : { width: `${block.imageWidth || 100}%` }
                }
              >
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                  <div className="absolute top-8 left-8 w-12 h-12 border-t-8 border-l-8 border-white opacity-50" />
                  <div className="absolute top-8 right-8 w-12 h-12 border-t-8 border-r-8 border-white opacity-50" />
                  <div className="absolute bottom-8 left-8 w-12 h-12 border-b-8 border-l-8 border-white opacity-50" />
                  <div className="absolute bottom-8 right-8 w-12 h-12 border-b-8 border-r-8 border-white opacity-50" />
                </div>
                {block.imageUrl ? (
                  <img
                    src={block.imageUrl}
                    alt={block.imageCaption || "Document image"}
                    className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000 contrast-150 brightness-90 hover:brightness-100"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-300 gap-6">
                    <ImageIcon className="w-32 h-32 opacity-20" />
                    <div className="text-3xl font-black uppercase tracking-widest opacity-40">
                      Empty Photo Slot
                    </div>
                    <button className="px-12 py-6 bg-black text-white font-black uppercase tracking-widest text-xl shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                      Click to Upload
                    </button>
                  </div>
                )}
                {block.imageCaption && (
                  <div
                    className={`p-10 bg-black text-white font-black uppercase text-3xl text-center border-t-[12px] border-black relative overflow-hidden`}
                    style={
                      customTheme
                        ? {
                            backgroundColor: customTheme.primaryColor,
                            borderTopColor: customTheme.primaryColor,
                          }
                        : {}
                    }
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, #fff, #fff 2px, transparent 2px, transparent 10px)",
                      }}
                    />
                    <span
                      className="relative z-10 tracking-[0.2em] italic"
                      style={
                        customTheme
                          ? {
                              color: customTheme.backgroundColor,
                              fontFamily: customTheme.bodyFont,
                            }
                          : {}
                      }
                    >
                      {block.imageCaption}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-4 text-white">
                    <Upload className="w-16 h-16 animate-bounce" />
                    <span className="text-2xl font-black uppercase tracking-widest">
                      Change Artifact
                    </span>
                  </div>
                </div>

                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className={`export-remove absolute top-8 right-8 p-8 ${t.accent} text-black border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:scale-110 hover:rotate-12`}
                    title="Remove Photo"
                    style={
                      customTheme
                        ? {
                            backgroundColor: customTheme.accentColor,
                            borderColor: customTheme.primaryColor,
                            boxShadow: `12px 12px 0px 0px ${customTheme.primaryColor}`,
                          }
                        : {}
                    }
                  >
                    <Trash2 className="w-12 h-12" />
                  </button>
                )}
              </div>
            </div>
          );
        default:
          return null;
      }
    }

    

    switch (block.type) {
      case "heading":
        return (
          <div className="pdf-block relative mt-16 mb-8" id={headingId} data-block-type="heading">
            <div
              className={`absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-1 ${t.bg} hidden sm:block`}
              style={
                customTheme ? { backgroundColor: customTheme.primaryColor } : {}
              }
            />
            <h3
              className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-4 leading-tight break-words"
              dir="auto"
              style={
                customTheme
                  ? {
                      color: customTheme.textColor,
                      fontFamily: customTheme.headingFont,
                    }
                  : {}
              }
            >
              <span
                className={t.text}
                style={customTheme ? { color: customTheme.primaryColor } : {}}
              >
                #
              </span>{" "}
              <MarkdownRenderer
                content={block.content || ""}
                theme={theme}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </h3>
            <div
              className={`h-1 w-24 ${t.bg} opacity-20 mt-2 rounded-full`}
              style={
                customTheme
                  ? { backgroundColor: customTheme.primaryColor + "33" }
                  : {}
              }
            />
          </div>
        );
      case "subheading":
        return (
          <div className="pdf-block relative mt-12 mb-6 group" data-block-type="subheading">
            <div
              className={`absolute -inset-1 ${t.bg} opacity-5 rounded-lg group-hover:opacity-10 transition-opacity`}
              style={
                customTheme
                  ? { backgroundColor: customTheme.primaryColor + "0d" }
                  : {}
              }
            />
            <h4
              className="relative text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase flex items-center gap-3 leading-tight break-words py-2 px-3"
              dir="auto"
              style={
                customTheme
                  ? {
                      color: customTheme.textColor,
                      fontFamily: customTheme.headingFont,
                    }
                  : {}
              }
            >
              <div
                className={`w-1.5 h-6 ${t.bg} rounded-full`}
                style={
                  customTheme
                    ? { backgroundColor: customTheme.primaryColor }
                    : {}
                }
              />
              <MarkdownRenderer
                content={block.content || ""}
                theme={theme}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </h4>
          </div>
        );

      case "example":
        return (
          <div
            className="relative mb-8 pl-6 border-l-4 border-slate-200 dark:border-slate-800"
            style={
              customTheme ? { borderLeftColor: customTheme.primaryColor } : {}
            }
          >
            <div
              className={`text-xs font-bold uppercase tracking-widest ${t.text} mb-2`}
              style={customTheme ? { color: customTheme.primaryColor } : {}}
            >
              Example
            </div>
            <div
              className="text-slate-700 dark:text-slate-100 leading-relaxed text-lg font-medium"
              style={
                customTheme
                  ? {
                      color: customTheme.textColor,
                      fontFamily: customTheme.bodyFont,
                    }
                  : {}
              }
            >
              <MarkdownRenderer
                content={block.content}
                theme={theme}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </div>
          </div>
        );
      case "explanation":
        return (
          <div
            className="relative mb-8 pl-6 border-l-4 border-dashed border-slate-300 dark:border-slate-700"
            style={
              customTheme
                ? { borderLeftColor: customTheme.primaryColor + "66" }
                : {}
            }
          >
            <div
              className={`text-xs font-bold uppercase tracking-widest text-slate-500 mb-2`}
            >
              Explanation
            </div>
            <div
              className="text-slate-600 dark:text-slate-100 leading-relaxed text-lg font-medium"
              style={
                customTheme
                  ? {
                      color: customTheme.textColor + "cc",
                      fontFamily: customTheme.bodyFont,
                    }
                  : {}
              }
            >
              <MarkdownRenderer
                content={block.content}
                theme={theme}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </div>
          </div>
        );
      case "clinical_correlation":
        return (
          <div
            className="relative mb-8 p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30"
            style={
              customTheme
                ? {
                    borderColor: customTheme.primaryColor + "44",
                    backgroundColor: customTheme.secondaryColor + "22",
                  }
                : {}
            }
          >
            <div className={`flex items-center gap-2 mb-3`}>
              <div
                className="w-2 h-2 rounded-full bg-red-500"
                style={
                  customTheme
                    ? { backgroundColor: customTheme.primaryColor }
                    : {}
                }
              />
              <div
                className={`text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400`}
                style={customTheme ? { color: customTheme.primaryColor } : {}}
              >
                Clinical Correlation
              </div>
            </div>
            <div
              className="text-slate-800 dark:text-slate-200 leading-relaxed text-lg font-medium"
              style={
                customTheme
                  ? {
                      color: customTheme.textColor,
                      fontFamily: customTheme.bodyFont,
                    }
                  : {}
              }
            >
              <MarkdownRenderer
                content={block.content}
                theme={theme}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </div>
          </div>
        );
      case "tip":
        return (
          <div
            className="relative mb-8 pl-6 border-l-4 border-blue-200 dark:border-blue-800"
            style={
              customTheme ? { borderLeftColor: customTheme.primaryColor } : {}
            }
          >
            <div
              className={`text-xs font-bold uppercase tracking-widest text-blue-500 mb-2 flex items-center gap-2`}
              style={customTheme ? { color: customTheme.primaryColor } : {}}
            >
              <Sparkles className="w-3 h-3" /> Tip
            </div>
            <div
              className="text-slate-700 dark:text-slate-100 leading-relaxed text-lg font-medium italic"
              style={
                customTheme
                  ? {
                      color: customTheme.textColor,
                      fontFamily: customTheme.bodyFont,
                    }
                  : {}
              }
            >
              <MarkdownRenderer
                content={block.content}
                theme={theme}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </div>
          </div>
        );
      case "reference":
        return (
          <div className="relative mb-8 text-right">
            <div
              className="text-slate-400 dark:text-slate-500 leading-relaxed text-sm font-mono tracking-widest uppercase"
              style={customTheme ? { color: customTheme.textColor + "88" } : {}}
            >
              <MarkdownRenderer
                content={block.content}
                theme={theme}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </div>
          </div>
        );
      case "dialogue":
        return (
          <div
            className="relative mb-8 pl-6 border-l-2 border-slate-300 dark:border-slate-700"
            style={
              customTheme
                ? { borderLeftColor: customTheme.primaryColor + "44" }
                : {}
            }
          >
            <div
              className="text-slate-700 dark:text-slate-100 leading-relaxed text-lg font-medium font-serif italic"
              style={
                customTheme
                  ? {
                      color: customTheme.textColor,
                      fontFamily: customTheme.bodyFont,
                    }
                  : {}
              }
            >
              <MarkdownRenderer
                content={block.content}
                theme={theme}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </div>
          </div>
        );
      case "bento":
        return (
          <BentoGridBlock
            block={block}
            theme={theme}
            pdfTheme={pdfTheme}
            keywords={keywords}
            customTheme={customTheme}
          />
        );
      case "flashcard":
        return (
          <FlashcardBlock
            block={block}
            theme={theme}
            pdfTheme={pdfTheme}
            customTheme={customTheme}
            keywords={keywords}
          />
        );
      case "expandable":
      case "reveal":
      case "paragraph":
      case "text":
      case "plain":
        return (
          <div
            className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-100 leading-relaxed text-lg sm:text-xl font-medium tracking-tight"
            style={
              customTheme
                ? {
                    color: customTheme.textColor,
                    fontFamily: customTheme.bodyFont,
                  }
                : {}
            }
          >
            <MarkdownRenderer
              content={block.content}
              theme={theme}
              pdfTheme={pdfTheme}
              customTheme={customTheme}
              onUpdate={
                onUpdate
                  ? (newContent) => onUpdate({ ...block, content: newContent })
                  : undefined
              }
            />
          </div>
        );

      case "subtitle":
        return (
          <div
            className={`text-2xl font-bold ${t.text} tracking-tight leading-tight break-words`}
            style={
              customTheme
                ? {
                    color: customTheme.primaryColor,
                    fontFamily: customTheme.headingFont,
                  }
                : {}
            }
          >
            <MarkdownRenderer
              content={block.content}
              theme={theme}
              pdfTheme={pdfTheme}
              customTheme={customTheme}
              onUpdate={
                onUpdate
                  ? (newContent) => onUpdate({ ...block, content: newContent })
                  : undefined
              }
            />
          </div>
        );

      case "caption":
        return (
          <div
            className="text-sm font-medium text-slate-500 dark:text-slate-400 italic text-center leading-relaxed break-words"
            style={
              customTheme
                ? {
                    color: customTheme.textColor + "88",
                    fontFamily: customTheme.bodyFont,
                  }
                : {}
            }
          >
            <MarkdownRenderer
              content={block.content}
              theme={theme}
              pdfTheme={pdfTheme}
              customTheme={customTheme}
              onUpdate={
                onUpdate
                  ? (newContent) => onUpdate({ ...block, content: newContent })
                  : undefined
              }
            />
          </div>
        );

      case "high_yield":
        return (
          <motion.div whileHover={{ scale: 1.01 }} className="relative group">
            <div
              className={`absolute -inset-1 bg-gradient-to-r ${t.gradient} rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200`}
              style={
                customTheme
                  ? {
                      backgroundImage: `linear-gradient(to right, ${customTheme.primaryColor}, ${customTheme.secondaryColor})`,
                    }
                  : {}
              }
            />
            <div
              className={`relative bg-white dark:bg-slate-900 border-2 ${t.borderLight} p-8 rounded-[2rem] shadow-xl`}
              style={
                customTheme
                  ? {
                      borderColor: customTheme.primaryColor + "44",
                      backgroundColor: customTheme.backgroundColor,
                    }
                  : {}
              }
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center gap-3 ${t.text} font-black text-xs uppercase tracking-[0.3em]`}
                  style={customTheme ? { color: customTheme.primaryColor } : {}}
                >
                  <Sparkles className="w-6 h-6 animate-pulse" /> HIGH YIELD
                  INSIGHT
                </div>
                <div
                  className={`px-3 py-1 ${t.bg} text-white text-[10px] font-black rounded-full uppercase tracking-widest`}
                  style={
                    customTheme
                      ? { backgroundColor: customTheme.primaryColor }
                      : {}
                  }
                >
                  Priority
                </div>
              </div>
              <div
                className="text-slate-800 dark:text-slate-100 font-bold text-2xl leading-tight italic"
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        fontFamily: customTheme.bodyFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.content}
                  theme={theme}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, content: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          </motion.div>
        );

      case "note":
        return (
          <div
            className={`${t.bgLight} border-2 ${t.borderLight} p-8 rounded-[2.5rem] relative overflow-hidden group`}
            style={
              customTheme
                ? {
                    backgroundColor: customTheme.secondaryColor,
                    borderColor: customTheme.primaryColor + "44",
                  }
                : {}
            }
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 ${t.bg} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`}
              style={
                customTheme ? { backgroundColor: customTheme.primaryColor } : {}
              }
            />
            <div
              className={`flex items-center gap-4 ${t.text} font-black text-xs uppercase tracking-[0.3em] mb-4`}
              style={customTheme ? { color: customTheme.primaryColor } : {}}
            >
              <div
                className={`w-10 h-10 rounded-2xl ${t.bg} text-white flex items-center justify-center shadow-lg ${t.shadow}`}
                style={
                  customTheme
                    ? { backgroundColor: customTheme.primaryColor }
                    : {}
                }
              >
                <FileText className="w-5 h-5" />
              </div>
              CLINICAL NOTE
            </div>
            <div
              className="text-slate-700 dark:text-slate-200 font-bold text-xl leading-relaxed relative z-10"
              style={
                customTheme
                  ? {
                      color: customTheme.textColor,
                      fontFamily: customTheme.bodyFont,
                    }
                  : {}
              }
            >
              <MarkdownRenderer
                content={block.content}
                theme={theme}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </div>
          </div>
        );

      case "warning":
        return (
          <div
            className={`${t.bgLight} border-4 ${t.border} p-8 rounded-[2rem] relative overflow-hidden`}
            style={
              customTheme
                ? {
                    backgroundColor: customTheme.secondaryColor,
                    borderColor: customTheme.primaryColor,
                  }
                : {}
            }
          >
            <div
              className={`flex items-center gap-4 ${t.text} font-black text-xs uppercase tracking-[0.3em] mb-4 relative z-10`}
              style={customTheme ? { color: customTheme.primaryColor } : {}}
            >
              <div
                className={`w-12 h-12 rounded-full ${t.bg} text-white flex items-center justify-center animate-bounce shadow-xl ${t.shadow}`}
                style={
                  customTheme
                    ? { backgroundColor: customTheme.primaryColor }
                    : {}
                }
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              CRITICAL WARNING
            </div>
            <div
              className={`text-slate-900 dark:text-white font-black text-2xl leading-tight relative z-10`}
              style={
                customTheme
                  ? {
                      color: customTheme.textColor,
                      fontFamily: customTheme.headingFont,
                    }
                  : {}
              }
            >
              <MarkdownRenderer
                content={block.content}
                theme={theme}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </div>
          </div>
        );

      case "summary":
        return (
          <div
            className={`bg-slate-900 dark:bg-slate-950 p-10 rounded-[3rem] shadow-2xl border-b-8 ${t.border} relative overflow-hidden dark`}
            style={
              customTheme
                ? {
                    backgroundColor: customTheme.backgroundColor,
                    borderBottomColor: customTheme.primaryColor,
                  }
                : {}
            }
          >
            <div
              className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 ${t.text}`}
              style={customTheme ? { color: customTheme.primaryColor } : {}}
            />
            <div
              className={`flex items-center gap-4 text-white font-black text-xs uppercase tracking-[0.4em] mb-6`}
              style={customTheme ? { color: "#ffffff" } : {}}
            >
              <CheckCircle
                className={`w-8 h-8 text-white`}
                style={customTheme ? { color: "#ffffff" } : {}}
              />{" "}
              EXECUTIVE SUMMARY
            </div>
            <div
              className="text-white dark:text-white font-bold text-xl leading-relaxed italic tracking-tight"
              style={
                customTheme
                  ? {
                      color: "#ffffff", // Force white for high contrast in dark summary block
                      fontFamily: customTheme.bodyFont,
                    }
                  : {}
              }
            >
              <MarkdownRenderer
                content={block.content}
                theme={theme}
                keywords={keywords}
                pdfTheme={pdfTheme}
                customTheme={customTheme ? { ...customTheme, textColor: "#ffffff" } : undefined}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </div>
          </div>
        );

      case "code":
        return (
          <div
            className={`relative group rounded-[2rem] overflow-hidden shadow-2xl border-2 ${t.borderLight}`}
            style={
              customTheme
                ? { borderColor: customTheme.primaryColor + "44" }
                : {}
            }
          >
            <div
              className="bg-slate-800 px-6 py-3 flex justify-between items-center"
              style={
                customTheme
                  ? { backgroundColor: customTheme.backgroundColor }
                  : {}
              }
            >
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest"
                style={
                  customTheme ? { color: customTheme.textColor + "88" } : {}
                }
              >
                {block.language || "source code"}
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <pre
                className="bg-slate-900 text-slate-300 p-8 font-mono text-sm leading-relaxed min-w-full w-max"
                style={
                  customTheme
                    ? {
                        backgroundColor: customTheme.backgroundColor,
                        color: customTheme.textColor,
                      }
                    : {}
                }
              >
                <code>{block.content}</code>
              </pre>
            </div>
          </div>
        );

      case "quote":
        return (
          <div className="relative py-12 px-16 text-center group">
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-1 h-12 ${t.bg} opacity-20`}
              style={
                customTheme ? { backgroundColor: customTheme.primaryColor } : {}
              }
            />
            <Quote
              className={`mx-auto w-16 h-16 ${t.text} opacity-30 mb-6 group-hover:scale-110 transition-transform`}
              style={customTheme ? { color: customTheme.primaryColor } : {}}
            />
            <div
              className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white italic leading-tight tracking-tighter break-words"
              style={
                customTheme
                  ? {
                      color: customTheme.textColor,
                      fontFamily: customTheme.headingFont,
                    }
                  : {}
              }
            >
              <MarkdownRenderer
                content={block.content}
                theme={theme}
                keywords={keywords}
                pdfTheme={pdfTheme}
                customTheme={customTheme}
                onUpdate={
                  onUpdate
                    ? (newContent) =>
                        onUpdate({ ...block, content: newContent })
                    : undefined
                }
              />
            </div>
            <div
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-12 ${t.bg} opacity-20`}
              style={
                customTheme ? { backgroundColor: customTheme.primaryColor } : {}
              }
            />
          </div>
        );

      case "list":
        return (
          <ul className="space-y-6 ml-4">
            {block.items?.map((item, i) => (
              <li key={i} className="flex gap-6 group items-start">
                <div
                  className={`mt-2 w-4 h-4 rounded-lg ${t.bg} rotate-45 group-hover:rotate-90 transition-transform shadow-lg ${t.shadow} shrink-0`}
                  style={
                    customTheme
                      ? { backgroundColor: customTheme.primaryColor }
                      : {}
                  }
                />
                <div
                  className="text-slate-700 dark:text-slate-100 font-bold text-lg sm:text-xl tracking-tight"
                  style={
                    customTheme
                      ? {
                          color: customTheme.textColor,
                          fontFamily: customTheme.bodyFont,
                        }
                      : {}
                  }
                >
                  <MarkdownRenderer
                    content={item}
                    theme={theme}
                    keywords={keywords}
                    pdfTheme={pdfTheme}
                    customTheme={customTheme}
                    onUpdate={
                      onUpdate
                        ? (newContent) => {
                            const newItems = [...(block.items || [])];
                            newItems[i] = newContent;
                            onUpdate({ ...block, items: newItems });
                          }
                        : undefined
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        );

      case "step":
        return (
          <div className="space-y-12 relative ml-8">
            <div
              className={`absolute left-[23px] top-8 bottom-8 w-1.5 ${t.bg} opacity-10 rounded-full`}
              style={
                customTheme ? { backgroundColor: customTheme.primaryColor } : {}
              }
            />
            {block.items?.map((item, i) => (
              <div key={i} className="flex gap-10 relative group">
                <div
                  className={`w-12 h-12 rounded-2xl ${t.bg} text-white flex items-center justify-center font-black text-xl z-10 shadow-xl ${t.shadow} group-hover:scale-110 transition-transform`}
                  style={
                    customTheme
                      ? { backgroundColor: customTheme.primaryColor }
                      : {}
                  }
                >
                  {i + 1}
                </div>
                <div
                  className="flex-1 pt-1 text-slate-800 dark:text-slate-200 font-black text-xl sm:text-2xl tracking-tighter uppercase italic"
                  style={
                    customTheme
                      ? {
                          color: customTheme.textColor,
                          fontFamily: customTheme.headingFont,
                        }
                      : {}
                  }
                >
                  <MarkdownRenderer
                    content={item}
                    theme={theme}
                    keywords={keywords}
                    pdfTheme={pdfTheme}
                    customTheme={customTheme}
                    onUpdate={
                      onUpdate
                        ? (newContent) => {
                            const newItems = [...(block.items || [])];
                            newItems[i] = newContent;
                            onUpdate({ ...block, items: newItems });
                          }
                        : undefined
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case "vocabulary":
        return (
          <div className="overflow-x-auto custom-scrollbar rounded-[2.5rem]">
            <div
              className={`flex flex-col sm:flex-row gap-8 p-10 bg-white dark:bg-slate-900 border-2 ${t.borderLight} hover:${t.border} shadow-xl group transition-all duration-500 min-w-full w-max sm:w-full`}
              style={
                customTheme
                  ? {
                      backgroundColor: customTheme.backgroundColor,
                      borderColor: customTheme.primaryColor + "44",
                    }
                  : {}
              }
            >
              <div
                className={`sm:w-1/3 border-r-4 ${t.border} pr-8 shrink-0`}
                style={
                  customTheme
                    ? { borderRightColor: customTheme.primaryColor }
                    : {}
                }
              >
                <div
                  className={`text-[10px] font-black ${t.text} uppercase tracking-[0.3em] mb-2`}
                  style={customTheme ? { color: customTheme.primaryColor } : {}}
                >
                  Definition
                </div>
                <div
                  className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight break-words"
                  dir="auto"
                  style={
                    customTheme
                      ? {
                          color: customTheme.textColor,
                          fontFamily: customTheme.headingFont,
                        }
                      : {}
                  }
                >
                  {block.term}
                </div>
              </div>
              <div
                className="flex-1 text-slate-600 dark:text-slate-100 font-bold text-lg sm:text-xl leading-relaxed"
                style={
                  customTheme
                    ? {
                        color: customTheme.textColor,
                        fontFamily: customTheme.bodyFont,
                      }
                    : {}
                }
              >
                <MarkdownRenderer
                  content={block.definition || ""}
                  theme={theme}
                  keywords={keywords}
                  pdfTheme={pdfTheme}
                  customTheme={customTheme}
                  onUpdate={
                    onUpdate
                      ? (newContent) =>
                          onUpdate({ ...block, definition: newContent })
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        );

      case "table":
        return (
          <div
            className={`overflow-x-auto custom-scrollbar rounded-[2.5rem] border-2 ${t.borderLight} shadow-2xl`}
            style={
              customTheme
                ? { borderColor: customTheme.primaryColor + "44" }
                : {}
            }
          >
            <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-[800px]">
              <thead>
                <tr
                  className={`${t.bg} text-white`}
                  style={
                    customTheme
                      ? { backgroundColor: customTheme.primaryColor }
                      : {}
                  }
                >
                  {block.columns?.map((col, i) => (
                    <th
                      key={i}
                      className="p-8 text-xs font-black uppercase tracking-[0.4em] border-r border-white/20 last:border-0"
                      style={
                        customTheme
                          ? { fontFamily: customTheme.headingFont }
                          : {}
                      }
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows?.map((row, i) => (
                  <tr
                    key={i}
                    className={`group hover:${t.bgLight} transition-colors`}
                    style={
                      customTheme
                        ? {
                            backgroundColor:
                              i % 2 === 0
                                ? customTheme.backgroundColor
                                : customTheme.secondaryColor,
                          }
                        : {}
                    }
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="p-8 text-lg font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/50 border-r border-slate-100 dark:border-slate-800/50 last:border-r-0"
                        style={
                          customTheme
                            ? {
                                color: customTheme.textColor,
                                fontFamily: customTheme.bodyFont,
                              }
                            : {}
                        }
                      >
                        <MarkdownRenderer
                          content={cell}
                          theme={theme}
                          keywords={keywords}
                          pdfTheme={pdfTheme}
                          customTheme={customTheme}
                          onUpdate={
                            onUpdate
                              ? (newContent) => {
                                  const newRows = [...(block.rows || [])];
                                  newRows[i] = [...newRows[i]];
                                  newRows[i][j] = newContent;
                                  onUpdate({ ...block, rows: newRows });
                                }
                              : undefined
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "image":
        return (
          <div
            className={`flex flex-col items-${block.imageAlignment === "left" ? "start" : block.imageAlignment === "right" ? "end" : "center"} gap-4 my-8 relative group/image`}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            {isEditMode && block.imageUrl && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl opacity-0 group-hover/image:opacity-100 transition-opacity print:hidden">
                <button 
                  onClick={() => onUpdate?.({ ...block, imageAlignment: 'left' })}
                  className={`p-1.5 rounded-lg transition-colors ${block.imageAlignment === 'left' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onUpdate?.({ ...block, imageAlignment: 'center' })}
                  className={`p-1.5 rounded-lg transition-colors ${block.imageAlignment === 'center' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onUpdate?.({ ...block, imageAlignment: 'right' })}
                  className={`p-1.5 rounded-lg transition-colors ${block.imageAlignment === 'right' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                <div className="flex items-center gap-2 px-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Width</span>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    step="5"
                    value={block.imageWidth || 100}
                    onChange={(e) => onUpdate?.({ ...block, imageWidth: parseInt(e.target.value) })}
                    className="w-24 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[10px] font-bold text-indigo-600 w-8">{block.imageWidth || 100}%</span>
                </div>
              </div>
            )}
            <div
              className={`relative group overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white dark:border-slate-800 cursor-pointer ${!block.imageUrl ? "bg-slate-50 dark:bg-slate-800 border-dashed" : ""}`}
              onClick={(e) => {
                if (isEditMode && onSettings) {
                  e.stopPropagation();
                  onSettings();
                } else {
                  fileInputRef.current?.click();
                }
              }}
              style={
                customTheme
                  ? {
                      width: `${block.imageWidth || 100}%`,
                      borderColor: customTheme.primaryColor,
                    }
                  : { width: `${block.imageWidth || 100}%` }
              }
            >
              {block.imageUrl ? (
                <>
                  <img
                    src={block.imageUrl}
                    alt={block.imageCaption || "Document image"}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {!isEditMode && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-4 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white flex items-center gap-3 scale-90 group-hover:scale-100 transition-all duration-300">
                        <ImageIcon className="w-6 h-6" />
                        <span className="font-bold text-sm uppercase tracking-wider pr-2">
                          Change Photo
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-12 text-slate-400 gap-4 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <p className="font-black uppercase tracking-widest text-xs mb-1 text-slate-500">
                      No Image Set
                    </p>
                    <p className="text-sm font-medium opacity-60">
                      Click to upload a photo
                    </p>
                  </div>
                  <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30">
                    Choose File
                  </button>
                </div>
              )}
              {isEditMode && block.imageUrl ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 print:hidden">
                   <input
                     type="text"
                     placeholder="Add a caption..."
                     value={block.imageCaption || ""}
                     onClick={(e) => e.stopPropagation()}
                     onChange={(e) => onUpdate?.({ ...block, imageCaption: e.target.value })}
                     className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none transition-all"
                   />
                </div>
              ) : block.imageCaption && (
                <div
                  className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-sm font-bold italic"
                  style={
                    customTheme
                      ? {
                          color: customTheme.backgroundColor,
                          fontFamily: customTheme.bodyFont,
                        }
                      : {}
                  }
                >
                  {block.imageCaption}
                </div>
              )}

              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="export-remove absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 z-20"
                  title="Remove Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  },
);


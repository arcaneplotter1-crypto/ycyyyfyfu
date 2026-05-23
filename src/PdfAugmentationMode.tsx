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
import { OverlayPortal, MarkdownRenderer } from "./PdfMode";


export const PdfAugmenter = ({
  onComplete,
  onBack,
}: {
  onComplete: (doc: PdfAugmentedDocument) => void;
  onBack: () => void;
}) => {
  const [step, setStep] = useState(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [extractedText, setExtractedText] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState("");

  const [showPromptConfig, setShowPromptConfig] = useState(false);
  const [promptSyntaxes, setPromptSyntaxes] = useState<Record<string, boolean>>(
    {
      explanation: true,
      photo: true,
      exam: true,
      teacher: true,
      warning: true,
      flashcard: true,
      lab: true,
      mechanism: true,
      root: true,
      highlight: true,
      underline: true,
    },
  );
  const [customAiInstructions, setCustomAiInstructions] = useState("");

  useEffect(() => {
    // Pre-warm the PDF worker to ensure it's loaded and cached
    // This helps with offline usage if the user has visited this screen while online
    const warmWorker = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(0) });
        await loadingTask.promise;
      } catch (e) {
        // Expected to fail with empty data, but triggers worker initialization
      }
    };
    warmWorker();
  }, []);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    setPdfUrl(URL.createObjectURL(file));
    setIsExtracting(true);
    setError("");
    try {
      const text = await extractPdfText(file);
      if (!text || text.trim().length < 10) {
        throw new Error(
          "No readable text found in this PDF. It might be an image-only scan.",
        );
      }
      setExtractedText(text);
      setStep(2);
    } catch (err: any) {
      console.error("PDF Extraction Error:", err);
      setError(err.message || "Failed to extract text from PDF.");
    } finally {
      setIsExtracting(false);
    }
  };

  const extractPdfText = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();

    // Create a loading task with better options for local files
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      disableRange: true,
      disableStream: true,
      // Use local standard fonts
      standardFontDataUrl: "/pdfjs/standard_fonts/",
    });

    // Add a timeout to the promise (30 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "PDF processing timed out. This can happen if the file is very large or if the browser is blocking the PDF worker.",
            ),
          ),
        30000,
      ),
    );

    const pdf = (await Promise.race([
      loadingTask.promise,
      timeoutPromise,
    ])) as any;

    let fullText = "";
    const maxPages = Math.min(pdf.numPages, 100); // Limit to 100 pages for performance

    for (let i = 1; i <= maxPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      } catch (pageErr) {
        console.warn(`Failed to extract text from page ${i}:`, pageErr);
        fullText += `--- Page ${i} ---\n[Error extracting text from this page]\n\n`;
      }
    }

    if (pdf.numPages > 100) {
      fullText += `\n\n--- Note: Only first 100 pages were processed ---`;
    }

    return fullText;
  };

  const generateAndCopyPrompt = () => {
    const activeTypes = Object.entries(promptSyntaxes)
      .filter(([_, v]) => v)
      .map(([k]) => k);
    if (activeTypes.length === 0) {
      alert("Please select at least one syntax to include.");
      return;
    }

    let prompt = `You are a technical document analyst. Your task is to analyze the provided text from a PDF and identify key technical terms, concepts, or entities that would benefit from interactive overlays or static formatting.

### CRITICAL RULES FOR "term":
1. The "term" MUST be an EXACT, CASE-SENSITIVE substring found verbatim in the provided text. 
2. DO NOT add prefixes like "Photo:" or "Description:". 
3. If a term is not found exactly in the text, the highlight will FAIL.

### SYNTAX RULES:
1. Return ONLY a valid JSON array of objects.
2. Each object MUST have:
   - "term": The EXACT word/phrase from text.
   - "occurrenceIndex": The 1-based index (e.g. 1, 2, 3) of the word's occurrence on the page. If a term appears 3 times on the page and you only want to highlight the 3rd one, set this to 3. If you want the 1st one, set it to 1. If omitted, the first occurrence is used.
   - "type": One of ${activeTypes.map((t) => `"${t}"`).join(", ")}.
   - "page": The page number (integer) where this appears.
   - "value": Standard description/title string (required for most types).
`;

    prompt += `\n### OVERLAY TYPES & PROPERTIES:\n`;
    if (promptSyntaxes.explanation)
      prompt += `- **explanation**: Standard definitions.\n`;
    if (promptSyntaxes.photo) prompt += `- **photo**: Image placeholders.\n`;
    if (promptSyntaxes.exam)
      prompt += `- **exam**: Mini-quizzes (requires "questions" array of objects with "question", "type" (only "mcq", "true_false"), "options" (array of strings), "correctAnswer", and "explanation" (brief reason why it's correct)). ALWAYS generate a minimum of 8 questions per exam on this page.\n`;
    if (promptSyntaxes.teacher)
      prompt += `- **teacher**: For major conceptual blocks. Use first 5-8 words of text as term.\n  - Required properties: "teacherScript", "teacherClinicalCase", "teacherMiniQuiz", "teacherMnemonics".\n`;
    if (promptSyntaxes.warning)
      prompt += `- **warning**: Emphasize contraindications, red flags, or severe side effects.\n  - Required properties: "warningError" (the heavily blurred underlying danger or reason).\n`;
    if (promptSyntaxes.flashcard)
      prompt += `- **flashcard**: Active recall testing directly over a specific term.\n  - Required properties: "flashcardFront" (the question), "flashcardBack" (the answer).\n`;
    if (promptSyntaxes.lab)
      prompt += `- **lab**: Highlight physiological or chemical ranges (e.g. Sodium level, HbA1c).\n  - Required properties: "labNormalRange" (e.g. "3.5 - 5.0"), "labUnit" (e.g. "mEq/L"), "labHypo" (disease state if low), "labHyper" (disease state if high).\n`;
    if (promptSyntaxes.mechanism)
      prompt += `- **mechanism**: Explains biological or chemical mechanisms at 3 progressive levels of depth.\n  - Required properties: "mechanismLevels" (object with "level1" [surface], "level2" [medical], "level3" [PhD]).\n`;
    if (promptSyntaxes.root)
      prompt += `- **root**: Breaks down complex medical terms into their etymological roots.\n  - Required properties: "rootSlices" (array of objects with "prefix" [the part], "meaning" [definition], "color" [hex color]).\n`;
    if (promptSyntaxes.highlight)
      prompt += `- **highlight**: Static, non-interactive text highlight. Required properties: "color" (Hex code or valid CSS color, e.g. "rgb(254 240 138 / 0.5)").\n`;
    if (promptSyntaxes.underline)
      prompt += `- **underline**: Static, non-interactive text underline. Required properties: "color" (Hex code or valid CSS color).\n`;

    prompt += `\n### SAMPLE JSON OUTPUT:\n[\n`;

    const samples = [];
    if (promptSyntaxes.explanation)
      samples.push(
        `  {\n    "term": "Neural Network",\n    "type": "explanation",\n    "value": "A computational model...",\n    "page": 1\n  }`,
      );
    if (promptSyntaxes.warning)
      samples.push(
        `  {\n    "term": "Succinylcholine",\n    "type": "warning",\n    "value": "Contraindicated in severe burns",\n    "warningError": "Risk of severe, life-threatening hyperkalemia leading to cardiac arrest.",\n    "page": 2\n  }`,
      );
    if (promptSyntaxes.lab)
      samples.push(
        `  {\n    "term": "Potassium",\n    "type": "lab",\n    "value": "Potassium levels are critical.",\n    "labNormalRange": "3.5 - 5.0",\n    "labUnit": "mEq/L",\n    "labHypo": "Hypokalemia (U waves)",\n    "labHyper": "Hyperkalemia (Peaked T waves)",\n    "page": 3\n  }`,
      );
    if (promptSyntaxes.flashcard)
      samples.push(
        `  {\n    "term": "Virchow's Triad",\n    "type": "flashcard",\n    "value": "Key triad for thrombosis.",\n    "flashcardFront": "What are the 3 components of Virchow's Triad?",\n    "flashcardBack": "1. Stasis\\n2. Hypercoagulability\\n3. Endothelial injury",\n    "page": 4\n  }`,
      );
    if (promptSyntaxes.exam)
      samples.push(
        `  {\n    "term": "Section 1 Review",\n    "type": "exam",\n    "value": "Assessment covering hardware and basic models.",\n    "page": 5,\n    "questions": [{"id": "q1", "type": "mcq", "question": "...", "options": ["A", "B"], "correctAnswer": "A"}]\n  }`,
      );
    if (promptSyntaxes.mechanism)
      samples.push(
        `  {\n    "term": "Aspirin",\n    "type": "mechanism",\n    "value": "Mechanism of Action",\n    "page": 6,\n    "mechanismLevels": {\n      "level1": "Aspirin stops pain and inflammation.",\n      "level2": "Aspirin irreversibly inhibits COX-1 and COX-2 enzymes.",\n      "level3": "Aspirin acetylates a serine residue (Ser530) in the active site..."\n    }\n  }`,
      );
    if (promptSyntaxes.root)
      samples.push(
        `  {\n    "term": "Pheochromocytoma",\n    "type": "root",\n    "value": "Word Breakdown",\n    "page": 7,\n    "rootSlices": [\n      {"prefix": "Pheo", "meaning": "Dusky", "color": "#475569"},\n      {"prefix": "Chromo", "meaning": "Color", "color": "#2563eb"},\n      {"prefix": "Cyt", "meaning": "Cell", "color": "#16a34a"},\n      {"prefix": "Oma", "meaning": "Tumor", "color": "#dc2626"}\n    ]\n  }`,
      );
    if (promptSyntaxes.highlight)
      samples.push(
        `  {\n    "term": "Important Sentence",\n    "occurrenceIndex": 2,\n    "type": "highlight",\n    "value": "Static Highlight",\n    "color": "rgb(253 224 71 / 0.4)",\n    "page": 8\n  }`,
      );
    if (promptSyntaxes.underline)
      samples.push(
        `  {\n    "term": "Key Concept",\n    "occurrenceIndex": 1,\n    "type": "underline",\n    "value": "Static Underline",\n    "color": "#eab308",\n    "page": 9\n  }`,
      );

    if (samples.length === 0) {
      // fallback generic example if only teacher/photo selected
      samples.push(
        `  {\n    "term": "Example",\n    "type": "${activeTypes[0]}",\n    "value": "Generic example",\n    "page": 1\n  }`,
      );
    }

    prompt += samples.join(",\n");
    prompt += `\n]\n\n### TEXT TO ANALYZE:\n${extractedText}`;

    copyToClipboard(prompt);
    setShowPromptConfig(false);
  };

  const handleFinalize = () => {
    let augmentations: any[] = [];
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        augmentations = parsed;
      } else {
        throw new Error("Must be an array");
      }
    } catch (err) {
      let braceLevel = 0;
      let bracketLevel = 0;
      let start = -1;
      let inString = false;
      let escape = false;

      for (let i = 0; i < jsonInput.length; i++) {
        const char = jsonInput[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (char === '\\') {
          escape = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (inString) continue;

        if (char === '{' || char === '[') {
          if (braceLevel === 0 && bracketLevel === 0) start = i;
          if (char === '{') braceLevel++;
          else bracketLevel++;
        } else if (char === '}' || char === ']') {
          if (char === '}') braceLevel--;
          else bracketLevel--;
          
          if (braceLevel === 0 && bracketLevel === 0 && start !== -1) {
            const block = jsonInput.substring(start, i + 1);
            try {
              const parsed = JSON.parse(block);
              if (Array.isArray(parsed)) {
                augmentations.push(...parsed);
              } else {
                augmentations.push(parsed);
              }
            } catch (e) {}
            start = -1;
          }
        }
      }
    }

    if (augmentations.length > 0) {
      onComplete({
        pdfUrl,
        name: pdfFile?.name || "Augmented Document",
        augmentations,
      });
    } else {
      setError(
        "Invalid JSON format. Please ensure it is a valid array of objects.",
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold uppercase text-xs tracking-widest transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full ${step >= s ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">
                Upload Source PDF
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Select the document you want to augment with interactive layers.
              </p>
            </div>
            <label className="block">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-20 hover:border-emerald-500/50 transition-colors flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-600">
                    {isExtracting ? (
                      <RefreshCw className="w-10 h-10 animate-spin" />
                    ) : (
                      <Upload className="w-10 h-10" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-xl font-black uppercase tracking-tight">
                      {isExtracting
                        ? "Extracting Text..."
                        : "Drop PDF here or click to browse"}
                    </div>
                    <div className="text-sm text-slate-400 font-medium uppercase tracking-widest">
                      Standard PDF files only
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </div>
            </label>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">
                Syntax Guide
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Understand how to structure your augmentation data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    Explanation
                  </h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Use this for technical terms that need a text-based deep dive.
                  Supports Markdown.
                </p>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl font-mono text-[10px] text-slate-400">
                  {`{ "type": "explanation", ... }`}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    Photo
                  </h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Use this for visual entities. You provide the term, and the
                  app lets you upload an image.
                </p>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl font-mono text-[10px] text-slate-400">
                  {`{ "type": "photo", ... }`}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    Exam
                  </h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Interactive assessments with MCQ, Essay, and Matching. Placed
                  in top right of slides.
                </p>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl font-mono text-[10px] text-slate-400">
                  {`{ "type": "exam", "questions": [...] }`}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] p-8 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] opacity-50">
                JSON Structure Sample
              </h4>
              <pre className="text-[10px] font-mono leading-relaxed overflow-x-auto custom-scrollbar">
                {`[
  {
    "term": "Neural Network",
    "type": "explanation",
    "value": "A computational model inspired by biological neurons...",
    "page": 1
  },
  {
    "term": "GPU",
    "type": "photo",
    "value": "placeholder",
    "page": 3
  }
]`}
              </pre>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setStep(3)}
                className="px-12 py-5 bg-emerald-600 text-white font-black uppercase text-sm tracking-[0.2em] rounded-2xl hover:scale-105 transition-transform shadow-xl"
              >
                Got it, configure AI
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">
                AI Configuration
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Copy the extracted text and prompt instructions for your
                external AI.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">
                    1. Source Text
                  </h3>
                  <button
                    onClick={() => copyToClipboard(extractedText)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-emerald-500"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-48 overflow-y-auto text-xs font-mono text-slate-400 leading-relaxed custom-scrollbar">
                  {extractedText}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">
                    2. AI Instructions
                  </h3>
                  <button
                    onClick={() => setShowPromptConfig(true)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-indigo-500"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Open the powerful syntax picker to configure your custom
                    prompt and instructions to paste into your AI.
                  </p>

                  <button
                    onClick={() => setShowPromptConfig(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-transform"
                  >
                    <Settings className="w-4 h-4" /> Configure Prompt Generator
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setStep(4)}
                className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-sm tracking-[0.2em] rounded-2xl hover:scale-105 transition-transform shadow-xl"
              >
                I have the JSON, let's proceed
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">
                Inject Overlay Data
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Paste the JSON array generated by the AI below.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2.5rem] blur-xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-1 overflow-hidden">
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setError("");
                  }}
                  placeholder={`[{"term": "...", "type": "explanation", "value": "..."}]`}
                  className="w-full h-64 p-8 bg-transparent border-none focus:ring-0 font-mono text-sm leading-relaxed custom-scrollbar"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/40 rounded-xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-bold">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleFinalize}
                className="px-16 py-6 bg-emerald-600 text-white font-black uppercase text-sm tracking-[0.3em] rounded-[2rem] shadow-[0_8px_0_#064e3b] hover:shadow-[0_4px_0_#064e3b] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px] transition-all"
              >
                Launch Augmented Viewer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPromptConfig && (
          <OverlayPortal>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPromptConfig(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    AI Prompt Configurator
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    Select Syntaxes to Include
                  </p>
                </div>
                <button
                  onClick={() => setShowPromptConfig(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      id: "explanation",
                      label: "Technical Explanations",
                      icon: Info,
                      color: "text-emerald-500",
                      bg: "bg-emerald-50 dark:bg-emerald-900/20",
                      border: "border-emerald-100 dark:border-emerald-800",
                    },
                    {
                      id: "photo",
                      label: "Image Placeholders",
                      icon: ImageIcon,
                      color: "text-indigo-500",
                      bg: "bg-indigo-50 dark:bg-indigo-900/20",
                      border: "border-indigo-100 dark:border-indigo-800",
                    },
                    {
                      id: "exam",
                      label: "Pop Quizzes",
                      icon: Trophy,
                      color: "text-amber-500",
                      bg: "bg-amber-50 dark:bg-amber-900/20",
                      border: "border-amber-100 dark:border-amber-800",
                    },
                    {
                      id: "teacher",
                      label: "Teacher Breakdowns",
                      icon: GraduationCap,
                      color: "text-amber-600",
                      bg: "bg-amber-100/50 dark:bg-amber-900/30",
                      border: "border-amber-200 dark:border-amber-700",
                    },
                    {
                      id: "warning",
                      label: "Clinical Traps (Warning)",
                      icon: AlertTriangle,
                      color: "text-rose-500",
                      bg: "bg-rose-50 dark:bg-rose-900/20",
                      border: "border-rose-100 dark:border-rose-800",
                    },
                    {
                      id: "flashcard",
                      label: "Active Recall Flashcards",
                      icon: Layers,
                      color: "text-violet-500",
                      bg: "bg-violet-50 dark:bg-violet-900/20",
                      border: "border-violet-100 dark:border-violet-800",
                    },
                    {
                      id: "lab",
                      label: "Clinical Lab Values",
                      icon: Activity,
                      color: "text-sky-500",
                      bg: "bg-sky-50 dark:bg-sky-900/20",
                      border: "border-sky-100 dark:border-sky-800",
                    },
                    {
                      id: "mechanism",
                      label: "Mechanism Rabbit Hole",
                      icon: Microscope,
                      color: "text-blue-600",
                      bg: "bg-blue-50 dark:bg-blue-900/20",
                      border: "border-blue-100 dark:border-blue-800",
                    },
                    {
                      id: "root",
                      label: "Etymology Slicer",
                      icon: Scissors,
                      color: "text-fuchsia-500",
                      bg: "bg-fuchsia-50 dark:bg-fuchsia-900/20",
                      border: "border-fuchsia-100 dark:border-fuchsia-800",
                    },
                    {
                      id: "highlight",
                      label: "Static Highlight",
                      icon: Highlighter,
                      color: "text-yellow-500",
                      bg: "bg-yellow-50 dark:bg-yellow-900/20",
                      border: "border-yellow-200 dark:border-yellow-800",
                    },
                    {
                      id: "underline",
                      label: "Static Underline",
                      icon: UnderlineIcon,
                      color: "text-stone-500",
                      bg: "bg-stone-50 dark:bg-stone-900/20",
                      border: "border-stone-200 dark:border-stone-800",
                    },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() =>
                        setPromptSyntaxes((prev) => ({
                          ...prev,
                          [opt.id]: !prev[opt.id],
                        }))
                      }
                      className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        promptSyntaxes[opt.id]
                          ? `${opt.bg} ${opt.border} opacity-100`
                          : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-50 hover:opacity-100 grayscale"
                      }`}
                    >
                      <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-3">
                          <opt.icon className={`w-5 h-5 ${opt.color}`} />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {opt.label}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${promptSyntaxes[opt.id] ? "bg-indigo-500 border-indigo-500" : "border-slate-300"}`}
                        >
                          {promptSyntaxes[opt.id] && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" /> Personal
                      AI Instructions
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      These will be pushed as absolute high-priority inside the
                      prompt.
                    </p>
                  </div>
                  <textarea
                    value={customAiInstructions}
                    onChange={(e) => setCustomAiInstructions(e.target.value)}
                    placeholder="e.g. Focus exclusively on Cardiovascular topics. Only generate flashcards for pharmaceuticals. Do not create any lab values."
                    className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                <button
                  onClick={() => setShowPromptConfig(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateAndCopyPrompt}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform"
                >
                  <Copy className="w-4 h-4" /> Generate & Copy
                </button>
              </div>
            </motion.div>
          </div>
        </OverlayPortal>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ExamModal = ({
  exam,
  onClose,
}: {
  exam: PdfAugmentation;
  onClose: () => void;
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const questions = exam.questions || [];
  const currentQuestion = questions[currentIdx];

  const handleAnswer = (val: any) => {
    if (showFeedback[currentQuestion.id]) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
  };

  const checkAnswer = () => {
    setShowFeedback((prev) => ({ ...prev, [currentQuestion.id]: true }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      const ans = answers[q.id];
      if (q.type === "mcq" && ans === q.correctAnswer) correct++;
      else if (q.type === "true_false" && ans === q.correctAnswer) correct++;
      else if (q.type === "multi_select") {
        const correctSet = new Set(q.correctAnswers || []);
        const ansSet = new Set(ans || []);
        if (
          correctSet.size === ansSet.size &&
          [...correctSet].every((x) => ansSet.has(x))
        )
          correct++;
      }
    });
    return correct;
  };

  if (isFinished) {
    const score = calculateScore();
    return (
      <OverlayPortal>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800"
        >
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">
                Exam Complete!
              </h2>
              <p className="text-slate-500 font-medium">
                You've finished the assessment for this section.
              </p>
            </div>
            <div className="py-8 border-y border-slate-100 dark:border-slate-800">
              <div className="text-5xl font-black text-emerald-500">
                {score} / {questions.length}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                Final Score
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform"
            >
              Back to Document
            </button>
          </div>
        </motion.div>
      </motion.div>
    </OverlayPortal>
  );
}

  return (
    <OverlayPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl text-white">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                Knowledge Check
              </div>
              <div className="text-sm font-black uppercase tracking-tight">
                {exam.term}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Question {currentIdx + 1} of {questions.length}
              </div>
              <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentIdx + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <h3 className="text-xl font-black leading-tight">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="space-y-3">
            {(currentQuestion.type === "mcq" || currentQuestion.type === "true_false") &&
              currentQuestion.options?.map((opt, i) => {
                const isSelected = answers[currentQuestion.id] === opt;
                const isCorrect = opt === currentQuestion.correctAnswer;
                const feedbackActive = showFeedback[currentQuestion.id];

                let borderClass =
                  "border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/30";
                let bgClass = "";
                if (isSelected) {
                  borderClass =
                    "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10";
                }
                if (feedbackActive) {
                  if (isCorrect) {
                    borderClass =
                      "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20";
                  } else if (isSelected) {
                    borderClass =
                      "border-rose-500 bg-rose-50 dark:bg-rose-500/20";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={feedbackActive}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${borderClass} ${bgClass}`}
                  >
                    <span
                      className={`font-bold ${isSelected ? "text-emerald-600 dark:text-emerald-400" : ""} ${feedbackActive && isCorrect ? "text-emerald-600 dark:text-emerald-400" : ""}`}
                    >
                      {opt}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-200 dark:border-slate-700"
                      } ${feedbackActive && isCorrect ? "border-emerald-500 bg-emerald-500" : ""} ${feedbackActive && isSelected && !isCorrect ? "border-rose-500 bg-rose-500" : ""}`}
                    >
                      {isSelected && !feedbackActive && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                      {feedbackActive && isCorrect && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                      {feedbackActive && isSelected && !isCorrect && (
                        <X className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Feedback Explanation */}
          <AnimatePresence>
            {showFeedback[currentQuestion.id] && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm font-medium leading-relaxed"
              >
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                  <p>{currentQuestion.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(currentIdx - 1)}
            className="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-3 h-3" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {!showFeedback[currentQuestion.id] && (
                <button
                  onClick={checkAnswer}
                  disabled={!answers[currentQuestion.id]}
                  className="px-8 py-3 border-2 border-emerald-500 text-emerald-500 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30"
                >
                  Check Answer
                </button>
              )}

            {currentIdx === questions.length - 1 ? (
              <button
                onClick={() => setIsFinished(true)}
                className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center gap-2"
              >
                Finish Exam
                <CheckCircle className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 transition-transform"
              >
                Next Question
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  </OverlayPortal>
);
};

export const PdfAugmentedViewer = ({
  document,
  onBack,
  onSaveAugmentation,
}: {
  document: PdfAugmentedDocument;
  onBack: () => void;
  onSaveAugmentation?: (doc: PdfAugmentedDocument) => void;
}) => {
  const [pageLayout, setPageLayout] = useState<"single" | "continuous">(() => {
    const saved = localStorage.getItem("pdfAugmentPageLayout");
    return (saved as "single" | "continuous") || "continuous";
  });
  const [currentSinglePage, setCurrentSinglePage] = useState(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdf, setPdf] = useState<any>(null);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeGroup, setActiveGroup] = useState<{
    augmentations: PdfAugmentation[];
    currentIndex: number;
  } | null>(null);
  const [activeExam, setActiveExam] = useState<PdfAugmentation | null>(null);
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>(() => {
    const savedString = localStorage.getItem("pdfAugmentOverlaySettings");
    const saved = savedString ? JSON.parse(savedString) : null;
    return {
      showIcons: true,
      lineOpacity: 0.6,
      lineHeight: 2,
      readerMode: false,
      enableTools: false,
      responsiveFit: true,
      ...(saved || {})
    };
  });

  useEffect(() => {
    localStorage.setItem("pdfAugmentPageLayout", pageLayout);
  }, [pageLayout]);

  useEffect(() => {
    localStorage.setItem("pdfAugmentOverlaySettings", JSON.stringify(overlaySettings));
  }, [overlaySettings]);
  const [readingState, setReadingState] = useState<{
    isPlaying: boolean;
    currentPage: number;
    itemIndex: number;
    textItems: any[];
  }>({
    isPlaying: false,
    currentPage: 1,
    itemIndex: -1,
    textItems: [],
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);
  const [teacherTab, setTeacherTab] = useState<
    "script" | "case" | "quiz" | "memory" | "visuals"
  >("script");
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);
  const [isWarningRevealed, setIsWarningRevealed] = useState(false);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [mechanismLevel, setMechanismLevel] = useState(1);

  // Custom Tools State
  const [toolMode, setToolMode] = useState<ToolMode>("none");
  const [penColor, setPenColor] = useState("#2563eb");
  const [penSize, setPenSize] = useState(3);
  const [highlightColor, setHighlightColor] = useState(
    "rgba(250, 204, 21, 0.4)",
  );
  const [drawings, setDrawings] = useState<DrawingPath[]>([]);
  const [highlights, setHighlights] = useState<HighlightInfo[]>([]);
  const [userNotes, setUserNotes] = useState<PdfAugmentation[]>([]);
  const [showDrawings, setShowDrawings] = useState(true);
  const [showHighlights, setShowHighlights] = useState(true);

  // Derive all augmentations
  const allAugmentations = useMemo(() => {
    return [...document.augmentations, ...userNotes];
  }, [document.augmentations, userNotes]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const readingStateRef = useRef(readingState);

  useEffect(() => {
    readingStateRef.current = readingState;
  }, [readingState]);

  useEffect(() => {
    // Auto-fit scale on mount and resize
    const updateScale = () => {
      if (containerRef.current && overlaySettings.responsiveFit) {
        const w = containerRef.current.clientWidth - 32;
        const viewportWidth = 600; // Base typical PDF width at scale 1
        if (w < viewportWidth) {
          setScale(Math.max(0.3, w / viewportWidth));
        } else if (w >= viewportWidth && w < 800) {
          setScale(1.0);
        }
      }
    };

    const timer = setTimeout(updateScale, 100);
    window.addEventListener("resize", updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScale);
    };
  }, [overlaySettings.responsiveFit]);

  useEffect(() => {
    setTeacherTab("script");
    setShowQuizAnswer(false);
    setIsWarningRevealed(false);
    setIsFlashcardFlipped(false);
    setMechanismLevel(1);
    window.speechSynthesis.cancel();
    setIsTeacherSpeaking(false);
  }, [activeGroup?.currentIndex]);

  const stopReading = useCallback(() => {
    window.speechSynthesis.cancel();
    setReadingState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const handleTeacherSpeak = useCallback(
    (text: string) => {
      window.speechSynthesis.cancel();
      if (isTeacherSpeaking) {
        setIsTeacherSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.onstart = () => setIsTeacherSpeaking(true);
      utterance.onend = () => setIsTeacherSpeaking(false);
      utterance.onerror = () => setIsTeacherSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [isTeacherSpeaking],
  );

  const startReading = useCallback(
    async (pageIndex: number, itemIdx: number) => {
      if (!pdf) return;

      let items = readingStateRef.current.textItems;
      let currentPage = pageIndex;
      let currentItemIdx = itemIdx;

      try {
        if (
          items.length === 0 ||
          currentPage !== readingStateRef.current.currentPage
        ) {
          const page = await pdf.getPage(currentPage);
          const textContent = await page.getTextContent();
          const rawItems = textContent.items.filter(
            (item: any) => item.str.trim().length > 0,
          );

          // Group into lines for natural flow
          const sorted = [...rawItems].sort(
            (a, b) =>
              b.transform[5] - a.transform[5] ||
              a.transform[4] - b.transform[4],
          );
          const lines: any[] = [];
          let currentLine: any[] = [];
          let lastY = -1;
          sorted.forEach((item) => {
            if (lastY === -1 || Math.abs(item.transform[5] - lastY) < 5) {
              currentLine.push(item);
            } else {
              lines.push(currentLine);
              currentLine = [item];
            }
            lastY = item.transform[5];
          });
          if (currentLine.length > 0) lines.push(currentLine);

          items = lines
            .map((line) => {
              const rawStr = line.map((i) => i.str).join(" ");
              // Clean text for natural reading (skip hashtags, multiple dots, etc)
              const cleanedStr = rawStr
                .replace(/[#*_~]/g, "")
                .replace(/\.{2,}/g, " ")
                .replace(/\s+/g, " ")
                .trim();

              return {
                str: cleanedStr,
                originalStr: rawStr,
                transform: line[0].transform,
                width: line.reduce((acc, i) => acc + i.width, 0),
                height: Math.max(...line.map((i) => i.height)),
                items: line,
              };
            })
            .filter((l) => l.str.length > 0 && /[a-zA-Z0-9]/.test(l.str));
        }

        if (currentItemIdx >= items.length) {
          if (currentPage < numPages) {
            startReading(currentPage + 1, 0);
          } else {
            stopReading();
          }
          return;
        }

        window.speechSynthesis.cancel();
        const textToRead = items[currentItemIdx].str;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utteranceRef.current = utterance;

        utterance.onend = () => {
          const nextIdx = currentItemIdx + 1;
          if (nextIdx < items.length) {
            startReading(currentPage, nextIdx);
          } else if (currentPage < numPages) {
            startReading(currentPage + 1, 0);
          } else {
            stopReading();
          }
        };

        setReadingState({
          isPlaying: true,
          currentPage,
          itemIndex: currentItemIdx,
          textItems: items,
        });
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Reader Error:", err);
        stopReading();
      }
    },
    [pdf, numPages, stopReading],
  );

  const toggleReader = () => {
    if (readingState.isPlaying) {
      stopReading();
    } else {
      startReading(
        readingState.currentPage,
        Math.max(0, readingState.itemIndex),
      );
    }
  };

  const skipForward = () => {
    const nextIdx = readingState.itemIndex + 1;
    if (nextIdx < readingState.textItems.length) {
      startReading(readingState.currentPage, nextIdx);
    } else if (readingState.currentPage < numPages) {
      startReading(readingState.currentPage + 1, 0);
    }
  };

  const skipBackward = () => {
    const prevIdx = readingState.itemIndex - 1;
    if (prevIdx >= 0) {
      startReading(readingState.currentPage, prevIdx);
    } else if (readingState.currentPage > 1) {
      startReading(readingState.currentPage - 1, 0);
    }
  };

  const skipToNextPage = () => {
    if (readingState.currentPage < numPages) {
      startReading(readingState.currentPage + 1, 0);
    }
  };

  const skipToPrevPage = () => {
    if (readingState.currentPage > 1) {
      startReading(readingState.currentPage - 1, 0);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    let timeoutId: any = null;
    const updateWidth = () => {
      if (containerRef.current) {
        const padding = window.innerWidth < 640 ? 32 : 64;
        setContainerWidth(containerRef.current.offsetWidth - padding);
      }
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateWidth, 150);
    };

    updateWidth();
    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      const loadingTask = pdfjsLib.getDocument(document.pdfUrl);
      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);
      setNumPages(pdfDoc.numPages);
    };
    loadPdf();
  }, [document.pdfUrl]);

  useEffect(() => {
    const autoScale = async () => {
      if (pdf && containerWidth > 0 && overlaySettings.responsiveFit) {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const fitScale = containerWidth / viewport.width;
        setScale(Math.min(fitScale, 1.5));
      }
    };
    autoScale();
  }, [pdf, containerWidth, overlaySettings.responsiveFit]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeGroup) return;
    const currentAug = activeGroup.augmentations[activeGroup.currentIndex];
    if (currentAug.type !== "photo") return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      document.augmentations = document.augmentations.map((aug) =>
        aug.term === currentAug.term && aug.type === "photo"
          ? { ...aug, localImage: dataUrl }
          : aug,
      );

      const newAugs = [...activeGroup.augmentations];
      newAugs[activeGroup.currentIndex] = {
        ...currentAug,
        localImage: dataUrl,
      };
      setActiveGroup({ ...activeGroup, augmentations: newAugs });
    };
    reader.readAsDataURL(file);
  };

  const downloadOfflineVersion = async () => {
    try {
      // Fetch the PDF and convert to base64
      const pdfResponse = await fetch(document.pdfUrl);
      const pdfBlob = await pdfResponse.blob();
      const pdfBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pdfBlob);
      });

      // Convert any blob URLs in augmentations to base64 for offline use
      const processedAugmentations = await Promise.all(
        allAugmentations.map(async (aug) => {
          if (
            aug.type === "photo" &&
            aug.localImage &&
            aug.localImage.startsWith("blob:")
          ) {
            try {
              const res = await fetch(aug.localImage);
              const blob = await res.blob();
              const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              return { ...aug, localImage: base64 };
            } catch (e) {
              console.warn("Failed to convert local image to base64", e);
              return aug;
            }
          }
          return aug;
        }),
      );

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${document.name || "Document"} - Offline Augmented PDF</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs" type="module"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        body { background: #f5f2ed; font-family: 'Montserrat', system-ui, -apple-system, sans-serif; margin: 0; padding: 0; color: #1a1a1a; }
        .pdf-container { display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem 1rem; width: 100%; box-sizing: border-box; }
        .page-wrapper { position: relative; background: white; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border-radius: 12px; overflow: hidden; transform-origin: top center; transition: transform 0.2s; }
        .overlay { position: absolute; pointer-events: auto; cursor: pointer; }
        .overlay-line { position: absolute; bottom: 0; left: 0; right: 0; border-radius: 9999px; }
        .overlay-icon { position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); transition: transform 0.2s; }
        .overlay:hover .overlay-icon { transform: scale(1.1); }
        .modal { display: none; position: fixed; inset: 0; z-index: 100; align-items: center; justify-content: center; padding: 1rem; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px); opacity: 0; transition: opacity 0.3s; }
        .modal.active { display: flex; opacity: 1; }
        .modal-content { background: #fff; width: 100%; max-width: 32rem; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); transform: translateY(20px); transition: transform 0.3s; }
        .modal.active .modal-content { transform: translateY(0); }
        .exam-modal-content { background: #fff; width: 100%; max-width: 42rem; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; max-height: 90vh; }
        canvas { display: block; width: 100%; height: auto; }
        .reader-controls { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 70; background: white; border-radius: 9999px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); border: 1px solid rgba(0,0,0,0.05); padding: 0.5rem; display: none; align-items: center; gap: 0.5rem; }
        .reader-controls.active { display: flex; }
        .highlight { position: absolute; background: rgba(16, 185, 129, 0.2); border: 2px solid rgb(16 185 129); border-radius: 4px; z-index: 10; pointer-events: none; transition: all 0.2s ease; }
        .serif { font-family: 'Cormorant Garamond', serif; }
        
        .markdown-body p { margin-bottom: 0.75em; }
        .markdown-body ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.75em; }
        .markdown-body ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.75em; }
        .markdown-body strong { font-weight: 700; }
        .markdown-body em { font-style: italic; }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; }
        
        /* Error state layer */
        #error-overlay { display: none; margin-top: 4rem; text-align: center; }
    </style>
</head>
<body>
    <div class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div class="min-w-0 flex-1">
            <h1 class="text-sm tracking-[0.1em] uppercase font-bold text-slate-800 truncate w-full">${document.name || "Document"}</h1>
            <div class="text-[10px] font-bold text-amber-600 uppercase tracking-[0.15em] mt-1 flex items-center gap-2 truncate w-full">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span> <span class="truncate">Offline Mode</span>
            </div>
        </div>
        <div class="flex items-center gap-4 shrink-0">
            <div class="flex items-center gap-3">
               <label class="hidden sm:block text-[10px] font-black uppercase tracking-tight text-slate-500">Single Page</label>
               <button id="layout-toggle-btn" onclick="window.togglePageLayout()" class="w-10 h-6 shrink-0 rounded-full transition-colors relative bg-slate-200">
                  <div class="absolute top-[2px] w-5 h-5 bg-white rounded-full transition-all left-[2px] shadow-sm"></div>
               </button>
            </div>
        </div>
    </div>

    <!-- Error message display if render fails -->
    <div id="error-overlay" class="p-8 max-w-md mx-auto">
      <div class="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 shadow-sm">
        <h3 class="font-bold uppercase tracking-widest text-xs mb-2">Render Error</h3>
        <p class="text-sm">We couldn't load the offline PDF viewer. Please ensure you are viewing this file in a modern browser.</p>
        <p id="error-details" class="text-xs opacity-70 mt-4 font-mono"></p>
      </div>
    </div>

    <div id="pdf-viewer" class="pdf-container">
       <div class="animate-pulse flex flex-col items-center justify-center p-20 text-slate-400 gap-4">
          <div class="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
          <p class="uppercase tracking-widest text-xs font-bold">Loading Document</p>
       </div>
    </div>

    <div id="reader-controls" class="reader-controls">
        <button onclick="window.skipToPrevPage()" title="Previous Page" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-lg">⏮</button>
        <button onclick="window.skipBackward()" title="Previous Sentence" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-lg">⏪</button>
        <button id="play-pause" onclick="window.toggleReader()" class="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform text-xl">▶</button>
        <button onclick="window.skipForward()" title="Next Sentence" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-lg">⏩</button>
        <button onclick="window.skipToNextPage()" title="Next Page" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-lg">⏭</button>
        <div class="h-8 w-[1px] bg-slate-100 mx-2"></div>
        <div class="pr-6 pl-2">
            <div class="text-[8px] font-black uppercase tracking-widest text-slate-400">Reading Page</div>
            <div id="reader-page-info" class="text-xs font-black text-emerald-500">1 / 1</div>
        </div>
    </div>

    <!-- Single Page Fixed Paginator for Mobile & PC -->
    <div id="single-page-pagination" style="display: none;" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[65] flex items-center bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-slate-200 p-2 gap-2 sm:gap-4">
        <button id="btn-prev-page" onclick="window.prevSinglePage()" class="p-3 hover:bg-slate-100 rounded-full transition-colors font-black text-xs uppercase tracking-widest flex items-center gap-2">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
           <span class="hidden sm:inline">Prev</span>
        </button>
        <div class="text-[11px] font-black px-2 text-slate-800 tracking-[0.1em]"><span id="single-page-info">1 / 1</span></div>
        <button id="btn-next-page" onclick="window.nextSinglePage()" class="p-3 hover:bg-slate-100 rounded-full transition-colors font-black text-xs uppercase tracking-widest flex items-center gap-2">
           <span class="hidden sm:inline">Next</span>
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
    </div>

    <div id="group-modal" class="modal" onclick="closeModal('group-modal')">
        <div class="modal-content flex flex-col max-h-[90vh]" onclick="event.stopPropagation()">
            <div class="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div id="group-type-label" class="text-[10px] font-bold uppercase tracking-[0.2em]">Technical Explanation</div>
                <button onclick="closeModal('group-modal')" class="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-800">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            <div class="p-6 sm:p-8 space-y-4 overflow-y-auto flex-1 bg-white">
                <h2 id="group-term" class="serif text-3xl font-light tracking-tight leading-tight text-slate-900"></h2>
                <div id="group-content-area" class="text-slate-600 text-[15px] leading-relaxed pb-8"></div>
            </div>
        </div>
    </div>

    <div id="exam-modal" class="modal" onclick="closeModal('exam-modal')">
        <div class="exam-modal-content" onclick="event.stopPropagation()">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                    </div>
                    <div>
                        <div class="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Knowledge Check</div>
                        <div id="exam-title" class="text-sm font-bold text-slate-800"></div>
                    </div>
                </div>
                <button onclick="closeModal('exam-modal')" class="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-800">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            <div id="exam-body" class="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30"></div>
            <div id="exam-footer" class="p-6 border-t border-slate-100 flex items-center justify-between bg-white"></div>
        </div>
    </div>

    <script type="module">
        import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

        const pdfData = "${pdfBase64}";
        const augmentations = ${JSON.stringify(processedAugmentations)};
        const settings = ${JSON.stringify(overlaySettings)};

        let readingState = { isPlaying: false, currentPage: 1, itemIndex: -1, textItems: [] };
        let currentHighlightEl = null;
        let pdf = null;
        let wrappers = [];
        window.pageLayout = 'continuous';
        window.currentSinglePage = 1;

        const transform = (m1, m2) => [
            m1[0] * m2[0] + m1[2] * m2[1],
            m1[1] * m2[0] + m1[3] * m2[1],
            m1[0] * m2[2] + m1[2] * m2[3],
            m1[1] * m2[2] + m1[3] * m2[3],
            m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
            m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
        ];

        window.closeModal = (id) => document.getElementById(id).classList.remove('active');

        window.openAugmentation = (aug) => {
            document.getElementById('group-term').innerText = aug.term;
            const typeLabel = document.getElementById('group-type-label');
            const contentArea = document.getElementById('group-content-area');
            
            const typeInfo = {
                'explanation': { label: 'Technical Explanation', color: 'text-emerald-500' },
                'teacher': { label: 'Teacher Breakdown', color: 'text-amber-500' },
                'note': { label: 'Personal Note', color: 'text-teal-500' },
                'warning': { label: 'Red Flag / Clinical Trap', color: 'text-rose-500' },
                'flashcard': { label: 'Active Recall Flashcard', color: 'text-violet-500' },
                'lab': { label: 'Clinical Lab Value', color: 'text-sky-500' },
                'mechanism': { label: 'Mechanism Rabbit Hole', color: 'text-blue-600' },
                'root': { label: 'Etymology Slicer', color: 'text-fuchsia-500' },
                'photo': { label: 'Media Attachment', color: 'text-indigo-500' }
            };
            
            const info = typeInfo[aug.type] || { label: 'Augmentation', color: 'text-slate-500' };
            typeLabel.className = \`text-[10px] font-bold uppercase tracking-[0.2em] \${info.color}\`;
            typeLabel.innerText = info.label;
            
            let html = '';
            
            if (aug.type === 'photo') {
                const imgSrc = aug.localImage || '';
                html = \`
                    <div class="aspect-video bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
                        \${imgSrc ? \`<img src="\${imgSrc}" class="w-full h-full object-cover">\` : \`
                        <div class="text-center text-slate-400 text-xs font-bold uppercase tracking-widest flex flex-col items-center gap-2">
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                           No image attached
                        </div>
                        \`}
                    </div>
                \`;
            } else if (aug.type === 'teacher') {
                const mnemonics = Array.isArray(aug.teacherMnemonics) ? aug.teacherMnemonics : (typeof aug.teacherMnemonics === 'string' ? [aug.teacherMnemonics] : []);
                html = \`
                    <div class="space-y-4">
                        <div class="markdown-body">\${marked.parse(aug.teacherScript || aug.value || '')}</div>
                        \${aug.teacherClinicalCase ? \`<div class="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-4"><h4 class="font-bold mb-2 uppercase text-[10px] tracking-widest text-slate-500">Clinical Case</h4><div class="markdown-body">\${marked.parse(aug.teacherClinicalCase)}</div></div>\` : ''}
                        \${mnemonics.length ? \`
                            <div class="mt-4"><h4 class="font-bold mb-2 uppercase text-[10px] tracking-widest text-amber-500">Mnemonics / Memory Hooks</h4>
                            <div class="flex flex-col gap-2">
                                \${mnemonics.map(m => \`<div class="p-3 bg-amber-50 rounded-lg text-amber-900 italic font-medium">"\${m}"</div>\`).join('')}
                            </div></div>
                        \` : ''}
                    </div>
                \`;
            } else if (aug.type === 'flashcard') {
                html = \`
                    <div class="p-8 bg-slate-100 rounded-2xl cursor-pointer text-center group transition-all hover:bg-slate-200" onclick="this.innerHTML = this.innerHTML.includes('Click to reveal') ? \${JSON.stringify('<div class=\\'text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4\\'>Answer</div><div class=\\'markdown-body text-lg\\'>' + marked.parse(aug.flashcardBack || '').replace(/\\n/g, '<br/>') + '</div>').replace(/"/g, '&quot;')} : \${JSON.stringify('<div class=\\'text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4\\'>Question</div><div class=\\'markdown-body text-lg\\'>' + marked.parse(aug.flashcardFront || '').replace(/\\n/g, '<br/>') + '</div><div class=\\'text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2 group-hover:text-slate-500\\'><svg width=\\'16\\' height=\\'16\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><path d=\\'m21 16-4 4-4-4\\'/><path d=\\'M17 20V4\\'/><path d=\\'m3 8 4-4 4 4\\'/><path d=\\'M7 4v16\\'/></svg> Click to flip</div>').replace(/"/g, '&quot;')}">
                        <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Question</div>
                        <div class="markdown-body text-lg">\${marked.parse(aug.flashcardFront || '')}</div>
                        <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center mt-8 gap-2 group-hover:text-slate-500">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg> Click to flip
                        </div>
                    </div>
                \`;
            } else if (aug.type === 'lab') {
                html = \`
                    <div class="markdown-body">\${marked.parse(aug.value || '')}</div>
                    <div class="mt-6 grid grid-cols-2 gap-4">
                       <div class="p-4 bg-sky-50 rounded-xl"><div class="text-[10px] text-sky-600 font-bold uppercase tracking-widest mb-1">Normal Range</div><div class="font-medium">\${aug.labNormalRange || 'N/A'} \${aug.labUnit || ''}</div></div>
                       \${aug.labHypo ? \`<div class="p-4 bg-rose-50 rounded-xl"><div class="text-[10px] text-rose-600 font-bold uppercase tracking-widest mb-1">Low (Hypo)</div><div class="font-medium">\${aug.labHypo}</div></div>\` : ''}
                       \${aug.labHyper ? \`<div class="p-4 bg-rose-50 rounded-xl"><div class="text-[10px] text-rose-600 font-bold uppercase tracking-widest mb-1">High (Hyper)</div><div class="font-medium">\${aug.labHyper}</div></div>\` : ''}
                    </div>
                \`;
            } else if (aug.type === 'mechanism') {
                html = \`
                    <div class="p-5 bg-slate-50 border-l-4 border-blue-500 rounded-r-xl mb-4 shadow-sm">
                       <div class="font-black tracking-widest uppercase text-[10px] text-blue-500 mb-2">Level 1 (Fundamental)</div>
                       <div class="markdown-body">\${marked.parse(aug.mechanismLevels?.level1 || aug.value || '')}</div>
                    </div>
                    \${aug.mechanismLevels?.level2 ? \`
                    <div class="p-5 bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl mb-4 shadow-sm">
                       <div class="font-black tracking-widest uppercase text-[10px] text-indigo-500 mb-2">Level 2 (Advanced)</div>
                       <div class="markdown-body">\${marked.parse(aug.mechanismLevels.level2)}</div>
                    </div>\` : ''}
                    \${aug.mechanismLevels?.level3 ? \`
                    <div class="p-5 bg-slate-50 border-l-4 border-purple-500 rounded-r-xl mb-4 shadow-sm">
                       <div class="font-black tracking-widest uppercase text-[10px] text-purple-500 mb-2">Level 3 (Expert)</div>
                       <div class="markdown-body">\${marked.parse(aug.mechanismLevels.level3)}</div>
                    </div>\` : ''}
                \`;
            } else if (aug.type === 'root') {
                html = \`
                    <div class="markdown-body mb-6">\${marked.parse(aug.value || '')}</div>
                    <div class="flex flex-wrap gap-2">
                        \${(aug.rootSlices || []).map(s => \`
                            <div class="px-4 py-2 \${s.color || 'bg-slate-100'} rounded-lg text-sm border shadow-sm">
                                <span class="font-bold">\${s.prefix}</span> <span class="opacity-50 mx-1">=</span> \${s.meaning}
                            </div>
                        \`).join('')}
                    </div>
                \`;
            } else {
                html = \`<div class="markdown-body">\${marked.parse(aug.value || '')}</div>\`;
            }
            
            contentArea.innerHTML = html;
            document.getElementById('group-modal').classList.add('active');
        };

        window.toggleReader = () => {
            if (readingState.isPlaying) window.stopReading();
            else window.startReading(readingState.currentPage, Math.max(0, readingState.itemIndex));
        };

        window.stopReading = () => {
            window.speechSynthesis.cancel();
            readingState.isPlaying = false;
            document.getElementById('play-pause').innerText = '▶';
            if (currentHighlightEl) currentHighlightEl.remove();
        };

        window.startReading = async (pageIdx, itemIdx) => {
            if (pageIdx > pdf.numPages) {
                window.stopReading();
                return;
            }

            if (readingState.currentPage !== pageIdx || readingState.textItems.length === 0) {
                const page = await pdf.getPage(pageIdx);
                const textContent = await page.getTextContent();
                const rawItems = textContent.items.filter(it => it.str.trim().length > 0);
                
                // Group into lines for natural flow
                const sorted = [...rawItems].sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);
                const lines = [];
                let currentLine = [];
                let lastY = -1;
                sorted.forEach(item => {
                    if (lastY === -1 || Math.abs(item.transform[5] - lastY) < 5) {
                        currentLine.push(item);
                    } else {
                        lines.push(currentLine);
                        currentLine = [item];
                    }
                    lastY = item.transform[5];
                });
                if (currentLine.length > 0) lines.push(currentLine);
                
                readingState.textItems = lines.map(line => {
                    const rawStr = line.map(i => i.str).join(' ');
                    const cleanedStr = rawStr
                        .replace(/[#*_~]/g, '')
                        .replace(/\.{2,}/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                        
                    return {
                        str: cleanedStr,
                        transform: line[0].transform,
                        width: line.reduce((acc, i) => acc + i.width, 0),
                        height: Math.max(...line.map(i => i.height))
                    };
                }).filter(l => l.str.length > 0 && /[a-zA-Z0-9]/.test(l.str));
                
                readingState.currentPage = pageIdx;
            }

            if (itemIdx < 0) {
                if (pageIdx > 1) window.startReading(pageIdx - 1, 0);
                else window.stopReading();
                return;
            }

            if (itemIdx >= readingState.textItems.length) {
                window.startReading(pageIdx + 1, 0);
                return;
            }

            window.speechSynthesis.cancel();
            readingState.isPlaying = true;
            readingState.itemIndex = itemIdx;
            document.getElementById('play-pause').innerText = '⏸';
            document.getElementById('reader-page-info').innerText = \`\${pageIdx} / \${pdf.numPages}\`;

            const item = readingState.textItems[itemIdx];
            const utterance = new SpeechSynthesisUtterance(item.str);
            utterance.onend = () => window.startReading(pageIdx, itemIdx + 1);
            
            const wrapper = wrappers[pageIdx - 1].wrapper;
            const page = await pdf.getPage(pageIdx);
            const viewport = page.getViewport({ scale: 1 }); // Use scale 1 for coordinate mapping
            const tx = transform(viewport.transform, item.transform);
            
            if (currentHighlightEl) currentHighlightEl.remove();
            currentHighlightEl = document.createElement('div');
            currentHighlightEl.className = 'highlight';
            currentHighlightEl.style.left = tx[4] + 'px';
            currentHighlightEl.style.top = (tx[5] - item.height + 2) + 'px';
            currentHighlightEl.style.width = item.width + 'px';
            currentHighlightEl.style.height = item.height + 'px';
            wrapper.appendChild(currentHighlightEl);
            
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
            window.speechSynthesis.speak(utterance);
        };

        window.skipForward = () => window.startReading(readingState.currentPage, readingState.itemIndex + 1);
        window.skipBackward = () => window.startReading(readingState.currentPage, readingState.itemIndex - 1);
        window.skipToNextPage = () => window.startReading(readingState.currentPage + 1, 0);
        window.skipToPrevPage = () => window.startReading(readingState.currentPage - 1, 0);

        let currentExam = null;
        let examAnswers = {};
        let examFeedback = {};
        let examIdx = 0;

        window.openExam = (aug) => {
            currentExam = aug;
            examAnswers = {};
            examFeedback = {};
            examIdx = 0;
            document.getElementById('exam-title').innerText = aug.term;
            renderExamQuestion();
            document.getElementById('exam-modal').classList.add('active');
        };

        function renderExamQuestion() {
            const body = document.getElementById('exam-body');
            const footer = document.getElementById('exam-footer');
            const q = currentExam.questions[examIdx];
            const feedbackActive = examFeedback[q.id];
            
            body.innerHTML = \`
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div class="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Question \${examIdx + 1} of \${currentExam.questions.length}</div>
                        <div class="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-amber-500 rounded-full transition-all duration-300" style="width: \${((examIdx + 1) / currentExam.questions.length) * 100}%"></div>
                        </div>
                    </div>
                    <h3 class="serif text-2xl font-light leading-tight text-slate-900">\${q.question}</h3>
                </div>
                <div id="question-options" class="space-y-3"></div>
            \`;

            const optionsContainer = document.getElementById('question-options');
            if (q.type === 'mcq') {
                q.options.forEach(opt => {
                    const isSelected = examAnswers[q.id] === opt;
                    const isCorrect = opt === q.correctAnswer;
                    
                    let borderClass = 'border-slate-200 hover:border-amber-300 bg-white';
                    if (isSelected) borderClass = 'border-amber-500 bg-amber-50/50';
                    if (feedbackActive) {
                        if (isCorrect) borderClass = 'border-emerald-500 bg-emerald-50/50';
                        else if (isSelected) borderClass = 'border-rose-500 bg-rose-50/50';
                    }

                    const btn = document.createElement('button');
                    btn.className = \`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group \${borderClass}\`;
                    btn.disabled = feedbackActive;
                    btn.innerHTML = \`
                        <span class="text-[15px] \${isSelected || (feedbackActive && isCorrect) ? 'font-medium text-slate-900' : 'text-slate-600'}">\${opt}</span>
                        <div class="w-5 h-5 rounded-full border flex items-center justify-center \${isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-200'} \${feedbackActive && isCorrect ? 'border-emerald-500 bg-emerald-500' : ''} \${feedbackActive && isSelected && !isCorrect ? 'border-rose-500 bg-rose-500' : ''} text-white font-bold text-[10px]">
                            \${feedbackActive && isCorrect ? '✓' : (feedbackActive && isSelected && !isCorrect ? '✕' : '')}
                        </div>
                    \`;
                    btn.onclick = () => {
                        examAnswers[q.id] = opt;
                        renderExamQuestion();
                    };
                    optionsContainer.appendChild(btn);
                });
            } else if (q.type === 'essay') {
                const area = document.createElement('textarea');
                area.className = 'w-full h-40 p-5 rounded-xl border border-slate-200 bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-[15px] resize-none';
                area.placeholder = 'Type your answer here...';
                area.value = examAnswers[q.id] || '';
                area.disabled = !!feedbackActive;
                area.oninput = (e) => examAnswers[q.id] = e.target.value;
                optionsContainer.appendChild(area);
            } else if (q.type === 'multi_essay') {
                (q.subQuestions || []).forEach(sq => {
                    const block = document.createElement('div');
                    block.className = 'flex flex-col gap-3 mt-4';
                    
                    const label = document.createElement('label');
                    label.className = 'text-[14px] font-bold text-slate-800';
                    label.textContent = sq.question;
                    block.appendChild(label);
                    
                    const area = document.createElement('textarea');
                    area.className = 'w-full h-32 p-5 rounded-xl border border-slate-200 bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-[15px] resize-y';
                    area.placeholder = 'Type your answer here...';
                    if (!examAnswers[q.id]) examAnswers[q.id] = {};
                    area.value = examAnswers[q.id][sq.id] || '';
                    area.disabled = !!feedbackActive;
                    area.oninput = (e) => {
                       if (!examAnswers[q.id]) examAnswers[q.id] = {};
                       examAnswers[q.id][sq.id] = e.target.value;
                    };
                    block.appendChild(area);
                    
                    if (feedbackActive && sq.correctAnswer) {
                       const fb = document.createElement('div');
                       fb.className = 'p-4 rounded-xl border-l-4 border-amber-500 bg-amber-50 mt-2 text-[14px] italic text-amber-900';
                       fb.innerHTML = '<strong>Suggested Answer:</strong><br/>' + sq.correctAnswer;
                       block.appendChild(fb);
                    }
                    optionsContainer.appendChild(block);
                });
            } else if (q.type === 'matching') {
                q.matchingPairs.forEach(pair => {
                    const currentAns = examAnswers[q.id]?.[pair.term];
                    const isCorrect = currentAns === pair.definition;
                    const div = document.createElement('div');
                    div.className = 'flex flex-col gap-2 relative';
                    div.innerHTML = \`
                        <div class="p-4 rounded-xl border flex items-center justify-between text-[15px] \${feedbackActive ? (isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800') : 'bg-white border-slate-200'}">
                           <span class="font-medium">\${pair.term}</span>
                           \${feedbackActive ? (isCorrect ? '<span class="text-emerald-500 font-bold text-xs">✓ Correct</span>' : '<span class="text-rose-500 font-bold text-xs">✕ Incorrect</span>') : ''}
                        </div>
                        <select class="p-4 rounded-xl border outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[14px] bg-white \${feedbackActive ? (isCorrect ? 'border-emerald-200' : 'border-rose-200') : 'border-slate-200'}" \${feedbackActive ? 'disabled' : ''}>
                            <option value="">Select match...</option>
                            \${q.matchingPairs.map(p => \`<option value="\${p.definition.replace(/"/g, '&quot;')}" \${currentAns === p.definition ? 'selected' : ''}>\${p.definition}</option>\`).join('')}
                            \${(q.matchingDistractors || []).map(d => \`<option value="\${d.replace(/"/g, '&quot;')}" \${currentAns === d ? 'selected' : ''}>\${d}</option>\`).join('')}
                        </select>
                    \`;
                    div.querySelector('select').onchange = (e) => {
                        if (!examAnswers[q.id]) examAnswers[q.id] = {};
                        examAnswers[q.id][pair.term] = e.target.value;
                    };
                    optionsContainer.appendChild(div);
                });
            }

            footer.innerHTML = \`
                <div class="flex items-center justify-between w-full">
                    <button onclick="window.prevQuestion()" \${examIdx === 0 ? 'disabled' : ''} class="px-5 py-2.5 rounded-full font-bold uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-30 border border-transparent disabled:hover:bg-transparent">
                        ← Previous
                    </button>
                    <div class="flex items-center gap-3">
                        \${!feedbackActive && q.type !== 'essay' ? \`<button onclick="window.checkExamAnswer()" \${!examAnswers[q.id] ? 'disabled' : ''} class="px-6 py-2.5 border border-amber-500 text-amber-600 rounded-full font-bold uppercase tracking-[0.1em] text-[10px] hover:bg-amber-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent">Check Answer</button>\` : ''}
                        \${examIdx === currentExam.questions.length - 1 
                            ? \`<button onclick="window.finishExam()" class="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold uppercase tracking-[0.1em] text-[10px] shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-2">Finish Exam ✓</button>\`
                            : \`<button onclick="window.nextQuestion()" class="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 hover:bg-slate-800 transition-colors">Next Question →</button>\`
                        }
                    </div>
                </div>
            \`;
        }

        window.checkExamAnswer = () => {
            const q = currentExam.questions[examIdx];
            examFeedback[q.id] = true;
            renderExamQuestion();
        };

        const applyLayout = () => {
            const paginator = document.getElementById('single-page-pagination');
            if (window.pageLayout === 'single') {
                paginator.style.display = 'flex';
                document.getElementById('single-page-info').innerText = \`\${window.currentSinglePage} / \${pdf.numPages}\`;
                wrappers.forEach((item, index) => {
                    item.wrapper.style.display = (index + 1 === window.currentSinglePage) ? 'block' : 'none';
                });
            } else {
                paginator.style.display = 'none';
                wrappers.forEach(item => item.wrapper.style.display = 'block');
            }
            // Trigger resize to update scaling for newly displayed elements
            window.dispatchEvent(new Event('resize'));
        };

        window.togglePageLayout = () => {
            window.pageLayout = window.pageLayout === 'continuous' ? 'single' : 'continuous';
            const btn = document.getElementById('layout-toggle-btn');
            const thumb = btn.querySelector('div');
            
            if (window.pageLayout === 'single') {
                btn.className = 'w-10 h-6 rounded-full transition-colors relative bg-amber-500';
                thumb.className = 'absolute top-[2px] w-5 h-5 bg-white rounded-full transition-all left-[22px] shadow-sm';
            } else {
                btn.className = 'w-10 h-6 rounded-full transition-colors relative bg-slate-200';
                thumb.className = 'absolute top-[2px] w-5 h-5 bg-white rounded-full transition-all left-[2px] shadow-sm';
            }
            if (pdf && pdf.numPages > 0) {
                 applyLayout();
            }
        };

        window.prevSinglePage = () => {
             if (window.currentSinglePage > 1) {
                 window.currentSinglePage--;
                 applyLayout();
             }
        };

        window.nextSinglePage = () => {
             if (pdf && window.currentSinglePage < pdf.numPages) {
                 window.currentSinglePage++;
                 applyLayout();
             }
        };

        window.nextQuestion = () => { examIdx++; renderExamQuestion(); };
        window.prevQuestion = () => { examIdx--; renderExamQuestion(); };
        window.finishExam = () => {
            let score = 0;
            currentExam.questions.forEach(q => {
                const ans = examAnswers[q.id];
                if (q.type === 'mcq' && ans === q.correctAnswer) score++;
                else if (q.type === 'matching') {
                    const isCorrect = q.matchingPairs.every(p => ans?.[p.term] === p.definition);
                    if (isCorrect) score++;
                }
            });

            const body = document.getElementById('exam-body');
            const footer = document.getElementById('exam-footer');
            body.innerHTML = \`
                <div class="p-8 text-center space-y-6">
                    <div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                    </div>
                    <div class="space-y-2">
                        <h2 class="serif text-3xl font-light">Exam Complete!</h2>
                        <p class="text-slate-500 text-[15px]">You've finished the assessment for this section.</p>
                    </div>
                    <div class="py-8 border-y border-slate-100">
                        <div class="text-5xl font-light text-slate-900">\${score} <span class="text-2xl text-slate-400">/ \${currentExam.questions.length}</span></div>
                        <div class="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-3">Final Score</div>
                    </div>
                </div>
            \`;
            footer.innerHTML = \`<button onclick="closeModal('exam-modal')" class="w-full py-4 bg-slate-900 text-white rounded-full font-bold uppercase tracking-[0.1em] text-[11px] hover:bg-slate-800 transition-colors">Back to Document</button>\`;
        };

        async function init() {
            try {
                const loadingTask = pdfjsLib.getDocument(pdfData);
                pdf = await loadingTask.promise;
                const viewer = document.getElementById('pdf-viewer');
                
                if (settings.readerMode) {
                    document.getElementById('reader-controls').classList.add('active');
                    document.getElementById('reader-page-info').innerText = \`1 / \${pdf.numPages}\`;
                }

                const updateScaling = () => {
                    const containerWidth = viewer.clientWidth - 32;
                    wrappers.forEach(item => {
                        const { wrapper, originalWidth, originalHeight } = item;
                        const scale = containerWidth / originalWidth;
                        const finalScale = Math.min(scale, 1.5);
                        
                        wrapper.style.transform = \`scale(\${finalScale})\`;
                        wrapper.style.marginBottom = \`\${(originalHeight * (finalScale - 1)) + 32}px\`;
                    });
                };

                const renderPages = async () => {
                    viewer.innerHTML = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 2 });
                        const originalWidth = viewport.width / 2;
                        const originalHeight = viewport.height / 2;
                        
                        const wrapper = document.createElement('div');
                        wrapper.className = 'page-wrapper';
                        wrapper.style.width = originalWidth + 'px';
                        wrapper.style.height = originalHeight + 'px';

                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        wrapper.appendChild(canvas);

                        // Render in background
                        await page.render({ canvasContext: context, viewport: viewport }).promise;

                        const textContent = await page.getTextContent();
                        
                        const augOccurrenceCounts = new Map();

                        textContent.items.forEach(item => {
                            augmentations.forEach(aug => {
                                if (aug.page !== undefined && aug.page !== i) return;
                                const term = aug.term.toLowerCase();
                                const str = item.str.toLowerCase();
                                let startIndex = 0;

                                while ((startIndex = str.indexOf(term, startIndex)) !== -1) {
                                    const currentCount = (augOccurrenceCounts.get(aug) || 0) + 1;
                                    augOccurrenceCounts.set(aug, currentCount);

                                    if (aug.occurrenceIndex && aug.occurrenceIndex !== currentCount) {
                                        startIndex += term.length;
                                        continue;
                                    }

                                    const tx = item.transform;
                                    const charWidth = item.width / item.str.length;
                                    const leftOffset = startIndex * charWidth;
                                    const termWidth = aug.term.length * charWidth;

                                    if (aug.type === 'exam') {
                                        startIndex += term.length;
                                        continue;
                                    }

                                    const isStatic = aug.type === 'highlight' || aug.type === 'underline';
                                    const overlay = document.createElement('div');
                                    overlay.className = isStatic ? 'overlay pointer-events-none' : 'overlay cursor-pointer';
                                    overlay.style.left = (tx[4] + leftOffset) + 'px';
                                    overlay.style.top = (page.view[3] - tx[5] - item.height + 2) + 'px';
                                    overlay.style.width = termWidth + 'px';
                                    overlay.style.height = item.height + 'px';
                                    overlay.style.zIndex = isStatic ? '10' : '20';

                                    if (aug.type === 'highlight') {
                                        overlay.style.backgroundColor = aug.color || 'rgb(253 224 71 / 0.4)';
                                        overlay.style.mixBlendMode = 'multiply';
                                    } else if (aug.type === 'underline') {
                                        overlay.style.borderBottom = \`3px solid \${aug.color || '#a8a29e'}\`;
                                    } else {
                                        const typeColors = {
                                            'explanation': 'rgb(16 185 129)',
                                            'teacher': 'rgb(245 158 11)',
                                            'note': 'rgb(20 184 166)',
                                            'warning': 'rgb(244 63 94)',
                                            'flashcard': 'rgb(139 92 246)',
                                            'lab': 'rgb(14 165 233)',
                                            'mechanism': 'rgb(37 99 235)',
                                            'root': 'rgb(217 70 239)',
                                            'photo': 'rgb(99 102 241)',
                                            'exam': 'rgb(245 158 11)'
                                        };
                                        const augColor = typeColors[aug.type] || 'rgb(99 102 241)';

                                        const line = document.createElement('div');
                                        line.className = 'overlay-line';
                                        line.style.height = (settings.lineHeight || 2) + 'px';
                                        line.style.background = augColor;
                                        line.style.opacity = settings.lineOpacity || 0.4;
                                        overlay.appendChild(line);

                                        if (settings.showIcons !== false) {
                                            const icon = document.createElement('div');
                                            icon.className = 'overlay-icon';
                                            icon.style.background = augColor;
                                            
                                            let svgIcon = '';
                                            if (aug.type === 'explanation') svgIcon = '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>';
                                            else if (aug.type === 'teacher') svgIcon = '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>';
                                            else if (aug.type === 'note') svgIcon = '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>';
                                            else if (aug.type === 'warning') svgIcon = '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>';
                                            else if (aug.type === 'flashcard') svgIcon = '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>';
                                            else if (aug.type === 'lab') svgIcon = '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>';
                                            else if (aug.type === 'mechanism') svgIcon = '<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>';
                                            else if (aug.type === 'root') svgIcon = '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>';
                                            else svgIcon = '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>';
                                            
                                            icon.innerHTML = \`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\${svgIcon}</svg>\`;
                                            overlay.appendChild(icon);
                                        }

                                        overlay.onclick = () => window.openAugmentation(aug);
                                    }
                                    wrapper.appendChild(overlay);

                                    startIndex += term.length;
                                }
                            });
                        });

                        // Add Exam Button if present
                        const pageExam = augmentations.find(aug => aug.type === 'exam' && aug.page === i);
                        if (pageExam) {
                            const examBtn = document.createElement('button');
                            examBtn.className = 'absolute top-4 right-4 z-20 bg-amber-500 text-white px-4 py-2 rounded-full font-bold uppercase tracking-[0.1em] text-[10px] shadow-lg shadow-amber-500/20 transition-transform hover:scale-105 flex items-center gap-2 pointer-events-auto';
                            examBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> Take Exam';
                            examBtn.onclick = () => window.openExam(pageExam);
                            wrapper.appendChild(examBtn);
                        }

                        viewer.appendChild(wrapper);
                        wrappers.push({ wrapper, originalWidth, originalHeight });
                    }
                    applyLayout();
                    updateScaling();
                };

                window.addEventListener('resize', updateScaling);
                await renderPages();
            } catch (err) {
                console.error("PDF Init Error:", err);
                document.getElementById('pdf-viewer').style.display = 'none';
                document.getElementById('error-overlay').style.display = 'block';
                document.getElementById('error-details').innerText = String(err.message || err);
            }
        }

        window.closeModal = (id) => document.getElementById(id).classList.remove('active');
        init();
    </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${document.name}_offline.html`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download offline version:", err);
      alert("Failed to generate offline version. Please try again.");
    }
  };

  return (
    <div className="min-h-[100dvh] min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="sticky top-0 z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="p-2 shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black uppercase tracking-tight truncate w-full">
              {document.name}
            </h1>
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest truncate w-full">
              Augmented Mode Active
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="relative z-[110]">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl transition-all ${showSettings ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              <Settings className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="fixed right-4 left-4 top-[80px] sm:top-auto sm:absolute sm:left-auto sm:right-0 mt-4 sm:w-72 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6 z-[110]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Visual Settings
                      </div>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-tight">
                          Responsive Fit
                        </label>
                        <button
                          onClick={() => {
                            setOverlaySettings((s) => ({
                              ...s,
                              responsiveFit: !s.responsiveFit,
                            }));
                          }}
                          className={`w-10 h-6 rounded-full transition-colors relative ${overlaySettings.responsiveFit ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${overlaySettings.responsiveFit ? "left-5" : "left-1"}`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-tight">
                          Single Page Mode
                        </label>
                        <button
                          onClick={() => {
                            setPageLayout((s) =>
                              s === "single" ? "continuous" : "single",
                            );
                            setCurrentSinglePage(1);
                          }}
                          className={`w-10 h-6 rounded-full transition-colors relative ${pageLayout === "single" ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pageLayout === "single" ? "left-5" : "left-1"}`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-tight">
                          Enable Tools
                        </label>
                        <button
                          onClick={() => {
                            setOverlaySettings((s) => ({
                              ...s,
                              enableTools: !s.enableTools,
                            }));
                            if (overlaySettings.enableTools)
                              setToolMode("none");
                          }}
                          className={`w-10 h-6 rounded-full transition-colors relative ${overlaySettings.enableTools ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${overlaySettings.enableTools ? "left-5" : "left-1"}`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-tight">
                          Reader Mode
                        </label>
                        <button
                          onClick={() => {
                            const newValue = !overlaySettings.readerMode;
                            setOverlaySettings((s) => ({
                              ...s,
                              readerMode: newValue,
                            }));
                            if (!newValue) stopReading();
                          }}
                          className={`w-10 h-6 rounded-full transition-colors relative ${overlaySettings.readerMode ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${overlaySettings.readerMode ? "left-5" : "left-1"}`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-tight">
                          Show Icons
                        </label>
                        <button
                          onClick={() =>
                            setOverlaySettings((s) => ({
                              ...s,
                              showIcons: !s.showIcons,
                            }))
                          }
                          className={`w-10 h-6 rounded-full transition-colors relative ${overlaySettings.showIcons ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${overlaySettings.showIcons ? "left-5" : "left-1"}`}
                          />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-tight">
                            Line Opacity
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">
                            {Math.round(overlaySettings.lineOpacity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={overlaySettings.lineOpacity}
                          onChange={(e) =>
                            setOverlaySettings((s) => ({
                              ...s,
                              lineOpacity: parseFloat(e.target.value),
                            }))
                          }
                          className="w-full accent-emerald-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-tight">
                            Line Height
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">
                            {overlaySettings.lineHeight}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="6"
                          step="1"
                          value={overlaySettings.lineHeight}
                          onChange={(e) =>
                            setOverlaySettings((s) => ({
                              ...s,
                              lineHeight: parseInt(e.target.value),
                            }))
                          }
                          className="w-full accent-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <button
                      onClick={() => onSaveAugmentation && onSaveAugmentation(document)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                    >
                      <Save className="w-4 h-4" /> Save Augmentation
                    </button>
                    <button
                      onClick={downloadOfflineVersion}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:scale-105 transition-transform shadow-lg"
                    >
                      <DownloadCloud className="w-4 h-4" /> Download Offline
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
              className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <span className="px-4 text-xs font-black w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(3, s + 0.1))}
              className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {overlaySettings.readerMode && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-white dark:bg-slate-900 rounded-full shadow-2xl border border-slate-100 dark:border-slate-800 p-2 flex items-center gap-1 sm:gap-2">
          <button
            onClick={skipToPrevPage}
            title="Previous Page"
            className="p-2 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronFirst className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={skipBackward}
            title="Previous Sentence"
            className="p-2 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={toggleReader}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
          >
            {readingState.isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-1" />
            )}
          </button>
          <button
            onClick={skipForward}
            title="Next Sentence"
            className="p-2 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={skipToNextPage}
            title="Next Page"
            className="p-2 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLast className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 mx-1 sm:mx-2" />
          <div className="pr-4 sm:pr-6 pl-1 sm:pl-2">
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              Reading Page
            </div>
            <div className="text-[10px] sm:text-xs font-black text-emerald-500">
              {readingState.currentPage} / {numPages}
            </div>
          </div>
        </div>
      )}

      {/* Annotation Toolbar Area */}
      {overlaySettings.enableTools !== false && (
        <div className="fixed sm:absolute bottom-24 sm:top-24 sm:bottom-auto right-4 z-50 flex gap-4 pointer-events-auto">
          {/* Sub-tools for active mode */}
          <AnimatePresence>
            {toolMode === "pen" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-900 shadow-2xl p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-3"
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Pen
                </div>
                <div className="flex flex-col gap-2">
                  {["#2563eb", "#dc2626", "#16a34a", "#ca8a04", "#000000"].map(
                    (c) => (
                      <button
                        key={c}
                        onClick={() => setPenColor(c)}
                        className={`w-6 h-6 rounded-full border-2 ${penColor === c ? "border-indigo-400 scale-110" : "border-transparent"} transition-transform`}
                        style={{ backgroundColor: c }}
                      />
                    ),
                  )}
                </div>
                <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800" />
                <div className="flex flex-col items-center gap-2">
                  {[2, 4, 6].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPenSize(s)}
                      className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${penSize === s ? "bg-slate-200 dark:bg-slate-700" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                    >
                      <div
                        className="bg-slate-700 dark:bg-slate-300 rounded-full"
                        style={{ width: s * 1.5, height: s * 1.5 }}
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {toolMode === "highlight" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-900 shadow-2xl p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-3"
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Highlight
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      id: "yellow",
                      val: "rgba(250, 204, 21, 0.4)",
                      bg: "#fef08a",
                    },
                    {
                      id: "green",
                      val: "rgba(74, 222, 128, 0.4)",
                      bg: "#bbf7d0",
                    },
                    {
                      id: "blue",
                      val: "rgba(96, 165, 250, 0.4)",
                      bg: "#bfdbfe",
                    },
                    {
                      id: "pink",
                      val: "rgba(244, 114, 182, 0.4)",
                      bg: "#fbcfe8",
                    },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setHighlightColor(c.val)}
                      className={`w-6 h-6 rounded-full border-2 ${highlightColor === c.val ? "border-amber-400 scale-110" : "border-transparent"} transition-transform`}
                      style={{ backgroundColor: c.bg }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Toolbar */}
          <div className="flex flex-col gap-2 bg-white dark:bg-slate-900 shadow-2xl p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setToolMode(toolMode === "pen" ? "none" : "pen")}
              className={`p-3 rounded-xl transition-all ${toolMode === "pen" ? "bg-indigo-100 text-indigo-600" : "hover:bg-slate-100 text-slate-400"}`}
              title="Pen Tool"
            >
              <div className="w-5 h-5 flex items-center justify-center font-bold">
                ✎
              </div>
            </button>
            <button
              onClick={() =>
                setToolMode(toolMode === "highlight" ? "none" : "highlight")
              }
              className={`p-3 rounded-xl transition-all ${toolMode === "highlight" ? "bg-amber-100 text-amber-600" : "hover:bg-slate-100 text-slate-400"}`}
              title="Highlight Tool"
            >
              <div className="w-5 h-5 bg-amber-200 rounded-sm" />
            </button>
            <button
              onClick={() => setToolMode(toolMode === "note" ? "none" : "note")}
              className={`p-3 rounded-xl transition-all ${toolMode === "note" ? "bg-emerald-100 text-emerald-600" : "hover:bg-slate-100 text-slate-400"}`}
              title="Add Note Tool"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setToolMode(toolMode === "eraser" ? "none" : "eraser")
              }
              className={`p-3 rounded-xl transition-all ${toolMode === "eraser" ? "bg-rose-100 text-rose-600" : "hover:bg-slate-100 text-slate-400"}`}
              title="Eraser Tool"
            >
              <div className="w-5 h-5 flex items-center justify-center font-bold">
                ⌫
              </div>
            </button>

            <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />

            <button
              onClick={() => setShowDrawings(!showDrawings)}
              className={`p-3 rounded-xl transition-all ${showDrawings ? "text-indigo-600" : "text-slate-300"}`}
              title="Toggle Drawings"
            >
              {showDrawings ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setShowHighlights(!showHighlights)}
              className={`p-3 rounded-xl transition-all ${showHighlights ? "text-amber-600" : "text-slate-300"}`}
              title="Toggle Highlights"
            >
              {showHighlights ? (
                <Zap className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="p-4 sm:p-8 flex flex-col items-center gap-8 overflow-x-hidden"
      >
        {Array.from({ length: numPages }, (_, i) => {
          if (pageLayout === "single" && currentSinglePage !== i + 1)
            return null;
          return (
            <div
              key={i}
              className="w-full flex justify-center overflow-x-auto custom-scrollbar pb-4 min-h-[400px]"
            >
              <PdfPageWithOverlays
                pdf={pdf}
                pageNumber={i + 1}
                scale={scale}
                augmentations={allAugmentations}
                settings={overlaySettings}
                readingState={readingState}
                onOpenGroup={(augs) =>
                  setActiveGroup({ augmentations: augs, currentIndex: 0 })
                }
                onExam={(exam) => setActiveExam(exam)}
                toolMode={toolMode}
                drawings={drawings}
                highlights={highlights}
                showDrawings={showDrawings}
                showHighlights={showHighlights}
                penColor={penColor}
                penSize={penSize}
                highlightColor={highlightColor}
                onDrawComplete={(path) =>
                  setDrawings((prev) => [...prev, path])
                }
                onEraser={(pathId) =>
                  setDrawings((prev) => prev.filter((d) => d.id !== pathId))
                }
                onHighlight={(hl) => setHighlights((prev) => [...prev, hl])}
                onEraseHighlight={(hlId) =>
                  setHighlights((prev) => prev.filter((h) => h.id !== hlId))
                }
                onMarkNote={(aug) => {
                  const noteValue = window.prompt(
                    `Add a note for "${aug.term}":`,
                  );
                  if (noteValue) {
                    setUserNotes((prev) => [
                      ...prev,
                      { ...aug, value: noteValue },
                    ]);
                  }
                }}
              />
            </div>
          );
        })}
      </div>

      {pageLayout === "single" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[65] flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-2xl border border-slate-200 dark:border-slate-800 p-2 gap-4">
          <button
            disabled={currentSinglePage === 1}
            onClick={() => {
              setCurrentSinglePage((p) => p - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-full transition-colors font-black text-xs uppercase tracking-widest flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-xs font-black px-2 text-slate-800 dark:text-slate-200">
            {currentSinglePage} / {numPages}
          </div>
          <button
            disabled={currentSinglePage === numPages}
            onClick={() => {
              setCurrentSinglePage((p) => p + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-full transition-colors font-black text-xs uppercase tracking-widest flex items-center gap-2"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {activeExam && (
          <ExamModal exam={activeExam} onClose={() => setActiveExam(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeGroup && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveGroup(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 100 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl border-t-2 sm:border-2 border-slate-100 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div
                      className={`text-[10px] font-black uppercase tracking-[0.4em] ${
                        activeGroup.augmentations[activeGroup.currentIndex]
                          .type === "explanation"
                          ? "text-emerald-500"
                          : activeGroup.augmentations[activeGroup.currentIndex]
                                .type === "teacher"
                            ? "text-amber-500"
                            : activeGroup.augmentations[
                                  activeGroup.currentIndex
                                ].type === "note"
                              ? "text-teal-500"
                              : activeGroup.augmentations[
                                    activeGroup.currentIndex
                                  ].type === "warning"
                                ? "text-rose-500"
                                : activeGroup.augmentations[
                                      activeGroup.currentIndex
                                    ].type === "flashcard"
                                  ? "text-violet-500"
                                  : activeGroup.augmentations[
                                        activeGroup.currentIndex
                                      ].type === "lab"
                                    ? "text-sky-500"
                                    : activeGroup.augmentations[
                                          activeGroup.currentIndex
                                        ].type === "mechanism"
                                      ? "text-blue-600"
                                      : activeGroup.augmentations[
                                            activeGroup.currentIndex
                                          ].type === "root"
                                        ? "text-fuchsia-500"
                                        : "text-indigo-500"
                      }`}
                    >
                      {activeGroup.augmentations[activeGroup.currentIndex]
                        .type === "explanation"
                        ? "Technical Explanation"
                        : activeGroup.augmentations[activeGroup.currentIndex]
                              .type === "teacher"
                          ? "Teacher Breakdown"
                          : activeGroup.augmentations[activeGroup.currentIndex]
                                .type === "note"
                            ? "Personal Note"
                            : activeGroup.augmentations[
                                  activeGroup.currentIndex
                                ].type === "warning"
                              ? "Red Flag / Clinical Trap"
                              : activeGroup.augmentations[
                                    activeGroup.currentIndex
                                  ].type === "flashcard"
                                ? "Active Recall Flashcard"
                                : activeGroup.augmentations[
                                      activeGroup.currentIndex
                                    ].type === "lab"
                                  ? "Clinical Lab Value"
                                  : activeGroup.augmentations[
                                        activeGroup.currentIndex
                                      ].type === "mechanism"
                                    ? "Mechanism Rabbit Hole"
                                    : activeGroup.augmentations[
                                          activeGroup.currentIndex
                                        ].type === "root"
                                      ? "Etymology Slicer"
                                      : "Media Attachment"}
                    </div>
                    {activeGroup.augmentations.length > 1 && (
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Object {activeGroup.currentIndex + 1} of{" "}
                        {activeGroup.augmentations.length}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveGroup(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic leading-tight">
                      {activeGroup.augmentations[activeGroup.currentIndex].term}
                    </h2>

                    {activeGroup.augmentations.length > 1 && (
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shrink-0">
                        <button
                          onClick={() =>
                            setActiveGroup((s) =>
                              s
                                ? {
                                    ...s,
                                    currentIndex:
                                      (s.currentIndex -
                                        1 +
                                        s.augmentations.length) %
                                      s.augmentations.length,
                                  }
                                : null,
                            )
                          }
                          className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm disabled:opacity-30"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-[10px] font-black w-10 text-center">
                          {activeGroup.currentIndex + 1} /{" "}
                          {activeGroup.augmentations.length}
                        </span>
                        <button
                          onClick={() =>
                            setActiveGroup((s) =>
                              s
                                ? {
                                    ...s,
                                    currentIndex:
                                      (s.currentIndex + 1) %
                                      s.augmentations.length,
                                  }
                                : null,
                            )
                          }
                          className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm disabled:opacity-30"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    className={`h-[2px] w-20 transition-all duration-500 ${
                      activeGroup.augmentations[activeGroup.currentIndex]
                        .type === "explanation"
                        ? "bg-emerald-500"
                        : activeGroup.augmentations[activeGroup.currentIndex]
                              .type === "teacher"
                          ? "bg-amber-500 w-full"
                          : "bg-indigo-500"
                    }`}
                  />

                  {activeGroup.augmentations[activeGroup.currentIndex].type ===
                  "explanation" ? (
                    <p className="text-slate-600 dark:text-slate-100 text-base sm:text-lg leading-relaxed font-medium">
                      {
                        activeGroup.augmentations[activeGroup.currentIndex]
                          .value
                      }
                    </p>
                  ) : activeGroup.augmentations[activeGroup.currentIndex]
                      .type === "note" ? (
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-100 dark:border-teal-800">
                      <p className="text-slate-600 dark:text-slate-100 text-base sm:text-lg leading-relaxed font-medium whitespace-pre-wrap">
                        {
                          activeGroup.augmentations[activeGroup.currentIndex]
                            .value
                        }
                      </p>
                    </div>
                  ) : activeGroup.augmentations[activeGroup.currentIndex]
                      .type === "teacher" ? (
                    <div className="space-y-6">
                      {/* Teacher Tabs */}
                      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl gap-1 overflow-x-auto custom-scrollbar">
                        {[
                          {
                            id: "script",
                            icon: GraduationCap,
                            label: "Lesson",
                            available: true,
                          },
                          {
                            id: "case",
                            icon: Stethoscope,
                            label: "Clinical",
                            available:
                              !!activeGroup.augmentations[
                                activeGroup.currentIndex
                              ].teacherClinicalCase,
                          },
                          {
                            id: "memory",
                            icon: Lightbulb,
                            label: "Memory",
                            available:
                              !!activeGroup.augmentations[
                                activeGroup.currentIndex
                              ].teacherMnemonics?.length,
                          },
                          {
                            id: "quiz",
                            icon: Brain,
                            label: "Recall",
                            available:
                              !!activeGroup.augmentations[
                                activeGroup.currentIndex
                              ].teacherMiniQuiz,
                          },
                          {
                            id: "visuals",
                            icon: ImageIcon,
                            label: "Visuals",
                            available:
                              !!activeGroup.augmentations[
                                activeGroup.currentIndex
                              ].teacherImage,
                          },
                        ]
                          .filter((t) => t.available)
                          .map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => {
                                setTeacherTab(tab.id as any);
                                setShowQuizAnswer(false);
                              }}
                              className={`flex-1 shrink-0 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                teacherTab === tab.id
                                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              }`}
                            >
                              <tab.icon className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">
                                {tab.label}
                              </span>
                            </button>
                          ))}
                      </div>

                      <AnimatePresence mode="wait">
                        {teacherTab === "script" && (
                          <motion.div
                            key="script"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6"
                          >
                            <div className="flex items-start gap-4">
                              <div className="mt-1 bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl shrink-0">
                                <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="flex-1 space-y-4">
                                <div className="relative bg-slate-50 dark:bg-slate-800 p-6 rounded-r-[2rem] rounded-bl-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-all duration-300">
                                  <div className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-medium italic">
                                    <MarkdownRenderer
                                      theme={activeGroup.augmentations[activeGroup.currentIndex].color as any || "amber"}
                                      content={
                                        activeGroup.augmentations[
                                          activeGroup.currentIndex
                                        ].teacherScript ||
                                        activeGroup.augmentations[
                                          activeGroup.currentIndex
                                        ].value
                                      }
                                    />
                                  </div>
                                  <div className="absolute top-0 -left-2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-slate-50 dark:border-r-slate-800 border-b-[8px] border-b-transparent" />
                                </div>

                                <button
                                  onClick={() =>
                                    handleTeacherSpeak(
                                      activeGroup.augmentations[
                                        activeGroup.currentIndex
                                      ].teacherScript ||
                                        activeGroup.augmentations[
                                          activeGroup.currentIndex
                                        ].value,
                                    )
                                  }
                                  className={`flex items-center gap-3 px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                                    isTeacherSpeaking
                                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                      : "bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95"
                                  }`}
                                >
                                  {isTeacherSpeaking ? (
                                    <>
                                      <Square className="w-4 h-4 fill-current" />{" "}
                                      Stop Lesson
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="w-4 h-4" /> Start
                                      Lesson
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {teacherTab === "memory" &&
                          activeGroup.augmentations[activeGroup.currentIndex]
                            .teacherMnemonics && (
                            <motion.div
                              key="memory"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="space-y-4"
                            >
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                  <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                                    Memory Hooks
                                  </h4>
                                  <p className="text-[10px] text-slate-500 font-bold tracking-tight">
                                    Devices to help you remember
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(Array.isArray(
                                  activeGroup.augmentations[
                                    activeGroup.currentIndex
                                  ].teacherMnemonics,
                                )
                                  ? activeGroup.augmentations[
                                      activeGroup.currentIndex
                                    ].teacherMnemonics
                                  : typeof activeGroup.augmentations[
                                        activeGroup.currentIndex
                                      ].teacherMnemonics === "string"
                                    ? [
                                        activeGroup.augmentations[
                                          activeGroup.currentIndex
                                        ].teacherMnemonics as unknown as string,
                                      ]
                                    : []
                                )?.map((m: string, i: number) => (
                                  <div
                                    key={i}
                                    className="relative p-5 bg-[#fef3c7] dark:bg-amber-900/40 rounded-2xl shadow-sm rotate-1 hover:rotate-0 transition-transform"
                                  >
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-rose-400/80 rounded-full shadow-inner shadow-rose-900/20 backdrop-blur-sm z-10" />
                                    <p className="text-amber-900 dark:text-amber-100 font-bold italic leading-relaxed text-center mt-2 relative z-0">
                                      "{m}"
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}

                        {teacherTab === "case" && (
                          <motion.div
                            key="case"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-4"
                          >
                            <div className="p-6 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative group">
                              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                                <Stethoscope className="w-32 h-32" />
                              </div>

                              <div className="relative space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                    <RotateCcw className="w-5 h-5 text-amber-400" />
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                      Case Vignette
                                    </div>
                                    <div className="text-sm font-bold text-slate-300">
                                      Clinical Application
                                    </div>
                                  </div>
                                </div>

                                <blockquote className="text-base font-medium leading-relaxed italic border-l-4 border-amber-500 pl-4 py-2">
                                  {activeGroup.augmentations[
                                    activeGroup.currentIndex
                                  ].teacherClinicalCase ||
                                    "No clinical case study available for this segment."}
                                </blockquote>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {teacherTab === "quiz" && (
                          <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                                  Active Recall
                                </h4>
                                <p className="text-[10px] text-slate-500 font-bold tracking-tight">
                                  Reinforce the concept immediately
                                </p>
                              </div>
                            </div>

                            <div
                              onClick={() => setShowQuizAnswer(!showQuizAnswer)}
                              className="cursor-pointer group perspective-1000"
                            >
                              <div className="relative p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                                <div className="space-y-4">
                                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
                                    {activeGroup.augmentations[
                                      activeGroup.currentIndex
                                    ].teacherMiniQuiz?.question ||
                                      "Can you explain this concept in 10 words?"}
                                  </div>

                                  <div
                                    className={`transition-all duration-500 overflow-hidden ${showQuizAnswer ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                                  >
                                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
                                      <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">
                                        Detailed Answer
                                      </div>
                                      <div className="text-base font-medium text-slate-600 dark:text-slate-100 bg-indigo-50/30 dark:bg-indigo-900/10 p-4 rounded-xl">
                                        {activeGroup.augmentations[
                                          activeGroup.currentIndex
                                        ].teacherMiniQuiz?.answer ||
                                          "Explanation is found in the main lesson content."}
                                      </div>
                                    </div>
                                  </div>

                                  {!showQuizAnswer && (
                                    <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">
                                      <Eye className="w-3.5 h-3.5" /> Reveal
                                      Answer
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {teacherTab === "visuals" && (
                          <motion.div
                            key="visuals"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-4"
                          >
                            <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                              {activeGroup.augmentations[
                                activeGroup.currentIndex
                              ].teacherImage ? (
                                <img
                                  src={
                                    activeGroup.augmentations[
                                      activeGroup.currentIndex
                                    ].teacherImage
                                  }
                                  alt="Teacher Aid"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center space-y-4">
                                  <ImageIcon className="w-12 h-12 mx-auto text-slate-300" />
                                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    No media attached
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Shared Footer High Yield Point */}
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            Exam Performance Insight
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          This conceptual segment usually appears as a{" "}
                          {teacherTab === "case"
                            ? "Clinical Scene"
                            : teacherTab === "quiz"
                              ? "Mechanistic Question"
                              : "High-Level Review"}{" "}
                          in board exams.
                        </p>
                      </div>
                    </div>
                  ) : activeGroup.augmentations[activeGroup.currentIndex]
                      .type === "warning" ? (
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-3xl p-6 sm:p-8 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-8 h-8 text-rose-500" />
                        <h3 className="text-xl font-black text-rose-700 dark:text-rose-400">
                          Clinical Trap
                        </h3>
                      </div>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        Why is this dangerous?
                      </p>

                      <div
                        className="relative cursor-pointer group rounded-2xl overflow-hidden"
                        onClick={() => setIsWarningRevealed(true)}
                      >
                          <div className={`transition-all duration-700 ${!isWarningRevealed ? "blur-md opacity-40 select-none scale-95" : "blur-0 opacity-100 scale-100"} bg-white dark:bg-slate-800 p-6 shadow-sm text-base font-medium`}>
                            <MarkdownRenderer
                              theme={activeGroup.augmentations[activeGroup.currentIndex].color as any || "rose"}
                              content={
                                activeGroup.augmentations[
                                  activeGroup.currentIndex
                                ].warningError ||
                                activeGroup.augmentations[
                                  activeGroup.currentIndex
                                ].value
                              }
                            />
                          </div>

                        {!isWarningRevealed && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/30 dark:bg-slate-900/40">
                            <span className="bg-rose-500 text-white px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2 group-hover:scale-105 transition-transform">
                              <Eye className="w-4 h-4" /> Tap to Reveal Risk
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : activeGroup.augmentations[activeGroup.currentIndex]
                      .type === "flashcard" ? (
                    <div
                      className="w-full relative min-h-[300px] cursor-pointer group"
                      style={{ perspective: "1200px" }}
                      onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                    >
                      <motion.div
                        className="w-full h-full absolute transition-transform duration-700"
                        animate={{ rotateY: isFlashcardFlipped ? 180 : 0 }}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* Front Face */}
                        <div
                          className="absolute inset-0 bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-200 dark:border-violet-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:backdrop-blur-2xl group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item"
                          style={{
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                          }}
                        >
                          <div className="absolute top-6 left-6 flex items-center gap-2 text-violet-400">
                            <Layers className="w-4 h-4" />{" "}
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Question
                            </span>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-violet-900 dark:text-violet-100 px-4">
                            {activeGroup.augmentations[activeGroup.currentIndex]
                              .flashcardFront ||
                              activeGroup.augmentations[
                                activeGroup.currentIndex
                              ].term}
                          </div>
                          <div className="absolute bottom-6 text-[10px] font-black uppercase tracking-widest text-violet-400 flex items-center gap-2 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                            Tap to Flip <Repeat className="w-3 h-3" />
                          </div>
                        </div>

                        {/* Back Face */}
                        <div
                          className="absolute inset-0 bg-white dark:bg-slate-800 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl flashcard-back"
                          style={{
                            transform: "rotateY(180deg)",
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                          }}
                        >
                          <div className="absolute top-6 left-6 flex items-center gap-2 text-emerald-500">
                            <CheckCircle className="w-4 h-4" />{" "}
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Answer
                            </span>
                          </div>
                          <div className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-200 whitespace-pre-wrap overflow-y-auto px-4 custom-scrollbar">
                            <MarkdownRenderer
                              theme={activeGroup.augmentations[activeGroup.currentIndex].color as any || "violet"}
                              content={
                                activeGroup.augmentations[
                                  activeGroup.currentIndex
                                ].flashcardBack ||
                                activeGroup.augmentations[
                                  activeGroup.currentIndex
                                ].value
                              }
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ) : activeGroup.augmentations[activeGroup.currentIndex]
                      .type === "lab" ? (
                    <div className="bg-sky-50 dark:bg-sky-900/10 border-2 border-sky-100 dark:border-sky-800/50 rounded-3xl p-6 sm:p-8 space-y-12">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-sky-700 dark:text-sky-300 pr-4">
                          {
                            activeGroup.augmentations[activeGroup.currentIndex]
                              .term
                          }
                        </h3>
                        <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">
                          {activeGroup.augmentations[activeGroup.currentIndex]
                            .labNormalRange || "Normal"}{" "}
                          <span className="text-slate-400 ml-1">
                            {
                              activeGroup.augmentations[
                                activeGroup.currentIndex
                              ].labUnit
                            }
                          </span>
                        </div>
                      </div>

                      {/* Horizontal Gauge */}
                      <div className="relative pt-6 pb-2">
                        <div className="absolute top-0 left-0 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                          Low
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                          Range
                        </div>
                        <div className="absolute top-0 right-0 text-[10px] font-black uppercase tracking-widest text-rose-400">
                          High
                        </div>

                        <div className="h-8 w-full flex rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700 relative z-10 bg-white dark:bg-slate-800">
                          <div className="w-1/3 bg-indigo-500/80 hover:bg-indigo-500 transition-colors" />
                          <div className="w-1/3 bg-emerald-400 hover:bg-emerald-500 transition-colors border-x-2 border-white dark:border-slate-800" />
                          <div className="w-1/3 bg-rose-400/80 hover:bg-rose-500 transition-colors" />
                        </div>

                        <div className="flex justify-between mt-4 gap-2">
                          <div className="w-1/3 text-xs text-indigo-600 dark:text-indigo-400 font-medium text-center">
                            {activeGroup.augmentations[activeGroup.currentIndex]
                              .labHypo || "Hypo-state"}
                          </div>
                          <div className="w-1/3 text-xs text-emerald-600 dark:text-emerald-400 font-bold text-center">
                            Target
                          </div>
                          <div className="w-1/3 text-xs text-rose-600 dark:text-rose-400 font-medium text-center">
                            {activeGroup.augmentations[activeGroup.currentIndex]
                              .labHyper || "Hyper-state"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : activeGroup.augmentations[activeGroup.currentIndex]
                      .type === "mechanism" ? (
                    <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800/50 rounded-3xl p-6 sm:p-8 space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <Microscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                            Mechanism Rabbit Hole
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold tracking-tight">
                            Control the depth of pathophysiological explanation
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span
                            className={
                              mechanismLevel >= 1 ? "text-blue-500" : ""
                            }
                          >
                            Surface
                          </span>
                          <span
                            className={
                              mechanismLevel >= 2 ? "text-blue-500" : ""
                            }
                          >
                            Medical
                          </span>
                          <span
                            className={
                              mechanismLevel >= 3 ? "text-blue-500" : ""
                            }
                          >
                            PhD / Hardcore
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="1"
                          value={mechanismLevel}
                          onChange={(e) =>
                            setMechanismLevel(parseInt(e.target.value))
                          }
                          className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                        />
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={mechanismLevel}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm min-h-[120px] flex flex-col justify-center"
                        >
                          <div className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic">
                            {mechanismLevel === 1 &&
                              (activeGroup.augmentations[
                                activeGroup.currentIndex
                              ].mechanismLevels?.level1 ||
                                "Simple surface explanation.")}
                            {mechanismLevel === 2 &&
                              (activeGroup.augmentations[
                                activeGroup.currentIndex
                              ].mechanismLevels?.level2 ||
                                "Clinical/Medical explanation.")}
                            {mechanismLevel === 3 &&
                              (activeGroup.augmentations[
                                activeGroup.currentIndex
                              ].mechanismLevels?.level3 ||
                                "In-depth mechanism explanation.")}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ) : activeGroup.augmentations[activeGroup.currentIndex]
                      .type === "root" ? (
                    <div className="bg-fuchsia-50 dark:bg-fuchsia-900/10 border-2 border-fuchsia-100 dark:border-fuchsia-800/50 rounded-3xl p-6 sm:p-8 space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-xl">
                          <Scissors className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                            Etymology Slicer
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold tracking-tight">
                            Decoding scientific terminology into literal
                            meanings
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                        {(
                          activeGroup.augmentations[activeGroup.currentIndex]
                            .rootSlices || []
                        ).map((slice, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0.8, x: -20, opacity: 0 }}
                            animate={{ scale: 1, x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1, type: "spring" }}
                            className="flex flex-col items-center"
                          >
                            <div
                              className="px-4 py-2 rounded-xl text-lg font-black text-white shadow-md mb-2"
                              style={{ backgroundColor: slice.color }}
                            >
                              {slice.prefix}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {slice.meaning}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="p-4 bg-fuchsia-50/50 dark:bg-fuchsia-900/20 rounded-xl text-xs font-bold text-center text-slate-600 dark:text-slate-300">
                        Result:{" "}
                        <span className="text-fuchsia-600 dark:text-fuchsia-400 ml-1">
                          {
                            activeGroup.augmentations[activeGroup.currentIndex]
                              .value
                          }
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      {activeGroup.augmentations[activeGroup.currentIndex]
                        .localImage ? (
                        <img
                          src={
                            activeGroup.augmentations[activeGroup.currentIndex]
                              .localImage
                          }
                          alt={
                            activeGroup.augmentations[activeGroup.currentIndex]
                              .term
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center space-y-4">
                          <ImageIcon className="w-12 h-12 mx-auto text-slate-300" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                            No image attached
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col sm:flex-row gap-4 sm:justify-between items-center border-t border-slate-100 dark:border-slate-800">
                {activeGroup.augmentations[activeGroup.currentIndex].type ===
                  "photo" && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg hover:scale-105 transition-transform"
                    >
                      <ImagePlus className="w-4 h-4" />
                      {activeGroup.augmentations[activeGroup.currentIndex]
                        .localImage
                        ? "Change Photo"
                        : "Upload Photo"}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveGroup(null)}
                  className="w-full sm:w-auto px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-xs tracking-widest rounded-xl ml-auto"
                >
                  {activeGroup.augmentations.length > 1 &&
                  activeGroup.currentIndex <
                    activeGroup.augmentations.length - 1
                    ? "Next"
                    : "Close"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface PdfPageWithOverlaysProps {
  key?: React.Key;
  pdf: any;
  pageNumber: number;
  scale: number;
  augmentations: PdfAugmentation[];
  settings: OverlaySettings;
  readingState: {
    isPlaying: boolean;
    currentPage: number;
    itemIndex: number;
    textItems: any[];
  };
  onOpenGroup: (augs: PdfAugmentation[]) => void;
  onExam: (exam: PdfAugmentation) => void;

  // Tool State
  toolMode: ToolMode;
  drawings: DrawingPath[];
  highlights: HighlightInfo[];
  showDrawings: boolean;
  showHighlights: boolean;
  penColor: string;
  penSize: number;
  highlightColor: string;

  // Tool Callbacks
  onDrawComplete: (path: DrawingPath) => void;
  onEraser: (pathId: string) => void;
  onHighlight: (hl: HighlightInfo) => void;
  onEraseHighlight: (hlId: string) => void;
  onMarkNote: (aug: PdfAugmentation) => void;
}

const PdfPageWithOverlays = ({
  pdf,
  pageNumber,
  scale,
  augmentations,
  settings,
  readingState,
  onOpenGroup,
  onExam,
  toolMode,
  drawings,
  highlights,
  showDrawings,
  showHighlights,
  penColor,
  penSize,
  highlightColor,
  onDrawComplete,
  onEraser,
  onHighlight,
  onEraseHighlight,
  onMarkNote,
}: PdfPageWithOverlaysProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewport, setViewport] = useState<any>(null);
  const [textItems, setTextItems] = useState<any[]>([]);

  // Tool Drawing State
  const [currentDragPath, setCurrentDragPath] = useState<
    { x: number; y: number }[] | null
  >(null);

  const getPointerCoords = (e: React.PointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (toolMode === "pen") {
      setCurrentDragPath([getPointerCoords(e)]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (toolMode === "pen" && currentDragPath) {
      setCurrentDragPath([...currentDragPath, getPointerCoords(e)]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (toolMode === "pen" && currentDragPath && currentDragPath.length > 0) {
      onDrawComplete({
        id: Math.random().toString(36).substring(7),
        page: pageNumber,
        points: currentDragPath,
        color: penColor,
        size: penSize,
      });
      setCurrentDragPath(null);
    }
  };

  const handlePointerCancel = () => {
    setCurrentDragPath(null);
  };

  const currentHighlight = useMemo(() => {
    if (
      !readingState.isPlaying ||
      readingState.currentPage !== pageNumber ||
      readingState.itemIndex === -1
    )
      return null;
    const item = readingState.textItems[readingState.itemIndex];
    if (!item || !viewport) return null;

    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
    return {
      left: tx[4],
      top: tx[5] - item.height * scale + 2,
      width: item.width * scale,
      height: item.height * scale,
    };
  }, [readingState, pageNumber, viewport, scale]);

  useEffect(() => {
    let renderTask: any = null;
    const renderPage = async () => {
      if (!pdf) return;
      try {
        const page = await pdf.getPage(pageNumber);
        const vp = page.getViewport({ scale });
        setViewport(vp);

        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext("2d");
          if (context) {
            const dpr = window.devicePixelRatio || 1;
            canvas.height = vp.height * dpr;
            canvas.width = vp.width * dpr;
            canvas.style.width = `${vp.width}px`;
            canvas.style.height = `${vp.height}px`;
            context.scale(dpr, dpr);

            renderTask = page.render({ canvasContext: context, viewport: vp });
            await renderTask.promise;
          }
        }

        const textContent = await page.getTextContent();
        setTextItems(textContent.items);
      } catch (err: any) {
        if (err.name === "RenderingCancelledException") {
          // Expected when component re-renders or unmounts
          return;
        }
        console.error("PDF Render Error:", err);
      }
    };
    renderPage();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, pageNumber, scale]);

  const overlays = useMemo(() => {
    if (!viewport) return [];
    const groups: Map<string, any> = new Map();
    const augOccurrenceCounts = new Map<any, number>();

    textItems.forEach((item: any) => {
      augmentations.forEach((aug) => {
        if (aug.page !== undefined && aug.page !== pageNumber) return;

        const term = aug.term.toLowerCase();
        const str = item.str.toLowerCase();
        let startIndex = 0;

        while ((startIndex = str.indexOf(term, startIndex)) !== -1) {
          const currentCount = (augOccurrenceCounts.get(aug) || 0) + 1;
          augOccurrenceCounts.set(aug, currentCount);

          if (aug.occurrenceIndex && aug.occurrenceIndex !== currentCount) {
            startIndex += term.length;
            continue;
          }

          if (aug.type === "exam") {
            startIndex += term.length;
            continue;
          }

          const key = `page-${pageNumber}-y-${item.transform[5]}-x-${item.transform[4]}-idx-${startIndex}`;
          const existing = groups.get(key);

          if (existing) {
            // Avoid adding exact duplicate augmentations
            const isDuplicate = existing.augmentations.some(
              (a: any) =>
                a.term === aug.term &&
                a.type === aug.type &&
                a.value === aug.value,
            );
            if (!isDuplicate) {
              existing.augmentations.push(aug);
            }
          } else {
            const tx = pdfjsLib.Util.transform(
              viewport.transform,
              item.transform,
            );
            const charWidth = item.width / item.str.length;
            const leftOffset = startIndex * charWidth * scale;
            const termWidth = aug.term.length * charWidth * scale;

            groups.set(key, {
              left: tx[4] + leftOffset,
              top: tx[5] - item.height * scale + 2,
              width: termWidth,
              height: item.height * scale,
              augmentations: [aug],
            });
          }

          startIndex += term.length;
        }
      });
    });
    return Array.from(groups.values());
  }, [textItems, augmentations, pageNumber, viewport, scale]);

  const pageExam = useMemo(() => {
    return augmentations.find(
      (aug) => aug.type === "exam" && aug.page === pageNumber,
    );
  }, [augmentations, pageNumber]);

  const [isPointerDown, setIsPointerDown] = useState(false);

  useEffect(() => {
    const handleUp = () => setIsPointerDown(false);
    window.addEventListener("pointerup", handleUp);
    return () => window.removeEventListener("pointerup", handleUp);
  }, []);

  if (!viewport)
    return (
      <div className="w-[600px] h-[800px] bg-white animate-pulse rounded-2xl" />
    );

  return (
    <div
      className="relative shadow-2xl rounded-2xl overflow-hidden bg-white"
      style={{
        width: viewport.width,
        height: viewport.height,
        touchAction: toolMode !== "none" ? "none" : "auto",
      }}
      onPointerDown={() => setIsPointerDown(true)}
    >
      <canvas ref={canvasRef} />

      {/* Drawings SVG Layer */}
      {showDrawings && (
        <svg
          ref={svgRef}
          className={`absolute inset-0 z-30 ${toolMode === "pen" || toolMode === "eraser" ? "pointer-events-auto" : "pointer-events-none"}`}
          style={{ width: "100%", height: "100%" }}
          onPointerDown={toolMode === "pen" ? handlePointerDown : undefined}
          onPointerMove={toolMode === "pen" ? handlePointerMove : undefined}
          onPointerUp={toolMode === "pen" ? handlePointerUp : undefined}
          onPointerCancel={toolMode === "pen" ? handlePointerCancel : undefined}
        >
          {drawings
            .filter((d) => d.page === pageNumber)
            .map((path) => (
              <polyline
                key={path.id}
                points={path.points.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke={path.color}
                strokeWidth={path.size}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  toolMode === "eraser" ? "cursor-pointer hover:opacity-50" : ""
                }
                onPointerDown={
                  toolMode === "eraser" ? () => onEraser(path.id) : undefined
                }
                onPointerEnter={
                  toolMode === "eraser" && isPointerDown
                    ? () => onEraser(path.id)
                    : undefined
                }
              />
            ))}
          {toolMode === "pen" && currentDragPath && (
            <polyline
              points={currentDragPath.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={penColor}
              strokeWidth={penSize}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      )}

      {/* Highlights & Interactive Tools Layer */}
      <div
        className={`absolute inset-0 ${toolMode === "highlight" || toolMode === "note" || toolMode === "eraser" ? "pointer-events-auto z-40" : "pointer-events-none z-10"}`}
      >
        {/* Render persistent highlights */}
        {showHighlights &&
          highlights
            .filter((h) => h.page === pageNumber)
            .map((hl) => {
              const item = textItems[hl.wordIdx];
              if (!item) return null;
              const tx = pdfjsLib.Util.transform(
                viewport.transform,
                item.transform,
              );
              return (
                <div
                  key={hl.id}
                  className={`absolute mix-blend-multiply ${toolMode === "eraser" ? "pointer-events-auto cursor-pointer hover:opacity-50" : "pointer-events-none"}`}
                  style={{
                    left: tx[4],
                    top: tx[5] - item.height * scale + 2,
                    width: item.width * scale,
                    height: item.height * scale,
                    backgroundColor: hl.color,
                  }}
                  onPointerDown={
                    toolMode === "eraser"
                      ? () => onEraseHighlight(hl.id)
                      : undefined
                  }
                  onPointerEnter={
                    toolMode === "eraser" && isPointerDown
                      ? () => onEraseHighlight(hl.id)
                      : undefined
                  }
                />
              );
            })}

        {/* Render invisible interactive text areas if in tool mode */}
        {(toolMode === "highlight" || toolMode === "note") &&
          textItems.map((item, idx) => {
            const tx = pdfjsLib.Util.transform(
              viewport.transform,
              item.transform,
            );
            // Only check if it's text, not already highlighted if in highlight mode
            const isAlreadyHighlighted = highlights.some(
              (h) => h.page === pageNumber && h.wordIdx === idx,
            );
            if (toolMode === "highlight" && isAlreadyHighlighted) return null;
            return (
              <div
                key={idx}
                className="absolute cursor-pointer hover:bg-black/5 pointer-events-auto"
                style={{
                  left: tx[4],
                  top: tx[5] - item.height * scale + 2,
                  width: item.width * scale,
                  height: item.height * scale,
                }}
                onPointerDown={() => {
                  if (toolMode === "highlight") {
                    onHighlight({
                      id: Math.random().toString(36).substring(7),
                      page: pageNumber,
                      wordIdx: idx,
                      color: highlightColor,
                    });
                  } else if (toolMode === "note") {
                    onMarkNote({
                      term: item.str,
                      type: "note",
                      value: "",
                      page: pageNumber,
                    });
                  }
                }}
                onPointerEnter={() => {
                  if (toolMode === "highlight" && isPointerDown) {
                    onHighlight({
                      id: Math.random().toString(36).substring(7),
                      page: pageNumber,
                      wordIdx: idx,
                      color: highlightColor,
                    });
                  }
                }}
              />
            );
          })}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {currentHighlight && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bg-emerald-500/20 border-2 border-emerald-500 rounded-sm z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              style={{
                left: currentHighlight.left,
                top: currentHighlight.top,
                width: currentHighlight.width,
                height: currentHighlight.height,
              }}
            />
          )}
        </AnimatePresence>

        {overlays.map((overlay, idx) => {
          const mainAugType = overlay.augmentations[0].type;
          const isStaticHighlight = mainAugType === "highlight";
          const isStaticUnderline = mainAugType === "underline";

          if (isStaticHighlight || isStaticUnderline) {
            const hasStaticColor = overlay.augmentations[0].color;
            return (
              <div
                key={idx}
                className={`absolute pointer-events-none z-10 ${isStaticHighlight && !hasStaticColor ? "bg-yellow-300/40 mix-blend-multiply" : ""} ${isStaticUnderline && !hasStaticColor ? "border-b-[3px] border-stone-400" : ""}`}
                style={{
                  left: overlay.left,
                  top: overlay.top,
                  width: overlay.width,
                  height: overlay.height,
                  backgroundColor:
                    isStaticHighlight && hasStaticColor
                      ? hasStaticColor
                      : undefined,
                  borderBottom:
                    isStaticUnderline && hasStaticColor
                      ? `3px solid ${hasStaticColor}`
                      : undefined,
                }}
              />
            );
          }

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => onOpenGroup(overlay.augmentations)}
              className={`absolute pointer-events-auto group/trigger flex items-center justify-center z-20`}
              style={{
                left: overlay.left,
                top: overlay.top,
                width: overlay.width,
                height: overlay.height,
              }}
            >
            {/* Extremely subtle background, visible on hover or slightly visible on mobile */}
            <div
              className={`absolute inset-0 rounded-sm ${
                overlay.augmentations[0].type === "explanation"
                  ? "bg-emerald-500"
                  : overlay.augmentations[0].type === "exam"
                    ? "bg-amber-500"
                    : overlay.augmentations[0].type === "teacher"
                      ? "bg-amber-500"
                      : overlay.augmentations[0].type === "note"
                        ? "bg-teal-500"
                        : overlay.augmentations[0].type === "warning"
                          ? "bg-rose-500"
                          : overlay.augmentations[0].type === "flashcard"
                            ? "bg-violet-500"
                            : overlay.augmentations[0].type === "lab"
                              ? "bg-sky-500"
                              : overlay.augmentations[0].type === "mechanism"
                                ? "bg-blue-600"
                                : overlay.augmentations[0].type === "root"
                                  ? "bg-fuchsia-500"
                                  : "bg-indigo-500"
              } opacity-0 group-hover/trigger:opacity-10 transition-opacity duration-300`}
            />

            {/* Vertical Accent Line for Teacher Segments */}
            {overlay.augmentations.some((a) => a.type === "teacher") && (
              <div className="absolute -left-2 top-0 bottom-0 w-1 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover/trigger:w-1.5 transition-all" />
            )}

            {/* Minimal Underline - Slightly more visible for touch/mobile */}
            <div
              className={`absolute bottom-0 left-0 right-0 ${
                overlay.augmentations[0].type === "explanation"
                  ? "bg-emerald-500"
                  : overlay.augmentations[0].type === "exam"
                    ? "bg-amber-500"
                    : overlay.augmentations[0].type === "teacher"
                      ? "bg-amber-500"
                      : overlay.augmentations[0].type === "note"
                        ? "bg-teal-500"
                        : overlay.augmentations[0].type === "warning"
                          ? "bg-rose-500"
                          : overlay.augmentations[0].type === "flashcard"
                            ? "bg-violet-500"
                            : overlay.augmentations[0].type === "lab"
                              ? "bg-sky-500"
                              : overlay.augmentations[0].type === "mechanism"
                                ? "bg-blue-600"
                                : overlay.augmentations[0].type === "root"
                                  ? "bg-fuchsia-500"
                                  : "bg-indigo-500"
              } group-hover/trigger:bg-current transition-colors duration-300`}
              style={{
                height: `${settings.lineHeight}px`,
                opacity: settings.lineOpacity,
              }}
            >
              <div
                className={`absolute inset-0 ${
                  overlay.augmentations[0].type === "explanation"
                    ? "bg-emerald-500"
                    : overlay.augmentations[0].type === "exam"
                      ? "bg-amber-500"
                      : overlay.augmentations[0].type === "teacher"
                        ? "bg-amber-500"
                        : overlay.augmentations[0].type === "note"
                          ? "bg-teal-500"
                          : overlay.augmentations[0].type === "warning"
                            ? "bg-rose-500"
                            : overlay.augmentations[0].type === "flashcard"
                              ? "bg-violet-500"
                              : overlay.augmentations[0].type === "lab"
                                ? "bg-sky-500"
                                : overlay.augmentations[0].type === "mechanism"
                                  ? "bg-blue-600"
                                  : overlay.augmentations[0].type === "root"
                                    ? "bg-fuchsia-500"
                                    : "bg-indigo-500"
                } scale-x-0 group-hover/trigger:scale-x-100 transition-transform duration-300 origin-left`}
              />
            </div>

            {/* Indicator Icon - Small hint by default, expands on hover/tap */}
            {settings.showIcons && (
              <div
                className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${
                  overlay.augmentations[0].type === "explanation"
                    ? "bg-emerald-500 shadow-emerald-500/20"
                    : overlay.augmentations[0].type === "exam"
                      ? "bg-amber-500 shadow-amber-500/20"
                      : overlay.augmentations[0].type === "teacher"
                        ? "bg-amber-500 shadow-amber-500/20"
                        : overlay.augmentations[0].type === "note"
                          ? "bg-teal-500 shadow-teal-500/20"
                          : overlay.augmentations[0].type === "warning"
                            ? "bg-rose-500 shadow-rose-500/20"
                            : overlay.augmentations[0].type === "flashcard"
                              ? "bg-violet-500 shadow-violet-500/20"
                              : overlay.augmentations[0].type === "lab"
                                ? "bg-sky-500 shadow-sky-500/20"
                                : overlay.augmentations[0].type === "mechanism"
                                  ? "bg-blue-600 shadow-blue-500/20"
                                  : overlay.augmentations[0].type === "root"
                                    ? "bg-fuchsia-500 shadow-fuchsia-500/20"
                                    : "bg-indigo-500 shadow-indigo-500/20"
                } text-white flex items-center justify-center shadow-lg transition-all duration-300 opacity-60 group-hover/trigger:opacity-100 group-hover/trigger:-top-4 group-hover/trigger:-right-4 overflow-hidden`}
              >
                {overlay.augmentations.length > 1 ? (
                  <span className="text-[8px] font-black">
                    {overlay.augmentations.length}x
                  </span>
                ) : overlay.augmentations[0].type === "explanation" ? (
                  <Info className="w-2 h-2" />
                ) : overlay.augmentations[0].type === "exam" ? (
                  <Trophy className="w-2 h-2" />
                ) : overlay.augmentations[0].type === "teacher" ? (
                  <GraduationCap className="w-2 h-2" />
                ) : overlay.augmentations[0].type === "note" ? (
                  <FileText className="w-2 h-2" />
                ) : overlay.augmentations[0].type === "warning" ? (
                  <AlertTriangle className="w-2 h-2" />
                ) : overlay.augmentations[0].type === "flashcard" ? (
                  <Layers className="w-2 h-2" />
                ) : overlay.augmentations[0].type === "lab" ? (
                  <Activity className="w-2 h-2" />
                ) : overlay.augmentations[0].type === "mechanism" ? (
                  <Microscope className="w-2 h-2" />
                ) : overlay.augmentations[0].type === "root" ? (
                  <Scissors className="w-2 h-2" />
                ) : (
                  <ImageIcon className="w-2 h-2" />
                )}
              </div>
            )}
          </motion.button>
        );
      })}
      </div>

      {pageExam && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          onClick={() => onExam(pageExam)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 bg-emerald-500 text-white p-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center gap-1 sm:gap-2 pointer-events-auto"
          style={{ transform: `scale(${Math.max(0.7, Math.min(1, scale))})` }}
        >
          <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Take Exam</span>
          <span className="sm:hidden">Exam</span>
        </motion.button>
      )}

      <div className="absolute bottom-4 right-4 px-3 py-1 bg-slate-900/40 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest">
        Page {pageNumber}
      </div>
    </div>
  );
};


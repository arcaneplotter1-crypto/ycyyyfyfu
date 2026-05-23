import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Settings, 
  Sparkles,
  Download,
  AlertCircle,
  X,
  RotateCcw,
  Info,
  Copy,
  Check,
  Search,
  ListTree,
  Upload
} from "lucide-react";

import { copyToClipboard } from "./utils";
import { DocumentPdfExport } from "./DocumentPdf";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import chroma from 'chroma-js';
import { TeacherOverlay } from './PdfMode';
import { generateDocumentHtmlTemplate } from './utils/exportDocumentHtml';

export interface DocumentNode {
  type: "topic" | "header" | "subheader" | "section" | "item" | "paragraph" | "textbox" | "root";
  content: string;
  isListItem?: boolean;
  marker?: string;
  children: DocumentNode[];
  isExpanded?: boolean;
}

export interface DocumentSettings {
  size: number;
  fontFamily: 'sans' | 'serif' | 'mono';
  topicColor: string;
  topicBg: string;
  headerColor: string;
  headerBg: string;
  subheaderColor: string;
  subheaderBg: string;
  sectionColor: string;
  textColor: string;
  tableHeaderBg: string;
  tableHeaderColor: string;
  tableRowBg: string;
  tableBorderColor: string;
  textBoxBorderColor: string;
  textBoxTitleBg: string;
  textBoxTitleColor: string;
  textBoxBg: string;
}

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  size: 1.0,
  fontFamily: 'sans',
  topicColor: '#ffffff',
  topicBg: '#1e1b4b', // Very Deep Indigo/Midnight
  headerColor: '#e0e7ff',
  headerBg: '#312e81', // Deep Indigo
  subheaderColor: '#3730a3', // Rich Indigo text
  subheaderBg: '#e0e7ff', // Soft Indigo background
  sectionColor: '#db2777', // Vibrant Pink for sections
  textColor: '#334155', // Slate 700
  tableHeaderBg: '#f8fafc',
  tableHeaderColor: '#0f172a',
  tableRowBg: '#ffffff',
  tableBorderColor: '#e2e8f0',
  textBoxBorderColor: '#f97316',
  textBoxTitleBg: '#ffedd5',
  textBoxTitleColor: '#ea580c',
  textBoxBg: '#ffffff',
};

const FONT_MAP = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono'
};

const colorMap: Record<string, string> = {
  g: '#10b981',
  r: '#ef4444',
  b: '#3b82f6',
  y: '#eab308',
  p: '#a855f7',
  o: '#f97316',
};

export const processCustomColors = (text: string) => {
  if (!text) return text;
  let processed = text.replace(/\((g|r|b|y|p|o|#[0-9a-fA-F]{3,8})\((.*?)\)\)/g, (match, colorCode, content) => {
    const color = colorMap[colorCode] || colorCode;
    return `<span style="color: ${color}; font-weight: inherit;">${content}</span>`;
  });
  
  processed = processed.replace(/==([grbypo]|#[0-9a-fA-F]{3,8})\((.*?)\)==/g, (match, colorCode, content) => {
    const hColorMap: Record<string, string> = {
      g: '#22c55e', r: '#ef4444', b: '#3b82f6', y: '#fde047', p: '#a855f7', o: '#f97316'
    };
    const c = hColorMap[colorCode] || colorCode;
    return `<mark class="marker-highlight" style="background-image: linear-gradient(104deg, color-mix(in srgb, ${c} 50%, transparent) 0%, color-mix(in srgb, ${c} 90%, transparent) 100%); font-weight: inherit;">${content}</mark>`;
  });

  processed = processed.replace(/==(.*?)==/g, '<mark class="marker-highlight marker-highlight-yellow" style="font-weight: inherit;">$1</mark>');
  processed = processed.replace(/\+\+(.*?)\+\+/g, '<mark class="marker-highlight marker-highlight-green" style="font-weight: inherit;">$1</mark>');
  
  processed = processed.replace(/§§([\s\S]*?)§§/g, (match, inner) => {
    const parts = inner.split("|");
    const word = (parts[0] || '').replace(/"/g, '&quot;');
    const explanation = (parts[1] || '').replace(/"/g, '&quot;');
    const memory = (parts[2] || '').replace(/"/g, '&quot;');
    const quiz = (parts[3] || '').replace(/"/g, '&quot;');
    const expand = parts.slice(4).join("|").replace(/"/g, '&quot;');
    return `<teacher-overlay word="${word}" explanation="${explanation}" memory="${memory}" quiz="${quiz}" expand="${expand}"></teacher-overlay>`;
  });

  return processed;
};



export const DocumentParser = ({
  onGenerate,
}: {
  onGenerate: (data: DocumentNode, settings?: DocumentSettings) => void;
}) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const metadataScript = doc.getElementById('arcane-document-metadata');
        
        if (metadataScript) {
          const { data, settings } = JSON.parse(metadataScript.textContent || '{}');
          if (data) {
            onGenerate(data, settings);
            return;
          }
        }
        setError("This HTML file doesn't seem to contain Arcane Document data.");
      } catch (err) {
        setError("Failed to parse the uploaded file.");
      }
    };
    reader.readAsText(file);
  };

  const aiPrompt = `CRITICAL: Start your response with \`\`\`typescript and end it with \`\`\`.
CRITICAL: You MUST use indentation (actual spaces) to show hierarchy.
- The top level is a TOPIC (no indent).
- A Topic contains HEADERS (2 spaces).
- Headers contain SUB-HEADERS (4 spaces) or Details (6+ spaces).
- You can nest infinitely to show sub-points or paragraphs under items.

Teacher Interactive Block (MANDATORY):
You MUST add the interactive teacher breakdown syntax (§§Word|Explanation|Memory|Quiz|Expand§§) after EVERY major element:
- After every individual list point (-)
- After every paragraph
- After every Fact Box (>)
- After every Table (| col |)
Example: "Photosynthesis is vital. §§Photosynthesis|The process of converting light to energy...|Photo = Light, Synthesis = Creating|F::What is photosynthesis?::The process of converting light to energy.|It occurs primarily in the chloroplasts.§§"

Fact Boxes (> Title):
- Use Fact Boxes to summarize key takeaways. 
- CRITICAL: The line starting with '>' is ONLY the title. All content MUST be indented UNDER it.
Good Example:
    > Summary of Photosynthesis
      Photosynthesis is the process by which plants convert light to energy.
      §§Energy|The capacity to do work...|Energy = Power|M::Main source?::Soil::Sunlight::Water::Air::1|Sunlight is electromagnetic radiation.§§

Tables:
- Use standard Markdown format: | Column 1 | Column 2 |
- Always follow the table with a Teacher breakdown of the main concept in the table.

Structure Example:
Your Main Topic
  Your Section Header
    Sub-Header (e.g. The Respiratory System)
      Detailed explanation of how lungs work...
      §§Lungs|Primary organs for breathing...|Lungs = Airbags|F::Primary organ for breathing?::Lungs|The right lung is larger than the left.§§
      - Point about oxygen exchange §§Oxygen|Vital gas for life...|O2 = Lifeline|M::Symbol for Oxygen?::O::Ox::O2::Oy::2|It makes up about 21% of Earth's atmosphere.§§
      > Summary of Breathing
        Oxygen enters the bloodstream while CO2 exits through the alveoli.
        §§Alveoli|Tiny air sacs in the lungs...|Alveoli = Tiny Bubbles|F::Where does gas exchange happen?::Alveoli|There are millions of alveoli in each lung.§§

Colors: (b(blue)), (r(red)), (g(green)), (y(yellow)), (p(purple)), (o(orange)), (#HEX(color)).
Example: (b(Important text)) or (#ff5733(Custom color))

Highlights:
Use ==highlight== for yellow, ++highlight++ for green, or ==color(highlight)== for custom colors.

Teacher Syntax Detail:
- Format: §§Word|Detailed Explanation|Short Memory Trick|Quiz (F::Q?::A or M::Q?::O1::O2::O3::O4::CI)|Expansion Details§§`;

  const copyPrompt = () => {
    copyToClipboard(aiPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseOutlineText = (rawText: string): DocumentNode => {
    const lines = rawText.split('\n');
    const root: DocumentNode = { type: "root", content: "Document Root", children: [], isExpanded: true };
    const stack: { node: DocumentNode, indent: number }[] = [{ node: root, indent: -1 }];

    let inTable = false;
    let tableNode: DocumentNode | null = null;
    let tableIndent = -1;
    let firstNonEmptyLine = true;

    for (const line of lines) {
      if (!line.trim()) continue;

      const indentMatch = line.match(/^([\s\t]*)/);
      const rawIndent = indentMatch ? indentMatch[1] : '';
      let indent = rawIndent.replace(/\t/g, '  ').length;
      
      let content = line.trim();

      // HEURISTIC: strip out prefixes like "2 spaces: " if the AI hallucinated them
      const spacePrefixMatch = content.match(/^(\d+)\s+spaces?:\s*(.*)/i);
      if (spacePrefixMatch) {
        indent = parseInt(spacePrefixMatch[1], 10);
        content = spacePrefixMatch[2];
      }

      // SMART HEURISTIC: If user provides flat text (0 indent) but uses markers or it's not the first line, 
      // we can often infer hierarchy to avoid flat "all headers" documents.
      if (indent === 0 && !firstNonEmptyLine) {
        if (content.startsWith('-') || content.startsWith('*') || content.startsWith('1)') || content.startsWith('·')) {
          indent = 4; // Assume list items are details
        } else if (content.startsWith('>')) {
          indent = 4; // Assume textboxes are details
        } else {
          indent = 2; // Assume subsequent flat lines are subheaders
        }
      }
      
      if (firstNonEmptyLine) firstNonEmptyLine = false;

      if (content.startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableIndent = indent;
          tableNode = {
            type: "paragraph",
            content: content,
            children: [],
            isExpanded: true
          };

          while (stack.length > 1 && stack[stack.length - 1].indent >= tableIndent) {
            stack.pop();
          }

          if (stack.length > 0) {
            stack[stack.length - 1].node.children.push(tableNode);
          } else {
            root.children.push(tableNode);
          }

          stack.push({ node: tableNode, indent: tableIndent });
        } else {
          if (tableNode) {
            tableNode.content += '\n' + content;
          }
        }
        continue;
      } else {
        inTable = false;
        tableNode = null;
      }

      let isListItem = false;
      let isTextBox = false;
      let marker: string | undefined;

      const markerMatch = content.match(/^([·\-\*]|\d+[\)\.]|[a-zA-Z][\)\.])\s+(.*)/);
      if (content.startsWith('>')) {
        isTextBox = true;
        content = content.substring(1).trim();
      } else if (markerMatch) {
        isListItem = true;
        marker = markerMatch[1];
        content = markerMatch[2];
      }

      const newNode: DocumentNode = { 
        type: isTextBox ? "textbox" : "paragraph", // Temp type
        content, 
        isListItem,
        marker,
        children: [], 
        isExpanded: true 
      };

      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      if (stack.length > 0) {
        stack[stack.length - 1].node.children.push(newNode);
      } else {
        root.children.push(newNode);
      }

      stack.push({ node: newNode, indent });
    }

    const assignTypes = (node: DocumentNode, depth: number, inTextBox: boolean = false) => {
      if (node.type !== "root" && node.type !== "textbox") {
        if (inTextBox) {
          if (node.isListItem) node.type = "item";
          else node.type = "paragraph";
        } else {
          if (depth === 1) {
            node.type = "topic";
          } else if (depth === 2) {
            node.type = "header"; 
          } else if (depth === 3) {
            if (node.children.length > 0) node.type = "subheader";
            else node.type = "paragraph";
          } else if (depth === 4) {
            if (node.children.length > 0) node.type = "section";
            else if (node.isListItem) node.type = "item";
            else node.type = "paragraph";
          } else {
            // Deeper nesting (5+)
            if (node.isListItem) node.type = "item";
            else if (node.children.length > 0) node.type = "section";
            else node.type = "paragraph";
          }
        }
      }
      for (const child of node.children) {
        assignTypes(child, depth + 1, inTextBox || node.type === "textbox");
      }
    };

    assignTypes(root, 0);

    return root;
  };

  const handleGenerate = () => {
    try {
      const doc = parseOutlineText(text);
      if (doc.children.length === 0) {
        setError("Could not parse any hierarchical structure from the text.");
        return;
      }
      onGenerate(doc);
    } catch (e) {
      setError("Failed to parse document outline.");
    }
  };

  const loadSample = () => {
    const sample = `Astro-Musicology: The Final Frontier
  The Celestial Harmony
    Overview of Musical Magic
      - Magic is not cast with wands, but (y(conducted)) like an orchestra. §§Teacher|Astro-Musicology replaces traditional spellcasting with musical conducting...|Conducting = spellcasting, Maestros = wizards.|F::How is magic cast in Astro-Musicology?::It is conducted like an orchestra.|This implies that wands are merely crutches for those who cannot hear the true rhythm of the cosmos.§§
      - All matter vibrates with an inaudible inner song, the ==#f472b6(Anthem of Being)==.
      - Practitioners, known as (r(Maestros)), attune their ==y(personal resonance)==. §§Maestros|Maestros must undergo rigorous ear training...|Maestros tune internal resonance.|M::What are practitioners called?::Wizards::Warlocks::Bards::Maestros::3|Some legendary Maestros are said to control entire weather systems using the ++Symphony of Storms++.§§
    Interactive Syntax Showcases
      - Standard Highlight: ==This is yellow==
      - Secondary Highlight: ++This is green++
      - Custom Blue: ==b(Calming Blue)==
      - Custom Purple: ==p(Royal Purple)==
      - Hex Highlighting: ==#a855f7(Vivid Violet)== and ==#10b981(Emerald Green)==
    Wait, something is in a table:
    | Type | Function | Location |
    |---|---|---|
    | (g(Main)) | Secretion | ==#38bdf8(Orbital Area)== |
    | (b(Palpebral)) | ==p(Accessory)== | ==o(Inferior Zone)== |
  The Lacrimal System Secrets
    Secretory Mechanisms
      > (p(Eyelid Layers Breakdown))
        1) The skin.
        2) The ==o(Subcutaneous areolar tissue)==.
        3) The muscles layer.
        4) ++Submuscular areolar tissue++
    Advanced Topics
      1) \`Meibomian gland\` - (b(Oil secretion))
      2) \`Zeis gland\` - ==r(Sebaceous gland)==`;
    setText(sample);
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-12 px-2 sm:px-4 space-y-6 sm:space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-3 text-center md:text-left">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Document Outline
          </h2>
          <p className="text-indigo-500 font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em]">
            Paste your indented text
          </p>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end gap-2 sm:gap-3">
          <button
            onClick={() => setShowHelp(true)}
            className="flex-1 sm:flex-none px-3 py-2.5 sm:px-6 sm:py-4 bg-indigo-50 dark:bg-indigo-900/20 border-b-4 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[9px] sm:text-xs rounded-xl sm:rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-1.5 sm:gap-3 shadow-sm active:translate-y-1 active:border-b-0"
          >
            <Info className="w-3 h-3 sm:w-4 sm:h-4" /> AI Prompt Guide
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none px-3 py-2.5 sm:px-6 sm:py-4 bg-white dark:bg-slate-900 border-b-4 border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 font-black uppercase text-[9px] sm:text-xs rounded-xl sm:rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 transition-all flex items-center justify-center gap-1.5 sm:gap-3 shadow-sm active:translate-y-1 active:border-b-0"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4" /> Upload HTML
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".html" 
            className="hidden" 
          />
          <button
            onClick={loadSample}
            className="flex-1 sm:flex-none px-3 py-2.5 sm:px-6 sm:py-4 bg-white dark:bg-slate-900 border-b-4 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[9px] sm:text-xs rounded-xl sm:rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5 sm:gap-3 shadow-sm active:translate-y-1 active:border-b-0"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" /> Load Sample Demos
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 rounded-[2rem] sm:rounded-[2.5rem] blur-xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-1 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
          <textarea
            value={text}
            onChange={(e) => {
              const val = e.target.value;
              setText(val);
              setError("");
            }}
            placeholder="Paste your indented text outline here...&#10;e.g.&#10;Topic&#10;  Subtopic&#10;    Item 1&#10;    Item 2"
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
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleGenerate}
          disabled={!text.trim()}
          className="group relative px-8 py-4 sm:px-12 sm:py-6 md:px-16 md:py-8 bg-indigo-600 text-white font-black text-lg sm:text-xl uppercase tracking-tighter rounded-[2rem] shadow-[0_10px_0_var(--color-indigo-900)] hover:shadow-[0_5px_0_var(--color-indigo-900)] hover:translate-y-1 active:shadow-none active:translate-y-2.5 disabled:opacity-50 transition-all flex items-center gap-4"
        >
          GENERATE OUTLINE
          <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-10 max-w-3xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">Formatting Guide</h3>
                <p className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em] mt-1">AI-Ready Instructions</p>
              </div>
              <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <h4 className="text-xs font-black uppercase text-indigo-500 mb-4 tracking-widest">How to format</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Use <span className="text-indigo-600 font-bold">2 spaces</span> for each level. You can nest infinitely for complex topics.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Level 0 (no indent) is the <span className="text-indigo-600 font-bold">Main Topic</span>.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">3</div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Use <span className="text-indigo-600 font-bold">{">"} Header</span> to start a box. Indent lines below it to fill its body.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">4</div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Use <span className="text-indigo-600 font-bold">| column |</span> format for tables.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">5</div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">The AI prompt requests output in a <span className="text-indigo-600 font-bold">```typescript</span> block for easy copying.</p>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none">
                  <h4 className="text-xs font-black uppercase text-indigo-200 mb-4 tracking-widest">AI Prompt</h4>
                  <p className="text-[10px] text-white/80 font-medium mb-4 leading-relaxed">
                    Copy this prompt to use with Gemini or any AI to transform your raw notes into the perfect format for this app.
                  </p>
                  <button 
                    onClick={copyPrompt}
                    className="w-full py-4 bg-white text-indigo-600 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Prompt Copied!" : "Copy AI Prompt"}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative p-6 bg-slate-900 rounded-2xl overflow-hidden group">
                  <div className="absolute top-4 right-4 text-[8px] font-black text-white/20 uppercase tracking-widest">Live Example</div>
                  <pre className="text-[10px] font-mono text-indigo-300 whitespace-pre leading-relaxed">
{`Main Topic Title
  (b(Section Header))
    Sub-Header or Detail
      - Detail point one
      > (g(Box Title))
        Content inside the box!
    | Table | Result |
    |---|---|
    | Data | (g(Success)) |`}
                  </pre>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <h4 className="text-xs font-black uppercase text-indigo-500 mb-3 tracking-widest">Color & Hex Codes</h4>
                  <p className="text-[9px] text-slate-500 mb-3 leading-tight">Use <span className="font-bold">(tag(text))</span> or <span className="font-bold">(#hex(text))</span> for styling.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-blue-500" /> (b(text))
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-red-500" /> (r(text))
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-green-500" /> (g(text))
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-orange-500" /> (o(text))
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 col-span-2 mt-1 px-2 py-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg">
                       <span className="opacity-50 font-mono">Hex:</span> (#ff5733(text))
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
               <button 
                onClick={() => setShowHelp(false)}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
                 Got it, thanks!
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export const DocumentViewer = ({
  documentData,
  initialSettings,
  onBack,
}: {
  documentData: DocumentNode;
  initialSettings?: DocumentSettings;
  onBack: () => void;
}) => {
  const [data, setData] = useState(documentData);
  const [settings, setSettings] = useState<DocumentSettings>(initialSettings || DEFAULT_DOCUMENT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [enableCollapse, setEnableCollapse] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.2 });

    const highlights = document.querySelectorAll('.marker-highlight');
    highlights.forEach(h => observer.observe(h));

    return () => {
      highlights.forEach(h => observer.unobserve(h));
    };
  }, [data]);

  const handleDownloadHtml = () => {
    const htmlContent = generateDocumentHtmlTemplate(data, settings);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-export-${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const applySmartTheme = (section: 'all' | 'topic' | 'header' | 'subheader' | 'section' | 'table' | 'textbox', baseColor: string) => {
    try {
      const c = chroma(baseColor);
      let updates: Partial<DocumentSettings> = {};
      
      const lightBg = c.set('hsl.l', 0.96).hex();
      const lighterBg = c.set('hsl.l', 0.98).hex();
      
      // For stunning, readable text
      const textBase = chroma('#0f172a');
      const topicText = chroma.mix('#ffffff', c, 0.1, 'rgb').hex();
      const headerText = chroma.mix(textBase, c, 0.25, 'rgb').hex();
      const subheaderText = chroma.mix(textBase, c, 0.15, 'rgb').hex();
      const bodyText = chroma.mix(textBase, c, 0.1, 'rgb').hex();

      const border = c.set('hsl.l', 0.85).hex();
      const sectionColor = c.get('hsl.l') > 0.6 ? c.set('hsl.l', 0.45).hex() : c.hex();

      if (section === 'all' || section === 'topic') {
        updates.topicBg = c.set('hsl.l', 0.1).hex();
        updates.topicColor = '#ffffff';
      }
      if (section === 'all' || section === 'header') {
        updates.headerBg = c.set('hsl.l', 0.92).hex();
        updates.headerColor = headerText;
      }
      if (section === 'all' || section === 'subheader') {
        updates.subheaderBg = lightBg;
        updates.subheaderColor = subheaderText;
      }
      if (section === 'all') {
        updates.textColor = bodyText;
      }
      if (section === 'all' || section === 'section') {
        updates.sectionColor = sectionColor;
      }
      if (section === 'all' || section === 'table') {
        updates.tableHeaderBg = c.set('hsl.l', 0.94).hex();
        updates.tableHeaderColor = headerText;
        updates.tableRowBg = lighterBg;
        updates.tableBorderColor = border;
      }
      if (section === 'all' || section === 'textbox') {
        updates.textBoxTitleBg = c.set('hsl.l', 0.94).hex();
        updates.textBoxTitleColor = headerText;
        updates.textBoxBg = lighterBg;
        updates.textBoxBorderColor = c.set('hsl.l', 0.7).hex();
      }

      setSettings(s => ({ ...s, ...updates }));
    } catch (e) {
      // ignore invalid colors
    }
  };

  const markdownComponents = {
    p: ({ children }: any) => <span className="inline-block break-words">{children}</span>,
    h1: ({ children }: any) => <span className="font-extrabold block break-words">{children}</span>,
    h2: ({ children }: any) => <span className="font-bold block break-words">{children}</span>,
    h3: ({ children }: any) => <span className="font-bold block break-words">{children}</span>,
    h4: ({ children }: any) => <span className="font-bold block break-words">{children}</span>,
    h5: ({ children }: any) => <span className="font-bold block break-words">{children}</span>,
    h6: ({ children }: any) => <span className="font-bold block break-words">{children}</span>,
    strong: ({ children }: any) => <span className="font-bold opacity-90">{children}</span>,
    em: ({ children }: any) => <span className="font-bold opacity-80">{children}</span>,
    code: ({ children }: any) => <span className="font-bold opacity-80 bg-transparent text-inherit px-0 whitespace-pre-wrap">{children}</span>,
    table: ({ children }: any) => <div className="overflow-x-auto my-4"><table className="w-full text-left border-collapse min-w-full shadow-sm rounded-lg overflow-hidden border" style={{ borderColor: settings.tableBorderColor }}>{children}</table></div>,
    thead: ({ children }: any) => <thead style={{ backgroundColor: settings.tableHeaderBg }}>{children}</thead>,
    tbody: ({ children }: any) => <tbody style={{ backgroundColor: settings.tableRowBg }}>{children}</tbody>,
    tr: ({ children }: any) => <tr className="transition-colors border-b last:border-b-0 group" style={{ borderColor: settings.tableBorderColor }}>{children}</tr>,
    th: ({ children }: any) => <th className="px-4 py-3 font-semibold uppercase tracking-wider text-sm border-r last:border-r-0" style={{ color: settings.tableHeaderColor, borderColor: settings.tableBorderColor }}>{children}</th>,
    td: ({ children }: any) => <td className="px-4 py-3 whitespace-pre-wrap border-r last:border-r-0" style={{ borderColor: settings.tableBorderColor }}>{children}</td>,
    'teacher-overlay': (props: any) => (
      <TeacherOverlay 
        word={props.word || ""}
        explanation={props.explanation || ""}
        memory={props.memory || ""}
        quiz={props.quiz || ""}
        expand={props.expand || ""}
        theme="indigo"
        pdfTheme="modern"
      />
    ),
  };

  const toggleExpand = (node: DocumentNode, currentData: DocumentNode): DocumentNode => {
    if (currentData === node) {
      return { ...currentData, isExpanded: !currentData.isExpanded };
    }
    return {
      ...currentData,
      children: currentData.children.map(child => toggleExpand(node, child))
    };
  };

  const handleToggle = (node: DocumentNode) => {
    setData(prev => toggleExpand(node, prev));
  };

  const formatContentWithMarker = (node: DocumentNode) => {
    return node.marker ? `${node.marker} ${node.content}` : node.content;
  };

  const renderChildrenWithGrids = (children: DocumentNode[], depth: number, renderNodeFn: any) => {
    let filteredChildren = children;
    if (enableSearch && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      
      const nodeMatches = (node: DocumentNode): boolean => {
        if (node.content.toLowerCase().includes(q)) return true;
        return node.children.some(child => nodeMatches(child));
      };
      
      filteredChildren = children.filter(nodeMatches);
    }

    const groups: (DocumentNode | DocumentNode[])[] = [];
    let currentGrid: DocumentNode[] = [];

    const isGriddable = (node: DocumentNode) => 
      node.content.length < 45 && 
      node.children.length === 0 && 
      (node.type === "item" || node.type === "paragraph");

    for (const child of filteredChildren) {
      if (isGriddable(child)) {
        currentGrid.push(child);
      } else {
        if (currentGrid.length > 0) {
          if (currentGrid.length > 1) {
            groups.push([...currentGrid]);
          } else {
            groups.push(currentGrid[0]);
          }
          currentGrid = [];
        }
        groups.push(child);
      }
    }
    if (currentGrid.length > 0) {
      if (currentGrid.length > 1) groups.push([...currentGrid]);
      else groups.push(currentGrid[0]);
    }

    return groups.map((group, gIdx) => {
      if (Array.isArray(group)) {
        const colCount = group.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 
                         group.length === 3 ? 'sm:grid-cols-3' : 
                         'sm:grid-cols-2';
        return (
          <div key={`grid-${gIdx}`} className={`grid ${colCount} gap-x-8 gap-y-2 mb-4`}>
            {group.map((node, nIdx) => (
              <div key={nIdx} className="h-full">
                {renderNodeFn(node, depth, nIdx)}
              </div>
            ))}
          </div>
        );
      }
      return <div key={`node-${gIdx}`}>{renderNodeFn(group, depth, gIdx)}</div>;
    });
  };

  const renderNode = (node: DocumentNode, depth: number = 0, siblingIndex: number = 0): React.ReactNode => {
    if (node.type === "root") {
      return (
        <div className="relative w-full h-full z-10 pb-12">
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] dark:opacity-[0.02] z-[-1] overflow-hidden">
             <div className="text-[120px] sm:text-[160px] md:text-[220px] font-black tracking-widest text-slate-900 dark:text-white flex items-center justify-center rotate-[-35deg] select-none">
               ARCANE
             </div>
          </div>
          
          <div className="relative z-10 space-y-12">
            {renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        </div>
      );
    }
    
    if (depth === 1 && node.type === "topic") {
      if (enableCollapse && !node.isExpanded) {
        return (
          <div className="mb-4 mt-8 first:mt-0">
             <div 
               onClick={() => handleToggle(node)}
               className="w-full py-4 px-6 flex items-center justify-between cursor-pointer rounded-2xl shadow-md border-2 border-transparent hover:border-white/20 transition-all"
               style={{ backgroundColor: settings.topicBg, color: settings.topicColor }}
             >
               <span className="font-bold text-xl uppercase tracking-wider">{node.content}</span>
               <ChevronRight className="w-6 h-6" />
             </div>
          </div>
        );
      }
      return (
        <div className="mb-12 mt-16 first:mt-0">
          <div 
            onClick={() => enableCollapse && handleToggle(node)}
            className={`w-full py-16 px-8 flex flex-col items-center justify-center relative overflow-hidden rounded-[3rem] shadow-2xl mb-12 border-4 border-white/20 ${enableCollapse ? 'cursor-pointer hover:opacity-90' : ''}`}
            style={{ backgroundColor: settings.topicBg, color: settings.topicColor }}
          >
             {enableCollapse && <ChevronDown className="absolute top-6 right-8 w-8 h-8 opacity-50" />}
             <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{
                  backgroundImage: `linear-gradient(45deg, currentColor 1px, transparent 1px), linear-gradient(-45deg, currentColor 1px, transparent 1px)`,
                  backgroundSize: `40px 40px`
                }}></div>
             </div>
             <div className="relative z-10 text-center max-w-4xl">
               <div className="text-xs font-black uppercase tracking-[0.5em] mb-4 opacity-50">Main Topic</div>
               <div className="text-[3em] sm:text-[4em] md:text-[5.5em] font-black tracking-tighter leading-none italic uppercase">
                  <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {processCustomColors(node.content)}
                  </ReactMarkdown>
               </div>
             </div>
          </div>
          <div className="space-y-12">
            {renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        </div>
      );
    }

    if (depth === 2 && node.type === "header") {
      if (enableCollapse && !node.isExpanded) {
        return (
          <div className="mb-4">
             <div 
               onClick={() => handleToggle(node)}
               className="w-full py-3 px-6 flex items-center justify-between cursor-pointer rounded-xl md:rounded-2xl shadow-sm border-transparent hover:opacity-90 transition-all"
               style={{ backgroundColor: settings.headerBg, color: settings.headerColor }}
             >
               <span className="font-bold text-lg tracking-wide">{node.content}</span>
               <ChevronRight className="w-5 h-5" />
             </div>
          </div>
        );
      }
      return (
        <div className="mb-10">
          <div 
            onClick={() => enableCollapse && handleToggle(node)}
            className={`w-full text-center py-4 md:py-6 px-4 font-extrabold flex flex-col items-center justify-center relative overflow-hidden text-[2em] sm:text-[2.5em] md:text-[3.5em] tracking-tight shadow-md mb-8 rounded-xl md:rounded-2xl mx-1 ${enableCollapse ? 'cursor-pointer hover:opacity-95' : ''}`}
            style={{ backgroundColor: settings.headerBg, color: settings.headerColor }}
          >
            {enableCollapse && <ChevronDown className="absolute top-4 right-6 w-6 h-6 opacity-40 pointer-events-none" />}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.12] dark:opacity-[0.2]">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 2px, transparent 0)`,
                backgroundSize: `24px 24px`,
                backgroundPosition: `center`
              }}></div>
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.15]">
               <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,100 C30,50 70,150 100,0 L100,100 Z" fill="currentColor" />
               </svg>
            </div>
            <div className="relative z-10 w-full px-4 sm:px-16 max-w-5xl mx-auto">
              <ReactMarkdown 
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {processCustomColors(formatContentWithMarker(node))}
              </ReactMarkdown>
            </div>
          </div>
          <div className="space-y-8">
            {renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        </div>
      );
    }

    if (depth === 3 && node.type === "subheader") {
      if (enableCollapse && !node.isExpanded) {
        return (
          <div className="mb-3">
             <div 
               onClick={() => handleToggle(node)}
               className="w-full py-2 px-6 flex items-center justify-between cursor-pointer rounded-lg shadow-sm hover:opacity-90 transition-all"
               style={{ backgroundColor: settings.subheaderBg, color: settings.subheaderColor }}
             >
               <span className="font-bold text-md">{node.content}</span>
               <ChevronRight className="w-5 h-5" />
             </div>
          </div>
        );
      }
      return (
        <div className="mb-8">
          <div 
            onClick={() => enableCollapse && handleToggle(node)}
            className={`w-full relative overflow-hidden py-3 px-6 font-extrabold text-[1.5em] md:text-[2.25em] mb-6 shadow-sm border-l-4 border-r-4 border-transparent flex items-center justify-center gap-2 ${enableCollapse ? 'cursor-pointer hover:opacity-90' : 'text-center'}`}
            style={{ backgroundColor: settings.subheaderBg, color: settings.subheaderColor }}
          >
            {enableCollapse && <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none"><ChevronDown className="w-6 h-6" /></div>}
            <svg className="absolute left-0 bottom-0 h-full w-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,100 C20,80 40,120 60,80 C80,40 100,80 100,100 L0,100 Z" fill="currentColor"/>
            </svg>
            <div className="relative z-10 w-full">
              <ReactMarkdown 
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {processCustomColors(formatContentWithMarker(node))}
              </ReactMarkdown>
            </div>
          </div>
          <div className="space-y-6 px-4 md:px-8">
            {renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        </div>
      );
    }

    if (node.type === "textbox") {
      return (
        <div 
          className={`mb-6 mt-8 p-5 ${node.content ? 'pt-0' : ''} rounded-3xl border-2 border-dashed shadow-sm relative`}
          style={{ borderColor: settings.textBoxBorderColor, backgroundColor: settings.textBoxBg }}
        >
          {node.content && (
            <div className="flex justify-center -mt-5 mb-4">
              <div 
                className="px-5 py-1 mx-4 font-bold rounded-xl shadow-sm border text-center break-words max-w-full" 
                style={{ 
                  backgroundColor: settings.textBoxTitleBg, 
                  color: settings.textBoxTitleColor, 
                  borderColor: settings.textBoxBorderColor,
                  fontSize: `max(1.125em, 16px)`
                }}
              >
                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {processCustomColors(node.content)}
                </ReactMarkdown>
              </div>
            </div>
          )}
           
          <div className="w-full">
            {renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        </div>
      );
    }

    if (node.type === "section") {
      const hasMarker = !!node.marker;
      if (enableCollapse && !node.isExpanded) {
        return (
          <div className="mb-3 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
             <div 
               onClick={() => handleToggle(node)}
               className="flex items-center gap-3 cursor-pointer hover:opacity-75 transition-opacity"
               style={{ color: settings.sectionColor }}
             >
               <ChevronRight className="w-4 h-4 shrink-0" />
               {node.marker && <span className="font-bold">{node.marker}</span>}
               <span className="font-bold text-lg leading-snug">{node.content}</span>
             </div>
          </div>
        );
      }
      return (
        <div className="mb-6 mt-4 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
          <div 
            onClick={() => enableCollapse && handleToggle(node)}
            className={`flex items-start gap-3 font-bold text-[1.25em] md:text-[1.875em] mb-4 ${!hasMarker ? "underline decoration-[2.5px] underline-offset-[6px]" : ""} ${enableCollapse ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            style={{ color: settings.sectionColor }}
          >
            {enableCollapse && <ChevronDown className="w-5 h-5 shrink-0 mt-1.5 opacity-60" />}
            {node.marker && <span>{node.marker}</span>}
            <div className="flex-1 leading-snug">
              <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{processCustomColors(node.content)}</ReactMarkdown>
            </div>
          </div>
          <div className="space-y-4 pl-2 md:pl-4">
            {renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        </div>
      );
    }

    if (node.type === "paragraph") {
      return (
        <div className="mb-4 last:mb-0">
          <div 
            className={`text-[1.125em] md:text-[1.25em] leading-relaxed font-medium mb-1`}
            style={{ color: settings.textColor }}
          >
             <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{processCustomColors(node.content)}</ReactMarkdown>
          </div>
          {node.children.length > 0 && (
            <div className="space-y-4 pl-4 md:pl-6 border-l border-slate-100 dark:border-slate-800/50 mt-4 pb-2">
              {renderChildrenWithGrids(node.children, depth + 1, renderNode)}
            </div>
          )}
        </div>
      );
    }

    if (node.type === "item") {
      const isDeeper = depth >= 6;
      const markerText = node.marker ? node.marker : (isDeeper ? '·' : `${siblingIndex + 1})`);
      return (
        <div className="mb-4 last:mb-0">
          <div 
            className={`flex items-start gap-4 text-[1.125em] md:text-[1.5em]`}
            style={{ color: settings.textColor }}
          >
             <span 
               className="font-bold shrink-0 select-none mt-[0.1rem] min-w-[1.5rem]"
               style={{ color: settings.sectionColor }}
             >
               {markerText}
             </span>
             <span className="flex-1 font-semibold leading-snug">
               <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{processCustomColors(node.content)}</ReactMarkdown>
             </span>
          </div>
          {node.children.length > 0 && (
            <div className="space-y-4 pl-6 md:pl-8 mt-4">
              {renderChildrenWithGrids(node.children, depth + 1, renderNode)}
            </div>
          )}
        </div>
      );
    }

    // Fallback for any other type, should not be reached normally
    return (
      <div className="mb-3">
        <div className={`flex items-start gap-3 text-[1.125em] md:text-[1.25em]`}>
           <span className="shrink-0 mt-[0.6rem] w-2 h-2 rounded-full" style={{ backgroundColor: settings.textColor, opacity: 0.5 }} />
           <span className="flex-1 leading-relaxed" style={{ color: settings.textColor }}>
             <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{processCustomColors(node.content)}</ReactMarkdown>
           </span>
        </div>
        {node.children.length > 0 && (
          <div className="space-y-2 pl-6 md:pl-8 mt-2">
            {renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 flex flex-col min-h-screen">
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl z-50 py-4 -mx-4 px-4 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <div 
            onClick={onBack}
            className="flex items-center gap-3 cursor-pointer group transition-all shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none group-hover:rotate-12 transition-transform duration-300">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex flex-col hidden xs:flex">
              <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-500 leading-none mb-1">
                Arcane
              </h2>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none uppercase italic">
                PDFs
              </h1>
            </div>
          </div>

          <div className="h-8 w-[2px] bg-slate-200 dark:bg-slate-800 hidden xs:block" />

          <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate min-w-0">
            {data.content}
          </h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 ml-4">
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => {
                setEnableSearch(!enableSearch);
                if (enableSearch) setSearchQuery("");
              }}
              className={`p-2.5 rounded-xl border text-sm font-bold flex items-center justify-center transition-all ${
                enableSearch 
                  ? 'bg-indigo-500 border-indigo-600 text-white shadow-md scale-105' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setEnableCollapse(!enableCollapse);
              }}
              className={`p-2.5 rounded-xl border text-sm font-bold flex items-center justify-center transition-all ${
                enableCollapse 
                  ? 'bg-indigo-500 border-indigo-600 text-white shadow-md scale-105' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title="Toggle Collapsible Sections"
            >
              <ListTree className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-400 shadow-lg shadow-indigo-200 dark:shadow-none transition-all group"
          >
            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            <span className="hidden xs:block">Menu & Settings</span>
          </button>
        </div>
      </div>

      {enableSearch && (
        <div className="w-full max-w-2xl mx-auto mb-6 transform transition-all">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
            <input 
              type="text"
              placeholder="Search document content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-900/50 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl outline-none shadow-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors font-medium text-lg"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex justify-center pb-32">
        <div 
          className={`bg-white dark:bg-[var(--color-slate-900)] w-full rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100/50 dark:border-slate-800/50 overflow-hidden ${FONT_MAP[settings.fontFamily]}`}
          style={{ fontSize: `${settings.size}rem` }}
        >
          <div className="p-8 sm:p-12 md:p-20 selection:bg-indigo-200 selection:text-indigo-900">
            {renderNode(data, 0)}
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg h-full bg-slate-50 dark:bg-slate-900 shadow-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Document Menu</h3>
                <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-widest mt-0.5">Customize & Export</p>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group active:scale-90"
              >
                <X className="w-6 h-6 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-10">
              {/* Quick Actions */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadHtml}
                    className="flex flex-col items-start gap-4 p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group shadow-sm"
                  >
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <Download className="w-6 h-6 lowercase" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-xs uppercase tracking-tight text-slate-900 dark:text-white">Export HTML</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Interactive standalone file</p>
                    </div>
                  </button>
                  <div className="flex">
                     <DocumentPdfExport rootNode={data} themeColor="indigo" customTrigger={(onClick) => (
                       <button
                        onClick={onClick}
                        className="flex-1 flex flex-col items-start gap-4 p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group shadow-sm"
                      >
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-xs uppercase tracking-tight text-slate-900 dark:text-white">Export PDF</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Static document format</p>
                        </div>
                      </button>
                     )} />
                  </div>
                </div>

                <div className="sm:hidden grid grid-cols-2 gap-3">
                    <button
                        onClick={() => {
                            setEnableSearch(!enableSearch);
                            if (enableSearch) setSearchQuery("");
                        }}
                        className={`flex flex-col items-center gap-2 p-4 border-2 rounded-2xl transition-all ${
                            enableSearch 
                            ? 'bg-indigo-500 border-indigo-600 text-white' 
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                    >
                        <Search className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase">Search</span>
                    </button>
                    <button
                        onClick={() => setEnableCollapse(!enableCollapse)}
                        className={`flex flex-col items-center gap-2 p-4 border-2 rounded-2xl transition-all ${
                            enableCollapse 
                            ? 'bg-indigo-500 border-indigo-600 text-white' 
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                    >
                        <ListTree className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase">Collapse</span>
                    </button>
                </div>

                <button
                  onClick={onBack}
                  className="w-full flex items-center justify-between p-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:opacity-90 transition-all font-black uppercase tracking-widest text-sm shadow-xl"
                >
                  Create New Layout
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Typography Section */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Typography & Size</h4>
                
                {/* Size */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <label className="text-sm font-black uppercase text-slate-900 dark:text-white">Base Scaling</label>
                    <span className="text-sm font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                      {settings.size.toFixed(1)}x
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.1" 
                    value={settings.size} 
                    onChange={(e) => setSettings({...settings, size: parseFloat(e.target.value)})}
                    className="w-full h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 px-1">
                    <span>Micro</span>
                    <span>Compact</span>
                    <span>Standard</span>
                    <span>Zoom</span>
                  </div>
                </div>

                {/* Font Family */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <label className="block text-sm font-black uppercase text-slate-900 dark:text-white mb-6">Font Family Selection</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['sans', 'serif', 'mono'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setSettings({...settings, fontFamily: s})}
                        className={`py-4 rounded-xl font-black text-xs transition-all border-2 ${
                            settings.fontFamily === s 
                            ? 'bg-indigo-500 border-indigo-600 text-white shadow-lg scale-[1.02]' 
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-200'
                        } ${FONT_MAP[s]}`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Theme & Colors */}
              <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Adaptive Theme System</h4>
                
                {/* Global Theme Auto-Generator */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-inner">
                                <Sparkles className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <h5 className="font-black text-sm text-slate-900 dark:text-white uppercase leading-tight">Theme Engine</h5>
                                <p className="text-[10px] text-slate-500 font-medium">Re-skin the entire document</p>
                            </div>
                         </div>
                         <div className="relative">
                            <input 
                                type="color" 
                                onChange={(e) => applySmartTheme('all', e.target.value)} 
                                className="w-14 h-14 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-900 border-4 border-white dark:border-slate-700 shadow-xl p-0.5" 
                                defaultValue="#6366f1" 
                            />
                         </div>
                    </div>
                </div>

                {/* Granular Color Controls */}
                <div className="space-y-4">
                    {[
                        { label: 'Topic Style', key: 'topic', title: 'topicBg', text: 'topicColor' },
                        { label: 'Header Style', key: 'header', title: 'headerBg', text: 'headerColor' },
                        { label: 'Subheader Style', key: 'subheader', title: 'subheaderBg', text: 'subheaderColor' },
                        { label: 'Section Accents', key: 'section', title: 'sectionColor', text: 'textColor' },
                    ].map((item) => (
                        <div key={item.key} className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4 transition-all hover:shadow-md">
                            <div className="flex justify-between items-center">
                                <h6 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-widest">{item.label}</h6>
                                <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <span className="text-[8px] font-black text-slate-400 uppercase">Magic</span>
                                    <input 
                                        type="color" 
                                        onChange={(e) => applySmartTheme(item.key as any, e.target.value)} 
                                        className="w-4 h-4 rounded-sm cursor-pointer p-0 border-0 bg-transparent" 
                                        defaultValue="#6366f1" 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Primary</span>
                                    <div className="flex items-center gap-2 group">
                                        <input 
                                            type="color" 
                                            value={(settings as any)[item.title]} 
                                            onChange={(e) => setSettings({...settings, [item.title]: e.target.value})} 
                                            className="w-10 h-10 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900 border-2 border-white dark:border-slate-700 p-0.5" 
                                        />
                                        <span className="text-[10px] font-mono text-slate-400">{(settings as any)[item.title]}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Text/Accent</span>
                                    <div className="flex items-center gap-2 group">
                                        <input 
                                            type="color" 
                                            value={(settings as any)[item.text]} 
                                            onChange={(e) => setSettings({...settings, [item.text]: e.target.value})} 
                                            className="w-10 h-10 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900 border-2 border-white dark:border-slate-700 p-0.5" 
                                        />
                                        <span className="text-[10px] font-mono text-slate-400">{(settings as any)[item.text]}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest shadow-[0_8px_0_var(--color-indigo-900)] hover:shadow-[0_4px_0_var(--color-indigo-900)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none transition-all"
                >
                  Save & Return
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

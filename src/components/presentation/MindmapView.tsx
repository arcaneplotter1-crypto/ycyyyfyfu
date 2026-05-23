import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitMerge, 
  Trash2, 
  Upload, 
  Download, 
  ChevronLeft, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw,
  Palette,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  LayoutTemplate,
  Play,
  Image as ImageIcon,
  FileText,
  Settings,
  Sliders,
  Info,
  X
} from 'lucide-react';
import { copyToClipboard } from '../../utils';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';

// --- Types ---
interface MindmapNode {
  title: string;
  side?: 'left' | 'right';
  className?: string;
  children?: MindmapNode[];
}

interface MindmapData {
  title: string;
  branches: {
    id: string;
    title: string;
    color: string;
    side?: 'left' | 'right';
    children?: MindmapNode[];
  }[];
}

interface MeasuredCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MindmapViewProps {
  onClose: () => void;
  onStateChange?: (state: 'parser' | 'map') => void;
}

// --- Sample Datasets ---
const REPLICATION_VS_TRANSCRIPTION_SAMPLE: MindmapData = {
  title: "Differences Between\nReplication and\nTranscription",
  branches: [
    {
      id: "b1",
      title: "1. 🎯 Purpose / Goal",
      color: "#ef4444",
      side: "right",
      children: [
        { title: "Replication: Duplicate the entire genome for cell division." },
        { title: "Transcription: Synthesize specific RNA sequences needed for protein production (or functional RNA)." }
      ]
    },
    {
      id: "b2",
      title: "2. ⚙️ Enzyme Used",
      color: "#f59e0b",
      side: "right",
      children: [
        { title: "Replication: DNA Polymerase (DNA-dependent DNA polymerase)." },
        { title: "Transcription: RNA Polymerase (DNA-dependent RNA polymerase)." }
      ]
    },
    {
      id: "b3",
      title: "3. 🧬 Template & Product",
      color: "#10b981",
      side: "right",
      children: [
        {
          title: "Replication",
          children: [
            { title: "Template: Both strands of DNA (whole chromosome)." },
            { title: "Product: Double-stranded DNA (dsDNA)." }
          ]
        },
        {
          title: "Transcription",
          children: [
            { title: "Template: One strand (Template/Antisense strand) of a specific gene." },
            { title: "Product: Single-stranded RNA (mRNA, tRNA, rRNA)." }
          ]
        }
      ]
    },
    {
      id: "b4",
      title: "4. 🧱 Building Blocks",
      color: "#3b82f6",
      side: "right",
      children: [
        { title: "Replication: dNTPs (deoxyribonucleotides: dATP, dGTP, dCTP, dTTP)." },
        { title: "Transcription: NTPs (ribonucleotides: ATP, GTP, CTP, UTP)." }
      ]
    },
    {
      id: "b5",
      title: "5. 🔗 Initiation Request",
      color: "#a855f7",
      side: "right",
      children: [
        { title: "Replication: Requires an RNA Primer (Primase) to start adding nucleotides." },
        { title: "Transcription: No Primer Needed. RNA Polymerase can start synthesis de novo." }
      ]
    },
    {
      id: "b6",
      title: "6. 🧬 Base Pairing Rules",
      color: "#ef4444",
      side: "left",
      children: [
        { title: "Replication: A-T, G-C." },
        { title: "Transcription: A-U, T-A, G-C. (Uracil replaces Thymine)." }
      ]
    },
    {
      id: "b7",
      title: "7. 🛑 Processivity & Termination",
      color: "#f59e0b",
      side: "left",
      children: [
        { title: "Replication: Continuous until end of chromosome or meets another fork." },
        { title: "Transcription: Stops at specific Termination Signals (e.g., Hairpin loop in prokaryotes, Poly-A signal in eukaryotes)." }
      ]
    },
    {
      id: "b8",
      title: "8. ✅ Proofreading & Fidelity",
      color: "#10b981",
      side: "left",
      children: [
        { title: "Replication: High Fidelity (Has proofreading 3' -> 5' exonuclease activity). Mistakes lead to mutations." },
        { title: "Transcription: Lower Fidelity (No proofreading). Mistakes are temporary; multiple RNA copies are made and degraded." }
      ]
    },
    {
      id: "b9",
      title: "9. 📦 Fate of Product",
      color: "#3b82f6",
      side: "left",
      children: [
        { title: "Replication: Product is permanent. Remains in the nucleus. One copy goes to daughter cell." },
        { title: "Transcription: Product is transient. Most RNA leaves the nucleus to cytoplasm and is eventually degraded." }
      ]
    }
  ]
};

const WEB_DEV_STACK_SAMPLE: MindmapData = {
  title: "Modern Fullstack\nWeb Stack",
  branches: [
    {
      id: "w1",
      title: "💻 Frontend Layer",
      color: "#3b82f6",
      side: "right",
      children: [
        {
          title: "Frameworks",
          children: [
            { title: "React (Vite/Next.js) - Component-driven, massive ecosystem." },
            { title: "Vue (Nuxt.js) - Progressive, highly approachable." }
          ]
        },
        {
          title: "Styles",
          children: [
            { title: "Tailwind CSS - Utility-first styling framework." },
            { title: "Framer Motion - Fluid animations and layouts." }
          ]
        }
      ]
    },
    {
      id: "w2",
      title: "🔧 Backend Core",
      color: "#10b981",
      side: "right",
      children: [
        { title: "Node.js (Express/NestJS) - Fast, Javascript unified stack." },
        { title: "Python (FastAPI/Django) - Perfect for data-heavy and rapid API development." }
      ]
    },
    {
      id: "w3",
      title: "📂 Database System",
      color: "#f59e0b",
      side: "left",
      children: [
        {
          title: "Relational",
          children: [
            { title: "PostgreSQL - Robust, supports JSON querying." },
            { title: "MySQL - Enterprise-grade, highly reliable." }
          ]
        },
        {
          title: "NoSQL / Cache",
          children: [
            { title: "MongoDB - Document store, flexible JSON schema." },
            { title: "Redis - High speed caching and session token store." }
          ]
        }
      ]
    },
    {
      id: "w4",
      title: "🚀 DevOps & Hosting",
      color: "#eca1a6",
      side: "left",
      children: [
        { title: "Containers: Docker - Standardizing environments everywhere." },
        { title: "Clouds: Google Cloud Platform & AWS - Limitless serverless scaling." }
      ]
    }
  ]
};

const PRODUCTIVITY_STUDY_SAMPLE: MindmapData = {
  title: "Aesthetic Study\nWorkflows",
  branches: [
    {
      id: "s1",
      title: "🧠 Active Recall",
      color: "#a855f7",
      side: "right",
      children: [
        { title: "Flashcards: Self-testing beats highlighting." },
        { title: "Feynman Technique: Teach it to a child to find gaps." }
      ]
    },
    {
      id: "s2",
      title: "📆 Spaced Repetition",
      color: "#ec4899",
      side: "right",
      children: [
        { title: "Leitner Box - Reviewing harder items more frequently." },
        { title: "Anki Algorithms - Automatic interval spacing." }
      ]
    },
    {
      id: "s3",
      title: "⏱️ Time Isolation",
      color: "#ef4444",
      side: "left",
      children: [
        { title: "Pomodoro: 25-minute deep focus, 5-minute break cycles." },
        { title: "Time boxing: Reserving specific slots in calendar only for study." }
      ]
    },
    {
      id: "s4",
      title: "📝 Organization",
      color: "#10b981",
      side: "left",
      children: [
        { title: "Mind Mapping - Visualizing structural and causal boundaries." },
        { title: "Zettelkasten - Connecting unrelated notes via semantic links." }
      ]
    }
  ]
};

export const MindmapView: React.FC<MindmapViewProps> = ({ onClose, onStateChange }) => {
  const [viewState, setViewState] = useState<'parser' | 'map'>('parser');
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<MindmapData | null>(null);
  const [errorLine, setErrorLine] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (onStateChange) {
      onStateChange(viewState);
    }
  }, [viewState, onStateChange]);

  // Canvas interaction states (synchronized with D3 zoom)
  const [scale, setScale] = useState(0.85);
  const scaleRef = useRef(0.85);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  // Keep scale ref up to date to prevent stale closure during drag sessions
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Individual node drag offsets (D3 drag state)
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, { x: number; y: number }>>({});

  // Physics animation states
  const [usePhysics, setUsePhysics] = useState(false);
  const [physicsPositions, setPhysicsPositions] = useState<Record<string, { x: number; y: number }>>({});
  const usePhysicsRef = useRef(false);
  const simRef = useRef<any>(null);

  // Keep usePhysics ref up to date to prevent stale closures
  useEffect(() => {
    usePhysicsRef.current = usePhysics;
  }, [usePhysics]);

  // Node customization options
  const [nodeStyle, setNodeStyle] = useState<'glass' | 'brutalist' | 'neon' | 'warm' | 'cyberpunk' | 'academic' | 'terminal'>('glass');
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'neon-glow'>('solid');
  const [nodePadding, setNodePadding] = useState<'compact' | 'spacious'>('spacious');
  const [layoutPattern, setLayoutPattern] = useState<'dual' | 'right' | 'left' | 'staggered' | 'compact-flow' | 'asymmetric-right'>('dual');
  const [connectorType, setConnectorType] = useState<'bezier' | 'orthogonal' | 'straight'>('bezier');
  const [textSize, setTextSize] = useState<number>(1.0); // 1.0 = 100% text scale factor
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'style' | 'view' | 'export'>('style');
  const [showHelp, setShowHelp] = useState(false);
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<any>(null);

  // Bind D3 drag behavior to nodes exactly once
  const bindDrag = (element: HTMLElement, nodeId: string) => {
    if (element.dataset.dragBound === 'true') return;
    element.dataset.dragBound = 'true';

    d3.select(element).call(
      d3.drag<HTMLElement, any>()
        .on('start', function(event) {
          event.sourceEvent.stopPropagation();
          d3.select(this).raise();
          if (usePhysicsRef.current && simRef.current) {
            const simNode = simRef.current.nodes().find((n: any) => n.id === nodeId);
            if (simNode) {
              simNode.fx = simNode.x;
              simNode.fy = simNode.y;
            }
            simRef.current.alphaTarget(0.3).restart();
          }
        })
        .on('drag', function(event) {
          event.sourceEvent.stopPropagation();
          // Adjust drag speed based on zoom scale for visual parity
          const currentScale = scaleRef.current || 0.85;
          const dx = event.dx / currentScale;
          const dy = event.dy / currentScale;

          if (usePhysicsRef.current && simRef.current) {
            const simNode = simRef.current.nodes().find((n: any) => n.id === nodeId);
            if (simNode) {
              simNode.fx = (simNode.fx ?? simNode.x) + dx;
              simNode.fy = (simNode.fy ?? simNode.y) + dy;
            }
          } else {
            setNodeOffsets(prev => {
              const cur = prev[nodeId] || { x: 0, y: 0 };
              return {
                ...prev,
                [nodeId]: {
                  x: cur.x + dx,
                  y: cur.y + dy
                }
              };
            });
          }
        })
        .on('end', function(event) {
          event.sourceEvent.stopPropagation();
          if (usePhysicsRef.current && simRef.current) {
            const simNode = simRef.current.nodes().find((n: any) => n.id === nodeId);
            if (simNode) {
              simNode.fx = null;
              simNode.fy = null;
            }
            simRef.current.alphaTarget(0);
          }
        })
    );
  };

  // Load a mindmap sample
  const handleLoadSample = (sample: MindmapData) => {
    setInputText(JSON.stringify(sample, null, 2));
    setErrorLine('');
  };

  const handleLoadSampleCycle = () => {
    const samples = [REPLICATION_VS_TRANSCRIPTION_SAMPLE, WEB_DEV_STACK_SAMPLE, PRODUCTIVITY_STUDY_SAMPLE];
    const sample = samples[currentSampleIndex];
    setInputText(JSON.stringify(sample, null, 2));
    setCurrentSampleIndex((prev) => (prev + 1) % samples.length);
    setErrorLine('');
  };

  // Safe markdown line translation
  const cleanMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/<span.*?>(.*?)<\/span>/gi, '$1')
      .replace(/<mark.*?>(.*?)<\/mark>/gi, '$1');
  };

  // General intelligent text parser for JSON or CSV
  const handleParse = () => {
    setErrorLine('');
    const textTrimmed = inputText.trim();
    if (!textTrimmed) {
      setErrorLine('Pasted text is empty. Load a sample or type some JSON/CSV.');
      return;
    }

    try {
      if (textTrimmed.startsWith('{') || textTrimmed.startsWith('[')) {
        // --- JSON Parsing ---
        const parsedObj = JSON.parse(textTrimmed);
        
        // Match expected format or convert
        if (parsedObj.title && Array.isArray(parsedObj.branches)) {
          setParsedData(parsedObj as MindmapData);
        } else if (Array.isArray(parsedObj)) {
          // If a list of slides is provided, parse it as a Mindmap!
          const branches = parsedObj.map((slide: any, index: number) => {
            const slideTitle = slide.title || slide.question || `Slide ${index + 1}`;
            const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6"];
            
            // Collect any bullet items or contents
            const children: MindmapNode[] = [];
            if (Array.isArray(slide.bullets)) {
              slide.bullets.forEach((b: string) => children.push({ title: cleanMarkdown(b) }));
            } else if (Array.isArray(slide.items)) {
              slide.items.forEach((it: any) => {
                if (typeof it === 'string') children.push({ title: cleanMarkdown(it) });
                else if (it && typeof it === 'object') {
                  const label = it.label || it.title || '';
                  const desc = it.description || '';
                  children.push({ 
                    title: label,
                    children: desc ? [{ title: cleanMarkdown(desc) }] : undefined
                  });
                }
              });
            } else if (slide.content) {
              children.push({ title: cleanMarkdown(slide.content) });
            } else if (slide.textContent) {
              children.push({ title: cleanMarkdown(slide.textContent) });
            }

            return {
              id: `b-${index}-${Date.now()}`,
              title: cleanMarkdown(slideTitle),
              color: colors[index % colors.length],
              children: children.length > 0 ? children : undefined
            };
          });

          setParsedData({
            title: "Pasted Presentation\nStructure",
            branches
          });
        } else {
          throw new Error("JSON doesn't match standard Presentation List or Mindmap root schema.");
        }

        setViewState('map');
        setCollapsedNodes(new Set());
        setNodeOffsets({});
      } else {
        // --- CSV Parsing ---
        const lines = textTrimmed.split('\n').filter(l => l.trim() !== '');
        if (lines.length < 1) {
          throw new Error("CSV has no content lines.");
        }

        // Simple tokenizer for CSV quotes
        const tokenizeCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let insideQuote = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = tokenizeCSVLine(lines[0]);
        const records: string[][] = [];
        for (let i = 1; i < lines.length; i++) {
          records.push(tokenizeCSVLine(lines[i]));
        }

        // Organize flat CSV records into a mindmap tree
        // Format: Column 1 is Topic/Branch, Column 2 is Child/Leaf, Column 3 is Sub-child (optional)
        const branchesMap: Record<string, { title: string; children: Record<string, MindmapNode> }> = {};
        let mainTitle = "CSV Mindmap";

        records.forEach((row) => {
          if (row.length === 0) return;
          const branchVal = row[0] || '';
          const leafVal = row[1] || '';
          const detailVal = row[2] || '';

          if (!branchVal) return;

          if (!branchesMap[branchVal]) {
            branchesMap[branchVal] = {
              title: branchVal,
              children: {}
            };
          }

          if (leafVal) {
            if (!branchesMap[branchVal].children[leafVal]) {
              branchesMap[branchVal].children[leafVal] = {
                title: leafVal,
                children: []
              };
            }
            if (detailVal) {
              branchesMap[branchVal].children[leafVal].children?.push({
                title: detailVal
              });
            }
          }
        });

        const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6"];
        const branches = Object.keys(branchesMap).map((key, index) => {
          const entry = branchesMap[key];
          const childrenList = Object.keys(entry.children).map(leafKey => {
            const leafObj = entry.children[leafKey];
            return {
              title: leafObj.title,
              children: leafObj.children && leafObj.children.length > 0 ? leafObj.children : undefined
            };
          });

          return {
            id: `b-csv-${index}-${Date.now()}`,
            title: entry.title,
            color: colors[index % colors.length],
            children: childrenList.length > 0 ? childrenList : undefined
          };
        });

        setParsedData({
          title: mainTitle,
          branches
        });

        setViewState('map');
        setCollapsedNodes(new Set());
        setNodeOffsets({});
      }
    } catch (err: any) {
      setErrorLine(`Parsing failed: ${err.message}`);
    }
  };

  const handleCopyCode = () => {
    const prompt = `I need you to generate a Mindmap JSON with this exact schema:
{
  "title": "Central Topic Name",
  "branches": [
    {
      "id": "b1",
      "title": "Branch Name",
      "color": "#ef4444",
      "side": "right",
      "children": [
        { 
          "title": "Sub-branch or leaf text",
          "children": [
            { "title": "Deeper detail nodes" }
          ]
        }
      ]
    }
  ]
}
Please output ONLY the JSON array inside code coordinates block.`;
    copyToClipboard(prompt);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const getExportOptions = (effectiveScale: number = 1) => {
    const isDark = document.documentElement.classList.contains('dark');
    
    // Dynamically calculate pixel ratio. If the user is zoomed out (scale < 1)
    // we increase the resolution multiplier so the exported image remains crisp
    // and doesn't get pixelated when zooming. Max out at 8 to avoid crashing.
    const effectivePixelRatio = Math.min(8, Math.max(3, 4 / effectiveScale));

    // Get exact background color based on current node theme style and theme mode (dark/light)
    let bgColor = '#f8fafc';
    if (isDark) {
      switch (nodeStyle) {
        case 'brutalist':
          bgColor = '#121214';
          break;
        case 'neon':
          bgColor = '#010203';
          break;
        case 'warm':
          bgColor = '#14100c';
          break;
        case 'cyberpunk':
          bgColor = '#030107';
          break;
        case 'academic':
          bgColor = '#0f0d0b';
          break;
        case 'terminal':
          bgColor = '#000000';
          break;
        case 'glass':
        default:
          bgColor = '#090d16';
          break;
      }
    } else {
      switch (nodeStyle) {
        case 'brutalist':
          bgColor = '#fbfcfa';
          break;
        case 'neon':
          bgColor = '#020205';
          break;
        case 'warm':
          bgColor = '#faf8f3';
          break;
        case 'cyberpunk':
          bgColor = '#05020c';
          break;
        case 'academic':
          bgColor = '#fdfaf2';
          break;
        case 'terminal':
          bgColor = '#010401';
          break;
        case 'glass':
        default:
          bgColor = '#f8fafc';
          break;
      }
    }

    return { 
      cacheBust: true, 
      backgroundColor: bgColor,
      pixelRatio: effectivePixelRatio,
      style: {
        textRendering: 'geometricPrecision'
      }
    };
  };

  const prepareCanvasForExport = async () => {
    if (!containerRef.current || !zoomBehaviorRef.current) return null;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const oldTransform = d3.zoomTransform(containerRef.current);

    const nodes = containerRef.current.querySelectorAll('.cursor-move');
    let minX = 0, minY = 0, maxX = 0, maxY = 0;
    if (nodes.length > 0) {
      minX = Infinity; minY = Infinity; maxX = -Infinity; maxY = -Infinity;
      nodes.forEach(n => {
        const x = parseFloat((n as HTMLElement).style.left) || 0;
        const y = parseFloat((n as HTMLElement).style.top) || 0;
        const w = (n as HTMLElement).offsetWidth || 300;
        const h = (n as HTMLElement).offsetHeight || 100;
        minX = Math.min(minX, x - w/2);
        maxX = Math.max(maxX, x + w/2);
        minY = Math.min(minY, y - h/2);
        maxY = Math.max(maxY, y + h/2);
      });
    } else {
      minX = -950; maxX = 950; minY = -525; maxY = 525;
    }

    const paddingX = Math.max(160, cw * 0.05);
    const paddingY = Math.max(160, ch * 0.05);
    const virtualW = (maxX - minX) + paddingX * 2;
    const virtualH = (maxY - minY) + paddingY * 2;
    
    const scaleX = cw / virtualW;
    const scaleY = ch / virtualH;
    const boundScale = Math.min(scaleX, scaleY);
    
    const cx = (maxX + minX) / 2;
    const cy = (maxY + minY) / 2;
    const tx = cw / 2 - cx * boundScale;
    const ty = ch / 2 - cy * boundScale;

    d3.select(containerRef.current).call(
      zoomBehaviorRef.current.transform,
      d3.zoomIdentity.translate(tx, ty).scale(boundScale)
    );

    await new Promise(r => setTimeout(r, 200));

    return { boundScale, oldTransform };
  };

  const restoreCanvasAfterExport = (oldTransform: any) => {
    if (!containerRef.current || !zoomBehaviorRef.current) return;
    d3.select(containerRef.current).call(
      zoomBehaviorRef.current.transform,
      oldTransform
    );
  };

  const handleExportPng = async () => {
    if (!containerRef.current) return;
    try {
      const exportData = await prepareCanvasForExport();
      if (!exportData) return;

      const options = getExportOptions(exportData.boundScale);
      const dataUrl = await toPng(containerRef.current, options);
      const link = document.createElement('a');
      link.download = `${parsedData?.title.replace(/\n/g, ' ') || 'mindmap'}.png`;
      link.href = dataUrl;
      link.click();

      restoreCanvasAfterExport(exportData.oldTransform);
    } catch (err) {
      console.error('Failed to export PNG', err);
    }
  };

  const handleExportSvg = async () => {
    if (!containerRef.current) return;
    try {
      const exportData = await prepareCanvasForExport();
      if (!exportData) return;

      const dataUrl = await toSvg(containerRef.current, getExportOptions(exportData.boundScale));
      const link = document.createElement('a');
      link.download = `${parsedData?.title.replace(/\n/g, ' ') || 'mindmap'}.svg`;
      link.href = dataUrl;
      link.click();

      restoreCanvasAfterExport(exportData.oldTransform);
    } catch (err) {
      console.error('Failed to export SVG', err);
    }
  };

  const handleExportPdf = async () => {
    if (!containerRef.current) return;
    try {
      const exportData = await prepareCanvasForExport();
      if (!exportData) return;

      const options = getExportOptions(exportData.boundScale);
      // Give a highly crisp high-resolution quality boost for PDF to keep wrapper perfect
      options.pixelRatio = Math.max(options.pixelRatio, 8); 
      
      const dataUrl = await toPng(containerRef.current, options);
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const orientation = width > height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({ 
        orientation, 
        unit: 'px', 
        format: [width, height] 
      });
      // Use FAST compression to avoid jspdf blurring/compressing the high-res PNG too much
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST');
      pdf.save(`${parsedData?.title.replace(/\n/g, ' ') || 'mindmap'}.pdf`);

      restoreCanvasAfterExport(exportData.oldTransform);
    } catch (err) {
      console.error('Failed to export PDF', err);
    }
  };

  // Set up the balanced left/right branching vectors
  const processBranches = () => {
    if (!parsedData) return { left: [], right: [] };
    
    const left: typeof parsedData.branches = [];
    const right: typeof parsedData.branches = [];

    parsedData.branches.forEach((b, idx) => {
      if (layoutPattern === 'right') {
        right.push(b);
      } else if (layoutPattern === 'left') {
        left.push(b);
      } else if (layoutPattern === 'asymmetric-right') {
        // 75% Right, 25% Left
        if (idx % 4 === 0) {
          left.push(b);
        } else {
          right.push(b);
        }
      } else {
        // Symmetrical dual-sided layout patterns ('dual', 'staggered', 'compact-flow')
        if (b.side === 'left') {
          left.push(b);
        } else if (b.side === 'right') {
          right.push(b);
        } else {
          // Auto-balance
          if (idx % 2 === 0) {
            right.push(b);
          } else {
            left.push(b);
          }
        }
      }
    });

    return { left, right };
  };

  const { left: leftBranches, right: rightBranches } = processBranches();

  // Set up D3 Zoom Behavior and lifecycle events
  useEffect(() => {
    if (viewState !== 'map' || !containerRef.current) return;

    const outerContainer = d3.select(containerRef.current);

    const zoomBehavior = d3.zoom<HTMLDivElement, any>()
      .scaleExtent([0.15, 3])
      .on('start', () => {
        setIsDragging(true);
      })
      .on('zoom', (event) => {
        const { x, y, k } = event.transform;
        setPanX(x);
        setPanY(y);
        setScale(k);
      })
      .on('end', () => {
        setIsDragging(false);
      });

    zoomBehaviorRef.current = zoomBehavior;
    outerContainer.call(zoomBehavior);

    // Initial centering and fitting inside the container window bounds
    const cw = containerRef.current.clientWidth || window.innerWidth;
    const ch = containerRef.current.clientHeight || window.innerHeight;
    const virtualW = 1900;
    const virtualH = 1050;
    const scaleX = cw / virtualW;
    const scaleY = ch / virtualH;
    const boundScale = Math.max(0.18, Math.min(Math.min(scaleX, scaleY) * 1.05, 1.2));

    outerContainer.call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(cw / 2, ch / 2).scale(boundScale)
    );

    // Prevent zoom behavior from capturing double clicks
    outerContainer.on('dblclick.zoom', null);

    return () => {
      outerContainer.on('.zoom', null);
    };
  }, [viewState, parsedData]);

  const handleZoom = (zoomIn: boolean) => {
    if (!containerRef.current || !zoomBehaviorRef.current) return;
    const factor = zoomIn ? 1.3 : 1 / 1.3;
    
    d3.select(containerRef.current)
      .transition()
      .duration(320)
      .call(zoomBehaviorRef.current.scaleBy, factor);
  };

  const handleResetZoom = () => {
    if (!containerRef.current || !zoomBehaviorRef.current) return;
    const cw = containerRef.current.clientWidth || window.innerWidth;
    const ch = containerRef.current.clientHeight || window.innerHeight;
    const virtualW = 1900;
    const virtualH = 1050;
    const scaleX = cw / virtualW;
    const scaleY = ch / virtualH;
    const boundScale = Math.max(0.18, Math.min(Math.min(scaleX, scaleY) * 1.05, 1.2));

    // Clear custom dragged coordinates back to default layout state
    setNodeOffsets({});
    setPhysicsPositions({});

    d3.select(containerRef.current)
      .transition()
      .duration(500)
      .call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity.translate(cw / 2, ch / 2).scale(boundScale)
      );
  };

  const toggleNodeCollapse = (id: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // --- Layout Calculations ---
  const sizeMultiplier = textSize;

  const nodeWidths = {
    center: Math.round((nodePadding === 'compact' ? 210 : 260) * sizeMultiplier),
    branch: Math.round((nodePadding === 'compact' ? 180 : 230) * sizeMultiplier),
    leaf: Math.round((nodePadding === 'compact' ? 190 : 250) * sizeMultiplier),
  };

  const leftXOffset = Math.round((nodePadding === 'compact' ? -270 : -330) * sizeMultiplier);
  const rightXOffset = Math.round((nodePadding === 'compact' ? 270 : 330) * sizeMultiplier);

  interface PositionedSubLeaf {
    title: string;
    x: number;
    y: number;
  }

  interface PositionedLeaf {
    title: string;
    x: number;
    y: number;
    id: string;
    subLeaves: PositionedSubLeaf[];
    original: MindmapNode;
  }

  interface PositionedBranch {
    id: string;
    title: string;
    color: string;
    side: 'left' | 'right';
    x: number;
    y: number;
    leaves: PositionedLeaf[];
    children?: MindmapNode[];
  }

  const layoutSide = (branchesList: typeof parsedData.branches, side: 'left' | 'right') => {
    let accumulatedY = 0;
    const baseBranchX = side === 'left' ? leftXOffset : rightXOffset;

    const getXStep = () => {
      const step = side === 'left' ? leftXOffset : rightXOffset;
      if (layoutPattern === 'compact-flow') {
        return step * 0.75;
      }
      return step;
    };

    const xStep = getXStep();

    const positionedBranches: PositionedBranch[] = (branchesList || []).map((b, bIdx) => {
      // Determine branch X depending on selected layout pattern
      let branchX = baseBranchX;
      if (layoutPattern === 'staggered') {
        const staggerFactor = bIdx % 2 === 0 ? 0.8 : 1.25;
        branchX = baseBranchX * staggerFactor;
      } else if (layoutPattern === 'compact-flow') {
        branchX = baseBranchX * 0.75;
      }

      const bChildren = b.children || [];
      const isBranchCollapsed = collapsedNodes.has(b.id);
      
      if (isBranchCollapsed || bChildren.length === 0) {
        const branchSpan = 80;
        const branchY = accumulatedY + branchSpan / 2;
        accumulatedY += branchSpan + 40; // gap after collapsed branch
        return {
          id: b.id,
          title: b.title,
          color: b.color,
          side,
          x: branchX,
          y: branchY,
          leaves: [],
          children: b.children
        };
      }

      const branchStartY = accumulatedY;
      const positionedLeaves: PositionedLeaf[] = bChildren.map((c, cIdx) => {
        const childId = `${b.id}-child-${cIdx}`;
        const isChildCollapsed = collapsedNodes.has(childId);
        const cChildren = c.children || [];
        
        // Leaf node dynamic position
        const leafX = branchX + xStep;

        if (isChildCollapsed || cChildren.length === 0) {
          const leafSpan = 110;
          const leafY = accumulatedY + leafSpan / 2;
          accumulatedY += leafSpan + 35; // gap between sibling leaf cards
          return {
            title: c.title,
            x: leafX,
            y: leafY,
            id: childId,
            subLeaves: [],
            original: c
          };
        }

        const leafStartY = accumulatedY;
        const positionedSubLeaves: PositionedSubLeaf[] = cChildren.map((s) => {
          const subLeafSpan = 70;
          const subLeafY = accumulatedY + subLeafSpan / 2;
          accumulatedY += subLeafSpan + 20; // gap between sub-leaves
          
          // Sub-leaf dynamic position
          const subLeafX = leafX + xStep;

          return {
            title: s.title,
            x: subLeafX,
            y: subLeafY
          };
        });

        // Align leaf at the center of its sub-leaves (subtracting final subLeaf gap to find proper center)
        const leafSpan = (accumulatedY - 20) - leafStartY;
        const leafY = leafStartY + leafSpan / 2;

        accumulatedY += 20; // spacer after a sub-leaf block

        return {
          title: c.title,
          x: leafX,
          y: leafY,
          id: childId,
          subLeaves: positionedSubLeaves,
          original: c
        };
      });

      // Align branch at the center of all its leaves (subtracting final leaf gap to find proper center)
      const branchSpan = (accumulatedY - 40) - branchStartY;
      const branchY = branchStartY + branchSpan / 2;

      accumulatedY += 40; // spacer between branches

      return {
        id: b.id,
        title: b.title,
        color: b.color,
        side,
        x: branchX,
        y: branchY,
        leaves: positionedLeaves,
        children: b.children
      };
    });

    // Centering layout space around Y = 0 coordinate
    const centerYOffset = accumulatedY / 2;
    positionedBranches.forEach((pb) => {
      pb.y -= centerYOffset;
      pb.leaves.forEach((pl) => {
        pl.y -= centerYOffset;
        pl.subLeaves.forEach((psl) => {
          psl.y -= centerYOffset;
        });
      });
    });

    return positionedBranches;
  };

  const rightSideLayout = layoutSide(rightBranches, 'right');
  const leftSideLayout = layoutSide(leftBranches, 'left');

  // Helper functions for visible nodes in physics simulation
  const getVisibleNodes = () => {
    const nodes: { id: string; x: number; y: number; type: 'center' | 'branch' | 'leaf' | 'subleaf'; color?: string; parentId?: string }[] = [];
    
    // 1. Center node
    nodes.push({ id: 'center-node', x: 0, y: 0, type: 'center' });
    
    // Helper to process branches
    const processSideVisible = (branches: any[]) => {
      branches.forEach(b => {
        nodes.push({ id: b.id, x: b.x, y: b.y, type: 'branch', color: b.color, parentId: 'center-node' });
        
        const isBranchCollapsed = collapsedNodes.has(b.id);
        if (!isBranchCollapsed) {
          b.leaves.forEach((c: any) => {
            nodes.push({ id: c.id, x: c.x, y: c.y, type: 'leaf', color: b.color, parentId: b.id });
            
            const isChildCollapsed = collapsedNodes.has(c.id);
            if (!isChildCollapsed) {
              c.subLeaves.forEach((s: any, sIdx: number) => {
                const sId = `sub-${c.id}-${sIdx}`;
                nodes.push({ id: sId, x: s.x, y: s.y, type: 'subleaf', color: b.color, parentId: c.id });
              });
            }
          });
        }
      });
    };

    processSideVisible(rightSideLayout);
    processSideVisible(leftSideLayout);
    return nodes;
  };

  const getVisibleLinks = (visibleNodes: any[]) => {
    const links: { source: string; target: string; color?: string }[] = [];
    visibleNodes.forEach(node => {
      if (node.parentId) {
        links.push({
          source: node.parentId,
          target: node.id,
          color: node.color
        });
      }
    });
    return links;
  };

  // Run or sync D3 Force-directed simulation whenever layout, zoom levels, or structures change
  useEffect(() => {
    if (!usePhysics || viewState !== 'map' || !parsedData) {
      if (simRef.current) {
        simRef.current.stop();
        simRef.current = null;
      }
      return;
    }

    const visibleNodes = getVisibleNodes();
    const visibleLinks = getVisibleLinks(visibleNodes);

    // Build simulation nodes
    const d3Nodes = visibleNodes.map(node => {
      const prevPos = physicsPositions[node.id];
      return {
        id: node.id,
        type: node.type,
        color: node.color,
        targetX: node.x,
        targetY: node.y,
        x: prevPos ? prevPos.x : node.x,
        y: prevPos ? prevPos.y : node.y,
        vx: prevPos ? (simRef.current ? (simRef.current.nodes().find((sn: any) => sn.id === node.id)?.vx ?? 0) : 0) : 0,
        vy: prevPos ? (simRef.current ? (simRef.current.nodes().find((sn: any) => sn.id === node.id)?.vy ?? 0) : 0) : 0,
        fx: simRef.current ? (simRef.current.nodes().find((sn: any) => sn.id === node.id)?.fx ?? null) : null,
        fy: simRef.current ? (simRef.current.nodes().find((sn: any) => sn.id === node.id)?.fy ?? null) : null
      };
    });

    const d3Links = visibleLinks.map(link => ({
      source: link.source,
      target: link.target,
      color: link.color
    }));

    if (simRef.current) {
      simRef.current.stop();
    }

    const simulation = d3.forceSimulation<any>(d3Nodes)
      .velocityDecay(0.24) // high Viscosity fluid simulation
      .force('charge', d3.forceManyBody().strength(-150))
      .force('collide', d3.forceCollide<any>().radius(d => {
        if (d.type === 'center') return Math.round(nodeWidths.center / 2) + 20;
        if (d.type === 'branch') return Math.round(nodeWidths.branch / 2) + 15;
        if (d.type === 'leaf') return Math.round(nodeWidths.leaf / 2) + 10;
        return Math.round((nodeWidths.leaf - 20) / 2) + 10;
      }).iterations(2))
      .force('link', d3.forceLink<any, any>(d3Links)
        .id(d => d.id)
        .distance(d => {
          if (d.target.type === 'branch') return 160;
          if (d.target.type === 'leaf') return 120;
          return 90;
        })
        .strength(0.3)
      )
      .force('anchorX', d3.forceX<any>().x(d => d.targetX).strength(0.12))
      .force('anchorY', d3.forceY<any>().y(d => d.targetY).strength(0.12));

    simRef.current = simulation;

    simulation.on('tick', () => {
      const pos: Record<string, { x: number; y: number }> = {};
      d3Nodes.forEach(n => {
        pos[n.id] = { x: n.x, y: n.y };
      });
      setPhysicsPositions(pos);
    });

    // Initial energetic nudge
    simulation.alpha(0.85).restart();

    return () => {
      simulation.stop();
    };
  }, [usePhysics, viewState, parsedData, collapsedNodes, layoutPattern, nodePadding, textSize]);

  const getFontSizeStyle = (tier: 'center' | 'branch' | 'leaf' | 'subleaf') => {
    let baseSize = 11;
    if (tier === 'center') baseSize = 14;
    else if (tier === 'branch') baseSize = 12;
    else if (tier === 'leaf') baseSize = 11;
    else if (tier === 'subleaf') baseSize = 10;
    
    // Scale baseSize by textSize multiplier
    const finalSize = Math.max(7, Math.round(baseSize * textSize));
    return { fontSize: `${finalSize}px` };
  };

  // Dynamic layout theme and styling getters
  const getCentralNodeStyle = () => {
    switch(nodeStyle) {
      case 'brutalist':
        return {
          cardClass: "p-5 md:p-6 rounded-none bg-emerald-400 text-black border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.95)] flex flex-col items-center justify-center text-center transition-all duration-300 font-mono font-black",
          iconClass: "w-8 h-8 text-black mb-2 shrink-0 animate-none",
          titleClass: "font-black uppercase tracking-tight leading-snug"
        };
      case 'neon':
        return {
          cardClass: "p-6 md:p-8 rounded-xl bg-slate-950 text-[#10b981] border-2 border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.5)] dark:shadow-[0_0_25px_rgba(16,185,129,0.7)] flex flex-col items-center justify-center text-center transition-all duration-300 font-sans uppercase tracking-wider",
          iconClass: "w-8 h-8 text-emerald-400 mb-2 animate-[pulse_2s_infinite] shrink-0",
          titleClass: "font-black tracking-widest leading-snug"
        };
      case 'warm':
        return {
          cardClass: "p-6 md:p-8 rounded-[1.5rem] bg-[#fbf9f4] dark:bg-[#1a140f] text-[#3c2a1a] dark:text-[#f2eadc] border-2 border-[#d6c7b3] dark:border-[#4d3e2d] shadow-[0_8px_20px_rgba(40,30,20,0.08)] flex flex-col items-center justify-center text-center transition-all duration-300 font-serif",
          iconClass: "w-8 h-8 text-[#8c6d4f] dark:text-[#c4ae94] mb-2 shrink-0",
          titleClass: "font-semibold leading-relaxed"
        };
      case 'cyberpunk':
        return {
          cardClass: "p-7 md:p-9 rounded-2xl bg-[#090514] text-pink-500 border-2 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.45),_inset_0_0_12px_rgba(236,72,153,0.25)] flex flex-col items-center justify-center text-center transition-all duration-300 font-black uppercase tracking-widest",
          iconClass: "w-9 h-9 text-cyan-400 mb-2 shrink-0 drop-shadow-[0_0_8px_rgba(34,211,238,0.85)] animate-pulse",
          titleClass: "font-black text-white leading-relaxed tracking-wider [text-shadow:_0_0_8px_rgba(236,72,153,0.9)]"
        };
      case 'academic':
        return {
          cardClass: "p-6 md:p-8 rounded-lg bg-[#faf6ee] dark:bg-[#12100d] text-[#2c1d11] dark:text-[#f7ebd3] border-[1.5px] border-[#8a755d] dark:border-[#5c4a38] shadow-[0_4px_16px_rgba(44,29,17,0.06),_inset_0_1px_0_#ffffff] flex flex-col items-center justify-center text-center transition-all duration-300 font-serif",
          iconClass: "w-8 h-8 text-[#5c4a38] dark:text-[#c4ae94] mb-2.5 shrink-0 opacity-80",
          titleClass: "font-bold italic leading-relaxed tracking-normal"
        };
      case 'terminal':
        return {
          cardClass: "p-6 md:p-7 rounded-none bg-black text-[#00ff66] border border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.35)] flex flex-col items-center justify-center text-center transition-all duration-300 font-mono uppercase tracking-normal",
          iconClass: "w-7 h-7 text-[#00ff66] mb-2.5 shrink-0 drop-shadow-[0_0_4px_rgba(0,255,102,0.8)] animate-pulse",
          titleClass: "font-bold leading-normal text-slate-100"
        };
      case 'glass':
      default:
        return {
          cardClass: "p-6 md:p-8 rounded-[2rem] bg-slate-900 dark:bg-[#060a16] text-white border-2 border-indigo-500/80 shadow-[0_15px_30px_rgba(99,102,241,0.25)] flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02] hover:border-emerald-400 font-sans",
          iconClass: "w-8 h-8 text-emerald-400 mb-2 animate-[spin_8s_linear_infinite] shrink-0",
          titleClass: "font-extrabold tracking-tight leading-snug"
        };
    }
  };

  const getBranchNodeStyle = (color: string, isCollapsed: boolean) => {
    switch(nodeStyle) {
      case 'brutalist':
        return {
          className: `px-5 py-3.5 rounded-none text-black font-black border-[3px] border-black cursor-pointer select-none flex items-center justify-between gap-2 transition-all font-mono`,
          styles: {
            width: nodeWidths.branch,
            backgroundColor: color,
            boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
          }
        };
      case 'neon':
        return {
          className: `px-5 py-3.5 rounded-lg font-extrabold border-2 cursor-pointer select-none flex items-center justify-between gap-2 transition-all font-sans tracking-wide`,
          styles: {
            width: nodeWidths.branch,
            backgroundColor: '#05070f',
            borderColor: color,
            color: color,
            boxShadow: `0 0 12px ${color}66`,
          }
        };
      case 'warm':
        return {
          className: `px-5 py-3.5 rounded-xl text-[#3c2a1a] dark:text-[#ede4d5] font-semibold border border-[#e3d5c1] dark:border-[#4d3e2d] border-l-[6px] cursor-pointer select-none flex items-center justify-between gap-2 transition-all font-serif`,
          styles: {
            width: nodeWidths.branch,
            backgroundColor: '#faf7f2',
            borderLeftColor: color,
            boxShadow: '0 4px 10px rgba(40,30,20,0.03)'
          }
        };
      case 'cyberpunk':
        return {
          className: `px-5 py-3.5 rounded-xl font-black border-2 cursor-pointer select-none flex items-center justify-between gap-2 transition-all font-mono tracking-wider text-pink-400 bg-[#0c051a]`,
          styles: {
            width: nodeWidths.branch,
            backgroundColor: '#090514',
            borderColor: color,
            color: color,
            boxShadow: `0 0 16px ${color}55, inset 0 0 8px ${color}22`,
          }
        };
      case 'academic':
        return {
          className: `px-5 py-3.5 rounded-md text-[#40301f] dark:text-[#ebd5bd] font-semibold border-[1.5px] border-[#cdbfb0] dark:border-[#3d3228] border-b-[4px] cursor-pointer select-none flex items-center justify-between gap-2 transition-all font-serif`,
          styles: {
            width: nodeWidths.branch,
            backgroundColor: '#f7f4ec',
            borderBottomColor: color,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }
        };
      case 'terminal':
        return {
          className: `px-5 py-3.5 rounded-none text-[#00ff66] font-bold border cursor-pointer select-none flex items-center justify-between gap-2 transition-all font-mono shadow-[2px_2px_0px_#00ff66]`,
          styles: {
            width: nodeWidths.branch,
            backgroundColor: '#000000',
            color: color,
            borderColor: color,
            boxShadow: `3px 3px 0px ${color}`
          }
        };
      case 'glass':
      default:
        return {
          className: `px-5 py-3.5 rounded-2xl text-white font-extrabold shadow-md border cursor-pointer select-none flex items-center justify-between gap-2 transition-all ${isCollapsed ? 'filter saturate-50 brightness-90 border-slate-400' : 'border-white/20'} font-sans`,
          styles: {
            width: nodeWidths.branch,
            backgroundColor: color,
            boxShadow: `0 6px 16px -4px ${color}aa`
          }
        };
    }
  };

  const getLeafNodeStyle = (color: string, side: 'left' | 'right', hasChildren: boolean) => {
    const isInteractive = hasChildren ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80' : '';
    
    switch(nodeStyle) {
      case 'brutalist':
        return {
          className: `p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-[3px] border-black select-none flex items-center justify-between gap-2 transition-all font-mono ${isInteractive}`,
          styles: {
            width: nodeWidths.leaf,
            boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
            borderTopColor: '#000000',
            borderBottomColor: '#000000',
            borderLeftColor: side === 'right' ? color : '#000000',
            borderRightColor: side === 'left' ? color : '#000000',
            borderTopWidth: '3px',
            borderBottomWidth: '3px',
            borderLeftWidth: side === 'right' ? '6px' : '3px',
            borderRightWidth: side === 'left' ? '6px' : '3px',
          }
        };
      case 'neon':
        return {
          className: `p-3 bg-slate-950 text-slate-100 border select-none flex items-center justify-between gap-2 transition-all rounded-lg font-sans ${isInteractive}`,
          styles: {
            width: nodeWidths.leaf,
            boxShadow: `0 0 10px ${color}22`,
            borderTopColor: `${color}aa`,
            borderBottomColor: `${color}aa`,
            borderLeftColor: side === 'right' ? color : `${color}aa`,
            borderRightColor: side === 'left' ? color : `${color}aa`,
            borderTopWidth: '1px',
            borderBottomWidth: '1px',
            borderLeftWidth: side === 'right' ? '5px' : '1px',
            borderRightWidth: side === 'left' ? '5px' : '1px',
          }
        };
      case 'warm':
        return {
          className: `p-3 bg-[#fdfbf6] dark:bg-[#1c1610] text-[#3c2a1a] dark:text-[#f3ebd9] border border-[#e4d9c4] dark:border-[#4d3e2d] select-none flex items-center justify-between gap-2 rounded-xl transition-all font-serif ${isInteractive}`,
          styles: {
            width: nodeWidths.leaf,
            boxShadow: '0 3px 8px rgba(40,30,20,0.02)',
            borderTopColor: '#e4d9c4',
            borderBottomColor: '#e4d9c4',
            borderLeftColor: side === 'right' ? color : '#e4d9c4',
            borderRightColor: side === 'left' ? color : '#e4d9c4',
            borderTopWidth: '1px',
            borderBottomWidth: '1px',
            borderLeftWidth: side === 'right' ? '3px' : '1px',
            borderRightWidth: side === 'left' ? '3px' : '1px',
          }
        };
      case 'cyberpunk':
        return {
          className: `p-3 bg-[#0c051a] text-cyan-400 border select-none flex items-center justify-between gap-2 transition-all rounded-lg font-mono tracking-wide ${isInteractive}`,
          styles: {
            width: nodeWidths.leaf,
            boxShadow: `0 0 8px ${color}22`,
            borderTopColor: `${color}88`,
            borderBottomColor: `${color}88`,
            borderLeftColor: side === 'right' ? color : `${color}88`,
            borderLeftWidth: side === 'right' ? '4px' : '1px',
            borderRightColor: side === 'left' ? color : `${color}88`,
            borderRightWidth: side === 'left' ? '4px' : '1px',
            borderTopWidth: '1px',
            borderBottomWidth: '1px',
          }
        };
      case 'academic':
        return {
          className: `p-3 bg-[#fbfaf6] dark:bg-[#1a1714] text-[#4d3a24] dark:text-[#f3ebd9] border border-[#d6c9b5] dark:border-[#3d3228] select-none flex items-center justify-between gap-2 rounded-lg transition-all font-serif ${isInteractive}`,
          styles: {
            width: nodeWidths.leaf,
            boxShadow: '0 2px 5px rgba(0,0,0,0.01)',
            borderTopWidth: '1px',
            borderBottomWidth: '1px',
            borderLeftColor: side === 'right' ? color : '#d6c9b5',
            borderLeftWidth: side === 'right' ? '3px' : '1px',
            borderRightColor: side === 'left' ? color : '#d6c9b5',
            borderRightWidth: side === 'left' ? '3px' : '1px',
          }
        };
      case 'terminal':
        return {
          className: `p-3 bg-black text-[#00ff66]/90 border border-[#00ff66]/40 select-none flex items-center justify-between gap-2 transition-all font-mono rounded-none ${isInteractive}`,
          styles: {
            width: nodeWidths.leaf,
            borderTopColor: `${color}66`,
            borderBottomColor: `${color}66`,
            borderLeftColor: side === 'right' ? color : `${color}66`,
            borderLeftWidth: side === 'right' ? '3px' : '1px',
            borderRightColor: side === 'left' ? color : `${color}66`,
            borderRightWidth: side === 'left' ? '3px' : '1px',
            borderTopWidth: '1px',
            borderBottomWidth: '1px',
          }
        };
      case 'glass':
      default:
        return {
          className: `p-3 bg-white/95 dark:bg-slate-900 shadow-sm text-slate-800 dark:text-slate-100 flex items-center justify-between gap-2 rounded-xl border border-slate-100 dark:border-slate-800/80 transition-all font-sans ${isInteractive}`,
          styles: {
            width: nodeWidths.leaf,
            boxShadow: 'none',
            borderTopColor: `${color}44`,
            borderBottomColor: `${color}44`,
            borderLeftColor: side === 'right' ? color : `${color}44`,
            borderRightColor: side === 'left' ? color : `${color}44`,
            borderTopWidth: '1px',
            borderBottomWidth: '1px',
            borderLeftWidth: side === 'right' ? '4px' : '1px',
            borderRightWidth: side === 'left' ? '4px' : '1px',
          }
        };
    }
  };

  const getSubLeafNodeStyle = () => {
    switch(nodeStyle) {
      case 'brutalist':
        return {
          className: "p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-[2.5px] border-black border-dashed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono leading-normal",
        };
      case 'neon':
        return {
          className: "p-3 bg-zinc-950 text-slate-300 border border-slate-800 rounded-lg shadow-xs leading-normal font-mono",
        };
      case 'warm':
        return {
          className: "p-3 bg-[#faf9f3] dark:bg-[#1b1510] border border-dashed border-[#e6dcc7] dark:border-[#42372a] rounded-lg shadow-xs text-[#4d3a24] dark:text-slate-350 leading-normal font-serif italic",
        };
      case 'cyberpunk':
        return {
          className: "p-3 bg-[#06030c] text-indigo-200 border border-purple-500/50 rounded-lg shadow-sm leading-normal font-mono text-[9px]",
        };
      case 'academic':
        return {
          className: "p-3 bg-[#fdfcf7] dark:bg-[#15120f] border border-[#ded5c5] dark:border-[#2d251d] rounded-md text-[#55422e] dark:text-[#e4dac6] leading-normal font-serif",
        };
      case 'terminal':
        return {
          className: "p-3 bg-black text-[#00dd55] border border-dashed border-[#00ff66]/30 rounded-none leading-normal font-mono text-[9.5px]",
        };
      case 'glass':
      default:
        return {
          className: "p-3 bg-slate-50/90 dark:bg-slate-950 border rounded-lg shadow-xs text-slate-700 dark:text-slate-300 leading-normal border-slate-200 dark:border-slate-800 font-sans",
        };
    }
  };

  // Render curved visual connection trails with dynamic drag coordinate offsets
  const drawPaths = () => {
    const paths: React.JSX.Element[] = [];

    const centerOffsetX = nodeOffsets['center-node']?.x || 0;
    const centerOffsetY = nodeOffsets['center-node']?.y || 0;

    const renderPathElement = (key: string, d: string, color: string, defaultWidth: number) => {
      const isBrutalist = nodeStyle === 'brutalist';
      const isAcademic = nodeStyle === 'academic';
      const isTerminal = nodeStyle === 'terminal';
      const isCyberpunk = nodeStyle === 'cyberpunk';
      const isNeonGlow = nodeStyle === 'neon' || isCyberpunk || isTerminal || lineStyle === 'neon-glow';
      const isDashed = lineStyle === 'dashed';
      
      let strokeColor = color;
      if (isBrutalist) {
        strokeColor = '#1e293b';
      } else if (isAcademic) {
        strokeColor = '#5c4a38';
      } else if (isTerminal) {
        strokeColor = '#00ff66';
      } else if (isCyberpunk) {
        strokeColor = color;
      }

      const width = isBrutalist ? defaultWidth + 0.5 : isAcademic ? defaultWidth * 0.75 : defaultWidth;
      const opacityValue = isBrutalist ? "0.95" : isAcademic ? "0.6" : isNeonGlow ? "0.9" : "0.8";

      if (isNeonGlow) {
        const glowColor = isTerminal ? '#00ff66' : isCyberpunk ? (color === '#ef4444' || color === '#f59e0b' ? '#ff007f' : '#00f3ff') : color;
        const coreColor = isTerminal ? '#d4ffe2' : isCyberpunk ? '#ffffff' : '#ffffff';
        return (
          <g key={`g-${key}`}>
            {/* Soft Glow Underlay */}
            <path
              d={d}
              fill="none"
              stroke={glowColor}
              strokeWidth={width * (isCyberpunk ? 3.5 : 2.8)}
              strokeLinecap="round"
              opacity="0.35"
            />
            {/* Bright Inner Core */}
            <path
              d={d}
              fill="none"
              stroke={coreColor}
              strokeWidth={width * 0.7}
              strokeLinecap="round"
              opacity="0.95"
            />
            {/* Luminous border */}
            <path
              d={d}
              fill="none"
              stroke={glowColor}
              strokeWidth={width * 1.2}
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>
        );
      } else {
        return (
          <path
            key={key}
            d={d}
            fill="none"
            stroke={strokeColor}
            strokeWidth={width}
            strokeLinecap="round"
            strokeDasharray={isDashed || isAcademic ? "4,4" : undefined}
            opacity={opacityValue}
          />
        );
      }
    };

    const getLinkPath = (sX: number, sY: number, eX: number, eY: number, dir: 'left' | 'right') => {
      if (connectorType === 'straight') {
        return `M ${sX} ${sY} L ${eX} ${eY}`;
      }
      if (connectorType === 'orthogonal') {
        const midX = (sX + eX) / 2;
        return `M ${sX} ${sY} H ${midX} V ${eY} H ${eX}`;
      }
      // 'bezier' (default)
      const cp1X = sX + (dir === 'left' ? -100 : 100);
      const cp1Y = sY;
      const cp2X = eX - (dir === 'left' ? -110 : 110);
      const cp2Y = eY;
      return `M ${sX} ${sY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${eX} ${eY}`;
    };

    // Right side paths
    rightSideLayout.forEach((b) => {
      const b_offsetX = nodeOffsets[b.id]?.x || 0;
      const b_offsetY = nodeOffsets[b.id]?.y || 0;

      const bX_rendered = usePhysics
        ? (physicsPositions[b.id]?.x ?? b.x)
        : b.x + centerOffsetX + b_offsetX;
      const bY_rendered = usePhysics
        ? (physicsPositions[b.id]?.y ?? b.y)
        : b.y + centerOffsetY + b_offsetY;

      const startX = usePhysics
        ? (physicsPositions['center-node']?.x ?? 0) + 10
        : centerOffsetX + 10;
      const startY = usePhysics
        ? (physicsPositions['center-node']?.y ?? 0)
        : centerOffsetY;
      const endX = bX_rendered - 30;
      const endY = bY_rendered;

      // Curve from center to branch
      paths.push(
        renderPathElement(
          `path-right-${b.id}`,
          getLinkPath(startX, startY, endX, endY, 'right'),
          b.color,
          3.5
        ) as any
      );

      // Branch children (leaves)
      b.leaves.forEach((c) => {
        const leaf_offsetX = nodeOffsets[c.id]?.x || 0;
        const leaf_offsetY = nodeOffsets[c.id]?.y || 0;

        const cX_rendered = usePhysics
          ? (physicsPositions[c.id]?.x ?? c.x)
          : c.x + centerOffsetX + b_offsetX + leaf_offsetX;
        const cY_rendered = usePhysics
          ? (physicsPositions[c.id]?.y ?? c.y)
          : c.y + centerOffsetY + b_offsetY + leaf_offsetY;

        const lStartX = bX_rendered + 10;
        const lStartY = bY_rendered;
        const lEndX = cX_rendered - 15;
        const lEndY = cY_rendered;

        paths.push(
          renderPathElement(
            `path-right-${b.id}-${c.id}`,
            getLinkPath(lStartX, lStartY, lEndX, lEndY, 'right'),
            b.color,
            2
          ) as any
        );

        // Sub-leaves
        c.subLeaves.forEach((s, sIdx) => {
          const sId = `sub-${c.id}-${sIdx}`;

          const s_offsetX = nodeOffsets[sId]?.x || 0;
          const s_offsetY = nodeOffsets[sId]?.y || 0;

          const sX_rendered = usePhysics
            ? (physicsPositions[sId]?.x ?? s.x)
            : s.x + centerOffsetX + b_offsetX + leaf_offsetX + s_offsetX;
          const sY_rendered = usePhysics
            ? (physicsPositions[sId]?.y ?? s.y)
            : s.y + centerOffsetY + b_offsetY + leaf_offsetY + s_offsetY;

          const sStartX = cX_rendered + 60;
          const sStartY = cY_rendered;
          const sEndX = sX_rendered - 15;
          const sEndY = sY_rendered;

          paths.push(
            renderPathElement(
              `path-right-${b.id}-${c.id}-${sIdx}`,
              getLinkPath(sStartX, sStartY, sEndX, sEndY, 'right'),
              b.color,
              1.2
            ) as any
          );
        });
      });
    });

    // Left side paths
    leftSideLayout.forEach((b) => {
      const b_offsetX = nodeOffsets[b.id]?.x || 0;
      const b_offsetY = nodeOffsets[b.id]?.y || 0;

      const bX_rendered = usePhysics
        ? (physicsPositions[b.id]?.x ?? b.x)
        : b.x + centerOffsetX + b_offsetX;
      const bY_rendered = usePhysics
        ? (physicsPositions[b.id]?.y ?? b.y)
        : b.y + centerOffsetY + b_offsetY;

      const startX = usePhysics
        ? (physicsPositions['center-node']?.x ?? 0) - 10
        : centerOffsetX - 10;
      const startY = usePhysics
        ? (physicsPositions['center-node']?.y ?? 0)
        : centerOffsetY;
      const endX = bX_rendered + 30;
      const endY = bY_rendered;

      // Curve from center to left branch
      paths.push(
        renderPathElement(
          `path-left-${b.id}`,
          getLinkPath(startX, startY, endX, endY, 'left'),
          b.color,
          3.5
        ) as any
      );

      // Branch children (leaves)
      b.leaves.forEach((c) => {
        const leaf_offsetX = nodeOffsets[c.id]?.x || 0;
        const leaf_offsetY = nodeOffsets[c.id]?.y || 0;

        const cX_rendered = usePhysics
          ? (physicsPositions[c.id]?.x ?? c.x)
          : c.x + centerOffsetX + b_offsetX + leaf_offsetX;
        const cY_rendered = usePhysics
          ? (physicsPositions[c.id]?.y ?? c.y)
          : c.y + centerOffsetY + b_offsetY + leaf_offsetY;

        const lStartX = bX_rendered - 10;
        const lStartY = bY_rendered;
        const lEndX = cX_rendered + 15;
        const lEndY = cY_rendered;

        paths.push(
          renderPathElement(
            `path-left-${b.id}-${c.id}`,
            getLinkPath(lStartX, lStartY, lEndX, lEndY, 'left'),
            b.color,
            2
          ) as any
        );

        // Sub-leaves
        c.subLeaves.forEach((s, sIdx) => {
          const sId = `sub-${c.id}-${sIdx}`;

          const s_offsetX = nodeOffsets[sId]?.x || 0;
          const s_offsetY = nodeOffsets[sId]?.y || 0;

          const sX_rendered = usePhysics
            ? (physicsPositions[sId]?.x ?? s.x)
            : s.x + centerOffsetX + b_offsetX + leaf_offsetX + s_offsetX;
          const sY_rendered = usePhysics
            ? (physicsPositions[sId]?.y ?? s.y)
            : s.y + centerOffsetY + b_offsetY + leaf_offsetY + s_offsetY;

          const sStartX = cX_rendered - 60;
          const sStartY = cY_rendered;
          const sEndX = sX_rendered + 15;
          const sEndY = sY_rendered;

          paths.push(
            renderPathElement(
              `path-left-${b.id}-${c.id}-${sIdx}`,
              getLinkPath(sStartX, sStartY, sEndX, sEndY, 'left'),
              b.color,
              1.2
            ) as any
          );
        });
      });
    });

    return paths;
  };

  // Dynamic style getter for the control panel card depending on theme
  const getPanelClass = () => {
    switch (nodeStyle) {
      case 'brutalist':
        return 'bg-white text-black border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]';
      case 'neon':
        return 'bg-slate-950 text-emerald-400 border-2 border-emerald-500 shadow-[2px_2px_20px_rgba(16,185,129,0.3)]';
      case 'warm':
        return 'bg-[#fcf9f4] text-[#3c2a1a] border-2 border-[#d6c7b3] font-serif shadow-[0_10px_25px_rgba(40,30,20,0.12)]';
      case 'cyberpunk':
        return 'bg-[#090514]/95 text-pink-500 border-2 border-pink-550 shadow-[0_0_20px_rgba(236,72,153,0.35)]';
      case 'academic':
        return 'bg-[#faf6ee] text-[#2c1d11] border-[1.5px] border-[#8a755d] shadow-md font-serif';
      case 'terminal':
        return 'bg-black text-[#00ff66] border border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.2)] font-mono';
      default: // glass
        return 'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-250/60 dark:border-slate-800/60 shadow-2xl backdrop-blur-md';
    }
  };

  const getButtonClass = (active: boolean) => {
    if (nodeStyle === 'brutalist') {
      return active 
        ? 'bg-black text-white border-2 border-black rounded-none text-[10px] font-mono leading-none tracking-tight'
        : 'bg-white text-black border-2 border-black rounded-none text-[10px] font-mono hover:bg-slate-100 leading-none tracking-tight';
    } else if (nodeStyle === 'neon') {
      return active 
        ? 'bg-[#10b981]/15 border border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] text-[10px] uppercase font-bold'
        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500 text-[10px] uppercase font-bold';
    } else if (nodeStyle === 'warm') {
      return active 
        ? 'bg-[#ede4d5] border border-[#b09e86] text-[#3c2a1a] font-serif text-[10px] font-bold'
        : 'bg-white/50 border border-slate-200 text-[#3c2a1a]/70 hover:bg-[#ede4d5]/50 hover:text-[#3c2a1a] font-serif text-[10px]';
    } else if (nodeStyle === 'cyberpunk') {
      return active 
        ? 'bg-pink-500/20 border-pink-500 text-pink-400 font-mono text-[10px] font-black'
        : 'bg-[#090514] border border-pink-500/30 text-pink-500 hover:text-pink-300 hover:border-pink-500 font-mono text-[10px]';
    } else if (nodeStyle === 'academic') {
      return active 
        ? 'bg-[#edd9c0] border-[#8a7258] text-[#4d3a24] font-serif text-[10px] font-bold'
        : 'bg-[#faf6ee]/70 border border-slate-200 text-[#4d3a24]/85 hover:bg-[#edd9c0]/50 hover:text-[#4d3a24] font-serif text-[10px]';
    } else if (nodeStyle === 'terminal') {
      return active 
        ? 'bg-[#00ff66]/15 border-[#00ff66] text-[#00ff66] font-mono text-[10px] font-bold'
        : 'bg-black border border-[#00ff66]/40 text-slate-400 hover:text-[#00ff66] hover:border-[#00ff66] font-mono text-[10px]';
    } else { // glass
      return active 
          ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-650 dark:text-indigo-405 text-[10px] font-semibold'
          : 'bg-slate-50/50 dark:bg-slate-800/40 border border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/80 text-[10px] font-medium';
    }
  };

  const getSubButtonClass = () => {
    if (nodeStyle === 'brutalist') {
      return 'w-full py-2.5 px-3 border-2 border-black rounded-none text-left flex items-center gap-3 font-mono font-bold bg-white text-black hover:bg-yellow-300 transition-all';
    } else if (nodeStyle === 'neon') {
      return 'w-full py-2.5 px-3 border border-[#10b981]/40 rounded-lg text-left flex items-center gap-3 font-bold bg-slate-950 text-emerald-400 hover:bg-[#10b981]/10 hover:border-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.1)] transition-all';
    } else if (nodeStyle === 'warm') {
      return 'w-full py-2.5 px-3 border border-[#d6c7b3] rounded-xl text-left flex items-center gap-3 font-serif bg-white text-[#3c2a1a] hover:bg-[#ede4d5]/45 transition-all';
    } else if (nodeStyle === 'cyberpunk') {
      return 'w-full py-2.5 px-3 border border-pink-500/40 rounded-xl text-left flex items-center gap-3 font-mono text-pink-400 bg-[#090514] hover:bg-pink-500/10 hover:border-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.15)] transition-all';
    } else if (nodeStyle === 'academic') {
      return 'w-full py-2.5 px-3 border border-[#cdbfb0] rounded-lg text-left flex items-center gap-3 font-serif bg-[#fdfcf9] text-[#4d3a24] hover:bg-[#ede4d5]/35 transition-all';
    } else if (nodeStyle === 'terminal') {
      return 'w-full py-2.5 px-3 border border-[#00ff66]/40 rounded-none text-left flex items-center gap-3 font-mono bg-black text-[#00ff66] hover:bg-[#00ff66]/15 hover:border-[#00ff66] shadow-[0_0_6px_rgba(0,255,102,0.1)] transition-all';
    } else { // glass
      return 'w-full py-2.5 px-3 border border-slate-100 dark:border-slate-800/50 rounded-xl text-left flex items-center gap-3 font-medium bg-slate-50/50 hover:bg-slate-100/70 dark:bg-slate-800/10 dark:hover:bg-slate-800/40 hover:border-slate-250 dark:hover:border-slate-700/60 transition-all text-slate-700 dark:text-slate-200';
    }
  };

  return (
    <div className={`w-full bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 ${viewState === 'map' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      
      {/* ----------------- PARSER VIEW ----------------- */}
      {viewState === 'parser' && (
        <div className="max-w-4xl mx-auto py-5 sm:py-12 px-3 sm:px-6 space-y-5 sm:space-y-8 w-full flex-1 flex flex-col justify-center">
          
          {/* Header row containing title and actions */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 text-left">
              <button 
                onClick={onClose} 
                className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl sm:rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shrink-0"
                aria-label="Go back"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="space-y-0.5 sm:space-y-1">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight uppercase italic text-slate-900 dark:text-white leading-none">
                  Mindmap Creator
                </h2>
                <p className="text-emerald-500 font-extrabold text-[9px] sm:text-[11px] uppercase tracking-wider leading-none mt-1">
                  Convert JSON, Slides, or CSV into mapping networks
                </p>
              </div>
            </div>

            {/* Header Action Button Row */}
            <div className="flex flex-wrap sm:flex-nowrap justify-stretch md:justify-end gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowHelp(true)}
                className="flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border-b-2 sm:border-b-4 border-indigo-200 dark:border-indigo-800 text-indigo-650 dark:text-indigo-400 font-black uppercase text-[10px] sm:text-xs rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5 active:border-b-0"
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Prompt Builder
              </button>

              <button
                onClick={handleCopyCode}
                className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 border-b-2 sm:border-b-4 font-black uppercase text-[10px] sm:text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5 active:border-b-0 ${
                  copiedCode
                    ? 'bg-emerald-500 border-b-emerald-700 text-white border-emerald-500 hover:bg-emerald-600'
                    : 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200'
                }`}
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? "Copied!" : "Copy Schema Prompt"}
              </button>

              <button
                onClick={handleLoadSampleCycle}
                className="flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-slate-900 border-b-2 sm:border-b-4 border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[10px] sm:text-xs rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5 active:border-b-0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Cycle Demos
              </button>
            </div>
          </div>

          {/* Central responsive code text editor area */}
          <div className="relative group w-full">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-2xl sm:rounded-[2.5rem] blur-xl opacity-10 group-hover:opacity-15 transition duration-1000"></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-xl sm:rounded-[2rem] p-0.5 sm:p-1 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setErrorLine("");
                }}
                placeholder="Paste CSV ('Branch,Leaf,Details') or hierarchical JSON mindmap structure here...&#10;e.g.&#10;{&#10;  &quot;title&quot;: &quot;Bioenergetics&quot;,&#10;  &quot;branches&quot;: [&#10;    { &quot;id&quot;: &quot;b1&quot;, &quot;title&quot;: &quot;Photosynthesis&quot;, &quot;color&quot;: &quot;#10b981&quot;, &quot;children&quot;: [...] }&#10;  ]&#10;}"
                className="w-full h-[220px] xs:h-[260px] sm:h-[320px] md:h-[420px] lg:h-[480px] p-3 sm:p-6 md:p-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg sm:rounded-[1.8rem] font-mono text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-0 outline-none transition-all resize-none border-none text-slate-900 dark:text-slate-100"
              />
            </div>

            <AnimatePresence>
              {errorLine && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center gap-2 sm:gap-3 text-white font-black text-[11px] sm:text-xs uppercase bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl z-20 border border-red-400/20"
                >
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 animate-bounce" />
                  <span className="truncate">{errorLine}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Centered Generate Action Cta */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleParse}
              disabled={!inputText.trim()}
              className="group relative w-full sm:w-auto px-6 py-4 sm:px-10 sm:py-5 md:px-14 md:py-6 bg-emerald-600 hover:bg-emerald-500 border border-emerald-950 dark:border-emerald-700 shadow-[0_4px_0_#064e3b] sm:shadow-[0_6px_0_#064e3b] hover:shadow-[0_2px_0_#064e3b] hover:translate-y-0.5 active:shadow-none active:translate-y-1.5 disabled:opacity-50 text-white font-black text-xs sm:text-sm md:text-base uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 sm:gap-3"
            >
              GENERATE INTERACTIVE MINDMAP
              <GitMerge className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
            </button>
          </div>

          {/* Interactive Portalized prompt builder & guide popup menu */}
          <AnimatePresence>
            {showHelp && (
              <MindmapPromptMenu
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
                handleLoadSample={handleLoadSample}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ----------------- MINDMAP VISUALIZER CANVAS ----------------- */}
      {viewState === 'map' && parsedData && (
        <div className={`w-full h-full flex flex-col relative select-none overflow-hidden transition-all duration-300 ${
          nodeStyle === 'brutalist' ? 'bg-[#fbfcfa] dark:bg-[#121214]' :
          nodeStyle === 'neon' ? 'bg-[#020205] dark:bg-[#010203]' :
          nodeStyle === 'warm' ? 'bg-[#faf8f3] dark:bg-[#14100c]' :
          'bg-[#f8fafc] dark:bg-[#090d16]'
        }`}>
          
          {/* Floating Top Left Control Group */}
          <div className="absolute top-4 left-4 flex flex-col md:flex-row items-start md:items-center gap-3 z-50 pointer-events-none">
            {/* Edit / Back Button */}
            <button 
              onClick={() => setViewState('parser')} 
              className="pointer-events-auto p-3 sm:px-4 sm:py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-xs font-black uppercase tracking-wider shadow-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-500" /> Edit Data
            </button>

            {/* Title Capsule Display */}
            <div className="pointer-events-auto px-4 py-3 bg-slate-900/90 text-white dark:bg-slate-100 dark:text-slate-950 backdrop-blur-md rounded-2xl shadow-lg border border-slate-805 dark:border-slate-250 flex items-center gap-2.5 max-w-xs sm:max-w-md font-extrabold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate tracking-wide uppercase">{parsedData.title.split('\n').join(' ')}</span>
            </div>
          </div>

          {/* Floating Top Right Control Group */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-50 pointer-events-none">
            <span className="hidden lg:inline-flex pointer-events-auto px-3.5 py-2.5 bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg">
              Studio Canvas
            </span>
            <button 
              onClick={onClose} 
              className="pointer-events-auto w-11 h-11 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white dark:bg-slate-800 dark:hover:bg-emerald-600 dark:text-white font-extrabold flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95 border border-slate-700/50"
              title="Close Mindmap"
            >
              ✕
            </button>
          </div>

          {/* Interactive Zoom Map Canvas */}
          <div 
            ref={containerRef}
            className={`flex-1 w-full relative overflow-hidden outline-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${
              nodeStyle === 'brutalist' ? 'mindmap-bg-brutalist' :
              nodeStyle === 'neon' ? 'mindmap-bg-neon' :
              nodeStyle === 'warm' ? 'mindmap-bg-warm' :
              nodeStyle === 'cyberpunk' ? 'mindmap-bg-cyberpunk' :
              nodeStyle === 'academic' ? 'mindmap-bg-academic' :
              nodeStyle === 'terminal' ? 'mindmap-bg-terminal' :
              'mindmap-bg-glass'
            }`}
            style={{
              backgroundPosition: `${panX}px ${panY}px`
            }}
          >
            {/* Draggable Inner Frame */}
            <div
              style={{
                position: 'absolute',
                left: panX,
                top: panY,
                transform: `scale(${scale})`,
                transformOrigin: '0 0',
                transition: 'none'
              }}
            >
              {/* Layer 1: Curve Paths Overlay SVG */}
              <svg 
                className="absolute pointer-events-none"
                style={{
                  width: '4000px',
                  height: '2400px',
                  left: '-2000px',
                  top: '-1200px',
                  overflow: 'visible'
                }}
              >
                <g transform="translate(2000, 1200)">
                  {drawPaths()}
                </g>
              </svg>

              {/* Layer 2: Interactive HTML Nodes */}
              <div 
                className="absolute"
                style={{
                  left: 0,
                  top: 0
                }}
              >
                {/* 1. CENTRAL NODE */}
                <div 
                  ref={(el) => { if (el) bindDrag(el, 'center-node'); }}
                  className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 select-none cursor-move"
                  style={{ 
                    left: usePhysics ? (physicsPositions['center-node']?.x ?? 0) : (nodeOffsets['center-node']?.x || 0), 
                    top: usePhysics ? (physicsPositions['center-node']?.y ?? 0) : (nodeOffsets['center-node']?.y || 0) 
                  }}
                >
                  {(() => {
                    const cStyle = getCentralNodeStyle();
                    const GitIcon = GitMerge;
                    return (
                      <div 
                        className={cStyle.cardClass}
                        style={{ width: nodeWidths.center }}
                      >
                        <GitIcon className={cStyle.iconClass} />
                        <h3 
                          className={`${cStyle.titleClass} whitespace-pre-line`}
                          style={getFontSizeStyle('center')}
                        >
                          {parsedData.title}
                        </h3>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. RIGHT SIDE BRANCHES & CHILDREN */}
                {rightSideLayout.map((b) => {
                  const isBranchCollapsed = collapsedNodes.has(b.id);
                  const bX = b.x;
                  const bY = b.y;

                  const centerOffsetX = nodeOffsets['center-node']?.x || 0;
                  const centerOffsetY = nodeOffsets['center-node']?.y || 0;

                  const b_offsetX = nodeOffsets[b.id]?.x || 0;
                  const b_offsetY = nodeOffsets[b.id]?.y || 0;

                  const bX_rendered = usePhysics
                    ? (physicsPositions[b.id]?.x ?? bX)
                    : bX + centerOffsetX + b_offsetX;
                  const bY_rendered = usePhysics
                    ? (physicsPositions[b.id]?.y ?? bY)
                    : bY + centerOffsetY + b_offsetY;

                  return (
                    <React.Fragment key={`group-right-${b.id}`}>
                      {/* Branch Node */}
                      <div 
                        ref={(el) => { if (el) bindDrag(el, b.id); }}
                        className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 interactive-node transition-all hover:scale-[1.03] cursor-move"
                        style={{ left: bX_rendered, top: bY_rendered }}
                      >
                        {(() => {
                           const branchStyle = getBranchNodeStyle(b.color, isBranchCollapsed);
                           return (
                             <div 
                                onClick={() => toggleNodeCollapse(b.id)}
                                className={branchStyle.className}
                                style={{ ...branchStyle.styles, ...getFontSizeStyle('branch') }}
                             >
                                <span className="truncate pr-1">{b.title}</span>
                                {b.children && b.children.length > 0 && (
                                  <span className="text-[9px] px-1.5 py-0.5 bg-black/15 dark:bg-white/10 rounded-full font-bold">
                                    {isBranchCollapsed ? `+${b.children.length}` : '−'}
                                  </span>
                                )}
                              </div>
                           );
                        })()}
                      </div>

                      {/* Leaves */}
                      {b.leaves.map((c) => {
                        const cX = c.x;
                        const cY = c.y;
                        const isChildCollapsed = collapsedNodes.has(c.id);

                        const leaf_offsetX = nodeOffsets[c.id]?.x || 0;
                        const leaf_offsetY = nodeOffsets[c.id]?.y || 0;

                        const cX_rendered = usePhysics
                          ? (physicsPositions[c.id]?.x ?? cX)
                          : cX + centerOffsetX + b_offsetX + leaf_offsetX;
                        const cY_rendered = usePhysics
                          ? (physicsPositions[c.id]?.y ?? cY)
                          : cY + centerOffsetY + b_offsetY + leaf_offsetY;

                        return (
                          <React.Fragment key={`group-right-leaf-${c.id}`}>
                            {/* Leaf card */}
                            <div 
                              ref={(el) => { if (el) bindDrag(el, c.id); }}
                              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 interactive-node transition-all hover:scale-[1.02] cursor-move"
                              style={{ left: cX_rendered, top: cY_rendered }}
                            >
                              {(() => {
                                 const leafStyle = getLeafNodeStyle(b.color, 'right', !!c.original.children);
                                 return (
                                   <div
                                     onClick={() => c.original.children && toggleNodeCollapse(c.id)}
                                     className={leafStyle.className}
                                     style={leafStyle.styles}
                                   >
                                     <span 
                                       className={`font-semibold leading-relaxed ${nodeStyle === 'brutalist' ? 'text-black dark:text-white' : ''}`}
                                       style={getFontSizeStyle('leaf')}
                                     >
                                       {c.title}
                                     </span>
                                     {c.original.children && (
                                       <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-200/50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-md shrink-0">
                                         {isChildCollapsed ? `+${c.original.children.length}` : '−'}
                                       </span>
                                     )}
                                   </div>
                                 );
                              })()}
                            </div>

                            {/* Sub-leaves */}
                            {c.subLeaves.map((s, sIdx) => {
                              const sX = s.x;
                              const sY = s.y;
                              const sId = `sub-${c.id}-${sIdx}`;

                              const s_offsetX = nodeOffsets[sId]?.x || 0;
                              const s_offsetY = nodeOffsets[sId]?.y || 0;

                              const sX_rendered = usePhysics
                                ? (physicsPositions[sId]?.x ?? sX)
                                : sX + centerOffsetX + b_offsetX + leaf_offsetX + s_offsetX;
                              const sY_rendered = usePhysics
                                ? (physicsPositions[sId]?.y ?? sY)
                                : sY + centerOffsetY + b_offsetY + leaf_offsetY + s_offsetY;

                              return (
                                <div 
                                  key={`sub-right-${c.id}-${sIdx}`}
                                  ref={(el) => { if (el) bindDrag(el, sId); }}
                                  className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-[1.01] cursor-move"
                                  style={{ left: sX_rendered, top: sY_rendered }}
                                >
                                  <div 
                                    className={getSubLeafNodeStyle().className}
                                    style={{ width: nodeWidths.leaf - 20, ...getFontSizeStyle('subleaf') }}
                                  >
                                    {s.title}
                                  </div>
                                </div>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* 3. LEFT SIDE BRANCHES & CHILDREN */}
                {leftSideLayout.map((b) => {
                  const isBranchCollapsed = collapsedNodes.has(b.id);
                  const bX = b.x;
                  const bY = b.y;

                  const centerOffsetX = nodeOffsets['center-node']?.x || 0;
                  const centerOffsetY = nodeOffsets['center-node']?.y || 0;

                  const b_offsetX = nodeOffsets[b.id]?.x || 0;
                  const b_offsetY = nodeOffsets[b.id]?.y || 0;

                  const bX_rendered = usePhysics
                    ? (physicsPositions[b.id]?.x ?? bX)
                    : bX + centerOffsetX + b_offsetX;
                  const bY_rendered = usePhysics
                    ? (physicsPositions[b.id]?.y ?? bY)
                    : bY + centerOffsetY + b_offsetY;

                  return (
                    <React.Fragment key={`group-left-${b.id}`}>
                      {/* Branch Node */}
                      <div 
                        ref={(el) => { if (el) bindDrag(el, b.id); }}
                        className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 interactive-node transition-all hover:scale-[1.03] cursor-move"
                        style={{ left: bX_rendered, top: bY_rendered }}
                      >
                        {(() => {
                           const branchStyle = getBranchNodeStyle(b.color, isBranchCollapsed);
                           return (
                             <div 
                               onClick={() => toggleNodeCollapse(b.id)}
                               className={branchStyle.className}
                               style={{ ...branchStyle.styles, ...getFontSizeStyle('branch') }}
                             >
                               {b.children && b.children.length > 0 && (
                                 <span className="text-[9px] px-1.5 py-0.5 bg-black/15 dark:bg-white/10 rounded-full font-bold">
                                   {isBranchCollapsed ? `+${b.children.length}` : '−'}
                                 </span>
                               )}
                               <span className="truncate pr-1 text-right w-full">{b.title}</span>
                             </div>
                           );
                        })()}
                      </div>

                      {/* Leaves */}
                      {b.leaves.map((c) => {
                        const cX = c.x;
                        const cY = c.y;
                        const isChildCollapsed = collapsedNodes.has(c.id);

                        const leaf_offsetX = nodeOffsets[c.id]?.x || 0;
                        const leaf_offsetY = nodeOffsets[c.id]?.y || 0;

                        const cX_rendered = usePhysics
                          ? (physicsPositions[c.id]?.x ?? cX)
                          : cX + centerOffsetX + b_offsetX + leaf_offsetX;
                        const cY_rendered = usePhysics
                          ? (physicsPositions[c.id]?.y ?? cY)
                          : cY + centerOffsetY + b_offsetY + leaf_offsetY;

                        return (
                          <React.Fragment key={`group-left-leaf-${c.id}`}>
                            {/* Leaf card */}
                            <div 
                              ref={(el) => { if (el) bindDrag(el, c.id); }}
                              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 interactive-node transition-all hover:scale-[1.02] cursor-move"
                              style={{ left: cX_rendered, top: cY_rendered }}
                            >
                              {(() => {
                                 const leafStyle = getLeafNodeStyle(b.color, 'left', !!c.original.children);
                                 return (
                                   <div
                                     onClick={() => c.original.children && toggleNodeCollapse(c.id)}
                                     className={leafStyle.className}
                                     style={leafStyle.styles}
                                   >
                                     {c.original.children && (
                                       <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-200/50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-md shrink-0">
                                         {isChildCollapsed ? `+${c.original.children.length}` : '−'}
                                       </span>
                                     )}
                                     <span 
                                       className={`font-semibold leading-relaxed text-right flex-1 ${nodeStyle === 'brutalist' ? 'text-black dark:text-white' : ''}`}
                                       style={getFontSizeStyle('leaf')}
                                     >
                                       {c.title}
                                     </span>
                                   </div>
                                 );
                              })()}
                            </div>

                            {/* Sub-leaves */}
                            {c.subLeaves.map((s, sIdx) => {
                              const sX = s.x;
                              const sY = s.y;
                              const sId = `sub-${c.id}-${sIdx}`;

                              const s_offsetX = nodeOffsets[sId]?.x || 0;
                              const s_offsetY = nodeOffsets[sId]?.y || 0;

                              const sX_rendered = usePhysics
                                ? (physicsPositions[sId]?.x ?? sX)
                                : sX + centerOffsetX + b_offsetX + leaf_offsetX + s_offsetX;
                              const sY_rendered = usePhysics
                                ? (physicsPositions[sId]?.y ?? sY)
                                : sY + centerOffsetY + b_offsetY + leaf_offsetY + s_offsetY;

                              return (
                                <div 
                                  key={`sub-left-${c.id}-${sIdx}`}
                                  ref={(el) => { if (el) bindDrag(el, sId); }}
                                  className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-[1.01] cursor-move"
                                  style={{ left: sX_rendered, top: sY_rendered }}
                                >
                                  <div 
                                    className={getSubLeafNodeStyle().className}
                                    style={{ width: nodeWidths.leaf - 20, ...getFontSizeStyle('subleaf') }}
                                  >
                                    {s.title}
                                  </div>
                                </div>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isSettingsOpen && (
              <>
                {/* Mobile Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="md:hidden absolute inset-0 bg-black/40 backdrop-blur-sm z-[55]"
                  style={{ left: 0, top: 0, right: 0, bottom: 0 }}
                  onClick={() => setIsSettingsOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                  className={`absolute z-[60] bottom-0 left-0 right-0 md:bottom-24 md:right-6 md:left-auto p-5 md:p-6 w-full md:w-[24rem] shadow-2xl border-t md:border max-h-[85vh] md:max-h-[80vh] overflow-y-auto flex flex-col gap-4 origin-bottom md:origin-bottom-right rounded-t-3xl md:rounded-3xl ${nodeStyle === 'brutalist' ? 'md:rounded-none rounded-t-none' : nodeStyle === 'terminal' ? 'md:rounded-none rounded-t-none' : ''} ${getPanelClass()}`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-3 border-slate-200/50 dark:border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <Settings className={`w-4 h-4 text-emerald-500 ${nodeStyle === 'neon' ? 'animate-spin [animation-duration:8s]' : ''}`} />
                        <span className={`text-[12px] font-black tracking-wider uppercase ${nodeStyle === 'brutalist' ? 'font-mono text-[14px] scale-y-105' : ''}`}>
                          Studio Settings
                        </span>
                      </div>
                      {/* Compact Scale Badge / Close Button on Mobile */}
                      <div className="flex items-center gap-2">
                        <div className={`hidden md:block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${nodeStyle === 'brutalist' ? 'border-2 border-black' : 'bg-slate-100 dark:bg-slate-800/85 text-slate-500'}`}>
                          {Math.round(scale * 100)}% zoom
                        </div>
                        <button 
                          onClick={() => setIsSettingsOpen(false)}
                          className="md:hidden p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    </div>

                  {/* Top Segmented Tab Navigation Bar */}
                    <div className={`grid grid-cols-3 gap-1 p-1.5 rounded-xl ${
                      nodeStyle === 'brutalist' 
                        ? 'bg-white border-2 border-black rounded-none' 
                        : nodeStyle === 'neon' 
                          ? 'bg-slate-900 border border-emerald-500/20' 
                          : nodeStyle === 'warm' 
                            ? 'bg-[#ede4d5]/55 border border-[#d6c7b3]' 
                            : 'bg-slate-50 dark:bg-slate-950/75 border border-slate-200/50 dark:border-slate-850/40'
                    }`}>
                      {(['style', 'view', 'export'] as const).map((tab) => {
                        const isActive = settingsTab === tab;
                        return (
                          <button
                            key={tab}
                            onClick={() => setSettingsTab(tab)}
                            className={`py-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 ${getButtonClass(isActive)} ${nodeStyle === 'brutalist' ? 'rounded-none' : ''}`}
                          >
                            {tab === 'style' && <Sliders className="w-3.5 h-3.5" />}
                            {tab === 'view' && <ZoomIn className="w-3.5 h-3.5" />}
                            {tab === 'export' && <Download className="w-3.5 h-3.5" />}
                            {tab === 'style' ? 'Style' : tab === 'view' ? 'Navigate' : 'Export'}
                          </button>
                        );
                      })}
                    </div>

                    {/* Body Content by Category Tab */}
                    <div className="flex flex-col gap-5 min-h-[220px] justify-start py-2">
                      {settingsTab === 'style' && (
                        <div className="flex flex-col gap-4 w-full">
                          {/* 1. Theme Configuration */}
                          <div className="flex flex-col gap-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-500 ${nodeStyle === 'brutalist' ? 'text-black font-mono font-bold' : ''}`}>
                              Visual Theme
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'glass', label: 'Glass', desc: 'Modern', color: '#6366f1' },
                                { id: 'brutalist', label: 'Brutalist', desc: 'Mono flat', color: '#000000' },
                                { id: 'neon', label: 'Neon', desc: 'Glowing', color: '#10b981' },
                                { id: 'warm', label: 'Editorial', desc: 'Serif warm', color: '#d97706' },
                                { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon pulse', color: '#ec4899' },
                                { id: 'academic', label: 'Academic', desc: 'Laid print', color: '#8b5cf6' },
                                { id: 'terminal', label: 'Terminal', desc: 'Phosphor CMD', color: '#00ff66' }
                              ].map((theme) => {
                                const isActive = nodeStyle === theme.id;
                                return (
                                  <button
                                    key={theme.id}
                                    onClick={() => {
                                      setNodeStyle(theme.id as any);
                                      if (theme.id === 'brutalist') {
                                        setLineStyle('solid');
                                      } else if (theme.id === 'neon' || theme.id === 'cyberpunk' || theme.id === 'terminal') {
                                        setLineStyle('neon-glow');
                                      } else {
                                        setLineStyle('solid');
                                      }
                                    }}
                                    className={`p-2.5 rounded-xl text-left border transition-all flex items-start gap-2 ${
                                      isActive 
                                        ? nodeStyle === 'brutalist'
                                          ? 'bg-black text-white border-black rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                          : nodeStyle === 'neon'
                                            ? 'bg-[#10b981]/15 border-[#10b981] text-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                            : nodeStyle === 'warm'
                                              ? 'bg-[#ede4d5] border-[#b09e86] text-[#3c2a1a]'
                                              : nodeStyle === 'cyberpunk'
                                                ? 'bg-pink-500/15 border-pink-500 text-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                                                : nodeStyle === 'academic'
                                                  ? 'bg-[#edd9c0] border-[#8a7258] text-[#4d3a24] font-serif'
                                                  : nodeStyle === 'terminal'
                                                    ? 'bg-[#00ff66]/15 border-[#00ff66] text-[#00ff66] font-mono shadow-[0_0_12px_rgba(0,255,102,0.35)] rounded-none'
                                                    : 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                                        : nodeStyle === 'brutalist'
                                          ? 'bg-white border-slate-300 text-black rounded-none hover:bg-slate-100'
                                          : nodeStyle === 'academic'
                                            ? 'bg-[#fcfbf9] border-[#e2dacb] text-[#554433] hover:bg-[#faf7f2] font-serif'
                                            : nodeStyle === 'terminal'
                                              ? 'bg-black border-zinc-900 text-[#00dd55] hover:bg-zinc-950 hover:border-[#00ff66]/40 font-mono rounded-none'
                                              : nodeStyle === 'cyberpunk'
                                                ? 'bg-[#090514] border-zinc-900 text-pink-400 hover:bg-zinc-950/80 hover:border-pink-500/50'
                                                : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    <div 
                                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 border border-black/10 dark:border-white/10" 
                                      style={{ backgroundColor: theme.color, boxShadow: isActive && ['neon', 'cyberpunk', 'terminal'].includes(theme.id) ? `0 0 8px ${theme.color}` : 'none' }} 
                                    />
                                    <div>
                                      <div className={`text-[11px] font-black leading-none mb-1 ${nodeStyle === 'brutalist' || theme.id === 'terminal' ? 'font-mono' : theme.id === 'academic' ? 'font-serif' : ''}`}>
                                        {theme.label}
                                      </div>
                                      <div className="text-[9px] opacity-70 leading-tight">
                                        {theme.desc}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. Connection Line & Container Sizing Block */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                              <span className={`text-[10px] font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-500 ${nodeStyle === 'brutalist' ? 'text-black font-mono' : ''}`}>
                                Connecting Lines
                              </span>
                              <div className="flex flex-col gap-1 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                                {[
                                  { id: 'solid', label: 'Solid Line' },
                                  { id: 'dashed', label: 'Dashed Line' },
                                  { id: 'neon-glow', label: 'Glowing Line' }
                                ].map((item) => {
                                  const isActive = lineStyle === item.id;
                                  return (
                                    <button
                                      key={item.id}
                                      onClick={() => setLineStyle(item.id as any)}
                                      className={`py-1.5 px-2 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all text-left ${
                                        isActive
                                          ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                      } ${nodeStyle === 'brutalist' || nodeStyle === 'terminal' ? 'rounded-none' : ''}`}
                                    >
                                      {item.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <span className={`text-[10px] font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-500 ${nodeStyle === 'brutalist' ? 'text-black font-mono' : ''}`}>
                                Spacing Factor
                              </span>
                              <div className="flex flex-col gap-1 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                                {[
                                  { id: 'compact', label: 'Compact' },
                                  { id: 'spacious', label: 'Spacious' }
                                ].map((item) => {
                                  const isActive = nodePadding === item.id;
                                  return (
                                    <button
                                      key={item.id}
                                      onClick={() => setNodePadding(item.id as any)}
                                      className={`py-1.5 px-2 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all text-left ${
                                        isActive
                                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                      } ${nodeStyle === 'brutalist' || nodeStyle === 'terminal' ? 'rounded-none' : ''}`}
                                    >
                                      {item.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* 4. Mindmap Layout Pattern Selection */}
                          <div className="flex flex-col gap-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-500 ${nodeStyle === 'brutalist' ? 'text-black font-mono' : ''}`}>
                              Structural Layout Blueprint
                            </span>
                            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                              {[
                                { id: 'dual', label: 'Balanced Split' },
                                { id: 'right', label: 'Right-Only' },
                                { id: 'left', label: 'Left-Only' },
                                { id: 'staggered', label: 'Staggered Depth' },
                                { id: 'compact-flow', label: 'Compact Core' },
                                { id: 'asymmetric-right', label: 'Asymmetric 75%' }
                              ].map((item) => {
                                const isActive = layoutPattern === item.id;
                                return (
                                  <button
                                    key={item.id}
                                    onClick={() => setLayoutPattern(item.id as any)}
                                    className={`py-2 px-1.5 rounded-lg text-[9px] font-black uppercase tracking-wide transition-all text-center ${
                                      isActive
                                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50 scale-[1.01]'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    } ${nodeStyle === 'brutalist' || nodeStyle === 'terminal' ? 'rounded-none' : ''}`}
                                  >
                                    {item.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 5. Text Font Size selection */}
                          <div className="flex flex-col gap-2 pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-500 ${nodeStyle === 'brutalist' ? 'text-black font-mono' : ''}`}>
                                Typography Size
                              </span>
                              <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">
                                {Math.round(textSize * 100)}%
                              </span>
                            </div>
                            <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                              <input
                                type="range"
                                min="0.5"
                                max="3.0"
                                step="0.05"
                                value={textSize}
                                onChange={(e) => setTextSize(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                              />
                              <button
                                onClick={() => setTextSize(1.0)}
                                className="px-2 py-1 rounded text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold uppercase hover:bg-indigo-100 transition-colors shrink-0"
                                title="Reset to 100%"
                              >
                                Reset
                              </button>
                            </div>
                          </div>

                          {/* 6. Fluid Physics Simulation */}
                          <div className="flex flex-col gap-2 pt-1.5 border-t border-slate-200/40 dark:border-slate-800/40">
                            <span className={`text-[10px] font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-500 ${nodeStyle === 'brutalist' ? 'text-black font-mono' : ''}`}>
                              Fluid Physics Simulation
                            </span>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800/40 transition-all hover:border-indigo-400">
                              <div className="flex flex-col gap-0.5 max-w-[70%]">
                                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">Interactive Simulation</span>
                                <span className="text-[8.5px] text-slate-500 leading-tight">Enables natural fluid movement with collision and spring drag lines.</span>
                              </div>
                              <button
                                onClick={() => setUsePhysics(prev => !prev)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ${
                                  usePhysics 
                                    ? (nodeStyle === 'neon' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-indigo-600') 
                                    : 'bg-slate-200 dark:bg-slate-800'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                                    usePhysics ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {settingsTab === 'view' && (
                        <div className="flex flex-col gap-4 w-full">
                          {/* ScaleHUD track */}
                          <div className="flex flex-col items-center gap-2 bg-slate-550/5 dark:bg-slate-950/45 p-4 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Viewport Custom Zoom</span>
                            <span className={`text-3xl font-black ${nodeStyle === 'neon' ? 'text-emerald-450 drop-shadow-[0_0_8px_rgba(16,185,129,0.25)]' : ''}`}>
                              {Math.round(scale * 100)}%
                            </span>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${nodeStyle === 'neon' ? 'bg-emerald-400' : 'bg-gradient-to-r from-teal-450 to-indigo-500'}`}
                                style={{ width: `${Math.min(100, Math.max(10, (scale / 3) * 100))}%` }}
                              />
                            </div>
                          </div>

                          {/* Navigation button controls */}
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleZoom(true)}
                              className={`${getSubButtonClass()} ${nodeStyle === 'brutalist' || nodeStyle === 'terminal' ? 'rounded-none' : ''}`}
                              title="Zoom In"
                            >
                              <ZoomIn className="w-5 h-5 text-emerald-500 shrink-0" />
                              <div className="flex flex-col leading-none text-left gap-1">
                                <span className="text-[11px] font-black uppercase tracking-wider">Zoom In</span>
                                <span className="text-[9px] opacity-50 font-medium">Enlarge details</span>
                              </div>
                            </button>
                            <button
                              onClick={() => handleZoom(false)}
                              className={`${getSubButtonClass()} ${nodeStyle === 'brutalist' || nodeStyle === 'terminal' ? 'rounded-none' : ''}`}
                              title="Zoom Out"
                            >
                              <ZoomOut className="w-5 h-5 text-indigo-500 shrink-0" />
                              <div className="flex flex-col leading-none text-left gap-1">
                                <span className="text-[11px] font-black uppercase tracking-wider">Zoom Out</span>
                                <span className="text-[9px] opacity-50 font-medium">Minimize layout</span>
                              </div>
                            </button>
                          </div>

                          <button
                            onClick={handleResetZoom}
                            className={`${getSubButtonClass()} ${nodeStyle === 'brutalist' || nodeStyle === 'terminal' ? 'rounded-none' : ''} w-full justify-center text-center py-4`}
                            title="Recenter Map View"
                          >
                            <RotateCcw className="w-5 h-5 text-rose-500 shrink-0" />
                            <div className="flex flex-col items-center leading-none gap-1">
                              <span className="text-[11px] font-black uppercase tracking-wider">Recenter Map Canvas</span>
                              <span className="text-[9px] opacity-55 font-medium mt-0.5">Reset zoom and snap to center focus</span>
                            </div>
                          </button>
                        </div>
                      )}

                      {settingsTab === 'export' && (
                        <div className="flex flex-col gap-3 w-full">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 ${nodeStyle === 'brutalist' ? 'text-black font-mono' : ''}`}>
                            Export Document Prints
                          </span>
                          
                          <button
                            onClick={handleExportPng}
                            className={`${getSubButtonClass()} ${nodeStyle === 'brutalist' || nodeStyle === 'terminal' ? 'rounded-none' : ''}`}
                            title="Export High-Res PNG Image"
                          >
                            <ImageIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                            <div className="flex flex-col leading-none text-left gap-1">
                              <span className="text-[11px] font-black uppercase tracking-wider">Save PNG Image</span>
                              <span className="text-[9px] opacity-50 font-medium mt-0.5">High definition crisp graphic format</span>
                            </div>
                          </button>

                          <button
                            onClick={handleExportSvg}
                            className={`${getSubButtonClass()} ${nodeStyle === 'brutalist' || nodeStyle === 'terminal' ? 'rounded-none' : ''}`}
                            title="Export Scalable Vector SVG"
                          >
                            <LayoutTemplate className="w-5 h-5 text-indigo-500 shrink-0" />
                            <div className="flex flex-col leading-none text-left gap-1">
                              <span className="text-[11px] font-black uppercase tracking-wider">Save Vector SVG</span>
                              <span className="text-[9px] opacity-50 font-medium mt-0.5 font-sans">Infinitely scalable lossless vector format</span>
                            </div>
                          </button>

                          <button
                            onClick={handleExportPdf}
                            className={`${getSubButtonClass()} ${nodeStyle === 'brutalist' || nodeStyle === 'terminal' ? 'rounded-none' : ''}`}
                            title="Print to PDF Document"
                          >
                            <FileText className="w-5 h-5 text-rose-500 shrink-0" />
                            <div className="flex flex-col leading-none text-left gap-1">
                              <span className="text-[11px] font-black uppercase tracking-wider">Save PDF Document</span>
                              <span className="text-[9px] opacity-50 font-medium mt-0.5 font-sans">Standard print-ready document</span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Unified Studio Control Center Overlay (Bottom Right Floating Panel) */}
          <div className="absolute bottom-[84px] md:bottom-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-6 z-50 select-none font-sans pointer-events-auto flex flex-col items-center md:items-end gap-3">

            {/* Main Floating Trigger Button */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex items-center justify-center gap-2.5 h-12 md:h-14 px-5 md:px-6 text-[12px] font-black uppercase tracking-wider shadow-2xl transition-all select-none hover:scale-102 z-[70] ${
                nodeStyle === 'brutalist'
                  ? 'bg-yellow-300 text-black border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : nodeStyle === 'neon'
                    ? 'bg-slate-950 text-emerald-400 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] rounded-full md:rounded-xl'
                    : nodeStyle === 'warm'
                      ? 'bg-[#fcf9f4] text-[#3c2a1a] border-2 border-[#d6c7b3] font-serif rounded-full md:rounded-xl'
                      : nodeStyle === 'cyberpunk'
                        ? 'bg-[#090514] text-pink-500 border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-full md:rounded-xl'
                        : nodeStyle === 'academic'
                          ? 'bg-[#faf6ee] text-[#2c1d11] border-[1.5px] border-[#8a755d] rounded-full md:rounded-lg shadow-lg font-serif'
                          : nodeStyle === 'terminal'
                            ? 'bg-black text-[#00ff66] border border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.2)] font-mono rounded-none'
                            : 'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-205/65 dark:border-slate-800/65 rounded-full md:rounded-2xl'
              }`}
            >
              <Settings className={`w-4.5 h-4.5 shrink-0 ${isSettingsOpen ? 'rotate-90 text-emerald-500' : 'text-slate-600 dark:text-slate-400'} transition-all duration-300`} />
              <span className="hidden sm:inline">Studio Controls</span>
              <span className="sm:hidden">Settings</span>
            </button>
          </div>

          {/* Mobile Drag Instruction Indicator */}
          <div className="absolute bottom-[20px] md:bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 md:left-6 md:translate-x-0 bg-slate-900/80 text-white dark:bg-slate-100/95 dark:text-slate-900 rounded-full font-black text-[10px] uppercase tracking-widest backdrop-blur-sm z-40 pointer-events-none opacity-50 hidden md:flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 animate-bounce" /> Pinch / Drag
          </div>

        </div>
      )}

    </div>
  );
};

interface MindmapPromptMenuProps {
  isOpen: boolean;
  onClose: () => void;
  handleLoadSample: (sample: any) => void;
}

const MindmapPromptMenu: React.FC<MindmapPromptMenuProps> = ({ isOpen, onClose, handleLoadSample }) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'presets'>('prompt');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  
  // Dynamic checklist branches
  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    'goals', 'structures', 'dynamics', 'risks'
  ]);

  const toggleBranch = (id: string) => {
    if (selectedBranches.includes(id)) {
      if (selectedBranches.length > 1) { // keep at least 1 branch
        setSelectedBranches(selectedBranches.filter(b => b !== id));
      }
    } else {
      setSelectedBranches([...selectedBranches, id]);
    }
  };

  const branchDefinitions = [
    { id: 'goals', title: '🎯 Goals & Objectives', desc: 'Core purpose, clinical indications, target metrics.', color: '#ef4444' },
    { id: 'structures', title: '⚙️ Structural Elements', desc: 'Physical systems, subsystems, or architecture layers.', color: '#3b82f6' },
    { id: 'dynamics', title: '⏱️ Dynamics & Flows', desc: 'Process chains, state loops, sequential interactions.', color: '#10b981' },
    { id: 'risks', title: '⚠️ Vulnerabilities / Risks', desc: 'Breakdowns, critical path failures, constraints.', color: '#f59e0b' },
    { id: 'remedies', title: '🛠️ Mitigation Actions', desc: 'Interventional protocols, redundancy plans.', color: '#a855f7' }
  ];

  // Helper arrays for presets mapping
  const branchListTextMap = branchDefinitions
    .filter(branch => selectedBranches.includes(branch.id))
    .map(branch => `"- ${branch.title} (${branch.desc})"`).join('\n          ');

  const generatedPrompt = `I need you to generate a structured Mindmap data structure for a central topic. 
Please yield the result in this exact, verified JSON format:
{
  "title": "A high-fidelity central topic name (e.g. Mitochondrion Metabolism)",
  "branches": [
    {
      "id": "b1",
      "title": "Selected High-Level Branch Title",
      "color": "#ef4444",
      "side": "right",
      "children": [
        { 
          "title": "Sub-element explanation detail",
          "children": []
        }
      ]
    }
  ]
}

Please structure the map around these categories:
${branchListTextMap}

Rule: Output ONLY compliant minified JSON (wrapped inside simple backticks blocks). Do not write any general conversation text or explanations.`;

  const handleCopyPromptText = () => {
    copyToClipboard(generatedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Portal render
  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-hidden text-left">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                AI Prompt Builder & Presets
              </h3>
            </div>
            <p className="text-emerald-500 font-extrabold text-[9px] uppercase tracking-wider">
              Optimize prompts and datasets for pristine mapping networks
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0 px-4 sm:px-6 py-2 gap-1 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex-1 sm:flex-none px-4 py-2 font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'prompt'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            💡 Dynamic Prompt Builder
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 sm:flex-none px-4 py-2 font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'presets'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📚 Sandbox Preset Demos
          </button>
        </div>

        {/* Scrollable Content Pane */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {activeTab === 'prompt' ? (
            <div className="space-y-4">
              {/* Category Instruction Box */}
              <div className="p-3.5 bg-emerald-50/55 dark:bg-emerald-950/10 border border-emerald-500/15 rounded-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                Select your preferred branches from the checklist below to dynamically compile a tailored prompt. Paste it into your LLM of choice to instantly output beautiful structured mindmaps!
              </div>

              {/* Checkboxes List */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Select Mindmap Branch Modules:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {branchDefinitions.map((branch) => {
                    const active = selectedBranches.includes(branch.id);
                    return (
                      <button
                        key={branch.id}
                        onClick={() => toggleBranch(branch.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          active
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/25 border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white'
                            : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => {}} // toggled in parent button handler
                          className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-0 shrink-0 pointer-events-none"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-black truncate leading-tight">{branch.title}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 leading-normal">{branch.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Live Prompt Preview */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Compiled AI System Prompt:
                  </span>
                  <button
                    onClick={handleCopyPromptText}
                    className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Copy Compiled Prompt
                  </button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 sm:p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 font-mono text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 w-full h-32 overflow-y-auto break-all custom-scrollbar shrink-0">
                  {generatedPrompt}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/55 dark:bg-blue-950/10 border border-blue-500/15 rounded-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                Experiment instantly on the layout canvas by directly injecting high-fidelity science, biology, fullstack software engineering, or self-testing workflow presets.
              </div>

              {/* Sandboxes Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { handleLoadSample(REPLICATION_VS_TRANSCRIPTION_SAMPLE); onClose(); }}
                  className="p-3.5 bg-white dark:bg-slate-905 hover:bg-emerald-50/15 dark:hover:bg-emerald-900/10 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between transition-all hover:border-emerald-500/30 group active:scale-99 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🧬</span>
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">Biology: Replication vs Transcription</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Compares base-pairing, polymerase templates, dNTP usage and fidelity indices.</p>
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                </button>

                <button
                  onClick={() => { handleLoadSample(WEB_DEV_STACK_SAMPLE); onClose(); }}
                  className="p-3.5 bg-white dark:bg-slate-905 hover:bg-emerald-50/15 dark:hover:bg-emerald-900/10 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between transition-all hover:border-emerald-500/30 group active:scale-99 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💻</span>
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">Tech: Fullstack Developer Ecosystem</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Maps out frontend frameworks, Express, PostgreSQL, NoSQL layers and pipeline systems.</p>
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                </button>

                <button
                  onClick={() => { handleLoadSample(PRODUCTIVITY_STUDY_SAMPLE); onClose(); }}
                  className="p-3.5 bg-white dark:bg-slate-905 hover:bg-emerald-50/15 dark:hover:bg-emerald-900/10 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between transition-all hover:border-emerald-500/30 group active:scale-99 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🧠</span>
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">Cognitive: Study & Memory Methodologies</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Deconstructs Spaced Repetition, Active Recall tricks, Pomodoro, and Feynman approaches.</p>
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-150 dark:border-slate-800 shrink-0 flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-white font-black uppercase text-[10px] sm:text-xs rounded-xl hover:bg-slate-150 dark:hover:bg-slate-700 transition-all text-center"
          >
            Cancel
          </button>
          
          {activeTab === 'prompt' && (
            <button
              onClick={handleCopyPromptText}
              className={`w-full sm:w-auto px-6 py-2.5 font-black uppercase text-[10px] sm:text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${
                copiedPrompt
                  ? 'bg-emerald-600 border-emerald-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/10 hover:shadow-indigo-500/25'
              }`}
            >
              {copiedPrompt ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
              {copiedPrompt ? "Prompt Copied!" : "Copy Tailored Prompt"}
            </button>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

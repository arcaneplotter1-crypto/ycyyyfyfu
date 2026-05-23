import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PresentationData, SlideData, SlideType } from '../../presentationTypes';
import { 
  Copy, 
  Check, 
  FileCode, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  LayoutTemplate, 
  Sparkles, 
  X, 
  RotateCcw, 
  AlertTriangle, 
  SlidersHorizontal,
  Layers,
  FileText,
  Info 
} from 'lucide-react';
import { copyToClipboard } from '../../utils';

export const parseCSV = (text: string): Record<string, string>[] => {
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === '\n' && !insideQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else if (char === '\r' && !insideQuotes) {
      // skip \r
    } else {
      currentLine += char;
    }
  }
  if (currentLine) lines.push(currentLine);

  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const result: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const values: string[] = [];
    let currentVal = '';
    let inQuote = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(currentVal);
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal);

    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] || '';
    });
    result.push(obj);
  }

  return result;
};

interface PresentationParserProps {
  onParsed: (data: PresentationData) => void;
  onCancel: () => void;
}

export const PresentationParser: React.FC<PresentationParserProps> = ({ onParsed, onCancel }) => {
  const [slideTypes, setSlideTypes] = useState<string[]>([
    'title', 'agenda', 'text', 'image-text', 'images', 'split-text', 'quote', 
    'bullets', 'chart', 'grid', 'process', 'timeline', 'team', 
    'medical-title', 'medical-contents', 'medical-split', 'medical-columns'
  ]);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [parseText, setParseText] = useState('');
  const [error, setError] = useState('');

  const handleLoadSample = () => {
    const sampleSlides: any[] = [];
    
    // 1. Cover
    if (slideTypes.includes('medical-title')) {
      sampleSlides.push({
        type: 'medical-title',
        title: 'Eye & ENT Manifestations of **Skull Base Fracture**',
        subtitle: 'A Comprehensive Science-Supported Case Brief on Diagnosis & Trauma Management',
        categories: ['Ophthalmology', 'Otolaryngology', 'Emergency Medicine']
      });
    } else if (slideTypes.includes('title')) {
      sampleSlides.push({
        type: 'title',
        title: 'Neuro-Ophthalmic Emergencies Overview',
        subtitle: 'Clinical Diagnosis Pathways',
        author: 'Interdisciplinary Trauma Team'
      });
    }

    // 2. Contents
    if (slideTypes.includes('medical-contents')) {
      sampleSlides.push({
        type: 'medical-contents',
        eyebrow: 'PRESENTATION OVERVIEW',
        title: 'Core Syllabus Index',
        items: [
          { id: 'mc-1', number: '01', title: 'Cranial Base Architecture', description: 'Deconstruct structural weakness zones and load propagation kinetics' },
          { id: 'mc-2', number: '02', title: 'Surgical & Ophthalmic Triages', description: 'Diagnostic hallmarks including tarsal-sparing hematomas' },
          { id: 'mc-3', number: '03', title: 'Rhinorrhea & Fluid Analyses', description: 'Testing beta-2 transferrin and local meningeal repair timelines' },
          { id: 'mc-4', number: '04', title: 'Multispecialty Interventions', description: 'Conservative watch, decompression timings, and mechanical corrections' }
        ]
      });
    } else if (slideTypes.includes('agenda')) {
      sampleSlides.push({
        type: 'agenda',
        title: 'Agenda and Outline',
        items: ['Anatomical Overview', 'Diagnostic Criteria', 'Clinical Case Studies', 'Management Pathways']
      });
    }

    // 3. Split (Anatomy Distribution)
    if (slideTypes.includes('medical-split')) {
      sampleSlides.push({
        type: 'medical-split',
        eyebrow: 'TRAUMA KINETICS',
        title: 'Skull Base Architecture & Fracture Spread',
        leftCard: {
          title: 'Cranial Floor Divisions',
          imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80',
          caption: 'Anterior cranial fossa holds 70% of clinical fracture incidents'
        },
        rightCards: [
          {
            id: 'rc-p1',
            type: 'progress',
            title: 'Fossa Involvement Rates',
            progressItems: [
              { label: 'Anterior Cranial Fossa', value: 70 },
              { label: 'Middle Skull Fossa', value: 20 },
              { label: 'Posterior Cranial Fossa', value: 10 }
            ]
          },
          {
            id: 'rc-i1',
            type: 'icons',
            title: 'Primary Road Traffic Etiologies',
            iconItems: [
              { text: 'Unrestrained vehicle collision impact', icon: 'zap' },
              { text: 'Pedestrian impact accidents', icon: 'activity' },
              { text: 'Traumatic industrial falls', icon: 'shield' }
            ]
          },
          {
            id: 'rc-k1',
            type: 'keypoint',
            text: 'Critical Warning: Bone fragility at cribriform plates elevates risk of dural shear tears and rhinorrhoea.'
          }
        ]
      });
    } else if (slideTypes.includes('split-text')) {
      sampleSlides.push({
        type: 'split-text',
        title: 'Anatomy Review',
        leftContent: '### Anterior Fossa\n- Cribriform plate is extremely thin.\n- Subject to **Dural shear** tearing.',
        rightContent: '### Middle Fossa\n- Houses cranial nerves CN VII, VIII.\n- Fractures may cause facial palsy.'
      });
    }

    // 4. Columns
    if (slideTypes.includes('medical-columns')) {
      sampleSlides.push({
        type: 'medical-columns',
        eyebrow: 'DIAGNOSTIC CLASSIFICATIONS',
        title: 'Visual Management & Clinical Refractive Errors',
        columns: [
          {
            id: 'col-1',
            title: 'Clinical Hyperopia',
            icon: 'eye',
            imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
            description: 'Hyperopic optical blur hinders near task focus, adding substantial baseline accommodative strain.',
            bullets: [
              'Near points demand strong visual effort',
              'May precipitate systemic ocular fatigue symptoms'
            ],
            management: 'Correction with convex lenses; periodic focus stability assessments.'
          },
          {
            id: 'col-2',
            title: 'Irregular Astigmatism',
            icon: 'zap',
            imageUrl: 'https://images.unsplash.com/photo-1576091159349-8974343550fb?w=400&q=80',
            description: 'Asymmetric corneal axes scatter light rays, generating distortion across deep fields.',
            bullets: [
              'Distorts letter edges on high contrast screens',
              'Often coexists with vertical squinting'
            ],
            management: 'Employ custom toric or cylindrical lenses; configure corneal scans.'
          },
          {
            id: 'col-3',
            title: 'Accommodative Fatigue',
            icon: 'shield',
            imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80',
            description: 'Gradual decay in crystalline lens elasticity inhibits prompt near focal updates.',
            bullets: [
              'Slow transitions from near to far items',
              'Decreases study endurance in evening hours'
            ],
            management: 'Recommend anti-fatigue lifestyle lenses and micro-prism guides.'
          }
        ],
        keypoint: '**Clinical Pearl:** Full cycloplegic refraction must validate young pediatric focus complaints.'
      });
    } else if (slideTypes.includes('bullets')) {
      sampleSlides.push({
        type: 'bullets',
        title: 'Critical Triage Priorities',
        bullets: [
          '**Securing airway & hemodynamic stabilization** immediately',
          'Establishing continuous cranial pressure monitoring',
          'Performing neuroimaging scans within the **Golden Hour**'
        ]
      });
    }

    // 5. High-Impact Slide Types (images, quote, process, chart, timeline, grid, etc.)
    if (slideTypes.includes('chart')) {
      sampleSlides.push({
        type: 'chart',
        title: 'Intracranial Pressure Progression Insights',
        subtitle: 'Mean ventricular pressure (mmHg) over 24-Hour trauma period',
        data: [
          { name: 'Hour 0', value: 8 },
          { name: 'Hour 4', value: 12 },
          { name: 'Hour 8', value: 19 },
          { name: 'Hour 12', value: 25 },
          { name: 'Hour 16', value: 16 },
          { name: 'Hour 20', value: 11 },
          { name: 'Hour 24', value: 9 }
        ]
      });
    }

    if (slideTypes.includes('grid')) {
      sampleSlides.push({
        type: 'grid',
        title: 'Trauma Impact Framework (SWOT)',
        items: [
          { title: 'Strengths', description: 'Early multidisciplinary trauma activations optimize dural repair timing.', icon: 'Shield' },
          { title: 'Weaknesses', description: 'Delayed detection of CSF rhinorrhea creates a high risk of meningitis.', icon: 'AlertTriangle' },
          { title: 'Opportunities', description: 'Integrating bedside glucose strip metrics aids in rapid nasal fluid scans.', icon: 'Zap' },
          { title: 'Threats', description: 'Extravasating hematoma can lead to secondary ophthalmic nerve shear.', icon: 'Eye' }
        ]
      });
    }

    if (slideTypes.includes('timeline')) {
      sampleSlides.push({
        type: 'timeline',
        title: 'Dural Bleed Reabsorption Roadmap',
        items: [
          { date: 'Day 1-2', title: 'Initial Coagulum', description: 'Fibrin anchors dural boundaries while serum clears.' },
          { date: 'Day 3-5', title: 'Macro Clearance', description: 'Leukocyte infiltrates commence clearing the primary hematoma.' },
          { date: 'Day 7-10', title: 'Fibrous Healing', description: 'Granulation tissue solidifies, sealing the cribriform tract.' }
        ]
      });
    }

    if (slideTypes.includes('process')) {
      sampleSlides.push({
        type: 'process',
        title: 'CSF Leak Diagnostics Routine',
        items: [
          { label: 'Sample', description: 'Collect clear, non-viscous fluid outflow from the nasal vault.' },
          { label: 'Screen', description: 'Analyze beta-2 transferrin or double-ring pattern on raw linen.' },
          { label: 'Locate', description: 'Run high-resolution bone-window CT skull base contrast scans.' },
          { label: 'Intervene', description: 'Enforce complete bedrest with head elevation at a 30-degree tilt.' }
        ]
      });
    }

    if (slideTypes.includes('quote')) {
      sampleSlides.push({
        type: 'quote',
        quote: "The visual organ is the mirror of cranial trauma. Sparing of the tarsal plate tells you Raccoon Eyes are born from intracranial fractures, not localized orbital impact.",
        author: "Principles of Interdisciplinary Craniofacial Injuries"
      });
    }

    setParseText(JSON.stringify(sampleSlides, null, 2));
    setError('');
  };

  const handleParse = () => {
    setError('');
    if (!parseText.trim()) {
      setError('Please paste JSON or CSV data first.');
      return;
    }

    try {
      let rawData: any[] = [];
      const textTrimmed = parseText.trim();
      
      if (textTrimmed.startsWith('[') || textTrimmed.startsWith('{')) {
        const parsed = JSON.parse(textTrimmed);
        rawData = Array.isArray(parsed) ? parsed : (parsed.slides ? parsed.slides : [parsed]);
      } else if (textTrimmed.includes(',')) {
        rawData = parseCSV(textTrimmed);
        if (rawData.length === 0) {
           setError('Failed to parse CSV data.');
           return;
        }
      } else {
        setError('Format not recognized. Please paste valid JSON or CSV.');
        return;
      }

      const slides: SlideData[] = rawData.map((item: any, index: number): SlideData => {
        const type = (item.type || item.Type || 'text').toLowerCase() as SlideType;
        const base = { id: `slide-${index}-${Date.now()}` };
        switch (type) {
          case 'title': return { ...base, type: 'title', title: item.title || item.Title || 'Untitled', subtitle: item.subtitle || item.Subtitle, author: item.author || item.Author, date: item.date || item.Date };
          case 'agenda': return { ...base, type: 'agenda', title: item.title || item.Title || 'Agenda', items: Array.isArray(item.items) ? item.items : (item.items ? String(item.items).split('|') : []) };
          case 'split-text': return { ...base, type: 'split-text', title: item.title || item.Title || '', leftContent: item.leftContent || item.LeftContent || '', rightContent: item.rightContent || item.RightContent || '' };
          case 'image-text': return { ...base, type: 'image-text', title: item.title || item.Title || '', textContent: item.textContent || item.content || item.TextContent || item.Content || '', imageUrl: item.imageUrl || item.ImageUrl || '', imagePosition: (item.imagePosition || item.ImagePosition) === 'right' ? 'right' : (item.imagePosition === 'top' ? 'top' : (item.imagePosition === 'bottom' ? 'bottom' : 'left')) };
          case 'images': return { ...base, type: 'images', title: item.title || item.Title || '', images: Array.isArray(item.images) ? item.images : (item.images ? String(item.images).split('|') : []) };
          case 'quote': return { ...base, type: 'quote', quote: item.quote || item.content || item.Quote || item.Content || '', author: item.author || item.Author || '' };
          case 'bullets': return { ...base, type: 'bullets', title: item.title || item.Title || '', bullets: Array.isArray(item.bullets) ? item.bullets : (item.bullets ? String(item.bullets).split('|') : []) };
          case 'chart': return { ...base, type: 'chart', title: item.title || item.Title || '', subtitle: item.subtitle || item.Subtitle || '', data: Array.isArray(item.data) ? item.data : [] };
          case 'grid': return { ...base, type: 'grid', title: item.title || item.Title || 'Objectives', items: Array.isArray(item.items) ? item.items : [] };
          case 'process': return { ...base, type: 'process', title: item.title || item.Title || 'Process', items: Array.isArray(item.items) ? item.items : [] };
          case 'timeline': return { ...base, type: 'timeline', title: item.title || item.Title || 'Timeline', items: Array.isArray(item.items) ? item.items : [] };
          case 'team': return { ...base, type: 'team', title: item.title || item.Title || 'Our Team', members: Array.isArray(item.members) ? item.members : [] };
          case 'medical-title': return { ...base, type: 'medical-title', title: item.title || item.Title || 'Untitled', subtitle: item.subtitle || item.Subtitle, categories: Array.isArray(item.categories) ? item.categories : (item.categories ? String(item.categories).split('|') : []) };
          case 'medical-contents': return { ...base, type: 'medical-contents', eyebrow: item.eyebrow || item.Eyebrow || '', title: item.title || item.Title || 'Contents', items: Array.isArray(item.items) ? item.items : [] };
          case 'medical-split': return { ...base, type: 'medical-split', eyebrow: item.eyebrow || item.Eyebrow || '', title: item.title || item.Title || '', leftCard: item.leftCard || { title: '', imageUrl: '', caption: '' }, rightCards: Array.isArray(item.rightCards) ? item.rightCards : [] };
          case 'medical-columns': return { ...base, type: 'medical-columns', eyebrow: item.eyebrow || item.Eyebrow || '', title: item.title || item.Title || '', columns: Array.isArray(item.columns) ? item.columns : [], keypoint: item.keypoint || item.Keypoint || '' };
          case 'text':
          default: return { ...base, type: 'text', title: item.title || item.Title || '', content: item.content || item.text || item.Content || item.Text || '' };
        }
      });

      onParsed({
        id: `pres-${Date.now()}`,
        title: 'New Presentation',
        slides,
        createdAt: Date.now()
      });
    } catch (e: any) {
      setError('Failed to parse: ' + e.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-12 px-2.5 sm:px-4 space-y-6 sm:space-y-10">
      {/* Header Panel inspired by PDF Mode */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-4 sm:gap-6">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={onCancel} 
            className="p-2 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm group text-indigo-500 shrink-0"
            title="Go back to Home"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="space-y-0.5 sm:space-y-1">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
              Load Data
            </h2>
            <p className="text-indigo-500 font-black text-[9px] sm:text-[11px] uppercase tracking-[0.2em] leading-none">
              Paste presentation JSON or CSV slides
            </p>
          </div>
        </div>
        
        {/* Responsive buttons panel */}
        <div className="flex flex-wrap justify-stretch md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowPromptMenu(true)}
            className="flex-1 sm:flex-none px-3 py-2.5 sm:px-6 sm:py-3.5 bg-indigo-50 dark:bg-indigo-900/20 border-b-4 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[10px] sm:text-xs rounded-xl sm:rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:border-indigo-300 transition-all flex items-center justify-center gap-1.5 sm:gap-2.5 shadow-sm active:translate-y-1 active:border-b-0"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> AI Prompt
          </button>
          <button
            onClick={handleLoadSample}
            className="flex-1 sm:flex-none px-3 py-2.5 sm:px-6 sm:py-3.5 bg-white dark:bg-slate-900 border-b-4 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[10px] sm:text-xs rounded-xl sm:rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5 sm:gap-2.5 shadow-sm active:translate-y-1 active:border-b-0"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin-once" /> Load Sample
          </button>
        </div>
      </div>

      {/* AI Prompt modal overlay (Portalized) */}
      <AnimatePresence>
        {showPromptMenu && (
          <SlideTypesMenu 
            slideTypes={slideTypes} 
            setSlideTypes={setSlideTypes} 
            onClose={() => setShowPromptMenu(false)} 
          />
        )}
      </AnimatePresence>

      {/* Glowing Container Box for Content with Error Indicators */}
      <div className="relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 rounded-[2rem] sm:rounded-[2.5rem] blur-xl opacity-10 group-hover:opacity-15 transition duration-1000"></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-1 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
          <textarea
            value={parseText}
            onChange={(e) => {
              setParseText(e.target.value);
              setError('');
            }}
            placeholder={`Paste slides data here...\n\nExample schema (JSON array):\n[\n  {\n    "type": "title",\n    "title": "Clinical Case Studies",\n    "subtitle": "Trauma Triages"\n  },\n  {\n    "type": "medical-contents",\n    "eyebrow": "SYLLABUS",\n    "title": "Modules Outline",\n    "items": [{"number": "01", "title": "Cranial Fossa", "description": "Mechanics..."}]\n  }\n]`}
            className="w-full h-[280px] sm:h-[350px] md:h-[450px] lg:h-[550px] p-4 sm:p-6 md:p-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-[1.3rem] sm:rounded-[1.8rem] font-mono text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-0 outline-none transition-all resize-none border-none text-slate-900 dark:text-slate-100"
          />
        </div>
        
        {/* Error overlay alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 flex items-center gap-3 text-white font-black text-xs uppercase bg-gradient-to-r from-red-500 to-rose-600 px-5 py-3.5 rounded-2xl shadow-xl z-20 border border-red-400/20"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" /> 
              <span className="truncate">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary chunky generate action block */}
      <div className="flex justify-center pt-2 sm:pt-4">
        <button
          onClick={handleParse}
          disabled={!parseText.trim()}
          className="group relative px-8 py-4 sm:px-12 sm:py-5.5 md:px-14 md:py-6.5 bg-indigo-600 text-white font-black text-base sm:text-lg uppercase tracking-wider rounded-2xl sm:rounded-[2rem] shadow-[0_8px_0_#312e81] hover:shadow-[0_4px_0_#312e81] hover:translate-y-1 active:shadow-none active:translate-y-1.5 disabled:opacity-50 transition-all flex items-center gap-3"
        >
          START PRESENTATION
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

/* Interactive Overlay Slide Types Menu */
interface SlideTypesMenuProps {
  slideTypes: string[];
  setSlideTypes: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
}

const SlideTypesMenu: React.FC<SlideTypesMenuProps> = ({ slideTypes, setSlideTypes, onClose }) => {
  const [copied, setCopied] = useState(false);

  const availableSlidesMetaData = [
    { id: 'title', label: 'Cover Title', desc: 'Display title, description, and author profile with modern accents.', cat: 'Standard' },
    { id: 'agenda', label: 'Index Agenda', desc: 'Sleek index/agenda mapping list items elegantly.', cat: 'Standard' },
    { id: 'text', label: 'Standard Text', desc: 'Focus-centric card supporting markdown text column styling.', cat: 'Standard' },
    { id: 'split-text', label: 'Split text columns', desc: 'Double columns side-by-side; excellent for comparative lists.', cat: 'Standard' },
    { id: 'image-text', label: 'Responsive Image Text', desc: 'Framer text columns alongside custom image references.', cat: 'Standard' },
    { id: 'images', label: 'Image Gallery', desc: 'Showcase multiple clinical scans or graphic illustrations in a row.', cat: 'Standard' },
    { id: 'quote', label: 'Impact Quote', desc: 'Enormous display text with quote author metadata.', cat: 'Standard' },
    { id: 'bullets', label: 'Bento Bullets', desc: 'Highlighted priority list blocks to emphasize core items.', cat: 'Standard' },
    { id: 'chart', label: 'Dynamic Analytics Chart', desc: 'Sleek Recharts analytical visual bar or line graph.', cat: 'Standard' },
    { id: 'grid', label: 'Objective Grid', desc: '2x2 quadrants list representing SWOT analysis or feature grid.', cat: 'Standard' },
    { id: 'process', label: 'Operation Process', desc: 'Linear process flows or visual steps linked in a chain.', cat: 'Standard' },
    { id: 'timeline', label: 'Historical Timeline', desc: 'Sequential milestone nodes aligned with years and descriptions.', cat: 'Standard' },
    { id: 'team', label: 'Our Team', desc: 'Clean cards containing biographies, roles, and profiles.', cat: 'Standard' },
    { id: 'medical-title', label: 'Clinical Case Title', desc: 'Subtle high-contrast medical covers with patient category tags.', cat: 'Clinical' },
    { id: 'medical-contents', label: 'Syllabus Outline', desc: 'Displays clinical numbers alongside disease index pathways.', cat: 'Clinical' },
    { id: 'medical-split', label: 'Clinical Case Split', desc: 'Displays medical scans adjacent to progress lists or parameters.', cat: 'Clinical' },
    { id: 'medical-columns', label: 'Triple Diagnostic Columns', desc: 'Three-column comparisons featuring diseases, symptoms, and treatment.', cat: 'Clinical' }
  ];

  const handleToggle = (id: string) => {
    setSlideTypes(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const applyPreset = (preset: 'all' | 'clinical' | 'standard' | 'none') => {
    switch (preset) {
      case 'all':
        setSlideTypes(availableSlidesMetaData.map(x => x.id));
        break;
      case 'clinical':
        setSlideTypes(['title', 'medical-title', 'medical-contents', 'medical-split', 'medical-columns', 'text', 'agenda']);
        break;
      case 'standard':
        setSlideTypes(['title', 'agenda', 'text', 'split-text', 'image-text', 'images', 'quote', 'bullets', 'chart', 'grid', 'process', 'timeline', 'team']);
        break;
      case 'none':
        setSlideTypes(['title']);
        break;
    }
  };

  const executeCopyPrompt = () => {
    const activeTypes = availableSlidesMetaData.filter(x => slideTypes.includes(x.id));
    
    let promptText = `Act as an expert content advisor. Generate a complete and professional presentation slideshow.
Our visual slideshow engine processes slide structures in a root JSON array, where each item in the array represents a single slide.

The final output MUST be a valid JSON array of objects, containing ONLY the following allowed slide types:
${slideTypes.join(', ')}

Please structure the presentation about the requested topic using these slide schemas:
`;

    if (slideTypes.includes('title')) {
      promptText += `\n- title (Standard Cover)
  { "type": "title", "title": "Main Clear Title", "subtitle": "Details of the topic", "author": "Presenter", "date": "Current Date" }`;
    }
    if (slideTypes.includes('agenda')) {
      promptText += `\n- agenda (Numbered Index list)
  { "type": "agenda", "title": "Index Outline", "items": ["Chapter A", "Chapter B", "Chapter C"] }`;
    }
    if (slideTypes.includes('text')) {
      promptText += `\n- text (Single Column markdown text)
  { "type": "text", "title": "Slide Title", "content": "Visual markdown text containing **bolds** or *italics*" }`;
    }
    if (slideTypes.includes('split-text')) {
      promptText += `\n- split-text (Two Column markdown text)
  { "type": "split-text", "title": "Slide Title", "leftContent": "Left column details", "rightContent": "Right column details" }`;
    }
    if (slideTypes.includes('image-text')) {
      promptText += `\n- image-text (Text alongside image)
  { "type": "image-text", "title": "Slide Title", "textContent": "Paragraph of details", "imageUrl": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80", "imagePosition": "left" | "right" | "top" | "bottom" }`;
    }
    if (slideTypes.includes('images')) {
      promptText += `\n- images (Multiple side-by-side images)
  { "type": "images", "title": "Image Grid Title", "images": ["unspashurl1", "unsplashurl2"] }`;
    }
    if (slideTypes.includes('quote')) {
      promptText += `\n- quote (Emphasis pullquote card)
  { "type": "quote", "quote": "Dynamic key tagline text...", "author": "Citation of Source" }`;
    }
    if (slideTypes.includes('bullets')) {
      promptText += `\n- bullets (Highlights points list)
  { "type": "bullets", "title": "Core Key Takeaways", "bullets": ["**Major point** with details", "**Secondary point** details"] }`;
    }
    if (slideTypes.includes('chart')) {
      promptText += `\n- chart (Recharts analytical visualization)
  { "type": "chart", "title": "Quantitative Metrics", "subtitle": "Y-Axis description", "data": [{ "name": "Segment A", "value": 75 }, { "name": "Segment B", "value": 110 }] }`;
    }
    if (slideTypes.includes('grid')) {
      promptText += `\n- grid (SWOT or Quadrant objective card)
  { "type": "grid", "title": "Matrix Assessment", "items": [{ "title": "Objective 1", "description": "Details...", "icon": "Target" | "Shield" | "Eye" | "Zap" }] }`;
    }
    if (slideTypes.includes('process')) {
      promptText += `\n- process (Horizontal workflow steps progression)
  { "type": "process", "title": "Step Flow", "items": [{ "label": "Draft", "description": "Formulating keys..." }] }`;
    }
    if (slideTypes.includes('timeline')) {
      promptText += `\n- timeline (Milestones over time)
  { "type": "timeline", "title": "Project Roadmap", "items": [{ "date": "2026", "title": "Launch Phase", "description": "Release keys" }] }`;
    }
    if (slideTypes.includes('team')) {
      promptText += `\n- team (Biographies card grid)
  { "type": "team", "title": "Our Contributors", "members": [{ "name": "Alex", "role": "Diagnostic specialist", "bio": "Extensive experience in clinical sciences" }] }`;
    }
    if (slideTypes.includes('medical-title')) {
      promptText += `\n- medical-title (Clinical title slide with status categories)
  { "type": "medical-title", "title": "Diagnosis criteria for **Optic Nerve Sheath Strain**", "subtitle": "Visual field trauma analysis brief", "categories": ["Ophthalmology", "Triage"] }`;
    }
    if (slideTypes.includes('medical-contents')) {
      promptText += `\n- medical-contents (Case studies syllabus timeline index)
  { "type": "medical-contents", "eyebrow": "SYLLABUS MODULES", "title": "Session Index", "items": [{ "number": "01", "title": "Skull Fracture Patterns", "description": "Deconstruction of cranial floors..." }] }`;
    }
    if (slideTypes.includes('medical-split')) {
      promptText += `\n- medical-split (Scans vs diagnostic datasets layout)
  { 
    "type": "medical-split", 
    "eyebrow": "MRI ANALYSIS", 
    "title": "Aortic Valvular Flow Profile", 
    "leftCard": { "title": "3D Contrast scan", "imageUrl": "Unsplash image URL", "caption": "Showing aortic stenosis severity" },
    "rightCards": [
      { "type": "list" | "progress" | "icons" | "keypoint" | "text", "title": "Anatomical Metrics", "items": ["Severe sparing signs"], "progressItems": [{ "label": "Flow reduction %", "value": 65 }], "iconItems": [{ "text": "Activity status", "icon": "activity" }], "text": "Additional clinical descriptions." }
    ]
  }`;
    }
    if (slideTypes.includes('medical-columns')) {
      promptText += `\n- medical-columns (Triple column comparative diagnosis card)
  {
    "type": "medical-columns",
    "eyebrow": "REFRACTIVE SURVEY",
    "title": "Treatment vectors",
    "columns": [
      { "title": "Primary myopia", "icon": "eye" | "zap" | "shield" | "heart" | "activity", "imageUrl": "Unsplash image URL", "description": "Refractive distortion description", "bullets": ["Severe focus decline"], "management": "Glasses correction prescription parameters." }
    ],
    "keypoint": "**Urgent:** Routine checkups stabilize youth focus issues."
  }`;
    }

    promptText += `\n\nREQUIRED GUIDELINES:
1. Ensure the output is strictly a raw valid JSON array, without markdown \`\`\`json wrappers. 
2. Be descriptive and write robust, clinical-oriented case copy. Use gorgeous bolds and bullet subdivisions so slide elements fit excellently without visual clipping.
3. Every card must contain a logical flow. No placeholder sentences like 'Lorem Ipsum' or 'Slide 1 content'. Generate actual factual case reviews.

STYLING AND FORMATTING INSTRUCTIONS:
You MUST use HTML/markdown formatting inside Text, Titles, Bullets, and Content fields to bring the presentation to life. 
- Use **bold** and *italic* for emphasis.
- Use <mark>highlighted text</mark> to highlight critical terms.
- Use <u>underlined text</u> for focal items.
- Use <span style="color: #4f46e5;">colored text</span> to add colored accents (use hex codes like #4f46e5 for primary, #e11d48 for danger/rose, #059669 for success/emerald).
- STRICT RULE: Do NOT use markdown headers (e.g., # Header or ## Header) as they will break the card layouts.`;

    copyToClipboard(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      {/* Background closer click overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 15 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh] z-10"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
              AI Prompt Menu Builder
            </h3>
            <p className="text-indigo-500 text-[10px] sm:text-xs font-black uppercase tracking-widest mt-0.5">
              Select Slide Types to build your schema blueprint
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-all"
            title="Close"
          >
            <X className="w-5 h-5 sm:w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* Preset Buttons */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> 1. Quick Board Presets
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => applyPreset('all')}
                className="px-3.5 py-1.5.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-indigo-200/50 dark:border-indigo-800/40 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => applyPreset('clinical')}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-emerald-200/50 dark:border-emerald-800/40 transition-colors"
              >
                Clinical Case Studies
              </button>
              <button
                onClick={() => applyPreset('standard')}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-400 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-blue-200/50 dark:border-blue-800/40 transition-colors"
              >
                Standard Corporate
              </button>
              <button
                onClick={() => applyPreset('none')}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-rose-200/50 dark:border-rose-800/40 transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Grid Selection */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> 2. Toggle Slide Layouts ({slideTypes.length} Active)
            </h4>
            
            {/* Interactive Cards responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {availableSlidesMetaData.map((slide) => {
                const isActive = slideTypes.includes(slide.id);
                return (
                  <button
                    key={slide.id}
                    onClick={() => handleToggle(slide.id)}
                    className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border-2 transition-all text-left group/card relative overflow-hidden ${
                      isActive 
                        ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20" 
                        : "border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full justify-between">
                      <span className={`font-black text-[11px] sm:text-xs capitalize tracking-tight ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}>
                        {slide.label}
                      </span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        isActive 
                          ? "bg-indigo-600 border-indigo-600 text-white" 
                          : "border-slate-300 dark:border-slate-700"
                      }`}>
                        {isActive && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-500/90 dark:text-slate-400 leading-snug font-medium mt-1">
                      {slide.desc}
                    </p>

                    <div className="flex items-center justify-between w-full mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/50">
                      <span className="font-mono text-[8px] tracking-widest text-slate-400">
                        {slide.id}
                      </span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                        slide.cat === 'Clinical' 
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}>
                        {slide.cat}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3 items-center shrink-0">
          <p className="text-[10px] text-slate-400 font-medium text-center sm:text-left leading-normal flex items-start gap-1.5 sm:max-w-[60%]">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            Selecting customized layout tokens injects precise component constraints into the generated prompt, improving layout precision for 16:9 slides.
          </p>
          <button
            onClick={executeCopyPrompt}
            disabled={slideTypes.length === 0}
            className={`w-full sm:w-auto sm:ml-auto px-6 py-3.5 font-black uppercase text-[11px] sm:text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 ${
              copied 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:translate-y-0.5'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Prompt Copied!" : "Copy AI Prompt"}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

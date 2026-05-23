import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PresentationData, SlideData, BlockSlideData, BlockSlideBlock } from '../../presentationTypes';
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
  Info,
  TrendingUp,
  List,
  Image as ImageIcon,
  BookOpen,
  Terminal,
  Grid,
  FileJson,
  HelpCircle
} from 'lucide-react';
import { copyToClipboard } from '../../utils';

interface PresentationBlockParserProps {
  onParsed: (data: PresentationData) => void;
  onCancel: () => void;
}

interface BlockMeta {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  whenToUse: string;
  schema: string;
}

const BLOCK_METAS: BlockMeta[] = [
  {
    id: 'container',
    name: 'Container Box',
    badge: 'Structure Card',
    icon: 'Layers',
    description: 'A beautifully bordered grid-card featuring colored side borders, icon decorations, bold title bars, and Markdown-compatible subtext.',
    whenToUse: 'Perfect for Table of Contents slides, side-by-side comparative analyses, multi-tier service categorizations, or presenting separate diagnostic criteria.',
    schema: `{\n  "type": "container",\n  "title": "Cranial Anatomy Overview",\n  "text": "Critical structures of the frontal, bone ethmoids and orbital structures.",\n  "icon": "book" // \'book\', \'eye\', \'shield\', \'zap\', \'activity\', \'ear\'\n}`
  },
  {
    id: 'photo',
    name: 'Multimedia Photo',
    badge: 'Interactive Image Placeholder',
    icon: 'ImageIcon',
    description: 'A dedicated graphic placeholder block. Simply click on it in preview mode to upload local image files directly without entering URLs.',
    whenToUse: 'Excellent for grounding text with visual evidence, clinical scans, schematic diagrams, reference photos, or illustrations with caption text.',
    schema: `{\n  "type": "photo",\n  "title": "Anatomical Distribution",\n  "caption": "Anterior fossa fractures account for up to 70% of injuries",\n  "position": "left" // Placement direction: select 'left' or 'right'\n}`
  },
  {
    id: 'list',
    name: 'Bullet Points List',
    badge: 'Dense Summary',
    icon: 'List',
    description: 'A list container presenting customized circular bullet points, optimized for dense information delivery without cluttering slides.',
    whenToUse: 'Used to outline concrete symptom checklists, diagnostic criteria bundles, active treatment options, or regulatory standard guidelines.',
    schema: `{\n  "type": "list",\n  "title": "Clinical Features Checklist",\n  "bullets": [\n    "Bilateral periorbital ecchymosis appearing within 1-3 days",\n    "Highly pathognomonic marker for anterior skull base injury",\n    "Accompanied by subconjunctival hemorrhage in acute cases"\n  ]\n}`
  },
  {
    id: 'textbox',
    name: 'Explanatory Textbox',
    badge: 'Mechanism Prose',
    icon: 'FileText',
    description: 'Generous paragraphs optimized to detail mechanisms, historical background, deep case summaries, or process summaries.',
    whenToUse: 'Excellent for clinical trial prose, physiological rationale statements, summaries of deep literature review data, or case histories.',
    schema: `{\n  "type": "textbox",\n  "title": "Underlying Pathology",\n  "text": "Blood tracks from anterior cranial fossa fracture lines through extremely thin orbital bones into periorbital soft tissue structures."\n}`
  },
  {
    id: 'progress',
    name: 'Progress Metrics',
    badge: 'Statistical Bars',
    icon: 'TrendingUp',
    description: 'Renders progress bars depicting values, metrics, scores, or distributions with exact numeric feedback.',
    whenToUse: 'To display epidemiological distributions, diagnostic risk scoring systems, progression statuses, or outcome ratios.',
    schema: `{\n  "type": "progress",\n  "title": "Demographic Incidence Rates",\n  "progressItems": [\n    { "label": "Motor Vehicle Crashes", "value": 65 },\n    { "label": "Industrial Accidents", "value": 20 },\n    { "label": "Sports Trauma Events", "value": 15 }\n  ]\n}`
  },
  {
    id: 'icons',
    name: 'Icon Accent Grid',
    badge: 'Visual Highlights',
    icon: 'Grid',
    description: 'Composes text rows styled with compact Lucide icons to emphasize multiple related criteria simultaneously.',
    whenToUse: 'Perfect for summarizing secondary signs, physical exam checklists, accessory symptoms, or quick actionable takeaways.',
    schema: `{\n  "type": "icons",\n  "title": "Accompanying Diagnostics",\n  "iconItems": [\n    { "text": "Continuous CSF rhinorrhea drip risk", "icon": "activity" },\n    { "text": "Ocular motor cranial nerve deficits", "icon": "eye" },\n    { "text": "Anosmia due to olfactory fiber shear", "icon": "shield" }\n  ]\n}`
  },
  {
    id: 'comparison',
    name: 'Comparison Split Card',
    badge: 'Pros & Cons Side-by-Side',
    icon: 'SlidersHorizontal',
    description: 'A split-screen card containing side-by-side emerald and rose accent blocks to separate contrasting indicators cleanly.',
    whenToUse: 'Ideal for comparing treatment option benefits and side effects, matching differential diagnoses, or mapping comparative results.',
    schema: `{\n  "type": "comparison",\n  "title": "Treatment Comparative Analysis",\n  "prosTitle": "Efficacy benefits",\n  "pros": [\n    "Rapid pain relief within 30 minutes",\n    "Highly selective receptor blockade action"\n  ],\n  "consTitle": "Adverse side effects",\n  "cons": [\n    "Mild somnolence observed in 12% of cases",\n    "Contraindicated for renal impairment sufferers"\n  ]\n}`
  },
  {
    id: 'timeline',
    name: 'Chronological Timeline',
    badge: 'Milestone Steps',
    icon: 'Terminal',
    description: 'A clean chain of vertical or horizontal steps utilizing connection vectors, sequence counters, and step subtitles (dates).',
    whenToUse: 'Presenting chronological events, patient progress stages, disease development timelines, or treatment protocols.',
    schema: `{\n  "type": "timeline",\n  "title": "Patient Management Progression",\n  "timelineItems": [\n    { "date": "Stage 1", "title": "Diagnostics & Intake", "description": "High-resolution head CT scan and baseline evaluations." },\n    { "date": "Stage 2", "title": "Acute Intervention", "description": "Surgical cranial base decompression if indicated." },\n    { "date": "Stage 3", "title": "Followup Assessment", "description": "Monitoring CSF leak closure and olfactory restoration." }\n  ]\n}`
  },
  {
    id: 'mediaSplit',
    name: 'Media Column Split',
    badge: 'Photo + Text Matrix',
    icon: 'ImageIcon',
    description: 'A modern split layout matching inline illustration images side-by-side with bullet checklists or paragraphs inside a single block card.',
    whenToUse: 'Presenting specific anatomical scans alongside bullet-pointed findings or equipment graphics next to step-by-step operation rules.',
    schema: `{\n  "type": "mediaSplit",\n  "title": "Anatomical Radiography Scan",\n  "imageUrl": "", // Blank for upload state\n  "bullets": [\n    "Anterior clinoid process displacement",\n    "Maxillary sinus fluid pooling detected"\n  ]\n}`
  },
  {
    id: 'keypoint',
    name: 'Pro Takeaway Callout',
    badge: 'Urgent Alert',
    icon: 'Info',
    description: 'A solid accent-colored alert block used to emphasize a single highly important clinical takeaway, pro-tip, or key reminder.',
    whenToUse: 'Best used at the bottom of standard cards to drive home ultimate take-home points, warnings, dosage callouts, or crucial guidance.',
    schema: `{\n  "type": "keypoint",\n  "text": "**Key Clinician Note:** Early evaluation of cerebral fluid leak signs is paramount to avoiding secondary meningitis.",\n  "icon": "info"\n}`
  }
];

export const PresentationBlockParser: React.FC<PresentationBlockParserProps> = ({ onParsed, onCancel }) => {
  const [parseText, setParseText] = useState('');
  const [error, setError] = useState('');
  
  // Custom states for A.I. Prompt and Block Selector UI
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>(['container', 'list', 'keypoint', 'comparison', 'timeline', 'mediaSplit']);
  const [copiedPromptState, setCopiedPromptState] = useState(false);
  const [customTopic, setCustomTopic] = useState('skull base fracture presentations & ocular complications');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPromptModal) {
        setShowPromptModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPromptModal]);

  const toggleSelectBlock = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Avoid selecting active preview tab if clicking checkbox only
    }
    setSelectedBlocks(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getBlockMetaIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case 'Layers': return <Layers className={className} />;
      case 'ImageIcon': return <ImageIcon className={className} />;
      case 'List': return <List className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Grid': return <Grid className={className} />;
      case 'SlidersHorizontal': return <SlidersHorizontal className={className} />;
      case 'Terminal': return <Terminal className={className} />;
      case 'Info': return <Info className={className} />;
      default: return <Info className={className} />;
    }
  };

  const generateDynamicPrompt = () => {
    const activeMetas = BLOCK_METAS.filter(b => selectedBlocks.includes(b.id));
    
    let blocksSpecs = '';
    activeMetas.forEach((b, idx) => {
      blocksSpecs += `\n[BLOCK RECIPE ${idx + 1}: ${b.name} ("type": "${b.id}")]\n`;
      blocksSpecs += `- Ideal Scenario: ${b.whenToUse}\n`;
      blocksSpecs += `- Mandatory Structure:\n${b.schema}\n`;
    });

    return `Act as an expert content presentation engineer. Generate a professional, medically dense, or professionally polished presentation slide array matching the Flexi-Block PowerPoint Auto-Layout Engine.

Required Document Structure:
Your output must be a single RAW, fully-valid JSON array of slide objects. Do not wrap in markdown \`\`\`json blocks or include introductory text. Return only the parsable valid JSON array.

Slide Master Schema:
[
  {
    "type": "block-slide",
    "eyebrow": "SUMMARY RUNNING EYE_BROW (CAPITAL LETTERS RECOMMENDED)",
    "title": "MAIN CAPTIVATING SLIDE TITLE",
    "blocks": [
      // Insert combination of selected block recipes below
    ]
  }
]

--- STYLING AND FORMATTING INSTRUCTIONS ---
You MUST use HTML/markdown formatting inside 'text', 'title', 'bullets', and 'keypoints' to bring the presentation to life. 
- Use **bold** and *italic* for emphasis.
- Use <mark>highlighted text</mark> to highlight critical terms.
- Use <u>underlined text</u> for focal items.
- Use <span style="color: #4f46e5;">colored text</span> to add colored accents (use hex codes like #4f46e5 for primary, #e11d48 for danger/rose, #059669 for success/emerald).
- STRICT RULE: Do NOT use markdown headers (e.g., # Header or ## Header) as they will break the card layouts.

--- AVAILABLE SELECTIVE BLOCK RECIPES ---${blocksSpecs}

--- PRESENTATION ASSIGNMENT ---
Slide Topic Target: ${customTopic}
Write a beautifully balanced, logically cohesive "type": "block-slide" slide. Combine, coordinate, and construct different block recipes so they present dense data, percentages, lists, and summaries beautifully. Make sure to append unique "id" values (e.g. "complication-b1") to each block!`;
  };

  const handleCopyMasterPrompt = () => {
    const prompt = generateDynamicPrompt();
    copyToClipboard(prompt);
    setCopiedPromptState(true);
    setTimeout(() => setCopiedPromptState(false), 2000);
  };

  const handleLoadSamples = () => {
    const sampleSlides: BlockSlideData[] = [
      {
        id: `slide-toc-${Date.now()}`,
        type: 'block-slide',
        eyebrow: 'PRESENTATION OVERVIEW',
        title: 'Contents',
        blocks: [
          {
            id: 'toc-b1',
            type: 'container',
            title: 'Introduction & Anatomy',
            text: 'Overview of <mark>skull base anatomy</mark>, fracture patterns, and **epidemiology**.',
            icon: 'book'
          },
          {
            id: 'toc-b2',
            type: 'container',
            title: 'Ophthalmology Manifestations',
            text: 'Eye signs: <u>raccoon eyes</u>, *optic nerve injury*, CN palsies, orbital apex syndrome.',
            icon: 'eye'
          },
          {
            id: 'toc-b3',
            type: 'container',
            title: 'ENT Manifestations',
            text: 'ENT signs: <span style="color: #e11d48;">CSF leaks</span>, hearing loss, facial palsy, anosmia, vertigo.',
            icon: 'ear'
          },
          {
            id: 'toc-b4',
            type: 'container',
            title: 'Management Strategies',
            text: 'Conservative and surgical management approaches for **optimal outcomes**.',
            icon: 'shield'
          }
        ]
      },
      {
        id: `slide-anatomy-${Date.now()}`,
        type: 'block-slide',
        eyebrow: 'INTRODUCTION',
        title: 'Skull Base Anatomy & Fracture Overview',
        blocks: [
          {
            id: 'anat-img',
            type: 'photo',
            imageUrl: '',
            title: 'Cranial Fossae Distribution',
            caption: 'Anterior fossa fractures are most common (70%)',
            position: 'left'
          },
          {
            id: 'anat-p1',
            type: 'progress',
            title: 'Fracture Distribution',
            progressItems: [
              { label: 'Anterior Fossa', value: 70 },
              { label: 'Central Skull Base', value: 20 },
              { label: 'Middle Fossa', value: 5 },
              { label: 'Posterior Fossa', value: 5 }
            ]
          },
          {
            id: 'anat-i1',
            type: 'icons',
            title: 'Common Causes',
            iconItems: [
              { text: 'Motor vehicle accidents', icon: 'zap' },
              { text: 'Falls from height', icon: 'trending' },
              { text: 'Assaults', icon: 'shield' },
              { text: 'Sports injuries', icon: 'activity' }
            ]
          },
          {
            id: 'anat-kp',
            type: 'keypoint',
            text: '**Key Point:** Skull base fractures result from <mark>significant trauma</mark> and require a *high index of suspicion*.',
            icon: 'info'
          }
        ]
      },
      {
        id: `slide-raccoon-${Date.now()}`,
        type: 'block-slide',
        eyebrow: 'OPHTHALMOLOGY MANIFESTATION',
        title: 'Raccoon Eyes (Periorbital Ecchymosis)',
        blocks: [
          {
            id: 'rac-img',
            type: 'photo',
            imageUrl: '',
            title: 'Clinical Appearance',
            caption: 'Bilateral periorbital bruising sparing tarsal plate',
            position: 'left'
          },
          {
            id: 'rac-list',
            type: 'list',
            title: 'Clinical Features',
            bullets: [
              '**Bilateral periorbital ecchymosis**',
              'Appears 1-3 days post-injury',
              'Associated with <mark>subconjunctival hemorrhage</mark>',
              'Pathognomonic for <span style="color: #059669;">anterior fossa fracture</span>'
            ]
          },
          {
            id: 'rac-mechanism',
            type: 'textbox',
            title: 'Mechanism',
            text: 'Blood tracks from <u>anterior cranial fossa fracture</u> through thin orbital bones into periorbital soft tissues. Indicates fracture of frontal bone, ethmoid bone, or orbital roof.'
          },
          {
            id: 'rac-assoc',
            type: 'icons',
            title: 'Associated Signs',
            iconItems: [
              { text: 'CSF rhinorrhea', icon: 'activity' },
              { text: 'Anosmia', icon: 'eye' },
              { text: 'Pneumocephalus', icon: 'shield' },
              { text: 'Subconjunctival hemorrhage', icon: 'zap' }
            ]
          }
        ]
      },
      {
        id: `slide-refractive-${Date.now()}`,
        type: 'block-slide',
        eyebrow: 'OPHTHALMOLOGY',
        title: 'Refractive Errors',
        blocks: [
          {
            id: 'ref-col1',
            type: 'container',
            title: 'Hyperopia',
            text: '**Farsightedness** common in cranial trauma. Difficulty focusing on near objects.\n\n*Management:* Corrective glasses, <mark>regular monitoring</mark>.',
            icon: 'eye'
          },
          {
            id: 'ref-col2',
            type: 'container',
            title: 'Astigmatism',
            text: 'High astigmatism frequently present due to corneal curvature. Causes **blurred vision**.\n\n*Management:* Cylindrical lenses, <span style="color: #4f46e5;">toric contact lenses</span>.',
            icon: 'zap'
          },
          {
            id: 'ref-col3',
            type: 'container',
            title: 'Accommodative Insufficiency',
            text: 'Difficulty maintaining focus for near tasks. Affects reading and close work.\n\n*Management:* Bifocals, reading glasses, <u>vision therapy</u>.',
            icon: 'shield'
          },
          {
            id: 'ref-kp',
            type: 'keypoint',
            text: '**Key Point:** Regular *cycloplegic refractions* are essential for accurate diagnosis and management.',
            icon: 'info'
          }
        ]
      },
      {
        id: `slide-mgmt-comparison-${Date.now()}`,
        type: 'block-slide',
        eyebrow: 'COMPARATIVE THERAPEUTICS',
        title: 'Surgical Decompression vs. Conservative Watchful Observation',
        blocks: [
          {
            id: 'mgmt-comp-1',
            type: 'comparison',
            title: 'Surgical vs Conservative Pathway',
            text: 'Selecting treatment routes for cranial skull fractures based on symptomatic leak profiles.',
            prosTitle: 'Surgical Indications / Benefits',
            pros: [
              'Immediate intracranial bone decompression',
              'Definitive structural repair of dural tears',
              'Decreases risk of ascending purulent meningitis'
            ],
            consTitle: 'Conservative Observational Risks',
            cons: [
              'Requires strict bed rest for 7 to 14 days',
              'Persistent rhinorrhea leak risk of 25%',
              'Potential delayed treatment of bone displacement'
            ]
          },
          {
            id: 'mgmt-comp-2',
            type: 'keypoint',
            text: '**Direct Guideline:** Conservative support seals up to 85% of acute CSF leaks by day 10 without any surgical entering.',
            icon: 'shield'
          }
        ]
      },
      {
        id: `slide-recovery-timeline-${Date.now()}`,
        type: 'block-slide',
        eyebrow: 'CHRONOLOGICAL PROTOCOLS',
        title: 'Neurological Recovery & Rehabilitation Timelines',
        blocks: [
          {
            id: 'recov-time-1',
            type: 'timeline',
            title: 'Anterior Fossa Recovery Stages',
            text: 'Chronological progression monitoring protocol for base-fracture trauma admissions.',
            timelineItems: [
              { date: 'Stage 1 (Day 1-2)', title: 'Stabilization & Imaging', description: 'Absolute bed rest, head elevated to 30 degrees, and thin-slice high-resolution head CT scans.' },
              { date: 'Stage 2 (Day 3-7)', title: 'Leak Monitoring Phase', description: 'Testing fluid for beta-2 transferrin to check for active CSF rhinorrhea.' },
              { date: 'Stage 3 (Week 2-4)', title: 'Rehabilitation Protocol', description: 'Neurology assessment for olfactory restoration and gradual return to normal activity.' },
              { date: 'Stage 4 (Month 3+)', title: 'Long-Term Imaging Check', description: 'Follow-up radiography and functional cranial nerve responses.' }
            ]
          },
          {
            id: 'recov-time-2',
            type: 'icons',
            title: 'Discharge Requirements',
            iconItems: [
              { text: 'Clear olfactory function', icon: 'activity' },
              { text: 'Zero leak output for 48h', icon: 'shield' },
              { text: 'Intact facial movements', icon: 'eye' }
            ]
          }
        ]
      },
      {
        id: `slide-diagnostic-imaging-${Date.now()}`,
        type: 'block-slide',
        eyebrow: 'DIAGNOSTIC IMAGING',
        title: 'Anatomy Correlation via High-Resolution Scans',
        blocks: [
          {
            id: 'imaging-b1',
            type: 'mediaSplit',
            title: 'High-Resolution Head CT Scan',
            imageUrl: '', // Upload is available instantly
            bullets: [
              'Visualizes **anterior fossa** hairline fractures',
              'Detects pooled blood in **sphenoid sinus** cavity',
              'Assesses cribriform plate structural integrity'
            ]
          },
          {
            id: 'imaging-b2',
            type: 'list',
            title: 'Reporting Criteria',
            bullets: [
              'Evaluate pneumocephalus volumes',
              'Trace bony spicules near optic canal',
              'Check for orbital roof displacement'
            ]
          }
        ]
      }
    ];

    setParseText(JSON.stringify(sampleSlides, null, 2));
    setError('');
  };

  const handleParse = () => {
    setError('');
    if (!parseText.trim()) {
      setError('Please paste your Block Slides JSON array.');
      return;
    }

    try {
      const parsed = JSON.parse(parseText);
      const rawData = Array.isArray(parsed) ? parsed : (parsed.slides ? parsed.slides : [parsed]);

      const slides: SlideData[] = rawData.map((item: any, index: number): SlideData => {
        const type = (item.type || 'block-slide').toLowerCase();
        
        if (type === 'block-slide') {
          return {
            id: item.id || `block-slide-${index}-${Date.now()}`,
            type: 'block-slide',
            eyebrow: item.eyebrow || '',
            title: item.title || 'Untitled Slide',
            settings: item.settings,
            blocks: Array.isArray(item.blocks) ? item.blocks.map((b: any, bIdx: number) => ({
              id: b.id || `b-${index}-${bIdx}-${Date.now()}`,
              type: b.type || 'container',
              title: b.title || '',
              text: b.text || '',
              imageUrl: b.imageUrl || '',
              caption: b.caption || '',
              bullets: b.bullets || [],
              progressItems: b.progressItems || [],
              iconItems: b.iconItems || [],
              pros: b.pros || [],
              cons: b.cons || [],
              prosTitle: b.prosTitle || '',
              consTitle: b.consTitle || '',
              timelineItems: b.timelineItems || [],
              icon: b.icon || '',
              color: b.color || '',
              position: b.position || 'left'
            })) : []
          };
        } else {
          return {
            id: item.id || `slide-${index}-${Date.now()}`,
            type: 'text',
            title: item.title || 'Untitled',
            content: item.content || item.text || ''
          } as any;
        }
      });

      onParsed({
        id: `block-presentation-${Date.now()}`,
        title: 'Block PowerPoint Slide Deck',
        slides,
        createdAt: Date.now()
      });
    } catch (e: any) {
      setError('Parsing error: ' + e.message + '. Ensure the text is a valid JSON array.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-12 px-2.5 sm:px-4 space-y-6 sm:space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onCancel} 
            className="p-2 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm text-indigo-500 shrink-0"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none italic flex items-center gap-2">
              Flexi-Block <span className="text-indigo-600">Slides</span>
            </h2>
            <p className="text-indigo-500 font-extrabold text-[10px] uppercase tracking-[0.2em] mt-1">
              PowerPoint Flexible Blocks Auto-Layout Engine
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowPromptModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase text-[10px] sm:text-xs rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            AI Prompt & Block Helper
          </button>
          
          <button
            onClick={handleLoadSamples}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-black uppercase text-[10px] sm:text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Replicate Examples
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-[2rem] blur-xl opacity-10 group-hover:opacity-15 transition"></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-[1.5rem] p-1 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
          <textarea
            value={parseText}
            onChange={(e) => {
              setParseText(e.target.value);
              setError('');
            }}
            placeholder={`[\n  {\n    "type": "block-slide",\n    "eyebrow": "DEMONSTRATION",\n    "title": "Flexi-Layout Auto Computation Demo",\n    "blocks": [\n      {\n        "type": "photo",\n        "imageUrl": "",\n        "title": "Left Column Image Scan"\n      },\n      {\n        "type": "progress",\n        "title": "Interactive Statistics",\n        "progressItems": [\n          { "label": "Accuracy Rating", "value": 98 },\n          { "label": "Layout Efficiency", "value": 85 }\n        ]\n      }\n    ]\n  }\n]`}
            className="w-full h-[320px] sm:h-[450px] p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-[1.3rem] font-mono text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-800 outline-none transition-all resize-none border-none text-slate-800 dark:text-slate-100"
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-6 left-6 right-6 flex items-center gap-2.5 text-white font-bold text-xs uppercase bg-red-600 px-4 py-3 rounded-xl shadow-lg z-20"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleParse}
          disabled={!parseText.trim()}
          className="group relative px-10 py-4 sm:px-14 sm:py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm sm:text-base uppercase tracking-widest rounded-2xl shadow-[0_6px_0_#312e81] hover:translate-y-0.5 active:translate-y-1.5 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          Generate PowerPoint Deck
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* RENDER DYNAMIC MODAL USING FRAME ANIMATION */}
      <AnimatePresence>
        {showPromptModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2.5 sm:p-6">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPromptModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-950 rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-900 flex flex-col h-[94vh] max-h-[850px] z-10"
            >
              {/* Elegant Simplified Header */}
              <div className="flex items-center justify-between p-6 sm:px-8 sm:pt-8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-indigo-500/20 shadow-md text-white">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">AI Presentation Assistant</h3>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Generate your presentation prompt for Gemini or ChatGPT</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowPromptModal(false)}
                  className="p-2 sm:p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full transition-colors self-start cursor-pointer"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Main Minimal Flow */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8 space-y-8">
                
                {/* Topic Input */}
                <div className="space-y-3">
                  <label className="text-sm font-bold tracking-wide uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs">1</span>
                    What is your presentation about?
                  </label>
                  <textarea
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. A quarterly business review for the marketing department, focusing on Q3 growth and upcoming Q4 strategy..."
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none min-h-[100px]"
                  />
                </div>

                {/* Block Selection Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold tracking-wide uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs">2</span>
                      Which structural blocks do you need?
                    </label>
                    <button 
                      onClick={() => {
                        if (selectedBlocks.length === BLOCK_METAS.length) {
                          setSelectedBlocks([]);
                        } else {
                          setSelectedBlocks(BLOCK_METAS.map(b => b.id));
                        }
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      {selectedBlocks.length === BLOCK_METAS.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                    {BLOCK_METAS.map((b) => {
                      const isSelected = selectedBlocks.includes(b.id);
                      
                      return (
                        <div
                          key={b.id}
                          onClick={(e) => toggleSelectBlock(b.id, e)}
                          className={`group relative flex flex-col p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                            isSelected 
                              ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-700 shadow-sm shadow-indigo-100' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-700'}`}>
                              {getBlockMetaIcon(b.icon, "w-4 h-4 sm:w-5 sm:h-5")}
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected 
                                ? 'border-indigo-600 bg-indigo-600' 
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <span className={`text-sm font-extrabold ${isSelected ? 'text-indigo-950 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-200'} leading-tight block`}>
                              {b.name}
                            </span>
                            <span className={`text-[10px] sm:text-xs font-semibold leading-snug line-clamp-2 ${isSelected ? 'text-indigo-700/80 dark:text-indigo-300/80' : 'text-slate-500 dark:text-slate-400'}`}>
                              {b.whenToUse}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex flex-col gap-1 text-center sm:text-left">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Ready to generate?</span>
                  <span className="text-xs font-semibold text-slate-500 border-slate-200 dark:border-slate-800 border bg-white dark:bg-slate-900 px-2 py-1 rounded inline-block text-left w-fit select-all">
                    Copy the prompt and paste it into ChatGPT or Gemini.
                  </span>
                </div>
                
                <button
                  onClick={handleCopyMasterPrompt}
                  disabled={selectedBlocks.length === 0}
                  className={`w-full sm:w-auto px-8 py-4 sm:py-4 rounded-2xl font-black tracking-wide text-sm flex items-center justify-center gap-3 transition-all min-w-[240px] disabled:opacity-50 disabled:cursor-not-allowed ${
                    copiedPromptState 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]' 
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/20 text-white hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {copiedPromptState ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      Copied! Ready to Paste
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy AI Prompt ({selectedBlocks.length})
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

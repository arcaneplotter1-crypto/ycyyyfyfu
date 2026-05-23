import { DocumentNode, DocumentSettings } from '../DocumentMode';
import { marked } from 'marked';
import markedCode from '../../node_modules/marked/lib/marked.umd.js?raw';
import confettiCode from '../../node_modules/canvas-confetti/dist/confetti.browser.js?raw';
import tailwindCode from '../../node_modules/@tailwindcss/browser/dist/index.global.js?raw';

// Process custom colors similarly to DocumentMode.tsx
const processCustomColorsToHtml = (text: string) => {
  if (!text) return text;
  let processed = text.replace(/\((g|r|b|y|p|o|#[0-9a-fA-F]{3,8})\((.*?)\)\)/g, (match, colorCode, content) => {
    const colorMap: Record<string, string> = {
      g: '#10b981',
      r: '#ef4444',
      b: '#3b82f6',
      y: '#eab308',
      p: '#a855f7',
      o: '#f97316',
    };
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
    return `<span class="teacher-trigger" data-word="${word}" data-explanation="${explanation}" data-memory="${memory}" data-quiz="${quiz}" data-expand="${expand}">${word}</span>`;
  });

  return processed;
};

// Convert Markdown to clean HTML synchronously
const renderMarkdown = (text: string) => {
  const processedText = processCustomColorsToHtml(text);
  const parsed = marked.parse(processedText) as string;
  return parsed;
};

export const generateDocumentHtmlTemplate = (
  rootNode: DocumentNode,
  settings: DocumentSettings
): string => {

  const hasMarker = (marker?: string) => !!marker;

  const renderChildrenWithGrids = (children: DocumentNode[], depth: number, renderNodeFn: (node: DocumentNode, depth: number, siblingIndex: number) => string): string => {
    const groups: (DocumentNode | DocumentNode[])[] = [];
    let currentGroup: DocumentNode[] = [];
    
    children.forEach((child) => {
      let isGridItem = false;
      if (child.marker && child.marker.startsWith("col-")) isGridItem = true;
      if (child.marker && child.marker.startsWith("grid-")) isGridItem = true;
      
      if (isGridItem) {
        currentGroup.push(child);
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [];
        }
        groups.push(child);
      }
    });
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups.map((group, gIdx) => {
      if (Array.isArray(group)) {
        if (group.length === 0) return '';
        const firstMarker = group[0].marker || "";
        const match = firstMarker.match(/(col|grid)-(\d+)/);
        const cols = match ? parseInt(match[2], 10) : 2;
        let colCount = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : cols === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2';

        return `
          <div class="grid ${colCount} gap-x-8 gap-y-2 mb-4 node-container">
            ${group.map((node, nIdx) => `
              <div class="h-full">
                ${renderNodeFn(node, depth, nIdx)}
              </div>
            `).join('')}
          </div>
        `;
      }
      return renderNodeFn(group, depth, gIdx);
    }).join('');
  };

  const renderNode = (node: DocumentNode, depth: number = 0, siblingIndex: number = 0): string => {
    if (node.type === "root") {
      return `
        <div class="relative w-full h-full z-10 pb-12 document-root">
          <div class="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] dark:opacity-[0.02] z-[-1] overflow-hidden">
             <div class="text-[120px] sm:text-[160px] md:text-[220px] font-black tracking-widest text-slate-900 dark:text-white flex items-center justify-center rotate-[-35deg] select-none">
               ARCANE
             </div>
          </div>
          
          <div class="relative z-10 space-y-12 shrink-0">
            ${renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        </div>
      `;
    }

    const ChevronIcon = `<svg class="w-6 h-6 collapse-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

    if (depth === 1 && node.type === "topic") {
      return `
        <div class="mb-12 mt-16 first:mt-0 node-container topic-node" data-searchable="true">
          <div 
            onclick="toggleCollapse(this)"
            class="w-full py-16 px-4 md:px-8 flex flex-col items-center justify-center relative overflow-hidden rounded-[3rem] shadow-2xl mb-12 border-4 border-white/20 cursor-pointer hover:opacity-95 transition-opacity"
            style="background-color: ${settings.topicBg}; color: ${settings.topicColor}"
          >
             <div class="absolute top-6 right-8 w-8 h-8 opacity-50 collapse-icon-container">${ChevronIcon}</div>
             <div class="absolute inset-0 opacity-10 pointer-events-none">
                <div class="absolute inset-0" style="background-image: linear-gradient(45deg, currentColor 1px, transparent 1px), linear-gradient(-45deg, currentColor 1px, transparent 1px); background-size: 40px 40px"></div>
             </div>
             <div class="relative z-10 text-center max-w-4xl px-4">
               <div class="text-[10px] sm:text-xs font-black uppercase tracking-[0.5em] mb-4 opacity-50">Main Topic</div>
               <div class="text-[2.2em] sm:text-[3em] md:text-[4.5em] lg:text-[5.5em] font-black tracking-tighter leading-[1.1] italic uppercase markdown-content">
                  ${renderMarkdown(node.content)}
               </div>
             </div>
          </div>
          <div class="space-y-12 children-container">
            ${renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        </div>
      `;
    }

    if (depth === 2 && node.type === "header") {
      return `
        <div class="mb-10 node-container header-node" data-searchable="true">
          <div 
            onclick="toggleCollapse(this)"
            class="w-full text-center py-4 md:py-6 px-3 sm:px-4 font-extrabold flex flex-col items-center justify-center relative overflow-hidden text-[1.5em] sm:text-[2.5em] md:text-[3.5em] tracking-tight shadow-md mb-8 rounded-xl md:rounded-2xl mx-auto cursor-pointer hover:opacity-95 transition-opacity"
            style="background-color: ${settings.headerBg}; color: ${settings.headerColor}"
          >
            <div class="absolute top-4 right-6 w-6 h-6 opacity-40 pointer-events-none collapse-icon-container">${ChevronIcon}</div>
            <div class="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.12] dark:opacity-[0.2]">
              <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, currentColor 2px, transparent 0); background-size: 24px 24px; background-position: center"></div>
            </div>
            <div class="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.15]">
               <svg class="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,100 C30,50 70,150 100,0 L100,100 Z" fill="currentColor" />
               </svg>
            </div>
            <div class="relative z-10 w-full px-4 sm:px-16 max-w-5xl mx-auto markdown-content leading-[1.2]">
              ${renderMarkdown(node.marker ? node.marker + ' ' + node.content : node.content)}
            </div>
          </div>
          <div class="space-y-8 children-container">
            ${renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        </div>
      `;
    }

    if (depth === 3 && node.type === "subheader") {
      return `
        <div class="mb-8 node-container" data-searchable="true">
          <div 
            onclick="toggleCollapse(this)"
            class="w-full relative overflow-hidden py-3 px-6 font-extrabold text-[1.2em] sm:text-[1.5em] md:text-[2.25em] mb-6 shadow-sm border-l-4 border-r-4 border-transparent flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            style="background-color: ${settings.subheaderBg}; color: ${settings.subheaderColor}; text-align: center"
          >
            <div class="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none collapse-icon-container">${ChevronIcon}</div>
            <svg class="absolute left-0 bottom-0 h-full w-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,100 C20,80 40,120 60,80 C80,40 100,80 100,100 L0,100 Z" fill="currentColor"/>
            </svg>
            <div class="relative z-10 w-full markdown-content leading-[1.2]">
              ${renderMarkdown(node.marker ? node.marker + ' ' + node.content : node.content)}
            </div>
          </div>
          <div class="space-y-6 px-4 md:px-8 children-container">
            ${renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        </div>
      `;
    }

    if (node.type === "textbox") {
      return `
        <div class="node-container" data-searchable="true">
          <div 
            class="mb-6 mt-8 p-4 sm:p-5 ${node.content ? 'pt-0 sm:pt-0' : ''} rounded-3xl border-2 border-dashed shadow-sm relative text-box-wrapper"
            style="border-color: ${settings.textBoxBorderColor}; background-color: ${settings.textBoxBg}"
          >
            ${node.content ? `
              <div class="flex justify-center -mt-5 mb-4">
                <div 
                  class="px-5 py-1 mx-4 font-bold rounded-xl shadow-sm border text-center break-words max-w-full inline-block markdown-content" 
                  style="background-color: ${settings.textBoxTitleBg}; color: ${settings.textBoxTitleColor}; border-color: ${settings.textBoxBorderColor}; font-size: max(1.125em, 16px)"
                >
                  ${renderMarkdown(node.content)}
                </div>
              </div>
            ` : ''}
            <div class="w-full children-container">
              ${renderChildrenWithGrids(node.children, depth + 1, renderNode)}
            </div>
          </div>
        </div>
      `;
    }

    if (node.type === "section") {
      const _hasMarker = hasMarker(node.marker);
      return `
        <div class="mb-6 mt-4 pl-3 sm:pl-4 border-l-2 border-slate-100 dark:border-slate-800 node-container" data-searchable="true">
          <div 
            onclick="toggleCollapse(this)"
            class="flex items-start gap-2 sm:gap-3 font-bold text-[1.15em] sm:text-[1.25em] md:text-[1.875em] mb-4 ${_hasMarker ? '' : 'underline decoration-[2.5px] underline-offset-[6px]'} cursor-pointer hover:opacity-80 transition-opacity section-title-wrapper"
            style="color: ${settings.sectionColor}"
          >
            <div class="shrink-0 mt-1 sm:mt-1.5 opacity-60 collapse-icon-container">${ChevronIcon}</div>
            ${node.marker ? `<span>${node.marker}</span>` : ''}
            <div class="flex-1 leading-[1.3] markdown-content" style="word-break: break-word;">
              ${renderMarkdown(node.content)}
            </div>
          </div>
          <div class="space-y-4 pl-2 md:pl-4 children-container">
            ${renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        </div>
      `;
    }

    if (node.type === "paragraph") {
      return `
        <div class="mb-4 last:mb-0 node-container" data-searchable="true">
          <div 
            class="text-[1.05em] sm:text-[1.125em] md:text-[1.25em] leading-relaxed font-medium mb-1 markdown-content"
            style="color: ${settings.textColor}; word-break: break-word;"
          >
             ${renderMarkdown(node.content)}
          </div>
          ${node.children.length > 0 ? `
            <div class="space-y-4 pl-4 md:pl-6 border-l border-slate-100 dark:border-slate-800/50 mt-4 pb-2 children-container">
              ${renderChildrenWithGrids(node.children, depth + 1, renderNode)}
            </div>
          ` : ''}
        </div>
      `;
    }

    if (node.type === "item") {
      const isDeeper = depth >= 6;
      const markerText = node.marker ? node.marker : (isDeeper ? '·' : `${siblingIndex + 1})`);
      return `
        <div class="mb-4 last:mb-0 node-container" data-searchable="true">
          <div 
            class="flex items-start gap-3 sm:gap-4 text-[1.05em] sm:text-[1.125em] md:text-[1.5em]"
            style="color: ${settings.textColor}"
          >
             <span 
               class="font-bold shrink-0 select-none mt-[0.1rem] min-w-[1.25rem] sm:min-w-[1.5rem]"
               style="color: ${settings.sectionColor}"
             >
               ${markerText}
             </span>
             <span class="flex-1 font-semibold leading-[1.4] markdown-content" style="word-break: break-word;">
               ${renderMarkdown(node.content)}
             </span>
          </div>
          ${node.children.length > 0 ? `
            <div class="space-y-4 pl-5 sm:pl-6 md:pl-8 mt-4 children-container">
              ${renderChildrenWithGrids(node.children, depth + 1, renderNode)}
            </div>
          ` : ''}
        </div>
      `;
    }

    return `
      <div class="mb-3 node-container" data-searchable="true">
        <div class="flex items-start gap-2 sm:gap-3 text-[1.05em] sm:text-[1.125em] md:text-[1.25em]">
           <span class="shrink-0 mt-[0.6rem] w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style="background-color: ${settings.textColor}; opacity: 0.5"></span>
           <span class="flex-1 leading-relaxed markdown-content" style="color: ${settings.textColor}; word-break: break-word;">
             ${renderMarkdown(node.content)}
           </span>
        </div>
        ${node.children.length > 0 ? `
          <div class="space-y-2 pl-5 sm:pl-6 md:pl-8 mt-2 children-container">
            ${renderChildrenWithGrids(node.children, depth + 1, renderNode)}
          </div>
        ` : ''}
      </div>
    `;
  };

  const htmlBody = renderNode(rootNode, 0, 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arcane Document Export</title>
    <script id="arcane-document-metadata" type="application/json">
      ${JSON.stringify({ data: rootNode, settings })}
    </script>
    <script>${tailwindCode}</script>
    <script>${confettiCode}</script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: {
              sans: ["Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
              mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
              serif: ["Georgia", "ui-serif", "serif"],
            }
          }
        }
      }
    </script>
    <script>${markedCode}</script>
    <style type="text/tailwindcss">
        @custom-variant dark (&:where(.dark, .dark *));

        :root {
            --doc-size: ${settings.size}rem;
        }

        .marker-highlight {
            background-repeat: no-repeat;
            background-position: left center;
            background-size: 0% 100%;
            border-radius: 6px;
            padding: 0.1em 0.2em;
            margin: -0.1em -0.2em;
            transition: background-size 0.8s cubic-bezier(0.22, 1, 0.36, 1);
            color: inherit;
            background-color: transparent !important;
        }
        .marker-highlight.active {
            background-size: 100% 100%;
        }
        .marker-highlight-yellow {
            background-image: linear-gradient(104deg, rgba(253, 224, 71, 0.5) 0%, rgba(253, 224, 71, 0.9) 100%);
        }
        .dark .marker-highlight-yellow {
            background-image: linear-gradient(104deg, rgba(202, 138, 4, 0.5) 0%, rgba(202, 138, 4, 0.9) 100%);
        }
        .marker-highlight-green {
            background-image: linear-gradient(104deg, rgba(134, 239, 172, 0.5) 0%, rgba(134, 239, 172, 0.9) 100%);
        }
        .dark .marker-highlight-green {
            background-image: linear-gradient(104deg, rgba(21, 128, 61, 0.5) 0%, rgba(21, 128, 61, 0.9) 100%);
        }

        body {
            font-family: ${settings.fontFamily === 'mono' ? 'var(--font-mono)' : settings.fontFamily === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)'} !important;
            font-size: var(--doc-size);
            color: ${settings.textColor};
            transition: none;
        }

        body.dark {
            color: #f8fafc !important;
        }
        
        /* Markdown rendering helper styles to avoid breaking layout */
        .markdown-content p { display: inline; text-wrap: wrap; margin: 0; padding: 0;}
        .markdown-content strong { font-weight: 700; }
        .markdown-content em { font-style: italic; }
        .markdown-content code { font-family: var(--font-mono); background: rgba(128,128,128,0.2); padding: 0.1em 0.3em; border-radius: 0.25em; word-break: break-word;}
        .markdown-content a { color: #4f46e5; text-decoration: underline; text-underline-offset: 2px; }
        .markdown-content blockquote { border-left: 4px solid rgba(128,128,128,0.3); padding-left: 1em; margin-left: 0; margin-right: 0; font-style: italic; opacity: 0.8; }
        .markdown-content ul { list-style-type: disc; padding-left: 1.5em; margin-top: 0.5em; margin-bottom: 0.5em; }
        .markdown-content ol { list-style-type: decimal; padding-left: 1.5em; margin-top: 0.5em; margin-bottom: 0.5em; }
        .markdown-content li { margin-bottom: 0.25em; display: list-item; text-wrap: wrap; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 { font-weight: 800; margin-top: 1em; margin-bottom: 0.5em; line-height: 1.2; display: block; }
        .markdown-content h1 { font-size: 2em; }
        .markdown-content h2 { font-size: 1.5em; }
        .markdown-content h3 { font-size: 1.25em; }
        
        /* Table Styles */
        .markdown-content table { width: 100%; border-collapse: collapse; margin-top: 1em; margin-bottom: 1em; overflow-x: auto; display: block; white-space: nowrap; }
        @media (min-width: 640px) { .markdown-content table { display: table; white-space: normal; } }
        .markdown-content th, .markdown-content td { border: 1px solid rgba(128, 128, 128, 0.2); padding: 0.75em 1em; text-align: left; }
        .markdown-content th { font-weight: bold; background-color: rgba(128, 128, 128, 0.05); }
        .markdown-content tr:nth-child(even) { background-color: rgba(128, 128, 128, 0.02); }

        /* Document Wrapper styles */
        .document-wrapper {
            transition: none;
            font-size: var(--doc-size);
            background-image: radial-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px);
            background-size: 24px 24px;
        }
        @media (prefers-color-scheme: dark) {
            .document-wrapper {
                background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
            }
        }

        /* Toggle System */
        .collapse-icon-container { display: none; }
        
        body.collapse-mode-active .collapse-icon-container {
            display: block;
        }
        
        body.collapse-mode-active .node-container.collapsed > .children-container {
            display: none;
        }
        
        body.collapse-mode-active .collapsed .collapse-icon {
            transform: rotate(-90deg);
            transition: transform 0.2s;
        }

        @media print {
            .no-print, .sticky { display: none !important; }
            body { background: white !important; color: black !important; font-size: 11pt !important; }
            .node-container { page-break-inside: avoid; margin-bottom: 1em; }
            .collapse-icon-container { display: none !important; }
            body.collapse-mode-active .node-container.collapsed > .children-container { display: block !important; }
            .document-root { padding-bottom: 0 !important; }
            .teacher-trigger { border-bottom: none !important; color: inherit !important; background: none !important; }
            .teacher-trigger::after { content: none !important; }
            .document-wrapper { background-image: none !important; }
        }
        
        #progress-bar {
            position: fixed;
            top: 0; left: 0;
            height: 4px;
            background: linear-gradient(to right, #4f46e5, #ec4899);
            width: 0%;
            z-index: 9999;
            transition: width 0.1s ease-out;
            pointer-events: none;
        }

        @keyframes modalPop {
            0% { opacity: 0; transform: scale(0.95) translateY(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-animate {
            animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideIn {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0); }
        }
        .slide-animate {
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Teacher Overlay Trigger */
        .teacher-trigger {
            background: rgba(99, 102, 241, 0.1);
            color: #4f46e5;
            font-weight: 800;
            padding: 0.1rem 0.4rem;
            border-radius: 0.25rem;
            cursor: pointer;
            border-bottom: 2px dashed #6366f1;
            position: relative;
            display: inline-block;
            margin: 0 0.1em;
        }
        .teacher-trigger::after {
            content: '✨';
            position: absolute;
            top: -0.5rem;
            right: -0.5rem;
            font-size: 0.75rem;
        }

        /* Dark mode toggles for teacher trigger */
        @media (prefers-color-scheme: dark) {
            .teacher-trigger {
                background: rgba(129, 140, 248, 0.15);
                color: #818cf8;
                border-bottom-color: #818cf8;
            }
        }

        .hidden { display: none !important; }
    </style>
</head>
<body class="antialiased min-h-screen pb-24 text-slate-900 bg-slate-50 dark:bg-slate-900 transition-colors">

    <div id="progress-bar" class="no-print"></div>

    <!-- Top Toolbar -->
    <div class="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl z-50 py-4 px-4 sm:px-8 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-wrap gap-4 justify-between items-center w-full no-print">
        <div class="flex flex-col gap-1">
            <h2 class="text-xs font-black tracking-[0.2em] uppercase text-indigo-500">Document Export</h2>
            <h1 class="text-xl sm:text-2xl font-black tracking-tight max-w-[200px] sm:max-w-md truncate">Interactive Mode</h1>
        </div>
        <div class="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <input type="text" id="searchInput" class="hidden sm:block px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium outline-none focus:border-indigo-500 w-full max-w-[12rem] md:max-w-xs transition-all focus:max-w-md" placeholder="Search document...">
            <button class="p-2 sm:px-4 sm:py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold rounded-xl hover:bg-indigo-100 flex items-center gap-2 text-sm shrink-0 transition-colors" id="toggleCollapseBtn" title="Toggle Collapsible Trees">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span class="hidden sm:inline btn-text">Collapse Mode</span>
            </button>
            <button class="p-2 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-slate-50 flex items-center gap-2 text-sm shadow-sm shrink-0 transition-transform hover:scale-105" id="tocBtn" title="Table of Contents">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                <span class="hidden lg:inline">Outline</span>
            </button>
            <button class="p-2 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-slate-50 flex items-center gap-2 text-sm shadow-sm shrink-0 transition-transform hover:scale-105" id="themeToggleBtn" title="Toggle Theme">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dark:hidden block"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden dark:block"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            </button>
            <button class="p-2 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-slate-50 flex items-center gap-2 text-sm shadow-sm shrink-0 transition-transform hover:scale-105" id="printBtn" title="Print / Save PDF">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                <span class="hidden lg:inline">Print</span>
            </button>
            <button class="p-2 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-slate-50 flex items-center gap-2 text-sm shadow-sm shrink-0 transition-transform hover:scale-105" id="settingsBtn" title="Settings">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
        </div>
    </div>

    <div class="mobile-search block sm:hidden px-4 pt-4">
        <input type="text" id="mobileSearchInput" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium outline-none focus:border-indigo-500" placeholder="Search document...">
    </div>

    <!-- Main Content Area -->
    <div class="w-full max-w-5xl mx-auto py-8 px-4 sm:px-8 document-wrapper">
        ${htmlBody}
    </div>

    <!-- Teacher Modal Options -->
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden items-center justify-center z-[1000] p-4 no-print" id="teacherBackdrop">
        <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto modal-animate">
            <button class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full" id="teacherClose">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <h2 class="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-4" id="teacherWord"></h2>
            
            <div class="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto no-scrollbar">
                <button class="teacher-tab active px-4 py-2 rounded-xl text-sm font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 whitespace-nowrap shrink-0" data-target="pane-explanation">Explanation</button>
                <button class="teacher-tab px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0" data-target="pane-memory">Memory</button>
                <button class="teacher-tab px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0" data-target="pane-quiz">Quiz</button>
                <button class="teacher-tab px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0" data-target="pane-expand">Expand</button>
            </div>
            
            <div id="pane-explanation" class="teacher-content-pane block text-lg leading-relaxed text-slate-700 dark:text-slate-300"></div>
            <div id="pane-memory" class="teacher-content-pane hidden text-lg leading-relaxed text-slate-700 dark:text-slate-300"></div>
            <div id="pane-quiz" class="teacher-content-pane hidden text-lg leading-relaxed text-slate-700 dark:text-slate-300"></div>
            <div id="pane-expand" class="teacher-content-pane hidden text-lg leading-relaxed text-slate-700 dark:text-slate-300"></div>
        </div>
    </div>

    <!-- TOC Sidebar Modal -->
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden z-[1000] no-print justify-end flex" id="toc-backdrop">
        <div class="bg-white dark:bg-slate-900 w-full max-w-sm h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 relative flex flex-col slide-animate" id="toc-panel">
            <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                <h2 class="text-lg font-black text-slate-900 dark:text-white">Table of Contents</h2>
                <button class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full" id="tocClose">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            <div class="p-4 overflow-y-auto flex-1 space-y-1" id="toc-content">
                <!-- Javascript will populate this -->
            </div>
        </div>
    </div>

    <!-- Settings Modal -->
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden items-center justify-center z-[1000] p-4 no-print" id="settings-modal-backdrop">
        <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative modal-animate">
            <button class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full" id="settingsClose">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <h2 class="text-xl font-black mb-6 text-slate-900 dark:text-white">Document Settings</h2>
            
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                     <span class="font-semibold text-sm">Base Font Size (rem)</span>
                     <input type="number" id="setting-size" value="${settings.size}" step="0.1" min="0.5" class="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-indigo-500">
                </div>
            </div>
        </div>
    </div>

    <script>
        // Highlights Observer
        window.addEventListener('DOMContentLoaded', () => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            }, { threshold: 0.2 });
            
            document.querySelectorAll('.marker-highlight').forEach(el => observer.observe(el));
        });

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('teacherBackdrop').classList.add('hidden');
                document.getElementById('teacherBackdrop').classList.remove('flex');
                document.getElementById('settings-modal-backdrop').classList.add('hidden');
                document.getElementById('settings-modal-backdrop').classList.remove('flex');
                document.getElementById('toc-backdrop').classList.add('hidden');
            } else if (e.key === '/' && document.activeElement !== document.getElementById('searchInput') && document.activeElement !== document.getElementById('mobileSearchInput')) {
                e.preventDefault();
                const input = window.innerWidth < 640 ? document.getElementById('mobileSearchInput') : document.getElementById('searchInput');
                if(input) input.focus();
            }
        });

        // Theme Toggle
        const themeBtn = document.getElementById('themeToggleBtn');
        const updateTheme = (isDark) => {
            if (isDark) {
                document.body.classList.add('dark', 'text-white');
                document.body.classList.remove('text-slate-900');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark', 'text-white');
                document.body.classList.add('text-slate-900');
                localStorage.setItem('theme', 'light');
            }
        };

        // Initialize Theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            updateTheme(true);
        } else {
            updateTheme(false);
        }

        themeBtn.addEventListener('click', () => {
             updateTheme(!document.body.classList.contains('dark'));
        });

        // TOC Logic
        const tocBtn = document.getElementById('tocBtn');
        const tocBackdrop = document.getElementById('toc-backdrop');
        const tocClose = document.getElementById('tocClose');
        const tocContent = document.getElementById('toc-content');
        let tocGenerated = false;

        const generateTOC = () => {
            if (tocGenerated) return;
            const nodes = document.querySelectorAll('.topic-node, .header-node');
            let html = '';
            nodes.forEach((node, idx) => {
                const titleNode = node.querySelector('.markdown-content');
                if (titleNode) {
                    node.id = 'toc-target-' + idx;
                    const text = titleNode.textContent.trim() || 'Section';
                    const isTopic = node.classList.contains('topic-node');
                    
                    html += \`
                        <div class="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 p-2.5 rounded-xl transition-colors \${isTopic ? 'font-black text-base text-indigo-600 dark:text-indigo-400 mt-2' : 'ml-4 text-sm font-medium text-slate-600 dark:text-slate-300'} truncate" 
                             onclick="document.getElementById('toc-target-\${idx}').scrollIntoView({behavior: 'smooth', block: 'start'}); document.getElementById('toc-backdrop').classList.add('hidden');">
                            \${text}
                        </div>
                    \`;
                }
            });
            if (!html) html = '<div class="text-sm text-slate-500 p-2">No headers found.</div>';
            tocContent.innerHTML = html;
            tocGenerated = true; // wait, let's regenerate it dynamically or keep it static? Static is fine for export.
        };

        tocBtn.addEventListener('click', () => {
            generateTOC();
            tocBackdrop.classList.remove('hidden');
        });
        tocClose.addEventListener('click', () => tocBackdrop.classList.add('hidden'));
        tocBackdrop.addEventListener('click', (e) => {
            if (e.target === tocBackdrop) tocBackdrop.classList.add('hidden');
        });

        // Print Logic
        document.getElementById('printBtn').addEventListener('click', () => {
            document.body.classList.remove('collapse-mode-active');
            const btnText = toggleCollapseBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Collapse Mode';
            toggleCollapseBtn.classList.remove('bg-indigo-600', 'text-white');
            toggleCollapseBtn.classList.add('bg-indigo-50', 'text-indigo-600');
            document.querySelectorAll('.collapsed').forEach(el => el.classList.remove('collapsed'));
            collapseMode = false;
            setTimeout(() => window.print(), 200);
        });

        // Reading Progress Logic
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            document.getElementById('progress-bar').style.width = scrolled + "%";
        });

        // Collapsible Tree Logic
        let collapseMode = false;
        const toggleCollapseBtn = document.getElementById('toggleCollapseBtn');
        toggleCollapseBtn.addEventListener('click', () => {
            collapseMode = !collapseMode;
            const btnText = toggleCollapseBtn.querySelector('.btn-text');
            if (collapseMode) {
                document.body.classList.add('collapse-mode-active');
                toggleCollapseBtn.classList.add('bg-indigo-600', 'text-white');
                toggleCollapseBtn.classList.remove('bg-indigo-50', 'text-indigo-600');
                if(btnText) btnText.textContent = 'Expand All';
            } else {
                document.body.classList.remove('collapse-mode-active');
                toggleCollapseBtn.classList.remove('bg-indigo-600', 'text-white');
                toggleCollapseBtn.classList.add('bg-indigo-50', 'text-indigo-600');
                if(btnText) btnText.textContent = 'Collapse Mode';
                
                // If turning off collapse mode, uncollapse any previously manually collapsed tags
                document.querySelectorAll('.collapsed').forEach(el => el.classList.remove('collapsed'));
            }
        });

        window.toggleCollapse = function(el) {
            if (!collapseMode) return;
            const container = el.closest('.node-container');
            if (container) {
                el.classList.toggle('collapsed');
                container.classList.toggle('collapsed');
            }
        };

        // Search Logic
        const handleSearch = (e) => {
            const query = e.target.value.toLowerCase();
            const nodes = document.querySelectorAll('.node-container');
            
            if (!query) {
                nodes.forEach(n => n.classList.remove('hidden'));
                return;
            }

            nodes.forEach(n => {
                if (n.textContent.toLowerCase().includes(query)) {
                    n.classList.remove('hidden');
                } else {
                    n.classList.add('hidden');
                }
            });
            
            nodes.forEach(n => {
                if (!n.classList.contains('hidden')) {
                    let parent = n.parentElement.closest('.node-container');
                    while (parent) {
                        parent.classList.remove('hidden');
                        parent = parent.parentElement.closest('.node-container');
                    }
                }
            });
        };

        document.getElementById('searchInput').addEventListener('input', handleSearch);
        document.getElementById('mobileSearchInput').addEventListener('input', handleSearch);

        // Settings Logic
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settings-modal-backdrop');
        const settingsClose = document.getElementById('settingsClose');

        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
            settingsModal.classList.add('flex');
        });
        settingsClose.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
            settingsModal.classList.remove('flex');
        });
        settingsModal.addEventListener('click', e => { 
            if(e.target === settingsModal) {
                settingsModal.classList.add('hidden');
                settingsModal.classList.remove('flex');
            }
        });

        const setupVarCSSSetting = (id, rootVar) => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('input', e => {
                    let val = e.target.value;
                    if (id === 'setting-size') val += 'rem';
                    document.documentElement.style.setProperty(rootVar, val);
                });
            }
        };
        setupVarCSSSetting('setting-size', '--doc-size');

        // Teacher Modal Logic
        const teacherBackdrop = document.getElementById('teacherBackdrop');
        const teacherClose = document.getElementById('teacherClose');
        
        teacherClose.addEventListener('click', () => {
            teacherBackdrop.classList.add('hidden');
            teacherBackdrop.classList.remove('flex');
        });
        teacherBackdrop.addEventListener('click', e => { 
            if(e.target === teacherBackdrop) {
                teacherBackdrop.classList.add('hidden');
                teacherBackdrop.classList.remove('flex');
            }
        });

        document.querySelectorAll('.teacher-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.teacher-tab').forEach(t => {
                    t.classList.remove('bg-indigo-50', 'text-indigo-600', 'dark:bg-indigo-900/30', 'dark:text-indigo-400');
                    t.classList.add('text-slate-500');
                });
                document.querySelectorAll('.teacher-content-pane').forEach(p => {
                    p.classList.remove('block');
                    p.classList.add('hidden');
                });
                
                const target = e.target.getAttribute('data-target');
                e.target.classList.remove('text-slate-500');
                e.target.classList.add('bg-indigo-50', 'text-indigo-600', 'dark:bg-indigo-900/30', 'dark:text-indigo-400');
                
                const pane = document.getElementById(target);
                pane.classList.remove('hidden');
                pane.classList.add('block');
            });
        });

        document.addEventListener('click', e => {
            const trigger = e.target.closest('.teacher-trigger');
            if (trigger) {
                const word = trigger.getAttribute('data-word');
                const explanation = trigger.getAttribute('data-explanation');
                const memory = trigger.getAttribute('data-memory');
                const quiz = trigger.getAttribute('data-quiz');
                const expand = trigger.getAttribute('data-expand');

                document.getElementById('teacherWord').innerText = word;
                document.getElementById('pane-explanation').innerHTML = explanation ? window.marked.parse(explanation) : 'No explanation available.';
                document.getElementById('pane-memory').innerHTML = memory ? window.marked.parse(memory) : 'No memory trick available.';
                document.getElementById('pane-expand').innerHTML = expand ? window.marked.parse(expand) : 'No expansion available.';

                const quizPane = document.getElementById('pane-quiz');
                quizPane.innerHTML = '';
                
                if (!quiz) {
                    quizPane.innerHTML = 'No quiz provided.';
                } else if (quiz.startsWith('F::')) {
                    const parts = quiz.split('::');
                    const question = parts[1];
                    const answer = parts[2] || '';
                    
                    quizPane.innerHTML = \`
                        <div class="flex flex-col items-center gap-6 py-4">
                            <div class="text-2xl font-bold text-center">\${question}</div>
                            <button class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition" onclick="this.nextElementSibling.classList.remove('hidden'); this.nextElementSibling.classList.add('block'); this.classList.add('hidden')">Show Answer</button>
                            <div class="hidden text-xl font-bold text-emerald-600 text-center">\${window.marked.parse(answer)}</div>
                        </div>
                    \`;
                } else if (quiz.startsWith('M::')) {
                    const parts = quiz.split('::');
                    const question = parts[1];
                    const options = [parts[2], parts[3], parts[4], parts[5]].filter(Boolean);
                    const correctIndex = parseInt(parts[6] || '0', 10);
                    
                    let optionsHtml = options.map((opt, idx) => 
                        \`<button class="w-full text-left p-4 mb-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:border-indigo-400 transition" data-correct="\${idx === correctIndex}">\${window.marked.parseInline(opt)}</button>\`
                    ).join('');

                    quizPane.innerHTML = \`
                        <div class="font-bold text-xl mb-6">\${question}</div>
                        <div id="mcq-container">\${optionsHtml}</div>
                    \`;

                    quizPane.querySelectorAll('button[data-correct]').forEach(btn => {
                        btn.addEventListener('click', function() {
                            quizPane.querySelectorAll('button[data-correct]').forEach(b => {
                                b.disabled = true;
                                if (b.getAttribute('data-correct') === 'true') {
                                    b.classList.remove('bg-slate-50', 'border-slate-200', 'dark:bg-slate-800', 'dark:border-slate-700');
                                    b.classList.add('bg-emerald-50', 'border-emerald-500', 'text-emerald-700', 'dark:bg-emerald-900/30', 'dark:text-emerald-400');
                                    if (b === this && typeof confetti !== 'undefined') {
                                        confetti({
                                            particleCount: 100,
                                            spread: 70,
                                            origin: { y: 0.6 }
                                        });
                                    }
                                } else if (b === this) {
                                    b.classList.remove('bg-slate-50', 'border-slate-200', 'dark:bg-slate-800', 'dark:border-slate-700');
                                    b.classList.add('bg-rose-50', 'border-rose-500', 'text-rose-700', 'dark:bg-rose-900/30', 'dark:text-rose-400');
                                }
                            });
                        });
                    });
                } else {
                    quizPane.innerHTML = window.marked.parse(quiz);
                }

                // Reset tabs to Explanation
                document.querySelectorAll('.teacher-tab').forEach(t => {
                    t.classList.remove('bg-indigo-50', 'text-indigo-600', 'dark:bg-indigo-900/30', 'dark:text-indigo-400');
                    t.classList.add('text-slate-500');
                });
                document.querySelectorAll('.teacher-content-pane').forEach(p => {
                    p.classList.remove('block');
                    p.classList.add('hidden');
                });
                const firstTab = document.querySelector('.teacher-tab[data-target="pane-explanation"]');
                firstTab.classList.remove('text-slate-500');
                firstTab.classList.add('bg-indigo-50', 'text-indigo-600', 'dark:bg-indigo-900/30', 'dark:text-indigo-400');
                const firstPane = document.getElementById('pane-explanation');
                firstPane.classList.remove('hidden');
                firstPane.classList.add('block');

                teacherBackdrop.classList.remove('hidden');
                teacherBackdrop.classList.add('flex');
            }
        });

    </script>
</body>
</html>`;
};

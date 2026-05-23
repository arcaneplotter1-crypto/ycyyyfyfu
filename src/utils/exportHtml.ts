import { Question, AppTheme, ExamSettings } from '../types';
import reactCode from '../../node_modules/react-18/umd/react.production.min.js?raw';
import reactDomCode from '../../node_modules/react-dom-18/umd/react-dom.production.min.js?raw';
import babelCode from '../../node_modules/@babel/standalone/babel.min.js?raw';
import tailwindCode from '../../node_modules/@tailwindcss/browser/dist/index.global.js?raw';
import markedCode from '../../node_modules/marked/lib/marked.umd.js?raw';
import liquidGlassCssCode from '../liquid-glass.css?raw';
import fluidCssCode from '../fluid.css?raw';

export const generateStandaloneExam = (questions: Question[], theme: AppTheme, settings: ExamSettings, isOnline: boolean = false) => {
  const title = "Arcane Exam";
  const getThemeSpecificCSS = (theme: AppTheme) => {
    let customCSS = '';
    
    if (theme.visualStyle === 'ultimate') {
      customCSS = `
        body { background-color: #000; color: #fff; transition: background-color 0.3s, color 0.3s; }
        .animated-bg {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -1;
          background: radial-gradient(circle at center, #2a0845 0%, #000000 100%);
          opacity: 1;
          animation: pulseGlow 10s infinite alternate;
        }
        .bg-grid { display: none; }
        .glass-panel {
          background: rgba(15, 15, 25, 0.85) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 0 30px rgba(138, 43, 226, 0.3), inset 0 0 20px rgba(138, 43, 226, 0.1) !important;
          backdrop-filter: blur(20px) !important;
          border-radius: 1rem !important;
        }
        button { border-radius: 1rem !important; }
      `;
    } else if (theme.visualStyle === 'undertale') {
      customCSS = `
        body { background-color: #000; color: #fff; font-family: "Press Start 2P", monospace; transition: background-color 0.3s, color 0.3s; }
        .animated-bg { display: none; }
        .bg-grid { display: none; }
        .glass-panel {
          background: #000 !important;
          border: 4px solid #fff !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        button { font-family: "Press Start 2P", monospace; border-radius: 0 !important; border: 2px solid #fff !important; }
        h1, h2, h3, h4, h5, h6 { font-family: "Press Start 2P", monospace; }
      `;
    } else if (theme.visualStyle === 'arcane' || theme.visualStyle === 'virus') {
      customCSS = `
        body { background-color: #0f0f13; color: #e2e8f0; transition: background-color 0.3s, color 0.3s; }
        .animated-bg {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -1;
          background: radial-gradient(circle at top right, rgba(138,43,226,0.15), transparent 50%),
                      radial-gradient(circle at bottom left, rgba(0,255,255,0.1), transparent 50%);
          opacity: 1;
        }
        .bg-grid {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -1;
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(128, 128, 128, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(128, 128, 128, 0.05) 1px, transparent 1px);
          opacity: 0.5;
        }
        .glass-panel {
          background: rgba(15, 15, 20, 0.9) !important;
          border: 1px solid #8a2be2 !important;
          box-shadow: 0 0 15px rgba(138, 43, 226, 0.4) !important;
          border-radius: 4px !important;
        }
        button { border-radius: 4px !important; }
      `;
    } else if (theme.visualStyle === 'brutalist') {
      customCSS = `
        body { background-color: #fff; color: #000; font-family: "Space Grotesk", sans-serif; transition: background-color 0.3s, color 0.3s; }
        .animated-bg { display: none; }
        .bg-grid { display: none; }
        .glass-panel {
          background: #fff !important;
          border: 4px solid #000 !important;
          border-radius: 0 !important;
          box-shadow: 8px 8px 0 #000 !important;
        }
        button { border-radius: 0 !important; border: 2px solid #000 !important; box-shadow: 4px 4px 0 #000 !important; }
        button:hover { transform: translate(2px, 2px) !important; box-shadow: 2px 2px 0 #000 !important; }
        .dark body { background-color: #111; color: #fff; }
        .dark .glass-panel { background: #222 !important; border-color: #fff !important; box-shadow: 8px 8px 0 #fff !important; }
        .dark button { border-color: #fff !important; box-shadow: 4px 4px 0 #fff !important; }
      `;
    } else if (theme.visualStyle === 'game-minecraft') {
      customCSS = `
        body { background-color: #5eed5e; font-family: "Press Start 2P", monospace; transition: background-color 0.3s, color 0.3s; }
        .dark body { background-color: #1a2e1a; }
        .animated-bg {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -1;
          background-color: #5eed5e;
          background-image: linear-gradient(45deg, #3aae3a 25%, transparent 25%, transparent 75%, #3aae3a 75%, #3aae3a), 
                            linear-gradient(45deg, #3aae3a 25%, transparent 25%, transparent 75%, #3aae3a 75%, #3aae3a);
          background-size: 40px 40px;
          background-position: 0 0, 20px 20px;
          opacity: 0.5;
        }
        .dark .animated-bg { background-color: #1a2e1a; background-image: none; }
        .bg-grid { display: none; }
        .glass-panel {
          background: #c6c6c6 !important;
          border: 4px solid #fff !important;
          border-bottom-color: #555 !important;
          border-right-color: #555 !important;
          border-radius: 0 !important;
          color: #000 !important;
        }
        .dark .glass-panel { background: #333 !important; border-color: #555 !important; border-bottom-color: #111 !important; border-right-color: #111 !important; color: #fff !important; }
        button { border-radius: 0 !important; font-family: "Press Start 2P", monospace; }
        h1, h2, h3, h4, h5, h6 { font-family: "Press Start 2P", monospace; }
      `;
    } else if (theme.visualStyle === 'tadc') {
      customCSS = `
        body { background-color: #fef08a; transition: background-color 0.3s, color 0.3s; }
        .dark body { background-color: #1e1b4b; }
        .animated-bg {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -1;
          background: repeating-conic-gradient(from 0deg, #ef4444 0deg 15deg, #fef08a 15deg 30deg);
          opacity: 0.2;
          animation: spin 60s linear infinite;
        }
        .dark .animated-bg { background: repeating-conic-gradient(from 0deg, #4c1d95 0deg 15deg, #1e1b4b 15deg 30deg); }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .bg-grid { display: none; }
        .glass-panel {
          background: #fff !important;
          border: 4px dashed #ef4444 !important;
          border-radius: 2rem !important;
        }
        .dark .glass-panel { background: #1e293b !important; border-color: #4c1d95 !important; }
      `;
    } else if (theme.visualStyle === 'duck') {
      customCSS = `
        body { background-color: #e0f2fe; transition: background-color 0.3s, color 0.3s; }
        .dark body { background-color: #0c4a6e; }
        .animated-bg {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -1;
          background: radial-gradient(circle at 50% 50%, #bae6fd 0%, #7dd3fc 100%);
          opacity: 1;
        }
        .dark .animated-bg { background: radial-gradient(circle at 50% 50%, #075985 0%, #0c4a6e 100%); }
        .bg-grid { display: none; }
        .glass-panel {
          background: rgba(255, 255, 255, 0.9) !important;
          border: 4px solid #fcd34d !important;
          border-radius: 3rem !important;
        }
        .dark .glass-panel { background: rgba(15, 23, 42, 0.9) !important; border-color: #b45309 !important; }
      `;
    } else if (theme.visualStyle === 'saidi') {
      customCSS = `
        body { background-color: #fef3c7; font-family: "Amiri", serif; transition: background-color 0.3s, color 0.3s; }
        .dark body { background-color: #1c1917; }
        .animated-bg {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -1;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.5;
        }
        .dark .animated-bg { opacity: 0.1; }
        .bg-grid { display: none; }
        .glass-panel {
          background: #fffbeb !important;
          border: 2px solid #d97706 !important;
          border-radius: 8px !important;
        }
        .dark .glass-panel { background: #292524 !important; border-color: #78350f !important; }
      `;
    } else if (theme.visualStyle === 'adventure-time') {
      customCSS = `
        body { background-color: #7dd3fc; transition: background-color 0.3s, color 0.3s; }
        .dark body { background-color: #0c4a6e; }
        .animated-bg {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -1;
          background: linear-gradient(to bottom, #38bdf8, #bae6fd);
          opacity: 1;
        }
        .dark .animated-bg { background: linear-gradient(to bottom, #075985, #0c4a6e); }
        .bg-grid { display: none; }
        .glass-panel {
          background: #fff !important;
          border: 4px solid #000 !important;
          border-radius: 1rem !important;
          box-shadow: 4px 4px 0 #000 !important;
        }
        .dark .glass-panel { background: #1e293b !important; border-color: #fff !important; box-shadow: 4px 4px 0 #fff !important; }
        button { border: 2px solid #000 !important; box-shadow: 2px 2px 0 #000 !important; }
        .dark button { border-color: #fff !important; box-shadow: 2px 2px 0 #fff !important; }
      `;
    } else {
      // Default modern
      customCSS = `
        body { transition: background-color 0.3s, color 0.3s; }
        .animated-bg {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: -1;
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
          opacity: 0.05;
          will-change: background-position;
          transform: translateZ(0);
        }
        .dark .animated-bg {
          background: linear-gradient(-45deg, #1e1b4b, #312e81, #1e1b4b, #0f172a);
          opacity: 0.5;
        }
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .bg-grid {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: -1;
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(128, 128, 128, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(128, 128, 128, 0.05) 1px, transparent 1px);
          transform: translateZ(0);
        }
    .glass-panel {
      background: rgba(255, 255, 255, 0.7) !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1) !important;
      transform: translateZ(0);
      will-change: transform, opacity;
      contain: content;
    }
        .dark .glass-panel {
          background: rgba(15, 23, 42, 0.7) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5) !important;
        }
      `;
    }
  
    return customCSS;
  };

  let css = '';
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          css += rule.cssText + '\n';
        }
      } catch (e) {
        // Ignore cross-origin stylesheet errors
      }
    }
  } catch (e) {
    console.warn('Could not read stylesheets', e);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Press+Start+2P&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
  ${isOnline ? `
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.0.0-alpha.14/dist/index.global.js"></script>
  <script src="https://unpkg.com/marked/lib/marked.umd.js"></script>
  ` : `
  <script>${reactCode}</script>
  <script>${reactDomCode}</script>
  <script>${babelCode}</script>
  <script>${tailwindCode}</script>
  <script>${markedCode}</script>
  `}
  <style>
    ${liquidGlassCssCode}
    ${fluidCssCode}
  </style>
  <style type="text/tailwindcss">
    * { transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease; }
    @theme {
      --font-sans: "Plus Jakarta Sans", sans-serif;
      --font-mono: "JetBrains Mono", monospace;
      --font-display: "Space Grotesk", sans-serif;
      --font-game: "Press Start 2P", sans-serif;

      --animate-fade-in-up: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      --animate-scale-in: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      --animate-slide-in-right: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      --animate-slide-in-left: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      --animate-pop: pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      --animate-pulse-glow: pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      --animate-shake: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      --animate-float: float 6s ease-in-out infinite;

      @keyframes fadeInUp {
        0% { opacity: 0; transform: translate3d(0, 20px, 0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes scaleIn {
        0% { opacity: 0; transform: scale3d(0.95, 0.95, 1); }
        100% { opacity: 1; transform: scale3d(1, 1, 1); }
      }
      @keyframes slideInRight {
        0% { opacity: 0; transform: translate3d(20px, 0, 0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes slideInLeft {
        0% { opacity: 0; transform: translate3d(-20px, 0, 0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes pop {
        0% { transform: scale3d(0.95, 0.95, 1); }
        50% { transform: scale3d(1.02, 1.02, 1); }
        100% { transform: scale3d(1, 1, 1); }
      }
      @keyframes pulseGlow {
        0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
        50% { opacity: .8; box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
      }
      @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
      }
      @keyframes float {
        0%, 100% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(0, -10px, 0); }
      }
    }
    .question-map-toggle { color: inherit !important; opacity: 0.6; transition: opacity 0.2s; }
    .question-map-toggle:hover { opacity: 1; }
  </style>
  <style>
    ${css}
    body { 
      margin: 0; padding: 0; overflow-x: hidden; 
      text-rendering: optimizeSpeed;
      -webkit-font-smoothing: antialiased;
    }
    [class*="animate-"] {
      will-change: transform, opacity;
      backface-visibility: hidden;
    }
    ${getThemeSpecificCSS(theme)}
    /* Markdown Styles */
    .markdown-content strong { font-weight: 800; color: inherit; }
    .markdown-content em { font-style: italic; }
    .markdown-content mark { background-color: rgba(250, 204, 21, 0.4); padding: 0 0.25rem; border-radius: 0.25rem; color: inherit; }
    .dark .markdown-content mark { background-color: rgba(234, 179, 8, 0.3); }
    
    /* Term Styles */
    .term-inactive {
      cursor: help;
      text-decoration: underline;
      text-decoration-style: dashed;
      text-decoration-color: rgba(99, 102, 241, 0.5);
      text-underline-offset: 4px;
      font-weight: 600;
      color: inherit;
    }
    .dark .term-inactive {
      text-decoration-color: rgba(67, 56, 202, 0.5);
    }
    .term-active {
      position: relative;
      display: inline-block;
      cursor: pointer;
      text-decoration: underline;
      text-decoration-style: dashed;
      text-decoration-thickness: 2px;
      text-decoration-color: rgb(99, 102, 241);
      text-underline-offset: 4px;
      font-weight: 700;
      color: rgb(67, 56, 202);
      transition: all 0.2s ease;
    }
    .term-active:hover {
      text-decoration-style: solid;
      color: rgb(79, 70, 229);
      background-color: rgba(99, 102, 241, 0.05);
      border-radius: 4px;
    }
    .dark .term-active {
      color: rgb(165, 180, 252);
      text-decoration-color: rgb(129, 140, 248);
    }
    .dark .term-active:hover {
      color: rgb(199, 210, 254);
      background-color: rgba(129, 140, 248, 0.1);
    }
    .term-indicator {
      position: absolute;
      right: -6px;
      top: -6px;
      display: flex;
      height: 10px;
      width: 10px;
    }
    .term-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
      position: absolute;
      display: inline-flex;
      height: 100%;
      width: 100%;
      border-radius: 9999px;
      background-color: rgb(129, 140, 248);
      opacity: 0.75;
      will-change: transform, opacity;
      transform: translateZ(0);
    }
    .term-dot {
      position: relative;
      display: inline-flex;
      border-radius: 9999px;
      height: 10px;
      width: 10px;
      background-color: rgb(99, 102, 241);
    }
    @keyframes ping {
      75%, 100% {
        transform: scale3d(2, 2, 1);
        opacity: 0;
      }
    }
    
    .modal-overlay-enter {
      animation: modalOverlayEnter 0.3s ease-out forwards;
    }
    @keyframes modalOverlayEnter {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content-enter {
      animation: modalContentEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes modalContentEnter {
      from { opacity: 0; transform: scale(0.9) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .animate-pop-notification {
      animation: pop-notification 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      will-change: transform, opacity;
      backface-visibility: hidden;
      transform: translate3d(-50%, -50%, 0);
    }
    @keyframes pop-notification {
      0% { transform: translate3d(-50%, -50%, 0) scale3d(0.5, 0.5, 1); opacity: 0; }
      100% { transform: translate3d(-50%, -50%, 0) scale3d(1, 1, 1); opacity: 1; }
    }

    .animate-feedback-pulse {
      animation: feedback-pulse 0.6s ease-out forwards;
      will-change: opacity;
    }
    @keyframes feedback-pulse {
      0% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; }
    }

    .animate-particle {
      animation: particle-fade 0.8s ease-out forwards;
      will-change: transform, opacity;
    }
    @keyframes particle-fade {
      0% { transform: scale(0); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }

  </style>
</head>
<body class="visual-${theme.visualStyle} theme-${theme.accentColor} bg-indigo-50/30 text-slate-900 dark:bg-slate-950 dark:text-slate-50 min-h-screen">
  <div class="animated-bg"></div>
  <div class="bg-grid"></div>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useMemo } = React;

    const EXAM_DATA = ${JSON.stringify(questions)};
    const THEME = ${JSON.stringify(theme)};
    const SETTINGS = ${JSON.stringify(settings)};
    const TITLE = ${JSON.stringify(title)};

    // Custom Markdown Parser for standalone HTML
    function renderMarkdown(text, showTerms = false) {
      if (!text) return { __html: '' };
      // Handle standard markdown and ==highlight==
      let html = text
        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
        .replace(/==(.*?)==/g, '<mark>$1</mark>')
        .replace(/\\n/g, '<br/>');

      if (showTerms) {
        // Replace term tags with interactive tooltip HTML
        html = html.replace(/<term\\s+title=(?:'|")([^'"]+)(?:'|")[^>]*>([\\s\\S]*?)<\\/term>/g, 
          '<span class="term-active" data-title="$1">$2<span class="term-indicator"><span class="term-ping"></span><span class="term-dot"></span></span></span>'
        );
      } else {
        // Replace term tags with inactive styled text
        html = html.replace(/<term[^>]*>([\\s\\S]*?)<\\/term>/g, 
          '<span class="term-inactive">$1</span>'
        );
      }

      return { __html: html };
    }

    // Icons
    const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
    const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
    const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
    const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
    const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
    const ShuffleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>;
    const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
    const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;

    const FeedbackNotification = ({ status }) => {
      if (status === 'none') return null;
      const config = {
        correct: { text: 'CORRECT', color: 'bg-emerald-500', icon: <CheckIcon /> },
        incorrect: { text: 'INCORRECT', color: 'bg-red-500', icon: <XIcon /> },
        timeout: { text: 'TIME OUT', color: 'bg-amber-500', icon: <ClockIcon /> }
      };
      const { text, color, icon } = config[status];
      return (
        <div className="fixed top-1/2 left-1/2 z-[200] pointer-events-none animate-pop-notification" style={{ contain: 'layout paint' }}>
          <div className={\`\${color} text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border-4 border-white dark:border-slate-900\`}>
            <div className="scale-150">{icon}</div>
            <span className="text-4xl font-black italic tracking-tighter">\${text}</span>
          </div>
        </div>
      );
    };

    const FeedbackEffects = ({ status, theme }) => {
      if (status === 'none') return null;
      const isHollowKnight = theme.visualStyle === 'hollow-knight';
      const isSilksong = theme.accentColor === 'silksong-red' || theme.accentColor === 'silksong-gold';
      
      const color = status === 'correct' ? '#10b981' : status === 'incorrect' ? '#ef4444' : '#f59e0b';
      const bgColor = status === 'correct' ? 'bg-emerald-500/10' : status === 'incorrect' ? 'bg-red-500/10' : 'bg-amber-500/10';

      if (isHollowKnight || isSilksong) {
        // Memoize particles to avoid re-calculating random values on every render during the animation
        const particles = useMemo(() => [...Array(12)].map((_, i) => ({
          left: \`\${Math.random() * 100}%\`,
          top: \`\${Math.random() * 100}%\`,
          delay: \`\${Math.random() * 0.3}s\`,
          size: \`\${4 + Math.random() * 6}px\`
        })), [status]);

        return (
          <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden" style={{ contain: 'strict' }}>
            <div className={\`absolute inset-0 \${bgColor} animate-feedback-pulse\`} />
            <div className="absolute inset-0 flex items-center justify-center">
              {particles.map((p, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full animate-particle"
                  style={{
                    backgroundColor: color,
                    left: p.left,
                    top: p.top,
                    width: p.size,
                    height: p.size,
                    animationDelay: p.delay,
                    willChange: 'transform, opacity'
                  }}
                />
              ))}
            </div>
          </div>
        );
      }
      
      return (
        <div className="fixed inset-0 z-[150] pointer-events-none" style={{ contain: 'strict' }}>
          <div className={\`absolute inset-0 \${status === 'correct' ? 'bg-emerald-500/20' : status === 'incorrect' ? 'bg-red-500/20' : 'bg-amber-500/20'} animate-feedback-pulse\`} />
        </div>
      );
    };

    // Essay Grading Logic
    const STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'is', 'was', 'are', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'it', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    function cleanText(text) {
      return text.toLowerCase().replace(/[.,\\/#!$%\\^&\\*;:{}=\\-_\\\`~()]/g, "").replace(/\\s{2,}/g, " ").trim();
    }
    function stem(word) {
      return word.replace(/(ing|ed|s|ly|es|ies)$/, "");
    }
    function levenshteinDistance(a, b) {
      const matrix = Array.from({ length: a.length + 1 }, () => Array.from({ length: b.length + 1 }, () => 0));
      for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
      }
      return matrix[a.length][b.length];
    }
    function isFuzzyMatch(s1, s2) {
      if (s1 === s2) return true;
      if (Math.abs(s1.length - s2.length) > 1) return false;
      const distance = levenshteinDistance(s1, s2);
      const maxLength = Math.max(s1.length, s2.length);
      let threshold = 0;
      if (maxLength >= 10) threshold = 2;
      else if (maxLength >= 5) threshold = 1;
      return distance <= threshold;
    }

    function isQuestionCorrect(q, answer, feedback) {
      if (!answer && q.type !== 'essay') return false;
      if (q.type === 'mcq' || q.type === 'true_false') {
        return answer === q.correctAnswer;
      } else if (q.type === 'essay') {
        return feedback && feedback.score >= 50;
      } else if (q.type === 'multi_select') {
        const selected = (answer || '').split('|').filter(Boolean).sort();
        const correct = (q.correctAnswers || []).slice().sort();
        return JSON.stringify(selected) === JSON.stringify(correct);
      } else if (q.type === 'fill_in_blanks') {
        const selected = (answer || '').split('|');
        const correct = q.blanks || [];
        return selected.length === correct.length && selected.every((a, i) => isFuzzyMatch(a, correct[i]));
      } else if (q.type === 'matching') {
        const selected = (answer || '').split('|').filter(Boolean).sort();
        const correct = (q.matchingPairs || []).map(p => \`\${p.term}:\${p.definition}\`).sort();
        return JSON.stringify(selected) === JSON.stringify(correct);
      } else if (q.type === 'locate_on_image') {
        let selected = [];
        try { selected = JSON.parse(answer || '[]'); } catch(e) {}
        const targets = q.imageTargets || [];
        if (selected.length !== targets.length) return false;
        return selected.every(sel => {
          const target = targets.find(t => t.id === sel.targetId);
          return target && Math.sqrt(Math.pow(sel.x - target.x, 2) + Math.pow(sel.y - target.y, 2)) <= target.radius;
        });
      }
      return false;
    }
    function extractKeyTerms(text) {
      const cleaned = cleanText(text);
      const words = cleaned.split(" ");
      return words.filter(w => w.length >= 3 && !STOP_WORDS.has(w) && isNaN(Number(w))).map(stem);
    }
    function gradeEssay(studentAnswer, correctAnswer) {
      const studentTermsList = extractKeyTerms(studentAnswer);
      const correctTermsList = extractKeyTerms(correctAnswer);
      const studentTerms = new Set(studentTermsList);
      const correctTerms = new Set(correctTermsList);
      const usedTermsList = [];
      const correctTermsArray = Array.from(correctTerms);
      const studentTermsArray = Array.from(studentTerms);
      for (const correctTerm of correctTermsArray) {
        const hasMatch = studentTermsArray.some(studentTerm => isFuzzyMatch(studentTerm, correctTerm));
        if (hasMatch) usedTermsList.push(correctTerm);
      }
      const intersection = new Set(usedTermsList);
      const union = new Set([...studentTerms, ...correctTerms]);
      const similarity = union.size === 0 ? 0 : intersection.size / union.size;
      const coverage = correctTerms.size === 0 ? 0 : intersection.size / correctTerms.size;
      const baseScore = (similarity * 0.4 + coverage * 0.6) * 100;
      const lengthBonus = Math.min(studentAnswer.length / 150, 25);
      const hasParagraphs = studentAnswer.includes("\\n\\n");
      const structureBonus = hasParagraphs ? 5 : 0;
      const finalScore = Math.round(Math.min(baseScore + lengthBonus + structureBonus, 100));
      let grade = "";
      let feedback = "";
      if (finalScore >= 90) { grade = "Excellent"; feedback = "Outstanding answer! Covers all key concepts and demonstrates deep understanding."; }
      else if (finalScore >= 80) { grade = "Very Good"; feedback = "Strong answer. Covers most key points with good detail."; }
      else if (finalScore >= 70) { grade = "Good"; feedback = "Good effort. Covers main concepts but could benefit from more detail."; }
      else if (finalScore >= 60) { grade = "Satisfactory"; feedback = "Addresses the question but misses some important points."; }
      else if (finalScore >= 50) { grade = "Needs Improvement"; feedback = "Partially correct but missing major concepts."; }
      else { grade = "Poor"; feedback = "Does not adequately address the question."; }
      const usedTerms = Array.from(intersection);
      const missingTerms = Array.from(correctTerms).filter(x => !studentTerms.has(x)).slice(0, 10);
      return { score: finalScore, grade, feedback, usedTerms, missingTerms, length: studentAnswer.length, hasParagraphs, misspelledWords: [] };
    }

    function App() {
      const [view, setView] = useState('start'); // start, exam, results, review
      const [currentIndex, setCurrentIndex] = useState(0);
      const [direction, setDirection] = useState('right');
      const [answers, setAnswers] = useState({});
      const [questions, setQuestions] = useState(EXAM_DATA);
      const [activeTerm, setActiveTerm] = useState(null);
      const [isMapExpanded, setIsMapExpanded] = useState(false);
      const [flaggedQuestions, setFlaggedQuestions] = useState({});
      const [showExplanationMap, setShowExplanationMap] = useState({});
      const [feedbackStatus, setFeedbackStatus] = useState('none');
      
      const [localSettings, setLocalSettings] = useState({

        timeLimit: SETTINGS.timeLimitType === 'none' ? 0 : 
                   SETTINGS.timeLimitType === 'total' ? (SETTINGS.timeLimitValue || 0) * 60 : 
                   (SETTINGS.timeLimitValue || 0) * EXAM_DATA.length,
        instantFeedback: SETTINGS.instantFeedback || false,
        shuffle: SETTINGS.randomizeQuestions || false,
        darkMode: THEME.visualStyle === 'undertale'
      });
      const [timeLeft, setTimeLeft] = useState(null);
      const [showFeedback, setShowFeedback] = useState(false);
      const [essayFeedback, setEssayFeedback] = useState({});

      const [showEasterEgg, setShowEasterEgg] = useState(false);
      const [easterEggGif, setEasterEggGif] = useState('');
      const [eggBorderColor, setEggBorderColor] = useState('');
      const [searchQuery, setSearchQuery] = useState('');

      const filteredQuestionsMap = useMemo(() => {
        if (!searchQuery.trim()) return questions.map((_, i) => i);
        const lowerQuery = searchQuery.toLowerCase();
        return questions.map((q, i) => {
          let textToSearch = (q.question || '').toLowerCase();
          if (q.type === 'mcq' || q.type === 'multi_select') {
            textToSearch += ' ' + (q.options || []).join(' ').toLowerCase();
          } else if (q.type === 'fill_in_blanks') {
            textToSearch += ' ' + (q.wordBank || []).join(' ').toLowerCase();
          } else if (q.type === 'matching') {
            textToSearch += ' ' + (q.matchingPairs || []).map(p => p.term + ' ' + p.definition).join(' ').toLowerCase();
            textToSearch += ' ' + (q.matchingDistractors || []).join(' ').toLowerCase();
          } else if (q.type === 'multi_essay') {
            textToSearch += ' ' + (q.subQuestions || []).map(sq => sq.question).join(' ').toLowerCase();
          }
          if (textToSearch.includes(lowerQuery)) return i;
          return -1;
        }).filter(i => i !== -1);
      }, [questions, searchQuery]);

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
        'https://cdn3.emoji.gg/emojis/7702-chad.png'
      ];

      useEffect(() => {
        const handleGlobalClick = (e) => {
          const term = e.target.closest('.term-active');
          if (term) {
            const title = term.getAttribute('data-title');
            const word = term.innerText;
            setActiveTerm({ title, word });
          }
        };
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
      }, []);

      useEffect(() => {
        if (localSettings.darkMode) {

          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, [localSettings.darkMode]);

      const score = useMemo(() => {
        let s = 0;
        questions.forEach(q => {
          if (isQuestionCorrect(q, answers[q.id], essayFeedback[q.id])) s++;
        });
        return s;
      }, [answers, essayFeedback, questions]);

      const maxScore = useMemo(() => questions.length, [questions]);
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

      useEffect(() => {
        if (view === 'exam' && localSettings.timeLimit > 0 && timeLeft !== null) {
          if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
          } else if (timeLeft === 0) {
            handleFinish('timeout');
          }
        }
      }, [view, timeLeft, localSettings.timeLimit]);

      useEffect(() => {
        if (view === 'results') {
          if (percentage === 0) {
            const randomGif = gifs0[Math.floor(Math.random() * gifs0.length)];
            setEasterEggGif(randomGif);
            setEggBorderColor('border-red-500');
            setShowEasterEgg(true);
            const timer = setTimeout(() => setShowEasterEgg(false), 8000);
            return () => clearTimeout(timer);
          } else if (percentage === 67) {
            const randomGif = gifs67[Math.floor(Math.random() * gifs67.length)];
            setEasterEggGif(randomGif);
            setEggBorderColor('border-indigo-500');
            setShowEasterEgg(true);
            const timer = setTimeout(() => setShowEasterEgg(false), 8000);
            return () => clearTimeout(timer);
          } else if (percentage === 100) {
            const randomGif = gifs100[Math.floor(Math.random() * gifs100.length)];
            setEasterEggGif(randomGif);
            setEggBorderColor('border-amber-500');
            setShowEasterEgg(true);
            const timer = setTimeout(() => setShowEasterEgg(false), 8000);
            return () => clearTimeout(timer);
          }
        }
      }, [view, percentage]);

      const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return \`\${m}:\${s < 10 ? '0' : ''}\${s}\`;
      };

      const handleStart = () => {
        let qs = [...EXAM_DATA];
        
        if (localSettings.shuffle) {
          for (let i = qs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [qs[i], qs[j]] = [qs[j], qs[i]];
          }
        }

        qs.sort((a, b) => {
          if (SETTINGS.essaysLast) {
            const aIsEssay = a.type === 'essay';
            const bIsEssay = b.type === 'essay';
            if (!aIsEssay && bIsEssay) return -1;
            if (aIsEssay && !bIsEssay) return 1;
          }
          if (SETTINGS.imagesLast) {
            const aHasImg = !!a.imageUrl;
            const bHasImg = !!b.imageUrl;
            if (!aHasImg && bHasImg) return -1;
            if (aHasImg && !bHasImg) return 1;
          }
          return 0;
        });

        setQuestions(qs);
        setView('exam');
        setCurrentIndex(0);
        setDirection('right');
        setAnswers({});
        setEssayFeedback({});
        setShowFeedback(false);
        if (localSettings.timeLimit > 0) {
          setTimeLeft(localSettings.timeLimit); // timeLimit is already in seconds from SETTINGS.timeLimitValue
        } else {
          setTimeLeft(null);
        }
      };

      const handleFinish = (status = 'none') => {
        if (status === 'timeout') {
          setFeedbackStatus('timeout');
          setTimeout(() => {
            setFeedbackStatus('none');
            finalizeFinish();
          }, 2000);
        } else {
          finalizeFinish();
        }
      };

      const finalizeFinish = () => {
        const newFeedback = { ...essayFeedback };
        questions.forEach(q => {
          if (q.type === 'essay' && answers[q.id] && !newFeedback[q.id]) {
            newFeedback[q.id] = gradeEssay(answers[q.id], q.correctAnswer || '');
          } else if (q.type === 'multi_essay' && answers[q.id] && !newFeedback[q.id]) {
            const parsedAnswers = JSON.parse(answers[q.id] || '{}');
            const subFeeds = {};
            let tScore = 0;
            (q.subQuestions || []).forEach(sq => {
              const fb = gradeEssay(parsedAnswers[sq.id] || '', sq.correctAnswer || '');
              subFeeds[sq.id] = fb;
              tScore += fb.score;
            });
            const avg = (q.subQuestions && q.subQuestions.length > 0) ? tScore / q.subQuestions.length : 0;
            newFeedback[q.id] = { score: avg, subFeedbacks: subFeeds, feedback: 'Graded per question' };
          }
        });
        setEssayFeedback(newFeedback);
        setView('results');
      };

      if (view === 'start') {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 animate-scale-in">
            <div className="glass-panel p-8 sm:p-12 rounded-[2rem] max-w-xl w-full text-center space-y-8">
              <div className="w-20 h-20 mx-auto bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl rotate-3 animate-float">
                <PlayIcon />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{TITLE}</h1>
                <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">{questions.length} Questions</p>
              </div>

              <div className="bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left divide-y divide-slate-200 dark:divide-slate-800 shadow-sm">
                
                {/* Time Limit */}
                <div className="p-4 sm:p-5 flex flex-col gap-4 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <ClockIcon />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Time Limit</div>
                        <div className="text-xs text-slate-500 font-medium">Duration of the exam</div>
                      </div>
                    </div>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg text-sm">
                      {localSettings.timeLimit === 0 ? 'No Timer' : \`\${Math.floor(localSettings.timeLimit / 60)} Minutes\`}
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="7200" 
                    step="60"
                    value={localSettings.timeLimit}
                    onChange={(e) => setLocalSettings({...localSettings, timeLimit: Number(e.target.value)})}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Feedback */}
                <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl">
                      <ZapIcon />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Instant Feedback</div>
                      <div className="text-xs text-slate-500 font-medium">Show answers immediately</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setLocalSettings({...localSettings, instantFeedback: !localSettings.instantFeedback})}
                    className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 \${localSettings.instantFeedback ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}\`}
                  >
                    <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${localSettings.instantFeedback ? 'translate-x-6' : 'translate-x-1'}\`} />
                  </button>
                </div>

                {/* Shuffle */}
                <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <ShuffleIcon />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Shuffle Questions</div>
                      <div className="text-xs text-slate-500 font-medium">Randomize question order</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setLocalSettings({...localSettings, shuffle: !localSettings.shuffle})}
                    className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 \${localSettings.shuffle ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}\`}
                  >
                    <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${localSettings.shuffle ? 'translate-x-6' : 'translate-x-1'}\`} />
                  </button>
                </div>

                {/* Appearance */}
                <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-xl">
                      {localSettings.darkMode ? <MoonIcon /> : <SunIcon />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Dark Mode</div>
                      <div className="text-xs text-slate-500 font-medium">Toggle appearance theme</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setLocalSettings({...localSettings, darkMode: !localSettings.darkMode})}
                    disabled={THEME.visualStyle === 'undertale'}
                    className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 \${THEME.visualStyle === 'undertale' ? 'opacity-50 cursor-not-allowed' : ''} \${localSettings.darkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}\`}
                  >
                    <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${localSettings.darkMode ? 'translate-x-6' : 'translate-x-1'}\`} />
                  </button>
                </div>

              </div>

              <button onClick={handleStart} className="w-full py-4 sm:py-5 bg-indigo-600 text-white font-black text-lg uppercase tracking-widest rounded-2xl shadow-[0_8px_0_rgb(49,46,129)] hover:shadow-[0_4px_0_rgb(49,46,129)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all">
                Start Exam
              </button>
            </div>
          </div>
        );
      }

      if (view === 'results') {
        const renderEasterEgg = () => {
          if (!showEasterEgg) return null;
          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
              <div className={\`relative p-2 sm:p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl border-4 sm:border-8 \${eggBorderColor} animate-pop\`}>
                <div className={\`absolute inset-0 \${percentage === 0 ? 'bg-red-500/10' : percentage === 100 ? 'bg-amber-500/10' : 'bg-indigo-500/10'} blur-xl sm:blur-2xl rounded-full animate-pulse\`} />
                <img 
                  src={easterEggGif} 
                  alt="Easter Egg" 
                  className="relative w-32 h-32 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain rounded-[1rem] sm:rounded-[2rem]"
                />
              </div>
            </div>
          );
        };

        const renderButtons = (btnClass1, btnClass2) => (
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 relative z-10">
            <button onClick={() => { setView('review'); setCurrentIndex(0); setDirection('right'); setShowFeedback(false); }} className={btnClass1}>
              REVIEW
            </button>
            <button onClick={handleStart} className={btnClass2}>
              RESTART
            </button>
          </div>
        );

        const renderThemeContent = () => {
          switch (THEME.visualStyle) {
            case 'brutalist':
              return (
                <div className="border-8 border-black bg-white p-8 sm:p-16 shadow-[16px_16px_0_#000] transform -rotate-1 dark:bg-[#111] dark:border-white dark:shadow-[16px_16px_0_#fff] max-w-4xl mx-auto w-full">
                   <h2 className="text-6xl sm:text-9xl font-black uppercase tracking-tighter text-black dark:text-white mb-8">DONE.</h2>
                   <div className="flex flex-col sm:flex-row gap-8 border-y-8 border-black dark:border-white py-8 mb-8">
                     <div className="flex-1 sm:border-r-8 border-black dark:border-white">
                       <div className="text-7xl sm:text-8xl font-black text-black dark:text-white">{score}</div>
                       <div className="text-2xl font-bold uppercase text-black dark:text-white">Correct</div>
                     </div>
                     <div className="flex-1">
                       <div className="text-7xl sm:text-8xl font-black text-black dark:text-white">{percentage}%</div>
                       <div className="text-2xl font-bold uppercase text-black dark:text-white">Score</div>
                     </div>
                   </div>
                   {renderButtons(
                     "flex-1 py-4 border-4 border-black dark:border-white bg-white dark:bg-[#111] text-black dark:text-white font-black uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center gap-2",
                     "flex-1 py-4 border-4 border-black dark:border-white bg-[#D32F2F] text-white font-black uppercase hover:bg-black dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center gap-2"
                   )}
                </div>
              );
            case 'game-minecraft':
              return (
                <div className="bg-[#c6c6c6] border-[6px] border-white border-b-[#555] border-r-[#555] p-8 sm:p-12 text-black font-['Press_Start_2P'] max-w-4xl mx-auto w-full">
                  <h2 className="text-3xl sm:text-5xl mb-10 text-center text-yellow-300 drop-shadow-[4px_4px_0_#3f3f3f]">LEVEL COMPLETE</h2>
                  <div className="bg-[#8b8b8b] border-[4px] border-[#373737] border-b-white border-r-white p-6 mb-8 flex flex-col sm:flex-row gap-6">
                     <div className="flex-1 text-center">
                       <div className="text-4xl mb-2 text-white drop-shadow-[2px_2px_0_#3f3f3f]">{score}/{maxScore}</div>
                       <div className="text-xs text-[#3f3f3f]">XP ORBS</div>
                     </div>
                     <div className="flex-1 text-center">
                       <div className="text-4xl mb-2 text-[#5eed5e] drop-shadow-[2px_2px_0_#3f3f3f]">{percentage}%</div>
                       <div className="text-xs text-[#3f3f3f]">SCORE</div>
                     </div>
                  </div>
                  {renderButtons(
                     "flex-1 py-4 bg-[#c6c6c6] border-4 border-white border-b-[#555] border-r-[#555] text-black font-['Press_Start_2P'] text-xs hover:bg-[#d9d9d9] active:border-t-[#555] active:border-l-[#555] active:border-b-white active:border-r-white flex items-center justify-center gap-2",
                     "flex-1 py-4 bg-[#5eed5e] border-4 border-[#aaffaa] border-b-[#228822] border-r-[#228822] text-black font-['Press_Start_2P'] text-xs hover:bg-[#77ff77] active:border-t-[#228822] active:border-l-[#228822] active:border-b-[#aaffaa] active:border-r-[#aaffaa] flex items-center justify-center gap-2"
                  )}
                </div>
              );
            case 'undertale':
              return (
                <div className="bg-black border-4 border-white p-8 sm:p-12 text-white font-['Press_Start_2P'] text-center max-w-4xl mx-auto w-full">
                  <h2 className="text-3xl sm:text-4xl mb-12">* You won!</h2>
                  <div className="flex flex-col gap-6 mb-12 text-left max-w-md mx-auto">
                     <div className="text-xl">* You earned {score} EXP.</div>
                     <div className="text-xl">* Your LOVE increased to {percentage}%.</div>
                  </div>
                  {renderButtons(
                     "flex-1 py-4 bg-black border-2 border-white text-white font-['Press_Start_2P'] text-xs hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2",
                     "flex-1 py-4 bg-black border-2 border-yellow-400 text-yellow-400 font-['Press_Start_2P'] text-xs hover:bg-yellow-400 hover:text-black transition-colors flex items-center justify-center gap-2"
                  )}
                </div>
              );
            case 'tadc':
              return (
                <div className="bg-white border-8 border-dashed border-red-600 rounded-[3rem] p-8 sm:p-12 text-center relative overflow-hidden max-w-4xl mx-auto w-full">
                  <div className="absolute inset-0 bg-[repeating-conic-gradient(from_0deg,#ef4444_0deg_15deg,#fef08a_15deg_30deg)] opacity-10 animate-[spin_10s_linear_infinite]" />
                  <h2 className="text-5xl sm:text-7xl font-black text-blue-600 mb-8 relative z-10 animate-tadc-glitch">PERFORMANCE EVALUATION</h2>
                  <div className="flex flex-col sm:flex-row gap-4 mb-8 relative z-10">
                     <div className="flex-1 bg-yellow-300 border-4 border-black rounded-3xl p-6 transform rotate-3">
                       <div className="text-6xl font-black">{score}</div>
                       <div className="font-bold">HITS</div>
                     </div>
                     <div className="flex-1 bg-red-500 text-white border-4 border-black rounded-3xl p-6 transform -rotate-2">
                       <div className="text-6xl font-black">{percentage}%</div>
                       <div className="font-bold">SANITY</div>
                     </div>
                  </div>
                  {renderButtons(
                     "flex-1 py-4 bg-blue-500 border-4 border-black rounded-2xl text-white font-black uppercase hover:bg-blue-400 hover:-translate-y-1 transition-all shadow-[4px_4px_0_#000] flex items-center justify-center gap-2",
                     "flex-1 py-4 bg-red-500 border-4 border-black rounded-2xl text-white font-black uppercase hover:bg-red-400 hover:-translate-y-1 transition-all shadow-[4px_4px_0_#000] flex items-center justify-center gap-2"
                  )}
                </div>
              );
            case 'duck':
              return (
                <div className="bg-white/80 backdrop-blur-md border-4 border-yellow-400 rounded-[3rem] p-8 sm:p-12 text-center relative overflow-hidden shadow-[0_0_40px_rgba(250,204,21,0.3)] max-w-4xl mx-auto w-full">
                  <h2 className="text-5xl sm:text-7xl font-black text-blue-500 mb-8 drop-shadow-md">SPLISH SPLASH!</h2>
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                     <div className="flex-1 bg-blue-100 border-4 border-blue-300 rounded-[2rem] p-8">
                       <div className="text-5xl font-black text-blue-600">{score}</div>
                       <div className="font-bold text-blue-400">BUBBLES</div>
                     </div>
                     <div className="flex-1 bg-yellow-100 border-4 border-yellow-400 rounded-[2rem] p-8">
                       <div className="text-5xl font-black text-yellow-600">{percentage}%</div>
                       <div className="font-bold text-yellow-500">QUACK SCORE</div>
                     </div>
                  </div>
                  {renderButtons(
                     "flex-1 py-4 bg-white border-4 border-blue-300 rounded-full text-blue-500 font-black uppercase hover:bg-blue-50 transition-colors flex items-center justify-center gap-2",
                     "flex-1 py-4 bg-yellow-400 border-4 border-yellow-500 rounded-full text-white font-black uppercase hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  )}
                </div>
              );
            case 'saidi':
              return (
                <div className="bg-[#fffbeb] border-4 border-[#d97706] p-8 sm:p-12 text-center relative shadow-2xl rounded-xl font-['Amiri'] max-w-4xl mx-auto w-full">
                  <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-[#d97706] opacity-50 rounded-lg pointer-events-none" />
                  <h2 className="text-4xl sm:text-6xl font-bold text-[#92400e] mb-8">النتيجة النهائية</h2>
                  <div className="flex flex-col sm:flex-row gap-8 mb-8 justify-center items-center">
                     <div className="text-center">
                       <div className="text-5xl font-bold text-[#b45309]">{score}</div>
                       <div className="text-xl text-[#d97706]">الإجابات الصحيحة</div>
                     </div>
                     <div className="hidden sm:block w-px h-20 bg-[#d97706] opacity-30" />
                     <div className="text-center">
                       <div className="text-5xl font-bold text-[#b45309]">{percentage}%</div>
                       <div className="text-xl text-[#d97706]">النسبة المئوية</div>
                     </div>
                  </div>
                  {renderButtons(
                     "flex-1 py-3 border-2 border-[#d97706] bg-transparent text-[#92400e] font-bold hover:bg-[#fef3c7] transition-colors flex items-center justify-center gap-2 rounded",
                     "flex-1 py-3 border-2 border-[#d97706] bg-[#d97706] text-white font-bold hover:bg-[#b45309] transition-colors flex items-center justify-center gap-2 rounded"
                  )}
                </div>
              );
            case 'arcane':
              return (
                <div className="bg-[#0f0f13] border border-[#8a2be2] p-8 sm:p-12 text-center relative shadow-[0_0_30px_rgba(138,43,226,0.3)] rounded-lg max-w-4xl mx-auto w-full">
                  <h2 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8a2be2] to-[#00ffff] mb-8 uppercase tracking-widest">Assessment Complete</h2>
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                     <div className="flex-1 bg-black/50 border border-[#8a2be2] p-6 rounded shadow-[inset_0_0_15px_rgba(138,43,226,0.2)]">
                       <div className="text-5xl font-black text-[#00ffff]">{score}</div>
                       <div className="text-xs font-bold text-[#8a2be2] uppercase tracking-widest mt-2">Variables Aligned</div>
                     </div>
                     <div className="flex-1 bg-black/50 border border-[#8a2be2] p-6 rounded shadow-[inset_0_0_15px_rgba(138,43,226,0.2)]">
                       <div className="text-5xl font-black text-[#ff00ff]">{percentage}%</div>
                       <div className="text-xs font-bold text-[#8a2be2] uppercase tracking-widest mt-2">Mutation Rate</div>
                     </div>
                  </div>
                  {renderButtons(
                     "flex-1 py-4 border border-[#00ffff] bg-black/50 text-[#00ffff] font-black uppercase tracking-widest hover:bg-[#00ffff]/10 transition-colors flex items-center justify-center gap-2 rounded",
                     "flex-1 py-4 border border-[#8a2be2] bg-[#8a2be2]/20 text-white font-black uppercase tracking-widest hover:bg-[#8a2be2]/40 shadow-[0_0_15px_rgba(138,43,226,0.5)] transition-colors flex items-center justify-center gap-2 rounded"
                  )}
                </div>
              );
            case 'adventure-time':
              return (
                <div className="bg-white border-4 border-black p-8 sm:p-12 text-center rounded-[2rem] shadow-[8px_8px_0_#000] max-w-4xl mx-auto w-full">
                  <h2 className="text-5xl sm:text-7xl font-black text-[#00A2E8] mb-8 drop-shadow-[2px_2px_0_#000]">ALGEBRAIC!</h2>
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                     <div className="flex-1 bg-[#FFC90E] border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0_#000]">
                       <div className="text-5xl font-black text-black">{score}</div>
                       <div className="font-bold text-black uppercase">Loot</div>
                     </div>
                     <div className="flex-1 bg-[#00A2E8] border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0_#000]">
                       <div className="text-5xl font-black text-white drop-shadow-[2px_2px_0_#000]">{percentage}%</div>
                       <div className="font-bold text-white uppercase drop-shadow-[1px_1px_0_#000]">Hero Level</div>
                     </div>
                  </div>
                  {renderButtons(
                     "flex-1 py-4 bg-white border-4 border-black rounded-xl text-black font-black uppercase hover:-translate-y-1 transition-all shadow-[4px_4px_0_#000] flex items-center justify-center gap-2",
                     "flex-1 py-4 bg-[#FFC90E] border-4 border-black rounded-xl text-black font-black uppercase hover:-translate-y-1 transition-all shadow-[4px_4px_0_#000] flex items-center justify-center gap-2"
                  )}
                </div>
              );
            case 'ultimate':
              return (
                <div className="bg-black/80 backdrop-blur-xl border border-white/20 p-8 sm:p-16 text-center rounded-[3rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] relative overflow-hidden max-w-4xl mx-auto w-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-pink-600/20 animate-pulse-slow" />
                  <h2 className="text-5xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 mb-10 relative z-10">TRANSCENDENCE</h2>
                  <div className="flex flex-col sm:flex-row gap-6 mb-10 relative z-10">
                     <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                       <div className="text-6xl font-black text-white">{score}</div>
                       <div className="text-sm font-bold text-white/50 uppercase tracking-widest mt-2">Nodes Unlocked</div>
                     </div>
                     <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                       <div className="text-6xl font-black text-white">{percentage}%</div>
                       <div className="text-sm font-bold text-white/50 uppercase tracking-widest mt-2">Synchronization</div>
                     </div>
                  </div>
                  {renderButtons(
                     "flex-1 py-4 bg-white/10 border border-white/20 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-md",
                     "flex-1 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl text-white font-black uppercase tracking-widest hover:opacity-90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(217,70,239,0.5)] flex items-center justify-center gap-2"
                  )}
                </div>
              );
            default:
              return (
                <div className="glass-panel p-8 sm:p-12 rounded-[2rem] max-w-2xl w-full text-center space-y-10">
                  <div className="space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Results</h2>
                    <div className="inline-block p-8 bg-indigo-600 text-white rounded-[2rem] shadow-xl animate-pulse-glow">
                      <div className="text-6xl sm:text-7xl font-black">{percentage}%</div>
                      <div className="text-indigo-200 font-bold tracking-widest uppercase text-sm mt-2">{score} / {maxScore} Correct</div>
                    </div>
                  </div>
                  {renderButtons(
                    "flex-1 py-4 px-6 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all",
                    "flex-1 py-4 px-6 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_8px_0_rgb(49,46,129)] hover:shadow-[0_4px_0_rgb(49,46,129)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all"
                  )}
                </div>
              );
          }
        };

        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 animate-scale-in">
            {renderEasterEgg()}
            {renderThemeContent()}
          </div>
        );
      }

      const q = questions[currentIndex];
      const isReview = view === 'review';
      const isAnswered = answers[q.id] !== undefined;
      const showCorrectness = isReview || showFeedback || (localSettings.instantFeedback && (
        (q.type === 'mcq' || q.type === 'true_false') ? isAnswered : !!essayFeedback[q.id]
      ));

      const handleAnswer = (opt, isToggle = false) => {
        if (showCorrectness) return;
        if (isToggle) {
          const currentAnswers = (answers[q.id] || '').split('|').filter(Boolean);
          const newAnswers = currentAnswers.includes(opt)
            ? currentAnswers.filter(a => a !== opt)
            : [...currentAnswers, opt];
          setAnswers({...answers, [q.id]: newAnswers.join('|')});
        } else {
          setAnswers({...answers, [q.id]: opt});
          if (localSettings.instantFeedback && (q.type === 'mcq' || q.type === 'true_false')) {
            setShowFeedback(true);
            const isCorrect = opt === q.correctAnswer;
            setFeedbackStatus(isCorrect ? 'correct' : 'incorrect');
            setTimeout(() => setFeedbackStatus('none'), 1500);
          }
        }
      };

      const handleComplexSubmit = () => {
        if (localSettings.instantFeedback) {
          setShowFeedback(true);
          const q = questions[currentIndex];
          let isCorrect = false;
          if (q.type === 'essay') {
            const feedback = gradeEssay(answers[q.id], q.correctAnswer || '');
            setEssayFeedback({...essayFeedback, [q.id]: feedback});
            isCorrect = feedback.score >= 50;
          } else if (q.type === 'multi_essay') {
            const parsedAnswers = JSON.parse(answers[q.id] || '{}');
            const subFeeds = {};
            let tScore = 0;
            (q.subQuestions || []).forEach(sq => {
              const fb = gradeEssay(parsedAnswers[sq.id] || '', sq.correctAnswer || '');
              subFeeds[sq.id] = fb;
              tScore += fb.score;
            });
            const avg = (q.subQuestions && q.subQuestions.length > 0) ? tScore / q.subQuestions.length : 0;
            const feedback = { score: avg, subFeedbacks: subFeeds, feedback: 'Graded per question' };
            setEssayFeedback({...essayFeedback, [q.id]: feedback});
            isCorrect = avg >= 50;
          } else {
            isCorrect = isQuestionCorrect(q, answers[q.id], null);
            setEssayFeedback({...essayFeedback, [q.id]: { score: isCorrect ? 100 : 0, feedback: '' }});
          }
          setFeedbackStatus(isCorrect ? 'correct' : 'incorrect');
          setTimeout(() => setFeedbackStatus('none'), 1500);
        }
      };

      const handleNext = () => {
        setDirection('right');
        setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1));
        setShowFeedback(false);
      };

      const handlePrev = () => {
        setDirection('left');
        setCurrentIndex(Math.max(0, currentIndex - 1));
        setShowFeedback(false);
      };

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
          <FeedbackEffects status={feedbackStatus} theme={THEME} />
          <FeedbackNotification status={feedbackStatus} />
          <div className={\`w-full max-w-3xl space-y-6 \${direction === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}\`} key={currentIndex + (isReview ? '-review' : '')}>
            
            <div className="glass-panel p-6 sm:p-10 rounded-[2rem] w-full space-y-8 relative overflow-hidden">
              {isReview && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 rounded-bl-2xl font-black text-xs uppercase tracking-widest shadow-md">
                  Review Mode
                </div>
              )}

              {view === 'exam' && localSettings.timeLimit > 0 && timeLeft !== null && (
                <div className="flex justify-center items-center text-xs sm:text-sm font-black text-slate-500 uppercase tracking-widest">
                  <span className={\`px-3 py-1 rounded-lg \${timeLeft < 60 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}\`}>
                    ⏱ {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              
              {q.imageUrl && q.type !== 'locate_on_image' && (
                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-slate-800 animate-scale-in bg-slate-50 dark:bg-slate-900/50 mb-8" style={{ animationDelay: '0.1s' }}>
                  <img src={q.imageUrl} className="w-full max-h-[70vh] object-contain" alt="Question visual" />
                </div>
              )}
              
              <div className="flex justify-between items-start gap-4">
                {q.type !== 'fill_in_blanks' && (
                  <h3 
                    className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight markdown-content flex-1"
                    dangerouslySetInnerHTML={renderMarkdown(q.question, showCorrectness)}
                  />
                )}
                <button
                  onClick={() => setFlaggedQuestions({...flaggedQuestions, [q.id]: !flaggedQuestions[q.id]})}
                  className={"shrink-0 p-2 rounded-xl transition-colors " + (flaggedQuestions[q.id] ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700")}
                  title={flaggedQuestions[q.id] ? "Unflag question" : "Flag question"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={flaggedQuestions[q.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {(q.type === 'mcq' || q.type === 'true_false' || q.type === 'multi_select') && (
                  <div className="space-y-3 sm:space-y-4">
                    {(q.type === 'mcq' || q.type === 'multi_select' ? q.options : ['True', 'False']).map((opt, idx) => {
                      const isSelected = q.type === 'multi_select'
                        ? (answers[q.id] || '').split('|').includes(opt)
                        : answers[q.id] === opt;
                      const isCorrect = q.type === 'multi_select'
                        ? (q.correctAnswers || []).includes(opt)
                        : q.correctAnswer === opt;
                      
                      let btnClass = "w-full p-4 sm:p-5 text-left rounded-2xl border-2 transition-all font-bold text-base sm:text-lg flex justify-between items-center group animate-slide-in-right ";
                      
                      if (showCorrectness) {
                        if (isCorrect) {
                          btnClass += "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 animate-pop";
                        } else if (isSelected && !isCorrect) {
                          btnClass += "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 animate-shake";
                        } else {
                          btnClass += "border-slate-200 dark:border-slate-800 opacity-50";
                        }
                      } else {
                        if (isSelected) {
                          btnClass += "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-md scale-[1.02]";
                        } else {
                          btnClass += "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:-translate-y-1 hover:shadow-lg";
                        }
                      }

                      return (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt, q.type === 'multi_select')}
                          disabled={showCorrectness}
                          className={btnClass}
                          style={{ animationDelay: \`\${idx * 0.1}s\` }}
                        >
                          <div className="flex items-center gap-3">
                            {q.type === 'multi_select' && (
                              <div className={\`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors \${isSelected || (showCorrectness && isCorrect) ? 'border-current bg-transparent' : 'border-slate-400 dark:border-slate-500'}\`}>
                                {(isSelected || (showCorrectness && isCorrect)) && <CheckIcon />}
                              </div>
                            )}
                            <span className="markdown-content" dangerouslySetInnerHTML={renderMarkdown(opt, showCorrectness)} />
                          </div>
                          {showCorrectness && isCorrect && <span className="text-emerald-500 animate-pop"><CheckIcon /></span>}
                          {showCorrectness && isSelected && !isCorrect && <span className="text-red-500 animate-pop"><XIcon /></span>}
                        </button>
                      );
                    })}
                    {q.type === 'multi_select' && localSettings.instantFeedback && !showFeedback && !isReview && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleComplexSubmit()}
                          disabled={!answers[q.id]}
                          className="px-6 py-3 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-[0_4px_0_rgb(49,46,129)] hover:shadow-[0_2px_0_rgb(49,46,129)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all disabled:opacity-50"
                        >
                          Submit Answer
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {q.type === 'fill_in_blanks' && (
                  <div className="space-y-6">
                    <div className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800" style={{ lineHeight: '3rem' }}>
                      {q.question.split('__________').map((part, i, arr) => {
                        const currentAnswers = (answers[q.id] || '').split('|');
                        const currentWord = currentAnswers[i] || '';
                        return (
                        <React.Fragment key={i}>
                          <span dangerouslySetInnerHTML={renderMarkdown(part, showCorrectness)} />
                          {i < arr.length - 1 && (
                            <span 
                              className={\`inline-flex items-center justify-center min-w-[100px] h-10 px-4 mx-2 align-middle rounded-xl border-b-4 transition-all cursor-pointer \${
                                showCorrectness
                                  ? isFuzzyMatch(currentWord, (q.blanks || [])[i])
                                    ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                                    : 'bg-rose-100 border-rose-500 text-rose-800'
                                  : currentWord
                                    ? 'bg-indigo-100 border-indigo-400 text-indigo-800 hover:bg-rose-100 hover:border-rose-400 hover:text-rose-800'
                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 border-dashed hover:border-indigo-400'
                              }\`}
                              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/30'); }}
                              onDragLeave={(e) => { e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/30'); }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/30');
                                if (showCorrectness) return;
                                const word = e.dataTransfer.getData('text/plain');
                                if (word) {
                                  const newAnswers = [...currentAnswers];
                                  while (newAnswers.length < arr.length - 1) newAnswers.push('');
                                  newAnswers[i] = word;
                                  setAnswers({...answers, [q.id]: newAnswers.join('|')});
                                }
                              }}
                              onClick={() => {
                                if (showCorrectness || !currentWord) return;
                                const newAnswers = [...currentAnswers];
                                newAnswers[i] = '';
                                setAnswers({...answers, [q.id]: newAnswers.join('|')});
                              }}
                            >
                              {currentWord || <span className="text-transparent">blank</span>}
                            </span>
                          )}
                          {showCorrectness && i < arr.length - 1 && !isFuzzyMatch(currentWord, (q.blanks || [])[i]) && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1 text-sm bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                              {(q.blanks || [])[i]}
                            </span>
                          )}
                        </React.Fragment>
                      )})}
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 min-h-[5rem]">
                      {(q.wordBank || []).map((word, wIdx) => {
                        const currentAnswers = (answers[q.id] || '').split('|');
                        const usedCount = currentAnswers.filter(a => a === word).length;
                        const totalCount = (q.wordBank || []).filter(w => w === word).length;
                        const isUsed = usedCount >= totalCount;

                        if (isUsed && !showCorrectness) return null;

                        return (
                          <div
                            key={\`\${word}-\${wIdx}\`}
                            draggable={!showCorrectness}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', word);
                              e.currentTarget.classList.add('opacity-50', 'scale-95');
                            }}
                            onDragEnd={(e) => {
                              e.currentTarget.classList.remove('opacity-50', 'scale-95');
                            }}
                            onClick={() => {
                              if (showCorrectness) return;
                              const blanksCount = (q.question.match(/__________/g) || []).length;
                              const newAnswers = [...currentAnswers];
                              while (newAnswers.length < blanksCount) newAnswers.push('');
                              const firstEmptyIdx = newAnswers.findIndex(a => !a);
                              if (firstEmptyIdx !== -1) {
                                newAnswers[firstEmptyIdx] = word;
                                setAnswers({...answers, [q.id]: newAnswers.join('|')});
                              }
                            }}
                            className={\`px-4 py-2 rounded-xl border-2 transition-all font-bold text-sm sm:text-base shadow-sm \${
                              showCorrectness
                                ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5'
                            }\`}
                          >
                            {word}
                          </div>
                        );
                      })}
                    </div>

                    {localSettings.instantFeedback && !showFeedback && !isReview && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleComplexSubmit()}
                          disabled={(answers[q.id] || '').split('|').filter(Boolean).length < (q.blanks || []).length}
                          className="px-6 py-3 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-[0_4px_0_rgb(49,46,129)] hover:shadow-[0_2px_0_rgb(49,46,129)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all disabled:opacity-50"
                        >
                          Submit Answer
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {q.type === 'matching' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-500 uppercase text-xs">Items</h4>
                        {(q.matchingPairs || []).map((pair, i) => {
                          const currentAnswers = (answers[q.id] || '').split('|').filter(Boolean);
                          const currentMatch = currentAnswers.find(a => a.startsWith(\`\${pair.term}:\`))?.split(':')[1] || '';
                          
                          return (
                            <div key={i} className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">{pair.term}</div>
                              <div 
                                className={\`min-h-[3.5rem] p-3 rounded-xl border-2 transition-all flex items-center justify-center text-center text-sm shadow-inner \${
                                  showCorrectness
                                    ? currentMatch === pair.definition
                                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-emerald-500/20 border-solid'
                                      : 'bg-rose-50 border-rose-500 text-rose-800 shadow-rose-500/20 border-solid'
                                    : currentMatch
                                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 cursor-pointer hover:bg-rose-50 hover:border-rose-400 hover:text-rose-700 border-solid shadow-sm'
                                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-400 border-dashed'
                                }\`}
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-400', 'bg-indigo-50/50'); }}
                                onDragLeave={(e) => { e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50/50'); }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50/50');
                                  if (showCorrectness) return;
                                  const definition = e.dataTransfer.getData('text/plain');
                                  if (definition) {
                                    let newAnswers = currentAnswers.filter(a => !a.startsWith(\`\${pair.term}:\`) && !a.endsWith(\`:\${definition}\`));
                                    newAnswers.push(\`\${pair.term}:\${definition}\`);
                                    setAnswers({...answers, [q.id]: newAnswers.join('|')});
                                  }
                                }}
                                onClick={() => {
                                  if (showCorrectness || !currentMatch) return;
                                  let newAnswers = currentAnswers.filter(a => !a.startsWith(\`\${pair.term}:\`));
                                  setAnswers({...answers, [q.id]: newAnswers.join('|')});
                                }}
                                title={currentMatch && !showCorrectness ? "Click to remove" : ""}
                              >
                                {currentMatch ? (
                                  <div className="flex items-center gap-2 font-medium">
                                    {currentMatch}
                                    {!showCorrectness && <XIcon />}
                                  </div>
                                ) : 'Drop match here'}
                              </div>
                              {showCorrectness && currentMatch !== pair.definition && (
                                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md mt-1">
                                  Correct: {pair.definition}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-500 uppercase text-xs">Matches</h4>
                        <div className="flex flex-col gap-3">
                          {[...(q.matchingPairs || []).map(p => p.definition), ...(q.matchingDistractors || [])]
                            .sort()
                            .map((def, i) => {
                              const currentAnswers = (answers[q.id] || '').split('|').filter(Boolean);
                              const isUsed = currentAnswers.some(a => a.endsWith(\`:\${def}\`));
                              
                              if (isUsed && !showCorrectness) return null;
                              
                              return (
                                <div
                                  key={\`\${def}-\${i}\`}
                                  draggable={!showCorrectness}
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', def);
                                    e.currentTarget.classList.add('opacity-50', 'scale-95');
                                  }}
                                  onDragEnd={(e) => {
                                    e.currentTarget.classList.remove('opacity-50', 'scale-95');
                                  }}
                                  className={\`p-3 sm:p-4 rounded-xl border-2 transition-all font-medium text-sm sm:text-base flex items-center gap-3 shadow-sm \${
                                    showCorrectness
                                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5'
                                  }\`}
                                >
                                  {!showCorrectness && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 shrink-0"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>}
                                  {def}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                    {localSettings.instantFeedback && !showFeedback && !isReview && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleComplexSubmit()}
                          disabled={(answers[q.id] || '').split('|').filter(Boolean).length < (q.matchingPairs || []).length}
                          className="px-6 py-3 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-[0_4px_0_rgb(49,46,129)] hover:shadow-[0_2px_0_rgb(49,46,129)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all disabled:opacity-50"
                        >
                          Submit Answer
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {q.type === 'locate_on_image' && (
                  <div className="space-y-6">
                    <div className="relative w-full rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-900 group">
                      <img src={q.imageUrl} className="w-full h-auto block select-none pointer-events-none" />
                      
                      {/* Render existing targets */}
                      {(() => {
                        let selected = [];
                        try {
                          selected = JSON.parse(answers[q.id] || '[]');
                        } catch (e) {}

                        return (
                          <>
                            {/* Render correct targets if feedback is visible */}
                            {showCorrectness && (q.imageTargets || []).map((target, idx) => (
                              <div 
                                key={\`correct-\${target.id}\`}
                                className={\`absolute border-4 border-dashed rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 border-emerald-500/60 bg-emerald-500/10\`}
                                style={{ left: \`\${target.x}%\`, top: \`\${target.y}%\`, width: \`\${target.radius * 2}%\`, height: \`\${target.radius * 2}%\`, minWidth: '30px', minHeight: '30px' }}
                              >
                                <div className={\`absolute -bottom-8 px-2 py-0.5 text-white text-[10px] font-black rounded-lg shadow-lg whitespace-nowrap bg-emerald-600\`}>
                                  {target.label}
                                </div>
                              </div>
                            ))}

                            {/* Render user selected points */}
                            {selected.map((sel, idx) => {
                              const target = (q.imageTargets || []).find(t => t.id === sel.targetId);
                              const isCorrectPoint = target && Math.sqrt(Math.pow(sel.x - target.x, 2) + Math.pow(sel.y - target.y, 2)) <= target.radius;
                              
                              return (
                                <div 
                                  key={\`sel-\${idx}\`}
                                  className={\`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center shadow-xl z-20 transition-colors \${
                                    showCorrectness 
                                      ? isCorrectPoint ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30' : 'bg-rose-500 text-white ring-4 ring-rose-500/30'
                                      : 'bg-indigo-600 text-white cursor-pointer ring-4 ring-indigo-500/30 hover:bg-indigo-700'
                                  }\`}
                                  style={{ left: \`\${sel.x}%\`, top: \`\${sel.y}%\` }}
                                  onClick={(e) => {
                                    if (showCorrectness) return;
                                    e.stopPropagation();
                                    const newSelected = selected.filter((_, i) => i !== idx);
                                    handleAnswer(JSON.stringify(newSelected), false);
                                  }}
                                >
                                  <span className="text-xs font-black">{idx + 1}</span>
                                </div>
                              );
                            })}
                          </>
                        );
                      })()}

                      {/* Click area for adding points */}
                      {!showCorrectness && (
                        <div 
                          className="absolute inset-0 cursor-crosshair"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = ((e.clientX - rect.left) / rect.width) * 100;
                            const y = ((e.clientY - rect.top) / rect.height) * 100;
                            
                            let selected = [];
                            try {
                              selected = JSON.parse(answers[q.id] || '[]');
                            } catch (e) {}

                            const targets = q.imageTargets || [];
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
                        {(q.imageTargets || []).map((target, idx) => {
                          let selected = [];
                          try {
                            selected = JSON.parse(answers[q.id] || '[]');
                          } catch (e) {}
                          
                          const isPlaced = selected.length > idx;
                          const isCurrent = selected.length === idx;

                          return (
                            <div 
                              key={\`legend-\${target.id}\`}
                              className={\`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-3 transition-all shadow-sm \${
                                isPlaced 
                                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-100 dark:border-emerald-800' 
                                  : isCurrent && !showCorrectness
                                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-slate-100 dark:border-slate-700'
                              }\`}
                            >
                              <span className={\`w-5 h-5 rounded-full flex items-center justify-center text-[10px] \${
                                isPlaced ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                              }\`}>
                                {idx + 1}
                              </span>
                              {target.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {localSettings.instantFeedback && !showFeedback && !isReview && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleComplexSubmit()}
                          disabled={JSON.parse(answers[q.id] || '[]').length < (q.imageTargets || []).length}
                          className="px-6 py-3 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-[0_4px_0_rgb(49,46,129)] hover:shadow-[0_2px_0_rgb(49,46,129)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all disabled:opacity-50"
                        >
                          Submit Answer
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {q.type === 'multi_essay' && (
                  <div className="space-y-6">
                    {(q.subQuestions || []).map(sq => {
                      const storedValue = answers[q.id] || '{}';
                      let parsedValues = {};
                      try {
                        parsedValues = JSON.parse(storedValue);
                      } catch(e) {}
                      const val = parsedValues[sq.id] || '';
                      const fb = essayFeedback[q.id]?.subFeedbacks?.[sq.id];

                      return (
                        <div key={sq.id} className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 first:border-0 first:pt-0">
                          <label className="block text-[14px] font-bold text-slate-800 dark:text-slate-200">
                             {sq.question}
                          </label>
                          <textarea
                            value={val}
                            onChange={(e) => {
                              if (!isReview) {
                                const newVals = { ...parsedValues, [sq.id]: e.target.value };
                                setAnswers({...answers, [q.id]: JSON.stringify(newVals)});
                              }
                            }}
                            disabled={isReview || (showCorrectness && essayFeedback[q.id])}
                            className={\`w-full p-5 rounded-2xl border-2 transition-all font-medium text-base sm:text-lg h-32 resize-y \${isReview || (showCorrectness && fb) ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'}\`}
                            placeholder={isReview ? "No answer provided." : "Type your detailed answer here..."}
                          />

                          {showCorrectness && fb && (
                            <div className="flex flex-col gap-2 animate-fade-in-up mt-2 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                              <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-indigo-400 dark:text-indigo-500">Grade: </span>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{fb.grade}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-black uppercase text-indigo-400 dark:text-indigo-500">Score: </span>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{fb.score}%</span>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 p-2 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg">{fb.feedback}</p>
                              
                              <div className="mt-2 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900 border-l-4 border-l-emerald-500">
                                <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 mb-1 tracking-widest">Suggested Content</p>
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 whitespace-pre-wrap">{sq.correctAnswer || 'No specific correct answer logged'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {!isReview && localSettings.instantFeedback && !essayFeedback[q.id] && (
                      <div className="flex justify-end mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => {
                            const parsedAnswers = JSON.parse(answers[q.id] || '{}');
                            const subFeeds = {};
                            let tScore = 0;
                            (q.subQuestions || []).forEach(sq => {
                              const fb = gradeEssay(parsedAnswers[sq.id] || '', sq.correctAnswer || '');
                              subFeeds[sq.id] = fb;
                              tScore += fb.score;
                            });
                            const avg = (q.subQuestions && q.subQuestions.length > 0) ? tScore / q.subQuestions.length : 0;
                            setEssayFeedback({...essayFeedback, [q.id]: { score: avg, subFeedbacks: subFeeds, feedback: 'Graded per question' }});
                            setShowFeedback(true);
                          }}
                          disabled={!answers[q.id]}
                          className="px-6 py-3 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-[0_4px_0_rgb(49,46,129)] hover:shadow-[0_2px_0_rgb(49,46,129)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all disabled:opacity-50"
                        >
                          Submit for Grading
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {q.type === 'essay' && (
                  <div className="space-y-2">
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => !isReview && setAnswers({...answers, [q.id]: e.target.value})}
                      disabled={isReview || (showCorrectness && essayFeedback[q.id])}
                      className={\`w-full p-5 rounded-2xl border-2 transition-all font-medium text-base sm:text-lg min-h-[200px] resize-y \${isReview || (showCorrectness && essayFeedback[q.id]) ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'}\`}
                      placeholder={isReview ? "No answer provided." : "Type your detailed answer here..."}
                    />
                    
                    {!isReview && localSettings.instantFeedback && !essayFeedback[q.id] && (
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => {
                            if (answers[q.id]) {
                              setEssayFeedback({...essayFeedback, [q.id]: gradeEssay(answers[q.id], q.correctAnswer || '')});
                              setShowFeedback(true);
                            }
                          }}
                          disabled={!answers[q.id]}
                          className="px-6 py-3 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-[0_4px_0_rgb(49,46,129)] hover:shadow-[0_2px_0_rgb(49,46,129)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all disabled:opacity-50"
                        >
                          Submit for Grading
                        </button>
                      </div>
                    )}

                    {showCorrectness && essayFeedback[q.id] && (
                      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 rounded-2xl mt-4 space-y-4 animate-fade-in-up">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex-1 min-w-[120px] bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                            <p className="text-[10px] font-black uppercase text-indigo-400 dark:text-indigo-500 tracking-widest">Essay Grade</p>
                            <h4 className="text-2xl font-black italic text-indigo-600 dark:text-indigo-400">{essayFeedback[q.id].grade}</h4>
                          </div>
                          <div className="flex-1 min-w-[120px] bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                            <p className="text-[10px] font-black uppercase text-indigo-400 dark:text-indigo-500 tracking-widest">Score</p>
                            <h4 className="text-2xl font-black italic text-indigo-600 dark:text-indigo-400">{essayFeedback[q.id].score}%</h4>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                          {essayFeedback[q.id].feedback}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                          <div>
                            <h5 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-2">Key Terms Used</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {essayFeedback[q.id].usedTerms.map((term, i) => (
                                <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-[10px] font-bold uppercase">{term}</span>
                              ))}
                              {essayFeedback[q.id].usedTerms.length === 0 && <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">None detected</span>}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-2">Missing Terms</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {essayFeedback[q.id].missingTerms.map((term, i) => (
                                <span key={i} className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-[10px] font-bold uppercase">{term}</span>
                              ))}
                              {essayFeedback[q.id].missingTerms.length === 0 && <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">None missing</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isReview && q.correctAnswer && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl mt-4">
                        <h4 className="text-emerald-800 dark:text-emerald-400 font-bold text-sm mb-2 uppercase tracking-wider">Reference Answer</h4>
                        <div className="text-emerald-700 dark:text-emerald-300 text-sm whitespace-pre-wrap markdown-content" dangerouslySetInnerHTML={renderMarkdown(q.correctAnswer, true)} />
                      </div>
                    )}
                  </div>
                )}
                
                {showCorrectness && q.explanation && (
                  <div className="mt-6 animate-fade-in-up">
                    <button 
                      onClick={() => setShowExplanationMap({...showExplanationMap, [q.id]: !showExplanationMap[q.id]})}
                      className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {showExplanationMap[q.id] ? (
                          <><path d="m18 15-6-6-6 6"/></>
                        ) : (
                          <><path d="m6 9 6 6 6-6"/></>
                        )}
                      </svg>
                      {showExplanationMap[q.id] ? 'Hide Explanation' : 'Show Explanation'}
                    </button>
                    
                    {showExplanationMap[q.id] && (
                      <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl mt-3 animate-fade-in-up">
                        <h4 className="text-indigo-800 dark:text-indigo-400 font-black text-sm mb-2 uppercase tracking-wider flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                          Explanation
                        </h4>
                        <div className="text-indigo-700 dark:text-indigo-300 text-sm sm:text-base leading-relaxed markdown-content" dangerouslySetInnerHTML={renderMarkdown(q.explanation, true)} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm disabled:opacity-30 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  Prev
                </button>
                               {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={isReview ? () => setView('results') : handleFinish}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/30"
                  >
                    {isReview ? 'Back to Results' : 'Finish Exam'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Question Map */}
            <div className="glass-panel p-4 sm:p-6 rounded-[2rem] w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <button 
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="w-full flex items-center justify-between text-sm font-black uppercase tracking-widest mb-0 group question-map-toggle"
              >
                <span>Question Map</span>
                <span className={\`transition-transform duration-300 \${isMapExpanded ? 'rotate-180' : ''}\`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </span>
              </button>
              
              {isMapExpanded && (
                <div className="flex flex-col gap-4 mt-4 animate-fade-in-up">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search questions..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none"
                    />
                    <svg className="absolute left-3 top-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                  
                  {searchQuery.trim() ? (
                    <div className="flex flex-col gap-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                      {filteredQuestionsMap.length > 0 ? (
                        filteredQuestionsMap.map((originalIdx) => {
                          const qItem = questions[originalIdx];
                          return (
                            <button
                              key={originalIdx}
                              onClick={() => {
                                setDirection(originalIdx > currentIndex ? 'right' : 'left');
                                setCurrentIndex(originalIdx); 
                                setShowFeedback(false);
                                setIsMapExpanded(false);
                              }}
                              className="text-left p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors shadow-sm"
                            >
                              <div className="font-bold text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">Question {originalIdx + 1}</div>
                              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-3 markdown-content" dangerouslySetInnerHTML={renderMarkdown(qItem.question)} />
                            </button>
                          )
                        })
                      ) : (
                        <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-sm font-medium">No matching questions found.</div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                      {questions.map((qItem, idx) => {
                        const isCurrent = idx === currentIndex;
                        const hasAnswer = answers[qItem.id] !== undefined && answers[qItem.id] !== '';
                        const isCorrect = isQuestionCorrect(qItem, answers[qItem.id], essayFeedback[qItem.id]);
                        const isSubmitted = (qItem.type === 'mcq' || qItem.type === 'true_false') ? hasAnswer : !!essayFeedback[qItem.id];
                        
                        let btnClass = "w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all border-2 ";
                        
                        if (isReview || (localSettings.instantFeedback && isSubmitted)) {
                          if (isSubmitted) {
                            if (isCorrect) {
                              btnClass += "bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
                            } else {
                              btnClass += "bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400";
                            }
                          } else {
                            btnClass += "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700";
                          }
                        } else {
                          if (hasAnswer) {
                            btnClass += "bg-indigo-600 border-indigo-600 text-white shadow-md";
                          } else {
                            btnClass += "bg-white border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600";
                          }
                        }
  
                        if (isCurrent) {
                          btnClass += " ring-4 ring-indigo-500/30 scale-110 z-10 animate-pulse-glow";
                        } else {
                          btnClass += " hover:scale-105";
                        }
  
                        return (
                          <button
                            key={idx}
                            onClick={() => { 
                              setDirection(idx > currentIndex ? 'right' : 'left');
                              setCurrentIndex(idx); 
                              setShowFeedback(false); 
                            }}
                            className={btnClass + " relative"}
                            title={\`Go to question \${idx + 1}\`}
                          >
                            {idx + 1}
                            {flaggedQuestions[qItem.id] && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {activeTerm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <div 
                  className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm modal-overlay-enter"
                  onClick={() => setActiveTerm(null)}
                />
                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden modal-content-enter relative z-10">
                  <div className="p-8 sm:p-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Glossary Term</span>
                      </div>
                      <button 
                        onClick={() => setActiveTerm(null)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">{activeTerm.word}</h4>
                      <div className="h-1 w-12 bg-indigo-500 rounded-full" />
                      <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                        {activeTerm.title}
                      </p>
                    </div>

                    <button 
                      onClick={() => setActiveTerm(null)}
                      className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }


    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`;

  return html;
};

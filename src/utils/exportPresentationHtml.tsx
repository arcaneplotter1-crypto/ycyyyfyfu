import React from 'react';
import { PresentationData } from '../presentationTypes';
import { renderToStaticMarkup } from 'react-dom/server.browser';
import { SlideRenderer } from '../components/presentation/SlideRenderer';
import tailwindCode from '../../node_modules/@tailwindcss/browser/dist/index.global.js?raw';

export const generateStandalonePresentation = (presentation: PresentationData): string => {
  const slidesHtml = presentation.slides.map((slide, index) => {
    return `
      <div class="internal-slide-wrapper" id="slide-${index}" style="display: ${index === 0 ? 'block' : 'none'}; width: 100vw; height: 100vh; overflow: hidden; position: absolute; top: 0; left: 0; background: #fafafa;">
        <div class="slide-scaler" style="width: 1280px; height: 720px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); transform-origin: center center;">
          ${renderToStaticMarkup(<SlideRenderer slide={slide} settings={{...slide.settings, disableAnimations: true}} />)}
        </div>
      </div>
    `;
  }).join('\\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${presentation.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
  
  <script>${tailwindCode}</script>
  <style type="text/tailwindcss">
    @theme {
      --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
      --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
      --font-serif: "Cormorant Garamond", "Cinzel", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    }
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #fafafa;
    }
    
    /* Override framer motion initial states in exported static HTML */
    [style*="opacity: 0"], [style*="opacity:0"] { opacity: 1 !important; }
    [style*="width: 0"], [style*="width:0;"] { width: 100% !important; }
    [style*="translateY(30px)"], [style*="translateY(20px)"], [style*="scale(0.9)"] { transform: none !important; }

    /* Navigation buttons */
    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      color: #333;
      transition: all 0.2s;
    }
    .nav-btn:hover {
      background: white;
      transform: translateY(-50%) scale(1.05);
    }
    .nav-left { left: 24px; padding-left: 10px; }
    .nav-right { right: 24px; padding-left: 12px; }
  </style>
</head>
<body>
  ${slidesHtml}

  <button class="nav-btn nav-left" onclick="showSlide(currentIndex - 1)" aria-label="Previous slide">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  </button>
  <button class="nav-btn nav-right" onclick="showSlide(currentIndex + 1)" aria-label="Next slide">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  </button>

  <script>
    let currentIndex = 0;
    const totalSlides = ${presentation.slides.length};

    function showSlide(index) {
      if (index < 0 || index >= totalSlides) return;
      document.getElementById('slide-' + currentIndex).style.display = 'none';
      currentIndex = index;
      document.getElementById('slide-' + currentIndex).style.display = 'block';
      updateNavButtons();
    }

    function updateNavButtons() {
      const leftBtn = document.querySelector('.nav-left');
      const rightBtn = document.querySelector('.nav-right');
      if (leftBtn) leftBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
      if (rightBtn) rightBtn.style.display = currentIndex === totalSlides - 1 ? 'none' : 'flex';
    }
    updateNavButtons();

    function scaleSlides() {
      const scalers = document.querySelectorAll('.slide-scaler');
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      const scaleX = w / 1280;
      const scaleY = h / 720;
      const scale = Math.min(scaleX, scaleY);
      
      scalers.forEach(el => {
        el.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
      });
    }

    window.addEventListener('resize', scaleSlides);
    scaleSlides();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        showSlide(currentIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        showSlide(currentIndex - 1);
      } else if (e.key === 'f') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    });

    document.addEventListener('mousedown', (e) => {
      // Allow clicking on links without advancing slide
      if(e.target.closest('a') || e.target.closest('button')) return;
      showSlide(currentIndex + 1);
    });

    let touchstartX = 0;
    let touchendX = 0;

    document.addEventListener('touchstart', e => {
      touchstartX = e.changedTouches[0].screenX;
    }, {passive: true});

    document.addEventListener('touchend', e => {
      touchendX = e.changedTouches[0].screenX;
      if (touchendX < touchstartX - 50) showSlide(currentIndex + 1);
      if (touchendX > touchstartX + 50) showSlide(currentIndex - 1);
    }, {passive: true});
  </script>
</body>
</html>`;
};

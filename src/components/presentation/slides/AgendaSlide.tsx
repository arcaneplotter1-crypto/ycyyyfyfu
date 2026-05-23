import React from 'react';
import { motion } from 'motion/react';
import { AgendaSlideData, SlideStyleSettings } from '../../../presentationTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Play } from 'lucide-react';
import { SlideBackground } from './SlideBackground';

export const AgendaSlide: React.FC<{ slide: AgendaSlideData, settings?: SlideStyleSettings }> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const itemCount = slide.items.length;
  
  const layout = currentSettings.bulletsLayout || 'list';
  const columns = currentSettings.gridColumns || currentSettings.bulletsColumns || (itemCount <= 4 ? 1 : itemCount <= 8 ? 2 : 3);
  const spacing = currentSettings.bulletSpacing || currentSettings.itemSpacing || 24;
  const uiScale = (currentSettings.uiSize || 100) / 100;

  const getColsClass = (cols: number) => {
    switch (cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-3';
      case 4: return 'grid-cols-2 lg:grid-cols-4';
      case 5: return 'grid-cols-2 lg:grid-cols-5';
      case 6: return 'grid-cols-2 lg:grid-cols-6';
      default: return 'grid-cols-1 md:grid-cols-2';
    }
  };

  const getLayoutClasses = () => {
    if (layout === 'columns') return `grid ${getColsClass(columns)} gap-x-12 gap-y-0`;
    if (layout === 'grid') return `grid ${getColsClass(columns)} gap-x-8 gap-y-8`;
    if (layout === 'split') return `grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full`;
    return `grid ${getColsClass(columns)}`;
  };

  const textSize = itemCount <= 4 ? 'text-3xl' : 
                   itemCount <= 8 ? 'text-xl' : 
                   'text-lg';

  const containerPadding = itemCount <= 4 ? 'py-10' : 'py-5';

  const titleAlignmentClass = currentSettings.titleAlignment === 'left' ? 'items-start text-left' : 
                             currentSettings.titleAlignment === 'right' ? 'items-end text-right' : 
                             'items-center text-center';
                             
  const contentAlignmentClass = currentSettings.contentAlignment === 'left' ? 'items-start text-left' : 
                               currentSettings.contentAlignment === 'right' ? 'items-end text-right' : 
                               'items-center text-center';

  if (layout === 'split') {
    return (
      <div className={`flex flex-col justify-center w-full h-full max-w-7xl mx-auto px-10 relative overflow-hidden`}>
        <SlideBackground type="bullets" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center h-full py-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col ${titleAlignmentClass} ${currentSettings.titleAlignment === 'right' ? 'border-r-[12px] pr-10' : 'border-l-[12px] pl-10'}`}
            style={{ borderColor: 'var(--accent-color, #4f46e5)' }}
          >
            <span className="font-black tracking-[0.5em] uppercase text-[10px] mb-2 block" style={{ color: 'var(--accent-color, #4f46e5)' }}>Agenda</span>
            <h2 
              className={`font-[900] text-slate-900 tracking-tight leading-none markdown-inline`}
              style={{ 
                fontSize: `${(currentSettings.titleSize || 100) * 0.01 * 3.5}rem`,
                textAlign: currentSettings.titleAlignment || 'left',
                letterSpacing: `${(currentSettings.titleLetterSpacing || -0.05)}em`,
                lineHeight: currentSettings.titleLineHeight || 1.1
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{slide.title}</ReactMarkdown>
            </h2>
          </motion.div>

          <div className="flex flex-col gap-4 overflow-y-auto scrollbar-none max-h-full pr-4">
            {slide.items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
                className={`flex items-center rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg border border-slate-100 p-6 gap-6 transition-all hover:-translate-x-2`}
              >
                <div 
                   className={`rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shrink-0 transition-all shadow-md`}
                   style={{
                     width: `${40 * uiScale}px`,
                     height: `${40 * uiScale}px`,
                     fontSize: `${1 * uiScale}rem`,
                     backgroundColor: 'var(--accent-color, #4f46e5)'
                   }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div 
                  className="text-slate-700 font-semibold tracking-tight self-center markdown-inline"
                  style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 1.25}rem` }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{item}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col justify-center w-full h-full max-w-6xl mx-auto px-10 relative overflow-hidden ${contentAlignmentClass}`}>
      <SlideBackground type="bullets" />
      <div className="relative z-10 flex flex-col h-full py-8">
        <motion.div
  initial={{ opacity: 0, x: -40 }}
  animate={{ opacity: 1, x: 0 }}
  className={`shrink-0 mb-6 w-full flex flex-col ${titleAlignmentClass} ${currentSettings.titleAlignment === 'right' ? 'border-r-[12px] pr-10' : 'border-l-[12px] pl-10'}`}
  style={{ 
    textAlign: currentSettings.titleAlignment || 'left',
    borderColor: 'var(--accent-color, #4f46e5)'
  }}
>
          <span className="font-black tracking-[0.5em] uppercase text-[10px] mb-2 block" style={{ color: 'var(--accent-color, #4f46e5)' }}>Agenda</span>
          <h2 
            className={`font-[900] text-slate-900 capitalize tracking-tight leading-none markdown-inline`}
            style={{
              fontSize: `${(currentSettings.titleSize || 100) * 0.01 * (itemCount <= 4 ? 3 : 2.5)}rem`,
              textAlign: currentSettings.titleAlignment || 'left',
              letterSpacing: `${(currentSettings.titleLetterSpacing || -0.02)}em`,
              lineHeight: currentSettings.titleLineHeight || 1.1
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{slide.title}</ReactMarkdown>
          </h2>
        </motion.div>
        
        <div className="flex-1 min-h-0 w-full overflow-y-auto scrollbar-none py-4">
          <div 
            className={`${getLayoutClasses()} w-full max-w-5xl mx-auto`}
            style={{ gap: layout === 'list' ? `${spacing/2}px` : undefined }}
          >
            {slide.items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (idx * 0.1), duration: 0.6 }}
                className={`flex items-center group rounded-2xl transition-all cursor-default ${currentSettings.contentAlignment === 'center' ? 'flex-col text-center' : currentSettings.contentAlignment === 'right' ? 'flex-row-reverse text-right' : 'flex-row text-left'} ${currentSettings.showDivider ? 'rounded-none bg-transparent shadow-none border-b' : ''}`}
                style={{
                  marginBottom: layout === 'list' ? `${spacing/8}px` : undefined,
                  marginTop: (layout === 'grid' || layout === 'columns') ? `${spacing/8}px` : undefined,
                  padding: `${12 * uiScale}px`,
                  gap: `${20 * uiScale}px`,
                  borderColor: currentSettings.showDivider ? 'color-mix(in srgb, var(--accent-color, #4f46e5) 20%, transparent)' : undefined
                }}
              >
                <div 
                  className={`rounded-xl bg-slate-900 flex items-center justify-center text-white font-black group-hover:scale-105 transition-all shadow-md shrink-0`}
                  style={{
                    width: `${48 * uiScale}px`,
                    height: `${48 * uiScale}px`,
                    fontSize: `${1.1 * uiScale}rem`,
                    backgroundColor: 'var(--accent-color, #4f46e5)'
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div 
                  className={`font-bold tracking-tight text-slate-700 group-hover:text-slate-900 transition-colors markdown-inline`}
                  style={{
                    fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (itemCount <= 4 ? 1.5 : 1.1)}rem`,
                    lineHeight: currentSettings.contentLineHeight || 1.2,
                    letterSpacing: `${(currentSettings.contentLetterSpacing || 0)}em`,
                    textAlign: currentSettings.contentAlignment || 'left'
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{item}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

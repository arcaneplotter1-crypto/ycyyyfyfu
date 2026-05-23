import React from 'react';
import { motion } from 'motion/react';
import { BulletSlideData, SlideStyleSettings } from '../../../presentationTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { CheckCircle2 } from 'lucide-react';
import { SlideBackground } from './SlideBackground';

export const BulletSlide: React.FC<{ slide: BulletSlideData, settings?: SlideStyleSettings }> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const itemCount = slide.bullets.length;
  const isFew = itemCount <= 4;
  
  const layout = currentSettings.bulletsLayout || 'list';
  const columns = currentSettings.gridColumns || currentSettings.bulletsColumns || (itemCount > 6 ? 2 : 1);
  const spacing = currentSettings.bulletSpacing || currentSettings.itemSpacing || 24;
  const uiScale = (currentSettings.uiSize || 100) / 100;

  const getColsClass = (cols: number) => {
    switch (cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-3';
      case 4: return 'grid-cols-2 md:grid-cols-4';
      case 5: return 'grid-cols-2 lg:grid-cols-5';
      case 6: return 'grid-cols-2 lg:grid-cols-6';
      default: return 'grid-cols-1 md:grid-cols-2';
    }
  };

  const getLayoutClasses = () => {
    if (layout === 'columns') return `grid ${getColsClass(columns)} gap-x-12 gap-y-0`;
    if (layout === 'grid') return `grid ${getColsClass(columns)} gap-x-8 gap-y-8`;
    if (layout === 'split') return `grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full`;
    return itemCount > 6 ? 'grid grid-cols-1 md:grid-cols-2' : 'grid grid-cols-1';
  };

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
            className={`flex flex-col ${titleAlignmentClass} border-l-[10px] pl-8`}
            style={{ borderColor: 'var(--accent-color, #6366f1)' }}
          >
            <span className="font-black tracking-[0.4em] uppercase text-[10px] mb-4 block" style={{ color: 'var(--accent-color, #6366f1)' }}>Key Points</span>
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
            {slide.bullets.map((bullet, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
                className={`flex items-start rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg border border-slate-100 p-6 gap-4 transition-all hover:-translate-x-2`}
              >
                <div 
                  className="rounded-xl flex items-center justify-center shrink-0 w-8 h-8 bg-indigo-50"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #4f46e5) 10%, #f1f5f9)' }}
                >
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent-color, #4f46e5)' }} />
                </div>
                <div 
                  className="text-slate-700 font-semibold tracking-tight self-center markdown-inline"
                  style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 1.25}rem` }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{bullet}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col justify-center w-full h-full max-w-7xl mx-auto px-10 relative overflow-hidden ${contentAlignmentClass}`}>
      <SlideBackground type="bullets" />
      <div className="relative z-10 flex flex-col h-full py-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`shrink-0 mb-8 w-full flex flex-col ${titleAlignmentClass} ${currentSettings.titleAlignment === 'left' || (!currentSettings.titleAlignment && !isFew) ? 'text-left border-l-[10px] pl-8' : ''}`}
          style={{
            borderColor: 'var(--accent-color, #6366f1)'
          }}
        >
          <span className="font-black tracking-[0.4em] uppercase text-[10px] mb-2 block" style={{ color: 'var(--accent-color, #6366f1)' }}>Key Points</span>
          <h2 
            className={`font-[900] text-slate-900 tracking-tight leading-none markdown-inline`}
            style={{ 
              fontSize: `${(currentSettings.titleSize || 100) * 0.01 * (isFew ? 3.5 : 2.5)}rem`,
              textAlign: currentSettings.titleAlignment || (isFew ? 'center' : 'left'),
              letterSpacing: `${(currentSettings.titleLetterSpacing || -0.05)}em`,
              lineHeight: currentSettings.titleLineHeight || 1.1
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{slide.title}</ReactMarkdown>
          </h2>
          {(currentSettings.titleAlignment === 'center' || (itemCount <= 4 && !currentSettings.titleAlignment)) && <div className="h-1 w-20 mt-6 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />}
        </motion.div>
        
        <div className="flex-1 min-h-0 w-full overflow-y-auto scrollbar-none py-4">
          <div 
            className={`${getLayoutClasses()} ${isFew ? 'max-w-4xl' : 'w-full'} items-center mx-auto`}
            style={{ gap: layout === 'list' ? `${spacing/2}px` : undefined }}
          >
            {slide.bullets.map((bullet, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (idx * 0.1), duration: 0.5 }}
                className={`flex items-start rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg transition-all group hover:-translate-y-1 ${currentSettings.showDivider ? 'rounded-none bg-transparent shadow-none border-b' : 'border border-slate-100'}`}
                style={{ 
                  justifyContent: currentSettings.contentAlignment === 'center' ? 'center' : currentSettings.contentAlignment === 'right' ? 'flex-end' : 'flex-start',
                  marginBottom: layout === 'list' ? `${spacing/8}px` : undefined,
                  marginTop: (layout === 'grid' || layout === 'columns') ? `${spacing/8}px` : undefined,
                  padding: `${16 * uiScale}px`,
                  gap: `${20 * uiScale}px`,
                  borderColor: currentSettings.showDivider ? 'color-mix(in srgb, var(--accent-color, #4f46e5) 20%, transparent)' : undefined
                }}
              >
                <div 
                  className={`rounded-xl flex items-center justify-center shrink-0 transition-all shadow-sm group-hover:bg-[var(--accent-color)]`}
                  style={{
                    width: `${32 * uiScale}px`,
                    height: `${32 * uiScale}px`,
                    backgroundColor: 'color-mix(in srgb, var(--accent-color, #4f46e5) 10%, #f1f5f9)',
                  }}
                >
                  <CheckCircle2 
                    className="transition-colors group-hover:text-white" 
                    style={{
                      width: `${16 * uiScale}px`,
                      height: `${16 * uiScale}px`,
                      color: 'var(--accent-color, #4f46e5)',
                    }}
                  />
                </div>
                <div 
                  className={`text-slate-700 font-semibold tracking-tight self-center markdown-inline`}
                  style={{
                    fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (isFew ? 1.5 : 1.1)}rem`,
                    lineHeight: currentSettings.contentLineHeight || 1.2,
                    letterSpacing: `${(currentSettings.contentLetterSpacing || 0)}em`,
                    textAlign: currentSettings.contentAlignment || 'left'
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{bullet}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

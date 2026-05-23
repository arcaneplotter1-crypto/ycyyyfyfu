import React from 'react';
import { motion } from 'motion/react';
import { SplitTextSlideData, SlideStyleSettings } from '../../../presentationTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { SlideBackground } from './SlideBackground';

export const SplitTextSlide: React.FC<{ slide: SplitTextSlideData, settings?: SlideStyleSettings }> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const leftWords = slide.leftContent.split(/\s+/).length;
  const rightWords = slide.rightContent.split(/\s+/).length;
  const totalWords = leftWords + rightWords;
  
  const isMinimal = totalWords < 40;
  const useBalancedScale = isMinimal ? 'lg:prose-2xl' : 'lg:prose-xl';

  const titleAlignmentClass = currentSettings.titleAlignment === 'left' ? 'items-start text-left' : 
                             currentSettings.titleAlignment === 'right' ? 'items-end text-right' : 
                             'items-center text-center';
                             
  const leftAlignmentClass = currentSettings.leftAlignment === 'left' ? 'items-start text-left' : 
                                currentSettings.leftAlignment === 'right' ? 'items-end text-right' : 
                                'items-center text-center';

  const rightAlignmentClass = currentSettings.rightAlignment === 'left' ? 'items-start text-left' : 
                                 currentSettings.rightAlignment === 'right' ? 'items-end text-right' : 
                                 'items-center text-center';

  const splitRatio = currentSettings.splitRatio || 50;

  return (
    <div className={`flex flex-col justify-center w-full h-full max-w-7xl mx-auto px-10 relative overflow-hidden ${currentSettings.contentAlignment === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
      <SlideBackground type="split-text" />
      <div className="relative z-10 flex flex-col h-full py-8 w-full">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`shrink-0 mb-8 w-full flex flex-col ${titleAlignmentClass} ${currentSettings.titleAlignment === 'left' || (!currentSettings.titleAlignment && !isMinimal) ? 'border-l-[10px] pl-8' : ''}`}
          style={{
            borderColor: 'var(--accent-color, #6366f1)'
          }}
        >
          <span className="font-black tracking-[0.4em] uppercase text-[10px] mb-2 block" style={{ color: 'var(--accent-color, #6366f1)' }}>Comparison</span>
          <h2 
            className={`font-[900] text-slate-900 leading-tight tracking-tighter`}
            style={{ 
              fontSize: `${(currentSettings.titleSize || 100) * 0.01 * (isMinimal ? 3.5 : 2.5)}rem`,
              textAlign: currentSettings.titleAlignment || (isMinimal ? 'center' : 'left'),
              letterSpacing: `${(currentSettings.titleLetterSpacing || -0.05)}em`,
              lineHeight: currentSettings.titleLineHeight || 1.1
            }}
          >
            {slide.title}
          </h2>
        </motion.div>
        
        <div 
          className={`flex-1 min-h-0 flex flex-row w-full items-stretch`}
          style={{ gap: `${currentSettings.columnGap ? currentSettings.columnGap/2 : 40}px` }}
        >
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`prose dark:prose-invert text-slate-700 bg-white/40 p-6 rounded-3xl border border-slate-100 shadow-sm h-full overflow-y-auto scrollbar-none markdown-content ${leftAlignmentClass} flex flex-col`}
            style={{
              flex: `${splitRatio} ${splitRatio} 0%`,
              fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (isMinimal ? 1.25 : 1.1)}rem`,
              lineHeight: currentSettings.contentLineHeight || 1.5,
              textAlign: currentSettings.leftAlignment || currentSettings.contentAlignment || (isMinimal ? 'center' : 'left'),
              letterSpacing: `${(currentSettings.contentLetterSpacing || 0)}em`
            }}
          >
            <div className="w-full">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {slide.leftContent}
              </ReactMarkdown>
            </div>
           </motion.div>
          
          <div className="flex flex-col items-center self-stretch px-2">
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
            <div className="w-2 h-2 rounded-full my-4 shadow-md" style={{ backgroundColor: 'var(--accent-color, #6366f1)', boxShadow: `0 0 10px color-mix(in srgb, var(--accent-color, #6366f1) 40%, transparent)` }} />
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
          </div>
   
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`prose dark:prose-invert text-slate-700 bg-white/40 p-6 rounded-3xl border border-slate-100 shadow-sm h-full overflow-y-auto scrollbar-none markdown-content ${rightAlignmentClass} flex flex-col`}
            style={{
              flex: `${100 - splitRatio} ${100 - splitRatio} 0%`,
              fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (isMinimal ? 1.25 : 1.1)}rem`,
              lineHeight: currentSettings.contentLineHeight || 1.5,
              textAlign: currentSettings.rightAlignment || currentSettings.contentAlignment || (isMinimal ? 'center' : 'left'),
              letterSpacing: `${(currentSettings.contentLetterSpacing || 0)}em`
            }}
          >
            <div className="w-full">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {slide.rightContent}
              </ReactMarkdown>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

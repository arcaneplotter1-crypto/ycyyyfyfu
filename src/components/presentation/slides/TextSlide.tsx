import React from 'react';
import { motion } from 'motion/react';
import { TextSlideData, SlideStyleSettings } from '../../../presentationTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { SlideBackground } from './SlideBackground';

export const TextSlide: React.FC<{ slide: TextSlideData, settings?: SlideStyleSettings }> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const wordCount = slide.content.split(/\s+/).length;
  const isShort = wordCount < 40;
  const isVeryLong = wordCount > 150;

  const titleAlignmentClass = currentSettings.titleAlignment === 'left' ? 'items-start text-left' : 
                             currentSettings.titleAlignment === 'right' ? 'items-end text-right' : 
                             'items-center text-center';
                             
  const contentAlignmentClass = currentSettings.contentAlignment === 'left' ? 'items-start text-left' : 
                               currentSettings.contentAlignment === 'right' ? 'items-end text-right' : 
                               'items-center text-center';

  return (
    <div className={`flex flex-col justify-center w-full h-full max-w-7xl mx-auto px-10 relative overflow-hidden ${contentAlignmentClass}`}>
      <SlideBackground type="text" />
      
      <div className="relative z-10 flex flex-col h-full items-stretch justify-center py-12">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`shrink-0 w-full flex flex-col ${titleAlignmentClass} ${currentSettings.titleAlignment === 'left' || (!currentSettings.titleAlignment && !isShort) ? 'border-l-[10px] pl-8' : ''}`}
          style={{
            borderColor: 'var(--accent-color, #6366f1)',
            marginBottom: isShort ? '3rem' : '1.5rem'
          }}
        >
          <span className="font-black tracking-[0.4em] uppercase text-xs mb-4 block" style={{ color: 'var(--accent-color, #6366f1)' }}>Discussion</span>
          <h2 
            className="font-[900] text-slate-900 leading-tight tracking-tighter"
            style={{ 
              fontSize: `${(currentSettings.titleSize || 100) * 0.01 * (isShort ? 4.5 : isVeryLong ? 2.5 : 3.5)}rem`,
              textAlign: currentSettings.titleAlignment || (isShort ? 'center' : 'left'),
              letterSpacing: `${(currentSettings.titleLetterSpacing || -0.05)}em`,
              lineHeight: currentSettings.titleLineHeight || 1.1
            }}
          >
            {slide.title}
          </h2>
          {(currentSettings.titleAlignment === 'center' || (isShort && !currentSettings.titleAlignment)) && <div className="h-1.5 w-32 mt-8 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: isShort ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`flex-1 min-h-0 w-full prose dark:prose-invert ${isShort ? 'lg:prose-2xl' : (isVeryLong || (currentSettings.textLayout === 'columns')) ? `lg:prose-lg columns-${currentSettings.gridColumns || 2} gap-12` : 'lg:prose-xl'} max-w-5xl text-slate-700 font-medium overflow-y-auto pr-6 scrollbar-none markdown-content`}
          style={{
            fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (isShort ? 1.5 : isVeryLong ? 1 : 1.25)}rem`,
            lineHeight: currentSettings.contentLineHeight || 1.6,
            textAlign: currentSettings.contentAlignment || (isShort ? 'center' : 'left'),
            letterSpacing: `${(currentSettings.contentLetterSpacing || 0)}em`
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {slide.content}
          </ReactMarkdown>
        </motion.div>
      </div>
    </div>
  );
};

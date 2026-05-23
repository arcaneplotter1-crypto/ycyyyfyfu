import React from 'react';
import { motion } from 'motion/react';
import { TitleSlideData, SlideStyleSettings } from '../../../presentationTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { SlideBackground } from './SlideBackground';

export const TitleSlide: React.FC<{ slide: TitleSlideData, settings?: SlideStyleSettings }> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  
  const titleAlignmentClass = currentSettings.titleAlignment === 'left' ? 'items-start text-left' : 
                             currentSettings.titleAlignment === 'right' ? 'items-end text-right' : 
                             'items-center text-center';
                             
  const contentAlignmentClass = currentSettings.contentAlignment === 'left' ? 'items-start text-left' : 
                               currentSettings.contentAlignment === 'right' ? 'items-end text-right' : 
                               'items-center text-center';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden p-20">
      <SlideBackground type="title" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col w-full max-w-5xl"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
          className={`font-[950] mb-8 tracking-tighter leading-[1.1] text-slate-900 drop-shadow-sm markdown-inline flex flex-col ${titleAlignmentClass}`}
          style={{ 
            fontSize: `${(currentSettings.titleSize || 100) * 0.01 * 4.5}rem`,
            letterSpacing: `${(currentSettings.titleLetterSpacing || -0.03)}em`,
            lineHeight: currentSettings.titleLineHeight || 1.1,
            textAlign: currentSettings.titleAlignment || 'center'
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{slide.title}</ReactMarkdown>
        </motion.h1>
        
        {slide.subtitle && (
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '100%' }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className={`flex flex-col ${contentAlignmentClass} w-full`}
          >
            <div className={`h-1.5 w-32 mb-10 rounded-full shadow-lg ${contentAlignmentClass.includes('center') ? 'mx-auto' : contentAlignmentClass.includes('end') ? 'ml-auto' : ''}`} 
                 style={{ 
                   backgroundColor: 'var(--accent-color, #4f46e5)',
                   boxShadow: `0 10px 15px -3px color-mix(in srgb, var(--accent-color, #4f46e5) 20%, transparent)`
                 }} 
            />
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className={`text-slate-500 font-medium mb-12 tracking-tight leading-relaxed markdown-inline flex flex-col ${contentAlignmentClass}`}
              style={{
                fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 1.875}rem`,
                textAlign: currentSettings.contentAlignment || 'center',
                letterSpacing: `${(currentSettings.contentLetterSpacing || 0)}em`,
                lineHeight: currentSettings.contentLineHeight || 1.5
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{slide.subtitle}</ReactMarkdown>
            </motion.h2>
          </motion.div>
        )}
      </motion.div>

      {(slide.author || slide.date) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-12 flex items-center gap-8 text-slate-400 font-bold text-xs tracking-[0.4em] uppercase"
        >
          {slide.author && <span className="flex items-center gap-3"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #4f46e5) 30%, transparent)' }}/>{slide.author}</span>}
          {slide.date && <span className="flex items-center gap-3"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #4f46e5) 30%, transparent)' }}/>{slide.date}</span>}
        </motion.div>
      )}
    </div>
  );
};

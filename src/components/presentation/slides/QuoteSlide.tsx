import React from 'react';
import { motion } from 'motion/react';
import { QuoteSlideData, SlideStyleSettings } from '../../../presentationTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { SlideBackground } from './SlideBackground';

export const QuoteSlide: React.FC<{ slide: QuoteSlideData, settings?: SlideStyleSettings }> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  
  const titleAlignmentClass = currentSettings.titleAlignment === 'left' ? 'items-start text-left pl-32 pr-10' : 
                             currentSettings.titleAlignment === 'right' ? 'items-end text-right pr-32 pl-10' : 
                             'items-center text-center px-16';
                             
  const contentAlignmentClass = currentSettings.contentAlignment === 'left' ? 'items-start text-left pl-32' : 
                               currentSettings.contentAlignment === 'right' ? 'items-end text-right pr-32' : 
                               'items-center text-center px-16';

  return (
    <div className={`flex flex-col justify-center w-full h-full relative overflow-hidden ${contentAlignmentClass}`}>
      <SlideBackground type="quote" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] rounded-full blur-[100px] -z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #4f46e5) 10%, transparent)' }} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "backOut" }}
        className={`text-[200px] font-serif leading-none absolute -top-10 ${currentSettings.titleAlignment === 'right' ? 'right-20' : 'left-20'} opacity-50 select-none`}
        style={{ color: 'color-mix(in srgb, var(--accent-color, #4f46e5) 5%, transparent)' }}
      >
        “
      </motion.div>

      <div className={`max-w-5xl relative z-10 flex flex-col w-full h-full justify-center overflow-y-auto scrollbar-none py-12 ${titleAlignmentClass}`}>
        <motion.blockquote 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-medium italic mb-10 tracking-tight text-slate-800 markdown-inline w-full"
          style={{ 
            fontSize: `${(currentSettings.titleSize || 100) * 0.01 * 2.5}rem`,
            textAlign: currentSettings.titleAlignment || 'center',
            lineHeight: currentSettings.titleLineHeight || 1.3,
            letterSpacing: `${(currentSettings.titleLetterSpacing || 0)}em`
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{slide.quote}</ReactMarkdown>
        </motion.blockquote>
        
        {slide.author && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className={`flex items-center gap-6 w-full ${contentAlignmentClass.includes('center') ? 'justify-center' : contentAlignmentClass.includes('left') ? 'justify-start' : 'justify-end'}`}
          >
            <div className="h-px w-12" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #4f46e5) 20%, transparent)' }} />
            <motion.cite 
              className="font-bold not-italic tracking-tight"
              style={{
                color: 'var(--accent-color, #4f46e5)',
                fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 1.1}rem`,
                textAlign: currentSettings.contentAlignment || 'center',
                letterSpacing: `${(currentSettings.contentLetterSpacing || 0)}em`,
                lineHeight: currentSettings.contentLineHeight || 1.6
              }}
            >
              {slide.author}
            </motion.cite>
            <div className="h-px w-12" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #4f46e5) 20%, transparent)' }} />
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "backOut", delay: 0.4 }}
        className={`text-[200px] font-serif leading-none absolute -bottom-20 ${currentSettings.titleAlignment === 'left' ? 'left-20' : 'right-20'} opacity-50 select-none`}
        style={{ color: 'color-mix(in srgb, var(--accent-color, #4f46e5) 5%, transparent)' }}
      >
        ”
      </motion.div>
    </div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ProcessSlideData, SlideStyleSettings } from '../../../presentationTypes';
import { SlideBackground } from './SlideBackground';
import { ArrowRight } from 'lucide-react';

interface ProcessSlideProps {
  slide: ProcessSlideData;
  settings?: SlideStyleSettings;
}

export const ProcessSlide: React.FC<ProcessSlideProps> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const { title, items } = slide;
  const stepStyle = currentSettings.stepStyle || 'circle';
  const columns = currentSettings.gridColumns || (items.length > 3 ? 4 : items.length);

  const getColsClass = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-3';
      case 4: return 'grid-cols-2 md:grid-cols-4';
      case 5: return 'grid-cols-2 lg:grid-cols-5';
      case 6: return 'grid-cols-2 lg:grid-cols-6';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col p-6 lg:p-10 overflow-hidden" id={slide.id}>
      <SlideBackground type="agenda" /> 
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col h-full items-stretch justify-center"
      >
        <motion.div 
          className="font-bold tracking-tight text-slate-900 markdown-content shrink-0"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          style={{
            fontSize: `${(currentSettings.titleSize || 100) * 0.01 * (items.length > 3 ? 2.5 : 3.75)}rem`,
            textAlign: currentSettings.titleAlignment || 'left',
            letterSpacing: `${(currentSettings.titleLetterSpacing || -0.02)}em`,
            lineHeight: currentSettings.titleLineHeight || 1.1,
            marginBottom: items.length > 3 ? '1.5rem' : '3rem'
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {title}
          </ReactMarkdown>
        </motion.div>
 
        <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col justify-center">
          <div className={`grid gap-4 items-start relative px-2 overflow-y-auto scrollbar-none py-4 ${getColsClass()}`}>
            {items.map((item, index) => (
              <div key={item.id || index} className="relative group">
                {/* Connector Line (Horizontal) - Force visible if more than 1 col */}
                  {index < items.length - 1 && items.length > 1 && (
                    <div className={`absolute left-[85%] w-full h-0.5 bg-slate-200 z-0 ${items.length > 3 ? 'top-8' : 'top-10'}`}>
                      <motion.div 
                        className="h-full"
                        style={{ backgroundColor: 'var(--accent-color, #6366f1)' }}
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ delay: index * 0.3 + 0.5, duration: 0.8 }}
                      />
                    </div>
                  )}

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  <div 
                    className={`flex items-center justify-center font-black mb-3 transition-transform group-hover:scale-105 shadow-md flex-shrink-0
                      ${stepStyle === 'circle' ? 'rounded-full' : stepStyle === 'square' ? 'rounded-2xl' : 'rounded-none'}
                      bg-white border-2 ${items.length > 3 ? 'w-14 h-14 text-xl' : 'w-20 h-20 text-2xl'}`}
                    style={{ borderColor: 'var(--accent-color, #6366f1)', color: 'var(--accent-color, #6366f1)' }}
                  >
                    {index + 1}
                  </div>
                  
                  <div 
                    className="font-bold mb-1 uppercase tracking-tight markdown-content px-2"
                    style={{
                      fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (items.length > 3 ? 1 : 1.125)}rem`,
                      textAlign: currentSettings.contentAlignment || 'center',
                      letterSpacing: `${(currentSettings.contentLetterSpacing || 0.05)}em`
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {item.label}
                    </ReactMarkdown>
                  </div>
                  <div 
                    className={`text-slate-500 leading-snug font-medium markdown-content px-2 ${items.length > 3 ? 'line-clamp-2' : 'line-clamp-3'}`}
                    style={{
                      fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (items.length > 3 ? 0.625 : 0.75)}rem`,
                      lineHeight: currentSettings.contentLineHeight || 1.4,
                      textAlign: currentSettings.contentAlignment || 'center'
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {item.description}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

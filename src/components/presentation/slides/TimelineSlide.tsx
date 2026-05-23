import React from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { TimelineSlideData, SlideStyleSettings } from '../../../presentationTypes';
import { SlideBackground } from './SlideBackground';

interface TimelineSlideProps {
  slide: TimelineSlideData;
  settings?: SlideStyleSettings;
}

export const TimelineSlide: React.FC<TimelineSlideProps> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const { title, items } = slide;

  const columns = currentSettings.gridColumns || (items.length <= 2 ? 2 : items.length <= 4 ? 4 : 6);

  const getColsClass = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-3';
      case 4: return 'grid-cols-2 lg:grid-cols-4';
      case 5: return 'grid-cols-2 lg:grid-cols-5';
      case 6: return 'grid-cols-2 lg:grid-cols-6';
      default: return 'grid-cols-2 lg:grid-cols-6';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col p-6 lg:p-10 overflow-hidden" id={slide.id}>
      <SlideBackground type="chart" />
      
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
            fontSize: `${(currentSettings.titleSize || 100) * 0.01 * (items.length > 4 ? 2.25 : 3.75)}rem`,
            textAlign: currentSettings.titleAlignment || 'left',
            letterSpacing: `${(currentSettings.titleLetterSpacing || -0.02)}em`,
            lineHeight: currentSettings.titleLineHeight || 1.1,
            marginBottom: items.length > 4 ? '1rem' : '2rem'
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {title}
          </ReactMarkdown>
        </motion.div>
 
        <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col justify-center">
          <div className="relative flex flex-col justify-center min-h-0 py-4">
            {/* Main Horizontal line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 rounded-full hidden md:block">
              <motion.div 
                className="h-full"
                style={{ backgroundColor: 'var(--accent-color, #6366f1)' }}
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
 
            <div className={`grid gap-4 lg:gap-6 relative px-2 overflow-y-auto scrollbar-none max-h-full py-2 ${getColsClass()}`}>
              {items.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, y: index % 2 === 0 ? -10 : 10 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  className={`relative flex flex-col ${index % 2 === 0 ? 'justify-end pb-6' : 'justify-start pt-6'}`}
                >
                  {/* Dot on line */}
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 shadow-md z-20 hidden md:block" 
                    style={{ top: index % 2 === 0 ? '100%' : '0', marginTop: '-8px', borderColor: 'var(--accent-color, #6366f1)' }}
                  />

                  <div 
                    className={`bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-md group hover:shadow-xl transition-all ${items.length > 4 ? 'p-4' : 'p-6'}`}
                    style={{
                      textAlign: currentSettings.contentAlignment || 'left'
                    }}
                  >
                    <div 
                        className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60 markdown-content"
                        style={{
                          fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.5}rem`,
                          color: 'var(--accent-color, #6366f1)'
                        }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {item.date}
                      </ReactMarkdown>
                    </div>
                    <div 
                        className={`font-bold text-slate-900 mb-1 transition-colors markdown-content`}
                        style={{
                          fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (items.length > 4 ? 0.875 : 1.125)}rem`,
                          letterSpacing: `${(currentSettings.contentLetterSpacing || 0)}em`
                        }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {item.title}
                      </ReactMarkdown>
                    </div>
                    <div 
                      className={`text-slate-500 font-medium leading-snug markdown-content line-clamp-3`}
                      style={{
                        fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (items.length > 4 ? 0.625 : 0.75)}rem`,
                        lineHeight: currentSettings.contentLineHeight || 1.3
                      }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {item.description}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

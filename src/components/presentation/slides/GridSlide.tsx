import React from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { GridSlideData, SlideStyleSettings } from '../../../presentationTypes';
import { SlideBackground } from './SlideBackground';
import * as LucideIcons from 'lucide-react';

interface GridSlideProps {
  slide: GridSlideData;
  settings?: SlideStyleSettings;
}

export const GridSlide: React.FC<GridSlideProps> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const { title, items } = slide;
  const columns = currentSettings.gridColumns || (items.length > 4 ? 3 : 2);
  const cardStyle = currentSettings.cardStyle || 'glass';
  const showIcons = currentSettings.showIcons !== false;

  const getColsClass = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-2 lg:grid-cols-4';
      case 5: return 'grid-cols-2 lg:grid-cols-5';
      case 6: return 'grid-cols-2 lg:grid-cols-6';
      default: return 'grid-cols-1 md:grid-cols-2';
    }
  };

  const getCardClass = () => {
    switch (cardStyle) {
      case 'bold': return 'text-white border-none shadow-xl';
      case 'minimal': return 'bg-transparent border border-slate-200 text-slate-900 shadow-none';
      case 'glass':
      default: return 'bg-white/40 backdrop-blur-xl border border-white/60 text-slate-900 shadow-lg';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col p-6 lg:p-10 overflow-hidden" id={slide.id}>
      <SlideBackground type="split-text" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col h-full items-stretch justify-center"
      >
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-bold tracking-tight text-slate-900 markdown-content shrink-0"
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
          <div 
            className={`grid gap-2 overflow-y-auto scrollbar-none py-2 ${getColsClass()}`}
            style={{ 
              gridAutoRows: 'minmax(min-content, max-content)',
              alignContent: 'center',
              width: '100%'
            }}
          >
            {items.map((item, index) => {
              const IconComponent = showIcons && item.icon ? (LucideIcons as any)[item.icon] : null;
              
              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className={`flex flex-col rounded-2xl transition-transform hover:scale-[1.01] overflow-hidden ${getCardClass()} ${items.length > 4 ? 'p-3' : 'p-5'}`}
                  style={{ backgroundColor: cardStyle === 'bold' ? 'var(--accent-color, #6366f1)' : undefined }}
                >
                  <div className="flex items-start gap-3 h-full">
                    {IconComponent && (
                      <div 
                        className={`rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${items.length > 4 ? 'w-8 h-8' : 'w-12 h-12'}`}
                        style={{ backgroundColor: item.color || 'var(--accent-color, #6366f1)', color: '#fff' }}
                      >
                        <IconComponent size={items.length > 4 ? 16 : 24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div 
                        className={`font-bold mb-1 markdown-content ${cardStyle === 'bold' ? 'text-white' : 'text-slate-900'}`}
                        style={{
                          fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (items.length > 4 ? 1 : 1.25)}rem`,
                          textAlign: currentSettings.contentAlignment || 'left',
                          letterSpacing: `${(currentSettings.contentLetterSpacing || 0)}em`
                        }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {item.title}
                        </ReactMarkdown>
                      </div>
                      <div 
                        className={`leading-snug markdown-content ${items.length > 4 ? 'line-clamp-2' : 'line-clamp-3'}`}
                        style={{
                          fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (items.length > 4 ? 0.75 : 0.875)}rem`,
                          lineHeight: currentSettings.contentLineHeight || 1.4,
                          textAlign: currentSettings.contentAlignment || 'left',
                          color: cardStyle === 'bold' ? 'color-mix(in srgb, var(--accent-color, #6366f1) 15%, #fff)' : '#475569'
                        }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {item.description}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

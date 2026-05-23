import React from 'react';
import { motion } from 'motion/react';
import { MedicalContentsSlideData, SlideStyleSettings } from '../../../presentationTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { SlideBackground } from './SlideBackground';

export const MedicalContentsSlide: React.FC<{ slide: MedicalContentsSlideData, settings?: SlideStyleSettings }> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const primaryColor = currentSettings.primaryColor || 'var(--accent-color, #3b82f6)';
  const disableAnimations = currentSettings.disableAnimations || false;
  
  const getTransition = (delay = 0, duration = 0.4): any => {
    if (disableAnimations) return { duration: 0 };
    return { delay, duration, ease: "easeOut" };
  };

  const items = slide.items || [];
  const defaultCols = items.length <= 3 ? 1 : items.length === 4 ? 2 : 3;

  // Compute column count matching layout settings
  let cols = defaultCols;
  if (currentSettings.bulletsLayout === 'list') {
    cols = 1;
  } else if (currentSettings.bulletsLayout === 'columns' || currentSettings.bulletsLayout === 'grid' || currentSettings.bulletsLayout === 'split') {
    cols = currentSettings.gridColumns || currentSettings.bulletsColumns || defaultCols;
  } else if (currentSettings.gridColumns || currentSettings.bulletsColumns) {
    cols = currentSettings.gridColumns || currentSettings.bulletsColumns;
  }

  // Spacing helper for gap in grid
  const itemSpacing = currentSettings.bulletSpacing !== undefined 
    ? currentSettings.bulletSpacing 
    : (currentSettings.itemSpacing !== undefined ? currentSettings.itemSpacing : 16);

  const titleAlign = currentSettings.titleAlignment || 'left';
  const contentAlign = currentSettings.contentAlignment || 'left';

  const getAlignmentClass = (align: string) => {
    switch (align) {
      case 'center': return 'items-center text-center mx-auto w-full';
      case 'right': return 'items-end text-right ml-auto w-full';
      case 'left':
      default: return 'items-start text-left mr-auto w-full';
    }
  };

  return (
    <div className="flex flex-col w-full h-full justify-start relative overflow-hidden p-10 bg-[#f8fafc]/90">
      <SlideBackground type="agenda" />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col h-full justify-between">
        {/* Header section */}
        <div className={`mb-5 shrink-0 flex flex-col ${getAlignmentClass(titleAlign)}`}>
          {slide.eyebrow && (
            <motion.p
              initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={getTransition(0)}
              className="text-xs font-bold tracking-widest uppercase text-slate-400 select-none mb-0.5 font-mono"
              style={{ color: `color-mix(in srgb, ${primaryColor} 75%, #64748b)` }}
            >
              {slide.eyebrow}
            </motion.p>
          )}
          <motion.h2
            initial={disableAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={getTransition(0.1)}
            className="font-extrabold text-slate-900 font-serif select-text"
            style={{
              fontSize: `${(currentSettings.titleSize || 100) * 0.01 * 2}rem`,
              lineHeight: currentSettings.titleLineHeight || 1.15,
              letterSpacing: `${currentSettings.titleLetterSpacing !== undefined ? currentSettings.titleLetterSpacing : 0}em`,
              textAlign: titleAlign
            }}
          >
            <span className="inline-block">
              <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {slide.title}
              </ReactMarkdown>
            </span>
          </motion.h2>
        </div>

        {/* Content Cards Grid */}
        <div className="flex-1 min-h-0 flex flex-col justify-start py-2 pt-3">
          <div 
            className="grid items-center justify-center mt-2 mb-auto w-full overflow-y-auto max-h-[480px] scrollbar-thin"
            style={{
              gridTemplateColumns: cols > 1 ? `repeat(${cols}, minmax(0, 1fr))` : '1fr',
              gap: `${itemSpacing}px`,
              maxWidth: cols === 1 ? '42rem' : cols === 2 ? '64rem' : '100%'
            }}
          >
            {items.map((item, idx) => {
              const numString = item.number || String(idx + 1).padStart(2, '0');
              const itemSize = currentSettings.uiSize || 100;
              return (
                <motion.div
                  key={item.id || idx}
                  initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={getTransition(0.1 + idx * 0.05)}
                  className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.01)] h-full w-full border-b-[3px]"
                  style={{ 
                    borderBottomColor: primaryColor,
                    boxShadow: '0 6px 20px -10px rgba(15, 23, 42, 0.02)'
                  }}
                >
                  {/* Accent Number Badge */}
                  <div 
                    className="rounded-xl flex items-center justify-center text-white font-mono font-bold shrink-0 shadow-sm select-none"
                    style={{ 
                      width: `${2.5 * (itemSize * 0.01)}rem`,
                      height: `${2.5 * (itemSize * 0.01)}rem`,
                      fontSize: `${1 * (itemSize * 0.01)}rem`,
                      backgroundColor: primaryColor,
                      backgroundImage: `linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 80%, black))`
                    }}
                  >
                    {numString}
                  </div>

                  {/* Card details */}
                  <div 
                    className="flex flex-col select-text space-y-1 flex-1"
                    style={{
                      textAlign: contentAlign
                    }}
                  >
                    <h3 
                      className="font-bold text-slate-800"
                      style={{
                        fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 1.125}rem`,
                        lineHeight: currentSettings.contentLineHeight || 1.3,
                        letterSpacing: `${currentSettings.contentLetterSpacing !== undefined ? currentSettings.contentLetterSpacing : 0}em`
                      }}
                    >
                      <span className="inline-block">
                        <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {item.title}
                        </ReactMarkdown>
                      </span>
                    </h3>
                    {item.description && (
                      <div 
                        className="text-slate-500 leading-relaxed"
                        style={{
                          fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.875}rem`,
                          lineHeight: currentSettings.contentLineHeight || 1.5,
                          letterSpacing: `${currentSettings.contentLetterSpacing !== undefined ? currentSettings.contentLetterSpacing : 0}em`
                        }}
                      >
                        <span className="inline-block">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {item.description}
                          </ReactMarkdown>
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Spacer / Decorative Footer */}
        <div className="h-2 select-none shrink-0" />
      </div>
    </div>
  );
};

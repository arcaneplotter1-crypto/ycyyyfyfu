import React from 'react';
import { motion } from 'motion/react';
import { MedicalColumnsSlideData, SlideStyleSettings, MedicalColumnCard } from '../../../presentationTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { SlideBackground } from './SlideBackground';
import { Eye, Ear, Shield, Heart, Activity, Zap, Play, Info, HelpCircle } from 'lucide-react';

export const MedicalColumnsSlide: React.FC<{ slide: MedicalColumnsSlideData, settings?: SlideStyleSettings }> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const primaryColor = currentSettings.primaryColor || 'var(--accent-color, #3b82f6)';
  const disableAnimations = currentSettings.disableAnimations || false;

  const getTransition = (delay = 0, duration = 0.4): any => {
    if (disableAnimations) return { duration: 0 };
    return { delay, duration, ease: "easeOut" };
  };
  
  const columns = slide.columns || [];

  const getLucideIcon = (name: string) => {
    const iconProps = { className: "w-5 h-5", style: { color: primaryColor } };
    const lower = (name || '').toLowerCase();
    switch (lower) {
      case 'eye': return <Eye {...iconProps} />;
      case 'ear': return <Ear {...iconProps} />;
      case 'shield': return <Shield {...iconProps} />;
      case 'heart': return <Heart {...iconProps} />;
      case 'activity': return <Activity {...iconProps} />;
      case 'zap': return <Zap {...iconProps} />;
      default: return <Eye {...iconProps} />;
    }
  };

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

  const cols = currentSettings.gridColumns || columns.length || 3;
  const columnGap = currentSettings.columnGap !== undefined ? currentSettings.columnGap : 20;

  return (
    <div className="flex flex-col w-full h-full justify-start relative overflow-hidden p-8 bg-[#f8fafc]/90">
      <SlideBackground type="timeline" />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col h-full justify-between">
        {/* Header section */}
        <div className={`mb-3 shrink-0 flex flex-col ${getAlignmentClass(titleAlign)}`}>
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
              fontSize: `${(currentSettings.titleSize || 100) * 0.01 * 1.875}rem`,
              lineHeight: currentSettings.titleLineHeight || 1.15,
              letterSpacing: `${currentSettings.titleLetterSpacing !== undefined ? currentSettings.titleLetterSpacing : 0}em`,
              textAlign: titleAlign
            }}
          >
            <span className="inline-block font-bold">
              <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {slide.title}
              </ReactMarkdown>
            </span>
          </motion.h2>
        </div>

        {/* Dynamic Column layout wrapper */}
        <div className="flex-1 min-h-0 flex items-start w-full py-2 pt-3">
          <div 
            className="grid items-stretch w-full overflow-y-auto max-h-[460px] pr-1 scrollbar-thin"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gap: `${columnGap}px`
            }}
          >
            {columns.map((col, idx) => (
              <motion.div
                key={col.id || idx}
                initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition(0.12 + idx * 0.05)}
                className="flex flex-col bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] h-full justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group"
              >
                <div>
                  {/* Top Row: Circular Icon Badge + Concept Title */}
                  <div 
                    className="flex gap-3 mb-3 select-text shrink-0"
                    style={{
                      flexDirection: contentAlign === 'right' ? 'row-reverse' : 'row',
                      alignItems: 'start'
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm"
                      style={{ 
                        backgroundColor: 'color-mix(in srgb, var(--accent-color, #3b82f6) 12%, #ffffff)',
                        borderColor: 'color-mix(in srgb, var(--accent-color, #3b82f6) 20%, transparent)'
                      }}
                    >
                      {getLucideIcon(col.icon || 'eye')}
                    </div>
                    <h3 
                      className="font-bold text-slate-800 tracking-tight leading-tight pt-1.5 select-text flex-1"
                      style={{
                        fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 1}rem`,
                        textAlign: contentAlign
                      }}
                    >
                      {col.title}
                    </h3>
                  </div>

                  {/* Graphic/Photo container if exists */}
                  {col.imageUrl && (
                    <div className="w-full h-24 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center p-1.5 mb-3 select-none shrink-0 border-b-[2px]" style={{ borderBottomColor: primaryColor }}>
                      <img 
                        src={col.imageUrl} 
                        alt={col.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Content Description */}
                  <div 
                    className="flex flex-col select-text"
                    style={{ textAlign: contentAlign }}
                  >
                    {col.description && (
                      <div 
                        className="text-slate-600 mb-2 font-medium"
                        style={{
                          fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.875}rem`,
                          lineHeight: currentSettings.contentLineHeight || 1.4,
                          letterSpacing: `${currentSettings.contentLetterSpacing !== undefined ? currentSettings.contentLetterSpacing : 0}em`
                        }}
                      >
                        <span className="inline-block">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {col.description}
                          </ReactMarkdown>
                        </span>
                      </div>
                    )}
                    
                    {col.bullets && col.bullets.length > 0 && (
                      <ul 
                        className="space-y-1 mb-2.5"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: contentAlign === 'right' ? 'flex-end' : (contentAlign === 'center' ? 'center' : 'flex-start')
                        }}
                      >
                        {col.bullets.map((bullet, bulletIdx) => (
                          <li 
                            key={bulletIdx} 
                            className="flex items-start gap-1.5 text-slate-500 font-medium"
                            style={{
                              fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.75}rem`,
                              lineHeight: currentSettings.contentLineHeight || 1.4,
                              letterSpacing: `${currentSettings.contentLetterSpacing !== undefined ? currentSettings.contentLetterSpacing : 0}em`,
                              flexDirection: contentAlign === 'right' ? 'row-reverse' : 'row'
                            }}
                          >
                            <span className="text-slate-400 font-bold shrink-0">•</span>
                            <div className="flex-1 min-w-0">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                {bullet}
                              </ReactMarkdown>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Specific Gray/Aesthetic Footer block */}
                {col.management && (
                  <div 
                    className="p-3 rounded-xl select-text mt-2.5 border shrink-0 text-left"
                    style={{ 
                      backgroundColor: 'color-mix(in srgb, var(--accent-color, #3b82f6) 5%, #f8fafc)',
                      borderColor: 'color-mix(in srgb, var(--accent-color, #3b82f6) 12%, transparent)'
                    }}
                  >
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5 font-mono">
                      Management
                    </p>
                    <div 
                      className="text-slate-600 font-semibold leading-relaxed animate-none"
                      style={{
                        fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.75}rem`
                      }}
                    >
                      <span className="inline-block">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {col.management}
                        </ReactMarkdown>
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global Keypoint alert bar at the very bottom */}
        {slide.keypoint && (
          <motion.div
            initial={disableAnimations ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={getTransition(0.3, 0.5)}
            className="rounded-xl p-3 flex items-center gap-2.5 border select-text text-left w-full h-auto mt-3 shrink-0"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--accent-color, #3b82f6) 7%, #ffffff)',
              borderColor: 'color-mix(in srgb, var(--accent-color, #3b82f6) 20%, transparent)',
            }}
          >
            <div 
               className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
               style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #3b82f6) 20%, transparent)' }}
            >
              <Info className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            </div>
            <div 
              className="font-bold tracking-tight leading-relaxed select-text" 
              style={{ 
                color: `color-mix(in srgb, ${primaryColor} 90%, #0f172a)`,
                fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.75}rem`
              }}
            >
              <span className="inline-block font-bold animate-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {slide.keypoint}
                </ReactMarkdown>
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

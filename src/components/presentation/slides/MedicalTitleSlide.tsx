import React from 'react';
import { motion } from 'motion/react';
import { MedicalTitleSlideData, SlideStyleSettings } from '../../../presentationTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Eye, Ear, FileText } from 'lucide-react';

export const MedicalTitleSlide: React.FC<{ slide: MedicalTitleSlideData, settings?: SlideStyleSettings }> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const primaryColor = currentSettings.primaryColor || 'var(--accent-color, #3b82f6)';
  const disableAnimations = currentSettings.disableAnimations || false;

  const getTransition = (delay = 0, duration = 0.6): any => {
    if (disableAnimations) return { duration: 0 };
    return { delay, duration, ease: "easeOut" };
  };

  const getCategoryIcon = (cat: string) => {
    const defaultStyle = { className: "w-6 h-6 shrink-0", style: { color: 'white' } };
    const lower = cat.toLowerCase();
    if (lower.includes('eye') || lower.includes('ophthalmology')) {
      return <Eye {...defaultStyle} />;
    }
    if (lower.includes('ent') || lower.includes('hearing') || lower.includes('ear') || lower.includes('otology')) {
      return <Ear {...defaultStyle} />;
    }
    return <FileText {...defaultStyle} />;
  };

  const titleAlign = currentSettings.titleAlignment || 'center';
  const contentAlign = currentSettings.contentAlignment || 'center';

  return (
    <div 
      className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden p-10 select-none"
      style={{
        background: `linear-gradient(to bottom, ${primaryColor}, color-mix(in srgb, ${primaryColor} 70%, #1e1e38))`
      }}
    >
      {/* Visual background element: Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-6 left-[10%] w-48 h-16 bg-white/20 blur-2xl rounded-full" />
        <div className="absolute top-10 right-[15%] w-60 h-20 bg-white/25 blur-2xl rounded-full" />
        <div className="absolute top-6 left-[45%] w-52 h-12 bg-white/15 blur-2xl rounded-full" />
        
        {/* Crisp vector cloud lookalike path drawings */}
        <div className="absolute top-[8%] left-[20%] opacity-40 scale-75">
          <svg className="w-56 h-32 text-white/10 fill-current" viewBox="0 0 100 100">
            <path d="M20,50 Q25,35 40,40 Q55,25 70,40 Q85,35 85,55 Q85,70 65,70 Q45,70 35,70 Q15,70 20,50 Z" />
          </svg>
        </div>
        <div className="absolute top-[12%] right-[22%] opacity-50 scale-75">
          <svg className="w-64 h-36 text-white/15 fill-current" viewBox="0 0 100 100">
            <path d="M20,50 Q25,30 45,35 Q60,20 75,35 Q90,30 90,55 Q90,70 70,70 Q50,70 35,70 Q15,70 20,50 Z" />
          </svg>
        </div>
        
        {/* Soft mountain/wave overlay at bottom */}
        <div className="absolute -bottom-8 left-0 right-0 h-32 bg-black/10 rounded-t-[100%]" />
      </div>

      <motion.div
        initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition(0, 0.8)}
        className={`relative z-10 flex flex-col justify-center w-full max-w-5xl`}
        style={{
          alignItems: titleAlign === 'left' ? 'flex-start' : titleAlign === 'right' ? 'flex-end' : 'center',
          textAlign: titleAlign
        }}
      >
        {/* Main Glassmorphic Capsule */}
        <div 
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-12 py-6 w-full shadow-[0_15px_40px_rgba(0,0,0,0.12)] flex flex-col"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.25)',
            boxShadow: `0 15px 40px -10px rgba(0, 0, 0, 0.3)`,
            alignItems: titleAlign === 'left' ? 'flex-start' : titleAlign === 'right' ? 'flex-end' : 'center',
          }}
        >
          <motion.h1
            initial={disableAnimations ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={getTransition(0.1, 0.6)}
            className="font-serif font-bold text-white max-w-3xl"
            style={{ 
              fontSize: `${(currentSettings.titleSize || 100) * 0.01 * 2.5}rem`,
              lineHeight: currentSettings.titleLineHeight || 1.15,
              letterSpacing: `${currentSettings.titleLetterSpacing !== undefined ? currentSettings.titleLetterSpacing : 0}em`,
              textAlign: titleAlign
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {slide.title}
            </ReactMarkdown>
          </motion.h1>
        </div>

        {/* Elegant horizontal divider line */}
        <motion.div
          initial={disableAnimations ? { scaleX: 1 } : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={getTransition(0.3, 0.8)}
          className="w-2/3 max-w-3xl h-[2px] bg-white/40 mt-4 mb-4 rounded-full shadow-sm"
        />

        {/* Optional Subtitle */}
        {slide.subtitle && (
          <motion.div
            initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getTransition(0.4, 0.6)}
            className="text-white/95 max-w-2xl drop-shadow-sm select-text"
            style={{
              fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 1.25}rem`,
              lineHeight: currentSettings.contentLineHeight || 1.4,
              letterSpacing: `${currentSettings.contentLetterSpacing !== undefined ? currentSettings.contentLetterSpacing : 0}em`,
              textAlign: contentAlign
            }}
          >
            <div className="inline-block select-text">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {slide.subtitle}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}

        {/* Brand Categories / Tags at bottom */}
        {slide.categories && slide.categories.length > 0 && (
          <motion.div
            initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getTransition(0.5, 0.7)}
            className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          >
            {slide.categories.map((cat, i) => (
              <React.Fragment key={cat}>
                {i > 0 && <span className="text-white/40 font-light text-base select-none mx-1">|</span>}
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full select-none hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white border border-white/20 shadow-inner">
                    {getCategoryIcon(cat)}
                  </div>
                  <span className="text-white font-medium text-base tracking-wide">{cat}</span>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

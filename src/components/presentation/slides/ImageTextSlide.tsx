import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ImageTextSlideData, SlideStyleSettings } from '../../../presentationTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ImageIcon } from 'lucide-react';
import { SlideBackground } from './SlideBackground';
import { ImageEditModal } from '../ImageEditModal';

export const ImageTextSlide: React.FC<{ slide: ImageTextSlideData, settings?: SlideStyleSettings, onUpdateSlide?: (data: Partial<ImageTextSlideData>) => void }> = ({ slide, settings, onUpdateSlide }) => {
  const currentSettings = settings || slide.settings || {};

  const wordCount = slide.textContent.split(/\s+/).length;
  const isShortNarrative = wordCount < 50;

  const imagePosition = currentSettings.imagePosition || slide.imagePosition || 'left';
  const isHorizontal = imagePosition === 'left' || imagePosition === 'right';
  const isReverse = imagePosition === 'right' || imagePosition === 'bottom';
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const imageSize = currentSettings.imageSize || 50;
  const contentSize = 100 - imageSize;

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const currentUrls = slide.imageUrls && slide.imageUrls.length > 0 
    ? slide.imageUrls 
    : slide.imageUrl ? [slide.imageUrl] : [];

  const handleSaveModal = (urls: string[], newSettings: Partial<SlideStyleSettings>) => {
    onUpdateSlide?.({
      imageUrl: urls.length > 0 ? urls[0] : '',
      imageUrls: urls,
      settings: { ...slide.settings, ...newSettings }
    });
  };

  const titleAlignmentClass = currentSettings.titleAlignment === 'left' ? 'items-start text-left' : 
                             currentSettings.titleAlignment === 'right' ? 'items-end text-right' : 
                             'items-center text-center';
                             
  const contentAlignmentClass = currentSettings.contentAlignment === 'left' ? 'items-start text-left' : 
                                currentSettings.contentAlignment === 'right' ? 'items-end text-right' : 
                                'items-center text-center';

  const shadowMap = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  };
 
  return (
    <div className={`flex flex-col justify-center w-full h-full mx-auto px-10 relative overflow-hidden ${contentAlignmentClass}`}>
      <SlideBackground type="image-text" />
      <ImageEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUrls={currentUrls}
        maxImages={2}
        settings={currentSettings}
        onSave={handleSaveModal}
      />
      <div className="relative z-10 flex flex-col h-full py-8 w-full">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`shrink-0 mb-6 w-full flex flex-col ${titleAlignmentClass} border-l-[10px] pl-8`}
          style={{ 
            textAlign: currentSettings.titleAlignment || 'left',
            borderColor: 'var(--accent-color, #4f46e5)'
          }}
        >
          <span className="font-black tracking-[0.4em] uppercase text-[10px] mb-2 block" style={{ color: 'var(--accent-color, #4f46e5)' }}>Visual Insight</span>
          <h2 
            className={`font-[900] text-slate-900 leading-tight tracking-tighter`}
            style={{ 
              fontSize: `${(currentSettings.titleSize || 100) * 0.01 * (isShortNarrative ? 3.5 : 2.5)}rem`,
              textAlign: currentSettings.titleAlignment || 'left',
              letterSpacing: `${(currentSettings.titleLetterSpacing || -0.05)}em`,
              lineHeight: currentSettings.titleLineHeight || 1.1
            }}
          >
            {slide.title}
          </h2>
        </motion.div>
        
        <div 
          className={`flex-1 min-h-0 flex w-full items-stretch gap-8 lg:gap-16 ${isHorizontal ? 'flex-row' : 'flex-col'} ${isReverse ? (isHorizontal ? 'flex-row-reverse' : 'flex-col-reverse') : ''}`}
        >
          <motion.div 
            initial={{ opacity: 0, x: isHorizontal ? (isReverse ? 40 : -40) : 0, y: isHorizontal ? 0 : (isReverse ? 40 : -40) }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`prose dark:prose-invert text-slate-700 h-full overflow-y-auto pr-6 scrollbar-none leading-snug markdown-content flex flex-col`}
            style={{
              flex: isHorizontal ? `${contentSize} ${contentSize} 0%` : 'none',
              width: isHorizontal ? 'auto' : '100%',
              height: isHorizontal ? '100%' : `${contentSize}%`,
              fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (isShortNarrative ? 1.25 : 1.1)}rem`,
              lineHeight: currentSettings.contentLineHeight || 1.5,
              textAlign: currentSettings.contentAlignment || 'left',
               letterSpacing: `${(currentSettings.contentLetterSpacing || 0)}em`
            }}
          >
            <div className="w-full">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {slide.textContent}
              </ReactMarkdown>
            </div>
          </motion.div>
   
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: isHorizontal ? (isReverse ? -40 : 40) : 0, y: isHorizontal ? 0 : (isReverse ? -40 : 40) }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            onClick={handleImageClick}
            className={`w-full overflow-hidden bg-slate-50 border-4 border-white ${shadowMap[currentSettings.imageShadow || '2xl']} relative group ring-1 ring-slate-200 cursor-pointer flex ${slide.imageUrls && slide.imageUrls.length > 1 ? (isHorizontal ? 'flex-col' : 'flex-row') : ''} gap-4 shrink-0`}
            style={{ 
              flex: isHorizontal ? `${imageSize} ${imageSize} 0%` : 'none',
              width: isHorizontal ? 'auto' : '100%',
              height: isHorizontal ? '100%' : `${imageSize}%`,
              minHeight: isHorizontal ? '200px' : '150px',
              borderRadius: `${(currentSettings.imageRadius ?? 56) / 2}px`,
              padding: slide.imageUrls && slide.imageUrls.length > 1 ? '0.5rem' : '0'
            }}
          >
          {slide.imageUrls && slide.imageUrls.length > 0 ? (
            slide.imageUrls.map((url, i) => (
              <div key={i} className="flex-1 relative bg-white/50 rounded-[calc(var(--radius)-8px)] overflow-hidden">
                <img src={url} alt={slide.title} className={`w-full h-full transition-transform duration-1000 group-hover:scale-[1.02] ${currentSettings.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`} />
              </div>
            ))
          ) : slide.imageUrl ? (
            <img 
               src={slide.imageUrl} 
               alt={slide.title} 
               className={`w-full h-full transition-transform duration-1000 group-hover:scale-[1.02] ${currentSettings.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center opacity-10 text-slate-900 absolute inset-0 text-center p-8">
              <ImageIcon className="w-32 h-32 mb-8" />
              <span className="font-sans md:text-2xl text-lg uppercase tracking-[0.2em] md:tracking-[0.5em] font-black underline underline-offset-8">Click to Upload (1-2)</span>
            </div>
          )}
          <div 
            className="absolute inset-0 transition-colors pointer-events-none group-hover:block hidden" 
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #4f46e5) 5%, transparent)' }}
          />
        </motion.div>
      </div>
    </div>
  </div>
  );
};

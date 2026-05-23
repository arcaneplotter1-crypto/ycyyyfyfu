import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ImageSlideData, SlideStyleSettings } from '../../../presentationTypes';
import { Image as ImageIcon, Plus } from 'lucide-react';
import { SlideBackground } from './SlideBackground';
import { ImageEditModal } from '../ImageEditModal';

interface ImageSlideProps {
  slide: ImageSlideData;
  settings?: SlideStyleSettings;
  onUpdateSlide?: (data: Partial<ImageSlideData>) => void;
}

export const ImageSlide: React.FC<ImageSlideProps> = ({ slide, settings, onUpdateSlide }) => {
  const currentSettings = settings || slide.settings || {};
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageCount = currentSettings.imageCount || 1;
  const layout = currentSettings.imageLayout || 'grid';
  const shadowMap = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  };

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
    setIsModalOpen(true);
  };

  const currentUrls = activeImageIndex !== null && slide.images?.[activeImageIndex] 
    ? [slide.images[activeImageIndex]] 
    : [];

  const handleSaveModal = (urls: string[], newSettings: Partial<SlideStyleSettings>) => {
    const newImages = [...(slide.images || [])];
    while (newImages.length < imageCount) {
      newImages.push('');
    }
    if (activeImageIndex !== null && urls.length > 0) {
      newImages[activeImageIndex] = urls[0];
    }
    onUpdateSlide?.({
      images: newImages,
      settings: { ...slide.settings, ...newSettings }
    });
  };

  const imagesToShow = Array.from({ length: imageCount }).map((_, i) => slide.images?.[i] || '');

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal': return 'flex flex-row gap-6 h-full';
      case 'vertical': return 'flex flex-col gap-6 h-full';
      case 'stacked': return 'grid grid-cols-1 gap-2 h-full';
      case 'grid':
      default:
        if (imageCount === 1) return 'flex items-center justify-center h-full';
        if (imageCount === 2) return 'grid grid-cols-2 gap-8 h-full';
        if (imageCount === 3) return 'grid grid-cols-3 gap-6 h-full';
        return 'grid grid-cols-2 grid-rows-2 gap-6 h-full';
    }
  };

  const titleAlignmentClass = currentSettings.titleAlignment === 'left' ? 'items-start text-left' : 
                             currentSettings.titleAlignment === 'right' ? 'items-end text-right' : 
                             'items-center text-center';

  return (
    <div className="flex flex-col justify-center w-full h-full mx-auto px-10 relative overflow-hidden">
      <SlideBackground type="images" />
      
      <ImageEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUrls={currentUrls}
        maxImages={1}
        settings={currentSettings}
        onSave={handleSaveModal}
      />

      {slide.title && (
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-12 w-full flex flex-col ${titleAlignmentClass} border-l-[10px] pl-8`}
          style={{ 
            textAlign: currentSettings.titleAlignment || 'left',
            borderColor: 'var(--accent-color, #4f46e5)'
          }}
        >
          <h2 
            className="text-5xl font-[900] text-slate-900 leading-tight tracking-tighter"
            style={{ 
              fontSize: `${(currentSettings.titleSize || 100) * 0.01 * 3.5}rem`,
              textAlign: currentSettings.titleAlignment || 'left',
              letterSpacing: `${(currentSettings.titleLetterSpacing || -0.05)}em`,
              lineHeight: currentSettings.titleLineHeight || 1.1
            }}
          >
            {slide.title}
          </h2>
        </motion.div>
      )}

      <div className="flex-1 w-full min-h-0 flex items-center justify-center p-4">
        <div 
          className={getLayoutClasses()} 
          style={{ width: `${currentSettings.imageSize || 100}%` }}
        >
          {imagesToShow.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleImageClick(idx)}
              className={`relative group cursor-pointer overflow-hidden bg-slate-50 border-4 border-white ${shadowMap[currentSettings.imageShadow || 'xl']} ring-1 ring-slate-200 flex-1 h-full min-h-0 transition-shadow`}
              style={{ borderRadius: `${currentSettings.imageRadius ?? 32}px` }}
            >
              {img ? (
                <img src={img} alt={`Slide Image ${idx + 1}`} className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${currentSettings.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`} />
              ) : (
                <div className="flex flex-col items-center justify-center opacity-20 text-slate-900 h-full p-4 text-center">
                  <ImageIcon className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest block">Add Image</span>
                  <div 
                    className="mt-2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #4f46e5) 10%, transparent)' }}
                  >
                    <Plus className="w-4 h-4" style={{ color: 'var(--accent-color, #4f46e5)' }} />
                  </div>
                </div>
              )}
              <div 
                className="absolute inset-0 transition-colors pointer-events-none group-hover:block hidden" 
                style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #4f46e5) 5%, transparent)' }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

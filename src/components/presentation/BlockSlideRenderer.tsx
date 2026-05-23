import React from 'react';
import { SlideData, SlideStyleSettings } from '../../presentationTypes';
import { MedicalTitleSlide } from './slides/MedicalTitleSlide';
import { MedicalContentsSlide } from './slides/MedicalContentsSlide';
import { MedicalSplitSlide } from './slides/MedicalSplitSlide';
import { MedicalColumnsSlide } from './slides/MedicalColumnsSlide';
import { BlockSlide } from './slides/BlockSlide';
import { TextSlide } from './slides/TextSlide';

interface BlockSlideRendererProps {
  slide: SlideData;
  settings?: SlideStyleSettings;
  onUpdateSlide?: (data: Partial<SlideData>) => void;
}

export const BlockSlideRenderer: React.FC<BlockSlideRendererProps> = ({ slide, settings, onUpdateSlide }) => {
  const settingsToPass = settings || slide.settings || {};
  const primaryColor = settingsToPass.primaryColor || '#4f46e5';

  const renderSlide = () => {
    switch (slide.type) {
      case 'medical-title':
        return <MedicalTitleSlide slide={slide as any} settings={settingsToPass} />;
      case 'medical-contents':
        return <MedicalContentsSlide slide={slide as any} settings={settingsToPass} />;
      case 'medical-split':
        return <MedicalSplitSlide slide={slide as any} settings={settingsToPass} />;
      case 'medical-columns':
        return <MedicalColumnsSlide slide={slide as any} settings={settingsToPass} />;
      case 'block-slide':
        return <BlockSlide slide={slide as any} settings={settingsToPass} onUpdateSlide={onUpdateSlide} />;
      default:
        // Fallback to standard TextSlide if a non-block type is supplied
        return <TextSlide slide={slide as any} settings={settingsToPass} />;
    }
  };

  return (
    <div className="w-full h-full relative group/slide-container" style={{ '--accent-color': primaryColor } as React.CSSProperties}>
      {renderSlide()}
    </div>
  );
};

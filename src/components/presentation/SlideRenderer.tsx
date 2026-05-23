import React from 'react';
import { SlideData, SlideStyleSettings } from '../../presentationTypes';
import { TitleSlide } from './slides/TitleSlide';
import { AgendaSlide } from './slides/AgendaSlide';
import { TextSlide } from './slides/TextSlide';
import { SplitTextSlide } from './slides/SplitTextSlide';
import { ImageTextSlide } from './slides/ImageTextSlide';
import { QuoteSlide } from './slides/QuoteSlide';
import { BulletSlide } from './slides/BulletSlide';
import { ImageSlide } from './slides/ImageSlide';
import { ChartSlide } from './slides/ChartSlide';
import { GridSlide } from './slides/GridSlide';
import { ProcessSlide } from './slides/ProcessSlide';
import { TimelineSlide } from './slides/TimelineSlide';
import { TeamSlide } from './slides/TeamSlide';
import { MedicalTitleSlide } from './slides/MedicalTitleSlide';
import { MedicalContentsSlide } from './slides/MedicalContentsSlide';
import { MedicalSplitSlide } from './slides/MedicalSplitSlide';
import { MedicalColumnsSlide } from './slides/MedicalColumnsSlide';
import { BlockSlide } from './slides/BlockSlide';

interface SlideRendererProps {
  slide: SlideData;
  settings?: SlideStyleSettings;
  onUpdateSlide?: (data: Partial<SlideData>) => void;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({ slide, settings, onUpdateSlide }) => {
  const settingsToPass = settings || slide.settings;
  const primaryColor = settingsToPass.primaryColor || '#4f46e5';

  const renderSlide = () => {
    switch (slide.type) {
      case 'title':
        return <TitleSlide slide={slide} settings={settingsToPass} />;
      case 'agenda':
        return <AgendaSlide slide={slide} settings={settingsToPass} />;
      case 'text':
        return <TextSlide slide={slide} settings={settingsToPass} />;
      case 'split-text':
        return <SplitTextSlide slide={slide} settings={settingsToPass} />;
      case 'image-text':
        return <ImageTextSlide slide={slide} settings={settingsToPass} onUpdateSlide={onUpdateSlide} />;
      case 'images':
        return <ImageSlide slide={slide} settings={settingsToPass} onUpdateSlide={onUpdateSlide} />;
      case 'quote':
        return <QuoteSlide slide={slide} settings={settingsToPass} />;
      case 'bullets':
        return <BulletSlide slide={slide} settings={settingsToPass} />;
      case 'chart':
        return <ChartSlide slide={slide} settings={settingsToPass} />;
      case 'grid':
        return <GridSlide slide={slide} settings={settingsToPass} />;
      case 'process':
        return <ProcessSlide slide={slide} settings={settingsToPass} />;
      case 'timeline':
        return <TimelineSlide slide={slide} settings={settingsToPass} />;
      case 'team':
        return <TeamSlide slide={slide} settings={settingsToPass} />;
      case 'medical-title':
        return <MedicalTitleSlide slide={slide as any} settings={settingsToPass} />;
      case 'medical-contents':
        return <MedicalContentsSlide slide={slide as any} settings={settingsToPass} />;
      case 'medical-split':
        return <MedicalSplitSlide slide={slide as any} settings={settingsToPass} />;
      case 'medical-columns':
        return <MedicalColumnsSlide slide={slide as any} settings={settingsToPass} />;
      case 'block-slide':
        return <BlockSlide slide={slide as any} settings={settingsToPass} />;
      default:
        return <TextSlide slide={slide as any} settings={settingsToPass} />;
    }
  };

  return (
    <div className="w-full h-full relative group/slide-container" style={{ '--accent-color': primaryColor } as React.CSSProperties}>
      {renderSlide()}
    </div>
  );
};

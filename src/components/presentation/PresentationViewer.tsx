import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { PresentationData, SlideStyleSettings } from '../../presentationTypes';
import { SlideRenderer } from './SlideRenderer';
import { ChevronLeft, ChevronRight, Maximize, Minimize, X, Settings, Save } from 'lucide-react';
import { SlideSettingsPanel } from './SlideSettingsPanel';

import { generateStandalonePresentation } from '../../utils/exportPresentationHtml';
import { pdf } from '@react-pdf/renderer';
import { PresentationPdfExport } from './PresentationPdfExport';

interface PresentationViewerProps {
  presentation: PresentationData;
  onClose: () => void;
  onUpdatePresentation?: (data: PresentationData) => void;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({ presentation, onClose, onUpdatePresentation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [slideOverrides, setSlideOverrides] = useState<Record<string, SlideStyleSettings>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const slidesCount = presentation.slides.length;

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const updatedSlides = presentation.slides.map(s => ({
        ...s,
        settings: slideOverrides[s.id] || s.settings
      }));
      const pToExport = { ...presentation, slides: updatedSlides as any };
      
      const blob = await pdf(<PresentationPdfExport presentation={pToExport} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'presentation'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimer = () => {
      setShowControls(true);
      document.body.style.cursor = 'default';
      clearTimeout(timeout);
      
      if (!showSettings) {
        timeout = setTimeout(() => {
          setShowControls(false);
          // Only hide cursor if in fullscreen mode to avoid annoyance in windowed
          if (document.fullscreenElement) {
              document.body.style.cursor = 'none';
          }
        }, 2500);
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      clearTimeout(timeout);
      document.body.style.cursor = 'default';
    };
  }, [showSettings]);

  const nextSlide = useCallback(() => {
    if (currentIndex < slidesCount - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, slidesCount]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleUpdateSlideData = (slideId: string, newData: any) => {
    if (!onUpdatePresentation) return;
    
    const updatedSlides = presentation.slides.map(s => 
      s.id === slideId ? { ...s, ...newData } : s
    );
    
    onUpdatePresentation({
      ...presentation,
      slides: updatedSlides as any
    });

    if (newData.settings && slideOverrides[slideId]) {
      setSlideOverrides(prev => ({
        ...prev,
        [slideId]: { ...prev[slideId], ...newData.settings }
      }));
    }
  };

  const handleSaveAllSettings = () => {
    if (!onUpdatePresentation) return;
    setIsSaving(true);
    
    const updatedSlides = presentation.slides.map(s => ({
      ...s,
      settings: slideOverrides[s.id] || s.settings
    }));
    
    onUpdatePresentation({
      ...presentation,
      slides: updatedSlides as any
    });

    setTimeout(() => {
      setIsSaving(false);
      setShowSettings(false);
    }, 800);
  };

  const handleExportHTML = () => {
    const updatedSlides = presentation.slides.map(s => ({
      ...s,
      settings: slideOverrides[s.id] || s.settings
    }));
    const pToExport = { ...presentation, slides: updatedSlides as any };
    const htmlContent = generateStandalonePresentation(pToExport);
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'presentation'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape' && !isFullscreen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onClose, isFullscreen]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        
        // Base resolution of slides
        const baseWidth = 1280;
        const baseHeight = 720;
        
        // On mobile, we want to leave more room for the controls
        // But we use smaller padding to maximize the slide view
        const isMobile = window.innerWidth < 768;
        const isLandscape = window.innerWidth > window.innerHeight;
        
        const paddingW = isMobile ? (isLandscape ? 10 : 10) : (!!document.fullscreenElement ? 0 : 32);
        const paddingH = isMobile ? (isLandscape ? 20 : 20) : (!!document.fullscreenElement ? 0 : 32);
        
        const availableW = Math.max(width - paddingW, 100);
        const availableH = Math.max(height - paddingH, 100);
        
        const scaleX = availableW / baseWidth;
        const scaleY = availableH / baseHeight;
        setScale(Math.max(0.1, Math.min(scaleX, scaleY)));
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Force a resize check on orientation change
    const handleOrientationChange = () => {
      setTimeout(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const baseWidth = 1280;
          const baseHeight = 720;
          const isMobile = window.innerWidth < 768;
          const isLandscape = window.innerWidth > window.innerHeight;
          const paddingW = isMobile ? (isLandscape ? 10 : 10) : (!!document.fullscreenElement ? 0 : 32);
          const paddingH = isMobile ? (isLandscape ? 20 : 20) : (!!document.fullscreenElement ? 0 : 32);
          const availableW = Math.max(rect.width - paddingW, 100);
          const availableH = Math.max(rect.height - paddingH, 100);
          const scaleX = availableW / baseWidth;
          const scaleY = availableH / baseHeight;
          setScale(Math.max(0.1, Math.min(scaleX, scaleY)));
        }
      }, 100);
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  if (!presentation || slidesCount === 0) return null;

  const currentSlide = presentation.slides[currentIndex];
  const currentSettings = slideOverrides[currentSlide.id] || currentSlide.settings || {};

  const handleUpdateSettings = (newSettings: SlideStyleSettings) => {
    setSlideOverrides(prev => ({
      ...prev,
      [currentSlide.id]: newSettings
    }));
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[200] bg-white text-slate-900' : 'relative w-full h-[85vh] h-[85dvh] landscape:h-screen md:h-[calc(100vh-140px)] min-h-[300px] md:min-h-[500px] max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white text-slate-900 border border-slate-200'}`}>
      
      {/* Top Controls */}
      <div className={`absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-[100] transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="font-bold text-indigo-600 tracking-[0.2em] text-[8px] md:text-xs uppercase truncate pr-4 drop-shadow-sm bg-white/50 backdrop-blur-md px-4 py-2 flex items-center h-8 md:h-10 rounded-full border border-slate-200/50 shadow-sm">{presentation.title}</div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${showSettings ? 'border-2 border-indigo-600 bg-indigo-50 text-indigo-600' : 'border border-slate-100 bg-white/80 backdrop-blur-md text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-lg'}`}
            title="Slide Designer"
          >
            <Settings className={`w-4 h-4 md:w-5 md:h-5 ${showSettings ? 'animate-spin-slow' : ''}`} />
          </button>
          <button 
            onClick={toggleFullscreen} 
            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border border-slate-100 bg-white/80 backdrop-blur-md text-slate-500 hover:bg-white hover:text-indigo-600 transition-all hover:shadow-lg"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          {!isFullscreen && (
            <button 
              onClick={onClose} 
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
              title="Close Presentation"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Slide Area with Scaling */}
      <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden bg-[#fafafa]">
        <div 
          className="absolute left-1/2 top-1/2 flex items-center justify-center shrink-0"
          style={{ 
            width: 1280, 
            height: 720, 
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        >
          <div className="w-full h-full relative cursor-default">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }} 
                className="w-full h-full"
              >
                <MotionConfig transition={currentSettings.disableAnimations !== false ? { duration: 0 } : undefined}>
                  <SlideRenderer 
                    slide={currentSlide} 
                    settings={currentSettings} 
                    onUpdateSlide={(data) => handleUpdateSlideData(currentSlide.id, data)}
                  />
                </MotionConfig>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Settings Overlay Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-4 md:right-8 top-16 md:top-24 w-[calc(100%-2rem)] sm:w-80 max-w-sm max-h-[calc(100%-6rem)] overflow-hidden flex flex-col bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl z-[100]"
          >
            <div className="flex-1 overflow-y-auto scrollbar-none">
              <SlideSettingsPanel 
                type={currentSlide.type} 
                settings={currentSettings} 
                onUpdate={handleUpdateSettings}
                onExport={handleExportHTML}
                onExportPdf={handleExportPdf}
                isGeneratingPdf={isGeneratingPdf}
              />
            </div>

            <div className="p-4 md:p-6 pt-3 md:pt-4 bg-white/95 backdrop-blur-sm border-t border-slate-50 shrink-0">
               <button
                onClick={handleSaveAllSettings}
                disabled={isSaving}
                className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Slide Designer
                  </>
                )}
              </button>
              <p className="text-[9px] text-slate-400 text-center mt-3 font-medium">Persists content and design changes</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className={`absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-[100] transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center gap-2 md:gap-4 bg-white/80 backdrop-blur-md px-3 md:px-5 py-2.5 rounded-full shadow-2xl border border-slate-200/60 transition-all hover:bg-white">
          <button 
            onClick={prevSlide} 
            disabled={currentIndex === 0}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 shadow-inner border border-slate-100/80 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="flex flex-col items-center justify-center min-w-[5ch]">
            <span className="text-sm md:text-base font-black text-indigo-600 tracking-widest">{currentIndex + 1}</span>
            <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest -mt-1">/ {slidesCount}</span>
          </div>
          <button 
            onClick={nextSlide} 
            disabled={currentIndex === slidesCount - 1}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 shadow-inner border border-slate-100/80 active:scale-95"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-1.5 md:h-2 bg-slate-100 z-[90] transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <motion.div 
          className="h-full bg-indigo-500 rounded-r-none"
          initial={false}
          animate={{ width: `${((currentIndex + 1) / slidesCount) * 100}%` }}
          transition={{ duration: 0.5, ease: "circOut" }}
        />
      </div>

    </div>
  );
};

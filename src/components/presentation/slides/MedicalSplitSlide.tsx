import React from 'react';
import { motion } from 'motion/react';
import { MedicalSplitSlideData, SlideStyleSettings, MedicalSplitSubCard } from '../../../presentationTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { SlideBackground } from './SlideBackground';
import { CheckCircle2, AlertCircle, Info, Flame, Zap, Shield, Heart, HelpCircle, Activity, Crosshair } from 'lucide-react';

export const MedicalSplitSlide: React.FC<{ slide: MedicalSplitSlideData, settings?: SlideStyleSettings }> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const primaryColor = currentSettings.primaryColor || 'var(--accent-color, #3b82f6)';
  const disableAnimations = currentSettings.disableAnimations || false;

  const getTransition = (delay = 0, duration = 0.4): any => {
    if (disableAnimations) return { duration: 0 };
    return { delay, duration, ease: "easeOut" };
  };

  const getLucideIcon = (name: string) => {
    const iconProps = { className: "w-4 h-4 shrink-0 mt-0.5", style: { color: primaryColor } };
    const lower = (name || '').toLowerCase();
    switch (lower) {
      case 'shield': return <Shield {...iconProps} />;
      case 'zap': return <Zap {...iconProps} />;
      case 'flame': return <Flame {...iconProps} />;
      case 'heart': return <Heart {...iconProps} />;
      case 'activity': return <Activity {...iconProps} />;
      case 'crosshair': return <Crosshair {...iconProps} />;
      case 'info': return <Info {...iconProps} />;
      default: return <CheckCircle2 {...iconProps} />;
    }
  };

  const renderRightCard = (card: MedicalSplitSubCard, index: number) => {
    const titleStyle = {
      fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.75}rem`,
      lineHeight: 1.2
    };

    const textStyle = {
      fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.875}rem`,
      lineHeight: currentSettings.contentLineHeight || 1.4,
      letterSpacing: `${currentSettings.contentLetterSpacing !== undefined ? currentSettings.contentLetterSpacing : 0}em`
    };

    switch (card.type) {
      case 'list':
        return (
          <motion.div
            key={card.id || index}
            initial={disableAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={getTransition(0.15 + index * 0.05)}
            className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow select-text text-left border-l-[3px]"
            style={{ borderLeftColor: primaryColor }}
          >
            {card.title && (
              <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono" style={titleStyle}>
                {card.title}
              </h4>
            )}
            <ul className="space-y-1">
              {(card.items || []).map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2 text-slate-700 font-medium" style={textStyle}>
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                  <div className="flex-1 min-w-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {item}
                    </ReactMarkdown>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        );

      case 'progress':
        return (
          <motion.div
            key={card.id || index}
            initial={disableAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={getTransition(0.15 + index * 0.05)}
            className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow select-text text-left border-l-[3px]"
            style={{ borderLeftColor: primaryColor }}
          >
            {card.title && (
              <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono" style={titleStyle}>
                {card.title}
              </h4>
            )}
            <div className="space-y-2">
              {(card.progressItems || []).map((pItem, pIdx) => (
                <div key={pIdx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{pItem.label}</span>
                    <span style={{ color: primaryColor }}>{pItem.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={disableAnimations ? { width: `${pItem.value}%` } : { width: 0 }}
                      animate={{ width: `${pItem.value}%` }}
                      transition={disableAnimations ? { duration: 0 } : { delay: 0.3 + pIdx * 0.05, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: primaryColor,
                        backgroundImage: `linear-gradient(90deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 70%, white))`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'icons':
        return (
          <motion.div
            key={card.id || index}
            initial={disableAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={getTransition(0.15 + index * 0.05)}
            className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow select-text text-left border-l-[3px]"
            style={{ borderLeftColor: primaryColor }}
          >
            {card.title && (
              <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono" style={titleStyle}>
                {card.title}
              </h4>
            )}
            <div className="grid grid-cols-2 gap-2">
              {(card.iconItems || []).map((iconItem, iconIdx) => (
                <div key={iconIdx} className="flex items-center gap-2 bg-slate-50 border border-slate-100/50 p-2 rounded-lg">
                  {getLucideIcon(iconItem.icon || 'check')}
                  <div className="text-slate-700 font-semibold select-text flex-1 min-w-0" style={textStyle}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {iconItem.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'keypoint':
        return (
          <motion.div
            key={card.id || index}
            initial={disableAnimations ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={getTransition(0.15 + index * 0.05)}
            className="rounded-xl p-3 flex items-start gap-2.5 border text-left select-text"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--accent-color, #3b82f6) 7%, #fbfcff)',
              borderColor: 'color-mix(in srgb, var(--accent-color, #3b82f6) 20%, transparent)',
            }}
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color, #3b82f6) 20%, transparent)' }}
            >
              <Info className="w-4 h-4" style={{ color: primaryColor }} />
            </div>
            <div className="font-semibold leading-relaxed" style={{ ...textStyle, color: `color-mix(in srgb, ${primaryColor} 90%, #0f172a)` }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {card.text || ''}
              </ReactMarkdown>
            </div>
          </motion.div>
        );

      case 'text':
      default:
        return (
          <motion.div
            key={card.id || index}
            initial={disableAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={getTransition(0.15 + index * 0.05)}
            className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow select-text text-left border-l-[3px]"
            style={{ borderLeftColor: primaryColor }}
          >
            {card.title && (
              <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono" style={titleStyle}>
                {card.title}
              </h4>
            )}
            <div className="text-slate-600 font-medium leading-relaxed animate-none" style={textStyle}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {card.text || ''}
              </ReactMarkdown>
            </div>
          </motion.div>
        );
    }
  };

  const titleAlign = currentSettings.titleAlignment || 'left';
  const getAlignmentClass = (align: string) => {
    switch (align) {
      case 'center': return 'items-center text-center mx-auto w-full';
      case 'right': return 'items-end text-right ml-auto w-full';
      case 'left':
      default: return 'items-start text-left mr-auto w-full';
    }
  };

  // Dedicated layout widths
  const leftWidth = currentSettings.splitRatio !== undefined ? currentSettings.splitRatio : 41.67;
  const rightWidth = 100 - leftWidth;
  const columnGap = currentSettings.columnGap !== undefined ? currentSettings.columnGap : 24;

  return (
    <div className="flex flex-col w-full h-full justify-start relative overflow-hidden p-8 bg-[#f8fafc]/90">
      <SlideBackground type="split-text" />
      
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

        {/* Double unequal column layout */}
        <div className="flex-1 min-h-0 flex items-start w-full py-2 pt-3">
          <div 
            className="flex items-stretch w-full overflow-hidden max-h-[480px]"
            style={{ gap: `${columnGap}px` }}
          >
            {/* Left Column: Visual Illustration Card */}
            <motion.div
              initial={disableAnimations ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={getTransition(0.12)}
              className="flex flex-col bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)] h-full justify-between hover:shadow-md transition-all duration-300"
              style={{ width: `${leftWidth}%`, flexShrink: 0 }}
            >
              {slide.leftCard.title && (
                <h3 
                  className="font-black tracking-tight text-slate-800 text-center mb-1.5 font-serif shrink-0 text-base"
                  style={{
                    fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 1}rem`
                  }}
                >
                  {slide.leftCard.title}
                </h3>
              )}
              
              {/* Main graphic container */}
              <div className="w-full h-52 min-h-0 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center p-2.5 select-none flex-1">
                <img 
                  src={slide.leftCard.imageUrl} 
                  alt={slide.leftCard.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain mix-blend-multiply hover:scale-102 transition-transform duration-500"
                />
                
                {/* Optional tiny medical brand tag simulation */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-slate-200/50 rounded text-[9px] font-bold text-slate-400 select-none font-mono">
                  AO
                </div>
              </div>

              {slide.leftCard.caption && (
                <p className="text-xs font-semibold text-slate-500 text-center mt-2 italic shrink-0">
                  {slide.leftCard.caption}
                </p>
              )}
            </motion.div>

            {/* Right Column: Information/Detail Card List Stack */}
            <div 
              className="flex flex-col justify-start space-y-3 overflow-y-auto max-h-[480px] pr-1 scrollbar-thin"
              style={{ width: `${rightWidth}%`, flexGrow: 1 }}
            >
              {(slide.rightCards || []).map((card, idx) => renderRightCard(card, idx))}
            </div>
          </div>
        </div>

        {/* Decorative gap block at bottom */}
        <div className="h-2 select-none shrink-0" />
      </div>
    </div>
  );
};

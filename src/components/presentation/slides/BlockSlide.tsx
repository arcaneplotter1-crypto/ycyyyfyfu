import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { BlockSlideData, SlideStyleSettings, BlockSlideBlock } from '../../../presentationTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { SlideBackground } from './SlideBackground';
import { 
  Eye, 
  Ear, 
  Shield, 
  Heart, 
  Activity, 
  Zap, 
  Play, 
  Info, 
  HelpCircle, 
  Check, 
  AlertTriangle, 
  List, 
  TrendingUp, 
  Cpu,
  BookOpen,
  CheckCircle2,
  Lock,
  Search,
  CheckSquare,
  Maximize2,
  Minimize2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';

interface BlockSlideProps {
  slide: BlockSlideData;
  settings?: SlideStyleSettings;
  onUpdateSlide?: (data: Partial<BlockSlideData>) => void;
}

export const BlockSlide: React.FC<BlockSlideProps> = ({ slide, settings, onUpdateSlide }) => {
  const currentSettings = settings || slide.settings || {};
  const primaryColor = currentSettings.primaryColor || 'var(--accent-color, #4f46e5)';
  const disableAnimations = currentSettings.disableAnimations || false;

  const theme = currentSettings.slideTheme || 'modern';
  const baseMixBg = (theme === 'terminal' || theme === 'cyberpunk') ? '#000000' :
                    theme === 'midnight' ? '#070912' :
                    theme === 'academic' ? '#fdf6e3' : '#ffffff';
  
  const textMixBase = (theme === 'terminal' || theme === 'cyberpunk' || theme === 'midnight') ? '#ffffff' : '#0f172a';

  // D3 dragging state and refs to support long click to drag reorder
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const startCoordsRef = useRef({ x: 0, y: 0 });
  const longPressTimeoutRef = useRef<any>(null);
  const isLongPressingRef = useRef(false);
  const blockElementsRef = useRef<Record<string, HTMLDivElement>>({});

  const { blocks = [] } = slide;

  // Separate blocks by type
  const keypointBlocks = blocks.filter(b => b.type === 'keypoint');
  const photoBlocks = blocks.filter(b => b.type === 'photo');
  const mainBlocks = blocks.filter(b => b.type !== 'keypoint' && b.type !== 'photo');
  const contentBlocks = blocks.filter(b => b.type !== 'keypoint');

  const hasPhoto = photoBlocks.length > 0;
  const totalBlocks = contentBlocks.length;
  const blockLayout = currentSettings.blockLayout || (hasPhoto ? 'split' : totalBlocks >= 4 ? 'grid' : 'horizontal');

  // Latest props ref to avoid stale closures in D3 handlers
  const latestPropsRef = useRef({ blocks, onUpdateSlide });
  useEffect(() => {
    latestPropsRef.current = { blocks, onUpdateSlide };
  }, [blocks, onUpdateSlide]);

  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
    };
  }, []);

  const bindDrag = (element: HTMLDivElement, blockId: string) => {
    if (element.dataset.dragBound === 'true') return;
    element.dataset.dragBound = 'true';

    d3.select(element).call(
      d3.drag<HTMLDivElement, any>()
        .on('start', function(event) {
          const sourceEvent = event.sourceEvent;
          sourceEvent.stopPropagation();
          
          const clientX = sourceEvent.touches?.[0]?.clientX ?? sourceEvent.clientX;
          const clientY = sourceEvent.touches?.[0]?.clientY ?? sourceEvent.clientY;
          
          startCoordsRef.current = { x: clientX, y: clientY };
          isLongPressingRef.current = false;
          
          if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
          
          longPressTimeoutRef.current = setTimeout(() => {
            isLongPressingRef.current = true;
            setDraggingBlockId(blockId);
            setDragOffset({ x: 0, y: 0 });
            
            if (navigator.vibrate) {
              try { navigator.vibrate(40); } catch (_) {}
            }
          }, 320);
        })
        .on('drag', function(event) {
          const sourceEvent = event.sourceEvent;
          sourceEvent.stopPropagation();
          
          const clientX = sourceEvent.touches?.[0]?.clientX ?? sourceEvent.clientX;
          const clientY = sourceEvent.touches?.[0]?.clientY ?? sourceEvent.clientY;
          
          if (!isLongPressingRef.current) {
            const dx = clientX - startCoordsRef.current.x;
            const dy = clientY - startCoordsRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 8) {
              if (longPressTimeoutRef.current) {
                clearTimeout(longPressTimeoutRef.current);
                longPressTimeoutRef.current = null;
              }
            }
            return;
          }
          
          setDragOffset(prev => ({
            x: prev.x + event.dx,
            y: prev.y + event.dy
          }));

          if (clientX && clientY) {
            const { blocks: currentBlocks, onUpdateSlide: updateFn } = latestPropsRef.current;
            let updated = [...currentBlocks];
            let changed = false;

            // 1. Cross-column layouts swapping when there is a photo block in split layout
            const dragContainer = element.closest('.grid-cols-12') || element.closest('.grid') || element.closest('.w-full') || element.parentElement;
            if (dragContainer && blockLayout === 'split') {
              const rect = dragContainer.getBoundingClientRect();
              const midpointX = rect.left + rect.width / 2;
              const isPointerOnLeftHalf = clientX < midpointX;

              const draggedBlock = currentBlocks.find(b => b.id === blockId);
              const activePhotoIndex = updated.findIndex(b => b.type === 'photo');

              if (activePhotoIndex !== -1 && draggedBlock) {
                const activePhoto = updated[activePhotoIndex];
                const isPhotoDrag = draggedBlock.type === 'photo';

                // Determine target position for photo block based on horizontal cursor placement
                let newPos: 'left' | 'right' = 'right';
                if (isPhotoDrag) {
                  newPos = isPointerOnLeftHalf ? 'left' : 'right';
                } else {
                  newPos = isPointerOnLeftHalf ? 'right' : 'left';
                }

                if (activePhoto.position !== newPos) {
                  updated[activePhotoIndex] = {
                    ...activePhoto,
                    position: newPos
                  };
                  changed = true;
                }
              }
            }

            // 2. Standard drag reorder index swapping within target elements
            const hoveredEl = document.elementFromPoint(clientX, clientY);
            const cardParent = hoveredEl?.closest('[data-block-id]');
            if (cardParent) {
              const targetId = cardParent.getAttribute('data-block-id');
              if (targetId && targetId !== blockId) {
                const draggedIdx = updated.findIndex(b => b.id === blockId);
                const targetIdx = updated.findIndex(b => b.id === targetId);

                if (draggedIdx !== -1 && targetIdx !== -1) {
                  const [item] = updated.splice(draggedIdx, 1);
                  updated.splice(targetIdx, 0, item);
                  changed = true;
                }
              }
            }

            if (changed && updateFn) {
              updateFn({ blocks: updated });
            }
          }
        })
        .on('end', function(event) {
          event.sourceEvent.stopPropagation();
          
          if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
          }
          
          if (isLongPressingRef.current) {
            setDraggingBlockId(null);
            setDragOffset({ x: 0, y: 0 });
            isLongPressingRef.current = false;
          }
        })
    );
  };

  const blockRefCallback = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      blockElementsRef.current[id] = el;
      bindDrag(el, id);
    } else {
      delete blockElementsRef.current[id];
    }
  };
  
  // Interactive state: track hovered/selected block for immersive magnification & feedback
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // States & handlers for drag and drop image uploading
  const [isDraggingMap, setIsDraggingMap] = useState<Record<string, boolean>>({});

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setIsDraggingMap(prev => ({ ...prev, [id]: true }));
  };

  const handleDragLeave = (id: string) => {
    setIsDraggingMap(prev => ({ ...prev, [id]: false }));
  };

  const handleFileProcess = (file: File, id: string) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      if (onUpdateSlide) {
        const updatedBlocks = (slide.blocks || []).map(b => 
          b.id === id ? { ...b, imageUrl: dataUri } : b
        );
        onUpdateSlide({ blocks: updatedBlocks });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setIsDraggingMap(prev => ({ ...prev, [id]: false }));
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileProcess(files[0], id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0], id);
    }
  };

  const handleClearImage = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onUpdateSlide) {
      const updatedBlocks = (slide.blocks || []).map(b => 
        b.id === id ? { ...b, imageUrl: '' } : b
      );
      onUpdateSlide({ blocks: updatedBlocks });
    }
  };

  const getTransition = (delay = 0, duration = 0.45): any => {
    if (disableAnimations) return { duration: 0 };
    return { delay, duration, ease: [0.22, 1, 0.36, 1] };
  };

  const getBlockColor = (index: number, manualColor?: string) => {
    if (manualColor) return manualColor;
    const step = index % 4;
    switch (step) {
      case 0:
        return primaryColor;
      case 1:
        return `color-mix(in srgb, ${primaryColor} 82%, #000000)`;
      case 2:
        return `color-mix(in srgb, ${primaryColor} 66%, #000000)`;
      case 3:
      default:
        return `color-mix(in srgb, ${primaryColor} 50%, #000000)`;
    }
  };

  const getLucideIcon = (name?: string, fallback = 'info') => {
    const iconProps = { className: "w-4 h-4 sm:w-[18px] sm:h-[18px]", style: { color: primaryColor } };
    const lower = (name || fallback || '').toLowerCase().trim();
    switch (lower) {
      case 'eye': return <Eye {...iconProps} />;
      case 'ear': return <Ear {...iconProps} />;
      case 'shield': return <Shield {...iconProps} />;
      case 'heart': return <Heart {...iconProps} />;
      case 'activity': return <Activity {...iconProps} />;
      case 'zap': return <Zap {...iconProps} />;
      case 'play': return <Play {...iconProps} />;
      case 'info': return <Info {...iconProps} />;
      case 'check': return <Check {...iconProps} />;
      case 'alert':
      case 'alerttriangle':
      case 'warning': return <AlertTriangle {...iconProps} />;
      case 'list': return <List {...iconProps} />;
      case 'trending':
      case 'trend':
      case 'trendingup': return <TrendingUp {...iconProps} />;
      case 'cpu':
      case 'tech': return <Cpu {...iconProps} />;
      case 'book': return <BookOpen {...iconProps} />;
      case 'search': return <Search {...iconProps} />;
      case 'lock': return <Lock {...iconProps} />;
      case 'checksquare':
      case 'tick': return <CheckSquare {...iconProps} />;
      default: return <Info {...iconProps} />;
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

  // Dynamic weight scoring to size blocks relative to their actual content weight
  const getBlockWeight = (block: BlockSlideBlock) => {
    let score = 1.0;
    
    // Title contribution
    if (block.title) {
      score += (block.title.length * 0.03);
    }
    
    // Main text description contribution
    if (block.text) {
      score += (block.text.length * 0.01);
    }
    
    // Bullet/List items contribution
    if (block.type === 'list' && block.bullets && block.bullets.length > 0) {
      score += block.bullets.length * 0.4;
      block.bullets.forEach(bullet => {
        score += ((bullet || '').length * 0.006);
      });
    }
    
    // Progress items contribution
    if (block.type === 'progress' && block.progressItems && block.progressItems.length > 0) {
      score += block.progressItems.length * 0.5;
    }
    
    // Icon grid items contribution
    if (block.type === 'icons' && block.iconItems && block.iconItems.length > 0) {
      score += block.iconItems.length * 0.35;
    }

    // Comparison contribution
    if (block.type === 'comparison') {
      score += 0.8;
      if (block.pros && block.pros.length > 0) {
        score += block.pros.length * 0.35;
      }
      if (block.cons && block.cons.length > 0) {
        score += block.cons.length * 0.35;
      }
    }

    // Timeline contribution
    if (block.type === 'timeline' && block.timelineItems && block.timelineItems.length > 0) {
      score += block.timelineItems.length * 0.5;
      block.timelineItems.forEach(item => {
        score += ((item.title || '').length + (item.description || '').length) * 0.005;
      });
    }

    // Media Column Split contribution
    if (block.type === 'mediaSplit') {
      score += 1.2;
      if (block.bullets && block.bullets.length > 0) {
        score += block.bullets.length * 0.3;
      }
    }
    
    return Math.max(1.0, score);
  };

  // Render Card Block Content
  const renderBlockContent = (block: BlockSlideBlock, cardIdx: number, weight = 1.0) => {
    const cardTitle = block.title || '';
    const cardText = block.text || '';
    const isHovered = activeBlockId === block.id;
    const theme = currentSettings.slideTheme || 'modern';
    
    const renderBulletMarker = (color: string) => {
      if (theme === 'terminal') {
        return (
          <span className="shrink-0 font-mono font-black select-none mr-1" style={{ color: '#00ff00', marginTop: '0.15em' }}>
            &gt;
          </span>
        );
      }
      if (theme === 'cyberpunk') {
        return (
          <span className="shrink-0 bg-cyan-400 rotate-45 mr-1" style={{ width: '0.36em', height: '0.36em', marginTop: '0.55em', boxShadow: '0 0 5px rgba(6, 182, 212, 0.7)' }} />
        );
      }
      if (theme === 'academic') {
        return (
          <span className="shrink-0 font-serif font-black select-none text-[#4c3d31] mr-1" style={{ fontSize: '0.9em', marginTop: '0.22em' }}>
            —
          </span>
        );
      }
      if (theme === 'clinical') {
        return (
          <span className="shrink-0 rounded-sm bg-rose-500 mr-1" style={{ width: '0.4em', height: '0.4em', marginTop: '0.55em' }} />
        );
      }
      // Default
      return (
        <span className="rounded-full shrink-0" style={{ width: '0.42em', height: '0.42em', marginTop: '0.55em', backgroundColor: color }} />
      );
    };

    // Optimize line-clamp and paddings dynamically relative to content density
    const isHighDensity = totalBlocks >= 3;
    
    return (
      <div className="flex flex-col h-full justify-center select-text text-left relative z-10 w-full min-h-0">
        <div className="min-h-0 flex flex-col justify-center">
          {/* Header row with numerical prefix badge or custom icon */}
          <div className="flex items-center justify-between gap-3 mb-1.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <motion.div 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm font-mono text-xs font-black transition-colors"
                animate={{
                  scale: isHovered ? 1.08 : 1,
                  rotate: isHovered ? [0, -3, 3, 0] : 0
                }}
                transition={{ duration: 0.3 }}
                style={{ 
                  backgroundColor: isHovered ? primaryColor : `color-mix(in srgb, var(--accent-color, ${primaryColor}) 8%, ${baseMixBg})`,
                  borderColor: isHovered ? primaryColor : `color-mix(in srgb, var(--accent-color, ${primaryColor}) 18%, transparent)`,
                  color: isHovered ? '#ffffff' : primaryColor
                }}
              >
                {block.icon ? getLucideIcon(block.icon) : (
                  <span className="font-extrabold" style={{ color: isHovered ? '#fff' : primaryColor }}>
                    {String(cardIdx + 1).padStart(2, '0')}
                  </span>
                )}
              </motion.div>
              
              {cardTitle && (
                <h3 
                  className="font-extrabold text-slate-900 tracking-tight leading-snug pt-0.5 flex-1 text-sm sm:text-base border-b-2 border-transparent hover:border-indigo-100 transition-colors"
                  style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (isHighDensity ? 0.90 : 0.94)}rem` }}
                >
                  {cardTitle}
                </h3>
              )}
            </div>
          </div>

          {/* Description Text Area with elegant line-height and contrast */}
          {cardText && (
            <div 
              className={`text-slate-600 mb-1.5 font-medium leading-relaxed leading-normal markdown-inline transition-all duration-300 min-h-0 ${
                block.type === 'textbox' 
                  ? 'overflow-y-auto max-h-[160px] pr-1' 
                  : (isHighDensity ? 'line-clamp-2 hover:line-clamp-none' : 'line-clamp-3 hover:line-clamp-none')
              }`}
              style={{ 
                fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (block.type === 'textbox' ? 0.82 : (isHighDensity ? 0.76 : 0.8))}rem` 
              }}
            >
              <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {cardText}
              </ReactMarkdown>
            </div>
          )}

          {/* Inline elements: dynamic list */}
          {block.type === 'list' && block.bullets && block.bullets.length > 0 && (
            <ul className="space-y-1 my-1 shrink-0">
              {block.bullets.slice(0, isHighDensity ? 4 : 5).map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-slate-600 font-semibold markdown-inline" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.74}rem` }}>
                  {renderBulletMarker(primaryColor)}
                  <span className="flex-1 min-w-0">
                    <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {bullet}
                    </ReactMarkdown>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Inline elements: interactive progress bar */}
          {block.type === 'progress' && block.progressItems && block.progressItems.length > 0 && (
            <div className="space-y-1.5 my-1 sm:my-1.5 shrink-0">
              {block.progressItems.map((prog, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-600 uppercase tracking-wider" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.64}rem` }}>
                    <span>{prog.label}</span>
                    <span style={{ color: primaryColor }}>{prog.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-200/55 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: primaryColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${prog.value}%` }}
                      transition={{ duration: 0.9, delay: 0.2 + idx * 0.08 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline elements: mini icons items */}
          {block.type === 'icons' && block.iconItems && block.iconItems.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 my-1 shrink-0">
              {block.iconItems.map((item, idx) => (
                <div key={idx} className={`flex items-center gap-1.5 p-1 rounded-lg transition-colors border ${
                  theme === 'terminal' ? 'border-[#0f0]/30 bg-black hover:bg-[#0f0]/5' :
                  theme === 'cyberpunk' ? 'border-[#ff007f]/40 bg-black hover:bg-[#ff007f]/10' :
                  theme === 'midnight' ? 'border-indigo-900/40 bg-slate-950/40 hover:bg-indigo-950/20' :
                  theme === 'academic' ? 'border-[#e4dcbf] bg-[#fcf9f2] hover:bg-[#fff]' :
                  theme === 'clinical' ? 'border-teal-100/60 bg-teal-50/10 hover:bg-teal-50/20' :
                  'border-slate-100/80 bg-slate-50/50 hover:bg-slate-50'
                }`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center border shadow-xs shrink-0 ${
                    theme === 'terminal' ? 'bg-black border-[#0f0]/40' :
                    theme === 'cyberpunk' ? 'bg-black border-[#ff007f]/40' :
                    theme === 'midnight' ? 'bg-indigo-950/40 border-indigo-900/30' :
                    theme === 'academic' ? 'bg-[#fff] border-[#e4dcbf]' :
                    theme === 'clinical' ? 'bg-white border-teal-100/60' :
                    'bg-white border-slate-200'
                  }`}>
                    {getLucideIcon(item.icon, 'activity')}
                  </div>
                  <span className={`font-bold truncate ${
                    theme === 'terminal' ? 'text-[#0f0]' :
                    theme === 'cyberpunk' ? 'text-[#0ff]' :
                    theme === 'midnight' ? 'text-indigo-200' :
                    theme === 'academic' ? 'text-[#4c3d31]' :
                    theme === 'clinical' ? 'text-teal-950' :
                    'text-slate-700'
                  }`} style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.7}rem` }}>{item.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Inline elements: comparison pros/cons side-by-side splits */}
          {block.type === 'comparison' && (
            <div className="grid grid-cols-2 gap-3.5 my-1.5 shrink-0 min-h-0 overflow-hidden">
              {/* Pros Component Card in Emerald Theme */}
              <div className="border border-emerald-100 bg-emerald-50/20 rounded-xl p-2.5 flex flex-col justify-between">
                <div>
                  <h4 className="font-black uppercase tracking-wide text-emerald-700 flex items-center gap-1.5 mb-2" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.74}rem` }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="truncate">{block.prosTitle || 'Benefits'}</span>
                  </h4>
                  <ul className="space-y-1 min-w-0">
                    {(block.pros || []).slice(0, isHighDensity ? 3 : 4).map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-700 font-semibold leading-normal markdown-inline" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.7}rem` }}>
                        <span className="text-emerald-500 shrink-0" style={{ marginTop: '0.15em' }}>
                          <CheckCircle2 style={{ width: '1em', height: '1em' }} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {pro}
                          </ReactMarkdown>
                        </span>
                      </li>
                    ))}
                    {(!block.pros || block.pros.length === 0) && (
                      <span className="italic font-medium text-slate-400" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.64}rem` }}>None configured</span>
                    )}
                  </ul>
                </div>
              </div>

              {/* Cons Component Card in Rose Theme */}
              <div className="border border-rose-100 bg-rose-50/20 rounded-xl p-2.5 flex flex-col justify-between">
                <div>
                  <h4 className="font-black uppercase tracking-wide text-rose-700 flex items-center gap-1.5 mb-2" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.74}rem` }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="truncate">{block.consTitle || 'Side Effects'}</span>
                  </h4>
                  <ul className="space-y-1 min-w-0">
                    {(block.cons || []).slice(0, isHighDensity ? 3 : 4).map((con, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-700 font-semibold leading-normal markdown-inline" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.7}rem` }}>
                        <span className="text-rose-500 shrink-0" style={{ marginTop: '0.15em' }}>
                          <AlertTriangle style={{ width: '1em', height: '1em' }} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {con}
                          </ReactMarkdown>
                        </span>
                      </li>
                    ))}
                    {(!block.cons || block.cons.length === 0) && (
                      <span className="italic font-medium text-slate-400" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.64}rem` }}>None configured</span>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Inline elements: timeline chronological steps */}
          {block.type === 'timeline' && block.timelineItems && block.timelineItems.length > 0 && (
            <div className="relative pl-3.5 py-1.5 my-1.5 space-y-3 shrink-0">
              {/* Vertical accent vector */}
              <div 
                className="absolute left-[7px] top-2 bottom-2 w-[1.5px] opacity-35 bg-indigo-200"
                style={{ backgroundColor: primaryColor }}
              />
              
              {block.timelineItems.slice(0, isHighDensity ? 3 : 4).map((item, idx) => (
                <div key={idx} className="relative group/step min-w-0">
                  {/* Circular step tracker */}
                  <div 
                    className="absolute rounded-full border border-white flex items-center justify-center shadow-xs transition-transform group-hover/step:scale-125 z-10"
                    style={{ 
                      backgroundColor: primaryColor,
                      fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.74}rem`,
                      width: '0.52em',
                      height: '0.52em',
                      top: '0.28em',
                      left: '-11px'
                    }}
                  />
                  
                  <div className="space-y-0.5 pl-2.5">
                    <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-slate-900 leading-none" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.74}rem` }}>{item.title}</h4>
                      {item.date && (
                        <span 
                          className={`font-mono font-black px-1 rounded uppercase tracking-wider border ${
                            theme === 'terminal' ? 'bg-black border-[#0f0]/40 text-[#0f0]' :
                            theme === 'cyberpunk' ? 'bg-black border-[#ff007f]/40 text-[#ff007f]' :
                            theme === 'midnight' ? 'bg-slate-950/50 border-indigo-900/40 text-indigo-300' :
                            theme === 'academic' ? 'bg-[#f4efe0] border-[#dcd3b6] text-[#5c432d]' :
                            'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200'
                          }`}
                          style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.58}rem` }}
                        >
                          {item.date}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-slate-500 font-semibold leading-relaxed markdown-inline" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.66}rem` }}>
                        <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {item.description}
                        </ReactMarkdown>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline elements: Media Column Split (Photo + Text Matrix) */}
          {block.type === 'mediaSplit' && (
            <div className="grid grid-cols-2 gap-3.5 my-1.5 shrink-0 min-h-0 overflow-hidden items-stretch">
              {/* Media Column illustration layout block */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center p-1.5 min-h-[90px] group/media">
                {block.imageUrl ? (
                  <img 
                    src={block.imageUrl} 
                    alt={block.title || "Visual matrix correlation tool"} 
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[140px] w-auto h-auto object-contain rounded-lg shadow-xs"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-2.5 text-center h-full">
                    <ImageIcon className="w-5 h-5 mb-1 text-slate-300" />
                    <span className="font-extrabold text-slate-400 leading-tight uppercase tracking-wider" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.62}rem` }}>No Image</span>
                  </div>
                )}
                {/* Image upload interactive layer */}
                {onUpdateSlide && (
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <label
                      htmlFor={`media-split-upload-${block.id || cardIdx}`}
                      className="bg-white/95 p-1.5 rounded-full shadow-lg text-indigo-600 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Upload Image"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      id={`media-split-upload-${block.id || cardIdx}`}
                      className="hidden"
                      onChange={(e) => handleFileChange(e, block.id || String(cardIdx))}
                    />
                    {block.imageUrl && (
                      <button
                        type="button"
                        onClick={(e) => handleClearImage(e, block.id || String(cardIdx))}
                        className="bg-white/95 p-1.5 rounded-full shadow-lg text-red-600 hover:scale-110 active:scale-95 transition-all"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Checklist / descriptive matrix text area */}
              <div className="flex flex-col justify-center min-w-0 px-1">
                {block.bullets && block.bullets.length > 0 ? (
                  <ul className="space-y-1.5 min-w-0">
                    {block.bullets.slice(0, isHighDensity ? 3 : 4).map((bullet, listIdx) => (
                      <li key={listIdx} className="flex items-start gap-1.5 text-slate-700 font-semibold leading-normal markdown-inline" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.72}rem` }}>
                        {renderBulletMarker(primaryColor)}
                        <span className="flex-1 min-w-0 leading-relaxed">
                          <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {bullet}
                          </ReactMarkdown>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 font-semibold leading-relaxed markdown-inline" style={{ fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 0.74}rem` }}>
                    <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {block.text || 'Add descriptive matrix points or item bullet lists here.'}
                    </ReactMarkdown>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render a single slide block (either container/textbox or photo) based on its type
  const renderSlideBlockElement = (block: BlockSlideBlock, idx: number, options?: { forceWeight?: number }) => {
    const bColor = getBlockColor(idx, block.color);
    const weight = options?.forceWeight ?? getBlockWeight(block);
    
    if (block.type === 'photo') {
      const isPlaceholder = !block.imageUrl;
      const isDragging = !!isDraggingMap[block.id || idx];
      
      return (
        <motion.div
          key={block.id || idx}
          ref={blockRefCallback(block.id)}
          data-block-id={block.id}
          initial={disableAnimations ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={getTransition(0.1 + idx * 0.05)}
          className={`group relative flex flex-col bg-white border rounded-2xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.035)] h-full justify-between overflow-hidden ${
            isPlaceholder ? 'border-dashed border-slate-300' : 'border-slate-150/70'
          }`}
          onDragOver={(e) => handleDragOver(e, block.id || String(idx))}
          onDragLeave={() => handleDragLeave(block.id || String(idx))}
          onDrop={(e) => handleDrop(e, block.id || String(idx))}
          style={{
            borderLeftColor: draggingBlockId === block.id ? bColor : undefined,
            borderTopColor: draggingBlockId === block.id ? bColor : bColor,
            borderRightColor: draggingBlockId === block.id ? bColor : undefined,
            borderBottomColor: draggingBlockId === block.id ? bColor : undefined,
            flex: `${weight} ${weight} auto`,
            transform: draggingBlockId === block.id ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04)` : 'none',
            zIndex: draggingBlockId === block.id ? 100 : 1,
            cursor: draggingBlockId === block.id ? 'grabbing' : draggingBlockId ? 'default' : 'grab',
            boxShadow: draggingBlockId === block.id ? `0 20px 25px -5px ${primaryColor}30, 0 8px 10px -6px ${primaryColor}30` : undefined,
            touchAction: 'none'
          }}
        >
          <input
            type="file"
            accept="image/*"
            id={`file-upload-${block.id || idx}`}
            className="hidden"
            onChange={(e) => handleFileChange(e, block.id || String(idx))}
          />

          {isPlaceholder ? (
            <label
              htmlFor={`file-upload-${block.id || idx}`}
              className={`w-full flex-1 border-2 border-dashed rounded-xl overflow-hidden relative flex flex-col items-center justify-center p-4 min-h-0 transition-all duration-200 cursor-pointer ${
                isDragging 
                  ? 'border-indigo-400 bg-indigo-50/40 text-indigo-500 shadow-inner' 
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-300 text-slate-400'
              }`}
            >
              <div className={`p-3 rounded-full mb-2 bg-white shadow-xs border transition-transform duration-200 group-hover:scale-105 ${
                isDragging ? 'border-indigo-200 text-indigo-500' : 'border-slate-100 text-slate-400'
              }`}>
                <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-700 tracking-tight text-center">
                Upload Media File
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1 text-center font-mono">
                Drag & Drop or Click to Browse
              </span>
            </label>
          ) : (
            <div className="w-full flex-1 bg-slate-50 border border-slate-100/80 rounded-xl overflow-hidden relative flex items-center justify-center p-1 min-h-0">
              <img 
                src={block.imageUrl} 
                alt={block.title || "Uploaded View"} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-lg"
              />
              
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setFullscreenImage(block.imageUrl || '')}
                  className="bg-white/95 p-2 rounded-full shadow-lg text-slate-800 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Zoom In"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                {onUpdateSlide && (
                  <label
                    htmlFor={`file-upload-${block.id || idx}`}
                    className="bg-white/95 p-2 rounded-full shadow-lg text-indigo-600 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    title="Replace Image"
                  >
                    <Upload className="w-4 h-4" />
                  </label>
                )}
                {onUpdateSlide && (
                  <button
                    type="button"
                    onClick={(e) => handleClearImage(e, block.id || String(idx))}
                    className="bg-white/95 p-2 rounded-full shadow-lg text-red-600 hover:scale-110 active:scale-95 transition-all"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {(block.title || block.caption) && (
            <div className="mt-1.5 text-center px-1 shrink-0">
               {block.title && <h4 className="font-extrabold text-slate-800 text-xs tracking-tight line-clamp-1">{block.title}</h4>}
              {block.caption && <p className="text-[10px] text-slate-500 font-semibold line-clamp-1 mt-0.5">{block.caption}</p>}
            </div>
          )}
        </motion.div>
      );
    }

    // Normal non-photo blocks (container/textbox)
    const isScaledUp = (currentSettings.contentSize || 100) > 115;
    const padClass = isScaledUp 
      ? (weight > 2.5 ? 'p-2 sm:p-2.5' : 'p-2.5 sm:p-3') 
      : (weight > 2.5 ? 'p-3' : 'p-4');

    const theme = currentSettings.slideTheme || 'modern';
    let cardClass = "";
    let cardStyleOverride: React.CSSProperties = {};
    
    if (theme === 'terminal') {
      cardClass = `bg-black border border-[#00ff00] rounded-none ${padClass} pt-6 flex flex-col justify-center min-h-0 relative overflow-hidden`;
      cardStyleOverride = {
        boxShadow: activeBlockId === block.id ? '0 0 10px rgba(0, 255, 0, 0.25)' : 'none',
        borderLeftWidth: '1px',
      };
    } else if (theme === 'cyberpunk') {
      cardClass = `bg-neutral-950 border border-cyan-400 rounded-none ${padClass} flex flex-col justify-center min-h-0 relative overflow-hidden`;
      cardStyleOverride = {
        boxShadow: activeBlockId === block.id ? '0 0 12px rgba(6, 182, 212, 0.4)' : '0 0 4px rgba(6, 182, 212, 0.1)',
        borderLeftWidth: '1px',
      };
    } else if (theme === 'academic') {
      cardClass = `bg-[#fffbf0] border-3 border-double border-[#e6dfc8] rounded-none ${padClass} flex flex-col justify-center min-h-0 relative overflow-hidden`;
      cardStyleOverride = {
        borderLeftWidth: '3px',
      };
    } else if (theme === 'clinical') {
      cardClass = `bg-white border-l-[4px] border border-rose-200 rounded-xl ${padClass} shadow-[0_4px_16px_rgba(244,63,94,0.02)] hover:border-rose-300 transition-all duration-200 flex flex-col justify-center min-h-0 relative overflow-hidden`;
      cardStyleOverride = {
        borderLeftColor: bColor,
      };
    } else if (theme === 'midnight') {
      cardClass = `bg-slate-900 border border-slate-700/80 rounded-xl ${padClass} transition-all duration-200 flex flex-col justify-center min-h-0 relative overflow-hidden`;
      cardStyleOverride = {
        borderLeftColor: bColor,
        borderLeftWidth: '4px',
        boxShadow: activeBlockId === block.id ? '0 0 15px rgba(99, 102, 241, 0.2)' : '0 4px 24px rgba(0,0,0,0.1)',
      };
    } else {
      // modern or default
      cardClass = `bg-white border-l-[4px] border border-slate-100 rounded-xl ${padClass} shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)] hover:border-slate-200 transition-all duration-200 flex flex-col justify-center min-h-0 relative overflow-hidden`;
      cardStyleOverride = {
        borderLeftColor: bColor,
      };
    }

    return (
      <motion.div
        key={block.id || idx}
        ref={blockRefCallback(block.id)}
        data-block-id={block.id}
        onMouseEnter={() => setActiveBlockId(block.id)}
        onMouseLeave={() => setActiveBlockId(null)}
        initial={disableAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: 25 }}
        animate={{ opacity: 1, x: 0, scale: activeBlockId === block.id ? 1.012 : 1 }}
        transition={getTransition(0.12 + idx * 0.05)}
        className={cardClass}
        style={{ 
          ...cardStyleOverride,
          borderTopColor: draggingBlockId === block.id ? bColor : (cardStyleOverride.borderTopColor || undefined),
          borderRightColor: draggingBlockId === block.id ? bColor : (cardStyleOverride.borderRightColor || undefined),
          borderBottomColor: draggingBlockId === block.id ? bColor : (cardStyleOverride.borderBottomColor || undefined),
          flex: `${weight} ${weight} auto`,
          transform: draggingBlockId === block.id ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04)` : 'none',
          zIndex: draggingBlockId === block.id ? 100 : 1,
          cursor: draggingBlockId === block.id ? 'grabbing' : draggingBlockId ? 'default' : 'grab',
          boxShadow: draggingBlockId === block.id ? `0 20px 25px -5px ${bColor}30, 0 8px 10px -6px ${bColor}30` : (cardStyleOverride.boxShadow || undefined),
          touchAction: 'none'
        }}
      >
        {theme === 'terminal' && (
          <div className="absolute top-0 left-0 right-0 h-[18px] bg-zinc-950 border-b border-[#00ff00]/40 flex items-center px-2 gap-1.5 select-none font-mono text-[7px] text-[#00ff00]/50 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500/70 shrink-0" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/70 shrink-0" />
            <span className="w-1.5 h-1.5 rounded-full bg-green-500/70 shrink-0" />
            <span className="ml-[3px] font-semibold text-[8px] tracking-tight">usr_block_0{idx + 1}.bash</span>
          </div>
        )}

        {theme === 'cyberpunk' && (
          <>
            <div className="absolute top-[3px] left-[3px] w-1.5 h-1.5 border-t border-l border-cyan-400 pointer-events-none" />
            <div className="absolute top-[3px] right-[3px] w-1.5 h-1.5 border-t border-r border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-[3px] left-[3px] w-1.5 h-1.5 border-b border-l border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-[3px] right-[3px] w-1.5 h-1.5 border-b border-r border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-1 right-2 opacity-25 text-[5px] sm:text-[7px] tracking-[1.5px] font-mono select-none text-cyan-400 pointer-events-none">CP-0{idx + 1} // SYS</div>
          </>
        )}

        {theme === 'clinical' && (
          <div className="absolute top-2 right-2 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-1 h-3.5 bg-rose-600 rounded-full" />
            <div className="w-3.5 h-1 bg-rose-600 rounded-full absolute" />
          </div>
        )}

        {theme === 'academic' && (
          <span className="absolute bottom-1 right-2 font-serif text-[8px] sm:text-[9px] italic opacity-35 text-[#4c3d31] pointer-events-none select-none">
            § {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][idx] || idx + 1}
          </span>
        )}

        {theme === 'midnight' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/20 via-transparent to-indigo-500/5 pointer-events-none" />
        )}

        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50/10 to-transparent -z-10 pointer-events-none rounded-full blur-xl" />
        {renderBlockContent(block, idx, weight)}
      </motion.div>
    );
  };

  // Professional flexible Layout Computation strictly keeping everything to 16:9 bounds (No vertical overrun)
  const renderResponsiveGrid = () => {
    const totalBlocks = contentBlocks.length;

    if (totalBlocks === 0) {
      return (
        <div className="text-center text-slate-400 py-10 w-full font-mono text-sm select-none">
          No content blocks added yet. Use the sidebar to add containers.
        </div>
      );
    }

    const isScaledUp = (currentSettings.contentSize || 100) > 115;

    if (blockLayout === 'split' && hasPhoto) {
      const activePhoto = photoBlocks[0];
      const photoRight = activePhoto.position === 'right';
      
      const colSpanPhoto = isScaledUp ? 'col-span-4' : 'col-span-5';
      const colSpanText = isScaledUp ? 'col-span-8' : 'col-span-7';
      const splitGapClass = isScaledUp ? 'gap-3' : 'gap-5';
      const mainBlocksGapClass = isScaledUp ? 'gap-2' : 'gap-3.5';

      return (
        <div className={`w-full h-full grid grid-cols-12 ${splitGapClass} items-stretch min-h-0 select-none`}>
          {/* Side Photo view: standard 5/12 or 6/12 width */}
          <div className={`${colSpanPhoto} flex flex-col justify-center h-full min-h-0 ${photoRight ? 'order-last' : ''}`}>
            {photoBlocks.map((ph, idx) => renderSlideBlockElement(ph, blocks.indexOf(ph)))}
          </div>

          {/* Block items view: standard 7/12 width holding content-proportional height cards */}
          <div className={`${colSpanText} flex flex-col ${mainBlocksGapClass} h-full justify-between min-h-0`}>
            {mainBlocks.map((block, idx) => renderSlideBlockElement(block, blocks.indexOf(block)))}
          </div>
        </div>
      );
    }

    if (blockLayout === 'vertical') {
      const verticalGapClass = isScaledUp ? 'gap-2' : 'gap-4';
      return (
        <div className={`flex flex-col ${verticalGapClass} w-full h-full justify-between items-stretch min-h-0 select-none`}>
          {contentBlocks.map((block, idx) => renderSlideBlockElement(block, blocks.indexOf(block)))}
        </div>
      );
    }

    if (blockLayout === 'sidebar') {
      if (totalBlocks === 1) {
        return (
          <div className="w-full max-w-2xl mx-auto h-full flex flex-col justify-center py-2 select-none">
            {contentBlocks.map((block, idx) => renderSlideBlockElement(block, blocks.indexOf(block)))}
          </div>
        );
      }
      const firstBlock = contentBlocks[0];
      const remainingBlocks = contentBlocks.slice(1);
      const sidebarSpan = isScaledUp ? 'col-span-4' : 'col-span-5';
      const mainSpan = isScaledUp ? 'col-span-8' : 'col-span-7';
      const rGapClass = isScaledUp ? 'gap-2.5' : 'gap-4';

      return (
        <div className={`grid grid-cols-12 ${rGapClass} w-full h-full items-stretch min-h-0 select-none`}>
          <div className={`${sidebarSpan} flex flex-col items-stretch h-full min-h-0`}>
            {renderSlideBlockElement(firstBlock, blocks.indexOf(firstBlock))}
          </div>
          <div className={`${mainSpan} flex flex-col ${rGapClass} h-full min-h-0 justify-between items-stretch`}>
            {remainingBlocks.map((block) => renderSlideBlockElement(block, blocks.indexOf(block)))}
          </div>
        </div>
      );
    }

    if (blockLayout === 'staggered') {
      if (totalBlocks === 1) {
        return (
          <div className="w-full max-w-2xl mx-auto h-full flex flex-col justify-center py-2 select-none">
            {contentBlocks.map((block, idx) => renderSlideBlockElement(block, blocks.indexOf(block)))}
          </div>
        );
      }

      const rGapClass = isScaledUp ? 'gap-2.5' : 'gap-4';

      if (totalBlocks === 2) {
        return (
          <div className={`grid grid-cols-12 ${rGapClass} w-full h-full items-stretch min-h-0 select-none`}>
            <div className="col-span-7 flex flex-col items-stretch h-full min-h-0">
              {renderSlideBlockElement(contentBlocks[0], blocks.indexOf(contentBlocks[0]))}
            </div>
            <div className="col-span-5 flex flex-col items-stretch h-full min-h-0">
              {renderSlideBlockElement(contentBlocks[1], blocks.indexOf(contentBlocks[1]))}
            </div>
          </div>
        );
      }

      if (totalBlocks === 3) {
        return (
          <div className={`flex flex-col ${rGapClass} w-full h-full items-stretch min-h-0 select-none`}>
            <div className="h-[40%] shrink-0">
              {renderSlideBlockElement(contentBlocks[0], blocks.indexOf(contentBlocks[0]))}
            </div>
            <div className={`flex-1 grid grid-cols-2 ${rGapClass} min-h-0`}>
              <div className="flex flex-col items-stretch h-full min-h-0">
                {renderSlideBlockElement(contentBlocks[1], blocks.indexOf(contentBlocks[1]))}
              </div>
              <div className="flex flex-col items-stretch h-full min-h-0">
                {renderSlideBlockElement(contentBlocks[2], blocks.indexOf(contentBlocks[2]))}
              </div>
            </div>
          </div>
        );
      }

      // 4 or more content blocks: Chessboard staggered grid columns with asymmetric layouts
      const topRow = contentBlocks.slice(0, 2);
      const bottomRow = contentBlocks.slice(2);

      return (
        <div className={`flex flex-col ${rGapClass} w-full h-full items-stretch min-h-0 select-none`}>
          <div className={`flex-1 grid grid-cols-12 ${rGapClass} min-h-0`}>
            <div className="col-span-7 flex flex-col items-stretch h-full min-h-0">
              {renderSlideBlockElement(topRow[0], blocks.indexOf(topRow[0]))}
            </div>
            <div className="col-span-5 flex flex-col items-stretch h-full min-h-0">
              {renderSlideBlockElement(topRow[1], blocks.indexOf(topRow[1]))}
            </div>
          </div>
          <div className={`flex-1 grid grid-cols-12 ${rGapClass} min-h-0`}>
            <div className="col-span-5 flex flex-col items-stretch h-full min-h-0">
              {renderSlideBlockElement(bottomRow[0], blocks.indexOf(bottomRow[0]))}
            </div>
            <div className="col-span-7 flex flex-col items-stretch h-full min-h-0">
              {renderSlideBlockElement(bottomRow[1] || bottomRow[0], blocks.indexOf(bottomRow[1] || bottomRow[0]))}
            </div>
          </div>
        </div>
      );
    }

    if (blockLayout === 'grid') {
      if (totalBlocks === 1) {
        return (
          <div className="w-full max-w-2xl mx-auto h-full flex flex-col justify-center py-2 select-none">
            {contentBlocks.map((block, idx) => renderSlideBlockElement(block, blocks.indexOf(block)))}
          </div>
        );
      }

      // Split blocks for balanced column bento grids
      const col1Blocks: BlockSlideBlock[] = [];
      const col2Blocks: BlockSlideBlock[] = [];
      contentBlocks.forEach((block, idx) => {
        if (idx % 2 === 0) {
          col1Blocks.push(block);
        } else {
          col2Blocks.push(block);
        }
      });

      // Avoid squashed columns on very high scale size by dynamically switching to vertical stacking layout!
      const isHighScaleGrid = (currentSettings.contentSize || 100) > 120 && totalBlocks >= 3;
      if (isHighScaleGrid) {
        return (
          <div className="flex flex-col gap-2.5 w-full h-full items-stretch min-h-0 select-none overflow-y-auto pr-1">
            {contentBlocks.map((block) => renderSlideBlockElement(block, blocks.indexOf(block)))}
          </div>
        );
      }

      const gridGapClass = isScaledUp ? 'gap-2.5' : 'gap-4';
      const colGapClass = isScaledUp ? 'gap-2.5' : 'gap-4';

      return (
        <div className={`grid grid-cols-2 ${gridGapClass} w-full h-full items-stretch min-h-0 select-none`}>
          <div className={`flex flex-col ${colGapClass} h-full min-h-0 items-stretch`}>
            {col1Blocks.map((block) => renderSlideBlockElement(block, blocks.indexOf(block)))}
          </div>
          <div className={`flex flex-col ${colGapClass} h-full min-h-0 items-stretch`}>
            {col2Blocks.map((block) => renderSlideBlockElement(block, blocks.indexOf(block)))}
          </div>
        </div>
      );
    }

    // Default or Fallback: Horizontal row layout (all blocks next to each other)
    const isHighScaleHorizontal = (currentSettings.contentSize || 100) > 120 && totalBlocks >= 2;
    if (isHighScaleHorizontal) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full h-full items-stretch min-h-0 select-none overflow-y-auto pr-1">
          {contentBlocks.map((block, idx) => renderSlideBlockElement(block, blocks.indexOf(block)))}
        </div>
      );
    }

    const rowGapClass = isScaledUp ? 'gap-2.5' : 'gap-4';
    return (
      <div className={`flex flex-row ${rowGapClass} w-full h-full items-stretch min-h-0 select-none`}>
        {contentBlocks.map((block, idx) => renderSlideBlockElement(block, blocks.indexOf(block)))}
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const oldUnusedResponsiveGrid = () => {
    const totalBlocks = mainBlocks.length;

    if (hasPhoto) {
      const activePhoto = photoBlocks[0];
      const photoRight = activePhoto.position === 'right';
      
      return (
        <div className="w-full h-full grid grid-cols-12 gap-5 items-stretch min-h-0 select-none">
          {/* Side Photo view: standard 5/12 or 6/12 width */}
          <div className={`col-span-5 flex flex-col justify-center h-full min-h-0 ${photoRight ? 'order-last' : ''}`}>
            {photoBlocks.map((ph, idx) => {
              const isPlaceholder = !ph.imageUrl;
              const isDragging = !!isDraggingMap[ph.id || idx];
              
              return (
                <motion.div
                  key={ph.id || idx}
                  ref={blockRefCallback(ph.id)}
                  data-block-id={ph.id}
                  initial={disableAnimations ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={getTransition(0.1 + idx * 0.05)}
                  className={`group relative flex flex-col bg-white border rounded-2xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.035)] h-full justify-between overflow-hidden ${
                    isPlaceholder ? 'border-dashed border-slate-300' : 'border-slate-150/70'
                  }`}
                  onDragOver={(e) => handleDragOver(e, ph.id || String(idx))}
                  onDragLeave={() => handleDragLeave(ph.id || String(idx))}
                  onDrop={(e) => handleDrop(e, ph.id || String(idx))}
                  style={{
                    transform: draggingBlockId === ph.id ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04)` : 'none',
                    zIndex: draggingBlockId === ph.id ? 100 : 1,
                    cursor: draggingBlockId === ph.id ? 'grabbing' : draggingBlockId ? 'default' : 'grab',
                    boxShadow: draggingBlockId === ph.id ? `0 20px 25px -5px ${primaryColor}30, 0 8px 10px -6px ${primaryColor}30` : undefined,
                    borderLeftColor: draggingBlockId === ph.id ? primaryColor : undefined,
                    borderTopColor: draggingBlockId === ph.id ? primaryColor : undefined,
                    borderRightColor: draggingBlockId === ph.id ? primaryColor : undefined,
                    borderBottomColor: draggingBlockId === ph.id ? primaryColor : undefined,
                    touchAction: 'none'
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    id={`file-upload-${ph.id || idx}`}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, ph.id || String(idx))}
                  />

                  {isPlaceholder ? (
                    <label
                      htmlFor={`file-upload-${ph.id || idx}`}
                      className={`w-full flex-1 border-2 border-dashed rounded-xl overflow-hidden relative flex flex-col items-center justify-center p-4 min-h-0 transition-all duration-200 cursor-pointer ${
                        isDragging 
                          ? 'border-indigo-400 bg-indigo-50/40 text-indigo-500 shadow-inner' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-300 text-slate-400'
                      }`}
                    >
                      <div className={`p-3 rounded-full mb-2 bg-white shadow-xs border transition-transform duration-200 group-hover:scale-105 ${
                        isDragging ? 'border-indigo-200 text-indigo-500' : 'border-slate-100 text-slate-400'
                      }`}>
                        <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-700 tracking-tight text-center">
                        Upload Media File
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-1 text-center font-mono">
                        Drag & Drop or Click to Browse
                      </span>
                    </label>
                  ) : (
                    <div className="w-full flex-1 bg-slate-50 border border-slate-100/80 rounded-xl overflow-hidden relative flex items-center justify-center p-1 min-h-0">
                      <img 
                        src={ph.imageUrl} 
                        alt={ph.title || "Uploaded View"} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      
                      {/* Interactive overlay handles zoom, replace, or delete */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setFullscreenImage(ph.imageUrl || '')}
                          className="bg-white/95 p-2 rounded-full shadow-lg text-slate-800 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                          title="Zoom In"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        {onUpdateSlide && (
                          <label
                            htmlFor={`file-upload-${ph.id || idx}`}
                            className="bg-white/95 p-2 rounded-full shadow-lg text-indigo-600 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                            title="Replace Image"
                          >
                            <Upload className="w-4 h-4" />
                          </label>
                        )}
                        {onUpdateSlide && (
                          <button
                            type="button"
                            onClick={(e) => handleClearImage(e, ph.id || String(idx))}
                            className="bg-white/95 p-2 rounded-full shadow-lg text-red-600 hover:scale-110 active:scale-95 transition-all"
                            title="Remove Image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {(ph.title || ph.caption) && (
                    <div className="mt-1.5 text-center px-1 shrink-0">
                       {ph.title && <h4 className="font-extrabold text-slate-800 text-xs tracking-tight line-clamp-1">{ph.title}</h4>}
                      {ph.caption && <p className="text-[10px] text-slate-500 font-semibold line-clamp-1 mt-0.5">{ph.caption}</p>}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Block items view: standard 7/12 width holding content-proportional height cards */}
          <div className="col-span-7 flex flex-col gap-3.5 h-full justify-between min-h-0">
            {mainBlocks.map((block, idx) => {
              const bColor = getBlockColor(idx, block.color);
              const weight = getBlockWeight(block);
              const padClass = weight > 2.5 ? 'p-3' : 'p-4';
              
              return (
                <motion.div
                  key={block.id || idx}
                  ref={blockRefCallback(block.id)}
                  data-block-id={block.id}
                  onMouseEnter={() => setActiveBlockId(block.id)}
                  onMouseLeave={() => setActiveBlockId(null)}
                  initial={disableAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0, scale: activeBlockId === block.id ? 1.012 : 1 }}
                  transition={getTransition(0.12 + idx * 0.05)}
                  className={`bg-white border-l-[4px] border border-slate-100 rounded-xl ${padClass} shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)] hover:border-slate-200 transition-all duration-200 flex flex-col justify-center min-h-0 relative overflow-hidden`}
                  style={{ 
                    borderLeftColor: bColor,
                    borderTopColor: draggingBlockId === block.id ? bColor : undefined,
                    borderRightColor: draggingBlockId === block.id ? bColor : undefined,
                    borderBottomColor: draggingBlockId === block.id ? bColor : undefined,
                    flex: `${weight} ${weight} 0%`,
                    transform: draggingBlockId === block.id ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04)` : 'none',
                    zIndex: draggingBlockId === block.id ? 100 : 1,
                    cursor: draggingBlockId === block.id ? 'grabbing' : draggingBlockId ? 'default' : 'grab',
                    boxShadow: draggingBlockId === block.id ? `0 20px 25px -5px ${bColor}30, 0 8px 10px -6px ${bColor}30` : undefined,
                    touchAction: 'none'
                  }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50/10 to-transparent -z-10 pointer-events-none rounded-full blur-xl" />
                  {renderBlockContent(block, idx, weight)}
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }

    // Split blocks for balanced 4+ column bento grids
    const col1Blocks: BlockSlideBlock[] = [];
    const col2Blocks: BlockSlideBlock[] = [];
    if (totalBlocks >= 4) {
      mainBlocks.forEach((block, idx) => {
        if (idx % 2 === 0) {
          col1Blocks.push(block);
        } else {
          col2Blocks.push(block);
        }
      });
    }

    // No photo inside this block slide: automatic responsive layouts
    return (
      <div className="w-full h-full flex flex-col justify-center min-h-0">
        {totalBlocks === 1 ? (
          /* Single full width elegant Hero Card */
          <div className="w-full max-w-2xl mx-auto h-full flex flex-col justify-center py-2">
            {mainBlocks.map((block, idx) => {
              const bColor = getBlockColor(idx, block.color);
              return (
                <motion.div
                  key={block.id || idx}
                  ref={blockRefCallback(block.id)}
                  data-block-id={block.id}
                  onMouseEnter={() => setActiveBlockId(block.id)}
                  onMouseLeave={() => setActiveBlockId(null)}
                  initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, scale: activeBlockId === block.id ? 1.015 : 1 }}
                  transition={getTransition(0.1)}
                  className="bg-white border-t-[4px] border border-slate-100/90 rounded-2xl p-7 shadow-[0_16px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.07)] hover:border-slate-150 transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-center min-h-0"
                  style={{ 
                    borderTopColor: bColor,
                    borderLeftColor: draggingBlockId === block.id ? bColor : undefined,
                    borderRightColor: draggingBlockId === block.id ? bColor : undefined,
                    borderBottomColor: draggingBlockId === block.id ? bColor : undefined,
                    transform: draggingBlockId === block.id ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04)` : 'none',
                    zIndex: draggingBlockId === block.id ? 100 : 1,
                    cursor: draggingBlockId === block.id ? 'grabbing' : draggingBlockId ? 'default' : 'grab',
                    boxShadow: draggingBlockId === block.id ? `0 25px 50px -12px ${bColor}30` : undefined,
                    touchAction: 'none'
                  }}
                >
                  {renderBlockContent(block, idx, 1.0)}
                </motion.div>
              );
            })}
          </div>
        ) : totalBlocks === 2 ? (
          /* Flexible 2-Column Sidebar and main block layout (Flex row with content-proportional widths) */
          <div className="flex flex-row gap-5 w-full h-full items-stretch min-h-0">
            {mainBlocks.map((block, idx) => {
              const bColor = getBlockColor(idx, block.color);
              const weight = getBlockWeight(block);
              const padClass = weight > 2.5 ? 'p-4' : 'p-5';
              
              return (
                <motion.div
                  key={block.id || idx}
                  ref={blockRefCallback(block.id)}
                  data-block-id={block.id}
                  onMouseEnter={() => setActiveBlockId(block.id)}
                  onMouseLeave={() => setActiveBlockId(null)}
                  initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, scale: activeBlockId === block.id ? 1.012 : 1 }}
                  transition={getTransition(0.1 + idx * 0.05)}
                  className={`bg-white border-t-[4px] border border-slate-100 rounded-xl ${padClass} shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-200 h-full flex flex-col justify-center min-h-0 relative overflow-hidden`}
                  style={{ 
                    borderTopColor: bColor, 
                    borderLeftColor: draggingBlockId === block.id ? bColor : undefined,
                    borderRightColor: draggingBlockId === block.id ? bColor : undefined,
                    borderBottomColor: draggingBlockId === block.id ? bColor : undefined,
                    flex: `${weight} ${weight} 0%`,
                    transform: draggingBlockId === block.id ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04)` : 'none',
                    zIndex: draggingBlockId === block.id ? 100 : 1,
                    cursor: draggingBlockId === block.id ? 'grabbing' : draggingBlockId ? 'default' : 'grab',
                    boxShadow: draggingBlockId === block.id ? `0 20px 25px -5px ${bColor}30` : undefined,
                    touchAction: 'none'
                  }}
                >
                  {renderBlockContent(block, idx, weight)}
                </motion.div>
              );
            })}
          </div>
        ) : totalBlocks === 3 ? (
          /* 3-Column dynamic horizontal split layout (Flex row with content-proportional widths) */
          <div className="flex flex-row gap-4 w-full h-full items-stretch min-h-0">
            {mainBlocks.map((block, idx) => {
              const bColor = getBlockColor(idx, block.color);
              const weight = getBlockWeight(block);
              const padClass = weight > 2.5 ? 'p-3' : 'p-4';
              
              return (
                <motion.div
                  key={block.id || idx}
                  ref={blockRefCallback(block.id)}
                  data-block-id={block.id}
                  onMouseEnter={() => setActiveBlockId(block.id)}
                  onMouseLeave={() => setActiveBlockId(null)}
                  initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, scale: activeBlockId === block.id ? 1.012 : 1 }}
                  transition={getTransition(0.1 + idx * 0.05)}
                  className={`bg-white border-t-[4px] border border-slate-100 rounded-xl ${padClass} shadow-[0_10px_32px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-200 flex flex-col justify-center h-full min-h-0 relative overflow-hidden`}
                  style={{ 
                    borderTopColor: bColor, 
                    borderLeftColor: draggingBlockId === block.id ? bColor : undefined,
                    borderRightColor: draggingBlockId === block.id ? bColor : undefined,
                    borderBottomColor: draggingBlockId === block.id ? bColor : undefined,
                    flex: `${weight} ${weight} 0%`,
                    transform: draggingBlockId === block.id ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04)` : 'none',
                    zIndex: draggingBlockId === block.id ? 100 : 1,
                    cursor: draggingBlockId === block.id ? 'grabbing' : draggingBlockId ? 'default' : 'grab',
                    boxShadow: draggingBlockId === block.id ? `0 20px 25px -5px ${bColor}30` : undefined,
                    touchAction: 'none'
                  }}
                >
                  {renderBlockContent(block, idx, weight)}
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* 4+ blocks: Compact adaptive Bento Grid layouts using proportional column/row flex stacks */
          <div className="grid grid-cols-2 gap-4 w-full h-full items-stretch min-h-0">
            {/* Column 1 */}
            <div className="flex flex-col gap-4 h-full min-h-0 items-stretch">
              {col1Blocks.map((block) => {
                const globalIdx = mainBlocks.indexOf(block);
                const bColor = getBlockColor(globalIdx, block.color);
                const weight = getBlockWeight(block);
                const padClass = weight > 2.2 ? 'p-3' : 'p-4';
                
                return (
                  <motion.div
                    key={block.id || globalIdx}
                    ref={blockRefCallback(block.id)}
                    data-block-id={block.id}
                    onMouseEnter={() => setActiveBlockId(block.id)}
                    onMouseLeave={() => setActiveBlockId(null)}
                    initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0, scale: activeBlockId === block.id ? 1.012 : 1 }}
                    transition={getTransition(0.1 + globalIdx * 0.04)}
                    className={`bg-white border-t-[3px] border border-slate-100 rounded-xl ${padClass} shadow-[0_6px_24px_rgba(0,0,0,0.025)] hover:shadow-md transition-all duration-200 h-full flex flex-col justify-center min-h-0 relative overflow-hidden`}
                    style={{ 
                      borderTopColor: bColor,
                      borderLeftColor: draggingBlockId === block.id ? bColor : undefined,
                      borderRightColor: draggingBlockId === block.id ? bColor : undefined,
                      borderBottomColor: draggingBlockId === block.id ? bColor : undefined,
                      flex: `${weight} ${weight} 0%`,
                      transform: draggingBlockId === block.id ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04)` : 'none',
                      zIndex: draggingBlockId === block.id ? 100 : 1,
                      cursor: draggingBlockId === block.id ? 'grabbing' : draggingBlockId ? 'default' : 'grab',
                      boxShadow: draggingBlockId === block.id ? `0 20px 25px -5px ${bColor}30` : undefined,
                      touchAction: 'none'
                    }}
                  >
                    {renderBlockContent(block, globalIdx, weight)}
                  </motion.div>
                );
              })}
            </div>
            {/* Column 2 */}
            <div className="flex flex-col gap-4 h-full min-h-0 items-stretch">
              {col2Blocks.map((block) => {
                const globalIdx = mainBlocks.indexOf(block);
                const bColor = getBlockColor(globalIdx, block.color);
                const weight = getBlockWeight(block);
                const padClass = weight > 2.2 ? 'p-3' : 'p-4';
                
                return (
                  <motion.div
                    key={block.id || globalIdx}
                    ref={blockRefCallback(block.id)}
                    data-block-id={block.id}
                    onMouseEnter={() => setActiveBlockId(block.id)}
                    onMouseLeave={() => setActiveBlockId(null)}
                    initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0, scale: activeBlockId === block.id ? 1.012 : 1 }}
                    transition={getTransition(0.1 + globalIdx * 0.04)}
                    className={`bg-white border-t-[3px] border border-slate-100 rounded-xl ${padClass} shadow-[0_6px_24px_rgba(0,0,0,0.025)] hover:shadow-md transition-all duration-200 h-full flex flex-col justify-center min-h-0 relative overflow-hidden`}
                    style={{ 
                      borderTopColor: bColor,
                      borderLeftColor: draggingBlockId === block.id ? bColor : undefined,
                      borderRightColor: draggingBlockId === block.id ? bColor : undefined,
                      borderBottomColor: draggingBlockId === block.id ? bColor : undefined,
                      flex: `${weight} ${weight} 0%`,
                      transform: draggingBlockId === block.id ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04)` : 'none',
                      zIndex: draggingBlockId === block.id ? 100 : 1,
                      cursor: draggingBlockId === block.id ? 'grabbing' : draggingBlockId ? 'default' : 'grab',
                      boxShadow: draggingBlockId === block.id ? `0 20px 25px -5px ${bColor}30` : undefined,
                      touchAction: 'none'
                    }}
                  >
                    {renderBlockContent(block, globalIdx, weight)}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const isOuterScaledUp = (currentSettings.contentSize || 100) > 115;
  const slidePaddingClass = isOuterScaledUp ? 'p-3 sm:p-4 md:p-5' : 'p-6 sm:p-8';

  return (
    <div 
      className={`flex flex-col w-full h-full justify-between relative overflow-hidden ${slidePaddingClass} select-text aspect-[16/9] block-slide-theme-${currentSettings.slideTheme || 'modern'}`}
      style={{
        '--theme-primary': primaryColor,
        '--accent-color': primaryColor,
      } as React.CSSProperties}
    >
      <SlideBackground type="timeline" />
      
      {/* Decorative background grid matrix for high-art luxury finish */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] -z-1"
        style={{
          backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

       <div className="relative z-10 w-full h-full max-w-6xl mx-auto flex flex-col justify-between overflow-hidden">
        {/* Header segment with elegant Layout Selector floating on the right */}
        <div className="flex w-full justify-between items-start mb-3 gap-4 shrink-0">
          <div className={`flex flex-col ${getAlignmentClass(titleAlign)}`}>
            {slide.eyebrow && (
              <motion.div
                initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition(0)}
                className="flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: primaryColor }} />
                <p
                  className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase font-mono select-none markdown-inline"
                  style={{ color: `color-mix(in srgb, ${primaryColor} 88%, #64748b)` }}
                >
                  <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {slide.eyebrow}
                  </ReactMarkdown>
                </p>
              </motion.div>
            )}
            
            <motion.h2
              initial={disableAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={getTransition(0.08)}
              className="font-extrabold text-slate-900 font-serif leading-none tracking-tight select-text text-2xl sm:text-3xl md:text-[2.2rem] mt-1 markdown-inline"
              style={{
                fontSize: `${(currentSettings.titleSize || 100) * 0.01 * 1.8}rem`,
                lineHeight: currentSettings.titleLineHeight || 1.1,
                letterSpacing: `${currentSettings.titleLetterSpacing !== undefined ? currentSettings.titleLetterSpacing : -0.01}em`,
                textAlign: titleAlign
              }}
            >
              <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {slide.title}
              </ReactMarkdown>
            </motion.h2>
          </div>

          {/* Interactive Layout Switcher Widget */}
          {onUpdateSlide && currentSettings.showLayoutSwitcher !== false && (
            <div className="flex items-center gap-1 bg-white/85 backdrop-blur-md border border-slate-200/50 p-1 rounded-xl shadow-xs z-20 select-none shrink-0 scale-90 sm:scale-100 origin-top-right transition-all">
              {hasPhoto && (
                <button
                  onClick={() => {
                    onUpdateSlide({
                      settings: { ...currentSettings, blockLayout: 'split' }
                    });
                  }}
                  className={`p-1 sm:p-1.5 rounded-lg border flex items-center gap-1 text-[10px] sm:text-xs font-extrabold tracking-tight transition-all duration-200 cursor-pointer ${
                    blockLayout === 'split'
                      ? 'bg-slate-950 text-white border-transparent shadow-xs'
                      : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100/70 hover:text-slate-900'
                  }`}
                  title="Split Photo Layout"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  Split
                </button>
              )}
              <button
                onClick={() => {
                  onUpdateSlide({
                    settings: { ...currentSettings, blockLayout: 'horizontal' }
                  });
                }}
                className={`p-1 sm:p-1.5 rounded-lg border flex items-center gap-1 text-[10px] sm:text-xs font-extrabold tracking-tight transition-all duration-200 cursor-pointer ${
                  blockLayout === 'horizontal'
                    ? 'bg-slate-950 text-white border-transparent shadow-xs'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100/70 hover:text-slate-900'
                }`}
                title="Horizontal Row Layout"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Row
              </button>
              <button
                onClick={() => {
                  onUpdateSlide({
                    settings: { ...currentSettings, blockLayout: 'vertical' }
                  });
                }}
                className={`p-1 sm:p-1.5 rounded-lg border flex items-center gap-1 text-[10px] sm:text-xs font-extrabold tracking-tight transition-all duration-200 cursor-pointer ${
                  blockLayout === 'vertical'
                    ? 'bg-slate-950 text-white border-transparent shadow-xs'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100/70 hover:text-slate-900'
                }`}
                title="Vertical Stack Layout"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                Column
              </button>
              <button
                onClick={() => {
                  onUpdateSlide({
                    settings: { ...currentSettings, blockLayout: 'grid' }
                  });
                }}
                className={`p-1 sm:p-1.5 rounded-lg border flex items-center gap-1 text-[10px] sm:text-xs font-extrabold tracking-tight transition-all duration-200 cursor-pointer ${
                  blockLayout === 'grid'
                    ? 'bg-slate-950 text-white border-transparent shadow-xs'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100/70 hover:text-slate-900'
                }`}
                title="Grid / Bento Layout"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                Grid
              </button>
              <button
                onClick={() => {
                  onUpdateSlide({
                    settings: { ...currentSettings, blockLayout: 'sidebar' }
                  });
                }}
                className={`p-1 sm:p-1.5 rounded-lg border flex items-center gap-1 text-[10px] sm:text-xs font-extrabold tracking-tight transition-all duration-200 cursor-pointer ${
                  blockLayout === 'sidebar'
                    ? 'bg-slate-950 text-white border-transparent shadow-xs'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100/70 hover:text-slate-900'
                }`}
                title="Sidebar Highlight Layout"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                Sidebar
              </button>
              <button
                onClick={() => {
                  onUpdateSlide({
                    settings: { ...currentSettings, blockLayout: 'staggered' }
                  });
                }}
                className={`p-1 sm:p-1.5 rounded-lg border flex items-center gap-1 text-[10px] sm:text-xs font-extrabold tracking-tight transition-all duration-200 cursor-pointer ${
                  blockLayout === 'staggered'
                    ? 'bg-slate-950 text-white border-transparent shadow-xs'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100/70 hover:text-slate-900'
                }`}
                title="Asymmetric Chessboard Layout"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shrink-0" />
                Staggered
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Blocks Grid/Layout */}
        <div className="flex-1 min-h-0 flex items-center w-full py-2">
          {renderResponsiveGrid()}
        </div>

        {/* Full-width elegant Keypoint / alert block pinned strictly to bottom margin */}
        {keypointBlocks.map((kp, idx) => (
          <motion.div
            key={kp.id || idx}
            ref={blockRefCallback(kp.id)}
            data-block-id={kp.id}
            initial={disableAnimations ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={getTransition(0.24, 0.45)}
            className={`rounded-xl p-2.5 flex items-center gap-3 border text-left w-full mt-2.5 shrink-0 shadow-xs relative overflow-hidden hover:scale-101 transition-transform ${
              theme === 'terminal' ? 'border-[#0f0]/30' :
              theme === 'cyberpunk' ? 'border-[#ff007f]/40' :
              theme === 'midnight' ? 'border-indigo-900/40' :
              theme === 'academic' ? 'border-[#e6dfc8]' :
              'border-slate-100'
            }`}
            style={{ 
              backgroundColor: `color-mix(in srgb, ${primaryColor} 6%, ${baseMixBg})`,
              borderLeftColor: draggingBlockId === kp.id ? primaryColor : undefined,
              borderTopColor: draggingBlockId === kp.id ? primaryColor : undefined,
              borderRightColor: draggingBlockId === kp.id ? primaryColor : undefined,
              borderBottomColor: draggingBlockId === kp.id ? primaryColor : undefined,
              transform: draggingBlockId === kp.id ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04)` : 'none',
              zIndex: draggingBlockId === kp.id ? 100 : 1,
              cursor: draggingBlockId === kp.id ? 'grabbing' : draggingBlockId ? 'default' : 'grab',
              boxShadow: draggingBlockId === kp.id ? `0 20px 25px -5px ${primaryColor}20` : undefined,
              touchAction: 'none'
            }}
          >
            <div 
               className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
               style={{ backgroundColor: `color-mix(in srgb, ${primaryColor} 16%, transparent)` }}
            >
              {getLucideIcon(kp.icon, 'info')}
            </div>
            <div 
              className="font-bold tracking-tight leading-normal select-text text-[10px] sm:text-xs markdown-inline" 
              style={{ color: `color-mix(in srgb, ${primaryColor} 85%, ${textMixBase})` }}
            >
              <ReactMarkdown components={{ p: React.Fragment }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {kp.text || ''}
              </ReactMarkdown>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Magnifying Image Lightbox Overlay Mode */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-6 cursor-zoom-out"
            onClick={() => setFullscreenImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              className="relative max-w-full max-h-full flex flex-col items-center"
            >
              <img 
                src={fullscreenImage} 
                alt="Fullscreen View" 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white"
              />
              <button 
                className="mt-4 px-4 py-2 bg-white text-slate-800 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-lg hover:bg-slate-50 uppercase"
                onClick={() => setFullscreenImage(null)}
              >
                <Minimize2 className="w-4 h-4" /> Close Zoom
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


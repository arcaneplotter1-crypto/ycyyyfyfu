import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Layers, 
  Shapes, 
  Move, 
  Maximize2, 
  Palette, 
  Trash2, 
  Play, 
  Settings2,
  Circle,
  Square,
  Triangle,
  Diamond,
  Star,
  Heart,
  Hexagon,
  Pentagon,
  Cloud,
  MousePointer2,
  Save
} from 'lucide-react';
import { BackgroundConfig, BackgroundOverlay, BackgroundShape, OverlayShape, BackgroundShapeType, ShapeAnimation } from '../types';

interface BackgroundCreationModalProps {
  config: BackgroundConfig;
  onSave: (config: BackgroundConfig) => void;
  onClose: () => void;
}

const OVERLAY_SHAPES: OverlayShape[] = ['circle', 'rect', 'triangle', 'diamond', 'blob'];
const BACKGROUND_SHAPES: BackgroundShapeType[] = ['circle', 'square', 'triangle', 'diamond', 'star', 'heart', 'hexagon', 'pentagon'];
const ANIMATIONS: ShapeAnimation[] = ['none', 'hover', 'spin', 'pulse', 'float', 'bounce', 'shake', 'swing', 'slide', 'zoom', 'glitch'];

export const BackgroundCreationModal: React.FC<BackgroundCreationModalProps> = ({ config, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState<BackgroundConfig>(config);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'overlays' | 'shapes'>('general');
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'laptop' | 'desktop'>('desktop');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleAddOverlay = () => {
    const newOverlay: BackgroundOverlay = {
      id: `overlay-${Date.now()}`,
      shape: 'circle',
      color: '#6366f1',
      opacity: 0.3,
      x: 50,
      y: 50,
      width: 30,
      height: 30,
      rotation: 0,
      animation: 'none',
      animationSpeed: 1,
      animationDuration: 2,
      animationDelay: 0,
      blur: 0,
      zIndex: 0
    };
    setLocalConfig(prev => ({
      ...prev,
      overlays: [...prev.overlays, newOverlay]
    }));
    setSelectedId(newOverlay.id);
    setActiveTab('overlays');
  };

  const handleAddShape = () => {
    const newShape: BackgroundShape = {
      id: `shape-${Date.now()}`,
      type: 'star',
      color: '#f59e0b',
      opacity: 0.8,
      x: 50,
      y: 50,
      size: 10,
      rotation: 0,
      animation: 'float',
      animationSpeed: 1,
      animationDuration: 3,
      animationDelay: 0,
      blur: 0,
      zIndex: 0
    };
    setLocalConfig(prev => ({
      ...prev,
      shapes: [...prev.shapes, newShape]
    }));
    setSelectedId(newShape.id);
    setActiveTab('shapes');
  };

  const handleUpdateOverlay = (id: string, updates: Partial<BackgroundOverlay>) => {
    setLocalConfig(prev => ({
      ...prev,
      overlays: prev.overlays.map(o => o.id === id ? { ...o, ...updates } : o)
    }));
  };

  const handleUpdateShape = (id: string, updates: Partial<BackgroundShape>) => {
    setLocalConfig(prev => ({
      ...prev,
      shapes: prev.shapes.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const handleRemoveElement = (id: string) => {
    setLocalConfig(prev => ({
      ...prev,
      overlays: prev.overlays.filter(o => o.id !== id),
      shapes: prev.shapes.filter(s => s.id !== id)
    }));
    setSelectedId(null);
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    setSelectedId(id);
    
    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setIsLongPressActive(true);
      setDraggingId(id);
      // Vibrate if supported (mobile)
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 500); // 500ms for long press
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !isLongPressActive || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    if (draggingId.startsWith('overlay')) {
      handleUpdateOverlay(draggingId, { x: clampedX, y: clampedY });
    } else {
      handleUpdateShape(draggingId, { x: clampedX, y: clampedY });
    }
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setDraggingId(null);
    setIsLongPressActive(false);
  };

  const getPreviewSize = () => {
    switch (deviceType) {
      case 'mobile': return { width: '375px', height: '667px' };
      case 'tablet': return { width: '768px', height: '1024px' };
      case 'laptop': return { width: '1024px', height: '640px' };
      case 'desktop': return { width: '100%', height: '100%' };
      default: return { width: '100%', height: '100%' };
    }
  };

  const handleUpdateGradient = (updates: Partial<NonNullable<BackgroundConfig['backgroundGradient']>>) => {
    setLocalConfig(prev => ({
      ...prev,
      backgroundGradient: {
        enabled: prev.backgroundGradient?.enabled ?? false,
        type: prev.backgroundGradient?.type ?? 'linear',
        colors: prev.backgroundGradient?.colors ?? ['#6366f1', '#a855f7'],
        angle: prev.backgroundGradient?.angle ?? 45,
        ...updates
      }
    }));
  };

  const handleUpdatePattern = (updates: Partial<NonNullable<BackgroundConfig['pattern']>>) => {
    setLocalConfig(prev => ({
      ...prev,
      pattern: {
        type: prev.pattern?.type ?? 'none',
        color: prev.pattern?.color ?? '#ffffff',
        opacity: prev.pattern?.opacity ?? 0.1,
        size: prev.pattern?.size ?? 20,
        thickness: prev.pattern?.thickness ?? 1,
        ...updates
      }
    }));
  };

  const getBackgroundStyle = () => {
    const config = localConfig;
    const styles: React.CSSProperties = { backgroundColor: config.backgroundColor };

    if (config.backgroundGradient?.enabled) {
      const { type, colors, angle } = config.backgroundGradient;
      if (type === 'linear') {
        styles.background = `linear-gradient(${angle}deg, ${colors.join(', ')})`;
      } else if (type === 'radial') {
        styles.background = `radial-gradient(circle, ${colors.join(', ')})`;
      } else if (type === 'conic') {
        styles.background = `conic-gradient(from ${angle}deg, ${colors.join(', ')})`;
      }
    }

    return styles;
  };

  const renderBackgroundLayer = () => {
    const config = localConfig;
    const style = getBackgroundStyle();
    
    if (!config.backgroundGradient?.enabled || config.backgroundGradient.animation === 'none' || !config.backgroundGradient.animation) {
      return <div className="absolute inset-0 transition-all duration-500" style={style} />;
    }

    const { animation, animationSpeed = 1, angle = 0, colors = [] } = config.backgroundGradient;
    const speed = animationSpeed;

    let animate: any = {};
    let transition: any = { duration: 10 / speed, repeat: Infinity, ease: "linear" };

    switch (animation) {
      case 'spin':
        if (config.backgroundGradient.type === 'linear') {
          animate = { background: colors.map((_, i) => `linear-gradient(${angle + (i * 360)}deg, ${colors.join(', ')})`) };
          // Note: CSS gradients don't animate angle easily this way, usually requires a custom property or rotating the whole div
        }
        return (
          <motion.div 
            className="absolute inset-0 origin-center scale-[2]" 
            style={style}
            animate={{ rotate: [0, 360] }}
            transition={transition}
          />
        );
      case 'shift':
        return (
          <motion.div 
            className="absolute inset-0" 
            style={{ 
              ...style, 
              backgroundSize: '200% 200%',
            }}
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ ...transition, duration: 15 / speed, ease: "easeInOut" }}
          />
        );
      case 'pulse':
        return (
          <motion.div 
            className="absolute inset-0" 
            style={style}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ ...transition, duration: 4 / speed, ease: "easeInOut" }}
          />
        );
      default:
        return <div className="absolute inset-0 transition-all duration-500" style={style} />;
    }
  };

  const renderPattern = () => {
    if (!localConfig.pattern || localConfig.pattern.type === 'none') return null;
    const { type, color, opacity, size, thickness } = localConfig.pattern;
    
    let backgroundImage = '';
    let backgroundSize = `${size}px ${size}px`;
    const styles: React.CSSProperties = {};

    switch (type) {
      case 'dots':
        backgroundImage = `radial-gradient(${color} ${thickness}px, transparent ${thickness}px)`;
        break;
      case 'grid':
        backgroundImage = `linear-gradient(${color} ${thickness}px, transparent ${thickness}px), linear-gradient(90deg, ${color} ${thickness}px, transparent ${thickness}px)`;
        break;
      case 'stripes':
        backgroundImage = `linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 50%, ${color} 50%, ${color} 75%, transparent 75%, transparent)`;
        backgroundSize = `${size}px ${size}px`;
        break;
      case 'waves':
        backgroundImage = `radial-gradient(circle at 100% 50%, transparent 20%, ${color} 21%, ${color} 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, ${color} 21%, ${color} 34%, transparent 35%, transparent)`;
        backgroundSize = `${size}px ${size * 2}px`;
        break;
      case 'zigzag':
        backgroundImage = `linear-gradient(135deg, ${color} 25%, transparent 25%), linear-gradient(225deg, ${color} 25%, transparent 25%), linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(315deg, ${color} 25%, transparent 25%)`;
        backgroundSize = `${size}px ${size}px`;
        break;
      case 'crosshatch':
        backgroundImage = `repeating-linear-gradient(45deg, ${color}, ${color} ${thickness}px, transparent ${thickness}px, transparent ${size}px), repeating-linear-gradient(-45deg, ${color}, ${color} ${thickness}px, transparent ${thickness}px, transparent ${size}px)`;
        break;
      case 'polka':
        backgroundImage = `radial-gradient(${color} ${thickness}px, transparent ${thickness}px), radial-gradient(${color} ${thickness}px, transparent ${thickness}px)`;
        backgroundSize = `${size}px ${size}px`;
        const offset = size / 2;
        styles.backgroundPosition = `0 0, ${offset}px ${offset}px`;
        break;
      case 'chevrons':
        backgroundImage = `linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(-45deg, ${color} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${color} 75%), linear-gradient(-45deg, transparent 75%, ${color} 75%)`;
        backgroundSize = `${size}px ${size}px`;
        break;
    }

    const animationProps: any = {};
    if (localConfig.pattern.animation && localConfig.pattern.animation !== 'none') {
      const speed = localConfig.pattern.animationSpeed || 1;
      switch (localConfig.pattern.animation) {
        case 'slide':
          animationProps.animate = { backgroundPosition: ['0px 0px', `${size}px ${size}px`] };
          animationProps.transition = { duration: 10 / speed, repeat: Infinity, ease: "linear" };
          break;
        case 'fade':
          animationProps.animate = { opacity: [opacity * 0.5, opacity, opacity * 0.5] };
          animationProps.transition = { duration: 3 / speed, repeat: Infinity, ease: "easeInOut" };
          break;
        case 'zoom':
          animationProps.animate = { backgroundSize: [`${size}px ${size}px`, `${size * 1.2}px ${size * 1.2}px`, `${size}px ${size}px`] };
          animationProps.transition = { duration: 5 / speed, repeat: Infinity, ease: "easeInOut" };
          break;
      }
    }

    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage,
          backgroundSize,
          opacity,
          zIndex: 1,
          ...styles
        }}
        {...animationProps}
      />
    );
  };

  const PRESETS: { name: string, config: BackgroundConfig }[] = [
    {
      name: "Cyber Neon",
      config: {
        backgroundColor: "#0f172a",
        backgroundGradient: { enabled: true, type: 'linear', colors: ['#0f172a', '#1e1b4b'], angle: 135 },
        pattern: { type: 'grid', color: '#6366f1', opacity: 0.1, size: 40, thickness: 1 },
        overlays: [
          { id: 'p1', shape: 'blob', color: '#6366f1', opacity: 0.2, x: 20, y: 30, width: 60, height: 60, rotation: 0, blur: 40, zIndex: 0, animation: 'float', animationSpeed: 1, animationDuration: 10, animationDelay: 0 },
          { id: 'p2', shape: 'blob', color: '#a855f7', opacity: 0.2, x: 80, y: 70, width: 50, height: 50, rotation: 45, blur: 40, zIndex: 0, animation: 'float', animationSpeed: 0.8, animationDuration: 12, animationDelay: 2 }
        ],
        shapes: []
      }
    },
    {
      name: "Solar Flare",
      config: {
        backgroundColor: "#450a0a",
        backgroundGradient: { enabled: true, type: 'radial', colors: ['#991b1b', '#450a0a'], angle: 0 },
        pattern: { type: 'dots', color: '#f59e0b', opacity: 0.05, size: 20, thickness: 1 },
        overlays: [],
        shapes: [
          { id: 's1', type: 'star', color: '#f59e0b', opacity: 0.6, x: 50, y: 50, size: 40, rotation: 0, blur: 10, zIndex: 0, animation: 'pulse', animationSpeed: 0.5, animationDuration: 4, animationDelay: 0 }
        ]
      }
    },
    {
      name: "Deep Ocean",
      config: {
        backgroundColor: "#0c4a6e",
        backgroundGradient: { enabled: true, type: 'linear', colors: ['#0c4a6e', '#082f49'], angle: 180 },
        pattern: { type: 'waves', color: '#38bdf8', opacity: 0.1, size: 60, thickness: 2 },
        overlays: [
          { id: 'o1', shape: 'circle', color: '#0ea5e9', opacity: 0.1, x: 30, y: 40, width: 80, height: 80, rotation: 0, blur: 60, zIndex: 0, animation: 'float', animationSpeed: 0.5, animationDuration: 15, animationDelay: 0 }
        ],
        shapes: []
      }
    }
  ];

  const applyPreset = (preset: BackgroundConfig) => {
    setLocalConfig(preset);
    setSelectedId(null);
  };

  const selectedElement = 
    localConfig.overlays.find(o => o.id === selectedId) || 
    localConfig.shapes.find(s => s.id === selectedId);

  const renderShapeIcon = (type: string) => {
    switch (type) {
      case 'circle': return <Circle className="w-4 h-4" />;
      case 'square': case 'rect': return <Square className="w-4 h-4" />;
      case 'triangle': return <Triangle className="w-4 h-4" />;
      case 'diamond': return <Diamond className="w-4 h-4" />;
      case 'star': return <Star className="w-4 h-4" />;
      case 'heart': return <Heart className="w-4 h-4" />;
      case 'hexagon': return <Hexagon className="w-4 h-4" />;
      case 'pentagon': return <Pentagon className="w-4 h-4" />;
      case 'blob': return <Cloud className="w-4 h-4" />;
      default: return <Shapes className="w-4 h-4" />;
    }
  };

  const getAnimationProps = useCallback((element: BackgroundShape | BackgroundOverlay) => {
    const animation = element.animation || 'none';
    if (animation === 'none') return {};

    const speed = element.animationSpeed || 1;
    const duration = element.animationDuration || 2;
    const delay = element.animationDelay || 0;
    const rotation = element.rotation || 0;

    // Stable seed for randomness based on ID
    const getSeed = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    };
    const seed = getSeed(element.id);

    const baseTransition = {
      duration: duration / speed,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut" as const
    };

    switch (animation) {
      case 'hover':
        return {
          animate: { y: [0, -15, 0] },
          transition: baseTransition
        };
      case 'spin':
        return {
          animate: { rotate: [rotation, rotation + 360] },
          transition: { ...baseTransition, ease: "linear" as const }
        };
      case 'pulse':
        return {
          animate: { scale: [1, 1.1, 1] },
          transition: baseTransition
        };
      case 'float':
        return {
          animate: { 
            y: [0, -25, 0],
            x: [0, 15, 0],
            rotate: [rotation - 8, rotation + 8, rotation - 8]
          },
          transition: { 
            ...baseTransition, 
            duration: (duration * 2) / speed,
            ease: "easeInOut" as const
          }
        };
      case 'bounce':
        return {
          animate: { y: [0, -40, 0] },
          transition: { 
            ...baseTransition, 
            ease: "easeOut" as const,
            repeatType: "mirror" as const
          }
        };
      case 'shake':
        return {
          animate: { x: [0, -5, 5, -5, 5, 0] },
          transition: { ...baseTransition, duration: 0.5 / speed }
        };
      case 'swing':
        return {
          animate: { rotate: [rotation - 15, rotation + 15, rotation - 15] },
          transition: baseTransition
        };
      case 'slide':
        return {
          animate: { x: [-10, 10, -10] },
          transition: { ...baseTransition, duration: 3 / speed }
        };
      case 'zoom':
        return {
          animate: { scale: [0.9, 1.1, 0.9] },
          transition: { ...baseTransition, duration: 4 / speed }
        };
      case 'glitch':
        return {
          animate: { 
            x: [0, -2, 2, -1, 1, 0],
            opacity: [element.opacity, 0.5, element.opacity, 0.8, element.opacity]
          },
          transition: { 
            ...baseTransition, 
            duration: 0.2 / speed, 
            repeatDelay: (seed % 30) / 10
          }
        };
      default:
        return {};
    }
  }, []);

  const getWillChange = (animation: string) => {
    switch (animation) {
      case 'hover':
      case 'float':
      case 'bounce':
      case 'shake':
      case 'slide':
      case 'zoom':
      case 'pulse':
      case 'spin':
      case 'swing':
        return 'transform';
      case 'glitch':
        return 'transform, opacity';
      default:
        return 'auto';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border-2 border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Background Creation</h2>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1">Design your custom environment</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => onSave(localConfig)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-indigo-600 text-white font-black uppercase text-[10px] sm:text-xs rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" /> Save Background
            </button>
            <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* Sidebar Left - Layers & Controls */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/30 shrink-0 lg:shrink lg:max-h-none">
            <div className="p-4 flex gap-1 shrink-0 overflow-x-auto custom-scrollbar">
              <button 
                onClick={() => setActiveTab('general')}
                className={`px-3 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'general' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
              >
                <Settings2 className="w-3 h-3" /> General
              </button>
              <button 
                onClick={() => setActiveTab('overlays')}
                className={`px-3 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'overlays' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
              >
                <Layers className="w-3 h-3" /> Overlays
              </button>
              <button 
                onClick={() => setActiveTab('shapes')}
                className={`px-3 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'shapes' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
              >
                <Shapes className="w-3 h-3" /> Shapes
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Background Presets</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {PRESETS.map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => applyPreset(preset.config)}
                          className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all text-left flex items-center justify-between group"
                        >
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{preset.name}</span>
                          <Play className="w-3 h-3 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Color</h4>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={localConfig.backgroundColor}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                      />
                      <input 
                        type="text"
                        value={localConfig.backgroundColor}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gradient</h4>
                      <button 
                        onClick={() => handleUpdateGradient({ enabled: !localConfig.backgroundGradient?.enabled })}
                        className={`text-[8px] font-black uppercase px-2 py-1 rounded-md transition-all ${localConfig.backgroundGradient?.enabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                      >
                        {localConfig.backgroundGradient?.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                    {localConfig.backgroundGradient?.enabled && (
                      <div className="space-y-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-3 gap-2">
                          {(['linear', 'radial', 'conic'] as const).map(t => (
                            <button
                              key={t}
                              onClick={() => handleUpdateGradient({ type: t })}
                              className={`py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${localConfig.backgroundGradient?.type === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {localConfig.backgroundGradient.colors.map((c, i) => (
                            <div key={i} className="relative group">
                              <input
                                type="color"
                                value={c}
                                onChange={(e) => {
                                  const newColors = [...localConfig.backgroundGradient!.colors];
                                  newColors[i] = e.target.value;
                                  handleUpdateGradient({ colors: newColors });
                                }}
                                className="w-8 h-8 rounded-lg cursor-pointer"
                              />
                              {localConfig.backgroundGradient!.colors.length > 2 && (
                                <button 
                                  onClick={() => {
                                    const newColors = localConfig.backgroundGradient!.colors.filter((_, idx) => idx !== i);
                                    handleUpdateGradient({ colors: newColors });
                                  }}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button 
                            onClick={() => handleUpdateGradient({ colors: [...localConfig.backgroundGradient!.colors, '#ffffff'] })}
                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        {localConfig.backgroundGradient.type !== 'radial' && (
                          <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Angle: {localConfig.backgroundGradient.angle}°</label>
                            <input 
                              type="range" min="0" max="360"
                              value={localConfig.backgroundGradient.angle}
                              onChange={(e) => handleUpdateGradient({ angle: parseInt(e.target.value) })}
                              className="w-full accent-indigo-600"
                            />
                          </div>
                        )}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Animation</label>
                          <div className="grid grid-cols-4 gap-1">
                            {(['none', 'spin', 'shift', 'pulse'] as const).map(a => (
                              <button
                                key={a}
                                onClick={() => handleUpdateGradient({ animation: a })}
                                className={`py-1 rounded-md text-[7px] font-black uppercase tracking-widest transition-all ${localConfig.backgroundGradient?.animation === a ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                          {localConfig.backgroundGradient.animation !== 'none' && (
                            <div className="mt-2">
                              <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Speed: {localConfig.backgroundGradient.animationSpeed || 1}x</label>
                              <input 
                                type="range" min="0.1" max="5" step="0.1"
                                value={localConfig.backgroundGradient.animationSpeed || 1}
                                onChange={(e) => handleUpdateGradient({ animationSpeed: parseFloat(e.target.value) })}
                                className="w-full accent-indigo-600"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pattern</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(['none', 'dots', 'grid', 'stripes', 'waves', 'zigzag', 'crosshatch', 'polka', 'chevrons'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => handleUpdatePattern({ type: p })}
                          className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${localConfig.pattern?.type === p ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-800'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    {localConfig.pattern && localConfig.pattern.type !== 'none' && (
                      <div className="space-y-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={localConfig.pattern.color}
                            onChange={(e) => handleUpdatePattern({ color: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer"
                          />
                          <div className="flex-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Opacity: {Math.round(localConfig.pattern.opacity * 100)}%</label>
                            <input 
                              type="range" min="0" max="1" step="0.01"
                              value={localConfig.pattern.opacity}
                              onChange={(e) => handleUpdatePattern({ opacity: parseFloat(e.target.value) })}
                              className="w-full accent-indigo-600"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Size: {localConfig.pattern.size}px</label>
                            <input 
                              type="range" min="5" max="100"
                              value={localConfig.pattern.size}
                              onChange={(e) => handleUpdatePattern({ size: parseInt(e.target.value) })}
                              className="w-full accent-indigo-600"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Thickness: {localConfig.pattern.thickness}px</label>
                            <input 
                              type="range" min="1" max="10"
                              value={localConfig.pattern.thickness}
                              onChange={(e) => handleUpdatePattern({ thickness: parseInt(e.target.value) })}
                              className="w-full accent-indigo-600"
                            />
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Animation</label>
                          <div className="grid grid-cols-4 gap-1">
                            {(['none', 'slide', 'fade', 'zoom'] as const).map(a => (
                              <button
                                key={a}
                                onClick={() => handleUpdatePattern({ animation: a })}
                                className={`py-1 rounded-md text-[7px] font-black uppercase tracking-widest transition-all ${localConfig.pattern?.animation === a ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                          {localConfig.pattern.animation !== 'none' && (
                            <div className="mt-2">
                              <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Speed: {localConfig.pattern.animationSpeed || 1}x</label>
                              <input 
                                type="range" min="0.1" max="5" step="0.1"
                                value={localConfig.pattern.animationSpeed || 1}
                                onChange={(e) => handleUpdatePattern({ animationSpeed: parseFloat(e.target.value) })}
                                className="w-full accent-indigo-600"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {activeTab === 'overlays' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Overlay Layers</h4>
                    <button 
                      onClick={handleAddOverlay}
                      className="p-1.5 bg-indigo-600 text-white rounded-lg hover:scale-110 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {localConfig.overlays.map((overlay, idx) => (
                    <button
                      key={overlay.id}
                      onClick={() => setSelectedId(overlay.id)}
                      className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left ${selectedId === overlay.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: overlay.color, opacity: overlay.opacity }}>
                        {renderShapeIcon(overlay.shape)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Overlay {idx + 1}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{overlay.shape}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'shapes' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shape Elements</h4>
                    <button 
                      onClick={handleAddShape}
                      className="p-1.5 bg-indigo-600 text-white rounded-lg hover:scale-110 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {localConfig.shapes.map((shape, idx) => (
                    <button
                      key={shape.id}
                      onClick={() => setSelectedId(shape.id)}
                      className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left ${selectedId === shape.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: shape.color, opacity: shape.opacity }}>
                        {renderShapeIcon(shape.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Shape {idx + 1}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{shape.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Preview Area */}
          <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900">
            {/* Device Toggle */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 bg-white dark:bg-slate-950">
              {(['mobile', 'tablet', 'laptop', 'desktop'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDeviceType(d)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${deviceType === d ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
              <div 
                className={`relative shadow-2xl transition-all duration-500 bg-white dark:bg-slate-950 overflow-hidden ${isLongPressActive ? 'cursor-grabbing' : 'cursor-default'}`}
                style={{
                  ...getPreviewSize(),
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
                ref={previewRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* Background Layer */}
                {renderBackgroundLayer()}
                
                {/* Pattern Layer */}
                {renderPattern()}
                
                {/* Render Overlays */}
                {localConfig.overlays.map((overlay) => (
                  <motion.div
                    key={overlay.id}
                    className={`absolute transition-all duration-300 select-none ${selectedId === overlay.id ? 'ring-4 ring-indigo-500 ring-offset-4 ring-offset-transparent' : ''} ${isLongPressActive && draggingId === overlay.id ? 'scale-110 z-50 opacity-70' : ''}`}
                    initial={false}
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      width: `${overlay.width}%`,
                      height: `${overlay.height}%`,
                      backgroundColor: overlay.color,
                      opacity: overlay.opacity,
                      borderRadius: overlay.shape === 'circle' ? '50%' : overlay.shape === 'blob' ? '30% 70% 70% 30% / 30% 30% 70% 70%' : '0%',
                      transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
                      clipPath: overlay.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : overlay.shape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none',
                      cursor: isLongPressActive ? 'grabbing' : 'grab',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      touchAction: 'none',
                      filter: overlay.blur ? `blur(${overlay.blur}px)` : 'none',
                      zIndex: (overlay.zIndex || 0) + 2,
                      willChange: getWillChange(overlay.animation || 'none')
                    }}
                    {...getAnimationProps(overlay)}
                    onPointerDown={(e) => handlePointerDown(e, overlay.id)}
                  />
                ))}

                {/* Render Shapes */}
                {localConfig.shapes.map((shape) => (
                  <motion.div
                    key={shape.id}
                    className={`absolute flex items-center justify-center transition-all duration-300 select-none ${selectedId === shape.id ? 'ring-4 ring-indigo-500 ring-offset-4 ring-offset-transparent' : ''} ${isLongPressActive && draggingId === shape.id ? 'scale-110 z-50 opacity-70' : ''}`}
                    initial={false}
                    style={{
                      left: `${shape.x}%`,
                      top: `${shape.y}%`,
                      width: `${shape.size}%`,
                      height: `${shape.size}%`,
                      color: shape.color,
                      opacity: shape.opacity,
                      transform: `translate(-50%, -50%) rotate(${shape.rotation}deg)`,
                      cursor: isLongPressActive ? 'grabbing' : 'grab',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      touchAction: 'none',
                      filter: shape.blur ? `blur(${shape.blur}px)` : 'none',
                      zIndex: (shape.zIndex || 0) + 2,
                      willChange: getWillChange(shape.animation || 'none')
                    }}
                    {...getAnimationProps(shape)}
                    onPointerDown={(e) => handlePointerDown(e, shape.id)}
                  >
                    {shape.type === 'circle' && <div className="w-full h-full rounded-full bg-current" />}
                    {shape.type === 'square' && <div className="w-full h-full bg-current" />}
                    {shape.type === 'triangle' && <div className="w-full h-full bg-current" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />}
                    {shape.type === 'diamond' && <div className="w-full h-full bg-current" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />}
                    {shape.type === 'star' && <Star className="w-full h-full fill-current" />}
                    {shape.type === 'heart' && <Heart className="w-full h-full fill-current" />}
                    {shape.type === 'hexagon' && <Hexagon className="w-full h-full fill-current" />}
                    {shape.type === 'pentagon' && <Pentagon className="w-full h-full fill-current" />}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {localConfig.overlays.length === 0 && localConfig.shapes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center opacity-20">
                  <Palette className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-2xl font-black uppercase tracking-widest">Preview Area</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Right - Properties */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/30 shrink-0 lg:shrink lg:max-h-none">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Properties
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {selectedElement ? (
                <>
                  {/* Common Properties: Color, Opacity, Position */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Color</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={selectedElement.color}
                          onChange={(e) => {
                            if ('shape' in selectedElement) handleUpdateOverlay(selectedElement.id, { color: e.target.value });
                            else handleUpdateShape(selectedElement.id, { color: e.target.value });
                          }}
                          className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                        />
                        <input 
                          type="text"
                          value={selectedElement.color}
                          onChange={(e) => {
                            if ('shape' in selectedElement) handleUpdateOverlay(selectedElement.id, { color: e.target.value });
                            else handleUpdateShape(selectedElement.id, { color: e.target.value });
                          }}
                          className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex justify-between">
                        Opacity <span>{Math.round(selectedElement.opacity * 100)}%</span>
                      </label>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={selectedElement.opacity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if ('shape' in selectedElement) handleUpdateOverlay(selectedElement.id, { opacity: val });
                          else handleUpdateShape(selectedElement.id, { opacity: val });
                        }}
                        className="w-full accent-indigo-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex justify-between">
                          X Position <span>{selectedElement.x}%</span>
                        </label>
                        <input 
                          type="range" min="-50" max="150"
                          value={selectedElement.x}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if ('shape' in selectedElement) handleUpdateOverlay(selectedElement.id, { x: val });
                            else handleUpdateShape(selectedElement.id, { x: val });
                          }}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex justify-between">
                          Y Position <span>{selectedElement.y}%</span>
                        </label>
                        <input 
                          type="range" min="-50" max="150"
                          value={selectedElement.y}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if ('shape' in selectedElement) handleUpdateOverlay(selectedElement.id, { y: val });
                            else handleUpdateShape(selectedElement.id, { y: val });
                          }}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Rotation (deg)</label>
                        <input 
                          type="range" min="0" max="360"
                          value={selectedElement.rotation}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if ('shape' in selectedElement) handleUpdateOverlay(selectedElement.id, { rotation: val });
                            else handleUpdateShape(selectedElement.id, { rotation: val });
                          }}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Z-Index</label>
                        <input 
                          type="number"
                          value={selectedElement.zIndex || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if ('shape' in selectedElement) handleUpdateOverlay(selectedElement.id, { zIndex: val });
                            else handleUpdateShape(selectedElement.id, { zIndex: val });
                          }}
                          className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex justify-between">
                        Blur <span>{selectedElement.blur || 0}px</span>
                      </label>
                      <input 
                        type="range" min="0" max="20" step="1"
                        value={selectedElement.blur || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if ('shape' in selectedElement) handleUpdateOverlay(selectedElement.id, { blur: val });
                          else handleUpdateShape(selectedElement.id, { blur: val });
                        }}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Overlay Specific: Width, Height, Shape */}
                  {'shape' in selectedElement && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex justify-between">
                            Width <span>{selectedElement.width}%</span>
                          </label>
                          <input 
                            type="range" min="1" max="200"
                            value={selectedElement.width}
                            onChange={(e) => handleUpdateOverlay(selectedElement.id, { width: parseInt(e.target.value) })}
                            className="w-full accent-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex justify-between">
                            Height <span>{selectedElement.height}%</span>
                          </label>
                          <input 
                            type="range" min="1" max="200"
                            value={selectedElement.height}
                            onChange={(e) => handleUpdateOverlay(selectedElement.id, { height: parseInt(e.target.value) })}
                            className="w-full accent-indigo-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Overlay Shape</label>
                        <div className="grid grid-cols-5 gap-2">
                          {OVERLAY_SHAPES.map(s => (
                            <button
                              key={s}
                              onClick={() => handleUpdateOverlay(selectedElement.id, { shape: s })}
                              className={`p-2 rounded-lg flex items-center justify-center transition-all ${selectedElement.shape === s ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400'}`}
                            >
                              {renderShapeIcon(s)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shape Specific: Size, Type, Animation */}
                  {'type' in selectedElement && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex justify-between">
                          Size <span>{selectedElement.size}%</span>
                        </label>
                        <input 
                          type="range" min="1" max="100"
                          value={selectedElement.size}
                          onChange={(e) => handleUpdateShape(selectedElement.id, { size: parseInt(e.target.value) })}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Shape Type</label>
                        <div className="grid grid-cols-4 gap-2">
                          {BACKGROUND_SHAPES.map(s => (
                            <button
                              key={s}
                              onClick={() => handleUpdateShape(selectedElement.id, { type: s })}
                              className={`p-2 rounded-lg flex items-center justify-center transition-all ${selectedElement.type === s ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400'}`}
                            >
                              {renderShapeIcon(s)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Animation</label>
                        <div className="grid grid-cols-3 gap-2">
                          {ANIMATIONS.map(a => (
                            <button
                              key={a}
                              onClick={() => {
                                if ('shape' in selectedElement) handleUpdateOverlay(selectedElement.id, { animation: a });
                                else handleUpdateShape(selectedElement.id, { animation: a });
                              }}
                              className={`py-2 px-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${selectedElement.animation === a ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400'}`}
                            >
                              {a}
                            </button>
                          ))}
                        </div>
                      </div>
                      {selectedElement.animation && selectedElement.animation !== 'none' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Speed</label>
                              <input 
                                type="range" min="0.1" max="5" step="0.1"
                                value={selectedElement.animationSpeed || 1}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if ('shape' in selectedElement) handleUpdateOverlay(selectedElement.id, { animationSpeed: val });
                                  else handleUpdateShape(selectedElement.id, { animationSpeed: val });
                                }}
                                className="w-full accent-indigo-600"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Duration (s)</label>
                              <input 
                                type="range" min="0.5" max="10" step="0.5"
                                value={selectedElement.animationDuration || 2}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if ('shape' in selectedElement) handleUpdateOverlay(selectedElement.id, { animationDuration: val });
                                  else handleUpdateShape(selectedElement.id, { animationDuration: val });
                                }}
                                className="w-full accent-indigo-600"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Delay (s)</label>
                            <input 
                              type="range" min="0" max="5" step="0.1"
                              value={selectedElement.animationDelay || 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if ('shape' in selectedElement) handleUpdateOverlay(selectedElement.id, { animationDelay: val });
                                else handleUpdateShape(selectedElement.id, { animationDelay: val });
                              }}
                              className="w-full accent-indigo-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleRemoveElement(selectedElement.id)}
                    className="w-full py-3 mt-4 bg-rose-500/10 text-rose-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Element
                  </button>
                </>
              ) : (
                <div className="text-center py-20 opacity-30">
                  <MousePointer2 className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Select an element to edit</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

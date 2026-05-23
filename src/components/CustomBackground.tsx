import React from 'react';
import { motion } from 'motion/react';
import { BackgroundConfig, BackgroundOverlay, BackgroundShape } from '../types';
import { 
  Circle, 
  Square, 
  Triangle, 
  Diamond, 
  Star, 
  Heart, 
  Hexagon, 
  Pentagon,
  Cloud
} from 'lucide-react';

interface CustomBackgroundProps {
  config: BackgroundConfig;
}

export const CustomBackground: React.FC<CustomBackgroundProps> = ({ config }) => {
  const getBackgroundStyle = () => {
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
    const style = getBackgroundStyle();
    
    if (!config.backgroundGradient?.enabled || config.backgroundGradient.animation === 'none' || !config.backgroundGradient.animation) {
      return <div className="absolute inset-0 transition-all duration-500" style={style} />;
    }

    const { animation, animationSpeed = 1, angle = 0, colors = [] } = config.backgroundGradient;
    const speed = animationSpeed;

    let transition: any = { duration: 10 / speed, repeat: Infinity, ease: "linear" };

    switch (animation) {
      case 'spin':
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
    if (!config.pattern || config.pattern.type === 'none') return null;
    const { type, color, opacity, size, thickness, animation, animationSpeed = 1 } = config.pattern;
    
    let backgroundImage = '';
    let backgroundSize = `${size}px ${size}px`;

    switch (type) {
      case 'dots':
        backgroundImage = `radial-gradient(${color} ${thickness}px, transparent ${thickness}px)`;
        break;
      case 'grid':
        backgroundImage = `linear-gradient(${color} ${thickness}px, transparent ${thickness}px), linear-gradient(90deg, ${color} ${thickness}px, transparent ${thickness}px)`;
        break;
      case 'stripes':
        backgroundImage = `linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 50%, ${color} 50%, ${color} 75%, transparent 75%, transparent)`;
        break;
      case 'waves':
        backgroundImage = `radial-gradient(circle at 100% 50%, transparent 20%, ${color} 21%, ${color} 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, ${color} 21%, ${color} 34%, transparent 35%, transparent)`;
        backgroundSize = `${size}px ${size * 2}px`;
        break;
      case 'zigzag':
        backgroundImage = `linear-gradient(135deg, ${color} 25%, transparent 25%), linear-gradient(225deg, ${color} 25%, transparent 25%), linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(315deg, ${color} 25%, transparent 25%)`;
        break;
      case 'crosshatch':
        backgroundImage = `repeating-linear-gradient(45deg, ${color}, ${color} ${thickness}px, transparent ${thickness}px, transparent ${size}px), repeating-linear-gradient(-45deg, ${color}, ${color} ${thickness}px, transparent ${thickness}px, transparent ${size}px)`;
        break;
      case 'polka':
        backgroundImage = `radial-gradient(${color} 25%, transparent 25%), radial-gradient(${color} 25%, transparent 25%)`;
        backgroundSize = `${size}px ${size}px`;
        // Needs offset for polka
        break;
      case 'chevrons':
        backgroundImage = `linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(-45deg, ${color} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${color} 75%), linear-gradient(-45deg, transparent 75%, ${color} 75%)`;
        break;
    }

    const style: React.CSSProperties = {
      backgroundImage,
      backgroundSize,
      opacity,
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none'
    };

    if (type === 'polka') {
      style.backgroundPosition = `0 0, ${size/2}px ${size/2}px`;
    }

    if (!animation || animation === 'none') {
      return <div style={style} />;
    }

    let animate: any = {};
    let transition: any = { duration: 10 / animationSpeed, repeat: Infinity, ease: "linear" };

    switch (animation) {
      case 'slide':
        animate = { backgroundPosition: ['0px 0px', `${size * 2}px ${size * 2}px`] };
        break;
      case 'fade':
        animate = { opacity: [opacity * 0.5, opacity, opacity * 0.5] };
        transition = { duration: 3 / animationSpeed, repeat: Infinity, ease: "easeInOut" };
        break;
      case 'zoom':
        animate = { backgroundSize: [`${size}px ${size}px`, `${size * 1.5}px ${size * 1.5}px`, `${size}px ${size}px`] };
        transition = { duration: 5 / animationSpeed, repeat: Infinity, ease: "easeInOut" };
        break;
    }

    return <motion.div style={style} animate={animate} transition={transition} />;
  };

  const renderOverlay = (overlay: BackgroundOverlay) => {
    const { shape, color, opacity, x, y, width, height, rotation, animation, animationDuration, animationDelay, blur, zIndex } = overlay;
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: `${width}%`,
      height: `${height}%`,
      backgroundColor: color,
      opacity,
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      filter: `blur(${blur}px)`,
      zIndex,
      pointerEvents: 'none'
    };

    if (shape === 'circle') style.borderRadius = '100%';
    if (shape === 'triangle') {
      style.backgroundColor = 'transparent';
      style.width = 0;
      style.height = 0;
      style.borderLeft = `${width / 2}vw solid transparent`;
      style.borderRight = `${width / 2}vw solid transparent`;
      style.borderBottom = `${height}vh solid ${color}`;
    }
    if (shape === 'diamond') {
      style.transform = `translate(-50%, -50%) rotate(${rotation + 45}deg)`;
    }
    if (shape === 'blob') {
      style.borderRadius = '30% 70% 70% 30% / 30% 30% 70% 70%';
    }

    let animate: any = {};
    let transition: any = { duration: animationDuration, delay: animationDelay, repeat: Infinity, ease: "easeInOut" };

    switch (animation) {
      case 'spin': animate = { rotate: [rotation, rotation + 360] }; transition.ease = "linear"; break;
      case 'pulse': animate = { scale: [1, 1.1, 1] }; break;
      case 'float': animate = { y: ['-50%', '-60%', '-50%'] }; break;
      case 'bounce': animate = { y: ['-50%', '-70%', '-50%'] }; transition.ease = "easeOut"; break;
      case 'shake': animate = { x: ['-50%', '-52%', '-48%', '-50%'] }; transition.duration = 0.5; break;
      case 'zoom': animate = { scale: [0.8, 1.2, 0.8] }; break;
      case 'glitch': 
        animate = { 
          x: ['-50%', '-51%', '-49%', '-50%'],
          opacity: [opacity, opacity * 0.5, opacity]
        };
        transition.duration = 0.2;
        break;
    }

    return (
      <motion.div 
        key={overlay.id}
        style={style}
        animate={animate}
        transition={transition}
      />
    );
  };

  const renderShape = (shape: BackgroundShape) => {
    const { type, color, opacity, x, y, size, rotation, animation, animationDuration, animationDelay, blur, zIndex } = shape;
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}vw`,
      height: `${size}vw`,
      color,
      opacity,
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      filter: `blur(${blur}px)`,
      zIndex,
      pointerEvents: 'none'
    };

    let Icon = Star;
    switch (type) {
      case 'circle': Icon = Circle as any; break;
      case 'square': Icon = Square as any; break;
      case 'triangle': Icon = Triangle as any; break;
      case 'diamond': Icon = Diamond as any; break;
      case 'star': Icon = Star as any; break;
      case 'heart': Icon = Heart as any; break;
      case 'hexagon': Icon = Hexagon as any; break;
      case 'pentagon': Icon = Pentagon as any; break;
    }

    let animate: any = {};
    let transition: any = { duration: animationDuration, delay: animationDelay, repeat: Infinity, ease: "easeInOut" };

    switch (animation) {
      case 'spin': animate = { rotate: [rotation, rotation + 360] }; transition.ease = "linear"; break;
      case 'pulse': animate = { scale: [1, 1.2, 1] }; break;
      case 'float': animate = { y: ['-50%', '-60%', '-50%'] }; break;
      case 'bounce': animate = { y: ['-50%', '-70%', '-50%'] }; transition.ease = "easeOut"; break;
      case 'shake': animate = { x: ['-50%', '-52%', '-48%', '-50%'] }; transition.duration = 0.5; break;
      case 'zoom': animate = { scale: [0.5, 1.5, 0.5] }; break;
      case 'glitch': 
        animate = { 
          x: ['-50%', '-51%', '-49%', '-50%'],
          opacity: [opacity, opacity * 0.5, opacity]
        };
        transition.duration = 0.2;
        break;
    }

    return (
      <motion.div 
        key={shape.id}
        style={style}
        animate={animate}
        transition={transition}
      >
        <Icon size="100%" fill="currentColor" />
      </motion.div>
    );
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {renderBackgroundLayer()}
      {renderPattern()}
      {config.overlays.map(renderOverlay)}
      {config.shapes.map(renderShape)}
    </div>
  );
};

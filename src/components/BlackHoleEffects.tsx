import React, { useEffect, useRef } from 'react';

import { AppTheme, BlackHoleSettings } from '../types';

// To hold the app reference outside the component so we can modify it
export let tubesAppRef: any = null;

export const BlackHoleBackground: React.FC<{ theme: AppTheme; isHome?: boolean }> = ({ theme, isHome }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settings = theme.blackHoleSettings;
  const settingsRef = useRef(settings);
  const mouseHoverRef = useRef(false);
  const hideTimeoutRef = useRef<any>(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const onMouseMove = () => {
      mouseHoverRef.current = true;
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        mouseHoverRef.current = false;
      }, 1500); 
    };

    const onTouchMove = (e: TouchEvent) => {
      mouseHoverRef.current = true;
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        mouseHoverRef.current = false;
      }, 1500); 

      if (isHome) {
        const target = e.target as HTMLElement;
        if (
          !target.closest('button') && 
          !target.closest('a') && 
          !target.closest('input') && 
          !target.closest('textarea') && 
          !target.closest('.overflow-y-auto') &&
          !target.closest('.overflow-auto') &&
          !target.closest('.custom-scrollbar')
        ) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
       window.removeEventListener('mousemove', onMouseMove);
       window.removeEventListener('touchmove', onTouchMove);
       clearTimeout(hideTimeoutRef.current);
    };
  }, [isHome]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    let isMounted = true;
    
    // Dynamically import the tubes cursor script from local library
    // @ts-ignore
    import('../lib/tubes1.js')
      .then((module) => {
        if (!isMounted) return;
        const TubesCursor = module.default;
        
        tubesAppRef = TubesCursor(canvasRef.current, {
          tubes: {
            colors: settings?.colors || ["#2d3748", "#1a202c", "#000000", "#3182ce", "#805ad5"],
            count: settings?.strandCount ?? 16,
            minTubularSegments: Math.max(8, Math.floor((settings?.strandLength ?? 128) * 0.25)),
            maxTubularSegments: settings?.strandLength ?? 128,
            lights: {
              intensity: 200,
              colors: ["#ffffff", "#4299e1", "#9f7aea", "#000000"]
            }
          }
        });

        // We handle target calculation by overriding tubes update
        // rather than onBeforeRender, which gives us final say before it moves.
        const originalUpdate = tubesAppRef.tubes.update.bind(tubesAppRef.tubes);
        
        tubesAppRef.tubes.update = function(e: any) {
          const s = tubesAppRef.options;
          const i = tubesAppRef.tubes;
          const r = tubesAppRef.three;

          // Our settings
          const currentSettings = settingsRef.current;
          const interact = currentSettings?.interactWithCursor ?? true;
          const shape = currentSettings?.shape || 'infinity';

          // Dimensions & limits calculation: adapt well on mobile device limits
          const t = r.size.wWidth / r.size.width;
          const baseN = s.sleepRadiusX * t;
          const baseA = s.sleepRadiusY * t;

          // To ensure it doesn't clip on small screens, clamp to 80% of wWidth and wHeight
          const maxDimX = (r.size.wWidth / 2) * 0.8;
          const maxDimY = (r.size.wHeight / 2) * 0.8;
          
          const maxRadiusX = Math.min(baseN, maxDimX);
          const maxRadiusY = Math.min(baseA, maxDimY);
          
          // Use the smallest radius limiting dimension so we don't skew the shape
          const limitRadius = Math.min(maxRadiusX, maxRadiusY);

          // We check if hovering via our custom event listener
          const isHovering = mouseHoverRef.current;

          if (!interact || !isHovering) {
            let targetX = 0, targetY = 0;
            const tElapsed = e.elapsed * Math.max(0.1, (currentSettings?.animationSpeed ?? 1.0));
            switch (shape) {
              case 'circle':
                targetX = limitRadius * Math.cos(tElapsed * s.sleepTimeScale1);
                targetY = limitRadius * Math.sin(tElapsed * s.sleepTimeScale1);
                break;
              case 'flower': {
                const r2 = limitRadius * Math.cos(tElapsed * s.sleepTimeScale1 * 3);
                targetX = r2 * Math.cos(tElapsed * s.sleepTimeScale1);
                targetY = r2 * Math.sin(tElapsed * s.sleepTimeScale1);
                break;
              }
              case 'chaos':
                targetX = maxRadiusX * Math.cos(tElapsed * s.sleepTimeScale1) * Math.sin(tElapsed * s.sleepTimeScale1 * 0.5);
                targetY = maxRadiusY * Math.sin(tElapsed * s.sleepTimeScale2) * Math.cos(tElapsed * s.sleepTimeScale2 * 0.7);
                break;
              case 'spiral': {
                const r3 = (limitRadius * 0.8) * (1 + 0.5 * Math.sin(tElapsed * s.sleepTimeScale1 * 0.5));
                targetX = r3 * Math.cos(tElapsed * s.sleepTimeScale1 * 2);
                targetY = r3 * Math.sin(tElapsed * s.sleepTimeScale1 * 2);
                break;
              }
              case 'orbit': {
                const r4 = maxRadiusX * 0.8;
                targetX = r4 * Math.cos(tElapsed * s.sleepTimeScale1 * 1.5) + (maxRadiusX * 0.2) * Math.cos(tElapsed * s.sleepTimeScale1 * 5);
                targetY = r4 * Math.sin(tElapsed * s.sleepTimeScale1 * 1.5) + (maxRadiusY * 0.2) * Math.sin(tElapsed * s.sleepTimeScale1 * 5);
                break;
              }
              case 'wave': {
                targetX = maxRadiusX * Math.sin(tElapsed * s.sleepTimeScale1 * 0.5);
                targetY = maxRadiusY * Math.sin(tElapsed * s.sleepTimeScale2 * 2) * Math.cos(tElapsed * s.sleepTimeScale1 * 0.8);
                break;
              }
              case 'cyclone': {
                const radiusCyclone = limitRadius * Math.abs(Math.sin(tElapsed * s.sleepTimeScale1 * 0.2));
                targetX = radiusCyclone * Math.cos(tElapsed * s.sleepTimeScale1 * 4);
                targetY = radiusCyclone * Math.sin(tElapsed * s.sleepTimeScale1 * 4);
                break;
              }
              case 'hypnotic': {
                const rHypno = limitRadius * (0.5 + 0.5 * Math.sin(tElapsed * s.sleepTimeScale1));
                targetX = rHypno * Math.cos(tElapsed * s.sleepTimeScale1 * 3);
                targetY = rHypno * Math.sin(tElapsed * s.sleepTimeScale1 * 3);
                break;
              }
              case 'pulsar': {
                const pulsarPhase = Math.pow(Math.sin(tElapsed * s.sleepTimeScale1 * 2), 2);
                targetX = (maxRadiusX * 0.1) * Math.cos(tElapsed * s.sleepTimeScale1 * 8) + (maxRadiusX * pulsarPhase) * Math.cos(tElapsed * s.sleepTimeScale1 * 0.5);
                targetY = (maxRadiusY * 0.1) * Math.sin(tElapsed * s.sleepTimeScale1 * 8) + (maxRadiusY * pulsarPhase) * Math.sin(tElapsed * s.sleepTimeScale1 * 0.5);
                break;
              }
              case 'infinity':
              default:
                targetX = maxRadiusX * Math.cos(tElapsed * s.sleepTimeScale1);
                targetY = maxRadiusY * Math.sin(tElapsed * s.sleepTimeScale2);
                break;
            }
            
            // Override the default sleep logic entirely
            i.target.x = targetX;
            i.target.y = targetY;
          }

          // Screen bounds safeguard (applied to whatever target is, sleep or hover)
          const clampTargetX = (r.size.wWidth / 2) * 0.9;
          const clampTargetY = (r.size.wHeight / 2) * 0.9;
          i.target.x = Math.max(-clampTargetX, Math.min(clampTargetX, i.target.x));
          i.target.y = Math.max(-clampTargetY, Math.min(clampTargetY, i.target.y));

          // NOW run original update so it immediately picks up our modified target
          // and moves the particles towards it seamlessly!
          originalUpdate(e);

          // Force target back to bounds just in case originalUpdate altered it
          i.target.x = Math.max(-clampTargetX, Math.min(clampTargetX, i.target.x));
          i.target.y = Math.max(-clampTargetY, Math.min(clampTargetY, i.target.y));
        };
      })
      .catch((err) => {
        console.error("Failed to load tubes cursor", err);
      });

    const randomColors = (count: number) => {
      return new Array(count)
        .fill(0)
        .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
    };

    const handleClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      // Don't trigger if clicking on an interactive UI element or card
      if (
        target.closest('button') || 
        target.closest('input') || 
        target.closest('textarea') || 
        target.closest('a') || 
        target.closest('select') ||
        target.closest('[role="button"]') ||
        target.closest('.question-card') ||
        target.closest('.glass') ||
        target.closest('.liquid-glass-card') ||
        target.closest('.rounded-\\[2rem\\]') ||
        target.closest('.rounded-\\[2\\.5rem\\]') ||
        target.closest('.bg-white') ||
        target.closest('.dark\\:bg-slate-900') ||
        target.closest('.bg-slate-900')
      ) {
        return;
      }

      if ((settingsRef.current?.colorChangeOnClick ?? true) && tubesAppRef && tubesAppRef.tubes && typeof tubesAppRef.tubes.setColors === 'function') {
        const themeColors = settingsRef.current?.colors || ["#2d3748", "#1a202c", "#000000", "#3182ce", "#805ad5"];
        const primaryColor = themeColors[0];
        const newColors = [primaryColor, ...randomColors(2)];
        tubesAppRef.tubes.setColors(newColors);
        tubesAppRef.tubes.setLightsColors([primaryColor, ...randomColors(3)]);
      }
    };

    // Listen to touchstart to apply color changes instantly on mobile before scrolling kicks in
    document.body.addEventListener('click', handleClick);
    document.body.addEventListener('touchstart', handleClick, { passive: true });

    return () => {
      isMounted = false;
      document.body.removeEventListener('click', handleClick);
      document.body.removeEventListener('touchstart', handleClick);
      if (tubesAppRef && typeof tubesAppRef.dispose === 'function') {
        tubesAppRef.dispose();
      }
      tubesAppRef = null;
    };
  }, [settings?.strandCount, settings?.strandLength]);

  // Update tubes settings when they change without reloading the whole script
  useEffect(() => {
    if (tubesAppRef && settings) {
      if (settings.colors && typeof tubesAppRef.tubes?.setColors === 'function') {
        tubesAppRef.tubes.setColors(settings.colors);
      }
    }
  }, [settings]);

  return (
    <div className="fixed inset-0 z-[-1] bg-black overflow-hidden pointer-events-none">
      {/* On mobile, wrapping canvas in a touch-action container or allowing pointer-events helps if needed, but pointer-events-none ensures it doesn't block UI. The library binds to window. */}
      <canvas ref={canvasRef} className="w-full h-full block touch-none pointer-events-none" />
    </div>
  );
};

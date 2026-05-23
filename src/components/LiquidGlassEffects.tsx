import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import * as THREE from 'three';
import { UICustomization } from '../types';
import { getCachedVideo } from '../utils/videoCache';

interface LiquidGlassProps {
  isDark: boolean;
  accentColor: string;
  view: string;
  customization?: UICustomization;
}

export const LiquidGlassFilters: React.FC<{ customization?: UICustomization }> = () => null;

export const LiquidGlassBackground: React.FC<LiquidGlassProps> = ({ accentColor, customization }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uniformsRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const lastMousePos = useRef<{x: number, y: number} | null>(null);
  const loadedTextureRef = useRef<THREE.Texture | null>(null);
  const loadedAspectRef = useRef<number>(1.5);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (uniformsRef.current && customization) {
      const u = uniformsRef.current;
      if (customization.liquidGlassThickness !== undefined) u.uThickness.value = customization.liquidGlassThickness;
      if (customization.liquidGlassBezel !== undefined) u.uBezel.value = customization.liquidGlassBezel;
      if (customization.liquidGlassIOR !== undefined) u.uIOR.value = customization.liquidGlassIOR;
      if (customization.liquidGlassBlur !== undefined) u.uBlur.value = customization.liquidGlassBlur;
      if (customization.liquidGlassSpecular !== undefined) u.uSpecular.value = customization.liquidGlassSpecular;
      if (customization.liquidGlassTint !== undefined) u.uTint.value = customization.liquidGlassTint / 100;
      if (customization.liquidGlassShadow !== undefined) u.uShadow.value = customization.liquidGlassShadow;
      if (customization.liquidGlassTintColor !== undefined) u.uTintColor.value = new THREE.Color(customization.liquidGlassTintColor);
      if (customization.liquidGlassIridescence !== undefined) u.uIriAmt.value = customization.liquidGlassIridescence;
      if (customization.liquidGlassIridescenceSpeed !== undefined) u.uIriSpeed.value = customization.liquidGlassIridescenceSpeed;
      if (customization.liquidGlassLightDirX !== undefined && customization.liquidGlassLightDirY !== undefined) {
        u.uLightDir.value = new THREE.Vector2(customization.liquidGlassLightDirX, customization.liquidGlassLightDirY);
      }
      if (customization.liquidGlassScaleRatio !== undefined) u.uScaleRatio.value = customization.liquidGlassScaleRatio;
      if (customization.liquidGlassShadowColor !== undefined) u.uShadowColor.value = new THREE.Color(customization.liquidGlassShadowColor);
      if (customization.liquidGlassInnerShadowSpread !== undefined) u.uInnerShadowSpread.value = customization.liquidGlassInnerShadowSpread;
      if (customization.liquidGlassOuterShadowBlur !== undefined) u.uOuterShadowBlur.value = customization.liquidGlassOuterShadowBlur;
      if (customization.liquidGlassChromatic !== undefined) u.uChromatic.value = customization.liquidGlassChromatic;
      
      let shapeInt = 0;
      if (customization.liquidGlassShape === 'convex_circle') shapeInt = 1;
      else if (customization.liquidGlassShape === 'concave') shapeInt = 2;
      else if (customization.liquidGlassShape === 'lip') shapeInt = 3;
      u.uShape.value = shapeInt;
    }
  }, [customization]);

  useEffect(() => {
    let active = true;
    const defaultBg = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop';
    let isVideo = false;
    let targetUrl = '';

    if (accentColor === 'liquid-glass-blue') {
      targetUrl = 'https://www.image2url.com/r2/default/videos/1777332216669-d60eb0bf-c6e4-4fa5-ad6c-9f5bc02a8954.mp4';
      isVideo = true;
    } else if (accentColor.startsWith('liquid-glass-custom-')) {
      isVideo = true;
    }

    const loadContent = async () => {
      // 1. ALWAYS load the beautiful static defaultBg image immediately as our baseline / fallback!
      // This ensures uBgTex gets populated instantly, eliminating the black screen.
      new THREE.TextureLoader().load(defaultBg, (tex) => {
        if (!active) return;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        
        // Only set as current texture if we haven't already successfully linked a VideoTexture.
        if (!loadedTextureRef.current || !(loadedTextureRef.current instanceof THREE.VideoTexture)) {
          loadedTextureRef.current = tex;
          loadedAspectRef.current = tex.image.width / tex.image.height;
          if (uniformsRef.current) {
            uniformsRef.current.uBgTex.value = tex;
            uniformsRef.current.uBgAspect.value = loadedAspectRef.current;
          }
        }
      });

      if (isVideo) {
        if (!videoRef.current) {
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.autoplay = true;
          video.className = "w-full h-full object-cover";
          video.setAttribute('muted', '');
          video.setAttribute('playsinline', '');
          video.setAttribute('autoplay', '');
          videoRef.current = video;
        }

        if (videoContainerRef.current && !videoContainerRef.current.contains(videoRef.current)) {
          videoContainerRef.current.appendChild(videoRef.current);
        }

        let mediaUrl = targetUrl;
        
        // Auto-detect if we are on server-backed environments vs static hosts like Netlify.
        // /api/proxy?url=... will result in 404 in static hosting setups.
        const isSelfHosted = window.location.hostname.includes('localhost') || 
                             window.location.hostname.includes('127.0.0.1') || 
                             window.location.hostname.includes('run.app');
        
        if (accentColor === 'liquid-glass-blue') {
          if (isSelfHosted) {
            mediaUrl = '/api/proxy?url=' + encodeURIComponent(targetUrl);
          } else {
            // Static hosting like Netlify: try direct URL first (relying on target CORS policy if open).
            mediaUrl = targetUrl;
          }
        } else if (accentColor.startsWith('liquid-glass-custom-')) {
          const cacheData = await getCachedVideo(accentColor);
          if (cacheData?.url) {
            mediaUrl = cacheData.url;
          }
        }

        if (!active) return;

        if (mediaUrl || accentColor.startsWith('liquid-glass-custom-')) {
          videoRef.current.src = mediaUrl;
          videoRef.current.load();
          
          let playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              if (!active) return;
              
              const tex = new THREE.VideoTexture(videoRef.current!);
              tex.minFilter = THREE.LinearFilter;
              tex.magFilter = THREE.LinearFilter;
              
              loadedTextureRef.current = tex;
              if (uniformsRef.current) {
                uniformsRef.current.uBgTex.value = tex;
              }

              const checkSize = () => {
                 if (videoRef.current && videoRef.current.videoWidth > 0) {
                   const aspect = videoRef.current.videoWidth / videoRef.current.videoHeight;
                   loadedAspectRef.current = aspect;
                   if (uniformsRef.current) {
                     uniformsRef.current.uBgAspect.value = aspect;
                   }
                 } else if (active) {
                   requestAnimationFrame(checkSize);
                 }
              };
              checkSize();
            }).catch((err) => {
              console.warn('Video play was rejected or prevented:', err);
              // Safe fallback is already fully rendered!
            });
          }

          // Attach a robust loading error listener to automatically revert to fallback or retry raw.
          const handleVideoError = () => {
            console.warn('Video loading error encountered at:', mediaUrl);
            if (mediaUrl.includes('/api/proxy') && videoRef.current) {
              console.log('Proxy failed. Retrying direct load from original targetURL...');
              mediaUrl = targetUrl;
              videoRef.current.src = targetUrl;
              videoRef.current.load();
              videoRef.current.play().then(() => {
                if (!active) return;
                const tex = new THREE.VideoTexture(videoRef.current!);
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                loadedTextureRef.current = tex;
                if (uniformsRef.current) {
                  uniformsRef.current.uBgTex.value = tex;
                }
              }).catch((e) => {
                console.warn('All attempts to load background video failed:', e);
                // Safe static fallback was already loaded and remains active!
              });
            }
          };
          videoRef.current.addEventListener('error', handleVideoError);
        }
      } else {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = "";
          if (videoContainerRef.current && videoContainerRef.current.contains(videoRef.current)) {
            videoContainerRef.current.removeChild(videoRef.current);
          }
        }
      }
    };

    /* Bypassed old caching/proxy logic
    const unusedBypassPlaceholder = async () => {
      return;
      if (isVideo) {
        setLoading(true);
        const proxyUrl = '/api/proxy?url=' + encodeURIComponent(targetUrl);
        let cacheData = await getCachedVideo(targetUrl);
        let blobUrl = cacheData?.url || null;
        let blobType = cacheData?.type || 'video/mp4';
        
        if (!blobUrl && !targetUrl.startsWith('liquid-glass-custom-')) {
          try {
            const response = await fetch(proxyUrl);
            const blob = await response.blob();
            await cacheVideo(targetUrl, blob);
            blobUrl = URL.createObjectURL(blob);
            blobType = blob.type;
          } catch (e) {
            console.error('Video/Image fetch failed', e);
            blobUrl = null;
          }
        }
        
        if (!active) {
           if (blobUrl) URL.revokeObjectURL(blobUrl);
           return;
        }
        
        setLoading(false);
        if (!blobUrl) return;

        if (blobType.startsWith('image/')) {
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = "";
            if (videoContainerRef.current && videoContainerRef.current.contains(videoRef.current)) {
              videoContainerRef.current.removeChild(videoRef.current);
            }
          }
          new THREE.TextureLoader().load(blobUrl, (tex) => {
             if (!active) {
                URL.revokeObjectURL(blobUrl);
                return;
             }
             tex.minFilter = THREE.LinearFilter;
             tex.magFilter = THREE.LinearFilter;
             if (uniformsRef.current) {
                uniformsRef.current.uBgTex.value = tex;
                uniformsRef.current.uBgAspect.value = tex.image.width / tex.image.height;
             }
          });
        } else {
          if (!videoRef.current) {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.className = "w-full h-full object-cover";
            videoRef.current = video;
          }

          if (videoContainerRef.current && !videoContainerRef.current.contains(videoRef.current)) {
            videoContainerRef.current.appendChild(videoRef.current);
          }

          videoRef.current.src = blobUrl;
          videoRef.current.play().catch(() => {});

          const tex = new THREE.VideoTexture(videoRef.current);
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          if (uniformsRef.current) {
            uniformsRef.current.uBgTex.value = tex;
            const checkSize = () => {
               if (videoRef.current && videoRef.current.videoWidth > 0) {
                 uniformsRef.current.uBgAspect.value = videoRef.current.videoWidth / videoRef.current.videoHeight;
               } else if (active) {
                 requestAnimationFrame(checkSize);
               }
            };
            checkSize();
          }
        }
      } else {
        setLoading(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = "";
          if (videoContainerRef.current && videoContainerRef.current.contains(videoRef.current)) {
            videoContainerRef.current.removeChild(videoRef.current);
          }
        }
        new THREE.TextureLoader().load(defaultBg, (tex) => {
          if (!active) return;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          if (uniformsRef.current) {
            uniformsRef.current.uBgTex.value = tex;
            uniformsRef.current.uBgAspect.value = tex.image.width / tex.image.height;
          }
        });
      }
    };
    */

    loadContent();

    return () => {
      active = false;
      if (videoRef.current) {
        videoRef.current.pause();
        const src = videoRef.current.src;
        if (src.startsWith('blob:')) URL.revokeObjectURL(src);
        videoRef.current.src = "";
        videoRef.current.load();
        if (videoContainerRef.current && videoContainerRef.current.contains(videoRef.current)) {
          videoContainerRef.current.removeChild(videoRef.current);
        }
      }
    };
  }, [accentColor]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;

      uniform vec2 uResolution;
      uniform int uGlassCount;
      uniform vec4 uGlassRects[200];
      uniform float uGlassRadius[200];
      
      uniform float uBezel;
      uniform float uThickness;
      uniform float uIOR;
      uniform float uBlur;
      uniform float uSpecular;
      uniform float uTint;
      uniform vec3 uTintColor;
      uniform float uShadow;
      uniform float uTime;
      uniform float uIriAmt;
      uniform float uIriSpeed;
      uniform vec2 uLightDir;
      uniform int uShape;
      uniform float uScaleRatio;
      uniform vec3 uShadowColor;
      uniform float uInnerShadowSpread;
      uniform float uOuterShadowBlur;
      uniform float uChromatic;
      uniform vec2 uMouse;
      
      uniform sampler2D uBgTex;
      uniform float uBgAspect;

      float sdRoundedRect(vec2 p, vec2 halfSize, float r) {
        vec2 q = abs(p) - halfSize + r;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
      }

      float surfaceHeight(float x) {
        if (uShape == 1) { // convex_circle
          return sqrt(1.0 - (1.0 - x) * (1.0 - x));
        } else if (uShape == 2) { // concave
          return 1.0 - sqrt(1.0 - (1.0 - x) * (1.0 - x));
        } else if (uShape == 3) { // lip
          float convex = pow(1.0 - pow(1.0 - min(x * 2.0, 1.0), 4.0), 0.25);
          float concave = 1.0 - sqrt(1.0 - (1.0 - x) * (1.0 - x)) + 0.1;
          float t = 6.0 * pow(x, 5.0) - 15.0 * pow(x, 4.0) + 10.0 * pow(x, 3.0);
          return mix(convex, concave, t);
        } else { // convex_squircle
          float s = 1.0 - x;
          return pow(1.0 - s*s*s*s, 0.25);
        }
      }

      vec3 sampleBg(vec2 screenUV) {
        float screenAspect = uResolution.x / uResolution.y;
        vec2 uv = screenUV;
        if (uBgAspect > screenAspect) {
          float s = screenAspect / uBgAspect;
          uv.x = uv.x * s + (1.0 - s) * 0.5;
        } else {
          float s = uBgAspect / screenAspect;
          uv.y = uv.y * s + (1.0 - s) * 0.5;
        }
        uv.y = 1.0 - uv.y;
        return texture2D(uBgTex, uv).rgb;
      }

      vec3 sampleBgBlurred(vec2 uv, float radius) {
        if (radius < 0.5) return sampleBg(uv);
        vec3 sum = vec3(0.0);
        vec2 px = 1.0 / uResolution;
        vec2 offsets[16];
        offsets[0]  = vec2(-0.94201, -0.39906); offsets[1]  = vec2( 0.94558, -0.76890);
        offsets[2]  = vec2(-0.09418, -0.92938); offsets[3]  = vec2( 0.34495,  0.29387);
        offsets[4]  = vec2(-0.91588, -0.45771); offsets[5]  = vec2(-0.81544,  0.48568);
        offsets[6]  = vec2(-0.38277, -0.56071); offsets[7]  = vec2(-0.12675,  0.84686);
        offsets[8]  = vec2( 0.89642,  0.41254); offsets[9]  = vec2( 0.18150, -0.30020);
        offsets[10] = vec2(-0.01445, -0.16001); offsets[11] = vec2( 0.59614,  0.71118);
        offsets[12] = vec2( 0.49742, -0.47280); offsets[13] = vec2( 0.80685,  0.04588);
        offsets[14] = vec2(-0.32490, -0.03965); offsets[15] = vec2(-0.60975,  0.06566);
        for (int i = 0; i < 16; i++) { sum += sampleBg(uv + offsets[i] * radius * px); }
        return sum / 16.0;
      }

      void main() {
        vec2 screenPx = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
        float minDist = 9999.0;
        int closestIdx = -1;
        vec2 closestP = vec2(0.0);
        vec2 closestHalfSize = vec2(0.0);
        float closestRadius = 0.0;
        bool isInside = false;

        for(int i = 0; i < 200; i++) {
          if (i >= uGlassCount) break;
          vec2 center = uGlassRects[i].xy;
          vec2 size = uGlassRects[i].zw;
          vec2 p = screenPx - center;
          vec2 halfSize = size * 0.5;
          float r = uGlassRadius[i];
          float d = sdRoundedRect(p, halfSize, r);
          if (d <= 0.0) {
             isInside = true;
             minDist = d;
             closestIdx = i;
             closestP = p;
             closestHalfSize = halfSize;
             closestRadius = r;
          } else if (!isInside && d < minDist) {
             minDist = d;
             closestIdx = i;
             closestP = p;
             closestHalfSize = halfSize;
             closestRadius = r;
          }
        }
        
        if (minDist > max(60.0, uOuterShadowBlur * 30.0) || closestIdx == -1) {
           gl_FragColor = vec4(sampleBg(screenPx / uResolution), 1.0);
           return;
        }
        
        if (minDist > 0.0) {
          float outerSpread = max(1.0, uOuterShadowBlur * 10.0);
          float shadowFalloff = exp(-minDist * minDist / (outerSpread * outerSpread));
          float shadowAlpha = uShadow * shadowFalloff * 0.6;
          vec3 bgCol = sampleBg(screenPx / uResolution);
          gl_FragColor = vec4(mix(bgCol, uShadowColor, shadowAlpha), 1.0);
          return;
        }

        float distFromEdge = -minDist;
        float bezel = max(0.1, min(uBezel, min(closestRadius, min(closestHalfSize.x, closestHalfSize.y)) - 1.0));
        float t = clamp(distFromEdge / bezel, 0.0, 1.0);
        float h = surfaceHeight(t);
        float dt = 0.001;
        float h2 = surfaceHeight(min(t + dt, 1.0));
        float dh = (h2 - h) / dt;
        float slopeAngle = atan(dh * (uThickness / bezel));
        float sinR = sin(slopeAngle) / uIOR;
        sinR = clamp(sinR, -1.0, 1.0);
        float thetaR = asin(sinR);
        float displacement = h * uThickness * (tan(slopeAngle) - tan(thetaR));
        vec2 grad;
        float eps = 0.5;
        grad.x = sdRoundedRect(closestP + vec2(eps, 0.0), closestHalfSize, closestRadius) - minDist;
        grad.y = sdRoundedRect(closestP + vec2(0.0, eps), closestHalfSize, closestRadius) - minDist;
        grad = grad / (length(grad) + 0.0001);
        vec2 offset = -grad * displacement / uResolution;
        vec2 screenUV = screenPx / uResolution;
        
        vec2 refractedUV = screenUV + offset;
        refractedUV = (refractedUV - 0.5) * max(0.01, uScaleRatio) + 0.5;
        
        vec3 color;
        if (uChromatic > 0.001) {
          float ch = uChromatic * 0.01;
          color.r = sampleBgBlurred(refractedUV - grad * ch, uBlur).r;
          color.g = sampleBgBlurred(refractedUV, uBlur).g;
          color.b = sampleBgBlurred(refractedUV + grad * ch, uBlur).b;
        } else {
          color = sampleBgBlurred(refractedUV, uBlur);
        }

        // Majestic Iridescence
        float iri = sin(refractedUV.x * 3.0 + uTime * uIriSpeed) * cos(refractedUV.y * 3.0 + uTime * uIriSpeed);
        vec3 iriCol = 0.5 + 0.5 * cos(uTime * (uIriSpeed * 0.4) + refractedUV.xyx * 2.0 + vec3(0,2,4));
        color = mix(color, color + iriCol, clamp(iri * uIriAmt, 0.0, 1.0));

        vec2 lightDir = normalize(uLightDir);
        float rimDot = abs(dot(grad, lightDir));
        float rimFalloff = 1.0 - smoothstep(0.0, bezel * 0.4, distFromEdge);
        float specHighlight = pow(rimDot * rimFalloff, 1.5);
        color += vec3(specHighlight * uSpecular);
        
        float innerShadowSpread = max(0.01, uInnerShadowSpread);
        float innerShadow = 1.0 - smoothstep(0.0, bezel * innerShadowSpread, distFromEdge);
        color = mix(color, uShadowColor, innerShadow * 0.5 * uShadow);
        
        float innerRim = smoothstep(0.0, 2.0, distFromEdge) * (1.0 - smoothstep(2.0, 5.0, distFromEdge));
        color += vec3(innerRim * 0.15 * uSpecular);
        color = mix(color, uTintColor, uTint);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uGlassCount: { value: 0 },
        uGlassRects: { value: Array(200).fill(null).map(() => new THREE.Vector4(0,0,0,0)) },
        uGlassRadius: { value: Array(200).fill(0) },
        uThickness: { value: customization?.liquidGlassThickness ?? 50 },
        uBezel: { value: customization?.liquidGlassBezel ?? 60 },
        uIOR: { value: customization?.liquidGlassIOR ?? 3.0 },
        uBlur: { value: customization?.liquidGlassBlur ?? 1.5 },
        uSpecular: { value: customization?.liquidGlassSpecular ?? 0.55 },
        uTint: { value: (customization?.liquidGlassTint ?? 8) / 100 },
        uTintColor: { value: new THREE.Color(customization?.liquidGlassTintColor ?? '#ffffff') },
        uShadow: { value: customization?.liquidGlassShadow ?? 0 },
        uIriAmt: { value: customization?.liquidGlassIridescence ?? 0.08 },
        uIriSpeed: { value: customization?.liquidGlassIridescenceSpeed ?? 0.5 },
        uLightDir: { value: new THREE.Vector2(customization?.liquidGlassLightDirX ?? 0.5, customization?.liquidGlassLightDirY ?? -0.7) },
        uShape: { value: customization?.liquidGlassShape === 'lip' ? 3 : customization?.liquidGlassShape === 'concave' ? 2 : customization?.liquidGlassShape === 'convex_circle' ? 1 : 0 },
        uScaleRatio: { value: customization?.liquidGlassScaleRatio ?? 1.0 },
        uShadowColor: { value: new THREE.Color(customization?.liquidGlassShadowColor ?? '#000000') },
        uInnerShadowSpread: { value: customization?.liquidGlassInnerShadowSpread ?? 0.6 },
        uOuterShadowBlur: { value: customization?.liquidGlassOuterShadowBlur ?? 24.0 },
        uChromatic: { value: customization?.liquidGlassChromatic ?? 0.0 },
        uMouse: { value: new THREE.Vector2(-1000, -1000) },
        uTime: { value: 0 },
        uBgTex: { value: null },
        uBgAspect: { value: 1.5 },
      },
      depthTest: false,
    });
    uniformsRef.current = material.uniforms;
    if (loadedTextureRef.current) {
      material.uniforms.uBgTex.value = loadedTextureRef.current;
      material.uniforms.uBgAspect.value = loadedAspectRef.current;
    }

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    let animationId: number;
    let oldEls = new Set<HTMLElement>();

    const render = () => {
      if (!material.uniforms.uBgTex.value) {
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
        animationId = requestAnimationFrame(render);
        return;
      }

      // Update Mouse position
      if (lastMousePos.current) {
        material.uniforms.uMouse.value.set(lastMousePos.current.x, lastMousePos.current.y);
      }

      const els = document.querySelectorAll('.visual-liquid-glass button:not(.no-webgl), .visual-liquid-glass .glass:not(.no-webgl), .visual-liquid-glass .card:not(.no-webgl), .visual-liquid-glass .question-card:not(.no-webgl), .visual-liquid-glass input:not(.no-webgl), .visual-liquid-glass textarea:not(.no-webgl), .visual-liquid-glass .liquid-glass-progress, .visual-liquid-glass .liquid-glass-progress-container, .visual-liquid-glass .liquid-glass-header, .visual-liquid-glass .liquid-glass-modal, .visual-liquid-glass .liquid-glass-item');
      const count = Math.min(els.length, 200);
      const rects = [];
      const radii = [];
      const newEls = new Set<HTMLElement>();

      for (let i = 0; i < count; i++) {
        const el = els[i] as HTMLElement;
        const rect = el.getBoundingClientRect();
        
        if (rect.width === 0 || rect.height === 0) continue;
        newEls.add(el);
        
        rects.push(new THREE.Vector4(rect.left + rect.width / 2, rect.top + rect.height / 2, rect.width, rect.height));
        
        // Cache border radius to avoid getComputedStyle every frame
        if (!el.dataset.lgRadius) {
          const style = window.getComputedStyle(el);
          let r = parseInt(style.borderRadius) || 16;
          if (style.borderRadius.includes('%') || style.borderRadius === '9999px' || r > Math.min(rect.width, rect.height) / 2) {
              r = Math.min(rect.width, rect.height) / 2;
          }
          el.dataset.lgRadius = r.toString();
        }
        radii.push(parseFloat(el.dataset.lgRadius));
      }
      
      const realCount = rects.length;

      // Separate writes to avoid layout thrashing
      newEls.forEach(el => {
        if (!el.dataset.lgStyled) {
          el.dataset.lgStyled = "true";
          el.style.setProperty('background', 'transparent', 'important');
          el.style.setProperty('background-color', 'transparent', 'important');
          el.style.setProperty('backdrop-filter', 'none', 'important');
          el.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
          el.style.setProperty('box-shadow', 'none', 'important');
          el.style.setProperty('border', 'none', 'important');
        }
      });
      
      oldEls.forEach(el => {
        if (!newEls.has(el)) {
          el.style.removeProperty('background');
          el.style.removeProperty('background-color');
          el.style.removeProperty('backdrop-filter');
          el.style.removeProperty('-webkit-backdrop-filter');
          el.style.removeProperty('box-shadow');
          el.style.removeProperty('border');
          delete el.dataset.lgStyled;
          delete el.dataset.lgRadius;
        }
      });
      oldEls = newEls;
      
      for(let i = realCount; i < 200; i++){
          rects.push(new THREE.Vector4(-1000,-1000,0,0));
          radii.push(0);
      }

      material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      material.uniforms.uGlassCount.value = realCount;
      material.uniforms.uGlassRects.value = rects;
      material.uniforms.uGlassRadius.value = radii;
      material.uniforms.uTime.value += 0.016;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => renderer.setSize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      oldEls.forEach(el => {
          el.style.removeProperty('background');
          el.style.removeProperty('background-color');
          el.style.removeProperty('backdrop-filter');
          el.style.removeProperty('-webkit-backdrop-filter');
          el.style.removeProperty('box-shadow');
          el.style.removeProperty('border');
          delete el.dataset.lgStyled;
          delete el.dataset.lgRadius;
      });
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      {/* Invisible container sized same as the screen full size with video playing on repeat inside */}
      <div ref={videoContainerRef} className="absolute inset-0 w-full h-full opacity-0 pointer-events-none overflow-hidden" />
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export const LiquidGlassOverlay: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden"
      style={{
        width: '100vw',
        height: '100dvh',
        top: 0,
        left: 0
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        {/* Centered container for potential content */}
        <div className="pointer-events-auto">
           {children}
        </div>
        
        {/* Global Liquid Glass Vignette/Frame */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white/[0.07] to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white/[0.03] to-transparent" />
          {/* Internal refractive border look */}
          <div className="absolute inset-10 border-[1px] border-white/10 rounded-[60px] blur-[1px] pointer-events-none opacity-30 optimization-hide" />
          <div className="absolute inset-0 border-[80px] border-black/20 blur-[100px] pointer-events-none optimization-hide" />
        </div>
      </div>
    </div>,
    document.body
  );
};

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import chroma from 'chroma-js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// 3D Simplex Noise Shader Helper Chunks
const simplexNoiseGLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - D.yyy;

  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ) )
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ) ) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ) );

  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const getAdjustedFov = (width: number, height: number, baseFov: number = 48) => {
  const aspect = width / height;
  if (aspect < 1) {
    // Keep consistent horizontal framing on narrower orientations (portrait)
    const rad = (baseFov * Math.PI) / 180;
    const adjustedRad = 2 * Math.atan(Math.tan(rad / 2) / aspect);
    return (adjustedRad * 180) / Math.PI;
  }
  return baseFov;
};

const adjustTextureOffset = (texture: THREE.Texture, width: number, height: number, meshMaterialUniforms?: any, bgPassUniforms?: any) => {
  const image = texture.image as any;
  if (!image) return;
  const imageWidth = image.width || image.videoWidth;
  const imageHeight = image.height || image.videoHeight;
  if (!imageWidth || !imageHeight) return;

  const imageAspect = imageWidth / imageHeight;
  const screenAspect = width / height;

  texture.matrixAutoUpdate = false;
  if (screenAspect > imageAspect) {
    // Screen is wider than image aspect ratio: fit horizontally, crop vertically
    const repeatX = 1;
    const repeatY = imageAspect / screenAspect;
    texture.matrix.setUvTransform(0, 0, repeatX, repeatY, 0, 0.5, 0.5);
  } else {
    // Screen is taller than image aspect ratio: fit vertically, crop horizontally
    const repeatX = screenAspect / imageAspect;
    const repeatY = 1;
    texture.matrix.setUvTransform(0, 0, repeatX, repeatY, 0, 0.5, 0.5);
  }
  
  if (meshMaterialUniforms && meshMaterialUniforms.uTextureMatrix) {
    meshMaterialUniforms.uTextureMatrix.value.copy(texture.matrix);
  }
  if (bgPassUniforms && bgPassUniforms.uTextureMatrix) {
    bgPassUniforms.uTextureMatrix.value.copy(texture.matrix);
  }
};

const CustomBackgroundShader = {
  uniforms: {
    tDiffuse: { value: null },
    uBgTexture: { value: null },
    uHasBg: { value: false },
    uTextureMatrix: { value: new THREE.Matrix3() }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D uBgTexture;
    uniform bool uHasBg;
    uniform mat3 uTextureMatrix;
    varying vec2 vUv;
    void main() {
      vec4 sceneColor = texture2D( tDiffuse, vUv );
      if ( uHasBg ) {
        vec2 uv = (uTextureMatrix * vec3(vUv, 1.0)).xy;
        vec4 bgColor = texture2D( uBgTexture, uv );
        // High quality blending: foreground objects are blended using their alpha, 
        // while the bloom glow from the foreground naturally brightens the background
        vec3 finalColor = bgColor.rgb * ( 1.0 - sceneColor.a ) + sceneColor.rgb;
        gl_FragColor = vec4( finalColor, 1.0 );
      } else {
        gl_FragColor = sceneColor;
      }
    }
  `
};

export const EmissiveBlackHoleBackground = ({ performanceMode, settings }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(settings);
  const extractedColorRef = useRef<string | null>(null);

  // Sync settings ref
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!settings?.emissiveCustomBackground) {
      extractedColorRef.current = null;
      return;
    }

    let cleanup = false;
    
    const extractColor = (source: HTMLVideoElement | HTMLImageElement) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(source, 0, 0, 64, 64);
        const data = ctx.getImageData(0, 0, 64, 64).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 128) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          let hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          
          try {
            hex = chroma(hex).saturate(2).brighten(1).hex();
          } catch(e) {}
          
          if (!cleanup) extractedColorRef.current = hex;
        }
      } catch(e) {
        console.error(e);
      }
    };

    if (settings.emissiveCustomBackgroundType === 'video') {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = settings.emissiveCustomBackground;
      video.muted = true;
      video.onloadeddata = () => {
        // Sample at 1 second or halfway through
        video.currentTime = Math.min(1, Math.max(0.1, video.duration / 2 || 0));
      };
      video.onseeked = () => {
        extractColor(video);
      };
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        extractColor(img);
      };
      img.src = settings.emissiveCustomBackground;
    }

    return () => { cleanup = true; }
  }, [settings?.emissiveCustomBackground, settings?.emissiveCustomBackgroundType]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Config parameters from settings or fallbacks
    const emissiveFrequency = settings?.emissiveFrequency ?? 0.25;
    const emissiveAmplitude = settings?.emissiveAmplitude ?? 9.0;
    const emissiveEdgeWidth = settings?.emissiveEdgeWidth ?? 0.1;
    const emissiveSpeed = settings?.emissiveSpeed ?? 0.9;
    const emissiveBloom = settings?.emissiveBloom ?? 0.1;
    const emissiveBloomThreshold = settings?.emissiveBloomThreshold ?? 0.15;
    const emissiveBloomRadius = settings?.emissiveBloomRadius ?? 1.0;
    const emissiveParticleVisible = settings?.emissiveParticleVisible !== false;
    const emissiveParticleBaseSize = settings?.emissiveParticleBaseSize ?? 55;
    const emissiveParticleSpeedFactor = settings?.emissiveParticleSpeedFactor ?? 0.022;
    const emissiveVelocityFactorX = settings?.emissiveVelocityFactorX ?? 2.5;
    const emissiveVelocityFactorY = settings?.emissiveVelocityFactorY ?? 2.0;
    const emissiveWaveAmplitude = settings?.emissiveWaveAmplitude ?? 1.5;
    const colorHex = extractedColorRef.current || settings?.colors?.[0] || '#88ccff';

    const color = new THREE.Color(colorHex);

    const scene = new THREE.Scene();
    if (!settings?.emissiveCustomBackground) {
      scene.background = new THREE.Color(0x020205);
    }
    scene.fog = new THREE.FogExp2(0x020205, 0.015);

    const initialFov = getAdjustedFov(window.innerWidth, window.innerHeight, 48);
    const camera = new THREE.PerspectiveCamera(initialFov, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 30);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: !performanceMode, 
      powerPreference: 'high-performance',
      alpha: !!settings?.emissiveCustomBackground,
      premultipliedAlpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (settings?.emissiveCustomBackground) {
      renderer.setClearColor(0x000000, 0.0); // Full brightness background
    }
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5 * emissiveSpeed;
    controls.enablePan = false;
    controls.maxDistance = 60;
    controls.minDistance = 15;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 20, 15);
    scene.add(dirLight);

    // Load particle texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    const particleTexture = textureLoader.load('https://www.image2url.com/r2/default/images/1779293037155-d7413de7-4d2c-4c2a-b5e4-7e10e0d4ed5c.png');

    const emissiveShape = settings?.emissiveShape || 'sphere';

    const getGeometryForShape = (type: string) => {
      switch (type) {
        case 'torus':
          return new THREE.TorusGeometry(6.5, 2.0, 32, 64);
        case 'sphere':
          return new THREE.SphereGeometry(6.5, 64, 64);
        case 'icosahedron':
          return new THREE.IcosahedronGeometry(7, 3);
        case 'cube':
          return new THREE.BoxGeometry(8, 8, 8, 16, 16, 16);
        case 'cylinder':
          return new THREE.CylinderGeometry(4.5, 4.5, 10, 32, 16);
        case 'cone':
          return new THREE.ConeGeometry(5, 10, 32, 16);
        case 'torusKnot':
        default:
          return new THREE.TorusKnotGeometry(7, 1.8, 120, 16, 2, 3);
      }
    };

    // Create the central accretion mesh
    const geometry = getGeometryForShape(emissiveShape);
    
    // Load custom background texture if present
    let bgTexture: THREE.Texture | null = null;
    let videoEl: HTMLVideoElement | null = null;
    if (settings?.emissiveCustomBackground) {
      if (settings.emissiveCustomBackgroundType === 'video') {
        videoEl = document.createElement('video');
        videoEl.src = settings.emissiveCustomBackground;
        videoEl.loop = true;
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.crossOrigin = 'anonymous';
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn("Auto-play prevented or interrupted:", error);
          });
        }
        bgTexture = new THREE.VideoTexture(videoEl);
        bgTexture.minFilter = THREE.LinearFilter;
        bgTexture.magFilter = THREE.LinearFilter;
        videoEl.addEventListener('loadeddata', () => {
          // Adjustments handled in the animation loop
        });
      } else {
        bgTexture = new THREE.TextureLoader().load(settings.emissiveCustomBackground);
      }
      bgTexture.colorSpace = THREE.SRGBColorSpace;
      // Do not set scene.background in order to keep the background transparent for the render pass,
      // which prevents the UnrealBloomPass from blurring/glowing the custom background.
      scene.background = null;
    }

    // Shader uniforms
    const uniforms = {
      uTime: { value: 0 },
      uDissolveColor: { value: color },
      uFreq: { value: emissiveFrequency },
      uAmp: { value: emissiveAmplitude },
      uEdge: { value: emissiveEdgeWidth },
      uSpeed: { value: emissiveSpeed },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uBgTexture: { value: bgTexture },
      uHasBg: { value: bgTexture !== null },
      uTextureMatrix: { value: new THREE.Matrix3() }
    };

    // Mesh shader material description
    const meshMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
      uniforms: uniforms,
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uDissolveColor;
        uniform float uFreq;
        uniform float uAmp;
        uniform float uEdge;
        uniform float uSpeed;
        uniform vec2 uResolution;
        uniform sampler2D uBgTexture;
        uniform bool uHasBg;
        uniform mat3 uTextureMatrix;

        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec3 vPosition;

        ${simplexNoiseGLSL}

        void main() {
          vec3 localPosition = vPosition;
          
          float noiseVal = snoise(localPosition * uFreq + vec3(0.0, uTime * uSpeed * 0.1, 0.0));
          noiseVal = noiseVal * 0.5 + 0.5;

          float wave = sin(uTime * uSpeed * 0.2);
          float threshold = max(0.0, wave * 0.55 + 0.35);

          if (noiseVal < threshold) {
            discard;
          }

          float edgeAlpha = smoothstep(threshold, threshold + uEdge * 0.25, noiseVal);
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

          vec3 baseColor;
          if (uHasBg) {
             vec2 screenUV = gl_FragCoord.xy / uResolution;
             vec2 distort = vNormal.xy * 0.1 * fresnel;
             vec2 baseUV = screenUV + distort;
             vec2 refractedUV = (uTextureMatrix * vec3(baseUV, 1.0)).xy;
             
             // Wrap UVs to prevent edge artifacts
             refractedUV = fract(refractedUV);

             vec3 bgColor = texture2D(uBgTexture, refractedUV).rgb;
             // Mirror glass look (mostly background, with some specular/fresnel reflection)
             baseColor = clamp(mix(bgColor, vec3(1.0), fresnel * 0.4), 0.0, 1.0);
          } else {
             baseColor = clamp(vec3(0.01, 0.015, 0.03) + (uDissolveColor * 0.1 * fresnel), 0.0, 1.0);
          }
          
          vec3 emissiveEdge = uDissolveColor * (1.0 - edgeAlpha) * uAmp;
          vec3 finalColor = baseColor + emissiveEdge;
          
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    const mesh = new THREE.Mesh(geometry, meshMaterial);
    scene.add(mesh);

    // Particle system (emitted from disintegrated areas)
    let particleCount = geometry.attributes.position.count;
    let particleMaxOffsetArr = new Float32Array(particleCount);
    let particleInitPosArr = new Float32Array(geometry.getAttribute('position').array);
    let particleCurrPosArr = new Float32Array(geometry.getAttribute('position').array);
    let particleVelocityArr = new Float32Array(particleCount * 3);
    let particleDistArr = new Float32Array(particleCount);
    let particleRotationArr = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        let x = i * 3 + 0;
        let y = i * 3 + 1;
        let z = i * 3 + 2;

        particleMaxOffsetArr[i] = Math.random() * 5.5 + 1.5;

        particleVelocityArr[x] = Math.random() * 0.5 + 0.5;
        particleVelocityArr[y] = Math.random() * 0.5 + 0.5;
        particleVelocityArr[z] = Math.random() * 0.1;

        particleDistArr[i] = 0.001;
        particleRotationArr[i] = Math.random() * Math.PI * 2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    // Use the same position array to start with
    particleGeometry.setAttribute('position', geometry.getAttribute('position').clone()); // Clone to be safe
    particleGeometry.setAttribute('aOffset', new THREE.BufferAttribute(particleMaxOffsetArr, 1));
    particleGeometry.setAttribute('aCurrentPos', new THREE.BufferAttribute(particleCurrPosArr, 3));
    particleGeometry.setAttribute('aVelocity', new THREE.BufferAttribute(particleVelocityArr, 3));
    particleGeometry.setAttribute('aDist', new THREE.BufferAttribute(particleDistArr, 1));
    particleGeometry.setAttribute('aAngle', new THREE.BufferAttribute(particleRotationArr, 1));

    const particlesMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: color },
        uFreq: { value: emissiveFrequency },
        uAmp: { value: emissiveAmplitude },
        uEdge: { value: emissiveEdgeWidth },
        uSpeed: { value: emissiveSpeed },
        uBaseSize: { value: 40 },
        uTexture: { value: particleTexture },
        uPixelDensity: { value: renderer.getPixelRatio() }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uFreq;
        uniform float uSpeed;
        uniform float uAmp;
        uniform float uEdge;
        uniform float uPixelDensity;
        uniform float uBaseSize;

        attribute vec3 aCurrentPos;
        attribute float aDist;
        attribute float aAngle;

        varying float vNoise;
        varying float vAngle;

        ${simplexNoiseGLSL}

        void main() {
          vec3 pos = position;
          
          float noiseVal = snoise(pos * uFreq + vec3(0.0, uTime * uSpeed * 0.1, 0.0));
          noiseVal = noiseVal * 0.5 + 0.5;
          vNoise = noiseVal;

          vAngle = aAngle;

          float wave = sin(uTime * uSpeed * 0.2);
          float threshold = max(0.0, wave * 0.55 + 0.35);
          float edgeWidth = uEdge * 0.25;

          // The Github particle behavior uses a larger buffer so particles exist near the edge
          if( vNoise > threshold - 0.125 && vNoise < threshold + edgeWidth + 0.125 ) {
              pos = aCurrentPos;
          }

          vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          gl_Position = projectedPosition;

          float size = uBaseSize * uPixelDensity * 2.0;
          size = size / (aDist + 1.0);
          gl_PointSize = max(2.0, size / -viewPosition.z);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uEdge;
        uniform float uTime;
        uniform float uSpeed;
        
        varying float vNoise;
        varying float vAngle;

        void main() {
          float wave = sin(uTime * uSpeed * 0.2);
          float threshold = max(0.0, wave * 0.55 + 0.35);
          float edgeWidth = uEdge * 0.25;

          if( vNoise < threshold - 0.15 ) discard;
          if( vNoise > threshold + edgeWidth + 0.15 ) discard;

          vec2 coord = gl_PointCoord - 0.5; 
          float dist = length(coord);
          if (dist > 0.5) discard;
          
          // Smooth circular particle
          float alpha = smoothstep(0.5, 0.1, dist);

          gl_FragColor = vec4(uColor.xyz, alpha);
        }
      `
    });

    const particles = new THREE.Points(particleGeometry, particlesMaterial);
    scene.add(particles);

    // Apply Post Processing bloom for that hot glowing emissive effect!
    const renderPass = new RenderPass(scene, camera);
    renderPass.clearColor = new THREE.Color(0, 0, 0);
    renderPass.clearAlpha = 0;
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), 
      emissiveBloom, 
      emissiveBloomRadius, 
      emissiveBloomThreshold
    );
    bloomPass.threshold = emissiveBloomThreshold;

    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
    });
    const composer = new EffectComposer(renderer, renderTarget);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    const bgPass = new ShaderPass(CustomBackgroundShader);
    bgPass.uniforms.uBgTexture.value = bgTexture;
    bgPass.uniforms.uHasBg.value = bgTexture !== null;
    composer.addPass(bgPass);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      
      if (bgTexture && bgTexture.image) {
        adjustTextureOffset(bgTexture, window.innerWidth, window.innerHeight, meshMaterial.uniforms, bgPass.uniforms);
      }
      
      // Update dynamic uniform updates from settings reactively via ref checks
      const currentSettings = settingsRef.current;
      const speedMult = currentSettings?.emissiveSpeed ?? 0.9;
      const freqVal = currentSettings?.emissiveFrequency ?? 0.25;
      const ampVal = currentSettings?.emissiveAmplitude ?? 9.0;
      const edgeVal = currentSettings?.emissiveEdgeWidth ?? 0.1;
      const bloomVal = currentSettings?.emissiveBloom ?? 0.1;
      const bloomThresholdVal = currentSettings?.emissiveBloomThreshold ?? 0.15;
      const bloomRadiusVal = currentSettings?.emissiveBloomRadius ?? 1.0;
      const latestColorHex = extractedColorRef.current || currentSettings?.colors?.[0] || '#88ccff';

      const updateColor = new THREE.Color(latestColorHex);
      
      const particleVisible = currentSettings?.emissiveParticleVisible !== false;
      const particleBaseSize = currentSettings?.emissiveParticleBaseSize ?? 55;
      const particleSpeedFactor = currentSettings?.emissiveParticleSpeedFactor ?? 0.022;
      const velocityFactorX = currentSettings?.emissiveVelocityFactorX ?? 2.5;
      const velocityFactorY = currentSettings?.emissiveVelocityFactorY ?? 2.0;
      const waveAmplitude = currentSettings?.emissiveWaveAmplitude ?? 1.5;

      particles.visible = particleVisible;

      // JS physics for particles from github repo
      if (particleVisible) {
        for (let i = 0; i < particleCount; i++) {
          let x = i * 3 + 0;
          let y = i * 3 + 1;
          let z = i * 3 + 2;

          let vx = particleVelocityArr[x];
          let vy = particleVelocityArr[y];
          let vz = particleVelocityArr[z];

          vx *= velocityFactorX;
          vy *= velocityFactorY;

          const posx = particleCurrPosArr[x];
          const posy = particleCurrPosArr[y];

          let xwave = (Math.sin(posy * 2) * (0.8 + waveAmplitude)) +
                      (Math.sin(posy * 5) * (0.2 + waveAmplitude)) +
                      (Math.sin(posy * 8) * (0.8 + waveAmplitude)) +
                      (Math.sin(posy * 3) * (0.8 + waveAmplitude));

          let ywave = (Math.sin(posx * 2) * (0.6 + waveAmplitude)) +
                      (Math.sin(posx * 1) * (0.9 + waveAmplitude)) +
                      (Math.sin(posx * 5) * (0.6 + waveAmplitude)) +
                      (Math.sin(posx * 7) * (0.6 + waveAmplitude));

          vx += xwave;
          vy += ywave;

          vx *= Math.abs(particleSpeedFactor);
          vy *= Math.abs(particleSpeedFactor);
          vz *= Math.abs(particleSpeedFactor);

          particleCurrPosArr[x] += vx;
          particleCurrPosArr[y] += vy;
          particleCurrPosArr[z] += vz;

          const vec1x = particleInitPosArr[x];
          const vec1y = particleInitPosArr[y];
          const vec1z = particleInitPosArr[z];

          const vec2x = particleCurrPosArr[x];
          const vec2y = particleCurrPosArr[y];
          const vec2z = particleCurrPosArr[z];

          const dx = vec1x - vec2x;
          const dy = vec1y - vec2y;
          const dz = vec1z - vec2z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

          particleDistArr[i] = dist;
          particleRotationArr[i] += 0.01;

          if (dist > particleMaxOffsetArr[i]) {
              particleCurrPosArr[x] = particleInitPosArr[x];
              particleCurrPosArr[y] = particleInitPosArr[y];
              particleCurrPosArr[z] = particleInitPosArr[z];
          }
        }
        
        particleGeometry.attributes.aCurrentPos.needsUpdate = true;
        particleGeometry.attributes.aDist.needsUpdate = true;
        particleGeometry.attributes.aAngle.needsUpdate = true;
      }

      // Rotate torus knot slightly over time
      mesh.rotation.y = elapsedTime * 0.15 * speedMult;
      mesh.rotation.x = elapsedTime * 0.08 * speedMult;

      // Rotate particles in perfect lockstep so they align with the dissolving edges
      particles.rotation.y = mesh.rotation.y;
      particles.rotation.x = mesh.rotation.x;

      // Update uniforms inside shaders
      meshMaterial.uniforms.uTime.value = elapsedTime;
      meshMaterial.uniforms.uDissolveColor.value.copy(updateColor);
      meshMaterial.uniforms.uFreq.value = freqVal;
      meshMaterial.uniforms.uAmp.value = ampVal;
      meshMaterial.uniforms.uEdge.value = edgeVal;
      meshMaterial.uniforms.uSpeed.value = speedMult;

      particlesMaterial.uniforms.uTime.value = elapsedTime;
      particlesMaterial.uniforms.uColor.value.copy(updateColor);
      particlesMaterial.uniforms.uFreq.value = freqVal;
      particlesMaterial.uniforms.uAmp.value = ampVal;
      particlesMaterial.uniforms.uEdge.value = edgeVal;
      particlesMaterial.uniforms.uSpeed.value = speedMult;
      particlesMaterial.uniforms.uBaseSize.value = particleBaseSize;

      bloomPass.strength = bloomVal;
      bloomPass.threshold = bloomThresholdVal;
      bloomPass.radius = bloomRadiusVal;

      bgPass.uniforms.uBgTexture.value = bgTexture;
      bgPass.uniforms.uHasBg.value = bgTexture !== null;

      controls.update();

      if (performanceMode) {
        renderer.render(scene, camera);
      } else {
        composer.render();
      }
    };

    animate();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.fov = getAdjustedFov(width, height, 48);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
      bloomPass.setSize(width, height);
      meshMaterial.uniforms.uResolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize);

    const containerElement = containerRef.current;

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      // Clean up WebGL resources cleanly
      geometry.dispose();
      meshMaterial.dispose();
      particleGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
      controls.dispose();

      if (containerElement && renderer.domElement) {
        if (containerElement.contains(renderer.domElement)) {
          containerElement.removeChild(renderer.domElement);
        }
      }
      
      if (bgTexture) {
        bgTexture.dispose();
      }
      if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      }
    };
  }, [performanceMode, settings?.emissiveShape, settings?.emissiveParticleCount, settings?.emissiveCustomBackground, settings?.emissiveCustomBackgroundType]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-[#020205] overflow-hidden">
      {settings?.emissiveCustomBackground && settings?.emissiveCustomBackgroundType === 'image' && (
        <img
          src={settings.emissiveCustomBackground}
          alt="Custom Emissive Background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          referrerPolicy="no-referrer"
        />
      )}
      {settings?.emissiveCustomBackground && settings?.emissiveCustomBackgroundType === 'video' && (
        <video
          src={settings.emissiveCustomBackground}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-10" />
    </div>
  );
};

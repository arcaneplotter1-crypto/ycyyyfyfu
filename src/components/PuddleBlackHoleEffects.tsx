import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AppTheme, UICustomization } from '../types';

export const PuddleBlackHoleBackground: React.FC<{ theme: AppTheme, customization?: UICustomization }> = ({ theme, customization }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const speed = customization?.puddleSpeed ?? 3.0;
  const power = customization?.puddlePower ?? 4.0;
  const damping = customization?.puddleDamping ?? 0.80;
  const hardness = customization?.puddleHardness ?? 0.25;
  const size = customization?.puddleSize ?? 0.03;

  const simMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const mainMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (simMaterialRef.current) {
      simMaterialRef.current.uniforms.uSpeed.value = speed;
      simMaterialRef.current.uniforms.uPower.value = power;
      simMaterialRef.current.uniforms.uDamping.value = damping;
      simMaterialRef.current.uniforms.uHardness.value = hardness;
      simMaterialRef.current.uniforms.uSize.value = size;
    }
  }, [speed, power, damping, hardness, size]);

  useEffect(() => {
    if (mainMaterialRef.current) {
      mainMaterialRef.current.uniforms.uRefraction.value = customization?.puddleRefraction ?? 1.0;
      mainMaterialRef.current.uniforms.uSpecular.value = customization?.puddleSpecular ?? 0.5;
    }
  }, [customization?.puddleRefraction, customization?.puddleSpecular]);

  useEffect(() => {
    if (!mainMaterialRef.current) return;

    if (customization?.puddleCustomBackground) {
      if (customization.puddleCustomBackgroundType === 'video') {
        const video = document.createElement('video');
        video.src = customization.puddleCustomBackground;
        video.loop = true;
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';
        video.play().catch(e => console.error("Video play failed", e));
        
        const videoTexture = new THREE.VideoTexture(video);
        mainMaterialRef.current.uniforms.uForeground.value = videoTexture;
        
        video.onloadedmetadata = () => {
          if (mainMaterialRef.current) {
             mainMaterialRef.current.uniforms.uForegroundSize.value.set(video.videoWidth, video.videoHeight);
          }
        };

        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = "";
          videoRef.current.load();
        }
        videoRef.current = video;
      } else {
        const loader = new THREE.TextureLoader();
        loader.load(customization.puddleCustomBackground, (texture) => {
          if (mainMaterialRef.current) {
            mainMaterialRef.current.uniforms.uForeground.value = texture;
            mainMaterialRef.current.uniforms.uForegroundSize.value.set(texture.image.width, texture.image.height);
          }
        });
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = "";
          videoRef.current.load();
          videoRef.current = null;
        }
      }
    } else {
      // Revert to default
      const defaultTextureUrl = "https://assets.codepen.io/1082534/2m5VnOm.jpeg";
      const loader = new THREE.TextureLoader();
      loader.load(defaultTextureUrl, (texture) => {
        if (mainMaterialRef.current) {
          mainMaterialRef.current.uniforms.uForeground.value = texture;
          mainMaterialRef.current.uniforms.uForegroundSize.value.set(920, 1074);
        }
      });
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
        videoRef.current = null;
      }
    }
  }, [customization?.puddleCustomBackground, customization?.puddleCustomBackgroundType]);

  useEffect(() => {
    if (!containerRef.current) return;

    const fboSize = 1024;
    const isMobileApple = /(iPad|iPhone).+(like\sMac)/.test(navigator.userAgent);

    const mouseTarget = new THREE.Vector2(0.5, 0.5);
    const mouse = new THREE.Vector2(0.5, 0.5);
    const resolution = new THREE.Vector2(1, 1);

    const getTarget = (texSize: number) => new THREE.WebGLRenderTarget(texSize, texSize, {
        format: THREE.RGBAFormat,
        type: isMobileApple ? THREE.HalfFloatType : THREE.FloatType
    });

    const pingpong = (texSize: number) => {
        const buffers = [
            getTarget(texSize),
            getTarget(texSize)
        ];

        let index = 0;
        const swap = () => index = 1 - index;
        const read = () => buffers[index];
        const write = () => buffers[1 - index];

        return { read, write, swap };
    };

    const getFBO = (texSize: number, simMaterial: THREE.ShaderMaterial) => {
        const fbos = pingpong(texSize);

        const osCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
        osCamera.position.z = 1;

        const simGeo = new THREE.BufferGeometry();
        simGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
            -1, -1, 0, 1, -1, 0, 1, 1, 0,
            -1, -1, 0, 1, 1, 0, -1, 1, 0
        ]), 3));

        simGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
            0, 0, 1, 0, 1, 1,
            0, 0, 1, 1, 0, 1
        ]), 2));

        const simMesh = new THREE.Mesh(simGeo, simMaterial);
        const osScene = new THREE.Scene();
        osScene.add(simMesh);

        const render = (renderer: THREE.WebGLRenderer) => {
            const read = fbos.read();
            const write = fbos.write();

            simMaterial.uniforms.uTex.value = read.texture;
            renderer.setRenderTarget(write);

            renderer.render(osScene, osCamera);
            renderer.setRenderTarget(null);

            fbos.swap();
        };

        const resize = (size: number) => {
            fbos.read().setSize(size, size);
            fbos.write().setSize(size, size);
        };

        return { render, resize, fbos };
    };

    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(2);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.userSelect = 'none';

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
        -0.5,
        0.5,
        0.5,
        -0.5,
        0.01,
        100
    );
    camera.position.z = 1;

    const simMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uMouseAmount: { value: 0 },
            uLastMouse: { value: mouseTarget },
            uMouse: { value: mouse },
            uResolution: { value: new THREE.Vector2(fboSize, fboSize) },
            uScreenResolution: { value: resolution },
            uTex: { value: null },
            uSpeed: { value: speed },
            uSpeedFactor: { value: 1.0 },
            uPower: { value: power },
            uDamping: { value: damping },
            uHardness: { value: hardness },
            uSize: { value: size },
            uRainDrop: { value: new THREE.Vector4(0, 0, 0, 0) }
        },
        vertexShader: `
            precision mediump float;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            precision mediump float;
            varying vec2 vUv;
            uniform sampler2D uTex;
            uniform vec2 uResolution;
            uniform vec2 uScreenResolution;
            uniform vec2 uLastMouse;
            uniform vec2 uMouse;
            uniform float uMouseAmount;
            uniform float uDamping;
            uniform float uPower;
            uniform float uSpeed;
            uniform float uSpeedFactor;
            uniform float uHardness;
            uniform float uSize;
            uniform vec4 uRainDrop;

            float lineSegment(vec2 p, vec2 a, vec2 b, float size) {
                vec2 pa = p - a, ba = b - a;
                float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
                float hs = uHardness * (size - 0.001);
                return smoothstep(hs, size, length(pa - ba*h));
            }

            float getSpring(float height, vec2 pos, float factor) {
                return (texture2D(uTex, pos).r - height) * factor;
            }

            void main() {
                float ar = uScreenResolution.x / uScreenResolution.y;
                vec2 pUv = uResolution * vec2(ar, 1.0);
                vec2 pixel = vec2(1.0) / pUv;
                vec2 kernel = pixel * uSpeed / uSpeedFactor;

                vec4 color = texture2D(uTex, vUv);
                float height = color.r;
                float vel = color.g;

                vel += getSpring(height, vUv + kernel * vec2( 2.0, 3.0 ), 0.0022411859348636983 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( 0.0, 3.0 ), 0.0056818181818181820 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( -2.0, 3.0 ), 0.0022411859348636983 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( 2.0, 2.0 ), 0.0066566640639421000 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( 0.0, 2.0 ), 0.0113636363636363640 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( -2.0, 2.0 ), 0.0066566640639421000 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( 3.0, 1.0 ), 0.0047597860217705710 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( 1.0, 1.0 ), 0.0146919683956074150 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( -1.0, 1.0 ), 0.0146919683956074150 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( -3.0, 1.0 ), 0.0047597860217705710 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( 2.0, 0.0 ), 0.0113636363636363640 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( -2.0, 0.0 ), 0.0113636363636363640 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( 3.0, -1.0 ), 0.0047597860217705710 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( 1.0, -1.0 ), 0.0146919683956074150 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( -1.0, -1.0 ), 0.0146919683956074150 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( -3.0, -1.0 ), 0.0047597860217705710 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( 2.0, -2.0 ), 0.0066566640639421000 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( 0.0, -2.0 ), 0.0113636363636363640 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( -2.0, -2.0 ), 0.0066566640639421000 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( 2.0, -3.0 ), 0.0022411859348636983 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( 0.0, -3.0 ), 0.0056818181818181820 * uPower);
                vel += getSpring(height, vUv + kernel * vec2( -2.0, -3.0 ), 0.0022411859348636983 * uPower);

                height += vel;
                vel *= uDamping;

                float line = (1.0 - lineSegment(vUv, uLastMouse, uMouse, uSize)) * uMouseAmount;
                height = (height + line) * 0.99;

                float dropDist = length((vUv - uRainDrop.xy) * vec2(ar, 1.0));
                float drop = (1.0 - smoothstep(uHardness * (uRainDrop.z - 0.001), uRainDrop.z, dropDist)) * uRainDrop.w;
                height = (height + drop) * 0.99;

                // Anti-Explosion Safety Clamp
                height = clamp(height, -100.0, 100.0);
                vel = clamp(vel, -50.0, 50.0);

                gl_FragColor = vec4(height, vel, 0.0, 1.0);
            }
        `
    });

    simMaterialRef.current = simMaterial;

    const simulation = getFBO(fboSize, simMaterial);

    const geo = new THREE.PlaneGeometry(1, 1);
    const initialForeground = (() => {
        if (customization?.puddleCustomBackground) {
            if (customization.puddleCustomBackgroundType === 'video') {
                const video = document.createElement('video');
                video.src = customization.puddleCustomBackground;
                video.loop = true;
                video.muted = true;
                video.autoplay = true;
                video.playsInline = true;
                video.crossOrigin = 'anonymous';
                video.play().catch(e => console.error("Video play failed", e));
                videoRef.current = video;
                return new THREE.VideoTexture(video);
            } else {
                return new THREE.TextureLoader().load(customization.puddleCustomBackground);
            }
        }
        return new THREE.TextureLoader().load("https://assets.codepen.io/1082534/2m5VnOm.jpeg");
    })();

    const initialForegroundSize = new THREE.Vector2(920, 1074);
    if (customization?.puddleCustomBackground && customization.puddleCustomBackgroundType === 'video' && videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
                initialForegroundSize.set(videoRef.current.videoWidth, videoRef.current.videoHeight);
            }
        };
    } else if (customization?.puddleCustomBackground && customization.puddleCustomBackgroundType === 'image') {
        // We can't easily get the image size immediately here without a loader callback, 
        // but the useEffect for customization change will handle it once it's loaded if we are lucky,
        // or we just let it be updated by the useEffect.
    }

    const mat = new THREE.ShaderMaterial({
        depthTest: false,
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: mouse },
            uResolution: { value: resolution },
            uTex: { value: null },
            uForeground: { value: initialForeground },
            uForegroundSize: { value: initialForegroundSize },
            uRefraction: { value: customization?.puddleRefraction ?? 1.0 },
            uSpecular: { value: customization?.puddleSpecular ?? 0.5 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float uTime;
            uniform vec2 uMouse;
            uniform vec2 uResolution;
            uniform sampler2D uTex;
            uniform sampler2D uForeground;
            uniform vec2 uForegroundSize;
            uniform float uRefraction;
            uniform float uSpecular;
            #define SHIFT 1.05

            void main() {
                float screenAr = uResolution.x / uResolution.y;
                float texAr = uForegroundSize.x / uForegroundSize.y;
                float dAr = screenAr / texAr;
                float mAr = abs(screenAr - texAr);
                vec2 scale = mix(vec2(dAr, 1.0), vec2(1.0, 1.0 / dAr), step(1.0, dAr));
                vec2 offset = mix(vec2(mAr * 0.5, 0.0), vec2(0.0, mAr * 0.5), step(1.0, dAr));
                vec2 uv = (vUv + offset) * scale;
                vec2 pixel = vec2(1.0) / uResolution;

                vec2 above = texture2D( uTex, vUv + vec2( 0.0, -pixel.y ) ).rg;
                float x = above.g - texture2D( uTex, vUv + vec2( pixel.x, 0.0 ) ).g;
                float y = above.r - texture2D( uTex, vUv + vec2( 0.0, pixel.y ) ).r;
                
                vec2 dif = vec2(x, y);
                vec4 c = texture2D(uForeground, uv + dif * uRefraction);
                
                vec3 normal = normalize(vec3(-dif.x, -dif.y, 1.0));
                vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
                float spec = pow(max(dot(normal, lightDir), 0.0), 30.0) * uSpecular;
                
                gl_FragColor = c + vec4(vec3(spec), 0.0);
            }
        `
    });

    mainMaterialRef.current = mat;
    const plane = new THREE.Mesh(geo, mat);
    scene.add(plane);

    const resize = () => {
        if (!containerRef.current) return;
        renderer.setSize(window.innerWidth, window.innerHeight);
        resolution.set(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    const updateMouse = (e: PointerEvent) => {
        mouseTarget.copy(mouse);
        mouse.set(
            e.clientX / window.innerWidth,
            1 - (e.clientY / window.innerHeight)
        );
        simMaterial.uniforms.uMouseAmount.value = 1;
    }

    const stopMouse = () => {
        mouseTarget.copy(mouse);
        simMaterial.uniforms.uMouseAmount.value = 0;
    }

    window.addEventListener('pointermove', updateMouse, { passive: true });
    window.addEventListener('pointerover', updateMouse, { passive: true });
    window.addEventListener('pointerdown', updateMouse, { passive: true });
    window.addEventListener('pointerout', stopMouse, { passive: true });
    window.addEventListener('pointerup', stopMouse, { passive: true });

    const fps = 1000 / 60;
    let lastFrame = performance.now();
    let rafId: number;
    let isVisible = true;

    const animate = (now: number) => {
        if (!isVisible) return;
        
        const elapsed = now - lastFrame;

        if (elapsed < 5) {
            rafId = requestAnimationFrame(animate);
            return;
        }

        const frameTime = Math.max(0.1, Math.min(10.0, fps / elapsed));
        lastFrame = now;

        simMaterial.uniforms.uTime.value = now;
        simMaterial.uniforms.uSpeedFactor.value = frameTime;
        simMaterial.uniforms.uMouseAmount.value *= 0.9 / Math.max(1, frameTime);

        // Render raindrop
        const raindrops = customization?.puddleRaindrops ?? false;
        const rainIntensity = customization?.puddleRaindropsIntensity ?? 0.5;
        if (raindrops && Math.random() < rainIntensity * 0.3) {
            simMaterial.uniforms.uRainDrop.value.set(
                Math.random(),
                Math.random(),
                size * (Math.random() * 0.5 + 0.5),
                Math.random() * 2.0 + 0.5
            );
        } else {
            simMaterial.uniforms.uRainDrop.value.set(0, 0, 0, 0);
        }

        simulation.render(renderer);

        mat.uniforms.uTime.value = now;
        mat.uniforms.uTex.value = simulation.fbos.read().texture;

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            isVisible = true;
            lastFrame = performance.now();
            rafId = requestAnimationFrame(animate);
        } else {
            isVisible = false;
            cancelAnimationFrame(rafId);
            mouseTarget.copy(mouse);
            simMaterial.uniforms.uMouseAmount.value = 0;
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', updateMouse);
        window.removeEventListener('pointerover', updateMouse);
        window.removeEventListener('pointerdown', updateMouse);
        window.removeEventListener('pointerout', stopMouse);
        window.removeEventListener('pointerup', stopMouse);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        cancelAnimationFrame(rafId);
        
        simMaterial.dispose();
        mat.dispose();
        geo.dispose();
        renderer.dispose();
        
        if (containerRef.current?.contains(renderer.domElement)) {
            containerRef.current.removeChild(renderer.domElement);
        }

        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = "";
            videoRef.current.load();
        }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[-15] pointer-events-none"
    />
  );
};

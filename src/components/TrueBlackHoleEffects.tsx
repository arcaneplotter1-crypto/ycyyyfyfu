import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { AppTheme, UICustomization } from '../types';
import { Move, ZoomIn, ZoomOut, RotateCcw, Compass } from 'lucide-react';

interface TrueBlackHoleBackgroundProps {
  theme?: AppTheme;
  customization?: UICustomization;
  isHome?: boolean;
  isMini?: boolean;
}

export const TrueBlackHoleBackground: React.FC<TrueBlackHoleBackgroundProps> = ({
  theme,
  customization,
  isHome = false,
  isMini = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive 3D movement coordinates
  const [posX, setPosX] = useState(() => customization?.spaceBlackHoleX ?? 0);
  const [posY, setPosY] = useState(() => customization?.spaceBlackHoleY ?? 0);
  const [posZ, setPosZ] = useState(() => customization?.spaceBlackHoleZ ?? 0);

  // Auto orbit settings
  const [autoRotate, setAutoRotate] = useState(() => customization?.spaceBlackHoleAutoRotate ?? true);
  const [rotateSpeed, setRotateSpeed] = useState(() => customization?.spaceBlackHoleRotateSpeed ?? 0.5);

  // Refs for instantaneous coordinate access inside Three.js cycle
  const coordsRef = useRef({ x: 0, y: 0, z: 0 });
  const autoRotateRef = useRef(true);
  const rotateSpeedRef = useRef(0.5);

  useEffect(() => {
    coordsRef.current = { x: posX, y: posY, z: posZ };
  }, [posX, posY, posZ]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    rotateSpeedRef.current = rotateSpeed;
  }, [rotateSpeed]);

  // Synchronise state with incoming customization changes
  useEffect(() => {
    if (customization) {
      if (typeof customization.spaceBlackHoleX === 'number') setPosX(customization.spaceBlackHoleX);
      if (typeof customization.spaceBlackHoleY === 'number') setPosY(customization.spaceBlackHoleY);
      if (typeof customization.spaceBlackHoleZ === 'number') setPosZ(customization.spaceBlackHoleZ);
      if (typeof customization.spaceBlackHoleAutoRotate === 'boolean') setAutoRotate(customization.spaceBlackHoleAutoRotate);
      if (typeof customization.spaceBlackHoleRotateSpeed === 'number') setRotateSpeed(customization.spaceBlackHoleRotateSpeed);
    }
  }, [
    customization?.spaceBlackHoleX,
    customization?.spaceBlackHoleY,
    customization?.spaceBlackHoleZ,
    customization?.spaceBlackHoleAutoRotate,
    customization?.spaceBlackHoleRotateSpeed
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    const BLACK_HOLE_RADIUS = 1.3;
    const DISK_INNER_RADIUS = BLACK_HOLE_RADIUS + 0.2;
    const DISK_OUTER_RADIUS = 8.0;
    const DISK_TILT_ANGLE = Math.PI / 3.0;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020104, 0.025);

    const initialWidth = isMini && containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
    const initialHeight = isMini && containerRef.current ? containerRef.current.clientHeight : window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, initialWidth / initialHeight, 0.1, 4000);
    camera.position.set(-6.5, 5.0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: true });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setClearColor(0x000000, 0); // Transparent background

    containerRef.current.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(initialWidth, initialHeight),
        0.8, 0.7, 0.8
    );
    composer.addPass(bloomPass);

    const lensingShader = {
        uniforms: {
            "tDiffuse": { value: null },
            "blackHoleScreenPos": { value: new THREE.Vector2(0.5, 0.5) },
            "lensingStrength": { value: customization?.spaceBlackHoleLensing ?? 0.12 },
            "lensingRadius": { value: 0.3 },
            "aspectRatio": { value: initialWidth / initialHeight },
            "chromaticAberration": { value: 0.005 }
        },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform vec2 blackHoleScreenPos;
            uniform float lensingStrength;
            uniform float lensingRadius;
            uniform float aspectRatio;
            uniform float chromaticAberration;
            varying vec2 vUv;
            
            void main() {
                vec2 screenPos = vUv;
                vec2 toCenter = screenPos - blackHoleScreenPos;
                toCenter.x *= aspectRatio;
                float dist = length(toCenter);
                
                float distortionAmount = lensingStrength / (dist * dist + 0.003);
                distortionAmount = clamp(distortionAmount, 0.0, 0.7);
                float falloff = smoothstep(lensingRadius, lensingRadius * 0.3, dist);
                distortionAmount *= falloff;
                
                vec2 offset = normalize(toCenter) * distortionAmount;
                offset.x /= aspectRatio;
                
                vec2 distortedUvR = screenPos - offset * (1.0 + chromaticAberration);
                vec2 distortedUvG = screenPos - offset;
                vec2 distortedUvB = screenPos - offset * (1.0 - chromaticAberration);
                
                float r = texture2D(tDiffuse, distortedUvR).r;
                float g = texture2D(tDiffuse, distortedUvG).g;
                float b = texture2D(tDiffuse, distortedUvB).b;
                
                gl_FragColor = vec4(r, g, b, 1.0);
            }`
    };
    const lensingPass = new ShaderPass(lensingShader);
    composer.addPass(lensingPass);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.035;
    controls.rotateSpeed = 0.4;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 0.1;
    controls.target.set(0, 0, 0);
    controls.minDistance = 2.5;
    controls.maxDistance = 120;
    
    // Enable interactive panning & scrolling/zoom natively
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
    };
    controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
    };
    
    // Prevent default context menus so right clicks are intuitive panning triggers on desktop
    const preventContext = (e: MouseEvent) => e.preventDefault();
    renderer.domElement.addEventListener('contextmenu', preventContext);
    controls.update();

    // 3D Group containing entire Singularity Core
    const blackHoleGroup = new THREE.Group();
    scene.add(blackHoleGroup);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = isMini ? 15000 : 150000; // Optimize vertex count inside bento widgets
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starTwinkle = new Float32Array(starCount);
    const starFieldRadius = 2000;
    const starPalette = [
        new THREE.Color(0x88aaff), new THREE.Color(0xffaaff), new THREE.Color(0xaaffff),
        new THREE.Color(0xffddaa), new THREE.Color(0xffeecc), new THREE.Color(0xffffff),
        new THREE.Color(0xff8888), new THREE.Color(0x88ff88), new THREE.Color(0xffff88),
        new THREE.Color(0x88ffff)
    ];

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        const phi = Math.acos(-1 + (2 * i) / starCount);
        const theta = Math.sqrt(starCount * Math.PI) * phi;
        const radius = Math.cbrt(Math.random()) * starFieldRadius + 100;

        starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i3 + 2] = radius * Math.cos(phi);

        const starColor = starPalette[Math.floor(Math.random() * starPalette.length)].clone();
        starColor.multiplyScalar(Math.random() * 0.7 + 0.3);
        starColors[i3] = starColor.r; starColors[i3 + 1] = starColor.g; starColors[i3 + 2] = starColor.b;
        starSizes[i] = THREE.MathUtils.randFloat(0.6, 3.0);
        starTwinkle[i] = Math.random() * Math.PI * 2;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    starGeometry.setAttribute('twinkle', new THREE.BufferAttribute(starTwinkle, 1));

    const starMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: renderer.getPixelRatio() }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uPixelRatio;
            attribute float size;
            attribute float twinkle;
            varying vec3 vColor;
            varying float vTwinkle;
            
            void main() {
                vColor = color;
                vTwinkle = sin(uTime * 2.5 + twinkle) * 0.5 + 0.5;
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vTwinkle;
            
            void main() {
                float dist = distance(gl_PointCoord, vec2(0.5));
                if (dist > 0.5) discard;
                
                float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                alpha *= (0.2 + vTwinkle * 0.8);
                
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const eventHorizonGeom = new THREE.SphereGeometry(BLACK_HOLE_RADIUS * 1.05, isMini ? 64 : 128, isMini ? 32 : 64);
    const eventHorizonMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uCameraPosition: { value: camera.position }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uCameraPosition;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vec3 viewDirection = normalize(uCameraPosition - vPosition);
                float fresnel = 1.0 - abs(dot(vNormal, viewDirection));
                fresnel = pow(fresnel, 2.5);
                
                vec3 glowColor = vec3(1.0, 0.4, 0.1);
                float pulse = sin(uTime * 2.5) * 0.15 + 0.85;
                
                gl_FragColor = vec4(glowColor * fresnel * pulse, fresnel * 0.4);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });

    const eventHorizon = new THREE.Mesh(eventHorizonGeom, eventHorizonMat);
    blackHoleGroup.add(eventHorizon);

    const blackHoleGeom = new THREE.SphereGeometry(BLACK_HOLE_RADIUS, isMini ? 64 : 128, isMini ? 32 : 64);
    const blackHoleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHoleMesh = new THREE.Mesh(blackHoleGeom, blackHoleMat);
    blackHoleMesh.renderOrder = 0;
    blackHoleGroup.add(blackHoleMesh);

    const diskGeometry = new THREE.RingGeometry(DISK_INNER_RADIUS, DISK_OUTER_RADIUS, isMini ? 128 : 256, isMini ? 64 : 128);
    const diskMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uColorHot: { value: new THREE.Color(0xffffff) },
            uColorMid1: { value: new THREE.Color(0xff7733) },
            uColorMid2: { value: new THREE.Color(0xff4477) },
            uColorMid3: { value: new THREE.Color(0x7744ff) },
            uColorOuter: { value: new THREE.Color(0x4477ff) },
            uNoiseScale: { value: customization?.spaceBlackHoleNoiseScale ?? 2.5 },
            uFlowSpeed: { value: customization?.spaceBlackHoleDiskSpeed ?? 0.22 },
            uDensity: { value: 1.3 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying float vRadius;
            varying float vAngle;
            void main() {
                vUv = uv;
                vRadius = length(position.xy);
                vAngle = atan(position.y, position.x);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uColorHot;
            uniform vec3 uColorMid1;
            uniform vec3 uColorMid2;
            uniform vec3 uColorMid3;
            uniform vec3 uColorOuter;
            uniform float uNoiseScale;
            uniform float uFlowSpeed;
            uniform float uDensity;
 
            varying vec2 vUv;
            varying float vRadius;
            varying float vAngle;
 
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i  = floor(v + dot(v, C.yyy) );
                vec3 x0 = v - i + dot(i, C.xxx) ;
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min( g.xyz, l.zxy );
                vec3 i2 = max( g.xyz, l.zxy );
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                i = mod289(i);
                vec4 p = permute( permute( permute( 
                         i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                       + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                       + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                float n_ = 0.142857142857;
                vec3  ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
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
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
            }
 
            void main() {
                float normalizedRadius = smoothstep(${DISK_INNER_RADIUS.toFixed(2)}, ${DISK_OUTER_RADIUS.toFixed(2)}, vRadius);
                
                float spiral = vAngle * 3.0 - (1.0 / (normalizedRadius + 0.1)) * 2.0;
                vec2 noiseUv = vec2(vUv.x + uTime * uFlowSpeed * (2.0 / (vRadius * 0.3 + 1.0)) + sin(spiral) * 0.1, vUv.y * 0.8 + cos(spiral) * 0.1);
                float noiseVal1 = snoise(vec3(noiseUv * uNoiseScale, uTime * 0.15));
                float noiseVal2 = snoise(vec3(noiseUv * uNoiseScale * 3.0 + 0.8, uTime * 0.22));
                float noiseVal3 = snoise(vec3(noiseUv * uNoiseScale * 6.0 + 1.5, uTime * 0.3));
                
                float noiseVal = (noiseVal1 * 0.45 + noiseVal2 * 0.35 + noiseVal3 * 0.2);
                noiseVal = (noiseVal + 1.0) * 0.5;
                
                vec3 color = uColorOuter;
                color = mix(color, uColorMid3, smoothstep(0.0, 0.25, normalizedRadius));
                color = mix(color, uColorMid2, smoothstep(0.2, 0.55, normalizedRadius));
                color = mix(color, uColorMid1, smoothstep(0.5, 0.75, normalizedRadius));
                color = mix(color, uColorHot, smoothstep(0.7, 0.95, normalizedRadius));
                
                color *= (0.5 + noiseVal * 1.0);
                float brightness = pow(1.0 - normalizedRadius, 1.0) * 3.5 + 0.5;
                brightness *= (0.3 + noiseVal * 2.2);
                
                float pulse = sin(uTime * 1.8 + normalizedRadius * 12.0 + vAngle * 2.0) * 0.15 + 0.85;
                brightness *= pulse;
                
                float alpha = uDensity * (0.2 + noiseVal * 0.9);
                alpha *= smoothstep(0.0, 0.15, normalizedRadius);
                alpha *= (1.0 - smoothstep(0.85, 1.0, normalizedRadius));
                alpha = clamp(alpha, 0.0, 1.0);
 
                gl_FragColor = vec4(color * brightness, alpha);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
    accretionDisk.rotation.x = DISK_TILT_ANGLE;
    accretionDisk.renderOrder = 1;
    blackHoleGroup.add(accretionDisk);

    const handleResize = () => {
        if (!containerRef.current) return;
        const width = isMini ? containerRef.current.clientWidth : window.innerWidth;
        const height = isMini ? containerRef.current.clientHeight : window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        composer.setSize(width, height);
        bloomPass.resolution.set(width, height);
        lensingPass.uniforms.aspectRatio.value = width / height;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    };

    window.addEventListener('resize', handleResize);
    // Execute multiple frames later to allow bento UI dimensions to render fully
    const resizeTimeout = setTimeout(handleResize, 100);

    const clock = new THREE.Clock();
    const blackHoleScreenPosVec3 = new THREE.Vector3();
    let reqId: number;

    const updateColors = () => {
        const baseHex = customization?.spaceBlackHoleColor || '#ea580c';
        const baseColor = new THREE.Color(baseHex);
        const csl = baseColor.getHSL({h:0, s:0, l:0});
        
        const hot = new THREE.Color().setHSL(csl.h, csl.s * 0.5, 1.0);
        const mid1 = new THREE.Color().setHSL(csl.h, csl.s, csl.l);
        const mid2 = new THREE.Color().setHSL((csl.h + 0.9) % 1.0, csl.s * 0.8, csl.l * 0.8);
        const mid3 = new THREE.Color().setHSL((csl.h + 0.8) % 1.0, csl.s * 0.6, csl.l * 0.5);
        const outer = new THREE.Color().setHSL((csl.h + 0.6) % 1.0, csl.s, csl.l * 0.4);

        diskMaterial.uniforms.uColorHot.value = hot;
        diskMaterial.uniforms.uColorMid1.value = mid1;
        diskMaterial.uniforms.uColorMid2.value = mid2;
        diskMaterial.uniforms.uColorMid3.value = mid3;
        diskMaterial.uniforms.uColorOuter.value = outer;
    };

    updateColors();

    const animate = () => {
        reqId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = clock.getDelta();

        diskMaterial.uniforms.uTime.value = elapsedTime;
        starMaterial.uniforms.uTime.value = elapsedTime;
        eventHorizonMat.uniforms.uTime.value = elapsedTime;
        eventHorizonMat.uniforms.uCameraPosition.value.copy(camera.position);

        // Smoothly interpolate the 3D position of the blackhole group based on coordinates state
        blackHoleGroup.position.x = THREE.MathUtils.lerp(blackHoleGroup.position.x, coordsRef.current.x, 0.08);
        blackHoleGroup.position.y = THREE.MathUtils.lerp(blackHoleGroup.position.y, coordsRef.current.y, 0.08);
        blackHoleGroup.position.z = THREE.MathUtils.lerp(blackHoleGroup.position.z, coordsRef.current.z, 0.08);

        // Keep the OrbitControls focused on the center of the moving blackhole group
        controls.target.copy(blackHoleGroup.position);
        controls.autoRotate = autoRotateRef.current;
        controls.autoRotateSpeed = 0.2 * rotateSpeedRef.current;

        // Resolve absolute world coordinates for screen-space gravitational lensing effect
        const worldPos = new THREE.Vector3();
        blackHoleMesh.getWorldPosition(worldPos);
        blackHoleScreenPosVec3.copy(worldPos).project(camera);
        
        lensingPass.uniforms.blackHoleScreenPos.value.set(
            (blackHoleScreenPosVec3.x + 1) / 2,
            (blackHoleScreenPosVec3.y + 1) / 2
        );

        controls.update();
        
        stars.rotation.y += deltaTime * 0.003;
        stars.rotation.x += deltaTime * 0.001;

        accretionDisk.rotation.z += deltaTime * 0.005;

        composer.render(deltaTime);
    };

    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
        renderer.domElement.removeEventListener('contextmenu', preventContext);
        cancelAnimationFrame(reqId);
        renderer.dispose();
        composer.dispose();
        if (containerRef.current) containerRef.current.innerHTML = '';
    };

  }, [
    customization?.spaceBlackHoleColor, 
    customization?.spaceBlackHoleLensing, 
    customization?.spaceBlackHoleDiskSpeed, 
    customization?.spaceBlackHoleNoiseScale,
    isMini
  ]);

  if (isMini) {
    return (
      <div 
        className="relative w-full h-[220px] rounded-2xl overflow-hidden bg-black border border-orange-500/20 shadow-[0_0_15px_rgba(234,88,12,0.1)] select-none pointer-events-auto"
        style={{
           background: 'radial-gradient(ellipse at center, #010103 0%, #000001 100%)'
        }}
      >
        <div className="absolute inset-0 border border-orange-500/5 rounded-2xl pointer-events-none z-10" />
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/80 border border-orange-500/25 text-[8px] font-mono text-orange-400 font-extrabold z-20 uppercase tracking-widest animate-pulse">
          3D Spacetime live telemetry
        </div>
        <div ref={containerRef} className="w-full h-full absolute inset-0 pointer-events-auto" />
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[-1] overflow-hidden bg-black select-none pointer-events-none"
      style={{
         background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000002 70%)'
      }}
    >
      <div ref={containerRef} className="w-full h-full absolute inset-0 pointer-events-auto" />
    </div>
  );
};

interface TrueBlackHoleHUDProps {
  customization: UICustomization;
  setUICustomization: (config: UICustomization) => void;
}

export const TrueBlackHoleHUD: React.FC<TrueBlackHoleHUDProps> = ({ customization, setUICustomization }) => {
  const posX = customization.spaceBlackHoleX ?? 0;
  const posY = customization.spaceBlackHoleY ?? 0;
  const posZ = customization.spaceBlackHoleZ ?? 0;
  const autoRotate = customization.spaceBlackHoleAutoRotate ?? true;
  const rotateSpeed = customization.spaceBlackHoleRotateSpeed ?? 0.5;

  const updateX = (val: number) => setUICustomization({ ...customization, spaceBlackHoleX: val });
  const updateY = (val: number) => setUICustomization({ ...customization, spaceBlackHoleY: val });
  const updateZ = (val: number) => setUICustomization({ ...customization, spaceBlackHoleZ: val });
  const updateAutoRotate = (val: boolean) => setUICustomization({ ...customization, spaceBlackHoleAutoRotate: val });
  const updateRotateSpeed = (val: number) => setUICustomization({ ...customization, spaceBlackHoleRotateSpeed: val });

  const [isDraggingPad, setIsDraggingPad] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);

  const handlePadInteraction = (clientX: number, clientY: number) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
    
    const scaledX = Math.max(-7, Math.min(7, normX * 7));
    const scaledY = Math.max(-5, Math.min(5, normY * 5));
    
    setUICustomization({
      ...customization,
      spaceBlackHoleX: parseFloat(scaledX.toFixed(2)),
      spaceBlackHoleY: parseFloat(scaledY.toFixed(2))
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDraggingPad(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePadInteraction(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingPad) return;
    handlePadInteraction(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDraggingPad(false);
  };

  return (
    <div className="w-full bg-slate-950/40 border border-orange-500/15 rounded-2xl p-4 shadow-[0_0_15px_rgba(234,88,12,0.05)] text-slate-200 font-sans my-1 space-y-4">
      {/* Gravity Radar pad */}
      <div>
        <div className="flex items-center justify-between text-[10px] mb-1.5 px-0.5 text-slate-400 font-extrabold uppercase tracking-widest">
          <span>Holographic HUD Gravitational Target (X / Y)</span>
          <span className="font-mono text-orange-400 font-black">
            ({posX.toFixed(1)}, {posY.toFixed(1)})
          </span>
        </div>
        
        <div 
          ref={padRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative h-28 w-full bg-black/80 border border-orange-500/20 rounded-xl cursor-crosshair overflow-hidden flex items-center justify-center select-none"
          style={{ touchAction: 'none' }}
        >
          {/* Grid overlay lines */}
          <div className="absolute w-full h-[1px] bg-orange-500/10" />
          <div className="absolute h-full w-[1px] bg-orange-500/10" />
          <div className="absolute inset-0 border border-orange-500/5 rounded-xl pointer-events-none" />
          
          <div 
            className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-orange-500 bg-orange-500/30 shadow-[0_0_10px_rgba(234,88,12,0.6)] pointer-events-none flex items-center justify-center transition-all duration-75"
            style={{
              left: `${((posX + 7) / 14) * 100}%`,
              top: `${(1 - (posY + 5) / 10) * 100}%`
            }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* Advanced Coordinates */}
      <div className="space-y-3">
        {/* Lateral */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1 px-0.5 text-slate-400 font-bold uppercase">
            <span>X-AXIS (Lateral spacetime drift)</span>
            <span className="font-mono text-orange-400 font-black">{posX.toFixed(1)}</span>
          </div>
          <input 
            type="range"
            min="-7"
            max="7"
            step="0.1"
            value={posX}
            onChange={(e) => updateX(parseFloat(e.target.value))}
            className="w-full accent-orange-500 bg-neutral-800 rounded-lg h-1"
          />
        </div>

        {/* Height */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1 px-0.5 text-slate-400 font-bold uppercase">
            <span>Y-AXIS (Vertical gravitational center)</span>
            <span className="font-mono text-orange-400 font-black">{posY.toFixed(1)}</span>
          </div>
          <input 
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={posY}
            onChange={(e) => updateY(parseFloat(e.target.value))}
            className="w-full accent-orange-500 bg-neutral-800 rounded-lg h-1"
          />
        </div>

        {/* Depth */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1 px-0.5 text-slate-400 font-bold uppercase">
            <span>Z-AXIS (Spacetime compression / depth)</span>
            <span className="font-mono text-orange-400 font-black">{posZ.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => updateZ(Math.max(-6, posZ - 0.5))}
              className="p-1 rounded bg-black/60 border border-orange-500/25 text-orange-500 hover:bg-orange-500/10 cursor-pointer text-xs"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input 
              type="range"
              min="-6"
              max="10"
              step="0.1"
              value={posZ}
              onChange={(e) => updateZ(parseFloat(e.target.value))}
              className="flex-1 accent-orange-500 bg-neutral-800 rounded-lg h-1"
            />
            <button 
              onClick={() => updateZ(Math.min(10, posZ + 0.5))}
              className="p-1 rounded bg-black/60 border border-orange-500/25 text-orange-500 hover:bg-orange-500/10 cursor-pointer text-xs"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Orbit Config */}
      <div className="border-t border-white/5 pt-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
          <span>Auto Orbit rotation</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoRotate} 
              onChange={(e) => updateAutoRotate(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-8 h-4 bg-black border border-orange-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-orange-500 after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-orange-500/20 peer-checked:border-orange-500" />
          </label>
        </div>
        
        {autoRotate && (
          <div>
            <div className="flex items-center justify-between text-[10px] mb-1 text-slate-400 font-bold uppercase">
              <span>Orbit sweep speed</span>
              <span className="font-mono text-orange-400 font-black">{(rotateSpeed * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range"
              min="0.05"
              max="2.5"
              step="0.05"
              value={rotateSpeed}
              onChange={(e) => updateRotateSpeed(parseFloat(e.target.value))}
              className="w-full accent-orange-500 bg-neutral-800 rounded-lg h-1"
            />
          </div>
        )}
      </div>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-1.5 border-t border-white/5 pt-3">
        <button 
          onClick={() => {
            setUICustomization({
              ...customization,
              spaceBlackHoleX: 0,
              spaceBlackHoleY: 0,
              spaceBlackHoleZ: 0,
              spaceBlackHoleAutoRotate: true,
              spaceBlackHoleRotateSpeed: 0.5
            });
          }}
          className="py-1 px-1.5 text-[10px] text-center rounded bg-black/60 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 active:scale-95 transition-all font-semibold cursor-pointer flex items-center justify-center gap-1 group"
        >
          <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
          <span>Reset</span>
        </button>
        
        <button 
          onClick={() => {
            setUICustomization({
              ...customization,
              spaceBlackHoleX: 4.5,
              spaceBlackHoleY: -1.8,
              spaceBlackHoleZ: -3.5,
              spaceBlackHoleAutoRotate: true,
              spaceBlackHoleRotateSpeed: 1.2
            });
          }}
          className="py-1 px-1 text-[10px] text-center rounded bg-black/60 border border-white/10 text-slate-300 hover:border-orange-500/30 hover:bg-orange-500/10 active:scale-95 transition-all cursor-pointer font-bold"
        >
          Orbit Edge
        </button>
        
        <button 
          onClick={() => {
            setUICustomization({
              ...customization,
              spaceBlackHoleX: 0,
              spaceBlackHoleY: 0.8,
              spaceBlackHoleZ: 5.2,
              spaceBlackHoleAutoRotate: false
            });
          }}
          className="py-1 px-1 text-[10px] text-center rounded bg-black/60 border border-white/10 text-slate-300 hover:border-orange-500/30 hover:bg-orange-500/10 active:scale-95 transition-all cursor-pointer font-bold"
        >
          Supermassive
        </button>
      </div>
    </div>
  );
};

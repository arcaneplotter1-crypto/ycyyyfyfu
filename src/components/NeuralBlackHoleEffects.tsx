import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { AppTheme, UICustomization } from '../types';

export const NeuralBlackHoleBackground: React.FC<{ theme: AppTheme, customization?: UICustomization }> = ({ theme, customization }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    // Default settings
    const baseColorHex = customization?.neuralBaseColor || '#00ffc8';
    const pulseSpeed = customization?.neuralPulseSpeed ?? 1.0;
    const branchDensity = customization?.neuralDensity ?? 18;
    const cameraSpeed = customization?.neuralCameraSpeed ?? 0.7;
    const glowStrength = customization?.neuralGlowStrength ?? 1.5;
    const pulseGlow = customization?.neuralPulseGlow ?? 3.0;
    const rainbowMode = customization?.neuralRainbowMode ?? 1.0;
    const neuralShape = customization?.neuralShape || 'neuron';
    const neuralScale = customization?.neuralScale ?? 1.0;

    const baseColor = new THREE.Color(baseColorHex);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00000a);
    scene.fog = new THREE.FogExp2(0x00000f, 0.022);

    const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 45);

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.autoRotate = true;
    controls.autoRotateSpeed = cameraSpeed;
    controls.enablePan = false;
    controls.maxDistance = 80;

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), glowStrength, 0.4, 0.85);
    bloomPass.threshold = 1.0;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const vertexShader = `
        attribute float aIsInput;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vIsInput;
        varying float vDist;

        void main() {
            vUv = uv;
            vIsInput = aIsInput;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            vDist = length(worldPos.xyz);
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `;

    const fragmentShader = `
        uniform float uTime;
        uniform float uPulses[10];
        uniform vec3 uCameraPos;
        uniform vec3 uBaseColor;
        uniform float uPulseGlow;
        uniform float uRainbowMode;

        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vIsInput;
        varying float vDist;

        float hash(vec3 p) {
            p = fract(p * 0.3183099 + .1);
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float noise(vec3 x) {
            vec3 i = floor(x);
            vec3 f = fract(x);
            f = f*f*(3.0-2.0*f);
            return mix(
                mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                    mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                    mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
        }
        vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
            return a + b * cos(6.28318*(c*t+d));
        }

        void main() {
            vec3 viewDir = normalize(uCameraPos - vWorldPos);
            float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
            float n1 = noise(vWorldPos * 0.5 + uTime * 0.2);
            float n2 = noise(vWorldPos * 2.0 - uTime * 0.5);

            vec3 baseCoreColor = mix(vec3(0.01, 0.018, 0.03), uBaseColor * 0.2, 0.5) + (uBaseColor * fresnel * n1 * 0.5);
            baseCoreColor *= (0.5 + 0.5 * n2);

            vec3 pulseColor = vec3(0.0);
            for (int i = 0; i < 10; i++) {
                float p = uPulses[i];
                if (p > -45.0 && p < 50.0) {
                    bool isInputPhase = p > 0.0;
                    if (isInputPhase && vIsInput < 0.5) continue;
                    if (!isInputPhase && vIsInput > 0.5) continue;
                    
                    float currentP = abs(p);
                    float delta = isInputPhase ? (vDist - currentP) : (currentP - vDist);

                    float tail = smoothstep(12.0, 0.0, delta) * step(0.0, delta);
                    float leading = smoothstep(2.0, 0.0, -delta) * step(delta, 0.0);
                    float core = exp(-delta * delta * 2.0);
                    
                    float pi = max(core * 3.0, (tail + leading) * 1.5);
                    if (pi > 0.01) {
                        vec3 dir    = normalize(vWorldPos);
                        float angle = atan(dir.z, dir.x);
                        vec3 pColor = uBaseColor;
                        
                        if (uRainbowMode > 0.5) {
                            pColor = palette(
                                angle * 0.15 + vDist * 0.05 - uTime * 0.5 + currentP * 0.1,
                                vec3(0.5, 0.5, 0.5), 
                                vec3(0.5, 0.5, 0.5),
                                vec3(1.0, 1.0, 1.0), 
                                vec3(0.00, 0.33, 0.67)
                            );
                        }
                        
                        pulseColor += pColor * uPulseGlow * pi * (0.8 + 0.2*n2);
                    }
                }
            }

            vec3 somaColor = vec3(0.0);
            if (vDist < 4.0) {
                for (int i = 0; i < 10; i++) {
                    float p = uPulses[i];
                    if (p > -15.0 && p < 15.0) {
                        float somaFlash = exp(-pow(p * 0.2, 2.0)) * 2.5;
                        somaColor += uBaseColor * somaFlash;
                    }
                }
            }

            gl_FragColor = vec4(baseCoreColor + pulseColor + somaColor, 1.0);
        }
    `;

    const material = new THREE.ShaderMaterial({
        vertexShader, fragmentShader,
        uniforms: {
            uTime:          { value: 0 },
            uPulses:        { value: new Array(10).fill(-50.0) },
            uCameraPos:     { value: new THREE.Vector3() },
            uBaseColor:     { value: baseColor },
            uPulseGlow:     { value: pulseGlow },
            uRainbowMode:   { value: rainbowMode }
        },
        transparent: false,
        depthWrite:  true,
        side: THREE.FrontSide
    });

    const responsiveScale = (Math.min(window.innerWidth, window.innerHeight) / 1000) * neuralScale;

    // Custom Shader Material for Glowing Leaves
    const leafVertexShader = `
        attribute float aDist;
        attribute float aIsInput;
        varying float vDist;
        varying float vIsInput;
        varying vec3 vWorldPos;
        void main() {
            vDist = aDist;
            vIsInput = aIsInput;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            gl_PointSize = 4.0 + 2.0 * sin(uv.x * 10.0);
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `;

    const leafFragmentShader = `
        uniform float uTime;
        uniform float uPulses[10];
        uniform vec3 uBaseColor;
        uniform float uPulseGlow;
        varying float vDist;
        varying float vIsInput;
        varying vec3 vWorldPos;

        void main() {
            float distToCenter = length(gl_PointCoord - vec2(0.5));
            if (distToCenter > 0.5) discard;

            vec3 color = uBaseColor * 0.4;
            float pulseContrib = 0.0;

            for (int i = 0; i < 10; i++) {
                float p = uPulses[i];
                if (p > -45.0 && p < 50.0) {
                    bool isInputPhase = p > 0.0;
                    if (isInputPhase && vIsInput < 0.5) continue;
                    if (!isInputPhase && vIsInput > 0.5) continue;
                    
                    float currentP = abs(p);
                    float delta = isInputPhase ? (vDist - currentP) : (currentP - vDist);
                    float core = exp(-delta * delta * 4.0);
                    pulseContrib += core * uPulseGlow * 1.5;
                }
            }
            
            float alpha = (1.0 - distToCenter * 2.0) * (0.6 + pulseContrib);
            gl_FragColor = vec4(color + uBaseColor * pulseContrib, alpha);
        }
    `;

    const leafMaterial = new THREE.ShaderMaterial({
        vertexShader: leafVertexShader,
        fragmentShader: leafFragmentShader,
        uniforms: {
            uTime: material.uniforms.uTime,
            uPulses: material.uniforms.uPulses,
            uBaseColor: material.uniforms.uBaseColor,
            uPulseGlow: material.uniforms.uPulseGlow
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const structureGroup = new THREE.Group();
    structureGroup.scale.setScalar(responsiveScale);
    scene.add(structureGroup);

    function createWanderingPath(start: THREE.Vector3, dir: THREE.Vector3, length: number, segments: number, jitterScale: number, endPoint?: THREE.Vector3) {
        let pts = [start.clone()];
        let curr = start.clone();
        let cDir = dir.clone().normalize();
        for (let i = 0; i < segments; i++) {
            cDir.x += (Math.random() - 0.5) * jitterScale;
            cDir.y += (Math.random() - 0.5) * jitterScale;
            cDir.z += (Math.random() - 0.5) * jitterScale;
            cDir.normalize();
            curr = curr.clone().add(cDir.clone().multiplyScalar(length / segments));
            pts.push(curr);
        }
        if (endPoint) {
            const approach = endPoint.clone().add(new THREE.Vector3(-1.5, 0, 0));
            pts[pts.length - 1] = approach;
            pts.push(endPoint.clone());
        }
        return new THREE.CatmullRomCurve3(pts);
    }

    function taperGeometry(geo: THREE.TubeGeometry, baseRadius: number, isInput: boolean) {
        const pos  = geo.attributes.position;
        const norm = geo.attributes.normal;
        const uv   = geo.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
            const u = uv.getX(i);
            let t   = isInput ? 1.0 : (1.0 - u);
            const taper = Math.pow(t, 0.6);
            const shrink = baseRadius * (1.0 - taper);
            pos.setXYZ(i,
                pos.getX(i) - norm.getX(i) * shrink,
                pos.getY(i) - norm.getY(i) * shrink,
                pos.getZ(i) - norm.getZ(i) * shrink
            );
        }
        geo.computeVertexNormals();
    }

    function addBranch(curve: THREE.CatmullRomCurve3, radius: number, isInput: boolean) {
        const geo = new THREE.TubeGeometry(curve, Math.floor(curve.getLength() * 3), radius, 12, false);
        taperGeometry(geo, radius, isInput);
        const arr = new Float32Array(geo.attributes.position.count).fill(isInput ? 1.0 : 0.0);
        geo.setAttribute('aIsInput', new THREE.BufferAttribute(arr, 1));
        const mesh = new THREE.Mesh(geo, material);
        structureGroup.add(mesh);
        return { curve, mesh };
    }

    const leafPosArray: THREE.Vector3[] = [];
    const leafDistArray: number[] = [];

    if (neuralShape === 'neuron') {
        const somaRadius = 3.3;
        const somaGeo = new THREE.IcosahedronGeometry(somaRadius, 16);
        const somaPos = somaGeo.attributes.position;
        for (let i = 0; i < somaPos.count; i++) {
            let v = new THREE.Vector3().fromBufferAttribute(somaPos, i);
            let n = Math.sin(v.x*2)*Math.cos(v.y*2)*Math.sin(v.z*2)*0.5 + Math.sin(v.x*5+v.y*3)*0.2;
            v.add(v.clone().normalize().multiplyScalar(n));
            somaPos.setXYZ(i, v.x, v.y, v.z);
        }
        somaGeo.computeVertexNormals();
        const somaIsInput = new Float32Array(somaPos.count).fill(0.0);
        somaGeo.setAttribute('aIsInput', new THREE.BufferAttribute(somaIsInput, 1));
        structureGroup.add(new THREE.Mesh(somaGeo, material));

        const inputCurve = createWanderingPath(
            new THREE.Vector3(-45, 0, 0), new THREE.Vector3(1, 0, 0), 46, 30, 0.05,
            new THREE.Vector3(-somaRadius * 0.1, 0, 0)
        );
        addBranch(inputCurve, 0.6, true);

        for (let i = 0; i < branchDensity; i++) {
            let phi   = Math.random() * Math.PI * 2;
            let theta = Math.acos(Math.random() * 2 - 1);
            if (Math.cos(phi) * Math.sin(theta) < -0.3)
                phi = phi > Math.PI ? phi - Math.PI : phi + Math.PI;

            let startDir = new THREE.Vector3(
                Math.cos(phi)*Math.sin(theta),
                Math.sin(phi)*Math.sin(theta),
                Math.cos(theta)
            );
            let start = startDir.clone().multiplyScalar(somaRadius * 0.8);
            let length  = 20 + Math.random() * 30;
            let mainRadius = 0.4 + Math.random() * 0.3;
            let { curve: mainCurve } = addBranch(
                createWanderingPath(start, startDir, length, 25, 0.4),
                mainRadius, false
            );

            let numSec = Math.floor(Math.random() * 4) + 2;
            for (let j = 0; j < numSec; j++) {
                let t = 0.2 + Math.random() * 0.6;
                let bStart = mainCurve.getPoint(t);
                let tangent = mainCurve.getTangent(t);
                let rv = new THREE.Vector3(Math.random()-.5, Math.random()-.5, Math.random()-.5).normalize();
                let bDir = tangent.clone().cross(rv).normalize().add(tangent.clone().multiplyScalar(0.5)).normalize();
                addBranch(
                    createWanderingPath(bStart, bDir, (1-t)*length*(0.4+Math.random()*0.4), 15, 0.6),
                    mainRadius*(1-t)*0.8, false
                );
            }
        }
    } else if (neuralShape === 'tree') {
        const createRecursiveTree = (start: THREE.Vector3, dir: THREE.Vector3, length: number, radius: number, depth: number) => {
            if (depth <= 0) {
                // Add bunch of leaves around the tip
                for (let i = 0; i < 8; i++) {
                    const leaf = start.clone().add(new THREE.Vector3(
                        (Math.random() - 0.5) * 5,
                        (Math.random() - 0.5) * 5,
                        (Math.random() - 0.5) * 5
                    ));
                    leafPosArray.push(leaf);
                    leafDistArray.push(leaf.length());
                }
                return;
            }
            
            const curve = createWanderingPath(start, dir, length, 12, 0.25);
            addBranch(curve, radius, false);
            
            const end = curve.getPoint(1);
            const tangent = curve.getTangent(1);
            
            const numBranches = (depth > 2) ? 2 : (2 + Math.floor(Math.random() * 2));
            for (let i = 0; i < numBranches; i++) {
                const newDir = tangent.clone();
                newDir.x += (Math.random() - 0.5) * 1.8;
                newDir.y += (Math.random() - 0.5) * 1.5;
                newDir.z += (Math.random() - 0.5) * 1.8;
                newDir.normalize();
                createRecursiveTree(end, newDir, length * 0.8, radius * 0.65, depth - 1);
            }
        };

        // Thick trunk starting from origin
        const trunkCurve = createWanderingPath(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 25, 15, 0.1);
        addBranch(trunkCurve, 3.5, false); 
        
        // Input branch leading to the trunk base (origin)
        const inputCurve = createWanderingPath(
            new THREE.Vector3(-45, 0, 0), new THREE.Vector3(1, 0, 0), 45, 20, 0.05,
            new THREE.Vector3(0, 0, 0)
        );
        addBranch(inputCurve, 1.0, true);
        
        // Recursive crown
        createRecursiveTree(trunkCurve.getPoint(1), new THREE.Vector3(0, 1, 0), 15, 2.0, 5);

        // Add Glowing Leaves
        if (leafPosArray.length > 0) {
            const leafGeo = new THREE.BufferGeometry().setFromPoints(leafPosArray);
            leafGeo.setAttribute('aDist', new THREE.Float32BufferAttribute(leafDistArray, 1));
            const isInputArr = new Float32Array(leafPosArray.length).fill(0.0);
            leafGeo.setAttribute('aIsInput', new THREE.Float32BufferAttribute(isInputArr, 1));
            
            const uvs = new Float32Array(leafPosArray.length * 2);
            for(let i=0; i<leafPosArray.length; i++) {
                uvs[i*2] = Math.random();
                uvs[i*2+1] = Math.random();
            }
            leafGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

            const leaves = new THREE.Points(leafGeo, leafMaterial);
            structureGroup.add(leaves);
        }
    } else if (neuralShape === 'spiral') {
        const center = new THREE.Vector3(0, 0, 0);
        const inputCurve = createWanderingPath(
            new THREE.Vector3(-45, 0, 0), new THREE.Vector3(1, 0, 0), 45, 20, 0.1,
            center
        );
        addBranch(inputCurve, 0.8, true);

        for (let i = 0; i < branchDensity; i++) {
            const angle = (i / branchDensity) * Math.PI * 2;
            const radius = 5 + Math.random() * 30;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const end = new THREE.Vector3(x, (Math.random() - 0.5) * 10, z);
            
            const curve = createWanderingPath(center, end.clone().normalize(), end.length(), 15, 0.3);
            addBranch(curve, 0.5, false);
            leafPosArray.push(end);
            leafDistArray.push(end.length());
        }

        if (leafPosArray.length > 0) {
             const leafGeo = new THREE.BufferGeometry().setFromPoints(leafPosArray);
             leafGeo.setAttribute('aDist', new THREE.Float32BufferAttribute(leafDistArray, 1));
             leafGeo.setAttribute('aIsInput', new THREE.Float32BufferAttribute(new Float32Array(leafPosArray.length).fill(0.0), 1));
             const uvs = new Float32Array(leafPosArray.length * 2);
             for(let i=0; i<leafPosArray.length; i++) uvs[i*2] = Math.random();
             leafGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
             structureGroup.add(new THREE.Points(leafGeo, leafMaterial));
        }
    }

    function makeParticles(count: number, spread: number, color: THREE.Color, size: number, opacity: number) {
        const geo = new THREE.BufferGeometry();
        const pts = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) pts[i] = (Math.random() - 0.5) * spread;
        geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
        const mat = new THREE.PointsMaterial({
            color: color,
            size,
            transparent: true,
            opacity,
            blending:   THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        return new THREE.Points(geo, mat);
    }

    // Adapt particle colors to our base color to fit the theme
    const pc1 = baseColor.clone().multiplyScalar(0.8);
    const pc2 = baseColor.clone().multiplyScalar(0.4);
    const pc3 = baseColor.clone().multiplyScalar(1.2);

    const dustA = makeParticles(1200, 120, pc1, 0.08, 0.25);
    const dustB = makeParticles(400,  90, pc2, 0.16, 0.18);
    const dustC = makeParticles(120,  60, pc3, 0.30, 0.12);
    scene.add(dustA, dustB, dustC);

    let pulses = new Array(10).fill(-50.0);
    let pulseIdx = 0;
    const INPUT_LENGTH = 45.0;
    
    // Auto trigger pulses on an interval so user sees them without having to click sometimes
    const autoPulseInterval = setInterval(() => {
        triggerPulse();
    }, 4000);

    const triggerPulse = () => {
        pulses[pulseIdx] = INPUT_LENGTH;
        pulseIdx = (pulseIdx + 1) % 10;
        document.body.classList.add('active');
        setTimeout(() => document.body.classList.remove('active'), 300);
    };

    const handleClick = () => triggerPulse();
    window.addEventListener('click', handleClick);

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const clock = new THREE.Clock();
    let animationFrameId: number;

    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();

        controls.update();

        dustA.rotation.y += delta * 0.008;
        dustA.rotation.x += delta * 0.003;
        dustB.rotation.y -= delta * 0.005;
        dustB.rotation.z += delta * 0.002;
        dustC.rotation.y += delta * 0.015;

        material.uniforms.uTime.value += delta;
        material.uniforms.uCameraPos.value.copy(camera.position);

        let activePulses = [...pulses];
        for (let i = 0; i < 10; i++) {
            if (activePulses[i] > -50.0) {
                activePulses[i] -= delta * 35.0 * pulseSpeed;
                if (activePulses[i] <= -50.0) {
                    activePulses[i] = -50.0;
                }
            }
        }
        pulses = activePulses;
        material.uniforms.uPulses.value = pulses;

        composer.render();
    }

    animate();

    return () => {
        clearInterval(autoPulseInterval);
        window.removeEventListener('click', handleClick);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        
        composer.dispose();
        renderer.dispose();
        
        // Clean up geometries and materials
        material.dispose();
        leafMaterial.dispose();
        structureGroup.traverse((object) => {
            if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
                object.geometry.dispose();
                if (object.material instanceof THREE.Material) {
                    object.material.dispose();
                }
            }
        });
        
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }
    };
  }, [
    customization?.neuralBaseColor,
    customization?.neuralPulseSpeed,
    customization?.neuralDensity,
    customization?.neuralCameraSpeed,
    customization?.neuralGlowStrength,
    customization?.neuralPulseGlow,
    customization?.neuralRainbowMode,
    customization?.neuralShape,
    customization?.neuralScale
  ]);

  return (
    <div 
        ref={containerRef} 
        className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#00000a]" 
        style={{ width: '100vw', height: '100vh' }} 
    />
  );
};

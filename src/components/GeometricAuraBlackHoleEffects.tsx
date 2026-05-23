import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';
import { BlackHoleSettings, UICustomization } from '../types';

const mergeGeometries = (items: { geom: THREE.BufferGeometry; color?: THREE.Color }[]) => {
  let totalVertices = 0;
  let totalIndices = 0;
  for (const item of items) {
    totalVertices += item.geom.attributes.position.count;
    if (item.geom.index) {
      totalIndices += item.geom.index.count;
    }
  }
  
  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const uvs = new Float32Array(totalVertices * 2);
  const colors = new Float32Array(totalVertices * 3);
  const indices = new Uint32Array(totalIndices);
  
  let vOffset = 0;
  let iOffset = 0;
  
  for (const item of items) {
    const g = item.geom;
    const c = item.color;
    const pos = g.attributes.position.array as Float32Array;
    const norm = g.attributes.normal?.array as Float32Array;
    const uv = g.attributes.uv?.array as Float32Array;
    const count = g.attributes.position.count;
    
    positions.set(pos, vOffset * 3);
    if (norm) {
      normals.set(norm, vOffset * 3);
    }
    if (uv) {
      uvs.set(uv, vOffset * 2);
    }
    
    if (c) {
      for (let i = 0; i < count; i++) {
        colors[(vOffset + i) * 3] = c.r;
        colors[(vOffset + i) * 3 + 1] = c.g;
        colors[(vOffset + i) * 3 + 2] = c.b;
      }
    } else {
      for (let i = 0; i < count; i++) {
        colors[(vOffset + i) * 3] = 1;
        colors[(vOffset + i) * 3 + 1] = 1;
        colors[(vOffset + i) * 3 + 2] = 1;
      }
    }
    
    if (g.index) {
      const ind = g.index.array;
      for (let i = 0; i < ind.length; i++) {
        indices[iOffset + i] = ind[i] + vOffset;
      }
      iOffset += ind.length;
    } else {
      for (let i = 0; i < count; i++) {
        indices[iOffset + i] = i + vOffset;
      }
      iOffset += count;
    }
    
    vOffset += count;
  }
  
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  merged.setIndex(new THREE.BufferAttribute(indices, 1));
  return merged;
};

const getBrainGeometry = () => {
  const geom = new THREE.SphereGeometry(0.85, 60, 60);
  const posAttr = geom.attributes.position;
  const vertices = posAttr.array as Float32Array;
  
  for (let i = 0; i < vertices.length; i += 3) {
    let x = vertices[i];
    let y = vertices[i+1];
    let z = vertices[i+2];
    
    const r = Math.sqrt(x*x + y*y + z*z);
    if (r === 0) continue;
    
    const nx = x / r;
    const ny = y / r;
    const nz = z / r;
    
    // Scale matching human brain proportions
    const scaleX = 0.85 * (1.1 - 0.15 * nz); // slightly tapered at the front, bulbous posterior
    const scaleY = 0.88;
    const scaleZ = 1.15;
    
    x *= scaleX;
    y *= scaleY;
    z *= scaleZ;
    
    let disp = 0;
    
    // Deep Longitudinal Fissure (midline split)
    const distToMidline = Math.abs(x);
    if (y > -0.35) {
      const fissureDepth = 0.32 * Math.exp(-distToMidline * distToMidline / 0.015);
      disp -= fissureDepth;
    }
    
    // Smooth wavy sulci and gyri (cortical folds) using high freq multi-spectral waves
    const freq = 13.0;
    let gyri = 0.065 * Math.cos(freq * x + Math.sin(18 * y)) * 
                       Math.sin(freq * y + Math.cos(18 * z)) * 
                       Math.cos(freq * z);
                       
    // Fine granular folds for added depth
    gyri += 0.012 * Math.sin(30 * x) * Math.cos(30 * y) * Math.sin(30 * z);
    disp += gyri;
    
    // Cerebellum: Lower-Back structure (inferior / posterior)
    const inCerebellum = z < -0.2 && y < -0.15 && y > -0.75;
    if (inCerebellum) {
      const distToCerebCenter = Math.sqrt(x * x + (y + 0.45) * (y + 0.45) + (z + 0.55) * (z + 0.55));
      if (distToCerebCenter < 0.45) {
        // High frequency fine cerebellar horizontal stripes (folia)
        disp += 0.03 + 0.018 * Math.sin(75 * y);
      }
    }
    
    // Displace vertices along normal vector
    x += nx * disp;
    y += ny * disp;
    z += nz * disp;
    
    // Brain Stem: Vertical cylindrical extrusion exiting from center-bottom (medulla oblongata)
    const isStem = y < -0.55 && x * x + (z + 0.08) * (z + 0.08) < 0.15;
    if (isStem) {
      const angle = Math.atan2(z + 0.08, x);
      const stemRadius = 0.15 + 0.015 * Math.sin(y * 18);
      x = Math.cos(angle) * stemRadius;
      z = Math.sin(angle) * stemRadius - 0.08;
      y = -0.65 + (y + 0.65) * 1.5; // Stretch stem downwards
    }
    
    vertices[i] = x;
    vertices[i+1] = y;
    vertices[i+2] = z;
  }
  
  geom.computeVertexNormals();
  return geom;
};

const getHeartGeometry = () => {
  // 1. Muscle body of ventricles (pear-shaped, slanted)
  const bodyGeom = new THREE.SphereGeometry(0.68, 64, 64);
  const posAttr = bodyGeom.attributes.position;
  const verts = posAttr.array as Float32Array;
  
  for (let i = 0; i < verts.length; i += 3) {
    let x = verts[i];
    let y = verts[i+1];
    let z = verts[i+2];
    
    const r = Math.sqrt(x * x + y * y + z * z);
    if (r > 0) {
      const nx = x / r;
      const ny = y / r;
      const nz = z / r;
      
      let scaleX = 0.85;
      let scaleY = 1.15;
      let scaleZ = 0.85;
      
      x *= scaleX;
      y *= scaleY;
      z *= scaleZ;
      
      // Apex tapering pointing downwards, slightly to the left (-x) and forward (+z)
      if (y < 0.15) {
        const t = (0.15 - y) / 1.1; // 0 to 1 at bottom apex
        const pinch = 1.0 - 0.65 * t;
        x *= pinch;
        z *= pinch;
        x -= 0.3 * t;
        z += 0.2 * t;
      }
      
      // Interventricular Sulcus: indent of the anterior dividing groove between chambers
      const sulcusLine = x + 0.45 * y - 0.15;
      const sulcusDepth = 0.055 * Math.exp(-sulcusLine * sulcusLine / 0.012);
      if (z > 0) {
        x -= nx * sulcusDepth;
        y -= ny * sulcusDepth;
        z -= nz * sulcusDepth;
      }
      
      // Atrioventricular sulcus
      const avSulcus = y - 0.35;
      const avDepth = 0.04 * Math.exp(-avSulcus * avSulcus / 0.02);
      x -= nx * avDepth;
      y -= ny * avDepth;
      z -= nz * avDepth;

      // Fine muscular striation/ripples
      const ripples = 0.006 * Math.sin(x * 20 + y * 30) * Math.cos(z * 20);
      x += nx * ripples;
      y += ny * ripples;
      z += nz * ripples;
    }
    
    verts[i] = x;
    verts[i+1] = y;
    verts[i+2] = z;
  }
  bodyGeom.computeVertexNormals();

  // Right Atrium (muscular pouch)
  const raGeom = new THREE.SphereGeometry(0.3, 32, 32);
  const raPosAttr = raGeom.attributes.position;
  const raVerts = raPosAttr.array as Float32Array;
  for (let i = 0; i < raVerts.length; i += 3) {
    let x = raVerts[i];
    let y = raVerts[i+1];
    let z = raVerts[i+2];
    const r = Math.sqrt(x*x + y*y + z*z);
    if (r > 0) {
      const nx = x/r, ny = y/r, nz = z/r;
      x *= 0.9;
      y *= 1.2;
      z *= 0.8;
      const ripples = 0.01 * Math.sin(x * 15 + y * 25);
      x += nx * ripples;
      y += ny * ripples;
      z += nz * ripples;
      raVerts[i] = x; raVerts[i+1] = y; raVerts[i+2] = z;
    }
  }
  raGeom.translate(0.35, 0.35, -0.05);
  raGeom.computeVertexNormals();

  // Left Atrium (muscular pouch)
  const laGeom = new THREE.SphereGeometry(0.24, 32, 32);
  const laPosAttr = laGeom.attributes.position;
  const laVerts = laPosAttr.array as Float32Array;
  for (let i = 0; i < laVerts.length; i += 3) {
    let x = laVerts[i];
    let y = laVerts[i+1];
    let z = laVerts[i+2];
    const r = Math.sqrt(x*x + y*y + z*z);
    if (r > 0) {
      const nx = x/r, ny = y/r, nz = z/r;
      x *= 1.1;
      y *= 0.9;
      z *= 0.9;
      const ripples = 0.01 * Math.sin(x * 15 + y * 25);
      x += nx * ripples;
      y += ny * ripples;
      z += nz * ripples;
      laVerts[i] = x; laVerts[i+1] = y; laVerts[i+2] = z;
    }
  }
  laGeom.translate(-0.35, 0.45, -0.2);
  laGeom.computeVertexNormals();
  
  // 2. Aortic Arch: Curved tube reaching high from top center, sweeping backward & down
  const aortaGeom = new THREE.TorusGeometry(0.24, 0.08, 16, 32, Math.PI * 1.25);
  aortaGeom.rotateY(-Math.PI / 4.2);
  aortaGeom.rotateZ(-Math.PI * 0.44);
  aortaGeom.translate(0.04, 0.58, -0.06);
  
  // 3. Pulmonary Trunk: Main artery branching from right ventricle front
  const pulmonaryGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.45, 16);
  pulmonaryGeom.rotateZ(Math.PI / 8.5);
  pulmonaryGeom.rotateX(Math.PI / 5.5);
  pulmonaryGeom.translate(-0.14, 0.48, 0.14);

  // Left Pulmonary Artery branch
  const lPulmGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12);
  lPulmGeom.rotateZ(Math.PI / 2.2);
  lPulmGeom.rotateX(-Math.PI / 8);
  lPulmGeom.translate(-0.35, 0.6, 0.05);

  // Right Pulmonary Artery branch
  const rPulmGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 12);
  rPulmGeom.rotateZ(Math.PI / 2.1);
  rPulmGeom.rotateX(-Math.PI / 6);
  rPulmGeom.translate(0.15, 0.6, 0.02);
  
  // 4. Superior Vena Cava (SVC): Tube passing down into the right atrium (back-right side)
  const svcGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.44, 16);
  svcGeom.rotateZ(-Math.PI / 16);
  svcGeom.translate(0.3, 0.55, -0.15);
  
  // 5. Inferior Vena Cava (IVC): Lower vertical tube
  const ivcGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.32, 16);
  ivcGeom.rotateZ(Math.PI / 16);
  ivcGeom.translate(0.25, -0.42, -0.18);

  // Pulmonary Veins (Left and Right)
  const lPvGeom1 = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12);
  lPvGeom1.rotateZ(Math.PI / 2.1);
  lPvGeom1.translate(-0.45, 0.38, -0.25);
  
  const lPvGeom2 = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12);
  lPvGeom2.rotateZ(Math.PI / 2.1);
  lPvGeom2.translate(-0.43, 0.26, -0.25);

  const rPvGeom1 = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12);
  rPvGeom1.rotateZ(Math.PI / 1.9);
  rPvGeom1.translate(0.45, 0.38, -0.22);

  const rPvGeom2 = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12);
  rPvGeom2.rotateZ(Math.PI / 1.9);
  rPvGeom2.translate(0.43, 0.26, -0.22);
  
  const bodyPink = new THREE.Color(0xff6688);
  const arteryRed = new THREE.Color(0xdd1122);
  const veinBlue = new THREE.Color(0x1144dd);

  const merged = mergeGeometries([
    { geom: bodyGeom, color: bodyPink },
    { geom: raGeom, color: bodyPink },
    { geom: laGeom, color: bodyPink },
    { geom: aortaGeom, color: arteryRed },
    { geom: pulmonaryGeom, color: veinBlue },
    { geom: lPulmGeom, color: veinBlue },
    { geom: rPulmGeom, color: veinBlue },
    { geom: svcGeom, color: veinBlue },
    { geom: ivcGeom, color: veinBlue },
    { geom: lPvGeom1, color: arteryRed },
    { geom: lPvGeom2, color: arteryRed },
    { geom: rPvGeom1, color: arteryRed },
    { geom: rPvGeom2, color: arteryRed }
  ]);
  merged.computeVertexNormals();
  return merged;
};

const getShapeGeometry = (shape: string) => {
  switch (shape) {
    case 'brain':
      return getBrainGeometry();
    case 'heart':
      return getHeartGeometry();
    case 'torusKnot':
      return new THREE.TorusKnotGeometry(0.72, 0.22, 120, 16);
    case 'torus':
      return new THREE.TorusGeometry(0.75, 0.25, 32, 64);
    case 'sphere':
      return new THREE.SphereGeometry(1.0, 48, 48);
    case 'octahedron':
      return new THREE.OctahedronGeometry(1.1, 0);
    case 'dodecahedron':
      return new THREE.DodecahedronGeometry(1.1, 0);
    case 'icosahedron':
    default:
      return new THREE.IcosahedronGeometry(1.1, 0);
  }
};

const deriveSmartColors = (baseHex: string) => {
  const color = new THREE.Color(baseHex || '#66ccff');
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);

  // Core Color: Base color itself
  const core = color.clone();

  // Wire Color: Brighter, slightly shifted hue (+0.05 / 18 degrees) and higher lightness
  const wire = new THREE.Color().setHSL((hsl.h + 0.05) % 1.0, Math.min(1.0, hsl.s * 1.1), Math.max(0.65, hsl.l * 1.1));

  // Stars Color: Very pale/light tint
  const stars = new THREE.Color().setHSL(hsl.h, Math.min(0.4, hsl.s), 0.92);

  // Inner Ring Color: Analogous shift (-0.08)
  const innerRing = new THREE.Color().setHSL((hsl.h - 0.08 + 1.0) % 1.0, hsl.s, Math.max(0.4, hsl.l * 0.9));

  // Outer Ring Color: Complementary contrast (hue + 0.5)
  const outerRing = new THREE.Color().setHSL((hsl.h + 0.5) % 1.0, Math.min(1.0, hsl.s * 1.2), Math.max(0.5, hsl.l));

  // Gas Color: Analogous shifted (+0.12) with ambient lightness
  const gas = new THREE.Color().setHSL((hsl.h + 0.12) % 1.0, hsl.s * 0.8, 0.7);

  // Grid Color: Deep neon variant (low lightness, high saturation)
  const grid = new THREE.Color().setHSL(hsl.h, Math.min(0.8, hsl.s * 1.2), 0.18);

  return { core, wire, stars, innerRing, outerRing, gas, grid };
};

export const GeometricAuraBlackHoleBackground = ({ 
  performanceMode, 
  settings, 
  customization, 
  isMini = false 
}: { 
  performanceMode?: boolean; 
  settings?: BlackHoleSettings;
  customization?: UICustomization;
  isMini?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(settings);

  // Responsive 3D movement coordinates
  const [posX, setPosX] = useState(() => customization?.spaceBlackHoleX ?? 0);
  const [posY, setPosY] = useState(() => customization?.spaceBlackHoleY ?? 0);
  const [posZ, setPosZ] = useState(() => customization?.spaceBlackHoleZ ?? 0);

  // Auto orbit settings
  const [autoRotate, setAutoRotate] = useState(() => customization?.spaceBlackHoleAutoRotate ?? true);
  const [rotateSpeed, setRotateSpeed] = useState(() => customization?.spaceBlackHoleRotateSpeed ?? 0.5);

  const coordsRef = useRef({ x: 0, y: 0, z: 0 });
  const autoRotateRef = useRef(true);
  const rotateSpeedRef = useRef(0.5);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    coordsRef.current = { x: posX, y: posY, z: posZ };
  }, [posX, posY, posZ]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    rotateSpeedRef.current = rotateSpeed;
  }, [rotateSpeed]);

  useEffect(() => {
    if (typeof customization?.spaceBlackHoleX === 'number') setPosX(customization.spaceBlackHoleX);
    if (typeof customization?.spaceBlackHoleY === 'number') setPosY(customization.spaceBlackHoleY);
    if (typeof customization?.spaceBlackHoleZ === 'number') setPosZ(customization.spaceBlackHoleZ);
    if (typeof customization?.spaceBlackHoleAutoRotate === 'boolean') setAutoRotate(customization.spaceBlackHoleAutoRotate);
    if (typeof customization?.spaceBlackHoleRotateSpeed === 'number') setRotateSpeed(customization.spaceBlackHoleRotateSpeed);
  }, [
    customization?.spaceBlackHoleX,
    customization?.spaceBlackHoleY,
    customization?.spaceBlackHoleZ,
    customization?.spaceBlackHoleAutoRotate,
    customization?.spaceBlackHoleRotateSpeed,
  ]);

  useEffect(() => {
    if (!containerRef.current || performanceMode) return;

    let isMounted = true;
    let reqId: number;

    const initialWidth = isMini && containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
    const initialHeight = isMini && containerRef.current ? containerRef.current.clientHeight : window.innerHeight;

    const scene = new THREE.Scene();
    if (isMini) {
      scene.background = null;
      scene.fog = null;
    } else {
      scene.background = new THREE.Color(0x050816);
      scene.fog = new THREE.FogExp2(0x050816, 0.008);
    }

    const camera = new THREE.PerspectiveCamera(45, initialWidth / initialHeight, 0.1, 1000);
    camera.position.set(3, 2, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: isMini, powerPreference: "high-performance" });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMini ? 1.2 : 2)); // Cap pixel ratio
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    if (isMini) {
      renderer.setClearColor(0x000000, 0);
    }
    
    containerRef.current.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(initialWidth, initialHeight), 1.2, 0.3, 0.85);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 0.8;
    bloomPass.radius = 0.5;

    const effectComposer = new EffectComposer(renderer);
    effectComposer.addPass(renderScene);
    effectComposer.addPass(bloomPass);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 1.2;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.zoomSpeed = 1;
    controls.rotateSpeed = 1;
    controls.target.set(0, 0, 0);

    // Group the core elements to allow target tracking & transformation via HUD controls
    const auraGroup = new THREE.Group();
    scene.add(auraGroup);

    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(2, 3, 4);
    scene.add(mainLight);

    const backLight = new THREE.PointLight(0x44664c, 0.6); // Based on user decimal color
    backLight.position.set(-2, 1, -3);
    auraGroup.add(backLight);

    const fillLight = new THREE.PointLight(0xffaa66, 0.5);
    fillLight.position.set(1.5, 1, 2);
    auraGroup.add(fillLight);

    const colorLight = new THREE.PointLight(0xff442a, 0.8);
    colorLight.position.set(1, 1, 2);
    auraGroup.add(colorLight);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = isMini ? 1000 : 3000; // Use max pool size
    const starPositions = new Float32Array(starCount * 3);
    for (let e = 0; e < starCount; e++) {
      starPositions[3 * e] = 200 * (Math.random() - 0.5);
      starPositions[3 * e + 1] = 100 * (Math.random() - 0.5);
      starPositions[3 * e + 2] = 80 * (Math.random() - 0.5) - 40;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xaaccff, size: 0.08, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const shapeType = settingsRef.current?.geometricAuraShape || 'icosahedron';
    const geometryIco = getShapeGeometry(shapeType);
    const materialMain = new THREE.MeshStandardMaterial({
      color: 0x4a7a5c, emissive: 0x112233, roughness: 0.28, metalness: 0.75, flatShading: false, transparent: true, opacity: 0.92,
      vertexColors: shapeType === 'heart'
    });
    const coreMesh = new THREE.Mesh(geometryIco, materialMain);
    auraGroup.add(coreMesh);

    const wireframeMat = new THREE.MeshBasicMaterial({ color: 0x66ccff, wireframe: true, transparent: true, opacity: 0.25 });
    const wireframeIco = new THREE.Mesh(geometryIco, wireframeMat);
    wireframeIco.scale.setScalar(1.08);
    auraGroup.add(wireframeIco);

    const ringParticleCount = isMini ? 400 : 1200;
    const ringGeometry = new THREE.BufferGeometry();
    const ringPositions = new Float32Array(ringParticleCount * 3);
    const ringColors = new Float32Array(ringParticleCount * 3);
    for (let e = 0; e < ringParticleCount; e++) {
      const t = (e / ringParticleCount) * Math.PI * 2;
      const o = 1.55;
      const n = Math.cos(t) * o;
      const r = Math.sin(t) * o;
      const i = 0.35 * Math.sin(3 * t);
      ringPositions[3 * e] = n;
      ringPositions[3 * e + 1] = i;
      ringPositions[3 * e + 2] = r;
      ringColors[3 * e] = 0.4 + 0.6 * Math.sin(t);
      ringColors[3 * e + 1] = 0.3 + 0.7 * Math.cos(1.7 * t);
      ringColors[3 * e + 2] = 0.8 + 0.2 * Math.sin(2.3 * t);
    }
    ringGeometry.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
    ringGeometry.setAttribute("color", new THREE.BufferAttribute(ringColors, 3));
    const ringMaterial = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending });
    const ringParticles = new THREE.Points(ringGeometry, ringMaterial);
    auraGroup.add(ringParticles);

    const torusMat = new THREE.MeshStandardMaterial({ color: 0x88aaff, emissive: 0x2266aa, roughness: 0.3, metalness: 0.9 });
    const torusRing = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.045, 64, 500), torusMat);
    auraGroup.add(torusRing);

    const torusMat2 = new THREE.MeshStandardMaterial({ color: 0xffaa08, emissive: 0x442200, roughness: 0.5, metalness: 0.7 });
    const torusRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.03, 64, 500), torusMat2);
    auraGroup.add(torusRing2);

    const cloudParticleCount = isMini ? 300 : 800;
    const cloudGeo = new THREE.BufferGeometry();
    const cloudPositions = new Float32Array(cloudParticleCount * 3);
    for (let e = 0; e < cloudParticleCount; e++) {
      cloudPositions[3 * e] = 5 * (Math.random() - 0.5);
      cloudPositions[3 * e + 1] = 3 * (Math.random() - 0.5);
      cloudPositions[3 * e + 2] = 4 * (Math.random() - 0.5) - 1;
    }
    cloudGeo.setAttribute("position", new THREE.BufferAttribute(cloudPositions, 3));
    const cloudMat = new THREE.PointsMaterial({ color: 0x77aaff, size: 0.025, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
    const cloudPoints = new THREE.Points(cloudGeo, cloudMat);
    auraGroup.add(cloudPoints);

    const gridHelper = new THREE.GridHelper(12, 24, 0x88aaff, 0x335588);
    gridHelper.position.y = -1.8;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    let time = 0;

    const animate = () => {
      if (!isMounted) return;
      reqId = requestAnimationFrame(animate);

      const s = settingsRef.current;
      const speedScale = s?.geometricAuraSpeed ?? 1;
      const auraScale = s?.geometricAuraScale ?? 1;
      const drawCount = s?.geometricAuraStarCount ?? 800;

      coreMesh.scale.setScalar(auraScale);
      wireframeIco.scale.setScalar(auraScale * 1.08);

      let coreColor, wireColor, starColor, innerRingColor, outerRingColor, gasColor, gridColor;

      if (s?.geometricAuraShape === 'heart') {
        coreColor = new THREE.Color(0xffffff);
        wireColor = new THREE.Color(0xff2233);
        starColor = new THREE.Color(0xffaadd);
        innerRingColor = new THREE.Color(0x2255ff);
        outerRingColor = new THREE.Color(0x991122);
        gasColor = new THREE.Color(0xff1133);
        gridColor = new THREE.Color(0x221133);
      } else if (s?.geometricAuraRainbowMode) {
        const rainbowSpeed = s?.geometricAuraRainbowSpeed ?? 1.0;
        const baseHue = (time * 0.04 * rainbowSpeed) % 1.0;
        
        coreColor = new THREE.Color().setHSL(baseHue, 0.95, 0.5);
        wireColor = new THREE.Color().setHSL((baseHue + 0.05) % 1.0, 1.0, 0.7);
        starColor = new THREE.Color().setHSL((baseHue + 0.1) % 1.0, 0.5, 0.9);
        innerRingColor = new THREE.Color().setHSL((baseHue - 0.08 + 1.0) % 1.0, 0.9, 0.5);
        outerRingColor = new THREE.Color().setHSL((baseHue + 0.5) % 1.0, 1.0, 0.65);
        gasColor = new THREE.Color().setHSL((baseHue + 0.15) % 1.0, 0.8, 0.65);
        gridColor = new THREE.Color().setHSL(baseHue, 0.8, 0.18);
      } else if (s?.geometricAuraSmartColorEnabled) {
        const derived = deriveSmartColors(s.geometricAuraBaseColor || '#66ccff');
        coreColor = derived.core;
        wireColor = derived.wire;
        starColor = derived.stars;
        innerRingColor = derived.innerRing;
        outerRingColor = derived.outerRing;
        gasColor = derived.gas;
        gridColor = derived.grid;
      } else {
        coreColor = s?.geometricAuraCoreColor ? new THREE.Color(s.geometricAuraCoreColor) : null;
        wireColor = s?.geometricAuraWireColor ? new THREE.Color(s.geometricAuraWireColor) : null;
        starColor = s?.geometricAuraStarColor ? new THREE.Color(s.geometricAuraStarColor) : null;
        innerRingColor = s?.geometricAuraInnerRingColor ? new THREE.Color(s.geometricAuraInnerRingColor) : null;
        outerRingColor = s?.geometricAuraOuterRingColor ? new THREE.Color(s.geometricAuraOuterRingColor) : null;
        gasColor = s?.geometricAuraGasColor ? new THREE.Color(s.geometricAuraGasColor) : null;
        gridColor = s?.geometricAuraGridColor ? new THREE.Color(s.geometricAuraGridColor) : null;
      }

      if (coreColor) {
        materialMain.color.copy(coreColor);
        colorLight.color.copy(coreColor);
        backLight.color.copy(coreColor).addScalar(0.1);
      }
      if (wireColor) wireframeMat.color.copy(wireColor);
      if (starColor) starMaterial.color.copy(starColor);
      if (innerRingColor) {
        torusMat.color.copy(innerRingColor);
        torusMat.emissive.copy(innerRingColor).multiplyScalar(0.35);
        ringMaterial.color.copy(innerRingColor);
      }
      if (outerRingColor) {
        torusMat2.color.copy(outerRingColor);
        torusMat2.emissive.copy(outerRingColor).multiplyScalar(0.25);
        fillLight.color.copy(outerRingColor);
      }
      if (gasColor) cloudMat.color.copy(gasColor);

      wireframeMat.opacity = s?.geometricAuraWireOpacity ?? 0.25;
      bloomPass.strength = s?.geometricAuraBloomStrength ?? 0.8;
      gridHelper.visible = s?.geometricAuraGridVisible ?? true;
      if (gridColor) {
        (gridHelper.material as any).color.copy(gridColor);
      } else if (s?.geometricAuraGridColor) {
        (gridHelper.material as any).color.set(s.geometricAuraGridColor);
      }

      starGeometry.setDrawRange(0, drawCount);

      time += 0.012 * speedScale;

      coreMesh.rotation.y = 0.25 * time;
      coreMesh.rotation.x = 0.2 * Math.sin(0.37 * time);
      coreMesh.rotation.z = 0.15 * Math.cos(0.23 * time);
      
      wireframeIco.rotation.copy(coreMesh.rotation);
      
      ringParticles.rotation.y = 0.35 * time;
      ringParticles.rotation.x = 0.2 * Math.sin(0.28 * time);
      
      torusRing.rotation.x = Math.PI / 2;
      torusRing.rotation.z = 0.5 * time;
      
      torusRing2.rotation.x = Math.PI / 2 + 0.3;
      torusRing2.rotation.z = 0.65 * time;

      const e = (0.2 * time) % (2 * Math.PI);
      colorLight.color.setHSL(0.55 + 0.1 * Math.sin(e), 1, 0.6);
      
      stars.rotation.y += 0.0005;
      stars.rotation.x += 0.0003;
      
      cloudPoints.rotation.y = 0.05 * time;
      cloudPoints.rotation.x = 0.1 * Math.sin(0.1 * time);
      
      // Interpolate center positions smoothly (Heads-Up Display integration)
      auraGroup.position.x = THREE.MathUtils.lerp(auraGroup.position.x, coordsRef.current.x, 0.07);
      auraGroup.position.y = THREE.MathUtils.lerp(auraGroup.position.y, coordsRef.current.y, 0.07);
      auraGroup.position.z = THREE.MathUtils.lerp(auraGroup.position.z, coordsRef.current.z, 0.07);

      controls.target.copy(auraGroup.position);
      controls.autoRotate = autoRotateRef.current;
      controls.autoRotateSpeed = 1.2 * rotateSpeedRef.current;

      controls.update();
      effectComposer.render();
    };

    animate();

    const handleResize = () => {
      if (!isMounted) return;
      const width = isMini && containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
      const height = isMini && containerRef.current ? containerRef.current.clientHeight : window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const pixelRatio = Math.min(window.devicePixelRatio, isMini ? 1.2 : 2);
      renderer.setSize(width, height);
      renderer.setPixelRatio(pixelRatio);
      effectComposer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      
      // Cleanup
      scene.clear();
      renderer.dispose();
      effectComposer.dispose();
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [performanceMode, settings?.geometricAuraShape, isMini]);

  if (performanceMode) return null;

  return (
    <div 
      className={isMini ? "w-full h-[150px] relative rounded-xl border border-white/5 bg-slate-950/20 overflow-hidden" : "fixed inset-0 z-[-1] overflow-hidden bg-black select-none pointer-events-none"}
    >
      <div ref={containerRef} className="w-full h-full absolute inset-0 pointer-events-auto touch-none" />
    </div>
  );
};

interface GeometricAuraHUDProps {
  customization: UICustomization;
  setUICustomization: (config: UICustomization) => void;
  baseColor?: string;
}

export const GeometricAuraHUD: React.FC<GeometricAuraHUDProps> = ({ customization, setUICustomization, baseColor = '#00e1ff' }) => {
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
    <div 
      className="w-full bg-slate-950/40 border rounded-2xl p-4 shadow-lg text-slate-200 font-sans my-1 space-y-4"
      style={{ borderColor: `${baseColor}24` }}
    >
      {/* HUD Radar Pad */}
      <div>
        <div className="flex items-center justify-between text-[10px] mb-1.5 px-0.5 text-slate-400 font-extrabold uppercase tracking-widest">
          <span>AURA POSITION LOCATOR (X / Y)</span>
          <span className="font-mono font-black animate-pulse" style={{ color: baseColor }}>
            ({posX.toFixed(1)}, {posY.toFixed(1)})
          </span>
        </div>
        
        <div 
          ref={padRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative h-28 w-full bg-black/80 border rounded-xl cursor-crosshair overflow-hidden flex items-center justify-center select-none"
          style={{ touchAction: 'none', borderColor: `${baseColor}33` }}
        >
          {/* Neon Grid overlay lines */}
          <div className="absolute w-full h-[1px]" style={{ backgroundColor: `${baseColor}15` }} />
          <div className="absolute h-full w-[1px]" style={{ backgroundColor: `${baseColor}15` }} />
          <div className="absolute inset-x-0 top-1/4 h-[1px]" style={{ backgroundColor: `${baseColor}08` }} />
          <div className="absolute inset-x-0 bottom-1/4 h-[1px]" style={{ backgroundColor: `${baseColor}08` }} />
          <div className="absolute inset-y-0 left-1/4 w-[1px]" style={{ backgroundColor: `${baseColor}08` }} />
          <div className="absolute inset-y-0 right-1/4 w-[1px]" style={{ backgroundColor: `${baseColor}08` }} />
          
          <div className="absolute inset-0 rounded-xl pointer-events-none border" style={{ borderColor: `${baseColor}0c` }} />
          
          {/* Target Pointer */}
          <div 
            className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 flex items-center justify-center transition-all duration-75"
            style={{
              left: `${((posX + 7) / 14) * 100}%`,
              top: `${(1 - (posY + 5) / 10) * 100}%`,
              borderColor: baseColor,
              backgroundColor: `${baseColor}30`,
              boxShadow: `0 0 12px ${baseColor}aa`
            }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="space-y-3">
        {/* Lateral */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1 px-0.5 text-slate-400 font-bold uppercase">
            <span>X-AXIS (Lateral translation)</span>
            <span className="font-mono font-black" style={{ color: baseColor }}>{posX.toFixed(1)}</span>
          </div>
          <input 
            type="range"
            min="-7"
            max="7"
            step="0.1"
            value={posX}
            onChange={(e) => updateX(parseFloat(e.target.value))}
            className="w-full bg-neutral-800 rounded-lg h-1 appearance-none cursor-pointer"
            style={{ accentColor: baseColor }}
          />
        </div>

        {/* Height */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1 px-0.5 text-slate-400 font-bold uppercase">
            <span>Y-AXIS (Vertical translation)</span>
            <span className="font-mono font-black" style={{ color: baseColor }}>{posY.toFixed(1)}</span>
          </div>
          <input 
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={posY}
            onChange={(e) => updateY(parseFloat(e.target.value))}
            className="w-full bg-neutral-800 rounded-lg h-1 appearance-none cursor-pointer"
            style={{ accentColor: baseColor }}
          />
        </div>

        {/* Depth */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1 px-0.5 text-slate-400 font-bold uppercase">
            <span>Z-AXIS (Camera depth perspective)</span>
            <span className="font-mono font-black" style={{ color: baseColor }}>{posZ.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => updateZ(Math.max(-6, posZ - 0.5))}
              className="p-1 rounded bg-black/60 border text-xs hover:bg-white/5 cursor-pointer"
              style={{ borderColor: `${baseColor}40`, color: baseColor }}
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
              className="flex-1 bg-neutral-800 rounded-lg h-1 appearance-none cursor-pointer"
              style={{ accentColor: baseColor }}
            />
            <button 
              onClick={() => updateZ(Math.min(10, posZ + 0.5))}
              className="p-1 rounded bg-black/60 border text-xs hover:bg-white/5 cursor-pointer"
              style={{ borderColor: `${baseColor}40`, color: baseColor }}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Orbit Configuration */}
      <div className="border-t border-white/5 pt-3 flex flex-col gap-2.5">
        <div className="relative flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
          <span>Holographic Spin Rotation</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoRotate} 
              onChange={(e) => updateAutoRotate(e.target.checked)}
              className="sr-only peer" 
            />
            <div 
              className="w-8 h-4 bg-black border rounded-full peer peer-checked:bg-white/10"
              style={{ 
                borderColor: `${baseColor}40`,
              }}
            />
            <span 
              className="absolute left-1 top-[3px] h-2.5 w-2.5 rounded-full transition-transform duration-200 cursor-pointer pointer-events-none" 
              style={{ 
                backgroundColor: baseColor,
                transform: `translateX(${autoRotate ? '16px' : '0px'})`,
              }} 
            />
          </label>
        </div>
        
        {autoRotate && (
          <div>
            <div className="flex items-center justify-between text-[10px] mb-1 text-slate-400 font-bold uppercase">
              <span>Holographic sweep speed</span>
              <span className="font-mono font-black" style={{ color: baseColor }}>{(rotateSpeed * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={rotateSpeed}
              onChange={(e) => updateRotateSpeed(parseFloat(e.target.value))}
              className="w-full bg-neutral-800 rounded-lg h-1 appearance-none cursor-pointer"
              style={{ accentColor: baseColor }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

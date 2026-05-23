import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FluidBackgroundProps {
  accentColor: string;
  isHome?: boolean;
  borderThickness?: number;
  animationSpeed?: number;
  blobCount?: number;
}

const noiseSnippet = `
// GLSL Simplex Noise function (Ashima Arts)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const shaders: Record<string, string> = {
  'fluid-blue': `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;

${noiseSnippet}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.y, uResolution.x);
  
  float t = uTime * 0.2;
  vec2 m = uMouse - 0.5;
  uv -= m * 0.15;
  
  vec2 p = uv * 1.5;
  float n1 = snoise(p + vec2(t * 0.3, t * 0.4));
  float n2 = snoise(p * 2.0 - vec2(t * 0.2, t * 0.1) + n1);
  float n3 = snoise(p * 3.5 + vec2(-t * 0.5, t * 0.2) + n2);
  
  float flow = smoothstep(-0.5, 0.5, n1 * 0.5 + n2 * 0.3 + n3 * 0.2);
  
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  
  float shape = abs(sin(angle * 2.0 + n3 * 1.0 + t * 0.5));
  float d = radius - (0.5 + 0.3 * shape + 0.2 * n1);
  
  float core = exp(-abs(d) * 8.0);
  float glow = exp(-abs(d) * 3.0);
  
  vec3 bg = vec3(0.01, 0.02, 0.05);
  vec3 color1 = uColor1;
  vec3 color2 = uColor2;
  vec3 colorLight = mix(color1, vec3(1.0), 0.7);
  
  vec3 col = bg;
  col = mix(col, color2 * 0.4, flow);
  col = mix(col, color1 * 0.4, smoothstep(0.3, 0.7, n2));
  
  vec3 primary = mix(color1, color2, sin(angle * 3.0 + t) * 0.5 + 0.5);
  col += primary * glow * 1.5;
  col += colorLight * core * 1.8;
  
  float star = smoothstep(0.85, 1.0, snoise(uv * 25.0 - t * 2.0));
  col += colorLight * star * 1.5;

  gl_FragColor = vec4(col, 1.0);
}
`,
  'fluid-neon': `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;

${noiseSnippet}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.y, uResolution.x);
  
  float t = uTime * 0.2;
  vec2 m = uMouse - 0.5;
  uv -= m * 0.15;
  
  vec2 p = uv * 2.0;
  float n1 = snoise(p + vec2(t, -t));
  float n2 = snoise(p * 2.0 + vec2(-t, t) + n1);
  float n3 = snoise(p * 4.0 + vec2(t * 0.5, t * 0.5) + n2);
  
  float flow = smoothstep(-0.5, 0.5, n1 * 0.4 + n2 * 0.4 + n3 * 0.2);
  
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  
  float shape = abs(sin(angle * 3.0 + n2 * 2.0 - t));
  float d = radius - (0.4 + 0.3 * shape + 0.2 * n1);
  
  float core = exp(-abs(d) * 10.0);
  float glow = exp(-abs(d) * 4.0);
  
  vec3 bg = vec3(0.02, 0.0, 0.03);
  vec3 neonPink = uColor1;
  vec3 cyan = uColor2;
  vec3 coreWhite = mix(neonPink, vec3(1.0), 0.8);
  
  vec3 col = bg;
  col = mix(col, neonPink * 0.3, flow);
  col = mix(col, cyan * 0.3, smoothstep(0.4, 0.6, n3));
  
  vec3 primary = mix(neonPink, cyan, sin(angle * 4.0 + t*2.0) * 0.5 + 0.5);
  col += primary * glow * 1.8;
  col += coreWhite * core * 2.0;
  
  float star = smoothstep(0.85, 1.0, snoise(uv * 30.0 + t));
  col += cyan * star * 1.5 + neonPink * smoothstep(0.85, 1.0, snoise(uv * 20.0 - t)) * 1.5;

  gl_FragColor = vec4(col, 1.0);
}
`,
  'fluid-dark': `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;

${noiseSnippet}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.y, uResolution.x);
  
  float t = uTime * 0.2;
  vec2 m = uMouse - 0.5;
  uv -= m * 0.15;
  
  vec2 p = uv * 1.2;
  float n1 = snoise(p + vec2(t * 0.1, t * 0.15));
  float n2 = snoise(p * 1.5 - vec2(t * 0.1, t * 0.05) + n1);
  float n3 = snoise(p * 2.0 + vec2(-t * 0.15, t * 0.1) + n2);
  
  float flow = smoothstep(-0.6, 0.6, n1 * 0.6 + n2 * 0.3 + n3 * 0.1);
  
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  
  float shape = snoise(uv * 2.0 + t * 0.2 + n2); // fluid blobby core
  float d = radius - (0.4 + 0.3 * shape);
  
  float core = exp(-abs(d) * 5.0);
  float glow = exp(-abs(d) * 2.0);
  
  vec3 bg = vec3(0.01, 0.0, 0.03);
  vec3 darkPurple = uColor1;
  vec3 darkBlue = uColor2;
  vec3 coreGlow = mix(darkPurple, vec3(1.0), 0.5);
  
  vec3 col = bg;
  col = mix(col, darkBlue * 0.6, flow);
  col = mix(col, darkPurple * 0.5, smoothstep(0.2, 0.8, n2));
  
  vec3 primary = mix(darkPurple, coreGlow, sin(angle * 2.0 - t * 0.5) * 0.5 + 0.5);
  col += primary * glow * 1.5;
  col += coreGlow * core * 1.2;
  
  float particle = smoothstep(0.7, 1.0, snoise(uv * 15.0 - t * 0.5));
  col -= darkPurple * particle * 0.5; // dark holes

  gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
}
`,
  'fluid-gold': `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;

${noiseSnippet}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.y, uResolution.x);
  
  float t = uTime * 0.2;
  vec2 m = uMouse - 0.5;
  uv -= m * 0.15;
  
  vec2 p = uv * 1.5;
  float n1 = snoise(p + vec2(t * 0.4, -t * 0.2));
  float n2 = snoise(p * 2.5 + vec2(-t * 0.2, t * 0.3) + n1);
  float n3 = snoise(p * 4.0 + vec2(t * 0.5, t * 0.1) + n2);
  
  float flow = smoothstep(-0.5, 0.5, n1 * 0.5 + n2 * 0.3 + n3 * 0.2);
  
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  
  float shape = abs(sin(angle * 2.5 + n2 * 1.5 + t * 0.5));
  float d = radius - (0.5 + 0.3 * shape + 0.2 * n1);
  
  float core = exp(-abs(d) * 8.0);
  float glow = exp(-abs(d) * 3.0);
  
  vec3 bg = vec3(0.04, 0.02, 0.005);
  vec3 gold1 = uColor1;
  vec3 gold2 = uColor2;
  vec3 goldLight = mix(gold1, vec3(1.0), 0.7);
  
  vec3 col = bg;
  col = mix(col, gold2 * 0.5, flow);
  col = mix(col, gold1 * 0.3, smoothstep(0.3, 0.7, n2));
  
  vec3 primary = mix(gold1, gold2, sin(angle * 3.0 - t * 2.0) * 0.5 + 0.5);
  col += primary * glow * 1.5;
  col += goldLight * core * 1.8;
  
  float ember = smoothstep(0.8, 1.0, snoise(uv * 20.0 - t * 4.0));
  col += goldLight * ember * 2.0;

  gl_FragColor = vec4(col, 1.0);
}
`,
  'fluid-emerald': `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;

${noiseSnippet}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.y, uResolution.x);
  
  float t = uTime * 0.2;
  vec2 m = uMouse - 0.5;
  uv -= m * 0.15;
  
  vec2 p = uv * 2.5;
  float n1 = snoise(p + vec2(t * 0.2, t * 0.5));
  float n2 = snoise(p * 2.0 - vec2(t * 0.4, 0.0) + n1);
  float n3 = snoise(p * 3.0 + vec2(0.0, -t * 0.6) + n2);
  
  float flow = smoothstep(-0.3, 0.7, n1 * 0.4 + n2 * 0.4 + n3 * 0.2);
  
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  
  float shape = abs(cos(angle * 4.0 + n3 * 2.0 + t));
  float d = radius - (0.4 + 0.2 * shape + 0.3 * n2);
  
  float core = exp(-abs(d) * 9.0);
  float glow = exp(-abs(d) * 3.5);
  
  vec3 bg = vec3(0.01, 0.03, 0.01);
  vec3 green1 = uColor1;
  vec3 green2 = uColor2;
  vec3 coreWhite = mix(green1, vec3(1.0), 0.7);
  
  vec3 col = bg;
  col = mix(col, green1 * 0.3, flow);
  col = mix(col, green2 * 0.4, smoothstep(0.3, 0.8, n3));
  
  vec3 primary = mix(green1, green2, sin(angle * 5.0 - t * 1.5) * 0.5 + 0.5);
  col += primary * glow * 1.4;
  col += coreWhite * core * 1.6;
  
  float bubble = smoothstep(0.8, 1.0, snoise(uv * 12.0 + t * 1.5));
  col += green2 * bubble * 1.5;

  gl_FragColor = vec4(col, 1.0);
}
`,
  'fluid-crimson': `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;

${noiseSnippet}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.y, uResolution.x);
  
  float t = uTime * 0.2;
  vec2 m = uMouse - 0.5;
  uv -= m * 0.15;
  
  vec2 p = uv * 1.8;
  float pt = t * 0.3 + sin(t * 2.0) * 0.2; 
  float n1 = snoise(p + vec2(0.0, pt * 0.8));
  float n2 = snoise(p * 1.5 + vec2(pt * 0.5, n1));
  float n3 = snoise(p * 3.0 + vec2(-pt * 0.4, -pt * 0.5) + n2);
  
  float flow = smoothstep(-0.6, 0.4, n1 * 0.5 + n2 * 0.4 + n3 * 0.1);
  
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  
  float shape = abs(sin(angle * 2.0 + n1 * 1.5));
  float d = radius - (0.45 + 0.25 * shape + 0.2 * n2);
  
  float core = exp(-abs(d) * 6.0);
  float glow = exp(-abs(d) * 2.5);
  
  vec3 bg = vec3(0.03, 0.0, 0.01);
  vec3 red1 = uColor1;
  vec3 red2 = uColor2;
  vec3 darkBlood = mix(red1, vec3(0.0), 0.5);
  
  vec3 col = bg;
  col = mix(col, darkBlood, flow * 0.8);
  col = mix(col, red1 * 0.5, smoothstep(0.2, 0.6, n2));
  
  vec3 primary = mix(red1, red2, sin(angle * 3.0 + pt * 3.0) * 0.5 + 0.5);
  col += primary * glow * 1.6;
  col += mix(vec3(1.0, 0.8, 0.8), red2, 0.5) * core * 1.5;
  
  float corp = smoothstep(0.85, 1.0, snoise(uv * 18.0 + vec2(0.0, pt * 2.0)));
  col += red1 * corp * 1.2;

  gl_FragColor = vec4(col, 1.0);
}
`,
  'fluid-violet': `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;

${noiseSnippet}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.y, uResolution.x);
  
  float t = uTime * 0.2;
  vec2 m = uMouse - 0.5;
  uv -= m * 0.15;
  
  vec2 p = uv * 2.2;
  float n1 = snoise(p + vec2(cos(t*0.5), sin(t*0.5)) * 0.5);
  float n2 = snoise(p * 2.0 + vec2(-sin(t*0.3), cos(t*0.3)) * 0.4 + n1);
  float n3 = snoise(p * 4.0 + vec2(t * 0.2, t * 0.3) + n2);
  
  float flow = smoothstep(-0.4, 0.6, n1 * 0.4 + n2 * 0.4 + n3 * 0.2);
  
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  
  float spiral = angle * 2.0 + radius * 5.0 - t * 2.0;
  float shape = abs(sin(spiral + n2 * 1.0));
  float d = radius - (0.5 + 0.15 * shape + 0.2 * n1);
  
  float core = exp(-abs(d) * 8.0);
  float glow = exp(-abs(d) * 3.5);
  
  vec3 bg = vec3(0.02, 0.0, 0.05);
  vec3 purple1 = uColor1;
  vec3 purple2 = uColor2;
  vec3 coreLight = mix(purple1, vec3(1.0), 0.7);
  
  vec3 col = bg;
  col = mix(col, purple1 * 0.4, flow);
  col = mix(col, purple2 * 0.5, smoothstep(0.3, 0.7, n3));
  
  vec3 primary = mix(purple1, purple2, sin(spiral * 0.5) * 0.5 + 0.5);
  col += primary * glow * 1.7;
  col += coreLight * core * 2.0;
  
  float spark = smoothstep(0.85, 1.0, snoise(uv * 25.0 + t));
  col += vec3(1.0, 0.5, 1.0) * spark * 1.5;

  gl_FragColor = vec4(col, 1.0);
}
`
};

export const FluidBackground: React.FC<FluidBackgroundProps> = ({ accentColor, isHome, borderThickness, animationSpeed, blobCount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const fragmentShader = shaders[accentColor] || shaders['fluid-blue'];

    const material = new THREE.ShaderMaterial({
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio) },
        uAnimationSpeed: { value: animationSpeed || 1.0 },
        uColor1: { value: new THREE.Color() },
        uColor2: { value: new THREE.Color() },
      },
      depthTest: false,
    });

    const updateColors = () => {
      let c1 = new THREE.Color('#00ffff');
      let c2 = new THREE.Color('#0055ff');
      if (accentColor === 'fluid-neon') {
          c1.set('#ff00ff');
          c2.set('#00ffff');
      } else if (accentColor === 'fluid-dark') {
          c1.set('#9d00ff');
          c2.set('#0022ff');
      } else if (accentColor === 'fluid-gold') {
          c1.set('#ffaa00');
          c2.set('#ffcc00');
      } else if (accentColor === 'fluid-emerald') {
          c1.set('#00ff88');
          c2.set('#10b981');
      } else if (accentColor === 'fluid-crimson') {
          c1.set('#ff0000');
          c2.set('#ef4444');
      } else if (accentColor === 'fluid-violet') {
          c1.set('#8a2be2');
          c2.set('#4b0082');
      }
      material.uniforms.uColor1.value = c1;
      material.uniforms.uColor2.value = c2;
    };
    updateColors();

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    let animationId: number;
    let clock = new THREE.Clock();

    const render = () => {
      material.uniforms.uTime.value = clock.getElapsedTime() * (animationSpeed || 1.0);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(render);
    };
    
    render();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      const pr = renderer.getPixelRatio();
      material.uniforms.uResolution.value.set(window.innerWidth * pr, window.innerHeight * pr);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      material.dispose();
    };
  }, [accentColor, animationSpeed]);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 w-full h-full block z-[-2] pointer-events-none" 
      />
      {!isHome && (
        <>
          <div className="fixed inset-0 bg-slate-950/40 z-[-1] pointer-events-none mix-blend-multiply" />
          <div className="fixed inset-0 bg-black/20 z-[-1] pointer-events-none" />
        </>
      )}
    </>
  );
};

const buttonShaders: Record<string, string> = {
  'fluid-blue': `
        void main() {
            vec2 size = vButtonParams.xy;
            float rad = vButtonParams.z;
            float seed = vButtonParams.w;
            
            vec2 margin = vec2(120.0, 120.0);
            vec2 quadSize = size + margin;
            
            vec2 p = (vUv - 0.5) * quadSize;
            vec2 bSize = size * 0.5;
            
            rad = min(rad, min(bSize.x, bSize.y));
            
            float scale = clamp(min(size.x, size.y) / 150.0, 0.4, 1.2);
            float d = sdRoundRect(p, bSize, rad);
            
            float t = uTime * 2.0 + seed * 100.0;
            float angle = atan(p.y, p.x);
            
            // Complex waves along the border simulating water ripples
            float wave1 = sin(angle * 6.0 + t * 1.5) * (1.5 * scale);
            float wave2 = sin(angle * 12.0 - t * 0.8) * (0.8 * scale);
            float noiseWave = snoise(p * 0.02 + vec2(t * 0.5, seed)) * (2.5 * scale);
            d += wave1 + wave2 + noiseWave;
            
            // Multiple water droplets forming and falling from the bottom
            float dropletAccum = 0.0;
            for(int i = 0; i < 4; i++) {
                float dropSeed = seed + float(i) * 12.34;
                float localTime = uTime * 1.2 + dropSeed;
                float cycle = floor(localTime / 2.5);
                float phase = fract(localTime / 2.5);
                
                // Droplets only form on the bottom half
                float dropX = (random(vec2(cycle, dropSeed)) - 0.5) * (size.x - rad * 2.0);
                float startY = -bSize.y + rad; 
                
                // Wait for the crest of the wave to form the droplet
                // Start attached, stretch, break into string, then fall as sphere
                float dropY = startY;
                float dropRad = mix(1.0, 5.0, min(phase / 0.15, 1.0)) * scale;
                float distToStart = 0.0;
                
                if (phase > 0.15) {
                    float fallPhase = (phase - 0.15) / 0.85;
                    // Accelerating fall
                    distToStart = fallPhase * fallPhase * 150.0 * scale;
                    dropY -= distToStart;
                    
                    // Shape morphs from elongated to spherical
                    // Wobble as it falls
                    dropX += sin(fallPhase * 10.0 + dropSeed) * 2.0 * scale; 
                }
                
                vec2 dropPos = vec2(dropX, dropY);
                float dDrop = length(p - dropPos) - dropRad;
                
                // Calculate stretch connecting droplet to surface (snap effect)
                if (phase > 0.15 && phase < 0.4) {
                    float stretchFactor = (phase - 0.15) / 0.25;
                    // A line connecting the drop to the start
                    vec2 pa = p - vec2(dropX, startY);
                    vec2 ba = vec2(0.0, -distToStart);
                    float h = clamp(dot(pa, ba)/(dot(ba, ba) + 0.001), 0.0, 1.0);
                    float dLine = length(pa - ba * h) - (2.0 * scale * (1.0 - stretchFactor)); 
                    // merge line into drop
                    dDrop = smin(dDrop, dLine, 5.0 * scale * (1.0 - stretchFactor));
                }
                
                d = smin(d, dDrop, mix(6.0, 1.0, clamp((phase-0.15)/0.25, 0.0, 1.0)) * scale);
                dropletAccum += exp(-abs(dDrop) * (1.0/scale)) * 0.5;
            }
            
            float currentThickness = 1.6 * scale;
            if (vIsQuestion < 0.5) {
                currentThickness = uGlobalBorderThickness * (scale * 0.6); 
            }
            float borderD = abs(d) - currentThickness;
            
            float alpha = 1.0 - smoothstep(0.0, 2.0 * scale, borderD);
            float glow = exp(-abs(d) * (0.2 / scale)) * 1.2 * scale;
            
            // Water base color and surface reflection
            float surfaceLight = smoothstep(0.0, 1.5, noiseWave) * 1.5;
            vec3 mixColor = mix(uColor1, uColor2, sin(angle * 2.0 + t * 0.5) * 0.5 + 0.5);
            // Caustic reflections
            mixColor += vec3(0.5, 0.8, 1.0) * surfaceLight * 0.6;
            mixColor += vec3(1.0, 1.0, 1.0) * dropletAccum;
            
            float finalAlpha = clamp(alpha + glow, 0.0, 1.0);
            if(finalAlpha < 0.005) discard;
            
            float fillAlpha = (1.0 - smoothstep(0.0, 6.0 * scale, d)) * 0.18;
            float outA = clamp(finalAlpha + fillAlpha + dropletAccum*0.2, 0.0, 1.0);
            gl_FragColor = vec4(mixColor * outA, outA);
        }
  `,
  'fluid-neon': `
        void main() {
            vec2 size = vButtonParams.xy;
            float rad = vButtonParams.z;
            float seed = vButtonParams.w;
            
            vec2 margin = vec2(150.0, 150.0);
            vec2 quadSize = size + margin;
            vec2 p = (vUv - 0.5) * quadSize;
            vec2 bSize = size * 0.5;
            
            rad = min(rad, min(bSize.x, bSize.y));
            float scale = clamp(min(size.x, size.y) / 150.0, 0.4, 1.2);
            float d = sdRoundRect(p, bSize, rad);
            float t = uTime * 4.0 + seed * 100.0;
            float angle = atan(p.y, p.x);
            
            float pulse = sin(angle * 4.0 - t * 1.5) * 0.5 + 0.5;
            pulse = pow(pulse, 3.0);
            
            float dSegment = 1000.0;
            float boltAlphaAccum = 0.0;
            float boltGlowAccum = 0.0;
            
            float bNoise1 = snoise(p * 0.2 + t * 5.0);
            float bNoise2 = snoise(p * 0.4 - t * 8.0);
            
            // Generate multiple random electricity arcs
            for (float i = 0.0; i < 4.0; i++) {
                float zapTime = uTime * (2.0 + i * 0.5) + seed * 43.0 + i * 14.3;
                float zapCycle = floor(zapTime);
                float zapPhase = fract(zapTime);
                
                // Fast flicker
                float zapActive = smoothstep(0.0, 0.02, zapPhase) * (1.0 - smoothstep(0.1, 0.9, zapPhase)) * step(random(vec2(zapCycle, i)), 0.65);
                
                float targetAngle = (random(vec2(zapCycle, seed + i)) * 2.0 - 1.0) * 3.14159;
                
                float boltLength = zapPhase * (50.0 + random(vec2(zapCycle, i * 2.0)) * 80.0) * scale; 
                vec2 dir = vec2(cos(targetAngle), sin(targetAngle));
                
                // Bolt start point exactly on the rounded border
                float tDist = min(bSize.x / max(abs(dir.x), 0.0001), bSize.y / max(abs(dir.y), 0.0001));
                vec2 start = dir * tDist;
                start -= dir * max(0.0, sdRoundRect(start, bSize, rad));
                start += dir * (random(vec2(zapCycle, i * 3.0)) * 20.0 - 10.0);
                
                vec2 end = start + dir * boltLength;
                
                vec2 pa = p - start;
                vec2 ba = end - start;
                float h = clamp(dot(pa, ba)/(dot(ba, ba) + 0.0001), 0.0, 1.0);
                float distLine = length(pa - ba*h);
                
                // Add jaggedness to lightning
                float jagged = (bNoise1 * (1.0 + sin(i)*0.2) * 6.0 + bNoise2 * 3.0) * scale;
                distLine += jagged * h; // Jaggedness increases towards the end
                
                dSegment = min(dSegment, distLine);
                boltAlphaAccum += (1.0 - smoothstep(0.0, 2.0 * scale, distLine)) * zapActive * 1.5;
                boltGlowAccum += exp(-abs(distLine) * (0.25 / scale)) * 3.5 * scale * zapActive;
            }
            
            if (d < 0.0) dSegment += 50.0; 
            
            float currentThickness = 1.0 * scale;
            if (vIsQuestion < 0.5) {
                currentThickness = uGlobalBorderThickness * (scale * 0.5); 
            }
            float borderD = abs(d) - currentThickness;
            
            float alpha = 1.0 - smoothstep(0.0, 2.5 * scale, borderD);
            float glow = exp(-abs(d) * (0.2 / scale)) * (0.8 + 1.5 * pulse) * scale;
            
            vec3 color = mix(uColor1, uColor2, sin(angle * 3.0 + t * 0.4) * 0.5 + 0.5);
            color += uColor2 * pulse * 2.0;
            
            vec3 finalColor = color + vec3(0.8, 0.9, 1.0) * (boltAlphaAccum + boltGlowAccum * 0.5);
            // Super white hot core for the main border line
            finalColor += vec3(1.0) * exp(-abs(borderD) * (1.5 / scale)) * 1.5 * scale;
            
            float finalAlpha = clamp(alpha + glow + boltAlphaAccum + boltGlowAccum, 0.0, 1.0);
            
            if(finalAlpha < 0.005) discard;
            float fillAlpha = (1.0 - smoothstep(0.0, 3.0 * scale, d)) * 0.1;
            float outA = clamp(finalAlpha + fillAlpha, 0.0, 1.0);
            gl_FragColor = vec4(finalColor * outA, outA);
        }
  `,
  'fluid-dark': `
        void main() {
            vec2 size = vButtonParams.xy;
            float rad = vButtonParams.z;
            float seed = vButtonParams.w;
            
            vec2 margin = vec2(150.0, 150.0);
            vec2 quadSize = size + margin;
            vec2 p = (vUv - 0.5) * quadSize;
            vec2 bSize = size * 0.5;
            
            rad = min(rad, min(bSize.x, bSize.y));
            float scale = clamp(min(size.x, size.y) / 150.0, 0.4, 1.1);
            float d = sdRoundRect(p, bSize, rad);
            float t = uTime * 1.5 + seed * 100.0;
            float angle = atan(p.y, p.x);
            
            // Base shadow aura
            float wave1 = snoise(p * 0.02 + vec2(t * 0.2, seed)) * (4.0 * scale);
            float wave2 = snoise(p * 0.05 - vec2(0.0, t * 0.4)) * (2.0 * scale);
            d += wave1 + wave2;

            float dTendril = 1000.0;
            float tendrilExtAccum = 0.0;
            
            float baseWiggle = snoise(p * 0.06 + vec2(t, -t));
            
            for(float i=0.0; i<3.0; i++) {
                float tTime = uTime * (0.6 + i*0.1) + seed * 7.0 + i*23.1;
                float tCycle = floor(tTime);
                float tPhase = fract(tTime); 
                // Emerge and retract smoothly
                float extension = smoothstep(0.0, 0.2, tPhase) * (1.0 - smoothstep(0.6, 1.0, tPhase));
                tendrilExtAccum += extension;
                
                float tAngle = (random(vec2(tCycle, seed + i)) * 2.0 - 1.0) * 3.14159;
                
                vec2 tDir = vec2(cos(tAngle), sin(tAngle));
                float tDist = min(bSize.x / max(abs(tDir.x), 0.0001), bSize.y / max(abs(tDir.y), 0.0001));
                vec2 tStart = tDir * tDist;
                tStart -= tDir * max(0.0, sdRoundRect(tStart, bSize, rad));
                
                vec2 tEnd = tStart + tDir * (pow(extension, 0.8) * 80.0 * scale);
                
                vec2 pa = p - tStart;
                vec2 ba = tEnd - tStart;
                float h = clamp(dot(pa, ba)/(dot(ba, ba) + 0.001), 0.0, 1.0);
                float dLine = length(pa - ba*h);
                
                // Add extreme winding to the tendril like dark smoky magic
                float wind = sin(h * 20.0 - t * 8.0) * 2.5 * scale * extension;
                
                // Tendrils curl, wiggle, and break apart towards the end
                float noiseWiggle = baseWiggle * (10.0 * scale * extension * h);
                dLine += noiseWiggle + wind * h;
                
                // Taper the tendril
                float tendrilThickness = mix(10.0, 0.1, h * h) * scale;
                dLine -= tendrilThickness;
                
                // Add some detached dark smoky particles around the end
                if (h > 0.8 && extension > 0.1) {
                    float particleD = length(p - tEnd - vec2(sin(t*3.0+i), cos(t*3.0-i))*15.0*scale) - 2.0*scale;
                    dLine = smin(dLine, particleD, 5.0*scale);
                }
                
                if (extension > 0.01) {
                    d = smin(d, dLine, 20.0 * scale);
                }
            }
            
            float currentThickness = 2.0 * scale;
            if (vIsQuestion < 0.5) {
                currentThickness = uGlobalBorderThickness * (scale * 0.7); 
            }
            float borderD = abs(d) - currentThickness;
            
            float alpha = 1.0 - smoothstep(0.0, 4.0 * scale, borderD);
            float glow = exp(-abs(d) * (0.1 / scale)) * 0.8 * scale;
            
            float grad = sin(angle - t * 0.5) * 0.5 + 0.5;
            vec3 color = mix(uColor1, uColor2, grad);
            // Mix in the dark shadowy smoke texture
            float smokeTex = snoise(p*0.03 + t*0.3)*0.5 + 0.5;
            color = mix(color, vec3(0.02, 0.0, 0.08), smokeTex * 0.7);
            
            // Core highlight is menacingly dark
            color -= vec3(1.0) * exp(-abs(borderD)*(0.5 / scale)) * 0.5 * scale;
            color = max(color, vec3(0.0));
            
            float finalAlpha = clamp(alpha + glow, 0.0, 1.0);
            if(finalAlpha < 0.005) discard;
            
            float fillAlpha = (1.0 - smoothstep(0.0, 5.0 * scale, d)) * 0.3;
            float outA = clamp(finalAlpha + fillAlpha, 0.0, 1.0);
            gl_FragColor = vec4(color * outA, outA);
        }
  `,
  'fluid-gold': `
        void main() {
            vec2 size = vButtonParams.xy;
            float rad = vButtonParams.z;
            float seed = vButtonParams.w;
            vec2 margin = vec2(150.0, 150.0);
            vec2 quadSize = size + margin;
            vec2 p = (vUv - 0.5) * quadSize;
            vec2 bSize = size * 0.5;
            rad = min(rad, min(bSize.x, bSize.y));
            float scale = clamp(min(size.x, size.y) / 150.0, 0.4, 1.3);
            float d = sdRoundRect(p, bSize, rad);
            float t = uTime * 1.5 + seed * 100.0;
            
            float angle = atan(p.y, p.x);
            // Core molten metal wave
            float wave = sin(angle * 4.0 + t) * (1.8 * scale) + snoise(p * 0.02 + t*0.5) * (3.5 * scale);
            d += wave;
            
            // Internal ember glow inside the gold
            float emberPhase = snoise(p * 0.08 - t);
            float emberGlow = smoothstep(0.4, 0.9, emberPhase);
            
            // Gold sparks flying out
            float sparkleAccum = 0.0;
            for(float i=0.0; i<4.0; i++) {
                float sparkTime = uTime * (1.5 + i*0.25) + seed * 17.0 + i*13.0;
                float cycle = floor(sparkTime);
                float phase = fract(sparkTime);
                
                float sparkAngle = (random(vec2(cycle, i)) * 2.0 - 1.0) * 3.14159;
                vec2 dir = vec2(cos(sparkAngle), sin(sparkAngle));
                
                float tDist = min(bSize.x / max(abs(dir.x), 0.0001), bSize.y / max(abs(dir.y), 0.0001));
                vec2 startPos = dir * tDist;
                startPos -= dir * max(0.0, sdRoundRect(startPos, bSize, rad));
                
                // Fly out smoothly
                vec2 sparkPos = startPos + dir * (pow(phase, 1.2) * 100.0 * scale);
                // add turbulent wiggle to give fire-like dynamic movement using cheap sin
                sparkPos += vec2(sin(t*3.0 + i*4.0), cos(t*3.0 - i*2.0)) * 25.0 * scale * phase;
                
                float sparkRad = mix(3.0*scale, 0.0, phase);
                float sparkD = length(p - sparkPos) - sparkRad;
                float sGlow = exp(-abs(sparkD) * (1.5 / scale)) * (1.0 - phase) * 3.5;
                
                sparkleAccum += sGlow;
                
                if (phase < 0.2) {
                   // Merge with main shape while birthing
                   d = smin(d, sparkD, 12.0 * scale * (1.0 - phase/0.2));
                }
            }
            
            // Micro sparks on the surface
            float baseSparkle = pow(abs(snoise(p * 0.15 + t * 3.0)), 12.0) * 3.0;
            
            float currentThick = 1.8 * scale;
            if (vIsQuestion < 0.5) {
                currentThick = uGlobalBorderThickness * (scale * 0.6); 
            }
            float borderD = abs(d) - currentThick;
            
            float alpha = 1.0 - smoothstep(0.0, 2.0 * scale, borderD);
            float glow = exp(-abs(d) * (0.15 / scale)) * 1.5 * scale;
            
            float grad = sin(angle * 2.0 - t * 0.8) * 0.5 + 0.5;
            vec3 mixColor = mix(uColor1, uColor2, grad);
            
            // Add ember heat
            mixColor += vec3(1.0, 0.4, 0.0) * emberGlow * 1.5;
            
            // Mix in the sparks
            mixColor += vec3(1.0, 0.9, 0.5) * baseSparkle;
            mixColor += vec3(1.0, 1.0, 0.8) * sparkleAccum;
            
            float finalAlpha = clamp(alpha + glow + sparkleAccum*0.6, 0.0, 1.0);
            if(finalAlpha < 0.005) discard;
            
            float fillAlpha = (1.0 - smoothstep(0.0, 4.0 * scale, d)) * 0.15;
            float outA = clamp(finalAlpha + fillAlpha, 0.0, 1.0);
            gl_FragColor = vec4(mixColor * outA, outA);
        }
  `,
  'fluid-emerald': `
        void main() {
            vec2 size = vButtonParams.xy;
            float rad = vButtonParams.z;
            float seed = vButtonParams.w;
            vec2 margin = vec2(120.0, 120.0);
            vec2 quadSize = size + margin;
            vec2 p = (vUv - 0.5) * quadSize;
            vec2 bSize = size * 0.5;
            rad = min(rad, min(bSize.x, bSize.y));
            float scale = clamp(min(size.x, size.y) / 150.0, 0.4, 1.3);
            float d = sdRoundRect(p, bSize, rad);
            float t = uTime * 2.0 + seed * 20.0;
            
            // Sludgy base
            d += snoise(p * 0.03 - vec2(0.0, t*1.0)) * (4.0 * scale);
            d += pow(snoise(p * 0.06 + vec2(t*0.5, t)), 2.0) * (2.5 * scale); 
            d += snoise(p * 0.1) * (1.0 * scale);
            
            // Multiple acid bubbles floating upwards
            float bubbleAccum = 0.0;
            for(int i = 0; i < 4; i++) {
                float bTime = uTime * (0.8 + float(i)*0.15) + seed*10.0 + float(i)*21.3;
                float bPhase = fract(bTime / 2.5);
                float cycle = floor(bTime / 2.5);
                
                float bRad = mix(3.0, 15.0, random(vec2(cycle, float(i)))) * scale;
                // Pop quickly at the end
                bRad *= sin(pow(bPhase, 0.8) * 3.14); 
                
                float startX = (random(vec2(cycle, float(i)+1.0)) * 2.0 - 1.0) * (bSize.x + 10.0*scale);
                vec2 bubblePos = vec2( 
                    startX + sin(bTime * 3.0 + float(i)) * 20.0 * scale,
                    bSize.y + 20.0*scale - bPhase * (bSize.y * 2.0 + 80.0 * scale)
                );
                
                float dBubble = length(p - bubblePos) - bRad;
                d = smin(d, dBubble, 12.0 * scale);
                
                // Add an inner reflection/glow to the bubbles
                bubbleAccum += (1.0 - smoothstep(0.0, 2.0*scale, abs(dBubble))) * 1.5;
                bubbleAccum += exp(-abs(dBubble) * (0.5 / scale)) * 0.5;
            }
            
            float currentThick = 2.0 * scale;
            if (vIsQuestion < 0.5) {
                currentThick = uGlobalBorderThickness * (scale * 0.7); 
            }
            float borderD = abs(d) - currentThick;
            float alpha = 1.0 - smoothstep(0.0, 3.5 * scale, borderD);
            float glow = exp(-abs(d) * (0.15 / scale)) * 1.5 * scale;
            
            float angle = atan(p.y, p.x);
            float grad = sin(angle * 3.0 + t * 0.8) * 0.5 + 0.5;
            vec3 mixColor = mix(uColor1, uColor2, grad);
            
            // Toxic highlights
            float toxicNoise = snoise(p * 0.15 - t * 2.0);
            mixColor += vec3(0.5, 1.0, 0.2) * smoothstep(0.7, 1.0, toxicNoise) * 2.0;
            mixColor += vec3(0.8, 1.0, 0.5) * bubbleAccum;
            
            float finalAlpha = clamp(alpha + glow + bubbleAccum*0.5, 0.0, 1.0);
            if(finalAlpha < 0.005) discard;
            
            float fillAlpha = (1.0 - smoothstep(0.0, 5.0 * scale, d)) * 0.15;
            float outA = clamp(finalAlpha + fillAlpha, 0.0, 1.0);
            gl_FragColor = vec4(mixColor * outA, outA);
        }
  `,
  'fluid-crimson': `
        void main() {
            vec2 size = vButtonParams.xy;
            float rad = vButtonParams.z;
            float seed = vButtonParams.w;
            
            // Increase margin for more dramatic glow and particle spread
            vec2 margin = vec2(200.0, 200.0);
            vec2 quadSize = size + margin;
            vec2 p = (vUv - 0.5) * quadSize;
            vec2 bSize = size * 0.5;
            
            rad = min(rad, min(bSize.x, bSize.y));
            float scale = clamp(min(size.x, size.y) / 150.0, 0.4, 1.3);
            float d = sdRoundRect(p, bSize, rad);
            float t = uTime * 0.8 + seed * 20.0;
            
            float angle = atan(p.y, p.x);
            
            // Extremely smooth and elongated layers
            float ripple1 = sin(angle * 2.0 - t * 0.9) * (4.0 * scale);
            float ripple2 = sin(angle * 5.0 + t * 1.5) * (2.0 * scale);
            float smoothBlob = snoise(p * 0.02 + vec2(t * 0.3, t * 0.5)) * (6.0 * scale);
            d += ripple1 + ripple2 + smoothBlob;
            
            // Deep undulating veins inside the glow
            float veinNoise = snoise(p * 0.06 - vec2(t * 0.2, t * 0.8));
            float veinD = abs(veinNoise) * 15.0 * scale; 
            
            // Fluid magical flares stretching tangentially
            float flareAccum = 0.0;
            float particleAccum = 0.0;
            
            for(int i = 0; i < 5; i++) {
                float fTime = t * (1.0 + float(i)*0.15) + float(i)*7.3;
                // Move them around slowly
                float fAngle = fTime * (mod(float(i), 2.0) > 0.5 ? 0.8 : -0.8) + float(i);
                
                vec2 fDir = vec2(cos(fAngle), sin(fAngle));
                float tDist = min(bSize.x / max(abs(fDir.x), 0.0001), bSize.y / max(abs(fDir.y), 0.0001));
                
                // Get exact border point
                vec2 fBase = fDir * tDist;
                fBase -= fDir * max(0.0, sdRoundRect(fBase, bSize, rad));
                
                vec2 pa = p - fBase;
                
                // Tangent direction for sweeping flares
                vec2 tDir = vec2(-fDir.y, fDir.x);
                // Sweep flare
                float sweepLen = length(pa - tDir * dot(pa, tDir));
                float sweepWidth = abs(dot(pa, tDir));
                
                // Exponent-based streaky flare - tightened up significantly
                float flareIntensity = exp(-sweepLen * (1.5 / scale) - sweepWidth * (0.8 / scale)) * 2.5;
                flareAccum += flareIntensity;
                
                // Tiny detached magical particles tracing close to the border
                float pTime = fTime * 2.0;
                vec2 particlePos = fBase + tDir * (sin(pTime) * 15.0 * scale) + fDir * (cos(pTime*1.5) * 8.0 * scale);
                float pDist = length(p - particlePos);
                particleAccum += exp(-pDist * (2.0 / scale)) * 2.0;
                
                // Disturb the main border much more closely
                d = smin(d, length(pa) - 1.0*scale, 12.0 * scale);
            }
            
            float currentThick = 2.5 * scale;
            if (vIsQuestion < 0.5) {
                currentThick = uGlobalBorderThickness * (scale * 0.7); 
            }
            float borderD = abs(d) - currentThick;
            
            // Ultra-smooth alpha gradients
            float alpha = 1.0 - smoothstep(0.0, 4.5 * scale, borderD);
            float glow = exp(-abs(d) * (0.12 / scale)) * 2.0 * scale;
            float outerGlow = exp(-abs(d) * (0.04 / scale)) * 0.8 * scale;
            
            float grad = sin(angle * 2.0 + t * 0.5) * 0.5 + 0.5;
            vec3 mixColor = mix(uColor1, uColor2, grad);
            
            // Mix in black/purple deep void energy
            float voidTexture = pow(abs(snoise(p * 0.03 + vec2(-t * 0.6, t * 0.2))), 1.5);
            mixColor = mix(mixColor, vec3(0.05, 0.0, 0.1), voidTexture * 0.8);
            
            // Add prominent dark red structures (veins)
            float veinIntensity = smoothstep(5.0 * scale, 0.0, veinD) * alpha;
            mixColor = mix(mixColor, vec3(0.8, 0.0, 0.2), veinIntensity * 0.7);
            
            // Highlights for the flares and particles
            mixColor += vec3(1.0, 0.15, 0.3) * flareAccum * 0.5;
            mixColor += vec3(1.0, 0.5, 0.8) * particleAccum * 0.8;
            
            // Intense bright core
            mixColor += vec3(1.0, 0.8, 0.9) * exp(-abs(borderD)*(1.8 / scale)) * 2.0 * scale;
            
            float finalAlpha = clamp(alpha + glow + outerGlow + flareAccum * 0.3 + particleAccum * 0.5, 0.0, 1.0);
            if(finalAlpha < 0.005) discard;
            
            float fillAlpha = (1.0 - smoothstep(0.0, 8.0 * scale, d)) * 0.25;
            float outA = clamp(finalAlpha + fillAlpha, 0.0, 1.0);
            gl_FragColor = vec4(mixColor * outA, outA);
        }
  `,
  'fluid-violet': `
        void main() {
            vec2 size = vButtonParams.xy;
            float rad = vButtonParams.z;
            float seed = vButtonParams.w;
            vec2 margin = vec2(140.0, 140.0);
            vec2 quadSize = size + margin;
            vec2 p = (vUv - 0.5) * quadSize;
            vec2 bSize = size * 0.5;
            rad = min(rad, min(bSize.x, bSize.y));
            float scale = clamp(min(size.x, size.y) / 150.0, 0.4, 1.1);
            float d = sdRoundRect(p, bSize, rad);
            float t = uTime * 2.0 + seed * 30.0;
            
            // Plasma-like intense ejections
            float angle = atan(p.y, p.x);
            
            // Extreme noise for plasma flares
            float plasmaNoise = snoise(p * 0.05 + vec2(t*1.5, -t*0.8));
            float plasmaNoise2 = snoise(p * 0.08 - vec2(t*2.0, t*1.2));
            float plasmaNoise3 = snoise(p * 0.12 + vec2(-t, t*2.5));
            
            // Ejections that travel along the perimeter
            float ejectionParams = sin(angle * 5.0 - t * 4.0) + sin(angle * 8.0 + t * 3.0);
            float flares = smoothstep(0.6, 2.0, ejectionParams) * (20.0 * scale);
            
            d += (plasmaNoise * 5.0 + plasmaNoise2 * 3.0 + plasmaNoise3 * 1.5) * scale - flares;
            
            // Detached energetic plasma blobs
            float blobAccumAlpha = 0.0;
            for(int i = 0; i < 3; i++) {
                float pt = t * (0.8 + float(i)*0.15);
                float a = pt * 2.5 + float(i) * 2.3;
                
                vec2 dir = vec2(cos(a), sin(a));
                float tDist = min(bSize.x / max(abs(dir.x), 0.0001), bSize.y / max(abs(dir.y), 0.0001));
                vec2 baseCenter = dir * tDist;
                baseCenter -= dir * max(0.0, sdRoundRect(baseCenter, bSize, rad));
                
                // Traverse around the border with some sine wave perturbation
                float wobble = sin(pt * 5.0 + float(i)) * 15.0 * scale;
                vec2 blobCenter = baseCenter + dir * wobble;
                blobCenter += vec2(sin(pt * 2.0 + float(i)), cos(pt * 1.5 - float(i))) * 25.0 * scale;
                
                float blobRad = (3.0 + sin(pt * 10.0)*1.5) * scale + plasmaNoise2 * 2.0;
                float dPlasmaBlob = length(p - blobCenter) - blobRad;
                
                d = smin(d, dPlasmaBlob, 25.0 * scale);
                blobAccumAlpha += exp(-abs(dPlasmaBlob) * (0.5 / scale)) * 1.5;
            }
            
            float currentThick = 2.0 * scale;
            if (vIsQuestion < 0.5) {
                currentThick = uGlobalBorderThickness * (scale * 0.6); 
            }
            float borderD = abs(d) - currentThick;
            
            float alpha = 1.0 - smoothstep(0.0, 3.5 * scale, borderD);
            // Intense core glow of plasma
            float glow = exp(-abs(d) * (0.3 / scale)) * 2.0 * scale;
            glow += exp(-abs(d) * (0.08 / scale)) * 0.7 * scale; // outer corona
            
            vec3 mixColor = mix(uColor1, uColor2, sin(angle * 2.5 - t * 2.0) * 0.5 + 0.5);
            mixColor += uColor2 * (plasmaNoise * 0.5); 
            
            // White hot core
            mixColor += vec3(1.0, 0.9, 1.0) * exp(-abs(borderD)*(1.2 / scale)) * 1.5 * scale;
            mixColor += vec3(1.0, 0.8, 1.0) * blobAccumAlpha;
            
            float finalAlpha = clamp(alpha + glow + blobAccumAlpha*0.3, 0.0, 1.0);
            if(finalAlpha < 0.005) discard;
            
            float fillAlpha = (1.0 - smoothstep(0.0, 7.0 * scale, d)) * 0.2;
            float outA = clamp(finalAlpha + fillAlpha, 0.0, 1.0);
            gl_FragColor = vec4(mixColor * outA, outA);
        }
  `,
};

export const FluidButtonOverlay: React.FC<FluidBackgroundProps> = ({ accentColor, borderThickness, animationSpeed, blobCount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      0, window.innerWidth,
      window.innerHeight, 0,
      -10, 10
    );
    camera.position.z = 5;

    const MAX_INSTANCES = 150;
    const geometry = new THREE.PlaneGeometry(1, 1);
    
    let c1 = new THREE.Color('#00ffff');
    let c2 = new THREE.Color('#0055ff');
    if (accentColor === 'fluid-neon') {
        c1.set('#ff00ff');
        c2.set('#00ffff');
    } else if (accentColor === 'fluid-dark') {
        c1.set('#9d00ff');
        c2.set('#0022ff');
    } else if (accentColor === 'fluid-gold') {
        c1.set('#ffaa00');
        c2.set('#ffcc00');
    } else if (accentColor === 'fluid-emerald') {
        c1.set('#00ff88');
        c2.set('#10b981');
    } else if (accentColor === 'fluid-crimson') {
        c1.set('#ff0000');
        c2.set('#ef4444');
    } else if (accentColor === 'fluid-violet') {
        c1.set('#8a2be2');
        c2.set('#4b0082');
    }

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uColor1: { value: c1 },
        uColor2: { value: c2 },
        uGlobalBorderThickness: { value: borderThickness ?? 2 },
        uGlobalAnimationSpeed: { value: animationSpeed ?? 1 }
      },
      vertexShader: `
        attribute vec4 aButtonParams;
        attribute float aIsQuestion;
        varying vec4 vButtonParams;
        varying float vIsQuestion;
        varying vec2 vUv;
        void main() {
            vUv = uv;
            vButtonParams = aButtonParams;
            vIsQuestion = aIsQuestion;
            vec4 mvPosition = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uGlobalBorderThickness;
        uniform float uGlobalAnimationSpeed;

        varying vec4 vButtonParams;
        varying float vIsQuestion;
        varying vec2 vUv;

        float random(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        float snoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = random(i + vec2(0.0, 0.0));
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f*f*(3.0-2.0*f);
            return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        float smin(float a, float b, float k) {
            float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
            return mix(b, a, h) - k * h * (1.0 - h);
        }

        float sdRoundRect(vec2 p, vec2 b, float r) {
            vec2 d = abs(p) - b + vec2(r);
            return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
        }
      ` + (buttonShaders[accentColor] || buttonShaders['fluid-blue'])
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, MAX_INSTANCES);
    instancedMesh.frustumCulled = false; 

    const paramsArray = new Float32Array(MAX_INSTANCES * 4);
    const isQuestionArray = new Float32Array(MAX_INSTANCES);
    
    for(let i=0; i<MAX_INSTANCES; i++) {
       paramsArray[i*4 + 3] = Math.random() * 100.0; 
    }
    const paramsAttribute = new THREE.InstancedBufferAttribute(paramsArray, 4);
    const isQuestionAttribute = new THREE.InstancedBufferAttribute(isQuestionArray, 1);
    geometry.setAttribute('aButtonParams', paramsAttribute);
    geometry.setAttribute('aIsQuestion', isQuestionAttribute);

    scene.add(instancedMesh);

    let animationId: number;
    let clock = new THREE.Clock();
    const dummy = new THREE.Object3D();

    const render = () => {
      material.uniforms.uTime.value = clock.getElapsedTime() * (animationSpeed ?? 1.0);

      const elements = document.querySelectorAll('.visual-fluid button:not(.no-fluid), .visual-fluid .btn:not(.no-fluid), .visual-fluid .card, .visual-fluid .glass, .visual-fluid .question-card');
      
      let count = 0;
      for(let i = 0; i < elements.length; i++) {
         if(count >= MAX_INSTANCES) break;
         const el = elements[i];
         const rect = el.getBoundingClientRect();
         
         if (rect.width === 0 || rect.height === 0 || rect.bottom < 0 || rect.top > window.innerHeight) {
             continue;
         }

         const style = window.getComputedStyle(el);
         if(style.opacity === '0' || style.visibility === 'hidden') continue;

         const isQuestion = el.classList.contains('question-card');

         let radius = 20; 
         if(el.classList.contains('card') || el.classList.contains('glass') || isQuestion) {
             radius = 35;
         }

         const marginX = 120.0;
         const marginY = 120.0;
         
         const x = rect.left + rect.width / 2;
         const y = window.innerHeight - (rect.top + rect.height / 2);
         
         dummy.position.set(x, y, 0);
         dummy.scale.set(rect.width + marginX, rect.height + marginY, 1);
         dummy.updateMatrix();
         instancedMesh.setMatrixAt(count, dummy.matrix);
         
         paramsArray[count*4 + 0] = rect.width;
         paramsArray[count*4 + 1] = rect.height;
         paramsArray[count*4 + 2] = radius;

         isQuestionArray[count] = isQuestion ? 1.0 : 0.0;

         count++;
      }
      
      instancedMesh.count = count;
      paramsAttribute.needsUpdate = true;
      isQuestionAttribute.needsUpdate = true;
      instancedMesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(render);
    };
    
    render();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      camera.right = window.innerWidth;
      camera.top = window.innerHeight;
      camera.updateProjectionMatrix();
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      material.dispose();
    };
  }, [accentColor, borderThickness, animationSpeed, blobCount]);

  return (
    <div className="fixed inset-0 w-full h-full z-[100] pointer-events-none" style={{ mixBlendMode: 'screen' }}>
        <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};


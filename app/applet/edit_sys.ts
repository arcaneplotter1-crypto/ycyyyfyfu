import fs from 'fs';

let content = fs.readFileSync('src/components/EmissiveBlackHoleEffects.tsx', 'utf8');

const regex1 = /\/\/ Particle system \(emitted from disintegrated areas\)[\s\S]*?(?=\/\/ Apply Post Processing bloom)/;
const replacement1 = `// Particle system (emitted from disintegrated areas)
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
      vertexShader: \`
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

        \${simplexNoiseGLSL}

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

          float size = uBaseSize * uPixelDensity;
          size = size / (aDist + 1.0);
          gl_PointSize = size / -viewPosition.z;
        }
      \`,
      fragmentShader: \`
        uniform vec3 uColor;
        uniform float uEdge;
        uniform float uTime;
        uniform float uSpeed;
        uniform sampler2D uTexture;
        
        varying float vNoise;
        varying float vAngle;

        void main() {
          float wave = sin(uTime * uSpeed * 0.2);
          float threshold = max(0.0, wave * 0.55 + 0.35);
          float edgeWidth = uEdge * 0.25;

          if( vNoise < threshold ) discard;
          if( vNoise > threshold + edgeWidth ) discard;

          vec2 coord = gl_PointCoord;
          coord = coord - 0.5; // get the coordinate from 0-1 ot -0.5 to 0.5
          coord = coord * mat2(cos(vAngle),sin(vAngle) , -sin(vAngle), cos(vAngle)); // apply the rotation transformaion
          coord = coord +  0.5; // reset the coordinate to 0-1  

          vec4 texture = texture2D(uTexture,coord);
          if (texture.a < 0.01) discard;

          gl_FragColor = vec4(vec3(uColor.xyz * texture.xyz), 1.0);
        }
      \`
    });

    const particles = new THREE.Points(particleGeometry, particlesMaterial);
    scene.add(particles);

    `;

const regex2 = /\/\/ Update dynamic uniform updates from settings reactively via ref checks[\s\S]*?(?=bloomPass\.strength = bloomVal;)/;
const replacement2 = `// Update dynamic uniform updates from settings reactively via ref checks
      const currentSettings = settingsRef.current;
      const speedMult = currentSettings?.emissiveSpeed ?? 1.0;
      const freqVal = currentSettings?.emissiveFrequency ?? 0.25;
      const ampVal = currentSettings?.emissiveAmplitude ?? 16.0;
      const edgeVal = currentSettings?.emissiveEdgeWidth ?? 0.8;
      const bloomVal = currentSettings?.emissiveBloom ?? 8.0;
      const bloomRadiusVal = currentSettings?.emissiveBloomRadius ?? 0.4;
      const latestColorHex = currentSettings?.colors?.[0] || '#4d9bff';

      const updateColor = new THREE.Color(latestColorHex);
      
      const particleVisible = currentSettings?.emissiveParticleVisible !== false;
      const particleBaseSize = currentSettings?.emissiveParticleBaseSize ?? 40;
      const particleSpeedFactor = currentSettings?.emissiveParticleSpeedFactor ?? 0.02;
      const velocityFactorX = currentSettings?.emissiveVelocityFactorX ?? 2.5;
      const velocityFactorY = currentSettings?.emissiveVelocityFactorY ?? 2.0;
      const waveAmplitude = currentSettings?.emissiveWaveAmplitude ?? 0.0;

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

      `;

let newContent = content.replace(regex1, replacement1);
newContent = newContent.replace(regex2, replacement2);

fs.writeFileSync('src/components/EmissiveBlackHoleEffects.tsx', newContent);
console.log('Success');

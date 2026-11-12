import * as THREE from 'three';

export interface HolographicLayers {
  group: THREE.Group;
  skinMesh: THREE.Mesh | null;
  wireframeMesh: THREE.LineSegments | null;
  networkMesh: THREE.LineSegments | null;
  nodesMesh: THREE.Points | null;
  chestCoreGroup: THREE.Group | null;
  auraMesh: THREE.Mesh | null;
  orbitRingsGroup: THREE.Group | null;
  nanitesMesh: THREE.Points | null;
  update: (time: number, delta: number) => void;
  setSkinOpacity: (val: number) => void;
  setNetworkIntensity: (val: number) => void;
  setNodesBrightness: (val: number) => void;
  setFlowSpeed: (val: number) => void;
  setChestCoreRadiance: (val: number) => void;
  setAuraVisible: (val: boolean) => void;
  setScanlineEnabled: (val: boolean) => void;
  setThemeColor: (color: THREE.Color) => void;
}

/**
 * Builds the TECHNEX 2026 Holographic Humanoid entity with layered visual systems:
 * 1. Translucent Holographic Skin (High-precision Fresnel rim glow, contour scanning wave)
 * 2. Cybernetic Polygonal Wireframe Mesh (Direct 3D polygon lattice driven by Network Intensity)
 * 3. Golden Energy Network (Dense organic anatomical neural circuit lines)
 * 4. Glowing Junction Nodes (Cosmic energy star junctions at anatomical intersections)
 * 5. Chest Energy Core (Radiant golden star core with concentric rotating sacred energy rings)
 * 6. Floating Energy Nanites & Dynamic Hologram Waves
 */
export function buildHolographicHumanoid(
  sourceGeometry: THREE.BufferGeometry,
  modelScale: number = 0.0132,
  modelYOffset: number = 0.02
): HolographicLayers {
  const group = new THREE.Group();

  // World-space chest core center (sternum)
  const chestPos = new THREE.Vector3(0.0, 1.613, 0.139);

  // Colors: warm amber, rich gold, radiant white-gold core
  const warmGold = new THREE.Color(0xffb732);
  const radiantCoreGold = new THREE.Color(0xfffae0);

  // =========================================================================
  // LAYER 1: TRANSLUCENT MESH SKIN (Holographic Glass Silhouette Anatomy)
  // =========================================================================
  const skinUniforms = {
    uTime: { value: 0 },
    uSkinOpacity: { value: 0.65 },
    uChestPos: { value: chestPos.clone() },
    uThemeColor: { value: warmGold },
    uCoreColor: { value: radiantCoreGold },
    uScanlineEnabled: { value: 1.0 },
  };

  const skinMaterial = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
    uniforms: skinUniforms,
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewDir;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uSkinOpacity;
      uniform vec3 uChestPos;
      uniform vec3 uThemeColor;
      uniform vec3 uCoreColor;
      uniform float uScanlineEnabled;

      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewDir;
      varying vec2 vUv;

      void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vViewDir);

        // 1. High-Precision Fresnel Muscular Contour Shimmer (Never overpowering golden PBR)
        float fresnel = pow(1.0 - max(0.0, dot(N, V)), 3.2);

        // 2. Smooth Holographic Scanning Wave
        float scanPeriod = fract(uTime * 0.12);
        float scanY = scanPeriod * 2.5 - 0.05;
        float scanWave = smoothstep(0.045, 0.0, abs(vWorldPosition.y - scanY)) * uScanlineEnabled;

        // 3. Composite Translucent Holographic Cyber-Skin Shimmer
        vec3 rimTint = mix(uThemeColor, uCoreColor, fresnel * 0.5);
        vec3 finalColor = rimTint * (fresnel * 0.25 + scanWave * 0.35);

        float alpha = clamp((fresnel * 0.12 + scanWave * 0.30) * uSkinOpacity, 0.0, 0.45);

        gl_FragColor = vec4(finalColor * alpha, clamp(alpha * 2.0, 0.0, 0.85));
      }
    `,
  });

  const skinMesh = new THREE.Mesh(sourceGeometry.clone(), skinMaterial);
  skinMesh.scale.set(modelScale, modelScale, modelScale);
  skinMesh.position.set(0, modelYOffset, 0);
  group.add(skinMesh);

  // =========================================================================
  // LAYER 2: CYBERNETIC POLYGONAL WIREFRAME MESH (Direct 3D Anatomical Lattice)
  // =========================================================================
  const wireframeUniforms = {
    uTime: { value: 0 },
    uNetworkIntensity: { value: 0.6 },
    uFlowSpeed: { value: 1.0 },
    uGoldColor: { value: warmGold },
    uCoreColor: { value: radiantCoreGold },
    uChestPos: { value: chestPos.clone() },
  };

  const wireframeMaterial = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: wireframeUniforms,
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uNetworkIntensity;
      uniform float uFlowSpeed;
      uniform vec3 uGoldColor;
      uniform vec3 uCoreColor;
      uniform vec3 uChestPos;
      varying vec3 vWorldPosition;

      void main() {
        float distChest = length(vWorldPosition - uChestPos);
        // Smooth subtle traveling cybernetic pulse wave along polygon edges
        float wave = sin(distChest * 11.0 - uTime * uFlowSpeed * 3.6);
        float pulse = pow(max(0.0, wave), 5.0);

        // Subtle, delicate lines to prevent blinding overlap (parity with the other 3 forms)
        float baseAlpha = 0.05 * uNetworkIntensity;
        float pulseAlpha = pulse * 0.16 * uNetworkIntensity;
        float totalAlpha = clamp(baseAlpha + pulseAlpha, 0.0, 0.45);

        vec3 col = mix(uGoldColor, uCoreColor, clamp(pulse * 0.6, 0.0, 0.5));
        gl_FragColor = vec4(col * totalAlpha, clamp(totalAlpha * 2.2, 0.0, 0.85));
      }
    `,
  });

  const wireframeGeom = new THREE.WireframeGeometry(sourceGeometry);
  const wireframeMesh = new THREE.LineSegments(wireframeGeom, wireframeMaterial);
  wireframeMesh.scale.set(modelScale, modelScale, modelScale);
  wireframeMesh.position.set(0, modelYOffset, 0);
  group.add(wireframeMesh);

  // =========================================================================
  // LAYER 3 & 4: GOLDEN ENERGY NETWORK & GLOWING NODES (Sampled from geometry)
  // =========================================================================
  const posAttr = sourceGeometry.attributes.position;
  const normAttr = sourceGeometry.attributes.normal;
  const vertexCount = posAttr.count;

  // Extract anatomically weighted node junctions
  interface NodeData {
    x: number;
    y: number;
    z: number;
    nx: number;
    ny: number;
    nz: number;
    distToChest: number;
  }

  const nodes: NodeData[] = [];
  const step = Math.max(1, Math.floor(vertexCount / 60)); // Sample ~60 topological node junctions across key anatomical hubs

  for (let i = 0; i < vertexCount; i += step) {
    const x = posAttr.getX(i) * modelScale;
    const y = posAttr.getY(i) * modelScale + modelYOffset;
    const z = posAttr.getZ(i) * modelScale;

    let nx = 0, ny = 1, nz = 0;
    if (normAttr) {
      nx = normAttr.getX(i);
      ny = normAttr.getY(i);
      nz = normAttr.getZ(i);
    }

    // Anatomical distribution weighting
    const isHands = Math.abs(x) > 0.52;
    const isFeet = y < 0.22;
    if (isHands && Math.random() > 0.35) continue;
    if (isFeet && Math.random() > 0.40) continue;

    const dx = x - chestPos.x;
    const dy = y - chestPos.y;
    const dz = z - chestPos.z;
    const distToChest = Math.sqrt(dx * dx + dy * dy + dz * dz);

    nodes.push({ x, y, z, nx, ny, nz, distToChest });
  }

  // Generate interconnected network lines following the anatomical contours
  const linePositions: number[] = [];
  const lineDistToChest: number[] = [];
  const lineBranches: number[] = [];
  const connectionsSet = new Set<string>();

  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    const candidates: { j: number; d: number }[] = [];

    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dz = a.z - b.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Distance threshold: organic connections between 1.5cm and 9.5cm
      if (d >= 0.015 && d <= 0.095) {
        // Normal consistency: normals do not strongly oppose
        const dotN = a.nx * b.nx + a.ny * b.ny + a.nz * b.nz;
        if (dotN > 0.10) {
          candidates.push({ j, d });
        }
      }
    }

    candidates.sort((p, q) => p.d - q.d);
    // Connect to 2 to 3 organic neighbors
    const toConnect = candidates.slice(0, 3);

    for (const c of toConnect) {
      const key = Math.min(i, c.j) + '_' + Math.max(i, c.j);
      if (!connectionsSet.has(key)) {
        connectionsSet.add(key);
        const b = nodes[c.j];
        const branchRand = Math.random();

        // Normal offset (+0.0028) so lines float cleanly on the translucent skin
        const offset = 0.0028;
        linePositions.push(
          a.x + a.nx * offset, a.y + a.ny * offset, a.z + a.nz * offset,
          b.x + b.nx * offset, b.y + b.ny * offset, b.z + b.nz * offset
        );
        lineDistToChest.push(a.distToChest, b.distToChest);
        lineBranches.push(branchRand, branchRand);
      }
    }
  }

  // Line Segments Geometry & Shader
  const networkGeom = new THREE.BufferGeometry();
  networkGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  networkGeom.setAttribute('aDistanceToChest', new THREE.Float32BufferAttribute(lineDistToChest, 1));
  networkGeom.setAttribute('aBranch', new THREE.Float32BufferAttribute(lineBranches, 1));

  const networkUniforms = {
    uTime: { value: 0 },
    uFlowSpeed: { value: 1.0 },
    uNetworkIntensity: { value: 0.6 },
    uGoldColor: { value: warmGold },
    uCoreColor: { value: radiantCoreGold },
  };

  const networkMaterial = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: networkUniforms,
    vertexShader: `
      attribute float aDistanceToChest;
      attribute float aBranch;
      varying float vDistToChest;
      varying float vBranch;

      void main() {
        vDistToChest = aDistanceToChest;
        vBranch = aBranch;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uFlowSpeed;
      uniform float uNetworkIntensity;
      uniform vec3 uGoldColor;
      uniform vec3 uCoreColor;

      varying float vDistToChest;
      varying float vBranch;

      void main() {
        // Continuous smooth traveling pulse originating from the chest core
        float pulsePhase = vDistToChest * 16.0 - uTime * uFlowSpeed * 3.6 + vBranch * 6.28;
        float pulse = pow(max(0.0, sin(pulsePhase)), 6.0);
        float restingCurrent = 0.03 + 0.02 * sin(uTime * 1.6 + vBranch * 3.14);
        float intensity = clamp((restingCurrent + pulse * 0.25) * uNetworkIntensity, 0.0, 0.40);

        vec3 col = mix(uGoldColor, uCoreColor, clamp(pulse * 0.6, 0.0, 0.5));
        gl_FragColor = vec4(col * intensity, clamp(intensity * 2.2, 0.0, 0.85));
      }
    `,
  });

  const networkMesh = new THREE.LineSegments(networkGeom, networkMaterial);
  group.add(networkMesh);

  // Nodes Geometry & Shader (Layer 4: Glowing Nodes at intersections)
  const nodePositions: number[] = [];
  const nodeSizes: number[] = [];
  const nodeBrightness: number[] = [];
  const nodePhases: number[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const offset = 0.0035;
    nodePositions.push(n.x + n.nx * offset, n.y + n.ny * offset, n.z + n.nz * offset);

    // Node sizes and brightness vary naturally: delicate celestial points
    const nearChest = Math.max(0.0, 1.0 - n.distToChest / 0.55);
    const size = 0.006 + nearChest * 0.007 + Math.random() * 0.004;
    const brightness = 0.12 + nearChest * 0.15 + Math.random() * 0.10;
    const phase = Math.random() * Math.PI * 2.0;

    nodeSizes.push(size);
    nodeBrightness.push(brightness);
    nodePhases.push(phase);
  }

  const nodesGeom = new THREE.BufferGeometry();
  nodesGeom.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
  nodesGeom.setAttribute('aSize', new THREE.Float32BufferAttribute(nodeSizes, 1));
  nodesGeom.setAttribute('aBrightness', new THREE.Float32BufferAttribute(nodeBrightness, 1));
  nodesGeom.setAttribute('aPhase', new THREE.Float32BufferAttribute(nodePhases, 1));

  const nodesUniforms = {
    uTime: { value: 0 },
    uNodesBrightness: { value: 0.3 },
    uGoldColor: { value: warmGold },
    uCoreColor: { value: radiantCoreGold },
  };

  const nodesMaterial = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: nodesUniforms,
    vertexShader: `
      attribute float aSize;
      attribute float aBrightness;
      attribute float aPhase;
      uniform float uTime;
      uniform float uNodesBrightness;
      varying float vBrightness;
      varying float vPulse;

      void main() {
        float pulse = 0.72 + 0.28 * sin(uTime * 2.2 + aPhase);
        vPulse = pulse;
        vBrightness = aBrightness * pulse * uNodesBrightness;

        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (aSize * 240.0 / -mvPos.z) * (0.85 + 0.15 * pulse);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uGoldColor;
      uniform vec3 uCoreColor;
      varying float vBrightness;
      varying float vPulse;

      void main() {
        float r = length(gl_PointCoord - vec2(0.5));
        if (r > 0.5) discard;

        // Radiant Gaussian node core
        float core = exp(-r * r * 20.0);
        float corona = exp(-r * r * 6.0) * 0.25;
        float glow = core + corona;

        vec3 col = mix(uGoldColor, uCoreColor, clamp(core * 0.6, 0.0, 0.5));
        gl_FragColor = vec4(col * vBrightness, clamp(glow * vBrightness * 2.0, 0.0, 0.90));
      }
    `,
  });

  const nodesMesh = new THREE.Points(nodesGeom, nodesMaterial);
  group.add(nodesMesh);

  // =========================================================================
  // LAYER 5: CHEST ENERGY CORE (Concentrated Golden Star Core with Rings)
  // =========================================================================
  const chestCoreGroup = new THREE.Group();
  chestCoreGroup.position.copy(chestPos);
  group.add(chestCoreGroup);

  // 1. Radiant Central Lens Disc
  const coreDiscGeom = new THREE.CircleGeometry(0.026, 32);
  const coreDiscMat = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uRadiance: { value: 1.3 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uRadiance;
      varying vec2 vUv;
      void main() {
        float r = length(vUv - vec2(0.5)) * 2.0;
        if (r > 1.0) discard;
        float pulse = 0.88 + 0.12 * sin(uTime * 3.5);
        float core = exp(-r * r * 28.0) * pulse * min(uRadiance, 1.3) * 0.45;
        float halo = exp(-r * r * 9.0) * 0.14 * min(uRadiance, 1.3);
        vec3 col = mix(vec3(1.0, 0.72, 0.2), vec3(1.0, 0.95, 0.75), core);
        gl_FragColor = vec4(col * (core + halo), clamp(core + halo, 0.0, 0.50));
      }
    `,
  });
  const coreDiscMesh = new THREE.Mesh(coreDiscGeom, coreDiscMat);
  chestCoreGroup.add(coreDiscMesh);

  // 2. Concentric Delicate Energy Rings (counter-rotating)
  const ring1Geom = new THREE.TorusGeometry(0.065, 0.0016, 12, 64);
  const ring2Geom = new THREE.TorusGeometry(0.098, 0.0013, 12, 64);
  const ring3Geom = new THREE.TorusGeometry(0.135, 0.0010, 12, 64);

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xffea77,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
  });

  const ring1Mesh = new THREE.Mesh(ring1Geom, ringMat);
  const ring2Mesh = new THREE.Mesh(ring2Geom, ringMat);
  const ring3Mesh = new THREE.Mesh(ring3Geom, ringMat);
  chestCoreGroup.add(ring1Mesh, ring2Mesh, ring3Mesh);

  // 3. Radial Golden Coronal Filament Spokes
  const spokesGeom = new THREE.BufferGeometry();
  const spokePos: number[] = [];
  const spokeCount = 12;
  for (let s = 0; s < spokeCount; s++) {
    const angle = (s / spokeCount) * Math.PI * 2.0;
    const rIn = 0.045;
    const rOut = 0.145 + (s % 2 === 0 ? 0.035 : 0.0);
    spokePos.push(
      Math.cos(angle) * rIn, Math.sin(angle) * rIn, 0.001,
      Math.cos(angle) * rOut, Math.sin(angle) * rOut, 0.001
    );
  }
  spokesGeom.setAttribute('position', new THREE.Float32BufferAttribute(spokePos, 3));
  const spokesMat = new THREE.LineBasicMaterial({
    color: 0xffe28a,
    transparent: true,
    opacity: 0.20,
    blending: THREE.AdditiveBlending,
  });
  const spokesMesh = new THREE.LineSegments(spokesGeom, spokesMat);
  chestCoreGroup.add(spokesMesh);

  // 4. Subtle chest indicator (no wash out of muscular anatomy)
  const chestLight = new THREE.PointLight(0xffdf80, 0.0, 1.0, 2.0);
  chestCoreGroup.add(chestLight);

  // =========================================================================
  // LAYER 6: HOLOGRAPHIC PARTICLES & NANITES
  // =========================================================================
  const auraMesh: THREE.Mesh | null = null;
  const orbitRingsGroup: THREE.Group | null = null;

  // Floating Energy Nanites / Stardust
  const naniteCount = 140;
  const nanitesGeom = new THREE.BufferGeometry();
  const nanitePositions = new Float32Array(naniteCount * 3);
  const naniteSpeeds = new Float32Array(naniteCount);

  for (let i = 0; i < naniteCount; i++) {
    const r = 0.15 + Math.random() * 0.55;
    const theta = Math.random() * Math.PI * 2.0;
    nanitePositions[i * 3] = Math.cos(theta) * r;
    nanitePositions[i * 3 + 1] = 0.2 + Math.random() * 2.2;
    nanitePositions[i * 3 + 2] = Math.sin(theta) * r;
    naniteSpeeds[i] = 0.2 + Math.random() * 0.45;
  }
  nanitesGeom.setAttribute('position', new THREE.BufferAttribute(nanitePositions, 3));

  const nanitesMat = new THREE.PointsMaterial({
    color: 0xffea88,
    size: 0.018,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nanitesMesh = new THREE.Points(nanitesGeom, nanitesMat);
  group.add(nanitesMesh);

  // =========================================================================
  // ANIMATION LOOP & LAYER CONTROLS
  // =========================================================================
  const update = (time: number, delta: number) => {
    // 1. Update Skin Shader Time
    skinUniforms.uTime.value = time;

    // 2. Update Wireframe Shader Time
    wireframeUniforms.uTime.value = time;

    // 3. Update Network Flow Shader Time
    networkUniforms.uTime.value = time;

    // 4. Update Nodes Shader Time
    nodesUniforms.uTime.value = time;

    // 5. Update Core Lens Time & Rotate Concentric Rings
    (coreDiscMat.uniforms.uTime as { value: number }).value = time;
    ring1Mesh.rotation.z = time * 0.55;
    ring2Mesh.rotation.z = -time * 0.38;
    ring3Mesh.rotation.z = time * 0.22;
    spokesMesh.rotation.z = time * 0.15;

    // 6. Floating Energy Nanites Rising
    const posArr = nanitesGeom.attributes.position.array as Float32Array;
    for (let i = 0; i < naniteCount; i++) {
      posArr[i * 3 + 1] += delta * naniteSpeeds[i];
      if (posArr[i * 3 + 1] > 2.45) {
        posArr[i * 3 + 1] = 0.25;
      }
    }
    nanitesGeom.attributes.position.needsUpdate = true;
  };

  return {
    group,
    skinMesh,
    wireframeMesh,
    networkMesh,
    nodesMesh,
    chestCoreGroup,
    auraMesh,
    orbitRingsGroup,
    nanitesMesh,
    update,
    setSkinOpacity: (val: number) => {
      skinUniforms.uSkinOpacity.value = val;
    },
    setNetworkIntensity: (val: number) => {
      networkUniforms.uNetworkIntensity.value = val;
      wireframeUniforms.uNetworkIntensity.value = val;
    },
    setNodesBrightness: (val: number) => {
      nodesUniforms.uNodesBrightness.value = val;
    },
    setFlowSpeed: (val: number) => {
      networkUniforms.uFlowSpeed.value = val;
      wireframeUniforms.uFlowSpeed.value = val;
    },
    setChestCoreRadiance: (val: number) => {
      (coreDiscMat.uniforms.uRadiance as { value: number }).value = val;
      chestLight.intensity = val * 0.75;
      ringMat.opacity = Math.min(1.0, 0.35 + val * 0.22);
      spokesMat.opacity = Math.min(1.0, 0.25 + val * 0.25);
      coreDiscMesh.scale.setScalar(0.75 + val * 0.25);
    },
    setAuraVisible: (val: boolean) => {
      if (nanitesMesh) nanitesMesh.visible = val;
    },
    setScanlineEnabled: (val: boolean) => {
      skinUniforms.uScanlineEnabled.value = val ? 1.0 : 0.0;
    },
    setThemeColor: (color: THREE.Color) => {
      skinUniforms.uThemeColor.value.copy(color);
      networkUniforms.uGoldColor.value.copy(color);
      nodesUniforms.uGoldColor.value.copy(color);
      wireframeUniforms.uGoldColor.value.copy(color);
      ringMat.color.copy(color);
      spokesMat.color.copy(color);
    },
  };
}

import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { PARTICLE_CONFIG, FORMS } from '../config';
import {
  VELOCITY_SIMULATION_SHADER,
  POSITION_SIMULATION_SHADER,
  PARTICLE_VERTEX_SHADER,
  PARTICLE_FRAGMENT_SHADER,
  BG_PLANE_VERTEX,
  BG_PLANE_FRAGMENT,
} from './particle-shaders';
import { buildAllFormTextures, SampledFormData } from './particle-sampler';

export interface ParticleSystemCallbacks {
  onMorphStart?: (formId: string) => void;
  onMorphComplete?: (formId: string) => void;
  onSparkArrive?: (formId: string) => void;
}

export class TechnexParticleSystem {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;

  // Background
  private bgMesh: THREE.Mesh;
  private bgMaterial: THREE.ShaderMaterial;

  // GPGPU
  private gpuCompute!: GPUComputationRenderer;
  private posVariable: any;
  private velVariable: any;
  private texWidth: number;
  private texHeight: number;
  private particleCount: number;

  // Textures & Data
  private formDataMap = new Map<string, SampledFormData>();
  private currentFormId = 'human';
  private targetFormId = 'human';
  private isMorphing = false;
  private morphStartTime = 0;

  // Particle Mesh
  private particleMesh!: THREE.Points;
  private particleMaterial!: THREE.ShaderMaterial;

  // Spark Projectile (streak of light flying from button to figure)
  private sparkStreakMesh!: THREE.Line;
  private sparkMaterial!: THREE.LineBasicMaterial;
  private sparkActive = false;
  private sparkStartTime = 0;
  private sparkStartPos = new THREE.Vector3();
  private sparkEndPos = new THREE.Vector3(0, 0.45, 0); // Core of the figure
  private sparkTargetForm = 'human';

  // Interaction & Parallax
  private mouse = new THREE.Vector2(0, 0);
  private targetMouse = new THREE.Vector2(0, 0);
  private pointerWorld = new THREE.Vector3(9999, 9999, 0);
  private raycaster = new THREE.Raycaster();
  private interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  // Animation & Clock
  private clock = new THREE.Clock();
  private animId = 0;
  private isPaused = false;
  private reducedMotion = false;
  private callbacks: ParticleSystemCallbacks;

  constructor(container: HTMLElement, callbacks: ParticleSystemCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    const isMobile = window.innerWidth < 768;
    this.texWidth = isMobile ? PARTICLE_CONFIG.textureWidthMobile : PARTICLE_CONFIG.textureSizeDesktop;
    this.texHeight = isMobile ? PARTICLE_CONFIG.textureHeightMobile : PARTICLE_CONFIG.textureSizeDesktop;
    this.particleCount = this.texWidth * this.texHeight;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    // Camera positioned at 3/4 angle relative to figure floating above pedestal
    this.camera.position.set(0.65, 0.4, 4.8);
    this.camera.lookAt(0, 0.2, 0);

    // 2. WebGL Renderer
    const dpr = Math.min(window.devicePixelRatio, isMobile ? PARTICLE_CONFIG.dprMobile : PARTICLE_CONFIG.dprDesktop);
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(dpr);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // 3. Post-Processing (Subtle Bloom 0.4 strength, 0.6 threshold)
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      PARTICLE_CONFIG.bloomStrength,
      PARTICLE_CONFIG.bloomRadius,
      PARTICLE_CONFIG.bloomThreshold
    );
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());

    // 4. Background Cave Photo Plane (Cover-fit behind everything at z = -6.0)
    const bgZ = -6.0;
    const vFovRad = (45 * Math.PI) / 180;
    const bgHeight = 2 * Math.tan(vFovRad / 2) * (this.camera.position.z - bgZ);
    const bgWidth = bgHeight * aspect;

    const bgGeo = new THREE.PlaneGeometry(bgWidth * 1.25, bgHeight * 1.25);
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x000000, // Black while loading so it never flashes white
      depthTest: false,
      depthWrite: false,
    });
    this.bgMesh = new THREE.Mesh(bgGeo, bgMat);
    this.bgMesh.position.set(0, 0.15, bgZ);
    this.bgMesh.renderOrder = -100;
    this.scene.add(this.bgMesh);

    new THREE.TextureLoader().load(PARTICLE_CONFIG.backgroundImage, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      bgMat.map = tex;
      bgMat.color.set(0xffffff);
      bgMat.needsUpdate = true;
    });

    // 5. Light beam streak projectile
    this.createSparkStreakMesh();

    // 6. Listeners
    this.setupListeners();
  }

  public async init(): Promise<void> {
    // Build all 13 event forms + human base
    this.formDataMap = await buildAllFormTextures(
      this.particleCount,
      this.texWidth,
      this.texHeight,
      PARTICLE_CONFIG.humanModelPath
    );

    // Initialize GPGPU
    this.initGPGPU();

    // Initialize Point Cloud Particle Mesh
    this.initParticleMesh();

    // Perform first GPGPU compute step so particle textures are immediately bound
    this.gpuCompute.compute();
    const currentPosTexture = this.gpuCompute.getCurrentRenderTarget(this.posVariable).texture;
    const currentVelTexture = this.gpuCompute.getCurrentRenderTarget(this.velVariable).texture;
    this.particleMaterial.uniforms['uPosTex'].value = currentPosTexture;
    this.particleMaterial.uniforms['uVelTex'].value = currentVelTexture;

    // Start render loop
    this.animate();
  }

  private initGPGPU(): void {
    this.gpuCompute = new GPUComputationRenderer(this.texWidth, this.texHeight, this.renderer);

    const humanData = this.formDataMap.get('human')!;
    const dtPosition = this.gpuCompute.createTexture();
    const dtVelocity = this.gpuCompute.createTexture();

    // Initial state: human form
    const posArr = dtPosition.image.data as Float32Array;
    const velArr = dtVelocity.image.data as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 4;
      posArr[idx] = humanData.points[idx];
      posArr[idx + 1] = humanData.points[idx + 1];
      posArr[idx + 2] = humanData.points[idx + 2];
      posArr[idx + 3] = humanData.points[idx + 3];

      velArr[idx] = 0;
      velArr[idx + 1] = 0;
      velArr[idx + 2] = 0;
      velArr[idx + 3] = 0;
    }

    this.posVariable = this.gpuCompute.addVariable('texturePosition', POSITION_SIMULATION_SHADER, dtPosition);
    this.velVariable = this.gpuCompute.addVariable('textureVelocity', VELOCITY_SIMULATION_SHADER, dtVelocity);

    this.gpuCompute.setVariableDependencies(this.posVariable, [this.posVariable, this.velVariable]);
    this.gpuCompute.setVariableDependencies(this.velVariable, [this.posVariable, this.velVariable]);

    // Create attribute texture (size, color, random twinkle phase, edge weight)
    const dtAttr = this.gpuCompute.createTexture();
    const attrArr = dtAttr.image.data as Float32Array;
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 4;
      attrArr[idx] = Math.random(); // variable size 0-1
      attrArr[idx + 1] = Math.random(); // color random selector (70% gold, 20% white, 10% teal)
      attrArr[idx + 2] = Math.random(); // random twinkle phase
      attrArr[idx + 3] = humanData.points[idx + 3]; // edge weight
    }

    // Set uniforms
    const velUniforms = this.velVariable.material.uniforms;
    velUniforms['uTime'] = { value: 0 };
    velUniforms['uDelta'] = { value: 0 };
    velUniforms['uMorphProgress'] = { value: 1.0 };
    velUniforms['uMorphTriggerTime'] = { value: -100.0 };
    velUniforms['uPointerPos'] = { value: new THREE.Vector3(9999, 9999, 0) };
    velUniforms['uPointerRadius'] = { value: 1.15 }; // ~60px in world space
    velUniforms['uPointerStrength'] = { value: 45.0 };
    velUniforms['uSpringStiffness'] = { value: PARTICLE_CONFIG.spring.stiffness };
    velUniforms['uSpringDamping'] = { value: PARTICLE_CONFIG.spring.damping };
    velUniforms['uReducedMotion'] = { value: this.reducedMotion ? 1.0 : 0.0 };
    velUniforms['textureTarget'] = { value: humanData.texture };
    velUniforms['textureOrigin'] = { value: humanData.texture };
    velUniforms['textureAttributes'] = { value: dtAttr };

    const posUniforms = this.posVariable.material.uniforms;
    posUniforms['uDelta'] = { value: 0 };
    posUniforms['uReducedMotion'] = { value: this.reducedMotion ? 1.0 : 0.0 };

    const error = this.gpuCompute.init();
    if (error !== null) {
      console.error('GPUComputationRenderer init error:', error);
    }
  }

  private initParticleMesh(): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const simUvs = new Float32Array(this.particleCount * 2);

    let p = 0;
    for (let j = 0; j < this.texHeight; j++) {
      for (let i = 0; i < this.texWidth; i++) {
        simUvs[p * 2] = (i + 0.5) / this.texWidth;
        simUvs[p * 2 + 1] = (j + 0.5) / this.texHeight;
        positions[p * 3] = 0;
        positions[p * 3 + 1] = 0;
        positions[p * 3 + 2] = 0;
        p++;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSimUv', new THREE.BufferAttribute(simUvs, 2));

    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERTEX_SHADER,
      fragmentShader: PARTICLE_FRAGMENT_SHADER,
      uniforms: {
        uPosTex: { value: null },
        uVelTex: { value: null },
        uAttrTex: { value: this.velVariable.material.uniforms.textureAttributes.value },
        uTime: { value: 0 },
        uDpr: { value: this.renderer.getPixelRatio() },
        uBaseSize: { value: 1.8 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particleMesh = new THREE.Points(geometry, this.particleMaterial);
    // Position figure floating above the stone pedestal in the teal light beam
    this.particleMesh.position.set(0, 0.45, 0);
    this.scene.add(this.particleMesh);
  }

  private createSparkStreakMesh(): void {
    const points = [new THREE.Vector3(), new THREE.Vector3()];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    this.sparkMaterial = new THREE.LineBasicMaterial({
      color: 0x8ce2e0, // Teal streak
      linewidth: 3,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.sparkStreakMesh = new THREE.Line(geom, this.sparkMaterial);
    this.scene.add(this.sparkStreakMesh);
  }

  /**
   * Triggers the morph from an event spark button:
   * 1. Streak of light flies from clicked button into figure (0.7s)
   * 2. On arrival, morph starts: outward burst (0.25s) + bottom-up curved flight via curl noise + spring settling!
   */
  public triggerEventMorph(formId: string, screenX?: number, screenY?: number): void {
    if (!this.formDataMap.has(formId)) return;
    if (formId === this.currentFormId && !this.isMorphing) return;

    this.targetFormId = formId;

    // Calculate spark starting point from screen position
    if (screenX !== undefined && screenY !== undefined) {
      const rect = this.container.getBoundingClientRect();
      const ndcX = ((screenX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((screenY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
      const targetPoint = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.interactionPlane, targetPoint);
      this.sparkStartPos.copy(targetPoint);
    } else {
      // Default spark origin on side
      this.sparkStartPos.set(1.8, 1.2, 0);
    }

    // Launch spark projectile
    this.sparkActive = true;
    this.sparkStartTime = this.clock.getElapsedTime();
    this.sparkTargetForm = formId;
    this.sparkMaterial.opacity = 0.95;
  }

  /**
   * Starts the GPGPU morph once the spark arrives at the figure
   */
  private startMorph(formId: string): void {
    const targetData = this.formDataMap.get(formId);
    if (!targetData) return;

    this.callbacks.onSparkArrive?.(formId);
    this.callbacks.onMorphStart?.(formId);

    // Set origin texture to current state, target texture to new form
    const currentData = this.formDataMap.get(this.currentFormId);
    if (currentData) {
      this.velVariable.material.uniforms.textureOrigin.value = currentData.texture;
    }
    this.velVariable.material.uniforms.textureTarget.value = targetData.texture;
    this.velVariable.material.uniforms.uMorphTriggerTime.value = this.clock.getElapsedTime();
    this.velVariable.material.uniforms.uMorphProgress.value = 0.0;

    this.currentFormId = formId;
    this.isMorphing = true;
    this.morphStartTime = this.clock.getElapsedTime();
  }

  /**
   * Resets the figure back to the default human form
   */
  public resetToHuman(): void {
    this.triggerEventMorph('human');
  }

  private updateSparkStreak(time: number): void {
    if (!this.sparkActive) return;

    const elapsed = time - this.sparkStartTime;
    const progress = Math.min(elapsed / PARTICLE_CONFIG.sparkFlyDuration, 1.0);

    // Curved parabolic trajectory into center core
    const p = progress;
    const currentPos = new THREE.Vector3().lerpVectors(this.sparkStartPos, this.sparkEndPos, p);
    // Arc upward slightly in middle of flight
    currentPos.y += Math.sin(p * Math.PI) * 0.45;
    currentPos.x += Math.sin(p * Math.PI) * 0.25;

    // Tail streak point
    const tailProgress = Math.max(0, p - 0.2);
    const tailPos = new THREE.Vector3().lerpVectors(this.sparkStartPos, this.sparkEndPos, tailProgress);
    tailPos.y += Math.sin(tailProgress * Math.PI) * 0.45;

    const posAttr = this.sparkStreakMesh.geometry.getAttribute('position') as THREE.BufferAttribute;
    posAttr.setXYZ(0, tailPos.x, tailPos.y, tailPos.z);
    posAttr.setXYZ(1, currentPos.x, currentPos.y, currentPos.z);
    posAttr.needsUpdate = true;

    // Color pulse
    this.sparkMaterial.opacity = 0.95 * (1.0 - p * 0.2);

    if (progress >= 1.0) {
      this.sparkActive = false;
      this.sparkMaterial.opacity = 0;
      this.startMorph(this.sparkTargetForm);
    }
  }

  private setupListeners(): void {
    // Pointer move for particle push & parallax
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private onPointerMove = (e: PointerEvent): void => {
    const rect = this.container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.targetMouse.set(x, y);

    // Raycast to interaction plane (z=0) for 3D pointer repulsion
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    const hit = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.interactionPlane, hit)) {
      this.pointerWorld.copy(hit);
    }
  };

  private onResize = (): void => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.bloomPass.setSize(w, h);

    if (this.bgMesh) {
      const vFovRad = (this.camera.fov * Math.PI) / 180;
      const bgHeight = 2 * Math.tan(vFovRad / 2) * (this.camera.position.z - (-6.0));
      const bgWidth = bgHeight * (w / h);
      this.bgMesh.geometry.dispose();
      this.bgMesh.geometry = new THREE.PlaneGeometry(bgWidth * 1.18, bgHeight * 1.18);
    }
  };

  private onVisibilityChange = (): void => {
    this.isPaused = document.hidden;
    if (!this.isPaused) {
      this.clock.start();
    }
  };

  private animate = (): void => {
    this.animId = requestAnimationFrame(this.animate);
    if (this.isPaused) return;

    const delta = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.getElapsedTime();

    // Smooth mouse interpolation for parallax
    this.mouse.lerp(this.targetMouse, 0.06);

    // Multi-plane Parallax:
    // Background moves least (0.015), figure more (0.045), sparks most (0.08)
    if (this.bgMesh) {
      this.bgMesh.position.x = -this.mouse.x * 0.12;
      this.bgMesh.position.y = 0.15 - this.mouse.y * 0.12;
    }

    if (this.particleMesh) {
      this.particleMesh.position.x = this.mouse.x * PARTICLE_CONFIG.parallax.figure;
      this.particleMesh.position.y = 0.45 + this.mouse.y * PARTICLE_CONFIG.parallax.figure;
      // Subtle float oscillation
      this.particleMesh.position.y += Math.sin(time * 1.4) * 0.04;
    }

    // Update spark projectile
    this.updateSparkStreak(time);

    // Update GPGPU simulation
    if (this.gpuCompute) {
      const velUniforms = this.velVariable.material.uniforms;
      velUniforms['uTime'].value = time;
      velUniforms['uDelta'].value = delta;
      velUniforms['uPointerPos'].value.copy(this.pointerWorld);

      const posUniforms = this.posVariable.material.uniforms;
      posUniforms['uDelta'].value = delta;

      this.gpuCompute.compute();

      // Send GPGPU outputs to particle material
      const currentPosTexture = this.gpuCompute.getCurrentRenderTarget(this.posVariable).texture;
      const currentVelTexture = this.gpuCompute.getCurrentRenderTarget(this.velVariable).texture;

      this.particleMaterial.uniforms['uPosTex'].value = currentPosTexture;
      this.particleMaterial.uniforms['uVelTex'].value = currentVelTexture;
      this.particleMaterial.uniforms['uTime'].value = time;
    }

    // Morph completion check
    if (this.isMorphing && time - this.morphStartTime > 2.8) {
      this.isMorphing = false;
      this.callbacks.onMorphComplete?.(this.currentFormId);
    }

    // Render with bloom post-processing
    // this.composer.render();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose(): void {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

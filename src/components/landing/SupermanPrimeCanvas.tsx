'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ComicCardData } from './ComicModal';
import { buildHolographicHumanoid, HolographicLayers } from './HolographicHumanoid';
export type EntityForm = 'humanoid' | 'flying_machine' | 'watercraft' | 'neural_network';

interface LandingDebugWindow extends Window {
  __scene?: THREE.Scene;
  __flyingMachine?: THREE.Group;
  __watercraft?: THREE.Group;
  __neuralNetwork?: THREE.Group;
  __humanoid?: THREE.Group;
  __entityGroup?: THREE.Group;
}

interface SupermanPrimeCanvasProps {
  onSelectComic: (card: ComicCardData) => void;
  bloomStrength: number;
  glowIntensity: number;
  theme: 'prime' | 'supernova' | 'solarflare' | 'obsidian';
  poseMode: 'exact' | 'walk' | 'hover';
  showHalo: boolean;
  showCape: boolean;
  showRibbons: boolean;
  showCards: boolean;
  showParticles: boolean;
  cameraPreset: 'prime' | 'closeup' | 'full' | 'lowangle' | 'orbit';
  cameraTrigger?: number;
  panelLayout?: 'circular' | 'horizontal_ring' | 'helical' | 'orbit';
  modelSource?: 'male_body' | 'superman_prime';
  onCaptureRef?: React.MutableRefObject<(() => void) | null>;
  hologramSkinOpacity?: number;
  hologramNetworkIntensity?: number;
  hologramNodesBrightness?: number;
  hologramFlowSpeed?: number;
  hologramChestCoreRadiance?: number;
  showHologramAura?: boolean;
  showHologramScanline?: boolean;
  entityForm?: EntityForm;
  onEntityFormChange?: (form: EntityForm) => void;
  autoTransform?: boolean;
  onUserInteraction?: () => void;
}

export const COMIC_CARDS_DATA: ComicCardData[] = [
  {
    id: 'flight',
    title: 'Flight: Da Vinci Machine ➔ Supersonic Aerospace',
    idea: "Leonardo da Vinci's Flying Machine (1485)",
    innovation: 'Supersonic Aircraft & Reusable Orbital Shuttles',
    era: 'Renaissance Blueprint ➔ Mach 3+ Aerospace',
    image: '/comics/panel_alien_world.webp',
    caption: 'Leonardo da Vinci Ornithopter (1485) ➔ Modern Aeroplanes & Hypersonic Jets',
    lore: 'In 1485, Leonardo da Vinci sketched the "Codice del Volo", conceiving mechanical bird wings (Ala Meccanica) and aerial screws. For centuries this remained an impossible dream until aerodynamics, jet propulsion, and supersonic aerospace turned his visionary parchment into Mach 3+ hypersonic flight and orbital exploration.',
  },
  {
    id: 'neural',
    title: 'Intelligence: Biological Synapse ➔ Neural Network AI',
    idea: 'Human Brain & Biological Synaptic Pathways',
    innovation: 'Artificial Neural Networks & Quantum Deep Learning',
    era: 'Biological Neurons ➔ Synthetic Machine Intelligence',
    image: '/comics/panel_city.webp',
    caption: 'Biological Synapses & Neurons ➔ Artificial Deep Neural Networks & AI',
    lore: 'The biological human brain, powered by 86 billion interconnected neurons and electrochemical synaptic gaps, was nature’s greatest computing marvel. Inspired by biological cognition, scientists engineered artificial neural networks, tensor microchips, and transformer architectures that now decode languages, generate art, and power autonomous discovery.',
  },
  {
    id: 'maritime',
    title: 'Maritime: Ancient Watercraft ➔ Modern Super-Ships',
    idea: 'Primitive Reed Boats & Polynesian Outriggers',
    innovation: 'Autonomous Mega-Ships & Nuclear Arctic Vessels',
    era: 'Ancient Ocean Voyages ➔ Satellite-Guided Fleets',
    image: '/comics/panel_classic.webp',
    caption: 'Primitive Wood & Reed Watercraft ➔ Autonomous Mega-Vessels & Modern Ships',
    lore: 'Humanity first navigated the perilous oceans on dugout logs, Polynesian outrigger canoes, and Egyptian papyrus watercraft guided solely by constellations. That primal desire to cross the horizon has evolved into 400-meter autonomous container mega-ships, nuclear icebreakers, and satellite-synchronized oceanic global fleets.',
  },
  {
    id: 'computing',
    title: 'Computation: Counting Abacus ➔ Quantum Processor',
    idea: 'Wooden Counting Abacus & Babbage Analytical Engine',
    innovation: 'Cryogenic Superconducting Quantum Computers',
    era: 'Mechanical Gears (1642) ➔ Quantum Superconductors',
    image: '/comics/panel_explosion.webp',
    caption: 'Bead Abacus & Pascaline Gears ➔ Quantum Supercomputing Chandeliers',
    lore: 'From the tactile beads of the counting abacus to Blaise Pascal’s geared Pascaline (1642) and Charles Babbage’s steam-driven Analytical Engine (1837), humankind strove to mechanize calculations. Today, that journey culminates in cryogenic quantum processors using entangled qubits in superposition to calculate complexities beyond all classical machines.',
  },
  {
    id: 'astronomy',
    title: 'Cosmic Vision: Galileo Spyglass ➔ James Webb Telescope',
    idea: "Galileo's 1609 Optical Spyglass & Astrolabe",
    innovation: 'James Webb Space Telescope (JWST) & Interstellar Probes',
    era: '17th-Century Lens ➔ Infrared Deep Space Telescopes',
    image: '/comics/panel_helmet.webp',
    caption: 'Galileo Handheld Spyglass ➔ 6.5m Golden Beryllium Mirror Observatory',
    lore: 'In 1609, Galileo Galilei trained a handmade brass-and-leather spyglass toward Jupiter, discovering celestial moons and redefining humanity’s place in the universe. Four centuries later, the James Webb Space Telescope orbits 1.5 million kilometers into the void, unfurling 18 gold-coated beryllium hexagons to witness the birth of the earliest stars.',
  },
  {
    id: 'energy',
    title: 'Energy & Power: Primitive Torch ➔ Fusion Tokamak',
    idea: 'Primitive Wood Fire Torch & Edison Incandescent Bulb',
    innovation: 'Magnetic Confinement Nuclear Fusion Tokamak',
    era: 'Open Flame Combustion ➔ Artificial Sun Fusion Energy',
    image: '/comics/panel_legion.webp',
    caption: 'Primitive Fire & Oil Lamps ➔ Magnetic Fusion Plasma & Laser Photonics',
    lore: 'The spark of a primitive wooden fire torch half a million years ago gave our ancestors light and survival, followed millennia later by Thomas Edison’s carbon filament light bulb. Today, humankind is harnessing the power of the stars themselves through magnetic confinement fusion tokamaks and laser photonics—producing boundless clean energy on Earth.',
  },
  {
    id: 'telecom',
    title: 'Communication: Smoke Signals ➔ Quantum Satellite Mesh',
    idea: 'Tribal Smoke Signals, Pigeon Post & Morse Telegraph',
    innovation: 'Global Satellite Mesh Constellations & Laser Comms',
    era: 'Hilltop Signals & Telegraph ➔ Instant Global Quantum Network',
    image: '/comics/panel_nebula.webp',
    caption: 'Smoke Signals & Carrier Pigeons ➔ Orbital Satellite Laser Networks',
    lore: 'When distance separated civilizations, messages were relayed through hilltop smoke signals, homing pigeons, and early Morse electric telegraphs. Today, dense constellations of low-Earth orbit satellites linked by infrared laser beams wrap our planet in a seamless web, transmitting billions of gigabytes across continents in mere milliseconds.',
  },
  {
    id: 'biomed',
    title: 'Medicine & Genetics: Herbal Alchemy ➔ CRISPR Editing',
    idea: 'Ancient Herbal Botany, Mortar & Pestle Apothecary',
    innovation: 'CRISPR-Cas9 Molecular Precision Gene Editing',
    era: 'Medicinal Plant Tinctures ➔ Nanomedicine & Genome Editing',
    image: '/comics/panel_starship.webp',
    caption: 'Herbal Mortar & Pestle ➔ CRISPR-Cas9 Molecular Gene Engineering',
    lore: 'For millennia, ancient healers turned to wild plants, willow bark, and alchemical distillations to treat human illness. Today, molecular biologists operate directly upon the 3-billion-base-pair genetic code with CRISPR-Cas9 molecular scissors, reprogramming disease vectors, tailoring mRNA vaccines, and engineering cellular nanorobots.',
  },
  {
    id: 'transport',
    title: 'Transportation: Wooden Wheel ➔ Maglev Hyperloop',
    idea: 'Mesopotamian Solid Wooden Wheel & Sumerian Chariot',
    innovation: 'Supersonic Vacuum Maglev Hyperloops & Orbit Rovers',
    era: '3500 BCE Solid Wheel ➔ Frictionless Hyperloop & Space Rovers',
    image: '/comics/panel_supersun.webp',
    caption: 'Mesopotamian Wooden Wheel ➔ Magnetic Levitation Hyperloop & Planetary Rovers',
    lore: 'Invented in ancient Mesopotamia around 3500 BCE, the wooden wheel fundamentally unlocked human trade and movement across continents. Through horse-drawn chariots and early steam locomotives, that same kinetic ingenuity now achieves frictionless 1000 km/h magnetic levitation in vacuum hyperloop tunnels and autonomous rovers rolling on Mars.',
  },
];

export default function SupermanPrimeCanvas({
  onSelectComic,
  bloomStrength,
  glowIntensity,
  theme,
  poseMode,
  showHalo,
  showCape,
  showRibbons,
  showCards,
  showParticles,
  cameraPreset,
  cameraTrigger = 0,
  panelLayout = 'circular',
  modelSource = 'male_body',
  onCaptureRef,
  hologramSkinOpacity = 0.65,
  hologramNetworkIntensity = 0.6,
  hologramNodesBrightness = 0.3,
  hologramFlowSpeed = 1.0,
  hologramChestCoreRadiance = 1.3,
  showHologramAura = false,
  showHologramScanline = true,
  entityForm = 'humanoid',
  onEntityFormChange,
  autoTransform = true,
  onUserInteraction,
}: SupermanPrimeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onUserInteractionRef = useRef(onUserInteraction);
  useEffect(() => {
    onUserInteractionRef.current = onUserInteraction;
  }, [onUserInteraction]);
  const [loadingProgress, setLoadingProgress] = useState<number>(10);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const isLoadedRef = useRef<boolean>(false);
  const poseModeRef = useRef(poseMode);

  // References to dynamic Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const walkActionRef = useRef<THREE.AnimationAction | null>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const humanoidContainerRef = useRef<THREE.Group | null>(null);

  const flyingMachineContainerRef = useRef<THREE.Group | null>(null);
  const flyingMachineWrapperRef = useRef<THREE.Group | null>(null);
  const flyingMachineMaterialsRef = useRef<THREE.Material[]>([]);
  const flyingMachineWireMeshesRef = useRef<THREE.LineSegments[]>([]);
  const flyingMachineNodesRef = useRef<THREE.Points[]>([]);
  const flyingMachineGlowLightsRef = useRef<THREE.PointLight[]>([]);

  const watercraftContainerRef = useRef<THREE.Group | null>(null);
  const watercraftWrapperRef = useRef<THREE.Group | null>(null);
  const watercraftMaterialsRef = useRef<THREE.Material[]>([]);
  const watercraftWireMeshesRef = useRef<THREE.LineSegments[]>([]);
  const watercraftNodesRef = useRef<THREE.Points[]>([]);
  const watercraftGlowLightsRef = useRef<THREE.PointLight[]>([]);

  const neuralNetworkContainerRef = useRef<THREE.Group | null>(null);
  const neuralNetworkWrapperRef = useRef<THREE.Group | null>(null);
  const neuralNetworkMaterialsRef = useRef<THREE.Material[]>([]);
  const neuralNetworkWireMeshesRef = useRef<THREE.LineSegments[]>([]);
  const neuralNetworkNodesRef = useRef<THREE.Points[]>([]);
  const neuralNetworkGlowLightsRef = useRef<THREE.PointLight[]>([]);

  const wireMeshRef = useRef<THREE.LineSegments | null>(null);
  const morphShockwaveRef = useRef<THREE.Mesh | null>(null);

  // 4-Stage Autonomous Metamorphosis Cycle State
  const FORMS_SEQUENCE: EntityForm[] = ['humanoid', 'flying_machine', 'watercraft', 'neural_network'];
  const currentFormIdxRef = useRef<number>(0);
  const targetFormIdxRef = useRef<number>(0);
  const formStayTimerRef = useRef<number>(0.0);
  const transitionProgressRef = useRef<number>(1.0);
  const isTransitioningRef = useRef<boolean>(false);

  const prevEntityFormRef = useRef<EntityForm>(entityForm);
  const onEntityFormChangeRef = useRef(onEntityFormChange);
  const autoTransformRef = useRef(autoTransform);

  // Real-time refs to eliminate stale closure in animate() loop
  const hologramSkinOpacityRef = useRef(hologramSkinOpacity);
  const hologramNetworkIntensityRef = useRef(hologramNetworkIntensity);
  const hologramNodesBrightnessRef = useRef(hologramNodesBrightness);
  const hologramFlowSpeedRef = useRef(hologramFlowSpeed);
  const hologramChestCoreRadianceRef = useRef(hologramChestCoreRadiance);
  const showHologramAuraRef = useRef(showHologramAura);
  const showHologramScanlineRef = useRef(showHologramScanline);

  // Cinematic Camera & Orbit State Refs
  const cameraPresetRef = useRef<'prime' | 'closeup' | 'full' | 'lowangle' | 'orbit'>(cameraPreset);
  const orbitAngleRef = useRef<number>(0.0);
  const orbitPhaseRef = useRef<number>(0.0);
  const orbitRadiusRef = useRef<number>(7.65);
  const isUserInteractingRef = useRef<boolean>(false);
  const lastInteractionTimeRef = useRef<number>(0);
  const cameraTransitionRef = useRef<{
    active: boolean;
    startTime: number;
    duration: number;
    startPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    targetLook: THREE.Vector3;
    isOrbit: boolean;
  } | null>(null);

  const isFirstMountRef = useRef(true);
  const isInitialCameraMountRef = useRef(true);
  const holographicLayersRef = useRef<HolographicLayers | null>(null);
  const materialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const haloGroupRef = useRef<THREE.Group | null>(null);
  const capeGroupRef = useRef<THREE.Group | null>(null);
  const capeMeshRef = useRef<THREE.Mesh | null>(null);
  const ribbonsGroupRef = useRef<THREE.Group | null>(null);
  const cardsGroupRef = useRef<THREE.Group | null>(null);
  const portalGroupRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Points | null>(null);
  const chestCoreLightRef = useRef<THREE.PointLight | null>(null);
  const customUniformsRef = useRef<{
    uTime: { value: number };
    uGlowIntensity: { value: number };
    uThemeColor: { value: THREE.Color };
  }>({
    uTime: { value: 0 },
    uGlowIntensity: { value: 1.5 },
    uThemeColor: { value: new THREE.Color(0xd9ad62) },
  });
  const secondaryModelsLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    onEntityFormChangeRef.current = onEntityFormChange;
    autoTransformRef.current = autoTransform;
    hologramSkinOpacityRef.current = hologramSkinOpacity;
    hologramNetworkIntensityRef.current = hologramNetworkIntensity;
    hologramNodesBrightnessRef.current = hologramNodesBrightness;
    hologramFlowSpeedRef.current = hologramFlowSpeed;
    hologramChestCoreRadianceRef.current = hologramChestCoreRadiance;
    showHologramAuraRef.current = showHologramAura;
    showHologramScanlineRef.current = showHologramScanline;
    cameraPresetRef.current = cameraPreset;
  }, [
    onEntityFormChange,
    autoTransform,
    hologramSkinOpacity,
    hologramNetworkIntensity,
    hologramNodesBrightness,
    hologramFlowSpeed,
    hologramChestCoreRadiance,
    showHologramAura,
    showHologramScanline,
    cameraPreset,
  ]);

  // Handle capture high-res snapshot
  useEffect(() => {
    if (onCaptureRef) {
      onCaptureRef.current = () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
        if (composerRef.current) {
          composerRef.current.render();
        } else {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        const canvas = document.createElement('canvas');
        canvas.width = rendererRef.current.domElement.width;
        canvas.height = rendererRef.current.domElement.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Solid cosmic black background
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(rendererRef.current.domElement, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `superman-prime-one-million-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        }
      };
    }
  }, [onCaptureRef]);

  const playChimeForForm = (_form: EntityForm) => {
    // Sound logic removed per user specification
  };

  // Synchronize Metamorphosis form changes (Humanoid ➔ Flying Machine ➔ Watercraft ➔ Neural Network)
  useEffect(() => {
    if (prevEntityFormRef.current !== entityForm) {
      prevEntityFormRef.current = entityForm;
      const newIdx = FORMS_SEQUENCE.indexOf(entityForm);
      if (newIdx !== -1 && newIdx !== targetFormIdxRef.current) {
        currentFormIdxRef.current = targetFormIdxRef.current;
        targetFormIdxRef.current = newIdx;
        isTransitioningRef.current = true;
        transitionProgressRef.current = 0.0;
        formStayTimerRef.current = 0.0;
        playChimeForForm(entityForm);
      }
    }
  }, [entityForm]);

  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const applyThemeToMaterials = useCallback((themeName: string) => {
    let colorHex = 0xd9ad62; // Champagne Gold #d9ad62
    let emissiveHex = 0x442200;
    let roughness = 0.16;
    let metalness = 0.95;

    switch (themeName) {
      case 'prime': // Champagne gold deity
        colorHex = 0xd9ad62;
        emissiveHex = 0x442200;
        roughness = 0.16;
        metalness = 0.95;
        break;
      case 'supernova': // Pure white gold
        colorHex = 0xfffae0;
        emissiveHex = 0x665522;
        roughness = 0.12;
        metalness = 0.98;
        break;
      case 'solarflare': // Molten amber gold
        colorHex = 0xff8c00;
        emissiveHex = 0x661800;
        roughness = 0.22;
        metalness = 0.92;
        break;
      case 'obsidian': // Cosmic obsidian gold
        colorHex = 0x242426;
        emissiveHex = 0x110800;
        roughness = 0.28;
        metalness = 0.85;
        break;
    }

    materialsRef.current.forEach((mat) => {
      mat.color.setHex(colorHex);
      mat.emissive.setHex(emissiveHex);
      mat.roughness = roughness;
      mat.metalness = metalness;
      mat.needsUpdate = true;
    });

    customUniformsRef.current.uThemeColor.value.setHex(colorHex);
    if (chestCoreLightRef.current) {
      chestCoreLightRef.current.color.setHex(colorHex);
    }
    flyingMachineGlowLightsRef.current.forEach((l) => l.color.setHex(colorHex));
    watercraftGlowLightsRef.current.forEach((l) => l.color.setHex(colorHex));
    neuralNetworkGlowLightsRef.current.forEach((l) => l.color.setHex(colorHex));

    if (holographicLayersRef.current) {
      holographicLayersRef.current.setThemeColor(new THREE.Color(colorHex));
    }
  }, []);

  const applyThemeRef = useRef(applyThemeToMaterials);
  useEffect(() => {
    applyThemeRef.current = applyThemeToMaterials;
  }, [applyThemeToMaterials]);

  // Update theme colors
  useEffect(() => {
    applyThemeToMaterials(theme);
  }, [theme, applyThemeToMaterials]);

  // Update bloom strength
  useEffect(() => {
    if (bloomPassRef.current) {
      bloomPassRef.current.strength = bloomStrength;
    }
  }, [bloomStrength]);

  // Update glow intensity
  useEffect(() => {
    customUniformsRef.current.uGlowIntensity.value = glowIntensity;
  }, [glowIntensity]);

  // Update visibility toggles
  useEffect(() => {
    if (haloGroupRef.current) haloGroupRef.current.visible = showHalo;
  }, [showHalo]);

  useEffect(() => {
    if (capeGroupRef.current) capeGroupRef.current.visible = showCape;
  }, [showCape]);

  // Synchronize Holographic Entity Layer Controls in real-time
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
    } else {
      // If user actively tweaks any holographic entity layer sliders, ensure humanoid is visible
      if (targetFormIdxRef.current !== 0) {
        currentFormIdxRef.current = targetFormIdxRef.current;
        targetFormIdxRef.current = 0;
        isTransitioningRef.current = true;
        transitionProgressRef.current = 0.0;
        formStayTimerRef.current = 0.0;
        prevEntityFormRef.current = 'humanoid';
        onEntityFormChangeRef.current?.('humanoid');
      }
    }

    if (holographicLayersRef.current) {
      holographicLayersRef.current.setSkinOpacity(hologramSkinOpacity);
      holographicLayersRef.current.setNetworkIntensity(hologramNetworkIntensity);
      holographicLayersRef.current.setNodesBrightness(hologramNodesBrightness);
      holographicLayersRef.current.setFlowSpeed(hologramFlowSpeed);
      holographicLayersRef.current.setChestCoreRadiance(hologramChestCoreRadiance);
      holographicLayersRef.current.setAuraVisible(showHologramAura);
      holographicLayersRef.current.setScanlineEnabled(showHologramScanline);
    }
    // Synchronize golden body material transparency with skin opacity
    materialsRef.current.forEach((mat) => {
      mat.transparent = true;
      mat.opacity = hologramSkinOpacity;
      mat.depthWrite = hologramSkinOpacity > 0.92;
      mat.needsUpdate = true;
    });
  }, [
    hologramSkinOpacity,
    hologramNetworkIntensity,
    hologramNodesBrightness,
    hologramFlowSpeed,
    hologramChestCoreRadiance,
    showHologramAura,
    showHologramScanline,
  ]);

  useEffect(() => {
    if (ribbonsGroupRef.current) ribbonsGroupRef.current.visible = showRibbons;
  }, [showRibbons]);

  useEffect(() => {
    if (cardsGroupRef.current) cardsGroupRef.current.visible = showCards;
  }, [showCards]);

  useEffect(() => {
    if (cardsGroupRef.current?.userData?.setLayout) {
      cardsGroupRef.current.userData.setLayout(panelLayout);
    }
  }, [panelLayout]);

  useEffect(() => {
    if (particlesGroupRef.current) particlesGroupRef.current.visible = showParticles;
  }, [showParticles]);

  // Update animation / pose mode
  useEffect(() => {
    poseModeRef.current = poseMode;

    if (!walkActionRef.current || !mixerRef.current) return;
    const action = walkActionRef.current;

    if (poseMode === 'exact') {
      // Freeze at keyframe 0.62 (Right foot forward, left leg back, chest out, arms held majestically down and out)
      action.paused = true;
      action.time = 0.62;
      mixerRef.current.update(0);
    } else if (poseMode === 'walk') {
      action.paused = false;
      action.timeScale = 0.45; // Divine slow-motion stride
      action.play();
    } else if (poseMode === 'hover') {
      action.paused = true;
      action.time = 0.35;
      mixerRef.current.update(0);
    }
  }, [poseMode]);

  // Trigger camera transitions with smooth interpolation
  const triggerCameraTransition = useCallback(
    (preset: 'prime' | 'closeup' | 'full' | 'lowangle' | 'orbit', customDuration?: number) => {
      const cam = cameraRef.current;
      const ctrl = controlsRef.current;
      if (!cam || !ctrl) return;

      const targetPos = new THREE.Vector3();
      const targetLook = new THREE.Vector3(0, 1.35, 0);
      let isOrbit = false;

      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 860;

      switch (preset) {
        case 'prime': // Finalized panoramic amphitheater view
          if (isMobile) {
            targetPos.set(-5.6, 4.2, 11.2);
            targetLook.set(0, 1.25, 0);
          } else {
            targetPos.set(-4.95, 3.55, 7.55);
            targetLook.set(0.15, 1.25, 0);
          }
          ctrl.autoRotate = false;
          ctrl.enabled = true;
          break;
        case 'closeup': // Heroic chest & halo portrait
          targetPos.set(0, 1.9, isMobile ? 3.0 : 2.1);
          targetLook.set(0, 1.85, 0);
          ctrl.autoRotate = false;
          ctrl.enabled = true;
          break;
        case 'full': // Full body with floor portal and cosmic ribbons
          targetPos.set(0, 1.2, isMobile ? 8.8 : 6.2);
          targetLook.set(0, 1.1, 0);
          ctrl.autoRotate = false;
          ctrl.enabled = true;
          break;
        case 'lowangle': // Epic god-like looking upward
          targetPos.set(0, 0.2, isMobile ? 5.2 : 3.8);
          targetLook.set(0, 1.8, 0);
          ctrl.autoRotate = false;
          ctrl.enabled = true;
          break;
        case 'orbit': { // Pure 180-degree horizontal cinematic orbit (strictly level height, zero up/down)
          isOrbit = true;
          ctrl.autoRotate = false;
          ctrl.enabled = false;
          const orbitR = isMobile ? 7.6 : 5.2;
          const orbitY = 1.48;
          const maxHalfArc = (Math.PI / 2) * 0.92; // Majestic frontal amphitheater arc (~165°-180°)
          const dx = cam.position.x;
          const dz = cam.position.z;
          let currentAngle = Math.atan2(dx, dz);
          if (isNaN(currentAngle) || dz <= 0.05) {
            currentAngle = 0.0;
          }
          const clampedAngle = Math.max(-maxHalfArc * 0.98, Math.min(maxHalfArc * 0.98, currentAngle));
          orbitPhaseRef.current = Math.asin(clampedAngle / maxHalfArc);
          targetPos.set(
            Math.sin(clampedAngle) * orbitR,
            orbitY,
            Math.cos(clampedAngle) * orbitR
          );
          targetLook.set(0, 1.42, 0);
          break;
        }
      }

      cameraTransitionRef.current = {
        active: true,
        startTime: performance.now(),
        duration: customDuration ?? 900,
        startPos: cam.position.clone(),
        targetPos,
        startTarget: ctrl.target.clone(),
        targetLook,
        isOrbit,
      };
    },
    []
  );

  useEffect(() => {
    if (isInitialCameraMountRef.current) {
      isInitialCameraMountRef.current = false;
      return;
    }
    triggerCameraTransition(cameraPreset);
  }, [cameraPreset, cameraTrigger, triggerCameraTransition]);

  // Main Three.js Scene Initialization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isCancelled = false;
    let animationFrameId: number;
    const width = container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 390);
    const height = container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 844);

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera: Wide panoramic amphitheater framing with calibrated mobile zoom
    const isMobile = width <= 860;
    const initialFov = isMobile ? 46 : 42;
    const camera = new THREE.PerspectiveCamera(initialFov, width / height, 0.1, 150);
    if (isMobile) {
      camera.position.set(-5.6, 4.2, 11.2);
    } else {
      camera.position.set(-4.95, 3.55, 7.55);
    }
    cameraRef.current = camera;

    // Shift view offset so the 3D entity & amphitheater is framed on the right side of the page on desktop
    if (width > 860) {
      camera.setViewOffset(width, height, -width * 0.18, 0, width, height);
    }

    // 3. Robust WebGLRenderer creation with cross-device fallbacks
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'default',
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false,
      });
    } catch (e1) {
      console.warn('Initial WebGLRenderer creation failed, attempting fallback options:', e1);
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: 'default',
          precision: 'mediump',
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false,
        });
      } catch (e2) {
        console.error('All WebGLRenderer attempts failed:', e2);
        setLoadingProgress(100);
        isLoadedRef.current = true;
        setIsLoaded(true);
        return;
      }
    }

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost.');
    };
    const handleContextRestored = () => {
      console.info('WebGL context restored.');
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, width < 768 ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    if (isMobile) {
      controls.target.set(0, 1.25, 0);
      controls.minDistance = 3.0;
      controls.maxDistance = 22;
      renderer.domElement.style.touchAction = 'none';
      controls.enableZoom = true;
    } else {
      controls.target.set(0.15, 1.25, 0);
      controls.minDistance = 1.2;
      controls.maxDistance = 18;
    }
    controls.maxPolarAngle = Math.PI / 2 + 0.18;
    controlsRef.current = controls;

    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.8;

    const handleControlsStart = () => {
      // Cancel programmatic camera transition immediately when user begins interacting
      if (cameraTransitionRef.current) {
        cameraTransitionRef.current.active = false;
      }
      if (cardsGroupRef.current?.userData?.finishIntro) {
        cardsGroupRef.current.userData.finishIntro();
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('user-3d-interacted'));
      }
      onUserInteractionRef.current?.();
    };

    controls.addEventListener('start', handleControlsStart);

    // 5. Post-Processing: UnrealBloomPass tuned for high-contrast celestial gold
    let composer: EffectComposer | null = null;
    try {
      const renderPass = new RenderPass(scene, camera);
      renderPass.clearColor = new THREE.Color(0, 0, 0);
      renderPass.clearAlpha = 0;
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        bloomStrength || 0.36, // strength (crisp celestial glow, no foggy blowout)
        0.26, // radius
        0.88  // threshold (sharp starbursts, cybernetic wireframes & core nodes bloom)
      );
      bloomPassRef.current = bloomPass;
      const outputPass = new OutputPass();

      // Guarantee that the 3D entity, golden bloom halo, cybernetic wireframe, glowing nodes,
      // and comic cards are 100% solid and visible across all laptop and desktop compositors,
      // preventing the transparent canvas from squashing additive bloom into 3% opacity ghosts.
      outputPass.material.fragmentShader = outputPass.material.fragmentShader.replace(
        /}\s*$/,
        `  float maxColor = max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b));
  float lumAlpha = smoothstep(0.002, 0.08, maxColor);
  gl_FragColor.a = max(gl_FragColor.a, lumAlpha);
}`
      );

      // Safe cross-device render target: Use HalfFloatType on WebGL2 devices that support it,
      // and smoothly fallback to UnsignedByteType on WebGL1 or budget devices so EffectComposer never crashes
      const isFloatSupported = renderer.capabilities.isWebGL2 || !!renderer.extensions.get('OES_texture_half_float');
      const targetType = isFloatSupported ? THREE.HalfFloatType : THREE.UnsignedByteType;
      const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        type: targetType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: false,
      });

      composer = new EffectComposer(renderer, renderTarget);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);
      composer.addPass(outputPass);
      composerRef.current = composer;
    } catch (err) {
      console.warn('EffectComposer creation failed, falling back to direct renderer:', err);
      composer = null;
    }

    // 6. Lighting: Tuned for dramatic muscular definition and golden specular luster
    // Subtle neutral dark ambient
    const ambientLight = new THREE.AmbientLight(0x151515, 0.4);
    scene.add(ambientLight);

    // Warm golden key light from upper right
    const sunLight = new THREE.DirectionalLight(0xffe28a, 1.4);
    sunLight.position.set(2.5, 3.8, 3.2);
    scene.add(sunLight);

    // Deep amber rim light from rear left to carve out muscular silhouette
    const rimLight = new THREE.DirectionalLight(0xff9900, 1.7);
    rimLight.position.set(-3.0, 2.5, -2.8);
    scene.add(rimLight);

    // Subtle dark fill light from lower left
    const fillLight = new THREE.DirectionalLight(0x22222e, 0.5);
    fillLight.position.set(-2.5, -0.8, 2.0);
    scene.add(fillLight);

    // Ground portal upward glow (gentle, no blowout)
    const portalLight = new THREE.PointLight(0xffaa00, 0.6, 3.5, 1.2);
    portalLight.position.set(0, 0.15, 0);
    scene.add(portalLight);

    // 7. Celestial Spherical Environment Map (Enables true liquid-gold PBR specular reflections)
    try {
      createCelestialEnvironmentMap(renderer, scene);
    } catch (err) {
      console.warn('Environment map generation warning:', err);
    }

    // 8. Ground Energy Portal (Concentric Rings under feet)
    const portalGroup = createPortalRings();
    scene.add(portalGroup);
    portalGroupRef.current = portalGroup;

    // 10. Ribbons: Handled by React Bits InterferenceRibbons component in DOM layer behind entity
    ribbonsGroupRef.current = null;

    // 11. Floating Multiverse Comic Panels
    const cardsGroup = createFloatingComicPanels(scene, onSelectComic, camera, renderer.domElement);
    scene.add(cardsGroup);
    cardsGroupRef.current = cardsGroup;

    // 12. Solar Embers (Permanently removed)
    particlesGroupRef.current = null;

    // 13. Load 3D Model (male_body-compressed.glb by default, with fallback/toggle)
    setLoadingProgress(35);
    const gltfLoader = new GLTFLoader();
    try {
      gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    } catch (err) {
      console.warn('MeshoptDecoder setup warning:', err);
    }

    const isMaleBody = (modelSource || 'male_body') === 'male_body';
    const modelPath = isMaleBody ? '/models/male_body-compressed.glb' : '/models/superman_prime.glb';

    // Create golden materials with custom Fresnel & pulse shader injection
    const goldBodyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xd49a18),
      emissive: new THREE.Color(0x1f1001),
      roughness: 0.18,
      metalness: 0.95,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
      envMapIntensity: 2.0,
      transparent: true,
      opacity: hologramSkinOpacity,
    });

    const goldJointsMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xd49a18),
      emissive: new THREE.Color(0x1f1001),
      roughness: 0.18,
      metalness: 0.95,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
      envMapIntensity: 2.0,
      transparent: true,
      opacity: hologramSkinOpacity,
    });

    // Custom shader injection via onBeforeCompile
    const injectGoldShader = (mat: THREE.MeshPhysicalMaterial) => {
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = customUniformsRef.current.uTime;
        shader.uniforms.uGlowIntensity = customUniformsRef.current.uGlowIntensity;
        shader.uniforms.uThemeColor = customUniformsRef.current.uThemeColor;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `
          #include <common>
          varying vec3 vWorldPositionCustom;
          `
        );
        shader.vertexShader = shader.vertexShader.replace(
          '#include <worldpos_vertex>',
          `
          #include <worldpos_vertex>
          vWorldPositionCustom = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `
          #include <common>
          uniform float uTime;
          uniform float uGlowIntensity;
          uniform vec3 uThemeColor;
          varying vec3 vWorldPositionCustom;
          `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `
          #include <dithering_fragment>
          // Golden Fresnel Rim Glow (crisp definition on muscular contours)
          float fresnel = pow(1.0 - max(0.0, dot(normalize(vNormal), normalize(-vViewPosition))), 3.5);
          vec3 rimGlow = uThemeColor * fresnel * uGlowIntensity * 0.14;

          gl_FragColor.rgb += rimGlow;
          gl_FragColor.a = 1.0;
          `
        );
      };
    };

    injectGoldShader(goldBodyMaterial);
    injectGoldShader(goldJointsMaterial);
    materialsRef.current = [goldBodyMaterial, goldJointsMaterial];

    // Container for character and transformed artifacts
    const entityGroup = new THREE.Group();
    scene.add(entityGroup);
    characterGroupRef.current = entityGroup;

    // Sub-containers for seamless Metamorphosis cross-fade across 4 forms
    const humanoidContainer = new THREE.Group();
    humanoidContainer.scale.set(1.15, 1.15, 1.15);
    entityGroup.add(humanoidContainer);
    humanoidContainerRef.current = humanoidContainer;

    const flyingMachineContainer = new THREE.Group();
    entityGroup.add(flyingMachineContainer);
    flyingMachineContainerRef.current = flyingMachineContainer;
    flyingMachineContainer.visible = false;

    const watercraftContainer = new THREE.Group();
    entityGroup.add(watercraftContainer);
    watercraftContainerRef.current = watercraftContainer;
    watercraftContainer.visible = false;

    const neuralNetworkContainer = new THREE.Group();
    entityGroup.add(neuralNetworkContainer);
    neuralNetworkContainerRef.current = neuralNetworkContainer;
    neuralNetworkContainer.visible = false;

    if (typeof window !== 'undefined') {
      const debugWindow = window as LandingDebugWindow;
      debugWindow.__scene = scene;
      debugWindow.__flyingMachine = flyingMachineContainer;
      debugWindow.__watercraft = watercraftContainer;
      debugWindow.__neuralNetwork = neuralNetworkContainer;
      debugWindow.__humanoid = humanoidContainer;
      debugWindow.__entityGroup = entityGroup;
    }

    // Holographic Quantum Metamorphosis Shockwave Mesh
    const shockGeom = new THREE.TorusGeometry(1.0, 0.045, 16, 64);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xffea77,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      wireframe: true,
    });
    const shockMesh = new THREE.Mesh(shockGeom, shockMat);
    shockMesh.position.set(0, 1.35, 0);
    shockMesh.visible = false;
    entityGroup.add(shockMesh);
    morphShockwaveRef.current = shockMesh;

    // Helper to setup and wrap entity models with golden skin, wireframe mesh & glowing junction nodes
    const setupEntityModel = (
      modelScene: THREE.Group,
      targetDim: number,
      materialsList: THREE.Material[],
      wireMeshesList: THREE.LineSegments[],
      nodesList: THREE.Points[]
    ): THREE.Group => {
      modelScene.updateMatrixWorld(true);
      const b = new THREE.Box3().setFromObject(modelScene);
      const c = new THREE.Vector3();
      b.getCenter(c);
      const s = new THREE.Vector3();
      b.getSize(s);
      const maxD = Math.max(s.x, s.y, s.z);
      const scale = targetDim / (maxD || 1);
      modelScene.position.set(-c.x, -c.y, -c.z);

      modelScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (mesh.geometry) {
            mesh.geometry.computeVertexNormals();
          }

          // 1. Golden Celestial Physical Skin Material (cloned directly from humanoid body material for 100% color/reflection parity)
          const goldMat = goldBodyMaterial.clone();
          injectGoldShader(goldMat);
          mesh.material = goldMat;
          materialsList.push(goldMat);
          materialsRef.current.push(goldMat);

          // 2. Holographic Cybernetic Wireframe Mesh with traveling pulse & scanline shader
          // Skip dense tube sweeps (>25k verts) so they remain clean golden synaptic fibers without cage blowout
          if (mesh.geometry.attributes.position && mesh.geometry.attributes.position.count <= 25000) {
            const wireGeom = new THREE.WireframeGeometry(mesh.geometry);
            const wireUniforms = {
              uTime: { value: 0 },
              uNetworkIntensity: { value: hologramNetworkIntensityRef.current },
              uFlowSpeed: { value: hologramFlowSpeedRef.current },
              uGoldColor: customUniformsRef.current.uThemeColor,
              uCoreColor: { value: new THREE.Color(0xfffae0) },
              uScanlineEnabled: { value: showHologramScanlineRef.current ? 1.0 : 0.0 },
            };
            const wireMat = new THREE.ShaderMaterial({
              transparent: true,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              uniforms: wireUniforms,
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
                uniform float uScanlineEnabled;
                uniform vec3 uGoldColor;
                uniform vec3 uCoreColor;
                varying vec3 vWorldPosition;

                void main() {
                  float dist = length(vWorldPosition);
                  float wave = sin(dist * 10.0 - uTime * uFlowSpeed * 3.8);
                  float pulse = pow(max(0.0, wave), 5.0);

                  // Smooth vertical holographic scan sweep
                  float scanPeriod = fract(uTime * 0.15);
                  float scanY = scanPeriod * 3.5 - 0.2;
                  float scanWave = smoothstep(0.09, 0.0, abs(vWorldPosition.y - scanY)) * uScanlineEnabled;

                  // Subtle, delicate lines to prevent blinding overlap
                  float baseAlpha = 0.05 * uNetworkIntensity;
                  float pulseAlpha = (pulse * 0.16 + scanWave * 0.20) * uNetworkIntensity;
                  float totalAlpha = clamp(baseAlpha + pulseAlpha, 0.0, 0.55);

                  vec3 col = mix(uGoldColor, uCoreColor, clamp(pulse * 0.7 + scanWave * 0.5, 0.0, 0.6));
                  gl_FragColor = vec4(col * totalAlpha, clamp(totalAlpha * 2.5, 0.0, 0.90));
                }
              `,
            });
            const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
            wireMesh.userData.uniforms = wireUniforms;
            wireMesh.visible = hologramNetworkIntensityRef.current > 0.01;
            wireMeshesList.push(wireMesh);
            mesh.add(wireMesh);
          }

          // 3. Holographic Cosmic Junction Nodes (Sampled topological vertex points)
          if (mesh.geometry && mesh.geometry.attributes.position && mesh.geometry.attributes.position.count <= 25000) {
            const posAttr = mesh.geometry.attributes.position;
            const sampleStep = Math.max(1, Math.floor(posAttr.count / 25));
            const nodePositions: number[] = [];
            for (let i = 0; i < posAttr.count; i += sampleStep) {
              nodePositions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            }
            if (nodePositions.length > 0) {
              const nodeGeom = new THREE.BufferGeometry();
              nodeGeom.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
              const nodeUniforms = {
                uTime: { value: 0 },
                uNodesBrightness: { value: hologramNodesBrightnessRef.current },
                uFlowSpeed: { value: hologramFlowSpeedRef.current },
                uGoldColor: customUniformsRef.current.uThemeColor,
                uCoreColor: { value: new THREE.Color(0xfffae0) },
              };
              const nodeMat = new THREE.ShaderMaterial({
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                uniforms: nodeUniforms,
                vertexShader: `
                  uniform float uTime;
                  uniform float uFlowSpeed;
                  varying float vPulse;
                  void main() {
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    float dist = length(worldPos.xyz);
                    vPulse = pow(max(0.0, sin(dist * 8.0 - uTime * uFlowSpeed * 3.5)), 4.0);
                    vec4 mvPosition = viewMatrix * worldPos;
                    gl_PointSize = (5.0 + vPulse * 3.5) * (1.0 / max(0.2, -mvPosition.z));
                    gl_Position = projectionMatrix * mvPosition;
                  }
                `,
                fragmentShader: `
                  uniform vec3 uGoldColor;
                  uniform vec3 uCoreColor;
                  uniform float uNodesBrightness;
                  varying float vPulse;
                  void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) discard;
                    float intensity = (1.0 - smoothstep(0.0, 0.5, dist)) * (0.20 + vPulse * 0.35) * uNodesBrightness;
                    vec3 col = mix(uGoldColor, uCoreColor, clamp(vPulse * 0.7, 0.0, 0.5));
                    gl_FragColor = vec4(col * intensity, clamp(intensity * 3.0, 0.0, 0.95));
                  }
                `,
              });
              const nodesMesh = new THREE.Points(nodeGeom, nodeMat);
              nodesMesh.userData.uniforms = nodeUniforms;
              nodesMesh.visible = hologramNodesBrightnessRef.current > 0.01;
              nodesList.push(nodesMesh);
              mesh.add(nodesMesh);
            }
          }
        }
      });

      const wrapper = new THREE.Group();
      wrapper.scale.set(scale, scale, scale);
      wrapper.add(modelScene);
      return wrapper;
    };

    // Safety timeout: Guarantee that the loading screen is never stuck for more than 10s on slow networks
    const safetyTimeout = setTimeout(() => {
      if (!isLoadedRef.current) {
        console.info('Scene safety timeout reached: dismissing loading overlay');
        setLoadingProgress(100);
        isLoadedRef.current = true;
        setIsLoaded(true);
        if (typeof window !== 'undefined') {
          (window as unknown as { __SCENE_LOADED__: boolean }).__SCENE_LOADED__ = true;
        }
      }
    }, 10000);

    // Load humanoid primary model first for instant non-blocking initial render with automatic fallback
    const loadHumanoidModel = (targetPath: string, isFallback: boolean = false) => {
      setLoadingProgress(25);
      gltfLoader.load(
        targetPath,
        (humanoidGltf) => {
          if (isCancelled) return;
          setLoadingProgress(90);

          // ---------------------------------------------------------------------
          // 1. SETUP HUMANOID MODEL (male_body.glb / superman_prime.glb)
          // ---------------------------------------------------------------------
          const model = humanoidGltf.scene;

          if (isMaleBody && !isFallback) {
            model.updateMatrixWorld(true);
            let sourceGeom: THREE.BufferGeometry | null = null;
            model.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.material = goldBodyMaterial;
                if (mesh.geometry && !mesh.geometry.attributes.normal) {
                  mesh.geometry.computeVertexNormals();
                }
                if (!sourceGeom && mesh.geometry) {
                  // Clone geometry and apply mesh transform relative to model root
                  const cloned = mesh.geometry.clone();
                  mesh.updateWorldMatrix(true, false);
                  const relMatrix = new THREE.Matrix4().copy(model.matrixWorld).invert().multiply(mesh.matrixWorld);
                  cloned.applyMatrix4(relMatrix);
                  if (!cloned.attributes.normal) {
                    cloned.computeVertexNormals();
                  }

                  // Ensure UV coordinates exist for holographic contour shaders
                  if (!cloned.attributes.uv) {
                    const pos = cloned.attributes.position;
                    const uvs = new Float32Array(pos.count * 2);
                    for (let i = 0; i < pos.count; i++) {
                      const x = pos.getX(i);
                      const y = pos.getY(i);
                      const z = pos.getZ(i);
                      const u = (Math.atan2(x, z) / Math.PI) * 0.5 + 0.5;
                      const v = Math.min(1.0, Math.max(0.0, (y - 0.58) / 180.0));
                      uvs[i * 2] = u;
                      uvs[i * 2 + 1] = v;
                    }
                    cloned.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
                  }

                  sourceGeom = cloned;
                }
              }
            });

            model.scale.set(0.0132, 0.0132, 0.0132);
            model.position.set(0, 0.02, 0);
            humanoidContainer.add(model);

            if (sourceGeom) {
              try {
                const holo = buildHolographicHumanoid(sourceGeom, 0.0132, 0.02);
                humanoidContainer.add(holo.group);
                holographicLayersRef.current = holo;

                holo.setSkinOpacity(hologramSkinOpacityRef.current);
                holo.setNetworkIntensity(hologramNetworkIntensityRef.current);
                holo.setNodesBrightness(hologramNodesBrightnessRef.current);
                holo.setFlowSpeed(hologramFlowSpeedRef.current);
                holo.setChestCoreRadiance(hologramChestCoreRadianceRef.current);
                holo.setAuraVisible(showHologramAuraRef.current);
                holo.setScanlineEnabled(showHologramScanlineRef.current);
                holo.setThemeColor(new THREE.Color(customUniformsRef.current.uThemeColor.value));
              } catch (holoErr) {
                console.warn('Holographic shader layers generation warning:', holoErr);
              }
            }

            haloGroupRef.current = null;
            capeGroupRef.current = null;
            capeMeshRef.current = null;
          } else {
            model.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.material = (mesh.name === 'Beta_Joints') ? goldJointsMaterial : goldBodyMaterial;
              }
            });

            model.scale.set(1.4, 1.4, 1.4);
            model.position.set(0, 0.05, 0);
            humanoidContainer.add(model);

            const headBone = model.getObjectByName('mixamorigHead');
            const spine2Bone = model.getObjectByName('mixamorigSpine2');

            if (headBone) {
              const hair = createHeroicHair();
              headBone.add(hair);
              const eyes = createCelestialEyes();
              headBone.add(eyes);
            }

            if (spine2Bone) {
              const chestCore = createChestSunCore();
              spine2Bone.add(chestCore);
              chestCore.position.set(0, 0.15, 0.14);

              const chestLight = new THREE.PointLight(0xffea60, 1.2, 2.5, 1.2);
              chestCore.add(chestLight);
              chestCoreLightRef.current = chestLight;
            }

            const mixer = new THREE.AnimationMixer(model);
            mixerRef.current = mixer;

            if (humanoidGltf.animations && humanoidGltf.animations.length > 0) {
              const walkClip = humanoidGltf.animations[0];
              const hipPosTrack = walkClip.tracks.find((t) => t.name.includes('Hips.position'));
              if (hipPosTrack) {
                for (let i = 2; i < hipPosTrack.values.length; i += 3) {
                  hipPosTrack.values[i] = 0;
                }
              }
              const walkAction = mixer.clipAction(walkClip);
              walkActionRef.current = walkAction;
              walkAction.play();
              walkAction.paused = true;
              walkAction.time = 0.62;
              mixer.update(0);
            }
          }

          // Apply theme and dismiss loading screen immediately (< 1s initial load)
          applyThemeRef.current(themeRef.current);
          setLoadingProgress(100);
          isLoadedRef.current = true;
          setIsLoaded(true);
          if (typeof window !== 'undefined') {
            (window as unknown as { __SCENE_LOADED__: boolean }).__SCENE_LOADED__ = true;
          }

          // ---------------------------------------------------------------------
          // Stream remaining 3 models in the background asynchronously
          // ---------------------------------------------------------------------
          Promise.all([
            gltfLoader.loadAsync('/models/flying_machine-compressed.glb'),
            gltfLoader.loadAsync('/models/paddle_boat-compressed.glb'),
            gltfLoader.loadAsync('/models/artificial_neural_network_ann-compressed.glb'),
          ])
            .then(([machineGltf, boatGltf, annGltf]) => {
              if (isCancelled) return;

              // 2. SETUP FLYING MACHINE MODEL (/models/flying_machine-compressed.glb)
              const machineWrapper = setupEntityModel(
                machineGltf.scene,
                4.5,
                flyingMachineMaterialsRef.current,
                flyingMachineWireMeshesRef.current,
                flyingMachineNodesRef.current
              );
              machineWrapper.position.set(0, 1.70, 0);
              machineWrapper.rotation.y = -Math.PI / 2;
              machineWrapper.rotation.x = 0.38;

              const machineUnderGlow = new THREE.PointLight(0xffea60, 0.7, 4.0, 1.5);
              machineUnderGlow.position.set(0, 0.95, 0);
              flyingMachineContainer.add(machineUnderGlow);
              flyingMachineGlowLightsRef.current.push(machineUnderGlow);

              flyingMachineContainer.add(machineWrapper);
              flyingMachineWrapperRef.current = machineWrapper;

              // 3. SETUP WATERCRAFT MODEL (/models/paddle_boat-compressed.glb)
              const boatWrapper = setupEntityModel(
                boatGltf.scene,
                2.2,
                watercraftMaterialsRef.current,
                watercraftWireMeshesRef.current,
                watercraftNodesRef.current
              );
              boatWrapper.position.set(0, 1.95, 0);
              boatWrapper.rotation.y = -0.35;

              const boatUnderGlow = new THREE.PointLight(0xffea60, 0.6, 3.5, 1.5);
              boatUnderGlow.position.set(0, 1.20, 0);
              watercraftContainer.add(boatUnderGlow);
              watercraftGlowLightsRef.current.push(boatUnderGlow);

              watercraftContainer.add(boatWrapper);
              watercraftWrapperRef.current = boatWrapper;

              // 4. SETUP NEURAL NETWORK MODEL (/models/artificial_neural_network_ann-compressed.glb)
              const annWrapper = setupEntityModel(
                annGltf.scene,
                2.0,
                neuralNetworkMaterialsRef.current,
                neuralNetworkWireMeshesRef.current,
                neuralNetworkNodesRef.current
              );
              annWrapper.position.set(0, 2.00, 0);
              annWrapper.rotation.x = 0.25;

              const annUnderGlow = new THREE.PointLight(0xffea60, 0.7, 3.5, 1.5);
              annUnderGlow.position.set(0, 1.25, 0);
              neuralNetworkContainer.add(annUnderGlow);
              neuralNetworkGlowLightsRef.current.push(annUnderGlow);

              neuralNetworkContainer.add(annWrapper);
              neuralNetworkWrapperRef.current = annWrapper;

              secondaryModelsLoadedRef.current = true;
              applyThemeRef.current(themeRef.current);
            })
            .catch((err) => {
              console.warn('Background secondary models stream warning:', err);
            });
        },
        (xhr) => {
          if (xhr.total > 0) {
            const pct = Math.round(25 + (xhr.loaded / xhr.total) * 65);
            setLoadingProgress(Math.min(pct, 90));
          }
        },
        (err) => {
          if (isCancelled) return;
          console.error(`Failed to load humanoid model from ${targetPath}:`, err);
          if (!isFallback && targetPath !== '/models/superman_prime.glb') {
            console.info('Attempting fallback to /models/superman_prime.glb');
            loadHumanoidModel('/models/superman_prime.glb', true);
          } else {
            isLoadedRef.current = true;
            setIsLoaded(true);
          }
        }
      );
    };

    loadHumanoidModel(modelPath);

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 390);
      const h = containerRef.current.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 844);
      const isMob = w <= 860;
      camera.aspect = w / h;
      camera.fov = isMob ? 46 : 42;
      if (w > 860) {
        camera.setViewOffset(w, h, -w * 0.18, 0, w, h);
      } else {
        camera.clearViewOffset();
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) {
        composer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          handleResize();
        })
      : null;
    if (container && resizeObserver) {
      resizeObserver.observe(container);
    }

    // 17. Render Loop with Viewport Visibility Observer (Pauses when scrolled into #about)
    let isVisible = true;
    let isRunning = false;
    let lastTime = performance.now();
    let accumulatedTime = 0;

    const animate = () => {
      if (!isVisible) {
        isRunning = false;
        return;
      }
      isRunning = true;
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      accumulatedTime += delta;
      const time = accumulatedTime;

      // Update uniforms
      customUniformsRef.current.uTime.value = time;

      // Update animation mixer if active
      if (mixerRef.current && walkActionRef.current && !walkActionRef.current.paused) {
        mixerRef.current.update(delta);
      }

      // Rotate halo corona
      if (haloGroupRef.current) {
        haloGroupRef.current.rotation.z = time * 0.4;
      }

      // Animate energy portal ripples and rotating rune rings
      if (portalGroupRef.current) {
        portalGroupRef.current.children.forEach((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms?.uTime) {
            (mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
          }
        });
        const rings = portalGroupRef.current.children;
        if (rings[10]) rings[10].rotation.z = time * 0.15;
        if (rings[11]) rings[11].rotation.z = -time * 0.12;
      }

      // Animate iridescent ribbons (silky flutter is driven by vertex shader uTime)
      if (ribbonsGroupRef.current) {
        ribbonsGroupRef.current.children.forEach((ribbon, idx) => {
          const mesh = ribbon as THREE.Mesh;
          // Very subtle micro-sway, leaving the spline wrap pinned in place
          mesh.position.y = Math.sin(time * 0.6 + idx * 1.2) * 0.012;
          if (mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms?.uTime) {
            (mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
          }
        });
      }

      // Animate golden cape flutter
      if (capeGroupRef.current && capeGroupRef.current.visible && capeMeshRef.current && capeMeshRef.current.geometry) {
        const capeGeom = capeMeshRef.current.geometry as THREE.BufferGeometry;
        const posAttr = capeGeom.attributes?.position;
        if (posAttr) {
          for (let i = 0; i < posAttr.count; i++) {
            const y = posAttr.getY(i);
            const x = posAttr.getX(i);
            // More flutter at the bottom of the cape
            const factor = Math.max(0, -y);
            const z = Math.sin(time * 3.5 + y * 2.5 + x) * 0.06 * factor +
                      Math.cos(time * 2.2 + x * 3.0) * 0.03 * factor;
            posAttr.setZ(i, z);
          }
          posAttr.needsUpdate = true;
          capeGeom.computeVertexNormals();
        }
      }

      // Animate floating comic panels in 3D orbit around Superman Prime
      if (cardsGroupRef.current) {
        const pivot = cardsGroupRef.current.userData.pivotGroup as THREE.Group | undefined;
        const isDragging = cardsGroupRef.current.userData.isDragging;
        const isHovered = cardsGroupRef.current.userData.isHovered;
        const isIntroActive = cardsGroupRef.current.userData.isIntroActive ?? false;

        if (isIntroActive) {
          // Trail entrance animation from top-left corner
          const meshes = (cardsGroupRef.current.userData.cardMeshes || []) as THREE.Mesh[];
          let allLanded = true;
          const dummy = new THREE.Object3D();

          meshes.forEach((card, idx) => {
            const uData = card.userData;
            if (uData.hasLanded) return;

            const cardTime = time - (uData.startDelay || 0);
            if (cardTime < 0) {
              card.visible = false;
              allLanded = false;
              return;
            }

            allLanded = false;
            card.visible = true;

            const rawProgress = Math.min(1.0, cardTime / (uData.duration || 2.25));
            // Cubic ease-in-out curve for majestic aerodynamic swoop
            const progress = rawProgress < 0.5
              ? 4 * rawProgress * rawProgress * rawProgress
              : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

            if (uData.flightCurve) {
              const pt = uData.flightCurve.getPointAt(progress);
              card.position.copy(pt);

              // Orientation along trajectory tangent
              const tangent = uData.flightCurve.getTangentAt(progress);
              dummy.position.copy(pt);
              dummy.lookAt(pt.clone().add(tangent));
              dummy.rotateY(Math.PI / 2); // Aerodynamic edge-forward flight

              if (progress < 0.78) {
                card.quaternion.copy(dummy.quaternion);
              } else {
                // Smooth slerp blending into final circular orbit rotation
                const blend = (progress - 0.78) / 0.22;
                const easeBlend = blend * blend * (3 - 2 * blend);
                card.quaternion.slerpQuaternions(dummy.quaternion, uData.targetQuaternion, easeBlend);
              }
            }

            // Scale animation: expands from small in distance, subtle elastic settle on landing
            let s = uData.baseScale;
            if (progress < 0.25) {
              s = uData.baseScale * (0.35 + 0.65 * (progress / 0.25));
            } else if (progress > 0.94) {
              s = uData.baseScale * (1.0 + 0.06 * Math.sin(((progress - 0.94) / 0.06) * Math.PI));
            }
            card.scale.set(s, s, s);

            // Landing settle
            if (rawProgress >= 0.99 && !uData.hasChimed) {
              uData.hasChimed = true;
            }

            if (rawProgress >= 1.0) {
              uData.hasLanded = true;
              card.position.copy(uData.targetPosition);
              card.quaternion.copy(uData.targetQuaternion);
              card.scale.set(uData.baseScale, uData.baseScale, uData.baseScale);
            }
          });

          if (allLanded) {
            cardsGroupRef.current.userData.isIntroActive = false;
          }
        } else {
          if (pivot && !isDragging && !isHovered) {
            // In cinematic orbit, keep cards anchored in 3D world space so the camera flies PAST them!
            if (cameraPresetRef.current !== 'orbit') {
              pivot.rotation.y += delta * 0.045; // Smooth majestic continuous orbit
            }
          }

          const meshes = (cardsGroupRef.current.userData.cardMeshes || []) as THREE.Mesh[];
          meshes.forEach((card, idx) => {
            const uData = card.userData;
            if (uData.targetPosition && uData.targetRotation) {
              card.position.lerp(uData.targetPosition, 0.08);
              card.rotation.x = THREE.MathUtils.lerp(card.rotation.x, uData.targetRotation.x, 0.08);
              card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, uData.targetRotation.y, 0.08);
              card.rotation.z = THREE.MathUtils.lerp(card.rotation.z, uData.targetRotation.z, 0.08);

              if (!uData.isHovered) {
                card.position.y += Math.sin(time * 1.5 + idx * 0.8) * 0.0025;
              }
            }
          });
        }
      }

      // Animate solar embers rising
      if (particlesGroupRef.current) {
        const positions = particlesGroupRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += delta * 0.6; // Rise up
          if (positions[i] > 5.0) {
            positions[i] = 0.0;
          }
        }
        particlesGroupRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 18. Autonomous 4-Stage Metamorphosis Cycle (4s Humanoid ➔ 4s Flying Machine ➔ 4s Watercraft ➔ 4s Neural Network ➔ Repeat)
      const HOLD_SECS = 4.0;
      const CROSSFADE_SECS = 1.0;

      if (isLoadedRef.current) {
        if (isTransitioningRef.current) {
          transitionProgressRef.current += delta / CROSSFADE_SECS;
          if (transitionProgressRef.current >= 1.0) {
            transitionProgressRef.current = 1.0;
            currentFormIdxRef.current = targetFormIdxRef.current;
            isTransitioningRef.current = false;
            formStayTimerRef.current = 0.0;
          }
        } else if (autoTransformRef.current) {
          formStayTimerRef.current += delta;
          if (formStayTimerRef.current >= HOLD_SECS) {
            const nextIdx = (currentFormIdxRef.current + 1) % 4;
            if (nextIdx !== 0 && !secondaryModelsLoadedRef.current) {
              formStayTimerRef.current = HOLD_SECS - 1.0;
            } else {
              formStayTimerRef.current = 0.0;
              currentFormIdxRef.current = targetFormIdxRef.current;
              targetFormIdxRef.current = nextIdx;
              isTransitioningRef.current = true;
              transitionProgressRef.current = 0.0;
              const nextForm = FORMS_SEQUENCE[nextIdx];
              prevEntityFormRef.current = nextForm;
              onEntityFormChangeRef.current?.(nextForm);
              playChimeForForm(nextForm);
            }
          }
        }
      }

      // Compute smooth alphas across all 4 forms
      const alphas = [0, 0, 0, 0];
      let transitionWireAlpha = 0;

      if (isTransitioningRef.current) {
        const rawP = Math.min(1.0, Math.max(0.0, transitionProgressRef.current));
        const ease = rawP * rawP * (3 - 2 * rawP); // Smooth cubic ease-in-out
        alphas[currentFormIdxRef.current] = 1.0 - ease;
        alphas[targetFormIdxRef.current] = ease;
        transitionWireAlpha = Math.sin(rawP * Math.PI) * 0.42;
      } else {
        alphas[currentFormIdxRef.current] = 1.0;
      }

      const [alphaHolo, alphaFly, alphaBoat, alphaAnn] = alphas;

      // 1. Update Humanoid: pure smooth fade away at full original scale (no shrinking)
      if (humanoidContainerRef.current) {
        humanoidContainerRef.current.visible = alphaHolo > 0.001;
        humanoidContainerRef.current.scale.set(1.15, 1.15, 1.15);

        const skinAlpha = hologramSkinOpacityRef.current * alphaHolo;
        goldBodyMaterial.opacity = skinAlpha;
        goldJointsMaterial.opacity = skinAlpha;
        goldBodyMaterial.depthWrite = skinAlpha > 0.35;
        goldJointsMaterial.depthWrite = skinAlpha > 0.35;

        if (holographicLayersRef.current) {
          holographicLayersRef.current.setSkinOpacity(skinAlpha);
          holographicLayersRef.current.setNetworkIntensity(hologramNetworkIntensityRef.current * alphaHolo);
          holographicLayersRef.current.setNodesBrightness(hologramNodesBrightnessRef.current * alphaHolo);
          holographicLayersRef.current.setFlowSpeed(hologramFlowSpeedRef.current);
          holographicLayersRef.current.setChestCoreRadiance(hologramChestCoreRadianceRef.current * alphaHolo);
          holographicLayersRef.current.setScanlineEnabled(showHologramScanlineRef.current);
          holographicLayersRef.current.setAuraVisible(showHologramAuraRef.current);
          holographicLayersRef.current.group.visible = alphaHolo > 0.001;
        }
      }

      // Helper to update Golden Skin, Holographic Wireframe, Junction Nodes & Radiance for morphed entities
      const updateEntityMaterials = (
        container: THREE.Group | null,
        alpha: number,
        materialsList: THREE.Material[],
        wireMeshesList: THREE.LineSegments[],
        nodesList: THREE.Points[],
        glowLightsList: THREE.PointLight[]
      ) => {
        if (!container) return;
        const isVis = alpha > 0.001;
        container.visible = isVis;
        if (!isVis) return;

        // 1. Effective skin opacity is driven directly by Translucent Skin Opacity slider
        const effectiveSkinOpacity = hologramSkinOpacityRef.current * alpha;
        const isSolid = effectiveSkinOpacity > 0.35;

        materialsList.forEach((m) => {
          m.opacity = effectiveSkinOpacity;
          (m as THREE.MeshPhysicalMaterial).depthWrite = isSolid;
          m.transparent = true;
          m.needsUpdate = true;
        });

        // 2. Update holographic wireframe intensity and traveling pulse speed
        const effectiveNetworkIntensity =
          (hologramNetworkIntensityRef.current + transitionWireAlpha * 1.8) * alpha;

        wireMeshesList.forEach((w) => {
          w.visible = effectiveNetworkIntensity > 0.01;
          const u = w.userData.uniforms;
          if (u) {
            u.uTime.value = time;
            u.uNetworkIntensity.value = effectiveNetworkIntensity;
            u.uFlowSpeed.value = hologramFlowSpeedRef.current;
            if (u.uScanlineEnabled) {
              u.uScanlineEnabled.value = showHologramScanlineRef.current ? 1.0 : 0.0;
            }
          }
        });

        // 3. Update glowing cosmic junction nodes brightness
        const effectiveNodesBrightness = hologramNodesBrightnessRef.current * alpha;
        nodesList.forEach((n) => {
          n.visible = effectiveNodesBrightness > 0.01;
          const u = n.userData.uniforms;
          if (u) {
            u.uTime.value = time;
            u.uNodesBrightness.value = effectiveNodesBrightness;
            u.uFlowSpeed.value = hologramFlowSpeedRef.current;
          }
        });

        // 4. Update core underglow point lights radiance
        const effectiveRadiance = hologramChestCoreRadianceRef.current * alpha;
        glowLightsList.forEach((light) => {
          light.intensity = effectiveRadiance * 0.75;
        });
      };

      // 2. Update Flying Machine: hovering and gentle aerodynamic banking
      updateEntityMaterials(
        flyingMachineContainerRef.current,
        alphaFly,
        flyingMachineMaterialsRef.current,
        flyingMachineWireMeshesRef.current,
        flyingMachineNodesRef.current,
        flyingMachineGlowLightsRef.current
      );
      if (flyingMachineWrapperRef.current && alphaFly > 0.001) {
        flyingMachineWrapperRef.current.position.y = 1.70 + Math.sin(time * 1.4) * 0.06;
        flyingMachineWrapperRef.current.rotation.x = 0.38 + Math.sin(time * 0.8) * 0.03;
        flyingMachineWrapperRef.current.rotation.y = -Math.PI / 2 + Math.sin(time * 0.7) * 0.04;
        flyingMachineWrapperRef.current.rotation.z = Math.sin(time * 1.1) * 0.035;
      }

      // 3. Update Watercraft: buoyant oceanic rocking (elevated levitation above ground platform)
      updateEntityMaterials(
        watercraftContainerRef.current,
        alphaBoat,
        watercraftMaterialsRef.current,
        watercraftWireMeshesRef.current,
        watercraftNodesRef.current,
        watercraftGlowLightsRef.current
      );
      if (watercraftWrapperRef.current && alphaBoat > 0.001) {
        watercraftWrapperRef.current.position.y = 1.95 + Math.sin(time * 1.3) * 0.05;
        watercraftWrapperRef.current.rotation.x = Math.sin(time * 1.1) * 0.04;
        watercraftWrapperRef.current.rotation.z = Math.sin(time * 0.95 + 1.0) * 0.04;
        watercraftWrapperRef.current.rotation.y = Math.sin(time * 0.35) * 0.08 - 0.25;
      }

      // 4. Update Neural Network: quantum spin & synaptic oscillation (elevated floating core)
      updateEntityMaterials(
        neuralNetworkContainerRef.current,
        alphaAnn,
        neuralNetworkMaterialsRef.current,
        neuralNetworkWireMeshesRef.current,
        neuralNetworkNodesRef.current,
        neuralNetworkGlowLightsRef.current
      );
      if (neuralNetworkWrapperRef.current && alphaAnn > 0.001) {
        neuralNetworkWrapperRef.current.position.y = 2.00 + Math.sin(time * 1.2) * 0.05;
        neuralNetworkWrapperRef.current.rotation.y = time * 0.22;
        neuralNetworkWrapperRef.current.rotation.x = 0.25 + Math.sin(time * 0.6) * 0.04;
        neuralNetworkWrapperRef.current.rotation.z = Math.sin(time * 0.8) * 0.03;
      }

      // No jarring shockwave expansion - pure elegant cross-fade
      if (morphShockwaveRef.current) {
        morphShockwaveRef.current.visible = false;
      }

      // Animate TECHNEX 2026 Holographic Humanoid (Flowing energy, nodes pulse, scanline)
      if (holographicLayersRef.current && alphaHolo > 0.001) {
        holographicLayersRef.current.update(time, delta);
      }

      // Subtle entity levitation float when hovering or walking
      if (characterGroupRef.current) {
        if (poseModeRef.current === 'hover') {
          characterGroupRef.current.position.y = 0.08 + Math.sin(time * 1.5) * 0.06;
          characterGroupRef.current.rotation.y = 0;
        } else if (poseModeRef.current === 'walk' && isMaleBody) {
          characterGroupRef.current.position.y = 0.04 + Math.sin(time * 2.8) * 0.03;
          characterGroupRef.current.rotation.y = Math.sin(time * 1.4) * 0.05;
        } else if (poseModeRef.current === 'exact') {
          characterGroupRef.current.position.y = 0;
          characterGroupRef.current.rotation.y = 0;
        }
      }

      // Camera Preset Transition & Cinematic Orbit Controller
      const cam = cameraRef.current;
      const trans = cameraTransitionRef.current;

      if (trans && trans.active && cam) {
        const elapsed = performance.now() - trans.startTime;
        const progress = Math.min(elapsed / trans.duration, 1.0);
        // Smooth cubic ease-in-out for majestic camera fly-out
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        cam.position.lerpVectors(trans.startPos, trans.targetPos, ease);
        controls.target.lerpVectors(trans.startTarget, trans.targetLook, ease);
        controls.update(delta);

        if (progress >= 1.0) {
          trans.active = false;
          if (trans.isOrbit || cameraPresetRef.current === 'orbit') {
            const maxHalfArc = (Math.PI / 2) * 0.92;
            const dx = cam.position.x;
            const dz = Math.max(0.01, cam.position.z);
            const currentAngle = Math.atan2(dx, dz);
            const clamped = Math.max(-maxHalfArc * 0.98, Math.min(maxHalfArc * 0.98, currentAngle));
            orbitPhaseRef.current = Math.asin(clamped / maxHalfArc);
          }
        }
      } else if (cameraPresetRef.current === 'orbit' && cam) {
        // Continuous 180° Horizontal Cinematic Orbit:
        // Sweeps strictly horizontally across 180 degrees in front of the entity.
        // Absolutely NO vertical (up/down) movement, NO zoom breathing, NO banking tilt.
        const orbitSpeed = 0.40; // Majestic steady sweep speed (~16s full cycle)
        orbitPhaseRef.current += delta * orbitSpeed;

        const maxHalfArc = (Math.PI / 2) * 0.92; // Frontal arc sweep
        const theta = Math.sin(orbitPhaseRef.current) * maxHalfArc;

        const orbitR = 5.2; // Constant radius matching default view
        const orbitY = 1.48; // Constant eye-level height (STRICTLY FIXED - NO UP/DOWN)

        const targetX = Math.sin(theta) * orbitR;
        const targetZ = Math.cos(theta) * orbitR;

        cam.position.set(targetX, orbitY, targetZ);

        // Fixed look-at target focused at character center
        controls.target.set(0, 1.42, 0);
        cam.lookAt(controls.target);
        cam.rotation.z = 0; // Perfectly level horizon (NO ROLL/TILT)
      } else {
        controls.update(delta);
      }

      if (composer) {
        try {
          composer.render();
        } catch {
          renderer.render(scene, camera);
        }
      } else {
        renderer.render(scene, camera);
      }
    };

    const viewportObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !isRunning && !document.hidden) {
            lastTime = performance.now();
            animate();
          }
        });
      },
      { threshold: 0.02 }
    );

    if (container) {
      viewportObserver.observe(container);
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        isRunning = false;
      } else {
        isVisible = true;
        if (!isRunning) {
          lastTime = performance.now();
          animate();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animate();

    return () => {
      isCancelled = true;
      isVisible = false;
      clearTimeout(safetyTimeout);
      viewportObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      if (cardsGroupRef.current?.userData?.dispose) {
        cardsGroupRef.current.userData.dispose();
      }
      controls.removeEventListener('start', handleControlsStart);
      controls.dispose();
      if (composer) {
        composer.dispose();
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelSource]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'transparent',
        cursor: 'grab',
      }}
    >
      {/* Loading Overlay */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(5, 4, 8, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            gap: '22px',
          }}
        >
          {/* Central Logo Container with Champagne Gold Orbital Spinners */}
          <div
            style={{
              position: 'relative',
              width: '110px',
              height: '110px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Outer Rotating Champagne Gold Orbital Ring */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px dashed rgba(217, 173, 98, 0.45)',
                borderTopColor: '#d9ad62',
                borderRightColor: '#ecd5a6',
                animation: 'spin 4s linear infinite',
                boxShadow: '0 0 28px rgba(217, 173, 98, 0.28)',
              }}
            />
            {/* Fast Inner Champagne Gold Accent Ring */}
            <div
              style={{
                position: 'absolute',
                inset: '8px',
                borderRadius: '50%',
                border: '1.5px solid rgba(217, 173, 98, 0.2)',
                borderTopColor: '#d9ad62',
                animation: 'spinReverse 2s linear infinite',
              }}
            />
            {/* Centered Technex Logo */}
            <div
              style={{
                position: 'relative',
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle, rgba(217, 173, 98, 0.15) 0%, rgba(10, 8, 14, 0.8) 75%)',
                boxShadow: 'inset 0 0 16px rgba(217, 173, 98, 0.25)',
              }}
            >
              <img
                src="/logo_topnav.webp"
                alt="TECHNEX Logo"
                style={{
                  width: '85%',
                  height: '85%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 12px rgba(217, 173, 98, 0.65))',
                }}
              />
            </div>
          </div>

          {/* TECHNEX 2026 LOADING Heading */}
          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: "var(--font-barge), 'Barge', 'Outfit', sans-serif",
                fontSize: '26px',
                fontWeight: 900,
                letterSpacing: '5px',
                textTransform: 'uppercase',
                margin: 0,
                background: 'linear-gradient(135deg, #f5e5c9 0%, #d9ad62 50%, #b3883b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 14px rgba(217, 173, 98, 0.45))',
              }}
            >
              TECHNEX 2026 LOADING
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#d9ad62',
                  boxShadow: '0 0 8px #d9ad62',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  color: 'rgba(217, 173, 98, 0.85)',
                  letterSpacing: '2.5px',
                  fontFamily: 'var(--font-mono, monospace)',
                  textTransform: 'uppercase',
                }}
              >
                INITIALIZING MULTIVERSE ARCHITECTURE
              </span>
            </div>
          </div>

          {/* High-Tech Champagne Gold Progress Bar */}
          <div
            style={{
              position: 'relative',
              width: '280px',
              height: '5px',
              background: 'rgba(217, 173, 98, 0.12)',
              borderRadius: '3px',
              border: '1px solid rgba(217, 173, 98, 0.25)',
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div
              style={{
                width: `${loadingProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #966f2d 0%, #d9ad62 60%, #f5e5c9 100%)',
                transition: 'width 0.25s ease-out',
                boxShadow: '0 0 12px rgba(217, 173, 98, 0.8)',
              }}
            />
          </div>

          {/* Progress Percentage Badge */}
          <p
            style={{
              margin: 0,
              fontSize: '11.5px',
              color: 'rgba(217, 173, 98, 0.75)',
              letterSpacing: '1.8px',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            SVPCET NAGPUR • {loadingProgress}% COMPLETE
          </p>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spinReverse {
          to {
            transform: rotate(-360deg);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

// ==========================================
// PROCEDURAL GEOMETRY & SHADER HELPERS
// ==========================================

/**
 * Creates dynamic Celestial PMREM Spherical Environment Map for true PBR liquid-gold reflections
 */
function createCelestialEnvironmentMap(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  const envGeom = new THREE.SphereGeometry(100, 32, 32);
  const envMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: `
      varying vec3 vWorldDirection;
      void main() {
        vWorldDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vWorldDirection;
      void main() {
        vec3 d = normalize(vWorldDirection);
        // Golden Key Sun light reflection (upper front-right)
        vec3 sunDir = normalize(vec3(0.5, 0.7, 0.6));
        float sunDot = max(0.0, dot(d, sunDir));
        float sunSpec = pow(sunDot, 64.0) * 12.0 + pow(sunDot, 12.0) * 3.5;

        // Rim reflection source (rear left)
        vec3 rimDir = normalize(vec3(-0.6, 0.5, -0.6));
        float rimDot = max(0.0, dot(d, rimDir));
        float rimSpec = pow(rimDot, 32.0) * 6.0;

        // Ground portal reflection
        float groundGlow = max(0.0, -d.y) * 2.0;

        // Deep space void ambient
        vec3 deepVoid = vec3(0.001, 0.001, 0.001);
        vec3 darkNebula = vec3(0.004, 0.004, 0.006);
        vec3 goldLuster = vec3(1.0, 0.82, 0.28);
        vec3 amberLuster = vec3(0.9, 0.48, 0.1);

        vec3 col = mix(deepVoid, darkNebula, d.y * 0.5 + 0.5);
        col += goldLuster * sunSpec;
        col += amberLuster * rimSpec;
        col += goldLuster * groundGlow * 0.6;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const envMesh = new THREE.Mesh(envGeom, envMat);
  envScene.add(envMesh);

  const envRT = pmremGenerator.fromScene(envScene);
  scene.environment = envRT.texture;
  pmremGenerator.dispose();
  envGeom.dispose();
  envMat.dispose();
}

/**
 * Creates sculpted celestial golden hair with Superman's iconic swept-back crest
 */
function createHeroicHair(): THREE.Group {
  const hair = new THREE.Group();
  const hairMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xdca522),
    emissive: new THREE.Color(0x301802),
    roughness: 0.24,
    metalness: 0.92,
    clearcoat: 0.8,
  });

  // Top swept-back volume
  const topGeom = new THREE.SphereGeometry(0.125, 24, 24);
  topGeom.scale(0.85, 0.75, 1.15);
  topGeom.translate(0, 0.09, -0.02);
  const topMesh = new THREE.Mesh(topGeom, hairMat);
  hair.add(topMesh);

  // Classic Superman front curl / crest
  const curlGeom = new THREE.TorusGeometry(0.03, 0.009, 12, 24, Math.PI * 1.3);
  const curlMesh = new THREE.Mesh(curlGeom, hairMat);
  curlMesh.position.set(0.015, 0.135, 0.095);
  curlMesh.rotation.set(0.4, 0.2, -0.8);
  hair.add(curlMesh);

  // Sideburns
  const sideGeom = new THREE.CylinderGeometry(0.012, 0.006, 0.09, 8);
  sideGeom.rotateX(0.2);
  const leftSide = new THREE.Mesh(sideGeom, hairMat);
  leftSide.position.set(-0.095, 0.05, 0.02);
  hair.add(leftSide);

  const rightSide = new THREE.Mesh(sideGeom, hairMat);
  rightSide.position.set(0.095, 0.05, 0.02);
  hair.add(rightSide);

  // Sculpted heroic jaw and chin definition
  const jawGeom = new THREE.ConeGeometry(0.045, 0.08, 5);
  jawGeom.rotateX(Math.PI);
  const jawMesh = new THREE.Mesh(jawGeom, hairMat);
  jawMesh.position.set(0, -0.04, 0.08);
  hair.add(jawMesh);

  return hair;
}

/**
 * Creates radiant glowing celestial eyes
 */
function createCelestialEyes(): THREE.Group {
  const eyes = new THREE.Group();
  const eyeGeom = new THREE.SphereGeometry(0.015, 12, 12);
  eyeGeom.scale(1.4, 0.7, 0.5); // Almond superhero shape
  const eyeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
  leftEye.position.set(-0.038, 0.075, 0.11);
  eyes.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
  rightEye.position.set(0.038, 0.075, 0.11);
  eyes.add(rightEye);

  return eyes;
}

/**
 * Creates Divine Halo Ring (Solar Corona) behind Head
 */
function createDivineHalo(): THREE.Group {
  const haloGroup = new THREE.Group();

  // Outer glowing ring
  const torusGeom1 = new THREE.TorusGeometry(0.36, 0.010, 16, 64);
  const torusMat1 = new THREE.MeshStandardMaterial({
    color: 0xffea77,
    emissive: 0xffb700,
    emissiveIntensity: 1.0,
    metalness: 0.9,
    roughness: 0.1,
  });
  const ring1 = new THREE.Mesh(torusGeom1, torusMat1);
  haloGroup.add(ring1);

  // Inner accent ring
  const torusGeom2 = new THREE.TorusGeometry(0.31, 0.005, 16, 64);
  const torusMat2 = new THREE.MeshBasicMaterial({
    color: 0xfff6cf,
  });
  const ring2 = new THREE.Mesh(torusGeom2, torusMat2);
  haloGroup.add(ring2);

  // Corona light disc (radial gradient halo glow)
  const discGeom = new THREE.PlaneGeometry(0.72, 0.72);
  const discMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
        float dist = distance(vUv, vec2(0.5));
        float alpha = smoothstep(0.48, 0.15, dist) * 0.35;
        float ringPeak = exp(-pow((dist - 0.34) * 18.0, 2.0)) * 0.55;
        vec3 haloColor = mix(vec3(1.0, 0.65, 0.15), vec3(1.0, 0.95, 0.6), ringPeak);
        gl_FragColor = vec4(haloColor, (alpha + ringPeak) * 0.7);
      }
    `,
  });
  const disc = new THREE.Mesh(discGeom, discMat);
  disc.position.z = -0.01;
  haloGroup.add(disc);

  return haloGroup;
}

/**
 * Creates Chest Solar Core Emblem (Concentric Sun Crest)
 */
function createChestSunCore(): THREE.Group {
  const coreGroup = new THREE.Group();

  // Central golden sphere (the living Super-Sun heart)
  const coreGeom = new THREE.SphereGeometry(0.045, 24, 24);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  const core = new THREE.Mesh(coreGeom, coreMat);
  coreGroup.add(core);

  // Concentric golden bevel ring 1
  const ringGeom1 = new THREE.TorusGeometry(0.075, 0.009, 16, 32);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xd9ad62,
    emissive: 0xb88d44,
    emissiveIntensity: 0.9,
    metalness: 0.95,
    roughness: 0.15,
  });
  const ring1 = new THREE.Mesh(ringGeom1, ringMat);
  coreGroup.add(ring1);

  // Concentric golden bevel ring 2
  const ringGeom2 = new THREE.TorusGeometry(0.11, 0.006, 16, 32);
  const ring2 = new THREE.Mesh(ringGeom2, ringMat);
  coreGroup.add(ring2);

  // Radiant Solar Flare Rays (diamond fins around crest)
  const raysCount = 12;
  const rayGeom = new THREE.ConeGeometry(0.016, 0.12, 4);
  rayGeom.rotateZ(Math.PI);
  const rayMat = new THREE.MeshBasicMaterial({
    color: 0xffea77,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  });

  for (let i = 0; i < raysCount; i++) {
    const angle = (i / raysCount) * Math.PI * 2;
    const ray = new THREE.Mesh(rayGeom, rayMat);
    ray.position.set(Math.cos(angle) * 0.11, Math.sin(angle) * 0.11, 0);
    ray.rotation.z = angle + Math.PI / 2;
    coreGroup.add(ray);
  }

  // Chest corona glow billboard
  const glowGeom = new THREE.PlaneGeometry(0.24, 0.24);
  const glowMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
        float dist = distance(vUv, vec2(0.5));
        float glow = exp(-dist * 12.0) * 0.45;
        vec3 color = vec3(1.0, 0.85, 0.4);
        gl_FragColor = vec4(color, glow);
      }
    `,
  });
  const glowMesh = new THREE.Mesh(glowGeom, glowMat);
  glowMesh.position.z = 0.02;
  coreGroup.add(glowMesh);

  return coreGroup;
}

/**
 * Creates Flowing Golden Cape with Shoulder Clasps
 */
function createGoldenCape(): THREE.Group {
  const capeGroup = new THREE.Group();

  // Shoulder clasps
  const claspGeom = new THREE.TorusGeometry(0.04, 0.012, 16, 24);
  const claspMat = new THREE.MeshStandardMaterial({
    color: 0xffea77,
    emissive: 0xff9900,
    metalness: 0.95,
    roughness: 0.15,
  });

  const leftClasp = new THREE.Mesh(claspGeom, claspMat);
  leftClasp.position.set(-0.16, 0.08, 0.06);
  leftClasp.rotation.x = Math.PI / 2;
  capeGroup.add(leftClasp);

  const rightClasp = new THREE.Mesh(claspGeom, claspMat);
  rightClasp.position.set(0.16, 0.08, 0.06);
  rightClasp.rotation.x = Math.PI / 2;
  capeGroup.add(rightClasp);

  // Cape geometry: subdivided plane for vertex wind flutter
  const capeGeom = new THREE.PlaneGeometry(0.72, 1.45, 20, 32);
  capeGeom.translate(0, -0.72, 0);

  const capeMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xdca522),
    emissive: new THREE.Color(0x381e02),
    roughness: 0.28,
    metalness: 0.9,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide,
  });

  const capeMesh = new THREE.Mesh(capeGeom, capeMat);
  capeMesh.name = 'capePlane';
  capeMesh.castShadow = true;
  capeGroup.add(capeMesh);

  return capeGroup;
}

/**
 * Creates Concentric Energy Portal Platform (exact liquid-gold ripples beneath feet)
 */
function createPortalRings(): THREE.Group {
  const portal = new THREE.Group();
  portal.position.set(0, 0.015, 0);

  // 1. Procedural Concentric Liquid-Gold Ripple Plane
  const rippleGeom = new THREE.CircleGeometry(2.2, 64);
  rippleGeom.rotateX(-Math.PI / 2);
  const rippleMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      uniform float uTime;

      void main() {
        float dist = length(vWorldPos.xz);
        if (dist > 2.15) discard;
        
        // Footprint stepping centers
        vec2 rightFoot = vec2(0.06, 0.08);
        vec2 leftFoot = vec2(-0.06, -0.12);
        float dRight = length(vWorldPos.xz - rightFoot);
        float dLeft = length(vWorldPos.xz - leftFoot);

        // 10 Delicate Concentric Liquid-Gold Ripple Wavefronts
        float rings = 0.0;
        float radii[10] = float[10](0.16, 0.28, 0.42, 0.58, 0.76, 0.96, 1.18, 1.42, 1.68, 1.98);
        for (int i = 0; i < 10; i++) {
          float r = radii[i];
          float w = 0.005 + float(i) * 0.0012;
          float ring = smoothstep(w, 0.0, abs(dist - r));
          // Outward propagating wave pulse
          float pulse = sin(dist * 24.0 - uTime * 3.0 + float(i) * 0.5) * 0.3 + 0.7;
          rings += ring * pulse;
        }

        // 36 Solar Energy Rays / Compass Spokes radiating outward
        float angle = atan(vWorldPos.z, vWorldPos.x);
        float spokes = pow(sin(angle * 18.0), 16.0) * smoothstep(0.12, 0.35, dist) * smoothstep(2.0, 0.85, dist);

        // Footstep solar radiant contact pools
        float stepGlow = exp(-dRight * 12.0) * 1.6 + exp(-dLeft * 10.0) * 1.2;

        // Ambient ground aura (subtle, transparent void preservation)
        float aura = exp(-dist * 3.4) * 0.25;

        vec3 coreColor = vec3(1.0, 0.98, 0.88); // brilliant white-gold core
        vec3 goldColor = vec3(1.0, 0.84, 0.25); // 853rd century golden ripples
        vec3 amberColor = vec3(1.0, 0.58, 0.14); // warm solar amber rays

        vec3 col = coreColor * stepGlow + goldColor * (rings * 1.4) + amberColor * (spokes * 0.85) + goldColor * aura;
        float alpha = clamp(stepGlow * 0.9 + rings * 0.95 + spokes * 0.6 + aura * 0.5, 0.0, 1.0) * smoothstep(2.15, 1.5, dist);

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
  const rippleMesh = new THREE.Mesh(rippleGeom, rippleMat);
  portal.add(rippleMesh);

  // 2. Physical 3D Torus Ripple Rings for crisp PBR specular definition
  const ringRadii = [0.16, 0.28, 0.42, 0.58, 0.76, 0.96, 1.18, 1.42, 1.68, 1.98];
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xffea77,
    emissive: 0xff9900,
    emissiveIntensity: 0.5,
    roughness: 0.15,
    metalness: 0.92,
  });

  ringRadii.forEach((r, idx) => {
    const thickness = 0.003 + (idx % 2 === 0 ? 0.002 : 0.0);
    const ringGeom = new THREE.TorusGeometry(r, thickness, 8, 72);
    ringGeom.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    portal.add(ringMesh);
  });

  // 3. Segmented Sacred Geometry Rune Circles (Slow Rotating)
  const tickGeom1 = new THREE.RingGeometry(0.74, 0.765, 48);
  tickGeom1.rotateX(-Math.PI / 2);
  const tickMat1 = new THREE.MeshBasicMaterial({
    color: 0xffea77,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  });
  const tickMesh1 = new THREE.Mesh(tickGeom1, tickMat1);
  portal.add(tickMesh1);

  const tickGeom2 = new THREE.RingGeometry(1.16, 1.185, 64);
  tickGeom2.rotateX(-Math.PI / 2);
  const tickMat2 = new THREE.MeshBasicMaterial({
    color: 0xffb700,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  });
  const tickMesh2 = new THREE.Mesh(tickGeom2, tickMat2);
  portal.add(tickMesh2);

  // 4. Stepping Core Solar Discs (Right and Left Foot Contact Pools)
  const footGlowGeom = new THREE.CircleGeometry(0.14, 24);
  footGlowGeom.rotateX(-Math.PI / 2);
  const footGlowMat = new THREE.MeshBasicMaterial({
    color: 0xfffae0,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  });
  const rightFootMesh = new THREE.Mesh(footGlowGeom, footGlowMat);
  rightFootMesh.position.set(0.06, 0.002, 0.08);
  portal.add(rightFootMesh);

  const leftFootMesh = new THREE.Mesh(footGlowGeom, footGlowMat);
  leftFootMesh.position.set(-0.06, 0.002, -0.12);
  leftFootMesh.scale.set(0.85, 0.85, 0.85);
  portal.add(leftFootMesh);

  return portal;
}

/**
 * Creates 3D flowing silk ribbon geometry using Frenet parallel-transport frames
 * Multi-segmented cross-section with 3D parabolic curl, longitudinal fluting, and curled border lips
 * Returns the ribbon geometry along with 3D left/right border points for physical metallic edge tubes
 */
function createFlowingSilkRibbonGeometry(
  curve: THREE.CatmullRomCurve3,
  lengthSegments: number = 240,
  widthSegments: number = 26,
  width: number = 0.58,
  twistFn?: (t: number) => number
): {
  geom: THREE.BufferGeometry;
  leftEdgePoints: THREE.Vector3[];
  rightEdgePoints: THREE.Vector3[];
} {
  const geom = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const points = curve.getPoints(lengthSegments);
  // Compute smooth 3D Frenet frames along the spatial curve (no fixed 2D axis locking!)
  const frames = curve.computeFrenetFrames(lengthSegments, false);

  const leftEdgePoints: THREE.Vector3[] = [];
  const rightEdgePoints: THREE.Vector3[] = [];

  for (let i = 0; i <= lengthSegments; i++) {
    const t = i / lengthSegments;
    const pt = points[i];
    const tangent = frames.tangents[i];
    const normal = frames.normals[i];
    const binormal = frames.binormals[i];

    // Smooth 3D spatial rotation along curve
    const angle = twistFn ? twistFn(t) : Math.sin(t * Math.PI * 2.0) * 1.5;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const side = new THREE.Vector3()
      .copy(binormal).multiplyScalar(cosA)
      .addScaledVector(normal, sinA)
      .normalize();

    const ribbonNormal = new THREE.Vector3().crossVectors(tangent, side).normalize();

    // Natural tapering towards endpoints
    const taper = Math.sin(t * Math.PI) * 0.28 + 0.72;
    const currentWidth = width * taper;

    for (let j = 0; j <= widthSegments; j++) {
      const u = j / widthSegments; // 0 to 1 across ribbon width
      const offset = (u - 0.5) * currentWidth;

      // Parabolic 3D curvature across cross section (curled silk/foil feel)
      const curl = Math.pow((u - 0.5) * 2.0, 2.0) * 0.052;
      // Curled metallic edge lip (tubular border piping)
      const edgeLip = Math.pow(Math.abs(u - 0.5) * 2.0, 6.0) * 0.040;
      // Longitudinal silk flutes & micro-creases (produces parallel metallic specular bands!)
      const fluting = Math.sin(u * Math.PI * 4.0) * 0.015 * Math.sin(t * Math.PI);
      const crinkle = Math.sin(u * Math.PI * 2.5 + t * 24.0) * 0.012 * Math.sin(t * Math.PI);
      const disp = ribbonNormal.clone().multiplyScalar(curl + edgeLip + fluting + crinkle);

      const vx = pt.x + side.x * offset + disp.x;
      const vy = pt.y + side.y * offset + disp.y;
      const vz = pt.z + side.z * offset + disp.z;

      positions.push(vx, vy, vz);
      uvs.push(u, t);

      // Extract 3D border curves for physical cylindrical piping
      if (j === 0) leftEdgePoints.push(new THREE.Vector3(vx, vy, vz));
      if (j === widthSegments) rightEdgePoints.push(new THREE.Vector3(vx, vy, vz));
    }
  }

  const rowSize = widthSegments + 1;
  for (let i = 0; i < lengthSegments; i++) {
    for (let j = 0; j < widthSegments; j++) {
      const a = i * rowSize + j;
      const b = (i + 1) * rowSize + j;
      const c = (i + 1) * rowSize + (j + 1);
      const d = i * rowSize + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return { geom, leftEdgePoints, rightEdgePoints };
}

/**
 * Creates Iridescent Multiverse Ribbons wrapped dynamically around the entity in full 3D space
 * Exactly replicating the ribbon paths, soaring vertical loop, top canopy, and liquid cellophane texture
 * from the reference artwork (media_1793544615047.jpg)
 */
function createIridescentRibbons(): THREE.Group {
  const ribbonsGroup = new THREE.Group();

  // 5 True 3D Spatial Ribbons matching exact artwork placements:
  const ribbonConfigs = [
    // Ribbon 1: THE SOARING BOTTOM-RIGHT VERTICAL ROLLERCOASTER LOOP (Signature Hero Loop)
    // Starts at the golden ripple platform (0.65, 0.12, 0.20), swoops down-right, climbs vertically
    // up to knee/thigh height (2.25, 1.25, 0.60), folds over at the crest, and plunges down to the lower-right corner!
    {
      points: [
        new THREE.Vector3(0.65, 0.12, 0.20),   // Emerging beside golden concentric ripples
        new THREE.Vector3(1.15, -0.05, 0.40),  // Swooping forward-right across the portal edge
        new THREE.Vector3(1.75, 0.18, 0.65),   // Swooping wide to the right
        new THREE.Vector3(2.20, 0.55, 0.78),   // Climbing vertically up
        new THREE.Vector3(2.35, 0.95, 0.75),   // Vertical ascent through knee height
        new THREE.Vector3(2.25, 1.25, 0.60),   // Soaring apex of vertical loop (thigh height!)
        new THREE.Vector3(1.95, 1.28, 0.48),   // Folding and rolling over at crest
        new THREE.Vector3(1.68, 0.90, 0.45),   // Curling down inside the loop
        new THREE.Vector3(1.70, 0.35, 0.70),   // Swooping down towards foreground
        new THREE.Vector3(2.05, -0.10, 1.05),  // Diagonally plunging forward-right
        new THREE.Vector3(2.65, -0.45, 1.35),  // Billowing into lower-right foreground corner
      ],
      width: 0.52,
      twistFn: (t: number) => {
        return THREE.MathUtils.lerp(0.60, 4.40, t) + Math.sin(t * Math.PI) * 0.85;
      },
    },

    // Ribbon 2: RIGHT WAIST CORKSCREW TO TOP OVERHEAD CANOPY BANNER
    // Wraps from behind right waist, ascends in a 3D helical corkscrew along the right flank,
    // and swoops HORIZONTALLY across the top above his head & halo at y ≈ 2.55 - 2.72 (in full camera view!)
    {
      points: [
        new THREE.Vector3(0.30, 1.18, -0.35),  // Behind right waist
        new THREE.Vector3(0.85, 1.25, 0.05),   // Emerging past right waist
        new THREE.Vector3(1.45, 1.48, 0.30),   // Corkscrewing outward to right flank
        new THREE.Vector3(1.95, 1.85, 0.25),   // Ascending past right shoulder
        new THREE.Vector3(2.25, 2.30, 0.05),   // Corkscrew twist to upper-right
        new THREE.Vector3(2.10, 2.60, -0.20),  // Turning inward above right shoulder
        new THREE.Vector3(1.45, 2.70, -0.35),  // Horizontal canopy banner over right halo
        new THREE.Vector3(0.75, 2.72, -0.40),  // Crest over right crown
        new THREE.Vector3(0.00, 2.68, -0.38),  // Apex directly above head/halo
        new THREE.Vector3(-0.75, 2.65, -0.35), // Wave over left halo
        new THREE.Vector3(-1.45, 2.55, -0.25), // Reaching top-left canopy edge
      ],
      width: 0.50,
      twistFn: (t: number) => t * Math.PI * 3.2 + 0.45,
    },

    // Ribbon 3: LEFT WAIST HORIZONTAL UNDULATING WAVE BANNER
    // Emerges from behind left waist, undulates in a distinct sinusoidal wave with troughs and crests,
    // ending in an upward curled banner fluke on the left flank!
    {
      points: [
        new THREE.Vector3(0.05, 1.22, -0.35),  // Behind left lumbar spine
        new THREE.Vector3(-0.55, 1.18, -0.15), // Cradling left flank
        new THREE.Vector3(-0.95, 1.14, 0.15),  // Emerging between left arm and torso
        new THREE.Vector3(-1.45, 1.05, 0.32),  // Sinusoidal wave: trough 1
        new THREE.Vector3(-1.95, 1.35, 0.22),  // Sinusoidal wave: crest 1
        new THREE.Vector3(-2.45, 1.12, -0.05), // Sinusoidal wave: trough 2
        new THREE.Vector3(-2.85, 1.38, -0.25), // Crest 2 & upward curled banner fluke
      ],
      width: 0.48,
      twistFn: (t: number) => Math.sin(t * Math.PI * 2.0) * 0.95 + 0.65,
    },

    // Ribbon 4: LOWER-LEFT STARFIELD RIVER & PLATFORM FOLD (Front-to-Back Flow)
    // Sweeps from lower-left foreground (-2.75, -0.55, 1.25), hosts the dense electric cyan star nursery,
    // features the signature molten copper-gold fold, and dives behind his shins above the ripple portal!
    {
      points: [
        new THREE.Vector3(-2.75, -0.55, 1.25), // Lower-left corner foreground
        new THREE.Vector3(-2.20, 0.10, 0.95),  // Sweeping up along left edge
        new THREE.Vector3(-1.65, 0.42, 0.65),  // Dense electric cyan star cluster
        new THREE.Vector3(-1.10, 0.28, 0.28),  // Signature molten copper-gold fold
        new THREE.Vector3(-0.65, 0.18, -0.05), // Rolling towards concentric golden ripples
        new THREE.Vector3(-0.25, 0.16, -0.32), // Passing behind left ankle into depth
        new THREE.Vector3(0.20, 0.20, -0.50),  // Passing directly behind shins
        new THREE.Vector3(0.70, 0.25, -0.75),  // Diving into cosmic background behind right leg
      ],
      width: 0.52,
      twistFn: (t: number) => {
        if (t < 0.35) return 0.40;
        const f = (t - 0.35) / 0.35;
        return THREE.MathUtils.lerp(0.40, 2.75, f * f * (3.0 - 2.0 * f));
      },
    },

    // Ribbon 5: UPPER-LEFT SHOULDER BILLOW & CASCADE
    // Cascades down from the top canopy past his left shoulder into the outer cosmos!
    {
      points: [
        new THREE.Vector3(-1.45, 2.55, -0.25), // Connecting from top canopy
        new THREE.Vector3(-1.85, 2.25, -0.10), // Arcing down past left shoulder
        new THREE.Vector3(-2.20, 1.85, 0.12),  // Cascading forward-left
        new THREE.Vector3(-2.55, 1.50, 0.22),  // Curling into outer space
      ],
      width: 0.46,
      twistFn: (t: number) => Math.sin(t * Math.PI * 1.5) * 0.75 + 1.20,
    },
  ];

  // Material for physical 3D cylindrical border piping
  const edgePipingMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xc89610,
    emissiveIntensity: 0.55,
    metalness: 0.98,
    roughness: 0.08,
    transparent: true,
    opacity: 0.95,
  });

  ribbonConfigs.forEach((cfg, idx) => {
    const curve = new THREE.CatmullRomCurve3(cfg.points);
    const { geom: ribbonGeom, leftEdgePoints, rightEdgePoints } = createFlowingSilkRibbonGeometry(
      curve,
      240,
      26,
      cfg.width,
      cfg.twistFn
    );

    // Build physical 3D metallic piping tubes along both borders
    if (leftEdgePoints.length > 10) {
      const leftCurve = new THREE.CatmullRomCurve3(leftEdgePoints);
      const rightCurve = new THREE.CatmullRomCurve3(rightEdgePoints);
      const tubeGeomL = new THREE.TubeGeometry(leftCurve, 140, 0.0085, 6, false);
      const tubeGeomR = new THREE.TubeGeometry(rightCurve, 140, 0.0085, 6, false);
      const tubeL = new THREE.Mesh(tubeGeomL, edgePipingMat);
      const tubeR = new THREE.Mesh(tubeGeomR, edgePipingMat);
      ribbonsGroup.add(tubeL);
      ribbonsGroup.add(tubeR);
    }

    const ribbonMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: true, // Guarantees crisp physical depth sorting, preventing milky wash!
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uSeed: { value: idx * 2.3 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        varying vec3 vWorldPos;
        uniform float uTime;
        uniform float uSeed;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          
          // Silky wind flutter along folds
          vec3 transformed = position;
          float waveY = sin(vUv.y * 8.0 - uTime * 2.2 + uSeed) * 0.024;
          float waveZ = cos(vUv.y * 6.0 - uTime * 1.8 + uSeed * 1.5) * 0.020;
          transformed += normal * (waveY + waveZ);

          vec4 wp = modelMatrix * vec4(transformed, 1.0);
          vWorldPos = wp.xyz;

          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          vViewPos = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        varying vec3 vWorldPos;
        uniform float uTime;
        uniform float uSeed;

        float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p = rot * p * 2.1 + vec2(23.4, 56.7);
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec3 viewDir = normalize(vViewPos);
          vec3 norm = normalize(vNormal);

          // ----------------------------------------------------
          // LAYER 1: Deep Crystalline Cosmic Nebula Inside Ribbon
          // High contrast, saturated palette matching reference image:
          // ----------------------------------------------------
          vec2 nebUv = vec2(vUv.x * 2.8, vUv.y * 14.0 - uTime * 0.06 + uSeed * 2.7);
          float n1 = fbm(nebUv);
          float n2 = fbm(nebUv * 2.2 + vec2(n1 * 1.6, n1 * 1.3));
          float filament = fbm(nebUv * 4.0 + vec2(n2 * 2.0, n1 * 1.7));

          vec3 cVoid     = vec3(0.010, 0.005, 0.026); // deep crystalline cosmic void
          vec3 cMagenta  = vec3(1.00, 0.16, 0.62);  // radiant hot magenta / pink
          vec3 cViolet   = vec3(0.56, 0.16, 0.95);  // royal violet / amethyst
          vec3 cCyanNeb  = vec3(0.00, 0.98, 0.94);  // intense electric cyan
          vec3 cGoldDust = vec3(1.00, 0.82, 0.32);  // shimmering celestial golden dust

          vec3 nebCol = mix(cVoid, cViolet, smoothstep(0.22, 0.60, n1));
          nebCol = mix(nebCol, cMagenta, smoothstep(0.38, 0.76, n2));
          nebCol = mix(nebCol, cCyanNeb, pow(smoothstep(0.55, 0.90, filament), 2.0) * 0.95);

          // Golden celestial dust cloud along upper crest of the ribbon
          float upperRibbon = smoothstep(0.2, 0.8, vUv.x);
          nebCol = mix(nebCol, cGoldDust, upperRibbon * pow(smoothstep(0.35, 0.85, n1), 1.8) * 0.88);

          // ----------------------------------------------------
          // LAYER 2: Embedded Starfields (Electric Cyan Clusters & Starbursts)
          // ----------------------------------------------------
          // Micro-stardust glitter (thousands of twinkling diamond dust points)
          vec2 microUv = vUv * vec2(45.0, 260.0);
          vec2 mId = floor(microUv);
          float mRnd = hash(mId + uSeed * 17.3);
          if (mRnd > 0.74) {
            vec2 mGv = fract(microUv) - 0.5;
            float mDist = length(mGv);
            float mTwinkle = sin(uTime * 12.0 + mRnd * 70.0) * 0.4 + 0.6;
            float mStar = smoothstep(0.20, 0.015, mDist) * mTwinkle;
            vec3 mCol = mRnd > 0.92 ? vec3(0.0, 1.0, 0.92) : (mRnd > 0.84 ? cMagenta : vec3(1.0, 0.96, 0.90));
            nebCol += mCol * mStar * 1.6;
          }

          // Electric Cyan Star Clusters (matching reference artwork cluster)
          vec2 clusterUv = vUv * vec2(15.0, 68.0);
          vec2 cId = floor(clusterUv);
          float cRnd = hash(cId + uSeed * 37.1);
          float distToCluster = length(vWorldPos - vec3(-1.65, 0.42, 0.65));
          float worldCluster = smoothstep(1.35, 0.18, distToCluster);
          float clusterZone = max(worldCluster * 1.8, smoothstep(0.65, 0.05, vUv.x) * 0.45);
          if (cRnd > 0.50) {
            vec2 cGv = fract(clusterUv) - 0.5;
            float cDist = length(cGv);
            float cTwinkle = sin(uTime * 9.0 + cRnd * 50.0) * 0.35 + 0.65;
            float cCore = smoothstep(0.20, 0.015, cDist);
            float cHalo = smoothstep(0.46, 0.0, cDist) * 0.55;
            vec3 cCol = mix(vec3(0.0, 1.0, 0.90), vec3(0.20, 0.96, 1.0), hash(cId + 1.7));
            nebCol += cCol * (cCore * 3.0 + cHalo * 1.5) * cTwinkle * (0.40 + clusterZone * 2.4);
          }

          // Brilliant 4-Point Celestial Cross-Diffraction Stars
          vec2 starUv = vUv * vec2(7.0, 35.0);
          vec2 sId = floor(starUv);
          float sRnd = hash(sId + uSeed * 53.7);
          if (sRnd > 0.83) {
            vec2 sGv = fract(starUv) - 0.5;
            float sDist = length(sGv);
            float sCore = smoothstep(0.18, 0.01, sDist);
            float sSpikes = max(
              smoothstep(0.025, 0.0, abs(sGv.x)) * smoothstep(0.48, 0.0, abs(sGv.y)),
              smoothstep(0.025, 0.0, abs(sGv.y)) * smoothstep(0.48, 0.0, abs(sGv.x))
            );
            vec2 dGv = vec2(sGv.x + sGv.y, sGv.x - sGv.y) * 0.7071;
            float sDiag = max(
              smoothstep(0.035, 0.0, abs(dGv.x)) * smoothstep(0.25, 0.0, abs(dGv.y)),
              smoothstep(0.035, 0.0, abs(dGv.y)) * smoothstep(0.25, 0.0, abs(dGv.x))
            ) * 0.45;
            float sTwinkle = sin(uTime * 6.0 + sRnd * 60.0) * 0.3 + 0.7;
            vec3 sColor = sRnd > 0.93 ? vec3(0.45, 0.95, 1.0) : vec3(1.0, 0.98, 0.92);
            nebCol += (sCore * 2.2 + (sSpikes + sDiag) * 2.0) * sTwinkle * sColor;
          }

          // ----------------------------------------------------
          // LAYER 3: Liquid Holographic Cellophane Foil Reflections
          // ----------------------------------------------------
          vec3 keyLight = normalize(vec3(0.6, 0.9, 0.7));
          vec3 keyHalf = normalize(keyLight + viewDir);

          // Platform direction (concentric golden energy ripples on ground)
          vec3 toPlatform = normalize(vec3(-vWorldPos.x, 0.02 - vWorldPos.y, -vWorldPos.z));
          vec3 platformHalf = normalize(toPlatform + viewDir);

          // Sharp liquid cellophane specular glint along fold crests
          float specKey = pow(max(0.0, dot(norm, keyHalf)), 48.0);
          float specBroad = pow(max(0.0, dot(norm, keyHalf)), 14.0);

          // Holographic thin-film iridescence (glancing angles only)
          float NdotV = abs(dot(norm, viewDir));
          float fresnel = pow(1.0 - NdotV, 2.8);
          float holoPhase = fract(NdotV * 2.4 + filament * 0.35 + vUv.y * 2.2 - uTime * 0.05);
          vec3 holoSpectrum = 0.5 + 0.5 * cos(6.28318 * (holoPhase + vec3(0.0, 0.33, 0.67)));
          vec3 iridescentGleam = holoSpectrum * (fresnel * 0.65 + specBroad * 0.2);

          vec3 surfaceCol = nebCol;

          // Molten copper-gold reflection on the fold near platform:
          float platformDist = length(vec2(vWorldPos.x, vWorldPos.z));
          float nearPlatform = smoothstep(0.95, 0.15, vWorldPos.y) * smoothstep(2.4, 0.2, platformDist);
          float facingPlatform = smoothstep(0.20, -0.50, norm.y);
          float foldIntensity = clamp(nearPlatform * (facingPlatform * 1.55 + 0.35), 0.0, 1.0);

          float foldSpec = pow(max(0.0, dot(norm, platformHalf)), 18.0);
          vec3 cCopper = vec3(0.98, 0.45, 0.14);
          vec3 cGold   = vec3(1.00, 0.80, 0.26);
          vec3 foldColor = mix(cCopper, cGold, foldSpec * 0.7) * (foldSpec * 1.35 + 0.35);

          surfaceCol = mix(surfaceCol, foldColor, foldIntensity * 0.84);
          surfaceCol += foldColor * 0.40 * foldIntensity;

          // Liquid chrome specular reflection along topside fold crests
          float skyFacing = smoothstep(-0.25, 0.25, norm.y);
          vec3 coolChrome = (vec3(0.98, 0.98, 1.0) * specKey * 1.4 + vec3(0.35, 0.88, 1.0) * specBroad * 0.35) * skyFacing;
          surfaceCol += coolChrome;
          surfaceCol += iridescentGleam;

          // ----------------------------------------------------
          // LAYER 4: Curled Metallic Edge Rim Piping / Border
          // ----------------------------------------------------
          float edgeDist = min(vUv.x, 1.0 - vUv.x);
          float edgePiping = smoothstep(0.038, 0.0, edgeDist);
          float edgeHighlight = pow(edgePiping, 2.0) * 1.5;

          vec3 edgeColor = mix(vec3(0.98, 0.96, 0.95), vec3(0.60, 0.96, 1.0), sin(vUv.y * 14.0 - uTime * 2.0) * 0.5 + 0.5);
          surfaceCol += edgeColor * edgeHighlight;

          // ----------------------------------------------------
          // LAYER 5: Solid Cellophane Depth & Opacity
          // ----------------------------------------------------
          float edgeAlpha = smoothstep(0.0, 0.012, edgeDist);
          float alpha = clamp(edgeAlpha * 0.98, 0.0, 1.0);

          gl_FragColor = vec4(surfaceCol, alpha);
        }
      `,
    });

    const ribbonMesh = new THREE.Mesh(ribbonGeom, ribbonMat);
    ribbonsGroup.add(ribbonMesh);
  });

  return ribbonsGroup;
}

/**
 * Creates curved comic card panel geometry bent along a cylindrical orbit (matching Image 2)
 * Smoothly curves the panel along the circular orbit cylinder so each card visibly wraps
 * along the transparent celestial orbit path.
 */
function createCurvedCardGeometry(
  width: number = 0.82,
  height: number = 1.10,
  depth: number = 0.016,
  halfArcDeg: number = 22,
  segments: number = 32
): THREE.BufferGeometry {
  const geom = new THREE.BoxGeometry(width, height, depth, segments, 4, 1);
  const pos = geom.attributes.position;
  const halfArc = (halfArcDeg * Math.PI) / 180;
  const Rc = (width / 2) / Math.sin(halfArc);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const t = Math.max(-1, Math.min(1, x / (width / 2)));
    const theta = t * halfArc;
    const newX = Rc * Math.sin(theta);
    // Negative zBend curves the side edges inward towards the center of the orbit cylinder
    const zBend = -Rc * (1.0 - Math.cos(theta));
    pos.setX(i, newX);
    pos.setZ(i, pos.getZ(i) + zBend);
  }
  geom.computeVertexNormals();
  return geom;
}

/**
 * Computes card 3D transforms for different panel layout modes:
 * 1. 'circular' (Image 2 - 3D Circular Amphitheater with dispersed heights encircling entity)
 * 2. 'horizontal_ring' (Image 2 exact - Uniform eye-level 360° cylindrical ring)
 * 3. 'helical' (Cosmic DNA Helical Spiral ascending around entity)
 * 4. 'orbit' (Layered spherical floating orbit)
 */
function getCardTransforms(
  cardId: string,
  index: number,
  totalCount: number,
  layout: 'circular' | 'horizontal_ring' | 'helical' | 'orbit'
): { position: THREE.Vector3; rotation: THREE.Euler; scale: number } {
  const R = 2.45; // Cylinder orbit radius encircling Superman Prime

  if (layout === 'horizontal_ring') {
    // Exact continuous 360-degree cylinder ring at uniform horizon height (Image 2 raw)
    const phi = (index / totalCount) * Math.PI * 2.0 - Math.PI / totalCount;
    return {
      position: new THREE.Vector3(R * Math.sin(phi), 1.35, R * Math.cos(phi)),
      rotation: new THREE.Euler(0, phi, 0),
      scale: 0.90,
    };
  }

  if (layout === 'helical') {
    // Cosmic ascending DNA spiral
    const phi = (index / totalCount) * Math.PI * 2.4;
    const y = 0.45 + (index / (totalCount - 1)) * 2.00;
    return {
      position: new THREE.Vector3(R * Math.sin(phi), y, R * Math.cos(phi)),
      rotation: new THREE.Euler(0, phi, 0),
      scale: 0.88,
    };
  }

  if (layout === 'orbit') {
    // Layered floating cosmic orbit
    const phi = (index / totalCount) * Math.PI * 2.0;
    const rVar = R + Math.sin(index * 2.1) * 0.35;
    const y = 1.35 + Math.cos(index * 1.7) * 0.8;
    return {
      position: new THREE.Vector3(rVar * Math.sin(phi), y, rVar * Math.cos(phi)),
      rotation: new THREE.Euler(0.04 * Math.sin(index), phi, 0),
      scale: 0.88,
    };
  }

  // DEFAULT: 'circular' (3D Circular Amphitheater with dispersed heights, matching Image 2 & artwork)
  // Cards sit on a true 3D circle of radius R=2.45, angled tangent to the circle (rotation.y = phi),
  // with heights dispersed from 0.65 to 2.45 so Superman Prime and ribbons remain radiant in the center!
  const circularConfigs: Record<string, { phiDeg: number; y: number; scale: number }> = {
    // Lower Foreground Flanks (framing central entity, leaving 0° unobstructed)
    flight:      { phiDeg: -30,  y: 0.65, scale: 0.98 },
    neural:      { phiDeg: +30,  y: 0.65, scale: 0.98 },
    // Mid Flanks
    maritime:    { phiDeg: -65,  y: 1.25, scale: 0.92 },
    computing:   { phiDeg: +65,  y: 1.25, scale: 0.92 },
    // Upper Flanks / Rear
    astronomy:   { phiDeg: -105, y: 1.95, scale: 0.88 },
    energy:      { phiDeg: +105, y: 1.95, scale: 0.88 },
    // Rear Depth
    telecom:     { phiDeg: -140, y: 2.25, scale: 0.82 },
    biomed:      { phiDeg: +140, y: 2.25, scale: 0.82 },
    transport:   { phiDeg: 180,  y: 2.45, scale: 0.78 },
  };

  const cfg = circularConfigs[cardId] || {
    phiDeg: (index / totalCount) * 360,
    y: 1.35,
    scale: 0.90,
  };

  const phiRad = (cfg.phiDeg * Math.PI) / 180;
  return {
    position: new THREE.Vector3(R * Math.sin(phiRad), cfg.y, R * Math.cos(phiRad)),
    rotation: new THREE.Euler(0, phiRad, 0), // Tangent along circular cylinder!
    scale: cfg.scale,
  };
}

/**
 * Creates a smooth 3D flight trajectory for a card in the entrance trail.
 * All cards share the exact same top-left origin and entry swoop across the sky,
 * loop around the 3D entity clockwise, and settle gracefully into their circular amphitheater slot.
 */
function createCardTrailCurve(
  startPoint: THREE.Vector3,
  targetPos: THREE.Vector3,
  targetPhiRad: number,
  targetY: number
): THREE.CatmullRomCurve3 {
  const waypoints: THREE.Vector3[] = [];

  // 1. High in the top-left cosmic sky (unprojected from screen top-left)
  waypoints.push(startPoint.clone());

  // 2. High-speed diagonal swoop across upper cosmic space
  waypoints.push(new THREE.Vector3(-4.6, 3.8, 4.4));

  // 3. Approaching front-left airspace of the 3D entity
  waypoints.push(new THREE.Vector3(-1.6, 2.4, 3.8));

  // 4. Sweeping across the front toward the right flank
  waypoints.push(new THREE.Vector3(1.6, 1.9, 3.0));

  // 5. Clockwise loop around the 3D entity:
  let normTargetPhi = targetPhiRad;
  while (normTargetPhi < 0) normTargetPhi += Math.PI * 2;
  while (normTargetPhi >= Math.PI * 2) normTargetPhi -= Math.PI * 2;

  const startAlpha = 0.25 * Math.PI;
  let endAlpha = normTargetPhi;
  if (endAlpha <= startAlpha + 0.35) {
    endAlpha += Math.PI * 2;
  }

  const arcSteps = 7;
  for (let s = 1; s <= arcSteps; s++) {
    const frac = s / (arcSteps + 1);
    const alpha = THREE.MathUtils.lerp(startAlpha, endAlpha, frac);
    const r = THREE.MathUtils.lerp(2.8, 2.45, frac);
    const y = THREE.MathUtils.lerp(1.9, targetY, frac);
    waypoints.push(new THREE.Vector3(r * Math.sin(alpha), y, r * Math.cos(alpha)));
  }

  // 6. Pre-dock tangent waypoint (aligns card with cylindrical orbit before docking)
  const preDockAlpha = targetPhiRad - 0.12;
  waypoints.push(new THREE.Vector3(
    2.45 * Math.sin(preDockAlpha),
    targetY,
    2.45 * Math.cos(preDockAlpha)
  ));

  // 7. Destination slot
  waypoints.push(targetPos.clone());

  return new THREE.CatmullRomCurve3(waypoints, false, 'centripetal');
}

/**
 * Creates Floating Multiverse Comic Panels arranged in a true 3D circular cylinder carousel
 * around Superman Prime (entity in center), matching Image 2
 */
function createFloatingComicPanels(
  scene: THREE.Scene,
  onSelectComic: (card: ComicCardData) => void,
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement
): THREE.Group {
  const cardsGroup = new THREE.Group();
  const carouselPivotGroup = new THREE.Group();
  cardsGroup.add(carouselPivotGroup);
  cardsGroup.userData.pivotGroup = carouselPivotGroup;

  const textureLoader = new THREE.TextureLoader();
  const cardMeshes: THREE.Mesh[] = [];

  const defaultLayout = 'circular';
  const startPoint = new THREE.Vector3(-1.12, 0.98, 0.42).unproject(camera);
  const CHIME_PITCHES = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66];

  // Subtle celestial orbit guide ring at base (y = 0.55) so it never occludes Superman Prime
  const R = 2.45;
  const orbitRingGeom = new THREE.TorusGeometry(R, 0.003, 12, 96);
  orbitRingGeom.rotateX(Math.PI / 2);
  const orbitRingMat = new THREE.MeshBasicMaterial({
    color: 0xd9ad62,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
  });
  const orbitRingMesh = new THREE.Mesh(orbitRingGeom, orbitRingMat);
  orbitRingMesh.position.y = 0.55;
  carouselPivotGroup.add(orbitRingMesh);

  COMIC_CARDS_DATA.forEach((cardData, idx) => {
    const texture = textureLoader.load(cardData.image);
    texture.colorSpace = THREE.SRGBColorSpace;

    // Curved 3D panel geometry bent along orbital cylinder (exact circular arc curve)
    const geom = createCurvedCardGeometry(0.82, 1.10, 0.016, 25, 32);

    const frontMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.18,
      metalness: 0.10,
    });

    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xffe899, // Golden celestial card edge with specular sheen
      roughness: 0.35,
      metalness: 0.75,
      emissive: 0xffaa00,
      emissiveIntensity: 0.08,
    });

    // Double-sided vintage comic card: artwork on front and back
    const materials = [
      borderMat, // right
      borderMat, // left
      borderMat, // top
      borderMat, // bottom
      frontMat,  // front
      frontMat,  // back
    ];

    const cardMesh = new THREE.Mesh(geom, materials);

    const t = getCardTransforms(cardData.id, idx, COMIC_CARDS_DATA.length, defaultLayout);
    cardMesh.position.copy(t.position);
    cardMesh.rotation.copy(t.rotation);
    cardMesh.scale.set(t.scale, t.scale, t.scale);

    const flightCurve = createCardTrailCurve(startPoint, t.position, t.rotation.y, t.position.y);

    cardMesh.userData = {
      cardData,
      baseScale: t.scale,
      targetPosition: t.position.clone(),
      targetRotation: t.rotation.clone(),
      targetQuaternion: cardMesh.quaternion.clone(),
      targetScale: t.scale,
      isHovered: false,
      flightCurve,
      startDelay: 0.12 + idx * 0.14,
      duration: 2.25,
      hasLanded: false,
      hasChimed: false,
    };

    // Initially hidden until launch time arrives in entrance swoop animation
    cardMesh.visible = false;
    cardMesh.scale.set(0.001, 0.001, 0.001);

    carouselPivotGroup.add(cardMesh);
    cardMeshes.push(cardMesh);
  });

  cardsGroup.userData.cardMeshes = cardMeshes;
  cardsGroup.userData.isIntroActive = true;
  cardsGroup.userData.finishIntro = () => {
    cardsGroup.userData.isIntroActive = false;
    cardMeshes.forEach((card) => {
      const uData = card.userData;
      card.visible = true;
      uData.hasLanded = true;
      uData.hasChimed = true;
      card.position.copy(uData.targetPosition);
      card.quaternion.copy(uData.targetQuaternion);
      card.scale.set(uData.baseScale, uData.baseScale, uData.baseScale);
    });
  };

  // Layout switcher function (smoothly glides cards to target layout)
  cardsGroup.userData.setLayout = (layout: 'circular' | 'horizontal_ring' | 'helical' | 'orbit') => {
    cardMeshes.forEach((mesh, idx) => {
      const data = mesh.userData.cardData as ComicCardData;
      const t = getCardTransforms(data.id, idx, cardMeshes.length, layout);
      mesh.userData.targetPosition.copy(t.position);
      mesh.userData.targetRotation.copy(t.rotation);
      mesh.userData.baseScale = t.scale;
      mesh.userData.targetScale = t.scale;
    });
  };

  // Raycasting for interactive hover and click
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredMesh: THREE.Mesh | null = null;

  // Pointer and Touch drag-to-spin & tap-to-open interaction for the 3D carousel
  let isPointerDown = false;
  let isDraggingCard = false;
  let previousClientX = 0;
  let previousClientY = 0;
  let dragDelta = 0;
  let pointerStartTime = 0;
  let pointerStartPos = { x: 0, y: 0 };

  const startPointer = (clientX: number, clientY: number) => {
    if (cardsGroup.userData.finishIntro) {
      cardsGroup.userData.finishIntro();
    }
    isPointerDown = true;
    previousClientX = clientX;
    previousClientY = clientY;
    dragDelta = 0;
    pointerStartTime = performance.now();
    pointerStartPos = { x: clientX, y: clientY };

    const rect = domElement.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cardMeshes);
    isDraggingCard = intersects.length > 0;
  };

  const movePointer = (clientX: number, clientY: number) => {
    const rect = domElement.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    if (isPointerDown) {
      const dx = clientX - previousClientX;
      const dy = clientY - previousClientY;
      previousClientX = clientX;
      previousClientY = clientY;
      dragDelta += Math.hypot(dx, dy);
      if (dragDelta > 6) {
        cardsGroup.userData.isDragging = true;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('user-3d-interacted'));
        }
      }
      if (isDraggingCard) {
        carouselPivotGroup.rotation.y += dx * 0.0055;
      }
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cardMeshes);

    if (intersects.length > 0 && !cardsGroup.userData.isDragging) {
      const hit = intersects[0].object as THREE.Mesh;
      if (hoveredMesh !== hit) {
        if (hoveredMesh) {
          hoveredMesh.userData.isHovered = false;
          const s = hoveredMesh.userData.baseScale;
          hoveredMesh.scale.set(s, s, s);
        }
        hoveredMesh = hit;
        hit.userData.isHovered = true;
        const s = hit.userData.baseScale * 1.12;
        hit.scale.set(s, s, s);
        domElement.style.cursor = 'pointer';
        cardsGroup.userData.isHovered = true;
      }
    } else {
      if (hoveredMesh) {
        hoveredMesh.userData.isHovered = false;
        const s = hoveredMesh.userData.baseScale;
        hoveredMesh.scale.set(s, s, s);
        hoveredMesh = null;
        cardsGroup.userData.isHovered = false;
        domElement.style.cursor = 'grab';
      }
    }
  };

  const endPointer = () => {
    isPointerDown = false;
    setTimeout(() => {
      cardsGroup.userData.isDragging = false;
    }, 60);
  };

  const selectCardAt = (clientX: number, clientY: number) => {
    if (cardsGroup.userData.finishIntro) {
      cardsGroup.userData.finishIntro();
    }
    const rect = domElement.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cardMeshes);

    if (intersects.length > 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('user-3d-interacted'));
      }
      const hit = intersects[0].object as THREE.Mesh;
      const data = hit.userData.cardData as ComicCardData;
      if (data) {
        onSelectComic(data);
      }
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    startPointer(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: MouseEvent) => {
    movePointer(e.clientX, e.clientY);
  };
  const handleMouseUp = () => {
    endPointer();
  };
  const handleClick = (e: MouseEvent) => {
    if (dragDelta > 8) return;
    selectCardAt(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    startPointer(t.clientX, t.clientY);
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    movePointer(t.clientX, t.clientY);
  };
  const handleTouchEnd = (e: TouchEvent) => {
    endPointer();
    const elapsed = performance.now() - pointerStartTime;
    if (dragDelta < 14 && elapsed < 500) {
      selectCardAt(pointerStartPos.x, pointerStartPos.y);
    }
  };

  domElement.addEventListener('mousedown', handleMouseDown);
  domElement.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  domElement.addEventListener('click', handleClick);

  domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
  domElement.addEventListener('touchmove', handleTouchMove, { passive: true });
  domElement.addEventListener('touchend', handleTouchEnd, { passive: true });

  cardsGroup.userData.dispose = () => {
    domElement.removeEventListener('mousedown', handleMouseDown);
    domElement.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    domElement.removeEventListener('click', handleClick);

    domElement.removeEventListener('touchstart', handleTouchStart);
    domElement.removeEventListener('touchmove', handleTouchMove);
    domElement.removeEventListener('touchend', handleTouchEnd);
  };

  return cardsGroup;
}

/**
 * Creates Rising Solar Dust & Golden Embers
 */
function createSolarEmbers(): THREE.Points {
  const emberCount = 600;
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(emberCount * 3);
  const colors = new Float32Array(emberCount * 3);

  const goldColors = [
    new THREE.Color(0xf5e5c9),
    new THREE.Color(0xd9ad62),
    new THREE.Color(0xb88d44),
  ];

  for (let i = 0; i < emberCount; i++) {
    // Spiral cylinder around character
    const radius = 0.2 + Math.random() * 1.8;
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.random() * 4.5;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    const c = goldColors[Math.floor(Math.random() * goldColors.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geom, mat);
}

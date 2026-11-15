export interface FormConfig {
  id: string;
  name: string;
  eventNumber: string;
  title: string;
  tag: string;
  source: string;
  concept: string;
  innovation: string;
  modelPath?: string;
  description: string;
}

export const PARTICLE_CONFIG = {
  // Counts
  countDesktop: 40000,
  countMobile: 15000,
  textureSizeDesktop: 200, // 200 x 200 = 40,000
  textureWidthMobile: 125,
  textureHeightMobile: 120, // 125 x 120 = 15,000

  // Particle Look
  pointSizeMin: 1.0,
  pointSizeMax: 3.0,
  colors: {
    gold: '#FFD6A0', // 70%
    white: '#FFF4E2', // 20%
    teal: '#8CE2E0', // 10%
  },
  colorWeights: [0.7, 0.2, 0.1],

  // Bloom
  bloomStrength: 0.4,
  bloomThreshold: 0.6,
  bloomRadius: 0.35,

  // Physics & Morph
  spring: {
    stiffness: 0.012,
    damping: 0.86,
  },
  burst: {
    distanceMin: 10,
    distanceMax: 40,
    duration: 0.25, // seconds
    upwardLift: 8.0,
  },
  flight: {
    randomDelayMax: 0.45, // seconds
    heightDelayFactor: 0.35, // bottom-up stagger
  },
  sparkFlyDuration: 0.7, // seconds

  // Interaction
  pointerRepelRadius: 60, // pixels
  pointerRepelStrength: 45.0,
  parallax: {
    background: 0.015,
    figure: 0.045,
    sparks: 0.08,
  },

  // Performance
  dprDesktop: 1.75,
  dprMobile: 1.5,
  reducedMotionDuration: 0.6, // seconds

  // Assets
  backgroundImage: '/images/cave-bg.jpg',
  humanModelPath: '/models/male_body-compressed.glb',
};

export const FORMS: FormConfig[] = [
  {
    id: 'human',
    name: 'Human Figure',
    eventNumber: '00',
    title: 'Technex Consciousness',
    tag: 'Origin',
    source: 'Vitruvian Man / Technex Lore',
    concept: 'The human spark that originates all technological thought.',
    innovation: 'Biomechanics, neural interfaces, human-computer symbiosis.',
    modelPath: '/models/male_body-compressed.glb',
    description: 'A floating human silhouette, suspended at 3/4 angle above the stone pedestal in relaxed contemplative pose.',
  },
  {
    id: 'exosuit',
    name: 'Powered Exosuit',
    eventNumber: '01',
    title: 'Hack The Hardware',
    tag: 'Hardware',
    source: 'Tony Stark’s powered armour — Marvel Comics',
    concept: 'Segmented kinetic plates, a glowing arc chest core, and a smooth streamlined faceplate.',
    innovation: 'Robotic exoskeletons, wearable electronics, embedded systems and powered prosthetics.',
    description: 'Original biomechanical power armour with articulating shoulder pauldron plates, glowing micro-reactor core, and sleek visor.',
  },
  {
    id: 'console',
    name: "Ship's Computer Console",
    eventNumber: '02',
    title: 'Hackathon',
    tag: 'Software',
    source: 'The Ship’s Computer — Star Trek',
    concept: 'A retro-futuristic bridge console with a curved command desk, angled holographic monitors, and an orbiting data sphere.',
    innovation: 'AI assistants, natural-language interfaces, software architecture and intelligent automation.',
    description: 'Curved starship navigation station featuring tiered keyboard arrays, dual angled HUD display monitors, and a floating glowing holosphere.',
  },
  {
    id: 'submarine',
    name: 'Miniature Submarine',
    eventNumber: '03',
    title: 'Envision',
    tag: 'Medtech',
    source: 'Fantastic Voyage — Isaac Asimov (1966)',
    concept: 'A miniature exploratory submarine with a panoramic convex viewport, dual articulated robotic arms, and twin propulsion thrusters.',
    innovation: 'Micro-robotics, non-invasive internal endoscopy, advanced medical imaging and surgical automation.',
    description: 'Deep-sea research exploration sub with a circular forward observation dome, lateral searchlights, and twin manipulator claws.',
  },
  {
    id: 'drone',
    name: 'Tactical Drone',
    eventNumber: '04',
    title: 'Vortex',
    tag: 'Esports Fiesta',
    source: 'Ready Player One — Ernest Cline (2011)',
    concept: 'High-agility quadcopter drone with ducted fan rotors, high-speed telemetry sensors, and an optical tracking dome.',
    innovation: 'FPV aerobatics, spatial SLAM tracking, low-latency video transmission, and autonomous swarm flight.',
    description: 'X-frame high-speed tactical drone with four multi-blade rotors, carbon chassis ribs, and forward LiDAR turret.',
  },
  {
    id: 'rocket',
    name: 'Orbital Rocket',
    eventNumber: '05',
    title: 'Gamer Conquest',
    tag: 'Aerospace',
    source: 'Classic Sci-Fi Space Exploration',
    concept: 'Retro-futuristic streamlined rocket ship with parabolic aerodynamic nosecone, sweeping stabiliser fins, and flared thruster bell.',
    innovation: 'Orbital mechanics, cryogenic propulsion, composite heat-shield lattices, and reusable rocketry.',
    description: 'Streamlined rocket vehicle with triple swept fins, fuselage panel grooves, and a high-energy propulsion nozzle.',
  },
  {
    id: 'circuit-chip',
    name: 'Neural Circuit Chip',
    eventNumber: '06',
    title: 'Apex CTF',
    tag: 'Cyber',
    source: 'The Imitation Game (2014)',
    concept: 'Square microchip processor die with peripheral connector pins, integrated security co-processor, and gold circuit trace bus.',
    innovation: 'Hardware cryptographic accelerators, trusted platform modules (TPM), zero-knowledge coprocessors.',
    description: 'Monolithic silicon microprocessor with 32 perimeter QFP leads, central heat-spreader die, and etched cryptographic logic buses.',
  },
  {
    id: 'lightbulb',
    name: 'Edison Light Bulb',
    eventNumber: '07',
    title: 'BIZCON 2026',
    tag: 'Expo',
    source: 'Shark Tank & The Invention of Electric Light',
    concept: 'Classic incandescent glass envelope with an Edison screw base and double-helical glowing filament loop.',
    innovation: 'Venture innovation, disruptive commercialisation, industrial design and patent generation.',
    description: 'A bulbous teardrop glass vacuum bulb resting on a threaded brass collar, enclosing a radiant twin-loop carbon filament.',
  },
  {
    id: 'boat',
    name: 'Hydrofoil Craft',
    eventNumber: '08',
    title: 'Coastal Clash',
    tag: 'Marine',
    source: 'Leonardo da Vinci — Watercraft sketches',
    concept: 'Hydrodynamic high-speed racing vessel with stepped planning hull, wave-piercing prow, and twin surface-piercing hydrofoils.',
    innovation: 'Computational fluid dynamics (CFD), supercavitating props, composite marine hulls.',
    description: 'Stepped hull speedboat with sharp aerodynamic cockpit canopy, twin outrigger hydrofoils, and high-pitch bronze propeller.',
  },
  {
    id: 'robotic-arm',
    name: 'Articulated Robotic Arm',
    eventNumber: '09',
    title: 'Robo-Sumo',
    tag: 'Robotics',
    source: 'Real Steel (2011)',
    concept: 'Industrial 6-axis articulated robotic manipulator with hydraulic shoulder knuckle, elbow actuator, and three-finger pneumatic gripper.',
    innovation: 'Inverse kinematics, high-torque brushless servo actuators, collision detection, and tactile impedance control.',
    description: 'Heavy robotic manipulator arm with rotating turret base, twin hydraulic cylinder arms, and precision three-jaw gripper.',
  },
  {
    id: 'jet',
    name: 'Supersonic Jet',
    eventNumber: '10',
    title: 'Overdrive 9.0',
    tag: 'Racing',
    source: 'Speed Racer (Mach GoGoGo)',
    concept: 'Hypersonic delta-wing interceptor aircraft with twin angled vertical stabilisers, razor canards, and afterburning turbofan nozzles.',
    innovation: 'Supersonic aerodynamics, active fly-by-wire control surfaces, radar-absorbent geometry.',
    description: 'Aerodynamic delta fighter aircraft with needle pitot nosecone, swept leading-edge root extensions, and twin exhaust conduits.',
  },
  {
    id: 'gear',
    name: 'Precision Spur Gear',
    eventNumber: '11',
    title: 'TechQuest',
    tag: 'Forensics',
    source: 'Sherlock Holmes — Clockwork Deduction',
    concept: 'Involute spur gear with cut perimeter teeth, lightened web cutouts, and central keyed drive hub.',
    innovation: 'Tribology, mechanical chronometry, epicyclic gear trains, and forensic physical evidence analysis.',
    description: 'A machined 24-tooth spur gear with five circular lightening cutouts, chamfered rim, and center keyed axle bore.',
  },
  {
    id: 'neural-core',
    name: 'Artificial Neural Core',
    eventNumber: '12',
    title: 'Agentic Arena',
    tag: 'AI',
    source: 'J.A.R.V.I.S. — Marvel’s Iron Man',
    concept: 'Synaptic artificial neural core with multi-layered perceptron node lattice, geodesic tensor web, and pulsating synaptic axons.',
    innovation: 'Autonomous LLM agent swarms, transformer attention graph execution, neuromorphic computing.',
    description: 'Geodesic spherical neural network core with concentric layer nodes interconnected by glowing axon light pathways.',
  },
  {
    id: 'suspension-bridge',
    name: 'Suspension Bridge',
    eventNumber: '13',
    title: 'DesignX Studio',
    tag: 'Design',
    source: 'Leonardo da Vinci — Engineering sketches',
    concept: 'Graceful suspension bridge span with twin gothic-trussed towers, catenary main cables, vertical suspender wire harness, and roadway deck.',
    innovation: 'Parametric structural engineering, finite-element wind load analysis, generative architectural lattices.',
    description: 'Twin-tower architectural suspension bridge span with main catenary cables, vertical wire ropes, and cantilevered traffic deck.',
  },
];

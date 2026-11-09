import type { ShapeKind } from '@/lib/event-shapes';

export interface EventItem {
  id: string;
  /** URL part for the details page: /events/<slug> */
  slug: string;
  title: string;
  tag: string;
  /** "Original source" column from your table */
  source: string;
  /** "Imagined concept" text */
  concept: string;
  /** "Real-world innovation" column */
  innovation: string;
  shape: ShapeKind;
  registerUrl?: string;
}

export const siteConfig = {
  brand: 'TECHNEX',
  section: 'EVENTS',
  venue: 'SVPCET',
  dates: '18–19 DEC',
  registerUrl: '#register',
};

export const EVENT_LIST_SCROLL_KEY = 'technex-event-list-scroll';

/** Sidebar links – change the hrefs to your real routes */
export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Events', href: '/events', active: true },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Sponsors', href: '/sponsors' },
  { label: 'Team', href: '/team' },
  { label: 'Contact', href: '/contact' },
];

export const events: EventItem[] = [
  {
    id: '01',
    slug: 'hack-the-hardware',
    title: 'Hack The Hardware',
    tag: 'Hardware',
    source: 'Iron Man — Marvel Comics',
    concept: 'Tony Stark’s powered armour.',
    innovation: 'Robotic exoskeletons, wearable electronics, embedded systems and powered prosthetics.',
    shape: 'star',
  },
  {
    id: '02',
    slug: 'hackathon',
    title: 'Hackathon',
    tag: 'Software',
    source: 'Star Trek — The Ship’s Computer',
    concept: 'A fictional computer that understands requests and provides information.',
    innovation: 'AI assistants, natural-language interfaces, software applications and intelligent automation.',
    shape: 'hex',
  },
  {
    id: '03',
    slug: 'envision',
    title: 'Envision',
    tag: 'Medtech',
    source: 'Fantastic Voyage — Isaac Asimov (1966)',
    concept: 'A miniature submarine travels inside the human body.',
    innovation: 'MRI scanners, medical imaging and AI-assisted medical image analysis.',
    shape: 'ring',
  },
  {
    id: '04',
    slug: 'vortex',
    title: 'Vortex',
    tag: 'Esports Fiesta',
    source: 'Ready Player One — Ernest Cline (2011)',
    concept: 'The OASIS, an immersive shared virtual universe.',
    innovation: 'Virtual reality headsets, motion tracking, haptic feedback and immersive multiplayer gaming.',
    shape: 'rosette',
  },
  {
    id: '05',
    slug: 'gamer-conquest',
    title: 'Gamer Conquest',
    tag: 'Esports Fiesta',
    source: 'Ready Player One — Ernest Cline (2011)',
    concept: 'The OASIS, an immersive shared virtual universe.',
    innovation: 'Virtual reality headsets, motion tracking, haptic feedback and immersive multiplayer gaming.',
    shape: 'rosette',
  },
  {
    id: '06',
    slug: 'ctf',
    title: 'CTF',
    tag: 'Cyber',
    source: 'The Imitation Game (2014)',
    concept: 'The story of Alan Turing and the effort to decipher Enigma-encrypted messages.',
    innovation: 'Automated cryptanalysis, cryptography and modern cybersecurity techniques.',
    shape: 'chevron',
  },
  {
    id: '07',
    slug: 'build-the-brand',
    title: 'Build The Brand',
    tag: 'Expo',
    source: 'Shark Tank',
    concept: 'Entrepreneurs present innovative business ideas to investors.',
    innovation: 'Startup pitching, business validation, entrepreneurship and investment.',
    shape: 'triangle',
  },
  {
    id: '08',
    slug: 'coastal-clash',
    title: 'Coastal Clash',
    tag: 'Marine',
    source: 'Leonardo da Vinci — Watercraft sketches',
    concept: 'Renaissance designs exploring mechanical ways to move vessels through water.',
    innovation: 'Modern marine engineering, efficient propulsion systems, hydrodynamic hull design and high-performance RC boats.',
    shape: 'triangle',
  },
  {
    id: '09',
    slug: 'robo-sumo',
    title: 'Robo-Sumo',
    tag: 'Robotics',
    source: 'Real Steel (2011)',
    concept: 'Fictional boxing robots designed to fight in an arena under human control or with automated routines.',
    innovation: 'Mini-sumo robots, autonomous navigation, proximity sensors, motor control and embedded robotics.',
    shape: 'hex',
  },
  {
    id: '10',
    slug: 'overdrive',
    title: 'Overdrive 8.0',
    tag: 'Racing',
    source: 'Speed Racer (Mach GoGoGo) — Tatsuo Yoshida (1966)',
    concept: 'The Mach 5, a high-performance racing car with specialised features.',
    innovation: 'Robotics, motor control, steering, suspension and obstacle navigation in competitive robo-racing.',
    shape: 'chevron',
  },
  {
    id: '11',
    slug: 'techquest',
    title: 'TechQuest',
    tag: 'Forensics',
    source: 'Sherlock Holmes — Arthur Conan Doyle',
    concept: 'A fictional detective who solves mysteries through observation, deduction and clues.',
    innovation: 'Forensic science, fingerprint analysis, evidence examination and digital investigation.',
    shape: 'ring',
  },
  {
    id: '12',
    slug: 'ai-agent-arena',
    title: 'AI Agent Arena',
    tag: 'AI',
    source: 'J.A.R.V.I.S. — Marvel’s Iron Man',
    concept: 'An intelligent AI assistant that understands commands, analyses information and helps execute complex tasks.',
    innovation: 'AI agents, large language models, intelligent automation and autonomous task execution.',
    shape: 'rosette',
  },
  {
    id: '13',
    slug: 'designx',
    title: 'DesignX',
    tag: 'Design',
    source: 'Leonardo da Vinci — Engineering sketches',
    concept: 'Drawings of futuristic machines and structures that explored ideas beyond the technology of his time.',
    innovation: 'Computer-Aided Design (CAD), 3D modelling, engineering prototyping and product design.',
    shape: 'star',
  },
];
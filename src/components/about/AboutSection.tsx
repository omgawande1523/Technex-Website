'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Award,
  Users,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  Quote,
  Target,
  Compass,
  ArrowUp,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react';

/* ---------------- DATA ---------------- */

const STATS = [
  {
    title: '20+ YEARS',
    subtitle: 'Legacy of Innovation',
    description: 'Established in 2004, inspiring engineering excellence and groundbreaking ideas since day one.',
    icon: Calendar,
  },
  {
    title: '10+ MEGA EVENTS',
    subtitle: 'Multidisciplinary Arenas',
    description: 'National level hackathons, robotics challenges, design sprints, and technical exhibitions.',
    icon: Award,
  },
  {
    title: '3,000+ PARTICIPANTS',
    subtitle: 'Nationwide Community',
    description: 'An electrified annual congregation of visionary students, creators, and developers from across India.',
    icon: Users,
  },
];

const GUESTS = [
  {
    name: 'Shri. Nitin Gadkari',
    title: 'Minister of Road Transport and Highways of India',
    image: '/nitin-gadkari.webp',
    quote: 'Very good institution, giving good education and character to the students.',
    role: 'Distinguished Chief Guest',
  },
  {
    name: 'Dr. Kavi Arya',
    title: 'Founder, E-Yantra & Professor, IIT Bombay',
    image: '/kavi-arya.webp',
    quote: "Pallotti College's E-Yantra robotics lab ranks among the top 13 laboratories in India.",
    role: 'Keynote Speaker',
  },
  {
    name: 'Dr. Vishnu Vardhan',
    title: 'Founder & CEO, Vizzy Multiomics, Bengaluru',
    image: '/Dr-Vishnu-Vardhan.webp',
    quote: 'I am very impressed by the research laboratories and the progressive vision of the institution.',
    role: 'Guest of Honour',
  },
  {
    name: 'Dr. Ritu Jain Gaurav',
    title: 'CTO, U2U Systems, Singapore',
    image: '/riitu_jain.webp',
    quote: "I admire the exceptional discipline of St. Vincent Pallotti College; it is a true honour to be here.",
    role: 'Global Tech Luminary',
  },
  {
    name: 'Dr. Pratap Khanwilkar',
    title: 'CEO, Ignition Key, USA',
    image: '/Dr-Pratap-Khanwilkar.webp',
    quote: 'Dream big, execute, make real things and help people. We are all here to make each other healthier and stronger.',
    role: 'International Keynote',
  },
  {
    name: 'Mr. Shrikant Sarda',
    title: 'Managing Director, Accenture Technology, Pune',
    image: '/Mr-Shrikant-Sarda.webp',
    quote: 'It is my honour to be standing here. I am impressed by the students, their academic rigour, and institution discipline.',
    role: 'Industry Leader',
  },
  {
    name: 'Dr. Ravinder Singhal',
    title: 'Additional Director General of Police (ADGP)',
    image: '/Dr-Ravinder-Singhal.webp',
    quote: 'Technology driven by youth is the backbone of modern progress and security.',
    role: 'Special Guest',
  },
];

const SPONSORS = [
  { name: 'Federal Bank', logo: '/Federal_Bank.webp', tag: 'Banking Partner' },
  { name: 'Physics Wallah', logo: '/Physics_wallah_logo.webp', tag: 'Education Partner' },
  { name: 'KRAFTON', logo: '/KRAFTON_IN_ESPORTS.webp', tag: 'Gaming Partner' },
];

export default function AboutSection() {
  const [activeGuest, setActiveGuest] = useState(0);
  const guestIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle guest carousel
  useEffect(() => {
    guestIntervalRef.current = setInterval(() => {
      setActiveGuest((prev) => (prev + 1) % GUESTS.length);
    }, 6000);

    return () => {
      if (guestIntervalRef.current) clearInterval(guestIntervalRef.current);
    };
  }, []);

  const handlePrevGuest = () => {
    setActiveGuest((prev) => (prev === 0 ? GUESTS.length - 1 : prev - 1));
  };

  const handleNextGuest = () => {
    setActiveGuest((prev) => (prev + 1) % GUESTS.length);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="about" className="about-parallax-container">
      {/* Top Transition Gradient Fog */}
      <div className="about-transition-veil" />

      <div className="about-content-wrapper">
        {/* ========================================================= */}
        {/* 1. HERO HEADER */}
        {/* ========================================================= */}
        <div className="about-hero-header">
        

          <h2 className="about-main-title">
            ABOUT TECHNEX
          </h2>

          <p className="about-subtitle">
            Unleashing innovation, fostering futuristic talent, and transforming theoretical ideas into real-world technological reality.
          </p>

          {/* Core 3 Stats */}
          <div className="about-stats-grid">
            {STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="about-stat-card group">
                  <div className="stat-card-glow" />
                  <div className="stat-icon-wrapper">
                    <Icon size={24} className="text-[#d9ad62]" />
                  </div>
                  <div className="stat-title">{stat.title}</div>
                  <div className="stat-subtitle">{stat.subtitle}</div>
                  <p className="stat-desc">{stat.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. WELCOME TO PALLOTTI (SVPCET) */}
        {/* ========================================================= */}
        <div className="about-glass-panel">
          <div className="panel-cyber-tag">SVPCET // CAMPUS HERITAGE</div>
          <h3 className="panel-title">Welcome to Pallotti</h3>

          <div className="pallotti-grid">
            {/* Campus Photo */}
            <div className="campus-image-container group">
              <img
                src="/pallotti.webp"
                alt="St. Vincent Pallotti College Campus"
                className="campus-img"
              />
              <div className="campus-overlay-badge">
                <Building2 size={15} />
                <span>NAAC &apos;A&apos; GRADE ACCREDITED</span>
              </div>
            </div>

            {/* Description & Vision/Mission */}
            <div className="campus-info-block">
              <p className="campus-paragraph">
                <strong>St. Vincent Pallotti College of Engineering and Technology (SVPCET)</strong> was established in 2004 by the Nagpur Pallottine Society. Accredited by NAAC with <strong>&apos;A&apos; Grade</strong>, the college is affiliated with Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU) and approved by the Directorate of Technical Education (DTE), Mumbai, and AICTE, Government of India.
              </p>

              <div className="vision-mission-cards">
                <div className="vm-card">
                  <div className="vm-header">
                    <Target size={18} className="text-[#d9ad62]" />
                    <h4>Vision</h4>
                  </div>
                  <p>
                    To develop a knowledge-based society with clarity of thoughts and charity at hearts to serve humanity with integrity.
                  </p>
                </div>

                <div className="vm-card">
                  <div className="vm-header">
                    <Compass size={18} className="text-[#d9ad62]" />
                    <h4>Mission</h4>
                  </div>
                  <p>
                    To empower youth to be technocrats of tomorrow with absolute discipline, quest for knowledge, and strong ethos to uphold the spirit of professionalism.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. LEADERSHIP VISIONARIES (Director & Principal) */}
        {/* ========================================================= */}
        <div className="leadership-section">
          {/* Director Card */}
          <div className="about-glass-panel leader-card">
            <div className="panel-cyber-tag">INSTITUTIONAL LEADERSHIP</div>
            <div className="leader-flex">
              <div className="leader-avatar-block">
                <div className="avatar-frame">
                  <img
                    src="/director_paul_chandrankunnel2.webp"
                    alt="Dr. Fr. Paul Chandrankunnel"
                    className="leader-img"
                  />
                  <div className="avatar-glow-ring" />
                </div>
                <div className="leader-name">Dr. Fr. Paul Chandrankunnel</div>
                <div className="leader-designation">Director, SVPCET</div>
              </div>

              <div className="leader-quote-block">
                <Quote size={28} className="quote-icon" />
                <p>
                  &quot;Technex, the annual technical festival of St. Vincent Pallotti College of Engineering and Technology, has emerged as a premier national platform where aspiring engineers rub shoulders with each other to claim the coveted prizes.&quot;
                </p>
                <p>
                  &quot;Underlying this promotion is our conviction that competitions offer multiple benefits: critical thinking, teamwork, innovation, and practical application. Students go back with a high sense of achievement, staying focused and inspired to shape the technological future.&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Principal Card */}
          <div className="about-glass-panel leader-card">
            <div className="panel-cyber-tag">ACADEMIC LEADERSHIP</div>
            <div className="leader-flex">
              <div className="leader-avatar-block">
                <div className="avatar-frame">
                  <img
                    src="/Principal.webp"
                    alt="Dr. Vijay Wadhai"
                    className="leader-img"
                  />
                  <div className="avatar-glow-ring" />
                </div>
                <div className="leader-name">Dr. Vijay Wadhai</div>
                <div className="leader-designation">Principal, SVPCET</div>
              </div>

              <div className="leader-quote-block">
                <Quote size={28} className="quote-icon" />
                <p>
                  &quot;In today&apos;s rapidly evolving technological era, platforms like TECHNEX play a crucial role in nurturing innovation, creativity, and problem-solving abilities among students.&quot;
                </p>
                <p>
                  &quot;Through hackathons, design challenges, and workshops, participants gain hands-on experience and industry exposure, bridging academic learning with real-world applications. My warmest best wishes to every innovator participating in this grand symposium.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. ABOUT TECHNEX LEGACY */}
        {/* ========================================================= */}
        <div className="about-glass-panel legacy-panel">
          <div className="panel-cyber-tag">CENTRAL INDIA&apos;S BIGGEST TECH FEST</div>
          <h3 className="panel-title">The Technex Legacy</h3>

          <div className="legacy-text-grid">
            <p>
              <strong>Technex</strong> is the National Level Annual Technical Fest of St. Vincent Pallotti College of Engineering and Technology, Nagpur. Today, it proudly stands as <strong>Central India&apos;s Largest Science and Technology Fest</strong>, bringing together over 3,000+ technology enthusiasts each year for an electrifying celebration of ingenuity, code, robotics, and creative design.
            </p>
            <p>
              Organized and driven by an autonomous team of passionate students under the guidance of esteemed faculty mentors, Technex has been fostering innovation since its inception in 2007. Over nearly two decades, it has hosted international keynote speakers, high-stakes coding arenas, drone racing circuits, and patent workshops.
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. DISTINGUISHED CHIEF GUESTS & SPEAKERS */}
        {/* ========================================================= */}
        <div className="about-glass-panel guests-panel">
          <div className="panel-cyber-tag">EMINENT DIGNITARIES</div>
          <div className="guests-header-row">
            <div>
              <h3 className="panel-title mb-0">Distinguished Keynote Dignitaries</h3>
              <p className="guests-subtitle">Visionaries, Union Ministers, and Tech Pioneers who have graced Technex</p>
            </div>

            {/* Carousel Controls */}
            <div className="carousel-nav-buttons">
              <button onClick={handlePrevGuest} className="carousel-btn" aria-label="Previous Guest">
                <ChevronLeft size={18} />
              </button>
              <button onClick={handleNextGuest} className="carousel-btn" aria-label="Next Guest">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Active Guest Spotlight */}
          <div className="guest-spotlight-card">
            <div className="guest-spotlight-avatar">
              <img
                src={GUESTS[activeGuest].image}
                alt={GUESTS[activeGuest].name}
                className="guest-spotlight-img"
              />
              <div className="guest-spotlight-badge">
                {GUESTS[activeGuest].role}
              </div>
            </div>

            <div className="guest-spotlight-content">
              <h4 className="guest-name">{GUESTS[activeGuest].name}</h4>
              <p className="guest-title">{GUESTS[activeGuest].title}</p>
              {GUESTS[activeGuest].quote && (
                <div className="guest-quote">
                  <Quote size={20} className="text-[#d9ad62] shrink-0" />
                  <p>&quot;{GUESTS[activeGuest].quote}&quot;</p>
                </div>
              )}
            </div>
          </div>

          {/* Guest Thumbnails Row */}
          <div className="guest-thumbnails-row">
            {GUESTS.map((g, idx) => (
              <button
                key={idx}
                onClick={() => setActiveGuest(idx)}
                className={`guest-thumb-btn ${activeGuest === idx ? 'active' : ''}`}
                title={g.name}
              >
                <img src={g.image} alt={g.name} className="guest-thumb-img" />
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. SPONSORS & PARTNERS */}
        {/* ========================================================= */}
        <div id="sponsors" className="about-glass-panel sponsors-panel">
          <div className="panel-cyber-tag">OUR SUPPORTERS</div>
          <h3 className="panel-title text-center">Sponsored & Supported By</h3>
          <p className="text-center text-sm text-gray-300 mb-6">
            Empowered by industry-leading organizations and visionary education partners
          </p>

          <div className="sponsors-marquee-container">
            <div className="sponsors-grid">
              {SPONSORS.map((s, idx) => (
                <div key={idx} className="sponsor-card group">
                  <img src={s.logo} alt={s.name} className="sponsor-logo" />
                  <span className="sponsor-tag">{s.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

     
     

      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Award,
  Cpu,
  Users,
  Building2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Quote,
  Target,
  Compass,
  Film,
} from "lucide-react";
import MaterializedFrame from "./MaterializedFrame";
import AftermoviePlayer from "./AftermoviePlayer";
import styles from "./about.module.css";

interface StatItem {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

interface DignitaryItem {
  name: string;
  title: string;
  role: string;
  image: string;
  quote?: string;
}

const STATS: StatItem[] = [
  {
    title: "20+ YEARS",
    subtitle: "Legacy of Innovation",
    description: "Established in 2004, inspiring engineering excellence and groundbreaking ideas since day one.",
    icon: <Award className="w-5 h-5 text-[#d9ad62]" />,
  },
  {
    title: "10+ MEGA EVENTS",
    subtitle: "Multidisciplinary Arenas",
    description: "National-level hackathons, robotics challenges, design sprints, and technical exhibitions.",
    icon: <Cpu className="w-5 h-5 text-cyan-400" />,
  },
  {
    title: "3,000+ PARTICIPANTS",
    subtitle: "Nationwide Community",
    description: "An electrified annual congregation of visionary students, creators, and developers from across India.",
    icon: <Users className="w-5 h-5 text-purple-400" />,
  },
];

const CHIEF_GUEST: DignitaryItem = {
  name: "Dr. Shankar S Mantha",
  title: "Chancellor of Ramdeobaba University, Nagpur & Former Chairman, AICTE",
  role: "Honorary Chief Guest",
  image: "/SS-Mantha.webp",
  quote: "Technological symposiums like TECHNEX are the crucibles where raw talent transforms into national innovation and leadership.",
};

const PREVIOUS_GUESTS: DignitaryItem[] = [
  {
    name: "Shri. Nitin Gadkari",
    title: "Minister of Road Transport and Highways of India",
    role: "Distinguished Chief Guest",
    image: "/nitin-gadkari.webp",
    quote: "Very good institution, giving good education and character to the students.",
  },
  {
    name: "Dr. Kavi Arya",
    title: "Founder, E-Yantra & Professor, IIT Bombay",
    role: "Keynote Speaker",
    image: "/kavi-arya.webp",
    quote: "Pallotti College's E-Yantra robotics lab ranks among the top 13 laboratories in India.",
  },
  {
    name: "Dr. Vishnu Vardhan",
    title: "Founder & CEO, Vizzy Multiomics, Bengaluru",
    role: "Guest of Honour",
    image: "/Dr-Vishnu-Vardhan.webp",
    quote: "I am very impressed by the research laboratories and the progressive vision of the institution.",
  },
  {
    name: "Dr. Ritu Jain Gaurav",
    title: "CTO, U2U Systems, Singapore",
    role: "Global Tech Luminary",
    image: "/riitu_jain.webp",
    quote: "I admire the exceptional discipline of St. Vincent Pallotti College; it is a true honour to be here.",
  },
  {
    name: "Dr. Pratap Khanwilkar",
    title: "CEO, Ignition Key, USA",
    role: "International Keynote",
    image: "/Dr-Pratap-Khanwilkar.webp",
    quote: "Dream big, execute, make real things and help people. We are all here to make each other healthier and stronger.",
  },
  {
    name: "Mr. Shrikant Sarda",
    title: "Managing Director, Accenture Technology, Pune",
    role: "Industry Leader",
    image: "/Mr-Shrikant-Sarda.webp",
    quote: "It is my honour to be standing here. I am impressed by the students, their academic rigour, and institution discipline.",
  },
  {
    name: "Dr. Ravinder Singhal",
    title: "Additional Director General of Police (ADGP)",
    role: "Special Guest",
    image: "/Dr-Ravinder-Singhal.webp",
    quote: "Technology driven by youth is the backbone of modern progress and security.",
  },
];

export default function AboutSection() {
  const [currentGuest, setCurrentGuest] = useState(0);
  const carouselTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    carouselTimerRef.current = setInterval(() => {
      setCurrentGuest((prev) => (prev + 1) % PREVIOUS_GUESTS.length);
    }, 5500);

    return () => {
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, []);

  const handlePrev = () => {
    setCurrentGuest((prev) =>
      prev === 0 ? PREVIOUS_GUESTS.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentGuest((prev) => (prev + 1) % PREVIOUS_GUESTS.length);
  };

  return (
    <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 md:pl-20 md:pr-20 lg:pl-24 lg:pr-24 space-y-12 sm:space-y-16">
      {/* ========================================================= */}
      {/* 1. HERO HEADER */}
      {/* ========================================================= */}
      <div className="text-center pt-2 sm:pt-4">
        {/* Thematic Telemetry Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(12,10,18,0.85)] border border-[rgba(217,173,98,0.38)] text-xs font-mono text-[#d9ad62] tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(217,173,98,0.15)] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#d9ad62] animate-spin" style={{ animationDuration: "6s" }} />
          <span>MANIFESTATION PROTOCOL // IMAGINATION IN PHYSICAL FORM</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          About{" "}
          <span className="bg-gradient-to-r from-white via-[#f5e5c9] to-[#d9ad62] bg-clip-text text-transparent">
            Technex
          </span>
        </h1>

        <p className="text-gray-300 mt-4 text-center max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed font-light">
          Unleashing innovation, fostering futuristic talent, and transforming theoretical ideas into real-world technological reality.
        </p>

        {/* 3 Core Stats Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-center mt-8 sm:mt-10">
          {STATS.map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 sm:p-7 rounded-2xl bg-[rgba(14,11,20,0.8)] border border-[rgba(217,173,98,0.22)] hover:border-[rgba(217,173,98,0.65)] hover:bg-[rgba(20,15,28,0.9)] transition-all duration-300 group/stat overflow-hidden shadow-xl shadow-black/70 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-[rgba(217,173,98,0.12)] border border-[rgba(217,173,98,0.3)] flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(217,173,98,0.15)] group-hover/stat:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#ffffff] via-[#f5e5c9] to-[#d9ad62] bg-clip-text text-transparent stat-title">
                {item.title}
              </h3>
              <p className="text-[#d9ad62] text-xs font-mono uppercase tracking-wider mt-1 font-semibold">
                {item.subtitle}
              </p>
              <p className="text-gray-300 mt-2.5 text-xs sm:text-sm leading-relaxed font-light">
                {item.description}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(217,173,98,0.6)] to-transparent group-hover/stat:via-[#f5e5c9] transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. THE TECHNEX LEGACY & LAST YEAR'S AFTERMOVIE VIDEO */}
      {/* ========================================================= */}
      <MaterializedFrame id="aftermovie" tag="CINEMATICS // FEST_REWIND" glowColor="gold">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-10 items-center">
          {/* Left Text Column */}
          <div className="flex-1 space-y-4 text-gray-200 text-sm sm:text-base order-2 md:order-1 leading-relaxed">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(217,173,98,0.12)] border border-[rgba(217,173,98,0.35)] text-xs font-mono text-[#d9ad62]">
              <Film className="w-3.5 h-3.5" />
              <span>CENTRAL INDIA&apos;S BIGGEST TECH FEST</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#f5e5c9] to-[#d9ad62] bg-clip-text text-transparent">
              The Technex Legacy
            </h2>

            <p>
              <strong>Technex</strong> is the National Level Annual Technical Fest of the St. Vincent Pallotti College of Engineering and Technology, Nagpur. Today, Technex proudly stands as Central India&apos;s largest Science and Technology Fest, bringing together over 3,000+ technology enthusiasts every year for an electrifying celebration of creativity, code, robotics, and design.
            </p>
            <p>
              Organized and driven by an autonomous team of passionate students under the guidance of esteemed faculty mentors, Technex has been fostering innovation and technological excellence since its inception in 2007.
            </p>
            <p className="text-gray-300">
              Over nearly two decades, Technex has hosted international keynote speakers, high-stakes coding arenas, drone racing circuits, and patent workshops. Experience the atmosphere, the crowd, and the pulse of Technex in the official aftermovie.
            </p>
          </div>

          {/* Right Video Column (Last Year's Official Video) */}
          <div className="w-full md:w-1/2 flex-shrink-0 order-1 md:order-2">
            <AftermoviePlayer />
          </div>
        </div>
      </MaterializedFrame>

      {/* ========================================================= */}
      {/* 3. WELCOME TO PALLOTTI (SVPCET CAMPUS) */}
      {/* ========================================================= */}
      <MaterializedFrame tag="FOUNDATION // SVPCET_CAMPUS" glowColor="gold">
        <h2 className="text-2xl sm:text-4xl font-extrabold mb-6 sm:mb-8 text-center tracking-tight bg-gradient-to-r from-white via-[#f5e5c9] to-[#d9ad62] bg-clip-text text-transparent">
          Welcome to Pallotti
        </h2>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Campus Photo */}
          <div className="w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#090f26] border border-[rgba(217,173,98,0.35)] group">
              <img
                src="/pallotti.webp"
                alt="St. Vincent Pallotti College Campus"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-85" />
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[rgba(12,10,18,0.9)] border border-[rgba(217,173,98,0.45)] text-[11px] font-mono text-[#d9ad62] flex items-center gap-1.5 shadow-lg">
                <Building2 size={13} className="text-[#d9ad62]" />
                <span>CAMPUS // NAAC &apos;A&apos; GRADE ACCREDITED</span>
              </div>
            </div>
          </div>

          {/* Description & Vision/Mission */}
          <div className="space-y-4 text-gray-200 text-sm sm:text-base leading-relaxed">
            <p className="bg-[rgba(16,12,24,0.7)] p-4 rounded-xl border border-[rgba(217,173,98,0.18)]">
              <strong>St. Vincent Pallotti College of Engineering and Technology (SVPCET)</strong> was established in 2004 by the Nagpur Pallottine Society. Accredited by NAAC with <strong>&apos;A&apos; Grade</strong>, the college is affiliated to Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU) and approved by the Directorate of Technical Education (DTE), Mumbai, and AICTE, Government of India.
            </p>

            <div className="p-4 rounded-xl bg-gradient-to-r from-[rgba(217,173,98,0.14)] to-transparent border-l-4 border-[#d9ad62]">
              <div className="flex items-center gap-2 mb-1">
                <Target size={16} className="text-[#d9ad62]" />
                <span className="font-bold text-[#f5e5c9] tracking-wide uppercase text-xs font-mono">Vision</span>
              </div>
              <p className="text-gray-300 text-sm">
                To develop a knowledge-based society with clarity of thoughts and charity at hearts to serve humanity with integrity.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-[rgba(168,85,247,0.14)] to-transparent border-l-4 border-purple-400">
              <div className="flex items-center gap-2 mb-1">
                <Compass size={16} className="text-purple-400" />
                <span className="font-bold text-purple-300 tracking-wide uppercase text-xs font-mono">Mission</span>
              </div>
              <p className="text-gray-300 text-sm">
                To empower youth to be technocrats of tomorrow with absolute discipline, quest for knowledge, and strong ethos to uphold the spirit of professionalism.
              </p>
            </div>
          </div>
        </div>
      </MaterializedFrame>

      {/* ========================================================= */}
      {/* 4. INSTITUTIONAL & ACADEMIC LEADERSHIP */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Director Card */}
        <MaterializedFrame tag="LEADERSHIP // DIRECTOR" glowColor="gold" className="h-full">
          <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start mb-4">
              <div className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[rgba(217,173,98,0.5)] p-1 bg-gradient-to-b from-[#d9ad62]/20 to-transparent shadow-xl">
                <img
                  src="/director_paul_chandrankunnel.webp"
                  alt="Dr. Fr. Paul Chandrankunnel"
                  className="rounded-xl object-cover w-full h-full"
                />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide dignitary-name" style={{ fontFamily: "var(--font-redaction), 'Redaction 20', sans-serif" }}>
                  Dr. Fr. Paul Chandrankunnel
                </h3>
                <p className="text-[#d9ad62] font-mono text-xs sm:text-sm mt-0.5">
                  Director, SVPCET
                </p>
                <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[rgba(217,173,98,0.12)] border border-[rgba(217,173,98,0.3)] text-[10.5px] font-mono text-[#f5e5c9]">
                  Institutional Patron
                </div>
              </div>
            </div>

            <div className="relative bg-[rgba(12,10,18,0.7)] p-4 sm:p-5 rounded-xl border border-[rgba(217,173,98,0.18)] space-y-2.5 text-gray-300 text-xs sm:text-sm leading-relaxed flex-1">
              <Quote className="w-5 h-5 text-[#d9ad62]/70 mb-1" />
              <p>
                &ldquo;Technex, the annual technical festival of St. Vincent Pallotti College of Engineering and Technology, has emerged as a premier national platform where aspiring engineers rub shoulders with each other to claim the coveted prizes.&rdquo;
              </p>
              <p>
                &ldquo;Underlying this promotion is our conviction that competitions offer multiple benefits: critical thinking, teamwork, innovation, and practical application. Students go back with a high sense of achievement, staying focused and inspired to shape the technological future.&rdquo;
              </p>
            </div>
          </div>
        </MaterializedFrame>

        {/* Principal Card */}
        <MaterializedFrame tag="LEADERSHIP // PRINCIPAL" glowColor="gold" className="h-full">
          <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start mb-4">
              <div className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[rgba(217,173,98,0.5)] p-1 bg-gradient-to-b from-[#d9ad62]/20 to-transparent shadow-xl">
                <img
                  src="/Principal.webp"
                  alt="Dr. Vijay Wadhai"
                  className="rounded-xl object-cover w-full h-full"
                />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide dignitary-name" style={{ fontFamily: "var(--font-redaction), 'Redaction 20', sans-serif" }}>
                  Dr. Vijay Wadhai
                </h3>
                <p className="text-[#d9ad62] font-mono text-xs sm:text-sm mt-0.5">
                  Principal, SVPCET
                </p>
                <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[rgba(217,173,98,0.12)] border border-[rgba(217,173,98,0.3)] text-[10.5px] font-mono text-[#f5e5c9]">
                  Academic Patron
                </div>
              </div>
            </div>

            <div className="relative bg-[rgba(12,10,18,0.7)] p-4 sm:p-5 rounded-xl border border-[rgba(217,173,98,0.18)] space-y-2.5 text-gray-300 text-xs sm:text-sm leading-relaxed flex-1">
              <Quote className="w-5 h-5 text-[#d9ad62]/70 mb-1" />
              <p>
                &ldquo;In today&apos;s rapidly evolving technological era, platforms like TECHNEX play a crucial role in nurturing innovation, creativity, and problem-solving abilities among students.&rdquo;
              </p>
              <p>
                &ldquo;Through hackathons, design challenges, and workshops, participants gain hands-on experience and industry exposure, bridging academic learning with real-world applications. My warmest best wishes to every innovator participating in this grand symposium.&rdquo;
              </p>
            </div>
          </div>
        </MaterializedFrame>
      </div>

      {/* ========================================================= */}
      {/* 5. HONORARY CHIEF GUEST */}
      {/* ========================================================= */}
      <section className="my-10 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(217,173,98,0.12)] border border-[rgba(217,173,98,0.35)] text-[11px] font-mono text-[#d9ad62] tracking-wider mb-3">
          HONORARY GUEST OF TECH FEST
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-8">
          Chief Guest
        </h2>

        <div className="relative max-w-lg mx-auto p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0f0c1c] via-[#090712] to-[#040308] border-2 border-[rgba(217,173,98,0.45)] backdrop-blur-2xl shadow-2xl shadow-black/90 group hover:border-[#d9ad62] transition-all duration-500">
          {/* Concentric rotating orbital ring */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto mb-6">
            <div
              className="absolute -inset-2.5 rounded-full border border-dashed border-[#d9ad62]/50 animate-spin"
              style={{ animationDuration: "24s" }}
            />
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#d9ad62]/80 shadow-2xl shadow-[#d9ad62]/20">
              <Image
                src={CHIEF_GUEST.image}
                alt={CHIEF_GUEST.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white dignitary-name" style={{ fontFamily: "var(--font-redaction), 'Redaction 20', sans-serif" }}>
            {CHIEF_GUEST.name}
          </h3>
          <p className="text-[#d9ad62] font-mono text-xs sm:text-sm mt-1.5 font-semibold">
            {CHIEF_GUEST.title}
          </p>
          {CHIEF_GUEST.quote && (
            <p className="text-gray-300 italic text-xs sm:text-sm mt-4 leading-relaxed font-light border-t border-[rgba(217,173,98,0.2)] pt-3">
              &ldquo;{CHIEF_GUEST.quote}&rdquo;
            </p>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. PREVIOUS KEYNOTE DIGNITARIES CAROUSEL */}
      {/* ========================================================= */}
      <section className="my-12 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-[11px] font-mono text-purple-300 tracking-wider mb-2">
            ARCHIVE // DISTINGUISHED DIGNITARIES
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Distinguished Keynote Dignitaries
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Visionaries, Union Ministers, and Tech Pioneers who have graced Technex
          </p>
        </div>

        <div className="relative w-full max-w-4xl mx-auto min-h-[440px] bg-gradient-to-b from-[#0e0b1c]/90 via-[#080612]/92 to-[#040308]/96 backdrop-blur-2xl border-2 border-[rgba(217,173,98,0.32)] rounded-3xl overflow-hidden p-6 sm:p-10 flex items-center justify-center shadow-2xl shadow-black/90">
          {/* Blueprint corner brackets */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#d9ad62]" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-purple-400" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#d9ad62]" />

          {/* Sliding Slides */}
          <div
            style={{ transform: `translateX(-${100 * currentGuest}%)` }}
            className="flex h-full w-full transition-transform duration-700 ease-in-out"
          >
            {PREVIOUS_GUESTS.map((guest, idx) => (
              <div
                key={idx}
                className="w-full flex-shrink-0 flex flex-col items-center justify-center text-center px-4 sm:px-12"
              >
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-[#d9ad62]/70 shadow-2xl mb-4 group ring-4 ring-[#d9ad62]/20">
                  <Image
                    src={guest.image}
                    alt={guest.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="inline-block px-3 py-0.5 rounded-full bg-[rgba(217,173,98,0.12)] border border-[rgba(217,173,98,0.3)] text-[11px] font-mono text-[#d9ad62] mb-1.5">
                  {guest.role}
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white dignitary-name" style={{ fontFamily: "var(--font-redaction), 'Redaction 20', sans-serif" }}>
                  {guest.name}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm font-mono mt-1 max-w-lg">
                  {guest.title}
                </p>

                {guest.quote && (
                  <div className="relative max-w-2xl mt-5 p-4 sm:p-5 rounded-2xl bg-[rgba(14,11,22,0.75)] border border-[rgba(217,173,98,0.22)] shadow-inner">
                    <Quote className="w-5 h-5 text-[#d9ad62]/70 mb-1.5 mx-auto" />
                    <p className="italic text-gray-200 text-xs sm:text-sm sm:leading-relaxed">
                      &ldquo;{guest.quote}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Carousel Manual Controls */}
          <button
            onClick={handlePrev}
            aria-label="Previous Keynote Dignitary"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[rgba(12,10,18,0.85)] border border-[rgba(217,173,98,0.4)] text-white flex items-center justify-center hover:bg-[#d9ad62] hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 z-10 shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Keynote Dignitary"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[rgba(12,10,18,0.85)] border border-[rgba(217,173,98,0.4)] text-white flex items-center justify-center hover:bg-[#d9ad62] hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 z-10 shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {PREVIOUS_GUESTS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentGuest(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentGuest === idx
                    ? "w-8 bg-gradient-to-r from-[#f5e5c9] to-[#d9ad62] shadow-lg shadow-[#d9ad62]/50"
                    : "w-2 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

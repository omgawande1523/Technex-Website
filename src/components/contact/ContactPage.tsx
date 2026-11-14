'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  User, 
  Phone, 
  MessageSquare, 
  Send, 
  MapPin, 
  ExternalLink, 
  Check, 
  Compass, 
  RotateCcw
} from 'lucide-react';
import './contact.css';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [referenceId, setReferenceId] = useState<string>('');

  const mapsUrl = 'https://maps.app.goo.gl/45tcBrvjHRctXK5e9';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const randomRef = `TNX-${Math.floor(10000 + Math.random() * 90000)}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setReferenceId(randomRef);
      setIsSubmitted(true);
    }, 700);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="relative min-h-screen text-[#f1ede6] pt-[76px] sm:pt-[84px] pb-28 sm:pb-16 px-3.5 sm:px-6 lg:px-8 selection:bg-[#d9ad62]/30 selection:text-[#fcedc7]">
      {/* ================= BACKGROUND SYSTEM (PERMANENT BG DESKTOP & MOBILE) ================= */}
      {/* Desktop Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat hidden md:block"
        style={{ backgroundImage: `url('/assets/bg/permanent-bg.webp')` }}
      />
      {/* Mobile Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat block md:hidden"
        style={{ backgroundImage: `url('/assets/bg/permanent-bg-mobile.webp')` }}
      />

      {/* Atmosphere & Blueprint Line-Art Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        {/* Faint Engineering Blueprint Line-Art Overlay */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none stroke-[#d9ad62]" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="blueprint-grid-next" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" strokeWidth="0.7" />
              <circle cx="40" cy="40" r="1.5" fill="currentColor" fillOpacity="0.4" />
              <path d="M 30 40 L 50 40 M 40 30 L 40 50" strokeWidth="0.5" strokeDasharray="2 2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid-next)" />
          <circle cx="20%" cy="40%" r="220" fill="none" strokeWidth="0.8" strokeDasharray="4 8" />
          <circle cx="20%" cy="40%" r="340" fill="none" strokeWidth="0.6" />
          <circle cx="85%" cy="65%" r="280" fill="none" strokeWidth="0.8" strokeDasharray="6 6" />
          <line x1="0" y1="40%" x2="100%" y2="40%" strokeWidth="0.5" strokeDasharray="3 9" />
          <line x1="85%" y1="0" x2="85%" y2="100%" strokeWidth="0.5" strokeDasharray="3 9" />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-6 sm:space-y-10">

        {/* ================= BANNER 1: CONTACT HEADING (RESPONSIVE PARCHMENT BANNER) ================= */}
        <section className="text-center relative pt-1 sm:pt-2">
          <div className="relative max-w-xl sm:max-w-2xl mx-auto drop-shadow-[0_16px_32px_rgba(0,0,0,0.9)]">
            {/* Hanging Parchment Asset with responsive height on mobile */}
            <img
              src="/assets/decor/hanging_parchment_banner.webp"
              alt="Hanging Parchment Banner"
              className="w-full h-[148px] sm:h-auto object-fill sm:object-contain pointer-events-none select-none"
            />

            {/* Content centered over parchment with responsive padding & typography */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-12 pt-6 sm:pt-11 pb-3 sm:pb-9">
              <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1.5 opacity-85">
                <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#5c3b1e]" />
                <span className="font-cinzel text-[9px] sm:text-[11px] font-bold tracking-[0.16em] sm:tracking-[0.2em] text-[#5c3b1e] uppercase">
                  Official Communication
                </span>
              </div>

              <h1 className="font-cinzel text-xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.08em] uppercase text-[#231307] drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)] leading-tight mb-0.5 sm:mb-2">
                Contact Us
              </h1>

              <p className="max-w-[275px] sm:max-w-lg mx-auto font-sans text-[11px] sm:text-sm text-[#3e2716] font-medium leading-snug sm:leading-relaxed tracking-wide">
                Have a question, an idea, or something exciting to discuss? We&apos;d love to hear from you.
              </p>
            </div>
          </div>
        </section>

        {/* ================= 2. MAIN TWO-COLUMN SECTION ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-stretch">
          {/* ---------------- LEFT COLUMN: CONTACT FORM ---------------- */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="antique-panel rounded-xl p-4 sm:p-7 lg:p-8 flex-1 flex flex-col justify-between relative overflow-hidden">
              {/* Corner ornaments */}
              <div className="corner-ornament top-left z-20" />
              <div className="corner-ornament top-right z-20" />
              <div className="corner-ornament bottom-left z-20" />
              <div className="corner-ornament bottom-right z-20" />

              {/* ================= LEFT CARD ENGINEERING BLUEPRINT BACKGROUND TEXTURE ================= */}
              {/* Full card background blueprint linework */}
              <div 
                className="absolute inset-0 pointer-events-none select-none z-0 bg-no-repeat opacity-[0.14] mix-blend-screen"
                style={{
                  backgroundImage: `url('/assets/decor/blueprint_texture_master.webp')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'left bottom',
                  filter: 'contrast(1.25) brightness(1.2)',
                }}
              />

              {/* Top-Right accent: fine-line gear assembly */}
              <div 
                className="absolute -top-3 -right-6 w-[220px] sm:w-[340px] h-[130px] sm:h-[170px] pointer-events-none select-none z-0 opacity-[0.12] sm:opacity-[0.15] mix-blend-screen"
                style={{
                  maskImage: 'radial-gradient(circle at 75% 30%, black 35%, transparent 80%)',
                  WebkitMaskImage: 'radial-gradient(circle at 75% 30%, black 35%, transparent 80%)',
                }}
              >
                <img
                  src="/assets/decor/davinci_gears_cluster.webp"
                  alt=""
                  className="w-full h-full object-contain filter contrast-130 brightness-120"
                />
              </div>

              {/* Bottom-Right accent: aerodynamic wing elevation */}
              <div 
                className="absolute -bottom-6 -right-6 w-[250px] sm:w-[400px] h-[120px] sm:h-[160px] pointer-events-none select-none z-0 opacity-[0.12] sm:opacity-[0.14] mix-blend-screen"
                style={{
                  maskImage: 'radial-gradient(circle at 75% 75%, black 30%, transparent 80%)',
                  WebkitMaskImage: 'radial-gradient(circle at 75% 75%, black 30%, transparent 80%)',
                }}
              >
                <img
                  src="/assets/decor/davinci_wing_elevation.webp"
                  alt=""
                  className="w-full h-full object-contain filter contrast-130 brightness-120"
                />
              </div>

              {/* Panel Header */}
              <div className="relative z-10 border-b border-[#d9ad62]/20 pb-3 sm:pb-4 mb-4 sm:mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-cinzel text-lg sm:text-2xl font-bold tracking-wider text-[#f7eedb] flex items-center gap-2 sm:gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#d9ad62]" />
                    Send Us a Message
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-[#b8a691] mt-0.5 sm:mt-1">
                    Fill out the form below and our team will get back to you promptly.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[#d9ad62]/60 text-xs font-mono tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d9ad62]/70" />
                  <span>REGISTRY</span>
                </div>
              </div>

              {/* Form Content / Success State */}
              <div className="relative z-10 flex-1 flex flex-col justify-between">
              {isSubmitted ? (
                <div className="py-6 sm:py-10 px-2 sm:px-4 text-center my-auto space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-[#d9ad62]/15 border border-[#d9ad62]/60 flex items-center justify-center shadow-[0_0_25px_rgba(217,173,98,0.25)]">
                    <Check className="w-7 h-7 sm:w-8 sm:h-8 text-[#d9ad62] stroke-[2.5]" />
                  </div>
                  
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#fceccb]">
                      Message Successfully Dispatched
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#d4c3b0] max-w-md mx-auto">
                      Thank you, <span className="text-[#f7eedb] font-semibold">{formData.name}</span>. Your inquiry has been logged in our registry.
                    </p>
                  </div>

                  <div className="inline-block px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-md bg-[#24170d] border border-[#d9ad62]/40 shadow-inner">
                    <span className="font-mono text-[11px] sm:text-xs text-[#d9ad62] font-semibold tracking-wider">
                      REFERENCE ID: {referenceId}
                    </span>
                  </div>

                  <div className="pt-2 sm:pt-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="gold-btn px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg font-cinzel text-xs font-bold tracking-widest uppercase inline-flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Send Another Message</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label htmlFor="name" className="block font-cinzel text-[11px] sm:text-xs font-semibold tracking-wider text-[#d9ad62] uppercase">
                        Your Name <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative flex items-center group">
                        <div className="absolute left-3 sm:left-3.5 text-[#d9ad62]/60 group-focus-within:text-[#d9ad62] transition-colors pointer-events-none">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. John Doe"
                          className="antique-input w-full pl-9 sm:pl-10 pr-3.5 sm:pr-4 py-2 sm:py-2.5 rounded-lg text-base sm:text-sm font-sans"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label htmlFor="email" className="block font-cinzel text-[11px] sm:text-xs font-semibold tracking-wider text-[#d9ad62] uppercase">
                        Your Email <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative flex items-center group">
                        <div className="absolute left-3 sm:left-3.5 text-[#d9ad62]/60 group-focus-within:text-[#d9ad62] transition-colors pointer-events-none">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="e.g. johndoe@domain.com"
                          className="antique-input w-full pl-9 sm:pl-10 pr-3.5 sm:pr-4 py-2 sm:py-2.5 rounded-lg text-base sm:text-sm font-sans"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label htmlFor="phone" className="block font-cinzel text-[11px] sm:text-xs font-semibold tracking-wider text-[#d9ad62] uppercase">
                        Phone Number <span className="text-[#a48e77] text-[10px] font-normal lowercase">(optional)</span>
                      </label>
                      <div className="relative flex items-center group">
                        <div className="absolute left-3 sm:left-3.5 text-[#d9ad62]/60 group-focus-within:text-[#d9ad62] transition-colors pointer-events-none">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="antique-input w-full pl-9 sm:pl-10 pr-3.5 sm:pr-4 py-2 sm:py-2.5 rounded-lg text-base sm:text-sm font-sans"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-1">
                      <label htmlFor="message" className="block font-cinzel text-[11px] sm:text-xs font-semibold tracking-wider text-[#d9ad62] uppercase">
                        Your Message <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3 sm:left-3.5 top-2.5 sm:top-3 text-[#d9ad62]/60 group-focus-within:text-[#d9ad62] transition-colors pointer-events-none">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={3}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="How can we assist you with TECHNEX 26-27?"
                          className="antique-input w-full pl-9 sm:pl-10 pr-3.5 sm:pr-4 py-2 sm:py-2.5 min-h-[96px] sm:min-h-[110px] rounded-lg text-base sm:text-sm font-sans resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-1.5 sm:pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="gold-btn w-full py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg font-cinzel text-xs sm:text-sm font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#170d04] border-t-transparent rounded-full animate-spin" />
                          <span>Dispatching Message...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 -rotate-12" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
              </div>
            </div>
          </div>

          {/* ---------------- RIGHT COLUMN: OUR LOCATION WITH FANTASY MAP ---------------- */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="antique-panel rounded-xl p-4 sm:p-7 lg:p-8 flex-1 flex flex-col justify-between relative overflow-hidden">
              {/* Corner ornaments */}
              <div className="corner-ornament top-left z-20" />
              <div className="corner-ornament top-right z-20" />
              <div className="corner-ornament bottom-left z-20" />
              <div className="corner-ornament bottom-right z-20" />

              {/* ================= EMBEDDED DA VINCI ENGINEERING BLUEPRINT TEXTURES ================= */}
              {/* Full card background blueprint linework */}
              <div 
                className="absolute inset-0 pointer-events-none select-none z-0 bg-no-repeat opacity-[0.13] mix-blend-screen"
                style={{
                  backgroundImage: `url('/assets/decor/blueprint_texture_master.webp')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'right top',
                  filter: 'contrast(1.25) brightness(1.2)',
                }}
              />

              {/* 1. Da Vinci Flying Machine Wings & Flight Arc */}
              <div 
                className="absolute -top-4 -right-10 w-[280px] sm:w-[500px] h-[160px] sm:h-[260px] pointer-events-none select-none z-0 opacity-[0.12] sm:opacity-[0.14] mix-blend-screen"
                style={{
                  maskImage: 'radial-gradient(circle at 65% 35%, black 30%, transparent 80%)',
                  WebkitMaskImage: 'radial-gradient(circle at 65% 35%, black 30%, transparent 80%)',
                }}
              >
                <img
                  src="/assets/decor/davinci_wings_spread.webp"
                  alt=""
                  className="w-full h-full object-contain filter contrast-125 brightness-110"
                />
              </div>

              {/* 2. Da Vinci Mechanical Gears & Linkages */}
              <div 
                className="absolute -bottom-6 -left-8 w-[250px] sm:w-[440px] h-[140px] sm:h-[200px] pointer-events-none select-none z-0 opacity-[0.12] sm:opacity-[0.13] mix-blend-screen"
                style={{
                  maskImage: 'radial-gradient(circle at 35% 65%, black 25%, transparent 75%)',
                  WebkitMaskImage: 'radial-gradient(circle at 35% 65%, black 25%, transparent 75%)',
                }}
              >
                <img
                  src="/assets/decor/davinci_gears_linkage.webp"
                  alt=""
                  className="w-full h-full object-contain filter contrast-125 brightness-110"
                />
              </div>

              {/* Panel Header */}
              <div className="relative z-10 border-b border-[#d9ad62]/20 pb-3 sm:pb-4 mb-4 sm:mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-cinzel text-lg sm:text-2xl font-bold tracking-wider text-[#f7eedb] flex items-center gap-2 sm:gap-2.5">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#d9ad62]" />
                    Our Location
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-[#b8a691] mt-0.5 sm:mt-1">
                    St. Vincent Pallotti College of Engineering & Technology
                  </p>
                </div>
                {/* Engineering Blueprint Spec Tag */}
                <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-[#d9ad62]/60 uppercase tracking-widest border border-[#d9ad62]/25 px-2 py-0.5 rounded bg-[#150f0a]">
                  <span>ATLAS // 1:200M</span>
                </div>
              </div>

              {/* Fantasy Campus Map (Clickable to Google Maps Destination) */}
              <div className="relative z-10 space-y-3.5 sm:space-y-4 flex-1 flex flex-col justify-between">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block rounded-lg overflow-hidden border border-[#d9ad62]/35 shadow-[0_8px_24px_rgba(0,0,0,0.8)] bg-[#0d0906] h-52 sm:h-64 lg:h-[280px] cursor-pointer transition-all duration-300 hover:border-[#d9ad62]/75 hover:shadow-[0_0_28px_rgba(217,173,98,0.22)]"
                  title="Click to open St. Vincent Pallotti College in Google Maps"
                >
                  <img
                    src="/assets/decor/fantasy_campus_map.webp"
                    alt="St. Vincent Pallotti College Campus Illustrated Fantasy Map"
                    className="w-full h-full object-cover object-center filter contrast-[1.08] brightness-[0.92] group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                  />

                  {/* Dark vignette layers */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0705]/85 via-transparent to-[#0a0705]/35 pointer-events-none" />
                  <div className="absolute inset-0 shadow-[inset_0_0_24px_rgba(5,4,6,0.85)] pointer-events-none" />
                  <div className="absolute inset-0 border border-[#d9ad62]/20 pointer-events-none" />

                  {/* Top-left Cartography Badge */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-[#0a0705]/85 border border-[#d9ad62]/30 backdrop-blur-sm pointer-events-none shadow-md">
                    <Compass className="w-3 h-3 text-[#d9ad62]" />
                    <span className="font-cinzel text-[9px] sm:text-[10px] tracking-widest text-[#d9ad62]/90 uppercase font-semibold">
                      CAMPUS ATLAS
                    </span>
                  </div>

                  {/* Bottom Interactive Indicator */}
                  <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#120c07]/90 border border-[#d9ad62]/40 backdrop-blur-md text-[#f7eedb] group-hover:text-white group-hover:bg-[#1f140c] group-hover:border-[#d9ad62] transition-all shadow-md">
                    <span className="font-cinzel text-[10px] sm:text-[11px] font-bold tracking-wider text-[#d9ad62] group-hover:text-[#fcedc7]">
                      Open in Google Maps
                    </span>
                    <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d9ad62] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>

                {/* College Address Box with Embedded Engineering Engraving */}
                <div className="relative overflow-hidden p-3.5 sm:p-4 rounded-lg bg-[#18110b]/80 border border-[#d9ad62]/25 space-y-2 backdrop-blur-[2px]">
                  {/* Subtle Faint Mechanical Linkage Engraving in Address Background */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-36 sm:w-48 pointer-events-none select-none opacity-[0.12] mix-blend-screen overflow-hidden"
                    style={{
                      maskImage: 'linear-gradient(to left, black 20%, transparent 90%)',
                      WebkitMaskImage: 'linear-gradient(to left, black 20%, transparent 90%)',
                    }}
                  >
                    <img
                      src="/assets/decor/davinci_gears_linkage.webp"
                      alt=""
                      className="w-full h-full object-cover object-right filter contrast-125 brightness-110"
                    />
                  </div>

                  <div className="relative z-10 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#d9ad62] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-cinzel text-xs font-bold tracking-wider text-[#fceccb] uppercase">
                        Campus Address
                      </h4>
                      <p className="font-sans text-xs sm:text-sm text-[#c7baa7] leading-relaxed mt-0.5">
                        St. Vincent Pallotti College of Engineering and Technology,
                        <br />
                        Gavsi Manapur, Wardha Road, Nagpur – 441108, Maharashtra, India.
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 pt-2 border-t border-[#d9ad62]/15 flex flex-wrap items-center justify-between gap-1.5">
                    <span className="font-mono text-[10px] sm:text-[11px] text-[#a48e77]">
                      Lat 21.0581° N • Long 79.0413° E
                    </span>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-cinzel text-xs font-bold text-[#d9ad62] hover:text-[#fcedc7] transition-colors"
                    >
                      <span>Get Directions</span>
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. TECHNEX FOOTER ================= */}
        <section className="pt-1 sm:pt-2">
          <div className="antique-panel rounded-xl p-4 sm:p-6 relative">
            {/* Corner ornaments */}
            <div className="corner-ornament top-left" />
            <div className="corner-ornament top-right" />
            <div className="corner-ornament bottom-left" />
            <div className="corner-ornament bottom-right" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center divide-y md:divide-y-0 md:divide-x divide-[#d9ad62]/15">
              
              {/* Contact 1 — Lalit Rathod */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left justify-center md:justify-start px-2 sm:px-4 pb-4 md:pb-0">
                <div className="w-10 h-10 rounded-full bg-[#d9ad62]/15 border border-[#d9ad62]/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(217,173,98,0.15)]">
                  <User className="w-4 h-4 text-[#d9ad62]" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 sm:gap-2.5 justify-center sm:justify-start flex-wrap">
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#f7eedb] tracking-wider">
                      Lalit Rathod
                    </h3>
                    <span className="font-mono text-[9px] sm:text-[10px] tracking-wider text-[#d9ad62] uppercase border border-[#d9ad62]/30 px-1.5 sm:px-2 py-0.5 rounded bg-[#150f0a]">
                      Coordinator
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs font-sans text-[#b8a691]">
                    <a
                      href="mailto:technex@stvincentngp.edu.in"
                      className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-[#f7eedb] hover:text-[#d9ad62] transition-colors break-all sm:break-normal"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#d9ad62]/80 shrink-0" />
                      <span>technex@stvincentngp.edu.in</span>
                    </a>
                    <span className="hidden sm:inline text-[#d9ad62]/40">•</span>
                    <a
                      href="tel:+917757872997"
                      className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-[#f7eedb] hover:text-[#d9ad62] transition-colors font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#d9ad62]/80 shrink-0" />
                      <span>+91 77578 72997</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact 2 — Kevin Fernandes */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left justify-center md:justify-start px-2 sm:px-4 pt-4 md:pt-0 md:pl-8">
                <div className="w-10 h-10 rounded-full bg-[#d9ad62]/15 border border-[#d9ad62]/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(217,173,98,0.15)]">
                  <User className="w-4 h-4 text-[#d9ad62]" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 sm:gap-2.5 justify-center sm:justify-start flex-wrap">
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#f7eedb] tracking-wider">
                      Kevin Fernandes
                    </h3>
                    <span className="font-mono text-[9px] sm:text-[10px] tracking-wider text-[#d9ad62] uppercase border border-[#d9ad62]/30 px-1.5 sm:px-2 py-0.5 rounded bg-[#150f0a]">
                      Coordinator
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs font-sans text-[#b8a691]">
                    <a
                      href="mailto:technex@stvincentngp.edu.in"
                      className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-[#f7eedb] hover:text-[#d9ad62] transition-colors break-all sm:break-normal"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#d9ad62]/80 shrink-0" />
                      <span>technex@stvincentngp.edu.in</span>
                    </a>
                    <span className="hidden sm:inline text-[#d9ad62]/40">•</span>
                    <a
                      href="tel:+917888114475"
                      className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-[#f7eedb] hover:text-[#d9ad62] transition-colors font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#d9ad62]/80 shrink-0" />
                      <span>+91 78881 14475</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

     
        </section>

      </div>
    </div>
  );
}

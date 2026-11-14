"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Send,
  MapPin,
  Check,
  Copy,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import {
  HeaderStarOrnament,
  CartoucheBanner,
  RenaissanceFrame,
} from "./DaVinciSketches";
import "./contact.css";

interface TeamMember {
  name: string;
  role: string;
  email: string;
  phone: string;
  tel: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Lalit Rathod",
    role: "Coordinator",
    email: "technex@stvincentngp.edu.in",
    phone: "+91 77578 72997",
    tel: "+917757872997",
  },
  {
    name: "Kevin Fernandes",
    role: "Coordinator",
    email: "technex@stvincentngp.edu.in",
    phone: "+91 78881 14475",
    tel: "+917888114475",
  },
];

export default function ContactContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const id = `TNX-${Math.floor(10000 + Math.random() * 90000)}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setReferenceId(id);
      setIsSubmitted(true);
    }, 650);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <main className="relative z-0 pt-24 sm:pt-28 pb-28 md:pb-20 px-3 sm:px-8 md:pl-24 md:pr-24 lg:pl-28 lg:pr-28 max-w-[1140px] mx-auto">
      {/* Main Rolled Da Vinci Parchment Scroll */}
      <div className="relative max-w-[900px] mx-auto drop-shadow-[0_24px_65px_rgba(0,0,0,0.85)]">
        {/* BACKGROUND LAYER: High-Resolution 3-Slice Real Parchment Scroll (1:1 Aspect on Every Viewport) */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 z-0"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 1.5%, black 98.5%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 1.5%, black 98.5%, transparent 100%)",
          }}
        >
          <div
            className="relative w-full h-full overflow-hidden rounded-2xl"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 1.2%, black 98.8%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 1.2%, black 98.8%, transparent 100%)",
            }}
          >
            {/* Seamless repeating middle parchment sheet tucked strictly behind top/bottom roll caps */}
            <div
              className="absolute inset-x-0 top-[60px] bottom-[60px] z-0"
              style={{
                backgroundImage: "url('/assets/scroll/scroll_mid.webp')",
                backgroundRepeat: "repeat-y",
                backgroundSize: "100% auto",
                backgroundPosition: "top center",
              }}
            />

            {/* Top rolled cylinder + Da Vinci satellite & ornithopter sketches */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/scroll/scroll_top.webp"
              alt=""
              loading="eager"
              decoding="sync"
              draggable={false}
              className="relative z-[1] w-full h-auto block"
            />

            {/* Bottom Da Vinci campus engineering panorama + rolled bottom cylinder */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/scroll/scroll_bottom.webp"
              alt=""
              loading="eager"
              decoding="sync"
              draggable={false}
              className="absolute bottom-0 left-0 z-[1] w-full h-auto block"
            />
          </div>
        </div>

        {/* UPPER LAYER: Interactive Contact Page Content on the Parchment Scroll */}
        <div className="relative z-10 text-[#2c1506] px-[7.5%] sm:px-[8.5%] pt-[16.5%] pb-[39.5%] sm:pb-[40.5%]">
          {/* TOP HERO HEADING (Centered Safely Between Top-Left Satellite & Top-Right Wing Sketches) */}
          <div className="text-center max-w-[260px] sm:max-w-[420px] md:max-w-[520px] mx-auto mb-7 sm:mb-10 md:mb-14">
            <HeaderStarOrnament />

            <h1 className="font-black text-[23px] sm:text-4xl md:text-[52px] text-[#2a1305] tracking-tight drop-shadow-[0_1px_0_rgba(255,244,214,0.65)] leading-[1.08] mt-0.5 sm:mt-1" style={{ fontFamily: "var(--font-metal-mania), 'Metal Mania', cursive, sans-serif" }}>
              Contact Us
            </h1>

            <p className="font-parchment-serif text-[#3b1e0a] text-[11px] sm:text-[15px] md:text-[17px] leading-snug mt-1.5 sm:mt-2 font-semibold">
              Have a Query, Collaboration Idea, or General Question?
              <br className="hidden sm:inline" />{" "}
              We&apos;d love to hear from you!
            </p>

            {/* Official Email Dispatch Badge */}
            <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-[#5e3819]/55 bg-[#f4daa3]/55 shadow-[0_2px_8px_rgba(44,21,6,0.12)]">
              <Mail className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#5e3819] flex-shrink-0" />
              <a
                href="mailto:technex@stvincentngp.edu.in"
                className="font-renaissance font-bold text-xs sm:text-[14.5px] text-[#261104] hover:text-[#5e3819] hover:underline transition-colors tracking-wide"
              >
                technex@stvincentngp.edu.in
              </a>
              <button
                type="button"
                onClick={() =>
                  handleCopy("technex@stvincentngp.edu.in", "official-email-badge")
                }
                title="Copy Official Email"
                aria-label="Copy official email"
                className="p-1 rounded hover:bg-[#5e3819]/15 text-[#5e3819] transition-colors flex-shrink-0 cursor-pointer ml-0.5"
              >
                {copiedKey === "official-email-badge" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-800" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* MAIN 2-COLUMN PARCHMENT PANELS: SEND US A MESSAGE & OUR LOCATION */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 items-stretch">
            {/* LEFT PANEL: SEND US A MESSAGE */}
            <RenaissanceFrame
              topBadge={
                <CartoucheBanner innerClassName="px-4 sm:px-5">
                  <span className="text-[11px] text-[#4a250a] leading-none" aria-hidden="true">
                    •
                  </span>
                  <span className="font-renaissance font-bold text-[15px] sm:text-[17px] text-[#261104] tracking-tight">
                    Send us a Message
                  </span>
                  <span className="text-[11px] text-[#4a250a] leading-none" aria-hidden="true">
                    •
                  </span>
                </CartoucheBanner>
              }
            >
              {isSubmitted ? (
                <div className="py-9 px-3 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#7e2216] via-[#5e140b] to-[#3a0a04] border-2 border-[#d49e54] shadow-lg flex items-center justify-center text-[#f7e5c0]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-renaissance font-bold text-2xl text-[#2a1305]">
                    Scroll Sealed &amp; Dispatched!
                  </h3>
                  <p className="font-parchment-serif text-sm sm:text-base text-[#3b1e0a] leading-relaxed">
                    Thank you,{" "}
                    <span className="font-bold underline decoration-[#7a4b23]">
                      {formData.name}
                    </span>
                    . Your message has been received by the Technex SVPCET
                    committee. We will reply to{" "}
                    <span className="font-bold">{formData.email}</span> shortly.
                  </p>
                  <div className="inline-block px-3.5 py-1 rounded border border-[#6e4420]/60 bg-[#edd3a0]/60 font-mono text-xs text-[#3b1e0a] font-semibold">
                    REF ID: {referenceId}
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="parchment-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-renaissance font-bold text-sm cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Send Another Message</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full space-y-3">
                  <div className="space-y-3">
                    {/* Your Name */}
                    <div className="relative flex items-center group">
                      <div className="absolute left-3.5 text-[#3a1c07]/90 group-focus-within:text-[#261104] pointer-events-none transition-colors">
                        <User className="w-4 h-4 fill-[#3a1c07]/85" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your Name"
                        aria-label="Your Name"
                        style={{ backgroundColor: 'transparent' }}
                        className="parchment-input w-full pl-10 pr-3.5 py-2.5 rounded-[2px] font-parchment-serif text-[15.5px] font-semibold"
                      />
                    </div>

                    {/* Your Email */}
                    <div className="relative flex items-center group">
                      <div className="absolute left-3.5 text-[#3a1c07]/90 group-focus-within:text-[#261104] pointer-events-none transition-colors">
                        <Mail className="w-4 h-4 stroke-[2]" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your Email"
                        aria-label="Your Email"
                        style={{ backgroundColor: 'transparent' }}
                        className="parchment-input w-full pl-10 pr-3.5 py-2.5 rounded-[2px] font-parchment-serif text-[15.5px] font-semibold"
                      />
                    </div>

                    {/* Your Phone Number */}
                    <div className="relative flex items-center group">
                      <div className="absolute left-3.5 text-[#3a1c07]/90 group-focus-within:text-[#261104] pointer-events-none transition-colors">
                        <Phone className="w-4 h-4 fill-[#3a1c07]/85" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your Phone Number"
                        aria-label="Your Phone Number"
                        style={{ backgroundColor: 'transparent' }}
                        className="parchment-input w-full pl-10 pr-3.5 py-2.5 rounded-[2px] font-parchment-serif text-[15.5px] font-semibold"
                      />
                    </div>

                    {/* Your Message */}
                    <div className="relative group">
                      <div className="absolute left-3.5 top-3 text-[#3a1c07]/90 group-focus-within:text-[#261104] pointer-events-none transition-colors">
                        <MessageSquare className="w-4 h-4 stroke-[2]" />
                      </div>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Your Message"
                        aria-label="Your Message"
                        style={{ backgroundColor: 'transparent' }}
                        className="parchment-input w-full pl-10 pr-3.5 py-2.5 min-h-[112px] rounded-[2px] font-parchment-serif text-[15.5px] font-semibold resize-none"
                      />
                    </div>
                  </div>

                  {/* Double-Beveled Hexagonal Submit Seal Button */}
                  <div className="pt-2 flex justify-center">
                    <div
                      className="inline-block p-[1.5px] bg-gradient-to-b from-[#d9ad68] via-[#b88342] to-[#7d4e1d] shadow-[0_5px_14px_rgba(34,14,3,0.45)]"
                      style={{
                        clipPath:
                          "polygon(13px 0, calc(100% - 13px) 0, 100% 50%, calc(100% - 13px) 100%, 13px 100%, 0 50%)",
                      }}
                    >
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="parchment-btn relative border-0 px-8 py-2.5 inline-flex items-center gap-2.5 font-renaissance font-bold text-base sm:text-[17px] tracking-wide cursor-pointer disabled:opacity-60"
                        style={{
                          clipPath:
                            "polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%)",
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-[#f7e6c4] border-t-transparent rounded-full animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <Send className="w-4 h-4 -rotate-6" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </RenaissanceFrame>

            {/* RIGHT PANEL: OUR LOCATION */}
            <RenaissanceFrame
              className="flex flex-col"
              topBadge={
                <CartoucheBanner innerClassName="px-4 sm:px-5">
                  <MapPin className="w-[17px] h-[17px] text-[#f5dfb1] fill-[#2a1204]" />
                  <span className="font-renaissance font-bold text-[15px] sm:text-[17px] text-[#261104] tracking-tight">
                    Our Location
                  </span>
                </CartoucheBanner>
              }
            >
              <div className="flex flex-col justify-between h-full gap-3.5">
                {/* Embedded Crisp Google Map in Antique Double-Ruled Frame */}
                <div className="p-[3px] rounded-[3px] bg-gradient-to-b from-[#d8b173]/65 via-[#aa7b42]/50 to-[#6e431a]/65 border border-[#4a250a]/85 shadow-[0_4px_12px_rgba(44,21,6,0.2)]">
                  <div className="relative rounded-[2px] overflow-hidden h-52 sm:h-[238px] border border-[#5e3819]/75 bg-[#e5e3df]">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.364239841315!2d79.04130097593685!3d21.05810458694084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4be74c1044455%3A0x6b7fa940e4f13768!2sSt.%20Vincent%20Pallotti%20College%20of%20Engineering%20and%20Technology!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="St. Vincent Pallotti College of Engineering and Technology Location"
                      className="w-full h-full"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 shadow-[inset_0_0_14px_rgba(44,21,6,0.22)]"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Campus Address & Directions Lockup */}
                <div className="pt-2.5 pb-0.5 border-t border-[#5e3819]/25 text-[#261104]">
                  <div className="flex items-start justify-center gap-2 px-1">
                    <MapPin className="w-5 h-5 text-[#f4dca8] fill-[#2a1204] flex-shrink-0 mt-0.5" />
                    <div className="font-parchment-serif text-[14px] sm:text-[15.5px] leading-snug font-bold text-left">
                      <p>
                        St. Vincent Pallotti College of Engineering and
                        Technology,
                      </p>
                      <p className="text-[#3e1f0a]">
                        Nagpur &ndash; 441108, Maharashtra, India
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex justify-center">
                    <a
                      href="https://maps.app.goo.gl/45tcBrvjHRctXK5e9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-[2px] border border-[#5e3819]/55 bg-[#f4daa3]/40 hover:bg-[#e7c37f]/65 font-parchment-serif text-xs font-bold text-[#3b1c08] hover:text-[#1f0d02] shadow-[0_1px_4px_rgba(44,21,6,0.12)] transition-all"
                    >
                      <span>Open Directions in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </RenaissanceFrame>
          </div>

          {/* SECTION DIVIDER: GET IN TOUCH WITH OUR TEAM */}
          <div className="relative z-10 mt-8 sm:mt-10 mb-5 flex items-center justify-center gap-1.5 sm:gap-3.5">
            <div className="flex-1 flex items-center min-w-[12px]">
              <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#5e3819]/65 to-[#4a250a]" />
              <span className="text-[8px] text-[#4a250a] ml-1 leading-none" aria-hidden="true">
                ◆
              </span>
            </div>
            <CartoucheBanner innerClassName="px-2.5 sm:px-5">
              <span className="text-[10px] text-[#4a250a] leading-none" aria-hidden="true">
                •
              </span>
              <h2 className="font-title font-bold text-[14px] sm:text-[19px] text-[#261104] tracking-tight" style={{ fontFamily: "var(--font-metal-mania), 'Metal Mania', cursive, sans-serif" }}>
                Get in Touch With Our Team
              </h2>
              <span className="text-[10px] text-[#4a250a] leading-none" aria-hidden="true">
                •
              </span>
            </CartoucheBanner>
            <div className="flex-1 flex items-center min-w-[12px]">
              <span className="text-[8px] text-[#4a250a] mr-1 leading-none" aria-hidden="true">
                ◆
              </span>
              <div className="w-full h-[1.5px] bg-gradient-to-l from-transparent via-[#5e3819]/65 to-[#4a250a]" />
            </div>
          </div>

          {/* 2-COLUMN COORDINATORS CONTACT CARDS */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[680px] mx-auto pt-2">
            {teamMembers.map((member, index) => (
              <RenaissanceFrame
                key={member.name}
                topOffset="pt-[22px]"
                contentClassName="px-4 pt-8 pb-4"
                topBadge={
                  <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#f8e4ba] to-[#deb46d] border-[1.5px] border-[#4a250a] shadow-[0_3px_8px_rgba(44,21,6,0.3)] flex items-center justify-center">
                    <div className="w-[34px] h-[34px] rounded-full border border-[#6e421d]/70 bg-[#f6e3ba]/80 flex items-center justify-center">
                      <User className="w-[18px] h-[18px] text-[#3a1c07] fill-[#3a1c07]" />
                    </div>
                  </div>
                }
              >
                <div className="text-center flex flex-col items-center">
                  <h3 className="coordinator-name font-bold text-[17px] text-[#261104] tracking-tight leading-snug" style={{ fontFamily: "var(--font-redaction), 'Redaction 20', sans-serif" }}>
                    {member.name}
                  </h3>

                  <span className="font-parchment-serif font-semibold text-[13px] text-[#5e3819] -mt-0.5 mb-1">
                    {member.role}
                  </span>

                  <div
                    className="w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#6e4420]/45 to-transparent my-1.5"
                    aria-hidden="true"
                  />

                  <div className="w-full space-y-2">
                    {/* Email Row */}
                    <div className="flex items-center justify-center gap-1.5 text-[#3b1e0a] min-w-0">
                      <Mail className="w-3.5 h-3.5 text-[#f4dca8] fill-[#3a1c07] flex-shrink-0" />
                      <a
                        href={`mailto:${member.email}`}
                        title={member.email}
                        className="font-parchment-serif font-bold text-[12.5px] sm:text-[13px] text-[#2c1506] hover:text-[#5c2b0a] hover:underline leading-tight truncate"
                      >
                        {member.email}
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(member.email, `team-email-${index}`)
                        }
                        title="Copy Email"
                        aria-label={`Copy email for ${member.name}`}
                        className="p-0.5 rounded hover:bg-[#5e3819]/15 text-[#5e3819] transition-colors flex-shrink-0 cursor-pointer"
                      >
                        {copiedKey === `team-email-${index}` ? (
                          <Check className="w-3 h-3 text-emerald-800" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Phone Row */}
                    <div className="flex items-center justify-center gap-1.5 text-[#3b1e0a]">
                      <Phone className="w-3.5 h-3.5 text-[#3a1c07] fill-[#3a1c07] flex-shrink-0" />
                      <a
                        href={`tel:${member.tel}`}
                        className="font-parchment-serif font-bold text-[13.5px] sm:text-[14px] text-[#2c1506] hover:text-[#5c2b0a] hover:underline whitespace-nowrap"
                      >
                        {member.phone}
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(member.phone, `team-phone-${index}`)
                        }
                        title="Copy Phone Number"
                        aria-label={`Copy phone number for ${member.name}`}
                        className="p-0.5 rounded hover:bg-[#5e3819]/15 text-[#5e3819] transition-colors flex-shrink-0 cursor-pointer"
                      >
                        {copiedKey === `team-phone-${index}` ? (
                          <Check className="w-3 h-3 text-emerald-800" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </RenaissanceFrame>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}

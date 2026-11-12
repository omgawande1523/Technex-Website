"use client";

import React from "react";

interface MaterializedFrameProps {
  children: React.ReactNode;
  tag?: string;
  className?: string;
  glowColor?: "cyan" | "violet" | "amber" | "multi" | "gold";
  id?: string;
  blackGlass?: boolean;
}

export default function MaterializedFrame({
  children,
  tag,
  className = "",
  glowColor = "gold",
  id,
  blackGlass = true,
}: MaterializedFrameProps) {
  // Border gradient based on manifestation energy state
  const borderGradient =
    glowColor === "cyan"
      ? "from-cyan-500/50 via-teal-400/30 to-blue-600/40"
      : glowColor === "amber" || glowColor === "gold"
      ? "from-[#d9ad62]/70 via-[#f5e5c9]/40 to-[#966f2d]/60"
      : glowColor === "violet"
      ? "from-purple-500/50 via-fuchsia-400/30 to-indigo-500/40"
      : "from-[#d9ad62]/60 via-purple-500/40 to-cyan-400/60";

  const cornerColor =
    glowColor === "gold" || glowColor === "amber"
      ? "border-[#d9ad62]/80 bg-[#d9ad62]/60"
      : "border-cyan-400/80 bg-cyan-400/60";

  return (
    <div
      id={id}
      className={`relative group rounded-2xl p-[1.5px] transition-all duration-500 hover:shadow-2xl hover:shadow-[#d9ad62]/15 ${className}`}
    >
      {/* Outer manifestation perimeter glow */}
      <div
        className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${borderGradient} opacity-50 group-hover:opacity-100 blur-[3px] transition-all duration-500 -z-10`}
      />

      {/* Main card body with blueprint grid & deep obsidian frosted glass */}
      <div
        className={`relative rounded-2xl ${
          blackGlass
            ? "bg-[#05040a]/92 backdrop-blur-2xl border border-[rgba(217,173,98,0.25)]"
            : "bg-[#0a0712]/88 backdrop-blur-xl border border-[rgba(217,173,98,0.20)]"
        } p-5 sm:p-7 md:p-9 overflow-hidden transition-all duration-500 group-hover:border-[rgba(217,173,98,0.55)] shadow-2xl shadow-black/90`}
      >
        {/* Holographic Blueprint Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(217, 173, 98, 0.45) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Ethereal Champagne Light Streaks in corners */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-gradient-to-br from-[#d9ad62]/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-gradient-to-tr from-[#966f2d]/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

        {/* Physical Chamfer Corner Accents */}
        {/* Top-Left */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 pointer-events-none">
          <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-[#d9ad62]/80" />
          <span className="w-1 h-1 rounded-full bg-[#d9ad62]/70" />
        </div>

        {/* Top-Right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 pointer-events-none">
          <span className="w-1 h-1 rounded-full bg-[#f5e5c9]/70" />
          <div className="w-2.5 h-2.5 border-t-2 border-r-2 border-[#d9ad62]/80" />
        </div>

        {/* Bottom-Left */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 pointer-events-none">
          <div className="w-2.5 h-2.5 border-b-2 border-l-2 border-[#d9ad62]/80" />
          <span className="w-1 h-1 rounded-full bg-[#d9ad62]/70" />
        </div>

        {/* Bottom-Right */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 pointer-events-none">
          <span className="w-1 h-1 rounded-full bg-[#f5e5c9]/70" />
          <div className="w-2.5 h-2.5 border-b-2 border-r-2 border-[#d9ad62]/80" />
        </div>

        {/* Technical Telemetry Tag */}
        {tag && (
          <div className="absolute top-3 right-6 hidden sm:flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0c0a14]/90 border border-[rgba(217,173,98,0.35)] text-[10.5px] font-mono tracking-wider text-[#d9ad62] shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d9ad62] animate-pulse" />
            <span>{tag}</span>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}


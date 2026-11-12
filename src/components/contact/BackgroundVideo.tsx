"use client";

import React, { useEffect, useRef } from "react";

export default function BackgroundVideo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle nodes representing ideas taking physical form
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }

    const colors = ["#00f0ff", "#a855f7", "#f59e0b", "#38bdf8", "#ec4899"];
    const particles: Particle[] = [];
    const particleCount = Math.min(width > 768 ? 45 : 20, 50);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle physical matrix connections between nearby particles (forming lattice)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 240, 255, ${
              (1 - dist / 130) * 0.15
            })`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles (imagination sparks)
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Real Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-30 opacity-40 mix-blend-screen pointer-events-none filter brightness-90 contrast-125"
      >
        <source src="/TNX_bg.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>

      {/* Cyber-Physical Atmospheric Underlay */}
      <div className="fixed inset-0 -z-40 bg-[#030611] pointer-events-none" />

      {/* Dynamic Ethereal Nebulae (Imagination Gradient Orbs) */}
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-cyan-600/20 via-blue-600/10 to-transparent rounded-full blur-[120px] pointer-events-none -z-25 animate-pulse" />
      <div className="fixed top-1/3 -right-40 w-[550px] h-[550px] bg-gradient-to-bl from-purple-600/20 via-pink-600/10 to-transparent rounded-full blur-[130px] pointer-events-none -z-25" />
      <div className="fixed -bottom-40 left-1/3 w-[650px] h-[650px] bg-gradient-to-tr from-amber-600/15 via-teal-600/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-25" />

      {/* Holographic Isometric Perspective Blueprint Grid (Physical Architecture) */}
      <div
        className="fixed inset-0 -z-20 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 240, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 85%)",
        }}
      />

      {/* Canvas of Particles Crystallizing Into Form */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-15 pointer-events-none"
      />

      {/* Ambient Audio Element */}
      <audio
        id="bg-audio"
        src="/tnx_bg_audio.mp3"
        loop
        playsInline
        preload="auto"
      />
    </>
  );
}

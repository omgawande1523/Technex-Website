'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TechnexParticleSystem } from '@/lib/particle-system';
import { FORMS, FormConfig, PARTICLE_CONFIG } from '@/config';
import { A4EventCard } from './A4EventCard';

export const TechnexParticleCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const systemRef = useRef<TechnexParticleSystem | null>(null);

  const [activeFormId, setActiveFormId] = useState<string>('human');
  const [selectedForm, setSelectedForm] = useState<FormConfig | null>(null);
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  const [parallax, setParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // 13 Event Sparks (exclude human base)
  const eventForms = FORMS.filter((f) => f.id !== 'human');

  // Handle Spark Click
  const handleSparkClick = useCallback((form: FormConfig, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!systemRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    setActiveFormId(form.id);
    setSelectedForm(form);
    setIsCardOpen(true);

    // Fire streak from button to figure
    systemRef.current.triggerEventMorph(form.id, clickX, clickY);
  }, []);

  // Return to Human
  const handleClose = useCallback(() => {
    if (!systemRef.current) return;
    setActiveFormId('human');
    setSelectedForm(null);
    setIsCardOpen(false);
    systemRef.current.resetToHuman();
  }, []);

  // Parallax tracking for the Sparks container (moves most: factor 0.08)
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      setParallax({
        x: nx * PARTICLE_CONFIG.parallax.sparks * 100,
        y: ny * PARTICLE_CONFIG.parallax.sparks * 100,
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Keyboard navigation: Arrow keys switch events, Esc returns to human
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = eventForms.findIndex((f) => f.id === activeFormId);
        const nextIndex = (currentIndex + 1) % eventForms.length;
        const nextForm = eventForms[nextIndex];
        setActiveFormId(nextForm.id);
        setSelectedForm(nextForm);
        setIsCardOpen(true);
        systemRef.current?.triggerEventMorph(nextForm.id);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = eventForms.findIndex((f) => f.id === activeFormId);
        const prevIndex = (currentIndex - 1 + eventForms.length) % eventForms.length;
        const prevForm = eventForms[prevIndex];
        setActiveFormId(prevForm.id);
        setSelectedForm(prevForm);
        setIsCardOpen(true);
        systemRef.current?.triggerEventMorph(prevForm.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFormId, eventForms, handleClose]);

  // Three.js Particle System Lifecycle
  useEffect(() => {
    if (!containerRef.current) return;

    const sys = new TechnexParticleSystem(containerRef.current, {
      onSparkArrive: (formId) => {
        // Spark arrived at figure
      },
      onMorphStart: (formId) => {
        // Morph began
      },
      onMorphComplete: (formId) => {
        // Settled into shape
      },
    });

    systemRef.current = sys;
    sys.init().then(() => {
      setLoading(false);
    });

    return () => {
      sys.dispose();
      systemRef.current = null;
    };
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-40 bg-black/85 flex flex-col items-center justify-center font-mono text-[#ffd6a0] text-sm">
          <div className="w-10 h-10 border-2 border-[#8ce2e0] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="tracking-widest uppercase text-xs">Synthesizing 40,000 Particle Constellations...</p>
        </div>
      )}

      {/* Header HUD Navigation */}
      <nav className="absolute top-6 left-8 z-30 pointer-events-auto flex items-center gap-4 text-white">
        <a href="/" className="flex items-center gap-2 group">
          <span className="w-3 h-3 rounded-full bg-[#8ce2e0] shadow-[0_0_12px_#8ce2e0] group-hover:scale-125 transition-transform" />
          <span className="font-serif tracking-widest text-lg font-bold text-[#ffd6a0]">
            TECHNEX &apos;26
          </span>
        </a>
        <span className="text-white/30">|</span>
        <span className="text-xs font-mono tracking-widest uppercase text-white/70">
          Events Constellation
        </span>
      </nav>

      {/* 13 Event Sparks Hanging in the Beam */}
      <div
        className="absolute inset-0 pointer-events-none z-20 transition-transform duration-200 ease-out flex items-center justify-center"
        style={{
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
        }}
      >
        <div className="relative w-full max-w-[1240px] h-[82vh] pointer-events-none">
          {eventForms.map((form, idx) => {
            // Suspended positions along the light beam corridor
            // Left column (events 0-6), Right column (events 7-12)
            const isLeft = idx < 7;
            const row = isLeft ? idx : idx - 7;
            const topPct = 14 + row * 11.5;
            const leftPct = isLeft ? 4.5 + (row % 2) * 3 : 75 - (row % 2) * 3;
            const isActive = activeFormId === form.id;

            return (
              <button
                key={form.id}
                onClick={(e) => handleSparkClick(form, e)}
                className={`absolute pointer-events-auto group px-3.5 py-1.5 rounded-full border transition-all duration-300 flex items-center gap-2 cursor-pointer backdrop-blur-md ${
                  isActive
                    ? 'bg-[#8ce2e0]/25 border-[#8ce2e0] shadow-[0_0_20px_rgba(140,226,224,0.6)] scale-105'
                    : 'bg-[#060408]/60 border-[#ffd6a0]/30 hover:border-[#ffd6a0] hover:bg-[#ffd6a0]/15 hover:shadow-[0_0_15px_rgba(255,214,160,0.4)]'
                }`}
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                }}
                title={`Morph into ${form.name}`}
              >
                {/* Glowing Spark Beacon Dot */}
                <span
                  className={`w-2 h-2 rounded-full transition-transform duration-300 ${
                    isActive
                      ? 'bg-[#8ce2e0] shadow-[0_0_10px_#8ce2e0] scale-125 animate-pulse'
                      : 'bg-[#ffd6a0] group-hover:scale-125 shadow-[0_0_6px_#ffd6a0]'
                  }`}
                />

                {/* Event Label */}
                <span className="font-mono text-[11px] font-semibold tracking-wider text-white/90 group-hover:text-white uppercase whitespace-nowrap">
                  {form.eventNumber} · {form.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Instructions Banner at Bottom Center */}
      <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
        <div className="bg-[#0c0a10]/75 backdrop-blur-md border border-[#d4af37]/30 px-5 py-2 rounded-full text-xs font-mono text-[#ffd6a0]/85 tracking-widest flex items-center gap-4 shadow-lg">
          <span>Click any spark in beam to morph</span>
          <span className="text-white/30">•</span>
          <span>Hover to repel particles</span>
          <span className="text-white/30">•</span>
          <span>← / → Arrows to switch</span>
          <span className="text-white/30">•</span>
          <span>ESC to reset</span>
        </div>
      </footer>

      {/* Sliding A4 Event Specification Details Card */}
      <A4EventCard
        form={selectedForm}
        isOpen={isCardOpen}
        onClose={handleClose}
        onRegister={(form) => {
          window.location.href = `/registration?event=${form.id}`;
        }}
      />
    </main>
  );
};

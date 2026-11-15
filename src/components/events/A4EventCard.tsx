'use client';
import React from 'react';
import { FormConfig } from '@/config';

interface A4EventCardProps {
  form: FormConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister?: (form: FormConfig) => void;
}

export const A4EventCard: React.FC<A4EventCardProps> = ({ form, isOpen, onClose, onRegister }) => {
  if (!form || form.id === 'human') return null;

  return (
    <aside
      className={`fixed top-6 right-6 bottom-6 w-[92vw] max-w-[440px] z-50 pointer-events-auto transition-transform duration-500 ease-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-[115%]'
      }`}
      aria-label="Event Details Specification Card"
    >
      <div className="relative flex-1 bg-[#0c0a10]/95 backdrop-blur-xl border border-[#d4af37]/60 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.25)] p-7 flex flex-col justify-between overflow-y-auto font-sans text-neutral-200">
        {/* Ornate Gold Corner Rivets */}
        <div className="absolute top-2.5 left-2.5 text-[#d4af37] text-xs opacity-75">✦</div>
        <div className="absolute top-2.5 right-2.5 text-[#d4af37] text-xs opacity-75">✦</div>
        <div className="absolute bottom-2.5 left-2.5 text-[#d4af37] text-xs opacity-75">✦</div>
        <div className="absolute bottom-2.5 right-2.5 text-[#d4af37] text-xs opacity-75">✦</div>

        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-[#d4af37]/40 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#8ce2e0]/20 text-[#8ce2e0] border border-[#8ce2e0]/40">
                {form.tag}
              </span>
              <span className="text-[11px] font-mono text-[#d4af37] tracking-wider">
                NO. {form.eventNumber} · SPEC A4
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors text-sm font-mono px-2 py-1 rounded hover:bg-white/10 flex items-center gap-1"
              title="Close (Esc)"
            >
              <span>ESC</span>
              <span>✕</span>
            </button>
          </div>

          {/* Title */}
          <h2 className="mt-5 text-2xl font-serif text-[#ffd6a0] tracking-wide leading-tight drop-shadow-[0_2px_10px_rgba(255,214,160,0.3)]">
            {form.title}
          </h2>

          <p className="mt-1 text-xs font-mono text-[#8ce2e0]/90 tracking-wide uppercase">
            3D Particle Constellation: {form.name}
          </p>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-[#d4af37]/60 via-[#8ce2e0]/40 to-transparent my-4" />

          {/* Form details section */}
          <div className="space-y-4 text-xs leading-relaxed">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37]/80 block mb-1">
                Imagined Inspiration
              </span>
              <p className="text-neutral-300 italic bg-white/5 p-2.5 rounded border border-white/10">
                &ldquo;{form.source}&rdquo; &mdash; {form.concept}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8ce2e0] block mb-1">
                Real-World Innovation
              </span>
              <p className="text-neutral-300">{form.innovation}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                Particle Anatomy
              </span>
              <p className="text-neutral-400 text-[11px] leading-normal">{form.description}</p>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="mt-6 pt-4 border-t border-[#d4af37]/30 flex items-center gap-3">
          <button
            onClick={() => onRegister?.(form)}
            className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#ffd6a0] to-[#d4af37] text-black font-semibold text-xs tracking-wider uppercase shadow-[0_4px_18px_rgba(212,175,55,0.4)] hover:shadow-[0_6px_24px_rgba(212,175,55,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Register for Event
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-lg border border-white/20 text-neutral-300 hover:text-white hover:border-white/40 text-xs font-mono transition-colors"
          >
            Return
          </button>
        </div>
      </div>
    </aside>
  );
};

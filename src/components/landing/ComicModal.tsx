'use client';

import React from 'react';
import { X, Sparkles, BookOpen, Lightbulb, Rocket, ArrowRight } from 'lucide-react';

export interface ComicCardData {
  id: string;
  title: string;
  idea?: string;
  innovation?: string;
  era: string;
  image: string;
  caption: string;
  lore: string;
}

interface ComicModalProps {
  card: ComicCardData | null;
  onClose: () => void;
}

export default function ComicModal({ card, onClose }: ComicModalProps) {
  if (!card) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(5, 2, 10, 0.88)',
        backdropFilter: 'blur(14px)',
        padding: '24px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          maxWidth: '840px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '26px',
          padding: '28px',
          border: '1px solid rgba(217, 173, 98, 0.45)',
          boxShadow: '0 0 60px rgba(217, 173, 98, 0.22)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(217, 173, 98, 0.1)',
            border: '1px solid rgba(217, 173, 98, 0.3)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d9ad62',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(217, 173, 98, 0.25)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(217, 173, 98, 0.1)';
            e.currentTarget.style.transform = 'scale(1.0)';
          }}
        >
          <X size={18} />
        </button>

        {/* Image Display with Luxury Framing */}
        <div
          style={{
            flex: '1 1 300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              padding: '10px 10px 20px 10px',
              backgroundColor: '#0c0a14',
              borderRadius: '8px',
              border: '1px solid rgba(217, 173, 98, 0.35)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.9), 0 0 30px rgba(217, 173, 98, 0.25)',
              transform: 'rotate(-1.0deg)',
              transition: 'transform 0.3s ease',
              maxWidth: '320px',
              width: '100%',
            }}
          >
            <img
              src={card.image}
              alt={card.title}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '6px',
                border: '1px solid rgba(217, 173, 98, 0.25)',
              }}
            />
            <p
              style={{
                color: '#d9ad62',
                fontSize: '11px',
                fontWeight: 600,
                textAlign: 'center',
                marginTop: '10px',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              {card.caption}
            </p>
          </div>
        </div>

        {/* Details & Lore Section */}
        <div
          style={{
            flex: '1 1 380px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1.2px',
                color: '#d9ad62',
                background: 'rgba(217, 173, 98, 0.15)',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid rgba(217, 173, 98, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={12} />
              {card.era}
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '24px',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.25,
              textShadow: '0 2px 10px rgba(217, 173, 98, 0.3)',
            }}
          >
            {card.title}
          </h2>

          {/* Evolution Bridge: Idea ➔ Innovation */}
          {card.idea && card.innovation && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(212, 154, 24, 0.15), rgba(0, 240, 234, 0.15))',
                border: '1px solid rgba(217, 173, 98, 0.3)',
              }}
            >
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#ffae19', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lightbulb size={11} /> Visionary Idea
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#f5ecd5', display: 'block', marginTop: '2px' }}>
                  {card.idea}
                </span>
              </div>
              <ArrowRight size={18} color="#00F0EA" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, textAlign: 'right' }}>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#00F0EA', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  <Rocket size={11} /> Modern Innovation
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', display: 'block', marginTop: '2px' }}>
                  {card.innovation}
                </span>
              </div>
            </div>
          )}

          <p
            style={{
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#d4ceeb',
              fontStyle: 'italic',
              borderLeft: '2px solid #d9ad62',
              paddingLeft: '12px',
            }}
          >
            &quot;{card.caption}&quot;
          </p>

          <div
            style={{
              backgroundColor: 'rgba(217, 173, 98, 0.05)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid rgba(217, 173, 98, 0.18)',
            }}
          >
            <h4
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                color: '#d9ad62',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                letterSpacing: '1px',
              }}
            >
              <BookOpen size={14} />
              INNOVATION GENESIS & EVOLUTION
            </h4>
            <p
              style={{
                fontSize: '12.5px',
                lineHeight: 1.65,
                color: '#c9c3e2',
              }}
            >
              {card.lore}
            </p>
          </div>

          <button
            onClick={onClose}
            className="gold-btn"
            style={{
              alignSelf: 'flex-start',
              marginTop: '4px',
            }}
          >
            Return to 3D Orbit
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { X, Sparkles, BookOpen, Lightbulb, Rocket, ArrowRight } from 'lucide-react';
import styles from './comic-modal.module.css';

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
  // Lock body scroll while modal is open on mobile
  useEffect(() => {
    if (card) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [card]);

  if (!card) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close comic lore modal"
        >
          <X size={18} />
        </button>

        {/* Image Display with Luxury Framing */}
        <div className={styles.imageSection}>
          <div className={styles.imageFrame}>
            <img
              src={card.image}
              alt={card.title}
              className={styles.imageCover}
              loading="eager"
            />
            <p className={styles.imageCaption}>{card.caption}</p>
          </div>
        </div>

        {/* Details & Lore Section */}
        <div className={styles.detailsSection}>
          <div>
            <span className={styles.eraBadge}>
              <Sparkles size={12} />
              {card.era}
            </span>
          </div>

          <h2 className={styles.cardTitle}>{card.title}</h2>

          {/* Evolution Bridge: Idea ➔ Innovation */}
          {card.idea && card.innovation && (
            <div className={styles.bridgeContainer}>
              <div className={styles.bridgeBlock}>
                <span className={styles.bridgeLabel}>
                  <Lightbulb size={11} /> Visionary Idea
                </span>
                <span className={styles.bridgeText}>{card.idea}</span>
              </div>
              <ArrowRight size={16} color="#00F0EA" style={{ flexShrink: 0 }} />
              <div className={styles.bridgeBlockRight}>
                <span className={styles.bridgeLabelRight}>
                  <Rocket size={11} /> Modern Innovation
                </span>
                <span className={styles.bridgeText}>{card.innovation}</span>
              </div>
            </div>
          )}

          <p className={styles.quoteCaption}>&quot;{card.caption}&quot;</p>

          <div className={styles.loreBox}>
            <h4 className={styles.loreTitle}>
              <BookOpen size={13} />
              INNOVATION GENESIS &amp; EVOLUTION
            </h4>
            <p className={styles.loreText}>{card.lore}</p>
          </div>

          <button onClick={onClose} className={`gold-btn ${styles.ctaButton}`}>
            Return to 3D Orbit
          </button>
        </div>
      </div>
    </div>
  );
}

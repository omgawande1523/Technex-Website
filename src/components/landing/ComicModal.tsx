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
  // Lock body scroll while modal is open & add ESC key listener
  useEffect(() => {
    if (card) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [card, onClose]);

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

        {/* Left: Luxury Artwork Frame */}
        <div className={styles.imageSection}>
          <div className={styles.imageFrame}>
            <div className={styles.imageContainer}>
              <img
                src={card.image}
                alt={card.title}
                className={styles.imageCover}
                loading="eager"
              />
            </div>
            <div className={styles.imageTagWrap}>
              <span className={styles.imageCategoryPill}>{card.caption}</span>
            </div>
          </div>
        </div>

        {/* Right: Editorial Narrative & Lore */}
        <div className={styles.detailsSection}>
          <div className={styles.metaRow}>
            <span className={styles.eraBadge}>
              <Sparkles size={12} className={styles.sparkleIcon} />
              {card.era}
            </span>
          </div>

          <h2 className={styles.cardTitle}>{card.title}</h2>

          {/* Dual Evolution Timeline Cards */}
          {card.idea && card.innovation && (
            <div className={styles.bridgeContainer}>
              <div className={styles.bridgeBlock}>
                <span className={styles.bridgeLabel}>
                  <Lightbulb size={12} /> HISTORICAL ORIGIN
                </span>
                <span className={styles.bridgeText}>{card.idea}</span>
              </div>
              <div className={styles.bridgeArrow}>
                <ArrowRight size={16} />
              </div>
              <div className={styles.bridgeBlockRight}>
                <span className={styles.bridgeLabelRight}>
                  <Rocket size={12} /> MODERN BREAKTHROUGH
                </span>
                <span className={styles.bridgeText}>{card.innovation}</span>
              </div>
            </div>
          )}

          {/* Lore Narrative Box */}
          <div className={styles.loreBox}>
            <h4 className={styles.loreTitle}>
              <BookOpen size={13} />
              CHRONICLE OF HUMAN INGENUITY
            </h4>
            <p className={styles.loreText}>{card.lore}</p>
          </div>

          <div className={styles.actionRow}>
            <button onClick={onClose} className={styles.ctaButton}>
              ← Return to 3D Orbit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

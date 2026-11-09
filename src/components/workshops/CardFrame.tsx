import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./workshops.module.css";

interface CardFrameProps {
  children: ReactNode;
  isBack?: boolean;
}

export default function CardFrame({ children, isBack = false }: CardFrameProps) {
  return (
    <div className={styles.frame}>
      <Image
        src="/assets/workshop-frame-clean.png"
        alt=""
        className={styles.frameArt}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
      />
      <Image
        src="/assets/workshop-frame-gold-overlay.png"
        alt=""
        className={styles.frameGlow}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
      />
      <div className={`${styles.screen} ${isBack ? styles.backScreen : ""}`}>
        <div className={styles.scanline} aria-hidden="true" />
        <div className={styles.frameContent}>{children}</div>
      </div>
    </div>
  );
}

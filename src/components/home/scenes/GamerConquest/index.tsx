"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getFlagship } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/components/providers/SmoothScroll";
import { useSceneEnv } from "../../useSceneEnv";
import { InkShooter, ROUND_SECONDS, readHighScore, writeHighScore, type ShooterState } from "./inkShooter";
import { useGamerConquestTimeline } from "./useGamerConquestTimeline";
import styles from "./gamer-conquest.module.css";

const SLUG = "gamer-conquest";
const NEXT_SLUG = "overdrive";

export default function GamerConquest() {
  const flagship = getFlagship(SLUG);
  const next = getFlagship(NEXT_SLUG);
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<InkShooter | null>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const livesRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<ShooterState>("idle");
  const [final, setFinal] = useState({ score: 0, high: 0, reason: "time" as "time" | "lives", isNew: false });
  const [complete, setComplete] = useState(false);
  const lenis = useLenis();
  const { reduced, mobile } = useSceneEnv();
  useGamerConquestTimeline(ref, { reduced, mobile });

  // Create the game once the canvas exists.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new InkShooter(
      canvas,
      (hud) => {
        if (scoreRef.current) scoreRef.current.textContent = String(hud.score).padStart(5, "0");
        if (livesRef.current) livesRef.current.textContent = "●".repeat(Math.max(0, hud.lives)) + "○".repeat(Math.max(0, 3 - hud.lives));
        if (timeRef.current) timeRef.current.textContent = String(Math.ceil(hud.timeLeft)).padStart(2, "0");
        if (hud.state === "over") {
          const prev = readHighScore();
          const isNew = hud.score > prev;
          if (isNew) writeHighScore(hud.score);
          setFinal({ score: hud.score, high: Math.max(prev, hud.score), reason: hud.reason ?? "time", isNew });
          setState("over");
        }
      },
      { reducedMotion: reduced },
    );
    gameRef.current = game;
    const onResize = () => game.resize();
    window.addEventListener("resize", onResize);
    return () => {
      game.stop();
      window.removeEventListener("resize", onResize);
      gameRef.current = null;
    };
  }, [reduced]);

  // Keyboard while playing: keep arrows/space from scrolling the page.
  useEffect(() => {
    if (state !== "playing") return;
    const keys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "KeyA", "KeyD"]);
    const down = (e: KeyboardEvent) => {
      if (!keys.has(e.code)) return;
      e.preventDefault();
      gameRef.current?.keyDown(e.code);
    };
    const up = (e: KeyboardEvent) => {
      if (!keys.has(e.code)) return;
      e.preventDefault();
      gameRef.current?.keyUp(e.code);
    };
    lenis?.stop();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [state, lenis]);

  // Game over -> LEVEL COMPLETE bar -> next stage.
  useEffect(() => {
    if (state !== "over") return;
    const t = window.setTimeout(() => setComplete(true), 1600);
    return () => window.clearTimeout(t);
  }, [state]);

  useEffect(() => {
    if (!complete || state !== "over") return;
    const bar = ref.current?.querySelector<HTMLElement>(`.${styles.loadFill}`);
    if (!bar) return;
    if (reduced) {
      bar.style.transform = "scaleX(1)";
      return;
    }
    const tween = gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.8,
        ease: "power2.inOut",
        onComplete: () => {
          const target = document.getElementById(NEXT_SLUG);
          if (target) {
            if (lenis) lenis.scrollTo(target, { duration: 1.4 });
            else target.scrollIntoView({ behavior: "smooth" });
          }
        },
      },
    );
    return () => {
      tween.kill();
    };
  }, [complete, state, reduced, lenis]);

  if (!flagship) return null;
  const { event } = flagship;

  const play = () => {
    setComplete(false);
    setState("playing");
    gameRef.current?.start();
    canvasRef.current?.focus();
  };

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (state !== "playing") return;
    const r = e.currentTarget.getBoundingClientRect();
    gameRef.current?.pointer(e.type === "pointerup" || e.type === "pointercancel" || e.type === "pointerleave" ? null : e.clientX - r.left, r.width);
  };

  return (
    <div ref={ref} className={styles.stage} data-reduced={reduced}>
      <div className={styles.spot} aria-hidden="true" />

      <div className={styles.info}>
        <p className={styles.kicker}>
          Flagship #{event.number} · {event.category}
        </p>
        <h2 className={styles.title}>{event.name}</h2>
        {event.quote && <p className={styles.quote}>{event.quote}</p>}
        <dl className={styles.facts}>
          {event.highlights.map((h) => (
            <div key={h.label}>
              <dt>{h.label}</dt>
              <dd>{h.value}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.ctas}>
          {event.registerIsExternal ? (
            <a href={event.registerHref} className={styles.cta} target="_blank" rel="noopener noreferrer" data-magnetic>
              Register squad
            </a>
          ) : (
            <Link href={event.registerHref} className={styles.cta} data-magnetic>
              Register squad
            </Link>
          )}
          <Link href={event.href} className={styles.ghost}>
            Event details
          </Link>
        </div>
      </div>

      <div className={styles.tvWrap}>
        <div className={styles.tv}>
          <span className={styles.antennaL} aria-hidden="true" />
          <span className={styles.antennaR} aria-hidden="true" />
          <div className={styles.bezel}>
            <div className={styles.screen}>
              <div className={styles.screenOn}>
                <canvas
                  ref={canvasRef}
                  className={styles.canvas}
                  tabIndex={0}
                  aria-label={`Ink Ship mini-game. ${ROUND_SECONDS} seconds. Arrow keys or A and D to move, Space to fire. On touch, drag to steer.`}
                  onPointerDown={onPointer}
                  onPointerMove={(e) => e.buttons && onPointer(e)}
                  onPointerUp={onPointer}
                  onPointerCancel={onPointer}
                  onPointerLeave={onPointer}
                />
                <div className={styles.hudBar} aria-hidden={state !== "playing"}>
                  <span>
                    SCORE <span ref={scoreRef}>00000</span>
                  </span>
                  <span>
                    TIME <span ref={timeRef}>{ROUND_SECONDS}</span>
                  </span>
                  <span>
                    LIVES <span ref={livesRef}>●●●</span>
                  </span>
                </div>

                {state === "idle" && (
                  <button type="button" className={styles.overlay} onClick={play} data-cursor="PLAY">
                    <span className={styles.blink}>[ Click to play ]</span>
                    <small>{mobile ? "Drag to steer · auto-fire" : "← → / A D to move · Space to fire"}</small>
                  </button>
                )}

                {state === "over" && !complete && (
                  <div className={styles.overlay} role="status">
                    <span>{final.reason === "time" ? "Time up" : "Out of ink"}</span>
                    <small>
                      Score {final.score} · Best {final.high}
                      {final.isNew ? " · New high score" : ""}
                    </small>
                  </div>
                )}

                <div className={styles.complete} data-show={complete} role="status" aria-hidden={!complete}>
                  <p className={styles.completeTitle}>Level complete</p>
                  <p className={styles.completeNext}>
                    → Next stage: <strong>{next?.hudName ?? "NEXT"}</strong>
                  </p>
                  <div className={styles.load}>
                    <div className={styles.loadFill} />
                  </div>
                  {complete && (
                    <button type="button" className={styles.again} onClick={play}>
                      Play again
                    </button>
                  )}
                </div>
                <div className={styles.scanlines} aria-hidden="true" />
              </div>
              <div className={styles.powerLine} aria-hidden="true" />
            </div>
          </div>
          <div className={styles.controls} aria-hidden="true">
            <span className={styles.knob} />
            <span className={styles.knob} />
            <span className={styles.grille} />
          </div>
        </div>
        <span className={styles.stand} aria-hidden="true" />
      </div>
    </div>
  );
}

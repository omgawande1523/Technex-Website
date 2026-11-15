/**
 * "Ink Ship" — a 30-second canvas shooter for the Gamer Conquest arcade.
 * Plain class, no React: the scene owns one instance and forwards input.
 *
 * Controls: ←/→ or A/D to move, Space to fire (auto-fire while held),
 * touch: drag to steer, ship auto-fires while a finger is down.
 */

export type ShooterState = "idle" | "playing" | "over";
export interface ShooterHud {
  score: number;
  lives: number;
  timeLeft: number;
  state: ShooterState;
  reason?: "time" | "lives";
}

type Vec = { x: number; y: number };
type Blot = Vec & { r: number; vx: number; vy: number; hp: number; wobble: number };
type Shot = Vec & { vy: number };
type Splat = Vec & { vx: number; vy: number; life: number; r: number };

const W = 640;
const H = 480;
const GOLD = "#d9ad62";
const GOLD_SOFT = "#f2d9a6";
const PAPER = "#0b0906";
export const ROUND_SECONDS = 30;

export class InkShooter {
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private last = 0;
  private ship: Vec = { x: W / 2, y: H - 46 };
  private blots: Blot[] = [];
  private shots: Shot[] = [];
  private splats: Splat[] = [];
  private keys = new Set<string>();
  private touchX: number | null = null;
  private firing = false;
  private cooldown = 0;
  private spawn = 0;
  private invuln = 0;
  private shake = 0;
  private hud: ShooterHud = { score: 0, lives: 3, timeLeft: ROUND_SECONDS, state: "idle" };

  constructor(
    private canvas: HTMLCanvasElement,
    private onHud: (hud: ShooterHud) => void,
    private opts: { reducedMotion: boolean },
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.resize();
    this.drawIdle();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = W * dpr;
    this.canvas.height = H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.hud.state !== "playing") this.drawIdle();
  }

  start() {
    this.blots = [];
    this.shots = [];
    this.splats = [];
    this.ship = { x: W / 2, y: H - 46 };
    this.hud = { score: 0, lives: 3, timeLeft: ROUND_SECONDS, state: "playing" };
    this.spawn = 0.4;
    this.invuln = 1;
    this.last = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.loop);
    this.onHud({ ...this.hud });
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  get state() {
    return this.hud.state;
  }

  /* ---------- input ---------- */
  keyDown(code: string) {
    this.keys.add(code);
    if (code === "Space") this.firing = true;
  }
  keyUp(code: string) {
    this.keys.delete(code);
    if (code === "Space") this.firing = false;
  }
  /** x in CSS pixels relative to the canvas box; null when the finger lifts. */
  pointer(xCss: number | null, boxWidth: number) {
    this.touchX = xCss === null ? null : (xCss / boxWidth) * W;
    this.firing = xCss !== null;
  }

  /* ---------- loop ---------- */
  private loop = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.draw();
    if (this.hud.state === "playing") this.raf = requestAnimationFrame(this.loop);
  };

  private end(reason: "time" | "lives") {
    this.hud = { ...this.hud, state: "over", reason };
    this.onHud({ ...this.hud });
    this.draw();
  }

  private update(dt: number) {
    const h = this.hud;
    h.timeLeft = Math.max(0, h.timeLeft - dt);
    if (h.timeLeft <= 0) return this.end("time");

    // Ship
    const speed = 380;
    if (this.keys.has("ArrowLeft") || this.keys.has("KeyA")) this.ship.x -= speed * dt;
    if (this.keys.has("ArrowRight") || this.keys.has("KeyD")) this.ship.x += speed * dt;
    if (this.touchX !== null) this.ship.x += (this.touchX - this.ship.x) * Math.min(1, dt * 12);
    this.ship.x = Math.max(24, Math.min(W - 24, this.ship.x));

    // Fire
    this.cooldown -= dt;
    if (this.firing && this.cooldown <= 0) {
      this.shots.push({ x: this.ship.x, y: this.ship.y - 18, vy: -620 });
      this.cooldown = 0.16;
    }
    this.shots.forEach((s) => (s.y += s.vy * dt));
    this.shots = this.shots.filter((s) => s.y > -20);

    // Enemies: spawn faster as time runs out
    const elapsed = ROUND_SECONDS - h.timeLeft;
    this.spawn -= dt;
    if (this.spawn <= 0) {
      const r = 12 + Math.random() * 16;
      this.blots.push({
        x: r + Math.random() * (W - r * 2),
        y: -r,
        r,
        vx: (Math.random() - 0.5) * 60,
        vy: 70 + Math.random() * 60 + elapsed * 4,
        hp: r > 22 ? 2 : 1,
        wobble: Math.random() * Math.PI * 2,
      });
      this.spawn = Math.max(0.22, 0.85 - elapsed * 0.022);
    }
    this.blots.forEach((b) => {
      b.wobble += dt * 3;
      b.x += (b.vx + Math.sin(b.wobble) * 40) * dt;
      b.y += b.vy * dt;
    });

    // Hits
    for (const b of this.blots) {
      for (const s of this.shots) {
        if (s.y < -10) continue;
        if ((s.x - b.x) ** 2 + (s.y - b.y) ** 2 < (b.r + 4) ** 2) {
          s.y = -100;
          b.hp -= 1;
          this.splash(b.x, b.y, 4);
          if (b.hp <= 0) {
            h.score += Math.round(40 - b.r);
            this.splash(b.x, b.y, 14);
            b.y = H + 999;
          }
        }
      }
    }

    // Ship collisions
    this.invuln = Math.max(0, this.invuln - dt);
    for (const b of this.blots) {
      if (this.invuln > 0) break;
      if ((this.ship.x - b.x) ** 2 + (this.ship.y - b.y) ** 2 < (b.r + 14) ** 2) {
        h.lives -= 1;
        this.invuln = 1.4;
        this.shake = this.opts.reducedMotion ? 0 : 0.35;
        this.splash(this.ship.x, this.ship.y, 22);
        b.y = H + 999;
        if (h.lives <= 0) return this.end("lives");
      }
    }
    // Blots that reach the bottom cost points, never lives.
    this.blots.forEach((b) => {
      if (b.y > H + b.r && b.y < H + 900) h.score = Math.max(0, h.score - 5);
    });
    this.blots = this.blots.filter((b) => b.y < H + b.r);

    this.splats.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      p.life -= dt;
    });
    this.splats = this.splats.filter((p) => p.life > 0);
    this.shake = Math.max(0, this.shake - dt);
    this.onHud({ ...h });
  }

  private splash(x: number, y: number, n: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 60 + Math.random() * 220;
      this.splats.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: 0.4 + Math.random() * 0.5, r: 1 + Math.random() * 3 });
    }
  }

  /* ---------- drawing ---------- */
  private paper() {
    const c = this.ctx;
    c.fillStyle = PAPER;
    c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(217,173,98,0.07)";
    for (let y = 4; y < H; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < W; x += 8) c.fillRect(x, y, 1.4, 1.4);
  }

  private drawShip() {
    const c = this.ctx;
    const { x, y } = this.ship;
    if (this.invuln > 0 && Math.floor(this.invuln * 12) % 2) return;
    c.fillStyle = GOLD;
    c.beginPath();
    c.moveTo(x, y - 20);
    c.quadraticCurveTo(x + 6, y - 2, x + 18, y + 14);
    c.lineTo(x + 4, y + 8);
    c.lineTo(x, y + 16);
    c.lineTo(x - 4, y + 8);
    c.lineTo(x - 18, y + 14);
    c.quadraticCurveTo(x - 6, y - 2, x, y - 20);
    c.fill();
    c.fillStyle = PAPER;
    c.beginPath();
    c.arc(x, y - 2, 3.5, 0, Math.PI * 2);
    c.fill();
  }

  private drawBlot(b: Blot) {
    const c = this.ctx;
    c.fillStyle = b.hp > 1 ? GOLD_SOFT : GOLD;
    c.beginPath();
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = b.r * (0.82 + 0.22 * Math.sin(a * 3 + b.wobble));
      const px = b.x + Math.cos(a) * rr;
      const py = b.y + Math.sin(a) * rr;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.fill();
    c.fillStyle = PAPER;
    c.fillRect(b.x - b.r * 0.35, b.y - b.r * 0.2, b.r * 0.22, b.r * 0.22);
    c.fillRect(b.x + b.r * 0.13, b.y - b.r * 0.2, b.r * 0.22, b.r * 0.22);
  }

  private draw() {
    const c = this.ctx;
    c.save();
    if (this.shake > 0) c.translate((Math.random() - 0.5) * 12 * this.shake, (Math.random() - 0.5) * 12 * this.shake);
    this.paper();
    this.blots.forEach((b) => this.drawBlot(b));
    c.fillStyle = GOLD_SOFT;
    this.shots.forEach((s) => c.fillRect(s.x - 1.5, s.y - 8, 3, 12));
    this.splats.forEach((p) => {
      c.globalAlpha = Math.max(0, p.life);
      c.fillStyle = GOLD;
      c.beginPath();
      c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      c.fill();
    });
    c.globalAlpha = 1;
    this.drawShip();
    c.restore();
  }

  private drawIdle() {
    this.paper();
    this.blots = [];
    for (let i = 0; i < 5; i++) {
      this.drawBlot({ x: 90 + i * 115, y: 120 + (i % 2) * 40, r: 16 + (i % 3) * 5, vx: 0, vy: 0, hp: 1, wobble: i });
    }
    this.drawShip();
  }
}

/* High score, stored per browser; storage can be unavailable. */
const HS_KEY = "tnx-ink-ship-hiscore";
export function readHighScore() {
  try {
    return Number(localStorage.getItem(HS_KEY)) || 0;
  } catch {
    return 0;
  }
}
export function writeHighScore(score: number) {
  try {
    localStorage.setItem(HS_KEY, String(score));
  } catch {
    /* ignore: private mode or blocked storage */
  }
}

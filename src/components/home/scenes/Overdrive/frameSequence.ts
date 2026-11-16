/**
 * Loads a numbered WebP sequence (see scripts/extract-frames.mjs) and draws
 * the nearest loaded frame into a canvas with object-fit: cover.
 * Keyframes (every 8th) load first so scrubbing works almost immediately.
 */
export interface SequenceManifest {
  name: string;
  frames: number;
  mobileFrames: number;
  width: number;
  height: number;
  placeholder: boolean;
  pattern: string;
}

export class FrameSequence {
  private images: (HTMLImageElement | null)[];
  private cancelled = false;

  constructor(
    private base: string,
    private count: number,
    private pattern: string,
  ) {
    this.images = new Array(count).fill(null);
  }

  get length() {
    return this.count;
  }

  url(i: number) {
    return `${this.base}/${this.pattern.replace("{n}", String(i + 1).padStart(4, "0"))}`;
  }

  /** Progressive load: keyframes, then halves, then everything else (or only `only`). */
  async load(onProgress?: (loaded: number, total: number) => void, only?: number[]) {
    const order: number[] = only ? [...only] : [];
    const seen = new Set<number>(order);
    for (const step of only ? [] : [8, 4, 2, 1]) {
      for (let i = 0; i < this.count; i += step) {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      }
    }
    let loaded = 0;
    const queue = [...order];
    const worker = async () => {
      while (queue.length && !this.cancelled) {
        const i = queue.shift()!;
        const img = new Image();
        img.decoding = "async";
        img.src = this.url(i);
        try {
          await img.decode();
          this.images[i] = img;
        } catch {
          /* missing frame: nearest neighbour covers it */
        }
        loaded++;
        onProgress?.(loaded, this.count);
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
  }

  cancel() {
    this.cancelled = true;
  }

  private nearest(i: number) {
    if (this.images[i]) return this.images[i];
    for (let d = 1; d < this.count; d++) {
      const a = this.images[i - d];
      if (a) return a;
      const b = this.images[i + d];
      if (b) return b;
    }
    return null;
  }

  draw(ctx: CanvasRenderingContext2D, index: number, w: number, h: number) {
    const img = this.nearest(Math.max(0, Math.min(this.count - 1, index)));
    if (!img) return false;
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    return true;
  }
}

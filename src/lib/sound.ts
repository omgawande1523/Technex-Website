"use client";

/**
 * Ambient "ink" soundscape synthesised with WebAudio, so there are no audio
 * files to license or download: a low paper-rustle bed plus occasional
 * pen-scratch bursts. Muted by default; the choice is remembered per browser.
 */
const KEY = "tnx-sound";
type Listener = (on: boolean) => void;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let scratchTimer: number | null = null;
let enabled = false;
const listeners = new Set<Listener>();

function noiseBuffer(ac: AudioContext, seconds: number, brown = false) {
  const buf = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else data[i] = white;
  }
  return buf;
}

function start() {
  if (typeof window === "undefined") return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx ??= new AC();
  void ctx.resume();
  if (master) {
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.6);
  } else {
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);

    // Paper bed: looping brown noise through a gentle low-pass.
    const bed = ctx.createBufferSource();
    bed.buffer = noiseBuffer(ctx, 4, true);
    bed.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    const bedGain = ctx.createGain();
    bedGain.gain.value = 0.05;
    bed.connect(lp).connect(bedGain).connect(master);
    bed.start();
  }
  const scratch = () => {
    if (!ctx || !master || !enabled) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 0.5);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2500 + Math.random() * 2500;
    bp.Q.value = 6;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    const len = 0.08 + Math.random() * 0.25;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.04, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(bp).connect(g).connect(master);
    src.start(t);
    src.stop(t + len + 0.05);
    scratchTimer = window.setTimeout(scratch, 1800 + Math.random() * 4200);
  };
  if (scratchTimer) window.clearTimeout(scratchTimer);
  scratchTimer = window.setTimeout(scratch, 800);
}

function stop() {
  if (scratchTimer) window.clearTimeout(scratchTimer);
  scratchTimer = null;
  if (ctx && master) master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
}

export function setSound(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* storage blocked: keep the in-memory value */
  }
  if (on) start();
  else stop();
  listeners.forEach((l) => l(on));
}

/** Preference only; audio never starts without a user gesture. */
export function storedSoundPreference() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export const isSoundOn = () => enabled;

export function subscribeSound(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

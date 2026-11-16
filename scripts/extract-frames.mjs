#!/usr/bin/env node
/**
 * Turns a video into the WebP image sequence used by the Overdrive scene.
 *
 *   node scripts/extract-frames.mjs --input footage.mp4 [--frames 150] [--name overdrive]
 *   node scripts/extract-frames.mjs --placeholder      # procedural ink-tunnel stand-in
 *
 * Output (public/sequences/<name>/):
 *   desktop/frame_0001.webp …  `frames` frames at 1280px wide
 *   mobile/frame_0001.webp …   half the frames at 640px wide
 *   manifest.json              { name, frames, mobileFrames, width, height, placeholder }
 *
 * Requires ffmpeg on PATH. Frames are sampled evenly across the whole clip.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, all) => {
    if (!a.startsWith("--")) return [];
    const next = all[i + 1];
    return [a.slice(2), next && !next.startsWith("--") ? next : true];
  }).filter((p) => p.length),
);

const name = String(args.name ?? "overdrive");
const frames = Math.max(24, Math.min(240, Number(args.frames ?? 150)));
const mobileFrames = Math.round(frames / 2);
const outDir = join(process.cwd(), "public", "sequences", name);
const ff = (argv) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...argv], { stdio: "inherit" });

let input = args.input;
const placeholder = !!args.placeholder;
if (!input && !placeholder) {
  console.error("Pass --input <video.mp4> or --placeholder");
  process.exit(1);
}

if (placeholder) {
  // 6 s, 1600x900: gold ink rings rushing toward the viewer, with lane streaks.
  input = join(tmpdir(), `tnx-${name}-placeholder.mp4`);
  const W = 1600;
  const H = 900;
  const v = `(gt(mod(5200/(hypot(X-${W / 2},Y-${H / 2})+30)+T*9,6),5.1)+0.55*gt(mod(atan2(Y-${H / 2},X-${W / 2})*12/PI+T*0.6,2),1.93)*gt(hypot(X-${W / 2},Y-${H / 2}),120))*min(1,hypot(X-${W / 2},Y-${H / 2})/420)`;
  ff([
    "-f", "lavfi",
    "-i", `color=c=0x0b0906:s=${W}x${H}:d=6:r=30`,
    "-vf", `geq=r='11+206*min(1,${v})':g='9+164*min(1,${v})':b='6+92*min(1,${v})'`,
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20",
    input,
  ]);
}

const probe = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", input]).toString().trim();
const duration = Number(probe);
if (!Number.isFinite(duration) || duration <= 0) throw new Error(`Could not read duration of ${input}`);

for (const [dir, count, width] of [["desktop", frames, 1280], ["mobile", mobileFrames, 640]]) {
  const target = join(outDir, dir);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  const fps = (count / duration).toFixed(5);
  ff([
    "-i", input,
    "-vf", `fps=${fps},scale=${width}:-2:flags=lanczos`,
    "-frames:v", String(count),
    "-c:v", "libwebp", "-quality", dir === "desktop" ? "50" : "45", "-compression_level", "6",
    join(target, "frame_%04d.webp"),
  ]);
  const written = readdirSync(target).filter((f) => f.endsWith(".webp")).length;
  console.log(`${dir}: ${written} frames`);
}

const manifest = {
  name,
  frames,
  mobileFrames,
  width: 1280,
  height: 720,
  placeholder,
  pattern: "frame_{n}.webp",
  generatedAt: new Date().toISOString().slice(0, 10),
};
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
if (placeholder) rmSync(input, { force: true });
console.log(`Wrote public/sequences/${name}/manifest.json`);

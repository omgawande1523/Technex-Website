#!/usr/bin/env node
/**
 * Downloads the CC0 Poly Haven assets used by the Realm home page.
 * Poly Haven assets are CC0 (public domain): https://polyhaven.com/license
 *
 *   node scripts/realm/fetch-polyhaven.mjs
 *
 * Output:
 *   public/realm/hdr/<id>_1k.hdr          (HDRIs, loaded at runtime)
 *   assets-src/polyhaven/<id>/...         (models + textures, inputs to Blender)
 *   assets-src/polyhaven/manifest.json    (what was fetched, with licence)
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";

const API = "https://api.polyhaven.com/files/";
const ROOT = process.cwd();

const HDRIS = ["studio_small_09", "moonless_golf", "kloppenheim_02", "satara_night_no_lamps", "dikhololo_night"];
const MODELS = ["moon_rock_01", "moon_rock_03", "moon_rock_05", "rock_07", "namaqualand_boulder_02", "marble_bust_01", "lion_head", "horse_head"];
const TEXTURES = ["rock_face_03", "marble_01", "black_marble", "concrete_floor_worn_001"];

const manifest = { license: "CC0 1.0 (Poly Haven)", source: "https://polyhaven.com", hdri: [], models: [], textures: [] };

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function download(url, out) {
  if (await exists(out)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(await res.arrayBuffer()));
  console.log("  ↓", out.replace(ROOT, "."));
}

async function files(id) {
  const res = await fetch(API + id);
  if (!res.ok) throw new Error(`asset ${id}: ${res.status}`);
  return res.json();
}

for (const id of HDRIS) {
  try {
    const f = await files(id);
    const url = f.hdri["1k"].hdr.url;
    await download(url, join(ROOT, "public/realm/hdr", `${id}_1k.hdr`));
    manifest.hdri.push(id);
  } catch (e) { console.warn("skip hdri", id, e.message); }
}

for (const id of MODELS) {
  try {
    const f = await files(id);
    const g = f.gltf["1k"].gltf;
    const dir = join(ROOT, "assets-src/polyhaven", id);
    await download(g.url, join(dir, `${id}.gltf`));
    for (const [rel, inc] of Object.entries(g.include)) await download(inc.url, join(dir, rel));
    manifest.models.push(id);
  } catch (e) { console.warn("skip model", id, e.message); }
}

for (const id of TEXTURES) {
  try {
    const f = await files(id);
    const dir = join(ROOT, "assets-src/polyhaven", id);
    for (const [key, name] of [["Diffuse", "diff"], ["nor_gl", "nor_gl"], ["Rough", "rough"], ["AO", "ao"]]) {
      const url = f[key]?.["1k"]?.jpg?.url;
      if (url) await download(url, join(dir, `${id}_${name}_1k.jpg`));
    }
    manifest.textures.push(id);
  } catch (e) { console.warn("skip texture", id, e.message); }
}

await mkdir(join(ROOT, "assets-src/polyhaven"), { recursive: true });
await writeFile(join(ROOT, "assets-src/polyhaven/manifest.json"), JSON.stringify(manifest, null, 2));
console.log("done:", JSON.stringify({ hdri: manifest.hdri, models: manifest.models, textures: manifest.textures }));

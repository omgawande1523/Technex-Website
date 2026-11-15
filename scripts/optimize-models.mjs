#!/usr/bin/env node
/**
 * Re-compresses every public/models/*.glb in place with @gltf-transform/cli:
 *   - weld + simplify + meshopt geometry compression (EXT_meshopt_compression)
 *   - textures: KTX2 / Basis ETC1S when the `toktx` binary (KTX-Software) is on
 *     PATH, otherwise WebP (EXT_texture_webp) as a fallback.
 *
 *   node scripts/optimize-models.mjs            # all models
 *   node scripts/optimize-models.mjs --dry-run  # print the commands only
 *
 * Originals are kept in .cache/models-original/ the first time this runs.
 * The browser decodes meshopt with three's MeshoptDecoder (no CDN needed) and
 * KTX2 with KTX2Loader (basis transcoder copied to public/basis/ if used).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "public", "models");
const backup = join(process.cwd(), ".cache", "models-original");
const dry = process.argv.includes("--dry-run");
const hasToktx = spawnSync(process.platform === "win32" ? "where" : "which", ["toktx"], { stdio: "ignore" }).status === 0;
const cli = join(process.cwd(), "node_modules", "@gltf-transform", "cli", "bin", "cli.js");

mkdirSync(backup, { recursive: true });
const kb = (f) => `${(statSync(f).size / 1024).toFixed(0)} KB`;

for (const file of readdirSync(dir).filter((f) => f.endsWith(".glb"))) {
  const src = join(dir, file);
  const orig = join(backup, file);
  if (!existsSync(orig)) copyFileSync(src, orig);
  const args = [
    cli,
    "optimize",
    orig,
    src,
    "--compress",
    "meshopt",
    "--texture-compress",
    hasToktx ? "ktx2" : "webp",
    "--texture-size",
    "1024",
    "--simplify",
    "true",
    "--simplify-error",
    "0.0008",
  ];
  console.log(`${dry ? "[dry] " : ""}${file}: ${hasToktx ? "meshopt + KTX2" : "meshopt + WebP (toktx not found)"}`);
  if (dry) continue;
  execFileSync(process.execPath, args, { stdio: ["ignore", "ignore", "inherit"] });
  console.log(`  ${kb(orig)} -> ${kb(src)}`);
}

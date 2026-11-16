#!/usr/bin/env node
// Compress assets-src/blender/raw/*.glb -> public/realm/models/*.glb (meshopt + webp textures).
import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync } from "node:fs";
mkdirSync("public/realm/models", { recursive: true });
for (const f of readdirSync("assets-src/blender/raw").filter((f) => f.endsWith(".glb"))) {
  const size = f === "rocks.glb" ? "512" : "1024";
  execFileSync("npx", ["gltf-transform", "optimize", `assets-src/blender/raw/${f}`, `public/realm/models/${f}`,
    "--compress", "meshopt", "--texture-compress", "webp", "--texture-size", size, "--simplify", "false", "--join", "false", "--flatten", "false", "--palette", "false", "--instance", "false"], { stdio: "inherit", shell: process.platform === "win32" });
}

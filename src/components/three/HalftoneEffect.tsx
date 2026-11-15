"use client";

import { forwardRef, useMemo } from "react";
import { BlendFunction, Effect } from "postprocessing";
import { Uniform, Vector3 } from "three";

/**
 * INKARNATE halftone / ink post-process: re-screens the frame as rotated
 * halftone dots in gold ink on black paper, with a little paper grain.
 * `mix` blends it over the original so particles keep their glow.
 */
const fragment = /* glsl */ `
uniform float uCell;
uniform float uMix;
uniform vec3 uInk;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // The canvas is transparent: only re-screen pixels that carry ink.
  float lum = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
  vec2 p = uv * resolution / uCell;
  float a = 0.785398;
  p = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;
  vec2 cell = fract(p) - 0.5;
  float r = sqrt(clamp(lum * 1.6, 0.0, 1.0)) * 0.6;
  float ink = smoothstep(0.07, 0.16, lum);
  float dotMask = (1.0 - smoothstep(r - 0.08, r, length(cell))) * ink;
  float grain = (hash(uv * resolution + time) - 0.5) * 0.06 * ink;
  vec3 screened = uInk * (0.7 + lum * 0.7) * dotMask + grain;
  vec3 rgb = mix(inputColor.rgb, screened, uMix);
  float alpha = max(inputColor.a * (1.0 - uMix), dotMask);
  outputColor = vec4(rgb, clamp(alpha, 0.0, 1.0));
}
`;

class HalftoneImpl extends Effect {
  constructor({ cell = 5, mix = 0.55 }: { cell?: number; mix?: number }) {
    super("InkHalftone", fragment, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["uCell", new Uniform(cell)],
        ["uMix", new Uniform(mix)],
        ["uInk", new Uniform(new Vector3(0.85, 0.68, 0.38))],
      ]),
    });
  }
}

export const Halftone = forwardRef<HalftoneImpl, { cell?: number; mix?: number }>(function Halftone(
  { cell = 5, mix = 0.55 },
  ref,
) {
  const effect = useMemo(() => new HalftoneImpl({ cell, mix }), [cell, mix]);
  return <primitive ref={ref} object={effect} dispose={null} />;
});

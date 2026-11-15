/**
 * Custom GLSL Shaders for GPGPU Particle Simulation and Point Cloud Rendering
 * TECHNEX 2026–27 Events Particle System
 */

// 3D Simplex Noise & Curl Noise GLSL implementations
export const CURL_NOISE_GLSL = /* glsl */ `
// Simplex 3D noise
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 curlNoise(vec3 p) {
  const float e = 0.08;
  float n1 = snoise(vec3(p.x, p.y + e, p.z));
  float n2 = snoise(vec3(p.x, p.y - e, p.z));
  float n3 = snoise(vec3(p.x, p.y, p.z + e));
  float n4 = snoise(vec3(p.x, p.y, p.z - e));
  float n5 = snoise(vec3(p.x + e, p.y, p.z));
  float n6 = snoise(vec3(p.x - e, p.y, p.z));

  float x = (n1 - n2) - (n3 - n4);
  float y = (n3 - n4) - (n5 - n6);
  float z = (n5 - n6) - (n1 - n2);

  return normalize(vec3(x, y, z));
}
`;

// GPGPU Velocity Simulation Shader
export const VELOCITY_SIMULATION_SHADER = /* glsl */ `
uniform float uTime;
uniform float uDelta;
uniform float uMorphProgress; // 0 (idle) -> 1 (settled)
uniform float uMorphTriggerTime;
uniform vec3 uPointerPos;
uniform float uPointerRadius;
uniform float uPointerStrength;
uniform float uSpringStiffness;
uniform float uSpringDamping;
uniform float uReducedMotion;

uniform sampler2D textureTarget;
uniform sampler2D textureOrigin;
uniform sampler2D textureAttributes;

${CURL_NOISE_GLSL}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 posData = texture2D(texturePosition, uv);
  vec4 velData = texture2D(textureVelocity, uv);
  vec4 targetData = texture2D(textureTarget, uv);
  vec4 originData = texture2D(textureOrigin, uv);
  vec4 attrData = texture2D(textureAttributes, uv);

  vec3 pos = posData.xyz;
  vec3 vel = velData.xyz;
  vec3 target = targetData.xyz;
  vec3 origin = originData.xyz;
  vec3 normal = targetData.w > 0.0 ? vec3(0.0, 1.0, 0.0) : vec3(0.0, 1.0, 0.0);

  // Staggered delay based on height (bottom up) and random seed
  float randomDelay = attrData.z * 0.45;
  float heightDelay = clamp((target.y + 1.5) * 0.12, 0.0, 0.35);
  float totalDelay = randomDelay + heightDelay;

  float timeSinceTrigger = max(0.0, uTime - uMorphTriggerTime);
  float activeTime = timeSinceTrigger - totalDelay;

  vec3 force = vec3(0.0);

  if (uReducedMotion > 0.5) {
    // Smooth direct crossfade
    vec3 dir = target - pos;
    vel = dir * (1.0 - exp(-12.0 * uDelta));
    gl_FragColor = vec4(vel, 1.0);
    return;
  }

  // 1. Initial burst phase (0.0 to 0.25s after particle's delay)
  if (activeTime > 0.0 && activeTime < 0.25) {
    float burstNorm = activeTime / 0.25;
    vec3 burstDir = normalize(pos - vec3(0.0, -0.2, 0.0) + vec3(0.0, 0.5, 0.0));
    float burstSpeed = mix(35.0, 10.0, burstNorm);
    force += burstDir * burstSpeed;
  }

  // 2. Spring force toward target form
  if (activeTime >= 0.1) {
    vec3 toTarget = target - pos;
    vec3 springForce = toTarget * uSpringStiffness * 60.0;
    force += springForce;

    // Curved flight via curl noise while moving
    float dist = length(toTarget);
    if (dist > 0.15) {
      vec3 curl = curlNoise(pos * 0.85 + vec3(0.0, uTime * 0.2, 0.0));
      force += curl * min(dist * 1.8, 4.5);
    }
  }

  // 3. Gentle ambient twinkle drift when settled
  vec3 settledCurl = curlNoise(pos * 1.5 + vec3(uTime * 0.15)) * 0.18;
  force += settledCurl;

  // 4. Pointer repulsion (pushes particles away gently within 60px / ~1.2 world units)
  vec3 toPointer = pos - uPointerPos;
  toPointer.z *= 0.5; // flatten depth for natural screen repulsion
  float pointerDist = length(toPointer);
  if (pointerDist < uPointerRadius && pointerDist > 0.001) {
    float repelFactor = (1.0 - pointerDist / uPointerRadius);
    force += normalize(toPointer) * (repelFactor * repelFactor * uPointerStrength);
  }

  // Integrate velocity: v = v * damping + force * dt
  vel = vel * uSpringDamping + force * uDelta;

  // Velocity clamp for stability
  float speed = length(vel);
  if (speed > 40.0) {
    vel = (vel / speed) * 40.0;
  }

  gl_FragColor = vec4(vel, speed);
}
`;

// GPGPU Position Simulation Shader
export const POSITION_SIMULATION_SHADER = /* glsl */ `
uniform float uDelta;
uniform float uReducedMotion;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 posData = texture2D(texturePosition, uv);
  vec4 velData = texture2D(textureVelocity, uv);

  vec3 pos = posData.xyz;
  vec3 vel = velData.xyz;

  pos += vel * uDelta;

  gl_FragColor = vec4(pos, posData.w);
}
`;

// Point Cloud Particle Vertex Shader
export const PARTICLE_VERTEX_SHADER = /* glsl */ `
uniform sampler2D uPosTex;
uniform sampler2D uVelTex;
uniform sampler2D uAttrTex;
uniform float uTime;
uniform float uDpr;
uniform float uBaseSize;

attribute vec2 aSimUv;

varying vec3 vColor;
varying float vAlpha;
varying float vTwinkle;
varying float vSpeed;

void main() {
  vec4 posData = texture2D(uPosTex, aSimUv);
  vec4 velData = texture2D(uVelTex, aSimUv);
  vec4 attrData = texture2D(uAttrTex, aSimUv);

  vec3 pos = posData.xyz;
  vec3 vel = velData.xyz;
  float speed = velData.w;

  // Particle color: 70% warm gold, 20% white, 10% teal
  float colorCode = attrData.y;
  vec3 colGold  = vec3(1.0, 0.839, 0.627); // #FFD6A0
  vec3 colWhite = vec3(1.0, 0.957, 0.886); // #FFF4E2
  vec3 colTeal  = vec3(0.549, 0.886, 0.878); // #8CE2E0

  if (colorCode < 0.70) {
    vColor = colGold;
  } else if (colorCode < 0.90) {
    vColor = colWhite;
  } else {
    vColor = colTeal;
  }

  // Twinkle calculation: slow random phase
  float phase = attrData.z * 6.28318;
  float twinkle = 0.65 + 0.35 * sin(uTime * 1.8 + phase);
  vTwinkle = twinkle;

  // Velocity stretching: stretch along movement direction
  float stretch = clamp(speed * 0.08, 0.0, 2.5);

  // Shell edge density glow: sparser inside, brighter edges
  float edgeWeight = attrData.w; // 1.0 for edge samples, 0.5 for inner
  vAlpha = (0.7 + edgeWeight * 0.3) * twinkle;
  vSpeed = speed;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Tiny soft points: 1.0 to 3.0 px, varied per particle, slight stretch on flight
  float pSize = mix(1.2, 2.8, attrData.x) * (1.0 + stretch * 0.4);
  gl_PointSize = pSize * uDpr;
  gl_PointSize = clamp(gl_PointSize, 1.0, 6.0);
}
`;

// Point Cloud Particle Fragment Shader
export const PARTICLE_FRAGMENT_SHADER = /* glsl */ `
precision highp float;

varying vec3 vColor;
varying float vAlpha;
varying float vTwinkle;
varying float vSpeed;

void main() {
  // Tiny soft point with delicate radial falloff
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  float soft = smoothstep(0.5, 0.1, dist);
  float core = smoothstep(0.2, 0.0, dist) * 0.4;

  vec3 outColor = vColor * (soft + core);

  // Dynamic light emission during flight
  outColor += vec3(0.15, 0.25, 0.3) * clamp(vSpeed * 0.04, 0.0, 0.6);

  gl_FragColor = vec4(outColor, vAlpha * soft * 0.85);
}
`;

// Cover-Fit Fullscreen Background Plane Vertex & Fragment Shaders
export const BG_PLANE_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`;

export const BG_PLANE_FRAGMENT = /* glsl */ `
uniform sampler2D uTexture;
uniform vec2 uPlaneRes;
uniform vec2 uImageRes;
uniform vec2 uParallax;

varying vec2 vUv;

void main() {
  // Cover fit calculation
  vec2 s = uPlaneRes;
  vec2 i = uImageRes;
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 newUv = vUv;

  if (rs > ri) {
    newUv = vec2(vUv.x, 0.5 + (vUv.y - 0.5) * (ri / rs));
  } else {
    newUv = vec2(0.5 + (vUv.x - 0.5) * (rs / ri), vUv.y);
  }

  // Apply subtle background parallax
  newUv += uParallax * 0.015;

  vec4 col = texture2D(uTexture, newUv);
  // Keep background tones below bloom threshold (0.6) so only particles glow
  col.rgb *= 0.72;
  gl_FragColor = col;
}
`;

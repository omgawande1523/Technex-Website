import * as THREE from 'three';

/**
 * Procedural floating human made only of points (no model file).
 * The body is a union of simple shapes (ellipsoids and tapered capsules) posed like a
 * calm figure drifting in space: arms hanging slightly away from the body, one knee
 * softly bent, toes pointing down, head tilted a little. Points are sampled on each
 * shape's surface and kept only if they are not buried inside another shape, so the
 * cloud describes the outer skin and the silhouette reads bright, like the reference.
 *
 * Units: metres, feet at y≈0, height ≈ 1.8, +z is the front, +x is the viewer's right.
 */

type V3 = [number, number, number];

interface Ellipsoid {
  kind: 'ellipsoid';
  c: V3;
  r: V3;
}

interface Capsule {
  kind: 'capsule';
  a: V3;
  b: V3;
  ra: number;
  rb: number;
}

type Shape = Ellipsoid | Capsule;

const ell = (c: V3, r: V3): Ellipsoid => ({ kind: 'ellipsoid', c, r });
const cap = (a: V3, b: V3, ra: number, rb: number): Capsule => ({ kind: 'capsule', a, b, ra, rb });

function buildShapes(): Shape[] {
  const shapes: Shape[] = [
    // Head (slightly tilted toward the viewer's right) and neck
    ell([0.012, 1.665, 0.012], [0.088, 0.115, 0.1]),
    ell([0.01, 1.6, 0.045], [0.06, 0.05, 0.05]), // jaw
    cap([0, 1.49, -0.005], [0.008, 1.585, 0.01], 0.058, 0.05),
    // Torso: chest, ribcage/abdomen, pelvis, with trapezius slope into the shoulders
    ell([0, 1.35, 0.005], [0.175, 0.14, 0.105]), // chest
    ell([0, 1.22, 0.0], [0.145, 0.12, 0.095]), // ribcage
    ell([0, 1.08, 0.005], [0.12, 0.11, 0.088]), // waist
    ell([0, 0.95, 0.0], [0.145, 0.1, 0.098]), // pelvis
    // Trapezius sloping down into the shoulders
    cap([-0.05, 1.5, -0.015], [-0.18, 1.44, -0.01], 0.045, 0.05),
    cap([0.05, 1.5, -0.015], [0.18, 1.44, -0.01], 0.045, 0.05),
    // Glutes, kept inside the hip line so they don't bulge from the front
    ell([-0.058, 0.9, -0.055], [0.07, 0.085, 0.065]),
    ell([0.058, 0.9, -0.055], [0.07, 0.085, 0.065]),
  ];

  // Arms: viewer-left arm hangs a bit further out than the viewer-right arm
  const arm = (side: 1 | -1, out: number) => {
    const sh: V3 = [side * 0.2, 1.42, -0.01];
    const el: V3 = [side * (0.25 + out * 0.6), 1.15, -0.04];
    const wr: V3 = [side * (0.29 + out), 0.9, 0.02];
    shapes.push(
      ell([side * 0.195, 1.415, 0.0], [0.058, 0.07, 0.058]), // deltoid
      cap(sh, el, 0.045, 0.036),
      cap(el, wr, 0.036, 0.025),
      ell([side * (0.3 + out * 1.1), 0.82, 0.03], [0.022, 0.062, 0.038]), // hand
    );
  };
  arm(-1, 0.045);
  arm(1, 0.0);

  // Legs: viewer-right knee bends slightly back, both feet point down
  const leg = (side: 1 | -1, bend: number) => {
    // Legs taper from the hips and draw together toward the pointed feet
    const hip: V3 = [side * 0.088, 0.92, 0.0];
    const knee: V3 = [side * 0.07, 0.52, 0.03 + bend * 0.05];
    const ankle: V3 = [side * 0.052, 0.13, -0.02 - bend * 0.1];
    const toe: V3 = [side * 0.048, -0.03, 0.02 - bend * 0.09];
    shapes.push(
      cap(hip, knee, 0.072, 0.045),
      cap(knee, ankle, 0.043, 0.027),
      ell([side * 0.064, 0.38, -0.025 - bend * 0.035], [0.04, 0.09, 0.042]), // calf
      cap(ankle, toe, 0.028, 0.018),
    );
  };
  leg(-1, 0);
  leg(1, 1);

  return shapes;
}

// --- signed distance (negative inside) -----------------------------------------------
const _p = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

function sdf(shape: Shape, x: number, y: number, z: number): number {
  if (shape.kind === 'ellipsoid') {
    const [cx, cy, cz] = shape.c;
    const [rx, ry, rz] = shape.r;
    const k = Math.hypot((x - cx) / rx, (y - cy) / ry, (z - cz) / rz);
    return (k - 1) * Math.min(rx, ry, rz);
  }
  _p.set(x, y, z);
  _a.set(...shape.a);
  _b.set(...shape.b);
  const ab = _b.clone().sub(_a);
  const t = THREE.MathUtils.clamp(_p.clone().sub(_a).dot(ab) / ab.lengthSq(), 0, 1);
  const r = shape.ra + (shape.rb - shape.ra) * t;
  return _p.distanceTo(_a.add(ab.multiplyScalar(t))) - r;
}

function surfaceArea(shape: Shape): number {
  if (shape.kind === 'ellipsoid') {
    const [a, b, c] = shape.r;
    const p = 1.6075;
    return 4 * Math.PI * Math.pow((Math.pow(a * b, p) + Math.pow(a * c, p) + Math.pow(b * c, p)) / 3, 1 / p);
  }
  const len = new THREE.Vector3(...shape.a).distanceTo(new THREE.Vector3(...shape.b));
  return Math.PI * (shape.ra + shape.rb) * len + 2 * Math.PI * (shape.ra ** 2 + shape.rb ** 2);
}

const randomUnit = (out: THREE.Vector3) => {
  const u = Math.random() * 2 - 1;
  const t = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return out.set(s * Math.cos(t), u, s * Math.sin(t));
};

const _d = new THREE.Vector3();
const _axis = new THREE.Vector3();
const _u = new THREE.Vector3();
const _v = new THREE.Vector3();

function samplePoint(shape: Shape, out: THREE.Vector3): THREE.Vector3 {
  if (shape.kind === 'ellipsoid') {
    randomUnit(_d);
    return out.set(
      shape.c[0] + _d.x * shape.r[0],
      shape.c[1] + _d.y * shape.r[1],
      shape.c[2] + _d.z * shape.r[2],
    );
  }
  _a.set(...shape.a);
  _axis.set(...shape.b).sub(_a);
  const len = _axis.length();
  _axis.normalize();
  const sideArea = Math.PI * (shape.ra + shape.rb) * len;
  const capArea = 2 * Math.PI * (shape.ra ** 2 + shape.rb ** 2);
  if (Math.random() < sideArea / (sideArea + capArea)) {
    _u.set(Math.abs(_axis.y) < 0.9 ? 0 : 1, Math.abs(_axis.y) < 0.9 ? 1 : 0, 0).cross(_axis).normalize();
    _v.crossVectors(_axis, _u);
    const t = Math.random();
    const r = shape.ra + (shape.rb - shape.ra) * t;
    const ang = Math.random() * Math.PI * 2;
    return out
      .copy(_a)
      .addScaledVector(_axis, t * len)
      .addScaledVector(_u, Math.cos(ang) * r)
      .addScaledVector(_v, Math.sin(ang) * r);
  }
  // End caps
  const atB = Math.random() < shape.rb ** 2 / (shape.ra ** 2 + shape.rb ** 2);
  randomUnit(_d);
  if (atB) return out.set(...shape.b).addScaledVector(_d, shape.rb);
  return out.copy(_a).addScaledVector(_d, shape.ra);
}

export interface ParticleHumanData {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
}

export function generateParticleHuman(count: number): ParticleHumanData {
  const shapes = buildShapes();
  const areas = shapes.map(surfaceArea);
  const total = areas.reduce((s, a) => s + a, 0);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const warm = new THREE.Color(1.0, 0.93, 0.8);
  const white = new THREE.Color(1.0, 0.98, 0.95);
  const ember = new THREE.Color(1.0, 0.55, 0.25);
  const c = new THREE.Color();
  const p = new THREE.Vector3();

  let k = 0;
  let guard = 0;
  while (k < count && guard < count * 30) {
    guard++;
    // Pick a shape proportional to its surface area
    let r = Math.random() * total;
    let si = 0;
    while (si < shapes.length - 1 && (r -= areas[si]) > 0) si++;
    samplePoint(shapes[si], p);
    // Keep only the outer skin of the union
    let buried = false;
    for (let j = 0; j < shapes.length; j++) {
      if (j !== si && sdf(shapes[j], p.x, p.y, p.z) < -0.004) {
        buried = true;
        break;
      }
    }
    if (buried) continue;

    // Tiny jitter so the surface looks like scattered stars, not a mesh
    p.x += (Math.random() - 0.5) * 0.006;
    p.y += (Math.random() - 0.5) * 0.006;
    p.z += (Math.random() - 0.5) * 0.006;
    positions.set([p.x, p.y, p.z], k * 3);

    // Warm white body, glowing ember tint toward the feet, the odd pure-white star
    c.copy(Math.random() < 0.18 ? white : warm);
    c.lerp(ember, THREE.MathUtils.clamp((0.35 - p.y) / 0.35, 0, 1) * 0.85);
    colors.set([c.r, c.g, c.b], k * 3);
    k++;
  }

  return { positions, colors, count: k };
}

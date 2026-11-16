import * as THREE from "three";

/**
 * World layout, in metres. The camera, Inky and the fog are all pure functions
 * of `progress` (0 … 4). Stops are [progress, ...xyz].
 *
 * Portal numbers mirror scripts/blender/build_realm.py (ring centre 4.06 m,
 * inner radius 2.89 m, front face at z = +0.35 after the Y-up export).
 */
export const PORTAL = { centerY: 4.06, innerR: 2.87, stepTop: 0.84 };

export const SPOTS = {
  gate: new THREE.Vector3(0, 0, 0),
  realm: new THREE.Vector3(0, 3.2, -34),
  events: new THREE.Vector3(22, 4.6, -46),
  workshops: new THREE.Vector3(0, 4.6, -80),
  register: new THREE.Vector3(0, 4.6, -112),
};

type Stop = [number, number, number, number];

export const CAMERA_POS: Stop[] = [
  [0, 0, 3.7, 15.5],
  [0.5, 0, 4.15, 7.0],
  [0.78, 0, 4.1, -3.0],
  [1, 0, 4.3, -23.5],
  [1.5, 12, 5.6, -29],
  [2, 22, 5.2, -32],
  [2.5, 13, 6.4, -55],
  [3, 0, 7.2, -64],
  [3.5, 0, 11.5, -90],
  [4, 0, 4.7, -102],
];

export const CAMERA_LOOK: Stop[] = [
  [0, 0, 4.6, 0],
  [0.5, 0, 4.1, -2],
  [0.78, 0, 3.9, -20],
  [1, 0, 3.6, -34],
  [1.5, 15, 4.6, -42],
  [2, 22, 4.7, -46],
  [2.5, 8, 5.0, -70],
  [3, 0, 4.7, -80],
  [3.5, 0, 5.2, -104],
  [4, 0, 4.6, -112],
];

/** Where Inky stands in each chapter (feet on the ground). */
export const INKY_AT: Stop[] = [
  [0, 0, 1.5, 2.1],
  [1, 0, 3.05, -34],
  [2, 22, 2.3, -44.5],
  [3, 0, 3.9, -80],
  [4, 0, 4.25, -112],
];

/** Background / fog colour per chapter. */
export const SKY: [number, string][] = [
  [0, "#070504"],
  [1, "#0a0612"],
  [2, "#040405"],
  [3, "#0b0704"],
  [4, "#030308"],
];

function curveFrom(stops: Stop[]) {
  return new THREE.CatmullRomCurve3(
    stops.map(([, x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "centripetal",
    0.5,
  );
}

const camPosCurve = curveFrom(CAMERA_POS);
const camLookCurve = curveFrom(CAMERA_LOOK);
const inkyCurve = curveFrom(INKY_AT);

/** Map progress to a curve parameter so each stop sits at its own progress. */
function paramFor(p: number, stops: Stop[]) {
  const n = stops.length - 1;
  if (p <= stops[0][0]) return 0;
  for (let i = 1; i <= n; i++) {
    if (p <= stops[i][0]) {
      const t = (p - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
      return (i - 1 + t) / n;
    }
  }
  return 1;
}

export const cameraPosition = (p: number, out: THREE.Vector3) => camPosCurve.getPoint(paramFor(p, CAMERA_POS), out);
export const cameraTarget = (p: number, out: THREE.Vector3) => camLookCurve.getPoint(paramFor(p, CAMERA_LOOK), out);
export const inkyPosition = (p: number, out: THREE.Vector3) => inkyCurve.getPoint(paramFor(p, INKY_AT), out);

const c0 = new THREE.Color();
const c1 = new THREE.Color();
export function skyColor(p: number, out: THREE.Color) {
  const i = Math.min(SKY.length - 2, Math.max(0, Math.floor(p)));
  const t = THREE.MathUtils.clamp(p - i, 0, 1);
  c0.set(SKY[i][1]);
  c1.set(SKY[i + 1][1]);
  return out.copy(c0).lerp(c1, t * t * (3 - 2 * t));
}

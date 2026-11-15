import * as THREE from 'three';

/**
 * Procedural 3D Geometry Generators for TECHNEX Event Forms
 * Generates clean, original 3D meshes ready for MeshSurfaceSampler.
 */

// Helper to merge multiple geometries
export function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();
  const posArrays: Float32Array[] = [];
  const normArrays: Float32Array[] = [];

  for (const g of geos) {
    const p = g.getAttribute('position') as THREE.BufferAttribute;
    if (p) posArrays.push(new Float32Array(p.array));
    const n = g.getAttribute('normal') as THREE.BufferAttribute;
    if (n) {
      normArrays.push(new Float32Array(n.array));
    } else {
      g.computeVertexNormals();
      const compN = g.getAttribute('normal') as THREE.BufferAttribute;
      if (compN) normArrays.push(new Float32Array(compN.array));
    }
  }

  const totalVerts = posArrays.reduce((acc, a) => acc + a.length, 0);
  const finalPos = new Float32Array(totalVerts);
  const finalNorm = new Float32Array(totalVerts);

  let offset = 0;
  for (let i = 0; i < posArrays.length; i++) {
    finalPos.set(posArrays[i], offset);
    if (normArrays[i]) finalNorm.set(normArrays[i], offset);
    offset += posArrays[i].length;
  }

  merged.setAttribute('position', new THREE.BufferAttribute(finalPos, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(finalNorm, 3));
  return merged;
}

// 0. RELAXED HUMAN FIGURE (Floating above pedestal, seen at 3/4)
export function createHumanGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const head = new THREE.SphereGeometry(0.24, 16, 16);
  head.scale(0.85, 1.1, 0.9);
  head.translate(0, 1.05, 0);
  parts.push(head);

  const torso = new THREE.CylinderGeometry(0.36, 0.28, 0.85, 16);
  torso.scale(1.0, 1.0, 0.65);
  torso.translate(0, 0.45, 0);
  parts.push(torso);

  const pelvis = new THREE.CylinderGeometry(0.28, 0.32, 0.35, 16);
  pelvis.scale(1.0, 1.0, 0.65);
  pelvis.translate(0, -0.05, 0);
  parts.push(pelvis);

  [-0.18, 0.18].forEach((x) => {
    const thigh = new THREE.CylinderGeometry(0.14, 0.11, 0.75, 12);
    thigh.translate(x, -0.55, 0);
    parts.push(thigh);
    const calf = new THREE.CylinderGeometry(0.11, 0.08, 0.75, 12);
    calf.translate(x, -1.25, 0);
    parts.push(calf);
  });

  [-0.48, 0.48].forEach((x) => {
    const arm = new THREE.CylinderGeometry(0.1, 0.07, 0.75, 12);
    arm.rotateZ(x > 0 ? -0.25 : 0.25);
    arm.translate(x, 0.4, 0);
    parts.push(arm);
    const forearm = new THREE.CylinderGeometry(0.07, 0.05, 0.65, 12);
    forearm.rotateZ(x > 0 ? -0.35 : 0.35);
    forearm.translate(x > 0 ? 0.72 : -0.72, -0.2, 0.1);
    parts.push(forearm);
  });

  return mergeGeometries(parts);
}

// 1. ORIGINAL POWERED EXOSUIT (Segmented plates, chest core, smooth faceplate)
export function createExosuitGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Torso / segmented armor plates
  const chest = new THREE.BoxGeometry(0.85, 0.75, 0.55, 4, 4, 4);
  chest.translate(0, 0.45, 0);
  parts.push(chest);

  // Glowing arc reactor chest core
  const core = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 24);
  core.rotateX(Math.PI / 2);
  core.translate(0, 0.52, 0.28);
  parts.push(core);

  // Smooth futuristic helmet & faceplate
  const helmet = new THREE.SphereGeometry(0.32, 24, 24);
  helmet.scale(0.85, 1.05, 0.95);
  helmet.translate(0, 1.15, 0);
  parts.push(helmet);

  const visor = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16, 1, false, -Math.PI / 3, (Math.PI * 2) / 3);
  visor.rotateX(Math.PI / 2);
  visor.translate(0, 1.15, 0.22);
  parts.push(visor);

  // Segmented shoulder pauldrons
  [-0.62, 0.62].forEach((x) => {
    const pauldron = new THREE.SphereGeometry(0.28, 16, 16);
    pauldron.scale(1.1, 0.75, 1.0);
    pauldron.translate(x, 0.78, 0);
    parts.push(pauldron);

    // Bicep & gauntlet armor
    const arm = new THREE.CylinderGeometry(0.14, 0.12, 0.65, 16);
    arm.translate(x, 0.35, 0);
    parts.push(arm);

    const gauntlet = new THREE.BoxGeometry(0.18, 0.45, 0.22);
    gauntlet.translate(x, -0.15, 0);
    parts.push(gauntlet);
  });

  // Waist & thigh greaves
  const waist = new THREE.CylinderGeometry(0.38, 0.42, 0.35, 16);
  waist.translate(0, -0.05, 0);
  parts.push(waist);

  [-0.26, 0.26].forEach((x) => {
    const thigh = new THREE.CylinderGeometry(0.18, 0.15, 0.75, 16);
    thigh.translate(x, -0.55, 0);
    parts.push(thigh);

    const knee = new THREE.SphereGeometry(0.14, 12, 12);
    knee.translate(x, -0.92, 0.08);
    parts.push(knee);

    const shin = new THREE.BoxGeometry(0.22, 0.7, 0.26);
    shin.translate(x, -1.3, 0);
    parts.push(shin);
  });

  return mergeGeometries(parts);
}

// 2. ORIGINAL SHIP'S COMPUTER CONSOLE (Curved desk, angled screens, hovering holosphere)
export function createConsoleGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Curved command desk base
  const desk = new THREE.CylinderGeometry(1.2, 1.35, 0.55, 32, 1, false, -Math.PI / 2.2, Math.PI / 1.1);
  desk.translate(0, -0.45, 0);
  parts.push(desk);

  // Upper console console tier
  const upperTier = new THREE.CylinderGeometry(1.05, 1.15, 0.25, 24, 1, false, -Math.PI / 2.4, Math.PI / 1.2);
  upperTier.translate(0, -0.15, 0);
  parts.push(upperTier);

  // Angled holographic screens
  [-0.45, 0, 0.45].forEach((angle, i) => {
    const screen = new THREE.BoxGeometry(0.48, 0.35, 0.04);
    screen.rotateX(-0.25);
    screen.rotateY(angle);
    screen.translate(Math.sin(angle) * 0.85, 0.22, Math.cos(angle) * 0.85 - 0.1);
    parts.push(screen);
  });

  // Floating holographic data sphere
  const holosphere = new THREE.SphereGeometry(0.22, 24, 24);
  holosphere.translate(0, 0.65, 0.2);
  parts.push(holosphere);

  // Orbiting data ring around holosphere
  const ring = new THREE.TorusGeometry(0.35, 0.018, 12, 32);
  ring.rotateX(Math.PI / 3.5);
  ring.translate(0, 0.65, 0.2);
  parts.push(ring);

  // Keyboard button matrix banks
  for (let r = 0; r < 3; r++) {
    for (let c = -4; c <= 4; c++) {
      const btn = new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8);
      btn.translate(c * 0.09, -0.05, 0.45 + r * 0.07);
      parts.push(btn);
    }
  }

  return mergeGeometries(parts);
}

// 3. ORIGINAL MINIATURE SUBMARINE (Round viewport, propeller, manipulator arms, searchlights)
export function createSubmarineGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Cylindrical streamlined pressure hull
  const hull = new THREE.SphereGeometry(0.75, 32, 24);
  hull.scale(0.85, 0.85, 1.6);
  parts.push(hull);

  // Conning tower sail & periscope
  const tower = new THREE.CylinderGeometry(0.25, 0.32, 0.45, 16);
  tower.scale(0.65, 1, 1.2);
  tower.translate(0, 0.82, 0);
  parts.push(tower);

  // Round front observation viewport dome
  const viewport = new THREE.SphereGeometry(0.38, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  viewport.rotateX(Math.PI / 2);
  viewport.translate(0, 0, 1.2);
  parts.push(viewport);

  // Lateral searchlights
  [-0.48, 0.48].forEach((x) => {
    const light = new THREE.CylinderGeometry(0.12, 0.09, 0.2, 16);
    light.rotateX(Math.PI / 2);
    light.translate(x, 0.22, 1.05);
    parts.push(light);
  });

  // Dual articulated manipulator arms
  [-0.38, 0.38].forEach((x) => {
    const shoulder = new THREE.SphereGeometry(0.1, 12, 12);
    shoulder.translate(x, -0.32, 0.85);
    parts.push(shoulder);

    const forearm = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12);
    forearm.rotateX(Math.PI / 4);
    forearm.translate(x, -0.45, 1.05);
    parts.push(forearm);

    const claw = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI * 1.4);
    claw.rotateY(Math.PI / 2);
    claw.translate(x, -0.62, 1.25);
    parts.push(claw);
  });

  // Stern propeller hub and 4 blades
  const hub = new THREE.ConeGeometry(0.12, 0.25, 16);
  hub.rotateX(-Math.PI / 2);
  hub.translate(0, 0, -1.35);
  parts.push(hub);

  for (let i = 0; i < 4; i++) {
    const blade = new THREE.BoxGeometry(0.36, 0.08, 0.02);
    blade.rotateZ((i * Math.PI) / 2);
    blade.translate(0, 0, -1.3);
    parts.push(blade);
  }

  return mergeGeometries(parts);
}

// 4. ORIGINAL TACTICAL DRONE
export function createDroneGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const body = new THREE.BoxGeometry(0.55, 0.22, 0.55);
  parts.push(body);

  const dome = new THREE.SphereGeometry(0.16, 16, 16);
  dome.translate(0, 0.12, 0);
  parts.push(dome);

  // 4 X-arms with rotor bells
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dx, dz]) => {
    const arm = new THREE.CylinderGeometry(0.035, 0.035, 0.95, 12);
    arm.rotateZ(Math.PI / 2);
    arm.rotateY(Math.atan2(dz, dx));
    arm.translate(dx * 0.4, 0, dz * 0.4);
    parts.push(arm);

    const rotorBell = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
    rotorBell.translate(dx * 0.78, 0.06, dz * 0.78);
    parts.push(rotorBell);

    const prop = new THREE.BoxGeometry(0.65, 0.015, 0.06);
    prop.translate(dx * 0.78, 0.12, dz * 0.78);
    parts.push(prop);
  });

  return mergeGeometries(parts);
}

// 5. ORIGINAL ORBITAL ROCKET
export function createRocketGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const fuselage = new THREE.CylinderGeometry(0.32, 0.38, 1.6, 24);
  fuselage.translate(0, 0, 0);
  parts.push(fuselage);

  const nose = new THREE.ConeGeometry(0.32, 0.85, 24);
  nose.translate(0, 1.22, 0);
  parts.push(nose);

  const nozzle = new THREE.CylinderGeometry(0.24, 0.38, 0.32, 20);
  nozzle.translate(0, -0.95, 0);
  parts.push(nozzle);

  // Triple swept fins
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.BoxGeometry(0.04, 0.65, 0.45);
    fin.rotateY((i * Math.PI * 2) / 3);
    fin.translate(Math.cos((i * Math.PI * 2) / 3) * 0.42, -0.55, Math.sin((i * Math.PI * 2) / 3) * 0.42);
    parts.push(fin);
  }

  return mergeGeometries(parts);
}

// 6. ORIGINAL NEURAL CIRCUIT CHIP
export function createCircuitChipGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const chipBody = new THREE.BoxGeometry(1.2, 0.15, 1.2);
  parts.push(chipBody);

  const die = new THREE.BoxGeometry(0.65, 0.06, 0.65);
  die.translate(0, 0.09, 0);
  parts.push(die);

  // 32 Perimeter connector pins
  const pinCountPerSide = 8;
  [-0.68, 0.68].forEach((x) => {
    for (let i = 0; i < pinCountPerSide; i++) {
      const pin = new THREE.BoxGeometry(0.18, 0.025, 0.045);
      const z = -0.45 + (i / (pinCountPerSide - 1)) * 0.9;
      pin.translate(x, 0, z);
      parts.push(pin);
    }
  });

  [-0.68, 0.68].forEach((z) => {
    for (let i = 0; i < pinCountPerSide; i++) {
      const pin = new THREE.BoxGeometry(0.045, 0.025, 0.18);
      const x = -0.45 + (i / (pinCountPerSide - 1)) * 0.9;
      pin.translate(x, 0, z);
      parts.push(pin);
    }
  });

  return mergeGeometries(parts);
}

// 7. ORIGINAL EDISON LIGHT BULB
export function createLightBulbGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const bulbSphere = new THREE.SphereGeometry(0.65, 24, 24);
  bulbSphere.translate(0, 0.35, 0);
  parts.push(bulbSphere);

  const bulbNeck = new THREE.CylinderGeometry(0.65, 0.32, 0.55, 24);
  bulbNeck.translate(0, -0.15, 0);
  parts.push(bulbNeck);

  const screwBase = new THREE.CylinderGeometry(0.28, 0.28, 0.45, 24);
  screwBase.translate(0, -0.65, 0);
  parts.push(screwBase);

  // Filament loops
  const filament1 = new THREE.TorusGeometry(0.18, 0.02, 8, 16, Math.PI * 1.5);
  filament1.translate(0, 0.35, 0);
  parts.push(filament1);

  return mergeGeometries(parts);
}

// 8. ORIGINAL HYDROFOIL RACING BOAT
export function createBoatGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const hull = new THREE.ConeGeometry(0.55, 2.0, 16);
  hull.rotateX(Math.PI / 2);
  hull.scale(1.1, 0.4, 1.0);
  parts.push(hull);

  const deck = new THREE.BoxGeometry(0.75, 0.18, 1.4);
  deck.translate(0, 0.1, -0.2);
  parts.push(deck);

  const cockpit = new THREE.SphereGeometry(0.28, 16, 16);
  cockpit.scale(0.8, 0.5, 1.4);
  cockpit.translate(0, 0.22, -0.1);
  parts.push(cockpit);

  [-0.55, 0.55].forEach((x) => {
    const foil = new THREE.BoxGeometry(0.35, 0.04, 0.12);
    foil.rotateZ(x > 0 ? 0.3 : -0.3);
    foil.translate(x, -0.18, 0.2);
    parts.push(foil);
  });

  return mergeGeometries(parts);
}

// 9. ORIGINAL ROBOTIC MANIPULATOR ARM
export function createRoboticArmGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const base = new THREE.CylinderGeometry(0.48, 0.55, 0.25, 24);
  base.translate(0, -0.9, 0);
  parts.push(base);

  const shoulder = new THREE.SphereGeometry(0.25, 16, 16);
  shoulder.translate(0, -0.65, 0);
  parts.push(shoulder);

  const bicep = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 16);
  bicep.rotateZ(0.25);
  bicep.translate(0.15, -0.25, 0);
  parts.push(bicep);

  const elbow = new THREE.SphereGeometry(0.2, 16, 16);
  elbow.translate(0.32, 0.18, 0);
  parts.push(elbow);

  const forearm = new THREE.CylinderGeometry(0.09, 0.09, 0.7, 16);
  forearm.rotateZ(-0.4);
  forearm.translate(0.18, 0.55, 0);
  parts.push(forearm);

  const wrist = new THREE.SphereGeometry(0.12, 12, 12);
  wrist.translate(0.02, 0.9, 0);
  parts.push(wrist);

  // 3 Gripper fingers
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const finger = new THREE.BoxGeometry(0.04, 0.22, 0.04);
    finger.translate(Math.cos(angle) * 0.08, 1.05, Math.sin(angle) * 0.08);
    parts.push(finger);
  }

  return mergeGeometries(parts);
}

// 10. ORIGINAL SUPERSONIC JET
export function createJetGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const fuselage = new THREE.CylinderGeometry(0.18, 0.25, 2.2, 16);
  fuselage.rotateX(Math.PI / 2);
  parts.push(fuselage);

  const nose = new THREE.ConeGeometry(0.18, 0.75, 16);
  nose.rotateX(-Math.PI / 2);
  nose.translate(0, 0, 1.45);
  parts.push(nose);

  const wing = new THREE.BoxGeometry(2.1, 0.03, 0.95);
  wing.translate(0, 0, -0.2);
  parts.push(wing);

  [-0.32, 0.32].forEach((x) => {
    const fin = new THREE.BoxGeometry(0.03, 0.55, 0.38);
    fin.rotateZ(x > 0 ? 0.22 : -0.22);
    fin.translate(x, 0.26, -0.85);
    parts.push(fin);
  });

  return mergeGeometries(parts);
}

// 11. ORIGINAL PRECISION SPUR GEAR
export function createGearGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const rim = new THREE.CylinderGeometry(0.85, 0.85, 0.18, 32);
  parts.push(rim);

  const teethCount = 20;
  for (let i = 0; i < teethCount; i++) {
    const angle = (i / teethCount) * Math.PI * 2;
    const tooth = new THREE.BoxGeometry(0.12, 0.18, 0.16);
    tooth.rotateY(angle);
    tooth.translate(Math.cos(angle) * 0.92, 0, Math.sin(angle) * 0.92);
    parts.push(tooth);
  }

  const hub = new THREE.CylinderGeometry(0.32, 0.32, 0.28, 20);
  parts.push(hub);

  return mergeGeometries(parts);
}

// 12. ORIGINAL NEURAL CORE (Synaptic Node Sphere)
export function createNeuralCoreGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const core = new THREE.IcosahedronGeometry(0.65, 2);
  parts.push(core);

  // Outer orbital synaptic node rings
  const ring1 = new THREE.TorusGeometry(0.95, 0.02, 12, 32);
  ring1.rotateX(Math.PI / 3);
  parts.push(ring1);

  const ring2 = new THREE.TorusGeometry(1.15, 0.02, 12, 32);
  ring2.rotateY(Math.PI / 3);
  parts.push(ring2);

  // Concentric neural node spheres
  for (let i = 0; i < 18; i++) {
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;
    const r = 0.85;
    const node = new THREE.SphereGeometry(0.065, 8, 8);
    node.translate(r * Math.sin(theta) * Math.cos(phi), r * Math.sin(theta) * Math.sin(phi), r * Math.cos(theta));
    parts.push(node);
  }

  return mergeGeometries(parts);
}

// 13. ORIGINAL ARCHITECTURAL SUSPENSION BRIDGE
export function createSuspensionBridgeGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Twin gothic towers
  [-0.65, 0.65].forEach((x) => {
    const towerL = new THREE.BoxGeometry(0.09, 1.6, 0.09);
    towerL.translate(x, 0, -0.22);
    parts.push(towerL);

    const towerR = new THREE.BoxGeometry(0.09, 1.6, 0.09);
    towerR.translate(x, 0, 0.22);
    parts.push(towerR);

    const crossBeam = new THREE.BoxGeometry(0.08, 0.08, 0.52);
    crossBeam.translate(x, 0.65, 0);
    parts.push(crossBeam);
  });

  // Roadway traffic deck
  const deck = new THREE.BoxGeometry(2.3, 0.05, 0.42);
  deck.translate(0, -0.25, 0);
  parts.push(deck);

  // Catenary parabolic cables
  const cablePtsL: THREE.Vector3[] = [];
  const cablePtsR: THREE.Vector3[] = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const x = -1.1 + t * 2.2;
    const y = 0.75 - Math.sin(t * Math.PI) * 0.95;
    cablePtsL.push(new THREE.Vector3(x, y, -0.22));
    cablePtsR.push(new THREE.Vector3(x, y, 0.22));
  }
  const curveL = new THREE.CatmullRomCurve3(cablePtsL);
  const curveR = new THREE.CatmullRomCurve3(cablePtsR);
  parts.push(new THREE.TubeGeometry(curveL, 30, 0.015, 6, false));
  parts.push(new THREE.TubeGeometry(curveR, 30, 0.015, 6, false));

  return mergeGeometries(parts);
}

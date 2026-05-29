import { state } from "./state.js";

export const STRUCTURE_TYPES = {
  STAR: "star",
  PLANET: "planet",
  MOON: "moon",
  ASTEROID_BELT: "asteroid_belt",
  RING_SYSTEM: "ring_system",
  BLACK_HOLE: "black_hole"
};

export function getCosmicStructures() {
  const cx = state.width / 2;
  const cy = state.height / 2;
  const unit = Math.min(state.width, state.height);

  return [
    {
      id: "central-star",
      name: "Helion",
      type: STRUCTURE_TYPES.STAR,
      x: cx,
      y: cy,
      radius: unit * 0.075,
      gravity: 0.065,
      orbitStrength: 0.04,
      mass: 1.8,
      glow: 1,
      particleShare: 0.14
    },

    {
      id: "inner-planet",
      name: "Aster",
      type: STRUCTURE_TYPES.PLANET,
      x: cx + unit * 0.22,
      y: cy - unit * 0.05,
      radius: unit * 0.05,
      gravity: 0.03,
      orbitStrength: 0.025,
      mass: 0.55,
      glow: 0.45,
      particleShare: 0.1
    },

    {
      id: "outer-planet",
      name: "Orionis",
      type: STRUCTURE_TYPES.PLANET,
      x: cx - unit * 0.34,
      y: cy + unit * 0.09,
      radius: unit * 0.08,
      gravity: 0.04,
      orbitStrength: 0.028,
      mass: 0.95,
      glow: 0.58,
      particleShare: 0.16
    },

    {
      id: "moon",
      name: "Luma",
      type: STRUCTURE_TYPES.MOON,
      parentId: "outer-planet",
      offsetX: unit * 0.12,
      offsetY: -unit * 0.05,
      radius: unit * 0.03,
      gravity: 0.02,
      orbitStrength: 0.018,
      mass: 0.22,
      glow: 0.28,
      particleShare: 0.05
    },

    {
      id: "asteroid-belt",
      name: "The Pale Belt",
      type: STRUCTURE_TYPES.ASTEROID_BELT,
      x: cx,
      y: cy,
      innerRadius: unit * 0.42,
      outerRadius: unit * 0.54,
      gravity: 0.01,
      orbitStrength: 0.03,
      mass: 0.18,
      glow: 0.18,
      particleShare: 0.25
    },

    {
      id: "ring-system",
      name: "Orionis Rings",
      type: STRUCTURE_TYPES.RING_SYSTEM,
      parentId: "outer-planet",
      innerRadius: unit * 0.1,
      outerRadius: unit * 0.18,
      tilt: -0.42,
      gravity: 0.015,
      orbitStrength: 0.03,
      mass: 0.12,
      glow: 0.35,
      particleShare: 0.18
    },

    {
      id: "hidden-black-hole",
      name: "The Quiet Well",
      type: STRUCTURE_TYPES.BLACK_HOLE,
      x: cx + unit * 0.05,
      y: cy + unit * 0.31,
      radius: unit * 0.032,
      influenceRadius: unit * 0.16,
      gravity: 0.028,
      orbitStrength: 0.055,
      mass: 2.4,
      glow: 0.2,
      particleShare: 0.06
    }
  ];
}

export function resolveStructurePosition(structure, structures = getCosmicStructures()) {
  if (!structure.parentId) {
    return {
      x: structure.x,
      y: structure.y
    };
  }

  const parent = structures.find((item) => item.id === structure.parentId);

  if (!parent) {
    return {
      x: state.width / 2,
      y: state.height / 2
    };
  }

  const parentPosition = resolveStructurePosition(parent, structures);

  return {
    x: parentPosition.x + (structure.offsetX || 0),
    y: parentPosition.y + (structure.offsetY || 0)
  };
}

export function chooseStructureForParticle(index, total) {
  const structures = getCosmicStructures();

  let cursor = 0;
  const t = index / total;

  for (const structure of structures) {
    cursor += structure.particleShare || 0;

    if (t <= cursor) {
      return structure.id;
    }
  }

  return null;
}

export function getStructureById(id) {
  return getCosmicStructures().find((structure) => structure.id === id) || null;
}

export function getMassAnchors() {
  const structures = getCosmicStructures();

  return structures
    .filter((structure) =>
      [
        STRUCTURE_TYPES.STAR,
        STRUCTURE_TYPES.PLANET,
        STRUCTURE_TYPES.MOON,
        STRUCTURE_TYPES.BLACK_HOLE
      ].includes(structure.type)
    )
    .map((structure) => {
      const position = resolveStructurePosition(structure, structures);

      return {
        ...structure,
        x: position.x,
        y: position.y
      };
    });
}

export function getOrbitalTargetForParticle(particle, index = 0) {
  if (!particle.structureId) return null;

  const structures = getCosmicStructures();
  const structure = structures.find((item) => item.id === particle.structureId);

  if (!structure) return null;

  const position = resolveStructurePosition(structure, structures);

  const phase =
    particle.structurePhase ??
    (index * 0.61803398875 + particle.depth * 12.9898) % (Math.PI * 2);

  if (
    structure.type === STRUCTURE_TYPES.STAR ||
    structure.type === STRUCTURE_TYPES.PLANET ||
    structure.type === STRUCTURE_TYPES.MOON
  ) {
    const orbitRadius =
      structure.radius *
      (0.35 + particle.structureBand * 1.25);

    return {
      x: position.x + Math.cos(phase) * orbitRadius,
      y: position.y + Math.sin(phase) * orbitRadius,
      gravity: structure.gravity,
      orbitStrength: structure.orbitStrength,
      type: structure.type
    };
  }

  if (structure.type === STRUCTURE_TYPES.BLACK_HOLE) {
    const orbitRadius =
      structure.radius *
      (0.8 + particle.structureBand * 4.2);

    return {
      x: position.x + Math.cos(phase) * orbitRadius,
      y: position.y + Math.sin(phase) * orbitRadius * 0.72,
      gravity: structure.gravity,
      orbitStrength: structure.orbitStrength,
      type: structure.type
    };
  }

  if (structure.type === STRUCTURE_TYPES.ASTEROID_BELT) {
    const beltRadius =
      structure.innerRadius +
      (structure.outerRadius - structure.innerRadius) *
        particle.structureBand;

    return {
      x: position.x + Math.cos(phase) * beltRadius,
      y: position.y + Math.sin(phase) * beltRadius * 0.48,
      gravity: structure.gravity,
      orbitStrength: structure.orbitStrength,
      type: structure.type
    };
  }

  if (structure.type === STRUCTURE_TYPES.RING_SYSTEM) {
    const parent = structures.find((item) => item.id === structure.parentId);
    if (!parent) return null;

    const parentPosition = resolveStructurePosition(parent, structures);

    const ringRadius =
      structure.innerRadius +
      (structure.outerRadius - structure.innerRadius) *
        particle.structureBand;

    const rawX = Math.cos(phase) * ringRadius;
    const rawY = Math.sin(phase) * ringRadius * 0.24;

    const tilt = structure.tilt || 0;

    const rotatedX = rawX * Math.cos(tilt) - rawY * Math.sin(tilt);
    const rotatedY = rawX * Math.sin(tilt) + rawY * Math.cos(tilt);

    return {
      x: parentPosition.x + rotatedX,
      y: parentPosition.y + rotatedY,
      gravity: structure.gravity,
      orbitStrength: structure.orbitStrength,
      type: structure.type
    };
  }

  return null;
}
import { state } from "./state.js";

export const STRUCTURE_TYPES = {
  STAR: "star",
  PLANET: "planet",
  MOON: "moon",
  ASTEROID_BELT: "asteroid_belt",
  RING_SYSTEM: "ring_system"
};

export function getCosmicStructures() {
  const cx = state.width / 2;
  const cy = state.height / 2;

  const unit = Math.min(state.width, state.height);

  return [
    {
      id: "central-star",
      type: STRUCTURE_TYPES.STAR,
      x: cx,
      y: cy,
      radius: unit * 0.055,
      gravity: 0.032,
      orbitStrength: 0.028,
      particleShare: 0.1
    },

    {
      id: "inner-planet",
      type: STRUCTURE_TYPES.PLANET,
      x: cx + unit * 0.18,
      y: cy - unit * 0.04,
      radius: unit * 0.035,
      gravity: 0.018,
      orbitStrength: 0.018,
      particleShare: 0.08
    },

    {
      id: "outer-planet",
      type: STRUCTURE_TYPES.PLANET,
      x: cx - unit * 0.28,
      y: cy + unit * 0.08,
      radius: unit * 0.052,
      gravity: 0.02,
      orbitStrength: 0.016,
      particleShare: 0.11
    },

    {
      id: "moon",
      type: STRUCTURE_TYPES.MOON,
      parentId: "outer-planet",
      offsetX: unit * 0.085,
      offsetY: -unit * 0.035,
      radius: unit * 0.018,
      gravity: 0.012,
      orbitStrength: 0.014,
      particleShare: 0.04
    },

    {
      id: "asteroid-belt",
      type: STRUCTURE_TYPES.ASTEROID_BELT,
      x: cx,
      y: cy,
      innerRadius: unit * 0.31,
      outerRadius: unit * 0.39,
      gravity: 0.006,
      orbitStrength: 0.018,
      particleShare: 0.22
    },

    {
      id: "ring-system",
      type: STRUCTURE_TYPES.RING_SYSTEM,
      parentId: "outer-planet",
      innerRadius: unit * 0.07,
      outerRadius: unit * 0.115,
      tilt: -0.42,
      gravity: 0.009,
      orbitStrength: 0.02,
      particleShare: 0.14
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
import { state } from "./state.js";

export const STRUCTURE_TYPES = {
  CORE: "core",
  MASS_FIELD: "mass_field",
  ARTIFACT_RING: "artifact_ring"
};

export function getCosmicStructures() {
  const cx = state.width / 2;
  const cy = state.height / 2;
  const unit = Math.min(state.width, state.height);

  return [
    {
      id: "central-mass",
      name: "The Core",
      type: STRUCTURE_TYPES.CORE,
      x: cx,
      y: cy,
      radius: unit * 0.075,
      influenceRadius: unit * 0.42,
      gravity: 0.052,
      orbitStrength: 0.032,
      mass: 2.2,
      glow: 0.35,
      particleShare: 0.18
    },

    {
      id: "inner-artifact-ring",
      name: "Inner Geometry",
      type: STRUCTURE_TYPES.ARTIFACT_RING,
      x: cx,
      y: cy,
      innerRadius: unit * 0.16,
      outerRadius: unit * 0.26,
      gravity: 0.012,
      orbitStrength: 0.018,
      particleShare: 0.24
    },

    {
      id: "outer-artifact-ring",
      name: "Outer Geometry",
      type: STRUCTURE_TYPES.ARTIFACT_RING,
      x: cx,
      y: cy,
      innerRadius: unit * 0.34,
      outerRadius: unit * 0.56,
      gravity: 0.006,
      orbitStrength: 0.011,
      particleShare: 0.32
    },

    {
      id: "deep-field",
      name: "Deep Field",
      type: STRUCTURE_TYPES.MASS_FIELD,
      x: cx,
      y: cy,
      radius: unit * 0.72,
      gravity: 0.0018,
      orbitStrength: 0.003,
      mass: 0.25,
      glow: 0.08,
      particleShare: 0.26
    }
  ];
}

export function resolveStructurePosition(structure) {
  return {
    x: structure.x ?? state.width / 2,
    y: structure.y ?? state.height / 2
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

  return "deep-field";
}

export function getStructureById(id) {
  return getCosmicStructures().find((structure) => structure.id === id) || null;
}

export function getMassAnchors() {
  const structures = getCosmicStructures();

  return structures
    .filter((structure) => structure.type === STRUCTURE_TYPES.CORE)
    .map((structure) => {
      const position = resolveStructurePosition(structure);

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

  const position = resolveStructurePosition(structure);

  const phase =
    particle.structurePhase ??
    (index * 0.61803398875 + particle.depth * 12.9898) % (Math.PI * 2);

  if (structure.type === STRUCTURE_TYPES.CORE) {
    const orbitRadius =
      structure.radius *
      (0.45 + particle.structureBand * 2.2);

    return {
      x: position.x + Math.cos(phase) * orbitRadius,
      y: position.y + Math.sin(phase) * orbitRadius * 0.68,
      gravity: structure.gravity,
      orbitStrength: structure.orbitStrength,
      type: structure.type
    };
  }

  if (structure.type === STRUCTURE_TYPES.ARTIFACT_RING) {
    const ringRadius =
      structure.innerRadius +
      (structure.outerRadius - structure.innerRadius) *
        particle.structureBand;

    return {
      x: position.x + Math.cos(phase) * ringRadius,
      y: position.y + Math.sin(phase) * ringRadius * 0.42,
      gravity: structure.gravity,
      orbitStrength: structure.orbitStrength,
      type: structure.type
    };
  }

  if (structure.type === STRUCTURE_TYPES.MASS_FIELD) {
    const fieldRadius = structure.radius * (0.4 + particle.structureBand * 0.75);

    return {
      x: position.x + Math.cos(phase * 0.52) * fieldRadius,
      y: position.y + Math.sin(phase * 0.52) * fieldRadius * 0.58,
      gravity: structure.gravity,
      orbitStrength: structure.orbitStrength,
      type: structure.type
    };
  }

  return null;
}
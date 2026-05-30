import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { chooseStructureForParticle } from "./cosmicStructures.js";
import {
  assignCoreLayer,
  assignGravityPath,
  GRAVITY_PATHS
} from "./infinityCore.js";

export function getParticleCount() {
  return window.innerWidth < 700
    ? CONFIG.particles.mobileCount
    : CONFIG.particles.desktopCount;
}

function isSmallScreen() {
  return window.innerWidth < 700;
}

function assignParticleRole(index, total) {
  const t = index / total;

  if (t < 0.1) return "core";
  if (t < 0.72) return "structure";
  if (t < 0.86) return "field";
  if (t < 0.96) return "veil";

  return "accent";
}

function assignShapeLane(index, total) {
  const t = index / total;

  if (t < 0.12) return "core";
  if (t < 0.72) return "primary";
  if (t < 0.86) return "secondary";
  if (t < 0.96) return "background";

  return "accent";
}

function getInitialRadius(path, role, lane, maxRadius) {
  if (lane === "core" || role === "core") {
    return maxRadius * (0.02 + Math.random() * 0.07);
  }

  if (lane === "primary") {
    return maxRadius * (0.14 + Math.random() * 0.28);
  }

  if (lane === "secondary") {
    return maxRadius * (0.2 + Math.random() * 0.34);
  }

  if (lane === "background") {
    return maxRadius * (0.34 + Math.random() * 0.44);
  }

  return maxRadius * (0.1 + Math.random() * 0.38);
}

function getRoleSize(role, lane, phone) {
  const phoneScale = phone ? 1.12 : 1;

  if (lane === "primary") return (0.42 + Math.random() * 0.72) * phoneScale;
  if (lane === "secondary") return (0.34 + Math.random() * 0.56) * phoneScale;
  if (lane === "background") return (0.24 + Math.random() * 0.34) * phoneScale;
  if (lane === "accent") return (0.52 + Math.random() * 0.92) * phoneScale;

  if (role === "core") return (0.46 + Math.random() * 0.78) * phoneScale;
  if (role === "structure") return (0.4 + Math.random() * 0.64) * phoneScale;
  if (role === "field") return (0.32 + Math.random() * 0.48) * phoneScale;
  if (role === "veil") return (0.24 + Math.random() * 0.32) * phoneScale;

  return (0.42 + Math.random() * 0.62) * phoneScale;
}

function getRoleDepth(role, lane) {
  if (lane === "primary") return 0.55 + Math.random() * 0.75;
  if (lane === "secondary") return 0.36 + Math.random() * 0.75;
  if (lane === "background") return 0.12 + Math.random() * 0.55;
  if (lane === "accent") return 0.8 + Math.random() * 0.75;

  if (role === "core") return 0.58 + Math.random() * 0.72;
  if (role === "structure") return 0.48 + Math.random() * 0.8;
  if (role === "field") return 0.25 + Math.random() * 0.75;
  if (role === "veil") return 0.12 + Math.random() * 0.6;

  return 0.4 + Math.random() * 0.75;
}

function getRolePull(role, lane) {
  if (lane === "primary") return 0.72 + Math.random() * 0.5;
  if (lane === "secondary") return 0.44 + Math.random() * 0.42;
  if (lane === "background") return 0.12 + Math.random() * 0.24;
  if (lane === "accent") return 0.8 + Math.random() * 0.7;

  if (role === "core") return 0.44 + Math.random() * 0.52;
  if (role === "structure") return 0.58 + Math.random() * 0.52;
  if (role === "field") return 0.22 + Math.random() * 0.42;
  if (role === "veil") return 0.1 + Math.random() * 0.22;

  return 0.34 + Math.random() * 0.5;
}

export function createParticles() {
  state.particles = [];

  const cx = state.width / 2;
  const cy = state.height / 2;

  const maxRadius =
    Math.min(state.width, state.height) *
    CONFIG.particles.galaxyRadiusFactor;

  const particleCount = getParticleCount();
  const phone = isSmallScreen();

  for (let i = 0; i < particleCount; i++) {
    const gravityPath = assignGravityPath(i, particleCount);
    const role = assignParticleRole(i, particleCount);
    const shapeLane = assignShapeLane(i, particleCount);

    const angle = Math.random() * Math.PI * 2;
    const radius = getInitialRadius(gravityPath, role, shapeLane, maxRadius);

    const x = cx + Math.cos(angle) * radius;
    const y =
      cy +
      Math.sin(angle) *
        radius *
        CONFIG.particles.verticalCompression;

    const tangent = angle + Math.PI / 2;

    const laneSpeed =
      shapeLane === "primary"
        ? 0.13
        : shapeLane === "accent"
          ? 0.2
          : shapeLane === "background"
            ? 0.055
            : 0.1;

    const speed =
      0.014 +
      Math.random() *
        (phone ? laneSpeed * 0.68 : laneSpeed);

    state.particles.push({
      x,
      y,

      vx: Math.cos(tangent) * speed,
      vy: Math.sin(tangent) * speed,

      size: getRoleSize(role, shapeLane, phone),
      depth: getRoleDepth(role, shapeLane),

      role,
      shapeLane,

      spark: shapeLane === "accent" ? Math.random() > 0.86 : Math.random() > 0.998,
      pulse: Math.random() * Math.PI * 2,

      structureId: chooseStructureForParticle(i, particleCount),
      structureBand: Math.random(),
      structurePhase: Math.random() * Math.PI * 2,
      structurePull: getRolePull(role, shapeLane),

      layer: assignCoreLayer(i, particleCount),
      layerPhase: Math.random() * Math.PI * 2,
      layerBand: Math.random(),
      layerPull: getRolePull(role, shapeLane),

      gravityPath,
      pathPhase: Math.random() * Math.PI * 2,
      pathBand: Math.random(),
      pathBias: Math.random()
    });
  }
}

export function respawnParticleNearCore(particle) {
  const cx = state.width / 2;
  const cy = state.height / 2;

  const angle = Math.random() * Math.PI * 2;

  let maxRespawnRadius = Math.min(state.width, state.height) * 0.22;

  if (particle.shapeLane === "background") {
    maxRespawnRadius = Math.min(state.width, state.height) * 0.46;
  }

  if (particle.shapeLane === "secondary") {
    maxRespawnRadius = Math.min(state.width, state.height) * 0.32;
  }

  if (particle.shapeLane === "core") {
    maxRespawnRadius = Math.min(state.width, state.height) * 0.1;
  }

  const radius = Math.random() * maxRespawnRadius;

  particle.x = cx + Math.cos(angle) * radius;
  particle.y =
    cy +
    Math.sin(angle) *
      radius *
      CONFIG.particles.verticalCompression;

  particle.vx *= -0.05;
  particle.vy *= -0.05;
}
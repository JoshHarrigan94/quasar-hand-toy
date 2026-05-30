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

function getInitialRadius(path, maxRadius) {
  if (path === GRAVITY_PATHS.WELL) {
    return maxRadius * (0.035 + Math.random() * 0.105);
  }

  if (path === GRAVITY_PATHS.TORUS) {
    return maxRadius * (0.16 + Math.random() * 0.18);
  }

  if (path === GRAVITY_PATHS.INFINITY) {
    return maxRadius * (0.12 + Math.random() * 0.23);
  }

  if (path === GRAVITY_PATHS.SINE) {
    return maxRadius * (0.17 + Math.random() * 0.3);
  }

  if (path === GRAVITY_PATHS.PARABOLA) {
    return maxRadius * (0.18 + Math.random() * 0.34);
  }

  return maxRadius * (0.34 + Math.random() * 0.42);
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
    const angle = Math.random() * Math.PI * 2;
    const radius = getInitialRadius(gravityPath, maxRadius);

    const x = cx + Math.cos(angle) * radius;
    const y =
      cy +
      Math.sin(angle) *
        radius *
        CONFIG.particles.verticalCompression;

    const tangent = angle + Math.PI / 2;
    const speed = 0.025 + Math.random() * (phone ? 0.24 : 0.32);

    state.particles.push({
      x,
      y,

      vx: Math.cos(tangent) * speed,
      vy: Math.sin(tangent) * speed,

      size: phone
        ? 0.5 + Math.random() * 1.18
        : 0.38 + Math.random() * 0.96,

      depth: 0.22 + Math.random() * 1,

      spark: Math.random() > 0.996,
      pulse: Math.random() * Math.PI * 2,

      structureId: chooseStructureForParticle(i, particleCount),
      structureBand: Math.random(),
      structurePhase: Math.random() * Math.PI * 2,
      structurePull: 0.16 + Math.random() * 0.42,

      layer: assignCoreLayer(i, particleCount),
      layerPhase: Math.random() * Math.PI * 2,
      layerBand: Math.random(),
      layerPull: 0.22 + Math.random() * 0.48,

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

  const maxRespawnRadius =
    particle.gravityPath === GRAVITY_PATHS.DEEP_FIELD
      ? Math.min(state.width, state.height) * 0.46
      : Math.min(state.width, state.height) * 0.22;

  const radius = Math.random() * maxRespawnRadius;

  particle.x = cx + Math.cos(angle) * radius;
  particle.y =
    cy +
    Math.sin(angle) *
      radius *
      CONFIG.particles.verticalCompression;

  particle.vx *= -0.08;
  particle.vy *= -0.08;
}
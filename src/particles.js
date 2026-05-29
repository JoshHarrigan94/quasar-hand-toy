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

function getInitialRadius(path, maxRadius) {
  if (path === GRAVITY_PATHS.WELL) return maxRadius * (0.04 + Math.random() * 0.13);
  if (path === GRAVITY_PATHS.TORUS) return maxRadius * (0.18 + Math.random() * 0.22);
  if (path === GRAVITY_PATHS.INFINITY) return maxRadius * (0.12 + Math.random() * 0.28);
  if (path === GRAVITY_PATHS.SINE) return maxRadius * (0.18 + Math.random() * 0.38);
  if (path === GRAVITY_PATHS.PARABOLA) return maxRadius * (0.22 + Math.random() * 0.42);

  return maxRadius * (0.44 + Math.random() * 0.52);
}

export function createParticles() {
  state.particles = [];

  const cx = state.width / 2;
  const cy = state.height / 2;

  const maxRadius =
    Math.min(state.width, state.height) *
    CONFIG.particles.galaxyRadiusFactor;

  const particleCount = getParticleCount();

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
    const speed = 0.035 + Math.random() * 0.38;

    state.particles.push({
      x,
      y,

      vx: Math.cos(tangent) * speed,
      vy: Math.sin(tangent) * speed,

      size: 0.34 + Math.random() * 0.92,
      depth: 0.18 + Math.random() * 1,

      spark: Math.random() > 0.995,
      pulse: Math.random() * Math.PI * 2,

      structureId: chooseStructureForParticle(i, particleCount),
      structureBand: Math.random(),
      structurePhase: Math.random() * Math.PI * 2,
      structurePull: 0.16 + Math.random() * 0.44,

      layer: assignCoreLayer(i, particleCount),
      layerPhase: Math.random() * Math.PI * 2,
      layerBand: Math.random(),
      layerPull: 0.22 + Math.random() * 0.52,

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

  const radius =
    particle.gravityPath === GRAVITY_PATHS.DEEP_FIELD
      ? Math.random() * Math.min(state.width, state.height) * 0.72
      : Math.random() * Math.min(state.width, state.height) * 0.18;

  particle.x = cx + Math.cos(angle) * radius;
  particle.y =
    cy +
    Math.sin(angle) *
      radius *
      CONFIG.particles.verticalCompression;

  particle.vx *= -0.12;
  particle.vy *= -0.12;
}
import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { chooseStructureForParticle } from "./cosmicStructures.js";
import {
  assignCoreLayer,
  assignGravityPath
} from "./infinityCore.js";

export function getParticleCount() {
  return window.innerWidth < 700
    ? CONFIG.particles.mobileCount
    : CONFIG.particles.desktopCount;
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
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.pow(Math.random(), 0.56) * maxRadius;

    const x = cx + Math.cos(angle) * radius;
    const y =
      cy +
      Math.sin(angle) *
        radius *
        CONFIG.particles.verticalCompression;

    const tangent = angle + Math.PI / 2;
    const speed = 0.08 + Math.random() * 0.75;

    state.particles.push({
      x,
      y,

      vx: Math.cos(tangent) * speed,
      vy: Math.sin(tangent) * speed,

      size: 0.38 + Math.random() * 1.12,
      depth: 0.22 + Math.random() * 1,

      spark: Math.random() > 0.992,
      pulse: Math.random() * Math.PI * 2,

      structureId: chooseStructureForParticle(i, particleCount),
      structureBand: Math.random(),
      structurePhase: Math.random() * Math.PI * 2,
      structurePull: 0.2 + Math.random() * 0.52,

      layer: assignCoreLayer(i, particleCount),
      layerPhase: Math.random() * Math.PI * 2,
      layerBand: Math.random(),
      layerPull: 0.26 + Math.random() * 0.62,

      gravityPath: assignGravityPath(i, particleCount),
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
  const radius = Math.random() * Math.min(state.width, state.height) * 0.16;

  particle.x = cx + Math.cos(angle) * radius;
  particle.y = cy + Math.sin(angle) * radius;

  particle.vx *= -0.18;
  particle.vy *= -0.18;
}
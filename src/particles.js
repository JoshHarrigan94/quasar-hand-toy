import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { chooseStructureForParticle } from "./cosmicStructures.js";
import { assignCoreLayer } from "./infinityCore.js";

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
    const radius = Math.pow(Math.random(), 0.52) * maxRadius;

    const x = cx + Math.cos(angle) * radius;
    const y =
      cy +
      Math.sin(angle) *
        radius *
        CONFIG.particles.verticalCompression;

    const tangent = angle + Math.PI / 2;
    const speed = 0.18 + Math.random() * 1.25;

    state.particles.push({
      x,
      y,

      vx: Math.cos(tangent) * speed,
      vy: Math.sin(tangent) * speed,

      size: 0.45 + Math.random() * 1.35,
      depth: 0.25 + Math.random() * 1,

      spark: Math.random() > 0.988,
      pulse: Math.random() * Math.PI * 2,

      structureId: chooseStructureForParticle(i, particleCount),
      structureBand: Math.random(),
      structurePhase: Math.random() * Math.PI * 2,
      structurePull: 0.28 + Math.random() * 0.62,

      layer: assignCoreLayer(i, particleCount),
      layerPhase: Math.random() * Math.PI * 2,
      layerBand: Math.random(),
      layerPull: 0.35 + Math.random() * 0.75
    });
  }
}

export function respawnParticleNearCore(particle) {
  const cx = state.width / 2;
  const cy = state.height / 2;

  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * Math.min(state.width, state.height) * 0.13;

  particle.x = cx + Math.cos(angle) * radius;
  particle.y = cy + Math.sin(angle) * radius;

  particle.vx *= -0.25;
  particle.vy *= -0.25;
}
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

  if (t < 0.12) return "core";
  if (t < 0.42) return "structure";
  if (t < 0.74) return "field";
  if (t < 0.94) return "veil";

  return "accent";
}

function getInitialRadius(path, role, maxRadius) {
  if (role === "core") {
    return maxRadius * (0.025 + Math.random() * 0.08);
  }

  if (role === "structure") {
    if (path === GRAVITY_PATHS.WELL) return maxRadius * (0.04 + Math.random() * 0.1);
    if (path === GRAVITY_PATHS.TORUS) return maxRadius * (0.18 + Math.random() * 0.18);
    if (path === GRAVITY_PATHS.INFINITY) return maxRadius * (0.14 + Math.random() * 0.2);
    if (path === GRAVITY_PATHS.SINE) return maxRadius * (0.18 + Math.random() * 0.26);
    if (path === GRAVITY_PATHS.PARABOLA) return maxRadius * (0.18 + Math.random() * 0.28);

    return maxRadius * (0.22 + Math.random() * 0.3);
  }

  if (role === "field") {
    return maxRadius * (0.16 + Math.random() * 0.38);
  }

  if (role === "veil") {
    return maxRadius * (0.28 + Math.random() * 0.46);
  }

  return maxRadius * (0.1 + Math.random() * 0.42);
}

function getRoleSize(role, phone) {
  if (role === "core") return phone ? 0.54 + Math.random() * 0.9 : 0.42 + Math.random() * 0.72;
  if (role === "structure") return phone ? 0.48 + Math.random() * 0.82 : 0.38 + Math.random() * 0.66;
  if (role === "field") return phone ? 0.42 + Math.random() * 0.68 : 0.32 + Math.random() * 0.54;
  if (role === "veil") return phone ? 0.34 + Math.random() * 0.48 : 0.26 + Math.random() * 0.38;

  return phone ? 0.58 + Math.random() * 1.05 : 0.46 + Math.random() * 0.86;
}

function getRoleDepth(role) {
  if (role === "core") return 0.55 + Math.random() * 0.75;
  if (role === "structure") return 0.42 + Math.random() * 0.85;
  if (role === "field") return 0.25 + Math.random() * 0.85;
  if (role === "veil") return 0.14 + Math.random() * 0.65;

  return 0.75 + Math.random() * 0.85;
}

function getRolePull(role) {
  if (role === "core") return 0.34 + Math.random() * 0.52;
  if (role === "structure") return 0.42 + Math.random() * 0.62;
  if (role === "field") return 0.22 + Math.random() * 0.46;
  if (role === "veil") return 0.12 + Math.random() * 0.28;

  return 0.5 + Math.random() * 0.7;
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

    const angle = Math.random() * Math.PI * 2;
    const radius = getInitialRadius(gravityPath, role, maxRadius);

    const x = cx + Math.cos(angle) * radius;
    const y =
      cy +
      Math.sin(angle) *
        radius *
        CONFIG.particles.verticalCompression;

    const tangent = angle + Math.PI / 2;

    const roleSpeed =
      role === "structure"
        ? 0.18
        : role === "accent"
          ? 0.22
          : role === "veil"
            ? 0.08
            : 0.14;

    const speed =
      0.018 +
      Math.random() *
        (phone ? roleSpeed * 0.72 : roleSpeed);

    state.particles.push({
      x,
      y,

      vx: Math.cos(tangent) * speed,
      vy: Math.sin(tangent) * speed,

      size: getRoleSize(role, phone),
      depth: getRoleDepth(role),

      role,

      spark: role === "accent" ? Math.random() > 0.92 : Math.random() > 0.997,
      pulse: Math.random() * Math.PI * 2,

      structureId: chooseStructureForParticle(i, particleCount),
      structureBand: Math.random(),
      structurePhase: Math.random() * Math.PI * 2,
      structurePull: getRolePull(role),

      layer: assignCoreLayer(i, particleCount),
      layerPhase: Math.random() * Math.PI * 2,
      layerBand: Math.random(),
      layerPull: getRolePull(role),

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

  let maxRespawnRadius = Math.min(state.width, state.height) * 0.24;

  if (particle.role === "veil") {
    maxRespawnRadius = Math.min(state.width, state.height) * 0.46;
  }

  if (particle.role === "field") {
    maxRespawnRadius = Math.min(state.width, state.height) * 0.34;
  }

  if (particle.role === "core") {
    maxRespawnRadius = Math.min(state.width, state.height) * 0.12;
  }

  const radius = Math.random() * maxRespawnRadius;

  particle.x = cx + Math.cos(angle) * radius;
  particle.y =
    cy +
    Math.sin(angle) *
      radius *
      CONFIG.particles.verticalCompression;

  particle.vx *= -0.06;
  particle.vy *= -0.06;
}
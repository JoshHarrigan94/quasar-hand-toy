import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { respawnParticleNearCore } from "./particles.js";
import {
  getOrbitalTargetForParticle,
  getMassAnchors,
  STRUCTURE_TYPES
} from "./cosmicStructures.js";
import { getInfinityCoreTarget } from "./infinityCore.js";

export function pulseAt(x, y, strength = 1) {
  state.shockwaves.push({
    x,
    y,
    radius: 8,
    alpha: 0.55 * strength,
    speed: 9 + strength * 8,
    type: "pulse"
  });
}

export function gravityWaveAt(x, y, strength = 1) {
  state.shockwaves.push({
    x,
    y,
    radius: 12,
    alpha: 0.72 * strength,
    speed: 15 + strength * 10,
    type: "gravity-wave"
  });

  for (const particle of state.particles) {
    const dx = particle.x - x;
    const dy = particle.y - y;
    const dist = Math.hypot(dx, dy) || 1;

    const waveRadius = Math.min(state.width, state.height) * 0.42;
    if (dist > waveRadius) continue;

    const influence = 1 - dist / waveRadius;
    const nx = dx / dist;
    const ny = dy / dist;
    const tx = -ny;
    const ty = nx;

    particle.vx += nx * influence * strength * 3.2 * particle.depth;
    particle.vy += ny * influence * strength * 3.2 * particle.depth;

    particle.vx += tx * influence * strength * 1.8;
    particle.vy += ty * influence * strength * 1.8;
  }
}

export function spendEnergy(amount) {
  state.energy = Math.max(0, state.energy - amount);
}

export function recoverEnergy() {
  const rate =
    state.mode === "calm"
      ? CONFIG.energy.calmRecoveryRate
      : CONFIG.energy.normalRecoveryRate;

  state.energy = Math.min(CONFIG.energy.max, state.energy + rate);
}

export function explode(x = state.width / 2, y = state.height / 2, power = 14) {
  if (state.energy < CONFIG.energy.explodeCost) return;

  spendEnergy(CONFIG.energy.explodeCost);
  gravityWaveAt(x, y, 1.05);

  for (const particle of state.particles) {
    const dx = particle.x - x;
    const dy = particle.y - y;
    const dist = Math.hypot(dx, dy) || 1;
    const force = Math.min(power, 900 / dist);

    particle.vx += (dx / dist) * force * (0.55 + particle.depth);
    particle.vy += (dy / dist) * force * (0.55 + particle.depth);
  }
}

export function implode(x = state.width / 2, y = state.height / 2, power = 12) {
  if (state.energy < CONFIG.energy.implodeCost) return;

  spendEnergy(CONFIG.energy.implodeCost);
  pulseAt(x, y, 0.9);

  for (const particle of state.particles) {
    const dx = x - particle.x;
    const dy = y - particle.y;
    const dist = Math.hypot(dx, dy) || 1;
    const force = Math.min(power, 780 / dist);

    particle.vx += (dx / dist) * force * (0.42 + particle.depth);
    particle.vy += (dy / dist) * force * (0.42 + particle.depth);
  }
}

export function fling() {
  const pointer = state.pointer;
  const speed = Math.hypot(pointer.vx, pointer.vy);

  if (speed < 12 || state.energy < CONFIG.energy.flingCost) return;

  spendEnergy(CONFIG.energy.flingCost);
  gravityWaveAt(pointer.x, pointer.y, Math.min(1.4, speed / 34));

  for (const particle of state.particles) {
    const dx = pointer.x - particle.x;
    const dy = pointer.y - particle.y;
    const dist = Math.hypot(dx, dy) || 1;

    if (dist < CONFIG.physics.flingRadius) {
      const influence = 1 - dist / CONFIG.physics.flingRadius;

      particle.vx += pointer.vx * 0.042 * influence;
      particle.vy += pointer.vy * 0.042 * influence;
    }
  }
}

export function spawnComet() {
  if (Math.random() > CONFIG.visuals.cometSpawnChance * 0.45) return;

  const fromLeft = Math.random() > 0.5;

  state.comets.push({
    x: fromLeft ? -60 : state.width + 60,
    y: Math.random() * state.height * 0.7,
    vx: fromLeft ? 4 + Math.random() * 4 : -4 - Math.random() * 4,
    vy: 0.6 + Math.random() * 1.4,
    life: 1,
    hueOffset: Math.random() * 80
  });
}

function applyCoreGalaxyPhysics(particle) {
  const cx = state.width / 2;
  const cy = state.height / 2;

  const dx = cx - particle.x;
  const dy = cy - particle.y;
  const dist = Math.hypot(dx, dy) || 1;

  const nx = dx / dist;
  const ny = dy / dist;

  const tx = -ny;
  const ty = nx;

  particle.vx += nx * CONFIG.physics.coreGravity * dist * particle.depth * 0.55;
  particle.vy += ny * CONFIG.physics.coreGravity * dist * particle.depth * 0.55;

  particle.vx += tx * CONFIG.physics.orbitStrength * particle.depth * 0.72;
  particle.vy += ty * CONFIG.physics.orbitStrength * particle.depth * 0.72;
}

function applyInfinityCorePhysics(particle, index) {
  const target = getInfinityCoreTarget(particle, index);
  if (!target) return;

  const dx = target.x - particle.x;
  const dy = target.y - particle.y;
  const dist = Math.hypot(dx, dy) || 1;

  const nx = dx / dist;
  const ny = dy / dist;

  const tx = -ny;
  const ty = nx;

  const pull = target.pull * particle.layerPull * particle.depth;

  particle.vx += nx * pull;
  particle.vy += ny * pull;

  particle.vx += tx * target.orbit * particle.depth;
  particle.vy += ty * target.orbit * particle.depth;

  particle.vx *= target.drag;
  particle.vy *= target.drag;
}

function applyStructurePhysics(particle, index) {
  const target = getOrbitalTargetForParticle(particle, index);
  if (!target) return;

  const dx = target.x - particle.x;
  const dy = target.y - particle.y;
  const dist = Math.hypot(dx, dy) || 1;

  const nx = dx / dist;
  const ny = dy / dist;

  const tx = -ny;
  const ty = nx;

  const pull = target.gravity * particle.structurePull * particle.depth * 0.22;

  particle.vx += nx * pull;
  particle.vy += ny * pull;

  particle.vx += tx * target.orbitStrength * particle.depth * 0.14;
  particle.vy += ty * target.orbitStrength * particle.depth * 0.14;
}

function applyMassAnchorPhysics(particle) {
  const anchors = getMassAnchors();

  for (const anchor of anchors) {
    const dx = anchor.x - particle.x;
    const dy = anchor.y - particle.y;
    const dist = Math.hypot(dx, dy) || 1;

    const influenceRadius =
      anchor.influenceRadius ||
      anchor.radius * (anchor.type === STRUCTURE_TYPES.STAR ? 8 : 5);

    if (dist > influenceRadius) continue;

    const influence = 1 - dist / influenceRadius;

    const nx = dx / dist;
    const ny = dy / dist;

    const tx = -ny;
    const ty = nx;

    const massPull =
      influence *
      influence *
      anchor.mass *
      0.005 *
      particle.depth;

    particle.vx += nx * massPull;
    particle.vy += ny * massPull;

    particle.vx += tx * anchor.orbitStrength * influence * 0.18;
    particle.vy += ty * anchor.orbitStrength * influence * 0.18;

    if (anchor.type === STRUCTURE_TYPES.BLACK_HOLE && dist < anchor.radius * 1.6) {
      particle.vx *= 0.7;
      particle.vy *= 0.7;
      particle.x += nx * 1.2;
      particle.y += ny * 1.2;
    }
  }
}

function applyPointerPhysics(particle) {
  const pointer = state.pointer;

  if (!pointer.active) return;

  const pdx = pointer.x - particle.x;
  const pdy = pointer.y - particle.y;
  const pdist = Math.hypot(pdx, pdy) || 1;

  if (pdist > CONFIG.physics.pointerRadius) return;

  const influence = 1 - pdist / CONFIG.physics.pointerRadius;
  const energyScale = 0.45 + state.energy / CONFIG.energy.max;

  const force =
    influence *
    (pointer.down ? 1.55 : 0.78) *
    particle.depth *
    energyScale;

  const px = pdx / pdist;
  const py = pdy / pdist;

  if (state.mode === "pull") {
    particle.vx += px * force * 1.05;
    particle.vy += py * force * 1.05;
  }

  if (state.mode === "push") {
    particle.vx -= px * force * 1.32;
    particle.vy -= py * force * 1.32;
  }

  if (state.mode === "spin") {
    particle.vx += -py * force * 1.8;
    particle.vy += px * force * 1.8;
  }

  if (state.mode === "storm") {
    particle.vx += -py * force * 1.1;
    particle.vy += px * force * 1.1;
    particle.vx -= px * force * 0.9;
    particle.vy -= py * force * 0.9;
  }

  if (state.mode === "calm") {
    particle.vx *= 0.925;
    particle.vy *= 0.925;
  }
}

export function updateParticlePhysics(particle, index) {
  applyCoreGalaxyPhysics(particle);
  applyInfinityCorePhysics(particle, index);
  applyStructurePhysics(particle, index);
  applyMassAnchorPhysics(particle);
  applyPointerPhysics(particle);

  particle.pulse += 0.025;

  particle.vx *= CONFIG.physics.drag;
  particle.vy *= CONFIG.physics.drag;

  particle.x += particle.vx;
  particle.y += particle.vy;

  const padding = CONFIG.particles.respawnPadding;

  if (
    particle.x < -padding ||
    particle.x > state.width + padding ||
    particle.y < -padding ||
    particle.y > state.height + padding
  ) {
    respawnParticleNearCore(particle);
  }
}

export function updatePhysics() {
  recoverEnergy();
  spawnComet();

  state.particles.forEach((particle, index) => {
    updateParticlePhysics(particle, index);
  });

  state.pointer.vx *= 0.88;
  state.pointer.vy *= 0.88;
}
import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { respawnParticleNearCore } from "./particles.js";

export function pulseAt(x, y, strength = 1) {
  state.shockwaves.push({
    x,
    y,
    radius: 8,
    alpha: 0.55 * strength,
    speed: 9 + strength * 8
  });
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

export function explode(x = state.width / 2, y = state.height / 2, power = 16) {
  if (state.energy < CONFIG.energy.explodeCost) return;

  spendEnergy(CONFIG.energy.explodeCost);
  pulseAt(x, y, 1.4);

  for (const particle of state.particles) {
    const dx = particle.x - x;
    const dy = particle.y - y;

    const dist = Math.hypot(dx, dy) || 1;
    const force = Math.min(power, 1100 / dist);

    particle.vx += (dx / dist) * force * (0.7 + particle.depth);
    particle.vy += (dy / dist) * force * (0.7 + particle.depth);
  }
}

export function implode(x = state.width / 2, y = state.height / 2, power = 11) {
  if (state.energy < CONFIG.energy.implodeCost) return;

  spendEnergy(CONFIG.energy.implodeCost);
  pulseAt(x, y, 1);

  for (const particle of state.particles) {
    const dx = x - particle.x;
    const dy = y - particle.y;

    const dist = Math.hypot(dx, dy) || 1;
    const force = Math.min(power, 850 / dist);

    particle.vx += (dx / dist) * force * (0.5 + particle.depth);
    particle.vy += (dy / dist) * force * (0.5 + particle.depth);
  }
}

export function fling() {
  const pointer = state.pointer;
  const speed = Math.hypot(pointer.vx, pointer.vy);

  if (speed < 12 || state.energy < CONFIG.energy.flingCost) return;

  spendEnergy(CONFIG.energy.flingCost);
  pulseAt(pointer.x, pointer.y, 1);

  for (const particle of state.particles) {
    const dx = pointer.x - particle.x;
    const dy = pointer.y - particle.y;

    const dist = Math.hypot(dx, dy) || 1;

    if (dist < CONFIG.physics.flingRadius) {
      const influence = 1 - dist / CONFIG.physics.flingRadius;

      particle.vx += pointer.vx * 0.05 * influence;
      particle.vy += pointer.vy * 0.05 * influence;
    }
  }
}

export function spawnComet() {
  if (Math.random() > CONFIG.visuals.cometSpawnChance) return;

  const fromLeft = Math.random() > 0.5;

  state.comets.push({
    x: fromLeft ? -60 : state.width + 60,
    y: Math.random() * state.height * 0.7,

    vx: fromLeft
      ? 7 + Math.random() * 5
      : -7 - Math.random() * 5,

    vy: 1 + Math.random() * 2,

    life: 1,
    hueOffset: Math.random() * 80
  });
}

export function updateParticlePhysics(particle) {
  const cx = state.width / 2;
  const cy = state.height / 2;

  const dx = cx - particle.x;
  const dy = cy - particle.y;

  const dist = Math.hypot(dx, dy) || 1;

  const nx = dx / dist;
  const ny = dy / dist;

  const tx = -ny;
  const ty = nx;

  particle.vx +=
    nx *
    CONFIG.physics.coreGravity *
    dist *
    particle.depth;

  particle.vy +=
    ny *
    CONFIG.physics.coreGravity *
    dist *
    particle.depth;

  particle.vx +=
    tx *
    CONFIG.physics.orbitStrength *
    particle.depth;

  particle.vy +=
    ty *
    CONFIG.physics.orbitStrength *
    particle.depth;

  applyPointerPhysics(particle);

  particle.pulse += 0.04;

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

export function updatePhysics() {
  recoverEnergy();
  spawnComet();

  for (const particle of state.particles) {
    updateParticlePhysics(particle);
  }

  state.pointer.vx *= 0.88;
  state.pointer.vy *= 0.88;
}

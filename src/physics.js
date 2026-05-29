import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { respawnParticleNearCore } from "./particles.js";
import {
  getOrbitalTargetForParticle,
  getMassAnchors,
  STRUCTURE_TYPES
} from "./cosmicStructures.js";
import { getInfinityCoreTarget } from "./infinityCore.js";

export function wakeArtifact({
  awake = 0.08,
  disturbance = 0.08,
  pressure = 0,
  openness = 0
} = {}) {
  state.artifact.awakeLevel = Math.min(
    1,
    state.artifact.awakeLevel + awake
  );

  state.artifact.disturbance = Math.min(
    1,
    state.artifact.disturbance + disturbance
  );

  state.artifact.pressure = Math.max(
    -1,
    Math.min(1, state.artifact.pressure + pressure)
  );

  state.artifact.openness = Math.max(
    -1,
    Math.min(1, state.artifact.openness + openness)
  );

  state.artifact.pulse = Math.min(1, state.artifact.pulse + 0.35);
  state.artifact.lastInteractionAt = Date.now();
}

export function updateArtifactState() {
  state.artifact.pulse *= CONFIG.artifact.pulseDecay;
state.artifact.disturbance *= CONFIG.artifact.disturbanceDecay;
state.artifact.pressure *= CONFIG.artifact.pressureDecay;
state.artifact.openness *= CONFIG.artifact.opennessDecay;

const timeSinceInteraction = Date.now() - state.artifact.lastInteractionAt;

if (timeSinceInteraction > CONFIG.artifact.sleepDelayMs) {
  state.artifact.awakeLevel *= CONFIG.artifact.awakeDecay;
}

if (state.mode === "calm") {
  state.artifact.disturbance *= CONFIG.artifact.calmDecayMultiplier;
  state.artifact.pressure *= CONFIG.artifact.calmDecayMultiplier;
  state.artifact.openness *= CONFIG.artifact.opennessDecay;
}

  if (state.artifact.disturbance > 0.72) {
    state.artifact.stateLabel = "Unstable";
  } else if (state.artifact.pressure > 0.45) {
    state.artifact.stateLabel = "Compressed";
  } else if (state.artifact.openness > 0.45) {
    state.artifact.stateLabel = "Expanded";
  } else if (state.artifact.awakeLevel > 0.55) {
    state.artifact.stateLabel = "Awake";
  } else if (state.artifact.awakeLevel > 0.18) {
    state.artifact.stateLabel = "Listening";
  } else {
    state.artifact.stateLabel = "Dormant";
  }
}

export function pulseAt(x, y, strength = 1) {
  state.shockwaves.push({
    x,
    y,
    radius: 8,
    alpha: 0.55 * strength,
    speed: 9 + strength * 8,
    type: "pulse"
  });

  wakeArtifact({
    awake: 0.04 * strength,
    disturbance: 0.025 * strength
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

  wakeArtifact({
    awake: 0.12 * strength,
    disturbance: 0.18 * strength,
    pressure: 0.04 * strength
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

  wakeArtifact({
    awake: 0.1,
    disturbance: 0.08,
    pressure: 0.22,
    openness: -0.08
  });

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

  const waveStrength = Math.min(1.4, speed / 34);

  gravityWaveAt(pointer.x, pointer.y, waveStrength);

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

  const awakeBoost = 1 + state.artifact.awakeLevel * 0.45;
  const disturbanceDrag = 1 - state.artifact.disturbance * 0.012;

  particle.vx += nx * CONFIG.physics.coreGravity * dist * particle.depth * 0.55 * awakeBoost;
  particle.vy += ny * CONFIG.physics.coreGravity * dist * particle.depth * 0.55 * awakeBoost;

  particle.vx += tx * CONFIG.physics.orbitStrength * particle.depth * 0.72 * awakeBoost;
  particle.vy += ty * CONFIG.physics.orbitStrength * particle.depth * 0.72 * awakeBoost;

  particle.vx *= disturbanceDrag;
  particle.vy *= disturbanceDrag;
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

  const pressureBoost =
    1 +
    Math.max(0, state.artifact.pressure) * 0.4 -
    Math.max(0, state.artifact.openness) * 0.18;

  const opennessBoost =
    1 +
    Math.max(0, state.artifact.openness) * 0.3;

  const pull =
    target.pull *
    particle.layerPull *
    particle.depth *
    pressureBoost;

  particle.vx += nx * pull;
  particle.vy += ny * pull;

  particle.vx += tx * target.orbit * particle.depth * opennessBoost;
  particle.vy += ty * target.orbit * particle.depth * opennessBoost;

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
    wakeArtifact({
      awake: 0.0008,
      disturbance: 0.0004,
      pressure: 0.0009,
      openness: -0.0002
    });

    particle.vx += px * force * 1.05;
    particle.vy += py * force * 1.05;
  }

  if (state.mode === "push") {
    wakeArtifact({
      awake: 0.0007,
      disturbance: 0.00035,
      pressure: -0.00015,
      openness: 0.0008
    });

    particle.vx -= px * force * 1.32;
    particle.vy -= py * force * 1.32;
  }

  if (state.mode === "spin") {
    wakeArtifact({
      awake: 0.0007,
      disturbance: 0.00045,
      openness: 0.0002
    });

    particle.vx += -py * force * 1.8;
    particle.vy += px * force * 1.8;
  }

  if (state.mode === "storm") {
    wakeArtifact({
      awake: 0.001,
      disturbance: 0.0011,
      pressure: 0.00025
    });

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

  particle.pulse += 0.025 + state.artifact.awakeLevel * 0.018;

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
  updateArtifactState();
  spawnComet();

  state.particles.forEach((particle, index) => {
    updateParticlePhysics(particle, index);
  });

  state.pointer.vx *= 0.88;
  state.pointer.vy *= 0.88;
}
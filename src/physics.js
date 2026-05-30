import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { respawnParticleNearCore } from "./particles.js";
import {
  getOrbitalTargetForParticle,
  getMassAnchors
} from "./cosmicStructures.js";
import { getInfinityCoreTarget } from "./infinityCore.js";

function getScenePhysics() {
  const scene = state.scene?.current || "dormant";

  if (scene === "saturn") {
    return {
      pull: 1.28,
      orbit: 0.92,
      stillnessGain: 1,
      disturbance: 0.78,
      pointer: 0.9
    };
  }

  if (scene === "cube") {
    return {
      pull: 1.34,
      orbit: 0.72,
      stillnessGain: 1.15,
      disturbance: 0.68,
      pointer: 0.82
    };
  }

  if (scene === "wave") {
    return {
      pull: 0.92,
      orbit: 1.04,
      stillnessGain: 1.2,
      disturbance: 0.78,
      pointer: 0.86
    };
  }

  if (scene === "reveal") {
    return {
      pull: 1.16,
      orbit: 1.08,
      stillnessGain: 1.45,
      disturbance: 0.82,
      pointer: 0.9
    };
  }

  if (scene === "disturbed") {
    return {
      pull: 0.84,
      orbit: 1.34,
      stillnessGain: 0.72,
      disturbance: 1.35,
      pointer: 1.1
    };
  }

  return {
    pull: 1,
    orbit: 0.92,
    stillnessGain: 1,
    disturbance: 0.72,
    pointer: 1
  };
}

function getGravityModePhysics() {
  const mode = state.gravityMode || "calm";

  if (mode === "fragile") {
    return {
      pull: 0.72,
      orbit: 1.08,
      pointer: 1.22,
      wave: 1.18,
      drag: 0.998
    };
  }

  if (mode === "dense") {
    return {
      pull: 1.34,
      orbit: 0.72,
      pointer: 0.72,
      wave: 0.68,
      drag: 0.992
    };
  }

  return {
    pull: 1,
    orbit: 1,
    pointer: 1,
    wave: 1,
    drag: 1
  };
}

function getRolePhysics(particle) {
  if (particle.role === "core") {
    return { pull: 1.18, orbit: 0.78, pointer: 0.72 };
  }

  if (particle.role === "structure") {
    return { pull: 1.34, orbit: 0.92, pointer: 0.9 };
  }

  if (particle.role === "field") {
    return { pull: 1, orbit: 1, pointer: 1 };
  }

  if (particle.role === "veil") {
    return { pull: 0.72, orbit: 1.12, pointer: 1.08 };
  }

  if (particle.role === "accent") {
    return { pull: 1.42, orbit: 1.18, pointer: 1.16 };
  }

  return { pull: 1, orbit: 1, pointer: 1 };
}

export function markInteraction() {
  state.presence.lastInteractionAt = Date.now();
  state.presence.stillness = 0;
  state.presence.revealing = false;
}

export function updatePresenceState() {
  const now = Date.now();
  const scenePhysics = getScenePhysics();
  const timeSinceInteraction = now - state.presence.lastInteractionAt;

  state.presence.breathPhase += 0.0022;
  state.presence.breath = (Math.sin(state.presence.breathPhase) + 1) / 2;

  if (timeSinceInteraction > 1600 && !state.pointer.down) {
    state.presence.stillness = Math.min(
      1,
      state.presence.stillness + 0.0042 * scenePhysics.stillnessGain
    );
  } else {
    state.presence.stillness *= 0.985;
  }

  state.presence.revealing = state.presence.stillness > 0.55;

  if (
    timeSinceInteraction > 6000 &&
    now - state.presence.lastPresenceEventAt > 18000
  ) {
    state.presence.presencePulse = 1;
    state.presence.lastPresenceEventAt = now;
    pulseAt(state.width / 2, state.height / 2, 0.42);
  }

  state.presence.presencePulse *= 0.975;
}

export function wakeArtifact({
  awake = 0.06,
  disturbance = 0.05,
  pressure = 0,
  openness = 0
} = {}) {
  markInteraction();

  state.artifact.awakeLevel = Math.min(1, state.artifact.awakeLevel + awake);
  state.artifact.disturbance = Math.min(1, state.artifact.disturbance + disturbance);
  state.artifact.pressure = Math.max(-1, Math.min(1, state.artifact.pressure + pressure));
  state.artifact.openness = Math.max(-1, Math.min(1, state.artifact.openness + openness));
  state.artifact.pulse = Math.min(1, state.artifact.pulse + 0.24);
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
    state.presence.stillness = Math.min(1, state.presence.stillness + 0.0035);
  }

  if (state.artifact.disturbance > 0.72) {
    state.artifact.stateLabel = "Disturbed";
  } else if (state.presence.revealing) {
    state.artifact.stateLabel = "Revealing";
  } else if (state.presence.stillness > 0.32) {
    state.artifact.stateLabel = "Breathing";
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
    alpha: 0.34 * strength,
    speed: 6 + strength * 5,
    type: "pulse"
  });

  if (strength > 0.5) {
    wakeArtifact({
      awake: 0.026 * strength,
      disturbance: 0.012 * strength
    });
  }
}

export function gravityWaveAt(x, y, strength = 1) {
  const scenePhysics = getScenePhysics();
  const gravityPhysics = getGravityModePhysics();

  state.shockwaves.push({
    x,
    y,
    radius: 12,
    alpha: 0.34 * strength * scenePhysics.disturbance,
    speed: 9 + strength * 6,
    type: "gravity-wave"
  });

  wakeArtifact({
    awake: 0.075 * strength,
    disturbance: 0.095 * strength * scenePhysics.disturbance,
    pressure: 0.025 * strength
  });

  const waveRadius = Math.min(state.width, state.height) * 0.48;

  for (const particle of state.particles) {
    const dx = particle.x - x;
    const dy = particle.y - y;
    const dist = Math.hypot(dx, dy) || 1;

    if (dist > waveRadius) continue;

    const rolePhysics = getRolePhysics(particle);
    const influence = 1 - dist / waveRadius;

    const nx = dx / dist;
    const ny = dy / dist;
    const tx = -ny;
    const ty = nx;

    const waveForce =
      strength *
      gravityPhysics.wave *
      scenePhysics.disturbance *
      rolePhysics.pointer;

    particle.vx += nx * influence * waveForce * 0.95 * particle.depth;
    particle.vy += ny * influence * waveForce * 0.95 * particle.depth;

    particle.vx += tx * influence * waveForce * 0.5;
    particle.vy += ty * influence * waveForce * 0.5;
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

export function explode(x = state.width / 2, y = state.height / 2, power = 10) {
  if (state.energy < CONFIG.energy.explodeCost) return;

  spendEnergy(CONFIG.energy.explodeCost);
  gravityWaveAt(x, y, 0.72);

  for (const particle of state.particles) {
    const dx = particle.x - x;
    const dy = particle.y - y;

    const dist = Math.hypot(dx, dy) || 1;
    const force = Math.min(power, 520 / dist);

    particle.vx += (dx / dist) * force * (0.24 + particle.depth);
    particle.vy += (dy / dist) * force * (0.24 + particle.depth);
  }
}

export function implode(x = state.width / 2, y = state.height / 2, power = 9) {
  if (state.energy < CONFIG.energy.implodeCost) return;

  spendEnergy(CONFIG.energy.implodeCost);

  wakeArtifact({
    awake: 0.075,
    disturbance: 0.04,
    pressure: 0.16,
    openness: -0.06
  });

  pulseAt(x, y, 0.58);

  for (const particle of state.particles) {
    const dx = x - particle.x;
    const dy = y - particle.y;

    const dist = Math.hypot(dx, dy) || 1;
    const force = Math.min(power, 520 / dist);

    particle.vx += (dx / dist) * force * (0.22 + particle.depth);
    particle.vy += (dy / dist) * force * (0.22 + particle.depth);
  }
}

export function fling() {
  const pointer = state.pointer;
  const speed = Math.hypot(pointer.vx, pointer.vy);

  if (speed < 12 || state.energy < CONFIG.energy.flingCost) return;

  spendEnergy(CONFIG.energy.flingCost);

  const waveStrength = Math.min(0.95, speed / 48);

  gravityWaveAt(pointer.x, pointer.y, waveStrength);

  for (const particle of state.particles) {
    const dx = pointer.x - particle.x;
    const dy = pointer.y - particle.y;

    const dist = Math.hypot(dx, dy) || 1;

    if (dist < CONFIG.physics.flingRadius) {
      const influence = 1 - dist / CONFIG.physics.flingRadius;

      particle.vx += pointer.vx * 0.018 * influence;
      particle.vy += pointer.vy * 0.018 * influence;
    }
  }
}

export function spawnComet() {
  if (Math.random() > CONFIG.visuals.cometSpawnChance * 0.2) return;

  const fromLeft = Math.random() > 0.5;

  state.comets.push({
    x: fromLeft ? -60 : state.width + 60,
    y: Math.random() * state.height * 0.7,
    vx: fromLeft ? 2 + Math.random() * 2.5 : -2 - Math.random() * 2.5,
    vy: 0.25 + Math.random() * 0.8,
    life: 1,
    hueOffset: Math.random() * 30
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

  const awakeBoost = 1 + state.artifact.awakeLevel * 0.18;
  const breathBoost = 1 + state.presence.breath * 0.04;
  const stillnessBoost = 1 + state.presence.stillness * 0.08;
  const disturbanceDrag = 1 - state.artifact.disturbance * 0.006;

  particle.vx +=
    nx *
    CONFIG.physics.coreGravity *
    dist *
    particle.depth *
    0.3 *
    awakeBoost *
    breathBoost;

  particle.vy +=
    ny *
    CONFIG.physics.coreGravity *
    dist *
    particle.depth *
    0.3 *
    awakeBoost *
    breathBoost;

  particle.vx +=
    tx *
    CONFIG.physics.orbitStrength *
    particle.depth *
    0.38 *
    awakeBoost *
    stillnessBoost;

  particle.vy +=
    ty *
    CONFIG.physics.orbitStrength *
    particle.depth *
    0.38 *
    awakeBoost *
    stillnessBoost;

  particle.vx *= disturbanceDrag;
  particle.vy *= disturbanceDrag;
}

function applyInfinityCorePhysics(particle, index) {
  const target = getInfinityCoreTarget(particle, index);
  if (!target) return;

  const scenePhysics = getScenePhysics();
  const gravityPhysics = getGravityModePhysics();
  const rolePhysics = getRolePhysics(particle);

  const dx = target.x - particle.x;
  const dy = target.y - particle.y;

  const dist = Math.hypot(dx, dy) || 1;

  const nx = dx / dist;
  const ny = dy / dist;

  const tx = -ny;
  const ty = nx;

  const pressureBoost =
    1 +
    Math.max(0, state.artifact.pressure) * 0.2 -
    Math.max(0, state.artifact.openness) * 0.1;

  const opennessBoost = 1 + Math.max(0, state.artifact.openness) * 0.16;
  const stillnessReveal = 1 + state.presence.stillness * 0.18;
  const pathVariance = 0.82 + particle.pathBias * 0.28;

  const pull =
    target.pull *
    particle.layerPull *
    particle.depth *
    pressureBoost *
    pathVariance *
    stillnessReveal *
    scenePhysics.pull *
    gravityPhysics.pull *
    rolePhysics.pull;

  particle.vx += nx * pull;
  particle.vy += ny * pull;

  const orbit =
    target.orbit *
    particle.depth *
    opennessBoost *
    pathVariance *
    scenePhysics.orbit *
    gravityPhysics.orbit *
    rolePhysics.orbit;

  particle.vx += tx * orbit;
  particle.vy += ty * orbit;

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

  const pull = target.gravity * particle.structurePull * particle.depth * 0.08;

  particle.vx += nx * pull;
  particle.vy += ny * pull;

  particle.vx += tx * target.orbitStrength * particle.depth * 0.05;
  particle.vy += ty * target.orbitStrength * particle.depth * 0.05;
}

function applyMassAnchorPhysics(particle) {
  const anchors = getMassAnchors();

  for (const anchor of anchors) {
    const dx = anchor.x - particle.x;
    const dy = anchor.y - particle.y;

    const dist = Math.hypot(dx, dy) || 1;

    const influenceRadius = anchor.influenceRadius || anchor.radius * 8;

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
      0.0024 *
      particle.depth;

    particle.vx += nx * massPull;
    particle.vy += ny * massPull;

    particle.vx += tx * anchor.orbitStrength * influence * 0.08;
    particle.vy += ty * anchor.orbitStrength * influence * 0.08;
  }
}

function applyPointerPhysics(particle) {
  const pointer = state.pointer;

  if (!pointer.active) return;

  const scenePhysics = getScenePhysics();
  const gravityPhysics = getGravityModePhysics();
  const rolePhysics = getRolePhysics(particle);

  const pdx = pointer.x - particle.x;
  const pdy = pointer.y - particle.y;

  const pdist = Math.hypot(pdx, pdy) || 1;

  const modeRadius =
    state.mode === "spin"
      ? CONFIG.physics.pointerRadius * 1.55
      : CONFIG.physics.pointerRadius;

  if (pdist > modeRadius) return;

  const influence = 1 - pdist / modeRadius;
  const energyScale = 0.45 + state.energy / CONFIG.energy.max;

  const force =
    influence *
    (pointer.down ? 1.05 : 0.46) *
    particle.depth *
    energyScale *
    scenePhysics.pointer *
    gravityPhysics.pointer *
    rolePhysics.pointer;

  const px = pdx / pdist;
  const py = pdy / pdist;

  if (state.mode === "pull") {
    wakeArtifact({
      awake: 0.00045,
      disturbance: 0.00018,
      pressure: 0.00055,
      openness: -0.00014
    });

    particle.vx += px * force * 0.72;
    particle.vy += py * force * 0.72;
  }

  if (state.mode === "push") {
    wakeArtifact({
      awake: 0.00042,
      disturbance: 0.00018,
      pressure: -0.0001,
      openness: 0.00048
    });

    particle.vx -= px * force * 0.78;
    particle.vy -= py * force * 0.78;
  }

  if (state.mode === "spin") {
    wakeArtifact({
      awake: 0.00052,
      disturbance: 0.00032,
      openness: 0.00018
    });

    const rotateForce =
      force *
      0.46 *
      (0.5 + influence * 0.5);

    particle.vx += -py * rotateForce;
    particle.vy += px * rotateForce;
  }

  if (state.mode === "storm") {
    wakeArtifact({
      awake: 0.00058,
      disturbance: 0.00058,
      pressure: 0.00014
    });

    particle.vx += -py * force * 0.56;
    particle.vy += px * force * 0.56;
    particle.vx -= px * force * 0.42;
    particle.vy -= py * force * 0.42;
  }

  if (state.mode === "calm") {
    particle.vx *= 0.948;
    particle.vy *= 0.948;
  }
}

function applyAntiStallDrift(particle, index) {
  const speed = Math.hypot(particle.vx, particle.vy);

  if (speed > 0.035) return;

  const phase =
    state.hue * 0.002 +
    index * 0.618 +
    particle.pathBias * Math.PI * 2;

  const drift =
    particle.role === "veil"
      ? 0.006
      : particle.role === "structure"
        ? 0.012
        : 0.009;

  particle.vx += Math.cos(phase) * drift;
  particle.vy += Math.sin(phase) * drift * 0.6;
}

export function updateParticlePhysics(particle, index) {
  const gravityPhysics = getGravityModePhysics();

  applyCoreGalaxyPhysics(particle);
  applyInfinityCorePhysics(particle, index);
  applyStructurePhysics(particle, index);
  applyMassAnchorPhysics(particle);
  applyPointerPhysics(particle);

  particle.pulse +=
    0.012 +
    state.artifact.awakeLevel * 0.007 +
    state.presence.stillness * 0.004;

  particle.vx *= CONFIG.physics.drag * gravityPhysics.drag;
  particle.vy *= CONFIG.physics.drag * gravityPhysics.drag;

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
  updatePresenceState();
  updateArtifactState();
  spawnComet();

  state.particles.forEach((particle, index) => {
    updateParticlePhysics(particle, index);
  });

  state.pointer.vx *= 0.92;
  state.pointer.vy *= 0.92;
}
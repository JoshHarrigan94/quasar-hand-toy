import { state } from "./state.js";
import { CONFIG } from "./config.js";
import {
  getCosmicStructures,
  getMassAnchors,
  resolveStructurePosition,
  STRUCTURE_TYPES
} from "./cosmicStructures.js";
import { CORE_LAYERS } from "./infinityCore.js";

export function clearCanvas() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;
  const disturbance = state.artifact.disturbance;

  const gradient = ctx.createRadialGradient(
    state.width / 2,
    state.height / 2,
    0,
    state.width / 2,
    state.height / 2,
    Math.max(state.width, state.height)
  );

  gradient.addColorStop(0, `rgb(${3 + awake * 4}, ${3 + awake * 5}, ${5 + disturbance * 8})`);
  gradient.addColorStop(0.28, "#010102");
  gradient.addColorStop(1, "#000000");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);
}

export function drawCore() {
  const ctx = state.ctx;
  const cx = state.width / 2;
  const cy = state.height / 2;
  const unit = Math.min(state.width, state.height);

  const awake = state.artifact.awakeLevel;
  const disturbance = state.artifact.disturbance;
  const pressure = state.artifact.pressure;
  const openness = state.artifact.openness;
  const pulse = state.artifact.pulse;

  const outerRadius =
    unit *
    (0.34 + awake * 0.045 + Math.max(0, openness) * 0.05);

  const voidRadius =
    unit *
    (0.07 + Math.max(0, pressure) * 0.035 - Math.max(0, openness) * 0.018);

  const halo = ctx.createRadialGradient(cx, cy, voidRadius, cx, cy, outerRadius);

  halo.addColorStop(0, "rgba(0,0,0,0)");
  halo.addColorStop(0.22, `rgba(255,255,255,${0.018 + awake * 0.03})`);
  halo.addColorStop(0.46, `rgba(125,211,252,${0.04 + awake * 0.08})`);
  halo.addColorStop(0.68, `rgba(168,85,247,${0.055 + disturbance * 0.09})`);
  halo.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
  ctx.fill();

  if (pulse > 0.02) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,255,255,${pulse * 0.16})`;
    ctx.lineWidth = 1 + pulse * 3;
    ctx.arc(cx, cy, outerRadius * (0.58 + pulse * 0.4), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.fillStyle = `rgba(0,0,0,${0.995 - awake * 0.04})`;
  ctx.arc(cx, cy, Math.max(unit * 0.035, voidRadius), 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(state.hue * (0.0014 + awake * 0.0008));
  ctx.scale(1, 0.38 + openness * 0.05);

  ctx.beginPath();
  ctx.strokeStyle = `rgba(255,255,255,${0.025 + awake * 0.035})`;
  ctx.lineWidth = 1;
  ctx.arc(0, 0, unit * (0.22 + openness * 0.04), 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawStarfield() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;

  for (let i = 0; i < 520; i++) {
    const seed = i * 99991;

    const x = ((Math.sin(seed) + 1) * 0.5) * state.width;
    const y = ((Math.cos(seed) + 1) * 0.5) * state.height;

    const isBright = seed % 140 < 3;
    const size = isBright ? 1.55 : 0.45;
    const alpha = isBright ? 0.55 + awake * 0.12 : 0.075 + awake * 0.025;

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawCosmicStructureGuides() {
  const ctx = state.ctx;
  const structures = getCosmicStructures();

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const structure of structures) {
    const position = resolveStructurePosition(structure, structures);

    if (structure.type === STRUCTURE_TYPES.STAR) {
      drawSoftOrb(position.x, position.y, structure.radius * 1.4, "rgba(255,255,255,0.022)");
    }

    if (structure.type === STRUCTURE_TYPES.PLANET) {
      drawSoftOrb(position.x, position.y, structure.radius, "rgba(125,211,252,0.012)");
    }

    if (structure.type === STRUCTURE_TYPES.MOON) {
      drawSoftOrb(position.x, position.y, structure.radius * 0.8, "rgba(226,232,240,0.01)");
    }

    if (structure.type === STRUCTURE_TYPES.BLACK_HOLE) {
      drawBlackHole(position.x, position.y, structure.radius, structure.influenceRadius);
    }
  }

  ctx.restore();
}

export function drawMassAnchorFields() {
  const ctx = state.ctx;
  const anchors = getMassAnchors();
  const awake = state.artifact.awakeLevel;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const anchor of anchors) {
    if (anchor.type === STRUCTURE_TYPES.BLACK_HOLE) continue;

    const fieldRadius = anchor.radius * (anchor.type === STRUCTURE_TYPES.STAR ? 5 : 3.2);

    const gradient = ctx.createRadialGradient(anchor.x, anchor.y, 0, anchor.x, anchor.y, fieldRadius);

    const alpha = 0.004 + anchor.glow * 0.009 + awake * 0.012;

    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(0.34, `rgba(125,211,252,${alpha * 0.35})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, fieldRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawSoftOrb(x, y, radius, colour) {
  const ctx = state.ctx;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

  gradient.addColorStop(0, colour);
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlackHole(x, y, radius, influenceRadius) {
  const ctx = state.ctx;
  const disturbance = state.artifact.disturbance;

  const halo = ctx.createRadialGradient(x, y, radius * 0.5, x, y, influenceRadius);

  halo.addColorStop(0, "rgba(0,0,0,0.99)");
  halo.addColorStop(0.16, "rgba(15,23,42,0.55)");
  halo.addColorStop(0.32, `rgba(168,85,247,${0.035 + disturbance * 0.06})`);
  halo.addColorStop(0.55, `rgba(125,211,252,${0.012 + disturbance * 0.025})`);
  halo.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, influenceRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.995)";
  ctx.arc(x, y, radius * 1.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(state.hue * (0.002 + disturbance * 0.002));
  ctx.scale(1, 0.22);

  ctx.beginPath();
  ctx.strokeStyle = `rgba(255,255,255,${0.022 + disturbance * 0.035})`;
  ctx.lineWidth = Math.max(1, radius * 0.24);
  ctx.arc(0, 0, radius * 3.8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function getLayerVisuals(particle) {
  const awake = state.artifact.awakeLevel;
  const disturbance = state.artifact.disturbance;

  if (particle.layer === CORE_LAYERS.CORE) {
    return {
      hueShift: 40 + awake * 14,
      saturation: 18 + awake * 10,
      lightness: 82 + awake * 6,
      alphaBase: 0.052 + awake * 0.025,
      alphaDepth: 0.22 + awake * 0.055,
      alphaGlow: 0.18 + disturbance * 0.05,
      alphaSpeed: 0.07 + disturbance * 0.04,
      size: 0.58 + awake * 0.08,
      trail: 0.18 + disturbance * 0.08
    };
  }

  if (particle.layer === CORE_LAYERS.INNER) {
    return {
      hueShift: 18 + awake * 10,
      saturation: 22 + awake * 8,
      lightness: 74 + awake * 5,
      alphaBase: 0.036 + awake * 0.018,
      alphaDepth: 0.16 + awake * 0.04,
      alphaGlow: 0.13 + disturbance * 0.045,
      alphaSpeed: 0.055 + disturbance * 0.035,
      size: 0.46 + awake * 0.06,
      trail: 0.14 + disturbance * 0.07
    };
  }

  if (particle.layer === CORE_LAYERS.OUTER) {
    return {
      hueShift: -8 + awake * 6,
      saturation: 16 + awake * 5,
      lightness: 64 + awake * 4,
      alphaBase: 0.02 + awake * 0.01,
      alphaDepth: 0.105 + awake * 0.03,
      alphaGlow: 0.075 + disturbance * 0.035,
      alphaSpeed: 0.04 + disturbance * 0.026,
      size: 0.36 + awake * 0.035,
      trail: 0.1 + disturbance * 0.045
    };
  }

  return {
    hueShift: -24 + awake * 3,
    saturation: 10 + awake * 3,
    lightness: 52 + awake * 2,
    alphaBase: 0.007 + awake * 0.004,
    alphaDepth: 0.052 + awake * 0.012,
    alphaGlow: 0.035 + disturbance * 0.018,
    alphaSpeed: 0.022 + disturbance * 0.012,
    size: 0.24 + awake * 0.02,
    trail: 0.055 + disturbance * 0.02
  };
}

export function drawParticle(particle) {
  const ctx = state.ctx;
  const visuals = getLayerVisuals(particle);

  const dx = particle.x - state.width / 2;
  const dy = particle.y - state.height / 2;
  const dist = Math.hypot(dx, dy);

  const glow = Math.max(0, 1 - dist / (Math.min(state.width, state.height) * 0.64));
  const speed = Math.min(1, Math.hypot(particle.vx, particle.vy) / 12);
  const twinkle = 0.78 + Math.sin(particle.pulse) * 0.22;

  let structureBoost = 0;
  let sizeBoost = 1;

  if (particle.structureId === "central-star") {
    structureBoost = 6;
    sizeBoost = 1.02;
  }

  if (particle.structureId === "ring-system") {
    structureBoost = 2;
    sizeBoost = 0.66;
  }

  if (particle.structureId === "asteroid-belt") {
    structureBoost = -6;
    sizeBoost = 0.6;
  }

  if (particle.structureId === "hidden-black-hole") {
    structureBoost = 14;
    sizeBoost = 0.58;
  }

  const particleHue =
    state.hue +
    visuals.hueShift +
    particle.depth * 10 +
    glow * 12 +
    speed * 8 +
    structureBoost;

  const alpha =
    (
      visuals.alphaBase +
      particle.depth * visuals.alphaDepth +
      glow * visuals.alphaGlow +
      speed * visuals.alphaSpeed
    ) *
    twinkle;

  ctx.beginPath();

  ctx.fillStyle = `hsla(${particleHue}, ${visuals.saturation}%, ${
    visuals.lightness + glow * 10 + speed * 6
  }%, ${alpha})`;

  ctx.arc(
    particle.x,
    particle.y,
    particle.size *
      particle.depth *
      visuals.size *
      sizeBoost *
      (particle.spark ? 1.65 : 1),
    0,
    Math.PI * 2
  );

  ctx.fill();

  if (speed > 0.66 || particle.spark) {
    ctx.beginPath();

    ctx.strokeStyle = `hsla(${particleHue}, ${visuals.saturation + 6}%, ${
      visuals.lightness + 6
    }%, ${alpha * visuals.trail})`;

    ctx.lineWidth = particle.size * visuals.size * 0.45;
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x - particle.vx * 1.7, particle.y - particle.vy * 1.7);
    ctx.stroke();
  }
}

export function drawPointerGlow() {
  const pointer = state.pointer;
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;

  if (!pointer.active) return;

  const radius = pointer.source === "hand" ? 150 : pointer.down ? 175 : 112;

  const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);

  gradient.addColorStop(0, `rgba(255,255,255,${0.08 + awake * 0.04})`);
  gradient.addColorStop(0.24, `rgba(125,211,252,${0.045 + awake * 0.035})`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (pointer.source === "hand") {
    ctx.beginPath();
    ctx.strokeStyle = pointer.down ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.18)";
    ctx.lineWidth = pointer.down ? 2 : 1.1;
    ctx.arc(pointer.x, pointer.y, pointer.down ? 18 : 12, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawShockwaves() {
  const ctx = state.ctx;

  for (let i = state.shockwaves.length - 1; i >= 0; i--) {
    const wave = state.shockwaves[i];

    const isGravityWave = wave.type === "gravity-wave";

    ctx.beginPath();
    ctx.strokeStyle = isGravityWave
      ? `rgba(125,211,252,${wave.alpha * 0.38})`
      : `rgba(255,255,255,${wave.alpha * 0.28})`;

    ctx.lineWidth = isGravityWave ? 1.6 : 1;
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    ctx.stroke();

    if (isGravityWave) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(168,85,247,${wave.alpha * 0.16})`;
      ctx.lineWidth = 0.8;
      ctx.arc(wave.x, wave.y, wave.radius * 0.72, 0, Math.PI * 2);
      ctx.stroke();
    }

    wave.radius += wave.speed;
    wave.alpha *= 0.92;

    if (wave.alpha < 0.015) {
      state.shockwaves.splice(i, 1);
    }
  }
}

export function drawComets() {
  const ctx = state.ctx;

  for (let i = state.comets.length - 1; i >= 0; i--) {
    const comet = state.comets[i];

    comet.x += comet.vx;
    comet.y += comet.vy;
    comet.life *= 0.985;

    ctx.beginPath();
    ctx.strokeStyle = `hsla(${state.hue + comet.hueOffset}, 20%, 68%, ${comet.life * 0.09})`;
    ctx.lineWidth = 0.8;
    ctx.moveTo(comet.x, comet.y);
    ctx.lineTo(comet.x - comet.vx * 7, comet.y - comet.vy * 7);
    ctx.stroke();

    if (
      comet.life < 0.05 ||
      comet.x < -160 ||
      comet.x > state.width + 160 ||
      comet.y > state.height + 160
    ) {
      state.comets.splice(i, 1);
    }
  }
}

export function renderFrame() {
  const ctx = state.ctx;

  clearCanvas();

  drawStarfield();
  drawCore();
  drawMassAnchorFields();
  drawCosmicStructureGuides();
  drawPointerGlow();
  drawShockwaves();
  drawComets();

  ctx.globalCompositeOperation = "lighter";

  for (const particle of state.particles) {
    drawParticle(particle);
  }

  ctx.globalCompositeOperation = "source-over";
}

export function advanceHue() {
  state.hue +=
    state.mode === "storm"
      ? CONFIG.visuals.stormHueSpeed * 0.32
      : CONFIG.visuals.normalHueSpeed * 0.22;
}
import { state } from "./state.js";
import { CONFIG } from "./config.js";
import {
  getCosmicStructures,
  getMassAnchors,
  resolveStructurePosition,
  STRUCTURE_TYPES
} from "./cosmicStructures.js";

export function clearCanvas() {
  const ctx = state.ctx;

  const gradient = ctx.createRadialGradient(
    state.width / 2,
    state.height / 2,
    0,
    state.width / 2,
    state.height / 2,
    Math.max(state.width, state.height)
  );

  gradient.addColorStop(0, "#050507");
  gradient.addColorStop(0.25, "#020203");
  gradient.addColorStop(1, "#000000");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);
}

export function drawCore() {
  const ctx = state.ctx;

  const cx = state.width / 2;
  const cy = state.height / 2;
  const outerRadius = Math.min(state.width, state.height) * 0.22;

  const halo = ctx.createRadialGradient(
    cx,
    cy,
    outerRadius * 0.15,
    cx,
    cy,
    outerRadius
  );

  halo.addColorStop(0, "rgba(255,255,255,0)");
  halo.addColorStop(0.25, "rgba(125,211,252,0.08)");
  halo.addColorStop(0.55, "rgba(168,85,247,0.14)");
  halo.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.98)";
  ctx.arc(cx, cy, outerRadius * 0.36, 0, Math.PI * 2);
  ctx.fill();
}

function drawStarfield() {
  const ctx = state.ctx;

  for (let i = 0; i < 350; i++) {
    const seed = i * 99991;

    const x = ((Math.sin(seed) + 1) * 0.5) * state.width;
    const y = ((Math.cos(seed) + 1) * 0.5) * state.height;

    const isBright = seed % 100 < 3;
    const size = isBright ? 2 : 0.6;
    const alpha = isBright ? 0.8 : 0.15;

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
      drawSoftOrb(
        position.x,
        position.y,
        structure.radius * 2.2,
        "rgba(255,255,255,0.08)"
      );
    }

    if (structure.type === STRUCTURE_TYPES.PLANET) {
      drawSoftOrb(
        position.x,
        position.y,
        structure.radius * 1.7,
        "rgba(125,211,252,0.045)"
      );
    }

    if (structure.type === STRUCTURE_TYPES.MOON) {
      drawSoftOrb(
        position.x,
        position.y,
        structure.radius * 1.5,
        "rgba(226,232,240,0.035)"
      );
    }

    if (structure.type === STRUCTURE_TYPES.BLACK_HOLE) {
      drawBlackHole(
        position.x,
        position.y,
        structure.radius,
        structure.influenceRadius
      );
    }

    if (structure.type === STRUCTURE_TYPES.ASTEROID_BELT) {
      // Hidden in Awe Pass. Particles reveal the belt instead.
    }

    if (structure.type === STRUCTURE_TYPES.RING_SYSTEM) {
      // Hidden in Awe Pass. Particles reveal the ring instead.
    }
  }

  ctx.restore();
}

export function drawMassAnchorFields() {
  const ctx = state.ctx;
  const anchors = getMassAnchors();

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const anchor of anchors) {
    if (anchor.type === STRUCTURE_TYPES.BLACK_HOLE) continue;

    const fieldRadius =
      anchor.radius *
      (anchor.type === STRUCTURE_TYPES.STAR ? 7.5 : 4.5);

    const gradient = ctx.createRadialGradient(
      anchor.x,
      anchor.y,
      0,
      anchor.x,
      anchor.y,
      fieldRadius
    );

    const alpha = 0.015 + anchor.glow * 0.022;

    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(0.28, `rgba(125,211,252,${alpha * 0.5})`);
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

  const halo = ctx.createRadialGradient(
    x,
    y,
    radius * 0.5,
    x,
    y,
    influenceRadius
  );

  halo.addColorStop(0, "rgba(0,0,0,0.98)");
  halo.addColorStop(0.14, "rgba(15,23,42,0.75)");
  halo.addColorStop(0.25, "rgba(168,85,247,0.08)");
  halo.addColorStop(0.5, "rgba(125,211,252,0.025)");
  halo.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, influenceRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.99)";
  ctx.arc(x, y, radius * 1.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(state.hue * 0.004);
  ctx.scale(1, 0.24);

  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  ctx.lineWidth = Math.max(1, radius * 0.35);
  ctx.arc(0, 0, radius * 3.8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

export function drawParticle(particle) {
  const ctx = state.ctx;

  const dx = particle.x - state.width / 2;
  const dy = particle.y - state.height / 2;
  const dist = Math.hypot(dx, dy);

  const glow = Math.max(
    0,
    1 - dist / (Math.min(state.width, state.height) * 0.58)
  );

  const speed = Math.min(1, Math.hypot(particle.vx, particle.vy) / 12);
  const twinkle = 0.75 + Math.sin(particle.pulse) * 0.25;

  let structureBoost = 0;
  let sizeBoost = 1;

  if (particle.structureId) {
    structureBoost = 8;
    sizeBoost = 0.9;
  }

  if (particle.structureId === "central-star") {
    structureBoost = 18;
    sizeBoost = 1.15;
  }

  if (particle.structureId === "ring-system") {
    structureBoost = 4;
    sizeBoost = 0.62;
  }

  if (particle.structureId === "asteroid-belt") {
    structureBoost = -10;
    sizeBoost = 0.55;
  }

  if (particle.structureId === "hidden-black-hole") {
    structureBoost = 24;
    sizeBoost = 0.58;
  }

  const particleHue =
    state.hue +
    particle.depth * 24 +
    glow * 26 +
    speed * 18 +
    structureBoost;

  const alpha =
    (
      0.04 +
      particle.depth * 0.18 +
      glow * 0.15 +
      speed * 0.08
    ) *
    twinkle;

  ctx.beginPath();

  ctx.fillStyle = `hsla(${particleHue}, 35%, ${
    68 + glow * 18 + speed * 8
  }%, ${alpha})`;

  ctx.arc(
    particle.x,
    particle.y,
    particle.size *
      particle.depth *
      0.55 *
      sizeBoost *
      (particle.spark ? 1.8 : 1),
    0,
    Math.PI * 2
  );

  ctx.fill();

  if (speed > 0.62 || particle.spark) {
    ctx.beginPath();

    ctx.strokeStyle = `hsla(${particleHue}, 40%, 78%, ${alpha * 0.22})`;
    ctx.lineWidth = particle.size * 0.32;

    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(
      particle.x - particle.vx * 1.9,
      particle.y - particle.vy * 1.9
    );

    ctx.stroke();
  }
}

export function drawPointerGlow() {
  const pointer = state.pointer;
  const ctx = state.ctx;

  if (!pointer.active) return;

  const radius =
    pointer.source === "hand"
      ? 150
      : pointer.down
        ? 175
        : 112;

  const gradient = ctx.createRadialGradient(
    pointer.x,
    pointer.y,
    0,
    pointer.x,
    pointer.y,
    radius
  );

  gradient.addColorStop(0, "rgba(255,255,255,0.12)");
  gradient.addColorStop(0.22, "rgba(125,211,252,0.08)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (pointer.source === "hand") {
    ctx.beginPath();

    ctx.strokeStyle = pointer.down
      ? "rgba(255,255,255,0.55)"
      : "rgba(255,255,255,0.26)";

    ctx.lineWidth = pointer.down ? 2 : 1.2;
    ctx.arc(pointer.x, pointer.y, pointer.down ? 18 : 12, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawShockwaves() {
  const ctx = state.ctx;

  for (let i = state.shockwaves.length - 1; i >= 0; i--) {
    const wave = state.shockwaves[i];

    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,255,255,${wave.alpha * 0.45})`;
    ctx.lineWidth = 1.4;
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    ctx.stroke();

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

    ctx.strokeStyle = `hsla(${state.hue + comet.hueOffset}, 35%, 75%, ${
      comet.life * 0.16
    })`;

    ctx.lineWidth = 1.2;
    ctx.moveTo(comet.x, comet.y);
    ctx.lineTo(comet.x - comet.vx * 8, comet.y - comet.vy * 8);
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
      ? CONFIG.visuals.stormHueSpeed * 0.55
      : CONFIG.visuals.normalHueSpeed * 0.45;
}
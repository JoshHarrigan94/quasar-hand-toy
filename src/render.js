import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { getTheme } from "./themes.js";
import {
  getCosmicStructures,
  getMassAnchors,
  resolveStructurePosition,
  STRUCTURE_TYPES
} from "./cosmicStructures.js";

export function clearCanvas() {
  const ctx = state.ctx;
  const theme = getTheme(state.theme);

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, state.width, state.height);
}

export function drawCore() {
  const ctx = state.ctx;
  const theme = getTheme(state.theme);

  const cx = state.width / 2;
  const cy = state.height / 2;
  const radius = Math.min(state.width, state.height) * 0.27;

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

  gradient.addColorStop(0, theme.coreA);
  gradient.addColorStop(0.08, theme.coreB);
  gradient.addColorStop(0.34, theme.coreC);
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCosmicStructureGuides() {
  const ctx = state.ctx;
  const structures = getCosmicStructures();

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const structure of structures) {
    const position = resolveStructurePosition(structure, structures);

    if (structure.type === STRUCTURE_TYPES.STAR) {
      drawSoftOrb(position.x, position.y, structure.radius * 2.6, "rgba(255,255,255,0.18)");
      drawOrbitLine(position.x, position.y, structure.radius * 4.2, 0.58, "rgba(255,255,255,0.05)");
    }

    if (structure.type === STRUCTURE_TYPES.PLANET) {
      drawSoftOrb(position.x, position.y, structure.radius * 2.1, "rgba(125,211,252,0.12)");
      drawOrbitLine(position.x, position.y, structure.radius * 2.6, 0.38, "rgba(125,211,252,0.08)");
    }

    if (structure.type === STRUCTURE_TYPES.MOON) {
      drawSoftOrb(position.x, position.y, structure.radius * 1.9, "rgba(226,232,240,0.09)");
    }

    if (structure.type === STRUCTURE_TYPES.BLACK_HOLE) {
      drawBlackHole(position.x, position.y, structure.radius, structure.influenceRadius);
    }

    if (structure.type === STRUCTURE_TYPES.ASTEROID_BELT) {
      drawOrbitLine(position.x, position.y, structure.innerRadius, 0.48, "rgba(255,255,255,0.035)");
      drawOrbitLine(position.x, position.y, structure.outerRadius, 0.48, "rgba(255,255,255,0.05)");
    }

    if (structure.type === STRUCTURE_TYPES.RING_SYSTEM) {
      const parent = structures.find((item) => item.id === structure.parentId);
      if (!parent) continue;

      const parentPosition = resolveStructurePosition(parent, structures);

      drawTiltedRing(
        parentPosition.x,
        parentPosition.y,
        structure.innerRadius,
        structure.outerRadius,
        structure.tilt || 0,
        "rgba(255,255,255,0.095)"
      );
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

    const alpha = 0.035 + anchor.glow * 0.055;

    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(0.28, `rgba(125,211,252,${alpha * 0.65})`);
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

  const halo = ctx.createRadialGradient(x, y, radius * 0.5, x, y, influenceRadius);

  halo.addColorStop(0, "rgba(0,0,0,0.95)");
  halo.addColorStop(0.12, "rgba(15,23,42,0.9)");
  halo.addColorStop(0.2, "rgba(168,85,247,0.16)");
  halo.addColorStop(0.42, "rgba(125,211,252,0.055)");
  halo.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, influenceRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.98)";
  ctx.arc(x, y, radius * 1.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(state.hue * 0.004);
  ctx.scale(1, 0.28);

  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.11)";
  ctx.lineWidth = Math.max(1, radius * 0.5);
  ctx.arc(0, 0, radius * 3.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawOrbitLine(x, y, radius, compression, colour) {
  const ctx = state.ctx;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, compression);

  ctx.beginPath();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1;
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawTiltedRing(x, y, innerRadius, outerRadius, tilt, colour) {
  const ctx = state.ctx;
  const midRadius = (innerRadius + outerRadius) / 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(1, 0.24);

  ctx.beginPath();
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1, outerRadius - innerRadius);
  ctx.arc(0, 0, midRadius, 0, Math.PI * 2);
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
    structureBoost = 22;
    sizeBoost = 1.12;
  }

  if (particle.structureId === "central-star") {
    structureBoost = 48;
    sizeBoost = 1.45;
  }

  if (particle.structureId === "ring-system") {
    structureBoost = 12;
    sizeBoost = 0.9;
  }

  if (particle.structureId === "asteroid-belt") {
    structureBoost = -18;
    sizeBoost = 0.78;
  }

  if (particle.structureId === "hidden-black-hole") {
    structureBoost = 75;
    sizeBoost = 0.82;
  }

  const particleHue =
    state.hue +
    particle.depth * 70 +
    glow * 60 +
    speed * 40 +
    structureBoost;

  const alpha =
    (0.14 +
      particle.depth * 0.35 +
      glow * 0.35 +
      speed * 0.18) *
    twinkle;

  ctx.beginPath();

  ctx.fillStyle = `hsla(${particleHue}, 100%, ${
    58 + glow * 24 + speed * 10
  }%, ${alpha})`;

  ctx.arc(
    particle.x,
    particle.y,
    particle.size * particle.depth * sizeBoost * (particle.spark ? 2 : 1),
    0,
    Math.PI * 2
  );

  ctx.fill();

  if (speed > 0.45 || particle.spark) {
    ctx.beginPath();

    ctx.strokeStyle = `hsla(${particleHue}, 100%, 75%, ${alpha * 0.38})`;
    ctx.lineWidth = particle.size * 0.55;

    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x - particle.vx * 2.4, particle.y - particle.vy * 2.4);
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

  gradient.addColorStop(0, "rgba(255,255,255,0.28)");
  gradient.addColorStop(0.22, "rgba(125,211,252,0.17)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (pointer.source === "hand") {
    ctx.beginPath();

    ctx.strokeStyle = pointer.down
      ? "rgba(255,255,255,0.85)"
      : "rgba(255,255,255,0.45)";

    ctx.lineWidth = pointer.down ? 2.5 : 1.5;
    ctx.arc(pointer.x, pointer.y, pointer.down ? 18 : 12, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawShockwaves() {
  const ctx = state.ctx;

  for (let i = state.shockwaves.length - 1; i >= 0; i--) {
    const wave = state.shockwaves[i];

    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,255,255,${wave.alpha})`;
    ctx.lineWidth = 2;
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

    ctx.strokeStyle = `hsla(${state.hue + comet.hueOffset}, 100%, 75%, ${
      comet.life * 0.38
    })`;

    ctx.lineWidth = 2;
    ctx.moveTo(comet.x, comet.y);
    ctx.lineTo(comet.x - comet.vx * 10, comet.y - comet.vy * 10);
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
      ? CONFIG.visuals.stormHueSpeed
      : CONFIG.visuals.normalHueSpeed;
}
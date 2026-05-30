import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { CORE_LAYERS, GRAVITY_PATHS } from "./infinityCore.js";

function isSmallScreen() {
  return state.width < 700;
}

export function clearCanvas() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;
  const phoneBoost = isSmallScreen() ? 1.8 : 1;

  const gradient = ctx.createRadialGradient(
    state.width / 2,
    state.height / 2,
    0,
    state.width / 2,
    state.height / 2,
    Math.max(state.width, state.height)
  );

  gradient.addColorStop(
    0,
    `rgb(${2 + awake * 3 * phoneBoost}, ${2 + awake * 3 * phoneBoost}, ${4 + awake * 4 * phoneBoost})`
  );
  gradient.addColorStop(0.4, "#000000");
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
  const pressure = state.artifact.pressure;
  const openness = state.artifact.openness;
  const pulse = state.artifact.pulse;
  const breath = state.presence.breath;
  const stillness = state.presence.stillness;
  const presencePulse = state.presence.presencePulse;

  const outerRadius =
    unit *
    (
      0.19 +
      awake * 0.018 +
      Math.max(0, openness) * 0.02 +
      breath * 0.006 +
      presencePulse * 0.02
    );

  const voidRadius =
    unit *
    (
      0.075 +
      Math.max(0, pressure) * 0.02 -
      Math.max(0, openness) * 0.01 +
      stillness * 0.004
    );

  const verySoftMass = ctx.createRadialGradient(
    cx,
    cy,
    voidRadius,
    cx,
    cy,
    outerRadius
  );

  verySoftMass.addColorStop(0, "rgba(0,0,0,0)");
  verySoftMass.addColorStop(0.48, `rgba(180,190,200,${0.01 + awake * 0.012})`);
  verySoftMass.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = verySoftMass;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
  ctx.fill();

  if (pulse > 0.08 || presencePulse > 0.08) {
    const wave = Math.max(pulse, presencePulse);

    ctx.beginPath();
    ctx.strokeStyle = `rgba(220,225,230,${wave * 0.035})`;
    ctx.lineWidth = 0.8 + wave;
    ctx.arc(cx, cy, outerRadius * (0.7 + wave * 0.18), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.998)";
  ctx.arc(cx, cy, Math.max(unit * 0.045, voidRadius), 0, Math.PI * 2);
  ctx.fill();
}

function drawStarfield() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;
  const stillness = state.presence.stillness;
  const phoneBoost = isSmallScreen() ? 1.6 : 1;

  for (let i = 0; i < 420; i++) {
    const seed = i * 99991;

    const x = ((Math.sin(seed) + 1) * 0.5) * state.width;
    const y = ((Math.cos(seed) + 1) * 0.5) * state.height;

    const isBright = seed % 220 < 2;
    const size = isBright ? 1.18 * phoneBoost : 0.32 * phoneBoost;
    const alpha = isBright
      ? 0.38 + awake * 0.07 + stillness * 0.05
      : 0.055 + awake * 0.014 + stillness * 0.012;

    ctx.beginPath();
    ctx.fillStyle = `rgba(225,230,235,${alpha})`;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function getPathVisuals(particle) {
  const revealing = state.presence.revealing;
  const phone = isSmallScreen();

  if (particle.gravityPath === GRAVITY_PATHS.TORUS) {
    return {
      alpha: revealing ? 1.35 : 1.18,
      size: phone ? 1.18 : 1.02,
      trail: revealing ? 1.15 : 1,
      lightness: revealing ? 6 : 4
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.INFINITY) {
    return {
      alpha: revealing ? 1.48 : 1.28,
      size: phone ? 1.24 : 1.08,
      trail: revealing ? 1.28 : 1.08,
      lightness: revealing ? 9 : 6
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.SINE) {
    return {
      alpha: revealing ? 1.05 : 0.92,
      size: phone ? 1.05 : 0.9,
      trail: revealing ? 0.95 : 0.82,
      lightness: revealing ? 4 : 1
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.PARABOLA) {
    return {
      alpha: revealing ? 0.98 : 0.86,
      size: phone ? 1 : 0.86,
      trail: revealing ? 0.9 : 0.78,
      lightness: revealing ? 2 : -1
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.DEEP_FIELD) {
    return {
      alpha: revealing ? 0.68 : 0.56,
      size: phone ? 0.82 : 0.68,
      trail: revealing ? 0.58 : 0.48,
      lightness: revealing ? -3 : -6
    };
  }

  return {
    alpha: revealing ? 1.26 : 1.12,
    size: phone ? 1.22 : 1.06,
    trail: revealing ? 1.08 : 0.95,
    lightness: revealing ? 5 : 3
  };
}

function getLayerVisuals(particle) {
  const awake = state.artifact.awakeLevel;
  const disturbance = state.artifact.disturbance;
  const breath = state.presence.breath;
  const stillness = state.presence.stillness;
  const presencePulse = state.presence.presencePulse;
  const phone = isSmallScreen();

  const phoneAlpha = phone ? 1.55 : 1;
  const phoneSize = phone ? 1.28 : 1;

  if (particle.layer === CORE_LAYERS.CORE) {
    return {
      hueShift: 0,
      saturation: 5 + awake * 3,
      lightness: 82 + awake * 4 + stillness * 3,
      alphaBase: (0.055 + awake * 0.018 + presencePulse * 0.02) * phoneAlpha,
      alphaDepth: (0.22 + awake * 0.04 + stillness * 0.04) * phoneAlpha,
      alphaGlow: (0.15 + disturbance * 0.03 + breath * 0.014) * phoneAlpha,
      alphaSpeed: (0.05 + disturbance * 0.02) * phoneAlpha,
      size: (0.62 + awake * 0.05 + breath * 0.018) * phoneSize,
      trail: 0.1 + disturbance * 0.035 + stillness * 0.025
    };
  }

  if (particle.layer === CORE_LAYERS.INNER) {
    return {
      hueShift: -4,
      saturation: 5 + awake * 2,
      lightness: 74 + awake * 3 + stillness * 3,
      alphaBase: (0.04 + awake * 0.014 + presencePulse * 0.015) * phoneAlpha,
      alphaDepth: (0.17 + awake * 0.03 + stillness * 0.03) * phoneAlpha,
      alphaGlow: (0.11 + disturbance * 0.025 + breath * 0.01) * phoneAlpha,
      alphaSpeed: (0.036 + disturbance * 0.014) * phoneAlpha,
      size: (0.5 + awake * 0.035 + breath * 0.012) * phoneSize,
      trail: 0.085 + disturbance * 0.028 + stillness * 0.02
    };
  }

  if (particle.layer === CORE_LAYERS.OUTER) {
    return {
      hueShift: -10,
      saturation: 4 + awake * 1.5,
      lightness: 64 + awake * 2 + stillness * 2,
      alphaBase: (0.024 + awake * 0.008 + presencePulse * 0.01) * phoneAlpha,
      alphaDepth: (0.1 + awake * 0.018 + stillness * 0.018) * phoneAlpha,
      alphaGlow: (0.065 + disturbance * 0.018 + breath * 0.006) * phoneAlpha,
      alphaSpeed: (0.026 + disturbance * 0.01) * phoneAlpha,
      size: (0.4 + awake * 0.02 + breath * 0.006) * phoneSize,
      trail: 0.055 + disturbance * 0.018 + stillness * 0.014
    };
  }

  return {
    hueShift: -18,
    saturation: 3,
    lightness: 54 + awake * 2 + stillness * 2,
    alphaBase: (0.009 + awake * 0.003 + presencePulse * 0.004) * phoneAlpha,
    alphaDepth: (0.05 + awake * 0.01 + stillness * 0.012) * phoneAlpha,
    alphaGlow: (0.025 + disturbance * 0.01) * phoneAlpha,
    alphaSpeed: (0.012 + disturbance * 0.006) * phoneAlpha,
    size: (0.26 + awake * 0.01) * phoneSize,
    trail: 0.026 + disturbance * 0.01 + stillness * 0.008
  };
}

export function drawParticle(particle) {
  const ctx = state.ctx;
  const visuals = getLayerVisuals(particle);
  const pathVisuals = getPathVisuals(particle);

  const dx = particle.x - state.width / 2;
  const dy = particle.y - state.height / 2;
  const dist = Math.hypot(dx, dy);

  const glow = Math.max(0, 1 - dist / (Math.min(state.width, state.height) * 0.72));
  const speed = Math.min(1, Math.hypot(particle.vx, particle.vy) / 10);
  const twinkle = 0.84 + Math.sin(particle.pulse) * 0.16;

  let sizeBoost = 1;

  if (particle.structureId === "central-mass") sizeBoost = 1.04;
  if (particle.structureId === "inner-artifact-ring") sizeBoost = 0.86;
  if (particle.structureId === "outer-artifact-ring") sizeBoost = 0.76;
  if (particle.structureId === "deep-field") sizeBoost = 0.62;

  const particleHue =
    state.hue +
    visuals.hueShift +
    particle.depth * 2 +
    glow * 3 +
    speed * 2;

  const alpha =
    (
      visuals.alphaBase +
      particle.depth * visuals.alphaDepth +
      glow * visuals.alphaGlow +
      speed * visuals.alphaSpeed
    ) *
    twinkle *
    pathVisuals.alpha;

  ctx.beginPath();

  ctx.fillStyle = `hsla(${particleHue}, ${visuals.saturation}%, ${
    visuals.lightness + pathVisuals.lightness + glow * 7 + speed * 4
  }%, ${Math.min(0.92, alpha)})`;

  ctx.arc(
    particle.x,
    particle.y,
    particle.size *
      particle.depth *
      visuals.size *
      pathVisuals.size *
      sizeBoost *
      (particle.spark ? 1.45 : 1),
    0,
    Math.PI * 2
  );

  ctx.fill();

  if (speed > 0.74 || particle.spark) {
    ctx.beginPath();

    ctx.strokeStyle = `hsla(${particleHue}, ${visuals.saturation + 2}%, ${
      visuals.lightness + 5
    }%, ${alpha * visuals.trail * pathVisuals.trail})`;

    ctx.lineWidth = particle.size * visuals.size * 0.34;
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x - particle.vx * 1.18, particle.y - particle.vy * 1.18);
    ctx.stroke();
  }
}

export function drawPointerGlow() {
  const pointer = state.pointer;
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;

  if (!pointer.active) return;

  const radius = pointer.source === "hand" ? 112 : pointer.down ? 128 : 76;

  const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);

  gradient.addColorStop(0, `rgba(225,230,235,${0.032 + awake * 0.012})`);
  gradient.addColorStop(0.24, `rgba(145,155,165,${0.018 + awake * 0.008})`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (pointer.source === "hand") {
    ctx.beginPath();
    ctx.strokeStyle = pointer.down ? "rgba(230,235,240,0.22)" : "rgba(230,235,240,0.09)";
    ctx.lineWidth = pointer.down ? 1.3 : 0.8;
    ctx.arc(pointer.x, pointer.y, pointer.down ? 14 : 9, 0, Math.PI * 2);
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
      ? `rgba(205,215,225,${wave.alpha * 0.16})`
      : `rgba(225,230,235,${wave.alpha * 0.1})`;

    ctx.lineWidth = isGravityWave ? 1 : 0.7;
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    ctx.stroke();

    if (isGravityWave) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(160,170,185,${wave.alpha * 0.055})`;
      ctx.lineWidth = 0.5;
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
    ctx.strokeStyle = `hsla(${state.hue}, 6%, 62%, ${comet.life * 0.035})`;
    ctx.lineWidth = 0.55;
    ctx.moveTo(comet.x, comet.y);
    ctx.lineTo(comet.x - comet.vx * 5, comet.y - comet.vy * 5);
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
      ? CONFIG.visuals.stormHueSpeed * 0.1
      : CONFIG.visuals.normalHueSpeed * 0.07;
}
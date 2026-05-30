import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { CORE_LAYERS, GRAVITY_PATHS } from "./infinityCore.js";

function isSmallScreen() {
  return state.width < 700;
}

function getSceneVisuals() {
  const scene = state.scene?.current || "dormant";

  if (scene === "reveal") {
    return {
      brightness: 1.16,
      size: 1.02,
      pathAlpha: 1.18,
      coreDarkness: 0.998
    };
  }

  if (scene === "disturbed") {
    return {
      brightness: 1.08,
      size: 1.04,
      pathAlpha: 1.08,
      coreDarkness: 0.996
    };
  }

  return {
    brightness: 0.92,
    size: 0.96,
    pathAlpha: 0.92,
    coreDarkness: 0.999
  };
}

export function clearCanvas() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;
  const phone = isSmallScreen();

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
    phone
      ? `rgb(${4 + awake * 3}, ${4 + awake * 3}, ${6 + awake * 4})`
      : `rgb(${2 + awake * 2}, ${2 + awake * 2}, ${3 + awake * 3})`
  );

  gradient.addColorStop(0.5, "#000000");
  gradient.addColorStop(1, "#000000");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);
}

export function drawCore() {
  const ctx = state.ctx;

  const cx = state.width / 2;
  const cy = state.height / 2;
  const unit = Math.min(state.width, state.height);

  const pressure = state.artifact.pressure;
  const openness = state.artifact.openness;
  const pulse = state.artifact.pulse;
  const presencePulse = state.presence.presencePulse;

  const voidRadius =
    unit *
    (
      0.065 +
      Math.max(0, pressure) * 0.014 -
      Math.max(0, openness) * 0.008
    );

  if (pulse > 0.12 || presencePulse > 0.12) {
    const wave = Math.max(pulse, presencePulse);

    ctx.beginPath();
    ctx.strokeStyle = `rgba(230,235,240,${wave * 0.018})`;
    ctx.lineWidth = 0.6 + wave * 0.6;
    ctx.arc(cx, cy, voidRadius * (2.1 + wave * 1.6), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  const sceneVisuals = getSceneVisuals();
ctx.fillStyle = `rgba(0,0,0,${sceneVisuals.coreDarkness})`;
  ctx.arc(cx, cy, Math.max(unit * 0.04, voidRadius), 0, Math.PI * 2);
  ctx.fill();
}

function drawStarfield() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;
  const stillness = state.presence.stillness;
  const phoneBoost = isSmallScreen() ? 1.55 : 1;

  for (let i = 0; i < 440; i++) {
    const seed = i * 99991;

    const x = ((Math.sin(seed) + 1) * 0.5) * state.width;
    const y = ((Math.cos(seed) + 1) * 0.5) * state.height;

    const isBright = seed % 180 < 2;
    const size = isBright ? 1.15 * phoneBoost : 0.34 * phoneBoost;
    const alpha = isBright
      ? 0.44 + awake * 0.06 + stillness * 0.04
      : 0.06 + awake * 0.014 + stillness * 0.01;

    ctx.beginPath();
    ctx.fillStyle = `rgba(230,235,240,${alpha})`;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function getPathVisuals(particle) {
  const revealing = state.presence.revealing;
  const phone = isSmallScreen();

  if (particle.gravityPath === GRAVITY_PATHS.TORUS) {
    return {
      alpha: revealing ? 1.32 : 1.18,
      size: phone ? 1.12 : 0.98,
      trail: revealing ? 1.05 : 0.94,
      lightness: revealing ? 7 : 5
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.INFINITY) {
    return {
      alpha: revealing ? 1.46 : 1.3,
      size: phone ? 1.2 : 1.05,
      trail: revealing ? 1.18 : 1.02,
      lightness: revealing ? 10 : 8
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.SINE) {
    return {
      alpha: revealing ? 1.08 : 0.98,
      size: phone ? 1.02 : 0.9,
      trail: revealing ? 0.94 : 0.82,
      lightness: revealing ? 6 : 4
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.PARABOLA) {
    return {
      alpha: revealing ? 0.98 : 0.9,
      size: phone ? 0.96 : 0.84,
      trail: revealing ? 0.88 : 0.76,
      lightness: revealing ? 4 : 2
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.DEEP_FIELD) {
    return {
      alpha: revealing ? 0.72 : 0.62,
      size: phone ? 0.78 : 0.64,
      trail: revealing ? 0.55 : 0.46,
      lightness: revealing ? -1 : -4
    };
  }

  return {
    alpha: revealing ? 1.25 : 1.12,
    size: phone ? 1.1 : 0.98,
    trail: revealing ? 1 : 0.88,
    lightness: revealing ? 6 : 4
  };
}

function getLayerVisuals(particle) {
  const awake = state.artifact.awakeLevel;
  const disturbance = state.artifact.disturbance;
  const breath = state.presence.breath;
  const stillness = state.presence.stillness;
  const presencePulse = state.presence.presencePulse;
  const phone = isSmallScreen();

  const phoneAlpha = phone ? 1.72 : 1.12;
  const phoneSize = phone ? 1.18 : 1.04;

  if (particle.layer === CORE_LAYERS.CORE) {
    return {
      hueShift: 0,
      saturation: 5 + awake * 3,
      lightness: 80 + awake * 3 + stillness * 2,
      alphaBase: (0.064 + awake * 0.018 + presencePulse * 0.018) * phoneAlpha,
      alphaDepth: (0.235 + awake * 0.038 + stillness * 0.032) * phoneAlpha,
      alphaGlow: (0.16 + disturbance * 0.03 + breath * 0.012) * phoneAlpha,
      alphaSpeed: (0.054 + disturbance * 0.018) * phoneAlpha,
      size: (0.62 + awake * 0.045 + breath * 0.014) * phoneSize,
      trail: 0.092 + disturbance * 0.03 + stillness * 0.02
    };
  }

  if (particle.layer === CORE_LAYERS.INNER) {
    return {
      hueShift: -3,
      saturation: 5 + awake * 2,
      lightness: 77 + awake * 2 + stillness * 2,
      alphaBase: (0.054 + awake * 0.014 + presencePulse * 0.012) * phoneAlpha,
      alphaDepth: (0.21 + awake * 0.03 + stillness * 0.026) * phoneAlpha,
      alphaGlow: (0.145 + disturbance * 0.024 + breath * 0.008) * phoneAlpha,
      alphaSpeed: (0.046 + disturbance * 0.012) * phoneAlpha,
      size: (0.57 + awake * 0.032 + breath * 0.01) * phoneSize,
      trail: 0.085 + disturbance * 0.024 + stillness * 0.018
    };
  }

  if (particle.layer === CORE_LAYERS.OUTER) {
    return {
      hueShift: -7,
      saturation: 4 + awake * 1.5,
      lightness: 72 + awake * 2 + stillness * 1.5,
      alphaBase: (0.044 + awake * 0.01 + presencePulse * 0.008) * phoneAlpha,
      alphaDepth: (0.18 + awake * 0.02 + stillness * 0.016) * phoneAlpha,
      alphaGlow: (0.12 + disturbance * 0.018 + breath * 0.005) * phoneAlpha,
      alphaSpeed: (0.038 + disturbance * 0.009) * phoneAlpha,
      size: (0.51 + awake * 0.02 + breath * 0.005) * phoneSize,
      trail: 0.066 + disturbance * 0.016 + stillness * 0.012
    };
  }

  return {
    hueShift: -12,
    saturation: 3,
    lightness: 58 + awake + stillness,
    alphaBase: (0.022 + awake * 0.004 + presencePulse * 0.004) * phoneAlpha,
    alphaDepth: (0.095 + awake * 0.012 + stillness * 0.01) * phoneAlpha,
    alphaGlow: (0.052 + disturbance * 0.01) * phoneAlpha,
    alphaSpeed: (0.02 + disturbance * 0.005) * phoneAlpha,
    size: (0.38 + awake * 0.01) * phoneSize,
    trail: 0.036 + disturbance * 0.008 + stillness * 0.006
  };
}

export function drawParticle(particle) {
  const ctx = state.ctx;
  const visuals = getLayerVisuals(particle);
  const pathVisuals = getPathVisuals(particle);
  const sceneVisuals = getSceneVisuals();

  const dx = particle.x - state.width / 2;
  const dy = particle.y - state.height / 2;
  const dist = Math.hypot(dx, dy);

  const glow = Math.max(0, 1 - dist / (Math.min(state.width, state.height) * 0.78));
  const speed = Math.min(1, Math.hypot(particle.vx, particle.vy) / 10);
  const twinkle = 0.86 + Math.sin(particle.pulse) * 0.14;

  let sizeBoost = 1;

  if (particle.structureId === "central-mass") sizeBoost = 1.02;
  if (particle.structureId === "inner-artifact-ring") sizeBoost = 0.92;
  if (particle.structureId === "outer-artifact-ring") sizeBoost = 0.86;
  if (particle.structureId === "deep-field") sizeBoost = 0.74;

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
pathVisuals.alpha *
sceneVisuals.pathAlpha;

  ctx.beginPath();

  ctx.fillStyle = `hsla(${particleHue}, ${visuals.saturation}%, ${
    (visuals.lightness + pathVisuals.lightness + glow * 6 + speed * 3) * sceneVisuals.brightness
  }%, ${Math.min(0.92, alpha)})`;

  ctx.arc(
    particle.x,
    particle.y,
    particle.size *
  particle.depth *
  visuals.size *
  pathVisuals.size *
  sizeBoost *
  0.88 *
  sceneVisuals.size *
      (particle.spark ? 1.15 : 1)
    0,
    Math.PI * 2
  );

  ctx.fill();

  if (speed > 0.76 || particle.spark) {
    ctx.beginPath();

    ctx.strokeStyle = `hsla(${particleHue}, ${visuals.saturation + 2}%, ${
      visuals.lightness + 5
    }%, ${alpha * visuals.trail * pathVisuals.trail})`;

    ctx.lineWidth = particle.size * visuals.size * 0.3;
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x - particle.vx * 1.08, particle.y - particle.vy * 1.08);
    ctx.stroke();
  }
}

export function drawPointerGlow() {
  const pointer = state.pointer;
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;

  if (!pointer.active) return;

  const radius = pointer.source === "hand" ? 108 : pointer.down ? 124 : 72;

  const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);

  gradient.addColorStop(0, `rgba(225,230,235,${0.03 + awake * 0.01})`);
  gradient.addColorStop(0.24, `rgba(145,155,165,${0.016 + awake * 0.007})`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (pointer.source === "hand") {
    ctx.beginPath();
    ctx.strokeStyle = pointer.down ? "rgba(230,235,240,0.2)" : "rgba(230,235,240,0.08)";
    ctx.lineWidth = pointer.down ? 1.2 : 0.8;
    ctx.arc(pointer.x, pointer.y, pointer.down ? 13 : 8, 0, Math.PI * 2);
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
      ? `rgba(205,215,225,${wave.alpha * 0.14})`
      : `rgba(225,230,235,${wave.alpha * 0.08})`;

    ctx.lineWidth = isGravityWave ? 0.9 : 0.6;
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    ctx.stroke();

    if (isGravityWave) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(160,170,185,${wave.alpha * 0.045})`;
      ctx.lineWidth = 0.45;
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
    ctx.strokeStyle = `hsla(${state.hue}, 6%, 62%, ${comet.life * 0.028})`;
    ctx.lineWidth = 0.5;
    ctx.moveTo(comet.x, comet.y);
    ctx.lineTo(comet.x - comet.vx * 4.5, comet.y - comet.vy * 4.5);
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
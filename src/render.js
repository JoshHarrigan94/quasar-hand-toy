import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { CORE_LAYERS, GRAVITY_PATHS } from "./infinityCore.js";

function isSmallScreen() {
  return state.width < 700;
}

function getSceneVisuals() {
  const scene = state.scene?.current || "dormant";

  if (scene === "helix") return { brightness: 1.18, size: 0.9, pathAlpha: 1.6, coreDarkness: 0.998 };
  if (scene === "galaxy") return { brightness: 1.12, size: 0.92, pathAlpha: 1.5, coreDarkness: 0.998 };
  if (scene === "orbital") return { brightness: 1.12, size: 0.94, pathAlpha: 1.46, coreDarkness: 0.998 };
  if (scene === "eye") return { brightness: 1.16, size: 0.95, pathAlpha: 1.55, coreDarkness: 0.999 };
  if (scene === "flower") return { brightness: 1.14, size: 0.92, pathAlpha: 1.52, coreDarkness: 0.998 };

  if (scene === "saturn") return { brightness: 1.1, size: 0.96, pathAlpha: 1.38, coreDarkness: 0.999 };
  if (scene === "cube") return { brightness: 1.15, size: 0.94, pathAlpha: 1.46, coreDarkness: 0.999 };
  if (scene === "wave") return { brightness: 1.13, size: 0.9, pathAlpha: 1.36, coreDarkness: 0.998 };
  if (scene === "reveal") return { brightness: 1.18, size: 0.96, pathAlpha: 1.42, coreDarkness: 0.998 };
  if (scene === "disturbed") return { brightness: 1.08, size: 1.0, pathAlpha: 1.18, coreDarkness: 0.996 };

  return { brightness: 0.98, size: 0.92, pathAlpha: 1, coreDarkness: 0.999 };
}

function getLaneVisuals(particle) {
  if (particle.shapeLane === "primary") return { alpha: 2.35, size: 1.08, lightness: 18, trail: 1.6 };
  if (particle.shapeLane === "secondary") return { alpha: 1.05, size: 0.82, lightness: 2, trail: 0.75 };
  if (particle.shapeLane === "background") return { alpha: 0.22, size: 0.52, lightness: -16, trail: 0.18 };
  if (particle.shapeLane === "accent") return { alpha: 2.8, size: 1.18, lightness: 24, trail: 1.9 };
  if (particle.shapeLane === "core") return { alpha: 1.45, size: 1.04, lightness: 8, trail: 0.9 };

  return { alpha: 1, size: 1, lightness: 0, trail: 1 };
}

function getGeometryVisuals(particle) {
  const scene = state.scene?.current || "dormant";

  if (scene === "helix") {
    if (particle.shapeLane === "primary") return { alpha: 2.2, size: 0.76, lightness: 24, trail: 2.25 };
    if (particle.shapeLane === "secondary") return { alpha: 1.05, size: 0.66, lightness: 6, trail: 1.2 };
    return { alpha: 0.34, size: 0.56, lightness: -14, trail: 0.28 };
  }

  if (scene === "galaxy") {
    if (particle.shapeLane === "primary") return { alpha: 2.0, size: 0.86, lightness: 20, trail: 2.0 };
    if (particle.shapeLane === "secondary") return { alpha: 1.0, size: 0.72, lightness: 4, trail: 1.1 };
    if (particle.shapeLane === "core") return { alpha: 1.55, size: 1.0, lightness: 10, trail: 0.8 };
    return { alpha: 0.36, size: 0.58, lightness: -12, trail: 0.3 };
  }

  if (scene === "orbital") {
    if (particle.shapeLane === "primary") return { alpha: 1.95, size: 0.82, lightness: 20, trail: 1.65 };
    if (particle.shapeLane === "secondary") return { alpha: 1.1, size: 0.7, lightness: 5, trail: 0.95 };
    if (particle.shapeLane === "core") return { alpha: 1.55, size: 1.05, lightness: 10, trail: 0.75 };
    return { alpha: 0.34, size: 0.58, lightness: -12, trail: 0.28 };
  }

  if (scene === "eye") {
    if (particle.shapeLane === "primary") return { alpha: 2.25, size: 0.88, lightness: 24, trail: 1.25 };
    if (particle.shapeLane === "secondary") return { alpha: 1.35, size: 0.74, lightness: 8, trail: 0.95 };
    if (particle.shapeLane === "core") return { alpha: 1.9, size: 1.08, lightness: 12, trail: 0.7 };
    return { alpha: 0.4, size: 0.6, lightness: -10, trail: 0.25 };
  }

  if (scene === "flower") {
    if (particle.shapeLane === "primary") return { alpha: 2.05, size: 0.82, lightness: 22, trail: 1.55 };
    if (particle.shapeLane === "secondary") return { alpha: 1.15, size: 0.7, lightness: 5, trail: 0.95 };
    if (particle.shapeLane === "accent") return { alpha: 2.5, size: 1.0, lightness: 28, trail: 1.8 };
    return { alpha: 0.38, size: 0.58, lightness: -12, trail: 0.3 };
  }

  if (scene === "saturn") {
    if (particle.shapeLane === "primary") return { alpha: 1.85, size: 1.02, lightness: 18, trail: 1.8 };
    if (particle.shapeLane === "core") return { alpha: 1.35, size: 1, lightness: 8, trail: 0.7 };
    return { alpha: 0.48, size: 0.7, lightness: -10, trail: 0.32 };
  }

  if (scene === "cube") {
    if (particle.shapeLane === "primary" || particle.shapeLane === "accent") {
      return { alpha: 2.1, size: 0.88, lightness: 22, trail: 1.55 };
    }

    return { alpha: 0.42, size: 0.66, lightness: -12, trail: 0.25 };
  }

  if (scene === "wave") {
    if (particle.shapeLane === "primary") return { alpha: 1.95, size: 0.72, lightness: 20, trail: 2.1 };
    if (particle.shapeLane === "secondary") return { alpha: 0.9, size: 0.66, lightness: 4, trail: 1.15 };

    return { alpha: 0.36, size: 0.58, lightness: -12, trail: 0.32 };
  }

  if (scene === "reveal") {
    if (particle.shapeLane === "primary") return { alpha: 2.0, size: 0.92, lightness: 20, trail: 1.7 };

    return { alpha: 0.48, size: 0.7, lightness: -8, trail: 0.4 };
  }

  if (scene === "disturbed") {
    return { alpha: 1.15, size: 0.95, lightness: 5, trail: 1.7 };
  }

  return { alpha: 1, size: 1, lightness: 0, trail: 1 };
}

export function clearCanvas() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;
  const phone = isSmallScreen();
  const sceneVisuals = getSceneVisuals();

  const gradient = ctx.createRadialGradient(
    state.width / 2,
    state.height / 2,
    0,
    state.width / 2,
    state.height / 2,
    Math.max(state.width, state.height)
  );

  const base = phone ? 5 : 2;

  gradient.addColorStop(
    0,
    `rgb(${base + awake * 3 * sceneVisuals.brightness}, ${
      base + awake * 3 * sceneVisuals.brightness
    }, ${base + 2 + awake * 4 * sceneVisuals.brightness})`
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
  const sceneVisuals = getSceneVisuals();
  const transition = state.scene?.transition ?? 1;
const transitionGlow =
  1 - Math.abs(transition - 0.5) * 2;
  const voidRadius =
    unit *
    (0.055 + Math.max(0, pressure) * 0.012 - Math.max(0, openness) * 0.006);

  if (pulse > 0.12 || presencePulse > 0.12) {
    const wave = Math.max(pulse, presencePulse);

    ctx.beginPath();
    ctx.strokeStyle = `rgba(230,235,240,${wave * 0.012})`;
    ctx.lineWidth = 0.5 + wave * 0.4;
    ctx.arc(cx, cy, voidRadius * (2 + wave * 1.3), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.fillStyle = `rgba(0,0,0,${sceneVisuals.coreDarkness})`;
  ctx.arc(cx, cy, Math.max(unit * 0.035, voidRadius), 0, Math.PI * 2);
  ctx.fill();
}

function drawStarfield() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;
  const stillness = state.presence.stillness;
  const phoneBoost = isSmallScreen() ? 1.35 : 1;

  for (let i = 0; i < 260; i++) {
    const seed = i * 99991;
    const x = ((Math.sin(seed) + 1) * 0.5) * state.width;
    const y = ((Math.cos(seed) + 1) * 0.5) * state.height;

    const isBright = seed % 210 < 2;
    const size = isBright ? 1.0 * phoneBoost : 0.26 * phoneBoost;
    const alpha = isBright
      ? 0.34 + awake * 0.045 + stillness * 0.03
      : 0.04 + awake * 0.01 + stillness * 0.006;

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
      alpha: revealing ? 1.24 : 1.08,
      size: phone ? 0.98 : 0.9,
      trail: revealing ? 1.05 : 0.9,
      lightness: revealing ? 5 : 3
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.INFINITY) {
    return {
      alpha: revealing ? 1.36 : 1.18,
      size: phone ? 1.06 : 0.96,
      trail: revealing ? 1.12 : 0.96,
      lightness: revealing ? 8 : 6
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.SINE) {
    return {
      alpha: revealing ? 1.02 : 0.9,
      size: phone ? 0.9 : 0.82,
      trail: revealing ? 0.92 : 0.8,
      lightness: revealing ? 4 : 2
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.PARABOLA) {
    return {
      alpha: revealing ? 0.92 : 0.82,
      size: phone ? 0.86 : 0.76,
      trail: revealing ? 0.82 : 0.68,
      lightness: revealing ? 2 : 0
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.DEEP_FIELD) {
    return {
      alpha: revealing ? 0.6 : 0.48,
      size: phone ? 0.66 : 0.56,
      trail: revealing ? 0.46 : 0.36,
      lightness: revealing ? -4 : -8
    };
  }

  return {
    alpha: revealing ? 1.1 : 1,
    size: phone ? 0.96 : 0.88,
    trail: revealing ? 0.92 : 0.78,
    lightness: revealing ? 4 : 2
  };
}

function getLayerVisuals(particle) {
  const awake = state.artifact.awakeLevel;
  const disturbance = state.artifact.disturbance;
  const breath = state.presence.breath;
  const stillness = state.presence.stillness;
  const presencePulse = state.presence.presencePulse;
  const phone = isSmallScreen();

  const phoneAlpha = phone ? 1.58 : 1.08;
  const phoneSize = phone ? 1.04 : 1;

  if (particle.layer === CORE_LAYERS.CORE) {
    return {
      hueShift: 0,
      saturation: 5 + awake * 3,
      lightness: 78 + awake * 3 + stillness * 2,
      alphaBase: (0.056 + awake * 0.015 + presencePulse * 0.014) * phoneAlpha,
      alphaDepth: (0.2 + awake * 0.03 + stillness * 0.024) * phoneAlpha,
      alphaGlow: (0.13 + disturbance * 0.024 + breath * 0.01) * phoneAlpha,
      alphaSpeed: (0.044 + disturbance * 0.012) * phoneAlpha,
      size: (0.52 + awake * 0.034 + breath * 0.01) * phoneSize,
      trail: 0.078 + disturbance * 0.024 + stillness * 0.016
    };
  }

  if (particle.layer === CORE_LAYERS.INNER) {
    return {
      hueShift: -3,
      saturation: 5 + awake * 2,
      lightness: 75 + awake * 2 + stillness * 2,
      alphaBase: (0.046 + awake * 0.011 + presencePulse * 0.009) * phoneAlpha,
      alphaDepth: (0.17 + awake * 0.024 + stillness * 0.018) * phoneAlpha,
      alphaGlow: (0.11 + disturbance * 0.018 + breath * 0.006) * phoneAlpha,
      alphaSpeed: (0.036 + disturbance * 0.009) * phoneAlpha,
      size: (0.47 + awake * 0.024 + breath * 0.006) * phoneSize,
      trail: 0.07 + disturbance * 0.018 + stillness * 0.012
    };
  }

  if (particle.layer === CORE_LAYERS.OUTER) {
    return {
      hueShift: -7,
      saturation: 4 + awake * 1.5,
      lightness: 68 + awake * 2 + stillness * 1.5,
      alphaBase: (0.034 + awake * 0.007 + presencePulse * 0.005) * phoneAlpha,
      alphaDepth: (0.13 + awake * 0.016 + stillness * 0.012) * phoneAlpha,
      alphaGlow: (0.08 + disturbance * 0.012 + breath * 0.004) * phoneAlpha,
      alphaSpeed: (0.026 + disturbance * 0.007) * phoneAlpha,
      size: (0.4 + awake * 0.015 + breath * 0.004) * phoneSize,
      trail: 0.05 + disturbance * 0.012 + stillness * 0.008
    };
  }

  return {
    hueShift: -12,
    saturation: 3,
    lightness: 52 + awake + stillness,
    alphaBase: (0.014 + awake * 0.003 + presencePulse * 0.002) * phoneAlpha,
    alphaDepth: (0.06 + awake * 0.008 + stillness * 0.006) * phoneAlpha,
    alphaGlow: (0.032 + disturbance * 0.006) * phoneAlpha,
    alphaSpeed: (0.012 + disturbance * 0.003) * phoneAlpha,
    size: (0.28 + awake * 0.006) * phoneSize,
    trail: 0.022 + disturbance * 0.005 + stillness * 0.003
  };
}

export function drawParticle(particle) {
  const ctx = state.ctx;
  const visuals = getLayerVisuals(particle);
  const pathVisuals = getPathVisuals(particle);
  const sceneVisuals = getSceneVisuals();
  const laneVisuals = getLaneVisuals(particle);
  const geometryVisuals = getGeometryVisuals(particle);

  const dx = particle.x - state.width / 2;
  const dy = particle.y - state.height / 2;
  const dist = Math.hypot(dx, dy);

  const glow = Math.max(0, 1 - dist / (Math.min(state.width, state.height) * 0.78));
  const speed = Math.min(1, Math.hypot(particle.vx, particle.vy) / 10);
  const twinkle = 0.86 + Math.sin(particle.pulse) * 0.14;

  let sizeBoost = 1;

  if (particle.structureId === "central-mass") sizeBoost = 1.0;
  if (particle.structureId === "inner-artifact-ring") sizeBoost = 0.88;
  if (particle.structureId === "outer-artifact-ring") sizeBoost = 0.8;
  if (particle.structureId === "deep-field") sizeBoost = 0.7;

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
sceneVisuals.pathAlpha *
laneVisuals.alpha *
geometryVisuals.alpha *
(1 + transitionGlow * 0.35);

  const lightness =
    (
      visuals.lightness +
      pathVisuals.lightness +
      laneVisuals.lightness +
      geometryVisuals.lightness +
      glow * 6 +
      speed * 3
    ) *
    sceneVisuals.brightness;

  ctx.beginPath();

  ctx.fillStyle = `hsla(${particleHue}, ${visuals.saturation}%, ${lightness}%, ${Math.min(0.96, alpha)})`;

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
    (1 + transitionGlow * 0.08) *
    (particle.spark ? 1.15 : 1),
  0,
  Math.PI * 2
);

  ctx.fill();

  if (
    speed > 0.76 ||
    particle.spark ||
    particle.shapeLane === "accent" ||
    particle.shapeLane === "primary"
  ) {
    ctx.beginPath();

    ctx.strokeStyle = `hsla(${particleHue}, ${visuals.saturation + 2}%, ${
      visuals.lightness + 5 + geometryVisuals.lightness
    }%, ${alpha * visuals.trail * pathVisuals.trail * laneVisuals.trail * geometryVisuals.trail})`;

    ctx.lineWidth = particle.size * visuals.size * 0.24;
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x - particle.vx * 0.98, particle.y - particle.vy * 0.98);
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
      comet.y < -160 ||
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
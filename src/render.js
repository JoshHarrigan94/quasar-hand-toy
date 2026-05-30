import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { CORE_LAYERS, GRAVITY_PATHS } from "./infinityCore.js";

function isSmallScreen() {
  return state.width < 700;
}

function getSceneVisuals() {
  const scene = state.scene?.current || "dormant";

  if (scene === "saturn") {
    return {
      brightness: 1.08,
      size: 1.0,
      pathAlpha: 1.22,
      coreDarkness: 0.999
    };
  }

  if (scene === "cube") {
    return {
      brightness: 1.12,
      size: 0.98,
      pathAlpha: 1.28,
      coreDarkness: 0.999
    };
  }

  if (scene === "wave") {
    return {
      brightness: 1.1,
      size: 0.96,
      pathAlpha: 1.2,
      coreDarkness: 0.998
    };
  }

  if (scene === "reveal") {
    return {
      brightness: 1.16,
      size: 1.0,
      pathAlpha: 1.28,
      coreDarkness: 0.998
    };
  }

  if (scene === "disturbed") {
    return {
      brightness: 1.08,
      size: 1.02,
      pathAlpha: 1.12,
      coreDarkness: 0.996
    };
  }

  return {
    brightness: 0.96,
    size: 0.94,
    pathAlpha: 0.96,
    coreDarkness: 0.999
  };
}

function getRoleVisuals(particle) {
  if (particle.role === "core") {
    return { alpha: 1.16, size: 1.02, lightness: 2, trail: 0.9 };
  }

  if (particle.role === "structure") {
    return { alpha: 1.32, size: 1.0, lightness: 4, trail: 1.08 };
  }

  if (particle.role === "field") {
    return { alpha: 0.95, size: 0.92, lightness: 0, trail: 0.9 };
  }

  if (particle.role === "veil") {
    return { alpha: 0.62, size: 0.76, lightness: -6, trail: 0.55 };
  }

  if (particle.role === "accent") {
    return { alpha: 1.48, size: 1.06, lightness: 8, trail: 1.2 };
  }

  return { alpha: 1, size: 1, lightness: 0, trail: 1 };
}

function getGeometryVisuals(particle) {
  const scene = state.scene?.current || "dormant";

  if (scene === "saturn") {
    if (particle.role === "structure" || particle.role === "accent") {
      return { alpha: 1.24, size: 1.02, lightness: 6, trail: 1.18 };
    }

    return { alpha: 0.92, size: 0.94, lightness: -1, trail: 0.8 };
  }

  if (scene === "cube") {
    if (particle.role === "structure" || particle.role === "accent") {
      return { alpha: 1.32, size: 0.96, lightness: 8, trail: 1.05 };
    }

    return { alpha: 0.86, size: 0.88, lightness: -2, trail: 0.72 };
  }

  if (scene === "wave") {
    if (particle.role === "structure") {
      return { alpha: 1.22, size: 0.92, lightness: 6, trail: 1.24 };
    }

    if (particle.role === "veil") {
      return { alpha: 0.7, size: 0.72, lightness: -5, trail: 0.75 };
    }

    return { alpha: 1.0, size: 0.88, lightness: 2, trail: 1.05 };
  }

  if (scene === "reveal") {
    if (particle.gravityPath === GRAVITY_PATHS.INFINITY) {
      return { alpha: 1.32, size: 1.0, lightness: 8, trail: 1.18 };
    }

    return { alpha: 1.08, size: 0.94, lightness: 3, trail: 1.0 };
  }

  if (scene === "disturbed") {
    return { alpha: 1.08, size: 1.0, lightness: 3, trail: 1.22 };
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
    `rgb(${
      base + awake * 3 * sceneVisuals.brightness
    }, ${
      base + awake * 3 * sceneVisuals.brightness
    }, ${
      base + 2 + awake * 4 * sceneVisuals.brightness
    })`
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

  const voidRadius =
    unit *
    (
      0.058 +
      Math.max(0, pressure) * 0.012 -
      Math.max(0, openness) * 0.006
    );

  if (pulse > 0.12 || presencePulse > 0.12) {
    const wave = Math.max(pulse, presencePulse);

    ctx.beginPath();
    ctx.strokeStyle = `rgba(230,235,240,${wave * 0.014})`;
    ctx.lineWidth = 0.55 + wave * 0.45;
    ctx.arc(cx, cy, voidRadius * (2 + wave * 1.35), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.fillStyle = `rgba(0,0,0,${sceneVisuals.coreDarkness})`;
  ctx.arc(cx, cy, Math.max(unit * 0.036, voidRadius), 0, Math.PI * 2);
  ctx.fill();
}

function drawStarfield() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;
  const stillness = state.presence.stillness;
  const phoneBoost = isSmallScreen() ? 1.45 : 1;

  for (let i = 0; i < 420; i++) {
    const seed = i * 99991;

    const x = ((Math.sin(seed) + 1) * 0.5) * state.width;
    const y = ((Math.cos(seed) + 1) * 0.5) * state.height;

    const isBright = seed % 190 < 2;
    const size = isBright ? 1.08 * phoneBoost : 0.3 * phoneBoost;
    const alpha = isBright
      ? 0.4 + awake * 0.055 + stillness * 0.035
      : 0.052 + awake * 0.012 + stillness * 0.008;

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
      alpha: revealing ? 1.28 : 1.12,
      size: phone ? 1.04 : 0.94,
      trail: revealing ? 1.08 : 0.94,
      lightness: revealing ? 6 : 4
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.INFINITY) {
    return {
      alpha: revealing ? 1.42 : 1.24,
      size: phone ? 1.12 : 1,
      trail: revealing ? 1.18 : 1,
      lightness: revealing ? 9 : 7
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.SINE) {
    return {
      alpha: revealing ? 1.06 : 0.94,
      size: phone ? 0.96 : 0.86,
      trail: revealing ? 0.96 : 0.84,
      lightness: revealing ? 5 : 3
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.PARABOLA) {
    return {
      alpha: revealing ? 0.96 : 0.86,
      size: phone ? 0.9 : 0.8,
      trail: revealing ? 0.86 : 0.72,
      lightness: revealing ? 3 : 1
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.DEEP_FIELD) {
    return {
      alpha: revealing ? 0.68 : 0.56,
      size: phone ? 0.72 : 0.6,
      trail: revealing ? 0.52 : 0.42,
      lightness: revealing ? -2 : -6
    };
  }

  return {
    alpha: revealing ? 1.18 : 1.05,
    size: phone ? 1.02 : 0.92,
    trail: revealing ? 1 : 0.84,
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

  const phoneAlpha = phone ? 1.62 : 1.08;
  const phoneSize = phone ? 1.08 : 1;

  if (particle.layer === CORE_LAYERS.CORE) {
    return {
      hueShift: 0,
      saturation: 5 + awake * 3,
      lightness: 79 + awake * 3 + stillness * 2,
      alphaBase: (0.06 + awake * 0.016 + presencePulse * 0.016) * phoneAlpha,
      alphaDepth: (0.22 + awake * 0.034 + stillness * 0.028) * phoneAlpha,
      alphaGlow: (0.145 + disturbance * 0.026 + breath * 0.01) * phoneAlpha,
      alphaSpeed: (0.048 + disturbance * 0.014) * phoneAlpha,
      size: (0.56 + awake * 0.038 + breath * 0.012) * phoneSize,
      trail: 0.082 + disturbance * 0.026 + stillness * 0.018
    };
  }

  if (particle.layer === CORE_LAYERS.INNER) {
    return {
      hueShift: -3,
      saturation: 5 + awake * 2,
      lightness: 76 + awake * 2 + stillness * 2,
      alphaBase: (0.05 + awake * 0.012 + presencePulse * 0.01) * phoneAlpha,
      alphaDepth: (0.19 + awake * 0.026 + stillness * 0.022) * phoneAlpha,
      alphaGlow: (0.125 + disturbance * 0.02 + breath * 0.007) * phoneAlpha,
      alphaSpeed: (0.04 + disturbance * 0.01) * phoneAlpha,
      size: (0.51 + awake * 0.026 + breath * 0.008) * phoneSize,
      trail: 0.076 + disturbance * 0.02 + stillness * 0.014
    };
  }

  if (particle.layer === CORE_LAYERS.OUTER) {
    return {
      hueShift: -7,
      saturation: 4 + awake * 1.5,
      lightness: 70 + awake * 2 + stillness * 1.5,
      alphaBase: (0.04 + awake * 0.008 + presencePulse * 0.006) * phoneAlpha,
      alphaDepth: (0.16 + awake * 0.018 + stillness * 0.014) * phoneAlpha,
      alphaGlow: (0.1 + disturbance * 0.014 + breath * 0.004) * phoneAlpha,
      alphaSpeed: (0.032 + disturbance * 0.008) * phoneAlpha,
      size: (0.46 + awake * 0.018 + breath * 0.004) * phoneSize,
      trail: 0.058 + disturbance * 0.014 + stillness * 0.01
    };
  }

  return {
    hueShift: -12,
    saturation: 3,
    lightness: 56 + awake + stillness,
    alphaBase: (0.018 + awake * 0.003 + presencePulse * 0.003) * phoneAlpha,
    alphaDepth: (0.08 + awake * 0.01 + stillness * 0.008) * phoneAlpha,
    alphaGlow: (0.042 + disturbance * 0.008) * phoneAlpha,
    alphaSpeed: (0.016 + disturbance * 0.004) * phoneAlpha,
    size: (0.32 + awake * 0.008) * phoneSize,
    trail: 0.028 + disturbance * 0.006 + stillness * 0.004
  };
}

export function drawParticle(particle) {
  const ctx = state.ctx;
  const visuals = getLayerVisuals(particle);
  const pathVisuals = getPathVisuals(particle);
  const sceneVisuals = getSceneVisuals();
  const roleVisuals = getRoleVisuals(particle);
  const geometryVisuals = getGeometryVisuals(particle);

  const dx = particle.x - state.width / 2;
  const dy = particle.y - state.height / 2;
  const dist = Math.hypot(dx, dy);

  const glow = Math.max(0, 1 - dist / (Math.min(state.width, state.height) * 0.78));
  const speed = Math.min(1, Math.hypot(particle.vx, particle.vy) / 10);
  const twinkle = 0.86 + Math.sin(particle.pulse) * 0.14;

  let sizeBoost = 1;

  if (particle.structureId === "central-mass") sizeBoost = 1.0;
  if (particle.structureId === "inner-artifact-ring") sizeBoost = 0.9;
  if (particle.structureId === "outer-artifact-ring") sizeBoost = 0.82;
  if (particle.structureId === "deep-field") sizeBoost = 0.72;

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
    roleVisuals.alpha *
    geometryVisuals.alpha;

  const lightness =
    (
      visuals.lightness +
      pathVisuals.lightness +
      roleVisuals.lightness +
      geometryVisuals.lightness +
      glow * 6 +
      speed * 3
    ) *
    sceneVisuals.brightness;

  ctx.beginPath();

  ctx.fillStyle = `hsla(${particleHue}, ${visuals.saturation}%, ${lightness}%, ${Math.min(0.94, alpha)})`;

  ctx.arc(
    particle.x,
    particle.y,
    particle.size *
      particle.depth *
      visuals.size *
      pathVisuals.size *
      roleVisuals.size *
      geometryVisuals.size *
      sizeBoost *
      0.82 *
      sceneVisuals.size *
      (particle.spark ? 1.12 : 1),
    0,
    Math.PI * 2
  );

  ctx.fill();

  if (speed > 0.76 || particle.spark || particle.role === "accent") {
    ctx.beginPath();

    ctx.strokeStyle = `hsla(${particleHue}, ${visuals.saturation + 2}%, ${
      visuals.lightness + 5 + geometryVisuals.lightness
    }%, ${alpha * visuals.trail * pathVisuals.trail * roleVisuals.trail * geometryVisuals.trail})`;

    ctx.lineWidth = particle.size * visuals.size * 0.26;
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x - particle.vx * 1.02, particle.y - particle.vy * 1.02);
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
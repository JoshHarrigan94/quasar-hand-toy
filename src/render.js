import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { CORE_LAYERS, GRAVITY_PATHS } from "./infinityCore.js";

export function clearCanvas() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;
  const breath = state.presence.breath;

  const gradient = ctx.createRadialGradient(
    state.width / 2,
    state.height / 2,
    0,
    state.width / 2,
    state.height / 2,
    Math.max(state.width, state.height)
  );

  gradient.addColorStop(0, `rgb(${1 + awake * 2 + breath}, ${1 + awake * 2 + breath}, ${2 + awake * 2 + breath})`);
  gradient.addColorStop(0.34, "#000000");
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

  const breath = state.presence.breath;
  const stillness = state.presence.stillness;
  const presencePulse = state.presence.presencePulse;

  const outerRadius =
    unit *
    (
      0.3 +
      awake * 0.026 +
      Math.max(0, openness) * 0.035 +
      breath * 0.012 +
      presencePulse * 0.035
    );

  const voidRadius =
    unit *
    (
      0.082 +
      Math.max(0, pressure) * 0.026 -
      Math.max(0, openness) * 0.012 +
      stillness * 0.008
    );

  const halo = ctx.createRadialGradient(cx, cy, voidRadius, cx, cy, outerRadius);

  halo.addColorStop(0, "rgba(0,0,0,0)");
  halo.addColorStop(0.28, `rgba(255,255,255,${0.008 + awake * 0.012 + stillness * 0.012})`);
  halo.addColorStop(0.55, `rgba(185,195,205,${0.018 + awake * 0.024 + breath * 0.006})`);
  halo.addColorStop(0.78, `rgba(95,105,115,${0.012 + disturbance * 0.022 + presencePulse * 0.018})`);
  halo.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
  ctx.fill();

  if (pulse > 0.035 || presencePulse > 0.04) {
    const wave = Math.max(pulse, presencePulse);

    ctx.beginPath();
    ctx.strokeStyle = `rgba(220,225,230,${wave * 0.055})`;
    ctx.lineWidth = 1 + wave * 1.2;
    ctx.arc(cx, cy, outerRadius * (0.52 + wave * 0.3), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.fillStyle = `rgba(0,0,0,${0.998 - awake * 0.018})`;
  ctx.arc(cx, cy, Math.max(unit * 0.045, voidRadius), 0, Math.PI * 2);
  ctx.fill();
}

function drawStarfield() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;
  const stillness = state.presence.stillness;

  for (let i = 0; i < 420; i++) {
    const seed = i * 99991;

    const x = ((Math.sin(seed) + 1) * 0.5) * state.width;
    const y = ((Math.cos(seed) + 1) * 0.5) * state.height;

    const isBright = seed % 220 < 2;
    const size = isBright ? 1.18 : 0.32;
    const alpha = isBright
      ? 0.34 + awake * 0.05 + stillness * 0.04
      : 0.035 + awake * 0.01 + stillness * 0.008;

    ctx.beginPath();
    ctx.fillStyle = `rgba(225,230,235,${alpha})`;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function getPathVisuals(particle) {
  const revealing = state.presence.revealing;

  if (particle.gravityPath === GRAVITY_PATHS.TORUS) {
    return {
      alpha: revealing ? 1.14 : 1.02,
      size: 0.9,
      trail: revealing ? 1.08 : 0.95,
      lightness: revealing ? 3 : 1
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.INFINITY) {
    return {
      alpha: revealing ? 1.22 : 1.08,
      size: 0.96,
      trail: revealing ? 1.18 : 1.02,
      lightness: revealing ? 6 : 3
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.SINE) {
    return {
      alpha: revealing ? 0.95 : 0.82,
      size: 0.76,
      trail: revealing ? 0.9 : 0.74,
      lightness: revealing ? 1 : -2
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.PARABOLA) {
    return {
      alpha: revealing ? 0.86 : 0.74,
      size: 0.7,
      trail: revealing ? 0.82 : 0.68,
      lightness: revealing ? -1 : -4
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.DEEP_FIELD) {
    return {
      alpha: revealing ? 0.5 : 0.42,
      size: 0.54,
      trail: revealing ? 0.52 : 0.42,
      lightness: revealing ? -7 : -10
    };
  }

  return {
    alpha: revealing ? 1.08 : 1,
    size: 1,
    trail: revealing ? 1 : 0.9,
    lightness: revealing ? 2 : 0
  };
}

function getLayerVisuals(particle) {
  const awake = state.artifact.awakeLevel;
  const disturbance = state.artifact.disturbance;
  const breath = state.presence.breath;
  const stillness = state.presence.stillness;
  const presencePulse = state.presence.presencePulse;

  if (particle.layer === CORE_LAYERS.CORE) {
    return {
      hueShift: 0,
      saturation: 5 + awake * 3,
      lightness: 78 + awake * 4 + stillness * 2,
      alphaBase: 0.038 + awake * 0.014 + presencePulse * 0.018,
      alphaDepth: 0.17 + awake * 0.032 + stillness * 0.035,
      alphaGlow: 0.11 + disturbance * 0.025 + breath * 0.012,
      alphaSpeed: 0.038 + disturbance * 0.016,
      size: 0.46 + awake * 0.045 + breath * 0.018,
      trail: 0.09 + disturbance * 0.032 + stillness * 0.02
    };
  }

  if (particle.layer === CORE_LAYERS.INNER) {
    return {
      hueShift: -5,
      saturation: 5 + awake * 2,
      lightness: 68 + awake * 3 + stillness * 2,
      alphaBase: 0.024 + awake * 0.009 + presencePulse * 0.012,
      alphaDepth: 0.12 + awake * 0.024 + stillness * 0.024,
      alphaGlow: 0.075 + disturbance * 0.02 + breath * 0.008,
      alphaSpeed: 0.026 + disturbance * 0.012,
      size: 0.36 + awake * 0.03 + breath * 0.012,
      trail: 0.075 + disturbance * 0.024 + stillness * 0.016
    };
  }

  if (particle.layer === CORE_LAYERS.OUTER) {
    return {
      hueShift: -12,
      saturation: 4 + awake * 1.5,
      lightness: 56 + awake * 2 + stillness * 1.5,
      alphaBase: 0.012 + awake * 0.004 + presencePulse * 0.008,
      alphaDepth: 0.07 + awake * 0.014 + stillness * 0.014,
      alphaGlow: 0.04 + disturbance * 0.015 + breath * 0.005,
      alphaSpeed: 0.018 + disturbance * 0.009,
      size: 0.27 + awake * 0.018 + breath * 0.006,
      trail: 0.045 + disturbance * 0.016 + stillness * 0.01
    };
  }

  return {
    hueShift: -20,
    saturation: 3,
    lightness: 44 + awake * 1.5 + stillness,
    alphaBase: 0.003 + awake * 0.0015 + presencePulse * 0.003,
    alphaDepth: 0.028 + awake * 0.006 + stillness * 0.008,
    alphaGlow: 0.014 + disturbance * 0.008,
    alphaSpeed: 0.008 + disturbance * 0.005,
    size: 0.16 + awake * 0.008,
    trail: 0.022 + disturbance * 0.008 + stillness * 0.006
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
  const twinkle = 0.82 + Math.sin(particle.pulse) * 0.18;

  let sizeBoost = 1;

  if (particle.structureId === "central-mass") sizeBoost = 1.02;
  if (particle.structureId === "inner-artifact-ring") sizeBoost = 0.76;
  if (particle.structureId === "outer-artifact-ring") sizeBoost = 0.62;
  if (particle.structureId === "deep-field") sizeBoost = 0.46;

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
    visuals.lightness + pathVisuals.lightness + glow * 6 + speed * 3
  }%, ${alpha})`;

  ctx.arc(
    particle.x,
    particle.y,
    particle.size *
      particle.depth *
      visuals.size *
      pathVisuals.size *
      sizeBoost *
      (particle.spark ? 1.35 : 1),
    0,
    Math.PI * 2
  );

  ctx.fill();

  if (speed > 0.74 || particle.spark) {
    ctx.beginPath();

    ctx.strokeStyle = `hsla(${particleHue}, ${visuals.saturation + 2}%, ${
      visuals.lightness + 4
    }%, ${alpha * visuals.trail * pathVisuals.trail})`;

    ctx.lineWidth = particle.size * visuals.size * 0.3;
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
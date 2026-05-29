import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { CORE_LAYERS, GRAVITY_PATHS } from "./infinityCore.js";

export function clearCanvas() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;

  const gradient = ctx.createRadialGradient(
    state.width / 2,
    state.height / 2,
    0,
    state.width / 2,
    state.height / 2,
    Math.max(state.width, state.height)
  );

  gradient.addColorStop(0, `rgb(${2 + awake * 2}, ${2 + awake * 2}, ${3 + awake * 3})`);
  gradient.addColorStop(0.32, "#010101");
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
    (0.32 + awake * 0.035 + Math.max(0, openness) * 0.045);

  const voidRadius =
    unit *
    (0.075 + Math.max(0, pressure) * 0.03 - Math.max(0, openness) * 0.016);

  const halo = ctx.createRadialGradient(cx, cy, voidRadius, cx, cy, outerRadius);

  halo.addColorStop(0, "rgba(0,0,0,0)");
  halo.addColorStop(0.26, `rgba(255,255,255,${0.012 + awake * 0.018})`);
  halo.addColorStop(0.52, `rgba(180,195,210,${0.026 + awake * 0.035})`);
  halo.addColorStop(0.74, `rgba(105,115,130,${0.018 + disturbance * 0.035})`);
  halo.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
  ctx.fill();

  if (pulse > 0.025) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(220,230,240,${pulse * 0.09})`;
    ctx.lineWidth = 1 + pulse * 2;
    ctx.arc(cx, cy, outerRadius * (0.54 + pulse * 0.36), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.fillStyle = `rgba(0,0,0,${0.997 - awake * 0.025})`;
  ctx.arc(cx, cy, Math.max(unit * 0.04, voidRadius), 0, Math.PI * 2);
  ctx.fill();
}

function drawStarfield() {
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;

  for (let i = 0; i < 500; i++) {
    const seed = i * 99991;

    const x = ((Math.sin(seed) + 1) * 0.5) * state.width;
    const y = ((Math.cos(seed) + 1) * 0.5) * state.height;

    const isBright = seed % 160 < 3;
    const size = isBright ? 1.35 : 0.38;
    const alpha = isBright ? 0.42 + awake * 0.08 : 0.055 + awake * 0.018;

    ctx.beginPath();
    ctx.fillStyle = `rgba(230,235,240,${alpha})`;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function getPathVisuals(particle) {
  if (particle.gravityPath === GRAVITY_PATHS.TORUS) {
    return {
      alpha: 1.08,
      size: 0.94,
      trail: 1.05,
      lightness: 2
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.INFINITY) {
    return {
      alpha: 1.14,
      size: 1,
      trail: 1.12,
      lightness: 4
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.SINE) {
    return {
      alpha: 0.92,
      size: 0.82,
      trail: 0.86,
      lightness: -1
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.PARABOLA) {
    return {
      alpha: 0.82,
      size: 0.76,
      trail: 0.8,
      lightness: -3
    };
  }

  if (particle.gravityPath === GRAVITY_PATHS.DEEP_FIELD) {
    return {
      alpha: 0.56,
      size: 0.62,
      trail: 0.52,
      lightness: -8
    };
  }

  return {
    alpha: 1,
    size: 1,
    trail: 1,
    lightness: 0
  };
}

function getLayerVisuals(particle) {
  const awake = state.artifact.awakeLevel;
  const disturbance = state.artifact.disturbance;

  if (particle.layer === CORE_LAYERS.CORE) {
    return {
      hueShift: 0,
      saturation: 8 + awake * 4,
      lightness: 78 + awake * 5,
      alphaBase: 0.045 + awake * 0.018,
      alphaDepth: 0.2 + awake * 0.045,
      alphaGlow: 0.14 + disturbance * 0.035,
      alphaSpeed: 0.055 + disturbance * 0.025,
      size: 0.52 + awake * 0.055,
      trail: 0.13 + disturbance * 0.05
    };
  }

  if (particle.layer === CORE_LAYERS.INNER) {
    return {
      hueShift: -4,
      saturation: 7 + awake * 3,
      lightness: 70 + awake * 4,
      alphaBase: 0.03 + awake * 0.012,
      alphaDepth: 0.145 + awake * 0.03,
      alphaGlow: 0.1 + disturbance * 0.03,
      alphaSpeed: 0.04 + disturbance * 0.02,
      size: 0.42 + awake * 0.04,
      trail: 0.1 + disturbance * 0.04
    };
  }

  if (particle.layer === CORE_LAYERS.OUTER) {
    return {
      hueShift: -10,
      saturation: 6 + awake * 2,
      lightness: 60 + awake * 3,
      alphaBase: 0.016 + awake * 0.006,
      alphaDepth: 0.09 + awake * 0.02,
      alphaGlow: 0.055 + disturbance * 0.022,
      alphaSpeed: 0.028 + disturbance * 0.014,
      size: 0.31 + awake * 0.025,
      trail: 0.07 + disturbance * 0.025
    };
  }

  return {
    hueShift: -18,
    saturation: 5,
    lightness: 48 + awake * 2,
    alphaBase: 0.005 + awake * 0.002,
    alphaDepth: 0.04 + awake * 0.008,
    alphaGlow: 0.022 + disturbance * 0.012,
    alphaSpeed: 0.014 + disturbance * 0.008,
    size: 0.2 + awake * 0.012,
    trail: 0.035 + disturbance * 0.012
  };
}

export function drawParticle(particle) {
  const ctx = state.ctx;
  const visuals = getLayerVisuals(particle);
  const pathVisuals = getPathVisuals(particle);

  const dx = particle.x - state.width / 2;
  const dy = particle.y - state.height / 2;
  const dist = Math.hypot(dx, dy);

  const glow = Math.max(0, 1 - dist / (Math.min(state.width, state.height) * 0.68));
  const speed = Math.min(1, Math.hypot(particle.vx, particle.vy) / 12);
  const twinkle = 0.8 + Math.sin(particle.pulse) * 0.2;

  let sizeBoost = 1;

  if (particle.structureId === "central-mass") sizeBoost = 1.04;
  if (particle.structureId === "inner-artifact-ring") sizeBoost = 0.82;
  if (particle.structureId === "outer-artifact-ring") sizeBoost = 0.68;
  if (particle.structureId === "deep-field") sizeBoost = 0.52;

  const particleHue =
    state.hue +
    visuals.hueShift +
    particle.depth * 4 +
    glow * 5 +
    speed * 3;

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
    visuals.lightness + pathVisuals.lightness + glow * 8 + speed * 4
  }%, ${alpha})`;

  ctx.arc(
    particle.x,
    particle.y,
    particle.size *
      particle.depth *
      visuals.size *
      pathVisuals.size *
      sizeBoost *
      (particle.spark ? 1.5 : 1),
    0,
    Math.PI * 2
  );

  ctx.fill();

  if (speed > 0.7 || particle.spark) {
    ctx.beginPath();

    ctx.strokeStyle = `hsla(${particleHue}, ${visuals.saturation + 3}%, ${
      visuals.lightness + 5
    }%, ${alpha * visuals.trail * pathVisuals.trail})`;

    ctx.lineWidth = particle.size * visuals.size * 0.38;
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x - particle.vx * 1.45, particle.y - particle.vy * 1.45);
    ctx.stroke();
  }
}

export function drawPointerGlow() {
  const pointer = state.pointer;
  const ctx = state.ctx;
  const awake = state.artifact.awakeLevel;

  if (!pointer.active) return;

  const radius = pointer.source === "hand" ? 125 : pointer.down ? 145 : 88;

  const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);

  gradient.addColorStop(0, `rgba(230,235,240,${0.045 + awake * 0.018})`);
  gradient.addColorStop(0.24, `rgba(150,160,175,${0.025 + awake * 0.012})`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (pointer.source === "hand") {
    ctx.beginPath();
    ctx.strokeStyle = pointer.down ? "rgba(230,235,240,0.28)" : "rgba(230,235,240,0.12)";
    ctx.lineWidth = pointer.down ? 1.6 : 1;
    ctx.arc(pointer.x, pointer.y, pointer.down ? 16 : 10, 0, Math.PI * 2);
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
      ? `rgba(210,220,230,${wave.alpha * 0.22})`
      : `rgba(230,235,240,${wave.alpha * 0.16})`;

    ctx.lineWidth = isGravityWave ? 1.2 : 0.8;
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    ctx.stroke();

    if (isGravityWave) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(180,190,205,${wave.alpha * 0.08})`;
      ctx.lineWidth = 0.6;
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
    ctx.strokeStyle = `hsla(${state.hue}, 8%, 66%, ${comet.life * 0.055})`;
    ctx.lineWidth = 0.7;
    ctx.moveTo(comet.x, comet.y);
    ctx.lineTo(comet.x - comet.vx * 6, comet.y - comet.vy * 6);
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
      ? CONFIG.visuals.stormHueSpeed * 0.18
      : CONFIG.visuals.normalHueSpeed * 0.11;
}
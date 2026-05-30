import { state } from "./state.js";

export const CORE_LAYERS = {
  CORE: "core",
  INNER: "inner",
  OUTER: "outer",
  HALO: "halo"
};

export const GRAVITY_PATHS = {
  WELL: "well",
  TORUS: "torus",
  INFINITY: "infinity",
  SINE: "sine",
  PARABOLA: "parabola",
  DEEP_FIELD: "deep_field"
};

function isSmallScreen() {
  return state.width < 700;
}

export function assignCoreLayer(index, total) {
  const t = index / total;

  if (t < 0.12) return CORE_LAYERS.CORE;
  if (t < 0.42) return CORE_LAYERS.INNER;
  if (t < 0.74) return CORE_LAYERS.OUTER;

  return CORE_LAYERS.HALO;
}

export function assignGravityPath(index, total) {
  const t = index / total;

  if (t < 0.16) return GRAVITY_PATHS.WELL;
  if (t < 0.39) return GRAVITY_PATHS.INFINITY;
  if (t < 0.58) return GRAVITY_PATHS.TORUS;
  if (t < 0.71) return GRAVITY_PATHS.SINE;
  if (t < 0.83) return GRAVITY_PATHS.PARABOLA;

  return GRAVITY_PATHS.DEEP_FIELD;
}

export function getInfinityCoreTarget(particle, index = 0) {
  const scene = state.scene?.current || "dormant";

  if (scene === "saturn") return getSaturnTarget(particle, index);
  if (scene === "cube") return getCubeTarget(particle, index);
  if (scene === "wave") return getWaveTarget(particle, index);
  if (scene === "reveal") return getRevealTarget(particle, index);
  if (scene === "disturbed") return getDisturbedTarget(particle, index);

  const path = particle.gravityPath || GRAVITY_PATHS.WELL;

  if (path === GRAVITY_PATHS.WELL) return getWellTarget(particle, index);
  if (path === GRAVITY_PATHS.TORUS) return getTorusTarget(particle, index);
  if (path === GRAVITY_PATHS.INFINITY) return getInfinityTarget(particle, index);
  if (path === GRAVITY_PATHS.SINE) return getSineTarget(particle, index);
  if (path === GRAVITY_PATHS.PARABOLA) return getParabolaTarget(particle, index);

  return getDeepFieldTarget(particle, index);
}

function getBaseValues(particle, index) {
  const cx = state.width / 2;
  const cy = state.height / 2;
  const unit = Math.min(state.width, state.height);
  const phone = isSmallScreen();

  const scale = phone ? 0.56 : 0.9;

  const time = state.hue * 0.00034;
  const band = particle.layerBand ?? 0.5;
  const pathBand = particle.pathBand ?? band;
  const role = particle.role || "field";

  const roleScale =
    role === "core"
      ? 0.62
      : role === "structure"
        ? 1
        : role === "field"
          ? 1.08
          : role === "veil"
            ? 1.24
            : 0.88;

  const layerScale =
    particle.layer === CORE_LAYERS.CORE
      ? 0.5
      : particle.layer === CORE_LAYERS.INNER
        ? 0.73
        : particle.layer === CORE_LAYERS.OUTER
          ? 0.94
          : 1.06;

  const phase =
    (particle.pathPhase ?? particle.layerPhase) +
    time +
    index * 0.000085;

  return {
    cx,
    cy,
    unit,
    phone,
    scale,
    band,
    pathBand,
    role,
    roleScale,
    layerScale,
    phase
  };
}

function targetResponse({
  x,
  y,
  pull,
  orbit,
  drag,
  path
}) {
  return { x, y, pull, orbit, drag, path };
}

function getWellTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, layerScale, roleScale } =
    getBaseValues(particle, index);

  const radius =
    unit *
    scale *
    layerScale *
    roleScale *
    (0.01 + pathBand * 0.05);

  return targetResponse({
    x: cx + Math.cos(phase * 0.52) * radius,
    y: cy + Math.sin(phase * 0.42) * radius * 0.54,
    pull: particle.role === "core" ? 0.018 : 0.014,
    orbit: 0.0068,
    drag: 0.997,
    path: GRAVITY_PATHS.WELL
  });
}

function getInfinityTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, layerScale, roleScale } =
    getBaseValues(particle, index);

  const loopScale =
    unit *
    scale *
    layerScale *
    roleScale *
    (0.13 + pathBand * 0.155);

  const t = phase * 0.25;
  const denominator = 1 + Math.sin(t) * Math.sin(t);

  const rawX = (loopScale * Math.cos(t)) / denominator;
  const rawY = (loopScale * Math.sin(t) * Math.cos(t) * 0.54) / denominator;

  const tilt = 0.025;

  return targetResponse({
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: particle.role === "structure" ? 0.0084 : 0.0068,
    orbit: 0.0052,
    drag: 0.9972,
    path: GRAVITY_PATHS.INFINITY
  });
}

function getTorusTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, layerScale, roleScale } =
    getBaseValues(particle, index);

  const majorRadius =
    unit *
    scale *
    layerScale *
    roleScale *
    (0.13 + pathBand * 0.13);

  const minorRadius =
    unit *
    scale *
    (0.009 + pathBand * 0.02);

  const tubePhase = phase * 0.95 + pathBand * Math.PI * 2;

  return targetResponse({
    x:
      cx +
      Math.cos(phase * 0.24) *
        (majorRadius + Math.cos(tubePhase) * minorRadius),
    y:
      cy +
      Math.sin(phase * 0.24) *
        (majorRadius * 0.3 + Math.sin(tubePhase) * minorRadius),
    pull: particle.role === "structure" ? 0.0074 : 0.0058,
    orbit: 0.004,
    drag: 0.9972,
    path: GRAVITY_PATHS.TORUS
  });
}

function getSineTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, layerScale, roleScale } =
    getBaseValues(particle, index);

  const width =
    unit *
    scale *
    layerScale *
    roleScale *
    (0.17 + pathBand * 0.24);

  const amplitude =
    unit *
    scale *
    layerScale *
    roleScale *
    (0.02 + pathBand * 0.046);

  const t = (Math.sin(phase * 0.14) + 1) / 2;

  const rawX = -width / 2 + width * t;
  const rawY = Math.sin(t * Math.PI * 2 + phase * 0.09) * amplitude;

  const tilt = -0.055;

  return targetResponse({
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: 0.004,
    orbit: 0.003,
    drag: 0.998,
    path: GRAVITY_PATHS.SINE
  });
}

function getParabolaTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, layerScale, roleScale } =
    getBaseValues(particle, index);

  const span =
    unit *
    scale *
    layerScale *
    roleScale *
    (0.18 + pathBand * 0.24);

  const depth =
    unit *
    scale *
    layerScale *
    roleScale *
    (0.022 + pathBand * 0.055);

  const t = Math.sin(phase * 0.13);
  const rawX = t * span;
  const rawY = (t * t - 0.46) * depth;

  const tilt = -0.14;

  return targetResponse({
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: 0.0033,
    orbit: 0.0024,
    drag: 0.998,
    path: GRAVITY_PATHS.PARABOLA
  });
}

function getDeepFieldTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, roleScale } =
    getBaseValues(particle, index);

  const radius =
    unit *
    scale *
    roleScale *
    (0.27 + pathBand * 0.28);

  return targetResponse({
    x: cx + Math.cos(phase * 0.06) * radius,
    y: cy + Math.sin(phase * 0.06) * radius * 0.52,
    pull: 0.0005,
    orbit: 0.00065,
    drag: 0.9985,
    path: GRAVITY_PATHS.DEEP_FIELD
  });
}

/* -------------------------------- */
/* GEOMETRY STATES                  */
/* -------------------------------- */

function getSaturnTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, role, roleScale, layerScale } =
    getBaseValues(particle, index);

  if (role === "core") {
    return getWellTarget(particle, index);
  }

  const ringPriority =
    role === "structure"
      ? 1
      : role === "accent"
        ? 0.9
        : role === "field"
          ? 0.65
          : 0.4;

  const ringRadius =
    unit *
    scale *
    (0.2 + pathBand * 0.18) *
    (role === "veil" ? 1.2 : 1) *
    layerScale;

  const ringThickness =
    unit *
    scale *
    (0.004 + pathBand * 0.018) *
    (role === "structure" ? 0.7 : 1.4);

  const ringPhase = phase * (0.22 + particle.pathBias * 0.04);
  const tubePhase = phase * 1.05 + pathBand * Math.PI * 2;

  const ringX =
    cx +
    Math.cos(ringPhase) *
      (ringRadius + Math.cos(tubePhase) * ringThickness);

  const ringY =
    cy +
    Math.sin(ringPhase) *
      (ringRadius * 0.22 + Math.sin(tubePhase) * ringThickness);

  const fallback = getTorusTarget(particle, index);

  return targetResponse({
    x: ringX * ringPriority + fallback.x * (1 - ringPriority),
    y: ringY * ringPriority + fallback.y * (1 - ringPriority),
    pull: role === "structure" ? 0.0105 : 0.007,
    orbit: 0.0054,
    drag: 0.9976,
    path: "saturn"
  });
}

function getCubeTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, role, roleScale, layerScale } =
    getBaseValues(particle, index);

  const edgeSize =
    unit *
    scale *
    layerScale *
    roleScale *
    (0.16 + pathBand * 0.16);

  const speed =
    role === "structure"
      ? 0.16
      : role === "accent"
        ? 0.2
        : 0.11;

  const t = (phase * speed + particle.pathBias * 4) % 4;
  const side = Math.floor(t);
  const local = t - side;

  let x = 0;
  let y = 0;

  if (side === 0) {
    x = -edgeSize + local * edgeSize * 2;
    y = -edgeSize;
  } else if (side === 1) {
    x = edgeSize;
    y = -edgeSize + local * edgeSize * 2;
  } else if (side === 2) {
    x = edgeSize - local * edgeSize * 2;
    y = edgeSize;
  } else {
    x = -edgeSize;
    y = edgeSize - local * edgeSize * 2;
  }

  const cornerSnap =
    role === "accent" || role === "structure"
      ? Math.pow(Math.abs(local - 0.5) * 2, 3)
      : 0;

  x += Math.sign(x || 1) * cornerSnap * edgeSize * 0.08;
  y += Math.sign(y || 1) * cornerSnap * edgeSize * 0.08;

  const perspective = 0.58;
  const tilt = -0.2;

  const rotatedX = x * Math.cos(tilt) - y * perspective * Math.sin(tilt);
  const rotatedY = x * Math.sin(tilt) + y * perspective * Math.cos(tilt);

  return targetResponse({
    x: cx + rotatedX,
    y: cy + rotatedY,
    pull: role === "structure" ? 0.0102 : 0.007,
    orbit: 0.0038,
    drag: 0.9972,
    path: "cube"
  });
}

function getWaveTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, role, roleScale, layerScale } =
    getBaseValues(particle, index);

  const width =
    unit *
    scale *
    layerScale *
    roleScale *
    (0.24 + pathBand * 0.34);

  const amplitude =
    unit *
    scale *
    layerScale *
    (0.028 + pathBand * 0.072);

  const frequency =
    role === "structure"
      ? 1
      : role === "accent"
        ? 1.5
        : role === "veil"
          ? 0.55
          : 0.8;

  const t =
    (Math.sin(phase * 0.15 + particle.pathBias * Math.PI * 2) + 1) / 2;

  const rawX = -width / 2 + width * t;

  const sinWave =
    Math.sin(t * Math.PI * 2 * frequency + phase * 0.11) *
    amplitude;

  const cosWave =
    Math.cos(t * Math.PI * 4 + phase * 0.055) *
    amplitude *
    0.36;

  const parabola =
    ((t - 0.5) * (t - 0.5) - 0.12) *
    amplitude *
    1.8;

  const rawY = sinWave + cosWave + parabola;

  const tilt = -0.075;

  return targetResponse({
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: role === "structure" ? 0.008 : 0.0052,
    orbit: 0.0028,
    drag: 0.998,
    path: "wave"
  });
}

function getRevealTarget(particle, index) {
  if (particle.role === "structure" || particle.role === "accent") {
    return getInfinityTarget(particle, index);
  }

  if (particle.role === "core") {
    return getWellTarget(particle, index);
  }

  return getTorusTarget(particle, index);
}

function getDisturbedTarget(particle, index) {
  const base =
    particle.gravityPath === GRAVITY_PATHS.DEEP_FIELD
      ? getDeepFieldTarget(particle, index)
      : getInfinityTarget(particle, index);

  const { cx, cy, phase, unit, scale, pathBand } =
    getBaseValues(particle, index);

  const jitterRadius =
    unit *
    scale *
    (0.015 + pathBand * 0.04) *
    (particle.role === "accent" ? 1.8 : 1);

  return targetResponse({
    x: base.x + Math.sin(phase * 2.2) * jitterRadius,
    y: base.y + Math.cos(phase * 1.7) * jitterRadius * 0.7,
    pull: base.pull * 0.82,
    orbit: base.orbit * 1.45,
    drag: 0.9978,
    path: "disturbed"
  });
}
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
  if (state.scene?.current === "saturn") {
  return getSaturnTarget(particle, index);
}
  if (state.scene?.current === "cube") {
  return getCubeTarget(particle, index);
}
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
    layerScale,
    phase
  };
}

function getWellTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, layerScale } =
    getBaseValues(particle, index);

  const radius =
    unit *
    scale *
    layerScale *
    (0.01 + pathBand * 0.05);

  return {
    x: cx + Math.cos(phase * 0.52) * radius,
    y: cy + Math.sin(phase * 0.42) * radius * 0.54,
    pull: 0.015,
    orbit: 0.0068,
    drag: 0.997,
    path: GRAVITY_PATHS.WELL
  };
}

function getInfinityTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, layerScale } =
    getBaseValues(particle, index);

  const loopScale =
    unit *
    scale *
    layerScale *
    (0.13 + pathBand * 0.155);

  const t = phase * 0.25;
  const denominator = 1 + Math.sin(t) * Math.sin(t);

  const rawX = (loopScale * Math.cos(t)) / denominator;
  const rawY =
    (loopScale * Math.sin(t) * Math.cos(t) * 0.54) /
    denominator;

  const tilt = 0.025;

  return {
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: 0.007,
    orbit: 0.0052,
    drag: 0.9972,
    path: GRAVITY_PATHS.INFINITY
  };
}

function getTorusTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, layerScale } =
    getBaseValues(particle, index);

  const majorRadius =
    unit *
    scale *
    layerScale *
    (0.13 + pathBand * 0.13);

  const minorRadius =
    unit *
    scale *
    (0.009 + pathBand * 0.02);

  const tubePhase = phase * 0.95 + pathBand * Math.PI * 2;

  return {
    x:
      cx +
      Math.cos(phase * 0.24) *
        (majorRadius + Math.cos(tubePhase) * minorRadius),

    y:
      cy +
      Math.sin(phase * 0.24) *
        (majorRadius * 0.3 + Math.sin(tubePhase) * minorRadius),

    pull: 0.006,
    orbit: 0.004,
    drag: 0.9972,
    path: GRAVITY_PATHS.TORUS
  };
}

function getSineTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, layerScale } =
    getBaseValues(particle, index);

  const width =
    unit *
    scale *
    layerScale *
    (0.17 + pathBand * 0.24);

  const amplitude =
    unit *
    scale *
    layerScale *
    (0.02 + pathBand * 0.046);

  const t = (Math.sin(phase * 0.14) + 1) / 2;

  const rawX = -width / 2 + width * t;
  const rawY = Math.sin(t * Math.PI * 2 + phase * 0.09) * amplitude;

  const tilt = -0.055;

  return {
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: 0.004,
    orbit: 0.003,
    drag: 0.998,
    path: GRAVITY_PATHS.SINE
  };
}

function getParabolaTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, layerScale } =
    getBaseValues(particle, index);

  const span =
    unit *
    scale *
    layerScale *
    (0.18 + pathBand * 0.24);

  const depth =
    unit *
    scale *
    layerScale *
    (0.022 + pathBand * 0.055);

  const t = Math.sin(phase * 0.13);
  const rawX = t * span;
  const rawY = (t * t - 0.46) * depth;

  const tilt = -0.14;

  return {
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: 0.0033,
    orbit: 0.0024,
    drag: 0.998,
    path: GRAVITY_PATHS.PARABOLA
  };
}

function getCubeTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, layerScale } =
    getBaseValues(particle, index);

  const size =
    unit *
    scale *
    layerScale *
    (0.18 + pathBand * 0.18);

  const t = (phase * 0.12 + particle.pathBias * 4) % 4;
  const side = Math.floor(t);
  const local = t - side;

  let x = 0;
  let y = 0;

  if (side === 0) {
    x = -size + local * size * 2;
    y = -size;
  } else if (side === 1) {
    x = size;
    y = -size + local * size * 2;
  } else if (side === 2) {
    x = size - local * size * 2;
    y = size;
  } else {
    x = -size;
    y = size - local * size * 2;
  }

  const perspective = 0.58;
  const tilt = -0.18;

  const rotatedX = x * Math.cos(tilt) - y * perspective * Math.sin(tilt);
  const rotatedY = x * Math.sin(tilt) + y * perspective * Math.cos(tilt);

  return {
    x: cx + rotatedX,
    y: cy + rotatedY,
    pull: 0.0076,
    orbit: 0.0044,
    drag: 0.997,
    path: "cube"
  };
}

function getSaturnTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale, layerScale } =
    getBaseValues(particle, index);

  const ringRadius =
    unit *
    scale *
    layerScale *
    (0.18 + pathBand * 0.22);

  const ringThickness =
    unit *
    scale *
    (0.006 + pathBand * 0.025);

  const ringPhase = phase * 0.22;
  const tubePhase = phase * 1.1 + pathBand * Math.PI * 2;

  const x =
    cx +
    Math.cos(ringPhase) *
      (ringRadius + Math.cos(tubePhase) * ringThickness);

  const y =
    cy +
    Math.sin(ringPhase) *
      (ringRadius * 0.24 + Math.sin(tubePhase) * ringThickness);

  return {
    x,
    y,
    pull: 0.0074,
    orbit: 0.0052,
    drag: 0.9975,
    path: "saturn"
  };
}

function getDeepFieldTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale } =
    getBaseValues(particle, index);

  const radius =
    unit *
    scale *
    (0.27 + pathBand * 0.28);

  return {
    x: cx + Math.cos(phase * 0.06) * radius,
    y: cy + Math.sin(phase * 0.06) * radius * 0.52,
    pull: 0.0005,
    orbit: 0.00065,
    drag: 0.9985,
    path: GRAVITY_PATHS.DEEP_FIELD
  };
}
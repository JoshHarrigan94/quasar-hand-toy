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

  if (t < 0.1) return CORE_LAYERS.CORE;
  if (t < 0.36) return CORE_LAYERS.INNER;
  if (t < 0.72) return CORE_LAYERS.OUTER;

  return CORE_LAYERS.HALO;
}

export function assignGravityPath(index, total) {
  const t = index / total;

  if (t < 0.14) return GRAVITY_PATHS.WELL;
  if (t < 0.34) return GRAVITY_PATHS.TORUS;
  if (t < 0.58) return GRAVITY_PATHS.INFINITY;
  if (t < 0.72) return GRAVITY_PATHS.SINE;
  if (t < 0.84) return GRAVITY_PATHS.PARABOLA;

  return GRAVITY_PATHS.DEEP_FIELD;
}

export function getInfinityCoreTarget(particle, index = 0) {
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

  const scale = phone ? 0.78 : 1;

  const time = state.hue * 0.00042;
  const band = particle.layerBand ?? 0.5;
  const pathBand = particle.pathBand ?? band;

  const phase =
    (particle.pathPhase ?? particle.layerPhase) +
    time +
    index * 0.00012;

  return {
    cx,
    cy,
    unit,
    phone,
    scale,
    time,
    band,
    pathBand,
    phase
  };
}

function getWellTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale } = getBaseValues(particle, index);

  const radius = unit * scale * (0.018 + pathBand * 0.09);

  return {
    x: cx + Math.cos(phase * 0.7) * radius,
    y: cy + Math.sin(phase * 0.55) * radius * 0.58,
    pull: 0.015,
    orbit: 0.008,
    drag: 0.997,
    path: GRAVITY_PATHS.WELL
  };
}

function getTorusTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale } = getBaseValues(particle, index);

  const majorRadius = unit * scale * (0.2 + pathBand * 0.18);
  const minorRadius = unit * scale * (0.014 + pathBand * 0.032);

  const tubePhase = phase * 1.15 + pathBand * Math.PI * 2;

  return {
    x:
      cx +
      Math.cos(phase * 0.32) *
        (majorRadius + Math.cos(tubePhase) * minorRadius),

    y:
      cy +
      Math.sin(phase * 0.32) *
        (majorRadius * 0.34 + Math.sin(tubePhase) * minorRadius),

    pull: 0.0064,
    orbit: 0.0045,
    drag: 0.997,
    path: GRAVITY_PATHS.TORUS
  };
}

function getInfinityTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale } = getBaseValues(particle, index);

  const sizeBoost = isSmallScreen() ? 0.88 : 1;
  const scaleSize = unit * scale * sizeBoost * (0.21 + pathBand * 0.23);

  const t = phase * 0.32;

  const denominator = 1 + Math.sin(t) * Math.sin(t);

  const tilt = 0.04;
  const rawX = (scaleSize * Math.cos(t)) / denominator;
  const rawY =
    (scaleSize * Math.sin(t) * Math.cos(t) * 0.56) /
    denominator;

  return {
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: 0.0072,
    orbit: 0.0062,
    drag: 0.997,
    path: GRAVITY_PATHS.INFINITY
  };
}

function getSineTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale } = getBaseValues(particle, index);

  const width = unit * scale * (0.28 + pathBand * 0.36);
  const amplitude = unit * scale * (0.035 + pathBand * 0.07);

  const t = (Math.sin(phase * 0.18) + 1) / 2;

  const rawX = -width / 2 + width * t;
  const rawY = Math.sin(t * Math.PI * 2 + phase * 0.12) * amplitude;

  const tilt = -0.08;

  return {
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: 0.0045,
    orbit: 0.0038,
    drag: 0.998,
    path: GRAVITY_PATHS.SINE
  };
}

function getParabolaTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale } = getBaseValues(particle, index);

  const span = unit * scale * (0.28 + pathBand * 0.36);
  const depth = unit * scale * (0.035 + pathBand * 0.09);

  const t = Math.sin(phase * 0.16);
  const rawX = t * span;
  const rawY = (t * t - 0.46) * depth;

  const tilt = -0.18;

  return {
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: 0.0038,
    orbit: 0.003,
    drag: 0.998,
    path: GRAVITY_PATHS.PARABOLA
  };
}

function getDeepFieldTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale } = getBaseValues(particle, index);

  const radius = unit * scale * (0.48 + pathBand * 0.56);

  return {
    x: cx + Math.cos(phase * 0.08) * radius,
    y: cy + Math.sin(phase * 0.08) * radius * 0.54,
    pull: 0.0005,
    orbit: 0.0008,
    drag: 0.9985,
    path: GRAVITY_PATHS.DEEP_FIELD
  };
}
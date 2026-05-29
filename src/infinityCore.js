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

export function assignCoreLayer(index, total) {
  const t = index / total;

  if (t < 0.12) return CORE_LAYERS.CORE;
  if (t < 0.38) return CORE_LAYERS.INNER;
  if (t < 0.72) return CORE_LAYERS.OUTER;

  return CORE_LAYERS.HALO;
}

export function assignGravityPath(index, total) {
  const t = index / total;

  if (t < 0.16) return GRAVITY_PATHS.WELL;
  if (t < 0.34) return GRAVITY_PATHS.TORUS;
  if (t < 0.56) return GRAVITY_PATHS.INFINITY;
  if (t < 0.72) return GRAVITY_PATHS.SINE;
  if (t < 0.86) return GRAVITY_PATHS.PARABOLA;

  return GRAVITY_PATHS.DEEP_FIELD;
}

export function getInfinityCoreTarget(particle, index = 0) {
  const path = particle.gravityPath || GRAVITY_PATHS.WELL;

  if (path === GRAVITY_PATHS.WELL) {
    return getWellTarget(particle, index);
  }

  if (path === GRAVITY_PATHS.TORUS) {
    return getTorusTarget(particle, index);
  }

  if (path === GRAVITY_PATHS.INFINITY) {
    return getInfinityTarget(particle, index);
  }

  if (path === GRAVITY_PATHS.SINE) {
    return getSineTarget(particle, index);
  }

  if (path === GRAVITY_PATHS.PARABOLA) {
    return getParabolaTarget(particle, index);
  }

  return getDeepFieldTarget(particle, index);
}

function getBaseValues(particle, index) {
  const cx = state.width / 2;
  const cy = state.height / 2;
  const unit = Math.min(state.width, state.height);

  const time = state.hue * 0.001;
  const band = particle.layerBand ?? 0.5;

  const phase =
    particle.layerPhase +
    time +
    index * 0.00032;

  return {
    cx,
    cy,
    unit,
    time,
    band,
    phase
  };
}

function getWellTarget(particle, index) {
  const { cx, cy, unit, band, phase } = getBaseValues(particle, index);

  const radius = unit * (0.015 + band * 0.085);

  return {
    x: cx + Math.cos(phase * 1.2) * radius,
    y: cy + Math.sin(phase * 0.95) * radius * 0.64,
    pull: 0.031,
    orbit: 0.022,
    drag: 0.994,
    path: GRAVITY_PATHS.WELL
  };
}

function getTorusTarget(particle, index) {
  const { cx, cy, unit, band, phase } = getBaseValues(particle, index);

  const majorRadius = unit * (0.18 + band * 0.18);
  const minorRadius = unit * (0.018 + band * 0.035);

  const tubePhase = phase * 2.7 + band * Math.PI * 2;

  const x =
    cx +
    Math.cos(phase * 0.68) *
      (majorRadius + Math.cos(tubePhase) * minorRadius);

  const y =
    cy +
    Math.sin(phase * 0.68) *
      (majorRadius * 0.38 + Math.sin(tubePhase) * minorRadius);

  return {
    x,
    y,
    pull: 0.012,
    orbit: 0.013,
    drag: 0.992,
    path: GRAVITY_PATHS.TORUS
  };
}

function getInfinityTarget(particle, index) {
  const { cx, cy, unit, band, phase } = getBaseValues(particle, index);

  const scale = unit * (0.16 + band * 0.18);

  const t = phase * 0.72;

  const denominator = 1 + Math.sin(t) * Math.sin(t);

  const x = cx + (scale * Math.cos(t)) / denominator;
  const y = cy + (scale * Math.sin(t) * Math.cos(t) * 0.62) / denominator;

  return {
    x,
    y,
    pull: 0.013,
    orbit: 0.015,
    drag: 0.992,
    path: GRAVITY_PATHS.INFINITY
  };
}

function getSineTarget(particle, index) {
  const { cx, cy, unit, band, phase } = getBaseValues(particle, index);

  const width = unit * (0.26 + band * 0.36);
  const amplitude = unit * (0.045 + band * 0.09);

  const t = (Math.sin(phase * 0.42) + 1) / 2;

  const x = cx - width / 2 + width * t;
  const y =
    cy +
    Math.sin(t * Math.PI * 2 + phase * 0.32) *
      amplitude;

  return {
    x,
    y,
    pull: 0.0085,
    orbit: 0.01,
    drag: 0.993,
    path: GRAVITY_PATHS.SINE
  };
}

function getParabolaTarget(particle, index) {
  const { cx, cy, unit, band, phase } = getBaseValues(particle, index);

  const span = unit * (0.26 + band * 0.34);
  const depth = unit * (0.045 + band * 0.12);

  const t = Math.sin(phase * 0.36);
  const x = cx + t * span;
  const y = cy + (t * t - 0.42) * depth;

  const tilt = -0.18;

  const dx = x - cx;
  const dy = y - cy;

  return {
    x: cx + dx * Math.cos(tilt) - dy * Math.sin(tilt),
    y: cy + dx * Math.sin(tilt) + dy * Math.cos(tilt),
    pull: 0.007,
    orbit: 0.0085,
    drag: 0.993,
    path: GRAVITY_PATHS.PARABOLA
  };
}

function getDeepFieldTarget(particle, index) {
  const { cx, cy, unit, band, phase } = getBaseValues(particle, index);

  const radius = unit * (0.52 + band * 0.72);

  return {
    x: cx + Math.cos(phase * 0.22) * radius,
    y: cy + Math.sin(phase * 0.22) * radius * 0.58,
    pull: 0.0012,
    orbit: 0.0025,
    drag: 0.997,
    path: GRAVITY_PATHS.DEEP_FIELD
  };
}
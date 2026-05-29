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

  const time = state.hue * 0.00058;
  const band = particle.layerBand ?? 0.5;

  const phase =
    particle.layerPhase +
    time +
    index * 0.00018;

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

  const radius = unit * (0.018 + band * 0.1);

  return {
    x: cx + Math.cos(phase * 0.82) * radius,
    y: cy + Math.sin(phase * 0.68) * radius * 0.62,
    pull: 0.018,
    orbit: 0.012,
    drag: 0.996,
    path: GRAVITY_PATHS.WELL
  };
}

function getTorusTarget(particle, index) {
  const { cx, cy, unit, band, phase } = getBaseValues(particle, index);

  const majorRadius = unit * (0.2 + band * 0.2);
  const minorRadius = unit * (0.018 + band * 0.034);

  const tubePhase = phase * 1.8 + band * Math.PI * 2;

  return {
    x:
      cx +
      Math.cos(phase * 0.42) *
        (majorRadius + Math.cos(tubePhase) * minorRadius),

    y:
      cy +
      Math.sin(phase * 0.42) *
        (majorRadius * 0.36 + Math.sin(tubePhase) * minorRadius),

    pull: 0.0078,
    orbit: 0.007,
    drag: 0.995,
    path: GRAVITY_PATHS.TORUS
  };
}

function getInfinityTarget(particle, index) {
  const { cx, cy, unit, band, phase } = getBaseValues(particle, index);

  const scale = unit * (0.18 + band * 0.21);
  const t = phase * 0.44;

  const denominator = 1 + Math.sin(t) * Math.sin(t);

  return {
    x: cx + (scale * Math.cos(t)) / denominator,
    y: cy + (scale * Math.sin(t) * Math.cos(t) * 0.58) / denominator,
    pull: 0.0085,
    orbit: 0.0085,
    drag: 0.995,
    path: GRAVITY_PATHS.INFINITY
  };
}

function getSineTarget(particle, index) {
  const { cx, cy, unit, band, phase } = getBaseValues(particle, index);

  const width = unit * (0.28 + band * 0.42);
  const amplitude = unit * (0.04 + band * 0.085);

  const t = (Math.sin(phase * 0.24) + 1) / 2;

  return {
    x: cx - width / 2 + width * t,
    y: cy + Math.sin(t * Math.PI * 2 + phase * 0.18) * amplitude,
    pull: 0.0055,
    orbit: 0.0055,
    drag: 0.996,
    path: GRAVITY_PATHS.SINE
  };
}

function getParabolaTarget(particle, index) {
  const { cx, cy, unit, band, phase } = getBaseValues(particle, index);

  const span = unit * (0.28 + band * 0.4);
  const depth = unit * (0.045 + band * 0.12);

  const t = Math.sin(phase * 0.22);
  const rawX = t * span;
  const rawY = (t * t - 0.42) * depth;

  const tilt = -0.16;

  return {
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: 0.0047,
    orbit: 0.0048,
    drag: 0.996,
    path: GRAVITY_PATHS.PARABOLA
  };
}

function getDeepFieldTarget(particle, index) {
  const { cx, cy, unit, band, phase } = getBaseValues(particle, index);

  const radius = unit * (0.62 + band * 0.82);

  return {
    x: cx + Math.cos(phase * 0.12) * radius,
    y: cy + Math.sin(phase * 0.12) * radius * 0.56,
    pull: 0.00075,
    orbit: 0.0012,
    drag: 0.998,
    path: GRAVITY_PATHS.DEEP_FIELD
  };
}
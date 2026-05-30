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
  if (t < 0.38) return GRAVITY_PATHS.INFINITY;
  if (t < 0.58) return GRAVITY_PATHS.TORUS;
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

  const scale = phone ? 0.82 : 1;

  const time = state.hue * 0.00038;
  const band = particle.layerBand ?? 0.5;
  const pathBand = particle.pathBand ?? band;

  const layerScale =
    particle.layer === CORE_LAYERS.CORE
      ? 0.58
      : particle.layer === CORE_LAYERS.INNER
        ? 0.84
        : particle.layer === CORE_LAYERS.OUTER
          ? 1.08
          : 1.28;

  const phase =
    (particle.pathPhase ?? particle.layerPhase) +
    time +
    index * 0.0001;

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
    (0.012 + pathBand * 0.07);

  return {
    x: cx + Math.cos(phase * 0.58) * radius,
    y: cy + Math.sin(phase * 0.46) * radius * 0.56,
    pull: 0.017,
    orbit: 0.0075,
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
    (0.16 + pathBand * 0.2);

  const t = phase * 0.28;

  const denominator = 1 + Math.sin(t) * Math.sin(t);

  const rawX = (loopScale * Math.cos(t)) / denominator;
  const rawY =
    (loopScale * Math.sin(t) * Math.cos(t) * 0.58) /
    denominator;

  const tilt = 0.035;

  return {
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: 0.0078,
    orbit: 0.0058,
    drag: 0.997,
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
    (0.17 + pathBand * 0.17);

  const minorRadius =
    unit *
    scale *
    (0.012 + pathBand * 0.026);

  const tubePhase = phase * 1.05 + pathBand * Math.PI * 2;

  return {
    x:
      cx +
      Math.cos(phase * 0.28) *
        (majorRadius + Math.cos(tubePhase) * minorRadius),

    y:
      cy +
      Math.sin(phase * 0.28) *
        (majorRadius * 0.32 + Math.sin(tubePhase) * minorRadius),

    pull: 0.0066,
    orbit: 0.0044,
    drag: 0.997,
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
    (0.22 + pathBand * 0.34);

  const amplitude =
    unit *
    scale *
    layerScale *
    (0.03 + pathBand * 0.06);

  const t = (Math.sin(phase * 0.16) + 1) / 2;

  const rawX = -width / 2 + width * t;
  const rawY = Math.sin(t * Math.PI * 2 + phase * 0.1) * amplitude;

  const tilt = -0.07;

  return {
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: 0.0046,
    orbit: 0.0035,
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
    (0.24 + pathBand * 0.34);

  const depth =
    unit *
    scale *
    layerScale *
    (0.03 + pathBand * 0.08);

  const t = Math.sin(phase * 0.15);
  const rawX = t * span;
  const rawY = (t * t - 0.46) * depth;

  const tilt = -0.16;

  return {
    x: cx + rawX * Math.cos(tilt) - rawY * Math.sin(tilt),
    y: cy + rawX * Math.sin(tilt) + rawY * Math.cos(tilt),
    pull: 0.0038,
    orbit: 0.0028,
    drag: 0.998,
    path: GRAVITY_PATHS.PARABOLA
  };
}

function getDeepFieldTarget(particle, index) {
  const { cx, cy, unit, pathBand, phase, scale } =
    getBaseValues(particle, index);

  const radius =
    unit *
    scale *
    (0.38 + pathBand * 0.46);

  return {
    x: cx + Math.cos(phase * 0.07) * radius,
    y: cy + Math.sin(phase * 0.07) * radius * 0.54,
    pull: 0.00055,
    orbit: 0.00075,
    drag: 0.9985,
    path: GRAVITY_PATHS.DEEP_FIELD
  };
}
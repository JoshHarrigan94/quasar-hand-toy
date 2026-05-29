import { state } from "./state.js";

export const CORE_LAYERS = {
  CORE: "core",
  INNER: "inner",
  OUTER: "outer",
  HALO: "halo"
};

export function assignCoreLayer(index, total) {
  const t = index / total;

  if (t < 0.14) return CORE_LAYERS.CORE;
  if (t < 0.42) return CORE_LAYERS.INNER;
  if (t < 0.78) return CORE_LAYERS.OUTER;

  return CORE_LAYERS.HALO;
}

export function getInfinityCoreTarget(particle, index = 0) {
  const cx = state.width / 2;
  const cy = state.height / 2;
  const unit = Math.min(state.width, state.height);

  const phase =
    particle.layerPhase +
    state.hue * 0.002 +
    index * 0.0009;

  const band = particle.layerBand ?? 0.5;

  if (particle.layer === CORE_LAYERS.CORE) {
    const radius = unit * (0.018 + band * 0.055);

    return {
      x: cx + Math.cos(phase * 1.7) * radius,
      y: cy + Math.sin(phase * 1.3) * radius * 0.72,
      pull: 0.026,
      orbit: 0.036,
      drag: 0.992
    };
  }

  if (particle.layer === CORE_LAYERS.INNER) {
    const radius = unit * (0.095 + band * 0.12);

    const figureEightX = Math.sin(phase) * radius;
    const figureEightY = Math.sin(phase * 2) * radius * 0.36;

    return {
      x: cx + figureEightX,
      y: cy + figureEightY,
      pull: 0.016,
      orbit: 0.024,
      drag: 0.99
    };
  }

  if (particle.layer === CORE_LAYERS.OUTER) {
    const radius = unit * (0.22 + band * 0.18);

    const wobble = Math.sin(phase * 3 + band * 6) * unit * 0.018;

    return {
      x: cx + Math.cos(phase) * (radius + wobble),
      y: cy + Math.sin(phase) * (radius * 0.52 + wobble),
      pull: 0.009,
      orbit: 0.018,
      drag: 0.988
    };
  }

  const radius = unit * (0.46 + band * 0.42);

  return {
    x: cx + Math.cos(phase * 0.45) * radius,
    y: cy + Math.sin(phase * 0.45) * radius * 0.62,
    pull: 0.0025,
    orbit: 0.006,
    drag: 0.994
  };
}

import { state } from "./state.js";

export const CORE_LAYERS = {
  CORE: "core",
  INNER: "inner",
  OUTER: "outer",
  HALO: "halo"
};

export function assignCoreLayer(index, total) {
  const t = index / total;

  if (t < 0.12) return CORE_LAYERS.CORE;
  if (t < 0.38) return CORE_LAYERS.INNER;
  if (t < 0.72) return CORE_LAYERS.OUTER;

  return CORE_LAYERS.HALO;
}

export function getInfinityCoreTarget(particle, index = 0) {
  const cx = state.width / 2;
  const cy = state.height / 2;
  const unit = Math.min(state.width, state.height);

  const time = state.hue * 0.0012;
  const band = particle.layerBand ?? 0.5;

  const phase =
    particle.layerPhase +
    time +
    index * 0.00042;

  if (particle.layer === CORE_LAYERS.CORE) {
    const radius = unit * (0.012 + band * 0.038);

    return {
      x: cx + Math.cos(phase * 1.4) * radius,
      y: cy + Math.sin(phase * 1.1) * radius * 0.62,
      pull: 0.032,
      orbit: 0.026,
      drag: 0.994
    };
  }

  if (particle.layer === CORE_LAYERS.INNER) {
    const radius = unit * (0.11 + band * 0.15);

    const figureEightX = Math.sin(phase * 0.82) * radius;
    const figureEightY = Math.sin(phase * 1.64) * radius * 0.32;

    const driftX = Math.cos(phase * 0.21) * unit * 0.018;
    const driftY = Math.sin(phase * 0.17) * unit * 0.012;

    return {
      x: cx + figureEightX + driftX,
      y: cy + figureEightY + driftY,
      pull: 0.015,
      orbit: 0.018,
      drag: 0.992
    };
  }

  if (particle.layer === CORE_LAYERS.OUTER) {
    const radius = unit * (0.28 + band * 0.24);

    const wobble =
      Math.sin(phase * 2.2 + band * 8) *
      unit *
      0.028;

    return {
      x: cx + Math.cos(phase * 0.72) * (radius + wobble),
      y: cy + Math.sin(phase * 0.72) * (radius * 0.46 + wobble),
      pull: 0.0072,
      orbit: 0.011,
      drag: 0.991
    };
  }

  const radius = unit * (0.62 + band * 0.58);

  return {
    x: cx + Math.cos(phase * 0.28) * radius,
    y: cy + Math.sin(phase * 0.28) * radius * 0.58,
    pull: 0.0015,
    orbit: 0.0035,
    drag: 0.996
  };
}
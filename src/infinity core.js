export const CORE_LAYERS = {
  CORE: "core",
  INNER: "inner",
  OUTER: "outer",
  HALO: "halo"
};

export function assignCoreLayer(index, total) {
  const t = index / total;

  if (t < 0.15) return CORE_LAYERS.CORE;
  if (t < 0.45) return CORE_LAYERS.INNER;
  if (t < 0.80) return CORE_LAYERS.OUTER;

  return CORE_LAYERS.HALO;
}

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

  if (scene === "saturn") return getSaturnRail(particle, index);
  if (scene === "cube") return getCubeRail(particle, index);
  if (scene === "wave") return getWaveRail(particle, index);
  if (scene === "reveal") return getInfinityRail(particle, index);
  if (scene === "disturbed") return getDisturbedRail(particle, index);

  return getDormantRail(particle, index);
}

function getBaseValues(particle, index) {
  const cx = state.width / 2;
  const cy = state.height / 2;
  const unit = Math.min(state.width, state.height);
  const phone = isSmallScreen();

  const scale = phone ? 0.7 : 0.96;
  const time = state.hue * 0.00034;

  const lane = particle.shapeLane || "background";
  const role = particle.role || "field";

  const phase =
    (particle.pathPhase ?? 0) +
    time +
    index * 0.00007;

  const band = particle.pathBand ?? 0.5;
  const bias = particle.pathBias ?? 0.5;

  const laneOffset =
    lane === "primary"
      ? 0
      : lane === "secondary"
        ? 1
        : lane === "accent"
          ? -1
          : lane === "core"
            ? 0
            : 2;

  const laneScale =
    lane === "core"
      ? 0.32
      : lane === "primary"
        ? 1
        : lane === "secondary"
          ? 1.18
          : lane === "accent"
            ? 0.92
            : 1.45;

  return {
    cx,
    cy,
    unit,
    phone,
    scale,
    lane,
    role,
    phase,
    band,
    bias,
    laneOffset,
    laneScale
  };
}

function targetResponse({ x, y, pull, orbit, drag, path, lock = 1 }) {
  return { x, y, pull, orbit, drag, path, lock };
}

function rotatePoint(x, y, tilt) {
  return {
    x: x * Math.cos(tilt) - y * Math.sin(tilt),
    y: x * Math.sin(tilt) + y * Math.cos(tilt)
  };
}

function getRailPosition(t, length = 1) {
  return ((t % length) + length) % length;
}

/* -------------------------------- */
/* DEFAULT / DORMANT                */
/* -------------------------------- */

function getDormantRail(particle, index) {
  const { lane } = getBaseValues(particle, index);

  if (lane === "core") return getCoreWell(particle, index);
  if (lane === "primary") return getInfinityRail(particle, index);
  if (lane === "secondary") return getSaturnRail(particle, index);
  if (lane === "accent") return getInfinityRail(particle, index);

  return getAtmosphere(particle, index);
}

function getCoreWell(particle, index) {
  const { cx, cy, unit, scale, phase, band, lane } =
    getBaseValues(particle, index);

  const radius =
    unit *
    scale *
    (lane === "core" ? 0.025 + band * 0.055 : 0.045 + band * 0.08);

  return targetResponse({
    x: cx + Math.cos(phase * 0.45) * radius,
    y: cy + Math.sin(phase * 0.36) * radius * 0.55,
    pull: lane === "core" ? 0.04 : 0.018,
    orbit: 0.004,
    drag: 0.9982,
    path: "well",
    lock: lane === "core" ? 2.2 : 1
  });
}

function getAtmosphere(particle, index) {
  const { cx, cy, unit, scale, phase, band, laneScale } =
    getBaseValues(particle, index);

  const radius =
    unit *
    scale *
    laneScale *
    (0.2 + band * 0.28);

  return targetResponse({
    x: cx + Math.cos(phase * 0.045) * radius,
    y: cy + Math.sin(phase * 0.045) * radius * 0.52,
    pull: 0.0007,
    orbit: 0.0005,
    drag: 0.999,
    path: "atmosphere",
    lock: 0.25
  });
}

/* -------------------------------- */
/* SATURN RAIL                      */
/* -------------------------------- */

function getSaturnRail(particle, index) {
  const { cx, cy, unit, scale, phase, band, lane, laneOffset, laneScale } =
    getBaseValues(particle, index);

  if (lane === "core") return getCoreWell(particle, index);

  const baseRadius =
    unit *
    scale *
    (0.23 + band * 0.08) *
    laneScale;

  const railThickness =
    unit *
    scale *
    (lane === "primary"
      ? 0.003
      : lane === "secondary"
        ? 0.012
        : lane === "accent"
          ? 0.001
          : 0.025);

  const t = phase * 0.18 + particle.pathBias * Math.PI * 2;

  const x =
    Math.cos(t) *
    (baseRadius + Math.cos(t * 3.2 + band * 6) * railThickness);

  const y =
    Math.sin(t) *
    (baseRadius * 0.22 + Math.sin(t * 2.7 + band * 5) * railThickness);

  const tilt = -0.02;
  const p = rotatePoint(x, y, tilt);

  return targetResponse({
    x: cx + p.x,
    y: cy + p.y + laneOffset * railThickness * 1.6,
    pull: lane === "primary" ? 0.055 : lane === "secondary" ? 0.026 : 0.012,
    orbit: 0.0025,
    drag: 0.999,
    path: "saturn",
    lock: lane === "primary" ? 3.4 : 1.5
  });
}

/* -------------------------------- */
/* CUBE RAIL                        */
/* -------------------------------- */

function getCubeRail(particle, index) {
  const { cx, cy, unit, scale, phase, band, lane, laneOffset, laneScale } =
    getBaseValues(particle, index);

  if (lane === "core") return getCoreWell(particle, index);

  const size =
    unit *
    scale *
    (0.2 + band * 0.06) *
    laneScale;

  const railT = getRailPosition(
    phase * 0.1 + particle.pathBias * 4,
    4
  );

  const side = Math.floor(railT);
  const local = railT - side;

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

  const cornerDistance = Math.min(local, 1 - local);
  const cornerSnap = Math.pow(1 - cornerDistance * 2, 6);

  if (lane === "accent") {
    x += Math.sign(x || 1) * cornerSnap * size * 0.12;
    y += Math.sign(y || 1) * cornerSnap * size * 0.12;
  }

  const perspective = 0.58;
  const tilt = -0.18;

  const projected = rotatePoint(x, y * perspective, tilt);

  return targetResponse({
    x: cx + projected.x,
    y: cy + projected.y + laneOffset * unit * scale * 0.014,
    pull: lane === "primary" ? 0.06 : lane === "secondary" ? 0.028 : 0.014,
    orbit: 0.0012,
    drag: 0.999,
    path: "cube",
    lock: lane === "primary" ? 3.8 : 1.6
  });
}

/* -------------------------------- */
/* WAVE RAIL                        */
/* -------------------------------- */

function getWaveRail(particle, index) {
  const { cx, cy, unit, scale, phase, band, lane, laneOffset, laneScale } =
    getBaseValues(particle, index);

  if (lane === "core") return getCoreWell(particle, index);

  const width =
    unit *
    scale *
    (0.44 + band * 0.14) *
    (lane === "background" ? 1.15 : 1);

  const amplitude =
    unit *
    scale *
    (0.055 + band * 0.055) *
    (lane === "primary" ? 1 : 0.8);

  const t =
    (Math.sin(phase * 0.1 + particle.pathBias * Math.PI * 2) + 1) / 2;

  const x = -width / 2 + width * t;

  const y =
    Math.sin(t * Math.PI * 2 + phase * 0.07) * amplitude +
    Math.cos(t * Math.PI * 4 + phase * 0.04) * amplitude * 0.32 +
    ((t - 0.5) * (t - 0.5) - 0.1) * amplitude * 1.4 +
    laneOffset * unit * scale * 0.055;

  const p = rotatePoint(x, y, -0.07);

  return targetResponse({
    x: cx + p.x,
    y: cy + p.y,
    pull: lane === "primary" ? 0.052 : lane === "secondary" ? 0.024 : 0.01,
    orbit: 0.0018,
    drag: 0.999,
    path: "wave",
    lock: lane === "primary" ? 3.2 : 1.4
  });
}

/* -------------------------------- */
/* INFINITY RAIL / REVEAL           */
/* -------------------------------- */

function getInfinityRail(particle, index) {
  const { cx, cy, unit, scale, phase, band, lane, laneOffset, laneScale } =
    getBaseValues(particle, index);

  if (lane === "core") return getCoreWell(particle, index);

  const size =
    unit *
    scale *
    (0.22 + band * 0.08) *
    laneScale;

  const t = phase * 0.16 + particle.pathBias * Math.PI * 2;
  const denominator = 1 + Math.sin(t) * Math.sin(t);

  const x = (size * Math.cos(t)) / denominator;
  const y = (size * Math.sin(t) * Math.cos(t) * 0.62) / denominator;

  const p = rotatePoint(x, y, 0.025);

  return targetResponse({
    x: cx + p.x,
    y: cy + p.y + laneOffset * unit * scale * 0.01,
    pull: lane === "primary" ? 0.056 : lane === "secondary" ? 0.024 : 0.012,
    orbit: 0.0022,
    drag: 0.999,
    path: "infinity",
    lock: lane === "primary" ? 3.5 : 1.5
  });
}

/* -------------------------------- */
/* DISTURBED RAIL                   */
/* -------------------------------- */

function getDisturbedRail(particle, index) {
  const base = getInfinityRail(particle, index);
  const { unit, scale, phase, band, lane } = getBaseValues(particle, index);

  const jitter =
    unit *
    scale *
    (0.02 + band * 0.055) *
    (lane === "accent" ? 2 : lane === "primary" ? 1.1 : 0.7);

  return targetResponse({
    x: base.x + Math.sin(phase * 2.8) * jitter,
    y: base.y + Math.cos(phase * 2.1) * jitter * 0.8,
    pull: base.pull * 0.74,
    orbit: base.orbit * 2.2,
    drag: 0.998,
    path: "disturbed",
    lock: lane === "primary" ? 1.5 : 0.8
  });
}
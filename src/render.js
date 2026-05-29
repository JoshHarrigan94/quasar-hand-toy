import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { getTheme } from "./themes.js";

export function clearCanvas() {
  const ctx = state.ctx;
  const theme = getTheme(state.theme);

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, state.width, state.height);
}

export function drawCore() {
  const ctx = state.ctx;
  const theme = getTheme(state.theme);

  const cx = state.width / 2;
  const cy = state.height / 2;

  const radius = Math.min(state.width, state.height) * 0.27;

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

  gradient.addColorStop(0, theme.coreA);
  gradient.addColorStop(0.08, theme.coreB);
  gradient.addColorStop(0.34, theme.coreC);
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function drawParticle(particle) {
  const ctx = state.ctx;

  const dx = particle.x - state.width / 2;
  const dy = particle.y - state.height / 2;

  const dist = Math.hypot(dx, dy);

  const glow = Math.max(
    0,
    1 - dist / (Math.min(state.width, state.height) * 0.58)
  );

  const speed = Math.min(
    1,
    Math.hypot(particle.vx, particle.vy) / 12
  );

  const twinkle = 0.75 + Math.sin(particle.pulse) * 0.25;

  const particleHue =
    state.hue +
    particle.depth * 70 +
    glow * 60 +
    speed * 40;

  const alpha =
    (0.16 +
      particle.depth * 0.35 +
      glow * 0.35 +
      speed * 0.18) *
    twinkle;

  ctx.beginPath();

  ctx.fillStyle = `hsla(${particleHue}, 100%, ${
    58 + glow * 24 + speed * 10
  }%, ${alpha})`;

  ctx.arc(
    particle.x,
    particle.y,
    particle.size * particle.depth * (particle.spark ? 2 : 1),
    0,
    Math.PI * 2
  );

  ctx.fill();

  if (speed > 0.45 || particle.spark) {
    ctx.beginPath();

    ctx.strokeStyle = `hsla(${particleHue}, 100%, 75%, ${
      alpha * 0.38
    })`;

    ctx.lineWidth = particle.size * 0.55;

    ctx.moveTo(particle.x, particle.y);

    ctx.lineTo(
      particle.x - particle.vx * 2.4,
      particle.y - particle.vy * 2.4
    );

    ctx.stroke();
  }
}

export function drawPointerGlow() {
  const pointer = state.pointer;
  const ctx = state.ctx;

  if (!pointer.active) return;

  const radius =
    pointer.source === "hand"
      ? 150
      : pointer.down
        ? 175
        : 112;

  const gradient = ctx.createRadialGradient(
    pointer.x,
    pointer.y,
    0,
    pointer.x,
    pointer.y,
    radius
  );

  gradient.addColorStop(0, "rgba(255,255,255,0.28)");
  gradient.addColorStop(0.22, "rgba(125,211,252,0.17)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (pointer.source === "hand") {
    ctx.beginPath();

    ctx.strokeStyle = pointer.down
      ? "rgba(255,255,255,0.85)"
      : "rgba(255,255,255,0.45)";

    ctx.lineWidth = pointer.down ? 2.5 : 1.5;

    ctx.arc(
      pointer.x,
      pointer.y,
      pointer.down ? 18 : 12,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }
}

export function drawShockwaves() {
  const ctx = state.ctx;

  for (let i = state.shockwaves.length - 1; i >= 0; i--) {
    const wave = state.shockwaves[i];

    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,255,255,${wave.alpha})`;
    ctx.lineWidth = 2;
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    ctx.stroke();

    wave.radius += wave.speed;
    wave.alpha *= 0.92;

    if (wave.alpha < 0.015) {
      state.shockwaves.splice(i, 1);
    }
  }
}

export function drawComets() {
  const ctx = state.ctx;

  for (let i = state.comets.length - 1; i >= 0; i--) {
    const comet = state.comets[i];

    comet.x += comet.vx;
    comet.y += comet.vy;
    comet.life *= 0.985;

    ctx.beginPath();

    ctx.strokeStyle = `hsla(${state.hue + comet.hueOffset}, 100%, 75%, ${
      comet.life * 0.38
    })`;

    ctx.lineWidth = 2;

    ctx.moveTo(comet.x, comet.y);

    ctx.lineTo(
      comet.x - comet.vx * 10,
      comet.y - comet.vy * 10
    );

    ctx.stroke();

    if (
      comet.life < 0.05 ||
      comet.x < -160 ||
      comet.x > state.width + 160 ||
      comet.y > state.height + 160
    ) {
      state.comets.splice(i, 1);
    }
  }
}

export function renderFrame() {
  const ctx = state.ctx;

  clearCanvas();

  drawCore();
  drawPointerGlow();
  drawShockwaves();
  drawComets();

  ctx.globalCompositeOperation = "lighter";

  for (const particle of state.particles) {
    drawParticle(particle);
  }

  ctx.globalCompositeOperation = "source-over";
}

export function advanceHue() {
  state.hue +=
    state.mode === "storm"
      ? CONFIG.visuals.stormHueSpeed
      : CONFIG.visuals.normalHueSpeed;
}

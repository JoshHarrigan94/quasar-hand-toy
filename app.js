const canvas = document.getElementById("quasarCanvas");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

let particles = [];
let shockwaves = [];
let mode = "pull";
let hue = 190;
let lastTap = 0;

const pointer = {
  x: 0,
  y: 0,
  prevX: 0,
  prevY: 0,
  vx: 0,
  vy: 0,
  active: false,
  down: false,
  strength: 0
};

const config = {
  particleCount: window.innerWidth < 700 ? 2200 : 4400,
  coreGravity: 0.0017,
  orbitStrength: 0.019,
  drag: 0.986,
  pointerRadius: 210
};

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createParticles();
}

function createParticles() {
  particles = [];

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) * 0.45;

  for (let i = 0; i < config.particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.pow(Math.random(), 0.55) * maxRadius;

    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * 0.62;

    const tangent = angle + Math.PI / 2;
    const speed = 0.25 + Math.random() * 1.5;

    particles.push({
      x,
      y,
      vx: Math.cos(tangent) * speed,
      vy: Math.sin(tangent) * speed,
      size: 0.7 + Math.random() * 1.9,
      depth: 0.35 + Math.random() * 0.95,
      spark: Math.random() > 0.985
    });
  }
}

function setMode(nextMode) {
  mode = nextMode;

  document.querySelectorAll("button[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  pulseAt(pointer.x || width / 2, pointer.y || height / 2, 0.7);
}

function pulseAt(x, y, strength = 1) {
  shockwaves.push({
    x,
    y,
    radius: 8,
    alpha: 0.55 * strength,
    speed: 9 + strength * 8
  });
}

function explode(x = width / 2, y = height / 2, power = 16) {
  pulseAt(x, y, 1.4);

  for (const p of particles) {
    const dx = p.x - x;
    const dy = p.y - y;
    const dist = Math.hypot(dx, dy) || 1;
    const force = Math.min(power, 1100 / dist);

    p.vx += (dx / dist) * force * (0.7 + p.depth);
    p.vy += (dy / dist) * force * (0.7 + p.depth);
  }
}

function implode(x = width / 2, y = height / 2, power = 11) {
  pulseAt(x, y, 1);

  for (const p of particles) {
    const dx = x - p.x;
    const dy = y - p.y;
    const dist = Math.hypot(dx, dy) || 1;
    const force = Math.min(power, 850 / dist);

    p.vx += (dx / dist) * force * (0.5 + p.depth);
    p.vy += (dy / dist) * force * (0.5 + p.depth);
  }
}

function fling() {
  const speed = Math.hypot(pointer.vx, pointer.vy);
  if (speed < 12) return;

  pulseAt(pointer.x, pointer.y, 1);

  for (const p of particles) {
    const dx = pointer.x - p.x;
    const dy = pointer.y - p.y;
    const dist = Math.hypot(dx, dy) || 1;

    if (dist < 260) {
      const influence = 1 - dist / 260;
      p.vx += pointer.vx * 0.045 * influence;
      p.vy += pointer.vy * 0.045 * influence;
    }
  }
}

function updateParticle(p) {
  const cx = width / 2;
  const cy = height / 2;

  const dx = cx - p.x;
  const dy = cy - p.y;
  const dist = Math.hypot(dx, dy) || 1;

  const nx = dx / dist;
  const ny = dy / dist;
  const tx = -ny;
  const ty = nx;

  p.vx += nx * config.coreGravity * dist * p.depth;
  p.vy += ny * config.coreGravity * dist * p.depth;

  p.vx += tx * config.orbitStrength * p.depth;
  p.vy += ty * config.orbitStrength * p.depth;

  if (pointer.active) {
    const pdx = pointer.x - p.x;
    const pdy = pointer.y - p.y;
    const pdist = Math.hypot(pdx, pdy) || 1;

    if (pdist < config.pointerRadius) {
      const influence = 1 - pdist / config.pointerRadius;
      const force = influence * (pointer.down ? 1.55 : 0.78) * p.depth;

      const px = pdx / pdist;
      const py = pdy / pdist;

      if (mode === "pull") {
        p.vx += px * force * 1.05;
        p.vy += py * force * 1.05;
      }

      if (mode === "push") {
        p.vx -= px * force * 1.32;
        p.vy -= py * force * 1.32;
      }

      if (mode === "spin") {
        p.vx += -py * force * 1.8;
        p.vy += px * force * 1.8;
      }

      if (mode === "storm") {
        p.vx += -py * force * 1.1;
        p.vy += px * force * 1.1;
        p.vx -= px * force * 0.9;
        p.vy -= py * force * 0.9;
      }

      if (mode === "calm") {
        p.vx *= 0.925;
        p.vy *= 0.925;
      }
    }
  }

  p.vx *= config.drag;
  p.vy *= config.drag;

  p.x += p.vx;
  p.y += p.vy;

  if (p.x < -100 || p.x > width + 100 || p.y < -100 || p.y > height + 100) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * Math.min(width, height) * 0.13;

    p.x = cx + Math.cos(angle) * radius;
    p.y = cy + Math.sin(angle) * radius;
    p.vx *= -0.25;
    p.vy *= -0.25;
  }
}

function drawParticle(p) {
  const dx = p.x - width / 2;
  const dy = p.y - height / 2;
  const dist = Math.hypot(dx, dy);
  const glow = Math.max(0, 1 - dist / (Math.min(width, height) * 0.58));

  const speed = Math.min(1, Math.hypot(p.vx, p.vy) / 12);
  const particleHue = hue + p.depth * 70 + glow * 60 + speed * 40;
  const alpha = 0.18 + p.depth * 0.36 + glow * 0.35 + speed * 0.18;

  ctx.beginPath();
  ctx.fillStyle = `hsla(${particleHue}, 100%, ${58 + glow * 24 + speed * 10}%, ${alpha})`;
  ctx.arc(p.x, p.y, p.size * p.depth * (p.spark ? 1.8 : 1), 0, Math.PI * 2);
  ctx.fill();

  if (speed > 0.45 || p.spark) {
    ctx.beginPath();
    ctx.strokeStyle = `hsla(${particleHue}, 100%, 75%, ${alpha * 0.35})`;
    ctx.lineWidth = p.size * 0.55;
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2);
    ctx.stroke();
  }
}

function drawCore() {
  const cx = width / 2;
  const cy = height / 2;

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.25);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.08, "rgba(125,211,252,0.45)");
  gradient.addColorStop(0.34, "rgba(168,85,247,0.14)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.min(width, height) * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

function drawPointerGlow() {
  if (!pointer.active) return;

  const radius = pointer.down ? 165 : 110;
  const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);

  gradient.addColorStop(0, "rgba(255,255,255,0.26)");
  gradient.addColorStop(0.22, "rgba(125,211,252,0.16)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawShockwaves() {
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const w = shockwaves[i];

    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,255,255,${w.alpha})`;
    ctx.lineWidth = 2;
    ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
    ctx.stroke();

    w.radius += w.speed;
    w.alpha *= 0.92;

    if (w.alpha < 0.015) {
      shockwaves.splice(i, 1);
    }
  }
}

function loop() {
  ctx.fillStyle = "rgba(2, 6, 23, 0.16)";
  ctx.fillRect(0, 0, width, height);

  hue += mode === "storm" ? 0.7 : 0.18;

  drawCore();
  drawPointerGlow();
  drawShockwaves();

  ctx.globalCompositeOperation = "lighter";

  for (const p of particles) {
    updateParticle(p);
    drawParticle(p);
  }

  ctx.globalCompositeOperation = "source-over";

  pointer.vx *= 0.88;
  pointer.vy *= 0.88;

  requestAnimationFrame(loop);
}

function updatePointer(clientX, clientY) {
  pointer.prevX = pointer.x || clientX;
  pointer.prevY = pointer.y || clientY;

  pointer.x = clientX;
  pointer.y = clientY;

  pointer.vx = pointer.x - pointer.prevX;
  pointer.vy = pointer.y - pointer.prevY;

  pointer.active = true;
}

window.addEventListener("resize", resize);

window.addEventListener("mousemove", (event) => {
  updatePointer(event.clientX, event.clientY);
});

window.addEventListener("mousedown", (event) => {
  pointer.down = true;
  updatePointer(event.clientX, event.clientY);
});

window.addEventListener("mouseup", () => {
  pointer.down = false;
  fling();
});

window.addEventListener("mouseleave", () => {
  pointer.active = false;
  pointer.down = false;
});

window.addEventListener("dblclick", (event) => {
  explode(event.clientX, event.clientY, 18);
});

window.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.touches[0];
    if (!touch) return;

    const now = Date.now();

    updatePointer(touch.clientX, touch.clientY);
    pointer.down = true;

    if (now - lastTap < 280) {
      explode(touch.clientX, touch.clientY, 18);
    }

    lastTap = now;
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    updatePointer(touch.clientX, touch.clientY);
  },
  { passive: true }
);

window.addEventListener("touchend", () => {
  pointer.down = false;
  fling();
});

document.querySelectorAll("button[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "1") setMode("pull");
  if (event.key === "2") setMode("push");
  if (event.key === "3") setMode("spin");
  if (event.key === "4") setMode("calm");
  if (event.key === "5") setMode("storm");

  if (event.key === " ") {
    explode(pointer.x || width / 2, pointer.y || height / 2, 18);
  }

  if (event.key.toLowerCase() === "i") {
    implode(pointer.x || width / 2, pointer.y || height / 2, 12);
  }
});

resize();
loop();
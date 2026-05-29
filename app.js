const canvas = document.getElementById("quasarCanvas");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

let particles = [];
let mode = "pull";
let hue = 190;
let lastTap = 0;

const pointer = {
  x: 0,
  y: 0,
  active: false,
  down: false,
  strength: 0
};

const config = {
  particleCount: window.innerWidth < 700 ? 1800 : 3600,
  coreGravity: 0.0018,
  orbitStrength: 0.018,
  drag: 0.985,
  pointerRadius: 190
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
  const maxRadius = Math.min(width, height) * 0.42;

  for (let i = 0; i < config.particleCount; i++) {
    const t = i / config.particleCount;
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.pow(Math.random(), 0.55) * maxRadius;

    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * 0.62;

    const tangent = angle + Math.PI / 2;
    const speed = 0.25 + t * 1.4;

    particles.push({
      x,
      y,
      vx: Math.cos(tangent) * speed,
      vy: Math.sin(tangent) * speed,
      size: 0.7 + Math.random() * 1.8,
      life: Math.random(),
      depth: 0.35 + Math.random() * 0.95,
      angleOffset: Math.random() * Math.PI * 2
    });
  }
}

function setMode(nextMode) {
  mode = nextMode;

  document.querySelectorAll("button[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
}

function explode(x = width / 2, y = height / 2, power = 14) {
  for (const p of particles) {
    const dx = p.x - x;
    const dy = p.y - y;
    const dist = Math.hypot(dx, dy) || 1;
    const force = Math.min(power, 900 / dist);

    p.vx += (dx / dist) * force * (0.7 + p.depth);
    p.vy += (dy / dist) * force * (0.7 + p.depth);
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
      const force = influence * (pointer.down ? 1.35 : 0.7) * p.depth;

      const px = pdx / pdist;
      const py = pdy / pdist;

      if (mode === "pull") {
        p.vx += px * force * 0.95;
        p.vy += py * force * 0.95;
      }

      if (mode === "push") {
        p.vx -= px * force * 1.2;
        p.vy -= py * force * 1.2;
      }

      if (mode === "spin") {
        p.vx += -py * force * 1.4;
        p.vy += px * force * 1.4;
      }

      if (mode === "calm") {
        p.vx *= 0.94;
        p.vy *= 0.94;
      }
    }
  }

  p.vx *= config.drag;
  p.vy *= config.drag;

  p.x += p.vx;
  p.y += p.vy;

  if (p.x < -80 || p.x > width + 80 || p.y < -80 || p.y > height + 80) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * Math.min(width, height) * 0.12;

    p.x = cx + Math.cos(angle) * radius;
    p.y = cy + Math.sin(angle) * radius;
    p.vx *= -0.2;
    p.vy *= -0.2;
  }
}

function drawParticle(p) {
  const dx = p.x - width / 2;
  const dy = p.y - height / 2;
  const dist = Math.hypot(dx, dy);
  const glow = Math.max(0, 1 - dist / (Math.min(width, height) * 0.56));

  const particleHue = hue + p.depth * 70 + glow * 60;
  const alpha = 0.22 + p.depth * 0.38 + glow * 0.35;

  ctx.beginPath();
  ctx.fillStyle = `hsla(${particleHue}, 100%, ${58 + glow * 24}%, ${alpha})`;
  ctx.arc(p.x, p.y, p.size * p.depth, 0, Math.PI * 2);
  ctx.fill();
}

function drawCore() {
  const cx = width / 2;
  const cy = height / 2;

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.24);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.08, "rgba(125,211,252,0.45)");
  gradient.addColorStop(0.34, "rgba(168,85,247,0.14)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.min(width, height) * 0.24, 0, Math.PI * 2);
  ctx.fill();
}

function drawPointerGlow() {
  if (!pointer.active) return;

  const radius = pointer.down ? 150 : 100;
  const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);

  gradient.addColorStop(0, "rgba(255,255,255,0.24)");
  gradient.addColorStop(0.25, "rgba(125,211,252,0.15)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  ctx.fillStyle = "rgba(2, 6, 23, 0.18)";
  ctx.fillRect(0, 0, width, height);

  hue += 0.16;

  drawCore();
  drawPointerGlow();

  ctx.globalCompositeOperation = "lighter";

  for (const p of particles) {
    updateParticle(p);
    drawParticle(p);
  }

  ctx.globalCompositeOperation = "source-over";

  requestAnimationFrame(loop);
}

function updatePointer(clientX, clientY) {
  pointer.x = clientX;
  pointer.y = clientY;
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
  if (event.key === " ") explode(pointer.x || width / 2, pointer.y || height / 2, 18);
});

resize();
loop();
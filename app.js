const canvas = document.getElementById("quasarCanvas");
const ctx = canvas.getContext("2d");

const statusText = document.getElementById("statusText");
const gestureText = document.getElementById("gestureText");
const energyText = document.getElementById("energyText");
const energyFill = document.getElementById("energyFill");
const resetBtn = document.getElementById("resetBtn");
const pauseBtn = document.getElementById("pauseBtn");
const cameraBtn = document.getElementById("cameraBtn");
const cameraFeed = document.getElementById("cameraFeed");
const handStatus = document.getElementById("handStatus");

let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

let particles = [];
let shockwaves = [];
let comets = [];

let mode = "pull";
let theme = "quasar";
let hue = 190;
let lastTap = 0;
let paused = false;
let energy = 100;

let hands = null;
let camera = null;
let cameraActive = false;
let handSeenAt = 0;
let lastGesture = "Touch / Mouse";
let lastAutoPowerAt = 0;

const pointer = {
  x: 0,
  y: 0,
  prevX: 0,
  prevY: 0,
  vx: 0,
  vy: 0,
  active: false,
  down: false,
  source: "touch"
};

const handState = {
  previousX: 0,
  previousY: 0,
  speed: 0,
  stillFrames: 0,
  lastSwipeAt: 0
};

const themes = {
  quasar: {
    baseHue: 190,
    coreA: "rgba(255,255,255,0.95)",
    coreB: "rgba(125,211,252,0.45)",
    coreC: "rgba(168,85,247,0.16)",
    bg: "rgba(2, 6, 23, 0.15)"
  },
  ember: {
    baseHue: 24,
    coreA: "rgba(255,255,255,0.92)",
    coreB: "rgba(251,146,60,0.52)",
    coreC: "rgba(239,68,68,0.17)",
    bg: "rgba(12, 4, 2, 0.15)"
  },
  ocean: {
    baseHue: 176,
    coreA: "rgba(255,255,255,0.9)",
    coreB: "rgba(45,212,191,0.46)",
    coreC: "rgba(59,130,246,0.16)",
    bg: "rgba(1, 8, 18, 0.15)"
  },
  aurora: {
    baseHue: 128,
    coreA: "rgba(255,255,255,0.9)",
    coreB: "rgba(134,239,172,0.42)",
    coreC: "rgba(217,70,239,0.15)",
    bg: "rgba(2, 8, 12, 0.15)"
  }
};

const config = {
  particleCount: window.innerWidth < 700 ? 2400 : 5200,
  coreGravity: 0.00162,
  orbitStrength: 0.02,
  drag: 0.986,
  pointerRadius: 220
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
  const maxRadius = Math.min(width, height) * 0.46;

  for (let i = 0; i < config.particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.pow(Math.random(), 0.52) * maxRadius;

    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * 0.62;

    const tangent = angle + Math.PI / 2;
    const speed = 0.22 + Math.random() * 1.55;

    particles.push({
      x,
      y,
      vx: Math.cos(tangent) * speed,
      vy: Math.sin(tangent) * speed,
      size: 0.65 + Math.random() * 1.9,
      depth: 0.32 + Math.random() * 1,
      spark: Math.random() > 0.982,
      pulse: Math.random() * Math.PI * 2
    });
  }
}

function setMode(nextMode, silent = false) {
  mode = nextMode;

  document.querySelectorAll("button[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  if (!silent) {
    const labels = {
      pull: "Gravity well engaged.",
      push: "Repulsion field active.",
      spin: "Orbital torque online.",
      storm: "Storm field unstable.",
      calm: "Stabilising particle flow."
    };

    statusText.textContent = labels[mode] || "Bend the galaxy.";
    pulseAt(pointer.x || width / 2, pointer.y || height / 2, 0.7);
  }
}

function setGesture(text) {
  if (lastGesture === text) return;
  lastGesture = text;
  gestureText.textContent = text;
}

function setTheme(nextTheme) {
  theme = nextTheme;
  hue = themes[theme].baseHue;

  document.querySelectorAll("button[data-theme]").forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === theme);
  });

  statusText.textContent = `${theme[0].toUpperCase()}${theme.slice(1)} field loaded.`;
  pulseAt(width / 2, height / 2, 1);
}

function spendEnergy(amount) {
  energy = Math.max(0, energy - amount);
}

function recoverEnergy() {
  const rate = mode === "calm" ? 0.16 : 0.07;
  energy = Math.min(100, energy + rate);
}

function updateEnergyUI() {
  const rounded = Math.round(energy);
  energyText.textContent = `${rounded}%`;
  energyFill.style.width = `${rounded}%`;
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

function spawnComet() {
  if (Math.random() > 0.018) return;

  const fromLeft = Math.random() > 0.5;
  comets.push({
    x: fromLeft ? -60 : width + 60,
    y: Math.random() * height * 0.7,
    vx: fromLeft ? 7 + Math.random() * 5 : -7 - Math.random() * 5,
    vy: 1 + Math.random() * 2,
    life: 1,
    hueOffset: Math.random() * 80
  });
}

function explode(x = width / 2, y = height / 2, power = 16) {
  if (energy < 12) return;

  spendEnergy(12);
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
  if (energy < 10) return;

  spendEnergy(10);
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
  if (speed < 12 || energy < 5) return;

  spendEnergy(5);
  pulseAt(pointer.x, pointer.y, 1);

  for (const p of particles) {
    const dx = pointer.x - p.x;
    const dy = pointer.y - p.y;
    const dist = Math.hypot(dx, dy) || 1;

    if (dist < 280) {
      const influence = 1 - dist / 280;
      p.vx += pointer.vx * 0.05 * influence;
      p.vy += pointer.vy * 0.05 * influence;
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
      const energyScale = 0.45 + energy / 100;
      const force = influence * (pointer.down ? 1.55 : 0.78) * p.depth * energyScale;

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

  p.pulse += 0.04;
  p.vx *= config.drag;
  p.vy *= config.drag;

  p.x += p.vx;
  p.y += p.vy;

  if (p.x < -120 || p.x > width + 120 || p.y < -120 || p.y > height + 120) {
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
  const twinkle = 0.75 + Math.sin(p.pulse) * 0.25;
  const particleHue = hue + p.depth * 70 + glow * 60 + speed * 40;
  const alpha = (0.16 + p.depth * 0.35 + glow * 0.35 + speed * 0.18) * twinkle;

  ctx.beginPath();
  ctx.fillStyle = `hsla(${particleHue}, 100%, ${58 + glow * 24 + speed * 10}%, ${alpha})`;
  ctx.arc(p.x, p.y, p.size * p.depth * (p.spark ? 2 : 1), 0, Math.PI * 2);
  ctx.fill();

  if (speed > 0.45 || p.spark) {
    ctx.beginPath();
    ctx.strokeStyle = `hsla(${particleHue}, 100%, 75%, ${alpha * 0.38})`;
    ctx.lineWidth = p.size * 0.55;
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 2.4, p.y - p.vy * 2.4);
    ctx.stroke();
  }
}

function drawCore() {
  const cx = width / 2;
  const cy = height / 2;
  const t = themes[theme];

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.27);
  gradient.addColorStop(0, t.coreA);
  gradient.addColorStop(0.08, t.coreB);
  gradient.addColorStop(0.34, t.coreC);
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.min(width, height) * 0.27, 0, Math.PI * 2);
  ctx.fill();
}

function drawPointerGlow() {
  if (!pointer.active) return;

  const radius = pointer.source === "hand" ? 150 : pointer.down ? 175 : 112;
  const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);

  gradient.addColorStop(0, "rgba(255,255,255,0.28)");
  gradient.addColorStop(0.22, "rgba(125,211,252,0.17)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (pointer.source === "hand") {
    ctx.beginPath();
    ctx.strokeStyle = pointer.down ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)";
    ctx.lineWidth = pointer.down ? 2.5 : 1.5;
    ctx.arc(pointer.x, pointer.y, pointer.down ? 18 : 12, 0, Math.PI * 2);
    ctx.stroke();
  }
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

function drawComets() {
  for (let i = comets.length - 1; i >= 0; i--) {
    const c = comets[i];

    c.x += c.vx;
    c.y += c.vy;
    c.life *= 0.985;

    ctx.beginPath();
    ctx.strokeStyle = `hsla(${hue + c.hueOffset}, 100%, 75%, ${c.life * 0.38})`;
    ctx.lineWidth = 2;
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x - c.vx * 10, c.y - c.vy * 10);
    ctx.stroke();

    if (c.life < 0.05 || c.x < -160 || c.x > width + 160 || c.y > height + 160) {
      comets.splice(i, 1);
    }
  }
}

function loop() {
  if (paused) {
    requestAnimationFrame(loop);
    return;
  }

  ctx.fillStyle = themes[theme].bg;
  ctx.fillRect(0, 0, width, height);

  hue += mode === "storm" ? 0.7 : 0.18;

  recoverEnergy();
  updateEnergyUI();
  spawnComet();

  if (cameraActive && Date.now() - handSeenAt > 900 && pointer.source === "hand") {
    pointer.active = false;
    pointer.down = false;
    handStatus.textContent = "Searching for hand...";
    handStatus.classList.remove("active");
    setGesture("Searching...");
  }

  drawCore();
  drawPointerGlow();
  drawShockwaves();
  drawComets();

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

function updatePointer(clientX, clientY, source = "touch") {
  pointer.prevX = pointer.x || clientX;
  pointer.prevY = pointer.y || clientY;

  pointer.x = clientX;
  pointer.y = clientY;

  pointer.vx = pointer.x - pointer.prevX;
  pointer.vy = pointer.y - pointer.prevY;

  pointer.active = true;
  pointer.source = source;

  if (pointer.down && mode !== "calm") {
    spendEnergy(0.04);
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function countExtendedFingers(landmarks) {
  const tips = [8, 12, 16, 20];
  const pips = [6, 10, 14, 18];

  let count = 0;

  for (let i = 0; i < tips.length; i++) {
    if (landmarks[tips[i]].y < landmarks[pips[i]].y) {
      count++;
    }
  }

  return count;
}

function interpretHandGesture(landmarks, mappedX, mappedY) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const wrist = landmarks[0];

  const pinchDistance = distance(thumbTip, indexTip);
  const extendedFingers = countExtendedFingers(landmarks);

  const dx = mappedX - (handState.previousX || mappedX);
  const dy = mappedY - (handState.previousY || mappedY);
  const speed = Math.hypot(dx, dy);

  handState.speed = speed;
  handState.previousX = mappedX;
  handState.previousY = mappedY;

  if (speed < 3) {
    handState.stillFrames++;
  } else {
    handState.stillFrames = 0;
  }

  const wristToIndex = distance(wrist, indexTip);
  const isPinching = pinchDistance < 0.055;
  const isOpenHand = extendedFingers >= 4;
  const isFistLike = extendedFingers <= 1 && wristToIndex < 0.28;
  const isSwipe = speed > 42;

  if (isSwipe && Date.now() - handState.lastSwipeAt > 500) {
    handState.lastSwipeAt = Date.now();
    setGesture("Fast swipe");
    setMode("storm", true);
    fling();
    pulseAt(mappedX, mappedY, 1);
    return "swipe";
  }

  if (isPinching) {
    setGesture("Pinch / Grab");
    setMode("pull", true);
    pointer.down = true;
    return "pinch";
  }

  if (isFistLike && Date.now() - lastAutoPowerAt > 900) {
    lastAutoPowerAt = Date.now();
    setGesture("Fist / Smash");
    explode(mappedX, mappedY, 16);
    pointer.down = false;
    return "fist";
  }

  if (handState.stillFrames > 32) {
    setGesture("Still / Calm");
    setMode("calm", true);
    pointer.down = false;
    return "still";
  }

  if (isOpenHand) {
    setGesture("Open hand / Push");
    setMode("push", true);
    pointer.down = false;
    return "open";
  }

  setGesture("Point / Guide");
  pointer.down = false;
  return "point";
}

function handleHandResults(results) {
  if (!results.multiHandLandmarks || !results.multiHandLandmarks.length) {
    return;
  }

  const landmarks = results.multiHandLandmarks[0];
  const indexTip = landmarks[8];

  const mappedX = (1 - indexTip.x) * width;
  const mappedY = indexTip.y * height;

  updatePointer(mappedX, mappedY, "hand");

  const gesture = interpretHandGesture(landmarks, mappedX, mappedY);

  handSeenAt = Date.now();
  handStatus.textContent = `Hand detected: ${gesture}`;
  handStatus.classList.add("active");
}

async function startCamera() {
  if (cameraActive) return;

  if (!window.Hands || !window.Camera) {
    statusText.textContent = "Hand tracking library not loaded.";
    handStatus.textContent = "MediaPipe unavailable";
    return;
  }

  statusText.textContent = "Starting camera...";

  hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.65,
    minTrackingConfidence: 0.65
  });

  hands.onResults(handleHandResults);

  camera = new Camera(cameraFeed, {
    onFrame: async () => {
      await hands.send({ image: cameraFeed });
    },
    width: 640,
    height: 480
  });

  try {
    await camera.start();

    cameraActive = true;
    cameraBtn.classList.add("active");
    cameraBtn.textContent = "Camera On";
    cameraFeed.classList.add("active");
    handStatus.textContent = "Searching for hand...";
    statusText.textContent = "Camera active. Show your hand.";
    setGesture("Searching...");
  } catch (error) {
    console.error(error);
    statusText.textContent = "Camera permission blocked.";
    handStatus.textContent = "Camera unavailable";
  }
}

window.addEventListener("resize", resize);

window.addEventListener("mousemove", (event) => {
  if (pointer.source === "hand" && cameraActive) return;
  setGesture("Mouse guide");
  updatePointer(event.clientX, event.clientY, "mouse");
});

window.addEventListener("mousedown", (event) => {
  if (pointer.source === "hand" && cameraActive) return;
  setGesture("Mouse pull");
  pointer.down = true;
  updatePointer(event.clientX, event.clientY, "mouse");
});

window.addEventListener("mouseup", () => {
  if (pointer.source === "hand" && cameraActive) return;
  pointer.down = false;
  fling();
});

window.addEventListener("mouseleave", () => {
  if (pointer.source === "hand" && cameraActive) return;
  pointer.active = false;
  pointer.down = false;
});

window.addEventListener("dblclick", (event) => {
  setGesture("Explosion");
  explode(event.clientX, event.clientY, 18);
});

window.addEventListener(
  "touchstart",
  (event) => {
    if (pointer.source === "hand" && cameraActive) return;

    const touch = event.touches[0];
    if (!touch) return;

    const now = Date.now();

    setGesture("Touch pull");
    updatePointer(touch.clientX, touch.clientY, "touch");
    pointer.down = true;

    if (now - lastTap < 280) {
      setGesture("Touch explosion");
      explode(touch.clientX, touch.clientY, 18);
    }

    lastTap = now;
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    if (pointer.source === "hand" && cameraActive) return;

    const touch = event.touches[0];
    if (!touch) return;

    updatePointer(touch.clientX, touch.clientY, "touch");
  },
  { passive: true }
);

window.addEventListener("touchend", () => {
  if (pointer.source === "hand" && cameraActive) return;
  pointer.down = false;
  fling();
});

document.querySelectorAll("button[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
    setGesture(`${button.textContent} mode`);
  });
});

document.querySelectorAll("button[data-theme]").forEach((button) => {
  button.addEventListener("click", () => {
    setTheme(button.dataset.theme);
  });
});

cameraBtn.addEventListener("click", startCamera);

resetBtn.addEventListener("click", () => {
  createParticles();
  energy = 100;
  pulseAt(width / 2, height / 2, 1.2);
  statusText.textContent = "Particle field reset.";
  setGesture("Reset field");
});

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  statusText.textContent = paused ? "Simulation paused." : "Simulation resumed.";
  setGesture(paused ? "Paused" : "Resumed");
});

window.addEventListener("keydown", (event) => {
  if (event.key === "1") setMode("pull");
  if (event.key === "2") setMode("push");
  if (event.key === "3") setMode("spin");
  if (event.key === "4") setMode("calm");
  if (event.key === "5") setMode("storm");

  if (event.key === " ") {
    setGesture("Explosion");
    explode(pointer.x || width / 2, pointer.y || height / 2, 18);
  }

  if (event.key.toLowerCase() === "i") {
    setGesture("Implosion");
    implode(pointer.x || width / 2, pointer.y || height / 2, 12);
  }

  if (event.key.toLowerCase() === "r") {
    createParticles();
    energy = 100;
    pulseAt(width / 2, height / 2, 1.2);
    setGesture("Reset field");
  }
});

resize();
loop();
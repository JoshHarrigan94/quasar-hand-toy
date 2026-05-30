import { state, loadArtifactMemory, saveArtifactMemory } from "./state.js";
import { CONFIG } from "./config.js";
import { createParticles } from "./particles.js";
import { renderFrame, advanceHue } from "./render.js";
import { updatePhysics } from "./physics.js";
import { updateEnergyUI, initialiseUiText, bindUiControls } from "./ui.js";
import { bindInputControls } from "./input.js";
import { startCamera, checkHandLost } from "./handTracking.js";

function cacheDomElements() {
  state.ui.statusText = document.getElementById("statusText");
  state.ui.gestureText = document.getElementById("gestureText");

  state.ui.energyText = document.getElementById("energyText");
  state.ui.energyFill = document.getElementById("energyFill");

  state.ui.handStatus = document.getElementById("handStatus");

  state.ui.cameraBtn = document.getElementById("cameraBtn");
  state.ui.pauseBtn = document.getElementById("pauseBtn");
  state.ui.resetBtn = document.getElementById("resetBtn");

  state.ui.cameraFeed = document.getElementById("cameraFeed");
  
  state.ui.sceneBtn = document.getElementById("sceneBtn");
  state.ui.gravityBtn = document.getElementById("gravityBtn");
}

function setupCanvas() {
  state.canvas = document.getElementById("quasarCanvas");
  state.ctx = state.canvas.getContext("2d");
}

function resizeCanvas() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;

  state.dpr = Math.min(
    window.devicePixelRatio || 1,
    CONFIG.particles.maxDevicePixelRatio
  );

  state.canvas.width = state.width * state.dpr;
  state.canvas.height = state.height * state.dpr;

  state.canvas.style.width = `${state.width}px`;
  state.canvas.style.height = `${state.height}px`;

  state.ctx.setTransform(
    state.dpr,
    0,
    0,
    state.dpr,
    0,
    0
  );
}

function loop() {
  if (!state.paused) {
    advanceHue();
    updatePhysics();
    updateEnergyUI();
    checkHandLost();
    renderFrame();
  }

  requestAnimationFrame(loop);
}

function startApplication() {
  loadArtifactMemory();

  state.memory.totalVisits += 1;
  state.memory.lastVisitAt = Date.now();

  cacheDomElements();
  setupCanvas();
  resizeCanvas();
  createParticles();

  initialiseUiText();
  bindUiControls({ onCameraStart: startCamera });
  bindInputControls();

    saveArtifactMemory();

  console.log("∞ Infinity Core Started");
  console.log(state);

  loop();

  window.addEventListener("resize", () => {
    resizeCanvas();
    createParticles();
  });
}

startApplication();
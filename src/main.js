import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { createParticles } from "./particles.js";

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

function initialiseUi() {
  if (state.ui.statusText) {
    state.ui.statusText.textContent = "Engine Initialised";
  }

  if (state.ui.gestureText) {
    state.ui.gestureText.textContent = "Waiting";
  }

  if (state.ui.energyText) {
    state.ui.energyText.textContent = "100%";
  }

  if (state.ui.energyFill) {
    state.ui.energyFill.style.width = "100%";
  }

  if (state.ui.handStatus) {
    state.ui.handStatus.textContent = "Hand tracking off";
  }
}

function startApplication() {
  cacheDomElements();

  setupCanvas();

  resizeCanvas();

createParticles();

initialiseUi();

  console.log("🚀 Quasar Engine Started");
  console.log(state);

  window.addEventListener("resize", () => {
  resizeCanvas();
  createParticles();
});
}

startApplication();

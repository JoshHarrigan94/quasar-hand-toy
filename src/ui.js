import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { createParticles } from "./particles.js";
import { pulseAt } from "./physics.js";

export function setMode(nextMode, silent = false) {
  state.mode = nextMode;

  document.querySelectorAll("button[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });

  if (!silent) {
    const labels = {
      pull: "Collapse field engaged.",
      push: "Expansion field active.",
      spin: "Rotational influence online.",
      storm: "Gravity wave disturbance.",
      calm: "Stillness field stabilising."
    };

    state.ui.statusText.textContent =
      labels[state.mode] || "The artifact responds.";

    pulseAt(
      state.pointer.x || state.width / 2,
      state.pointer.y || state.height / 2,
      0.7
    );
  }
}

export function setGesture(text) {
  if (state.lastGesture === text) return;

  state.lastGesture = text;

  if (state.ui.gestureText) {
    state.ui.gestureText.textContent = text;
  }
}

export function updateEnergyUI() {
  const rounded = Math.round(state.energy);

  if (state.ui.energyText) {
    state.ui.energyText.textContent = `${rounded}%`;
  }

  if (state.ui.energyFill) {
    state.ui.energyFill.style.width = `${rounded}%`;
  }
}

export function resetField() {
  createParticles();

  state.energy = CONFIG.energy.max;

  pulseAt(state.width / 2, state.height / 2, 1.2);

  if (state.ui.statusText) {
    state.ui.statusText.textContent = "The field reforms.";
  }

  setGesture("Reset field");
}

export function togglePause() {
  state.paused = !state.paused;

  if (state.ui.pauseBtn) {
    state.ui.pauseBtn.textContent = state.paused ? "Resume" : "Pause";
  }

  if (state.ui.statusText) {
    state.ui.statusText.textContent =
      state.paused ? "The artifact is held still." : "The artifact resumes.";
  }

  setGesture(state.paused ? "Paused" : "Resumed");
}

export function toggleInterface() {
  const shell = document.getElementById("interfaceShell");
  const toggle = document.getElementById("uiToggle");

  if (!shell || !toggle) return;

  const collapsed = shell.classList.toggle("collapsed");

  toggle.textContent = collapsed ? "Open" : "Observatory";
  toggle.setAttribute("aria-expanded", String(!collapsed));
}

export function markHandTrackingActive(message = "Searching for hand...") {
  if (state.ui.cameraBtn) {
    state.ui.cameraBtn.classList.add("active");
    state.ui.cameraBtn.textContent = "Camera On";
  }

  if (state.ui.cameraFeed) {
    state.ui.cameraFeed.classList.add("active");
  }

  if (state.ui.handStatus) {
    state.ui.handStatus.textContent = message;
    state.ui.handStatus.classList.remove("active");
  }
}

export function markHandDetected(message = "Hand detected") {
  if (!state.ui.handStatus) return;

  state.ui.handStatus.textContent = message;
  state.ui.handStatus.classList.add("active");
}

export function markHandLost() {
  if (!state.ui.handStatus) return;

  state.ui.handStatus.textContent = "Searching for hand...";
  state.ui.handStatus.classList.remove("active");

  setGesture("Searching...");
}

export function initialiseUiText() {
  if (state.ui.statusText) {
    state.ui.statusText.textContent =
      "An impossible object suspended in the void.";
  }

  if (state.ui.gestureText) {
    state.ui.gestureText.textContent = state.lastGesture;
  }

  updateEnergyUI();

  if (state.ui.handStatus) {
    state.ui.handStatus.textContent = "Hand tracking off";
  }

  const toggle = document.getElementById("uiToggle");
  if (toggle) {
    toggle.setAttribute("aria-expanded", "true");
  }
}

export function bindUiControls({ onCameraStart } = {}) {
  document.querySelectorAll("button[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const modeMap = {
        Collapse: "pull",
        Expand: "push",
        Rotate: "spin",
        Disturb: "storm",
        Stillness: "calm"
      };

      setMode(button.dataset.mode);
      setGesture(`${button.textContent} influence`);
    });
  });

  if (state.ui.resetBtn) {
    state.ui.resetBtn.addEventListener("click", resetField);
  }

  if (state.ui.pauseBtn) {
    state.ui.pauseBtn.addEventListener("click", togglePause);
  }

  if (state.ui.cameraBtn && onCameraStart) {
    state.ui.cameraBtn.addEventListener("click", onCameraStart);
  }

  const uiToggle = document.getElementById("uiToggle");

  if (uiToggle) {
    uiToggle.addEventListener("click", toggleInterface);
  }
}
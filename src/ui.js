import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { createParticles } from "./particles.js";
import { pulseAt } from "./physics.js";

let autoCollapseTimer = null;

export function setMode(nextMode, silent = false) {
  state.mode = nextMode;

  document.querySelectorAll("button[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });

  noteUiInteraction();

  if (!silent) {
    updateArtifactStatus();
    pulseAt(
      state.pointer.x || state.width / 2,
      state.pointer.y || state.height / 2,
      0.7
    );
  }
}

export function updateArtifactStatus() {
  const label = state.artifact?.stateLabel || "Dormant";

  const copy = {
    Dormant: "Dormant. Suspended in the void.",
    Listening: "Listening. The field has noticed you.",
    Awake: "Awake. The core is responding.",
    Compressed: "Compressed. Matter is folding inward.",
    Expanded: "Expanded. The halo is opening.",
    Unstable: "Unstable. Gravity waves are moving through it."
  };

  if (state.ui.statusText) {
    state.ui.statusText.textContent = copy[label] || copy.Dormant;
  }

  const artifactStateText = document.getElementById("artifactStateText");

  if (artifactStateText) {
    artifactStateText.textContent = label;
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

  updateArtifactStatus();
}

export function resetField() {
  createParticles();

  state.energy = CONFIG.energy.max;

  if (state.artifact) {
    state.artifact.awakeLevel = 0;
    state.artifact.disturbance = 0;
    state.artifact.pressure = 0;
    state.artifact.openness = 0;
    state.artifact.pulse = 0;
    state.artifact.stateLabel = "Dormant";
  }

  pulseAt(state.width / 2, state.height / 2, 1.2);

  updateArtifactStatus();
  setGesture("Reformed");
  noteUiInteraction();
}

export function togglePause() {
  state.paused = !state.paused;

  if (state.ui.pauseBtn) {
    state.ui.pauseBtn.textContent = state.paused ? "Resume" : "Suspend";
  }

  if (state.ui.statusText) {
    state.ui.statusText.textContent =
      state.paused ? "Held outside time." : "Time resumes around it.";
  }

  setGesture(state.paused ? "Suspended" : "Resumed");
  noteUiInteraction();
}

export function collapseInterface() {
  const shell = document.getElementById("interfaceShell");
  const toggle = document.getElementById("uiToggle");

  if (!shell || !toggle) return;

  shell.classList.add("collapsed");
  toggle.textContent = "Open";
  toggle.setAttribute("aria-expanded", "false");
}

export function openInterface() {
  const shell = document.getElementById("interfaceShell");
  const toggle = document.getElementById("uiToggle");

  if (!shell || !toggle) return;

  shell.classList.remove("collapsed");
  toggle.textContent = "Observatory";
  toggle.setAttribute("aria-expanded", "true");

  scheduleAutoCollapse();
}

export function toggleInterface() {
  const shell = document.getElementById("interfaceShell");

  if (!shell) return;

  if (shell.classList.contains("collapsed")) {
    openInterface();
  } else {
    collapseInterface();
  }
}

export function scheduleAutoCollapse() {
  clearTimeout(autoCollapseTimer);

  autoCollapseTimer = setTimeout(() => {
    collapseInterface();
  }, 10000);
}

export function noteUiInteraction() {
  scheduleAutoCollapse();
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

  noteUiInteraction();
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
  updateArtifactStatus();

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

  scheduleAutoCollapse();
}

export function bindUiControls({ onCameraStart } = {}) {
  document.querySelectorAll("button[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      setMode(button.dataset.mode);
      setGesture(`${button.textContent} influence`);
      noteUiInteraction();
    });
  });

  if (state.ui.resetBtn) {
    state.ui.resetBtn.addEventListener("click", resetField);
  }

  if (state.ui.pauseBtn) {
    state.ui.pauseBtn.addEventListener("click", togglePause);
  }

  if (state.ui.cameraBtn && onCameraStart) {
    state.ui.cameraBtn.addEventListener("click", () => {
      onCameraStart();
      noteUiInteraction();
    });
  }

  const uiToggle = document.getElementById("uiToggle");

  if (uiToggle) {
    uiToggle.addEventListener("click", () => {
      toggleInterface();
    });
  }

  const shell = document.getElementById("interfaceShell");

  if (shell) {
    shell.addEventListener("pointerdown", noteUiInteraction);
    shell.addEventListener("mousemove", noteUiInteraction);
  }
}
import { state } from "./state.js";
import { CONFIG } from "./config.js";
import {
  setMode,
  setGesture,
  resetField,
  toggleInterface,
  openInterface,
  collapseInterface
} from "./ui.js";
import { explode, implode, fling, spendEnergy } from "./physics.js";

export function updatePointer(clientX, clientY, source = "touch") {
  const pointer = state.pointer;

  pointer.prevX = pointer.x || clientX;
  pointer.prevY = pointer.y || clientY;

  pointer.x = clientX;
  pointer.y = clientY;

  pointer.vx = pointer.x - pointer.prevX;
  pointer.vy = pointer.y - pointer.prevY;

  pointer.active = true;
  pointer.source = source;

  if (pointer.down && state.mode !== "calm") {
    spendEnergy(CONFIG.energy.touchDrainRate);
  }
}

export function bindInputControls() {
  window.addEventListener("mousemove", (event) => {
    if (state.pointer.source === "hand" && state.cameraActive) return;

    setGesture("Guiding");
    updatePointer(event.clientX, event.clientY, "mouse");
  });

  window.addEventListener("mousedown", (event) => {
    if (state.pointer.source === "hand" && state.cameraActive) return;

    setGesture("Collapsing matter");
    state.pointer.down = true;

    updatePointer(event.clientX, event.clientY, "mouse");
  });

  window.addEventListener("mouseup", () => {
    if (state.pointer.source === "hand" && state.cameraActive) return;

    state.pointer.down = false;
    fling();
  });

  window.addEventListener("mouseleave", () => {
    if (state.pointer.source === "hand" && state.cameraActive) return;

    state.pointer.active = false;
    state.pointer.down = false;
  });

  window.addEventListener("dblclick", (event) => {
    setGesture("Pulse wave");
    explode(event.clientX, event.clientY, 14);
  });

  window.addEventListener(
    "touchstart",
    (event) => {
      if (state.pointer.source === "hand" && state.cameraActive) return;

      const touch = event.touches[0];
      if (!touch) return;

      const now = Date.now();

      setGesture("Touching the field");
      updatePointer(touch.clientX, touch.clientY, "touch");

      state.pointer.down = true;

      if (now - state.lastTap < 280) {
        setGesture("Pulse wave");
        explode(touch.clientX, touch.clientY, 14);
      }

      state.lastTap = now;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (state.pointer.source === "hand" && state.cameraActive) return;

      const touch = event.touches[0];
      if (!touch) return;

      updatePointer(touch.clientX, touch.clientY, "touch");
    },
    { passive: true }
  );

  window.addEventListener("touchend", () => {
    if (state.pointer.source === "hand" && state.cameraActive) return;

    state.pointer.down = false;
    fling();
  });

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (event.key === "1") setMode("pull");
    if (event.key === "2") setMode("push");
    if (event.key === "3") setMode("spin");
    if (event.key === "4") setMode("calm");
    if (event.key === "5") setMode("storm");

    if (event.key === " ") {
      event.preventDefault();
      setGesture("Pulse wave");
      explode(
        state.pointer.x || state.width / 2,
        state.pointer.y || state.height / 2,
        14
      );
    }

    if (key === "i") {
      setGesture("Deep collapse");
      implode(
        state.pointer.x || state.width / 2,
        state.pointer.y || state.height / 2,
        12
      );
    }

    if (key === "r") {
      setGesture("Reforming");
      resetField();
    }

    if (key === "h") {
      toggleInterface();
    }

    if (key === "o") {
      openInterface();
    }

    if (key === "escape") {
      collapseInterface();
    }
  });
}
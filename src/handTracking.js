import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { updatePointer } from "./input.js";
import { interpretHandGesture } from "./gestures.js";
import {
  markHandTrackingActive,
  markHandDetected,
  markHandLost,
  setGesture
} from "./ui.js";

export function handleHandResults(results) {
  if (!results.multiHandLandmarks || !results.multiHandLandmarks.length) {
    return;
  }

  const landmarks = results.multiHandLandmarks[0];
  const indexTip = landmarks[8];

  const mappedX = (1 - indexTip.x) * state.width;
  const mappedY = indexTip.y * state.height;

  updatePointer(mappedX, mappedY, "hand");

  const gesture = interpretHandGesture(landmarks, mappedX, mappedY);

  state.handSeenAt = Date.now();

  markHandDetected(`Hand detected: ${gesture}`);
}

export function checkHandLost() {
  if (!state.cameraActive) return;
  if (state.pointer.source !== "hand") return;

  const elapsed = Date.now() - state.handSeenAt;

  if (elapsed <= CONFIG.camera.handLostMs) return;

  state.pointer.active = false;
  state.pointer.down = false;

  markHandLost();
}

export async function startCamera() {
  if (state.cameraActive) return;

  if (!window.Hands || !window.Camera) {
    if (state.ui.statusText) {
      state.ui.statusText.textContent = "Hand tracking library not loaded.";
    }

    if (state.ui.handStatus) {
      state.ui.handStatus.textContent = "MediaPipe unavailable";
    }

    return;
  }

  if (state.ui.statusText) {
    state.ui.statusText.textContent = "Starting camera...";
  }

  state.mediaPipe.hands = new window.Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  state.mediaPipe.hands.setOptions({
    maxNumHands: CONFIG.camera.maxHands,
    modelComplexity: CONFIG.camera.modelComplexity,
    minDetectionConfidence: CONFIG.camera.minDetectionConfidence,
    minTrackingConfidence: CONFIG.camera.minTrackingConfidence
  });

  state.mediaPipe.hands.onResults(handleHandResults);

  state.mediaPipe.camera = new window.Camera(state.ui.cameraFeed, {
    onFrame: async () => {
      await state.mediaPipe.hands.send({
        image: state.ui.cameraFeed
      });
    },
    width: CONFIG.camera.width,
    height: CONFIG.camera.height
  });

  try {
    await state.mediaPipe.camera.start();

    state.cameraActive = true;

    markHandTrackingActive("Searching for hand...");

    if (state.ui.statusText) {
      state.ui.statusText.textContent = "Camera active. Show your hand.";
    }

    setGesture("Searching...");
  } catch (error) {
    console.error(error);

    if (state.ui.statusText) {
      state.ui.statusText.textContent = "Camera permission blocked.";
    }

    if (state.ui.handStatus) {
      state.ui.handStatus.textContent = "Camera unavailable";
    }
  }
}

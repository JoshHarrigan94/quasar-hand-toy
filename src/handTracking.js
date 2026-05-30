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
  if (!state.cameraActive) return;

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

  if (state.ui.cameraBtn) {
    state.ui.cameraBtn.textContent = "Starting...";
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
      if (!state.cameraActive && state.mediaPipe?.camera) return;

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
    state.handSeenAt = Date.now();

    markHandTrackingActive("Searching for hand...");

    if (state.ui.statusText) {
      state.ui.statusText.textContent = "Camera active. Show your hand.";
    }

    if (state.ui.cameraBtn) {
      state.ui.cameraBtn.textContent = "Stop Camera";
      state.ui.cameraBtn.classList.add("active");
    }

    setGesture("Searching...");
  } catch (error) {
    console.error(error);

    state.cameraActive = false;

    if (state.ui.statusText) {
      state.ui.statusText.textContent = "Camera permission blocked.";
    }

    if (state.ui.handStatus) {
      state.ui.handStatus.textContent = "Camera unavailable";
    }

    if (state.ui.cameraBtn) {
      state.ui.cameraBtn.textContent = "Start Camera";
      state.ui.cameraBtn.classList.remove("active");
    }
  }
}

export async function shutdownHandCamera() {
  state.cameraActive = false;
  state.pointer.source = "touch";
  state.pointer.active = false;
  state.pointer.down = false;

  if (state.mediaPipe?.camera) {
    try {
      await state.mediaPipe.camera.stop();
    } catch (error) {
      console.warn("Camera stop warning:", error);
    }

    state.mediaPipe.camera = null;
  }

  if (state.mediaPipe?.hands) {
    try {
      state.mediaPipe.hands.close();
    } catch (error) {
      console.warn("Hands close warning:", error);
    }

    state.mediaPipe.hands = null;
  }

  if (state.ui.cameraFeed?.srcObject) {
    const tracks = state.ui.cameraFeed.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    state.ui.cameraFeed.srcObject = null;
  }

  if (state.ui.cameraFeed) {
    state.ui.cameraFeed.classList.remove("active");
  }

  if (state.ui.handStatus) {
    state.ui.handStatus.textContent = "Hand tracking off";
    state.ui.handStatus.classList.remove("active");
  }

  if (state.ui.cameraBtn) {
    state.ui.cameraBtn.textContent = "Start Camera";
    state.ui.cameraBtn.classList.remove("active");
  }

  setGesture("Touch / Mouse");
}

window.stopInfinityCamera = shutdownHandCamera;
import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { setMode, setGesture } from "./ui.js";
import { explode, fling, pulseAt } from "./physics.js";

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function countExtendedFingers(landmarks) {
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

export function interpretHandGesture(landmarks, mappedX, mappedY) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const wrist = landmarks[0];

  const pinchDistance = distance(thumbTip, indexTip);
  const extendedFingers = countExtendedFingers(landmarks);

  const dx = mappedX - (state.handState.previousX || mappedX);
  const dy = mappedY - (state.handState.previousY || mappedY);

  const speed = Math.hypot(dx, dy);

  state.handState.speed = speed;
  state.handState.previousX = mappedX;
  state.handState.previousY = mappedY;

  if (speed < CONFIG.gestures.stillSpeed) {
    state.handState.stillFrames++;
  } else {
    state.handState.stillFrames = 0;
  }

  const wristToIndex = distance(wrist, indexTip);

  const isPinching = pinchDistance < CONFIG.gestures.pinchDistance;
  const isOpenHand = extendedFingers >= 4;
  const isFistLike =
    extendedFingers <= 1 &&
    wristToIndex < CONFIG.gestures.fistWristToIndex;

  const isSwipe = speed > CONFIG.gestures.swipeSpeed;

  if (
    isSwipe &&
    Date.now() - state.handState.lastSwipeAt > CONFIG.gestures.swipeCooldownMs
  ) {
    state.handState.lastSwipeAt = Date.now();

    setGesture("Gravity wave");
    setMode("storm", true);

    fling();
    pulseAt(mappedX, mappedY, 1.1);

    return "gravity wave";
  }

  if (isPinching) {
    setGesture("Collapse");
    setMode("pull", true);

    state.pointer.down = true;

    return "collapse";
  }

  if (
    isFistLike &&
    Date.now() - state.handState.lastAutoPowerAt > CONFIG.gestures.smashCooldownMs
  ) {
    state.handState.lastAutoPowerAt = Date.now();

    setGesture("Rupture");

    explode(mappedX, mappedY, 14);

    state.pointer.down = false;

    return "rupture";
  }

  if (state.handState.stillFrames > CONFIG.gestures.stillFrames) {
    setGesture("Stillness");
    setMode("calm", true);

    state.pointer.down = false;

    return "stillness";
  }

  if (isOpenHand) {
    setGesture("Expansion");
    setMode("push", true);

    state.pointer.down = false;

    return "expansion";
  }

  setGesture("Presence");

  state.pointer.down = false;

  return "presence";
}
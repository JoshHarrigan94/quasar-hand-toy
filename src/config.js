export const CONFIG = {
  particles: {
    mobileCount: 2400,
    desktopCount: 5200,
    maxDevicePixelRatio: 2,
    respawnPadding: 120,
    galaxyRadiusFactor: 0.46,
    verticalCompression: 0.62
  },

  physics: {
    coreGravity: 0.00162,
    orbitStrength: 0.02,
    drag: 0.986,
    pointerRadius: 220,
    flingRadius: 280
  },

  energy: {
    max: 100,
    calmRecoveryRate: 0.16,
    normalRecoveryRate: 0.07,
    touchDrainRate: 0.04,
    explodeCost: 12,
    implodeCost: 10,
    flingCost: 5
  },

  camera: {
    width: 640,
    height: 480,
    maxHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.65,
    minTrackingConfidence: 0.65,
    handLostMs: 900
  },

  gestures: {
    pinchDistance: 0.055,
    swipeSpeed: 42,
    swipeCooldownMs: 500,
    smashCooldownMs: 900,
    stillSpeed: 3,
    stillFrames: 32,
    fistWristToIndex: 0.28
  },

  visuals: {
    baseHue: 190,
    cometSpawnChance: 0.018,
    trailFade: 0.15,
    stormHueSpeed: 0.7,
    normalHueSpeed: 0.18
  }
};

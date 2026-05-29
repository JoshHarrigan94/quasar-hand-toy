export const CONFIG = {
  particles: {
    mobileCount: 2600,
    desktopCount: 5600,
    maxDevicePixelRatio: 2,
    respawnPadding: 180,
    galaxyRadiusFactor: 0.62,
    verticalCompression: 0.58
  },

  physics: {
    coreGravity: 0.00092,
    orbitStrength: 0.012,
    drag: 0.991,
    pointerRadius: 260,
    flingRadius: 340
  },

  structures: {
    enabled: true,
    structurePullMultiplier: 0.72,
    orbitRevealStrength: 0.26,
    guideOpacity: 0.35
  },

  energy: {
    max: 100,
    calmRecoveryRate: 0.14,
    normalRecoveryRate: 0.055,
    touchDrainRate: 0.035,
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
    cometSpawnChance: 0.006,
    trailFade: 0.1,
    stormHueSpeed: 0.38,
    normalHueSpeed: 0.07
  }
};
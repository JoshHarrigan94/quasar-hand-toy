export const CONFIG = {
  particles: {
    mobileCount: 5200,
    desktopCount: 9000,
    maxDevicePixelRatio: 2,
    respawnPadding: 220,
    galaxyRadiusFactor: 0.66,
    verticalCompression: 0.56
  },

  physics: {
    coreGravity: 0.00058,
    orbitStrength: 0.007,
    drag: 0.9945,
    pointerRadius: 255,
    flingRadius: 320
  },

  artifact: {
    awakeDecay: 0.997,
    pulseDecay: 0.945,
    disturbanceDecay: 0.988,
    pressureDecay: 0.986,
    opennessDecay: 0.988,
    calmDecayMultiplier: 0.965,
    sleepDelayMs: 2200
  },

  structures: {
    enabled: true,
    structurePullMultiplier: 0.52,
    orbitRevealStrength: 0.18,
    guideOpacity: 0.16
  },

  energy: {
    max: 100,
    calmRecoveryRate: 0.12,
    normalRecoveryRate: 0.045,
    touchDrainRate: 0.028,
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
    swipeSpeed: 48,
    swipeCooldownMs: 650,
    smashCooldownMs: 1100,
    stillSpeed: 2.4,
    stillFrames: 38,
    fistWristToIndex: 0.28
  },

  visuals: {
    baseHue: 190,
    cometSpawnChance: 0.002,
    trailFade: 0.08,
    stormHueSpeed: 0.16,
    normalHueSpeed: 0.032
  }
};
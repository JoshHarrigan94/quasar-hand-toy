export const state = {
  canvas: null,
  ctx: null,

  width: 0,
  height: 0,
  dpr: 1,

  paused: false,

  hue: 190,

  mode: "pull",

  energy: 100,

  particles: [],
  shockwaves: [],
  comets: [],

scene: {
  current: "dormant",
  transition: 0,
  lastChangeAt: Date.now()
},

  artifact: {
    awakeLevel: 0,
    disturbance: 0,
    pressure: 0,
    openness: 0,
    pulse: 0,
    lastInteractionAt: 0,
    stateLabel: "Dormant"
  },

  presence: {
    breath: 0,
    breathPhase: 0,
    stillness: 0,
    presencePulse: 0,
    lastPresenceEventAt: 0,
    lastInteractionAt: 0,
    revealing: false
  },

  interface: {
    collapsed: false,
    lastInteractionAt: 0,
    autoCollapseMs: 10000
  },

  cameraActive: false,
  handSeenAt: 0,

  lastTap: 0,
  lastGesture: "Touch / Mouse",

  pointer: {
    x: 0,
    y: 0,

    prevX: 0,
    prevY: 0,

    vx: 0,
    vy: 0,

    active: false,
    down: false,

    source: "touch"
  },

  handState: {
    previousX: 0,
    previousY: 0,

    speed: 0,

    stillFrames: 0,

    lastSwipeAt: 0,
    lastAutoPowerAt: 0
  },

  ui: {
  statusText: null,
  gestureText: null,

  energyText: null,
  energyFill: null,

  handStatus: null,

  sceneBtn: null,
  cameraBtn: null,
  pauseBtn: null,
  resetBtn: null,

  cameraFeed: null
},

  mediaPipe: {
    hands: null,
    camera: null
  }

};

export function setScene(sceneName) {
  state.scene.current = sceneName;
  state.scene.transition = 1;
  state.scene.lastChangeAt = Date.now();
}
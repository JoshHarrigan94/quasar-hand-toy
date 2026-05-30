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
  gravityMode: "calm",
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

mind: {
  curiosity: 0.18,
  trust: 0.12,
  calmness: 0.35,
  disturbanceMemory: 0,
  attraction: 0.2,
  loneliness: 0,
  familiarity: 0,
  attention: 0,
  lastMoodShiftAt: Date.now(),
  mood: "distant"
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

  memory: {
  firstSeenAt: Date.now(),
  totalVisits: 0,
  totalInteractionTime: 0,
  totalTouches: 0,
  totalGravityWaves: 0,
  favouriteShape: "dormant",
  favouriteMode: "calm",
  discoveredShapes: ["dormant"],
  lastVisitAt: Date.now()
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
    cameraFeed: null,
    gravityBtn: null
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

export function nudgeMind({
  curiosity = 0,
  trust = 0,
  calmness = 0,
  disturbanceMemory = 0,
  attraction = 0,
  loneliness = 0,
  familiarity = 0,
  attention = 0
} = {}) {
  const mind = state.mind;

  mind.curiosity = clamp01(mind.curiosity + curiosity);
  mind.trust = clamp01(mind.trust + trust);
  mind.calmness = clamp01(mind.calmness + calmness);
  mind.disturbanceMemory = clamp01(mind.disturbanceMemory + disturbanceMemory);
  mind.attraction = clamp01(mind.attraction + attraction);
  mind.loneliness = clamp01(mind.loneliness + loneliness);
  mind.familiarity = clamp01(mind.familiarity + familiarity);
  mind.attention = clamp01(mind.attention + attention);

  updateMindMood();
}

function updateMindMood() {
  const mind = state.mind;

  if (mind.disturbanceMemory > 0.72) {
    mind.mood = "wary";
  } else if (mind.trust > 0.68 && mind.calmness > 0.55) {
    mind.mood = "settled";
  } else if (mind.curiosity > 0.62) {
    mind.mood = "curious";
  } else if (mind.loneliness > 0.62) {
    mind.mood = "distant";
  } else if (mind.attention > 0.5) {
    mind.mood = "listening";
  } else {
    mind.mood = "dormant";
  }

  mind.lastMoodShiftAt = Date.now();
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export function saveArtifactMemory() {
  try {
    localStorage.setItem(
      "artifact-memory",
      JSON.stringify(state.memory)
    );
  } catch (err) {
    console.warn(err);
  }
}

export function loadArtifactMemory() {
  try {
    const saved =
      localStorage.getItem("artifact-memory");

    if (!saved) return;

    Object.assign(
      state.memory,
      JSON.parse(saved)
    );
  } catch (err) {
    console.warn(err);
  }
}
export const THEMES = {
  quasar: {
    name: "Quasar",
    baseHue: 190,
    coreA: "rgba(255,255,255,0.95)",
    coreB: "rgba(125,211,252,0.45)",
    coreC: "rgba(168,85,247,0.16)",
    bg: "rgba(2, 6, 23, 0.15)"
  },

  ember: {
    name: "Ember",
    baseHue: 24,
    coreA: "rgba(255,255,255,0.92)",
    coreB: "rgba(251,146,60,0.52)",
    coreC: "rgba(239,68,68,0.17)",
    bg: "rgba(12, 4, 2, 0.15)"
  },

  ocean: {
    name: "Ocean",
    baseHue: 176,
    coreA: "rgba(255,255,255,0.9)",
    coreB: "rgba(45,212,191,0.46)",
    coreC: "rgba(59,130,246,0.16)",
    bg: "rgba(1, 8, 18, 0.15)"
  },

  aurora: {
    name: "Aurora",
    baseHue: 128,
    coreA: "rgba(255,255,255,0.9)",
    coreB: "rgba(134,239,172,0.42)",
    coreC: "rgba(217,70,239,0.15)",
    bg: "rgba(2, 8, 12, 0.15)"
  }
};

export function getTheme(themeName) {
  return THEMES[themeName] || THEMES.quasar;
}

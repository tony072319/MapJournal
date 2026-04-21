// MapJournal — Editorial palette system
// Three palettes: Dusk (default light), Night (dark), Garden (alt light)
// Bold, pigmented mood colors — not pastels.

export const LightColors = {
  primary: '#E85A2C',       // terracotta accent
  accent: '#1B1815',        // ink as secondary
  background: '#F3EEE4',    // warm cream
  card: '#FFFFFF',
  surface2: '#EBE4D5',
  text: '#1B1815',
  textSecondary: '#6B6357',
  muted: '#A39889',
  border: '#D9D1C1',
  shadow: '#1B1815',
  success: '#7BA05B',
  // map tiles
  mapBg: '#EAE2D2',
  mapLand: '#F3EEE4',
  mapWater: '#CFD9DF',
  mapRoad: '#D9D1C1',
};

export const DarkColors = {
  primary: '#FF6B3D',
  accent: '#F2EDE4',
  background: '#121014',
  card: '#1E1B21',
  surface2: '#2A262D',
  text: '#F2EDE4',
  textSecondary: '#9B9288',
  muted: '#6B6357',
  border: '#2F2B32',
  shadow: '#000000',
  success: '#8FC27A',
  mapBg: '#1A171D',
  mapLand: '#121014',
  mapWater: '#1F2A33',
  mapRoad: '#2F2B32',
};

export const Colors = LightColors;

// Pigmented mood colors — editorial, not pastel
export const MoodColors: Record<string, string> = {
  amazing: '#E85A2C',  // terracotta
  happy:   '#F2A340',  // amber
  good:    '#7BA05B',  // moss
  calm:    '#5B8BA0',  // slate blue
  neutral: '#A39889',  // stone
  anxious: '#C97B4A',  // rust
  sad:     '#6B6AAE',  // indigo
  angry:   '#B94A3D',  // brick
};

export const DarkMoodColors: Record<string, string> = {
  amazing: '#FF6B3D',
  happy:   '#FFB84D',
  good:    '#8FC27A',
  calm:    '#6FA3BF',
  neutral: '#9B9288',
  anxious: '#D99566',
  sad:     '#8B89D1',
  angry:   '#E06A5A',
};

// Type tokens
export const Type = {
  display: 'Georgia',       // iOS: fall back to system serif — swap for 'Source Serif 4' once font is bundled
  displayCn: 'PingFangSC-Semibold',
  ui: 'System',             // SF Pro on iOS, Roboto on Android
  mono: 'Menlo',
};

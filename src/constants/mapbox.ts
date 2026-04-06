// Mapbox 配置
// Token 从环境变量或 .env 文件加载
// 在 .env 文件中设置: MAPBOX_ACCESS_TOKEN=pk.xxx
// 开发时需要创建 .env 文件（已在 .gitignore 中排除）

// 从 expo-constants 获取，或使用空字符串
let token = '';
try {
  // 尝试从 .env 读取（需要 expo 的环境变量支持）
  token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
} catch {
  token = '';
}

export const MAPBOX_TOKEN = token;

// 自定义插画风格的 Mapbox Style JSON
export const ILLUSTRATED_STYLE = {
  version: 8 as const,
  name: 'MapJournal Illustrated',
  sources: {
    'mapbox-streets': {
      type: 'vector' as const,
      url: 'mapbox://mapbox.mapbox-streets-v8',
    },
  },
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      type: 'background' as const,
      paint: { 'background-color': '#FAF7F2' },
    },
    {
      id: 'water',
      type: 'fill' as const,
      source: 'mapbox-streets',
      'source-layer': 'water',
      paint: { 'fill-color': '#C5DCE8', 'fill-opacity': 0.6 },
    },
    {
      id: 'landuse-park',
      type: 'fill' as const,
      source: 'mapbox-streets',
      'source-layer': 'landuse',
      filter: ['==', 'class', 'park'],
      paint: { 'fill-color': '#DAF0D8', 'fill-opacity': 0.5 },
    },
    {
      id: 'building',
      type: 'fill' as const,
      source: 'mapbox-streets',
      'source-layer': 'building',
      paint: { 'fill-color': '#F0EDE6', 'fill-opacity': 0.4, 'fill-outline-color': '#E0DCD4' },
    },
    {
      id: 'road-primary',
      type: 'line' as const,
      source: 'mapbox-streets',
      'source-layer': 'road',
      filter: ['in', 'class', 'primary', 'secondary', 'trunk', 'motorway'],
      paint: { 'line-color': '#E8DFD0', 'line-width': 2.5, 'line-opacity': 0.8 },
      layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
    },
    {
      id: 'road-secondary',
      type: 'line' as const,
      source: 'mapbox-streets',
      'source-layer': 'road',
      filter: ['in', 'class', 'tertiary', 'street', 'service'],
      paint: { 'line-color': '#EDE8DF', 'line-width': 1, 'line-opacity': 0.6 },
      layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
    },
    {
      id: 'place-label',
      type: 'symbol' as const,
      source: 'mapbox-streets',
      'source-layer': 'place_label',
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-font': ['DIN Pro Regular', 'Arial Unicode MS Regular'],
      },
      paint: { 'text-color': '#B0A89A', 'text-halo-color': '#FAF7F2', 'text-halo-width': 1.5 },
    },
  ],
};

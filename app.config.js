const fs = require('fs');
const path = require('path');

// Robust .env loader — handles both UTF-8 and UTF-16 LE (PowerShell default)
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  try {
    const raw = fs.readFileSync(envPath);
    let content;

    // Detect UTF-16 LE BOM (bytes FF FE) — PowerShell's echo/> creates these
    if (raw.length >= 2 && raw[0] === 0xFF && raw[1] === 0xFE) {
      content = raw.toString('utf16le');
    } else {
      content = raw.toString('utf-8');
    }

    // Strip any BOM character and null bytes
    content = content.replace(/^\uFEFF/, '').replace(/\0/g, '');

    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/);
      if (match) {
        process.env[match[1]] = match[2];
      }
    }
  } catch (e) {
    // .env file not found, that's OK
  }
}

loadEnv();

// Log token status so user can verify in terminal
const tokenLoaded = !!process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
console.log(tokenLoaded
  ? '[MapJournal] Mapbox token loaded OK'
  : '[MapJournal] WARNING: Mapbox token not found. Create .env file with: EXPO_PUBLIC_MAPBOX_TOKEN=pk.xxx'
);

module.exports = {
  expo: {
    name: 'MapJournal',
    slug: 'MapJournal',
    version: '2.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: false,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FAF7F2',
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'MapJournal needs your location to mark mood on the map',
        NSCameraUsageDescription: 'MapJournal needs camera to take photos for mood entries',
        NSPhotoLibraryUsageDescription: 'MapJournal needs photo library access to select photos',
        NSMicrophoneUsageDescription: 'MapJournal needs microphone to record voice memos',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FAF7F2',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'RECORD_AUDIO',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-location',
      'expo-image-picker',
      'expo-sqlite',
    ],
    extra: {
      mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '',
    },
  },
};

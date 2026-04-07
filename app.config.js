const fs = require('fs');
const path = require('path');

// Robust .env loader that handles UTF-16 (PowerShell default) and UTF-8
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  try {
    let content = fs.readFileSync(envPath, 'utf-8');
    // Strip UTF-16 BOM and null bytes (PowerShell echo creates UTF-16 files)
    content = content.replace(/\0/g, '').replace(/^\uFEFF/, '').replace(/^\uFFFE/, '');
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

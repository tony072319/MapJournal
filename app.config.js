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
        NSLocationWhenInUseUsageDescription: 'MapJournal需要访问你的位置来在地图上标记心情',
        NSCameraUsageDescription: 'MapJournal需要使用相机来为心情记录拍照',
        NSPhotoLibraryUsageDescription: 'MapJournal需要访问相册来选择照片',
        NSMicrophoneUsageDescription: 'MapJournal需要麦克风来录制语音备忘',
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
      [
        '@rnmapbox/maps',
        {
          RNMapboxMapsImpl: 'mapbox',
          RNMapboxMapsDownloadToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'YOUR_TOKEN',
        },
      ],
    ],
  },
};

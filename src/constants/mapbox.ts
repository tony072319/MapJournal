import Constants from 'expo-constants';

// Read token from app.config.js extra, then fallback to env variable
export const MAPBOX_TOKEN: string =
  Constants.expoConfig?.extra?.mapboxToken ||
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN ||
  '';

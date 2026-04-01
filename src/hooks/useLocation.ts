import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { UserLocation } from '../types';

export const useLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        // 请求定位权限
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setError('需要定位权限才能使用地图功能');
            setLoading(false);
          }
          return;
        }

        // 获取当前位置
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('无法获取当前位置');
          setLoading(false);
        }
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  // 手动刷新位置
  const refreshLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch {
      // 静默失败，保留上次位置
    }
  };

  return { location, error, loading, refreshLocation };
};

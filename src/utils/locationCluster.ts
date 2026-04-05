import { Entry } from '../types';

// Haversine 距离（米）
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // 地球半径（米）
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export interface LocationCluster {
  latitude: number;
  longitude: number;
  address: string | null;
  entries: Entry[];
}

// 将 entries 按位置聚合（半径内视为同一地点）
export const clusterEntriesByLocation = (
  entries: Entry[],
  radiusMeters: number = 150
): LocationCluster[] => {
  const clusters: LocationCluster[] = [];

  entries.forEach((entry) => {
    // 找到距离最近的已有 cluster
    let matched = false;
    for (const cluster of clusters) {
      const dist = haversineDistance(
        entry.latitude, entry.longitude,
        cluster.latitude, cluster.longitude
      );
      if (dist <= radiusMeters) {
        cluster.entries.push(entry);
        // 更新地址（用最新的非空地址）
        if (entry.address && !cluster.address) {
          cluster.address = entry.address;
        }
        matched = true;
        break;
      }
    }

    if (!matched) {
      clusters.push({
        latitude: entry.latitude,
        longitude: entry.longitude,
        address: entry.address,
        entries: [entry],
      });
    }
  });

  // 按 entries 数量降序排列
  return clusters.sort((a, b) => b.entries.length - a.entries.length);
};

// 获取指定位置附近的所有 entries
export const getEntriesNearLocation = (
  entries: Entry[],
  latitude: number,
  longitude: number,
  radiusMeters: number = 200
): Entry[] => {
  return entries.filter((e) =>
    haversineDistance(e.latitude, e.longitude, latitude, longitude) <= radiusMeters
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

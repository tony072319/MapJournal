import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { useEntries } from '../context/EntriesContext';
import { Colors, MoodColors } from '../constants/colors';
import { MapboxWebView } from '../components/MapboxWebView';
import { NewEntrySheet } from '../components/NewEntrySheet';
import { EntryDetail } from '../components/EntryDetail';
import { WelcomeOverlay } from '../components/WelcomeOverlay';
import { QuickRecordPanel } from '../components/QuickRecordPanel';
import { LocationTimeline } from '../components/LocationTimeline';
import { FriendsModal } from '../components/FriendsModal';
import { getEntriesNearLocation, clusterEntriesByLocation } from '../utils/locationCluster';
import { Entry, MoodType } from '../types';
import AsyncStorage from '../utils/storage';
import dayjs from 'dayjs';

/**
 * MAP SCREEN — editorial redesign
 *
 * The map IS the page. Floating elements use a serif-and-mono voice:
 *   - TOP: mono date + italic serif greeting + count pill
 *   - MIDDLE-LEFT: highlighted "moment" callout — tied to a featured pin
 *   - BOTTOM: glass composer with full mood row
 */
export const MapScreen: React.FC = () => {
  const { location, loading, error } = useLocation();
  const { entries } = useEntries();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [locationTimelineEntries, setLocationTimelineEntries] = useState<Entry[]>([]);
  const [locationTimelineName, setLocationTimelineName] = useState<string | null>(null);
  const [showLocationTimeline, setShowLocationTimeline] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  useEffect(() => {
    try {
      const hasLaunched = AsyncStorage.getItem('hasLaunched');
      if (!hasLaunched) setShowWelcome(true);
    } catch {}
  }, []);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    try { AsyncStorage.setItem('hasLaunched', 'true'); } catch {}
  };

  const clusteredMarkers = useMemo(() => {
    if (entries.length === 0) return [];
    const clusters = clusterEntriesByLocation(entries, 150);
    return clusters.map((c) => ({
      id: c.entries[0].id,
      latitude: c.latitude,
      longitude: c.longitude,
      emoji: c.entries[0].emoji,
      moodColor: MoodColors[c.entries[0].mood as MoodType] || Colors.primary,
      count: c.entries.length,
    }));
  }, [entries]);

  const handleMarkerPress = useCallback((id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      const nearby = getEntriesNearLocation(entries, entry.latitude, entry.longitude, 200);
      if (nearby.length > 1) {
        setLocationTimelineEntries(nearby);
        setLocationTimelineName(entry.address);
        setShowLocationTimeline(true);
      } else {
        setSelectedEntry(entry);
      }
    }
  }, [entries]);

  // Greeting based on hour
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return '夜深了';
    if (h < 12) return '早上好';
    if (h < 18) return '下午好';
    return '晚上好';
  }, []);

  // Featured entry = most recent
  const featured = useMemo(() => {
    if (entries.length === 0) return null;
    return [...entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [entries]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>正在获取位置...</Text>
      </View>
    );
  }

  if (error || !location) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>需要位置权限</Text>
        <Text style={styles.errorHint}>请在设置中允许 MapJournal 访问位置信息</Text>
      </View>
    );
  }

  const dateLabel = dayjs().format('ddd · M月D日 · YYYY').toUpperCase();

  return (
    <View style={styles.container}>
      <MapboxWebView
        location={location}
        markers={clusteredMarkers}
        onMarkerPress={handleMarkerPress}
      />

      {/* TOP — editorial header */}
      <View style={styles.topOverlay}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.greeting}>
            <Text style={styles.greetingItalic}>{greeting}</Text>
            <Text style={{ opacity: 0.5 }}>.</Text>
          </Text>
          <Text style={styles.subgreeting}>你现在在哪里？感觉如何？</Text>
        </View>
        {entries.length > 0 && (
          <View style={styles.countPill}>
            <Text style={styles.countNum}>{entries.length}</Text>
            <Text style={styles.countLabel}>记录</Text>
          </View>
        )}
      </View>

      {/* Right-side controls */}
      <View style={styles.sideControls}>
        <TouchableOpacity style={styles.controlBtn} onPress={() => setShowFriends(true)} activeOpacity={0.7}>
          <Text style={styles.controlIcon}>👥</Text>
        </TouchableOpacity>
      </View>

      {/* Featured callout — most recent entry */}
      {featured && (
        <TouchableOpacity
          style={styles.callout}
          onPress={() => setSelectedEntry(featured)}
          activeOpacity={0.9}
        >
          <View style={[styles.calloutBar, { backgroundColor: MoodColors[featured.mood as MoodType] || Colors.primary }]} />
          <View style={styles.calloutBody}>
            <View style={styles.calloutHeader}>
              <Text style={styles.calloutMeta}>
                {dayjs(featured.createdAt).format('H:mm')} · {featured.address || '位置'}
              </Text>
              <Text style={styles.calloutEmoji}>{featured.emoji}</Text>
            </View>
            {featured.note ? (
              <Text style={styles.calloutNote} numberOfLines={2}>
                「{featured.note}」
              </Text>
            ) : (
              <Text style={styles.calloutNote}>最近的一刻</Text>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Composer at bottom */}
      <View style={styles.quickBarContainer}>
        <QuickRecordPanel
          location={location}
          onFullEntry={() => setShowNewEntry(true)}
          onSaved={() => {}}
        />
      </View>

      {showWelcome && <WelcomeOverlay onGetStarted={handleWelcomeClose} />}

      <NewEntrySheet
        visible={showNewEntry}
        onClose={() => setShowNewEntry(false)}
        location={location}
      />

      <LocationTimeline
        entries={locationTimelineEntries}
        locationName={locationTimelineName}
        visible={showLocationTimeline}
        onClose={() => setShowLocationTimeline(false)}
        onEntryPress={(e) => {
          setShowLocationTimeline(false);
          setSelectedEntry(e);
        }}
      />

      <EntryDetail
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />

      <FriendsModal
        visible={showFriends}
        onClose={() => setShowFriends(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.background, padding: 40,
  },
  loadingText: { marginTop: 16, fontSize: 15, color: Colors.textSecondary },
  errorTitle: { fontSize: 18, color: Colors.text, fontWeight: '700', marginBottom: 8 },
  errorHint: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  topOverlay: {
    position: 'absolute', top: 58, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  dateLabel: {
    fontFamily: 'Menlo', fontSize: 10.5, fontWeight: '500',
    color: Colors.textSecondary, letterSpacing: 2.5, marginBottom: 6,
  },
  greeting: {
    fontFamily: 'Georgia', fontSize: 32, color: Colors.text,
    letterSpacing: -0.8, lineHeight: 36,
  },
  greetingItalic: { fontStyle: 'italic' },
  subgreeting: {
    fontSize: 13, color: Colors.textSecondary, marginTop: 4, letterSpacing: -0.1,
  },
  countPill: {
    alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  countNum: {
    fontFamily: 'Georgia', fontSize: 22, fontWeight: '500',
    color: Colors.primary, lineHeight: 24,
  },
  countLabel: {
    fontFamily: 'Menlo', fontSize: 9, color: Colors.textSecondary,
    letterSpacing: 1.5, marginTop: 2,
  },

  sideControls: {
    position: 'absolute', top: 200, right: 16, gap: 6,
  },
  controlBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  controlIcon: { fontSize: 18 },

  callout: {
    position: 'absolute', left: 20, right: 20, top: 370,
    flexDirection: 'row', gap: 12,
    backgroundColor: Colors.card, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20,
    elevation: 6,
  },
  calloutBar: {
    width: 6, borderRadius: 3,
  },
  calloutBody: { flex: 1 },
  calloutHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  calloutMeta: {
    fontFamily: 'Menlo', fontSize: 10,
    color: Colors.textSecondary, letterSpacing: 1.5, flex: 1,
  },
  calloutEmoji: { fontSize: 18 },
  calloutNote: {
    fontFamily: 'Georgia', fontSize: 15.5, color: Colors.text,
    lineHeight: 21, letterSpacing: -0.2,
  },

  quickBarContainer: {
    position: 'absolute', bottom: 8, left: 12, right: 12,
  },
});

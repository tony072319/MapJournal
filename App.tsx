import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { EntriesProvider } from './src/context/EntriesContext';
import { CustomTagsProvider } from './src/context/CustomTagsContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LightColors, DarkColors } from './src/constants/colors';
import { MapScreen } from './src/screens/MapScreen';
import { TimelineScreen } from './src/screens/TimelineScreen';
import { AboutMeScreen } from './src/screens/AboutMeScreen';

type TabName = 'map' | 'timeline' | 'aboutme';

const TABS: { key: TabName; label: string; icon: string }[] = [
  { key: 'map', label: '地图', icon: '🗺️' },
  { key: 'timeline', label: '时间线', icon: '📋' },
  { key: 'aboutme', label: '我的', icon: '👤' },
];

// 内部App — 可以使用 useTheme
function AppInner() {
  const [activeTab, setActiveTab] = useState<TabName>('map');
  const isMapTab = activeTab === 'map';
  const { isDark } = useTheme();
  const colors = isDark ? DarkColors : LightColors;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {isMapTab && (
        <View style={styles.content}>
          <MapScreen />
        </View>
      )}

      {!isMapTab && (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {activeTab === 'timeline' ? '时间线' : '我的'}
            </Text>
          </View>
          <View style={styles.content}>
            {activeTab === 'timeline' && <TimelineScreen />}
            {activeTab === 'aboutme' && <AboutMeScreen />}
          </View>
        </SafeAreaView>
      )}

      {/* Tab bar */}
      <View style={[tabStyles.container, {
        backgroundColor: isDark ? colors.card + 'F8' : 'rgba(255,255,255,0.97)',
        borderTopColor: colors.border,
      }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={tabStyles.tab}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  tabStyles.iconWrap,
                  isActive ? { backgroundColor: colors.primary + '18' } : undefined,
                ]}
              >
                <Text style={tabStyles.icon}>{tab.icon}</Text>
              </View>
              <Text
                style={[
                  tabStyles.label,
                  { color: isActive ? colors.primary : colors.textSecondary },
                  isActive ? { fontWeight: '700' } : undefined,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

export default function App() {
  return (
    <EntriesProvider>
      <CustomTagsProvider>
        <ThemeProvider>
          <AppInner />
        </ThemeProvider>
      </CustomTagsProvider>
    </EntriesProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
});

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconWrap: {
    width: 48,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});

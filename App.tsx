import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { EntriesProvider } from './src/context/EntriesContext';
import { Colors } from './src/constants/colors';
import { MapScreen } from './src/screens/MapScreen';
import { TimelineScreen } from './src/screens/TimelineScreen';
import { StatsScreen } from './src/screens/StatsScreen';

// 简易Tab导航（不依赖 react-navigation，避免 react-native-screens Fabric 问题）
type TabName = 'map' | 'timeline' | 'stats';

const TABS: { key: TabName; label: string; icon: string }[] = [
  { key: 'map', label: '地图', icon: '🗺️' },
  { key: 'timeline', label: '时间线', icon: '📋' },
  { key: 'stats', label: '统计', icon: '📊' },
];

function TabBar({
  activeTab,
  onTabPress,
}: {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}) {
  return (
    <View style={tabStyles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={tabStyles.tab}
            onPress={() => onTabPress(tab.key)}
          >
            <View
              style={[
                tabStyles.iconWrap,
                isActive ? tabStyles.iconWrapActive : undefined,
              ]}
            >
              <Text style={tabStyles.icon}>{tab.icon}</Text>
            </View>
            <Text
              style={[
                tabStyles.label,
                isActive ? tabStyles.labelActive : undefined,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('map');

  return (
    <EntriesProvider>
      <SafeAreaView style={styles.container}>
        {/* Header for non-map tabs */}
        {activeTab !== 'map' && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {activeTab === 'timeline' ? '心情时间线' : '心情统计'}
            </Text>
          </View>
        )}

        {/* Screen content */}
        <View style={styles.content}>
          {activeTab === 'map' && <MapScreen />}
          {activeTab === 'timeline' && <TimelineScreen />}
          {activeTab === 'stats' && <StatsScreen />}
        </View>

        {/* Custom tab bar */}
        <TabBar activeTab={activeTab} onTabPress={setActiveTab} />

        <StatusBar style="auto" />
      </SafeAreaView>
    </EntriesProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
});

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingBottom: 28,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#6C63FF22',
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  labelActive: {
    color: Colors.primary,
  },
});

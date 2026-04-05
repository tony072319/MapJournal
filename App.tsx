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
import { ThemeProvider } from './src/context/ThemeContext';
import { Colors } from './src/constants/colors';
import { MapScreen } from './src/screens/MapScreen';
import { TimelineScreen } from './src/screens/TimelineScreen';
import { AboutMeScreen } from './src/screens/AboutMeScreen';

type TabName = 'map' | 'timeline' | 'aboutme';

const TABS: { key: TabName; label: string; icon: string }[] = [
  { key: 'map', label: '地图', icon: '🗺️' },
  { key: 'timeline', label: '时间线', icon: '📋' },
  { key: 'aboutme', label: '我的', icon: '👤' },
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
            activeOpacity={0.7}
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
  const isMapTab = activeTab === 'map';

  return (
    <EntriesProvider>
      <CustomTagsProvider>
      <ThemeProvider>
      <View style={styles.root}>
        {isMapTab && (
          <View style={styles.content}>
            <MapScreen />
          </View>
        )}

        {!isMapTab && (
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
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
        <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
        <StatusBar style={isMapTab ? 'dark' : 'dark'} />
      </View>
      </ThemeProvider>
      </CustomTagsProvider>
    </EntriesProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
});

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
  iconWrapActive: {
    backgroundColor: Colors.primary + '18',
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

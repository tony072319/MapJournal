import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, Platform, View } from 'react-native';
import { MapScreen } from '../screens/MapScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused ? styles.iconContainerActive : undefined]}>
    <Text style={styles.tabIcon}>{icon}</Text>
  </View>
);

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
        }}
      >
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: '地图',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🗺️" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Timeline"
          component={TimelineScreen}
          options={{
            title: '时间线',
            headerTitle: '心情时间线',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="📋" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            title: '统计',
            headerTitle: '心情统计',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="📊" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.card,
    borderTopColor: Colors.border,
    borderTopWidth: 0.5,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabIcon: {
    fontSize: 20,
  },
  iconContainer: {
    width: 36,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: Colors.primary + '15',
  },
  header: {
    backgroundColor: Colors.background,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
});

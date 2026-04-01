import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { MapScreen } from '../screens/MapScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

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
            tabBarIcon: ({ color }) => (
              <Text style={[styles.tabIcon, { color }]}>🗺️</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Timeline"
          component={TimelineScreen}
          options={{
            title: '时间线',
            headerTitle: '心情时间线',
            tabBarIcon: ({ color }) => (
              <Text style={[styles.tabIcon, { color }]}>📋</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            title: '统计',
            headerTitle: '心情统计',
            tabBarIcon: ({ color }) => (
              <Text style={[styles.tabIcon, { color }]}>📊</Text>
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
    height: 88,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabIcon: {
    fontSize: 22,
  },
  header: {
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
});

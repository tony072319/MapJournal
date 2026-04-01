import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { EntriesProvider } from './src/context/EntriesContext';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <EntriesProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </EntriesProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

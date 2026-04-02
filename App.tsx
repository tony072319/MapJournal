import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { EntriesProvider } from './src/context/EntriesContext';

export default function App() {
  return (
    <View style={styles.container}>
      <EntriesProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </EntriesProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

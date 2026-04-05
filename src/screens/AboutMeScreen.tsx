import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useEntries } from '../context/EntriesContext';
import { Colors } from '../constants/colors';

// Phase 4 会完善这个页面，现在先放占位内容确保编译通过
export const AboutMeScreen: React.FC = () => {
  const { entries } = useEntries();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>MapJournal 用户</Text>
        <Text style={styles.stats}>{entries.length} 条记录</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>设置</Text>
        <Text style={styles.placeholder}>即将推出...</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>回忆</Text>
        <Text style={styles.placeholder}>即将推出...</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  stats: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

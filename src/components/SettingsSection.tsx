import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { exportEntriesAsCSV } from '../utils/exportData';
import { Entry } from '../types';

interface Props {
  entries: Entry[];
}

export const SettingsSection: React.FC<Props> = ({ entries }) => {
  const { isDark, toggleDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>设置</Text>

      <View style={[styles.row, styles.rowBorder]}>
        <Text style={styles.rowIcon}>🌙</Text>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>深色模式</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleDark}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <TouchableOpacity
        style={[styles.row, styles.rowBorder]}
        onPress={() => Alert.alert('语言', '更多语言支持即将推出')}
        activeOpacity={0.6}
      >
        <Text style={styles.rowIcon}>🌐</Text>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>语言</Text>
          <Text style={styles.rowSubtitle}>中文</Text>
        </View>
        <Text style={styles.rowArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, styles.rowBorder]}
        onPress={() => exportEntriesAsCSV(entries)}
        activeOpacity={0.6}
      >
        <Text style={styles.rowIcon}>📤</Text>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>导出数据</Text>
          <Text style={styles.rowSubtitle}>导出为 CSV 文件</Text>
        </View>
        <Text style={styles.rowArrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={styles.rowIcon}>ℹ️</Text>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>关于</Text>
          <Text style={styles.rowSubtitle}>MapJournal v2.0</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowIcon: {
    fontSize: 18,
    width: 30,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  rowArrow: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: '300',
  },
});

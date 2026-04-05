import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { exportEntriesAsCSV } from '../utils/exportData';
import { Entry } from '../types';

interface Props {
  entries: Entry[];
}

export const SettingsSection: React.FC<Props> = ({ entries }) => {
  const handleExport = () => {
    exportEntriesAsCSV(entries);
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert(feature, '此功能即将推出');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>设置</Text>

      <SettingRow
        icon="👤"
        title="用户名"
        subtitle="在个人资料中编辑"
        onPress={() => handleComingSoon('用户名')}
      />
      <SettingRow
        icon="🌐"
        title="语言"
        subtitle="中文"
        onPress={() => handleComingSoon('语言切换')}
      />
      <SettingRow
        icon="🌙"
        title="深色模式"
        subtitle="即将推出"
        onPress={() => handleComingSoon('深色模式')}
      />
      <SettingRow
        icon="📤"
        title="导出数据"
        subtitle="导出为 CSV 文件"
        onPress={handleExport}
      />
      <SettingRow
        icon="ℹ️"
        title="关于"
        subtitle="MapJournal v2.0"
        onPress={() => {}}
        last
      />
    </View>
  );
};

const SettingRow = ({
  icon, title, subtitle, onPress, last,
}: {
  icon: string; title: string; subtitle: string;
  onPress: () => void; last?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.row, last ? undefined : styles.rowBorder]}
    onPress={onPress}
    activeOpacity={0.6}
  >
    <Text style={styles.rowIcon}>{icon}</Text>
    <View style={styles.rowContent}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.rowArrow}>›</Text>
  </TouchableOpacity>
);

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

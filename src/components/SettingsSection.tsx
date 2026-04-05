import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { exportEntriesAsCSV } from '../utils/exportData';
import { setLanguage, getLanguage, t } from '../constants/i18n';
import * as profileDb from '../database/profile';
import { Entry } from '../types';

interface Props {
  entries: Entry[];
}

export const SettingsSection: React.FC<Props> = ({ entries }) => {
  const { isDark, toggleDark } = useTheme();
  const [lang, setLang] = useState(getLanguage());

  const handleLanguageToggle = async () => {
    const newLang = lang === 'zh' ? 'en' : 'zh';
    setLang(newLang);
    setLanguage(newLang);
    await profileDb.updateProfile({ language: newLang });
    // 提示用户需要重启才能完全生效
    Alert.alert(
      newLang === 'en' ? 'Language Changed' : '语言已切换',
      newLang === 'en' ? 'Some text will update after restarting the app.' : '部分文本需要重启App后生效',
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('settings')}</Text>

      <View style={[styles.row, styles.rowBorder]}>
        <Text style={styles.rowIcon}>🌙</Text>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>{t('darkMode')}</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleDark}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={handleLanguageToggle} activeOpacity={0.6}>
        <Text style={styles.rowIcon}>🌐</Text>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>{t('language')}</Text>
          <Text style={styles.rowSubtitle}>{lang === 'zh' ? '中文 → English' : 'English → 中文'}</Text>
        </View>
        <Text style={styles.rowArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => exportEntriesAsCSV(entries)} activeOpacity={0.6}>
        <Text style={styles.rowIcon}>📤</Text>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>{t('exportData')}</Text>
          <Text style={styles.rowSubtitle}>{t('exportCSV')}</Text>
        </View>
        <Text style={styles.rowArrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={styles.rowIcon}>ℹ️</Text>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>{t('about')}</Text>
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

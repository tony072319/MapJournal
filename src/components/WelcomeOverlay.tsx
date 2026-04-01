import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface Props {
  onGetStarted: () => void;
}

export const WelcomeOverlay: React.FC<Props> = ({ onGetStarted }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* 顶部装饰 */}
        <View style={styles.emojiRow}>
          <Text style={styles.decorEmoji}>😄</Text>
          <Text style={styles.decorEmoji}>😊</Text>
          <Text style={styles.decorEmoji}>📍</Text>
          <Text style={styles.decorEmoji}>📸</Text>
          <Text style={styles.decorEmoji}>✨</Text>
        </View>

        <Text style={styles.title}>欢迎来到 MapJournal</Text>
        <Text style={styles.subtitle}>用地图记录你的每一个心情时刻</Text>

        {/* 功能介绍 */}
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🗺️</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>心情地图</Text>
              <Text style={styles.featureDesc}>在地图上留下你的心情足迹</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📷</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>拍照记录</Text>
              <Text style={styles.featureDesc}>用照片定格当下的美好瞬间</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📊</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>心情统计</Text>
              <Text style={styles.featureDesc}>回顾你的心情变化趋势</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={onGetStarted} activeOpacity={0.8}>
          <Text style={styles.buttonText}>开始记录</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>需要允许访问位置信息</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 28,
    padding: 32,
    width: width - 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  decorEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 28,
    textAlign: 'center',
  },
  features: {
    width: '100%',
    gap: 16,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 12,
  },
});

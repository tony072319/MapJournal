import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors, MoodColors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface Props {
  onGetStarted: () => void;
}

export const WelcomeOverlay: React.FC<Props> = ({ onGetStarted }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* 彩色圆点装饰 */}
        <View style={styles.dotsRow}>
          {[MoodColors.happy, MoodColors.good, Colors.primary, MoodColors.sad, MoodColors.angry].map(
            (color, i) => (
              <View key={i} style={[styles.decorDot, { backgroundColor: color }]} />
            )
          )}
        </View>

        <Text style={styles.title}>MapJournal</Text>
        <Text style={styles.subtitle}>用地图记录你的每一个心情时刻</Text>

        {/* 功能介绍 */}
        <View style={styles.features}>
          <FeatureRow
            color={MoodColors.good}
            title="心情记录"
            desc="随时随地记录你的心情和想法"
          />
          <FeatureRow
            color={Colors.primary}
            title="拍照留念"
            desc="用照片定格当下的美好瞬间"
          />
          <FeatureRow
            color={MoodColors.happy}
            title="心情统计"
            desc="回顾你的心情变化趋势"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={onGetStarted} activeOpacity={0.8}>
          <Text style={styles.buttonText}>开始记录</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>需要允许访问位置信息</Text>
      </View>
    </View>
  );
};

const FeatureRow = ({ color, title, desc }: { color: string; title: string; desc: string }) => (
  <View style={styles.featureRow}>
    <View style={[styles.featureDot, { backgroundColor: color }]} />
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 32,
    width: width - 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  decorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 28,
    textAlign: 'center',
  },
  features: {
    width: '100%',
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureDot: {
    width: 36,
    height: 36,
    borderRadius: 12,
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
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

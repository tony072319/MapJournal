import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { MOOD_OPTIONS } from '../constants/moods';
import { MoodType } from '../types';

const { width, height } = Dimensions.get('window');

interface Props {
  onGetStarted: () => void;
}

// Reflectly 风格的引导式 onboarding — 学习的同时就完成了第一次操作
export const WelcomeOverlay: React.FC<Props> = ({ onGetStarted }) => {
  const [step, setStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  // Step 0: 欢迎
  // Step 1: 试试选一个心情
  // Step 2: 完成！
  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    setTimeout(() => setStep(2), 400);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {step === 0 && (
          <>
            {/* 装饰 */}
            <View style={styles.decorRow}>
              {[MoodColors.amazing, MoodColors.happy, MoodColors.good, MoodColors.calm, Colors.primary].map(
                (color, i) => (
                  <View key={i} style={[styles.decorDot, { backgroundColor: color }]} />
                )
              )}
            </View>

            <Text style={styles.title}>欢迎来到 MapJournal</Text>
            <Text style={styles.subtitle}>在地图上记录你的每一个心情时刻</Text>

            <View style={styles.features}>
              <FeatureItem icon="🗺️" text="随时随地记录心情到地图" />
              <FeatureItem icon="📸" text="用照片定格美好瞬间" />
              <FeatureItem icon="📊" text="追踪你的心情趋势变化" />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(1)} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>开始体验</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>试试看！</Text>
            <Text style={styles.stepSubtitle}>选一个代表你现在心情的表情</Text>

            <View style={styles.moodGrid}>
              {MOOD_OPTIONS.slice(0, 4).map((mood) => (
                <TouchableOpacity
                  key={mood.type}
                  style={[
                    styles.moodOption,
                    selectedMood === mood.type ? { backgroundColor: mood.color + '20', borderColor: mood.color } : undefined,
                  ]}
                  onPress={() => handleMoodSelect(mood.type)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.moodGrid}>
              {MOOD_OPTIONS.slice(4).map((mood) => (
                <TouchableOpacity
                  key={mood.type}
                  style={[
                    styles.moodOption,
                    selectedMood === mood.type ? { backgroundColor: mood.color + '20', borderColor: mood.color } : undefined,
                  ]}
                  onPress={() => handleMoodSelect(mood.type)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={styles.stepTitle}>太好了！</Text>
            <Text style={styles.stepSubtitle}>
              你已经学会了如何记录心情{'\n'}
              在地图上点击快速记录栏开始使用吧
            </Text>

            <TouchableOpacity style={styles.primaryButton} onPress={onGetStarted} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>进入地图</Text>
            </TouchableOpacity>
          </>
        )}

        {/* 步骤指示器 */}
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.stepDot, step === i ? styles.stepDotActive : undefined]} />
          ))}
        </View>
      </View>
    </View>
  );
};

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.featureRow}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 28,
    width: width - 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  decorRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  decorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  features: {
    width: '100%',
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureIcon: {
    fontSize: 22,
    width: 36,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Step styles
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  doneEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    marginBottom: 8,
    width: '100%',
  },
  moodOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  // Step indicators
  dots: {
    flexDirection: 'row',
    marginTop: 20,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    width: 18,
  },
});

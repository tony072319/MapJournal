import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Colors } from '../constants/colors';

interface Props { onGetStarted: () => void; }

/**
 * Editorial welcome — giant italic serif title over faded map.
 */
export const WelcomeOverlay: React.FC<Props> = ({ onGetStarted }) => {
  return (
    <Modal visible animationType="fade" transparent={false}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.kicker}>MAPJOURNAL · EST. 2025</Text>
        </View>

        <View style={styles.middle}>
          <Text style={styles.title}>
            Put your{'\n'}
            <Text style={styles.titleAccent}>mood</Text>{'\n'}
            on the map<Text style={{ color: Colors.primary }}>.</Text>
          </Text>
          <Text style={styles.subtitle}>
            不只是记录你的感受 —{'\n'}记录你在哪里感受它们。
          </Text>
        </View>

        <View style={styles.bottom}>
          <View style={styles.featuresRow}>
            {[
              ['📍', '地点标记', 'Drop pins'],
              ['✍️', '每日记录', 'Journal'],
              ['📊', '回顾洞察', 'Reflect'],
            ].map(([icon, cn, en]) => (
              <View key={cn} style={styles.feature}>
                <Text style={styles.featureIcon}>{icon}</Text>
                <Text style={styles.featureLabel}>{cn}</Text>
                <Text style={styles.featureLabelEn}>{en}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.cta} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={styles.ctaText}>开始记录 · Start</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </TouchableOpacity>
          <Text style={styles.privacy}>
            Private by default · 只存在你的设备上
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.background, paddingHorizontal: 26,
    paddingTop: 72, paddingBottom: 48, justifyContent: 'space-between',
  },
  top: {},
  kicker: {
    fontFamily: 'Menlo', fontSize: 11, color: Colors.textSecondary,
    letterSpacing: 3,
  },

  middle: {},
  title: {
    fontFamily: 'Georgia', fontSize: 50, color: Colors.text,
    letterSpacing: -1.5, lineHeight: 52, marginBottom: 18,
  },
  titleAccent: {
    color: Colors.primary, fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 16, color: Colors.textSecondary, lineHeight: 24, maxWidth: 300,
  },

  bottom: {},
  featuresRow: {
    flexDirection: 'row', gap: 16, marginBottom: 24,
  },
  feature: { flex: 1 },
  featureIcon: { fontSize: 22, marginBottom: 6 },
  featureLabel: {
    fontSize: 13, color: Colors.text, fontWeight: '600',
  },
  featureLabelEn: {
    fontFamily: 'Menlo', fontSize: 10, color: Colors.textSecondary,
    letterSpacing: 1, marginTop: 1,
  },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.text, borderRadius: 18, padding: 18,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 32, elevation: 8,
  },
  ctaText: {
    color: Colors.background, fontSize: 16, fontWeight: '600',
    letterSpacing: -0.2,
  },
  ctaArrow: { color: Colors.background, fontSize: 22 },

  privacy: {
    textAlign: 'center', fontSize: 11, color: Colors.muted, marginTop: 12,
  },
});

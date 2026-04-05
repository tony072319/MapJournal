import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Colors } from '../constants/colors';

interface Props {
  onRecorded: (uri: string) => void;
  voiceUri: string | null;
  onClear: () => void;
}

export const VoiceMemoButton: React.FC<Props> = ({ onRecorded, voiceUri, onClear }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (e) {
      console.error('录音失败:', e);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      if (uri) onRecorded(uri);
    } catch (e) {
      console.error('停止录音失败:', e);
    }
  };

  const playVoice = async () => {
    if (!voiceUri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: voiceUri });
      soundRef.current = sound;
      setPlaying(true);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
        }
      });
    } catch (e) {
      console.error('播放失败:', e);
      setPlaying(false);
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // 已有录音 → 显示播放/删除
  if (voiceUri) {
    return (
      <View style={styles.playbackRow}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={playVoice}
          activeOpacity={0.7}
        >
          <Text style={styles.playIcon}>{playing ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>
        <View style={styles.playbackBar}>
          <View style={[styles.playbackFill, playing ? styles.playbackActive : undefined]} />
        </View>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 录音中 → 显示时长和停止
  if (isRecording) {
    return (
      <TouchableOpacity style={styles.recordingButton} onPress={stopRecording} activeOpacity={0.7}>
        <View style={styles.recordingDot} />
        <Text style={styles.recordingText}>{formatDuration(duration)}</Text>
        <Text style={styles.stopText}>停止</Text>
      </TouchableOpacity>
    );
  }

  // 默认 → 麦克风按钮
  return (
    <TouchableOpacity style={styles.micButton} onPress={startRecording} activeOpacity={0.7}>
      <Text style={styles.micIcon}>🎙️</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 18,
  },
  recordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginRight: 8,
  },
  stopText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  playIcon: {
    fontSize: 14,
  },
  playbackBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginRight: 10,
    overflow: 'hidden',
  },
  playbackFill: {
    height: '100%',
    width: '30%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  playbackActive: {
    width: '60%',
  },
  clearText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});

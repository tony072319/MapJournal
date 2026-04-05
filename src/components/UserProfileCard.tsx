import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/colors';
import { UserProfile } from '../types';
import * as profileDb from '../database/profile';

interface Props {
  entryCount: number;
  friendCount: number;
  streakDays: number;
}

export const UserProfileCard: React.FC<Props> = ({ entryCount, friendCount, streakDays }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    profileDb.getProfile().then(setProfile);
  }, []);

  const handleAvatarPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '请允许App访问相册');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await profileDb.updateProfile({ avatarUri: result.assets[0].uri });
      setProfile((p) => p ? { ...p, avatarUri: result.assets[0].uri } : p);
    }
  };

  const handleNameEdit = () => {
    setTempName(profile?.displayName || '');
    setEditingName(true);
  };

  const handleNameSave = async () => {
    if (tempName.trim()) {
      await profileDb.updateProfile({ displayName: tempName.trim() });
      setProfile((p) => p ? { ...p, displayName: tempName.trim() } : p);
    }
    setEditingName(false);
  };

  if (!profile) return null;

  return (
    <View style={styles.card}>
      {/* 头像 */}
      <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
        {profile.avatarUri ? (
          <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        )}
        <View style={styles.avatarBadge}>
          <Text style={styles.avatarBadgeText}>📷</Text>
        </View>
      </TouchableOpacity>

      {/* 名字 */}
      {editingName ? (
        <View style={styles.nameEditRow}>
          <TextInput
            style={styles.nameInput}
            value={tempName}
            onChangeText={setTempName}
            autoFocus
            maxLength={20}
            onSubmitEditing={handleNameSave}
          />
          <TouchableOpacity onPress={handleNameSave} style={styles.nameConfirm}>
            <Text style={styles.nameConfirmText}>✓</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={handleNameEdit}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.nameHint}>点击编辑名字</Text>
        </TouchableOpacity>
      )}

      {/* 统计行 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{entryCount}</Text>
          <Text style={styles.statLabel}>记录</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{friendCount}</Text>
          <Text style={styles.statLabel}>好友</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{streakDays}</Text>
          <Text style={styles.statLabel}>连续天</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadgeText: {
    fontSize: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  nameHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 160,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  nameConfirm: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Friend } from '../types';
import * as friendsDb from '../database/friends';
import { generateId } from '../utils/uuid';
import AsyncStorage from '../utils/storage';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const FriendsModal: React.FC<Props> = ({ visible, onClose }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [myCode, setMyCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (visible) {
      friendsDb.getAllFriends().then(setFriends);
      // 生成或获取自己的邀请码
      let code = AsyncStorage.getItem('myInviteCode');
      if (!code) {
        code = generateId().slice(0, 8).toUpperCase();
        AsyncStorage.setItem('myInviteCode', code);
      }
      setMyCode(code);
    }
  }, [visible]);

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `加我 MapJournal 好友！我的邀请码: ${myCode}`,
      });
    } catch {}
  };

  const handleAddByCode = async () => {
    if (!inviteCode.trim()) return;
    // 检查是否是自己的码
    if (inviteCode.trim().toUpperCase() === myCode) {
      Alert.alert('不能添加自己哦');
      return;
    }
    // 检查是否已添加
    const exists = friends.some((f) => f.id === inviteCode.trim().toUpperCase());
    if (exists) {
      Alert.alert('已经是好友了');
      return;
    }
    const friend = await friendsDb.addFriend(`好友 ${inviteCode.trim().slice(0, 4)}`);
    setFriends((prev) => [friend, ...prev]);
    setInviteCode('');
    setShowAdd(false);
    Alert.alert('添加成功！', '好友已添加到列表');
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const friend = await friendsDb.addFriend(newName.trim());
    setFriends((prev) => [friend, ...prev]);
    setNewName('');
    setShowAdd(false);
  };

  const handleRemove = (friend: Friend) => {
    Alert.alert(`移除 ${friend.displayName}？`, '', [
      { text: '取消', style: 'cancel' },
      {
        text: '移除', style: 'destructive',
        onPress: async () => {
          await friendsDb.removeFriend(friend.id);
          setFriends((prev) => prev.filter((f) => f.id !== friend.id));
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>好友</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>完成</Text>
          </TouchableOpacity>
        </View>

        {/* 我的邀请码 */}
        <View style={styles.myCodeCard}>
          <Text style={styles.myCodeLabel}>我的邀请码</Text>
          <Text style={styles.myCodeText}>{myCode}</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShareCode}>
            <Text style={styles.shareBtnText}>分享给朋友</Text>
          </TouchableOpacity>
        </View>

        {/* 添加好友区域 */}
        {showAdd ? (
          <View style={styles.addSection}>
            {/* 通过邀请码添加 */}
            <Text style={styles.addLabel}>输入好友邀请码</Text>
            <View style={styles.addRow}>
              <TextInput
                style={styles.addInput}
                placeholder="输入邀请码..."
                placeholderTextColor={Colors.textSecondary}
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
                maxLength={8}
              />
              <TouchableOpacity
                style={[styles.addBtn, !inviteCode.trim() ? styles.addBtnDisabled : undefined]}
                onPress={handleAddByCode}
                disabled={!inviteCode.trim()}
              >
                <Text style={styles.addBtnText}>添加</Text>
              </TouchableOpacity>
            </View>

            {/* 或直接输入名字 */}
            <Text style={styles.addLabel}>或直接添加</Text>
            <View style={styles.addRow}>
              <TextInput
                style={styles.addInput}
                placeholder="输入好友名字..."
                placeholderTextColor={Colors.textSecondary}
                value={newName}
                onChangeText={setNewName}
                maxLength={20}
              />
              <TouchableOpacity
                style={[styles.addBtn, !newName.trim() ? styles.addBtnDisabled : undefined]}
                onPress={handleAdd}
                disabled={!newName.trim()}
              >
                <Text style={styles.addBtnText}>添加</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setShowAdd(false)} style={styles.cancelAdd}>
              <Text style={styles.cancelAddText}>取消</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addFriendBtn} onPress={() => setShowAdd(true)}>
            <Text style={styles.addFriendText}>+ 添加好友</Text>
          </TouchableOpacity>
        )}

        {/* 好友列表 */}
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.friendRow}>
              <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarText}>
                  {item.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.displayName}</Text>
                <Text style={styles.friendStatus}>
                  {item.status === 'pending' ? '等待确认' : '已添加'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(item)}>
                <Text style={styles.removeText}>移除</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyText}>还没有好友</Text>
              <Text style={styles.emptyHint}>分享你的邀请码或输入好友的邀请码来添加</Text>
            </View>
          }
          contentContainerStyle={styles.list}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.card },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  closeBtn: {
    backgroundColor: Colors.primary, borderRadius: 18,
    paddingHorizontal: 18, paddingVertical: 8,
  },
  closeText: { fontSize: 14, color: '#FFF', fontWeight: '600' },
  // 我的邀请码
  myCodeCard: {
    margin: 16, backgroundColor: Colors.primary + '08',
    borderRadius: 16, padding: 18, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary + '20',
  },
  myCodeLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  myCodeText: {
    fontSize: 28, fontWeight: '800', color: Colors.primary,
    letterSpacing: 4, marginBottom: 12,
  },
  shareBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  shareBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  // 添加好友
  addFriendBtn: {
    marginHorizontal: 16, marginBottom: 8, backgroundColor: Colors.background,
    borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed',
  },
  addFriendText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  addSection: { paddingHorizontal: 16, marginBottom: 8 },
  addLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, marginTop: 10 },
  addRow: { flexDirection: 'row', alignItems: 'center' },
  addInput: {
    flex: 1, backgroundColor: Colors.background, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: Colors.text,
    marginRight: 10, borderWidth: 1, borderColor: Colors.border,
  },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  addBtnDisabled: { backgroundColor: Colors.border },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  cancelAdd: { alignItems: 'center', paddingVertical: 10 },
  cancelAddText: { fontSize: 14, color: Colors.textSecondary },
  // 列表
  list: { paddingHorizontal: 16 },
  friendRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  friendAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  friendStatus: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  removeText: { fontSize: 13, color: '#EF4444', fontWeight: '500' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  emptyHint: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Friend } from '../types';
import * as friendsDb from '../database/friends';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const FriendsModal: React.FC<Props> = ({ visible, onClose }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (visible) {
      friendsDb.getAllFriends().then(setFriends);
    }
  }, [visible]);

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

        {/* 添加好友 */}
        {showAdd ? (
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="输入好友名字..."
              placeholderTextColor={Colors.textSecondary}
              value={newName}
              onChangeText={setNewName}
              autoFocus
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
        ) : (
          <TouchableOpacity style={styles.addFriendBtn} onPress={() => setShowAdd(true)}>
            <Text style={styles.addFriendText}>+ 添加好友</Text>
          </TouchableOpacity>
        )}

        {/* 提示 */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            目前好友数据保存在本地。网络同步功能将在后续版本中推出，届时好友可以看到你的公开心情记录。
          </Text>
        </View>

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
              <Text style={styles.emptyHint}>添加好友后可以在地图上看到他们的心情</Text>
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
  addFriendBtn: {
    margin: 16, backgroundColor: Colors.primary + '10',
    borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed',
  },
  addFriendText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  addRow: {
    flexDirection: 'row', margin: 16, alignItems: 'center',
  },
  addInput: {
    flex: 1, backgroundColor: Colors.background, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: Colors.text,
    marginRight: 10, borderWidth: 1, borderColor: Colors.primary,
  },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  addBtnDisabled: { backgroundColor: Colors.border },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  notice: {
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: Colors.primary + '08', borderRadius: 12, padding: 12,
  },
  noticeText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
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
  emptyHint: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
});

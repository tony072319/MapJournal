import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

const EMOJI_SUGGESTIONS = ['🏃', '🎨', '🐕', '🎸', '🧑‍💻', '🏠', '🚗', '🎂', '💪', '🧘', '📖', '🎧', '🌅', '🍕', '🏋️', '🛌'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (icon: string, label: string) => void;
}

export const CustomTagModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
  const [icon, setIcon] = useState('');
  const [label, setLabel] = useState('');

  const handleSave = () => {
    if (icon && label.trim()) {
      onSave(icon, label.trim());
      setIcon('');
      setLabel('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>创建自定义标签</Text>

          {/* Emoji 选择 */}
          <Text style={styles.sectionLabel}>选一个图标</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_SUGGESTIONS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiOption, icon === e ? styles.emojiSelected : undefined]}
                onPress={() => setIcon(e)}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 或者手动输入 */}
          <TextInput
            style={styles.emojiInput}
            placeholder="或输入任意emoji"
            placeholderTextColor={Colors.textSecondary}
            value={icon}
            onChangeText={(t) => setIcon(t.slice(0, 2))}
            maxLength={2}
          />

          {/* 标签名 */}
          <Text style={styles.sectionLabel}>标签名称</Text>
          <TextInput
            style={styles.labelInput}
            placeholder="例如：遛狗"
            placeholderTextColor={Colors.textSecondary}
            value={label}
            onChangeText={setLabel}
            maxLength={10}
          />

          {/* 按钮 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, (!icon || !label.trim()) ? styles.saveBtnDisabled : undefined]}
              onPress={handleSave}
              disabled={!icon || !label.trim()}
            >
              <Text style={styles.saveText}>创建</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  emojiOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  emojiSelected: {
    backgroundColor: Colors.primary + '18',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  emojiText: {
    fontSize: 20,
  },
  emojiInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  labelInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.border,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ACTIVITY_OPTIONS } from '../constants/activities';
import { useCustomTags } from '../context/CustomTagsContext';
import { CustomTagModal } from './CustomTagModal';
import { Colors } from '../constants/colors';

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

export const ActivityPicker: React.FC<Props> = ({ selected, onToggle }) => {
  const { customTags, addTag, removeTag } = useCustomTags();
  const [showModal, setShowModal] = useState(false);

  const handleLongPress = (tagId: string, tagLabel: string) => {
    Alert.alert(
      `删除标签 "${tagLabel}"？`,
      '删除后不会影响已有记录',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => removeTag(tagId),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>你在做什么？（可选）</Text>
      <View style={styles.grid}>
        {/* 预设标签 */}
        {ACTIVITY_OPTIONS.map((activity) => {
          const isSelected = selected.includes(activity.id);
          return (
            <TouchableOpacity
              key={activity.id}
              style={[styles.chip, isSelected ? styles.chipSelected : undefined]}
              onPress={() => onToggle(activity.id)}
              activeOpacity={0.6}
            >
              <Text style={styles.chipIcon}>{activity.icon}</Text>
              <Text style={[styles.chipLabel, isSelected ? styles.chipLabelSelected : undefined]}>
                {activity.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* 自定义标签 */}
        {customTags.map((tag) => {
          const isSelected = selected.includes(tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              style={[styles.chip, styles.chipCustom, isSelected ? styles.chipSelected : undefined]}
              onPress={() => onToggle(tag.id)}
              onLongPress={() => handleLongPress(tag.id, tag.label)}
              activeOpacity={0.6}
            >
              <Text style={styles.chipIcon}>{tag.icon}</Text>
              <Text style={[styles.chipLabel, isSelected ? styles.chipLabelSelected : undefined]}>
                {tag.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* 添加自定义标签按钮 */}
        <TouchableOpacity
          style={styles.addChip}
          onPress={() => setShowModal(true)}
          activeOpacity={0.6}
        >
          <Text style={styles.addChipText}>+ 自定义</Text>
        </TouchableOpacity>
      </View>

      <CustomTagModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={addTag}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipCustom: {
    borderStyle: 'dashed',
  },
  chipSelected: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  addChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  addChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});

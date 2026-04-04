import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ACTIVITY_OPTIONS } from '../constants/activities';
import { Colors } from '../constants/colors';

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

export const ActivityPicker: React.FC<Props> = ({ selected, onToggle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>你在做什么？（可选）</Text>
      <View style={styles.grid}>
        {ACTIVITY_OPTIONS.map((activity) => {
          const isSelected = selected.includes(activity.id);
          return (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : undefined,
              ]}
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
      </View>
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
});

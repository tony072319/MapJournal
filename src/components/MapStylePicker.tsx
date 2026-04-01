import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { MAP_STYLE_OPTIONS } from '../constants/mapStyles';
import { MapStyleType } from '../types';

interface Props {
  currentStyle: MapStyleType;
  onStyleChange: (style: MapStyleType) => void;
}

export const MapStylePicker: React.FC<Props> = ({ currentStyle, onStyleChange }) => {
  const [expanded, setExpanded] = useState(false);

  const currentOption = MAP_STYLE_OPTIONS.find((o) => o.type === currentStyle)!;

  return (
    <View style={styles.container}>
      {expanded ? (
        <View style={styles.expandedContainer}>
          {MAP_STYLE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.option,
                currentStyle === option.type && styles.optionActive,
              ]}
              onPress={() => {
                onStyleChange(option.type);
                setExpanded(false);
              }}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  currentStyle === option.type && styles.optionLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setExpanded(true)}
        >
          <Text style={styles.buttonIcon}>{currentOption.icon}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 16,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonIcon: {
    fontSize: 20,
  },
  expandedContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
  },
  optionActive: {
    backgroundColor: Colors.primary + '15',
  },
  optionIcon: {
    fontSize: 18,
  },
  optionLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  optionLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface PillarBadgeProps {
  label: string;
  pillar: 'arrive' | 'breathe' | 'restore';
}

export function PillarBadge({ label, pillar }: PillarBadgeProps) {
  const C = useColors();

  const bgColor = pillar === 'arrive' ? C.arriveMuted : pillar === 'breathe' ? C.breatheMuted : C.restoreMuted;
  const textColor = pillar === 'arrive' ? C.arrive : pillar === 'breathe' ? C.breathe : C.restore;

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: bgColor,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: textColor + '30',
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '500',
          color: textColor,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

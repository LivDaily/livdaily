import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface PillarBadgeProps {
  label: string;
  pillar: 'arrive' | 'breathe' | 'restore';
}

export function PillarBadge({ label, pillar }: PillarBadgeProps) {
  const C = useColors();

  const borderColor = pillar === 'arrive' ? C.arrive : pillar === 'breathe' ? C.breathe : C.restore;
  const textColor = pillar === 'arrive' ? C.arrive : pillar === 'breathe' ? C.breathe : C.restore;

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: 'transparent',
        borderRadius: 2,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: borderColor + '60',
      }}
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: '600',
          color: textColor,
          letterSpacing: 1.0,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { useColors } from '@/hooks/useColors';

interface RhythmCardProps {
  title: string;
  duration: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
}

export function RhythmCard({ title, duration, description, isSelected, onPress }: RhythmCardProps) {
  const C = useColors();

  const borderTopColor = isSelected ? C.breathe : C.border;
  const bgColor = isSelected ? C.breatheMuted : C.surface;
  const borderColor = isSelected ? C.breathe + '40' : C.border;

  return (
    <AnimatedPressable onPress={onPress}>
      <View
        style={{
          width: 180,
          backgroundColor: bgColor,
          borderRadius: 4,
          padding: 16,
          borderWidth: 1,
          borderColor: borderColor,
          borderTopWidth: 2,
          borderTopColor: borderTopColor,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        } as any}
      >
        {/* Duration badge — outlined, no fill */}
        <View
          style={{
            alignSelf: 'flex-start',
            borderWidth: 1,
            borderColor: C.breathe + '50',
            borderRadius: 2,
            paddingHorizontal: 6,
            paddingVertical: 3,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '600',
              color: C.breathe,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
            }}
          >
            {duration}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 15,
            fontFamily: 'PlayfairDisplay_700Bold',
            color: C.text,
            marginBottom: 6,
            letterSpacing: -0.1,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: C.textSecondary,
            lineHeight: 19,
          }}
          numberOfLines={3}
        >
          {description}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

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

  return (
    <AnimatedPressable onPress={onPress}>
      <View
        style={{
          width: 180,
          backgroundColor: isSelected ? C.breatheMuted : C.surface,
          borderRadius: 16,
          borderCurve: 'continuous',
          padding: 16,
          borderWidth: 1.5,
          borderColor: isSelected ? C.breathe + '60' : C.border,
          borderTopWidth: 3,
          borderTopColor: isSelected ? C.breathe : C.breathe + '40',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        } as any}
      >
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: C.breatheMuted,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 3,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.breathe }}>
            {duration}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: C.text,
            marginBottom: 6,
            fontFamily: 'Lora_700Bold',
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: C.textSecondary,
            lineHeight: 18,
          }}
          numberOfLines={3}
        >
          {description}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface PromptCardProps {
  label: string;
  prompt: string;
  accentColor: string;
  accentMuted: string;
}

export function PromptCard({ label, prompt, accentColor, accentMuted }: PromptCardProps) {
  const C = useColors();

  return (
    <View
      style={{
        backgroundColor: accentMuted,
        borderRadius: 16,
        borderCurve: 'continuous',
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: accentColor,
        borderWidth: 1,
        borderColor: C.border,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
      } as any}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 1.2,
          color: accentColor,
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 22,
          fontFamily: 'Lora_400Regular_Italic',
          color: C.text,
          lineHeight: 32,
        }}
      >
        {`"${prompt}"`}
      </Text>
    </View>
  );
}

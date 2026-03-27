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
        backgroundColor: C.surface,
        borderRadius: 4,
        padding: 24,
        borderWidth: 1,
        borderColor: C.border,
        borderLeftWidth: 2,
        borderLeftColor: accentColor,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      } as any}
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 1.0,
          color: accentColor,
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        {label}
      </Text>
      {/* Large decorative opening quote */}
      <Text
        style={{
          fontSize: 64,
          fontFamily: 'PlayfairDisplay_700Bold',
          color: accentColor,
          opacity: 0.12,
          lineHeight: 48,
          marginBottom: 4,
        }}
      >
        {'"'}
      </Text>
      <Text
        style={{
          fontSize: 22,
          fontFamily: 'PlayfairDisplay_400Regular_Italic',
          color: C.text,
          lineHeight: 34,
          marginTop: -8,
        }}
      >
        {prompt}
      </Text>
    </View>
  );
}

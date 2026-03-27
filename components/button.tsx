import React, { useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  useColorScheme,
  ViewStyle,
} from "react-native";
import { COLORS, DARK_COLORS } from "@/constants/Colors";

type ButtonVariant = "filled" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  variant = "filled",
  size = "md",
  disabled = false,
  loading = false,
  children,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? DARK_COLORS : COLORS;

  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 2 }).start();
  }, [scale]);

  const animateOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 2 }).start();
  }, [scale]);

  const sizeStyles: Record<ButtonSize, { height: number; fontSize: number; paddingHorizontal: number; paddingVertical: number }> = {
    sm: { height: 36, fontSize: 11, paddingHorizontal: 16, paddingVertical: 10 },
    md: { height: 48, fontSize: 12, paddingHorizontal: 24, paddingVertical: 14 },
    lg: { height: 56, fontSize: 13, paddingHorizontal: 32, paddingVertical: 16 },
  };

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: sizeStyles[size].height,
      paddingHorizontal: sizeStyles[size].paddingHorizontal,
      paddingVertical: sizeStyles[size].paddingVertical,
      opacity: disabled ? 0.45 : 1,
    };

    switch (variant) {
      case "filled":
        return { ...base, backgroundColor: C.primary };
      case "outline":
        return {
          ...base,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: C.border,
        };
      case "ghost":
        return { ...base, backgroundColor: "transparent" };
    }
  };

  const getTextColor = (): string => {
    if (disabled) return C.textTertiary;
    switch (variant) {
      case "filled":
        return isDark ? C.background : "#FFFFFF";
      case "outline":
        return C.text;
      case "ghost":
        return C.accent;
    }
  };

  const textColor = getTextColor();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, disabled && { opacity: 0.45 }]}>
      <Pressable
        onPressIn={animateIn}
        onPressOut={animateOut}
        onPress={() => {
          console.log('[Button] Pressed:', typeof children === 'string' ? children : 'button');
          onPress?.();
        }}
        disabled={disabled || loading}
        style={[getContainerStyle(), style]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <Text
            style={StyleSheet.flatten([
              {
                fontSize: sizeStyles[size].fontSize,
                color: textColor,
                fontWeight: "600",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                textAlign: "center",
              },
              textStyle,
            ])}
          >
            {children}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default Button;

import React from "react";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, useColorScheme, View, Text } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  configureReanimatedLogger,
  FadeIn,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import Reanimated from "react-native-reanimated";
import { COLORS, DARK_COLORS, appleRed } from "@/constants/Colors";
import { IconSymbol } from "./IconSymbol";

configureReanimatedLogger({ strict: false });

export default function ListItem({ listId }: { listId: string }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? DARK_COLORS : COLORS;

  const RightAction = (
    prog: SharedValue<number>,
    drag: SharedValue<number>
  ) => {
    const styleAnimation = useAnimatedStyle(() => ({
      transform: [{ translateX: drag.value + 200 }],
    }));

    return (
      <Pressable
        onPress={() => {
          if (process.env.EXPO_OS === "ios") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          console.log('[ListItem] Delete pressed for:', listId);
        }}
      >
        <Reanimated.View style={[styleAnimation, styles.rightAction]}>
          <IconSymbol name="trash.fill" size={20} color="white" />
        </Reanimated.View>
      </Pressable>
    );
  };

  return (
    <Animated.View entering={FadeIn}>
      <ReanimatedSwipeable
        key={listId}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={RightAction}
        overshootRight={false}
        enableContextMenu
      >
        {/* Editorial list item: thin left-border accent, no icon circle */}
        <View
          style={[
            styles.listItemContainer,
            {
              borderBottomColor: C.divider,
              backgroundColor: C.surface,
              borderLeftColor: C.accent,
            },
          ]}
        >
          <Text
            style={[
              styles.listItemText,
              {
                color: C.text,
                fontFamily: 'PlayfairDisplay_400Regular',
              },
            ]}
          >
            {listId}
          </Text>
        </View>
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

export const NicknameCircle = ({
  nickname,
  color,
  index = 0,
  isEllipsis = false,
}: {
  nickname: string;
  color: string;
  index?: number;
  isEllipsis?: boolean;
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Text
      style={[
        styles.nicknameCircle,
        isEllipsis && styles.ellipsisCircle,
        {
          backgroundColor: color,
          borderColor: isDark ? "#141210" : "#ffffff",
          marginLeft: index > 0 ? -6 : 0,
        },
      ]}
    >
      {isEllipsis ? "..." : nickname[0].toUpperCase()}
    </Text>
  );
};

const styles = StyleSheet.create({
  listItemContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 2,
  },
  listItemText: {
    fontSize: 16,
    lineHeight: 22,
  },
  rightAction: {
    width: 80,
    height: '100%' as any,
    backgroundColor: appleRed,
    alignItems: "center",
    justifyContent: "center",
  },
  nicknameCircle: {
    fontSize: 11,
    color: "white",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 12,
    padding: 1,
    width: 22,
    height: 22,
    textAlign: "center",
    lineHeight: 18,
  },
  ellipsisCircle: {
    lineHeight: 0,
    marginLeft: -6,
  },
});

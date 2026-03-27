import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import { useTheme } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href } from 'expo-router';
import { COLORS, DARK_COLORS } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export interface TabBarItem {
  name: string;
  route: Href;
  ios_icon_name: string;
  android_material_icon_name: keyof typeof MaterialIcons.glyphMap;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

function getPillarAccent(pathname: string, isDark: boolean): string {
  const C = isDark ? DARK_COLORS : COLORS;
  if (pathname.includes('breathe')) return C.breathe;
  if (pathname.includes('restore')) return C.restore;
  return C.arrive;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = screenWidth - 32,
  borderRadius = 4,
  bottomMargin,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const C = isDark ? DARK_COLORS : COLORS;
  const animatedValue = useSharedValue(0);

  const activeAccent = getPillarAccent(pathname, isDark);

  const activeTabIndex = React.useMemo(() => {
    let bestMatch = -1;
    let bestMatchScore = 0;

    tabs.forEach((tab, index) => {
      let score = 0;
      if (pathname === tab.route) {
        score = 100;
      } else if (pathname.startsWith(tab.route as string)) {
        score = 80;
      } else if (pathname.includes(tab.name)) {
        score = 60;
      } else if (
        tab.route.includes('/(tabs)/') &&
        pathname.includes(tab.route.split('/(tabs)/')[1])
      ) {
        score = 40;
      }
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = index;
      }
    });

    return bestMatch >= 0 ? bestMatch : 0;
  }, [pathname, tabs]);

  React.useEffect(() => {
    if (activeTabIndex >= 0) {
      animatedValue.value = withSpring(activeTabIndex, {
        damping: 24,
        stiffness: 140,
        mass: 0.8,
      });
    }
  }, [activeTabIndex, animatedValue]);

  const handleTabPress = (route: Href, name: string) => {
    console.log('[TabBar] User tapped tab:', name, '→', route);
    router.push(route);
  };

  const tabWidthPercent = ((100 / tabs.length) - 1).toFixed(2);

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (containerWidth - 8) / tabs.length;
    return {
      transform: [
        {
          translateX: interpolate(
            animatedValue.value,
            [0, tabs.length - 1],
            [0, tabWidth * (tabs.length - 1)]
          ),
        },
      ],
    };
  });

  // Editorial tab bar: warm parchment bg, thin border, sharp corners
  const barBg = isDark
    ? 'rgba(30,27,24,0.96)'
    : 'rgba(247,245,240,0.96)';

  const barBorder = isDark
    ? 'rgba(240,237,230,0.10)'
    : 'rgba(26,24,20,0.10)';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View
        style={[
          styles.container,
          {
            width: containerWidth,
            marginBottom: bottomMargin ?? 16,
          },
        ]}
      >
        <BlurView
          intensity={60}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.blurContainer,
            {
              borderRadius,
              borderWidth: 1,
              borderColor: barBorder,
              ...Platform.select({
                ios: { backgroundColor: barBg },
                android: { backgroundColor: isDark ? 'rgba(30,27,24,0.98)' : 'rgba(247,245,240,0.98)' },
                web: {
                  backgroundColor: barBg,
                  backdropFilter: 'blur(12px)',
                } as any,
              }),
            },
          ]}
        >
          {/* Sliding indicator — subtle tinted bg */}
          <Animated.View
            style={[
              styles.indicator,
              {
                backgroundColor: isDark
                  ? 'rgba(240,237,230,0.06)'
                  : 'rgba(26,24,20,0.05)',
                width: `${tabWidthPercent}%` as `${number}%`,
                borderRadius: 2,
              },
              indicatorStyle,
            ]}
          />

          <View style={styles.tabsContainer}>
            {tabs.map((tab, index) => {
              const isActive = activeTabIndex === index;
              const iconColor = isActive ? activeAccent : C.textTertiary;
              const labelColor = isActive ? activeAccent : C.textTertiary;

              return (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={styles.tab}
                    onPress={() => handleTabPress(tab.route, tab.name)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="tab"
                    accessibilityLabel={`${tab.name} tab`}
                    accessibilityState={{ selected: isActive }}
                    accessibilityHint={`Navigate to ${tab.name} screen`}
                  >
                    <View style={styles.tabContent}>
                      <IconSymbol
                        android_material_icon_name={tab.android_material_icon_name}
                        ios_icon_name={tab.ios_icon_name}
                        size={22}
                        color={iconColor}
                      />
                      <Text
                        style={[
                          styles.tabLabel,
                          { color: labelColor },
                          isActive && { fontWeight: '600', color: activeAccent },
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.8}
                      >
                        {tab.name.toUpperCase()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  container: {
    marginHorizontal: 16,
    alignSelf: 'center',
  },
  blurContainer: {
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1.0,
    textAlign: 'center',
  },
});

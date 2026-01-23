
import React from 'react';
import { Tabs } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';
import { useAppTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      tabBar={(props) => (
        <FloatingTabBar
          tabs={[
            {
              name: 'Today',
              route: '/(tabs)/(home)',
              ios_icon_name: 'sun.max',
              android_material_icon_name: 'wb-sunny',
            },
            {
              name: 'Journal',
              route: '/(tabs)/journal',
              ios_icon_name: 'book',
              android_material_icon_name: 'book',
            },
            {
              name: 'Grounding',
              route: '/(tabs)/grounding',
              ios_icon_name: 'timer',
              android_material_icon_name: 'timer',
            },
            {
              name: 'Nutrition',
              route: '/(tabs)/nutrition',
              ios_icon_name: 'leaf',
              android_material_icon_name: 'eco',
            },
            {
              name: 'Profile',
              route: '/(tabs)/profile',
              ios_icon_name: 'person.circle',
              android_material_icon_name: 'account-circle',
            },
          ]}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="(home)" options={{ headerShown: false }} />
      <Tabs.Screen name="journal" options={{ headerShown: false }} />
      <Tabs.Screen name="grounding" options={{ headerShown: false }} />
      <Tabs.Screen name="nutrition" options={{ headerShown: false }} />
      <Tabs.Screen name="profile" options={{ headerShown: false }} />
    </Tabs>
  );
}

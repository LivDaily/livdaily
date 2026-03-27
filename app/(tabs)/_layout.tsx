import React from 'react';
import { Tabs } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <FloatingTabBar
          tabs={[
            {
              name: 'Arrive',
              route: '/(tabs)/(arrive)',
              ios_icon_name: 'sunrise',
              android_material_icon_name: 'wb-sunny',
            },
            {
              name: 'Breathe',
              route: '/(tabs)/(breathe)',
              ios_icon_name: 'wind',
              android_material_icon_name: 'air',
            },
            {
              name: 'Restore',
              route: '/(tabs)/(restore)',
              ios_icon_name: 'moon.stars',
              android_material_icon_name: 'bedtime',
            },
          ]}
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="(arrive)" options={{ headerShown: false }} />
      <Tabs.Screen name="(breathe)" options={{ headerShown: false }} />
      <Tabs.Screen name="(restore)" options={{ headerShown: false }} />
    </Tabs>
  );
}

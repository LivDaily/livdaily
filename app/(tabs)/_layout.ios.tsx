import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(arrive)">
        <Label>Arrive</Label>
        <Icon sf={{ default: 'sunrise', selected: 'sunrise.fill' }} drawable="wb-sunny" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(breathe)">
        <Label>Breathe</Label>
        <Icon sf={{ default: 'wind', selected: 'wind' }} drawable="air" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(restore)">
        <Label>Restore</Label>
        <Icon sf={{ default: 'moon.stars', selected: 'moon.stars.fill' }} drawable="bedtime" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

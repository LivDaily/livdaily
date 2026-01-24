
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { useAppTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <Label>Today</Label>
        <Icon sf={{ default: 'sun.max', selected: 'sun.max.fill' }} drawable="wb-sunny" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="journal">
        <Label>Journal</Label>
        <Icon sf={{ default: 'book', selected: 'book.fill' }} drawable="book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="mindfulness">
        <Label>Mindful</Label>
        <Icon sf={{ default: 'sparkles', selected: 'sparkles' }} drawable="auto-awesome" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="nutrition">
        <Label>Nutrition</Label>
        <Icon sf={{ default: 'leaf', selected: 'leaf.fill' }} drawable="eco" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon sf={{ default: 'person.circle', selected: 'person.circle.fill' }} drawable="account-circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

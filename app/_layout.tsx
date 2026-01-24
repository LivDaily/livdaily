
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import React, { useEffect } from "react";
import { useColorScheme, AccessibilityInfo } from "react-native";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { ThemeProvider as AppThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Stack } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Announce app launch for screen readers
    AccessibilityInfo.announceForAccessibility('LivDaily wellness app loaded');
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppThemeProvider>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <WidgetProvider>
              <SystemBars style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth-popup" options={{ headerShown: false }} />
                <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="admin" 
                  options={{ 
                    headerShown: true,
                    title: 'Admin Panel',
                    presentation: 'modal',
                  }} 
                />
                <Stack.Screen 
                  name="movement" 
                  options={{ 
                    headerShown: true,
                    title: 'Movement',
                    presentation: 'modal',
                  }} 
                />
                <Stack.Screen 
                  name="sleep" 
                  options={{ 
                    headerShown: true,
                    title: 'Sleep',
                    presentation: 'modal',
                  }} 
                />
              </Stack>
              <StatusBar style="auto" />
            </WidgetProvider>
          </ThemeProvider>
        </AppThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

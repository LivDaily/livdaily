
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useAppTheme } from "@/contexts/ThemeContext";
import { ThemeName, themes } from "@/styles/commonStyles";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/utils/api";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { colors, themeName, setTheme } = useAppTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to auth screen if not logged in
      router.replace('/auth');
    } else if (user) {
      loadUserProfile();
    }
  }, [user, authLoading]);

  const loadUserProfile = async () => {
    try {
      const [profile, userData] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getMe(),
      ]);
      setUserProfile(profile);
      
      // Check if user is admin
      if (userData?.role === 'admin') {
        console.log('User is admin');
        setIsAdmin(true);
      }
      
      // Sync theme preference from backend
      if (profile?.themePreference && profile.themePreference !== themeName) {
        setTheme(profile.themePreference as ThemeName);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const themeOptions: { name: ThemeName; label: string; description: string }[] = [
    { name: 'earth_tones', label: 'Earth Tones', description: 'Warm, grounding natural hues' },
    { name: 'pastels', label: 'Pastels', description: 'Soft, gentle colors' },
    { name: 'neutrals', label: 'Neutrals', description: 'Clean, minimal palette' },
    { name: 'grounding', label: 'Grounding', description: 'Deep, centering tones' },
    { name: 'bright', label: 'Bright', description: 'Energizing, vibrant colors' },
    { name: 'seasonal_spring', label: 'Spring', description: 'Fresh, renewal energy' },
  ];

  const handleThemeChange = async (theme: ThemeName) => {
    console.log('User changed theme to:', theme);
    setTheme(theme);
    setShowThemeSelector(false);
    
    // Save theme preference to backend
    try {
      await userAPI.updateProfile({ themePreference: theme });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth');
            } catch (error) {
              console.error('Failed to sign out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 120,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: Platform.OS === 'android' ? 48 : 20,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      letterSpacing: -0.2,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    settingText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    settingSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    themeGrid: {
      gap: 12,
    },
    themeOption: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: colors.highlight,
    },
    themeOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.highlight,
    },
    themeOptionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    themeOptionName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    themeOptionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    themeColorPreview: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 12,
    },
    colorDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
  });

  const currentThemeLabel = themeOptions.find(t => t.name === themeName)?.label || 'Earth Tones';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Personalize your sanctuary
          </Text>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                console.log('User tapped theme selector');
                setShowThemeSelector(!showThemeSelector);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="paintbrush"
                    android_material_icon_name="palette"
                    size={24}
                    color={colors.primary}
                  />
                  <View>
                    <Text style={styles.settingText}>Color Theme</Text>
                    <Text style={styles.settingSubtext}>{currentThemeLabel}</Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {showThemeSelector && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.themeGrid}>
              {themeOptions.map((theme, index) => {
                const isSelected = themeName === theme.name;
                const themeColors = themes[theme.name];
                return (
                  <React.Fragment key={theme.name}>
                    <TouchableOpacity
                      style={[styles.themeOption, isSelected && styles.themeOptionSelected]}
                      onPress={() => handleThemeChange(theme.name)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.themeOptionHeader}>
                        <Text style={styles.themeOptionName}>{theme.label}</Text>
                        {isSelected && (
                          <IconSymbol
                            ios_icon_name="checkmark.circle.fill"
                            android_material_icon_name="check-circle"
                            size={20}
                            color={colors.primary}
                          />
                        )}
                      </View>
                      <Text style={styles.themeOptionDescription}>{theme.description}</Text>
                      <View style={styles.themeColorPreview}>
                        <View style={[styles.colorDot, { backgroundColor: themeColors.primary }]} />
                        <View style={[styles.colorDot, { backgroundColor: themeColors.secondary }]} />
                        <View style={[styles.colorDot, { backgroundColor: themeColors.accent }]} />
                        <View style={[styles.colorDot, { backgroundColor: themeColors.calm }]} />
                      </View>
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </Animated.View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wellness Tools</Text>
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="bell"
                    android_material_icon_name="notifications"
                    size={24}
                    color={colors.primary}
                  />
                  <View>
                    <Text style={styles.settingText}>Presence Notifications</Text>
                    <Text style={styles.settingSubtext}>Gentle reminders</Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350).duration(600)}>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="chart.bar"
                    android_material_icon_name="bar-chart"
                    size={24}
                    color={colors.primary}
                  />
                  <View>
                    <Text style={styles.settingText}>Tracking Preferences</Text>
                    <Text style={styles.settingSubtext}>Optional & supportive</Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Support</Text>
          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="lock.shield"
                    android_material_icon_name="security"
                    size={24}
                    color={colors.primary}
                  />
                  <View>
                    <Text style={styles.settingText}>Privacy Settings</Text>
                    <Text style={styles.settingSubtext}>Your data, your control</Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(450).duration(600)}>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="info.circle"
                    android_material_icon_name="info"
                    size={24}
                    color={colors.primary}
                  />
                  <View>
                    <Text style={styles.settingText}>About LivDaily</Text>
                    <Text style={styles.settingSubtext}>Version 1.0.0</Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin</Text>
            <Animated.View entering={FadeInDown.delay(450).duration(600)}>
              <TouchableOpacity 
                style={styles.card} 
                activeOpacity={0.7}
                onPress={() => {
                  console.log('User tapped Admin Panel');
                  router.push('/admin');
                }}
              >
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <IconSymbol
                      ios_icon_name="shield.checkered"
                      android_material_icon_name="admin-panel-settings"
                      size={24}
                      color={colors.primary}
                    />
                    <View>
                      <Text style={styles.settingText}>Admin Panel</Text>
                      <Text style={styles.settingSubtext}>Manage app content</Text>
                    </View>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {user && (
            <Animated.View entering={FadeInDown.delay(500).duration(600)}>
              <View style={styles.card}>
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <IconSymbol
                      ios_icon_name="person.circle"
                      android_material_icon_name="account-circle"
                      size={24}
                      color={colors.primary}
                    />
                    <View>
                      <Text style={styles.settingText}>{user.name || user.email}</Text>
                      <Text style={styles.settingSubtext}>{user.email}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(550).duration(600)}>
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: '#FF3B30' }]} 
              activeOpacity={0.7}
              onPress={handleSignOut}
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="arrow.right.square"
                    android_material_icon_name="exit-to-app"
                    size={24}
                    color="#FFFFFF"
                  />
                  <View>
                    <Text style={[styles.settingText, { color: '#FFFFFF' }]}>Sign Out</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useAppTheme } from "@/contexts/ThemeContext";
import { ThemeName, themes } from "@/styles/commonStyles";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/utils/api";
import { Stack, useRouter } from "expo-router";
import { useAlert } from "@/components/LoadingButton";

export default function ProfileScreen() {
  const { colors, themeName, setTheme } = useAppTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setProfileLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadUserProfile = async () => {
    console.log('Loading user profile data from backend');
    setProfileLoading(true);
    try {
      const profile = await userAPI.getProfile();
      
      console.log('User profile loaded:', { profile });
      setUserProfile(profile);
      
      if (profile?.themePreference && profile.themePreference !== themeName) {
        setTheme(profile.themePreference as ThemeName);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Don't show error alert - profile data is optional
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
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
    
    // Only try to save to backend if user is authenticated
    if (user) {
      try {
        await userAPI.updateProfile({ themePreference: theme });
        console.log('Theme preference saved to backend');
      } catch (error) {
        console.error('Failed to save theme preference:', error);
        // Don't show error - theme still works locally
      }
    }
  };

  const handleSignOut = async () => {
    showAlert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            console.log('User confirmed sign out');
            try {
              await signOut();
              console.log('Sign out successful');
            } catch (error) {
              console.error('Failed to sign out:', error);
              showAlert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAccessibilityPress = async () => {
    console.log('User tapped Accessibility Features');
    
    try {
      // Load current preferences
      const preferences = await userAPI.getPreferences();
      console.log('Current accessibility preferences:', preferences);
      
      showAlert(
        'Accessibility Features',
        `Current Settings:\n\n• Font Size: ${preferences?.fontSize || 'Medium'}\n• High Contrast: ${preferences?.highContrast ? 'On' : 'Off'}\n• Reduced Motion: ${preferences?.reducedMotion ? 'On' : 'Off'}\n• Screen Reader: ${preferences?.screenReaderEnabled ? 'On' : 'Off'}\n• Voice Control: ${preferences?.voiceControlEnabled ? 'On' : 'Off'}\n\nThese features help make LivDaily accessible to everyone.`
      );
    } catch (error) {
      console.error('Failed to load accessibility preferences:', error);
      showAlert(
        'Accessibility Features',
        'Customize your experience:\n\n• Adjustable font sizes\n• Screen reader compatibility\n• High contrast mode\n• Reduced motion options\n• Voice control support\n\nThese features help make LivDaily accessible to everyone.'
      );
    }
  };

  const handleNotificationsPress = async () => {
    console.log('User tapped Presence Notifications');
    
    try {
      // Load current preferences
      const preferences = await userAPI.getPreferences();
      const notifPrefs = preferences?.notificationPreferences || {};
      
      showAlert(
        'Presence Notifications',
        `Current Settings:\n\n• Morning Arrival: ${notifPrefs.morningArrival ? 'On' : 'Off'}\n• Midday Grounding: ${notifPrefs.middayGrounding ? 'On' : 'Off'}\n• Afternoon Movement: ${notifPrefs.afternoonMovement ? 'On' : 'Off'}\n• Evening Unwind: ${notifPrefs.eveningUnwind ? 'On' : 'Off'}\n• Night Rest: ${notifPrefs.nightRest ? 'On' : 'Off'}\n\nNotifications adapt to your rhythm and can be customized or turned off anytime.`
      );
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      showAlert(
        'Presence Notifications',
        'Gentle reminders throughout your day:\n\n• Morning arrival prompts\n• Midday grounding check-ins\n• Evening wind-down reminders\n• Personalized timing based on your patterns\n\nNotifications adapt to your rhythm and can be customized or turned off anytime.'
      );
    }
  };

  const handleTrackingPress = async () => {
    console.log('User tapped Tracking Preferences');
    
    try {
      // Load current preferences
      const preferences = await userAPI.getPreferences();
      const trackingPrefs = preferences?.trackingPreferences || {};
      
      showAlert(
        'Tracking Preferences',
        `Current Settings:\n\n• Movement Tracking: ${trackingPrefs.movementTracking ? 'On' : 'Off'}\n• Nutrition Tracking: ${trackingPrefs.nutritionTracking ? 'On' : 'Off'}\n• Sleep Tracking: ${trackingPrefs.sleepTracking ? 'On' : 'Off'}\n• Journal Tracking: ${trackingPrefs.journalTracking ? 'On' : 'Off'}\n• Grounding Tracking: ${trackingPrefs.groundingTracking ? 'On' : 'Off'}\n\nAll tracking is optional and can be turned on or off at any time. Your data is private and secure.`
      );
    } catch (error) {
      console.error('Failed to load tracking preferences:', error);
      showAlert(
        'Tracking Preferences',
        'Optional wellness tracking:\n\n• Movement and activity logs\n• Nutrition task completion\n• Sleep quality tracking\n• Journaling patterns\n• Grounding session history\n\nAll tracking is optional and can be turned on or off at any time. Your data is private and secure.'
      );
    }
  };

  const handlePrivacyPress = () => {
    console.log('User tapped Privacy Settings');
    showAlert(
      'Privacy Settings',
      'Your data, your control:\n\n• View what data is collected\n• Manage app permissions\n• Export your data\n• Delete your account\n• Control data sharing\n\nLivDaily is designed with privacy first. Your wellness journey is yours alone.'
    );
  };

  const handleSupportPress = () => {
    console.log('User tapped Support & Help');
    showAlert(
      'Support & Help',
      'We are here for you:\n\n• Frequently asked questions\n• Contact support team\n• Report technical issues\n• Share feedback\n• Request features\n\nYour experience matters. Reach out anytime you need assistance.'
    );
  };

  const handleAboutPress = () => {
    console.log('User tapped About LivDaily');
    showAlert(
      'About LivDaily',
      'Version 1.0.0\n\nLivDaily is your 24-hour rhythm companion, designed to support your wellness journey with warmth, presence, and care.\n\nCreated with intention to help you arrive, breathe, and find your rhythm throughout each day.\n\n© 2026 LivDaily'
    );
  };

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
      paddingTop: 20,
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
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
      gap: 12,
    },
    iconContainer: {
      marginTop: 2,
    },
    settingTextContainer: {
      flex: 1,
    },
    settingText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 4,
    },
    settingSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 12,
    },
  });

  const currentThemeLabel = themeOptions.find(t => t.name === themeName)?.label || 'Earth Tones';
  const userName = userProfile?.name || user?.name || user?.email || 'Guest';
  const userEmail = user?.email || 'Not signed in';

  if (authLoading || profileLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <IconSymbol
            ios_icon_name="person.circle"
            android_material_icon_name="account-circle"
            size={48}
            color={colors.primary}
          />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AlertComponent />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Profile settings screen"
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text 
            style={styles.headerTitle}
            accessible={true}
            accessibilityRole="header"
          >
            Settings
          </Text>
          <Text style={styles.headerSubtitle}>
            Personalize your sanctuary
          </Text>
        </Animated.View>

        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="header"
          >
            Appearance
          </Text>
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                console.log('User tapped theme selector');
                setShowThemeSelector(!showThemeSelector);
              }}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Color theme, currently ${currentThemeLabel}`}
              accessibilityHint="Double tap to change color theme"
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <IconSymbol
                      ios_icon_name="paintbrush"
                      android_material_icon_name="palette"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
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
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityLabel={`${theme.label} theme, ${theme.description}`}
                      accessibilityState={{ selected: isSelected }}
                      accessibilityHint="Double tap to select this theme"
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
          <Text 
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="header"
          >
            Accessibility
          </Text>
          <Animated.View entering={FadeInDown.delay(250).duration(600)}>
            <TouchableOpacity 
              style={styles.card}
              onPress={handleAccessibilityPress}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Accessibility settings"
              accessibilityHint="Double tap to view accessibility options"
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <IconSymbol
                      ios_icon_name="accessibility"
                      android_material_icon_name="accessibility"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingText}>Accessibility Features</Text>
                    <Text style={styles.settingSubtext}>Font size, screen reader, contrast</Text>
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
          <Text 
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="header"
          >
            Wellness Tools
          </Text>
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <TouchableOpacity 
              style={styles.card}
              onPress={handleNotificationsPress}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Presence notifications settings"
              accessibilityHint="Double tap to manage notification preferences"
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <IconSymbol
                      ios_icon_name="bell"
                      android_material_icon_name="notifications"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingText}>Presence Notifications</Text>
                    <Text style={styles.settingSubtext}>Gentle reminders throughout your day</Text>
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
            <TouchableOpacity 
              style={styles.card}
              onPress={handleTrackingPress}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Tracking preferences"
              accessibilityHint="Double tap to manage tracking settings"
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <IconSymbol
                      ios_icon_name="chart.bar"
                      android_material_icon_name="bar-chart"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingText}>Tracking Preferences</Text>
                    <Text style={styles.settingSubtext}>Optional wellness tracking controls</Text>
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
          <Text 
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="header"
          >
            Privacy & Support
          </Text>
          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <TouchableOpacity 
              style={styles.card}
              onPress={handlePrivacyPress}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Privacy settings"
              accessibilityHint="Double tap to manage privacy and data settings"
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <IconSymbol
                      ios_icon_name="lock.shield"
                      android_material_icon_name="security"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingText}>Privacy Settings</Text>
                    <Text style={styles.settingSubtext}>Data control, permissions, export</Text>
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
            <TouchableOpacity 
              style={styles.card}
              onPress={handleSupportPress}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Support and help"
              accessibilityHint="Double tap to access support resources"
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <IconSymbol
                      ios_icon_name="questionmark.circle"
                      android_material_icon_name="help"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingText}>Support & Help</Text>
                    <Text style={styles.settingSubtext}>FAQ, contact us, report issues</Text>
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

          <Animated.View entering={FadeInDown.delay(500).duration(600)}>
            <TouchableOpacity 
              style={styles.card}
              onPress={handleAboutPress}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="About LivDaily, version 1.0.0"
              accessibilityHint="Double tap to view app information"
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <IconSymbol
                      ios_icon_name="info.circle"
                      android_material_icon_name="info"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
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

        {user && (
          <View style={styles.section}>
            <Text 
              style={styles.sectionTitle}
              accessible={true}
              accessibilityRole="header"
            >
              Account
            </Text>
            <Animated.View entering={FadeInDown.delay(600).duration(600)}>
              <View 
                style={styles.card}
                accessible={true}
                accessibilityLabel={`Account information, ${userName}, ${userEmail}`}
              >
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View style={styles.iconContainer}>
                      <IconSymbol
                        ios_icon_name="person.circle"
                        android_material_icon_name="account-circle"
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingText}>{userName}</Text>
                      <Text style={styles.settingSubtext}>{userEmail}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(650).duration(600)}>
              <TouchableOpacity 
                style={[styles.card, { backgroundColor: '#FF3B30' }]} 
                activeOpacity={0.7}
                onPress={handleSignOut}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Sign out"
                accessibilityHint="Double tap to sign out of your account"
              >
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View style={styles.iconContainer}>
                      <IconSymbol
                        ios_icon_name="arrow.right.square"
                        android_material_icon_name="exit-to-app"
                        size={24}
                        color="#FFFFFF"
                      />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <Text style={[styles.settingText, { color: '#FFFFFF' }]}>Sign Out</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

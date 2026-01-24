
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import { adminAPI, userAPI } from '@/utils/api';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface AdminStats {
  totalUsers: number;
  totalJournalEntries: number;
  totalMovementLogs: number;
  totalNutritionTasks: number;
  totalSleepLogs: number;
  totalGroundingSessions: number;
}

export default function AdminScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMotivationForm, setShowMotivationForm] = useState(false);
  const [motivationContent, setMotivationContent] = useState('');
  const [motivationAuthor, setMotivationAuthor] = useState('');

  useEffect(() => {
    console.log('AdminScreen mounted - checking admin access');
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const userData = await userAPI.getMe();
      if (userData?.role === 'admin') {
        console.log('Admin access granted');
        setIsAdmin(true);
        loadStats();
      } else {
        console.log('Admin access denied - redirecting');
        Alert.alert('Access Denied', 'You do not have admin privileges');
        router.back();
      }
    } catch (error) {
      console.error('Failed to check admin access:', error);
      Alert.alert('Error', 'Failed to verify admin access');
      router.back();
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      console.log('Loading admin stats');
      const statsData = await adminAPI.getStats();
      setStats(statsData);
      console.log('Admin stats loaded successfully');
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      Alert.alert('Error', 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMotivation = async () => {
    if (!motivationContent.trim()) {
      Alert.alert('Error', 'Please enter motivation content');
      return;
    }

    try {
      console.log('Creating weekly motivation');
      const now = new Date();
      const weekStartDate = new Date(now);
      weekStartDate.setDate(now.getDate() - now.getDay());
      const weekStartStr = weekStartDate.toISOString().split('T')[0];

      await adminAPI.createMotivation({
        weekStartDate: weekStartStr,
        content: motivationContent.trim(),
        author: motivationAuthor.trim() || 'LivDaily Team',
      });

      setMotivationContent('');
      setMotivationAuthor('');
      setShowMotivationForm(false);
      Alert.alert('Success', 'Weekly motivation created successfully!');
    } catch (error) {
      console.error('Failed to create motivation:', error);
      Alert.alert('Error', 'Failed to create motivation');
    }
  };

  if (loading || !isAdmin) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Admin Panel',
            headerBackTitle: 'Back',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.text }}>Loading...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: Platform.OS === 'android' ? 48 : 20,
      paddingBottom: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    statsGrid: {
      paddingHorizontal: 24,
      marginBottom: 24,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      width: '48%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    statValue: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginHorizontal: 24,
      marginBottom: 16,
      letterSpacing: -0.3,
    },
    actionCard: {
      marginHorizontal: 24,
      marginBottom: 12,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    actionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    actionText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    actionSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    formCard: {
      marginHorizontal: 24,
      marginBottom: 24,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
    },
    formButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  const totalUsersText = stats?.totalUsers.toString() || '0';
  const totalJournalText = stats?.totalJournalEntries.toString() || '0';
  const totalMovementText = stats?.totalMovementLogs.toString() || '0';
  const totalNutritionText = stats?.totalNutritionTasks.toString() || '0';
  const totalSleepText = stats?.totalSleepLogs.toString() || '0';
  const totalGroundingText = stats?.totalGroundingSessions.toString() || '0';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Admin Panel',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <Text style={styles.title}>Admin Panel</Text>
            <Text style={styles.subtitle}>Manage LivDaily content</Text>
          </Animated.View>

          <Text style={styles.sectionTitle}>App Statistics</Text>
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalUsersText}</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalJournalText}</Text>
              <Text style={styles.statLabel}>Journal Entries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalMovementText}</Text>
              <Text style={styles.statLabel}>Movement Logs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalNutritionText}</Text>
              <Text style={styles.statLabel}>Nutrition Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalSleepText}</Text>
              <Text style={styles.statLabel}>Sleep Logs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalGroundingText}</Text>
              <Text style={styles.statLabel}>Grounding Sessions</Text>
            </View>
          </Animated.View>

          <Text style={styles.sectionTitle}>Content Management</Text>

          {!showMotivationForm && (
            <Animated.View entering={FadeInDown.delay(400).duration(600)}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setShowMotivationForm(true)}
                activeOpacity={0.7}
              >
                <View style={styles.actionRow}>
                  <View style={styles.actionLeft}>
                    <IconSymbol
                      ios_icon_name="sparkles"
                      android_material_icon_name="auto-awesome"
                      size={24}
                      color={colors.primary}
                    />
                    <View>
                      <Text style={styles.actionText}>Create Weekly Motivation</Text>
                      <Text style={styles.actionSubtext}>Add inspirational content</Text>
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
          )}

          {showMotivationForm && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.formCard}>
              <TextInput
                style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                placeholder="Motivation content..."
                placeholderTextColor={colors.textSecondary}
                value={motivationContent}
                onChangeText={setMotivationContent}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="Author (optional)"
                placeholderTextColor={colors.textSecondary}
                value={motivationAuthor}
                onChangeText={setMotivationAuthor}
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowMotivationForm(false);
                    setMotivationContent('');
                    setMotivationAuthor('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleCreateMotivation}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(450).duration(600)}>
            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.7}
            >
              <View style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <IconSymbol
                    ios_icon_name="photo"
                    android_material_icon_name="photo-library"
                    size={24}
                    color={colors.primary}
                  />
                  <View>
                    <Text style={styles.actionText}>Media Library</Text>
                    <Text style={styles.actionSubtext}>Manage photos and videos</Text>
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
              style={styles.actionCard}
              activeOpacity={0.7}
            >
              <View style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <IconSymbol
                    ios_icon_name="person.2"
                    android_material_icon_name="group"
                    size={24}
                    color={colors.primary}
                  />
                  <View>
                    <Text style={styles.actionText}>User Management</Text>
                    <Text style={styles.actionSubtext}>Manage user roles</Text>
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
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

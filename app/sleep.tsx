
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
import { sleepAPI } from '@/utils/api';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface SleepLog {
  id: string;
  bedtime?: string;
  wakeTime?: string;
  qualityRating?: number;
  windDownActivity?: string;
  reflection?: string;
  date: string;
}

interface SleepStats {
  avgQuality: number;
  avgDuration: number;
  patterns: {
    mostCommonWindDown: string | null;
    logCount: number;
  };
  period: string;
}

export default function SleepScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [qualityRating, setQualityRating] = useState(5);
  const [windDownActivity, setWindDownActivity] = useState('');
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    console.log('SleepScreen mounted');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading sleep logs and stats');
      const [logsData, statsData] = await Promise.all([
        sleepAPI.getLogs(),
        sleepAPI.getStats('week'),
      ]);
      setLogs(logsData);
      setStats(statsData);
      console.log('Sleep data loaded successfully');
    } catch (error) {
      console.error('Failed to load sleep data:', error);
      Alert.alert('Error', 'Failed to load sleep data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async () => {
    try {
      const now = new Date();
      const bedtime = new Date(now);
      bedtime.setHours(22, 0, 0, 0);
      
      console.log('Creating sleep log:', { qualityRating, windDownActivity });
      await sleepAPI.createLog({
        bedtime: bedtime.toISOString(),
        qualityRating,
        windDownActivity: windDownActivity.trim() || undefined,
        reflection: reflection.trim() || undefined,
        date: now.toISOString().split('T')[0],
      });
      
      setQualityRating(5);
      setWindDownActivity('');
      setReflection('');
      setShowAddForm(false);
      loadData();
      Alert.alert('Success', 'Sleep logged successfully!');
    } catch (error) {
      console.error('Failed to create sleep log:', error);
      Alert.alert('Error', 'Failed to log sleep');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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
    statsCard: {
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
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 28,
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
    addButton: {
      marginHorizontal: 24,
      marginBottom: 24,
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 8,
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
    formLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    ratingContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    ratingButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ratingButtonActive: {
      backgroundColor: colors.primary,
    },
    ratingText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    ratingTextActive: {
      color: '#FFFFFF',
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
    logsList: {
      paddingHorizontal: 24,
      gap: 12,
    },
    logCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    logDate: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    logQuality: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    logDetail: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    logReflection: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginTop: 8,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 16,
    },
  });

  const avgQualityText = stats?.avgQuality.toFixed(1) || '0';
  const avgDurationText = stats?.avgDuration.toFixed(1) || '0';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Sleep',
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
            <Text style={styles.title}>Sleep</Text>
            <Text style={styles.subtitle}>Track your rest and recovery</Text>
          </Animated.View>

          {stats && (
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{avgQualityText}</Text>
                  <Text style={styles.statLabel}>Avg Quality</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{avgDurationText}</Text>
                  <Text style={styles.statLabel}>Avg Hours</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {!showAddForm && (
            <Animated.View entering={FadeInDown.delay(400).duration(600)}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddForm(true)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.addButtonText}>Log Sleep</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {showAddForm && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.formCard}>
              <Text style={styles.formLabel}>Quality Rating</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => {
                  const isActive = qualityRating === rating;
                  const ratingStr = rating.toString();
                  return (
                    <React.Fragment key={rating}>
                      <TouchableOpacity
                        style={[styles.ratingButton, isActive && styles.ratingButtonActive]}
                        onPress={() => setQualityRating(rating)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.ratingText, isActive && styles.ratingTextActive]}>
                          {ratingStr}
                        </Text>
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Wind Down Activity (e.g., Reading, Meditation)"
                placeholderTextColor={colors.textSecondary}
                value={windDownActivity}
                onChangeText={setWindDownActivity}
              />
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Reflection (optional)"
                placeholderTextColor={colors.textSecondary}
                value={reflection}
                onChangeText={setReflection}
                multiline
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddForm(false);
                    setQualityRating(5);
                    setWindDownActivity('');
                    setReflection('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddLog}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          <Text style={styles.sectionTitle}>Recent Sleep</Text>
          <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.logsList}>
            {logs.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol
                  ios_icon_name="moon.stars"
                  android_material_icon_name="nights-stay"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyText}>No sleep logs yet</Text>
              </View>
            ) : (
              logs.map((log, index) => {
                const formattedDate = formatDate(log.date);
                const bedtimeText = formatTime(log.bedtime);
                const wakeTimeText = formatTime(log.wakeTime);
                const qualityText = log.qualityRating ? `${log.qualityRating}/10` : 'N/A';
                return (
                  <React.Fragment key={log.id}>
                    <View style={styles.logCard}>
                      <View style={styles.logHeader}>
                        <Text style={styles.logDate}>{formattedDate}</Text>
                        <Text style={styles.logQuality}>{qualityText}</Text>
                      </View>
                      <Text style={styles.logDetail}>Bedtime: {bedtimeText}</Text>
                      <Text style={styles.logDetail}>Wake: {wakeTimeText}</Text>
                      {log.windDownActivity && (
                        <Text style={styles.logDetail}>Wind Down: {log.windDownActivity}</Text>
                      )}
                      {log.reflection && (
                        <Text style={styles.logReflection}>{log.reflection}</Text>
                      )}
                    </View>
                  </React.Fragment>
                );
              })
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

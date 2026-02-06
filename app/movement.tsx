
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import { movementAPI } from '@/utils/api';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAlert } from '@/components/LoadingButton';

interface MovementLog {
  id: string;
  activityType: string;
  durationMinutes: number;
  completedAt: string;
  notes?: string;
}

interface MovementStats {
  totalMinutes: number;
  sessionsCount: number;
  favoriteActivities: { activity: string; count: number }[];
  period: string;
}

export default function MovementScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [logs, setLogs] = useState<MovementLog[]>([]);
  const [stats, setStats] = useState<MovementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    console.log('MovementScreen mounted');
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading movement logs and stats');
      const [logsData, statsData] = await Promise.all([
        movementAPI.getLogs(),
        movementAPI.getStats('week'),
      ]);
      setLogs(logsData || []);
      setStats(statsData || null);
      console.log('Movement data loaded successfully');
    } catch (error) {
      console.error('Failed to load movement data:', error);
      setLogs([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!activityType.trim() || !duration.trim()) {
      showAlert('Error', 'Please fill in activity type and duration');
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      showAlert('Error', 'Please enter a valid duration in minutes');
      return;
    }

    try {
      console.log('Creating movement log:', { activityType, durationMinutes: durationNum });
      const result = await movementAPI.createLog({
        activityType: activityType.trim(),
        durationMinutes: durationNum,
        notes: notes.trim() || undefined,
      });
      
      if (!result) {
        showAlert('Sign In Required', 'Please sign in to log movement activities');
        return;
      }
      
      setActivityType('');
      setDuration('');
      setNotes('');
      setShowAddForm(false);
      loadData();
      showAlert('Success', 'Movement logged successfully!');
    } catch (error) {
      console.error('Failed to create movement log:', error);
      showAlert('Error', 'Failed to log movement');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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
      marginBottom: 8,
    },
    logActivity: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    logDuration: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    logDate: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    logNotes: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
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

  const totalMinutesText = stats?.totalMinutes.toString() || '0';
  const sessionsCountText = stats?.sessionsCount.toString() || '0';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Movement',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <AlertComponent />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <Text style={styles.title}>Movement</Text>
            <Text style={styles.subtitle}>Track your physical activity</Text>
          </Animated.View>

          {stats && (
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalMinutesText}</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{sessionsCountText}</Text>
                  <Text style={styles.statLabel}>Sessions</Text>
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
                <Text style={styles.addButtonText}>Log Movement</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {showAddForm && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.formCard}>
              <TextInput
                style={styles.input}
                placeholder="Activity Type (e.g., Yoga, Running)"
                placeholderTextColor={colors.textSecondary}
                value={activityType}
                onChangeText={setActivityType}
              />
              <TextInput
                style={styles.input}
                placeholder="Duration (minutes)"
                placeholderTextColor={colors.textSecondary}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Notes (optional)"
                placeholderTextColor={colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddForm(false);
                    setActivityType('');
                    setDuration('');
                    setNotes('');
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

          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.logsList}>
            {logs.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol
                  ios_icon_name="figure.walk"
                  android_material_icon_name="directions-walk"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyText}>No movement logs yet</Text>
              </View>
            ) : (
              logs.map((log, index) => {
                const formattedDate = formatDate(log.completedAt);
                const durationText = `${log.durationMinutes} min`;
                return (
                  <React.Fragment key={log.id}>
                    <View style={styles.logCard}>
                      <View style={styles.logHeader}>
                        <Text style={styles.logActivity}>{log.activityType}</Text>
                        <Text style={styles.logDuration}>{durationText}</Text>
                      </View>
                      <Text style={styles.logDate}>{formattedDate}</Text>
                      {log.notes && <Text style={styles.logNotes}>{log.notes}</Text>}
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

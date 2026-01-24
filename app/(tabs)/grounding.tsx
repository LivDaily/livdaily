
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { groundingAPI } from '@/utils/api';
import { useRouter } from 'expo-router';

interface GroundingSession {
  id: string;
  sessionType: string;
  durationMinutes: number;
  completedAt: string;
  notes?: string;
}

export default function GroundingScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [sessions, setSessions] = useState<GroundingSession[]>([]);
  const [selectedType, setSelectedType] = useState<string>('breathwork');
  const [selectedDuration, setSelectedDuration] = useState<number>(5);

  const sessionTypes = [
    { id: 'breathwork', label: 'Breathwork', icon: 'wind', androidIcon: 'air' },
    { id: 'focus', label: 'Focus', icon: 'eye', androidIcon: 'visibility' },
    { id: 'rest', label: 'Rest', icon: 'moon', androidIcon: 'nights-stay' },
    { id: 'ritual', label: 'Ritual', icon: 'sparkles', androidIcon: 'auto-awesome' },
  ];

  const durations = [5, 10, 15, 20, 30];

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    console.log('Loading grounding sessions');
    try {
      const data = await groundingAPI.getSessions();
      setSessions(data || []);
    } catch (error) {
      console.error('Failed to load grounding sessions:', error);
    }
  };

  const handleStartSession = () => {
    console.log('User starting grounding session:', { type: selectedType, duration: selectedDuration });
    router.push({
      pathname: '/grounding-timer',
      params: {
        type: selectedType,
        duration: selectedDuration.toString(),
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
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
    card: {
      marginHorizontal: 24,
      marginTop: 20,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 24,
    },
    typeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.highlight,
      backgroundColor: colors.background,
      gap: 6,
    },
    typeChipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    typeChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    typeChipTextSelected: {
      color: '#FFFFFF',
    },
    durationGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 24,
    },
    durationChip: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.highlight,
      backgroundColor: colors.background,
    },
    durationChipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    durationChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    durationChipTextSelected: {
      color: '#FFFFFF',
    },
    startButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
    },
    startButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    sessionsSection: {
      marginTop: 32,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: -0.3,
    },
    sessionCard: {
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
    sessionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    sessionType: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textTransform: 'capitalize',
    },
    sessionDuration: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    sessionDate: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 12,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text style={styles.headerTitle}>Grounding</Text>
          <Text style={styles.headerSubtitle}>
            Find your center with breathwork and presence
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.card}>
          <Text style={styles.sectionLabel}>Session Type</Text>
          <View style={styles.typeGrid}>
            {sessionTypes.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <React.Fragment key={type.id}>
                  <TouchableOpacity
                    style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                    onPress={() => {
                      console.log('User selected session type:', type.id);
                      setSelectedType(type.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      ios_icon_name={type.icon}
                      android_material_icon_name={type.androidIcon}
                      size={16}
                      color={isSelected ? '#FFFFFF' : colors.text}
                    />
                    <Text style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Duration</Text>
          <View style={styles.durationGrid}>
            {durations.map((duration) => {
              const isSelected = selectedDuration === duration;
              const durationText = `${duration} min`;
              return (
                <React.Fragment key={duration}>
                  <TouchableOpacity
                    style={[styles.durationChip, isSelected && styles.durationChipSelected]}
                    onPress={() => {
                      console.log('User selected duration:', duration);
                      setSelectedDuration(duration);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.durationChipText, isSelected && styles.durationChipTextSelected]}>
                      {durationText}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartSession}
            activeOpacity={0.7}
          >
            <Text style={styles.startButtonText}>Begin Session</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="timer"
                android_material_icon_name="timer"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyStateText}>
                Your grounding sessions will appear here
              </Text>
            </View>
          ) : (
            sessions.map((session, index) => {
              const formattedDate = formatDate(session.completedAt);
              const durationText = `${session.durationMinutes} min`;
              return (
                <React.Fragment key={session.id}>
                  <Animated.View
                    entering={FadeInDown.delay(index * 100).duration(600)}
                    style={styles.sessionCard}
                  >
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionType}>{session.sessionType}</Text>
                      <Text style={styles.sessionDuration}>{durationText}</Text>
                    </View>
                    <Text style={styles.sessionDate}>{formattedDate}</Text>
                  </Animated.View>
                </React.Fragment>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

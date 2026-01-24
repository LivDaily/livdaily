
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { groundingAPI } from '@/utils/api';

export default function GroundingTimerScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const sessionType = (params.type as string) || 'breathwork';
  const initialDuration = parseInt((params.duration as string) || '5', 10);
  
  const [timeRemaining, setTimeRemaining] = useState(initialDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('Grounding timer initialized:', { sessionType, initialDuration });
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const handleStart = () => {
    console.log('User started grounding timer');
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    console.log('User paused grounding timer');
    setIsPaused(true);
  };

  const handleResume = () => {
    console.log('User resumed grounding timer');
    setIsPaused(false);
  };

  const handleStop = () => {
    console.log('User stopped grounding timer');
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: () => {
            setIsRunning(false);
            setIsPaused(false);
            router.back();
          },
        },
      ]
    );
  };

  const handleComplete = async () => {
    console.log('Grounding timer completed');
    setIsRunning(false);
    setIsPaused(false);

    try {
      await groundingAPI.createSession({
        sessionType,
        durationMinutes: initialDuration,
      });
      
      Alert.alert(
        'Session Complete',
        `Well done! You completed your ${initialDuration}-minute ${sessionType} session.`,
        [
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save grounding session:', error);
      Alert.alert('Session Complete', 'Well done!', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const minsDisplay = mins.toString();
    const secsDisplay = secs.toString().padStart(2, '0');
    return `${minsDisplay}:${secsDisplay}`;
  };

  const progress = 1 - timeRemaining / (initialDuration * 60);
  const timeDisplay = formatTime(timeRemaining);
  const sessionTypeLabel = sessionType.charAt(0).toUpperCase() + sessionType.slice(1);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: Platform.OS === 'android' ? 48 : 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sessionType: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 40,
      textAlign: 'center',
    },
    timerCircle: {
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 60,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    },
    timerText: {
      fontSize: 64,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -2,
    },
    timerSubtext: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 8,
    },
    controlsRow: {
      flexDirection: 'row',
      gap: 20,
      alignItems: 'center',
    },
    controlButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    primaryButton: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.primary,
    },
    stopButton: {
      backgroundColor: '#FF3B30',
    },
    progressBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: colors.highlight,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Grounding Session',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.content}>
          <Animated.Text entering={FadeIn.duration(600)} style={styles.sessionType}>
            {sessionTypeLabel}
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.timerCircle}>
            <Text style={styles.timerText}>{timeDisplay}</Text>
            <Text style={styles.timerSubtext}>
              {isPaused ? 'Paused' : isRunning ? 'Remaining' : 'Ready'}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.controlsRow}>
            {!isRunning ? (
              <TouchableOpacity
                style={[styles.controlButton, styles.primaryButton]}
                onPress={handleStart}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Start timer"
                accessibilityHint="Begin your grounding session"
              >
                <IconSymbol
                  ios_icon_name="play.fill"
                  android_material_icon_name="play-arrow"
                  size={40}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.controlButton, styles.stopButton]}
                  onPress={handleStop}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Stop timer"
                  accessibilityHint="End the session early"
                >
                  <IconSymbol
                    ios_icon_name="stop.fill"
                    android_material_icon_name="stop"
                    size={32}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, styles.primaryButton]}
                  onPress={isPaused ? handleResume : handlePause}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={isPaused ? 'Resume timer' : 'Pause timer'}
                  accessibilityHint={isPaused ? 'Continue the session' : 'Pause the session'}
                >
                  <IconSymbol
                    ios_icon_name={isPaused ? 'play.fill' : 'pause.fill'}
                    android_material_icon_name={isPaused ? 'play-arrow' : 'pause'}
                    size={40}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </SafeAreaView>
    </>
  );
}

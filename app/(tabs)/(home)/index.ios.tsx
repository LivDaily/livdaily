
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import { commonStyles } from '@/styles/commonStyles';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { motivationAPI } from '@/utils/api';
import { Stack, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

interface RhythmPhase {
  id: string;
  name: string;
  time: string;
  description: string;
  image: string;
  icon: string;
  androidIcon: string;
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState<string>('morning');
  const [greeting, setGreeting] = useState<string>('');
  const [weeklyMotivation, setWeeklyMotivation] = useState<string>('');

  const formatTime = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const rhythmPhases: RhythmPhase[] = [
    {
      id: 'morning',
      name: 'Morning Arrival',
      time: `${formatTime(6)} - ${formatTime(10)}`,
      description: 'Begin your day with gentle presence',
      image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800',
      icon: 'sunrise',
      androidIcon: 'wb-twilight',
    },
    {
      id: 'midday',
      name: 'Midday Grounding',
      time: `${formatTime(10)} - ${formatTime(14)}`,
      description: 'Find your center in the day',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      icon: 'sun.max',
      androidIcon: 'wb-sunny',
    },
    {
      id: 'afternoon',
      name: 'Afternoon Movement',
      time: `${formatTime(14)} - ${formatTime(18)}`,
      description: 'Flow with your energy',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      icon: 'figure.walk',
      androidIcon: 'directions-walk',
    },
    {
      id: 'evening',
      name: 'Evening Unwinding',
      time: `${formatTime(18)} - ${formatTime(22)}`,
      description: 'Release the day with care',
      image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800',
      icon: 'sunset',
      androidIcon: 'wb-twilight',
    },
    {
      id: 'night',
      name: 'Night Rest',
      time: `${formatTime(22)} - ${formatTime(6)}`,
      description: 'Embrace peaceful restoration',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
      icon: 'moon.stars',
      androidIcon: 'nights-stay',
    },
  ];

  useEffect(() => {
    console.log('HomeScreen mounted - determining current rhythm phase');
    determineCurrentPhase();
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      console.log('User authenticated, loading weekly motivation');
      loadWeeklyMotivation();
    }
  }, [user, authLoading]);

  const loadWeeklyMotivation = async () => {
    try {
      const data = await motivationAPI.getCurrent();
      if (data?.content) {
        setWeeklyMotivation(data.content);
      } else {
        setWeeklyMotivation('');
      }
    } catch (error) {
      console.error('Failed to load weekly motivation:', error);
      setWeeklyMotivation('');
    }
  };

  const determineCurrentPhase = () => {
    const hour = new Date().getHours();
    let phase = 'morning';
    let greetingText = 'Good morning';

    if (hour >= 6 && hour < 10) {
      phase = 'morning';
      greetingText = 'Good morning';
    } else if (hour >= 10 && hour < 14) {
      phase = 'midday';
      greetingText = 'Welcome to midday';
    } else if (hour >= 14 && hour < 18) {
      phase = 'afternoon';
      greetingText = 'Good afternoon';
    } else if (hour >= 18 && hour < 22) {
      phase = 'evening';
      greetingText = 'Good evening';
    } else {
      phase = 'night';
      greetingText = 'Good night';
    }

    console.log('Current phase determined:', phase, 'at hour:', hour);
    setCurrentPhase(phase);
    setGreeting(greetingText);
  };

  const currentRhythm = rhythmPhases.find(p => p.id === currentPhase) || rhythmPhases[0];

  const handleGroundingTimer = () => {
    console.log('User tapped Grounding Timer - navigating to grounding tab');
    router.push('/(tabs)/grounding');
  };

  const handleMovement = () => {
    console.log('User tapped Movement - navigating to movement screen');
    router.push('/movement');
  };

  const handleNutrition = () => {
    console.log('User tapped Nutrition - navigating to nutrition tab');
    router.push('/(tabs)/nutrition');
  };

  const handleSleep = () => {
    console.log('User tapped Sleep - navigating to sleep screen');
    router.push('/sleep');
  };

  const handleRhythmPhase = (phaseId: string) => {
    console.log('User tapped rhythm phase:', phaseId);
    if (phaseId === 'morning' || phaseId === 'midday') {
      router.push('/(tabs)/grounding');
    } else if (phaseId === 'afternoon') {
      router.push('/movement');
    } else if (phaseId === 'evening') {
      router.push('/(tabs)/journal');
    } else if (phaseId === 'night') {
      router.push('/sleep');
    }
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
    greetingText: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    dateText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    heroCard: {
      marginHorizontal: 24,
      marginTop: 20,
      borderRadius: 24,
      overflow: 'hidden',
      height: 320,
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 24,
    },
    heroPhaseIcon: {
      marginBottom: 12,
    },
    heroPhaseName: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    heroPhaseTime: {
      fontSize: 16,
      color: '#FFFFFF',
      opacity: 0.9,
      marginBottom: 8,
    },
    heroPhaseDescription: {
      fontSize: 16,
      color: '#FFFFFF',
      opacity: 0.95,
      lineHeight: 24,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginHorizontal: 24,
      marginTop: 32,
      marginBottom: 16,
      letterSpacing: -0.3,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
    },
    quickActionCard: {
      width: (width - 56) / 2,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
      margin: 6,
    },
    quickActionIcon: {
      marginBottom: 12,
    },
    quickActionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    quickActionSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    rhythmPhasesContainer: {
      paddingHorizontal: 24,
    },
    rhythmPhaseCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      overflow: 'hidden',
      flexDirection: 'row',
      height: 100,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
      marginBottom: 12,
    },
    rhythmPhaseImage: {
      width: 100,
      height: 100,
    },
    rhythmPhaseContent: {
      flex: 1,
      padding: 16,
      justifyContent: 'center',
    },
    rhythmPhaseName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    rhythmPhaseTime: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    motivationCard: {
      marginHorizontal: 24,
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    motivationText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      fontStyle: 'italic',
      textAlign: 'center',
    },
  });

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.dateText}>{todayDate}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.heroCard}>
          <Image
            source={resolveImageSource(currentRhythm.image)}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroOverlay}
          >
            <View style={styles.heroPhaseIcon}>
              <IconSymbol
                ios_icon_name={currentRhythm.icon}
                android_material_icon_name={currentRhythm.androidIcon}
                size={32}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.heroPhaseName}>{currentRhythm.name}</Text>
            <Text style={styles.heroPhaseTime}>{currentRhythm.time}</Text>
            <Text style={styles.heroPhaseDescription}>{currentRhythm.description}</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleGroundingTimer}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol
                ios_icon_name="timer"
                android_material_icon_name="timer"
                size={32}
                color={colors.primary}
              />
            </View>
            <Text style={styles.quickActionTitle}>Grounding</Text>
            <Text style={styles.quickActionSubtitle}>Breathwork & Focus</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleMovement}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol
                ios_icon_name="figure.walk"
                android_material_icon_name="directions-walk"
                size={32}
                color={colors.primary}
              />
            </View>
            <Text style={styles.quickActionTitle}>Movement</Text>
            <Text style={styles.quickActionSubtitle}>Guided Workouts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleNutrition}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol
                ios_icon_name="leaf"
                android_material_icon_name="eco"
                size={32}
                color={colors.primary}
              />
            </View>
            <Text style={styles.quickActionTitle}>Nutrition</Text>
            <Text style={styles.quickActionSubtitle}>Daily Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleSleep}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol
                ios_icon_name="moon.stars"
                android_material_icon_name="nights-stay"
                size={32}
                color={colors.primary}
              />
            </View>
            <Text style={styles.quickActionTitle}>Sleep</Text>
            <Text style={styles.quickActionSubtitle}>Wind Down</Text>
          </TouchableOpacity>
        </Animated.View>

        {weeklyMotivation ? (
          <>
            <Text style={styles.sectionTitle}>This Week&apos;s Inspiration</Text>
            <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.motivationCard}>
              <Text style={styles.motivationText}>{weeklyMotivation}</Text>
            </Animated.View>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Your Daily Rhythm</Text>
        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.rhythmPhasesContainer}>
          {rhythmPhases.map((phase) => (
            <TouchableOpacity
              key={phase.id}
              style={styles.rhythmPhaseCard}
              activeOpacity={0.7}
              onPress={() => handleRhythmPhase(phase.id)}
            >
              <Image
                source={resolveImageSource(phase.image)}
                style={styles.rhythmPhaseImage}
                resizeMode="cover"
              />
              <View style={styles.rhythmPhaseContent}>
                <Text style={styles.rhythmPhaseName}>{phase.name}</Text>
                <Text style={styles.rhythmPhaseTime}>{phase.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { PillarBadge } from '@/components/PillarBadge';

const ARRIVE_PROMPTS = [
  "What does your body need most right now?",
  "Name three things you can feel beneath your feet.",
  "What would it mean to move slowly today?",
  "Where in your body do you feel most at ease?",
  "What are you carrying that you could set down?",
  "What is one thing you are grateful for this morning?",
  "How does the air feel against your skin right now?",
  "What intention would serve you most today?",
  "What would 'enough' look like for you today?",
  "Notice your breath. Is it shallow or deep?",
  "What sounds can you hear right now?",
  "What would you tell your future self tonight?",
  "Where does your attention want to go today?",
  "What does your heart feel like this morning?",
  "What small act of kindness could you offer today?",
  "What are you most curious about right now?",
  "What would it feel like to move through today with ease?",
  "What is one thing you can let go of before this day begins?",
  "How does your body feel after a night of rest?",
  "What color does this morning feel like to you?",
  "What would nourish you most today?",
  "What is already going well, even now?",
  "What does your nervous system need to feel safe?",
  "What would you do today if you weren't afraid?",
  "What is the quality of light around you right now?",
  "What does your body want to do that your mind resists?",
  "What would it mean to be fully present today?",
  "What are you looking forward to, however small?",
  "What would you like to remember about this morning?",
  "How can you be gentle with yourself today?",
];

const RHYTHM_STEPS = [
  "Feel your feet on the floor.",
  "Take 3 slow, deep breaths.",
  "Name what you notice around you.",
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const TIMER_SECONDS = 120;

export default function ArriveScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();

  const promptIndex = getDayOfYear() % ARRIVE_PROMPTS.length;
  const todayPrompt = ARRIVE_PROMPTS[promptIndex];
  const greeting = getGreeting();

  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [intention, setIntention] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Stagger anims for cards
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(card1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(card2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(card3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const startTimer = useCallback(() => {
    console.log('[Arrive] User tapped Begin — starting 2-minute rhythm reset');
    setTimerActive(true);
    setTimerDone(false);
    setSecondsLeft(TIMER_SECONDS);
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: TIMER_SECONDS * 1000,
      useNativeDriver: false,
    }).start();
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerActive(false);
          setTimerDone(true);
          console.log('[Arrive] Rhythm reset timer completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [progressAnim]);

  const stopTimer = useCallback(() => {
    console.log('[Arrive] User tapped Done — stopping timer');
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
    setTimerDone(false);
    setSecondsLeft(TIMER_SECONDS);
    progressAnim.setValue(0);
  }, [progressAnim]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const minutesDisplay = Math.floor(secondsLeft / 60);
  const secondsDisplay = secondsLeft % 60;
  const timeString = `${minutesDisplay}:${secondsDisplay.toString().padStart(2, '0')}`;

  const beginButtonLabel = timerDone ? 'Begin Again' : 'Begin';

  const card1Style = {
    opacity: card1Anim,
    transform: [{ translateY: card1Anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };
  const card2Style = {
    opacity: card2Anim,
    transform: [{ translateY: card2Anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };
  const card3Style = {
    opacity: card3Anim,
    transform: [{ translateY: card3Anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, backgroundColor: C.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: 120,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner with LinearGradient */}
        <View style={{ height: 220, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#C4956A', '#F7F4EF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          {/* Watermark leaf */}
          <Text
            style={{
              position: 'absolute',
              top: 10,
              right: 16,
              fontSize: 80,
              opacity: 0.15,
              lineHeight: 100,
            }}
          >
            🌿
          </Text>
          {/* Hero text */}
          <View
            style={{
              position: 'absolute',
              bottom: 28,
              left: 20,
              right: 20,
              gap: 8,
            }}
          >
            <Text
              style={{
                fontSize: 34,
                fontFamily: 'Lora_700Bold',
                color: '#FFFFFF',
                letterSpacing: -0.5,
              }}
            >
              {greeting}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 22,
              }}
            >
              Take a moment to land.
            </Text>
            <PillarBadge label="🌿 Earth · Morning" pillar="arrive" />
          </View>
        </View>

        {/* Daily Anchor — premium quote card */}
        <Animated.View style={[{ paddingHorizontal: 20 }, card1Style]}>
          <View
            style={{
              backgroundColor: C.arriveMuted,
              borderRadius: 20,
              borderCurve: 'continuous',
              padding: 24,
              borderLeftWidth: 4,
              borderLeftColor: C.arrive,
              borderWidth: 1,
              borderColor: C.border,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(196,149,106,0.12), 0 4px 16px rgba(0,0,0,0.04)',
            } as any}
          >
            {/* Decorative quotation mark */}
            <Text
              style={{
                position: 'absolute',
                top: -8,
                left: 12,
                fontSize: 80,
                fontFamily: 'Lora_700Bold',
                color: C.arrive,
                opacity: 0.08,
                lineHeight: 100,
              }}
            >
              "
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 1.2,
                color: C.arrive,
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              Today's Anchor
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontFamily: 'Lora_400Regular_Italic',
                color: C.text,
                lineHeight: 34,
              }}
            >
              {`"${todayPrompt}"`}
            </Text>
          </View>
        </Animated.View>

        {/* Rhythm Reset */}
        <Animated.View style={[{ paddingHorizontal: 20 }, card2Style]}>
          <View
            style={{
              backgroundColor: C.surface,
              borderRadius: 20,
              borderCurve: 'continuous',
              padding: 20,
              borderWidth: 1,
              borderColor: C.border,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
              gap: 16,
            } as any}
          >
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1.2,
                  color: C.arrive,
                  textTransform: 'uppercase',
                }}
              >
                Rhythm Reset
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'Lora_700Bold',
                  color: C.text,
                  letterSpacing: -0.2,
                }}
              >
                Ground yourself in 2 minutes
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: C.textSecondary,
                  lineHeight: 22,
                  marginTop: 4,
                }}
              >
                A simple sequence to anchor your body and quiet your mind before the day begins.
              </Text>
            </View>

            {/* Steps */}
            <View style={{ gap: 10 }}>
              {RHYTHM_STEPS.map((step, i) => {
                const stepNum = i + 1;
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: C.arriveMuted,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.arrive }}>
                        {stepNum}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        color: C.text,
                        lineHeight: 22,
                        flex: 1,
                        paddingTop: 3,
                      }}
                    >
                      {step}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Timer area */}
            {timerActive && (
              <View style={{ gap: 12 }}>
                <View
                  style={{
                    height: 6,
                    backgroundColor: C.arriveMuted,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <Animated.View
                    style={{
                      height: '100%',
                      width: progressWidth,
                      backgroundColor: C.arrive,
                      borderRadius: 3,
                    }}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      fontSize: 28,
                      fontFamily: 'Lora_700Bold',
                      color: C.arrive,
                      letterSpacing: -0.5,
                    }}
                  >
                    {timeString}
                  </Text>
                  <AnimatedPressable onPress={stopTimer}>
                    <View
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 12,
                        borderCurve: 'continuous',
                        backgroundColor: C.surfaceSecondary,
                      } as any}
                    >
                      <Text style={{ fontSize: 15, fontWeight: '600', color: C.textSecondary }}>
                        Done
                      </Text>
                    </View>
                  </AnimatedPressable>
                </View>
              </View>
            )}

            {timerDone && (
              <View
                style={{
                  backgroundColor: C.arriveMuted,
                  borderRadius: 12,
                  padding: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontFamily: 'Lora_400Regular_Italic', color: C.arrive }}>
                  Well done. You've arrived.
                </Text>
              </View>
            )}

            {!timerActive && (
              <AnimatedPressable onPress={startTimer}>
                <View
                  style={{
                    backgroundColor: C.arrive,
                    borderRadius: 14,
                    borderCurve: 'continuous',
                    paddingVertical: 16,
                    alignItems: 'center',
                  } as any}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 }}>
                    {beginButtonLabel}
                  </Text>
                </View>
              </AnimatedPressable>
            )}
          </View>
        </Animated.View>

        {/* Intention Space */}
        <Animated.View style={[{ paddingHorizontal: 20 }, card3Style]}>
          <View
            style={{
              backgroundColor: C.surface,
              borderRadius: 20,
              borderCurve: 'continuous',
              padding: 20,
              borderWidth: 1,
              borderColor: C.border,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
              gap: 12,
            } as any}
          >
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1.2,
                  color: C.arrive,
                  textTransform: 'uppercase',
                }}
              >
                Set Your Intention
              </Text>
              <Text style={{ fontSize: 15, color: C.textSecondary, lineHeight: 22 }}>
                One word or phrase for today. No pressure.
              </Text>
            </View>
            <TextInput
              value={intention}
              onChangeText={(text) => {
                console.log('[Arrive] Intention updated:', text);
                setIntention(text);
              }}
              placeholder="e.g. ease, presence, courage..."
              placeholderTextColor={C.textTertiary}
              style={{
                fontSize: 18,
                fontFamily: 'Lora_400Regular',
                color: C.text,
                backgroundColor: C.surfaceSecondary,
                borderRadius: 12,
                borderCurve: 'continuous',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: C.border,
              } as any}
              returnKeyType="done"
              maxLength={60}
            />
            <Text style={{ fontSize: 13, color: C.textTertiary, lineHeight: 18 }}>
              This is just for you. It disappears when you leave.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

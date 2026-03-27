import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
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
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial hero — typographic, no gradient */}
        <View
          style={{
            paddingTop: insets.top + 24,
            paddingHorizontal: 24,
            paddingBottom: 32,
            borderBottomWidth: 1,
            borderBottomColor: C.divider,
            gap: 12,
          }}
        >
          <PillarBadge label="Earth · Morning" pillar="arrive" />
          <Text
            style={{
              fontSize: 40,
              fontFamily: 'PlayfairDisplay_700Bold',
              color: C.text,
              letterSpacing: -0.5,
              lineHeight: 46,
              marginTop: 4,
            }}
          >
            {greeting}
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: C.textSecondary,
              lineHeight: 22,
            }}
          >
            Take a moment to land.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, gap: 32, paddingTop: 32 }}>
          {/* Daily Anchor — editorial quote card */}
          <Animated.View style={card1Style}>
            <View
              style={{
                backgroundColor: C.surface,
                borderRadius: 4,
                padding: 24,
                borderWidth: 1,
                borderColor: C.border,
                borderLeftWidth: 2,
                borderLeftColor: C.arrive,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              } as any}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  letterSpacing: 1.0,
                  color: C.arrive,
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Today's Anchor
              </Text>
              {/* Large decorative quote mark */}
              <Text
                style={{
                  fontSize: 72,
                  fontFamily: 'PlayfairDisplay_700Bold',
                  color: C.arrive,
                  opacity: 0.10,
                  lineHeight: 52,
                  marginBottom: 4,
                }}
              >
                {'"'}
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: 'PlayfairDisplay_400Regular_Italic',
                  color: C.text,
                  lineHeight: 34,
                  marginTop: -8,
                }}
              >
                {todayPrompt}
              </Text>
            </View>
          </Animated.View>

          {/* Thin divider */}
          <View style={{ height: 1, backgroundColor: C.divider }} />

          {/* Rhythm Reset */}
          <Animated.View style={[card2Style, { gap: 20 }]}>
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  letterSpacing: 1.0,
                  color: C.arrive,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Rhythm Reset
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: 'PlayfairDisplay_700Bold',
                  color: C.text,
                  letterSpacing: -0.3,
                  lineHeight: 30,
                }}
              >
                Ground yourself{'\n'}in 2 minutes
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: C.textSecondary,
                  lineHeight: 22,
                  marginTop: 8,
                }}
              >
                A simple sequence to anchor your body and quiet your mind before the day begins.
              </Text>
            </View>

            {/* Steps — left-border accent style */}
            <View style={{ gap: 0 }}>
              {RHYTHM_STEPS.map((step, i) => {
                const stepNum = i + 1;
                const isLast = i === RHYTHM_STEPS.length - 1;
                return (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: 16,
                      paddingVertical: 12,
                      borderBottomWidth: isLast ? 0 : 1,
                      borderBottomColor: C.divider,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: C.arrive,
                        letterSpacing: 0.5,
                        width: 20,
                        paddingTop: 2,
                      }}
                    >
                      {String(stepNum).padStart(2, '0')}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        color: C.text,
                        lineHeight: 22,
                        flex: 1,
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
                    height: 2,
                    backgroundColor: C.arriveMuted,
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Animated.View
                    style={{
                      height: '100%',
                      width: progressWidth,
                      backgroundColor: C.arrive,
                    }}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      fontSize: 36,
                      fontFamily: 'PlayfairDisplay_700Bold',
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
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: C.border,
                        backgroundColor: C.surfaceSecondary,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '600',
                          letterSpacing: 1.0,
                          textTransform: 'uppercase',
                          color: C.textSecondary,
                        }}
                      >
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
                  borderLeftWidth: 2,
                  borderLeftColor: C.arrive,
                  paddingLeft: 16,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'PlayfairDisplay_400Regular_Italic',
                    color: C.arrive,
                  }}
                >
                  Well done. You've arrived.
                </Text>
              </View>
            )}

            {!timerActive && (
              <AnimatedPressable onPress={startTimer}>
                <View
                  style={{
                    backgroundColor: C.primary,
                    borderRadius: 4,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#FFFFFF',
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                    }}
                  >
                    {beginButtonLabel}
                  </Text>
                </View>
              </AnimatedPressable>
            )}
          </Animated.View>

          {/* Thin divider */}
          <View style={{ height: 1, backgroundColor: C.divider }} />

          {/* Intention Space */}
          <Animated.View style={[card3Style, { gap: 16, paddingBottom: 8 }]}>
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  letterSpacing: 1.0,
                  color: C.arrive,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Set Your Intention
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'PlayfairDisplay_700Bold',
                  color: C.text,
                  letterSpacing: -0.2,
                }}
              >
                One word for today
              </Text>
              <Text style={{ fontSize: 15, color: C.textSecondary, lineHeight: 22, marginTop: 4 }}>
                No pressure. Just a direction.
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
                fontFamily: 'PlayfairDisplay_400Regular',
                color: C.text,
                backgroundColor: C.surfaceSecondary,
                borderRadius: 4,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: C.border,
              } as any}
              returnKeyType="done"
              maxLength={60}
            />
            <Text style={{ fontSize: 12, color: C.textTertiary, lineHeight: 18 }}>
              This is just for you. It disappears when you leave.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { PillarBadge } from '@/components/PillarBadge';
import { PromptCard } from '@/components/PromptCard';

const RESTORE_PROMPTS = [
  "What moment today are you most grateful for?",
  "What can you release before sleep?",
  "Where did you show up for yourself today?",
  "What surprised you today?",
  "What would you do differently tomorrow?",
  "What small joy did you experience today?",
  "Who made you feel seen today?",
  "What did your body do well today?",
  "What is one thing you learned today?",
  "What felt heavy today that you can set down now?",
  "What are you proud of, however small?",
  "What did you notice today that you usually miss?",
  "What would you like to carry into tomorrow?",
  "What does your body need to rest well tonight?",
  "What was the most peaceful moment of your day?",
  "What conversation meant the most to you today?",
  "What did you do today that was just for you?",
  "What are three things that went right today?",
  "What would you say to yourself at the start of today?",
  "What does rest mean to you right now?",
  "What are you letting go of as you close this day?",
  "What made you smile today?",
  "What did you give to others today?",
  "What did you receive today?",
  "What is one thing you want to remember about today?",
  "How did you take care of yourself today?",
  "What felt true today?",
  "What are you looking forward to tomorrow?",
  "What does your heart need to hear right now?",
  "What would make tomorrow feel like enough?",
];

const CLOSING_THOUGHTS = [
  "You showed up today. That's enough.",
  "Rest is not a reward. It is a right.",
  "The day is complete. You are complete.",
  "Tomorrow begins with tonight's stillness.",
  "You did more than you know.",
  "Let the day go. It has served its purpose.",
  "Peace is always available. It begins here.",
  "You are allowed to rest without earning it.",
  "This moment of stillness is a gift to yourself.",
  "The quiet at the end of the day is yours.",
];

interface WindDownPractice {
  id: number;
  title: string;
  duration: string;
  durationSeconds: number;
  description: string;
}

const WIND_DOWN_PRACTICES: WindDownPractice[] = [
  {
    id: 1,
    title: 'Body Scan',
    duration: '5 min',
    durationSeconds: 300,
    description: 'A slow journey through the body, releasing tension from head to toe.',
  },
  {
    id: 2,
    title: 'Gratitude Pause',
    duration: '3 min',
    durationSeconds: 180,
    description: 'Three things. No more, no less. Let them land.',
  },
  {
    id: 3,
    title: 'Sleep Breath',
    duration: '4 min',
    durationSeconds: 240,
    description: 'A gentle breath pattern to prepare the nervous system for rest.',
  },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function RestoreScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();

  const dayOfYear = getDayOfYear();
  const promptIndex = dayOfYear % RESTORE_PROMPTS.length;
  const closingIndex = dayOfYear % CLOSING_THOUGHTS.length;
  const todayPrompt = RESTORE_PROMPTS[promptIndex];
  const closingThought = CLOSING_THOUGHTS[closingIndex];

  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnims = useRef(
    WIND_DOWN_PRACTICES.reduce((acc, p) => {
      acc[p.id] = new Animated.Value(0);
      return acc;
    }, {} as Record<number, Animated.Value>)
  ).current;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(WIND_DOWN_PRACTICES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    Animated.stagger(
      80,
      cardAnims.map((anim) =>
        Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true })
      )
    ).start();
  }, []);

  const startPractice = useCallback((practice: WindDownPractice) => {
    console.log('[Restore] User started practice:', practice.title);
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveTimer(practice.id);
    setSecondsLeft(practice.durationSeconds);
    progressAnims[practice.id].setValue(0);
    Animated.timing(progressAnims[practice.id], {
      toValue: 1,
      duration: practice.durationSeconds * 1000,
      useNativeDriver: false,
    }).start();
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setActiveTimer(null);
          console.log('[Restore] Practice completed:', practice.title);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [progressAnims]);

  const stopPractice = useCallback(() => {
    console.log('[Restore] User stopped practice');
    if (timerRef.current) clearInterval(timerRef.current);
    if (activeTimer !== null) {
      progressAnims[activeTimer].setValue(0);
    }
    setActiveTimer(null);
    setSecondsLeft(0);
  }, [activeTimer, progressAnims]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, backgroundColor: C.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: C.background }}
      >
        {/* Editorial hero — typographic */}
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
          <PillarBadge label="Water · Evening" pillar="restore" />
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
            Restore
          </Text>
          <Text style={{ fontSize: 15, color: C.textSecondary, lineHeight: 22 }}>
            Release the day. Return to stillness.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 32, gap: 32 }}>
          {/* Evening Reflection */}
          <PromptCard
            label="Evening Reflection"
            prompt={todayPrompt}
            accentColor={C.restore}
            accentMuted={C.restoreMuted}
          />

          {/* Thin divider */}
          <View style={{ height: 1, backgroundColor: C.divider }} />

          {/* Wind-Down Practices */}
          <View style={{ gap: 16 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                letterSpacing: 1.0,
                color: C.restore,
                textTransform: 'uppercase',
              }}
            >
              Wind-Down Practices
            </Text>

            {WIND_DOWN_PRACTICES.map((practice, index) => {
              const isActive = activeTimer === practice.id;
              const progressWidth = progressAnims[practice.id].interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              });
              const cardAnim = cardAnims[index];
              const cardStyle = {
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              };

              const buttonLabel = isActive ? 'Active' : 'Begin';

              return (
                <Animated.View key={practice.id} style={cardStyle}>
                  <AnimatedPressable
                    onPress={() => {
                      if (!isActive) startPractice(practice);
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: isActive ? C.restoreMuted : C.surface,
                        borderRadius: 4,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: isActive ? C.restore + '40' : C.border,
                        borderLeftWidth: 2,
                        borderLeftColor: C.restore,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        gap: 12,
                      } as any}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1, gap: 3, paddingRight: 12 }}>
                          <Text
                            style={{
                              fontSize: 18,
                              fontFamily: 'PlayfairDisplay_700Bold',
                              color: C.text,
                              letterSpacing: -0.1,
                            }}
                          >
                            {practice.title}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '600',
                              color: C.restore,
                              letterSpacing: 0.8,
                              textTransform: 'uppercase',
                            }}
                          >
                            {practice.duration}
                          </Text>
                        </View>
                        {/* Outlined begin button */}
                        <View
                          style={{
                            borderWidth: 1,
                            borderColor: isActive ? C.restore : C.border,
                            borderRadius: 2,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '600',
                              color: isActive ? C.restore : C.textSecondary,
                              letterSpacing: 1.0,
                              textTransform: 'uppercase',
                            }}
                          >
                            {buttonLabel}
                          </Text>
                        </View>
                      </View>

                      <Text style={{ fontSize: 14, color: C.textSecondary, lineHeight: 20 }}>
                        {practice.description}
                      </Text>

                      {isActive && (
                        <View style={{ gap: 10 }}>
                          <View
                            style={{
                              height: 2,
                              backgroundColor: C.restoreMuted,
                              overflow: 'hidden',
                            }}
                          >
                            <Animated.View
                              style={{
                                height: '100%',
                                width: progressWidth,
                                backgroundColor: C.restore,
                              }}
                            />
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text
                              style={{
                                fontSize: 28,
                                fontFamily: 'PlayfairDisplay_700Bold',
                                color: C.restore,
                                letterSpacing: -0.3,
                              }}
                            >
                              {timeString}
                            </Text>
                            <AnimatedPressable onPress={stopPractice}>
                              <View
                                style={{
                                  paddingHorizontal: 16,
                                  paddingVertical: 8,
                                  borderRadius: 2,
                                  borderWidth: 1,
                                  borderColor: C.border,
                                  backgroundColor: C.surfaceSecondary,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 10,
                                    fontWeight: '600',
                                    color: C.textSecondary,
                                    letterSpacing: 1.0,
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  Stop
                                </Text>
                              </View>
                            </AnimatedPressable>
                          </View>
                        </View>
                      )}
                    </View>
                  </AnimatedPressable>
                </Animated.View>
              );
            })}
          </View>

          {/* Closing Thought — editorial pull quote */}
          <View
            style={{
              paddingVertical: 40,
              alignItems: 'flex-start',
              gap: 16,
            }}
          >
            <View style={{ width: 32, height: 1, backgroundColor: C.restore + '60' }} />
            <Text
              style={{
                fontSize: 20,
                fontFamily: 'PlayfairDisplay_400Regular_Italic',
                color: C.textSecondary,
                lineHeight: 30,
              }}
            >
              {`"${closingThought}"`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  emoji: string;
}

const WIND_DOWN_PRACTICES: WindDownPractice[] = [
  {
    id: 1,
    title: 'Body Scan',
    duration: '5 min',
    durationSeconds: 300,
    description: 'A slow journey through the body, releasing tension from head to toe.',
    emoji: '🌊',
  },
  {
    id: 2,
    title: 'Gratitude Pause',
    duration: '3 min',
    durationSeconds: 180,
    description: 'Three things. No more, no less. Let them land.',
    emoji: '🙏',
  },
  {
    id: 3,
    title: 'Sleep Breath',
    duration: '4 min',
    durationSeconds: 240,
    description: 'A gentle breath pattern to prepare the nervous system for rest.',
    emoji: '🌙',
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
  const closingQuote = `"${closingThought}"`;

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

  // Stagger anims for practice cards
  const cardAnims = useRef(
    WIND_DOWN_PRACTICES.map(() => new Animated.Value(0))
  ).current;

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
    <Animated.View style={{ flex: 1, opacity: fadeAnim, backgroundColor: '#EEE8E0' }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: 120,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: '#EEE8E0' }}
      >
        {/* Atmospheric gradient hero */}
        <View style={{ height: 200, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#7B9EA8', '#EEE8E0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          {/* Watermark */}
          <Text
            style={{
              position: 'absolute',
              top: 8,
              right: 16,
              fontSize: 72,
              opacity: 0.12,
              lineHeight: 90,
            }}
          >
            🌙
          </Text>
          <View
            style={{
              position: 'absolute',
              bottom: 24,
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
              Restore
            </Text>
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 22 }}>
              Release the day. Return to stillness.
            </Text>
            <PillarBadge label="🌊 Water · Evening" pillar="restore" />
          </View>
        </View>

        {/* Evening Reflection */}
        <View style={{ paddingHorizontal: 20 }}>
          <PromptCard
            label="Evening Reflection"
            prompt={todayPrompt}
            accentColor={C.restore}
            accentMuted={C.restoreMuted}
          />
        </View>

        {/* Wind-Down Practices */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.2,
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
                    outputRange: [16, 0],
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
                      backgroundColor: isActive ? 'rgba(123,158,168,0.12)' : 'rgba(123,158,168,0.08)',
                      borderRadius: 16,
                      borderCurve: 'continuous',
                      padding: 20,
                      borderWidth: 1,
                      borderColor: isActive ? C.restore + '50' : C.border,
                      borderLeftWidth: 3,
                      borderLeftColor: C.restore,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
                      gap: 10,
                    } as any}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <Text style={{ fontSize: 28, lineHeight: 34 }}>{practice.emoji}</Text>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text
                            style={{
                              fontSize: 17,
                              fontFamily: 'Lora_700Bold',
                              color: C.text,
                              letterSpacing: -0.1,
                            }}
                          >
                            {practice.title}
                          </Text>
                          <Text style={{ fontSize: 13, color: C.textSecondary }}>
                            {practice.duration}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          borderWidth: 1.5,
                          borderColor: C.restore,
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 5,
                          backgroundColor: 'transparent',
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: C.restore }}>
                          {buttonLabel}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 14, color: C.textSecondary, lineHeight: 20 }}>
                      {practice.description}
                    </Text>

                    {isActive && (
                      <View style={{ gap: 8 }}>
                        <View
                          style={{
                            height: 4,
                            backgroundColor: C.restoreMuted,
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <Animated.View
                            style={{
                              height: '100%',
                              width: progressWidth,
                              backgroundColor: C.restore,
                              borderRadius: 2,
                            }}
                          />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text
                            style={{
                              fontSize: 22,
                              fontFamily: 'Lora_700Bold',
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
                                borderRadius: 10,
                                backgroundColor: C.surfaceSecondary,
                              }}
                            >
                              <Text style={{ fontSize: 14, fontWeight: '600', color: C.textSecondary }}>
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

        {/* Closing Thought — atmospheric */}
        <View
          style={{
            paddingVertical: 40,
            paddingHorizontal: 32,
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Thin divider */}
          <View
            style={{
              width: 60,
              height: 1,
              backgroundColor: C.divider,
              marginBottom: 8,
            }}
          />
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Lora_400Regular_Italic',
              color: C.textSecondary,
              textAlign: 'center',
              lineHeight: 28,
            }}
          >
            {closingQuote}
          </Text>
          <Text style={{ fontSize: 22, lineHeight: 28 }}>🌙</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

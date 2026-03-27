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

interface RhythmBlast {
  id: number;
  title: string;
  duration: string;
  durationSeconds: number;
  description: string;
  steps: string[];
}

const RHYTHM_BLASTS: RhythmBlast[] = [
  {
    id: 1,
    title: 'The Reset',
    duration: '3 min',
    durationSeconds: 180,
    description: 'A quick breath pattern to interrupt stress and return to center.',
    steps: [
      'Sit comfortably and close your eyes.',
      'Inhale through your nose for 4 counts.',
      'Exhale slowly through your mouth for 6 counts.',
      'Repeat for 3 minutes, letting each breath deepen.',
    ],
  },
  {
    id: 2,
    title: 'Clarity Breath',
    duration: '4 min',
    durationSeconds: 240,
    description: 'Box breathing to sharpen focus before an important moment.',
    steps: [
      'Sit tall and relax your shoulders.',
      'Inhale for 4 counts, hold for 4 counts.',
      'Exhale for 4 counts, hold for 4 counts.',
      'Continue this box pattern for 4 minutes.',
    ],
  },
  {
    id: 3,
    title: 'Tension Release',
    duration: '5 min',
    durationSeconds: 300,
    description: 'Slow exhales to dissolve physical tension held in the body.',
    steps: [
      'Scan your body for areas of tightness.',
      'Breathe into each tense area as you inhale.',
      'On the exhale, consciously release that tension.',
      'Move through each area slowly for 5 minutes.',
    ],
  },
  {
    id: 4,
    title: 'The Pause',
    duration: '3 min',
    durationSeconds: 180,
    description: 'A mindful pause between tasks. Just stop, breathe, notice.',
    steps: [
      'Stop whatever you are doing completely.',
      'Place both feet flat on the floor.',
      'Take one long, slow breath and notice the room.',
      'Repeat three times before returning to your task.',
    ],
  },
  {
    id: 5,
    title: 'Energy Shift',
    duration: '5 min',
    durationSeconds: 300,
    description: 'Activate your natural energy without caffeine or screens.',
    steps: [
      'Stand up and shake out your hands and arms.',
      'Take 5 quick, sharp inhales through the nose.',
      'Follow with one long, slow exhale through the mouth.',
      'Repeat 6 times, then breathe naturally for 1 minute.',
    ],
  },
];

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'idle';

const PHASE_DURATIONS: Record<BreathPhase, number> = {
  inhale: 4000,
  hold: 7000,
  exhale: 8000,
  idle: 0,
};

const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: 'Inhale',
  hold: 'Hold',
  exhale: 'Exhale',
  idle: 'Begin',
};

export default function BreatheScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();

  const [selectedBlast, setSelectedBlast] = useState<number | null>(null);
  const [blastTimerActive, setBlastTimerActive] = useState(false);
  const [blastSecondsLeft, setBlastSecondsLeft] = useState(0);
  const blastTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('idle');

  const outerScale = useRef(new Animated.Value(1)).current;
  const middleScale = useRef(new Animated.Value(1)).current;
  const innerScale = useRef(new Animated.Value(0.8)).current;

  const breathAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const breathRunning = useRef(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(RHYTHM_BLASTS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    Animated.stagger(
      60,
      cardAnims.map((anim) =>
        Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true })
      )
    ).start();
  }, []);

  const runBreathCycle = useCallback(() => {
    if (!breathRunning.current) return;
    const phases: BreathPhase[] = ['inhale', 'hold', 'exhale'];
    let phaseIndex = 0;

    const nextPhase = () => {
      if (!breathRunning.current) return;
      const phase = phases[phaseIndex % phases.length];
      setBreathPhase(phase);
      const isExpand = phase === 'inhale' || phase === 'hold';
      const duration = PHASE_DURATIONS[phase];
      const outerTarget = isExpand ? 1.1 : 0.9;
      const middleTarget = isExpand ? 1.15 : 0.85;
      const innerTarget = isExpand ? 1.2 : 0.8;

      breathAnimRef.current = Animated.parallel([
        Animated.timing(outerScale, { toValue: outerTarget, duration, useNativeDriver: true }),
        Animated.timing(middleScale, { toValue: middleTarget, duration, useNativeDriver: true }),
        Animated.timing(innerScale, { toValue: innerTarget, duration, useNativeDriver: true }),
      ]);

      breathAnimRef.current.start(({ finished }) => {
        if (finished && breathRunning.current) {
          phaseIndex++;
          nextPhase();
        }
      });
    };

    nextPhase();
  }, [outerScale, middleScale, innerScale]);

  const startBreath = useCallback(() => {
    console.log('[Breathe] User started 4-7-8 breath tool');
    breathRunning.current = true;
    setBreathActive(true);
    setBreathPhase('inhale');
    runBreathCycle();
  }, [runBreathCycle]);

  const stopBreath = useCallback(() => {
    console.log('[Breathe] User stopped 4-7-8 breath tool');
    breathRunning.current = false;
    if (breathAnimRef.current) breathAnimRef.current.stop();
    setBreathActive(false);
    setBreathPhase('idle');
    Animated.parallel([
      Animated.timing(outerScale, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(middleScale, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(innerScale, { toValue: 0.8, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [outerScale, middleScale, innerScale]);

  useEffect(() => {
    return () => {
      breathRunning.current = false;
      if (breathAnimRef.current) breathAnimRef.current.stop();
      if (blastTimerRef.current) clearInterval(blastTimerRef.current);
    };
  }, []);

  const handleBlastSelect = useCallback((id: number) => {
    const blast = RHYTHM_BLASTS.find((b) => b.id === id);
    console.log('[Breathe] User selected rhythm blast:', blast?.title);
    if (selectedBlast === id) {
      setSelectedBlast(null);
      stopBlastTimer();
    } else {
      setSelectedBlast(id);
      stopBlastTimer();
    }
  }, [selectedBlast]);

  const startBlastTimer = useCallback((seconds: number, title: string) => {
    console.log('[Breathe] User started practice:', title, `(${seconds}s)`);
    if (blastTimerRef.current) clearInterval(blastTimerRef.current);
    setBlastSecondsLeft(seconds);
    setBlastTimerActive(true);
    blastTimerRef.current = setInterval(() => {
      setBlastSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(blastTimerRef.current!);
          setBlastTimerActive(false);
          console.log('[Breathe] Practice timer completed:', title);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopBlastTimer = useCallback(() => {
    if (blastTimerRef.current) clearInterval(blastTimerRef.current);
    setBlastTimerActive(false);
    setBlastSecondsLeft(0);
  }, []);

  const selectedBlastData = RHYTHM_BLASTS.find((b) => b.id === selectedBlast);
  const blastMinutes = Math.floor(blastSecondsLeft / 60);
  const blastSeconds = blastSecondsLeft % 60;
  const blastTimeString = `${blastMinutes}:${blastSeconds.toString().padStart(2, '0')}`;
  const phaseLabel = PHASE_LABELS[breathPhase];
  const breathButtonLabel = breathActive ? 'Stop' : 'Start';
  const breathButtonBg = breathActive ? C.surfaceSecondary : C.primary;
  const breathButtonTextColor = breathActive ? C.textSecondary : '#FFFFFF';
  const startOrStopLabel = blastSecondsLeft === 0 && !blastTimerActive ? 'Start Practice' : 'Start Again';

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, backgroundColor: C.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
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
          <PillarBadge label="Air · Midday" pillar="breathe" />
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
            Breathe
          </Text>
          <Text style={{ fontSize: 15, color: C.textSecondary, lineHeight: 22 }}>
            Shift your state. Clear the air.
          </Text>
        </View>

        <View style={{ paddingTop: 32, gap: 32 }}>
          {/* Rhythm Blasts */}
          <View style={{ gap: 16 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                letterSpacing: 1.0,
                color: C.breathe,
                textTransform: 'uppercase',
                paddingHorizontal: 24,
              }}
            >
              Rhythm Blasts
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
            >
              {RHYTHM_BLASTS.map((blast, index) => {
                const isSelected = selectedBlast === blast.id;
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
                return (
                  <Animated.View key={blast.id} style={cardStyle}>
                    <AnimatedPressable onPress={() => handleBlastSelect(blast.id)}>
                      <View
                        style={{
                          width: 148,
                          backgroundColor: isSelected ? C.breatheMuted : C.surface,
                          borderRadius: 4,
                          padding: 16,
                          borderWidth: 1,
                          borderColor: isSelected ? C.breathe + '60' : C.border,
                          borderTopWidth: 2,
                          borderTopColor: isSelected ? C.breathe : C.border,
                          gap: 10,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        } as any}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            fontFamily: 'PlayfairDisplay_700Bold',
                            color: C.text,
                            letterSpacing: -0.1,
                          }}
                          numberOfLines={2}
                        >
                          {blast.title}
                        </Text>
                        {/* Duration — outlined badge */}
                        <View
                          style={{
                            alignSelf: 'flex-start',
                            borderWidth: 1,
                            borderColor: C.breathe + '50',
                            borderRadius: 2,
                            paddingHorizontal: 6,
                            paddingVertical: 3,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '600',
                              color: C.breathe,
                              letterSpacing: 0.8,
                              textTransform: 'uppercase',
                            }}
                          >
                            {blast.duration}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: C.textSecondary,
                            lineHeight: 17,
                          }}
                          numberOfLines={3}
                        >
                          {blast.description}
                        </Text>
                      </View>
                    </AnimatedPressable>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </View>

          {/* Expanded blast detail */}
          {selectedBlastData && (
            <View
              style={{
                marginHorizontal: 24,
                backgroundColor: C.surface,
                borderRadius: 4,
                padding: 24,
                borderWidth: 1,
                borderColor: C.breathe + '30',
                borderTopWidth: 2,
                borderTopColor: C.breathe,
                gap: 20,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              } as any}
            >
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontFamily: 'PlayfairDisplay_700Bold',
                    color: C.text,
                    letterSpacing: -0.2,
                  }}
                >
                  {selectedBlastData.title}
                </Text>
                <Text style={{ fontSize: 15, color: C.textSecondary, lineHeight: 22 }}>
                  {selectedBlastData.description}
                </Text>
              </View>

              <View style={{ gap: 0 }}>
                {selectedBlastData.steps.map((step, i) => {
                  const stepNum = i + 1;
                  const isLast = i === selectedBlastData.steps.length - 1;
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
                          color: C.breathe,
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

              {blastTimerActive && (
                <View style={{ gap: 12 }}>
                  <Text
                    style={{
                      fontSize: 44,
                      fontFamily: 'PlayfairDisplay_700Bold',
                      color: C.breathe,
                      letterSpacing: -0.5,
                    }}
                  >
                    {blastTimeString}
                  </Text>
                  <AnimatedPressable onPress={stopBlastTimer}>
                    <View
                      style={{
                        borderRadius: 4,
                        paddingVertical: 14,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: C.border,
                        backgroundColor: C.surfaceSecondary,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: C.textSecondary,
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                        }}
                      >
                        Stop Practice
                      </Text>
                    </View>
                  </AnimatedPressable>
                </View>
              )}

              {!blastTimerActive && (
                <AnimatedPressable
                  onPress={() => startBlastTimer(selectedBlastData.durationSeconds, selectedBlastData.title)}
                >
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
                      {startOrStopLabel}
                    </Text>
                  </View>
                </AnimatedPressable>
              )}
            </View>
          )}

          {/* Thin divider */}
          <View style={{ height: 1, backgroundColor: C.divider, marginHorizontal: 24 }} />

          {/* 4-7-8 Breath Tool */}
          <View
            style={{
              marginHorizontal: 24,
              backgroundColor: C.surface,
              borderRadius: 4,
              padding: 24,
              borderWidth: 1,
              borderColor: C.border,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              gap: 24,
              alignItems: 'center',
            } as any}
          >
            <View style={{ width: '100%', gap: 4 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  letterSpacing: 1.0,
                  color: C.breathe,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Quick Breath Tool
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: 'PlayfairDisplay_700Bold',
                  color: C.text,
                  letterSpacing: -0.2,
                }}
              >
                4-7-8 Breath
              </Text>
              <Text style={{ fontSize: 14, color: C.textSecondary, lineHeight: 20 }}>
                Inhale 4 · Hold 7 · Exhale 8
              </Text>
            </View>

            {/* Concentric breathing rings */}
            <View style={{ alignItems: 'center', justifyContent: 'center', height: 220, width: 220 }}>
              <Animated.View
                style={{
                  position: 'absolute',
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  borderWidth: 1,
                  borderColor: C.breathe + '25',
                  backgroundColor: 'transparent',
                  transform: [{ scale: outerScale }],
                }}
              />
              <Animated.View
                style={{
                  position: 'absolute',
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  borderWidth: 1,
                  borderColor: C.breathe + '50',
                  backgroundColor: 'transparent',
                  transform: [{ scale: middleScale }],
                }}
              />
              <Animated.View
                style={{
                  position: 'absolute',
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: C.breathe,
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [{ scale: innerScale }],
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}
                >
                  {phaseLabel}
                </Text>
              </Animated.View>
            </View>

            <AnimatedPressable
              onPress={breathActive ? stopBreath : startBreath}
              style={{ width: '100%' }}
            >
              <View
                style={{
                  backgroundColor: breathButtonBg,
                  borderRadius: 4,
                  paddingVertical: 14,
                  alignItems: 'center',
                  borderWidth: breathActive ? 1 : 0,
                  borderColor: C.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: breathButtonTextColor,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                  }}
                >
                  {breathButtonLabel}
                </Text>
              </View>
            </AnimatedPressable>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

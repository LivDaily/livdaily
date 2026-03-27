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
  emoji: string;
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
    emoji: '🔄',
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
    emoji: '🧠',
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
    emoji: '🪶',
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
    emoji: '⏸️',
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
    emoji: '⚡',
  },
];

// 4-7-8 breath phases
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
  idle: 'Start',
};

export default function BreatheScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();

  const [selectedBlast, setSelectedBlast] = useState<number | null>(null);
  const [blastTimerActive, setBlastTimerActive] = useState(false);
  const [blastSecondsLeft, setBlastSecondsLeft] = useState(0);
  const blastTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 4-7-8 breath tool — three concentric rings
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('idle');

  // Separate animated values for each ring
  const outerScale = useRef(new Animated.Value(1)).current;
  const middleScale = useRef(new Animated.Value(1)).current;
  const innerScale = useRef(new Animated.Value(0.8)).current;

  const breathAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const breathRunning = useRef(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Stagger anims for cards
  const cardAnims = useRef(
    RHYTHM_BLASTS.map(() => new Animated.Value(0))
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

      // Outer ring: subtle 0.9 → 1.1
      const outerTarget = isExpand ? 1.1 : 0.9;
      // Middle ring: 0.85 → 1.15
      const middleTarget = isExpand ? 1.15 : 0.85;
      // Inner ring: 0.8 → 1.2
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
  const breathButtonBg = breathActive ? C.surfaceSecondary : C.breathe;
  const breathButtonTextColor = breathActive ? C.textSecondary : '#FFFFFF';

  const startOrStopLabel = blastSecondsLeft === 0 && !blastTimerActive ? 'Start Practice' : 'Start Again';

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
        {/* Hero */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 8 }}>
          <Text
            style={{
              fontSize: 34,
              fontFamily: 'Lora_700Bold',
              color: C.text,
              letterSpacing: -0.5,
            }}
          >
            Breathe
          </Text>
          <Text style={{ fontSize: 17, color: C.textSecondary, lineHeight: 24 }}>
            Shift your state. Clear the air.
          </Text>
          <PillarBadge label="💨 Air · Midday" pillar="breathe" />
        </View>

        {/* Rhythm Blasts horizontal scroll */}
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.2,
              color: C.breathe,
              textTransform: 'uppercase',
              paddingHorizontal: 20,
            }}
          >
            Rhythm Blasts
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
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
                      outputRange: [16, 0],
                    }),
                  },
                ],
              };
              return (
                <Animated.View key={blast.id} style={cardStyle}>
                  <AnimatedPressable onPress={() => handleBlastSelect(blast.id)}>
                    <View
                      style={{
                        width: 140,
                        height: 160,
                        backgroundColor: isSelected ? C.breatheMuted : C.breatheMuted,
                        borderRadius: 20,
                        borderCurve: 'continuous',
                        padding: 16,
                        borderWidth: 1.5,
                        borderColor: isSelected ? C.breathe + '80' : C.breathe + '30',
                        borderTopWidth: isSelected ? 3 : 1.5,
                        borderTopColor: isSelected ? C.breathe : C.breathe + '50',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: isSelected
                          ? '0 4px 16px rgba(123,167,188,0.2)'
                          : '0 1px 4px rgba(0,0,0,0.04)',
                      } as any}
                    >
                      <Text style={{ fontSize: 40, lineHeight: 48 }}>{blast.emoji}</Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Lora_700Bold',
                          color: C.text,
                          textAlign: 'center',
                          letterSpacing: -0.1,
                        }}
                        numberOfLines={2}
                      >
                        {blast.title}
                      </Text>
                      <View
                        style={{
                          backgroundColor: isSelected ? C.breathe + '30' : C.surface,
                          borderRadius: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '600', color: C.breathe }}>
                          {blast.duration}
                        </Text>
                      </View>
                    </View>
                  </AnimatedPressable>
                </Animated.View>
              );
            })}
          </ScrollView>
        </View>

        {/* Expanded blast detail */}
        {selectedBlastData && (
          <Animated.View
            style={{
              marginHorizontal: 20,
              backgroundColor: C.surface,
              borderRadius: 20,
              borderCurve: 'continuous',
              padding: 20,
              borderWidth: 1,
              borderColor: C.breathe + '40',
              borderTopWidth: 3,
              borderTopColor: C.breathe,
              gap: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
            } as any}
          >
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'Lora_700Bold',
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

            <View style={{ gap: 10 }}>
              {selectedBlastData.steps.map((step, i) => {
                const stepNum = i + 1;
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: C.breatheMuted,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.breathe }}>
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

            {blastTimerActive && (
              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontSize: 36,
                    fontFamily: 'Lora_700Bold',
                    color: C.breathe,
                    textAlign: 'center',
                    letterSpacing: -0.5,
                  }}
                >
                  {blastTimeString}
                </Text>
                <AnimatedPressable onPress={stopBlastTimer}>
                  <View
                    style={{
                      backgroundColor: C.surfaceSecondary,
                      borderRadius: 14,
                      borderCurve: 'continuous',
                      paddingVertical: 14,
                      alignItems: 'center',
                    } as any}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '600', color: C.textSecondary }}>
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
                    backgroundColor: C.breathe,
                    borderRadius: 14,
                    borderCurve: 'continuous',
                    paddingVertical: 16,
                    alignItems: 'center',
                  } as any}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 }}>
                    {startOrStopLabel}
                  </Text>
                </View>
              </AnimatedPressable>
            )}
          </Animated.View>
        )}

        {/* 4-7-8 Breath Tool with concentric rings */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: C.surface,
            borderRadius: 20,
            borderCurve: 'continuous',
            padding: 20,
            borderWidth: 1,
            borderColor: C.border,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
            gap: 20,
            alignItems: 'center',
          } as any}
        >
          <View style={{ width: '100%', gap: 4 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 1.2,
                color: C.breathe,
                textTransform: 'uppercase',
              }}
            >
              Quick Breath Tool
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontFamily: 'Lora_700Bold',
                color: C.text,
                letterSpacing: -0.2,
              }}
            >
              4-7-8 Breath
            </Text>
            <Text style={{ fontSize: 14, color: C.textSecondary }}>
              Inhale 4 · Hold 7 · Exhale 8
            </Text>
          </View>

          {/* Concentric breathing rings */}
          <View style={{ alignItems: 'center', justifyContent: 'center', height: 220, width: 220 }}>
            {/* Outer ring */}
            <Animated.View
              style={{
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: 100,
                borderWidth: 1,
                borderColor: C.breathe + '33',
                backgroundColor: 'transparent',
                transform: [{ scale: outerScale }],
              }}
            />
            {/* Middle ring */}
            <Animated.View
              style={{
                position: 'absolute',
                width: 160,
                height: 160,
                borderRadius: 80,
                borderWidth: 2,
                borderColor: C.breathe + '66',
                backgroundColor: 'transparent',
                transform: [{ scale: middleScale }],
              }}
            />
            {/* Inner filled circle */}
            <Animated.View
              style={{
                position: 'absolute',
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: C.breathe + 'CC',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: innerScale }],
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  textAlign: 'center',
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
                borderRadius: 14,
                borderCurve: 'continuous',
                paddingVertical: 16,
                alignItems: 'center',
              } as any}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: breathButtonTextColor,
                  letterSpacing: 0.2,
                }}
              >
                {breathButtonLabel}
              </Text>
            </View>
          </AnimatedPressable>
        </View>
      </ScrollView>
    </Animated.View>
  );
}


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ImageSourcePropType,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { journalAPI, aiAPI } from '@/utils/api';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState, ErrorState, EmptyState, useAlert } from '@/components/LoadingButton';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  energyLevel: string;
  createdAt: string;
  rhythmPhase: string;
}

export default function JournalScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [isWriting, setIsWriting] = useState(false);
  const [journalContent, setJournalContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedEnergy, setSelectedEnergy] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const moods = [
    { id: 'peaceful', label: 'Peaceful', icon: 'spa', androidIcon: 'spa' },
    { id: 'grateful', label: 'Grateful', icon: 'heart', androidIcon: 'favorite' },
    { id: 'reflective', label: 'Reflective', icon: 'book', androidIcon: 'book' },
    { id: 'uncertain', label: 'Uncertain', icon: 'cloud', androidIcon: 'cloud' },
    { id: 'heavy', label: 'Heavy', icon: 'moon', androidIcon: 'nights-stay' },
  ];

  const energyLevels = [
    { id: 'high', label: 'High', icon: 'bolt', androidIcon: 'flash-on' },
    { id: 'steady', label: 'Steady', icon: 'sun.max', androidIcon: 'wb-sunny' },
    { id: 'low', label: 'Low', icon: 'leaf', androidIcon: 'eco' },
  ];

  useEffect(() => {
    console.log('JournalScreen mounted - loading data for anonymous user');
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load entries and generate prompt in parallel
      await Promise.all([
        loadEntries(),
        generateAIPrompt()
      ]);
    } catch (err) {
      console.error('Failed to load journal data:', err);
      setError('Failed to load journal data');
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    console.log('Loading journal entries (anonymous mode supported)');
    try {
      const data = await journalAPI.getEntries({ limit: 20 });
      
      // Validate response
      if (Array.isArray(data)) {
        setEntries(data);
        console.log(`✅ Loaded ${data.length} journal entries`);
      } else {
        console.warn('⚠️ Invalid response format, expected array');
        setEntries([]);
      }
    } catch (error) {
      console.error('Failed to load journal entries:', error);
      setEntries([]);
    }
  };

  const generateAIPrompt = async () => {
    console.log('🤖 Generating AI journal prompt (anonymous mode supported)');
    
    const fallbackPrompts = [
      'What are you noticing in your body right now?',
      'What would feel supportive today?',
      'What are you grateful for in this moment?',
      'What do you need to release?',
      'How are you arriving to yourself today?',
    ];

    try {
      const hour = new Date().getHours();
      let rhythmPhase = 'morning';
      if (hour >= 10 && hour < 14) rhythmPhase = 'midday';
      else if (hour >= 14 && hour < 18) rhythmPhase = 'afternoon';
      else if (hour >= 18 && hour < 22) rhythmPhase = 'evening';
      else if (hour >= 22 || hour < 6) rhythmPhase = 'night';

      const response = await aiAPI.generate({
        module: 'journal',
        goal: 'Generate a reflective journal prompt',
        tone: selectedMood || 'calm',
        constraints: {
          mood: selectedMood,
          energy: selectedEnergy,
          rhythmPhase,
        },
      });
      
      if (response?.content) {
        setAiPrompt(response.content);
        console.log('✅ AI prompt generated successfully');
      } else {
        const randomPrompt = fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
        setAiPrompt(randomPrompt);
        console.log('⚠️ Using fallback prompt');
      }
    } catch (error) {
      console.error('Failed to generate AI prompt:', error);
      const randomPrompt = fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
      setAiPrompt(randomPrompt);
    }
  };

  const handleStartWriting = () => {
    console.log('User started writing journal entry');
    setIsWriting(true);
  };

  const handleSaveEntry = async () => {
    console.log('💾 User saving journal entry:', { content: journalContent, mood: selectedMood, energy: selectedEnergy });
    
    if (!journalContent.trim()) {
      showAlert('Error', 'Please write something before saving');
      return;
    }

    setSaving(true);

    try {
      const hour = new Date().getHours();
      let rhythmPhase = 'morning';
      if (hour >= 10 && hour < 14) rhythmPhase = 'midday';
      else if (hour >= 14 && hour < 18) rhythmPhase = 'afternoon';
      else if (hour >= 18 && hour < 22) rhythmPhase = 'evening';
      else if (hour >= 22 || hour < 6) rhythmPhase = 'night';

      const result = await journalAPI.createEntry({
        content: journalContent,
        mood: selectedMood,
        energyLevel: selectedEnergy,
        promptUsed: aiPrompt,
        rhythmPhase,
      });

      if (result) {
        showAlert('Success', 'Your journal entry has been saved');
        setIsWriting(false);
        setJournalContent('');
        setSelectedMood('');
        setSelectedEnergy('');
        generateAIPrompt();
        loadEntries();
        console.log('✅ Journal entry saved successfully');
      } else {
        showAlert('Error', 'Failed to save your journal entry. Please try again.');
      }
    } catch (error) {
      console.error('❌ Failed to save journal entry:', error);
      showAlert('Error', 'Failed to save your journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    console.log('User cancelled journal entry');
    setIsWriting(false);
    setJournalContent('');
    setSelectedMood('');
    setSelectedEnergy('');
  };

  const handleGrounding = () => {
    console.log('User tapped grounding button from journal');
    router.push('/(tabs)/grounding');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    groundingButton: {
      marginHorizontal: 24,
      marginTop: 12,
      backgroundColor: colors.secondary,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    groundingButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    promptCard: {
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
    promptLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    promptText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 30,
      marginBottom: 20,
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
    writingCard: {
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
    moodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 24,
    },
    moodChip: {
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
    moodChipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    moodChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    moodChipTextSelected: {
      color: '#FFFFFF',
    },
    textInput: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      minHeight: 200,
      textAlignVertical: 'top',
      marginBottom: 20,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.textSecondary,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    entriesSection: {
      marginTop: 32,
      paddingHorizontal: 24,
    },
    entriesSectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: -0.3,
    },
    entryCard: {
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
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    entryDate: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    entryMoodBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: colors.highlight,
    },
    entryMoodText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text,
    },
    entryContent: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
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

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingState message="Loading your journal..." />
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ErrorState message={error} onRetry={loadData} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AlertComponent />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <Text style={styles.headerTitle}>Journal</Text>
            <Text style={styles.headerSubtitle}>
              A space to arrive and breathe
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <TouchableOpacity
              style={styles.groundingButton}
              onPress={handleGrounding}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Go to grounding exercises"
              accessibilityHint="Navigate to grounding timer and breathwork"
            >
              <IconSymbol
                ios_icon_name="wind"
                android_material_icon_name="air"
                size={20}
                color={colors.text}
              />
              <Text style={styles.groundingButtonText}>Take a Grounding Break</Text>
            </TouchableOpacity>
          </Animated.View>

          {!isWriting ? (
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.promptCard}>
              <Text style={styles.promptLabel}>Today&apos;s Prompt</Text>
              <Text style={styles.promptText}>{aiPrompt}</Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartWriting}
                activeOpacity={0.7}
              >
                <Text style={styles.startButtonText}>Begin Writing</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(600)} style={styles.writingCard}>
              <Text style={styles.sectionLabel}>How are you feeling?</Text>
              <View style={styles.moodGrid}>
                {moods.map((mood) => {
                  const isSelected = selectedMood === mood.id;
                  return (
                    <React.Fragment key={mood.id}>
                      <TouchableOpacity
                        style={[styles.moodChip, isSelected && styles.moodChipSelected]}
                        onPress={() => {
                          console.log('User selected mood:', mood.id);
                          setSelectedMood(mood.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <IconSymbol
                          ios_icon_name={mood.icon}
                          android_material_icon_name={mood.androidIcon}
                          size={16}
                          color={isSelected ? '#FFFFFF' : colors.text}
                        />
                        <Text style={[styles.moodChipText, isSelected && styles.moodChipTextSelected]}>
                          {mood.label}
                        </Text>
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Your Energy</Text>
              <View style={styles.moodGrid}>
                {energyLevels.map((energy) => {
                  const isSelected = selectedEnergy === energy.id;
                  return (
                    <React.Fragment key={energy.id}>
                      <TouchableOpacity
                        style={[styles.moodChip, isSelected && styles.moodChipSelected]}
                        onPress={() => {
                          console.log('User selected energy level:', energy.id);
                          setSelectedEnergy(energy.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <IconSymbol
                          ios_icon_name={energy.icon}
                          android_material_icon_name={energy.androidIcon}
                          size={16}
                          color={isSelected ? '#FFFFFF' : colors.text}
                        />
                        <Text style={[styles.moodChipText, isSelected && styles.moodChipTextSelected]}>
                          {energy.label}
                        </Text>
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Your Reflection</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Let your thoughts flow..."
                placeholderTextColor={colors.textSecondary}
                multiline
                value={journalContent}
                onChangeText={setJournalContent}
                autoFocus
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveEntry}
                  activeOpacity={0.7}
                  disabled={!journalContent.trim() || saving}
                >
                  <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          <View style={styles.entriesSection}>
            <Text style={styles.entriesSectionTitle}>Recent Entries</Text>
            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol
                  ios_icon_name="book"
                  android_material_icon_name="book"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyStateText}>
                  Your journal entries will appear here. Start writing to create your first entry!
                </Text>
              </View>
            ) : (
              entries.map((entry, index) => {
                const formattedDate = formatDate(entry.createdAt);
                const moodLabel = moods.find(m => m.id === entry.mood)?.label || entry.mood;
                return (
                  <React.Fragment key={entry.id}>
                    <Animated.View
                      entering={FadeInDown.delay(index * 100).duration(600)}
                      style={styles.entryCard}
                    >
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryDate}>{formattedDate}</Text>
                        <View style={styles.entryMoodBadge}>
                          <Text style={styles.entryMoodText}>{moodLabel}</Text>
                        </View>
                      </View>
                      <Text style={styles.entryContent} numberOfLines={3}>
                        {entry.content}
                      </Text>
                    </Animated.View>
                  </React.Fragment>
                );
              })
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

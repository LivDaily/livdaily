
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';

interface MindfulnessContent {
  id: string;
  title: string;
  content: string;
  contentType: string;
  category: string;
  duration?: number;
  aiGenerated: boolean;
  isActive: boolean;
}

interface Subscription {
  subscriptionType: 'free' | 'premium';
  status: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
}

export default function MindfulnessScreen() {
  const { colors } = useAppTheme();
  const [content, setContent] = useState<MindfulnessContent[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('Loading mindfulness content and subscription');
    setLoading(true);
    try {
      // TODO: Backend Integration - GET /api/mindfulness/content to fetch mindfulness content
      // TODO: Backend Integration - GET /api/mindfulness/subscription to fetch subscription status
      
      // Mock data for now
      const mockContent: MindfulnessContent[] = [
        {
          id: '1',
          title: 'Morning Meditation',
          content: 'Start your day with a peaceful 10-minute guided meditation...',
          contentType: 'meditation',
          category: 'morning',
          duration: 10,
          aiGenerated: false,
          isActive: true,
        },
        {
          id: '2',
          title: 'Breathing Exercise',
          content: 'A simple breathing technique to center yourself...',
          contentType: 'breathing',
          category: 'anytime',
          duration: 5,
          aiGenerated: false,
          isActive: true,
        },
        {
          id: '3',
          title: 'Evening Wind Down',
          content: 'Gentle practices to prepare for restful sleep...',
          contentType: 'meditation',
          category: 'evening',
          duration: 15,
          aiGenerated: false,
          isActive: true,
        },
      ];

      const mockSubscription: Subscription = {
        subscriptionType: 'free',
        status: 'active',
      };

      setContent(mockContent);
      setSubscription(mockSubscription);
    } catch (error) {
      console.error('Failed to load mindfulness data:', error);
      Alert.alert('Error', 'Failed to load mindfulness content');
    } finally {
      setLoading(false);
    }
  };

  const handleContentPress = (item: MindfulnessContent) => {
    console.log('User tapped mindfulness content:', item.title);
    Alert.alert(
      item.title,
      item.content,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const handleUpgrade = () => {
    console.log('User tapped upgrade to premium');
    Alert.alert(
      'Upgrade to Premium',
      'Unlock all mindfulness content and features with a premium subscription.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Learn More', onPress: () => console.log('Navigate to subscription page') },
      ]
    );
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
    subscriptionBanner: {
      marginHorizontal: 24,
      marginBottom: 20,
      padding: 16,
      backgroundColor: colors.primary,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    subscriptionText: {
      flex: 1,
      marginRight: 12,
    },
    subscriptionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    subscriptionSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    upgradeButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    upgradeButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: -0.2,
    },
    contentCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    contentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    contentTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    durationBadge: {
      backgroundColor: colors.highlight,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    durationText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    contentDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 12,
    },
    contentFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    categoryBadge: {
      backgroundColor: colors.highlight,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    categoryText: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 12,
    },
  });

  const isPremium = subscription?.subscriptionType === 'premium';

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <IconSymbol
            ios_icon_name="sparkles"
            android_material_icon_name="auto-awesome"
            size={48}
            color={colors.primary}
          />
          <Text style={styles.loadingText}>Loading mindfulness content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text style={styles.headerTitle}>Mindfulness</Text>
          <Text style={styles.headerSubtitle}>
            Guided practices for presence and peace
          </Text>
        </Animated.View>

        {!isPremium && (
          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <TouchableOpacity
              style={styles.subscriptionBanner}
              onPress={handleUpgrade}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Upgrade to premium subscription"
              accessibilityHint="Unlock all mindfulness content"
            >
              <View style={styles.subscriptionText}>
                <Text style={styles.subscriptionTitle}>Unlock Premium</Text>
                <Text style={styles.subscriptionSubtitle}>
                  Access all mindfulness content
                </Text>
              </View>
              <View style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Content</Text>
          {content.map((item, index) => (
            <React.Fragment key={item.id}>
              <Animated.View entering={FadeInDown.delay(200 + index * 100).duration(600)}>
                <TouchableOpacity
                  style={styles.contentCard}
                  onPress={() => handleContentPress(item)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}, ${item.duration} minutes`}
                  accessibilityHint="Tap to view content details"
                >
                  <View style={styles.contentHeader}>
                    <Text style={styles.contentTitle}>{item.title}</Text>
                    {item.duration && (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>
                          {item.duration}
                          <Text> min</Text>
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contentDescription} numberOfLines={2}>
                    {item.content}
                  </Text>
                  <View style={styles.contentFooter}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    {item.aiGenerated && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>AI Generated</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

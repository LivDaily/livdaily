
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
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { mindfulnessAPI, aiAPI } from '@/utils/api';
import { LoadingState, ErrorState, EmptyState, useAlert } from '@/components/LoadingButton';

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
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [content, setContent] = useState<MindfulnessContent[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('🧘 Loading mindfulness content (anonymous mode supported)');
    setLoading(true);
    setError(null);

    try {
      const [contentData, subscriptionData] = await Promise.all([
        mindfulnessAPI.getContent(),
        mindfulnessAPI.getSubscription(),
      ]);
      
      // Validate and set content
      if (Array.isArray(contentData)) {
        setContent(contentData);
        console.log(`✅ Loaded ${contentData.length} mindfulness items`);
      } else {
        console.warn('⚠️ Invalid content response, expected array');
        setContent([]);
      }
      
      // Set subscription (default to free for anonymous users)
      setSubscription(subscriptionData || { subscriptionType: 'free', status: 'active' });
    } catch (err) {
      console.error('❌ Failed to load mindfulness data:', err);
      setError('Failed to load mindfulness content');
      setContent([]);
      setSubscription({ subscriptionType: 'free', status: 'active' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    console.log('🤖 Generating AI mindfulness content');
    setGenerating(true);

    try {
      const result = await aiAPI.generate({
        module: 'mindfulness',
        goal: 'Generate calming mindfulness meditation content',
        timeAvailable: 10,
        tone: 'calm',
      });

      if (result) {
        showAlert('Success', 'New mindfulness content generated!');
        loadData(); // Reload to show new content
      } else {
        showAlert('Error', 'Failed to generate content. Please try again.');
      }
    } catch (err) {
      console.error('❌ Failed to generate mindfulness content:', err);
      showAlert('Error', 'Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleContentPress = (item: MindfulnessContent) => {
    console.log('User tapped mindfulness content:', item.title);
    
    const durationText = item.duration ? `${item.duration} minutes` : '';
    const categoryText = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    
    showAlert(
      item.title,
      `${categoryText} • ${durationText}\n\n${item.content}`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Begin Practice',
          onPress: () => {
            console.log('User starting mindfulness practice:', item.title);
            showAlert('Practice Started', 'Find a comfortable position and begin when ready.');
          },
        },
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
    emptyContainer: {
      minHeight: 300,
    },
  });

  const isPremium = subscription?.subscriptionType === 'premium';

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingState message="Loading mindfulness content..." />
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

  const contentList = Array.isArray(content) ? content : [];

  return (
      <SafeAreaView style={styles.container} edges={['top']}>
      <AlertComponent />
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Content</Text>
          
          {contentList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                message="No mindfulness content available yet"
                ctaText={generating ? "Generating..." : "Generate Content"}
                onCtaPress={generating ? undefined : handleGenerateContent}
              />
            </View>
          ) : (
            contentList.map((item, index) => {
              const durationText = item.duration ? `${item.duration} min` : '';
              
              return (
                <React.Fragment key={item.id}>
                  <Animated.View entering={FadeInDown.delay(200 + index * 100).duration(600)}>
                    <TouchableOpacity
                      style={styles.contentCard}
                      onPress={() => handleContentPress(item)}
                      activeOpacity={0.7}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.title}, ${item.duration} minutes`}
                      accessibilityHint="Tap to view content details and begin practice"
                    >
                      <View style={styles.contentHeader}>
                        <Text style={styles.contentTitle}>{item.title}</Text>
                        {item.duration && (
                          <View style={styles.durationBadge}>
                            <Text style={styles.durationText}>{durationText}</Text>
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
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

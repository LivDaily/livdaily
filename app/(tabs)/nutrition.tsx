
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { nutritionAPI, aiAPI } from '@/utils/api';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

interface NutritionTask {
  id: string;
  taskDescription: string;
  completed: boolean;
  completedAt?: string;
  date: string;
}

export default function NutritionScreen() {
  const { colors } = useAppTheme();
  const [tasks, setTasks] = useState<NutritionTask[]>([]);
  const [loading, setLoading] = useState(false);

  const inspirationalImages = [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80',
  ];

  const currentImage = inspirationalImages[Math.floor(Math.random() * inspirationalImages.length)];

  useEffect(() => {
    loadTodaysTasks();
  }, []);

  const loadTodaysTasks = async () => {
    console.log('Loading nutrition tasks');
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await nutritionAPI.getTasks(today);
      
      if (!data || data.length === 0) {
        console.log('No tasks found, generating AI tasks');
        await generateAITasks();
      } else {
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to load nutrition tasks:', error);
    }
  };

  const generateAITasks = async () => {
    console.log('Generating AI nutrition tasks');
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await aiAPI.generateNutritionTasks({
        date: today,
      });

      if (response?.tasks && Array.isArray(response.tasks)) {
        for (const task of response.tasks) {
          await nutritionAPI.createTask({
            taskDescription: task.description || task.taskDescription,
            date: today,
          });
        }
        
        await loadTodaysTasks();
      }
    } catch (error) {
      console.error('Failed to generate AI tasks:', error);
      Alert.alert('Error', 'Failed to generate nutrition tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (task: NutritionTask) => {
    console.log('User toggled task:', task.id);
    try {
      const newCompleted = !task.completed;
      await nutritionAPI.updateTask(task.id, {
        completed: newCompleted,
        completedAt: newCompleted ? new Date().toISOString() : undefined,
      });

      setTasks(tasks.map(t => 
        t.id === task.id 
          ? { ...t, completed: newCompleted, completedAt: newCompleted ? new Date().toISOString() : undefined }
          : t
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
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
    heroImage: {
      marginHorizontal: 24,
      marginTop: 20,
      height: 200,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    heroImageContent: {
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    heroText: {
      fontSize: 20,
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    tasksSection: {
      marginTop: 20,
      paddingHorizontal: 24,
    },
    taskCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    taskCheckbox: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    taskCheckboxChecked: {
      backgroundColor: colors.primary,
    },
    taskContent: {
      flex: 1,
    },
    taskText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 22,
    },
    taskTextCompleted: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    generateButton: {
      marginHorizontal: 24,
      marginTop: 20,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
    },
    generateButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text style={styles.headerTitle}>Nutrition</Text>
          <Text style={styles.headerSubtitle}>
            Simple, supportive daily nourishment
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.heroImage}>
          <Image
            source={resolveImageSource(currentImage)}
            style={styles.heroImageContent}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroText}>Nourish yourself with intention</Text>
          </View>
        </Animated.View>

        <View style={styles.tasksSection}>
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="leaf"
                android_material_icon_name="eco"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyStateText}>
                No tasks for today. Generate some!
              </Text>
            </View>
          ) : (
            tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <Animated.View
                  entering={FadeInDown.delay(200 + index * 100).duration(600)}
                >
                  <TouchableOpacity
                    style={styles.taskCard}
                    onPress={() => handleToggleTask(task)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.taskCheckbox, task.completed && styles.taskCheckboxChecked]}>
                      {task.completed && (
                        <IconSymbol
                          ios_icon_name="checkmark"
                          android_material_icon_name="check"
                          size={16}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                    <View style={styles.taskContent}>
                      <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                        {task.taskDescription}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </React.Fragment>
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateAITasks}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={styles.generateButtonText}>
            {loading ? 'Generating...' : 'Generate New Tasks'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

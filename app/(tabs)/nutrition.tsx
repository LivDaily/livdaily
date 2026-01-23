
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { nutritionAPI, aiAPI } from '@/utils/api';

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

  useEffect(() => {
    loadTodaysTasks();
  }, []);

  const loadTodaysTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await nutritionAPI.getTasks(today);
      
      if (!data || data.length === 0) {
        // Generate AI tasks if none exist
        await generateAITasks();
      } else {
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to load nutrition tasks:', error);
    }
  };

  const generateAITasks = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await aiAPI.generateNutritionTasks({
        date: today,
      });

      if (response?.tasks && Array.isArray(response.tasks)) {
        // Create tasks in backend
        for (const task of response.tasks) {
          await nutritionAPI.createTask({
            taskDescription: task.description || task.taskDescription,
            date: today,
          });
        }
        
        // Reload tasks
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
    try {
      const newCompleted = !task.completed;
      await nutritionAPI.updateTask(task.id, {
        completed: newCompleted,
        completedAt: newCompleted ? new Date().toISOString() : undefined,
      });

      // Update local state
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
            Simple, supportive daily tasks
          </Text>
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
              <Animated.View
                key={task.id}
                entering={FadeInDown.delay(index * 100).duration(600)}
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

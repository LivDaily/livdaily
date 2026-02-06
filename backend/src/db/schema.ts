import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';
import { user } from './auth-schema.js';

// Daily Rhythms - Track mood and energy across the 24-hour cycle
export const dailyRhythms = pgTable('daily_rhythms', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  morningMood: text('morning_mood'),
  middayEnergy: text('midday_energy'),
  eveningState: text('evening_state'),
  nightQuality: text('night_quality'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// NOTE: journalEntries is now defined in liqdaily-schema.ts with the new structure
// The old journalEntries table is no longer used

// Movement Logs - Track physical activities and exercises
export const movementLogs = pgTable('movement_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  activityType: text('activity_type').notNull(),
  durationMinutes: integer('duration_minutes'),
  videoId: text('video_id'),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
});

// Nutrition Tasks - Daily nutrition-related tasks and goals
export const nutritionTasks = pgTable('nutrition_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  taskDescription: text('task_description').notNull(),
  completed: boolean('completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  date: date('date').notNull(),
});

// Sleep Logs - Track sleep patterns and quality
export const sleepLogs = pgTable('sleep_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  bedtime: timestamp('bedtime'),
  wakeTime: timestamp('wake_time'),
  qualityRating: integer('quality_rating'),
  windDownActivity: text('wind_down_activity'),
  reflection: text('reflection'),
  date: date('date'),
});

// Grounding Sessions - Track grounding/mindfulness exercises
export const groundingSessions = pgTable('grounding_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  sessionType: text('session_type').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
});

// User Patterns - Store analyzed patterns and preferences
export const userPatterns = pgTable('user_patterns', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  patternData: jsonb('pattern_data'),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// Media Library - Store videos, music, images for different rhythm phases
export const mediaLibrary = pgTable('media_library', {
  id: uuid('id').primaryKey().defaultRandom(),
  mediaType: text('media_type').notNull(),
  url: text('url').notNull(),
  category: text('category'),
  season: text('season'),
  rhythmPhase: text('rhythm_phase'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// Weekly Motivation - Admin-curated motivational content
export const weeklyMotivation = pgTable('weekly_motivation', {
  id: uuid('id').primaryKey().defaultRandom(),
  weekStartDate: date('week_start_date').notNull(),
  content: text('content').notNull(),
  author: text('author'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Profiles - Extended user profile information
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name'),
  themePreference: text('theme_preference').default('earth_tones').notNull(),
  notificationSettings: jsonb('notification_settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Mindfulness Content - Mindfulness articles, exercises, meditations
export const mindfulnessContent = pgTable('mindfulness_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  contentType: text('content_type').notNull(), // 'article', 'exercise', 'meditation'
  aiGenerated: boolean('ai_generated').default(false).notNull(),
  category: text('category'),
  duration: integer('duration'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()).notNull(),
});

// User Subscriptions - Track user subscription status
export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  subscriptionType: text('subscription_type').notNull(), // 'free', 'premium'
  status: text('status').notNull(), // 'active', 'inactive', 'cancelled'
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Mindfulness Journal Entries - User reflections on mindfulness content
export const mindfulnessJournalEntries = pgTable('mindfulness_journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  mindfulnessContentId: uuid('mindfulness_content_id').references(() => mindfulnessContent.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  mood: text('mood'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

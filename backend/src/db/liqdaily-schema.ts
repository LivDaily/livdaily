import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';

// Users table - supports anonymous users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  isAnonymous: boolean('is_anonymous').default(true).notNull(),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Check-ins - daily mood and energy tracking
export const checkins = pgTable('checkins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  mood: text('mood'),
  energy: integer('energy'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Habits - habit tracking
export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  frequency: text('frequency').notNull(), // daily, weekly, etc.
  completedDates: jsonb('completed_dates').default([]).notNull(), // array of dates
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Routines - daily routines with steps
export const routines = pgTable('routines', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  steps: jsonb('steps').default([]).notNull(), // array of routine steps
  timeOfDay: text('time_of_day'), // morning, evening, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Journal Entries - user journaling
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  content: text('content').notNull(),
  mood: text('mood'),
  tags: jsonb('tags'), // array of tags
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Prompts - writing/reflection prompts
export const prompts = pgTable('prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  category: text('category'),
  isAiGenerated: boolean('is_ai_generated').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reflections - user reflections on prompts
export const reflections = pgTable('reflections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  promptId: uuid('prompt_id').references(() => prompts.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Content Items - generic content for all modules
export const contentItems = pgTable('content_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  module: text('module').notNull(), // mindfulness, breathwork, movement, nutrition, focus, calm, sleep, grounding, motivation
  title: text('title').notNull(),
  content: text('content'),
  payload: jsonb('payload'), // flexible module-specific data
  category: text('category'),
  duration: integer('duration'), // in seconds/minutes
  isAiGenerated: boolean('is_ai_generated').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Premium Features - premium content for modules
export const premiumFeatures = pgTable('premium_features', {
  id: uuid('id').primaryKey().defaultRandom(),
  module: text('module').notNull(), // grounding, movement, sleep, mindfulness
  featureName: text('feature_name').notNull(),
  featureType: text('feature_type').notNull(), // advanced_breathwork, extended_sessions, personalized_rituals, etc.
  content: jsonb('content'), // feature-specific content
  isPremium: boolean('is_premium').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Daily Images - weekly rotating images for modules
export const dailyImages = pgTable('daily_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  module: text('module').notNull(), // which module this image is for
  imageUrl: text('image_url').notNull(),
  weekNumber: integer('week_number').notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  season: text('season'), // spring, summer, fall, winter
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsed: timestamp('last_used'),
});

// User Preferences - accessibility and notification settings
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fontSize: text('font_size').default('medium'), // small, medium, large, extra_large
  highContrast: boolean('high_contrast').default(false),
  reducedMotion: boolean('reduced_motion').default(false),
  screenReaderEnabled: boolean('screen_reader_enabled').default(false),
  voiceControlEnabled: boolean('voice_control_enabled').default(false),
  notificationPreferences: jsonb('notification_preferences').default({
    morningArrival: true,
    middayGrounding: true,
    afternoonMovement: true,
    eveningUnwind: true,
    nightRest: true,
  }),
  trackingPreferences: jsonb('tracking_preferences').default({
    movementTracking: true,
    nutritionTracking: true,
    sleepTracking: true,
    journalTracking: true,
    groundingTracking: true,
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Sleep Premium Content - advanced sleep features
export const sleepPremiumContent = pgTable('sleep_premium_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentType: text('content_type').notNull(), // wind_down_flow, dream_journal, sleep_analysis, sleep_coaching, sleep_sounds
  title: text('title').notNull(),
  description: text('description'),
  audioUrl: text('audio_url'),
  durationMinutes: integer('duration_minutes'),
  isPremium: boolean('is_premium').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

import type { App } from '../index.js';
import { eq, and, gte, count, sql } from 'drizzle-orm';
import * as schema from '../db/liqdaily-schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Helper to extract user ID from token
const getUserId = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  return authHeader.replace('Bearer ', '');
};

export function registerV1StatsRoutes(app: App) {
  // =========================
  // Movement Stats
  // =========================

  app.fastify.get('/v1/movement/stats', async (
    request: FastifyRequest<{
      Querystring: {
        period?: 'week' | 'month';
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const period = request.query.period || 'week';
    app.logger.info({ userId, period }, 'Fetching movement stats');

    try {
      const daysAgo = period === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const entries = await app.db.query.contentItems.findMany({
        where: and(
          eq(schema.contentItems.userId, userId as any),
          eq(schema.contentItems.module, 'movement'),
          gte(schema.contentItems.createdAt, startDate)
        ),
      });

      let totalDuration = 0;
      let totalCalories = 0;
      const activityTypes: Record<string, number> = {};
      const intensityLevels: Record<string, number> = {};

      entries.forEach(entry => {
        if (entry.payload) {
          const payload = entry.payload as any;
          if (payload.duration) totalDuration += payload.duration;
          if (payload.calories) totalCalories += payload.calories;
          if (payload.activityType) {
            activityTypes[payload.activityType] = (activityTypes[payload.activityType] || 0) + 1;
          }
          if (payload.intensity) {
            intensityLevels[payload.intensity] = (intensityLevels[payload.intensity] || 0) + 1;
          }
        }
      });

      const avgDuration = entries.length > 0 ? totalDuration / entries.length : 0;
      const avgCalories = entries.length > 0 ? totalCalories / entries.length : 0;

      app.logger.info(
        { totalSessions: entries.length, totalDuration, totalCalories },
        'Movement stats calculated'
      );

      return {
        period,
        totalSessions: entries.length,
        totalDuration: Math.round(totalDuration),
        totalCalories: Math.round(totalCalories),
        averageDuration: Math.round(avgDuration * 10) / 10,
        averageCalories: Math.round(avgCalories * 10) / 10,
        activityBreakdown: activityTypes,
        intensityDistribution: intensityLevels,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch movement stats');
      throw error;
    }
  });

  // =========================
  // Sleep Stats
  // =========================

  app.fastify.get('/v1/sleep/stats', async (
    request: FastifyRequest<{
      Querystring: {
        period?: 'week' | 'month';
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const period = request.query.period || 'week';
    app.logger.info({ userId, period }, 'Fetching sleep stats');

    try {
      const daysAgo = period === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const entries = await app.db.query.contentItems.findMany({
        where: and(
          eq(schema.contentItems.userId, userId as any),
          eq(schema.contentItems.module, 'sleep'),
          gte(schema.contentItems.createdAt, startDate)
        ),
      });

      let totalDuration = 0;
      let totalQuality = 0;
      const sleepPatterns: Record<string, number> = {};
      const wakeUpReasons: Record<string, number> = {};

      entries.forEach(entry => {
        if (entry.payload) {
          const payload = entry.payload as any;
          if (payload.duration) totalDuration += payload.duration;
          if (payload.quality) totalQuality += payload.quality;
          if (payload.pattern) {
            sleepPatterns[payload.pattern] = (sleepPatterns[payload.pattern] || 0) + 1;
          }
          if (payload.wakeUpReason) {
            wakeUpReasons[payload.wakeUpReason] = (wakeUpReasons[payload.wakeUpReason] || 0) + 1;
          }
        }
      });

      const avgDuration = entries.length > 0 ? totalDuration / entries.length : 0;
      const avgQuality = entries.length > 0 ? totalQuality / entries.length : 0;

      app.logger.info(
        { totalNights: entries.length, avgDuration, avgQuality },
        'Sleep stats calculated'
      );

      return {
        period,
        totalNights: entries.length,
        averageDuration: Math.round(avgDuration * 10) / 10,
        averageQuality: Math.round(avgQuality * 10) / 10,
        totalHours: Math.round(totalDuration * 10) / 10,
        sleepPatterns,
        wakeUpReasons,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch sleep stats');
      throw error;
    }
  });

  // =========================
  // Nutrition Stats
  // =========================

  app.fastify.get('/v1/nutrition/stats', async (
    request: FastifyRequest<{
      Querystring: {
        period?: 'week' | 'month';
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const period = request.query.period || 'week';
    app.logger.info({ userId, period }, 'Fetching nutrition stats');

    try {
      const daysAgo = period === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const entries = await app.db.query.contentItems.findMany({
        where: and(
          eq(schema.contentItems.userId, userId as any),
          eq(schema.contentItems.module, 'nutrition'),
          gte(schema.contentItems.createdAt, startDate)
        ),
      });

      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      const mealTypes: Record<string, number> = {};
      const foodCategories: Record<string, number> = {};

      entries.forEach(entry => {
        if (entry.payload) {
          const payload = entry.payload as any;
          if (payload.calories) totalCalories += payload.calories;
          if (payload.protein) totalProtein += payload.protein;
          if (payload.carbs) totalCarbs += payload.carbs;
          if (payload.fat) totalFat += payload.fat;
          if (payload.mealType) {
            mealTypes[payload.mealType] = (mealTypes[payload.mealType] || 0) + 1;
          }
          if (payload.category) {
            foodCategories[payload.category] = (foodCategories[payload.category] || 0) + 1;
          }
        }
      });

      const avgCalories = entries.length > 0 ? totalCalories / entries.length : 0;
      const avgProtein = entries.length > 0 ? totalProtein / entries.length : 0;

      app.logger.info(
        { totalEntries: entries.length, totalCalories, avgCalories },
        'Nutrition stats calculated'
      );

      return {
        period,
        totalEntries: entries.length,
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        averageCalories: Math.round(avgCalories),
        averageProtein: Math.round(avgProtein * 10) / 10,
        mealBreakdown: mealTypes,
        foodCategories,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch nutrition stats');
      throw error;
    }
  });

  // =========================
  // Journal Stats
  // =========================

  app.fastify.get('/v1/journal/stats', async (
    request: FastifyRequest<{
      Querystring: {
        period?: 'week' | 'month';
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const period = request.query.period || 'week';
    app.logger.info({ userId, period }, 'Fetching journal stats');

    try {
      const daysAgo = period === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const entries = await app.db.query.journalEntries.findMany({
        where: and(
          eq(schema.journalEntries.userId, userId as any),
          gte(schema.journalEntries.createdAt, startDate)
        ),
      });

      const moodCounts: Record<string, number> = {};
      const tags: Record<string, number> = {};
      let totalWords = 0;

      entries.forEach(entry => {
        if (entry.mood) {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        }
        if (entry.tags) {
          const entryTags = entry.tags as string[];
          entryTags.forEach(tag => {
            tags[tag] = (tags[tag] || 0) + 1;
          });
        }
        if (entry.content) {
          totalWords += entry.content.split(/\s+/).length;
        }
      });

      const avgWords = entries.length > 0 ? totalWords / entries.length : 0;
      const mostFrequentMood = Object.entries(moodCounts).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0];

      app.logger.info(
        { totalEntries: entries.length, totalWords, avgWords },
        'Journal stats calculated'
      );

      return {
        period,
        totalEntries: entries.length,
        totalWords,
        averageWordsPerEntry: Math.round(avgWords),
        moodDistribution: moodCounts,
        mostFrequentMood: mostFrequentMood || null,
        topTags: Object.entries(tags)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .reduce((acc, [tag, count]) => ({ ...acc, [tag]: count }), {}),
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch journal stats');
      throw error;
    }
  });

  // =========================
  // Grounding Stats
  // =========================

  app.fastify.get('/v1/grounding/stats', async (
    request: FastifyRequest<{
      Querystring: {
        period?: 'week' | 'month';
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const period = request.query.period || 'week';
    app.logger.info({ userId, period }, 'Fetching grounding stats');

    try {
      const daysAgo = period === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const entries = await app.db.query.contentItems.findMany({
        where: and(
          eq(schema.contentItems.userId, userId as any),
          eq(schema.contentItems.module, 'grounding'),
          gte(schema.contentItems.createdAt, startDate)
        ),
      });

      let totalDuration = 0;
      const techniques: Record<string, number> = {};
      const stressLevels: Record<string, number> = {};

      entries.forEach(entry => {
        if (entry.payload) {
          const payload = entry.payload as any;
          if (payload.duration) totalDuration += payload.duration;
          if (payload.technique) {
            techniques[payload.technique] = (techniques[payload.technique] || 0) + 1;
          }
          if (payload.stressLevel) {
            stressLevels[payload.stressLevel] = (stressLevels[payload.stressLevel] || 0) + 1;
          }
        }
      });

      const avgDuration = entries.length > 0 ? totalDuration / entries.length : 0;

      app.logger.info(
        { totalSessions: entries.length, totalDuration, avgDuration },
        'Grounding stats calculated'
      );

      return {
        period,
        totalSessions: entries.length,
        totalDuration: Math.round(totalDuration),
        averageDuration: Math.round(avgDuration * 10) / 10,
        techniqueBreakdown: techniques,
        stressLevelDistribution: stressLevels,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch grounding stats');
      throw error;
    }
  });

  // =========================
  // Mindfulness Stats
  // =========================

  app.fastify.get('/v1/mindfulness/stats', async (
    request: FastifyRequest<{
      Querystring: {
        period?: 'week' | 'month';
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const period = request.query.period || 'week';
    app.logger.info({ userId, period }, 'Fetching mindfulness stats');

    try {
      const daysAgo = period === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const entries = await app.db.query.contentItems.findMany({
        where: and(
          eq(schema.contentItems.userId, userId as any),
          eq(schema.contentItems.module, 'mindfulness'),
          gte(schema.contentItems.createdAt, startDate)
        ),
      });

      let totalDuration = 0;
      const focusTypes: Record<string, number> = {};
      const focusScores: number[] = [];

      entries.forEach(entry => {
        if (entry.payload) {
          const payload = entry.payload as any;
          if (payload.duration) totalDuration += payload.duration;
          if (payload.focusType) {
            focusTypes[payload.focusType] = (focusTypes[payload.focusType] || 0) + 1;
          }
          if (payload.focusScore) {
            focusScores.push(payload.focusScore);
          }
        }
      });

      const avgDuration = entries.length > 0 ? totalDuration / entries.length : 0;
      const avgFocusScore =
        focusScores.length > 0
          ? focusScores.reduce((a, b) => a + b) / focusScores.length
          : 0;

      app.logger.info(
        { totalSessions: entries.length, avgDuration, avgFocusScore },
        'Mindfulness stats calculated'
      );

      return {
        period,
        totalSessions: entries.length,
        totalDuration: Math.round(totalDuration),
        averageDuration: Math.round(avgDuration * 10) / 10,
        averageFocusScore: Math.round(avgFocusScore * 10) / 10,
        focusTypeBreakdown: focusTypes,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch mindfulness stats');
      throw error;
    }
  });

  // =========================
  // Overall Wellness Stats
  // =========================

  app.fastify.get('/v1/wellness/stats', async (
    request: FastifyRequest<{
      Querystring: {
        period?: 'week' | 'month';
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const period = request.query.period || 'week';
    app.logger.info({ userId, period }, 'Fetching overall wellness stats');

    try {
      const daysAgo = period === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get all content entries
      const allEntries = await app.db.query.contentItems.findMany({
        where: and(
          eq(schema.contentItems.userId, userId as any),
          gte(schema.contentItems.createdAt, startDate)
        ),
      });

      // Get journal entries
      const journalEntries = await app.db.query.journalEntries.findMany({
        where: and(
          eq(schema.journalEntries.userId, userId as any),
          gte(schema.journalEntries.createdAt, startDate)
        ),
      });

      const moduleBreakdown: Record<string, number> = {};
      let totalDuration = 0;

      allEntries.forEach(entry => {
        moduleBreakdown[entry.module] = (moduleBreakdown[entry.module] || 0) + 1;
        if (entry.payload) {
          const payload = entry.payload as any;
          if (payload.duration) totalDuration += payload.duration;
        }
      });

      const completionScore = Math.min(
        100,
        Object.keys(moduleBreakdown).length * 15 + allEntries.length * 2
      );

      app.logger.info(
        { totalActivities: allEntries.length + journalEntries.length, completionScore },
        'Wellness stats calculated'
      );

      return {
        period,
        totalActivities: allEntries.length + journalEntries.length,
        journalEntries: journalEntries.length,
        contentSessions: allEntries.length,
        totalDuration: Math.round(totalDuration),
        moduleBreakdown,
        completionScore: Math.round(completionScore),
        activeModules: Object.keys(moduleBreakdown).length,
        recommendation: generateWellnessRecommendation(
          allEntries.length + journalEntries.length,
          Object.keys(moduleBreakdown).length,
          period
        ),
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch wellness stats');
      throw error;
    }
  });
}

// Helper function for wellness recommendations
function generateWellnessRecommendation(
  activities: number,
  modulesUsed: number,
  period: string
): string {
  const daysInPeriod = period === 'week' ? 7 : 30;
  const avgActivitiesPerDay = activities / daysInPeriod;

  if (activities === 0) {
    return 'Start your wellness journey by exploring different modules to find what works best for you.';
  }

  if (avgActivitiesPerDay < 1) {
    return 'Try to engage with at least one wellness activity daily for better results.';
  }

  if (modulesUsed < 3) {
    return `You\'ve been focusing on ${modulesUsed} module(s). Explore other modules to balance your wellness routine.`;
  }

  if (avgActivitiesPerDay >= 2) {
    return 'Great commitment! You\'re maintaining a strong wellness routine. Consider deepening your practice with premium features.';
  }

  return 'You\'re on a solid wellness journey. Keep up the consistent practice!';
}

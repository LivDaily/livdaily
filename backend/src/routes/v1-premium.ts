import type { App } from '../index.js';
import { eq, desc, and, gte } from 'drizzle-orm';
import * as schema from '../db/liqdaily-schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Helper to extract user ID from token
const getUserId = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  return authHeader.replace('Bearer ', '');
};

export function registerV1PremiumRoutes(app: App) {
  // =========================
  // Premium Features Endpoints
  // =========================

  // GET /v1/premium/features - Get all premium features for a module
  app.fastify.get('/v1/premium/features', async (
    request: FastifyRequest<{
      Querystring: {
        module?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    app.logger.info({ userId, module: request.query.module }, 'Fetching premium features');

    try {
      let features = await app.db.query.premiumFeatures.findMany();

      if (request.query.module) {
        features = features.filter(f => f.module === request.query.module);
      }

      app.logger.info({ count: features.length }, 'Premium features retrieved');

      return features.map(f => ({
        id: f.id,
        module: f.module,
        featureName: f.featureName,
        featureType: f.featureType,
        content: f.content,
        isPremium: f.isPremium,
        createdAt: f.createdAt,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch premium features');
      return [];
    }
  });

  // =========================
  // User Preferences Endpoints
  // =========================

  // GET /v1/user/preferences - Get user preferences
  app.fastify.get('/v1/user/preferences', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    app.logger.info({ userId }, 'Fetching user preferences');

    try {
      let prefs = await app.db.query.userPreferences.findFirst({
        where: eq(schema.userPreferences.userId, userId as any),
      });

      // Create default preferences if not exist
      if (!prefs) {
        app.logger.info({ userId }, 'Creating default user preferences');
        const result = await app.db.insert(schema.userPreferences).values({
          userId: userId as any,
          fontSize: 'medium',
          highContrast: false,
          reducedMotion: false,
          screenReaderEnabled: false,
          voiceControlEnabled: false,
        }).returning();
        prefs = result[0];
      }

      app.logger.info({ prefsId: prefs.id }, 'User preferences retrieved');

      return {
        id: prefs.id,
        fontSize: prefs.fontSize,
        highContrast: prefs.highContrast,
        reducedMotion: prefs.reducedMotion,
        screenReaderEnabled: prefs.screenReaderEnabled,
        voiceControlEnabled: prefs.voiceControlEnabled,
        notificationPreferences: prefs.notificationPreferences,
        trackingPreferences: prefs.trackingPreferences,
        createdAt: prefs.createdAt,
        updatedAt: prefs.updatedAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch user preferences');
      throw error;
    }
  });

  // PUT /v1/user/preferences - Update user preferences
  app.fastify.put('/v1/user/preferences', async (
    request: FastifyRequest<{
      Body: {
        fontSize?: string;
        highContrast?: boolean;
        reducedMotion?: boolean;
        screenReaderEnabled?: boolean;
        voiceControlEnabled?: boolean;
        notificationPreferences?: Record<string, any>;
        trackingPreferences?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const {
      fontSize,
      highContrast,
      reducedMotion,
      screenReaderEnabled,
      voiceControlEnabled,
      notificationPreferences,
      trackingPreferences,
    } = request.body;

    app.logger.info({ userId }, 'Updating user preferences');

    try {
      // Ensure preferences exist
      let prefs = await app.db.query.userPreferences.findFirst({
        where: eq(schema.userPreferences.userId, userId as any),
      });

      if (!prefs) {
        const result = await app.db.insert(schema.userPreferences).values({
          userId: userId as any,
        }).returning();
        prefs = result[0];
      }

      const updateData: any = {};
      if (fontSize !== undefined) updateData.fontSize = fontSize;
      if (highContrast !== undefined) updateData.highContrast = highContrast;
      if (reducedMotion !== undefined) updateData.reducedMotion = reducedMotion;
      if (screenReaderEnabled !== undefined) updateData.screenReaderEnabled = screenReaderEnabled;
      if (voiceControlEnabled !== undefined) updateData.voiceControlEnabled = voiceControlEnabled;
      if (notificationPreferences !== undefined) updateData.notificationPreferences = notificationPreferences;
      if (trackingPreferences !== undefined) updateData.trackingPreferences = trackingPreferences;

      const result = await app.db.update(schema.userPreferences)
        .set(updateData)
        .where(eq(schema.userPreferences.userId, userId as any))
        .returning();

      const updated = result[0];
      app.logger.info({ prefsId: updated.id }, 'User preferences updated');

      return {
        id: updated.id,
        fontSize: updated.fontSize,
        highContrast: updated.highContrast,
        reducedMotion: updated.reducedMotion,
        screenReaderEnabled: updated.screenReaderEnabled,
        voiceControlEnabled: updated.voiceControlEnabled,
        notificationPreferences: updated.notificationPreferences,
        trackingPreferences: updated.trackingPreferences,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to update user preferences');
      throw error;
    }
  });

  // =========================
  // Daily Images Endpoints
  // =========================

  // GET /v1/images/daily - Get daily image for module
  app.fastify.get('/v1/images/daily', async (
    request: FastifyRequest<{
      Querystring: {
        module: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { module } = request.query;
    if (!module) {
      return reply.status(400).send({ error: 'Module parameter is required' });
    }

    app.logger.info({ userId, module }, 'Fetching daily image');

    try {
      // Get current week and day
      const now = new Date();
      const weekNumber = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
      const dayOfWeek = now.getDay();

      // Get image for module, current week, and day
      const image = await app.db.query.dailyImages.findFirst({
        where: and(
          eq(schema.dailyImages.module, module),
          eq(schema.dailyImages.weekNumber, weekNumber),
          eq(schema.dailyImages.dayOfWeek, dayOfWeek)
        ),
      });

      if (!image) {
        return reply.status(404).send({ error: 'No image available for this day' });
      }

      // Update last used
      await app.db.update(schema.dailyImages)
        .set({ lastUsed: new Date() })
        .where(eq(schema.dailyImages.id, image.id));

      app.logger.info({ imageId: image.id }, 'Daily image retrieved');

      return {
        id: image.id,
        module: image.module,
        imageUrl: image.imageUrl,
        weekNumber: image.weekNumber,
        dayOfWeek: image.dayOfWeek,
        season: image.season,
        createdAt: image.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, module }, 'Failed to fetch daily image');
      return [];
    }
  });

  // POST /v1/images/rotate - Admin: rotate weekly images
  app.fastify.post('/v1/images/rotate', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<{ success: boolean } | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    app.logger.info({ userId }, 'Admin rotating weekly images');

    try {
      // Get current week number
      const now = new Date();
      const weekNumber = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);

      // Get all images from last week
      const previousWeek = weekNumber - 1;
      const oldImages = await app.db.query.dailyImages.findMany({
        where: eq(schema.dailyImages.weekNumber, previousWeek),
      });

      // Create new images for current week (would normally use AI or image service)
      // For now, just copy with new week number
      for (const oldImage of oldImages) {
        await app.db.insert(schema.dailyImages).values({
          module: oldImage.module,
          imageUrl: oldImage.imageUrl, // In production, would fetch new image
          weekNumber,
          dayOfWeek: oldImage.dayOfWeek,
          season: oldImage.season,
        });
      }

      app.logger.info({ weekNumber, count: oldImages.length }, 'Weekly images rotated');

      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to rotate images');
      throw error;
    }
  });

  // =========================
  // Sleep Premium Content Endpoints
  // =========================

  // GET /v1/sleep/premium - Get all premium sleep content
  app.fastify.get('/v1/sleep/premium', async (
    request: FastifyRequest<{
      Querystring: {
        contentType?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    app.logger.info({ userId }, 'Fetching premium sleep content');

    try {
      let content = await app.db.query.sleepPremiumContent.findMany();

      if (request.query.contentType) {
        content = content.filter(c => c.contentType === request.query.contentType);
      }

      app.logger.info({ count: content.length }, 'Premium sleep content retrieved');

      return content.map(c => ({
        id: c.id,
        contentType: c.contentType,
        title: c.title,
        description: c.description,
        audioUrl: c.audioUrl,
        durationMinutes: c.durationMinutes,
        isPremium: c.isPremium,
        createdAt: c.createdAt,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch premium sleep content');
      return [];
    }
  });

  // POST /v1/sleep/dream-journal - Create dream journal entry
  app.fastify.post('/v1/sleep/dream-journal', async (
    request: FastifyRequest<{
      Body: {
        content: string;
        mood?: string;
        date?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { content, mood, date } = request.body;

    app.logger.info({ userId }, 'Creating dream journal entry');

    try {
      // Save as content item with module 'dream_journal'
      const result = await app.db.insert(schema.contentItems).values({
        userId: userId as any,
        module: 'dream_journal',
        title: `Dream - ${new Date().toLocaleDateString()}`,
        content,
        payload: { mood, recordedDate: date || new Date().toISOString() },
        isAiGenerated: false,
      }).returning();

      const entry = result[0];
      app.logger.info({ entryId: entry.id }, 'Dream journal entry created');

      return {
        id: entry.id,
        content: entry.content,
        mood: (entry.payload as any)?.mood,
        date: (entry.payload as any)?.recordedDate,
        createdAt: entry.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to create dream journal entry');
      throw error;
    }
  });

  // GET /v1/sleep/analysis - Get advanced sleep analysis
  app.fastify.get('/v1/sleep/analysis', async (
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

    app.logger.info({ userId, period }, 'Fetching sleep analysis');

    try {
      const daysAgo = period === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get all sleep content items for this user in period
      const sleepEntries = await app.db.query.contentItems.findMany({
        where: and(
          eq(schema.contentItems.userId, userId as any),
          eq(schema.contentItems.module, 'sleep'),
          gte(schema.contentItems.createdAt, startDate)
        ),
      });

      // Calculate averages from payload data
      let totalDuration = 0;
      let averageQuality = 0;
      const patterns: Record<string, number> = {};

      sleepEntries.forEach(entry => {
        if (entry.payload) {
          const payload = entry.payload as any;
          if (payload.duration) totalDuration += payload.duration;
          if (payload.quality) averageQuality += payload.quality;
          if (payload.pattern) patterns[payload.pattern] = (patterns[payload.pattern] || 0) + 1;
        }
      });

      const avgDuration = sleepEntries.length > 0 ? totalDuration / sleepEntries.length : 0;
      const avgQuality = sleepEntries.length > 0 ? averageQuality / sleepEntries.length : 0;

      app.logger.info(
        { avgDuration, avgQuality, entryCount: sleepEntries.length },
        'Sleep analysis calculated'
      );

      return {
        period,
        averageDuration: Math.round(avgDuration * 10) / 10,
        averageQuality: Math.round(avgQuality * 10) / 10,
        totalSessions: sleepEntries.length,
        patterns,
        recommendations: generateSleepRecommendations(avgQuality, avgDuration),
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch sleep analysis');
      throw error;
    }
  });
}

// Helper function for sleep recommendations
function generateSleepRecommendations(quality: number, duration: number): string[] {
  const recommendations: string[] = [];

  if (quality < 5) {
    recommendations.push('Try our wind-down flow 30 minutes before bed');
    recommendations.push('Consider using sleep sounds for better rest');
  }

  if (duration < 6) {
    recommendations.push('Aim for 7-9 hours of sleep per night');
    recommendations.push('Try our extended meditation sessions');
  }

  if (recommendations.length === 0) {
    recommendations.push('Great job maintaining good sleep habits!');
    recommendations.push('Consider exploring advanced sleep coaching');
  }

  return recommendations;
}

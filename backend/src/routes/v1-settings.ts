import type { App } from '../index.js';
import { eq } from 'drizzle-orm';
import * as schema from '../db/liqdaily-schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { unauthorized, notFound } from '../utils/errors.js';

// Helper to extract user ID from token
const getUserId = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  return authHeader.replace('Bearer ', '');
};

export function registerV1SettingsRoutes(app: App) {
  // =========================
  // User Settings Endpoints
  // =========================

  // GET /v1/user/settings - Get all user settings consolidated
  app.fastify.get('/v1/user/settings', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return unauthorized(reply);
    }

    app.logger.info({ userId }, 'Fetching consolidated user settings');

    try {
      // Get user preferences
      let prefs = await app.db.query.userPreferences.findFirst({
        where: eq(schema.userPreferences.userId, userId as any),
      });

      // Create default preferences if not exist
      if (!prefs) {
        app.logger.info({ userId }, 'Creating default user settings');
        const result = await app.db.insert(schema.userPreferences).values({
          userId: userId as any,
          fontSize: 'medium',
          highContrast: false,
          reducedMotion: false,
          screenReaderEnabled: false,
          voiceControlEnabled: false,
          notificationPreferences: {
            morningArrival: true,
            middayGrounding: true,
            afternoonMovement: true,
            eveningUnwind: true,
            nightRest: true,
          },
          trackingPreferences: {
            movementTracking: true,
            nutritionTracking: true,
            sleepTracking: true,
            journalTracking: true,
            groundingTracking: true,
          },
        }).returning();
        prefs = result[0];
      }

      app.logger.info({ userId }, 'User settings retrieved');

      return {
        id: prefs.id,
        userId: prefs.userId,
        // Accessibility Settings
        accessibility: {
          fontSize: prefs.fontSize || 'medium',
          highContrast: prefs.highContrast || false,
          reducedMotion: prefs.reducedMotion || false,
          screenReaderEnabled: prefs.screenReaderEnabled || false,
          voiceControlEnabled: prefs.voiceControlEnabled || false,
        },
        // Notification Settings
        notifications: prefs.notificationPreferences || {
          morningArrival: true,
          middayGrounding: true,
          afternoonMovement: true,
          eveningUnwind: true,
          nightRest: true,
        },
        // Tracking Settings
        tracking: prefs.trackingPreferences || {
          movementTracking: true,
          nutritionTracking: true,
          sleepTracking: true,
          journalTracking: true,
          groundingTracking: true,
        },
        createdAt: prefs.createdAt,
        updatedAt: prefs.updatedAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch user settings');
      throw error;
    }
  });

  // PUT /v1/user/settings - Update all user settings
  app.fastify.put('/v1/user/settings', async (
    request: FastifyRequest<{
      Body: {
        accessibility?: {
          fontSize?: string;
          highContrast?: boolean;
          reducedMotion?: boolean;
          screenReaderEnabled?: boolean;
          voiceControlEnabled?: boolean;
        };
        notifications?: Record<string, boolean>;
        tracking?: Record<string, boolean>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return unauthorized(reply);
    }

    const { accessibility, notifications, tracking } = request.body;

    app.logger.info({ userId }, 'Updating user settings');

    try {
      // Ensure settings exist
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

      // Update accessibility settings
      if (accessibility) {
        if (accessibility.fontSize !== undefined) {
          updateData.fontSize = accessibility.fontSize;
        }
        if (accessibility.highContrast !== undefined) {
          updateData.highContrast = accessibility.highContrast;
        }
        if (accessibility.reducedMotion !== undefined) {
          updateData.reducedMotion = accessibility.reducedMotion;
        }
        if (accessibility.screenReaderEnabled !== undefined) {
          updateData.screenReaderEnabled = accessibility.screenReaderEnabled;
        }
        if (accessibility.voiceControlEnabled !== undefined) {
          updateData.voiceControlEnabled = accessibility.voiceControlEnabled;
        }
      }

      // Update notification settings
      if (notifications !== undefined) {
        updateData.notificationPreferences = notifications;
      }

      // Update tracking settings
      if (tracking !== undefined) {
        updateData.trackingPreferences = tracking;
      }

      const result = await app.db.update(schema.userPreferences)
        .set(updateData)
        .where(eq(schema.userPreferences.userId, userId as any))
        .returning();

      const updated = result[0];
      app.logger.info({ userId }, 'User settings updated successfully');

      return {
        id: updated.id,
        userId: updated.userId,
        accessibility: {
          fontSize: updated.fontSize || 'medium',
          highContrast: updated.highContrast || false,
          reducedMotion: updated.reducedMotion || false,
          screenReaderEnabled: updated.screenReaderEnabled || false,
          voiceControlEnabled: updated.voiceControlEnabled || false,
        },
        notifications: updated.notificationPreferences || {
          morningArrival: true,
          middayGrounding: true,
          afternoonMovement: true,
          eveningUnwind: true,
          nightRest: true,
        },
        tracking: updated.trackingPreferences || {
          movementTracking: true,
          nutritionTracking: true,
          sleepTracking: true,
          journalTracking: true,
          groundingTracking: true,
        },
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to update user settings');
      throw error;
    }
  });

  // GET /v1/user/profile - Get user profile
  app.fastify.get('/v1/user/profile', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return unauthorized(reply);
    }

    app.logger.info({ userId }, 'Fetching user profile');

    try {
      const user = await app.db.query.users.findFirst({
        where: eq(schema.users.id, userId as any),
      });

      if (!user) {
        return notFound(reply, 'User not found');
      }

      app.logger.info({ userId }, 'User profile retrieved');

      return {
        id: user.id,
        isAnonymous: user.isAnonymous,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch user profile');
      throw error;
    }
  });

  // PUT /v1/user/profile - Update user profile
  app.fastify.put('/v1/user/profile', async (
    request: FastifyRequest<{
      Body: {
        email?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return unauthorized(reply);
    }

    const { email } = request.body;

    app.logger.info({ userId }, 'Updating user profile');

    try {
      const updateData: any = {};

      if (email !== undefined) {
        updateData.email = email;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        const user = await app.db.query.users.findFirst({
          where: eq(schema.users.id, userId as any),
        });

        if (!user) {
          return notFound(reply, 'User not found');
        }

        return {
          id: user.id,
          isAnonymous: user.isAnonymous,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }

      const result = await app.db.update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, userId as any))
        .returning();

      const updated = result[0];
      app.logger.info({ userId }, 'User profile updated successfully');

      return {
        id: updated.id,
        isAnonymous: updated.isAnonymous,
        email: updated.email,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to update user profile');
      throw error;
    }
  });
}

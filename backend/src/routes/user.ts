import type { App } from '../index.js';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerUserRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/user/profile - Get user profile
  app.fastify.get('/api/user/profile', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    app.logger.info({ userId }, 'Fetching user profile');

    try {
      let profile = await app.db.query.userProfiles.findFirst({
        where: eq(schema.userProfiles.userId, userId),
      });

      // Create profile if it doesn't exist
      if (!profile) {
        app.logger.info({ userId }, 'Creating new user profile');
        const result = await app.db.insert(schema.userProfiles).values({
          userId,
          name: session.user.name,
          themePreference: 'earth_tones',
        }).returning();
        profile = result[0];
      }

      app.logger.info({ profileId: profile.id }, 'User profile retrieved');
      return {
        id: profile.id,
        name: profile.name,
        themePreference: profile.themePreference,
        notificationSettings: profile.notificationSettings,
        createdAt: profile.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch user profile');
      throw error;
    }
  });

  // PUT /api/user/profile - Update user profile
  app.fastify.put('/api/user/profile', async (
    request: FastifyRequest<{
      Body: {
        name?: string;
        themePreference?: string;
        notificationSettings?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { name, themePreference, notificationSettings } = request.body;

    app.logger.info({ userId, name, themePreference }, 'Updating user profile');

    try {
      // Ensure profile exists
      let profile = await app.db.query.userProfiles.findFirst({
        where: eq(schema.userProfiles.userId, userId),
      });

      if (!profile) {
        const result = await app.db.insert(schema.userProfiles).values({
          userId,
          name: session.user.name,
        }).returning();
        profile = result[0];
      }

      // Update profile with provided fields
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (themePreference !== undefined) updateData.themePreference = themePreference;
      if (notificationSettings !== undefined) updateData.notificationSettings = notificationSettings;

      const updated = await app.db.update(schema.userProfiles)
        .set(updateData)
        .where(eq(schema.userProfiles.userId, userId))
        .returning();

      app.logger.info({ profileId: updated[0].id }, 'User profile updated');

      return {
        id: updated[0].id,
        name: updated[0].name,
        themePreference: updated[0].themePreference,
        notificationSettings: updated[0].notificationSettings,
        createdAt: updated[0].createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to update user profile');
      throw error;
    }
  });

  // GET /api/user/patterns - Get user patterns
  app.fastify.get('/api/user/patterns', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    app.logger.info({ userId }, 'Fetching user patterns');

    try {
      let patterns = await app.db.query.userPatterns.findFirst({
        where: eq(schema.userPatterns.userId, userId),
      });

      // Create default patterns if they don't exist
      if (!patterns) {
        app.logger.info({ userId }, 'Creating default user patterns');
        const result = await app.db.insert(schema.userPatterns).values({
          userId,
          patternData: {},
        }).returning();
        patterns = result[0];
      }

      app.logger.info({ patternId: patterns.id }, 'User patterns retrieved');

      return {
        patterns: patterns.patternData || {},
        lastUpdated: patterns.lastUpdated,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch user patterns');
      throw error;
    }
  });
}

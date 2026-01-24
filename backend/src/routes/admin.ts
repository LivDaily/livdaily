import type { App } from '../index.js';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import * as authSchema from '../db/auth-schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerAdminRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Helper function to check admin role
  const checkAdmin = (user: any) => user?.role === 'admin';

  // GET /api/admin/users - Get all users
  app.fastify.get('/api/admin/users', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;

    app.logger.info({ userId }, 'Admin accessing users list');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const users = await app.db.query.user.findMany();

      app.logger.info({ count: users.length }, 'Users list retrieved');

      return users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch users list');
      throw error;
    }
  });

  // PUT /api/admin/users/:id/role - Update user role
  app.fastify.put('/api/admin/users/:id/role', async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: { role: 'user' | 'admin' };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const adminId = session.user.id;
    const { id: targetUserId } = request.params;
    const { role } = request.body;

    app.logger.info({ adminId, targetUserId, role }, 'Updating user role');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ adminId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      if (!['user', 'admin'].includes(role)) {
        return reply.status(400).send({ error: 'Invalid role' });
      }

      // Check if target user exists
      const targetUser = await app.db.query.user.findFirst({
        where: eq(authSchema.user.id, targetUserId),
      });

      if (!targetUser) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const result = await app.db.update(authSchema.user)
        .set({ role })
        .where(eq(authSchema.user.id, targetUserId))
        .returning();

      const updatedUser = result[0];
      app.logger.info(
        { userId: updatedUser.id, role: updatedUser.role },
        'User role updated'
      );

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, adminId, targetUserId }, 'Failed to update user role');
      throw error;
    }
  });

  // GET /api/admin/stats - Get app statistics
  app.fastify.get('/api/admin/stats', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;

    app.logger.info({ userId }, 'Fetching admin statistics');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      // Fetch counts from all tracking tables
      const [
        usersResult,
        journalResult,
        movementResult,
        nutritionResult,
        sleepResult,
        groundingResult,
      ] = await Promise.all([
        app.db.query.user.findMany(),
        app.db.query.journalEntries.findMany(),
        app.db.query.movementLogs.findMany(),
        app.db.query.nutritionTasks.findMany(),
        app.db.query.sleepLogs.findMany(),
        app.db.query.groundingSessions.findMany(),
      ]);

      const stats = {
        totalUsers: usersResult.length,
        totalJournalEntries: journalResult.length,
        totalMovementLogs: movementResult.length,
        totalNutritionTasks: nutritionResult.length,
        totalSleepLogs: sleepResult.length,
        totalGroundingSessions: groundingResult.length,
      };

      app.logger.info(stats, 'Admin statistics retrieved');

      return stats;
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch admin statistics');
      throw error;
    }
  });

  // POST /api/admin/media - Create media (admin only)
  app.fastify.post('/api/admin/media', async (
    request: FastifyRequest<{
      Body: {
        mediaType: string;
        url: string;
        category?: string;
        season?: string;
        rhythmPhase?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { mediaType, url, category, season, rhythmPhase } = request.body;

    app.logger.info({ userId, mediaType, category }, 'Admin creating media entry');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const result = await app.db.insert(schema.mediaLibrary).values({
        mediaType,
        url,
        category,
        season,
        rhythmPhase,
        isActive: true,
      }).returning();

      const media = result[0];
      app.logger.info({ mediaId: media.id }, 'Media entry created');

      return {
        id: media.id,
        mediaType: media.mediaType,
        url: media.url,
        category: media.category,
        season: media.season,
        rhythmPhase: media.rhythmPhase,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, mediaType }, 'Failed to create media entry');
      throw error;
    }
  });

  // PUT /api/admin/media/:id - Update media (admin only)
  app.fastify.put('/api/admin/media/:id', async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: {
        isActive?: boolean;
        category?: string;
        season?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { id } = request.params;
    const { isActive, category, season } = request.body;

    app.logger.info({ userId, mediaId: id }, 'Admin updating media');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const updateData: any = {};
      if (isActive !== undefined) updateData.isActive = isActive;
      if (category !== undefined) updateData.category = category;
      if (season !== undefined) updateData.season = season;

      const result = await app.db.update(schema.mediaLibrary)
        .set(updateData)
        .where(eq(schema.mediaLibrary.id, id))
        .returning();

      if (result.length === 0) {
        return reply.status(404).send({ error: 'Media not found' });
      }

      const media = result[0];
      app.logger.info({ mediaId: media.id }, 'Media updated');

      return {
        id: media.id,
        mediaType: media.mediaType,
        url: media.url,
        category: media.category,
        season: media.season,
        isActive: media.isActive,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, mediaId: id }, 'Failed to update media');
      throw error;
    }
  });

  // DELETE /api/admin/media/:id - Delete media (admin version)
  app.fastify.delete('/api/admin/media/:id', async (
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ): Promise<{ success: boolean } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { id } = request.params;

    app.logger.info({ userId, mediaId: id }, 'Admin deleting media');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const media = await app.db.query.mediaLibrary.findFirst({
        where: eq(schema.mediaLibrary.id, id),
      });

      if (!media) {
        return reply.status(404).send({ error: 'Media not found' });
      }

      // Delete from storage
      if (media.url) {
        try {
          const urlParts = media.url.split('/');
          const key = `media/${urlParts[urlParts.length - 1]}`;
          await app.storage.delete(key);
        } catch (storageError) {
          app.logger.warn({ err: storageError }, 'Failed to delete from storage');
        }
      }

      await app.db.delete(schema.mediaLibrary)
        .where(eq(schema.mediaLibrary.id, id));

      app.logger.info({ mediaId: id }, 'Media deleted by admin');

      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, userId, mediaId: id }, 'Failed to delete media');
      throw error;
    }
  });

  // POST /api/admin/motivation - Create motivation
  app.fastify.post('/api/admin/motivation', async (
    request: FastifyRequest<{
      Body: {
        content: string;
        author?: string;
        weekStartDate: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { content, author, weekStartDate } = request.body;

    app.logger.info({ userId, weekStartDate }, 'Admin creating motivation');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const result = await app.db.insert(schema.weeklyMotivation).values({
        weekStartDate,
        content,
        author,
      }).returning();

      const motivation = result[0];
      app.logger.info({ motivationId: motivation.id }, 'Motivation created');

      return {
        id: motivation.id,
        weekStartDate: motivation.weekStartDate,
        content: motivation.content,
        author: motivation.author,
        createdAt: motivation.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, weekStartDate }, 'Failed to create motivation');
      throw error;
    }
  });

  // PUT /api/admin/motivation/:id - Update motivation
  app.fastify.put('/api/admin/motivation/:id', async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: {
        content?: string;
        author?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { id } = request.params;
    const { content, author } = request.body;

    app.logger.info({ userId, motivationId: id }, 'Admin updating motivation');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const updateData: any = {};
      if (content !== undefined) updateData.content = content;
      if (author !== undefined) updateData.author = author;

      const result = await app.db.update(schema.weeklyMotivation)
        .set(updateData)
        .where(eq(schema.weeklyMotivation.id, id))
        .returning();

      if (result.length === 0) {
        return reply.status(404).send({ error: 'Motivation not found' });
      }

      const motivation = result[0];
      app.logger.info({ motivationId: motivation.id }, 'Motivation updated');

      return {
        id: motivation.id,
        weekStartDate: motivation.weekStartDate,
        content: motivation.content,
        author: motivation.author,
        createdAt: motivation.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, motivationId: id }, 'Failed to update motivation');
      throw error;
    }
  });

  // DELETE /api/admin/motivation/:id - Delete motivation
  app.fastify.delete('/api/admin/motivation/:id', async (
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ): Promise<{ success: boolean } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { id } = request.params;

    app.logger.info({ userId, motivationId: id }, 'Admin deleting motivation');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const motivation = await app.db.query.weeklyMotivation.findFirst({
        where: eq(schema.weeklyMotivation.id, id),
      });

      if (!motivation) {
        return reply.status(404).send({ error: 'Motivation not found' });
      }

      await app.db.delete(schema.weeklyMotivation)
        .where(eq(schema.weeklyMotivation.id, id));

      app.logger.info({ motivationId: id }, 'Motivation deleted');

      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, userId, motivationId: id }, 'Failed to delete motivation');
      throw error;
    }
  });
}

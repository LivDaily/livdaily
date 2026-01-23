import type { App } from '../index.js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerMediaRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/media - Get media items with optional filters
  app.fastify.get('/api/media', async (
    request: FastifyRequest<{
      Querystring: {
        mediaType?: string;
        category?: string;
        season?: string;
        rhythmPhase?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { mediaType, category, season, rhythmPhase } = request.query;

    app.logger.info(
      { mediaType, category, season, rhythmPhase },
      'Fetching media library'
    );

    try {
      let whereConditions = [eq(schema.mediaLibrary.isActive, true)];

      if (mediaType) whereConditions.push(eq(schema.mediaLibrary.mediaType, mediaType));
      if (category) whereConditions.push(eq(schema.mediaLibrary.category, category));
      if (season) whereConditions.push(eq(schema.mediaLibrary.season, season));
      if (rhythmPhase) whereConditions.push(eq(schema.mediaLibrary.rhythmPhase, rhythmPhase));

      const whereClause = whereConditions.length > 1
        ? and(...whereConditions)
        : whereConditions[0];

      const media = await app.db.query.mediaLibrary.findMany({
        where: whereClause,
      });

      app.logger.info({ count: media.length }, 'Media items retrieved');

      return media.map(m => ({
        id: m.id,
        mediaType: m.mediaType,
        url: m.url,
        category: m.category,
        season: m.season,
        rhythmPhase: m.rhythmPhase,
      }));
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch media');
      throw error;
    }
  });

  // POST /api/media/upload - Upload media file
  app.fastify.post('/api/media/upload', async (
    request: FastifyRequest<{
      Body: {
        mediaType?: string;
        category?: string;
        season?: string;
        rhythmPhase?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({}, 'Processing media upload');

    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No file provided' });
      }

      let buffer: Buffer;
      try {
        buffer = await data.toBuffer();
      } catch (err) {
        app.logger.error({ err }, 'File size limit exceeded');
        return reply.status(413).send({ error: 'File too large' });
      }

      const mediaType = (request.body as any)?.mediaType || 'image';
      const category = (request.body as any)?.category;
      const season = (request.body as any)?.season;
      const rhythmPhase = (request.body as any)?.rhythmPhase;

      const key = `media/${Date.now()}-${data.filename}`;
      const uploadedKey = await app.storage.upload(key, buffer);
      const { url } = await app.storage.getSignedUrl(uploadedKey);

      // Create media library entry
      const result = await app.db.insert(schema.mediaLibrary).values({
        mediaType,
        url,
        category,
        season,
        rhythmPhase,
        isActive: true,
      }).returning();

      const media = result[0];
      app.logger.info({ mediaId: media.id, mediaType }, 'Media uploaded successfully');

      return {
        id: media.id,
        url: media.url,
        mediaType: media.mediaType,
        category: media.category,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to upload media');
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

    // Check admin role
    const user = session.user;
    if (user.role !== 'admin') {
      app.logger.warn({ userId: user.id }, 'Unauthorized admin access attempt');
      return reply.status(403).send({ error: 'Unauthorized' });
    }

    const { mediaType, url, category, season, rhythmPhase } = request.body;

    app.logger.info({ mediaType, category }, 'Creating media entry (admin)');

    try {
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
      app.logger.error({ err: error, mediaType }, 'Failed to create media entry');
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

    // Check admin role
    const user = session.user;
    if (user.role !== 'admin') {
      app.logger.warn({ userId: user.id }, 'Unauthorized admin access attempt');
      return reply.status(403).send({ error: 'Unauthorized' });
    }

    const { id } = request.params;
    const { isActive, category, season } = request.body;

    app.logger.info({ mediaId: id }, 'Updating media (admin)');

    try {
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
      app.logger.error({ err: error, mediaId: id }, 'Failed to update media');
      throw error;
    }
  });

  // DELETE /api/admin/media/:id - Delete media (admin only)
  app.fastify.delete('/api/admin/media/:id', async (
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ): Promise<{ success: boolean } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    // Check admin role
    const user = session.user;
    if (user.role !== 'admin') {
      app.logger.warn({ userId: user.id }, 'Unauthorized admin access attempt');
      return reply.status(403).send({ error: 'Unauthorized' });
    }

    const { id } = request.params;

    app.logger.info({ mediaId: id }, 'Deleting media (admin)');

    try {
      const media = await app.db.query.mediaLibrary.findFirst({
        where: eq(schema.mediaLibrary.id, id),
      });

      if (!media) {
        return reply.status(404).send({ error: 'Media not found' });
      }

      // Delete from storage
      if (media.url) {
        try {
          // Extract key from URL if needed
          const urlParts = media.url.split('/');
          const key = `media/${urlParts[urlParts.length - 1]}`;
          await app.storage.delete(key);
        } catch (storageError) {
          app.logger.warn({ err: storageError }, 'Failed to delete from storage');
        }
      }

      await app.db.delete(schema.mediaLibrary)
        .where(eq(schema.mediaLibrary.id, id));

      app.logger.info({ mediaId: id }, 'Media deleted');

      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, mediaId: id }, 'Failed to delete media');
      throw error;
    }
  });
}

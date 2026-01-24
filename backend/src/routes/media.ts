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
}

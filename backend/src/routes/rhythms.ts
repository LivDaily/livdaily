import type { App } from '../index.js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerRhythmsRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/rhythms - Get daily rhythms
  app.fastify.get('/api/rhythms', async (
    request: FastifyRequest<{
      Querystring: {
        date?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { date } = request.query;

    app.logger.info({ userId, date }, 'Fetching daily rhythms');

    try {
      let query = app.db.query.dailyRhythms.findMany({
        where: eq(schema.dailyRhythms.userId, userId),
      });

      if (date) {
        query = app.db.query.dailyRhythms.findMany({
          where: and(
            eq(schema.dailyRhythms.userId, userId),
            eq(schema.dailyRhythms.date, date)
          ),
        });
      }

      const rhythms = await query;
      app.logger.info({ count: rhythms.length }, 'Daily rhythms retrieved');

      return rhythms.map(r => ({
        id: r.id,
        date: r.date,
        morningMood: r.morningMood,
        middayEnergy: r.middayEnergy,
        eveningState: r.eveningState,
        nightQuality: r.nightQuality,
        createdAt: r.createdAt,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch daily rhythms');
      throw error;
    }
  });

  // POST /api/rhythms - Create daily rhythm
  app.fastify.post('/api/rhythms', async (
    request: FastifyRequest<{
      Body: {
        date: string;
        morningMood?: string;
        middayEnergy?: string;
        eveningState?: string;
        nightQuality?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { date, morningMood, middayEnergy, eveningState, nightQuality } = request.body;

    app.logger.info({ userId, date }, 'Creating daily rhythm entry');

    try {
      const result = await app.db.insert(schema.dailyRhythms).values({
        userId,
        date,
        morningMood,
        middayEnergy,
        eveningState,
        nightQuality,
      }).returning();

      const rhythm = result[0];
      app.logger.info({ rhythmId: rhythm.id, date }, 'Daily rhythm created');

      return {
        id: rhythm.id,
        date: rhythm.date,
        morningMood: rhythm.morningMood,
        middayEnergy: rhythm.middayEnergy,
        eveningState: rhythm.eveningState,
        nightQuality: rhythm.nightQuality,
        createdAt: rhythm.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, date }, 'Failed to create daily rhythm');
      throw error;
    }
  });

  // PUT /api/rhythms/:id - Update daily rhythm
  app.fastify.put('/api/rhythms/:id', async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: {
        morningMood?: string;
        middayEnergy?: string;
        eveningState?: string;
        nightQuality?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { id } = request.params;
    const { morningMood, middayEnergy, eveningState, nightQuality } = request.body;

    app.logger.info({ userId, rhythmId: id }, 'Updating daily rhythm');

    try {
      // Verify ownership
      const existing = await app.db.query.dailyRhythms.findFirst({
        where: eq(schema.dailyRhythms.id, id),
      });

      if (!existing) {
        return reply.status(404).send({ error: 'Rhythm not found' });
      }

      if (existing.userId !== userId) {
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      const updateData: any = {};
      if (morningMood !== undefined) updateData.morningMood = morningMood;
      if (middayEnergy !== undefined) updateData.middayEnergy = middayEnergy;
      if (eveningState !== undefined) updateData.eveningState = eveningState;
      if (nightQuality !== undefined) updateData.nightQuality = nightQuality;

      const result = await app.db.update(schema.dailyRhythms)
        .set(updateData)
        .where(eq(schema.dailyRhythms.id, id))
        .returning();

      const rhythm = result[0];
      app.logger.info({ rhythmId: rhythm.id }, 'Daily rhythm updated');

      return {
        id: rhythm.id,
        date: rhythm.date,
        morningMood: rhythm.morningMood,
        middayEnergy: rhythm.middayEnergy,
        eveningState: rhythm.eveningState,
        nightQuality: rhythm.nightQuality,
        createdAt: rhythm.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, rhythmId: id }, 'Failed to update daily rhythm');
      throw error;
    }
  });
}

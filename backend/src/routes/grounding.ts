import type { App } from '../index.js';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerGroundingRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/grounding - Get grounding sessions
  app.fastify.get('/api/grounding', async (
    request: FastifyRequest<{
      Querystring: {
        startDate?: string;
        endDate?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { startDate, endDate } = request.query;

    app.logger.info({ userId, startDate, endDate }, 'Fetching grounding sessions');

    try {
      let whereClause = eq(schema.groundingSessions.userId, userId);

      if (startDate && endDate) {
        whereClause = and(
          eq(schema.groundingSessions.userId, userId),
          gte(schema.groundingSessions.completedAt, new Date(startDate)),
          lte(schema.groundingSessions.completedAt, new Date(endDate))
        );
      }

      const sessions = await app.db.query.groundingSessions.findMany({
        where: whereClause,
        orderBy: desc(schema.groundingSessions.completedAt),
      });

      app.logger.info({ count: sessions.length }, 'Grounding sessions retrieved');

      return sessions.map(s => ({
        id: s.id,
        sessionType: s.sessionType,
        durationMinutes: s.durationMinutes,
        completedAt: s.completedAt,
        notes: s.notes,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch grounding sessions');
      throw error;
    }
  });

  // POST /api/grounding - Create grounding session
  app.fastify.post('/api/grounding', async (
    request: FastifyRequest<{
      Body: {
        sessionType: string;
        durationMinutes: number;
        notes?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { sessionType, durationMinutes, notes } = request.body;

    app.logger.info(
      { userId, sessionType, durationMinutes },
      'Creating grounding session'
    );

    try {
      const result = await app.db.insert(schema.groundingSessions).values({
        userId,
        sessionType,
        durationMinutes,
        completedAt: new Date(),
        notes,
      }).returning();

      const groundingSession = result[0];
      app.logger.info(
        { sessionId: groundingSession.id, duration: groundingSession.durationMinutes },
        'Grounding session created'
      );

      return {
        id: groundingSession.id,
        sessionType: groundingSession.sessionType,
        durationMinutes: groundingSession.durationMinutes,
        completedAt: groundingSession.completedAt,
        notes: groundingSession.notes,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, sessionType }, 'Failed to create grounding session');
      throw error;
    }
  });
}

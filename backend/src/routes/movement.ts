import type { App } from '../index.js';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerMovementRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/movement - Get movement logs
  app.fastify.get('/api/movement', async (
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

    app.logger.info({ userId, startDate, endDate }, 'Fetching movement logs');

    try {
      let whereClause = eq(schema.movementLogs.userId, userId);

      if (startDate && endDate) {
        whereClause = and(
          eq(schema.movementLogs.userId, userId),
          gte(schema.movementLogs.completedAt, new Date(startDate)),
          lte(schema.movementLogs.completedAt, new Date(endDate))
        );
      }

      const logs = await app.db.query.movementLogs.findMany({
        where: whereClause,
        orderBy: desc(schema.movementLogs.completedAt),
      });

      app.logger.info({ count: logs.length }, 'Movement logs retrieved');

      return logs.map(log => ({
        id: log.id,
        activityType: log.activityType,
        durationMinutes: log.durationMinutes,
        videoId: log.videoId,
        completedAt: log.completedAt,
        notes: log.notes,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch movement logs');
      throw error;
    }
  });

  // POST /api/movement - Create movement log
  app.fastify.post('/api/movement', async (
    request: FastifyRequest<{
      Body: {
        activityType: string;
        durationMinutes?: number;
        videoId?: string;
        notes?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { activityType, durationMinutes, videoId, notes } = request.body;

    app.logger.info({ userId, activityType, durationMinutes }, 'Creating movement log');

    try {
      const result = await app.db.insert(schema.movementLogs).values({
        userId,
        activityType,
        durationMinutes,
        videoId,
        completedAt: new Date(),
        notes,
      }).returning();

      const log = result[0];
      app.logger.info({ logId: log.id, duration: log.durationMinutes }, 'Movement log created');

      return {
        id: log.id,
        activityType: log.activityType,
        durationMinutes: log.durationMinutes,
        videoId: log.videoId,
        completedAt: log.completedAt,
        notes: log.notes,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, activityType }, 'Failed to create movement log');
      throw error;
    }
  });

  // GET /api/movement/stats - Get movement statistics
  app.fastify.get('/api/movement/stats', async (
    request: FastifyRequest<{
      Querystring: {
        period?: 'week' | 'month';
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const period = request.query.period || 'week';

    app.logger.info({ userId, period }, 'Fetching movement statistics');

    try {
      const daysAgo = period === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const logs = await app.db.query.movementLogs.findMany({
        where: and(
          eq(schema.movementLogs.userId, userId),
          gte(schema.movementLogs.completedAt, startDate)
        ),
      });

      const totalMinutes = logs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
      const sessionsCount = logs.length;

      // Calculate favorite activities
      const activityMap = new Map<string, number>();
      logs.forEach(log => {
        if (log.activityType) {
          activityMap.set(log.activityType, (activityMap.get(log.activityType) || 0) + 1);
        }
      });

      const favoriteActivities = Array.from(activityMap.entries())
        .map(([activity, count]) => ({ activity, count }))
        .sort((a, b) => b.count - a.count);

      app.logger.info(
        { totalMinutes, sessionsCount },
        'Movement statistics calculated'
      );

      return {
        totalMinutes,
        sessionsCount,
        favoriteActivities,
        period,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch movement statistics');
      throw error;
    }
  });
}

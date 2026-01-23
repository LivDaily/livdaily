import type { App } from '../index.js';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerSleepRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/sleep - Get sleep logs
  app.fastify.get('/api/sleep', async (
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

    app.logger.info({ userId, startDate, endDate }, 'Fetching sleep logs');

    try {
      let whereClause = eq(schema.sleepLogs.userId, userId);

      if (startDate && endDate) {
        whereClause = and(
          eq(schema.sleepLogs.userId, userId),
          gte(schema.sleepLogs.date, startDate),
          lte(schema.sleepLogs.date, endDate)
        );
      }

      const logs = await app.db.query.sleepLogs.findMany({
        where: whereClause,
        orderBy: desc(schema.sleepLogs.date),
      });

      app.logger.info({ count: logs.length }, 'Sleep logs retrieved');

      return logs.map(log => ({
        id: log.id,
        bedtime: log.bedtime,
        wakeTime: log.wakeTime,
        qualityRating: log.qualityRating,
        windDownActivity: log.windDownActivity,
        reflection: log.reflection,
        date: log.date,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch sleep logs');
      throw error;
    }
  });

  // POST /api/sleep - Create sleep log
  app.fastify.post('/api/sleep', async (
    request: FastifyRequest<{
      Body: {
        bedtime?: string;
        wakeTime?: string;
        qualityRating?: number;
        windDownActivity?: string;
        reflection?: string;
        date?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { bedtime, wakeTime, qualityRating, windDownActivity, reflection, date } = request.body;

    app.logger.info({ userId, date }, 'Creating sleep log');

    try {
      const result = await app.db.insert(schema.sleepLogs).values({
        userId,
        bedtime: bedtime ? new Date(bedtime) : undefined,
        wakeTime: wakeTime ? new Date(wakeTime) : undefined,
        qualityRating,
        windDownActivity,
        reflection,
        date,
      }).returning();

      const log = result[0];
      app.logger.info({ logId: log.id, quality: log.qualityRating }, 'Sleep log created');

      return {
        id: log.id,
        bedtime: log.bedtime,
        wakeTime: log.wakeTime,
        qualityRating: log.qualityRating,
        windDownActivity: log.windDownActivity,
        reflection: log.reflection,
        date: log.date,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to create sleep log');
      throw error;
    }
  });

  // GET /api/sleep/stats - Get sleep statistics
  app.fastify.get('/api/sleep/stats', async (
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

    app.logger.info({ userId, period }, 'Fetching sleep statistics');

    try {
      const daysAgo = period === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      const startDateStr = startDate.toISOString().split('T')[0];

      const logs = await app.db.query.sleepLogs.findMany({
        where: and(
          eq(schema.sleepLogs.userId, userId),
          gte(schema.sleepLogs.date, startDateStr)
        ),
      });

      // Calculate average quality rating
      const qualityRatings = logs.filter(log => log.qualityRating !== null).map(log => log.qualityRating as number);
      const avgQuality = qualityRatings.length > 0
        ? qualityRatings.reduce((sum, rating) => sum + rating, 0) / qualityRatings.length
        : 0;

      // Calculate average duration
      const durations = logs.filter(log => log.bedtime && log.wakeTime).map(log => {
        const duration = (log.wakeTime!.getTime() - log.bedtime!.getTime()) / (1000 * 60 * 60);
        return duration;
      });
      const avgDuration = durations.length > 0
        ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
        : 0;

      // Extract patterns
      const windDownActivities = new Map<string, number>();
      logs.forEach(log => {
        if (log.windDownActivity) {
          windDownActivities.set(log.windDownActivity, (windDownActivities.get(log.windDownActivity) || 0) + 1);
        }
      });

      const patterns = {
        mostCommonWindDown: Array.from(windDownActivities.entries())
          .sort((a, b) => b[1] - a[1])[0]?.[0] || null,
        logCount: logs.length,
      };

      app.logger.info(
        { avgQuality, avgDuration },
        'Sleep statistics calculated'
      );

      return {
        avgQuality: Math.round(avgQuality * 10) / 10,
        avgDuration: Math.round(avgDuration * 10) / 10,
        patterns,
        period,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch sleep statistics');
      throw error;
    }
  });
}

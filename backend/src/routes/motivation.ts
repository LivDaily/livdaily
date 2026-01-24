import type { App } from '../index.js';
import { eq, desc, gte, lte } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerMotivationRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/motivation/current - Get current week's motivation
  app.fastify.get('/api/motivation/current', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({}, 'Fetching current motivation');

    try {
      // Find Monday of current week
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      const weekStartDate = monday.toISOString().split('T')[0];

      const motivation = await app.db.query.weeklyMotivation.findFirst({
        where: eq(schema.weeklyMotivation.weekStartDate, weekStartDate),
        orderBy: desc(schema.weeklyMotivation.createdAt),
      });

      if (!motivation) {
        return reply.status(404).send({ error: 'No motivation content available for this week' });
      }

      app.logger.info({ motivationId: motivation.id }, 'Current motivation retrieved');

      return {
        id: motivation.id,
        weekStartDate: motivation.weekStartDate,
        content: motivation.content,
        author: motivation.author,
        createdAt: motivation.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch current motivation');
      throw error;
    }
  });

  // GET /api/motivation/history - Get past motivation content
  app.fastify.get('/api/motivation/history', async (
    request: FastifyRequest<{
      Querystring: {
        limit?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const limit = request.query.limit ? parseInt(request.query.limit) : 10;

    app.logger.info({ limit }, 'Fetching motivation history');

    try {
      const history = await app.db.query.weeklyMotivation.findMany({
        orderBy: desc(schema.weeklyMotivation.weekStartDate),
      });

      const limited = history.slice(0, limit);
      app.logger.info({ count: limited.length }, 'Motivation history retrieved');

      return limited.map(m => ({
        id: m.id,
        weekStartDate: m.weekStartDate,
        content: m.content,
        author: m.author,
        createdAt: m.createdAt,
      }));
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch motivation history');
      throw error;
    }
  });
}

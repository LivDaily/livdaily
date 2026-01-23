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

  // POST /api/admin/motivation - Create motivation (admin only)
  app.fastify.post('/api/admin/motivation', async (
    request: FastifyRequest<{
      Body: {
        weekStartDate: string;
        content: string;
        author?: string;
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

    const { weekStartDate, content, author } = request.body;

    app.logger.info({ weekStartDate }, 'Creating motivation content (admin)');

    try {
      const result = await app.db.insert(schema.weeklyMotivation).values({
        weekStartDate,
        content,
        author,
      }).returning();

      const motivation = result[0];
      app.logger.info({ motivationId: motivation.id }, 'Motivation content created');

      return {
        id: motivation.id,
        weekStartDate: motivation.weekStartDate,
        content: motivation.content,
        author: motivation.author,
        createdAt: motivation.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, weekStartDate }, 'Failed to create motivation');
      throw error;
    }
  });

  // PUT /api/admin/motivation/:id - Update motivation (admin only)
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

    // Check admin role
    const user = session.user;
    if (user.role !== 'admin') {
      app.logger.warn({ userId: user.id }, 'Unauthorized admin access attempt');
      return reply.status(403).send({ error: 'Unauthorized' });
    }

    const { id } = request.params;
    const { content, author } = request.body;

    app.logger.info({ motivationId: id }, 'Updating motivation (admin)');

    try {
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
      app.logger.error({ err: error, motivationId: id }, 'Failed to update motivation');
      throw error;
    }
  });
}

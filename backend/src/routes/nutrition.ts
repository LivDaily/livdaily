import type { App } from '../index.js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerNutritionRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/nutrition/tasks - Get nutrition tasks for a date
  app.fastify.get('/api/nutrition/tasks', async (
    request: FastifyRequest<{
      Querystring: {
        date: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { date } = request.query;

    if (!date) {
      return reply.status(400).send({ error: 'date parameter is required' });
    }

    app.logger.info({ userId, date }, 'Fetching nutrition tasks');

    try {
      const tasks = await app.db.query.nutritionTasks.findMany({
        where: and(
          eq(schema.nutritionTasks.userId, userId),
          eq(schema.nutritionTasks.date, date)
        ),
      });

      app.logger.info({ count: tasks.length }, 'Nutrition tasks retrieved');

      return tasks.map(task => ({
        id: task.id,
        taskDescription: task.taskDescription,
        completed: task.completed,
        completedAt: task.completedAt,
        date: task.date,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId, date }, 'Failed to fetch nutrition tasks');
      throw error;
    }
  });

  // POST /api/nutrition/tasks - Create nutrition task
  app.fastify.post('/api/nutrition/tasks', async (
    request: FastifyRequest<{
      Body: {
        taskDescription: string;
        date: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { taskDescription, date } = request.body;

    app.logger.info({ userId, date }, 'Creating nutrition task');

    try {
      const result = await app.db.insert(schema.nutritionTasks).values({
        userId,
        taskDescription,
        date,
        completed: false,
      }).returning();

      const task = result[0];
      app.logger.info({ taskId: task.id }, 'Nutrition task created');

      return {
        id: task.id,
        taskDescription: task.taskDescription,
        completed: task.completed,
        completedAt: task.completedAt,
        date: task.date,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, date }, 'Failed to create nutrition task');
      throw error;
    }
  });

  // PUT /api/nutrition/tasks/:id - Update nutrition task
  app.fastify.put('/api/nutrition/tasks/:id', async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: {
        completed?: boolean;
        completedAt?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { id } = request.params;
    const { completed, completedAt } = request.body;

    app.logger.info({ userId, taskId: id, completed }, 'Updating nutrition task');

    try {
      // Verify ownership
      const existing = await app.db.query.nutritionTasks.findFirst({
        where: eq(schema.nutritionTasks.id, id),
      });

      if (!existing) {
        return reply.status(404).send({ error: 'Task not found' });
      }

      if (existing.userId !== userId) {
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      const updateData: any = {};
      if (completed !== undefined) updateData.completed = completed;
      if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : null;

      const result = await app.db.update(schema.nutritionTasks)
        .set(updateData)
        .where(eq(schema.nutritionTasks.id, id))
        .returning();

      const task = result[0];
      app.logger.info({ taskId: task.id, completed: task.completed }, 'Nutrition task updated');

      return {
        id: task.id,
        taskDescription: task.taskDescription,
        completed: task.completed,
        completedAt: task.completedAt,
        date: task.date,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, taskId: id }, 'Failed to update nutrition task');
      throw error;
    }
  });
}

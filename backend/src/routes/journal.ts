import type { App } from '../index.js';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerJournalRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/journal - Get journal entries
  app.fastify.get('/api/journal', async (
    request: FastifyRequest<{
      Querystring: {
        startDate?: string;
        endDate?: string;
        limit?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { startDate, endDate, limit } = request.query;

    app.logger.info({ userId, startDate, endDate }, 'Fetching journal entries');

    try {
      let whereClause = eq(schema.journalEntries.userId, userId);

      if (startDate && endDate) {
        whereClause = and(
          eq(schema.journalEntries.userId, userId),
          gte(schema.journalEntries.createdAt, new Date(startDate)),
          lte(schema.journalEntries.createdAt, new Date(endDate))
        );
      }

      let query = app.db.query.journalEntries.findMany({
        where: whereClause,
        orderBy: desc(schema.journalEntries.createdAt),
      });

      const entries = await query;
      const limitNum = limit ? parseInt(limit) : entries.length;

      app.logger.info({ count: entries.slice(0, limitNum).length }, 'Journal entries retrieved');

      return entries.slice(0, limitNum).map(e => ({
        id: e.id,
        content: e.content,
        mood: e.mood,
        energyLevel: e.energyLevel,
        promptUsed: e.promptUsed,
        rhythmPhase: e.rhythmPhase,
        createdAt: e.createdAt,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch journal entries');
      throw error;
    }
  });

  // POST /api/journal - Create journal entry
  app.fastify.post('/api/journal', async (
    request: FastifyRequest<{
      Body: {
        content: string;
        mood?: string;
        energyLevel?: string;
        promptUsed?: string;
        rhythmPhase?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { content, mood, energyLevel, promptUsed, rhythmPhase } = request.body;

    app.logger.info({ userId }, 'Creating journal entry');

    try {
      const result = await app.db.insert(schema.journalEntries).values({
        userId,
        content,
        mood,
        energyLevel,
        promptUsed,
        rhythmPhase,
      }).returning();

      const entry = result[0];
      app.logger.info({ entryId: entry.id }, 'Journal entry created');

      return {
        id: entry.id,
        content: entry.content,
        mood: entry.mood,
        energyLevel: entry.energyLevel,
        promptUsed: entry.promptUsed,
        rhythmPhase: entry.rhythmPhase,
        createdAt: entry.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to create journal entry');
      throw error;
    }
  });

  // DELETE /api/journal/:id - Delete journal entry
  app.fastify.delete('/api/journal/:id', async (
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ): Promise<{ success: boolean } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { id } = request.params;

    app.logger.info({ userId, entryId: id }, 'Deleting journal entry');

    try {
      // Verify ownership
      const existing = await app.db.query.journalEntries.findFirst({
        where: eq(schema.journalEntries.id, id),
      });

      if (!existing) {
        return reply.status(404).send({ error: 'Entry not found' });
      }

      if (existing.userId !== userId) {
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      await app.db.delete(schema.journalEntries)
        .where(eq(schema.journalEntries.id, id));

      app.logger.info({ entryId: id }, 'Journal entry deleted');

      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, userId, entryId: id }, 'Failed to delete journal entry');
      throw error;
    }
  });
}

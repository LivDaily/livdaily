import type { App } from '../index.js';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/liqdaily-schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Helper to extract user ID from token (for anonymous users)
const getUserId = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  return authHeader.replace('Bearer ', '');
};

export function registerV1ModuleRoutes(app: App) {
  // =========================
  // Journal Endpoints
  // =========================
  app.fastify.get('/v1/journal', async (
    request: FastifyRequest<{
      Querystring: {
        startDate?: string;
        endDate?: string;
        limit?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    app.logger.info({ userId }, 'Fetching journal entries');

    try {
      let query = app.db.query.journalEntries.findMany({
        where: eq(schema.journalEntries.userId, userId as any),
        orderBy: desc(schema.journalEntries.createdAt),
      });

      const entries = await query;
      const limitNum = request.query.limit ? parseInt(request.query.limit) : entries.length;

      app.logger.info({ count: entries.length }, 'Journal entries retrieved');

      return entries.slice(0, limitNum).map(e => ({
        id: e.id,
        title: e.title,
        content: e.content,
        mood: e.mood,
        tags: e.tags,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch journal entries');
      return []; // Return empty array on error
    }
  });

  app.fastify.post('/v1/journal', async (
    request: FastifyRequest<{
      Body: {
        title?: string;
        content: string;
        mood?: string;
        tags?: string[];
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { title, content, mood, tags } = request.body;

    app.logger.info({ userId }, 'Creating journal entry');

    try {
      const result = await app.db.insert(schema.journalEntries).values({
        userId: userId as any,
        title,
        content,
        mood,
        tags,
      }).returning();

      const entry = result[0];
      app.logger.info({ entryId: entry.id }, 'Journal entry created');

      return {
        id: entry.id,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to create journal entry');
      throw error;
    }
  });

  // =========================
  // Mindfulness Content Endpoints
  // =========================
  app.fastify.get('/v1/mindfulness/content', async (
    request: FastifyRequest<{
      Querystring: {
        category?: string;
        limit?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    app.logger.info({ userId }, 'Fetching mindfulness content');

    try {
      let items = await app.db.query.contentItems.findMany({
        where: eq(schema.contentItems.userId, userId as any),
      });

      if (request.query.category) {
        items = items.filter(i => i.category === request.query.category);
      }

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;

      return items.slice(0, limitNum).map(i => ({
        id: i.id,
        title: i.title,
        content: i.content,
        category: i.category,
        duration: i.duration,
        isAiGenerated: i.isAiGenerated,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch mindfulness content');
      return [];
    }
  });

  app.fastify.post('/v1/mindfulness/content', async (
    request: FastifyRequest<{
      Body: {
        title: string;
        content?: string;
        category?: string;
        duration?: number;
        payload?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { title, content, category, duration, payload } = request.body;

    app.logger.info({ userId }, 'Creating mindfulness content');

    try {
      const result = await app.db.insert(schema.contentItems).values({
        userId: userId as any,
        module: 'mindfulness',
        title,
        content,
        category,
        duration,
        payload,
        isAiGenerated: false,
      }).returning();

      const item = result[0];
      app.logger.info({ itemId: item.id }, 'Mindfulness content created');

      return {
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        duration: item.duration,
        isAiGenerated: item.isAiGenerated,
        createdAt: item.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to create mindfulness content');
      throw error;
    }
  });

  // =========================
  // Nutrition Tasks Endpoints
  // =========================
  app.fastify.get('/v1/nutrition/tasks', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    app.logger.info({ userId }, 'Fetching nutrition tasks');

    try {
      const items = await app.db.query.contentItems.findMany({
        where: eq(schema.contentItems.userId, userId as any),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      const nutritionItems = items.filter(i => i.module === 'nutrition');

      return nutritionItems.slice(0, limitNum).map(i => ({
        id: i.id,
        title: i.title,
        content: i.content,
        payload: i.payload,
        isAiGenerated: i.isAiGenerated,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch nutrition tasks');
      return [];
    }
  });

  app.fastify.post('/v1/nutrition/tasks', async (
    request: FastifyRequest<{
      Body: {
        title: string;
        content?: string;
        payload?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { title, content, payload } = request.body;

    app.logger.info({ userId }, 'Creating nutrition task');

    try {
      const result = await app.db.insert(schema.contentItems).values({
        userId: userId as any,
        module: 'nutrition',
        title,
        content,
        payload,
        isAiGenerated: false,
      }).returning();

      const item = result[0];
      app.logger.info({ itemId: item.id }, 'Nutrition task created');

      return {
        id: item.id,
        title: item.title,
        content: item.content,
        payload: item.payload,
        createdAt: item.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to create nutrition task');
      throw error;
    }
  });

  // =========================
  // Movement Endpoints
  // =========================
  app.fastify.get('/v1/movement', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    try {
      const items = await app.db.query.contentItems.findMany({
        where: eq(schema.contentItems.userId, userId as any),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      const movementItems = items.filter(i => i.module === 'movement');

      return movementItems.slice(0, limitNum).map(i => ({
        id: i.id,
        title: i.title,
        content: i.content,
        duration: i.duration,
        payload: i.payload,
        isAiGenerated: i.isAiGenerated,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      return [];
    }
  });

  app.fastify.post('/v1/movement', async (
    request: FastifyRequest<{
      Body: {
        title: string;
        content?: string;
        duration?: number;
        payload?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { title, content, duration, payload } = request.body;

    try {
      const result = await app.db.insert(schema.contentItems).values({
        userId: userId as any,
        module: 'movement',
        title,
        content,
        duration,
        payload,
        isAiGenerated: false,
      }).returning();

      const item = result[0];
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        duration: item.duration,
        payload: item.payload,
        createdAt: item.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to create movement');
      throw error;
    }
  });

  // =========================
  // Sleep Endpoints
  // =========================
  app.fastify.get('/v1/sleep', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    try {
      const items = await app.db.query.contentItems.findMany({
        where: eq(schema.contentItems.userId, userId as any),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      return items.filter(i => i.module === 'sleep').slice(0, limitNum).map(i => ({
        id: i.id,
        title: i.title,
        content: i.content,
        duration: i.duration,
        payload: i.payload,
        isAiGenerated: i.isAiGenerated,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      return [];
    }
  });

  app.fastify.post('/v1/sleep', async (
    request: FastifyRequest<{
      Body: {
        title: string;
        content?: string;
        duration?: number;
        payload?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { title, content, duration, payload } = request.body;

    try {
      const result = await app.db.insert(schema.contentItems).values({
        userId: userId as any,
        module: 'sleep',
        title,
        content,
        duration,
        payload,
        isAiGenerated: false,
      }).returning();

      const item = result[0];
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        duration: item.duration,
        payload: item.payload,
        createdAt: item.createdAt,
      };
    } catch (error) {
      throw error;
    }
  });

  // =========================
  // Grounding Endpoints
  // =========================
  app.fastify.get('/v1/grounding', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    try {
      const items = await app.db.query.contentItems.findMany({
        where: eq(schema.contentItems.userId, userId as any),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      return items.filter(i => i.module === 'grounding').slice(0, limitNum).map(i => ({
        id: i.id,
        title: i.title,
        content: i.content,
        duration: i.duration,
        payload: i.payload,
        isAiGenerated: i.isAiGenerated,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      return [];
    }
  });

  app.fastify.post('/v1/grounding', async (
    request: FastifyRequest<{
      Body: {
        title: string;
        content?: string;
        duration?: number;
        payload?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { title, content, duration, payload } = request.body;

    try {
      const result = await app.db.insert(schema.contentItems).values({
        userId: userId as any,
        module: 'grounding',
        title,
        content,
        duration,
        payload,
        isAiGenerated: false,
      }).returning();

      const item = result[0];
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        duration: item.duration,
        payload: item.payload,
        createdAt: item.createdAt,
      };
    } catch (error) {
      throw error;
    }
  });

  // =========================
  // Motivation Endpoints
  // =========================
  app.fastify.get('/v1/motivation/current', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    try {
      const items = await app.db.query.contentItems.findMany({
        where: eq(schema.contentItems.userId, userId as any),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      return items.filter(i => i.module === 'motivation').slice(0, limitNum).map(i => ({
        id: i.id,
        title: i.title,
        content: i.content,
        payload: i.payload,
        isAiGenerated: i.isAiGenerated,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      return [];
    }
  });

  app.fastify.post('/v1/motivation/current', async (
    request: FastifyRequest<{
      Body: {
        title: string;
        content?: string;
        payload?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { title, content, payload } = request.body;

    try {
      const result = await app.db.insert(schema.contentItems).values({
        userId: userId as any,
        module: 'motivation',
        title,
        content,
        payload,
        isAiGenerated: false,
      }).returning();

      const item = result[0];
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        payload: item.payload,
        createdAt: item.createdAt,
      };
    } catch (error) {
      throw error;
    }
  });

  // =========================
  // Check-in Endpoints
  // =========================
  app.fastify.get('/v1/checkin', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    try {
      const items = await app.db.query.checkins.findMany({
        where: eq(schema.checkins.userId, userId as any),
        orderBy: desc(schema.checkins.createdAt),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      return items.slice(0, limitNum).map(i => ({
        id: i.id,
        mood: i.mood,
        energy: i.energy,
        notes: i.notes,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      return [];
    }
  });

  app.fastify.post('/v1/checkin', async (
    request: FastifyRequest<{
      Body: {
        mood?: string;
        energy?: number;
        notes?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { mood, energy, notes } = request.body;

    try {
      const result = await app.db.insert(schema.checkins).values({
        userId: userId as any,
        mood,
        energy,
        notes,
      }).returning();

      const item = result[0];
      return {
        id: item.id,
        mood: item.mood,
        energy: item.energy,
        notes: item.notes,
        createdAt: item.createdAt,
      };
    } catch (error) {
      throw error;
    }
  });

  // =========================
  // Habits Endpoints
  // =========================
  app.fastify.get('/v1/habits', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    try {
      const items = await app.db.query.habits.findMany({
        where: eq(schema.habits.userId, userId as any),
        orderBy: desc(schema.habits.createdAt),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      return items.slice(0, limitNum).map(i => ({
        id: i.id,
        name: i.name,
        description: i.description,
        frequency: i.frequency,
        completedDates: i.completedDates,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));
    } catch (error) {
      return [];
    }
  });

  app.fastify.post('/v1/habits', async (
    request: FastifyRequest<{
      Body: {
        name: string;
        description?: string;
        frequency: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { name, description, frequency } = request.body;

    try {
      const result = await app.db.insert(schema.habits).values({
        userId: userId as any,
        name,
        description,
        frequency,
        completedDates: [],
      }).returning();

      const item = result[0];
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        frequency: item.frequency,
        completedDates: item.completedDates,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  });

  // =========================
  // Routines Endpoints
  // =========================
  app.fastify.get('/v1/routines', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    try {
      const items = await app.db.query.routines.findMany({
        where: eq(schema.routines.userId, userId as any),
        orderBy: desc(schema.routines.createdAt),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      return items.slice(0, limitNum).map(i => ({
        id: i.id,
        name: i.name,
        steps: i.steps,
        timeOfDay: i.timeOfDay,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));
    } catch (error) {
      return [];
    }
  });

  app.fastify.post('/v1/routines', async (
    request: FastifyRequest<{
      Body: {
        name: string;
        steps?: any[];
        timeOfDay?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { name, steps, timeOfDay } = request.body;

    try {
      const result = await app.db.insert(schema.routines).values({
        userId: userId as any,
        name,
        steps: steps || [],
        timeOfDay,
      }).returning();

      const item = result[0];
      return {
        id: item.id,
        name: item.name,
        steps: item.steps,
        timeOfDay: item.timeOfDay,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  });

  // =========================
  // Prompts Endpoints
  // =========================
  app.fastify.get('/v1/prompts', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    try {
      const items = await app.db.query.prompts.findMany({
        where: eq(schema.prompts.userId, userId as any),
        orderBy: desc(schema.prompts.createdAt),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      return items.slice(0, limitNum).map(i => ({
        id: i.id,
        text: i.text,
        category: i.category,
        isAiGenerated: i.isAiGenerated,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      return [];
    }
  });

  app.fastify.post('/v1/prompts', async (
    request: FastifyRequest<{
      Body: {
        text: string;
        category?: string;
        isAiGenerated?: boolean;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { text, category, isAiGenerated } = request.body;

    try {
      const result = await app.db.insert(schema.prompts).values({
        userId: userId as any,
        text,
        category,
        isAiGenerated: isAiGenerated || false,
      }).returning();

      const item = result[0];
      return {
        id: item.id,
        text: item.text,
        category: item.category,
        isAiGenerated: item.isAiGenerated,
        createdAt: item.createdAt,
      };
    } catch (error) {
      throw error;
    }
  });

  // =========================
  // Reflections Endpoints
  // =========================
  app.fastify.get('/v1/reflections', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    try {
      const items = await app.db.query.reflections.findMany({
        where: eq(schema.reflections.userId, userId as any),
        orderBy: desc(schema.reflections.createdAt),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      return items.slice(0, limitNum).map(i => ({
        id: i.id,
        promptId: i.promptId,
        content: i.content,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));
    } catch (error) {
      return [];
    }
  });

  app.fastify.post('/v1/reflections', async (
    request: FastifyRequest<{
      Body: {
        promptId?: string;
        content: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { promptId, content } = request.body;

    try {
      const result = await app.db.insert(schema.reflections).values({
        userId: userId as any,
        promptId: promptId as any,
        content,
      }).returning();

      const item = result[0];
      return {
        id: item.id,
        promptId: item.promptId,
        content: item.content,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  });

  // =========================
  // Breathwork Endpoints
  // =========================
  app.fastify.get('/v1/breathwork', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    try {
      const items = await app.db.query.contentItems.findMany({
        where: eq(schema.contentItems.userId, userId as any),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      return items.filter(i => i.module === 'breathwork').slice(0, limitNum).map(i => ({
        id: i.id,
        title: i.title,
        content: i.content,
        duration: i.duration,
        payload: i.payload,
        isAiGenerated: i.isAiGenerated,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      return [];
    }
  });

  app.fastify.post('/v1/breathwork', async (
    request: FastifyRequest<{
      Body: {
        title: string;
        content?: string;
        duration?: number;
        payload?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { title, content, duration, payload } = request.body;

    try {
      const result = await app.db.insert(schema.contentItems).values({
        userId: userId as any,
        module: 'breathwork',
        title,
        content,
        duration,
        payload,
        isAiGenerated: false,
      }).returning();

      const item = result[0];
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        duration: item.duration,
        payload: item.payload,
        createdAt: item.createdAt,
      };
    } catch (error) {
      throw error;
    }
  });

  // =========================
  // Focus Endpoints
  // =========================
  app.fastify.get('/v1/focus', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    try {
      const items = await app.db.query.contentItems.findMany({
        where: eq(schema.contentItems.userId, userId as any),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      return items.filter(i => i.module === 'focus').slice(0, limitNum).map(i => ({
        id: i.id,
        title: i.title,
        content: i.content,
        duration: i.duration,
        payload: i.payload,
        isAiGenerated: i.isAiGenerated,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      return [];
    }
  });

  app.fastify.post('/v1/focus', async (
    request: FastifyRequest<{
      Body: {
        title: string;
        content?: string;
        duration?: number;
        payload?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { title, content, duration, payload } = request.body;

    try {
      const result = await app.db.insert(schema.contentItems).values({
        userId: userId as any,
        module: 'focus',
        title,
        content,
        duration,
        payload,
        isAiGenerated: false,
      }).returning();

      const item = result[0];
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        duration: item.duration,
        payload: item.payload,
        createdAt: item.createdAt,
      };
    } catch (error) {
      throw error;
    }
  });

  // =========================
  // Calm Endpoints
  // =========================
  app.fastify.get('/v1/calm', async (
    request: FastifyRequest<{
      Querystring: { limit?: string };
    }>,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    try {
      const items = await app.db.query.contentItems.findMany({
        where: eq(schema.contentItems.userId, userId as any),
      });

      const limitNum = request.query.limit ? parseInt(request.query.limit) : items.length;
      return items.filter(i => i.module === 'calm').slice(0, limitNum).map(i => ({
        id: i.id,
        title: i.title,
        content: i.content,
        duration: i.duration,
        payload: i.payload,
        isAiGenerated: i.isAiGenerated,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      return [];
    }
  });

  app.fastify.post('/v1/calm', async (
    request: FastifyRequest<{
      Body: {
        title: string;
        content?: string;
        duration?: number;
        payload?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { title, content, duration, payload } = request.body;

    try {
      const result = await app.db.insert(schema.contentItems).values({
        userId: userId as any,
        module: 'calm',
        title,
        content,
        duration,
        payload,
        isAiGenerated: false,
      }).returning();

      const item = result[0];
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        duration: item.duration,
        payload: item.payload,
        createdAt: item.createdAt,
      };
    } catch (error) {
      throw error;
    }
  });
}

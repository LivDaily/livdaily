import type { App } from '../index.js';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerMindfulnessRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Helper function to check subscription status
  const checkSubscription = async (userId: string, contentType: 'free' | 'premium') => {
    const subscription = await app.db.query.userSubscriptions.findFirst({
      where: eq(schema.userSubscriptions.userId, userId),
    });

    if (!subscription) {
      return false;
    }

    if (contentType === 'free') {
      return subscription.status === 'active';
    }

    // Premium requires active subscription
    if (subscription.subscriptionType === 'premium' && subscription.status === 'active') {
      return true;
    }

    // Free tier users can access free content
    return subscription.subscriptionType === 'free' && subscription.status === 'active';
  };

  // GET /api/mindfulness/content - Get mindfulness content
  app.fastify.get('/api/mindfulness/content', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    app.logger.info({ userId }, 'Fetching mindfulness content');

    try {
      const subscription = await app.db.query.userSubscriptions.findFirst({
        where: eq(schema.userSubscriptions.userId, userId),
      });

      // Default to free tier if no subscription
      const isPremium = subscription?.subscriptionType === 'premium' && subscription.status === 'active';

      // Get all active content for premium users, limited for free users
      const content = await app.db.query.mindfulnessContent.findMany({
        where: eq(schema.mindfulnessContent.isActive, true),
      });

      app.logger.info({ count: content.length, isPremium }, 'Mindfulness content retrieved');

      return content.map(c => ({
        id: c.id,
        title: c.title,
        content: isPremium ? c.content : c.content.substring(0, 100) + '...', // Truncate for free users
        contentType: c.contentType,
        category: c.category,
        duration: c.duration,
        aiGenerated: c.aiGenerated,
        isActive: c.isActive,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch mindfulness content');
      throw error;
    }
  });

  // GET /api/mindfulness/content/:id - Get single mindfulness content
  app.fastify.get('/api/mindfulness/content/:id', async (
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { id } = request.params;

    app.logger.info({ userId, contentId: id }, 'Fetching mindfulness content');

    try {
      const content = await app.db.query.mindfulnessContent.findFirst({
        where: eq(schema.mindfulnessContent.id, id),
      });

      if (!content) {
        return reply.status(404).send({ error: 'Content not found' });
      }

      if (!content.isActive) {
        return reply.status(404).send({ error: 'Content not available' });
      }

      const subscription = await app.db.query.userSubscriptions.findFirst({
        where: eq(schema.userSubscriptions.userId, userId),
      });

      const isPremium = subscription?.subscriptionType === 'premium' && subscription.status === 'active';

      app.logger.info({ contentId: id }, 'Mindfulness content retrieved');

      return {
        id: content.id,
        title: content.title,
        content: content.content,
        contentType: content.contentType,
        category: content.category,
        duration: content.duration,
        aiGenerated: content.aiGenerated,
        isActive: content.isActive,
        createdAt: content.createdAt,
        updatedAt: content.updatedAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, contentId: id }, 'Failed to fetch mindfulness content');
      throw error;
    }
  });

  // POST /api/mindfulness/journal - Create mindfulness journal entry
  app.fastify.post('/api/mindfulness/journal', async (
    request: FastifyRequest<{
      Body: {
        mindfulnessContentId?: string;
        content: string;
        mood?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { mindfulnessContentId, content, mood } = request.body;

    app.logger.info({ userId }, 'Creating mindfulness journal entry');

    try {
      const result = await app.db.insert(schema.mindfulnessJournalEntries).values({
        userId,
        mindfulnessContentId: mindfulnessContentId as any,
        content,
        mood,
      }).returning();

      const entry = result[0];
      app.logger.info({ entryId: entry.id }, 'Mindfulness journal entry created');

      return {
        id: entry.id,
        mindfulnessContentId: entry.mindfulnessContentId,
        content: entry.content,
        mood: entry.mood,
        createdAt: entry.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to create mindfulness journal entry');
      throw error;
    }
  });

  // GET /api/mindfulness/journal - Get user's mindfulness journal entries
  app.fastify.get('/api/mindfulness/journal', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    app.logger.info({ userId }, 'Fetching mindfulness journal entries');

    try {
      const entries = await app.db.query.mindfulnessJournalEntries.findMany({
        where: eq(schema.mindfulnessJournalEntries.userId, userId),
        orderBy: desc(schema.mindfulnessJournalEntries.createdAt),
      });

      app.logger.info({ count: entries.length }, 'Mindfulness journal entries retrieved');

      return entries.map(e => ({
        id: e.id,
        mindfulnessContentId: e.mindfulnessContentId,
        content: e.content,
        mood: e.mood,
        createdAt: e.createdAt,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch mindfulness journal entries');
      throw error;
    }
  });

  // GET /api/mindfulness/subscription - Get user's subscription status
  app.fastify.get('/api/mindfulness/subscription', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    app.logger.info({ userId }, 'Fetching subscription status');

    try {
      let subscription = await app.db.query.userSubscriptions.findFirst({
        where: eq(schema.userSubscriptions.userId, userId),
      });

      // Create default free subscription if not exists
      if (!subscription) {
        app.logger.info({ userId }, 'Creating default free subscription');
        const result = await app.db.insert(schema.userSubscriptions).values({
          userId,
          subscriptionType: 'free',
          status: 'active',
        }).returning();
        subscription = result[0];
      }

      app.logger.info({ subscriptionType: subscription.subscriptionType }, 'Subscription retrieved');

      return {
        subscriptionType: subscription.subscriptionType,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch subscription status');
      throw error;
    }
  });
}

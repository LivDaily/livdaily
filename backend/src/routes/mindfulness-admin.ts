import type { App } from '../index.js';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import * as authSchema from '../db/auth-schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { generateText, generateObject } from 'ai';
import { gateway } from '@specific-dev/framework';
import { z } from 'zod';

export function registerMindfulnessAdminRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Helper function to check admin role
  const checkAdmin = (user: any) => user?.role === 'admin';

  // POST /api/admin/mindfulness/content - Create mindfulness content
  app.fastify.post('/api/admin/mindfulness/content', async (
    request: FastifyRequest<{
      Body: {
        title: string;
        content: string;
        contentType: 'article' | 'exercise' | 'meditation';
        category?: string;
        duration?: number;
        aiGenerated?: boolean;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { title, content, contentType, category, duration, aiGenerated } = request.body;

    app.logger.info({ userId, title, contentType }, 'Admin creating mindfulness content');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const result = await app.db.insert(schema.mindfulnessContent).values({
        title,
        content,
        contentType,
        category,
        duration,
        aiGenerated: aiGenerated || false,
        isActive: true,
      }).returning();

      const contentItem = result[0];
      app.logger.info({ contentId: contentItem.id }, 'Mindfulness content created');

      return {
        id: contentItem.id,
        title: contentItem.title,
        content: contentItem.content,
        contentType: contentItem.contentType,
        category: contentItem.category,
        duration: contentItem.duration,
        aiGenerated: contentItem.aiGenerated,
        isActive: contentItem.isActive,
        createdAt: contentItem.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, title }, 'Failed to create mindfulness content');
      throw error;
    }
  });

  // PUT /api/admin/mindfulness/content/:id - Update mindfulness content
  app.fastify.put('/api/admin/mindfulness/content/:id', async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: {
        title?: string;
        content?: string;
        contentType?: 'article' | 'exercise' | 'meditation';
        category?: string;
        duration?: number;
        isActive?: boolean;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { id } = request.params;
    const { title, content, contentType, category, duration, isActive } = request.body;

    app.logger.info({ userId, contentId: id }, 'Admin updating mindfulness content');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (contentType !== undefined) updateData.contentType = contentType;
      if (category !== undefined) updateData.category = category;
      if (duration !== undefined) updateData.duration = duration;
      if (isActive !== undefined) updateData.isActive = isActive;
      updateData.updatedAt = new Date();

      const result = await app.db.update(schema.mindfulnessContent)
        .set(updateData)
        .where(eq(schema.mindfulnessContent.id, id))
        .returning();

      if (result.length === 0) {
        return reply.status(404).send({ error: 'Content not found' });
      }

      const contentItem = result[0];
      app.logger.info({ contentId: contentItem.id }, 'Mindfulness content updated');

      return {
        id: contentItem.id,
        title: contentItem.title,
        content: contentItem.content,
        contentType: contentItem.contentType,
        category: contentItem.category,
        duration: contentItem.duration,
        aiGenerated: contentItem.aiGenerated,
        isActive: contentItem.isActive,
        createdAt: contentItem.createdAt,
        updatedAt: contentItem.updatedAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, contentId: id }, 'Failed to update mindfulness content');
      throw error;
    }
  });

  // DELETE /api/admin/mindfulness/content/:id - Delete mindfulness content
  app.fastify.delete('/api/admin/mindfulness/content/:id', async (
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ): Promise<{ success: boolean } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { id } = request.params;

    app.logger.info({ userId, contentId: id }, 'Admin deleting mindfulness content');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const content = await app.db.query.mindfulnessContent.findFirst({
        where: eq(schema.mindfulnessContent.id, id),
      });

      if (!content) {
        return reply.status(404).send({ error: 'Content not found' });
      }

      await app.db.delete(schema.mindfulnessContent)
        .where(eq(schema.mindfulnessContent.id, id));

      app.logger.info({ contentId: id }, 'Mindfulness content deleted');

      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, userId, contentId: id }, 'Failed to delete mindfulness content');
      throw error;
    }
  });

  // POST /api/admin/mindfulness/generate - Generate mindfulness content with AI
  app.fastify.post('/api/admin/mindfulness/generate', async (
    request: FastifyRequest<{
      Body: {
        contentType: 'article' | 'exercise' | 'meditation';
        category: string;
        duration?: number;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    const { contentType, category, duration } = request.body;

    app.logger.info({ userId, contentType, category, duration }, 'Admin generating mindfulness content');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      // Generate title and content using GPT-5.2
      const contentSchema = z.object({
        title: z.string().describe('A compelling title for the mindfulness content'),
        content: z.string().describe('Detailed mindfulness content appropriate for the type'),
      });

      const prompt = `Generate a mindfulness ${contentType} about "${category}".
${duration ? `Duration: ${duration} minutes.` : ''}
Create engaging, calming content that helps users practice mindfulness.
Format the content clearly with sections if appropriate.`;

      const { object } = await generateObject({
        model: gateway('openai/gpt-5.2'),
        schema: contentSchema,
        schemaName: 'MindfulnessContent',
        schemaDescription: 'Generate mindfulness content',
        prompt,
        system: 'You are an expert mindfulness instructor creating high-quality mindfulness content. Be warm, supportive, and practical.',
      });

      // Save generated content to database
      const result = await app.db.insert(schema.mindfulnessContent).values({
        title: object.title,
        content: object.content,
        contentType,
        category,
        duration,
        aiGenerated: true,
        isActive: true,
      }).returning();

      const contentItem = result[0];
      app.logger.info(
        { contentId: contentItem.id, title: object.title },
        'Mindfulness content generated and saved'
      );

      return {
        id: contentItem.id,
        title: contentItem.title,
        content: contentItem.content,
        contentType: contentItem.contentType,
        category: contentItem.category,
        duration: contentItem.duration,
        aiGenerated: contentItem.aiGenerated,
        isActive: contentItem.isActive,
        createdAt: contentItem.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, contentType, category }, 'Failed to generate mindfulness content');
      throw error;
    }
  });

  // POST /api/admin/subscription/grant - Grant subscription to user
  app.fastify.post('/api/admin/subscription/grant', async (
    request: FastifyRequest<{
      Body: {
        userId: string;
        subscriptionType: 'free' | 'premium';
        durationDays: number;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const adminId = session.user.id;
    const { userId, subscriptionType, durationDays } = request.body;

    app.logger.info(
      { adminId, targetUserId: userId, subscriptionType, durationDays },
      'Admin granting subscription'
    );

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ adminId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      // Check if user exists
      const targetUser = await app.db.query.user.findFirst({
        where: eq(authSchema.user.id, userId),
      });

      if (!targetUser) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // Check if user already has a subscription
      let subscription = await app.db.query.userSubscriptions.findFirst({
        where: eq(schema.userSubscriptions.userId, userId),
      });

      const now = new Date();
      const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      if (subscription) {
        // Update existing subscription
        const result = await app.db.update(schema.userSubscriptions)
          .set({
            subscriptionType,
            status: 'active',
            startDate: now,
            endDate,
          })
          .where(eq(schema.userSubscriptions.userId, userId))
          .returning();

        subscription = result[0];
      } else {
        // Create new subscription
        const result = await app.db.insert(schema.userSubscriptions).values({
          userId,
          subscriptionType,
          status: 'active',
          startDate: now,
          endDate,
        }).returning();

        subscription = result[0];
      }

      app.logger.info(
        { subscriptionId: subscription.id, subscriptionType },
        'Subscription granted'
      );

      return {
        id: subscription.id,
        userId: subscription.userId,
        subscriptionType: subscription.subscriptionType,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        createdAt: subscription.createdAt,
      };
    } catch (error) {
      app.logger.error(
        { err: error, adminId, targetUserId: userId },
        'Failed to grant subscription'
      );
      throw error;
    }
  });

  // GET /api/admin/subscriptions - Get all subscriptions
  app.fastify.get('/api/admin/subscriptions', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any[] | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;
    app.logger.info({ userId }, 'Admin fetching all subscriptions');

    try {
      if (!checkAdmin(session.user)) {
        app.logger.warn({ userId }, 'Unauthorized admin access attempt');
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const subscriptions = await app.db.query.userSubscriptions.findMany({
        orderBy: desc(schema.userSubscriptions.createdAt),
      });

      app.logger.info({ count: subscriptions.length }, 'Subscriptions retrieved');

      // Fetch user details for each subscription
      const subscriptionsWithUsers = await Promise.all(
        subscriptions.map(async (sub) => {
          const user = await app.db.query.user.findFirst({
            where: eq(authSchema.user.id, sub.userId),
          });

          return {
            id: sub.id,
            userId: sub.userId,
            userName: user?.name,
            userEmail: user?.email,
            subscriptionType: sub.subscriptionType,
            status: sub.status,
            startDate: sub.startDate,
            endDate: sub.endDate,
            createdAt: sub.createdAt,
          };
        })
      );

      return subscriptionsWithUsers;
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch subscriptions');
      throw error;
    }
  });
}

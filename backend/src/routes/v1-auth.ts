import type { App } from '../index.js';
import * as schema from '../db/liqdaily-schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerV1AuthRoutes(app: App) {
  // POST /v1/auth/anonymous - Create anonymous user session
  app.fastify.post('/v1/auth/anonymous', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<{ userId: string; token?: string } | void> => {
    app.logger.info({}, 'Creating anonymous user session');

    try {
      // Create new anonymous user
      const result = await app.db.insert(schema.users).values({
        isAnonymous: true,
      }).returning();

      const user = result[0];
      app.logger.info({ userId: user.id }, 'Anonymous user created');

      // Return user ID that will be used as token/session identifier
      return {
        userId: user.id,
        token: user.id, // Use userId as the token for simplicity
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to create anonymous user');
      throw error;
    }
  });
}

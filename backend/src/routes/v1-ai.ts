import type { App } from '../index.js';
import * as schema from '../db/liqdaily-schema.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { generateText, generateObject } from 'ai';
import { gateway } from '@specific-dev/framework';
import { z } from 'zod';

// Helper to extract user ID from token
const getUserId = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  return authHeader.replace('Bearer ', '');
};

export function registerV1AiRoutes(app: App) {
  // POST /v1/ai/generate - Generate content with AI
  app.fastify.post('/v1/ai/generate', async (
    request: FastifyRequest<{
      Body: {
        module: string; // mindfulness, breathwork, movement, nutrition, focus, calm, sleep, grounding, motivation
        goal: string;
        timeAvailable?: number;
        tone?: string;
        constraints?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<any | void> => {
    const userId = getUserId(request.headers.authorization);
    if (!userId) {
      return reply.status(401).send({ error: 'Missing authorization token' });
    }

    const { module, goal, timeAvailable, tone, constraints } = request.body;

    app.logger.info(
      { userId, module, goal, timeAvailable },
      'Generating AI content'
    );

    try {
      // Generate title and content using GPT-5.2
      const contentSchema = z.object({
        title: z.string().describe('A compelling title for the content'),
        content: z.string().describe('Detailed content appropriate for the module and goal'),
        category: z.string().optional().describe('Content category'),
        duration: z.number().optional().describe('Duration in minutes'),
      });

      const systemPrompt = buildSystemPrompt(module, tone);
      const userPrompt = buildUserPrompt(module, goal, timeAvailable, constraints);

      const { object } = await generateObject({
        model: gateway('openai/gpt-5.2'),
        schema: contentSchema,
        schemaName: 'GeneratedContent',
        schemaDescription: `Generate ${module} content`,
        prompt: userPrompt,
        system: systemPrompt,
      });

      // Save generated content to database
      const result = await app.db.insert(schema.contentItems).values({
        userId: userId as any,
        module,
        title: object.title,
        content: object.content,
        category: object.category,
        duration: object.duration,
        payload: constraints,
        isAiGenerated: true,
      }).returning();

      const item = result[0];
      app.logger.info(
        { itemId: item.id, title: object.title },
        'AI content generated and saved'
      );

      return {
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        duration: item.duration,
        payload: item.payload,
        aiGenerated: item.isAiGenerated,
        createdAt: item.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId, module, goal }, 'Failed to generate AI content');
      throw error;
    }
  });
}

// Helper functions for prompt building
function buildSystemPrompt(module: string, tone?: string): string {
  const basePrompt = `You are an expert wellness coach creating high-quality ${module} content.`;
  const tonePrompt = tone ? `Use a ${tone} tone.` : 'Be warm, supportive, and practical.';

  const moduleSpecificPrompts: Record<string, string> = {
    mindfulness: 'Create calming, focused mindfulness content that helps users be present.',
    breathwork: 'Create guided breathing exercises with clear step-by-step instructions.',
    movement: 'Create movement and exercise suggestions that are accessible and motivating.',
    nutrition: 'Create nutrition tips, meal ideas, and healthy eating guidance.',
    focus: 'Create focus techniques, concentration exercises, and productivity tips.',
    calm: 'Create soothing, anxiety-reducing content that promotes relaxation.',
    sleep: 'Create sleep-promoting content, wind-down routines, and rest guidance.',
    grounding: 'Create grounding exercises that connect users to the present moment.',
    motivation: 'Create inspiring, motivational content that uplifts and encourages action.',
  };

  const modulePrompt = moduleSpecificPrompts[module] || 'Create wellness content.';
  return `${basePrompt} ${modulePrompt} ${tonePrompt}`;
}

function buildUserPrompt(
  module: string,
  goal: string,
  timeAvailable?: number,
  constraints?: Record<string, any>
): string {
  let prompt = `Create ${module} content to help with: ${goal}`;

  if (timeAvailable) {
    prompt += `\nTime available: ${timeAvailable} minutes.`;
  }

  if (constraints) {
    prompt += `\nConstraints: ${JSON.stringify(constraints)}`;
  }

  prompt += '\nMake the content practical, actionable, and easy to follow.';

  return prompt;
}

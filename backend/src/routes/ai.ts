import type { App } from '../index.js';
import { gateway } from '@specific-dev/framework';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function registerAiRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // POST /api/ai/journal-prompt - Generate personalized journaling prompt
  app.fastify.post('/api/ai/journal-prompt', async (
    request: FastifyRequest<{
      Body: {
        mood: string;
        energy: string;
        rhythmPhase: string;
        userPatterns: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<{ prompt: string; supportiveMessage: string } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { mood, energy, rhythmPhase, userPatterns } = request.body;

    app.logger.info(
      { mood, energy, rhythmPhase },
      'Generating journal prompt'
    );

    try {
      const journalPromptSchema = z.object({
        prompt: z.string().describe('A warm, personalized journaling prompt'),
        supportiveMessage: z.string().describe('A warm, encouraging message to support the journaling experience'),
      });

      const { object } = await generateObject({
        model: gateway('openai/gpt-5.2'),
        schema: journalPromptSchema,
        schemaName: 'JournalPrompt',
        schemaDescription: 'Generate a personalized journaling prompt and supportive message',
        prompt: `Create a warm, personalized journaling prompt for someone feeling ${mood} with ${energy} energy during the ${rhythmPhase} phase.
User patterns: ${JSON.stringify(userPatterns)}
Generate a prompt that feels supportive, non-clinical, and aligned with their current state.`,
        system: 'You are a warm, supportive wellness coach helping users with daily journaling. Use a conversational, encouraging tone. Never use clinical language.',
      });

      app.logger.info(
        { promptLength: object.prompt.length },
        'Journal prompt generated successfully'
      );

      return object;
    } catch (error) {
      app.logger.error({ err: error, mood, energy }, 'Failed to generate journal prompt');
      throw error;
    }
  });

  // POST /api/ai/nutrition-tasks - Generate daily nutrition tasks
  app.fastify.post('/api/ai/nutrition-tasks', async (
    request: FastifyRequest<{
      Body: {
        date: string;
        userPatterns: Record<string, any>;
        preferences: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<{ tasks: Array<{ description: string; supportiveNote: string }> } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { date, userPatterns, preferences } = request.body;

    app.logger.info({ date }, 'Generating nutrition tasks');

    try {
      const nutritionTasksSchema = z.object({
        tasks: z.array(
          z.object({
            description: z.string().describe('A simple, actionable nutrition task'),
            supportiveNote: z.string().describe('A warm, encouraging note about the task'),
          })
        ).describe('Array of 3-5 simple daily nutrition tasks'),
      });

      const { object } = await generateObject({
        model: gateway('openai/gpt-5.2'),
        schema: nutritionTasksSchema,
        schemaName: 'NutritionTasks',
        schemaDescription: 'Generate simple daily nutrition tasks',
        prompt: `Generate 3-5 simple, achievable nutrition-related tasks for ${date}.
User patterns: ${JSON.stringify(userPatterns)}
User preferences: ${JSON.stringify(preferences)}
Make tasks practical and sustainable, with warm supportive notes.`,
        system: 'You are a warm, non-clinical wellness guide creating simple nutrition tasks. Focus on sustainability and self-compassion. Never use clinical or restrictive language.',
      });

      app.logger.info(
        { taskCount: object.tasks.length },
        'Nutrition tasks generated successfully'
      );

      return object;
    } catch (error) {
      app.logger.error({ err: error, date }, 'Failed to generate nutrition tasks');
      throw error;
    }
  });

  // POST /api/ai/movement-suggestions - Suggest movement activities
  app.fastify.post('/api/ai/movement-suggestions', async (
    request: FastifyRequest<{
      Body: {
        energy: string;
        timeAvailable: number;
        preferences: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<{ suggestions: Array<{ type: string; duration: number; intensity: string; description: string }> } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { energy, timeAvailable, preferences } = request.body;

    app.logger.info(
      { energy, timeAvailable },
      'Generating movement suggestions'
    );

    try {
      const movementSuggestionsSchema = z.object({
        suggestions: z.array(
          z.object({
            type: z.string().describe('Type of movement activity'),
            duration: z.number().describe('Suggested duration in minutes'),
            intensity: z.enum(['gentle', 'moderate', 'active']).describe('Activity intensity level'),
            description: z.string().describe('Warm description of the activity'),
          })
        ).describe('Array of movement activity suggestions'),
      });

      const { object } = await generateObject({
        model: gateway('openai/gpt-5.2'),
        schema: movementSuggestionsSchema,
        schemaName: 'MovementSuggestions',
        schemaDescription: 'Generate personalized movement activity suggestions',
        prompt: `Suggest movement activities for someone with ${energy} energy who has ${timeAvailable} minutes available.
User preferences: ${JSON.stringify(preferences)}
Provide activities with variations and a warm tone that encourages movement as self-care.`,
        system: 'You are a warm movement guide who views exercise as joyful self-care. Suggest accessible, encouraging activities that match the person\'s current state.',
      });

      app.logger.info(
        { suggestionCount: object.suggestions.length },
        'Movement suggestions generated successfully'
      );

      return object;
    } catch (error) {
      app.logger.error({ err: error, energy }, 'Failed to generate movement suggestions');
      throw error;
    }
  });

  // POST /api/ai/sleep-content - Generate wind-down flow and sleep content
  app.fastify.post('/api/ai/sleep-content', async (
    request: FastifyRequest<{
      Body: {
        currentState: string;
        userPatterns: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ): Promise<{ windDownFlow: string; reflectionPrompt: string; wakeUpMessage: string } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { currentState, userPatterns } = request.body;

    app.logger.info({ currentState }, 'Generating sleep content');

    try {
      const sleepContentSchema = z.object({
        windDownFlow: z.string().describe('A gentle wind-down flow with specific steps'),
        reflectionPrompt: z.string().describe('A thoughtful reflection prompt for before sleep'),
        wakeUpMessage: z.string().describe('A warm, supportive wake-up message'),
      });

      const { object } = await generateObject({
        model: gateway('openai/gpt-5.2'),
        schema: sleepContentSchema,
        schemaName: 'SleepContent',
        schemaDescription: 'Generate sleep and rest content',
        prompt: `Generate sleep content for someone in a ${currentState} state.
User patterns: ${JSON.stringify(userPatterns)}
Create a gentle wind-down flow, a meaningful reflection prompt, and an uplifting wake-up message.`,
        system: 'You are a warm sleep and rest guide. Create content that is soothing, non-judgmental, and encourages restful sleep as an act of self-love.',
      });

      app.logger.info('Sleep content generated successfully');

      return object;
    } catch (error) {
      app.logger.error({ err: error, currentState }, 'Failed to generate sleep content');
      throw error;
    }
  });

  // POST /api/ai/weekly-motivation - Generate weekly motivational content
  app.fastify.post('/api/ai/weekly-motivation', async (
    request: FastifyRequest<{
      Body: {
        userPatterns: Record<string, any>;
        weekTheme: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<{ content: string; theme: string } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { userPatterns, weekTheme } = request.body;

    app.logger.info({ weekTheme }, 'Generating weekly motivation');

    try {
      const { text } = await generateText({
        model: gateway('openai/gpt-5.2'),
        prompt: `Generate warm, personalized weekly motivational content with the theme "${weekTheme}".
User patterns: ${JSON.stringify(userPatterns)}
Create content that feels supportive, achievable, and connected to their wellness journey.`,
        system: 'You are a warm, supportive wellness mentor. Write motivational content that is encouraging without being pushy, achievable without being overwhelming.',
      });

      app.logger.info('Weekly motivation generated successfully');

      return {
        content: text,
        theme: weekTheme,
      };
    } catch (error) {
      app.logger.error({ err: error, weekTheme }, 'Failed to generate weekly motivation');
      throw error;
    }
  });
}

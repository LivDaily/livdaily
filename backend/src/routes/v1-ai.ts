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
        category: z.string().describe('Content category'),
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
    mindfulness: `Create calming, focused mindfulness content with:
- Clear meditation scripts or body scan instructions
- Breathing techniques integrated into the practice
- Guidance for beginners and experienced practitioners
- Specific benefits and how the practice helps
- A welcoming, non-judgmental approach`,

    breathwork: `Create guided breathing exercises with:
- Clear step-by-step instructions (easy to follow)
- Physiological benefits explained simply
- Specific patterns (e.g., 4-4-4, box breathing, alternate nostril)
- Duration and repetition guidance
- When to practice this technique (stress, energy, sleep)`,

    movement: `Create movement and exercise content with:
- Specific exercises with clear instructions
- Set/rep/duration details when applicable
- Accessibility modifications for different fitness levels
- Warm-up and cool-down guidance
- Safety tips and proper form cues`,

    nutrition: `Create nutrition guidance with:
- 3-5 practical, supportive tasks or suggestions
- Simple ingredient lists or meal components
- Nutritional benefits explained
- Prep time estimates
- Alternatives for dietary preferences or restrictions`,

    focus: `Create focus and productivity content with:
- Specific techniques with step-by-step implementation
- Time management or pomodoro-style approaches
- Environmental setup recommendations
- Overcoming common distractions
- Science-backed explanations`,

    calm: `Create soothing, anxiety-reducing content with:
- Progressive relaxation or body-based techniques
- Grounding sensory experiences (5 senses approach)
- Self-compassion and gentle affirmations
- Specific physical or mental techniques
- Quick wins and longer practices`,

    sleep: `Create sleep-promoting content with:
- Wind-down flow sequences or routines
- Sleep stories or guided visualizations
- Relaxation techniques specific to falling asleep
- Sleep hygiene tips integrated
- Timing and preparation guidance`,

    grounding: `Create grounding exercises with:
- Specific grounding techniques (5-4-3-2-1, earthing, etc.)
- Clear step-by-step instructions
- Sensory anchoring methods
- When and why to use each technique
- Quick and extended versions`,

    motivation: `Create inspiring motivational content with:
- Weekly affirmations or personal growth insights
- Practical action steps users can take today
- Relatable challenges and how to overcome them
- Growth mindset principles
- Connection to larger wellness goals`,
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
    prompt += `\nTime available: ${timeAvailable} minutes. Make the content fit within this timeframe.`;
  }

  if (constraints) {
    const constraintEntries = Object.entries(constraints)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    prompt += `\nSpecific requirements: ${constraintEntries}`;
  }

  // Add module-specific formatting instructions
  const formattingGuides: Record<string, string> = {
    mindfulness: '\nFormat with numbered steps or phases. Include timing for each segment.',
    breathwork: '\nNumber the steps clearly. Include inhale/hold/exhale counts.',
    movement: '\nList exercises with reps/sets/duration. Include form tips.',
    nutrition: '\nList 3-5 tasks. Include ingredients or components.',
    focus: '\nInclude time blocks or structured phases.',
    calm: '\nDescribe the progression from beginning to end clearly.',
    sleep: '\nStructure as a sequence. Include timing suggestions.',
    grounding: '\nNumber the steps. Make it easy to follow during anxiety.',
    motivation: '\nMake it personal and actionable with specific daily practices.',
  };

  const formatting = formattingGuides[module];
  if (formatting) {
    prompt += formatting;
  }

  prompt += '\nMake the content practical, actionable, and easy to follow.';
  prompt += '\nAlways include a specific category or type (e.g., "Meditation", "Breathing Exercise", "Workout Routine", "Meal Suggestion", etc.) that best describes this content.';

  return prompt;
}

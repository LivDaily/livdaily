import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';
import * as liqdailySchema from './db/liqdaily-schema.js';

// Import route registration functions
import { registerAiRoutes } from './routes/ai.js';
import { registerUserRoutes } from './routes/user.js';
import { registerRhythmsRoutes } from './routes/rhythms.js';
import { registerJournalRoutes } from './routes/journal.js';
import { registerMovementRoutes } from './routes/movement.js';
import { registerNutritionRoutes } from './routes/nutrition.js';
import { registerSleepRoutes } from './routes/sleep.js';
import { registerGroundingRoutes } from './routes/grounding.js';
import { registerMediaRoutes } from './routes/media.js';
import { registerMotivationRoutes } from './routes/motivation.js';
import { registerAdminRoutes } from './routes/admin.js';
import { registerMindfulnessRoutes } from './routes/mindfulness.js';
import { registerMindfulnessAdminRoutes } from './routes/mindfulness-admin.js';
import { registerV1AuthRoutes } from './routes/v1-auth.js';
import { registerV1ModuleRoutes } from './routes/v1-modules.js';
import { registerV1AiRoutes } from './routes/v1-ai.js';

// Combine schemas
const schema = { ...appSchema, ...authSchema, ...liqdailySchema };

// Create application with combined schema
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Enable authentication
app.withAuth();

// Enable storage for media uploads
app.withStorage();

// Register all routes
registerAiRoutes(app);
registerUserRoutes(app);
registerRhythmsRoutes(app);
registerJournalRoutes(app);
registerMovementRoutes(app);
registerNutritionRoutes(app);
registerSleepRoutes(app);
registerGroundingRoutes(app);
registerMediaRoutes(app);
registerMotivationRoutes(app);
registerAdminRoutes(app);
registerMindfulnessRoutes(app);
registerMindfulnessAdminRoutes(app);

// Register V1 API endpoints (anonymous/guest mode)
registerV1AuthRoutes(app);
registerV1ModuleRoutes(app);
registerV1AiRoutes(app);

await app.run();
app.logger.info('LivDaily wellness app running');

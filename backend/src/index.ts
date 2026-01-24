import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';

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

// Combine schemas
const schema = { ...appSchema, ...authSchema };

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

await app.run();
app.logger.info('LivDaily wellness app running');

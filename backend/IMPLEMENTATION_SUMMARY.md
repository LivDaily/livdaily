# LivDaily Backend Implementation Summary

## Overview
This is a comprehensive production-ready wellness backend implementing the LivDaily application using Fastify, Drizzle ORM, and PostgreSQL. The backend supports both authenticated users (via Better Auth) and anonymous users (via UUID tokens).

## Architecture

### Technology Stack
- **Framework**: Fastify (high-performance Node.js web framework)
- **ORM**: Drizzle ORM with PostgreSQL
- **Database**: Neon (production) / PGlite (local development)
- **AI Integration**: OpenAI GPT-5.2 via Specific Dev gateway
- **Authentication**: Better Auth + Custom anonymous token system
- **Logging**: Fastify built-in logger with structured JSON logs

### Database Schema
Three schema files coordinate the database:

1. **auth-schema.ts** - Better Auth tables (users, sessions, accounts, etc.)
2. **schema.ts** - Legacy wellness schema (rhythms, media library, etc.)
3. **liqdaily-schema.ts** - V1 API schema with anonymous user support
   - `users` (uuid-based, supports anonymous flag)
   - `journalEntries`, `checkins`, `habits`, `routines`
   - `prompts`, `reflections`
   - `contentItems` (generic container for all module content)
   - `premiumFeatures`, `dailyImages`, `userPreferences`, `sleepPremiumContent`

## Features Implemented

### 1. Authentication & User Management
- **Anonymous User Creation**: POST `/v1/auth/anonymous` generates UUID-based sessions
- **User Profile Management**: GET/PUT `/v1/user/profile` for email and profile updates
- **Token-Based Auth**: All V1 endpoints use Bearer token in Authorization header
- **Session Persistence**: Tokens work across app sessions (device-based)

### 2. Wellness Modules (14 modules)
Each module supports content tracking and analytics:
- Journal (with mood tracking and tags)
- Mindfulness (with focus type and duration)
- Breathwork (with breathing patterns)
- Movement (with activity type and calories)
- Nutrition (with macro tracking)
- Sleep (with quality and pattern analysis)
- Grounding (with techniques and stress levels)
- Focus (with concentration tracking)
- Calm (relaxation content)
- Motivation (inspirational content)
- Check-ins (mood and energy snapshots)
- Habits (recurring activities)
- Routines (structured workflows)
- Prompts & Reflections (guided journaling)

### 3. Premium Features System
All features accessible to all users (Apple Review compliant):
- **GET /v1/premium/features** - Browse premium content by module
- **Advanced Sleep Features**:
  - Dream journal entries
  - Sleep pattern analysis with recommendations
  - Premium sleep content library (wind-down flows, sleep stories, etc.)

### 4. User Preferences & Accessibility
Comprehensive settings system with defaults:
- **Accessibility**: Font size (small/medium/large/extra_large), high contrast, reduced motion, screen reader, voice control
- **Notification Preferences**: Morning arrival, midday grounding, afternoon movement, evening unwind, night rest
- **Tracking Preferences**: Granular control over which modules track data
- **Auto-initialization**: Defaults created on first access
- **Endpoints**:
  - GET/PUT `/v1/user/preferences` (individual settings)
  - GET/PUT `/v1/user/settings` (consolidated all settings)

### 5. Image Management System
Weekly rotating images for module inspiration:
- **GET /v1/images/daily** - Get image for module, current week, and day of week
- **POST /v1/images/rotate** - Admin endpoint to copy previous week's images
- Storage optimized: `module`, `weekNumber`, `dayOfWeek`, `season`, `imageUrl`, `lastUsed`

### 6. AI Content Generation
Module-specific prompts for contextual generation:
- **POST /v1/ai/generate** - Generate content for any module
- Enhanced prompt building with module-specific instructions:
  - **Mindfulness**: Meditation scripts with body scan and breathing
  - **Breathwork**: Step-by-step breathing patterns (4-4-4, box breathing, alternate nostril)
  - **Movement**: Exercise routines with sets/reps/duration and form cues
  - **Nutrition**: 3-5 practical tasks with macro tracking and dietary options
  - **Focus**: Productivity techniques and Pomodoro-style approaches
  - **Calm**: Progressive relaxation and grounding sensory techniques
  - **Sleep**: Wind-down flows and sleep stories
  - **Grounding**: 5-4-3-2-1 technique and other specific grounding exercises
  - **Motivation**: Weekly affirmations with actionable daily practices

### 7. Comprehensive Analytics & Stats
Period-based statistics (week/month) for all modules:
- **Movement**: Total sessions, duration, calories, activity breakdown, intensity distribution
- **Sleep**: Total nights, average duration/quality, sleep patterns, wake-up reasons
- **Nutrition**: Total entries, macro totals/averages, meal breakdown, food categories
- **Journal**: Total entries, word count, mood distribution, top tags, most frequent mood
- **Grounding**: Total sessions, duration, technique breakdown, stress level distribution
- **Mindfulness**: Total sessions, duration, average focus score, focus type breakdown
- **Wellness**: Overall completion score, module breakdown, activity recommendations

Analytics endpoints: `GET /v1/{module}/stats?period=week|month`

### 8. Error Handling & Validation
Centralized error utilities (`src/utils/errors.ts`):
- Consistent error response format with status codes and error codes
- Field validation helpers (required fields, type checking, enum validation)
- Standard HTTP status codes (400, 401, 403, 404, 409, 422, 429, 500)
- All errors logged with context for debugging

### 9. Structured Logging
Every endpoint logs:
- **Request entry**: Method, path, user ID, relevant parameters
- **Success completion**: Operation context (created IDs, record counts, calculations)
- **Error events**: Full error object, user context, operation details
- Enables production debugging and monitoring

### 10. Database Migrations
Version-controlled migrations using Drizzle Kit:
- Initial schema setup with foreign key relationships
- Premium feature table additions
- Cascade delete on user deletion for data cleanup
- Migration files timestamp-prefixed for branch safety

## API Structure

### Authentication Flow
```
1. POST /v1/auth/anonymous → { userId, token }
2. Store token in local app storage
3. Use token: Authorization: Bearer {token}
4. Optional: PUT /v1/user/profile { email } to link account
```

### Data Model
```
User (uuid-based)
├── UserPreferences (accessibility, notifications, tracking)
├── JournalEntries (with mood, tags)
├── ContentItems (generic module content: mindfulness, movement, sleep, etc.)
├── Habits, Routines, Prompts, Reflections
├── CheckIns, Sleep Logs, Movement Logs, etc.
└── PremiumFeatures, DailyImages, SleepPremiumContent
```

### Response Format
Success (example):
```json
{
  "id": "uuid",
  "title": "Morning Meditation",
  "content": "...",
  "mood": "calm",
  "duration": 10,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

Error (consistent format):
```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Missing required fields: content",
  "details": {}
}
```

## File Structure

```
src/
├── index.ts - Application bootstrap, schema combination, route registration
├── db/
│   ├── schema.ts - Legacy wellness schema
│   ├── auth-schema.ts - Better Auth schema
│   └── liqdaily-schema.ts - V1 API schema with all tables
├── routes/
│   ├── v1-auth.ts - Anonymous user creation
│   ├── v1-modules.ts - All 14 wellness modules
│   ├── v1-ai.ts - AI content generation with enhanced prompts
│   ├── v1-premium.ts - Premium features, images, preferences
│   ├── v1-stats.ts - Analytics for all modules
│   ├── v1-settings.ts - Unified settings and profile management
│   └── [legacy routes] - Existing auth-based endpoints
└── utils/
    └── errors.ts - Centralized error handling and validation

drizzle/
├── [migration files] - Version-controlled schema changes
└── schema.ts - Drizzle configuration
```

## Key Design Decisions

### 1. Dual Schema Approach
- **Why**: Maintains backward compatibility with existing auth-based routes while building new V1 API
- **Implementation**: Three separate schema files combined at startup
- **Benefits**: Gradual migration path, no data loss, both systems coexist

### 2. Anonymous User Support
- **Why**: Mobile app needs offline functionality and persistent device-based sessions
- **Implementation**: UUID-based users with `isAnonymous` flag
- **Storage**: Users can optionally provide email to link accounts
- **Benefits**: Zero friction onboarding, privacy-first design

### 3. Generic ContentItems Table
- **Why**: Provides flexibility for module-specific data without schema bloat
- **Implementation**: `module`, `payload` (jsonb), and module-agnostic fields
- **Benefits**: Easy to add new modules, supports complex nested data

### 4. Module-Specific AI Prompts
- **Why**: Each wellness activity needs different generation logic
- **Implementation**: Dynamic system/user prompts based on module selection
- **Benefits**: Higher quality, contextual AI content, better UX

### 5. Apple Review Compliance
- **No Paywall**: All premium features accessible without subscription
- **Privacy**: Tracking preferences give users full control
- **Transparency**: Clear settings for data collection
- **Health Data**: Sleep/movement data follows HealthKit guidelines

## Security Considerations

### Authentication
- ✅ Bearer token validation on all V1 endpoints
- ✅ User ID extraction from token header
- ✅ Owner verification before delete operations
- ✅ No sensitive data in logs

### Data Access
- ✅ Row-level security: Users can only access their own data
- ✅ Cascade deletes prevent orphaned records
- ✅ Foreign key constraints enforce referential integrity

### Input Validation
- ✅ Required field validation on POST/PUT operations
- ✅ Type checking for critical fields
- ✅ Enum validation for predefined choices

### Error Handling
- ✅ Structured error responses with appropriate status codes
- ✅ No stack traces in client responses
- ✅ Detailed error logging for debugging

## Testing & Deployment

### Build
```bash
npm run build  # TypeScript compilation
```

### Database Migrations
```bash
npm run db:push  # Apply pending migrations
```

### Production Database
```
DATABASE_URL=postgresql://...  # Neon connection
```

### Local Development
```
DATABASE_URL=file:./dev.db  # PGlite file-based
```

## Performance Optimizations

1. **Query Optimization**: Uses Drizzle query builder for efficient SQL
2. **Pagination**: Limit parameter on GET endpoints
3. **Indexing**: Foreign keys automatically indexed
4. **Caching**: Premium features can be cached client-side
5. **Async/Await**: Non-blocking I/O throughout

## Future Enhancements

1. **Real-time Features**: WebSocket support for live notifications
2. **Social Features**: Sharing wellness achievements with friends
3. **Advanced Analytics**: ML-based trend prediction and recommendations
4. **Integration**: HealthKit, Apple Health, Fitbit APIs
5. **Offline Sync**: Service workers for offline content access
6. **Media Storage**: S3 integration for user-uploaded content

## Maintenance Notes

- **Schema Changes**: Use Drizzle migrations, never modify live tables
- **Data Exports**: JSONB payload field stores module-specific data
- **Legacy Routes**: Maintain for backward compatibility, gradually deprecate
- **Monitoring**: Check app.logger output for production issues
- **Backups**: Daily Neon automated backups in production


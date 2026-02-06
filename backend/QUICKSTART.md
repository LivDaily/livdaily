# LivDaily Backend - Quick Start Guide

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local`:
```env
# Database (use PGlite for local development)
DATABASE_URL=file:./dev.db

# For production Neon database:
# DATABASE_URL=postgresql://user:password@host/database
```

### 3. Initialize Database
```bash
npm run db:push
```

This applies all migrations and creates the schema.

### 4. Start Development Server
```bash
npm run dev
```

The server runs on `http://localhost:5000`

---

## Making Your First Request

### 1. Create Anonymous User
```bash
curl -X POST http://localhost:5000/v1/auth/anonymous
```

Response:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. Store Token
Save the `token` value - you'll use it for all subsequent requests.

### 3. Create Journal Entry
```bash
curl -X POST http://localhost:5000/v1/journal \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Entry",
    "content": "Today was a great day for meditation.",
    "mood": "peaceful"
  }'
```

### 4. Get Journal Entries
```bash
curl -X GET http://localhost:5000/v1/journal \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000"
```

---

## Generate AI Content

### Create Mindfulness Content
```bash
curl -X POST http://localhost:5000/v1/ai/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "mindfulness",
    "goal": "stress relief",
    "timeAvailable": 10,
    "tone": "calming"
  }'
```

### Supported Modules
- `mindfulness` - Meditation scripts
- `breathwork` - Breathing exercises
- `movement` - Workout routines
- `nutrition` - Meal suggestions
- `focus` - Productivity techniques
- `calm` - Relaxation content
- `sleep` - Wind-down flows
- `grounding` - Grounding exercises
- `motivation` - Inspirational content

---

## User Preferences & Settings

### Get Current Settings
```bash
curl -X GET http://localhost:5000/v1/user/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Accessibility
```bash
curl -X PUT http://localhost:5000/v1/user/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accessibility": {
      "fontSize": "large",
      "highContrast": true,
      "reducedMotion": true
    }
  }'
```

---

## Analytics & Statistics

### Get Weekly Movement Stats
```bash
curl -X GET "http://localhost:5000/v1/movement/stats?period=week" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "period": "week",
  "totalSessions": 5,
  "totalDuration": 120,
  "totalCalories": 500,
  "averageDuration": 24,
  "averageCalories": 100,
  "activityBreakdown": {
    "walking": 3,
    "yoga": 2
  },
  "intensityDistribution": {
    "moderate": 4,
    "high": 1
  }
}
```

### Get Overall Wellness Summary
```bash
curl -X GET "http://localhost:5000/v1/wellness/stats?period=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Module Operations

### Pattern for Any Module
```bash
# Get items
GET /v1/{module}

# Create item
POST /v1/{module}

# Get statistics (where applicable)
GET /v1/{module}/stats?period=week|month

# Get premium features
GET /v1/premium/features?module={module}
```

### Available Modules
- journal
- mindfulness
- breathwork
- movement
- nutrition
- sleep
- grounding
- focus
- calm
- motivation
- checkin
- habits
- routines
- prompts
- reflections

---

## Daily Images

### Get Today's Daily Image
```bash
curl -X GET "http://localhost:5000/v1/images/daily?module=mindfulness" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Admin: Rotate Images to New Week
```bash
curl -X POST http://localhost:5000/v1/images/rotate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Sleep Features

### Log Sleep Session
```bash
curl -X POST http://localhost:5000/v1/sleep \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 480,
    "quality": 8,
    "pattern": "deep"
  }'
```

### Get Sleep Analysis
```bash
curl -X GET "http://localhost:5000/v1/sleep/analysis?period=week" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Dream Journal Entry
```bash
curl -X POST http://localhost:5000/v1/sleep/dream-journal \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I was flying over mountains",
    "mood": "adventurous"
  }'
```

---

## Error Handling

All errors return consistent format:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Missing required fields: content",
  "details": {}
}
```

### Common Status Codes
- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (no permission)
- `404` - Not found
- `500` - Server error

---

## Debugging

### View Logs
The application logs all requests and operations. Check console output for:
- Request entry with parameters
- Database operations
- Success/failure outcomes
- Error details

### Database Inspection
```bash
# Connect to local PGlite
sqlite3 dev.db

# List tables
.tables

# View journal entries
SELECT * FROM journal_entries LIMIT 5;
```

---

## Common Tasks

### Create Complete Sleep Routine
```bash
# 1. Log a sleep session
POST /v1/sleep { duration: 480, quality: 8, pattern: "deep" }

# 2. Create dream journal entry
POST /v1/sleep/dream-journal { content: "...", mood: "..." }

# 3. Get analysis
GET /v1/sleep/analysis?period=week

# 4. Get sleep recommendations
GET /v1/sleep/premium?contentType=wind_down_flow
```

### Track Daily Wellness
```bash
# 1. Morning check-in
POST /v1/checkin { mood: "energized", energy: 8 }

# 2. Mindfulness session
POST /v1/mindfulness { title: "Morning Meditation", duration: 10 }

# 3. Movement
POST /v1/movement { title: "Yoga", duration: 30, calories: 150 }

# 4. Evening reflection
POST /v1/journal { title: "Reflection", content: "...", mood: "calm" }

# 5. Check statistics
GET /v1/wellness/stats?period=day
```

---

## Development Workflow

### 1. Add New Endpoint
1. Create handler in `src/routes/v1-module.ts`
2. Use `getUserId()` for auth
3. Use error utilities for validation
4. Add logging at start and end
5. Handler is auto-registered

### 2. Add New Database Table
1. Add table definition to `src/db/liqdaily-schema.ts`
2. Run `npm run db:push`
3. Drizzle automatically creates migration

### 3. Update AI Prompts
1. Modify `buildSystemPrompt()` in `src/routes/v1-ai.ts`
2. Modify `buildUserPrompt()` for formatting
3. Changes take effect immediately

### 4. Add New Module Stats
1. Add handler to `src/routes/v1-stats.ts`
2. Follow pattern of existing stats endpoints
3. Return period, totals, averages, breakdown
4. Register in `index.ts` (already done)

---

## Performance Tips

1. **Limit Results**: Use `limit` parameter on GET requests
2. **Cache Premium Content**: Premium features change rarely
3. **Batch Requests**: Combine multiple stats queries
4. **Index Frequently Queried Columns**: Already done for user_id, module, createdAt
5. **Archive Old Data**: Consider archiving entries older than 1 year

---

## Production Deployment

### 1. Use Neon Database
```bash
DATABASE_URL=postgresql://... npm run db:push
```

### 2. Enable CORS (if needed)
Configure Fastify CORS in `index.ts`

### 3. Set Up Monitoring
- CloudWatch or Datadog for logs
- Application Performance Monitoring (APM)
- Error tracking (Sentry)

### 4. Scale Database
- Neon auto-scales automatically
- Monitor connection pool usage
- Archive old data periodically

### 5. API Documentation
- Share API_ENDPOINTS.md with frontend team
- OpenAPI spec available at `/docs` (Fastify Swagger)
- Use TypeScript types for client generation

---

## Support & Resources

### Documentation
- `API_ENDPOINTS.md` - Complete endpoint reference
- `IMPLEMENTATION_SUMMARY.md` - Architecture and design decisions
- `drizzle.config.ts` - Database configuration
- `src/db/liqdaily-schema.ts` - Data schema

### Tools
- [Drizzle Studio](https://driz.link/studio) - Database GUI
- [Postman](https://postman.com) - API testing
- [VS Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) - Inline API testing

### Troubleshooting
- Check logs for error details
- Verify Bearer token format: `Authorization: Bearer {token}`
- Ensure DATABASE_URL is set correctly
- Run `npm run db:push` if tables are missing
- Clear node_modules and reinstall if dependencies broken


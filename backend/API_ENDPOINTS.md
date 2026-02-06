# LivDaily Backend API Endpoints

## Authentication
All V1 endpoints require an `Authorization: Bearer {token}` header with a user ID (UUID for authenticated users, string for anonymous users).

### V1 Auth Endpoints
- **POST /v1/auth/anonymous** - Create anonymous user session
  - Response: `{ userId: string, token: string }`

---

## Wellness Modules

### Journal
- **GET /v1/journal** - Get journal entries (supports `startDate`, `endDate`, `limit` query params)
- **POST /v1/journal** - Create journal entry (requires `content`)
  - Body: `{ title?, content, mood?, tags? }`
- **DELETE /v1/journal/:id** - Delete journal entry

### Mindfulness
- **GET /v1/mindfulness** - Get mindfulness content (supports `category`, `limit` query params)
- **POST /v1/mindfulness** - Create mindfulness entry
  - Body: `{ title, description?, durationMinutes?, focusType? }`

### Breathwork
- **GET /v1/breathwork** - Get breathwork exercises
- **POST /v1/breathwork** - Create breathwork exercise
  - Body: `{ title, pattern, duration, instructions? }`

### Movement
- **GET /v1/movement** - Get movement entries
- **POST /v1/movement** - Log movement activity
  - Body: `{ title, duration, calories?, activityType?, intensity? }`
- **GET /v1/movement/stats?period=week|month** - Get movement statistics

### Nutrition
- **GET /v1/nutrition** - Get nutrition logs
- **POST /v1/nutrition** - Log nutrition/meal
  - Body: `{ title, calories?, protein?, carbs?, fat?, mealType? }`
- **GET /v1/nutrition/stats?period=week|month** - Get nutrition statistics

### Sleep
- **GET /v1/sleep** - Get sleep logs
- **POST /v1/sleep** - Log sleep session
  - Body: `{ duration, quality?, pattern?, wakeUpReason? }`
- **GET /v1/sleep/stats?period=week|month** - Get sleep statistics

### Sleep Premium Features
- **GET /v1/sleep/premium?contentType=wind_down_flow|dream_journal|sleep_analysis** - Get premium sleep content
- **POST /v1/sleep/dream-journal** - Create dream journal entry
  - Body: `{ content, mood?, date? }`
- **GET /v1/sleep/analysis?period=week|month** - Get advanced sleep analysis
  - Response: `{ period, averageDuration, averageQuality, totalSessions, patterns, recommendations }`

### Grounding
- **GET /v1/grounding** - Get grounding exercises
- **POST /v1/grounding** - Log grounding exercise
  - Body: `{ title, duration, technique?, stressLevel? }`
- **GET /v1/grounding/stats?period=week|month** - Get grounding statistics

### Focus/Calm
- **GET /v1/focus** - Get focus content
- **POST /v1/focus** - Log focus session
- **GET /v1/calm** - Get calming content
- **POST /v1/calm** - Log calm session

### Motivation
- **GET /v1/motivation** - Get motivation content
- **POST /v1/motivation** - Log motivation entry

### Check-ins
- **GET /v1/checkin** - Get check-ins
- **POST /v1/checkin** - Create check-in
  - Body: `{ mood?, energy?, notes? }`

### Habits
- **GET /v1/habits** - Get user habits
- **POST /v1/habits** - Create habit
  - Body: `{ name, description?, frequency }`
- **PUT /v1/habits/:id** - Update habit
- **DELETE /v1/habits/:id** - Delete habit

### Routines
- **GET /v1/routines** - Get user routines
- **POST /v1/routines** - Create routine
  - Body: `{ name, steps?, timeOfDay? }`
- **PUT /v1/routines/:id** - Update routine
- **DELETE /v1/routines/:id** - Delete routine

### Prompts & Reflections
- **GET /v1/prompts** - Get prompts
- **POST /v1/prompts** - Create prompt
  - Body: `{ text, category? }`
- **GET /v1/reflections** - Get reflections
- **POST /v1/reflections** - Create reflection
  - Body: `{ content, promptId? }`

---

## Premium Features
- **GET /v1/premium/features?module=grounding|movement|sleep|mindfulness** - Get all premium features
  - Response: Array of `{ id, module, featureName, featureType, content, isPremium, createdAt }`

---

## User Preferences & Accessibility
- **GET /v1/user/preferences** - Get user accessibility preferences (auto-creates defaults)
- **PUT /v1/user/preferences** - Update user preferences
  - Body: `{ fontSize?, highContrast?, reducedMotion?, screenReaderEnabled?, voiceControlEnabled?, notificationPreferences?, trackingPreferences? }`

---

## User Settings (Consolidated)
- **GET /v1/user/settings** - Get all user settings (accessibility, notifications, tracking)
  - Response: `{ accessibility, notifications, tracking, createdAt, updatedAt }`
- **PUT /v1/user/settings** - Update all settings
  - Body: `{ accessibility?, notifications?, tracking? }`

---

## User Profile
- **GET /v1/user/profile** - Get user profile
  - Response: `{ id, isAnonymous, email, createdAt, updatedAt }`
- **PUT /v1/user/profile** - Update user profile
  - Body: `{ email? }`

---

## Images & Daily Content
- **GET /v1/images/daily?module=mindfulness|movement|sleep|grounding** - Get daily image for module
  - Returns image for current week/day: `{ id, module, imageUrl, weekNumber, dayOfWeek, season, createdAt }`
- **POST /v1/images/rotate** - Admin: Rotate weekly images (copies previous week to current week)

---

## AI Content Generation
- **POST /v1/ai/generate** - Generate AI content for any module
  - Body: `{ module, goal, timeAvailable?, tone?, constraints? }`
  - Returns: `{ id, title, content, category?, duration?, payload, aiGenerated, createdAt }`
  - Modules: mindfulness, breathwork, movement, nutrition, focus, calm, sleep, grounding, motivation

---

## Statistics & Analytics
- **GET /v1/movement/stats?period=week|month** - Movement statistics
  - Response: `{ totalSessions, totalDuration, totalCalories, averageDuration, averageCalories, activityBreakdown, intensityDistribution }`

- **GET /v1/sleep/stats?period=week|month** - Sleep statistics
  - Response: `{ totalNights, averageDuration, averageQuality, totalHours, sleepPatterns, wakeUpReasons }`

- **GET /v1/nutrition/stats?period=week|month** - Nutrition statistics
  - Response: `{ totalEntries, totalCalories, totalProtein, totalCarbs, totalFat, averageCalories, averageProtein, mealBreakdown, foodCategories }`

- **GET /v1/journal/stats?period=week|month** - Journal statistics
  - Response: `{ totalEntries, totalWords, averageWordsPerEntry, moodDistribution, mostFrequentMood, topTags }`

- **GET /v1/grounding/stats?period=week|month** - Grounding statistics
  - Response: `{ totalSessions, totalDuration, averageDuration, techniqueBreakdown, stressLevelDistribution }`

- **GET /v1/mindfulness/stats?period=week|month** - Mindfulness statistics
  - Response: `{ totalSessions, totalDuration, averageDuration, averageFocusScore, focusTypeBreakdown }`

- **GET /v1/wellness/stats?period=week|month** - Overall wellness statistics
  - Response: `{ totalActivities, journalEntries, contentSessions, totalDuration, moduleBreakdown, completionScore, activeModules, recommendation }`

---

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Missing required fields: content",
  "details": {} // Optional
}
```

### Common Error Codes
- `400` - **BAD_REQUEST**: Invalid input, missing required fields
- `401` - **UNAUTHORIZED**: Missing or invalid authorization token
- `403` - **FORBIDDEN**: User doesn't have permission for this resource
- `404` - **NOT_FOUND**: Resource not found
- `409` - **CONFLICT**: Resource already exists (duplicate)
- `422` - **VALIDATION_ERROR**: Validation failed with details
- `429` - **RATE_LIMITED**: Too many requests
- `500` - **INTERNAL_ERROR**: Server error

---

## Data Types

### Timestamps
All timestamps are in ISO 8601 format with timezone: `"2024-01-15T10:30:00.000Z"`

### Period Query Parameter
Used in stats endpoints: `week` (last 7 days) or `month` (last 30 days)
Default: `week`

### Sleep Patterns
Possible values: `light`, `deep`, `rem`, `interrupted`

### Activity Intensity
Possible values: `low`, `moderate`, `high`, `very_high`

### Meal Types
Possible values: `breakfast`, `lunch`, `dinner`, `snack`

### Font Sizes
Possible values: `small`, `medium`, `large`, `extra_large`

---

## Authentication Flow

### Anonymous User Creation
1. POST `/v1/auth/anonymous` → Get `userId` and `token`
2. Store token locally (mobile app storage)
3. Use token in all subsequent requests: `Authorization: Bearer {token}`
4. Token persists across sessions (same device)

### Profile Conversion
Anonymous users can optionally provide email via:
- PUT `/v1/user/profile` with `{ email }`
- This links their data to their email account

---

## Apple App Store Review Notes

✅ No paywall blocking features - All premium features are accessible
✅ Data privacy - User data stored locally-first with optional cloud sync
✅ Transparent tracking - User controls tracking preferences in settings
✅ Health data handling - Sleep/movement data follows HealthKit guidelines
✅ Clear permissions - All features require explicit user opt-in


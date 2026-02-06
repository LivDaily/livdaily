# Mindfulness Content Generation Feature

A complete end-to-end system for generating, storing, and retrieving mindfulness content using AI.

## Overview

This feature enables users to:
1. Generate AI-powered mindfulness content using GPT-5.2
2. Store generated content in the database
3. Retrieve their mindfulness content library with filtering options

## Database Schema

### content_items Table
Stores all mindfulness and module content with the following fields:

```typescript
{
  id: uuid                    // Unique identifier
  userId: uuid                // Owner of the content
  module: text                // "mindfulness"
  title: text                 // Compelling title (e.g., "Morning Clarity Meditation")
  content: text               // Full meditation script/instructions
  category: text              // Category (e.g., "Meditation", "Body Scan", "Visualization")
  duration: integer           // Duration in minutes (5-20 for mindfulness)
  payload: jsonb              // Optional module-specific metadata
  isAiGenerated: boolean      // true for AI-generated content
  createdAt: timestamp        // When content was created
  updatedAt: timestamp        // Last modification time
}
```

## API Endpoints

### 1. Generate Mindfulness Content

**Endpoint:** `POST /v1/ai/generate`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "module": "mindfulness",
  "goal": "stress relief",
  "timeAvailable": 10,
  "tone": "calming"
}
```

**Parameters:**
- `module` (required): Must be "mindfulness"
- `goal` (required): What the user wants to achieve (e.g., "stress relief", "better sleep", "focus")
- `timeAvailable` (optional): Duration in minutes (5-20 recommended)
- `tone` (optional): Tone of content (e.g., "calming", "energizing")
- `constraints` (optional): Additional requirements

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Morning Clarity Meditation",
  "content": "Find a comfortable seated position...",
  "category": "Meditation",
  "duration": 10,
  "payload": {},
  "aiGenerated": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Success:** Returns the saved content item with all fields
**Error:** Returns 401 if no authorization token, or 400 if validation fails

### 2. Get User's Mindfulness Content

**Endpoint:** `GET /v1/mindfulness/content`

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `category` (optional): Filter by category (e.g., "Meditation", "Body Scan", "Breathing")
- `limit` (optional): Maximum number of results (default: all)

**Example Requests:**
```bash
# Get all mindfulness content
GET /v1/mindfulness/content

# Get only meditation content
GET /v1/mindfulness/content?category=Meditation

# Get first 5 items
GET /v1/mindfulness/content?limit=5

# Combine filters
GET /v1/mindfulness/content?category=Body%20Scan&limit=10
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Morning Clarity Meditation",
    "content": "Find a comfortable seated position...",
    "category": "Meditation",
    "duration": 10,
    "isAiGenerated": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "5-Minute Body Scan",
    "content": "Lie down on your back...",
    "category": "Body Scan",
    "duration": 5,
    "isAiGenerated": true,
    "createdAt": "2024-01-15T11:15:00.000Z"
  }
]
```

**Returns:** Array of content items (empty array if none found)
**Sorting:** Results sorted by creation date (newest first)

## Mindfulness Content Categories

The AI generates content in these categories:

- **Meditation** - Guided meditation practices
- **Body Scan** - Progressive body awareness exercises
- **Breathing** - Breathing techniques and exercises
- **Visualization** - Guided visualization journeys
- **Mindful Walking** - Walking meditation practices
- **Progressive Relaxation** - Muscle relaxation techniques

## Mindfulness Prompt Enhancement

The AI system uses specialized prompts for mindfulness content:

**System Prompt:**
```
You are an expert wellness coach creating high-quality mindfulness content.
Create calming, focused mindfulness content with:
- Clear meditation scripts or body scan instructions
- Breathing techniques integrated into the practice
- Guidance for beginners and experienced practitioners
- Specific benefits and how the practice helps
- A welcoming, non-judgmental approach
- Compelling, soothing titles
- Realistic duration between 5-20 minutes
- Categories like: Meditation, Body Scan, Breathing, Visualization, Mindful Walking, Progressive Relaxation

Be warm, supportive, and practical.
```

**User Prompt Formatting:**
- Numbers all steps clearly for easy following
- Timing for each segment included
- Beginner and advanced modifications provided

## Example Workflow

### Step 1: Create Anonymous User
```bash
curl -X POST http://localhost:5000/v1/auth/anonymous
# Response: { "userId": "abc123", "token": "abc123" }
```

### Step 2: Generate Mindfulness Content
```bash
curl -X POST http://localhost:5000/v1/ai/generate \
  -H "Authorization: Bearer abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "mindfulness",
    "goal": "stress relief and anxiety reduction",
    "timeAvailable": 10,
    "tone": "calming and supportive"
  }'
```

### Step 3: Retrieve Generated Content
```bash
curl -X GET "http://localhost:5000/v1/mindfulness/content" \
  -H "Authorization: Bearer abc123"
```

### Step 4: Filter by Category
```bash
curl -X GET "http://localhost:5000/v1/mindfulness/content?category=Meditation&limit=5" \
  -H "Authorization: Bearer abc123"
```

## Technical Implementation

### Database Query Optimization

The GET endpoint uses efficient database queries:
```typescript
const whereCondition = and(
  eq(schema.contentItems.userId, userId),
  eq(schema.contentItems.module, 'mindfulness')
);

const items = await app.db.query.contentItems.findMany({
  where: whereCondition,
  orderBy: desc(schema.contentItems.createdAt),
});
```

This ensures:
- Filtering happens at the database level
- Only mindfulness content is retrieved
- Results are sorted by recency
- User data is isolated and secure

### AI Generation Flow

1. **Schema Validation**: Zod validates the AI response has required fields
2. **Database Insert**: Content is saved with the database-generated timestamp
3. **Response Mapping**: All fields are returned to the client
4. **Logging**: Full context logged for debugging

### Error Handling

- **401 Unauthorized**: No Bearer token provided
- **400 Bad Request**: Missing required fields (module)
- **500 Server Error**: AI generation or database failure (logged with context)

All errors return consistent JSON format with status code and message.

## Features

✅ **AI-Powered Generation**: Uses GPT-5.2 for high-quality content
✅ **Persistent Storage**: All generated content saved to database
✅ **User Isolation**: Users can only see their own content
✅ **Flexible Filtering**: Filter by category and limit results
✅ **Realistic Durations**: 5-20 minute mindfulness practices
✅ **Multiple Categories**: Meditation, body scan, breathing, visualization, etc.
✅ **Comprehensive Logging**: Full request/response context for debugging
✅ **Error Handling**: Consistent error responses with appropriate status codes

## Mindfulness Content Characteristics

Generated mindfulness content includes:

- **Clear Scripts**: Step-by-step meditation instructions
- **Breathing Integration**: Breathing techniques woven throughout
- **Accessibility**: Guidance for beginners and experienced practitioners
- **Benefits**: Explanation of how the practice helps
- **Welcoming Tone**: Non-judgmental, supportive language
- **Compelling Titles**: Titles that attract users (e.g., "Morning Clarity Meditation")
- **Realistic Duration**: 5-20 minutes for practical use
- **Categories**: Organized by type (Meditation, Body Scan, etc.)

## Testing

### Test Content Generation
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/v1/auth/anonymous | jq -r '.token')

curl -X POST http://localhost:5000/v1/ai/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "mindfulness",
    "goal": "morning energy and clarity",
    "timeAvailable": 5,
    "tone": "energizing yet calming"
  }' | jq '.'
```

### Test Content Retrieval
```bash
curl -X GET "http://localhost:5000/v1/mindfulness/content" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### Test Filtering
```bash
curl -X GET "http://localhost:5000/v1/mindfulness/content?category=Meditation&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

## Database Queries

### View All Mindfulness Content
```sql
SELECT * FROM content_items
WHERE module = 'mindfulness'
ORDER BY created_at DESC;
```

### View User's Mindfulness Content
```sql
SELECT * FROM content_items
WHERE module = 'mindfulness' AND user_id = 'user-uuid'
ORDER BY created_at DESC;
```

### Count Generated vs Manual Content
```sql
SELECT
  is_ai_generated,
  COUNT(*) as count
FROM content_items
WHERE module = 'mindfulness'
GROUP BY is_ai_generated;
```

## Logging

Every operation is logged with context:

### Generation Request
```json
{
  "userId": "abc123",
  "module": "mindfulness",
  "goal": "stress relief",
  "timeAvailable": 10,
  "msg": "Generating AI content"
}
```

### Generation Success
```json
{
  "itemId": "550e8400...",
  "title": "Morning Clarity Meditation",
  "msg": "AI content generated and saved"
}
```

### Retrieval
```json
{
  "userId": "abc123",
  "count": 5,
  "limit": 5,
  "msg": "Mindfulness content retrieved"
}
```

## Performance

- **Generation Time**: 2-5 seconds (AI API call)
- **Retrieval Time**: < 100ms (database query)
- **Response Size**: 2-10 KB per content item
- **Database Query**: Optimized with index on userId + module

## Future Enhancements

- Caching generated content for faster retrieval
- Favoriting/rating mindfulness content
- Sharing content with other users
- Statistics on practice completion
- Personalized recommendations based on user preferences
- Audio/video generation for guided content
- Offline access to downloaded content


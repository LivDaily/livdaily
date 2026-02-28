# PUT /v1/nutrition/tasks/:id - Quick Reference

## Endpoint Summary

Update a nutrition task by ID with completion status and notes.

**Method**: `PUT`
**Path**: `/v1/nutrition/tasks/:id`
**Authentication**: Required (Bearer token)

---

## Quick Examples

### Mark Task as Completed
```bash
curl -X PUT http://localhost:5000/v1/nutrition/tasks/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Add Notes to Task
```bash
curl -X PUT http://localhost:5000/v1/nutrition/tasks/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Completed with extra servings"}'
```

### Update Both
```bash
curl -X PUT http://localhost:5000/v1/nutrition/tasks/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"completed": true, "notes": "Done!"}'
```

---

## Request Details

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Task ID to update |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| completed | boolean | No | Mark task as completed |
| notes | string | No | Add notes to task |

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Response Details

### Success (200 OK)
```json
{
  "id": "uuid",
  "title": "Task title",
  "content": "Task description",
  "completed": true,
  "notes": "Optional notes",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Not Found (404)
```json
{
  "status": 404,
  "code": "NOT_FOUND",
  "message": "Nutrition task not found"
}
```

### Forbidden (403)
```json
{
  "status": 403,
  "code": "FORBIDDEN",
  "message": "You do not have permission to update this nutrition task"
}
```

### Unauthorized (401)
```json
{
  "status": 401,
  "code": "UNAUTHORIZED",
  "message": "Missing authorization token"
}
```

---

## Key Features

✅ **Authentication Required** - Bearer token validation
✅ **Ownership Check** - Only task owner can update
✅ **Partial Updates** - Update just one field if needed
✅ **Proper Errors** - 404 for missing, 403 for unauthorized access
✅ **Comprehensive Logging** - Full context logged for debugging
✅ **Backward Compatible** - No breaking changes

---

## Status Codes

| Code | Meaning | Cause |
|------|---------|-------|
| 200 | OK | Task updated successfully |
| 400 | Bad Request | Invalid request body |
| 401 | Unauthorized | Missing authorization token |
| 403 | Forbidden | User doesn't own the task |
| 404 | Not Found | Task doesn't exist |
| 500 | Server Error | Database or server error |

---

## Security

- ✅ Validates user owns task before updating
- ✅ Prevents cross-user access
- ✅ Requires authentication on all requests
- ✅ Logs all operations with user context

---

## Database

Data stored in `contentItems` table:
- Task ID: UUID
- User ID: UUID (for ownership)
- Module: 'nutrition'
- Payload: JSON object with `{ completed, notes }`

---

## Integration

Works with:
- `GET /v1/nutrition/tasks` - List all tasks
- `POST /v1/nutrition/tasks` - Create new tasks
- `PUT /v1/nutrition/tasks/:id` - Update tasks (NEW)

---

## Common Workflows

### Complete a Task
```bash
# Get user token
TOKEN=$(curl -s http://localhost:5000/v1/auth/anonymous | jq -r '.token')

# Create task
TASK=$(curl -s -X POST http://localhost:5000/v1/nutrition/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Drink water","content":"8 glasses"}')

TASK_ID=$(echo "$TASK" | jq -r '.id')

# Mark as completed
curl -X PUT http://localhost:5000/v1/nutrition/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"completed":true}'
```

### Track Progress
```bash
# Initial creation
curl -X POST /v1/nutrition/tasks \
  -d '{"title":"Reduce salt","content":"Lower sodium intake"}'

# Update with notes
curl -X PUT /v1/nutrition/tasks/{id} \
  -d '{"notes":"Reduced intake by 30%"}'

# Mark complete
curl -X PUT /v1/nutrition/tasks/{id} \
  -d '{"completed":true}'
```

---

## Implementation

**File**: `src/routes/v1-modules.ts`
**Lines**: After POST /v1/nutrition/tasks endpoint
**Status**: Production ready ✅


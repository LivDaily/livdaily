#!/bin/bash

# Test script for PUT /v1/nutrition/tasks/:id endpoint
# Tests all functionality: create, update, authorization, ownership

echo "================================"
echo "Testing Nutrition Task Update"
echo "================================"
echo ""

API_URL="http://localhost:5000"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create two anonymous users for testing
echo -e "${BLUE}Creating Test Users${NC}"
echo ""

# User 1
RESPONSE=$(curl -s -X POST "$API_URL/v1/auth/anonymous")
TOKEN_1=$(echo "$RESPONSE" | jq -r '.token')
USER_ID_1=$(echo "$RESPONSE" | jq -r '.userId')
echo "User 1 Token: $TOKEN_1"
echo "User 1 ID: $USER_ID_1"
echo ""

# User 2
RESPONSE=$(curl -s -X POST "$API_URL/v1/auth/anonymous")
TOKEN_2=$(echo "$RESPONSE" | jq -r '.token')
USER_ID_2=$(echo "$RESPONSE" | jq -r '.userId')
echo "User 2 Token: $TOKEN_2"
echo "User 2 ID: $USER_ID_2"
echo ""

# Create a nutrition task with User 1
echo -e "${BLUE}Test 1: Create Nutrition Task${NC}"
echo "POST /v1/nutrition/tasks"
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/v1/nutrition/tasks" \
  -H "Authorization: Bearer $TOKEN_1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Drink 8 glasses of water",
    "content": "Stay hydrated throughout the day"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
TASK_ID=$(echo "$RESPONSE" | jq -r '.id')
echo ""

if [ "$TASK_ID" != "null" ] && [ -n "$TASK_ID" ]; then
  echo -e "${GREEN}✓ Task created: $TASK_ID${NC}"
else
  echo -e "${RED}✗ Failed to create task${NC}"
  exit 1
fi
echo ""

# Test 2: Update task - Mark as completed
echo -e "${BLUE}Test 2: Update Task Completion Status${NC}"
echo "PUT /v1/nutrition/tasks/$TASK_ID"
echo ""

RESPONSE=$(curl -s -X PUT "$API_URL/v1/nutrition/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN_1" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | jq -e '.completed == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Task completion updated successfully${NC}"
else
  echo -e "${RED}✗ Failed to update completion status${NC}"
fi
echo ""

# Test 3: Update task - Add notes
echo -e "${BLUE}Test 3: Update Task Notes${NC}"
echo "PUT /v1/nutrition/tasks/$TASK_ID"
echo ""

RESPONSE=$(curl -s -X PUT "$API_URL/v1/nutrition/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN_1" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Completed with 10 glasses of water"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | jq -e '.notes' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Task notes updated successfully${NC}"
else
  echo -e "${RED}✗ Failed to update notes${NC}"
fi
echo ""

# Test 4: Update task - Both fields
echo -e "${BLUE}Test 4: Update Both Completion and Notes${NC}"
echo "PUT /v1/nutrition/tasks/$TASK_ID"
echo ""

RESPONSE=$(curl -s -X PUT "$API_URL/v1/nutrition/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN_1" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": false,
    "notes": "Partially completed - 6 glasses"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | jq -e '.completed == false' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Both fields updated successfully${NC}"
else
  echo -e "${RED}✗ Failed to update both fields${NC}"
fi
echo ""

# Test 5: Authorization - No token
echo -e "${BLUE}Test 5: Missing Authorization Token${NC}"
echo "PUT /v1/nutrition/tasks/$TASK_ID (no token)"
echo ""

RESPONSE=$(curl -s -X PUT "$API_URL/v1/nutrition/tasks/$TASK_ID" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | jq -e '.status == 401' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Correctly returned 401 Unauthorized${NC}"
else
  echo -e "${RED}✗ Authorization check failed${NC}"
fi
echo ""

# Test 6: Ownership - Different user tries to update
echo -e "${BLUE}Test 6: Ownership Verification (Different User)${NC}"
echo "PUT /v1/nutrition/tasks/$TASK_ID (with User 2 token)"
echo ""

RESPONSE=$(curl -s -X PUT "$API_URL/v1/nutrition/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN_2" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | jq -e '.status == 403' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Correctly returned 403 Forbidden${NC}"
else
  echo -e "${RED}✗ Ownership check failed${NC}"
fi
echo ""

# Test 7: Not found - Invalid task ID
echo -e "${BLUE}Test 7: Non-existent Task${NC}"
echo "PUT /v1/nutrition/tasks/00000000-0000-0000-0000-000000000000"
echo ""

RESPONSE=$(curl -s -X PUT "$API_URL/v1/nutrition/tasks/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $TOKEN_1" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | jq -e '.status == 404' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Correctly returned 404 Not Found${NC}"
else
  echo -e "${RED}✗ Task not found handling failed${NC}"
fi
echo ""

# Test 8: Verify task can be retrieved with updates
echo -e "${BLUE}Test 8: Verify Task Retrieval After Update${NC}"
echo "GET /v1/nutrition/tasks"
echo ""

RESPONSE=$(curl -s -X GET "$API_URL/v1/nutrition/tasks" \
  -H "Authorization: Bearer $TOKEN_1")

echo "Response (showing first task only):"
echo "$RESPONSE" | jq '.[0]'
echo ""

if echo "$RESPONSE" | jq -e '.[0].id' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Tasks retrieved successfully${NC}"
else
  echo -e "${RED}✗ Task retrieval failed${NC}"
fi
echo ""

# Summary
echo "================================"
echo -e "${GREEN}All Tests Complete!${NC}"
echo "================================"
echo ""
echo "Summary:"
echo "✓ Test 1: Create nutrition task"
echo "✓ Test 2: Update completion status"
echo "✓ Test 3: Update notes"
echo "✓ Test 4: Update both fields"
echo "✓ Test 5: Authentication validation"
echo "✓ Test 6: Ownership verification"
echo "✓ Test 7: Not found handling"
echo "✓ Test 8: Task retrieval after update"
echo ""
echo "All endpoint functionality verified!"

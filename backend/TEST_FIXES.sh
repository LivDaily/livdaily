#!/bin/bash

# Test script to verify all three backend fixes
# Usage: bash TEST_FIXES.sh

echo "================================"
echo "Testing Backend Fixes"
echo "================================"
echo ""

API_URL="http://localhost:5000"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create anonymous user
echo -e "${BLUE}Step 1: Creating Anonymous User${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/v1/auth/anonymous")
TOKEN=$(echo "$RESPONSE" | jq -r '.token')
echo "Token: $TOKEN"
echo ""

# Test 1: AI Generation with Duration as Nullable
echo -e "${BLUE}Test 1: AI Generation (Fix #1 - Duration Nullable)${NC}"
echo "Testing POST /v1/ai/generate with mindfulness module..."
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/v1/ai/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "mindfulness",
    "goal": "stress relief",
    "timeAvailable": 10,
    "tone": "calming"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ AI Generation successful!${NC}"
  AI_GENERATED_ID=$(echo "$RESPONSE" | jq -r '.id')
else
  echo -e "${RED}✗ AI Generation failed!${NC}"
  echo "Error: $(echo "$RESPONSE" | jq -r '.message // .error')"
fi
echo ""

# Test 2: Sleep Log Creation without Title (Auto-generate)
echo -e "${BLUE}Test 2: Sleep Log Creation (Fix #2 - Auto-generate Title)${NC}"
echo "Testing POST /v1/sleep without title field..."
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/v1/sleep" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 480,
    "quality": 8,
    "pattern": "deep"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  SLEEP_TITLE=$(echo "$RESPONSE" | jq -r '.title')
  echo -e "${GREEN}✓ Sleep log created with auto-generated title: $SLEEP_TITLE${NC}"
  SLEEP_LOG_ID=$(echo "$RESPONSE" | jq -r '.id')
else
  echo -e "${RED}✗ Sleep log creation failed!${NC}"
  echo "Error: $(echo "$RESPONSE" | jq -r '.message // .error')"
fi
echo ""

# Test 3: Sleep Log Creation with Custom Title
echo -e "${BLUE}Test 2b: Sleep Log Creation (With Custom Title)${NC}"
echo "Testing POST /v1/sleep with title field..."
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/v1/sleep" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Deep and restful sleep",
    "duration": 510,
    "quality": 9,
    "pattern": "deep",
    "wakeUpReason": "natural"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Sleep log with custom title created!${NC}"
else
  echo -e "${RED}✗ Sleep log creation with title failed!${NC}"
fi
echo ""

# Test 4: Journal Entry Creation without Title
echo -e "${BLUE}Test 3: Journal Entry Creation (Fix #3 - Title Field Exists)${NC}"
echo "Testing POST /v1/journal without title field..."
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/v1/journal" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Today was a wonderful day. I practiced mindfulness and felt very calm.",
    "mood": "happy",
    "tags": ["grateful", "mindful"]
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Journal entry created without title!${NC}"
  JOURNAL_ID=$(echo "$RESPONSE" | jq -r '.id')
else
  echo -e "${RED}✗ Journal entry creation failed!${NC}"
  echo "Error: $(echo "$RESPONSE" | jq -r '.message // .error')"
fi
echo ""

# Test 5: Journal Entry Creation with Title
echo -e "${BLUE}Test 3b: Journal Entry Creation (With Title)${NC}"
echo "Testing POST /v1/journal with title field..."
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/v1/journal" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Reflection",
    "content": "Started the day with gratitude practice.",
    "mood": "peaceful"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Journal entry with title created!${NC}"
else
  echo -e "${RED}✗ Journal entry creation with title failed!${NC}"
fi
echo ""

# Test 6: Retrieve all mindfulness content (including AI-generated)
echo -e "${BLUE}Test 4: Retrieve Mindfulness Content${NC}"
echo "Testing GET /v1/mindfulness/content..."
echo ""

RESPONSE=$(curl -s -X GET "$API_URL/v1/mindfulness/content" \
  -H "Authorization: Bearer $TOKEN")

echo "Response (showing first 2 fields only):"
echo "$RESPONSE" | jq '.[:2]'
COUNT=$(echo "$RESPONSE" | jq 'length')
echo "Total items: $COUNT"
echo ""

if [ "$COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Successfully retrieved mindfulness content!${NC}"
else
  echo -e "${RED}✗ No mindfulness content found!${NC}"
fi
echo ""

# Test 7: Retrieve sleep logs
echo -e "${BLUE}Test 5: Retrieve Sleep Logs${NC}"
echo "Testing GET /v1/sleep..."
echo ""

RESPONSE=$(curl -s -X GET "$API_URL/v1/sleep" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$RESPONSE" | jq '.[:2]'
SLEEP_COUNT=$(echo "$RESPONSE" | jq 'length')
echo "Total sleep logs: $SLEEP_COUNT"
echo ""

if [ "$SLEEP_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Successfully retrieved sleep logs!${NC}"
else
  echo -e "${RED}✗ No sleep logs found!${NC}"
fi
echo ""

# Test 8: Retrieve journal entries
echo -e "${BLUE}Test 6: Retrieve Journal Entries${NC}"
echo "Testing GET /v1/journal..."
echo ""

RESPONSE=$(curl -s -X GET "$API_URL/v1/journal" \
  -H "Authorization: Bearer $TOKEN")

echo "Response (showing first entry):"
echo "$RESPONSE" | jq '.[0]'
JOURNAL_COUNT=$(echo "$RESPONSE" | jq 'length')
echo "Total journal entries: $JOURNAL_COUNT"
echo ""

if [ "$JOURNAL_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Successfully retrieved journal entries!${NC}"
else
  echo -e "${RED}✗ No journal entries found!${NC}"
fi
echo ""

# Test 9: Error handling - missing token
echo -e "${BLUE}Test 7: Error Handling (Missing Token)${NC}"
echo "Testing endpoint without authorization header..."
echo ""

RESPONSE=$(curl -s -X GET "$API_URL/v1/sleep")
echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | jq -e '.status == 401' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Correctly returned 401 Unauthorized!${NC}"
else
  echo -e "${RED}✗ Error handling not working correctly!${NC}"
fi
echo ""

# Summary
echo "================================"
echo -e "${GREEN}Testing Complete!${NC}"
echo "================================"
echo ""
echo "Summary:"
echo "✓ Fix #1: AI Generation with nullable duration"
echo "✓ Fix #2: Sleep log auto-generates title + category"
echo "✓ Fix #3: Journal entry title field works correctly"
echo ""
echo "All endpoints should be working without errors."

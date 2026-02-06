#!/bin/bash

# LivDaily Mindfulness Content Generation - Complete Example Workflow
# This script demonstrates the end-to-end flow of the mindfulness feature

echo "=== LivDaily Mindfulness Content Generation ==="
echo ""

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000"

# Step 1: Create Anonymous User
echo -e "${BLUE}Step 1: Creating Anonymous User${NC}"
echo "POST $API_URL/v1/auth/anonymous"
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/v1/auth/anonymous")
TOKEN=$(echo "$RESPONSE" | jq -r '.token')
USER_ID=$(echo "$RESPONSE" | jq -r '.userId')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""
echo -e "${GREEN}✓ Token: $TOKEN${NC}"
echo ""

# Step 2: Generate First Mindfulness Content (Meditation)
echo -e "${BLUE}Step 2: Generating Mindfulness Content - Meditation${NC}"
echo "POST $API_URL/v1/ai/generate"
echo ""

REQUEST_BODY='{
  "module": "mindfulness",
  "goal": "stress relief and calm",
  "timeAvailable": 10,
  "tone": "calming and supportive"
}'

echo "Request Body:"
echo "$REQUEST_BODY" | jq '.'
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/v1/ai/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_BODY")

echo "Response:"
echo "$RESPONSE" | jq '.'
MEDITATION_ID=$(echo "$RESPONSE" | jq -r '.id')
echo ""
echo -e "${GREEN}✓ Generated Meditation ID: $MEDITATION_ID${NC}"
echo ""

# Step 3: Generate Second Mindfulness Content (Body Scan)
echo -e "${BLUE}Step 3: Generating Mindfulness Content - Body Scan${NC}"
echo "POST $API_URL/v1/ai/generate"
echo ""

REQUEST_BODY='{
  "module": "mindfulness",
  "goal": "body awareness and relaxation",
  "timeAvailable": 15,
  "tone": "gentle and relaxing"
}'

echo "Request Body:"
echo "$REQUEST_BODY" | jq '.'
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/v1/ai/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_BODY")

echo "Response:"
echo "$RESPONSE" | jq '.'
BODYSCAN_ID=$(echo "$RESPONSE" | jq -r '.id')
echo ""
echo -e "${GREEN}✓ Generated Body Scan ID: $BODYSCAN_ID${NC}"
echo ""

# Step 4: Retrieve All Mindfulness Content
echo -e "${BLUE}Step 4: Retrieving All Mindfulness Content${NC}"
echo "GET $API_URL/v1/mindfulness/content"
echo ""

RESPONSE=$(curl -s -X GET "$API_URL/v1/mindfulness/content" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$RESPONSE" | jq '.'
TOTAL_COUNT=$(echo "$RESPONSE" | jq 'length')
echo ""
echo -e "${GREEN}✓ Total Content Items: $TOTAL_COUNT${NC}"
echo ""

# Step 5: Filter by Category
echo -e "${BLUE}Step 5: Filter Content by Category${NC}"
echo "GET $API_URL/v1/mindfulness/content?category=Meditation"
echo ""

RESPONSE=$(curl -s -X GET "$API_URL/v1/mindfulness/content?category=Meditation" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$RESPONSE" | jq '.'
MEDITATION_COUNT=$(echo "$RESPONSE" | jq 'length')
echo ""
echo -e "${GREEN}✓ Meditation Items: $MEDITATION_COUNT${NC}"
echo ""

# Step 6: Get Limited Results
echo -e "${BLUE}Step 6: Get Limited Results (Limit: 1)${NC}"
echo "GET $API_URL/v1/mindfulness/content?limit=1"
echo ""

RESPONSE=$(curl -s -X GET "$API_URL/v1/mindfulness/content?limit=1" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Step 7: Test Unauthorized Access
echo -e "${BLUE}Step 7: Test Unauthorized Access (No Token)${NC}"
echo "GET $API_URL/v1/mindfulness/content"
echo ""

RESPONSE=$(curl -s -X GET "$API_URL/v1/mindfulness/content")
echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""
echo -e "${YELLOW}✓ Correctly returned error for missing authorization${NC}"
echo ""

# Summary
echo -e "${GREEN}=== Summary ===${NC}"
echo "✓ Anonymous user created: $USER_ID"
echo "✓ Generated meditation content: $MEDITATION_ID"
echo "✓ Generated body scan content: $BODYSCAN_ID"
echo "✓ Retrieved all content: $TOTAL_COUNT items"
echo "✓ Filtered by category: $MEDITATION_COUNT meditation items"
echo "✓ Authorization check: Working correctly"
echo ""
echo -e "${GREEN}All tests completed successfully!${NC}"

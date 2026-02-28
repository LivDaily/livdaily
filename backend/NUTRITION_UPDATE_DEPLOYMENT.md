# Nutrition Task Update Endpoint - Deployment Guide

## Quick Deploy Checklist

- [ ] Pull latest code
- [ ] Run tests
- [ ] Verify no errors
- [ ] Deploy to production
- [ ] Monitor logs

---

## Pre-Deployment

### 1. Verify Code Changes
```bash
# View changes
git diff src/routes/v1-modules.ts

# The PUT endpoint should be visible after POST endpoint
```

### 2. Run Tests
```bash
bash TEST_NUTRITION_UPDATE.sh
```

**Expected output**:
- 8 tests passing ✓
- All responses correct
- No errors

### 3. Verify No Database Migrations Needed
```bash
# No SQL migrations required
# No new tables needed
# Uses existing content_items table
```

---

## Deployment Steps

### Step 1: Build
```bash
npm run build
```
Should complete without errors.

### Step 2: Run Tests (Final Verification)
```bash
npm test  # if you have tests
# OR
bash TEST_NUTRITION_UPDATE.sh  # manual tests
```

### Step 3: Deploy
```bash
# Option 1: Direct deployment
npm start

# Option 2: Docker deployment
docker build -t backend:latest .
docker run -e DATABASE_URL=... backend:latest

# Option 3: Cloud deployment
# Deploy using your deployment tool (Vercel, Railway, etc.)
```

### Step 4: Verify Deployment
```bash
# Test against production API
curl -X PUT https://api.example.com/v1/nutrition/tasks/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Should return 200 with updated task
```

---

## Post-Deployment Verification

### 1. Check Logs
```bash
# Verify no errors in logs
tail -f logs/app.log | grep nutrition

# Should see: "Nutrition task updated successfully"
```

### 2. Run Health Check
```bash
# Create test task
TOKEN=$(curl -s https://api.example.com/v1/auth/anonymous | jq -r '.token')

# Update test task
curl -X PUT https://api.example.com/v1/nutrition/tasks/{id} \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"completed": true}'

# Should work without errors
```

### 3. Verify Error Handling
```bash
# Test 401 (no token)
curl -X PUT https://api.example.com/v1/nutrition/tasks/{id} -d '{}'
# Should return 401

# Test 404 (invalid ID)
curl -X PUT https://api.example.com/v1/nutrition/tasks/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer $TOKEN" -d '{}'
# Should return 404
```

---

## Rollback Plan

If issues occur:

### Quick Rollback
```bash
# Revert to previous version
git revert <commit-hash>
npm run build
npm start
```

### No Data Loss Risk
- No database changes
- No migrations
- Safe to rollback anytime
- No data loss possible

---

## Monitoring

### Key Metrics
- Response time (should be < 100ms)
- Error rate (should be < 0.1%)
- Request volume

### Logs to Monitor
```
✓ Updating nutrition task: { userId, taskId }
✓ Nutrition task updated successfully: { userId, taskId }
✗ Nutrition task not found: { userId, taskId }
✗ User does not own this nutrition task: { userId, taskId }
✗ Failed to update nutrition task: { err, userId, taskId }
```

### Alerting
Set alerts for:
- Error rate > 1%
- Response time > 500ms
- 404 errors increasing
- 403 errors increasing

---

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Cause**: Missing Bearer token
**Solution**: Include Authorization header with valid token
```bash
-H "Authorization: Bearer {token}"
```

### Issue: 403 Forbidden
**Cause**: User doesn't own the task
**Solution**: Verify you're using the same token that created the task

### Issue: 404 Not Found
**Cause**: Task doesn't exist
**Solution**: Verify task ID exists, check if it's a nutrition task

### Issue: 500 Server Error
**Cause**: Database connection or unexpected error
**Solution**:
1. Check database connection
2. Review logs for details
3. Restart application if needed

---

## Performance Baseline

After deployment, expected metrics:

| Metric | Expected |
|--------|----------|
| Response Time (p50) | < 50ms |
| Response Time (p95) | < 100ms |
| Error Rate | < 0.1% |
| Database Query Time | < 20ms |

---

## Database Verification

### Check No Schema Changes Needed
```sql
-- Verify content_items table exists
SELECT * FROM information_schema.tables
WHERE table_name = 'content_items';

-- Verify columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'content_items';

-- Should see: id, user_id, module, title, content, payload, etc.
```

### Verify Data Integrity
```sql
-- Check sample nutrition tasks
SELECT * FROM content_items
WHERE module = 'nutrition'
LIMIT 5;

-- All tasks should have user_id and id
```

---

## Documentation Link

For detailed information, see:
- NUTRITION_UPDATE_ENDPOINT.md - Full guide
- NUTRITION_UPDATE_QUICK_REF.md - Quick reference
- TEST_NUTRITION_UPDATE.sh - Test script

---

## Team Notification

### Notify Teams
- [ ] Frontend team: New PUT endpoint available
- [ ] QA team: New endpoint for testing
- [ ] Ops team: Deployed successfully
- [ ] API documentation: Updated

### Communication Template
```
PUT /v1/nutrition/tasks/:id is now live

- Update nutrition task completion and notes
- Requires authentication (Bearer token)
- Returns 404 if task not found
- Returns 403 if you don't own the task
- Full documentation: NUTRITION_UPDATE_ENDPOINT.md
```

---

## Success Criteria

Deployment is successful when:
- ✅ Tests pass (TEST_NUTRITION_UPDATE.sh)
- ✅ No errors in logs
- ✅ Health checks pass
- ✅ Can create and update tasks
- ✅ Error handling works (404, 403, 401)
- ✅ Response times < 100ms

---

## Post-Deployment Review

### 1 Hour After Deployment
- Check error logs
- Verify no spike in errors
- Test endpoint manually

### 24 Hours After Deployment
- Review metrics
- Check user feedback
- Verify performance stable

### 1 Week After Deployment
- Analyze usage patterns
- Review performance
- Plan next improvements

---

## Rollback Trigger Points

Automatic rollback if:
- Error rate > 5% for 5 minutes
- Response time > 1000ms for 5 minutes
- Database connection failures
- Critical security issue

Manual rollback if:
- Data corruption detected
- User complaints about functionality
- Critical bugs found
- Performance unacceptable

---

## Success! 🎉

Once deployment completes successfully:

1. ✅ Endpoint is live: `PUT /v1/nutrition/tasks/:id`
2. ✅ Authentication working
3. ✅ Authorization working
4. ✅ Error handling working
5. ✅ Logging working
6. ✅ No data loss
7. ✅ No performance issues

The nutrition task update feature is now available to users!

---

## Support

For issues during or after deployment:
1. Check logs: `tail -f logs/app.log`
2. Run test script: `bash TEST_NUTRITION_UPDATE.sh`
3. Review documentation: `NUTRITION_UPDATE_ENDPOINT.md`
4. Rollback if needed: `git revert <commit>`


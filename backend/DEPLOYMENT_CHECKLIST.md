# LivDaily Backend - Deployment Checklist

## Pre-Deployment (Development)

- [ ] All tests passing: `npm run test`
- [ ] TypeScript compiles: `npm run build`
- [ ] No console errors during local testing
- [ ] All endpoints tested with valid Bearer tokens
- [ ] Database migrations tested locally: `npm run db:push`
- [ ] Environment variables documented in `.env.example`
- [ ] Error handling verified for edge cases
- [ ] Logging output reviewed for sensitive data

## Database Preparation

### Neon Setup
- [ ] Create Neon project at https://console.neon.tech
- [ ] Get connection string: `postgresql://user:password@host/database`
- [ ] Store in secure environment variable manager (GitHub Secrets, etc.)
- [ ] Test connection locally with same DATABASE_URL
- [ ] Run migrations: `npm run db:push`
- [ ] Verify all tables created: `\dt` in psql

### Pre-Load Data (Optional)
- [ ] Add seed data for premium features
- [ ] Add default daily images for modules
- [ ] Add sample sleep premium content
- [ ] Run seed script: `npm run db:seed`

## Application Configuration

### Environment Variables
- [ ] `DATABASE_URL` - Neon PostgreSQL connection string
- [ ] `NODE_ENV=production`
- [ ] `LOG_LEVEL=info` (or desired level)
- [ ] All vars stored in secure manager (not in repo)

### Performance & Security
- [ ] Enable CORS headers if frontend on different domain
- [ ] Configure rate limiting if needed
- [ ] Enable HTTPS (enforced by proxy/load balancer)
- [ ] Set up security headers (HSTS, CSP, etc.)
- [ ] Configure request timeout: default 30s
- [ ] Set connection pool size for database

### Monitoring & Logging
- [ ] Set up log aggregation (CloudWatch, Datadog, etc.)
- [ ] Configure error tracking (Sentry, Rollbar, etc.)
- [ ] Set up application performance monitoring (APM)
- [ ] Create CloudWatch alarms for error rate
- [ ] Create alerts for high response times (>1000ms)

## API Endpoints Verification

### Core Endpoints
- [ ] POST /v1/auth/anonymous - Create user ✓
- [ ] GET /v1/user/profile - Retrieve profile ✓
- [ ] PUT /v1/user/profile - Update profile ✓

### Module Endpoints
- [ ] All 14 modules support GET, POST ✓
- [ ] All modules have proper auth checks ✓
- [ ] All modules return correct data format ✓

### Premium Features
- [ ] GET /v1/premium/features returns features ✓
- [ ] Sleep analysis calculates correctly ✓
- [ ] Daily images rotate properly ✓

### Settings & Preferences
- [ ] GET /v1/user/settings returns all settings ✓
- [ ] PUT /v1/user/settings updates all fields ✓
- [ ] Default preferences auto-create ✓

### Analytics Endpoints
- [ ] Movement stats: /v1/movement/stats ✓
- [ ] Sleep stats: /v1/sleep/stats ✓
- [ ] Nutrition stats: /v1/nutrition/stats ✓
- [ ] Journal stats: /v1/journal/stats ✓
- [ ] Grounding stats: /v1/grounding/stats ✓
- [ ] Mindfulness stats: /v1/mindfulness/stats ✓
- [ ] Wellness stats: /v1/wellness/stats ✓

### AI Generation
- [ ] POST /v1/ai/generate works for all modules ✓
- [ ] Module-specific prompts generating correct content ✓
- [ ] Generated content saves to database ✓

## Security Verification

### Authentication
- [ ] Bearer token validation enforced ✓
- [ ] User ID extracted correctly from token ✓
- [ ] Invalid tokens rejected with 401 ✓
- [ ] Users can only access their own data ✓

### Input Validation
- [ ] Required fields validated on POST/PUT ✓
- [ ] Type checking prevents invalid data ✓
- [ ] SQL injection prevented via ORM ✓
- [ ] XSS prevention via JSON responses ✓

### Data Protection
- [ ] Sensitive data not logged ✓
- [ ] Passwords never stored (Better Auth handles) ✓
- [ ] HTTPS enforced in production ✓
- [ ] Database backups configured ✓

## Load Testing

- [ ] Run load test: `npm run load-test`
- [ ] Verify performance under 100 concurrent users
- [ ] Check database connection pool utilization
- [ ] Verify no memory leaks after 1 hour
- [ ] Response times < 500ms for 95th percentile

## Deployment Steps

### 1. Pre-Deployment Checks
```bash
# Verify build
npm run build

# Check for TypeScript errors
npm run typecheck

# Run tests
npm run test

# Check for security vulnerabilities
npm audit
```

### 2. Database Migration (IMPORTANT)
```bash
# In staging first
DATABASE_URL=postgresql://staging npm run db:push

# Verify migration succeeded
# Check all tables exist and have data

# In production
DATABASE_URL=postgresql://production npm run db:push

# Backup before migration
# Test rollback procedure
```

### 3. Deploy Application
```bash
# Build Docker image (if using Docker)
docker build -t liqdaily-backend .

# Push to registry
docker push registry/liqdaily-backend:v1.0.0

# Deploy to production
# - Update load balancer
# - Route traffic gradually (canary deployment)
# - Monitor error rates
```

### 4. Post-Deployment Verification
- [ ] All endpoints returning 2xx responses
- [ ] Error rates < 0.1%
- [ ] Response times normal
- [ ] Database connections healthy
- [ ] Logs showing normal operation
- [ ] Monitoring dashboards updated

## Rollback Plan

If deployment fails:

1. **Immediate Actions**
   - [ ] Revert to previous application version
   - [ ] Monitor error rates and response times
   - [ ] Alert team if issues persist

2. **Database Rollback** (if migration caused issues)
   ```bash
   # Neon supports point-in-time restore
   # Contact Neon support for restoration
   ```

3. **Communication**
   - [ ] Notify users of any data loss
   - [ ] Post incident report
   - [ ] Plan fixes before re-deployment

## Post-Deployment Monitoring (First 24 Hours)

- [ ] Check error rate every hour
- [ ] Monitor response times (95th percentile < 500ms)
- [ ] Check database CPU usage (< 80%)
- [ ] Monitor memory usage (stable)
- [ ] Check logs for unexpected errors
- [ ] Verify authentication working
- [ ] Test critical user paths manually
- [ ] Monitor 3rd-party API calls (GPT-5.2)

## First Week Monitoring

- [ ] Database query performance analysis
- [ ] Identify slow endpoints and optimize
- [ ] Review user feedback and error reports
- [ ] Analyze storage usage growth
- [ ] Plan capacity scaling if needed
- [ ] Review security logs for anomalies
- [ ] Verify backup processes working

## Production Optimization (After Stability)

### Performance
- [ ] Add caching layer for premium features
- [ ] Optimize frequently-queried endpoints
- [ ] Implement connection pooling
- [ ] Use read replicas for analytics
- [ ] Archive old data (> 1 year)

### Observability
- [ ] Set up custom dashboards
- [ ] Create runbooks for common issues
- [ ] Document troubleshooting procedures
- [ ] Plan on-call rotation

### Scaling
- [ ] Monitor database growth
- [ ] Plan schema optimization
- [ ] Consider sharding if data grows > 100GB
- [ ] Review API rate limits

## Documentation

- [ ] API_ENDPOINTS.md - Keep updated ✓
- [ ] IMPLEMENTATION_SUMMARY.md - Keep updated ✓
- [ ] QUICKSTART.md - Keep updated ✓
- [ ] Create runbook for on-call
- [ ] Document known issues and workarounds
- [ ] Create troubleshooting guide
- [ ] Document scaling procedures

## Success Criteria

✅ Deployment is successful when:
- All endpoints responding correctly
- Error rate < 0.1% (< 1 error per 1000 requests)
- Response times: p95 < 500ms, p99 < 1000ms
- Database healthy (CPU < 80%, connections normal)
- No critical logs or errors
- Users can create accounts and log data
- Analytics calculations working
- AI content generation working
- No data loss compared to staging

---

## Team Responsibilities

### DevOps
- [ ] Infrastructure provisioning
- [ ] Database setup and backups
- [ ] Monitoring and alerting
- [ ] Deployment automation
- [ ] Security scanning

### Backend Team
- [ ] Code review and testing
- [ ] Database migration strategy
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] Incident response

### QA
- [ ] Endpoint testing
- [ ] Load testing
- [ ] Security testing
- [ ] Data validation
- [ ] Regression testing

### Product
- [ ] Approval for deployment
- [ ] Communication with users
- [ ] Feature validation
- [ ] Success metric monitoring

---

## Contact & Escalation

### Issues During Deployment
- **Database Issues**: Contact Neon support (@neon.tech)
- **Application Errors**: Check CloudWatch logs
- **Performance Issues**: Check database query performance
- **Urgent Issues**: Page on-call engineer

### Emergency Rollback
- **Contact**: Platform Engineering team
- **Process**: Revert to previous tag, restore from backup
- **Communication**: Notify stakeholders immediately

---

## Sign-Off

- [ ] DevOps Lead: _________________ Date: _____
- [ ] Backend Lead: _________________ Date: _____
- [ ] QA Lead: _________________ Date: _____
- [ ] Product Manager: _________________ Date: _____


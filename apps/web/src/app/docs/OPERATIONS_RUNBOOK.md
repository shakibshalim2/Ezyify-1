# EZYIFY Escrow System - Operations Runbook

**For:** DevOps, Site Reliability Engineers, Operations Team  
**Purpose:** Standard operating procedures for production system  
**Last Updated:** January 19, 2026

---

## 📋 Daily Operations Checklist

### Morning Routine (9:00 AM)

**1. System Health Check (15 minutes)**
```bash
# Check system uptime
curl -I https://api.ezyify.app/health

# Check escrow service status
curl https://api.ezyify.app/api/escrow/health

# Review overnight error logs
tail -n 1000 /var/log/ezyify/errors.log | grep "ERROR"

# Check database connections
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

**Expected Results:**
- ✅ HTTP 200 on all endpoints
- ✅ < 50 errors in last 24 hours
- ✅ Database connections < 80% capacity

**Alert if:**
- ❌ HTTP 500/503 errors
- ❌ > 100 errors in last 24 hours
- ❌ Database connections > 80%

---

**2. Financial Reconciliation (20 minutes)**
```sql
-- Check escrow balance
SELECT SUM(amount) as total_escrow 
FROM orders 
WHERE payment_status IN ('in-escrow', 'holding');

-- Check pending withdrawals
SELECT COUNT(*), SUM(amount) 
FROM withdrawals 
WHERE status = 'pending';

-- Check failed transactions
SELECT COUNT(*) 
FROM withdrawals 
WHERE status = 'failed' 
AND created_at > NOW() - INTERVAL '24 hours';
```

**Expected Results:**
- ✅ Escrow balance matches accounting records
- ✅ Pending withdrawals < 100 items
- ✅ Failed transactions < 5 in last 24h

**Action Items:**
- Reconcile any discrepancies
- Process pending withdrawals
- Investigate failed transactions

---

**3. Security Review (10 minutes)**
```sql
-- Check flagged accounts
SELECT COUNT(*) 
FROM user_security_events 
WHERE severity = 'high' 
AND reviewed = false;

-- Check failed login attempts
SELECT user_id, COUNT(*) 
FROM login_attempts 
WHERE success = false 
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id 
HAVING COUNT(*) > 5;

-- Check suspicious withdrawals
SELECT * 
FROM withdrawals 
WHERE flagged = true 
AND status = 'under-review';
```

**Expected Results:**
- ✅ < 10 high-severity unreviewed events
- ✅ < 5 accounts with excessive failed logins
- ✅ All flagged withdrawals under review

**Action Items:**
- Review high-severity events
- Lock accounts with excessive failed logins
- Investigate flagged withdrawals

---

### Midday Check (1:00 PM)

**1. Performance Metrics (10 minutes)**
```bash
# Check API response times
curl https://api.ezyify.app/api/metrics/performance

# Check database query performance
psql -c "SELECT query, mean_exec_time 
FROM pg_stat_statements 
WHERE mean_exec_time > 100 
ORDER BY mean_exec_time DESC 
LIMIT 10;"

# Check cache hit rate
redis-cli INFO stats | grep hit_rate
```

**Expected Results:**
- ✅ API response time < 500ms (p95)
- ✅ No queries > 100ms
- ✅ Cache hit rate > 80%

---

**2. User Activity Monitoring (10 minutes)**
```sql
-- Check active users
SELECT COUNT(DISTINCT user_id) 
FROM sessions 
WHERE last_activity > NOW() - INTERVAL '1 hour';

-- Check transaction volume
SELECT COUNT(*) 
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Check withdrawal volume
SELECT COUNT(*), SUM(amount) 
FROM withdrawals 
WHERE created_at > NOW() - INTERVAL '1 hour';
```

**Expected Results:**
- ✅ Active users within normal range
- ✅ Transaction volume within expected range
- ✅ Withdrawal volume < $50,000/hour

---

### Evening Routine (6:00 PM)

**1. Daily Report Generation (15 minutes)**
```sql
-- Generate daily financial report
SELECT 
  COUNT(*) as total_transactions,
  SUM(amount) as total_volume,
  AVG(amount) as average_transaction,
  COUNT(DISTINCT user_id) as unique_users
FROM orders 
WHERE DATE(created_at) = CURRENT_DATE;

-- Generate withdrawal report
SELECT 
  COUNT(*) as total_withdrawals,
  SUM(amount) as total_withdrawn,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM withdrawals 
WHERE DATE(created_at) = CURRENT_DATE;

-- Generate escrow report
SELECT 
  payment_status,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM orders 
WHERE payment_status IN ('in-escrow', 'holding', 'released')
GROUP BY payment_status;
```

**Action Items:**
- Email daily report to stakeholders
- Flag any anomalies
- Update dashboard

---

**2. Backup Verification (10 minutes)**
```bash
# Verify database backup
ls -lh /backups/database/ | tail -5

# Check backup age
find /backups/database/ -name "*.sql.gz" -mtime 0

# Test backup restore (staging)
# Run weekly, not daily
```

**Expected Results:**
- ✅ Backup file exists from today
- ✅ Backup size within normal range
- ✅ No errors in backup log

---

## 🔄 Weekly Operations

### Monday: Weekly Planning

**1. Review Last Week's Metrics (30 minutes)**
```sql
-- Weekly financial summary
SELECT 
  DATE(created_at) as date,
  COUNT(*) as transactions,
  SUM(amount) as volume
FROM orders 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- Weekly withdrawal summary
SELECT 
  DATE(created_at) as date,
  COUNT(*) as withdrawals,
  SUM(amount) as amount
FROM withdrawals 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- KYC completion rate
SELECT 
  COUNT(CASE WHEN kyc_status = 'verified' THEN 1 END) * 100.0 / COUNT(*) as completion_rate
FROM users 
WHERE created_at > NOW() - INTERVAL '7 days';
```

**Action Items:**
- Create weekly report
- Identify trends
- Plan week ahead

---

### Wednesday: Security Audit

**1. Review Security Events (45 minutes)**
```sql
-- High-risk accounts
SELECT 
  u.id,
  u.email,
  s.risk_level,
  s.security_score,
  COUNT(se.id) as event_count
FROM users u
JOIN user_security s ON u.id = s.user_id
LEFT JOIN security_events se ON u.id = se.user_id
WHERE s.risk_level = 'high'
GROUP BY u.id, u.email, s.risk_level, s.security_score
ORDER BY event_count DESC;

-- Unusual withdrawal patterns
SELECT 
  user_id,
  COUNT(*) as withdrawal_count,
  SUM(amount) as total_amount,
  MAX(amount) as max_amount
FROM withdrawals 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id 
HAVING COUNT(*) > 10 OR SUM(amount) > 5000
ORDER BY total_amount DESC;
```

**Action Items:**
- Review flagged accounts
- Update security policies
- Implement additional checks if needed

---

### Friday: Performance Optimization

**1. Database Optimization (60 minutes)**
```sql
-- Find slow queries
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements 
WHERE mean_exec_time > 50
ORDER BY total_exec_time DESC 
LIMIT 20;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes 
WHERE idx_scan = 0
ORDER BY relname;

-- Check table bloat
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Action Items:**
- Optimize slow queries
- Remove unused indexes
- Schedule VACUUM if needed

---

**2. Cache Optimization (30 minutes)**
```bash
# Review cache statistics
redis-cli INFO stats

# Check memory usage
redis-cli INFO memory

# Review most accessed keys
redis-cli --bigkeys

# Check expired keys
redis-cli INFO keyspace
```

**Action Items:**
- Adjust TTL for frequently accessed data
- Clear stale cache entries
- Monitor cache hit rate

---

## 🚨 Incident Response Procedures

### Severity Levels

**P0 - Critical (< 30 min response)**
- System down
- Payment processing failed
- Data breach
- Security incident

**P1 - High (< 2 hour response)**
- Partial outage
- Performance degradation
- API errors > 10%
- Withdrawal processing delayed

**P2 - Medium (< 4 hour response)**
- Non-critical feature broken
- UI issues
- Slow response times
- Minor bugs

**P3 - Low (< 24 hour response)**
- Cosmetic issues
- Documentation updates
- Enhancement requests

---

### P0 Incident: System Down

**Immediate Actions (5 minutes):**
1. Post status page update
2. Page on-call engineer
3. Start incident bridge
4. Begin root cause investigation

**Investigation (15 minutes):**
```bash
# Check system health
systemctl status ezyify-api
systemctl status ezyify-worker
systemctl status nginx

# Check logs
tail -f /var/log/ezyify/application.log
tail -f /var/log/nginx/error.log

# Check database
psql -c "SELECT pg_is_in_recovery();"

# Check external services
curl https://status.stripe.com
```

**Resolution:**
1. Identify root cause
2. Apply fix
3. Test thoroughly
4. Deploy fix
5. Monitor closely
6. Update status page
7. Post-mortem within 48 hours

---

### P0 Incident: Payment Processing Failed

**Immediate Actions (5 minutes):**
1. Alert finance team
2. Disable new orders temporarily
3. Investigate payment gateway

**Investigation (10 minutes):**
```bash
# Check payment gateway status
curl https://api.stripe.com/v1/health

# Review failed payments
tail -n 500 /var/log/ezyify/payments.log | grep "FAILED"

# Check database
psql -c "SELECT COUNT(*) FROM orders 
WHERE payment_status = 'failed' 
AND created_at > NOW() - INTERVAL '1 hour';"
```

**Resolution:**
1. Identify issue (gateway down, API key expired, etc.)
2. Fix or fail over to backup gateway
3. Reprocess failed payments
4. Re-enable orders
5. Monitor payment success rate
6. Notify affected users

---

### P1 Incident: Escrow Release Delayed

**Immediate Actions (15 minutes):**
1. Identify affected orders
2. Notify affected sellers
3. Begin investigation

**Investigation:**
```sql
-- Find orders past release date
SELECT 
  o.id,
  o.user_id,
  o.delivery_date,
  o.payment_status,
  NOW() - (o.delivery_date + INTERVAL '7 days') as overdue_by
FROM orders o
WHERE o.delivery_date IS NOT NULL
AND o.payment_status = 'holding'
AND NOW() > (o.delivery_date + INTERVAL '7 days')
ORDER BY overdue_by DESC;
```

**Resolution:**
1. Check cron job status
2. Manually trigger release for affected orders
3. Fix automation issue
4. Verify funds released
5. Notify sellers

---

## 📊 Monitoring & Alerts

### Critical Alerts (Immediate Action)

**1. High Error Rate**
```
Alert: Error rate > 5% for 5 minutes
Action: Investigate logs, rollback if recent deploy
```

**2. Database Connection Pool Exhausted**
```
Alert: Database connections > 90%
Action: Identify slow queries, kill long-running transactions
```

**3. Escrow Balance Mismatch**
```
Alert: Escrow balance != sum of pending orders
Action: Run reconciliation, investigate discrepancy
```

**4. Failed Withdrawal Spike**
```
Alert: Failed withdrawals > 10 in 10 minutes
Action: Check payment gateway, review error logs
```

---

### Warning Alerts (Monitor Closely)

**1. Slow API Response**
```
Alert: p95 response time > 1000ms
Action: Review slow endpoints, check database
```

**2. Low Cache Hit Rate**
```
Alert: Cache hit rate < 70%
Action: Review cache strategy, increase TTL
```

**3. High Security Event Rate**
```
Alert: Security events > 50/hour
Action: Review events, look for patterns
```

---

## 🔧 Maintenance Procedures

### Weekly Maintenance Window (Sunday 2-4 AM UTC)

**Pre-Maintenance Checklist:**
- [ ] Notify users 24 hours in advance
- [ ] Post maintenance banner on site
- [ ] Backup database
- [ ] Prepare rollback plan
- [ ] Alert on-call team

**Maintenance Tasks:**
```sql
-- Vacuum database
VACUUM ANALYZE;

-- Reindex tables
REINDEX DATABASE ezyify;

-- Update statistics
ANALYZE;

-- Clean old logs
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM session_logs WHERE created_at < NOW() - INTERVAL '30 days';

-- Archive old orders
INSERT INTO orders_archive 
SELECT * FROM orders 
WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM orders 
WHERE created_at < NOW() - INTERVAL '1 year';
```

**Post-Maintenance Verification:**
- [ ] Run smoke tests
- [ ] Check error logs
- [ ] Verify key metrics
- [ ] Remove maintenance banner
- [ ] Post completion notice

---

### Monthly Maintenance (First Sunday)

**Security Updates:**
```bash
# Update system packages
apt-get update
apt-get upgrade

# Update Node.js dependencies
npm audit fix

# Rotate secrets
# Update API keys
# Rotate database passwords
```

**Performance Review:**
```sql
-- Review index performance
SELECT * FROM pg_stat_user_indexes 
WHERE idx_scan < 1000 
ORDER BY idx_scan;

-- Review table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

**Compliance:**
- Review audit logs
- Export required reports
- Update documentation
- Review access controls

---

## 📈 Scaling Procedures

### When to Scale

**Scale Up (Vertical) When:**
- CPU usage > 70% sustained
- Memory usage > 80% sustained
- Database queries consistently slow

**Scale Out (Horizontal) When:**
- Request rate > 10,000/min
- Response time p95 > 1000ms despite optimization
- Single server capacity reached

### Scaling Checklist

**1. Application Servers:**
```bash
# Deploy new instance
terraform apply -var="instance_count=3"

# Verify health
curl https://new-instance.ezyify.app/health

# Add to load balancer
aws elb register-instances-with-load-balancer

# Monitor traffic distribution
watch -n 5 'aws elb describe-instance-health'
```

**2. Database:**
```bash
# Create read replica
aws rds create-db-instance-read-replica

# Update application config to use read replica for reads

# Monitor replication lag
psql -c "SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;"
```

**3. Cache:**
```bash
# Scale Redis cluster
redis-cli CLUSTER REPLICATE <node-id>

# Verify cluster health
redis-cli CLUSTER INFO
```

---

## 🔐 Security Operations

### Daily Security Tasks

**1. Review Failed Logins**
```sql
SELECT 
  user_id,
  ip_address,
  COUNT(*) as attempts,
  MAX(attempted_at) as last_attempt
FROM login_attempts 
WHERE success = false 
AND attempted_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, ip_address 
HAVING COUNT(*) > 5;
```

**Action:** Lock accounts with excessive failures

**2. Review Suspicious Withdrawals**
```sql
SELECT 
  w.*,
  u.email,
  u.created_at as account_created,
  s.security_score,
  s.risk_level
FROM withdrawals w
JOIN users u ON w.user_id = u.id
JOIN user_security s ON u.id = s.user_id
WHERE w.created_at > NOW() - INTERVAL '24 hours'
AND (
  w.amount > 400 OR
  s.risk_level = 'high' OR
  s.security_score < 50 OR
  u.created_at > NOW() - INTERVAL '14 days'
)
ORDER BY w.amount DESC;
```

**Action:** Flag for manual review

---

### Weekly Security Audit

**1. Review Access Logs**
```bash
# Unusual access patterns
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -20

# Failed authentication attempts
grep "401" /var/log/nginx/access.log | wc -l

# Unusual user agents
awk -F'"' '{print $6}' /var/log/nginx/access.log | sort | uniq -c | sort -nr
```

**2. Review KYC Status**
```sql
-- Users with pending KYC
SELECT COUNT(*) 
FROM users 
WHERE kyc_status = 'pending-review';

-- Rejected KYC
SELECT 
  user_id,
  rejection_reason,
  COUNT(*) as attempt_count
FROM kyc_submissions 
WHERE status = 'rejected'
GROUP BY user_id, rejection_reason;
```

---

## 📞 On-Call Procedures

### On-Call Responsibilities

**1. Monitor Alerts**
- PagerDuty notifications
- Slack alerts
- Email notifications

**2. First Response**
- Acknowledge alert within 5 minutes
- Assess severity
- Begin investigation

**3. Escalation**
- Escalate P0 incidents immediately
- Loop in specialists as needed
- Keep stakeholders informed

### On-Call Rotation

**Schedule:**
- Week 1: Engineer A
- Week 2: Engineer B
- Week 3: Engineer C
- Week 4: Engineer D

**Handoff Checklist:**
- Review open incidents
- Share ongoing issues
- Update runbook
- Test pager

---

## 📝 Runbook Maintenance

**Update Frequency:**
- After each incident (post-mortem)
- After major changes
- Monthly review

**Review Process:**
- Engineering team review
- DevOps approval
- Version control
- Change log

---

**Last Updated:** January 19, 2026  
**Version:** 1.0  
**Next Review:** February 19, 2026  
**Owner:** DevOps Team

---

*This runbook is a living document. Update it as procedures evolve.*

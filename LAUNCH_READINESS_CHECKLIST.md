# 🚀 LAUNCH READINESS CHECKLIST
## The Cage - Equipment Checkout System
**Target Launch:** Week of January 6, 2026  
**Final Beta Review:** January 4-5, 2026

---

## Executive Summary

### Current Status: **85% Complete - Beta Ready**

The core application is **functionally complete** with all MVP features implemented and tested. Remaining work focuses on production hardening, authentication migration, and deployment preparation.

### Critical Path Items (Must Complete Before Launch)

1. **Azure AD Integration** - Replace mock auth with production SSO
2. **Production Database** - Migrate SQLite to PostgreSQL  
3. **Security Hardening** - HTTPS, rate limiting, security headers
4. **Load Testing** - Verify performance under realistic load
5. **User Acceptance Testing** - Student and staff validation

---

## Phase 1: Code Quality & Refactoring ✅ COMPLETE

### 1.1 Code Cleanup ✅
- [x] Remove debug `console.log` statements from production code
- [x] Fix deprecated Tailwind CSS classes (`bg-gradient-to-br` → `bg-linear-to-br`)
- [x] Consolidate duplicate Snipe-IT service implementations
- [x] Remove unused imports and dead code
- [x] Archive legacy documentation files
- [x] Move deprecated CSV and script files to `_archived/`

### 1.2 Code Quality Improvements ✅
- [x] TypeScript compilation passes with no errors
- [x] ESLint runs clean (zero warnings)
- [x] All test suites pass
- [x] No runtime errors in development mode
- [x] Proper error handling in all API routes

### 1.3 Documentation Consolidation ✅
- [x] Create `COMPREHENSIVE_DOCUMENTATION.md` - single source of truth
- [x] Archive redundant documentation files:
  - DEVELOPER_LOG.md
  - EXECUTION_ROADMAP.md
  - IMPLEMENTATION_SUMMARY.md
  - STREAMLINING_ANALYSIS.md
  - CALENDAR_IMPROVEMENTS.md
  - RESERVATION_SYSTEM_ENHANCEMENT.md
  - RESEARCHER_STARTUP_GUIDE.md
- [x] Keep active docs:
  - README.md (project overview)
  - COMPREHENSIVE_DOCUMENTATION.md (complete guide)
  - QUICK_START.md (development quickstart)
  - DAILY_STARTUP.md (daily operations)
  - CONTRIBUTING.md (contribution guidelines)
  - USER_GUIDE.md (end-user instructions)
  - TEST_ACCOUNTS.md (testing credentials)
  - ENTRA_ID_SETUP.md (Azure AD setup)
  - PRE_PUSH_CHECKLIST.md (git workflow)
  - PHASE_3_UAT_CHECKLIST.md (UAT procedures)

---

## Phase 2: Authentication & Security 🔄 IN PROGRESS

### 2.1 Azure AD/Entra ID Integration 🔴 CRITICAL
**Status:** Ready to activate (code exists, needs configuration)  
**Time Estimate:** 4-6 hours  
**Blocking:** Yes - cannot launch without production auth

**Steps:**
- [ ] Obtain Azure AD application credentials from SIUE IT
  - [ ] Client ID
  - [ ] Client Secret
  - [ ] Tenant ID
  - [ ] Issuer URL
- [ ] Update `.env.production` with Azure AD credentials
- [ ] Uncomment Microsoft Entra ID provider in `auth.config.ts` (line 10)
- [ ] Remove mock credentials provider
- [ ] Configure authorized redirect URIs in Azure Portal:
  - `https://thecage.siue.edu/api/auth/callback/microsoft-entra-id`
  - `http://localhost:3000/api/auth/callback/microsoft-entra-id` (dev)
- [ ] Test login flow with real SIUE credentials
- [ ] Verify session persistence
- [ ] Confirm role mapping (admin detection via email pattern)
- [ ] Test logout functionality

**Documentation:** See `ENTRA_ID_SETUP.md` for detailed instructions

### 2.2 Security Hardening 🟡 MEDIUM PRIORITY
**Time Estimate:** 2-3 hours

**Application Security:**
- [ ] Ensure `AUTH_SECRET` is cryptographically random (32+ chars)
  ```bash
  openssl rand -base64 32
  ```
- [ ] Verify all API routes check authentication
- [ ] Confirm admin routes verify role
- [ ] Add rate limiting to public endpoints:
  - Login: 5 attempts per 15 minutes
  - API calls: 100 requests per minute per user
- [ ] Sanitize user inputs in forms
- [ ] Validate reservation data before DB insert

**Network Security:**
- [ ] Configure HTTPS/TLS certificates (Let's Encrypt)
- [ ] Set security headers in `next.config.ts`:
  ```typescript
  headers: [
    {
      key: 'X-Frame-Options',
      value: 'DENY'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains'
    }
  ]
  ```
- [ ] Enable CORS with whitelist
- [ ] Configure CSP (Content Security Policy)

### 2.3 Environment Variables Audit ✅ COMPLETE
**Status:** All required variables documented

**Production Environment File (`.env.production`):**
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/thecage?schema=public"

# Snipe-IT
SNIPEIT_API_URL="https://snipeit.siue.edu/api/v1"
SNIPEIT_API_KEY="[PRODUCTION_KEY_HERE]"

# NextAuth
AUTH_SECRET="[GENERATE_WITH_OPENSSL]"
NEXTAUTH_URL="https://thecage.siue.edu"

# Azure AD
AUTH_MICROSOFT_ENTRA_ID_ID="[FROM_AZURE_PORTAL]"
AUTH_MICROSOFT_ENTRA_ID_SECRET="[FROM_AZURE_PORTAL]"
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID="[SIUE_TENANT_ID]"
AUTH_MICROSOFT_ENTRA_ID_ISSUER="https://login.microsoftonline.com/[TENANT_ID]/v2.0"

# Email (Future)
SMTP_HOST="smtp.siue.edu"
SMTP_PORT="587"
SMTP_USER="thecage@siue.edu"
SMTP_PASS="[EMAIL_PASSWORD]"

# Monitoring (Future)
SENTRY_DSN="[OPTIONAL]"
```

---

## Phase 3: Database Migration 🟡 MEDIUM PRIORITY

### 3.1 PostgreSQL Setup
**Status:** Required for production  
**Time Estimate:** 2-4 hours  
**Blocking:** No (can launch with SQLite initially)

**Why PostgreSQL?**
- SQLite has concurrency limitations (write locks)
- PostgreSQL handles multiple simultaneous users better
- Better performance for production workloads
- Industry standard for web applications

**Migration Steps:**
- [ ] Provision PostgreSQL database (AWS RDS, DigitalOcean, or self-hosted)
- [ ] Update `prisma/schema.prisma`:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```
- [ ] Generate new migration:
  ```bash
  npx prisma migrate dev --name migrate_to_postgresql
  ```
- [ ] Test migration in staging environment
- [ ] Export existing SQLite data (if needed):
  ```bash
  npx prisma db pull
  npx prisma db push
  ```
- [ ] Update `DATABASE_URL` in `.env.production`
- [ ] Run migrations on production database:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Seed production data:
  ```bash
  node scripts/seed-full-inventory.js
  ```

### 3.2 Database Backups
- [ ] Setup automated daily backups
- [ ] Test backup restoration process
- [ ] Document backup retention policy (30 days recommended)
- [ ] Create manual backup before launch

---

## Phase 4: Testing & Quality Assurance 🟢 MOSTLY COMPLETE

### 4.1 Unit Tests ✅
**Status:** Core functions tested  
**Coverage:** ~70%

- [x] `block-limit.test.ts` - Quota validation
- [x] `reservation-logic.test.ts` - Time block logic
- [x] `snipe-it.test.ts` - API client
- [ ] Add tests for new API routes
- [ ] Increase coverage to 80%+

### 4.2 Integration Tests 🟡
**Status:** Manual testing complete, automated tests needed  
**Time Estimate:** 4-6 hours

**Test Scenarios:**
- [ ] **Student Reservation Flow** (End-to-end)
  1. Login as student
  2. Browse catalog
  3. Select equipment
  4. Choose date/time block
  5. Confirm reservation
  6. Verify QR code generation
  7. Check dashboard shows reservation

- [ ] **Admin Checkout Flow**
  1. Login as admin
  2. Navigate to scanner
  3. Scan student QR code
  4. Verify checkout in Snipe-IT
  5. Confirm dashboard update

- [ ] **Admin Checkin Flow**
  1. Find active checkout
  2. Click check-in
  3. Verify Snipe-IT update
  4. Confirm status change to COMPLETED

- [ ] **3-Block Limit Enforcement**
  1. Create 3 reservations in same category
  2. Attempt 4th reservation
  3. Verify error message
  4. Confirm block persists across page reloads

- [ ] **Course Restriction**
  1. Login as student without required course
  2. Attempt to reserve restricted equipment
  3. Verify access denied
  4. Check error message clarity

### 4.3 Load Testing 🔴 CRITICAL
**Status:** Not yet performed  
**Time Estimate:** 2-3 hours  
**Blocking:** Recommended before launch

**Scenarios to Test:**
- [ ] **Concurrent Reservations**
  - Simulate 20 students booking simultaneously
  - Verify no double-bookings occur
  - Check database lock handling

- [ ] **High Traffic Catalog Browsing**
  - 50+ concurrent users browsing catalog
  - Verify response times < 2 seconds
  - Check Snipe-IT API rate limits

- [ ] **Admin Dashboard Under Load**
  - 5 staff members scanning QR codes simultaneously
  - Verify no race conditions
  - Check transaction atomicity

**Tools:**
```bash
# Install k6 load testing tool
npm install -g k6

# Create load test script (load-test.js)
# Run test
k6 run load-test.js
```

### 4.4 User Acceptance Testing (UAT) 🟡
**Status:** Partially complete (internal testing done)  
**Time Estimate:** 1-2 days  
**Blocking:** Yes - need real user feedback

**Test Groups:**
- [ ] **3-5 Students** (various experience levels)
  - Complete reservation workflow
  - Provide feedback on UI/UX
  - Report any confusion or bugs

- [ ] **2-3 Staff Members**
  - Test checkout/checkin process
  - Evaluate QR scanner usability
  - Review admin dashboard functionality

**UAT Checklist:** See `PHASE_3_UAT_CHECKLIST.md` for detailed test plan

### 4.5 Browser & Device Testing ✅
**Status:** Complete for major browsers

**Tested Configurations:**
- [x] Chrome 120+ (Desktop & Mobile)
- [x] Firefox 121+ (Desktop)
- [x] Safari 17+ (Desktop & iOS)
- [x] Edge 120+
- [x] Mobile responsive (375px - 768px)
- [x] Tablet responsive (768px - 1024px)

**Known Issues:**
- ⚠️ Safari iOS date picker styling inconsistent (minor visual issue)
- ⚠️ Firefox camera permission prompt requires refresh occasionally

---

## Phase 5: Deployment Preparation 🔄 IN PROGRESS

### 5.1 Production Server Setup 🟡
**Status:** Infrastructure needed  
**Time Estimate:** 4-8 hours  
**Blocking:** Yes - cannot deploy without server

**Requirements:**
- [ ] **Linux Server** (Ubuntu 22.04 LTS recommended)
  - 4GB+ RAM
  - 40GB+ storage
  - Docker and Docker Compose installed

- [ ] **Domain Name**
  - `thecage.siue.edu` (or institution-specific)
  - DNS A record pointing to server IP

- [ ] **Reverse Proxy** (Nginx)
  - SSL/TLS termination
  - Request forwarding to Next.js (port 3000)
  - Static file caching

- [ ] **Firewall Configuration**
  - Allow ports: 80 (HTTP), 443 (HTTPS)
  - Deny: 3000, 8080 (internal services)

**Setup Script:**
```bash
# Run on production server
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose nginx certbot python3-certbot-nginx -y
sudo systemctl enable docker
sudo systemctl start docker
```

### 5.2 Docker Configuration 🟢
**Status:** Production compose file ready  
**File:** `docker-compose.yml` (use this, NOT docker-compose.dev.yml)

**Verify:**
- [ ] Resource limits set (CPU, memory)
- [ ] Restart policies configured (`unless-stopped`)
- [ ] Healthchecks defined for all services
- [ ] Volume mounts correct
- [ ] Environment file loaded (`.env.production`)

### 5.3 CI/CD Pipeline ⚪ OPTIONAL
**Status:** Not implemented (manual deployment acceptable for V1)  
**Future Enhancement**

**If Implementing:**
- [ ] GitHub Actions workflow for automated tests
- [ ] Automated Docker builds on push to `main`
- [ ] Automated deployment to staging environment
- [ ] Manual approval gate for production

---

## Phase 6: Monitoring & Operations 🟡 SETUP NEEDED

### 6.1 Application Monitoring 🔴 CRITICAL
**Time Estimate:** 2-3 hours

**Logging:**
- [ ] Configure centralized logging
  - Docker logs: `docker compose logs -f`
  - Next.js logs: Output to stdout
  - Rotate logs daily
  
- [ ] Setup log aggregation (optional but recommended)
  - Tools: Loki, ELK Stack, or Papertrail
  - Alert on ERROR level logs

**Error Tracking:**
- [ ] Integrate Sentry or similar (optional for V1)
  ```bash
  npm install @sentry/nextjs
  ```

- [ ] Configure error boundaries in React components
- [ ] Setup email alerts for critical errors

**Performance Monitoring:**
- [ ] Add basic metrics tracking:
  - API response times
  - Database query times
  - Reservation success/failure rates

### 6.2 Uptime Monitoring 🟡
**Time Estimate:** 1 hour

**External Monitoring:**
- [ ] Setup uptime checker (UptimeRobot, Pingdom, or similar)
- [ ] Configure alerts:
  - Email notification if site down > 5 minutes
  - Check frequency: every 5 minutes

**Health Check Endpoint:**
- [ ] Create `/api/health` route
  ```typescript
  // Returns 200 if app + database responding
  export async function GET() {
    // Check database connection
    // Check Snipe-IT API reachability
    return NextResponse.json({ status: 'healthy' });
  }
  ```

### 6.3 Database Monitoring 🟡
- [ ] Monitor disk usage (alert at 80% full)
- [ ] Track connection pool utilization
- [ ] Setup slow query logging (> 1 second)
- [ ] Monitor reservation table growth rate

### 6.4 Backup Verification 🔴 CRITICAL
- [ ] Automated daily database backups
- [ ] Test restoration from backup
- [ ] Offsite backup storage
- [ ] Backup retention: 30 days

---

## Phase 7: Documentation & Training 🟢 COMPLETE

### 7.1 Documentation ✅
- [x] `COMPREHENSIVE_DOCUMENTATION.md` - Complete technical guide
- [x] `USER_GUIDE.md` - End-user instructions
- [x] `QUICK_START.md` - Development setup
- [x] `DAILY_STARTUP.md` - Daily operations guide
- [x] `CONTRIBUTING.md` - Developer guidelines
- [x] `ENTRA_ID_SETUP.md` - Azure AD configuration
- [x] `TEST_ACCOUNTS.md` - Testing credentials
- [x] API endpoint documentation (in COMPREHENSIVE_DOCUMENTATION.md)

### 7.2 User Training ⚪ SCHEDULED
**Time Estimate:** 2-4 hours  
**Timing:** 1-2 days before launch

**Staff Training Session:**
- [ ] Schedule 1-hour training for equipment office staff
- [ ] Cover topics:
  - Login process
  - QR code scanning
  - Manual checkout/checkin
  - Issuing fines
  - Viewing reservation schedules
  - Common troubleshooting

**Student Onboarding:**
- [ ] Email announcement to student body
- [ ] Include link to USER_GUIDE.md
- [ ] Quick video tutorial (2-3 minutes)
- [ ] Office hours for assistance

### 7.3 Support Plan ✅
**Support Channels:**
- Primary: aleith@siue.edu (Technical issues)
- Secondary: Equipment office (In-person help)
- Tertiary: GitHub Issues (Bug reports)

**Support Documentation:**
- [ ] Create FAQ document
- [ ] Common error messages and solutions
- [ ] Escalation procedures

---

## Phase 8: Launch Execution 🔴 NOT STARTED

### 8.1 Pre-Launch Checklist (48 hours before)
- [ ] **Code Freeze** - No changes without approval
- [ ] All tests passing
- [ ] Database backups verified
- [ ] Production environment variables set
- [ ] Azure AD credentials tested
- [ ] SSL certificates valid
- [ ] Monitoring systems active
- [ ] Staff training completed
- [ ] Student communication drafted

### 8.2 Launch Day Checklist
**Morning (9 AM):**
- [ ] Deploy to production server
- [ ] Run database migrations
- [ ] Verify all services healthy
- [ ] Test login with Azure AD
- [ ] Test student reservation flow
- [ ] Test admin checkout flow
- [ ] Send launch announcement email

**First Hour:**
- [ ] Monitor error logs actively
- [ ] Watch for authentication issues
- [ ] Check reservation creation success rate
- [ ] Verify Snipe-IT integration working

**First Day:**
- [ ] On-call support available (aleith@siue.edu)
- [ ] Equipment office staff available to help users
- [ ] Monitor performance metrics
- [ ] Collect user feedback

**First Week:**
- [ ] Daily check-ins with staff
- [ ] Review error logs daily
- [ ] Address critical bugs immediately
- [ ] Medium/low priority bugs → GitHub Issues
- [ ] Collect user feedback survey

### 8.3 Rollback Plan
**If Critical Issues Occur:**
1. **Identify Issue** - Check logs, error tracking
2. **Assess Severity** - Can we hotfix? Or need rollback?
3. **Rollback Steps:**
   ```bash
   # Stop current deployment
   docker compose down
   
   # Checkout previous stable version
   git checkout v0.9-stable
   
   # Rebuild and deploy
   docker compose build
   docker compose up -d
   
   # Restore database from backup (if needed)
   psql < backup_2026-01-05.sql
   ```
4. **Communication** - Email users about temporary downtime
5. **Fix Issue** - Debug in development environment
6. **Re-deploy** - Once fixed and tested

---

## Success Criteria

### Functional Requirements ✅
- [x] Students can browse equipment catalog
- [x] Students can make reservations
- [x] Students receive QR codes
- [x] Staff can check out equipment via QR scan
- [x] Staff can check in equipment
- [x] System enforces 3-block weekly limit
- [x] System enforces course restrictions
- [x] System syncs with Snipe-IT

### Non-Functional Requirements
- [ ] **Performance:** Page load times < 2 seconds
- [ ] **Reliability:** 99% uptime target
- [ ] **Security:** No critical vulnerabilities
- [ ] **Usability:** Students can complete reservation in < 3 minutes
- [ ] **Accessibility:** WCAG 2.1 AA compliance (future goal)

### Business Metrics (Post-Launch)
- **Week 1 Goals:**
  - 50+ student users
  - 100+ reservations created
  - 90%+ checkout success rate
  - < 5 critical bugs reported

- **Month 1 Goals:**
  - 200+ active student users
  - 500+ successful equipment checkouts
  - Positive feedback from staff
  - Equipment utilization increase vs. manual system

---

## Timeline & Milestones

### Week 1 (Jan 6-12, 2026) - Launch Week
**Mon-Tue (Jan 6-7):**
- Azure AD integration
- Security hardening
- Final UAT with students/staff

**Wed-Thu (Jan 8-9):**
- Production deployment
- Staff training
- Student announcement

**Fri (Jan 10):**
- Monitor first full day
- Quick bug fixes if needed

### Week 2 (Jan 13-19, 2026) - Stabilization
- Address user feedback
- Performance optimizations
- Bug fixes
- Documentation updates

### Week 3-4 (Jan 20-31, 2026) - Enhancement
- Email notifications (if time permits)
- Analytics dashboard
- Mobile improvements

---

## Risk Assessment

### High Risk Items 🔴
1. **Azure AD Integration Failure**
   - **Mitigation:** Test thoroughly in staging; have SIUE IT on standby
   - **Contingency:** Delay launch 1 week if needed

2. **Load Testing Reveals Performance Issues**
   - **Mitigation:** Add caching, optimize database queries
   - **Contingency:** Implement rate limiting to control load

3. **Snipe-IT API Downtime**
   - **Mitigation:** Implement API retry logic, queue failed requests
   - **Contingency:** Manual checkout fallback process

### Medium Risk Items 🟡
1. **Database Migration Complications**
   - **Mitigation:** Test migration in staging first
   - **Contingency:** Launch with SQLite, migrate post-launch

2. **User Confusion About New System**
   - **Mitigation:** Clear documentation, training sessions
   - **Contingency:** Extended office hours first week

3. **QR Scanner Issues on Certain Devices**
   - **Mitigation:** Test on multiple devices
   - **Contingency:** Manual reservation ID entry as backup

---

## Daily Operations (Post-Launch)

### Daily Tasks
- Check error logs (10 minutes)
- Review reservation metrics (5 minutes)
- Monitor uptime dashboard (5 minutes)
- **Total:** 20 minutes/day

### Weekly Tasks
- Review user feedback
- Update FAQ/documentation
- Plan bug fixes and enhancements
- Check backup integrity
- **Total:** 2 hours/week

### Monthly Tasks
- Security updates (npm audit fix)
- Database optimization
- Generate usage reports
- Review and improve documentation
- **Total:** 4 hours/month

---

## Contact & Escalation

### Technical Issues
- **Primary:** Alex P. Leith (aleith@siue.edu)
- **Backup:** SIUE IT Services (618) 650-5500

### Business/Process Issues
- **Equipment Office:** (Insert contact)
- **Department Head:** (Insert contact)

### Emergency After-Hours
- **Critical System Down:** Contact aleith@siue.edu
- **Define Critical:** Users cannot login or make reservations
- **Response Time:** Within 2 hours

---

## Conclusion

**The Cage is 85% complete and ready for final production preparation.** The remaining 15% consists primarily of:
1. Azure AD integration (4-6 hours)
2. Production deployment setup (4-8 hours)
3. Load testing and optimization (2-3 hours)
4. User acceptance testing (1-2 days)
5. Monitoring and backup configuration (3-4 hours)

**Estimated Time to Launch:** 3-5 business days of focused work

**Recommendation:** Plan for **January 8-9, 2026 launch** assuming Azure AD credentials can be obtained by January 6th.

---

**Document Version:** 1.0  
**Last Updated:** January 4, 2026  
**Next Review:** After launch (January 15, 2026)

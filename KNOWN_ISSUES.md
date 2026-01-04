# Known Issues
**Last Updated:** January 4, 2026

This document tracks known issues, limitations, and technical debt in The Cage application.

---

## 🔴 Critical Issues (Blocks Production Launch)

### None Currently

All critical issues have been resolved as of January 4, 2026.

---

## 🟡 Medium Priority Issues (Should Fix Soon)

### 1. Azure AD Authentication Not Configured
**Status:** Ready to activate, awaiting credentials  
**Impact:** Using mock credentials in development; cannot launch to production without real SSO  
**Workaround:** Test with mock accounts (see TEST_ACCOUNTS.md)  
**Fix Required:** Obtain Azure AD credentials from SIUE IT and configure in `.env.production`  
**Timeline:** Required before production launch (Week of Jan 6-12)  
**Documentation:** See [ENTRA_ID_SETUP.md](ENTRA_ID_SETUP.md)

### 2. SQLite Database in Production
**Status:** Development database (SQLite) not suitable for production  
**Impact:** Potential concurrency issues with multiple simultaneous users  
**Workaround:** Can launch initially with SQLite for low traffic  
**Fix Required:** Migrate to PostgreSQL for production  
**Timeline:** Week 2 (Jan 13-19)  
**Documentation:** See [LAUNCH_READINESS_CHECKLIST.md](LAUNCH_READINESS_CHECKLIST.md#31-postgresql-setup)

### 3. No Email Notifications
**Status:** Feature not implemented  
**Impact:** Students don't receive confirmation emails or reminders  
**Workaround:** Students can bookmark confirmation page with QR code  
**Fix Required:** Implement nodemailer integration  
**Timeline:** Phase 2 (Post-launch)  
**Effort:** 4-6 hours

### 4. Limited Error Messages
**Status:** Some API errors not user-friendly  
**Impact:** Technical errors shown to users (e.g., "Prisma query failed")  
**Workaround:** Check logs for details  
**Fix Required:** Add error translation layer in API routes  
**Timeline:** Week 2 (Jan 13-19)  
**Effort:** 2-3 hours

---

## 🟢 Low Priority Issues (Nice to Have)

### 1. Mobile Safari Date Picker Styling
**Status:** iOS date picker styling inconsistent  
**Impact:** Visual only, functionality works  
**Browser:** Safari on iOS  
**Workaround:** Use desktop-style format  
**Fix Required:** Custom date picker component  
**Timeline:** Phase 2  
**Effort:** 3-4 hours

### 2. Firefox Camera Permission
**Status:** Camera permission prompt occasionally requires page refresh  
**Impact:** QR scanner requires second attempt  
**Browser:** Firefox 121+  
**Workaround:** Refresh page if camera doesn't activate  
**Fix Required:** Improve permission handling in scanner component  
**Timeline:** Phase 2  
**Effort:** 1-2 hours

### 3. Loading States
**Status:** Some API calls lack loading spinners  
**Impact:** Users unsure if action is processing  
**Location:** Equipment catalog, admin dashboard  
**Workaround:** None needed, response times generally fast  
**Fix Required:** Add Suspense boundaries and loading components  
**Timeline:** Phase 2  
**Effort:** 2-3 hours

### 4. ESLint Warnings
**Status:** 74 linting warnings (mostly `@typescript-eslint/no-explicit-any`)  
**Impact:** Code quality, no runtime impact  
**Location:** Various files (auth.config.ts, API routes, components)  
**Workaround:** Warnings suppressed in build  
**Fix Required:** Replace `any` types with proper TypeScript interfaces  
**Timeline:** Phase 2  
**Effort:** 4-6 hours

---

## 📋 Technical Debt

### 1. Duplicate Snipe-IT Service Implementations
**Status:** Two similar implementations in `/src/lib/snipe-it.ts` and `/src/services/snipeit.ts`  
**Impact:** Potential confusion, harder to maintain  
**Plan:** Consolidate to single implementation in services layer  
**Timeline:** Phase 2  
**Effort:** 2-3 hours

### 2. Hardcoded Business Rules
**Status:** Course restrictions and equipment rules in `rules-engine.ts` are hardcoded  
**Impact:** Requires code changes to update rules  
**Plan:** Move rules to database tables for admin configuration  
**Timeline:** Phase 3 (SaaS pivot)  
**Effort:** 8-12 hours

### 3. No Automated Load Testing
**Status:** Load testing must be done manually  
**Impact:** Can't verify performance regressions automatically  
**Plan:** Create k6 load test scripts and integrate into CI/CD  
**Timeline:** Phase 2  
**Effort:** 4-6 hours

### 4. Test Coverage at 70%
**Status:** Unit test coverage could be higher  
**Impact:** Some code paths not verified by tests  
**Plan:** Add tests for API routes and complex components  
**Timeline:** Ongoing  
**Effort:** 8-12 hours to reach 80%+

---

## 🚫 Limitations (By Design)

### 1. Fixed Time Blocks
**Description:** Reservations only in 4-hour blocks (9AM-1PM, 2PM-6PM)  
**Reason:** Business requirement to standardize checkout times  
**Alternative:** Could add custom time blocks in Phase 3  

### 2. 3-Block Weekly Limit
**Description:** Students limited to 3 reservations per week per equipment category  
**Reason:** Ensure equitable access for all students  
**Alternative:** Staff can override with "Force Checkout"  

### 3. No Multi-Day Reservations
**Description:** Cannot reserve equipment for multiple consecutive days  
**Reason:** MVP scope limitation  
**Alternative:** Create separate reservations for each day  

### 4. QR Code-Based Checkout Only
**Description:** Students must show QR code for pickup  
**Reason:** Streamlined checkout process  
**Alternative:** Staff can manually enter reservation ID  

---

## 🔍 Under Investigation

### None Currently

No issues are currently under investigation.

---

## ✅ Recently Resolved

### 1. Database Initialization Failure (Fixed Jan 1, 2026)
**Issue:** Database was locked, migrations couldn't be applied  
**Solution:** Stopped containers, deleted SQLite files, ran fresh migrations  
**Documentation:** See [FIXES_2026-01-01.md](FIXES_2026-01-01.md)

### 2. Over-Complicated Authentication (Fixed Jan 1, 2026)
**Issue:** NextAuth v5 beta causing redirect loops  
**Solution:** Simplified auth config, consolidated callbacks  
**Documentation:** See [FIXES_2026-01-01.md](FIXES_2026-01-01.md)

### 3. Debug Console.log Statements (Fixed Jan 4, 2026)
**Issue:** Production code had debug logging  
**Solution:** Removed all console.log statements from production code  
**Documentation:** See [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)

### 4. Deprecated Tailwind Classes (Fixed Jan 4, 2026)
**Issue:** Using Tailwind v3 syntax in v4 project  
**Solution:** Updated to v4 syntax (`bg-linear-to-br`, `shrink-0`)  
**Documentation:** See [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)

---

## 📞 Reporting New Issues

### For Developers
1. Check this document to see if issue is already known
2. Verify issue in latest `main` branch
3. Create GitHub Issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
4. Label appropriately (bug, enhancement, security)

### For Users
1. Contact aleith@siue.edu with details
2. Include screenshots if visual issue
3. Note date/time and what you were trying to do
4. Specify device and browser (e.g., "iPhone Safari")

---

## 🎯 Issue Resolution Process

**Critical (🔴):** Fix within 24 hours, may require hotfix deployment  
**Medium (🟡):** Fix within 1 week, include in next release  
**Low (🟢):** Fix in future sprint, prioritize by user impact  

---

## 📊 Metrics

**Total Known Issues:** 7  
- Critical: 0  
- Medium: 4  
- Low: 4  
- Technical Debt: 4  

**Recently Resolved:** 4 issues (Jan 1-4, 2026)

**Target for Launch:** 0 critical, <3 medium  
**Current Status:** ✅ Launch Ready

---

**Last Review:** January 4, 2026  
**Next Review:** After production launch (January 15, 2026)

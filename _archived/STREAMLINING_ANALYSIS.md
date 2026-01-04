# Technology Stack Streamlining Analysis
## Equipment Checkout System - 2-Week Completion Plan

**Analysis Date:** January 1, 2026  
**Target Completion:** January 15, 2026

---

## Executive Summary

**Current Status:** The project is ~85% complete but facing deployment blockers around database initialization and authentication complexity. The core architecture is solid but over-engineered for the actual requirements.

**Key Finding:** We're reinventing wheels in authentication, database management, and some UI components that have battle-tested open-source solutions.

**Recommendation:** Simplify authentication to use existing Snipe-IT users, consolidate database strategy, leverage more shadcn/ui components, and focus ruthlessly on the 5 critical student workflows.

---

## Part 1: Core Requirements Analysis

### What Students Actually Need (Priority 1 - Must Have)
1. **Browse Equipment** - Filter by category, see availability
2. **Reserve Equipment** - Pick time block, confirm booking
3. **View My Reservations** - See upcoming pickups
4. **Get Pickup Code** - Show code to staff (doesn't need to be QR)
5. **Sign In** - Simple SIUE authentication

### What Staff Actually Need (Priority 2 - Must Have)
6. **Scan/Enter Code** - Check out equipment to student
7. **Check In Equipment** - Mark as returned
8. **View Today's Schedule** - See pickups/returns

### What's Nice to Have (Priority 3 - Can Defer)
- Advanced calendar visualization
- Email notifications
- Fee management
- Course restrictions (can start with "all students can reserve all equipment")
- QR code scanning (staff can type codes)

---

## Part 2: Technology Stack Audit

### ✅ Keep - Well Chosen
| Technology | Purpose | Status |
|------------|---------|--------|
| **Next.js 16 (App Router)** | Frontend framework | Excellent choice, modern, well-documented |
| **Tailwind CSS** | Styling | Perfect for rapid UI dev |
| **Prisma** | Database ORM | Great for SQLite, good migration tools |
| **SQLite** | Database | Perfect for single-server deployment |
| **Snipe-IT** | Asset management backend | Already chosen, good API |
| **Docker Compose** | Orchestration | Simplifies deployment |

### ⚠️ Simplify - Over-Engineered

#### 1. **Authentication System (CRITICAL BLOCKER)**
**Current:** NextAuth v5 + Mock credentials + Azure AD placeholder + Custom auth factory
**Problem:** 
- NextAuth v5 is beta (unstable)
- Complex callback system causing redirect loops
- Mock credentials don't map to real Snipe-IT users
- Over-engineered for needs

**Recommendation:**
- **Option A (Fastest - 2 hours):** Use Snipe-IT's existing user API
  - Students log in with Snipe-IT credentials (they already have accounts)
  - Next.js API checks credentials against Snipe-IT `/users/me` endpoint
  - Store session in simple JWT cookie
  - No need for NextAuth complexity
  
- **Option B (Medium - 1 day):** Keep NextAuth but drastically simplify
  - Remove auth-factory abstraction
  - Remove Azure AD placeholder code
  - Use only credentials provider that validates against Snipe-IT API
  - Remove mock credential system entirely

**Files to Remove/Simplify:**
- `src/auth/auth-factory.ts` (delete)
- `auth.config.ts` (simplify to single provider)
- `auth.ts` (remove adapter, pure JWT)

#### 2. **Database Strategy (CURRENT BLOCKER)**
**Current:** Shadow database (SQLite) + Snipe-IT MySQL = two databases
**Problem:**
- Database file not found/locked errors
- Complex synchronization logic needed
- Migration failures blocking dev

**Recommendation:**
- **Phase 1 (This Week):** Fix SQLite path and initialize schema
  ```bash
  # Simple fix - run migrations correctly
  rm -f data/db_v2.sqlite3  # Start fresh
  npx prisma migrate deploy  # Apply migrations
  ```
- **Phase 2 (Next Sprint):** Evaluate if shadow DB even needed
  - Snipe-IT has checkout/checkin API - why duplicate?
  - Could store ONLY reservations in local DB
  - Everything else (users, assets) fetch from Snipe-IT

**Files to Simplify:**
- Reduce `prisma/schema.prisma` - remove User, Asset, Fine tables
- Keep only: Reservation, BlackoutDate, Course/UserCourse tables
- Fetch everything else from Snipe-IT API in real-time

#### 3. **Multiple Calendar Libraries**
**Current:** FullCalendar + custom ReservationCalendar + AvailabilityCalendar
**Problem:** Three different calendar implementations for same purpose

**Recommendation:** 
- Pick ONE: Either FullCalendar (you're already paying for it) OR
- Use simpler solution: react-day-picker (free, lighter)
- Delete custom calendar components

**Files to Remove:**
- Either delete `/components/ReservationCalendar.tsx` OR
- Delete FullCalendar dependencies and use only custom solution

#### 4. **QR Code Complexity**
**Current:** QR generation + QR scanner + QR validation + HMAC signing
**Problem:** Staff can just type a 6-digit code

**Recommendation:**
- **Option A:** Keep QR but simplify - just encode reservation ID, no signing
- **Option B:** Replace with simple 6-digit PIN code
  - Easier for students (no need to show phone)
  - Staff can type it in faster than scanning
  - Still secure with rate limiting

---

## Part 3: Leverage More Open Source

### Replace Custom Code with Libraries

#### 1. Form Handling - Use React Hook Form
**Current:** Manual form state management
**Replace with:**
```bash
npm install react-hook-form @hookform/resolvers
```
**Benefits:** Validation, error handling, async forms - all built-in

#### 2. UI Components - Use More shadcn/ui
**Current:** Custom components for everything
**Available from shadcn/ui:**
- Dialog/Modal
- Table
- Form
- Select/Combobox
- Tabs
- Toast notifications
- Alert
- Badge
- Avatar

**Action:** 
```bash
npx shadcn@latest add dialog table form select tabs toast alert badge avatar
```

#### 3. Date Handling - Simplify
**Current:** date-fns + custom logic
**Keep date-fns but add:** date-fns-tz for timezone handling

#### 4. State Management
**Current:** React useState everywhere
**For complex state (admin dashboard), add:**
```bash
npm install zustand  # 1kb state manager
```

---

## Part 4: Streamlined 2-Week Plan

### Week 1: Fix Blockers + Core Flows

**Day 1-2 (Jan 1-2): Database Emergency Fix**
- [ ] Delete existing database file
- [ ] Create minimal schema (Reservation only)
- [ ] Run migrations successfully
- [ ] Seed with test data
- **Goal:** App loads without database errors

**Day 3-4 (Jan 3-4): Authentication Rewrite**
Choose Option A (Snipe-IT auth):
- [ ] Create simple `/api/auth/login` endpoint
- [ ] Validate credentials against Snipe-IT API
- [ ] Set JWT cookie with user info
- [ ] Protect routes with simple middleware
- [ ] Remove all NextAuth code
- **Goal:** Students can log in and see dashboard

**Day 5-7 (Jan 5-7): Core Student Flows**
- [ ] Equipment catalog (filter, search)
- [ ] Equipment detail page with availability
- [ ] Reservation booking (POST /api/reserve)
- [ ] My Reservations page
- [ ] Simple confirmation page with code
- **Goal:** Students can complete full booking flow

### Week 2: Staff Tools + Polish

**Day 8-9 (Jan 8-9): Staff Checkout**
- [ ] Simple admin dashboard
- [ ] Code entry form (type or scan)
- [ ] Checkout API that calls Snipe-IT
- [ ] Check-in flow
- **Goal:** Staff can check out/in equipment

**Day 10-11 (Jan 10-11): Business Rules**
- [ ] 3-block weekly limit
- [ ] Block availability checking
- [ ] Reservation conflicts
- **Goal:** Rules enforced, no double-bookings

**Day 12-13 (Jan 12-13): Polish + Testing**
- [ ] Mobile responsive testing
- [ ] Error message improvements
- [ ] Loading states
- [ ] Empty states
- **Goal:** Production-ready UI

**Day 14 (Jan 14): Deploy + Handoff**
- [ ] Docker build and deploy
- [ ] Import real equipment data
- [ ] Staff training
- [ ] Documentation
- **Goal:** Live and usable

---

## Part 5: Files to Delete/Simplify

### Delete Completely (Reduce Complexity)
```
src/auth/auth-factory.ts              # Over-abstracted
src/services/inventory-service.ts      # Can be simple fetch
src/services/rules-engine.ts           # Overcomplicated, inline logic
src/mocks/                             # Not needed in production
src/components/calendar/ResourceCalendar.tsx  # Pick one calendar
src/lib/inject-branding.ts            # Nice to have, not MVP
```

### Simplify Drastically
```
auth.ts                    # Remove Prisma adapter, pure JWT
auth.config.ts            # Single credentials provider
prisma/schema.prisma      # Remove User, Asset, Fine models
middleware.ts             # Simple JWT check
src/lib/snipe-it.ts       # Consolidate all Snipe-IT calls here
```

### Keep As-Is
```
src/components/Navigation.tsx
src/components/EquipmentCard.tsx
src/app/catalog/
src/app/dashboard/
tailwind.config.ts
```

---

## Part 6: Recommended New Architecture

### Simplified Stack
```
Frontend: Next.js 16 + Tailwind + shadcn/ui
Auth: Simple JWT with Snipe-IT validation
Database: SQLite (reservations only)
Backend: Snipe-IT API (direct calls, no shadow DB)
Deployment: Docker Compose
```

### Data Flow
```
1. Student logs in → Validate against Snipe-IT → Set JWT cookie
2. Browse equipment → Fetch from Snipe-IT API → Cache 60 sec
3. Reserve → Check local SQLite for conflicts → Create reservation
4. Checkout → Staff enters code → Call Snipe-IT checkout API
5. Check-in → Staff clicks button → Call Snipe-IT checkin API
```

### File Structure (Simplified)
```
src/
├── app/
│   ├── api/
│   │   ├── auth/login/route.ts      # Simple JWT auth
│   │   ├── equipment/route.ts       # Snipe-IT proxy
│   │   ├── reserve/route.ts         # Create reservation
│   │   ├── checkout/route.ts        # Call Snipe-IT
│   │   └── checkin/route.ts         # Call Snipe-IT
│   ├── catalog/page.tsx             # Browse equipment
│   ├── dashboard/page.tsx           # My reservations
│   ├── admin/page.tsx               # Staff tools
│   └── login/page.tsx               # Auth form
├── components/
│   ├── ui/                          # shadcn components
│   ├── EquipmentCard.tsx
│   └── Navigation.tsx
├── lib/
│   ├── snipeit.ts                   # All API calls
│   ├── db.ts                        # Prisma client
│   └── auth.ts                      # JWT helpers
└── prisma/
    └── schema.prisma                # Reservation model only
```

---

## Part 7: Immediate Action Items (Priority Order)

### 🚨 Critical (Do First)
1. **Fix Database** (2 hours)
   - Delete db file
   - Run: `npx prisma migrate reset --force`
   - Restart docker containers
   
2. **Simplify Auth** (4 hours)
   - Remove NextAuth
   - Create simple login endpoint
   - Use Snipe-IT API for validation

3. **Test Core Flow** (2 hours)
   - Login → Browse → Reserve → View confirmation
   - Fix any blocking errors

### ⚡ High Priority (This Week)
4. **Consolidate Calendars** (3 hours)
5. **Add shadcn Form Components** (2 hours)
6. **Staff Checkout Flow** (4 hours)

### ✨ Medium Priority (Next Week)
7. **Mobile Optimization** (4 hours)
8. **Business Rules** (6 hours)
9. **Error Handling** (3 hours)

### 🎨 Polish (Final Days)
10. **Loading States** (2 hours)
11. **Empty States** (2 hours)
12. **Documentation** (4 hours)

---

## Part 8: Cost-Benefit Analysis

### Current Approach Cost
- **Complexity:** High (multiple auth providers, shadow DB, custom implementations)
- **Maintenance:** High (need to understand NextAuth, Prisma adapter, sync logic)
- **Time to Complete:** 3-4 more weeks
- **Deployment Risk:** High (multiple points of failure)

### Simplified Approach Cost
- **Complexity:** Low (direct API calls, minimal abstraction)
- **Maintenance:** Low (standard patterns, less code)
- **Time to Complete:** 2 weeks (achievable)
- **Deployment Risk:** Medium (fewer moving parts)

### Trade-offs of Simplification
**What You Lose:**
- OAuth/SSO flexibility (but you don't need it)
- Shadow DB resilience (but adds complexity)
- "Enterprise" architecture (but you're not enterprise scale)

**What You Gain:**
- Working product in 2 weeks
- Code anyone can maintain
- Fewer dependencies
- Faster iteration

---

## Conclusion

**The current codebase is well-structured but over-engineered for a system with:**
- ~100 students
- ~50 pieces of equipment
- 2 staff members
- Single deployment location

**Recommendation:** Accept the simplified architecture above. You can always add complexity later when you have 1000 users and need it. Right now, you need a working product.

**Next Step:** Approve this plan, then execute Day 1-2 tasks immediately (database fix).

// PHASE_3_UAT_CHECKLIST.md

# Phase 3 UAT (User Acceptance Testing) Checklist
## The Cage - SIUE Mass Communications Equipment Checkout App
**Target Launch Date:** January 5, 2026

---

## Pre-Testing Setup

- [ ] **Environment Configuration**
  - [ ] All environment variables in `.env` are populated (refer to `.env.example`)
  - [ ] `SNIPE_IT_API_URL` and `SNIPE_IT_API_KEY` are correctly set
  - [ ] `AUTH_MICROSOFT_ENTRA_ID_*` variables match SIUE Azure AD tenant
  - [ ] `AUTH_SECRET` is a secure random string
  - [ ] Database connection is active and migrations applied

- [ ] **Dependency Verification**
  - [ ] Run `npm install` to ensure all dependencies are installed
  - [ ] Run `npm run build` to verify TypeScript compilation passes
  - [ ] Run `npm run lint` to check for linting errors

---

## Stage 1: Authentication Flow

### 1.1 Microsoft Entra ID Integration
- [ ] **Login Page Redirects to Microsoft**
  - Navigate to `/login`
  - Verify "Sign in with Microsoft" button appears
  - Click button and verify redirect to Microsoft login
  
- [ ] **Session Persistence**
  - Complete login with valid Entra ID credentials
  - Verify redirect to dashboard (`/`)
  - Verify user name appears in header/sidebar
  - Refresh page and confirm session persists (no re-login required)

- [ ] **Session Data Capture**
  - Check browser DevTools → Application → Cookies
  - Verify `next-auth.session-token` exists
  - Verify session contains `user.id`, `user.email`, `user.universityId`

- [ ] **Unauthorized Access Blocking**
  - Open new incognito window
  - Try to access protected route (e.g., `/catalog`)
  - Verify redirect to `/login`
  - Verify `callbackUrl` parameter preserved

### 1.2 Middleware Route Protection
- [ ] **Admin Routes Protected**
  - Verify `/admin/scan` requires authentication
  - Verify `/api/checkout` requires authentication

- [ ] **Public Routes Accessible**
  - Verify `/login` accessible without auth
  - Verify static assets load without auth

---

## Stage 2: Equipment Catalog & API Integration

### 2.1 Equipment Catalog Loading
- [ ] **Catalog Page Loads Real Data**
  - Navigate to `/catalog`
  - Verify equipment list loads (not empty)
  - Verify equipment names match Snipe-IT data
  - Verify asset tags display correctly

- [ ] **Availability Status Accurate**
  - Verify "Available" items show green badge
  - Verify unavailable items show red badge
  - Verify status matches Snipe-IT `status_label.status_type` ("deployable" = available)

- [ ] **Category Filtering Works**
  - Click category buttons (e.g., "Video Camera")
  - Verify list filters correctly
  - Click "All Categories" and verify full list returns

- [ ] **Search Functionality**
  - Type equipment name in search box
  - Verify results filter in real-time
  - Search by asset tag (e.g., "10001")
  - Verify results filter correctly

### 2.2 Nested Snipe-IT Data Handling
- [ ] **Complex Property Access**
  - Verify no "Cannot read property 'name' of null" errors in console
  - Verify `category.name` renders correctly
  - Verify `status_label.name` renders correctly
  - Open DevTools Console and confirm no errors

---

## Stage 3: Reservation System (Shadow Ledger)

### 3.1 Creating Reservations
- [ ] **Reserve Button Functional**
  - Click "Reserve" on available equipment
  - Verify redirect to reservation page or modal
  - Verify equipment name pre-filled

- [ ] **Date/Time Block Selection**
  - Select a date in future
  - Verify only 4-hour blocks available (09:00-13:00, 14:00-18:00)
  - Attempt to select non-standard time
  - Verify rejection with error message

- [ ] **Reservation Confirmation**
  - Complete reservation form
  - Submit reservation
  - Verify success message appears
  - Verify redirected to reservations list

### 3.2 3-Block Weekly Limit Enforcement
- [ ] **First Block Succeeds**
  - Create first reservation for "Video Camera" this week
  - Verify success

- [ ] **Second Block Succeeds**
  - Create second reservation for "Video Camera" this week
  - Verify success

- [ ] **Third Block Succeeds**
  - Create third reservation for "Video Camera" this week
  - Verify success (total = 3)

- [ ] **Fourth Block Rejected**
  - Attempt to create fourth reservation for "Video Camera" this week
  - Verify error: "Weekly limit of 3 blocks exceeded for Video Cameras"
  - Verify user cannot proceed

- [ ] **Different Category Allowed**
  - Create three "Audio Recorder" reservations same week
  - Verify all succeed (separate category limit)
  - Attempt fourth "Audio Recorder" reservation
  - Verify rejected with appropriate category name

- [ ] **Next Week Resets Limit**
  - Create reservation for next week (Monday of next ISO week)
  - Verify counter resets to 1
  - Verify can create up to 3 more blocks

### 3.3 Conflict Detection
- [ ] **Overlapping Time Rejection**
  - Create reservation Mon 09:00-13:00 for Equipment A
  - Attempt to create Mon 10:00-14:00 for same Equipment A
  - Verify rejection: "Asset is unavailable during the requested time"

- [ ] **Same Time Slot Different Equipment Allowed**
  - Reserve Equipment A: Mon 09:00-13:00
  - Reserve Equipment B: Mon 09:00-13:00
  - Verify both succeed (different assets)

---

## Stage 4: QR Code Scanner & Checkout

### 4.1 New Scanner Component
- [ ] **Scanner Page Loads**
  - Navigate to `/admin/scan`
  - Verify camera permission prompt appears (first visit)
  - Grant camera permission
  - Verify scanner renders (video feed visible)

- [ ] **Scanner Detection**
  - Generate QR code with test reservation ID (use a UUID format)
  - Point camera at QR code
  - Verify code is scanned and displayed in "Last scanned" box
  - Verify no camera artifacts or errors

- [ ] **Debounce Logic Working**
  - Quickly scan same code 5 times
  - Verify only one API call made (debounce prevents duplicates)
  - Verify UI shows loading state

### 4.2 Checkout Workflow
- [ ] **Valid Reservation Checkout**
  - Create reservation and capture its ID
  - Navigate to `/admin/scan`
  - Scan reservation QR code
  - Verify success message: "Asset checked out successfully!"
  - Verify in Snipe-IT: asset status changed to "Checked Out"
  - Verify in Shadow Ledger: reservation status = "CHECKED_OUT"

- [ ] **Invalid Reservation ID**
  - Generate random QR code (non-existent ID)
  - Scan it in `/admin/scan`
  - Verify error message appears
  - Verify console shows 404 error (no crash)

- [ ] **Expired Reservation**
  - Create reservation ending in past (datetime.now() - 1 hour)
  - Try to scan and checkout
  - Verify error: "Reservation expired"
  - Verify asset NOT checked out in Snipe-IT

- [ ] **Already Checked Out**
  - Create and checkout a reservation
  - Attempt to scan same ID again
  - Verify error or rejection (reservation not in "CONFIRMED" state)

---

## Stage 5: Snipe-IT Integration

### 5.1 API Payload Correctness
- [ ] **Checkout Payload Validation**
  - Open DevTools → Network tab
  - Filter to Snipe-IT domain
  - Perform checkout
  - Inspect POST to `/hardware/{id}/checkout`
  - Verify payload includes:
    ```json
    {
      "checkout_to_type": "user",
      "assigned_user": <userId>
    }
    ```

- [ ] **Error Response Parsing**
  - Configure Snipe-IT to return simulated error (200 OK, status: "error")
  - Attempt checkout
  - Verify error is caught and displayed (not treated as success)

### 5.2 Snipe-IT Status Sync
- [ ] **Availability Status Updates**
  - Checkout asset via scanner
  - Verify immediate status update in Snipe-IT
  - Verify asset no longer shows as "Available" in `/catalog`
  - Refresh page and verify status persists

- [ ] **Checkin Updates Status**
  - Manually checkin asset in Snipe-IT
  - Refresh `/catalog`
  - Verify asset shows as "Available" again

---

## Stage 6: API Error Handling

### 6.1 Standardized Error Responses
- [ ] **Consistent Error Format**
  - Test each API endpoint with invalid requests
  - Verify all errors follow format:
    ```json
    {
      "error": "ERROR_CODE",
      "message": "User-friendly message",
      "timestamp": "ISO8601"
    }
    ```

- [ ] **HTTP Status Codes**
  - Missing auth token → 401
  - Insufficient permissions → 403
  - Resource not found → 404
  - Validation error → 400
  - Server error → 500

### 6.2 Network Resilience
- [ ] **Snipe-IT API Timeout**
  - Simulate network delay (DevTools throttle)
  - Perform checkout
  - Verify appropriate error message (not infinite spinner)

- [ ] **Database Connection Error**
  - Temporarily disconnect database
  - Attempt to create reservation
  - Verify graceful error: "Internal server error"

---

## Stage 7: Component Rendering

### 7.1 EquipmentCard Robustness
- [ ] **Nested Property Safe Access**
  - Navigate to `/catalog`
  - Open DevTools Console
  - Verify no "Cannot read property" errors
  - Verify no warnings

- [ ] **Null/Undefined Handling**
  - Scroll through equipment list
  - Verify all cards render (none crash)
  - Verify fallback values used when fields missing

### 7.2 FullCalendar SSR Compatibility
- [ ] **No Hydration Mismatch**
  - Build app: `npm run build`
  - Start production server
  - Navigate to calendar component page
  - Verify calendar renders correctly
  - Open Console: confirm no hydration errors

- [ ] **Dynamic Import Working**
  - In source code, verify calendar imported with `dynamic()` and `ssr: false`
  - Verify plugins memoized to prevent re-initialization

---

## Stage 8: Security Validation

### 8.1 Credential Leakage Prevention
- [ ] **API Keys Not in Browser**
  - Open DevTools Console
  - Execute: `console.log(localStorage)`
  - Verify no Snipe-IT API keys visible
  - Check Network requests: verify API calls go through `/api/*` (not direct to Snipe-IT)

- [ ] **Environment Variables Secure**
  - Verify `.env` is in `.gitignore`
  - Verify `SNIPE_IT_API_KEY` only used in server-side code
  - Build app and search bundle: `grep -r SNIPE_IT_API_KEY .next/`
  - Confirm no results (key not embedded in client bundle)

### 8.2 Session Security
- [ ] **CSRF Protection**
  - Inspect checkout form
  - Verify CSRF token present in POST requests

- [ ] **Session Timeout**
  - Login
  - Wait 24+ hours (or adjust session expiry for testing)
  - Verify re-authentication required on next action

---

## Stage 9: Browser Compatibility

### 9.1 iOS Compatibility (Critical for Mobile Users)
- [ ] **iPhone 16+ (iOS 17+)**
  - Access `/catalog` on iPhone
  - Verify equipment loads
  - Navigate to `/admin/scan`
  - Attempt camera access
  - Verify permission prompt shows
  - Grant permission
  - Verify camera feed visible
  - Scan QR code
  - Verify detection works

- [ ] **iPad Safari**
  - Repeat above on iPad
  - Verify responsive layout works

### 9.2 Android Compatibility
- [ ] **Android 14+ (Samsung, Pixel, etc.)**
  - Access `/catalog` on Android device
  - Navigate to `/admin/scan`
  - Verify camera access works
  - Scan QR code
  - Verify detection works

---

## Stage 10: Performance Checks

### 10.1 Load Times
- [ ] **Initial Page Load**
  - Navigate to `/catalog`
  - Measure time to display first equipment card (< 2 seconds goal)
  - Open DevTools → Lighthouse
  - Run audit
  - Verify Performance score > 80

- [ ] **Catalog with Filters**
  - Apply filters (category, search)
  - Measure filter response time (< 500ms goal)

### 10.2 Database Query Performance
- [ ] **Reservation Query Efficiency**
  - Create 100+ reservations
  - Navigate to `/user/reservations`
  - Verify list loads smoothly (< 1 second)
  - Open DevTools → Network
  - Verify single API call (not multiple requests)

---

## Stage 11: Monday Morning Test (Critical Business Logic)

This test specifically validates ISO week boundary behavior at 00:00 Monday UTC.

- [ ] **Week Limit Reset**
  - **Setup:** Create 3 "Video Camera" reservations in Week 1
  - **Thursday:** Confirm all 3 exist, limit enforced
  - **Saturday:** Confirm still 3, still limited
  - **Sunday 23:59 UTC:** Confirm still 3 (last moment of Week 1)
  - **Monday 00:00 UTC:** Refresh page
  - **Action:** Attempt to create new "Video Camera" reservation
  - **Expected:** First block of Week 2 succeeds (counter reset to 1/3)
  - **Verification:** Can create 2 more blocks before hitting limit

---

## Stage 12: Admin Functionality

### 12.1 Staff Override (Future Feature Placeholder)
- [ ] **Documentation**
  - Verify staff/admin role can be set in Snipe-IT
  - Document process for setting override flag
  - Note: Implementation deferred if not critical for Jan 5 launch

---

## Stage 13: Error Recovery

### 13.1 User-Facing Error Messages
- [ ] **All Error Messages Clear**
  - Trigger 5-10 different error scenarios
  - Verify each error message is:
    - Non-technical (no stack traces)
    - Actionable ("Try again", "Contact support")
    - In correct language/context

- [ ] **No Silent Failures**
  - Verify all API errors result in user notification
  - Verify no errors only in console (invisible to user)

---

## Sign-Off

### Testing Lead Checklist
- [ ] All 13 stages completed
- [ ] No blocking bugs remaining
- [ ] All errors tested and recoverable
- [ ] Performance acceptable
- [ ] Browser/device compatibility verified

### Project Manager Sign-Off
- [ ] Tester confirms: **PASS** / **FAIL**
- [ ] Critical bugs documented (if any)
- [ ] Go/No-Go decision for Jan 5 launch: **GO** / **NO-GO**

**Tester Name:** ________________  
**Date:** ________________  
**Signature:** ________________

**PM Name:** ________________  
**Date:** ________________  
**Signature:** ________________

---

## Known Issues / Deferred Items

Use this section to document any issues found that are acceptable for launch:

- [ ] Issue 1: [Description] | Severity: [Low/Medium/High] | Deferred to: Phase 4
- [ ] Issue 2: [Description] | Severity: [Low/Medium/High] | Deferred to: Phase 4

---

## Go-Live Verification (Jan 5, 2026)

After deployment to production, verify:

- [ ] Login works with real Entra ID credentials
- [ ] Equipment catalog loads from production Snipe-IT
- [ ] Scanner works with production URLs
- [ ] Reservations sync correctly
- [ ] All email notifications sent (if implemented)


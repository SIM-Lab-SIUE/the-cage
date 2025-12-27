## 4. Execution Roadmap: December 4, 2025 – January 5, 2026

This execution plan divides the project into five distinct phases. It utilizes a two-developer team structure: **Developer A (Backend/Architecture)** focusing on the API Wall, Authentication, and Snipe-IT integration, and **Developer B (Frontend/Design)** focusing on the UI, UX, and Branding Configuration.

### **Phase 1: Foundation & The API Wall (Dec 4 – Dec 10)**

**Objective:** Establish the development environment, deploy the base Snipe-IT instance, and stand up the Next.js scaffold with the "API Wall" pattern.

| **Date** | **Developer A (Backend/Architect)** | **Developer B (Frontend/Designer)** | **Technical Notes & Risk Mitigation** |
| --- | --- | --- | --- |
| **Dec 4 (Thu)** | **Environment & Snipe-IT Init:** Configure `.wslconfig`.1 Setup `docker-compose.yml` for Snipe-IT, MySQL, and generic Mailhog (for testing). Verify Snipe-IT API access via `curl` inside WSL2. **(Completed)** | **Repo & Config Setup:** Initialize Next.js 14 (App Router).20 Implement the `branding.config.ts` schema. Configure Tailwind to read colors from CSS variables injected by the config file.6 **(Completed)** | *Risk:* Docker Volume permissions on WSL2. *Fix:* Ensure distinct users in Dockerfile match WSL user ID. |
| **Dec 5 (Fri)** | **Snipe-IT Seeding:** Script the population of dummy data (Cameras, Audio Kits) matching 14 categories using Snipe-IT API. Generate API Keys. **(Completed)** | **Atomic UI System:** Build base components (Button, Card, Input, Badge) using `shadcn/ui` or pure Tailwind. Ensure strictly no hardcoded colors; all must use `var(--primary-color)`. **(Completed)** | *Ref:* 14 for Category names. |
| **Dec 6 (Sat)** | **Auth Wrapper (The Facade):** Implement NextAuth v5. Create the `AuthProviderFactory`. Wire up a "Mock Provider" (Credentials) for dev speed, decoupling from Azure AD delays.14 **(Completed)** | **Layout & Navigation:** Build the App Shell (Sidebar, Header). Implement the logic to read "Department Name" and "Logo" from the `branding.config.ts` file. **(Completed)** | *Ref:* 13 for NextAuth v5 patterns. |
| **Dec 7 (Sun)** | **Client Generation:** Use `openapi-typescript` to generate strict TypeScript interfaces from the Snipe-IT Swagger/OpenAPI spec.22 *Critical:* Manually patch the spec for missing security definitions.24 **(Completed)** | **Dashboard UI:** Design the Student Dashboard. Create placeholders for "Active Reservations" and "Upcoming Pickups". Implement the Skeleton loading states. **(Completed)** | *Ref:* 24 for Swagger fixes. |
| **Dec 8 (Mon)** | **The Wall (Read):** Create the Service Layer. Implement `InventoryService.getAll()`. Logic: Call Snipe-IT `/hardware`, filter for status "Ready to Deploy" 25, map to `IInventoryItem`. **(Completed)** | **Catalog Grid:** Build the Equipment Catalog interface. Implement Filter/Search UI (Category, Name). Connect components to the mocked Service Layer response. **(Completed)** | *Ref:* 11 for Status ID logic. |
| **Dec 9 (Tue)** | **Sidecar DB Init:** Initialize Prisma with SQLite. Define the `Reservation` schema (`id`, `assetId`, `userId`, `startTime`, `endTime`) to bridge the Snipe-IT reservation gap.10 **(Completed)** | **Asset Detail View:** Build the single item view. Display "Included Items" (mocked for now). Prepare the layout for the Availability Calendar. **(Completed)** | *Ref:* 26 for reservation gap context. |
| **Dec 10 (Wed)** | **Availability Logic:** Implement `AvailabilityService.check(assetId, start, end)`. Logic: Query Prisma Sidecar for overlaps. **(Completed)** | **Calendar Component:** Integrate `FullCalendar` (React). Configure "Resource View" to visualize 5-hour blocks. Implement the click-and-drag selection UI.27 **(Completed)** | *Risk:* Complex logic. *Mitigation:* Keep it simple—block granularity is sufficient. |

### **Phase 2: Core Business Logic & Reservation Loop (Dec 11 – Dec 17)**

**Objective:** Implement the specific business rules (3-block limit, class access) and enable the core reservation transaction.

| **Date** | **Developer A (Backend/Architect)** | **Developer B (Frontend/Designer)** | **Technical Notes & Risk Mitigation** |
| --- | --- | --- | --- |
| **Dec 11 (Thu)** | **Rules Engine (Blocks):** Create `RulesService.ts`. Implement `validateWeeklyLimit(user, asset)`. Hardcode the "Max 3 blocks" logic specified in.14 **(In Progress)** | **Reservation Modal:** Build the "Confirm Reservation" UI. Display selected times, item details, and a placeholder for the "Agreement" text. **(In Progress)** | *Ref:* 14 for specific rules. |
| **Dec 12 (Fri)** | **Rules Engine (Classes):** Hardcode the Course Mapping logic. *Ex:* `const RESTRICTED = {'XF605': ['MC401']}`. Mock the user's session to include course tags like `['MC401', 'MC204']`.14 | **Error States:** Design and implement UI for rule violations (e.g., "Weekly Limit Reached", "Course Restriction"). Ensure these match the "friendly" tone required. | *Ref:* 14 for Course/Gear mapping. |
| **Dec 13 (Sat)** | **Reservation Transaction:** Implement `POST /api/reserve`. Transaction Flow: 1. Validate Rules. 2. Write to Prisma Sidecar. 3. Return Success/Fail. **Note:** We do not write to Snipe-IT yet, only the Sidecar. | **Success Flow:** Build the "Reservation Confirmed" screen. Implement the QR Code generator using `qrcode.react` (encodes Reservation ID).14 | *Ref:* 29 for reservation concepts. |
| **Dec 14 (Sun)** | **Snipe-IT Sync (Status):** Implement a background check (via Next.js generic cron/request) to verify asset status in Snipe-IT. If an asset becomes "Broken", void future Prisma reservations. | **User Profile:** Build "My Account". Display reservation history and current status. Show the user's "Eligible Courses" (debug view). | *Ref:* 11 for Status IDs. |
| **Dec 15 (Mon)** | **QR Security:** Implement logic to sign the QR code payload (HMAC) to prevent students from forging reservation codes. | **Mobile Optimization:** Deep testing of the Calendar and Catalog on mobile viewports. Adjust CSS Grid/Flex layouts for small screens. | *Context:* Students will use phones for pickup. |
| **Dec 16 (Tue)** | **Admin API:** Create `GET /api/admin/reservations`. Fetch active reservations from Prisma Sidecar, join with User mock data. | **Admin Dashboard:** Build the Staff/Admin view. Create a data table showing "Today's Pickups" and "Today's Returns". | *Ref:* 14 for Staff features. |
| **Dec 17 (Wed)** | **Checkout/Checkin API:** Implement `POST /api/checkout`. Logic: 1. Validate QR. 2. Call Snipe-IT `/hardware/:id/checkout`.7 3. Update Prisma status to "Active". | **Scanner UI:** Implement `html5-qrcode` scanner integration on the Admin Dashboard. Connect the scan event to the Checkout API.14 | *Risk:* API failure. *Mitigation:* Store local audit log if Snipe-IT fails. |

### **Phase 3: Deep Integration & Branding (Dec 18 – Dec 24)**

**Objective:** Polish the integration, handle real data mapping, and finalize the "Code for the Pivot" abstraction.

| **Date** | **Developer A (Backend/Architect)** | **Developer B (Frontend/Designer)** | **Technical Notes & Risk Mitigation** |
| --- | --- | --- | --- |
| **Dec 18 (Thu)** | **WSL2 Networking Check:** Verify that the Checkout API works reliably across the Docker Bridge. Troubleshoot potential timeouts between Next.js and Snipe-IT containers.16 | **Fee UI:** Implement the "Outstanding Fees" alert. Note: This reads from a manual "Fee" flag in the user mock/DB, as Snipe-IT fee logic is limited.14 | *Ref:* 18 for WSL networking. |
| **Dec 19 (Fri)** | **Kit Mapping:** Map Snipe-IT "Custom Fields" to the frontend. Ensure fields like "Included Items" are pulled from the API and sanitized.14 | **Kit UI:** Update the Asset Detail page to render the "Included Items" list (e.g., batteries, chargers) fetched from the API Wall. | *Ref:* 30 for Custom Fields. |
| **Dec 20 (Sat)** | **Staff Override Logic:** Implement the "Force Checkout" flag in the API. Allows staff to bypass the "3-block limit" during checkout.14 | **Override UI:** Add a "Force Checkout" toggle in the Admin Interface visible only to users with the 'Admin' role. | *Context:* Critical for special projects. |
| **Dec 21 (Sun)** | **Data Import Script:** Write a Node.js script to parse the "Catalog" CSV (provided by Engineers) and batch-upload assets to Snipe-IT via API. This ensures fresh data for launch.14 | **Maintenance Mode:** Build a UI for staff to manually block off calendar time for maintenance (creates a "Maintenance" reservation in Prisma). | *Ref:* 14 for Catalog format. |
| **Dec 22 (Mon)** | **Email System:** Integrate `nodemailer`. Configure standard templates. Wire up "Confirmation Email" on successful reservation. Hardcode the templates for now.14 | **Email Styling:** Design responsive HTML email templates that respect the `branding.config.ts` color scheme. | *Context:* "Code for the Pivot" means no hardcoded "SIUE" in emails. |
| **Dec 23 (Tue)** | **Caching Layer:** Implement `unstable_cache` (Next.js) for Inventory calls. Cache Snipe-IT responses for 60 seconds to prevent rate limiting during high traffic.31 | **Loading Polish:** Refine all loading spinners and transitions. Ensure the app feels "fast" even if the Snipe-IT API is slow. | *Risk:* API Rate Limits. |
| **Dec 24 (Wed)** | **Security Sweep:** Audit all API endpoints. Ensure no "Student" user can access `/api/admin/*`. Verify `next.config.js` headers for security. | **Accessibility:** Run Lighthouse/Axe tests. Ensure color contrast ratios (from config file) meet WCAG standards. | *Context:* University accessibility compliance. |

### **Phase 4: Testing, Refactoring & Documentation (Dec 26 – Jan 2)**

**Objective:** Stress test the application, refine the code for the pivot, and prepare for handover.

| **Date** | **Developer A (Backend/Architect)** | **Developer B (Frontend/Designer)** | **Technical Notes & Risk Mitigation** |
| --- | --- | --- | --- |
| **Dec 26 (Fri)** | **Load Testing:** Simulate 50 concurrent reservations to test SQLite locking. Verify `checkAvailability` remains accurate under load. | **Cross-Browser:** Test extensively on Safari (iOS) and Chrome (Android). Fix common Tailwind flexbox bugs on mobile Safari. | *Ref:* SQLite concurrency. |
| **Dec 27 (Sat)** | **Pivot Refactor:** Review `RulesService.ts`. Add extensive JSDoc comments explaining how to replace hardcoded logic with DB queries for the commercial version. | **Theme Verification:** Change `branding.config.ts` colors to "Blue". Verify the entire app updates. Proof of "White Label" capability. | *Context:* Pivot requirement. |
| **Dec 28 (Sun)** | **Developer Docs:** Write `DEVELOPER.md`. Document the "API Wall" pattern, how to rotate API keys, and how to update the hardcoded Course List. | **User Guide:** Draft the "How to Reserve" help text for the Student Dashboard. | *Ref:* 14 for content needs. |
| **Dec 29 (Mon)** | **Azure AD Integration:** **CRITICAL.** Swap the "Mock Provider" for the real `AzureADProvider`. Configure with actual SIUE Tenant IDs (if available) or continue with Test Tenant.12 | **Login Polish:** Finalize the "Login with SIUE e-ID" button styling. Handle auth error states (e.g., "Access Denied"). | *Ref:* 32 for Azure AD setup. |
| **Dec 30 (Tue)** | **Edge Cases:** Test "Double Booking" (two users, same time). Test "Snippet-IT Down" scenarios (ensure graceful error messages). | **Visual Polish:** Typography hierarchy, whitespace consistency, button states. | *Context:* "Professional Grade" UI. |
| **Dec 31 (Wed)** | **Deployment Dry Run:** Build the production Docker container. Ensure it spins up alongside Snipe-IT via `docker-compose`. Test the "Production" build locally. | **Final Walkthrough:** Full end-to-end user journey test (Login -> Reserve -> Scan -> Checkout -> Return). | *Ref:* 2 for prod build. |
| **Jan 1 (Thu)** | *Light Duty.* Log review. Ensure error logging (console/file) is capturing detailed stack traces for debugging. | *Light Duty.* Sanity check of UI text and labels. | *Holiday.* |
| **Jan 2 (Fri)** | **Code Freeze:** Commit all changes. Tag release `v1.0.0-SIUE`. Generate a comprehensive changelog. | **Handover Assets:** Compile screenshots for the User Manual. Prepare the "Welcome" email for Ben and Theresa. | *Deadline Met.* |

### **Phase 5: Deployment & Launch (Jan 3 – Jan 5)**

**Objective:** Deploy to the live environment and verify functionality.

- **Jan 3 (Sat):** Deploy Docker containers to the SIUE Linux server. Import the final "Catalog" CSV.
- **Jan 4 (Sun):** Verification. Test SSL/HTTPS. Verify Course Mappings. Test email delivery.
- **Jan 5 (Mon):** **Go Live.** Handover admin credentials.
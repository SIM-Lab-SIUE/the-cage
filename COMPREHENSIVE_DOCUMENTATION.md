# The Cage - Comprehensive Documentation
**SIUE Mass Communications Equipment Checkout System**

**Version:** 1.0 Beta  
**Last Updated:** January 4, 2026  
**Launch Target:** Week of January 6, 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Quick Start Guide](#quick-start-guide)
3. [User Guide](#user-guide)
4. [Technical Architecture](#technical-architecture)
5. [Developer Guide](#developer-guide)
6. [Deployment Guide](#deployment-guide)
7. [Testing & Quality Assurance](#testing--quality-assurance)
8. [Known Issues & Future Enhancements](#known-issues--future-enhancements)

---

## Executive Summary

### What is The Cage?

The Cage is a production-ready Next.js application designed for the Broadcast Engineers and Mass Communications students at Southern Illinois University Edwardsville (SIUE). It provides a modern, integrated platform for reserving, checking out, and managing broadcast production equipment with real-time availability tracking and comprehensive fee management.

### Core Features

- **Digital Equipment Catalog**: Browse cameras, audio gear, lighting, and support equipment
- **Real-Time Availability**: Calendar-based visualization powered by FullCalendar
- **Reservation System**: Fixed 4-hour time blocks (09:00–13:00, 14:00–18:00)
- **Enforced Quotas**: 3-block weekly reservation limit per student per equipment category
- **Mobile-Optimized Checkout**: QR code scanning interface for kiosk-based checkout
- **Fee Management**: Track late returns, damage fees, and automatically block students with outstanding balances
- **White-Label Branding**: Centralized configuration for theming and institutional branding

### Project Status

**✅ COMPLETE:**
- Authentication system (NextAuth v5 with mock credentials)
- Database schema and migrations
- Student dashboard and reservation workflow
- Admin dashboard and checkout/checkin system
- QR code generation and scanning
- Integration with Snipe-IT API
- Course-based access restrictions
- 3-block weekly limit enforcement

**🔧 IN PROGRESS:**
- Azure AD/Entra ID integration (ready to activate)
- Production database migration (SQLite → PostgreSQL)
- Email notification system

**📋 PLANNED:**
- Analytics and reporting dashboard
- Automated late fee processing
- Enhanced mobile responsiveness

---

## Quick Start Guide

### Prerequisites

- **Docker Desktop** installed and running
- **Node.js** v20+ and npm
- **Git** for version control
- **Terminal/Command Prompt** access

### Daily Startup (Development)

#### Step 1: Navigate to Project
```bash
cd /home/apleith/equipment-checkout/the-cage
```

#### Step 2: Start Docker Containers
```bash
docker compose up -d
```

Wait 1-2 minutes for containers to fully initialize.

#### Step 3: Start Development Server
```bash
npm run dev
```

Wait for the "Ready" message, then open: **http://localhost:3000**

#### Step 4: Access Services
- **The Cage App**: http://localhost:3000
- **Snipe-IT Admin**: http://localhost:8080
- **Database**: SQLite file at `data/db_v2.sqlite3`

### Daily Shutdown

```bash
# Stop dev server (Ctrl+C in terminal)
# Stop Docker containers
docker compose down
```

---

## User Guide

### For Students

#### Logging In
1. Go to http://localhost:3000 (or your institution's URL)
2. Click "Sign in with SIUE Account"
3. Enter credentials (Dev: see TEST_ACCOUNTS.md)
4. Auto-redirect to Dashboard

#### Browsing Equipment
1. From Dashboard, click "Browse Catalog"
2. Use search box or category filters
3. Click equipment card for details
4. Green badge = Available, Red = Checked Out

#### Making a Reservation

**Important Rules:**
- Equipment is reserved in 4-hour blocks:
  - **Block A (Morning)**: 9:00 AM - 1:00 PM
  - **Block B (Afternoon)**: 2:00 PM - 6:00 PM
- **3-Block Weekly Limit**: Max 3 reservations per week per equipment category
- **Course Restrictions**: Some equipment requires specific course enrollment

**Steps:**
1. Navigate to equipment detail page
2. Select date from calendar
3. Choose Block A or Block B
4. Click "Reserve Equipment"
5. Review confirmation and QR code
6. Optional: Add to Google Calendar/Outlook

#### Picking Up Equipment
1. Arrive at Equipment Office during staffed hours
2. Show QR code to staff (on phone or printed)
3. Staff scans code and checks out equipment
4. Inspect equipment and sign checkout form
5. Return by deadline shown on reservation

#### Viewing Reservations
- **Dashboard**: Shows active checkouts and upcoming reservations
- **My Account**: Full reservation history and fee status

### For Staff/Admin

#### Checking Out Equipment
1. Student arrives with QR code
2. Navigate to `/admin/scan`
3. Scan QR code with camera
4. System validates and processes checkout
5. Hand equipment to student

#### Checking In Equipment
1. Student returns equipment
2. Inspect for damage
3. Navigate to `/admin/dashboard`
4. Find reservation in active list
5. Click "Check In" button
6. Confirm in modal

#### Issuing Fees
1. Navigate to Admin Dashboard
2. Click "Issue Fine" for a user
3. Enter reason (e.g., "Late Return")
4. Enter amount
5. Submit

**Note:** Students with outstanding fees are automatically blocked from new reservations.

---

## Technical Architecture

### System Overview

```
┌─────────────────┐
│   Next.js App   │ (Frontend + API Routes)
│   (Port 3000)   │
└────────┬────────┘
         │
         ├─────────────┐
         │             │
         ▼             ▼
┌─────────────┐  ┌─────────────┐
│   Snipe-IT  │  │   SQLite    │
│  (Port 8080)│  │  (Shadow)   │
│   (MySQL)   │  │  Database   │
└─────────────┘  └─────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend Framework** | Next.js 16 (App Router) | Server-side rendering, API routes |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework |
| **Database ORM** | Prisma | Type-safe database access |
| **Shadow Database** | SQLite (dev) / PostgreSQL (prod) | Local reservation state |
| **Asset Management** | Snipe-IT | Source of truth for inventory |
| **Authentication** | NextAuth v5 | Session management, OAuth |
| **Calendar** | FullCalendar | Resource timeline visualization |
| **QR Codes** | qrcode.react | Reservation confirmation codes |
| **Containerization** | Docker Compose | Multi-service orchestration |

### Database Architecture

#### Shadow Database (Prisma - SQLite/PostgreSQL)

**Purpose**: Stores reservation state and business logic separate from Snipe-IT

**Models:**
- `User`: Student/staff profiles with quota tracking
- `Asset`: Cached asset metadata for quick queries
- `Reservation`: Booking records with status workflow
- `Fine`: Fee records for late returns/damage
- `Course`: Course codes for access control
- `BlackoutDate`: System maintenance periods

**Status Workflow:**
```
PENDING → CONFIRMED → CHECKED_OUT → COMPLETED
                  ↓
              CANCELLED
```

#### Snipe-IT (MySQL)

**Purpose**: Source of truth for physical inventory

- Asset catalog with categories
- User management
- Checkout/checkin audit trail
- Custom fields (lens mount, included items, etc.)

### API Architecture ("API Wall Pattern")

All Snipe-IT interactions go through service layer abstraction:

```
Frontend → Service Layer → Snipe-IT API
         ↓
      Shadow DB
```

**Benefits:**
- Decouples frontend from Snipe-IT schema changes
- Enables caching and rate limiting
- Simplifies testing
- Prepares for future SaaS pivot

### Key Services

#### `/src/services/inventory-service.ts`
- Fetches equipment catalog from Snipe-IT
- Caches results (60s revalidation)
- Transforms API responses to simplified schema

#### `/src/services/snipeit.ts`
- Low-level Snipe-IT API client
- Rate limiting with exponential backoff
- Retry logic for transient failures

#### `/src/services/rules-engine.ts`
- 3-block weekly limit validation
- Course-based access restrictions
- Hardcoded business rules (ready for DB migration)

#### `/src/lib/availability-checker.ts`
- Checks reservation overlaps
- 1-hour buffer between checkouts
- Real-time availability calculation

---

## Developer Guide

### Project Structure

```
the-cage/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API route handlers
│   │   ├── admin/             # Staff/admin pages
│   │   ├── catalog/           # Equipment browsing
│   │   ├── calendar/          # Availability calendar
│   │   ├── dashboard/         # Student home
│   │   └── account/           # User profile
│   ├── components/            # React components
│   ├── services/              # Business logic layer
│   ├── lib/                   # Utility functions
│   ├── config/                # Configuration files
│   └── types/                 # TypeScript definitions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Migration history
├── scripts/                   # Utility scripts
├── public/                    # Static assets
├── _archived/                 # Deprecated files
└── [config files]            # TypeScript, ESLint, etc.
```

### Environment Variables

**Required:**
```env
# Database
DATABASE_URL="file:./data/db_v2.sqlite3"

# Snipe-IT API
SNIPEIT_API_URL="http://snipeit/api/v1"
SNIPEIT_API_KEY="your-api-key-here"

# NextAuth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**Production (Additional):**
```env
# Azure AD
AUTH_MICROSOFT_ENTRA_ID_ID="your-client-id"
AUTH_MICROSOFT_ENTRA_ID_SECRET="your-client-secret"
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID="your-tenant-id"
AUTH_MICROSOFT_ENTRA_ID_ISSUER="https://login.microsoftonline.com/your-tenant-id/v2.0"
```

### Development Workflow

#### Running Tests
```bash
npm test                 # Run all tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # Generate coverage report
```

#### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name description_of_changes

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only!)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

#### Seeding Data
```bash
# Seed development data (users, courses, equipment)
node scripts/seed-dev-data.js
```

#### Code Quality
```bash
npm run lint            # ESLint check
npm run build          # TypeScript compilation check
```

### Adding New Features

#### Example: Add New API Endpoint

1. **Create route handler** (`src/app/api/your-endpoint/route.ts`):
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your logic here
  return NextResponse.json({ data: 'result' });
}
```

2. **Add service layer logic** if needed
3. **Update Prisma schema** if database changes required
4. **Write tests**
5. **Update API documentation**

#### Example: Add New React Component

```typescript
// src/components/NewComponent.tsx
import { FC } from 'react';

interface NewComponentProps {
  title: string;
  items: string[];
}

const NewComponent: FC<NewComponentProps> = ({ title, items }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-gray-700">{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default NewComponent;
```

### Common Development Tasks

#### Check API Response Format
```bash
curl -H "Authorization: Bearer YOUR_SNIPEIT_KEY" \
  http://localhost:8080/api/v1/hardware | jq
```

#### View Database Contents
```bash
# Open Prisma Studio
npx prisma studio
```

#### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

#### View Container Logs
```bash
docker compose logs nextjs-app
docker compose logs snipeit
docker compose logs mysql
```

---

## Deployment Guide

### Production Checklist

- [ ] **Environment Variables**
  - [ ] All required vars set in `.env.production`
  - [ ] `AUTH_SECRET` is cryptographically random
  - [ ] Snipe-IT credentials are production keys
  - [ ] Azure AD credentials configured
  
- [ ] **Database**
  - [ ] Migrate from SQLite to PostgreSQL
  - [ ] Run `npx prisma migrate deploy`
  - [ ] Seed production data
  - [ ] Backup strategy in place

- [ ] **Authentication**
  - [ ] Azure AD integration tested
  - [ ] Remove mock credential provider
  - [ ] Configure authorized redirect URIs

- [ ] **Docker**
  - [ ] Use `docker-compose.yml` (not .dev.yml)
  - [ ] Set resource limits
  - [ ] Configure restart policies
  - [ ] Setup log rotation

- [ ] **Security**
  - [ ] HTTPS/TLS certificates configured
  - [ ] Rate limiting enabled
  - [ ] CORS policies set
  - [ ] Security headers configured

- [ ] **Monitoring**
  - [ ] Error logging configured
  - [ ] Uptime monitoring
  - [ ] Database backup verification

### Production Deployment Steps

#### Step 1: Server Preparation
```bash
# On production server
sudo apt update
sudo apt install docker.io docker-compose nodejs npm
sudo systemctl enable docker
sudo systemctl start docker
```

#### Step 2: Clone Repository
```bash
git clone https://github.com/your-org/the-cage.git
cd the-cage
```

#### Step 3: Configure Environment
```bash
cp .env.example .env.production
nano .env.production  # Edit with production values
```

#### Step 4: Build and Deploy
```bash
# Build production image
docker compose -f docker-compose.yml build

# Start services
docker compose -f docker-compose.yml up -d

# Apply database migrations
docker compose exec nextjs-app npx prisma migrate deploy

# Verify services
docker compose ps
```

#### Step 5: Configure Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name thecage.siue.edu;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 6: SSL/TLS Setup
```bash
sudo certbot --nginx -d thecage.siue.edu
```

---

## Testing & Quality Assurance

### Test Accounts (Development)

When `AUTH_DEV_CREDENTIALS=1`, the dev credentials provider accepts any password for the emails below (used only in local/dev). For production/UAT, use Entra ID SSO.

**Admin Accounts (dev-only):**
- Email: `aleith@siue.edu`
- Email: `tpauli@siue.edu`
- Email: `bemoyer@siue.edu`

**Student Accounts (dev-only):**
- Email: `jsmith@siue.edu`
- Email: `mjones@siue.edu`
- Email: `bwilson@siue.edu`

### UAT Test Scenarios

#### Scenario 1: Student Reservation Flow
1. Log in as student (`jsmith@siue.edu`)
2. Browse catalog → Select Canon XF605
3. Choose date (tomorrow) → Select Block A
4. Confirm reservation
5. Verify QR code appears
6. Check dashboard shows upcoming reservation

**Expected Result:** Reservation created successfully, QR code generated

#### Scenario 2: Admin Checkout Flow
1. Log in as admin (`aleith@siue.edu`)
2. Navigate to `/admin/scan`
3. Scan student's QR code
4. Verify success message
5. Check admin dashboard shows active checkout

**Expected Result:** Equipment checked out in both app and Snipe-IT

#### Scenario 3: Weekly Limit Enforcement
1. Log in as student
2. Make 3 reservations in same category (e.g., video cameras)
3. Attempt 4th reservation in same week
4. Verify error message appears

**Expected Result:** 4th reservation blocked with clear error message

#### Scenario 4: Course Restriction
1. Log in as student not enrolled in MC-401
2. Attempt to reserve equipment requiring MC-401
3. Verify error message

**Expected Result:** Reservation blocked with course requirement message

### Known Issues

#### Critical
- None currently

#### Medium Priority
1. **Mobile Safari Date Picker**: iOS date picker styling inconsistent (workaround: use desktop format)
2. **QR Scanner on Firefox**: Camera permission prompt occasionally requires page refresh

#### Low Priority
1. **Loading States**: Some API calls lack loading spinners
2. **Error Messages**: Could be more user-friendly in some edge cases

---

## Known Issues & Future Enhancements

### Phase 2 Enhancements (Post-Launch)

#### High Priority
1. **Email Notifications**
   - Reservation confirmation emails
   - Pickup reminders (24 hours before)
   - Late return warnings
   - Fee notifications

2. **Enhanced Analytics**
   - Equipment utilization reports
   - Popular equipment tracking
   - Peak usage hours
   - Student activity dashboard

3. **Mobile App**
   - Native iOS/Android apps
   - Push notifications
   - Offline QR code access

#### Medium Priority
4. **Waitlist System**
   - Queue for unavailable equipment
   - Automatic notification when available

5. **Equipment Management UI**
   - Admin interface for adding equipment
   - Bulk import/export
   - Maintenance scheduling

6. **Advanced Scheduling**
   - Multi-day reservations
   - Recurring reservations (e.g., every Monday)
   - Custom time blocks

#### Nice to Have
7. **Integration with Learning Management System**
   - Sync course enrollments automatically
   - Assignment-based reservations

8. **Equipment Guides**
   - Video tutorials per equipment
   - Quick start guides
   - FAQ section

9. **Social Features**
   - Student project showcases
   - Equipment reviews/ratings

---

## Support & Contact

### For Users
- **Technical Issues**: Contact aleith@siue.edu
- **Equipment Questions**: Visit The Cage office in Peck Hall
- **Account Access**: Contact SIUE IT Services

### For Developers
- **GitHub Repository**: [SIM-Lab-SIUE/the-cage](https://github.com/SIM-Lab-SIUE/the-cage)
- **Documentation**: This file + README.md
- **Lead Developer**: Alex P. Leith (aleith@siue.edu)

---

## Changelog

### Version 1.0 Beta (January 4, 2026)
- ✅ Complete MVP feature set
- ✅ Authentication system
- ✅ Reservation workflow
- ✅ Admin dashboard
- ✅ QR code checkout/checkin
- ✅ Course restrictions
- ✅ Weekly quota enforcement

### Version 0.9 Alpha (December 28, 2025)
- Core UI components
- Database schema
- Snipe-IT integration
- Basic reservation logic

### Version 0.1 Initial (December 4, 2025)
- Project initialization
- Docker setup
- Next.js scaffold

---

## License

Copyright © 2026 Southern Illinois University Edwardsville. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

**End of Documentation**

*For additional technical details, see individual markdown files in the project root.*

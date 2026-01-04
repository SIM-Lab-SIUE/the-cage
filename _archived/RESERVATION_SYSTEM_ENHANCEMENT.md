# Reservation System Enhancement

## Overview
Enhanced the reservation system to provide students with a comprehensive view of equipment availability and an intuitive way to schedule time blocks.

## Key Features Implemented

### 1. Availability API Endpoint
**File:** `src/app/api/equipment/[id]/availability/route.ts`

- Returns 30-day availability calendar for any equipment
- Shows available time blocks (Block A: 9am-1pm, Block B: 2pm-6pm) for each business day
- Includes existing reservations with privacy protection
- Tracks user's weekly block usage per category (3-block limit)
- Filters out weekends automatically

**Response Format:**
```json
{
  "assetId": 123,
  "assetTag": "CAM001",
  "modelName": "Sony Camera",
  "category": "Video Camera",
  "availability": [
    {
      "date": "2025-12-30",
      "dayOfWeek": "Mon",
      "blocks": {
        "A": { "available": true, "startTime": "...", "endTime": "..." },
        "B": { "available": false, "startTime": "...", "endTime": "..." }
      }
    }
  ],
  "userBlockUsage": {
    "category": "Video Camera",
    "blocksUsed": 1,
    "blocksRemaining": 2,
    "canReserve": true
  }
}
```

### 2. Interactive Availability Calendar Component
**File:** `src/components/AvailabilityCalendar.tsx`

Features:
- Visual week-by-week navigation (5 business days per view)
- Color-coded blocks:
  - White: Available
  - Gray: Already reserved
  - Blue: Currently selected
  - Yellow: User at block limit
- Real-time block limit tracking displayed prominently
- Legend for easy understanding
- Click-to-select interaction
- Disabled state when user reaches weekly limit

### 3. Enhanced Equipment Detail Page
**File:** `src/app/catalog/[id]/page.tsx`

Improvements:
- Replaced simple date picker with interactive calendar
- Shows availability for 30 days ahead
- Displays user's remaining blocks for that category
- Confirmation section shows all reservation details before booking
- Better error handling and user feedback

### 4. User Reservations API
**File:** `src/app/api/users/[id]/reservations/route.ts`

- Fetch all user reservations (upcoming and past)
- Calculate weekly block usage per category
- Privacy controls (users can only see their own reservations)

### 5. Dashboard Already Enhanced
**File:** `src/app/dashboard/page.tsx`

Existing features include:
- Quick stats for active checkouts, upcoming reservations, and quota usage
- Detailed lists of active and upcoming reservations
- Outstanding fees alerts
- Quick action links to catalog, calendar, and account

## Reservation Flow

1. **Browse Catalog** (`/catalog`)
   - Students see all available equipment
   - Can filter by category and search

2. **View Equipment Details** (`/catalog/[id]`)
   - See equipment information and status
   - Interactive 30-day availability calendar
   - Visual indicators for available/reserved blocks
   - See remaining weekly blocks for that category

3. **Select Time Block**
   - Click on available block (A or B) on any business day
   - System validates against 3-block weekly limit
   - Confirmation section shows all details

4. **Confirm Reservation**
   - Review equipment, date, and time
   - Click "Confirm Reservation"
   - System validates availability and limits

5. **Success & Dashboard** (`/dashboard`)
   - Redirected to success page
   - See upcoming reservations in dashboard
   - Track active checkouts and quota usage

## Business Rules Enforced

1. **Time Blocks:**
   - Block A: 9:00 AM - 1:00 PM (4 hours)
   - Block B: 2:00 PM - 6:00 PM (4 hours)

2. **3-Block Weekly Limit:**
   - Per equipment category (e.g., "Video Camera", "Audio Recorder")
   - ISO week-based (Monday to Sunday)
   - Real-time tracking and enforcement

3. **Weekdays Only:**
   - Reservations only available Monday-Friday
   - Weekends automatically excluded from calendar

4. **Advanced Booking:**
   - Students can book 1-30 days in advance
   - No same-day reservations (must be at least tomorrow)

5. **Outstanding Fees:**
   - Users with unpaid fines cannot make new reservations
   - Dashboard shows outstanding balance prominently

## Technical Details

### Technologies Used
- **Next.js 16** (App Router)
- **React 19** with hooks (useState, useEffect)
- **Prisma** for database access
- **date-fns** for date manipulation
- **Tailwind CSS** for styling

### Database Schema (Relevant Tables)
```prisma
model Reservation {
  id           String   @id @default(uuid())
  snipeAssetId Int
  userId       String
  startTime    DateTime
  endTime      DateTime
  status       String   @default("PENDING")
  category     String
  // ... relationships
}
```

### API Routes Created/Modified
- `GET /api/equipment/[id]/availability` - Get availability calendar
- `POST /api/reserve` - Create new reservation (existing)
- `GET /api/users/[id]/reservations` - Get user's reservations

## Testing Recommendations

1. **Happy Path:**
   - Login as student
   - Browse catalog
   - Select equipment
   - View availability calendar
   - Select available block
   - Confirm reservation
   - Verify in dashboard

2. **Block Limit:**
   - Make 3 reservations in same category in current week
   - Try to make 4th reservation
   - Verify yellow warning and disabled state

3. **Overlapping Reservations:**
   - Have two users try to book same block
   - Verify second user sees block as unavailable

4. **Weekend Filtering:**
   - Verify weekends don't appear in calendar

5. **Outstanding Fees:**
   - Create user with unpaid fine
   - Verify they see warning and can't reserve

## Future Enhancements

Potential improvements:
1. QR code generation for confirmed reservations
2. Email/SMS notifications for upcoming pickups
3. Cancellation functionality
4. Waitlist system for popular equipment
5. Equipment replacement suggestions when unavailable
6. Calendar view showing all equipment availability
7. Mobile-optimized interface
8. Push notifications

## Files Modified/Created

### New Files
- `src/app/api/equipment/[id]/availability/route.ts`
- `src/app/api/users/[id]/reservations/route.ts`
- `src/components/AvailabilityCalendar.tsx`

### Modified Files
- `src/app/catalog/[id]/page.tsx` - Enhanced with calendar component
- `src/app/api/reserve/route.ts` - Already existed, no changes needed

### Existing Files (No Changes)
- `src/app/dashboard/page.tsx` - Already had good UI
- `src/lib/block-limit.ts` - Block limit validation logic
- `prisma/schema.prisma` - Database schema

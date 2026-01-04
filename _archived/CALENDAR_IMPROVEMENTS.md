# Calendar & Catalog Improvements

## Issues Fixed

### 1. **Limited Equipment Display (Only 3 Items)**
**Problem:** The `/api/equipment` endpoint was only fetching 100 items and mock data showed 10 items.

**Solution:**
- Increased Snipe-IT API limit to 500 items
- Added status filter `status=RTD` (Ready to Deploy) to get deployable equipment
- Created new `/api/catalog/summary` endpoint that fetches from local database (Asset table) instead of relying only on Snipe-IT
- This ensures all equipment in the database is displayed

### 2. **Overly Simplified Calendar**
**Problem:** The original approach had a separate calendar on each equipment detail page, which would be repetitive.

**Solution:** Created a **Unified Calendar View** at `/calendar` that shows:

- **All equipment** in a timeline view (resource timeline)
- **All reservations** color-coded by status:
  - Blue = Reserved
  - Red = Checked Out
  - White/Empty = Available
- **Category filtering** to focus on specific equipment types
- **Interactive timeline** with multiple views:
  - Day view
  - Week view (default)
  - 4-week view for longer planning
- **Click-to-reserve**: Click any equipment row to navigate to detail page
- **Real-time stats** showing total equipment, active reservations, and current checkouts

## New Components & Features

### 1. Unified Calendar Component
**File:** `src/components/calendar/UnifiedCalendar.tsx`

Features:
- FullCalendar resource timeline integration
- Category filter buttons with item counts
- Color-coded legend
- Instructions for users
- Summary statistics cards
- 4-hour time slot display (9am-6pm)
- Weekdays only (no weekends)
- Click on equipment row to make reservation

### 2. Enhanced Calendar Page
**File:** `src/app/calendar/page.tsx`

- Fetches all assets from database
- Fetches all reservations for next 30 days
- Transforms data for FullCalendar format
- Server-side rendering for better performance

### 3. New API Endpoints

#### `/api/catalog/summary`
**File:** `src/app/api/catalog/summary/route.ts`

Returns:
```json
{
  "catalog": [...equipment with availability],
  "categoryGroups": [
    {
      "category": "Video Camera",
      "total": 15,
      "available": 12,
      "checkedOut": 3,
      "items": [...]
    }
  ],
  "summary": {
    "totalEquipment": 50,
    "totalAvailable": 42,
    "totalCheckedOut": 8
  }
}
```

#### `/api/calendar/availability`
**File:** `src/app/api/calendar/availability/route.ts`

Returns detailed availability data including:
- All equipment with reservation lists
- Category statistics
- Utilization rates
- Date range filtering support

### 4. Enhanced Catalog Page
**File:** `src/app/catalog/page.tsx`

Improvements:
- Shows real-time availability counts per category
- Category cards showing "X of Y available"
- "View Calendar" button in header
- Better loading/error states
- Uses new catalog summary API for accurate data

## User Flow Improvements

### Before:
1. Browse catalog (limited items)
2. Click equipment → see individual availability calendar
3. Each equipment page had its own calendar (repetitive)

### After:
1. **Browse Catalog** - See ALL equipment with real-time availability stats per category
2. **View Unified Calendar** - See ALL equipment and reservations in one timeline view
3. **Filter by Category** - Focus on specific equipment types
4. **Click to Reserve** - Click equipment row in calendar or catalog to make reservation
5. **Individual Detail** - Each equipment page still has detailed 30-day availability calendar

## Technical Improvements

### Data Flow
```
Database (Prisma) 
    ↓
API Endpoints (/api/catalog/summary, /api/calendar/availability)
    ↓
React Components (Catalog Page, Calendar Page)
    ↓
User Interface
```

### Performance
- Server-side data fetching (Next.js App Router)
- Cached category calculations
- Efficient database queries with indexes
- Reduced API calls by using database directly

### Scalability
- Handles 500+ equipment items
- Pagination-ready structure
- Category-based filtering reduces load
- Optimized reservation queries

## Visual Improvements

### Calendar View
- Professional timeline layout
- Color coding for status
- Category filters with counts
- Summary statistics
- Responsive design

### Catalog View
- Category availability cards
- Real-time status badges
- Quick access to calendar view
- Better search and filtering

## Benefits

1. **Single Source of Truth** - Unified calendar shows all equipment availability
2. **Better Planning** - Students can see all available equipment at once
3. **Reduced Repetition** - One calendar instead of many individual ones
4. **More Equipment** - Shows all items in database, not just first 3
5. **Better UX** - Clearer navigation between catalog and calendar
6. **Real-time Status** - Accurate availability based on actual checkouts

## Navigation Flow

```
Dashboard
    ↓
    ├─→ Catalog (Browse all equipment by category)
    │       ↓
    │       └─→ Equipment Detail (Individual availability + reserve)
    │
    └─→ Calendar (Unified view of all equipment & reservations)
            ↓
            └─→ Click equipment → Equipment Detail
```

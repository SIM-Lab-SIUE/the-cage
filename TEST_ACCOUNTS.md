# Test Accounts

This document lists the test accounts available for development testing.

**Note:** In development mode (`AUTH_DEV_CREDENTIALS=1`), any password will work. The system only validates the email domain (@siue.edu).

## Admin Accounts

These accounts have full administrative access to the system:

| Email | Name | Role | SnipeIT ID |
|-------|------|------|------------|
| aleith@siue.edu | Alex Leith | admin | 1001 |
| tpauli@siue.edu | Tom Pauli | admin | 1002 |
| bemoyer@siue.edu | Ben Moyer | admin | 1003 |

**Admin Capabilities:**
- View all equipment and reservations
- Access admin dashboard at `/admin/dashboard`
- Check out equipment to students
- Check in equipment
- View QR codes for reservations
- Manage inventory

## Student Accounts

These accounts have standard student access:

| Email | Name | Role | SnipeIT ID | Enrolled Courses |
|-------|------|------|------------|------------------|
| jsmith@siue.edu | John Smith | student | 2001 | COMM-226 |
| mjones@siue.edu | Mary Jones | student | 2002 | COMM-326 |
| bwilson@siue.edu | Bob Wilson | student | 2003 | None |

**Student Capabilities:**
- Browse equipment catalog
- Make reservations (subject to 3-block weekly limit)
- View their own reservations
- Get pickup confirmation codes
- Cannot view QR codes (admin-only feature)
- See only equipment available to their enrolled courses

## Sample Equipment

The development database includes these test assets:

| Asset Tag | Model | Category |
|-----------|-------|----------|
| CAM-0001 | Sony FX3 | Camera |
| CAM-0002 | Canon EOS R5 | Camera |
| CAM-0003 | Sony A7S III | Camera |
| LENS-0001 | Sony 24-70mm f/2.8 | Lens |
| LENS-0002 | Canon RF 50mm f/1.2 | Lens |
| AUDIO-0001 | Zoom H6 | Audio Recorder |
| AUDIO-0002 | Sennheiser MKH 416 | Microphone |
| LIGHT-0001 | Aputure 300d II | Lighting |

## Sample Courses

| Course Code | Semester |
|-------------|----------|
| COMM-226 | Spring 2026 |
| COMM-326 | Spring 2026 |
| COMM-426 | Spring 2026 |
| COMM-330 | Spring 2026 |

## Testing Scenarios

### Scenario 1: Student Reservation Flow
1. Log in as `jsmith@siue.edu` (enrolled in COMM-226)
2. Browse catalog - should see equipment available to COMM-226
3. Make a reservation
4. View "My Reservations" to see confirmation code
5. Note: No QR code visible (student view)

### Scenario 2: Admin Checkout Flow
1. Log in as `aleith@siue.edu`
2. Navigate to `/admin/dashboard`
3. Student shows up with confirmation code
4. Enter code to check out equipment
5. Equipment marked as checked out in Snipe-IT

### Scenario 3: Course Restrictions
1. Log in as `bwilson@siue.edu` (not enrolled in any courses)
2. Browse catalog - should see limited equipment
3. Compare with admin view (all equipment visible)

### Scenario 4: Weekly Block Limit
1. Log in as `mjones@siue.edu`
2. Make 3 reservations (different time blocks)
3. Attempt 4th reservation - should be blocked
4. View dashboard - quota indicator shows 3/3 blocks used

## Resetting Test Data

To reset the database to a clean state:

```bash
# Stop the app
docker compose stop nextjs-app

# Delete database
sudo rm -f data/db_v2.sqlite3*

# Run migrations
docker compose run --rm nextjs-app npx prisma migrate deploy

# Seed test data
node scripts/seed-dev-data.js

# Restart app
docker compose up -d nextjs-app
```

## Production Note

When deploying to production with Microsoft Entra ID:
- These test accounts will not work
- Users will authenticate via SIUE SSO
- Admin list should be moved to environment variable
- See [ENTRA_ID_SETUP.md](./ENTRA_ID_SETUP.md) for configuration steps

import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

// Mocked function to get active reservations for a user
async function getActiveReservations(userId: string): Promise<{ startTime: Date; endTime: Date }[]> {
  // Replace with actual database query
  return [
    { startTime: new Date('2025-12-08T10:00:00Z'), endTime: new Date('2025-12-08T12:00:00Z') },
    { startTime: new Date('2025-12-10T14:00:00Z'), endTime: new Date('2025-12-10T16:00:00Z') },
  ];
}

// Hardcoded course-to-asset mapping
const COURSE_ASSET_MAP: Record<string, string> = {
  MC401: 'Camera',
  MC402: 'Lighting',
};

// Mocked function to check if a user has a course tag
async function userHasCourseTag(userId: string, courseCode: string): Promise<boolean> {
  // Replace with actual logic to check user tags
  return courseCode === 'MC401';
}

/**
 * Validates a reservation request based on predefined rules.
 * @param userId - The ID of the user making the reservation.
 * @param assetCategory - The category of the asset being reserved.
 * @param date - The date of the reservation.
 * @returns An object indicating whether the reservation is allowed and the reason if not.
 */
export async function validateReservation(userId: string, assetCategory: string, date: Date): Promise<{ allowed: boolean; reason?: string }> {
  // Rule 1: Block Limit
  const reservations = await getActiveReservations(userId);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

  const activeReservationsThisWeek = reservations.filter((reservation) =>
    isWithinInterval(reservation.startTime, { start: weekStart, end: weekEnd })
  );

  if (activeReservationsThisWeek.length >= 3) {
    return { allowed: false, reason: 'Block Limit: You cannot have more than 3 active reservations in a single week.' };
  }

  // Rule 2: Course Check
  const requiredCourse = Object.keys(COURSE_ASSET_MAP).find(
    (courseCode) => COURSE_ASSET_MAP[courseCode] === assetCategory
  );

  if (requiredCourse && !(await userHasCourseTag(userId, requiredCourse))) {
    return { allowed: false, reason: `Course Check: You must be enrolled in ${requiredCourse} to reserve this asset.` };
  }

  // If all checks pass
  return { allowed: true };
}
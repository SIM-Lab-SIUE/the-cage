import { PrismaClient, Block } from '@prisma/client';

const prisma = new PrismaClient();

// Refactor the BLOCKS configuration to be explicit about start days and times
type BlockType = 'A' | 'B' | 'C';

const BLOCKS: Record<BlockType, { startDays: string[]; startTime: string }> = {
  A: {
    startDays: ['Mon', 'Tue', 'Wed', 'Thu'],
    startTime: '09:00',
  },
  B: {
    startDays: ['Mon', 'Tue', 'Wed', 'Thu'],
    startTime: '14:00',
  },
  C: {
    startDays: ['Fri'], // Only Friday is a valid START day for Block C
    startTime: '09:00',
  },
};

// Get available blocks for a specific date
export function getAvailableBlocks(date: Date): BlockType[] {
  // 1. Get the current day name (e.g., "Mon")
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

  const available: BlockType[] = [];

  // 2. Iterate through config
  // (Using Object.keys to iterate safely)
  (Object.keys(BLOCKS) as BlockType[]).forEach((blockKey) => {
    const block = BLOCKS[blockKey];
    
    // 3. Simple Check: Is today a valid start day?
    if (block.startDays.includes(dayName)) {
      available.push(blockKey);
    }
  });

  return available;
}

// Validate reservation request
export async function validateReservationRequest(
  prisma: PrismaClient, // Inject PrismaClient dependency
  user: { id: string; weekQuotaUsed: number; enrolledCourses: string[] },
  asset: { id: number; requiredCourses: string[] },
  block: string,
  date: Date
): Promise<string | null> {
  // Check availability
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      assetId: asset.id,
      block: block as Block, // Explicitly cast block to the correct type
      startTime: date,
    },
  });

  if (existingReservation) {
    return 'Block Unavailable';
  }

  // Check user quota
  if (user.weekQuotaUsed >= 3) {
    return 'Weekly Limit Exceeded';
  }

  // Check permissions
  const hasPermission = asset.requiredCourses.some((course) =>
    user.enrolledCourses.includes(course)
  );

  if (!hasPermission) {
    return 'Course Restriction';
  }

  return null; // Validation passed
}
import { PrismaClient } from '@prisma/client';
import { addHours, isBefore, isAfter } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Checks if an asset is available for reservation within the given time window.
 * @param assetId - The ID of the asset to check.
 * @param start - The requested start time.
 * @param end - The requested end time.
 * @returns True if the asset is available, false otherwise.
 */
export async function checkAvailability(assetId: number, start: Date, end: Date): Promise<boolean> {
  // Define the buffer hour duration
  const BUFFER_HOURS = 1;

  // Adjust the requested time window to account for the buffer
  const adjustedStart = addHours(start, -BUFFER_HOURS);
  const adjustedEnd = addHours(end, BUFFER_HOURS);

  // Query the database for overlapping reservations
  const overlappingReservations = await prisma.reservation.findMany({
    where: {
      snipeAssetId: assetId,
      OR: [
        {
          startTime: { lte: adjustedEnd },
          endTime: { gte: adjustedStart },
        },
      ],
    },
  });

  // If there are any overlapping reservations, the asset is not available
  return overlappingReservations.length === 0;
}
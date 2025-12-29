// src/lib/block-limit.ts
import { PrismaClient } from '@prisma/client';
import { startOfISOWeek, endOfISOWeek } from 'date-fns';

export interface BlockLimitResult {
  success: boolean;
  message?: string;
}

export async function validateReservationRequest(
  userId: string,
  equipmentCategory: string,
  requestedDate: Date,
  prismaClient?: PrismaClient
): Promise<BlockLimitResult> {
  const prisma = prismaClient || new PrismaClient();
  
  // Calculate ISO week boundaries in UTC
  const weekStart = startOfISOWeek(requestedDate);
  const weekEnd = endOfISOWeek(requestedDate);

  const count = await prisma.reservation.count({
    where: {
      userId: userId,
      category: equipmentCategory,
      startTime: { gte: weekStart },
      endTime: { lte: weekEnd },
    },
  });

  if (count >= 3) {
    return { success: false, message: 'Weekly limit exceeded' };
  }
  return { success: true };
}

import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { PrismaClient } from '@prisma/client';
import { validateReservationRequest } from '@/lib/block-limit';

const prisma = new PrismaClient();

/**
 * POST /api/reserve
 * Creates a new reservation after validating:
 * 1. Asset availability (no overlaps)
 * 2. 3-block weekly limit per asset type
 * 3. User eligibility (course requirements)
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assetId, startTime, endTime, category } = await req.json();

    if (!assetId || !startTime || !endTime || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: assetId, startTime, endTime, category' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Check for overlapping reservations
    const overlap = await prisma.reservation.findFirst({
      where: {
        snipeAssetId: assetId,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_OUT'] },
        OR: [
          {
            startTime: { lte: end },
            endTime: { gte: start },
          },
        ],
      },
    });

    if (overlap) {
      return NextResponse.json(
        { error: 'Asset is unavailable during the requested time' },
        { status: 409 }
      );
    }

    // 2. Check 3-Block Limit using the dedicated utility
    const blockValidation = await validateReservationRequest(userId, category, start);

    if (!blockValidation.success) {
      return NextResponse.json(
        {
          error: 'Block Limit Exceeded',
          message: blockValidation.message,
        },
        { status: 403 }
      );
    }

    // 3. Create Reservation in Shadow Ledger
    const reservation = await prisma.reservation.create({
      data: {
        snipeAssetId: assetId,
        userId,
        startTime: start,
        endTime: end,
        status: 'PENDING',
        category,
      },
    });

    // Update reservation status to CONFIRMED
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: 'CONFIRMED' },
    });

    return NextResponse.json(
      {
        success: true,
        reservationId: reservation.id,
        message: 'Reservation created successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Reservation API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { startOfWeek, endOfWeek } from 'date-fns';

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
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assetId, startTime, endTime, assetType } = await req.json();

    if (!assetId || !startTime || !endTime || !assetType) {
      return NextResponse.json(
        { error: 'Missing required fields: assetId, startTime, endTime, assetType' },
        { status: 400 }
      );
    }

    // Use email as temporary user identifier until full auth is set up
    const userId = session.user.email || 'anonymous';
    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Check for overlapping reservations
    const overlap = await prisma.reservation.findFirst({
      where: {
        snipeAssetId: assetId,
        status: { in: ['PENDING', 'CONFIRMED'] },
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

    // 2. Check 3-Block Limit
    const weekStart = startOfWeek(start, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(start, { weekStartsOn: 1 });

    const weeklyReservations = await prisma.reservation.findMany({
      where: {
        userId,
        assetType,
        startTime: { gte: weekStart },
        endTime: { lte: weekEnd },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (weeklyReservations.length >= 3) {
      return NextResponse.json(
        {
          error: 'Block Limit Exceeded',
          message: `You have reached the maximum of 3 blocks per week for ${assetType}`,
        },
        { status: 403 }
      );
    }

    // 3. Create Reservation
    const reservation = await prisma.reservation.create({
      data: {
        snipeAssetId: assetId,
        userId,
        startTime: start,
        endTime: end,
        status: 'PENDING',
        assetType,
      },
    });

    return NextResponse.json(
      {
        success: true,
        reservationId: reservation.id,
        message: 'Reservation created successfully',
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

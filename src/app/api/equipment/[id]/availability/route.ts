import { NextResponse, type NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '../../../../../../auth';
import { startOfISOWeek, endOfISOWeek, addDays, startOfDay } from 'date-fns';

const prisma = new PrismaClient();

/**
 * GET /api/equipment/[id]/availability
 * 
 * Returns availability for a specific equipment over the next 30 days
 * Shows:
 * - Available time blocks (A: 9am-1pm, B: 2pm-6pm) for each day
 * - Existing reservations
 * - User's block count per category for the week
 * - Whether user can book based on 3-block limit
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const daysAhead = parseInt(searchParams.get('days') || '30');
    
    const resolvedParams = await context.params;
    const assetId = parseInt(resolvedParams.id);
    
    if (isNaN(assetId)) {
      return NextResponse.json(
        { error: 'Invalid asset ID' },
        { status: 400 }
      );
    }

    const today = startOfDay(new Date());
    const endDate = addDays(today, daysAhead);

    // Get asset details
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Get all reservations for this asset in the date range
    const reservations = await prisma.reservation.findMany({
      where: {
        snipeAssetId: assetId,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_OUT'] },
        startTime: { gte: today },
        endTime: { lte: endDate },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Build availability calendar
    const availabilityDays = [];
    for (let i = 1; i <= daysAhead; i++) {
      const date = addDays(today, i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Skip weekends
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      // Check Block A (9am-1pm)
      const blockAStart = new Date(date);
      blockAStart.setHours(9, 0, 0, 0);
      const blockAEnd = new Date(date);
      blockAEnd.setHours(13, 0, 0, 0);

      const blockAReserved = reservations.some(r => 
        r.startTime <= blockAEnd && r.endTime >= blockAStart
      );

      // Check Block B (2pm-6pm)
      const blockBStart = new Date(date);
      blockBStart.setHours(14, 0, 0, 0);
      const blockBEnd = new Date(date);
      blockBEnd.setHours(18, 0, 0, 0);

      const blockBReserved = reservations.some(r => 
        r.startTime <= blockBEnd && r.endTime >= blockBStart
      );

      availabilityDays.push({
        date: dateStr,
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        blocks: {
          A: {
            available: !blockAReserved,
            startTime: blockAStart.toISOString(),
            endTime: blockAEnd.toISOString(),
          },
          B: {
            available: !blockBReserved,
            startTime: blockBStart.toISOString(),
            endTime: blockBEnd.toISOString(),
          },
        },
      });
    }

    // If user is logged in, get their block usage for this category
    let userBlockUsage = null;
    if (session?.user?.id) {
      const userId = session.user.id;
      const weekStart = startOfISOWeek(today);
      const weekEnd = endOfISOWeek(today);

      const userReservations = await prisma.reservation.count({
        where: {
          userId,
          category: asset.category,
          startTime: { gte: weekStart },
          endTime: { lte: weekEnd },
          status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_OUT'] },
        },
      });

      userBlockUsage = {
        category: asset.category,
        blocksUsed: userReservations,
        blocksRemaining: Math.max(0, 3 - userReservations),
        canReserve: userReservations < 3,
      };
    }

    return NextResponse.json({
      assetId,
      assetTag: asset.assetTag,
      modelName: asset.modelName,
      category: asset.category,
      availability: availabilityDays,
      reservations: reservations.map(r => ({
        id: r.id,
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status,
        // Only show student name if it's the current user
        studentName: session?.user?.id === r.userId ? r.user.name : 'Reserved',
      })),
      userBlockUsage,
    });
  } catch (error) {
    console.error('Availability API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

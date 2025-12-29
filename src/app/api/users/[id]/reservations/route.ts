import { NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { PrismaClient } from '@prisma/client';
import { startOfISOWeek, endOfISOWeek } from 'date-fns';

const prisma = new PrismaClient();

/**
 * GET /api/users/[id]/reservations
 * 
 * Returns all reservations for a user with:
 * - Upcoming reservations
 * - Past reservations
 * - Block usage summary per category
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const requestedUserId = (await Promise.resolve(params)).id || params.id;
    
    // Users can only view their own reservations unless they're admin
    if (session.user.id !== requestedUserId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const now = new Date();
    const weekStart = startOfISOWeek(now);
    const weekEnd = endOfISOWeek(now);

    // Get all reservations
    const allReservations = await prisma.reservation.findMany({
      where: {
        userId: requestedUserId,
      },
      include: {
        asset: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Split into upcoming and past
    const upcoming = allReservations.filter(r => 
      r.endTime >= now && r.status !== 'CANCELLED'
    );
    
    const past = allReservations.filter(r => 
      r.endTime < now || r.status === 'CANCELLED'
    );

    // Calculate block usage per category for current week
    const categoryUsage: Record<string, { blocksUsed: number; blocksRemaining: number; canReserve: boolean }> = {};
    
    const thisWeekReservations = allReservations.filter(r => 
      r.startTime >= weekStart && 
      r.startTime <= weekEnd &&
      r.status !== 'CANCELLED'
    );

    thisWeekReservations.forEach(r => {
      if (!categoryUsage[r.category]) {
        categoryUsage[r.category] = { blocksUsed: 0, blocksRemaining: 3, canReserve: true };
      }
      categoryUsage[r.category].blocksUsed++;
    });

    // Update remaining blocks
    Object.keys(categoryUsage).forEach(category => {
      categoryUsage[category].blocksRemaining = Math.max(0, 3 - categoryUsage[category].blocksUsed);
      categoryUsage[category].canReserve = categoryUsage[category].blocksUsed < 3;
    });

    return NextResponse.json({
      upcoming: upcoming.map(r => ({
        id: r.id,
        assetId: r.snipeAssetId,
        assetTag: r.asset.assetTag,
        modelName: r.asset.modelName,
        category: r.category,
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status,
      })),
      past: past.map(r => ({
        id: r.id,
        assetId: r.snipeAssetId,
        assetTag: r.asset.assetTag,
        modelName: r.asset.modelName,
        category: r.category,
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status,
      })),
      categoryUsage,
    });
  } catch (error) {
    console.error('User Reservations API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

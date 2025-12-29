import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfDay, addDays } from 'date-fns';

const prisma = new PrismaClient();

/**
 * GET /api/calendar/availability
 * 
 * Returns all equipment with their reservations for calendar display
 * Query params:
 * - startDate: ISO date string (default: today)
 * - endDate: ISO date string (default: 30 days from now)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const categoryFilter = searchParams.get('category');

    const startDate = startDateParam ? new Date(startDateParam) : startOfDay(new Date());
    const endDate = endDateParam ? new Date(endDateParam) : addDays(startDate, 30);

    // Fetch all assets
    const assetsQuery: any = {
      orderBy: [
        { category: 'asc' },
        { modelName: 'asc' },
      ],
    };

    if (categoryFilter && categoryFilter !== 'all') {
      assetsQuery.where = { category: categoryFilter };
    }

    const assets = await prisma.asset.findMany(assetsQuery);

    // Fetch reservations in date range
    const reservations = await prisma.reservation.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_OUT'] },
        OR: [
          {
            startTime: { lte: endDate },
            endTime: { gte: startDate },
          },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Group reservations by asset
    const reservationsByAsset: Record<number, any[]> = {};
    reservations.forEach(res => {
      if (!reservationsByAsset[res.snipeAssetId]) {
        reservationsByAsset[res.snipeAssetId] = [];
      }
      reservationsByAsset[res.snipeAssetId].push({
        id: res.id,
        startTime: res.startTime,
        endTime: res.endTime,
        status: res.status,
        studentName: res.user.name,
      });
    });

    // Build response with availability info
    const equipmentAvailability = assets.map(asset => {
      const assetReservations = reservationsByAsset[asset.id] || [];
      const activeReservation = assetReservations.find(
        r => r.status === 'CHECKED_OUT' && r.endTime >= new Date()
      );

      return {
        id: asset.id,
        assetTag: asset.assetTag,
        modelName: asset.modelName,
        category: asset.category,
        isAvailable: !activeReservation,
        currentStatus: activeReservation ? 'CHECKED_OUT' : 'AVAILABLE',
        reservations: assetReservations,
        reservationCount: assetReservations.length,
      };
    });

    // Get category statistics
    const categories = Array.from(new Set(assets.map(a => a.category)));
    const categoryStats = categories.map(cat => {
      const catEquipment = equipmentAvailability.filter(e => e.category === cat);
      const available = catEquipment.filter(e => e.isAvailable).length;
      const total = catEquipment.length;
      
      return {
        category: cat,
        total,
        available,
        checkedOut: total - available,
        utilizationRate: total > 0 ? Math.round(((total - available) / total) * 100) : 0,
      };
    });

    return NextResponse.json({
      equipment: equipmentAvailability,
      stats: {
        total: assets.length,
        available: equipmentAvailability.filter(e => e.isAvailable).length,
        checkedOut: equipmentAvailability.filter(e => !e.isAvailable).length,
        totalReservations: reservations.length,
      },
      categoryStats,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    });
  } catch (error) {
    console.error('Calendar Availability API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

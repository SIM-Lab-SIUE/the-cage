import { NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/admin/reservations
 * 
 * Fetches reservations for admin view with filtering options
 * Query params: status, date, userId
 */
export async function GET(req: Request) {
  try {
    const session = await auth();

    // Verify admin access
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.email?.includes('admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');

    // Build query filters
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      where.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (userId) {
      where.userId = userId;
    }

    // Fetch reservations
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            snipeItUserId: true,
          },
        },
        asset: {
          select: {
            id: true,
            assetTag: true,
            modelName: true,
            category: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      reservations,
      count: reservations.length,
    });
  } catch (error) {
    console.error('Admin Reservations API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

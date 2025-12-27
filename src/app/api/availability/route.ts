import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import snipeITClient from '@/services/snipeit';

const prisma = new PrismaClient();

interface SnipeITAsset {
  id: string | number;
  modelName: string;
  assetTag: string;
  category?: string;
  [key: string]: unknown;
}

/**
 * GET /api/availability?assetId=:assetId&startDate=:startDate&endDate=:endDate
 * 
 * Returns availability data by merging:
 * 1. Snipe-IT asset status (is it broken, in maintenance, etc?)
 * 2. Shadow DB reservations (what times are booked?)
 * 
 * Response format:
 * {
 *   assetId: number,
 *   name: string,
 *   status: "Ready" | "Unavailable",
 *   reservations: [ { startTime, endTime, userId, studentName }, ... ]
 * }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!assetId) {
      return NextResponse.json(
        { error: 'Missing required parameter: assetId' },
        { status: 400 }
      );
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 7 days ahead

    // 1. Get asset details from Snipe-IT
    let asset: SnipeITAsset;
    try {
      const assets = await snipeITClient.getAssets({ limit: 1 });
      // In production, filter by assetId here
      asset = assets[0] || { id: assetId, modelName: 'Unknown', assetTag: 'N/A' };
    } catch (error) {
      console.warn('Could not fetch from Snipe-IT, returning Shadow DB only:', error);
      asset = { id: assetId, modelName: 'Unknown', assetTag: 'N/A' };
    }

    // 2. Get reservations from Shadow DB
    const reservations = await prisma.reservation.findMany({
      where: {
        snipeAssetId: parseInt(assetId as string),
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_OUT'] },
        OR: [
          {
            startTime: { lte: end },
            endTime: { gte: start },
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

    // 3. Determine if asset is available
    const snipeStatus = asset.status || 'Ready to Deploy';
    const isAvailable =
      snipeStatus === 'Ready to Deploy' && reservations.length === 0;

    return NextResponse.json({
      assetId,
      name: asset.modelName,
      assetTag: asset.assetTag,
      snipeStatus,
      isAvailable,
      reservations: reservations.map((r) => ({
        id: r.id,
        startTime: r.startTime,
        endTime: r.endTime,
        studentName: r.user.name,
        studentEmail: r.user.email,
        status: r.status,
      })),
    });
  } catch (error) {
    console.error('Availability API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

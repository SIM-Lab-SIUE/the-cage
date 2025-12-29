import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/catalog/summary
 * 
 * Returns equipment catalog with real-time availability summary
 * Shows how many items are available vs checked out in each category
 */
export async function GET() {
  try {
    // Get all assets
    const assets = await prisma.asset.findMany({
      orderBy: [
        { category: 'asc' },
        { modelName: 'asc' },
      ],
    });

    // Get current active checkouts
    const now = new Date();
    const activeReservations = await prisma.reservation.findMany({
      where: {
        status: 'CHECKED_OUT',
        endTime: { gte: now },
      },
      select: {
        snipeAssetId: true,
      },
    });

    const checkedOutAssetIds = new Set(activeReservations.map(r => r.snipeAssetId));

    // Build catalog with availability
    const catalog = assets.map(asset => ({
      id: asset.id,
      assetTag: asset.assetTag,
      modelName: asset.modelName,
      category: asset.category,
      isAvailable: !checkedOutAssetIds.has(asset.id),
    }));

    // Group by category
    const categories = Array.from(new Set(assets.map(a => a.category)));
    const categoryGroups = categories.map(cat => {
      const items = catalog.filter(item => item.category === cat);
      return {
        category: cat,
        total: items.length,
        available: items.filter(i => i.isAvailable).length,
        checkedOut: items.filter(i => !i.isAvailable).length,
        items: items,
      };
    });

    return NextResponse.json({
      catalog,
      categoryGroups,
      summary: {
        totalEquipment: assets.length,
        totalAvailable: catalog.filter(i => i.isAvailable).length,
        totalCheckedOut: catalog.filter(i => !i.isAvailable).length,
      },
    });
  } catch (error) {
    console.error('Catalog Summary API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

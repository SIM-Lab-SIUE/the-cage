import React from 'react';
import { PrismaClient } from '@prisma/client';
import UnifiedCalendar from '@/components/calendar/UnifiedCalendar';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  // Fetch all assets from database
  const assets = await prisma.asset.findMany({
    orderBy: [
      { category: 'asc' },
      { modelName: 'asc' },
    ],
  });

  // Fetch all confirmed reservations for the next 30 days
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 30);

  const reservations = await prisma.reservation.findMany({
    where: {
      status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_OUT'] },
      startTime: { gte: today },
      endTime: { lte: futureDate },
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      asset: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  // Transform data for calendar
  const resources = assets.map(asset => ({
    id: asset.id.toString(),
    title: `${asset.modelName} (${asset.assetTag})`,
    category: asset.category,
  }));

  const events = reservations.map(res => ({
    id: res.id,
    resourceId: res.snipeAssetId.toString(),
    start: res.startTime.toISOString(),
    end: res.endTime.toISOString(),
    title: res.status === 'CHECKED_OUT' ? 'Checked Out' : 'Reserved',
    backgroundColor: res.status === 'CHECKED_OUT' ? '#ef4444' : '#3b82f6',
    borderColor: res.status === 'CHECKED_OUT' ? '#dc2626' : '#2563eb',
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[95%] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Equipment Availability Calendar</h1>
          <p className="text-gray-600">
            View all equipment reservations and availability across the next 30 days
          </p>
        </div>
        <UnifiedCalendar resources={resources} events={events} />
      </div>
    </div>
  );
}

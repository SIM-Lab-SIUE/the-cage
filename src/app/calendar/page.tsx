import React from 'react';
import snipeITClient from '@/services/snipeit';
import ResourceCalendar from '@/components/calendar/ResourceCalendar';

export const dynamic = 'force-dynamic'; // Ensure this page is not statically cached if we want fresh data

export default async function CalendarPage() {
  // Fetch assets from Snipe-IT
  const assets = await snipeITClient.getAssets({ limit: 20 });

  // Transform Snipe-IT assets to FullCalendar resources
  const resources = assets.map((asset: any) => ({
    id: asset.id.toString(),
    title: `${asset.modelName} (${asset.assetTag})`,
    extendedProps: asset,
  }));

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Equipment Availability</h1>
      <div className="flex-grow">
        <ResourceCalendar resources={resources} events={[]} />
      </div>
    </div>
  );
}

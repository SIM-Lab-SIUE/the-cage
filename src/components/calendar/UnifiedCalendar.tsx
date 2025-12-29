'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { useRouter } from 'next/navigation';

interface Resource {
  id: string;
  title: string;
  category?: string;
}

interface CalendarEvent {
  id: string;
  resourceId: string;
  start: string;
  end: string;
  title: string;
  backgroundColor?: string;
  borderColor?: string;
}

interface UnifiedCalendarProps {
  resources: Resource[];
  events: CalendarEvent[];
}

export default function UnifiedCalendar({ resources, events }: UnifiedCalendarProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = Array.from(new Set(resources.map(r => r.category).filter(Boolean)));
  
  // Filter resources by category
  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(r => r.category === selectedCategory);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDateClick = (arg: any) => {
    const resourceId = arg.resource?.id;
    if (resourceId) {
      // Navigate to equipment detail page
      router.push(`/catalog/${resourceId}`);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventClick = (arg: any) => {
    // Could show reservation details
    console.log('Event clicked:', arg.event);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Filter by Category
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Equipment ({resources.length})
          </button>
          {categories.map(category => {
            const count = resources.filter(r => r.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category || 'all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-700">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700">Checked Out</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
          <span className="text-gray-700">Available</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Click on any equipment row</strong> to view detailed availability and make a reservation.
          The timeline shows Block A (9am-1pm) and Block B (2pm-6pm) for each business day.
        </p>
      </div>

      {/* Calendar */}
      <div className="calendar-container">
        <FullCalendar
          plugins={[resourceTimelinePlugin, interactionPlugin]}
          initialView="resourceTimelineWeek"
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          resources={filteredResources}
          events={events}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineFourWeeks'
          }}
          views={{
            resourceTimelineFourWeeks: {
              type: 'resourceTimeline',
              duration: { weeks: 4 },
              buttonText: '4 weeks'
            }
          }}
          slotDuration="04:00:00"
          slotLabelInterval="04:00:00"
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          height="auto"
          resourceAreaWidth="20%"
          resourceAreaHeaderContent="Equipment"
          editable={false}
          selectable={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          slotMinTime="09:00:00"
          slotMaxTime="18:00:00"
          weekends={false}
          nowIndicator={true}
          eventContent={(arg) => {
            return (
              <div className="px-2 py-1 text-xs font-medium truncate">
                {arg.event.title}
              </div>
            );
          }}
        />
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{filteredResources.length}</div>
          <div className="text-sm text-gray-600">Equipment Items</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">{events.filter(e => e.title === 'Reserved').length}</div>
          <div className="text-sm text-blue-700">Active Reservations</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-900">{events.filter(e => e.title === 'Checked Out').length}</div>
          <div className="text-sm text-red-700">Currently Checked Out</div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { useRouter } from 'next/navigation';

interface Resource {
  id: string;
  title: string;
  category?: string;
  assetTag?: string;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20; // show 20 resources per page to handle 100+ items

  // Get unique categories
  const categories = useMemo(
    () => Array.from(new Set(resources.map((r) => r.category).filter(Boolean))),
    [resources]
  );

  // Filter resources by category and search
  const filteredResources = useMemo(() => {
    const byCategory = selectedCategory === 'all'
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

    if (!searchTerm.trim()) return byCategory;

    const term = searchTerm.toLowerCase();
    return byCategory.filter((r) =>
      r.title.toLowerCase().includes(term) ||
      (r.assetTag && r.assetTag.toLowerCase().includes(term))
    );
  }, [resources, selectedCategory, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pagedResources = filteredResources.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const visibleResourceIds = useMemo(
    () => new Set(pagedResources.map((r) => r.id)),
    [pagedResources]
  );

  const visibleEvents = useMemo(
    () => events.filter((e) => visibleResourceIds.has(e.resourceId)),
    [events, visibleResourceIds]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDateClick = (arg: any) => {
    // Clicking a row header navigates to detail page
    const resourceId = arg.resource?.id;
    if (!resourceId) return;

    // Snap selection to nearest 4-hour block (A or B)
    const clicked = new Date(arg.date);
    const blockStart = new Date(clicked);
    const blockEnd = new Date(clicked);
    const hour = clicked.getHours();

    if (hour < 14) {
      blockStart.setHours(9, 0, 0, 0);
      blockEnd.setHours(13, 0, 0, 0);
    } else {
      blockStart.setHours(14, 0, 0, 0);
      blockEnd.setHours(18, 0, 0, 0);
    }

    const startISO = blockStart.toISOString();
    const endISO = blockEnd.toISOString();

    router.push(`/catalog/${resourceId}?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventClick = (arg: any) => {
    const resourceId = arg.event.getResources()?.[0]?.id;
    if (resourceId) {
      router.push(`/catalog/${resourceId}`);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelect = (arg: any) => {
    const resourceId = arg.resource?.id;
    if (!resourceId) return;

    // Snap to the allowed blocks on the selected date
    const start = new Date(arg.start);
    const blockStart = new Date(start);
    const blockEnd = new Date(start);
    const hour = start.getHours();

    if (hour < 14) {
      blockStart.setHours(9, 0, 0, 0);
      blockEnd.setHours(13, 0, 0, 0);
    } else {
      blockStart.setHours(14, 0, 0, 0);
      blockEnd.setHours(18, 0, 0, 0);
    }

    const startISO = blockStart.toISOString();
    const endISO = blockEnd.toISOString();

    router.push(`/catalog/${resourceId}?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Version banner for visibility */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        New Calendar UI Loaded
      </div>

      {/* Search + Category Filter */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <label htmlFor="calendar-filter" className="text-sm font-medium text-gray-700">Filter by Category</label>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              id="calendar-filter"
              name="calendarFilter"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Search equipment or asset tag"
              className="flex-1 md:w-80 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => { setSearchTerm(''); setPage(0); }}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
        </div>

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

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {pagedResources.length} of {filteredResources.length} (total {resources.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Prev
            </button>
            <span className="font-medium">Page {currentPage + 1} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
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
          resources={pagedResources.map((r) => ({
            ...r,
            extendedProps: { category: r.category, assetTag: r.assetTag },
          }))}
          events={visibleEvents}
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
          resourceAreaWidth="26%"
          resourceAreaHeaderContent="Equipment"
          resourceGroupField="category"
          resourceLabelContent={(arg) => {
            const { title, extendedProps } = arg.resource;
            const assetTag = extendedProps?.assetTag as string | undefined;
            const category = extendedProps?.category as string | undefined;

            return (
              <div className="flex items-center justify-between gap-2 pr-2">
                <div>
                  <div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
                  {assetTag && (
                    <div className="text-xs text-gray-600 truncate">{assetTag}</div>
                  )}
                  {category && (
                    <div className="text-[11px] text-gray-500">{category}</div>
                  )}
                </div>
                <button
                  onClick={() => router.push(`/catalog/${arg.resource.id}`)}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Reserve
                </button>
              </div>
            );
          }}
          editable={false}
          selectable={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          select={handleSelect}
          slotMinTime="09:00:00"
          slotMaxTime="18:00:00"
          scrollTime="09:00:00"
          resourceOrder="category,title"
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
          <div className="text-sm text-gray-600">Matching Equipment</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">{visibleEvents.filter(e => e.title === 'Reserved').length}</div>
          <div className="text-sm text-blue-700">Active Reservations (visible)</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-900">{visibleEvents.filter(e => e.title === 'Checked Out').length}</div>
          <div className="text-sm text-red-700">Checked Out (visible)</div>
        </div>
      </div>
    </div>
  );
}

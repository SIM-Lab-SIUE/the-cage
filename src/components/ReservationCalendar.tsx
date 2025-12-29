'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

// Dynamically import FullCalendar to avoid SSR hydration issues
const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });

interface ReservationCalendarProps {
  events: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    resourceId: string;
  }>;
  onSelectSlot: (start: Date, end: Date, resourceId: string) => void;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({ events, onSelectSlot }) => {
  const handleSelect = (selectionInfo: { start: Date; end: Date; resource?: { id: string } }) => {
    const start = selectionInfo.start;
    const resource = selectionInfo.resource;

    // Ensure the selected time slot matches the fixed 4-hour blocks
    const startHour = start.getHours();
    const endHour = selectionInfo.end.getHours();

    if (
      (startHour === 9 && endHour === 13) ||
      (startHour === 14 && endHour === 18)
    ) {
      if (resource) {
        onSelectSlot(start, selectionInfo.end, resource.id);
      }
    } else {
      alert('Please select a valid 4-hour block (09:00-13:00 or 14:00-18:00).');
    }
  };

  return (
    <FullCalendar
      plugins={[
        resourceTimelinePlugin,
        dayGridPlugin,
        interactionPlugin,
        timeGridPlugin,
      ]}
      initialView="resourceTimelineDay"
      selectable={true}
      events={events}
      eventColor="var(--primary-color)"
      select={handleSelect}
      slotMinTime="09:00:00"
      slotMaxTime="18:00:00"
      slotDuration="01:00:00"
      resources={[
        { id: '1', title: 'Resource 1' },
        { id: '2', title: 'Resource 2' },
      ]} // Replace with dynamic resources if needed
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'resourceTimelineDay',
      }}
    />
  );
};

export default ReservationCalendar;
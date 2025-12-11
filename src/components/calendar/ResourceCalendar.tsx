'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';

export interface CalendarResource {
  id: string;
  title: string;
  extendedProps?: any;
  [key: string]: any;
}

export interface CalendarEvent {
  id: string;
  resourceId: string;
  start: Date | string;
  end: Date | string;
  title: string;
  [key: string]: any;
}

interface ResourceCalendarProps {
  resources: CalendarResource[];
  events: CalendarEvent[];
}

export default function ResourceCalendar({ resources, events }: ResourceCalendarProps) {
  const handleDateClick = (arg: any) => {
    console.log('Clicked resource:', arg.resource);
    console.log('Clicked date:', arg.date);
  };

  return (
    <div className="w-full h-full bg-white p-4 rounded-lg shadow">
      <FullCalendar
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        initialView="resourceTimelineDay"
        schedulerLicenseKey={process.env.NEXT_PUBLIC_SCHEDULER_LICENSE_KEY || 'CC-Attribution-NonCommercial-NoDerivatives'}
        resources={resources}
        events={events}
        slotDuration="01:00:00"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimelineDay,resourceTimelineWeek'
        }}
        editable={false}
        selectable={true}
        dateClick={handleDateClick}
        height="auto"
        resourceAreaWidth="25%"
      />
    </div>
  );
}

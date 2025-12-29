'use client';

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';

interface BlockAvailability {
  available: boolean;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  date: string;
  dayOfWeek: string;
  blocks: {
    A: BlockAvailability;
    B: BlockAvailability;
  };
}

interface UserBlockUsage {
  category: string;
  blocksUsed: number;
  blocksRemaining: number;
  canReserve: boolean;
}

interface AvailabilityCalendarProps {
  availability: DayAvailability[];
  userBlockUsage?: UserBlockUsage | null;
  onSelectBlock: (date: string, block: 'A' | 'B', startTime: string, endTime: string) => void;
  selectedDate?: string;
  selectedBlock?: 'A' | 'B';
}

export default function AvailabilityCalendar({
  availability,
  userBlockUsage,
  onSelectBlock,
  selectedDate,
  selectedBlock,
}: AvailabilityCalendarProps) {
  const [viewWeek, setViewWeek] = useState(0); // 0 = current week, 1 = next week, etc.
  
  const daysPerPage = 5; // Show 5 business days at a time
  const startIndex = viewWeek * daysPerPage;
  const visibleDays = availability.slice(startIndex, startIndex + daysPerPage);
  const hasNextWeek = startIndex + daysPerPage < availability.length;
  const hasPrevWeek = viewWeek > 0;

  const getBlockClassName = (day: DayAvailability, blockType: 'A' | 'B') => {
    const block = day.blocks[blockType];
    const isSelected = selectedDate === day.date && selectedBlock === blockType;
    
    if (isSelected) {
      return 'bg-blue-600 text-white border-blue-600';
    }
    
    if (!block.available) {
      return 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300';
    }
    
    if (userBlockUsage && !userBlockUsage.canReserve) {
      return 'bg-yellow-100 text-yellow-700 cursor-not-allowed border-yellow-300';
    }
    
    return 'bg-white text-gray-900 hover:bg-blue-50 hover:border-blue-400 cursor-pointer border-gray-300';
  };

  const handleBlockClick = (day: DayAvailability, blockType: 'A' | 'B') => {
    const block = day.blocks[blockType];
    
    if (!block.available) {
      return;
    }
    
    if (userBlockUsage && !userBlockUsage.canReserve) {
      alert(`You have reached your weekly limit of 3 blocks for ${userBlockUsage.category}`);
      return;
    }
    
    onSelectBlock(day.date, blockType, block.startTime, block.endTime);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select a Time Block</h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose from available 4-hour blocks (9am-1pm or 2pm-6pm)
          </p>
        </div>
        
        {userBlockUsage && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {userBlockUsage.category}
            </p>
            <p className="text-2xl font-bold text-siue-red">
              {userBlockUsage.blocksRemaining} / 3
            </p>
            <p className="text-xs text-gray-600">blocks remaining this week</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded mr-2"></div>
          <span className="text-gray-700">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 border-2 border-gray-300 rounded mr-2"></div>
          <span className="text-gray-700">Reserved</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded mr-2"></div>
          <span className="text-gray-700">Selected</span>
        </div>
        {userBlockUsage && !userBlockUsage.canReserve && (
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded mr-2"></div>
            <span className="text-gray-700">Limit Reached</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setViewWeek(Math.max(0, viewWeek - 1))}
          disabled={!hasPrevWeek}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous Week
        </button>
        <span className="text-sm font-medium text-gray-600">
          Week {viewWeek + 1}
        </span>
        <button
          onClick={() => setViewWeek(viewWeek + 1)}
          disabled={!hasNextWeek}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Week →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-5 gap-4">
        {visibleDays.map((day) => {
          const date = parseISO(day.date);
          
          return (
            <div key={day.date} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Date Header */}
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <div className="text-xs font-medium text-gray-600">{day.dayOfWeek}</div>
                <div className="text-sm font-bold text-gray-900">
                  {format(date, 'MMM d')}
                </div>
              </div>
              
              {/* Time Blocks */}
              <div className="p-2 space-y-2">
                {/* Block A: 9am-1pm */}
                <button
                  onClick={() => handleBlockClick(day, 'A')}
                  disabled={!day.blocks.A.available || (userBlockUsage ? !userBlockUsage.canReserve : false)}
                  className={`w-full px-3 py-4 text-left border-2 rounded-md transition-colors ${getBlockClassName(day, 'A')}`}
                >
                  <div className="font-semibold text-sm">Block A</div>
                  <div className="text-xs mt-1">9am - 1pm</div>
                  {!day.blocks.A.available && (
                    <div className="text-xs mt-1 font-medium">Reserved</div>
                  )}
                </button>
                
                {/* Block B: 2pm-6pm */}
                <button
                  onClick={() => handleBlockClick(day, 'B')}
                  disabled={!day.blocks.B.available || (userBlockUsage ? !userBlockUsage.canReserve : false)}
                  className={`w-full px-3 py-4 text-left border-2 rounded-md transition-colors ${getBlockClassName(day, 'B')}`}
                >
                  <div className="font-semibold text-sm">Block B</div>
                  <div className="text-xs mt-1">2pm - 6pm</div>
                  {!day.blocks.B.available && (
                    <div className="text-xs mt-1 font-medium">Reserved</div>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {visibleDays.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No availability to display
        </div>
      )}
    </div>
  );
}

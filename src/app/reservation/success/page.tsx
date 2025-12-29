import React from 'react';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import QRCodeDisplay from '@/components/QRCodeDisplay';

const prisma = new PrismaClient();

interface ReservationSuccessPageProps {
  searchParams: { id?: string };
}

export default async function ReservationSuccessPage({ searchParams }: ReservationSuccessPageProps) {
  const reservationId = searchParams.id;

  if (!reservationId) {
    redirect('/dashboard');
  }

  // Fetch the reservation details
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      asset: true,
      user: true,
    },
  });

  if (!reservation) {
    redirect('/dashboard');
  }

  // Format dates
  const pickupDate = new Date(reservation.startTime);
  const returnDate = new Date(reservation.endTime);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-3">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Reservation Confirmed!
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Your equipment has been reserved. Show this QR code when picking up your equipment.
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-8">
          <QRCodeDisplay value={reservationId} />
        </div>

        {/* Reservation Details */}
        <div className="border-t border-b border-gray-200 py-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reservation Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Equipment:</span>
              <span className="text-sm text-gray-900">{reservation.asset.modelName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Asset Tag:</span>
              <span className="text-sm text-gray-900">{reservation.asset.assetTag}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Category:</span>
              <span className="text-sm text-gray-900">{reservation.category}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Pickup Time:</span>
              <span className="text-sm text-gray-900">
                {pickupDate.toLocaleDateString()} at {pickupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Return Time:</span>
              <span className="text-sm text-gray-900">
                {returnDate.toLocaleDateString()} at {returnDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Reservation ID:</span>
              <span className="text-sm font-mono text-gray-900">{reservation.id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {reservation.status}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Save this page or take a screenshot of the QR code</li>
            <li>Arrive at the equipment office during your pickup window</li>
            <li>Show the QR code to the staff member</li>
            <li>They will scan it and check out your equipment</li>
            <li>Return the equipment by the specified return time to avoid late fees</li>
          </ol>
        </div>

        {/* Calendar Export Buttons */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Add to Calendar:</p>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Equipment+Pickup:+${encodeURIComponent(reservation.asset.modelName)}&dates=${pickupDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${returnDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=Asset+Tag:+${reservation.asset.assetTag}%0AReservation+ID:+${reservation.id}&location=Equipment+Office`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10z"/>
              </svg>
              Google Calendar
            </a>
            <button
              onClick={() => {
                // Generate .ics file
                const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The Cage//Equipment Reservation//EN
BEGIN:VEVENT
UID:${reservation.id}@the-cage
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${pickupDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${returnDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Equipment Pickup: ${reservation.asset.modelName}
DESCRIPTION:Asset Tag: ${reservation.asset.assetTag}\\nReservation ID: ${reservation.id}
LOCATION:Equipment Office
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
                
                const blob = new Blob([icsContent], { type: 'text/calendar' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reservation-${reservation.id}.ics`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-5 w-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10z"/>
              </svg>
              Outlook / iCal
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/catalog"
            className="flex-1 bg-white text-gray-700 text-center py-3 px-4 rounded-md font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Browse More Equipment
          </Link>
        </div>

        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="w-full mt-3 text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Print this page
        </button>
      </div>
    </div>
  );
}

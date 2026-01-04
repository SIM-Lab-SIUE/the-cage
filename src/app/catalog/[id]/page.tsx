'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { format, parseISO } from 'date-fns';

interface Asset {
  id: number;
  name: string;
  asset_tag: string;
  status_label: {
    name: string;
    status_type: string;
  };
  category: {
    name: string;
  };
  model: {
    name: string;
  };
  custom_fields?: Record<string, { field: string; value: string | null }>;
}

interface DayAvailability {
  date: string;
  dayOfWeek: string;
  blocks: {
    A: { available: boolean; startTime: string; endTime: string };
    B: { available: boolean; startTime: string; endTime: string };
  };
}

interface UserBlockUsage {
  category: string;
  blocksUsed: number;
  blocksRemaining: number;
  canReserve: boolean;
}

interface AvailabilityData {
  availability: DayAvailability[];
  userBlockUsage?: UserBlockUsage | null;
}

export default function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<'A' | 'B' | ''>('');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');

  useEffect(() => {
    fetchAsset();
    fetchAvailability();
  }, [params.id]);

  const fetchAsset = async () => {
    try {
      const id = (await Promise.resolve(params)).id || params.id;
      const response = await fetch(`/api/equipment?id=${id}`);
      const data = await response.json();
      const list = data.assets || data.rows || [];
      if (list.length > 0) {
        setAsset(list[0]);
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const id = (await Promise.resolve(params)).id || params.id;
      const response = await fetch(`/api/equipment/${id}/availability`);
      const data = await response.json();
      
      setAvailability(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleBlockSelect = (date: string, block: 'A' | 'B', startTime: string, endTime: string) => {
    setSelectedDate(date);
    setSelectedBlock(block);
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
  };

  const handleReservation = async () => {
    if (!selectedDate || !selectedBlock || !selectedStartTime || !selectedEndTime) {
      alert('Please select a date and time block');
      return;
    }

    setReserving(true);

    try {
      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset?.id,
          startTime: selectedStartTime,
          endTime: selectedEndTime,
          category: asset?.category.name || 'Unknown',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push(`/reservation/success?id=${data.reservationId}`);
      } else {
        alert(data.message || data.error || 'Reservation failed');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      alert('Network error during reservation');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading equipment details...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Equipment Not Found</h2>
          <p className="text-gray-600 mb-4">The requested equipment could not be found.</p>
          <button
            onClick={() => router.push('/catalog')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const isAvailable = asset.status_label.status_type === 'deployable';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/catalog')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Catalog
        </button>

        {/* Equipment Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-1/2 bg-gray-200 flex items-center justify-center p-8">
              <Image
                src="/placeholder-equipment.jpg"
                alt={asset.name}
                width={400}
                height={400}
                className="object-contain"
              />
            </div>

            {/* Details */}
            <div className="md:w-1/2 p-8">
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {asset.model?.name || asset.name}
              </h1>

              <p className="text-gray-600 mb-4">
                <span className="font-medium">Asset Tag:</span> {asset.asset_tag}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span><span className="font-medium">Category:</span> {asset.category.name}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><span className="font-medium">Status:</span> {asset.status_label.name}</span>
                </div>
              </div>

              {/* Included Items */}
              {asset.custom_fields?.included_items?.value && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Included Items:</h3>
                  <p className="text-sm text-gray-600">{asset.custom_fields.included_items.value}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reservation Form */}
        {isAvailable && availability && (
          <>
            <AvailabilityCalendar
              availability={availability.availability}
              userBlockUsage={availability.userBlockUsage}
              onSelectBlock={handleBlockSelect}
              selectedDate={selectedDate}
              selectedBlock={selectedBlock as 'A' | 'B'}
            />

            {/* Confirmation Section */}
            {selectedDate && selectedBlock && (
              <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Your Reservation</h2>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-600">Equipment:</dt>
                      <dd className="text-sm font-semibold text-gray-900">{asset.model?.name || asset.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-600">Asset Tag:</dt>
                      <dd className="text-sm font-semibold text-gray-900">{asset.asset_tag}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-600">Date:</dt>
                      <dd className="text-sm font-semibold text-gray-900">
                        {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-600">Time:</dt>
                      <dd className="text-sm font-semibold text-gray-900">
                        {selectedBlock === 'A' ? '9:00 AM - 1:00 PM' : '2:00 PM - 6:00 PM'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Important Notes */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Important:</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>You can reserve up to 3 blocks per week per equipment type</li>
                    <li>Late returns incur a $15 fee</li>
                    <li>Equipment must be returned by the end of your time block</li>
                    <li>You'll receive a QR code to show when picking up</li>
                  </ul>
                </div>

                {/* Reserve Button */}
                <button
                  onClick={handleReservation}
                  disabled={reserving}
                  className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                    reserving
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-siue-red hover:bg-red-700'
                  }`}
                >
                  {reserving ? 'Processing...' : 'Confirm Reservation'}
                </button>
              </div>
            )}
          </>
        )}

        {!isAvailable && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Equipment Currently Unavailable
            </h3>
            <p className="text-gray-600">
              This equipment is not available for reservation at this time. Please check back later or contact the equipment office.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

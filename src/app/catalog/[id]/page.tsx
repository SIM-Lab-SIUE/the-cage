'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

export default function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<'A' | 'B' | ''>('');

  useEffect(() => {
    fetchAsset();
  }, [params.id]);

  const fetchAsset = async () => {
    try {
      const response = await fetch(`/api/equipment?id=${params.id}`);
      const data = await response.json();
      
      if (data.rows && data.rows.length > 0) {
        setAsset(data.rows[0]);
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!selectedDate || !selectedBlock) {
      alert('Please select a date and time block');
      return;
    }

    setReserving(true);

    try {
      const start = new Date(selectedDate);
      const end = new Date(selectedDate);

      if (selectedBlock === 'A') {
        start.setHours(9, 0, 0, 0);
        end.setHours(13, 0, 0, 0);
      } else {
        start.setHours(14, 0, 0, 0);
        end.setHours(18, 0, 0, 0);
      }

      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset?.id,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          assetType: asset?.category.name || 'Unknown',
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

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get max date (30 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

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
        {isAvailable && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Reservation</h2>

            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  id="date"
                  min={minDate}
                  max={maxDateStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time Block Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Time Block
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedBlock('A')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedBlock === 'A'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Block A</div>
                    <div className="text-sm text-gray-600">9:00 AM - 1:00 PM</div>
                  </button>

                  <button
                    onClick={() => setSelectedBlock('B')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedBlock === 'B'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Block B</div>
                    <div className="text-sm text-gray-600">2:00 PM - 6:00 PM</div>
                  </button>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-blue-50 rounded-lg p-4">
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
                disabled={!selectedDate || !selectedBlock || reserving}
                className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                  !selectedDate || !selectedBlock || reserving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {reserving ? 'Processing...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
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

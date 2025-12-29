'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Reservation {
  id: string;
  snipeAssetId: number;
  userId: string;
  startTime: string;
  endTime: string;
  status: string;
  category: string;
  user: {
    id: string;
    name: string;
    email: string;
    snipeItUserId: number;
  };
  asset: {
    id: number;
    assetTag: string;
    modelName: string;
    category: string;
  };
}

export default function AdminDashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'pickups' | 'returns'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filter === 'today') {
        params.append('date', new Date().toISOString().split('T')[0]);
      } else if (filter === 'pickups') {
        params.append('status', 'CONFIRMED');
        params.append('date', new Date().toISOString().split('T')[0]);
      } else if (filter === 'returns') {
        params.append('status', 'CHECKED_OUT');
      }

      const response = await fetch(`/api/admin/reservations?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setReservations(data.reservations);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (reservationId: string) => {
    if (!confirm('Confirm check-in for this reservation?')) return;

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Equipment checked in successfully!');
        fetchReservations(); // Refresh the list
      } else {
        alert(`Check-in failed: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Network error during check-in');
    }
  };

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch = 
      res.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.asset.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const stats = {
    todayPickups: reservations.filter(r => 
      r.status === 'CONFIRMED' && 
      new Date(r.startTime).toDateString() === new Date().toDateString()
    ).length,
    activeCheckouts: reservations.filter(r => r.status === 'CHECKED_OUT').length,
    pendingReturns: reservations.filter(r => 
      r.status === 'CHECKED_OUT' && 
      new Date(r.endTime) <= new Date()
    ).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage equipment checkouts, returns, and reservations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Pickups</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayPickups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Checkouts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeCheckouts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Returns</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingReturns}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/admin/scan"
            className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Open QR Scanner
          </Link>
          <button
            onClick={fetchReservations}
            className="flex items-center justify-center px-6 py-4 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 transition-colors border border-gray-300"
          >
            <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'today'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setFilter('pickups')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'pickups'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pickups
              </button>
              <button
                onClick={() => setFilter('returns')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'returns'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Returns
              </button>
            </div>

            <input
              type="text"
              placeholder="Search by student name, equipment, or asset tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 md:max-w-md"
            />
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Loading reservations...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No reservations found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.asset.modelName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Tag: {reservation.asset.assetTag}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{new Date(reservation.startTime).toLocaleString()}</div>
                        <div className="text-gray-500">
                          to {new Date(reservation.endTime).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reservation.status === 'CHECKED_OUT' 
                            ? 'bg-blue-100 text-blue-800'
                            : reservation.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : reservation.status === 'COMPLETED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {reservation.status === 'CHECKED_OUT' && (
                          <button
                            onClick={() => handleCheckin(reservation.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Check In
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { auth } from '../../../auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { startOfWeek, endOfWeek } from 'date-fns';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/');
  }

  // Fetch user data with reservations
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      reservations: {
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_OUT'] },
        },
        orderBy: { startTime: 'asc' },
        include: {
          asset: true,
        },
      },
      fines: {
        where: { isPaid: false },
      },
    },
  });

  // Calculate weekly quota usage
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const weeklyReservations = await prisma.reservation.groupBy({
    by: ['category'],
    where: {
      userId: user?.id,
      startTime: { gte: weekStart, lte: weekEnd },
      status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_OUT'] },
    },
    _count: { id: true },
  });

  const quotaByCategory = weeklyReservations.reduce((acc, item) => {
    acc[item.category] = item._count.id;
    return acc;
  }, {} as Record<string, number>);

  // Separate active and upcoming reservations
  const activeReservations = user?.reservations.filter(
    (r) => r.status === 'CHECKED_OUT'
  ) || [];
  const upcomingReservations = user?.reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'PENDING'
  ) || [];

  const totalFines = user?.fines.reduce((sum, fine) => sum + fine.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {session.user.name || 'Student'}
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your equipment reservations and checkouts
          </p>
        </div>

        {/* Outstanding Fees Alert */}
        {totalFines > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <span className="font-medium">Outstanding balance: ${totalFines.toFixed(2)}</span>
                  {' '}- Please contact the equipment office to resolve fees before making new reservations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Checkouts */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Checkouts</p>
                <p className="text-2xl font-semibold text-gray-900">{activeReservations.length}</p>
              </div>
            </div>
          </div>

          {/* Upcoming Reservations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Upcoming Reservations</p>
                <p className="text-2xl font-semibold text-gray-900">{upcomingReservations.length}</p>
              </div>
            </div>
          </div>

          {/* Weekly Quota */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Weekly Quota Usage</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.values(quotaByCategory).reduce((a, b) => a + b, 0)} / 3 per type
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Checkouts Section */}
        {activeReservations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Checkouts</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {activeReservations.map((reservation) => (
                  <li key={reservation.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {reservation.asset.modelName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Asset Tag: {reservation.asset.assetTag} • Category: {reservation.category}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Due: {new Date(reservation.endTime).toLocaleString()}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        Checked Out
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Upcoming Reservations Section */}
        {upcomingReservations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Reservations</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {upcomingReservations.map((reservation) => (
                  <li key={reservation.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {reservation.asset.modelName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Asset Tag: {reservation.asset.assetTag} • Category: {reservation.category}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Pickup: {new Date(reservation.startTime).toLocaleString()} - {new Date(reservation.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        reservation.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reservation.status === 'CONFIRMED' ? 'Ready for Pickup' : 'Pending'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeReservations.length === 0 && upcomingReservations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by browsing the equipment catalog.</p>
            <div className="mt-6">
              <Link
                href="/catalog"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/catalog"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Browse Equipment
          </Link>
          <Link
            href="/calendar"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View Calendar
          </Link>
          <Link
            href="/account"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            My Account
          </Link>
        </div>
      </div>
    </div>
  );
}

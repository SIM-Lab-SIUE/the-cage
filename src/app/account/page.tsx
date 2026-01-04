import React from 'react';
import { auth } from '../../../auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function AccountPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/');
  }

  // Fetch user data with all reservations and fines
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      reservations: {
        orderBy: { startTime: 'desc' },
        include: {
          asset: true,
        },
        take: 50, // Last 50 reservations
      },
      fines: {
        orderBy: { dateIssued: 'desc' },
      },
      courses: {
        include: {
          course: true,
        },
      },
    },
  });

  const totalFines = user?.fines
    .filter(f => !f.isPaid)
    .reduce((sum, fine) => sum + fine.amount, 0) || 0;

  const paidFines = user?.fines
    .filter(f => f.isPaid)
    .reduce((sum, fine) => sum + fine.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">
            View your profile, reservation history, and account status
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
              <p className="text-gray-900">{user?.name || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Student ID</label>
              <p className="text-gray-900">{user?.snipeItUserId || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Account Status</label>
              <p className={`font-medium ${user?.hasOutstandingBalance ? 'text-red-600' : 'text-green-600'}`}>
                {user?.hasOutstandingBalance ? 'Outstanding Balance' : 'Good Standing'}
              </p>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        {user && user.courses.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Enrolled Courses</h2>
            <div className="flex flex-wrap gap-2">
              {user.courses.map((uc) => (
                <span
                  key={uc.courseId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {uc.course.code} - {uc.course.semester}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fines Section */}
        {user && (user.fines.length > 0 || totalFines > 0) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Fees & Fines</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm font-medium text-red-700">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-900">${totalFines.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">${paidFines.toFixed(2)}</p>
              </div>
            </div>

            {totalFines > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Please contact the equipment office to resolve outstanding fees before making new reservations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {user.fines.map((fine) => (
                <div key={fine.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{fine.reason}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(fine.dateIssued).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-gray-900">
                      ${fine.amount.toFixed(2)}
                    </p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      fine.isPaid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {fine.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reservation History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reservation History</h2>
          
          {user && user.reservations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reservations yet</p>
          ) : (
            <div className="space-y-4">
              {user?.reservations.map((reservation) => (
                <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-900">
                        {reservation.asset.modelName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Asset Tag: {reservation.asset.assetTag} • Category: {reservation.category}
                      </p>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Pickup: {new Date(reservation.startTime).toLocaleString()}</p>
                        <p>Return: {new Date(reservation.endTime).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      reservation.status === 'COMPLETED' 
                        ? 'bg-gray-100 text-gray-800'
                        : reservation.status === 'CHECKED_OUT'
                        ? 'bg-blue-100 text-blue-800'
                        : reservation.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : reservation.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

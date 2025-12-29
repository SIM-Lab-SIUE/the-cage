'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { brandingConfig } from '@/config/branding.config';

interface NavigationProps {
  session: Session;
}

export default function Navigation({ session }: NavigationProps) {
  const pathname = usePathname();
  const isAdmin = session.user?.email?.includes('admin') || false;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['student', 'admin'] },
    { href: '/catalog', label: 'Equipment', icon: '📹', roles: ['student', 'admin'] },
    { href: '/calendar', label: 'Calendar', icon: '📅', roles: ['student', 'admin'] },
    { href: '/account', label: 'My Account', icon: '👤', roles: ['student', 'admin'] },
    { href: '/admin/dashboard', label: 'Admin Dashboard', icon: '⚙️', roles: ['admin'] },
    { href: '/admin/scan', label: 'Scanner', icon: '🔍', roles: ['admin'] },
  ];

  const visibleItems = navItems.filter(item => 
    item.roles.includes('student') || (isAdmin && item.roles.includes('admin'))
  );

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <nav className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{brandingConfig.departmentName}</h1>
        <p className="text-sm text-gray-600 mt-1">Equipment Checkout</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user?.email}
            </p>
          </div>
        </div>
        {isAdmin && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
              Admin
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <a
          href="/api/auth/signout"
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </a>
        <p className="mt-3 text-xs text-center text-gray-500">
          Need help? Contact {brandingConfig.supportEmail}
        </p>
      </div>
    </nav>
  );
}

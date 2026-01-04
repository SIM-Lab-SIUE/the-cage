'use client';

import React, { useState, useEffect } from 'react';
import StaffScanner from '@/components/StaffScanner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const ScanPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect non-admin users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleAssetDetected = async (code: string) => {
    setLastScannedCode(code);
    setLoading(true);
    setMessage(null);

    try {
      // Call processCheckout server action or API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Asset checked out successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Checkout failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error during checkout' });
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* QR Code Scanner */}
      <StaffScanner onAssetDetected={handleAssetDetected} />

      {/* Overlay Guide Box */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white bg-white bg-opacity-10" />

      {/* Status Messages */}
      {loading && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded">
          Processing checkout...
        </div>
      )}

      {message && (
        <div className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded text-white ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {message.text}
        </div>
      )}

      {lastScannedCode && (
        <div className="absolute top-10 left-10 bg-gray-800 text-white p-4 rounded">
          <p className="text-sm">Last scanned:</p>
          <p className="font-mono text-lg">{lastScannedCode}</p>
        </div>
      )}
    </div>
  );
};

export default ScanPage;
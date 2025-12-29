'use client';

import React, { useState } from 'react';
import { Scanner as QRScanner } from '@yudiel/react-qr-scanner';
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner/dist/types';

interface ScannerProps {
  onScan: (decodedText: string) => void;
}

export default function Scanner({ onScan }: ScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (isProcessing || detectedCodes.length === 0) return;

    const code = detectedCodes[0]?.rawValue;
    if (!code) return;

    setIsProcessing(true);
    onScan(code);
    setTimeout(() => setIsProcessing(false), 1500);
  };

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : 'Unknown error';
    setError(message);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <QRScanner
        onScan={handleScan}
        onError={handleError}
        formats={['qr_code', 'code_128']}
        paused={isProcessing}
        constraints={{ facingMode: 'environment' }}
      />
    </div>
  );
}

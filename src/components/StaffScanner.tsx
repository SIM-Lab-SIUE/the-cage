// src/components/StaffScanner.tsx
import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner/dist/types';

interface StaffScannerProps {
  onAssetDetected: (code: string) => void;
}

const StaffScanner: React.FC<StaffScannerProps> = ({ onAssetDetected }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successFlash, setSuccessFlash] = useState(false);

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (isProcessing || detectedCodes.length === 0) return;

    const code = detectedCodes[0]?.rawValue;
    if (!code) return;

    setIsProcessing(true);
    setSuccessFlash(true);
    setTimeout(() => setSuccessFlash(false), 300);
    onAssetDetected(code);
    setTimeout(() => setIsProcessing(false), 1500); // Debounce: allow next scan after 1.5s
  };

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : 'Unknown error';
    setError('Camera error: ' + message);
  };

  return (
    <div className={`rounded border-4 p-2 ${successFlash ? 'border-green-500' : 'border-gray-300'}`}>
      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">
          {error}
        </div>
      )}
      <Scanner
        onScan={handleScan}
        onError={handleError}
        formats={['qr_code', 'code_128']}
        paused={isProcessing}
        constraints={{ facingMode: 'environment' }}
      />
    </div>
  );
};

export default StaffScanner;

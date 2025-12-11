'use client';

import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  onScan: (decodedText: string) => void;
}

export default function Scanner({ onScan }: ScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Strict Mode Fix: Ensure render is called only once
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
      },
      (errorMessage) => {
        // parse error, ignore it.
      }
    );

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
            console.error("Failed to clear html5-qrcode scanner. ", error);
        });
        // We don't reset initializedRef to false here because in Strict Mode, 
        // we want to prevent the second mount from re-initializing immediately 
        // if the first one hasn't fully cleared or if we just want to persist the single instance logic.
        // However, for a true unmount (navigating away), we might want to reset it.
        // But given the "ref lock" instruction, keeping it true prevents double init.
      }
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="reader" className="w-full"></div>
    </div>
  );
}

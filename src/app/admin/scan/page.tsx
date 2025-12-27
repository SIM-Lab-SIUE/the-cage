"use client";

import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { processCheckout } from "./server-actions"; // Import the Server Action

const ScanPage: React.FC = () => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        await processCheckout(decodedText); // Use the Server Action
      },
      (error) => {
        console.warn(`QR Code scan error: ${error}`);
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch((err) => console.error("Failed to clear scanner", err));
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      {/* QR Code Scanner */}
      <div id="qr-reader" className="w-full h-full" />

      {/* Overlay Guide Box */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white bg-white bg-opacity-10"
      ></div>
    </div>
  );
};

export default ScanPage;
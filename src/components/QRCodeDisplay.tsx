'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  return (
    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin={true}
        className="mx-auto"
      />
    </div>
  );
}

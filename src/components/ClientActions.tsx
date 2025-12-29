"use client";

import React from "react";

type IcsDownloadButtonProps = {
  reservationId: string;
  assetModelName: string;
  assetTag: string;
  pickupIso: string; // e.g. 20251230T054010Z
  returnIso: string; // e.g. 20251230T104010Z
  className?: string;
};

export function IcsDownloadButton({
  reservationId,
  assetModelName,
  assetTag,
  pickupIso,
  returnIso,
  className,
}: IcsDownloadButtonProps) {
  const handleClick = () => {
    const dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//The Cage//Equipment Reservation//EN\nBEGIN:VEVENT\nUID:${reservationId}@the-cage\nDTSTAMP:${dtstamp}\nDTSTART:${pickupIso}\nDTEND:${returnIso}\nSUMMARY:Equipment Pickup: ${assetModelName}\nDESCRIPTION:Asset Tag: ${assetTag}\\nReservation ID: ${reservationId}\nLOCATION:Equipment Office\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservation-${reservationId}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleClick} className={className}>
      <svg className="h-5 w-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10z" />
      </svg>
      Outlook / iCal
    </button>
  );
}

export function PrintButton({ className }: { className?: string }) {
  return (
    <button onClick={() => window.print()} className={className}>
      Print this page
    </button>
  );
}

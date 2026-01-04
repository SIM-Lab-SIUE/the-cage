import React from 'react';
import Image from 'next/image';
import type { SnipeITAsset } from '@/types/snipeit-api';

interface EquipmentCardProps {
  asset: SnipeITAsset | {
    id: number;
    name: string;
    assetTag: string;
    category: string;
    status: string;
    isAvailable: boolean;
    semesterAccess?: string | null;
  };
  imageUrl?: string;
  onReserve?: (assetId: number) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ asset, imageUrl, onReserve }) => {
  // Handle both SnipeITAsset and simplified asset formats
  const isSnipeITAsset = 'category' in asset && typeof asset.category === 'object' && asset.category !== null;
  
  const name = asset.name;
  const categoryName = isSnipeITAsset 
    ? (asset as SnipeITAsset).category?.name || 'Unknown'
    : (typeof (asset as { category?: unknown }).category === 'string'
      ? (asset as { category: string }).category
      : 'Unknown');
  const status = isSnipeITAsset
    ? (asset as SnipeITAsset).status_label?.name || 'Unknown'
    : ('status' in asset ? asset.status : 'Unknown');
  const isAvailable = isSnipeITAsset
    ? (asset as SnipeITAsset).status_label?.status_type === 'deployable'
    : ('isAvailable' in asset ? asset.isAvailable : false);
  const assetTag = isSnipeITAsset
    ? (asset as SnipeITAsset).asset_tag
    : ('assetTag' in asset ? asset.assetTag : '');

  const handleReserve = () => {
    if (onReserve) {
      onReserve(asset.id);
    }
  };

  return (
    <div className="relative bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Badge for category */}
      <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
        {categoryName}
      </span>

      {/* Badge for availability */}
      <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${
        isAvailable 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isAvailable ? 'Available' : 'Unavailable'}
      </span>

      {/* Image */}
      {/* Use an internal proxy for external Snipe-IT images so browsers can load them */}
      <Image
        src={imageUrl ? `/api/image-proxy?u=${encodeURIComponent(imageUrl)}` : '/file.svg'}
        alt={name}
        width={400}
        height={192}
        className="w-full h-48 object-cover bg-gray-200"
      />

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
        <p className="text-xs text-gray-500 mb-2">Asset Tag: {assetTag}</p>
        <p className={`text-sm font-medium mb-3 ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>

        {/* Reserve Button */}
        <button
          onClick={handleReserve}
          className={`w-full py-2 px-4 rounded text-white font-semibold transition-colors ${
            isAvailable
              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!isAvailable}
        >
          {isAvailable ? 'Reserve' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default EquipmentCard;
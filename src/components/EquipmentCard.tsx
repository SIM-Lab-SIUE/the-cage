import React from 'react';
import Image from 'next/image';

interface EquipmentCardProps {
  name: string;
  imageUrl: string; // Changed from `image` to `imageUrl`
  status: 'Available' | 'Unavailable';
  category: string;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ name, imageUrl, status, category }) => {
  return (
    <div className="relative bg-white border rounded-lg shadow-md overflow-hidden">
      {/* Badge for category */}
      <span className="absolute top-2 right-2 bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
        {category}
      </span>

      {/* Image */}
      <Image
        src={imageUrl}
        alt={name}
        width={400}
        height={192}
        className="w-full h-48 object-cover"
      />

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
        <p className={`text-sm font-medium ${status === 'Available' ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>

        {/* Reserve Button */}
        <button
          className={`mt-4 w-full py-2 px-4 rounded text-white font-semibold ${
            status === 'Available'
              ? 'bg-[var(--primary-color)] hover:bg-opacity-90'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={status === 'Unavailable'}
        >
          Reserve
        </button>
      </div>
    </div>
  );
};

export default EquipmentCard;
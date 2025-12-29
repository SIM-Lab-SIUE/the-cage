'use client';

import { useState } from 'react';
import EquipmentCard from '@/components/EquipmentCard';
import { useEquipment } from '@/hooks/useEquipment';

export default function CatalogPage() {
  const { equipment, loading, error } = useEquipment();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique categories for filtering
  const categories = Array.from(new Set(equipment.map(item => item.category)));

  // Filter equipment based on category and search
  const filteredEquipment = equipment.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.assetTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleReserve = (assetId: number) => {
    // Navigate to reservation page or open modal
    window.location.href = `/catalog/${assetId}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading equipment catalog...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-red-700">Failed to load equipment catalog: {error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-siue-red">Equipment Catalog</h1>

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by equipment name or asset tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Categories ({equipment.length})
          </button>
          {categories.map(category => {
            const count = equipment.filter(item => item.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredEquipment.length > 0 ? (
          filteredEquipment.map((item) => (
            <EquipmentCard
              key={item.id}
              asset={item}
              onReserve={handleReserve}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 text-lg">No equipment found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-12 text-center text-gray-600">
        <p>Showing {filteredEquipment.length} of {equipment.length} items</p>
      </div>
    </main>
  );
}
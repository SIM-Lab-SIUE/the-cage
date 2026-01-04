'use client';

import { useState, useEffect, useMemo } from 'react';
import EquipmentCard from '@/components/EquipmentCard';
import Link from 'next/link';

interface EquipmentItem {
  id: number;
  name: string;
  assetTag: string;
  category: string;
  status: string;
  isAvailable: boolean;
  imageUrl?: string | null;
}

interface CategoryGroup {
  category: string;
  total: number;
  available: number;
  checkedOut: number;
  items: EquipmentItem[];
}

export default function CatalogPage() {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/equipment');
        
        if (!response.ok) {
          throw new Error('Failed to fetch catalog');
        }

        const data = await response.json();
        setItems(data.assets || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Catalog fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const categoryGroups: CategoryGroup[] = useMemo(() => {
    const groups: Record<string, EquipmentItem[]> = {};
    items.forEach((item) => {
      const cat = item.category || 'Unknown';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    return Object.entries(groups).map(([category, groupItems]) => {
      const available = groupItems.filter((i) => i.isAvailable).length;
      return {
        category,
        total: groupItems.length,
        available,
        checkedOut: groupItems.length - available,
        items: groupItems,
      };
    });
  }, [items]);

  const allEquipment = useMemo(() => items, [items]);

  const filteredEquipment = useMemo(() => {
    const term = searchQuery.toLowerCase();
    return allEquipment.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(term) || item.assetTag.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [allEquipment, selectedCategory, searchQuery]);

  const handleReserve = (assetId: number) => {
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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-siue-red">Equipment Catalog</h1>
            <p className="text-gray-600 mt-2">Browse available equipment and make reservations</p>
          </div>
          <Link
            href="/calendar"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            View Calendar
          </Link>
        </div>

        {/* Category Stats */}
        {!loading && categoryGroups.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categoryGroups.map(group => (
              <div key={group.category} className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-1">{group.category}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{group.available}</span>
                  <span className="text-sm text-gray-500">/ {group.total} available</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <label htmlFor="catalog-search" className="sr-only">Search equipment</label>
            <input
              id="catalog-search"
              name="catalogSearch"
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
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Categories ({allEquipment.length})
            </button>
            {categoryGroups.map(group => (
              <button
                key={group.category}
                onClick={() => setSelectedCategory(group.category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === group.category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {group.category} ({group.total})
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredEquipment.length > 0 ? (
            filteredEquipment.map((item) => (
              <EquipmentCard
                key={item.id}
                asset={{
                  id: item.id,
                  name: item.name,
                  assetTag: item.assetTag,
                  category: item.category,
                  status: item.isAvailable ? 'Ready to Deploy' : 'Checked Out',
                  isAvailable: item.isAvailable,
                }}
                imageUrl={item.imageUrl || undefined}
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
          <p>Showing {filteredEquipment.length} of {allEquipment.length} items</p>
        </div>
      </div>
    </main>
  );
}
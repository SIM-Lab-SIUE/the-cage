// src/hooks/useEquipment.ts
import { useEffect, useState } from 'react';

interface EquipmentData {
  id: number;
  name: string;
  assetTag: string;
  category: string;
  status: string;
  isAvailable: boolean;
  semesterAccess?: string | null;
}

export function useEquipment() {
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/equipment');
        
        if (!response.ok) {
          throw new Error('Failed to fetch equipment catalog');
        }

        const data = await response.json();
        setEquipment(data.assets || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Equipment fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  return { equipment, loading, error };
}

/**
 * Hook to fetch reservations for a specific asset
 */
interface Reservation {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
}

export function useAssetReservations(assetId: number) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(`/api/reservations?assetId=${assetId}`);
        if (response.ok) {
          const data = await response.json();
          setReservations(data.reservations || []);
        }
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (assetId) {
      fetchReservations();
    }
  }, [assetId]);

  return { reservations, loading };
}

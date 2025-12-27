import { unstable_cache } from 'next/cache';

// Define the IInventoryItem interface
export interface IInventoryItem {
  id: number;
  name: string;
  imageUrl: string;
  isKit: boolean;
  category: string;
}

// Define the SnipeITService class
export class SnipeITService {
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    this.apiUrl = process.env.SNIPEIT_API_URL || '';
    this.apiToken = process.env.SNIPEIT_API_KEY || '';

    if (!this.apiUrl || !this.apiToken) {
      throw new Error('SNIPEIT_API_URL and SNIPEIT_API_KEY must be set in the environment variables.');
    }
  }

  async getAllItems(): Promise<IInventoryItem[]> {
    const fetchItems = async (): Promise<IInventoryItem[]> => {
      const response = await fetch(`${this.apiUrl}/hardware`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
      }

      const data = await response.json();

      return data.rows.map((item: any) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.image || '',
        isKit: item.is_kit || false,
        category: item.category?.name || 'Uncategorized',
      }));
    };

    // Cache the result for 60 seconds
    return unstable_cache(fetchItems, [], { revalidate: 60 })();
  }
}
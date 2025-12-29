// lib/snipe-it.ts

export interface Asset {
  id: number;
  name: string;
  asset_tag: string;
  status_label: {
    id: number;
    name: string;
    status_type: string;
  };
  category: {
    id: number;
    name: string;
  };
  custom_fields: Record<string, {
    field: string;
    value: string | null;
  }>;
}

export interface CheckoutResponse {
  status: 'success' | 'error';
  messages: string[];
  payload?: Asset;
}

const getSnipeConfig = () => {
  const url = process.env.SNIPE_IT_API_URL || process.env.SNIPEIT_API_URL;
  const key = process.env.SNIPE_IT_API_KEY || process.env.SNIPEIT_API_KEY;

  if (!url || !key) {
    throw new Error('Snipe-IT API URL or API Key is not set in environment variables.');
  }

  return { url, key };
};

export async function checkoutAsset(assetId: number, userId: number): Promise<CheckoutResponse> {
  const { url: apiUrl, key } = getSnipeConfig();
  const url = `${apiUrl}/hardware/${assetId}/checkout`;
  const payload = {
    checkout_to_type: 'user',
    assigned_user: userId,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.status === 'error') {
    throw new Error(data.messages?.join(' ') || 'Unknown Snipe-IT error');
  }
  return data;
}

export async function checkinAsset(assetId: number): Promise<CheckoutResponse> {
  const { url: apiUrl, key } = getSnipeConfig();
  const url = `${apiUrl}/hardware/${assetId}/checkin`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'Accept': 'application/json',
    },
  });
  const data = await res.json();
  if (data.status === 'error') {
    throw new Error(data.messages?.join(' ') || 'Unknown Snipe-IT error');
  }
  return data;
}

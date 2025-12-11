class SnipeITClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      const response = await fetch(url, { ...options, headers });
      const text = await response.text();
      console.log('SnipeIT response:', text); // Debug log

      if (response.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        retries -= 1;
      } else {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        try {
          return JSON.parse(text);
        } catch (err) {
          throw new Error('Response is not valid JSON. See log above.');
        }
      }
    }

    throw new Error('Rate limit exceeded. Please try again later.');
  }

  async getAssets(params: { limit?: number; offset?: number; category_id?: number }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());
    if (params.category_id) query.append('category_id', params.category_id.toString());

    const data = await this.request(`/hardware?${query.toString()}`);

    return data.rows.map((item: any) => this.transformAsset(item));
  }

  private transformAsset(asset: any): any {
    return {
      id: asset.id,
      assetTag: asset.asset_tag,
      modelName: asset.model.name,
      category: asset.category.name,
      lensMount: asset.custom_fields?.['Lens Mount']?.value || null,
    };
  }

  async checkOutAsset(assetId: number, userId: number, expectedCheckin: string): Promise<any> {
    const payload = {
      assigned_user: userId,
      checkout_to_type: 'user',
      expected_checkin: expectedCheckin,
    };

    return this.request(`/hardware/${assetId}/checkout`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getUserByEmail(email: string): Promise<any> {
    const data = await this.request(`/users?search=${encodeURIComponent(email)}`);
    return data.rows[0];
  }
}

export default new SnipeITClient(process.env.SNIPEIT_API_URL!, process.env.SNIPEIT_API_KEY!);
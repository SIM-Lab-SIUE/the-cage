// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import type { SnipeITAsset, SnipeITCheckoutResponse } from '@/types/snipeit-api';

const SNIPE_IT_API_URL = process.env.SNIPE_IT_API_URL || 'https://snipeit.siue.edu/api/v1';

/**
 * Mock Snipe-IT hardware asset
 */
const mockAssets: SnipeITAsset[] = [
  {
    id: 1,
    name: 'Canon XF605 - Unit A',
    asset_tag: '10001',
    serial: 'SN123456',
    model: {
      id: 1,
      name: 'Canon XF605',
    },
    status_label: {
      id: 1,
      name: 'Ready to Deploy',
      status_type: 'deployable',
    },
    category: {
      id: 1,
      name: 'Video Camera',
      category_type: 'asset',
    },
    manufacturer: {
      id: 1,
      name: 'Canon',
    },
    company: null,
    location: {
      id: 1,
      name: 'Studio A',
    },
    purchase_date: '2023-01-15',
    purchase_cost: '4500.00',
    custom_fields: {
      'Semester Access': {
        field: '_snipeit_semester_access_1',
        value: 'MC401',
      },
    },
    created_at: {
      datetime: '2023-01-15T10:00:00Z',
      formatted: '2023-01-15',
    },
    updated_at: {
      datetime: '2025-12-27T10:00:00Z',
      formatted: '2025-12-27',
    },
  },
];

export const handlers = [
  /**
   * GET /hardware - List all hardware
   */
  http.get(`${SNIPE_IT_API_URL}/hardware`, () => {
    return HttpResponse.json({
      total: mockAssets.length,
      rows: mockAssets,
      per_page: 100,
      current_page: 1,
    });
  }),

  /**
   * GET /hardware/:id - Get specific hardware
   */
  http.get(`${SNIPE_IT_API_URL}/hardware/:id`, ({ params }) => {
    const asset = mockAssets.find(a => a.id === Number(params.id));
    if (asset) {
      return HttpResponse.json(asset);
    }
    return HttpResponse.json({ status: 'error', messages: ['Asset not found'] }, { status: 404 });
  }),

  /**
   * POST /hardware/:id/checkout - Checkout asset
   */
  http.post(`${SNIPE_IT_API_URL}/hardware/:id/checkout`, async ({ params, request }) => {
    const body = await request.json() as any;
    const asset = mockAssets.find(a => a.id === Number(params.id));

    if (!asset) {
      return HttpResponse.json(
        { status: 'error', messages: ['Asset not found'] },
        { status: 404 }
      );
    }

    // Validate payload
    if (!body.checkout_to_type) {
      return HttpResponse.json(
        { status: 'error', messages: ['checkout_to_type is required'] },
        { status: 400 }
      );
    }

    if (body.checkout_to_type === 'user' && !body.assigned_user) {
      return HttpResponse.json(
        { status: 'error', messages: ['assigned_user is required when checking out to user'] },
        { status: 400 }
      );
    }

    const response: SnipeITCheckoutResponse = {
      status: 'success',
      messages: ['Asset checked out successfully'],
      payload: {
        ...asset,
        status_label: {
          id: 2,
          name: 'Checked Out',
          status_type: 'undeployable',
        },
      },
    };

    return HttpResponse.json(response);
  }),

  /**
   * POST /hardware/:id/checkin - Checkin asset
   */
  http.post(`${SNIPE_IT_API_URL}/hardware/:id/checkin`, ({ params }) => {
    const asset = mockAssets.find(a => a.id === Number(params.id));

    if (!asset) {
      return HttpResponse.json(
        { status: 'error', messages: ['Asset not found'] },
        { status: 404 }
      );
    }

    const response: SnipeITCheckoutResponse = {
      status: 'success',
      messages: ['Asset checked in successfully'],
      payload: {
        ...asset,
        status_label: {
          id: 1,
          name: 'Ready to Deploy',
          status_type: 'deployable',
        },
      },
    };

    return HttpResponse.json(response);
  }),

  /**
   * GET /users/:id - Get specific user
   */
  http.get(`${SNIPE_IT_API_URL}/users/:id`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      name: 'Test User',
      email: 'test@siue.edu',
      username: 'testuser',
      employee_num: 'A00123456',
    });
  }),
];

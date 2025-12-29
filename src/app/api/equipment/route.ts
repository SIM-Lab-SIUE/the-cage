// src/app/api/equipment/route.ts
import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import type { Asset } from '@/lib/snipe-it';

// Support both SNIPE_IT_* and SNIPEIT_* env variable names
const SNIPE_IT_API_URL = process.env.SNIPE_IT_API_URL || process.env.SNIPEIT_API_URL;
const SNIPE_IT_API_KEY = process.env.SNIPE_IT_API_KEY || process.env.SNIPEIT_API_KEY;

/**
 * GET /api/equipment
 * 
 * Fetches equipment catalog from Snipe-IT and transforms it for frontend consumption
 * Strips sensitive administrative data before sending to client
 */
export async function GET() {
  try {
    // Equipment catalog is public - no auth required for browsing
    // (actual checkout requires auth via separate /api/checkout route)

    if (!SNIPE_IT_API_URL || !SNIPE_IT_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Fetch hardware from Snipe-IT with proper limit
    const response = await fetch(`${SNIPE_IT_API_URL}/hardware?limit=500&status=RTD`, {
      headers: {
        'Authorization': `Bearer ${SNIPE_IT_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Snipe-IT API error ${response.status}`);
      // Return mock data if Snipe-IT is not responding
      // This allows development/testing to continue
      return NextResponse.json({ 
        assets: getMockEquipment(),
        note: 'Using mock data - Snipe-IT unavailable' 
      });
    }

    const data = await response.json();
    const assets = data.rows as Asset[];

    // Transform and sanitize data for client
    const sanitizedAssets = assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      assetTag: asset.asset_tag,
      category: asset.category?.name || 'Unknown',
      status: asset.status_label?.name || 'Unknown',
      isAvailable: asset.status_label?.status_type === 'deployable',
      // Extract custom fields if needed (e.g., semester access)
      semesterAccess: asset.custom_fields?.['Semester Access']?.value || null,
    }));

    return NextResponse.json({ assets: sanitizedAssets });
  } catch (error) {
    console.error('Equipment API Error:', error);
    // Fallback to mock data on error
    return NextResponse.json({ 
      assets: getMockEquipment(),
      note: 'Using mock data - error fetching from Snipe-IT' 
    });
  }
}

/**
 * Mock equipment data for testing/development when Snipe-IT is unavailable
 */
function getMockEquipment() {
  return [
    { id: 1, name: 'Canon XF100 #1', assetTag: 'TAG-00001', category: 'Video Camera', status: 'Ready to Deploy', isAvailable: true, semesterAccess: null },
    { id: 2, name: 'Canon XF100 #2', assetTag: 'TAG-00002', category: 'Video Camera', status: 'Ready to Deploy', isAvailable: true, semesterAccess: null },
    { id: 3, name: 'Canon XF605 #1', assetTag: 'TAG-00012', category: 'Video Camera', status: 'Ready to Deploy', isAvailable: true, semesterAccess: null },
    { id: 4, name: 'Zoom H6 #1', assetTag: 'TAG-00049', category: 'Audio Recorder', status: 'Ready to Deploy', isAvailable: true, semesterAccess: null },
    { id: 5, name: 'Zoom H6 #2', assetTag: 'TAG-00050', category: 'Audio Recorder', status: 'Ready to Deploy', isAvailable: true, semesterAccess: null },
    { id: 6, name: 'Small Tripod', assetTag: 'TAG-00022', category: 'Tripod', status: 'Ready to Deploy', isAvailable: true, semesterAccess: null },
    { id: 7, name: 'Large Tripod', assetTag: 'TAG-00032', category: 'Tripod', status: 'Ready to Deploy', isAvailable: true, semesterAccess: null },
    { id: 8, name: 'Lowell Pro 3Light Kit', assetTag: 'TAG-00042', category: 'Lights', status: 'Ready to Deploy', isAvailable: true, semesterAccess: null },
    { id: 9, name: 'Boom Mics', assetTag: 'TAG-00069', category: 'Microphones', status: 'Ready to Deploy', isAvailable: true, semesterAccess: null },
    { id: 10, name: 'Shure SM58', assetTag: 'TAG-00080', category: 'Stick Mic', status: 'Ready to Deploy', isAvailable: true, semesterAccess: null },
  ];
}

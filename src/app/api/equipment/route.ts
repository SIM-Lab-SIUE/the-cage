// src/app/api/equipment/route.ts
import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { PrismaClient } from '@prisma/client';
import type { Asset } from '@/lib/snipe-it';

const prisma = new PrismaClient();

// Support both SNIPE_IT_* and SNIPEIT_* env variable names
const SNIPE_IT_API_URL = process.env.SNIPE_IT_API_URL || process.env.SNIPEIT_API_URL;
const SNIPE_IT_API_KEY = process.env.SNIPE_IT_API_KEY || process.env.SNIPEIT_API_KEY;

/**
 * GET /api/equipment
 * 
 * Fetches equipment catalog from Snipe-IT and transforms it for frontend consumption
 * For students: filters by courses they are enrolled in
 * For admins: shows all equipment
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    
    // Get session to determine role and course access
    const session = await auth();
    const userRole = (session?.user as any)?.role || 'student';
    let allowedAssetIds: number[] | null = null;
    
    // For students, filter by enrolled courses
    if (userRole === 'student' && session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          courses: {
            include: {
              course: {
                include: {
                  assets: true
                }
              }
            }
          }
        }
      });
      
      if (user) {
        // Collect all asset IDs from all enrolled courses
        const assetIds = new Set<number>();
        user.courses.forEach(uc => {
          uc.course.assets.forEach(ac => {
            assetIds.add(ac.assetId);
          });
        });
        allowedAssetIds = Array.from(assetIds);
        
        // If student has no courses, show empty catalog
        if (allowedAssetIds.length === 0) {
          return NextResponse.json({ assets: [], rows: [] });
        }
      }
    }

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
    const sanitizedAssets = assets.map((asset) => {
      const rawImage = (asset as any).image || (asset as any).image_url || (asset as any).image_thumb || null;

      let imageUrl: string | null = null;
      if (rawImage && typeof rawImage === 'string') {
        imageUrl = rawImage.startsWith('http')
          ? rawImage
          : `${SNIPE_IT_API_URL?.replace(/\/$/, '')}/${rawImage.replace(/^\//, '')}`;
      } else if (rawImage && typeof rawImage === 'object') {
        const candidate = (rawImage as any).url || (rawImage as any).thumb || (rawImage as any).image || null;
        if (candidate && typeof candidate === 'string') {
          imageUrl = candidate.startsWith('http')
            ? candidate
            : `${SNIPE_IT_API_URL?.replace(/\/$/, '')}/${candidate.replace(/^\//, '')}`;
        }
      }

      return {
        id: asset.id,
        name: asset.name,
        assetTag: asset.asset_tag,
        category: asset.category?.name || 'Unknown',
        status: asset.status_label?.name || 'Unknown',
        isAvailable: asset.status_label?.status_type === 'deployable',
        imageUrl,
        // Extract custom fields if needed (e.g., semester access)
        semesterAccess: asset.custom_fields?.['Semester Access']?.value || null,
      };
    });

    // Apply course-based filtering for students
    let filtered = idParam
      ? sanitizedAssets.filter((a) => a.id === Number(idParam))
      : sanitizedAssets;
    
    if (allowedAssetIds !== null) {
      filtered = filtered.filter(a => allowedAssetIds!.includes(a.id));
    }

    return NextResponse.json({ assets: filtered, rows: filtered });
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

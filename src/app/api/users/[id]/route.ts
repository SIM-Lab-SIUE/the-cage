// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SNIPE_IT_API_URL = process.env.SNIPE_IT_API_URL;
const SNIPE_IT_API_KEY = process.env.SNIPE_IT_API_KEY;

/**
 * GET /api/users/[id]
 * 
 * Fetches user information from both Snipe-IT and local database
 * Requires authentication
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await context.params;

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow users to access their own data, or admins can access others
    // TODO: Add role to session type and check properly
    const isAdmin = false; // Role check disabled until role is added to session
    if (session.user.id !== id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch user from local database
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        reservations: true,
        fines: true,
        courses: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch user from Snipe-IT if snipeItUserId exists
    let snipeItUser = null;
    if (user.snipeItUserId && SNIPE_IT_API_URL && SNIPE_IT_API_KEY) {
      try {
        const response = await fetch(
          `${SNIPE_IT_API_URL}/users/${user.snipeItUserId}`,
          {
            headers: {
              'Authorization': `Bearer ${SNIPE_IT_API_KEY}`,
              'Accept': 'application/json',
            },
          }
        );

        if (response.ok) {
          snipeItUser = await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch Snipe-IT user:', error);
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        snipeItUserId: user.snipeItUserId,
        hasOutstandingBalance: user.hasOutstandingBalance,
        reservationCount: user.reservations.length,
        finesCount: user.fines.length,
        coursesCount: user.courses.length,
      },
      snipeItUser,
    });
  } catch (error) {
    console.error('User API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

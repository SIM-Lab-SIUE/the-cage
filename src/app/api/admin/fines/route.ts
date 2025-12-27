import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/admin/fines
 * 
 * Staff-only endpoint to issue a fine for late return or damage.
 * 
 * Payload: {
 *   userId: string,
 *   reason: "Late Return" | "Damaged Equipment" | other,
 *   amount: number (in dollars)
 * }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    // Verify staff/admin role (check if user email contains 'admin' or has admin flag)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Basic auth check - in production, implement proper role-based access
    const isAdmin = session.user.email?.includes('admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { userId, reason, amount } = await req.json();

    if (!userId || !reason || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, reason, amount' },
        { status: 400 }
      );
    }

    // 1. Create fine record
    const fine = await prisma.fine.create({
      data: {
        userId,
        reason,
        amount,
      },
    });

    // 2. Mark user as having outstanding balance
    await prisma.user.update({
      where: { id: userId },
      data: { hasOutstandingBalance: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Fine of $${amount} issued for ${reason}`,
        fine,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Fine API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/fines?userId=:userId
 * 
 * Retrieve unpaid fines for a user
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    // Verify staff/admin role
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Basic auth check - in production, implement proper role-based access
    const isAdmin = session.user.email?.includes('admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    const fines = await prisma.fine.findMany({
      where: {
        userId,
        isPaid: false,
      },
    });

    const totalOwed = fines.reduce((sum, fine) => sum + fine.amount, 0);

    return NextResponse.json({
      userId,
      fines,
      totalOwed,
    });
  } catch (error) {
    console.error('Fine Lookup Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

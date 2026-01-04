import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { PrismaClient } from '@prisma/client';
import { checkoutAsset } from '@/lib/snipe-it';

const prisma = new PrismaClient();

/**
 * POST /api/checkout
 * 
 * Executes the checkout workflow:
 * 1. Validates the reservation exists and is valid
 * 2. Calls Snipe-IT API to checkout the asset
 * 3. Updates the local reservation status
 * 
 * Payload: { reservationId: string }
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can checkout (staff-only operation)
    const userRole = (session.user as any)?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required for checkout' },
        { status: 403 }
      );
    }

    const { reservationId } = await req.json();

    if (!reservationId) {
      return NextResponse.json(
        { error: 'Missing required field: reservationId' },
        { status: 400 }
      );
    }

    // 1. Fetch the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { user: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    if (reservation.status !== 'CONFIRMED') {
      return NextResponse.json(
        {
          error: 'Invalid reservation status',
          message: `Reservation must be CONFIRMED to checkout. Current status: ${reservation.status}`,
        },
        { status: 400 }
      );
    }

    // Verify the reservation is still within the valid time window
    const now = new Date();
    if (now > reservation.endTime) {
      return NextResponse.json(
        {
          error: 'Reservation expired',
          message: 'This reservation end time has passed.',
        },
        { status: 400 }
      );
    }

    // 2. Call Snipe-IT checkout
    try {
      const snipeResponse = await checkoutAsset(
        reservation.snipeAssetId,
        reservation.user.snipeItUserId
      );

      if (!snipeResponse || snipeResponse.status === 'error') {
        throw new Error(
          `Snipe-IT checkout failed: ${snipeResponse?.messages?.join(' ') || 'Unknown error'}`
        );
      }
    } catch (snipeError) {
      console.error('Snipe-IT Checkout Error:', snipeError);
      return NextResponse.json(
        {
          error: 'Snipe-IT checkout failed',
          message: snipeError instanceof Error ? snipeError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // 3. Sync Shadow Ledger with Snipe-IT checkout
    // Update reservation status to CHECKED_OUT in Shadow Ledger
    // This is the point of synchronization between ephemeral reservation state and actual custody
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CHECKED_OUT' },
    });

    return NextResponse.json({
      success: true,
      message: 'Asset checked out successfully',
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import snipeITClient from '@/services/snipeit';

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
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // 2. Call Snipe-IT checkout
    try {
      const expectedCheckin = reservation.endTime.toISOString().split('T')[0]; // YYYY-MM-DD
      const snipeResponse = await snipeITClient.checkOutAsset(
        reservation.snipeAssetId,
        reservation.user.snipeItUserId,
        expectedCheckin
      );

      if (!snipeResponse || snipeResponse.status === 'error') {
        throw new Error(
          `Snipe-IT checkout failed: ${snipeResponse?.messages || 'Unknown error'}`
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

    // 3. Update local reservation status
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
